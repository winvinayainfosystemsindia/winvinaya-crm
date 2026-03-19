import React from 'react';
import {
	Typography,
	Stack,
	Grid,
	FormControl,
	Select,
	MenuItem,
	Paper,
	Box,
	Divider
} from '@mui/material';
import { InfoOutlined as InfoIcon, AssignmentIndOutlined as StatusIcon } from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import DynamicFieldRenderer from '../../../common/DynamicFieldRenderer';
import type { DynamicField } from '../../../../services/settingsService';

import type { CandidateCounselingCreate } from '../../../../models/candidate';

interface CounselingInfoTabProps {
	formData: CandidateCounselingCreate;
	onFieldChange: (field: string, value: unknown) => void;
	onUpdateOtherField: (name: string, value: unknown) => void;
	dynamicFields: DynamicField[];
}

const CounselingInfoTab: React.FC<CounselingInfoTabProps> = ({
	formData,
	onFieldChange,
	onUpdateOtherField,
	dynamicFields
}) => {
	const { sectionTitle, awsPanel, fieldLabel, helperBox } = awsStyles;

	return (
		<Stack spacing={4}>
			{/* Core Status Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<StatusIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Core Counseling Status</Typography>
				</Stack>

				<Box sx={helperBox}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="body2" sx={{ color: '#007eb9', fontWeight: 500 }}>
						The counseling status reflects the current alignment of the candidate's skills with available training or job opportunities.
					</Typography>
				</Box>

				<Divider sx={{ mb: 4, borderColor: '#eaeded' }} />

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography sx={fieldLabel}>Counseling Status</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={formData.status || 'pending'}
									onChange={(e) => onFieldChange('status', e.target.value)}
									sx={{
										borderRadius: '2px',
										bgcolor: '#fcfcfc',
										'& .MuiOutlinedInput-notchedOutline': { borderColor: '#d5dbdb' },
										'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#879596' },
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ec7211' }
									}}
								>
									<MenuItem value="pending">In Progress</MenuItem>
									<MenuItem value="selected">Selected</MenuItem>
									<MenuItem value="rejected">Rejected</MenuItem>
								</Select>
							</FormControl>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Dynamic Additional Details */}
			<Paper elevation={0} sx={awsPanel}>
				<DynamicFieldRenderer
					fields={dynamicFields}
					formData={formData.others}
					onUpdateField={onUpdateOtherField}
					sectionTitle="Additional Assessment Particulars"
				/>
			</Paper>
		</Stack>
	);
};

export default CounselingInfoTab;
