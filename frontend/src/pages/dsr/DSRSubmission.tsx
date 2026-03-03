import React, { useEffect, useState, useMemo } from 'react';
import {
	Box,
	Container,
	Typography,
	Paper,
	TextField,
	Button,
	IconButton,
	Autocomplete,
	Card,
	CardContent,
	Grid,
	Alert,
	TableContainer,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Table,
	CircularProgress
} from '@mui/material';
import {
	Add as AddIcon,
	Delete as DeleteIcon,
	Save as SaveIcon,
	Send as SendIcon,
	History as HistoryIcon,
	Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { DSRItem } from '../../models/dsr';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	fetchProjects,
	fetchActivitiesForProject,
	createEntry,
	submitEntry,
	fetchEntry
} from '../../store/slices/dsrSlice';
import useToast from '../../hooks/useToast';

const DSRSubmission: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const entryId = searchParams.get('id');
	const dispatch = useAppDispatch();
	const toast = useToast();

	const { projects, activitiesByProject, loading } = useAppSelector((state) => state.dsr);

	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [items, setItems] = useState<Partial<DSRItem>[]>([
		{ project_public_id: '', activity_public_id: '', description: '', start_time: '09:00', end_time: '10:00', hours: 1 }
	]);
	const [submitting, setSubmitting] = useState(false);
	const [permissionError, setPermissionError] = useState<string | null>(null);

	useEffect(() => {
		dispatch(fetchProjects({ skip: 0, limit: 500, active_only: true }));

		if (entryId) {
			loadEntry(entryId);
		}
	}, [dispatch, entryId]);

	const loadEntry = async (id: string) => {
		try {
			const entry = await dispatch(fetchEntry(id)).unwrap();
			setReportDate(entry.report_date);
			setItems(entry.items);

			// Pre-fetch activities for each unique project in the entry
			const uniqueProjects = Array.from(new Set(entry.items.map(i => i.project_public_id)));
			uniqueProjects.forEach(pid => {
				if (pid) dispatch(fetchActivitiesForProject(pid));
			});
		} catch (error: any) {
			toast.error(error || 'Failed to load draft');
		}
	};

	const calculateHours = (start: string, end: string) => {
		if (!start || !end) return 0;
		const [sH, sM] = start.split(':').map(Number);
		const [eH, eM] = end.split(':').map(Number);
		const startMin = sH * 60 + sM;
		const endMin = eH * 60 + eM;
		const diff = endMin - startMin;
		return diff > 0 ? parseFloat((diff / 60).toFixed(2)) : 0;
	};

	const handleRowChange = (index: number, field: keyof DSRItem, value: any) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };

		if (field === 'project_public_id') {
			newItems[index].activity_public_id = '';
			if (value) {
				dispatch(fetchActivitiesForProject(value));
			}
		}

		if (field === 'start_time' || field === 'end_time') {
			const hours = calculateHours(newItems[index].start_time || '', newItems[index].end_time || '');
			newItems[index].hours = hours;
		}

		setItems(newItems);
	};

	const addRow = () => {
		const lastItem = items[items.length - 1];
		setItems([...items, {
			project_public_id: '',
			activity_public_id: '',
			description: '',
			start_time: lastItem?.end_time || '09:00',
			end_time: '',
			hours: 0
		}]);
	};

	const removeRow = (index: number) => {
		if (items.length === 1) return;
		setItems(items.filter((_, i) => i !== index));
	};

	const totalHours = useMemo(() => items.reduce((sum, item) => sum + (item.hours || 0), 0), [items]);

	const validate = () => {
		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			if (!it.project_public_id || !it.activity_public_id || !it.description || !it.start_time || !it.end_time) {
				toast.warning(`Please fill all fields in row ${i + 1}`);
				return false;
			}
			if ((it.hours || 0) <= 0) {
				toast.warning(`Invalid time range in row ${i + 1}`);
				return false;
			}
		}
		return true;
	};

	const handleSaveDraft = async () => {
		if (!validate()) return;
		setSubmitting(true);
		try {
			await dispatch(createEntry({
				report_date: reportDate,
				items: items as any
			})).unwrap();
			toast.success('Draft saved successfully');
			setPermissionError(null);
		} catch (error: any) {
			if (error?.toLowerCase().includes('permission') || error?.toLowerCase().includes('date')) {
				setPermissionError(error);
			} else {
				toast.error(error || 'Failed to save draft');
			}
		} finally {
			setSubmitting(false);
		}
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setSubmitting(true);
		try {
			const entry = await dispatch(createEntry({
				report_date: reportDate,
				items: items as any
			})).unwrap();
			await dispatch(submitEntry(entry.public_id)).unwrap();
			toast.success('DSR submitted successfully!');
			setTimeout(() => navigate('/dashboard/dsr'), 1500);
		} catch (error: any) {
			toast.error(error || 'Failed to submit DSR');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 3 }}>
			<Container maxWidth="xl">
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Box>
						<Typography variant="h4" sx={{ fontWeight: 300, color: 'text.primary', mb: 0.5 }}>
							{entryId ? 'Edit Draft Report' : 'Daily Status Report'}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Report your activities and hours for the day
						</Typography>
					</Box>
					<Button
						variant="outlined"
						startIcon={<HistoryIcon />}
						onClick={() => navigate('/dashboard/dsr')}
						sx={{ color: '#232f3e', borderColor: '#d5dbdb' }}
					>
						View History
					</Button>
				</Box>

				{permissionError && (
					<Alert severity="error" icon={<WarningIcon />} sx={{ mb: 3 }}>
						{permissionError}
					</Alert>
				)}

				<Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 1 }}>
					<Grid container spacing={3} alignItems="center">
						<Grid size={{ xs: 12, sm: 4, md: 3 } as any}>
							<TextField
								label="Reporting Date"
								type="date"
								fullWidth
								value={reportDate}
								onChange={(e) => setReportDate(e.target.value)}
								InputLabelProps={{ shrink: true }}
								size="small"
							/>
						</Grid>
						<Grid size={{ xs: 12, sm: 8, md: 9 } as any} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
							<Card variant="outlined" sx={{ minWidth: 200, bgcolor: '#f8f9fa' }}>
								<CardContent sx={{ py: '12px !important', textAlign: 'center' }}>
									<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
										TOTAL HOURS
									</Typography>
									<Typography variant="h5" sx={{ fontWeight: 700, color: totalHours > 8 ? 'success.main' : 'text.primary' }}>
										{totalHours.toFixed(2)}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					</Grid>
				</Paper>

				<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1 }}>
					<Table sx={{ minWidth: 900 }}>
						<TableHead sx={{ bgcolor: '#f2f3f3' }}>
							<TableRow>
								<TableCell sx={{ fontWeight: 700, width: '20%' }}>Project</TableCell>
								<TableCell sx={{ fontWeight: 700, width: '20%' }}>Activity</TableCell>
								<TableCell sx={{ fontWeight: 700, width: '30%' }}>Description</TableCell>
								<TableCell sx={{ fontWeight: 700, width: '10%' }}>Start</TableCell>
								<TableCell sx={{ fontWeight: 700, width: '10%' }}>End</TableCell>
								<TableCell sx={{ fontWeight: 700, width: '5%' }}>Hrs</TableCell>
								<TableCell sx={{ width: '5%' }} />
							</TableRow>
						</TableHead>
						<TableBody>
							{items.map((item, index) => (
								<TableRow key={index}>
									<TableCell>
										<Autocomplete
											options={projects}
											getOptionLabel={(option) => option.name}
											value={projects.find(p => p.public_id === item.project_public_id) || null}
											onChange={(_, val) => handleRowChange(index, 'project_public_id', val?.public_id || '')}
											loading={loading && projects.length === 0}
											renderInput={(params) => <TextField {...params} size="small" placeholder="Select Project" />}
										/>
									</TableCell>
									<TableCell>
										<Autocomplete
											options={item.project_public_id ? (activitiesByProject[item.project_public_id] || []) : []}
											getOptionLabel={(option) => option.name}
											value={(item.project_public_id ? activitiesByProject[item.project_public_id] : [])?.find(a => a.public_id === item.activity_public_id) || null}
											onChange={(_, val) => handleRowChange(index, 'activity_public_id', val?.public_id || '')}
											disabled={!item.project_public_id}
											renderInput={(params) => <TextField {...params} size="small" placeholder="Select Activity" />}
										/>
									</TableCell>
									<TableCell>
										<TextField
											fullWidth
											size="small"
											multiline
											placeholder="What did you work on?"
											value={item.description}
											onChange={(e) => handleRowChange(index, 'description', e.target.value)}
										/>
									</TableCell>
									<TableCell>
										<TextField
											type="time"
											size="small"
											fullWidth
											value={item.start_time}
											onChange={(e) => handleRowChange(index, 'start_time', e.target.value)}
										/>
									</TableCell>
									<TableCell>
										<TextField
											type="time"
											size="small"
											fullWidth
											value={item.end_time}
											onChange={(e) => handleRowChange(index, 'end_time', e.target.value)}
										/>
									</TableCell>
									<TableCell>
										<Typography variant="body2" fontWeight={700}>
											{item.hours?.toFixed(1) || '0'}
										</Typography>
									</TableCell>
									<TableCell>
										<IconButton color="error" size="small" onClick={() => removeRow(index)} disabled={items.length === 1}>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
							<TableRow>
								<TableCell colSpan={7}>
									<Button startIcon={<AddIcon />} onClick={addRow} sx={{ color: '#1a73e8', textTransform: 'none' }}>
										Add more activities
									</Button>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>

				<Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
					<Button
						variant="outlined"
						startIcon={<SaveIcon />}
						onClick={handleSaveDraft}
						disabled={submitting}
						sx={{ color: '#232f3e', borderColor: '#d5dbdb', px: 4 }}
					>
						Save Draft
					</Button>
					<Button
						variant="contained"
						startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
						onClick={handleSubmit}
						disabled={submitting}
						sx={{ bgcolor: '#232f3e', '&:hover': { bgcolor: '#1a242f' }, px: 4 }}
					>
						Submit DSR
					</Button>
				</Box>
			</Container>
		</Box>
	);
};

export default DSRSubmission;
