import React, { useState, useEffect, useRef } from 'react';
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
	Divider,
	Radio,
	RadioGroup,
	FormControl,
	FormLabel,
	Autocomplete,
	Chip,
	IconButton,
	Paper,
	CircularProgress,
	Tooltip
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
	const dispatch = useAppDispatch();
	const [tabValue, setTabValue] = useState(0);
	const [uploading, setUploading] = useState<Record<string, boolean>>({});
	const [viewing, setViewing] = useState<Record<string, boolean>>({});
	const fileInputRefs = {
		resume: useRef<HTMLInputElement>(null),
		disability_certificate: useRef<HTMLInputElement>(null),
		degree_qualification: useRef<HTMLInputElement>(null)
	};

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
			comments: '',
			willing_for_training: true,
			ready_to_relocate: false
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
						comments: initialData.others?.comments ?? '',
						willing_for_training: initialData.others?.willing_for_training ?? true,
						ready_to_relocate: initialData.others?.ready_to_relocate ?? false
					}
				});
			} else {
				// No initial screening, but might have existing documents
				setFormData(prev => ({
					...prev,
					documents_upload: {
						...prev.documents_upload,
						resume: !!docMap.resume,
						disability_certificate: !!docMap.disability_certificate,
						degree_qualification: !!docMap.degree_qualification,
						resume_filename: docMap.resume?.name || '',
						disability_certificate_filename: docMap.disability_certificate?.name || '',
						degree_qualification_filename: docMap.degree_qualification?.name || '',
						resume_id: docMap.resume?.id || null,
						disability_certificate_id: docMap.disability_certificate?.id || null,
						degree_qualification_id: docMap.degree_qualification?.id || null
					}
				}));
			}
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

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					border: '1px solid #d5dbdb'
				}
			}}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ fontSize: '1.25rem' }}>
							{initialData ? 'Edit Candidate Screening' : 'New Candidate Screening'}
						</Typography>
						{candidateName && (
							<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
								{candidateName}
							</Typography>
						)}
					</Box>
					<IconButton onClick={onClose} sx={{ color: '#ffffff' }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<DialogContent sx={{ p: 0, bgcolor: '#f2f3f3' }}>
				<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: '#ffffff' }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						variant="fullWidth"
						sx={{
							px: 2,
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
						<Tab label="1. Previous Training" />
						<Tab label="2. Skills Assessment" />
						<Tab label="3. Documents & Remarks" />
					</Tabs>
				</Box>

				<Box sx={{ px: 4, py: 2 }}>
					<TabPanel value={tabValue} index={0}>
						<Paper elevation={0} sx={awsPanelStyle}>
							<Typography sx={sectionTitleStyle}>Training Background</Typography>
							<Stack spacing={4}>
								<FormControl component="fieldset">
									<FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#16191f', mb: 1 }}>
										Has the candidate attended any previous training?
									</FormLabel>
									<RadioGroup
										row
										value={formData.previous_training?.attended_any_training ? 'yes' : 'no'}
										onChange={(e) => handleUpdateField('previous_training', 'attended_any_training', e.target.value === 'yes')}
									>
										<FormControlLabel value="yes" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>Yes</Typography>} />
										<FormControlLabel value="no" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>No</Typography>} />
									</RadioGroup>
								</FormControl>

								{formData.previous_training?.attended_any_training && (
									<TextField
										fullWidth
										label="Training Details"
										placeholder="Mention company or institute and course name"
										variant="outlined"
										size="small"
										multiline
										rows={2}
										value={formData.previous_training?.training_details || ''}
										onChange={(e) => handleUpdateField('previous_training', 'training_details', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								)}

								<FormControl component="fieldset">
									<FormLabel component="legend" sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#16191f', mb: 1 }}>
										Previous training at WinVinaya Foundation?
									</FormLabel>
									<RadioGroup
										row
										value={formData.previous_training?.is_winvinaya_student ? 'yes' : 'no'}
										onChange={(e) => handleUpdateField('previous_training', 'is_winvinaya_student', e.target.value === 'yes')}
									>
										<FormControlLabel value="yes" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>Yes</Typography>} />
										<FormControlLabel value="no" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>No</Typography>} />
									</RadioGroup>
								</FormControl>
							</Stack>
						</Paper>
					</TabPanel>

					<TabPanel value={tabValue} index={1}>
						<Paper elevation={0} sx={awsPanelStyle}>
							<Typography sx={sectionTitleStyle}>Skills Identified</Typography>
							<Stack spacing={4}>
								<Box>
									<FormLabel sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#16191f', mb: 1, display: 'block' }}>
										Technical Skills (Add from list or type new)
									</FormLabel>
									<Autocomplete
										multiple
										freeSolo
										options={COMMON_SKILLS}
										value={formData.skills?.technical_skills || []}
										onChange={(_e, newValue) => handleUpdateField('skills', 'technical_skills', newValue)}
										renderTags={(value: string[], getTagProps) =>
											value.map((option: string, index: number) => (
												<Chip
													label={option}
													{...getTagProps({ index })}
													sx={{ borderRadius: '2px', bgcolor: '#f2f3f3', fontWeight: 500 }}
													size="small"
												/>
											))
										}
										renderInput={(params) => (
											<TextField
												{...params}
												variant="outlined"
												size="small"
												placeholder="Select or type..."
												sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px', p: 1 } }}
											/>
										)}
									/>
								</Box>

								<Box>
									<FormLabel sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#16191f', mb: 1, display: 'block' }}>
										Soft Skills
									</FormLabel>
									<Autocomplete
										multiple
										freeSolo
										options={['Communication', 'English Speaking', 'Active Listening', 'Punctuality', 'Leadership']}
										value={formData.skills?.soft_skills || []}
										onChange={(_e, newValue) => handleUpdateField('skills', 'soft_skills', newValue)}
										renderTags={(value: string[], getTagProps) =>
											value.map((option: string, index: number) => (
												<Chip
													label={option}
													{...getTagProps({ index })}
													sx={{ borderRadius: '2px', bgcolor: '#f2f3f3', fontWeight: 500 }}
													size="small"
												/>
											))
										}
										renderInput={(params) => (
											<TextField
												{...params}
												variant="outlined"
												size="small"
												placeholder="Select or type..."
												sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px', p: 1 } }}
											/>
										)}
									/>
								</Box>
							</Stack>
						</Paper>
					</TabPanel>

					<TabPanel value={tabValue} index={2}>
						<Stack spacing={3}>
							<Paper elevation={0} sx={awsPanelStyle}>
								<Typography sx={sectionTitleStyle}>Document Collection</Typography>
								<Stack spacing={2}>
									{[
										{ id: 'resume', label: 'Resume / CV' },
										{ id: 'disability_certificate', label: 'Disability Certificate' },
										{ id: 'degree_qualification', label: 'Highest Degree Qualification' }
									].map((doc) => (
										<Box
											key={doc.id}
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												p: 2,
												border: '1px solid #eaeded',
												borderRadius: '2px',
												bgcolor: formData.documents_upload?.[doc.id] ? '#f1faff' : 'transparent',
												borderColor: formData.documents_upload?.[doc.id] ? '#0073bb' : '#eaeded'
											}}
										>
											<Stack direction="row" spacing={2} alignItems="center">
												{uploading[doc.id] ? (
													<CircularProgress size={20} sx={{ color: '#ec7211' }} />
												) : formData.documents_upload?.[doc.id] ? (
													<CheckCircleIcon sx={{ color: '#0073bb' }} />
												) : (
													<UncheckedIcon sx={{ color: '#879596' }} />
												)}
												<Box>
													<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
														{doc.label}
													</Typography>
													{formData.documents_upload?.[`${doc.id}_filename`] && (
														<Typography variant="caption" sx={{ color: '#0073bb', display: 'flex', alignItems: 'center', mt: 0.5 }}>
															<FileIcon sx={{ fontSize: 14, mr: 0.5 }} />
															{formData.documents_upload?.[`${doc.id}_filename`]}
														</Typography>
													)}
												</Box>
											</Stack>
											<input
												type="file"
												hidden
												ref={fileInputRefs[doc.id as keyof typeof fileInputRefs]}
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) handleFileUpload(doc.id, file);
												}}
											/>
											<Stack direction="row" spacing={1}>
												{formData.documents_upload?.[doc.id] && (
													<Tooltip title="Preview Document">
														<IconButton
															size="small"
															onClick={() => handleViewFile(doc.id)}
															disabled={viewing[doc.id]}
															sx={{ color: '#0073bb', border: '1px solid #d5dbdb', borderRadius: '2px' }}
														>
															{viewing[doc.id] ? <CircularProgress size={20} /> : <ViewIcon fontSize="small" />}
														</IconButton>
													</Tooltip>
												)}
												<Button
													size="small"
													variant="outlined"
													startIcon={<CloudUploadIcon />}
													disabled={uploading[doc.id]}
													onClick={() => fileInputRefs[doc.id as keyof typeof fileInputRefs].current?.click()}
													sx={{
														borderRadius: '2px',
														textTransform: 'none',
														borderColor: '#d5dbdb',
														color: '#16191f',
														'&:hover': { bgcolor: '#f2f3f3', borderColor: '#545b64' }
													}}
												>
													{formData.documents_upload?.[doc.id] ? 'Re-upload' : 'Upload'}
												</Button>
											</Stack>
										</Box>
									))}
								</Stack>
							</Paper>

							<Paper elevation={0} sx={awsPanelStyle}>
								<Typography sx={sectionTitleStyle}>Final Review & Remarks</Typography>
								<Stack spacing={3}>
									<Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
										<Box>
											<FormLabel sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1, display: 'block' }}>
												Willing for Training
											</FormLabel>
											<RadioGroup
												row
												value={formData.others?.willing_for_training ? 'yes' : 'no'}
												onChange={(e) => handleUpdateField('others', 'willing_for_training', e.target.value === 'yes')}
											>
												<FormControlLabel value="yes" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>Yes</Typography>} />
												<FormControlLabel value="no" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>No</Typography>} />
											</RadioGroup>
										</Box>
										<Box>
											<FormLabel sx={{ fontSize: '0.875rem', fontWeight: 500, mb: 1, display: 'block' }}>
												Ready to Relocate
											</FormLabel>
											<RadioGroup
												row
												value={formData.others?.ready_to_relocate ? 'yes' : 'no'}
												onChange={(e) => handleUpdateField('others', 'ready_to_relocate', e.target.value === 'yes')}
											>
												<FormControlLabel value="yes" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>Yes</Typography>} />
												<FormControlLabel value="no" control={<Radio size="small" sx={{ color: '#ec7211', '&.Mui-checked': { color: '#ec7211' } }} />} label={<Typography sx={{ fontSize: '0.875rem' }}>No</Typography>} />
											</RadioGroup>
										</Box>
									</Box>

									<TextField
										fullWidth
										label="Additional Comments (Optional)"
										multiline
										rows={4}
										variant="outlined"
										placeholder="Enter any additional observations..."
										value={formData.others?.comments || ''}
										onChange={(e) => handleUpdateField('others', 'comments', e.target.value)}
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Stack>
							</Paper>
						</Stack>
					</TabPanel>
				</Box>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#ffffff' }}>
				<Button
					onClick={onClose}
					variant="text"
					sx={{ color: '#16191f', fontWeight: 700, px: 3 }}
				>
					Cancel
				</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					sx={{
						bgcolor: '#ec7211',
						color: '#ffffff',
						px: 4,
						py: 1,
						fontWeight: 700,
						border: '1px solid #ec7211',
						'&:hover': { bgcolor: '#eb5f07', borderColor: '#eb5f07' }
					}}
				>
					{initialData ? 'Update Screening' : 'Save Screening'}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ScreeningFormDialog;
