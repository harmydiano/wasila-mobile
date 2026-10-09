export type ApiName = { ar?: string; 'ar-Latn'?: string; en?: string };

export type HijriMonthName = { number: number; name: ApiName };

export type HijriDayRecord = {
  month: number;
  number: number;
  slug: string;
  name: ApiName;
};

export const HIJRI_MONTHS_SEED: HijriMonthName[] = [
  {"number": 1, "name": {"ar": "مُحَرَّم", "ar-Latn": "Muḥarram", "en": "Muharram"}},
  {"number": 2, "name": {"ar": "صَفَر", "ar-Latn": "Ṣafar", "en": "Safar"}},
  {"number": 3, "name": {"ar": "رَبيع الأوّل", "ar-Latn": "Rabīʿ al-Awwal", "en": "Rabi al-Awwal"}},
  {"number": 4, "name": {"ar": "رَبيع الثاني", "ar-Latn": "Rabīʿ al-Thānī", "en": "Rabi al-Thani"}},
  {"number": 5, "name": {"ar": "جُمادى الأولى", "ar-Latn": "Jumādā al-Ūlā", "en": "Jumada al-Ula"}},
  {"number": 6, "name": {"ar": "جُمادى الآخرة", "ar-Latn": "Jumādā al-Ākhirah", "en": "Jumada al-Akhirah"}},
  {"number": 7, "name": {"ar": "رَجَب", "ar-Latn": "Rajab", "en": "Rajab"}},
  {"number": 8, "name": {"ar": "شَعْبان", "ar-Latn": "Shaʿbān", "en": "Shaban"}},
  {"number": 9, "name": {"ar": "رَمَضان", "ar-Latn": "Ramaḍān", "en": "Ramadan"}},
  {"number": 10, "name": {"ar": "شَوّال", "ar-Latn": "Shawwāl", "en": "Shawwal"}},
  {"number": 11, "name": {"ar": "ذوالقعدة", "ar-Latn": "Dhū al-Qaʿdah", "en": "Dhul-Qadah"}},
  {"number": 12, "name": {"ar": "ذوالحجة", "ar-Latn": "Dhū al-Ḥijjah", "en": "Dhul-Hijjah"}},
];

