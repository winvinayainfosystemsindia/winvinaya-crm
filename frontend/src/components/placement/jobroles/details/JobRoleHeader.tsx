import React from 'react';
import { Box, Typography, Stack, Button, useTheme, alpha } from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Business as BusinessIcon,
	LocationOn as LocationOnIcon,
	Person as PersonIcon,
	Refresh as RefreshIcon
} from '@mui/icons-material';
import PlacementStatusBadge from '../common/PlacementStatusBadge';
import ModuleHeader from '../../../common/header/ModuleHeader';
import { useNavigate } from 'react-router-dom';
import type { JobRole } from '../../../../models/jobRole';

interface JobRoleHeaderProps {
	jobRole: JobRole;
	onEdit: () => void;
	onRefresh: () => void;
}

const JobRoleHeader: React.FC<JobRoleHeaderProps> = ({ jobRole, onEdit, onRefresh }) => {
	const theme = useTheme();
	const navigate = useNavigate();

	const actions = (
		<Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ width: '100%' }}>
			<Button
				variant="outlined"
				startIcon={<RefreshIcon />}
				onClick={onRefresh}
				sx={{
					color: theme.palette.common.white,
					borderColor: alpha(theme.palette.common.white, 0.3),
					textTransform: 'none',
					fontWeight: 600,
					'&:hover': { 
						borderColor: theme.palette.common.white, 
						bgcolor: alpha(theme.palette.common.white, 0.05) 
					}
				}}
			>
				Refresh
			</Button>
			<Button
				variant="contained"
				color="primary"
				startIcon={<EditIcon />}
				onClick={onEdit}
				sx={{
					textTransform: 'none',
					fontWeight: 700,
					px: 3,
					boxShadow: 'none',
					'&:hover': {
						bgcolor: theme.palette.primary.dark,
						boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
					}
				}}
			>
				Edit Role
			</Button>
		</Stack>
	);

	const infoBar = (
		<Stack direction="row" spacing={4} sx={{ color: alpha(theme.palette.common.white, 0.8), flexWrap: 'wrap', gap: 2 }}>
			<Stack direction="row" spacing={1} alignItems="center">
				<BusinessIcon sx={{ fontSize: 18, color: alpha(theme.palette.common.white, 0.6) }} />
				<Box>
					<Typography variant="awsFieldLabel" sx={{ color: alpha(theme.palette.common.white, 0.5), mb: 0 }}>COMPANY</Typography>
					<Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.common.white }}>{jobRole.company?.name || 'N/A'}</Typography>
				</Box>
			</Stack>
			
			<Stack direction="row" spacing={1} alignItems="center">
				<LocationOnIcon sx={{ fontSize: 18, color: alpha(theme.palette.common.white, 0.6) }} />
				<Box>
					<Typography variant="awsFieldLabel" sx={{ color: alpha(theme.palette.common.white, 0.5), mb: 0 }}>LOCATION</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.common.white, fontWeight: 500 }}>
						{jobRole.location?.cities?.join(', ') || jobRole.location?.states?.join(', ') || 'Remote'}
					</Typography>
				</Box>
			</Stack>

			<Stack direction="row" spacing={1} alignItems="center">
				<PersonIcon sx={{ fontSize: 18, color: alpha(theme.palette.common.white, 0.6) }} />
				<Box>
					<Typography variant="awsFieldLabel" sx={{ color: alpha(theme.palette.common.white, 0.5), mb: 0 }}>OWNER</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.common.white, fontWeight: 500 }}>
						{jobRole.creator?.full_name || jobRole.creator?.username || 'System'}
					</Typography>
				</Box>
			</Stack>
		</Stack>
	);

	return (
		<>
			{/* Top Bar / Navigation */}
			<Box sx={{ mb: 2 }}>
				<Button
					variant="text"
					size="small"
					startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
					onClick={() => navigate('/placement/job-roles')}
					sx={{
						color: theme.palette.text.secondary,
						fontWeight: 700,
						textTransform: 'none',
						fontSize: '0.75rem',
						'&:hover': { bgcolor: 'transparent', color: theme.palette.primary.main }
					}}
				>
					Back to Job Roles
				</Button>
			</Box>

			<ModuleHeader
				title={jobRole.title}
				subtitle={
					<Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
						<Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.5), fontWeight: 700 }}>
							ID: {jobRole.public_id}
						</Typography>
						<PlacementStatusBadge label={jobRole.status} status={jobRole.status} />
					</Stack>
				}
				extra={actions}
			>
				{infoBar}
			</ModuleHeader>
		</>
	);
};

export default JobRoleHeader;
