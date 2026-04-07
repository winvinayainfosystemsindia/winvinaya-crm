import { useMemo } from 'react';
import { parseTimeValue } from '../utils/planFormatters';
import type { TrainingBatchPlan } from '../../../../models/training';

export const usePlanMetrics = (weeklyPlan: TrainingBatchPlan[], allPlans: TrainingBatchPlan[], activeTab: number) => {
	const hoursBreakdown = useMemo(() => {
		const breakdown = {
			course: 0,
			hr_session: 0,
			mock_interview: 0,
			training_total: 0,
			unassigned_total: 0,
			break: 0,
			total: 0,
			details: {
				course: {} as Record<string, number>,
				hr_session: {} as Record<string, number>,
				mock_interview: {} as Record<string, number>,
				trainer: {} as Record<string, number>,
				unassigned: {} as Record<string, { hours: number; type: string }>
			}
		};

		const plansToProcess = activeTab === 1 ? allPlans : weeklyPlan;

		plansToProcess.forEach(entry => {
			const duration = parseTimeValue(entry.end_time) - parseTimeValue(entry.start_time);

			if (entry.activity_type === 'course') breakdown.course += duration;
			if (entry.activity_type === 'hr_session') breakdown.hr_session += duration;
			if (entry.activity_type === 'mock_interview') breakdown.mock_interview += duration;
			if (entry.activity_type === 'break') breakdown.break += duration;

			if (entry.activity_type !== 'break') {
				breakdown.training_total += duration;

				const type = entry.activity_type as 'course' | 'hr_session' | 'mock_interview';
				if (breakdown.details[type]) {
					breakdown.details[type][entry.activity_name] = (breakdown.details[type][entry.activity_name] || 0) + duration;
				}

				const trainerName = entry.trainer;
				if (trainerName) {
					breakdown.details.trainer[trainerName] = (breakdown.details.trainer[trainerName] || 0) + duration;
				} else {
					breakdown.unassigned_total += duration;
					const current = breakdown.details.unassigned[entry.activity_name] || { hours: 0, type: entry.activity_type };
					breakdown.details.unassigned[entry.activity_name] = {
						hours: current.hours + duration,
						type: entry.activity_type
					};
				}
			}

			breakdown.total += duration;
		});

		return breakdown;
	}, [weeklyPlan, allPlans, activeTab]);

	return { hoursBreakdown };
};
