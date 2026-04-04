import React, { useEffect, useMemo, useState } from 'react';
import {
	Box,
	Typography,
	Tooltip,
	useMediaQuery,
	Divider,
	List,
	ListItem,
	CircularProgress
} from '@mui/material';
import {
	EventAvailable as HolidayIcon,
	ErrorOutline as MissingIcon,
	InfoOutlined as InfoIcon
} from '@mui/icons-material';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { fetchHolidays } from '../../../../store/slices/holidaySlice';
import { type CompanyHoliday } from '../../../../services/holidayService';
import { DSRStatusValues } from '../../../../models/dsr';

const STATUS_THEME = {
	[DSRStatusValues.APPROVED]: { bg: '#f1f8e9', color: '#2e7d32', border: '#a5d6a7', label: 'Approved' },
	[DSRStatusValues.SUBMITTED]: { bg: '#e0f2f1', color: '#00796b', border: '#b2dfdb', label: 'Submitted' },
	[DSRStatusValues.REJECTED]: { bg: '#ffebee', color: '#c62828', border: '#ef9a9a', label: 'Revoked (Action Needed)' },
	[DSRStatusValues.DRAFT]: { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: 'In Draft' },
	leave: { bg: '#f3e5f5', color: '#7b1fa2', border: '#e1bee7', label: 'Approved Leave' },
	holiday: { bg: '#fffde7', color: '#fbc02d', border: '#fff9c4', label: 'Holiday / Sunday' },
	missing: { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0', label: 'Not Submitted' }
};

const StatusDay = (props: any) => {
	const { dateStatuses, day, outsideCurrentMonth, selected, ...other } = props;
	const dateStr = day.format('YYYY-MM-DD');
	const status = dateStatuses[dateStr];
	const theme = STATUS_THEME[status as keyof typeof STATUS_THEME];

	if (outsideCurrentMonth) {
		return <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />;
	}

	return (
		<Tooltip title={theme?.label || ''} arrow disableHoverListener={!status}>
			<PickersDay
				{...other}
				day={day}
				selected={selected}
				sx={{
					transition: 'all 0.2s ease',
					fontWeight: 600,
					fontSize: '0.75rem',
					...(status && !selected ? {
						bgcolor: `${theme.bg} !important`,
						color: `${theme.color} !important`,
						border: `1px solid ${theme.border}`,
						zIndex: 1,
						'&:hover': { bgcolor: theme.bg, opacity: 0.9 }
					} : {}),
					...(selected ? {
						bgcolor: '#ec7211 !important',
						color: '#fff !important',
						border: 'none',
						boxShadow: '0 2px 5px rgba(236,114,17,0.4)',
						zIndex: 2
					} : {})
				}}
			/>
		</Tooltip>
	);
};

const LegendItem = ({ color, label, border }: { color: string; label: string; border: string }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
		<Box sx={{
			width: 12,
			height: 12,
			bgcolor: color,
			borderRadius: '50%',
			border: `2px solid ${border}`,
			flexShrink: 0
		}} />
		<Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>{label}</Typography>
	</Box>
);

const DSRCalendarView: React.FC = () => {
	const dispatch = useAppDispatch();
	const { calendarEntries, calendarLeaves } = useAppSelector((state) => state.dsr);
	const { holidays, loading: holidaysLoading } = useAppSelector((state) => state.holidays);
	const [viewDate, setViewDate] = useState(dayjs());
	const isVerySmall = useMediaQuery('(max-width:320px)');

	useEffect(() => {
		const start = viewDate.startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
		const end = viewDate.endOf('month').add(7, 'day').format('YYYY-MM-DD');
		dispatch(fetchHolidays({ date_from: start, date_to: end, limit: 100 }));
	}, [dispatch, viewDate]);

	const dateStatuses = useMemo(() => {
		const statuses: Record<string, string> = {};
		const today = dayjs().format('YYYY-MM-DD');

		// 1. Mark Sundays and Company Holidays (Lowest priority)
		let current = viewDate.startOf('month').subtract(7, 'day');
		const end = viewDate.endOf('month').add(7, 'day');
		while (current.isBefore(end)) {
			const d = current.format('YYYY-MM-DD');
			if (current.day() === 0) statuses[d] = 'holiday';

			// 2. Default missing status for past workdays
			if (current.isBefore(dayjs(today)) && current.day() !== 0) {
				statuses[d] = 'missing';
			}
			current = current.add(1, 'day');
		}

		// Overlay company holidays with strict normalization
		holidays.forEach((h: CompanyHoliday) => {
			statuses[dayjs(h.holiday_date).format('YYYY-MM-DD')] = 'holiday';
		});

		// 3. User Leaves
		calendarLeaves.forEach(l => {
			if (l.status === 'approved') {
				statuses[dayjs(l.date).format('YYYY-MM-DD')] = 'leave';
			}
		});

		// 4. DSR Entries (Highest priority)
		calendarEntries.forEach((entry: any) => {
			const d = dayjs(entry.report_date || entry.date).format('YYYY-MM-DD');

			// SMART DETECTION: A "Revoked" entry is technically a DRAFT that has ADMIN_NOTES.
			// It requires action from the user to fix and resubmit.
			const isRevoked = entry.status === DSRStatusValues.DRAFT && !!entry.admin_notes;

			if (isRevoked) {
				statuses[d] = DSRStatusValues.REJECTED; // Maps to Red "Revoked" theme
			} else {
				statuses[d] = entry.status;
			}
		});

		return statuses;
	}, [calendarEntries, calendarLeaves, holidays, viewDate]);

	const monthHolidays = useMemo(() => {
		// Filter for active month
		const filtered = holidays.filter((h: CompanyHoliday) => dayjs(h.holiday_date).month() === viewDate.month());
		// Sort by date
		return [...filtered].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));
	}, [holidays, viewDate]);

	return (
		<Box sx={{
			bgcolor: 'white',
			borderRadius: '4px',
			border: '1px solid #d5dbdb',
			boxShadow: '0 1px 1px 0 rgba(0,0,0,0.05)',
			overflow: 'hidden',
			width: '100%'
		}}>
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<Box sx={{
					width: '100%',
					display: 'flex',
					justifyContent: 'center',
					bgcolor: '#ffffff',
					overflow: 'hidden',
					py: 1
				}}>
					<Box sx={{
						width: '100%',
						maxWidth: '320px',
						transform: isVerySmall ? 'scale(0.92)' : 'none',
						transformOrigin: 'center top'
					}}>
						<StaticDatePicker
							displayStaticWrapperAs="desktop"
							value={viewDate}
							onMonthChange={(newMonth) => setViewDate(newMonth)}
							readOnly
							slots={{
								day: (props: any) => <StatusDay {...props} dateStatuses={dateStatuses} />
							}}
							slotProps={{
								actionBar: { actions: [], sx: { display: 'none' } },
								toolbar: { hidden: true }
							}}
							sx={{
								'& .MuiPickerStaticWrapper-content': { bgcolor: 'transparent', minWidth: 'unset', width: '100%' },
								'& .MuiDateCalendar-root': { width: '100%', maxWidth: '100%', height: 'auto', p: 0, minWidth: 'unset' },
								'& .MuiDayCalendar-header': { justifyContent: 'space-around', gap: 0, px: 0 },
								'& .MuiDayCalendar-weekContainer': { justifyContent: 'space-around', gap: 0, my: '2px', px: 0 },
								'& .MuiDayCalendar-weekDayLabel': {
									fontWeight: 600,
									fontSize: '0.65rem',
									color: '#94a3b8',
									width: '36px',
									flex: 1,
									textTransform: 'uppercase'
								},
								'& .MuiPickersCalendarHeader-root': { mt: 0.5, mb: 0.5, px: 1.5, borderBottom: '1px solid #f1f5f9', pb: 0.5 },
								'& .MuiPickersCalendarHeader-label': { fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' },
								'& .MuiPickersCalendarHeader-switchViewButton': { display: 'none' }
							}}
						/>
					</Box>
				</Box>
			</LocalizationProvider>

			<Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#f8fafc' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
					<InfoIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
					<Typography variant="caption" sx={{ fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						Status Indicators
					</Typography>
				</Box>

				<Box sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr 1fr',
						sm: '1fr 1fr 1fr',
						md: '1fr 1fr 1fr',
						lg: '1fr 1fr 1fr 1fr',
						xl: '1fr 1fr 1fr 1fr'
					},
					columnGap: 2,
					rowGap: 1.5
				}}>
					<LegendItem color={STATUS_THEME[DSRStatusValues.APPROVED].bg} border={STATUS_THEME[DSRStatusValues.APPROVED].border} label="Approved" />
					<LegendItem color={STATUS_THEME[DSRStatusValues.SUBMITTED].bg} border={STATUS_THEME[DSRStatusValues.SUBMITTED].border} label="Submitted" />
					<LegendItem color={STATUS_THEME[DSRStatusValues.REJECTED].bg} border={STATUS_THEME[DSRStatusValues.REJECTED].border} label="Revoked" />
					<LegendItem color={STATUS_THEME[DSRStatusValues.DRAFT].bg} border={STATUS_THEME[DSRStatusValues.DRAFT].border} label="Draft" />
					<LegendItem color={STATUS_THEME.leave.bg} border={STATUS_THEME.leave.border} label="Leave" />
					<LegendItem color={STATUS_THEME.holiday.bg} border={STATUS_THEME.holiday.border} label="Holiday" />
					<LegendItem color={STATUS_THEME.missing.bg} border={STATUS_THEME.missing.border} label="Missing" />
				</Box>
			</Box>

			<Divider sx={{ borderStyle: 'dashed' }} />
			<Box sx={{ p: 2, bgcolor: '#ffffff' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
					<HolidayIcon sx={{ fontSize: 16, color: '#0097a7' }} />
					<Typography variant="caption" sx={{ fontWeight: 600, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
						Holidays this Month
					</Typography>
					{holidaysLoading && <CircularProgress size={12} sx={{ ml: 'auto', color: '#0097a7' }} />}
				</Box>

				{monthHolidays.length === 0 ? (
					<Typography variant="caption" sx={{ color: '#94a3b8', fontStyle: 'italic', px: 1, display: 'block' }}>
						No public holidays this month.
					</Typography>
				) : (
					<List disablePadding>
						{monthHolidays.map((h, i) => (
							<ListItem
								key={i}
								disablePadding
								sx={{
									py: 0.75,
									px: 1.25,
									mb: 0.5,
									borderRadius: '4px',
									bgcolor: '#f8fafc',
									border: '1px solid #f1f5f9',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}
							>
								<Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', minWidth: '50px' }}>
									{dayjs(h.holiday_date).format('DD MMM')}
								</Typography>
								<Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textAlign: 'right' }}>
									{h.holiday_name}
								</Typography>
							</ListItem>
						))}
					</List>
				)}

				<Box sx={{ mt: 2, p: 1, borderRadius: '4px', bgcolor: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: 1 }}>
					<MissingIcon sx={{ fontSize: 14, color: '#64748b' }} />
					<Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, fontSize: '0.65rem' }}>
						Missing indicators mark past workdays with no submissions.
					</Typography>
				</Box>
			</Box>
		</Box>
	);
};

export default DSRCalendarView;
