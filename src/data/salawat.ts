export type Salawat = {
  id: string;
  n: number;
  title: string;
  english: string;
  arTitle: string;
  arabic: string | null;
  translit: string | null;
  translation: string | null;
  attribution: string;
  daily: number | null;
};

export const SALAWAT: Salawat[] = [
  {
    id: 'fatih',
    n: 1,
    title: 'Salat al-Fatih',
    english: 'The Opening Prayer',
    arTitle: 'صلاة الفاتح',
    arabic:
      'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ الفَاتِحِ لِمَا أُغْلِقَ، وَالخَاتِمِ لِمَا سَبَقَ، نَاصِرِ الحَقِّ بِالحَقِّ، وَالهَادِي إِلَى صِرَاطِكَ المُسْتَقِيمِ، وَعَلَى آلِهِ حَقَّ قَدْرِهِ وَمِقْدَارِهِ العَظِيمِ',
    translit:
      'Allāhumma ṣalli ʿalā sayyidinā Muḥammadin al-fātiḥi limā ughliq, wa-l-khātimi limā sabaq, nāṣiri-l-ḥaqqi bi-l-ḥaqq, wa-l-hādī ilā ṣirāṭika-l-mustaqīm, wa-ʿalā ālihi ḥaqqa qadrihi wa-miqdārihi-l-ʿaẓīm.',
    translation:
      'O Allah, send blessings upon our master Muhammad, who opened what was closed and sealed what came before, the helper of truth by the truth, the guide to Your straight path — and upon his family, according to his true worth and his immense measure.',
    attribution:
      'Attributed to Sidi Muhammad al-Bakri, and taken up in the Tijani tradition as a daily wording. Reported practice, not a hadith.',
    daily: 100,
  },
  {
    id: 'ibrahimiyya',
    n: 2,
    title: 'Salat Ibrahimiyya',
    english: 'The Abrahamic Prayer',
    arTitle: 'الصلاة الإبراهيمية',
    arabic:
      'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ. اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
    translit:
      'Allāhumma ṣalli ʿalā Muḥammadin wa-ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa-ʿalā āli Ibrāhīm, innaka Ḥamīdun Majīd. Allāhumma bārik ʿalā Muḥammadin wa-ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa-ʿalā āli Ibrāhīm, innaka Ḥamīdun Majīd.',
    translation:
      'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim — You are Praiseworthy, Glorious. O Allah, send favour upon Muhammad and the family of Muhammad, as You sent favour upon Ibrahim and the family of Ibrahim — You are Praiseworthy, Glorious.',
    attribution:
      'The wording taught by the Prophet ﷺ when he was asked how he should be blessed, and the one said in the sitting of every prayer. Reported in Bukhari and Muslim.',
    daily: null,
  },
  {
    id: 'munjiya',
    n: 3,
    title: 'Salat al-Munjiya',
    english: 'The Prayer of Deliverance',
    arTitle: 'الصلاة المنجية',
    arabic:
      'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ صَلَاةً تُنْجِينَا بِهَا مِنْ جَمِيعِ الأَهْوَالِ وَالآفَاتِ، وَتَقْضِي لَنَا بِهَا جَمِيعَ الحَاجَاتِ، وَتُطَهِّرُنَا بِهَا مِنْ جَمِيعِ السَّيِّئَاتِ، وَتَرْفَعُنَا بِهَا عِنْدَكَ أَعْلَى الدَّرَجَاتِ، وَتُبَلِّغُنَا بِهَا أَقْصَى الغَايَاتِ مِنْ جَمِيعِ الخَيْرَاتِ فِي الحَيَاةِ وَبَعْدَ المَمَاتِ',
    translit:
      'Allāhumma ṣalli ʿalā sayyidinā Muḥammadin ṣalātan tunjīnā bihā min jamīʿi-l-ahwāli wa-l-āfāt, wa-taqḍī lanā bihā jamīʿa-l-ḥājāt, wa-tuṭahhirunā bihā min jamīʿi-s-sayyiʾāt, wa-tarfaʿunā bihā ʿindaka aʿlā-d-darajāt, wa-tuballighunā bihā aqṣā-l-ghāyāti min jamīʿi-l-khayrāti fī-l-ḥayāti wa-baʿda-l-mamāt.',
    translation:
      'O Allah, send blessings upon our master Muhammad — a blessing by which You deliver us from every terror and affliction, by which You settle every need of ours, by which You purify us of every wrong, by which You raise us to the highest ranks with You, and by which You bring us to the furthest reach of every good, in life and after death.',
    attribution:
      'Ascribed to Sidi Musa al-Darir and carried in the Shadhili awrād. Reported practice, not a hadith.',
    daily: 41,
  },
  {
    id: 'nariya',
    n: 4,
    title: 'Salat al-Nariya',
    english: 'The Prayer of the Fire',
    arTitle: 'الصلاة النارية',
    arabic:
      'اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ العُقَدُ، وَتَنْفَرِجُ بِهِ الكُرَبُ، وَتُقْضَى بِهِ الحَوَائِجُ، وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الخَوَاتِمِ، وَيُسْتَسْقَى الغَمَامُ بِوَجْهِهِ الكَرِيمِ، وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
    translit:
      'Allāhumma ṣalli ṣalātan kāmilatan wa-sallim salāman tāmman ʿalā sayyidinā Muḥammadin alladhī tanḥallu bihi-l-ʿuqad, wa-tanfariju bihi-l-kurab, wa-tuqḍā bihi-l-ḥawāʾij, wa-tunālu bihi-r-raghāʾibu wa-ḥusnu-l-khawātim, wa-yustasqā-l-ghamāmu bi-wajhihi-l-karīm, wa-ʿalā ālihi wa-ṣaḥbihi fī kulli lamḥatin wa-nafasin bi-ʿadadi kulli maʿlūmin lak.',
    translation:
      'O Allah, send a complete blessing and a perfect peace upon our master Muhammad, by whom knots are untied, distress is relieved, needs are settled and what is sought is attained, and a good end — and by whose noble face rain is asked of the clouds; and upon his family and companions, in every glance and breath, by the number of all You know.',
    attribution:
      'Known in the Maghrib as al-Tafrijiyya and ascribed to Imam al-Qurtubi. Reported practice, not a hadith.',
    daily: 4444,
  },
  {
    id: 'tafrijiyya',
    n: 5,
    title: 'Salat al-Tafrijiyya',
    english: 'The Prayer of Relief',
    arTitle: 'الصلاة التفريجية',
    arabic:
      'اللَّهُمَّ صَلِّ صَلَاةً كَامِلَةً وَسَلِّمْ سَلَامًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ العُقَدُ، وَتَنْفَرِجُ بِهِ الكُرَبُ، وَتُقْضَى بِهِ الحَوَائِجُ، وَتُنَالُ بِهِ الرَّغَائِبُ وَحُسْنُ الخَوَاتِمِ، وَيُسْتَسْقَى الغَمَامُ بِوَجْهِهِ الكَرِيمِ، وَعَلَى آلِهِ وَصَحْبِهِ فِي كُلِّ لَمْحَةٍ وَنَفَسٍ بِعَدَدِ كُلِّ مَعْلُومٍ لَكَ',
    translit:
      'Allāhumma ṣalli ṣalātan kāmilatan wa-sallim salāman tāmman ʿalā sayyidinā Muḥammadin alladhī tanḥallu bihi-l-ʿuqad…',
    translation:
      'The same wording as al-Nariya. The two names travel with different regions rather than with different texts: the Maghrib calls it al-Tafrijiyya, for the relief it asks; the East calls it al-Nariya, for the manner it was read in.',
    attribution:
      'The same text as entry 4 under its Maghribi name. Kept as its own entry because the collections number it separately, not because the wording differs.',
    daily: 4444,
  },
  {
    id: 'mashishiyya',
    n: 6,
    title: 'Salat al-Mashishiyya',
    english: "Ibn Mashish's Prayer",
    arTitle: 'الصلاة المشيشية',
    arabic: null,
    translit: null,
    translation: null,
    attribution:
      'Composed by Sidi ʿAbd al-Salam ibn Mashish, the teacher of Abu-l-Hasan al-Shadhili, and read at the head of the Shadhili wird. Reported practice, not a hadith.',
    daily: 1,
  },
  {
    id: 'anwar',
    n: 7,
    title: 'Salat al-Anwar',
    english: 'The Prayer of Lights',
    arTitle: 'صلاة الأنوار',
    arabic: null,
    translit: null,
    translation: null,
    attribution:
      'Carried in the Maghribi collections of dalāʾil and awrād. Reported practice, not a hadith.',
    daily: null,
  },
  {
    id: 'taj',
    n: 8,
    title: 'Salat al-Taj',
    english: 'The Prayer of the Crown',
    arTitle: 'صلاة التاج',
    arabic: null,
    translit: null,
    translation: null,
    attribution:
      'Widely read in the Indian subcontinent and in Turkey, and printed in the popular collections of ṣalawāt. Reported practice, not a hadith.',
    daily: null,
  },
  {
    id: 'jawharat',
    n: 9,
    title: 'Jawharat al-Kamal',
    english: 'The Jewel of Perfection',
    arTitle: 'جوهرة الكمال',
    arabic: null,
    translit: null,
    translation: null,
    attribution:
      'Transmitted in the Tijani order under licence, with conditions on its recitation. Wasīla names it here and does not print it; it is taken from a teacher, not from an app.',
    daily: 12,
  },
];

export function salawatAt(id: string): Salawat {
  return SALAWAT.find((s) => s.id === id) ?? SALAWAT[0];
}
