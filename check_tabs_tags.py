import os, glob, re

directory = r'c:\Users\donat\OneDrive - f5mk83\Desktop\proyecto celene web page'
files = glob.glob(os.path.join(directory, '*.html'))

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    matches = re.findall(r'<([a-zA-Z0-9]+)[^>]*class=[\"\'][^\"]*tab-content[^\"]*[\"\']', content)
    if matches:
        print(f'{os.path.basename(f)} tags used for tab-content: {set(matches)}')
