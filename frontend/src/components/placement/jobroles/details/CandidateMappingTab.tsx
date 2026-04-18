import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    Paper,
    Tooltip,
    TextField,
    CircularProgress,
    List,
    ListItem,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Checkbox,
    alpha
} from '@mui/material';
import {
    Info as InfoIcon,
    TaskAlt as TaskAltIcon,
    School as SchoolIcon,
    AccessibilityNew as DisabilityIcon,
    Psychology as SkillIcon,
    AutoGraph as AutoGraphIcon,
    Close as CloseIcon,
    ArrowForward as ArrowForwardIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    GroupAdd as GroupAddIcon,
    AlternateEmail as EmailIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
    fetchMatchesForJobRole,
    mapCandidate,
    clearMatches,
    clearPlacementError,
    type CandidateMatchResult
} from '../../../../store/slices/placementMappingSlice';
import CandidateEmailDialog from '../../mapping/dialogs/CandidateEmailDialog';
import placementEmailService from '../../../../services/placementEmailService';
import useToast from '../../../../hooks/useToast';
import type { JobRole } from '../../../../models/jobRole';

interface CandidateMappingTabProps {
    jobRole: JobRole;
}

const CandidateMappingTab: React.FC<CandidateMappingTabProps> = ({ jobRole }) => {
    const toast = useToast();
    const dispatch = useAppDispatch();

    // Redux State
    const { matches: matchingCandidates, loading, error: placementError } = useAppSelector((state) => state.placementMapping);

    // Auto-display errors from slice
    useEffect(() => {
        if (placementError) {
            toast.error(placementError);
            dispatch(clearPlacementError());
        }
    }, [placementError, toast, dispatch]);

    // Pagination State (Frontend)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Mapping State
    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);
    const [mappingNotes, setMappingNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Bulk Email State
    const [selectedMappings, setSelectedMappings] = useState<number[]>([]);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const fetchData = useCallback(async () => {
        dispatch(fetchMatchesForJobRole(jobRole.public_id));
    }, [jobRole.public_id, dispatch]);

    useEffect(() => {
        fetchData();
        return () => {
            dispatch(clearMatches());
        };
    }, [fetchData, dispatch]);

    // Compute split lists
    const suggestions = useMemo(() =>
        matchingCandidates.filter(c => !c.is_already_mapped),
        [matchingCandidates]);

    const mapped = useMemo(() =>
        matchingCandidates.filter(c => c.is_already_mapped),
        [matchingCandidates]);

    // Paginated suggestions
    const paginatedSuggestions = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return suggestions.slice(startIndex, startIndex + rowsPerPage);
    }, [suggestions, page, rowsPerPage]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenMapDialog = (candidate: CandidateMatchResult) => {
        setSelectedCandidate(candidate);
        setMapDialogOpen(true);
    };

    const handleMapCandidate = async () => {
        if (!selectedCandidate) return;
        setSubmitting(true);
        try {
            await dispatch(mapCandidate({
                candidate_id: selectedCandidate.candidate_id,
                job_role_id: jobRole.id!,
                match_score: selectedCandidate.match_score,
                notes: mappingNotes
            })).unwrap();

            toast.success(`${selectedCandidate.name} has been successfully mapped`);
            setMapDialogOpen(false);
            setMappingNotes('');
            // fetchData(); // Optional, slice already updates the list
        } catch (error: any) {
            toast.error(error || 'Failed to map candidate');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleSelection = (mappingId: number) => {
        setSelectedMappings(prev =>
            prev.includes(mappingId)
                ? prev.filter(id => id !== mappingId)
                : [...prev, mappingId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allMappedIds = mapped.map(m => m.mapping_id).filter((id): id is number => !!id);
            setSelectedMappings(allMappedIds);
        } else {
            setSelectedMappings([]);
        }
    };

    const handleSendBulkEmail = async (data: { email: string; subject: string; message: string; document_ids: number[] }) => {
        setSendingEmail(true);
        try {
            await placementEmailService.sendBulkProfiles({
                mapping_ids: selectedMappings,
                document_ids: data.document_ids,
                custom_email: data.email,
                custom_subject: data.subject,
                custom_message: data.message
            });
            toast.success('Candidate profiles sent successfully');
            setEmailDialogOpen(false);
            setSelectedMappings([]);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to send bulk email');
        } finally {
            setSendingEmail(false);
        }
    };

    const selectedCandidateNames = useMemo(() => {
        return matchingCandidates
            .filter(c => selectedMappings.includes(c.mapping_id!))
            .map(c => c.name);
    }, [matchingCandidates, selectedMappings]);

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#1d8102';
        if (score >= 40) return '#ec7211';
        return '#d13212';
    };

    if (loading && matchingCandidates.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#ec7211' }} />
            </Box>
        );
    }

    return (
        <Grid container spacing={4} sx={{ mt: 1 }}>
            {/* Top/Left: Smart Suggestions Table */}
            <Grid size={{ xs: 12, md: 8.5 }}>
                <Paper variant="outlined" sx={{ borderRadius: 0, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#fbfbfb', borderBottom: '1px solid #d5dbdb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#ec7211', borderRadius: '4px', p: 0.5 }}>
                                <AutoGraphIcon sx={{ color: 'white', fontSize: 18 }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e' }}>
                                SMART SUGGESTIONS
                            </Typography>
                            <Chip
                                label={`${suggestions.length} available`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#eaeded', color: '#545b64' }}
                            />
                        </Stack>
                    </Box>

                    <TableContainer sx={{ minHeight: 400 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f8f9f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, py: 1.5 }}>CANDIDATE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="center">SCORE</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>MATCH DETAILS</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">ACTION</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedSuggestions.length > 0 ? (
                                    paginatedSuggestions.map((candidate) => (
                                        <TableRow key={candidate.public_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell sx={{ py: 2 }}>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: getScoreColor(candidate.match_score), width: 32, height: 32, fontSize: '0.875rem', fontWeight: 700 }}>
                                                        {candidate.name[0]}
                                                    </Avatar>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#007eb9', '&:hover': { textDecoration: 'underline' }, cursor: 'pointer' }}>
                                                        {candidate.name}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: getScoreColor(candidate.match_score) }}>
                                                    {candidate.match_score}%
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                                                    <Tooltip title={candidate.skill_match.details}>
                                                        <Chip
                                                            icon={<SkillIcon style={{ fontSize: 14 }} />}
                                                            label="Skills"
                                                            size="small"
                                                            variant="outlined"
                                                            color={candidate.skill_match.is_match ? "success" : "default"}
                                                            sx={{ height: 22, fontSize: '0.7rem', px: 0.5 }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title={candidate.qualification_match.details}>
                                                        <Chip
                                                            icon={<SchoolIcon style={{ fontSize: 14 }} />}
                                                            label="Edu"
                                                            size="small"
                                                            variant="outlined"
                                                            color={candidate.qualification_match.is_match ? "success" : "default"}
                                                            sx={{ height: 22, fontSize: '0.7rem', px: 0.5 }}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title={candidate.disability_match.details}>
                                                        <Chip
                                                            icon={<DisabilityIcon style={{ fontSize: 14 }} />}
                                                            label="DMap"
                                                            size="small"
                                                            variant="outlined"
                                                            color={candidate.disability_match.is_match ? "success" : "default"}
                                                            sx={{ height: 22, fontSize: '0.7rem', px: 0.5 }}
                                                        />
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disableElevation
                                                    onClick={() => handleOpenMapDialog(candidate)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        fontSize: '0.75rem',
                                                        bgcolor: '#f2f3f3',
                                                        color: '#545b64',
                                                        border: '1px solid #d5dbdb',
                                                        '&:hover': { bgcolor: '#eaeded', borderColor: '#aab7b8' }
                                                    }}
                                                >
                                                    Map Candidate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                            <Box sx={{ opacity: 0.5 }}>
                                                <InfoIcon sx={{ fontSize: 40, mb: 1, color: '#d5dbdb' }} />
                                                <Typography variant="body2">No suggestions available at the moment.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={suggestions.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{ borderTop: '1px solid #d5dbdb', bgcolor: '#fbfbfb' }}
                    />
                </Paper>
            </Grid>

            {/* Bottom/Right: Mapped Candidates List */}
            <Grid size={{ xs: 12, md: 3.5 }}>
                <Paper 
                    variant="outlined" 
                    sx={{ 
                        borderRadius: 0, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        bgcolor: 'white',
                        border: '1px solid #d5dbdb'
                    }}
                >
                    {/* Professional Section Header */}
                    <Box sx={{ 
                        p: 2, 
                        bgcolor: '#fbfbfb', 
                        borderBottom: '1px solid #d5dbdb', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        minHeight: '56px'
                    }}>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1d8102', borderRadius: '4px', p: 0.5 }}>
                                <TaskAltIcon sx={{ color: 'white', fontSize: 16 }} />
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#232f3e', letterSpacing: '0.02rem', textTransform: 'uppercase' }}>
                                Mapped Candidates ({mapped.length})
                            </Typography>
                        </Stack>

                        {mapped.length > 0 && (
                            <Tooltip title={selectedMappings.length > 0 ? `Send ${selectedMappings.length} Profiles` : "Select candidates to bulk email"}>
                                <span>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        disabled={selectedMappings.length === 0}
                                        onClick={() => setEmailDialogOpen(true)}
                                        startIcon={<EmailIcon sx={{ fontSize: '16px !important' }} />}
                                        sx={{ 
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            py: 0.25,
                                            px: 1.5,
                                            borderRadius: '4px',
                                            borderColor: '#d5dbdb',
                                            color: '#232f3e',
                                            bgcolor: 'white',
                                            '&:hover': { bgcolor: '#f3faff', borderColor: '#0073bb', color: '#0073bb' },
                                            '&.Mui-disabled': { bgcolor: '#f8f9f9', color: '#aab7b8' }
                                        }}
                                    >
                                        Send
                                    </Button>
                                </span>
                            </Tooltip>
                        )}
                    </Box>

                    {/* Compact Selection Bar */}
                    {mapped.length > 0 && (
                        <Box sx={{ 
                            px: 2, 
                            py: 0.75, 
                            bgcolor: '#f1faff', 
                            borderBottom: '1px solid #cdecff', 
                            display: 'flex', 
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Checkbox
                                    size="small"
                                    indeterminate={selectedMappings.length > 0 && selectedMappings.length < mapped.length}
                                    checked={mapped.length > 0 && selectedMappings.length === mapped.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    sx={{ p: 0, color: '#0073bb' }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0073bb' }}>
                                    {selectedMappings.length > 0 ? `${selectedMappings.length} Selected` : 'Select All'}
                                </Typography>
                            </Stack>
                            
                            {selectedMappings.length > 0 && (
                                <Button 
                                    size="small" 
                                    onClick={() => setSelectedMappings([])}
                                    sx={{ textTransform: 'none', fontSize: '0.65rem', fontWeight: 700, color: '#545b64', minWidth: 'auto', p: 0 }}
                                >
                                    Clear
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* Candidate List */}
                    <List sx={{ p: 0, flexGrow: 1, maxHeight: 520, overflow: 'auto' }}>
                        {mapped.length > 0 ? (
                            mapped.map((candidate) => (
                                <React.Fragment key={candidate.public_id}>
                                    <ListItem
                                        sx={{
                                            py: 1.5,
                                            px: 2,
                                            borderBottom: '1px solid #eaeded',
                                            transition: 'background-color 0.2s',
                                            cursor: 'pointer',
                                            '&:hover': { bgcolor: '#fbfbfb' },
                                            '&:last-child': { borderBottom: 'none' }
                                        }}
                                        onClick={() => handleToggleSelection(candidate.mapping_id!)}
                                    >
                                        <Checkbox
                                            size="small"
                                            checked={selectedMappings.includes(candidate.mapping_id!)}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={() => handleToggleSelection(candidate.mapping_id!)}
                                            sx={{ mr: 1, p: 0 }}
                                        />
                                        
                                        <Stack direction="row" spacing={1.5} sx={{ flexGrow: 1 }} alignItems="center">
                                            <Avatar 
                                                sx={{ 
                                                    width: 30, 
                                                    height: 30, 
                                                    bgcolor: getScoreColor(candidate.match_score),
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800
                                                }}
                                            >
                                                {candidate.name[0]}
                                            </Avatar>
                                            
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e', lineHeight: 1.2 }}>
                                                    {candidate.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                                                    <Box sx={{ 
                                                        px: 0.75, 
                                                        py: 0.1, 
                                                        bgcolor: alpha(getScoreColor(candidate.match_score), 0.1),
                                                        borderRadius: '2px',
                                                        border: `1px solid ${alpha(getScoreColor(candidate.match_score), 0.2)}`
                                                    }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800, color: getScoreColor(candidate.match_score), fontSize: '0.65rem' }}>
                                                            {candidate.match_score}%
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#545b64', fontSize: '0.65rem' }}>
                                                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </ListItem>
                                </React.Fragment>
                            ))
                        ) : (
                            <Box sx={{ p: 4, textAlign: 'center', mt: 4, opacity: 0.6 }}>
                                <InfoIcon sx={{ fontSize: 32, color: '#d5dbdb', mb: 1 }} />
                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                    No candidates mapped yet.
                                </Typography>
                            </Box>
                        )}
                    </List>
                </Paper>
            </Grid>

            {/* Map Candidate Dialog (Professional Redesign) */}
            <Dialog
                open={mapDialogOpen}
                onClose={() => setMapDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 0 }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: '#232f3e',
                    color: 'white',
                    px: 3,
                    py: 2
                }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <GroupAddIcon sx={{ color: '#ec7211' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                            Mapping Confirmation
                        </Typography>
                    </Stack>
                    <IconButton size="small" onClick={() => setMapDialogOpen(false)} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ pt: 4, pb: 2 }}>
                    {/* Mapping Flow Component */}
                    <Box sx={{
                        mb: 4,
                        p: 3,
                        bgcolor: '#f8f9f9',
                        border: '1px solid #eaeded',
                        borderRadius: '4px',
                        position: 'relative'
                    }}>
                        <Grid container spacing={2} alignItems="center">
                            {/* Left: Job Role */}
                            <Grid size={{ xs: 5 }}>
                                <Stack spacing={1} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: 'white', border: '1px solid #eaeded', borderRadius: '50%' }}>
                                        <BusinessIcon sx={{ color: '#545b64', fontSize: 24 }} />
                                    </Box>
                                    <Box textAlign="center">
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block' }}>JOB ROLE</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{jobRole.title}</Typography>
                                        <Typography variant="caption" color="textSecondary">{jobRole.company?.name}</Typography>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Middle: Match Flow */}
                            <Grid size={{ xs: 2 }}>
                                <Stack alignItems="center" spacing={0.5}>
                                    <Box sx={{ color: '#ec7211' }}>
                                        <TrendingUpIcon fontSize="small" />
                                    </Box>
                                    <ArrowForwardIcon sx={{ color: '#d5dbdb' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: getScoreColor(selectedCandidate?.match_score || 0) }}>
                                        {selectedCandidate?.match_score}%
                                    </Typography>
                                </Stack>
                            </Grid>

                            {/* Right: Candidate */}
                            <Grid size={{ xs: 5 }}>
                                <Stack spacing={1} alignItems="center">
                                    <Avatar sx={{ bgcolor: getScoreColor(selectedCandidate?.match_score || 0), width: 44, height: 44 }}>
                                        <PersonIcon />
                                    </Avatar>
                                    <Box textAlign="center">
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, display: 'block' }}>CANDIDATE</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{selectedCandidate?.name}</Typography>
                                        <Typography variant="caption" color="textSecondary">Ready for Mapping</Typography>
                                    </Box>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 1 }}>
                        Mapping Notes
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add professional notes regarding this mapping decision..."
                        value={mappingNotes}
                        onChange={(e) => setMappingNotes(e.target.value)}
                        variant="outlined"
                        sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: 0 },
                            mb: 3
                        }}
                    />

                    <Box sx={{
                        p: 2,
                        bgcolor: '#fcf3e8',
                        border: '1px solid #f9d9b7',
                        display: 'flex',
                        gap: 1.5,
                        alignItems: 'flex-start'
                    }}>
                        <InfoIcon sx={{ color: '#ec7211', mt: 0.25, fontSize: 20 }} />
                        <Typography variant="caption" sx={{ color: '#663c00', lineHeight: 1.5 }}>
                            <strong>Next Steps:</strong> Once confirmed, this candidate will be listed under the "Mapped Candidates" section. You can then manage their screening and interview progression in the Placement Tracking module.
                        </Typography>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, borderTop: '1px solid #d5dbdb', bgcolor: '#fbfbfb' }}>
                    <Button
                        onClick={() => setMapDialogOpen(false)}
                        sx={{
                            color: '#545b64',
                            textTransform: 'none',
                            fontWeight: 700,
                            mr: 1
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleMapCandidate}
                        disabled={submitting}
                        sx={{
                            bgcolor: '#ec7211',
                            '&:hover': { bgcolor: '#eb5f07' },
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: 'none',
                            px: 4,
                            py: 1,
                            borderRadius: '4px'
                        }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Mapping'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Email Dialog Integration */}
            {jobRole.contact && (
                <CandidateEmailDialog
                    open={emailDialogOpen}
                    onClose={() => setEmailDialogOpen(false)}
                    onSend={handleSendBulkEmail}
                    mappingIds={selectedMappings}
                    candidateNames={selectedCandidateNames}
                    jobTitle={jobRole.title}
                    contactEmail={jobRole.contact.email || ''}
                    contactName={jobRole.contact.full_name || 'Hiring Manager'}
                    loading={sendingEmail}
                />
            )}
        </Grid>
    );
};

export default CandidateMappingTab;
