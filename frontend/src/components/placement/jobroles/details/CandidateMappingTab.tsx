import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    Paper,
    Divider,
    Tooltip,
    TextField,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    GroupAdd as GroupAddIcon,
    TaskAlt as TaskAltIcon,
    ErrorOutline as ErrorOutlineIcon,
    School as SchoolIcon,
    AccessibilityNew as DisabilityIcon,
    Psychology as SkillIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import type { JobRole } from '../../../../models/jobRole';
import placementMappingService from '../../../../services/placementMappingService';
import type { CandidateMatchResult } from '../../../../services/placementMappingService';

interface CandidateMappingTabProps {
    jobRole: JobRole;
}

const CandidateMappingTab: React.FC<CandidateMappingTabProps> = ({ jobRole }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [matchingCandidates, setMatchingCandidates] = useState<CandidateMatchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);
    const [mappingNotes, setMappingNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const matches = await placementMappingService.getMatchesForJobRole(jobRole.public_id);
            setMatchingCandidates(matches);
        } catch (error: any) {
            enqueueSnackbar('Failed to fetch mapping data', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [jobRole.public_id, enqueueSnackbar]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenMapDialog = (candidate: CandidateMatchResult) => {
        setSelectedCandidate(candidate);
        setMapDialogOpen(true);
    };

    const handleMapCandidate = async () => {
        if (!selectedCandidate) return;
        setSubmitting(true);
        try {
            await placementMappingService.mapCandidate({
                candidate_id: selectedCandidate.candidate_id,
                job_role_id: jobRole.id!,
                match_score: selectedCandidate.match_score,
                notes: mappingNotes
            });
            
            enqueueSnackbar(`${selectedCandidate.name} has been successfully mapped`, { variant: 'success' });
            setMapDialogOpen(false);
            setMappingNotes('');
            fetchData();
        } catch (error: any) {
            enqueueSnackbar(error?.response?.data?.detail || 'Failed to map candidate', { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#1d8102';
        if (score >= 40) return '#ff9900';
        return '#d13212';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#ec7211' }} />
            </Box>
        );
    }

    return (
        <Grid container spacing={4}>
            {/* Left: Suggested Candidates */}
            <Grid size={{ xs: 12, md: 7 }}>
                <Paper variant="outlined" sx={{ borderRadius: 0 }}>
                    <Box sx={{ p: 2, bgcolor: '#fbfbfb', borderBottom: '1px solid #d5dbdb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <GroupAddIcon sx={{ color: '#545b64' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Smart Suggestions
                            </Typography>
                            <Chip label={`${matchingCandidates.filter(c => !c.is_already_mapped).length} available`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#f2f3f3' }} />
                        </Stack>
                    </Box>
                    <List sx={{ p: 0 }}>
                        {matchingCandidates.filter(c => !c.is_already_mapped).map((candidate, index) => (
                            <React.Fragment key={candidate.public_id}>
                                {index > 0 && <Divider />}
                                <ListItem
                                    sx={{
                                        py: 2.5,
                                        '&:hover': { bgcolor: '#fbfbfb' },
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ bgcolor: getScoreColor(candidate.match_score), width: 32, height: 32, fontSize: '0.875rem' }}>
                                                    {candidate.name[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#007eb9', cursor: 'pointer' }}>
                                                        {candidate.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Score: <span style={{ color: getScoreColor(candidate.match_score), fontWeight: 700 }}>{candidate.match_score}%</span>
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title={candidate.skill_match.details}>
                                                    <Chip icon={<SkillIcon style={{ fontSize: 14 }} />} label="Skills" size="small" variant="outlined" color={candidate.skill_match.is_match ? "success" : "default"} sx={{ height: 20, fontSize: '0.65rem' }} />
                                                </Tooltip>
                                                <Tooltip title={candidate.qualification_match.details}>
                                                    <Chip icon={<SchoolIcon style={{ fontSize: 14 }} />} label="Edu" size="small" variant="outlined" color={candidate.qualification_match.is_match ? "success" : "default"} sx={{ height: 20, fontSize: '0.65rem' }} />
                                                </Tooltip>
                                                <Tooltip title={candidate.disability_match.details}>
                                                    <Chip icon={<DisabilityIcon style={{ fontSize: 14 }} />} label="Dis" size="small" variant="outlined" color={candidate.disability_match.is_match ? "success" : "default"} sx={{ height: 20, fontSize: '0.65rem' }} />
                                                </Tooltip>
                                            </Stack>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => handleOpenMapDialog(candidate)}
                                                sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderColor: '#d5dbdb', color: '#545b64' }}
                                            >
                                                Map
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                    {matchingCandidates.filter(c => !c.is_already_mapped).length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <InfoIcon sx={{ color: '#d5dbdb', fontSize: 40, mb: 1 }} />
                            <Typography variant="body2" color="textSecondary">No new suggestions found.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>

            {/* Right: Mapped Candidates */}
            <Grid size={{ xs: 12, md: 5 }}>
                <Paper variant="outlined" sx={{ borderRadius: 0 }}>
                    <Box sx={{ p: 2, bgcolor: '#fbfbfb', borderBottom: '1px solid #d5dbdb' }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <TaskAltIcon sx={{ color: '#1d8102' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                Mapped Candidates
                            </Typography>
                        </Stack>
                    </Box>
                    <List sx={{ p: 0 }}>
                        {matchingCandidates.filter(c => c.is_already_mapped).map((candidate, index) => (
                            <React.Fragment key={candidate.public_id}>
                                {index > 0 && <Divider />}
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: '#1d8102' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                {candidate.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="textSecondary">
                                                Mapped on {new Date().toLocaleDateString()}
                                            </Typography>
                                        }
                                    />
                                    <Chip label={`${candidate.match_score}%`} size="small" sx={{ fontWeight: 700, bgcolor: '#f2f3f3' }} />
                                </ListItem>
                            </React.Fragment>
                        ))}
                    </List>
                    {matchingCandidates.filter(c => c.is_already_mapped).length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="textSecondary">No candidates mapped to this role yet.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>

            {/* Map Candidate Dialog */}
            <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #d5dbdb' }}>
                    Map Candidate to Job Role
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f2f3f3' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Candidate</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>{selectedCandidate?.name}</Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Match Score: <span style={{ color: getScoreColor(selectedCandidate?.match_score || 0), fontWeight: 700 }}>{selectedCandidate?.match_score}%</span>
                        </Typography>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Mapping Notes"
                        placeholder="Add why this candidate was mapped..."
                        value={mappingNotes}
                        onChange={(e) => setMappingNotes(e.target.value)}
                        variant="outlined"
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <ErrorOutlineIcon sx={{ color: '#ec7211', fontSize: 18 }} />
                        <Typography variant="caption" color="textSecondary">
                            This will record the mapping. Detailed interview tracking will follow in the next module.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #d5dbdb' }}>
                    <Button onClick={() => setMapDialogOpen(false)} sx={{ color: '#545b64', textTransform: 'none', fontWeight: 700 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleMapCandidate}
                        disabled={submitting}
                        sx={{ bgcolor: '#ec7211', '&:hover': { bgcolor: '#eb5f07' }, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Mapping'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default CandidateMappingTab;
