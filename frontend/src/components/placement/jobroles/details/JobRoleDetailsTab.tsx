import React from 'react';
import { Grid, Paper, Box, Stack, Typography, Link, Divider, Avatar } from '@mui/material';
import {
	Description as DescriptionIcon,
	Assignment as RequirementsIcon,
	Info as OverviewIcon,
	Person as PersonIcon,
	Business as BusinessIcon,
	EmailOutlined as EmailOutlinedIcon,
	PhoneOutlined as PhoneOutlinedIcon,
	LocationOn as LocationIcon,
	BadgeOutlined as BadgeIcon,
	Schedule as ScheduleIcon,
	PaymentsOutlined as SalaryIcon
} from '@mui/icons-material';
import { InfoRow, SectionHeader } from './DetailedViewCommon';
import type { JobRole } from '../../../../models/jobRole';

interface JobRoleDetailsTabProps {
	jobRole: JobRole;
}

const JobRoleDetailsTab: React.FC<JobRoleDetailsTabProps> = ({ jobRole }) => {
	const formatSalary = () => {
		if (!jobRole.salary_range) return 'N/A';
		const { min, max, currency } = jobRole.salary_range;
		const currencyStr = currency || 'INR';
		if (min && max) return `${currencyStr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
		if (min) return `${currencyStr} ${min.toLocaleString()}+`;
		if (max) return `Up to ${currencyStr} ${max.toLocaleString()}`;
		return 'N/A';
	};

	const formatExperience = () => {
		if (!jobRole.experience) return 'N/A';
		const { min, max } = jobRole.experience;
		if (min !== undefined && max !== undefined) {
			if (min === max) return `${min} Year${min !== 1 ? 's' : ''}`;
			return `${min} - ${max} Years`;
		}
		if (min !== undefined) return `${min}+ Year${min !== 1 ? 's' : ''}`;
		if (max !== undefined) return `Up to ${max} Year${max !== 1 ? 's' : ''}`;
		return 'N/A';
	};

	return (
		<Grid container spacing={3} sx={{ py: 3 }}>
			{/* Left Column: Core Job Details */}
			<Grid size={{ xs: 12, md: 8 }}>
				<Stack spacing={3}>
					{/* Description Section */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderTop: 'none', bgcolor: 'white' }}>
						<SectionHeader title="Description" icon={<DescriptionIcon />} />
						<Typography variant="body1" sx={{ color: '#545b64', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem' }}>
							{jobRole.description || 'No description provided.'}
						</Typography>
					</Paper>

					{/* Requirements Section */}
					<Paper variant="outlined" sx={{ p: 3, borderRadius: 0, borderTop: 'none', bgcolor: 'white' }}>
						<SectionHeader title="Requirements" icon={<RequirementsIcon />} />
						
						<Box sx={{ mb: 4 }}>
							<Typography variant="subtitle2" color="textSecondary" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '0.05em', fontSize: '0.75rem' }}>KEY SKILLS</Typography>
							<Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 1 }}>
								{jobRole.requirements?.skills?.map((skill, index) => (
									<Paper key={index} variant="outlined" sx={{ px: 2, py: 0.75, bgcolor: '#f8f9f9', border: '1px solid #eaeded', borderRadius: '4px' }}>
										<Typography variant="caption" sx={{ fontWeight: 700, color: '#232f3e' }}>{skill}</Typography>
									</Paper>
								)) || <Typography variant="body2" color="textSecondary">No specific skills listed</Typography>}
							</Stack>
						</Box>

						<Grid container spacing={4}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<InfoRow 
									label="Academic Qualifications" 
									value={jobRole.requirements?.qualifications?.join(', ') || 'Any Graduate'} 
								/>
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<InfoRow 
									label="Preferred Disability Types" 
									value={jobRole.requirements?.disability_preferred?.join(', ') || 'Any Disability'} 
								/>
							</Grid>
						</Grid>
					</Paper>
				</Stack>
			</Grid>

			{/* Right Column: Integrated Role Summary Sidebar */}
			<Grid size={{ xs: 12, md: 4 }}>
				<Paper variant="outlined" sx={{ borderRadius: 0, borderTop: 'none', bgcolor: 'white', overflow: 'hidden' }}>
					{/* Sidebar Section 1: Job Overview */}
					<Box sx={{ p: 3 }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<OverviewIcon sx={{ color: '#ec7211', fontSize: 20 }} />
							JOB OVERVIEW
						</Typography>
						
						<Stack spacing={2.5}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={1.5} alignItems="center">
									<BadgeIcon sx={{ color: '#545b64', fontSize: 18 }} />
									<Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Vacancies</Typography>
								</Stack>
								<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{jobRole.no_of_vacancies || '-'}</Typography>
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={1.5} alignItems="center">
									<ScheduleIcon sx={{ color: '#545b64', fontSize: 18 }} />
									<Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Experience</Typography>
								</Stack>
								<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{formatExperience()}</Typography>
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={1.5} alignItems="center">
									<SalaryIcon sx={{ color: '#545b64', fontSize: 18 }} />
									<Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Salary</Typography>
								</Stack>
								<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{formatSalary()}</Typography>
							</Box>

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Stack direction="row" spacing={1.5} alignItems="center">
									<LocationIcon sx={{ color: '#545b64', fontSize: 18 }} />
									<Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Workplace</Typography>
								</Stack>
								<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{jobRole.job_details?.workplace_type || '-'}</Typography>
							</Box>
							
							<Divider sx={{ my: 1, borderColor: '#f2f3f3' }} />

							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>CLOSING DATE</Typography>
								<Typography variant="caption" sx={{ fontWeight: 700, px: 1, py: 0.25, bgcolor: '#fff4e5', color: '#663c00', borderRadius: '4px' }}>
									{jobRole.close_date ? new Date(jobRole.close_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Open'}
								</Typography>
							</Box>
						</Stack>
					</Box>

					<Divider sx={{ bgcolor: '#eaeded' }} />

					{/* Sidebar Section 2: Point of Contact (Business Card Style) */}
					<Box sx={{ p: 3, bgcolor: '#fbfbfb' }}>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
							<PersonIcon sx={{ color: '#ec7211', fontSize: 20 }} />
							POINT OF CONTACT
						</Typography>

						{jobRole.contact ? (
							<Box>
								<Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
									<Avatar sx={{ bgcolor: '#ec7211', width: 40, height: 40 }}>
										{jobRole.contact.first_name[0]}{jobRole.contact.last_name[0]}
									</Avatar>
									<Box>
										<Typography variant="body1" sx={{ fontWeight: 700, color: '#232f3e', lineHeight: 1.2 }}>
											{jobRole.contact.first_name} {jobRole.contact.last_name}
										</Typography>
										<Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
											{jobRole.contact.designation || 'Hiring Manager'}
										</Typography>
									</Box>
								</Stack>

								<Stack spacing={1.5}>
									<Stack direction="row" spacing={1.5} alignItems="center">
										<EmailOutlinedIcon sx={{ color: '#545b64', fontSize: 16 }} />
										<Link 
											href={`mailto:${jobRole.contact.email}`} 
											sx={{ 
												color: '#007eb9', 
												textDecoration: 'none', 
												fontSize: '0.875rem', 
												fontWeight: 500,
												wordBreak: 'break-all',
												'&:hover': { textDecoration: 'underline' } 
											}}
										>
											{jobRole.contact.email || 'No email provided'}
										</Link>
									</Stack>

									<Stack direction="row" spacing={1.5} alignItems="center">
										<PhoneOutlinedIcon sx={{ color: '#545b64', fontSize: 16 }} />
										<Typography variant="body2" sx={{ color: '#545b64', fontWeight: 500 }}>
											{jobRole.contact.phone || jobRole.contact.mobile || 'No contact number'}
										</Typography>
									</Stack>

									<Stack direction="row" spacing={1.5} alignItems="center">
										<BusinessIcon sx={{ color: '#545b64', fontSize: 16 }} />
										<Typography variant="body2" sx={{ color: '#232f3e', fontWeight: 600 }}>
											{jobRole.company?.name || 'N/A'}
										</Typography>
									</Stack>
								</Stack>
							</Box>
						) : (
							<Box sx={{ py: 2, textAlign: 'center', bgcolor: '#f2f3f3', borderRadius: '4px' }}>
								<Typography variant="caption" color="textSecondary">
									No contact person assigned
								</Typography>
							</Box>
						)}
					</Box>
				</Paper>
			</Grid>
		</Grid>
	);
};

export default JobRoleDetailsTab;
