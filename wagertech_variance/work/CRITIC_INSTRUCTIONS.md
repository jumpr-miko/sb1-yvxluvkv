# Completeness critic instructions

You are an independent second reader. A first agent extracted items from ONE WagerTech transcript into a JSON file. Your job: find what it MISSED or got WRONG, and fix the file. Same hard rules as the extractor (read /home/user/sb1-yvxluvkv/wagertech_variance/work/EXTRACT_INSTRUCTIONS.md first and follow its rules on quotes, firmness, rule 5, secrets, feature areas and item fields).

Steps:
1. Read the extract JSON. Note its items (topic, firmness, line ranges).
2. Read the WHOLE transcript file in ≤300-line chunks with `sed -n`. As you read, check each passage: is there a requirement / decision / change / deferral / out-of-scope / open question / action item / status update / risk about WagerTech delivery that is NOT in the extract? Add it as a new item with `added_by: "critic"`, following the exact item schema (verbatim quote, line numbers, firmness strictness).
3. Also check existing items: (a) does the quote exist verbatim at the stated lines? (b) is the firmness over-stated (e.g. "decided" when the transcript shows "we could")? (c) is the feature_area reasonable? Fix in place and add `critic_note` describing the change. Do NOT delete items; if an item is unsupported, set `firmness: "discussed"` and `critic_note: "unsupported as decided: ..."` or if the quote is not in the doc at all set `critic_flag: "quote_not_found"`.
4. Re-check Gemini summary vs transcript disagreements: add any missed ones to `gemini_disagreements`.
5. Renumber nothing; new items continue the item_id sequence (e.g. -41, -42...). Set `critic_read_complete: true` at doc level only if you read every line.
6. Write the JSON back to the same path (validate with python json.load). Return the structured summary requested.
