import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change role cards grid from grid-cols-4 to grid-cols-3
content = content.replace('grid-cols-2 md:grid-cols-4 gap-3', 'grid-cols-1 sm:grid-cols-3 gap-3')

# 2. Remove Admin Role Card
admin_card_pattern = re.compile(r'\s*<!-- Role 4: Admin -->\s*<div onclick="selectLoginRole\(\'admin\'\)".*?<\/div>\s*<\/div>', re.DOTALL)
content = admin_card_pattern.sub('\n              </div>', content)

# 3. Remove Admin quick switch button
content = content.replace('<button type="button" onclick="fillTestAccount(\'admin\')" class="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px]">Admin</button>', '')

# 4. Remove admin notice in login footer
admin_notice_pattern = re.compile(r'\s*<div id="adminRestrictedNotice".*?<\/div>', re.DOTALL)
content = admin_notice_pattern.sub('', content)

# 5. Remove admin dashboard view section
admin_view_pattern = re.compile(r'\s*<!-- ROLE 4 DASHBOARD: /admin/dashboard -->\s*<section id="view-dashboard-admin".*?<\/section>', re.DOTALL)
content = admin_view_pattern.sub('', content)

# 6. Remove DEMO_ACCOUNTS admin block
demo_admin_pattern = re.compile(r'\s*admin:\s*\{\s*id:\s*\'usr_adm_999\'.*?\}', re.DOTALL)
content = demo_admin_pattern.sub('', content)

# 7. Remove ROLE_CONFIGS admin line
content = content.replace("admin: { label: 'Admin', icon: 'shield' }", "")

# 8. Remove admin from role loops and maps
content = content.replace("['restaurant', 'ngo', 'driver', 'admin']", "['restaurant', 'ngo', 'driver']")
content = content.replace("else if (role === 'admin') userName = 'System Administrator';", "")
content = content.replace("admin: '/admin-dashboard.html'", "")
content = content.replace("'view-dashboard-admin'", "")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned Admin from index.html successfully.")
