import os, glob

html_files = glob.glob("c:/Users/sachi/OneDrive/Desktop/Shelter/*.html")
team_credit_menu = '''      <div class="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 border-t border-slate-800 mt-1 text-center">
        Created by <span class="text-emerald-400 font-bold">Sachin, Krishna, Nitesh, Priyanshi</span>
      </div>
    </div>'''

footer_html = '''
<footer class="w-full bg-slate-900 text-slate-400 text-center py-4 border-t border-slate-800 text-xs font-medium mt-12 font-sans">
  <p>© 2026 Surplus-To-Shelter &bull; Created by <strong class="text-white">Sachin, Krishna, Nitesh, Priyanshi</strong></p>
</footer>
'''

for filepath in html_files:
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    modified = False

    # 1. Update portal switch menu if present and not already having credits
    if "Created by" not in content and "portalSwitchMenu" in content:
        content = content.replace("    </div>\n  </div>\n</div>", team_credit_menu + "\n  </div>\n</div>")
        content = content.replace("    </div>\n  </div>\n</div>", team_credit_menu + "\n  </div>\n</div>")
        modified = True

    # 2. Add footer before </body> if no footer exists
    if "Created by Sachin" not in content:
        if "</body>" in content:
            content = content.replace("</body>", footer_html + "\n</body>")
            modified = True

    if modified:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Added credits to {os.path.basename(filepath)}")
