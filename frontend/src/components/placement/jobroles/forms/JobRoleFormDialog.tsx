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
} from '@mui/material';
import { 
	Close as CloseIcon, 
	Business as BusinessIcon,
	Person as ContactIcon,
	Event as DateIcon
} from '@mui/icons-material';
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

import { WORKPLACE_TYPES, JOB_TYPES } from '../../../../data/jobRoleData';

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
	const [tabValue, setTabValue] = useState(0);

	const [formData, setFormData] = useState<Partial<JobRole>>({
		title: '',
		description: '',
		status: JOB_ROLE_STATUS.ACTIVE,
		is_visible: true,
		location: { cities: [], state: '', country: 'India' },
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
				setFormData({ 
					...jobRole, 
					close_date: jobRole.close_date?.split('T')[0],
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
					location: { cities: [], state: '', country: 'India' }, 
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

	// Comprehensive cross-tab validation
	const validation = useMemo(() => {
		const basicInfoValid = !!(formData.title && formData.job_details?.designation && formData.company_id && formData.contact_id);
		const descriptionValid = (formData.description || '').trim().length >= 10;
		const locationValid = !!(formData.location?.state && formData.location?.country);
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
			PaperProps={{ sx: { borderRadius: 0, border: '1px solid #d5dbdb', boxShadow: 'none' } }}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box sx={{ flex: 1 }}>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
							{jobRole ? 'Edit Job Role' : 'Create New Job Opening'}
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
					variant="fullWidth" 
					sx={{ 
						px: 2,
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

			<DialogContent sx={{ p: 0, bgcolor: 'background.default', minHeight: 450 }}>
				<Box sx={{ px: 4, py: 2 }}>
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
