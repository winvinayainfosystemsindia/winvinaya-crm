import React, { useEffect, useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Tabs,
	Tab,
	Stack,
	CircularProgress,
	Alert
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateById, clearSelectedCandidate } from '../../store/slices/candidateSlice';

import GeneralInfoTab from '../../components/candidates/detailedView/GeneralInfoTab';
import ScreeningTab from '../../components/candidates/detailedView/ScreeningTab';
import CounselingTab from '../../components/candidates/detailedView/CounselingTab';
import DocumentsTab from '../../components/candidates/detailedView/DocumentsTab';
import TrainingAllocationTab from '../../components/candidates/detailedView/TrainingAllocationTab';


const CandidateDetail: React.FC = () => {
	const { publicId } = useParams<{ publicId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { selectedCandidate: candidate, loading, error } = useAppSelector((state) => state.candidates);
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		if (publicId) {
			dispatch(fetchCandidateById({ publicId, withDetails: true }));
		}
		return () => {
			dispatch(clearSelectedCandidate());
		};
	}, [publicId, dispatch]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
				<CircularProgress size={40} thickness={4} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Alert severity="error" variant="outlined" sx={{ borderRadius: 0, borderLeft: '4px solid #d91d11' }}>
					{error}
				</Alert>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/candidates')} sx={{ mt: 2, textTransform: 'none' }}>
					Back to Candidates
				</Button>
			</Box>
		);
	}

	if (!candidate) return null;

	return (
		<Box sx={{ bgcolor: '#f2f3f3', minHeight: '100%', pb: 4 }}>
			{/* AWS Style Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', px: 3, py: 2 }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 600, fontSize: '1.75rem', mb: 0.5 }}>
							{candidate.name}
						</Typography>
						<Typography variant="body2" sx={{ color: '#aab7b8', fontStyle: 'italic' }}>
							ID: {candidate.public_id}
						</Typography>
					</Box>
					<Stack direction="row" spacing={1.5}>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={() => dispatch(fetchCandidateById({ publicId: publicId!, withDetails: true }))}
							sx={{
								color: 'white',
								borderColor: '#aab7b8',
								textTransform: 'none',
								'&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
							}}
						>
							Refresh
						</Button>
					</Stack>
				</Box>
			</Box>

			{/* Tabs Section */}
			<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: 'white' }}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					sx={{
						px: 3,
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 500,
							minWidth: 120,
							color: '#545b64',
							'&.Mui-selected': { color: '#ec7211' }
						},
						'& .MuiTabs-indicator': { bgcolor: '#ec7211' }
					}}
				>
					<Tab label="General information" id="tab-0" />
					<Tab label="Screening" id="tab-1" />
					<Tab label="Counseling" id="tab-2" />
					<Tab label="Documents" id="tab-3" />
					<Tab label="Training & Allocation" id="tab-4" />
				</Tabs>
			</Box>

			{/* Tab Content */}
			<Box sx={{ py: 2 }}>
				{tabValue === 0 && <GeneralInfoTab candidate={candidate} />}
				{tabValue === 1 && <ScreeningTab candidate={candidate} />}
				{tabValue === 2 && <CounselingTab candidate={candidate} />}
				{tabValue === 3 && <DocumentsTab candidate={candidate} />}
				{tabValue === 4 && <TrainingAllocationTab candidate={candidate} />}
			</Box>
		</Box>
	);
};

export default CandidateDetail;
