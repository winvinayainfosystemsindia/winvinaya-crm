import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Tabs,
	Tab
} from '@mui/material';
import {
	Add as AddIcon,
	History as HistoryIcon,
	AdminPanelSettings as AdminIcon,
	RequestQuote as RequestIcon,
	EventBusy as LeaveIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import HistoryTable from '../../components/projects/dsr/history/HistoryTable';
import { useDSRHistory } from '../../components/projects/dsr/hooks/useDSRHistory';
import DSRAdminSection from '../../components/projects/dsr/admin/DSRAdminSection';
import { useDSRAdmin } from '../../components/projects/dsr/hooks/useDSRAdmin';
import DSRSubmissionDialog from '../../components/projects/dsr/forms/DSRSubmissionDialog';
import ApplyLeaveDialog from '../../components/projects/dsr/forms/ApplyLeaveDialog';
import PermissionRequestDialog from '../../components/projects/dsr/forms/PermissionRequestDialog';
import DSRModuleLayout from '../../components/projects/dsr/layout/DSRModuleLayout';
import DSRCalendarView from '../../components/projects/dsr/history/DSRCalendarView';
import MyLeavesTable from '../../components/projects/dsr/user/MyLeavesTable';
import MyLeaveStatsCards from '../../components/projects/dsr/common/MyLeaveStatsCards';
import {
	fetchPermissionRequests,
	fetchPermissionStats,
	fetchLeaveStats
} from '../../store/slices/dsrSlice';
import MyPermissionRequests from '../../components/projects/dsr/user/MyPermissionRequests';
import PermissionStatsCards from '../../components/projects/dsr/common/PermissionStatsCards';

const TabLabel: React.FC<{
	icon: React.ReactNode;
	label: string;
	count?: number;
	active?: boolean;
}> = ({ icon, label, count, active }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
		<Box sx={{
			display: 'flex',
			alignItems: 'center',
			color: active ? '#ec7211' : '#545b64',
			transition: 'color 0.2s ease'
		}}>
			{icon}
		</Box>
		<Typography
			variant="inherit"
			sx={{
				fontWeight: active ? 700 : 600,
				fontSize: '0.875rem',
				color: active ? '#232f3e' : '#545b64'
			}}
		>
			{label}
		</Typography>
		{count !== undefined && count > 0 && (
			<Box
				sx={{
					display: 'inline-flex',
					alignItems: 'center',
					justifyContent: 'center',
					minWidth: 22,
					height: 18,
					px: 0.8,
					borderRadius: '10px',
					bgcolor: active ? 'rgba(236, 114, 17, 0.1)' : '#f0f2f5',
					color: active ? '#ec7211' : '#545b64',
					fontSize: '0.7rem',
					fontWeight: 800,
					transition: 'all 0.2s ease',
					border: active ? `1px solid rgba(236, 114, 17, 0.2)` : '1px solid transparent'
				}}
			>
				{count}
			</Box>
		)}
	</Box>
);

const DSRDashboard: React.FC = () => {
	const dispatch = useAppDispatch();
	const { user } = useAppSelector((state) => state.auth);
	const isPrivileged = user?.role === 'admin' || user?.role === 'manager';
	const { permissionRequests, permissionStats, leaveStats, loading: dsrLoading } = useAppSelector((state) => state.dsr);

	const [activeTab, setActiveTab] = useState(0);
	const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
	const [isLeaveOpen, setIsLeaveOpen] = useState(false);
	const [isPermissionRequestOpen, setIsPermissionRequestOpen] = useState(false);
	const [editEntryId, setEditEntryId] = useState<string | null>(null);
	const [isViewOnly, setIsViewOnly] = useState(false);

	const history = useDSRHistory();
	const admin = useDSRAdmin();

	// Fetch initial data
	useEffect(() => {
		if (activeTab === 1) {
			dispatch(fetchPermissionStats({ user_id: user?.id }));
			dispatch(fetchPermissionRequests({ skip: 0, limit: 100, user_id: user?.id }));
		} else if (activeTab === 2) {
			dispatch(fetchLeaveStats());
		} else if (activeTab === 3 && isPrivileged) {
			dispatch(fetchPermissionStats());
		}
	}, [dispatch, activeTab, user?.id, isPrivileged]);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleOpenSubmission = () => {
		setEditEntryId(null);
		setIsViewOnly(false);
		setIsSubmissionOpen(true);
	};

	const handleEditEntry = (id: string) => {
		setEditEntryId(id);
		setIsViewOnly(false);
		setIsSubmissionOpen(true);
	};

	const handleViewEntry = (id: string) => {
		setEditEntryId(id);
		setIsViewOnly(true);
		setIsSubmissionOpen(true);
	};

	const handleCloseSubmission = () => {
		setIsSubmissionOpen(false);
		setEditEntryId(null);
		setIsViewOnly(false);
		history.fetchHistory();
		if (activeTab === 1) {
			dispatch(fetchPermissionStats({ user_id: user?.id }));
			dispatch(fetchPermissionRequests({ skip: 0, limit: 100, user_id: user?.id }));
		} else if (activeTab === 2) {
			dispatch(fetchLeaveStats());
		} else if (activeTab === 3 && isPrivileged) {
			dispatch(fetchPermissionStats());
			admin.handleRefresh();
		}
	};

	const handlePermissionRequestClose = () => {
		setIsPermissionRequestOpen(false);
		dispatch(fetchPermissionStats({ user_id: user?.id }));
		dispatch(fetchPermissionRequests({ skip: 0, limit: 100, user_id: user?.id }));
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
									'& .MuiTabs-indicator': { backgroundColor: '#ec7211' }
								}}
							>
								<Tab
									label={
										<TabLabel
											icon={<HistoryIcon sx={{ fontSize: 18 }} />}
											label="My Submissions"
											active={activeTab === 0}
										/>
									}
									sx={{ textTransform: 'none', minHeight: 48 }}
								/>
								<Tab
									label={
										<TabLabel
											icon={<RequestIcon sx={{ fontSize: 18 }} />}
											label="My Requests"
											active={activeTab === 1}
										/>
									}
									sx={{ textTransform: 'none', minHeight: 48 }}
								/>
								<Tab
									label={
										<TabLabel
											icon={<LeaveIcon sx={{ fontSize: 18 }} />}
											label="My Leaves"
											active={activeTab === 2}
										/>
									}
									sx={{ textTransform: 'none', minHeight: 48 }}
								/>
								{isPrivileged && (
									<Tab
										label={
											<TabLabel
												icon={<AdminIcon sx={{ fontSize: 18 }} />}
												label="Admin Overview"
												count={admin.reviewQueueTotal}
												active={activeTab === 3}
											/>
										}
										sx={{ textTransform: 'none', minHeight: 48 }}
									/>
								)}
							</Tabs>
						</Box>

						<Box sx={{ p: 3, bgcolor: 'white' }}>
							{activeTab === 0 && (
								<Box>
									<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
										<Typography variant="h6" sx={{ fontWeight: 700 }}>My Submissions</Typography>
										<Box sx={{ display: 'flex', gap: 2 }}>
											<Button
												variant="outlined"
												startIcon={<RequestIcon />}
												onClick={() => setIsPermissionRequestOpen(true)}
												sx={{
													color: '#232f3e',
													borderColor: '#d5dbdb',
													fontWeight: 700,
													textTransform: 'none',
													'&:hover': { bgcolor: '#f3f3f3', borderColor: '#aab7bd' }
												}}
											>
												Raise Request
											</Button>
											<Button
												variant="outlined"
												startIcon={<LeaveIcon />}
												onClick={() => setIsLeaveOpen(true)}
												sx={{
													color: '#d32f2f',
													borderColor: '#ffcdd2',
													fontWeight: 700,
													textTransform: 'none',
													'&:hover': { bgcolor: '#fff5f5', borderColor: '#ef9a9a' }
												}}
											>
												Apply for Leave
											</Button>
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
									</Box>

									<Box sx={{
										display: 'grid',
										gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
										gap: 3
									}}>
										<Box>
											<HistoryTable
												entries={history.entries}
												total={history.total}
												loading={history.loading}
												page={history.page}
												rowsPerPage={history.rowsPerPage}
												onPageChange={(_, p) => history.setPage(p)}
												onRowsPerPageChange={(e) => history.setRowsPerPage(parseInt(e.target.value, 10))}
												onRowsPerPageSelectChange={(rows) => history.setRowsPerPage(rows)}
												onDelete={history.handleDelete}
												onEdit={handleEditEntry}
												onView={handleViewEntry}
											/>
										</Box>
										<Box sx={{ minWidth: 0 }}>
											<DSRCalendarView />
										</Box>
									</Box>
								</Box>
							)}

							{activeTab === 1 && (
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Request Tracking</Typography>
									<PermissionStatsCards stats={permissionStats} />
									<MyPermissionRequests
										requests={permissionRequests}
										loading={dsrLoading}
									/>
								</Box>
							)}

							{activeTab === 2 && (
								<Box>
									<Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>My Leave Applications</Typography>
									<MyLeaveStatsCards stats={leaveStats} loading={dsrLoading} />
									<MyLeavesTable />
								</Box>
							)}

							{activeTab === 3 && isPrivileged && (
								<DSRAdminSection
									admin={admin}
									permissionStats={permissionStats}
								/>
							)}
						</Box>
					</Paper>

					<DSRSubmissionDialog
						open={isSubmissionOpen}
						onClose={handleCloseSubmission}
						entryId={editEntryId}
						readOnly={isViewOnly}
					/>

					<ApplyLeaveDialog
						open={isLeaveOpen}
						onClose={() => setIsLeaveOpen(false)}
						onSuccess={() => {
							history.fetchHistory();
							dispatch(fetchLeaveStats());
						}}
					/>

					<PermissionRequestDialog
						open={isPermissionRequestOpen}
						onClose={handlePermissionRequestClose}
					/>
				</Box>
			)}
		</DSRModuleLayout>
	);
};

export default DSRDashboard;
