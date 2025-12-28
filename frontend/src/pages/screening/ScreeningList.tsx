import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Typography,
	Tabs,
	Tab,
	Alert,
	Snackbar,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { fetchCandidateStats, createScreening, updateScreening, fetchCandidateById } from '../../store/slices/candidateSlice';
import ScreeningStatCard from '../../components/profiling/ScreeningStatCard';
import ScreeningTable from '../../components/profiling/ScreeningTable';
import ScreeningFormDialog from '../../components/profiling/form/ScreeningFormDialog';
import type { CandidateListItem, CandidateScreeningCreate } from '../../models/candidate';

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
			id={`screening-tabpanel-${index}`}
			aria-labelledby={`screening-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const ScreeningList: React.FC = () => {
	const dispatch = useAppDispatch();
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
	// Refresh key to trigger table reload
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		dispatch(fetchCandidateStats());
	}, [dispatch, refreshKey]);

	const showSnackbar = (message: string, severity: 'success' | 'error') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleAction = async (action: 'screen' | 'edit', candidate: CandidateListItem) => {
		if (action === 'screen') {
			setSelectedCandidate(candidate);
			setDialogOpen(true);
		} else if (action === 'edit') {
			try {
				const fullCandidate = await dispatch(fetchCandidateById({ publicId: candidate.public_id, withDetails: true })).unwrap();
				setSelectedCandidate(fullCandidate);
				setDialogOpen(true);
			} catch (error) {
				showSnackbar('Failed to fetch candidate details', 'error');
			}
		}
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setSelectedCandidate(null);
	};

	const handleScreeningSubmit = async (screeningData: CandidateScreeningCreate) => {
		try {
			if (selectedCandidate.screening) {
				// Update existing screening
				await dispatch(updateScreening({ publicId: selectedCandidate.public_id, screening: screeningData })).unwrap();
				showSnackbar('Screening updated successfully', 'success');
			} else {
				// Create new screening
				await dispatch(createScreening({ publicId: selectedCandidate.public_id, screening: screeningData })).unwrap();
				showSnackbar('Screening created successfully', 'success');
			}
			setRefreshKey(prev => prev + 1); // Trigger refetch of stats and tables
		} catch (error: any) {
			showSnackbar(error || 'Failed to save screening', 'error');
		}
	};

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
						Candidate Screening
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage candidate screening and assessment details
					</Typography>
				</Box>

				{/* Stats Cards */}
				<ScreeningStatCard />

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
						sx={{
							px: 2,
							'& .MuiTab-root': {
								textTransform: 'none',
								fontSize: '0.95rem',
								fontWeight: 500,
								minHeight: 48
							}
						}}
					>
						<Tab label="Not Screened" />
						<Tab label="Screened" />
					</Tabs>
				</Box>

				{/* Tab Panels */}
				<TabPanel value={tabValue} index={0}>
					<ScreeningTable
						key={`unscreened-${refreshKey}`} // Force re-mount on update
						type="unscreened"
						onAction={handleAction}
					/>
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					<ScreeningTable
						key={`screened-${refreshKey}`} // Force re-mount on update
						type="screened"
						onAction={handleAction}
					/>
				</TabPanel>

				{/* Screening Form Dialog */}
				<ScreeningFormDialog
					open={dialogOpen}
					onClose={handleDialogClose}
					onSubmit={handleScreeningSubmit}
					initialData={selectedCandidate?.screening}
					candidateName={selectedCandidate?.name}
					candidatePublicId={selectedCandidate?.public_id}
					existingDocuments={selectedCandidate?.documents}
				/>

				{/* Snackbar for notifications */}
				<Snackbar
					open={snackbar.open}
					autoHideDuration={4000}
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
				>
					<Alert
						onClose={() => setSnackbar({ ...snackbar, open: false })}
						severity={snackbar.severity}
						sx={{ width: '100%' }}
					>
						{snackbar.message}
					</Alert>
				</Snackbar>
			</Container>
		</Box>
	);
};

export default ScreeningList;
