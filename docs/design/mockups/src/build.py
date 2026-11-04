# Cryptex Phase-1 mockups. Uses ENTERPRISE-UI tokens.css + light.css + dark.css verbatim (copied from ENTERPRISE-UI/src).
import subprocess, os, sys
OUT = os.path.dirname(os.path.abspath(__file__))
CSS = r"""
/* Cryptex amber accent override (Ian-approved). Links/info stay EUI defaults. */
:root[data-eui-theme='dark']{--eui-color-primary:#F59E0B;--eui-color-primary-hover:#FBB43A;--eui-color-primary-active:#D97706;--eui-color-on-primary:#1C1917;--eui-color-primary-subtle:rgba(245,158,11,.16);--eui-color-selected-text:#FBBF24;--eui-color-surface-selected:rgba(245,158,11,.12);--eui-color-focus:#F59E0B;--eui-color-warning:#FF6A33;--eui-color-warning-text:#FF8A5C;--eui-color-warning-subtle:#3A1D12;--eui-color-warning-border:#FF6A33;--eui-color-on-warning:#1F0A00}
:root[data-eui-theme='light']{--eui-color-primary:#F59E0B;--eui-color-primary-hover:#D97706;--eui-color-primary-active:#B45309;--eui-color-on-primary:#1C1917;--eui-color-primary-subtle:#FEF3C7;--eui-color-selected-text:#B45309;--eui-color-surface-selected:#FFFBEB;--eui-color-focus:#B45309;--eui-color-warning:#E04F16;--eui-color-warning-text:#B93C0B;--eui-color-warning-subtle:#FFF1EB;--eui-color-warning-border:#E04F16;--eui-color-on-warning:#000000}
.tok{color:var(--eui-color-selected-text)!important}

*{box-sizing:border-box;margin:0;padding:0}
body{width:1440px;height:900px;overflow:hidden;background:var(--eui-color-background);color:var(--eui-color-text);font:13px/18px 'Geist',sans-serif;-webkit-font-smoothing:antialiased}
.mono{font-family:'Geist Mono',monospace;font-size:12px}.sec{color:var(--eui-color-text-secondary)}.xs{font-size:11px;line-height:14px}
.row{display:flex;align-items:center}.sp{flex:1}.g4{gap:4px}.g8{gap:8px}.g12{gap:12px}
/* ApplicationHeader */
header{height:48px;background:var(--eui-color-shell);border-bottom:1px solid var(--eui-color-shell-border);display:flex;align-items:center;padding:0 12px;gap:12px}
.logo{width:28px;height:28px;border:1.5px dashed var(--eui-color-border-strong);border-radius:4px;font-size:8px;line-height:9px;text-align:center;display:flex;align-items:center;justify-content:center;color:var(--eui-color-text-secondary)}
.brand{font-weight:700;font-size:15px;letter-spacing:.3px}
.pill{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:12px;border:1px solid var(--eui-color-border);font-size:12px}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block;flex:none}
.ok{background:var(--eui-color-success)}.warn{background:var(--eui-color-warning)}.err{background:var(--eui-color-error)}.inf{background:var(--eui-color-info)}.neu{background:var(--eui-color-neutral)}
.seg{display:inline-flex;border:1px solid var(--eui-color-border);border-radius:4px;overflow:hidden}.seg span{padding:2px 8px;font-size:12px;border-right:1px solid var(--eui-color-border)}.seg span:last-child{border:0}.seg .on{background:var(--eui-color-primary);color:var(--eui-color-on-primary)}
.search{white-space:nowrap;width:300px;height:30px;border:1px solid var(--eui-color-border);border-radius:4px;background:var(--eui-color-surface-sunken);display:flex;align-items:center;padding:0 10px;color:var(--eui-color-text-placeholder);gap:8px}
.kbd{margin-left:auto;font-size:10px;border:1px solid var(--eui-color-border);border-radius:3px;padding:0 4px}
.ib{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:4px;color:var(--eui-color-icon);position:relative;font-size:15px}
.bc{position:absolute;top:2px;right:0;background:var(--eui-color-error);color:#fff;font-size:9px;line-height:14px;min-width:14px;border-radius:7px;text-align:center;padding:0 3px}
.av{width:28px;height:28px;border-radius:50%;background:var(--eui-color-primary-subtle);color:var(--eui-color-primary);font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center}
.btn{white-space:nowrap;height:28px;padding:0 10px;border-radius:4px;border:1px solid var(--eui-color-border);background:transparent;color:var(--eui-color-text);font:600 12px 'Geist';display:inline-flex;align-items:center;gap:6px}
.btn.p{background:var(--eui-color-primary);border-color:var(--eui-color-primary);color:var(--eui-color-on-primary)}
/* AppShell */
.shell{display:flex;height:852px}
nav{width:232px;background:var(--eui-color-shell);border-right:1px solid var(--eui-color-shell-border);padding:8px 0;overflow:hidden;flex:none}
.grp{display:flex;align-items:center;height:28px;padding:0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--eui-color-text-secondary)}
.grp .cv{margin-left:auto}
.ni{height:26px;display:flex;align-items:center;padding:0 14px 0 30px;font-size:13px;position:relative}
.ni.act{background:var(--eui-color-surface-selected);color:var(--eui-color-selected-text);font-weight:600}
.ni.act:before{content:'';position:absolute;left:0;top:3px;bottom:3px;width:3px;background:var(--eui-color-primary);border-radius:0 2px 2px 0}
.nfoot{position:absolute;bottom:10px;left:14px;font-size:11px}
main{flex:1;padding:14px 16px;overflow:hidden;display:flex;flex-direction:column;gap:12px;min-width:0}
aside{width:300px;background:var(--eui-color-surface);border-left:1px solid var(--eui-color-border-subtle);flex:none;display:flex;flex-direction:column}
.card{background:var(--eui-color-surface);border:1px solid var(--eui-color-border-subtle);border-radius:6px;min-width:0}
.ch{white-space:nowrap;height:38px;display:flex;align-items:center;gap:8px;padding:0 12px;border-bottom:1px solid var(--eui-color-border-subtle);font-weight:600}
h1{font-size:18px;line-height:24px;font-weight:700}
.bcr{font-size:12px;color:var(--eui-color-text-secondary)}
/* MetricCard */
.mg{display:grid;grid-template-columns:repeat(8,1fr);gap:8px}
.mc{padding:8px 10px;border-radius:6px;background:var(--eui-color-surface);border:1px solid var(--eui-color-border-subtle);min-width:0}
.mc .l{font-size:11px;color:var(--eui-color-text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mc .v{font-size:17px;font-weight:700;line-height:22px;font-variant-numeric:tabular-nums}
.mc .d{font-size:11px}.up{color:var(--eui-color-success-text)}.dn{color:var(--eui-color-error-text)}
.bar{height:4px;background:var(--eui-color-surface-sunken);border-radius:2px;margin-top:4px}.bar i{display:block;height:100%;border-radius:2px}
/* DataGrid */
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th{height:28px;text-align:left;font-size:11px;font-weight:600;color:var(--eui-color-text-secondary);padding:0 10px;background:var(--eui-color-surface-alt);border-bottom:1px solid var(--eui-color-border-subtle);white-space:nowrap}
td{height:28px;padding:0 10px;border-bottom:1px solid var(--eui-color-border-subtle);white-space:nowrap}
tr.sel td{background:var(--eui-color-surface-selected)} tr.new td{background:var(--eui-color-info-subtle)}
.r{text-align:right}
.bdg{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 7px;border-radius:10px;font-size:11px;font-weight:600;border:1px solid}
.b-ok{color:var(--eui-color-success-text);background:var(--eui-color-success-subtle);border-color:var(--eui-color-success-border)}
.b-w{color:var(--eui-color-warning-text);background:var(--eui-color-warning-subtle);border-color:var(--eui-color-warning-border)}
.b-e{color:var(--eui-color-error-text);background:var(--eui-color-error-subtle);border-color:var(--eui-color-error-border)}
.b-i{color:var(--eui-color-info-text);background:var(--eui-color-info-subtle);border-color:var(--eui-color-info-border)}
.b-n{color:var(--eui-color-neutral-text);background:var(--eui-color-neutral-subtle);border-color:var(--eui-color-neutral-border)}
.tok{white-space:nowrap;display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:11px;background:var(--eui-color-primary-subtle);color:var(--eui-color-primary);font-size:11px;font-weight:600}
.flt{height:26px;padding:0 8px;border:1px solid var(--eui-color-border);border-radius:4px;display:inline-flex;align-items:center;gap:6px;font-size:12px;background:var(--eui-color-surface-sunken)}
.sk{background:var(--eui-color-surface-hover);border-radius:4px}
.feed{padding:8px 12px;border-bottom:1px solid var(--eui-color-border-subtle);display:flex;gap:8px}
.dl{display:grid;grid-template-columns:110px 1fr;gap:6px 8px;padding:12px;font-size:12px}.dl dt{color:var(--eui-color-text-secondary)}
.tl{padding:4px 12px 0 12px}.tl div{display:flex;gap:8px;align-items:center;height:24px;font-size:12px}
"""
def header(th):
    return f"""<header><img src="logo-{th}.svg" alt="Cryptex" style="height:28px">
<span class="pill" style="white-space:nowrap"><span class="dot ok"></span>Exchange: Operational</span>
<span class="pill" style="white-space:nowrap"><span class="dot inf"></span>Simulation: Running · Day 14, 09:32:08</span>
<span class="row g8 xs sec">Speed <span class="seg"><span>⏸</span><span>1×</span><span class="on">5×</span><span>20×</span><span>100×</span></span></span>
<span class="sp"></span><div class="search">⌕ <span>Search tx, customer, wallet…</span><span class="kbd">Ctrl K</span></div>
<span class="sp"></span><div class="ib">⚡<span class="bc">3</span></div><div class="ib">🔔<span class="bc">7</span></div><div class="ib">◐</div><div class="av">IT</div></header>"""
NAV={"Overview":["Exchange Dashboard","Live Activity","System Health"],"Exchange":["Customers","Trading","Order Books","Markets","Liquidity","Internal Ledger"],
"Wallets":["Wallet Overview","Deposit Wallets","Hot Wallets","Cold Storage","Wallet Transfers","Withdrawal Queue"],"Blockchain":["Blockchain Explorer","Network Monitor","Transaction Queue","Block Explorer","Gas Tracker"],
"Development":["Solidity IDE","Smart Contracts","Contract Deployments","Contract Explorer"],"Operations":["Transaction Monitoring","Security Center","Risk Management","Incident Management","Audit Logs"],
"Analytics":["Exchange Performance","Trading Analytics","Wallet Analytics","Revenue and Fees","Customer Analytics"],"Simulation":["Simulation Controls","Customer Behavior","Market Conditions","Scenario Builder","Historical Replay"]}
def nav(active, expanded):
    h='<nav style="position:relative">'
    for g,items in NAV.items():
        op = g in expanded
        h+=f'<div class="grp">{g}<span class="cv">{"▾" if op else "▸"}</span></div>'
        if op:
            for i in items: h+=f'<div class="ni{" act" if i==active else ""}">{i}</div>'
    return h+'<div class="nfoot sec">« Collapse · v0.1 mock</div></nav>'
