import os
import re

dir_path = r'c:\Users\PC KHANH\web-application-development\src\booking\checkout'

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    # For HTML files: replace src="/..." with src="../../..."
    if filepath.endswith('.html'):
        # special case for checkout/ where root is ../../
        content = re.sub(r'src="/(explore|shared|auth|booking|user|engagement|wip\.html)', r'src="../../\1', content)
        content = re.sub(r'href="/(explore|shared|auth|booking|user|engagement|wip\.html|booking/css)', r'href="../../\1', content)
        # fix the local checkout.js to just ./checkout.js or ./payment.js
        content = content.replace('src="../../booking/checkout/', 'src="./')

    # For JS files: replace import ... from '/...' with import ... from '../../...'
    if filepath.endswith('.js'):
        content = re.sub(r"from '/(explore|shared|auth|booking|user|engagement)", r"from '../../\1", content)
        content = re.sub(r"from \"/(explore|shared|auth|booking|user|engagement)", r"from \"../../\1", content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {os.path.basename(filepath)}")

for f in os.listdir(dir_path):
    if f.endswith('.html') or f.endswith('.js'):
        fix_file(os.path.join(dir_path, f))

print("All files processed.")
