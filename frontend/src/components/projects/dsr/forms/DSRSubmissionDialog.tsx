import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Alert,
	Fade,
	CircularProgress,
	Typography
} from '@mui/material';
import { useDSRSubmission } from '../hooks/useDSRSubmission';
import SubmissionForm from './SubmissionForm';
import DSRDialogHeader from './DSRDialogHeader';
import ReportingHeader from './ReportingHeader';
import LeaveSection from './LeaveSection';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

interface DSRSubmissionDialogProps {
	open: boolean;
	onClose: () => void;
	entryId?: string | null;
	readOnly?: boolean;
}

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

	const getTitle = () => {
		if (readOnly) return 'View Daily Status Report';
		return entryId ? 'Edit Daily Status Report' : 'New Daily Status Report';
	};

	const getSubtitle = () => {
		return readOnly ? 'Detailed review of activities' : 'Daily status and activity logging';
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
				<DSRDialogHeader
					title={getTitle()}
					subtitle={getSubtitle()}
					onClose={onClose}
				/>

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

						<ReportingHeader
							reportDate={reportDate}
							onDateChange={setReportDate}
							dateStatuses={dateStatuses}
							entryId={entryId}
							readOnly={readOnly}
							totalHours={totalHours}
							isLeave={isLeave}
						/>

						<LeaveSection
							isLeave={isLeave}
							setIsLeave={setIsLeave}
							leaveType={leaveType}
							onLeaveTypeChange={setLeaveType}
							readOnly={readOnly}
							entryId={entryId}
						/>

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
