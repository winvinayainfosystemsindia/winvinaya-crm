import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import StatCard from '../dashboard/StatCard';
import candidateService from '../../services/candidateService';
import { Assignment, PendingActions, CheckCircle, Cancel } from '@mui/icons-material';
import type { CandidateStats } from '../../models/candidate';

const CounselingStats: React.FC = () => {
	const [stats, setStats] = useState<CandidateStats | null>(null);

	useEffect(() => {
		fetchStats();
	}, []);

	const fetchStats = async () => {
		try {
			const data = await candidateService.getStats();
			setStats(data);
		} catch (error) {
			console.error('Failed to fetch stats:', error);
		}
	};

	if (!stats) return null;

	return (
		<Box sx={{ mb: 3 }}>
			<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Total Screened"
						count={stats.screened?.toString() ?? '0'}
						icon={<Assignment fontSize="large" />}
						color="#1976d2"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Pending Counseling"
						count={stats.counseling_pending?.toString() ?? '0'}
						icon={<PendingActions fontSize="large" />}
						color="#ed6c02"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Selected"
						count={stats.counseling_selected?.toString() ?? '0'}
						icon={<CheckCircle fontSize="large" />}
						color="#2e7d32"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Rejected"
						count={stats.counseling_rejected?.toString() ?? '0'}
						icon={<Cancel fontSize="large" />}
						color="#d32f2f"
					/>
				</Box>
			</Box>

			{/* Status Breakdown */}
			{stats.counseling_distribution && (
				<Box sx={{ bgcolor: 'white', p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
					<Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
						<Box sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.875rem' }}>
							Status Breakdown:
						</Box>
						{Object.entries(stats.counseling_distribution).map(([status, count]) => (
							<Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Box
									sx={{
										width: 8,
										height: 8,
										borderRadius: '50%',
										bgcolor:
											status.toLowerCase() === 'selected' ? '#2e7d32' :
												status.toLowerCase() === 'rejected' ? '#d32f2f' :
													status.toLowerCase() === 'pending' ? '#ed6c02' :
														'#757575'
									}}
								/>
								<Box sx={{ display: 'flex', gap: 0.5, fontSize: '0.875rem' }}>
									<Box sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
										{status}:
									</Box>
									<Box sx={{ fontWeight: 600 }}>
										{count}
									</Box>
								</Box>
							</Box>
						))}
					</Box>
				</Box>
			)}
		</Box>
	);
};

export default CounselingStats;
