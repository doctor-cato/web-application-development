const fs = require('fs');
let code = fs.readFileSync('frontend/src/management/js/admin.js', 'utf8');

// 1. Add vouchers to db
code = code.replace(
    'inventory: [],\r\n    roomLayouts: {}',
    'inventory: [],\r\n    roomLayouts: {},\r\n    vouchers: []'
);

// 2. Add fetchVouchers in reloadDatabase
code = code.replace(
    'fetchCombos()\r\n    ]);',
    'fetchCombos(),\r\n        fetchVouchers()\r\n    ]);'
);

// 3. Add fetchVouchers implementation
const fetchVouchersImpl = `
async function fetchVouchers() {
    try {
        const res = await fetch(getApiUrl('/vouchers'), { headers: getApiHeaders() });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                db.vouchers = data;
                return;
            }
        }
    } catch (e) {
        console.error('Fetch vouchers API error:', e);
    }
    db.vouchers = db.vouchers || [];
}
`;
code = code.replace(
    '        ];\r\n    }\r\n}',
    '        ];\r\n    }\r\n}\r\n' + fetchVouchersImpl
);

// 4. Add renderVouchersTable to switchTab
code = code.replace(
    "case 'combos': renderCombosTable(); break;",
    "case 'combos': renderCombosTable(); break;\r\n        case 'vouchers': renderVouchersTable(); break;"
);

