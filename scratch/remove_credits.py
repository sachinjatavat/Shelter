import glob
import re

html_files = sorted(glob.glob("*.html"))
removed_footers = 0
removed_credits = 0

footer_regex = re.compile(r'\s*<footer class="w-full bg-slate-900 text-slate-400 text-center py-4 border-t border-slate-800 text-xs font-medium mt-12 font-sans">.*?</footer>\s*', re.DOTALL)
credit_div_regex = re.compile(r'\s*<div class="px-2\.5 py-1\.5 text-\[10px\] font-semibold text-slate-400 border-t border-slate-800 mt-1 text-center">\s*Created by <span class="text-emerald-400 font-bold">Sachin, Krishna, Nitesh, Priyanshi</span>\s*</div>', re.DOTALL)

for path in html_files:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    new_content, f_count = footer_regex.subn("\n", content)
    new_content, c_count = credit_div_regex.subn("", new_content)

    removed_footers += f_count
    removed_credits += c_count

    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)

print(f"Done! Removed {removed_footers} footers and {removed_credits} menu credits across {len(html_files)} files.")
