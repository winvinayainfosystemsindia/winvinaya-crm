import React from 'react';
import {
	Typography,
	Stack,
	Grid,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Paper
} from '@mui/material';
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
	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		mb: 2,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	const awsPanelStyle = {
		border: '1px solid #d5dbdb',
		borderRadius: '2px',
		p: 3,
		bgcolor: '#ffffff'
	};

	return (
		<Stack spacing={3}>
			<Paper elevation={0} sx={awsPanelStyle}>
				<Typography sx={sectionTitleStyle}>General Information</Typography>
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, md: 4 }}>
						<FormControl fullWidth size="small">
							<InputLabel>Status</InputLabel>
							<Select
								value={formData.status || 'pending'}
								label="Status"
								onChange={(e) => onFieldChange('status', e.target.value)}
								sx={{ borderRadius: '2px' }}
							>
								<MenuItem value="pending">In Progress</MenuItem>
								<MenuItem value="selected">Selected</MenuItem>
								<MenuItem value="rejected">Rejected</MenuItem>
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</Paper>

			<Paper elevation={0} sx={awsPanelStyle}>
				<DynamicFieldRenderer
					fields={dynamicFields}
					formData={formData.others}
					onUpdateField={onUpdateOtherField}
					sectionTitle="Additional Counseling Details"
				/>
			</Paper>
		</Stack>
	);
};

export default CounselingInfoTab;
