import React from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
	Box
} from '@mui/material';
import type { CandidateAllocation, TrainingAssessment } from '../../../models/training';

interface AssessmentMatrixProps {
	allocations: CandidateAllocation[];
	assessments: TrainingAssessment[];
	activeAssessmentName: string;
	activeCourses: string[];
	activeMaxMarks: number;
	activeDate: string;
	onMarkChange: (candidateId: number, field: keyof TrainingAssessment | 'remarks' | 'course_mark', value: any, courseName?: string) => void;
}

const AssessmentMatrix: React.FC<AssessmentMatrixProps> = ({
	allocations,
	assessments,
	activeAssessmentName,
	activeCourses,
	activeMaxMarks,
	activeDate,
	onMarkChange
}) => {
	return (
		<TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eaeded', borderRadius: '4px', bgcolor: 'white' }}>
			<Table size="small" stickyHeader sx={{ '& .MuiTableCell-root': { borderColor: '#eaeded' } }}>
				<TableHead>
					<TableRow sx={{ bgcolor: '#f2f3f3' }}>
						<TableCell sx={{ fontWeight: 800, py: 1.5, minWidth: 200, color: '#545b64', fontSize: '0.85rem' }}>STUDENT DETAIL</TableCell>
						<TableCell sx={{ fontWeight: 800, color: '#545b64', fontSize: '0.85rem' }} align="center">SUBMISSION</TableCell>
						{activeCourses.map(course => (
							<TableCell key={course} sx={{ fontWeight: 800, color: '#545b64', fontSize: '0.85rem' }} align="center">{course.toUpperCase()}</TableCell>
						))}
						<TableCell sx={{ fontWeight: 800, color: '#545b64', fontSize: '0.85rem' }} align="center">TOTAL ({activeMaxMarks * (activeCourses.length || 1)})</TableCell>
						<TableCell sx={{ fontWeight: 800, color: '#545b64', fontSize: '0.85rem' }} align="center">PERFORMANCE</TableCell>
						<TableCell sx={{ fontWeight: 800, color: '#545b64', fontSize: '0.85rem' }}>REMARKS</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{allocations.map(allocation => {
						const record = assessments.find(a => a.candidate_id === allocation.candidate_id && a.assessment_name === activeAssessmentName);
						// Percentage = (Total Obtained / (Max Per Course * Num Courses)) * 100
						const totalMax = activeMaxMarks * (activeCourses.length || 1);
						const percentage = record ? (record.marks_obtained / (totalMax || 1)) * 100 : 0;

						return (
							<TableRow key={allocation.id} hover sx={{ '&:hover': { bgcolor: '#f1faff !important' } }}>
								<TableCell sx={{ py: 1.5 }}>
									<Typography variant="body2" sx={{ fontWeight: 700, color: '#232f3e' }}>{allocation.candidate?.name}</Typography>
									<Typography variant="caption" sx={{ color: '#545b64' }}>{allocation.candidate?.email}</Typography>
								</TableCell>
								<TableCell align="center">
									<TextField
										type="date"
										size="small"
										value={record?.submission_date || activeDate}
										onChange={(e) => onMarkChange(allocation.candidate_id, 'submission_date', e.target.value)}
										InputProps={{ sx: { fontSize: '0.75rem', height: 32 } }}
										sx={{ width: 130 }}
									/>
								</TableCell>
								{activeCourses.map(course => (
									<TableCell key={course} align="center">
										<TextField
											type="number"
											size="small"
											value={record?.course_marks?.[course] ?? ''}
											onChange={(e) => onMarkChange(allocation.candidate_id, 'course_mark', parseFloat(e.target.value) || 0, course)}
											sx={{ width: 70, '& input': { textAlign: 'center', height: '1.2rem', padding: '6px' } }}
										/>
									</TableCell>
								))}
								<TableCell align="center">
									<Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16191f' }}>
										{record?.marks_obtained ? record.marks_obtained.toFixed(1) : 0}
									</Typography>
								</TableCell>
								<TableCell align="center">
									<Box
										sx={{
											px: 1,
											py: 0.25,
											borderRadius: '16px',
											display: 'inline-block',
											bgcolor: percentage >= 75 ? '#ebf5e0' : percentage >= 40 ? '#fff3e0' : '#fdedf0',
											color: percentage >= 75 ? '#318400' : percentage >= 40 ? '#c67200' : '#d91515',
											fontWeight: 800,
											fontSize: '0.7rem'
										}}
									>
										{percentage.toFixed(1)}%
									</Box>
								</TableCell>
								<TableCell>
									<TextField
										fullWidth
										size="small"
										placeholder="Add remarks..."
										value={record?.others?.remarks || ''}
										onChange={(e) => onMarkChange(allocation.candidate_id, 'remarks', e.target.value)}
										InputProps={{ sx: { fontSize: '0.75rem', height: 32 } }}
									/>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default AssessmentMatrix;
