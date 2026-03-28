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
import { type JobRole } from '../../../../models/jobRole';

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
				borderColor: 'divider',
				position: 'sticky',
				top: 80,
				bgcolor: 'background.paper',
				overflow: 'hidden'
			}}
		>
			<Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
				<Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.2px' }}>
					Job Role Specifications
				</Typography>
			</Box>
			<Box sx={{ p: 2.5 }}>
				<Stack spacing={3}>
					<Box>
						<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Position Title</Typography>
						<Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>{selectedRole.title}</Typography>
					</Box>

					<Grid container spacing={2}>
						<Grid size={{ xs: 6 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Organization</Typography>
							<Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>{selectedRole.company?.name || 'N/A'}</Typography>
						</Grid>
						<Grid size={{ xs: 6 }}>
							<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</Typography>
							<Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
								{selectedRole.location?.cities?.join(', ') || 'Global'}
							</Typography>
						</Grid>
					</Grid>

					<Divider />

					<Box>
						<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', textTransform: 'uppercase', display: 'block', mb: 2, letterSpacing: '0.5px' }}>Matching Benchmark</Typography>
						<Stack spacing={2.5}>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>Required Skillsets:</Typography>
								<Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
									{selectedRole.requirements?.skills?.length ? selectedRole.requirements.skills.map((s: string, i: number) => (
										<Chip key={i} label={s} size="small" sx={{ height: 20, fontSize: '0.65rem', borderRadius: '2px', bgcolor: 'transparent', border: (t) => `1px solid ${t.palette.divider}` }} />
									)) : <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No skills defined</Typography>}
								</Stack>
							</Box>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>Qualitative Requirement:</Typography>
								<Typography variant="body2" sx={{ fontWeight: 500 }}>{selectedRole.requirements?.qualifications?.join(', ') || 'Open'}</Typography>
							</Box>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>Preferred Diversity:</Typography>
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
							bgcolor: 'background.paper',
							color: 'text.secondary',
							border: (t) => `1px solid ${t.palette.text.secondary}`,
							borderRadius: '2px',
							boxShadow: 'none',
							'&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary', boxShadow: 'none' }
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
