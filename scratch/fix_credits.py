import os
import glob
import re

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")

credit_block = """      <div class="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 border-t border-slate-800 mt-1 text-center">
        Created by <span class="text-emerald-400 font-bold">Sachin, Krishna, Nitesh, Priyanshi</span>
      </div>"""

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Remove credits inside emergency modals
    # Emergency modal usually contains 'Trigger Emergency Crisis Broadcast' or 'broadcastEmergencyCrisis'
    # Find the emergency modal block and strip credit blocks from it
    def clean_emergency_modal(match):
        modal_text = match.group(0)
        # Remove credit_block from modal_text
        modal_text_cleaned = modal_text.replace(credit_block, "")
        return modal_text_cleaned

    # Match emergency modal container
    content = re.sub(r'(<div[^>]*id="emergency-modal"[^>]*>.*?<!-- END: EmergencyCrisisModal -->)', clean_emergency_modal, content, flags=re.DOTALL)

    # Also check modal block if defined differently
    content = re.sub(r'(<!-- BEGIN: EmergencyCrisisModal -->.*?<!-- END: EmergencyCrisisModal -->)', clean_emergency_modal, content, flags=re.DOTALL)
    content = re.sub(r'(<!-- Emergency Crisis Modal -->.*?</div>\s*</div>\s*<!--)', clean_emergency_modal, content, flags=re.DOTALL)

    # 2. In the portal switcher dropdown menu, ensure credit_block appears EXACTLY ONCE
    # The portal dropdown ends before </div>\s*</div>\s*</div> or similar near SURPLUS-TO-SHELTER PORTALS
    def fix_portal_menu(match):
        menu_text = match.group(0)
        # Count occurrences of credit_block
        count = menu_text.count(credit_block)
        if count > 1:
            # Replace all with empty, then add one back at the end before the closing tag
            menu_text = menu_text.replace(credit_block, "")
            # Insert one credit_block right before the last closing </div> in menu_text
            last_div_idx = menu_text.rfind("</div>")
            if last_div_idx != -1:
                menu_text = menu_text[:last_div_idx] + credit_block + "\n    " + menu_text[last_div_idx:]
        return menu_text

    content = re.sub(r'(SURPLUS-TO-SHELTER PORTALS.*?</div>\s*</div>\s*</div>)', fix_portal_menu, content, flags=re.DOTALL)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Batch credit cleanup completed.")
