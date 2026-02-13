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
import type { CandidateCreate } from '../../../../models/candidate';

interface PersonalInfoStepProps {
    formData: CandidateCreate;
    onChange: (data: Partial<CandidateCreate>) => void;
    errors?: Record<string, string>;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
    formData,
    onChange,
    errors = {},
}) => {
    const theme = useTheme();

    const handleChange = (field: keyof CandidateCreate) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value = event.target.value;

        // Name field filtering: No numbers or special characters allowed
        if (field === 'name') {
            // Allow only letters, spaces, and dots (for initials)
            value = value.replace(/[^a-zA-Z\s.]/g, '');
        }

        // Allow only digits for phone and pincode fields
        if (['phone', 'whatsapp_number', 'pincode'].includes(field)) {
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        }
        onChange({
            [field]: value,
        });
    };

    const handleSelectChange = (field: keyof CandidateCreate) => (
        event: { target: { value: unknown } }
    ) => {
        onChange({
            [field]: event.target.value,
        });
    };

    const handleGuardianChange = (field: keyof NonNullable<CandidateCreate['guardian_details']>) => (
        event: { target: { value: string } }
    ) => {
        const value = event.target.value;
        // Allow only digits for phone field
        if (field === 'parent_phone') {
            if (value !== '' && !/^\d+$/.test(value)) {
                return;
            }
        }
        onChange({
            guardian_details: {
                ...formData.guardian_details,
                [field]: value,
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
                        error={!!errors.name}
                        helperText={errors.name || "As per in Aadhar card (Letters only)"}
                        autoComplete="name"
                        inputProps={{
                            'aria-invalid': !!errors.name,
                            'aria-required': 'true',
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth required error={!!errors.gender}>
                        <InputLabel id="gender-label" htmlFor="gender-select">Gender</InputLabel>
                        <Select
                            labelId="gender-label"
                            id="gender-select"
                            value={formData.gender}
                            label="Gender"
                            onChange={handleSelectChange('gender')}
                            aria-describedby="gender-helper-text"
                            inputProps={{
                                'aria-required': 'true',
                                'aria-invalid': !!errors.gender,
                            }}
                            MenuProps={{
                                disablePortal: true, // Crucial for mobile screen readers to navigate to options
                                disableScrollLock: true,
                            }}
                        >
                            <MenuItem value="male">Male</MenuItem>
                            <MenuItem value="female">Female</MenuItem>
                            <MenuItem value="other">Other</MenuItem>
                            <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                        </Select>
                        <FormHelperText id="gender-helper-text">
                            {errors.gender || "Select your gender"}
                        </FormHelperText>
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
                        error={!!errors.dob}
                        helperText={errors.dob || ""}
                        inputProps={{
                            'aria-invalid': !!errors.dob,
                            'aria-required': 'true',
                        }}
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
                        error={!!errors.email}
                        helperText={errors.email || "We'll send important updates to this email"}
                        autoComplete="email"
                        inputProps={{
                            'aria-invalid': !!errors.email,
                            'aria-required': 'true',
                        }}
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
                        error={!!errors.phone}
                        helperText={errors.phone || ""}
                        inputProps={{
                            maxLength: 10,
                            'aria-label': '10-digit mobile number',
                            'aria-invalid': !!errors.phone,
                            'aria-required': 'true',
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
                        placeholder="10-digit mobile number"
                        helperText="For quick communication"
                        inputProps={{
                            maxLength: 10,
                            'aria-label': '10-digit whatsapp number'
                        }}
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
                        error={!!errors.pincode}
                        helperText={errors.pincode || ""}
                        inputProps={{
                            maxLength: 6,
                            'aria-label': '6-digit pincode',
                            'aria-invalid': !!errors.pincode,
                            'aria-required': 'true',
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
                        Parent/Guardian Information
                    </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        required
                        fullWidth
                        label="Parent/Guardian Name"
                        value={formData.guardian_details?.parent_name || ''}
                        onChange={handleGuardianChange('parent_name')}
                        variant="outlined"
                        placeholder="Enter parent/guardian name"
                        error={!!errors.parent_name}
                        helperText={errors.parent_name || "Name of parent or guardian"}
                        inputProps={{
                            'aria-invalid': !!errors.parent_name,
                            'aria-required': 'true',
                        }}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth required error={!!errors.relationship}>
                        <InputLabel id="guardian-relationship-label" htmlFor="guardian-relationship-select">Relationship</InputLabel>
                        <Select
                            labelId="guardian-relationship-label"
                            id="guardian-relationship-select"
                            value={formData.guardian_details?.relationship || ''}
                            label="Relationship"
                            onChange={handleGuardianChange('relationship')}
                            inputProps={{
                                'aria-required': 'true',
                                'aria-invalid': !!errors.relationship,
                            }}
                            MenuProps={{
                                disablePortal: true,
                                disableScrollLock: true,
                            }}
                        >
                            <MenuItem value="Father">Father</MenuItem>
                            <MenuItem value="Mother">Mother</MenuItem>
                            <MenuItem value="Spouse">Spouse</MenuItem>
                            <MenuItem value="Guardian">Guardian</MenuItem>
                            <MenuItem value="Brother">Brother</MenuItem>
                            <MenuItem value="Sister">Sister</MenuItem>
                        </Select>
                        <FormHelperText>{errors.relationship || "Select relationship"}</FormHelperText>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        required
                        fullWidth
                        label="Parent/Guardian Phone"
                        value={formData.guardian_details?.parent_phone || ''}
                        onChange={handleGuardianChange('parent_phone')}
                        variant="outlined"
                        placeholder="10-digit mobile number"
                        error={!!errors.parent_phone}
                        helperText={errors.parent_phone || "Contact number of parent/guardian"}
                        inputProps={{
                            maxLength: 10,
                            'aria-label': '10-digit guardian mobile number',
                            'aria-invalid': !!errors.parent_phone,
                            'aria-required': 'true',
                        }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PersonalInfoStep;