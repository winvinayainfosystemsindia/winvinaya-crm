import React from 'react';
import { Paper, Grid, Typography, Chip, Box, Button, Stack, Divider } from '@mui/material';
import {
	CheckCircle as CheckCircleIcon,
	Cancel as CancelIcon,
	AssignmentInd as AssignmentIndIcon,
	HistoryEdu as TrainingIcon,
	VerifiedUser as VerifiedIcon,
	AddBox as ExtraIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
				<Chip
					icon={<CheckCircleIcon />}
					label="COMPLETED"
					color="success"
					size="small"
					sx={{ fontWeight: 700, borderRadius: 1 }}
				/>
			</SectionHeader>

			<Grid container spacing={4}>
				<Grid size={{ xs: 12, md: 6 }}>
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

							<Divider sx={{ my: 3, borderStyle: 'dashed' }} />

							<Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
								<ExtraIcon sx={{ fontSize: 20, mr: 1, color: '#545b64' }} />
								<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
									Logistics & Comments
								</Typography>
							</Box>
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

							{screening.others && Object.keys(screening.others).filter(k => !['willing_for_training', 'ready_to_relocate', 'comments'].includes(k)).length > 0 && (
								<>
									<Divider sx={{ my: 3, borderStyle: 'dashed' }} />
									<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
										Custom Fields
									</Typography>
									{Object.entries(screening.others)
										.filter(([key]) => !['willing_for_training', 'ready_to_relocate', 'comments'].includes(key))
										.map(([key, value]) => (
											<InfoRow
												key={key}
												label={key.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
												value={Array.isArray(value) ? value.join(', ') : (typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value))}
											/>
										))}
								</>
							)}
						</Box>
					</Box>
				</Grid>
			</Grid>
		</Paper>
	);
};

export default ScreeningTab;
