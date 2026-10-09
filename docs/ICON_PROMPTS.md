# App icon & splash — generation prompts

Palette taken from the shipped theme tokens: root `#051714` / `#0A1512`,
accent mint `#7BE0BE`, gold `#E1B347`, ink `#F3F7F5`, deep accent `#358D6F`.

---

## Process, before you generate anything

**Generate one master, then derive every other asset from it in vector.** An
image model cannot reproduce the same silhouette twice, so prompting separately
for the icon, the adaptive foreground, the monochrome layer and the splash
returns four different marks that happen to share a motif. Use these prompts to
find a direction you like, then trace that single winning image into an SVG and
emit the rest of the layers from it. Everything below is for producing that one
master — not for producing a set.

---

## The concept

The app is a dua companion — supplications for every part of daily life. The
visual that carries that without a word of explanation is the **mishkāt, the
niche of light** (An-Nūr 24:35: *a niche, within it a lamp*). The niche is the
place you turn toward; the light is the answered supplication; the rays going
out in every direction are the "for every situation" promise of the app.

The current `assets/icon.png` is already that niche — **with the lamp
missing**. It's an empty gold frame, which is why it reads as a picture frame
at 1024px and as an undifferentiated gold blob at 48px. Every prompt below puts
the light source back inside the arch and cuts the frame's weight so the light
is what you see first.

---

## Prompt A — primary app icon (use this one)

> A minimalist flat-vector mobile app icon, square 1024×1024, centered
> composition. Subject: a pointed Islamic mihrab niche — a slender ogee arch
> rising to a single soft point — drawn as a **bold, confident outline in warm
> gold `#E1B347` whose stroke is roughly 3.5% of the image width (about 36
> pixels on a 1024px canvas)**, heavy enough to stay solid when the icon is
> shrunk to 48 pixels. Not a hairline, and not a thick 3D frame. Inside the
> niche a **luminous eight-point star lamp in pale mint `#7BE0BE`** fills at
> least half the interior width, glowing outward with a soft radial bloom;
> eight tapered light rays extend from the star toward the niche edges. The niche sits on a
> deep, near-black forest-green ground `#051714`, subtly darker at the corners
> than at the centre so the glow reads as light in a dark room. The mark
> occupies about 62% of the canvas, optically centred (a touch above true
> centre). Geometry is precise and symmetrical, built on an Islamic geometric
> grid, with crisp even stroke weights and generous negative space.
> Style: modern flat vector iconography with one soft luminous gradient —
> restrained, sacred, calm, premium. Two colours plus the glow. No text, no
> lettering, no Arabic calligraphy, no crescent moon, no mosque skyline, no
> human figures, no photorealism, no bevel or gloss, no drop shadow, no border,
> flat background, no rounded-corner mask.

**Why these constraints:** a *dark field with one bright figure* is what
survives the 48×48 launcher and the tiny Settings row. Specify stroke weight as
a **percentage of canvas, never in pixels** — "2px" on a 1024px canvas is 0.2%
and vanishes entirely at launcher size. Anything under ~3% of canvas width
cannot render at 48px no matter how good its contrast is. The old glossy bevel
is the 2013 iOS idiom and fights the app's flat v3 surfaces.

---

## Prompt B — splash mark (transparent, portrait lockup)

Same mark, taller framing, alpha background — `expo-splash-screen` composites
it on `#0A1512` at 200pt wide.

> The same minimalist gold-outline mihrab niche containing a glowing pale-mint
> eight-point star lamp, rendered as a **tall portrait mark on a fully
> transparent background**, PNG with alpha. The niche is a slender vertical
> arch, centred, occupying about 80% of the frame height, its gold stroke
> roughly 3% of the image width so it stays solid when scaled down. **The
> glowing star is large and dominant — filling most of the niche's width and
> clearly the brightest thing in the frame — never a small ornament in an
> otherwise empty arch.** Its glow is soft and self-contained so it reads
> cleanly against a dark background without a visible box or halo edge.
> Crisp vector edges, no ground plane, no shadow, no background colour, no
> text, no calligraphy.

If you want the app name under the mark on the splash, **set it in a real
typeface afterward** rather than asking the model for it — see the note on text
below.

---

## Prompt C — Android adaptive icon, three layers

Android masks the foreground to a circle: **all meaning must sit inside the
centre 66% of the canvas**, or the launcher crops it.