FEED=[("09:32:08","Deposit","BTC","0.0250","b-w","Confirming 2/3"),("09:32:06","Conversion","ETH/BTC","0.75 ETH","b-ok","Completed"),
("09:32:04","Withdrawal","USDT","850.00","b-i","Processing"),("09:32:03","Trade","BTC","0.0150","b-ok","Filled"),("09:32:01","Deposit","ETH","2.5000","b-ok","Confirmed"),
("09:31:59","Wallet Transfer","ETH","15.0000","b-i","Processing"),("09:31:57","Withdrawal","BTC","0.4100","b-e","Failed"),("09:31:55","Trade","SOL","42.0000","b-ok","Filled"),
("09:31:52","Deposit","USDC","12,400.00","b-ok","Confirmed"),("09:31:50","Trade","ETH","1.2000","b-ok","Filled"),("09:31:47","Withdrawal","ETH","3.0000","b-n","Queued")]
CUST=["C-10482","C-20931","C-11877","C-30012","C-10482","—","C-41290","C-22018","C-50311","C-19004","C-33107"]
def activity():
    ev=[("err","Withdrawal failed — insufficient BTC hot wallet balance","09:31:57"),("warn","ETH hot wallet utilization 82% (threshold 80%)","09:30:12"),
        ("inf","Block #1,204,887 mined · 214 tx · gas 18 gwei","09:29:40"),("ok","Sweep DW-ETH-07 → HW-ETH-01 confirmed","09:28:03"),("warn","Withdrawal queue > 40 items","09:25:44"),
        ("inf","Scenario 'Weekend volume' active","09:20:00"),("ok","Cold → Hot replenishment 120 ETH confirmed","09:12:31")]
    h='<aside><div class="ch">Activity <span class="sp"></span><span class="seg"><span class="on">Alerts</span><span>Events</span><span>Feed</span></span><span class="sec">✕</span></div>'
    for c,t,tm in ev: h+=f'<div class="feed"><span class="dot {c}" style="margin-top:5px"></span><div><div>{t}</div><div class="xs sec mono">{tm}</div></div></div>'
    return h+'<div class="feed sec xs" style="border:0">View all in Incident Management →</div></aside>'
