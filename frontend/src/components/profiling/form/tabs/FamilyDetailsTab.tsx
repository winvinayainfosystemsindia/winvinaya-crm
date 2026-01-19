import React from 'react';
import {
	Box,
	Typography,
	TextField,
	IconButton,
	Button,
	Paper,
	Stack,
	MenuItem,
	Select,
	FormControl,
	Grid,
	Divider,
	InputLabel,
	Tooltip
} from '@mui/material';
import { DeleteOutline as DeleteIcon, Add as AddIcon, Person as PersonIcon, Work as WorkIcon } from '@mui/icons-material';

interface FamilyMember {
	name: string;
	phone: string;
	relation: string;
	occupation: string;
	company_name: string;
	position: string;
}

const RELATION_OPTIONS = [
	'Father',
	'Mother',
	'Brother',
	'Sister',
	'Spouse',
	'Guardian',
	'Son',
	'Daughter',
	'Other'
];

interface FamilyDetailsTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
}

const FamilyDetailsTab: React.FC<FamilyDetailsTabProps> = ({ formData, onUpdateField }) => {
	const familyDetails: FamilyMember[] = formData.family_details || [];

	const handleAddRow = () => {
		const newRow: FamilyMember = {
			name: '',
			phone: '',
			relation: '',
			occupation: '',
			company_name: '',
			position: ''
		};
		onUpdateField('root', 'family_details', [...familyDetails, newRow]);
	};

	const handleRemoveRow = (index: number) => {
		const updatedDetails = familyDetails.filter((_, i) => i !== index);
		onUpdateField('root', 'family_details', updatedDetails);
	};

	const handleChange = (index: number, field: keyof FamilyMember, value: string) => {
		// Phone validation: only 10 digits
		if (field === 'phone') {
			const sanitized = value.replace(/\D/g, ''); // Remove non-digits
			if (sanitized.length > 10) return; // Cap at 10
			value = sanitized;
		}

		const updatedDetails = familyDetails.map((member, i) => {
			if (i === index) {
				return { ...member, [field]: value };
			}
			return member;
		});
		onUpdateField('root', 'family_details', updatedDetails);
	};

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			fontSize: '0.875rem',
			bgcolor: '#ffffff',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' },
			'&.Mui-focused fieldset': { borderColor: '#ec7211' }
		},
		'& .MuiInputLabel-root': {
			fontSize: '0.875rem',
			color: '#545b64',
			'&.Mui-focused': { color: '#ec7211' }
		}
	};

	return (
		<Stack spacing={4}>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				<Box>
					<Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e', mb: 0.5 }}>
						Family & Dependent Details
					</Typography>
					<Typography variant="body2" sx={{ color: '#545b64' }}>
						Provide information about family members for socio-economic background assessment.
					</Typography>
				</Box>
				<Button
					variant="contained"
					size="small"
					startIcon={<AddIcon />}
					onClick={handleAddRow}
					sx={{
						bgcolor: '#ec7211',
						color: '#ffffff',
						borderRadius: '2px',
						textTransform: 'none',
						fontWeight: 700,
						px: 2,
						boxShadow: 'none',
						'&:hover': { bgcolor: '#eb5f07', boxShadow: 'none' }
					}}
				>
					Add Family Member
				</Button>
			</Box>

			<Stack spacing={3}>
				{familyDetails.length === 0 ? (
					<Paper
						elevation={0}
						sx={{
							p: 6,
							textAlign: 'center',
							border: '1px dashed #d5dbdb',
							bgcolor: '#fafafa',
							borderRadius: '2px'
						}}
					>
						<Typography variant="body2" sx={{ color: '#879596', fontStyle: 'italic' }}>
							No family records added. Use the button above to add a member.
						</Typography>
					</Paper>
				) : (
					familyDetails.map((member, index) => (
						<Paper
							key={index}
							elevation={0}
							sx={{
								border: '1px solid #d5dbdb',
								borderRadius: '2px',
								overflow: 'hidden',
								bgcolor: '#ffffff'
							}}
						>
							{/* Card Header */}
							<Box sx={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								px: 2,
								py: 1.5,
								bgcolor: '#f8f9f9',
								borderBottom: '1px solid #eaeded'
							}}>
								<Stack direction="row" spacing={1} alignItems="center">
									<Box sx={{
										width: 24,
										height: 24,
										borderRadius: '50%',
										bgcolor: '#ec7211',
										color: 'white',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: '0.75rem',
										fontWeight: 700
									}}>
										{index + 1}
									</Box>
									<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
										{member.relation ? `${member.relation}` : 'Family Member'} {member.name ? `— ${member.name}` : ''}
									</Typography>
								</Stack>
								<Tooltip title="Remove Record">
									<IconButton
										size="small"
										onClick={() => handleRemoveRow(index)}
										sx={{ color: '#d91d11', '&:hover': { bgcolor: '#fdf3f2' } }}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Tooltip>
							</Box>

							{/* Card Content */}
							<Box sx={{ p: 3 }}>
								<Grid container spacing={4}>
									{/* Personal Column */}
									<Grid size={{ xs: 12, md: 6 }}>
										<Stack spacing={2.5}>
											<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
												<PersonIcon sx={{ color: '#545b64', fontSize: 18 }} />
												<Typography variant="caption" sx={{ fontWeight: 700, color: '#545b64', textTransform: 'uppercase' }}>
													Identity & Contact
												</Typography>
											</Stack>

											<Grid container spacing={2}>
												<Grid size={{ xs: 12 }}>
													<TextField
														fullWidth
														label="Full Name"
														size="small"
														placeholder="Enter full name"
														value={member.name}
														onChange={(e) => handleChange(index, 'name', e.target.value)}
														sx={inputSx}
													/>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<FormControl fullWidth size="small" sx={inputSx}>
														<InputLabel id={`relation-label-${index}`}>Relationship</InputLabel>
														<Select
															labelId={`relation-label-${index}`}
															value={member.relation}
															label="Relationship"
															onChange={(e) => handleChange(index, 'relation', e.target.value)}
														>
															<MenuItem value="" disabled>Select</MenuItem>
															{RELATION_OPTIONS.map(opt => (
																<MenuItem key={opt} value={opt}>{opt}</MenuItem>
															))}
														</Select>
													</FormControl>
												</Grid>
												<Grid size={{ xs: 12, sm: 6 }}>
													<TextField
														fullWidth
														label="Phone Number"
														size="small"
														placeholder="10-digit mobile"
														value={member.phone}
														onChange={(e) => handleChange(index, 'phone', e.target.value)}
														error={member.phone !== '' && member.phone.length !== 10}
														sx={inputSx}
														helperText={member.phone !== '' && member.phone.length !== 10 ? 'Requires 10 digits' : ''}
													/>
												</Grid>
											</Grid>
										</Stack>
									</Grid>

									{/* Divider for larger screens - visible only on md+ */}
									<Grid size={{ md: 'auto' }} sx={{ display: { xs: 'none', md: 'block' } }}>
										<Divider orientation="vertical" flexItem sx={{ height: '100%', borderColor: '#eaeded' }} />
									</Grid>

									{/* Professional Column */}
									<Grid size={{ xs: 12, md: 5.5 }}>
										<Stack spacing={2.5}>
											<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
												<WorkIcon sx={{ color: '#545b64', fontSize: 18 }} />
												<Typography variant="caption" sx={{ fontWeight: 700, color: '#545b64', textTransform: 'uppercase' }}>
													Professional Background
												</Typography>
											</Stack>

											<Grid container spacing={2}>
												<Grid size={{ xs: 12 }}>
													<TextField
														fullWidth
														label="Occupation"
														size="small"
														placeholder="e.g. Farmer, Employee, Business"
														value={member.occupation}
														onChange={(e) => handleChange(index, 'occupation', e.target.value)}
														sx={inputSx}
													/>
												</Grid>
												<Grid size={{ xs: 12 }}>
													<TextField
														fullWidth
														label="Company / Institution"
														size="small"
														placeholder="Enter organization name"
														value={member.company_name}
														onChange={(e) => handleChange(index, 'company_name', e.target.value)}
														sx={inputSx}
													/>
												</Grid>
												<Grid size={{ xs: 12 }}>
													<TextField
														fullWidth
														label="Current Position"
														size="small"
														placeholder="Enter role or designation"
														value={member.position}
														onChange={(e) => handleChange(index, 'position', e.target.value)}
														sx={inputSx}
													/>
												</Grid>
											</Grid>
										</Stack>
									</Grid>
								</Grid>
							</Box>
						</Paper>
					))
				)}
			</Stack>
		</Stack>
	);
};

export default FamilyDetailsTab;
