import os, glob, re
directory = r'c:\Users\donat\OneDrive - f5mk83\Desktop\proyecto celene web page'
files = []
for root, _, filenames in os.walk(directory):
    for filename in filenames:
        if filename.endswith('.html'):
            files.append(os.path.join(root, filename))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    matches = re.findall(r'openTab\(([^,)]+)', content)
    suspects = [m for m in matches if not (m.strip().startswith("'") or m.strip().startswith('"'))]
    if suspects:
        print(f'{os.path.basename(f)} suspects: {set(suspects)}')
