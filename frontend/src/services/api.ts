import axios from 'axios';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', // Adjust as needed
	headers: {
		'Content-Type': 'application/json',
	},
});

// Request interceptor for adding auth token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token'); // Or however you store the token
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for handling errors (e.g., 401)
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			// Handle unauthorized access (e.g., redirect to login)
			// window.location.href = '/login'; 
		}
		return Promise.reject(error);
	}
);

export default api;
