import { type CandidateAnalysis, type CandidateAnalysisCreate, type CandidateAnalysisUpdate } from '../models/CandidateAnalysis';

// Helper to pre-populate dummy analysis records for candidates in the batch
const getPrePopulatedAnalyses = (batchId: number): CandidateAnalysis[] => {
	const now = new Date().toISOString();
	
	// Create some pre-populated premium records for local testing
	return [
		{
			id: 101,
			batch_id: batchId,
			candidate_id: 1,
			analyst_name: 'David R. (Senior Trainer)',
			analysis_date: now.split('T')[0],
			strengths: 'Exceptional logical thinking, very strong Python skills, and great problem solving. Fast learner under pressure.',
			weaknesses: 'Can be slightly nervous during verbal communication, needs to work on speech pacing.',
			technical_rating: 9,
			communication_rating: 7,
			attitude_rating: 10,
			overall_rating: 8.7,
			skills: [
				{ skill: 'Python', level: 'Intermediate', rating: 8 },
				{ skill: 'SQL', level: 'Intermediate', rating: 7 },
				{ skill: 'FastAPI', level: 'Beginner', rating: 6 }
			],
			recommendation: 'ready_for_placement',
			status: 'completed',
			created_at: now,
			updated_at: now,
			candidate: {
				id: 1,
				public_id: 'cand-1',
				name: 'Abishek Kumar'
			}
		},
		{
			id: 102,
			batch_id: batchId,
			candidate_id: 2,
			analyst_name: 'Sarah Jenkins (Assessor)',
			analysis_date: now.split('T')[0],
			strengths: 'Outstanding verbal and written communication. High empathy, collaborative spirit, and strong MS Office suite knowledge.',
			weaknesses: 'Needs guidance when debugging database connection scripts.',
			technical_rating: 6,
			communication_rating: 9,
			attitude_rating: 9,
			overall_rating: 8.0,
			skills: [
				{ skill: 'MS Excel', level: 'Advanced', rating: 9 },
				{ skill: 'Power BI', level: 'Intermediate', rating: 7 }
			],
			recommendation: 'ready_for_placement',
			status: 'completed',
			created_at: now,
			updated_at: now,
			candidate: {
				id: 2,
				public_id: 'cand-2',
				name: 'Bhavana Reddy'
			}
		},
		{
			id: 103,
			batch_id: batchId,
			candidate_id: 3,
			analyst_name: 'David R. (Senior Trainer)',
			analysis_date: now.split('T')[0],
			strengths: 'Very focused, high work ethic, and punctual. Excellent attention to details in data entry tasks.',
			weaknesses: 'Lacks technical depth in full stack frameworks, needs 2-3 additional weeks of React training.',
			technical_rating: 5,
			communication_rating: 6,
			attitude_rating: 9,
			overall_rating: 6.7,
			skills: [
				{ skill: 'Data Entry', level: 'Advanced', rating: 8 },
				{ skill: 'HTML5/CSS3', level: 'Beginner', rating: 5 }
			],
			recommendation: 'needs_additional_training',
			status: 'draft',
			created_at: now,
			updated_at: now,
			candidate: {
				id: 3,
				public_id: 'cand-3',
				name: 'Chithra Balan'
			}
		}
	];
};

const candidateAnalysisService = {
	getByBatchId: async (batchId: number): Promise<CandidateAnalysis[]> => {
		const key = `winvinaya-crm-candidate-analyses-batch-${batchId}`;
		const cached = localStorage.getItem(key);
		if (cached) {
			try {
				return JSON.parse(cached);
			} catch (e) {
				console.error('Failed to parse cached analyses', e);
			}
		}
		
		// If empty, generate pre-populated and save
		const prePopulated = getPrePopulatedAnalyses(batchId);
		localStorage.setItem(key, JSON.stringify(prePopulated));
		return prePopulated;
	},

	getById: async (batchId: number, id: number): Promise<CandidateAnalysis | null> => {
		const list = await candidateAnalysisService.getByBatchId(batchId);
		return list.find(item => item.id === id) || null;
	},

	create: async (batchId: number, data: CandidateAnalysisCreate): Promise<CandidateAnalysis> => {
		const list = await candidateAnalysisService.getByBatchId(batchId);
		const now = new Date().toISOString();
		
		const newItem: CandidateAnalysis = {
			...data,
			id: Date.now(), // Generate unique ID
			created_at: now,
			updated_at: now,
			// Placeholder candidate object, will be populated on front-end rendering if needed
			candidate: {
				id: data.candidate_id,
				public_id: `cand-${data.candidate_id}`,
				name: 'Selected Candidate'
			}
		};
		
		const updatedList = [newItem, ...list];
		const key = `winvinaya-crm-candidate-analyses-batch-${batchId}`;
		localStorage.setItem(key, JSON.stringify(updatedList));
		return newItem;
	},

	update: async (batchId: number, id: number, data: CandidateAnalysisUpdate): Promise<CandidateAnalysis> => {
		const list = await candidateAnalysisService.getByBatchId(batchId);
		const now = new Date().toISOString();
		
		let updatedItem: CandidateAnalysis | null = null;
		
		const updatedList = list.map(item => {
			if (item.id === id) {
				updatedItem = {
					...item,
					...data,
					updated_at: now
				} as CandidateAnalysis;
				return updatedItem;
			}
			return item;
		});
		
		if (!updatedItem) {
			throw new Error(`Candidate Analysis with ID ${id} not found.`);
		}
		
		const key = `winvinaya-crm-candidate-analyses-batch-${batchId}`;
		localStorage.setItem(key, JSON.stringify(updatedList));
		return updatedItem;
	},

	delete: async (batchId: number, id: number): Promise<number> => {
		const list = await candidateAnalysisService.getByBatchId(batchId);
		const filteredList = list.filter(item => item.id !== id);
		
		const key = `winvinaya-crm-candidate-analyses-batch-${batchId}`;
		localStorage.setItem(key, JSON.stringify(filteredList));
		return id;
	}
};

export default candidateAnalysisService;
