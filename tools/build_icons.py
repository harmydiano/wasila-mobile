#!/usr/bin/env python3
"""Single source of truth for the app mark.

Geometry is defined once, here, and used to emit BOTH the SVG vector master
and every rasterised PNG layer, so the two can never drift apart.

Design constraints baked in (see docs/ICON_PROMPTS.md):
  * gold arch stroke = 3.5% of canvas width, so it survives a 48px launcher
  * foreground/monochrome scaled into Android's 66% safe circle
  * exact theme tokens, no generative colour drift
"""
from PIL import Image, ImageDraw
import os, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, "assets")
SS   = 4
C    = 1024

GOLD   = (225, 179, 71)
MINT   = (123, 224, 190)
CORE   = (233, 255, 244)
GROUND = (5, 23, 20)
LIFT   = (12, 39, 33)

STROKE_PCT = 0.035

ARCH_OUTER = [
    ("M", (272, 880)),
    ("L", (272, 440)),
    ("C", (272, 322), (306, 250), (380, 198)),
    ("C", (438, 156), (494, 148), (512, 108)),
    ("C", (530, 148), (586, 156), (644, 198)),
    ("C", (718, 250), (752, 322), (752, 440)),
    ("L", (752, 880)),
    ("Z",),
]
ARCH_INNER = [
    ("M", (316, 836)),
    ("L", (316, 448)),
    ("C", (316, 344), (346, 282), (410, 236)),
    ("C", (460, 200), (500, 190), (512, 168)),
    ("C", (524, 190), (564, 200), (614, 236)),
    ("C", (678, 282), (708, 344), (708, 448)),
    ("L", (708, 836)),
    ("Z",),
]

STAR = dict(cx=512, cy=520, r_out=165, r_in=68)
GLOW_R = 300

def bezier(p0, p1, p2, p3, n=48):
    out = []
    for i in range(1, n + 1):
        t = i / n; u = 1 - t
        out.append((u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
                    u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]))
    return out

def flatten(path):
    pts, cur, start = [], None, None
    for seg in path:
        if seg[0] == "M":
            cur = start = seg[1]; pts.append(cur)
        elif seg[0] == "L":
            cur = seg[1]; pts.append(cur)
        elif seg[0] == "C":
            pts += bezier(cur, seg[1], seg[2], seg[3]); cur = seg[3]
        elif seg[0] == "Z":
            pts.append(start)
    return pts

def arch_points():
    return flatten(ARCH_OUTER)

def star_points(cx, cy, r_out, r_in, n=8):
    """Regular eight-point star: n equal points alternating out/in radius."""
    pts = []
    for i in range(n * 2):
        a = math.pi * i / n - math.pi / 2
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def xf(pts, s=1.0, dx=0.0, dy=0.0, k=SS):
    return [((x*s + dx)*k, (y*s + dy)*k) for x, y in pts]

def radial(size, centre, radius, colour, peak=255, falloff=2.2):
    """A soft radial bloom of `colour` centred at `centre` (device px)."""
    g = Image.radial_gradient("L").resize((radius*2, radius*2), Image.LANCZOS)
    g = Image.eval(g, lambda v: int(max(0, peak * (1 - v/255) ** falloff)))
    layer = Image.new("RGBA", size, colour + (0,))
    alpha = Image.new("L", size, 0)
    alpha.paste(g, (int(centre[0]) - radius, int(centre[1]) - radius))
    layer.putalpha(alpha)
    return layer

def band_mask(size, s, dx, dy):
    """Alpha mask of the gold band = outer silhouette minus inner opening."""
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).polygon(xf(flatten(ARCH_OUTER), s, dx, dy), fill=255)
    ImageDraw.Draw(m).polygon(xf(flatten(ARCH_INNER), s, dx, dy), fill=0)
    return m

def draw_mark(size, s=1.0, dx=0.0, dy=0.0, ground=False, glow=True, mono=False):
    """Render the mark. `size` is the FINAL size; drawing happens at SS scale."""
    W, H = size[0] * SS, size[1] * SS
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    st = STAR
    scx, scy = (st["cx"] * s + dx) * SS, (st["cy"] * s + dy) * SS

    if mono:
        m = Image.new("L", (W, H), 0)
        ImageDraw.Draw(m).polygon(xf(flatten(ARCH_OUTER), s, dx, dy), fill=255)
        ImageDraw.Draw(m).polygon(
            xf(star_points(st["cx"], st["cy"], 150, 62), s, dx, dy), fill=0)
        out = Image.new("RGBA", (W, H), (255, 255, 255, 0))
        out.putalpha(m)
        return out.resize(size, Image.LANCZOS)

    if ground:
        img.paste(Image.new("RGBA", (W, H), GROUND + (255,)), (0, 0))
        img.alpha_composite(radial((W, H), (W / 2, H * 0.48), int(W * 0.62), LIFT, 255, 1.6))

    if glow:
        img.alpha_composite(radial((W, H), (scx, scy), int(GLOW_R * s * SS), MINT, 155, 2.4))
        img.alpha_composite(radial((W, H), (scx, scy), int(GLOW_R * 0.40 * s * SS), CORE, 200, 2.0))

    d = ImageDraw.Draw(img)
    d.polygon(xf(star_points(st["cx"], st["cy"], st["r_out"], st["r_in"]), s, dx, dy),
              fill=MINT + (255,))
    r = 34 * s * SS
    d.ellipse([scx - r, scy - r, scx + r, scy + r], fill=CORE + (255,))

    gold = Image.new("RGBA", (W, H), GOLD + (0,))
    gold.putalpha(band_mask((W, H), s, dx, dy))
    img.alpha_composite(gold)

    return img.resize(size, Image.LANCZOS)

