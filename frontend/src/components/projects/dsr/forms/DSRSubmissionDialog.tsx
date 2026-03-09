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
	Fade,
	CircularProgress
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
	readOnly?: boolean;
}

// Custom Day component to show status colors
const StatusDay = (props: PickersDayProps & { dateStatuses: Record<string, string>, day: Dayjs }) => {
	const { day, dateStatuses, selected, ...other } = props;
	const dateStr = day.format('YYYY-MM-DD');
	const status = dateStatuses[dateStr];

	let style = {};
	if (status === 'approved') {
		style = {
			bgcolor: '#e6f4ea',
			color: '#1e7e34',
			border: '1px solid #34a853',
			'&:hover': { bgcolor: '#d4edda' }
		};
	} else if (status === 'submitted') {
		style = {
			bgcolor: '#fef7e0',
			color: '#b06000',
			border: '1px solid #fbbc04',
			'&:hover': { bgcolor: '#feefc3' }
		};
	} else if (status === 'rejected') {
		style = {
			bgcolor: '#fde7e9',
			color: '#c5221f',
			border: '1px solid #d93025',
			'&:hover': { bgcolor: '#fce8e6' }
		};
	} else if (status === 'draft') {
		style = {
			bgcolor: '#f8f9fa',
			color: '#5f6368',
			border: '1px dashed #dadce0',
			'&:hover': { bgcolor: '#f1f3f4' }
		};
	} else if (status === 'missed') {
		style = {
			bgcolor: '#fce8e6',
			color: '#c5221f',
			border: '1px solid transparent',
			'&:hover': { bgcolor: '#f9d2ce' }
		};
	} else if (status === 'granted') {
		style = {
			bgcolor: '#e8f0fe',
			color: '#1967d2',
			border: '1px solid #4285f4',
			'&:hover': { bgcolor: '#d2e3fc' }
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
					border: 'none !important',
					zIndex: 1
				} : {})
			}}
		/>
	);
};

const DSRSubmissionDialog: React.FC<DSRSubmissionDialogProps> = ({ open, onClose, entryId, readOnly = false }) => {
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

	const getTitle = () => {
		if (readOnly) return 'View Daily Status Report';
		return entryId ? 'Edit Daily Status Report' : 'New Daily Status Report';
	};

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
								{getTitle()}
							</Typography>
							<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400 }}>
								{readOnly ? 'Detailed report of activities and hours' : 'Log your work activities and hours'}
							</Typography>
						</Box>
					</Box>
					<IconButton onClick={onClose} sx={{ color: 'white' }}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>

				<DialogContent sx={{ p: 4, pt: 3, bgcolor: '#f2f3f3' }}>
					<Box sx={{ mt: 2 }}>
						{!readOnly && permissionError && (
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

						{!readOnly && !isDateAllowed && (
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
								disabled={!!entryId || readOnly}
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

					{/* Calendar Status Legend */}
					{!readOnly && (
						<Box sx={{
							mb: 3,
							p: 2,
							bgcolor: '#f8f9fa',
							borderRadius: '8px',
							border: '1px solid #e0e0e0',
							display: 'flex',
							gap: 2,
							flexWrap: 'wrap',
							justifyContent: 'center'
						}}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#e6f4ea', border: '2px solid #34a853' }} />
								<Typography variant="caption" sx={{ color: '#137333', fontWeight: 600 }}>Approved</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#fef7e0', border: '2px solid #fbbc04' }} />
								<Typography variant="caption" sx={{ color: '#b06000', fontWeight: 600 }}>Submitted</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#e8f0fe', border: '2px solid #4285f4' }} />
								<Typography variant="caption" sx={{ color: '#1967d2', fontWeight: 600 }}>Permission Granted</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#fde7e9', border: '2px solid #d93025' }} />
								<Typography variant="caption" sx={{ color: '#c5221f', fontWeight: 600 }}>Rejected</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{ width: 14, height: 14, borderRadius: '4px', bgcolor: '#f8f9fa', border: '2px dashed #dadce0' }} />
								<Typography variant="caption" sx={{ color: '#5f6368', fontWeight: 600 }}>Draft</Typography>
							</Box>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#fce8e6' }} />
								<Typography variant="caption" sx={{ color: '#c5221f', fontWeight: 600 }}>Missed</Typography>
							</Box>
						</Box>
					)}

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
							readOnly={readOnly}
						/>
					</Box>
				</DialogContent>

				<DialogActions sx={{ p: 3, borderTop: '1px solid #d5dbdb', bgcolor: 'white' }}>
					<Button onClick={onClose} sx={{ color: '#545b64', textTransform: 'none', fontWeight: 700 }}>
						{readOnly ? 'Close' : 'Cancel'}
					</Button>
					<Box sx={{ flexGrow: 1 }} />
					{!readOnly && (
						<>
							<Button
								variant="outlined"
								onClick={handleSaveDraft}
								disabled={submitting || !isDateAllowed}
								startIcon={submitting ? <CircularProgress size={16} /> : null}
								sx={{
									color: '#232f3e',
									borderColor: '#d5dbdb',
									px: 4,
									textTransform: 'none',
									fontWeight: 700,
									'&:hover': { borderColor: '#aab7bd', bgcolor: '#f3f3f3' }
								}}
							>
								{submitting ? 'Saving...' : 'Save as Draft'}
							</Button>
							<Button
								variant="contained"
								onClick={handleSubmit}
								disabled={submitting || !isDateAllowed}
								startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
								sx={{
									bgcolor: '#ec7211',
									'&:hover': { bgcolor: '#eb5f07' },
									px: 4,
									textTransform: 'none',
									fontWeight: 700
								}}
							>
								{submitting ? 'Submitting...' : 'Submit Report'}
							</Button>
						</>
					)}
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
};

export default DSRSubmissionDialog;
