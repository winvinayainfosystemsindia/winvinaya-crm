import React, { useMemo, useState } from 'react';
import {
	Box,
	Typography,
	Stack,
	Paper,
	Avatar,
	Chip,
	IconButton,
	Button,
	Tooltip,
	Divider,
	useTheme,
	CircularProgress,
	alpha
} from '@mui/material';
import {
	MoreVert as MoreIcon,
	History as HistoryIcon,
	TrendingUp as TrendingUpIcon,
	Schedule as ScheduleIcon,
	Settings as SettingsIcon,
	MoveToInbox as MoveToInboxIcon
} from '@mui/icons-material';
import {
	DndContext,
	DragOverlay,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	defaultDropAnimationSideEffects,
	useDroppable,
	type DragStartEvent,
	type DragEndEvent
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchMatchesForJobRole, updatePlacementStatus, type CandidateMatchResult } from '../../../../store/slices/placementMappingSlice';
import StatusChangeDialog from '../../mapping/dialogs/StatusChangeDialog';
import PlacementDetailDrawer from '../../mapping/details/PlacementDetailDrawer';
import PipelineSettingsDialog from './PipelineSettingsDialog';

// KANBAN_COLUMNS will now be generated dynamically from jobRole.pipeline_stages

const getScoreColor = (score: number) => {
	if (score >= 80) return '#1d8102';
	if (score >= 40) return '#ff9900';
	return '#d13212';
};

interface SortableCardProps {
	candidate: CandidateMatchResult;
	onViewHistory: (mappingId: number, name: string) => void;
}

const SortableCard: React.FC<SortableCardProps> = ({ candidate, onViewHistory }) => {
	const theme = useTheme();
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging
	} = useSortable({
		id: candidate.candidate_id.toString(),
		data: {
			type: 'Candidate',
			candidate
		}
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.3 : 1,
		zIndex: isDragging ? 1000 : 1,
	};

	return (
		<Paper
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			elevation={isDragging ? 8 : 0}
			sx={{
				p: 2,
				mb: 1.5,
				borderRadius: theme.shape.borderRadius,
				border: `1px solid ${theme.palette.divider}`,
				bgcolor: theme.palette.background.paper,
				position: 'relative',
				touchAction: 'none',
				cursor: isDragging ? 'grabbing' : 'grab',
				'&:hover': {
					borderColor: theme.palette.accent.main,
					boxShadow: theme.shadows[2]
				}
			}}
		>
			<Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
				<Avatar
					sx={{
						width: 32,
						height: 32,
						fontSize: '0.875rem',
						fontWeight: 700,
						bgcolor: getScoreColor(candidate.match_score)
					}}
				>
					{candidate.name[0]}
				</Avatar>
				<Box sx={{ flexGrow: 1 }}>
					<Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, lineHeight: 1.2 }}>
						{candidate.name}
					</Typography>
					<Typography variant="caption" color="textSecondary">
						Score: {candidate.match_score}%
					</Typography>
				</Box>
				<IconButton size="small" sx={{ mt: -0.5, mr: -0.5 }}>
					<MoreIcon fontSize="small" />
				</IconButton>
			</Stack>

			<Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
				{candidate.skills.slice(0, 2).map((skill: string, i: number) => (
					<Chip
						key={i}
						label={skill}
						size="small"
						sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#f3f3f3' }}
					/>
				))}
			</Stack>

			<Divider sx={{ my: 1.5 }} />

			<Stack direction="row" justifyContent="space-between" alignItems="center">
				<Stack direction="row" spacing={1}>
					<Tooltip title="View History/Lifecycle">
						<IconButton
							size="small"
							sx={{ color: theme.palette.primary.main }}
							onClick={(e) => {
								e.stopPropagation();
								candidate.mapping_id && onViewHistory(candidate.mapping_id, candidate.name);
							}}
						>
							<HistoryIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
					<Tooltip title="Task/Schedule">
						<IconButton size="small" onClick={(e) => e.stopPropagation()}>
							<ScheduleIcon sx={{ fontSize: 16 }} />
						</IconButton>
					</Tooltip>
				</Stack>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
					<TrendingUpIcon sx={{ fontSize: 14, color: getScoreColor(candidate.match_score) }} />
					<Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>
						{candidate.match_score > 70 ? 'High Potential' : 'Moderate'}
					</Typography>
				</Box>
			</Stack>
		</Paper>
	);
};

const getCategoryColor = (category: string, theme: any) => {
	switch (category) {
		case 'lead': return theme.palette.primary.main;
		case 'shortlisted': return '#6b38fb'; // Unique violet for shortlisted
		case 'interview': return theme.palette.accent.main;
		case 'offer': return theme.palette.success.main;
		case 'hired': return theme.palette.success.dark;
		case 'rejected': return theme.palette.error.main;
		case 'not_joined': return theme.palette.text.secondary;
		default: return theme.palette.divider;
	}
};

