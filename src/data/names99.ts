export type Name99 = {
  n: number;
  ar: string;
  translit: string;
  meaning: string;
  need: string;
  catId: string;
  also?: string[];
};

export const NAMES_99: Name99[] = [
  { n: 1, ar: 'الرَّحْمَٰن', translit: 'Ar-Raḥmān', meaning: 'The Most Merciful', need: 'Mercy', catId: 'calm' },
  { n: 2, ar: 'الرَّحِيم', translit: 'Ar-Raḥīm', meaning: 'The Bestower of Mercy', need: 'Forgiveness', catId: 'calm' },
  { n: 3, ar: 'الْمَلِك', translit: 'Al-Malik', meaning: 'The King, the Sovereign', need: 'Authority', catId: 'status' },
  { n: 4, ar: 'الْقُدُّوس', translit: 'Al-Quddūs', meaning: 'The Most Holy', need: 'Purity of heart', catId: 'calm' },
  { n: 5, ar: 'السَّلَام', translit: 'As-Salām', meaning: 'The Source of Peace', need: 'Anxiety', catId: 'calm' },
  { n: 6, ar: 'الْمُؤْمِن', translit: 'Al-Muʾmin', meaning: 'The Granter of Security', need: 'Protection', catId: 'protect' },
  { n: 7, ar: 'الْمُهَيْمِن', translit: 'Al-Muhaymin', meaning: 'The Guardian over all', need: 'Safety in travel', catId: 'travel' },
  { n: 8, ar: 'الْعَزِيز', translit: 'Al-ʿAzīz', meaning: 'The Almighty, the Invincible', need: 'Status', catId: 'status' },
  { n: 9, ar: 'الْجَبَّار', translit: 'Al-Jabbār', meaning: 'The Compeller, the Restorer', need: 'Healing', catId: 'health' },
  { n: 10, ar: 'الْمُتَكَبِّر', translit: 'Al-Mutakabbir', meaning: 'The Supreme in greatness', need: 'Authority', catId: 'status' },
  { n: 11, ar: 'الْخَالِق', translit: 'Al-Khāliq', meaning: 'The Creator', need: 'Childbirth', catId: 'birth' },
  { n: 12, ar: 'الْبَارِئ', translit: 'Al-Bāriʾ', meaning: 'The Originator', need: 'Childbirth', catId: 'birth' },
  { n: 13, ar: 'الْمُصَوِّر', translit: 'Al-Muṣawwir', meaning: 'The Fashioner of forms', need: 'Childbirth', catId: 'birth' },
  { n: 14, ar: 'الْغَفَّار', translit: 'Al-Ghaffār', meaning: 'The Constant Forgiver', need: 'Forgiveness', catId: 'calm' },
  { n: 15, ar: 'الْقَهَّار', translit: 'Al-Qahhār', meaning: 'The All-Prevailing', need: 'Protection', catId: 'protect' },
  { n: 16, ar: 'الْوَهَّاب', translit: 'Al-Wahhāb', meaning: 'The Bestower of gifts', need: 'Sustenance', catId: 'rizq' },
  { n: 17, ar: 'الرَّزَّاق', translit: 'Ar-Razzāq', meaning: 'The Provider', need: 'Sustenance', catId: 'rizq' },
  { n: 18, ar: 'الْفَتَّاح', translit: 'Al-Fattāḥ', meaning: 'The Opener of every way', need: 'Sustenance', catId: 'rizq' },
  { n: 19, ar: 'الْعَلِيم', translit: 'Al-ʿAlīm', meaning: 'The All-Knowing', need: 'Knowledge', catId: 'knowledge' },
  { n: 20, ar: 'الْقَابِض', translit: 'Al-Qābiḍ', meaning: 'The Withholder', need: 'Debt relief', catId: 'debt' },
  { n: 21, ar: 'الْبَاسِط', translit: 'Al-Bāsiṭ', meaning: 'The Extender of provision', need: 'Sustenance', catId: 'rizq' },
  { n: 22, ar: 'الْخَافِض', translit: 'Al-Khāfiḍ', meaning: 'The Abaser', need: 'Protection', catId: 'protect' },
  { n: 23, ar: 'الرَّافِع', translit: 'Ar-Rāfiʿ', meaning: 'The Exalter', need: 'Status', catId: 'status' },
  { n: 24, ar: 'الْمُعِزّ', translit: 'Al-Muʿizz', meaning: 'The Giver of honour', need: 'Status', catId: 'status' },
  { n: 25, ar: 'الْمُذِلّ', translit: 'Al-Mudhill', meaning: 'The Giver of dishonour', need: 'Protection', catId: 'protect' },
  { n: 26, ar: 'السَّمِيع', translit: 'As-Samīʿ', meaning: 'The All-Hearing', need: 'Anxiety', catId: 'calm' },
  { n: 27, ar: 'الْبَصِير', translit: 'Al-Baṣīr', meaning: 'The All-Seeing', need: 'Healing', catId: 'health' },
  { n: 28, ar: 'الْحَكَم', translit: 'Al-Ḥakam', meaning: 'The Judge', need: 'A hard dealing', catId: 'debt' },
  { n: 29, ar: 'الْعَدْل', translit: 'Al-ʿAdl', meaning: 'The Utterly Just', need: 'A hard dealing', catId: 'debt' },
  { n: 30, ar: 'اللَّطِيف', translit: 'Al-Laṭīf', meaning: 'The Subtle One', need: 'Sustenance', catId: 'rizq', also: ['debt', 'calm'] },
  { n: 31, ar: 'الْخَبِير', translit: 'Al-Khabīr', meaning: 'The All-Aware', need: 'Knowledge', catId: 'knowledge' },
  { n: 32, ar: 'الْحَلِيم', translit: 'Al-Ḥalīm', meaning: 'The Most Forbearing', need: 'Family', catId: 'family' },
  { n: 33, ar: 'الْعَظِيم', translit: 'Al-ʿAẓīm', meaning: 'The Magnificent', need: 'Status', catId: 'status' },
  { n: 34, ar: 'الْغَفُور', translit: 'Al-Ghafūr', meaning: 'The Great Forgiver', need: 'Forgiveness', catId: 'calm' },
  { n: 35, ar: 'الشَّكُور', translit: 'Ash-Shakūr', meaning: 'The Most Appreciative', need: 'Sustenance', catId: 'rizq' },
  { n: 36, ar: 'الْعَلِيّ', translit: 'Al-ʿAliyy', meaning: 'The Most High', need: 'Status', catId: 'status' },
  { n: 37, ar: 'الْكَبِير', translit: 'Al-Kabīr', meaning: 'The Most Great', need: 'Status', catId: 'status' },
  { n: 38, ar: 'الْحَفِيظ', translit: 'Al-Ḥafīẓ', meaning: 'The Preserver', need: 'Protection', catId: 'protect' },
  { n: 39, ar: 'الْمُقِيت', translit: 'Al-Muqīt', meaning: 'The Sustainer', need: 'Sustenance', catId: 'rizq' },
  { n: 40, ar: 'الْحَسِيب', translit: 'Al-Ḥasīb', meaning: 'The Reckoner', need: 'Debt relief', catId: 'debt' },
  { n: 41, ar: 'الْجَلِيل', translit: 'Al-Jalīl', meaning: 'The Majestic', need: 'Status', catId: 'status' },
  { n: 42, ar: 'الْكَرِيم', translit: 'Al-Karīm', meaning: 'The Most Generous', need: 'Sustenance', catId: 'rizq' },
  { n: 43, ar: 'الرَّقِيب', translit: 'Ar-Raqīb', meaning: 'The Watchful', need: 'Protection', catId: 'protect' },
  { n: 44, ar: 'الْمُجِيب', translit: 'Al-Mujīb', meaning: 'The Responsive', need: 'Anxiety', catId: 'calm' },
  { n: 45, ar: 'الْوَاسِع', translit: 'Al-Wāsiʿ', meaning: 'The All-Encompassing', need: 'Sustenance', catId: 'rizq' },
  { n: 46, ar: 'الْحَكِيم', translit: 'Al-Ḥakīm', meaning: 'The Most Wise', need: 'Knowledge', catId: 'knowledge' },
  { n: 47, ar: 'الْوَدُود', translit: 'Al-Wadūd', meaning: 'The Most Loving', need: 'Marriage', catId: 'family' },
  { n: 48, ar: 'الْمَجِيد', translit: 'Al-Majīd', meaning: 'The Most Glorious', need: 'Status', catId: 'status' },
  { n: 49, ar: 'الْبَاعِث', translit: 'Al-Bāʿith', meaning: 'The Resurrector', need: 'Healing', catId: 'health' },
  { n: 50, ar: 'الشَّهِيد', translit: 'Ash-Shahīd', meaning: 'The All-Witnessing', need: 'A hard dealing', catId: 'debt' },
  { n: 51, ar: 'الْحَقّ', translit: 'Al-Ḥaqq', meaning: 'The Absolute Truth', need: 'Knowledge', catId: 'knowledge' },
  { n: 52, ar: 'الْوَكِيل', translit: 'Al-Wakīl', meaning: 'The Trustee, the Disposer of affairs', need: 'Anxiety', catId: 'calm' },
  { n: 53, ar: 'الْقَوِيّ', translit: 'Al-Qawiyy', meaning: 'The All-Strong', need: 'Healing', catId: 'health' },
  { n: 54, ar: 'الْمَتِين', translit: 'Al-Matīn', meaning: 'The Firm, the Steadfast', need: 'Protection', catId: 'protect' },
  { n: 55, ar: 'الْوَلِيّ', translit: 'Al-Waliyy', meaning: 'The Protecting Friend', need: 'Protection', catId: 'protect' },
  { n: 56, ar: 'الْحَمِيد', translit: 'Al-Ḥamīd', meaning: 'The Praiseworthy', need: 'Gratitude', catId: 'calm' },
  { n: 57, ar: 'الْمُحْصِي', translit: 'Al-Muḥṣī', meaning: 'The All-Enumerating', need: 'Knowledge', catId: 'knowledge' },
  { n: 58, ar: 'الْمُبْدِئ', translit: 'Al-Mubdiʾ', meaning: 'The Originator', need: 'A new beginning', catId: 'status' },
  { n: 59, ar: 'الْمُعِيد', translit: 'Al-Muʿīd', meaning: 'The Restorer', need: 'A new beginning', catId: 'status' },
  { n: 60, ar: 'الْمُحْيِي', translit: 'Al-Muḥyī', meaning: 'The Giver of life', need: 'Healing', catId: 'health' },
  { n: 61, ar: 'الْمُمِيت', translit: 'Al-Mumīt', meaning: 'The Bringer of death', need: 'Grief', catId: 'calm' },
  { n: 62, ar: 'الْحَيّ', translit: 'Al-Ḥayy', meaning: 'The Ever-Living', need: 'Healing', catId: 'health' },
  { n: 63, ar: 'الْقَيُّوم', translit: 'Al-Qayyūm', meaning: 'The Sustainer of all', need: 'Anxiety', catId: 'calm' },
  { n: 64, ar: 'الْوَاجِد', translit: 'Al-Wājid', meaning: 'The Finder, who lacks nothing', need: 'Something lost', catId: 'rizq' },
  { n: 65, ar: 'الْمَاجِد', translit: 'Al-Mājid', meaning: 'The Noble, the Illustrious', need: 'Status', catId: 'status' },
  { n: 66, ar: 'الْوَاحِد', translit: 'Al-Wāḥid', meaning: 'The One', need: 'Purity of heart', catId: 'calm' },
  { n: 67, ar: 'الْأَحَد', translit: 'Al-Aḥad', meaning: 'The Indivisible', need: 'Purity of heart', catId: 'calm' },
  { n: 68, ar: 'الصَّمَد', translit: 'Aṣ-Ṣamad', meaning: 'The Eternal Refuge', need: 'Anxiety', catId: 'calm' },
  { n: 69, ar: 'الْقَادِر', translit: 'Al-Qādir', meaning: 'The All-Capable', need: 'A way out', catId: 'debt' },
  { n: 70, ar: 'الْمُقْتَدِر', translit: 'Al-Muqtadir', meaning: 'The Omnipotent', need: 'A way out', catId: 'debt' },
  { n: 71, ar: 'الْمُقَدِّم', translit: 'Al-Muqaddim', meaning: 'The Expediter', need: 'A way out', catId: 'debt' },
  { n: 72, ar: 'الْمُؤَخِّر', translit: 'Al-Muʾakhkhir', meaning: 'The Delayer', need: 'Patience', catId: 'calm' },
  { n: 73, ar: 'الْأَوَّل', translit: 'Al-Awwal', meaning: 'The First', need: 'Knowledge', catId: 'knowledge' },
  { n: 74, ar: 'الْآخِر', translit: 'Al-Ākhir', meaning: 'The Last', need: 'Knowledge', catId: 'knowledge' },
  { n: 75, ar: 'الظَّاهِر', translit: 'Aẓ-Ẓāhir', meaning: 'The Manifest', need: 'Knowledge', catId: 'knowledge' },
  { n: 76, ar: 'الْبَاطِن', translit: 'Al-Bāṭin', meaning: 'The Hidden', need: 'Knowledge', catId: 'knowledge' },
  { n: 77, ar: 'الْوَالِي', translit: 'Al-Wālī', meaning: 'The Governor', need: 'Authority', catId: 'status' },
  { n: 78, ar: 'الْمُتَعَالِي', translit: 'Al-Mutaʿālī', meaning: 'The Self-Exalted', need: 'Status', catId: 'status' },
  { n: 79, ar: 'الْبَرّ', translit: 'Al-Barr', meaning: 'The Source of all good', need: 'Family', catId: 'family' },
  { n: 80, ar: 'التَّوَّاب', translit: 'At-Tawwāb', meaning: 'The Ever-Accepting of repentance', need: 'Forgiveness', catId: 'calm' },
  { n: 81, ar: 'الْمُنْتَقِم', translit: 'Al-Muntaqim', meaning: 'The Avenger', need: 'A hard dealing', catId: 'protect' },
  { n: 82, ar: 'الْعَفُوّ', translit: 'Al-ʿAfuww', meaning: 'The Pardoner', need: 'Forgiveness', catId: 'calm' },
  { n: 83, ar: 'الرَّءُوف', translit: 'Ar-Raʾūf', meaning: 'The Most Kind', need: 'Family', catId: 'family' },
  { n: 84, ar: 'مَالِكُ الْمُلْك', translit: 'Mālik al-Mulk', meaning: 'Owner of all sovereignty', need: 'Authority', catId: 'status' },
  { n: 85, ar: 'ذُو الْجَلَالِ وَالْإِكْرَام', translit: 'Dhū al-Jalāli wa-l-Ikrām', meaning: 'Lord of majesty and honour', need: 'Status', catId: 'status' },
  { n: 86, ar: 'الْمُقْسِط', translit: 'Al-Muqsiṭ', meaning: 'The Equitable', need: 'A hard dealing', catId: 'debt' },
  { n: 87, ar: 'الْجَامِع', translit: 'Al-Jāmiʿ', meaning: 'The Gatherer', need: 'Family', catId: 'family' },
  { n: 88, ar: 'الْغَنِيّ', translit: 'Al-Ghaniyy', meaning: 'The Self-Sufficient', need: 'Sustenance', catId: 'rizq' },
  { n: 89, ar: 'الْمُغْنِي', translit: 'Al-Mughnī', meaning: 'The Enricher', need: 'Debt relief', catId: 'debt' },
  { n: 90, ar: 'الْمَانِع', translit: 'Al-Māniʿ', meaning: 'The Withholder of harm', need: 'Protection', catId: 'protect' },
  { n: 91, ar: 'الضَّارّ', translit: 'Aḍ-Ḍārr', meaning: 'The Creator of harm', need: 'Protection', catId: 'protect' },
  { n: 92, ar: 'النَّافِع', translit: 'An-Nāfiʿ', meaning: 'The Creator of good', need: 'Healing', catId: 'health' },
  { n: 93, ar: 'النُّور', translit: 'An-Nūr', meaning: 'The Light', need: 'Knowledge', catId: 'knowledge' },
  { n: 94, ar: 'الْهَادِي', translit: 'Al-Hādī', meaning: 'The Guide', need: 'Guidance', catId: 'knowledge' },
  { n: 95, ar: 'الْبَدِيع', translit: 'Al-Badīʿ', meaning: 'The Incomparable Originator', need: 'A new beginning', catId: 'status' },
  { n: 96, ar: 'الْبَاقِي', translit: 'Al-Bāqī', meaning: 'The Everlasting', need: 'Grief', catId: 'calm' },
  { n: 97, ar: 'الْوَارِث', translit: 'Al-Wārith', meaning: 'The Inheritor of all', need: 'Family', catId: 'family' },
  { n: 98, ar: 'الرَّشِيد', translit: 'Ar-Rashīd', meaning: 'The Guide to the right way', need: 'Guidance', catId: 'knowledge' },
  { n: 99, ar: 'الصَّبُور', translit: 'Aṣ-Ṣabūr', meaning: 'The Most Patient', need: 'Patience', catId: 'calm' },
];

export const NAME_NOTES: Record<number, { meaning: string; turnedTo: string; call: string }> = {
  30: {
    meaning:
      'The Subtle One. The One whose kindness is fine enough to reach what is hidden, and to work in a matter without being seen.',
    turnedTo:
      'A way out where none is visible, gentleness in a hard dealing, and provision that arrives quietly.',
    call: 'Yā Laṭīf · when calling upon Him',
  },
};

export function nameAt(n: number): Name99 {
  return NAMES_99.find((x) => x.n === n) ?? NAMES_99[0];
}

export function noteFor(name: Name99) {
  const written = NAME_NOTES[name.n];
  if (written) return written;
  return {
    meaning: `${name.meaning}.`,
    turnedTo: `${name.need} — the need this name is kept for in the collection.`,
    call: `Yā ${name.translit.replace(/^(Al-|Ar-|As-|Aṣ-|Aḍ-|Aẓ-|Ath-|At-|Ash-|An-)/, '')} · when calling upon Him`,
  };
}
