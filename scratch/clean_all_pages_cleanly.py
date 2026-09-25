import glob
import re

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")

credit_div_exact = """      <div class="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 border-t border-slate-800 mt-1 text-center">
        Created by <span class="text-emerald-400 font-bold">Sachin, Krishna, Nitesh, Priyanshi</span>
      </div>"""

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Clean up emergency modals completely
    # Ensure emergency modal has no credit div
    def clean_modal_content(m):
        modal = m.group(0)
        # Remove any Created by blocks from modal
        modal = re.sub(r'<div class="px-2\.5 py-1\.5 text-\[10px\].*?Created by.*?</div>', '', modal, flags=re.DOTALL)
        return modal

    content = re.sub(r'<div[^>]*id="emergency-modal"[^>]*>.*?<!-- END: EmergencyCrisisModal -->', clean_modal_content, content, flags=re.DOTALL)
    content = re.sub(r'<!-- BEGIN: EmergencyCrisisModal -->.*?<!-- END: EmergencyCrisisModal -->', clean_modal_content, content, flags=re.DOTALL)

    # 2. Fix portal switcher menu to have EXACTLY ONE credit div
    def fix_portal_widget(m):
        widget = m.group(0)
        # Remove all instances of credit div from inside widget
        widget = re.sub(r'<div class="px-2\.5 py-1\.5 text-\[10px\].*?Created by.*?</div>', '', widget, flags=re.DOTALL)
        # Add single credit div before closing </div> of #portalSwitchMenu
        widget = re.sub(r'(\s*)(</div>\s*</div>\s*</div>)', r'\n' + credit_div_exact + r'\1\2', widget, count=1)
        return widget

    content = re.sub(r'<div id="portalSwitchMenu".*?</div>\s*</div>\s*</div>', fix_portal_widget, content, flags=re.DOTALL)

    # 3. Remove any orphan credit divs outside footer and portal menu
    lines = content.split('\n')
    cleaned_lines = []
    in_portal_menu = False
    in_footer = False

    for i, line in enumerate(lines):
        if 'id="portalSwitchMenu"' in line:
            in_portal_menu = True
        if '<footer>' in line:
            in_footer = True
        if '</footer>' in line:
            in_footer = False

        if 'Created by' in line and 'Sachin, Krishna, Nitesh, Priyanshi' in line:
            # Check if this line is part of portal switch menu or footer
            is_valid_menu = False
            # Look back 15 lines for portalSwitchMenu
            for j in range(max(0, i - 20), i):
                if 'id="portalSwitchMenu"' in lines[j]:
                    is_valid_menu = True
                    break
            if not is_valid_menu and not in_footer and '<footer>' not in line and '<p>' not in line:
                # Remove this orphan line!
                continue

        cleaned_lines.append(line)

    content = '\n'.join(cleaned_lines)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Comprehensive credit cleanup completed.")
