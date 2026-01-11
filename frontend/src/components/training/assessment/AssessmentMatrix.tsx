import React, { memo } from 'react';
import {
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import type { CandidateAllocation, TrainingAssessment } from '../../../models/training';
import AssessmentMatrixRow from './AssessmentMatrixRow';

interface AssessmentMatrixProps {
	allocations: CandidateAllocation[];
	assessments: TrainingAssessment[];
	activeAssessmentName: string;
	activeCourses: string[];
	activeMaxMarks: number;
	activeDate: string;
	onMarkChange: (candidateId: number, field: keyof TrainingAssessment | 'remarks' | 'course_mark', value: any, courseName?: string) => void;
}

const AssessmentMatrix: React.FC<AssessmentMatrixProps> = memo(({
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

						return (
							<AssessmentMatrixRow
								key={allocation.id}
								allocation={allocation}
								record={record}
								activeDate={activeDate}
								activeCourses={activeCourses}
								activeMaxMarks={activeMaxMarks}
								onMarkChange={onMarkChange}
							/>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
});

AssessmentMatrix.displayName = 'AssessmentMatrix';

export default AssessmentMatrix;

