import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    TextField,
    CircularProgress,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
} from '@mui/material';
import {
    Info as InfoIcon,
    Close as CloseIcon,
    ArrowForward as ArrowForwardIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    GroupAdd as GroupAddIcon,
} from '@mui/icons-material';
import { type CandidateMatchResult } from '../../../../../store/slices/placementMappingSlice';
import type { JobRole } from '../../../../../models/jobRole';

interface MappingDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    jobRole: JobRole;
    selectedCandidate: CandidateMatchResult | null;
    mappingNotes: string;
    onNotesChange: (notes: string) => void;
    submitting: boolean;
    getScoreColor: (score: number) => string;
}

const MappingDialog: React.FC<MappingDialogProps> = ({
    open,
    onClose,
    onConfirm,
    jobRole,
    selectedCandidate,
    mappingNotes,
    onNotesChange,
    submitting,
    getScoreColor,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
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
                <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
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
                    onChange={(e) => onNotesChange(e.target.value)}
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
                    onClick={onClose}
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
                    onClick={onConfirm}
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
    );
};

export default MappingDialog;
