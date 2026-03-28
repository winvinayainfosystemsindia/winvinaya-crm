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
import { Close as CloseIcon, InfoOutlined as InfoIcon } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import type { JobRole, JobRoleCreate, JobRoleUpdate } from '../../../../models/jobRole';
import { JOB_ROLE_STATUS } from '../../../../models/jobRole';
import { fetchCompanies } from '../../../../store/slices/companySlice';
import { fetchContacts } from '../../../../store/slices/contactSlice';

import GeneralInfoTab from './tabs/GeneralInfoTab';
import LocationWorkplaceTab from './tabs/LocationWorkplaceTab';
import RequirementsCompensationTab from './tabs/RequirementsCompensationTab';

interface JobRoleFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: JobRoleCreate | JobRoleUpdate) => void;
	jobRole?: JobRole | null;
	loading?: boolean;
}

const WORKPLACE_TYPES = ['Hybrid', 'Onsite', 'Remote'];
const JOB_TYPES = ['Permanent', 'Contract', 'Full Time', 'Internship'];

const JobRoleFormDialog: React.FC<JobRoleFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	jobRole,
	loading = false
}) => {
	const dispatch = useAppDispatch();
	const { list: companies } = useAppSelector((state: any) => state.companies);
	const { list: contacts } = useAppSelector((state: any) => state.contacts);
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
		const locationValid = !!(formData.location?.state && formData.location?.country);
		const requirementsValid = !!(formData.requirements?.qualifications?.length && formData.requirements?.disability_preferred?.length);
		
		return {
			basicInfo: basicInfoValid,
			location: locationValid,
			requirements: requirementsValid,
			isValid: basicInfoValid && locationValid && requirementsValid
		};
	}, [formData]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validation.isValid) return;
		const { id, public_id, created_at, updated_at, company, contact, creator, ...submitData } = formData as any;
		onSubmit(submitData as JobRoleCreate);
	};

	return (
		<Dialog 
			open={open} 
			onClose={onClose} 
			maxWidth="md" 
			fullWidth 
			PaperProps={{ sx: { borderRadius: 0, border: '1px solid #d5dbdb', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' } }}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
							{jobRole ? 'Edit Job Role' : 'Create New Job Opening'}
						</Typography>
						<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' }}>
							{jobRole ? `REQUISITION ID: ${jobRole.public_id}` : 'ENTER REQUISITION DETAILS TO MANAGE CANDIDATE MAPPING'}
						</Typography>
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
						'& .MuiTabs-indicator': { bgcolor: '#ec7211', height: 3 },
						'& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2, color: '#545b64', '&.Mui-selected': { color: '#ec7211' } }
					}}
				>
					<Tab label="GENERAL INFORMATION" />
					<Tab label="LOCATION & WORKPLACE" />
					<Tab label="REQUIREMENTS & ELIGIBILITY" />
				</Tabs>
			</Box>

			<DialogContent sx={{ p: 4, bgcolor: '#f2f3f3', minHeight: 450 }}>
				<Box sx={{ bgcolor: '#fff', p: 4, border: '1px solid #d5dbdb', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
					{tabValue === 0 && (
						<GeneralInfoTab 
							formData={formData} 
							handleChange={handleChange} 
							handleNestedChange={handleNestedChange}
							companies={companies} 
							contacts={contacts} 
						/>
					)}
					{tabValue === 1 && (
						<LocationWorkplaceTab 
							formData={formData} 
							handleNestedChange={handleNestedChange} 
							workplaceTypes={WORKPLACE_TYPES} 
							jobTypes={JOB_TYPES} 
						/>
					)}
					{tabValue === 2 && (
						<RequirementsCompensationTab 
							formData={formData} 
							handleNestedChange={handleNestedChange} 
						/>
					)}
				</Box>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#fff', justifyContent: 'space-between' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
					{!validation.isValid && (
						<>
							<InfoIcon sx={{ color: '#d13212', fontSize: 18 }} />
							<Typography variant="caption" sx={{ color: '#d13212', fontWeight: 600 }}>
								Please complete all mandatory fields across all tabs before saving.
							</Typography>
						</>
					)}
				</Box>
				<Stack direction="row" spacing={2}>
					<Button 
						onClick={onClose} 
						sx={{ color: '#545b64', fontWeight: 700, textTransform: 'none', minWidth: 100 }}
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
									bgcolor: '#ec7211', 
									px: 4, 
									fontWeight: 700, 
									borderRadius: '2px', 
									textTransform: 'none', 
									boxShadow: 'none',
									'&:hover': { bgcolor: '#eb5f07', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' },
									'&.Mui-disabled': { bgcolor: '#f2f3f3', color: '#aab7b8' }
								}}
							>
								{loading ? 'Processing...' : (jobRole ? 'Save Changes' : 'Create Job Opening')}
							</Button>
						</span>
					</Tooltip>
				</Stack>
			</DialogActions>
		</Dialog>
	);
};

export default JobRoleFormDialog;
