import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControlLabel,
	Typography,
	Box,
	Stack,
	Tabs,
	Tab,
	Radio,
	RadioGroup,
	FormControl,
	FormLabel,
	Autocomplete,
	Chip,
	IconButton,
	CircularProgress,
	Tooltip,
	Checkbox,
	FormGroup
} from '@mui/material';
import {
	CloudUpload as CloudUploadIcon,
	CheckCircle as CheckCircleIcon,
	RadioButtonUnchecked as UncheckedIcon,
	Close as CloseIcon,
	Description as FileIcon,
	Visibility as ViewIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../../../store/hooks';
import { uploadDocument } from '../../../store/slices/candidateSlice';
import { documentService } from '../../../services/candidateService';
import { settingsService } from '../../../services/settingsService';
import type { DynamicField } from '../../../services/settingsService';
import type { CandidateScreeningCreate } from '../../../models/candidate';

interface ScreeningFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (screening: CandidateScreeningCreate) => void;
	initialData?: any;
	candidateName?: string;
	candidatePublicId?: string;
	existingDocuments?: any[];
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`screening-form-tabpanel-${index}`}
			aria-labelledby={`screening-form-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3, pb: 2 }}>{children}</Box>}
		</div>
	);
}

const COMMON_SKILLS = [
	'Communication', 'MS Office', 'Data Entry', 'Basic Software Testing',
	'Python', 'Java', 'SQL', 'Customer Service', 'Problem Solving',
	'Teamwork', 'Time Management', 'Web Development', 'Hardware Networking'
];

const ScreeningFormDialog: React.FC<ScreeningFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	initialData,
	candidateName,
	candidatePublicId,
	existingDocuments
}) => {
	// theme removed as it was unused
	const dispatch = useAppDispatch();
	const [tabValue, setTabValue] = useState(0);
	const [uploading, setUploading] = useState<Record<string, boolean>>({});
	const [viewing, setViewing] = useState<Record<string, boolean>>({});
	// fileInputRefs removed as they were unused

	const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
	const [loadingFields, setLoadingFields] = useState(false);

	const [formData, setFormData] = useState<CandidateScreeningCreate>({
		previous_training: {
			attended_any_training: false,
			training_details: '',
			is_winvinaya_student: false
		},
		skills: {
			technical_skills: [],
			soft_skills: []
		},
		documents_upload: {
			resume: false,
			disability_certificate: false,
			degree_qualification: false,
			resume_filename: '',
			disability_certificate_filename: '',
			degree_qualification_filename: '',
			resume_id: null,
			disability_certificate_id: null,
			degree_qualification_id: null
		},
		others: {
			willing_for_training: true,
			ready_to_relocate: false,
			comments: ''
		}
	});

	useEffect(() => {
		if (open) {
			setTabValue(0);

			// Extract document info from existingDocuments if provided
			const docMap: Record<string, any> = {};
			if (existingDocuments) {
				existingDocuments.forEach(doc => {
					const typeKey = doc.document_type === 'degree_certificate' ? 'degree_qualification' : doc.document_type;
					docMap[typeKey] = {
						id: doc.id,
						name: doc.document_name
					};
				});
			}

			if (initialData) {
				setFormData({
					previous_training: {
						attended_any_training: initialData.previous_training?.attended_any_training ?? false,
						training_details: initialData.previous_training?.training_details ?? '',
						is_winvinaya_student: initialData.previous_training?.is_winvinaya_student ?? false
					},
					skills: {
						technical_skills: initialData.skills?.technical_skills ?? [],
						soft_skills: initialData.skills?.soft_skills ?? []
					},
					documents_upload: {
						resume: initialData.documents_upload?.resume || !!docMap.resume,
						disability_certificate: initialData.documents_upload?.disability_certificate || !!docMap.disability_certificate,
						degree_qualification: initialData.documents_upload?.degree_qualification || !!docMap.degree_qualification,
						resume_filename: initialData.documents_upload?.resume_filename || docMap.resume?.name || '',
						disability_certificate_filename: initialData.documents_upload?.disability_certificate_filename || docMap.disability_certificate?.name || '',
						degree_qualification_filename: initialData.documents_upload?.degree_qualification_filename || docMap.degree_qualification?.name || '',
						resume_id: initialData.documents_upload?.resume_id || docMap.resume?.id || null,
						disability_certificate_id: initialData.documents_upload?.disability_certificate_id || docMap.disability_certificate?.id || null,
						degree_qualification_id: initialData.documents_upload?.degree_qualification_id || docMap.degree_qualification?.id || null
					},
					others: {
						willing_for_training: true,
						ready_to_relocate: false,
						comments: '',
						...(initialData.others || {})
					}
				});
			} else {
				// No initial screening, but might have existing documents
				setFormData({
					previous_training: {
						attended_any_training: false,
						training_details: '',
						is_winvinaya_student: false
					},
					skills: {
						technical_skills: [],
						soft_skills: []
					},
					documents_upload: {
						resume: !!docMap.resume,
						disability_certificate: !!docMap.disability_certificate,
						degree_qualification: !!docMap.degree_qualification,
						resume_filename: docMap.resume?.name || '',
						disability_certificate_filename: docMap.disability_certificate?.name || '',
						degree_qualification_filename: docMap.degree_qualification?.name || '',
						resume_id: docMap.resume?.id || null,
						disability_certificate_id: docMap.disability_certificate?.id || null,
						degree_qualification_id: docMap.degree_qualification?.id || null
					},
					others: {
						willing_for_training: true,
						ready_to_relocate: false,
						comments: ''
					}
				});
			}

			// Load dynamic fields
			const loadDynamicFields = async () => {
				setLoadingFields(true);
				try {
					const fields = await settingsService.getFields('screening');
					setDynamicFields(fields);
				} catch (error) {
					console.error('Failed to load dynamic fields:', error);
				} finally {
					setLoadingFields(false);
				}
			};
			loadDynamicFields();
		}
	}, [initialData, open, existingDocuments]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleUpdateField = (section: keyof CandidateScreeningCreate, field: string, value: any) => {
		setFormData((prev: any) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value
			}
		}));
	};

	const handleUpdateOtherField = (name: string, value: any) => {
		setFormData((prev: any) => ({
			...prev,
			others: {
				...prev.others,
				[name]: value
			}
		}));
	};

	const handleFileUpload = async (type: string, file: File) => {
		if (!candidatePublicId) return;

		setUploading(prev => ({ ...prev, [type]: true }));
		try {
			const backendType = type === 'degree_qualification' ? 'degree_certificate' : type;
			const result: any = await dispatch(uploadDocument({
				publicId: candidatePublicId,
				documentType: backendType as any,
				file: file
			})).unwrap();

			setFormData((prev: any) => ({
				...prev,
				documents_upload: {
					...prev.documents_upload,
					[type]: true,
					[`${type}_filename`]: file.name,
					[`${type}_id`]: result.document.id
				}
			}));
		} catch (error) {
			console.error('Upload failed:', error);
		} finally {
			setUploading(prev => ({ ...prev, [type]: false }));
		}
	};

	const handleViewFile = async (type: string) => {
		const docId = formData.documents_upload?.[`${type}_id` as keyof Record<string, any>];
		if (!docId) return;

		setViewing(prev => ({ ...prev, [type]: true }));
		try {
			const blob = await documentService.download(docId);
			const url = URL.createObjectURL(blob);
			window.open(url, '_blank');
			// Optionally revoke URL after some time, but keeping it open for the tab
		} catch (error) {
			console.error('Failed to download file for preview:', error);
		} finally {
			setViewing(prev => ({ ...prev, [type]: false }));
		}
	};

	const handleSubmit = () => {
		onSubmit(formData);
		onClose();
	};

	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		mb: 2,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	const awsPanelStyle = {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		p: 3,
		bgcolor: '#ffffff'
	};

	const renderDynamicFields = () => {
		if (loadingFields) return <CircularProgress size={24} sx={{ my: 2 }} />;
		if (dynamicFields.length === 0) return null;

		return (
			<Box sx={{ mt: 3 }}>
				<Typography sx={sectionTitleStyle}>Additional Information</Typography>
				<Stack spacing={3}>
					{dynamicFields.map(field => (
						<Box key={field.id}>
							{field.field_type === 'text' && (
								<TextField
									label={field.label}
									fullWidth
									size="small"
									required={field.is_required}
									value={formData.others?.[field.name] || ''}
									onChange={(e) => handleUpdateOtherField(field.name, e.target.value)}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							)}
							{field.field_type === 'textarea' && (
								<TextField
									label={field.label}
									fullWidth
									multiline
									rows={3}
									required={field.is_required}
									value={formData.others?.[field.name] || ''}
									onChange={(e) => handleUpdateOtherField(field.name, e.target.value)}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							)}
							{field.field_type === 'number' && (
								<TextField
									label={field.label}
									fullWidth
									size="small"
									type="number"
									required={field.is_required}
									value={formData.others?.[field.name] || ''}
									onChange={(e) => handleUpdateOtherField(field.name, e.target.value)}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							)}
							{field.field_type === 'phone_number' && (
								<TextField
									label={field.label}
									fullWidth
									size="small"
									required={field.is_required}
									value={formData.others?.[field.name] || ''}
									onChange={(e) => handleUpdateOtherField(field.name, e.target.value)}
									sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
								/>
							)}
							{(field.field_type === 'single_choice') && (
								<FormControl component="fieldset" required={field.is_required}>
									<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500 }}>{field.label}</FormLabel>
									<RadioGroup
										row
										value={formData.others?.[field.name] || ''}
										onChange={(e) => handleUpdateOtherField(field.name, e.target.value)}
									>
										{field.options?.map(opt => (
											<FormControlLabel key={opt} value={opt} control={<Radio size="small" />} label={opt} />
										))}
									</RadioGroup>
								</FormControl>
							)}
							{field.field_type === 'multiple_choice' && (
								<FormControl component="fieldset" required={field.is_required}>
									<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500 }}>{field.label}</FormLabel>
									<FormGroup row>
										{field.options?.map(opt => (
											<FormControlLabel
												key={opt}
												control={
													<Checkbox
														size="small"
														checked={(formData.others?.[field.name] || []).includes(opt)}
														onChange={(e) => {
															const prev = formData.others?.[field.name] || [];
															const next = e.target.checked
																? [...prev, opt]
																: prev.filter((v: string) => v !== opt);
															handleUpdateOtherField(field.name, next);
														}}
													/>
												}
												label={opt}
											/>
										))}
									</FormGroup>
								</FormControl>
							)}
						</Box>
					))}
				</Stack>
			</Box>
		);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{ sx: { borderRadius: '2px', bgcolor: '#f2f3f3' } }}
		>
			<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700 }}>Candidate Screening</Typography>
					<Typography variant="caption" sx={{ color: '#aab7b8' }}>{candidateName || 'New Candidate'}</Typography>
				</Box>
				<IconButton onClick={onClose} size="small" sx={{ color: '#ffffff' }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 0 }}>
				<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: '#ffffff' }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						variant="fullWidth"
						sx={{
							'& .MuiTabs-indicator': { backgroundColor: '#ec7211', height: 3 },
							'& .MuiTab-root': {
								textTransform: 'none',
								fontWeight: 700,
								fontSize: '0.875rem',
								color: '#545b64',
								'&.Mui-selected': { color: '#ec7211' }
							}
						}}
					>
						<Tab label="1. Background & Training" />
						<Tab label="2. Skills" />
						<Tab label="3. Documents & Remarks" />
					</Tabs>
				</Box>

				<Box sx={{ p: 3 }}>
					{/* Tab 1: Background & Training */}
					<TabPanel value={tabValue} index={0}>
						<Box sx={awsPanelStyle}>
							<Typography sx={sectionTitleStyle}>Training Info</Typography>
							<Stack spacing={3}>
								<FormControl component="fieldset">
									<FormLabel sx={{ fontSize: '0.875rem', mb: 1 }}>Have you attended any training previously?</FormLabel>
									<RadioGroup
										row
										value={formData.previous_training?.attended_any_training ? 'yes' : 'no'}
										onChange={(e) => handleUpdateField('previous_training', 'attended_any_training', e.target.value === 'yes')}
									>
										<FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
										<FormControlLabel value="no" control={<Radio size="small" />} label="No" />
									</RadioGroup>
								</FormControl>

								{formData.previous_training?.attended_any_training && (
									<TextField
										label="Training Details"
										placeholder="Mention coarse name, institute, etc."
										fullWidth
										multiline
										rows={2}
										size="small"
										value={formData.previous_training?.training_details}
										onChange={(e) => handleUpdateField('previous_training', 'training_details', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								)}

								<FormControlLabel
									control={
										<Checkbox
											size="small"
											checked={formData.previous_training?.is_winvinaya_student}
											onChange={(e) => handleUpdateField('previous_training', 'is_winvinaya_student', e.target.checked)}
										/>
									}
									label={<Typography variant="body2">Are you a WinVinaya Student?</Typography>}
								/>
							</Stack>
						</Box>
					</TabPanel>

					{/* Tab 2: Skills */}
					<TabPanel value={tabValue} index={1}>
						<Box sx={awsPanelStyle}>
							<Typography sx={sectionTitleStyle}>Skill Assessment</Typography>
							<Stack spacing={4}>
								<Box>
									<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500, mb: 1, display: 'block' }}>Technical Skills</FormLabel>
									<Autocomplete
										multiple
										freeSolo
										options={COMMON_SKILLS}
										value={formData.skills?.technical_skills || []}
										onChange={(_e, newValue) => handleUpdateField('skills', 'technical_skills', newValue)}
										renderTags={(value, getTagProps) =>
											value.map((option, index) => (
												<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" sx={{ borderRadius: '2px' }} />
											))
										}
										renderInput={(params) => (
											<TextField {...params} placeholder="Add skills (e.g. Python, SQL)" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }} />
										)}
									/>
								</Box>

								<Box>
									<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500, mb: 1, display: 'block' }}>Soft Skills</FormLabel>
									<Autocomplete
										multiple
										freeSolo
										options={['Communication', 'Teamwork', 'Punctuality', 'Problem Solving']}
										value={formData.skills?.soft_skills || []}
										onChange={(_e, newValue) => handleUpdateField('skills', 'soft_skills', newValue)}
										renderTags={(value, getTagProps) =>
											value.map((option, index) => (
												<Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" sx={{ borderRadius: '2px' }} />
											))
										}
										renderInput={(params) => (
											<TextField {...params} placeholder="Add soft skills" size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }} />
										)}
									/>
								</Box>
							</Stack>
						</Box>
					</TabPanel>

					{/* Tab 3: Documents & Remarks */}
					<TabPanel value={tabValue} index={2}>
						<Stack spacing={3}>
							<Box sx={awsPanelStyle}>
								<Typography sx={sectionTitleStyle}>Document Verification</Typography>
								<Stack spacing={2}>
									{[
										{ label: 'Resume', key: 'resume' },
										{ label: 'Disability Certificate', key: 'disability_certificate' },
										{ label: 'Degree/Education Certificate', key: 'degree_qualification' }
									].map((doc) => (
										<Box key={doc.key} sx={{ borderBottom: '1px solid #eaeded', pb: 2, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
											<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
												<Typography variant="body2" sx={{ fontWeight: 500 }}>{doc.label}</Typography>
												{formData.documents_upload?.[doc.key as keyof Record<string, any>] ? (
													<Stack direction="row" spacing={1} alignItems="center">
														<Typography variant="caption" sx={{ color: '#1d8102', display: 'flex', alignItems: 'center' }}>
															<CheckCircleIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Verified
														</Typography>
														<Tooltip title="View Document">
															<IconButton size="small" onClick={() => handleViewFile(doc.key)} disabled={viewing[doc.key]}>
																{viewing[doc.key] ? <CircularProgress size={16} /> : <ViewIcon fontSize="small" />}
															</IconButton>
														</Tooltip>
													</Stack>
												) : (
													<Typography variant="caption" sx={{ color: '#d13212', display: 'flex', alignItems: 'center' }}>
														<UncheckedIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Pending
													</Typography>
												)}
											</Box>

											<Stack direction="row" spacing={2} alignItems="center">
												<Button
													component="label"
													variant="outlined"
													size="small"
													startIcon={uploading[doc.key] ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
													disabled={uploading[doc.key]}
													sx={{ textTransform: 'none', borderRadius: '2px', borderColor: '#d5dbdb', color: '#545b64' }}
												>
													{uploading[doc.key] ? 'Uploading...' : 'Upload File'}
													<input
														type="file"
														hidden
														onChange={(e) => {
															if (e.target.files?.[0]) handleFileUpload(doc.key, e.target.files[0]);
														}}
													/>
												</Button>
												{formData.documents_upload?.[`${doc.key}_filename` as keyof Record<string, any>] && (
													<Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
														<FileIcon fontSize="inherit" sx={{ mr: 0.5 }} />
														{formData.documents_upload[`${doc.key}_filename` as keyof Record<string, any>]}
													</Typography>
												)}
											</Stack>
										</Box>
									))}
								</Stack>
							</Box>

							{/* Dynamic Fields Section */}
							{renderDynamicFields()}

							<Box sx={awsPanelStyle}>
								<Typography sx={sectionTitleStyle}>Final Verdict</Typography>
								<Stack spacing={3}>
									<Stack direction="row" spacing={4}>
										<FormControl component="fieldset">
											<FormLabel sx={{ fontSize: '0.875rem', mb: 1 }}>Willing for Training?</FormLabel>
											<RadioGroup
												row
												value={formData.others?.willing_for_training ? 'yes' : 'no'}
												onChange={(e) => handleUpdateOtherField('willing_for_training', e.target.value === 'yes')}
											>
												<FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
												<FormControlLabel value="no" control={<Radio size="small" />} label="No" />
											</RadioGroup>
										</FormControl>

										<FormControl component="fieldset">
											<FormLabel sx={{ fontSize: '0.875rem', mb: 1 }}>Ready to Relocate?</FormLabel>
											<RadioGroup
												row
												value={formData.others?.ready_to_relocate ? 'yes' : 'no'}
												onChange={(e) => handleUpdateOtherField('ready_to_relocate', e.target.value === 'yes')}
											>
												<FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
												<FormControlLabel value="no" control={<Radio size="small" />} label="No" />
											</RadioGroup>
										</FormControl>
									</Stack>

									<TextField
										label="Screening Comments"
										placeholder="Add any additional observations..."
										fullWidth
										multiline
										rows={3}
										size="small"
										value={formData.others?.comments}
										onChange={(e) => handleUpdateOtherField('comments', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Stack>
							</Box>
						</Stack>
					</TabPanel>
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3, borderTop: '1px solid #d5dbdb', bgcolor: '#ffffff' }}>
				<Button onClick={onClose} sx={{ color: '#545b64', fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					sx={{
						bgcolor: '#ec7211',
						'&:hover': { bgcolor: '#eb5f07' },
						borderRadius: '2px',
						textTransform: 'none',
						fontWeight: 700,
						px: 4,
						boxShadow: 'none'
					}}
				>
					{initialData ? 'Update Screening' : 'Save Screening'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ScreeningFormDialog;
