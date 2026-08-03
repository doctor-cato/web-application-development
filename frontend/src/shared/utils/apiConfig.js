// Dynamically detect HTTPS environment (Vercel) to avoid Mixed Content (HTTPS -> HTTP) errors
const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isVercelHost = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel'));
const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.')
);

export const API_BASE_URL = (isHTTPS || isVercelHost || isLocalhost)
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

const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let res = await originalFetch(...args);
    // ponytail: global fetch patch for auto-login on 401. ceiling: basic retry logic, might fail on complex headers. upgrade path: proper axios/fetch interceptor library.
    if (res.status === 401 && !args[0]?.toString().includes('refresh-token') && localStorage.getItem('refresh_token')) {
        const refreshRes = await originalFetch(`${API_BASE_URL}/auth/refresh-token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: localStorage.getItem('jwt_token'), refreshToken: localStorage.getItem('refresh_token') }) });
        if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('refresh_token', data.refreshToken);
            if (args[1]?.headers) { 
                if (args[1].headers instanceof Headers) args[1].headers.set('Authorization', `Bearer ${data.token}`); 
                else args[1].headers['Authorization'] = `Bearer ${data.token}`; 
            }
            return originalFetch(...args);
        }
        localStorage.removeItem('jwt_token'); localStorage.removeItem('refresh_token'); window.location.href = '/auth/user-login/login.html';
    }
    return res;
};
