import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	IconButton,
	Typography,
	Box,
	Alert,
	Fade
} from '@mui/material';
import {
	Close as CloseIcon,
	EventNote as DSRIcon,
	Warning as WarningIcon
} from '@mui/icons-material';
import { useDSRSubmission } from '../hooks/useDSRSubmission';
import SubmissionForm from './SubmissionForm';
import DSRStatsCard from '../common/DSRStatsCard';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import dayjs, { Dayjs } from 'dayjs';

interface DSRSubmissionDialogProps {
	open: boolean;
	onClose: () => void;
	entryId?: string | null;
}

// Custom Day component to show status colors
const StatusDay = (props: PickersDayProps & { dateStatuses: Record<string, string>, day: Dayjs }) => {
	const { day, dateStatuses, selected, ...other } = props;
	const dateStr = day.format('YYYY-MM-DD');
	const status = dateStatuses[dateStr];

	let style = {};
	if (status === 'submitted') {
		style = {
			bgcolor: '#e6f4ea',
			color: '#1e7e34',
			border: '1px solid #34a853',
			'&:hover': { bgcolor: '#d4edda' }
		};
	} else if (status === 'missed') {
		style = {
			bgcolor: '#fce8e6',
			color: '#c5221f',
			border: '1px solid #ea4335',
			'&:hover': { bgcolor: '#f9d2ce' }
		};
	}

	return (
		<PickersDay
			{...other}
			day={day}
			selected={selected}
			sx={{
				...style,
				...(selected ? {
					bgcolor: '#ec7211 !important',
					color: 'white !important',
					border: 'none !important'
				} : {})
			}}
		/>
	);
};

const DSRSubmissionDialog: React.FC<DSRSubmissionDialogProps> = ({ open, onClose, entryId }) => {
	const {
		projects,
		activitiesByProject,
		loading,
		reportDate,
		setReportDate,
		dateStatuses,
		items,
		totalHours,
		submitting,
		permissionError,
		isDateAllowed,
		handleRowChange,
		addRow,
		removeRow,
		handleSaveDraft,
		handleSubmit
	} = useDSRSubmission({
		onSubmitted: onClose,
		externalEntryId: entryId
	});

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<Dialog
				open={open}
				onClose={onClose}
				maxWidth="xl"
				fullWidth
				TransitionComponent={Fade}
				PaperProps={{
					sx: { borderRadius: '2px', minHeight: '80vh' }
				}}
			>
				<DialogTitle sx={{
					bgcolor: '#232f3e',
					color: 'white',
					py: 2,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between'
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<DSRIcon />
						<Box>
							<Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
								{entryId ? 'Edit Daily Status Report' : 'New Daily Status Report'}
							</Typography>
							<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
								Log your work activities and hours
							</Typography>
						</Box>
					</Box>
					<IconButton onClick={onClose} sx={{ color: 'white' }}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent sx={{ p: 4, pt: 3, bgcolor: '#f2f3f3' }}>
					<Box sx={{ mt: 2 }}>
						{permissionError && (
							<Alert
								severity="error"
								variant="outlined"
								icon={<WarningIcon sx={{ color: '#d13212' }} />}
								sx={{
									borderRadius: '2px',
									bgcolor: '#fdf3f1',
									borderColor: '#d13212',
									borderLeft: '5px solid #d13212',
									color: '#232f3e',
									fontWeight: 500
								}}
							>
								{permissionError}
							</Alert>
						)}

						{!isDateAllowed && (
							<Alert
								severity="warning"
								variant="outlined"
								icon={<WarningIcon sx={{ color: '#ec7211' }} />}
								sx={{
									borderRadius: '2px',
									bgcolor: '#fffbf7',
									borderColor: '#ec7211',
									borderLeft: '5px solid #ec7211',
									color: '#232f3e',
									fontWeight: 500
								}}
							>
								You do not have permission to submit for this past date. Please raise a request first.
							</Alert>
						)}
					</Box>

					<Box sx={{ mb: 5, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 3 }}>
						<Box>
							<DatePicker
								label="Reporting Date"
								value={dayjs(reportDate)}
								onChange={(newValue) => setReportDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
								disabled={!!entryId}
								maxDate={dayjs()}
								slots={{
									day: (props) => <StatusDay {...props} dateStatuses={dateStatuses} />
								}}
								slotProps={{
									textField: {
										size: 'small',
										sx: {
											minWidth: 220,
											bgcolor: 'white',
											'& .MuiInputBase-root': { borderRadius: '2px' },
											'& .Mui-disabled': { bgcolor: '#f5f5f5' }
										}
									}
								}}
							/>
						</Box>

						<DSRStatsCard
							sx={{ mt: 2 }}
							label="Total Hours"
							value={totalHours.toFixed(2)}
							color={totalHours > 8 ? '#1d8102' : '#232f3e'}
						/>
					</Box>

					<Box sx={{ bgcolor: 'white', p: 2, borderRadius: '4px', border: '1px solid #d5dbdb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
						<SubmissionForm
							items={items}
							projects={projects}
							activitiesByProject={activitiesByProject}
							loading={loading}
							onRowChange={handleRowChange}
							onAddRow={addRow}
							onRemoveRow={removeRow}
							showTitle={false}
						/>
					</Box>
				</DialogContent>

				<DialogActions sx={{ p: 3, borderTop: '1px solid #d5dbdb', bgcolor: 'white' }}>
					<Button onClick={onClose} sx={{ color: '#545b64', textTransform: 'none', fontWeight: 700 }}>
						Cancel
					</Button>
					<Box sx={{ flexGrow: 1 }} />
					<Button
						variant="outlined"
						onClick={handleSaveDraft}
						disabled={submitting || !isDateAllowed}
						sx={{
							color: '#232f3e',
							borderColor: '#d5dbdb',
							px: 4,
							textTransform: 'none',
							fontWeight: 700,
							'&:hover': { borderColor: '#aab7bd', bgcolor: '#f3f3f3' }
						}}
					>
						Save as Draft
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmit}
						disabled={submitting || !isDateAllowed}
						sx={{
							bgcolor: '#ec7211',
							'&:hover': { bgcolor: '#eb5f07' },
							px: 4,
							textTransform: 'none',
							fontWeight: 700
						}}
					>
						Submit Report
					</Button>
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
};

export default DSRSubmissionDialog;
