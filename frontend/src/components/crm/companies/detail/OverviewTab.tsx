import React from 'react';
import {
	Box,
	Typography,
	Stack,
	Grid,
	Paper,
	Link
} from '@mui/material';
import {
	Language as WebsiteIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	LocationOn as LocationIcon,
	People as PeopleIcon,
	Assignment as LeadIcon,
	MonetizationOn as DealIcon
} from '@mui/icons-material';
import CRMStatsCard from '../../common/CRMStatsCard';
import type { Company } from '../../../../models/company';

interface OverviewTabProps {
	company: Company;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ company }) => {
	return (
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
							{company.social_media && Object.entries(company.social_media as Record<string, any>).map(([platform, url]) => (
								<Grid key={platform} size={{ xs: 12, sm: 6 }}>
									<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{platform}</Typography>
									<Typography variant="body2" sx={{ fontWeight: 600, color: '#007eb9', mt: 0.5 }}>
										{String(url)}
									</Typography>
								</Grid>
							))}
							{(!company.social_media || Object.keys(company.social_media).length === 0) && (
								<Typography variant="body2" sx={{ px: 3, color: '#545b64', fontStyle: 'italic' }}>
									No social media profiles linked.
								</Typography>
							)}
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
						value={company.leads?.filter((l: any) => l.lead_status !== 'lost').length || 0}
						icon={<LeadIcon sx={{ color: '#ff9900' }} />}
					/>
					<CRMStatsCard
						label="Total Deal Value"
						value={`₹${(company.deals?.reduce((sum: number, d: any) => sum + Number(d.deal_value), 0) || 0).toLocaleString()}`}
						icon={<DealIcon sx={{ color: '#1d8102' }} />}
					/>
				</Stack>
			</Grid>
		</Grid>
	);
};

export default OverviewTab;
