# Independent verifier instructions (one agent per variance)

You did not create this variance. You receive only the claim and its citations. Your job is to try to break it. Default to skepticism. READ-ONLY on Jira and Google Drive (no comments, edits, transitions, shares). Write only under /home/user/sb1-yvxluvkv/wagertech_variance/verification/.
B = /home/user/sb1-yvxluvkv/wagertech_variance

Answer four questions with evidence:
1. Does the quote exist verbatim in the source doc? Re-fetch the doc from Google Drive yourself: ToolSearch `select:mcp__Google_Drive__download_file_content,mcp__Google_Drive__read_file_content`; call download_file_content(fileId, exportMimeType "text/html"); if saved to a file, convert with `python3 B/work/gdoc_html2txt.py <saved> B/verification/tmp_<VARID>.txt`; if inline, use read_file_content. Then search for the quote with whitespace normalized (python: re.sub(r'\s+',' ',...) on both; filler words "um/uh" may have been dropped from the quote — that is acceptable; changed wording is not). Report found / found-with-minor-filler-differences / not found.
2. Does the quote support the claim in context? Read at least 40 lines before and after the quote in the fetched text. Watch for: a question read as a decision, a proposal read as agreement, sarcasm/hypotheticals, a later sentence that walks it back, the wrong speaker, or a client ask Jumpr did not accept.
3. Is there a LATER meeting that changes the conclusion? grep B/work/ledger_compact.tsv for the topic keywords with dates after the cited meeting; open candidate rows in B/work/ledger.json and, if needed, the raw transcript lines (B/raw/transcripts/*__<docid>.txt). If a later decided item changes it, say so and cite it.
4. Does the Jira issue (including ALL comments) already cover this? ToolSearch `select:mcp__Atlassian_MCP__getJiraIssue,mcp__Atlassian_MCP__searchJiraIssuesUsingJql,mcp__Atlassian_MCP__executeRead`; cloudId ae3fb813-5f3a-4835-90e6-662a3f883e09. Call getJiraIssue(view "full") for each cited key and read description, status, assignee, Phase, and comments (if comment total > 20 use executeRead name "listJiraIssueComments"). For V1 (no ticket) run searchJiraIssuesUsingJql with `project = WAGR AND text ~ "<term>"` for 2–3 distinct terms and list what came back. Also compare the live status/assignee with the claim (the local snapshot is from 3 Oct 2026).

Verdict:
- confirmed — all four hold (quote exists, supports the claim in context, no later reversal, Jira does not already cover it) and severity is right.
- downgraded — the variance is real but weaker than claimed (give new severity and/or new confidence and why), or partially covered by Jira.
- rejected — quote missing/misread, later meeting resolved it, or Jira already covers it. Give the one-line reason.
Also record `corrections` (better Jira key, corrected date/speaker, etc.) and `live_jira_status` for each key.
Write B/verification/items/<VARID>.json with {var_id, verdict, new_severity, new_confidence, reason, q1, q2, q3, q4, corrections, live_jira:[{key,status,assignee,comments_total}]}. Delete your tmp_<VARID>.txt when done. Return the structured summary requested.
