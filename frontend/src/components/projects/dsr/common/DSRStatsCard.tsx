import React from 'react';
import StatCard from '../../../common/StatCard';
import type { SxProps, Theme } from '@mui/material';

interface DSRStatsCardProps {
	label: string;
	value: string | number;
	unit?: string;
	subtitle?: string;
	icon?: React.ReactNode;
	color?: string;
	sx?: SxProps<Theme>;
}

const DSRStatsCard: React.FC<DSRStatsCardProps> = ({ label, value, unit, subtitle, icon, color, sx }) => {
	return (
		<StatCard
			label={label}
			value={value}
			unit={unit}
			subtitle={subtitle}
			icon={icon}
			color={color}
			sx={sx}
		/>
	);
};


export default DSRStatsCard;