def metrics():
    M=[("Total customers","48,213","+312 today","up"),("Active customers (24h)","6,904","+4.1%","up"),("Total exchange assets","$412.8M","+1.2%","up"),("Customer liabilities","$398.1M","+1.1%","up"),
       ("Exchange reserves","$14.7M","3.7% of liab.","sec"),("Total trading volume","$9.84B","all-time","sec"),("24h trading volume","$61.2M","−3.4%","dn"),("Trading fees collected","$1.92M","+$58.1K 24h","up"),
       ("Total deposits","$2.11B","+$7.4M 24h","up"),("Total withdrawals","$1.71B","+$6.9M 24h","up"),("Pending transactions","137","42 withdrawals","sec"),("Failed transactions","9","24h · 0.2%","dn"),
       ("Hot wallet utilization","82%",None,"warn"),("Cold wallet reserves","$371.5M","90% of assets","sec"),("Withdrawal liquidity","$23.6M","≈ 3.4 days","sec"),("Network health","Healthy","ETH 18 gwei · BTC 12 s/vB","ok")]
    h='<div class="mg">'
    for l,v,d,c in M:
        if d is None: d2='<div class="bar"><i style="width:82%;background:var(--eui-color-warning)"></i></div>'
        elif c=="ok": d2=f'<div class="d sec">{d}</div>'; v=f'<span class="row g4"><span class="dot ok"></span>{v}</span>'
        else: d2=f'<div class="d {c}">{d}</div>'
        h+=f'<div class="mc"><div class="l">{l}</div><div class="v">{v}</div>{d2}</div>'
    return h+'</div>'
