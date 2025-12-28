import React from 'react';
import { Grid, Paper, Box } from '@mui/material';
import {
	Person as PersonIcon,
	AccessibilityNew as AccessibilityIcon,
	FamilyRestroom as FamilyIcon,
	School as SchoolIcon,
	Email as EmailIcon,
	Phone as PhoneIcon,
	WhatsApp as WhatsAppIcon,
	Male as MaleIcon,
	Female as FemaleIcon,
	Transgender as TransgenderIcon,
	Cake as CakeIcon,
	LocationOn as LocationIcon
} from '@mui/icons-material';
import { InfoRow, SectionHeader } from './DetailedViewCommon';
import type { Candidate } from '../../../models/candidate';

interface GeneralInfoTabProps {
	candidate: Candidate;
}

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ candidate }) => {
	const getGenderIcon = (gender: string) => {
		const g = gender?.toLowerCase();
		if (g === 'male') return <MaleIcon sx={{ fontSize: 16 }} />;
		if (g === 'female') return <FemaleIcon sx={{ fontSize: 16 }} />;
		return <TransgenderIcon sx={{ fontSize: 16 }} />;
	};

	return (
		<Grid container spacing={3}>
			<Grid size={{ xs: 12, md: 8 }}>
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 0,
						border: '1px solid #d5dbdb',
						boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
					}}
				>
					<SectionHeader title="Basic Details" icon={<PersonIcon />} />
					<Grid container spacing={3}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<InfoRow label="Full Name" value={candidate.name} />
							<InfoRow label="Email Address" value={candidate.email} icon={<EmailIcon sx={{ fontSize: 16 }} />} />
							<InfoRow label="Phone Number" value={candidate.phone} icon={<PhoneIcon sx={{ fontSize: 16 }} />} />
							<InfoRow label="WhatsApp" value={candidate.whatsapp_number} icon={<WhatsAppIcon sx={{ fontSize: 16 }} />} />
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<InfoRow label="Gender" value={candidate.gender} icon={getGenderIcon(candidate.gender)} />
							<InfoRow label="Date of Birth" value={candidate.dob} icon={<CakeIcon sx={{ fontSize: 16 }} />} />
							<InfoRow label="Pincode" value={candidate.pincode} />
							<InfoRow label="Location" value={`${candidate.city}, ${candidate.state}`} icon={<LocationIcon sx={{ fontSize: 16 }} />} />
						</Grid>
					</Grid>

					<Box sx={{ my: 4 }}>
						<SectionHeader title="Disability Information" icon={<AccessibilityIcon />} />
						<Grid container spacing={3}>
							<Grid size={{ xs: 12, sm: 6 }}>
								<InfoRow label="Is Disabled" value={candidate.disability_details?.is_disabled ? 'Yes' : 'No'} />
								<InfoRow label="Disability Type" value={candidate.disability_details?.disability_type} />
							</Grid>
							<Grid size={{ xs: 12, sm: 6 }}>
								<InfoRow label="Percentage" value={candidate.disability_details?.disability_percentage ? `${candidate.disability_details.disability_percentage}%` : '-'} />
							</Grid>
						</Grid>
					</Box>
				</Paper>
			</Grid>

			<Grid size={{ xs: 12, md: 4 }}>
				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 0,
						border: '1px solid #d5dbdb',
						mb: 3,
						boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
					}}
				>
					<SectionHeader title="Guardian Details" icon={<FamilyIcon />} />
					<InfoRow label="Parent/Guardian Name" value={candidate.guardian_details?.parent_name} />
					<InfoRow label="Relationship" value={candidate.guardian_details?.relationship} />
					<InfoRow label="Contact Number" value={candidate.guardian_details?.parent_phone} icon={<PhoneIcon sx={{ fontSize: 16 }} />} />
				</Paper>

				<Paper
					variant="outlined"
					sx={{
						p: 3,
						borderRadius: 0,
						border: '1px solid #d5dbdb',
						boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)'
					}}
				>
					<SectionHeader title="Education & Experience" icon={<SchoolIcon />} />
					<InfoRow label="Work Experience" value={candidate.work_experience?.is_experienced ? 'Experienced' : 'Fresher'} />
					<InfoRow label="Currently Employed" value={candidate.work_experience?.currently_employed ? 'Yes' : 'No'} />
				</Paper>
			</Grid>
		</Grid>
	);
};

export default GeneralInfoTab;
