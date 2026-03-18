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
	const [viewDate, setViewDate] = React.useState(dayjs());

	// Fetch data for the current view
	React.useEffect(() => {
		const start = viewDate.startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
		const end = viewDate.endOf('month').add(7, 'day').format('YYYY-MM-DD');
		dispatch(fetchCalendarEntries({ date_from: start, date_to: end }));
		dispatch(fetchHolidays({ date_from: start, date_to: end }));
	}, [dispatch, viewDate]);

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

		// 1b. Mark company holidays from database
		holidays.forEach(holiday => {
			statusMap[holiday.holiday_date] = 'holiday';
		});

		// 1c. Mark 2nd Saturdays as holidays
		const startOfMonth = viewDate.startOf('month');
		const daysInMonth = viewDate.daysInMonth();
		let saturdayCount = 0;
		for (let i = 1; i <= daysInMonth; i++) {
			const d = startOfMonth.date(i);
			if (d.day() === 6) { // Saturday
				saturdayCount++;
				if (saturdayCount === 2) {
					statusMap[d.format('YYYY-MM-DD')] = 'holiday';
				}
			}
		}

		// 2. Mark entries (overwrites leave if specific DSR exists, showing actual status)
		entries.forEach(entry => {
			let status: any = entry.status;
			if (entry.is_leave) {
				status = 'leave';
			}
			statusMap[entry.report_date] = status;
		});

		// 3. Mark missed dates (last 30 days) and granted permissions
		// Note: We check if the date is in the past relative to NOW
		const today = dayjs();
		for (let i = 1; i <= 60; i++) { // Check a wider range for historical views
			const d = today.subtract(i, 'day');
			const dateStr = d.format('YYYY-MM-DD');

			if (statusMap[dateStr]) continue;

			const hasPermission = permissionRequests.some(req =>
				req.report_date === dateStr && req.status === 'granted'
			);

			if (hasPermission) {
				statusMap[dateStr] = 'granted';
			} else if (d.day() !== 0) { // Not Sunday
				// Also check if it's the 2nd Saturday of its month
				const isSecondSaturday = d.day() === 6 && d.date() >= 8 && d.date() <= 14;
				if (!isSecondSaturday) {
					statusMap[dateStr] = 'missed';
				}
			}
		}

		return statusMap;
	}, [entries, calendarLeaves, permissionRequests, holidays, viewDate]);

	const monthlyHolidays = useMemo(() => {
		const list: { name: string, date: string }[] = [];
		
		// 1. Add DB holidays
		holidays.forEach(h => {
			if (dayjs(h.holiday_date).isSame(viewDate, 'month')) {
				list.push({ name: h.holiday_name, date: h.holiday_date });
			}
		});

		// 2. Add 2nd Saturday
		const startOfMonth = viewDate.startOf('month');
		const daysInMonth = viewDate.daysInMonth();
		let saturdayCount = 0;
		for (let i = 1; i <= daysInMonth; i++) {
			const d = startOfMonth.date(i);
			if (d.day() === 6) {
				saturdayCount++;
				if (saturdayCount === 2) {
					list.push({ name: 'Second Saturday', date: d.format('YYYY-MM-DD') });
				}
			}
		}

		return list.sort((a, b) => a.date.localeCompare(b.date));
	}, [holidays, viewDate]);

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
					value={viewDate}
					onMonthChange={(newMonth) => setViewDate(newMonth)}
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

			<Box sx={{ p: 2, borderTop: '1px solid #f0f0f0', bgcolor: '#ffffff' }}>
				<Typography variant="caption" sx={{ color: '#4a5568', fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
					Holidays for {viewDate.format('MMMM YYYY')}
				</Typography>
				{monthlyHolidays.length > 0 ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
						{monthlyHolidays.map((holiday, idx) => (
							<Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography sx={{ fontSize: '0.75rem', color: '#2d3748', fontWeight: 500 }}>
									{holiday.name}
								</Typography>
								<Typography sx={{ fontSize: '0.7rem', color: '#718096' }}>
									{dayjs(holiday.date).format('DD MMM')}
								</Typography>
							</Box>
						))}
					</Box>
				) : (
					<Typography sx={{ fontSize: '0.75rem', color: '#a0aec0', fontStyle: 'italic' }}>
						No holidays listed for this month.
					</Typography>
				)}
			</Box>

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
							<Typography sx={{ fontSize: '0.75rem', color: '#4a5568', fontWeight: 400 }}>
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
