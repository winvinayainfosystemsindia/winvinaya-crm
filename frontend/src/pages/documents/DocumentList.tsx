import React, { useState } from 'react';
import {
	Box,
	Tabs,
	Tab,
	useTheme,
	Container
} from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import DocumentStats from '../../components/documents/stats/DocumentStats';
import DocumentCollectionTable from '../../components/documents/table/DocumentCollectionTable';
import PageHeader from '../../components/common/page-header';

/**
 * DocumentCollectionList - Central hub for tracking candidate documentation compliance.
 * Optimized for administrative oversight of the placement-ready funnel.
 */
const DocumentCollectionList: React.FC = () => {
	const theme = useTheme();
	const [tabValue, setTabValue] = useState(0); // 0 = Not Collected, 1 = Pending, 2 = Collected
	const { stats } = useAppSelector((state) => state.candidates);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const renderTabLabel = (label: string, count: number) => (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
			{label}
			<Box sx={{
				bgcolor: theme.palette.mode === 'dark' ? 'action.selected' : 'grey.200',
				color: 'text.primary',
				px: 0.8,
				py: 0.2,
				borderRadius: '12px',
				fontSize: '0.75rem',
				fontWeight: 600,
				minWidth: '24px',
				textAlign: 'center'
			}}>
				{count}
			</Box>
		</Box>
	);

	return (
		<Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 } }}>
			<PageHeader
				title="Document Collection"
				subtitle="Manage and track document compliance for placement-ready candidates"
			/>

			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
				{/* Stats Cards */}
				<DocumentStats />

				{/* Tab Section */}
				<Box>
					<Box
						sx={{
							bgcolor: 'background.paper',
							border: '1px solid',
							borderColor: 'divider',
							borderRadius: '8px 8px 0 0'
						}}
					>
						<Tabs 
							value={tabValue} 
							onChange={handleTabChange} 
							variant="scrollable"
							scrollButtons="auto"
							allowScrollButtonsMobile
							sx={{ 
								px: 2,
								'& .MuiTab-root': {
									textTransform: 'none',
									fontSize: '0.95rem',
									fontWeight: 500,
									minHeight: 48
								}
							}}
						>
							<Tab label={renderTabLabel("Not Collected", stats?.candidates_not_submitted || 0)} />
							<Tab label={renderTabLabel("Pending Collection", stats?.candidates_partially_submitted || 0)} />
							<Tab label={renderTabLabel("Collection Completed", stats?.candidates_fully_submitted || 0)} />
						</Tabs>
					</Box>

					<Box sx={{ mt: 3 }}>
						{tabValue === 0 && <DocumentCollectionTable type="not_collected" />}
						{tabValue === 1 && <DocumentCollectionTable type="pending" />}
						{tabValue === 2 && <DocumentCollectionTable type="collected" />}
					</Box>
				</Box>
			</Box>
		</Container>
	);
};

export default DocumentCollectionList;
