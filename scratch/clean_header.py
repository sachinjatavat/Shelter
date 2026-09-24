import glob, re

restaurant_files = glob.glob('restaurant-*.html')

for filepath in restaurant_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to match the right side of the header in restaurant pages
    # Matches <div class="flex items-center gap-space-md">...Kitchen Active...Sign out...</div></div>
    pattern = r'<div class="flex items-center gap-space-md"><div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low">.*?<span class="text-label-sm font-label-sm text-on-surface-variant">Kitchen Active</span>.*?Verified Partner.*?<\/button><\/div><\/div>'

    replacement = '''<div class="flex items-center gap-space-md"><div class="flex items-center gap-space-sm"><div class="text-right"><div class="text-label-md font-label-md text-on-surface leading-tight user-name-display">Manager</div><div class="text-label-sm font-label-sm text-primary-container leading-tight">Verified Partner</div></div><div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span class="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div>'''

    new_content, count = re.subn(pattern, replacement, content, flags=re.DOTALL)

    if count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully cleaned header in {filepath}")
    else:
        print(f"Pattern not found in {filepath}, checking alternate match...")
        # Check if already replaced or slightly different whitespace
        pattern2 = r'<div class="flex items-center gap-space-md">\s*<div class="flex items-center gap-2 px-3 py-1.5.*?Kitchen Active.*?Verified Partner.*?<\/div>\s*<\/div>'
        new_content2, count2 = re.subn(pattern2, replacement, content, flags=re.DOTALL)
        if count2 > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content2)
            print(f"Successfully cleaned header (alt pattern) in {filepath}")
