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
import DocumentStats from '../../components/documents/DocumentStats';
import DocumentCollectionTable from '../../components/documents/DocumentCollectionTable';

const DocumentCollectionList: React.FC = () => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const [tabValue, setTabValue] = useState(0); // 0 = Pending, 1 = Collected

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

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
					<Tab label="Pending Collection" sx={{ textTransform: 'none', fontWeight: 500 }} />
					<Tab label="Collection Complete" sx={{ textTransform: 'none', fontWeight: 500 }} />
				</Tabs>
			</Paper>

			<Box sx={{ mt: 3 }}>
				{tabValue === 0 ? (
					<DocumentCollectionTable type="pending" />
				) : (
					<DocumentCollectionTable type="collected" />
				)}
			</Box>
		</Box>
	);
};

export default DocumentCollectionList;
