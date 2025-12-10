import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Alert,
    Snackbar,
    Typography,
} from '@mui/material';
import CandidateRegistrationForm from '../../components/candidates/CandidateRegistrationForm';
import candidateService from '../../services/candidateService';
import type { CandidateCreate } from '../../models/candidate';

const CandidateRegistration: React.FC = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (data: CandidateCreate) => {
        try {
            // Call the API to create the candidate
            const createdCandidate = await candidateService.create(data);

            // Show success message
            setShowSuccess(true);

            // Optionally navigate to a success page or candidate list after a delay
            setTimeout(() => {
                navigate('/'); // Navigate to home or candidate list
            }, 2000);

            console.log('Candidate created successfully:', createdCandidate);
        } catch (error: any) {
            console.error('Error creating candidate:', error);

            // Extract error message from the response
            const message = error.response?.data?.detail ||
                error.message ||
                'Failed to create candidate. Please try again.';

            setErrorMessage(message);
            setShowError(true);

            // Re-throw the error so the form can handle it
            throw new Error(message);
        }
    };

    const handleCancel = () => {
        // Navigate back to home or previous page
        navigate('/');
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
    };

    const handleCloseError = () => {
        setShowError(false);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        mb: 2,
                    }}
                >
                    Welcome to Candidate Registration
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}
                >
                    Please fill out the form below to register as a candidate.
                    All required fields must be completed before submission.
                </Typography>
            </Box>

            <CandidateRegistrationForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
            />

            {/* Success Snackbar */}
            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSuccess}
                    severity="success"
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    Registration successful! Redirecting...
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseError}
                    severity="error"
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {errorMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CandidateRegistration;
