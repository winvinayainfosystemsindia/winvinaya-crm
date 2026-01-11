import React, { memo } from 'react';
import {
	Box,
	Stack,
	Paper,
	Typography,
	Button,
	IconButton,
	TextField
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	QuestionAnswer as QIcon
} from '@mui/icons-material';
import { type Question } from '../../../models/MockInterview';

interface MockInterviewFormQuestionsProps {
	questions: Question[];
	viewMode: boolean;
	onQuestionChange: (index: number, field: keyof Question, value: string) => void;
	onAddQuestion: () => void;
	onRemoveQuestion: (index: number) => void;
	PRIMARY_BLUE: string;
}

const MockInterviewFormQuestions: React.FC<MockInterviewFormQuestionsProps> = memo(({
	questions,
	viewMode,
	onQuestionChange,
	onAddQuestion,
	onRemoveQuestion,
	PRIMARY_BLUE
}) => {
	return (
		<Box>
			<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
				<Stack direction="row" alignItems="center" spacing={1.5}>
					<Box sx={{ p: 1, bgcolor: '#ecf3f3', borderRadius: '4px', display: 'flex' }}>
						<QIcon sx={{ color: '#007eb9' }} />
					</Box>
					<Typography variant="h6" sx={{ fontWeight: 600 }}>Technical Questions</Typography>
				</Stack>
				{!viewMode && (
					<Button
						startIcon={<AddIcon />}
						onClick={onAddQuestion}
						sx={{ textTransform: 'none', fontWeight: 600, color: PRIMARY_BLUE }}
					>
						Add Question
					</Button>
				)}
			</Box>
			<Stack spacing={2.5}>
				{questions.map((q, idx) => (
					<Paper key={idx} variant="outlined" sx={{ p: 2.5, borderRadius: '4px', position: 'relative', bgcolor: 'white' }}>
						{!viewMode && (
							<IconButton
								size="small"
								onClick={() => onRemoveQuestion(idx)}
								sx={{ position: 'absolute', right: 8, top: 8, opacity: 0.6, '&:hover': { opacity: 1, color: '#d32f2f' } }}
							>
								<DeleteIcon fontSize="small" />
							</IconButton>
						)}
						<TextField
							label={`Topic/Question ${idx + 1}`}
							value={q.question}
							onChange={(e) => onQuestionChange(idx, 'question', e.target.value)}
							fullWidth
							size="small"
							sx={{ mb: 2, mt: 1 }}
							disabled={viewMode}
							InputLabelProps={{ shrink: true }}
						/>
						<TextField
							label="Evaluation Details"
							value={q.answer}
							onChange={(e) => onQuestionChange(idx, 'answer', e.target.value)}
							fullWidth
							multiline
							rows={2}
							size="small"
							disabled={viewMode}
							InputLabelProps={{ shrink: true }}
						/>
					</Paper>
				))}
			</Stack>
		</Box>
	);
});

MockInterviewFormQuestions.displayName = 'MockInterviewFormQuestions';

export default MockInterviewFormQuestions;

