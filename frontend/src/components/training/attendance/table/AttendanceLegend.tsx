import React from 'react';
import {
	Box,
	Paper,
	Typography,
	Stack
} from '@mui/material';
import {
	InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { TrainingAttendance } from '../../../../models/training';

interface AttendanceLegendProps {
	attendance: TrainingAttendance[];
	selectedDate: Date;
	statuses: Array<{ value: string; label: string; icon: React.ReactNode; color: string }>;
}

const AttendanceLegend: React.FC<AttendanceLegendProps> = ({
	attendance,
	selectedDate,
	statuses
}) => {
	const dateStr = format(selectedDate, 'yyyy-MM-dd');

	const getCount = (statusValue: string) => {
		return attendance.filter(a => a.date === dateStr && a.status === statusValue).length;
	};

	return (
		<Stack spacing={3}>
			<Paper elevation={0} sx={{ p: 3, border: '1px solid #eaeded', borderRadius: '4px' }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#232f3e' }}>ATTENDANCE LEGEND</Typography>
				<Stack spacing={1.5}>
					{statuses.map(s => (
						<Box key={s.value} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ bgcolor: s.color, width: 8, height: 8, borderRadius: '50%' }} />
							<Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>{s.label}</Typography>
							<Typography variant="caption" color="text.secondary">
								{getCount(s.value)}
							</Typography>
						</Box>
					))}
				</Stack>
			</Paper>

			<Paper elevation={0} sx={{ p: 3, border: '1px solid #eaeded', borderRadius: '4px', bgcolor: '#f8f9fa' }}>
				<Stack direction="row" spacing={1} sx={{ mb: 1, color: '#007eb9' }}>
					<InfoIcon fontSize="small" />
					<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>QUICK TIPS</Typography>
				</Stack>
				<Typography variant="caption" color="text.secondary" component="div" sx={{ lineHeight: 1.6 }}>
					• Attendance defaults to <strong>Present</strong> in the system.<br />
					• Marking a day as a <strong>Holiday</strong> removes it from student attendance calculations.<br />
					• You can only mark attendance within the <strong>Batch Duration</strong>.
				</Typography>
			</Paper>
		</Stack>
	);
};

export default AttendanceLegend;
