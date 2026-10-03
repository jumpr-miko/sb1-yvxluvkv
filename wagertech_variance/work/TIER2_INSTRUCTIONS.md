# Tier 2 instructions: fetch, screen, extract (internal delivery-team meetings outside the two source folders)

Read /home/user/sb1-yvxluvkv/wagertech_variance/work/EXTRACT_INSTRUCTIONS.md first; all of its rules apply (read-only, rule 5, secrets, verbatim quotes, firmness strictness, feature areas, item schema).

These docs are Jumpr-INTERNAL meetings (1:1s, standups, planning). They often mix WagerTech delivery talk with other clients, staffing, hours, pricing or personnel. You must extract ONLY WagerTech delivery/scope content and must not record anything else, not even in notes.

## Step 1: Fetch (unless a local file is given)
1. ToolSearch `select:mcp__Google_Drive__download_file_content,mcp__Google_Drive__read_file_content`.
2. Call `mcp__Google_Drive__download_file_content` with `fileId` = the doc id and `exportMimeType` = `text/html`.
   - If the result says it was saved to a file path (large result), run:
     `python3 /home/user/sb1-yvxluvkv/wagertech_variance/work/gdoc_html2txt.py <saved_path> /home/user/sb1-yvxluvkv/wagertech_variance/raw/transcripts_tier2/<YYYY-MM-DD>_<HHMM>_<slug>__<docid>.txt`
   - If the result comes back inline (small doc, base64 you cannot read), instead call `mcp__Google_Drive__read_file_content` with the same fileId and read the returned text directly. Save that text to the same local path with the Write tool, and set `raw_copy: "agent-saved-from-read_file_content"` in the extract. Quotes must come from the tool output.
3. `wc -l` the local file and read ALL of it in <=300-line chunks (`sed -n`).

## Step 2: Screen
Decide: does the doc contain WagerTech delivery/scope content (requirements, design or scope decisions, phase/deferral calls, ticket or feature status, open questions, blockers, client commitments, integration details)? 
- If NO: write the extract JSON with `screen_verdict: "exclude"`, `screen_reason`, `items: []`, then DELETE the local text copy (`rm`). Return the summary.
- If YES: set `screen_verdict: "include"`, note `delivery_line_ranges` (the line ranges you used), and extract from those passages only.

## Step 3: Extract
Follow EXTRACT_INSTRUCTIONS. Additional Tier-2 fields at doc level: `tier: "tier2"`, `screen_verdict`, `delivery_line_ranges`, `evidence_grade`:
- `evidence_grade: "transcript"` if the doc has a Transcript section with speaker lines and your quotes come from it;
- `evidence_grade: "gemini-notes-only"` if the doc holds only Gemini notes/summary (no transcript). In that case firmness may not exceed "proposed" and every item gets `note: "Gemini notes only; not usable as sole evidence for a decision"`.
If a task gives you explicit `allowed_line_ranges`, read ONLY those ranges plus the first 15 header lines (for attendees/date). Do not read or quote outside them.

## Output
JSON to /home/user/sb1-yvxluvkv/wagertech_variance/extracts/tier2/<same basename as the local file>.json (create the folder if needed). Validate with python json.load. Return the structured summary.
