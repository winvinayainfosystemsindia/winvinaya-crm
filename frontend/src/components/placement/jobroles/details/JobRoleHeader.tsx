import React from 'react';
import { Box, Typography, Stack, Button, useMediaQuery, useTheme } from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Business as BusinessIcon,
	LocationOn as LocationOnIcon,
	Person as PersonIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import PlacementStatusBadge from '../common/PlacementStatusBadge';
import { useNavigate } from 'react-router-dom';
import type { JobRole } from '../../../../models/jobRole';

interface JobRoleHeaderProps {
	jobRole: JobRole;
	onEdit: () => void;
	onRefresh: () => void;
}

const JobRoleHeader: React.FC<JobRoleHeaderProps> = ({ jobRole, onEdit, onRefresh }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const navigate = useNavigate();

	return (
		<>
			{/* Top Bar / Navigation */}
			<Box sx={{ mb: 3 }}>
				<Button
					variant="text"
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/placement/job-roles')}
					sx={{
						color: 'text.secondary',
						fontWeight: 600,
						textTransform: 'none',
						mb: 1,
						'&:hover': { bgcolor: 'transparent', color: 'text.primary' }
					}}
				>
					Back to Job Roles
				</Button>
			</Box>

			{/* AWS Style Header */}
			<Box sx={{ bgcolor: 'secondary.light', color: 'white', px: 4, py: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
					<Box sx={{ mb: isMobile ? 2 : 0 }}>
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
							<Typography variant="h5" sx={{ color: 'white' }}>
								{jobRole.title}
							</Typography>
							<PlacementStatusBadge label={jobRole.status} status={jobRole.status} />
						</Stack>
						<Stack direction="row" spacing={3} sx={{ color: 'rgba(255,255,255,0.7)', flexWrap: 'wrap', gap: 1.5 }}>
							<Stack direction="row" spacing={0.75} alignItems="center">
								<BusinessIcon sx={{ fontSize: 16 }} />
								<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{jobRole.company?.name || 'N/A'}</Typography>
							</Stack>
							<Stack direction="row" spacing={0.75} alignItems="center">
								<LocationOnIcon sx={{ fontSize: 16 }} />
								<Typography variant="body2">
									{jobRole.location?.cities?.join(', ') || jobRole.location?.states?.join(', ') || 'Remote'}
								</Typography>
							</Stack>
							<Stack direction="row" spacing={0.75} alignItems="center">
								<PersonIcon sx={{ fontSize: 16 }} />
								<Typography variant="body2">Owned by <span style={{ color: 'white', fontWeight: 600 }}>{jobRole.creator?.full_name || jobRole.creator?.username || 'System'}</span></Typography>
							</Stack>
						</Stack>
					</Box>
					<Stack direction="row" spacing={2}>
						<Button
							variant="outlined"
							startIcon={<RefreshIcon />}
							onClick={onRefresh}
							sx={{
								color: 'white',
								borderColor: 'rgba(255,255,255,0.3)',
								'&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' }
							}}
						>
							Refresh
						</Button>
						<Button
							variant="contained"
							startIcon={<EditIcon />}
							onClick={onEdit}
							sx={{
								bgcolor: 'accent.main',
								'&:hover': { bgcolor: 'accent.dark' },
							}}
						>
							Edit Role
						</Button>
					</Stack>
				</Box>
			</Box>
		</>
	);
};

export default JobRoleHeader;
