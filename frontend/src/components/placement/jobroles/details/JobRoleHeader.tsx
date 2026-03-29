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
						color: '#545b64',
						fontWeight: 600,
						textTransform: 'none',
						mb: 1,
						'&:hover': { bgcolor: 'transparent', color: '#16191f' }
					}}
				>
					Back to Job Roles
				</Button>
				<Typography
					variant={isMobile ? "h5" : "h4"}
					component="h1"
					sx={{
						fontWeight: 300,
						color: 'text.primary',
						mb: 0.5
					}}
				>
					Job Role Details
				</Typography>
				<Typography variant="body2" color="text.secondary">
					View the job role details and manage candidate mapping
				</Typography>
			</Box>

			{/* AWS Style Header */}
			<Box sx={{ bgcolor: '#232f3e', color: 'white', px: 4, py: 3, borderBottom: '1px solid #354552' }}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
					<Box sx={{ mb: isMobile ? 2 : 0 }}>
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
							<Typography variant="h4" sx={{ fontWeight: 500, fontSize: '1.85rem', letterSpacing: '-0.02em' }}>
								{jobRole.title}
							</Typography>
							<PlacementStatusBadge label={jobRole.status} status={jobRole.status} />
						</Stack>
						<Stack direction="row" spacing={3} sx={{ color: '#aab7b8', flexWrap: 'wrap', gap: 1.5 }}>
							<Stack direction="row" spacing={0.75} alignItems="center">
								<BusinessIcon sx={{ fontSize: 16, color: '#aab7b8' }} />
								<Typography variant="body2" sx={{ fontWeight: 600 }}>{jobRole.company?.name || 'N/A'}</Typography>
							</Stack>
							<Stack direction="row" spacing={0.75} alignItems="center">
								<LocationOnIcon sx={{ fontSize: 16, color: '#aab7b8' }} />
								<Typography variant="body2">
									{jobRole.location?.cities?.join(', ') || jobRole.location?.states?.join(', ') || 'Remote'}
								</Typography>
							</Stack>
							<Stack direction="row" spacing={0.75} alignItems="center">
								<PersonIcon sx={{ fontSize: 16, color: '#aab7b8' }} />
								<Typography variant="body2">Owned by <span style={{ color: 'white' }}>{jobRole.creator?.full_name || jobRole.creator?.username || 'System'}</span></Typography>
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
								borderColor: '#545b64',
								textTransform: 'none',
								fontWeight: 600,
								px: 2.5,
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
								bgcolor: '#ec7211',
								color: 'white',
								'&:hover': { bgcolor: '#eb5f07' },
								textTransform: 'none',
								fontWeight: 700,
								px: 3,
								boxShadow: 'none'
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
