export const meta = {
  name: 'wagertech-match',
  description: 'Find Jira-vs-transcript variances per feature area and sweep Jira issues for transcript support',
  phases: [{ title: 'Finders' }, { title: 'Sweep' }],
}
const B = '/home/user/sb1-yvxluvkv/wagertech_variance'
const F_SCHEMA = { type:'object', properties:{ area:{type:'string'}, output_path:{type:'string'}, variances_count:{type:'integer'}, leads_count:{type:'integer'}, notes:{type:'string'} }, required:['area','output_path','variances_count'] }
const S_SCHEMA = { type:'object', properties:{ batch:{type:'string'}, output_path:{type:'string'}, supported:{type:'integer'}, no_support:{type:'integer'}, candidate_variances:{type:'integer'}, notes:{type:'string'} }, required:['batch','output_path','candidate_variances'] }
const finders = (args.areas || []).map(a => () => agent(`Variance finder for feature area "${a.area}"${a.lens ? ` — LENS: ${a.lens}` : ''}.
Read in full first (cat): ${B}/work/VARIANCE_FINDER_INSTRUCTIONS.md. Follow it exactly; precision over volume; READ-ONLY.
Your area ledger file: ${B}/work/ledger_by_area/${a.file}.json (${a.ledger_items} items). Your Jira shortlist: ${B}/work/jira_by_area/${a.file}.tsv (${a.jira_issues} issues; approximate — also grep ${B}/sources/jira_digest.tsv). Full ledger for later-meeting checks: ${B}/work/ledger_compact.tsv and ${B}/work/ledger.json. Per-issue JSON: ${B}/raw/jira/issues/WAGR-nnn.json (read description AND all comments).
${a.lens ? `Lens guidance: ${a.lens_detail}` : ''}
Write ${B}/work/supersession/${a.file}${a.suffix||''}.json and ${B}/work/variances/${a.file}${a.suffix||''}.json (validate with python). Return the structured summary (area, output_path, variances_count, leads_count, notes).`, { label: `find:${a.file}${a.suffix||''}`, phase: 'Finders', schema: F_SCHEMA, model: 'opus', effort: 'high' }))
const sweeps = (args.batches || []).map(b => () => agent(`Jira-side sweep for batch ${b.name}: issues ${b.keys.join(', ')}.
Read in full first (cat): ${B}/work/JIRA_SWEEP_INSTRUCTIONS.md and the schema section of ${B}/work/VARIANCE_FINDER_INSTRUCTIONS.md. READ-ONLY. Per-issue JSON in ${B}/raw/jira/issues/. Ledger: ${B}/work/ledger_compact.tsv (grep) and ${B}/work/ledger.json (details by ledger_id).
Classify EVERY issue in the batch (supported / no_transcript_support / candidate_variance) and write ${B}/work/jira_sweep/${b.name}.json (validate with python). Return the structured summary (batch, output_path, supported, no_support, candidate_variances, notes).`, { label: `sweep:${b.name}`, phase: 'Sweep', schema: S_SCHEMA, model: 'opus', effort: 'high' }))
log(`Launching ${finders.length} finders and ${sweeps.length} sweeps`)
const res = await parallel([...finders, ...sweeps])
const ok = res.filter(Boolean)
log(`Done: ${ok.length}/${res.length}`)
return { finders: res.slice(0, finders.length), sweeps: res.slice(finders.length) }
