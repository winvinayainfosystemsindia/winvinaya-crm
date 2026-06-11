import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Stack,
	CircularProgress,
	TextField,
	Button,
	useTheme,
	TableRow,
	TableCell,
	Chip,
	Tooltip,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material';
import {
	Add as AddIcon,
	CheckCircle as VerifiedIcon,
	Cancel as UnverifiedIcon,
	Edit as EditIcon,
	Delete as DeleteIcon
} from '@mui/icons-material';
import ConfirmationDialog from '../common/dialogbox/ConfirmationDialog';
import { skillService, type Skill } from '../../services/skillService';
import { useSnackbar } from 'notistack';
import { DataTable, type ColumnDefinition } from '../common/table';

const COLUMNS: ColumnDefinition<Skill>[] = [
	{ id: 'name', label: 'Skill Name', sortable: true },
	{ id: 'is_verified', label: 'Verification Status', sortable: true },
	{ id: 'creator', label: 'Created By', sortable: false },
	{ id: 'id', label: 'ID', sortable: true, width: 100 },
	{ id: 'actions', label: 'Actions', sortable: false, align: 'right', width: 150 }
];

const SkillsSection: React.FC = () => {
	const theme = useTheme();
	const { enqueueSnackbar } = useSnackbar();
	const [skills, setSkills] = useState<Skill[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [newSkillName, setNewSkillName] = useState('');
	const [adding, setAdding] = useState(false);
	const [verifyingId, setVerifyingId] = useState<number | null>(null);

	// Client-side pagination and sorting
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [orderBy, setOrderBy] = useState<keyof Skill>('name');
	const [order, setOrder] = useState<'asc' | 'desc'>('asc');

	// Edit states
	const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
	const [editSkillName, setEditSkillName] = useState('');
	const [editLoading, setEditLoading] = useState(false);

	// Delete states
	const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	useEffect(() => {
		loadSkills();
		setPage(0);
	}, [searchQuery]);

	const loadSkills = async () => {
		setLoading(true);
		try {
			const data = await skillService.getSkills(searchQuery);
			setSkills(data);
		} catch (error) {
			enqueueSnackbar('Failed to load skills', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleAddSkill = async () => {
		if (!newSkillName.trim()) return;

		setAdding(true);
		try {
			await skillService.createSkill({ name: newSkillName.trim() });
			enqueueSnackbar('Skill added successfully', { variant: 'success' });
			setNewSkillName('');
			loadSkills();
		} catch (error: any) {
			const errMsg = error.response?.data?.detail || 'Failed to add skill';
			enqueueSnackbar(errMsg, { variant: 'error' });
			
			if (typeof errMsg === 'string') {
				const match = errMsg.match(/Did you mean '([^']+)'\?/);
				if (match && match[1]) {
					const suggested = match[1];
					setNewSkillName(suggested);
				}
			}
		} finally {
			setAdding(false);
		}
	};

	const handleVerifySkill = async (id: number) => {
		setVerifyingId(id);
		try {
			await skillService.verifySkill(id);
			enqueueSnackbar('Skill verified successfully', { variant: 'success' });
			loadSkills();
		} catch (error) {
			enqueueSnackbar('Failed to verify skill', { variant: 'error' });
		} finally {
			setVerifyingId(null);
		}
	};

	const handleOpenEdit = (skill: Skill) => {
		setEditingSkill(skill);
		setEditSkillName(skill.name);
	};

	const handleCloseEdit = () => {
		setEditingSkill(null);
		setEditSkillName('');
		setEditLoading(false);
	};

	const handleSaveEdit = async () => {
		if (!editingSkill || !editSkillName.trim()) return;
		if (editSkillName.trim() === editingSkill.name) {
			handleCloseEdit();
			return;
		}

		setEditLoading(true);
		try {
			await skillService.updateSkill(editingSkill.id, { name: editSkillName.trim() });
			enqueueSnackbar('Skill updated successfully', { variant: 'success' });
			handleCloseEdit();
			loadSkills();
		} catch (error: any) {
			const errMsg = error.response?.data?.detail || 'Failed to update skill';
			enqueueSnackbar(errMsg, { variant: 'error' });
			
			if (typeof errMsg === 'string') {
				const match = errMsg.match(/Did you mean '([^']+)'\?/);
				if (match && match[1]) {
					const suggested = match[1];
					setEditSkillName(suggested);
				}
			}
		} finally {
			setEditLoading(false);
		}
	};

	const handleOpenDelete = (skill: Skill) => {
		setDeletingSkill(skill);
	};

	const handleCloseDelete = () => {
		setDeletingSkill(null);
		setDeleteLoading(false);
	};

	const handleConfirmDelete = async () => {
		if (!deletingSkill) return;

		setDeleteLoading(true);
		try {
			await skillService.deleteSkill(deletingSkill.id);
			enqueueSnackbar('Skill deleted successfully', { variant: 'success' });
			handleCloseDelete();
			loadSkills();
		} catch (error: any) {
			enqueueSnackbar(error.response?.data?.detail || 'Failed to delete skill', { variant: 'error' });
		} finally {
			setDeleteLoading(false);
		}
	};

	const sortedSkills = [...skills].sort((a, b) => {
		let valA: any = a[orderBy];
		let valB: any = b[orderBy];

		if (orderBy === 'is_verified') {
			valA = a.is_verified ? 1 : 0;
			valB = b.is_verified ? 1 : 0;
		}

		if (valA === undefined || valA === null) return order === 'asc' ? 1 : -1;
		if (valB === undefined || valB === null) return order === 'asc' ? -1 : 1;

		if (typeof valA === 'string') {
			return order === 'asc' 
				? valA.localeCompare(valB) 
				: valB.localeCompare(valA);
		} else {
			return order === 'asc' 
				? valA - valB 
				: valB - valA;
		}
	});

	const paginatedSkills = sortedSkills.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

	const addSkillAction = (
		<Stack direction="row" spacing={1} sx={{ minWidth: { sm: '350px' } }}>
			<TextField
				size="small"
				placeholder="New skill name..."
				value={newSkillName}
				onChange={(e) => setNewSkillName(e.target.value)}
				onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
				InputProps={{
					sx: { bgcolor: theme.palette.background.paper, borderRadius: '6px' }
				}}
			/>
			<Button
				variant="contained"
				disableElevation
				startIcon={adding ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
				onClick={handleAddSkill}
				disabled={adding || !newSkillName.trim()}
				sx={{
					bgcolor: theme.palette.primary.main,
					borderRadius: '6px',
					textTransform: 'none',
					fontWeight: 600,
					px: 3,
					color: 'white',
					'&:hover': { bgcolor: theme.palette.primary.dark }
				}}
			>
				Add
			</Button>
		</Stack>
	);

	const renderRow = (skill: Skill) => (
		<TableRow
			key={skill.id}
			sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
		>
			<TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
				{skill.name}
			</TableCell>
			<TableCell>
				{skill.is_verified ? (
					<Chip
						icon={<VerifiedIcon sx={{ fontSize: '1rem !important' }} />}
						label="Verified"
						size="small"
						sx={{
							bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
							color: theme.palette.success.main,
							fontWeight: 600,
							border: `1px solid ${theme.palette.success.main}`
						}}
					/>
				) : (
					<Chip
						icon={<UnverifiedIcon sx={{ fontSize: '1rem !important' }} />}
						label="Pending"
						size="small"
						sx={{
							bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
							color: theme.palette.error.main,
							fontWeight: 600,
							border: `1px solid ${theme.palette.error.main}`
						}}
					/>
				)}
			</TableCell>
			<TableCell>
				{skill.creator ? (
					<Chip
						label={skill.creator.full_name || skill.creator.username}
						size="small"
						variant="outlined"
						sx={{
							borderRadius: '6px',
							fontWeight: 500,
							fontSize: '0.75rem',
							borderColor: theme.palette.divider,
							color: theme.palette.text.primary,
							bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
						}}
					/>
				) : (
					<Chip
						label="System"
						size="small"
						variant="outlined"
						sx={{
							borderRadius: '6px',
							fontWeight: 500,
							fontSize: '0.75rem',
							borderStyle: 'dashed',
							borderColor: theme.palette.text.disabled,
							color: theme.palette.text.secondary,
							bgcolor: 'transparent'
						}}
					/>
				)}
			</TableCell>
			<TableCell>
				<Typography variant="caption" sx={{ color: theme.palette.text.disabled, fontFamily: 'monospace' }}>
					#{skill.id}
				</Typography>
			</TableCell>
			<TableCell align="right">
				<Stack direction="row" spacing={1} justifyContent="flex-end">
					{!skill.is_verified && (
						<Tooltip title="Verify Skill">
							<IconButton 
								size="small" 
								onClick={() => handleVerifySkill(skill.id)}
								disabled={verifyingId === skill.id}
								sx={{ 
									color: theme.palette.success.main,
									'&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5' }
								}}
							>
								{verifyingId === skill.id ? (
									<CircularProgress size={20} color="inherit" />
								) : (
									<VerifiedIcon fontSize="small" />
								)}
							</IconButton>
						</Tooltip>
					)}
					<Tooltip title="Edit Skill">
						<IconButton
							size="small"
							onClick={() => handleOpenEdit(skill)}
							sx={{
								color: theme.palette.primary.main,
								'&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff' }
							}}
						>
							<EditIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Delete Skill">
						<IconButton
							size="small"
							onClick={() => handleOpenDelete(skill)}
							sx={{
								color: theme.palette.error.main,
								'&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }
							}}
						>
							<DeleteIcon fontSize="small" />
						</IconButton>
					</Tooltip>
				</Stack>
			</TableCell>
		</TableRow>
	);

	return (
		<Box>
			{/* Header */}
			<Box sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'flex-start',
				mb: 4,
				pb: 3,
				borderBottom: `1px solid ${theme.palette.divider}`
			}}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
						Skills Master Data
					</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
						Manage the standardized list of skills available across the CRM.
					</Typography>
				</Box>
			</Box>

			<Stack spacing={4}>
				<DataTable<Skill>
					columns={COLUMNS}
					data={paginatedSkills}
					totalCount={skills.length}
					loading={loading}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={(_, p) => setPage(p)}
					onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
					orderBy={orderBy}
					order={order}
					onSortRequest={(p) => {
						const isAsc = orderBy === p && order === 'asc';
						setOrder(isAsc ? 'desc' : 'asc');
						setOrderBy(p);
						setPage(0);
					}}
					searchTerm={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Search skills..."
					onRefresh={loadSkills}
					headerActions={addSkillAction}
					emptyMessage={searchQuery ? `No skills found matching "${searchQuery}"` : 'No skills found in the database.'}
					renderRow={renderRow}
				/>

				<Box sx={{ p: 3, bgcolor: theme.palette.action.hover, border: `1px solid ${theme.palette.divider}`, borderRadius: '8px' }}>
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
						Skill Management Policy
					</Typography>
					<Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
						Master skills are used for standardized searching and filtering in candidate profiles and job mappings. Adding verified skills here ensures high-quality data across all modules.
					</Typography>
				</Box>
			</Stack>

			{/* Edit Dialog */}
			<Dialog 
				open={!!editingSkill} 
				onClose={handleCloseEdit}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					sx: { borderRadius: '8px' }
				}}
			>
				<DialogTitle sx={{ fontWeight: 700 }}>Edit Skill Name</DialogTitle>
				<DialogContent>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Modify the master skill name. This will run a semantic duplicate check to ensure consistency.
					</Typography>
					<TextField
						autoFocus
						margin="dense"
						label="Skill Name"
						type="text"
						fullWidth
						variant="outlined"
						value={editSkillName}
						onChange={(e) => setEditSkillName(e.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
						disabled={editLoading}
					/>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={handleCloseEdit} disabled={editLoading} sx={{ textTransform: 'none', fontWeight: 600 }}>
						Cancel
					</Button>
					<Button 
						onClick={handleSaveEdit} 
						disabled={editLoading || !editSkillName.trim()}
						variant="contained"
						sx={{ textTransform: 'none', fontWeight: 600 }}
					>
						{editLoading ? <CircularProgress size={20} color="inherit" /> : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			{deletingSkill && (
				<ConfirmationDialog
					open={!!deletingSkill}
					onClose={handleCloseDelete}
					onConfirm={handleConfirmDelete}
					title="Delete Master Skill"
					severity="error"
					loading={deleteLoading}
					confirmLabel="Delete"
					message={`Are you sure you want to delete the skill "${deletingSkill.name}"?`}
				>
					<Typography variant="body2" color="text.secondary" align="center">
						This will perform a soft delete. Historical candidate records referencing this skill will remain intact, but it will no longer be available for selection in future counseling or screening forms.
					</Typography>
				</ConfirmationDialog>
			)}
		</Box>
	);
};

export default SkillsSection;
