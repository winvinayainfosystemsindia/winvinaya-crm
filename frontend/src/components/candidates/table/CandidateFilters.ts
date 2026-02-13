import type { FilterField } from '../../common/FilterDrawer';

export const getCandidateFilterFields = (
	filterOptions: {
		disability_types: string[];
		education_levels: string[];
		cities: string[];
	}
): FilterField[] => {
	const fields: FilterField[] = [
		{
			key: 'disability_type',
			label: 'Disability Type',
			type: 'multi-select',
			options: (filterOptions.disability_types || []).map(val => ({ value: val, label: val }))
		},
		{
			key: 'education_level',
			label: 'Education/Degree',
			type: 'multi-select',
			options: (filterOptions.education_levels || []).map(val => ({ value: val, label: val }))
		},
		{
			key: 'city',
			label: 'Location (City)',
			type: 'multi-select',
			options: (filterOptions.cities || []).map(val => ({ value: val, label: val }))
		}
	];

	return fields;
};
