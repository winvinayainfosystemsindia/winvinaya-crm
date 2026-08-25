import React, { useState } from 'react';
import { Box, TableRow, TableCell, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../store/hooks';
import { createDeal, updateDeal } from '../../../../store/slices/dealSlice';
import { fetchCompanyById } from '../../../../store/slices/companySlice';
import DataTable from '../../../common/table/DataTable';
import DealFormDialog from '../../deals/DealFormDialog';
import type { Company } from '../../../../models/company';
import type { Deal, DealCreate, DealUpdate } from '../../../../models/deal';
import useToast from '../../../../hooks/useToast';

interface DealsTabProps {
	company: Company;
	columns: any[];
}

const DealsTab: React.FC<DealsTabProps> = ({ company, columns }) => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { publicId } = useParams<{ publicId: string }>();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	const handleAddDeal = () => {
		setSelectedDeal(null);
		setDialogOpen(true);
	};

	const handleEditDeal = (deal: Deal) => {
		setSelectedDeal(deal);
		setDialogOpen(true);
	};

	const handleFormSubmit = async (data: DealCreate | DealUpdate) => {
		setFormLoading(true);
		try {
			if (selectedDeal) {
				await dispatch(updateDeal({ publicId: selectedDeal.public_id, deal: data as DealUpdate })).unwrap();
				toast.success('Deal updated successfully');
			} else {
				const dealData = {
					...data,
					company_id: (data as DealCreate).company_id || company.id
				} as DealCreate;
				await dispatch(createDeal(dealData)).unwrap();
				toast.success('Deal created successfully');
			}
			setDialogOpen(false);
			if (publicId) {
				dispatch(fetchCompanyById(publicId));
			}
		} catch (error: any) {
			toast.error(error || 'Failed to save deal');
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Box>
			<DataTable
				columns={columns}
				data={company.deals || []}
				totalCount={company.deals?.length || 0}
				page={0}
				rowsPerPage={100}
				onPageChange={() => { }}
				onRowsPerPageChange={() => { }}
				searchTerm=""
				onCreateClick={handleAddDeal}
				createButtonText="New Deal Opportunity"
				canCreate={true}
				emptyMessage="No deals associated with this company."
				headerActions={
					<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Deals ({company.deals?.length || 0})
					</Typography>
				}
				renderRow={(row: any) => (
					<TableRow 
						key={row.id || row.public_id}
						onClick={() => handleEditDeal(row)}
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

			<DealFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleFormSubmit}
				deal={selectedDeal}
				initialCompanyId={company.id}
				loading={formLoading}
			/>
		</Box>
	);
};

export default DealsTab;
