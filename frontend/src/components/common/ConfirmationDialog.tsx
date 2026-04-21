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
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';

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
    const theme = useTheme();

    const getColor = () => {
        switch (severity) {
            case 'error': return theme.palette.error.main;
            case 'warning': return theme.palette.warning.main;
            default: return theme.palette.info.main;
        }
    };

    const getBgColor = () => {
        switch (severity) {
            case 'error': return alpha(theme.palette.error.main, 0.05);
            case 'warning': return alpha(theme.palette.warning.main, 0.05);
            default: return alpha(theme.palette.info.main, 0.05);
        }
    };

    const getIcon = () => {
        switch (severity) {
            case 'error': return <ErrorIcon sx={{ color: getColor(), fontSize: 20 }} />;
            case 'warning': return <WarningIcon sx={{ color: getColor(), fontSize: 20 }} />;
            default: return <InfoIcon sx={{ color: getColor(), fontSize: 20 }} />;
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={loading ? undefined : onCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: theme.shape.borderRadius, boxShadow: theme.shadows[8] }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.5, bgcolor: getBgColor() }}>
                <Box sx={{ display: 'flex', p: 1, bgcolor: theme.palette.background.paper, borderRadius: '4px', border: `1px solid ${getColor()}` }}>
                    {getIcon()}
                </Box>
                <Typography variant="h6">
                    {title}
                </Typography>
            </DialogTitle>
            
            <Divider />

            <DialogContent sx={{ py: 3 }}>
                <DialogContentText sx={{ color: theme.palette.text.secondary }}>
                    {message}
                </DialogContentText>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                <Button 
                    onClick={onCancel} 
                    disabled={loading}
                    sx={{ color: theme.palette.text.secondary }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    disabled={loading}
                    disableElevation
                    sx={{
                        bgcolor: getColor(),
                        '&:hover': { bgcolor: getColor() },
                        px: 3
                    }}
                >
                    {loading ? 'Processing...' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
