export const meta = {
  name: 'wagertech-verify',
  description: 'Independent verification of each High/Medium variance (and a 20% sample of Low) against the live Google Doc and Jira issue',
  phases: [{ title: 'Verify' }],
}
const B = '/home/user/sb1-yvxluvkv/wagertech_variance'
const SCHEMA = { type:'object', properties:{ var_id:{type:'string'}, verdict:{type:'string', enum:['confirmed','downgraded','rejected']}, new_severity:{type:'string'}, new_confidence:{type:'string'}, reason:{type:'string'} }, required:['var_id','verdict','reason'] }
const items = args.var_ids
log(`Verifying ${items.length} variances`)
const res = await pipeline(items, id => agent(`Independent verification of variance ${id}.
Read in full first (cat): ${B}/work/VERIFIER_INSTRUCTIONS.md. You did not write this variance; try to break it. READ-ONLY on Jira and Drive.
The claim and its citations are in ${B}/verification/claims/${id}.json (read it with cat). Do not read other variance files. Re-fetch the cited Google Doc(s) and Jira issue(s) yourself as the instructions say, check for later meetings in the ledger, and write ${B}/verification/items/${id}.json. Return the structured summary (var_id, verdict, new_severity, new_confidence, reason).`, { label: `verify:${id}`, phase: 'Verify', schema: SCHEMA, model: 'opus', effort: 'high' }))
const ok = res.filter(Boolean)
const c = { confirmed: 0, downgraded: 0, rejected: 0 }
for (const r of ok) c[r.verdict] = (c[r.verdict] || 0) + 1
log(`Verification done: ${JSON.stringify(c)}; ${items.length - ok.length} agent failures`)
return { counts: c, results: res }
