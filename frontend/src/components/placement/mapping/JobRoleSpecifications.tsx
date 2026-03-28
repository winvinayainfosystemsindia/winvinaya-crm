import {
	Paper,
	Box,
	Typography,
	Stack,
	Divider,
	Chip,
	Button
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { type JobRole } from '../../../models/jobRole';
import { AWS_COLORS } from './mappingTypes';

interface Props {
	selectedRole: JobRole;
	onViewDetails: (roleId: string) => void;
}

const JobRoleSpecifications = ({ selectedRole, onViewDetails }: Props) => {
	return (
		<Paper
			variant="outlined"
			sx={{
				borderRadius: '0px',
				borderColor: AWS_COLORS.border,
				position: 'sticky',
				top: 80,
				bgcolor: 'white',
				overflow: 'hidden'
			}}
		>
			<Box sx={{ p: 2, bgcolor: AWS_COLORS.surface, borderBottom: `1px solid ${AWS_COLORS.border}` }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: AWS_COLORS.headerText, letterSpacing: '0.2px' }}>
					Job Role Specifications
				</Typography>
			</Box>
			<Box sx={{ p: 2.5 }}>
				<Stack spacing={3}>
					<Box>
						<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position Title</Typography>
						<Typography variant="body1" sx={{ fontWeight: 700, color: AWS_COLORS.headerText, mt: 0.5 }}>{selectedRole.title}</Typography>
					</Box>

					<Grid container spacing={2}>
						<Grid size={{ xs: 6 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization</Typography>
							<Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{selectedRole.company?.name || 'N/A'}</Typography>
						</Grid>
						<Grid size={{ xs: 6 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</Typography>
							<Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
								{selectedRole.location?.cities?.join(', ') || 'Global'}
							</Typography>
						</Grid>
					</Grid>

					<Divider sx={{ borderColor: AWS_COLORS.border }} />

					<Box>
						<Typography variant="caption" sx={{ fontWeight: 800, color: AWS_COLORS.headerText, textTransform: 'uppercase', display: 'block', mb: 2, letterSpacing: '0.5px' }}>Matching Benchmark</Typography>
						<Stack spacing={2.5}>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, display: 'block', mb: 1 }}>Required Skillsets:</Typography>
								<Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
									{selectedRole.requirements?.skills?.length ? selectedRole.requirements.skills.map((s: string, i: number) => (
										<Chip key={i} label={s} size="small" sx={{ height: 20, fontSize: '0.65rem', borderRadius: '2px', bgcolor: AWS_COLORS.surface, border: `1px solid ${AWS_COLORS.border}` }} />
									)) : <Typography variant="caption" sx={{ color: AWS_COLORS.secondaryText, fontStyle: 'italic' }}>No skills defined</Typography>}
								</Stack>
							</Box>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, display: 'block', mb: 0.5 }}>Qualitative Requirement:</Typography>
								<Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedRole.requirements?.qualifications?.join(', ') || 'Open'}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, display: 'block', mb: 0.5 }}>Preferred Diversity:</Typography>
								<Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedRole.requirements?.disability_preferred?.join(', ') || 'Universal'}</Typography>
							</Box>
						</Stack>
					</Box>

					<Button
						variant="contained"
						onClick={() => onViewDetails(selectedRole.public_id)}
						sx={{
							mt: 1,
							textTransform: 'none',
							fontWeight: 700,
							bgcolor: AWS_COLORS.containerBg,
							color: AWS_COLORS.secondaryText,
							border: `1px solid ${AWS_COLORS.secondaryText}`,
							borderRadius: '2px',
							boxShadow: 'none',
							'&:hover': { bgcolor: AWS_COLORS.surface, borderColor: AWS_COLORS.headerText, boxShadow: 'none' }
						}}
					>
						Reference full specification
					</Button>
				</Stack>
			</Box>
		</Paper>
	);
};

export default JobRoleSpecifications;
