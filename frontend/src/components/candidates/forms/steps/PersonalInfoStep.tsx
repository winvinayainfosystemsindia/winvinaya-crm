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
import { MuiTelInput } from 'mui-tel-input';
import { Metadata } from 'libphonenumber-js/core';
import metadata from 'libphonenumber-js/metadata.min.json';
import type { CandidateCreate } from '../../../../models/candidate';

const preferredLengths: Record<string, number> = {
    'IN': 10, 'AF': 9, 'AL': 9, 'DZ': 9, 'AT': 13, 'AZ': 9, 'BS': 10, 'BE': 10, 
    'BR': 12, 'CA': 10, 'CN': 12, 'DK': 8, 'FR': 9, 'DE': 15, 'IT': 12, 'MX': 10, 
    'NL': 9, 'RU': 10, 'ZA': 10, 'GB': 10, 'US': 10, 'LK': 9
};

const getMaxLength = (countryCode: any) => {
    if (!countryCode) return 15;
    if (preferredLengths[countryCode]) return preferredLengths[countryCode];
    try {
        const meta = new Metadata(metadata as any);
        meta.selectNumberingPlan(countryCode);
        if (meta.numberingPlan) {
            const lengths = meta.numberingPlan.possibleLengths();
            return Math.max(...lengths);
        }
        return 15;
    } catch (e) {
        return 15;
    }
}

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

        // Allow only digits for pincode fields
        if (field === 'pincode') {
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
                    <MuiTelInput
                        required
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={(value, info) => {
                            const maxNationalLength = getMaxLength(info.countryCode);
                            const nationalNumber = info.nationalNumber || '';
                            if (nationalNumber.length <= maxNationalLength) {
                                onChange({ phone: value });
                            }
                        }}
                        defaultCountry="IN"
                        preferredCountries={['IN', 'LK', 'US', 'GB', 'AE', 'AF']}
                        variant="outlined"
                        error={!!errors.phone}
                        helperText={errors.phone || ""}
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <MuiTelInput
                        fullWidth
                        label="WhatsApp Number"
                        value={formData.whatsapp_number}
                        onChange={(value, info) => {
                            const maxNationalLength = getMaxLength(info.countryCode);
                            const nationalNumber = info.nationalNumber || '';
                            if (nationalNumber.length <= maxNationalLength) {
                                onChange({ whatsapp_number: value });
                            }
                        }}
                        defaultCountry="IN"
                        preferredCountries={['IN', 'LK', 'US', 'GB', 'AE', 'AF']}
                        variant="outlined"
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
                    <MuiTelInput
                        required
                        fullWidth
                        label="Parent/Guardian Phone"
                        value={formData.guardian_details?.parent_phone || ''}
                        onChange={(value, info) => {
                            const maxNationalLength = getMaxLength(info.countryCode);
                            const nationalNumber = info.nationalNumber || '';
                            if (nationalNumber.length <= maxNationalLength) {
                                handleGuardianChange('parent_phone')(value as any);
                            }
                        }}
                        defaultCountry="IN"
                        preferredCountries={['IN', 'LK', 'US', 'GB', 'AE', 'AF']}
                        variant="outlined"
                        error={!!errors.parent_phone}
                        helperText={errors.parent_phone || ""}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default PersonalInfoStep;