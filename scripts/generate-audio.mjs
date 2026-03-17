/**
 * ElevenLabs batch audio generator — Chess Island Adventures
 *
 * Minden karakternek saját hangja van, plusz egy külön Narrátor hang.
 *
 * Hangok szerepe:
 *   narrator  → történet, mozgás leírás, kaland, kvíz kérdések, onboarding szöveg
 *   karakter  → mondóka (vers), dal  (a karakter saját hangján szólal meg)
 *
 * ── Futtatás ──────────────────────────────────────────────────────────────────
 *   node scripts/generate-audio.mjs --dry-run          # mindent megmutat, API hívás nélkül
 *   node scripts/generate-audio.mjs                    # generál (env változók kellenek)
 *   node scripts/generate-audio.mjs --only=erno        # csak Ernő hangjai
 *   node scripts/generate-audio.mjs --force            # meglévő fájlokat is felülírja
 *
 * ── Környezeti változók ───────────────────────────────────────────────────────
 *   ELEVENLABS_API_KEY=sk-...
 *
 *   VOICE_NARRATOR=<voice_id>   # semleges, meleg narrátor hang
 *   VOICE_BENCE=<voice_id>      # fiatal fiú hang  (Kitartás)
 *   VOICE_ERNO=<voice_id>       # határozott férfi (Becsületesség)
 *   VOICE_SZONJA=<voice_id>     # kreatív nő      (Kreativitás)
 *   VOICE_HUBA=<voice_id>       # élénk fiú       (Okosság)
 *   VOICE_VANDA=<voice_id>      # meleg nő        (Empátia)
 *   VOICE_BALAZS=<voice_id>     # bölcs férfi     (Bölcsesség)
 *
 * ── Hangok keresése ───────────────────────────────────────────────────────────
 *   https://elevenlabs.io/app/voice-lab  →  "Voice Library" tab
 *   Magyar / multilingual hangok szűrése ajánlott.
 */

import fs   from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT    = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'Hangok');

const API_KEY  = process.env.ELEVENLABS_API_KEY;
const DRY_RUN  = process.argv.includes('--dry-run');
const FORCE    = process.argv.includes('--force');
const ONLY_ARG = (process.argv.find(a => a.startsWith('--only=')) ?? '').replace('--only=', '') || null;

// ── Voice ID-k per szereplő ───────────────────────────────────────────────────
const VOICES = {
  narrator: process.env.VOICE_NARRATOR ?? '',
  bence:    process.env.VOICE_BENCE    ?? '',
  erno:     process.env.VOICE_ERNO     ?? '',
  szonja:   process.env.VOICE_SZONJA   ?? '',
  huba:     process.env.VOICE_HUBA     ?? '',
  vanda:    process.env.VOICE_VANDA    ?? '',
  balazs:   process.env.VOICE_BALAZS   ?? '',
};

