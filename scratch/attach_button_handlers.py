import glob, re

html_files = glob.glob('*.html')

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # Attach onclick="triggerSendDonation(this)" to buttons containing Send Donation if they don't have onclick
    def replace_send(match):
        full_tag = match.group(0)
        if 'onclick=' not in full_tag:
            return full_tag.replace('type="button"', 'type="button" onclick="triggerSendDonation(this)"')
        return full_tag

    # Match <button ...> ... Send Donation ... </button>
    pattern_send = r'<button[^>]*>\s*(?:<span[^>]*>.*?</span>\s*)?Send Donation\s*</button>'
    new_content, count1 = re.subn(pattern_send, replace_send, content, flags=re.DOTALL)

    # Attach onclick="triggerViewDetails(this)" to buttons containing View Details if they don't have onclick
    def replace_view(match):
        full_tag = match.group(0)
        if 'onclick=' not in full_tag:
            return full_tag.replace('type="button"', 'type="button" onclick="triggerViewDetails(this)"')
        return full_tag

    pattern_view = r'<button[^>]*>\s*(?:<span[^>]*>.*?</span>\s*)?View Details\s*</button>'
    new_content, count2 = re.subn(pattern_view, replace_view, new_content, flags=re.DOTALL)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated buttons in {filepath} (Send: {count1}, View: {count2})")
