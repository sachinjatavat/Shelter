import os, glob

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Add animations.css to head if not present
    if 'css/animations.css' not in content:
        if '</head>' in content:
            content = content.replace('</head>', '  <link rel="stylesheet" href="/css/animations.css">\n</head>')
            modified = True
            
    # Add motion.js before </body> if not present
    if 'js/motion.js' not in content:
        if '</body>' in content:
            content = content.replace('</body>', '  <script src="/js/motion.js"></script>\n</body>')
            modified = True
            
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Already updated {filepath}")
