const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const geoip = require("geoip-lite");

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change_me_please";
const INVITE_CODE = process.env.INVITE_CODE || "S@V0JzW$Iv*ioa5G";

const app = express();

// IMPORTANT: so req.ip works behind nginx (x-forwarded-for)
app.set("trust proxy", true);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = new Database(path.join(__dirname, "db.sqlite"));
db.pragma("journal_mode = WAL");

// ===== helpers =====
function now() { return Date.now(); }

function ts() {
  // YYYY-MM-DD HH:mm:ss (UTC)
  const d = new Date();
  const s = d.toISOString().replace("T", " ").slice(0, 19);
  return s;
}

function getCountryByIp(ip) {
  try {
    const clean = String(ip || "").split(",")[0].trim(); // if "a, b, c"
    const g = geoip.lookup(clean);
    return g?.country || "??";
  } catch {
    return "??";
  }
}

function getIpFromReq(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  // req.ip учитывает trust proxy
  return req.ip || req.socket?.remoteAddress || "";
}

function getIpFromSocket(socket) {
  const xf = socket.handshake.headers?.["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return socket.handshake.address || socket.conn?.remoteAddress || "";
}

function logLine(action, details, ip) {
  const country = getCountryByIp(ip);
  // FORMAT: Time | Action | Details | IP | Country
  console.log(`${ts()} | ${action} | ${details} | ${ip || "?"} | ${country}`);
}

function normalizeUsername(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 24);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function issueToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "30d" });
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(m[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// ===== schema (DM only) =====
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  passhash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS dm_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS dm_thread_users (
  thread_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS dm_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL,
  from_user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  ts INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dm_messages_thread_ts ON dm_messages(thread_id, ts);
`);

// ===== db prepared =====
const qGetUserByUsername = db.prepare(`SELECT * FROM users WHERE username = ?`);
const qGetUserById = db.prepare(`SELECT id, username FROM users WHERE id = ?`);
const qCreateUser = db.prepare(`INSERT INTO users (username, passhash, created_at) VALUES (?, ?, ?)`);

function getOrCreateThread(userAId, userBId) {
  const a = Math.min(userAId, userBId);
  const b = Math.max(userAId, userBId);

  const found = db.prepare(`SELECT * FROM dm_threads WHERE user1_id = ? AND user2_id = ?`).get(a, b);
  if (found) {
    db.prepare(`INSERT OR IGNORE INTO dm_thread_users(thread_id, user_id, hidden) VALUES (?, ?, 0)`).run(found.id, a);
    db.prepare(`INSERT OR IGNORE INTO dm_thread_users(thread_id, user_id, hidden) VALUES (?, ?, 0)`).run(found.id, b);
    return found;
  }

  const createdAt = now();
  const info = db.prepare(`INSERT INTO dm_threads(user1_id, user2_id, created_at) VALUES (?, ?, ?)`).run(a, b, createdAt);
  const threadId = info.lastInsertRowid;

  db.prepare(`INSERT INTO dm_thread_users(thread_id, user_id, hidden) VALUES (?, ?, 0)`).run(threadId, a);
  db.prepare(`INSERT INTO dm_thread_users(thread_id, user_id, hidden) VALUES (?, ?, 0)`).run(threadId, b);

  return { id: threadId, user1_id: a, user2_id: b, created_at: createdAt };
}

function ensureVisible(threadId, userId) {
  db.prepare(`UPDATE dm_thread_users SET hidden = 0 WHERE thread_id = ? AND user_id = ?`).run(threadId, userId);
}

// ===== HTTP API =====
app.post("/api/register", (req, res) => {
  const ip = getIpFromReq(req);

  const username = normalizeUsername(req.body?.username);
  const password = String(req.body?.password || "");
  const invite = String(req.body?.invite || "");

  if (invite !== INVITE_CODE) {
    logLine("AUTH:REGISTER", `DENIED user=${username || "?"} reason=invalid_invite`, ip);
    return res.status(403).json({ error: "STATUS: DENIED" });
  }

  if (username.length < 3) {
    logLine("AUTH:REGISTER", `FAIL user=${username || "?"} reason=bad_username`, ip);
    return res.status(400).json({ error: "Username must be 3-24 chars (a-z, 0-9, _,-)" });
  }
  if (password.length < 4) {
    logLine("AUTH:REGISTER", `FAIL user=${username} reason=bad_password_len`, ip);
    return res.status(400).json({ error: "Password must be at least 4 chars" });
  }

  const exists = qGetUserByUsername.get(username);
  if (exists) {
    logLine("AUTH:REGISTER", `FAIL user=${username} reason=already_taken`, ip);
    return res.status(409).json({ error: "Username already taken" });
  }

  const passhash = hashPassword(password);
  const created_at = now();
  const info = qCreateUser.run(username, passhash, created_at);

  const user = { id: info.lastInsertRowid, username };
  const token = issueToken(user);

  logLine("AUTH:REGISTER", `OK user=${username} id=${user.id}`, ip);
  res.json({ user, token });
});

app.post("/api/login", (req, res) => {
  const ip = getIpFromReq(req);

  const username = normalizeUsername(req.body?.username);
  const password = String(req.body?.password || "");

  const user = qGetUserByUsername.get(username);
  if (!user) {
    logLine("AUTH:LOGIN", `FAIL user=${username || "?"} reason=not_found`, ip);
    return res.status(401).json({ error: "Invalid username or password" });
  }
  if (!verifyPassword(password, user.passhash)) {
    logLine("AUTH:LOGIN", `FAIL user=${username} id=${user.id} reason=bad_password`, ip);
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = issueToken(user);
  logLine("AUTH:LOGIN", `OK user=${username} id=${user.id}`, ip);
  res.json({ user: { id: user.id, username: user.username }, token });
});

app.get("/api/dialogs", authMiddleware, (req, res) => {
  const myId = Number(req.user.sub);

  const rows = db.prepare(`
    SELECT
      t.id AS threadId,
      CASE WHEN t.user1_id = ? THEN u2.username ELSE u1.username END AS withUser,
      m.text AS lastText,
      m.ts AS lastTs
    FROM dm_threads t
    JOIN dm_thread_users tu ON tu.thread_id = t.id AND tu.user_id = ? AND tu.hidden = 0
    JOIN users u1 ON u1.id = t.user1_id
    JOIN users u2 ON u2.id = t.user2_id
    LEFT JOIN dm_messages m ON m.id = (
      SELECT id FROM dm_messages WHERE thread_id = t.id ORDER BY ts DESC LIMIT 1
    )
    ORDER BY COALESCE(m.ts, t.created_at) DESC
  `).all(myId, myId);

  const dialogs = rows.map(r => ({
    id: `dm:${r.withUser}`,
    type: "dm",
    title: r.withUser,
    with: r.withUser,
    lastText: r.lastText || "",
    lastTs: r.lastTs || null
  }));

  res.json({ dialogs });
});

app.post("/api/dm/start", authMiddleware, (req, res) => {
  const myId = Number(req.user.sub);
  const target = normalizeUsername(req.body?.username);
  if (!target) return res.status(400).json({ error: "Username required" });

  const other = qGetUserByUsername.get(target);
  if (!other) return res.status(404).json({ error: "User not found" });
  if (other.id === myId) return res.status(400).json({ error: "You cannot DM yourself" });

  const thread = getOrCreateThread(myId, other.id);
  ensureVisible(thread.id, myId);

  res.json({ ok: true, with: other.username, threadId: thread.id, room: `dm_${thread.id}` });
});

app.post("/api/dm/delete", authMiddleware, (req, res) => {
  const myId = Number(req.user.sub);
  const target = normalizeUsername(req.body?.username);
  if (!target) return res.status(400).json({ error: "Username required" });

  const other = qGetUserByUsername.get(target);
  if (!other) return res.status(404).json({ error: "User not found" });

  const a = Math.min(myId, other.id);
  const b = Math.max(myId, other.id);

  const thread = db.prepare(`SELECT * FROM dm_threads WHERE user1_id = ? AND user2_id = ?`).get(a, b);
  if (!thread) return res.json({ ok: true });

  db.prepare(`UPDATE dm_thread_users SET hidden = 1 WHERE thread_id = ? AND user_id = ?`).run(thread.id, myId);
  res.json({ ok: true });
});

// ===== Socket.IO =====
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Presence storage
const onlineById = new Map(); // userId -> count of active sockets
const typingByRoom = new Map(); // room -> Set(username)

function emitPresence() {
  const users = [];
  for (const [id, count] of onlineById.entries()) {
    if (count > 0) {
      const u = qGetUserById.get(id);
      if (u?.username) users.push(u.username);
    }
  }
  io.emit("presence:online", { users });
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = { id: Number(payload.sub), username: payload.username };
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const me = socket.user;
  const ip = getIpFromSocket(socket);

  // personal room (for DM notifications)
  socket.join(`user:${me.id}`);

  // presence ++
  onlineById.set(me.id, (onlineById.get(me.id) || 0) + 1);
  emitPresence();

  logLine("PRESENCE", `ONLINE user=${me.username} id=${me.id}`, ip);

  socket.on("disconnect", () => {
    // presence --
    const cur = (onlineById.get(me.id) || 0) - 1;
    if (cur <= 0) onlineById.delete(me.id);
    else onlineById.set(me.id, cur);
    emitPresence();

    logLine("PRESENCE", `OFFLINE user=${me.username} id=${me.id}`, ip);

    // remove from typing sets
    for (const [room, set] of typingByRoom.entries()) {
      if (set.delete(me.username)) {
        io.to(room).emit("typing:update", { room, users: [...set] });
      }
      if (set.size === 0) typingByRoom.delete(room);
    }
  });

  function openDmWith(username) {
    const other = qGetUserByUsername.get(normalizeUsername(username));
    if (!other) {
      socket.emit("dm:error", { message: "User not found" });
      return;
    }
    if (other.id === me.id) {
      socket.emit("dm:error", { message: "You cannot DM yourself" });
      return;
    }

    const thread = getOrCreateThread(me.id, other.id);
    ensureVisible(thread.id, me.id);

    const room = `dm_${thread.id}`;
    socket.join(room);

    const items = db.prepare(`
      SELECT m.ts, m.text, u.username AS username
      FROM dm_messages m
      JOIN users u ON u.id = m.from_user_id
      WHERE m.thread_id = ?
      ORDER BY m.ts ASC
      LIMIT 200
    `).all(thread.id).map(r => ({
      room,
      username: r.username,
      text: r.text,
      ts: r.ts
    }));

    socket.emit("dm:opened", { with: other.username, room });
    socket.emit("chat:history", { room, mode: "dm", items });
  }

  socket.on("dm:open", (username) => openDmWith(username));

  socket.on("dm:leave_all", () => {
    for (const r of socket.rooms) {
      if (String(r).startsWith("dm_")) socket.leave(r);
    }
  });

  // typing relay
  socket.on("typing:set", ({ room, isTyping }) => {
    const r = String(room || "");
    if (!r.startsWith("dm_")) return;

    let set = typingByRoom.get(r);
    if (!set) { set = new Set(); typingByRoom.set(r, set); }

    if (isTyping) set.add(me.username);
    else set.delete(me.username);

    io.to(r).emit("typing:update", { room: r, users: [...set] });
  });

  // send message (DM only)
  socket.on("chat:message", (payload) => {
    const text = String(payload?.text || "").trim();
    if (!text) return;

    // active dm room
    const dmRoom = [...socket.rooms].find(x => String(x).startsWith("dm_"));
    if (!dmRoom) {
      socket.emit("chat:error", { message: "Open a DM first" });
      return;
    }

    const threadId = Number(String(dmRoom).slice(3));
    if (!threadId) return;

    const thread = db.prepare(`SELECT * FROM dm_threads WHERE id = ?`).get(threadId);
    if (!thread) return;

    const isParticipant = (thread.user1_id === me.id || thread.user2_id === me.id);
    if (!isParticipant) return;

    const otherId = (thread.user1_id === me.id) ? thread.user2_id : thread.user1_id;
    const otherUser = qGetUserById.get(otherId);

    // ensure chat becomes visible for both
    ensureVisible(threadId, me.id);
    ensureVisible(threadId, otherId);

    const tsNow = now();
    db.prepare(`INSERT INTO dm_messages(thread_id, from_user_id, text, ts) VALUES (?, ?, ?, ?)`)
      .run(threadId, me.id, text, tsNow);

    const msg = { room: `dm_${threadId}`, username: me.username, text, ts: tsNow };

    io.to(`dm_${threadId}`).emit("chat:message", msg);

    io.to(`user:${me.id}`).emit("dialogs:changed", { reason: "outgoing" });
    io.to(`user:${otherId}`).emit("dialogs:changed", { reason: "incoming", from: me.username });
    io.to(`user:${otherId}`).emit("dm:incoming", { from: me.username });

    // LOG MESSAGE (no text, only meta)
    const toPart = otherUser?.username
      ? `(ID ${otherUser.id} | ${otherUser.username})`
      : `(ID ${otherId} | ?)`;

    logLine(
      "MESSAGE",
      `FROM (ID ${me.id} | ${me.username}) TO ${toPart} thread=${threadId} len=${text.length}`,
      ip
    );
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`${ts()} | SYSTEM | server_started port=${PORT} | - | -`);
  console.log(`${ts()} | SYSTEM | invite_gate=enabled codeLen=${String(INVITE_CODE).length} | - | -`);
});

