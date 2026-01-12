import axios from './api';

const migrationService = {
	/**
	 * Fix allocations from batches that were closed before auto-completion was implemented
	 */
	fixClosedBatchAllocations: async () => {
		const response = await axios.post<{
			success: boolean;
			message: string;
			batches_processed: number;
			allocations_updated: number;
		}>('/migration/fix-closed-batch-allocations');
		return response.data;
	},
};

export default migrationService;
