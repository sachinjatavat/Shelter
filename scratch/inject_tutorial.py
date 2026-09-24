import os, glob

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "js/tutorial.js" not in content:
        if "</body>" in content:
            new_content = content.replace("</body>", "  <script src=\"/js/tutorial.js\"></script>\n</body>")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Injected tutorial script into {os.path.basename(filepath)}")
