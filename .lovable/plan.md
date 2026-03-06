# Custom Data Hooks terv — DB hívások centralizálása

## Jelenlegi helyzet

A Supabase hívások 5 fájlban szétszórva, összesen ~44 helyen:


| Fájl                    | Táblák                                                 | Műveletek              |
| ----------------------- | ------------------------------------------------------ | ---------------------- |
| `Chapter.tsx`           | `child_profiles`, `chapter_progress`                   | update, upsert, rpc    |
| `useChapterProgress.ts` | `chapter_progress`                                     | select, upsert         |
| `useQuiz.ts`            | `quiz_results`                                         | insert                 |
| `MyIsland.tsx`          | `shop_items`, `island_inventory`                       | select, insert, rpc    |
| `ParentDashboard.tsx`   | `chapter_progress`, `quiz_results`, `island_inventory` | select                 |
| `Onboarding.tsx`        | `child_profiles`, `chapter_progress`                   | select, insert, update |
| `AuthContext.tsx`       | `child_profiles`                                       | select                 |


Problémák: duplikált lekérdezések (pl. `chapter_progress` 4 fájlban), `as any` castolások, nincs error handling egységesítés, query key-ek kézzel szórva.

## Tervezett hook struktúra

```text
src/hooks/data/
  ├── queryKeys.ts              ← központi query key factory
  ├── useShopItems.ts           ← shop_items SELECT
  ├── useIslandInventory.ts     ← island_inventory SELECT + INSERT + invalidation
  ├── useChapterProgressData.ts ← chapter_progress SELECT (ParentDashboard-hez)
  ├── useQuizResults.ts         ← quiz_results SELECT (ParentDashboard-hez)
  └── useCompleteChapter.ts     ← chapter befejezés mutation (rpc + upsert combo)
```

A már meglévő `useChapterProgress.ts` és `useQuiz.ts` hookok megmaradnak — bennük a supabase import marad, mert saját belső állapotot is kezelnek. Viszont a query key-eket és a közös mutation-öket kiszervezzük.

## Részletek

### 1. `queryKeys.ts` — Központi query key factory

```typescript
export const queryKeys = {
  shopItems: () => ['shop-items'] as const,
  islandInventory: (profileId?: string) => ['island-inventory', profileId] as const,
  chapterProgress: (profileId?: string) => ['chapter-progress', profileId] as const,
  quizResults: (profileId?: string) => ['quiz-results', profileId] as const,
};
```

Jelenleg `'shop-items'`, `'island-inventory'`, `'parent-progress'`, `'parent-quiz-results'` stb. kézzel vannak szórva — ez egyetlen helyről jön majd.

### 2. `useShopItems.ts`

- `useQuery` wrapper a `shop_items` tábla lekérdezéséhez
- Használja: `MyIsland.tsx`
- Egyszerű SELECT, nincs auth függőség

### 3. `useIslandInventory.ts`

- `useQuery` a lekérdezéshez (childProfileId szűréssel)
- `useMutation` a `placeItem` művelethez: `island_inventory.insert` + `adjust_aranytaller` rpc + invalidation + `refreshChildProfile`
- Használja: `MyIsland.tsx`, `ParentDashboard.tsx` (csak a query rész)
- Eltávolítja az `as any` castot az rpc hívásból

### 4. `useChapterProgressData.ts`

- `useQuery` wrapper a `chapter_progress` tábla lekérdezéséhez (profileId szűréssel)
- Használja: `ParentDashboard.tsx`
- A meglévő `useChapterProgress.ts` hook NEM változik (az a step mentés logikát kezeli, más célt szolgál)

### 5. `useQuizResults.ts`

- `useQuery` wrapper a `quiz_results` tábla lekérdezéséhez
- Használja: `ParentDashboard.tsx`

### 6. `useCompleteChapter.ts`

- Kiszervezi a `Chapter.tsx` `completeChapter` callback-jének DB részeit egy `useMutation`-be
- 4 DB művelet egy tranzakcióban: `adjust_aranytaller` rpc + `child_profiles.update` + `chapter_progress.upsert` (jelenlegi) + `chapter_progress.upsert` (következő)
- Típusbiztos, `as any` nélkül
- A confetti és hang a hívó oldalon marad (UI concern)

