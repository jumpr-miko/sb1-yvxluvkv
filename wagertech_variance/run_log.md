# WagerTech Jira vs Transcript Variance — Run Log

Run date: 2026-10-03
Classification: Internal / Client-Confidential. Not for client distribution.
Working directory: wagertech_variance/ (all writes local only; every external system read-only)

## Step 0: Access check
- 2026-10-03: Atlassian MCP connector OK. getAccessibleAtlassianResources returned cloudId ae3fb813-5f3a-4835-90e6-662a3f883e09 (https://jumpr.atlassian.net).
- 2026-10-03: JQL `project = WAGR` returned totalCount 505. Matches the prompt's expected count. Oldest issue WAGR-329 "Schedule Kick off Meeting" created 2026-06-15.
- 2026-10-03: Google Drive connector OK. parentId listing works for both folders:
  - Root "Jumpr Transcripts" 1rx9DbkBOd2SC7o18L9miNTRFugtlu_De — lists, paginated.
  - Subfolder "WagerTech" 1cGr2G_1G_M2GAsVJGELWAoiov0fUq8B2 — lists, paginated.
- Drive listing returns 5 files per page regardless of pageSize=100. Full pagination required.
- Google Calendar connector: tools present in session (list_events / search_events). Coverage check to be attempted.

## Step 1: Inventory
(pending)

## Step 1/2 progress (2026-10-03)
- Jira pulled in full view (description, all fields, custom fields, issue links, embedded comments) by key range: WAGR-1..100, 101..200, 201..300, 301..400, 401..500, >500. Merged: **505 unique issues** (matches expected). Key gaps (no issue exists): WAGR-126, 128, 129, 394, 442. Highest key WAGR-510.
- Comments: every issue's embedded comment list length equals its comment total (493 comments across 279 issues), so no separate comment paging was needed.
- Status set (listJiraStatuses, project WAGR): Open, Requirements, Ready, In Progress, Solution Review, Jumpr Review, Client Review, Rework Required, Ready for Release, Deployed, Done, Cancelled. Observed in data: Done 147+, Jumpr Review 136, Open 84, Requirements 53, Ready 30, Cancelled 29, In Progress 15, Solution Review 1 (before the 10 newest issues). Not-done count 326 (matches prompt).
- Raw Jira saved: raw/jira/range_*.json, merged raw/jira/wagr_all_issues_full.json, per-issue raw/jira/issues/WAGR-nnn.json.
- Drive: subfolder "WagerTech" holds 30 docs (all titled Wagertech/WAGR). Root "Jumpr Transcripts" holds 127 direct children (91 docs, 22 CSVs, 14 subfolders); 18 docs titled Wager/WAGR. Listing saved sources/drive_root_listing.json (by subagent).
- Drive title search (title contains Wager/WAGR, Google Docs) returned ~162 files across many folders, including shared-drive mirrors (parent 0AGuSWA9erI5-Uk9PVA) and Kobi-owned originals. Several meetings exist ONLY outside the two source folders (17 Jul 60 Min, 21 Jul Wagertech sync, 24 Jul API Testing for SLC, 28 Jul Debrief, 4 Aug Weekly Sync, 1 Sep Internal Sync, 1 Sep Weekly Sync, 3 Jun Next Steps). Decision: include them (rule: title contains Wagertech) and flag their location.
- Full-text search in root for 'wagertech' without Wager in title: Liz / Taryn Catch up (25 Sep), Emily / Taryn Operator Supported Markets (28 Sep), Waleed <> Kobi (21 Sep), Kobi <> Taryn Redeposits Debrief (16 Sep, from root listing), plus Jumpr-internal management docs (Management Meeting 28 Sep, Monthly Business Update 24 Sep, 30 Day Check-in 16 Sep, Waleed <> DK 24 Sep, Next Chapter 7 Aug) and tooling (Transcript Sort Ledger CSVs, Doris Sort Rules). Internal management docs to be screened for WagerTech delivery content only, under rule 5.
- Calendar (optional check): connector works. Kobi's calendar lists 77 WagerTech events 27 May–3 Oct with 57 Gemini/Transcript attachments; Miko's lists 19. Saved sources/calendar_*.
- Transcript export test (30 Sep Weekly Sync, 3.47 MB Docs size): download_file_content text/plain export decodes to 236,668 bytes, 2,686 lines, full transcript with per-speaker lines and HH:MM:SS timestamps, ends with "Transcription ended after 03:26:36". read_file_content (markdown) was also complete here but strips timestamps. Standard: text/plain export, saved to raw/transcripts/.

## Rule-5 screen of Jumpr-internal docs (2026-10-03)
- 16 internal docs screened by a dedicated agent (filter only; no personnel/commercial content recorded). 7 include with narrow line ranges, 9 exclude. Results: sources/internal_doc_screen.tsv. Included docs moved to raw/transcripts_restricted/ and will be read ONLY within the listed ranges.
- Excluded raw copies deleted locally (Waleed / Liz 28 Sep; the agent removed its own scratch copies of the other excludes).
- SECURITY NOTE (no values present in any doc): the 11 Aug 2026 Kobi/Waleed transcript (lines 19-21) states that integration client credentials and a sandbox password were posted in a shared external channel in July. Recommend confirming those were rotated/removed. Not reproduced anywhere in this run.
- Transcript index built: sources/transcript_index.csv (309 doc rows incl. duplicates/mirrors; 47 Tier-1 primaries captured and read; 8 empty 1,180-byte placeholders confirmed (export = BOM only): 8 Sep, 10 Sep, 11 Sep, 22 Sep, 29 Sep, 2 Oct Internal Syncs, 16 Sep Redeposits Discovery, 2 Oct CMS Integration Sync; 30 Sep Internal Sync = 51-second recording, no content).
- Tier 2 (internal delivery-team series outside the two source folders, found via full-text search: Kobi <> Taryn daily/weekly, Kobi <> Cedrick, Marc / Kobi, Taryn / Kobi, Miko <> Kobi, etc.): 39 primaries to be fetched, screened and extracted by agents, labelled as Tier 2 in the report.

## Step 3 extraction (started 2026-10-03)
- Tier 1: 47 transcripts → 4 parallel Workflow pipelines (extract → independent completeness critic), Opus 5.5 high effort, one transcript per agent, full read in ≤300-line chunks.
- Tier 2: 52 docs (39 fetch+screen+extract, 7 pre-screened range-restricted, 6 management/business docs rule-5 strict) → 4 parallel Workflow pipelines.
- Deterministic quote verification (work/check_quotes.py) runs on every extract: whitespace-normalized verbatim match against the raw transcript; speaker-prefix and ellipsis tolerant; filler words um/uh ignored. Early run: 92%+ verified; failures reviewed and traced to formatting, not wording changes.
- Calendar coverage check done: sources/calendar_meetings_without_transcript.tsv. Real gap: 20 Jul 2026 "Wagertech <> Jumpr: Deal Rep Assignment" (5 attendees) has no notes doc.
