import React from 'react';
import {
    Grid,
    TextField,
    Typography,
    Box,
    Button,
    IconButton,
    Paper,
    Stack,
    Autocomplete,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { CandidateCreate, Degree } from '../../../models/candidate';
import { degrees } from '../../../data/Degree';
import { specializations } from '../../../data/Specialization';
import { colleges } from '../../../data/College';

interface EducationStepProps {
    formData: CandidateCreate;
    onChange: (data: Partial<CandidateCreate>) => void;
}

const EducationStep: React.FC<EducationStepProps> = ({
    formData,
    onChange,
}) => {
    const theme = useTheme();

    const handleDegreeChange = (index: number, field: keyof Degree) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value: string | number = event.target.value;

        // Handle percentage validation
        if (field === 'percentage') {
            const numValue = parseFloat(value as string);
            if (!isNaN(numValue)) {
                if (numValue > 100) value = 100;
                else if (numValue < 0) value = 0;
                else value = numValue;
            } else if (value === '') {
                value = 0;
            }
        }

        const updatedDegrees = [...(formData.education_details?.degrees || [])];
        updatedDegrees[index] = {
            ...updatedDegrees[index],
            [field]: value,
        };
        onChange({
            education_details: {
                ...formData.education_details!,
                degrees: updatedDegrees,
            },
        });
    };

    const handleDegreeAutocompleteChange = (index: number, field: keyof Degree) => (
        _event: any,
        newValue: string | null
    ) => {
        const updatedDegrees = [...(formData.education_details?.degrees || [])];
        updatedDegrees[index] = {
            ...updatedDegrees[index],
            [field]: newValue || '',
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

            <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: theme.palette.primary.main,
                        }}
                    >
                        Highest Qualification
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
                            role="region"
                            aria-label={`Educational Qualification ${index + 1}`}
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
                                aria-label={`Remove educational qualification ${index + 1}`}
                            >
                                <DeleteIcon />
                            </IconButton>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={degrees}
                                        value={degree.degree_name}
                                        onChange={handleDegreeAutocompleteChange(index, 'degree_name')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label="Degree Name"
                                                variant="outlined"
                                                placeholder="Select Degree"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        freeSolo
                                        options={specializations}
                                        value={degree.specialization}
                                        onChange={handleDegreeAutocompleteChange(index, 'specialization')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label="Specialization"
                                                variant="outlined"
                                                placeholder="e.g., Computer Science"
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        freeSolo
                                        options={colleges}
                                        value={degree.college_name}
                                        onChange={handleDegreeAutocompleteChange(index, 'college_name')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                fullWidth
                                                label="College/University"
                                                variant="outlined"
                                            />
                                        )}
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
                                        label="Overall Percentage"
                                        value={degree.percentage}
                                        onChange={handleDegreeChange(index, 'percentage')}
                                        variant="outlined"
                                        InputProps={{ endAdornment: '%' }}
                                        inputProps={{
                                            min: 0,
                                            max: 100,
                                            step: "0.01"
                                        }}
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