import React, { useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCandidateStats } from '../../../store/slices/candidateSlice';
import StatCard from '../../common/StatCard';
import {
	Description as FilesIcon,
	CheckCircle as CompleteIcon,
	PendingActions as PartialIcon,
	FolderOff as NoneIcon
} from '@mui/icons-material';

/**
 * DocumentStats - Specialized dashboard for document collection metrics.
 * Visualizes the compliance funnel from "Initial Contact" to "Full Documentation".
 */
const DocumentStats: React.FC = () => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	// @ts-ignore - statsLoading is available in candidateSlice
	const { stats, statsLoading } = useAppSelector((state) => state.candidates);

	useEffect(() => {
		if (!stats) {
			dispatch(fetchCandidateStats());
		}
	}, [dispatch, stats]);

	if (!stats) {
		return <Box sx={{ height: 120 }} />;
	}

	const statItems = [
		{
			title: "Files Collected",
			count: stats.files_collected?.toString() || '0',
			subtitle: `Target: ${stats.files_to_collect || 0} docs`,
			icon: <FilesIcon fontSize="large" />,
			color: theme.palette.info.main
		},
		{
			title: "Compliance Full",
			count: stats.candidates_fully_submitted?.toString() || '0',
			subtitle: "All mandatory docs verified",
			icon: <CompleteIcon fontSize="large" />,
			color: theme.palette.success.main
		},
		{
			title: "Compliance Partial",
			count: stats.candidates_partially_submitted?.toString() || '0',
			subtitle: "Awaiting pending docs",
			icon: <PartialIcon fontSize="large" />,
			color: theme.palette.warning.main
		},
		{
			title: "Zero Documentation",
			count: stats.candidates_not_submitted?.toString() || '0',
			subtitle: "Initial collection pending",
			icon: <NoneIcon fontSize="large" />,
			color: theme.palette.error.main
		}
	];

	return (
		<Box sx={{ 
			display: 'flex', 
			gap: 3, 
			mb: 3, 
			flexWrap: 'wrap',
			opacity: statsLoading ? 0.6 : 1,
			transition: 'opacity 0.2s ease-in-out'
		}}>
			{statItems.map((item, index) => (
				<Box key={index} sx={{ flex: '1 1 200px' }}>
					<StatCard
						title={item.title}
						count={item.count}
						icon={item.icon}
						color={item.color}
						subtitle={item.subtitle}
					/>
				</Box>
			))}
		</Box>
	);
};

export default React.memo(DocumentStats);
