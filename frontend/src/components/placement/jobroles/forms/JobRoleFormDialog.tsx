import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Button,
	Typography,
	Box,
	IconButton,
	Divider,
	Stack,
	useMediaQuery,
	useTheme,
	Paper,
	Grid,
	Alert,
	DialogActions
} from '@mui/material';
import {
	Close as CloseIcon,
	Person as ContactIcon,
	AutoAwesome as MagicIcon,
	CloudUpload as UploadIcon,
	AssignmentTurnedIn as VerifiedIcon,
} from '@mui/icons-material';
import {
	TextField,
	CircularProgress,
	Stepper,
	Step,
	StepLabel,
	Card,
	CardActionArea,
} from '@mui/material';
import { aiService } from '../../../../services/aiService';
import useToast from '../../../../hooks/useToast';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import type { RootState } from '../../../../store/store';
import type { JobRole, JobRoleCreate, JobRoleUpdate } from '../../../../models/jobRole';
import { JOB_ROLE_STATUS } from '../../../../models/jobRole';
import { fetchCompanies } from '../../../../store/slices/companySlice';
import { fetchContacts } from '../../../../store/slices/contactSlice';

import GeneralInfoTab from './tabs/GeneralInfoTab';
import JobDescriptionTab from './tabs/JobDescriptionTab';
import LocationWorkplaceTab from './tabs/LocationWorkplaceTab';
import RequirementsCompensationTab from './tabs/RequirementsCompensationTab';
import { WORKPLACE_TYPES, JOB_TYPES } from '../../../../data/jobRoleData';

interface JobRoleFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: JobRoleCreate | JobRoleUpdate) => void;
	jobRole?: JobRole | null;
	loading?: boolean;
}




