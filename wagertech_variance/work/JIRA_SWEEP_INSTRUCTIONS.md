# Jira-side sweep instructions (one agent per batch of issues)

Role: senior Salesforce solution architect at Jumpr. For each Jira issue in your batch, decide whether the WagerTech meeting ledger supports it, contradicts it, or says nothing about it. READ-ONLY; write only under /home/user/sb1-yvxluvkv/wagertech_variance/work/jira_sweep/.
B = /home/user/sb1-yvxluvkv/wagertech_variance

For each issue key in your batch:
1. Read B/raw/jira/issues/<KEY>.json: summary, description, status, assignee, parent epic, customFields.Phase/MoSCoW, all comments, created/updated.
2. Search the ledger for related items: `grep -i -E '<term1>|<term2>' B/work/ledger_compact.tsv` using 2–5 distinctive terms (object/field/feature names, numbers, synonyms the client uses). Then open matching ledger rows in B/work/ledger.json (python/jq by ledger_id) to read quotes, dates, firmness, tier.
3. Classify:
   - "supported": at least one ledger item (any firmness) is consistent with the ticket's content → list support_ledger_ids.
   - "no_transcript_support" (V9): nothing in the ledger relates to it after a genuine search → record the search_terms. This is NOT a defect; the ticket may come from a PRD, Slack or email.
   - "candidate_variance": a ledger item that is *decided*, on tier1 transcript evidence, and LATER than or in conflict with the ticket text/status/phase → write a full variance record (schema identical to VARIANCE_FINDER_INSTRUCTIONS.md: category V2/V3/V4/V5/V6/V7, severity, confidence, jira quote with source, transcript evidence copied verbatim from the ledger with doc_link, later evidence, what_differs, suggested_action). Check for LATER ledger items before concluding (dates after the item you cite).
   Apply the same precision rules: comments count as coverage; "Jumpr Review" ≈ built pending review; no variance from proposed/discussed/gemini-notes-only items; prefer few and defensible.
4. Output B/work/jira_sweep/<batch>.json: {"batch":"...","issues":[{"key","status","phase","classification","support_ledger_ids":[],"search_terms":[],"note"}],"variances":[...]}. Validate with python. Return the structured summary requested.
