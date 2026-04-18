import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Stack,
    IconButton,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Subject as SubjectIcon,
    Message as MessageIcon,
    AttachFile as AttachIcon,
    Groups as GroupsIcon
} from '@mui/icons-material';

interface CandidateEmailDialogProps {
    open: boolean;
    onClose: () => void;
    onSend: (data: { email: string; subject: string; message: string }) => void;
    candidateNames: string[]; // Supports multiple names for bulk
    jobTitle: string;
    contactEmail: string;
    contactName: string;
    loading?: boolean;
}

const CandidateEmailDialog: React.FC<CandidateEmailDialogProps> = ({
    open,
    onClose,
    onSend,
    candidateNames,
    jobTitle,
    contactEmail,
    contactName,
    loading = false
}) => {
    const [email, setEmail] = useState(contactEmail);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const isBulk = candidateNames.length > 1;

    useEffect(() => {
        if (open) {
            setEmail(contactEmail);
            
            let namesStr = candidateNames[0];
            if (isBulk) {
                namesStr = `${candidateNames.slice(0, 2).join(', ')}`;
                if (candidateNames.length > 2) {
                    namesStr += ` and ${candidateNames.length - 2} others`;
                }
            }

            const defaultSubject = isBulk 
                ? `Candidate Profiles for ${jobTitle} - ${namesStr}`
                : `Profile for ${jobTitle} - ${candidateNames[0]}`;
                
            setSubject(defaultSubject);

            const defaultMessage = isBulk
                ? `Dear ${contactName},\n\nI hope this email finds you well.\n\nWe are pleased to share the profiles of the following candidates for the ${jobTitle} position at your organization:\n\n${candidateNames.map(n => `- ${n}`).join('\n')}\n\nPlease find the attached resumes for your review. We look forward to your feedback and scheduling the next steps.\n\nBest regards,\nWinVinaya Placement Team`
                : `Dear ${contactName},\n\nI hope this email finds you well.\n\nWe are pleased to share the profile of ${candidateNames[0]} for the ${jobTitle} position at your organization. \n\nPlease find the attached resume for your review. We look forward to your feedback and scheduling the next steps.\n\nBest regards,\nWinVinaya Placement Team`;
            
            setMessage(defaultMessage);
        }
    }, [open, candidateNames, jobTitle, contactEmail, contactName, isBulk]);

    const handleSend = () => {
        if (email.trim() && subject.trim() && message.trim()) {
            onSend({ email, subject, message });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' } }}>
            <DialogTitle sx={{
                bgcolor: '#232f3e',
                color: 'white',
                py: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {isBulk ? <GroupsIcon sx={{ color: '#ff9900' }} /> : <EmailIcon sx={{ color: '#ff9900' }} />}
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {isBulk ? `Send ${candidateNames.length} Candidate Profiles` : 'Send Candidate Profile'}
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    {isBulk && (
                        <Box sx={{ mb: 1 }}>
                             <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#545b64' }}>
                                SELECTED CANDIDATES
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {candidateNames.map((name, i) => (
                                    <Chip key={i} label={name} size="small" variant="outlined" sx={{ borderRadius: '4px' }} />
                                ))}
                            </Stack>
                        </Box>
                    )}

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#545b64', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon sx={{ fontSize: 16 }} /> RECIPIENT EMAIL
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@company.com"
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#545b64', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SubjectIcon sx={{ fontSize: 16 }} /> SUBJECT
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#545b64', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MessageIcon sx={{ fontSize: 16 }} /> MESSAGE
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={isBulk ? 10 : 7}
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Compose your message..."
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                        />
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#f1faff', borderRadius: '8px', border: '1px dashed #0073bb' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <AttachIcon sx={{ color: '#0073bb' }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0073bb' }}>
                                    {isBulk ? `Automatic Attachments (${candidateNames.length} Files)` : 'Automatic Attachment'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#545b64' }}>
                                    {isBulk 
                                        ? "Resumes for all selected candidates will be automatically attached if available."
                                        : "Candidate's latest resume will be automatically attached if available."}
                                </Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', fontWeight: 600, color: '#545b64' }}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSend}
                    variant="contained"
                    disabled={loading || !email.trim() || !subject.trim() || !message.trim()}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EmailIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: '#ec7211',
                        borderRadius: '6px',
                        px: 3,
                        '&:hover': { bgcolor: '#eb5f07' }
                    }}
                >
                    {loading ? 'Sending...' : isBulk ? 'Send All Profiles' : 'Send Profile'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CandidateEmailDialog;
