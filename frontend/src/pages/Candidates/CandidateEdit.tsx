import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Alert,
	Button
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import CandidateRegistrationForm from '../../components/candidates/forms/CandidateRegistrationForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateById, updateCandidate, clearSelectedCandidate } from '../../store/slices/candidateSlice';
import type { CandidateUpdate } from '../../models/candidate';
import ModuleLayout from '../../components/common/layout/ModuleLayout';

const CandidateEdit: React.FC = () => {
	const { publicId } = useParams<{ publicId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { selectedCandidate: candidate, loading, error } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		if (publicId) {
			dispatch(fetchCandidateById({ publicId, withDetails: true }));
		}
		return () => {
			dispatch(clearSelectedCandidate());
		};
	}, [publicId, dispatch]);

	const handleSubmit = async (data: any) => {
		if (!publicId) return;

		try {
			await dispatch(updateCandidate({ publicId, data: data as CandidateUpdate })).unwrap();
			navigate('/candidates/list');
		} catch (error: any) {
			console.error('Error updating candidate:', error);
			throw error;
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	if (error) {
		return (
			<Box sx={{ p: 4 }}>
				<Alert severity="error" variant="outlined" sx={{ borderRadius: 0, borderLeft: '4px solid #d91d11' }}>
					{error}
				</Alert>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/candidates/list')} sx={{ mt: 2 }}>
					Back to Candidates
				</Button>
			</Box>
		);
	}

	const headerExtra = (
		<Button
			variant="outlined"
			startIcon={<ArrowBackIcon />}
			onClick={() => navigate(-1)}
			sx={{
				color: 'white',
				borderColor: 'rgba(255,255,255,0.3)',
				textTransform: 'none',
				fontWeight: 600,
				'&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
			}}
		>
			Back
		</Button>
	);

	return (
		<ModuleLayout
			title={candidate ? `Edit Candidate: ${candidate.name}` : 'Edit Candidate'}
			subtitle="Update candidate profile information across all sections."
			headerExtra={headerExtra}
			loading={loading}
			isEmpty={!loading && !candidate}
		>
			{candidate && (
				<Box sx={{ maxWidth: 1000, mx: 'auto' }}>
					<CandidateRegistrationForm
						initialData={candidate}
						onSubmit={handleSubmit}
						onCancel={handleCancel}
					/>
				</Box>
			)}
		</ModuleLayout>
	);
};

export default CandidateEdit;
