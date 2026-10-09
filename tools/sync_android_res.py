#!/usr/bin/env python3
"""Write the generated mark into android/ res at every density.

Avoids `expo prebuild --clean`, which would regenerate the whole android/
project and discard the uncommitted MainActivity.kt / manifest edits in the
working tree. Only the icon and splash drawables are touched.
"""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES  = os.path.join(ROOT, "android/app/src/main/res")
A    = os.path.join(ROOT, "assets")

ADAPTIVE = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}
LEGACY   = {"mdpi": 48,  "hdpi": 72,  "xhdpi": 96,  "xxhdpi": 144, "xxxhdpi": 192}
SPLASH   = {"mdpi": 288, "hdpi": 432, "xhdpi": 576, "xxhdpi": 864, "xxxhdpi": 1152}

fg = Image.open(f"{A}/android-icon-foreground.png").convert("RGBA")
bg = Image.open(f"{A}/android-icon-background.png").convert("RGBA")
mo = Image.open(f"{A}/android-icon-monochrome.png").convert("RGBA")
sp = Image.open(f"{A}/splash-transparent.png").convert("RGBA")

flat = Image.alpha_composite(bg, fg)

def rounded(im, n, radius_frac):
    im = im.resize((n, n), Image.LANCZOS)
    m = Image.new("L", (n, n), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, n-1, n-1],
                                        radius=int(n*radius_frac), fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0)); out.paste(im, (0, 0), m)
    return out

def circle(im, n):
    im = im.resize((n, n), Image.LANCZOS)
    m = Image.new("L", (n, n), 0)
    ImageDraw.Draw(m).ellipse([0, 0, n-1, n-1], fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0)); out.paste(im, (0, 0), m)
    return out

written = []
for d, n in ADAPTIVE.items():
    p = f"{RES}/mipmap-{d}"
    for im, name in ((fg, "ic_launcher_foreground"), (bg, "ic_launcher_background"),
                     (mo, "ic_launcher_monochrome")):
        f = f"{p}/{name}.webp"
        im.resize((n, n), Image.LANCZOS).save(f, "WEBP", quality=95, lossless=True)
        written.append((f, f"{n}x{n}"))

for d, n in LEGACY.items():
    p = f"{RES}/mipmap-{d}"
    rounded(flat, n, 0.22).save(f"{p}/ic_launcher.webp", "WEBP", quality=95, lossless=True)
    circle(flat, n).save(f"{p}/ic_launcher_round.webp", "WEBP", quality=95, lossless=True)
    written += [(f"{p}/ic_launcher.webp", f"{n}x{n}"),
                (f"{p}/ic_launcher_round.webp", f"{n}x{n}")]

_a = sp.getchannel("A")
_solid = [(x, y) for y in range(0, sp.height, 4) for x in range(0, sp.width, 4)
          if _a.getpixel((x, y)) > 200]
_x0, _x1 = min(p[0] for p in _solid), max(p[0] for p in _solid)
_y0, _y1 = min(p[1] for p in _solid), max(p[1] for p in _solid)
_diag = ((_x1 - _x0) ** 2 + (_y1 - _y0) ** 2) ** 0.5 / 2
print(f"  splash mark bbox {_x1-_x0}x{_y1-_y0}, half-diagonal {_diag:.0f}px")

for d, n in SPLASH.items():
    s = (0.33 * n) / _diag * 0.97
    m = sp.resize((int(sp.width*s), int(sp.height*s)), Image.LANCZOS)
    canvas = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    canvas.alpha_composite(m, ((n - m.width)//2, (n - m.height)//2))
    f = f"{RES}/drawable-{d}/splashscreen_logo.png"
    canvas.save(f); written.append((f, f"{n}x{n}"))

for f, sz in written:
    print(f"  {os.path.relpath(f, ROOT):<62} {sz}")
print(f"\n{len(written)} files written")
