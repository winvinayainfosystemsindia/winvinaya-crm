import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
	CheckCircle as PresentIcon,
	Cancel as AbsentIcon,
	AccessTime as LateIcon,
	Contrast as HalfDayIcon,
	EventBusy as HolidayIcon,
} from '@mui/icons-material';

export const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
	present: { label: 'P', color: '#007d35', icon: <PresentIcon fontSize="small" /> },
	absent: { label: 'A', color: '#d13212', icon: <AbsentIcon fontSize="small" /> },
	late: { label: 'L', color: '#ff9900', icon: <LateIcon fontSize="small" /> },
	half_day: { label: 'H', color: '#007eb9', icon: <HalfDayIcon fontSize="small" /> },
};

const AttendanceLegendBar: React.FC = () => (
	<Paper variant="outlined" sx={{ mt: 3, p: 2, bgcolor: '#fdfdfd' }}>
		<Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block', color: '#545b64' }}>
			LEGEND
		</Typography>
		<Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
			{Object.entries(STATUS_MAP).map(([val, info]) => (
				<Box key={val} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<Box sx={{ color: info.color, display: 'flex' }}>{info.icon}</Box>
					<Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{val.replace('_', ' ')}</Typography>
				</Box>
			))}
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
				<HolidayIcon sx={{ fontSize: 16, color: '#d32f2f' }} />
				<Typography variant="caption">Holiday</Typography>
			</Box>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
				<Typography variant="caption" sx={{ color: '#aab7b8', fontWeight: 700, border: '1px solid #eaeded', px: 0.5, fontSize: '9px' }}>W/E</Typography>
				<Typography variant="caption">Weekend</Typography>
			</Box>
		</Box>
	</Paper>
);

export default AttendanceLegendBar;
