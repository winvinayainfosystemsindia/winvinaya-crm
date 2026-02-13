import React from 'react';
import { Box } from '@mui/material';
import StatCard from '../../dashboard/StatCard';
import { Assignment, PendingActions, CheckCircle, Cancel } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hooks';

const CounselingStats: React.FC = () => {
	const { stats } = useAppSelector((state) => state.candidates);

	if (!stats) return null;

	const screenedCompleted = stats.screening_distribution?.['Completed'] || 0;
	const selected = stats.counseling_selected || 0;
	const rejected = stats.counseling_rejected || 0;
	const totalCounseled = stats.total_counseled || 0;

	const yetToBeCounseled = Math.max(0, screenedCompleted - totalCounseled);

	return (
		<Box sx={{ mb: 3 }}>
			<Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Screened Completed"
						count={screenedCompleted.toString()}
						icon={<Assignment fontSize="large" />}
						color="#1976d2"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Selected"
						count={selected.toString()}
						icon={<CheckCircle fontSize="large" />}
						color="#2e7d32"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Yet To Be Counseled"
						count={yetToBeCounseled.toString()}
						icon={<PendingActions fontSize="large" />}
						color="#ed6c02"
					/>
				</Box>
				<Box sx={{ flex: '1 1 250px' }}>
					<StatCard
						title="Rejected"
						count={rejected.toString()}
						icon={<Cancel fontSize="large" />}
						color="#d32f2f"
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default React.memo(CounselingStats);
