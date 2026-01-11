import React, { useState, useEffect, useMemo } from 'react';
import {
	Paper,
	Typography,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
	Divider,
	Accordion,
	AccordionSummary,
	AccordionDetails
} from '@mui/material';
import {
	EventAvailable as AttendanceIcon,
	HourglassEmpty as PendingIcon,
	ExpandMore as ExpandMoreIcon,
	School as BatchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SectionHeader } from './DetailedViewCommon';
import trainingExtensionService from '../../../services/trainingExtensionService';
import type { TrainingAttendance } from '../../../models/training';
import type { Candidate } from '../../../models/candidate';

interface CandidateAttendanceTabProps {
	candidate: Candidate;
}

const CandidateAttendanceTab: React.FC<CandidateAttendanceTabProps> = ({ candidate }) => {
	const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			if (!candidate.public_id) return;
			try {
				const data = await trainingExtensionService.getCandidateAttendance(candidate.public_id);
				setAttendance(data);
			} catch (error) {
				console.error('Failed to fetch attendance:', error);
			} finally {
				setLoading(false);
			}
		};
		loadData();
	}, [candidate.public_id]);

	// Group attendance by batch
	const attendanceByBatch = useMemo(() => {
		const grouped = new Map<number, { batch: any; records: TrainingAttendance[] }>();

		attendance.forEach(record => {
			if (!record.batch) return;

			if (!grouped.has(record.batch_id)) {
				grouped.set(record.batch_id, { batch: record.batch, records: [] });
			}
			grouped.get(record.batch_id)!.records.push(record);
		});

		return Array.from(grouped.values());
	}, [attendance]);

	// Overall statistics
	const overallStats = useMemo(() => {
		const total = attendance.length;
		if (total === 0) return { present: 0, absent: 0, percentage: 0 };
		const present = attendance.filter(a => a.status === 'present').length;
		const absent = attendance.filter(a => a.status === 'absent').length;
		const percentage = (present / total) * 100;
		return { present, absent, percentage: percentage.toFixed(1) };
	}, [attendance]);

	// Batch-specific statistics
	const getBatchStats = (records: TrainingAttendance[]) => {
		const total = records.length;
		if (total === 0) return { present: 0, absent: 0, percentage: 0 };
		const present = records.filter(a => a.status === 'present').length;
		const absent = records.filter(a => a.status === 'absent').length;
		const percentage = (present / total) * 100;
		return { present, absent, percentage: percentage.toFixed(1) };
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	const getStatusChip = (status: string) => {
		switch (status) {
			case 'present':
				return <Chip label="Present" size="small" sx={{ bgcolor: '#ebf5e0', color: '#318400', fontWeight: 700, borderRadius: '4px' }} />;
			case 'absent':
				return <Chip label="Absent" size="small" sx={{ bgcolor: '#fff1f0', color: '#d91d11', fontWeight: 700, borderRadius: '4px' }} />;
			default:
				return <Chip label={status.toUpperCase()} size="small" variant="outlined" />;
		}
	};

	return (
		<Paper
			variant="outlined"
			sx={{ p: 3, borderRadius: 0, border: '1px solid #d5dbdb', boxShadow: '0 1px 1px 0 rgba(0,28,36,0.1)' }}
		>
			<SectionHeader title="Attendance History" icon={<AttendanceIcon />} />

			{attendance.length > 0 ? (
				<>
					{/* Overall Summary Strip */}
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: '#f8f9fa', p: 2.5, border: '1px solid #eaeded', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Sessions
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>{attendance.length}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Present Sessions
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#318400' }}>{overallStats.present}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Absent Sessions
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#d91d11' }}>{overallStats.absent}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: '#eaeded' }} />
						<Box>
							<Typography variant="caption" sx={{ color: '#545b64', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Overall Attendance
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: '#232f3e' }}>{overallStats.percentage}%</Typography>
						</Box>
					</Box>

					{/* Attendance by Batch */}
					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#232f3e', mb: 2 }}>
						Attendance by Training Batch
					</Typography>

					{attendanceByBatch.map(({ batch, records }, index) => {
						const batchStats = getBatchStats(records);
						return (
							<Accordion
								key={batch.id}
								defaultExpanded={index === 0}
								sx={{
									mb: 2,
									border: '1px solid #eaeded',
									'&:before': { display: 'none' },
									boxShadow: 'none'
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{ bgcolor: '#fafafa', '&:hover': { bgcolor: '#f5f5f5' } }}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
										<BatchIcon sx={{ color: '#ec7211', fontSize: 20 }} />
										<Box sx={{ flexGrow: 1 }}>
											<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#232f3e' }}>
												{batch.batch_name}
											</Typography>
											<Typography variant="caption" sx={{ color: '#545b64' }}>
												{records.length} sessions • {batchStats.percentage}% attendance
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', gap: 3, mr: 2 }}>
											<Box>
												<Typography variant="caption" sx={{ color: '#545b64', display: 'block' }}>Present</Typography>
												<Typography variant="body2" sx={{ fontWeight: 700, color: '#318400' }}>{batchStats.present}</Typography>
											</Box>
											<Box>
												<Typography variant="caption" sx={{ color: '#545b64', display: 'block' }}>Absent</Typography>
												<Typography variant="body2" sx={{ fontWeight: 700, color: '#d91d11' }}>{batchStats.absent}</Typography>
											</Box>
										</Box>
									</Box>
								</AccordionSummary>
								<AccordionDetails sx={{ p: 0 }}>
									<TableContainer>
										<Table size="small">
											<TableHead sx={{ bgcolor: '#f8f9fa' }}>
												<TableRow>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>DATE</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>STATUS</TableCell>
													<TableCell sx={{ fontWeight: 700, color: '#545b64', py: 1.5 }}>REMARKS</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{records.map((row) => (
													<TableRow key={row.id} hover>
														<TableCell sx={{ color: '#232f3e', fontWeight: 500 }}>
															{format(new Date(row.date), 'MMM dd, yyyy')}
														</TableCell>
														<TableCell>{getStatusChip(row.status)}</TableCell>
														<TableCell sx={{ color: '#545b64', fontStyle: row.remarks ? 'normal' : 'italic' }}>
															{row.remarks || 'No remarks provided'}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								</AccordionDetails>
							</Accordion>
						);
					})}
				</>
			) : (
				<Box sx={{ textAlign: 'center', py: 8, bgcolor: '#f8f9fa', border: '1px dashed #eaeded', borderRadius: '2px' }}>
					<PendingIcon sx={{ fontSize: 48, color: '#aab7b8', mb: 2 }} />
					<Typography variant="h6" sx={{ color: '#545b64', fontWeight: 600 }}>No Attendance Records Found</Typography>
					<Typography variant="body2" color="text.secondary">
						This candidate has not participated in any training sessions yet or is not allocated to an active batch.
					</Typography>
				</Box>
			)}
		</Paper>
	);
};

export default CandidateAttendanceTab;
