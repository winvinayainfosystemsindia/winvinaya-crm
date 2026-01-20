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

interface ContactsTabProps {
	company: Company;
	columns: any[];
}

const ContactsTab: React.FC<ContactsTabProps> = ({ company, columns }) => {
	const navigate = useNavigate();

	return (
		<Paper sx={{ borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
			<Box sx={{ p: 3, borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#232f3e' }}>
					Contacts ({company.contacts?.length || 0})
				</Typography>
				<Button
					variant="contained"
					sx={{ bgcolor: '#007eb9', color: 'white', '&:hover': { bgcolor: '#006a9e' }, textTransform: 'none', fontWeight: 800 }}
					onClick={() => navigate('/crm/contacts')}
				>
					Add New Contact
				</Button>
			</Box>
			<CRMTable
				columns={columns}
				rows={company.contacts || []}
				total={company.contacts?.length || 0}
				page={0}
				rowsPerPage={100}
				onPageChange={() => { }}
				onRowsPerPageChange={() => { }}
				emptyMessage="No contacts associated with this company."
			/>
		</Paper>
	);
};

export default ContactsTab;
