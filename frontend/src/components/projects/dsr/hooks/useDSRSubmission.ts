import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import {
	fetchProjects,
	fetchActivitiesForProject,
	createEntry,
	submitEntry,
	fetchEntry
} from '../../../../store/slices/dsrSlice';
import useToast from '../../../../hooks/useToast';
import type { DSRItem } from '../../../../models/dsr';

export const useDSRSubmission = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const entryId = searchParams.get('id');
	const dispatch = useAppDispatch();
	const toast = useToast();

	const { projects, activitiesByProject, loading: storeLoading } = useAppSelector((state) => state.dsr);

	const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
	const [items, setItems] = useState<Partial<DSRItem>[]>([
		{ project_public_id: '', activity_public_id: '', description: '', start_time: '09:00', end_time: '10:00', hours: 1 }
	]);
	const [submitting, setSubmitting] = useState(false);
	const [permissionError, setPermissionError] = useState<string | null>(null);

	const loadEntry = useCallback(async (id: string) => {
		try {
			const entry = await dispatch(fetchEntry(id)).unwrap();
			setReportDate(entry.report_date);
			setItems(entry.items);

			const uniqueProjects = Array.from(new Set(entry.items.map(i => i.project_public_id)));
			uniqueProjects.forEach(pid => {
				if (pid) dispatch(fetchActivitiesForProject(pid));
			});
		} catch (error: any) {
			toast.error(error || 'Failed to load draft');
		}
	}, [dispatch, toast]);

	useEffect(() => {
		dispatch(fetchProjects({ skip: 0, limit: 500, active_only: true }));

		if (entryId) {
			loadEntry(entryId);
		}
	}, [dispatch, entryId, loadEntry]);

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

	return {
		entryId,
		projects,
		activitiesByProject,
		loading: storeLoading,
		reportDate,
		setReportDate,
		items,
		totalHours,
		submitting,
		permissionError,
		handleRowChange,
		addRow,
		removeRow,
		handleSaveDraft,
		handleSubmit,
		navigate
	};
};
