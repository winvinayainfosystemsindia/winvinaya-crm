import React from 'react';
import { Paper, Grid, Typography, Chip, Box, Button, Stack, Divider } from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	AssignmentInd as AssignmentIndIcon,
	HistoryEdu as TrainingIcon,
	VerifiedUser as VerifiedIcon,
	Autorenew as InProgressIcon,
	Schedule as FollowUpIcon,
	HighlightOff as NotAnsweredIcon,
	Info as DefaultIcon,
	Event as EventIcon,
	Person as PersonIcon,
	FamilyRestroom as FamilyIcon,
	Paid as PaidIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { InfoRow, SectionHeader } from './DetailedViewCommon';
import type { Candidate } from '../../../models/candidate';

interface ScreeningTabProps {
	candidate: Candidate;
}

const BooleanStatus: React.FC<{ value: boolean | string | undefined }> = ({ value }) => {
	const isTrue = value === true || value === 'true';
	return (
		<Stack direction="row" spacing={1} alignItems="center">
			{isTrue ? (
				<CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 18 }} />
			) : (
				<CancelIcon sx={{ color: '#d32f2f', fontSize: 18 }} />
			)}
			<Typography variant="body2" sx={{ fontWeight: 500, color: isTrue ? '#2e7d32' : '#d32f2f' }}>
				{isTrue ? 'Verified / Yes' : 'Pending / No'}
			</Typography>
		</Stack>
	);
};

