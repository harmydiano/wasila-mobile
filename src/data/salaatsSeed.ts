import type { ApiName } from './hijriCalendarSeed';

export type SalaatMonthLink = { number: number; name: ApiName; note?: string };
export type SalaatDayLink = {
  month: number;
  day: number;
  name: ApiName;
  note?: string;
  times?: { key: string; label: string }[];
};

export type Salaat = {
  slug: string;
  name: ApiName;
  highlights: string[];
  description?: string;
  method?: string;
  source?: string;
  months: SalaatMonthLink[];
  days: SalaatDayLink[];
};

export const SALAATS_SEED: Salaat[] = [
  {
    "slug": "safar-al-khair",
    "name": {
      "ar-Latn": "Șafar al Khair",
      "en": "Safar al Khair"
    },
    "highlights": [],
    "description": "The last Wednesday of Șafar is considered one of the heaviest days in the Islamic calendar.\n\nIn order to seek protection from earthly and heavenly calamities, one should perform this 2 rak‘ah nāfilah salāh on the day or night.",
    "method": "- 2 rak‘ah nāfilah salāh on the day or night of the last Wednesday of Safar\n- In each rak‘ah, after Sūrah al‑Fatihah, Sūrah al‑Ikhlās should be recited 11 times\n- After the completion of the salāh, recite:\n  - Istighfār 11 times\n  - [Salāt‑Munjiyyah](https://pray.islamic.network/salawaats/salat-at-tunjina) 11 times\n- Finally, du‘ā (supplication) should be made.",
    "source": "Tariqat al-Naqshbandiyya / Du‘ās and ‘Ibādahs, Fazilet Publication",
    "months": [
      {
        "number": 2,
        "name": {
          "ar": "صَفَر",
          "ar-Latn": "Ṣafar",
          "en": "Safar"
        }
      }
    ],
    "days": []
  },
  {
    "slug": "salat-al-tasbih",
    "name": {
      "ar": "صَلَاةُ التَّسْبِيح",
      "ar-Latn": "Ṣalāt al-Tasbīḥ",
      "en": "The Prayer of Glorification"
    },
    "highlights": [
      "300 Tasbīḥāt",
      "4 Rakʿahs",
      "Voluntary — Nafl"
    ],
    "description": "Ṣalāt al-Tasbīḥ — the Prayer of Glorification — is a highly meritorious voluntary prayer. Its greatest virtue is the complete forgiveness of sins: the Prophet Muḥammad ﷺ taught that through three hundred recitations of glorification, Allah forgives intentional, unintentional, minor, major, past and future sins.\n\nWhilst the Prophet ﷺ did not offer the ṣalāt himself, he is reported to have said to his uncle ʿAbbās:\n\n> \"If you can observe it once daily, do so; if not, then once weekly; if not, then once a month; if not, then once a year; if not, then at least once in your lifetime.\"\n>\n> — Narrated by Imām Abū Dāwūd, al-Tirmidhī and Ibn Mājah",
    "method": "The prayer consists of four Rak'ahs, in which the following specific Tasbīh is recited a total of 75 times per Rak'ah (300 times in total):\n\nسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ\n\n[Subhān-Allāhi wal-hamdu lillāhi wa lā ilāha il-lallāhu wallāhu akbar wa lā hawla wa lā quwwata illā billāhi-l-ʿaliyyi-l-ʿaẓīm]{.translit}\n\nThe 75 recitations are distributed in each Rak'ah as follows:\n\n* 15 times after reciting the opening supplication in the first rak'at (Thana/Sana)\n* 10 times before going into Ruku (after Surat al-Fātiha and another Surah)\n* 10 times while in Ruku (bowing)\n* 10 times after rising from Ruku (while standing)\n* 10 times in the first Sajdah (prostration)\n* 10 times while sitting between the two Sajdahs\n* 10 times in the second Sajdah",
    "source": "Fazilet Calendar",
    "months": [
      {
        "number": 1,
        "name": {
          "ar": "مُحَرَّم",
          "ar-Latn": "Muḥarram",
          "en": "Muharram"
        },
        "note": "First 10 days"
      },
      {
        "number": 9,
        "name": {
          "ar": "رَمَضان",
          "ar-Latn": "Ramaḍān",
          "en": "Ramadan"
        },
        "note": "Laylat al-Qadr — the last 10 odd nights of Ramaḍān"
      }
    ],
    "days": [
      {
        "month": 1,
        "day": 10,
        "name": {
          "ar": "يَوْمُ عَاشُورَاء",
          "ar-Latn": "Yawm ʿĀshūrāʾ",
          "en": "Day of Ashura"
        },
        "note": "Pray any time after Maghrib",
        "times": [
          {
            "key": "night",
            "label": "Night"
          },
          {
            "key": "last-third-of-the-night",
            "label": "Last Third of the Night"
          }
        ]
      }
    ]
  },
];
