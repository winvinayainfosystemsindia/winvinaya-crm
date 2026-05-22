import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Tooltip,
    Chip,
    Avatar,
    TableRow,
    TableCell,
    Checkbox,
    Button,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    School as SchoolIcon,
    AccessibilityNew as DisabilityIcon,
    Psychology as SkillIcon,
    AutoAwesome as AIIcon,
    WorkOutline as WorkIcon,
} from '@mui/icons-material';
import DataTable, { type ColumnDefinition } from '../../../../common/table/DataTable';
import { type CandidateMatchResult } from '../../../../../store/slices/placementMappingSlice';

interface SuggestionsTableProps {
    candidates: CandidateMatchResult[];
    loading: boolean;
    aiScoring?: boolean;
    page: number;
    rowsPerPage: number;
    totalCount: number;
    onPageChange: (newPage: number) => void;
    onRowsPerPageChange: (newRowsPerPage: number) => void;
    getScoreColor: (score: number) => string;
    selectedIds: number[];
    onToggleSelect: (candidateId: number) => void;
    onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onRefresh: () => void;
    onFilterOpen: () => void;
    activeFilterCount: number;
    headerActions?: React.ReactNode;
    onScoreWithAI?: () => void;
}

const REC_CONFIG: Record<string, { color: string; label: string }> = {
    'Highly Recommended': { color: '#16a34a', label: 'Highly Recommended' },
    'Recommended':        { color: '#0284c7', label: 'Recommended' },
    'Consider':           { color: '#d97706', label: 'Consider' },
    'Low Match':          { color: '#dc2626', label: 'Low Match' },
};

