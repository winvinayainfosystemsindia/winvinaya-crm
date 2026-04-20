import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    Paper,
    Tooltip,
    List,
    ListItem,
    Avatar,
    Checkbox,
    alpha
} from '@mui/material';
import {
    TaskAlt as TaskAltIcon,
    AlternateEmail as EmailIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { type CandidateMatchResult } from '../../../../../store/slices/placementMappingSlice';

interface MappedCandidatesListProps {
    mapped: CandidateMatchResult[];
    selectedMappings: number[];
    onToggleSelection: (mappingId: number) => void;
    onSelectAll: (checked: boolean) => void;
    onEmailClick: () => void;
    getScoreColor: (score: number) => string;
}

const MappedCandidatesList: React.FC<MappedCandidatesListProps> = ({
    mapped,
    selectedMappings,
    onToggleSelection,
    onSelectAll,
    onEmailClick,
    getScoreColor,
}) => {
    return (
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
                                onClick={onEmailClick}
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
                            onChange={(e) => onSelectAll(e.target.checked)}
                            sx={{ p: 0, color: '#0073bb' }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0073bb' }}>
                            {selectedMappings.length > 0 ? `${selectedMappings.length} Selected` : 'Select All'}
                        </Typography>
                    </Stack>

                    {selectedMappings.length > 0 && (
                        <Button
                            size="small"
                            onClick={() => onSelectAll(false)} // Clear selection
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
                                onClick={() => onToggleSelection(candidate.mapping_id!)}
                            >
                                <Checkbox
                                    size="small"
                                    checked={selectedMappings.includes(candidate.mapping_id!)}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => onToggleSelection(candidate.mapping_id!)}
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
                                            <Box sx={{ bgcolor: '#f2f3f3', px: 0.75, py: 0.1, borderRadius: '2px', border: '1px solid #d5dbdb' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#545b64', fontSize: '0.65rem' }}>
                                                    {candidate.year_of_experience || 'Fresher'}
                                                </Typography>
                                            </Box>
                                            {candidate.other_mappings_count > 0 && (
                                                <Box sx={{ bgcolor: '#eaf3ff', px: 0.75, py: 0.1, borderRadius: '2px', border: '1px solid #cce3ff' }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0066cc', fontSize: '0.65rem' }}>
                                                        +{candidate.other_mappings_count}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Typography variant="caption" sx={{ color: '#aab7b8', fontSize: '0.65rem' }}>
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
    );
};

export default MappedCandidatesList;
