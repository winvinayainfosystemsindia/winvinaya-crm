import React from 'react';
import {
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Typography,
    Box,
    Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { CandidateCreate } from '../../../models/candidate';

interface PersonalInfoStepProps {
    formData: CandidateCreate;
    onChange: (data: Partial<CandidateCreate>) => void;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
    formData,
    onChange,
}) => {
    const theme = useTheme();

    const handleChange = (field: keyof CandidateCreate) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange({
            [field]: event.target.value,
        });
    };

    const handleSelectChange = (field: keyof CandidateCreate) => (
        event: any
    ) => {
        onChange({
            [field]: event.target.value,
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
                }}
            >
                Personal Information
            </Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        required
                        fullWidth
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange('name')}
                        variant="outlined"
                        placeholder="Enter your full name"
                        helperText="As per official documents"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth required>
                        <InputLabel>Gender</InputLabel>
                        <Select
                            value={formData.gender}
                            label="Gender"
                            onChange={handleSelectChange('gender')}
                        >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                        </Select>
                        <FormHelperText>Select your gender</FormHelperText>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, color: theme.palette.text.secondary }}
                    >
                        Contact Information
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        required
                        fullWidth
                        type="email"
                        label="Email Address"
                        value={formData.email}
                        onChange={handleChange('email')}
                        variant="outlined"
                        placeholder="your.email@example.com"
                        helperText="We'll send important updates to this email"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        required
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange('phone')}
                        variant="outlined"
                        placeholder="10-digit mobile number"
                        inputProps={{ maxLength: 10 }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="WhatsApp Number"
                        value={formData.whatsapp_number}
                        onChange={handleChange('whatsapp_number')}
                        variant="outlined"
                        placeholder="Optional"
                        helperText="For quick communication"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        required
                        fullWidth
                        label="Pincode"
                        value={formData.pincode}
                        onChange={handleChange('pincode')}
                        variant="outlined"
                        placeholder="6-digit pincode"
                        inputProps={{ maxLength: 6 }}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography
                        variant="subtitle1"
                        sx={{ mb: 2, color: theme.palette.text.secondary }}
                    >
                        Parent/Guardian Information (Optional)
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="Parent/Guardian Name"
                        value={formData.parent_name}
                        onChange={handleChange('parent_name')}
                        variant="outlined"
                        placeholder="Optional"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        fullWidth
                        label="Parent/Guardian Phone"
                        value={formData.parent_phone}
                        onChange={handleChange('parent_phone')}
                        variant="outlined"
                        placeholder="Optional"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PersonalInfoStep;