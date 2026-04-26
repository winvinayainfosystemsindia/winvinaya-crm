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
	AssignmentIndOutlined as StatusIcon,
	LabelOutlined as TagIcon,
	CommentOutlined as RemarkIcon
} from '@mui/icons-material';
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
	const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager' || userRole === 'sourcing';

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: 0.5,
			bgcolor: 'background.paper',
			'& fieldset': { borderColor: 'divider' },
			'&:hover fieldset': { borderColor: 'text.secondary' },
			'&.Mui-focused fieldset': { borderColor: 'primary.main' }
		}
	};

	return (
		<Stack spacing={4}>
			{/* Core Status Section */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
						<StatusIcon sx={{ color: 'common.white', fontSize: 20 }} />
					</Box>
					<Typography variant="awsSectionTitle">Core Counseling Status</Typography>
				</Stack>

				<Divider sx={{ mb: 4 }} />

				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Box>
							<Typography variant="awsFieldLabel">Counseling Status</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={formData.status || 'pending'}
									onChange={(e) => onFieldChange('status', e.target.value)}
									sx={{
										borderRadius: 0.5,
										bgcolor: 'background.paper',
										'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
										'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
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
				<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
						<Box sx={{ bgcolor: 'primary.main', p: 0.5, borderRadius: 0.5, display: 'flex' }}>
							<RemarkIcon sx={{ color: 'common.white', fontSize: 20 }} />
						</Box>
						<Typography variant="awsSectionTitle">Assignment & Instructions</Typography>
					</Stack>

					<Divider sx={{ mb: 4 }} />

					<Grid container spacing={4}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Box>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
									<TagIcon sx={{ fontSize: 16, color: 'primary.main' }} />
									<Typography variant="awsFieldLabel" sx={{ mb: 0 }}>Assigned to</Typography>
								</Stack>
								<FormControl fullWidth size="small">
									<Select
										multiple
										value={formData.assigned_to || []}
										onChange={(e) => onFieldChange('assigned_to', typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
										displayEmpty
										renderValue={(selected) => {
											if (!selected || (selected as string[]).length === 0) {
												return <Typography variant="body2" sx={{ color: 'text.secondary' }}>Not Assigned</Typography>;
											}
											return (
												<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
													{(selected as string[]).map((value) => (
														<Chip 
															key={value} 
															label={value} 
															size="small" 
															sx={{ 
																bgcolor: 'primary.main', 
																color: 'common.white',
																height: 20,
																fontSize: '0.75rem',
																borderRadius: 0.5
															}} 
														/>
													))}
												</Box>
											);
										}}
										sx={{
											borderRadius: 0.5,
											bgcolor: 'background.paper',
											'& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
											'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'text.secondary' },
											'&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
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
										<RemarkIcon sx={{ fontSize: 16, color: 'primary.main' }} />
										<Typography variant="awsFieldLabel" sx={{ mb: 0 }}>Remarks / Instruction</Typography>
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
										sx={inputSx}
									/>
								</Box>
							</Grid>
						)}
					</Grid>
				</Paper>
			)}

			{/* Dynamic Additional Details */}
			<Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 0.5 }}>
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
