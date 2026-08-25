import React, { useRef, useCallback } from 'react';
import { Box, Container, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PageHeader from '../../components/common/page-header';
import LeadList from '../../components/crm/leads/LeadList';

const LeadManagement: React.FC = () => {
	
	const addLeadTrigger = useRef<(() => void) | null>(null);

	const handleAddClick = useCallback(() => {
		if (addLeadTrigger.current) {
			addLeadTrigger.current();
		}
	}, []);

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<PageHeader
					title="Lead Management"
					subtitle="Track and qualify potential business opportunities"
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
							Add Lead
						</Button>
					}
				/>
				
				<LeadList onAddClick={(trigger) => { addLeadTrigger.current = trigger; }} />
			</Container>
		</Box>
	);
};

export default LeadManagement;
