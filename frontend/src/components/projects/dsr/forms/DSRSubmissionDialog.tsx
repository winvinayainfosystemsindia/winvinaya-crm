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
	TextField,
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

interface DSRSubmissionDialogProps {
	open: boolean;
	onClose: () => void;
	entryId?: string | null;
}

const DSRSubmissionDialog: React.FC<DSRSubmissionDialogProps> = ({ open, onClose, entryId }) => {
	const {
		projects,
		activitiesByProject,
		loading,
		reportDate,
		setReportDate,
		items,
		totalHours,
		submitting,
		permissionError,
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

			<DialogContent sx={{ p: 4, bgcolor: '#f2f3f3' }}>
				{permissionError && (
					<Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: '2px' }}>
						{permissionError}
					</Alert>
				)}

				<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
					<TextField
						label="Reporting Date"
						type="date"
						value={reportDate}
						onChange={(e) => setReportDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
						size="small"
						sx={{
							minWidth: 200,
							bgcolor: 'white',
							'& .MuiInputBase-root': { borderRadius: '2px' }
						}}
					/>

					<DSRStatsCard
						label="Total Hours"
						value={totalHours.toFixed(2)}
						color={totalHours > 8 ? '#1d8102' : '#232f3e'}
					/>
				</Box>

				<Box sx={{ bgcolor: 'white', p: 1, borderRadius: '1px', border: '1px solid #d5dbdb' }}>
					<SubmissionForm
						items={items}
						projects={projects}
						activitiesByProject={activitiesByProject}
						loading={loading}
						submitting={submitting}
						onRowChange={handleRowChange}
						onAddRow={addRow}
						onRemoveRow={removeRow}
						onSaveDraft={handleSaveDraft}
						onSubmit={handleSubmit}
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
					disabled={submitting}
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
					disabled={submitting}
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
	);
};

export default DSRSubmissionDialog;