// ── Szereplők adatai ──────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: 'bence', dir: 'Bence',
    virtue: 'Kitartás', voice: 'young boy / fiatal fiú',
    poem:      'Kicsi vagyok, de nem adom fel,\nEgy lépés előre, ez a jelszavam!\nHa elérem a túlsó oldalt,\nVezérré válok, ez a hatalmam!',
    story:     'Bence a legkisebb figura a sakktáblán. Ő a gyalog, aki mindig csak előre tud lépni. De ne becsüld le! Ha kitartó és bátor, és eléri a tábla túlsó szélét, valami csodálatos dolog történik...',
    movement:  'Nézd, ahogy Bence egyenesen megy előre — soha vissza, soha oldalra, csak előre! Ő tudja, hogy a kitartásnak egyetlen iránya van. Ha megpróbálná elkerülni az akadályokat, soha nem érne a tábla végére — és nem változhatna vezérré.',
    adventure: 'Egy nap Bence elindult a sakktáblán. Egyesével lépkedett előre. Útközben akadályokba ütközött, de nem adta fel. Előre! — kiáltotta magabiztosan. Végül elérte a tábla szélét, és vezérré változott!',
    song:      'Bence, Bence, kis gyalog, Mindig előre halad! Egy lépés, két lépés, Soha meg nem áll!',
    quiz: [
      'Merre léphet a gyalog?',
      'Hányat léphet a gyalog az első lépésnél?',
      'Hogyan üt a gyalog?',
      'Mit érzett Bence, amikor akadályba ütközött?',
      'Mi történik, ha a gyalog eléri a túlsó oldalt?',
      'Bence 3 lépést tett, aztán még 2-t. Összesen hányat lépett?',
    ],
  },
  {
    id: 'erno', dir: 'Erno',
    virtue: 'Becsületesség', voice: 'határozott felnőtt férfi',
    poem:      'Egyenesen megyek én,\nFelfelé és lefelé!\nBalra, jobbra, mint a szél,\nSenki engem meg nem áll!',
    story:     'Ernő a bástya, erős és megbízható. Ő mindig egyenesen megy — előre, hátra, balra vagy jobbra. Soha nem tér le az útjáról, mert becsületes és megbízható.',
    movement:  'Figyeld meg, milyen egyenes vonalban halad Ernő! Ő soha nem kanyarodik, soha nem lopakodik el titokban — mert a becsületes ember pontosan oda megy, ahova mondja. Egyenesen, határozottan: előre, hátra, balra, jobbra — az egész sor az övé.',
    adventure: 'Ernő meghallotta, hogy Bence bajba került! Egyenesen indult el, végig a soron, hogy megmentse barátját. Egyenesen! — mondta határozottan, és egy szempillantás alatt ott termett.',
    song:      'Ernő bástya, erős és nagy, Egyenesen megy, soha nem hagy! Plusz jelet rajzol az úton, Becsületes minden húzzon!',
    quiz: [
      'Hogyan mozog a bástya?',
      'Hány mezőt léphet a bástya?',
      'Milyen jelet rajzol a bástya útja?',
      'Miért fontos a becsületesség, mint Ernőnél?',
      'A sakktáblán 8 sor és 8 oszlop van. Hány mező van összesen?',
      'Ernő 5 mezőt lépett jobbra, aztán 3-at balra. Hány mezőre van a kiindulási ponttól?',
    ],
  },
  {
    id: 'szonja', dir: 'Szonja',
    virtue: 'Kreativitás', voice: 'kreatív, vidám nő',
    poem:      'Átlósan szaladok én,\nSzínes mezőkön át!\nMindig ugyanazon a színen,\nEz az én világom, lásd!',
    story:     'Szonja a futó, aki mindig átlósan mozog. Ő kreatív és művészi lélek — az ő útja az X mintát rajzolja a táblára. De van egy titka: mindig ugyanazon a színű mezőn marad!',
    movement:  'Nézd, ahogy Szonja átlósan surran a táblán, mindig ugyanazon a színű mezőn! Ő azért marad a saját színén, mert a kreativitás is így működik: ha megtalálod a saját utadat, azon messzire jutsz. Az X-mintát, amit maga mögött hagy, ő festménynek látja.',
    adventure: 'Szonja egy nap festeni akart a sakktáblán. Átlósan szaladt, és gyönyörű X mintákat rajzolt. Nézd, milyen szép! — kiáltotta boldogan. A többi figura csodálta az alkotását.',
    song:      'Szonja futó, mint a szél, Átlósan fut, sose fél! X-et rajzol lábával, Színes álmok szárnyával!',
    quiz: [
      'Hogyan mozog a futó?',
      'Milyen színű mezőn marad mindig a futó?',
      'Milyen mintát rajzol a futó?',
      'Miért jó kreatívnak lenni, mint Szonja?',
      'Rajzolj X-et! Hány vonalból áll az X betű?',
    ],
  },
  {
    id: 'huba', dir: 'Huba',
    virtue: 'Okosság', voice: 'élénk, ügyes fiú',
    poem:      'L-betűt ugrik a lovam,\nÁtugorja mind, aki van!\nSenki más nem tud ilyet,\nEz az én különleges lépésem!',
    story:     'Huba a huszár — a legkülönlegesebb figura! Ő L-alakban ugrik, és ő az egyetlen, aki átugorhat más figurákat. Huba mindig kitalál valamit, amikor a helyzet nehéz!',
    movement:  'Figyeld meg jól — Huba nem egyenesen és nem átlósan megy, hanem L-betűt ugrik! Kettőt előre, egyet oldalra: így ugrik át a falakon, amelyeket más meg sem közelít. Az okos megoldás mindig ott van, ahol senki sem keresi.',
    adventure: 'A figurák egy nagy falnál álltak, és senki sem tudott átmenni. De Huba csak elmosolyodott: Hoppsza! — kiáltotta, és L-alakban átugrotta a falat! Mindenki csodálkozott.',
    song:      'Huba huszár, hoppsza-hé! L-betűt ugrik, nézd csak né! Átugorja mind a falat, Ötletes kis kalandot ad!',
    quiz: [
      'Milyen alakban ugrik a huszár?',
      'Mi a különleges a huszárban?',
      'A huszár L-je: hány mezőt lép egy irányba?',
      'Mit tett Huba, amikor a többiek nem tudtak tovább menni?',
      'Huba 2-t ugrik előre és 1-et jobbra. Összesen hány mezőt halad?',
    ],
  },
  {
    id: 'vanda', dir: 'Vanda',
    virtue: 'Empátia', voice: 'meleg, empatikus nő',
    poem:      'Minden irányba mehetek,\nEgyenesen és átlósan is!\nÉn vagyok a legerősebb,\nDe a szívem a legfontosabb kincs!',
    story:     'Vanda a vezér — a legerősebb figura a táblán! Ő bármerre mehet: egyenesen és átlósan is. De Vanda tudja, hogy az igazi erő nem a hatalom, hanem az empátia.',
    movement:  'Nézd, ahogy Vanda mindenfelé indul — előre, hátra, oldalra és átlósan is, akármilyen messzire! Ő azért mehet minden irányba, mert az empatikus szív megérzi, hol van szükség rá. Egyetlen figura sem marad egyedül, ha Vanda a táblán van.',
    adventure: 'Vanda látta, hogy a kis figurák szomorúak. Odament mindegyikhez, és meghallgatta őket. Együtt! — mondta kedvesen. Aztán segített mindenkinek, mert ő minden irányba el tudott jutni.',
    song:      'Vanda vezér, aranyos szív, Minden irányba elrepül! Egyenesen, átlósan is, Segít mindenkinek, mert szeret!',
    quiz: [
      'Merre mehet a vezér?',
      'Melyik két figura képességét egyesíti a vezér?',
      'Mit jelent az empátia, amit Vanda mutat?',
      'Miért hallgatta meg Vanda a kis figurákat?',
      'Vanda mehet egyenesen 4 irányba és átlósan 4 irányba. Összesen hány irányba mehet?',
    ],
  },
  {
    id: 'balazs', dir: 'Balazs',
    virtue: 'Bölcsesség', voice: 'bölcs, nyugodt idősebb férfi',
    poem:      'Csak egy lépést teszek én,\nDe bölcsen és lassan!\nVigyázzatok rám, barátaim,\nMert nélkülem vége a játéknak!',
    story:     'Balázs a király — a legfontosabb figura! Csak egyet léphet bármerre, de ő a legbölcsebb mindnyájuk közül. Ha Balázst elfogják, vége a játéknak. Ezért a többiek mind vigyáznak rá.',
    movement:  'Figyeld meg, hogy Balázs csak egyet lép — de minden egyes lépése előtt megáll, és megnéz mindent maga körül. A bölcs király tudja: nem a sebesség számít, hanem a megfelelő irány. Egy jó lépés többet ér, mint tíz kapkodó.',
    adventure: 'Balázs az Egyensúly Fája alatt ült és gondolkodott. Minden figura fontos — mondta bölcsen. A kis Bence épp olyan fontos, mint a nagy Vanda. A többiek megértették: csak együtt győzhetnek.',
    song:      'Balázs király, bölcs és jó, Egy lépés neki is elég! Lassan jár, messzire lát, És vigyáz az egész seregre!',
    quiz: [
      'Hányat léphet a király?',
      'Mi történik, ha a királyt elfogják?',
      'Mit jelent a sakk?',
      'Mit mondott Balázs: kik fontosak a csapatban?',
      'Miért fontos a bölcsesség?',
      'A király 1-et léphet minden irányba. Hány mezőre léphet maximum a tábla közepéről?',
    ],
  },
];

