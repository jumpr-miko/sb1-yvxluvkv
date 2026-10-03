#!/usr/bin/env python3
import json,re,csv,os,glob
B="/home/user/sb1-yvxluvkv/wagertech_variance"
SUB="1cGr2G_1G_M2GAsVJGELWAoiov0fUq8B2"; ROOT="1rx9DbkBOd2SC7o18L9miNTRFugtlu_De"; MIRROR="0AGuSWA9erI5-Uk9PVA"
docs={}
def add(d,src):
    if not d.get("id"): return
    if d["id"] in docs: 
        for k,v in d.items():
            if v and not docs[d["id"]].get(k): docs[d["id"]][k]=v
        return
    d=dict(d); d["_src"]=src; docs[d["id"]]=d
for f,src in [("sources/drive_title_search_all.json","title"),("sources/drive_root_listing.json","root"),("sources/drive_fulltext_gemini_wagertech.json","fulltext"),("sources/calendar_doc_metadata.json","calendar")]:
    p=f"{B}/{f}"
    if not os.path.exists(p): continue
    data=json.load(open(p))
    if isinstance(data,dict): data=data.get("files",data.get("records",[]))
    for d in data:
        if isinstance(d,dict): add({"id":d.get("id") or d.get("doc_id"),"title":d.get("title"),"fileSize":d.get("fileSize"),"parentId":d.get("parentId"),"owner":d.get("owner"),"createdTime":d.get("createdTime"),"viewUrl":d.get("viewUrl"),"mimeType":d.get("mimeType"),"accessible":d.get("accessible")},src)
# which are downloaded
raw={re.search(r'__(.+)\.txt$',os.path.basename(f)).group(1):f for f in glob.glob(f"{B}/raw/transcripts/*.txt")}
TIER2_PAT=re.compile(r"^(Copy of )?(Marc / Kobi|Kobi <> Taryn|Kobi <> Cedrick|Taryn / Kobi|Cedrick/ Taryn|Meeting started|Miko <> Kobi|Miko <> Jester|Miko Kobi and DK|Review Data Migration|Jumpr Progress Update)",re.I)
SCREEN_PAT=re.compile(r"^(Waleed <> Kobi|✨ Liz / Taryn|Jumpr Management Meeting|Jumpr Monthly Business Update|Waleed <> DK|30 Day Check-in|Next Chapter|Waleed / Liz|Liz / Waleed|Haleigh/Liz|Liz / Sam|Wagertech - 2026/08/11|Wagertech sync - 2026/07/21)",re.I)
EXCL_PAT=re.compile(r"Salesforce Solutioning Session",re.I)
def parse(title):
    m=re.search(r"^(.*?) - (\d{4})/(\d{2})/(\d{2}) (\d{2}):(\d{2}) [A-Z]{3,4} - (Notes by Gemini|Transcript)$",title or "")
    if not m: return None
    base=re.sub(r"^Copy of ","",m.group(1)).strip(); base=re.sub(r"\s+"," ",base).replace("&lt;&gt;","<>")
    return base,f"{m.group(2)}-{m.group(3)}-{m.group(4)}",f"{m.group(5)}:{m.group(6)}",m.group(7)
def mtype(base):
    b=base.lower()
    if "internal sync" in b or "daily sync" in b or "standup" in b or "weekly planning" in b or "internal kickoff" in b or "debrief" in b: return "internal sync"
    if "discovery" in b: return "discovery"
    if "walkthrough" in b or "onsite" in b or "api" in b or "testing" in b: return "walkthrough"
    if "weekly sync" in b: return "client weekly"
    if "60 min" in b or "emily" in b or "kickoff" in b or "prd review" in b or "next steps" in b or "cms integration sync" in b: return "client working session"
    return "other"
def folder(pid):
    return {SUB:"WagerTech subfolder",ROOT:"Jumpr Transcripts root",MIRROR:"shared-drive mirror"}.get(pid or "", "other folder" if pid else "no folder visible (shared-with-me original or calendar attachment)")
