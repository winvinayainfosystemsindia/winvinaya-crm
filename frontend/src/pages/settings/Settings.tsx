import React, { useState, useEffect } from 'react';
import {
	Container,
	Typography,
	Box,
	Paper,
	Tabs,
	Tab,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	MenuItem,
	FormControlLabel,
	Switch,
	Stack,
	CircularProgress,
	Chip,
	IconButton,
	Divider,
	Autocomplete
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Settings as SettingsIcon,
	DragIndicator as DragIcon,
	SmartToy as RobotIcon
} from '@mui/icons-material';
import { settingsService } from '../../services/settingsService';
import type { DynamicField, DynamicFieldCreate, SystemSetting } from '../../services/settingsService';
import { chatService } from '../../services/chatService';
import { useSnackbar } from 'notistack';
import {
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
	CheckCircle as CheckCircleIcon
} from '@mui/icons-material';


const Settings: React.FC = () => {
	const { enqueueSnackbar } = useSnackbar();
	const [tabValue, setTabValue] = useState(() => {
		const saved = localStorage.getItem('settings_current_tab');
		return saved ? parseInt(saved, 10) : 0;
	});
	const [showSecrets, setShowSecrets] = useState<Record<number, boolean>>({});
	const [fields, setFields] = useState<DynamicField[]>([]);
	const [loading, setLoading] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingField, setEditingField] = useState<DynamicField | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [fieldToDelete, setFieldToDelete] = useState<DynamicField | null>(null);
	const [optionInputValue, setOptionInputValue] = useState('');
	const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
	const [savingSettings, setSavingSettings] = useState(false);
	const [testingConnection, setTestingConnection] = useState(false);

	const [newField, setNewField] = useState<DynamicFieldCreate>({
		entity_type: 'screening',
		name: '',
		label: '',
		field_type: 'text',
		options: [],
		is_required: false,
		order: 0
	});

	const entityTypes = ['screening', 'counseling'] as const;
	const fieldTypes = ['text', 'textarea', 'number', 'single_choice', 'multiple_choice', 'phone_number'] as const;

	const fieldTypeLabels: Record<typeof fieldTypes[number], string> = {
		text: 'Short Text',
		textarea: 'Long Paragraph',
		number: 'Number/Numeric',
		single_choice: 'Drop-down Selection',
		multiple_choice: 'Multi-select Checkboxes',
		phone_number: 'Phone Number'
	};

	useEffect(() => {
		localStorage.setItem('settings_current_tab', tabValue.toString());
		if (tabValue < 2) {
			loadFields();
		} else {
			loadSystemSettings();
		}
	}, [tabValue]);

	const loadSystemSettings = async () => {
		setLoading(true);
		try {
			const data = await settingsService.getSystemSettings();
			setSystemSettings(data);
		} catch (error) {
			console.error('Failed to load system settings:', error);
			enqueueSnackbar('Failed to load system settings', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const loadFields = async () => {
		setLoading(true);
		try {
			const entityType = entityTypes[tabValue];
			const data = await settingsService.getFields(entityType);
			setFields(data);
		} catch (error) {
			console.error('Failed to load fields:', error);
			enqueueSnackbar('Failed to load dynamic fields', { variant: 'error' });
		} finally {
			setLoading(false);
		}
	};

	const handleOpenDialog = (field?: DynamicField) => {
		if (field) {
			setEditingField(field);
			setNewField({
				entity_type: field.entity_type,
				name: field.name,
				label: field.label,
				field_type: field.field_type,
				options: field.options || [],
				is_required: field.is_required,
				order: field.order
			});
		} else {
			setEditingField(null);
			setNewField({
				entity_type: entityTypes[tabValue],
				name: '',
				label: '',
				field_type: 'text',
				options: [],
				is_required: false,
				order: fields.length
			});
		}
		setOptionInputValue('');
		setDialogOpen(true);
	};

	const handleSaveField = async () => {
		try {
			// Validation
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
			setDialogOpen(false);
			loadFields();
		} catch (error) {
			console.error('Failed to save field:', error);
			enqueueSnackbar('Failed to save field', { variant: 'error' });
		}
	};

	const handleDeleteClick = (field: DynamicField) => {
		setFieldToDelete(field);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!fieldToDelete) return;

		try {
			await settingsService.deleteField(fieldToDelete.id);
			enqueueSnackbar('Field deleted successfully', { variant: 'success' });
			await loadFields();
		} catch (error) {
			console.error('Failed to delete field:', error);
			enqueueSnackbar('Failed to delete field', { variant: 'error' });
		} finally {
			setDeleteConfirmOpen(false);
			setFieldToDelete(null);
		}
	};

	const handleSaveSystemSetting = async (id: number, value: string) => {
		const trimmedValue = value.trim();
		if (trimmedValue === '********') return; // Don't save mask

		try {
			await settingsService.updateSystemSetting(id, { value: trimmedValue });
		} catch (error) {
			enqueueSnackbar('Failed to update setting', { variant: 'error' });
		}
	};

	const handleBulkSaveSystemSettings = async () => {
		setSavingSettings(true);
		try {
			// Save all settings that aren't masked secrets
			const savePromises = systemSettings
				.filter(s => !(s.is_secret && s.value === '********'))
				.map(s => settingsService.updateSystemSetting(s.id, { value: s.value.trim() }));

			await Promise.all(savePromises);
			enqueueSnackbar('All AI settings saved successfully', { variant: 'success' });
		} catch (error) {
			console.error('Failed to save some settings:', error);
			enqueueSnackbar('Failed to save some settings', { variant: 'error' });
		} finally {
			setSavingSettings(false);
		}
	};

	const handleTestConnection = async () => {
		setTestingConnection(true);
		try {
			const result = await chatService.testConnection();
			if (result.status === 'success') {
				enqueueSnackbar(result.message, { variant: 'success' });
			} else {
				enqueueSnackbar(result.message, { variant: 'error' });
			}
		} catch (error) {
			enqueueSnackbar('Failed to test connection. Please ensure all settings are saved.', { variant: 'error' });
		} finally {
			setTestingConnection(false);
		}
	};

	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	const awsPanelStyle = {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		bgcolor: '#ffffff',
		overflow: 'hidden'
	};

	return (
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
				<SettingsIcon sx={{ mr: 2, color: '#ec7211' }} />
				<Typography variant="h5" sx={{ fontWeight: 700, color: '#232f3e' }}>
					Application Settings
				</Typography>
			</Box>

			<Paper elevation={0} sx={awsPanelStyle}>
				<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: '#f2f3f3' }}>
					<Tabs
						value={tabValue}
						onChange={(_e, val) => setTabValue(val)}
						sx={{
							px: 2,
							height: 48,
							'& .MuiTabs-indicator': { backgroundColor: '#ec7211', height: 3 },
							'& .MuiTab-root': {
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.875rem',
								color: '#545b64',
								minHeight: 48,
								'&.Mui-selected': { color: '#ec7211' }
							}
						}}
					>
						<Tab label="Screening Dynamic Fields" />
						<Tab label="Counseling Dynamic Fields" />
						<Tab label="AI Configuration" icon={<RobotIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
					</Tabs>
				</Box>

				<Box sx={{ p: 4 }}>
					{tabValue < 2 ? (
						<>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
								<Box>
									<Typography sx={sectionTitleStyle}>
										Manage {entityTypes[tabValue]} Fields
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Custom fields added here will appear in the {entityTypes[tabValue]} forms.
									</Typography>
								</Box>
								<Button
									variant="contained"
									startIcon={<AddIcon />}
									onClick={() => handleOpenDialog()}
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
												No dynamic fields configured for {entityTypes[tabValue]}.
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
														<Chip label={fieldTypeLabels[field.field_type as typeof fieldTypes[number]] || field.field_type} size="small" variant="outlined" sx={{ borderRadius: '2px', height: 20, fontSize: '0.7rem' }} />
														<Typography variant="caption" color="text.secondary">
															Key: {field.name}
														</Typography>
													</Stack>
												</Box>
												<Stack direction="row" spacing={1}>
													<Button
														size="small"
														onClick={() => handleOpenDialog(field)}
														sx={{ textTransform: 'none', color: '#0073bb', fontWeight: 700 }}
													>
														Edit
													</Button>
													<IconButton size="small" color="error" onClick={() => handleDeleteClick(field)}>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Stack>
											</Paper>
										))
									)}
								</Stack>
							)}
						</>
					) : (
						<Box>
							<Box sx={{ mb: 4 }}>
								<Typography sx={sectionTitleStyle}>
									AI Chatbot Configuration
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Configure the backend AI features. Settings saved here impact all users.
								</Typography>
							</Box>

							{loading ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
									<CircularProgress size={32} sx={{ color: '#ec7211' }} />
								</Box>
							) : (
								<Stack spacing={4}>
									{systemSettings
										.filter(s => s.key !== 'ai_provider') // Filter out adaptive provider key
										.length === 0 ? (
										<Typography variant="body2" color="text.secondary">
											No system settings found. Ensure migrations are applied.
										</Typography>
									) : (
										systemSettings
											.filter(s => s.key !== 'ai_provider')
											.map((setting) => (
												<Box key={setting.id}>
													<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
														{setting.description || setting.key.replace(/_/g, ' ').toUpperCase()}
													</Typography>
													{setting.key === 'ai_enabled' ? (
														<FormControlLabel
															control={
																<Switch
																	checked={setting.value === 'true'}
																	onChange={(e) => {
																		const val = e.target.checked ? 'true' : 'false';
																		setSystemSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
																		handleSaveSystemSetting(setting.id, val);
																	}}
																/>
															}
															label={setting.value === 'true' ? "Enabled" : "Disabled"}
														/>
													) : (
														<TextField
															fullWidth
															size="small"
															type={setting.is_secret ? (showSecrets[setting.id] ? "text" : "password") : "text"}
															value={setting.value}
															onChange={(e) => {
																const val = e.target.value;
																setSystemSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: val } : s));
															}}
															onBlur={(e) => handleSaveSystemSetting(setting.id, e.target.value)}
															placeholder={setting.is_secret ? "••••••••••••••••" : `Enter ${setting.key}`}
															sx={{ maxWidth: 600 }}
															InputProps={{
																endAdornment: setting.is_secret ? (
																	<Stack direction="row" spacing={1} alignItems="center">
																		{setting.value === '********' && (
																			<CheckCircleIcon color="success" sx={{ fontSize: 18, mr: 0.5 }} />
																		)}
																		<IconButton
																			size="small"
																			onClick={() => setShowSecrets(prev => ({ ...prev, [setting.id]: !prev[setting.id] }))}
																		>
																			{showSecrets[setting.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
																		</IconButton>
																	</Stack>
																) : null
															}}
															helperText={setting.is_secret && (setting.value === '********' ? "Configuration is securely saved." : "Editing key...")}
														/>
													)}
												</Box>
											))
									)}
									<Box sx={{ pt: 2, display: 'flex', gap: 2 }}>
										<Button
											variant="contained"
											onClick={handleBulkSaveSystemSettings}
											disabled={savingSettings}
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
											{savingSettings ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Save AI Configuration'}
										</Button>

										<Button
											variant="outlined"
											onClick={handleTestConnection}
											disabled={testingConnection}
											sx={{
												borderColor: '#545b64',
												color: '#232f3e',
												'&:hover': { borderColor: '#232f3e', bgcolor: '#f2f3f3' },
												borderRadius: '2px',
												textTransform: 'none',
												fontWeight: 700,
												px: 3
											}}
										>
											{testingConnection ? <CircularProgress size={20} /> : 'Test AI Connection'}
										</Button>
									</Box>
								</Stack>
							)}
						</Box>
					)}
				</Box>
			</Paper>

			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: '2px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700, bgcolor: '#f2f3f3', borderBottom: '1px solid #d5dbdb' }}>
					{editingField ? 'Edit Field' : 'Create New Dynamic Field'}
				</DialogTitle>
				<DialogContent sx={{ mt: 2 }}>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<Box>
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
						</Box>

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
							onChange={(e) => setNewField({ ...newField, field_type: e.target.value as typeof fieldTypes[number] })}
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
								onInputChange={(_e, newInputValue) => {
									setOptionInputValue(newInputValue);
								}}
								onChange={(_e, newValue) => {
									setNewField({ ...newField, options: newValue as string[] });
								}}
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
					<Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#545b64', fontWeight: 700 }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleSaveField}
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

			{/* Custom Delete Confirmation Dialog */}
			<Dialog
				open={deleteConfirmOpen}
				onClose={() => setDeleteConfirmOpen(false)}
				PaperProps={{ sx: { borderRadius: '2px', maxWidth: '400px' } }}
			>
				<DialogTitle sx={{ fontWeight: 700, bgcolor: '#f2f3f3', borderBottom: '1px solid #d5dbdb', py: 2 }}>
					Delete Dynamic Field?
				</DialogTitle>
				<DialogContent sx={{ mt: 3 }}>
					<Typography variant="body2" color="text.primary" sx={{ mb: 2, fontWeight: 500 }}>
						Are you sure you want to delete the field "<strong>{fieldToDelete?.label}</strong>"?
					</Typography>
					<Typography variant="caption" color="text.secondary" sx={{ display: 'block', bgcolor: '#fff4f4', p: 1.5, borderLeft: '4px solid #d13212' }}>
						<strong>Warning:</strong> While existing data in the database will remain, this field will no longer be visible or editable in any forms.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eaeded' }}>
					<Button onClick={() => setDeleteConfirmOpen(false)} sx={{ textTransform: 'none', color: '#545b64', fontWeight: 700 }}>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleConfirmDelete}
						sx={{
							bgcolor: '#d13212',
							'&:hover': { bgcolor: '#af290f' },
							borderRadius: '2px',
							textTransform: 'none',
							fontWeight: 700,
							boxShadow: 'none',
							px: 3
						}}
					>
						Delete Field
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default Settings;
