import re,json,sys
c=json.load(open('verification/claims/VAR-082.json'))
docs={'1yKF9Ti2Flmefnkog3nBkherM0g5KkkEdIJzoR6j6RxM':'verification/tmp_VAR-082.txt','1pc9pSc8tFg_8IuqTrOcRpNaRF9l8hiB6sjpqizzbqZo':'verification/tmp_VAR-082b.txt'}
def norm(s):
    s=re.sub(r'\b(um|uh)\b[,]?','',s,flags=re.I)
    return re.sub(r'\s+',' ',s).strip().lower()
for e in c['transcript_evidence']+c['later_or_conflicting_evidence']:
    did=e.get('doc_id') or e['doc_link'].split('/d/')[1].split('/')[0]
    lines=open(docs[did]).read().split('\n')
    full=norm(' '.join(lines))
    parts=[p.split(':',1)[1] for p in e['quote'].split(' / ')]
    res=[]
    for p in parts:
        res.append(norm(p) in full)
    # find line
    first=norm(parts[0])[:40]
    ln=[i+1 for i,l in enumerate(lines) if first in norm(l)]
    print(e['ledger_id'],res,ln)
