import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store/store';
import { type CandidateAnalysis, type AnalysisSkill } from '../../../../models/CandidateAnalysis';
import useToast from '../../../../hooks/useToast';
import aiService from '../../../../services/aiService';

interface UseCandidateAnalysisFormProps {
	open: boolean;
	onClose: () => void;
	batchId: number;
	analysis: CandidateAnalysis | null;
	analyses: CandidateAnalysis[];
	onSave: (data: any) => Promise<void>;
}

export const useCandidateAnalysisForm = ({
	open,
	onClose,
	batchId,
	analysis,
	analyses,
	onSave
}: UseCandidateAnalysisFormProps) => {
	const toast = useToast();
	const { allocations } = useSelector((state: RootState) => state.training);
	const { user } = useSelector((state: RootState) => state.auth);
	const currentUserName = user?.full_name || user?.username || 'System';
	
	// Candidates in this batch (filtered to only show unevaluated candidates when creating a new record)
	const candidates = useMemo(() => {
		const evaluatedCandidateIds = new Set(analyses.map(a => a.candidate_id));

		return allocations
			.filter(a => a.status === 'in_training' || a.status === 'moved_to_placement')
			.filter(a => {
				// If editing an existing analysis, always allow the candidate being edited
				if (analysis && analysis.candidate_id === a.candidate_id) return true;
				
				// Otherwise, only list candidates who don't have a SWOT analysis yet
				return !evaluatedCandidateIds.has(a.candidate_id);
			})
			.map(a => ({
				id: a.candidate_id,
				name: a.candidate?.name || 'Unknown'
			}));
	}, [allocations, analyses, analysis]);

	const [candidateId, setCandidateId] = useState<number | ''>('');
	const [analystName, setAnalystName] = useState('');
	const [analysisDate, setAnalysisDate] = useState(new Date().toISOString().split('T')[0]);
	const [strengths, setStrengths] = useState('');
	const [weaknesses, setWeaknesses] = useState('');
	const [opportunities, setOpportunities] = useState('');
	const [threats, setThreats] = useState('');
	
	// Remarks timeline stored inside the "other" column
	const [remarks, setRemarks] = useState('');

	const [skills, setSkills] = useState<AnalysisSkill[]>([]);
	const [recommendation, setRecommendation] = useState<string>('ready_for_placement');
	const [status, setStatus] = useState<string>('in-progress');
	const [submitting, setSubmitting] = useState(false);
	const [loadingStrengthsAI, setLoadingStrengthsAI] = useState(false);
	const [loadingWeaknessesAI, setLoadingWeaknessesAI] = useState(false);
	const [loadingOpportunitiesAI, setLoadingOpportunitiesAI] = useState(false);
	const [loadingThreatsAI, setLoadingThreatsAI] = useState(false);

	const handleAIAssist = async (type: 'strengths' | 'weaknesses' | 'opportunities' | 'threats', action: 'enhance' | 'generate') => {
		let currentText = '';
		let setLoader: (val: boolean) => void = () => {};
		let setText: (val: string) => void = () => {};

		if (type === 'strengths') {
			currentText = strengths;
			setLoader = setLoadingStrengthsAI;
			setText = setStrengths;
		} else if (type === 'weaknesses') {
			currentText = weaknesses;
			setLoader = setLoadingWeaknessesAI;
			setText = setWeaknesses;
		} else if (type === 'opportunities') {
			currentText = opportunities;
			setLoader = setLoadingOpportunitiesAI;
			setText = setOpportunities;
		} else if (type === 'threats') {
			currentText = threats;
			setLoader = setLoadingThreatsAI;
			setText = setThreats;
		}

		if (action === 'generate' && !candidateId) {
			toast.error('Please select a candidate first to generate personalized feedback.');
			return;
		}

		if (action === 'enhance') {
			const cleanText = currentText.replace(/<[^>]*>/g, '').trim();
			if (!cleanText) {
				toast.error('Please enter some rough feedback first so AI can polish it.');
				return;
			}
		}

		setLoader(true);
		try {
			const candName = candidates.find(c => c.id === Number(candidateId))?.name || '';
			const result = await aiService.enhanceFeedback({
				feedback_type: type,
				current_text: currentText,
				candidate_name: candName,
				skills: skills.map(s => ({ skill: s.skill, level: s.level, rating: s.rating })),
				action
			});

			if (result?.enhanced_text) {
				setText(result.enhanced_text);
				let typeLabel = '';
				if (type === 'strengths') typeLabel = 'Key strengths';
				else if (type === 'weaknesses') typeLabel = 'Areas of improvement';
				else if (type === 'opportunities') typeLabel = 'Opportunities & observations';
				else if (type === 'threats') typeLabel = 'Threats & challenges';
				
				toast.success(`${typeLabel} successfully ${action === 'enhance' ? 'polished' : 'generated'} by AI!`);
			} else {
				toast.error('Failed to get enhanced feedback from AI.');
			}
		} catch (err: any) {
			toast.error(err?.response?.data?.detail || err?.message || 'AI assistant failed.');
		} finally {
			setLoader(false);
		}
	};

	// Load data if editing or viewing
	useEffect(() => {
		if (analysis) {
			setCandidateId(analysis.candidate_id);
			setAnalystName(analysis.analyst_name || '');
			setAnalysisDate(analysis.analysis_date ? analysis.analysis_date.split('T')[0] : new Date().toISOString().split('T')[0]);
			setStrengths(analysis.strengths || '');
			setWeaknesses(analysis.weaknesses || '');
			setOpportunities(analysis.opportunities || '');
			setThreats(analysis.threats || '');
			
			// Load remarks from the "other" column
			const otherData = analysis.other as any || {};
			setRemarks(otherData.remarks || '');
			
			setSkills(analysis.skills || []);
			setRecommendation(analysis.recommendation);
			setStatus(analysis.status);
		} else {
			setCandidateId('');
			setAnalystName(user?.full_name || user?.username || '');
			setAnalysisDate(new Date().toISOString().split('T')[0]);
			setStrengths('');
			setWeaknesses('');
			setOpportunities('');
			setThreats('');
			
			setRemarks('');
			
			setSkills([]);
			setRecommendation('ready_for_placement');
			setStatus('in-progress');
		}
	}, [analysis, open, user]);

	const handleAddSkill = () => {
		setSkills(prev => [...prev, { skill: '', level: 'Beginner', rating: 5 }]);
	};

	const handleRemoveSkill = (idx: number) => {
		setSkills(prev => prev.filter((_, i) => i !== idx));
	};

	const handleSkillChange = (idx: number, field: keyof AnalysisSkill, val: any) => {
		setSkills(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!candidateId) {
			toast.error('Please select a candidate.');
			return;
		}
		
		setSubmitting(true);
		try {
			const payload = {
				batch_id: batchId,
				candidate_id: Number(candidateId),
				analyst_name: analystName.trim(),
				analysis_date: analysisDate ? new Date(analysisDate).toISOString() : new Date().toISOString(),
				strengths: strengths.trim(),
				weaknesses: weaknesses.trim(),
				opportunities: opportunities.trim(),
				threats: threats.trim(),
				other: {
					remarks: remarks.trim(),
					created_by: analysis ? (analysis.other?.created_by || analysis.analyst_name || 'System') : currentUserName,
					created_at: analysis ? (analysis.other?.created_at || analysis.analysis_date) : new Date().toISOString(),
					modified_by: currentUserName,
					modified_at: new Date().toISOString()
				},
				skills,
				recommendation,
				status
			};
			await onSave(payload);
			onClose();
		} catch (err: any) {
			toast.error(err?.message || 'Failed to save candidate analysis.');
		} finally {
			setSubmitting(false);
		}
	};

	return {
		candidates,
		candidateId,
		setCandidateId,
		analystName,
		setAnalystName,
		analysisDate,
		setAnalysisDate,
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
		setSkills,
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
	};
};
