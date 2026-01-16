import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Container,
	Typography,
	Stack,
	Button,
	Grid,
	Paper,
	Tabs,
	Tab,
	IconButton,
	Breadcrumbs,
	Link
} from '@mui/material';
import {
	ArrowBack as ArrowBackIcon,
	Edit as EditIcon,
	Business as BusinessIcon,
	Language as WebsiteIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	LocationOn as LocationIcon,
	People as PeopleIcon,
	Assignment as LeadIcon,
	MonetizationOn as DealIcon,
	MoreVert as MoreIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCompanyById, updateCompany } from '../../store/slices/companySlice';
import CRMStatusBadge from '../../components/crm/common/CRMStatusBadge';
import CRMStatsCard from '../../components/crm/common/CRMStatsCard';
import CRMTable from '../../components/crm/common/CRMTable';
import CompanyFormDialog from '../../components/crm/companies/CompanyFormDialog';
import { useSnackbar } from 'notistack';
import type { CompanyUpdate } from '../../models/company';

const CompanyDetail: React.FC = () => {
	const { publicId } = useParams<{ publicId: string }>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { enqueueSnackbar } = useSnackbar();
	const { selectedCompany: company, loading } = useAppSelector((state) => state.companies);

	const [tabIndex, setTabIndex] = useState(0);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [formLoading, setFormLoading] = useState(false);

	useEffect(() => {
		if (publicId) {
			dispatch(fetchCompanyById(publicId));
		}
	}, [publicId, dispatch]);

	const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
		setTabIndex(newValue);
	};

	const handleEditSubmit = async (data: any) => {
		if (!publicId) return;
		setFormLoading(true);
		try {
			await dispatch(updateCompany({ publicId, company: data as CompanyUpdate })).unwrap();
			enqueueSnackbar('Company updated successfully', { variant: 'success' });
			setEditDialogOpen(false);
			dispatch(fetchCompanyById(publicId));
		} catch (error: any) {
			enqueueSnackbar(error || 'Failed to update company', { variant: 'error' });
		} finally {
			setFormLoading(false);
		}
	};

	if (loading && !company) {
		return <Box sx={{ p: 4, textAlign: 'center' }}>Loading company details...</Box>;
	}

	if (!company) {
		return (
			<Container sx={{ py: 8, textAlign: 'center' }}>
				<Typography variant="h5" color="textSecondary">Company not found</Typography>
				<Button
					variant="text"
					startIcon={<ArrowBackIcon />}
					onClick={() => navigate('/crm/companies')}
					sx={{ mt: 2 }}
				>
					Back to Companies
				</Button>
			</Container>
		);
	}

	const contactColumns = [
		{
			id: 'name',
			label: 'Full Name',
			minWidth: 150,
			format: (_: any, row: any) => (
				<Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
					{row.first_name} {row.last_name}
				</Typography>
			)
		},
		{ id: 'designation', label: 'Designation', minWidth: 150 },
		{ id: 'email', label: 'Email', minWidth: 200 },
		{ id: 'mobile', label: 'Mobile', minWidth: 120 },
		{
			id: 'is_primary',
			label: 'Primary',
			minWidth: 100,
			format: (val: boolean) => val ? <CRMStatusBadge label="Primary" status="active" /> : '-'
		}
	];

	return (
		<Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 }}>
			{/* Header Section */}
			<Box sx={{ bgcolor: 'white', borderBottom: '1px solid #d5dbdb', pt: 3, px: 4 }}>
				<Breadcrumbs sx={{ mb: 2, '& .MuiBreadcrumbs-li': { fontSize: '0.85rem' } }}>
					<Link
						underline="hover"
						color="inherit"
						href="/crm/companies"
						onClick={(e) => { e.preventDefault(); navigate('/crm/companies'); }}
					>
						Companies
					</Link>
					<Typography color="text.primary" sx={{ fontSize: '0.85rem' }}>{company.name}</Typography>
				</Breadcrumbs>

				<Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
					<Stack direction="row" spacing={2.5} alignItems="center">
						<Box sx={{
							width: 56,
							height: 56,
							bgcolor: 'rgba(0, 126, 185, 0.05)',
							borderRadius: '4px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px solid rgba(0, 126, 185, 0.3)'
						}}>
							<BusinessIcon sx={{ color: '#007eb9', fontSize: 32 }} />
						</Box>
						<Box>
							<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
								<Typography variant="h4" sx={{ fontWeight: 300, color: '#232f3e' }}>
									{company.name}
								</Typography>
								<CRMStatusBadge label={company.status} status={company.status} type="company" />
							</Stack>
							<Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
								{company.industry || 'No industry defined'} • {company.company_size || 'Unknown size'}
							</Typography>
						</Box>
					</Stack>

					<Stack direction="row" spacing={1.5}>
						<Button
							variant="outlined"
							startIcon={<EditIcon />}
							onClick={() => setEditDialogOpen(true)}
							sx={{
								color: '#545b64',
								borderColor: '#d5dbdb',
								textTransform: 'none',
								fontWeight: 700,
								borderRadius: '2px',
								'&:hover': { bgcolor: '#f2f3f3', borderColor: '#eaeded' }
							}}
						>
							Edit Company
						</Button>
						<IconButton size="small" sx={{ border: '1px solid #d5dbdb', borderRadius: '2px' }}>
							<MoreIcon fontSize="small" />
						</IconButton>
					</Stack>
				</Stack>

				<Tabs
					value={tabIndex}
					onChange={handleTabChange}
					sx={{
						'& .MuiTabs-indicator': { bgcolor: '#007eb9', height: 3 },
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 700,
							minWidth: 120,
							fontSize: '0.95rem',
							color: '#545b64',
							pb: 2,
							'&.Mui-selected': { color: '#007eb9' }
						}
					}}
				>
					<Tab label="Overview" />
					<Tab label="Contacts" />
					<Tab label="Leads" />
					<Tab label="Deals" />
				</Tabs>
			</Box>

			<Container maxWidth="xl" sx={{ py: 4 }}>
				{tabIndex === 0 && (
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, md: 8 }}>
							<Stack spacing={3}>
								{/* Basic Info Card */}
								<Paper sx={{ p: 4, borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
									<Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#232f3e' }}>
										Company Information
									</Typography>
									<Grid container spacing={4}>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Stack spacing={2}>
												<Box>
													<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Website</Typography>
													<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
														<WebsiteIcon sx={{ fontSize: 16, color: '#007eb9' }} />
														{company.website ? (
															<Link href={company.website} target="_blank" underline="hover" sx={{ fontWeight: 600, color: '#007eb9' }}>
																{company.website}
															</Link>
														) : <Typography variant="body2">-</Typography>}
													</Stack>
												</Box>
												<Box>
													<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Email</Typography>
													<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
														<EmailIcon sx={{ fontSize: 16, color: '#545b64' }} />
														<Typography variant="body2" sx={{ fontWeight: 600 }}>{company.email || '-'}</Typography>
													</Stack>
												</Box>
											</Stack>
										</Grid>
										<Grid size={{ xs: 12, sm: 6 }}>
											<Stack spacing={2}>
												<Box>
													<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Phone</Typography>
													<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
														<PhoneIcon sx={{ fontSize: 16, color: '#545b64' }} />
														<Typography variant="body2" sx={{ fontWeight: 600 }}>{company.phone || '-'}</Typography>
													</Stack>
												</Box>
												<Box>
													<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Address</Typography>
													<Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 0.5 }}>
														<LocationIcon sx={{ fontSize: 16, color: '#545b64', mt: 0.3 }} />
														<Typography variant="body2" sx={{ fontWeight: 600 }}>
															{company.address?.street ? `${company.address.street}, ${company.address.city}, ${company.address.state} ${company.address.zip_code}` : 'No address provided'}
														</Typography>
													</Stack>
												</Box>
											</Stack>
										</Grid>
									</Grid>
								</Paper>

								{/* Additional Details */}
								<Paper sx={{ p: 4, borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
									<Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3, color: '#232f3e' }}>
										Social Media & Additional Data
									</Typography>
									<Grid container spacing={3}>
										{company.social_media && Object.entries(company.social_media).map(([platform, url]) => (
											<Grid key={platform} size={{ xs: 12, sm: 6 }}>
												<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{platform}</Typography>
												<Typography variant="body2" sx={{ fontWeight: 600, color: '#007eb9', mt: 0.5 }}>
													{String(url)}
												</Typography>
											</Grid>
										))}
										{!company.social_media && <Typography variant="body2" sx={{ px: 3 }}>No social media profiles linked.</Typography>}
									</Grid>
								</Paper>
							</Stack>
						</Grid>

						<Grid size={{ xs: 12, md: 4 }}>
							<Stack spacing={3}>
								<CRMStatsCard
									label="Associated Contacts"
									value={company.contacts?.length || 0}
									icon={<PeopleIcon sx={{ color: '#007eb9' }} />}
								/>
								<CRMStatsCard
									label="Active Leads"
									value={0} // Placeholder for now
									icon={<LeadIcon sx={{ color: '#ff9900' }} />}
								/>
								<CRMStatsCard
									label="Total Deal Value"
									value="₹0" // Placeholder for now
									icon={<DealIcon sx={{ color: '#1d8102' }} />}
								/>
							</Stack>
						</Grid>
					</Grid>
				)}

				{tabIndex === 1 && (
					<Paper sx={{ borderRadius: '2px', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.3), 1px 1px 1px 0 rgba(0,28,36,0.15), -1px 1px 1px 0 rgba(0,28,36,0.15)' }}>
						<Box sx={{ p: 3, borderBottom: '1px solid #eaeded', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#232f3e' }}>
								Contacts ({company.contacts?.length || 0})
							</Typography>
							<Button
								variant="contained"
								sx={{ bgcolor: '#007eb9', color: 'white', '&:hover': { bgcolor: '#006a9e' }, textTransform: 'none', fontWeight: 800 }}
								onClick={() => navigate('/crm/contacts')}
							>
								Add New Contact
							</Button>
						</Box>
						<CRMTable
							columns={contactColumns}
							rows={company.contacts || []}
							total={company.contacts?.length || 0}
							page={0}
							rowsPerPage={100}
							onPageChange={() => { }}
							onRowsPerPageChange={() => { }}
							emptyMessage="No contacts associated with this company."
						/>
					</Paper>
				)}

				{tabIndex === 2 && (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<Typography color="textSecondary">Lead history will be displayed here.</Typography>
					</Box>
				)}

				{tabIndex === 3 && (
					<Box sx={{ p: 4, textAlign: 'center' }}>
						<Typography color="textSecondary">Deal opportunities will be displayed here.</Typography>
					</Box>
				)}
			</Container>

			<CompanyFormDialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				onSubmit={handleEditSubmit}
				company={company}
				loading={formLoading}
			/>
		</Box>
	);
};

export default CompanyDetail;
