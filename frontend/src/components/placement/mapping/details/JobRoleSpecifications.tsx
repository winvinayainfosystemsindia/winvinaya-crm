import React from 'react';
import {
	Paper,
	Box,
	Typography,
	Divider,
	Stack,
	Chip,
	Button,
	useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
	Work as WorkIcon,
	Business as BusinessIcon,
	LocationOn as LocationIcon,
	School as SchoolIcon,
	Psychology as PsychologyIcon,
	Accessibility as PwdIcon,
	Description as FileIcon
} from '@mui/icons-material';
import { type JobRole } from '../../../../models/jobRole';

interface Props {
	selectedRole: JobRole;
	onViewDetails: (pid: string) => void;
}

const JobRoleSpecifications = ({ selectedRole, onViewDetails }: Props) => {
	const theme = useTheme();

	const SpecItem = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | React.ReactNode, color?: string }) => (
		<Box sx={{ mb: 2.5 }}>
			<Typography 
				variant="caption" 
				sx={{ 
					color: 'text.secondary', 
					fontWeight: 700, 
					textTransform: 'uppercase', 
					letterSpacing: '0.05em',
					fontSize: '0.65rem',
					display: 'block',
					mb: 0.75
				}}
			>
				{label}
			</Typography>
			<Stack direction="row" spacing={1.5} alignItems="flex-start">
				<Icon sx={{ fontSize: 18, color: color || theme.palette.primary.main, mt: 0.2 }} />
				<Box>
					<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}>
						{value || 'Not Specified'}
					</Typography>
				</Box>
			</Stack>
		</Box>
	);

	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: '2px',
				borderColor: 'divider',
				bgcolor: 'background.paper',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
				overflow: 'hidden'
			}}
		>
			<Box sx={{ p: 2, bgcolor: '#fcfcfc', borderBottom: (t: any) => `1px solid ${t.palette.divider}` }}>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: '4px', display: 'flex' }}>
						<WorkIcon sx={{ color: 'white', fontSize: 20 }} />
					</Box>
					<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
						Role Specifications
					</Typography>
				</Stack>
			</Box>

			<Box sx={{ p: 3, flexGrow: 1 }}>
				<SpecItem 
					icon={WorkIcon} 
					label="Position Title" 
					value={selectedRole.title} 
				/>
				<Grid container spacing={0}>
					<Grid size={6}>
						<SpecItem 
							icon={BusinessIcon} 
							label="Organization" 
							value={selectedRole.company?.name || 'N/A'} 
							color="text.secondary"
						/>
					</Grid>
					<Grid size={6}>
						<SpecItem 
							icon={LocationIcon} 
							label="Location" 
							value={selectedRole.location?.cities?.join(', ') || 'Remote'} 
							color="text.secondary"
						/>
					</Grid>
				</Grid>

				<Divider sx={{ my: 3, opacity: 0.7 }} />

				<Typography 
					variant="caption" 
					sx={{ 
						color: 'primary.main', 
						fontWeight: 800, 
						textTransform: 'uppercase', 
						letterSpacing: '0.1em',
						fontSize: '0.7rem',
						display: 'block',
						mb: 2.5
					}}
				>
					Matching Benchmark
				</Typography>

				<SpecItem 
					icon={PsychologyIcon} 
					label="Required Skillsets" 
					value={
						<Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
							{selectedRole.requirements?.skills?.length ? selectedRole.requirements.skills.map((skill, i) => (
								<Chip 
									key={i} 
									label={skill} 
									size="small" 
									variant="outlined"
									sx={{ 
										height: 22, 
										fontSize: '0.7rem', 
										fontWeight: 600,
										borderColor: 'primary.light',
										color: 'primary.main'
									}} 
								/>
							)) : <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No specific skills specified</Typography>}
						</Stack>
					} 
				/>

				<SpecItem 
					icon={SchoolIcon} 
					label="Qualitative Requirement" 
					value={selectedRole.requirements?.qualifications?.join(', ')} 
				/>

				<SpecItem 
					icon={PwdIcon} 
					label="Diversity Preference" 
					value={selectedRole.requirements?.disability_preferred?.join(', ')} 
					color="#ff9900" 
				/>
			</Box>

			<Box sx={{ p: 2, bgcolor: '#fcfcfc', borderTop: (t: any) => `1px solid ${t.palette.divider}` }}>
				<Button
					fullWidth
					variant="outlined"
					startIcon={<FileIcon />}
					onClick={() => onViewDetails(selectedRole.public_id)}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderColor: 'divider',
						color: 'text.primary',
						py: 1,
						'&:hover': {
							bgcolor: 'action.hover',
							borderColor: 'text.secondary'
						}
					}}
				>
					Reference Full Specification
				</Button>
			</Box>
		</Paper>
	);
};

export default JobRoleSpecifications;
