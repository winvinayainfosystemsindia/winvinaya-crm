import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	TextField,
	IconButton,
	Paper,
	Autocomplete,
	CircularProgress,
	Chip
} from '@mui/material';
import { Add, Delete, Work as WorkIcon } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchX0PAJobs } from '../../../../store/slices/x0paSlice';
import type { X0PAJob } from '../../../../services/x0paService';

import type { CandidateCounselingCreate } from '../../../../models/candidate';

interface InterviewFeedbackTabProps {
	formData: CandidateCounselingCreate;
	onAddQuestion: () => void;
	onRemoveQuestion: (index: number) => void;
	onQuestionChange: (index: number, field: string, value: string) => void;
	onFeedbackChange: (value: string) => void;
	onJobRolesChange: (roles: string[]) => void;
}

// Isolated component for high-performance job search to prevent tab re-renders from affecting typing
const JobRoleSearch: React.FC<{
	value: string[];
	onChange: (roles: string[]) => void;
}> = ({ value, onChange }) => {
	const dispatch = useAppDispatch();
	const { jobs: jobOptions, loading: loadingJobs } = useAppSelector((state) => state.x0pa);
	const [inputValue, setInputValue] = React.useState('');

	// Initial load and debounced search
	React.useEffect(() => {
		const timer = setTimeout(() => {
			dispatch(fetchX0PAJobs({ searchKey: inputValue, limit: 100 }));
		}, 500);
		return () => clearTimeout(timer);
	}, [dispatch, inputValue]);

	const formatJobRole = (job: X0PAJob | any) => {
		if (typeof job === 'string') return job;
		if (!job) return '';
		return `${job.jobName} - ${job.companyId} (${job.statusName})`;
	};

	return (
		<Autocomplete
			multiple
			freeSolo // Crucial for enterprise-level search: prevents input resets during API fetches
			options={jobOptions}
			loading={loadingJobs}
			filterOptions={(x) => x}
			getOptionLabel={formatJobRole}
			inputValue={inputValue}
			onInputChange={(_, newInputValue) => {
				setInputValue(newInputValue);
			}}
			isOptionEqualToValue={(option, val) => {
				const optStr = typeof option === 'string' ? option : formatJobRole(option);
				const valStr = typeof val === 'string' ? val : formatJobRole(val);
				return optStr === valStr;
			}}
			// Stable identity mapping
			value={value.map(role => {
				const parts = role.split(' (');
				const main = parts[0] || '';
				const status = parts[1]?.replace(')', '') || '';
				const subparts = main.split(' - ');
				const name = subparts[0] || '';
				const company = subparts[1] || '';
				return { jobId: role, jobName: name, companyId: company, statusName: status } as X0PAJob;
			})}
			onChange={(_, newValue) => {
				const roles = newValue.map(v => typeof v === 'string' ? v : formatJobRole(v));
				onChange(roles);
				setInputValue(''); // Reset input on selection
			}}
			renderOption={(props, option) => (
				<li {...props} key={option.jobId}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
						<Box sx={{ display: 'flex', flexDirection: 'column' }}>
							<Typography sx={{ fontSize: '0.7rem', fontWeight: 500 }}>{option.jobName}</Typography>
							<Typography sx={{ fontSize: '0.6rem' }} color="textSecondary">ID: {option.companyId}</Typography>
						</Box>
						<Chip
							label={option.statusName}
							size="small"
							variant="outlined"
							sx={{
								ml: 1,
								fontSize: '0.7rem',
								height: 20,
								bgcolor: option.statusName.toLowerCase() === 'active' ? '#e7f4e4' : '#f2f3f3',
								color: option.statusName.toLowerCase() === 'active' ? '#1d8102' : '#545b64',
								borderColor: option.statusName.toLowerCase() === 'active' ? '#1d8102' : '#d5dbdb'
							}}
						/>
					</Box>
				</li>
			)}
			renderInput={(params) => (
				<TextField
					{...params}
					variant="outlined"
					size="small"
					placeholder="Search by job name or company ID..."
					InputProps={{
						...params.InputProps,
						endAdornment: (
							<React.Fragment>
								{loadingJobs ? <CircularProgress color="inherit" size={20} /> : null}
								{params.InputProps.endAdornment}
							</React.Fragment>
						),
						sx: { borderRadius: '2px', bgcolor: '#fafafa' }
					}}
				/>
			)}
			renderTags={(value, getTagProps) =>
				value.map((option: X0PAJob | string, index: number) => {
					const roleStr = typeof option === 'string' ? option : formatJobRole(option);
					const parts = roleStr.split(' (');
					const main = parts[0];
					const status = parts[1]?.replace(')', '') || '';

					return (
						<Chip
							{...getTagProps({ index })}
							key={index}
							label={
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
									<Typography sx={{ fontSize: '0.5rem', fontWeight: 400 }}>{main}</Typography>
									<Chip
										label={status}
										size="small"
										sx={{
											height: 14,
											fontSize: '0.55rem',
											bgcolor: 'rgba(255,255,255,0.7)',
											fontWeight: 700,
											px: 0.5
										}}
									/>
								</Box>
							}
							sx={{
								borderRadius: '2px',
								bgcolor: '#f1faff',
								color: '#007eb9',
								border: '1px solid #007eb9',
								p: 0.5
							}}
						/>
					);
				})
			}
			sx={{ '& .MuiAutocomplete-listbox': { fontSize: '0.875rem' } }}
		/>
	);
};

