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

    // Pagination State (Frontend)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    // Mapping State
    const [mapDialogOpen, setMapDialogOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatchResult | null>(null);
    const [mappingNotes, setMappingNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Bulk Email State
    const [selectedMappings, setSelectedMappings] = useState<number[]>([]);
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    const fetchData = useCallback(async () => {
        dispatch(fetchMatchesForJobRole(jobRole.public_id));
    }, [jobRole.public_id, dispatch]);

    useEffect(() => {
        fetchData();
        return () => {
            dispatch(clearMatches());
        };
    }, [fetchData, dispatch]);

    // Compute split lists
    const suggestions = useMemo(() =>
        matchingCandidates.filter(c => !c.is_already_mapped),
        [matchingCandidates]);

    const mapped = useMemo(() =>
        matchingCandidates.filter(c => c.is_already_mapped),
        [matchingCandidates]);

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
                    candidates={suggestions}
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
