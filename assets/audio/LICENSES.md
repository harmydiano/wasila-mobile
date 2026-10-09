# Audio licences

Every audio file shipped in the app is recorded here with where it came from
and under what terms. If a takedown claim ever arrives, this file is the
evidence that answers it — keep it accurate and fill in anything marked TODO
**before** the app is published.

---

## Adhan (call to prayer)

| Field | Value |
| --- | --- |
| Files | `adhan-full.mp3`, `adhan-notification.mp3`, `adhan-notification.caf` |
| Source file as supplied | `Bilal Ahmad - Most Beautiful Azan Adhan  No Copyright  Free Islamic Background.mp3` |
| Credited performer | Bilal Ahmad (as stated in the supplied filename) |
| Source URL | **TODO** — the page or channel the file was downloaded from |
| Licence | **TODO** — the actual licence text or terms shown on that page |
| Attribution required? | **TODO** — many "no copyright" channels require a credit line |
| Date retrieved | **TODO** |
| Retrieved by | **TODO** |

### Why the TODOs matter

The supplied filename asserts "No Copyright". That phrase is a label used by
uploaders and music channels, not a licence — it carries no legal weight on its
own, and it is frequently applied to material the uploader does not own. The
file itself contains **no embedded metadata**: no artist tag, no copyright
frame, no licence URL, so there is nothing inside it establishing provenance
either.

That does not mean the file is a problem. It means the licence lives on the
page it came from, and that page is what needs recording here. If the terms
require attribution, add the credit line to the app (Settings → About is the
usual place) and note it above.

Until the source URL and terms are filled in, treat this audio as **unverified**
and do not ship a public release with it.

---

## Derived files

All three are generated from the supplied source. Nothing was added; the work
was trimming, levelling and format conversion.

| File | Purpose | Detail |
| --- | --- | --- |
| `adhan-full.mp3` | In-app playback | 128.4s, stereo 128 kbps, 2.0 MB |
| `adhan-notification.mp3` | Android channel sound | 24.5s, mono 96 kbps, 287 KB |
| `adhan-notification.caf` | iOS notification sound | 24.5s, IMA4 ADPCM 22.05 kHz mono, 280 KB |

Processing applied:

- Trimmed 1.10s of leading silence and 6.6s of trailing silence from the source.
- Levelled to −16 LUFS with a −1.5 dBTP ceiling, so the adhan doesn't arrive far
  louder or quieter than other notifications on the device.
- Short fade-out at the end of each cut.
- The notification cuts end at 25.55s in the source, which is a natural pause
  between phrases — chosen so the audio doesn't stop mid-word, and so it stays
  under Apple's 30-second limit for notification sounds.

To regenerate, see the ffmpeg invocations in the project history, or re-run the
same trim points against the original file (kept outside the repo).
