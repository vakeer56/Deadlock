import axios from 'axios';

// Use environment variable if set, otherwise fallback to dynamic hostname for LAN support
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api/admin/deadlock`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getTeams = async () => {
    try {
        const response = await api.get('/teams');
        return response.data;
    } catch (error) {
        console.error("Error fetching teams:", error);
        throw error;
    }
};

export const createMatch = async () => {
    try {
        const response = await api.post('/match', {});
        return response.data;
    } catch (error) {
        console.error("Error creating match:", error);
        throw error;
    }
};

export const updateMatchTeams = async (matchId, teamAId, teamBId) => {
    try {
        const response = await api.patch(`/match/${matchId}/teams`, {
            teamA: teamAId,
            teamB: teamBId
        });
        return response.data;
    } catch (error) {
        console.error("Error updating match teams:", error);
        throw error;
    }
};

export const swapMatchTeams = async (matchId) => {
    try {
        const response = await api.patch(`/match/${matchId}/swap`);
        return response.data;
    } catch (error) {
        console.error("Error swapping teams:", error);
        throw error;
    }
};

export const resetMatch = async (matchId) => {
    try {
        const response = await api.patch(`/match/${matchId}/reset`);
        return response.data;
    } catch (error) {
        console.error("Error resetting match:", error);
        throw error;
    }
};

export const finishMatch = async (matchId, winnerId) => {
    try {
        const response = await api.patch(`/match/${matchId}/finish`, {
            winner: winnerId
        });
        return response.data;
    } catch (error) {
        console.error("Error finishing match:", error);
        throw error;
    }
};

export const startAllMatches = async () => {
    try {
        const response = await api.post('/deadlock/start-all');
        return response.data;
    } catch (error) {
        console.error("Error starting all matches:", error);
        throw error;
    }
};

export default api;
