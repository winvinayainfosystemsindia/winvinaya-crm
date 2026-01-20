import React from 'react';
import {
	Box,
	Container,
	Typography,
	Stack,
	Button,
	IconButton,
	Breadcrumbs,
	Link,
	Divider,
	Chip,
	Paper
} from '@mui/material';
import {
	Edit as EditIcon,
	Language as WebsiteIcon,
	LocationOn as LocationIcon,
	MoreVert as MoreIcon,
	Category as IndustryIcon,
	Groups as TeamIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Company } from '../../../../models/company';

interface CompanyDetailHeaderProps {
	company: Company;
	onEdit: () => void;
	isMobile: boolean;
}

const CompanyDetailHeader: React.FC<CompanyDetailHeaderProps> = ({ company, onEdit, isMobile }) => {
	const navigate = useNavigate();

	return (
		<Box sx={{ bgcolor: '#232f3e', color: 'white', pt: 2, pb: 4, mb: 0 }}>
			<Container maxWidth="xl">
				<Breadcrumbs
					sx={{
						mb: 2,
						'& .MuiBreadcrumbs-li': { fontSize: '0.85rem', color: '#aab7bd' },
						'& .MuiBreadcrumbs-separator': { color: '#aab7bd' }
					}}
				>
					<Link
						underline="hover"
						sx={{ color: '#aab7bd', cursor: 'pointer' }}
						onClick={() => navigate('/crm/companies')}
					>
						Companies
					</Link>
					<Typography sx={{ fontSize: '0.85rem', color: 'white' }}>{company.name}</Typography>
				</Breadcrumbs>

				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
					<Box>
						<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
							<Typography variant="h4" sx={{ fontWeight: 300, letterSpacing: '-0.02em', fontSize: isMobile ? '1.5rem' : '2rem' }}>
								{company.name}
							</Typography>
							<Chip
								label={company.status.toUpperCase()}
								size="small"
								sx={{
									height: 20,
									fontSize: '0.65rem',
									fontWeight: 900,
									bgcolor: company.status === 'active' ? '#1d8102' : '#5f6368',
									color: 'white',
									borderRadius: '2px'
								}}
							/>
						</Stack>
						<Typography variant="body2" sx={{ color: '#aab7bd', maxWidth: 600 }}>
							Detailed organizational profile for {company.name}. Manage contacts, track leads, and monitor active deal flow with precision.
						</Typography>
					</Box>

					<Stack direction="row" spacing={1.5}>
						<Button
							variant="outlined"
							startIcon={<EditIcon />}
							onClick={onEdit}
							sx={{
								color: 'white',
								borderColor: 'rgba(255, 255, 255, 0.3)',
								textTransform: 'none',
								fontWeight: 700,
								borderRadius: '2px',
								'&:hover': {
									bgcolor: 'rgba(255, 255, 255, 0.05)',
									borderColor: 'rgba(255, 255, 255, 0.5)'
								}
							}}
						>
							Edit Company
						</Button>
						<IconButton
							size="small"
							sx={{
								color: 'white',
								border: '1px solid rgba(255, 255, 255, 0.3)',
								borderRadius: '2px'
							}}
						>
							<MoreIcon fontSize="small" />
						</IconButton>
					</Stack>
				</Box>

				{/* Service Plate (Info Ribbon) */}
				<Paper
					elevation={0}
					sx={{
						bgcolor: 'rgba(255, 255, 255, 0.05)',
						borderRadius: '2px',
						p: 2,
						border: '1px solid rgba(255, 255, 255, 0.1)',
						display: 'flex',
						flexWrap: 'wrap',
						gap: 4
					}}
				>
					<Box>
						<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Industry
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<IndustryIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
							<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
								{company.industry || 'N/A'}
							</Typography>
						</Stack>
					</Box>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Size
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<TeamIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
							<Typography variant="body2" sx={{ color: 'white' }}>{company.company_size || 'Unknown'}</Typography>
						</Stack>
					</Box>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Website
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<WebsiteIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
							<Link
								href={company.website}
								target="_blank"
								underline="none"
								sx={{ variant: 'body2', color: '#ff9900', fontWeight: 600, fontSize: '0.875rem' }}
							>
								{company.website?.replace(/^https?:\/\//, '') || 'Not set'}
							</Link>
						</Stack>
					</Box>
					<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
					<Box>
						<Typography variant="caption" sx={{ color: '#aab7bd', display: 'block', mb: 0.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
							Location
						</Typography>
						<Stack direction="row" spacing={1} alignItems="center">
							<LocationIcon sx={{ fontSize: 14, color: '#aab7bd' }} />
							<Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>
								{company.address?.city && company.address?.state ? `${company.address.city}, ${company.address.state}` : 'Not set'}
							</Typography>
						</Stack>
					</Box>
				</Paper>
			</Container>
		</Box>
	);
};

export default CompanyDetailHeader;