## Érintett fájlok módosítása


| Fájl                  | Változás                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `MyIsland.tsx`        | 3 inline query/mutation → `useShopItems` + `useIslandInventory` import                     |
| `ParentDashboard.tsx` | 3 inline query → `useChapterProgressData` + `useQuizResults` + `useIslandInventory` import |
| `Chapter.tsx`         | `completeChapter` DB rész → `useCompleteChapter` mutation hívás                            |
| `Onboarding.tsx`      | Marad — egyedi regisztrációs flow, nem éri meg hookba tenni                                |
| `AuthContext.tsx`     | Marad — auth-specifikus, nem adat hook                                                     |


## Sorrend

1. `queryKeys.ts` létrehozása
2. Read hookok: `useShopItems`, `useChapterProgressData`, `useQuizResults`
3. Mutation hookok: `useIslandInventory`, `useCompleteChapter`
4. Page-ek átírása az új hookokat használva
5. Régi inline query key stringek eltávolítása  
  
**Terv értékelése, átgondolandók:**  
 Ami helyes a tervben
    queryKeys.ts — Ez a legsürgetőbb javítás. A ParentDashboard 'parent-inventory' kulcsot használ, a MyIsland 'island-inventory'-t — ugyanarra az adatra, de külön cache entry-k. Ez azt jelenti ha a MyIsland
    módosít valamit és invalidál, a ParentDashboard nem frissül. A centralizált key factory ezt automatikusan javítja.
    useCompleteChapter — A 4 DB műveletet valóban érdemes kiszervezni, eltünteti az as any castot és a Chapter.tsx-t egyszerűsíti.
    Onboarding + AuthContext marad — helyes döntés. Az Onboarding imperatív flow, nem query/mutation pattern.
    ---
    Problémák és pontosítások
    1. "tranzakció" félrevezető szó
    A useCompleteChapter leírásban: "4 DB művelet egy tranzakcióban" — ez nem igaz. A Supabase JS client nem támogat kliens-oldali tranzakciókat. Ha a 2. művelet hibázik, az 1. már lefutott. Helyesen: "4 DB
    művelet egyetlen useMutation-ben, sorban végrehajtva".
    2. as any eltávolításának módja nincs meghatározva
    A terv nem mondja meg hogyan távolítja el az rpc cast-ot. Két lehetőség:
    - Supabase generate_typescript_types → típusos rpc hívás
    - Typed wrapper: const adjustAranytaller = (id: string, delta: number) => (supabase.rpc as any)(...) — ez csak áthelyezi a castot
    Ha a DB típusok nincsenek generálva, az as any marad, csak máshol lesz.
    3. Invalidation prefix logika
    A MyIsland jelenleg (103. sor):
    queryClient.invalidateQueries({ queryKey: ['island-inventory'] });
    profileId nélkül — ez szándékos, hogy minden profil inventory-ját invalidálja. Ha az useIslandInventory hook belül queryKeys.islandInventory(profileId)-t használ, az invalidation-nek is prefix match-et kell
    használnia:
    queryClient.invalidateQueries({ queryKey: ['island-inventory'] }); // prefix → OK
    Ez működik (React Query prefix match), de a tervben explicit érdemes megemlíteni.
    4. useIslandInventory mutation-ön belül kell refreshChildProfile
    A mutation-nek szüksége van refreshChildProfile()-ra (AuthContext). A hook belül meghívhatja a useAuth()-ot — ez a helyes megközelítés, ne prop-ként kapja.
    5. useCompleteChapter onSuccess és confetti
    A caller (Chapter.tsx) a confetti-t és hangot az onSuccess callbackben futtatja, nem a hook-ban. Ez rendben van, de a mutation mutate() hívásánál kell kezelni:
    completeChapterMutation.mutate(undefined, {
      onSuccess: () => { confetti(...); playBadge(); }
    });
    Nem a hook onSuccess-ában — mert az UI concern.
    ---
    Összefoglalás
    A terv végrehajtható és érdemes megcsinálni. A sorrendje helyes. Egyetlen előfeltétel amit érdemes előre eldönteni: generálod-e a Supabase TypeScript típusokat? Ha igen, az as any teljesen eltűnhet; ha nem,
    a castok csak áthelyeződnek.
  &nbsp;