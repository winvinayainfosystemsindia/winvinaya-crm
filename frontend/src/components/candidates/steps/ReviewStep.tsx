import React from 'react';
import {
    Typography,
    Box,
    Paper,
    Stack,
    Divider,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Grid,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    School as SchoolIcon,
    Work as WorkIcon,
    Accessible as AccessibleIcon,
    CheckCircle as CheckCircleIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { CandidateCreate } from '../../../models/candidate';

interface ReviewStepProps {
    formData: CandidateCreate;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
    const theme = useTheme();

    const formatDate = (year: number) => {
        return year.toString();
    };

    const formatPercentage = (percentage: number) => {
        return `${percentage}%`;
    };

    return (
        <Box>
            <Typography
                variant="h6"
                gutterBottom
                sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 600,
                    mb: 3,
                }}
            >
                Review Your Information
            </Typography>

            <Alert severity="warning" sx={{ mb: 4 }}>
                Please review all information carefully before submitting. You can go back to any step to make changes.
            </Alert>

            <Stack spacing={4}>
                {/* Personal Information */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon /> Personal Information
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" color="text.secondary">Name</Typography>
                            <Typography variant="body1">{formData.name}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" color="text.secondary">Gender</Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>{formData.gender}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" color="text.secondary">Email</Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon fontSize="small" /> {formData.email}
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" color="text.secondary">Phone</Typography>
                            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon fontSize="small" /> {formData.phone}
                            </Typography>
                        </Grid>
                        {formData.whatsapp_number && (
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="body2" color="text.secondary">WhatsApp</Typography>
                                <Typography variant="body1">{formData.whatsapp_number}</Typography>
                            </Grid>
                        )}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" color="text.secondary">Pincode</Typography>
                            <Typography variant="body1">{formData.pincode}</Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Education Information */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SchoolIcon /> Education Details
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>10th Standard</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">School</Typography>
                                <Typography variant="body1">{formData.education_details?.tenth?.school_name}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">Year of Passing</Typography>
                                <Typography variant="body1">{formatDate(formData.education_details?.tenth?.year_of_passing || 0)}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body2" color="text.secondary">Percentage</Typography>
                                <Typography variant="body1">{formatPercentage(formData.education_details?.tenth?.percentage || 0)}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {formData.education_details?.twelfth_or_diploma?.institution_name && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {formData.education_details.twelfth_or_diploma.type === 'diploma' ? 'Diploma' : '12th Standard'}
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" color="text.secondary">Institution</Typography>
                                    <Typography variant="body1">{formData.education_details.twelfth_or_diploma.institution_name}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" color="text.secondary">Year of Passing</Typography>
                                    <Typography variant="body1">{formatDate(formData.education_details.twelfth_or_diploma.year_of_passing)}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" color="text.secondary">Percentage</Typography>
                                    <Typography variant="body1">{formatPercentage(formData.education_details.twelfth_or_diploma.percentage)}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {formData.education_details?.degrees && formData.education_details.degrees.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>Degrees</Typography>
                            <List>
                                {formData.education_details.degrees.map((degree, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemIcon>
                                            <CircleIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${degree.degree_name} in ${degree.specialization}`}
                                            secondary={`${degree.college_name} | ${formatDate(degree.year_of_passing)} | ${formatPercentage(degree.percentage)}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Paper>

                {/* Experience */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkIcon /> Work Experience
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={3}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Has Experience</Typography>
                            <Chip
                                label={formData.is_experienced ? 'Yes' : 'No'}
                                color={formData.is_experienced ? 'success' : 'default'}
                                size="small"
                            />
                        </Box>
                        {formData.is_experienced && (
                            <Box>
                                <Typography variant="body2" color="text.secondary">Currently Employed</Typography>
                                <Chip
                                    label={formData.currently_employed ? 'Yes' : 'No'}
                                    color={formData.currently_employed ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>
                        )}
                    </Stack>
                </Paper>

                {/* Disability */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessibleIcon /> Disability Information
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={3}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Has Disability</Typography>
                            <Chip
                                label={formData.disability_details?.is_disabled ? 'Yes' : 'No'}
                                color={formData.disability_details?.is_disabled ? 'warning' : 'default'}
                                size="small"
                            />
                        </Box>
                        {formData.disability_details?.is_disabled && (
                            <>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Type</Typography>
                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                        {formData.disability_details.disability_type}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">Percentage</Typography>
                                    <Typography variant="body1">{formData.disability_details.disability_percentage}%</Typography>
                                </Box>
                            </>
                        )}
                    </Stack>
                </Paper>

                {/* Skills */}
                <Paper variant="outlined" sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon /> Skills
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {formData.skills.length > 0 ? (
                            formData.skills.map((skill, index) => (
                                <Chip
                                    key={index}
                                    label={skill}
                                    size="small"
                                    sx={{
                                        backgroundColor: theme.palette.primary.light,
                                        color: '#fff',
                                    }}
                                />
                            ))
                        ) : (
                            <Typography color="text.secondary">No skills added</Typography>
                        )}
                    </Box>
                </Paper>

                <Alert severity="success">
                    <Typography variant="body2">
                        <strong>Ready to submit?</strong> If all information is correct, click "Submit Registration" below. You will receive a confirmation email once your registration is processed.
                    </Typography>
                </Alert>
            </Stack>
        </Box>
    );
};

export default ReviewStep;