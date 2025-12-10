import React, { useState } from 'react';
import {
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Divider,
    IconButton,
} from '@mui/material';
import {
    Person as PersonIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Accessible as AccessibleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

// Import form steps
import PersonalInfoStep from './steps/PersonalInfoStep';
import EducationStep from './steps/EducationStep';
import ExperienceStep from './steps/ExperienceStep';
import DisabilityStep from './steps/DisabilityStep';
import SkillsStep from './steps/SkillsStep';
import ReviewStep from './steps/ReviewStep';

// Import types
import type { CandidateCreate } from '../../models/candidate';

// Initial form state
const initialFormData: CandidateCreate = {
    name: '',
    gender: '',
    email: '',
    phone: '',
    whatsapp_number: '',
    parent_name: '',
    parent_phone: '',
    pincode: '',
    is_experienced: false,
    currently_employed: false,
    education_details: {
        tenth: {
            school_name: '',
            year_of_passing: new Date().getFullYear(),
            percentage: 0,
        },
        twelfth_or_diploma: {
            institution_name: '',
            year_of_passing: new Date().getFullYear(),
            percentage: 0,
            type: '',
        },
        degrees: [],
    },
    disability_details: {
        is_disabled: false,
        disability_type: '',
        disability_percentage: 0,
    },
    skills: [],
};

const steps = [
    {
        label: 'Personal Information',
        icon: <PersonIcon />,
        description: 'Basic details and contact information',
    },
    {
        label: 'Education',
        icon: <SchoolIcon />,
        description: 'Educational qualifications',
    },
    {
        label: 'Experience',
        icon: <WorkIcon />,
        description: 'Work experience details',
    },
    {
        label: 'Disability',
        icon: <AccessibleIcon />,
        description: 'Disability information (if applicable)',
    },
    {
        label: 'Skills',
        icon: <CheckCircleIcon />,
        description: 'Add your skills and competencies',
    },
    {
        label: 'Review & Submit',
        icon: <CheckCircleIcon />,
        description: 'Review all information and submit',
    },
];

interface CandidateRegistrationFormProps {
    onSubmit?: (data: CandidateCreate) => void;
    onCancel?: () => void;
    initialData?: Partial<CandidateCreate>;
}

const CandidateRegistrationForm: React.FC<CandidateRegistrationFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
}) => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [errorSteps, setErrorSteps] = useState<Set<number>>(new Set());
    const [formData, setFormData] = useState<CandidateCreate>({
        ...initialFormData,
        ...initialData,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Validation functions for each step
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 0: // Personal Info
                return !!(
                    formData.name &&
                    formData.email &&
                    formData.phone &&
                    formData.gender &&
                    formData.pincode &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
                    /^\d{10}$/.test(formData.phone.replace(/\D/g, ''))
                );
            case 1: // Education
                return !!(
                    formData.education_details?.tenth?.school_name &&
                    formData.education_details?.tenth?.year_of_passing &&
                    formData.education_details?.tenth?.percentage > 0
                );
            case 2: // Experience
                // Always valid - all fields optional
                return true;
            case 3: // Disability
                if (formData.disability_details?.is_disabled) {
                    return !!(
                        formData.disability_details.disability_type &&
                        (formData.disability_details.disability_percentage ?? 0) > 0
                    );
                }
                return true;
            case 4: // Skills
                return formData.skills.length > 0;
            default:
                return true;
        }
    };

    const handleNext = () => {
        const isValid = validateStep(activeStep);

        if (isValid) {
            setCompletedSteps(prev => new Set(prev).add(activeStep));
            setErrorSteps(prev => {
                const next = new Set(prev);
                next.delete(activeStep);
                return next;
            });
            setActiveStep((prevStep) => prevStep + 1);
            setSubmitError(null);
        } else {
            setErrorSteps(prev => new Set(prev).add(activeStep));
            setSubmitError('Please fill all required fields correctly before proceeding.');
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
        setSubmitError(null);
    };

    const handleStepClick = (step: number) => {
        // Allow navigation to completed steps or previous steps
        if (step < activeStep || completedSteps.has(step)) {
            setActiveStep(step);
            setSubmitError(null);
        }
    };

    const handleFormDataChange = (data: Partial<CandidateCreate>) => {
        setFormData(prev => {
            const updated = { ...prev };

            // Handle nested education_details properly
            if (data.education_details) {
                updated.education_details = {
                    tenth: data.education_details.tenth || prev.education_details?.tenth || initialFormData.education_details!.tenth,
                    twelfth_or_diploma: data.education_details.twelfth_or_diploma || prev.education_details?.twelfth_or_diploma || initialFormData.education_details!.twelfth_or_diploma,
                    degrees: data.education_details.degrees !== undefined ? data.education_details.degrees : (prev.education_details?.degrees || []),
                };
            }

            // Handle nested disability_details properly
            if (data.disability_details) {
                updated.disability_details = {
                    ...prev.disability_details,
                    ...data.disability_details,
                };
            }

            // Handle other fields
            Object.keys(data).forEach(key => {
                if (key !== 'education_details' && key !== 'disability_details') {
                    (updated as any)[key] = (data as any)[key];
                }
            });

            return updated;
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Validate all steps
            const allValid = steps.every((_, index) => validateStep(index));

            if (!allValid) {
                const invalidSteps = steps
                    .map((_, index) => index)
                    .filter(index => !validateStep(index));
                setErrorSteps(new Set(invalidSteps));
                setActiveStep(invalidSteps[0]);
                throw new Error('Please complete all required fields before submitting.');
            }

            // Submit the form
            if (onSubmit) {
                await onSubmit(formData);
            }

            // Mark all steps as completed
            setCompletedSteps(new Set(steps.map((_, index) => index)));
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepContent = (step: number) => {
        const baseProps = {
            formData,
            onChange: handleFormDataChange,
        };

        switch (step) {
            case 0:
                return <PersonalInfoStep {...baseProps} />;
            case 1:
                return <EducationStep {...baseProps} />;
            case 2:
                return <ExperienceStep {...baseProps} />;
            case 3:
                return <DisabilityStep {...baseProps} />;
            case 4:
                return <SkillsStep {...baseProps} />;
            case 5:
                return <ReviewStep formData={formData} />;
            default:
                return <Typography>Unknown step</Typography>;
        }
    };

    const StepIcon = ({ active, completed, error, icon }: any) => {
        const theme = useTheme();

        return (
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: error
                        ? theme.palette.error.main
                        : completed
                            ? theme.palette.primary.main
                            : active
                                ? theme.palette.secondary.main
                                : theme.palette.grey[300],
                    color: error || completed || active ? '#fff' : theme.palette.text.secondary,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                        transform: 'scale(1.05)',
                    },
                }}
            >
                {error ? (
                    <ErrorIcon />
                ) : completed ? (
                    <CheckCircleIcon />
                ) : (
                    React.cloneElement(steps[icon].icon, {
                        sx: { fontSize: 24 },
                    })
                )}
            </Box>
        );
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 700,
                    mb: 4,
                }}
            >
                Candidate Registration
            </Typography>

            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 4 }}
            >
                Please complete all steps to register as a candidate. All fields marked with * are required.
            </Typography>

            <Stepper
                activeStep={activeStep}
                orientation="horizontal"
                alternativeLabel
                sx={{
                    mb: 4,
                    '& .MuiStepLabel-alternativeLabel': {
                        mt: 1,
                    },
                    '& .MuiStepConnector-line': {
                        borderColor: theme.palette.divider,
                    },
                }}
            >
                {steps.map((step, index) => (
                    <Step
                        key={step.label}
                        completed={completedSteps.has(index)}
                        sx={{
                            cursor: index < activeStep || completedSteps.has(index) ? 'pointer' : 'default',
                        }}
                        onClick={() => handleStepClick(index)}
                    >
                        <StepLabel
                            StepIconComponent={(props) => (
                                <StepIcon
                                    {...props}
                                    error={errorSteps.has(index)}
                                    icon={index}
                                />
                            )}
                            optional={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: errorSteps.has(index)
                                            ? theme.palette.error.main
                                            : theme.palette.text.secondary,
                                        fontWeight: errorSteps.has(index) ? 600 : 400,
                                    }}
                                >
                                    {step.description}
                                </Typography>
                            }
                            error={errorSteps.has(index)}
                            sx={{
                                '& .MuiStepLabel-label': {
                                    color: errorSteps.has(index)
                                        ? theme.palette.error.main
                                        : activeStep === index
                                            ? theme.palette.primary.main
                                            : theme.palette.text.primary,
                                    fontWeight: activeStep === index ? 600 : 400,
                                    '&.Mui-completed': {
                                        color: theme.palette.primary.main,
                                    },
                                },
                            }}
                        >
                            {step.label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Divider sx={{ mb: 4 }} />

            {submitError && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => setSubmitError(null)}
                        >
                            <ErrorIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    {submitError}
                </Alert>
            )}

            <Box sx={{ mb: 4 }}>
                {getStepContent(activeStep)}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Button
                    onClick={onCancel || handleBack}
                    disabled={activeStep === 0}
                    variant="outlined"
                    sx={{
                        color: theme.palette.text.secondary,
                        borderColor: theme.palette.divider,
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                        },
                    }}
                >
                    {onCancel && activeStep === 0 ? 'Cancel' : 'Back'}
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Step {activeStep + 1} of {steps.length}
                    </Typography>

                    {activeStep === steps.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={isSubmitting}
                            startIcon={
                                isSubmitting ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <CheckCircleIcon />
                                )
                            }
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                        </Button>
                    ) : (
                        <Button
                            onClick={handleNext}
                            variant="contained"
                            endIcon={<CheckCircleIcon />}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Box>

            {activeStep < steps.length - 1 && (
                <Alert
                    severity="info"
                    icon={<InfoIcon />}
                    sx={{ mt: 3 }}
                >
                    <Typography variant="body2">
                        <strong>Tip:</strong> You can click on completed steps to navigate back and edit information.
                    </Typography>
                </Alert>
            )}
        </Paper>
    );
};

export default CandidateRegistrationForm;