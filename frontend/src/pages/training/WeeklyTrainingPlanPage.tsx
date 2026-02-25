import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { format } from 'date-fns';
import TrainingModuleLayout from '../../components/training/layout/TrainingModuleLayout';
import type { TrainingBatch } from '../../models/training';
import { useWeeklyPlanManager } from '../../components/training/plan/hooks/useWeeklyPlanManager';
import WeeklyPlanHeader from '../../components/training/plan/table/WeeklyPlanHeader';
import WeeklyPlanTable from '../../components/training/plan/table/WeeklyPlanTable';
import PlanEntryDialog from '../../components/training/plan/dialogs/PlanEntryDialog';
import WeeklyPlanStats from '../../components/training/plan/stats/WeeklyPlanStats';

import ConfirmDialog from '../../components/common/ConfirmDialog';
import BatchEventDialog from '../../components/training/attendance/dialogs/BatchEventDialog';

interface WeeklyPlanManagerProps {
	selectedBatch: TrainingBatch;
}

const WeeklyPlanManager: React.FC<WeeklyPlanManagerProps> = ({ selectedBatch }) => {
	const {
		weekDays,
		weekStart,
		weekNumber,
		currentDate,
		setCurrentDate,
		minDate,
		maxDate,
		canGoPrev,
		canGoNext,
		handlePrevWeek,
		handleNextWeek,
		dailyPlans,
		maxPeriods,
		dialogOpen,
		setDialogOpen,
		selectedEntry,
		setSelectedEntry,
		formLoading,
		setFormLoading,
		formErrors,
		setFormErrors,
		confirmDialog,
		setConfirmDialog,
		canEdit,
		handleOpenDialog,
		handleEditEntry,
		handleReplicateEntry,
		handleDeleteClick,
		validatePlan,
		activeTab,
		setActiveTab,
		hoursBreakdown,
		batchEvents,
		handleConfirmEvent,
		handleDeleteEvent
	} = useWeeklyPlanManager(selectedBatch);

	const [eventDialogOpen, setEventDialogOpen] = useState(false);
	const [eventTargetDate, setEventTargetDate] = useState<Date | null>(null);

	const handleOpenEventDialog = (date: Date) => {
		setEventTargetDate(date);
		setEventDialogOpen(true);
	};

	return (
		<Box>
			<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
				<Tabs value={activeTab} onChange={(_e, newValue) => setActiveTab(newValue)}>
					<Tab label="Weekly Schedule" />
					<Tab label="Overall Stats" />
				</Tabs>
			</Box>

			{activeTab === 0 ? (
				<>
					<WeeklyPlanHeader
						weekNumber={weekNumber}
						weekStart={weekStart}
						weekDays={weekDays}
						canGoPrev={canGoPrev}
						canGoNext={canGoNext}
						handlePrevWeek={handlePrevWeek}
						handleNextWeek={handleNextWeek}
						minDate={minDate}
						currentDate={currentDate}
						setCurrentDate={setCurrentDate}
						canEdit={canEdit}
					/>
					<WeeklyPlanTable
						weekDays={weekDays}
						maxPeriods={maxPeriods}
						dailyPlans={dailyPlans}
						minDate={minDate}
						maxDate={maxDate}
						canEdit={canEdit}
						handleOpenDialog={handleOpenDialog}
						handleEditEntry={handleEditEntry}
						handleDeleteEntry={handleDeleteClick}
						handleReplicateEntry={handleReplicateEntry}
						batchEvents={batchEvents}
						handleOpenEventDialog={handleOpenEventDialog}
						handleDeleteEvent={handleDeleteEvent}
					/>
				</>
			) : (
				<WeeklyPlanStats hoursBreakdown={hoursBreakdown} />
			)}

			<PlanEntryDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				selectedEntry={selectedEntry}
				setSelectedEntry={setSelectedEntry}
				formLoading={formLoading}
				setFormLoading={setFormLoading}
				selectedBatch={selectedBatch}
				formErrors={formErrors}
				setFormErrors={setFormErrors}
				validatePlan={validatePlan}
			/>

			<BatchEventDialog
				open={eventDialogOpen}
				onClose={() => setEventDialogOpen(false)}
				onConfirm={async (data) => {
					const success = await handleConfirmEvent({
						...data,
						date: eventTargetDate ? format(eventTargetDate, 'yyyy-MM-dd') : ''
					});
					if (success) setEventDialogOpen(false);
				}}
				selectedDate={eventTargetDate || new Date()}
			/>

			<ConfirmDialog
				open={confirmDialog.open}
				title={confirmDialog.title}
				message={confirmDialog.message}
				onConfirm={confirmDialog.onConfirm}
				onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
				loading={confirmDialog.loading}
				severity="error"
				confirmText="Delete"
			/>
		</Box>
	);
};

const WeeklyTrainingPlanPage: React.FC = () => {
	return (
		<TrainingModuleLayout
			title="Weekly Training Plan"
			subtitle="Design and manage structured learning journeys with precision scheduling."
		>
			{({ selectedBatch }) => (
				selectedBatch ? (
					<WeeklyPlanManager selectedBatch={selectedBatch} />
				) : null
			)}
		</TrainingModuleLayout>
	);
};

export default WeeklyTrainingPlanPage;
