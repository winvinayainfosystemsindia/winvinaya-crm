import React from 'react';
import {
    Grid,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Alert,
    TextField,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { CandidateCreate } from '../../../models/candidate';
import { Work as WorkIcon, Business as BusinessIcon } from '@mui/icons-material';

interface ExperienceStepProps {
    formData: CandidateCreate;
    onChange: (data: Partial<CandidateCreate>) => void;
}

const ExperienceStep: React.FC<ExperienceStepProps> = ({
    formData,
    onChange,
}) => {
    const theme = useTheme();

    const handleSwitchChange = (field: keyof CandidateCreate) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange({
            [field]: event.target.checked,
        });
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <WorkIcon /> Work Experience
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
                This information helps us understand your background better. You can skip this section if you don't have any work experience.
            </Alert>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                    <Box
                        sx={{
                            p: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_experienced}
                                    onChange={handleSwitchChange('is_experienced')}
                                    color="primary"
                                />
                            }
                            label={
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        Do you have any work experience?
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Select 'Yes' if you have formal work experience
                                    </Typography>
                                </Box>
                            }
                            sx={{ ml: 0 }}
                        />
                    </Box>
                </Grid>

                {formData.is_experienced && (
                    <>
                        <Grid size={{ xs: 12 }}>
                            <Box
                                sx={{
                                    p: 3,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 2,
                                    backgroundColor: theme.palette.background.default,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.currently_employed}
                                            onChange={handleSwitchChange('currently_employed')}
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                Are you currently employed?
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                This helps us understand your availability
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ ml: 0 }}
                                />
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    mb: 2,
                                    color: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <BusinessIcon /> Additional Information (Optional)
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Experience Details"
                                placeholder="Briefly describe your work experience, roles, responsibilities, and achievements..."
                                variant="outlined"
                                helperText="You can add this information later in your profile"
                            />
                        </Grid>
                    </>
                )}

                {!formData.is_experienced && (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="success">
                            <Typography variant="body2">
                                No problem! Many opportunities are available for freshers. Focus on highlighting your education and skills in the next steps.
                            </Typography>
                        </Alert>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default ExperienceStep;