import os, re, glob

def check_buttons():
    dirs = [
        '/home/dnai/Documents/personal/projetcs/antigravity/qsi-africa-ts/client/src',
        '/home/dnai/Documents/personal/projetcs/antigravity/qsi-africa-ts/admin-client/src'
    ]
    for d in dirs:
        for root, _, files in os.walk(d):
            for file in files:
                if not file.endswith(('.tsx', '.jsx')):
                    continue
                path = os.path.join(root, file)
                with open(path, 'r') as f:
                    content = f.read()
                
                # Check for buttons without disabled or loading
                native_match = re.finditer(r'<button[^>]*type="submit"[^>]*>', content)
                antd_match = re.finditer(r'<Button[^>]*htmlType="submit"[^>]*>', content)
                
                issues = []
                for m in native_match:
                    btn = m.group(0)
                    if 'disabled=' not in btn and 'loading=' not in btn:
                        issues.append(btn)
                for m in antd_match:
                    btn = m.group(0)
                    if 'disabled=' not in btn and 'loading=' not in btn:
                        issues.append(btn)
                
                if issues:
                    print(f"File: {path}")
                    for issue in issues:
                        print(f"  {issue}")

check_buttons()
