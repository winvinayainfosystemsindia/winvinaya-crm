import React, { memo } from 'react';
import {
	Box,
	Stack,
	Paper,
	Typography,
	Button,
	IconButton,
	TextField,
	useTheme,
	alpha
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	QuestionAnswer as QIcon
} from '@mui/icons-material';
import { type Question } from '../../../../models/MockInterview';

interface MockInterviewFormQuestionsProps {
	questions: Question[];
	viewMode: boolean;
	onQuestionChange: (index: number, field: keyof Question, value: string) => void;
	onAddQuestion: () => void;
	onRemoveQuestion: (index: number) => void;
}

const MockInterviewFormQuestions: React.FC<MockInterviewFormQuestionsProps> = memo(({
	questions,
	viewMode,
	onQuestionChange,
	onAddQuestion,
	onRemoveQuestion
}) => {
	const theme = useTheme();

	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Box 
						sx={{ 
							p: 1.25, 
							bgcolor: alpha(theme.palette.primary.main, 0.08), 
							borderRadius: 2, 
							display: 'flex',
							color: 'primary.main'
						}}
					>
						<QIcon />
					</Box>
					<Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary' }}>
						Technical Discussion Points
					</Typography>
				</Stack>
				{!viewMode && (
					<Button
						startIcon={<AddIcon />}
						onClick={onAddQuestion}
						sx={{ 
							textTransform: 'none', 
							fontWeight: 700, 
							color: 'primary.main',
							borderRadius: 1.5,
							'&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) }
						}}
					>
						Add Row
					</Button>
				)}
			</Box>
			<Stack spacing={3}>
				{questions.map((q, idx) => (
					<Paper 
						key={idx} 
						elevation={0}
						sx={{ 
							p: 3, 
							borderRadius: 2, 
							position: 'relative', 
							bgcolor: 'background.paper',
							border: '1px solid',
							borderColor: 'divider',
							'&:hover': {
								borderColor: alpha(theme.palette.primary.main, 0.2),
								boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
							}
						}}
					>
						{!viewMode && (
							<IconButton
								size="small"
								onClick={() => onRemoveQuestion(idx)}
								sx={{ 
									position: 'absolute', 
									right: 12, 
									top: 12, 
									opacity: 0.4, 
									'&:hover': { opacity: 1, color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) } 
								}}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						)}
						<TextField
							label={`Discussion Topic / Question ${idx + 1}`}
							value={q.question}
							onChange={(e) => onQuestionChange(idx, 'question', e.target.value)}
							fullWidth
							size="small"
							sx={{ 
								mb: 2.5, 
								mt: 1,
								'& .MuiOutlinedInput-root': { borderRadius: 1.5 }
							}}
							disabled={viewMode}
							InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
						/>
						<TextField
							label="Observations & Evaluation"
							value={q.answer}
							onChange={(e) => onQuestionChange(idx, 'answer', e.target.value)}
							fullWidth
							multiline
							rows={2}
							size="small"
							disabled={viewMode}
							InputLabelProps={{ shrink: true, sx: { fontWeight: 600 } }}
							sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
						/>
					</Paper>
				))}
				{questions.length === 0 && (
					<Box 
						sx={{ 
							py: 4, 
							textAlign: 'center', 
							borderRadius: 2, 
							border: '2px dashed',
							borderColor: 'divider',
							bgcolor: alpha(theme.palette.action.disabledBackground, 0.02)
						}}
					>
						<Typography variant="body2" color="text.disabled" sx={{ fontWeight: 500 }}>
							No technical discussion points added yet.
						</Typography>
					</Box>
				)}
			</Stack>
		</Box>
	);
});

MockInterviewFormQuestions.displayName = 'MockInterviewFormQuestions';

export default MockInterviewFormQuestions;

