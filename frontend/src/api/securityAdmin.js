import axios from 'axios';

const API_URL = `http://${window.location.hostname}:5000/api/admin/deadlock`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSecuritySettings = async () => {
    try {
        const response = await api.get('/security-settings');
        return response.data;
    } catch (error) {
        console.error("Error fetching security settings:", error);
        throw error;
    }
};

export const updateSecuritySettings = async (settings) => {
    try {
        const response = await api.post('/security-settings', settings);
        return response.data;
    } catch (error) {
        console.error("Error updating security settings:", error);
        throw error;
    }
};

export default api;
