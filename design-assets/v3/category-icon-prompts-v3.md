# Wasila — 3D category icons (v3, mixed colour)

## What changes from v2

v2 asked every icon for "mint green and emerald", which is why the set
reads as one material in ten shapes. The dashboard now tints each
category a different hue (14a/14b), so the renders should carry that
hue themselves.

Three rules keep a mixed-colour set from looking like a toy box:

1. **Body = the category hue.** One hue per icon, named twice in the
   prompt (once as a colour word, once as a shade word).
2. **Shadow side = deep teal, on every icon.** This is what holds the
   family together across ten hues. Never drop it.
3. **One gold accent, small.** Same gold everywhere. Never the body
   colour.

Camera stays per-icon, per the test-4 finding: physical objects with
volume take three-quarter, flat/symbolic objects take front.

## Structure

```python
STYLE = (", soft 3D clay icon, matte, rounded, thick rounded forms, "
         "deep teal shadow side, soft studio light, "
         "plain flat grey background, centered, one single object")

prompt = icons[key] + STYLE + camera[key]

THREE_Q = ", three-quarter view, slightly above"
FRONT   = ", straight-on front view"
```

```python
NEGATIVE = """mandala, rosette, ornament, medallion, arabesque,
decorative pattern, plaque, tile, carving, relief, engraving, frame,
filigree, symmetrical pattern, kaleidoscope,
text, letters, numbers, Arabic writing, calligraphy, watermark, logo,
gradient background, scenery, floor, cast shadow,
duplicate objects, multiple copies, grid, collage,
rainbow, multicoloured, two-tone body, colour blocking,
flat vector, 2D, outline, sticker,
glossy, chrome, metal, glass, neon,
photo, realistic, face, hands, blurry, distorted, low quality"""
```

Note the colour bans from v2 (`blue, purple, pink, red, orange`) are
**removed** — they now fight the brief. `rainbow, multicoloured,
two-tone body` replaces them: it stops a single icon going polychrome
while letting the set as a whole be polychrome.

## The four on screen now

```python
icons = {
  "sustenance_provision":
    "a single rain cloud with gold raindrops falling below it, "
    "warm amber clay, honey amber body",

  "protection":
    "a single shield, thick and domed, plain smooth face, "
    "one small gold dot centered, soft powder blue clay, "
    "pale cornflower body",

  "health_healing":
    "a single honey jar with a gold honey dipper resting on the rim, "
    "warm coral clay, soft terracotta body",

  "debt_financial_relief":
    "a single padlock hanging open, thick shackle lifted free, "
    "gold keyhole, soft lilac clay, pale violet body",
}

camera = {
  "sustenance_provision": THREE_Q,
  "protection":           FRONT,
  "health_healing":       THREE_Q,
  "debt_financial_relief":THREE_Q,
}
```

Screen hues these are matched to: amber `#E3B872`, blue `#8FB8EA`,
coral `#E8A48C`, lilac `#C7A2E0`.

## The remaining six

Hues chosen to sit at the same lightness so no tile jumps forward.

```python
icons.update({
  "status_elevation":
    "three ascending steps with a thick gold arrow rising above the "
    "top step, soft sage green clay, pale olive body",

  "marriage_family":
    "two interlocking rings side by side, equal size, thick rounded "
    "clay, warm rose clay, dusty pink body",

  "childbirth":
    "a single rocking cradle with curved rockers and a soft hood, "
    "gold trim, pale butter yellow clay, soft cream body",

  "anxiety_grief":
    "a single hanging lantern with a domed top and a warm gold light "
    "inside, deep periwinkle clay, soft indigo body",

  "guidance_knowledge":
    "a single oil lamp with a small gold flame, thick rounded clay, "
    "warm sand clay, pale wheat body",

  "gratitude_praise":
    "a single open palm-up bowl with a gold rim, thick rounded clay, "
    "soft turquoise clay, pale aqua body",
})

camera.update({
  "status_elevation":  FRONT,
  "marriage_family":   FRONT,
  "childbirth":        THREE_Q,
  "anxiety_grief":     THREE_Q,
  "guidance_knowledge":THREE_Q,
  "gratitude_praise":  THREE_Q,
})
```

Rename the last two if the taxonomy differs — the shapes matter more
than the keys.

## Process

- Generate the four on-screen icons first, in one session, one seed
  family. If two hues come back at different lightness the set is
  dead on arrival, and that shows fastest at four.
- Diagnostic icon is `protection`: a plain domed shield in powder blue
  is the simplest test of whether hue and deep-teal shadow can coexist.
  If the shadow side goes grey instead of teal, raise the STYLE
  weighting on "deep teal shadow side".
- Cut alpha from the grey background after generation.
- Keep mint out of the category set entirely. Mint is the CTA and the
  live-count colour; a mint icon competes with it.
