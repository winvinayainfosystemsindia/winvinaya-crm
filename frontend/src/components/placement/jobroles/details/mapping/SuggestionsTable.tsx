import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    Tooltip,
    Chip,
    Avatar,
    TableRow,
    TableCell,
} from '@mui/material';
import {
    School as SchoolIcon,
    AccessibilityNew as DisabilityIcon,
    Psychology as SkillIcon,
} from '@mui/icons-material';
import DataTable, { type ColumnDefinition } from '../../../../common/table/DataTable';
import { type CandidateMatchResult } from '../../../../../store/slices/placementMappingSlice';

interface SuggestionsTableProps {
    candidates: CandidateMatchResult[];
    loading: boolean;
    page: number;
    rowsPerPage: number;
    totalCount: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    onMapClick: (candidate: CandidateMatchResult) => void;
    getScoreColor: (score: number) => string;
}

const SuggestionsTable: React.FC<SuggestionsTableProps> = ({
    candidates,
    loading,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    onMapClick,
    getScoreColor,
}) => {
    const columns: ColumnDefinition<CandidateMatchResult>[] = [
        { id: 'name', label: 'CANDIDATE', width: '25%' },
        { id: 'match_score', label: 'SCORE', align: 'center', width: '10%' },
        { id: 'skill_match', label: 'MATCH DETAILS', width: '30%' },
        { id: 'year_of_experience', label: 'EXP', align: 'center', width: '10%' },
        { id: 'other_mappings_count', label: 'MAPPINGS', width: '15%' },
        { id: 'actions', label: 'ACTION', align: 'right', width: '10%' },
    ];

    const renderRow = (candidate: CandidateMatchResult) => (
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
            <TableCell align="center">
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#545b64', fontSize: '0.8125rem' }}>
                    {candidate.year_of_experience || 'Fresher'}
                </Typography>
            </TableCell>
            <TableCell>
                {candidate.other_mappings_count > 0 ? (
                    <Tooltip title={`Mapped to: ${candidate.other_mappings.join(', ')}`}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 1,
                                py: 0.25,
                                borderRadius: '4px',
                                bgcolor: '#eaf3ff',
                                color: '#0066cc',
                                border: '1px solid #cce3ff',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                            }}
                        >
                            {candidate.other_mappings_count} {candidate.other_mappings_count === 1 ? 'Job' : 'Jobs'}
                        </Box>
                    </Tooltip>
                ) : (
                    <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>
                        None
                    </Typography>
                )}
            </TableCell>
            <TableCell align="right">
                <Button
                    variant="contained"
                    size="small"
                    disableElevation
                    onClick={() => onMapClick(candidate)}
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
    );

    return (
        <DataTable
            columns={columns}
            data={candidates}
            loading={loading}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            renderRow={renderRow}
            emptyMessage="No suggestions available at the moment."
            searchTerm=""
        />
    );
};

export default SuggestionsTable;
