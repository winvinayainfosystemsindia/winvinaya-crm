import React from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	TextField,
	Button,
	Grid,
	Alert,
} from '@mui/material';
import {
	History as HistoryIcon,
	Warning as WarningIcon
} from '@mui/icons-material';
import { useDSRSubmission } from '../../components/projects/dsr/hooks/useDSRSubmission';
import SubmissionForm from '../../components/projects/dsr/forms/SubmissionForm';
import DSRStatsCard from '../../components/projects/dsr/common/DSRStatsCard';

const DSRSubmission: React.FC = () => {
	const {
		entryId,
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
		handleSubmit,
		navigate
	} = useDSRSubmission();

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 300, color: '#232f3e', mb: 0.5, letterSpacing: '-0.01em' }}>
							{entryId ? 'Edit Draft Report' : 'Daily Status Report'}
						</Typography>
						<Typography variant="body2" sx={{ color: '#5f6368' }}>
							Report your activities and hours for the day
						</Typography>
					</Box>
					<Button
						variant="outlined"
						startIcon={<HistoryIcon />}
						onClick={() => navigate('/dashboard/dsr')}
						sx={{
							color: '#232f3e',
							borderColor: '#d5dbdb',
							textTransform: 'none',
							fontWeight: 700,
							borderRadius: '2px',
							'&:hover': { bgcolor: '#f3f3f3', borderColor: '#aab7bd' }
						}}
					>
						View History
					</Button>
				</Box>

				{permissionError && (
					<Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3, borderRadius: '2px' }}>
						{permissionError}
					</Alert>
				)}

				<Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: '2px', border: '1px solid #d5dbdb' }}>
					<Grid container spacing={3} alignItems="center">
						<Grid size={{ xs: 12, sm: 4, md: 3 } as any}>
							<TextField
								label="Reporting Date"
								type="date"
								fullWidth
								value={reportDate}
								onChange={(e) => setReportDate(e.target.value)}
								InputLabelProps={{ shrink: true }}
								size="small"
								sx={{
									'& .MuiInputBase-root': { borderRadius: '2px' }
								}}
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 8, md: 9 } as any} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
							<DSRStatsCard
								label="Total Hours"
								value={totalHours.toFixed(2)}
								color={totalHours > 8 ? '#1d8102' : '#232f3e'}
							/>
						</Grid>
					</Grid>
				</Paper>

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
				/>
			</Container>
		</Box>
	);
};

export default DSRSubmission;
