import os
import re

# 1. Update server/index.js
server_file = 'server/index.js'
if os.path.exists(server_file):
    with open(server_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove admin user from memoryDb
    content = re.sub(r"\s*\{\s*id:\s*'usr-4',\s*email:\s*'admin@surplusrescue\.org'.*?\},?", "", content)
    
    with open(server_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated server/index.js")

# 2. Update supabase/schema.sql
schema_file = 'supabase/schema.sql'
if os.path.exists(schema_file):
    with open(schema_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("CHECK (role IN ('restaurant', 'ngo', 'driver', 'admin'))", "CHECK (role IN ('restaurant', 'ngo', 'driver'))")
    content = re.sub(r"\s*\('admin@surplusrescue\.org', 'admin', 'System Administrator'.*?\),?", "", content)
    
    with open(schema_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated supabase/schema.sql")

# 3. Update all HTML files (remove Admin link from Portal Switcher)
html_files = [f for f in os.listdir('.') if f.endswith('.html')]

switcher_admin_pattern = re.compile(
    r'\s*<a href="/admin-dashboard\.html"[^>]*>.*?<\/a>',
    re.DOTALL
)

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = switcher_admin_pattern.sub('', content)
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Removed Admin switcher from {file}")

print("Admin cleanup step 1 completed.")
