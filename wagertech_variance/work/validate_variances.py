#!/usr/bin/env python3
"""Deterministic checks on finder/sweep variances: jira keys exist; ledger_ids exist and quotes match the ledger; jira quotes appear in issue description/comments. Annotates each variance with `auto_checks` and writes verification/variance_autocheck.tsv."""
import json,glob,os,re
B="/home/user/sb1-yvxluvkv/wagertech_variance"
def norm(s): 
    s=(s or "").replace("’","'").replace("‘","'").replace("“",'"').replace("”",'"').replace(" "," ")
    s=re.sub(r"[*_`>#\[\]()|]"," ",s)
    return re.sub(r"\s+"," ",s).strip().lower()
ledger={r["ledger_id"]:r for r in json.load(open(f"{B}/work/ledger.json"))}
issues={}
for f in glob.glob(f"{B}/raw/jira/issues/*.json"):
    d=json.load(open(f)); fl=d["fields"]
    txt=norm((fl.get("summary") or "")+" \n "+(fl.get("description") or "")+" \n "+" \n ".join((c.get("body") or "") for c in (fl.get("comment",{}).get("comments") or [])))
    issues[d["key"]]=txt
rows=[]; tot=0; bad=0
for f in sorted(glob.glob(f"{B}/work/variances/*.json"))+sorted(glob.glob(f"{B}/work/jira_sweep/*.json")):
    d=json.load(open(f)); changed=False
    for v in d.get("variances",[]):
        tot+=1; probs=[]
        for j in v.get("jira") or []:
            k=j.get("key")
            if k not in issues: probs.append(f"jira_key_missing:{k}")
            else:
                q=norm(j.get("quote"))
                if q and len(q)>15:
                    frag=q if q in issues[k] else None
                    if not frag:
                        # try first 60 chars / parts split by ' / ' or '...'
                        parts=[p for p in re.split(r"\s+/\s+|\.\.\.|…",q) if len(p.strip())>15]
                        if not parts or not all(p.strip() in issues[k] for p in parts): probs.append(f"jira_quote_not_in_issue:{k}")
        for e in v.get("transcript_evidence") or []:
            lid=e.get("ledger_id")
            if lid not in ledger: probs.append(f"ledger_id_missing:{lid}")
            else:
                L=ledger[lid]; q=norm(e.get("quote")); lq=norm(L.get("quote"))
                if q and q!=lq and q not in lq and lq not in q:
                    # allow partial: all fragments of q in lq
                    parts=[p.strip() for p in re.split(r"\s+/\s+|\.\.\.|…",q) if len(p.strip())>10]
                    if not parts or not all(p in lq for p in parts): probs.append(f"quote_differs_from_ledger:{lid}")
                if L.get("quote_verified") is False: probs.append(f"ledger_quote_unverified:{lid}")
                if L.get("tier")=="tier2" and v.get("category")!="V8" and v.get("severity") in ("High","Medium"):
                    # tier2-only evidence check: is there any tier1 evidence in this variance?
                    pass
        t1=[e for e in v.get("transcript_evidence") or [] if ledger.get(e.get("ledger_id"),{}).get("tier")!="tier2"]
        if not t1 and (v.get("transcript_evidence") or []): probs.append("tier2_evidence_only")
        dec=[e for e in v.get("transcript_evidence") or [] if ledger.get(e.get("ledger_id"),{}).get("firmness")=="decided"]
        if not dec and v.get("category") not in ("V8",): probs.append("no_decided_evidence")
        if not (v.get("jira") or v.get("no_ticket_search")) and v.get("category")!="V1": probs.append("no_jira_citation")
        v["auto_checks"]=probs; changed=True
        if probs: bad+=1
        rows.append((os.path.basename(f),v.get("temp_id"),v.get("category"),v.get("severity"),"; ".join(probs)))
    if changed: json.dump(d,open(f,"w"),indent=1,ensure_ascii=False)
os.makedirs(f"{B}/verification",exist_ok=True)
with open(f"{B}/verification/variance_autocheck.tsv","w") as fh:
    fh.write("file\ttemp_id\tcategory\tseverity\tproblems\n")
    for r in rows: fh.write("\t".join(str(x) for x in r)+"\n")
from collections import Counter
print(f"variances {tot}, with problems {bad}")
print(Counter(p.split(':')[0] for r in rows for p in r[4].split('; ') if p))
