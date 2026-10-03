#!/usr/bin/env python3
"""Render output/WagerTech_Jira_vs_Transcripts_Variance_<date>.md and the register CSV from merged variances + verification results."""
import json,csv,glob,os,re,sys,datetime
from collections import Counter,defaultdict
B="/home/user/sb1-yvxluvkv/wagertech_variance"
RUN_DATE=sys.argv[1] if len(sys.argv)>1 else "2026-10-03"
MODEL=sys.argv[2] if len(sys.argv)>2 else "Claude (orchestrator: claude-fable-5-1; extraction, matching and verification subagents: Claude Opus 5.5, high effort)"
M=json.load(open(f"{B}/work/variances_merged.json"))
ver={}
for f in glob.glob(f"{B}/verification/items/*.json"):
    try: d=json.load(open(f)); ver[d["var_id"]]=d
    except Exception as e: print("bad ver",f,e)
summ=json.load(open(f"{B}/work/exec_summary.json")) if os.path.exists(f"{B}/work/exec_summary.json") else {}
ledger_docs=json.load(open(f"{B}/work/ledger_docs.json"))
index=list(csv.DictReader(open(f"{B}/sources/transcript_index.csv")))
jira_index={r["key"]:r for r in csv.DictReader(open(f"{B}/sources/jira_index.csv"))}
SEV_ORDER={"High":0,"Medium":1,"Low":2}
AREA_ORDER=["Sign-Up","Deal","Deal Rep Assignment","Referrer / Brand Ambassador","Player","Operator & Partner","Redeposits","Referral and Payouts","CMS Integration","Ops list views / Console UX","Global Search","Reporting & Dashboards","Access & Permissions / Org Setup","Data Migration / Import","Storage / Proofs","Testing, UAT & Go-Live","Training & Enablement","Project Mgmt / Scope / Phase / Timeline","Other"]
# apply verification outcomes
final=[]; rejected=[]
for v in M["variances"]:
    r=ver.get(v["var_id"])
    v["verification"]="not verified (Low, not in 20% sample)" if not r else r["verdict"]
    if r:
        v["verification_reason"]=r.get("reason","")
        if r["verdict"]=="downgraded":
            if r.get("new_severity"): v["severity_original"]=v["severity"]; v["severity"]=r["new_severity"]
            if r.get("new_confidence"): v["confidence"]=r["new_confidence"]
        for c in r.get("live_jira",[]) or []:
            for j in v.get("jira",[]):
                if j.get("key")==c.get("key") and c.get("status"): j["live_status"]=c["status"]
    if r and r["verdict"]=="rejected": rejected.append(v)
    else: final.append(v)
final.sort(key=lambda v:(AREA_ORDER.index(v["feature_area"]) if v.get("feature_area") in AREA_ORDER else 99,SEV_ORDER.get(v["severity"],3),v["var_id"]))
def jl(k): return f"[{k}](https://jumpr.atlassian.net/browse/{k})"
def esc(s): return (s or "").replace("|","\\|").replace("\n"," ")
L=[]
L.append(f"# WagerTech: Jira (WAGR) vs Meeting Transcripts — Variance Report\n")
L.append(f"**Classification:** Internal / Client-Confidential. Not for client distribution.  \n**Run date:** {RUN_DATE}  \n**Window covered:** 27 May 2026 (Salesforce PRD Review) to {RUN_DATE}  \n**Model used:** {MODEL}  \n**Prepared for:** Miko Sumagang (Jumpr) — ramp-up on WagerTech  \n")
# exec summary
cat=Counter(v["category"] for v in final); sev=Counter(v["severity"] for v in final)
L.append("## 1. Executive summary\n")
L.append("| Severity | Count |\n|---|---|\n"+"".join(f"| {s} | {sev.get(s,0)} |\n" for s in ["High","Medium","Low"]))
L.append("\n| Category | Meaning | Count |\n|---|---|---|\n"+"".join(f"| {c} | {m} | {cat.get(c,0)} |\n" for c,m in [("V1","Missing ticket"),("V2","Contradiction"),("V3","Stale ticket"),("V4","Status mismatch"),("V5","Detail gap"),("V6","Scope / phase mismatch"),("V7","Owner mismatch"),("V8","Unresolved open question")]))
highs=[v for v in final if v["severity"]=="High"][:10]
L.append("\n**Top High variances**\n")
for v in highs: L.append(f"- **{v['var_id']}** ({v['category']}, {v['feature_area']}): {v['title']} — Jira: {', '.join(j['key'] for j in v.get('jira',[])) or 'no ticket'}")
if summ.get("patterns"):
    L.append("\n**Patterns**\n")
    for p in summ["patterns"]: L.append(f"- {p}")
