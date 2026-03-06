# Chapter.tsx dekompozíció terv

## Jelenlegi helyzet

A `Chapter.tsx` 503 soros monolitikus komponens, amely egyetlen fájlban kezeli:

- 6 különbozo step renderelését (story, movement, adventure, practice, song, badge)
- Kvíz logikát (válaszok, pontszámok, navigáció)
- Adatbázis műveleteket (progress mentés, kvíz eredmények, fejezet befejezés)
- Audio lejátszást
- Navigációt és animációkat

## Tervezett struktúra

```text
src/pages/Chapter.tsx              ← orchestrator (~120 sor)
src/hooks/useChapterProgress.ts    ← DB: load/save step + quiz_index
src/hooks/useQuiz.ts               ← kvíz állapot + válaszkezelés + DB mentés
src/components/chapter/
  ├── ChapterHeader.tsx            ← fejléc + progress bar
  ├── ChapterNavigation.tsx        ← előző/következő gombok
  ├── StoryStep.tsx                ← vers + történet + audio
  ├── MovementStep.tsx             ← lépésbemutató
  ├── AdventureStep.tsx            ← kalandtörténet
  ├── QuizStep.tsx                 ← kvíz kérdések + válaszok
  ├── SongStep.tsx                 ← dal + mozgások
  ├── BadgeStep.tsx                ← csillag + fejezet befejezés
  └── AudioButton.tsx              ← újrahasználható hang gomb
```

## Komponensek felelőssége

### Custom Hooks

`**useChapterProgress(childProfileId, chapterNum)**`

- Betölti a mentett `step` + `quiz_index` értékeket mountkor
- Exportálja a `saveStep(step, quizIndex)` függvényt
- Kezeli az `as any` castot egy helyen, típusbiztosan

`**useQuiz(chapterNum, childProfileId, saveStep)**`

- `quizIndex`, `quizScore`, `answered`, `selectedAnswer`, `quizFeedback` állapotok
- `handleAnswer(optionIndex)` — validáció, DB mentés, hangok
- `nextQuiz()` — következő kérdésre lépés
- A `chapterQuizzes` szűrés is itt történik

### Step komponensek

Mindegyik props-ként kapja a szükséges adatot (chapter data, audio, karakter info). Nincs bennük DB logika.

`**QuizStep**` kapja a `useQuiz` hook-ból az összes állapotot és handlert.

`**BadgeStep**` kapja a `completeChapter` callback-et, amit a `Chapter.tsx` orchestrator definiál (mert az több DB műveletet is érint).

### Chapter.tsx orchestrator

A maradék fő fájl csak:

1. Hook-okat hív (`useChapterProgress`, `useQuiz`, `useSound`, `useSpeech`)
2. Step állapotot kezeli (`currentStep`, `setCurrentStep`)
3. `completeChapter` logikát tartalmazza (DB upsert-ök + confetti)
4. Step alapján rendereli a megfelelő komponenst

## Technikai részletek

- A konstansok (`STEPS`, `STEP_LABELS`, `STEP_ICONS`, `CHAPTER_BACKGROUNDS`) maradnak a `Chapter.tsx`-ben vagy egy `chapter/constants.ts`-be kerülnek
- Az `AudioButton` saját fájlba kerül, mert a step komponensek közösen használják
- A `completeChapter` nem kerül hook-ba, mert vegyes felelőssége van (confetti + DB + navigate) — az orchestratorban marad
- Típusok (`Step`) egy közös `chapter/types.ts`-be kerülnek

## Sorrend

1. Típusok + konstansok kiszervezése (`chapter/types.ts`, `chapter/constants.ts`)
2. `AudioButton` komponens
3. `useChapterProgress` hook
4. `useQuiz` hook
5. Step komponensek (StoryStep, MovementStep, AdventureStep, QuizStep, SongStep, BadgeStep)
6. ChapterHeader + ChapterNavigation
7. Chapter.tsx átalakítása orchestratorrá  
  
  
Kiegészítés:   
 Hiányosságok és kockázatok
    1. Audio management nincs hozzárendelve
    Az audioRef, playAudio callback és a cleanup useEffect (sorok 55–69) egyik tervezett helyre sincs besorolva. Jelenleg a fő komponensben él, de az AudioButton köré épül. Megoldási
    lehetőségek:
    - Külön useAudio() hook → AudioButton props-ként kapja a playAudio-t
    - Vagy az AudioButton maga kezeli a saját useRef-ét (egyszerűbb, de ha egyszerre két gombot nyomnak, két audio fut)
    A terv ezt kihagyja — döntést igényel mielőtt nekikezdesz.
    2. chapterComplete állapot nincs explicit hozzárendelve
    A BadgeStep renderel chapterComplete-re is (befejezés előtti / utáni UI), nem csak a completeChapter callback-et kapja. Az orchestratorban kell maradjon az állapot, de ez props-szinten
    nincs kimondva a tervben.
    3. STEP_ICONS dead code
    A jelenlegi kódban definiálva van (sorok 28–35), de sehol nincs használva. A ChapterHeader tervezett komponens felhasználhatná, de ez nincs megemlítve — érdemes dönteni: bevezetni a
    header-be, vagy törölni.
    4. useRef import bug a jelenlegi kódban
    A jelenlegi Chapter.tsx első sora nem importálja a useRef-et, csak useState, useEffect, useCallback-et — mégis használja (sor 55). Ez vagy TypeScript-hiba amit a build elnyom, vagy
    valahogy működik. A refactor előtt érdemes ezt tisztázni/javítani.
    5. quizFeedback a story stepben
    A sor 251–257 a story step karakter-animációját a quizFeedback állapotra köti. Ez logikailag hibás (a story step nem tud quiz feedbacket kapni), és a refactor után a StoryStep nem is
    fogja látni ezt az állapotot — ami valójában jó, mert eltünteti a bugot.
    ---
    Összefoglaló értékelés
    A terv megalapozott és végrehajtható. Az egyetlen valódi döntési pont az audio management elhelyezése. Ha ezt előre tisztázzák, a sorrend (types → hooks → step components → orchestrator)
     helyes, és az egyes lépések függetlenek egymástól, tehát párhuzamosan vagy fokozatosan is elvégezhető.
    Javaslat: Adj hozzá a tervhez egy useAudio() hookot (vagy AudioButton saját ref-fel), és a chapterComplete állapotot explicit módon jelöld az orchestrator felelősségébe. Ezután a terv
    kész a végrehajtásra.