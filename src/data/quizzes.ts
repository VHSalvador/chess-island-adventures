export interface QuizQuestion {
  id: string;
  chapterNumber: number;
  type: 'chess' | 'eq' | 'math';
  question: string;
  options: string[];
  correctIndex: number;
  reward: number; // aranytallér
}

export const quizQuestions: QuizQuestion[] = [
  // Chapter 1 - Bence (Pawn)
  { id: 'b1', chapterNumber: 1, type: 'chess', question: 'Merre léphet a gyalog?', options: ['Csak előre', 'Csak hátra', 'Minden irányba', 'Csak oldalra'], correctIndex: 0, reward: 5 },
  { id: 'b2', chapterNumber: 1, type: 'chess', question: 'Hányat léphet a gyalog az első lépésnél?', options: ['Egyet', 'Egyet vagy kettőt', 'Hármat', 'Akármennyit'], correctIndex: 1, reward: 5 },
  { id: 'b3', chapterNumber: 1, type: 'chess', question: 'Hogyan üt a gyalog?', options: ['Egyenesen', 'Átlósan', 'L-alakban', 'Hátrafelé'], correctIndex: 1, reward: 5 },
  { id: 'b4', chapterNumber: 1, type: 'eq', question: 'Mit érzett Bence, amikor akadályba ütközött?', options: ['Feladta', 'Kitartott és tovább ment', 'Elsírta magát', 'Visszafordult'], correctIndex: 1, reward: 3 },
  { id: 'b5', chapterNumber: 1, type: 'eq', question: 'Mi történik, ha a gyalog eléri a túlsó oldalt?', options: ['Eltűnik', 'Vezérré változhat', 'Visszamegy', 'Megáll'], correctIndex: 1, reward: 3 },
  { id: 'b6', chapterNumber: 1, type: 'math', question: 'Bence 3 lépést tett, aztán még 2-t. Összesen hányat lépett?', options: ['4', '5', '6', '3'], correctIndex: 1, reward: 3 },

  // Chapter 2 - Ernő (Rook)
  { id: 'e1', chapterNumber: 2, type: 'chess', question: 'Hogyan mozog a bástya?', options: ['Átlósan', 'Egyenesen (előre, hátra, balra, jobbra)', 'L-alakban', 'Csak előre'], correctIndex: 1, reward: 5 },
  { id: 'e2', chapterNumber: 2, type: 'chess', question: 'Hány mezőt léphet a bástya?', options: ['Egyet', 'Kettőt', 'Akárhányat egyenesen', 'Hármat'], correctIndex: 2, reward: 5 },
  { id: 'e3', chapterNumber: 2, type: 'chess', question: 'Milyen jelet rajzol a bástya útja?', options: ['X jelet', '+ jelet', 'O-t', 'L-et'], correctIndex: 1, reward: 5 },
  { id: 'e4', chapterNumber: 2, type: 'eq', question: 'Miért fontos a becsületesség, mint Ernőnél?', options: ['Mert jó érzés', 'Mert bízhatnak benned', 'Mert kötelező', 'Mert könnyű'], correctIndex: 1, reward: 3 },
  { id: 'e5', chapterNumber: 2, type: 'math', question: 'A sakktáblán 8 sor és 8 oszlop van. Hány mező van összesen?', options: ['16', '32', '64', '48'], correctIndex: 2, reward: 3 },
  { id: 'e6', chapterNumber: 2, type: 'math', question: 'Ernő 5 mezőt lépett jobbra, aztán 3-at balra. Hány mezőre van a kiindulási ponttól?', options: ['2', '8', '3', '5'], correctIndex: 0, reward: 3 },

  // Chapter 3 - Szonja (Bishop)
  { id: 's1', chapterNumber: 3, type: 'chess', question: 'Hogyan mozog a futó?', options: ['Egyenesen', 'Átlósan', 'L-alakban', 'Csak egyet'], correctIndex: 1, reward: 5 },
  { id: 's2', chapterNumber: 3, type: 'chess', question: 'Milyen színű mezőn marad mindig a futó?', options: ['Mindig fehéren VAGY mindig feketén', 'Felváltva', 'Bármelyiken', 'Csak fehéren'], correctIndex: 0, reward: 5 },
  { id: 's3', chapterNumber: 3, type: 'chess', question: 'Milyen mintát rajzol a futó?', options: ['+ jelet', 'X jelet', 'L betűt', 'Kört'], correctIndex: 1, reward: 5 },
  { id: 's4', chapterNumber: 3, type: 'eq', question: 'Miért jó kreatívnak lenni, mint Szonja?', options: ['Mert szép rajzokat készíthetünk', 'Mert új megoldásokat találunk', 'Mert unalmas nélküle', 'Mert mindenki csodál'], correctIndex: 1, reward: 3 },
  { id: 's5', chapterNumber: 3, type: 'math', question: 'Rajzolj X-et! Hány vonalból áll az X betű?', options: ['1', '2', '3', '4'], correctIndex: 1, reward: 3 },

  // Chapter 4 - Huba (Knight)
  { id: 'h1', chapterNumber: 4, type: 'chess', question: 'Milyen alakban ugrik a huszár?', options: ['+ alakban', 'X alakban', 'L alakban', 'Egyenesen'], correctIndex: 2, reward: 5 },
  { id: 'h2', chapterNumber: 4, type: 'chess', question: 'Mi a különleges a huszárban?', options: ['A legtöbbet léphet', 'Átugorhatja a többi figurát', 'Két irányba léphet', 'Hátrafelé megy'], correctIndex: 1, reward: 5 },
  { id: 'h3', chapterNumber: 4, type: 'chess', question: 'A huszár L-je: hány mezőt lép egy irányba?', options: ['3 és 1', '2 és 1', '2 és 2', '1 és 1'], correctIndex: 1, reward: 5 },
  { id: 'h4', chapterNumber: 4, type: 'eq', question: 'Mit tett Huba, amikor a többiek nem tudtak tovább menni?', options: ['Ő is megállt', 'Kitalált egy kreatív megoldást', 'Visszament', 'Sírt'], correctIndex: 1, reward: 3 },
  { id: 'h5', chapterNumber: 4, type: 'math', question: 'Huba 2-t ugrik előre és 1-et jobbra. Összesen hány mezőt halad?', options: ['2', '3', '1', '4'], correctIndex: 1, reward: 3 },

  // Chapter 5 - Vanda (Queen)
  { id: 'v1', chapterNumber: 5, type: 'chess', question: 'Merre mehet a vezér?', options: ['Csak egyenesen', 'Csak átlósan', 'Egyenesen ÉS átlósan', 'L-alakban'], correctIndex: 2, reward: 5 },
  { id: 'v2', chapterNumber: 5, type: 'chess', question: 'Melyik két figura képességét egyesíti a vezér?', options: ['Gyalog és huszár', 'Bástya és futó', 'Király és gyalog', 'Huszár és futó'], correctIndex: 1, reward: 5 },
  { id: 'v3', chapterNumber: 5, type: 'eq', question: 'Mit jelent az empátia, amit Vanda mutat?', options: ['Erősnek lenni', 'Megérteni mások érzéseit', 'Gyorsan futni', 'Parancsolni'], correctIndex: 1, reward: 3 },
  { id: 'v4', chapterNumber: 5, type: 'eq', question: 'Miért hallgatta meg Vanda a kis figurákat?', options: ['Mert kíváncsi volt', 'Mert segíteni akart', 'Mert unatkozott', 'Mert muszáj volt'], correctIndex: 1, reward: 3 },
  { id: 'v5', chapterNumber: 5, type: 'math', question: 'Vanda mehet egyenesen (4 irány) és átlósan (4 irány). Összesen hány irányba?', options: ['4', '6', '8', '2'], correctIndex: 2, reward: 3 },

  // Chapter 6 - Balázs (King)
  { id: 'k1', chapterNumber: 6, type: 'chess', question: 'Hányat léphet a király?', options: ['Akárhányat', 'Egyet', 'Kettőt', 'Hármat'], correctIndex: 1, reward: 5 },
  { id: 'k2', chapterNumber: 6, type: 'chess', question: 'Mi történik, ha a királyt elfogják?', options: ['Semmi', 'Folytatódik a játék', 'Vége a játéknak', 'Visszakerül a helyére'], correctIndex: 2, reward: 5 },
  { id: 'k3', chapterNumber: 6, type: 'chess', question: 'Mit jelent a "sakk"?', options: ['A király veszélyben van', 'A játék véget ért', 'Nyertél', 'Döntetlenre áll'], correctIndex: 0, reward: 5 },
  { id: 'k4', chapterNumber: 6, type: 'eq', question: 'Mit mondott Balázs: kik fontosak a csapatban?', options: ['Csak a nagyok', 'Csak a király', 'Mindenki egyformán fontos', 'Senki'], correctIndex: 2, reward: 3 },
  { id: 'k5', chapterNumber: 6, type: 'eq', question: 'Miért fontos a bölcsesség?', options: ['Mert jól gondolkodunk döntések előtt', 'Mert okosnak tűnünk', 'Mert mások megcsodálnak', 'Mert gyorsan cselekszünk'], correctIndex: 0, reward: 3 },
  { id: 'k6', chapterNumber: 6, type: 'math', question: 'A király 1-et léphet minden irányba. Hány mezőre léphet maximum (a tábla közepéről)?', options: ['4', '6', '8', '2'], correctIndex: 2, reward: 3 },
];
