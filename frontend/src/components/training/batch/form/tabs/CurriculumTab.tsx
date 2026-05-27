import React from 'react';
import {
	Typography,
	Stack,
	Chip,
	Box,
	alpha,
	useTheme
} from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import type { TrainingBatch } from '../../../../../models/training';
import SkillDropdown from '../../../../common/SkillDropdown';

interface CurriculumTabProps {
	formData: Partial<TrainingBatch>;
	onChange: (field: keyof TrainingBatch, value: any) => void;
}

const CurriculumTab: React.FC<CurriculumTabProps> = ({
	formData,
	onChange
}) => {
	const theme = useTheme();

	return (
		<Stack spacing={4}>
			<Box>
				<Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
					<SchoolIcon fontSize="small" color="primary" /> Curriculum Configuration
				</Typography>
				<SkillDropdown
					multiple
					value={(formData.courses || []).map(c => typeof c === 'string' ? c : c.name)}
					onChange={(newValue: string[]) => {
						const newCourses = newValue.map(courseName => {
							const existing = (formData.courses || []).find(c =>
								(typeof c === 'string' ? c : c.name) === courseName
							);
							return typeof existing === 'object' ? existing : { name: courseName, trainer: '' };
						});
						onChange('courses', newCourses);
					}}
					label="Select Courses / Skills"
					placeholder="Add courses..."
					renderTags={(tagValue, getTagProps) =>
						tagValue.map((option, index) => {
							const { key, ...tagProps } = getTagProps({ index });
							return (
								<Chip
									key={key}
									label={option}
									{...tagProps}
									size="small"
									sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), fontWeight: 600 }}
								/>
							);
						})
					}
				/>
			</Box>
		</Stack>
	);
};

export default CurriculumTab;