def feedtable(sel=None,filtered=False):
    rows=FEED if not filtered else [r for r in FEED if r[1] in("Withdrawal",)]
    h='<div class="card" style="flex:1;display:flex;flex-direction:column;overflow:hidden"><div class="ch">Live Transaction Feed <span class="bdg b-ok"><span class="dot ok"></span>Live</span><span class="sp"></span>'
    if filtered: h+='<span class="tok">Type: Withdrawal ✕</span><span class="tok">Status: any</span>'
    h+='<span class="flt">Type ▾</span><span class="flt">Asset ▾</span><span class="flt">Status ▾</span><span class="btn">⏸ Pause</span></div><table><tr><th>Time</th><th>Event</th><th>Asset</th><th class="r">Amount</th><th class="r">USD</th><th>Customer</th><th>Status</th></tr>'
    usd=["$1,712","$2,980","$850","$1,027","$9,935","$59,610","$28,077","$7,224","$12,400","$4,769","$11,922"]
    for i,(t,e,a,am,b,s) in enumerate(rows):
        j=FEED.index((t,e,a,am,b,s))
        cls=' class="sel"' if sel==j else (' class="new"' if j==0 and not filtered else "")
        h+=f'<tr{cls}><td class="mono sec">{t}</td><td>{e}</td><td>{a}</td><td class="r mono">{am}</td><td class="r mono sec">{usd[j]}</td><td class="mono" style="color:var(--eui-color-link)">{CUST[j]}</td><td><span class="bdg {b}">{s}</span></td></tr>'
    h+='</table><div class="sp"></div><div class="ch xs sec" style="border-top:1px solid var(--eui-color-border-subtle);border-bottom:0;height:30px;font-weight:400">'+('3 of 11 matching · filters apply to new rows' if filtered else 'Showing latest 11 · 1,284 tx in last hour · newest row highlighted 2 s')+'</div></div>'
    return h