interface KanbanColumnProps {
	id: string;
	title: string;
	category: string;
	count: number;
	children: React.ReactNode;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, category, count, children }) => {
	const theme = useTheme();
	const { setNodeRef, isOver } = useDroppable({ id });
	const color = getCategoryColor(category, theme);

	return (
		<Box
			ref={setNodeRef}
			sx={{
				minWidth: 280,
				width: 280,
				flexShrink: 0,
				bgcolor: isOver ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.default,
				borderRadius: theme.shape.borderRadius,
				display: 'flex',
				flexDirection: 'column',
				maxHeight: '100%',
				border: '1px solid',
				borderColor: isOver ? (getCategoryColor(category, theme)) : theme.palette.divider,
				borderTop: `4px solid ${color}`,
				transition: theme.transitions.create(['background-color', 'border-color']),
				position: 'relative'
			}}
		>
			<Box sx={{
				p: 2,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottom: `1px solid ${theme.palette.divider}`,
				position: 'sticky',
				top: 0,
				bgcolor: isOver ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.default,
				zIndex: 2,
				borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`
			}}>
				<Stack direction="row" spacing={1.25} alignItems="center">
					<Typography variant="awsFieldLabel" sx={{ m: 0, color: theme.palette.text.primary, fontSize: '0.75rem' }}>
						{title}
					</Typography>
					<Chip
						label={count}
						size="small"
						sx={{
							height: 18,
							fontSize: '0.65rem',
							fontWeight: 700,
							bgcolor: theme.palette.background.paper,
							border: `1px solid ${theme.palette.divider}`
						}}
					/>
				</Stack>
			</Box>

			<Box sx={{ p: 1.5, overflowY: 'auto', flexGrow: 1, minHeight: 150 }}>
				{children}
			</Box>
		</Box>
	);
};

interface PipelineKanbanTabProps {
	jobRolePublicId: string;
}

const PipelineKanbanTab: React.FC<PipelineKanbanTabProps> = ({ jobRolePublicId }) => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const { matches, loading } = useAppSelector((state) => state.placementMapping);
	const mappedCandidates = useMemo(() => matches.filter(m => m.is_already_mapped), [matches]);

	// Dialog/Drawer State
	const [activeCandidate, setActiveCandidate] = useState<CandidateMatchResult | null>(null);
	const [draggedCandidate, setDraggedCandidate] = useState<CandidateMatchResult | null>(null);
	const [statusDialog, setStatusDialog] = useState<{ open: boolean, from: string, to: string } | null>(null);
	const [historyDrawer, setHistoryDrawer] = useState<{ open: boolean, id: number, name: string } | null>(null);
	const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

	const { currentJobRole: jobRole } = useAppSelector(state => state.jobRoles);

	const dynamicColumns = useMemo(() => {
		if (!jobRole?.pipeline_stages) return [];

		const columns: { id: string, title: string, stages: string[], category: string }[] = [];

		jobRole.pipeline_stages.forEach(stage => {
			columns.push({
				id: stage.id,
				title: stage.label,
				stages: [stage.id],
				category: stage.category
			});
		});

		return columns;
	}, [jobRole?.pipeline_stages]);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	React.useEffect(() => {
		if (jobRolePublicId) {
			dispatch(fetchMatchesForJobRole(jobRolePublicId));
		}
	}, [jobRolePublicId, dispatch]);

	const getColumnData = (stages: string[]) => {
		return mappedCandidates.filter(c => {
			const status = (c.status || 'mapped').toLowerCase();
			return stages.includes(status);
		});
	};

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const candidate = mappedCandidates.find(c => c.candidate_id.toString() === active.id);
		if (candidate) setDraggedCandidate(candidate);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setDraggedCandidate(null);

		if (!over) return;

		const candidateId = active.id;
		const overId = over.id.toString();

		const candidate = mappedCandidates.find(c => c.candidate_id.toString() === candidateId);
		if (!candidate) return;

		// Find which column it was dropped into
		const targetCol = dynamicColumns.find(col =>
			col.id === overId ||
			getColumnData(col.stages).some(c => c.candidate_id.toString() === overId)
		);

		if (targetCol) {
			const currentStatus = (candidate.status || 'mapped').toLowerCase();
			const isTargetStatusSame = targetCol.stages.includes(currentStatus);

			if (!isTargetStatusSame) {
				const toStatus = targetCol.stages[0]; // Take the primary stage of the column
				setActiveCandidate(candidate);
				setStatusDialog({
					open: true,
					from: candidate.status || 'Mapped',
					to: toStatus
				});
			}
		}
	};

	const handleConfirmStatusChange = async (remarks: string) => {
		if (activeCandidate && statusDialog) {
			try {
				await dispatch(updatePlacementStatus({
					mappingId: activeCandidate.mapping_id!,
					status: statusDialog.to,
					remarks
				})).unwrap();
				// Refresh data to show changes
				dispatch(fetchMatchesForJobRole(jobRolePublicId));
				setStatusDialog(null);
				setActiveCandidate(null);
			} catch (error) {
				console.error("Failed to update status", error);
			}
		}
	};

	if (loading && matches.length === 0) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
				<CircularProgress sx={{ color: '#ec7211' }} />
			</Box>
		);
	}

	return (
		<Box sx={{
			height: 'calc(100vh - 280px)',
			mt: 2,
			p: 2,
			bgcolor: theme.palette.background.paper,
			overflow: 'hidden',
			display: 'flex',
			flexDirection: 'column',
			borderRadius: theme.shape.borderRadius,
			border: `1px solid ${theme.palette.divider}`
		}}>
			<Box sx={{
				mb: 2,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottom: `1px solid ${theme.palette.divider}`,
				pb: 1
			}}>
				<Typography variant="awsSectionTitle">Recruitment Pipeline</Typography>
				<Button
					startIcon={<SettingsIcon />}
					size="small"
					onClick={() => setSettingsDialogOpen(true)}
					sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: '0.75rem' }}
				>
					Configure Pipeline
				</Button>
			</Box>

			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', px: 1, py: 1, height: '100%', alignItems: 'flex-start' }}>
					{dynamicColumns.map((col) => {
						const columnCandidates = getColumnData(col.stages);

						return (
							<Box key={col.id} sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>

								<KanbanColumn
									id={col.id}
									title={col.title}
									category={col.category}
									count={columnCandidates.length}
								>
									<SortableContext
										id={col.id}
										items={columnCandidates.map(c => c.candidate_id.toString())}
										strategy={verticalListSortingStrategy}
									>
										{columnCandidates.map((candidate) => (
											<SortableCard
												key={candidate.public_id}
												candidate={candidate}
												onViewHistory={(id, name) => setHistoryDrawer({ open: true, id, name })}
											/>
										))}
									</SortableContext>

									{columnCandidates.length === 0 && (
										<Box sx={{
											py: 8,
											textAlign: 'center',
											opacity: 0.5,
											border: `1px dashed ${theme.palette.divider}`,
											borderRadius: theme.shape.borderRadius,
											m: 1,
											bgcolor: alpha(theme.palette.background.default, 0.5)
										}}>
											<MoveToInboxIcon sx={{ fontSize: 28, mb: 1.5, color: theme.palette.text.secondary }} />
											<Typography variant="caption" display="block" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
												Drop candidate here
											</Typography>
										</Box>
									)}
								</KanbanColumn>
							</Box>
						);
					})}
				</Box>

				<DragOverlay dropAnimation={{
					sideEffects: defaultDropAnimationSideEffects({
						styles: {
							active: {
								opacity: '0.5',
							},
						},
					}),
				}}>
					{draggedCandidate ? (
						<SortableCard
							candidate={draggedCandidate}
							onViewHistory={() => { }}
						/>
					) : null}
				</DragOverlay>
			</DndContext>

			{/* Status Change Dialog */}
			{statusDialog && activeCandidate && (
				<StatusChangeDialog
					open={statusDialog.open}
					onClose={() => { setStatusDialog(null); setActiveCandidate(null); }}
					onConfirm={handleConfirmStatusChange}
					candidateName={activeCandidate.name}
					fromStatus={statusDialog.from}
					toStatus={statusDialog.to}
					fromStatusLabel={jobRole?.pipeline_stages?.find(s => s.id === statusDialog.from)?.label}
					toStatusLabel={jobRole?.pipeline_stages?.find(s => s.id === statusDialog.to)?.label}
					loading={loading}
				/>
			)}

			{/* History Drawer */}
			{historyDrawer && (
				<PlacementDetailDrawer
					open={historyDrawer.open}
					onClose={() => setHistoryDrawer(null)}
					mappingId={historyDrawer.id}
					candidateName={historyDrawer.name}
					jobTitle="Candidate Lifecycle"
				/>
			)}

			<PipelineSettingsDialog
				open={settingsDialogOpen}
				onClose={() => setSettingsDialogOpen(false)}
				jobRole={jobRole!}
			/>
		</Box>
	);
};

export default PipelineKanbanTab;