// Onboarding — mind narrátor hang
const ONBOARDING = [
  { path: 'ValasszHost/mainText.mp3', text: 'Válassz egy figurát! Melyik a kedvenced?' },
  { path: 'ValasszHost/bence.mp3',  text: 'Bence a gyalog. Kicsi, de kitartó — soha nem adja fel, mindig csak előre megy!' },
  { path: 'ValasszHost/erno.mp3',   text: 'Ernő a bástya. Erős és becsületes — egyenesen megy, és mindig azt mondja, amit gondol!' },
  { path: 'ValasszHost/szonja.mp3', text: 'Szonja a futó. Kreatív és különleges — átlósan suhan, és mindig megtalálja a saját útját!' },
  { path: 'ValasszHost/huba.mp3',   text: 'Huba a huszár. Okos és ügyes — L-alakban ugrik át mindenen, amit más meg sem közelít!' },
  { path: 'ValasszHost/vanda.mp3',  text: 'Vanda a vezér. Empatikus és erős — minden irányba elér, hogy segítsen barátainak!' },
  { path: 'ValasszHost/balazs.mp3', text: 'Balázs a király. Bölcs és megfontolt — csak egyet lép, de mindig a legjobb irányba!' },
];

// ── Manifest építés ───────────────────────────────────────────────────────────
// voice: 'narrator' | karakterId  →  meghatározza melyik VOICES[x] ID-t használja
function buildManifest() {
  const entries = [];

  for (const ch of CHAPTERS) {
    const c = ch.dir;

    // Karakter saját hangján: mondóka + dal
    entries.push({ path: `${c}/${c}Mondoka.mp3`,     text: ch.poem,      voice: ch.id, label: `${ch.id} mondóka` });
    entries.push({ path: `${c}/${c}Dala.mp3`,         text: ch.song,      voice: ch.id, label: `${ch.id} dal` });

    // Narrátor hangján: történet, mozgás, kaland
    entries.push({ path: `${c}/Narrator${c}1.mp3`,   text: ch.story,     voice: 'narrator', label: `${ch.id} történet` });
    entries.push({ path: `${c}/Narrator${c}2.mp3`,   text: ch.movement,  voice: 'narrator', label: `${ch.id} mozgás leírás` });
    entries.push({ path: `${c}/Narrator${c}3.mp3`,   text: ch.adventure, voice: 'narrator', label: `${ch.id} kaland` });

    // Narrátor hangján: kvíz kérdések
    ch.quiz.forEach((q, i) => {
      if (!q) return;
      entries.push({ path: `${c}/${c}Kviz${i + 1}.mp3`, text: q, voice: 'narrator', label: `${ch.id} kvíz ${i + 1}` });
    });
  }

  // Onboarding — narrátor
  for (const o of ONBOARDING) {
    entries.push({ path: o.path, text: o.text, voice: 'narrator', label: `onboarding ${path.basename(o.path)}` });
  }

  return entries;
}

