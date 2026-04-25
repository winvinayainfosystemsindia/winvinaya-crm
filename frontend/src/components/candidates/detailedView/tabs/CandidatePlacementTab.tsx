import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Stack,
    Divider,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Button,
    useTheme,
    alpha
} from '@mui/material';
import {
    Business as BusinessIcon,
    Work as WorkIcon,
    CalendarToday as CalendarIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import type { Candidate } from '../../../../models/candidate';
import placementMappingService from '../../../../services/placementMappingService';
import type { PlacementMapping } from '../../../../services/placementMappingService';
import { SectionCard } from '../DetailedViewCommon';

interface CandidatePlacementTabProps {
    candidate: Candidate;
}

const CandidatePlacementTab: React.FC<CandidatePlacementTabProps> = ({ candidate }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [mappings, setMappings] = useState<PlacementMapping[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMappings = useCallback(async () => {
        if (!candidate.id) return;
        setLoading(true);
        try {
            const data = await placementMappingService.getCandidateMappings(candidate.id);
            setMappings(data);
        } catch (error: any) {
            enqueueSnackbar('Failed to fetch candidate mappings', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [candidate.id, enqueueSnackbar]);

    useEffect(() => {
        fetchMappings();
    }, [fetchMappings]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
        );
    }

    return (
        <SectionCard>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Mapped Job Roles</Typography>

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                {mappings.length > 0 ? (
                    <List sx={{ p: 0 }}>
                        {mappings.map((mapping, index) => (
                            <React.Fragment key={mapping.id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    sx={{
                                        py: 2,
                                        px: 3,
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                    {mapping.job_role?.title || 'Job Role'}
                                                </Typography>
                                                <Chip
                                                    label={`${mapping.match_score}% Match`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        bgcolor: mapping.match_score >= 70 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                                                        color: mapping.match_score >= 70 ? 'success.main' : 'warning.main'
                                                    }}
                                                />
                                            </Stack>
                                        }
                                        secondary={
                                            <Stack direction="row" spacing={3} sx={{ mt: 0.5 }}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Company</Typography>}
                                                    secondary={<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{mapping.job_role?.company?.name || 'N/A'}</Typography>}
                                                />
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="textSecondary">
                                                        Mapped on {new Date(mapping.mapped_at).toLocaleDateString()}
                                                    </Typography>
                                                </Stack>
                                            </Stack>
                                        }
                                    />
                                    {mapping.job_role?.public_id && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            endIcon={<ArrowForwardIcon />}
                                            onClick={() => navigate(`/job-roles/${mapping.job_role_id}`)}
                                            sx={{
                                                textTransform: 'none',
                                                fontWeight: 600,
                                                borderRadius: 1,
                                                color: 'info.main',
                                                borderColor: 'info.main',
                                                '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.05), borderColor: 'info.dark' }
                                            }}
                                        >
                                            View Role
                                        </Button>
                                    )}
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <WorkIcon sx={{ color: 'action.disabled', fontSize: 48, mb: 2 }} />
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            No active mappings
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            This candidate has not been mapped to any job roles yet.
                        </Typography>
                    </Box>
                )}
            </Box>

            {mappings.length > 0 && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 3, p: 2, bgcolor: '#f2f3f3', borderLeft: '4px solid #007eb9' }}>
                    <InfoIcon sx={{ color: '#007eb9', fontSize: 20 }} />
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Recruitment Workflow</Typography>
                        <Typography variant="caption" color="textSecondary">
                            Mappings represent initial candidate-job matching. Use the tracking system (coming soon) to manage interviews and offers.
                        </Typography>
                    </Box>
                </Stack>
            )}
        </SectionCard>
    );
};

export default CandidatePlacementTab;
