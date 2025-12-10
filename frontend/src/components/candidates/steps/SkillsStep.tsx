import React, { useState } from 'react';
import {
    Grid,
    TextField,
    Typography,
    Box,
    Alert,
    Chip,
    Stack,
    Paper,
    Autocomplete,
    Button,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Tag as TagIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import type { CandidateCreate } from '../../../models/candidate';

interface SkillsStepProps {
    formData: CandidateCreate;
    onChange: (data: Partial<CandidateCreate>) => void;
}

// Common skills suggestions
const commonSkills = [
    'JavaScript',
    'Python',
    'Java',
    'React',
    'Node.js',
    'HTML/CSS',
    'SQL',
    'AWS',
    'Git',
    'Docker',
    'Communication',
    'Problem Solving',
    'Teamwork',
    'Leadership',
    'Time Management',
    'Project Management',
    'Data Analysis',
    'Machine Learning',
    'UI/UX Design',
    'Testing',
    'DevOps',
    'Agile Methodologies',
    'Technical Writing',
    'Presentation Skills',
    'Customer Service',
];

const SkillsStep: React.FC<SkillsStepProps> = ({
    formData,
    onChange,
}) => {
    const theme = useTheme();
    const [newSkill, setNewSkill] = useState('');

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            onChange({
                skills: [...formData.skills, newSkill.trim()],
            });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        onChange({
            skills: formData.skills.filter(skill => skill !== skillToRemove),
        });
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddSkill();
        }
    };

    const handleAutocompleteChange = (_event: any, newValue: string[]) => {
        // Merge existing skills with new selections, remove duplicates
        const mergedSkills = Array.from(new Set([...formData.skills, ...newValue]));
        onChange({ skills: mergedSkills });
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
                <TagIcon /> Skills & Competencies
            </Typography>

            <Alert severity="info" sx={{ mb: 4 }}>
                Add skills that best represent your abilities. Include both technical skills and soft skills.
            </Alert>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            Quick Add Skills
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Search and select from common skills
                        </Typography>

                        <Autocomplete
                            multiple
                            freeSolo
                            options={commonSkills}
                            value={formData.skills}
                            onChange={handleAutocompleteChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    placeholder="Type or select skills"
                                    helperText="Start typing or select from suggestions"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option}
                                        {...getTagProps({ index })}
                                        onDelete={() => handleRemoveSkill(option)}
                                    />
                                ))
                            }
                            sx={{ mb: 3 }}
                        />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            Add Custom Skill
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                fullWidth
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter a skill not in the list above"
                                variant="outlined"
                                size="small"
                            />
                            <Button
                                startIcon={<AddIcon />}
                                onClick={handleAddSkill}
                                variant="contained"
                                disabled={!newSkill.trim()}
                            >
                                Add
                            </Button>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Your Skills ({formData.skills.length})
                            </Typography>
                            {formData.skills.length > 0 && (
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => onChange({ skills: [] })}
                                    startIcon={<DeleteIcon />}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Stack>

                        {formData.skills.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.skills.map((skill, index) => (
                                    <Chip
                                        key={index}
                                        label={skill}
                                        onDelete={() => handleRemoveSkill(skill)}
                                        sx={{
                                            backgroundColor: theme.palette.primary.light,
                                            color: '#fff',
                                            '& .MuiChip-deleteIcon': {
                                                color: 'rgba(255, 255, 255, 0.7)',
                                                '&:hover': {
                                                    color: '#fff',
                                                },
                                            },
                                        }}
                                    />
                                ))}
                            </Box>
                        ) : (
                            <Alert severity="warning">
                                <Typography variant="body2">
                                    No skills added yet. Add at least one skill to continue.
                                </Typography>
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Alert severity="success">
                        <Typography variant="body2">
                            <strong>Tip:</strong> Be specific with your skills. Instead of "Programming," list specific languages like "Python" or "JavaScript."
                        </Typography>
                    </Alert>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SkillsStep;