// ── Ellenőrzés & cost becslés ─────────────────────────────────────────────────
function costReport(manifest) {
  // Összesített karakter szám voice-onként
  const charsByVoice = {};
  for (const e of manifest) {
    charsByVoice[e.voice] = (charsByVoice[e.voice] ?? 0) + e.text.length;
  }
  const totalChars = Object.values(charsByVoice).reduce((a, b) => a + b, 0);

  console.log('\n📊  Karakterszám becslés (ElevenLabs API cost):');
  console.log('─'.repeat(54));

  const voiceOrder = ['narrator', ...CHAPTERS.map(c => c.id)];
  for (const v of voiceOrder) {
    if (!charsByVoice[v]) continue;
    const ch = CHAPTERS.find(c => c.id === v);
    const desc = v === 'narrator' ? 'Narrátor' : `${ch.dir} (${ch.virtue})`;
    const id = VOICES[v] ? `ID: ${VOICES[v].slice(0, 8)}…` : '⚠ nincs beállítva';
    console.log(`  ${desc.padEnd(24)} ${String(charsByVoice[v]).padStart(5)} kar.   ${id}`);
  }

  console.log('─'.repeat(54));
  console.log(`  ÖSSZESEN                 ${String(totalChars).padStart(5)} karakter`);
  console.log();

  // ElevenLabs árak 2025 (eleven_multilingual_v2)
  // Ingyenes tier: 10 000 kar/hó
  // Starter: $5/hó → 30 000 kar
  // Creator: $22/hó → 100 000 kar
  const FREE_TIER   = 10_000;
  const STARTER_USD = 5;
  const STARTER_KAR = 30_000;
  const CREATOR_USD = 22;
  const CREATOR_KAR = 100_000;

  console.log('💰  Becsült API költség (egyszeri generálás):');
  console.log('─'.repeat(54));
  if (totalChars <= FREE_TIER) {
    console.log(`  ✅  INGYENES tier belefér (${totalChars} / ${FREE_TIER} kar)`);
  } else if (totalChars <= STARTER_KAR) {
    const pct = ((totalChars / STARTER_KAR) * 100).toFixed(0);
    console.log(`  💚  Starter plan ($${STARTER_USD}/hó) → ${pct}% felhasználás`);
    console.log(`      (${totalChars} / ${STARTER_KAR} kar)`);
  } else {
    console.log(`  🟡  Creator plan ($${CREATOR_USD}/hó) szükséges`);
    console.log(`      (${totalChars} / ${CREATOR_KAR} kar)`);
  }
  console.log(`  ⚡  Futási idő: ~${Math.ceil(manifest.length * 0.35 / 60)} perc (350ms/hívás)`);
  console.log();

  console.log('🔑  Hang konfiguráció ajánlás:');
  console.log('─'.repeat(54));
  const hints = [
    ['VOICE_NARRATOR', 'Semleges, meleg mesemondó hang (pl. "Callum", "Matilda")'],
    ['VOICE_BENCE',    'Fiatal fiú, lelkes, kitartó (pl. "Charlie", "Ethan")'],
    ['VOICE_ERNO',     'Határozott felnőtt férfi (pl. "George", "Daniel")'],
    ['VOICE_SZONJA',   'Vidám, kreatív nő (pl. "Alice", "Freya")'],
    ['VOICE_HUBA',     'Élénk, ügyes fiú (pl. "Harry", "Liam")'],
    ['VOICE_VANDA',    'Meleg, empatikus nő (pl. "Grace", "Sarah")'],
    ['VOICE_BALAZS',   'Bölcs, nyugodt idősebb férfi (pl. "Arnold", "Clyde")'],
  ];
  for (const [k, desc] of hints) {
    const set = process.env[k] ? `✅ ${process.env[k].slice(0,8)}…` : '⚠ nincs beállítva';
    console.log(`  ${k.padEnd(18)} ${set}`);
    console.log(`  ${''.padEnd(18)} ${desc}`);
  }
  console.log();
  console.log('  👉  Hangok böngészése: https://elevenlabs.io/app/voice-lab');
  console.log('      Szűrj: Language=Hungarian vagy Use case=Narration');
  console.log();
}

