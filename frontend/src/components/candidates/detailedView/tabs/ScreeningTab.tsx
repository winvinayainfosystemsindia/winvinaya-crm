import React from 'react';
import { Grid, Typography, Chip, Box, Button, Stack, Divider, useTheme, alpha } from '@mui/material';
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
import { InfoRow, SectionHeader, SectionCard } from '../DetailedViewCommon';
import type { Candidate } from '../../../../models/candidate';

interface ScreeningTabProps {
	candidate: Candidate;
}

const BooleanStatus: React.FC<{ value: boolean | string | undefined }> = ({ value }) => {
	const isTrue = value === true || value === 'true';
	return (
		<Stack direction="row" spacing={1} alignItems="center">
			{isTrue ? (
				<CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
			) : (
				<CancelIcon sx={{ color: 'error.main', fontSize: 18 }} />
			)}
			<Typography variant="body2" sx={{ fontWeight: 500, color: isTrue ? 'success.main' : 'error.main' }}>
				{isTrue ? 'Verified / Yes' : 'Pending / No'}
			</Typography>
		</Stack>
	);
};

const ScreeningTab: React.FC<ScreeningTabProps> = ({ candidate }) => {
	const theme = useTheme();
	const navigate = useNavigate();
	const { screening } = candidate;

	if (!screening) {
		return (
			<SectionCard sx={{ textAlign: 'center', py: 6 }}>
				<SectionHeader title="Screening Assessment" icon={<AssignmentIndIcon />} />
				<Box sx={{ mt: 4 }}>
					<AssignmentIndIcon sx={{ fontSize: 80, color: 'divider', mb: 2, opacity: 0.5 }} />
					<Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>Pending Screening</Typography>
					<Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
						The screening assessment has not been completed for this candidate yet.
					</Typography>
					<Button
						variant="contained"
						color="primary"
						sx={{ textTransform: 'none', px: 4, fontWeight: 600 }}
						onClick={() => navigate('/candidates/screening')}
					>
						Submit Assessment
					</Button>
				</Box>
			</SectionCard>
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
		<SectionCard>
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
									screening.status === 'Completed' ? 'success.main' :
										screening.status === 'Not Connected' || screening.status === 'Not Answered' ? 'error.main' :
											screening.status === 'In Progress' ? 'primary.main' :
												screening.status === 'Follow-up Required' ? 'warning.main' :
													'text.disabled',
								color: 'common.white',
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
							<VerifiedIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
							<TrainingIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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

							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
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

							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
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
							<VerifiedIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
							<PaidIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
							<FamilyIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
							<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
								Family Members Details
							</Typography>
						</Box>
						<Box sx={{ pl: 1 }}>
							{(screening.family_details?.length ?? 0) > 0 ? (
								screening.family_details?.map((family: any, idx: number) => (
									<Box key={idx} sx={{ mb: 2, p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
										<Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
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
		</SectionCard>
	);
};

export default ScreeningTab;
