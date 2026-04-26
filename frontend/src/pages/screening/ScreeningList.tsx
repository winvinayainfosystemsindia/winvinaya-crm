import React, { useState, useEffect } from 'react';
import {
	Box,
	Container,
	Tabs,
	Tab,
	useTheme
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchScreeningStats, createScreening, updateScreening, fetchCandidateById } from '../../store/slices/candidateSlice';
import ScreeningStatCard from '../../components/screening/stats/ScreeningStatCard';
import ScreeningTable from '../../components/screening/table/ScreeningTable';
import ScreeningFormDialog from '../../components/screening/dialogs/ScreeningFormDialog';
import PageHeader from '../../components/common/page-header';
import useToast from '../../hooks/useToast';
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
	const { screeningStats: stats } = useAppSelector((state) => state.candidates);
	const theme = useTheme();
	const toast = useToast();
	const [tabValue, setTabValue] = useState(0);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
	// Refresh key to trigger table reload
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		dispatch(fetchScreeningStats());
	}, [dispatch, refreshKey]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleAction = async (_action: 'screen' | 'edit', candidate: CandidateListItem) => {
		try {
			const fullCandidate = await dispatch(fetchCandidateById({ publicId: candidate.public_id, withDetails: true })).unwrap();
			setSelectedCandidate(fullCandidate);
			setDialogOpen(true);
		} catch (error) {
			toast.error(`Failed to fetch candidate details: ${error}`);
		}
	};

	const handleDialogClose = () => {
		setDialogOpen(false);
		setSelectedCandidate(null);
	};

	const handleRefreshCandidate = async () => {
		if (!selectedCandidate) return;
		try {
			const fullCandidate = await dispatch(fetchCandidateById({ publicId: selectedCandidate.public_id, withDetails: true })).unwrap();
			setSelectedCandidate(fullCandidate);
		} catch (error) {
			toast.error(`Failed to refresh candidate: ${error}`);
		}
	};

	const handleScreeningSubmit = async (screeningData: CandidateScreeningCreate) => {
		try {
			if (selectedCandidate.screening) {
				// Update existing screening
				await dispatch(updateScreening({ publicId: selectedCandidate.public_id, screening: screeningData })).unwrap();
				toast.success('Screening updated successfully');
			} else {
				// Create new screening
				await dispatch(createScreening({ publicId: selectedCandidate.public_id, screening: screeningData })).unwrap();
				toast.success('Screening created successfully');
			}
			setRefreshKey(prev => prev + 1); // Trigger refetch of stats and tables
		} catch (error: any) {
			toast.error(error || 'Failed to save screening');
		}
	};

	// Helper to get count for a status safely
	const getCount = (status: string) => {
		if (!stats?.screening_distribution) return 0;
		// Special handling for 'Other' if we wanted to aggregate, but for now exact match
		return stats.screening_distribution[status] || 0;
	};

	// 'Other' tab logic: Sum of remaining statuses excluding the main ones? 


	const renderTabLabel = (label: string, count: number) => (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			{label}
			<Box
				component="span"
				sx={{
					bgcolor: theme.palette.mode === 'dark' ? 'action.selected' : 'grey.200',
					color: 'text.primary',
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
		<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
			<PageHeader
				title="Candidate Screening"
				subtitle="Manage candidate screening and assessment details"
			/>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				{/* Stats Cards */}
				<ScreeningStatCard />

				{/* Tab Section */}
				<Box>
					<Box
						sx={{
							bgcolor: 'background.paper',
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: '8px 8px 0 0'
						}}
					>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							variant="scrollable"
							scrollButtons="auto"
							allowScrollButtonsMobile
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
							<Tab label={renderTabLabel("Not Screened", stats?.not_screened || 0)} />
							<Tab label={renderTabLabel("In Progress", getCount('In Progress'))} />
							<Tab label={renderTabLabel("Completed", getCount('Completed'))} />
							<Tab label={renderTabLabel("Rejected", getCount('Rejected'))} />
						</Tabs>
					</Box>

					{/* Tab Panels */}
					<TabPanel value={tabValue} index={0}>
						<ScreeningTable
							type="unscreened"
							onAction={handleAction}
							refreshTrigger={refreshKey}
						/>
					</TabPanel>
					<TabPanel value={tabValue} index={1}>
						<ScreeningTable
							type="screened"
							status="In Progress"
							onAction={handleAction}
							refreshTrigger={refreshKey}
						/>
					</TabPanel>
					<TabPanel value={tabValue} index={2}>
						<ScreeningTable
							type="screened"
							status="Completed"
							onAction={handleAction}
							refreshTrigger={refreshKey}
						/>
					</TabPanel>
					<TabPanel value={tabValue} index={3}>
						<ScreeningTable
							type="screened"
							status="Rejected"
							onAction={handleAction}
							refreshTrigger={refreshKey}
						/>
					</TabPanel>
				</Box>
			</Box>

			{/* Screening Form Dialog */}
			<ScreeningFormDialog
				open={dialogOpen}
				onClose={handleDialogClose}
				onSubmit={handleScreeningSubmit}
				initialData={selectedCandidate?.screening}
				candidateName={selectedCandidate?.name}
				candidatePublicId={selectedCandidate?.public_id}
				candidateGuardianDetails={selectedCandidate?.guardian_details}
				existingDocuments={selectedCandidate?.documents}
				onRefresh={handleRefreshCandidate}
			/>
		</Container>
	);
};

export default ScreeningList;
