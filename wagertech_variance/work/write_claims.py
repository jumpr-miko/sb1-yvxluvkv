#!/usr/bin/env python3
"""Write verification/claims/<VARID>.json for every High/Medium variance and a deterministic 20% sample of Low (every 5th). Claims hold only the claim + citations (no finder reasoning)."""
import json,os
B="/home/user/sb1-yvxluvkv/wagertech_variance"
M=json.load(open(f"{B}/work/variances_merged.json"))
os.makedirs(f"{B}/verification/claims",exist_ok=True)
sel=[]; lows=[v for v in M["variances"] if v.get("severity")=="Low"]
low_sample={v["var_id"] for i,v in enumerate(lows) if i%5==0}
for v in M["variances"]:
    if v.get("severity") in ("High","Medium") or v["var_id"] in low_sample:
        claim={k:v.get(k) for k in ["var_id","category","severity","confidence","feature_area","title","jira","no_ticket_search","transcript_evidence","later_or_conflicting_evidence","what_differs","suggested_action"]}
        for e in claim.get("transcript_evidence") or []:
            if not e.get("doc_id") and e.get("doc_link"):
                import re; m=re.search(r"/d/([^/]+)",e["doc_link"]); e["doc_id"]=m.group(1) if m else None
        json.dump(claim,open(f"{B}/verification/claims/{v['var_id']}.json","w"),indent=1,ensure_ascii=False); sel.append(v["var_id"])
json.dump(sel,open(f"{B}/verification/claims/_selected.json","w"))
print("claims written:",len(sel),"of",len(M["variances"]),"| High/Medium:",sum(1 for v in M["variances"] if v.get("severity") in ("High","Medium")),"| Low sampled:",len(low_sample),"of",len(lows))
