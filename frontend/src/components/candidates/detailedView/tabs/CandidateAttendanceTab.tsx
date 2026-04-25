import React, { useState, useEffect, useMemo } from 'react';
import {
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
	AccordionDetails,
	alpha,
	useTheme
} from '@mui/material';
import {
	EventAvailable as AttendanceIcon,
	HourglassEmpty as PendingIcon,
	ExpandMore as ExpandMoreIcon,
	School as BatchIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { SectionHeader, SectionCard } from '../DetailedViewCommon';
import trainingExtensionService from '../../../../services/trainingExtensionService';
import type { TrainingAttendance } from '../../../../models/training';
import type { Candidate } from '../../../../models/candidate';

interface CandidateAttendanceTabProps {
	candidate: Candidate;
}

const CandidateAttendanceTab: React.FC<CandidateAttendanceTabProps> = ({ candidate }) => {
	const theme = useTheme();
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
		if (total === 0) return { present: 0, absent: 0, percentage: '0' };
		const present = attendance.filter(a => a.status === 'present').length;
		const absent = attendance.filter(a => a.status === 'absent').length;
		const percentage = (present / total) * 100;
		return { present, absent, percentage: percentage.toFixed(1) };
	}, [attendance]);

	const getBatchStats = (records: TrainingAttendance[]) => {
		const total = records.length;
		if (total === 0) return { present: 0, absent: 0, percentage: '0' };
		const present = records.filter(a => a.status === 'present').length;
		const absent = records.filter(a => a.status === 'absent').length;
		const percentage = (present / total) * 100;
		return { present, absent, percentage: percentage.toFixed(1) };
	};

	const getStatusChip = (status: string) => {
		if (status === 'present') {
			return <Chip label="Present" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', fontWeight: 700, borderRadius: '4px' }} />;
		}
		if (status === 'absent') {
			return <Chip label="Absent" size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', fontWeight: 700, borderRadius: '4px' }} />;
		}
		return <Chip label={status.toUpperCase()} size="small" sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), color: 'text.secondary', fontWeight: 700, borderRadius: '4px' }} />;
	};

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
				<CircularProgress size={24} sx={{ color: 'primary.main' }} />
			</Box>
		);
	}

	return (
		<SectionCard>
			<SectionHeader title="Attendance History" icon={<AttendanceIcon />} />

			{attendance.length > 0 ? (
				<>
					<Box sx={{ display: 'flex', gap: 6, mb: 4, bgcolor: alpha(theme.palette.background.default, 0.5), p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: '2px' }}>
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Total Sessions
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>{attendance.length}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Present
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>{overallStats.present}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Absent
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'error.main' }}>{overallStats.absent}</Typography>
						</Box>
						<Divider orientation="vertical" flexItem sx={{ borderColor: 'divider' }} />
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
								Attendance %
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main' }}>{overallStats.percentage}%</Typography>
						</Box>
					</Box>

					<Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 2 }}>
						Attendance History by Training Batch
					</Typography>

					{attendanceByBatch.map(({ batch, records }, index) => {
						const batchStats = getBatchStats(records);
						return (
							<Accordion
								key={batch.id}
								defaultExpanded={index === 0}
								elevation={0}
								sx={{
									mb: 2,
									border: '1px solid',
									borderColor: 'divider',
									'&:before': { display: 'none' },
									boxShadow: 'none'
								}}
							>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									sx={{ bgcolor: alpha(theme.palette.background.default, 0.3), '&:hover': { bgcolor: alpha(theme.palette.background.default, 0.6) } }}
								>
									<Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
										<BatchIcon sx={{ color: 'primary.main', fontSize: 20 }} />
										<Box sx={{ flexGrow: 1 }}>
											<Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
												{batch.batch_name}
											</Typography>
											<Typography variant="caption" sx={{ color: 'text.secondary' }}>
												{records.length} sessions • {batchStats.present} present • {batchStats.absent} absent • {batchStats.percentage}% rate
											</Typography>
										</Box>
										<Box sx={{ display: 'flex', gap: 3, mr: 2 }}>
											<Box>
												<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Rate</Typography>
												<Typography variant="body2" sx={{ fontWeight: 700, color: 'info.main' }}>{batchStats.percentage}%</Typography>
											</Box>
										</Box>
									</Box>
								</AccordionSummary>
								<AccordionDetails sx={{ p: 0 }}>
									<TableContainer>
										<Table size="small">
											<TableHead sx={{ bgcolor: alpha(theme.palette.background.default, 0.5) }}>
												<TableRow>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>DATE</TableCell>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>STATUS</TableCell>
													<TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>REMARK</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{records.map((row) => (
													<TableRow key={row.id} hover>
														<TableCell sx={{ color: 'text.primary', fontWeight: 500 }}>
															{format(new Date(row.date), 'MMM dd, yyyy')}
														</TableCell>
														<TableCell>{getStatusChip(row.status)}</TableCell>
														<TableCell sx={{ color: 'text.secondary', fontStyle: row.remarks ? 'normal' : 'italic' }}>
															{row.remarks || 'No remarks'}
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
				<Box sx={{ textAlign: 'center', py: 8, bgcolor: alpha(theme.palette.background.default, 0.5), border: '1px dashed', borderColor: 'divider', borderRadius: '2px' }}>
					<PendingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
					<Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>No Attendance Records</Typography>
					<Typography variant="body2" color="text.secondary">
						Attendance history will be displayed here once the candidate starts attending training sessions.
					</Typography>
				</Box>
			)}
		</SectionCard>
	);
};

export default CandidateAttendanceTab;
