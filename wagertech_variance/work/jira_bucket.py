#!/usr/bin/env python3
"""Pre-bucket the 505 Jira issues into feature areas (multi-label) for the matching agents. Writes work/jira_by_area/<area>.tsv and work/jira_area_map.json"""
import json,re,os,csv
from collections import defaultdict
B="/home/user/sb1-yvxluvkv/wagertech_variance"
issues=json.load(open(f"{B}/raw/jira/wagr_all_issues_full.json"))
EPIC_AREA={"WAGR-3":["Sign-Up"],"WAGR-11":["Deal","Deal Rep Assignment"],"WAGR-16":["Testing, UAT & Go-Live"],"WAGR-18":["Testing, UAT & Go-Live"],"WAGR-19":["Data Migration / Import"],"WAGR-22":["Training & Enablement"],"WAGR-24":["Reporting & Dashboards"],"WAGR-26":["Testing, UAT & Go-Live"],"WAGR-27":["Player","Referrer / Brand Ambassador"],"WAGR-31":["Storage / Proofs","Sign-Up"],"WAGR-33":["Access & Permissions / Org Setup"],"WAGR-39":["CMS Integration","Deal"],"WAGR-72":["Player"],"WAGR-298":["Project Mgmt / Scope / Phase / Timeline"],"WAGR-300":["Operator & Partner"],"WAGR-304":["Sign-Up"],"WAGR-305":["Sign-Up","Ops list views / Console UX"],"WAGR-382":["Operator & Partner"],"WAGR-420":["Player","Sign-Up"],"WAGR-443":["Project Mgmt / Scope / Phase / Timeline"],"WAGR-444":["CMS Integration","Deal Rep Assignment"],"WAGR-449":["Access & Permissions / Org Setup"],"WAGR-478":["Project Mgmt / Scope / Phase / Timeline"],"WAGR-479":["Testing, UAT & Go-Live"]}
KW=[("Sign-Up",r"sign.?up|slc|study link|intake|proof|fraud"),("Deal",r"\bdeal"),("Deal Rep Assignment",r"rep assign|assignment"),("Referrer / Brand Ambassador",r"referrer|brand ambassador|\brep\b|\breps\b"),("Player",r"player|person account|vip"),("Operator & Partner",r"operator|partner|market|vertical|billing"),("Redeposits",r"redeposit"),("Referral and Payouts",r"payout|referral|commission|bonus"),("CMS Integration",r"cms|webhook|api|integration|external id|payload|affiliate link"),("Ops list views / Console UX",r"list view|console|layout|table view|split view|screen flow|page|button|related list"),("Global Search",r"global search|search"),("Reporting & Dashboards",r"report|dashboard"),("Access & Permissions / Org Setup",r"permission|access|profile|org|security|login|user|sharing"),("Data Migration / Import",r"migration|import|data load|backfill"),("Storage / Proofs",r"storage|drive|dropbox|gcp|file|attachment"),("Testing, UAT & Go-Live",r"uat|test|go.?live|deploy|release|cutover"),("Training & Enablement",r"training|enablement|handoff|playbook|documentation|walkthrough"),("Project Mgmt / Scope / Phase / Timeline",r"scope|phase 2|phase|timeline|sprint|kick ?off|meeting")]
m={}
by=defaultdict(list)
for i in issues:
    f=i["fields"]; k=i["key"]; summ=f.get("summary") or ""; desc=(f.get("description") or "")[:1500]
    parent=(f.get("parent") or {}).get("key")
    areas=set(EPIC_AREA.get(k,[]))|set(EPIC_AREA.get(parent,[]))
    text=summ+" "+desc
    for a,pat in KW:
        if re.search(pat,summ,re.I): areas.add(a)
    if not areas:
        for a,pat in KW:
            if re.search(pat,text,re.I): areas.add(a)
    if not areas: areas={"Other"}
    m[k]=sorted(areas)
    row=[k,f["issuetype"]["name"],f["status"]["name"],(f.get("assignee") or {}).get("displayName",""),parent or "",summ]
    for a in areas: by[a].append(row)
json.dump(m,open(f"{B}/work/jira_area_map.json","w"),indent=1)
os.makedirs(f"{B}/work/jira_by_area",exist_ok=True)
for a,rows in by.items():
    with open(f"{B}/work/jira_by_area/{re.sub(r'[^A-Za-z0-9]+','_',a)}.tsv","w") as fh:
        fh.write("key\ttype\tstatus\tassignee\tepic\tsummary\n")
        for r in sorted(rows,key=lambda r:int(r[0].split('-')[1])): fh.write("\t".join(r)+"\n")
print({a:len(r) for a,r in sorted(by.items())})
