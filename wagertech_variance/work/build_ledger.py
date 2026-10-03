#!/usr/bin/env python3
"""Merge all extracts into decision_ledger.csv (+ JSON), ordered by date, with normalized feature areas and per-area slices."""
import json,glob,csv,os,re
B="/home/user/sb1-yvxluvkv/wagertech_variance"
AREAS=[("Sign-Up",r"sign.?up|slc|study link|intake|proof|fraud"),("Deal",r"\bdeal\b(?!.*rep assign)|commercial term|affiliate link|activation|makeup"),("Deal Rep Assignment",r"rep assign"),("Referrer / Brand Ambassador",r"referrer|brand ambassador|\brep\b|\breps\b|\bba\b"),("Player",r"player|person account|vip"),("Operator & Partner",r"operator|partner|market|vertical|billing"),("Redeposits",r"redeposit"),("Referral and Payouts",r"payout|referral|commission|bonus"),("CMS Integration",r"cms|webhook|api|integration|external id|payload"),("Ops list views / Console UX",r"list view|console|layout|table view|split view|screen flow|ux|ui"),("Global Search",r"global search"),("Reporting & Dashboards",r"report|dashboard"),("Access & Permissions / Org Setup",r"permission|access|profile|org setup|security|login|user"),("Data Migration / Import",r"migration|import|data load"),("Storage / Proofs",r"storage|drive|dropbox|gcp|file"),("Testing, UAT & Go-Live",r"uat|test|go.?live|deploy|release"),("Training & Enablement",r"training|enablement|handoff|playbook"),("Project Mgmt / Scope / Phase / Timeline",r"scope|phase|timeline|budget|hours|sprint|priorit|project")]
def norm_area(a):
    a=(a or "").strip()
    for name,_ in AREAS:
        if a.lower().startswith(name.lower()[:12]) or a.lower()==name.lower(): return name
    for name,pat in AREAS:
        if re.search(pat,a,re.I): return name
    return "Other"
rows=[]; docs=[]
files=sorted(glob.glob(f"{B}/extracts/*.json"))+sorted(glob.glob(f"{B}/extracts/tier2/*.json"))
for ef in files:
    try: ex=json.load(open(ef))
    except Exception as e: print("BAD JSON",ef,e); continue
    if ex.get("screen_verdict")=="exclude": docs.append({"doc_id":ex.get("doc_id"),"title":ex.get("title"),"date":ex.get("meeting_date"),"tier":ex.get("tier"),"items":0,"excluded":True}); continue
    date=ex.get("meeting_date") or ""; time=ex.get("meeting_time") or ""
    docs.append({"doc_id":ex.get("doc_id"),"title":ex.get("title"),"date":date,"time":time,"tier":ex.get("tier","tier1"),"evidence_grade":ex.get("evidence_grade","transcript"),"items":len(ex.get("items",[])),"read_complete":ex.get("read_complete"),"critic_read_complete":ex.get("critic_read_complete"),"disagreements":len(ex.get("gemini_disagreements",[]) or []),"extract":os.path.relpath(ef,B)})
    for i,it in enumerate(ex.get("items",[])):
        rows.append({
          "ledger_id":"", "item_id":it.get("item_id") or f"{date}-{i+1:02d}", "date":date,"time":time,
          "meeting_title":ex.get("title"),"meeting_type":ex.get("meeting_type"),"tier":ex.get("tier","tier1"),"evidence_grade":ex.get("evidence_grade","transcript"),
          "doc_id":ex.get("doc_id"),"doc_link":ex.get("doc_link") or f"https://docs.google.com/document/d/{ex.get('doc_id')}/edit",
          "type":it.get("type"),"firmness":it.get("firmness"),"feature_area":norm_area(it.get("feature_area")),"feature_area_raw":it.get("feature_area"),
          "topic":it.get("topic"),"statement":it.get("statement"),"speakers":"; ".join(it.get("speakers") or []) if isinstance(it.get("speakers"),list) else (it.get("speakers") or ""),
          "timestamp":it.get("timestamp"),"line_start":it.get("line_start"),"line_end":it.get("line_end"),"quote":it.get("quote"),
          "jira_keys_mentioned":"; ".join(it.get("jira_keys_mentioned") or []) if isinstance(it.get("jira_keys_mentioned"),list) else (it.get("jira_keys_mentioned") or ""),
          "owner":it.get("owner"),"due":it.get("due"),"supersedes_hint":it.get("supersedes_hint"),"summary_agreement":it.get("summary_agreement"),
          "quote_verified":it.get("quote_verified"),"added_by":it.get("added_by",""),"critic_note":it.get("critic_note",""),"critic_flag":it.get("critic_flag",""),"asr_note":it.get("asr_note","")})
rows.sort(key=lambda r:(r["date"],r["time"],r["item_id"]))
for n,r in enumerate(rows,1): r["ledger_id"]=f"L{n:04d}"
with open(f"{B}/decision_ledger.csv","w",newline="") as fh:
    w=csv.DictWriter(fh,fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
json.dump(rows,open(f"{B}/work/ledger.json","w"),indent=1,ensure_ascii=False)
json.dump(docs,open(f"{B}/work/ledger_docs.json","w"),indent=1,ensure_ascii=False)
os.makedirs(f"{B}/work/ledger_by_area",exist_ok=True)
from collections import Counter,defaultdict
by=defaultdict(list)
for r in rows: by[r["feature_area"]].append(r)
for a,rs in by.items():
    json.dump(rs,open(f"{B}/work/ledger_by_area/{re.sub(r'[^A-Za-z0-9]+','_',a)}.json","w"),indent=1,ensure_ascii=False)
# compact grep-able tsv
with open(f"{B}/work/ledger_compact.tsv","w") as fh:
    fh.write("ledger_id\tdate\ttier\tfirmness\ttype\tfeature_area\tjira_keys\ttopic\tstatement\n")
    for r in rows: fh.write("\t".join(str(r.get(k) or "").replace("\t"," ").replace("\n"," ") for k in ["ledger_id","date","tier","firmness","type","feature_area","jira_keys_mentioned","topic","statement"])+"\n")
print("docs",len(docs),"items",len(rows))
print("by area:",Counter(r["feature_area"] for r in rows).most_common())
print("by firmness:",Counter(r["firmness"] for r in rows).most_common())
print("quote_verified:",Counter(str(r["quote_verified"]) for r in rows))
