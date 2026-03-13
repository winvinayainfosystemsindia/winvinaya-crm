import React, { useState, useEffect } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Typography,
	Box,
	Chip,
	CircularProgress,
	Alert
} from '@mui/material';
import {
	Edit as EditIcon,
	Delete as DeleteIcon,
	Add as AddIcon,
	Save as SaveIcon,
	Cancel as CancelIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchActivityTypes,
	createActivityType,
	updateActivityType,
	deleteActivityType,
	clearActivityTypeError
} from '../../../../store/slices/dsrActivityTypeSlice';
import useToast from '../../../../hooks/useToast';
import type { DSRActivityType } from '../../../../models/dsr';
import DSRAdminTableHeader from './DSRAdminTableHeader';

const DSRActivityTypeManagement: React.FC = () => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { activityTypes, loading, error } = useAppSelector((state) => state.dsrActivityType);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingType, setEditingType] = useState<Partial<DSRActivityType> | null>(null);
	const [formData, setFormData] = useState({
		name: '',
		code: '',
		description: '',
		sort_order: 0
	});
	const [searchTerm, setSearchTerm] = useState('');

	const filteredActivityTypes = React.useMemo(() => {
		if (!searchTerm) return activityTypes;
		const s = searchTerm.toLowerCase();
		return activityTypes.filter(t =>
			t.name.toLowerCase().includes(s) ||
			t.code.toLowerCase().includes(s) ||
			(t.description || '').toLowerCase().includes(s)
		);
	}, [activityTypes, searchTerm]);

	useEffect(() => {
		dispatch(fetchActivityTypes({ onlyActive: false }));
	}, [dispatch]);

	const handleOpenDialog = (type?: DSRActivityType) => {
		if (type) {
			setEditingType(type);
			setFormData({
				name: type.name,
				code: type.code,
				description: type.description || '',
				sort_order: type.sort_order
			});
		} else {
			setEditingType(null);
			setFormData({
				name: '',
				code: '',
				description: '',
				sort_order: activityTypes.length + 1
			});
		}
		setDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setDialogOpen(false);
		dispatch(clearActivityTypeError());
	};

	const handleSave = async () => {
		try {
			if (editingType?.public_id) {
				await dispatch(updateActivityType({
					publicId: editingType.public_id,
					data: formData as any
				})).unwrap();
				toast.success('Activity type updated successfully');
			} else {
				await dispatch(createActivityType(formData as any)).unwrap();
				toast.success('Activity type created successfully');
			}
			handleCloseDialog();
		} catch (err) {
			// Error handled by Redux state
		}
	};

	const handleDelete = async (publicId: string) => {
		if (window.confirm('Are you sure you want to delete this activity type? It will be soft-deleted.')) {
			try {
				await dispatch(deleteActivityType(publicId)).unwrap();
				toast.success('Activity type deleted');
			} catch (err: any) {
				toast.error(err || 'Failed to delete activity type');
			}
		}
	};

	return (
		<Box>
			<Paper sx={{ border: '1px solid #d5dbdb', boxShadow: 'none', borderRadius: '8px', overflow: 'hidden' }}>
				<DSRAdminTableHeader
					title="Activity Taxonomy"
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					onRefresh={() => dispatch(fetchActivityTypes({ onlyActive: false }))}
					placeholder="Search activity types..."
					actions={
						<Button
							startIcon={<AddIcon />}
							variant="contained"
							size="small"
							onClick={() => handleOpenDialog()}
							sx={{
								bgcolor: '#ec7211',
								'&:hover': { bgcolor: '#eb5f07' },
								textTransform: 'none',
								fontWeight: 700,
								boxShadow: 'none',
								height: '36px'
							}}
						>
							Add Activity Type
						</Button>
					}
				/>

				<TableContainer>
					<Table size="small">
						<TableHead sx={{ bgcolor: '#fafafa' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Code</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Name</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Description</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Order</TableCell>
								<TableCell sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Status</TableCell>
								<TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.875rem', borderBottom: '2px solid #d5dbdb' }}>Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{loading && activityTypes.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
										<CircularProgress size={24} />
									</TableCell>
								</TableRow>
							) : filteredActivityTypes.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} align="center" sx={{ py: 4 }}>
										<Typography variant="body2" color="text.secondary">
											{searchTerm ? 'No results found.' : 'No activity types found.'}
										</Typography>
									</TableCell>
								</TableRow>
							) : (
								filteredActivityTypes.map((type) => (
									<TableRow
										key={type.public_id}
										sx={{
											'&:hover': { bgcolor: '#f5f8fa' },
											'&:last-child td': { borderBottom: 0 }
										}}
									>
										<TableCell>
											<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>
												{type.code}
											</Typography>
										</TableCell>
										<TableCell sx={{ fontWeight: 500 }}>{type.name}</TableCell>
										<TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }}>
											{type.description || '-'}
										</TableCell>
										<TableCell>{type.sort_order}</TableCell>
										<TableCell>
											<Chip
												label={type.is_active ? 'Active' : 'Inactive'}
												size="small"
												color={type.is_active ? 'success' : 'default'}
												variant="outlined"
												sx={{ borderRadius: '4px', fontWeight: 700, fontSize: '0.7rem' }}
											/>
										</TableCell>
										<TableCell align="right">
											<IconButton size="small" onClick={() => handleOpenDialog(type)}>
												<EditIcon fontSize="small" />
											</IconButton>
											<IconButton size="small" onClick={() => handleDelete(type.public_id)} color="error">
												<DeleteIcon fontSize="small" />
											</IconButton>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Paper>

			<Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle sx={{ fontWeight: 700 }}>
					{editingType ? 'Edit Activity Type' : 'Add New Activity Type'}
				</DialogTitle>
				<DialogContent>
					{error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
						<TextField
							label="Name"
							fullWidth
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							placeholder="e.g. Meeting"
							required
						/>
						<TextField
							label="Code"
							fullWidth
							value={formData.code}
							onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
							placeholder="e.g. MEETING"
							helperText="Unique identifier for analytics. Will be converted to UPPER_CASE."
							required
							disabled={!!editingType}
						/>
						<TextField
							label="Description"
							fullWidth
							multiline
							rows={2}
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						/>
						<TextField
							label="Sort Order"
							type="number"
							fullWidth
							value={formData.sort_order}
							onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
						/>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2, px: 3 }}>
					<Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>Cancel</Button>
					<Button
						onClick={handleSave}
						variant="contained"
						startIcon={<SaveIcon />}
						disabled={loading}
						sx={{ bgcolor: '#ec7211', '&:hover': { bgcolor: '#eb5f07' } }}
					>
						{loading ? 'Saving...' : 'Save Type'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default DSRActivityTypeManagement;