**Foreground** (`assets/android-icon-foreground.png`, 1024×1024, transparent):
> The gold-outline mihrab niche with its glowing mint eight-point star lamp,
> centred on a fully transparent background, the entire mark contained within
> the central 60% of the square canvas with wide empty margins on all sides
> (safe area for circular masking). Flat vector, crisp edges, no background,
> no shadow, no text.

**Background** (`assets/android-icon-background.png`, 1024×1024):
> A flat deep forest-green field `#051714` filling the entire square, with an
> extremely subtle radial lift toward the centre (no more than one shade
> lighter) and a faint, barely-visible tessellated Islamic eight-point-star
> pattern in `#0A1512` at very low contrast. No focal subject, no text,
> edge-to-edge, seamless.

**Monochrome** (`assets/android-icon-monochrome.png`, 1024×1024, themed icons):
> The same mihrab niche and eight-point star reduced to a **solid pure-white
> silhouette on a transparent background** — filled shapes only, no gradients,
> no glow, no outline hairlines thinner than 3% of the canvas. Contained within
> the central 60% of the canvas. Simple, bold, legible at 24px.

---

## Alternate directions, if A feels too close to what you have

**Alt 1 — The Raised Hands.** Reads "dua" instantly, in any culture:
> Two cupped hands raised in supplication, drawn as a single continuous
> gold `#E1B347` line of even weight, forming an arch-like negative space
> between the palms; a small pale-mint `#7BE0BE` eight-point star of light
> floats in that negative space with a soft bloom. Deep green `#051714`
> ground. Minimal flat vector, geometric, symmetrical, no text, no faces,
> no realism, no fingernails or skin detail.

**Alt 2 — The Compass of Duas.** Leans on "for every way of life":
> An eight-point Islamic khātim star rendered as an interlocking geometric
> compass rose, gold `#E1B347` strapwork over a pale-mint `#7BE0BE` core that
> glows from the centre outward; each of the eight points slightly elongated
> like a compass needle. Deep green `#051714` field. Flat vector, precise
> radial symmetry, single stroke weight, no text, no photorealism.

---

## Universal negative prompt

```
text, letters, words, Arabic calligraphy, Quranic script, watermark, signature,
crescent moon, minaret, mosque skyline, human faces, hands with fingers detail,
photorealistic, 3D render, glossy bevel, plastic shine, drop shadow, gradient
mesh clutter, busy detail, clip art, stock icon, purple, white background,
rounded corner mask, iOS icon frame, mockup, phone in frame, multiple icons,
grid of variations
```

**Never let an image model generate text of any kind — Arabic especially.**
They reliably produce malformed, meaningless letterforms, which is a real
problem in a religious app. Any wordmark, in Arabic or Latin, gets set in a
licensed typeface afterward and composited over the generated mark.

---

## Model-specific tails

- **Midjourney:** append `--ar 1:1 --style raw --stylize 150 --no text, watermark, 3d render`
  (splash: `--ar 5:8`). Raw plus low stylize keeps it from decorating the geometry.
- **gpt-image / DALL·E:** use the prompt as-is; it responds well to the
  explicit hex values and the "flat vector, two colours" framing.
- **Ideogram:** set *Design* style; it holds vector stroke weights best.
- **Flux:** add `vector illustration, sharp geometric shapes, uniform stroke
  weight, no gradients except one soft radial glow`.

---

## After generating

1. Squint test at 48px before anything else — downscale and look. Measure the
   gold stroke: it must be at least 3% of canvas width (≈1.5px at 48px) or the
   arch will disappear into the background when resampled. Contrast does not
   save a sub-pixel stroke.
2. Check it on both `#051714` and a white launcher wallpaper.
3. Resize and place:

```bash
sips -z 1024 1024 in.png --out assets/icon.png
sips -z 1024 1024 in-fg.png --out assets/android-icon-foreground.png
sips -z 1662 1024 in-splash.png --out assets/splash-transparent.png
```

4. `npx expo prebuild --clean` to regenerate the mipmaps and splash drawables.

---

## Feeding these to OpenAI (gpt-image-1)

Four mechanical differences from Midjourney, all of which will bite you:

1. **One image per request.** Prompt C is three separate layers — ask for all
   three in one call and you get a grid of thumbnails in a single PNG, useless
   as assets. Generate foreground, background and monochrome one at a time.
2. **No `--no` flag.** There is no negative-prompt field; negatives have to sit
   inside the prompt sentence. gpt-image-1 follows them better than a diffusion
   model does, but positive phrasing still wins — "flat two-colour vector"
   beats "no 3D, no gloss, no bevel". Keep only the negatives that matter and
   drop the rest of the universal list.
