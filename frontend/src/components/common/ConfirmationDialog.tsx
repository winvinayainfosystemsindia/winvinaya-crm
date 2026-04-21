import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    severity?: 'warning' | 'error' | 'info';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    severity = 'info'
}) => {
    const getColor = () => {
        switch (severity) {
            case 'error': return '#d13212';
            case 'warning': return '#ec7211';
            default: return '#0073bb';
        }
    };

    const getBgColor = () => {
        switch (severity) {
            case 'error': return '#fdf3f1';
            case 'warning': return '#fef6ed';
            default: return '#f1faff';
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={loading ? undefined : onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: '2px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1, bgcolor: getBgColor() }}>
                <Box sx={{ display: 'flex', p: 1, bgcolor: 'white', borderRadius: '4px', border: `1px solid ${getColor()}` }}>
                    <WarningIcon sx={{ color: getColor(), fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#232f3e', fontSize: '1rem' }}>
                    {title}
                </Typography>
            </DialogTitle>
            
            <Divider />

            <DialogContent sx={{ py: 3 }}>
                <DialogContentText sx={{ color: '#545b64', fontSize: '0.875rem' }}>
                    {message}
                </DialogContentText>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, bgcolor: '#fbfbfb' }}>
                <Button 
                    onClick={onCancel} 
                    disabled={loading}
                    sx={{ textTransform: 'none', fontWeight: 700, color: '#545b64' }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                    disableElevation
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: getColor(),
                        '&:hover': { bgcolor: getColor() },
                        px: 3,
                        borderRadius: '2px'
                    }}
                >
                    {loading ? 'Processing...' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
