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
	Paper,
	Divider,
	useTheme,
	Autocomplete
} from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import type { Company, CompanyCreate, CompanyUpdate } from '../../../models/company';
import { COMPANY_SIZES, COMPANY_STATUSES, COMPANY_INDUSTRIES } from '../../../data/companyData';
import { awsStyles } from '../../../theme/theme';

interface CompanyFormDialogProps {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: CompanyCreate | CompanyUpdate) => void;
	company?: Company | null;
	loading?: boolean;
}

const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
	open,
	onClose,
	onSubmit,
	company,
	loading = false
}) => {
	const theme = useTheme();
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
		const timer = setTimeout(() => {
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
		}, 0);
		return () => clearTimeout(timer);
	}, [company, open]);

	const handleChange = (field: string, value: unknown) => {
		if (field.includes('.')) {
			const [parent, child] = field.split('.');
			setFormData(prev => ({
				...prev,
				[parent]: {
					...(prev[parent as keyof typeof prev] as Record<string, unknown>),
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

	const sectionTitleStyle = awsStyles.sectionTitle(theme);
	const awsPanelStyle = awsStyles.awsPanel(theme);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			scroll="paper"
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
					border: `1px solid ${theme.palette.divider}`
				}
			}}
		>
			<DialogTitle sx={{
				bgcolor: theme.palette.secondary.main,
				color: '#ffffff',
				py: 2,
				px: 3,
				borderBottom: `1px solid ${theme.palette.divider}`
			}}>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Box>
						<Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 0.5 }}>
							{company ? 'Edit Company' : 'Create Company'}
						</Typography>
						{company && (
							<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
								ID: {company.public_id || company.id}
							</Typography>
						)}
					</Box>
					<IconButton onClick={onClose} size="small" sx={{ color: '#ffffff', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
						<CloseIcon />
					</IconButton>
				</Stack>
			</DialogTitle>

			<Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
				<DialogContent sx={{
					p: 0,
					bgcolor: theme.palette.background.default,
				}}>
					<Box sx={{ p: 4 }}>
						<Stack spacing={4}>
							<Paper elevation={0} sx={awsPanelStyle}>
								<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
									<InfoIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
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
										<Autocomplete
											fullWidth
											size="small"
											options={COMPANY_INDUSTRIES}
											value={formData.industry || null}
											onChange={(_event, newValue) => handleChange('industry', newValue)}
											onInputChange={() => {
												// Just keep it for filtering for now.
											}}
											renderInput={(params) => (
												<TextField
													{...params}
													label="Industry"
													variant="outlined"
													sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
												/>
											)}
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
								<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
									<EmailIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
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
								<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
									<LocationIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
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
					</Box>
				</DialogContent>

				<Divider sx={{ borderColor: theme.palette.divider }} />
				<DialogActions sx={{ p: 3, px: 4, bgcolor: theme.palette.background.paper, justifyContent: 'flex-end', gap: 2 }}>
					<Button
						onClick={onClose}
						variant="outlined"
						sx={{
							color: theme.palette.text.primary,
							borderColor: theme.palette.divider,
							fontWeight: 700,
							px: 3,
							borderRadius: '2px',
							textTransform: 'none',
							'&:hover': {
								borderColor: theme.palette.text.secondary,
								bgcolor: 'rgba(0,0,0,0.02)'
							}
						}}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={loading || !formData.name}
						sx={{
							px: 4,
							py: 1,
							fontWeight: 700,
							borderRadius: '2px',
							textTransform: 'none',
							boxShadow: 'none'
						}}
					>
						{loading ? 'Saving...' : (company ? 'Save Changes' : 'Create Company')}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	);
};

export default CompanyFormDialog;
