import React, { useState, useEffect, useMemo } from 'react';
import {
	Box,
	Paper,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Button,
	CircularProgress,
	Stack,
	MenuItem,
	Select,
	FormControl,
	InputLabel,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions
} from '@mui/material';
import {
	Add as AddIcon,
	Save as SaveIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingBatch, CandidateAllocation, TrainingAssessment } from '../../../models/training';

interface AssessmentTrackerProps {
	batch: TrainingBatch;
	allocations: CandidateAllocation[];
}

const AssessmentTracker: React.FC<AssessmentTrackerProps> = ({ batch, allocations }) => {
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [assessments, setAssessments] = useState<TrainingAssessment[]>([]);
	const [activeAssessmentName, setActiveAssessmentName] = useState('Week 1 - Assessment');
	const [dialogOpen, setDialogOpen] = useState(false);
	const [newAssessmentName, setNewAssessmentName] = useState('');

	useEffect(() => {
		fetchAssessments();
	}, [batch.id]);

	const fetchAssessments = async () => {
		setLoading(true);
		try {
			const data = await trainingExtensionService.getAssessments(batch.id);
			setAssessments(data);
			const names = Array.from(new Set(data.map(a => a.assessment_name)));
			if (names.length > 0) setActiveAssessmentName(names[0]);
		} catch (error) {
			console.error('Failed to fetch assessments', error);
		} finally {
			setLoading(false);
		}
	};

	const assessmentNames = useMemo(() => {
		return Array.from(new Set(assessments.map(a => a.assessment_name)));
	}, [assessments]);

	const getMark = (candidateId: number) => {
		return assessments.find(a => a.candidate_id === candidateId && a.assessment_name === activeAssessmentName);
	};

	const handleMarkChange = (candidateId: number, value: string) => {
		const marks = parseFloat(value) || 0;
		setAssessments(prev => {
			const existingIdx = prev.findIndex(a => a.candidate_id === candidateId && a.assessment_name === activeAssessmentName);
			if (existingIdx >= 0) {
				const updated = [...prev];
				updated[existingIdx] = { ...updated[existingIdx], marks_obtained: marks };
				return updated;
			} else {
				return [...prev, {
					batch_id: batch.id,
					candidate_id: candidateId,
					assessment_name: activeAssessmentName,
					marks_obtained: marks,
					max_marks: 100,
					assessment_date: format(new Date(), 'yyyy-MM-dd')
				}];
			}
		});
	};

	const handleAddAssessment = () => {
		if (newAssessmentName.trim()) {
			setActiveAssessmentName(newAssessmentName.trim());
			setDialogOpen(false);
			setNewAssessmentName('');
		}
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			const currentMarks = assessments.filter(a => a.assessment_name === activeAssessmentName);
			for (const mark of currentMarks) {
				await trainingExtensionService.createAssessment(mark);
			}
		} catch (error) {
			console.error('Failed to save assessments', error);
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>;

	return (
		<Box>
			<Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<Stack direction="row" spacing={2} alignItems="center">
					<FormControl size="small" sx={{ minWidth: 250 }}>
						<InputLabel>Select Assessment</InputLabel>
						<Select
							value={activeAssessmentName}
							label="Select Assessment"
							onChange={(e) => setActiveAssessmentName(e.target.value)}
						>
							{assessmentNames.length === 0 && <MenuItem value={activeAssessmentName}>{activeAssessmentName}</MenuItem>}
							{assessmentNames.map(name => (
								<MenuItem key={name} value={name}>{name}</MenuItem>
							))}
						</Select>
					</FormControl>
					<Button
						variant="outlined"
						startIcon={<AddIcon />}
						onClick={() => setDialogOpen(true)}
						sx={{ textTransform: 'none' }}
					>
						New Assessment
					</Button>
				</Stack>
				<Button
					variant="contained"
					startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
					onClick={handleSave}
					disabled={saving}
					sx={{ bgcolor: '#007eb9', '&:hover': { bgcolor: '#00679a' } }}
				>
					{saving ? 'Saving...' : 'Save All Marks'}
				</Button>
			</Box>

			<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
				<Table>
					<TableHead sx={{ bgcolor: '#f8f9fa' }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Assessment Name</TableCell>
							<TableCell sx={{ fontWeight: 700 }} align="center">Marks Obtained</TableCell>
							<TableCell sx={{ fontWeight: 700 }} align="center">Max Marks</TableCell>
							<TableCell sx={{ fontWeight: 700 }} align="center">Percentage</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{allocations.map(allocation => {
							const record = getMark(allocation.candidate_id);
							const percentage = record ? (record.marks_obtained / record.max_marks) * 100 : 0;

							return (
								<TableRow key={allocation.id} hover>
									<TableCell sx={{ fontWeight: 600 }}>{allocation.candidate?.name}</TableCell>
									<TableCell color="text.secondary">{activeAssessmentName}</TableCell>
									<TableCell align="center">
										<TextField
											type="number"
											size="small"
											value={record?.marks_obtained ?? ''}
											onChange={(e) => handleMarkChange(allocation.candidate_id, e.target.value)}
											sx={{ width: 80, '& input': { textAlign: 'center' } }}
										/>
									</TableCell>
									<TableCell align="center">
										<Typography variant="body2">{record?.max_marks || 100}</Typography>
									</TableCell>
									<TableCell align="center">
										<Typography variant="body2" sx={{ fontWeight: 700, color: percentage >= 70 ? '#2e7d32' : percentage >= 40 ? '#fb8c00' : '#d32f2f' }}>
											{percentage.toFixed(1)}%
										</Typography>
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</TableContainer>

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
				<DialogTitle>Create New Assessment</DialogTitle>
				<DialogContent sx={{ minWidth: 400, pt: 2 }}>
					<TextField
						fullWidth
						autoFocus
						label="Assessment Name"
						placeholder="e.g. Week 2 - Technical Skills"
						value={newAssessmentName}
						onChange={(e) => setNewAssessmentName(e.target.value)}
						sx={{ mt: 1 }}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleAddAssessment} variant="contained" disabled={!newAssessmentName.trim()}>Create</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default AssessmentTracker;
