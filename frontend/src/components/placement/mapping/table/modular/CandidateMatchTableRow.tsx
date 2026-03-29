import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	TableRow,
	TableCell,
	Stack,
	Avatar,
	Box,
	Typography,
	Tooltip,
	Chip,
	Button
} from '@mui/material';
import { type CandidateMatchResult } from '../../../../../store/slices/placementMappingSlice';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../../../../store/hooks';
import { 
    updatePlacementStatus 
} from '../../../../../store/slices/placementMappingSlice';
import { 
    Edit as EditIcon, 
    Schedule as ScheduleIcon, 
    LocalOffer as OfferIcon, 
    Notes as NotesIcon,
	History as HistoryIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import useToast from '../../../../../hooks/useToast';
import PlacementDetailDrawer from '../../details/PlacementDetailDrawer';

interface Props {
	candidate: CandidateMatchResult;
	widths: {
		candidate: string;
		score: string;
		disability: string;
		qualification: string;
		experience: string;
		mappings: string;
		status: string;
		skills: string;
		actions: string;
	};
	onMap: (candidate: CandidateMatchResult) => void;
	onUnmap: (candidate: CandidateMatchResult) => void;
}

const CandidateMatchTableRow = ({ candidate, widths, onMap, onUnmap }: Props) => {
	const navigate = useNavigate();
	const { user } = useAppSelector((state) => state.auth);
	const dispatch = useAppDispatch();
	const toast = useToast();
	const canUnmap = user?.role === 'admin' || user?.role === 'manager';

	// Status Menu State
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

    // Detail Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);

	const getScoreColor = (score: number) => {
		if (score >= 80) return '#1d8102'; // AWS Success Green
		if (score >= 40) return '#ff9900'; // AWS Warning Orange
		return '#d13212'; // AWS Error Red
	};

	const getStatusConfig = (status: string) => {
		const config: any = {
			applied: { color: '#0066cc', bgcolor: '#eaf3ff', label: 'Applied' },
			shortlisted: { color: '#1d8102', bgcolor: '#e7f4e4', label: 'Shortlisted' },
			interview_l1: { color: '#684eb8', bgcolor: '#f2f0f9', label: 'L1 Interview' },
			interview_l2: { color: '#684eb8', bgcolor: '#f2f0f9', label: 'L2 Interview' },
			technical_round: { color: '#684eb8', bgcolor: '#f2f0f9', label: 'Technical' },
			hr_round: { color: '#684eb8', bgcolor: '#f2f0f9', label: 'HR Round' },
			offer_made: { color: '#ff9900', bgcolor: '#fff4e5', label: 'Offer Made' },
			offer_accepted: { color: '#1d8102', bgcolor: '#e7f4e4', label: 'Accepted' },
			offer_rejected: { color: '#d13212', bgcolor: '#fbeae5', label: 'Rejected' },
			joined: { color: '#1d8102', bgcolor: '#e7f4e4', label: 'Joined' },
			not_joined: { color: '#d13212', bgcolor: '#fbeae5', label: 'Not Joined' },
			dropped: { color: '#545b64', bgcolor: '#f2f3f3', label: 'Dropped' },
			rejected: { color: '#d13212', bgcolor: '#fbeae5', label: 'Rejected' },
			on_hold: { color: '#ff9900', bgcolor: '#fff4e5', label: 'On Hold' },
		};
		return config[status.toLowerCase()] || { color: '#545b64', bgcolor: '#f2f3f3', label: status };
	};

	const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleStatusClose = () => {
		setAnchorEl(null);
	};

	const handleStatusUpdate = async (newStatus: string) => {
		handleStatusClose();
		if (!candidate.mapping_id) return;
        
        try {
            await dispatch(updatePlacementStatus({ 
                mappingId: candidate.mapping_id, 
                status: newStatus 
            })).unwrap();
            toast.success(`Status updated to ${toTitleCase(newStatus.replace('_', ' '))}`);
        } catch (error: any) {
            toast.error(error || 'Failed to update status');
        }
	};

    const statusOptions = [
        { value: 'applied', icon: <EditIcon fontSize="small" /> },
        { value: 'shortlisted', icon: <EditIcon fontSize="small" /> },
        { value: 'interview_l1', icon: <ScheduleIcon fontSize="small" /> },
        { value: 'interview_l2', icon: <ScheduleIcon fontSize="small" /> },
        { value: 'technical_round', icon: <ScheduleIcon fontSize="small" /> },
        { value: 'hr_round', icon: <ScheduleIcon fontSize="small" /> },
        { value: 'offer_made', icon: <OfferIcon fontSize="small" /> },
        { value: 'offer_accepted', icon: <OfferIcon fontSize="small" /> },
        { value: 'offer_rejected', icon: <OfferIcon fontSize="small" /> },
        { value: 'joined', icon: <OfferIcon fontSize="small" /> },
        { value: 'not_joined', icon: <OfferIcon fontSize="small" /> },
        { value: 'dropped', icon: <NotesIcon fontSize="small" /> },
        { value: 'rejected', icon: <NotesIcon fontSize="small" /> },
        { value: 'on_hold', icon: <HistoryIcon fontSize="small" /> },
    ];

	const toTitleCase = (str: string) => {
		if (!str) return '';
		return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
	};

	return (
		<TableRow
			sx={{
				height: '64px', // Slightly taller for better vertical rhythm
				transition: 'background-color 0.2s',
				'&:nth-of-type(even)': { bgcolor: '#f9f9f9' },
				'&:hover': {
					bgcolor: '#f5f8fa',
					'& .name-text': { color: 'primary.main' }
				},
				'& .MuiTableCell-root': { 
					borderBottom: '1px solid #f0f0f0',
					px: 2 // Consistent padding
				}
			}}
		>
			<TableCell sx={{ 
                py: 1.5, 
                width: widths.candidate,
                position: 'sticky',
                left: 0,
                bgcolor: 'white', 
                zIndex: 10,
                borderRight: '2px solid #f0f0f0',
                '.MuiTableRow-root:nth-of-type(even) &': { bgcolor: '#f9f9f9' },
                '.MuiTableRow-root:hover &': { bgcolor: '#f5f8fa' }
            }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<Avatar
						sx={{
							bgcolor: 'primary.main',
							color: 'white',
							width: 32,
							height: 32,
							fontSize: '0.85rem',
							fontWeight: 700,
							boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
						}}
					>
						{candidate.name[0]}
					</Avatar>
					<Box sx={{ overflow: 'hidden' }}>
						<Typography
							className="name-text"
							variant="body2"
							sx={{
								fontWeight: 600,
								cursor: 'pointer',
								transition: 'color 0.2s',
								whiteSpace: 'nowrap',
								overflow: 'hidden',
								textOverflow: 'ellipsis'
							}}
							onClick={() => navigate(`/candidates/${candidate.public_id}`)}
						>
							{toTitleCase(candidate.name)}
						</Typography>
					</Box>
				</Stack>
			</TableCell>
			<TableCell sx={{ width: widths.score }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getScoreColor(candidate.match_score) }} />
					<Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
						{candidate.match_score}%
					</Typography>
				</Box>
			</TableCell>
			<TableCell sx={{ width: widths.disability }}>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', fontWeight: 500 }}>
					{candidate.disability}
				</Typography>
			</TableCell>
			<TableCell sx={{ width: widths.qualification }}>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
					{candidate.qualification}
				</Typography>
			</TableCell>
			<TableCell sx={{ width: widths.experience }}>
				<Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
					{candidate.year_of_experience || 'Fresher'}
				</Typography>
			</TableCell>
			<TableCell sx={{ width: widths.mappings }}>
				{candidate.other_mappings_count > 0 ? (
					<Box
						sx={{
							display: 'inline-flex',
							alignItems: 'center',
							px: 1.2,
							py: 0.4,
							borderRadius: '4px',
							bgcolor: '#eaf3ff',
							color: '#0066cc',
							border: '1px solid #cce3ff',
							fontSize: '0.75rem',
							fontWeight: 700,
						}}
					>
						{candidate.other_mappings_count} {candidate.other_mappings_count === 1 ? 'Mapping' : 'Mappings'}
					</Box>
				) : (
					<Typography variant="body2" sx={{ color: 'text.disabled', px: 1 }}>
						—
					</Typography>
				)}
			</TableCell>
			<TableCell sx={{ width: widths.status }}>
				{candidate.is_already_mapped ? (
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
						<Chip
							label={getStatusConfig(candidate.status || 'applied').label}
							size="small"
							onClick={handleStatusClick}
							sx={{
								height: 24,
								fontSize: '0.75rem',
								fontWeight: 700,
								bgcolor: getStatusConfig(candidate.status || 'applied').bgcolor,
								color: getStatusConfig(candidate.status || 'applied').color,
								border: `1px solid ${getStatusConfig(candidate.status || 'applied').color}40`,
								borderRadius: '4px',
								cursor: 'pointer',
								'&:hover': {
									boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
									filter: 'brightness(0.95)'
								}
							}}
						/>
					</Box>
				) : (
					<Typography variant="body2" sx={{ color: 'text.disabled', px: 1 }}>
						—
					</Typography>
				)}
			</TableCell>
            {candidate.is_already_mapped && (
                <PlacementDetailDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    mappingId={candidate.mapping_id!}
                    candidateName={candidate.name}
                    jobTitle="Current Resource" // Title comes from parent usually
                />
            )}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleStatusClose}
                PaperProps={{
                    sx: {
                        mt: 0.5,
                        minWidth: 180,
                        maxHeight: 300,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '1px solid #e0e0e0',
                        '& .MuiMenuItem-root': {
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            py: 1,
                            '&:hover': { bgcolor: '#f5f8fa' }
                        }
                    }
                }}
            >
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f0f0f0', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        Change Status
                    </Typography>
                </Box>
                {statusOptions.map((opt) => (
                    <MenuItem 
                        key={opt.value} 
                        onClick={() => handleStatusUpdate(opt.value)}
                        selected={candidate.status === opt.value}
                    >
                        <ListItemIcon sx={{ minWidth: 28, color: getStatusConfig(opt.value).color }}>
                            {opt.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={getStatusConfig(opt.value).label} 
                            sx={{ '& .MuiTypography-root': { fontSize: '0.8125rem' } }}
                        />
                    </MenuItem>
                ))}
            </Menu>
			<TableCell sx={{ width: widths.skills }}>
				<Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
					{candidate.skills.slice(0, 2).map((skill: string, i: number) => (
						<Chip
							key={i}
							label={skill}
							size="small"
							variant="outlined"
							sx={{
								height: 22,
								fontSize: '0.75rem',
								fontWeight: 500,
								borderColor: 'divider',
								color: 'text.secondary',
								bgcolor: 'white',
								maxWidth: '120px' // Prevent excessive growth but Allow more than "P..."
							}}
						/>
					))}
					{candidate.skills.length > 2 && (
						<Tooltip title={candidate.skills.slice(2).join(', ')}>
							<Chip
								label={`+${candidate.skills.length - 2}`}
								size="small"
								sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600, bgcolor: 'action.hover' }}
							/>
						</Tooltip>
					)}
				</Stack>
			</TableCell>
			<TableCell 
                align="right" 
                sx={{ 
                    width: widths.actions, 
                    pr: 3, 
                    position: 'sticky',
                    right: 0,
                    bgcolor: 'white', 
                    zIndex: 10,
                    borderLeft: '2px solid #f0f0f0',
                    '.MuiTableRow-root:nth-of-type(even) &': { bgcolor: '#f9f9f9' },
                    '.MuiTableRow-root:hover &': { bgcolor: '#f5f8fa' }
                }}
            >
				{!candidate.is_already_mapped ? (
					<Button
						variant="outlined"
						size="small"
						onClick={() => onMap(candidate)}
						sx={{
							textTransform: 'none',
							fontWeight: 600,
							borderColor: 'divider',
							color: 'text.primary',
							px: 2,
							height: 28,
							'&:hover': {
								bgcolor: 'primary.main',
								color: 'white',
								borderColor: 'primary.main'
							}
						}}
					>
						Map
					</Button>
				) : (
					<Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
						<Box 
							sx={{ 
								px: 1, 
								py: 0.2, 
								borderRadius: '4px',
								bgcolor: '#e7f4e4', 
								color: '#1d8102',
								fontSize: '0.65rem',
								fontWeight: 800,
								textTransform: 'uppercase',
								letterSpacing: '0.02em',
								border: '1px solid #1d8102'
							}}
						>
							Mapped
						</Box>
						{canUnmap && (
                            <Tooltip title="View Lifecycle Timeline">
                                <IconButton 
                                    size="small" 
                                    onClick={() => setDrawerOpen(true)}
                                    sx={{ 
                                        color: 'primary.main',
                                        '&:hover': { bgcolor: 'primary.lighter' } 
                                    }}
                                >
                                    <HistoryIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        )}
                        {canUnmap && (
							<Tooltip title="Remove Mapping">
								<IconButton 
									size="small" 
									onClick={() => onUnmap(candidate)}
									sx={{ 
										color: 'rgba(0,0,0,0.3)',
										'&:hover': { 
											color: 'error.main', 
											bgcolor: 'rgba(217, 48, 37, 0.08)' 
										} 
									}}
								>
									<DeleteIcon sx={{ fontSize: 18 }} />
								</IconButton>
							</Tooltip>
						)}
					</Stack>
				)}
			</TableCell>
		</TableRow>
	);
};

export default CandidateMatchTableRow;
