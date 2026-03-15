import React from 'react';
import { Avatar, type AvatarProps } from '@mui/material';

interface CRMAvatarProps extends AvatarProps {
	name: string;
	size?: number;
}

const colors = [
	'#ec7211', // AWS Orange
	'#232f3e', // AWS Dark Blue
	'#007eb9', // AWS Blue
	'#1d8102', // AWS Green
	'#d13212', // AWS Red
	'#ff9900', // Amazon Orange
	'#545b64', // AWS Gray
];

const stringToColor = (string: string) => {
	let hash = 0;
	for (let i = 0; i < string.length; i++) {
		hash = string.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % colors.length;
	return colors[index];
};

const getInitials = (name: string) => {
	return name
		.split(' ')
		.map((n) => n[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();
};

const CRMAvatar: React.FC<CRMAvatarProps> = ({ name, size = 40, sx, ...props }) => {
	const color = stringToColor(name);
	
	return (
		<Avatar
			{...props}
			sx={{
				bgcolor: color,
				width: size,
				height: size,
				fontSize: size * 0.4,
				fontWeight: 700,
				borderRadius: '2px', // AWS square style
				...sx
			}}
		>
			{getInitials(name)}
		</Avatar>
	);
};

export default CRMAvatar;
