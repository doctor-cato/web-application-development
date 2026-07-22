// Global fetch interceptor to automatically include credentials for cross-origin authentication
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    let [resource, config] = args;
    const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : '');
    
    // Check if the request is an API call
    if (url.includes('/api/')) {
        if (resource instanceof Request) {
            // Modify Request object credentials
            const newConfig = { credentials: 'include', ...config };
            resource = new Request(resource, newConfig);
            args[0] = resource;
        } else {
            // Modify fetch options
            config = config || {};
            config.credentials = 'include';
            args[1] = config;
        }
    }
    return originalFetch.apply(this, args);
};

// --- GLOBAL CUSTOM DROPDOWNS SETUP ---
function initCustomDropdowns(selector) {
    const selects = document.querySelectorAll(selector);
    selects.forEach(select => {
        if (select.dataset.customized) return;
        select.dataset.customized = 'true';
        select.style.display = 'none'; // Hide original select
        
        // Wrapper for custom dropdown
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        // Selected item UI
        const selectedDiv = document.createElement('div');
        selectedDiv.className = 'custom-select-selected';
        const selectedText = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : '';
        selectedDiv.innerHTML = `<span>${selectedText}</span> <i class="fas fa-chevron-down"></i>`;
        
        // Options container
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'custom-select-options';
        
        Array.from(select.options).forEach(option => {
            const optDiv = document.createElement('div');
            optDiv.className = 'custom-select-option';
            if (option.selected) optDiv.classList.add('selected');
            optDiv.textContent = option.text;
            
            optDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Update original select
                select.value = option.value;
                select.dispatchEvent(new Event('change')); // Trigger filter logic
                
                // Update UI text
                selectedDiv.querySelector('span').textContent = option.text;
                
                // Update selected classes
                const allOptDivs = optionsDiv.querySelectorAll('.custom-select-option');
                allOptDivs.forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');
                
                // Close dropdown
                optionsDiv.classList.remove('show');
                selectedDiv.classList.remove('active');
            });
            optionsDiv.appendChild(optDiv);
        });
        
        selectedDiv.addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllCustomDropdowns(wrapper);
            optionsDiv.classList.toggle('show');
            selectedDiv.classList.toggle('active');
        });
        
        wrapper.appendChild(selectedDiv);
        wrapper.appendChild(optionsDiv);
        
        // Insert custom dropdown right after the original select
        select.parentNode.insertBefore(wrapper, select.nextSibling);
    });
    
    // Close on outside click
    if (!window.customDropdownListenerAdded) {
        document.addEventListener('click', () => closeAllCustomDropdowns());
        window.customDropdownListenerAdded = true;
    }
}

function closeAllCustomDropdowns(exceptWrapper = null) {
    const wrappers = document.querySelectorAll('.custom-select-wrapper');
    wrappers.forEach(wrap => {
        if (wrap !== exceptWrapper) {
            const options = wrap.querySelector('.custom-select-options');
            const selected = wrap.querySelector('.custom-select-selected');
            if (options) options.classList.remove('show');
            if (selected) selected.classList.remove('active');
        }
    });
}

// Auto-initialize for common filter selectors on page load
document.addEventListener('DOMContentLoaded', () => {
    initCustomDropdowns('.filter-item select, .filter-pill select, .sort-pill select, .showtime-filter-select select');
});

// --- GLOBAL SUPPORT WIDGET & TOAST ---
window.showToast = function(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};

window.toggleSupportMenu = function() {
    const menu = document.getElementById('support-menu');
    const icon = document.getElementById('support-icon');
    if (!menu) return;
    menu.classList.toggle('open');
    icon.className = menu.classList.contains('open')
        ? 'fas fa-times'
        : 'fas fa-headset';
};
