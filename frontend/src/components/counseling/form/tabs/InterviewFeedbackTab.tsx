import React from 'react';
import {
	Box,
	Typography,
	Button,
	Divider,
	Stack,
	TextField,
	IconButton,
	Paper
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

interface InterviewFeedbackTabProps {
	formData: any;
	onAddQuestion: () => void;
	onRemoveQuestion: (index: number) => void;
	onQuestionChange: (index: number, field: string, value: string) => void;
	onFeedbackChange: (value: string) => void;
}

const InterviewFeedbackTab: React.FC<InterviewFeedbackTabProps> = ({
	formData,
	onAddQuestion,
	onRemoveQuestion,
	onQuestionChange,
	onFeedbackChange
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
				<Divider sx={{ mb: 3 }} />
				<Stack spacing={3}>
					{formData.questions?.map((q: any, index: number) => (
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
			</Paper>
		</Stack>
	);
};

export default InterviewFeedbackTab;
