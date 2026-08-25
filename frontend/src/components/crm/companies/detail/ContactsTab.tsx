import React, { useState } from 'react';
import { Box, TableRow, TableCell, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../store/hooks';
import { createContact, updateContact } from '../../../../store/slices/contactSlice';
import { fetchCompanyById } from '../../../../store/slices/companySlice';
import DataTable from '../../../common/table/DataTable';
import ContactFormDialog from '../../contacts/ContactFormDialog';
import type { Company } from '../../../../models/company';
import type { Contact, ContactCreate, ContactUpdate } from '../../../../models/contact';
import useToast from '../../../../hooks/useToast';

interface ContactsTabProps {
	company: Company;
	columns: any[];
}

const ContactsTab: React.FC<ContactsTabProps> = ({ company, columns }) => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { publicId } = useParams<{ publicId: string }>();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	const handleAddContact = () => {
		setSelectedContact(null);
		setDialogOpen(true);
	};

	const handleEditContact = (contact: Contact) => {
		setSelectedContact(contact);
		setDialogOpen(true);
	};

	const handleFormSubmit = async (data: ContactCreate | ContactUpdate) => {
		setFormLoading(true);
		try {
			if (selectedContact) {
				await dispatch(updateContact({ publicId: selectedContact.public_id, contact: data as ContactUpdate })).unwrap();
				toast.success('Contact updated successfully');
			} else {
				const contactData = {
					...data,
					company_id: (data as ContactCreate).company_id || company.id
				} as ContactCreate;
				await dispatch(createContact(contactData)).unwrap();
				toast.success('Contact created successfully');
			}
			setDialogOpen(false);
			if (publicId) {
				dispatch(fetchCompanyById(publicId));
			}
		} catch (error: any) {
			toast.error(error || 'Failed to save contact');
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Box>
			<DataTable
				columns={columns}
				data={company.contacts || []}
				totalCount={company.contacts?.length || 0}
				page={0}
				rowsPerPage={100}
				onPageChange={() => { }}
				onRowsPerPageChange={() => { }}
				searchTerm=""
				onCreateClick={handleAddContact}
				createButtonText="Add New Contact"
				canCreate={true}
				emptyMessage="No contacts associated with this company."
				headerActions={
					<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
						Contacts ({company.contacts?.length || 0})
					</Typography>
				}
				renderRow={(row: any) => (
					<TableRow 
						key={row.id || row.public_id}
						onClick={() => handleEditContact(row)}
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

			<ContactFormDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSubmit={handleFormSubmit}
				contact={selectedContact}
				initialCompanyId={company.id}
				loading={formLoading}
			/>
		</Box>
	);
};

export default ContactsTab;
