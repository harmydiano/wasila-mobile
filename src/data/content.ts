import type { Category, Dhikr, DivineName, Verse, Reflection, Plan, SettingGroup, Dua } from '../types/models';

export const CATS: Category[] = [
  {
    id: 'rizq', icon: 'savings', title: 'Sustenance & provision', total: 0,
    sub: 'Benefits for opening provision, barakah in earnings and unexpected relief.',
    arabicSub: 'الرزق و الغنى',
    duas: [],
  },
  {
    id: 'debt', icon: 'credit_score', title: 'Debt & financial relief', total: 0,
    sub: 'For pressing debts, long-standing balances and ease in repayment.',
    arabicSub: 'الفرج و السداد',
    duas: [],
  },
  {
    id: 'protect', icon: 'shield', title: 'Protection', total: 0,
    sub: 'The home, travel, envy, and the protection of children.',
    arabicSub: 'الحفظ و الحماية',
    duas: [],
  },
  {
    id: 'health', icon: 'healing', title: 'Health & healing', total: 0,
    sub: 'Persistent pain, prolonged illness and strength after recovery.',
    arabicSub: 'الشفاء و الصحة',
    duas: [],
  },
  {
    id: 'status', icon: 'trending_up', title: 'Status & elevation', total: 0,
    sub: 'Rank at work, acceptance among people, honour and recognition.',
    arabicSub: 'الرفعة و الجاه',
    duas: [],
  },
  {
    id: 'family', icon: 'favorite', title: 'Marriage & family', total: 0,
    sub: 'Harmony between spouses, proposals, reconciliation and children.',
    arabicSub: 'المحبة و القبول',
    duas: [],
  },
  {
    id: 'birth', icon: 'child_friendly', title: 'Childbirth', total: 0,
    sub: 'Conception, protection through pregnancy and ease in labour.',
    arabicSub: 'الذرية و الولادة',
    duas: [],
  },
  {
    id: 'calm', icon: 'self_improvement', title: 'Anxiety & grief', total: 0,
    sub: 'A constricted chest, sleeplessness and persistent sadness.',
    arabicSub: 'السكينة و الراحة',
    duas: [],
  },
  {
    id: 'knowledge', icon: 'school', title: 'Knowledge & memory', total: 0,
    sub: 'Retention, understanding of difficult texts and clarity of speech.',
    arabicSub: 'الحفظ و الذكاء',
    duas: [],
  },
  {
    id: 'travel', icon: 'flight', title: 'Travel', total: 0,
    sub: 'Departure and return, borders, companionship and belongings.',
    arabicSub: 'السفر و الطريق',
    duas: [],
  },
];

export const DHIKR: Dhikr[] = [
  { name: 'Subḥānallāh', ar: 'سُبْحَانَ اللّٰه', count: '33' },
  { name: 'Alḥamdulillāh', ar: 'الْحَمْدُ لِلّٰه', count: '33' },
  { name: 'Allāhu akbar', ar: 'اللّٰهُ أَكْبَر', count: '34' },
  { name: 'Astaghfirullāh', ar: 'أَسْتَغْفِرُ اللّٰه', count: '100' },
  { name: 'Yā Laṭīf', ar: 'يَا لَطِيف', count: '1000' },
];

