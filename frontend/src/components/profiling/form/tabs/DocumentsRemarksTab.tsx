import React from 'react';
import {
	Box,
	Typography,
	Stack,
	Button,
	IconButton,
	Tooltip,
	CircularProgress,
	TextField,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio
} from '@mui/material';
import {
	CloudUpload as CloudUploadIcon,
	CheckCircle as CheckCircleIcon,
	RadioButtonUnchecked as UncheckedIcon,
	Description as FileIcon,
	Visibility as ViewIcon
} from '@mui/icons-material';
import DynamicFieldRenderer from '../../../common/DynamicFieldRenderer';
import type { DynamicField } from '../../../../services/settingsService';

interface DocumentsRemarksTabProps {
	formData: any;
	onUpdateOtherField: (name: string, value: any) => void;
	onFileUpload: (type: string, file: File) => void;
	onViewFile: (type: string) => void;
	uploading: Record<string, boolean>;
	viewing: Record<string, boolean>;
	dynamicFields: DynamicField[];
}

const DocumentsRemarksTab: React.FC<DocumentsRemarksTabProps> = ({
	formData,
	onUpdateOtherField,
	onFileUpload,
	onViewFile,
	uploading,
	viewing,
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
			<Box sx={awsPanelStyle}>
				<Typography sx={sectionTitleStyle}>Document Verification</Typography>
				<Stack spacing={2}>
					{[
						{ label: 'Resume', key: 'resume' },
						{ label: 'Disability Certificate', key: 'disability_certificate' },
						{ label: 'Degree/Education Certificate', key: 'degree_qualification' }
					].map((doc) => (
						<Box key={doc.key} sx={{ borderBottom: '1px solid #eaeded', pb: 2, '&:last-child': { borderBottom: 'none', pb: 0 } }}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
								<Typography variant="body2" sx={{ fontWeight: 500 }}>{doc.label}</Typography>
								{formData.documents_upload?.[doc.key] ? (
									<Stack direction="row" spacing={1} alignItems="center">
										<Typography variant="caption" sx={{ color: '#1d8102', display: 'flex', alignItems: 'center' }}>
											<CheckCircleIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Verified
										</Typography>
										<Tooltip title="View Document">
											<IconButton size="small" onClick={() => onViewFile(doc.key)} disabled={viewing[doc.key]}>
												{viewing[doc.key] ? <CircularProgress size={16} /> : <ViewIcon fontSize="small" />}
											</IconButton>
										</Tooltip>
									</Stack>
								) : (
									<Typography variant="caption" sx={{ color: '#d13212', display: 'flex', alignItems: 'center' }}>
										<UncheckedIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Pending
									</Typography>
								)}
							</Box>

							<Stack direction="row" spacing={2} alignItems="center">
								<Button
									component="label"
									variant="outlined"
									size="small"
									startIcon={uploading[doc.key] ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
									disabled={uploading[doc.key]}
									sx={{ textTransform: 'none', borderRadius: '2px', borderColor: '#d5dbdb', color: '#545b64' }}
								>
									{uploading[doc.key] ? 'Uploading...' : 'Upload File'}
									<input
										type="file"
										hidden
										onChange={(e) => {
											if (e.target.files?.[0]) onFileUpload(doc.key, e.target.files[0]);
										}}
									/>
								</Button>
								{(formData.documents_upload as any)?.[`${doc.key}_filename`] && (
									<Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
										<FileIcon fontSize="inherit" sx={{ mr: 0.5 }} />
										{(formData.documents_upload as any)[`${doc.key}_filename`]}
									</Typography>
								)}
							</Stack>
						</Box>
					))}
				</Stack>
			</Box>

			<Box sx={awsPanelStyle}>
				<DynamicFieldRenderer
					fields={dynamicFields}
					formData={formData.others}
					onUpdateField={onUpdateOtherField}
				/>
			</Box>

			<Box sx={awsPanelStyle}>
				<Typography sx={sectionTitleStyle}>Final Verdict</Typography>
				<Stack spacing={3}>
					<Stack direction="row" spacing={4}>
						<FormControl component="fieldset">
							<FormLabel sx={{ fontSize: '0.875rem', mb: 1, color: '#545b64', fontWeight: 500 }}>Willing for Training?</FormLabel>
							<RadioGroup
								row
								value={formData.others?.willing_for_training ? 'yes' : 'no'}
								onChange={(e) => onUpdateOtherField('willing_for_training', e.target.value === 'yes')}
							>
								<FormControlLabel
									value="yes"
									control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
									label={<Typography variant="body2">Yes</Typography>}
								/>
								<FormControlLabel
									value="no"
									control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
									label={<Typography variant="body2">No</Typography>}
								/>
							</RadioGroup>
						</FormControl>

						<FormControl component="fieldset">
							<FormLabel sx={{ fontSize: '0.875rem', mb: 1, color: '#545b64', fontWeight: 500 }}>Ready to Relocate?</FormLabel>
							<RadioGroup
								row
								value={formData.others?.ready_to_relocate ? 'yes' : 'no'}
								onChange={(e) => onUpdateOtherField('ready_to_relocate', e.target.value === 'yes')}
							>
								<FormControlLabel
									value="yes"
									control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
									label={<Typography variant="body2">Yes</Typography>}
								/>
								<FormControlLabel
									value="no"
									control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
									label={<Typography variant="body2">No</Typography>}
								/>
							</RadioGroup>
						</FormControl>
					</Stack>

					<TextField
						label="Screening Comments"
						placeholder="Add any additional observations..."
						fullWidth
						multiline
						rows={3}
						size="small"
						value={formData.others?.comments}
						onChange={(e) => onUpdateOtherField('comments', e.target.value)}
						sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
					/>
				</Stack>
			</Box>
		</Stack>
	);
};

export default DocumentsRemarksTab;
