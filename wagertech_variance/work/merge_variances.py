#!/usr/bin/env python3
"""Merge area-finder and jira-sweep variances, dedup exact/near duplicates, assign VAR ids, write work/variances_merged.json + CSV."""
import json,glob,re,csv,os
from collections import defaultdict
B="/home/user/sb1-yvxluvkv/wagertech_variance"
AREA_ORDER=["Sign-Up","Deal","Deal Rep Assignment","Referrer / Brand Ambassador","Player","Operator & Partner","Redeposits","Referral and Payouts","CMS Integration","Ops list views / Console UX","Global Search","Reporting & Dashboards","Access & Permissions / Org Setup","Data Migration / Import","Storage / Proofs","Testing, UAT & Go-Live","Training & Enablement","Project Mgmt / Scope / Phase / Timeline","Other"]
SEV={"High":0,"Medium":1,"Low":2}
allv=[]; leads=[]; v9=defaultdict(set); sweep_rows=[]; modcov=[]; gaps_noticed=[]
for f in sorted(glob.glob(f"{B}/work/variances/*.json")):
    try: d=json.load(open(f))
    except Exception as e: print("BAD",f,e); continue
    for v in d.get("variances",[]): v["_source"]=os.path.basename(f); v.setdefault("feature_area",d.get("area")); allv.append(v)
    for l in d.get("unverified_leads",[]): l["_source"]=os.path.basename(f); l.setdefault("feature_area",d.get("area")); leads.append(l)
    for k in d.get("v9_reviewed_no_support",[]) or []: v9[k].add("finder:"+d.get("area",""))
    if d.get("module_coverage"): mc=d["module_coverage"]; mc["_source"]=os.path.basename(f); modcov.append(mc)
for f in sorted(glob.glob(f"{B}/work/jira_sweep/*.json")):
    try: d=json.load(open(f))
    except Exception as e: print("BAD",f,e); continue
    for v in d.get("variances",[]): v["_source"]=os.path.basename(f); allv.append(v)
    for i in d.get("issues",[]):
        sweep_rows.append(i)
        if i.get("classification")=="no_transcript_support": v9[i["key"]].add("sweep")
    for g in d.get("gaps_noticed",[]) or []: g["_source"]=os.path.basename(f); gaps_noticed.append(g)
def keyset(v): return tuple(sorted({j.get("key") for j in (v.get("jira") or []) if j.get("key")}))
def canon_area(a):
    a=(a or "").strip()
    for name in AREA_ORDER:
        if a.lower().startswith(name.lower()[:10]): return name
    return "Other"
def dedupe_jira(v):
    seen=set(); out=[]
    for j in v.get("jira") or []:
        k=(j.get("key"),(j.get("quote") or "")[:80])
        if j.get("key") and k in seen: continue
        seen.add(k); out.append(j)
    v["jira"]=out
def words(s): return set(re.findall(r"[a-z0-9]{4,}",(s or "").lower()))
# dedup: same category + overlapping jira keys (or both V1 with same ledger evidence) + title word overlap >= 0.5
merged=[]
for v in allv:
    v["feature_area_raw"]=v.get("feature_area"); v["feature_area"]=canon_area(v.get("feature_area")); dedupe_jira(v)
    ks=set(keyset(v)); lids={e.get("ledger_id") for e in v.get("transcript_evidence",[]) if e.get("ledger_id")}
    dup=None
    for m in merged:
        mks=set(keyset(m)); mlids={e.get("ledger_id") for e in m.get("transcript_evidence",[]) if e.get("ledger_id")}
        if m.get("category")!=v.get("category"): continue
        keyov=bool(ks&mks) if (ks and mks) else (not ks and not mks and bool(lids&mlids))
        if not keyov: continue
        w1,w2=words(v.get("title")),words(m.get("title"))
        if w1 and w2 and len(w1&w2)/min(len(w1),len(w2))>=0.5 or (lids&mlids):
            dup=m; break
    if dup:
        dup.setdefault("merged_from",[]).append({"source":v["_source"],"temp_id":v.get("temp_id"),"title":v.get("title")})
        # keep union of evidence
        seen={(e.get("ledger_id"),e.get("quote")) for e in dup.get("transcript_evidence",[])}
        for e in v.get("transcript_evidence",[]):
            if (e.get("ledger_id"),e.get("quote")) not in seen: dup["transcript_evidence"].append(e)
        for e in v.get("later_or_conflicting_evidence",[]) or []:
            dup.setdefault("later_or_conflicting_evidence",[]).append(e)
        # keep higher severity / higher confidence
        if SEV.get(v.get("severity"),3)<SEV.get(dup.get("severity"),3): dup["severity"]=v["severity"]
    else:
        merged.append(v)
merged.sort(key=lambda v:(AREA_ORDER.index(v.get("feature_area")) if v.get("feature_area") in AREA_ORDER else 99, SEV.get(v.get("severity"),3), v.get("category","")))
for n,v in enumerate(merged,1): v["var_id"]=f"VAR-{n:03d}"
json.dump({"variances":merged,"unverified_leads":leads,"v9":{k:sorted(s) for k,s in v9.items()},"sweep_issues":sweep_rows,"module_coverage":modcov,"gaps_noticed":gaps_noticed},open(f"{B}/work/variances_merged.json","w"),indent=1,ensure_ascii=False)
from collections import Counter
print("raw",len(allv),"merged",len(merged),"leads",len(leads),"v9 keys",len(v9))
print(Counter(v["category"] for v in merged)); print(Counter(v["severity"] for v in merged)); print(Counter(v.get("feature_area") for v in merged))
