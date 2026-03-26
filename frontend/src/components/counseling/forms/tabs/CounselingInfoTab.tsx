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
	Divider,
	TextField,
	Chip
} from '@mui/material';
import {
	InfoOutlined as InfoIcon,
	AssignmentIndOutlined as StatusIcon,
	LabelOutlined as TagIcon,
	CommentOutlined as RemarkIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import DynamicFieldRenderer from '../../../common/DynamicFieldRenderer';
import type { DynamicField } from '../../../../services/settingsService';

import type { CandidateCounselingCreate } from '../../../../models/candidate';

interface CounselingInfoTabProps {
	formData: CandidateCounselingCreate;
	onFieldChange: (field: string, value: unknown) => void;
	onUpdateOtherField: (name: string, value: unknown) => void;
	dynamicFields: DynamicField[];
	batchTags: string[];
	userRole?: string;
	showErrors?: boolean;
}

const CounselingInfoTab: React.FC<CounselingInfoTabProps> = ({
	formData,
	onFieldChange,
	onUpdateOtherField,
	dynamicFields,
	batchTags,
	userRole,
	showErrors = false
}) => {
	const { sectionTitle, awsPanel, fieldLabel, helperBox } = awsStyles;
	const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'sourcing';

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

			{/* Assignment & Remarks Section (Manager/Admin Only) */}
			{isManagerOrAdmin && (
				<Paper elevation={0} sx={awsPanel}>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
						<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
							<RemarkIcon sx={{ color: '#ffffff', fontSize: 20 }} />
						</Box>
						<Typography sx={sectionTitle}>Assignment & Instructions</Typography>
					</Stack>

					<Grid container spacing={4}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Box>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
									<TagIcon sx={{ fontSize: 16, color: '#ec7211' }} />
									<Typography sx={fieldLabel}>Assigned to</Typography>
								</Stack>
								<FormControl fullWidth size="small">
									<Select
										multiple
										value={formData.assigned_to || []}
										onChange={(e) => onFieldChange('assigned_to', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
										displayEmpty
										renderValue={(selected) => {
											if (!selected || (selected as string[]).length === 0) {
												return <Typography variant="body2" sx={{ color: '#879596' }}>Not Assigned</Typography>;
											}
											return (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{(selected as string[]).map((value) => (
														<Chip 
															key={value} 
															label={value} 
															size="small" 
															sx={{ 
																bgcolor: '#ec7211', 
																color: '#ffffff',
																height: 20,
																fontSize: '0.75rem',
																borderRadius: '2px'
															}} 
														/>
													))}
												</Box>
											);
										}}
										sx={{
											borderRadius: '2px',
											bgcolor: '#fcfcfc',
											'& .MuiOutlinedInput-notchedOutline': { borderColor: '#d5dbdb' },
											'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#879596' },
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ec7211' }
										}}
									>
										{batchTags.map(tag => (
											<MenuItem key={tag} value={tag}>{tag}</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Grid>

						{(!formData.assigned_to || formData.assigned_to.length === 0) && (
							<Grid size={{ xs: 12, md: 6 }}>
								<Box>
									<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
										<RemarkIcon sx={{ fontSize: 16, color: '#ec7211' }} />
										<Typography sx={fieldLabel}>Remarks / Instruction</Typography>
									</Stack>
									<TextField
										fullWidth
										size="small"
										multiline
										rows={2}
										value={formData.remarks || ''}
										onChange={(e) => onFieldChange('remarks', e.target.value)}
										placeholder="Enter remarks or instructions for the candidate..."
										error={showErrors && !formData.remarks}
										helperText={(showErrors && !formData.remarks) ? "Please type the remark or instruction if not assigned" : ""}
										sx={{
											'& .MuiInputBase-root': {
												borderRadius: '2px',
												bgcolor: '#fcfcfc',
											},
											'& .MuiOutlinedInput-notchedOutline': { borderColor: '#d5dbdb' },
											'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#879596' },
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ec7211' }
										}}
									/>
								</Box>
							</Grid>
						)}
					</Grid>
				</Paper>
			)}

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
