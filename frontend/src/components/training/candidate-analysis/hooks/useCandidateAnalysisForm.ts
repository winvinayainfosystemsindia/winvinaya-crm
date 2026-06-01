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
	onSave: (data: any) => Promise<void>;
}

export const useCandidateAnalysisForm = ({
	open,
	onClose,
	batchId,
	analysis,
	onSave
}: UseCandidateAnalysisFormProps) => {
	const toast = useToast();
	const { allocations } = useSelector((state: RootState) => state.training);
	const { user } = useSelector((state: RootState) => state.auth);
	
	// Candidates in this batch
	const candidates = useMemo(() => {
		return allocations
			.filter(a => a.status === 'in_training' || a.status === 'moved_to_placement')
			.map(a => ({
				id: a.candidate_id,
				name: a.candidate?.name || 'Unknown'
			}));
	}, [allocations]);

	const [candidateId, setCandidateId] = useState<number | ''>('');
	const [analystName, setAnalystName] = useState('');
	const [analysisDate, setAnalysisDate] = useState(new Date().toISOString().split('T')[0]);
	const [strengths, setStrengths] = useState('');
	const [weaknesses, setWeaknesses] = useState('');
	const [opportunities, setOpportunities] = useState('');
	const [threats, setThreats] = useState('');
	
	// SWOT 4 ratings and remarks stored in the "other" column
	const [strengthsRating, setStrengthsRating] = useState(5);
	const [weaknessesRating, setWeaknessesRating] = useState(5);
	const [opportunitiesRating, setOpportunitiesRating] = useState(5);
	const [threatsRating, setThreatsRating] = useState(5);
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
				technical_rating: strengthsRating,
				communication_rating: opportunitiesRating,
				attitude_rating: weaknessesRating,
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
			
			// Load SWOT ratings and remarks from the "other" column
			const otherData = analysis.other as any || {};
			setStrengthsRating(otherData.strengths_rating !== undefined ? otherData.strengths_rating : 5);
			setWeaknessesRating(otherData.weaknesses_rating !== undefined ? otherData.weaknesses_rating : 5);
			setOpportunitiesRating(otherData.opportunities_rating !== undefined ? otherData.opportunities_rating : 5);
			setThreatsRating(otherData.threats_rating !== undefined ? otherData.threats_rating : 5);
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
			
			setStrengthsRating(5);
			setWeaknessesRating(5);
			setOpportunitiesRating(5);
			setThreatsRating(5);
			setRemarks('');
			
			setSkills([]);
			setRecommendation('ready_for_placement');
			setStatus('in-progress');
		}
	}, [analysis, open, user]);

	// Calculate overall score automatically based on the 4 SWOT ratings
	const overallRating = useMemo(() => {
		return parseFloat(((strengthsRating + weaknessesRating + opportunitiesRating + threatsRating) / 4).toFixed(1));
	}, [strengthsRating, weaknessesRating, opportunitiesRating, threatsRating]);

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
					strengths_rating: strengthsRating,
					weaknesses_rating: weaknessesRating,
					opportunities_rating: opportunitiesRating,
					threats_rating: threatsRating,
					remarks: remarks.trim()
				},
				technical_rating: 0,
				communication_rating: 0,
				attitude_rating: 0,
				overall_rating: overallRating,
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
		strengthsRating,
		setStrengthsRating,
		weaknessesRating,
		setWeaknessesRating,
		opportunitiesRating,
		setOpportunitiesRating,
		threatsRating,
		setThreatsRating,
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
		overallRating,
		handleAIAssist,
		handleAddSkill,
		handleRemoveSkill,
		handleSkillChange,
		handleSubmit
	};
};
