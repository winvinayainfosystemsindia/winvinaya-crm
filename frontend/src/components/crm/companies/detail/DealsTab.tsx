import React from 'react';
import {
	Box,
	Typography,
	Button,
	Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CRMTable from '../../common/CRMTable';
import type { Company } from '../../../../models/company';

interface DealsTabProps {
	company: Company;
	columns: any[];
}

const DealsTab: React.FC<DealsTabProps> = ({ company, columns }) => {
	const navigate = useNavigate();

	return (
		<Paper sx={{ borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
			<Box sx={{ p: 3, borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#232f3e' }}>
					Deals ({company.deals?.length || 0})
				</Typography>
				<Button
					variant="contained"
					sx={{ bgcolor: '#1d8102', color: 'white', '&:hover': { bgcolor: '#1a7202' }, textTransform: 'none', fontWeight: 800 }}
					onClick={() => navigate('/crm/deals')}
				>
					New Deal Opportunity
				</Button>
			</Box>
			<CRMTable
				columns={columns}
				rows={company.deals || []}
				total={company.deals?.length || 0}
				page={0}
				rowsPerPage={100}
				onPageChange={() => { }}
				onRowsPerPageChange={() => { }}
				emptyMessage="No deals associated with this company."
			/>
		</Paper>
	);
};

export default DealsTab;
