import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import StatusDay from '../forms/StatusDay';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { fetchCalendarEntries } from '../../../../store/slices/dsrSlice';
import { fetchHolidays } from '../../../../store/slices/holidaySlice';

const DSRCalendarView: React.FC = () => {
	const dispatch = useAppDispatch();
	const { calendarEntries: entries, calendarLeaves, permissionRequests } = useAppSelector((state) => state.dsr);
	const { holidays } = useAppSelector((state) => state.holidays);

	// Fetch data for the current view
	React.useEffect(() => {
		const start = dayjs().startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
		const end = dayjs().endOf('month').add(7, 'day').format('YYYY-MM-DD');
		dispatch(fetchCalendarEntries({ date_from: start, date_to: end }));
		dispatch(fetchHolidays({ date_from: start, date_to: end }));
	}, [dispatch]);

	const dateStatuses = useMemo(() => {
		const statusMap: Record<string, string> = {};

		// 1. Mark leave applications from separate table
		calendarLeaves.forEach(leave => {
			let curr = dayjs(leave.start_date);
			const end = dayjs(leave.end_date);
			
			while (curr.isBefore(end) || curr.isSame(end, 'day')) {
				statusMap[curr.format('YYYY-MM-DD')] = 'leave';
				curr = curr.add(1, 'day');
			}
		});

		// 1b. Mark company holidays
		holidays.forEach(holiday => {
			statusMap[holiday.holiday_date] = 'holiday';
		});

		// 2. Mark entries (overwrites leave if specific DSR exists, showing actual status)
		entries.forEach(entry => {
			let status: any = entry.status;
			if (entry.is_leave) {
				status = 'leave';
			}
			statusMap[entry.report_date] = status;
		});

		// 3. Mark missed dates (last 30 days) and granted permissions
		for (let i = 1; i <= 30; i++) {
			const d = dayjs().subtract(i, 'day');
			const dateStr = d.format('YYYY-MM-DD');

			if (statusMap[dateStr]) continue;

			const hasPermission = permissionRequests.some(req =>
				req.report_date === dateStr && req.status === 'granted'
			);

			if (hasPermission) {
				statusMap[dateStr] = 'granted';
			} else if (d.day() !== 0) { // Not Sunday
				statusMap[dateStr] = 'missed';
			}
		}

		return statusMap;
	}, [entries, calendarLeaves, permissionRequests, holidays]);

	return (
		<Paper variant="outlined" sx={{ p: 0, borderRadius: '8px', bgcolor: 'white', height: '100%', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
			<Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', bgcolor: '#ffffff' }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a202c', letterSpacing: '-0.01em' }}>
					DSR Status Overview
				</Typography>
			</Box>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<StaticDatePicker
					displayStaticWrapperAs="desktop"
					value={dayjs()}
					readOnly
					slots={{
						day: (props) => {
							const isSunday = props.day.day() === 0;
							const dateStr = props.day.format('YYYY-MM-DD');
							const hasStatus = !!dateStatuses[dateStr];

							const effectiveStatuses = { ...dateStatuses };
							if (isSunday && !hasStatus) {
								effectiveStatuses[dateStr] = 'holiday';
							}

							return <StatusDay {...props} dateStatuses={effectiveStatuses} />;
						}
					}}
					slotProps={{
						actionBar: {
							actions: [],
							sx: { display: 'none' }
						},
						toolbar: { hidden: true }
					}}
					sx={{
						'& .MuiPickerStaticWrapper-content': { bgcolor: 'transparent' },
						'& .MuiDateCalendar-root': { width: '100%', height: 'auto', p: 0 },
						'& .MuiDayCalendar-header': { justifyContent: 'space-around', gap: 0 },
						'& .MuiDayCalendar-weekContainer': { justifyContent: 'space-around', gap: 0, my: '2px' },
						'& .MuiDayCalendar-weekDayLabel': { fontWeight: 700, fontSize: '0.75rem', color: '#718096' },
						'& .MuiPickersCalendarHeader-root': { mt: 1, mb: 1, px: 2 },
						'& .MuiPickersCalendarHeader-label': { fontWeight: 700, fontSize: '0.9rem' }
					}}
				/>
			</LocalizationProvider>

			<Box sx={{ p: 2.5, borderTop: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
				<Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 600, display: 'block', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Status Legend
				</Typography>
				<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
					{[
						{ label: 'Worked', dot: '#a5d6a7' },
						{ label: 'Leave', dot: '#ffcc80' },
						{ label: 'Holidays', dot: '#e0e0e0' },
						{ label: 'Pending', dot: '#fff59d' },
						{ label: 'Missed', dot: '#ffcdd2' },
						{ label: 'Granted', dot: '#90caf9' }
					].map((item) => (
						<Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
							<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.dot, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }} />
							<Typography sx={{ fontSize: '0.3rem', color: '#4a5568', fontWeight: 400 }}>
								{item.label}
							</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Paper>
	);
};

export default DSRCalendarView;
