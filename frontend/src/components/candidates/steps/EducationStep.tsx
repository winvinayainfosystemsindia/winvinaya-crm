import React from 'react';
import {
    Grid,
    TextField,
    Typography,
    Box,
    Divider,
    Button,
    IconButton,
    Paper,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { CandidateCreate, Degree } from '../../../models/candidate';

interface EducationStepProps {
    formData: CandidateCreate;
    onChange: (data: Partial<CandidateCreate>) => void;
}

const EducationStep: React.FC<EducationStepProps> = ({
    formData,
    onChange,
}) => {
    const theme = useTheme();

    const handleTenthChange = (field: string) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange({
            education_details: {
                ...formData.education_details!,
                tenth: {
                    ...formData.education_details?.tenth!,
                    [field]: event.target.value,
                },
            },
        });
    };

    const handleTwelfthChange = (field: string) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onChange({
            education_details: {
                ...formData.education_details!,
                twelfth_or_diploma: {
                    ...formData.education_details?.twelfth_or_diploma!,
                    [field]: event.target.value,
                },
            },
        });
    };

    const handleTwelfthSelectChange = (field: string) => (
        event: any
    ) => {
        onChange({
            education_details: {
                ...formData.education_details!,
                twelfth_or_diploma: {
                    ...formData.education_details?.twelfth_or_diploma!,
                    [field]: event.target.value,
                },
            },
        });
    };

    const handleDegreeChange = (index: number, field: keyof Degree) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedDegrees = [...(formData.education_details?.degrees || [])];
        updatedDegrees[index] = {
            ...updatedDegrees[index],
            [field]: event.target.value,
        };
        onChange({
            education_details: {
                ...formData.education_details!,
                degrees: updatedDegrees,
            },
        });
    };

    const addDegree = () => {
        const newDegree: Degree = {
            degree_name: '',
            specialization: '',
            college_name: '',
            year_of_passing: new Date().getFullYear(),
            percentage: 0,
        };
        onChange({
            education_details: {
                ...formData.education_details!,
                degrees: [...(formData.education_details?.degrees || []), newDegree],
            },
        });
    };

    const removeDegree = (index: number) => {
        const updatedDegrees = [...(formData.education_details?.degrees || [])];
        updatedDegrees.splice(index, 1);
        onChange({
            education_details: {
                ...formData.education_details!,
                degrees: updatedDegrees,
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
                Education Details
            </Typography>

            <Box sx={{ mb: 4 }}>
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
                    <SchoolIcon /> 10th Standard (Required)
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            required
                            fullWidth
                            label="School Name"
                            value={formData.education_details?.tenth?.school_name || ''}
                            onChange={handleTenthChange('school_name')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            required
                            fullWidth
                            type="number"
                            label="Year of Passing"
                            value={formData.education_details?.tenth?.year_of_passing || ''}
                            onChange={handleTenthChange('year_of_passing')}
                            variant="outlined"
                            inputProps={{ min: 1900, max: new Date().getFullYear() }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            required
                            fullWidth
                            type="number"
                            label="Percentage"
                            value={formData.education_details?.tenth?.percentage || ''}
                            onChange={handleTenthChange('percentage')}
                            variant="outlined"
                            InputProps={{ endAdornment: '%' }}
                            inputProps={{ min: 0, max: 100, step: 0.1 }}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        mb: 2,
                        color: theme.palette.primary.main,
                    }}
                >
                    12th Standard or Diploma
                </Typography>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={formData.education_details?.twelfth_or_diploma?.type || ''}
                                label="Type"
                                onChange={handleTwelfthSelectChange('type')}
                            >
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value="12th">12th Standard</MenuItem>
                                <MenuItem value="diploma">Diploma</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            label="Institution Name"
                            value={formData.education_details?.twelfth_or_diploma?.institution_name || ''}
                            onChange={handleTwelfthChange('institution_name')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Year of Passing"
                            value={formData.education_details?.twelfth_or_diploma?.year_of_passing || ''}
                            onChange={handleTwelfthChange('year_of_passing')}
                            variant="outlined"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Percentage"
                            value={formData.education_details?.twelfth_or_diploma?.percentage || ''}
                            onChange={handleTwelfthChange('percentage')}
                            variant="outlined"
                            InputProps={{ endAdornment: '%' }}
                        />
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: theme.palette.primary.main,
                        }}
                    >
                        Degrees / Higher Education
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={addDegree}
                        variant="outlined"
                        size="small"
                    >
                        Add Degree
                    </Button>
                </Stack>

                <Stack spacing={3}>
                    {formData.education_details?.degrees?.map((degree, index) => (
                        <Paper
                            key={index}
                            variant="outlined"
                            sx={{ p: 3, position: 'relative' }}
                        >
                            <IconButton
                                onClick={() => removeDegree(index)}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: theme.palette.error.main,
                                }}
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Degree Name"
                                        value={degree.degree_name}
                                        onChange={handleDegreeChange(index, 'degree_name')}
                                        variant="outlined"
                                        placeholder="e.g., B.Tech, B.Sc, etc."
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="Specialization"
                                        value={degree.specialization}
                                        onChange={handleDegreeChange(index, 'specialization')}
                                        variant="outlined"
                                        placeholder="e.g., Computer Science"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        label="College/University"
                                        value={degree.college_name}
                                        onChange={handleDegreeChange(index, 'college_name')}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Year of Passing"
                                        value={degree.year_of_passing}
                                        onChange={handleDegreeChange(index, 'year_of_passing')}
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        label="Percentage/CGPA"
                                        value={degree.percentage}
                                        onChange={handleDegreeChange(index, 'percentage')}
                                        variant="outlined"
                                        InputProps={{ endAdornment: '%' }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}

                    {(!formData.education_details?.degrees || formData.education_details.degrees.length === 0) && (
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                backgroundColor: theme.palette.background.default,
                            }}
                        >
                            <Typography color="text.secondary">
                                No degrees added yet. Click "Add Degree" to add your qualifications.
                            </Typography>
                        </Paper>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};

export default EducationStep;