import { 
	Paper, 
	Typography, 
	Autocomplete, 
	TextField, 
	CircularProgress, 
	Stack, 
	Chip, 
	Box,
	useMediaQuery,
	useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
	Search as SearchIcon,
	Work as WorkIcon
} from '@mui/icons-material';
import { type JobRole } from '../../../models/jobRole';
import { AWS_COLORS } from './mappingTypes';

interface Props {
	jobRoles: JobRole[];
	selectedRole: JobRole | null;
	loading: boolean;
	onRoleChange: (role: JobRole | null) => void;
}

const JobRoleResourceSwitcher = ({ jobRoles, selectedRole, loading, onRoleChange }: Props) => {
	const theme = useTheme();
	const isMedium = useMediaQuery(theme.breakpoints.down('md'));

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 2.5,
				mb: 3,
				border: `1px solid ${AWS_COLORS.border}`,
				borderRadius: '0px',
				bgcolor: 'white',
				boxShadow: '0 1px 1px 0 rgba(0,28,36,.1)'
			}}
		>
			<Grid container spacing={4} alignItems="center">
				<Grid size={{ xs: 12, md: 6 }}>
					<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
						Job Role Resource Selector
					</Typography>
					<Autocomplete
						options={jobRoles}
						getOptionLabel={(option) => option.title}
						loading={loading}
						value={selectedRole}
						onChange={(_, newValue) => onRoleChange(newValue)}
						renderInput={(params) => (
							<TextField
								{...params}
								placeholder="Search available job roles..."
								variant="outlined"
								size="small"
								fullWidth
								InputProps={{
									...params.InputProps,
									startAdornment: (
										<>
											<SearchIcon sx={{ color: AWS_COLORS.secondaryText, mr: 1, fontSize: 18 }} />
											{params.InputProps.startAdornment}
										</>
									),
									endAdornment: (
										<>
											{loading ? <CircularProgress color="inherit" size={16} /> : null}
											{params.InputProps.endAdornment}
										</>
									),
								}}
								sx={{
									'& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '2px' }
								}}
							/>
						)}
						renderOption={(props, option) => {
							const { key, ...optionProps } = props;
							return (
								<Box 
									key={key} 
									component="li" 
									{...optionProps} 
									sx={{ borderBottom: `1px solid ${AWS_COLORS.background}`, py: 1.5 }}
								>
									<Stack direction="row" spacing={2} alignItems="center">
										<WorkIcon sx={{ color: AWS_COLORS.secondaryText, fontSize: 18 }} />
										<Box>
											<Typography variant="body2" sx={{ fontWeight: 700 }}>{option.title}</Typography>
											<Typography variant="caption" color="textSecondary">{option.company?.name}</Typography>
										</Box>
									</Stack>
								</Box>
							);
						}}
					/>
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					{selectedRole && (
						<Stack direction="row" spacing={5} justifyContent={isMedium ? "flex-start" : "flex-end"}>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, mb: 0.5, display: 'block' }}>RESOURCE CLASSIFICATION</Typography>
								<Chip
									label={selectedRole.status.toUpperCase()}
									size="small"
									sx={{
										fontWeight: 800,
										fontSize: '0.65rem',
										bgcolor: selectedRole.status === "active" ? '#ebf5e9' : '#fafafa',
										color: selectedRole.status === "active" ? AWS_COLORS.success : AWS_COLORS.secondaryText,
										borderRadius: '2px',
										height: 20
									}}
								/>
							</Box>
							<Box>
								<Typography variant="caption" sx={{ fontWeight: 700, color: AWS_COLORS.label, mb: 0.5, display: 'block' }}>AVAILABLE CAPACITY</Typography>
								<Typography variant="h6" sx={{ fontWeight: 700, color: AWS_COLORS.headerText, lineHeight: 1 }}>{selectedRole.no_of_vacancies || 0}</Typography>
							</Box>
						</Stack>
					)}
				</Grid>
			</Grid>
		</Paper>
	);
};

export default JobRoleResourceSwitcher;