3. **Sizes are fixed:** `1024x1024`, `1024x1536` (portrait), `1536x1024`, or
   `auto`. There is no 1024×1662, so generate the splash at `1024x1536` — the
   splash config uses `resizeMode: contain` with `imageWidth: 200`, so aspect
   is preserved and the source height doesn't need to match the old file.
4. **Transparency is a parameter, not a prompt instruction.** Saying
   "transparent background" in the text is not enough; set
   `background: "transparent"` and `output_format: "png"`.

5. **Download the result — never screenshot the Playground.** A screen capture
   bakes the transparency checkerboard in as literal grey pixels and saves at
   the browser's display size (1254×1254 rather than 1024×1024), producing an
   RGB file with no alpha channel at all. Check any file you intend to ship
   with `python3 -c "from PIL import Image; im=Image.open('f.png'); print(im.mode, im.size)"` —
   it must say `RGBA`.

Strip the markdown `>` and the line breaks before pasting — one flat paragraph.

### Prompt C, layer 1 — adaptive foreground (transparent)

```
A minimalist flat-vector icon mark: a pointed Islamic mihrab niche, a slender ogee arch rising to a single soft point, drawn as a bold even-weight outline in warm gold #E1B347 whose stroke is about 3.5% of the image width — roughly 36 pixels on a 1024 pixel canvas — heavy enough to stay solid at 48 pixels, not a hairline. Inside the niche a luminous eight-point star lamp in pale mint #7BE0BE fills most of the interior width, glowing outward with a soft radial bloom, with eight tapered light rays reaching toward the edges of the niche. The entire mark is contained within the central 60% of a square canvas, with wide empty margins on all four sides as safe area for circular masking. Precise symmetrical Islamic geometry, crisp uniform stroke weights, flat two-colour vector with one soft glow. Transparent background, no ground, no shadow, no text, no lettering.
```

Size `1024x1024`, background `transparent`, quality `high`.

### Prompt C, layer 2 — adaptive background (opaque)

```
A seamless flat background tile, edge to edge, filled entirely with deep near-black forest green #051714, lifted by an extremely subtle radial gradient toward the centre no more than one shade lighter, overlaid with a faint barely-visible tessellated Islamic eight-point-star lattice in #0A1512 at very low contrast. Even, calm, and completely without a focal subject. No central object, no text, no border, no vignette edges.
```

Size `1024x1024`, background `opaque`.

### Prompt C, layer 3 — monochrome (themed icons)

```
A bold minimalist icon silhouette in solid pure white on a transparent background: a pointed Islamic mihrab arch containing an eight-point star, rendered as filled shapes only with no gradients, no glow and no thin hairlines — every stroke at least 3% of the canvas width so it stays legible at 24 pixels. The mark is contained within the central 60% of a square canvas with wide empty margins. Flat, geometric, symmetrical, single colour, no text.
```

Size `1024x1024`, background `transparent`, quality `high`.

### Alt 2 (the Compass), if that's the one you meant

```
A minimalist flat-vector mobile app icon, square, centred: an eight-point Islamic khatim star rendered as interlocking geometric strapwork in warm gold #E1B347, laid over a pale mint #7BE0BE core that glows softly from the centre outward, each of the eight points slightly elongated like a compass needle. The star sits on a deep near-black forest-green field #051714 that darkens gently toward the corners. The mark occupies about 62% of the canvas, optically centred. Precise radial symmetry, uniform stroke weight, generous negative space, flat two-colour vector with one soft luminous gradient — restrained, sacred, premium. No text, no lettering, no Arabic calligraphy, no crescent, no photorealism, no bevel or gloss, no drop shadow, no rounded-corner mask.
```

Size `1024x1024`, background `opaque`, quality `high`.

### Via the API

```bash
curl https://api.openai.com/v1/images/generations \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "<one flat paragraph from above>",
    "size": "1024x1024",
    "background": "transparent",
    "output_format": "png",
    "quality": "high",
    "n": 1
  }' | python3 -c "import sys,json,base64;open('out.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

`gpt-image-1` returns base64 in `data[0].b64_json`, not a URL — hence the decode
step. In the ChatGPT UI instead, paste the paragraph as-is; you cannot set the
transparency flag there, so generate on the dark green and knock the background
out afterward, or use the API for the two transparent layers.
