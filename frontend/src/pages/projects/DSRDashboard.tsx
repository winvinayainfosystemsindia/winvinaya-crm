import React, { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Tabs,
	Tab,
	Divider
} from '@mui/material';
import {
	Add as AddIcon,
	History as HistoryIcon,
	AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import HistoryTable from '../../components/projects/dsr/history/HistoryTable';
import { useDSRHistory } from '../../components/projects/dsr/hooks/useDSRHistory';
import AllSubmissionsTable from '../../components/projects/dsr/admin/AllSubmissionsTable';
import MissingReportsTable from '../../components/projects/dsr/admin/MissingReportsTable';
import { useDSRAdmin } from '../../components/projects/dsr/hooks/useDSRAdmin';
import DSRSubmissionDialog from '../../components/projects/dsr/forms/DSRSubmissionDialog';
import DSRModuleLayout from '../../components/projects/dsr/layout/DSRModuleLayout';

const DSRDashboard: React.FC = () => {
	const { user } = useAppSelector((state) => state.auth);
	const isAdmin = user?.role === 'admin';

	const [activeTab, setActiveTab] = useState(0);
	const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
	const [editEntryId, setEditEntryId] = useState<string | null>(null);

	// Hooks logic
	const history = useDSRHistory();
	const admin = useDSRAdmin();

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleOpenSubmission = () => {
		setEditEntryId(null);
		setIsSubmissionOpen(true);
	};

	const handleEditEntry = (id: string) => {
		setEditEntryId(id);
		setIsSubmissionOpen(true);
	};

	const handleCloseSubmission = () => {
		setIsSubmissionOpen(false);
		setEditEntryId(null);
		// Refresh data
		history.fetchHistory();
		if (isAdmin) admin.handleRefresh();
	};

	return (
		<DSRModuleLayout
			title="Daily Status Reports"
			subtitle="Track work progress, manage submissions, and review team activity."
		>
			{() => (
				<Box>
					<Paper variant="outlined" sx={{ borderRadius: '2px', overflow: 'hidden' }}>
						<Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fafafa' }}>
							<Tabs
								value={activeTab}
								onChange={handleTabChange}
								sx={{
									'& .MuiTab-root': {
										textTransform: 'none',
										fontWeight: 700,
										minHeight: 48,
										color: '#545b64',
										'&.Mui-selected': { color: '#ec7211' }
									},
									'& .MuiTabs-indicator': { backgroundColor: '#ec7211' }
								}}
							>
								<Tab icon={<HistoryIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Submission History" />
								{isAdmin && <Tab icon={<AdminIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Admin Overview" />}
							</Tabs>
						</Box>

						<Box sx={{ p: 3, bgcolor: 'white' }}>
							{activeTab === 0 && (
								<Box>
									<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Typography variant="h6" sx={{ fontWeight: 700 }}>My Submissions</Typography>
										<Button
											variant="contained"
											startIcon={<AddIcon />}
											onClick={handleOpenSubmission}
											sx={{
												bgcolor: '#ec7211',
												'&:hover': { bgcolor: '#eb5f07' },
												px: 3,
												py: 0.75,
												fontWeight: 700,
												boxShadow: '0 1px 1px 0 rgba(0,0,0,0.1)'
											}}
										>
											Report Daily Status
										</Button>
									</Box>
									<HistoryTable
										entries={history.entries}
										loading={history.loading}
										expandedRow={history.expandedRow}
										onToggleReplace={(id) => history.setExpandedRow(id)}
										onDelete={history.handleDelete}
										onEdit={handleEditEntry}
									/>
								</Box>
							)}

							{activeTab === 1 && isAdmin && (
								<Box>
									<Box sx={{ mb: 4 }}>
										<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
											<Typography variant="h6" sx={{ fontWeight: 700 }}>Missing Reports Today</Typography>
											<Button
												size="small"
												variant="outlined"
												onClick={admin.handleSendReminders}
												disabled={admin.reminding || admin.missingReports.length === 0}
												sx={{ textTransform: 'none', fontWeight: 700 }}
											>
												{admin.reminding ? 'Sending...' : 'Remind All Missing'}
											</Button>
										</Box>
										<Divider sx={{ mb: 2 }} />
										<MissingReportsTable
											missingReports={admin.missingReports}
											loading={admin.loading}
											onGrantPermission={admin.handleGrantPermission}
											reminding={admin.reminding}
										/>
									</Box>

									<Box>
										<Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>All User Submissions</Typography>
										<Divider sx={{ mb: 2 }} />
										<AllSubmissionsTable
											entries={admin.entries}
											total={admin.totalEntries}
											loading={admin.loading}
											page={admin.entryPage}
											rowsPerPage={admin.entryRowsPerPage}
											onPageChange={(_, p: number) => admin.setEntryPage(p)}
											onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => admin.setEntryRowsPerPage(parseInt(e.target.value))}
										/>
									</Box>
								</Box>
							)}
						</Box>
					</Paper>

					{/* Submission Dialog */}
					<DSRSubmissionDialog
						open={isSubmissionOpen}
						onClose={handleCloseSubmission}
						entryId={editEntryId}
					/>
				</Box>
			)}
		</DSRModuleLayout>
	);
};

export default DSRDashboard;
