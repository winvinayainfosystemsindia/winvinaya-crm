import api from './api';

export interface DynamicField {
	id: number;
	entity_type: 'screening' | 'counseling';
	name: string;
	label: string;
	field_type: 'text' | 'textarea' | 'number' | 'single_choice' | 'multiple_choice' | 'phone_number';
	options?: string[];
	is_required: boolean;
	order: number;
}

export type DynamicFieldCreate = Omit<DynamicField, 'id'>;
export type DynamicFieldUpdate = Partial<DynamicFieldCreate>;

export const settingsService = {
	getFields: async (entityType: string): Promise<DynamicField[]> => {
		const response = await api.get(`/settings/fields/${entityType}`);
		return response.data;
	},

	createField: async (field: DynamicFieldCreate): Promise<DynamicField> => {
		const response = await api.post('/settings/fields', field);
		return response.data;
	},

	updateField: async (id: number, field: DynamicFieldUpdate): Promise<DynamicField> => {
		const response = await api.put(`/settings/fields/${id}`, field);
		return response.data;
	},

	deleteField: async (id: number): Promise<void> => {
		await api.delete(`/settings/fields/${id}`);
	}
};
