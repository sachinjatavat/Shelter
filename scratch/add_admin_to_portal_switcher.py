import glob
import os

admin_snippet = """      <a href="/admin-dashboard.html" class="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-200">
        <span class="w-2 h-2 rounded-full bg-purple-500"></span> 🛡️ <b>Admin Command Center</b>
      </a>
"""

for filepath in glob.glob("*.html"):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "/admin-dashboard.html" not in content and 'id="portalSwitchMenu"' in content:
        # insert before /db-viewer.html or at end of portalSwitchMenu
        if '<a href="/db-viewer.html"' in content:
            new_content = content.replace('<a href="/db-viewer.html"', admin_snippet + '      <a href="/db-viewer.html"')
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        elif '</div>\n  </div>\n</div>' in content:
            # fallback
            pass
