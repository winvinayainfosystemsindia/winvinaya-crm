import React, { useRef, useCallback } from 'react';
import { Box, Container, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/page-header';
import DealList from '../../components/crm/deals/DealList';

const DealManagement: React.FC = () => {
	
	const addDealTrigger = useRef<(() => void) | null>(null);

	const handleAddClick = useCallback(() => {
		if (addDealTrigger.current) {
			addDealTrigger.current();
		}
	}, []);

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<PageHeader
					title="Deal Management"
					subtitle="Track sales opportunities and revenue pipeline"
					action={
						<Button
							variant="contained"
							color="primary"
							startIcon={<AddIcon />}
							onClick={handleAddClick}
							sx={{
								textTransform: 'none',
								fontWeight: 600,
								px: 3,
								py: 1,
								borderRadius: 3,
								boxShadow: 'none',
								'&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
							}}
						>
							Add Deal
						</Button>
					}
				/>
				
				<DealList onAddClick={(trigger) => { addDealTrigger.current = trigger; }} />
			</Container>
		</Box>
	);
};

export default DealManagement;
