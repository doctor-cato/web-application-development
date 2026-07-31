// Use the production backend API directly
export const API_BASE_URL = 'http://3hd2k-api.somee.com/api';

export function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
    };
    const token = localStorage.getItem('jwt_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
