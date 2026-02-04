import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	Stack,
	Box,
	Typography,
	FormControlLabel,
	Switch,
	Autocomplete,
	Chip,
	Divider,
	Button
} from '@mui/material';
import { settingsService, type DynamicField, type DynamicFieldCreate } from '../../../services/settingsService';
import { useSnackbar } from 'notistack';

interface FieldDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: () => void;
	editingField: DynamicField | null;
	entityType: 'screening' | 'counseling';
	nextOrder: number;
}

const FieldDialog: React.FC<FieldDialogProps> = ({
	open,
	onClose,
	onSave,
	editingField,
	entityType,
	nextOrder
}) => {
	const { enqueueSnackbar } = useSnackbar();
	const [optionInputValue, setOptionInputValue] = useState('');
	const [newField, setNewField] = useState<DynamicFieldCreate>({
		entity_type: entityType,
		name: '',
		label: '',
		field_type: 'text',
		options: [],
		is_required: false,
		order: nextOrder
	});

	const fieldTypes = ['text', 'textarea', 'number', 'single_choice', 'multiple_choice', 'phone_number'] as const;
	const fieldTypeLabels: Record<string, string> = {
		text: 'Short Text',
		textarea: 'Long Paragraph',
		number: 'Number/Numeric',
		single_choice: 'Drop-down Selection',
		multiple_choice: 'Multi-select Checkboxes',
		phone_number: 'Phone Number'
	};

	useEffect(() => {
		if (open) {
			if (editingField) {
				setNewField({
					entity_type: editingField.entity_type,
					name: editingField.name,
					label: editingField.label,
					field_type: editingField.field_type as any,
					options: editingField.options || [],
					is_required: editingField.is_required,
					order: editingField.order
				});
			} else {
				setNewField({
					entity_type: entityType,
					name: '',
					label: '',
					field_type: 'text',
					options: [],
					is_required: false,
					order: nextOrder
				});
			}
			setOptionInputValue('');
		}
	}, [open, editingField, entityType, nextOrder]);

	const handleSave = async () => {
		try {
			if (!newField.name || !newField.label) {
				enqueueSnackbar('Name and Label are required', { variant: 'warning' });
				return;
			}

			if (editingField) {
				await settingsService.updateField(editingField.id, newField);
				enqueueSnackbar('Field updated successfully', { variant: 'success' });
			} else {
				await settingsService.createField(newField);
				enqueueSnackbar('Field created successfully', { variant: 'success' });
			}
			onSave();
			onClose();
		} catch (error) {
			console.error('Failed to save field:', error);
			enqueueSnackbar('Failed to save field', { variant: 'error' });
		}
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{ sx: { borderRadius: '2px' } }}
		>
			<DialogTitle sx={{ fontWeight: 700, bgcolor: '#f2f3f3', borderBottom: '1px solid #d5dbdb' }}>
				{editingField ? 'Edit Field' : 'Create New Dynamic Field'}
			</DialogTitle>
			<DialogContent sx={{ mt: 2 }}>
				<Stack spacing={3} sx={{ pt: 1 }}>
					<TextField
						label="Question text / Field Label"
						fullWidth
						size="small"
						placeholder="e.g., Father's Name"
						value={newField.label}
						onChange={(e) => {
							const label = e.target.value;
							const name = label.toLowerCase()
								.replace(/[^a-z0-9\s]/g, '')
								.replace(/\s+/g, '_');
							setNewField({
								...newField,
								label: label,
								name: editingField ? newField.name : name
							});
						}}
						helperText="This is what the user will see in the form."
					/>

					<Box>
						<Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
							Data Key: <strong>{newField.name || '...'}</strong>
							{!editingField && " (Auto-generated from label. Used for database storage.)"}
						</Typography>
						{editingField && (
							<Typography variant="caption" color="info.main" sx={{ display: 'block', fontStyle: 'italic' }}>
								Internal key cannot be changed after creation to maintain data integrity.
							</Typography>
						)}
					</Box>

					<TextField
						select
						label="Field Type"
						fullWidth
						size="small"
						value={newField.field_type}
						onChange={(e) => setNewField({ ...newField, field_type: e.target.value as any })}
					>
						{fieldTypes.map((type) => (
							<MenuItem key={type} value={type}>
								{fieldTypeLabels[type]}
							</MenuItem>
						))}
					</TextField>

					{(newField.field_type === 'single_choice' || newField.field_type === 'multiple_choice') && (
						<Autocomplete
							multiple
							freeSolo
							options={[]}
							value={newField.options || []}
							inputValue={optionInputValue}
							onInputChange={(_e, newInputValue) => setOptionInputValue(newInputValue)}
							onChange={(_e, newValue) => setNewField({ ...newField, options: newValue as string[] })}
							renderTags={(value: string[], getTagProps) =>
								value.map((option: string, index: number) => (
									<Chip
										variant="outlined"
										label={option}
										{...getTagProps({ index })}
										size="small"
										sx={{ borderRadius: '2px' }}
									/>
								))
							}
							renderInput={(params) => (
								<TextField
									{...params}
									label="Options"
									placeholder="Type and press Enter or Comma"
									size="small"
									helperText="Press Enter or Comma after each option"
									onKeyDown={(e) => {
										if (e.key === ',') {
											e.preventDefault();
											const val = optionInputValue.trim();
											if (val && !newField.options?.includes(val)) {
												setNewField({
													...newField,
													options: [...(newField.options || []), val]
												});
												setOptionInputValue('');
											}
										}
									}}
								/>
							)}
						/>
					)}

					<FormControlLabel
						control={
							<Switch
								size="small"
								checked={newField.is_required}
								onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
							/>
						}
						label={<Typography variant="body2">Mark as Required</Typography>}
					/>

					<TextField
						label="Display Order"
						type="number"
						fullWidth
						size="small"
						value={newField.order}
						onChange={(e) => setNewField({ ...newField, order: parseInt(e.target.value) || 0 })}
					/>
				</Stack>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ p: 2, bgcolor: '#fafafa' }}>
				<Button onClick={onClose} sx={{ textTransform: 'none', color: '#545b64', fontWeight: 700 }}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={handleSave}
					sx={{
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						borderRadius: '2px',
						textTransform: 'none',
						fontWeight: 700,
						boxShadow: 'none',
						px: 3
					}}
				>
					{editingField ? 'Update Field' : 'Create Field'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default FieldDialog;
