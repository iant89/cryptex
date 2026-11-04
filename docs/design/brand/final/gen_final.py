# Final assets for Option B (Vault Cylinder). Wordmark: Inter SemiBold, outlined via fontTools.
import cairosvg,os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from PIL import Image,ImageDraw,ImageFont
D=os.path.dirname(os.path.abspath(__file__));os.chdir(D)
A='#F59E0B';INK='#292524';BG_D='#1C1917';RING_D='#A8A29E';TXT_D='#FAFAF9'
F=TTFont('fonts/Inter-SemiBold.ttf');gs=F.getGlyphSet();cmap=F.getBestCmap();upm=F['head'].unitsPerEm
def word(x,y,size,track):
  s=size/upm;pen=SVGPathPen(gs);cx=0
  for ch in 'CRYPTEX':
    g=cmap[ord(ch)];gs[g].draw(TransformPen(pen,(s,0,0,-s,x+cx,y)));cx+=gs[g].width*s+track
  return pen.getCommands(),cx-track
def mark(f,a):
  s=f'<rect x="2" y="18" width="8" height="28" rx="2" fill="{f}"/><rect x="54" y="18" width="8" height="28" rx="2" fill="{f}"/>'
  for i in range(5):
    x=12+i*8.2;dy=0 if i==2 else (3 if i%2 else -3)
    s+=f'<rect x="{x:.1f}" y="{14+dy}" width="7" height="36" rx="1.5" fill="{a if i==2 else f}"/>'
  return s
def fav(f,a): # simplified: caps + 3 rings, on 16 grid
  # pixel-snapped: caps 2px, rings 2px, 1px gaps
  return f'<rect x="1" y="5" width="2" height="6" fill="{f}"/><rect x="13" y="5" width="2" height="6" fill="{f}"/><rect x="4" y="3" width="2" height="9" fill="{f}"/><rect x="7" y="1" width="2" height="14" fill="{a}"/><rect x="10" y="4" width="2" height="9" fill="{f}"/>'
def W(n,s):open(n,'w').write(s)
def P(n,w,h=None):cairosvg.svg2png(url=n+'.svg',write_to=n+'.png',output_width=w,output_height=h or None)
X='xmlns="http://www.w3.org/2000/svg"'
d,wd=word(80,44,34,4);VW=int(80+wd+4)
for m,f,t in [('light',INK,INK),('dark',RING_D,TXT_D)]:
  W(f'logo-{m}.svg',f'<svg {X} viewBox="0 0 {VW} 64">{mark(f,A)}<path d="{d}" fill="{t}"/></svg>');P(f'logo-{m}',VW*3)
  W(f'icon-{m}.svg',f'<svg {X} viewBox="0 0 64 64">{mark(f,A)}</svg>');P(f'icon-{m}',256)
W('app-icon.svg',f'<svg {X} viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="{BG_D}"/><g transform="translate(9.6 9.6) scale(.7)">{mark(RING_D,A)}</g></svg>')
for n in (512,192,180):cairosvg.svg2png(url='app-icon.svg',write_to=f'app-icon-{n}.png',output_width=n,output_height=n)
W('favicon.svg',f'<svg {X} viewBox="0 0 16 16"><style>.r{{fill:{INK}}}@media(prefers-color-scheme:dark){{.r{{fill:{RING_D}}}}}</style>'+fav('X',A).replace('fill="X"','class="r"')+'</svg>')
W('/tmp/fav.svg',f'<svg {X} viewBox="0 0 16 16">{fav(INK,A)}</svg>')
for n in (16,32,48):cairosvg.svg2png(url='/tmp/fav.svg',write_to=f'favicon-{n}.png',output_width=n,output_height=n)
W('/tmp/favd.svg',f'<svg {X} viewBox="0 0 16 16">{fav(RING_D,A)}</svg>')
for n in (16,32,48):cairosvg.svg2png(url='/tmp/favd.svg',write_to=f'/tmp/favd-{n}.png',output_width=n,output_height=n)
cairosvg.svg2png(url='/tmp/fav.svg',write_to='/tmp/fav256.png',output_width=256,output_height=256)
Image.open('/tmp/fav256.png').save('favicon.ico',sizes=[(16,16),(32,32),(48,48)])
# preview
fnt=ImageFont.truetype('fonts/Inter-SemiBold.ttf',22)
im=Image.new('RGB',(1600,900),'white');dr=ImageDraw.Draw(im);dr.rectangle([800,0,1600,900],fill=BG_D)
def put(p,x,y,lbl,col,sz=None):
  i=Image.open(p).convert('RGBA')
  if sz:i=i.resize(sz,Image.NEAREST if sz[0]<=96 else Image.LANCZOS)
  im.paste(i,(x,y),i);dr.text((x,y-32),lbl,fill=col,font=fnt)
for ox,m,lc in [(0,'light','#57534E'),(800,'dark','#D6D3D1')]:
  put(f'logo-{m}.png',ox+40,60,f'logo-{m}',lc,(720,int(720*64/VW)))
  put(f'icon-{m}.png',ox+40,320,f'icon-{m}',lc,(160,160))
  put('app-icon-180.png',ox+240,320,'app-icon 180',lc)
  fp='favicon-' if m=='light' else '/tmp/favd-'
  put(fp+'48.png',ox+460,320,'favicon 48 / 32 / 16',lc)
  put(fp+'32.png',ox+520,336,'',lc);put(fp+'16.png',ox+564,352,'',lc)
  put(fp+'16.png',ox+460,560,'favicon-16 @6x (pixel check)',lc,(96,96))
im.save('preview.png')
