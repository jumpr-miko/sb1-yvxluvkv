#!/usr/bin/env python3
"""Convert a Google Docs HTML export (as saved by the Drive MCP download tool: JSON with base64 'content')
to plain text that mirrors the Docs text/plain export: one line per paragraph, '* ' for list items."""
import sys, json, base64, html
from html.parser import HTMLParser

class P(HTMLParser):
    BLOCK = {"p","div","h1","h2","h3","h4","h5","h6","li","tr","table","ul","ol","br","hr","title"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out=[]; self.cur=[]; self.in_style=False; self.li=False; self.in_sup=False
    def flush(self):
        t="".join(self.cur)
        t=t.replace(" "," ")
        if self.li: t="* "+t.strip(); self.li=False
        self.out.append(t.rstrip())
        self.cur=[]
    def handle_starttag(self,tag,attrs):
        if tag in ("style","script","head"): self.in_style=True
        if tag=="li": self.li=True
        if tag=="sup": self.in_sup=True
        if tag=="br": self.cur.append("\n")
        elif tag in self.BLOCK and tag not in ("br",) and self.cur: self.flush()
    def handle_endtag(self,tag):
        if tag in ("style","script","head"): self.in_style=False
        if tag=="sup": self.in_sup=False
        if tag in self.BLOCK and tag!="br": self.flush()
    def handle_data(self,d):
        if self.in_style or self.in_sup: return
        self.cur.append(d)
    def text(self):
        if self.cur: self.flush()
        lines=[]
        for o in self.out:
            lines.extend(o.split("\n"))
        # collapse runs of >3 blank lines to keep it readable
        res=[]; blank=0
        for l in lines:
            if l.strip()=="" :
                blank+=1
                if blank<=3: res.append("")
            else:
                blank=0; res.append(l)
        return "\n".join(res).strip()+"\n"

def main():
    src=sys.argv[1]; dst=sys.argv[2]
    raw=open(src,"rb").read()
    try:
        j=json.loads(raw); content=base64.b64decode(j["content"]); title=j.get("title","")
    except Exception:
        content=raw; title=""
    h=content.decode("utf-8","replace")
    p=P(); p.feed(h)
    open(dst,"w",encoding="utf-8").write(p.text())
    print(f"title={title!r} html_bytes={len(h)} text_bytes={len(p.text())}")
main()
