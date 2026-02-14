import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	updateAllocationStatus,
	removeAllocation,
	markAsDropout,
	fetchAllocations
} from '../../store/slices/trainingSlice';
import AllocateCandidateDialog from '../../components/training/form/AllocateCandidateDialog';
import CandidateAllocationTable from '../../components/training/allocation/CandidateAllocationTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useSnackbar } from 'notistack';
import TrainingModuleLayout from '../../components/training/layout/TrainingModuleLayout';
import type { TrainingBatch, CandidateAllocation as CandidateAllocationModel } from '../../models/training';

interface AllocationManagerProps {
	selectedBatch: TrainingBatch;
	allocations: CandidateAllocationModel[];
}

const AllocationManager: React.FC<AllocationManagerProps> = ({ selectedBatch, allocations }) => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { loading } = useAppSelector((state) => state.training);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [filterDropout, setFilterDropout] = useState<boolean | 'all'>('all');

	// Confirmation Dialog State
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmData, setConfirmData] = useState<{ id: string; name: string } | null>(null);

	// Synchronize search/filter with layout fetch
	useEffect(() => {
		if (selectedBatch) {
			const params: any = {};
			if (searchQuery) params.search = searchQuery;
			if (filterDropout !== 'all') params.is_dropout = filterDropout;
			dispatch(fetchAllocations({ batchPublicId: selectedBatch.public_id, params }));
		}
	}, [searchQuery, filterDropout, selectedBatch, dispatch]);

	const handleStatusChange = async (publicId: string, newStatus: string, reason?: string) => {
		setUpdatingStatus(publicId);
		try {
			if (newStatus === 'dropped_out' && reason) {
				await dispatch(markAsDropout({ publicId, remark: reason })).unwrap();
			} else {
				await dispatch(updateAllocationStatus({ publicId, status: newStatus })).unwrap();
			}
			enqueueSnackbar('Status updated successfully', { variant: 'success' });
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to update status', { variant: 'error' });
		} finally {
			setUpdatingStatus(null);
		}
	};

	const handleRemoveClick = (publicId: string, candidateName: string) => {
		setConfirmData({ id: publicId, name: candidateName });
		setConfirmOpen(true);
	};

	const handleConfirmRemove = async () => {
		if (!confirmData) return;

		try {
			await dispatch(removeAllocation(confirmData.id)).unwrap();
			enqueueSnackbar('Candidate removed from batch', { variant: 'success' });
			setConfirmOpen(false);
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to remove candidate', { variant: 'error' });
		}
	};

	return (
		<>
			<CandidateAllocationTable
				allocations={allocations}
				loading={loading}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				filterDropout={filterDropout}
				onFilterChange={setFilterDropout}
				updatingStatusId={updatingStatus}
				onStatusChange={handleStatusChange}
				onRemove={handleRemoveClick}
				onAddClick={() => setDialogOpen(true)}
			/>

			{/* Dialogs */}
			<AllocateCandidateDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				batchId={selectedBatch.id}
				batchPublicId={selectedBatch.public_id}
				batchName={selectedBatch.batch_name}
			/>

			<ConfirmDialog
				open={confirmOpen}
				title="Remove Candidate"
				message={`Are you sure you want to remove ${confirmData?.name} from this batch? This action cannot be undone.`}
				confirmText="Remove"
				severity="error"
				onClose={() => setConfirmOpen(false)}
				onConfirm={handleConfirmRemove}
			/>
		</>
	);
};

const CandidateAllocation: React.FC = () => {
	return (
		<TrainingModuleLayout
			title="Candidate Allocation"
			subtitle="Manage and monitor candidate enrollments and lifecycle with enterprise-grade precision."
		>
			{({ selectedBatch, allocations }) => (
				<AllocationManager selectedBatch={selectedBatch} allocations={allocations} />
			)}
		</TrainingModuleLayout>
	);
};

export default CandidateAllocation;
