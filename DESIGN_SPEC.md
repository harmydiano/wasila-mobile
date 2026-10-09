# Wasīla — Design Spec (reverse-engineered from Claude-Design export)

Source of truth: `Wasila App v4.dc.html` (2423 lines), cross-checked against `Wasila App v3.dc.html` (identical screen set; v4 adds only the compact/rich category-card toggle). All copy below is quoted verbatim from the state script (`data-dc-script` block, `class Component extends DCLogic`). Where the design is a "sample data" placeholder (explicitly called out in the file's own footer note), this is flagged.

App name: **Wasīla** (وَسِيلَة — Arabic for "means/intermediary", i.e. a means of supplication). Tagline implied by onboarding copy: an Islamic dua/prayer companion built around a corpus of "benefits" (duas tied to a purpose, a divine Name or Qur'an passage, a repetition count, a timing, and a duration).

Platform target for rebuild: React Native + Expo, dark theme only, Material 3-influenced, phone frame reference 428×908 (device used in the design preview).

---

## 1. Screens / Routes Inventory

Driven by a single `screen` state string plus modal/sheet booleans. Full list of `screen` values and what renders:

| screen value | Screen name | Notes |
|---|---|---|
| `onboard` | Onboarding (3 steps) | Initial route |
| `home` | Home | 3 layout variants: A (Feed), B (Hero), C (Agenda) — designer A/B/C toggle, ships as one |
| `library` | Benefits (category list) | 2 card style variants: Compact / Rich (v4 toggle; ships as one) |
| `category` | Category detail (list of duas in a category) | |
| `dua` | Dua/Benefit detail (instructions + counter + reflections) | |
| `prayer` | Prayer | 2 tabs: Times & Qibla / Tracker |
| `profile` | Profile | |
| `search` | Search | |
| `bookmarks` | Saved | |
| `quran` | Quran | 3 tabs: Read / Learn / My progress |
| `sura` | Sura reader | |
| `more` | All features | |
| `settings` | Settings | |
| `names` | 99 Names | |
| `tasbih` | Tasbih counter | |
| `zikr` | Personal Zikr | 4 states: form / wait / result / locked (premium gate) |
| `auth` | Sign in / Create account | 2 modes: signup / signin |

Overlays (booleans, layered above the current screen, `position:absolute;inset:0`):
- **Welcome gift modal** (`giftOpen`) — shown once on first entry to home after onboarding/skip
- **Category info bottom sheet** (`catInfoOpen`) — from the (i) icon on Category detail
- **Coach marks overlay** (`coachOpen`) — 3-step spotlight tour on Home (Next prayer card → In-progress stack → Bottom nav)
- **Reflections bottom sheet** (`reflOpen`) — full list of reviews for a dua
- **Write a reflection bottom sheet** (`writeOpen`) — form / done states
- **Paywall bottom sheet** (`paywallOpen`) — subscription plans

Bottom tab bar (`showNav`) is visible on: home, library, category, search, bookmarks, names, quran, more, prayer, profile (i.e. everywhere except onboarding, dua detail, sura reader, tasbih, zikr, auth, and the overlays sit above whatever is showing).

### Navigation flow

```
onboard (3 steps: Welcome/Features → Needs picker → Reminders)
  → Skip or "Enter Wasīla" → home  (fires giftOpen modal once)

home (bottom nav root)
  ├─ notification bell (top right) → prayer
  ├─ avatar "IB" (top right) → profile
  ├─ In-progress practice card → dua (or, if broken streak, "Restart" → dua)
  ├─ Next-prayer card "All times"/"Qibla" → prayer
  ├─ Quick access tiles: Qibla → prayer, Tasbih → tasbih, 99 Names → names, My Zikr → zikr
  ├─ "What do you need?" category tile → category ; "See all" → library
  ├─ (Layout B) search bar → search ; "Open free benefit" → dua
  └─ (Layout C) need-filter chips (in place), agenda rows → dua or prayer; "Add a benefit" → library

bottom nav: Home | Benefits(library) | Quran | Prayer | More
  (Benefits tab also highlights on: category, search, bookmarks, names)

library (Benefits)
  ├─ search bar → search
  ├─ shortcuts: Saved → bookmarks, Tasbih → tasbih, 99 Names → names, My Zikr → zikr
  └─ category card → category

category
  ├─ back → library
  ├─ (i) info icon → catInfoOpen sheet (close → same screen)
  ├─ free dua card → dua
  ├─ locked dua card → dua (redirects to paywall if not premium)
  └─ "Unlock N more benefits" → paywallOpen

dua (Benefit detail)
  ├─ back → category
  ├─ bookmark toggle (in place)
  ├─ share icon (no handler wired)
  ├─ rating stat → reflOpen sheet
  ├─ counter: tap / +10 / reset (in place)
  ├─ "See all N" reflections → reflOpen sheet
  └─ "Share your reflection" → writeOpen sheet → submit → writeDone → close

prayer
  ├─ tabs: Times & Qibla ↔ Tracker
  ├─ Times tab: prayer list + qibla compass
  └─ Tracker tab: streak card, today log (tap row to toggle prayed), month grid

profile
  ├─ "Not signed in · tap to sync" → auth
  ├─ "See plans" (if not premium) → paywallOpen
  └─ settings row list (display-only in this pass; "All features" style)

search
  ├─ back → library
  ├─ text query → filters corpus
  ├─ suggestion chip → fills query
  ├─ recent chip → fills query
  └─ result row → dua (locked rows show a lock icon; opening still routes to dua, which then gates on premium)

bookmarks (Saved)
  └─ saved dua row → dua

quran
  ├─ search icon → search
  ├─ tabs: Read / Learn / My progress
  └─ Read tab: sura row → sura

sura (reader)
  ├─ back → quran
  ├─ bookmark icon (no handler wired)
  ├─ play/pause button (toggles playIcon + progress bar, in place)
  └─ A−/A+ font size buttons (in place)

more (All features)
  ├─ settings gear (top right) → settings
  └─ feature tile → target screen (quran, library, prayer, tasbih, names, zikr, settings, or "more" as a stub for unbuilt tools: Journal, Hijri calendar, Zakat calculator, Mosques nearby, Halal check, Help & sources)

settings
  ├─ back → more
  ├─ language pills: English / العربية / Français (switch triggers RTL note when Arabic selected)
  └─ setting rows (Prayer group, Reading group; Account group's "Sign in" row → auth)

names (99 Names)
  └─ name row → tasbih (pre-loads that name's dhikr + target count)

tasbih
  ├─ back → home
  ├─ reset icon (top right)
  ├─ tap-anywhere counter area
  └─ target chips (33/99/100/1000) + dhikr list (Subḥānallāh, Alḥamdulillāh, Allāhu akbar, Astaghfirullāh, Yā Laṭīf)

zikr (Personal Zikr — premium gated)
  ├─ back → home
  ├─ locked state → "See plans" → paywallOpen
  ├─ form state → name + mother's name + intent chips → "Prepare my zikr"
  ├─ wait state (auto, 1.8s) → result state
  └─ result state → "Start counting" → tasbih ; "Redo" → form

auth
  ├─ close (X) → profile
  ├─ signup: Name + Email + Password fields; signin: Email + Password
  ├─ "Create account"/"Sign in" → sets signedIn true → profile
  ├─ Google / Apple buttons → sets signedIn true → profile
  └─ toggle link switches signup ↔ signin

Overlays close back to whatever screen opened them (X / backdrop tap / "Close"/"Done"/"Not now").
```

---

## 2. Color Palette

All hex values as they appear in the file, with primary usage.

### Backgrounds
| Hex | Usage |
|---|---|
| `#051714` | Root app background (near-black green); dua screen counter card bg; onboarding bottom sheet bg; tasbih screen bg; auth screen bg; reflection card bg inside sheets |
| `#12201E` | Outer canvas/body background (design-tool chrome, not app) |
| `#0A2621` | Tasbih bottom sheet bg; "Add a benefit to today" dashed card bg; bottom-sheet handle areas |
| `#0F3129` | Locked dua row bg (category screen); category-info sheet bg |
| `#0E332C` | Search/segmented-tab track bg; input field bg (auth, zikr, search); "syncs to account" card bg |
| `#123830` | Card/tile bg used pervasively (home tiles, library cards, settings rows, reflection preview blocks' parent, prayer tracker cards, sura row cards, names row cards, dhikr inactive row parent) |
| `#0E2A25` | Rich category-card bg (v4 rich variant) |
| `#12463C` | Icon chip bg (feature icons, counter step badges, avatar circles, tag pills, active dhikr row) |
| `#1B4239` | Divider lines / borders; homeCatsB card border; agenda row border |
| `#33290F` | Amber/gold "note" callouts (herbs & oils, language note, gift icon bg, locked-badge chip bg) |
| `#2C2411` → `#5C4520` (gradient) | Premium promo card gradient (profile upsell, zikr locked upsell) |

### Brand / Accent (teal-green)
| Hex | Usage |
|---|---|
| `#0A3F35` | Onboarding header gradient start |
| `#0C4A3E` | Onboarding header gradient mid; Next-prayer hero card gradient start; dua header bg; sura header bg; avatar circle bg; "Next prayer" home-B card bg |
| `#116B58` | Next-prayer hero card gradient end |
| `#0E9B6C` | Primary CTA buttons (Continue/Enter, Mark done, Count, Start trial, Submit, Prepare my zikr, Save/Prayed pill) |
| `#4FD1A0` | Primary accent green — icons, links ("See all", "Explore"), Arabic script accents, progress rings, active states, streak counters |
| `#B8EDE6` | Light mint — active pill/tab backgrounds, onboarding dot active, hero card CTA "All times", nav active icon background, Arabic calligraphy on dark cards |
| `#EAFBF7` | Near-white text on teal/dark-teal hero surfaces |

### Text
| Hex | Usage |
|---|---|
| `#EAF3F0` | Primary heading/body text on dark cards |
| `#F2FBF8` / `#F4FAF8` | Brightest headline text (design-tool title, rich card title) |
| `#DCEAE6` | Secondary body text on cards |
| `#A9C4BE` | Muted secondary text / subtitles |
| `#8FAAA4` | Tertiary/meta text (labels, timestamps, counts) |
| `#7B948F` | Quietest meta text (e.g. "Swipe for more") |
| `#6E8A84` | Disabled/inactive icon & chevron color |
| `#93AFA9` | Design-tool description text (not in-app) |
| `#9FDCD3` | Teal-tinted labels on hero/teal surfaces ("Next prayer", location) |

### Gold / Amber (premium & "note" accents)
| Hex | Usage |
|---|---|
| `#E0BE85` | Gold icon color (lock, star, schedule); "FREE"/locked labels |
| `#F1DDB6` | Amber note body text |
| `#F0D9A8` | Premium/gift CTA button bg |
| `#241C06` | Text on gold buttons |
| `#F6E4C6` | Text on premium gradient card |
| `#D9BC86` | "Wasīla Premium" eyebrow text |
| `#C9A96A` | Benefit-of-the-day meta text (home layout B) |
| `#E4CFA4` | Zikr-locked body copy |

### Category tint system (per-category accent, used for chip/tile backgrounds & Arabic ghost icon)
Each category has a 3-value tint array `[light, translucentBg, dark]` used for gradient tiles and icon chips:
| Category id | Light | Translucent bg | Dark |
|---|---|---|---|
| rizq (Sustenance) | `#E9C88F` | `rgba(233,200,143,.22)` | `#C79A54` |
| debt | `#84DCC6` | `rgba(132,220,198,.20)` | `#3FA98F` |
| protect | `#95C6EA` | `rgba(149,198,234,.20)` | `#4E90C4` |
| health | `#ABE2A3` | `rgba(171,226,163,.20)` | `#5EAE5C` |
| status | `#EDBBC7` | `rgba(237,187,199,.20)` | `#C4808F` |
| family | `#F3ADA3` | `rgba(243,173,163,.20)` | `#CE7468` |
| birth | `#CDB9ED` | `rgba(205,185,237,.20)` | `#9276C4` |
| calm | `#A4D8DD` | `rgba(164,216,221,.20)` | `#5CA5AC` |
| knowledge | `#EFD892` | `rgba(239,216,146,.20)` | `#C7A94E` |
| travel | `#A1CAB5` | `rgba(161,202,181,.20)` | `#5F9B7D` |

Tile icon color on the tinted gradient tile: `#06201B` (near-black green).

### Semantic
| Hex | Usage |
|---|---|
| `#002B27` / `#04231C` | Text on light-mint active pills/tabs |
| `#4A3A16` | Border on a "broken streak" practice card |
| `#2F7F69` | Border on the highlighted free-dua card (category screen) |
| `#2C5A50` | Default outline-button border color throughout |

### Decorative pattern
A repeating inline SVG diamond/lattice geometric pattern (Islamic-motif line art) is layered at low opacity (`.11`–`.14`) over hero/teal surfaces (onboarding header, prayer hero card, dua/sura headers, premium gradient cards, paywall sheet top, tasbih background). Pattern: stroke `#B8EDE6` (or `#E0BE85` on gold cards), 52×52px tile, stroke-width 1.1, diamond + inscribed square + corner rays.

---

## 3. Typography

- **Manrope** (Google Fonts, weights 400/500/600/700/800) — all UI text: headings, body, buttons, labels, numerals. Loaded via `family=Manrope:wght@400;500;600;700;800`.
- **Scheherazade New** (Google Fonts, weights 400/700) — all Arabic script: app name "وَسِيلَة", divine Names (يَا لَطِيف etc.), sura names, dua Arabic titles, Qur'an verse text, Bismillah, dhikr Arabic, category ghost-icon Arabic subtitle in rich cards. Always `direction:rtl`. Sizes range from 17px (rich category card subtitle) up to 196px (giant faded watermark behind dua header) and 82px+ for hero display (e.g. onboarding logotype 40px, dua page divine-name display 54px, zikr result surah name 44px).
- **Material Symbols Outlined** (Google Fonts variable icon font, opsz/wght/FILL/GRAD @24,400,0,0) — all iconography, referenced by ligature name (e.g. `notifications`, `mosque`, `savings`).

Type scale highlights: headline 26–28px/800 weight (-0.02em tracking) for screen titles; 20–23px/800 for card headlines; 14–15px/700 for row titles; 11–13px/600–700 uppercase-tracked (0.08–0.14em) for eyebrow labels; 11–12px/600 for meta/secondary text.

---

## 4. Data Model Shapes

### Category (`CATS[]`, 10 entries)
```
{
  id: string,            // 'rizq' | 'debt' | 'protect' | 'health' | 'status' | 'family' | 'birth' | 'calm' | 'knowledge' | 'travel'
  icon: string,           // Material Symbols name
  title: string,
  total: number,          // stated corpus size for the category (used in UI copy, only 4 duas are actually authored per category)
  sub: string,             // one-line description
  duas: Dua[]              // 4 entries per category in this sample data
}
```

### Dua / Benefit (`Category.duas[]`)
```
{
  t: string,     // title, e.g. "Increase in sustenance in 7 days"
  n: string,     // Arabic name/surah (RTL), e.g. "يَا لَطِيف"
  tr: string,    // transliteration, e.g. "Yā Laṭīf"
  m: string,     // meaning / gloss, e.g. "The Subtle, the Gentle" (may be omitted on non-free entries then default text used)
  c: string,     // count/repetitions, e.g. "1000 times" or "Once" — parsed via regex to get numeric target for the counter
  tm: string,    // timing, e.g. "After Maghrib"
  d: string,     // duration, e.g. "7 days"
  free: boolean, // true = first entry per category (unlocked without premium)
  s: string[],   // ordered instruction steps (only populated on the free entry per category in this sample; others are [])
  note: string   // "Herbs & oils" note text (only populated on the free entry; others '')
}
```
Only the first ("free") dua per category has authored `s`/`note`/`m` content in this sample export; the other 3 per category are placeholders with empty `s: []` and `note: ''` — the detail screen falls back to "Instructions for this benefit load with your corpus." and "No accompanying preparation is recorded for this benefit."

### Dhikr (`DHIKR[]`, 5 entries — used by Tasbih)
```
{ name: string (transliteration), ar: string (Arabic, RTL), count: string (default target, e.g. "33") }
```

### Divine Name (`NAMES99[]`, 24 sample entries out of a stated 99)
```
{ ar: string, tr: string, meaning: string, benefit: string (linked use-case), count: string (e.g. "298×") }
```

### Sura (`SURAS[]`, 15 sample entries)
```
{ n: number, ar: string, name: string (transliteration), meaning: string, v: number (verse count), place: 'Meccan' | 'Medinan' }
```

### Verse (`FATIHAH[]`, 7 entries — only Al-Fātiḥah has full verse text wired up; all other suras show an empty state)
```
{ ar: string, tr: string, en: string }
```

### Reflection / review (`REFL_POOL[]`, 6 seed entries, deterministically shuffled per dua via a hash seed so each dua "looks like" it has different reviewers)
```
{ name: string, place: string, d: number (base helpful count), days: string ("practising X"), stars: 1-5, body: string }
```
Derived fields shown in UI: `initials`, `meta` ("{place} · practising {days}"), `stars` (★ string), `helpfulLabel`.

### Plan (paywall)
```
{ key: 'monthly' | 'yearly', name: string, note: string, price: string, per: string }
```
Monthly: $4.99/mo, "Cancel any time". Yearly: $39.99 ($3.33/mo), "Two months free" — yearly is default-selected.

### Settings row / group
```
group: { title: string, rows: { icon, label, value, go? (screen key) }[] }
```

---

## 5. Screen-by-Screen Detail

### 5.1 Onboarding (`screen: 'onboard'`, 3 steps via `obStep` 0–2)

**Purpose:** First-run welcome, needs picker, reminder opt-in.

**Layout (shared shell, top to bottom):**
1. Background: `linear-gradient(180deg,#0A3F35 0%,#0C4A3E 42%,#051714 42%,#051714 100%)`, geometric pattern overlay at 11% opacity in top 42%.
2. Progress dots (3, 34px×4px pill each): filled `#B8EDE6` for steps ≤ current, `rgba(255,255,255,.28)` otherwise.
3. Header block: Arabic logotype "وَسِيلَة" (Scheherazade New 40px, `#B8EDE6`, RTL) → step title (28px/800, `#EAFBF7`) → step subtitle (14px, `#B4DED7`, max-width 300px).
4. Scrollable white-ish card area (bg `#051714`, rounded top 28px, overlaps header by -16px) containing step-specific content (see below).
5. Footer bar: "Skip" text button (`#A9C4BE`) + primary CTA pill button (bg `#0E9B6C`, full width, text `{{ obCta }}`).

**Step copy (`obCopy` array, indexed by `obStep`):**
- Step 1: title "Prayers for what you are actually facing", sub "A working corpus of benefits, each with its name, its count and its timing."
- Step 2: title "What do you need most right now?", sub "Pick a few. Nothing is locked to your choice — it only sets the order."
- Step 3: title "When should we remind you?", sub "Most benefits are tied to a prayer time. Reminders keep the count on track."

CTA label: "Continue" (steps 1–2), "Enter Wasīla" (step 3, final). "Skip" always jumps straight to home (and still fires the welcome-gift modal).

**Step 1 content — Feature list (`obFeatures`, 3 cards):**
Cards: icon chip (42×42, bg `#12463C`, icon `#4FD1A0`) + title (15px/700, `#EAF3F0`) + body (13px, `#A9C4BE`). Card bg `#123830`, radius 18px.
- icon `menu_book` — "**{total} benefits, grouped by purpose**" (total = sum of all category `total` fields, computed at runtime — sums to 307 with the sample data) — "Sustenance, debt, protection, health, status, childbirth and more."
- icon `format_list_numbered` — "Plain instructions" — "The name or surah, the number of repetitions, the timing, the duration."
- icon `auto_awesome` — "Personal zikr" — "Your own surah, verse and names, computed from your name and your mother's."

**Step 2 content — Needs picker:**
- Eyebrow: "Choose any that apply" (13px/700 uppercase, `#A9C4BE`)
- Chip list (`NEEDS`): Provision, Debt relief, Protection, Health, Marriage, Children, Status, Peace of mind, Studies. Selected chips: filled `#0E9B6C`, white text, leading `check` icon. Unselected: outline `#2C5A50`, text `#C3D9D3`. Default selected: Provision, Protection.
- Footer note (12px, `#8FAAA4`): "Your picks decide what appears first on the home screen. You can change them later."

**Step 3 content — Reminders:**
- Card (bg `#123830`) titled "Reminders", containing 3 toggle rows:
  - "After Fajr" · "5:12 AM" — default ON
  - "After Maghrib" · "7:04 PM" — default ON
  - "Unfinished counts" · "9:30 PM" — default OFF
  - Toggle visual: ON = pill bg `#0E9B6C` with knob `#123830` right-aligned; OFF = pill bg `#E1E7E5` border `#2C5A50` with knob `#6E8A84` left-aligned.
- Language note card (bg `#33290F`, icon `language` `#E0BE85`): "Reading in **English** with Arabic alongside. العربية and Français are available in Settings."

**Interactive elements:** Skip, Continue/Enter Wasīla, need chips (toggle), reminder toggles (toggle).

---

### 5.2 Home (`screen: 'home'`) — 3 layout variants (`homeLayout`: A/B/C)

**Shared header (all variants):** Hijri date eyebrow (12px/700 uppercase, `#4FD1A0`, e.g. "17 Safar 1448") → greeting headline (23px/800, `#EAF3F0`, "Assalamu alaikum, Ibrahim") on the left; bell icon button (`notifications`, `#A9C4BE`) → prayer, and circular avatar button "IB" (bg `#0C4A3E`, text `#B8EDE6`) → profile, on the right.

#### Layout A — "Feed" (default)
Top-to-bottom sections (flex order 1–4, so visually Prayer card appears above the In-progress stack despite DOM order):
1. **In-progress stack** (`practices`, swipeable card deck, order 2): eyebrow "In progress" + "{n} active" meta. A 124px-tall pointer/swipe area (`stackDown`/`stackUp`, threshold 36px drag) stacking 3 cards with depth (translateY/scale/opacity based on position, z-index layered), each card: circular progress ring (conic-gradient, `#4FD1A0` or `#E0BE85` if broken) with percent text, day label (uppercase, teal `#7FCFC3` or gold `#E0BE85` if broken), title (15px/700), sub text (12px), and either a `play_circle` icon (on track) or a "Restart" outline button (streak broken). Dot pagination below (3 dots, active dot 22px wide `#4FD1A0`, inactive 6px `#2C5A50`) + "Swipe for more" hint text.
   - Sample practices: "Increase in sustenance" (Day 3 of 7, 34%, 340/1000 after Maghrib), "Protection of the home" (Day 12 · ongoing, 100%, done today before sleep), "Elevation in rank at work" (Missed yesterday · day 6 of 21, 0%, broken/needs restart).
2. **Next prayer hero card** (order 1): gradient `linear-gradient(135deg,#0C4A3E 0%,#116B58 100%)`, radius 26px, geometric pattern overlay + decorative translucent circle top-right. Content: eyebrow "Next prayer" (`#9FDCD3`), prayer name (32px/800, e.g. "Maghrib"), countdown ("in 1 hr 22 min", `#B4DED7`); right-aligned time (26px/700, e.g. "7:04 PM") and "Lagos, NG" (`#9FDCD3`). Two pill buttons: "All times" (filled `#B8EDE6`/`#002B27`) and "Qibla" (outline) — both → prayer screen.
3. **Quick access** (order 3): eyebrow "Quick access", 4 equal tiles (bg `#123830`, radius 18px): Qibla (`explore`) → prayer, Tasbih (`radio_button_checked`) → tasbih, 99 Names (`grid_view`) → names, My Zikr (`auto_awesome`) → zikr.
4. **"What do you need?" category grid** (order 4): heading (17px/800) + "See all" link (`#4FD1A0`) → library. 2-column grid of first 6 categories as tiles (icon chip + title 14px/700 + "{total} practices" meta 11px) → category.

#### Layout B — "Hero"
1. Search bar pill (bg `#1B4239`, icon `search` `#4FD1A0`, placeholder text "What do you need help with?") → search.
2. **Benefit of the day** card: bg `#33290F` (amber), giant faded Arabic watermark "لَطِيف" top-right (64px, 22% opacity `#7A5B2C`), eyebrow "Benefit of the day" (`#E0BE85`), headline "Increase in sustenance in 7 days" (22px/800 `#F1DDB6`), meta "Yā Laṭīf · 1000 times after Maghrib" (`#C9A96A`), CTA pill "Open free benefit" (bg `#F0D9A8`, text `#241C06`) → opens the rizq/0 dua.
3. 2-column grid of first 4 categories (`homeCatsB`), taller cards (min-height 132px, border `#1B4239`) with icon top, title+meta bottom-aligned.
4. **Next prayer compact row**: bg `#0C4A3E`, "Next prayer" eyebrow + "{name} · {time}" (18px/800) left, `chevron_right` right → prayer.

#### Layout C — "Agenda"
1. Horizontal scrollable need-filter chip row (`NEEDS`, same chip styling as onboarding step 2).
2. "Today" section label, then a flat list (`agenda`, no card gaps, divided by `#1B4239` borders) of 6 timed rows: time (13px/700) + icon circle (bg `#12463C` or `#1B4239` or `#F6E4C6` per entry) + title/sub, and a trailing status icon: `check_circle` (`#4FD1A0`) if done, `radio_button_unchecked` (`#2C5A50`) if pending.
   - Rows: 5:12 Fajr (Prayed, done), 6:00 "Yā ʿAlīm · 150" / Retention of what is studied (done), 12:58 Zuhr (done), 16:22 Asr (done), 19:04 "Yā Laṭīf · 1000" / "Day 3 of 7 · 340 done" (pending), 20:15 "Al-Baqarah 1–5" / Protection of the home (pending).
3. Dashed "Add a benefit to today" card (border `#9FBDB6` dashed, bg `#0A2621`, icon `add_circle`) → library.

**Interactive elements across Home:** bell → prayer, avatar → profile, swipe/tap practice stack → dua or reorder stack, hero card buttons → prayer, quick-access tiles → respective screens, category tiles → category, "See all" → library, (B) search bar → search, benefit-of-day CTA → dua, (C) filter chips (toggle), agenda rows → dua/prayer, add-a-benefit → library.

---

### 5.3 Benefits / Library (`screen: 'library'`) — 2 card style variants (`cardStyle`: compact/rich)

**Header:** "Benefits" (26px/800) + "{corpusCount} entries · grouped by purpose" meta (corpusCount = sum of all category totals, "307" with sample data). Search bar pill ("Search a purpose, name or surah") → search. Row of 4 shortcut tiles: Saved (`bookmark`) → bookmarks, Tasbih (`radio_button_checked`) → tasbih, 99 Names (`grid_view`) → names, My Zikr (`auto_awesome`) → zikr.

**Compact card variant** (2-column grid, all 10 categories): bg `#123830`, radius 20px, icon chip (tinted per category) top-left + "1 FREE" gold badge top-right, title (14px/700) + "{total} practices" meta below.

**Rich card variant** (single column, full-width stacked cards): bg `#0E2A25`, radius 24px, oversized faint ghost icon (150px, `rgba(255,255,255,.028)`) top-right as texture, gradient tile icon (52px, per-category gradient + shadow), Arabic subtitle (Scheherazade New 17px, gold `#E0BE85`, RTL — per-category phrase, e.g. rizq: "الرزق و الغنى"), title (20px/800), description `sub` (13px `#93AFA9`), divider, footer row "{total} practices" (uppercase meta) + "Explore →" (`#E0BE85` + `arrow_forward` icon).

**All 10 categories (title / Arabic subtitle / total / description):**
1. **rizq** — Sustenance & provision — "الرزق و الغنى" — 42 — "Benefits for opening provision, barakah in earnings and unexpected relief."
2. **debt** — Debt & financial relief — "الفرج و السداد" — 28 — "For pressing debts, long-standing balances and ease in repayment."
3. **protect** — Protection — "الحفظ و الحماية" — 56 — "The home, travel, envy, and the protection of children."
4. **health** — Health & healing — "الشفاء و الصحة" — 39 — "Persistent pain, prolonged illness and strength after recovery."
5. **status** — Status & elevation — "الرفعة و الجاه" — 24 — "Rank at work, acceptance among people, honour and recognition."
6. **family** — Marriage & family — "المحبة و القبول" — 31 — "Harmony between spouses, proposals, reconciliation and children."
7. **birth** — Childbirth — "الذرية و الولادة" — 18 — "Conception, protection through pregnancy and ease in labour."
8. **calm** — Anxiety & grief — "السكينة و الراحة" — 33 — "A constricted chest, sleeplessness and persistent sadness."
9. **knowledge** — Knowledge & memory — "الحفظ و الذكاء" — 22 — "Retention, understanding of difficult texts and clarity of speech."
10. **travel** — Travel — "السفر و الطريق" — 14 — "Departure and return, borders, companionship and belongings."

**Interactive elements:** search bar → search, shortcut tiles → respective screens, category card → category.

---

### 5.4 Category Detail (`screen: 'category'`)

**Layout top to bottom:**
1. Back button (`arrow_back`) → library.
2. Title row: category title (27px/800) + (i) info button → opens Category info sheet; subtitle `sub` below.
3. **Free section** (1 card): highlighted with mint glow (`box-shadow:0 0 0 3px rgba(79,209,160,.09)`), border `#2F7F69`, bg `#143F35`. Contains: "FREE" badge (bg `#4FD1A0`, text `#0A2C24`), dua title (15px/700), summary (12.5px), and right-aligned Arabic name (26px, `#4FD1A0`, RTL). Below: rating row (`star` icon + rating value + "found this helpful" text), and 3 meta chips: count (bg `#12463C`), timing (bg `#12463C`), duration (bg `#0E332C`).
4. **Locked section**: eyebrow "Premium · {n} more" with `lock` icon (`#E0BE85`). 3 rows (bg `#0F3129`, border `#1B4239`): title + "Invocation & practice details" caption + trailing lock icon circle (bg `#33290F`).
5. Primary CTA pill: "Unlock {n} more benefits" (bg `#0E9B6C`) → paywallOpen.

**Rating/helpful stats are procedurally generated** per dua via a deterministic hash of category id + index (`statsFor`), so numbers look organic but are not backed by real data — rating ~4.2–5.0, helpful count 40–250.

**Category info sheet** (bottom sheet, triggered by (i) icon): "About {catTitle}" heading, body: "Benefits in this category are grouped by the need they address. The grouping is Wasīla's own categorisation, not a claim from a source text." / "Each entry names where it comes from — Qur'an, hadith, or the practice of later scholars — on its own screen, with the wording of the invocation and the recommended time." Amber disclaimer box: "No outcome is guaranteed. These are supplications, offered in hope, not transactions." "Close" button.

---

### 5.5 Dua / Benefit Detail (`screen: 'dua'`)

**Header** (bg `#0C4A3E`, geometric pattern + giant faded Arabic name watermark 196px `rgba(184,237,230,.13)` bottom-right):
- Back (`arrow_back`) → category; bookmark toggle icon (`bookmark`/`bookmark_border` per `saved` state); share icon (`ios_share`, no handler wired).
- Eyebrow: category title (`duaCategory`); headline: dua title `duaTitle` (26px/800); 3 meta chips: count (mint bg `#B8EDE6`/`#002B27`), timing, duration (translucent white bg).

**Name/translit block** (centered, border-bottom `#1B4239`): Arabic name (Scheherazade New 54px, `#4FD1A0`, RTL), transliteration (17px/700), meaning (`m`, 13.5px `#A9C4BE`).

**Stats row** (3 equal columns, dividers `#1B4239`): ★ rating (`reflAvg`) → tap opens Reflections sheet; "{practisingToday} reciting today" (procedurally generated, 900–5200 range); 🔥 "{myStreak}" your streak (procedurally generated "Xd", 3–29 range).

**Instructions section:** eyebrow "Instructions", numbered steps (`duaSteps`) — circular numeral badge (bg `#12463C`, text `#4FD1A0`) + step text (14px, `#DCEAE6`). Falls back to a single generic step "Instructions for this benefit load with your corpus." for the 3 non-free duas per category (empty `s` array).

**Herbs & oils note:** amber card (bg `#33290F`, icon `spa`) — eyebrow "Herbs & oils" + `duaNote` text. Falls back to "No accompanying preparation is recorded for this benefit." when empty.

**Counter section** — two mutually-exclusive states based on parsed target from `c`:
- **No-counter state** (`c` parses to ≤1, e.g. "Once"): card (bg `#051714`) with `event_available` icon: "A single recitation — no count to keep. Mark it done once you have finished." + full-width button "Mark as done" / "Marked done today" (toggle, `doneLabel`).
- **Has-counter state** (`c` parses to >1): card with eyebrow "Counter", circular progress ring (176px, conic-gradient `#4FD1A0` fill against `#1B4239`, glow shadow scaling with progress) showing current count (34px/800) / "of {target}" (12px); control row: reset icon button (outline circle), primary "Count" pill button (bg `#0E9B6C`, tap scales to 0.94), "+10" outline button; hint text below (either "Complete for today. Continue tomorrow." or "{timing} · {remaining} remaining").
  - Default seeded count on open: `min(340, floor(target*0.34))`, i.e. every dua opens ~34% pre-filled (design placeholder behavior, not meant to persist across real data).

**Reflections section:** eyebrow "Reflections" + "See all {reflTotal}" link → Reflections sheet. Preview of 2 reflection cards (avatar initials circle, name, "{place} · practising {days}" meta, star string e.g. "★★★★★", body text). "Share your reflection" outline button (icon `rate_review`) → Write sheet. Footer disclaimer: "Reflections are reviewed before they appear. Outcomes rest with Allah alone."

`reflTotal` and `reflAvg` are also procedurally generated per-dua (seeded hash): total 40–250, avg 4.2–5.0.

---

### 5.6 Reflections Sheet (`reflOpen`)

Bottom sheet (bg `#123830`, radius 28px top corners, max-height 82%, slide-up animation). Header: drag handle, "Reflections" title + dua title subtitle, right-aligned ★ average + "{n} ratings". Scrollable list of all pooled reflections (`reflList`, 6 seed reviewers shuffled per dua): each card shows avatar initials, name, meta, star string, body text, and a "Helpful · {n}" toggle button (turns `#4FD1A0` when toggled) + "Report" text button (no handler). Footer: "Share your reflection" button → Write sheet.

**Seed reviewer pool** (`REFL_POOL`, 6 people, reused/reshuffled across all duas): Yusuf Adeyemi (Lagos, 5★), Aisha Bello (Kano, 5★), Ibrahim Sesay (Freetown, 4★), Maryam Diallo (Dakar, 5★), Abdulrahman Musa (Abuja, 4★), Khadijah Omar (Mombasa, 5★) — each with a full quoted testimonial body text (see source for exact wording, all present verbatim in state script).

---

### 5.7 Write a Reflection Sheet (`writeOpen`)

Two states:
- **Form** (`writeForm`): "Your reflection" heading + "Write about your own experience of practising this. It is published under your name once reviewed." Star picker (5 tappable stars, filled gold `#E0BE85` up to selected count, else `#2C5A50`). Multiline textarea (placeholder "What changed in your practice, your consistency, your state?"). "Posting as **{myName}**" row with avatar initials (defaults to "Abdullah Yakubu" if no auth name set). "Submit for review" button — disabled (bg `#1B4239`, not-allowed cursor) until a star rating is set and text length > 3 chars.
- **Done** (`writeDone`): checkmark icon circle, "Sent for review" heading, "A moderator reads every reflection before it is published. Yours usually appears within a day." "Done" button → closes sheet.

---

### 5.8 Prayer (`screen: 'prayer'`)

**Header:** "Prayer" (26px/800) + location line (icon `location_on` + "Lagos, Nigeria · Muslim World League").
**Segmented tabs:** "Times & qibla" / "Tracker" (pill track bg `#0E332C`, active pill `#B8EDE6`/`#04231C`).

#### Times & Qibla tab (default)
- Prayer list card (bg `#123830`): 6 rows for Fajr 5:12 AM, Sunrise 6:31 AM, Zuhr 12:58 PM, Asr 4:22 PM, Maghrib 7:04 PM (marked "next", highlighted row bg `#0C4A3E`/`#EAFBF7`, note "in 1 hr 22 min"), Isha 8:18 PM. Each row: icon (`wb_twilight`, `light_mode`, `mosque`, `mosque`, `nights_stay`, `bedtime`) + name + time.
- Qibla compass card: eyebrow "Qibla · 58° NE", circular compass (196px, N/S/E/W labels, green needle rotated 58°, center dot), caption "Hold the phone flat and turn until the needle points to the top marker."

#### Tracker tab
- Streak card: "Current streak" eyebrow + big number "{streakLabel}" (34px/800 `#4FD1A0`, "23 days"), right-aligned "This month" + "{monthPctLabel}" ("88%"). Week strip: 7 day-rings (S M T W T F S) each showing a conic-gradient progress ring based on prayers logged that day, with date number inside.
- "Today" log card: 5 rows (Fajr/Zuhr/Asr/Maghrib/Isha with times) — each row is a toggle: "Prayed" pill (bg `#12463C`, check icon) if logged, or outline "Log" button if pending. Default log state: Fajr, Zuhr, Asr = true; Maghrib, Isha = false.
- Month grid card: "Safar 1448" heading + "Five of five logged" meta, 7-column × ~5-row grid of day cells: full-logged days = filled `#0E9B6C`, partial = `#12463C`, none = `#0E332C` (pattern: days ≤27 are logged except every 4th (mod 7 === 3) which is partial; days >27 are none).

---

### 5.9 Profile (`screen: 'profile'`)

- Header: avatar circle "IB" (62px, bg `#0C4A3E`) + name "Ibrahim Bello" (20px/800) + plan label ("Premium · yearly" or "Free plan") + pill "{profileSub}" ("Not signed in · tap to sync" or the user's email) → auth.
- 3-column stat tiles: "23" Day streak, "11" Benefits completed, "48k" Total count.
- **If not premium:** gold gradient promo card (`linear-gradient(135deg,#2C2411,#5C4520)`) — eyebrow "Wasīla Premium", "Open the full corpus and your personal zikr", "See plans" button → paywall.
- **If premium:** confirmation card (bg `#12463C`) — `verified` icon, "Premium active", "Renews 3 Sep 2026 · full corpus unlocked".
- Settings list card (6 rows): Language "English", Arabic script "On", Recitation audio "Qari A", Reminders "2 active", Personal zikr ("Ready" if premium else "Premium"), Sign in/Account row, All features row (`apps` icon, no value) — rows are display rows in this pass (icon + label + value + chevron), not all individually wired to click targets except via the underlying settings-group data model used identically on the Settings screen.

---

### 5.10 Search (`screen: 'search'`)

- Header: back → library; search input pill (bg `#0E332C`, icon `search`, placeholder "When sick, for debt, Yā Laṭīf…", clear `close` icon when non-empty) bound to `query`.
- **Empty query state:** "Try" chip row (suggestions: "When sick", "To clear a debt", "Protection of the home", "Ease in labour", "Yā Laṭīf", "Al-Wāqiʿah" — tapping fills the query) + "Recent" list (icon `history`, trailing `north_west`): "Increase in sustenance in 7 days", "Relief from a constricted chest", "Elevation in rank at work" (static placeholder recents, tapping fills query).
- **Query state:** "{n} results" count, result rows (cat eyebrow, title, summary = "{translit} · {count} · {timing}") with trailing `chevron_right` (open) or lock icon in a circle (`locked`, if not premium and dua isn't free) → dua. Search matches against title + transliteration + meaning + category title + category sub, case-insensitive substring, capped at 12 results.
- **No-results state:** `search_off` icon, "Nothing for that yet", "Try a purpose in plain words, or the name of a surah."

---

### 5.11 Saved / Bookmarks (`screen: 'bookmarks'`)

- Header: "Saved" + "{n} benefit(s) saved" count.
- **Has saved:** list of saved dua rows (same row style as search results, no lock badge — Arabic name shown right-aligned instead) → dua.
- **Empty:** `bookmark_border` icon, "Nothing saved yet", "Tap the bookmark on any benefit to keep it here for quick access."
- Default seed data: `rizq:0` is saved (the free sustenance dua).

---

### 5.12 Quran (`screen: 'quran'`)

- Header: "Quran" + "{quranLast}" meta ("Last read · Al-Kahf, verse 10"); search icon (top right) → search.
- Segmented tabs: Read / Learn / My progress.

#### Read tab (default)
List of suras (`SURAS`, 15 sample entries out of 114): row number, name (transliteration, 15px/700) + "{meaning} · {v} verses · {place}" meta, right-aligned Arabic name (26px, RTL) → sura reader.
Sample suras included: Al-Fātiḥah(1), Al-Baqarah(2), Āl-ʿImrān(3), An-Nisāʾ(4), Al-Māʾidah(5), Al-Anʿām(6), Al-Kahf(18), Maryam(19), Yā Sīn(36), Ar-Raḥmān(55), Al-Wāqiʿah(56), Ash-Sharḥ(94), Al-Ikhlāṣ(112), Al-Falaq(113), An-Nās(114).

#### Learn tab
4 lesson cards (icon chip + title + body + duration/meta pill):
- `record_voice_over` — "Makhraj of the throat letters" — "Where each of ʿayn, ḥāʾ, ghayn and khāʾ is formed, with audio comparison." — "6 min"
- `timer` — "Rules of madd" — "How long to hold each elongation, and the three cases where it changes." — "9 min"
- `menu_book` — "Memorise Al-Wāqiʿah" — "Split into eleven sittings, with a review schedule after each." — "11 sittings"
- `school` — "Reading without vowel marks" — "A gradual removal of ḥarakāt across familiar short suras." — "4 weeks"

#### My progress tab
- Khatam card: conic-gradient ring (98px, 32% fill) "32% khatam", "Second khatam" heading, "Juz 10 of 30 · started 4 Muharram. At your current pace you finish in 71 days."
- 2×2 stat grid: "1" Khatams completed, "Juz 10" Current position, "18 min" Daily average, "41" Days read in a row.

---

### 5.13 Sura Reader (`screen: 'sura'`)

- Header (bg `#0C4A3E`, pattern overlay): back (`arrow_back`) → quran; centered sura name (15.5px/800) + meta ("{ar} · {v} verses · {place}"); `bookmark_border` icon (no handler).
- Bismillah centered (Scheherazade New 30px, `#4FD1A0`, RTL): "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيم".
- **If Al-Fātiḥah (n===1):** verse list (`FATIHAH`, 7 verses), each: verse-number badge (bg `#12463C`), `play_circle`/`bookmark_border` icons, Arabic text (30px, RTL, right-aligned), transliteration (italic, 13px), English translation (14px). Full verbatim verse text included in source (see Data Model section).
- **Any other sura:** empty state — `menu_book` icon, sura name, "Verses for this sura come from your Quran source. Al-Fātiḥah is included here as the working example."
- Sticky audio player footer (bg `#0A2621`): play/pause circular button (bg `#0E9B6C`), reciter name "Mishary Rashid Alafasy" + progress bar (fills to 38% while "playing"), A−/A+ font-size step buttons (22–42px range, step 3px).

---

### 5.14 More / All Features (`screen: 'more'`)

- Header: "All features" (26px/800) + settings gear icon → settings.
- 3 grouped sections (`moreGroups`), each a 2-column grid of tiles (icon + label, some with a "Premium" gold tag):
  - **Deen:** Quran (`menu_book`) → quran, Duas (`volunteer_activism`) → library, Qibla (`explore`) → prayer, Tasbih (`radio_button_checked`) → tasbih, 99 Names (`grid_view`) → names, Personal zikr (`auto_awesome`, tag "Premium") → zikr.
  - **Tools:** Prayer tracker (`checklist`) → prayer, Journal (`edit_note`) → more (stub), Hijri calendar (`calendar_month`) → more (stub), Zakat calculator (`calculate`) → more (stub), Mosques nearby (`location_on`) → more (stub), Halal check (`verified`) → more (stub).
  - **Account:** Settings (`settings`) → settings, Help & sources (`help`) → more (stub).

---

### 5.15 Settings (`screen: 'settings'`)

- Header: back → more; "Settings" title.
- **Language section:** 3 pills (English / العربية / Français), active = filled mint. Selecting Arabic shows an amber RTL note card: "Arabic switches the whole interface to right-to-left. Navigation, lists and the counter mirror."
- **Grouped rows** (`settingGroups`, 3 groups):
  - **Prayer:** Calculation method → "MWL", Manual adjustments → "None", Adhan notifications → "5 on".
  - **Reading:** Transliteration → "Shown", Arabic size → "{arabicSize}px" (default 30), Reciter → "Alafasy".
  - **Account:** Sign in/Account (→ auth) → email or "Not signed in", Subscription → "Premium"/"Free", Offline content → "2.1 GB" (premium) / "Premium" (locked).

---

### 5.16 99 Names (`screen: 'names'`)

- Header: "99 Names" + "Each name, its meaning, and what it is used for" subtitle.
- List of 24 sample names (out of the stated 99), each row: index number, transliteration (14.5px/700) + meaning (12.5px) + linked benefit text (12px, e.g. "Softening of a hardened heart"), right-aligned Arabic (27px, RTL) + repetition-count pill (e.g. "298×"). Tapping a row jumps straight to Tasbih pre-loaded with that name's count as the target.
- Full list (Arabic / translit / meaning / linked benefit / count): Ar-Raḥmān "The Most Compassionate" / softening of a hardened heart / 298×; Ar-Raḥīm "The Most Merciful" / mercy in matters beyond your control / 258×; Al-Malik "The Sovereign" / authority and command over affairs / 90×; Al-Quddūs "The Most Holy" / purification of intention / 170×; As-Salām "The Source of Peace" / recovery from prolonged illness / 131×; Al-Muʾmin "The Giver of Security" / relief from a constricted chest / 136×; Al-ʿAzīz "The Almighty" / strength before those who oppose you / 94×; Al-Fattāḥ "The Opener" / opening of closed doors / 489×; Ar-Razzāq "The Provider" / unexpected provision / 308×; Al-Laṭīf "The Subtle" / increase in sustenance / 129×; Al-Ḥafīẓ "The Preserver" / protection on a journey / 998×; Al-Wadūd "The Loving" / affection between spouses / 1000×; Ash-Shakūr "The Appreciative" / recognition of long effort / 526×; Ar-Rafīʿ "The Exalter of Rank" / elevation in rank at work / 351×; Al-Muʿizz "The Bestower of Honour" / honour and dignity / 117×; Al-Bāsiṭ "The Expander" / removal of persistent sadness / 72×; Al-Ghanī "The Self-Sufficient" / settlement of long-standing debt / 1060×; Al-Wahhāb "The Bestower" / relief from a pressing debt / 100×; Al-ʿAlīm "The All-Knowing" / retention of what is studied / 150×; Al-Qawiyy "The All-Strong" / strength after illness / 116×; Al-Hādī "The Guide" / guidance for a wayward child / 400×; Al-Bāriʾ "The Originator" / conception after long waiting / 1000×; Al-Muhaymin "The Guardian over All" / ease at borders and checkpoints / 145×; Al-Wakīl "The Trustee" / calm before a difficult meeting / 66×.

---

### 5.17 Tasbih Counter (`screen: 'tasbih'`)

- Full-screen dark (`#051714`) with faint geometric pattern.
- Header: back → home; "Tasbih" title; reset icon.
- Center tap-anywhere zone: "Loop {n}" label, giant count number (82px/800, `#4FD1A0`), "/ {target}" below, Arabic dhikr text (Scheherazade New 38px, RTL), dhikr name (14.5px/700), hint "Tap anywhere to count". Tapping increments count; on reaching target, resets count to 0 and increments loop.
- Bottom sheet panel (bg `#0A2621`, rounded top 24px): "Dhikr" heading + target chips (33/99/100/1000, selecting resets count/loop and sets target) + selectable dhikr list (5 entries from `DHIKR`): active row bg `#12463C` with filled radio icon; inactive rows plain with outline radio icon. Selecting a dhikr resets count/loop and sets target from that dhikr's default count.
- Dhikr set: Subḥānallāh (سُبْحَانَ اللّٰه, 33), Alḥamdulillāh (الْحَمْدُ لِلّٰه, 33), Allāhu akbar (اللّٰهُ أَكْبَر, 34), Astaghfirullāh (أَسْتَغْفِرُ اللّٰه, 100), Yā Laṭīf (يَا لَطِيف, 1000).

---

### 5.18 Personal Zikr (`screen: 'zikr'`) — Premium feature, 4 states

Header: back → home (all states).

- **Locked state** (`zikrLocked`, shown if not premium): gold gradient card, `auto_awesome` icon, "Personal zikr is a premium feature", "One calculation, prepared for you and kept in your account. Included in every premium plan.", "See plans" → paywall.
- **Form state** (`zikrForm`, premium + `zStep==='form'`): Arabic "ذِكْر" (34px), "Your personal zikr" heading, "A surah, a verse and a set of divine names worked out from your name and your mother's. Prepared once, yours to keep." Inputs: "Your name" (placeholder "Ibrahim"), "Your mother's name" (placeholder "Aisha"). "What is this for?" intent chips: Provision, Protection, Health, Marriage, Studies, Peace of mind (single-select, default Provision). Privacy note (icon `lock`): "Names are used only for the calculation and are not shared. The result is prepared on our side and returned to your account." CTA button: "Enter both names" (disabled-looking state) until both fields filled, then "Prepare my zikr".
- **Wait state** (`zikrWait`, auto after submit, ~1.8s): spinner (`wsSpin` animation), "Working it out", "This usually takes a moment. We will notify you if it takes longer."
- **Result state** (`zikrResult`): eyebrow "Prepared for {name}", headline (intent label, "Opening of provision" for Provision). Surah card (bg `#123830`, pattern overlay, centered): "Your surah" eyebrow, Arabic "الشَّرْح" (44px), "Sūrah ash-Sharḥ · 94", divider, "Verse 5–6, recited seven times after each obligatory prayer." Names list (3 fixed sample entries, each bg `#123830`): Yā Laṭīf (129×) "The Subtle", Yā Fattāḥ (489×) "The Opener", Yā Razzāq (308×) "The Provider". Amber schedule note (icon `schedule`): "Begin on a Thursday night. Keep to the same order each day for forty days, then repeat if needed." Buttons: "Start counting" → tasbih; "Redo" → back to form.

---

### 5.19 Auth — Sign in / Create account (`screen: 'auth'`)

- Close (X) → profile.
- Arabic logotype "وَسِيلَة" (34px), heading (`authTitle`: "Create your account" / "Welcome back"), subtitle (`authSub`: syncing copy).
- Signup mode adds a "Name" field (placeholder "Ibrahim Bello") above Email/Password. Both modes: "Email" (placeholder "you@example.com"), "Password" (type password, placeholder "At least 8 characters").
- Primary CTA: "Create account" / "Sign in" (`authCta`) → sets signedIn, returns to profile.
- Divider "OR".
- Provider buttons: "Continue with Google" (icon `g_translate`), "Continue with Apple" (icon `phone_iphone`) — both stub-sign-in and return to profile.
- "What syncs to your account" info card: Counts and streaks, Saved benefits, Your personal zikr, Prayer log and reminders (each with a `check` icon).
- Mode toggle link: "Already have an account? Sign in" / "New here? Create an account".
- Legal footer: "By continuing you agree to the terms and the privacy policy."

---

### 5.20 Modals / Overlays

#### Welcome Gift (`giftOpen`)
Triggered automatically the first time home is shown after onboarding (or replay). Centered dialog card (bg `#123830`): `redeem` icon in gold circle, "A gift to start with" heading, body: "The full corpus, your personal zikr and offline access are open for the next 72 hours. Nothing to pay, nothing to cancel." Countdown pill (icon `schedule`): "71:58:04 remaining" (static placeholder, not a live timer). Buttons: "Open everything" (accepts → grants premium + starts coach marks) / "Maybe later" (dismisses → starts coach marks anyway).

#### Coach Marks (`coachOpen`)
3-step spotlight tour over the Home screen, auto-positioned via live element measurement (`measureCoach`, polls every 120ms while active) with a green-bordered spotlight cutout and a floating instruction card that repositions above/below the highlighted element:
1. Spotlights the Next-prayer hero card: "Your next prayer, always first" — "Times follow your location. Tap through for the full day and the qibla."
2. Spotlights the In-progress stack: "Pick up where you left off" — "Anything you have started keeps its count here — day, progress and the time it is tied to."
3. Spotlights the bottom nav bar: "Everything else lives here" — "Quran, tasbih, the 99 names, your personal zikr and the tools."
Each step shows "Step {n} of 3", a "Skip" text link, and a "Next"/"Got it" button.

#### Paywall (`paywallOpen`)
Bottom sheet (pattern overlay at top): "Unlock the full corpus" heading, "One free benefit stays open in every category. Premium opens the rest." Perk list (`check_circle` icons):
- "All {total} benefits across every category"
- "Full instructions, counts, timings and herb notes"
- "Personal zikr from your name and your mother's"
- "Offline access and unlimited counters"

Plan cards: **Monthly** ($4.99, "per month", "Cancel any time") and **Yearly** ($39.99, "$3.33 / month", "Two months free", selected by default — highlighted with `#4FD1A0` border + bg `#123B33`). Primary CTA: "Start 7-day free trial" (subscribes → sets premium true, closes sheet). Secondary: "Not now" (dismiss, no purchase).

---

### 5.21 Bottom Navigation Bar

5 items, bg `#0A2621`, border-top `#1B4239`: **Home** (`home`) / **Benefits** (`volunteer_activism`) → library / **Quran** (`menu_book`) / **Prayer** (`mosque`) / **More** (`apps`). Active item: icon in a mint pill (bg `#B8EDE6`, icon `#002B27`) with label `#B8EDE6`/800; inactive: plain icon `#A9C4BE`, label `#A9C4BE`/600. "Benefits" tab is considered active while on category, search, bookmarks, or names screens too.

---

## 6. Assets Folder (background images — present but NOT referenced anywhere in the v4/v3 markup)

The following PNGs exist in `_extract/assets/` but no `<img>` or CSS `url()` reference to them appears in either `.dc.html` file — the shipped screens instead use inline SVG geometric-pattern overlays and CSS gradients exclusively. They are likely leftover art from an earlier pass or intended for a future polish pass. Suggested mapping by filename (not confirmed by the file, use judgment during rebuild):
- `bg_img_night.png` — possible full-bleed night-sky background (onboarding or home)
- `img_allah_bg.png` — decorative background, possibly for a splash/onboarding screen
- `img_bg_top.png` — top-of-screen decorative background (possibly for onboarding header, replacing/supplementing the current inline SVG pattern)
- `img_dua_bg.png` — possible dua-detail header background
- `img_prayer_img.png` — possible prayer-screen hero background
- `img_quran_bg.png` — possible Quran-screen header background
- `img_tasbih_bg.png` — possible tasbih-screen background
- `purchase_title_img.png` — possible paywall/purchase sheet header art

Recommend confirming with the designer whether these should be wired in during the rebuild, or treated as unused artifacts.

---

## 7. Implementation Notes for the Expo Rebuild

- All screen switching in the design is driven by one `screen` string in a single root component state — for the real app this maps naturally to a stack/tab navigator (React Navigation) with routes matching the `screen` values listed in section 1.
- Bottom tab bar should be a persistent Tab Navigator wrapping Home/Benefits/Quran/Prayer/More; Category/Search/Bookmarks/Names should push onto a stack nested under the Benefits tab (matching the "Benefits tab stays highlighted" behavior).
- Dua detail, Sura reader, Tasbih, Zikr, and Auth are full-screen pushes without the bottom tab bar.
- Onboarding is a separate pre-auth flow, not part of the tab structure.
- Overlays (gift, coach marks, reflections sheet, write sheet, paywall, category info) should be implemented as modals/bottom sheets layered on top of the current route, not separate routes — matching the design's boolean-flag overlay pattern.
- The "rich vs compact" category card and "A/B/C" home layout were designer-facing comparison toggles, not real product variants — pick ONE final treatment per section for the production app (recommend: Home Layout A "Feed" as the richest/most complete, and the Rich category card style, based on how fully-featured they are relative to B/C and compact).
- Only the first ("free") dua per category has full authored instruction steps/notes in this export; all other dua content (their `s`/`note`/`m` fields) is empty placeholder data — the real corpus content for all ~307 stated benefits will need to be authored/sourced before shipping.
- Only Al-Fātiḥah has real verse-by-verse Quran content wired up; the other 14 sample suras are metadata-only (name/meaning/verse count) with an empty-state reader.
- Rating/helpful/streak/practising-today numbers throughout (dua detail, category rows, search results) are procedurally faked via a deterministic hash seed for visual variety — replace with real backend-driven stats.
