import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, InputAdornment, Stack, IconButton, Tooltip, Avatar } from '@mui/material';
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
import { fetchContacts } from '../../../store/slices/contactSlice';
import CRMPageHeader from '../common/CRMPageHeader';
import CRMTable from '../common/CRMTable';
import type { Contact } from '../../../models/contact';

const ContactList: React.FC = () => {
	const dispatch = useAppDispatch();
	const { list, total, loading } = useAppSelector((state) => state.contacts);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState('');

	useEffect(() => {
		dispatch(fetchContacts({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
	}, [dispatch, page, rowsPerPage, search]);

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
		setPage(0);
	};

	const handleRefresh = () => {
		dispatch(fetchContacts({
			skip: page * rowsPerPage,
			limit: rowsPerPage,
			search: search || undefined
		}));
	};

	const columns = [
		{
			id: 'full_name',
			label: 'Name',
			minWidth: 220,
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
			format: (value: boolean) => value ? (
				<Box sx={{ color: '#1d8102', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Yes</Box>
			) : '-'
		},
		{
			id: 'created_at',
			label: 'Added On',
			minWidth: 130,
			format: (value: string) => new Date(value).toLocaleDateString()
		}
	];

	const actions = (
		<>
			<Button
				variant="outlined"
				startIcon={<RefreshIcon />}
				onClick={handleRefresh}
				sx={{ color: '#545b64', borderColor: '#d5dbdb' }}
			>
				Refresh
			</Button>
			<Button
				variant="contained"
				color="primary"
				startIcon={<AddIcon />}
				sx={{ px: 3 }}
			>
				Add Contact
			</Button>
		</>
	);

	return (
		<Box>
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
					<IconButton sx={{ border: '1px solid #d5dbdb', borderRadius: '2px', bgcolor: 'white' }}>
						<FilterIcon fontSize="small" sx={{ color: '#545b64' }} />
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
				loading={loading}
				emptyMessage="No contacts found. Add contacts to your companies."
				onRowClick={(row) => console.log('Clicked Contact', row.public_id)}
			/>
		</Box>
	);
};

// Internal Typography import fix
import { Typography } from '@mui/material';

export default ContactList;
