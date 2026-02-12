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
							<FormControl component="fieldset" required={field.is_required} fullWidth>
								<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 600, mb: 1.5, '&.Mui-focused': { color: '#545b64' } }}>
									{field.label}
								</FormLabel>
								<RadioGroup
									row
									value={formData?.[field.name] || ''}
									onChange={(e) => onUpdateField(field.name, e.target.value)}
									sx={{ gap: 1.5 }}
								>
									{field.options?.map((opt) => {
										const isSelected = formData?.[field.name] === opt;
										return (
											<Box
												key={opt}
												sx={{
													flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '0 1 auto' },
													minWidth: { md: '140px' },
													border: '1px solid',
													borderColor: isSelected ? '#ec7211' : '#eaeded',
													borderRadius: '4px',
													transition: 'all 0.2s ease',
													backgroundColor: isSelected ? '#fffaf6' : 'transparent',
													'&:hover': {
														borderColor: isSelected ? '#ec7211' : '#d5dbdb',
														backgroundColor: isSelected ? '#fffaf6' : '#f8f9fa'
													}
												}}
											>
												<FormControlLabel
													value={opt}
													control={<Radio size="small" sx={{ color: '#d5dbdb', '&.Mui-checked': { color: '#ec7211' } }} />}
													label={<Typography sx={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#ec7211' : '#545b64' }}>{opt}</Typography>}
													sx={{ margin: 0, padding: '8px 12px', width: '100%', height: '100%' }}
												/>
											</Box>
										);
									})}
								</RadioGroup>
							</FormControl>
						)}
						{field.field_type === 'multiple_choice' && (
							<FormControl component="fieldset" required={field.is_required} fullWidth>
								<FormLabel sx={{ fontSize: '0.875rem', color: '#545b64', fontWeight: 600, mb: 1.5, '&.Mui-focused': { color: '#545b64' } }}>
									{field.label}
								</FormLabel>
								<FormGroup row sx={{ gap: 1.5 }}>
									{field.options?.map((opt) => {
										const isSelected = (formData?.[field.name] || []).includes(opt);
										return (
											<Box
												key={opt}
												sx={{
													flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '0 1 auto' },
													minWidth: { md: '140px' },
													border: '1px solid',
													borderColor: isSelected ? '#ec7211' : '#eaeded',
													borderRadius: '4px',
													transition: 'all 0.2s ease',
													backgroundColor: isSelected ? '#fffaf6' : 'transparent',
													'&:hover': {
														borderColor: isSelected ? '#ec7211' : '#d5dbdb',
														backgroundColor: isSelected ? '#fffaf6' : '#f8f9fa'
													}
												}}
											>
												<FormControlLabel
													control={
														<Checkbox
															size="small"
															checked={isSelected}
															onChange={(e) => {
																const prev = formData?.[field.name] || [];
																const next = e.target.checked
																	? [...prev, opt]
																	: prev.filter((v: string) => v !== opt);
																onUpdateField(field.name, next);
															}}
															sx={{ color: '#d5dbdb', '&.Mui-checked': { color: '#ec7211' } }}
														/>
													}
													label={<Typography sx={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 400, color: isSelected ? '#ec7211' : '#545b64' }}>{opt}</Typography>}
													sx={{ margin: 0, padding: '8px 12px', width: '100%', height: '100%' }}
												/>
											</Box>
										);
									})}
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
