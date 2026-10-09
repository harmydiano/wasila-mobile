# Wasila — 3D practice icons (four, for More 25a)

## Why these are not category icons

The ten category icons are deliberately polychrome — one hue per
category, because the dashboard tints each tile. The four practices are
the opposite case: they sit **together in one grid on one screen**, so a
mixed-hue set there reads as four unrelated stickers.

So the practice set inverts rule 1 of v3:

1. **Body = one shared material across all four.** Soft ivory clay,
   warm parchment body. Never a per-icon hue.
2. **Shadow side = deep teal, on every icon.** Unchanged from v3 — this
   is what keeps the practices in the same world as the categories.
3. **One gold accent, small.** Same gold as v3. On an ivory body the
   gold is the only colour in the object, which is exactly what ties
   these to the gold section rules on 25a.

Ivory + gold also keeps them legible on both surfaces they land on:
the elevated hero card `#1A2E28` and the compact cards `#11201C`.

## Structure

Same STYLE and NEGATIVE as v3, unchanged.

```python
STYLE = (", soft 3D clay icon, matte, rounded, thick rounded forms, "
         "deep teal shadow side, soft studio light, "
         "plain flat grey background, centered, one single object")

prompt = practices[key] + STYLE + camera[key]

THREE_Q = ", three-quarter view, slightly above"
FRONT   = ", straight-on front view"
```

## The four

```python
practices = {
  "salawat":
    "a single rose bloom, thick rounded clay petals opening from the "
    "centre, one small gold dewdrop resting on a petal, "
    "soft ivory clay, warm parchment body",

  "ninety_nine_names":
    "a single closed book lying flat, thick rounded covers, gold page "
    "edges, one gold ribbon marker trailing from the pages, "
    "soft ivory clay, warm parchment body",

  "saints":
    "a single small domed shrine, one pointed arch doorway in the "
    "front wall, a gold finial on top of the dome, thick rounded clay, "
    "soft ivory clay, warm parchment body",

  "personal_zikr":
    "a single loop of prayer beads coiled in a soft pile, thick "
    "rounded beads, one larger gold marker bead, "
    "soft ivory clay, warm parchment body",
}

camera = {
  "salawat":           FRONT,
  "ninety_nine_names": THREE_Q,
  "saints":            THREE_Q,
  "personal_zikr":     THREE_Q,
}
```

## Why these objects

- **Rose for Salawat.** The rose is the established symbol for the
  Prophet across Ottoman and Sufi visual tradition, so it carries the
  meaning without depicting anything. It also avoids the interlocking-
  ring shape, which `marriage_family` already owns.
- **Book for the 99 Names.** The names come with meanings, which is a
  reading act. A closed book with gold edges reads as reference at
  26px, where anything counting-based (beads, dials) collides with
  Personal zikr.
- **Domed shrine for Saints.** A maqam is instantly legible and is the
  one object in the app that means "a place someone is remembered".
  Keep the arch a simple pointed opening — no lattice, no windows.
- **Coiled beads for Personal zikr.** Beads are the only object here
  that means *your* count. The gold marker bead is the accent, and it
  is also the one bead a tasbih actually has, so it is not decoration.

## Watch for

- **The shrine will attract ornament.** `arabesque, tile, carving,
  relief, filigree` are already in NEGATIVE; if the dome still comes
  back patterned, add `mosaic, brickwork, windows, minaret`.
- **The book will attract text.** `text, letters, Arabic writing,
  calligraphy` are in NEGATIVE, but a closed book invites a cover
  title. If it appears, generate the book last with the cover
  described as "plain smooth cover, no markings".
- **The beads will attract multiples.** `duplicate objects, multiple
  copies` is in NEGATIVE; describe it as one coiled loop, never "a
  string of beads", which reads as a row.
- **Ivory can go grey.** If the parchment warmth drops out, the whole
  set will look like unpainted resin next to the amber and coral
  categories. Raise weighting on "warm parchment body" before touching
  anything else.

## Process

- Generate all four in **one session, one seed family**. They share a
  material, so a lightness mismatch is fatal here in a way it is not
  for the categories.
- Diagnostic icon is `saints`: a domed shrine in plain ivory is the
  hardest test of whether the model will leave a surface undecorated.
  If it comes back ornamented, the other three will too.
- Cut alpha from the grey background after generation.
- Render at 4× the on-screen size: the practice marks appear at 30px on
  the hero card and 26px on the three compact cards, so 128px assets
  are the floor.

## If you decide the practices should be tinted after all

Do not give them four hues — give them one, shared, and let the ivory
go. Body becomes `soft sage green clay, pale olive body` on all four,
keeping the deep teal shadow and single gold accent. That reads as a
set, and it keeps mint free for live state. Four different hues here
will fight the four gold marks and the mint running-badge on the same
screen.

