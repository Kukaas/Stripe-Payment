import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
})

api.interceptors.request.use(
    (config) => {
        // Add any request interceptors here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;