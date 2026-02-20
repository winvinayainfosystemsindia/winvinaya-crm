import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Tabs,
	Tab,
	IconButton,
	Stack,
	CircularProgress
} from '@mui/material';
import {
	Close as CloseIcon,
	Person as PersonIcon,
	AssignmentInd as ScreenerIcon,
	Event as DateIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import useToast from '../../../hooks/useToast';
import { uploadDocument } from '../../../store/slices/candidateSlice';
import { fetchFields } from '../../../store/slices/settingsSlice';
import { documentService } from '../../../services/candidateService';
import type { CandidateScreeningCreate } from '../../../models/candidate';

// Tabs
import BackgroundTrainingTab from './tabs/BackgroundTrainingTab';
import SkillsTab from './tabs/SkillsTab';
import FamilyDetailsTab from './tabs/FamilyDetailsTab';
import DocumentsRemarksTab from './tabs/DocumentsRemarksTab';

interface ScreeningFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (screening: CandidateScreeningCreate) => void;
	initialData?: any;
	candidateName?: string;
	candidatePublicId?: string;
	candidateGuardianDetails?: any;
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
	candidateGuardianDetails,
	existingDocuments
}) => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const dynamicFields = useAppSelector(state => state.settings.fields.screening) || [];
	const loadingFields = useAppSelector(state => state.settings.loading);

	const currentUser = useAppSelector(state => state.auth.user);
	const selectedCandidate = useAppSelector(state => state.candidates.selectedCandidate);

	const [tabValue, setTabValue] = useState(0);
	const [uploading, setUploading] = useState<Record<string, boolean>>({});
	const [viewing, setViewing] = useState<Record<string, boolean>>({});

	const [formData, setFormData] = useState<CandidateScreeningCreate>({
		status: 'In Progress',
		previous_training: {
			attended_any_training: false,
			training_details: '',
			is_winvinaya_student: false
		},
		skills: {
			technical_skills: [],
			soft_skills: []
		},
		family_details: [],
		documents_upload: {
			resume: false,
			disability_certificate: false,
			degree_certificate: false,
			resume_filename: '',
			disability_certificate_filename: '',
			degree_certificate_filename: '',
			resume_id: null,
			disability_certificate_id: null,
			degree_certificate_id: null
		},
		others: {
			willing_for_training: true,
			ready_to_relocate: false,
			source_of_info: '',
			family_annual_income: '',
			comments: ''
		}
	});

	useEffect(() => {
		if (open) {
			setTabValue(0);
			dispatch(fetchFields('screening'));

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
					status: initialData.status || 'In Progress',
					previous_training: {
						attended_any_training: initialData.previous_training?.attended_any_training ?? false,
						training_details: initialData.previous_training?.training_details ?? '',
						is_winvinaya_student: initialData.previous_training?.is_winvinaya_student ?? false
					},
					skills: {
						technical_skills: initialData.skills?.technical_skills ?? [],
						soft_skills: initialData.skills?.soft_skills ?? []
					},
					family_details: initialData.family_details ?? [],
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
						source_of_info: '',
						family_annual_income: '',
						comments: '',
						...(initialData.others || {})
					}
				});
			} else {
				setFormData({
					status: 'In Progress',
					previous_training: {
						attended_any_training: false,
						training_details: '',
						is_winvinaya_student: false
					},
					skills: {
						technical_skills: [],
						soft_skills: []
					},
					family_details: candidateGuardianDetails ? [{
						name: candidateGuardianDetails.parent_name || '',
						phone: candidateGuardianDetails.parent_phone || '',
						relation: candidateGuardianDetails.relationship || '',
						occupation: '',
						company_name: '',
						position: ''
					}] : [],
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
						source_of_info: '',
						family_annual_income: '',
						comments: ''
					}
				});
			}
		}
	}, [initialData, open, existingDocuments, dispatch]);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const handleUpdateField = (section: string, field: string, value: any) => {
		if (section === 'root') {
			setFormData((prev: any) => ({
				...prev,
				[field]: value
			}));
			return;
		}
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

		// Validation: Format (PDF only)
		if (file.type !== 'application/pdf') {
			toast.error('Invalid file format. Please upload a PDF document.');
			return;
		}

		// Validation: Size (Max 10MB)
		const MAX_SIZE = 10 * 1024 * 1024; // 10MB
		if (file.size > MAX_SIZE) {
			toast.error('File size exceeds the 10MB limit.');
			return;
		}

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

			toast.success('Document uploaded successfully');
		} catch (error: any) {
			console.error('Upload failed:', error);
			toast.error(error || 'Failed to upload document. Please try again.');
		} finally {
			setUploading(prev => ({ ...prev, [type]: false }));
		}
	};

	const handleViewFile = async (type: string) => {
		const docId = (formData.documents_upload as any)?.[`${type}_id`];
		if (!docId) return;

		setViewing(prev => ({ ...prev, [type]: true }));
		try {
			const blob = await documentService.download(docId);
			const url = URL.createObjectURL(blob);
			window.open(url, '_blank');
		} catch (error) {
			console.error('Failed to download file for preview:', error);
		} finally {
			setViewing(prev => ({ ...prev, [type]: false }));
		}
	};

	const handleRemoveFile = (type: string) => {
		setFormData((prev: any) => ({
			...prev,
			documents_upload: {
				...prev.documents_upload,
				[type]: false,
				[`${type}_filename`]: '',
				[`${type}_id`]: null
			}
		}));
	};

	const handleSubmit = () => {
		onSubmit(formData);
		onClose();
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
				<Box sx={{ flex: 1 }}>
					<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
						Candidate Screening
					</Typography>
					<Stack direction="row" spacing={3} alignItems="center" sx={{ opacity: 0.85 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<PersonIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
								{candidateName || 'New Candidate'}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<ScreenerIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
								<Typography component="span" variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>
									{initialData ? 'Screened By:' : 'Screener:'}
								</Typography>
								{initialData?.screened_by?.full_name || currentUser?.full_name || currentUser?.username || '—'}
							</Typography>
						</Box>
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<DateIcon sx={{ fontSize: 16 }} />
							<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
								<Typography component="span" variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>Date:</Typography>
								{initialData?.updated_at
									? new Date(initialData.updated_at).toLocaleDateString()
									: new Date().toLocaleDateString()}
							</Typography>
						</Box>
					</Stack>
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
						<Tab label="2. Family Details" />
						<Tab label="3. Skills" />
						<Tab label="4. Documents & Remarks" />
					</Tabs>
				</Box>

				<Box sx={{ p: 3 }}>
					{loadingFields && tabValue === 2 ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress size={24} sx={{ color: '#ec7211' }} />
						</Box>
					) : (
						<>
							<TabPanel value={tabValue} index={0}>
								<BackgroundTrainingTab
									formData={formData}
									onUpdateField={handleUpdateField}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={1}>
								<FamilyDetailsTab
									formData={formData}
									onUpdateField={handleUpdateField}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={2}>
								<SkillsTab
									formData={formData}
									onUpdateField={handleUpdateField}
									commonSkills={COMMON_SKILLS}
								/>
							</TabPanel>

							<TabPanel value={tabValue} index={3}>
								<DocumentsRemarksTab
									formData={formData}
									onUpdateOtherField={handleUpdateOtherField}
									onUpdateStatus={(value) => setFormData(prev => ({ ...prev, status: value }))}
									onFileUpload={handleFileUpload}
									onViewFile={handleViewFile}
									onRemoveFile={handleRemoveFile}
									uploading={uploading}
									viewing={viewing}
									dynamicFields={dynamicFields}
									candidateIsDisabled={!!selectedCandidate?.disability_details?.is_disabled}
								/>
							</TabPanel>
						</>
					)}
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
