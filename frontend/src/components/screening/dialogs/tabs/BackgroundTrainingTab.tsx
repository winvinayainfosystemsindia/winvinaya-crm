import React from 'react';
import {
	Box,
	Typography,
	Stack,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	TextField,
	Checkbox,
	Grid,
	Autocomplete,
	Paper,
	Divider
} from '@mui/material';
import { School as SchoolIcon, Explore as ExploreIcon, Info as InfoIcon } from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';

interface BackgroundTrainingTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
}

const BackgroundTrainingTab: React.FC<BackgroundTrainingTabProps> = ({
	formData,
	onUpdateField
}) => {
	const { sectionTitle, awsPanel, fieldLabel, helperBox } = awsStyles;

	return (
		<Stack spacing={3}>
			{/* Training History Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<SchoolIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Training History</Typography>
				</Stack>

				<Grid container spacing={4}>
					<Grid size={{ xs: 12, md: 6 }}>
						<FormControl component="fieldset">
							<FormLabel sx={fieldLabel}>
								Have you attended any training previously?
							</FormLabel>
							<RadioGroup
								row
								value={formData.previous_training?.attended_any_training ? 'yes' : 'no'}
								onChange={(e) => onUpdateField('previous_training', 'attended_any_training', e.target.value === 'yes')}
							>
								<FormControlLabel
									value="yes"
									control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
									label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Yes</Typography>}
								/>
								<FormControlLabel
									value="no"
									control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
									label={<Typography variant="body2" sx={{ fontWeight: 500 }}>No</Typography>}
								/>
							</RadioGroup>
						</FormControl>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
						<Box
							sx={{
								p: 1.5,
								bgcolor: formData.previous_training?.is_winvinaya_student ? '#fafffa' : '#f8f9fa',
								border: '1px solid',
								borderColor: formData.previous_training?.is_winvinaya_student ? '#cce8c5' : '#eaeded',
								borderRadius: '2px',
								width: '100%',
								transition: 'all 0.2s ease'
							}}
						>
							<FormControlLabel
								control={
									<Checkbox
										size="small"
										checked={formData.previous_training?.is_winvinaya_student}
										onChange={(e) => onUpdateField('previous_training', 'is_winvinaya_student', e.target.checked)}
										sx={{ '&.Mui-checked': { color: '#ec7211' } }}
									/>
								}
								label={<Typography variant="body2" sx={{ fontWeight: 600, color: '#232f3e' }}>Are you a WinVinaya Student?</Typography>}
								sx={{ m: 0, width: '100%' }}
							/>
						</Box>
					</Grid>

					{formData.previous_training?.attended_any_training && (
						<Grid size={{ xs: 12 }}>
							<Typography variant="body2" sx={fieldLabel}>Training Details</Typography>
							<TextField
								placeholder="Mention course name, institute, and duration..."
								fullWidth
								multiline
								rows={2}
								size="small"
								value={formData.previous_training?.training_details}
								onChange={(e) => onUpdateField('previous_training', 'training_details', e.target.value)}
								sx={{
									'& .MuiOutlinedInput-root': {
										borderRadius: '2px',
										bgcolor: '#fcfcfc',
										'& fieldset': { borderColor: '#d5dbdb' },
										'&:hover fieldset': { borderColor: '#879596' },
										'&.Mui-focused fieldset': { borderColor: '#ec7211' }
									}
								}}
							/>
						</Grid>
					)}
				</Grid>
			</Paper>

			{/* Logistics & Readiness Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<ExploreIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Logistics & Readiness</Typography>
				</Stack>

				<Grid container spacing={4}>
					<Grid size={{ xs: 12, md: 6 }}>
						<FormControl component="fieldset">
							<FormLabel sx={fieldLabel}>
								Willing for Training?
							</FormLabel>
							<RadioGroup
								row
								value={formData.others?.willing_for_training ? 'yes' : 'no'}
								onChange={(e) => onUpdateField('others', 'willing_for_training', e.target.value === 'yes')}
							>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Paper
										elevation={0}
										sx={{
											border: '1px solid',
											borderColor: formData.others?.willing_for_training === true ? '#ec7211' : '#d5dbdb',
											bgcolor: formData.others?.willing_for_training === true ? '#fff8f2' : '#ffffff',
											borderRadius: '2px',
											px: 2
										}}
									>
										<FormControlLabel
											value="yes"
											control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
											label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Yes</Typography>}
										/>
									</Paper>
									<Paper
										elevation={0}
										sx={{
											border: '1px solid',
											borderColor: formData.others?.willing_for_training === false ? '#ec7211' : '#d5dbdb',
											bgcolor: formData.others?.willing_for_training === false ? '#fff8f2' : '#ffffff',
											borderRadius: '2px',
											px: 2
										}}
									>
										<FormControlLabel
											value="no"
											control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
											label={<Typography variant="body2" sx={{ fontWeight: 500 }}>No</Typography>}
										/>
									</Paper>
								</Box>
							</RadioGroup>
						</FormControl>
					</Grid>

					<Grid size={{ xs: 12, md: 6 }}>
						<FormControl component="fieldset">
							<FormLabel sx={fieldLabel}>
								Ready to Relocate?
							</FormLabel>
							<RadioGroup
								row
								value={formData.others?.ready_to_relocate ? 'yes' : 'no'}
								onChange={(e) => onUpdateField('others', 'ready_to_relocate', e.target.value === 'yes')}
							>
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Paper
										elevation={0}
										sx={{
											border: '1px solid',
											borderColor: formData.others?.ready_to_relocate === true ? '#ec7211' : '#d5dbdb',
											bgcolor: formData.others?.ready_to_relocate === true ? '#fff8f2' : '#ffffff',
											borderRadius: '2px',
											px: 2
										}}
									>
										<FormControlLabel
											value="yes"
											control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
											label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Yes</Typography>}
										/>
									</Paper>
									<Paper
										elevation={0}
										sx={{
											border: '1px solid',
											borderColor: formData.others?.ready_to_relocate === false ? '#ec7211' : '#d5dbdb',
											bgcolor: formData.others?.ready_to_relocate === false ? '#fff8f2' : '#ffffff',
											borderRadius: '2px',
											px: 2
										}}
									>
										<FormControlLabel
											value="no"
											control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
											label={<Typography variant="body2" sx={{ fontWeight: 500 }}>No</Typography>}
										/>
									</Paper>
								</Box>
							</RadioGroup>
						</FormControl>
					</Grid>

					<Grid size={{ xs: 12 }}>
						<Divider sx={{ my: 1, borderColor: '#eaeded' }} />
					</Grid>

					<Grid size={{ xs: 12 }}>
						<Typography variant="body2" sx={fieldLabel}>
							How did you know about us?
						</Typography>
						<Autocomplete
							freeSolo
							options={['Google', 'LinkedIn', 'V-Shesh', 'Saira', 'Facebook', 'WhatsApp', 'Friends / Referral']}
							value={formData.others?.source_of_info || ''}
							onInputChange={(_event, newValue) => onUpdateField('others', 'source_of_info', newValue)}
							onChange={(_event, newValue) => onUpdateField('others', 'source_of_info', newValue)}
							renderInput={(params) => (
								<TextField
									{...params}
									size="small"
									placeholder="Select or type source"
									sx={{
										'& .MuiOutlinedInput-root': {
											borderRadius: '2px',
											bgcolor: '#fcfcfc',
											'& fieldset': { borderColor: '#d5dbdb' },
											'&:hover fieldset': { borderColor: '#879596' },
											'&.Mui-focused fieldset': { borderColor: '#ec7211' }
										}
									}}
								/>
							)}
						/>
					</Grid>
				</Grid>

				<Box sx={{ ...helperBox, mt: 3, mb: 0 }}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25, fontSize: 20 }} />
					<Typography variant="caption" sx={{ color: '#007eb9', fontWeight: 500, lineHeight: 1.5 }}>
						This information helps us understand the candidate's background and availability for WinVinaya Foundation's training programs.
					</Typography>
				</Box>
			</Paper>
		</Stack>
	);
};

export default BackgroundTrainingTab;


