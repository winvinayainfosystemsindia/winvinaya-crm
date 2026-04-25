import React from 'react';
import {
	Box,
	Typography,
	Stack,
	Button,
	CircularProgress,
	TextField,
	FormControl,
	Paper,
	Divider,
	Chip,
	Select,
	MenuItem,
} from '@mui/material';
import {
	CloudUpload as CloudUploadIcon,
	CheckCircle as CheckCircleIcon,
	Visibility as ViewIcon,
	DeleteOutline as DeleteIcon,
	ErrorOutline as ErrorIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';
import DynamicFieldRenderer from '../../../common/DynamicFieldRenderer';
import type { DynamicField } from '../../../../services/settingsService';

interface DocumentsRemarksTabProps {
	formData: any;
	onUpdateOtherField: (name: string, value: any) => void;
	onUpdateStatus: (value: string) => void;
	onFileUpload: (type: string, file: File) => void;
	onViewFile: (type: string) => void;
	onRemoveFile: (type: string) => void;
	uploading: Record<string, boolean>;
	viewing: Record<string, boolean>;
	dynamicFields: DynamicField[];
	candidateIsDisabled: boolean;
}

const DocumentsRemarksTab: React.FC<DocumentsRemarksTabProps> = ({
	formData,
	onUpdateOtherField,
	onUpdateStatus,
	onFileUpload,
	onViewFile,
	onRemoveFile,
	uploading,
	viewing,
	dynamicFields,
	candidateIsDisabled
}) => {
	const { sectionTitle, awsPanel, fieldLabel } = awsStyles;

	const renderDocumentItem = (label: string, key: string) => {
		const isUploaded = formData.documents_upload?.[key];
		const fileName = (formData.documents_upload as any)?.[`${key}_filename`];
		const isUploading = uploading[key];
		const isViewing = viewing[key];

		return (
			<Paper
				elevation={0}
				sx={{
					...awsPanel,
					borderColor: isUploaded ? '#879596' : '#d5dbdb',
					bgcolor: isUploaded ? '#fafffa' : '#ffffff',
					display: 'flex',
					flexDirection: 'column',
					gap: 2
				}}
			>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
					<Box>
						<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
							{label} <Typography component="span" variant="caption" sx={{ color: '#545b64', fontWeight: 400 }}>(Max 10MB)</Typography>
						</Typography>
						{isUploaded ? (
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
								<CheckCircleIcon sx={{ fontSize: 16, color: '#1d8102' }} />
								<Typography variant="caption" sx={{ color: '#1d8102', fontWeight: 600 }}>
									Uploaded
								</Typography>
								<Typography variant="caption" sx={{ color: '#545b64' }}>
									• {fileName}
								</Typography>
							</Stack>
						) : (
							<Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
								<ErrorIcon sx={{ fontSize: 16, color: '#545b64' }} />
								<Typography variant="caption" sx={{ color: '#545b64' }}>
									No document uploaded
								</Typography>
							</Stack>
						)}
					</Box>
					<Box>
						{isUploaded ? (
							<Chip
								label="Verified"
								size="small"
								sx={{
									bgcolor: '#dff3d8',
									color: '#1d8102',
									borderRadius: '2px',
									fontWeight: 700,
									fontSize: '0.75rem',
									border: '1px solid #cce8c5'
								}}
							/>
						) : (
							<Chip
								label="Required"
								size="small"
								sx={{
									bgcolor: '#f2f3f3',
									color: '#545b64',
									borderRadius: '2px',
									fontWeight: 700,
									fontSize: '0.75rem',
									border: '1px solid #d5dbdb'
								}}
							/>
						)}
					</Box>
				</Box>

				<Divider sx={{ borderColor: '#eaeded' }} />

				<Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
					<Button
						component="label"
						variant="outlined"
						size="small"
						disabled={isUploading}
						startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
						sx={{
							textTransform: 'none',
							fontWeight: 700,
							color: '#545b64',
							border: '1px solid #d5dbdb',
							borderRadius: '2px',
							'&:hover': { bgcolor: '#f2f3f3', borderColor: '#879596' }
						}}
					>
						{isUploading ? 'Uploading...' : (isUploaded ? 'Replace File' : 'Choose File')}
						<input
							type="file"
							hidden
							onChange={(e) => {
								if (e.target.files?.[0]) onFileUpload(key, e.target.files[0]);
							}}
						/>
					</Button>

					{isUploaded && (
						<>
							<Button
								variant="outlined"
								size="small"
								startIcon={isViewing ? <CircularProgress size={16} /> : <ViewIcon />}
								onClick={() => onViewFile(key)}
								disabled={isViewing}
								sx={{
									textTransform: 'none',
									fontWeight: 700,
									color: '#545b64',
									border: '1px solid #d5dbdb',
									borderRadius: '2px',
									'&:hover': { bgcolor: '#f2f3f3', borderColor: '#879596' }
								}}
							>
								View
							</Button>
							<Button
								variant="outlined"
								size="small"
								startIcon={<DeleteIcon />}
								onClick={() => onRemoveFile(key)}
								sx={{
									textTransform: 'none',
									fontWeight: 700,
									color: '#d91d11',
									border: '1px solid #d5dbdb',
									borderRadius: '2px',
									'&:hover': { bgcolor: '#fdf3f2', borderColor: '#d91d11' }
								}}
							>
								Remove
							</Button>
						</>
					)}
				</Box>
			</Paper>
		);
	};

	return (
		<Stack spacing={4}>
			{/* Document Verification Section */}
			<Box>
				<Typography sx={sectionTitle}>
					Document Verification
				</Typography>
				<Typography variant="body2" sx={{ color: '#545b64', mb: 2 }}>
					Upload and verify required candidate documents. Accepted formats: PDF (Max 10MB).
				</Typography>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
					{renderDocumentItem('Resume', 'resume')}
					{candidateIsDisabled && renderDocumentItem('Disability Certificate', 'disability_certificate')}
					{renderDocumentItem('Degree / Education Certificate', 'degree_certificate')}
				</Box>
			</Box>

			{/* Additional Fields Section */}
			{dynamicFields.length > 0 && (
				<Box>
					<Typography sx={sectionTitle}>
						Additional Information
					</Typography>
					<Paper elevation={0} sx={awsPanel}>
						<DynamicFieldRenderer
							fields={dynamicFields}
							formData={formData.others}
							onUpdateField={onUpdateOtherField}
						/>
					</Paper>
				</Box>
			)}

			{/* Final Verdict Section */}
			<Box>
				<Typography sx={sectionTitle}>
					Final Verdict & Comments
				</Typography>
				<Paper elevation={0} sx={{ ...awsPanel, display: 'flex', flexDirection: 'column', gap: 3 }}>

					<Box>
						<Typography sx={fieldLabel}>
							Screening Status
						</Typography>
						<FormControl fullWidth size="small">
							<Select
								id="screening-status"
								value={formData.status || 'In Progress'}
								onChange={(e) => onUpdateStatus(e.target.value)}
								sx={{
									borderRadius: '2px',
									bgcolor: '#fcfcfc',
									'& .MuiOutlinedInput-notchedOutline': {
										borderColor: '#d5dbdb'
									},
									'&:hover .MuiOutlinedInput-notchedOutline': {
										borderColor: '#879596'
									},
									'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
										borderColor: '#ec7211'
									}
								}}
							>
								<MenuItem value="Completed">Completed</MenuItem>
								<MenuItem value="In Progress">In Progress</MenuItem>
								<MenuItem value="Rejected">Rejected</MenuItem>
							</Select>
						</FormControl>
					</Box>


					{/* Conditional Reason Field */}
					{(formData.status === 'In Progress' || formData.status === 'Rejected') && (
						<Box>
							<Typography sx={fieldLabel}>
								Reason / Details
							</Typography>
							<FormControl fullWidth size="small">
								<Select
									value={formData.others?.reason || ''}
									onChange={(e) => onUpdateOtherField('reason', e.target.value)}
									displayEmpty
									sx={{
										borderRadius: 0,
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#d5dbdb'
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#879596'
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#ec7211'
										}
									}}
								>
									<MenuItem value="">
										<em>Select Reason</em>
									</MenuItem>
									{formData.status === 'In Progress' ? [
										<MenuItem key="follow-up" value="Follow-up Required">Follow-up Required</MenuItem>,
										<MenuItem key="assess-sent" value="Assessment Sent">Assessment Sent</MenuItem>,
										<MenuItem key="assess-comp" value="Assessment Completed">Assessment Completed</MenuItem>
									] : [
										<MenuItem key="no-resp" value="No Response">No Response</MenuItem>,
										<MenuItem key="not-int" value="Not Interested">Not Interested</MenuItem>,
										<MenuItem key="domain" value="Domain Specific">Domain Specific</MenuItem>,
										<MenuItem key="studying" value="Studying">Studying</MenuItem>,
										<MenuItem key="working" value="Working">Working</MenuItem>
									]}
								</Select>
							</FormControl>
						</Box>
					)}

					<Box>
						<Typography sx={fieldLabel}>
							Screening Comments
						</Typography>
						<TextField
							placeholder="Add detailed observations, strengths, and areas for improvement..."
							fullWidth
							multiline
							minRows={3}
							size="small"
							value={formData.others?.comments}
							onChange={(e) => onUpdateOtherField('comments', e.target.value)}
							sx={{
								'& .MuiOutlinedInput-root': {
									borderRadius: 0,
									'& fieldset': { borderColor: '#d5dbdb' },
									'&:hover fieldset': { borderColor: '#879596' },
									'&.Mui-focused fieldset': { borderColor: '#ec7211' }
								}
							}}
						/>
					</Box>
				</Paper>
			</Box>
		</Stack>
	);
};

export default DocumentsRemarksTab;
