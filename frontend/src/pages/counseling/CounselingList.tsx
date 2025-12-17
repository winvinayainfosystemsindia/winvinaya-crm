import React, { useState } from 'react';
import {
	Box,
	Container,
	Typography,
	Tabs,
	Tab,
	Snackbar,
	Alert
} from '@mui/material';
import CounselingTable from '../../components/counseling/CounselingTable';
import CounselingFormDialog from '../../components/counseling/form/CounselingFormDialog';
import CounselingStats from '../../components/counseling/CounselingStats';
import counselingService from '../../services/counselingService';
import type { CandidateListItem, CandidateCounselingCreate } from '../../models/candidate';
import candidateService from '../../services/candidateService';

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

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const showSnackbar = (message: string, severity: 'success' | 'error') => {
		setSnackbar({ open: true, message, severity });
	};

	const handleAction = async (action: 'counsel' | 'edit', candidate: CandidateListItem) => {
		if (action === 'counsel') {
			// New counseling
			setSelectedCandidate(candidate);
			setInitialFormData(undefined); // Reset form
			setDialogOpen(true);
		} else if (action === 'edit') {
			try {
				// Fetch full candidate details to get existing counseling data
				const fullCandidate = await candidateService.getById(candidate.public_id, true);
				setSelectedCandidate(fullCandidate);

				// Map existing counseling data to form format
				if (fullCandidate.counseling) {
					// Backend returns array of strings for skills? No, it returns list.
					// We need to type cast or ensure it matches
					setInitialFormData({
						...fullCandidate.counseling
					} as CandidateCounselingCreate);
				} else {
					setInitialFormData(undefined);
				}

				setDialogOpen(true);
			} catch (error) {
				showSnackbar('Failed to fetch candidate details', 'error');
			}
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
				// Update
				await counselingService.update(selectedCandidate.public_id, data);
				showSnackbar('Counseling updated successfully', 'success');
			} else {
				// Create
				await counselingService.create(selectedCandidate.public_id, data);
				showSnackbar('Counseling record created successfully', 'success');
			}
			setRefreshKey(prev => prev + 1); // Trigger table refresh
		} catch (error: any) {
			console.error("Counseling submit error", error);
			showSnackbar('Failed to save counseling record', 'error');
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
						sx={{ px: 2 }}
					>
						<Tab label="Pending Counseling" sx={{ textTransform: 'none', fontWeight: 500 }} />
						<Tab label="Counseled" sx={{ textTransform: 'none', fontWeight: 500 }} />
					</Tabs>
				</Box>

				{/* Tab Panels */}
				<TabPanel value={tabValue} index={0}>
					<CounselingTable
						type="pending"
						onAction={handleAction}
						refreshKey={refreshKey}
					/>
				</TabPanel>
				<TabPanel value={tabValue} index={1}>
					<CounselingTable
						type="counseled"
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
