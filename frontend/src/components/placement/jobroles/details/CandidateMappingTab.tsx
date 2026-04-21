import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    CircularProgress,
    Grid
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
    fetchMatchesForJobRole,
    mapCandidate,
    clearMatches,
    clearPlacementError,
    type CandidateMatchResult
} from '../../../../store/slices/placementMappingSlice';
import CandidateEmailDialog from '../../mapping/dialogs/CandidateEmailDialog';
import placementEmailService from '../../../../services/placementEmailService';
import useToast from '../../../../hooks/useToast';
import type { JobRole } from '../../../../models/jobRole';
import { skillService } from '../../../../services/skillService';
import FilterDrawer from '../../../common/FilterDrawer';
import { CANDIDATE_MAPPING_FILTER_FIELDS, INITIAL_FILTERS, type CandidateMappingFiltersState } from './mapping/CandidateMappingFilters';

// Modular Components
import {
    SuggestionsTable,
    MappedCandidatesList,
    MappingDialog
} from './mapping';

interface CandidateMappingTabProps {
    jobRole: JobRole;
}

const CandidateMappingTab: React.FC<CandidateMappingTabProps> = ({ jobRole }) => {
    const toast = useToast();
    const dispatch = useAppDispatch();

    // Redux State
    const { matches: matchingCandidates, loading, error: placementError } = useAppSelector((state) => state.placementMapping);

    // Auto-display errors from slice
    useEffect(() => {
        if (placementError) {
            toast.error(placementError);
            dispatch(clearPlacementError());
        }
    }, [placementError, toast, dispatch]);

    // UI States
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<CandidateMappingFiltersState>(INITIAL_FILTERS);

    // Mapping State
    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);
    const [mappingNotes, setMappingNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Bulk Email State
    const [selectedMappings, setSelectedMappings] = useState<number[]>([]);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    // Skills for Filter
    const [allPossibleSkills, setAllPossibleSkills] = useState<string[]>([]);

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const skills = await skillService.getAggregatedSkills();
                setAllPossibleSkills(skills);
            } catch (error) {
                console.error('Failed to load aggregated skills', error);
            }
        };
        loadSkills();
    }, []);

    const fetchData = useCallback(async () => {
        dispatch(fetchMatchesForJobRole(jobRole.public_id));
    }, [jobRole.public_id, dispatch]);

    useEffect(() => {
        fetchData();
        return () => {
            dispatch(clearMatches());
        };
    }, [fetchData, dispatch]);

    // Filtering Logic
    const suggestions = useMemo(() => {
        return matchingCandidates.filter(c => {
            // Already mapped check
            if (c.is_already_mapped) return false;

            // Search term check (Name)
            if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            // Min Score filter
            if (activeFilters.minScore && c.match_score < parseInt(activeFilters.minScore, 10)) return false;

            // Skills filter (multi-select)
            if (activeFilters.skills.length > 0) {
                // Check if candidate has ANY of the selected skills
                if (!c.skills?.some(s => activeFilters.skills.includes(s))) return false;
            }

            // Disability multi-select filter
            if (activeFilters.disability.length > 0) {
                if (!c.disability || !activeFilters.disability.includes(c.disability)) return false;
            }

            // Qualification multi-select filter
            if (activeFilters.qualification.length > 0) {
                if (!c.qualification || !activeFilters.qualification.includes(c.qualification)) return false;
            }

            // Experience range filter
            const expValue = parseInt(String(c.year_of_experience || '0'), 10);
            if (activeFilters.experience.min && expValue < parseInt(activeFilters.experience.min, 10)) return false;
            if (activeFilters.experience.max && expValue > parseInt(activeFilters.experience.max, 10)) return false;

            return true;
        });
    }, [matchingCandidates, searchTerm, activeFilters]);

    const mapped = useMemo(() =>
        matchingCandidates.filter(c => c.is_already_mapped),
        [matchingCandidates]);

    const paginatedSuggestions = useMemo(() => {
        const start = page * rowsPerPage;
        return suggestions.slice(start, start + rowsPerPage);
    }, [suggestions, page, rowsPerPage]);

    // Dynamic Filter Options
    const dynamicFilterFields = useMemo(() => {
        const disabilities = Array.from(new Set(matchingCandidates.map(c => c.disability).filter((d): d is string => !!d)));
        const qualifications = Array.from(new Set(matchingCandidates.map(c => c.qualification).filter((q): q is string => !!q)));

        const fields = [...CANDIDATE_MAPPING_FILTER_FIELDS];

        // Populate skills options
        const skillField = fields.find(f => f.key === 'skills');
        if (skillField) {
            skillField.options = allPossibleSkills.map(s => ({ value: s, label: s }));
        }

        if (disabilities.length > 0) {
            fields.push({
                key: 'disability',
                label: 'Disability Type',
                type: 'multi-select',
                options: disabilities.map(d => ({ value: d, label: d }))
            });
        }

        if (qualifications.length > 0) {
            fields.push({
                key: 'qualification',
                label: 'Educational Qualification',
                type: 'multi-select',
                options: qualifications.map(q => ({ value: q, label: q }))
            });
        }

        return fields;
    }, [matchingCandidates]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (activeFilters.minScore) count++;
        if (activeFilters.skills.length > 0) count++;
        if (activeFilters.disability.length > 0) count++;
        if (activeFilters.qualification.length > 0) count++;
        if (activeFilters.experience.min || activeFilters.experience.max) count++;
        return count;
    }, [activeFilters]);

    // Handlers
    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setPage(0);
    };

    const handleFilterChange = (key: string, value: any) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => {
        setActiveFilters(INITIAL_FILTERS);
        setIsFilterDrawerOpen(false);
    };

    const handleOpenMapDialog = (candidate: CandidateMatchResult) => {
        setSelectedCandidate(candidate);
        setMapDialogOpen(true);
    };

    const handleMapCandidate = async () => {
        if (!selectedCandidate) return;
        setSubmitting(true);
        try {
            await dispatch(mapCandidate({
                candidate_id: selectedCandidate.candidate_id,
                job_role_id: jobRole.id!,
                match_score: selectedCandidate.match_score,
                notes: mappingNotes
            })).unwrap();

            toast.success(`${selectedCandidate.name} has been successfully mapped`);
            setMapDialogOpen(false);
            setMappingNotes('');
        } catch (error: any) {
            toast.error(error || 'Failed to map candidate');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleSelection = (mappingId: number) => {
        setSelectedMappings(prev =>
            prev.includes(mappingId)
                ? prev.filter(id => id !== mappingId)
                : [...prev, mappingId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allMappedIds = mapped.map(m => m.mapping_id).filter((id): id is number => !!id);
            setSelectedMappings(allMappedIds);
        } else {
            setSelectedMappings([]);
        }
    };

    const handleSendBulkEmail = async (data: { email: string; subject: string; message: string; document_ids: number[] }) => {
        setSendingEmail(true);
        try {
            await placementEmailService.sendBulkProfiles({
                mapping_ids: selectedMappings,
                document_ids: data.document_ids,
                custom_email: data.email,
                custom_subject: data.subject,
                custom_message: data.message
            });
            toast.success('Candidate profiles sent successfully');
            setEmailDialogOpen(false);
            setSelectedMappings([]);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to send bulk email');
        } finally {
            setSendingEmail(false);
        }
    };

    const selectedCandidateNames = useMemo(() => {
        return matchingCandidates
            .filter(c => selectedMappings.includes(c.mapping_id!))
            .map(c => c.name);
    }, [matchingCandidates, selectedMappings]);

    const getScoreColor = (score: number) => {
        if (score >= 70) return '#1d8102';
        if (score >= 40) return '#ec7211';
        return '#d13212';
    };

    if (loading && matchingCandidates.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#ec7211' }} />
            </Box>
        );
    }

    return (
        <Grid container spacing={4} sx={{ mt: 1 }}>
            {/* Top/Left: Smart Suggestions Table */}
            <Grid size={{ xs: 12, md: 8.5 }}>
                <SuggestionsTable
                    candidates={paginatedSuggestions}
                    loading={loading}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    totalCount={suggestions.length}
                    onPageChange={setPage}
                    onRowsPerPageChange={(v) => {
                        setRowsPerPage(v);
                        setPage(0);
                    }}
                    onMapClick={handleOpenMapDialog}
                    getScoreColor={getScoreColor}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onRefresh={fetchData}
                    onFilterOpen={() => setIsFilterDrawerOpen(true)}
                    activeFilterCount={activeFilterCount}
                />
            </Grid>

            {/* Bottom/Right: Mapped Candidates List */}
            <Grid size={{ xs: 12, md: 3.5 }}>
                <MappedCandidatesList
                    mapped={mapped}
                    selectedMappings={selectedMappings}
                    onToggleSelection={handleToggleSelection}
                    onSelectAll={handleSelectAll}
                    onEmailClick={() => setEmailDialogOpen(true)}
                    getScoreColor={getScoreColor}
                />
            </Grid>

            {/* Map Candidate Dialog */}
            <MappingDialog
                open={mapDialogOpen}
                onClose={() => setMapDialogOpen(false)}
                onConfirm={handleMapCandidate}
                jobRole={jobRole}
                selectedCandidate={selectedCandidate}
                mappingNotes={mappingNotes}
                onNotesChange={setMappingNotes}
                submitting={submitting}
                getScoreColor={getScoreColor}
            />

            {/* Filter Drawer */}
            <FilterDrawer
                open={isFilterDrawerOpen}
                onClose={() => setIsFilterDrawerOpen(false)}
                fields={dynamicFilterFields}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                onApplyFilters={() => setIsFilterDrawerOpen(false)}
            />

            {/* Bulk Email Dialog Integration */}
            {jobRole.contact && (
                <CandidateEmailDialog
                    open={emailDialogOpen}
                    onClose={() => setEmailDialogOpen(false)}
                    onSend={handleSendBulkEmail}
                    mappingIds={selectedMappings}
                    candidateNames={selectedCandidateNames}
                    jobTitle={jobRole.title}
                    contactEmail={jobRole.contact.email || ''}
                    contactName={jobRole.contact.full_name || 'Hiring Manager'}
                    loading={sendingEmail}
                />
            )}
        </Grid>
    );
};

export default CandidateMappingTab;
