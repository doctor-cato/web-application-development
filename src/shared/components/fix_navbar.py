import re

path = r'c:\Users\PC KHANH\web-application-development\src\shared\components\navbar.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define getSrcPrefix at the very beginning of renderNavbar
prefix_logic = '''
    function getSrcPrefix() {
        const pathname = window.location.pathname;
        if (pathname.includes('/src/')) {
            const parts = pathname.split('/src/')[1].split('/');
            const depth = parts.length - 1;
            return depth > 0 ? '../'.repeat(depth).slice(0, -1) : '.';
        } else {
            const parts = pathname.split('/').filter(Boolean);
            const depth = parts.length > 0 ? parts.length - 1 : 0;
            return depth > 0 ? '../'.repeat(depth).slice(0, -1) : '.';
        }
    }
    const srcPrefix = getSrcPrefix();
'''
content = content.replace('export function renderNavbar() {', 'export function renderNavbar() {' + prefix_logic)

# 2. Replace absolute paths in the template with ${srcPrefix}
content = re.sub(r'href="/(explore|user|engagement|booking|auth|shared|wip\.html)', r'href="${srcPrefix}/\1', content)
content = re.sub(r'src="/(explore|user|engagement|booking|auth|shared|wip\.html)', r'src="${srcPrefix}/\1', content)

# 3. Remove the old getSrcPrefix inside the isLoggedIn block
old_prefix_block = '''                function getSrcPrefix() {
                    const pathname = window.location.pathname;
                    if (pathname.includes('/user-profile/') || pathname.includes('/user-notifications/') || pathname.includes('/user-login/') || pathname.includes('/user-register/')) {
                        return '../../..';
                    }
                    if (pathname.includes('/home-page/') || pathname.includes('/movie-search/') || pathname.includes('/movie-details/') || pathname.includes('/cinema-map/') || pathname.includes('/aftercredit-lounge/')) {
                        return '../..';
                    }
                    return '.';
                }
                const srcPrefix = getSrcPrefix();'''

content = content.replace(old_prefix_block, '')

# 4. Also fix window.location.href assignments
content = content.replace("window.location.href = '/booking/seat-booking/booking.html';", "window.location.href = `${srcPrefix}/booking/seat-booking/booking.html`;")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed navbar.js')