const JobRoleFormDialog: React.FC<JobRoleFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	jobRole,
	loading = false
}) => {
	const dispatch = useAppDispatch();
	const { list: companies } = useAppSelector((state: RootState) => state.companies);
	const { list: contacts } = useAppSelector((state: RootState) => state.contacts);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const toast = useToast();
	// Navigation & Mode States
	const [reviewTabValue, setReviewTabValue] = useState(0);
	const [activeStep, setActiveStep] = useState(0);
	const [showSource, setShowSource] = useState(false);
	const [formMode, setFormMode] = useState<'select' | 'ai' | 'manual' | null>(null);


	// AI Extraction States
	const [jdText, setJdText] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isExtracting, setIsExtracting] = useState(false);
	const [suggestions, setSuggestions] = useState<{
		company_id: number | null;
		company_name: string | null;
		contact_id: number | null;
		contact_name: string | null;
	} | null>(null);
	const [dragActive, setDragActive] = useState(false);

	const [formData, setFormData] = useState<Partial<JobRole>>({
		title: '',
		description: '',
		status: JOB_ROLE_STATUS.ACTIVE,
		is_visible: true,
		location: { cities: [], states: [], country: 'India' },
		salary_range: { min: undefined, max: undefined, currency: 'INR' },
		experience: { min: undefined, max: undefined },
		requirements: { skills: [], qualifications: [], disability_preferred: [] },
		job_details: { designation: '', workplace_type: '', job_type: '' },
	});

	const steps = jobRole
		? ['Edit Details']
		: ['Selection Mode', 'Input Source', 'Review & Publish'];

	useEffect(() => {
		if (open) {
			dispatch(fetchCompanies({ limit: 1000 }));
			setActiveStep(0);
			setFormMode(jobRole ? 'manual' : null);
			setSuggestions(null);
			setJdText('');
			setSelectedFile(null);
			if (jobRole) {
				const legacyState = (jobRole.location as Record<string, unknown>)?.state as string | undefined;
				setFormData({
					...jobRole,
					close_date: jobRole.close_date?.split('T')[0],
					location: {
						...jobRole.location,
						states: jobRole.location?.states || (legacyState ? [legacyState] : []),
						cities: jobRole.location?.cities || []
					},
					requirements: {
						...jobRole.requirements,
						disability_preferred: jobRole.requirements?.disability_preferred || []
					}
				});
			} else {
				setFormData({
					title: '',
					status: JOB_ROLE_STATUS.ACTIVE,
					is_visible: true,
					location: { cities: [], states: [], country: 'India' },
					requirements: { skills: [], qualifications: [], disability_preferred: [] },
					job_details: { designation: '', workplace_type: 'Onsite', job_type: 'Full Time' }
				});
			}
		}
	}, [open, jobRole, dispatch]);

	useEffect(() => {
		if (formData.company_id) {
			dispatch(fetchContacts({ companyId: formData.company_id, limit: 1000 }));
		}
	}, [dispatch, formData.company_id]);

	const handleChange = (field: string, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));
	const handleNestedChange = (parent: string, field: string, value: unknown) =>
		setFormData(prev => ({ ...prev, [parent]: { ...((prev as Record<string, Record<string, unknown>>)[parent] || {}), [field]: value } }));

	const handleExtractFromSource = async () => {
		if (!jdText.trim() && !selectedFile) {
			toast.warning('Please paste a job description or upload a PDF file.');
			return;
		}

		setIsExtracting(true);
		try {
			const result = await aiService.extractJobRole(jdText || undefined, selectedFile || undefined);
			const extracted = result.data;
			
			// Directly merge into formData to keep a single source of truth
			setFormData(prev => ({
				...prev,
				...extracted,
				company_id: result.suggestions?.company_id || prev.company_id,
				contact_id: result.suggestions?.contact_id || prev.contact_id,
				location: {
					...prev.location,
					...extracted.location,
					cities: extracted.location?.cities || prev.location?.cities || []
				},
				requirements: {
					...prev.requirements,
					...extracted.requirements
				},
				job_details: {
					...prev.job_details,
					...extracted.job_details
				}
			}));

			setSuggestions(result.suggestions);
			setActiveStep(2); // Jump to Review & Publish
			toast.success('AI Analysis complete. Please verify the results and publish.');
		} catch (error: unknown) {
			console.error('Extraction error:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to analyze JD. Please check your AI settings.';
			toast.error(errorMessage);
		} finally {
			setIsExtracting(false);
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			if (file.type !== 'application/pdf') {
				toast.error('Only PDF files are supported.');
				return;
			}
			setSelectedFile(file);
			setJdText('');
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			if (file.type !== 'application/pdf') {
				toast.error('Only PDF files are supported for auto-extraction.');
				return;
			}
			setSelectedFile(file);
			setJdText(''); // Clear text if file is selected
		}
	};

	// Comprehensive cross-tab validation helper
	const validateData = (data: Partial<JobRole>) => {
		const basicInfoValid = !!(data.title && data.job_details?.designation && data.company_id && data.contact_id);
		const descriptionValid = (data.description || '').trim().length >= 10;
		const locationValid = !!(data.location?.states?.length && data.location?.country);
		const requirementsValid = !!(data.requirements?.qualifications?.length && data.requirements?.disability_preferred?.length);

		return {
			basicInfo: basicInfoValid,
			description: descriptionValid,
			location: locationValid,
			requirements: requirementsValid,
			isValid: basicInfoValid && descriptionValid && locationValid && requirementsValid
		};
	};

	const validation = useMemo(() => validateData(formData), [formData]);

	// Keyboard shortcut listener
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
				if (activeStep === 2 && validation.isValid) {
					handleSubmit(e as any);
				}
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [activeStep, validation]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validation.isValid) return;

		const submitData = { ...formData };
		const fieldsToExclude = ['id', 'public_id', 'created_at', 'updated_at', 'company', 'contact', 'creator'] as const;

		fieldsToExclude.forEach(field => {
			delete (submitData as Record<string, unknown>)[field];
		});

		onSubmit(submitData as JobRoleCreate);
	};


	const renderSelectionMode = () => (
		<Box sx={{ p: 4, textAlign: 'center' }}>
			<Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Build your job opening</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
				Choose how you want to start. Let our AI handle the data entry or build it yourself.
			</Typography>
			<Grid container spacing={4} sx={{ maxWidth: 800, mx: 'auto' }}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Card
						sx={{
							height: '100%',
							border: '2px solid transparent',
							'&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(236, 114, 17, 0.04)' },
							transition: 'all 0.3s'
						}}
					>
						<CardActionArea
							onClick={() => { setFormMode('ai'); setActiveStep(1); }}
							sx={{ height: '100%', p: 3 }}
						>
							<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
								<Box sx={{ p: 2, bgcolor: 'rgba(236, 114, 17, 0.1)', borderRadius: '50%' }}>
									<MagicIcon sx={{ fontSize: 48, color: 'primary.main' }} />
								</Box>
							</Box>
							<Typography variant="h6" gutterBottom>AI Smart Draft</Typography>
							<Typography variant="body2" color="text.secondary">
								Upload a JD or paste text. We'll extract skills, location, and key requirements automatically.
							</Typography>
						</CardActionArea>
					</Card>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<Card
						sx={{
							height: '100%',
							border: '2px solid transparent',
							'&:hover': { borderColor: 'secondary.main', bgcolor: 'rgba(35, 47, 62, 0.04)' },
							transition: 'all 0.3s'
						}}
					>
						<CardActionArea
							onClick={() => { setFormMode('manual'); setActiveStep(2); }}
							sx={{ height: '100%', p: 3 }}
						>
							<Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
								<Box sx={{ p: 2, bgcolor: 'rgba(35, 47, 62, 0.1)', borderRadius: '50%' }}>
									<ContactIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
								</Box>
							</Box>
							<Typography variant="h6" gutterBottom>Manual Setup</Typography>
							<Typography variant="body2" color="text.secondary">
								Start with a clean slate. Fill in the details manually using our optimized enterprise form.
							</Typography>
						</CardActionArea>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);

	const renderInputSource = () => (
		<Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
			{/* CONTENT AREA - Managed by DialogContent */}
			<Box sx={{ p: 4 }}>
				<Box sx={{ maxWidth: 800, mx: 'auto' }}>
					<Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1.5, color: 'secondary.main' }}>
						<Box sx={{ p: 1, bgcolor: 'primary.light', color: '#fff', borderRadius: '8px', display: 'flex' }}>
							<UploadIcon fontSize="small" />
						</Box>
						Attach Source Document
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 4, ml: 6 }}>
						Accelerate your workflow with AI-assisted data mapping by providing a job description.
					</Typography>

					<Paper elevation={0} sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: '12px', bgcolor: '#fff' }}>
						<Box
							onDragEnter={handleDrag}
							onDragLeave={handleDrag}
							onDragOver={handleDrag}
							onDrop={handleDrop}
							sx={{
								p: 5,
								mb: 4,
								border: '2px dashed',
								borderColor: dragActive ? 'primary.main' : '#e2e8f0',
								borderRadius: '8px',
								bgcolor: dragActive ? 'rgba(0, 77, 230, 0.02)' : '#f8fafc',
								textAlign: 'center',
								transition: 'all 0.2s',
								cursor: 'pointer'
							}}
							onClick={() => !selectedFile && document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'))}
						>
							{selectedFile ? (
								<Box sx={{ py: 1 }}>
									<VerifiedIcon sx={{ color: 'success.main', fontSize: 40, mb: 1 }} />
									<Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'secondary.main' }}>{selectedFile.name}</Typography>
									<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>PDF Document Ready for Analysis</Typography>
									<Button size="small" variant="text" color="error" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} sx={{ mt: 2, fontWeight: 700 }}>
										Replace Document
									</Button>
								</Box>
							) : (
								<Box>
									<UploadIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 2 }} />
									<Typography variant="body1" sx={{ fontWeight: 600, color: 'secondary.main', mb: 0.5 }}>
										Drag & Drop PDF or click to browse
									</Typography>
									<Typography variant="caption" color="text.secondary">Support PDF only (max 10MB)</Typography>
									<input type="file" hidden accept=".pdf" onChange={handleFileChange} />
								</Box>
							)}
						</Box>

						<Divider sx={{ mb: 4 }}><Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em' }}>OR PASTE JOB DESCRIPTION</Typography></Divider>

						<Typography variant="awsFieldLabel">Raw Content</Typography>
						<TextField
							multiline
							rows={10}
							fullWidth
							placeholder="Paste the job description text here for extraction..."
							value={jdText}
							onChange={(e) => { setJdText(e.target.value); if (e.target.value) setSelectedFile(null); }}
							sx={{
								'& .MuiInputBase-root': { bgcolor: '#fff', borderRadius: '8px' },
								'& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' }
							}}
						/>
					</Paper>
				</Box>
			</Box>

		</Box>
	);

	const renderReviewAnalysis = () => (
		<Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f1f5f9' }}>
			{/* STICKY HEADER SECTION */}
			<Box sx={{ position: 'sticky', top: 0, zIndex: 100, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
				<Box sx={{ py: 1.25, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Stack spacing={0.25}>
						<Typography variant="h6" sx={{ color: 'secondary.main', fontWeight: 800, fontSize: '1.1rem' }}>Review & Publish</Typography>
						<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>Review and validate the structured data before publishing.</Typography>
					</Stack>

					<Stack direction="row" spacing={3} alignItems="center">
						<Stack direction="row" spacing={1} alignItems="center">
							<Box sx={{ textAlign: 'right' }}>
								<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Extraction confidence</Typography>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
									<Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
									<Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>High (92%)</Typography>
								</Box>
							</Box>
						</Stack>

						<Divider orientation="vertical" flexItem sx={{ height: 32, my: 'auto' }} />

						<Box sx={{ textAlign: 'right' }}>
							<Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Fields auto-mapped</Typography>
							<Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
								{Object.keys(formData || {}).length} Attributes
							</Typography>
						</Box>

						<Divider orientation="vertical" flexItem sx={{ height: 32, my: 'auto' }} />

						<Button
							size="small"
							variant="contained"
							color="primary"
							startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
							onClick={() => setShowSource(!showSource)}
							sx={{
								borderRadius: '8px',
								textTransform: 'none',
								fontWeight: 700,
								px: 3,
								height: 40,
								boxShadow: 'none',
								'&:hover': { boxShadow: 'none' }
							}}
						>
							{showSource ? 'Hide Source' : 'Peek Source'}
						</Button>
					</Stack>
				</Box>

				{/* STICKY SEGMENTED TABS NAVIGATION */}
				<Box sx={{ py: 1, display: 'flex', justifyContent: 'center', bgcolor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
					<Paper elevation={0} sx={{
						p: 0.5,
						bgcolor: '#e2e8f0',
						borderRadius: '12px',
						display: 'inline-flex',
						gap: 0.5
					}}>
						{[
							{ label: 'General', icon: <MagicIcon sx={{ fontSize: 16 }} />, valid: validation.basicInfo },
							{ label: 'Job Narrative', icon: <UploadIcon sx={{ fontSize: 16 }} />, valid: validation.description },
							{ label: 'Location', icon: <VerifiedIcon sx={{ fontSize: 16 }} />, valid: validation.location },
							{ label: 'Requirements', icon: <VerifiedIcon sx={{ fontSize: 16 }} />, valid: validation.requirements }
						].map((tab, idx) => (
							<Button
								key={tab.label}
								onClick={() => setReviewTabValue(idx)}
								variant="text"
								size="small"
								sx={{
									px: 3,
									py: 0.5,
									borderRadius: '10px',
									color: reviewTabValue === idx ? '#fff' : 'text.secondary',
									bgcolor: reviewTabValue === idx ? 'secondary.main' : 'transparent',
									fontWeight: 700,
									display: 'flex',
									gap: 1,
									'&:hover': {
										bgcolor: reviewTabValue === idx ? 'secondary.main' : 'rgba(15, 23, 42, 0.08)'
									}
								}}
							>
								{tab.label}
								{!tab.valid && (
									<Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%', ml: 0.5 }} />
								)}
							</Button>
						))}
					</Paper>
				</Box>
			</Box>

			{/* UNIFIED SCROLLABLE AREA - Flow controlled by DialogContent */}
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 4 } }}>
				{!validation.isValid && (
					<Alert 
						severity="error" 
						variant="filled" 
						sx={{ mb: 2, width: '100%', maxWidth: 900, borderRadius: '12px', bgcolor: 'error.dark' }}
					>
						<strong>Missing Mandatory Information:</strong> Please complete the sections marked with red indicators to publish this requisition. 
						(Check Company and Contact on the General tab).
					</Alert>
				)}
				<Box sx={{ width: '100%', maxWidth: 900 }}>
					<Paper elevation={1} sx={{ p: 4, bgcolor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
						{formData && (
							<>
								{reviewTabValue === 0 && (
									<GeneralInfoTab
										formData={formData}
										handleChange={handleChange}
										handleNestedChange={handleNestedChange}
										companies={companies}
										contacts={contacts}
										suggestions={suggestions}
										highlightMissing={true}
									/>
								)}
								{reviewTabValue === 1 && (
									<JobDescriptionTab
										formData={formData}
										handleChange={handleChange}
										highlightMissing={true}
									/>
								)}
								{reviewTabValue === 2 && (
									<LocationWorkplaceTab
										formData={formData}
										handleNestedChange={handleNestedChange}
										workplaceTypes={WORKPLACE_TYPES}
										jobTypes={JOB_TYPES}
										highlightMissing={true}
									/>
								)}
								{reviewTabValue === 3 && (
									<RequirementsCompensationTab
										formData={formData}
										handleNestedChange={handleNestedChange}
										highlightMissing={true}
									/>
								)}
							</>
						)}
					</Paper>
				</Box>
			</Box>
		</Box >
	);

	const renderFooterActions = () => {
		if (activeStep === 0) return null;

		return (
			<DialogActions sx={{ p: 2.5, px: 4, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
				<Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 700 }}>
					Cancel Requisition
				</Button>

				<Stack direction="row" spacing={2}>
					{activeStep === 1 && (
						<>
							<Button onClick={() => setActiveStep(0)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Back</Button>
							<Button
								variant="contained"
								color="primary"
								onClick={handleExtractFromSource}
								disabled={isExtracting || (!jdText.trim() && !selectedFile)}
								startIcon={isExtracting ? <CircularProgress size={18} color="inherit" /> : <MagicIcon />}
								sx={{ px: 4, fontWeight: 700, borderRadius: '8px' }}
							>
								{isExtracting ? 'Analyzing Source...' : 'Analyze & Extraction'}
							</Button>
						</>
					)}

					{activeStep === 2 && (
						<>
							<Stack direction="row" spacing={3} alignItems="center">
								{!validation.isValid && (
									<Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
										Complete required fields to publish
									</Typography>
								)}
								<Button color="inherit" sx={{ fontWeight: 700 }} onClick={() => setActiveStep(formMode === 'ai' ? 1 : 0)}>
									Back
								</Button>
								<Button
									variant="contained"
									color="primary"
									onClick={handleSubmit}
									disabled={loading || !validation.isValid}
									startIcon={loading ? <CircularProgress size= {18} color="inherit" /> : null}
									sx={{ px: 4, fontWeight: 700, borderRadius: '8px' }}
								>
									{jobRole ? 'Update Requisition' : 'Publish Requisition'}
								</Button>
							</Stack>
						</>
					)}
				</Stack>
			</DialogActions>
		);
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
			fullScreen={isMobile}
			PaperProps={{
				sx: {
					borderRadius: isMobile ? 0 : '16px',
					overflow: 'hidden',
					boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
					bgcolor: 'background.default'
				}
			}}
		>
			<DialogTitle sx={{
				p: 0,
				bgcolor: 'secondary.main',
				color: '#fff',
				position: 'relative',
				borderBottom: '1px solid rgba(255,255,255,0.05)'
			}}>
				<Box sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Stack spacing={0.25}>
						<Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: '-0.8px' }}>
							{jobRole ? 'Modify Requisition' : 'New Talent Pipeline'}
						</Typography>
						<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.65rem' }}>
							Enterprise Job Architect • {jobRole?.public_id || 'ID-PENDING'}
						</Typography>
					</Stack>
					<IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
						<CloseIcon sx={{ fontSize: 24 }} />
					</IconButton>
				</Box>

				{!jobRole && (
					<Box sx={{ px: 5, pb: 2.5 }}>
						<Stepper
							activeStep={activeStep}
							alternativeLabel={!isMobile}
							sx={{
								'& .MuiStepIcon-root': {
									color: 'rgba(255,255,255,0.1)',
									width: 24,
									height: 24,
									'&.Mui-active': { color: 'primary.main', filter: 'drop-shadow(0 0 8px rgba(0,77,230,0.4))' },
									'&.Mui-completed': { color: 'success.main' }
								},
								'& .MuiStepLabel-label': {
									color: 'rgba(255,255,255,0.3)',
									fontSize: '0.65rem',
									fontWeight: 800,
									mt: 1,
									textTransform: 'uppercase',
									letterSpacing: '0.05em',
									'&.Mui-active': { color: '#fff' },
									'&.Mui-completed': { color: 'success.main' }
								},
								'& .MuiStepConnector-line': {
									borderColor: 'rgba(255,255,255,0.05)',
									borderTopWidth: 2
								}
							}}
						>
							{steps.map((label) => (
								<Step key={label}>
									<StepLabel>{label}</StepLabel>
								</Step>
							))}
						</Stepper>
					</Box>
				)}
			</DialogTitle>

			<DialogContent sx={{ p: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', overflowY: 'auto', maxHeight: '75vh' }}>
				<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
					{activeStep === 0 && renderSelectionMode()}
					{activeStep === 1 && renderInputSource()}
					{activeStep === 2 && renderReviewAnalysis()}
				</Box>
			</DialogContent>
			{renderFooterActions()}
		</Dialog>
	);
};

export default JobRoleFormDialog;
