import glob
import re

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")

target_div_pattern = r'<div class="px-2\.5 py-1\.5 text-\[10px\] font-semibold text-slate-400 border-t border-slate-800 mt-1 text-center">\s*Created by <span class="text-emerald-400 font-bold">Sachin, Krishna, Nitesh, Priyanshi</span>\s*</div>'

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # First, remove credits from ALL modals
    # Find all modal elements or overlays (class contains modal or fixed inset-0)
    # We can use BeautifulSoup or regex. Let's do a reliable string replacement first for known modal sections:

    # Replace double occurrences anywhere with a single occurrence
    while True:
        double_pattern = target_div_pattern + r'\s*' + target_div_pattern
        if re.search(double_pattern, content):
            content = re.sub(double_pattern, lambda m: re.search(target_div_pattern, m.group(0)).group(0), content)
        else:
            break

    # Now check if any modal contains this div
    # Modals in our codebase: #emergency-modal, .modal, [id*="modal"]
    lines = content.split('\n')
    new_lines = []
    in_modal = False
    modal_div_depth = 0

    for line in lines:
        if 'id="emergency-modal"' in line or 'id="modal-' in line or 'class="' in line and 'modal' in line.lower() and '<div' in line:
            in_modal = True

        if in_modal:
            # If line is the credit div, don't include it in modal!
            if 'Created by' in line and 'Sachin, Krishna, Nitesh, Priyanshi' in line:
                continue
            if '<!-- END: EmergencyCrisisModal -->' in line or '<!-- END: Modal' in line or (in_modal and line.strip() == '</div>' and modal_div_depth == 0):
                in_modal = False

        new_lines.append(line)

    content = '\n'.join(new_lines)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Finished fixing all credits.")
