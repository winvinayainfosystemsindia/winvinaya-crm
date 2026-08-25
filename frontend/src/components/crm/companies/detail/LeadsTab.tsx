import React, { useState } from 'react';
import { Box, TableRow, TableCell, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../store/hooks';
import { createLead, updateLead } from '../../../../store/slices/leadSlice';
import { fetchCompanyById } from '../../../../store/slices/companySlice';
import DataTable from '../../../common/table/DataTable';
import LeadFormDialog from '../../leads/LeadFormDialog';
import type { Company } from '../../../../models/company';
import type { Lead, LeadCreate, LeadUpdate } from '../../../../models/lead';
import useToast from '../../../../hooks/useToast';

interface LeadsTabProps {
	company: Company;
	columns: any[];
}

const LeadsTab: React.FC<LeadsTabProps> = ({ company, columns }) => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { publicId } = useParams<{ publicId: string }>();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	const handleAddLead = () => {
		setSelectedLead(null);
		setDialogOpen(true);
	};

	const handleEditLead = (lead: Lead) => {
		setSelectedLead(lead);
		setDialogOpen(true);
	};

	const handleFormSubmit = async (data: LeadCreate | LeadUpdate) => {
		setFormLoading(true);
		try {
			if (selectedLead) {
				await dispatch(updateLead({ publicId: selectedLead.public_id, lead: data as LeadUpdate })).unwrap();
				toast.success('Lead updated successfully');
			} else {
				const leadData = {
					...data,
					company_id: (data as LeadCreate).company_id || company.id
				} as LeadCreate;
				await dispatch(createLead(leadData)).unwrap();
				toast.success('Lead created successfully');
			}
			setDialogOpen(false);
			if (publicId) {
				dispatch(fetchCompanyById(publicId));
			}
		} catch (error: any) {
			toast.error(error || 'Failed to save lead');
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Box>
			<DataTable
				columns={columns}
				data={company.leads || []}
				totalCount={company.leads?.length || 0}
				page={0}
				rowsPerPage={100}
				onPageChange={() => { }}
				onRowsPerPageChange={() => { }}
				searchTerm=""
				onCreateClick={handleAddLead}
				createButtonText="Create New Lead"
				canCreate={true}
				emptyMessage="No leads associated with this company."
				headerActions={
					<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Leads ({company.leads?.length || 0})
					</Typography>
				}
				renderRow={(row: any) => (
					<TableRow 
						key={row.id || row.public_id}
						onClick={() => handleEditLead(row)}
						sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
					>
						{columns.map((col: any) => (
							<TableCell key={col.id} align={col.align}>
								{col.format ? col.format(row[col.id], row) : (row[col.id] || '—')}
							</TableCell>
						))}
					</TableRow>
				)}
			/>

			<LeadFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleFormSubmit}
				lead={selectedLead}
				initialCompanyId={company.id}
				loading={formLoading}
			/>
		</Box>
	);
};

export default LeadsTab;
