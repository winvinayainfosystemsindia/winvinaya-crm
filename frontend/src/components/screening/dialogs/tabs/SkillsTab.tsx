import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	Autocomplete,
	TextField,
	Chip,
	Paper
} from '@mui/material';
import {
	Build as BuildIcon,
	EmojiEvents as SoftSkillIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import { skillService } from '../../../../services/skillService';
import ConfirmDialog from '../../../common/ConfirmDialog';
import useToast from '../../../../hooks/useToast';

interface SkillsTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
}

const SkillsTab: React.FC<SkillsTabProps> = ({
	formData,
	onUpdateField
}) => {
	const { sectionTitle, awsPanel, fieldLabel } = awsStyles;
	const toast = useToast();
	const [availableSkills, setAvailableSkills] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	
	// New skill addition state
	const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
	const [newSkillName, setNewSkillName] = useState('');
	const [activeField, setActiveField] = useState<'technical_skills' | 'soft_skills' | null>(null);
	const [pendingNewValues, setPendingNewValues] = useState<string[]>([]);

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

	const handleSkillChange = (field: 'technical_skills' | 'soft_skills', newValue: string[]) => {
		// Identify if a new value was typed (freeSolo) that isn't in availableSkills
		const lastValue = newValue[newValue.length - 1];
		
		// If lastValue is a non-empty string and not in availableSkills (case-insensitive)
		if (typeof lastValue === 'string' && lastValue.trim() !== '') {
			const skillExists = availableSkills.some(s => s.toLowerCase() === lastValue.toLowerCase());
			
			if (!skillExists) {
				setNewSkillName(lastValue);
				setActiveField(field);
				setPendingNewValues(newValue);
				setConfirmDialogOpen(true);
				return; // Wait for confirmation dialog
			}
		}
		
		// If it's a normal change or skill exists, update directly
		onUpdateField('skills', field, newValue);
	};

	const handleConfirmAddSkill = async () => {
		if (!newSkillName || !activeField) return;
		
		setLoading(true);
		try {
			await skillService.createSkill({ name: newSkillName, is_verified: false });
			
			// Update local available skills
			setAvailableSkills(prev => [...prev, newSkillName]);
			
			// Update form with the new skill list
			onUpdateField('skills', activeField, pendingNewValues);
			
			toast.success(`Skill "${newSkillName}" added to master database`);
			setConfirmDialogOpen(false);
		} catch (error) {
			console.error('Failed to create skill:', error);
			toast.error('Failed to add skill to database');
		} finally {
			setLoading(false);
			setNewSkillName('');
			setActiveField(null);
		}
	};

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' },
			'&.Mui-focused fieldset': { borderColor: '#ec7211' }
		}
	};

	return (
		<Stack spacing={4}>
			{/* Technical Skills Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<BuildIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Technical Skills</Typography>
				</Stack>
				
				<Box sx={{ mb: 1 }}>
					<Typography sx={fieldLabel}>Core Proficiencies</Typography>
					<Autocomplete
						multiple
						freeSolo
						options={availableSkills}
						value={formData.skills?.technical_skills || []}
						onChange={(_e, newValue) => handleSkillChange('technical_skills', newValue)}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ 
										borderRadius: '2px',
										bgcolor: '#f1faff',
										border: '1px solid #007eb9',
										color: '#007eb9',
										fontWeight: 600
									}}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Type a skill (e.g. Python, SQL) and press Enter"
								size="small"
								sx={inputSx}
							/>
						)}
					/>
				</Box>
			</Paper>

			{/* Soft Skills Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<SoftSkillIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Additional & Soft Skills</Typography>
				</Stack>

				<Box sx={{ mb: 1 }}>
					<Typography sx={fieldLabel}>Professional Attributes</Typography>
					<Autocomplete
						multiple
						freeSolo
						options={['Communication', 'Teamwork', 'Punctuality', 'Problem Solving', 'Leadership', ...availableSkills.filter(s => !formData.skills?.technical_skills?.includes(s))]}
						value={formData.skills?.soft_skills || []}
						onChange={(_e, newValue) => handleSkillChange('soft_skills', newValue)}
						renderTags={(value, getTagProps) =>
							value.map((option, index) => (
								<Chip
									label={option}
									{...getTagProps({ index })}
									size="small"
									sx={{ 
										borderRadius: '2px',
										bgcolor: '#fafffe',
										border: '1px solid #1d8102',
										color: '#1d8102',
										fontWeight: 600
									}}
								/>
							))
						}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Type a soft skill (e.g. Communication) and press Enter"
								size="small"
								sx={inputSx}
							/>
						)}
					/>
				</Box>
			</Paper>

			{/* Confirmation Dialog for adding new skill to master database */}
			<ConfirmDialog
				open={confirmDialogOpen}
				title="Add to Master Data?"
				message={`The skill "${newSkillName}" is not currently in the standardized database. Adding it will make it available as a suggestion for all users across the system.`}
				confirmText="Yes, Add to Database"
				cancelText="Ignore for Now"
				onClose={() => {
					setConfirmDialogOpen(false);
					// Proceed with the update without adding to DB if user cancels
					if (activeField) onUpdateField('skills', activeField, pendingNewValues);
				}}
				onConfirm={handleConfirmAddSkill}
				loading={loading}
				severity="info"
			/>
		</Stack>
	);
};

export default SkillsTab;