export const HIJRI_DAYS_SEED: HijriDayRecord[] = [
  {"month": 1, "number": 10, "slug": "muharram-10", "name": {"ar": "يَوْمُ عَاشُورَاء", "ar-Latn": "Yawm ʿĀshūrāʾ", "en": "Day of Ashura"}},
  {"month": 1, "number": 13, "slug": "muharram-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 1, "number": 14, "slug": "muharram-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 1, "number": 15, "slug": "muharram-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 2, "number": 13, "slug": "safar-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 2, "number": 14, "slug": "safar-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 2, "number": 15, "slug": "safar-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 3, "number": 12, "slug": "rabi-al-awwal-12", "name": {"ar": "الْمَوْلِدُ النَّبَوِيّ", "ar-Latn": "al-Mawlid al-Nabawī", "en": "Mawlid al-Nabī ﷺ"}},
  {"month": 3, "number": 13, "slug": "rabi-al-awwal-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 3, "number": 14, "slug": "rabi-al-awwal-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 3, "number": 15, "slug": "rabi-al-awwal-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 4, "number": 13, "slug": "rabi-al-thani-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 4, "number": 14, "slug": "rabi-al-thani-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 4, "number": 15, "slug": "rabi-al-thani-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 5, "number": 13, "slug": "jumada-al-ula-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 5, "number": 14, "slug": "jumada-al-ula-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 5, "number": 15, "slug": "jumada-al-ula-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 6, "number": 13, "slug": "jumada-al-akhirah-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 6, "number": 14, "slug": "jumada-al-akhirah-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 6, "number": 15, "slug": "jumada-al-akhirah-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 7, "number": 13, "slug": "rajab-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 7, "number": 14, "slug": "rajab-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 7, "number": 15, "slug": "rajab-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 7, "number": 27, "slug": "rajab-27", "name": {"ar": "ليلة الإسراء والمعراج", "ar-Latn": "Laylat al-Isrāʾ wal-Miʿrāj", "en": "The Night of the Journey and Ascension"}},
  {"month": 8, "number": 13, "slug": "shaban-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 8, "number": 14, "slug": "shaban-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 8, "number": 15, "slug": "shaban-15", "name": {"ar": "لَيْلَةُ الْبَرَاءَة", "ar-Latn": "Laylat al-Barāʾah", "en": "Laylat al-Barāʾah"}},
  {"month": 9, "number": 1, "slug": "ramadan-1", "name": {"ar": "أَوَّلُ رَمَضَان", "ar-Latn": "Awwal Ramaḍān", "en": "First of Ramaḍān"}},
  {"month": 9, "number": 21, "slug": "ramadan-21", "name": {"ar": "لَيْلَةُ الْقَدْر", "ar-Latn": "Laylat al-Qadr", "en": "Laylat al-Qadr — 21st Night"}},
  {"month": 9, "number": 23, "slug": "ramadan-23", "name": {"ar": "لَيْلَةُ الْقَدْر", "ar-Latn": "Laylat al-Qadr", "en": "Laylat al-Qadr — 23rd Night"}},
  {"month": 9, "number": 25, "slug": "ramadan-25", "name": {"ar": "لَيْلَةُ الْقَدْر", "ar-Latn": "Laylat al-Qadr", "en": "Laylat al-Qadr — 25th Night"}},
  {"month": 9, "number": 27, "slug": "ramadan-27", "name": {"ar": "لَيْلَةُ الْقَدْر", "ar-Latn": "Laylat al-Qadr", "en": "Laylat al-Qadr — 27th Night"}},
  {"month": 9, "number": 29, "slug": "ramadan-29", "name": {"ar": "لَيْلَةُ الْقَدْر", "ar-Latn": "Laylat al-Qadr", "en": "Laylat al-Qadr — 29th Night"}},
  {"month": 10, "number": 1, "slug": "shawwal-1", "name": {"ar": "عِيدُ الْفِطْر", "ar-Latn": "ʿĪd al-Fiṭr", "en": "ʿĪd al-Fiṭr"}},
  {"month": 10, "number": 13, "slug": "shawwal-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 10, "number": 14, "slug": "shawwal-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 10, "number": 15, "slug": "shawwal-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 11, "number": 13, "slug": "dhul-qadah-13", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 11, "number": 14, "slug": "dhul-qadah-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 11, "number": 15, "slug": "dhul-qadah-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 12, "number": 8, "slug": "dhul-hijjah-8", "name": {"ar": "يَوْمُ التَّرْوِيَة", "ar-Latn": "Yawm al-Tarwiyah", "en": "Day of Tarwiyah"}},
  {"month": 12, "number": 9, "slug": "dhul-hijjah-9", "name": {"ar": "يَوْمُ عَرَفَة", "ar-Latn": "Yawm ʿArafah", "en": "Day of ʿArafah"}},
  {"month": 12, "number": 10, "slug": "dhul-hijjah-10", "name": {"ar": "عِيدُ الْأَضْحَى", "ar-Latn": "ʿĪd al-Aḍḥā", "en": "ʿĪd al-Aḍḥā"}},
  {"month": 12, "number": 11, "slug": "dhul-hijjah-11", "name": {"ar": "أَيَّامُ التَّشْرِيق", "ar-Latn": "Ayyām al-Tashrīq", "en": "Days of Tashrīq — 11th"}},
  {"month": 12, "number": 12, "slug": "dhul-hijjah-12", "name": {"ar": "أَيَّامُ التَّشْرِيق", "ar-Latn": "Ayyām al-Tashrīq", "en": "Days of Tashrīq — 12th"}},
  {"month": 12, "number": 13, "slug": "dhul-hijjah-13", "name": {"ar": "أَيَّامُ التَّشْرِيق", "ar-Latn": "Ayyām al-Tashrīq", "en": "Days of Tashrīq — 13th"}},
  {"month": 12, "number": 14, "slug": "dhul-hijjah-14", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
  {"month": 12, "number": 15, "slug": "dhul-hijjah-15", "name": {"ar": "أَيَّامُ الْبِيض", "ar-Latn": "Ayyām al-Bīḍ", "en": "The White Days (Ayyām al-Bīḍ)"}},
];