def node(x,y,w,title,bal,sub,util=None,sel=False,warn=False):
    bc="var(--eui-color-primary)" if sel else ("var(--eui-color-warning)" if warn else "var(--eui-color-border)")
    u=f'<div class="bar"><i style="width:{util}%;background:var({"--eui-color-warning" if util>80 else "--eui-color-success"})"></i></div>' if util else ""
    return f'<div style="position:absolute;left:{x}px;top:{y}px;width:{w}px;padding:6px 8px;border:1.5px solid {bc};border-radius:6px;background:var(--eui-color-surface-alt)"><div class="xs sec">{title}</div><div style="font-weight:700">{bal}</div><div class="xs sec">{sub}</div>{u}</div>'
def sysmap():
    h='<div class="card" style="flex:1;display:flex;flex-direction:column"><div class="ch">Exchange System Map<span class="sp"></span><span class="seg"><span class="on">All</span><span>BTC</span><span>ETH</span><span>USDT</span></span><span class="sec">⤢</span></div><div style="position:relative;flex:1">'
    h+='''<svg width="100%" height="100%" style="position:absolute;inset:0"><defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="var(--eui-color-text-secondary)"/></marker></defs>
<g stroke-width="2" fill="none" marker-end="url(#a)"><path d="M124,52 H150" stroke="var(--eui-color-success)"/><path d="M276,52 H300" stroke="var(--eui-color-success)"/><path d="M426,52 H452" stroke="var(--eui-color-info)" stroke-dasharray="5 4"/>
<path d="M452,170 H426" stroke="var(--eui-color-info)"/><path d="M300,170 H276" stroke="var(--eui-color-warning)"/><path d="M150,170 H124" stroke="var(--eui-color-warning)"/><path d="M363,86 V136" stroke="var(--eui-color-border-strong)" stroke-dasharray="3 3"/></g>
<g fill="var(--eui-color-primary)"><circle cx="138" cy="52" r="3"/><circle cx="288" cy="52" r="3"/><circle cx="440" cy="52" r="3"/><circle cx="440" cy="170" r="3"/><circle cx="288" cy="170" r="3"/></g></svg>'''
    h+=node(8,22,116,"Customer Wallets","1,284 tx/h","in: $7.4M 24h")+node(150,22,126,"Deposit Wallets","$3.9M","312 addrs · 18 pending",)+node(300,22,126,"Hot Wallets","$23.6M","4 wallets",82,sel=True,warn=True)+node(452,22,130,"Cold Storage","$371.5M","6 vaults · 1 transfer",None)
    h+=node(300,136,126,"Withdrawal Processing","42 queued","$1.1M · avg 4m 10s")+node(150,136,126,"Mempool / Network","96 tx","ETH 18 gwei")+node(8,136,116,"Customer Wallets","out: $6.9M","24h withdrawals")
    h+='<div class="xs sec" style="position:absolute;left:8px;bottom:6px">Click a node for its operational view · dashed = pending transfer · dots = live tx</div></div></div>'
    return h
def page(th,body):
    theme=th
    return f'<!doctype html><html data-eui-theme="{theme}"><head><meta charset="utf-8"><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="light.css"><link rel="stylesheet" href="dark.css"><style>{CSS}</style></head><body>{header(th)}<div class="shell">{body}</div></body></html>'
