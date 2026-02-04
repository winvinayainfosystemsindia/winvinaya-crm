import React, { useState } from 'react';
import {
	Box,
	Paper,
	Typography,
	Tabs,
	Tab,
	useTheme,
	useMediaQuery
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import DocumentStats from '../../components/documents/DocumentStats';
import DocumentCollectionTable from '../../components/documents/DocumentCollectionTable';

const DocumentCollectionList: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [tabValue, setTabValue] = useState(0); // 0 = Not Collected, 1 = Pending, 2 = Collected
	const { stats } = useAppSelector((state) => state.candidates);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const renderTabLabel = (label: string, count: number) => (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			<Typography variant="body2" sx={{ fontWeight: 500 }}>{label}</Typography>
			<Box sx={{
				bgcolor: '#eee',
				px: 0.8,
				py: 0.2,
				borderRadius: '10px',
				fontSize: '0.7rem',
				color: '#555',
				minWidth: '20px',
				textAlign: 'center'
			}}>
				{count}
			</Box>
		</Box>
	);

	return (
		<Box sx={{ p: isMobile ? 2 : 3 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" sx={{ fontWeight: 300, color: '#232f3e', mb: 0.5 }}>
					Document Collection
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Manage and track document collection for selected candidates
				</Typography>
			</Box>

			<DocumentStats />

			{/* Tabs */}
			<Paper sx={{ mb: 0, borderRadius: '4px 4px 0 0', borderBottom: '1px solid #e0e0e0' }} elevation={0}>
				<Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
					<Tab label={renderTabLabel("Not Collected", stats?.candidates_not_submitted || 0)} sx={{ textTransform: 'none' }} />
					<Tab label={renderTabLabel("Pending Collection", stats?.candidates_partially_submitted || 0)} sx={{ textTransform: 'none' }} />
					<Tab label={renderTabLabel("Collection Completed", stats?.candidates_fully_submitted || 0)} sx={{ textTransform: 'none' }} />
				</Tabs>
			</Paper>

			<Box sx={{ mt: 3 }}>
				{tabValue === 0 && <DocumentCollectionTable type="not_collected" />}
				{tabValue === 1 && <DocumentCollectionTable type="pending" />}
				{tabValue === 2 && <DocumentCollectionTable type="collected" />}
			</Box>
		</Box>
	);
};

export default DocumentCollectionList;
