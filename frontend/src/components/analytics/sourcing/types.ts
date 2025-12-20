export interface AnalyticsData {
	funnel: {
		registered: number;
		profiled: number;
		counseled: number;
		selected: number;
		documents_collected: number;
	};
	demographics: {
		gender: Record<string, number>;
		disability: Record<string, number>;
	};
	geography: Record<string, number>;
	readiness: Record<string, number>;
	trend: Record<string, number>;
	metrics: {
		total_candidates: number;
		active_pipeline: number;
		selection_rate: number;
		conversion_rate: number;
	};
}
