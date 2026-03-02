export interface ChapterData {
  id: number;
  characterId: string;
  title: string;
  poem: string;
  story: string;
  adventure: string;
  movementDescription: string;
  song: string;
  songActions: string[];
  movePattern: 'pawn' | 'rook' | 'bishop' | 'knight' | 'queen' | 'king';
}

export const chapters: ChapterData[] = [
  {
    id: 1,
    characterId: 'bence',
    title: 'Bence, a Gyalog',
    poem: 'Kicsi vagyok, de nem adom fel,\nEgy lépés előre, ez a jelszavam!\nHa elérem a túlsó oldalt,\nVezérré válok, ez a hatalmam!',
    story: 'Bence a legkisebb figura a sakktáblán. Ő a gyalog, aki mindig csak előre tud lépni. De ne becsüld le! Ha kitartó és bátor, és eléri a tábla túlsó szélét, valami csodálatos dolog történik...',
    adventure: 'Egy nap Bence elindult a sakktáblán. Egyesével lépkedett előre. Útközben akadályokba ütközött, de nem adta fel. "Előre!" — kiáltotta magabiztosan. Végül elérte a tábla szélét, és vezérré változott!',
    movementDescription: 'A gyalog mindig csak előre léphet, egyet. De az első lépésnél kettőt is léphet! Ütni pedig átlósan tud, egy mezőt.',
    song: '🎵 Bence, Bence, kis gyalog,\nMindig előre halad!\nEgy lépés, két lépés,\nSoha meg nem áll! 🎵',
    songActions: ['Lépj egyet előre!', 'Lépj még egyet!', 'Tapsolj kettőt!', 'Ugorj egyet!'],
    movePattern: 'pawn',
  },
  {
    id: 2,
    characterId: 'erno',
    title: 'Ernő, a Bástya',
    poem: 'Egyenesen megyek én,\nFelfelé és lefelé!\nBalra, jobbra, mint a szél,\nSenki engem meg nem áll!',
    story: 'Ernő a bástya, erős és megbízható. Ő mindig egyenesen megy — előre, hátra, balra vagy jobbra. Soha nem tér le az útjáról, mert becsületes és megbízható.',
    adventure: 'Ernő meghallotta, hogy Bence bajba került! Egyenesen indult el, végig a soron, hogy megmentse barátját. "Egyenesen!" — mondta határozottan, és egy szempillantás alatt ott termett.',
    movementDescription: 'A bástya egyenesen mozog: előre, hátra, balra és jobbra, akárhány mezőt. Mint egy autó az egyenes úton!',
    song: '🎵 Ernő bástya, erős és nagy,\nEgyenesen megy, soha nem hagy!\nPlusz jelet rajzol az úton,\nBecsületes minden húzzon! 🎵',
    songActions: ['Lépj előre három lépést!', 'Lépj hátra három lépést!', 'Lépj balra!', 'Lépj jobbra!'],
    movePattern: 'rook',
  },
  {
    id: 3,
    characterId: 'szonja',
    title: 'Szonja, a Futó',
    poem: 'Átlósan szaladok én,\nSzínes mezőkön át!\nMindig ugyanazon a színen,\nEz az én világom, lásd!',
    story: 'Szonja a futó, aki mindig átlósan mozog. Ő kreatív és művészi lélek — az ő útja az X mintát rajzolja a táblára. De van egy titka: mindig ugyanazon a színű mezőn marad!',
    adventure: 'Szonja egy nap festeni akart a sakktáblán. Átlósan szaladt, és gyönyörű X mintákat rajzolt. "Nézd, milyen szép!" — kiáltotta boldogan. A többi figura csodálta az alkotását.',
    movementDescription: 'A futó átlósan mozog, akárhány mezőt. X-et rajzol! De mindig ugyanazon a színű mezőn marad — vagy a fehéren, vagy a feketén.',
    song: '🎵 Szonja futó, mint a szél,\nÁtlósan fut, sose fél!\nX-et rajzol lábával,\nSzínes álmok szárnyával! 🎵',
    songActions: ['Lépj átlósan jobbra!', 'Lépj átlósan balra!', 'Rajzolj X-et a levegőbe!', 'Forogj egyet!'],
    movePattern: 'bishop',
  },
  {
    id: 4,
    characterId: 'huba',
    title: 'Huba, a Huszár',
    poem: 'L-betűt ugrik a lovam,\nÁtugorja mind, aki van!\nSenki más nem tud ilyet,\nEz az én különleges lépésem!',
    story: 'Huba a huszár — a legkülönlegesebb figura! Ő L-alakban ugrik, és ő az egyetlen, aki átugorhat más figurákat. Huba mindig kitalál valamit, amikor a helyzet nehéz!',
    adventure: 'A figurák egy nagy falnál álltak, és senki sem tudott átmenni. De Huba csak elmosolyodott: "Hoppsza!" — kiáltotta, és L-alakban átugrotta a falat! Mindenki csodálkozott.',
    movementDescription: 'A huszár L-alakban ugrik: két mezőt egy irányba, aztán egyet oldalra (vagy fordítva). És ő az egyetlen, aki átugorhat más figurákat!',
    song: '🎵 Huba huszár, hoppsza-hé!\nL-betűt ugrik, nézd csak né!\nÁtugorja mind a falat,\nÖtletes kis kalandot ad! 🎵',
    songActions: ['Ugorj kettőt előre, egyet jobbra!', 'Ugorj kettőt balra, egyet előre!', 'Kiálts: Hoppsza!', 'Tapsolj és ugorj!'],
    movePattern: 'knight',
  },
  {
    id: 5,
    characterId: 'vanda',
    title: 'Vanda, a Vezér',
    poem: 'Minden irányba mehetek,\nEgyenesen és átlósan is!\nÉn vagyok a legerősebb,\nDe a szívem a legfontosabb kincs!',
    story: 'Vanda a vezér — a legerősebb figura a táblán! Ő bármerre mehet: egyenesen és átlósan is. De Vanda tudja, hogy az igazi erő nem a hatalom, hanem az empátia.',
    adventure: 'Vanda látta, hogy a kis figurák szomorúak. Odament mindegyikhez, és meghallgatta őket. "Együtt!" — mondta kedvesen. Aztán segített mindenkinek, mert ő minden irányba el tudott jutni.',
    movementDescription: 'A vezér a legerősebb figura! Mehet egyenesen (mint a bástya) ÉS átlósan (mint a futó), akárhány mezőt. Ő a bástya és a futó egyben!',
    song: '🎵 Vanda vezér, aranyos szív,\nMinden irányba elrepül!\nEgyenesen, átlósan is,\nSegít mindenkinek, mert szeret! 🎵',
    songActions: ['Lépj előre!', 'Lépj átlósan!', 'Ölelj meg valakit!', 'Mondd: Együtt erősebbek vagyunk!'],
    movePattern: 'queen',
  },
  {
    id: 6,
    characterId: 'balazs',
    title: 'Balázs, a Király',
    poem: 'Csak egy lépést teszek én,\nDe bölcsen és lassan!\nVigyázzatok rám, barátaim,\nMert nélkülem vége a játéknak!',
    story: 'Balázs a király — a legfontosabb figura! Csak egyet léphet bármerre, de ő a legbölcsebb mindnyájuk közül. Ha Balázst elfogják, vége a játéknak. Ezért a többiek mind vigyáznak rá.',
    adventure: 'Balázs az Egyensúly Fája alatt ült és gondolkodott. "Minden figura fontos" — mondta bölcsen. "A kis Bence épp olyan fontos, mint a nagy Vanda." A többiek megértették: csak együtt győzhetnek.',
    movementDescription: 'A király bármerre léphet — előre, hátra, oldalra, átlósan — de csak EGYET! Ő a legfontosabb: ha sakkot kap, menekülnie kell. Ha matt, vége a játéknak!',
    song: '🎵 Balázs király, bölcs és jó,\nEgy lépés neki is elég!\nLassan jár, messzire lát,\nÉs vigyáz az egész seregre! 🎵',
    songActions: ['Lépj egyet bármerre!', 'Állj meg és gondolkodj!', 'Mondd: Mindenki fontos!', 'Hajolj meg, mint egy király!'],
    movePattern: 'king',
  },
];
