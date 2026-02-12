import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Container,
	Box,
	Typography,
	Alert,
	CircularProgress,
	Button
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import CandidateRegistrationForm from '../../components/candidates/CandidateRegistrationForm';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCandidateById, updateCandidate, clearSelectedCandidate } from '../../store/slices/candidateSlice';
import type { CandidateUpdate } from '../../models/candidate';

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
			// Map the form data to CandidateUpdate type
			// Note: CandidateRegistrationForm uses CandidateCreate which is a superset of CandidateUpdate
			await dispatch(updateCandidate({ publicId, data: data as CandidateUpdate })).unwrap();

			// Navigate back to history or list
			navigate('/candidates/list');
		} catch (error: any) {
			console.error('Error updating candidate:', error);
			throw error; // Re-throw to be handled by the form
		}
	};

	const handleCancel = () => {
		navigate(-1);
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
				<CircularProgress size={40} thickness={4} />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="lg" sx={{ py: 4 }}>
				<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/candidates/list')}>
					Back to Candidates
				</Button>
			</Container>
		);
	}

	if (!candidate) return null;

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Button
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate(-1)}
					sx={{ mb: 2, textTransform: 'none' }}
				>
					Back
				</Button>
				<Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
					Edit Candidate: {candidate.name}
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Update candidate profile information across all sections.
				</Typography>
			</Box>

			<CandidateRegistrationForm
				initialData={candidate}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
			/>
		</Container>
	);
};

export default CandidateEdit;
