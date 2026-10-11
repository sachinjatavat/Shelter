import os
import re

base_dir = r"c:\Users\sachi\OneDrive\Desktop\work\Shelter"

# 1. Update Restaurant HTML files
restaurant_files = [
    "restaurant-dashboard.html",
    "restaurant-donations.html",
    "restaurant-notifications.html",
    "restaurant-pickups.html",
    "restaurant-post.html",
    "restaurant-settings.html"
]

impact_nav_pattern = re.compile(
    r'\s*<a\s+class="[^"]*"\s+href="/restaurant-impact\.html">\s*'
    r'<span\s+class="material-symbols-outlined[^"]*">query_stats</span>\s*'
    r'<span>Impact</span>\s*'
    r'</a>',
    re.MULTILINE
)

for fname in restaurant_files:
    fpath = os.path.join(base_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content, count = impact_nav_pattern.subn('', content)
    if count > 0:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"[RESTAURANT] Removed {count} impact nav link from {fname}")
    else:
        print(f"[RESTAURANT WARNING] No impact nav link matched in {fname}")

# 1b. restaurant-matching.html
match_fpath = os.path.join(base_dir, "restaurant-matching.html")
with open(match_fpath, 'r', encoding='utf-8') as f:
    match_content = f.read()
match_pattern = re.compile(
    r'<a\s+class="[^"]*"\s+data-path="impact"\s+href="#">\s*'
    r'<span\s+class="material-symbols-outlined[^"]*">query_stats</span>\s*'
    r'<span>Impact</span>\s*'
    r'</a>'
)
new_match_content, count = match_pattern.subn('', match_content)
if count > 0:
    with open(match_fpath, 'w', encoding='utf-8') as f:
        f.write(new_match_content)
    print(f"[RESTAURANT MATCHING] Removed {count} impact link from restaurant-matching.html")
else:
    print(f"[RESTAURANT MATCHING WARNING] No impact link matched in restaurant-matching.html")

# 1c. restaurant-dashboard.html tabs and modal
rd_path = os.path.join(base_dir, "restaurant-dashboard.html")
with open(rd_path, 'r', encoding='utf-8') as f:
    rd_content = f.read()

# Tab button 5
tab_pattern = re.compile(
    r'\s*<button\s+class="[^"]*"\s+id="tab-impact"\s+onclick="openImpactModal\(\)"[^>]*>\s*'
    r'5\.\s*Live\s*Delivery\s*Impact\s*'
    r'</button>',
    re.MULTILINE
)
rd_content, c1 = tab_pattern.subn('', rd_content)

# Modal modal-impact
modal_pattern = re.compile(
    r'\s*<!-- Interactive Slide-over / Modal: \[LIVE DELIVERY IMPACT MODAL\] -->\s*'
    r'<div\s+class="[^"]*"\s+id="modal-impact">.*?'
    r'<!-- Interactive Slide-over / Modal: \[RECEIPT AUDIT SLIP\] -->',
    re.DOTALL
)
rd_content, c2 = modal_pattern.subn('\n<!-- Interactive Slide-over / Modal: [RECEIPT AUDIT SLIP] -->', rd_content)

# JS function
js_pattern = re.compile(
    r'\s*function\s+openImpactModal\(\)\s*\{\s*highlightTab\(\'tab-impact\'\);\s*openModal\(\'modal-impact\'\);\s*\}',
    re.DOTALL
)
rd_content, c3 = js_pattern.subn('', rd_content)

with open(rd_path, 'w', encoding='utf-8') as f:
    f.write(rd_content)
print(f"[RESTAURANT DASHBOARD] Removed tab ({c1}), modal ({c2}), function ({c3})")

# 1d. restaurant-impact.html redirect
ri_path = os.path.join(base_dir, "restaurant-impact.html")
with open(ri_path, 'r', encoding='utf-8') as f:
    ri_content = f.read()
if "<script>window.location.replace('/restaurant-dashboard.html');</script>" not in ri_content:
    ri_content = ri_content.replace("<head>", "<head>\n  <script>window.location.replace('/restaurant-dashboard.html');</script>")
    with open(ri_path, 'w', encoding='utf-8') as f:
        f.write(ri_content)
    print("[RESTAURANT IMPACT] Added auto-redirect to restaurant-dashboard.html")

# 2. NGO Dashboard
ngo_path = os.path.join(base_dir, "ngo-dashboard.html")
with open(ngo_path, 'r', encoding='utf-8') as f:
    ngo_content = f.read()

# Nav button
ngo_nav_pattern = re.compile(
    r'\s*<!-- Navigation Link: Impact Stats -->\s*'
    r'<button\s+class="[^"]*"\s+data-tab="impact-tab"\s+id="nav-impact"\s+onclick="switchTab\(\'impact-tab\'\)">.*?'
    r'<span>Impact</span>\s*'
    r'</button>',
    re.DOTALL
)
ngo_content, ngo_c1 = ngo_nav_pattern.subn('', ngo_content)

# Tab content section
ngo_tab_pattern = re.compile(
    r'\s*<!-- ============================================== -->\s*'
    r'<!-- TAB 5: IMPACT & ANALYTICS -->\s*'
    r'<!-- ============================================== -->\s*'
    r'<section\s+class="tab-content[^"]*"\s+id="impact-tab">.*?'
    r'</section>',
    re.DOTALL
)
ngo_content, ngo_c2 = ngo_tab_pattern.subn('', ngo_content)

with open(ngo_path, 'w', encoding='utf-8') as f:
    f.write(ngo_content)
print(f"[NGO DASHBOARD] Removed nav button ({ngo_c1}), impact-tab section ({ngo_c2})")

# 3. Driver files
driver_files = [
    "driver-dashboard.html",
    "driver-available.html",
    "driver-active.html",
    "driver-history.html",
    "driver-notifications.html",
    "driver-route.html",
    "driver-settings.html"
]

driver_nav_pattern = re.compile(
    r'\s*<a\s+class="[^"]*"\s+href="/driver-impact\.html">\s*'
    r'<span\s+class="material-symbols-outlined[^"]*">trending_up</span>\s*'
    r'<span>Impact</span>\s*'
    r'</a>',
    re.MULTILINE
)

for dfname in driver_files:
    dfpath = os.path.join(base_dir, dfname)
    with open(dfpath, 'r', encoding='utf-8') as f:
        dcontent = f.read()
    
    new_dcontent, dcount = driver_nav_pattern.subn('', dcontent)
    if dfname == "driver-active.html":
        new_dcontent = new_dcontent.replace("View Impact & Return to Dashboard", "Return to Dashboard")
    
    if dcount > 0:
        with open(dfpath, 'w', encoding='utf-8') as f:
            f.write(new_dcontent)
        print(f"[DRIVER] Removed {dcount} impact nav link from {dfname}")
    else:
        print(f"[DRIVER WARNING] No impact nav link matched in {dfname}")

# 3b. driver-impact.html redirect
di_path = os.path.join(base_dir, "driver-impact.html")
with open(di_path, 'r', encoding='utf-8') as f:
    di_content = f.read()
if "<script>window.location.replace('/driver-dashboard.html');</script>" not in di_content:
    di_content = di_content.replace("<head>", "<head>\n  <script>window.location.replace('/driver-dashboard.html');</script>")
    with open(di_path, 'w', encoding='utf-8') as f:
        f.write(di_content)
    print("[DRIVER IMPACT] Added auto-redirect to driver-dashboard.html")

print("All Impact removals finished successfully!")