if summ.get("headline"): L.append(f"\n{summ['headline']}\n")
# method & coverage
vs=Counter(v.get("verification") for v in M["variances"]); 
L.append("\n## 2. Method and coverage\n")
read=[r for r in index if r["status"]=="read"]; empty=[r for r in index if r["status"].startswith("empty")]; dups=[r for r in index if r["status"].startswith("duplicate")]
excl=[r for r in index if r["status"].startswith("excluded")]
t2docs=[d for d in ledger_docs if d.get("tier")=="tier2"]
L.append(f"- **Transcripts read in full (Tier 1, client/project meetings):** {len([d for d in ledger_docs if d.get('tier')!='tier2' and not d.get('excluded')])} docs, {sum(d.get('items',0) for d in ledger_docs if d.get('tier')!='tier2')} extracted items. Each was read start to end by an extractor and re-read by an independent completeness critic.")
L.append(f"- **Tier 2 (Jumpr-internal delivery-team meetings outside the two source folders, screened under rule 5):** {len([d for d in t2docs if not d.get('excluded')])} included / {len([d for d in t2docs if d.get('excluded')])} excluded after reading; {sum(d.get('items',0) for d in t2docs)} items. Tier 2 items are used as corroboration or leads, never as the sole basis for a High/Medium variance.")
L.append(f"- **Empty placeholders (1,180-byte docs; export is a byte-order mark only):** {len(empty)} — "+"; ".join(f"{r['meeting_date']} {re.sub(r' - 2026.*','',r['title'])}" for r in empty)+". Plus 30 Sep Internal Sync (51-second recording, no content).")
L.append(f"- **Duplicates/mirrors noted and removed:** {len(dups)} doc copies (shared-drive mirrors, Kobi-owned originals, 'Copy of' files). The 25 Aug Weekly Sync has 3 copies in the WagerTech subfolder; the largest was kept.")
L.append(f"- **Docs excluded:** {len(excl)} non-transcript WagerTech docs (PRD, SOW, design plans, build walkthrough docs, specs, checklists) and 9 Jumpr-internal meetings with no separable WagerTech delivery content (see Appendix B).")
L.append("- **Meetings with no transcript at all (Calendar cross-check, Kobi's and Miko's calendars):** 20 Jul 2026 'Wagertech <> Jumpr: Deal Rep Assignment' (5 attendees, no notes doc); 16 Sep 2026 Redeposits Discovery (placeholder only); 16 Jun 'Wagertech prep' and 1 Oct 'Waleed <> Kobi' (internal, no doc). 15 other calendar entries are single-attendee focus blocks. 40 of 58 calendar-attached Gemini originals are not shared with miko@; folder copies were used instead.")
L.append(f"- **Jira:** all 505 WAGR issues pulled in full (fields, custom fields, links, all 493 comments) on {RUN_DATE}; 326 not Done. Key gaps WAGR-126/128/129/394/442 do not exist.")
L.append(f"- **Verification:** every High and Medium variance and a 20% sample of Low were re-checked by an independent verifier that re-fetched the Google Doc and the live Jira issue. Results: "+", ".join(f"{k}: {n}" for k,n in vs.items())+".")
if summ.get("limits"):
    L.append("- **Known limits:** "+" ".join(summ["limits"]))
# register
L.append("\n## 3. Variance register\n")
L.append("Grouped by feature area, then severity. Jira status shown is the 3 Oct 2026 snapshot (live status at verification in brackets when different).\n")
cur=None
for v in final:
    if v["feature_area"]!=cur:
        cur=v["feature_area"]; L.append(f"\n### {cur}\n")
    L.append(f"#### {v['var_id']} · {v['category']} · {v['severity']} · verification: {v['verification']}\n")
    L.append(f"**{v['title']}**\n")
    if v.get("jira"):
        for j in v["jira"]:
            live=f" [live: {j['live_status']}]" if j.get("live_status") and j.get("live_status")!=j.get("status") else ""
            L.append(f"- **Jira:** {jl(j['key'])} — {esc(j.get('summary'))} — status {j.get('status')}{live}, assignee {j.get('assignee') or 'unassigned'}  \n  > {esc(j.get('quote'))} *({j.get('quote_source','')})*")
    else:
        ns=v.get("no_ticket_search") or {}
        L.append(f"- **Jira:** no ticket (searched: {', '.join(ns.get('terms',[]))}; nearest considered: {', '.join(jl(k) for k in ns.get('nearest_considered',[])) or 'none'})")
    for e in v.get("transcript_evidence",[]):
        L.append(f"- **Transcript:** {e.get('meeting_title')} — {e.get('date')} — {e.get('speakers') or ''} {('@ '+e['timestamp']) if e.get('timestamp') else ''} — [doc]({e.get('doc_link')}) (line {e.get('line_start')}, {e.get('ledger_id')})  \n  > {esc(e.get('quote'))}")
    for e in v.get("later_or_conflicting_evidence",[]) or []:
        L.append(f"- **Later / conflicting evidence:** {e.get('meeting_title')} — {e.get('date')} — [doc]({e.get('doc_link')}) ({e.get('ledger_id','')})  \n  > {esc(e.get('quote'))}")
    L.append(f"- **What differs:** {v.get('what_differs')}")
    L.append(f"- **Suggested action:** {v.get('suggested_action')}")
    L.append(f"- **Confidence:** {v.get('confidence')}"+(f" · **Verifier note:** {v.get('verification_reason')}" if v.get('verification_reason') else "")+"\n")