const ScreeningTab: React.FC<ScreeningTabProps> = ({ candidate }) => {
	const navigate = useNavigate();
	const { screening } = candidate;

	if (!screening) {
		return (
			<Paper
				variant="outlined"
				sx={{
					p: 4,
					borderRadius: 0,
					border: '1px solid #d5dbdb',
					textAlign: 'center',
					boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
				}}
			>
				<SectionHeader title="Screening Assessment" icon={<AssignmentIndIcon />} />
				<Box sx={{ py: 6 }}>
					<AssignmentIndIcon sx={{ fontSize: 80, color: '#eaeded', mb: 2 }} />
					<Typography variant="h6" color="#545b64" sx={{ mb: 1 }}>Pending Screening</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						The screening assessment has not been completed for this candidate.
					</Typography>
					<Button
						variant="contained"
						sx={{ bgcolor: '#ec7211', '&:hover': { bgcolor: '#eb5f07' }, textTransform: 'none', px: 4 }}
						onClick={() => navigate('/candidates/screening')}
					>
						Submit Assessment
					</Button>
				</Box>
			</Paper>
		);
	}

	const formatDate = (dateStr: string | undefined) => {
		if (!dateStr) return '-';
		try {
			return format(new Date(dateStr), 'dd MMM yyyy HH:mm');
		} catch (e) {
			return dateStr;
		}
	};

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 3,
				borderRadius: 0,
				border: '1px solid #d5dbdb',
				boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
			}}
		>
			<SectionHeader title="Screening Assessment" icon={<AssignmentIndIcon />}>
				<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
					{screening.status && (
						<Chip
							label={screening.status.toUpperCase()}
							size="small"
							icon={
								screening.status === 'Completed' ? <CheckCircleIcon /> :
									screening.status === 'Not Connected' || screening.status === 'Not Answered' ? <NotAnsweredIcon /> :
										screening.status === 'In Progress' ? <InProgressIcon /> :
											screening.status === 'Follow-up Required' ? <FollowUpIcon /> :
												<DefaultIcon />
							}
							sx={{
								fontWeight: 700,
								borderRadius: 1,
								bgcolor:
									screening.status === 'Completed' ? '#2e7d32' :
										screening.status === 'Not Connected' || screening.status === 'Not Answered' ? '#d32f2f' :
											screening.status === 'In Progress' ? '#1976d2' :
												screening.status === 'Follow-up Required' ? '#ed6c02' :
													'#757575',
								color: '#ffffff',
								'& .MuiChip-icon': {
									color: 'inherit',
									fontSize: 16
								}
							}}
						/>
					)}
				</Box>
			</SectionHeader>

			<Grid container spacing={4}>
				<Grid size={{ xs: 12, md: 6 }}>
					{/* Screening Metadata */}
					<Box sx={{ mb: 4 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
							<VerifiedIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
								Screening Metadata
							</Typography>
						</Box>
						<Box sx={{ pl: 1 }}>
							<InfoRow
								label="Screened By"
								icon={<PersonIcon sx={{ fontSize: 16 }} />}
								value={screening.screened_by?.full_name || screening.screened_by?.username || 'Not Recorded'}
							/>
							<InfoRow
								label="Screened Date"
								icon={<EventIcon sx={{ fontSize: 16 }} />}
								value={formatDate(screening.created_at)}
							/>
							<InfoRow
								label="Last Updated"
								icon={<EventIcon sx={{ fontSize: 16 }} />}
								value={formatDate(screening.updated_at)}
							/>
						</Box>
					</Box>

					<Divider sx={{ mb: 4 }} />

					{/* Skills section */}
					<Box sx={{ mb: 4 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
							<TrainingIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
								Skills & Experience Profile
							</Typography>
						</Box>
						<Box sx={{ pl: 1 }}>
							<InfoRow
								label="WinVinaya Heritage"
								value={<BooleanStatus value={screening.previous_training?.is_winvinaya_student} />}
							/>
							<InfoRow
								label="Prior External Training"
								value={<BooleanStatus value={screening.previous_training?.attended_any_training} />}
							/>
							{screening.previous_training?.training_details && (
								<InfoRow label="Training Specifics" value={screening.previous_training.training_details} />
							)}

							<Divider sx={{ my: 3, borderStyle: 'dashed' }} />

							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
								Technical Competencies
							</Typography>
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
								{(screening.skills?.technical_skills?.length ?? 0) > 0 ? (
									screening.skills?.technical_skills?.map((skill: string, idx: number) => (
										<Chip key={idx} label={skill} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 500 }} />
									))
								) : (
									<Typography variant="body2" color="text.secondary">None specified</Typography>
								)}
							</Stack>

							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
								Interpersonal Skills
							</Typography>
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								{(screening.skills?.soft_skills?.length ?? 0) > 0 ? (
									screening.skills?.soft_skills?.map((skill: string, idx: number) => (
										<Chip key={idx} label={skill} size="small" variant="outlined" sx={{ borderRadius: 1, fontWeight: 500 }} />
									))
								) : (
									<Typography variant="body2" color="text.secondary">None specified</Typography>
								)}
							</Stack>
						</Box>
					</Box>
				</Grid>

				<Grid size={{ xs: 12, md: 6 }}>
					{/* Documentation section */}
					<Box sx={{ mb: 4 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
							<VerifiedIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
								Documentation Status
							</Typography>
						</Box>
						<Box sx={{ pl: 1 }}>
							<InfoRow
								label="Resume / CV"
								value={<BooleanStatus value={screening.documents_upload?.resume} />}
							/>
							<InfoRow
								label="Disability Documentation"
								value={<BooleanStatus value={screening.documents_upload?.disability_certificate} />}
							/>
							<InfoRow
								label="Academic Certificates"
								value={<BooleanStatus value={screening.documents_upload?.degree_qualification} />}
							/>
						</Box>
					</Box>

					<Divider sx={{ mb: 4 }} />

					{/* Logistics & Financials Section */}
					<Box sx={{ mb: 4 }}>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
							<PaidIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
								Logistics & Financials
							</Typography>
						</Box>
						<Box sx={{ pl: 1 }}>
							<InfoRow
								label="Where you know about us"
								value={screening.others?.source_of_info}
							/>
							<InfoRow
								label="Family Annual Income"
								value={screening.others?.family_annual_income}
							/>
							<InfoRow
								label="Willing for Training"
								value={<BooleanStatus value={screening.others?.willing_for_training} />}
							/>
							<InfoRow
								label="Relocation Readiness"
								value={<BooleanStatus value={screening.others?.ready_to_relocate} />}
							/>
							<InfoRow
								label="Internal Notes"
								value={screening.others?.comments || 'No internal notes provided'}
							/>
						</Box>
					</Box>

					<Divider sx={{ mb: 4 }} />

					{/* Detailed Family Members Section */}
					<Box>
						<Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
							<FamilyIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
								Family Members Details
							</Typography>
						</Box>
						<Box sx={{ pl: 1 }}>
							{(screening.family_details?.length ?? 0) > 0 ? (
								screening.family_details?.map((family: any, idx: number) => (
									<Box key={idx} sx={{ mb: 2, p: 1.5, bgcolor: '#f8f9fa', border: '1px solid #eaeded', borderRadius: 1 }}>
										<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#ec7211' }}>
											{family.relation}: {family.name}
										</Typography>
										<Grid container spacing={2}>
											<Grid size={{ xs: 6 }}>
												<Typography variant="caption" display="block" color="text.secondary">Phone</Typography>
												<Typography variant="body2">{family.phone || '-'}</Typography>
											</Grid>
											<Grid size={{ xs: 6 }}>
												<Typography variant="caption" display="block" color="text.secondary">Occupation</Typography>
												<Typography variant="body2">{family.occupation || '-'}</Typography>
											</Grid>
											<Grid size={{ xs: 6 }}>
												<Typography variant="caption" display="block" color="text.secondary">Company / Institution</Typography>
												<Typography variant="body2">{family.company_name || '-'}</Typography>
											</Grid>
											<Grid size={{ xs: 6 }}>
												<Typography variant="caption" display="block" color="text.secondary">Position</Typography>
												<Typography variant="body2">{family.position || '-'}</Typography>
											</Grid>
										</Grid>
									</Box>
								))
							) : (
								<Typography variant="body2" color="text.secondary">No family details recorded</Typography>
							)}
						</Box>
					</Box>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default ScreeningTab;