const SuggestionsTable: React.FC<SuggestionsTableProps> = ({
    candidates,
    loading,
    aiScoring = false,
    page,
    rowsPerPage,
    totalCount,
    onPageChange,
    onRowsPerPageChange,
    getScoreColor,
    selectedIds,
    onToggleSelect,
    onSelectAll,
    searchTerm,
    onSearchChange,
    onRefresh,
    onFilterOpen,
    activeFilterCount,
    headerActions,
    onScoreWithAI,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const columns: ColumnDefinition<CandidateMatchResult>[] = [
        { id: 'name',                label: 'CANDIDATE',     width: '28%' },
        { id: 'match_score',         label: 'MATCH SCORE',   align: 'left', width: '18%' },
        { id: 'skill_match',         label: 'MATCH DETAILS', width: '22%' },
        { id: 'year_of_experience',  label: 'EXP',           align: 'center', width: '8%' },
        { id: 'source_of_info',      label: 'SOURCE',        width: '13%' },
        { id: 'other_mappings_count',label: 'MAPPINGS',      width: '11%' },
    ];

    const aiButton = onScoreWithAI ? (
        <Tooltip title={aiScoring ? 'AI scoring in progress…' : 'Score all visible candidates using AI'}>
            <span>
                <Button
                    id="btn-score-with-ai"
                    variant="contained"
                    size="small"
                    startIcon={
                        aiScoring
                            ? <CircularProgress size={13} sx={{ color: 'inherit' }} />
                            : <AIIcon sx={{ fontSize: '0.95rem' }} />
                    }
                    onClick={onScoreWithAI}
                    disabled={aiScoring || loading}
                    sx={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        boxShadow: 'none',
                        ml: 1,
                        px: 1.5,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
                            boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
                        },
                        '&.Mui-disabled': { opacity: 0.5, background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' },
                    }}
                >
                    {aiScoring ? 'Scoring…' : 'Score with AI'}
                </Button>
            </span>
        </Tooltip>
    ) : null;

    const combinedHeaderActions = (
        <>
            {headerActions}
            {aiButton}
        </>
    );

    const renderRow = (candidate: CandidateMatchResult) => {
        const isSelected = selectedIds.includes(candidate.candidate_id);
        const isAIScored = candidate.score_source === 'ai';
        const rec = candidate.ai_recommendation ? REC_CONFIG[candidate.ai_recommendation] : null;
        const scoreColor = getScoreColor(candidate.match_score);

        return (
            <TableRow
                key={candidate.public_id}
                hover
                selected={isSelected}
                sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                }}
            >
                {/* Checkbox */}
                <TableCell padding="checkbox">
                    <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={() => onToggleSelect(candidate.candidate_id)}
                        sx={{ color: theme.palette.divider, '&.Mui-checked': { color: theme.palette.primary.main } }}
                    />
                </TableCell>

                {/* Candidate name + avatar */}
                <TableCell sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            sx={{
                                bgcolor: alpha(scoreColor, 0.15),
                                color: scoreColor,
                                width: 34,
                                height: 34,
                                fontSize: '0.875rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                border: `1.5px solid ${alpha(scoreColor, 0.3)}`,
                                flexShrink: 0,
                            }}
                            onClick={() => navigate(`/candidates/${candidate.public_id}`)}
                        >
                            {candidate.name[0]}
                        </Avatar>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.text.primary,
                                '&:hover': { color: theme.palette.primary.main, textDecoration: 'underline' },
                                cursor: 'pointer',
                                lineHeight: 1.3,
                            }}
                            onClick={() => navigate(`/candidates/${candidate.public_id}`)}
                        >
                            {candidate.name}
                        </Typography>
                    </Stack>
                </TableCell>

                {/* Score — compact single-row design */}
                <TableCell sx={{ py: 1.5 }}>
                    <Tooltip
                        arrow
                        placement="right"
                        title={
                            isAIScored && candidate.ai_explanation ? (
                                <Box sx={{ p: 0.75, maxWidth: 300 }}>
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.75 }}>
                                        <AIIcon sx={{ fontSize: '0.8rem', color: '#c084fc' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#c084fc', fontSize: '0.7rem' }}>
                                            AI Analysis
                                        </Typography>
                                    </Stack>
                                    <Typography variant="caption" sx={{ lineHeight: 1.6, fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)' }}>
                                        {candidate.ai_explanation}
                                    </Typography>
                                </Box>
                            ) : ''
                        }
                    >
                        {/* Score pill — full width compact bar */}
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: isAIScored ? 'help' : 'default',
                            }}
                        >
                            {/* Score bar */}
                            <Box sx={{ position: 'relative', width: 54, height: 6, borderRadius: 3, bgcolor: alpha(scoreColor, 0.12) }}>
                                <Box sx={{
                                    position: 'absolute',
                                    left: 0, top: 0,
                                    width: `${Math.min(candidate.match_score, 100)}%`,
                                    height: '100%',
                                    borderRadius: 3,
                                    bgcolor: scoreColor,
                                    transition: 'width 0.6s ease',
                                }} />
                            </Box>
                            {/* Score number */}
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 800, color: scoreColor, fontSize: '0.82rem', minWidth: 38 }}
                            >
                                {candidate.match_score}%
                            </Typography>
                            {/* Tiny AI sparkle icon — only shown when AI scored */}
                            {isAIScored && (
                                <AIIcon sx={{ fontSize: '0.75rem', color: '#7c3aed', flexShrink: 0 }} />
                            )}
                        </Box>
                    </Tooltip>

                    {/* Recommendation badge — inline below the score bar, compact */}
                    {rec && (
                        <Box
                            sx={{
                                mt: 0.5,
                                display: 'inline-block',
                                px: 0.8,
                                py: 0.1,
                                borderRadius: '4px',
                                bgcolor: alpha(rec.color, 0.1),
                                border: `1px solid ${alpha(rec.color, 0.25)}`,
                            }}
                        >
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: rec.color, lineHeight: 1.6 }}>
                                {rec.label}
                            </Typography>
                        </Box>
                    )}
                </TableCell>

                {/* Match detail chips */}
                <TableCell sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.4 }}>
                        <Tooltip title={candidate.skill_match.details} arrow>
                            <Chip
                                icon={<SkillIcon style={{ fontSize: 12 }} />}
                                label="Skills"
                                size="small"
                                variant={candidate.skill_match.is_match ? 'filled' : 'outlined'}
                                sx={{
                                    height: 20,
                                    fontSize: '0.67rem',
                                    fontWeight: 600,
                                    px: 0.25,
                                    bgcolor: candidate.skill_match.is_match ? alpha('#16a34a', 0.1) : 'transparent',
                                    color: candidate.skill_match.is_match ? '#16a34a' : theme.palette.text.disabled,
                                    borderColor: candidate.skill_match.is_match ? alpha('#16a34a', 0.3) : theme.palette.divider,
                                    '& .MuiChip-icon': { color: 'inherit' },
                                }}
                            />
                        </Tooltip>
                        <Tooltip title={candidate.qualification_match.details} arrow>
                            <Chip
                                icon={<SchoolIcon style={{ fontSize: 12 }} />}
                                label="Edu"
                                size="small"
                                variant={candidate.qualification_match.is_match ? 'filled' : 'outlined'}
                                sx={{
                                    height: 20,
                                    fontSize: '0.67rem',
                                    fontWeight: 600,
                                    px: 0.25,
                                    bgcolor: candidate.qualification_match.is_match ? alpha('#0284c7', 0.1) : 'transparent',
                                    color: candidate.qualification_match.is_match ? '#0284c7' : theme.palette.text.disabled,
                                    borderColor: candidate.qualification_match.is_match ? alpha('#0284c7', 0.3) : theme.palette.divider,
                                    '& .MuiChip-icon': { color: 'inherit' },
                                }}
                            />
                        </Tooltip>
                        <Tooltip title={candidate.disability_match.details} arrow>
                            <Chip
                                icon={<DisabilityIcon style={{ fontSize: 12 }} />}
                                label="DMap"
                                size="small"
                                variant={candidate.disability_match.is_match ? 'filled' : 'outlined'}
                                sx={{
                                    height: 20,
                                    fontSize: '0.67rem',
                                    fontWeight: 600,
                                    px: 0.25,
                                    bgcolor: candidate.disability_match.is_match ? alpha('#d97706', 0.1) : 'transparent',
                                    color: candidate.disability_match.is_match ? '#d97706' : theme.palette.text.disabled,
                                    borderColor: candidate.disability_match.is_match ? alpha('#d97706', 0.3) : theme.palette.divider,
                                    '& .MuiChip-icon': { color: 'inherit' },
                                }}
                            />
                        </Tooltip>
                    </Stack>
                </TableCell>

                {/* Experience */}
                <TableCell align="center" sx={{ py: 1.5 }}>
                    {candidate.year_of_experience ? (
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.4}>
                            <WorkIcon sx={{ fontSize: '0.75rem', color: theme.palette.text.disabled }} />
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                {candidate.year_of_experience}y
                            </Typography>
                        </Stack>
                    ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontStyle: 'italic' }}>
                            Fresher
                        </Typography>
                    )}
                </TableCell>

                {/* Source */}
                <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {candidate.source_of_info || '—'}
                    </Typography>
                </TableCell>

                {/* Other mappings */}
                <TableCell sx={{ py: 1.5 }}>
                    {candidate.other_mappings_count > 0 ? (
                        <Tooltip title={`Mapped to: ${candidate.other_mappings.join(', ')}`} arrow>
                            <Box
                                sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    px: 1,
                                    py: 0.3,
                                    borderRadius: '5px',
                                    bgcolor: alpha(theme.palette.primary.main, 0.07),
                                    color: theme.palette.primary.main,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                                    fontSize: '0.65rem',
                                    fontWeight: 700,
                                    cursor: 'default',
                                }}
                            >
                                {candidate.other_mappings_count} {candidate.other_mappings_count === 1 ? 'Job' : 'Jobs'}
                            </Box>
                        </Tooltip>
                    ) : (
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>—</Typography>
                    )}
                </TableCell>
            </TableRow>
        );
    };

    return (
        <DataTable
            columns={columns}
            data={candidates}
            loading={loading}
            totalCount={totalCount}
            page={page}
            rowsPerPage={rowsPerPage}
            numSelected={selectedIds.length}
            onSelectAllClick={onSelectAll}
            onPageChange={(_e, p) => onPageChange(p)}
            onRowsPerPageChange={onRowsPerPageChange}
            renderRow={renderRow}
            emptyMessage="No suggestions available at the moment."
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onRefresh={onRefresh}
            onFilterOpen={onFilterOpen}
            activeFilterCount={activeFilterCount}
            headerActions={combinedHeaderActions}
            searchPlaceholder="Search suggestions by name..."
        />
    );
};

export default SuggestionsTable;
