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
    useTheme,
    alpha
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
    const theme = useTheme();
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: theme.shape.borderRadius }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
                px: 3,
                py: 2
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <GroupAddIcon sx={{ color: theme.palette.primary.light }} />
                    <Typography variant="h6">
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
                    bgcolor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    position: 'relative'
                }}>
                    <Grid container spacing={2} alignItems="center">
                        {/* Left: Job Role */}
                        <Grid size={{ xs: 5 }}>
                            <Stack spacing={1} alignItems="center">
                                <Box sx={{ p: 1, bgcolor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: '50%' }}>
                                    <BusinessIcon sx={{ color: theme.palette.text.secondary, fontSize: 24 }} />
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="awsFieldLabel">JOB ROLE</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{jobRole.title}</Typography>
                                    <Typography variant="caption" color="textSecondary">{jobRole.company?.name}</Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        {/* Middle: Match Flow */}
                        <Grid size={{ xs: 2 }}>
                            <Stack alignItems="center" spacing={0.5}>
                                <Box sx={{ color: theme.palette.primary.main }}>
                                    <TrendingUpIcon fontSize="small" />
                                </Box>
                                <ArrowForwardIcon sx={{ color: theme.palette.divider }} />
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
                                    <Typography variant="awsFieldLabel">CANDIDATE</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>{selectedCandidate?.name}</Typography>
                                    <Typography variant="caption" color="textSecondary">Ready for Mapping</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                <Typography variant="awsSectionTitle" sx={{ mb: 1 }}>
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
                        '& .MuiOutlinedInput-root': { borderRadius: '2px' },
                        mb: 3
                    }}
                />

                <Box sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${theme.palette.warning.light}`,
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start'
                }}>
                    <InfoIcon sx={{ color: theme.palette.warning.main, mt: 0.25, fontSize: 20 }} />
                    <Typography variant="caption" sx={{ color: theme.palette.warning.dark, lineHeight: 1.5 }}>
                        <strong>Next Steps:</strong> Once confirmed, this candidate will be listed under the "Mapped Candidates" section. You can then manage their screening and interview progression in the Placement Tracking module.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
                <Button
                    onClick={onClose}
                    sx={{
                        color: theme.palette.text.secondary,
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
                        bgcolor: theme.palette.primary.main,
                        '&:hover': { bgcolor: theme.palette.primary.dark },
                        px: 4,
                        py: 1
                    }}
                >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirm Mapping'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MappingDialog;
