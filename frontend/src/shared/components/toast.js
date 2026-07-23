/**
 * toast.js
 * ─────────────────────────────────────────────────────────────
 * Hiển thị toast notification (thông báo ngắn góc màn hình).
 *
 * Cách dùng:
 *   import { toast } from '../../shared/components/toast.js';
 *   toast.success('Đặt ghế thành công!');
 *   toast.error('Ghế đã được người khác chọn.');
 *   toast.info('Còn 1 phút để hoàn tất thanh toán.');
 * ─────────────────────────────────────────────────────────────
 */

function _createContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Apply glassmorphic, high-z-index styling for container
        container.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 380px;
            width: calc(100% - 48px);
            pointer-events: none;
        `;
        // ponytail: responsive inline style tag for mobile toast container
        if (!document.getElementById('toast-responsive-style')) {
            const style = document.createElement('style');
            style.id = 'toast-responsive-style';
            style.textContent = `
                @media (max-width: 600px) {
                    #toast-container {
                        top: 12px !important;
                        right: 12px !important;
                        left: 12px !important;
                        width: auto !important;
                        max-width: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        document.body.appendChild(container);
    }
    return container;
}

function _show(message, type = 'info', duration = 3500) {
    const container = _createContainer();
    const toastEl = document.createElement('div');
    
    // Choose icons and colors
    let iconClass = 'fa-info-circle';
    let accentColor = '#3b82f6'; // Blue for info
    let shadowColor = 'rgba(59, 130, 246, 0.15)';
    
    if (type === 'success') {
        iconClass = 'fa-check-circle';
        accentColor = '#10b981'; // Green
        shadowColor = 'rgba(16, 185, 129, 0.15)';
    } else if (type === 'error') {
        iconClass = 'fa-exclamation-circle';
        accentColor = '#ef4444'; // Red
        shadowColor = 'rgba(239, 68, 68, 0.15)';
    }

    // Glassmorphism styling with slide-in animation
    toastEl.style.cssText = `
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px 20px;
        background: rgba(26, 26, 26, 0.85);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-left: 4px solid ${accentColor};
        border-top: 1px solid rgba(255,255,255,0.08);
        border-right: 1px solid rgba(255,255,255,0.05);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        border-radius: 8px;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px ${shadowColor};
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
        opacity: 0;
        pointer-events: auto;
        cursor: pointer;
    `;

    toastEl.innerHTML = `
        <i class="fas ${iconClass}" style="color: ${accentColor}; font-size: 1.25rem; flex-shrink: 0;"></i>
        <div style="flex-grow: 1; line-height: 1.4;">${message}</div>
        <i class="fas fa-times" style="color: rgba(255,255,255,0.3); font-size: 0.85rem; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='rgba(255,255,255,0.3)'"></i>
    `;

    // Click to close
    toastEl.addEventListener('click', (e) => {
        _dismiss(toastEl);
    });

    container.appendChild(toastEl);

    // Force reflow and slide in
    requestAnimationFrame(() => {
        toastEl.style.transform = 'translateX(0)';
        toastEl.style.opacity = '1';
    });

    // Auto dismiss
    const autoDismissTimeout = setTimeout(() => {
        _dismiss(toastEl);
    }, duration);

    function _dismiss(el) {
        clearTimeout(autoDismissTimeout);
        el.style.transform = 'translateX(120%)';
        el.style.opacity = '0';
        el.addEventListener('transitionend', () => {
            el.remove();
            // Clean container if empty
            if (container.childNodes.length === 0) {
                container.remove();
            }
        });
    }
}

export const toast = {
    show: _show,
    success: (msg, dur) => _show(msg, 'success', dur),
    error: (msg, dur) => _show(msg, 'error', dur),
    info: (msg, dur) => _show(msg, 'info', dur)
};

