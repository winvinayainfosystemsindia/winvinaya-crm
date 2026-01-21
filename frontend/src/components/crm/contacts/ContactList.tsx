import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Stack, IconButton, Tooltip, Avatar, Typography } from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	Star as StarIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchContacts, createContact, updateContact } from '../../../store/slices/contactSlice';
import { fetchCompanies } from '../../../store/slices/companySlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import ContactFormDialog from './ContactFormDialog';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import type { Contact, ContactCreate, ContactUpdate } from '../../../models/contact';
import { useSnackbar } from 'notistack';

const ContactList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, loading } = useAppSelector((state) => state.contacts);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
	const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		dispatch(fetchContacts({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
		// Also fetch companies as they are needed for the contact form
		dispatch(fetchCompanies({ limit: 1000 }));
	}, [dispatch, page, rowsPerPage, search, sortBy, sortOrder, activeFilters]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchContacts({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined,
			sortBy,
			sortOrder,
			...activeFilters
		}));
	};

	const handleOpenAdd = () => {
		setSelectedContact(null);
		setDialogOpen(true);
	};

	const handleOpenEdit = (contact: Contact) => {
		setSelectedContact(contact);
		setDialogOpen(true);
	};

	const handleFormSubmit = async (data: ContactCreate | ContactUpdate) => {
		setFormLoading(true);
		try {
			if (selectedContact) {
				await dispatch(updateContact({ publicId: selectedContact.public_id, contact: data as ContactUpdate })).unwrap();
				enqueueSnackbar('Contact updated successfully', { variant: 'success' });
			} else {
				await dispatch(createContact(data as ContactCreate)).unwrap();
				enqueueSnackbar('Contact created successfully', { variant: 'success' });
			}
			setDialogOpen(false);
			handleRefresh();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to save contact', { variant: 'error' });
		} finally {
			setFormLoading(false);
		}
	};

	const handleSort = (columnId: string) => {
		const isAsc = sortBy === columnId && sortOrder === 'asc';
		setSortOrder(isAsc ? 'desc' : 'asc');
		setSortBy(columnId);
		setPage(0);
	};

	const handleFilterChange = (key: string, value: any) => {
		setActiveFilters(prev => ({ ...prev, [key]: value }));
	};

	const handleApplyFilters = () => {
		setFilterDrawerOpen(false);
		setPage(0);
	};

	const handleClearFilters = () => {
		setActiveFilters({});
		setFilterDrawerOpen(false);
		setPage(0);
	};

	const filterFields: FilterField[] = [
		{
			key: 'is_decision_maker',
			label: 'Decision Maker',
			type: 'boolean'
		}
	];

	const columns = [
		{
			id: 'full_name',
			label: 'Name',
			minWidth: 220,
			sortable: true,
			format: (_: any, row: Contact) => (
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Avatar
						sx={{
							width: 32,
							height: 32,
							fontSize: '0.875rem',
							bgcolor: '#f2f3f3',
							color: '#545b64',
							fontWeight: 700
						}}
					>
						{row.first_name[0]}{row.last_name[0]}
					</Avatar>
					<Box>
						<Stack direction="row" spacing={0.5} alignItems="center">
							<Box sx={{ fontWeight: 700, color: '#007eb9' }}>{row.first_name} {row.last_name}</Box>
							{row.is_primary && (
								<Tooltip title="Primary Contact">
									<StarIcon sx={{ fontSize: 14, color: '#ff9900' }} />
								</Tooltip>
							)}
						</Stack>
						<Box sx={{ fontSize: '0.75rem', color: '#545b64' }}>{row.designation || 'No Designation'}</Box>
					</Box>
				</Stack>
			)
		},
		{
			id: 'company',
			label: 'Company',
			minWidth: 180,
			format: (value: any) => value?.name || '-'
		},
		{
			id: 'email',
			label: 'Email',
			minWidth: 200,
			format: (value: string) => (
				<Stack direction="row" spacing={1} alignItems="center">
					<EmailIcon sx={{ fontSize: 16, color: '#aab7b7' }} />
					<Typography variant="body2">{value}</Typography>
				</Stack>
			)
		},
		{
			id: 'phone',
			label: 'Phone',
			minWidth: 150,
			format: (value: string) => value ? (
				<Stack direction="row" spacing={1} alignItems="center">
					<PhoneIcon sx={{ fontSize: 16, color: '#aab7b7' }} />
					<Typography variant="body2">{value}</Typography>
				</Stack>
			) : '-'
		},
		{
			id: 'is_decision_maker',
			label: 'Decision Maker',
			minWidth: 140,
			sortable: true,
			format: (value: boolean) => value ? (
				<Box sx={{ color: '#1d8102', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Yes</Box>
			) : '-'
		},
		{
			id: 'created_at',
			label: 'Added On',
			minWidth: 130,
			sortable: true,
			format: (value: string) => new Date(value).toLocaleDateString()
		}
	];

	const actions = (
		<>
			<Button
				variant="outlined"
				startIcon={<RefreshIcon />}
				onClick={handleRefresh}
				sx={{ color: '#545b64', borderColor: '#d5dbdb', textTransform: 'none', fontWeight: 700 }}
			>
				Refresh
			</Button>
			<Button
				variant="contained"
				color="primary"
				startIcon={<AddIcon />}
				onClick={handleOpenAdd}
				sx={{
					px: 3,
					bgcolor: '#ff9900',
					color: '#232f3e',
					'&:hover': { bgcolor: '#ec7211' },
					textTransform: 'none',
					fontWeight: 800,
					boxShadow: 'none'
				}}
			>
				Add Contact
			</Button>
		</>
	);

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
			<Box sx={{ px: { xs: 2, sm: 3 } }}>
				<CRMPageHeader
					title="Contacts"
					actions={actions}
				/>

				<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<TextField
						size="small"
						placeholder="Search contacts..."
						value={search}
						onChange={handleSearchChange}
						sx={{ width: 320, bgcolor: 'white' }}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon fontSize="small" sx={{ color: '#545b64' }} />
								</InputAdornment>
							),
						}}
					/>

					<Tooltip title="Filter">
						<IconButton
							onClick={() => setFilterDrawerOpen(true)}
							sx={{
								border: '1px solid #d5dbdb',
								borderRadius: '2px',
								bgcolor: activeFilters.is_decision_maker ? '#f5f8fa' : 'white'
							}}
						>
							<FilterIcon fontSize="small" sx={{ color: activeFilters.is_decision_maker ? '#ec7211' : '#545b64' }} />
						</IconButton>
					</Tooltip>
				</Box>

				<CRMTable
					columns={columns}
					rows={list}
					total={total}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, newPage) => setPage(newPage)}
					onRowsPerPageChange={(e) => {
						setRowsPerPage(parseInt(e.target.value, 10));
						setPage(0);
					}}
					orderBy={sortBy}
					order={sortOrder}
					onSort={handleSort}
					loading={loading}
					emptyMessage="No contacts found. Add contacts to your companies."
					onRowClick={(row) => handleOpenEdit(row)}
				/>

				<ContactFormDialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					onSubmit={handleFormSubmit}
					contact={selectedContact}
					loading={formLoading}
				/>

				<FilterDrawer
					open={filterDrawerOpen}
					onClose={() => setFilterDrawerOpen(false)}
					fields={filterFields}
					activeFilters={activeFilters}
					onFilterChange={handleFilterChange}
					onClearFilters={handleClearFilters}
					onApplyFilters={handleApplyFilters}
				/>
			</Box>
		</Box>
	);
};

export default ContactList;
