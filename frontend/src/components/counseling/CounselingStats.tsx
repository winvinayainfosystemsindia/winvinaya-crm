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
		<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
			<Box sx={{ flex: '1 1 250px' }}>
				<StatCard
					title="Total Profiled"
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
	);
};

export default CounselingStats;
