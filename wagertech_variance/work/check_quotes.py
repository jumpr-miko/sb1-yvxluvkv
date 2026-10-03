#!/usr/bin/env python3
"""Deterministic quote verification: every item quote must exist (whitespace-normalized) in its raw transcript text.
Writes verification/quote_check.tsv and annotates each item with quote_verified true/false (in place)."""
import json,glob,os,re,sys
B="/home/user/sb1-yvxluvkv/wagertech_variance"
def norm(s): 
    s=s.replace("’","'").replace("‘","'").replace("“",'"').replace("”",'"').replace(" "," ")
    return re.sub(r"\s+"," ",s).strip().lower()
rawidx={}
for d in ["raw/transcripts","raw/transcripts_restricted","raw/transcripts_tier2"]:
    for f in glob.glob(f"{B}/{d}/*.txt"):
        m=re.search(r"__(.+)\.txt$",os.path.basename(f)); 
        if m: rawidx[m.group(1)]=f
rows=[]; tot=ok=0
for ef in sorted(glob.glob(f"{B}/extracts/*.json")+glob.glob(f"{B}/extracts/tier2/*.json")):
    try: ex=json.load(open(ef))
    except Exception as e: rows.append((ef,"-","JSON_ERROR",str(e))); continue
    did=ex.get("doc_id"); rf=rawidx.get(did)
    if not rf: 
        for it in ex.get("items",[]): it["quote_verified"]=None
        rows.append((os.path.basename(ef),"-","NO_RAW",did)); json.dump(ex,open(ef,"w"),indent=1,ensure_ascii=False); continue
    text=norm(open(rf,encoding="utf-8").read())
    for it in ex.get("items",[]):
        q=it.get("quote") or ""
        tot+=1
        parts=[p for p in re.split(r"\s+/\s+|\s*(?:\.\.\.|\u2026)\s*|\s*\[\.\.\.\]\s*",q) if p.strip() and len(p.strip())>3] or [q]
        # strip a leading "Speaker Name:" prefix (extractors often prefix mid-paragraph excerpts with the speaker)
        parts=[re.sub(r"^[A-Z][A-Za-z.'\-]+(?: [A-Z][A-Za-z.'\-]+){0,3}:\s*","",p).strip() or p for p in parts]
        # accept if full normalized quote is a substring, or if every ' / '-separated part is a substring
        full=norm(q) in text
        partial=all(norm(p) in text for p in parts) if parts else False
        # also accept with filler words removed from the raw? no - raw retains fillers; quotes may drop fillers. try fuzzy: remove um/uh from both
        if not (full or partial):
            t2=re.sub(r"\b(um|uh|like|you know)\b[,]? ?","",text); q2=re.sub(r"\b(um|uh|like|you know)\b[,]? ?","",norm(q))
            p2=[re.sub(r"\b(um|uh|like|you know)\b[,]? ?","",norm(p)) for p in parts]
            full=q2 in t2; partial=all(p in t2 for p in p2)
        v=bool(full or partial); it["quote_verified"]=v; ok+=v
        if not v: rows.append((os.path.basename(ef),it.get("item_id"),"QUOTE_NOT_FOUND",q[:140]))
    json.dump(ex,open(ef,"w"),indent=1,ensure_ascii=False)
os.makedirs(f"{B}/verification",exist_ok=True)
with open(f"{B}/verification/quote_check.tsv","w") as fh:
    fh.write("extract\titem_id\tstatus\tdetail\n")
    for r in rows: fh.write("\t".join(str(x) for x in r)+"\n")
print(f"items checked {tot}, verified {ok}, failed {tot-ok}; problem rows {len(rows)}")
