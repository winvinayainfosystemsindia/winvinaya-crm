import api from './api';

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
}

export interface ChatRequest {
	message: string;
	history: ChatMessage[];
}

export interface ChatResponse {
	response: string;
}

export const chatService = {
	sendMessage: async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
		const response = await api.post('/chat', { message, history });
		return response.data;
	},

	testConnection: async (): Promise<{ status: string; message: string }> => {
		const response = await api.get('/chat/test-connection');
		return response.data;
	}
};