---

# Addendum — a fifth practice icon: Salat

The Salat tile on 25a shipped borrowing `practice-zikr.png`. That is
wrong on both counts: beads mean *counting*, which is the one thing the
Salat screen is at pains not to be ("a prayer is prayed rather than
counted"), and Personal zikr already owns the object. The tile needs its
own mark.

## The prompt

```python
practices["salat"] = (
    "a single prayer mat lying flat with its far end loosely rolled, "
    "thick rounded clay, a pointed arch woven into the head end in "
    "gold, plain untextured surface, short fringe at the near end, "
    "soft ivory clay, warm parchment body"
)

camera["salat"] = THREE_Q
```

STYLE and NEGATIVE unchanged from above.

## Why a prayer mat

- It means *the act*, not a count. That is the whole distinction the
  screen is built on, and no other object in the app carries it.
- It is one object, which the grid needs, and it is asymmetric — the
  rolled end and the arch give it a top and a bottom, so it survives
  the 26px compact card where a symmetrical object goes to mush.
- The gold arch is the single accent and it is also the identifying
  mark: a mat without it is a rug. Keep the arch, drop the tassels to
  ivory. Two gold accents breaks rule 3 and the arch is the one that
  does work.

## Watch for

- **The mat will attract weaving.** A prayer mat is the most patterned
  object in the whole set in life, so `decorative pattern, tile,
  carving, symmetrical pattern` will be fighting the subject rather
  than the style. `plain untextured surface` is in the prompt for that
  reason; if it still comes back woven, add `carpet pile, textile
  weave, fringe detail, embroidery` to NEGATIVE.
- **The arch will grow into a shrine.** Keep it *woven into the mat* —
  a flat gold shape on the surface, not a structure standing up off it.
  If it starts casting its own form, the icon has collided with
  `saints` and the generation is a reject.
- **The roll will read as a scroll.** Loosely rolled, one turn, at the
  far end only. A tight cylinder reads as paper, and the 99 Names book
  already owns paper.

## The seeding problem — read before generating

The four existing icons were made in one session on one seed family
because they share a material. A fifth generated cold will almost
certainly land at a different ivory lightness, and on the 25a grid it
sits **directly beside** `saints` and `names99`, where that mismatch is
visible at a glance.

So: regenerate all five together in one session, or generate salat
against a locked seed and compare it side by side with `saints` on
`#11201C` before accepting it. `saints` is still the diagnostic —
if the new mat is warmer or cooler than that dome, ship neither.

Render at 128px minimum; the mark appears at 26px on the compact card.
Cut alpha from the grey background. Land it at
`design-assets/v3/practice/practice-salat.png` and swap `ICON_ZIKR` for
it at `src/screens/v3/More.tsx:149`.

## As built (2026-09-06)

Generated first try, front composition accepted. `practice-salat.png` is
320×320 RGBA like the rest of the set.

**The seed mismatch showed up on the warm axis, not lightness.** Straight
out of the generator the mat measured `R-B` 72 on the body and 122 on the
gold, against a set that runs 35–46 and 88–104 — it read sand next to four
ivory objects. Lightness was already fine (177 vs `saints`' 176), which is
why the warning above about matching lightness was aimed at the wrong
channel. Corrected uniformly (`R-10`, `B+18`) rather than by desaturating
the body, so the gold shifted with it and stayed the one colour in the
object. After correction: L 180.0, body warmth 44, gold warmth 94, opaque
coverage 45.3% — all inside the set's range on every measure.

**Background cut on warmth, not luminance.** The generator's grey
(`#8D8785`) and its cast shadow are both neutral, and the clay is warm, so
alpha came from a ramp on `R-B` (15→35). Keying on brightness would have
eaten the deep teal shadow side, which is the one thing every icon in the
set must keep. Worth reusing for the rest of the set.

**Rotation was tried and rejected.** The mat sits diagonally, so its bbox
wastes frame and it looks smaller than the book and dome beside it. Counter-
rotating 15–35° to stand it up buys almost nothing at 26px — it gets wider
and shorter — and it swings the lit and shadow sides away from the set's
upper-left key. Measured coverage says the impression was wrong anyway:
45.3% is mid-pack, above `saints` and `zikr`.

**Live check:** rendered on the 25a grid beside `names99` and `saints` on
the emulator. Ivory matches, the arch reads at tile size. Two things to fix
if it is ever regenerated: the fringe is ~20 fine teeth that alias into
noise below tile size, and the gold arch is a thin outline where a filled
shape would survive smaller. Ask for `a few thick fringe stubs` and `the
arch filled solid gold, not outlined`.

---

# Addendum 2 — 99 Names: star medallion instead of the book

The book is the weakest object in the set. It means *reference*, which is
one step removed from *the Names of God*; a khatam star carrying the name
says it directly. Replacing it is right.

## The one rule: the generator must not draw the Arabic

Image models do not shape Arabic. They draw letter-shaped marks in
isolated forms, unconnected and often in the wrong order — the same
failure PIL produces without a shaping engine. On the divine name that is
not a legibility bug, it is a garbled lafẓ al-jalāla on a tappable tile,
and it is worse than shipping the book. `text, letters, Arabic writing,
calligraphy` are in NEGATIVE for exactly this reason; the ban stays.

`design-assets/v3/icons/names.png` — a gold-on-navy calligraphic medallion
— is the version of this that was already tried and dropped when the clay
set was made. Do not go back to it.

**So: generate the star empty and set the name in real type.** The app
already ships Scheherazade New (`fonts.arabic`, the Quran face). Use the
single codepoint **U+FDF2 `ﷲ`**, the Allah ligature — one glyph, correctly
formed, no shaping engine needed anywhere in the pipeline. Never assemble
it from ا ل ل ه.

## Why the existing star will not do

`design-assets/v3/icons/mark_star.png` is the right shape in the right
material (L 186.6, warmth 46.6 — near the set already), but its centre is
a **cabochon socket ~12% of the width** with a mint dome in it. Measured
three type sizes into it: at 14% the name fits the well and vanishes at
tile size; at 30% it is readable but sits across the terraces with the
mint showing through; at 52% it reads but overflows the star. The well is
a socket, not a panel. It needs a purpose-built star.

Mint is also reserved for live state, so the dome has to go regardless.

## The prompt

```python
practices["ninety_nine_names"] = (
    "a single eight-pointed star medallion, thick rounded clay, one "
    "wide flat empty recessed panel in the centre taking up half the "
    "width, plain smooth blank surface, a thin gold rim around the "
    "panel, soft ivory clay, warm parchment body"
)

camera["ninety_nine_names"] = FRONT
```

STYLE unchanged. Add to NEGATIVE for this one:
`gemstone, cabochon, dome, inset stone, jewel, boss`.

FRONT, not THREE_Q — the panel has to face the viewer square or the type
set into it will sit on a perspective it does not share.

## Then

Composite `ﷲ` in Scheherazade New 600 into the panel, in the set's gold,
sized to roughly 60% of the panel width, optically centred (the glyph is
top-heavy — the dagger alif and shadda sit high, so centring on the
bounding box drops it low; nudge up ~4% of the icon height).

## Two things to decide before this ships

- **The hero card above these tiles is already a khatam lattice**
  (`<Khatam />`, `parts.tsx:398`, an eight-point star at 46px). An
  eight-point star icon directly below it either reads as cohesive or as
  the same motif twice. Look at them together before committing.
- **Adab.** The name would sit on a tile that gets pressed, greyed when
  disabled, and cropped by the card. That is a call to make deliberately,
  not by default. If it is a concern, the star alone — no name — still
  beats the book.

## As built (2026-09-06)

`practice-names99-star.png`. The book is kept in the repo, unused.

**The generation was the star only; the name is type, not pixels.** `ﷲ`
(U+FDF2) set in Scheherazade New 600 — the app's own Quran face — and
composited into the panel. Correct letterforms by construction, and it can
be re-set at any size or colour without regenerating anything.

**Background keyed on saturation, not warmth.** Unlike the mat, this render
has a pronounced cool teal edge, and the `R-B` key that worked there would
have cut it off. Ground and drop shadow are neutral (max-min ≤ 3), both the
ivory body and the teal edge are saturated, so a ramp on `max-min` (4→12)
separates them cleanly. Use this key by default; the warmth key only works
when the teal is faint.

**The panel was located by measurement, not by eye.** Rows and columns
carrying long runs of gold give the rim's straight edges — inside is
x 219–877, y 287–769 of the trimmed render. The glyph is sized to 80% of
panel height (it is portrait, 0.88 aspect, so height binds, not width) and
sits on a blurred dark drop so it reads as inlay rather than a sticker.

**The section gold is too pale for this job.** `more.gold` `#D9AE5F` on the
cream panel is only ~43 points of value apart and vanishes at tile size.
Compared three golds at 26 and 34px; `#B08A42` won — clear small, not muddy.
This is a local inlay colour on an ivory ground, not a change to the token.

Then warmth-corrected to the set the same way as the mat (`R-6`, `B+11`):
L 177.9, body warmth 44, gold 93, coverage 50.9% — inside the set's range on
every measure. Verified on the 25a grid on the emulator; the name is legible
at tile size and the ivory matches the dome beside it.

**Still open:** the khatam-lattice collision with the hero card above, and
the adab question about the name on a pressable tile. Both were flagged
before building and neither is settled by the asset existing.