// ── ElevenLabs API hívás ──────────────────────────────────────────────────────
function generateSpeech(text, voiceId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
    });
    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'audio/mpeg',
      },
    };
    const req = https.request(options, res => {
      if (res.statusCode !== 200) {
        let err = '';
        res.on('data', d => err += d);
        res.on('end', () => reject(new Error(`ElevenLabs ${res.statusCode}: ${err}`)));
        return;
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const allManifest = buildManifest();

  // --only szűrő
  const manifest = ONLY_ARG
    ? allManifest.filter(e => e.voice === ONLY_ARG || e.label.includes(ONLY_ARG))
    : allManifest;

  console.log('\n🎙  Chess Island Adventures — ElevenLabs Audio Generator');
  console.log(`   Fájlok: ${manifest.length}  |  ${DRY_RUN ? 'DRY RUN' : 'ÉLO generálás'}`);

  costReport(manifest);

  if (!DRY_RUN) {
    // Validálás
    if (!API_KEY) {
      console.error('❌  ELEVENLABS_API_KEY hiányzik.'); process.exit(1);
    }
    const missingVoices = [...new Set(manifest.map(e => e.voice))].filter(v => !VOICES[v]);
    if (missingVoices.length) {
      console.error(`❌  Hiányzó voice ID-k: ${missingVoices.map(v => `VOICE_${v.toUpperCase()}`).join(', ')}`);
      console.error('    Állítsd be a fenti környezeti változókat és próbáld újra.');
      process.exit(1);
    }
  }

  let generated = 0, skipped = 0, errors = 0;

  for (let i = 0; i < manifest.length; i++) {
    const e       = manifest[i];
    const outPath = path.join(OUT_DIR, e.path);
    const exists  = fs.existsSync(outPath);
    const prefix  = `[${String(i + 1).padStart(2)}/${manifest.length}]`;
    const voiceTag = `(${e.voice})`.padEnd(10);

    if (exists && !FORCE) {
      console.log(`${prefix} ⏭  SKIP   ${voiceTag} ${e.path}`);
      skipped++; continue;
    }

    if (DRY_RUN) {
      console.log(`${prefix} 📝  WOULD  ${voiceTag} ${e.path}`);
      console.log(`${''.padEnd(8)} "${e.text.slice(0, 72).replace(/\n/g, ' ')}${e.text.length > 72 ? '…' : ''}"`);
      generated++; continue;
    }

    process.stdout.write(`${prefix} 🎤  GEN    ${voiceTag} ${e.path} … `);
    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const audio = await generateSpeech(e.text, VOICES[e.voice]);
      fs.writeFileSync(outPath, audio);
      console.log(`✅ ${(audio.length / 1024).toFixed(0)} KB`);
      generated++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }

    await delay(350); // ElevenLabs rate limit tiszteletben tartása
  }

  console.log('\n' + '─'.repeat(54));
  if (DRY_RUN) {
    console.log(`📋  Generálna: ${generated} fájlt  |  Kihagyna: ${skipped} meglévőt`);
  } else {
    console.log(`✅  Generált: ${generated}  |  ⏭ Kihagyott: ${skipped}${errors ? `  |  ❌ Hiba: ${errors}` : ''}`);
  }
  console.log();
}

main().catch(err => { console.error(err); process.exit(1); });
