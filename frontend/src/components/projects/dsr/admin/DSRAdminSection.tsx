import React, { useState } from 'react';
import {
	Box,
	Typography,
	Tabs,
	Tab,
	Divider,
	Button,
	Paper
} from '@mui/material';
import {
	RateReview as ReviewIcon,
	VpnKey as PermissionIcon,
	History as HistoryIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import DSRReviewQueue from './DSRReviewQueue';
import PermissionStatsCards from '../common/PermissionStatsCards';
import PermissionRequestsTable from './PermissionRequestsTable';
import AllSubmissionsTable from './AllSubmissionsTable';
import DSRProjectRequestsTable from './DSRProjectRequestsTable';
import DSRActivityTypeManagement from './DSRActivityTypeManagement';
import type { useDSRAdmin } from '../hooks/useDSRAdmin';
import type { DSRPermissionStats } from '../../../../models/dsr';

interface DSRAdminSectionProps {
	admin: ReturnType<typeof useDSRAdmin>;
	permissionStats: DSRPermissionStats | null;
}

const TabLabel: React.FC<{
	icon: React.ReactNode;
	label: string;
	count?: number;
	color?: string;
	active?: boolean;
}> = ({ icon, label, count, color = '#ec7211', active }) => (
	<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
		<Box sx={{
			display: 'flex',
			alignItems: 'center',
			color: active ? color : '#545b64',
			transition: 'color 0.2s ease'
		}}>
			{icon}
		</Box>
		<Typography
			variant="inherit"
			sx={{
				fontWeight: active ? 700 : 600,
				fontSize: '0.875rem',
				color: active ? '#232f3e' : '#545b64',
				transition: 'all 0.2s ease'
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
					color: active ? color : '#545b64',
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

const DSRAdminSection: React.FC<DSRAdminSectionProps> = ({ admin, permissionStats }) => {
	const [activeTab, setActiveTab] = useState(0);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const TabPanel: React.FC<{ children: React.ReactNode; index: number; value: number }> = ({ children, value, index }) => (
		<div role="tabpanel" hidden={value !== index}>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	);

	const pendingPermissions = admin.permissionRequests.filter(r => r.status === 'pending').length;

	return (
		<Box>
			<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Box>
					<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }}>
						Admin Control Center
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage submissions, permissions, and monitor global history.
					</Typography>
				</Box>
				<Button
					startIcon={<RefreshIcon />}
					onClick={admin.handleRefresh}
					variant="outlined"
					size="small"
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderColor: '#d5dbdb',
						color: '#232f3e',
						'&:hover': { bgcolor: '#f3f3f3', borderColor: '#aab7bd' }
					}}
				>
					Refresh Data
				</Button>
			</Box>

			<Paper elevation={0} variant="outlined" sx={{ borderRadius: '4px', border: '1px solid #eaeded', overflow: 'hidden' }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#fbfbfb' }}>
					<Tabs
						value={activeTab}
						onChange={handleTabChange}
						sx={{
							minHeight: 48,
							px: 2,
							'& .MuiTabs-indicator': {
								backgroundColor: '#ec7211',
								height: 3,
								borderRadius: '3px 3px 0 0'
							}
						}}
					>
						<Tab
							label={
								<TabLabel
									icon={<ReviewIcon sx={{ fontSize: 18 }} />}
									label="Review Queue"
									count={admin.reviewQueueTotal}
									active={activeTab === 0}
								/>
							}
							sx={{
								textTransform: 'none',
								minHeight: 48,
								px: 3,
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}}
						/>
						<Tab
							label={
								<TabLabel
									icon={<PermissionIcon sx={{ fontSize: 18 }} />}
									label="Permissions"
									count={pendingPermissions}
									color="#ed6c02"
									active={activeTab === 1}
								/>
							}
							sx={{
								textTransform: 'none',
								minHeight: 48,
								px: 3,
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}}
						/>
						<Tab
							label={
								<TabLabel
									icon={<HistoryIcon sx={{ fontSize: 18 }} />}
									label="Full History"
									active={activeTab === 2}
								/>
							}
							sx={{
								textTransform: 'none',
								minHeight: 48,
								px: 3,
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}}
						/>
						<Tab
							label={
								<TabLabel
									icon={<ReviewIcon sx={{ fontSize: 18 }} />}
									label="Project Requests"
									count={admin.projectRequestsTotal}
									active={activeTab === 3}
								/>
							}
							sx={{
								textTransform: 'none',
								minHeight: 48,
								px: 3,
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}}
						/>
						<Tab
							label={
								<TabLabel
									icon={<ReviewIcon sx={{ fontSize: 18 }} />}
									label="Activity Types"
									active={activeTab === 4}
								/>
							}
							sx={{
								textTransform: 'none',
								minHeight: 48,
								px: 3,
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}}
						/>
					</Tabs>
				</Box>

				<Box sx={{ p: 3 }}>
					<TabPanel value={activeTab} index={0}>
						<Box sx={{ mb: 2 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>DSR Review Queue</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Approve or reject submitted DSRs. Oldest submissions appear first.
							</Typography>
							<Divider sx={{ mb: 3 }} />
							<DSRReviewQueue
								entries={admin.reviewQueue}
								loading={admin.reviewLoading}
								onApprove={admin.handleApproveEntry}
								onReject={admin.handleRejectEntry}
							/>
						</Box>
					</TabPanel>

					<TabPanel value={activeTab} index={1}>
						<Box sx={{ mb: 4 }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Permission Analytics</Typography>
							<PermissionStatsCards stats={permissionStats} />
						</Box>
						<Box>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Pending Requests</Typography>
							<Divider sx={{ mb: 3 }} />
							<PermissionRequestsTable
								requests={admin.permissionRequests}
								loading={admin.loading}
								onHandle={admin.handlePermissionAction}
							/>
						</Box>
					</TabPanel>

					<TabPanel value={activeTab} index={2}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Global Submission History</Typography>
						<Divider sx={{ mb: 3 }} />
						<AllSubmissionsTable
							entries={admin.entries}
							total={admin.totalEntries}
							loading={admin.loading}
							page={admin.entryPage}
							rowsPerPage={admin.entryRowsPerPage}
							onPageChange={(_, p) => admin.setEntryPage(p)}
							onRowsPerPageChange={(e) => admin.setEntryRowsPerPage(parseInt(e.target.value))}
						/>
					</TabPanel>

					<TabPanel value={activeTab} index={3}>
						<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>User Project Requests</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
							Review and approve requests for new projects from team members. 
							Approved projects will be automatically created.
						</Typography>
						<Divider sx={{ mb: 3 }} />
						<DSRProjectRequestsTable
							requests={admin.projectRequests}
							loading={admin.projectLoading}
							onHandle={admin.handleProjectRequest}
						/>
					</TabPanel>

					<TabPanel value={activeTab} index={4}>
						<DSRActivityTypeManagement />
					</TabPanel>
				</Box>
			</Paper>
		</Box>
	);
};

export default DSRAdminSection;
