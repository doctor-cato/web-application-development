const isStandaloneFrontend = ['3000', '8080'].includes(window.location.port);
const localApiOrigin = `${window.location.protocol}//${window.location.hostname}:5111`;

// Use the backend directly when the Vanilla frontend is served on its own port.
// In the ASP.NET Core host and on Vercel, /api is intentionally kept relative.
export const API_BASE_URL = isStandaloneFrontend ? `${localApiOrigin}/api` : '/api';

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
