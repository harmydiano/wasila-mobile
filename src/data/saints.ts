export type Saint = {
  id: string;
  name: string;
  country: string;
  place: string;
  died: number;
  born?: number;
  order: string;
  duas: number;
};

export function centuryOf(died: number): number {
  return Math.floor((died - 1) / 100) + 1;
}

const ORDINAL = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', '13th', '14th', '15th'];

export function centuryLabel(c: number): string {
  return `${ORDINAL[c] ?? `${c}th`} century AH`;
}

export const SAINTS: Saint[] = [
  { id: 'hasan-basri', name: 'Hasan al-Basri', country: 'iq', place: 'Basra', born: 21, died: 110, order: 'Tabiʿin', duas: 3 },
  { id: 'rabia', name: 'Rābiʿa al-ʿAdawiyya', country: 'iq', place: 'Basra', died: 185, order: 'Early ascetics', duas: 2 },
  { id: 'dhul-nun', name: 'Dhū-l-Nūn al-Miṣrī', country: 'eg', place: 'Akhmim', died: 245, order: 'Early ascetics', duas: 4 },
  { id: 'bistami', name: 'Abū Yazīd al-Bisṭāmī', country: 'ir', place: 'Bistam', died: 261, order: 'Early ascetics', duas: 1 },
  { id: 'tustari', name: 'Sahl al-Tustarī', country: 'ir', place: 'Tustar', died: 283, order: 'Salimiyya', duas: 2 },
  { id: 'junayd', name: 'Al-Junayd al-Baghdādī', country: 'iq', place: 'Baghdad', died: 297, order: 'Junaydi', duas: 7 },

  { id: 'hallaj', name: 'Al-Ḥusayn ibn Manṣūr al-Ḥallāj', country: 'ir', place: 'Baghdad', born: 244, died: 309, order: 'Junaydi', duas: 0 },
  { id: 'shibli', name: 'Abū Bakr al-Shiblī', country: 'iq', place: 'Baghdad', died: 334, order: 'Junaydi', duas: 1 },
  { id: 'makki', name: 'Abū Ṭālib al-Makkī', country: 'iq', place: 'Baghdad', died: 386, order: 'Salimiyya', duas: 5 },

  { id: 'sulami', name: 'Abū ʿAbd al-Raḥmān al-Sulamī', country: 'ir', place: 'Nishapur', born: 325, died: 412, order: 'Malamati', duas: 0 },
  { id: 'abu-said', name: 'Abū Saʿīd Abī-l-Khayr', country: 'ir', place: 'Mayhana', born: 357, died: 440, order: 'Khurasani', duas: 1 },
  { id: 'qushayri', name: 'Abū-l-Qāsim al-Qushayrī', country: 'ir', place: 'Nishapur', born: 376, died: 465, order: 'Ashʿari', duas: 4 },
  { id: 'hujwiri', name: 'ʿAlī al-Hujwīrī', country: 'pk', place: 'Lahore', died: 465, order: 'Junaydi', duas: 2 },
  { id: 'ansari', name: 'ʿAbdullāh Anṣārī of Herat', country: 'af', place: 'Herat', born: 396, died: 481, order: 'Hanbali', duas: 9 },
  { id: 'ghazali', name: 'Abū Ḥāmid al-Ghazālī', country: 'ir', place: 'Tus', born: 450, died: 505, order: 'Shafiʿi · Ashʿari', duas: 11 },

  { id: 'jilani', name: 'ʿAbd al-Qādir al-Jīlānī', country: 'iq', place: 'Baghdad', born: 470, died: 561, order: 'Qadiri', duas: 14 },
  { id: 'yasawi', name: 'Aḥmad Yasawī', country: 'kz', place: 'Turkistan', died: 562, order: 'Yasawi', duas: 0 },
  { id: 'abu-najib', name: 'Abū-l-Najīb al-Suhrawardī', country: 'iq', place: 'Baghdad', born: 490, died: 563, order: 'Suhrawardi', duas: 0 },
  { id: 'rifai', name: 'Aḥmad al-Rifāʿī', country: 'iq', place: 'Umm ʿAbida', born: 512, died: 578, order: 'Rifaʿi', duas: 6 },
  { id: 'sohrawardi-maqtul', name: 'Shihāb al-Dīn al-Suhrawardī', country: 'sy', place: 'Aleppo', born: 549, died: 587, order: 'Ishraqi', duas: 0 },

  { id: 'attar', name: 'Farīd al-Dīn ʿAṭṭār', country: 'ir', place: 'Nishapur', died: 618, order: 'Khurasani', duas: 0 },
  { id: 'kubra', name: 'Najm al-Dīn Kubrā', country: 'uz', place: 'Khwarazm', born: 540, died: 618, order: 'Kubrawi', duas: 3 },
  { id: 'ibn-mashish', name: 'ʿAbd al-Salām ibn Mashīsh', country: 'ma', place: 'Jabal al-ʿAlam', died: 625, order: 'Shadhili', duas: 1 },
  { id: 'ibn-farid', name: 'ʿUmar ibn al-Fāriḍ', country: 'eg', place: 'Cairo', born: 576, died: 632, order: 'Shadhili', duas: 0 },
  { id: 'umar-suhrawardi', name: 'ʿUmar al-Suhrawardī', country: 'iq', place: 'Baghdad', born: 539, died: 632, order: 'Suhrawardi', duas: 2 },
  { id: 'ibn-arabi', name: 'Muḥyī-l-Dīn Ibn ʿArabī', country: 'sy', place: 'Damascus', born: 560, died: 638, order: 'Akbari', duas: 8 },
  { id: 'abu-hasan-shadhili', name: 'Abū-l-Ḥasan al-Shādhilī', country: 'eg', place: 'Humaythra', born: 593, died: 656, order: 'Shadhili', duas: 12 },
  { id: 'baha-zakariya', name: 'Bahāʾ-ud-Dīn Zakariyā', country: 'pk', place: 'Multan', born: 566, died: 661, order: 'Suhrawardi', duas: 0 },
  { id: 'ganj-shakar', name: 'Farīd al-Dīn Ganj-i-Shakar', country: 'in', place: 'Pakpattan', born: 584, died: 664, order: 'Chishti', duas: 1 },
  { id: 'rumi', name: 'Jalāl al-Dīn Rūmī', country: 'tr', place: 'Konya', born: 604, died: 672, order: 'Mevlevi', duas: 0 },
  { id: 'qunawi', name: 'Ṣadr al-Dīn al-Qūnawī', country: 'tr', place: 'Konya', born: 606, died: 673, order: 'Akbari', duas: 0 },
  { id: 'mursi', name: 'Abū-l-ʿAbbās al-Mursī', country: 'eg', place: 'Alexandria', born: 616, died: 686, order: 'Shadhili', duas: 5 },

  { id: 'ibn-ata-allah', name: 'Ibn ʿAṭāʾ Allāh al-Iskandarī', country: 'eg', place: 'Cairo', died: 709, order: 'Shadhili', duas: 10 },
  { id: 'khusraw', name: 'Amīr Khusraw', country: 'in', place: 'Delhi', born: 651, died: 725, order: 'Chishti', duas: 0 },
  { id: 'nizamuddin', name: 'Niẓām al-Dīn Awliyāʾ', country: 'in', place: 'Delhi', born: 636, died: 725, order: 'Chishti', duas: 4 },
  { id: 'simnani', name: 'ʿAlāʾ al-Dawla Simnānī', country: 'ir', place: 'Simnan', born: 659, died: 736, order: 'Kubrawi', duas: 0 },
  { id: 'hamadani', name: 'Sayyid ʿAlī Hamadānī', country: 'ir', place: 'Kashmir', born: 714, died: 786, order: 'Kubrawi', duas: 2 },
  { id: 'naqshband', name: 'Bahāʾ al-Dīn Naqshband', country: 'uz', place: 'Bukhara', born: 718, died: 791, order: 'Naqshbandi', duas: 7 },
  { id: 'hafez', name: 'Khwāja Shams al-Dīn Ḥāfeẓ', country: 'ir', place: 'Shiraz', died: 792, order: 'Shirazi', duas: 0 },

  { id: 'jazuli', name: 'Muḥammad al-Jazūlī', country: 'ma', place: 'Marrakesh', died: 870, order: 'Shadhili · Jazuli', duas: 9 },
  { id: 'ahrar', name: 'ʿUbaydullāh Aḥrār', country: 'uz', place: 'Samarkand', born: 806, died: 895, order: 'Naqshbandi', duas: 0 },
  { id: 'jami', name: 'ʿAbd al-Raḥmān Jāmī', country: 'af', place: 'Herat', born: 817, died: 898, order: 'Naqshbandi', duas: 1 },
  { id: 'zarruq', name: 'Aḥmad Zarrūq', country: 'ly', place: 'Misrata', born: 846, died: 899, order: 'Shadhili', duas: 6 },

  { id: 'zakariyya-ansari', name: 'Zakariyyā al-Anṣārī', country: 'eg', place: 'Cairo', born: 823, died: 926, order: 'Shafiʿi', duas: 3 },
  { id: 'sharani', name: 'ʿAbd al-Wahhāb al-Shaʿrānī', country: 'eg', place: 'Cairo', born: 898, died: 973, order: 'Shadhili', duas: 8 },

  { id: 'sirhindi', name: 'Aḥmad al-Sirhindī', country: 'in', place: 'Sirhind', born: 971, died: 1034, order: 'Naqshbandi', duas: 2 },
  { id: 'kurani', name: 'Ibrāhīm al-Kūrānī', country: 'sa', place: 'Medina', born: 1025, died: 1101, order: 'Shattari', duas: 0 },

  { id: 'nabulsi', name: 'ʿAbd al-Ghanī al-Nābulusī', country: 'sy', place: 'Damascus', born: 1050, died: 1143, order: 'Naqshbandi · Qadiri', duas: 4 },
  { id: 'mustafa-bakri', name: 'Muṣṭafā al-Bakrī', country: 'sy', place: 'Damascus', born: 1099, died: 1162, order: 'Khalwati', duas: 5 },
  { id: 'shah-waliullah', name: 'Shāh Walīullāh Dehlawī', country: 'in', place: 'Delhi', born: 1114, died: 1176, order: 'Naqshbandi', duas: 3 },

  { id: 'tijani', name: 'Aḥmad al-Tijānī', country: 'dz', place: 'Fes', born: 1150, died: 1230, order: 'Tijani', duas: 11 },
  { id: 'usman-dan-fodio', name: 'ʿUthmān ɗan Fodio', country: 'ng', place: 'Sokoto', born: 1168, died: 1232, order: 'Qadiri', duas: 0 },
  { id: 'khalid-baghdadi', name: 'Khālid al-Baghdādī', country: 'iq', place: 'Damascus', born: 1193, died: 1242, order: 'Naqshbandi-Khalidi', duas: 0 },
  { id: 'ibn-idris', name: 'Aḥmad ibn Idrīs', country: 'ye', place: 'Sabya', born: 1173, died: 1253, order: 'Idrisi', duas: 6 },
  { id: 'mirghani', name: 'Muḥammad ʿUthmān al-Mīrghanī', country: 'sd', place: 'Mecca', born: 1208, died: 1268, order: 'Khatmiyya', duas: 2 },

  { id: 'ahmadu-bamba', name: 'Aḥmadu Bamba', country: 'sn', place: 'Touba', born: 1270, died: 1346, order: 'Muridiyya', duas: 7 },
  { id: 'alawi', name: 'Aḥmad al-ʿAlawī', country: 'dz', place: 'Mostaganem', born: 1291, died: 1353, order: 'Darqawi-ʿAlawi', duas: 3 },
  { id: 'said-nursi', name: 'Bediüzzaman Said Nursî', country: 'tr', place: 'Urfa', born: 1295, died: 1379, order: 'Nurcu', duas: 0 },
  { id: 'nda-salati', name: 'Aḥmad al-Rifāʿī (Nda Salatī)', country: 'ng', place: 'Ilorin', died: 1385, order: 'Qadiri', duas: 0 },
  { id: 'ibrahim-niasse', name: 'Ibrāhīm Niasse', country: 'sn', place: 'Kaolack', born: 1318, died: 1395, order: 'Tijani', duas: 9 },

  { id: 'nasiru-kabara', name: 'Muḥammad Nāṣir Kabara', country: 'ng', place: 'Kano', born: 1330, died: 1417, order: 'Qadiri · Nasiriyya', duas: 0 },
];

