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
			<Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
					Manage Activity Taxonomy
				</Typography>
				<Button
					startIcon={<AddIcon />}
					variant="contained"
					size="small"
					onClick={() => handleOpenDialog()}
					sx={{ bgcolor: '#ec7211', '&:hover': { bgcolor: '#eb5f07' } }}
				>
					Add Activity Type
				</Button>
			</Box>

			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
				<Table size="small">
					<TableHead sx={{ bgcolor: '#f9fafb' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Order</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading && activityTypes.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
									<CircularProgress size={24} />
								</TableCell>
							</TableRow>
						) : activityTypes.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 3 }}>
									<Typography variant="body2" color="text.secondary">No activity types found.</Typography>
								</TableCell>
							</TableRow>
						) : (
							activityTypes.map((type) => (
								<TableRow key={type.public_id}>
									<TableCell>
										<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>
											{type.code}
										</Typography>
									</TableCell>
									<TableCell>{type.name}</TableCell>
									<TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{type.description || '-'}
									</TableCell>
									<TableCell>{type.sort_order}</TableCell>
									<TableCell>
										<Chip
											label={type.is_active ? 'Active' : 'Inactive'}
											size="small"
											color={type.is_active ? 'success' : 'default'}
											variant="outlined"
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
