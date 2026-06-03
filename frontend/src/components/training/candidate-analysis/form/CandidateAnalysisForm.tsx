import React from 'react';
import { Dialog } from '@mui/material';
import { type CandidateAnalysis } from '../../../../models/CandidateAnalysis';
import { useCandidateAnalysisForm } from '../hooks/useCandidateAnalysisForm';
import EnterpriseForm, { type FormStep } from '../../../common/form/EnterpriseForm';

import BasicDetailsTab from './tabs/BasicDetailsTab';
import PerformanceRatingsTab from './tabs/PerformanceRatingsTab';
import FeedbackTab from './tabs/FeedbackTab';
import CompetencyMappingTab from './tabs/CompetencyMappingTab';

interface CandidateAnalysisFormProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	analysis: CandidateAnalysis | null;
	analyses: CandidateAnalysis[];
	viewMode?: boolean;
	onSave: (data: any) => Promise<void>;
}

const CandidateAnalysisForm: React.FC<CandidateAnalysisFormProps> = ({
	open,
	onClose,
	batchId,
	analysis,
	analyses,
	viewMode = false,
	onSave
}) => {
	const {
		candidates,
		candidateId,
		setCandidateId,
		analystName,
		analysisDate,
		strengths,
		setStrengths,
		weaknesses,
		setWeaknesses,
		opportunities,
		setOpportunities,
		threats,
		setThreats,
		remarks,
		setRemarks,
		skills,
		recommendation,
		setRecommendation,
		status,
		setStatus,
		submitting,
		loadingStrengthsAI,
		loadingWeaknessesAI,
		loadingOpportunitiesAI,
		loadingThreatsAI,
		currentUserName,
		handleAIAssist,
		handleAddSkill,
		handleRemoveSkill,
		handleSkillChange,
		handleSubmit
	} = useCandidateAnalysisForm({
		open,
		onClose,
		batchId,
		analysis,
		analyses,
		onSave
	});

	const steps: FormStep[] = React.useMemo(() => [
		{
			label: 'Basic Details',
			description: 'Metadata & context',
			content: (
				<BasicDetailsTab
					candidateId={candidateId}
					setCandidateId={setCandidateId}
					analystName={analystName}
					analysisDate={analysisDate}
					candidates={candidates}
					viewMode={!!viewMode}
					isEdit={!!analysis}
					other={analysis?.other}
				/>
			)
		},
		{
			label: 'Competency Mapping',
			description: 'Skill proficiencies',
			content: (
				<CompetencyMappingTab
					skills={skills}
					handleAddSkill={handleAddSkill}
					handleRemoveSkill={handleRemoveSkill}
					handleSkillChange={handleSkillChange}
					viewMode={!!viewMode}
				/>
			)
		},
		{
			label: 'Feedback',
			description: 'SWOT Analysis commenting console',
			content: (
				<FeedbackTab
					strengths={strengths}
					setStrengths={setStrengths}
					weaknesses={weaknesses}
					setWeaknesses={setWeaknesses}
					opportunities={opportunities}
					setOpportunities={setOpportunities}
					threats={threats}
					setThreats={setThreats}
					loadingStrengthsAI={loadingStrengthsAI}
					loadingWeaknessesAI={loadingWeaknessesAI}
					loadingOpportunitiesAI={loadingOpportunitiesAI}
					loadingThreatsAI={loadingThreatsAI}
					handleAIAssist={handleAIAssist}
					viewMode={!!viewMode}
				/>
			)
		},
		{
			label: 'Remarks & Status',
			description: 'Evaluation comments and status',
			content: (
				<PerformanceRatingsTab
					remarks={remarks}
					setRemarks={setRemarks}
					recommendation={recommendation}
					setRecommendation={setRecommendation}
					status={status}
					setStatus={setStatus}
					viewMode={!!viewMode}
					analystName={currentUserName}
				/>
			)
		}
	], [
		candidateId,
		setCandidateId,
		analystName,
		analysisDate,
		candidates,
		viewMode,
		analysis,
		skills,
		handleAddSkill,
		handleRemoveSkill,
		handleSkillChange,
		strengths,
		setStrengths,
		weaknesses,
		setWeaknesses,
		opportunities,
		setOpportunities,
		threats,
		setThreats,
		loadingStrengthsAI,
		loadingWeaknessesAI,
		loadingOpportunitiesAI,
		loadingThreatsAI,
		handleAIAssist,
		remarks,
		setRemarks,
		currentUserName,
		recommendation,
		setRecommendation,
		status,
		setStatus
	]);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: 0,
					boxShadow: 'none',
					bgcolor: 'transparent'
				}
			}}
		>
			<EnterpriseForm
				title={viewMode ? 'Review Candidate Analysis' : analysis ? 'Edit Candidate Analysis' : 'Perform Candidate Analysis'}
				subtitle="Structured competency evaluation and performance analytics platform"
				mode={viewMode ? 'view' : analysis ? 'edit' : 'create'}
				steps={steps}
				onSave={handleSubmit}
				onCancel={onClose}
				isSubmitting={submitting}
				saveButtonText={viewMode ? 'Close' : analysis ? 'Update Analysis' : 'Finalize Analysis'}
			/>
		</Dialog>
	);
};

export default CandidateAnalysisForm;
