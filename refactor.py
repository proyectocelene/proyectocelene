import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

emojis = [
    "🎗️", "💬", "📋", "📖", "🌸", "🩺", "📅", "📍", "⏰", "📞", "👍", "📸", "🌟", 
    "🔬", "💖", "👁️", "🎯", "🦸‍♀️", "🦸‍♂️", "🏛️", "🗺️", "⚖️", "📜", "🏢", "✅", 
    "☀️", "🏃‍♀️", "💃", "🎤", "🌙", "✨", "👗", "🎫", "🎶", "🎟️", "🎪", "📲", 
    "🤝", "💼", "👉", "🚗", "🚙", "💊", "🩸", "🧠", "👨‍⚕️", "👩‍⚕️", "👩‍❤️‍👨", "🔍", "🎉", "🎙️", "🚙", "🎗"
]
emojis.sort(key=len, reverse=True)
escaped_emojis = [re.escape(e) for e in emojis]
emoji_regex = re.compile('(' + '|'.join(escaped_emojis) + ')')

# Navbar will be injected into this container
nav_replacement = '<div id="navbar-container" class="main-nav"></div>'
nav_pattern = re.compile(r'<nav class="main-nav">.*?</nav>', re.DOTALL)

# Add links and scripts
head_pattern = re.compile(r'</head>', re.IGNORECASE)
body_pattern = re.compile(r'</body>', re.IGNORECASE)

# Intersection observer blocks to remove
to_remove_patterns = [
    re.compile(r'<script>\s*// Intersection Observer.*?fadeElements\.forEach\(el => observer\.observe\(el\)\);\s*\}\);\s*</script>', re.DOTALL | re.IGNORECASE),
    re.compile(r'<script>\s*const observer = new IntersectionObserver.*?\.observe\(el\)\);\s*</script>', re.DOTALL | re.IGNORECASE),
    re.compile(r'// Animaciones al hacer scroll.*?\.observe\(el\)\);\s*\}\);', re.DOTALL | re.IGNORECASE)
]

def fix_html(content):
    # 1. Replace main-nav
    content = nav_pattern.sub(nav_replacement, content)
    
    # 2. Add global CSS and JS
    if '<link rel="stylesheet" href="css/global.css">' not in content:
        content = head_pattern.sub('    <link rel="stylesheet" href="css/global.css">\n</head>', content, count=1)
    if '<script src="js/global.js"></script>' not in content:
        content = body_pattern.sub('<script src="js/global.js"></script>\n</body>', content, count=1)
        
    # 3. Clean up Observer scripts
    for p in to_remove_patterns:
        content = p.sub('', content)
        
    # 4. Wrap Emojis
    # We split the html by tags to only process text nodes.
    # Note: <tag> will be in the parts list because we capture the delimiter.
    # Every odd index is a tag, every even index is text, if we split by (<[^>]+>)
    parts = re.split(r'(<[^>]+>)', content)
    
    in_title = False
    new_parts = []
    
    for part in parts:
        if part.startswith('<'):
            if part.startswith('<title>'):
                in_title = True
            elif part.startswith('</title>'):
                in_title = False
            new_parts.append(part)
        else:
            if not in_title:
                part = emoji_regex.sub(r'<span aria-hidden="true">\1</span>', part)
            new_parts.append(part)
            
    content = "".join(new_parts)
    return content

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = fix_html(content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Refactored: {file}")
