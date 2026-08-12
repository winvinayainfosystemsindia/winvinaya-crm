import { format } from 'date-fns';

const stripHtml = (htmlStr: string): string => {
	if (!htmlStr || typeof htmlStr !== 'string') return '';
	if (!/<[a-z][\s\S]*>/i.test(htmlStr)) return htmlStr;
	let cleaned = htmlStr
		.replace(/<li[^>]*>/gi, '• ')
		.replace(/<\/li>/gi, '\n')
		.replace(/<\/p>/gi, '\n\n')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/\n\s*\n+/g, '\n\n')
		.trim();
	return cleaned
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
};

export const formatReportData = (data: any[], visibleColumns: string[], columns: any[]) => {
	return data.map(item => {
		const rowData: Record<string, any> = {};
		
		visibleColumns.forEach(virtColId => {
			const col = columns.find(ac => ac.id === virtColId);
			if (!col) return;

			let val: any = undefined;

			if (virtColId.startsWith('screening_others.')) {
				const fieldName = virtColId.substring('screening_others.'.length);
				val = item.screening_others?.[fieldName];
			} else if (virtColId.startsWith('counseling_others.')) {
				const fieldName = virtColId.substring('counseling_others.'.length);
				val = item.counseling_others?.[fieldName];
			} else {
				val = item[virtColId];
			}

			// Format dates
			if ((virtColId.includes('_at') || virtColId.includes('date') || virtColId === 'dob') && val) {
				try {
					val = format(new Date(val), 'dd MMM yyyy');
				} catch {
					// keep raw string if formatting fails
				}
			}

			// Strip HTML if text contains HTML markup
			if (typeof val === 'string' && /<[a-z][\s\S]*>/i.test(val)) {
				val = stripHtml(val);
			}

			// Format arrays
			if (Array.isArray(val)) {
				if (virtColId === 'skills') {
					val = val.map((s: any) => `${s.name} (${s.level})`).join(', ');
				} else if (virtColId === 'family_details') {
					val = val.map((f: any) => `${f.relation}: ${f.name} (${f.occupation || 'N/A'})`).join('; ');
				} else if (virtColId === 'questions') {
					val = val.map((q: any) => `Q: ${q.question} A: ${q.answer}`).join(' | ');
				} else if (virtColId === 'workexperience') {
					val = val.map((w: any) => `${w.job_title} at ${w.company}`).join(', ');
				} else if (virtColId === 'doc_types_uploaded' || virtColId === 'documents_uploaded') {
					val = val.join(', ');
				} else {
					val = val.map((v: any) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
				}
			} else if (typeof val === 'boolean') {
				val = val ? 'Yes' : 'No';
			} else if (val === null || val === undefined) {
				val = '';
			}

			rowData[col.label] = val;
		});

		return rowData;
	});
};
