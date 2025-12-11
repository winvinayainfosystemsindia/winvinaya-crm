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
	useTheme
} from '@mui/material';
import { Search, Add, Edit, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import userService from '../../services/userService';
import type { User } from '../../models/user';

interface UserTableProps {
	onAddUser?: () => void;
	onEditUser?: (user: User) => void;
	onViewUser?: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ onAddUser, onEditUser, onViewUser }) => {
	const theme = useTheme();
	const { user: currentUser } = useAppSelector((state) => state.auth);
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [totalCount, setTotalCount] = useState(0);

	useEffect(() => {
		fetchUsers();
	}, [page, rowsPerPage]);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const response = await userService.getAll(page * rowsPerPage, rowsPerPage);
			setUsers(response);
			setTotalCount(response.length + (page * rowsPerPage));
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
			<Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #d5dbdb', bgcolor: '#fafafa' }}>
				<TextField
					placeholder="Search users by name, email, or username..."
					value={searchTerm}
					onChange={handleSearch}
					size="small"
					sx={{
						width: '400px',
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
								Username
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Role
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Status
							</TableCell>
							<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Created Date
							</TableCell>
							<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>
								Actions
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={7} align="center" sx={{ py: 4 }}>
									<Typography color="text.secondary">Loading users...</Typography>
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
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{user.username}
										</Typography>
									</TableCell>
									<TableCell>
										<Chip
											label={user.role.toUpperCase()}
											color={getRoleColor(user.role)}
											size="small"
											sx={{ fontWeight: 600, fontSize: '0.75rem' }}
										/>
									</TableCell>
									<TableCell>
										<Chip
											label={user.is_active ? 'Active' : 'Inactive'}
											color={user.is_active ? 'success' : 'default'}
											size="small"
											variant={user.is_active ? 'filled' : 'outlined'}
											sx={{ fontWeight: 600, fontSize: '0.75rem', minWidth: 70 }}
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2" color="text.secondary">
											{user.created_at ? formatDate(user.created_at) : '-'}
										</Typography>
									</TableCell>
									<TableCell align="right">
										<Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
											<IconButton
												size="small"
												onClick={() => onViewUser?.(user)}
												sx={{
													color: 'text.secondary',
													'&:hover': { color: 'primary.main' }
												}}
											>
												<Visibility fontSize="small" />
											</IconButton>
											{currentUser?.role === 'admin' && (
												<IconButton
													size="small"
													onClick={() => onEditUser?.(user)}
													sx={{
														color: 'text.secondary',
														'&:hover': { color: 'warning.main' }
													}}
												>
													<Edit fontSize="small" />
												</IconButton>
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
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #d5dbdb', bgcolor: '#fafafa' }}>
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
						}
					}}
				/>
			</Box>
		</Paper>
	);
};

export default UserTable;
