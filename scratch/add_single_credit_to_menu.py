import glob
import re

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")

credit_div = """      <div class="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 border-t border-slate-800 mt-1 text-center">
        Created by <span class="text-emerald-400 font-bold">Sachin, Krishna, Nitesh, Priyanshi</span>
      </div>"""

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "id=\"portalSwitchMenu\"" in content or "id='portalSwitchMenu'" in content:
        # Check if portalSwitchMenu already contains 'Created by'
        menu_match = re.search(r'(<div id=["\']portalSwitchMenu["\'].*?)(</div>\s*</div>\s*</div>)', content, re.DOTALL)
        if menu_match:
            menu_body = menu_match.group(1)
            menu_end = menu_match.group(2)
            if "Created by" not in menu_body:
                # Insert credit div before the closing tag of portalSwitchMenu
                new_menu = menu_body.rstrip() + "\n" + credit_div + "\n    " + menu_end
                content = content.replace(menu_match.group(0), new_menu)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Single menu credit verification done.")
