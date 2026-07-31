// Dynamically detect HTTPS environment (Vercel) to avoid Mixed Content (HTTPS -> HTTP) errors
const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isVercelHost = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel'));

export const API_BASE_URL = (isHTTPS || isVercelHost)
    ? `${window.location.origin}/api`
    : 'http://3hd2k-api.somee.com/api';

export function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
    };
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