def dash(detail=False):
    top='<div class="row g12"><div><div class="bcr">Overview / Exchange Dashboard</div><h1>Exchange Dashboard</h1></div><span class="sp"></span><span class="flt">All assets · USD ▾</span><span class="btn">☰ Activity panel</span></div>'
    m=f'<main>{top}{metrics()}<div class="row g12" style="flex:1;align-items:stretch;min-height:0">{feedtable(sel=2 if detail else None,filtered=detail)}{"" if detail else '<div style="width:600px;display:flex;flex-direction:column;flex:none">'+sysmap()+"</div>"}</div></main>'
    if detail:
        m+='''<aside><div class="ch">Transaction TX-88412 <span class="sp"></span><span class="sec">⤢ ✕</span></div><div style="padding:12px 12px 0"><span class="bdg b-i">Processing</span> <span class="xs sec">Withdrawal · USDT (ERC-20)</span><div style="font-size:20px;font-weight:700;margin-top:8px">850.00 USDT</div><div class="sec xs">≈ $850.00 · fee 2.50 USDT</div></div>
<dl class="dl"><dt>Customer</dt><dd style="color:var(--eui-color-link)">C-11877 · Dana Ortiz →</dd><dt>Source wallet</dt><dd style="color:var(--eui-color-link)">HW-ETH-01 (hot) →</dd><dt>Destination</dt><dd class="mono">0x7f3a…c91e</dd><dt>Tx hash</dt><dd class="mono">0x5be1…02af</dd><dt>Network fee</dt><dd>21 gwei · $1.84</dd><dt>Risk score</dt><dd><span class="bdg b-ok">Low · 12</span></dd></dl>
<div class="ch" style="border-top:1px solid var(--eui-color-border-subtle)">Lifecycle (follow through system)</div><div class="tl">
<div><span class="dot ok"></span>Request submitted<span class="sp"></span><span class="mono sec">09:31:40</span></div><div><span class="dot ok"></span>Account & balance check<span class="sp"></span><span class="mono sec">09:31:41</span></div>
<div><span class="dot ok"></span>Risk checks passed<span class="sp"></span><span class="mono sec">09:31:42</span></div><div><span class="dot ok"></span>Queued · hot liquidity OK<span class="sp"></span><span class="mono sec">09:31:55</span></div>
<div><span class="dot inf"></span><b>Broadcast to mempool</b><span class="sp"></span><span class="mono sec">09:32:04</span></div><div class="sec"><span class="dot neu"></span>Included in block</div><div class="sec"><span class="dot neu"></span>Confirmations 0/12</div><div class="sec"><span class="dot neu"></span>Ledger settlement</div></div>
<div class="sp"></div><div class="row g8" style="padding:12px;border-top:1px solid var(--eui-color-border-subtle)"><span class="btn">Open customer</span><span class="btn">View wallet</span><span class="sp"></span><span class="btn p">Full view</span></div></aside>'''
    return nav("Exchange Dashboard",["Overview","Exchange","Wallets"])+m
def shell():
    sk='<main><div><div class="bcr">Wallets / Hot Wallets</div><h1>Hot Wallets</h1></div><div class="sk" style="height:12px;width:420px"></div>'
    sk+='<div class="row g12">'+''.join('<div class="card" style="flex:1;height:84px;padding:12px"><div class="sk" style="height:10px;width:60%"></div><div class="sk" style="height:20px;width:40%;margin-top:12px"></div></div>' for _ in range(4))+'</div>'
    sk+='<div class="card" style="flex:1;padding:12px">'+''.join(f'<div class="sk" style="height:14px;margin:10px 0;width:{w}%"></div>' for w in [100,92,96,88,94,90,97,85,93,89,95,91])+'</div><div class="xs sec">Workspace region — page content loading (Skeleton state). Every page renders inside this region.</div></main>'
    return nav("Hot Wallets",["Overview","Wallets","Blockchain","Operations"])+sk+activity()
SCREENS={"01-app-shell-navigation":shell,"02-dashboard":dash,"03-dashboard-transaction-detail":lambda:dash(True)}
for name,f in SCREENS.items():
    for th in("dark","light"):
        p=f"{OUT}/{name}-{th}.html"; open(p,"w").write(page(th,f()))
        subprocess.run(["google-chrome","--headless=new","--no-sandbox","--hide-scrollbars","--force-device-scale-factor=1","--window-size=1440,900",f"--screenshot={OUT}/../{name}-{th}.png",p],capture_output=True)
        print(name,th)
