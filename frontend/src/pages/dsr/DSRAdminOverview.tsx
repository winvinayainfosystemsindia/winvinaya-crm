import React from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Tabs,
	Tab,
	Button,
	IconButton,
	TextField,
	CircularProgress
} from '@mui/material';
import {
	Notifications as RemindIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDSRAdmin } from '../../components/projects/dsr/hooks/useDSRAdmin';
import MissingReportsTable from '../../components/projects/dsr/admin/MissingReportsTable';
import AllSubmissionsTable from '../../components/projects/dsr/admin/AllSubmissionsTable';
import CustomTablePagination from '../../components/common/CustomTablePagination';

const DSRAdminOverview: React.FC = () => {
	const {
		tab,
		setTab,
		reportDate,
		setReportDate,
		reminding,
		missingReports,
		entries,
		totalEntries,
		loading,
		entryPage,
		setEntryPage,
		entryRowsPerPage,
		setEntryRowsPerPage,
		handleSendReminders,
		handleGrantPermission,
		handleRefresh
	} = useDSRAdmin();

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100vh', py: 4 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4 }}>
					<Typography variant="h4" sx={{ fontWeight: 300, color: '#232f3e', mb: 0.5, letterSpacing: '-0.01em' }}>
						DSR Admin Overview
					</Typography>
					<Typography variant="body2" sx={{ color: '#5f6368' }}>
						Monitor submissions, send reminders and manage permissions
					</Typography>
				</Box>

				<Paper elevation={0} sx={{ mb: 3, borderRadius: '2px', border: '1px solid #d5dbdb', overflow: 'hidden' }}>
					<Tabs
						value={tab}
						onChange={(_, v) => setTab(v)}
						sx={{
							borderBottom: 1,
							borderColor: 'divider',
							bgcolor: '#fafafa',
							'& .MuiTab-root': { textTransform: 'none', fontWeight: 600 }
						}}
					>
						<Tab label="Missing Reports" />
						<Tab label="All Submissions" />
					</Tabs>
					<Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', bgcolor: 'white' }}>
						<TextField
							label="Report Date"
							type="date"
							size="small"
							value={reportDate}
							onChange={(e) => setReportDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
							sx={{ '& .MuiInputBase-root': { borderRadius: '2px' } }}
						/>
						{tab === 0 && (
							<Button
								variant="contained"
								startIcon={reminding ? <CircularProgress size={20} color="inherit" /> : <RemindIcon />}
								onClick={handleSendReminders}
								disabled={reminding || missingReports.length === 0}
								sx={{
									bgcolor: '#d91d11',
									'&:hover': { bgcolor: '#b71c1c' },
									borderRadius: '2px',
									textTransform: 'none',
									fontWeight: 700
								}}
							>
								Send Reminders ({missingReports.length})
							</Button>
						)}
						<IconButton onClick={handleRefresh}>
							<RefreshIcon />
						</IconButton>
					</Box>

					<Box sx={{ bgcolor: 'white' }}>
						{tab === 0 ? (
							<MissingReportsTable
								missingReports={missingReports}
								loading={loading}
								onGrantPermission={handleGrantPermission}
							/>
						) : (
							<>
								<AllSubmissionsTable
									entries={entries}
									loading={loading}
								/>
								<CustomTablePagination
									count={totalEntries}
									rowsPerPage={entryRowsPerPage}
									page={entryPage}
									onPageChange={(_, p) => setEntryPage(p)}
									onRowsPerPageChange={(e) => { setEntryRowsPerPage(parseInt(e.target.value, 10)); setEntryPage(0); }}
									onRowsPerPageSelectChange={(rows) => { setEntryRowsPerPage(rows); setEntryPage(0); }}
								/>
							</>
						)}
					</Box>
				</Paper>
			</Container>
		</Box>
	);
};

export default DSRAdminOverview;