// 5. Add voucher methods before User Management section
const voucherMethods = `
// ==========================================
// VOUCHER MANAGEMENT
// ==========================================
function renderVouchersTable(vouchers = null) {
    const tbody = document.getElementById('vouchers-tbody');
    if (!tbody) return;

    const data = vouchers || db.vouchers || [];
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 20px; color: var(--text-muted);">Không tìm thấy voucher nào.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(v => {
        const typeStr = v.discountType === 'PERCENTAGE' ? 'Giảm %' : 'Giảm tiền';
        const valStr = v.discountType === 'PERCENTAGE' ? (v.discountValue + '%') : formatMoney(v.discountValue);
        const dateStr = v.expiryDate ? new Date(v.expiryDate).toLocaleDateString('vi-VN') : '';
        const statusClass = v.isActive ? 'badge-success' : 'badge-danger';
        const statusText = v.isActive ? 'Đang hoạt động' : 'Tạm dừng';

        return \`
            <tr>
                <td style="font-weight: bold; color: var(--btn-cyan-color);">\${v.code}</td>
                <td>\${v.description || ''}</td>
                <td><span class="badge" style="background: rgba(255,255,255,0.1);">\${typeStr}</span></td>
                <td style="color: var(--primary-red); font-weight: bold;">\${valStr}</td>
                <td>\${dateStr}</td>
                <td><span class="badge \${statusClass}">\${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-icon btn-outline" style="color: var(--btn-cyan-color); border-color: var(--btn-cyan-color);" onclick="openEditVoucherModal('\${v.id}')" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-icon btn-outline" style="color: var(--primary-red); border-color: var(--primary-red);" onclick="deleteVoucher('\${v.id}')" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        \`;
    }).join('');
}

function filterVouchersTable() {
    const q = document.getElementById('voucher-search').value.toLowerCase();
    const status = document.getElementById('voucher-filter-status').value;
    
    let filtered = (db.vouchers || []).filter(v => {
        const matchQ = v.code.toLowerCase().includes(q) || (v.description || '').toLowerCase().includes(q);
        let matchStatus = true;
        if (status === 'active') matchStatus = v.isActive === true;
        if (status === 'inactive') matchStatus = v.isActive === false;
        
        return matchQ && matchStatus;
    });
    
    renderVouchersTable(filtered);
}

function openAddVoucherModal() {
    document.getElementById('voucher-form').reset();
    document.getElementById('voucher-id').value = '';
    document.getElementById('voucher-modal-title').textContent = 'Thêm Voucher Mới';
    document.getElementById('voucher-status-input').value = 'true';
    document.getElementById('voucher-type-input').value = 'PERCENTAGE';
    document.getElementById('voucher-modal').style.display = 'flex';
}

function openEditVoucherModal(id) {
    const v = (db.vouchers || []).find(x => x.id === id);
    if (!v) return;

    document.getElementById('voucher-modal-title').textContent = 'Chỉnh sửa Voucher';
    document.getElementById('voucher-id').value = v.id;
    document.getElementById('voucher-code-input').value = v.code;
    document.getElementById('voucher-status-input').value = v.isActive ? 'true' : 'false';
    document.getElementById('voucher-type-input').value = v.discountType;
    document.getElementById('voucher-value-input').value = v.discountValue;
    document.getElementById('voucher-min-order-input').value = v.minOrderAmount || 0;
    document.getElementById('voucher-max-discount-input').value = v.maxDiscountAmount || '';
    
    let expiry = '';
    if (v.expiryDate) {
        expiry = new Date(v.expiryDate).toISOString().split('T')[0];
    }
    document.getElementById('voucher-expiry-input').value = expiry;
    document.getElementById('voucher-desc-input').value = v.description || '';

    document.getElementById('voucher-modal').style.display = 'flex';
}

function closeVoucherModal() {
    document.getElementById('voucher-modal').style.display = 'none';
}

async function handleVoucherSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('voucher-id').value;
    const isEdit = !!id;

    const vData = {
        code: document.getElementById('voucher-code-input').value.trim().toUpperCase(),
        description: document.getElementById('voucher-desc-input').value.trim(),
        discountType: document.getElementById('voucher-type-input').value,
        discountValue: parseFloat(document.getElementById('voucher-value-input').value) || 0,
        minOrderAmount: parseFloat(document.getElementById('voucher-min-order-input').value) || 0,
        maxDiscountAmount: parseFloat(document.getElementById('voucher-max-discount-input').value) || null,
        expiryDate: document.getElementById('voucher-expiry-input').value,
        isActive: document.getElementById('voucher-status-input').value === 'true'
    };

    if (id) vData.id = id;
    if (vData.maxDiscountAmount === 0 || isNaN(vData.maxDiscountAmount)) {
        vData.maxDiscountAmount = null;
    }

    try {
        const url = isEdit ? getApiUrl(\`/vouchers/\${id}\`) : getApiUrl('/vouchers');
        const method = isEdit ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: getApiHeaders(),
            body: JSON.stringify(vData)
        });

        if (res.ok) {
            showToast(isEdit ? 'Đã cập nhật voucher' : 'Đã thêm voucher', 'success');
            closeVoucherModal();
            await fetchVouchers();
            renderVouchersTable();
        } else {
            showToast('Lỗi khi lưu voucher', 'error');
        }
    } catch (err) {
        console.error('Error saving voucher:', err);
        showToast('Lỗi kết nối API', 'error');
    }
}

async function deleteVoucher(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
        const res = await fetch(getApiUrl(\`/vouchers/\${id}\`), {
            method: 'DELETE',
            headers: getApiHeaders()
        });
        if (res.ok) {
            showToast('Đã xóa voucher', 'success');
            await fetchVouchers();
            renderVouchersTable();
        } else {
            showToast('Lỗi khi xóa voucher', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Lỗi kết nối API', 'error');
    }
}

`;
code = code.replace(
    '// ================= 7. TAB: USERS =================',
    voucherMethods + '\r\n// ================= 7. TAB: USERS ================='
);

// 6. Add globals
const globals = `
window.filterVouchersTable = filterVouchersTable;
window.openAddVoucherModal = openAddVoucherModal;
window.openEditVoucherModal = openEditVoucherModal;
window.closeVoucherModal = closeVoucherModal;
window.handleVoucherSubmit = handleVoucherSubmit;
window.deleteVoucher = deleteVoucher;
`;
code = code.replace(
    'window.deleteCombo = deleteCombo;',
    'window.deleteCombo = deleteCombo;\r\n' + globals
);

// Add window click handler for voucher modal
code = code.replace(
    "        const userHistoryModal = document.getElementById('user-history-modal');",
    "        const userHistoryModal = document.getElementById('user-history-modal');\r\n        const voucherModal = document.getElementById('voucher-modal');"
);
code = code.replace(
    "        if (e.target === comboModal) closeComboModal();",
    "        if (e.target === comboModal) closeComboModal();\r\n        if (e.target === voucherModal) closeVoucherModal();"
);

fs.writeFileSync('frontend/src/management/js/admin.js', code);
console.log('done');
