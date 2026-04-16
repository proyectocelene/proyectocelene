import os, glob, re

directory = r'c:\Users\donat\OneDrive - f5mk83\Desktop\proyecto celene web page'
# Also check subdirectories like saludmental
files = []
for root, _, filenames in os.walk(directory):
    for filename in filenames:
        if filename.endswith('.html'):
            files.append(os.path.join(root, filename))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # find openTab('id'
    opentabs = re.findall(r'openTab\([\'\"]([^\'\"]+)[\'\"]', content)
    if not opentabs:
        continue
    
    # find all ids
    ids = re.findall(r'id=[\"\']([^\"\']+)[\"\']', content)
    
    missing_ids = [tid for tid in opentabs if tid not in ids]
    if missing_ids:
        print(f'{os.path.basename(f)} has openTab referencing missing IDs: {set(missing_ids)}')