export const NAMES99: DivineName[] = [
  { ar: 'الرَّحْمٰن', tr: 'Ar-Raḥmān', meaning: 'The Most Compassionate', benefit: 'Softening of a hardened heart', count: '298×' },
  { ar: 'الرَّحِيم', tr: 'Ar-Raḥīm', meaning: 'The Most Merciful', benefit: 'Mercy in matters beyond your control', count: '258×' },
  { ar: 'الْمَلِك', tr: 'Al-Malik', meaning: 'The Sovereign', benefit: 'Authority and command over affairs', count: '90×' },
  { ar: 'الْقُدُّوس', tr: 'Al-Quddūs', meaning: 'The Most Holy', benefit: 'Purification of intention', count: '170×' },
  { ar: 'السَّلَام', tr: 'As-Salām', meaning: 'The Source of Peace', benefit: 'Recovery from prolonged illness', count: '131×' },
  { ar: 'الْمُؤْمِن', tr: 'Al-Muʾmin', meaning: 'The Giver of Security', benefit: 'Relief from a constricted chest', count: '136×' },
  { ar: 'الْعَزِيز', tr: 'Al-ʿAzīz', meaning: 'The Almighty', benefit: 'Strength before those who oppose you', count: '94×' },
  { ar: 'الْفَتَّاح', tr: 'Al-Fattāḥ', meaning: 'The Opener', benefit: 'Opening of closed doors', count: '489×' },
  { ar: 'الرَّزَّاق', tr: 'Ar-Razzāq', meaning: 'The Provider', benefit: 'Unexpected provision', count: '308×' },
  { ar: 'اللَّطِيف', tr: 'Al-Laṭīf', meaning: 'The Subtle', benefit: 'Increase in sustenance', count: '129×' },
  { ar: 'الْحَفِيظ', tr: 'Al-Ḥafīẓ', meaning: 'The Preserver', benefit: 'Protection on a journey', count: '998×' },
  { ar: 'الْوَدُود', tr: 'Al-Wadūd', meaning: 'The Loving', benefit: 'Affection between spouses', count: '1000×' },
  { ar: 'الشَّكُور', tr: 'Ash-Shakūr', meaning: 'The Appreciative', benefit: 'Recognition of long effort', count: '526×' },
  { ar: 'الرَّفِيع', tr: 'Ar-Rafīʿ', meaning: 'The Exalter of Rank', benefit: 'Elevation in rank at work', count: '351×' },
  { ar: 'الْمُعِزّ', tr: 'Al-Muʿizz', meaning: 'The Bestower of Honour', benefit: 'Honour and dignity', count: '117×' },
  { ar: 'الْبَاسِط', tr: 'Al-Bāsiṭ', meaning: 'The Expander', benefit: 'Removal of persistent sadness', count: '72×' },
  { ar: 'الْغَنِيّ', tr: 'Al-Ghanī', meaning: 'The Self-Sufficient', benefit: 'Settlement of long-standing debt', count: '1060×' },
  { ar: 'الْوَهَّاب', tr: 'Al-Wahhāb', meaning: 'The Bestower', benefit: 'Relief from a pressing debt', count: '100×' },
  { ar: 'الْعَلِيم', tr: 'Al-ʿAlīm', meaning: 'The All-Knowing', benefit: 'Retention of what is studied', count: '150×' },
  { ar: 'الْقَوِيّ', tr: 'Al-Qawiyy', meaning: 'The All-Strong', benefit: 'Strength after illness', count: '116×' },
  { ar: 'الْهَادِي', tr: 'Al-Hādī', meaning: 'The Guide', benefit: 'Guidance for a wayward child', count: '400×' },
  { ar: 'الْبَارِئ', tr: 'Al-Bāriʾ', meaning: 'The Originator', benefit: 'Conception after long waiting', count: '1000×' },
  { ar: 'الْمُهَيْمِن', tr: 'Al-Muhaymin', meaning: 'The Guardian over All', benefit: 'Ease at borders and checkpoints', count: '145×' },
  { ar: 'الْوَكِيل', tr: 'Al-Wakīl', meaning: 'The Trustee', benefit: 'Calm before a difficult meeting', count: '66×' },
];

