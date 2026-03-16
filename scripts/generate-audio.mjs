/**
 * ElevenLabs batch audio generator for Chess Island Adventures
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk-... ELEVENLABS_VOICE_ID=xyz node scripts/generate-audio.mjs
 *
 * Flags:
 *   --dry-run        Print all files that would be generated, without calling the API
 *   --force          Regenerate files that already exist
 *   --only=bence     Only generate audio for one character (bence|erno|szonja|huba|vanda|balazs|onboarding)
 *
 * Output: public/Hangok/<Character>/<filename>.mp3
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');
const OUT_DIR   = path.join(ROOT, 'public', 'Hangok');

const API_KEY   = process.env.ELEVENLABS_API_KEY;
const VOICE_ID  = process.env.ELEVENLABS_VOICE_ID;
const DRY_RUN   = process.argv.includes('--dry-run');
const FORCE     = process.argv.includes('--force');
const ONLY      = (process.argv.find(a => a.startsWith('--only=')) ?? '').replace('--only=', '') || null;

// ─── AUDIO MANIFEST ──────────────────────────────────────────────────────────
// Each entry: { path: string (relative to public/), text: string, label: string }

const chapters = [
  {
    id: 'bence',
    dir: 'Bence',
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
    id: 'erno',
    dir: 'Erno',
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
    id: 'szonja',
    dir: 'Szonja',
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
      '', // chapter 3 has only 5 quiz questions
    ],
  },
  {
    id: 'huba',
    dir: 'Huba',
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
      '', // chapter 4 has only 5 quiz questions
    ],
  },
  {
    id: 'vanda',
    dir: 'Vanda',
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
      '', // chapter 5 has only 5 quiz questions
    ],
  },
  {
    id: 'balazs',
    dir: 'Balazs',
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

const onboarding = [
  { path: 'ValasszHost/mainText.mp3',  text: 'Válassz egy figurát! Melyik a kedvenced?' },
  { path: 'ValasszHost/bence.mp3',     text: 'Bence a gyalog. Kicsi, de kitartó — soha nem adja fel, mindig előre megy!' },
  { path: 'ValasszHost/erno.mp3',      text: 'Ernő a bástya. Erős és becsületes — egyenesen megy, és mindig azt mondja, amit gondol!' },
  { path: 'ValasszHost/szonja.mp3',    text: 'Szonja a futó. Kreatív és különleges — átlósan suhan, és mindig megtalálja a saját útját!' },
  { path: 'ValasszHost/huba.mp3',      text: 'Huba a huszár. Okos és ügyes — L-alakban ugrik át mindenen, amit más meg sem közelít!' },
  { path: 'ValasszHost/vanda.mp3',     text: 'Vanda a vezér. Empatikus és erős — minden irányba elér, hogy segítsen barátainak!' },
  { path: 'ValasszHost/balazs.mp3',    text: 'Balázs a király. Bölcs és megfontolt — csak egyet lép, de mindig a legjobb irányba!' },
];

// Build flat manifest from all chapters
function buildManifest() {
  const entries = [];

  for (const ch of chapters) {
    const cap = ch.dir;

    entries.push({ path: `${cap}/${cap}Mondoka.mp3`,      text: ch.poem,      label: `${ch.id} – mondóka` });
    entries.push({ path: `${cap}/Narrator${cap}1.mp3`,    text: ch.story,     label: `${ch.id} – történet` });
    entries.push({ path: `${cap}/Narrator${cap}2.mp3`,    text: ch.movement,  label: `${ch.id} – mozgás leírás` });
    entries.push({ path: `${cap}/Narrator${cap}3.mp3`,    text: ch.adventure, label: `${ch.id} – kaland` });
    entries.push({ path: `${cap}/${cap}Dala.mp3`,         text: ch.song,      label: `${ch.id} – dal` });

    ch.quiz.forEach((q, i) => {
      if (!q) return; // skip empty quiz slots
      entries.push({ path: `${cap}/${cap}Kviz${i + 1}.mp3`, text: q, label: `${ch.id} – kvíz ${i + 1}` });
    });
  }

  for (const o of onboarding) {
    entries.push({ path: o.path, text: o.text, label: `onboarding – ${o.path}` });
  }

  return entries;
}

// ─── ElevenLabs API ───────────────────────────────────────────────────────────

function generateSpeech(text, apiKey, voiceId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${voiceId}`,
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
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

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const manifest = buildManifest();

  // Apply --only filter
  const filtered = ONLY
    ? manifest.filter(e => e.label.startsWith(ONLY) || e.path.toLowerCase().startsWith(ONLY.toLowerCase()))
    : manifest;

  console.log(`\n🎙  Chess Island Adventures — ElevenLabs Audio Generator`);
  console.log(`   Files to process: ${filtered.length}`);
  if (DRY_RUN) console.log(`   Mode: DRY RUN (no API calls)\n`);
  else console.log(`   Voice ID: ${VOICE_ID ?? '(not set)'}\n`);

  if (!DRY_RUN && !API_KEY) {
    console.error('❌  ELEVENLABS_API_KEY env variable is missing.');
    console.error('    Run: ELEVENLABS_API_KEY=sk-... ELEVENLABS_VOICE_ID=xyz node scripts/generate-audio.mjs');
    process.exit(1);
  }
  if (!DRY_RUN && !VOICE_ID) {
    console.error('❌  ELEVENLABS_VOICE_ID env variable is missing.');
    console.error('    Find your voice ID at https://elevenlabs.io/app/voice-lab');
    process.exit(1);
  }

  let generated = 0;
  let skipped   = 0;
  let errors    = 0;

  for (let i = 0; i < filtered.length; i++) {
    const entry  = filtered[i];
    const outPath = path.join(OUT_DIR, entry.path);
    const exists  = fs.existsSync(outPath);
    const prefix  = `[${String(i + 1).padStart(2, '0')}/${filtered.length}]`;

    if (exists && !FORCE) {
      console.log(`${prefix} ⏭  SKIP   ${entry.path}`);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`${prefix} 📝  WOULD  ${entry.path}`);
      console.log(`          "${entry.text.slice(0, 80).replace(/\n/g, ' ')}${entry.text.length > 80 ? '…' : ''}"`);
      generated++;
      continue;
    }

    process.stdout.write(`${prefix} 🎤  GEN    ${entry.path} … `);

    try {
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      const audio = await generateSpeech(entry.text, API_KEY, VOICE_ID);
      fs.writeFileSync(outPath, audio);
      console.log(`✅  (${(audio.length / 1024).toFixed(0)} KB)`);
      generated++;
    } catch (err) {
      console.log(`❌  ${err.message}`);
      errors++;
    }

    // Respect ElevenLabs rate limit (~3 req/s on free tier, more on paid)
    await delay(350);
  }

  console.log(`\n──────────────────────────────────`);
  if (DRY_RUN) {
    console.log(`📋  Would generate: ${generated} files`);
    console.log(`⏭  Would skip:     ${skipped} existing files`);
  } else {
    console.log(`✅  Generated: ${generated}`);
    console.log(`⏭  Skipped:   ${skipped}`);
    if (errors) console.log(`❌  Errors:    ${errors}`);
  }
  console.log();
}

main().catch(err => { console.error(err); process.exit(1); });
