import React, { useState, useEffect } from 'react';
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
	Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
const QUALIFICATIONS = ['Any Graduation', 'B.E/B.Tech', 'B.Sc', 'B.A', 'B.Com', 'M.Tech', 'MCA', 'MBA', 'M.Sc', 'Diploma'];

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
		location: { cities: [], state: '', country: '' },
		salary_range: { min: undefined, max: undefined, currency: 'INR' },
		experience: { min: undefined, max: undefined },
		requirements: { skills: [], qualifications: [] },
		job_details: { designation: '', workplace_type: '', job_type: '' },
	});

	useEffect(() => {
		if (open) {
			dispatch(fetchCompanies({ limit: 1000 }));
			setTabValue(0);
			if (jobRole) {
				setFormData({ ...jobRole, close_date: jobRole.close_date?.split('T')[0] });
			} else {
				setFormData({ 
					title: '', 
					status: JOB_ROLE_STATUS.ACTIVE, 
					is_visible: true, 
					location: { cities: [] }, 
					requirements: { skills: [], qualifications: [] }, 
					job_details: {} 
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const { id, public_id, created_at, updated_at, company, contact, creator, ...submitData } = formData as any;
		onSubmit(submitData as JobRoleCreate);
	};

	return (
		<Dialog 
			open={open} 
			onClose={onClose} 
			maxWidth="md" 
			fullWidth 
			PaperProps={{ sx: { borderRadius: 0, border: '1px solid #d5dbdb' } }}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ fontWeight: 700 }}>{jobRole ? 'Edit Job Role' : 'Create Job Role'}</Typography>
						<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
							{jobRole ? `Job ID: ${jobRole.public_id}` : 'Fill in the details to manage the job role opening'}
						</Typography>
					</Box>
					<IconButton onClick={onClose} sx={{ color: '#ffffff' }}><CloseIcon /></IconButton>
				</Stack>
			</DialogTitle>
			
			<Box sx={{ borderBottom: 1, borderColor: '#d5dbdb', bgcolor: '#fff' }}>
				<Tabs 
					value={tabValue} 
					onChange={(_, v) => setTabValue(v)} 
					variant="fullWidth" 
					sx={{ 
						'& .MuiTabs-indicator': { bgcolor: '#ec7211', height: 3 },
						'& .MuiTab-root': { fontWeight: 700, textTransform: 'none', color: '#545b64', '&.Mui-selected': { color: '#ec7211' } }
					}}
				>
					<Tab label="1. Basic Info" />
					<Tab label="2. Location & Workplace" />
					<Tab label="3. Requirements" />
				</Tabs>
			</Box>

			<DialogContent sx={{ p: 4, bgcolor: '#f2f3f3', minHeight: 400 }}>
				<Box sx={{ bgcolor: '#fff', p: 3, border: '1px solid #d5dbdb', borderRadius: '2px' }}>
					{tabValue === 0 && <GeneralInfoTab formData={formData} handleChange={handleChange} companies={companies} contacts={contacts} />}
					{tabValue === 1 && <LocationWorkplaceTab formData={formData} handleNestedChange={handleNestedChange} workplaceTypes={WORKPLACE_TYPES} jobTypes={JOB_TYPES} />}
					{tabValue === 2 && <RequirementsCompensationTab formData={formData} handleNestedChange={handleNestedChange} qualifications={QUALIFICATIONS} />}
				</Box>
			</DialogContent>

			<Divider sx={{ borderColor: '#d5dbdb' }} />
			<DialogActions sx={{ p: 3, bgcolor: '#fff' }}>
				<Button onClick={onClose} sx={{ color: '#545b64', fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
				<Button 
					onClick={handleSubmit} 
					variant="contained" 
					disabled={loading || !formData.title || !formData.company_id} 
					sx={{ bgcolor: '#ec7211', px: 4, fontWeight: 700, borderRadius: '2px', textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#eb5f07' } }}
				>
					{loading ? 'Saving...' : (jobRole ? 'Update Job Role' : 'Create Job Role')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default JobRoleFormDialog;
