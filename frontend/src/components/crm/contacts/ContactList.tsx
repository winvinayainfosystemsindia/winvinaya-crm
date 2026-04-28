import React, { useEffect, useState } from 'react';
import {
	Box,
	Button,
	TextField,
	InputAdornment,
	Stack,
	IconButton,
	Tooltip,
	Typography,
	Chip,
	Grid
} from '@mui/material';
import {
	Add as AddIcon,
	Search as SearchIcon,
	FilterList as FilterIcon,
	Refresh as RefreshIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	Star as StarIcon,
	WhatsApp as WhatsAppIcon,
	People as PeopleIcon,
	VerifiedUser as DecisionIcon,
	Stars as PrimaryIcon,
	History as RecentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchContacts, createContact, updateContact, deleteContact } from '../../../store/slices/contactSlice';
import { fetchCompanies } from '../../../store/slices/companySlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import ContactFormDialog from './ContactFormDialog';
import FilterDrawer, { type FilterField } from '../../common/FilterDrawer';
import ConfirmDialog from '../../common/ConfirmDialog';
import StatCard from '../../common/stats/StatCard';
import CRMRowActions from '../common/CRMRowActions';
import EnterpriseAvatar from '../../common/avatar/Avatar';
import type { Contact, ContactCreate, ContactUpdate } from '../../../models/contact';
import { useSnackbar } from 'notistack';

interface ContactListProps {
	title?: string;
	subtitle?: string;
}

const ContactList: React.FC<ContactListProps> = ({ title = "Contacts", subtitle }) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { list, total, loading } = useAppSelector((state) => state.contacts);
	const { user } = useAppSelector((state) => state.auth);
	const isAdmin = user?.role === 'admin';

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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState(false);

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

	const handleDeleteClick = (contact: Contact) => {
		setSelectedContact(contact);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!selectedContact) return;
		setDeleting(true);
		try {
			await dispatch(deleteContact(selectedContact.public_id)).unwrap();
			enqueueSnackbar('Contact deleted successfully', { variant: 'success' });
			setDeleteDialogOpen(false);
			handleRefresh();
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to delete contact', { variant: 'error' });
		} finally {
			setDeleting(false);
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
		},
		{
			key: 'contact_source',
			label: 'Source',
			type: 'single-select',
			options: [
				{ value: 'whatsapp', label: '💬 WhatsApp' },
				{ value: 'linkedin', label: 'LinkedIn' },
				{ value: 'website', label: 'Website' },
				{ value: 'referral', label: 'Referral' },
				{ value: 'cold_call', label: 'Cold Call' },
				{ value: 'event', label: 'Event' },
				{ value: 'other', label: 'Other' }
			]
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
					<EnterpriseAvatar name={`${row.first_name} ${row.last_name}`} size={32} />
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
			format: (value: string | undefined) => value ? (
				<Stack direction="row" spacing={1} alignItems="center">
					<EmailIcon sx={{ fontSize: 16, color: '#aab7b7' }} />
					<Typography variant="body2">{value}</Typography>
				</Stack>
			) : <Typography variant="body2" sx={{ color: '#aab7b7' }}>—</Typography>
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
			id: 'contact_source',
			label: 'Source',
			minWidth: 130,
			format: (value: string | undefined) => {
				if (value === 'whatsapp') {
					return (
						<Chip
							icon={<WhatsAppIcon sx={{ fontSize: '14px !important', color: '#fff !important' }} />}
							label="WhatsApp"
							size="small"
							sx={{
								bgcolor: '#25D366',
								color: '#fff',
								fontWeight: 700,
								fontSize: '0.7rem',
								height: 20,
								'& .MuiChip-label': { px: 0.75 },
							}}
						/>
					);
				}
				if (!value) return <Typography variant="body2" sx={{ color: '#aab7b7' }}>—</Typography>;
				return (
					<Chip
						label={value.replace(/_/g, ' ')}
						size="small"
						variant="outlined"
						sx={{ fontSize: '0.7rem', height: 20, textTransform: 'capitalize', '& .MuiChip-label': { px: 0.75 } }}
					/>
				);
			}
		},
		{
			id: 'created_at',
			label: 'Added On',
			minWidth: 130,
			sortable: true,
			format: (value: string) => new Date(value).toLocaleDateString()
		},
		{
			id: 'actions',
			label: 'Actions',
			minWidth: 100,
			align: 'right' as const,
			format: (_: any, row: Contact) => (
				<CRMRowActions
					row={row}
					onView={() => navigate(`/crm/contacts/${row.public_id}`)}
					onEdit={() => handleOpenEdit(row)}
					onDelete={isAdmin ? () => handleDeleteClick(row) : undefined}
				/>
			)
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
					bgcolor: '#ec7211',
					'&:hover': { bgcolor: '#eb5f07' },
					textTransform: 'none',
					fontWeight: 600,
					boxShadow: 'none'
				}}
			>
				Add Contact
			</Button>
		</>
	);

	// Calculate stats from the list
	const primaryCount = list.filter(c => c.is_primary).length;
	const decisionMakerCount = list.filter(c => c.is_decision_maker).length;
	const recentCount = list.filter(c => {
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		return new Date(c.created_at) > weekAgo;
	}).length;

	return (
		<>
			<CRMPageHeader
				title={title}
				subtitle={subtitle}
				actions={actions}
			/>

			<Box sx={{ mt: 3 }}>
				<Grid container spacing={3} sx={{ mb: 4 }}>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Total Contacts"
							value={total}
							icon={<PeopleIcon />}
							color="#007eb9"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Primary Contacts"
							value={primaryCount}
							icon={<PrimaryIcon />}
							color="#1d8102"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Decision Makers"
							value={decisionMakerCount}
							icon={<DecisionIcon />}
							color="#ff9900"
						/>
					</Grid>
					<Grid size={{ xs: 12, sm: 6, md: 3 }}>
						<StatCard
							title="Added this week"
							value={recentCount}
							icon={<RecentIcon />}
							color="#ec7211"
						/>
					</Grid>
				</Grid>

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
					onRowsPerPageSelectChange={(rows) => {
						setRowsPerPage(rows);
						setPage(0);
					}}
					orderBy={sortBy}
					order={sortOrder}
					onSort={handleSort}
					loading={loading}
					emptyMessage="No contacts found. Add contacts to your companies."
					onRowClick={(row) => navigate(`/crm/contacts/${row.public_id}`)}
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

				<ConfirmDialog
					open={deleteDialogOpen}
					title="Delete Contact"
					message={`Are you sure you want to delete "${selectedContact?.first_name} ${selectedContact?.last_name}"? This action cannot be undone.`}
					confirmText="Delete"
					onClose={() => setDeleteDialogOpen(false)}
					onConfirm={handleDeleteConfirm}
					loading={deleting}
					severity="error"
				/>
			</Box>
		</>
	);
};

export default ContactList;
