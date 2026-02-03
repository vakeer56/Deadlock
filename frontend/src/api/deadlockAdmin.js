// src/api/deadlock.js
import axios from "axios";

const API = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api/admin/deadlock`
});

export const createTeam = (data) => API.post("/team", data);
export const getTeams = () => API.get("/teams");

export const createMatch = () => API.post("/match");
export const assignTeams = (id, data) =>
    API.patch(`/match/${id}/teams`, data);

export const swapTeams = (id) =>
    API.patch(`/match/${id}/swap`);

export const resetMatch = (id) =>
    API.patch(`/match/${id}/reset`);

export const finishMatch = (id, data) =>
    API.patch(`/match/${id}/finish`, data);
