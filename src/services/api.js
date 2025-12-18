import axios from 'axios';

// Pointing to your live Render Backend
const API_URL = 'https://student-risk-backend.onrender.com';
// const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;