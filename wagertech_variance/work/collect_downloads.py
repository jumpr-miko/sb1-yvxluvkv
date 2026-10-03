#!/usr/bin/env python3
"""Scan tool-results dir for Drive download_file_content results (text/html), convert each to text in raw/transcripts/ named <date>_<time>_<slug>__<id>.txt. Idempotent."""
import os,sys,json,re,glob,subprocess
TR="/root/.claude/projects/-home-user-sb1-yvxluvkv/9f5af398-e06a-51d4-a186-fe4efe49a78d/tool-results"
OUT="/home/user/sb1-yvxluvkv/wagertech_variance/raw/transcripts"
done={re.search(r'__([^_].*)\.txt$',f).group(1) for f in os.listdir(OUT) if '__' in f}
def slug(title):
    m=re.search(r'(\d{4})/(\d{2})/(\d{2}) (\d{2}):(\d{2})',title)
    date=f"{m.group(1)}-{m.group(2)}-{m.group(3)}_{m.group(4)}{m.group(5)}" if m else "undated"
    base=re.sub(r' - \d{4}/\d{2}/\d{2}.*$','',title)
    base=re.sub(r'[^A-Za-z0-9]+','-',base).strip('-').lower()[:60]
    return f"{date}_{base}"
n=0
for f in sorted(glob.glob(TR+"/mcp-Google_Drive-download_file_content-*.txt")):
    try:
        j=json.load(open(f))
    except Exception: continue
    if j.get("mimeType")!="text/html": continue
    did=j["id"]
    if did in done: continue
    dst=f"{OUT}/{slug(j['title'])}__{did}.txt"
    r=subprocess.run(["python3","/home/user/sb1-yvxluvkv/wagertech_variance/work/gdoc_html2txt.py",f,dst],capture_output=True,text=True)
    print(r.stdout.strip(), "->", os.path.basename(dst)); n+=1
print("converted",n)
