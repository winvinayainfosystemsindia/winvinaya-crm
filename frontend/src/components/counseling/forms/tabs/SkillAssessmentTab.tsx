import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	Grid,
	Autocomplete,
	TextField,
	FormControl,
	Select,
	MenuItem,
	IconButton,
	Paper
} from '@mui/material';
import { Add as AddIcon, DeleteOutline as DeleteIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import type { CandidateCounselingCreate } from '../../../../models/candidate';
import { skillService } from '../../../../services/skillService';
import ConfirmDialog from '../../../common/ConfirmDialog';
import useToast from '../../../../hooks/useToast';

interface SkillAssessmentTabProps {
	formData: CandidateCounselingCreate;
	onAddSkill: () => void;
	onRemoveSkill: (index: number) => void;
	onSkillChange: (index: number, field: string, value: string) => void;
}

const SkillAssessmentTab: React.FC<SkillAssessmentTabProps> = ({
	formData,
	onAddSkill,
	onRemoveSkill,
	onSkillChange
}) => {
	const { awsPanel, helperBox } = awsStyles;
	const toast = useToast();
	const [availableSkills, setAvailableSkills] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	// New skill addition state
	const [confirmAddSkillDialogOpen, setConfirmAddSkillDialogOpen] = useState(false);
	const [newSkillName, setNewSkillName] = useState('');
	const [pendingIndex, setPendingIndex] = useState<number | null>(null);

	useEffect(() => {
		const loadSkills = async () => {
			setLoading(true);
			try {
				const skills = await skillService.getSkills();
				setAvailableSkills(skills.map(s => s.name));
			} catch (error) {
				console.error('Failed to load skills:', error);
			} finally {
				setLoading(false);
			}
		};
		loadSkills();
	}, []);

	const handleNameChange = (index: number, val: string | null) => {
		const skillName = (val || '').trim();
		
		if (skillName !== '') {
			const skillExists = availableSkills.some(s => s.toLowerCase() === skillName.toLowerCase());
			
			if (!skillExists) {
				setNewSkillName(skillName);
				setPendingIndex(index);
				setConfirmAddSkillDialogOpen(true);
				return;
			}
		}
		
		onSkillChange(index, 'name', skillName);
	};

	const handleConfirmAddSkill = async () => {
		if (!newSkillName || pendingIndex === null) return;
		
		setLoading(true);
		try {
			await skillService.createSkill({ name: newSkillName, is_verified: false });
			
			// Update local available skills
			setAvailableSkills(prev => [...prev, newSkillName]);
			
			// Update form with the new skill name
			onSkillChange(pendingIndex, 'name', newSkillName);
			
			toast.success(`Skill "${newSkillName}" added to master database`);
			setConfirmAddSkillDialogOpen(false);
		} catch (error) {
			console.error('Failed to create skill:', error);
			toast.error('Failed to add skill to database');
		} finally {
			setLoading(false);
			setNewSkillName('');
			setPendingIndex(null);
		}
	};

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			bgcolor: 'action.hover',
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.secondary' },
			'&.Mui-focused fieldset': { borderColor: 'accent.main' }
		}
	};

	return (
		<Paper elevation={0} sx={awsPanel}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Typography variant="awsSectionTitle">Candidate Skills Assessment</Typography>
				<Button
					variant="outlined"
					size="small"
					startIcon={<AddIcon />}
					onClick={onAddSkill}
					sx={{
						borderRadius: '2px',
						textTransform: 'none',
						fontWeight: 700,
						borderColor: 'divider',
						color: 'text.secondary',
						'&:hover': { bgcolor: 'action.hover', borderColor: 'text.secondary' }
					}}
				>
					Add Skill
				</Button>
			</Box>

			<Box sx={helperBox}>
				<InfoIcon sx={{ color: 'info.main', mt: 0.25, fontSize: 20 }} />
				<Typography variant="body2" sx={{ color: 'info.main', fontWeight: 500 }}>
					Assessment Tip: Please list at least three key skills to provide a comprehensive profile of the candidate's capabilities.
				</Typography>
			</Box>

			<Divider sx={{ mb: 4, borderColor: 'divider' }} />

			{formData.skills && formData.skills.length > 0 ? (
				<Stack spacing={3}>
					{formData.skills.map((skill, index: number) => (
						<Grid container spacing={2} key={index} alignItems="flex-end">
							<Grid size={{ xs: 12, md: 6 }}>
								<Box>
									<Typography variant="awsFieldLabel">Skill Name</Typography>
									<Autocomplete
										freeSolo
										options={availableSkills}
										value={skill.name}
										onChange={(_e, val) => handleNameChange(index, val)}
										renderInput={(params) => (
											<TextField
												{...params}
												placeholder="Enter or select a skill"
												size="small"
												fullWidth
												required
												sx={inputSx}
											/>
										)}
									/>
								</Box>
							</Grid>
							<Grid size={{ xs: 10, md: 5 }}>
								<Box>
									<Typography variant="awsFieldLabel">Proficiency Level</Typography>
									<FormControl fullWidth size="small">
										<Select
											value={skill.level}
											onChange={(e) => onSkillChange(index, 'level', e.target.value as string)}
											sx={{
												borderRadius: '2px',
												bgcolor: 'action.hover',
												'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
												'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
												'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'accent.main' }
											}}
										>
											<MenuItem value="Beginner">Beginner</MenuItem>
											<MenuItem value="Intermediate">Intermediate</MenuItem>
											<MenuItem value="Advanced">Advanced</MenuItem>
										</Select>
									</FormControl>
								</Box>
							</Grid>
							<Grid size={{ xs: 2, md: 1 }} sx={{ pb: 0.5 }}>
								<IconButton 
									onClick={() => onRemoveSkill(index)}
									sx={{ 
										color: 'error.main',
										'&:hover': { bgcolor: 'error.light', opacity: 0.1 }
									}}
								>
									<DeleteIcon />
								</IconButton>
							</Grid>
						</Grid>
					))}
				</Stack>
			) : (
				<Box sx={{ py: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '2px' }}>
					<Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
						No skills have been added yet. Click the "Add Skill" button to start the assessment.
					</Typography>
				</Box>
			)}

			<ConfirmDialog
				open={confirmAddSkillDialogOpen}
				title="Add to Master Data?"
				message={`The skill "${newSkillName}" is not currently in the standardized database. Adding it will make it available as a suggestion for all users across the system.`}
				confirmText="Yes, Add to Database"
				cancelText="Ignore for Now"
				onClose={() => {
					setConfirmAddSkillDialogOpen(false);
					if (pendingIndex !== null) onSkillChange(pendingIndex, 'name', newSkillName);
				}}
				onConfirm={handleConfirmAddSkill}
				loading={loading}
				severity="info"
			/>
		</Paper>
	);
};

export default SkillAssessmentTab;
