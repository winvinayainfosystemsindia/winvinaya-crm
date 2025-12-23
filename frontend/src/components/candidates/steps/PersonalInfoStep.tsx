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

    const handleGuardianChange = (field: keyof NonNullable<CandidateCreate['guardian_details']>) => (
        event: any
    ) => {
        onChange({
            guardian_details: {
                ...formData.guardian_details,
                [field]: event.target.value,
            },
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
                        helperText="As per in Aadhar card"
                        autoComplete="name"
                        aria-hidden="true"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth required>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            labelId="gender-label"
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

                <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                        required
                        fullWidth
                        type="date"
                        label="Date of Birth"
                        value={formData.dob}
                        onChange={handleChange('dob')}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        autoComplete="bday"
                    />
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
                        autoComplete="email"
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
                        inputProps={{
                            maxLength: 10,
                            'aria-label': '10-digit mobile number'
                        }}
                        autoComplete="tel"
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
                        inputProps={{
                            maxLength: 6,
                            'aria-label': '6-digit pincode'
                        }}
                        autoComplete="postal-code"
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

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Parent/Guardian Name"
                        value={formData.guardian_details?.parent_name || ''}
                        onChange={handleGuardianChange('parent_name')}
                        variant="outlined"
                        placeholder="Optional"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                        <InputLabel id="guardian-relationship-label">Relationship</InputLabel>
                        <Select
                            labelId="guardian-relationship-label"
                            value={formData.guardian_details?.relationship || ''}
                            label="Relationship"
                            onChange={handleGuardianChange('relationship')}
                        >
                            <MenuItem value="Father">Father</MenuItem>
                            <MenuItem value="Mother">Mother</MenuItem>
                            <MenuItem value="Guardian">Guardian</MenuItem>
                            <MenuItem value="Brother">Brother</MenuItem>
                            <MenuItem value="Sister">Sister</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        label="Parent/Guardian Phone"
                        value={formData.guardian_details?.parent_phone || ''}
                        onChange={handleGuardianChange('parent_phone')}
                        variant="outlined"
                        placeholder="Optional"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PersonalInfoStep;