import os

css_path = 'src/booking/css/booking.css'

css_content = """
/* Group Seat Selector UI */
.group-seat-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.75rem 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    width: 100%;
    max-width: 400px;
}

.group-seat-selector label {
    font-weight: 600;
    color: var(--text-muted);
}

.group-seat-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    padding: 0.25rem;
}

.group-seat-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.group-seat-btn:hover:not(:disabled) {
    background: var(--primary-red);
}

.group-seat-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.group-seat-value {
    width: 24px;
    text-align: center;
    font-weight: 700;
    font-size: 1.1rem;
}

/* Hover Previews */
.seat--preview-valid {
    box-shadow: 0 0 10px rgba(229, 9, 20, 0.8) !important;
    border-color: rgba(229, 9, 20, 1) !important;
    background-color: rgba(229, 9, 20, 0.3) !important;
    transform: scale(1.1);
}

.seat--preview-invalid {
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.5) !important;
    border-color: rgba(255, 0, 0, 0.8) !important;
    background: repeating-linear-gradient(45deg, rgba(255,0,0,0.2), rgba(255,0,0,0.2) 5px, rgba(0,0,0,0.2) 5px, rgba(0,0,0,0.2) 10px) !important;
    cursor: not-allowed !important;
    animation: shake 0.3s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write(css_content)

print("CSS appended.")