groups={}
rows=[]
wager=re.compile(r"wager|wagr",re.I)
for d in docs.values():
    t=d.get("title") or ""
    p=parse(t)
    if not p:
        if wager.search(t) and d.get("mimeType","").endswith("document"):
            rows.append({"doc_id":d["id"],"title":t,"meeting_date":"","meeting_time":"","doc_kind":"","meeting_type":"","tier":"","folder":folder(d.get("parentId")),"size_bytes":d.get("fileSize") or "","status":"excluded: not a meeting transcript (spec/design/working doc)","primary_doc_id":"","link":d.get("viewUrl") or f"https://docs.google.com/document/d/{d['id']}/edit"})
        continue
    base,date,time,kind=p
    if date<"2026-05-27": 
        continue
    cat=None
    if wager.search(base) or base in ("Emily / Taryn - Operator: Supported Markets","Emily / Kobi","Jumpr: Discovery","Kobi <> Taryn Redeposits Debrief"):
        cat="tier1"
    if SCREEN_PAT.search(t): cat="screen"
    if TIER2_PAT.search(t): cat="tier2"
    if EXCL_PAT.search(t): cat="exclude-other-client"
    if not cat: continue
    key=(base.lower(),date,time,kind)
    groups.setdefault(key,{"base":base,"date":date,"time":time,"kind":kind,"cat":cat,"docs":[]})["docs"].append(d)
def size(d):
    try: return int(d.get("fileSize") or 0)
    except: return 0
for key,g in sorted(groups.items(),key=lambda kv:(kv[1]["date"],kv[1]["time"])):
    ds=g["docs"]
    prim=[d for d in ds if d["id"] in raw]
    if not prim:
        pref=[d for d in ds if d.get("parentId") in (SUB,ROOT)]
        pool=pref or ds
        prim=[max(pool,key=size)]
    P=prim[0]
    for d in sorted(ds,key=lambda x:(x["id"]!=P["id"],-size(x))):
        sz=size(d)
        if d["id"]==P["id"]:
            if sz==1180: st="empty placeholder (1,180 bytes; export is a BOM only)"
            elif d["id"] in raw:
                st="read" if g["cat"]=="tier1" else ("captured; pending rule-5 screen" if g["cat"]=="screen" else "captured; tier 2 pending screen")
            elif g["cat"]=="tier2": st="tier 2: to be fetched and screened by agent"
            elif g["cat"]=="screen": st="pending rule-5 screen (agent fetch)"
            elif g["cat"].startswith("exclude"): st="excluded: another client's meeting (Q4)"
            elif d.get("accessible")=="no" or d.get("accessible") is False: st="inaccessible to miko@ (not shared)"
            else: st="not captured"
            if sz==4533 and "2026-09-30" in g["date"] and "Internal" in g["base"]: st="no usable transcript (51-second recording, no summary)"
        else:
            st=f"duplicate-of {P['id']}"
        rows.append({"doc_id":d["id"],"title":d.get("title"),"meeting_date":g["date"],"meeting_time":g["time"],"doc_kind":g["kind"],"meeting_type":mtype(g["base"]),"tier":g["cat"],"folder":folder(d.get("parentId")),"size_bytes":sz or "","status":st,"primary_doc_id":P["id"],"link":d.get("viewUrl") or f"https://docs.google.com/document/d/{d['id']}/edit"})
rows.sort(key=lambda r:(r["meeting_date"] or "9999",r["meeting_time"],r["status"].startswith("duplicate")))
with open(f"{B}/sources/transcript_index.csv","w",newline="") as fh:
    w=csv.DictWriter(fh,fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
from collections import Counter
print("rows",len(rows)); print(Counter((r["tier"],r["status"].split(" ")[0] if not r["status"].startswith("duplicate") else "duplicate") for r in rows))
print("--- primaries (non-duplicate) ---")
for r in rows:
    if not r["status"].startswith("duplicate") and r["meeting_date"]: print(r["meeting_date"],r["meeting_time"],r["tier"],"|",r["status"][:40],"|",r["title"][:70])
