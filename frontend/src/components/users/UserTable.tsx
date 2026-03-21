import React, { useState, useEffect } from 'react';
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Button,
	Chip,
	IconButton,
	InputAdornment,
	Typography,
	useMediaQuery,
	useTheme,
	CircularProgress,
	Menu,
	MenuItem,
	ListItemIcon as MuiListItemIcon,
	ListItemText
} from '@mui/material';

import {
	Search,
	Add,
	Edit,
	Visibility,
	Delete,
	WhatsApp as WhatsAppIcon,
	MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import userService from '../../services/userService';
import type { User } from '../../models/user';
import CustomTablePagination from '../common/CustomTablePagination';
import { alpha } from '@mui/material/styles';

interface UserTableProps {
	onAddUser?: () => void;
	onEditUser?: (user: User) => void;
	onViewUser?: (user: User) => void;
	onDeleteUser?: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ onAddUser, onEditUser, onViewUser, onDeleteUser }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isMedium = useMediaQuery(theme.breakpoints.down('md'));
	const { user: currentUser } = useAppSelector((state) => state.auth);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [totalCount, setTotalCount] = useState(0);

	// Add effect for debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchUsers();
		}, 500);
		return () => clearTimeout(timer);
	}, [page, rowsPerPage, searchTerm]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			// Using backend search by passing searchTerm to getAll
			const response = await userService.getAll(page * rowsPerPage, rowsPerPage, undefined, searchTerm);
			setUsers(response.items);
			setTotalCount(response.total);
		} catch (error) {
			console.error('Failed to fetch users:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(event.target.value);
		setPage(0);
	};

	const getRoleColor = (role: string): 'error' | 'warning' | 'info' | 'success' | 'secondary' | 'primary' => {
		switch (role.toLowerCase()) {
			case 'admin': return 'error';
			case 'manager': return 'warning';
			case 'trainer': return 'info';
			case 'counselor': return 'success';
			case 'project_coordinator': return 'secondary';
			case 'developer': return 'primary';
			default: return 'info';
		}
	};

	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [activeUser, setActiveUser] = useState<User | null>(null);

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
		setMenuAnchorEl(event.currentTarget);
		setActiveUser(user);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
		setActiveUser(null);
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return '-';
		try {
			return format(new Date(dateString), 'd MMM yyyy');
		} catch {
			return '-';
		}
	};

	return (
		<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: 0 }}>
			{/* Header with Search and Add Button */}
			<Box sx={{
				p: 2,
				display: 'flex',
				flexDirection: isMobile ? 'column' : 'row',
				justifyContent: 'space-between',
				alignItems: isMobile ? 'stretch' : 'center',
				gap: 2,
				borderBottom: '1px solid #d5dbdb',
				bgcolor: '#fafafa'
			}}>
				<TextField
					placeholder="Search users..."
					value={searchTerm}
					onChange={handleSearch}
					size="small"
					sx={{
						width: isMobile ? '100%' : '400px',
						'& .MuiOutlinedInput-root': {
							bgcolor: 'white',
							'& fieldset': {
								borderColor: '#d5dbdb',
							},
							'&:hover fieldset': {
								borderColor: theme.palette.primary.main,
							},
						}
					}}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<Search sx={{ color: 'text.secondary', fontSize: 20 }} />
							</InputAdornment>
						),
					}}
				/>

				{currentUser?.role === 'admin' && (
					<Button
						variant="contained"
						startIcon={<Add />}
						onClick={onAddUser}
						fullWidth={isMobile}
						sx={{
							bgcolor: '#ec7211',
							color: 'white',
							textTransform: 'none',
							fontWeight: 600,
							'&:hover': {
								bgcolor: '#eb5f07',
							}
						}}
					>
						Add User
					</Button>
				)}
			</Box>

			{/* Table */}
			<TableContainer>
				<Table sx={{ minWidth: 650 }} aria-label="user table">
					<TableHead>
						<TableRow sx={{ bgcolor: '#fafafa' }}>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Name
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Email
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								WhatsApp
							</TableCell>
							<TableCell sx={{
								fontWeight: 'bold',
								color: 'text.secondary',
								fontSize: '0.875rem',
								borderBottom: '2px solid #d5dbdb',
								display: isMedium ? 'none' : 'table-cell'
							}}>
								Username
							</TableCell>
							<TableCell sx={{
								fontWeight: 'bold',
								color: 'text.secondary',
								fontSize: '0.875rem',
								borderBottom: '2px solid #d5dbdb',
								display: isMobile ? 'none' : 'table-cell'
							}}>
								Role
							</TableCell>
							<TableCell sx={{
								fontWeight: 'bold',
								color: 'text.secondary',
								fontSize: '0.875rem',
								borderBottom: '2px solid #d5dbdb',
								display: isMobile ? 'none' : 'table-cell'
							}}>
								Status
							</TableCell>
							<TableCell sx={{
								fontWeight: 'bold',
								color: 'text.secondary',
								fontSize: '0.875rem',
								borderBottom: '2px solid #d5dbdb',
								display: isMedium ? 'none' : 'table-cell'
							}}>
								Created Date
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody aria-busy={loading}>
						{loading ? (
							<TableRow>
								<TableCell colSpan={8} align="center" sx={{ py: 4 }}>
									<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
										<CircularProgress size={24} />
										<Typography color="text.secondary">Loading users...</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : users.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No users found</Typography>
								</TableCell>
							</TableRow>
						) : (
							users.map((user) => (
								<TableRow
									key={user.id}
									sx={{
										'&:hover': {
											bgcolor: '#f5f8fa',
										},
										'&:last-child td': {
											borderBottom: 0
										}
									}}
								>
									<TableCell>
										<Typography variant="body2" sx={{ fontWeight: 500 }}>
											{user.full_name || '-'}
										</Typography>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{user.email}
										</Typography>
									</TableCell>
									<TableCell>
										{user.mobile ? (() => {
											const cleanPhone = user.mobile.replace(/\D/g, '');
											const displayPhone = cleanPhone.length === 12 && cleanPhone.startsWith('91') 
												? `+91 - ${cleanPhone.slice(2)}`
												: cleanPhone.length === 10 
													? `+91 - ${cleanPhone}` 
													: user.mobile;
											
											return (
												<Chip
													icon={<WhatsAppIcon sx={{ fontSize: '1.1rem !important', color: '#075E54 !important' }} />}
													label={displayPhone}
													size="small"
													variant="outlined"
													onClick={() => window.open(`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}`, '_blank')}
													sx={{ 
														borderColor: '#075E54',
														color: '#075E54',
														fontWeight: 600,
														borderRadius: '4px',
														'&:hover': {
															bgcolor: alpha('#25D366', 0.1),
															borderColor: '#128C7E'
														},
														'& .MuiChip-label': {
															px: 1
														}
													}}
												/>
											);
										})() : '-'}
									</TableCell>
									<TableCell sx={{ display: isMedium ? 'none' : 'table-cell' }}>
										<Typography variant="body2" color="text.secondary">
											{user.username}
										</Typography>
									</TableCell>
									<TableCell sx={{ display: isMobile ? 'none' : 'table-cell' }}>
										<Chip
											label={user.role.toUpperCase()}
											color={getRoleColor(user.role)}
											size="small"
											variant={'outlined'}
											sx={{ fontWeight: 600, borderRadius: 0, fontSize: '0.75rem' }}
											aria-label={`Role: ${user.role}`}
										/>
									</TableCell>
									<TableCell sx={{ display: isMobile ? 'none' : 'table-cell' }}>
										<Chip
											label={user.is_active ? 'Active' : 'Inactive'}
											color={user.is_active ? 'success' : 'default'}
											size="small"
											variant={user.is_active ? 'filled' : 'outlined'}
											sx={{ fontWeight: 600, borderRadius: 0, fontSize: '0.75rem', minWidth: 70 }}
											aria-label={`Status: ${user.is_active ? 'Active' : 'Inactive'}`}
										/>
									</TableCell>
									<TableCell sx={{ display: isMedium ? 'none' : 'table-cell' }}>
										<Typography variant="body2" color="text.secondary">
											{user.created_at ? formatDate(user.created_at) : '-'}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<IconButton
											size="small"
											onClick={(e) => handleMenuOpen(e, user)}
											aria-label="Actions"
											sx={{ color: '#545b64' }}
										>
											<MoreVertIcon fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>

				</Table>
			</TableContainer>

			<CustomTablePagination
				count={totalCount}
				page={page}
				rowsPerPage={rowsPerPage}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
				onRowsPerPageSelectChange={setRowsPerPage}
			/>

			{/* Actions Menu */}
			<Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleMenuClose} PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
					border: '1px solid #d5dbdb',
					minWidth: 150
				}
			}}>
				<MenuItem onClick={() => { onViewUser?.(activeUser!); handleMenuClose(); }}>
					<MuiListItemIcon><Visibility fontSize="small" /></MuiListItemIcon>
					<ListItemText primary="View Details" primaryTypographyProps={{ fontSize: '0.875rem' }} />
				</MenuItem>
				{currentUser?.role === 'admin' && [
					<MenuItem key="edit" onClick={() => { onEditUser?.(activeUser!); handleMenuClose(); }}>
						<MuiListItemIcon><Edit fontSize="small" sx={{ color: 'warning.main' }} /></MuiListItemIcon>
						<ListItemText primary="Edit User" primaryTypographyProps={{ fontSize: '0.875rem' }} />
					</MenuItem>,
					<MenuItem key="delete" onClick={() => { onDeleteUser?.(activeUser!); handleMenuClose(); }}>
						<MuiListItemIcon><Delete fontSize="small" sx={{ color: 'error.main' }} /></MuiListItemIcon>
						<ListItemText primary="Delete User" primaryTypographyProps={{ fontSize: '0.875rem' }} />
					</MenuItem>
				]}
			</Menu>
		</Paper>
	);
};

export default UserTable;
