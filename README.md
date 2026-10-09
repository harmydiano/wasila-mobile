# Wasīla — React Native (Expo) app

Full rebuild of the `Wasila App v4.dc.html` Claude Design export as a real, runnable
React Native app (Expo SDK 57, TypeScript, React Navigation).

## What's included

- All 17 screens from the design: Onboarding, Home, Benefits/Library, Category detail,
  Dua/Benefit detail, Prayer (times & tracker), Profile, Search, Saved/Bookmarks, Quran
  (read/learn/progress), Sura reader, More, Settings, 99 Names, Tasbih counter, Personal
  Zikr (premium flow), Auth.
- Overlays: Welcome gift modal, Paywall bottom sheet, Category info sheet, Reflections
  sheet, Write-a-reflection sheet.
- Full seed content from the design (10 categories, 40 duas, 24 of the 99 Names, 15 suras,
  Al-Fātiḥah verses, reflection pool, subscription plans) — see `DESIGN_SPEC.md` for the
  complete reverse-engineered spec this was built from.
- Dark Material-3-inspired theme, Manrope + Scheherazade New fonts, Material Symbols-style
  icon set via `@expo/vector-icons`.

## Setup

```bash
npm install
npx expo start
```

Then press `a` for Android, `i` for iOS (macOS + Xcode required), or scan the QR code with
Expo Go on your phone.

## Notes / what's simplified vs. the design mockup

- The design's decorative inline-SVG geometric lattice overlay was left out for time —
  hero/header surfaces use flat gradients instead. Easy to add back with `react-native-svg`
  (already a dependency).
- The Home screen "in-progress" card stack is a horizontal scroll instead of the mockup's
  layered swipe-to-dismiss stack.
- Coach-mark spotlight tour (first-run walkthrough) was not implemented; the welcome-gift
  modal and paywall are wired up.
- Only the first ("free") dua per category has full authored instructions in the source
  design — the rest render a generic placeholder instruction, matching the original.
- Only Al-Fātiḥah has real verse-by-verse text; other suras show a metadata-only empty
  state, matching the original.
- Rating/helpful/streak numbers are deterministically generated per item (same approach the
  design used) rather than backed by a real API.
- `design-assets/` contains background PNGs that were present in the Claude Design export
  but never actually referenced by the markup — kept here in case you want to use them in a
  future polish pass (see DESIGN_SPEC.md section 6).

## Project structure

```
src/
  theme/       colors + typography
  types/       shared TS types
  data/        seed content (categories, names, suras, reflections, plans...)
  state/       AppState context (premium, saved, prayer log, needs, etc.)
  utils/       deterministic "fake stats" helpers
  components/  shared UI (Button, Chip, Card, Sheet, ProgressRing, BottomNav, ...)
  navigation/  React Navigation stack + route param types
  screens/     one file per screen, plus screens/sheets for bottom-sheet overlays
```
