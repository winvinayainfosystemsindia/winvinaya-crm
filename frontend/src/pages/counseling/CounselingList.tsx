import React, { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Tabs,
	Tab,
	Snackbar,
	Alert,
	useTheme,
	useMediaQuery
} from '@mui/material';
import CounselingTable from '../../components/counseling/CounselingTable';
import CounselingFormDialog from '../../components/counseling/form/CounselingFormDialog';
import CounselingStats from '../../components/counseling/CounselingStats';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCounseling, updateCounseling, fetchCandidateById, fetchCandidateStats } from '../../store/slices/candidateSlice';
import type { CandidateListItem, CandidateCounselingCreate } from '../../models/candidate';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`counseling-tabpanel-${index}`}
			aria-labelledby={`counseling-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const CounselingList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { stats } = useAppSelector((state) => state.candidates);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [tabValue, setTabValue] = useState(0);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success'
	});
	const [refreshKey, setRefreshKey] = useState(0);
	const [initialFormData, setInitialFormData] = useState<CandidateCounselingCreate | undefined>(undefined);

	// Fetch stats on mount and refresh
	React.useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch, refreshKey]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const showSnackbar = (message: string, severity: 'success' | 'error') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleAction = async (action: 'counsel' | 'edit', candidate: CandidateListItem) => {
		try {
			// Fetch full candidate details to get existing counseling/work experience data
			const resultAction = await dispatch(fetchCandidateById({ publicId: candidate.public_id, withDetails: true }));

			if (fetchCandidateById.fulfilled.match(resultAction)) {
				const fullCandidate = resultAction.payload;
				setSelectedCandidate(fullCandidate);

				if (action === 'counsel') {
					setInitialFormData(undefined); // Reset form
				} else if (action === 'edit' && fullCandidate.counseling) {
					setInitialFormData({
						...fullCandidate.counseling
					} as CandidateCounselingCreate);
				} else {
					setInitialFormData(undefined);
				}
				setDialogOpen(true);
			} else {
				showSnackbar('Failed to fetch candidate details', 'error');
			}
		} catch (error) {
			showSnackbar('An error occurred while fetching details', 'error');
		}
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setSelectedCandidate(null);
		setInitialFormData(undefined);
	};

	const handleFormSubmit = async (data: CandidateCounselingCreate) => {
		try {
			if (selectedCandidate.counseling) {
				// Update via Redux
				await dispatch(updateCounseling({
					publicId: selectedCandidate.public_id,
					counseling: data
				})).unwrap();
				showSnackbar('Counseling updated successfully', 'success');
			} else {
				// Create via Redux
				await dispatch(createCounseling({
					publicId: selectedCandidate.public_id,
					counseling: data
				})).unwrap();
				showSnackbar('Counseling record created successfully', 'success');
			}
			setRefreshKey(prev => prev + 1); // Trigger table refresh
		} catch (error: any) {
			console.error("Counseling submit error", error);
			showSnackbar(error || 'Failed to save counseling record', 'error');
		}
	};

	// Helper to get count for a status safely
	const getCount = (status: string) => {
		if (!stats?.counseling_distribution) return 0;
		return stats.counseling_distribution[status] || 0;
	};

	const renderTabLabel = (label: string, count: number) => (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			{label}
			<Box
				component="span"
				sx={{
					bgcolor: '#e0e0e0',
					color: '#424242',
					px: 0.8,
					py: 0.2,
					borderRadius: '12px',
					fontSize: '0.75rem',
					fontWeight: 600
				}}
			>
				{count}
			</Box>
		</Box>
	);

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: isMobile ? 2 : 3 }}>
			<Container maxWidth="xl" sx={{ px: isMobile ? 1 : { sm: 2, md: 3 } }}>
				{/* Page Header */}
				<Box sx={{ mb: 4 }}>
					<Typography
						variant={isMobile ? "h5" : "h4"}
						component="h1"
						sx={{
							fontWeight: 300,
							color: '#232f3e',
							mb: 0.5
						}}
					>
						Candidate Counseling
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Assess and counsel profiled candidates
					</Typography>
				</Box>

				{/* Stats Section */}
				<CounselingStats />

				{/* Tab Navigation */}
				<Box
					sx={{
						bgcolor: '#ffffff',
						border: '1px solid #e0e0e0',
						borderRadius: '8px 8px 0 0',
						mt: 3
					}}
				>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						textColor="primary"
						indicatorColor="primary"
						variant="scrollable"
						scrollButtons="auto"
						allowScrollButtonsMobile
						sx={{ px: 2 }}
					>
						<Tab label={renderTabLabel("Not Counseled", (stats?.screening_distribution?.['Completed'] || 0) - (getCount('selected') + getCount('rejected') + getCount('pending')))} sx={{ textTransform: 'none', fontWeight: 500 }} />
						<Tab label={renderTabLabel("On Hold", getCount('pending'))} sx={{ textTransform: 'none', fontWeight: 500 }} />
						<Tab label={renderTabLabel("Selected", getCount('selected'))} sx={{ textTransform: 'none', fontWeight: 500 }} />
						<Tab label={renderTabLabel("Rejected", getCount('rejected'))} sx={{ textTransform: 'none', fontWeight: 500 }} />
					</Tabs>
				</Box>

				{/* Tab Panels */}
				<TabPanel value={tabValue} index={0}>
					<CounselingTable
						type="not_counseled"
						onAction={handleAction}
						refreshKey={refreshKey}
					/>
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					<CounselingTable
						type="pending"
						onAction={handleAction}
						refreshKey={refreshKey}
					/>
				</TabPanel>
				<TabPanel value={tabValue} index={2}>
					<CounselingTable
						type="selected"
						onAction={handleAction}
						refreshKey={refreshKey}
					/>
				</TabPanel>
				<TabPanel value={tabValue} index={3}>
					<CounselingTable
						type="rejected"
						onAction={handleAction}
						refreshKey={refreshKey}
					/>
				</TabPanel>
			</Container>

			{/* Form Dialog */}
			<CounselingFormDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				onSubmit={handleFormSubmit}
				initialData={initialFormData}
				candidateName={selectedCandidate?.name}
				candidateWorkExperience={selectedCandidate?.work_experience}
			/>

			{/* Snackbar */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: '100%' }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Box>
	);
};

export default CounselingList;
