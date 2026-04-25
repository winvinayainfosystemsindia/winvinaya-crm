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
	Grid,
	FormControl
} from '@mui/material';
import {
	DeleteOutline as DeleteIcon,
	Add as AddIcon,
	Work as WorkIcon,
	AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { awsStyles } from '../../../../theme/theme';

interface FamilyMember {
	name: string;
	phone: string;
	relation: string;
	occupation: string;
	company_name: string;
	position: string;
}

const RELATION_OPTIONS = [
	'Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Guardian', 'Son', 'Daughter', 'Other'
];

interface FamilyDetailsTabProps {
	formData: any;
	onUpdateField: (section: string, field: string, value: any) => void;
}

const FamilyDetailsTab: React.FC<FamilyDetailsTabProps> = ({ formData, onUpdateField }) => {
	const { sectionTitle, awsPanel, fieldLabel } = awsStyles;
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
		if (field === 'phone') {
			const sanitized = value.replace(/\D/g, '').slice(0, 10);
			value = sanitized;
		}

		const updatedDetails = familyDetails.map((member, i) =>
			i === index ? { ...member, [field]: value } : member
		);
		onUpdateField('root', 'family_details', updatedDetails);
	};

	const inputSx = {
		'& .MuiOutlinedInput-root': {
			borderRadius: '2px',
			bgcolor: '#fcfcfc',
			'& fieldset': { borderColor: '#d5dbdb' },
			'&:hover fieldset': { borderColor: '#879596' },
			'&.Mui-focused fieldset': { borderColor: '#ec7211' }
		}
	};

	return (
		<Stack spacing={4}>
			{/* Economic Background Section */}
			<Paper elevation={0} sx={awsPanel}>
				<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
					<Box sx={{ bgcolor: '#ec7211', p: 0.5, borderRadius: '2px', display: 'flex' }}>
						<WalletIcon sx={{ color: '#ffffff', fontSize: 20 }} />
					</Box>
					<Typography sx={sectionTitle}>Economic Background</Typography>
				</Stack>
				<Grid container spacing={3}>
					<Grid size={{ xs: 12, md: 6 }}>
						<Typography sx={fieldLabel}>Family Annual Income (in INR)</Typography>
						<TextField
							fullWidth
							size="small"
							type="number"
							placeholder="Enter total annual income"
							value={formData.others?.family_annual_income || ''}
							onChange={(e) => onUpdateField('others', 'family_annual_income', e.target.value)}
							sx={inputSx}
						/>
					</Grid>
				</Grid>
			</Paper>

			{/* Family Members Section */}
			<Box>
				<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
					<Stack direction="row" alignItems="center" spacing={1.5}>
						<Typography sx={sectionTitle}>Family & Dependent Details</Typography>
					</Stack>
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
							px: 3,
							py: 0.8,
							boxShadow: 'none',
							'&:hover': { bgcolor: '#eb5f07', boxShadow: 'none' }
						}}
					>
						Add Family Member
					</Button>
				</Stack>

				<Stack spacing={3}>
					{familyDetails.length === 0 ? (
						<Paper
							elevation={0}
							sx={{
								p: 6,
								textAlign: 'center',
								border: '1px dashed #d5dbdb',
								bgcolor: '#fafffe',
								borderRadius: '2px'
							}}
						>
							<Typography variant="body2" sx={{ color: '#879596', fontStyle: 'italic' }}>
								No family members registered yet. Click "Add Family Member" to begin.
							</Typography>
						</Paper>
					) : (
						familyDetails.map((member, index) => (
							<Paper key={index} elevation={0} sx={{ ...awsPanel, p: 0, overflow: 'hidden' }}>
								{/* Card Header */}
								<Box sx={{
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
									px: 3,
									py: 1.5,
									bgcolor: '#f8f9f9',
									borderBottom: '1px solid #eaeded'
								}}>
									<Stack direction="row" spacing={1.5} alignItems="center">
										<Box sx={{
											width: 28,
											height: 28,
											borderRadius: '50%',
											bgcolor: '#ec7211',
											color: 'white',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: '0.85rem',
											fontWeight: 700
										}}>
											{index + 1}
										</Box>
										<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e' }}>
											{member.relation || 'New Member'} {member.name ? `— ${member.name}` : ''}
										</Typography>
									</Stack>
									<IconButton
										size="small"
										onClick={() => handleRemoveRow(index)}
										sx={{ color: '#d91d11', '&:hover': { bgcolor: '#fdf3f2' } }}
									>
										<DeleteIcon fontSize="small" />
									</IconButton>
								</Box>

								{/* Card Content */}
								<Box sx={{ p: 3 }}>
									<Grid container spacing={4}>
										{/* Personal Column */}
										<Grid size={{ xs: 12, md: 6 }}>
											<Stack spacing={2.5}>
												<Typography variant="caption" sx={{ fontWeight: 600, color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
													Identity & Contact
												</Typography>

												<TextField
													fullWidth
													label="Full Name"
													size="small"
													placeholder="Enter member's name"
													value={member.name}
													onChange={(e) => handleChange(index, 'name', e.target.value)}
													sx={inputSx}
												/>
												<Grid container spacing={2}>
													<Grid size={{ xs: 12, sm: 6 }}>
														<FormControl fullWidth size="small" sx={inputSx}>
															<Select
																value={member.relation}
																onChange={(e) => handleChange(index, 'relation', e.target.value)}
																displayEmpty
																renderValue={(selected) => selected || <Typography variant="body2" color="text.secondary">Relationship</Typography>}
															>
																{RELATION_OPTIONS.map(opt => (
																	<MenuItem key={opt} value={opt}>{opt}</MenuItem>
																))}
															</Select>
														</FormControl>
													</Grid>
													<Grid size={{ xs: 12, sm: 6 }}>
														<TextField
															fullWidth
															placeholder="10-digit mobile"
															size="small"
															value={member.phone}
															onChange={(e) => handleChange(index, 'phone', e.target.value)}
															error={member.phone !== '' && member.phone.length !== 10}
															sx={inputSx}
														/>
													</Grid>
												</Grid>
											</Stack>
										</Grid>

										{/* Professional Column */}
										<Grid size={{ xs: 12, md: 6 }}>
											<Stack spacing={2.5}>
												<Stack direction="row" spacing={1} alignItems="center">
													<WorkIcon sx={{ color: '#545b64', fontSize: 18 }} />
													<Typography variant="caption" sx={{ fontWeight: 600, color: '#545b64', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
														Professional Background
													</Typography>
												</Stack>

												<TextField
													fullWidth
													label="Occupation"
													size="small"
													placeholder="e.g. Farmer, Salaried"
													value={member.occupation}
													onChange={(e) => handleChange(index, 'occupation', e.target.value)}
													sx={inputSx}
												/>
												<TextField
													fullWidth
													label="Organization / Company"
													size="small"
													value={member.company_name}
													onChange={(e) => handleChange(index, 'company_name', e.target.value)}
													sx={inputSx}
												/>
												<TextField
													fullWidth
													label="Current Position"
													size="small"
													placeholder="e.g. Lead, Clerk, Manager"
													value={member.position}
													onChange={(e) => handleChange(index, 'position', e.target.value)}
													sx={inputSx}
												/>
											</Stack>
										</Grid>
									</Grid>
								</Box>
							</Paper>
						))
					)}
				</Stack>
			</Box>
		</Stack>
	);
};

export default FamilyDetailsTab;
