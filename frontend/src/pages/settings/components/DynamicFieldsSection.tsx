import React, { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Button,
	Paper,
	Stack,
	CircularProgress,
	Chip,
	IconButton
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	DragIndicator as DragIcon
} from '@mui/icons-material';
import { settingsService, type DynamicField } from '../../../services/settingsService';
import { useSnackbar } from 'notistack';
import FieldDialog from './FieldDialog';

interface DynamicFieldsSectionProps {
	entityType: 'screening' | 'counseling';
}

const DynamicFieldsSection: React.FC<DynamicFieldsSectionProps> = ({ entityType }) => {
	const { enqueueSnackbar } = useSnackbar();
	const [fields, setFields] = useState<DynamicField[]>([]);
	const [loading, setLoading] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingField, setEditingField] = useState<DynamicField | null>(null);

	const fieldTypeLabels: Record<string, string> = {
		text: 'Short Text',
		textarea: 'Long Paragraph',
		number: 'Number/Numeric',
		single_choice: 'Drop-down Selection',
		multiple_choice: 'Multi-select Checkboxes',
		phone_number: 'Phone Number'
	};

	useEffect(() => {
		loadFields();
	}, [entityType]);

	const loadFields = async () => {
		setLoading(true);
		try {
			const data = await settingsService.getFields(entityType);
			setFields(data);
		} catch (error) {
			console.error('Failed to load fields:', error);
			enqueueSnackbar('Failed to load dynamic fields', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await settingsService.deleteField(id);
			enqueueSnackbar('Field deleted successfully', { variant: 'success' });
			loadFields();
		} catch (error) {
			enqueueSnackbar('Failed to delete field', { variant: 'error' });
		}
	};

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
				<Box>
					<Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
						Manage {entityType} Fields
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Custom fields added here will appear in the {entityType} forms.
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={() => {
						setEditingField(null);
						setDialogOpen(true);
					}}
					sx={{
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						borderRadius: '2px',
						textTransform: 'none',
						fontWeight: 700,
						boxShadow: 'none'
					}}
				>
					Add Field
				</Button>
			</Box>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={32} sx={{ color: '#ec7211' }} />
				</Box>
			) : (
				<Stack spacing={2}>
					{fields.length === 0 ? (
						<Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', borderStyle: 'dashed' }}>
							<Typography variant="body2" color="text.secondary">
								No dynamic fields configured for {entityType}.
							</Typography>
						</Paper>
					) : (
						fields.map((field) => (
							<Paper
								key={field.id}
								variant="outlined"
								sx={{
									p: 2,
									borderRadius: '2px',
									display: 'flex',
									alignItems: 'center',
									'&:hover': { borderColor: '#545b64' }
								}}
							>
								<DragIcon sx={{ color: '#d5dbdb', mr: 2 }} />
								<Box sx={{ flexGrow: 1 }}>
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										{field.label}
										{field.is_required && (
											<Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
										)}
									</Typography>
									<Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
										<Chip label={fieldTypeLabels[field.field_type] || field.field_type} size="small" variant="outlined" sx={{ borderRadius: '2px', height: 20, fontSize: '0.7rem' }} />
										<Typography variant="caption" color="text.secondary">
											Key: {field.name}
										</Typography>
									</Stack>
								</Box>
								<Stack direction="row" spacing={1}>
									<Button
										size="small"
										onClick={() => {
											setEditingField(field);
											setDialogOpen(true);
										}}
										sx={{ textTransform: 'none', color: '#0073bb', fontWeight: 700 }}
									>
										Edit
									</Button>
									<IconButton size="small" color="error" onClick={() => handleDelete(field.id)}>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Stack>
							</Paper>
						))
					)}
				</Stack>
			)}

			<FieldDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSave={loadFields}
				editingField={editingField}
				entityType={entityType}
				nextOrder={fields.length}
			/>
		</Box>
	);
};

export default DynamicFieldsSection;
