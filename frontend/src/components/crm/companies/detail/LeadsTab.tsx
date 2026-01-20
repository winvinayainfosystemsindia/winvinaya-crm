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

interface LeadsTabProps {
	company: Company;
	columns: any[];
}

const LeadsTab: React.FC<LeadsTabProps> = ({ company, columns }) => {
	const navigate = useNavigate();

	return (
		<Paper sx={{ borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
			<Box sx={{ p: 3, borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#232f3e' }}>
					Leads ({company.leads?.length || 0})
				</Typography>
				<Button
					variant="contained"
					sx={{ bgcolor: '#ec7211', color: 'white', '&:hover': { bgcolor: '#eb5f07' }, textTransform: 'none', fontWeight: 800 }}
					onClick={() => navigate('/crm/leads')}
				>
					Create New Lead
				</Button>
			</Box>
			<CRMTable
				columns={columns}
				rows={company.leads || []}
				total={company.leads?.length || 0}
				page={0}
				rowsPerPage={100}
				onPageChange={() => { }}
				onRowsPerPageChange={() => { }}
				emptyMessage="No leads associated with this company."
			/>
		</Paper>
	);
};

export default LeadsTab;
