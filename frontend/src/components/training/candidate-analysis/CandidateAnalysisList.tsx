import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
	Box,
	Typography,
	Button,
	useTheme,
	alpha
} from '@mui/material';
import type { CandidateAllocation } from '../../../models/training';
import type { CandidateAnalysis } from '../../../models/CandidateAnalysis';
import candidateAnalysisService from '../../../services/candidateAnalysisService';
import CandidateAnalysisTableRow from './table/CandidateAnalysisTableRow';
import CandidateAnalysisForm from './form/CandidateAnalysisForm';
import CandidateAnalysisStats from './stats/CandidateAnalysisStats';
import DataTable, { type ColumnDefinition } from '../../common/table/DataTable';
import FilterDrawer, { type FilterField } from '../../common/drawer/FilterDrawer';
import ConfirmationDialog from '../../common/dialogbox/ConfirmationDialog';
import useToast from '../../../hooks/useToast';

interface CandidateAnalysisListProps {
	batchId: number;
	allocations: CandidateAllocation[];
}

const CandidateAnalysisList: React.FC<CandidateAnalysisListProps> = ({ batchId, allocations }) => {
	const theme = useTheme();
	const toast = useToast();
	
	const [analyses, setAnalyses] = useState<CandidateAnalysis[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCandidateId, setFilterCandidateId] = useState<number | null>(null);
	
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [viewMode, setViewMode] = useState(false);
	const [selectedAnalysis, setSelectedAnalysis] = useState<CandidateAnalysis | null>(null);
	const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

	const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
	const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
		candidate: '',
		recommendation: []
	});

	// Load analyses from local service
	const loadAnalyses = useCallback(async () => {
		setLoading(true);
		try {
			const data = await candidateAnalysisService.getByBatchId(batchId);
			// Match names with candidate allocations list
			const populated = data.map(item => {
				const alloc = allocations.find(a => a.candidate_id === item.candidate_id);
				if (alloc && alloc.candidate) {
					return {
						...item,
						candidate: {
							id: alloc.candidate_id,
							public_id: alloc.candidate.public_id,
							name: alloc.candidate.name
						}
					};
				}
				return item;
			});
			setAnalyses(populated);
		} catch (err) {
			console.error('Failed to load candidate analyses', err);
			toast.error('Failed to load candidate analyses.');
		} finally {
			setLoading(false);
		}
	}, [batchId, allocations]);

	useEffect(() => {
		loadAnalyses();
	}, [loadAnalyses]);

	// Filter options
	const filterFields: FilterField[] = useMemo(() => [
		{
			key: 'candidate',
			label: 'Candidate',
			type: 'single-select',
			options: [
				...allocations.map(a => ({
					value: String(a.candidate_id),
					label: a.candidate?.name || 'Unknown'
				}))
			]
		},
		{
			key: 'recommendation',
			label: 'Recommendation',
			type: 'multi-select',
			options: [
				{ value: 'ready_for_placement', label: 'Ready for Placement' },
				{ value: 'needs_additional_training', label: 'Needs Training' },
				{ value: 'assign_dsr_project', label: 'Assign DSR Project' },
				{ value: 'counseling_required', label: 'Counseling Required' }
			]
		}
	], [allocations]);

	const handleFilterChange = (key: string, value: any) => {
		setActiveFilters(prev => ({ ...prev, [key]: value }));
	};

	const handleApplyFilters = () => {
		const candidateId = activeFilters.candidate ? parseInt(activeFilters.candidate, 10) : null;
		setFilterCandidateId(candidateId);
		setIsFilterDrawerOpen(false);
	};

	const handleClearFilters = () => {
		setActiveFilters({ candidate: '', recommendation: [] });
		setFilterCandidateId(null);
		setIsFilterDrawerOpen(false);
	};

	const handleConfirmDelete = async () => {
		if (deleteConfirmId) {
			try {
				await candidateAnalysisService.delete(batchId, deleteConfirmId);
				toast.success('Candidate analysis successfully deleted.');
				loadAnalyses();
			} catch (err) {
				toast.error('Failed to delete candidate analysis.');
			}
			setDeleteConfirmId(null);
		}
	};

	// Save or Update handler
	const handleSave = async (payload: any) => {
		if (selectedAnalysis) {
			await candidateAnalysisService.update(batchId, selectedAnalysis.id, payload);
			toast.success('Candidate analysis successfully updated.');
		} else {
			await candidateAnalysisService.create(batchId, payload);
			toast.success('Candidate analysis successfully finalized.');
		}
		loadAnalyses();
	};

	// Search & Filter local data
	const displayData = useMemo(() => {
		let data = analyses;
		
		// Search query filter
		if (searchTerm) {
			const clean = searchTerm.toLowerCase();
			data = data.filter(i => 
				(i.candidate?.name || '').toLowerCase().includes(clean) || 
				(i.analyst_name || '').toLowerCase().includes(clean) ||
				(i.strengths || '').toLowerCase().includes(clean)
			);
		}

		// Candidate filter
		if (filterCandidateId) {
			data = data.filter(i => i.candidate_id === filterCandidateId);
		}

		// Recommendation filters
		if (activeFilters.recommendation.length > 0) {
			data = data.filter(i => activeFilters.recommendation.includes(i.recommendation));
		}

		return data;
	}, [analyses, searchTerm, filterCandidateId, activeFilters.recommendation]);

	// Calculate stats on the fly
	const stats = useMemo(() => {
		const total = displayData.length;
		const ready = displayData.filter(i => i.recommendation === 'ready_for_placement').length;
		
		const sumTech = displayData.reduce((acc, i) => acc + i.technical_rating, 0);
		const sumComm = displayData.reduce((acc, i) => acc + i.communication_rating, 0);
		const sumAttitude = displayData.reduce((acc, i) => acc + i.attitude_rating, 0);
		
		return {
			total,
			ready,
			avgTech: total ? (sumTech / total).toFixed(1) : '0.0',
			avgComm: total ? (sumComm / total).toFixed(1) : '0.0',
			avgAttitude: total ? (sumAttitude / total).toFixed(1) : '0.0'
		};
	}, [displayData]);

	const columns: ColumnDefinition<CandidateAnalysis>[] = useMemo(() => [
		{ id: 'analysis_date' as any, label: 'DATE', width: '12%' },
		{ id: 'candidate_id' as any, label: 'CANDIDATE', width: '18%' },
		{ id: 'analyst_name' as any, label: 'EVALUATOR', width: '15%' },
		{ id: 'recommendation' as any, label: 'RECOMMENDATION', width: '15%' },
		{ id: 'status' as any, label: 'STATUS', width: '10%' },
		{ id: 'technical_rating' as any, label: 'TECH.', width: '10%' },
		{ id: 'communication_rating' as any, label: 'COMM.', width: '10%' },
		{ id: 'overall_rating' as any, label: 'OVERALL', width: '10%' },
		{ id: 'actions' as any, label: 'ACTIONS', align: 'right', width: '8%' }
	], []);

	const filteredCandidateName = allocations.find(a => a.candidate_id === filterCandidateId)?.candidate?.name;

	return (
		<Box sx={{ width: '100%' }}>
			<CandidateAnalysisStats stats={stats} />

			{filterCandidateId && (
				<Box 
					sx={{ 
						mb: 3, 
						display: 'flex', 
						alignItems: 'center', 
						gap: 2, 
						bgcolor: alpha(theme.palette.info.main, 0.05), 
						p: 2, 
						borderRadius: 2, 
						border: '1px solid',
						borderColor: alpha(theme.palette.info.main, 0.1)
					}}
				>
					<Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
						Showing evaluations for: <Box component="span" sx={{ fontWeight: 700, color: 'info.main' }}>{filteredCandidateName}</Box>
					</Typography>
					<Button
						size="small"
						variant="outlined"
						color="info"
						onClick={() => handleClearFilters()}
						sx={{ 
							textTransform: 'none', 
							borderRadius: 1.5,
							fontWeight: 700,
							px: 2
						}}
					>
						Clear Filter
					</Button>
				</Box>
			)}

			<DataTable
				columns={columns}
				data={displayData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
				totalCount={displayData.length}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={(_, p) => setPage(p)}
				onRowsPerPageChange={(newRows) => {
					setRowsPerPage(newRows);
					setPage(0);
				}}
				loading={loading}
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				searchPlaceholder="Search candidates or evaluators..."
				onRefresh={loadAnalyses}
				onFilterOpen={() => setIsFilterDrawerOpen(true)}
				activeFilterCount={(filterCandidateId ? 1 : 0) + activeFilters.recommendation.length}
				canCreate={true}
				onCreateClick={() => {
					setSelectedAnalysis(null);
					setViewMode(false);
					setIsFormOpen(true);
				}}
				createButtonText="Create Analysis"
				renderRow={(analysis) => (
					<CandidateAnalysisTableRow
						key={analysis.id}
						analysis={analysis}
						allocations={allocations}
						onView={(item) => {
							setSelectedAnalysis(item);
							setViewMode(true);
							setIsFormOpen(true);
						}}
						onEdit={(item) => {
							setSelectedAnalysis(item);
							setViewMode(false);
							setIsFormOpen(true);
						}}
						onDelete={(id) => setDeleteConfirmId(id)}
						onFilterCandidate={(id) => {
							setFilterCandidateId(id);
							setActiveFilters(prev => ({ ...prev, candidate: String(id) }));
						}}
					/>
				)}
			/>

			<FilterDrawer
				open={isFilterDrawerOpen}
				onClose={() => setIsFilterDrawerOpen(false)}
				fields={filterFields}
				activeFilters={activeFilters}
				onFilterChange={handleFilterChange}
				onClearFilters={handleClearFilters}
				onApplyFilters={handleApplyFilters}
			/>

			{isFormOpen && (
				<CandidateAnalysisForm
					open={isFormOpen}
					onClose={() => setIsFormOpen(false)}
					batchId={batchId}
					analysis={selectedAnalysis}
					viewMode={viewMode}
					onSave={handleSave}
				/>
			)}

			<ConfirmationDialog
				open={!!deleteConfirmId}
				onClose={() => setDeleteConfirmId(null)}
				onConfirm={handleConfirmDelete}
				title="Delete Analysis Record"
				message="Are you sure you want to delete this candidate analysis record? This action will permanently remove all evaluated ratings, strengths, weaknesses, and custom skills matrix data. This action cannot be undone."
				confirmLabel="Delete Record"
				severity="error"
			/>
		</Box>
	);
};

export default CandidateAnalysisList;
