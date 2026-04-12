import React, { useState, useEffect, useMemo } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	IconButton,
	Tabs,
	Tab,
	Divider,
	Stack,
	Tooltip,
	useMediaQuery,
	useTheme,
	Stepper,
	Step,
	StepLabel,
	Paper,
	Alert,
	Chip,
	Grid
} from '@mui/material';
import {
	Close as CloseIcon,
	Business as BusinessIcon,
	Person as ContactIcon,
	Event as DateIcon,
	SmartToy as AIIcon,
	AutoAwesome as MagicIcon,
	KeyboardArrowDown as ExpandIcon,
	KeyboardArrowUp as CollapseIcon,
	CloudUpload as UploadIcon,
	Check as CheckIcon,
	NavigateNext as NextIcon,
	NavigateBefore as BackIcon
} from '@mui/icons-material';
import { TextField, CircularProgress, Collapse } from '@mui/material';
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
			id={`jobrole-form-tabpanel-${index}`}
			aria-labelledby={`jobrole-form-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3, pb: 2 }}>{children}</Box>}
		</div>
	);
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
	const [tabValue, setTabValue] = useState(0);

	// AI Extraction & Review States
	const [showAIInput, setShowAIInput] = useState(false);
	const [jdText, setJdText] = useState('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isExtracting, setIsExtracting] = useState(false);
	const [isReviewing, setIsReviewing] = useState(false);
	const [activeReviewStep, setActiveReviewStep] = useState(0);
	const [extractedData, setExtractedData] = useState<any>(null);
	const [suggestions, setSuggestions] = useState<any>(null);

	const reviewSteps = [
		'Basic Information',
		'Job Description',
		'Location & Details',
		'Requirements & Skills'
	];

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

	useEffect(() => {
		if (open) {
			dispatch(fetchCompanies({ limit: 1000 }));
			setTabValue(0);
			if (jobRole) {
				const legacyState = (jobRole.location as any)?.state;
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

	const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
	const handleNestedChange = (parent: string, field: string, value: any) =>
		setFormData(prev => ({ ...prev, [parent]: { ...((prev as any)[parent] || {}), [field]: value } }));

	const handleExtractFromSource = async () => {
		if (!jdText.trim() && !selectedFile) {
			toast.warning('Please paste a job description or upload a PDF file.');
			return;
		}

		setIsExtracting(true);
		try {
			const result = await aiService.extractJobRole(jdText || undefined, selectedFile || undefined);
			setExtractedData(result.data);
			setSuggestions(result.suggestions);

			// Enter review mode
			setIsReviewing(true);
			setActiveReviewStep(0);
			toast.success('AI Analysis complete. Please review the extracted details.');
		} catch (error: any) {
			console.error('Extraction error:', error);
			toast.error(error.response?.data?.detail || 'Failed to analyze JD. Please check your AI settings.');
		} finally {
			setIsExtracting(false);
		}
	};

	const handleReviewComplete = () => {
		// Map extractedData and suggestions to formData
		setFormData(prev => ({
			...prev,
			...extractedData,
			company_id: suggestions?.company_id || prev.company_id,
			contact_id: suggestions?.contact_id || prev.contact_id,
			location: { ...prev.location, ...extractedData.location },
			requirements: { ...prev.requirements, ...extractedData.requirements },
			job_details: { ...prev.job_details, ...extractedData.job_details }
		}));

		setIsReviewing(false);
		setShowAIInput(false);
		setJdText('');
		setSelectedFile(null);
		setTabValue(0);
		toast.success('Form populated with verified details.');
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

	// Comprehensive cross-tab validation
	const validation = useMemo(() => {
		const basicInfoValid = !!(formData.title && formData.job_details?.designation && formData.company_id && formData.contact_id);
		const descriptionValid = (formData.description || '').trim().length >= 10;
		const locationValid = !!(formData.location?.states?.length && formData.location?.country);
		const requirementsValid = !!(formData.requirements?.qualifications?.length && formData.requirements?.disability_preferred?.length);

		return {
			basicInfo: basicInfoValid,
			description: descriptionValid,
			location: locationValid,
			requirements: requirementsValid,
			isValid: basicInfoValid && descriptionValid && locationValid && requirementsValid
		};
	}, [formData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validation.isValid) return;

		const {
			id: _id,
			public_id: _pid,
			created_at: _cat,
			updated_at: _uat,
			company: _comp,
			contact: _cont,
			creator: _creat,
			...submitData
		} = formData as any;

		onSubmit(submitData as JobRoleCreate);
	};

	const selectedCompany = companies.find((c) => c.id === formData.company_id)?.name;
	const selectedContact = contacts.find((c) => c.id === formData.contact_id);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			fullScreen={isMobile}
			PaperProps={{ sx: { borderRadius: isMobile ? 0 : 0, border: isMobile ? 'none' : '1px solid #d5dbdb', boxShadow: 'none' } }}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box sx={{ flex: 1 }}>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
							{jobRole ? 'Edit Job Role' : 'Create New Job Opening'}
							{!jobRole && (
								<Tooltip title="Auto-fill using AI analysis of a JD">
									<Button
										size="small"
										onClick={() => setShowAIInput(!showAIInput)}
										startIcon={<MagicIcon />}
										endIcon={showAIInput ? <CollapseIcon /> : <ExpandIcon />}
										sx={{
											ml: 2,
											textTransform: 'none',
											color: '#ff9900',
											fontWeight: 700,
											bgcolor: 'rgba(255, 153, 0, 0.1)',
											borderRadius: '4px',
											'&:hover': { bgcolor: 'rgba(255, 153, 0, 0.2)' }
										}}
									>
										Analyze with AI
									</Button>
								</Tooltip>
							)}
						</Typography>
						<Stack direction="row" spacing={3} alignItems="center" sx={{ opacity: 0.85 }}>
							{selectedCompany && (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<BusinessIcon sx={{ fontSize: 16 }} />
									<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
										{selectedCompany}
									</Typography>
								</Box>
							)}
							{selectedContact && (
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<ContactIcon sx={{ fontSize: 16 }} />
									<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
										{selectedContact.first_name} {selectedContact.last_name}
									</Typography>
								</Box>
							)}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
								<DateIcon sx={{ fontSize: 16 }} />
								<Typography variant="caption" sx={{ fontSize: '0.875rem' }}>
									<Typography component="span" variant="caption" sx={{ fontWeight: 600, mr: 0.5 }}>DATE:</Typography>
									{jobRole ? new Date(jobRole.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
								</Typography>
							</Box>
						</Stack>
					</Box>
					<IconButton onClick={onClose} sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: '#fff' }}>
				<Tabs
					value={tabValue}
					onChange={(_, v) => setTabValue(v)}
					variant={isMobile ? "scrollable" : "fullWidth"}
					scrollButtons={isMobile ? "auto" : false}
					allowScrollButtonsMobile
					sx={{
						px: isMobile ? 0 : 2,
						'& .MuiTabs-indicator': { bgcolor: 'primary.main', height: 3 },
						'& .MuiTab-root': {
							fontWeight: 700,
							textTransform: 'none',
							py: 2,
							color: 'text.secondary',
							fontSize: '0.875rem',
							'&.Mui-selected': { color: 'primary.main' }
						}
					}}
				>
					<Tab label="1. General info" />
					<Tab label="2. Job description" />
					<Tab label="3. Location & workplace" />
					<Tab label="4. Requirements" />
				</Tabs>
			</Box>

			<DialogContent sx={{ p: 0, bgcolor: 'background.default', minHeight: isMobile ? 'auto' : 450 }}>
				{isReviewing ? (
					<Box sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
						<Stepper activeStep={activeReviewStep} sx={{ mb: 4 }}>
							{reviewSteps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
						</Stepper>

						<Paper variant="outlined" sx={{ p: 3, flexGrow: 1, bgcolor: '#fff', borderRadius: '4px' }}>
							{activeReviewStep === 0 && (
								<Stack spacing={3}>
									<Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<BusinessIcon color="primary" /> Basic Information
									</Typography>
									<TextField
										fullWidth
										label="Job Title"
										value={extractedData?.title || ''}
										onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
										variant="outlined"
									/>
									<Box sx={{ p: 2, bgcolor: '#f8f9f9', borderRadius: '4px', border: '1px solid #d5dbdb' }}>
										<Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>AI Match Analysis</Typography>
										<Stack spacing={1}>
											<Alert severity={suggestions?.company_id ? "success" : "warning"} icon={<BusinessIcon />}>
												{suggestions?.company_id
													? `Matched existing company: ${suggestions.company_name}`
													: `New company detected: ${suggestions?.company_name || 'Unknown'}`}
											</Alert>
											<Alert severity={suggestions?.contact_id ? "success" : "info"} icon={<ContactIcon />}>
												{suggestions?.contact_id
													? `Matched priority contact: ${suggestions.contact_name}`
													: `Suggested recruiter name: ${suggestions?.contact_name || 'Not found'}`}
											</Alert>
										</Stack>
									</Box>
								</Stack>
							)}

							{activeReviewStep === 1 && (
								<Stack spacing={2}>
									<Typography variant="h6">Job Description Extract</Typography>
									<TextField
										multiline
										rows={12}
										fullWidth
										value={extractedData?.description || ''}
										onChange={(e) => setExtractedData({ ...extractedData, description: e.target.value })}
									/>
								</Stack>
							)}

							{activeReviewStep === 2 && (
								<Stack spacing={3}>
									<Typography variant="h6">Location & Workplace</Typography>
									<Grid container spacing={2}>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="caption" sx={{ fontWeight: 700 }}>EXTRACTED CITIES</Typography>
											<Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
												{extractedData?.location?.cities?.map((c: string) => <Chip key={c} label={c} size="small" />)}
											</Box>
										</Grid>
										<Grid size={{ xs: 12, md: 6 }}>
											<Typography variant="caption" sx={{ fontWeight: 700 }}>WORKPLACE TYPE</Typography>
											<Box sx={{ mt: 1 }}>
												<Chip label={extractedData?.job_details?.workplace_type} color="primary" />
											</Box>
										</Grid>
									</Grid>
								</Stack>
							)}

							{activeReviewStep === 3 && (
								<Stack spacing={3}>
									<Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
										<AIIcon color="primary" /> Requirements & Skills
									</Typography>
									<Typography variant="body2" color="text.secondary">
										AI has extracted the following granular technical skills. These will be added as individual tags.
									</Typography>
									<Paper variant="outlined" sx={{ p: 2, bgcolor: '#f1faff', border: '1px solid #007eb9' }}>
										<Typography variant="caption" sx={{ color: '#007eb9', fontWeight: 700, mb: 1, display: 'block' }}>TECHNICAL SKILL TAGS (ATOMIC)</Typography>
										<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
											{extractedData?.requirements?.skills?.map((s: string, idx: number) => (
												<Chip
													key={idx}
													label={s}
													color="primary"
													variant="outlined"
													onDelete={() => {
														const newSkills = [...extractedData.requirements.skills];
														newSkills.splice(idx, 1);
														setExtractedData({ ...extractedData, requirements: { ...extractedData.requirements, skills: newSkills } });
													}}
													sx={{ bgcolor: '#fff', borderRadius: '2px', fontWeight: 600 }}
												/>
											))}
										</Box>
									</Paper>
								</Stack>
							)}
						</Paper>

						<Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
							<Button
								startIcon={<BackIcon />}
								onClick={() => activeReviewStep === 0 ? setIsReviewing(false) : setActiveReviewStep(v => v - 1)}
								sx={{ textTransform: 'none' }}
							>
								{activeReviewStep === 0 ? 'Quit Review' : 'Back'}
							</Button>
							<Button
								variant="contained"
								endIcon={activeReviewStep === 3 ? <CheckIcon /> : <NextIcon />}
								onClick={() => activeReviewStep === 3 ? handleReviewComplete() : setActiveReviewStep(v => v + 1)}
								sx={{ textTransform: 'none', px: 4 }}
							>
								{activeReviewStep === 3 ? 'Finish & Populate' : 'Confirm & Next'}
							</Button>
						</Stack>
					</Box>
				) : (
					<>
						{/* AI JD Input Area */}
						<Collapse in={showAIInput}>
							<Box sx={{
								p: 3,
								bgcolor: '#f8f9f9',
								borderBottom: '1px solid #d5dbdb',
								display: 'flex',
								flexDirection: 'column',
								gap: 2
							}}>
								<Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'primary.main', mb: 1 }}>
									<AIIcon />
									<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
										Enterprise AI Job Description Analysis
									</Typography>
								</Stack>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
									Upload a PDF JD or paste the text below. Our AI will perform deep analysis to extract structured data and map CRM records.
								</Typography>

								<Stack direction="row" spacing={2} sx={{ mb: 1 }}>
									<TextField
										multiline
										rows={jdText ? 6 : 2}
										fullWidth
										placeholder="Paste JD text here..."
										value={jdText}
										onChange={(e) => setJdText(e.target.value)}
										disabled={isExtracting || !!selectedFile}
										sx={{
											bgcolor: '#fff',
											'& .MuiOutlinedInput-root': {
												borderRadius: '2px',
												'&.Mui-focused fieldset': { borderColor: 'primary.main' }
											}
										}}
									/>
									<Box sx={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 1 }}>
										<Button
											component="label"
											variant="outlined"
											startIcon={selectedFile ? <CheckIcon color="success" /> : <UploadIcon />}
											sx={{ height: '100%', borderStyle: 'dashed', textTransform: 'none' }}
											disabled={isExtracting || !!jdText.trim()}
										>
											{selectedFile ? selectedFile.name : 'Upload JD (PDF)'}
											<input type="file" hidden accept=".pdf" onChange={handleFileChange} />
										</Button>
										{selectedFile && (
											<Button
												size="small"
												color="error"
												onClick={() => setSelectedFile(null)}
												sx={{ textTransform: 'none' }}
											>
												Clear File
											</Button>
										)}
									</Box>
								</Stack>
								<Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 1 }}>
									<Button
										onClick={() => setShowAIInput(false)}
										disabled={isExtracting}
										sx={{ textTransform: 'none', fontWeight: 600 }}
									>
										Cancel
									</Button>
									<Button
										variant="contained"
										onClick={handleExtractFromSource}
										disabled={isExtracting || (!jdText.trim() && !selectedFile)}
										startIcon={isExtracting ? <CircularProgress size={20} color="inherit" /> : <MagicIcon />}
										sx={{
											textTransform: 'none',
											fontWeight: 700,
											px: 3,
											borderRadius: '2px',
											boxShadow: 'none'
										}}
									>
										{isExtracting ? 'Analyzing JD...' : 'Analyze & Review'}
									</Button>
								</Stack>
							</Box>
						</Collapse>

						<Box sx={{ px: { xs: 2, sm: 4 }, py: 2 }}>
							<TabPanel value={tabValue} index={0}>
								<GeneralInfoTab
									formData={formData}
									handleChange={handleChange}
									handleNestedChange={handleNestedChange}
									companies={companies}
									contacts={contacts}
								/>
							</TabPanel>
							<TabPanel value={tabValue} index={1}>
								<JobDescriptionTab
									formData={formData}
									handleChange={handleChange}
								/>
							</TabPanel>
							<TabPanel value={tabValue} index={2}>
								<LocationWorkplaceTab
									formData={formData}
									handleNestedChange={handleNestedChange}
									workplaceTypes={WORKPLACE_TYPES}
									jobTypes={JOB_TYPES}
								/>
							</TabPanel>
							<TabPanel value={tabValue} index={3}>
								<RequirementsCompensationTab
									formData={formData}
									handleNestedChange={handleNestedChange}
								/>
							</TabPanel>
						</Box>
					</>
				)}
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#fff', justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
					{!validation.isValid && (
						<>
							<Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600 }}>
								Please complete all mandatory fields before saving.
							</Typography>
						</>
					)}
				</Box>
				<Stack direction="row" spacing={2}>
					<Button
						onClick={onClose}
						sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'none', px: 3 }}
					>
						Cancel
					</Button>
					<Tooltip title={!validation.isValid ? "Complete all required fields" : ""}>
						<span>
							<Button
								onClick={handleSubmit}
								variant="contained"
								disabled={loading || !validation.isValid}
								sx={{
									bgcolor: 'primary.main',
									px: 4,
									py: 1,
									fontWeight: 700,
									borderRadius: '2px',
									textTransform: 'none',
									boxShadow: 'none',
									border: '1px solid primary.main',
									'&:hover': { bgcolor: '#eb5f07', borderColor: '#eb5f07' },
									'&.Mui-disabled': { bgcolor: 'background.default', color: '#aab7b8', borderColor: 'divider' }
								}}
							>
								{loading ? 'Processing...' : (jobRole ? 'Update Changes' : 'Save Opening')}
							</Button>
						</span>
					</Tooltip>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};

export default JobRoleFormDialog;
