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
	CircularProgress,
	Switch,
	MenuItem,
	TextField
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
	const statusStyles: Record<string, any> = {
		approved: { bgcolor: '#f1f8e9', color: '#2e7d32', border: '1px solid #a5d6a7' },
		submitted: { bgcolor: '#fffde7', color: '#f9a825', border: '1px solid #fff59d' },
		rejected: { bgcolor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' },
		draft: { bgcolor: '#fafafa', color: '#616161', border: '1px dashed #bdbdbd' },
		missed: { bgcolor: '#fff5f5', color: '#d32f2f', border: 'none' },
		granted: { bgcolor: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' }
	};

	if (status && statusStyles[status]) {
		style = {
			...statusStyles[status],
			'&:hover': { bgcolor: `${statusStyles[status].bgcolor}CC` }
		};
	}

	return (
		<PickersDay
			{...other}
			day={day}
			selected={selected}
			sx={{
				...style,
				fontWeight: 600,
				fontSize: '0.75rem',
				...(selected ? {
					bgcolor: '#ec7211 !important',
					color: 'white !important',
					border: 'none !important',
					zIndex: 1,
					boxShadow: '0 2px 4px rgba(236,114,17,0.3)'
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
		isLeave,
		setIsLeave,
		leaveType,
		setLeaveType,
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

	const LeaveTypes = [
		'Sick Leave',
		'Earned Leave',
		'Casual Leave',
		'Comp Off',
		'Other'
	];

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
					sx: { borderRadius: '4px', minHeight: '80vh', overflow: 'hidden' }
				}}
			>
				<DialogTitle sx={{
					bgcolor: '#1a222e',
					color: 'white',
					py: 1.5,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					borderBottom: '1px solid rgba(255,255,255,0.1)'
				}}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
						<Box sx={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							width: 32,
							height: 32,
							borderRadius: '6px',
							bgcolor: 'rgba(236,114,17,0.15)',
							color: '#ec7211'
						}}>
							<DSRIcon fontSize="small" />
						</Box>
						<Box>
							<Typography variant="subtitle1" sx={{ lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.01em' }}>
								{getTitle()}
							</Typography>
							<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: '0.7rem' }}>
								{readOnly ? 'Detailed review of activities' : 'Daily status and activity logging'}
							</Typography>
						</Box>
					</Box>
					<IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</DialogTitle>

				<DialogContent sx={{ p: 0, bgcolor: '#f9fafb' }}>
					<Box sx={{ p: 3 }}>
						{!readOnly && (permissionError || !isDateAllowed) && (
							<Fade in>
								<Alert
									severity={permissionError ? "error" : "warning"}
									sx={{
										mb: 3,
										borderRadius: '6px',
										border: '1px solid',
										bgcolor: permissionError ? '#fff5f5' : '#fff9f2',
										borderColor: permissionError ? '#feb2b2' : '#ffebcc',
										'& .MuiAlert-icon': { color: permissionError ? '#dc2626' : '#d97706' }
									}}
								>
									{permissionError || "You do not have permission to submit for this past date. Please raise a request first."}
								</Alert>
							</Fade>
						)}

						<Box sx={{
							display: 'grid',
							gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
							gap: 3,
							mb: 3,
							alignItems: 'center',
							p: 2.5,
							bgcolor: 'white',
							borderRadius: '8px',
							border: '1px solid #e5e7eb',
							boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
						}}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
								<Box>
									<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
										Reporting Date
									</Typography>
									<DatePicker
										value={dayjs(reportDate)}
										onChange={(newValue) => setReportDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
										disabled={!!entryId || readOnly}
										maxDate={dayjs()}
										slots={{ day: (props) => <StatusDay {...props} dateStatuses={dateStatuses} /> }}
										slotProps={{
											textField: {
												size: 'small',
												variant: 'standard',
												InputProps: { disableUnderline: true },
												sx: {
													'& .MuiInputBase-input': {
														fontWeight: 700,
														fontSize: '1rem',
														color: '#111827',
														p: 0,
														cursor: (!!entryId || readOnly) ? 'default' : 'pointer'
													}
												}
											}
										}}
									/>
								</Box>

								<Box sx={{ height: 40, width: '1px', bgcolor: '#e5e7eb', display: { xs: 'none', sm: 'block' } }} />

								<Box>
									<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
										Status Legend
									</Typography>
									<Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
										{[
											{ label: 'Approved', color: '#2e7d32', dot: '#a5d6a7' },
											{ label: 'Submitted', color: '#f9a825', dot: '#fff59d' },
											{ label: 'Permission', color: '#1565c0', dot: '#90caf9' }, // Label changed for brevity
											{ label: 'Missed', color: '#d32f2f', dot: '#ffcdd2' }
										].map((item) => (
											<Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
												<Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: item.dot }} />
												<Typography sx={{ fontSize: '0.7rem', fontWeight: 400, color: 'text.secondary' }}>
													{item.label}
												</Typography>
											</Box>
										))}
									</Box>
								</Box>
							</Box>

							<Box sx={{ justifySelf: { md: 'end' } }}>
								<DSRStatsCard
									label="Total Logged Hours"
									value={isLeave ? '0.00' : totalHours.toFixed(2)}
									unit="hrs"
									color={!isLeave && totalHours > 8 ? '#059669' : '#111827'}
								/>
							</Box>
						</Box>

						{/* Leave Marking Section */}
						<Box sx={{
							mb: 3,
							p: 2,
							bgcolor: isLeave ? '#fffbeb' : 'white',
							borderRadius: '8px',
							border: '1px solid',
							borderColor: isLeave ? '#fbbf24' : '#e5e7eb',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							flexWrap: 'wrap',
							gap: 2,
							transition: 'all 0.2s ease',
							boxShadow: isLeave ? '0 4px 6px -1px rgba(251,191,36,0.1)' : '0 1px 2px rgba(0,0,0,0.05)'
						}}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<Box sx={{
									width: 36,
									height: 36,
									borderRadius: '50%',
									bgcolor: isLeave ? '#fbbf24' : '#f3f4f6',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: isLeave ? 'white' : '#9ca3af',
									transition: 'all 0.2s ease'
								}}>
									<WarningIcon fontSize="small" />
								</Box>
								<Box>
									<Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
										{isLeave ? 'Date Marked as Leave' : 'Mark this day as Leave'}
									</Typography>
									<Typography variant="caption" color="text.secondary">
										{isLeave ? 'No activities will be logged for this date' : 'Toggle this if you were on leave today'}
									</Typography>
								</Box>
							</Box>

							<Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
								{isLeave && (
									<Fade in>
										<Box sx={{ width: 220 }}>
											<TextField
												select
												fullWidth
												size="small"
												label="Leave Type"
												value={leaveType}
												onChange={(e) => setLeaveType(e.target.value)}
												disabled={readOnly}
												required
												sx={{
													bgcolor: 'white',
													'& .MuiInputBase-root': { borderRadius: '6px' },
													'& .MuiInputLabel-root': { fontSize: '0.85rem' }
												}}
											>
												{LeaveTypes.map((type) => (
													<MenuItem key={type} value={type} sx={{ fontSize: '0.85rem' }}>
														{type}
													</MenuItem>
												))}
											</TextField>
										</Box>
									</Fade>
								)}
								<Switch
									checked={isLeave}
									onChange={(e) => setIsLeave(e.target.checked)}
									disabled={readOnly || !!entryId}
									color="warning"
								/>
							</Box>
						</Box>

						{!isLeave ? (
							<Box sx={{
								bgcolor: 'white',
								borderRadius: '8px',
								border: '1px solid #e5e7eb',
								boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
								overflow: 'hidden'
							}}>
								<Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f3f4f6', bgcolor: '#f9fafb' }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.025em', fontSize: '0.75rem' }}>
										Activity Work Logs
									</Typography>
								</Box>
								<Box sx={{ p: 2 }}>
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
							</Box>
						) : (
							<Fade in>
								<Box sx={{
									py: 10,
									textAlign: 'center',
									bgcolor: 'white',
									borderRadius: '8px',
									border: '1px dashed #fbbf24',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 2
								}}>
									<Typography variant="h5" sx={{ color: '#d97706', fontWeight: 500 }}>
										{leaveType || 'Select Leave Type'}
									</Typography>
									<Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 400 }}>
										You have marked this day as on leave. No work activities will be processed for {dayjs(reportDate).format('MMMM D, YYYY')}.
									</Typography>
								</Box>
							</Fade>
						)}
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
