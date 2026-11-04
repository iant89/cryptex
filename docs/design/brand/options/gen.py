import cairosvg,math
from PIL import Image,ImageDraw
O={
'a':('Cipher Ring','#2DD4BF','#0F172A','Two concentric cipher rings with tick marks; one notch aligned = vault unlocked.',"IBM Plex Sans / IBM Plex Mono",['#0F172A','#1E293B','#2DD4BF','#94A3B8','#F8FAFC']),
'b':('Vault Cylinder','#F59E0B','#1C1917','Side view of a cryptex: five rotating rings between end caps, the middle ring aligned.',"Inter / JetBrains Mono",['#1C1917','#292524','#F59E0B','#A8A29E','#FAFAF9']),
'c':('Hex Lock','#3B82F6','#111827','Hexagonal block (ledger) with a C-shaped cutout forming a keyway.',"Space Grotesk / IBM Plex Mono",['#111827','#1F2937','#3B82F6','#9CA3AF','#F9FAFB']),
'd':('Aligned Rings','#22C55E','#18181B','Stacked offset ring bars that snap into alignment; abstract X from the offsets.',"Manrope / Roboto Mono",['#18181B','#27272A','#22C55E','#A1A1AA','#FAFAFA']),
'e':('Keyhole Dial','#A78BFA','#0B0F19','Combination dial with a keyhole center and one highlighted index mark.',"Sora / Fira Code",['#0B0F19','#1A1F2E','#A78BFA','#8B93A7','#F5F7FA']),
}
def mark(k,a,f):
  if k=='a':
    t=''.join(f'<line x1="32" y1="4" x2="32" y2="{9 if i%3 else 11}" transform="rotate({i*15} 32 32)"/>' for i in range(24))
    return f'<g fill="none" stroke="{f}" stroke-width="2"><circle cx="32" cy="32" r="28"/><circle cx="32" cy="32" r="17"/>{t}</g><circle cx="32" cy="32" r="6" fill="{a}"/><rect x="30" y="2" width="4" height="22" rx="2" fill="{a}"/>'
  if k=='b':
    s=f'<rect x="2" y="18" width="8" height="28" rx="2" fill="{f}"/><rect x="54" y="18" width="8" height="28" rx="2" fill="{f}"/>'
    for i in range(5):
      x=12+i*8.2; c=a if i==2 else f; dy=0 if i==2 else (3 if i%2 else -3)
      s+=f'<rect x="{x:.1f}" y="{14+dy}" width="7" height="36" rx="1.5" fill="{c}"/>'
    return s
  if k=='c':
    p=' '.join(f'{32+28*math.cos(math.radians(60*i-90)):.1f},{32+28*math.sin(math.radians(60*i-90)):.1f}' for i in range(6))
    return f'<polygon points="{p}" fill="{f}"/><path d="M44 24 A14 14 0 1 0 44 40" fill="none" stroke="{a}" stroke-width="6" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="{a}"/>'
  if k=='d':
    off=[-12,-6,0,6,12]
    s=''.join(f'<rect x="{12+o}" y="{6+i*11}" width="40" height="8" rx="4" fill="{a if o==0 else f}"/>' for i,o in enumerate(off))
    return s
  if k=='e':
    t=''.join(f'<line x1="32" y1="5" x2="32" y2="10" transform="rotate({i*30} 32 32)"/>' for i in range(12))
    return f'<circle cx="32" cy="32" r="29" fill="none" stroke="{f}" stroke-width="3"/><g stroke="{f}" stroke-width="2">{t}</g><circle cx="32" cy="27" r="6" fill="{a}"/><path d="M29 30 L27 43 H37 L35 30Z" fill="{a}"/><circle cx="32" cy="5" r="3" fill="{a}"/>'
def svg(k,a,f,txt,lock):
  if not lock: return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256">{mark(k,a,f)}</svg>'
  return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 64" width="900" height="192">{mark(k,a,f)}<text x="80" y="44" font-family="DejaVu Sans, Inter, sans-serif" font-weight="bold" font-size="32" letter-spacing="5" fill="{txt}">CRYPTEX</text></svg>'
md='# Cryptex brand options\n\nPer SPEC §18: dark graphite, enterprise, restrained accent. Wordmark set in system bold sans as placeholder; suggested fonts below.\n\n'
tiles=[]
for k,(n,a,bg,c,fn,pal) in O.items():
  import os;os.makedirs(f'option-{k}',exist_ok=True)
  open(f'option-{k}/logo.svg','w').write(svg(k,a,'currentColor'.replace('currentColor',pal[3]),pal[4],1).replace(pal[4],'#0F172A') if False else svg(k,a,pal[1],pal[1],1))
  open(f'option-{k}/icon.svg','w').write(svg(k,a,pal[1],0,0))
  for mode,b,f,t in [('light','#FFFFFF',pal[1],pal[1]),('dark',bg,pal[3],pal[4])]:
    for nm,lock in [('logo',1),('icon',0)]:
      s=svg(k,a,f,t,lock).replace('<svg ',f'<svg style="background:{b}" ',1)
      s=s.replace('>',f'><rect width="100%" height="100%" fill="{b}"/>',1)
      cairosvg.svg2png(bytestring=s.encode(),write_to=f'option-{k}/{nm}-{mode}.png')
  md+=f'## Option {k.upper()} — {n}\n{c}\n\n- Palette: {", ".join(pal)} (accent {a})\n- Fonts: {fn}\n\n'
  tiles.append((k,n))
open('OPTIONS.md','w').write(md)
W=1000;H=230;img=Image.new('RGB',(W*2,H*5),'white');d=ImageDraw.Draw(img)
for i,(k,n) in enumerate(tiles):
  for j,m in enumerate(['light','dark']):
    im=Image.open(f'option-{k}/logo-{m}.png').convert('RGB');img.paste(im,(j*W+50,i*H+30))
  d.text((10,i*H+5),f'{k.upper()} {n}',fill='red')
img.save('comparison-sheet.png')
