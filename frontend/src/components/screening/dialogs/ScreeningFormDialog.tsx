import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	Box,
	CircularProgress
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import useToast from '../../../hooks/useToast';
import { uploadDocument, downloadDocument } from '../../../store/slices/candidateSlice';
import { fetchFields } from '../../../store/slices/settingsSlice';
import EnterpriseForm, { type FormStep } from '../../common/form/EnterpriseForm';
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
			source_of_info: '',
			family_annual_income: '',
			comments: ''
		}
	});

	useEffect(() => {
		if (open) {
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
	}, [initialData, open, existingDocuments, dispatch, candidateGuardianDetails]);

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
			const blob = await dispatch(downloadDocument({ documentId: docId })).unwrap();
			const url = URL.createObjectURL(blob as any);
			window.open(url, '_blank');
		} catch (error: any) {
			toast.error(error || 'Failed to download file for preview');
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

	const steps: FormStep[] = useMemo(() => [
		{
			label: 'Background & Training',
			content: (
				<BackgroundTrainingTab
					formData={formData}
					onUpdateField={handleUpdateField}
				/>
			)
		},
		{
			label: 'Family Details',
			content: (
				<FamilyDetailsTab
					formData={formData}
					onUpdateField={handleUpdateField}
				/>
			)
		},
		{
			label: 'Skills',
			content: (
				<SkillsTab
					formData={formData}
					onUpdateField={handleUpdateField}
				/>
			)
		},
		{
			label: 'Documents & Remarks',
			content: (
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
			)
		}
	], [formData, uploading, viewing, dynamicFields, selectedCandidate]);

	const screenerName = initialData?.screened_by?.full_name || currentUser?.full_name || currentUser?.username || '—';
	const screeningDate = initialData?.updated_at
		? new Date(initialData.updated_at).toLocaleDateString()
		: new Date().toLocaleDateString();

	const subtitle = `${candidateName || 'New Candidate'} • Screener: ${screenerName} • Date: ${screeningDate}`;

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason === 'backdropClick') return;
				onClose();
			}}
			disableEscapeKeyDown
			maxWidth="lg"
			fullWidth
			PaperProps={{ sx: { borderRadius: '4px', bgcolor: 'transparent', boxShadow: 'none' } }}
		>
			{loadingFields ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 8, bgcolor: 'white', borderRadius: '4px' }}>
					<CircularProgress />
				</Box>
			) : (
				<EnterpriseForm
					title="Candidate Screening"
					subtitle={subtitle}
					mode={initialData ? 'edit' : 'create'}
					steps={steps}
					onSave={handleSubmit}
					onCancel={onClose}
					saveButtonText={initialData ? 'Update Screening' : 'Save Screening'}
				/>
			)}
		</Dialog>
	);
};

export default ScreeningFormDialog;