export const FATIHAH: Verse[] = [
  { ar: 'الْحَمْدُ لِلّٰهِ رَبِّ الْعَالَمِين', tr: 'Al-ḥamdu lillāhi rabbi l-ʿālamīn', en: 'All praise belongs to Allah, Lord of all the worlds.' },
  { ar: 'الرَّحْمٰنِ الرَّحِيم', tr: 'Ar-raḥmāni r-raḥīm', en: 'The Most Compassionate, the Most Merciful.' },
  { ar: 'مَالِكِ يَوْمِ الدِّين', tr: 'Māliki yawmi d-dīn', en: 'Master of the Day of Judgement.' },
  { ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِين', tr: 'Iyyāka naʿbudu wa iyyāka nastaʿīn', en: 'You alone we worship, and from You alone we seek help.' },
  { ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيم', tr: 'Ihdinā ṣ-ṣirāṭa l-mustaqīm', en: 'Guide us along the straight path.' },
  { ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِم', tr: 'Ṣirāṭa lladhīna anʿamta ʿalayhim', en: 'The path of those You have blessed.' },
  { ar: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّين', tr: 'Ghayri l-maghḍūbi ʿalayhim wa lā ḍ-ḍāllīn', en: 'Not of those who earned anger, nor of those who went astray.' },
];

export const NEEDS = ['Provision', 'Debt relief', 'Protection', 'Health', 'Marriage', 'Children', 'Status', 'Peace of mind', 'Studies'];

export const REFL_POOL: Reflection[] = [
  { name: 'Yusuf Adeyemi', place: 'Lagos', d: 5, days: '2 weeks', stars: 5, body: 'I set it as my after-Fajr habit and have not missed a morning since. The counter is what kept me honest, before this I would lose track at forty and give up.' },
  { name: 'Aisha Bello', place: 'Kano', d: 12, days: '1 month', stars: 5, body: 'The transliteration and the audio together finally fixed my pronunciation. My husband noticed before I did.' },
  { name: 'Ibrahim Sesay', place: 'Freetown', d: 3, days: '9 days', stars: 4, body: 'Reciting this at the times listed has settled my mornings. I would have liked a little more on the source, but the instructions are clear.' },
  { name: 'Maryam Diallo', place: 'Dakar', d: 21, days: '3 months', stars: 5, body: 'Ninety days in. What changed most is my consistency, the reminder arrives and I simply do it now without negotiating with myself.' },
  { name: 'Abdulrahman Musa', place: 'Abuja', d: 30, days: '6 weeks', stars: 4, body: 'Straightforward and easy to return to daily. I keep it bookmarked and read the meaning slowly before I start the count.' },
  { name: 'Khadijah Omar', place: 'Mombasa', d: 45, days: '2 months', stars: 5, body: 'I had tried keeping this on paper for years. Having the count carry over between sittings is the whole difference.' },
];

export const PLANS: Plan[] = [
  { key: 'monthly', name: 'Monthly', note: 'Cancel any time', price: '$4.99', per: 'per month' },
  { key: 'yearly', name: 'Yearly', note: 'Four months free', price: '$39.99', per: '$3.33 / month' },
];

export const SETTING_GROUPS = (arabicSize: number, signedIn: boolean, premium: boolean, reciterName: string): SettingGroup[] => [
  { title: 'Prayer', rows: [
    { icon: 'public', label: 'Calculation method', value: 'MWL' },
    { icon: 'schedule', label: 'Manual adjustments', value: 'None' },
  ] },
  { title: 'Reading', rows: [
    { icon: 'translate', label: 'Transliteration', value: 'Shown' },
    { icon: 'format-size', label: 'Arabic size', value: `${arabicSize}px` },
    { icon: 'volume-up', label: 'Reciter', value: reciterName, action: 'reciter' },
  ] },
  { title: 'Account', rows: [
    { icon: 'person', label: signedIn ? 'Account' : 'Sign in', value: signedIn ? 'ibrahim@mail.com' : 'Not signed in', go: 'Auth' },
    { icon: 'workspace_premium', label: 'Subscription', value: premium ? 'Premium' : 'Free' },
    { icon: 'download', label: 'Offline content', value: 'Manage', go: 'ManageDownloads' },
  ] },
];

export const MORE_GROUPS: { title: string; items: { label: string; icon: string; go: string; tag?: string }[] }[] = [
  { title: 'Deen', items: [
    { label: 'Quran', icon: 'menu_book', go: 'Quran' }, { label: 'Duas', icon: 'volunteer_activism', go: 'Library' },
    { label: 'Qibla', icon: 'explore', go: 'Prayer' }, { label: 'Tasbih', icon: 'radio_button_checked', go: 'Tasbih' },
    { label: '99 Names', icon: 'grid_view', go: 'Names' }, { label: 'Personal zikr', icon: 'auto_awesome', go: 'Zikr', tag: 'Premium' },
  ] },
  { title: 'Tools', items: [
    { label: 'Prayer tracker', icon: 'checklist', go: 'Prayer' }, { label: 'Journal', icon: 'edit_note', go: 'More' },
    { label: 'Hijri calendar', icon: 'calendar_month', go: 'More' }, { label: 'Zakat calculator', icon: 'calculate', go: 'More' },
    { label: 'Mosques nearby', icon: 'location_on', go: 'More' }, { label: 'Halal check', icon: 'verified', go: 'More' },
  ] },
  { title: 'Account', items: [
    { label: 'Settings', icon: 'settings', go: 'Settings' }, { label: 'Help & sources', icon: 'help', go: 'More' },
  ] },
];

export const PRAYER_TIMES = [
  { name: 'Fajr', time: '5:12 AM', icon: 'wb-twilight' },
  { name: 'Sunrise', time: '6:31 AM', icon: 'light-mode' },
  { name: 'Zuhr', time: '12:58 PM', icon: 'mosque' },
  { name: 'Asr', time: '4:22 PM', icon: 'mosque' },
  { name: 'Maghrib', time: '7:04 PM', icon: 'nights-stay', next: true, note: 'in 1 hr 22 min' },
  { name: 'Isha', time: '8:18 PM', icon: 'bedtime' },
];

export const AGENDA = [
  { time: '5:12', title: 'Fajr', sub: 'Prayed', done: true, kind: 'prayer' },
  { time: '6:00', title: 'Retention of what is studied', sub: 'Yā ʿAlīm · 150', done: true, kind: 'dua' },
  { time: '12:58', title: 'Zuhr', sub: 'Prayed', done: true, kind: 'prayer' },
  { time: '16:22', title: 'Asr', sub: 'Prayed', done: true, kind: 'prayer' },
  { time: '19:04', title: 'Increase in sustenance', sub: 'Yā Laṭīf · 1000 · Day 3 of 7 · 340 done', done: false, kind: 'dua', catId: 'rizq', duaIdx: 0 },
  { time: '20:15', title: 'Protection of the home', sub: 'Al-Baqarah 1–5', done: false, kind: 'dua', catId: 'protect', duaIdx: 0 },
];

export const PRACTICES = [
  { catId: 'rizq', duaIdx: 0, title: 'Increase in sustenance', sub: '340 of 1,000 completed · After Maghrib', day: 3, totalDays: 7, progress: 0.34, broken: false },
  { catId: 'protect', duaIdx: 0, title: 'Protection of the home', sub: 'Completed today · Before sleep', day: 12, totalDays: 0, progress: 1, broken: false },
  { catId: 'status', duaIdx: 0, title: 'Elevation in rank at work', sub: 'Restart to keep your streak going', day: 6, totalDays: 21, progress: 0, broken: true },
];