# V8 list
L.append("\n## 4. Unresolved open questions (V8) — agenda for the next client sync\n")
for v in [x for x in final if x["category"]=="V8"]:
    e=v.get("transcript_evidence",[{}])[0]
    L.append(f"- **{v['var_id']}** ({v['feature_area']}): {v['title']} — raised {e.get('date')} in {e.get('meeting_title')} ([doc]({e.get('doc_link')})). {v.get('suggested_action','')}")
# V9
L.append("\n## 5. Jira issues with no transcript support (V9) — needs source confirmation, not defects\n")
L.append("| Key | Type | Status | Summary | Flagged by |\n|---|---|---|---|---|")
for k in sorted(M.get("v9",{}),key=lambda k:int(k.split('-')[1])):
    r=jira_index.get(k,{})
    L.append(f"| {jl(k)} | {r.get('type','')} | {r.get('status','')} | {esc(r.get('summary',''))} | {', '.join(M['v9'][k])} |")
# Gemini disagreements
L.append("\n## 6. Gemini summary vs transcript disagreements found during extraction\n")
dis=[]
for ef in sorted(glob.glob(f"{B}/extracts/*.json"))+sorted(glob.glob(f"{B}/extracts/tier2/*.json")):
    ex=json.load(open(ef))
    for d in ex.get("gemini_disagreements",[]) or []:
        dis.append((ex.get("meeting_date"),ex.get("title"),ex.get("doc_link") or f"https://docs.google.com/document/d/{ex.get('doc_id')}/edit",d))
L.append(f"{len(dis)} disagreements across {len({x[1] for x in dis})} docs. Pattern: the Gemini 'Decisions'/'Summary' sections state as agreed what the transcript shows as proposed, split, or client-asked-only.\n")
for date,title,link,d in dis:
    L.append(f"- **{date} — {re.sub(r' - 2026.*','',title or '')}** ([doc]({link}), line {d.get('line')}): Summary says: \"{esc(d.get('summary_text'))[:300]}\" — Transcript: \"{esc(d.get('transcript_quote'))[:300]}\" — {esc(d.get('why'))}")
# Appendix A rejected
L.append("\n## Appendix A. Rejected variances (with verifier reason)\n")
for v in rejected: L.append(f"- **{v['var_id']}** ({v['category']}, {v['feature_area']}): {v['title']} — **rejected:** {v.get('verification_reason')}")
L.append("\n## Appendix A2. Unverified leads (did not meet the citation standard)\n")
for l in M.get("unverified_leads",[]): L.append(f"- ({l.get('feature_area')}) {l.get('title')} — {l.get('why_unverified')} — ledger {', '.join(l.get('ledger_ids',[]) or [])}; Jira {', '.join(l.get('jira_keys',[]) or [])}")
# Appendix B index
L.append("\n## Appendix B. Transcript index\n")
L.append("Full index with every duplicate: `sources/transcript_index.csv`. Primary docs:\n\n| Date | Time | Title | Type | Tier | Folder | Status | Link |\n|---|---|---|---|---|---|---|---|")
for r in index:
    if r["status"].startswith("duplicate") or not r["meeting_date"]: continue
    L.append(f"| {r['meeting_date']} | {r['meeting_time']} | {esc(re.sub(r' - 2026.*','',r['title']))} | {r['meeting_type']} | {r['tier']} | {r['folder']} | {esc(r['status'])} | [doc]({r['link']}) |")
L.append("\nNon-transcript docs excluded: "+"; ".join(esc(r['title']) for r in excl)+".\n")
out=f"{B}/output/WagerTech_Jira_vs_Transcripts_Variance_{RUN_DATE}.md"
open(out,"w").write("\n".join(L))
# CSV register
cols=["var_id","category","severity","confidence","verification","verification_reason","feature_area","title","jira_keys","jira_status","jira_assignee","jira_quote","transcript_meeting","transcript_date","transcript_speaker","transcript_timestamp","doc_link","transcript_quote","later_evidence","what_differs","suggested_action"]
with open(f"{B}/output/WagerTech_Variance_Register_{RUN_DATE}.csv","w",newline="") as fh:
    w=csv.writer(fh); w.writerow(cols)
    for v in final+rejected:
        e=(v.get("transcript_evidence") or [{}])[0]; j=(v.get("jira") or [{}])[0]
        later=" || ".join(f"{x.get('date')} {x.get('meeting_title')}: {x.get('quote')}" for x in v.get("later_or_conflicting_evidence",[]) or [])
        w.writerow([v["var_id"],v["category"],v["severity"],v.get("confidence"),v.get("verification"),v.get("verification_reason",""),v.get("feature_area"),v.get("title"),"; ".join(x.get("key","") for x in v.get("jira",[])),"; ".join(x.get("status","") for x in v.get("jira",[])),"; ".join(x.get("assignee","") or "" for x in v.get("jira",[])),j.get("quote",""),e.get("meeting_title"),e.get("date"),e.get("speakers"),e.get("timestamp"),e.get("doc_link"),e.get("quote"),later,v.get("what_differs"),v.get("suggested_action")])
print("wrote",out,"variances",len(final),"rejected",len(rejected))
