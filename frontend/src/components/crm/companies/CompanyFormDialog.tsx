import React, { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	Box,
	IconButton,
	Paper
} from '@mui/material';
import { Close as CloseIcon, Business as BusinessIcon, Info as InfoIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import type { Company, CompanyCreate, CompanyUpdate, CompanySize, CompanyStatus } from '../../../models/company';

interface CompanyFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: CompanyCreate | CompanyUpdate) => void;
	company?: Company | null;
	loading?: boolean;
}

const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
	{ value: 'micro', label: 'Micro (1-10)' },
	{ value: 'small', label: 'Small (11-50)' },
	{ value: 'medium', label: 'Medium (51-250)' },
	{ value: 'large', label: 'Large (251-1000)' },
	{ value: 'enterprise', label: 'Enterprise (1000+)' }
];

const COMPANY_STATUSES: { value: CompanyStatus; label: string }[] = [
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
	{ value: 'prospect', label: 'Prospect' },
	{ value: 'customer', label: 'Customer' }
];

const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	company,
	loading = false
}) => {
	const [formData, setFormData] = useState<Partial<Company>>({
		name: '',
		industry: '',
		company_size: 'micro',
		website: '',
		phone: '',
		email: '',
		status: 'prospect',
		address: {
			street: '',
			city: '',
			state: '',
			country: 'India',
			pincode: ''
		}
	});

	useEffect(() => {
		if (company) {
			setFormData({
				...company,
				address: company.address || { street: '', city: '', state: '', country: 'India', pincode: '' }
			});
		} else {
			setFormData({
				name: '',
				industry: '',
				company_size: 'micro',
				website: '',
				phone: '',
				email: '',
				status: 'prospect',
				address: { street: '', city: '', state: '', country: 'India', pincode: '' }
			});
		}
	}, [company, open]);

	const handleChange = (field: string, value: any) => {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData(prev => ({
				...prev,
				[parent]: {
					...(prev[parent as keyof typeof prev] as any),
					[child]: value
				}
			}));
		} else {
			setFormData(prev => ({ ...prev, [field]: value }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name) return;
		onSubmit(formData as CompanyCreate);
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
				sx: { borderRadius: 0, boxShadow: 'none', border: '1px solid #d5dbdb' }
			}}
		>
			<DialogTitle sx={{ bgcolor: '#232f3e', color: '#ffffff', py: 2 }}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Stack direction="row" spacing={1.5} alignItems="center">
						<BusinessIcon sx={{ color: '#ff9900' }} />
						<Typography variant="h6" sx={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
							{company ? 'Edit Company' : 'Create New Company'}
						</Typography>
					</Stack>
					<IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Stack>
			</DialogTitle>

			<Box component="form" onSubmit={handleSubmit}>
				<DialogContent sx={{ p: 4, bgcolor: '#f2f3f3' }}>
					<Stack spacing={3}>
						<Paper elevation={0} sx={awsPanelStyle}>
							<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
								<InfoIcon sx={{ color: '#545b64', fontSize: 20 }} />
								<Typography sx={sectionTitleStyle}>Basic Information</Typography>
							</Stack>
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, md: 8 }}>
									<TextField
										required
										fullWidth
										label="Company Name"
										value={formData.name}
										onChange={(e) => handleChange('name', e.target.value)}
										variant="outlined"
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 4 }}>
									<FormControl fullWidth size="small">
										<InputLabel>Status</InputLabel>
										<Select
											value={formData.status}
											label="Status"
											onChange={(e) => handleChange('status', e.target.value)}
											sx={{ borderRadius: '2px' }}
										>
											{COMPANY_STATUSES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
										</Select>
									</FormControl>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="Industry"
										value={formData.industry}
										onChange={(e) => handleChange('industry', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<FormControl fullWidth size="small">
										<InputLabel>Company Size</InputLabel>
										<Select
											value={formData.company_size}
											label="Company Size"
											onChange={(e) => handleChange('company_size', e.target.value)}
											sx={{ borderRadius: '2px' }}
										>
											{COMPANY_SIZES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
										</Select>
									</FormControl>
								</Grid>
							</Grid>
						</Paper>

						<Paper elevation={0} sx={awsPanelStyle}>
							<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
								<EmailIcon sx={{ color: '#545b64', fontSize: 20 }} />
								<Typography sx={sectionTitleStyle}>Contact Details</Typography>
							</Stack>
							<Grid container spacing={3}>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="Work Email"
										type="email"
										value={formData.email}
										onChange={(e) => handleChange('email', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="Phone Number"
										value={formData.phone}
										onChange={(e) => handleChange('phone', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12 }}>
									<TextField
										fullWidth
										label="Website"
										value={formData.website}
										onChange={(e) => handleChange('website', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
							</Grid>
						</Paper>

						<Paper elevation={0} sx={awsPanelStyle}>
							<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
								<LocationIcon sx={{ color: '#545b64', fontSize: 20 }} />
								<Typography sx={sectionTitleStyle}>Headquarters Address</Typography>
							</Stack>
							<Grid container spacing={3}>
								<Grid size={{ xs: 12 }}>
									<TextField
										fullWidth
										label="Street Address"
										value={formData.address?.street}
										onChange={(e) => handleChange('address.street', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="City"
										value={formData.address?.city}
										onChange={(e) => handleChange('address.city', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="State / Province"
										value={formData.address?.state}
										onChange={(e) => handleChange('address.state', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="Country"
										value={formData.address?.country}
										onChange={(e) => handleChange('address.country', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
								<Grid size={{ xs: 12, md: 6 }}>
									<TextField
										fullWidth
										label="Pincode"
										value={formData.address?.pincode}
										onChange={(e) => handleChange('address.pincode', e.target.value)}
										size="small"
										sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
									/>
								</Grid>
							</Grid>
						</Paper>
					</Stack>
				</DialogContent>

				<DialogActions sx={{ p: 3, bgcolor: '#ffffff', borderTop: '1px solid #d5dbdb' }}>
					<Button
						onClick={onClose}
						sx={{
							color: '#16191f',
							textTransform: 'none',
							fontWeight: 700,
							px: 3
						}}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={loading || !formData.name}
						sx={{
							bgcolor: '#ec7211',
							color: '#ffffff',
							px: 4,
							py: 1,
							fontWeight: 700,
							borderRadius: '2px',
							textTransform: 'none',
							border: '1px solid #ec7211',
							'&:hover': { bgcolor: '#eb5f07', borderColor: '#eb5f07' },
							boxShadow: 'none'
						}}
					>
						{loading ? 'Saving...' : (company ? 'Update Company' : 'Create Company')}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
};

export default CompanyFormDialog;
