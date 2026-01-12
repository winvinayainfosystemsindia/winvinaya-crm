import React, { useState } from 'react';
import {
	Button,
	Card,
	CardContent,
	Typography,
	Alert,
	CircularProgress,
	Paper
} from '@mui/material';
import { PlayArrow as RunIcon, CheckCircle as SuccessIcon } from '@mui/icons-material';
import migrationService from '../../services/migrationService';

const MigrationPanel: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<{
		success: boolean;
		message: string;
		batches_processed: number;
		allocations_updated: number;
	} | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleRunMigration = async () => {
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const data = await migrationService.fixClosedBatchAllocations();
			setResult(data);
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Failed to run migration');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
			<Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#232f3e' }}>
				Database Migration
			</Typography>

			<Card variant="outlined" sx={{ mb: 3, border: '1px solid #eaeded' }}>
				<CardContent>
					<Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#232f3e' }}>
						Fix Closed Batch Allocations
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						This one-time migration will mark all candidate allocations as "completed" for batches
						that are already closed. This is needed for batches closed before the auto-completion
						feature was implemented.
					</Typography>

					<Alert severity="info" sx={{ mb: 2 }}>
						<strong>What this does:</strong>
						<ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
							<li>Finds all training batches with status = "closed"</li>
							<li>Updates their allocations to status = "completed"</li>
							<li>Allows candidates to be re-allocated to new batches</li>
						</ul>
					</Alert>

					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					{result && (
						<Alert
							severity="success"
							icon={<SuccessIcon />}
							sx={{ mb: 2 }}
						>
							<Typography variant="body2" sx={{ fontWeight: 600 }}>
								{result.message}
							</Typography>
							<Typography variant="caption" display="block" sx={{ mt: 1 }}>
								• Batches processed: {result.batches_processed}
							</Typography>
							<Typography variant="caption" display="block">
								• Allocations updated: {result.allocations_updated}
							</Typography>
						</Alert>
					)}

					<Button
						variant="contained"
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RunIcon />}
						onClick={handleRunMigration}
						disabled={loading}
						sx={{
							bgcolor: '#ec7211',
							'&:hover': { bgcolor: '#eb5f07' },
							textTransform: 'none',
							fontWeight: 700,
							boxShadow: 'none'
						}}
					>
						{loading ? 'Running Migration...' : 'Run Migration'}
					</Button>
				</CardContent>
			</Card>

			<Alert severity="warning">
				<strong>Note:</strong> This migration should only be run once. After running it, all future
				batch closures will automatically complete allocations.
			</Alert>
		</Paper>
	);
};

export default MigrationPanel;
