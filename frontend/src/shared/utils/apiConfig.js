export const API_BASE_URL = '/api';

export function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
    };
}
