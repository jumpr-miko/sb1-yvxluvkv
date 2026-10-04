# Variance finder instructions (one agent per feature area)

Role: senior Salesforce solution architect at Jumpr. Compare what the WagerTech meetings decided (the ledger) with what the Jira project WAGR says, for ONE feature area. Precision beats volume. A false variance costs more trust than a missed one. Every variance must be traceable by a human in under a minute.
READ-ONLY: never call a Jira/Drive/Slack/email write tool. Write only under /home/user/sb1-yvxluvkv/wagertech_variance/work/.

## Inputs (all local; B = /home/user/sb1-yvxluvkv/wagertech_variance)
- B/work/ledger_by_area/<Area>.json — ledger items for your area, chronological. Fields: ledger_id, date, meeting_title, tier (tier1 = client/project meetings; tier2 = internal 1:1s/standups), evidence_grade (transcript | gemini-notes-only), type, firmness (decided | proposed | discussed | client-asked-not-agreed), topic, statement, quote (verbatim), line_start, doc_link, speakers, timestamp, jira_keys_mentioned, supersedes_hint, quote_verified.
- B/work/ledger_compact.tsv and B/work/ledger.json — ALL items across areas. Grep them for cross-area context and, crucially, for LATER items on the same topic.
- B/work/jira_by_area/<Area>.tsv — pre-bucketed Jira issues (approximate). Also grep B/sources/jira_digest.tsv (all 505 issues: key, type, status, assignee, epic, phase, summary).
- B/raw/jira/issues/WAGR-nnn.json — full issue: fields.summary, fields.description (markdown), fields.status.name, fields.assignee.displayName, fields.parent (epic), fields.customFields (Phase, MoSCoW, Sprint...), fields.issuelinks, fields.comment.comments[] (author.displayName, created, body), created, updated.
- B/raw/transcripts/*.txt — read more context around any quote (sed -n around line_start).
- Jira status semantics on this project: Open / Requirements / Ready (not started) → In Progress → Solution Review → Jumpr Review (built, internal review) → Client Review → Rework Required → Ready for Release → Deployed → Done; Cancelled. Epics WAGR-443 "Out Of Scope (Holding Pen)" and WAGR-478 "Phase 2 Stories" hold deferred/out-of-scope items; Phase custom field = 1 or 2.

## Step A: topic timeline and supersession
Read the whole area ledger. Group items by topic. For each topic: the current truth = the LATEST *decided* item (tier1 transcript evidence outranks tier2 or gemini-notes-only). Mark earlier items it supersedes / refines / reverses. Write B/work/supersession/<Area>.json: [{topic, current_truth_ledger_id, superseded:[ids], refined:[ids], reversed:[ids], note}].

## Step B: match and classify
For each topic with a decided item (and for material client-asked-not-agreed / open questions):
1. Find Jira matches: jira_keys_mentioned first; then search summaries (area TSV + jira_digest.tsv) by object/field/feature names; open each candidate's JSON and read the description AND every comment.
2. Classify with the V codes:
   V1 Missing ticket — decided requirement/change/action item with no issue anywhere (search Done, Cancelled, Holding Pen and Phase 2 epics too). Record the search terms used and nearest tickets considered.
   V2 Contradiction — Jira text says X, latest decided transcript item says Y.
   V3 Stale ticket — ticket reflects an earlier decision a later meeting superseded.
   V4 Status mismatch — meeting says done/deployed/blocked/deprioritized/deferred; Jira status says otherwise (or the reverse). Interpret Jira statuses with the semantics above; "built, pending review" ≈ Jumpr Review is NOT a mismatch.
   V5 Detail gap — ticket exists but lacks acceptance criteria / rules / edge cases / data details stated in a meeting (quote the rule; confirm the ticket description+comments lack it).
   V6 Scope/phase mismatch — deferred to Phase 2 / out of scope in a meeting but active (Phase 1 / in sprint / in progress) in Jira, or the reverse.
   V7 Owner mismatch — only when it matters for delivery.
   V8 Unresolved open question — raised in a meeting, not answered in any LATER meeting (grep the full ledger), not captured in Jira.
3. Severity: High = wrong build / missed go-live requirement / broken client commitment. Medium = rework, grooming gap, unclear AC. Low = hygiene.
4. Confidence: high / medium / low. Use low when matching is by meaning only and the ticket might cover it under different wording.

## Precision rules (apply all)
- Jira "covers it" if the description OR any comment states it. Read all comments before calling V1/V5.
- Never build a variance on a "proposed"/"discussed" item or a gemini-notes-only item alone. Those can only support V8 or an unverified lead.
- A client ask that Jumpr did not agree to is not a requirement; it may be a V8 or a lead.
- Done/Cancelled tickets are real evidence; a later meeting change against a Done ticket is V3 (or V1 if a new ticket is needed). Do not double-report the same gap under two codes.
- Quote Jira verbatim (≤300 chars) and say where from ("description" or "comment by X on date"). Quote the transcript verbatim from the ledger (do not retype; copy the ledger quote).
- If you cannot meet the citation standard (≥1 verbatim transcript quote with doc link AND ≥1 Jira key or an explicit, searched "no ticket"), put it in unverified_leads with the reason.
- Prefer 5 defensible variances over 20 arguable ones.

## Output: B/work/variances/<Area>.json
{"area": "...", "variances": [{"temp_id":"<AREA-01>","category":"V1".."V8","severity":"High|Medium|Low","confidence":"high|medium|low","feature_area":"...","title":"one line",
  "jira":[{"key":"WAGR-nnn","status":"...","assignee":"...","summary":"...","quote":"verbatim ≤300 chars","quote_source":"description | comment by <name> <date>"}]  (or [] with "no_ticket_search":{"terms":[...],"nearest_considered":["WAGR-..."]} for V1),
  "transcript_evidence":[{"ledger_id":"L0001","date":"...","meeting_title":"...","doc_link":"...","speakers":"...","timestamp":"...","line_start":n,"quote":"verbatim"}],
  "later_or_conflicting_evidence":[same shape] ,
  "what_differs":"1-2 plain sentences","suggested_action":"suggestion only","checked_later_meetings":true,"reasoning":"short"}],
 "unverified_leads":[{"title","why_unverified","ledger_ids":[],"jira_keys":[]}],
 "v9_reviewed_no_support":["WAGR-nnn", ...]  (issues in your area TSV you examined and found no transcript item for; optional),
 "notes":"..."}
Validate JSON with python before finishing. Return the structured summary requested.

## Gap completeness (added 2026-10-04 at the project lead's request)
The project lead wants EVERY gap visible. The "prefer few" rule applies to arguable V2–V7 claims, NOT to V1:
- List every *decided* client ask, requirement, change or action item that has no Jira ticket as a V1, even when the severity is Low. Do not drop V1s for brevity. The precision bar still applies: the item must be decided (tier1 transcript evidence, or client-confirmed), the search must be documented (terms + nearest tickets), and comments count as coverage.
- Also add a doc-level `module_coverage` object to your output: for your feature area, say whether Jira has an epic and tickets for the module at all, how many tickets you found for it, and list any sub-module or capability the meetings decided on that has no ticket cluster (e.g. "Redeposits: discovery decided 20+ rules; Jira holds 5 tickets, no epic"). Format: {"area":"...","jira_epics":["WAGR-nn"],"ticket_count":n,"uncovered_capabilities":[{"capability":"...","ledger_ids":[...],"note":"..."}]}.
- Client asks that Jumpr did NOT agree to (client-asked-not-agreed) with no ticket go in `unverified_leads` with why_unverified "client ask not agreed; no ticket" so they are still visible.