const InterviewFeedbackTab: React.FC<InterviewFeedbackTabProps> = ({
	formData,
	onAddQuestion,
	onRemoveQuestion,
	onQuestionChange,
	onFeedbackChange,
	onJobRolesChange
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

	const infoBoxStyle = {
		bgcolor: '#f1faff',
		border: '1px solid #007eb9',
		borderRadius: '2px',
		p: 2,
		display: 'flex',
		alignItems: 'flex-start',
		gap: 1.5,
		mb: 3
	};

	return (
		<Stack spacing={3}>
			<Paper elevation={0} sx={awsPanelStyle}>
				<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
					<Typography sx={{ ...sectionTitleStyle, mb: 0 }}>Interview & Questions</Typography>
					<Button
						variant="outlined"
						size="small"
						startIcon={<Add />}
						onClick={onAddQuestion}
						sx={{
							borderRadius: '2px',
							textTransform: 'none',
							borderColor: '#d5dbdb',
							color: '#16191f',
							'&:hover': { bgcolor: '#f2f3f3', borderColor: '#545b64' }
						}}
					>
						Add Custom Question
					</Button>
				</Box>
				<Box sx={infoBoxStyle}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25 }} />
					<Typography variant="body2" color="#007eb9">
						Ask Domain based questions/task/activity to understnd the skill level mentioned by the candidate.
					</Typography>
				</Box>
				<Divider sx={{ mb: 3 }} />
				<Stack spacing={3}>
					{formData.questions?.map((q, index: number) => (
						<Box key={index}>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
								<TextField
									variant="standard"
									fullWidth
									placeholder="Question"
									value={q.question}
									onChange={(e) => onQuestionChange(index, 'question', e.target.value)}
									InputProps={{
										disableUnderline: q.question !== '',
										sx: { fontWeight: 600, fontSize: '0.875rem', color: '#16191f' }
									}}
								/>
								<IconButton size="small" onClick={() => onRemoveQuestion(index)} sx={{ ml: 1 }}>
									<Delete fontSize="small" />
								</IconButton>
							</Box>
							<TextField
								multiline
								rows={2}
								fullWidth
								size="small"
								variant="outlined"
								value={q.answer}
								onChange={(e) => onQuestionChange(index, 'answer', e.target.value)}
								placeholder="Enter candidate's response..."
								sx={{
									'& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fafafa' }
								}}
							/>
						</Box>
					))}
				</Stack>
			</Paper>

			<Paper elevation={0} sx={awsPanelStyle}>
				<Typography sx={sectionTitleStyle}>Training/Placement Recommendation</Typography>
				<Box sx={infoBoxStyle}>
					<InfoIcon sx={{ color: '#007eb9', mt: 0.25 }} />
					<Typography variant="body2" color="#007eb9">
						Provide feedback on domain skills, communication, and typing speed, along with ratings and remarks, and inform the candidate accordingly.
					</Typography>
				</Box>
				<Divider sx={{ mb: 3 }} />

				<Stack spacing={3}>
					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#545b64', mb: 1, display: 'flex', alignItems: 'center' }}>
							<WorkIcon sx={{ mr: 1, fontSize: '1rem' }} />
							Suitable Job Roles
						</Typography>
						<JobRoleSearch
							value={formData.suitable_job_roles || []}
							onChange={onJobRolesChange}
						/>
					</Box>

					<Box>
						<Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#545b64', mb: 1 }}>
							Feedback & Next Steps
						</Typography>
						<TextField
							multiline
							rows={4}
							fullWidth
							variant="outlined"
							value={formData.feedback || ''}
							onChange={(e) => onFeedbackChange(e.target.value)}
							placeholder="Summarize your observations and recommended suitable training path..."
							sx={{
								'& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#fafafa' }
							}}
						/>
					</Box>
				</Stack>
			</Paper>
		</Stack>
	);
};

export default InterviewFeedbackTab;
