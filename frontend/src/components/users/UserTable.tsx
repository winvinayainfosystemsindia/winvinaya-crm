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
	TablePagination,
	TextField,
	Button,
	Chip,
	IconButton,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	Typography,
	useMediaQuery,
	useTheme,
	CircularProgress
} from '@mui/material';

import { Search, Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import userService from '../../services/userService';
import type { User } from '../../models/user';

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

	useEffect(() => {
		fetchUsers();
	}, [page, rowsPerPage]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await userService.getAll(page * rowsPerPage, rowsPerPage);
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

	const filteredUsers = users.filter(user =>
		user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const getRoleColor = (role: string): 'error' | 'warning' | 'info' | 'success' => {
		switch (role.toLowerCase()) {
			case 'admin': return 'error';
			case 'manager': return 'warning';
			case 'trainer': return 'info';
			case 'counselor': return 'success';
			default: return 'info';
		}
	};

	const formatDate = (dateString: string) => {
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
								<TableCell colSpan={7} align="center" sx={{ py: 4 }}>
									<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
										<CircularProgress size={24} />
										<Typography color="text.secondary">Loading users...</Typography>
									</Box>
								</TableCell>
							</TableRow>
						) : filteredUsers.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">No users found</Typography>
								</TableCell>
							</TableRow>
						) : (
							filteredUsers.map((user) => (
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
										<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
											<IconButton
												size="small"
												onClick={() => onViewUser?.(user)}
												aria-label={`View details for ${user.full_name || user.username}`}
												title="View User"
												sx={{
													color: 'text.secondary',
													'&:hover': { color: 'primary.main' }
												}}
											>
												<Visibility fontSize="small" />
											</IconButton>
											{currentUser?.role === 'admin' && (
												<>
													<IconButton
														size="small"
														onClick={() => onEditUser?.(user)}
														aria-label={`Edit ${user.full_name || user.username}`}
														title="Edit User"
														sx={{
															color: 'text.secondary',
															'&:hover': { color: 'warning.main' }
														}}
													>
														<Edit fontSize="small" />
													</IconButton>
													<IconButton
														size="small"
														onClick={() => onDeleteUser?.(user)}
														aria-label={`Delete ${user.full_name || user.username}`}
														title="Delete User"
														sx={{
															color: 'text.secondary',
															'&:hover': { color: 'error.main' }
														}}
													>
														<Delete fontSize="small" />
													</IconButton>
												</>
											)}
										</Box>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>

				</Table>
			</TableContainer>

			{/* Pagination with Row Limiter */}
			<Box sx={{
				display: 'flex',
				flexDirection: isMobile ? 'column' : 'row',
				justifyContent: 'space-between',
				alignItems: 'center',
				p: 2,
				borderTop: '1px solid #d5dbdb',
				bgcolor: '#fafafa',
				gap: isMobile ? 1 : 0
			}}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					<Typography variant="body2" color="text.secondary">
						Rows per page:
					</Typography>
					<FormControl size="small">
						<Select
							value={rowsPerPage}
							onChange={(e) => handleChangeRowsPerPage(e as any)}
							sx={{
								height: '32px',
								'& .MuiOutlinedInput-notchedOutline': {
									borderColor: '#d5dbdb',
								},
								'&:hover .MuiOutlinedInput-notchedOutline': {
									borderColor: theme.palette.primary.main,
								}
							}}
						>
							<MenuItem value={5}>5</MenuItem>
							<MenuItem value={10}>10</MenuItem>
							<MenuItem value={25}>25</MenuItem>
							<MenuItem value={50}>50</MenuItem>
							<MenuItem value={100}>100</MenuItem>
						</Select>
					</FormControl>
				</Box>

				<TablePagination
					component="div"
					count={totalCount}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[]}
					sx={{
						border: 'none',
						'.MuiTablePagination-toolbar': {
							paddingLeft: 0,
							paddingRight: 0,
							minHeight: isMobile ? '40px' : '52px'
						},
						'.MuiTablePagination-selectLabel, .MuiTablePagination-input': {
							display: 'none'
						}
					}}
				/>
			</Box>
		</Paper>
	);
};

export default UserTable;
