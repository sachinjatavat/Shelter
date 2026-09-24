import os, glob

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "js/demo-bar.js" in content:
        new_content = content.replace("  <script src=\"/js/demo-bar.js\"></script>\n", "")
        new_content = new_content.replace("<script src=\"/js/demo-bar.js\"></script>", "")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Removed demo-bar script from {os.path.basename(filepath)}")

demo_js = "c:/Users/sachi/OneDrive/Desktop/Shelter/js/demo-bar.js"
if os.path.exists(demo_js):
    os.remove(demo_js)
    print("Deleted js/demo-bar.js")
