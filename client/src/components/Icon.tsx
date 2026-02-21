import type { SVGProps } from "react";

import ActivityIcon from "@icons/activity.svg?react";
import AppsIcon from "@icons/apps.svg?react";
import ClickIcon from "@icons/click.svg?react";
import DiscordIcon from "@icons/discord.svg?react";
import HistoryIcon from "@icons/history.svg?react";
import UserIcon from "@icons/account.svg?react";
import VisibilityIcon from "@icons/visibility.svg?react";
import VisibilityOffIcon from "@icons/visibility-off.svg?react";
import LockIcon from "@icons/lock.svg?react";

interface IconProps extends SVGProps<SVGSVGElement> {
	size?: number | string;
	color?: string;
}

const icons = {
	Activity: ActivityIcon,
	Apps: AppsIcon,
	Click: ClickIcon,
	Discord: DiscordIcon,
	History: HistoryIcon,
	User: UserIcon,
	Visibility: VisibilityIcon,
	VisibilityOff: VisibilityOffIcon,
	Lock: LockIcon,
};

export const Icon = Object.keys(icons).reduce(
	(acc, key) => {
		const SvgComponent = icons[key as keyof typeof icons];

		const IconComponent = ({ size = 24, color = "currentColor", style, ...props }: IconProps) => (
			<SvgComponent width={size} height={size} className="icon" fill={color} style={{ color, ...style }} {...props} />
		);

		IconComponent.displayName = `Icon.${key}`;

		return {
			...acc,
			[key]: IconComponent,
		};
	},
	{} as Record<keyof typeof icons, React.FC<IconProps>>,
);
