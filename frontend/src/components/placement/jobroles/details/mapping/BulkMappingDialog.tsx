import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    TextField,
    Divider,
    Stack,
    Chip
} from '@mui/material';
import { GroupAdd as BulkIcon } from '@mui/icons-material';
import type { JobRole } from '../../../../../models/jobRole';

interface BulkMappingDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    jobRole: JobRole;
    selectedCount: number;
    notes: string;
    onNotesChange: (notes: string) => void;
    submitting: boolean;
}

const BulkMappingDialog: React.FC<BulkMappingDialogProps> = ({
    open,
    onClose,
    onConfirm,
    jobRole,
    selectedCount,
    notes,
    onNotesChange,
    submitting
}) => {
    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: '2px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Box sx={{ display: 'flex', p: 1, bgcolor: '#f1faff', borderRadius: '4px' }}>
                    <BulkIcon sx={{ color: '#0073bb' }} />
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#232f3e', fontSize: '1.1rem' }}>
                        Bulk Map Candidates
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Assign multiple candidates to {jobRole.title}
                    </Typography>
                </Box>
            </DialogTitle>
            
            <Divider />

            <DialogContent sx={{ py: 3 }}>
                <Stack spacing={3}>
                    <Box sx={{ p: 2, bgcolor: '#f8f9f9', border: '1px solid #eaeded', borderRadius: '4px' }}>
                        <Typography variant="body2" sx={{ mb: 2, color: '#545b64' }}>
                            You are about to map <strong>{selectedCount}</strong> candidates to:
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip 
                                label={jobRole.title} 
                                size="small" 
                                sx={{ fontWeight: 700, bgcolor: '#232f3e', color: 'white', borderRadius: '4px' }} 
                            />
                            {jobRole.company && (
                                <Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600 }}>
                                    at {jobRole.company.name}
                                </Typography>
                            )}
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#232f3e' }}>
                            Common Mapping Notes (Optional)
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Add notes that will be applied to all selected candidates..."
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '2px',
                                    bgcolor: '#fcfcfc',
                                    '& fieldset': { borderColor: '#d5dbdb' },
                                    '&.Mui-focused fieldset': { borderColor: '#ec7211' }
                                }
                            }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            These notes will be visible in the candidate's placement pipeline history.
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, bgcolor: '#fbfbfb' }}>
                <Button 
                    onClick={onClose} 
                    disabled={submitting}
                    sx={{ textTransform: 'none', fontWeight: 700, color: '#545b64' }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={submitting}
                    disableElevation
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#ec7211',
                        '&:hover': { bgcolor: '#eb5f07' },
                        px: 3
                    }}
                >
                    {submitting ? 'Mapping Candidates...' : `Map ${selectedCount} Candidates`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BulkMappingDialog;