export const SAINTS_TOTAL = SAINTS.length;

export function saintAt(id: string): Saint {
  return SAINTS.find((s) => s.id === id) ?? SAINTS[0];
}

export type Century = { century: number; label: string; rows: Saint[] };

export function byCentury(rows: Saint[] = SAINTS): Century[] {
  const map = new Map<number, Saint[]>();
  for (const s of rows) {
    const c = centuryOf(s.died);
    const bucket = map.get(c);
    if (bucket) bucket.push(s);
    else map.set(c, [s]);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([century, list]) => ({
      century,
      label: centuryLabel(century).toUpperCase(),
      rows: list.sort((a, b) => a.died - b.died),
    }));
}

export type Life = {
  bio: string;
  note: string;
  knownFor: string[];
  readOn: { title: string; meta: string }[];
  source: string;
};

const LIVES: Record<string, Life> = {
  rumi: {
    bio: 'Born in Balkh and brought west as a child ahead of the Mongol advance, he taught law and preached in Konya until his meeting with Shams of Tabriz in 642 AH turned a jurist into a poet. The Mathnawi and the Divan were dictated over the thirty years that followed, most of it walking, some of it turning.',
    note: 'Nothing here is offered to recite. What he left is read — a long poem in couplets and a body of letters and talks — and the order that carries his name keeps his practice rather than a wording of his.',
    knownFor: ['The Mathnawi', 'Samāʿ', 'The letters'],
    readOn: [
      { title: 'The full life', meta: '14 minutes' },
      { title: 'Konya, 604 – 672 AH', meta: 'Timeline · 9 events' },
      { title: 'Teachers and students', meta: '6 lives in Wasīla' },
    ],
    source:
      'Biography drawn from Aflaki and Sipahsalar. Wasīla describes what was written about him; it does not ask anything of him.',
  },
  'usman-dan-fodio': {
    bio: 'A Fulani scholar and teacher of the Qadiriyya, born at Maratta in Gobir and trained in the Hausa scholarly circuits of the eighteenth century CE. His preaching tours from 1188 AH onward drew a community around him; the break with Gobir in 1218 AH led to the hijra to Gudu and the war that founded the Sokoto Caliphate. He left the administration to his brother ʿAbdullāhi and his son Muḥammad Bello and returned to teaching and writing, and died at Sokoto.',
    note: 'He wrote in Arabic, Fulfulde and Hausa, and a large body of qasidas and litanies circulates under his name in Nigeria and beyond. None of it is carried in Wasīla yet, and this life is read rather than recited.',
    knownFor: ['Iḥyāʾ al-sunna', 'The Sokoto Caliphate', 'Qadiri teaching'],
    readOn: [
      { title: 'The full life', meta: 'Reading' },
      { title: 'Degel and Sokoto, 1168 – 1232 AH', meta: 'Timeline' },
      { title: 'Teachers and students', meta: 'Linked lives' },
    ],
    source:
      'Biography drawn from his own works and from Muḥammad Bello\'s Infāq al-maysūr. Wasīla describes what was written about him; it does not ask anything of him.',
  },
  'nda-salati': {
    bio: 'Aḥmad al-Rifāʿī ibn Abī Bakr, known in Ilorin as Nda Salatī, was born in the town in the 1310s AH and became the figure through whom the Qadiriyya spread across Ilorin and Yorubaland. He built the first Qadiriyya zawiya in Ilorin in front of his own house, and it became the meeting point for the order across Nigeria and the countries around it. He died on a Thursday in Dhū-l-Ḥijja 1385 AH.',
    note: 'He is remembered for a practice rather than a text — public dhikr with the bandīr, and the mawlid of ʿAbd al-Qādir al-Jīlānī — and for the students he licensed to teach. Nothing of his wording is carried in Wasīla.',
    knownFor: ['The Ilorin zawiya', 'Qadiri dhikr', 'Ijāzas'],
    readOn: [
      { title: 'The full life', meta: 'Reading' },
      { title: 'Ilorin, d. 1385 AH', meta: 'Timeline' },
      { title: 'Teachers and students', meta: 'Linked lives' },
    ],
    source:
      'Biography drawn from local Ilorin accounts of the Qadiriyya. Birth year uncertain — the sources give a range. Wasīla describes what was written about him; it does not ask anything of him.',
  },
  'nasiru-kabara': {
    bio: 'Born at Guringawa outside Kano and schooled in the city\'s scholarly houses, he took the Kuntiyya and Ahl al-Bayt lines of the Qadiriyya and spent the years after his studies drawing the order\'s scattered branches in Kano into one body. From the late 1370s AH he was recognised as the head of the Qadiriyya in Kano and then across West Africa, and founded the Darul Qadiriyya that is still its centre. He died in Jumādā I 1417 AH and was succeeded by his son Qarībullāh.',
    note: 'He wrote widely in Arabic — poetry, the sciences of the order, and works on the Qadiri litanies — and set the Kano style of dhikr with the drum. Wasīla carries none of his wording yet; this life is read.',
    knownFor: ['Darul Qadiriyya, Kano', 'Qadiriyya Nasiriyya', 'Arabic verse'],
    readOn: [
      { title: 'The full life', meta: 'Reading' },
      { title: 'Kano, 1330 – 1417 AH', meta: 'Timeline' },
      { title: 'Teachers and students', meta: 'Linked lives' },
    ],
    source:
      'Biography drawn from the Kano Qadiriyya sources and the Bayero University studies of his life. Wasīla describes what was written about him; it does not ask anything of him.',
  },
};

export function lifeOf(s: Saint): Life {
  const written = LIVES[s.id];
  if (written) return written;
  const years = s.born ? `${s.born} – ${s.died} AH` : `d. ${s.died} AH`;
  return {
    bio: `${s.name} lived and taught at ${s.place}, and died there in ${s.died} AH. He is placed in the ${s.order} line, and the century's biographical dictionaries carry his name among the teachers of that place.`,
    note:
      s.duas > 0
        ? 'What is attributed to him in Wasīla sits under his duas below, each with the collection it was taken from.'
        : 'Nothing here is offered to recite. Most of the lives in Wasīla are read rather than recited, and this is one of them.',
    knownFor: [s.order.split(' · ')[0], s.place, years],
    readOn: [
      { title: 'The full life', meta: 'Reading' },
      { title: `${s.place}, ${years}`, meta: 'Timeline' },
      { title: 'Teachers and students', meta: 'Linked lives' },
    ],
    source:
      'Biography drawn from the classical biographical dictionaries. Wasīla describes what was written about him; it does not ask anything of him.',
  };
}
