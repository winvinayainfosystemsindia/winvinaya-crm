import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Button
} from '@mui/material';
import {
    Sync as SyncIcon,
    TrendingUp as ProgressIcon,
    EventNote as PlanIcon,
    Timer as ActualIcon
} from '@mui/icons-material';
import dsrProjectService from '../../../../services/dsrProjectService';
import useToast from '../../../../hooks/useToast';

interface SubjectSummary {
    name: string;
    trainer_name: string;
    planned_hours: number;
    actual_hours: number;
    completion_percentage: number;
    status: string;
}

interface TrainingSummaryData {
    project_name: string;
    batch_name: string;
    total_planned_hours: number;
    total_actual_hours: number;
    overall_completion_percentage: number;
    subjects: SubjectSummary[];
}

interface TrainingProjectSummaryProps {
    projectPublicId: string;
    refreshKey?: number;
}

const TrainingProjectSummary: React.FC<TrainingProjectSummaryProps> = ({ projectPublicId, refreshKey }) => {
    const [data, setData] = useState<TrainingSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const toast = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            const summary = await dsrProjectService.getTrainingSummary(projectPublicId);
            setData(summary);
        } catch (error) {
            console.error('Failed to fetch training summary:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectPublicId) {
            fetchData();
        }
    }, [projectPublicId, refreshKey]);

    const handleManualSync = async () => {
        setSyncing(true);
        try {
            await dsrProjectService.syncTrainingProject(projectPublicId);
            toast.success('Activities synchronized with batch plan');
            await fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.detail || 'Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} />
        </Box>
    );

    if (!data) return null;

    return (
        <Fade in={true} timeout={600}>
            <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#232f3e' }}>
                            Training Progress Summary
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Batch: {data.batch_name} • Planned vs. Actual Hours
                        </Typography>
                    </Box>
                    <Button 
                        startIcon={syncing ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
                        onClick={handleManualSync}
                        disabled={syncing}
                        size="small"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Re-Sync Plan
                    </Button>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, borderLeft: '4px solid #eb7211' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <PlanIcon fontSize="small" color="action" />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    Total Planned
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={300}>
                                {data.total_planned_hours} <Typography component="span" variant="body2">hrs</Typography>
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, borderLeft: '4px solid #1d8102' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ActualIcon fontSize="small" color="action" />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    Total Actual
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight={300}>
                                {data.total_actual_hours} <Typography component="span" variant="body2">hrs</Typography>
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 2, borderLeft: '4px solid #007eb9' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ProgressIcon fontSize="small" color="action" />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                    Overall Progress
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" fontWeight={300}>
                                    {data.overall_completion_percentage}%
                                </Typography>
                                <Box sx={{ flexGrow: 1 }}>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(data.overall_completion_percentage, 100)} 
                                        sx={{ height: 8, borderRadius: 4, bgcolor: '#e9eded' }}
                                    />
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #d5dbdb' }}>
                    <Table size="small">
                        <TableHead sx={{ bgcolor: '#f3f3f3' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Subject / Module</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Trainer</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Planned</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Actual</TableCell>
                                <TableCell sx={{ fontWeight: 700, width: '20%' }}>Progress</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.subjects.map((subj, index) => (
                                <TableRow key={index} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{subj.name}</TableCell>
                                    <TableCell>{subj.trainer_name}</TableCell>
                                    <TableCell align="right">{subj.planned_hours}h</TableCell>
                                    <TableCell align="right">{subj.actual_hours}h</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={Math.min(subj.completion_percentage, 100)}
                                                    color={subj.completion_percentage >= 100 ? "success" : "primary"}
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                            <Typography variant="caption" sx={{ minWidth: 35 }}>
                                                {subj.completion_percentage}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip 
                                            label={subj.status} 
                                            size="small" 
                                            color={subj.status === 'completed' ? 'success' : 'default'}
                                            variant="outlined"
                                            sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 20 }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Fade>
    );
};

interface FadeProps {
    children: React.ReactElement<any>;
    in: boolean;
    timeout: number;
}

const Fade: React.FC<FadeProps> = ({ children, in: inProp, timeout }) => {
    const [opacity, setOpacity] = useState(0);
    useEffect(() => {
        if (inProp) setOpacity(1);
    }, [inProp]);
    
    return React.cloneElement(children, {
        style: {
            ...(children.props as any).style,
            opacity,
            transition: `opacity ${timeout}ms ease-in-out`
        }
    } as any);
};

export default TrainingProjectSummary;
