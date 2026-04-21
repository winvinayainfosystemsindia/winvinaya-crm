import React, { useState, useEffect, useCallback } from 'react';
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
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
} from '@mui/material';
import {
    Close as CloseIcon,
    Email as EmailIcon,
    Subject as SubjectIcon,
    Message as MessageIcon,
    AttachFile as AttachIcon,
    Groups as GroupsIcon,
    ExpandLess,
    ExpandMore,
    Description as DocIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchAvailableDocuments } from '../../../../store/slices/placementEmailSlice';

interface CandidateEmailDialogProps {
    open: boolean;
    onClose: () => void;
    onSend: (data: { email: string; subject: string; message: string; document_ids: number[] }) => void;
    mappingIds: number[];
    candidateNames: string[];
    jobTitle: string;
    contactEmail: string;
    contactName: string;
    loading?: boolean;
}

const CandidateEmailDialog: React.FC<CandidateEmailDialogProps> = ({
    open,
    onClose,
    onSend,
    mappingIds,
    candidateNames,
    jobTitle,
    contactEmail,
    contactName,
    loading = false
}) => {
    const [email, setEmail] = useState(contactEmail);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    
    // Document Selection State from Redux
    const { availableDocuments: availableDocs, fetchLoading: fetchingDocs } = useAppSelector(state => state.placementEmail);
    const dispatch = useAppDispatch();
    
    const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
    const [expandedCandidates, setExpandedCandidates] = useState<Record<number, boolean>>({});

    const isBulk = mappingIds.length > 1;

    const fetchDocuments = useCallback(async () => {
        if (!mappingIds.length) return;
        try {
            const docs = await dispatch(fetchAvailableDocuments(mappingIds)).unwrap();
            
            // Auto-select latest resumes
            const resumeIds: number[] = [];
            docs.forEach(cGroup => {
                const resumes = cGroup.documents.filter(d => d.type === 'resume');
                if (resumes.length > 0) {
                    resumeIds.push(resumes[0].id);
                }
            });
            setSelectedDocIds(resumeIds);
            
            // Expand all by default
            const expanded: Record<number, boolean> = {};
            docs.forEach(d => expanded[d.mapping_id] = true);
            setExpandedCandidates(expanded);
        } catch (error) {
            console.error('Failed to fetch candidate documents', error);
        }
    }, [mappingIds, dispatch]);

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
                ? `Dear ${contactName},\n\nI hope this email finds you well.\n\nWe are pleased to share the profiles of the following candidates for the ${jobTitle} position at your organization:\n\n${candidateNames.map(n => `- ${n}`).join('\n')}\n\nPlease find the attached documents for your review. We look forward to your feedback and scheduling the next steps.\n\nBest regards,\nWinVinaya Placement Team`
                : `Dear ${contactName},\n\nI hope this email finds you well.\n\nWe are pleased to share the profile of ${candidateNames[0]} for the ${jobTitle} position at your organization. \n\nPlease find the attached documents for your review. We look forward to your feedback and scheduling the next steps.\n\nBest regards,\nWinVinaya Placement Team`;
            
            setMessage(defaultMessage);
            fetchDocuments();
        }
    }, [open, candidateNames, jobTitle, contactEmail, contactName, isBulk, fetchDocuments]);

    const handleToggleDoc = (docId: number) => {
        setSelectedDocIds(prev => 
            prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
        );
    };

    const handleToggleExpand = (mappingId: number) => {
        setExpandedCandidates(prev => ({ ...prev, [mappingId]: !prev[mappingId] }));
    };

    const handleSend = () => {
        if (email.trim() && subject.trim() && message.trim()) {
            onSend({ email, subject, message, document_ids: selectedDocIds });
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
                <Stack spacing={4} sx={{ mt: 1 }}>
                    <Box sx={{ borderBottom: '1px solid #eaeded', pb: 4 }}>
                        <Stack spacing={3}>
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
                                    rows={6}
                                    variant="outlined"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: '#232f3e', display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.05rem' }}>
                            <AttachIcon sx={{ fontSize: 18, color: '#0073bb' }} /> SELECT DOCUMENTS TO ATTACH
                        </Typography>

                        {fetchingDocs ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <CircularProgress size={30} sx={{ color: '#0073bb' }} />
                                <Typography variant="body2" sx={{ mt: 1, color: '#545b64' }}>Fetching candidate documents...</Typography>
                            </Box>
                        ) : availableDocs.length > 0 ? (
                            <List sx={{ bgcolor: '#f8f9f9', borderRadius: '8px', border: '1px solid #eaeded', p: 0 }}>
                                {availableDocs.map((cGroup) => (
                                    <React.Fragment key={cGroup.mapping_id}>
                                        <ListItem 
                                            disablePadding
                                            sx={{ 
                                                borderBottom: '1px solid #eaeded',
                                                bgcolor: 'white',
                                                '&:hover': { bgcolor: '#f1faff' }
                                            }}
                                        >
                                            <ListItemButton onClick={() => handleToggleExpand(cGroup.mapping_id)}>
                                                <ListItemIcon sx={{ minWidth: 40 }}>
                                                    <GroupsIcon sx={{ color: '#545b64', fontSize: 20 }} />
                                                </ListItemIcon>
                                                <ListItemText 
                                                    primary={cGroup.candidate_name} 
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 700, color: '#232f3e' }}
                                                    secondary={`${cGroup.documents.length} Available Documents`}
                                                />
                                                {expandedCandidates[cGroup.mapping_id] ? <ExpandLess /> : <ExpandMore />}
                                            </ListItemButton>
                                        </ListItem>
                                        <Collapse in={expandedCandidates[cGroup.mapping_id]} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {cGroup.documents.map((doc) => (
                                                    <ListItem 
                                                        key={doc.id}
                                                        sx={{ 
                                                            pl: 6, 
                                                            py: 1, 
                                                            bgcolor: selectedDocIds.includes(doc.id) ? '#f1faff' : 'transparent',
                                                            borderBottom: '1px solid #f1f1f1',
                                                            '&:last-child': { borderBottom: 'none' }
                                                        }}
                                                    >
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox 
                                                                    size="small" 
                                                                    checked={selectedDocIds.includes(doc.id)} 
                                                                    onChange={() => handleToggleDoc(doc.id)}
                                                                />
                                                            }
                                                            label={
                                                                <Stack direction="row" spacing={1} alignItems="center">
                                                                    <DocIcon sx={{ fontSize: 16, color: doc.type === 'resume' ? '#1d8102' : '#545b64' }} />
                                                                    <Typography variant="body2" sx={{ fontWeight: doc.type === 'resume' ? 700 : 500 }}>
                                                                        {doc.name}
                                                                    </Typography>
                                                                    {doc.type === 'resume' && (
                                                                        <Chip label="Resume" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#e7f4e4', color: '#1d8102' }} />
                                                                    )}
                                                                    <Typography variant="caption" sx={{ color: '#879596' }}>
                                                                        ({formatSize(doc.size)})
                                                                    </Typography>
                                                                </Stack>
                                                            }
                                                            sx={{ width: '100%', m: 0 }}
                                                        />
                                                    </ListItem>
                                                ))}
                                                {cGroup.documents.length === 0 && (
                                                    <ListItem sx={{ pl: 6, py: 2 }}>
                                                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#879596' }}>
                                                            No documents found for this candidate.
                                                        </Typography>
                                                    </ListItem>
                                                )}
                                            </List>
                                        </Collapse>
                                    </React.Fragment>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ p: 4, bgcolor: '#fcf3e8', border: '1px dashed #f9d9b7', borderRadius: '8px', textAlign: 'center' }}>
                                <Typography variant="body2" sx={{ color: '#871000', fontWeight: 600 }}>
                                    No documents found for the selected candidates. Resumes are required for attachments.
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: '#545b64', fontStyle: 'italic' }}>
                            * Selected documents will be sent as email attachments.
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="caption" sx={{ flexGrow: 1, ml: 2, fontWeight: 700, color: '#0073bb' }}>
                    {selectedDocIds.length} Total Attachments
                </Typography>
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
                        px: 4,
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
