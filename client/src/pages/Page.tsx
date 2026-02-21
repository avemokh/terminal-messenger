/* import {
	useCreateUserMutation,
	useDeleteUserMutation,
	useGetAllUsersQuery,
	useGetUserByIdQuery,
	useLazyGetUserByIdQuery,
	useUpdateUserMutation,
} from "@/services/api"; */
import Button from "@/components/Button";
import Flex from "@/components/Flex";
import { Icon } from "@/components/Icon";
import Input from "@/components/Input";
import { useActions } from "@/hooks/useActions";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useInput } from "@/hooks/useInput";
import { palette } from "@/style/colorPalette";
import { /* useEffect, useState, */ type FC } from "react";

const Page: FC = () => {
	/* getAllUsers usage */
	/* const { data } = useGetAllUsersQuery();
	console.log(data);
	return <>Example page</>; */
	/* getUserById usage */
	/* const [id, setId] = useState<number>(0);
	const [trigger] = useLazyGetUserByIdQuery();
	const getUserByIdHandler = async (id: number) => {
		const response = await trigger({ id }).unwrap();
		console.log(response);
	};
	return (
		<div>
			<input type="number" onChange={(event: React.ChangeEvent<HTMLInputElement>) => setId(+event.target.value)} value={id} />
			<button onClick={() => getUserByIdHandler(id)}>get user</button>
		</div>
	); */
	/* createUserMutation usage */
	/* const [createUser] = useCreateUserMutation();
	const createUserHandler = async () => {
		const data = await createUser({ name: "Tengeki", email: "jaegorkillaberia@icloud.com" })
			.unwrap();

		console.log(data);
	};
	return (
		<div>
			<button onClick={createUserHandler}>create user</button>
		</div>
	); */
	/* useUpdateUserMutation usage */
	/* const [name, setName] = useState<string>("");
	const [updateUser] = useUpdateUserMutation();
	const updateUserHandler = async () => {
		const data = await updateUser({ id: 5, dto: { name } }).unwrap();

		console.log(data);
	};
	return (
		<div>
			<input type="text" value={name} onChange={(event) => setName(event.target.value)} />
			<button onClick={updateUserHandler}>update user</button>
		</div>
	); */
	/* useDeleteUserMutation usage */
	/* const [id, setId] = useState<number>(0);
	const [deleteUser] = useDeleteUserMutation();
	const deleteUserHandler = async () => {
		const data = await deleteUser({id}).unwrap();
		console.log(data);
	}
	return (
		<div>
			<input type="number" value={id} onChange={(event) => setId(+event.target.value)} />
			<button onClick={deleteUserHandler}>delete user</button>
		</div>
		) */
	const { setModalVisibility } = useActions();

	return (
		<Flex>
			<Button onClick={() => setModalVisibility({ name: "auth", isVisible: true })} variant="common" icon={<Icon.Discord />}>
				Discord
			</Button>
		</Flex>
	);
};

export default Page;
