import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Typography,
	Tabs,
	Tab,
	Alert,
	Snackbar
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import { fetchCandidateStats, createProfile, updateProfile } from '../../store/slices/candidateSlice';
import ProfileStatCard from '../../components/profiling/ProfileStatCard';
import ProfileTable from '../../components/profiling/ProfileTable';
import ProfileFormDialog from '../../components/profiling/form/ProfileFormDialog';
import candidateService from '../../services/candidateService';
import type { CandidateListItem, CandidateProfileCreate } from '../../models/candidate';

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
			id={`profiling-tabpanel-${index}`}
			aria-labelledby={`profiling-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

const ProfileList: React.FC = () => {
	const dispatch = useAppDispatch();
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

	const handleAction = async (action: 'profile' | 'edit', candidate: CandidateListItem) => {
		if (action === 'profile') {
			setSelectedCandidate(candidate);
			setDialogOpen(true);
		} else if (action === 'edit') {
			try {
				const fullCandidate = await candidateService.getById(candidate.public_id, true);
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

	const handleProfileSubmit = async (profileData: CandidateProfileCreate) => {
		try {
			if (selectedCandidate.profile) {
				// Update existing profile
				await dispatch(updateProfile({ publicId: selectedCandidate.public_id, profile: profileData })).unwrap();
				showSnackbar('Profile updated successfully', 'success');
			} else {
				// Create new profile
				await dispatch(createProfile({ publicId: selectedCandidate.public_id, profile: profileData })).unwrap();
				showSnackbar('Profile created successfully', 'success');
			}
			setRefreshKey(prev => prev + 1); // Trigger refetch of stats and tables
		} catch (error: any) {
			showSnackbar(error || 'Failed to save profile', 'error');
		}
	};

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				{/* Page Header */}
				<Box sx={{ mb: 4 }}>
					<Typography
						variant="h4"
						component="h1"
						sx={{
							fontWeight: 300,
							color: '#232f3e',
							mb: 0.5
						}}
					>
						Candidate Profiling
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Manage candidate profiles and training details
					</Typography>
				</Box>

				{/* Stats Cards */}
				<ProfileStatCard />

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
							borderBottom: '1px solid #e0e0e0',
							px: 2,
							'& .MuiTab-root': {
								textTransform: 'none',
								fontSize: '0.95rem',
								fontWeight: 500,
								minHeight: 48
							}
						}}
					>
						<Tab label="Not Profiled" />
						<Tab label="Profiled" />
					</Tabs>

					{/* Tab Panels */}
					<Box sx={{ bgcolor: '#ffffff', borderRadius: '0 0 8px 8px' }}>
						<TabPanel value={tabValue} index={0}>
							<ProfileTable
								key={`unprofiled-${refreshKey}`} // Force re-mount on update
								type="unprofiled"
								onAction={handleAction}
							/>
						</TabPanel>
						<TabPanel value={tabValue} index={1}>
							<ProfileTable
								key={`profiled-${refreshKey}`} // Force re-mount on update
								type="profiled"
								onAction={handleAction}
							/>
						</TabPanel>
					</Box>
				</Box>

				{/* Profile Form Dialog */}
				<ProfileFormDialog
					open={dialogOpen}
					onClose={handleDialogClose}
					onSubmit={handleProfileSubmit}
					initialData={selectedCandidate?.profile}
					candidateName={selectedCandidate?.name}
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

export default ProfileList;
