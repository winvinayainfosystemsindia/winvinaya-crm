import React from 'react';
import {
	Box,
	TextField,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	FormGroup,
	Checkbox,
	Stack,
	Typography
} from '@mui/material';
import type { DynamicField } from '../../services/settingsService';

interface DynamicFieldRendererProps {
	fields: DynamicField[];
	formData: any;
	onUpdateField: (name: string, value: any) => void;
	sectionTitle?: string;
}

const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
	fields,
	formData,
	onUpdateField,
	sectionTitle = 'Additional Information'
}) => {
	if (fields.length === 0) return null;

	const sectionTitleStyle = {
		fontWeight: 700,
		fontSize: '0.875rem',
		color: '#545b64',
		mb: 2,
		textTransform: 'uppercase' as const,
		letterSpacing: '0.025em'
	};

	return (
		<Box sx={{ mt: 3 }}>
			<Typography sx={sectionTitleStyle}>{sectionTitle}</Typography>
			<Stack spacing={3}>
				{fields.map((field) => (
					<Box key={field.id}>
						{field.field_type === 'text' && (
							<TextField
								label={field.label}
								fullWidth
								size="small"
								required={field.is_required}
								value={formData?.[field.name] || ''}
								onChange={(e) => onUpdateField(field.name, e.target.value)}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
							/>
						)}
						{field.field_type === 'textarea' && (
							<TextField
								label={field.label}
								fullWidth
								multiline
								rows={3}
								required={field.is_required}
								value={formData?.[field.name] || ''}
								onChange={(e) => onUpdateField(field.name, e.target.value)}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
							/>
						)}
						{field.field_type === 'number' && (
							<TextField
								label={field.label}
								fullWidth
								size="small"
								type="number"
								required={field.is_required}
								value={formData?.[field.name] || ''}
								onChange={(e) => onUpdateField(field.name, e.target.value)}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
							/>
						)}
						{field.field_type === 'phone_number' && (
							<TextField
								label={field.label}
								fullWidth
								size="small"
								required={field.is_required}
								value={formData?.[field.name] || ''}
								onChange={(e) => onUpdateField(field.name, e.target.value)}
								sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
							/>
						)}
						{field.field_type === 'single_choice' && (
							<FormControl component="fieldset" required={field.is_required}>
								<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500, mb: 1 }}>
									{field.label}
								</FormLabel>
								<RadioGroup
									row
									value={formData?.[field.name] || ''}
									onChange={(e) => onUpdateField(field.name, e.target.value)}
								>
									{field.options?.map((opt) => (
										<FormControlLabel
											key={opt}
											value={opt}
											control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ec7211' } }} />}
											label={<Typography variant="body2">{opt}</Typography>}
										/>
									))}
								</RadioGroup>
							</FormControl>
						)}
						{field.field_type === 'multiple_choice' && (
							<FormControl component="fieldset" required={field.is_required}>
								<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 500, mb: 1 }}>
									{field.label}
								</FormLabel>
								<FormGroup row>
									{field.options?.map((opt) => (
										<FormControlLabel
											key={opt}
											control={
												<Checkbox
													size="small"
													checked={(formData?.[field.name] || []).includes(opt)}
													onChange={(e) => {
														const prev = formData?.[field.name] || [];
														const next = e.target.checked
															? [...prev, opt]
															: prev.filter((v: string) => v !== opt);
														onUpdateField(field.name, next);
													}}
													sx={{ '&.Mui-checked': { color: '#ec7211' } }}
												/>
											}
											label={<Typography variant="body2">{opt}</Typography>}
										/>
									))}
								</FormGroup>
							</FormControl>
						)}
					</Box>
				))}
			</Stack>
		</Box>
	);
};

export default DynamicFieldRenderer;