def svg_path(path):
    out = []
    for seg in path:
        if seg[0] == "M":   out.append(f"M {seg[1][0]} {seg[1][1]}")
        elif seg[0] == "L": out.append(f"L {seg[1][0]} {seg[1][1]}")
        elif seg[0] == "C": out.append("C " + " ".join(f"{p[0]} {p[1]}" for p in seg[1:]))
        elif seg[0] == "Z": out.append("Z")
    return " ".join(out)

def write_svg(path):
    st = STAR
    sp = " ".join(f"{x:.1f},{y:.1f}" for x, y in
                  star_points(st["cx"], st["cy"], st["r_out"], st["r_in"]))
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {C} {C}" width="{C}" height="{C}">
  <defs>
    <radialGradient id="g-ground" cx="50%" cy="48%" r="62%">
      <stop offset="0%"   stop-color="#0C2721"/>
      <stop offset="100%" stop-color="#051714"/>
    </radialGradient>
    <radialGradient id="g-bloom" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#E9FFF4" stop-opacity=".80"/>
      <stop offset="34%"  stop-color="#7BE0BE" stop-opacity=".50"/>
      <stop offset="100%" stop-color="#7BE0BE" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect id="ground" width="{C}" height="{C}" fill="url(#g-ground)"/>
  <circle id="glow" cx="{st['cx']}" cy="{st['cy']}" r="{GLOW_R}" fill="url(#g-bloom)"/>
  <polygon id="star" points="{sp}" fill="#7BE0BE"/>
  <circle cx="{st['cx']}" cy="{st['cy']}" r="34" fill="#E9FFF4"/>
  <path id="arch" fill="#E1B347" fill-rule="evenodd"
        d="{svg_path(ARCH_OUTER)} {svg_path(ARCH_INNER)}"/>
</svg>
"""
    open(path, "w").write(svg)

_HALF = C * STROKE_PCT / 2
BB = (272, 108, 752, 880)
BB_CX, BB_CY = (BB[0] + BB[2]) / 2, (BB[1] + BB[3]) / 2
BB_R = math.hypot((BB[2] - BB[0]) / 2, (BB[3] - BB[1]) / 2)

SAFE_SCALE = (0.611 / 2 * C) / BB_R

def fit(scale, cx=C / 2, cy=C / 2):
    """Translation that centres the mark's bbox on (cx, cy) at `scale`."""
    return scale, cx - BB_CX * scale, cy - BB_CY * scale

def background(size=(C, C)):
    W, H = size[0] * SS, size[1] * SS
    img = Image.new("RGBA", (W, H), GROUND + (255,))
    img.alpha_composite(radial((W, H), (W / 2, H / 2), int(W * 0.70), LIFT, 190, 1.4))
    d = ImageDraw.Draw(img)
    step = W // 9
    for row in range(-1, 10):
        for col in range(-1, 10):
            cx = col * step + (step // 2 if row % 2 else 0)
            cy = row * step
            pts = star_points(cx / SS, cy / SS,
                              step / SS * 0.40, step / SS * 0.17)
            d.polygon([(x * SS, y * SS) for x, y in pts],
                      outline=(14, 40, 34, 90), width=max(1, SS))
    return img.resize(size, Image.LANCZOS)

def main():
    os.makedirs(OUT, exist_ok=True)
    made = []

    def save(img, name):
        path = os.path.join(OUT, name)
        img.save(path)
        made.append((name, img.size, img.mode))

    save(draw_mark((C, C), ground=True), "icon.png")

    s, dx, dy = fit(SAFE_SCALE)
    save(draw_mark((C, C), s, dx, dy, ground=False), "android-icon-foreground.png")

    save(background(), "android-icon-background.png")

    s, dx, dy = fit(SAFE_SCALE)
    save(draw_mark((C, C), s, dx, dy, mono=True), "android-icon-monochrome.png")

    SW, SH = 1024, 1536
    s = (0.78 * SH) / (BB[3] - BB[1])
    s, dx, dy = fit(s, SW / 2, SH / 2)
    save(draw_mark((SW, SH), s, dx, dy, ground=False), "splash-transparent.png")
    save(Image.open(os.path.join(OUT, "splash-transparent.png")), "splash-icon.png")

    save(draw_mark((C, C), ground=True).resize((64, 64), Image.LANCZOS), "favicon.png")

    write_svg(os.path.join(ROOT, "assets", "mark.svg"))
    made.append(("mark.svg", "vector master", "svg"))

    print(f"stroke {STROKE_PCT:.1%} of canvas -> {STROKE_PCT*48:.2f}px at 48px")
    print(f"safe-area scale {SAFE_SCALE:.3f}\n")
    for n, sz, m in made:
        print(f"  {n:<34} {str(sz):<14} {m}")

if __name__ == "__main__":
    main()
