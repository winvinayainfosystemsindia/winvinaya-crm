import React, { useEffect, useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	Tabs,
	Tab,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Button,
	Chip,
	IconButton,
	TextField,
	Alert,
	CircularProgress
} from '@mui/material';
import {
	Notifications as RemindIcon,
	VpnKey as PermissionIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchMissingReports,
	fetchAdminOverview,
	sendDSRReminders,
	grantDSRPermission
} from '../../store/slices/dsrSlice';
import useToast from '../../hooks/useToast';
import CustomTablePagination from '../../components/common/CustomTablePagination';

const DSRAdminOverview: React.FC = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const {
		missingReports,
		entries,
		totalEntries,
		loading
	} = useAppSelector((state) => state.dsr);

	const [tab, setTab] = useState(0);
	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [reminding, setReminding] = useState(false);

	const [entryPage, setEntryPage] = useState(0);
	const [entryRowsPerPage, setEntryRowsPerPage] = useState(10);

	useEffect(() => {
		if (tab === 0) {
			dispatch(fetchMissingReports(reportDate));
		} else {
			dispatch(fetchAdminOverview({
				skip: entryPage * entryRowsPerPage,
				limit: entryRowsPerPage,
				date_from: reportDate,
				date_to: reportDate
			}));
		}
	}, [dispatch, tab, reportDate, entryPage, entryRowsPerPage]);

	const handleSendReminders = async () => {
		setReminding(true);
		try {
			await dispatch(sendDSRReminders(reportDate)).unwrap();
			toast.success('Reminders sent successfully');
		} catch (error: any) {
			toast.error(error || 'Failed to send reminders');
		} finally {
			setReminding(false);
		}
	};

	const handleGrantPermission = async (userPublicId: string) => {
		try {
			await dispatch(grantDSRPermission({
				user_public_id: userPublicId,
				target_date: reportDate,
				expiry_hours: 24
			})).unwrap();
			toast.success('Permission granted for 24 hours');
			dispatch(fetchMissingReports(reportDate));
		} catch (error: any) {
			toast.error(error || 'Failed to grant permission');
		}
	};

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4 }}>
					<Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary', mb: 0.5 }}>
						DSR Admin Overview
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Monitor submissions, send reminders and manage permissions
					</Typography>
				</Box>

				<Paper variant="outlined" sx={{ mb: 3, borderRadius: 1 }}>
					<Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<Tab label="Missing Reports" />
						<Tab label="All Submissions" />
					</Tabs>
					<Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
						<TextField
							label="Report Date"
							type="date"
							size="small"
							value={reportDate}
							onChange={(e) => setReportDate(e.target.value)}
							InputLabelProps={{ shrink: true }}
						/>
						{tab === 0 && (
							<Button
								variant="contained"
								startIcon={reminding ? <CircularProgress size={20} color="inherit" /> : <RemindIcon />}
								onClick={handleSendReminders}
								disabled={reminding || missingReports.length === 0}
								sx={{ bgcolor: '#d91d11', '&:hover': { bgcolor: '#b71c1c' } }}
							>
								Send Reminders ({missingReports.length})
							</Button>
						)}
						<IconButton onClick={() => tab === 0 ? dispatch(fetchMissingReports(reportDate)) : dispatch(fetchAdminOverview({ skip: entryPage * entryRowsPerPage, limit: entryRowsPerPage, date_from: reportDate, date_to: reportDate }))}>
							<RefreshIcon />
						</IconButton>
					</Box>

					{tab === 0 ? (
						<TableContainer>
							<Table>
								<TableHead sx={{ bgcolor: '#f2f3f3' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
										<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
												<CircularProgress size={24} color="inherit" />
											</TableCell>
										</TableRow>
									) : missingReports.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
												<Alert severity="success">Everyone has submitted their DSR for this date!</Alert>
											</TableCell>
										</TableRow>
									) : (
										missingReports.map((user) => (
											<TableRow key={user.public_id} hover>
												<TableCell sx={{ fontWeight: 600 }}>{user.full_name || user.username}</TableCell>
												<TableCell>{user.email}</TableCell>
												<TableCell><Chip label={user.role} size="small" variant="outlined" /></TableCell>
												<TableCell align="right">
													<Button
														size="small"
														startIcon={<PermissionIcon />}
														onClick={() => handleGrantPermission(user.public_id)}
														sx={{ textTransform: 'none' }}
													>
														Grant Permission
													</Button>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</TableContainer>
					) : (
						<TableContainer>
							<Table>
								<TableHead sx={{ bgcolor: '#f2f3f3' }}>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Hours</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Submitted At</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={4} align="center" sx={{ py: 3 }}>
												<CircularProgress size={24} color="inherit" />
											</TableCell>
										</TableRow>
									) : (
										entries.map((entry) => (
											<TableRow key={entry.public_id} hover>
												<TableCell>{entry.user?.username || entry.user?.full_name}</TableCell>
												<TableCell>
													<Chip label={entry.status.toUpperCase()} size="small" variant="outlined" />
												</TableCell>
												<TableCell>{entry.items.reduce((s, i) => s + i.hours, 0).toFixed(1)} h</TableCell>
												<TableCell>{entry.submitted_at ? new Date(entry.submitted_at).toLocaleString() : 'N/A'}</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
							<CustomTablePagination
								count={totalEntries}
								rowsPerPage={entryRowsPerPage}
								page={entryPage}
								onPageChange={(_, p) => setEntryPage(p)}
								onRowsPerPageChange={(e) => { setEntryRowsPerPage(parseInt(e.target.value, 10)); setEntryPage(0); }}
								onRowsPerPageSelectChange={(rows) => { setEntryRowsPerPage(rows); setEntryPage(0); }}
							/>
						</TableContainer>
					)}
				</Paper>
			</Container>
		</Box>
	);
};

export default DSRAdminOverview;
