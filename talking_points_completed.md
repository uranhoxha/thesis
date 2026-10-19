# Pikat e Diskutimit — Të Plotësuara

Ky dokument zgjeron çdo pikë të skeletit në `talking_points.md` me përmbajtje të
verifikuar drejtpërdrejt nga kodi burimor, historia e Git-it dhe rezultatet e
benchmark-eve (`bench/BENCHMARK-RESULTS.md`). Shërben si baza e shkrimit për
draftin e punimit: çdo seksion këtu ka materialin e mjaftueshëm për t'u zgjeruar
në prozën përfundimtare.

**Projekti:** Një shoqërues gatimi i fuqizuar nga AI dhe i komanduar me zë — një
aplikacion web multimodal që e ndihmon kuzhinierin e shtëpisë të **planifikojë**,
**zbulojë** dhe **gatuajë**.
**Stack-u:** Next.js 16 · React 19 · TypeScript strict · Supabase · Google Gemini 2.5 Flash.

---

## 1. HYRJE

### 1.1 Konteksti dhe Motivimi

Gatimi në shtëpi është një nga aktivitetet e pakta të përditshme ku ndërveprimi
me prekje është objektivisht UX i keq: duart janë të lagura, ngjitëse ose të
zëna, ndërsa recetat, lista e blerjeve dhe kohëmatësi jetojnë në aplikacione të
ndara. Në të njëjtën kohë, tre zhvillime teknologjike kanë pjekur njëkohësisht:

- **AI multimodale** (Gemini, GPT-4o) është bërë mjaftueshëm e lirë dhe e
  shpejtë sa "çfarë mund të gatuaj me ato që kam?" të përgjigjet nga një foto e
  vetme, me kosto për kërkesë (~$0.007 për skanim, shih Kap. 8).
- **API-të native të shfletuesit** (Web Speech, Wake Lock, Realtime mbi
  WebSocket) e bëjnë të mundur një përvojë "pa duar" pa harduer pronësor dhe pa
  instalim native.
- **Korniza moderne web** (Next.js App Router, Server Actions, Supabase) e
  shkrijnë backend-in tradicional në një sipërfaqe të vetme zhvillimi.

Motivimi i punimit është të tregojë se këto tre rryma, të bashkuara në një
arkitekturë të disiplinuar, mjaftojnë për të ndërtuar "kuzhinën e së ardhmes" në
një shfletues të zakonshëm.

### 1.2 Problemi Kërkimor

Problemi ndahet në tre dimensione:

1. **Copëtimi i rrjedhës së punës.** Përdoruesi sot kërkon receta në një
   aplikacion, mban listën e blerjeve në një tjetër dhe vendos kohëmatësin te
   soba — asnjë sipërfaqe nuk e mbulon ciklin planifiko → zbulo → gatuaj.
2. **Verbëria e mjeteve ekzistuese ndaj realitetit.** Gjeneruesit e recetave me
   AI pranojnë vetëm tekst; ato nuk e "shohin" frigoriferin. Sistemet
   pantry-to-recipe (SuperCook etj.) bëjnë përputhje rregullash mbi një bazë
   statike recetash.
3. **Armiqësia ndaj prekjes në kuzhinë.** Asistentët me zë (Alexa, Google Home)
   zgjidhin vetëm "vendos një kohëmatës", janë të lidhur me harduer pronësor dhe
   nuk arrijnë dot gjendjen e aplikacionit të përdoruesit (recetat, listën e tij).

### 1.3 Qëllimi dhe Fusha e Studimit

Qëllimi është projektimi, implementimi dhe vlerësimi empirik i një aplikacioni
web të vetëm që i mbulon të tre fazat e gatimit në shtëpi. Fusha e studimit
përfshin: (a) integrimin e AI-së gjenerative multimodale si funksion produkt,
jo demo; (b) një shtresë zanore deterministe të ndërtuar vetëm me API të
shfletuesit; (c) një arkitekturë të ripërdorshme me dosje-funksioni për
aplikacione Next.js të madhësisë mesatare; dhe (d) vlerësimin sasior të
komponentëve kryesorë (parser-i zanor, pipeline-i i AI-së, performanca e
ngarkimit). Jashtë fushës mbeten: aplikacionet native mobile, personalizimi
dietik dhe studimi i gjerë me përdorues (i planifikuar si punë e ardhshme).

### 1.4 Struktura e Punimit

- **Kap. 2** përcakton qëllimet, pyetjet kërkimore, hipotezën dhe objektivat e matshme.
- **Kap. 3** rishikon literaturën në katër rrjedha (food computing, AI multimodale,
  ndërfaqe zanore, arkitektura web) dhe analizon zgjidhjet ekzistuese.
- **Kap. 4** paraqet metodologjinë Design Science Research, fazat e zhvillimit,
  arsyetimin e stack-ut dhe konsideratat etike.
- **Kap. 5** dokumenton arkitekturën e sistemit: dosjet-funksion, rrjedhën e të
  dhënave, tre klientët Supabase, autentikimin dhe skemën e bazës së të dhënave.
- **Kap. 6** përshkruan çdo funksion të sistemit me detaje implementimi.
- **Kap. 7** trajton sistemin e dizajnit dhe përvojën e përdoruesit.
- **Kap. 8** raporton mbledhjen e të dhënave dhe tre benchmark-et.
- **Kap. 9** analizon rezultatet kundrejt objektivave dhe literaturës.
- **Kap. 10–11** nxjerrin konkluzionet, rekomandimet dhe kufizimet.

---

## 2. QËLLIMET, PYETJET DHE OBJEKTIVAT E KËRKIMIT

### 2.1 Qëllimi i Kërkimit

Të projektohet dhe dorëzohet një aplikacion web në nivel prodhimi që bashkon
menaxhimin e recetave, sugjerimet e vetëdijshme për përbërësit (me AI
multimodale) dhe kontrollin zanor pa duar — dhe njëkohësisht të validohet një
shabllon arkitekturor i riprodhueshëm (`features/<emri>/{api,components,hooks,types,providers}`)
që mbetet i mirëmbajtshëm ndërsa funksionet shumohen.

### 2.2 Pyetjet Kërkimore

1. **PK1:** A mund një stack i vetëm modern web të ofrojë AI multimodale,
   sinkronizim në kohë reale dhe kontroll zanor pa një backend të personalizuar?
2. **PK2:** Cilat modele arkitekturore e mbajnë një aplikacion Next.js të pasur
   me funksione të mirëmbajtshëm ndërsa funksionet shumohen?
3. **PK3:** Kur duhet zgjedhur logjika deterministe kundrejt një LLM-je për
   interpretimin e komandave, në një UX të ndjeshëm ndaj vonesës dhe kostos?
4. **PK4:** Si mund t'i imponojnë server actions një kufi të pastër sigurie mes
   klientit, të dhënave të përdoruesit dhe operacioneve vetëm-admin?

### 2.3 Hipoteza dhe Kundër-hipoteza

**Hipoteza (H1).** Çiftimi i AI-së gjenerative multimodale (imazh + tekst →
receta JSON të strukturuara) me kontroll zanor determinist dhe native të
shfletuesit prodhon një përvojë kuzhine më të përdorshme dhe ekonomikisht më të
qëndrueshme sesa (a) përputhja e recetave me rregulla mbi bazë statike ose
(b) biseda e drejtuar tërësisht nga LLM.

**Kundër-hipoteza (H0).** Përdorimi i LLM-së edhe për interpretimin e komandave
zanore (në vend të parser-it determinist) nuk sjell përkeqësim të matshëm në
vonesë, kosto apo besueshmëri; ose, alternativa e mjeteve të copëtuara ekzistuese
e mbulon rrjedhën e punës njësoj mirë.

Evidenca empirike e Kap. 8 (parsim ~0.007 ms median me kosto zero, kundrejt
~15 s dhe ~$0.007 për thirrje modeli) e rrëzon H0 për rastin e gramatikës së
mbyllur të komandave.

### 2.4 Objektivat e Matshme

| # | Objektivi | Metrika | Synimi |
|---|---|---|---|
| O1 | Pantry Scan kthen 3 receta të dallueshme | Validim i formës JSON + numërim titujsh | 3 receta të ndryshme për çdo kërkesë |
| O2 | Parser zanor determinist | Numër qëllimesh; vonesa e parsimit | ≥10 qëllime; <10 ms; 0 kosto AI |
| O3 | Zgjedhje ditore deterministe | Hash i datës | Identike për të gjithë përdoruesit e së njëjtës datë kalendarike |
| O4 | UI optimist me rikthim | Sjellja nën dështim rrjeti | Rikthim i besueshëm i cache-it |
| O5 | Ngarkim i shpejtë | Lighthouse (LCP, CLS, TTFB) | Ngarkim i ftohtë < 2 s në lidhje modeste |

*(Interpretimi i rezultateve kundrejt këtyre objektivave bëhet në §9.2, ku
raportohet me ndershmëri edhe pjesa e paplotësuar.)*

---

## 3. SFONDI DHE RISHIKIMI I LITERATURËS

### 3.1 Rrjedha e Punës së Gatimit në Shtëpi

Teza e produktit ndërtohet mbi një vëzhgim të thjeshtë: dita e gatimit ka tre
faza të dallueshme — **planifiko** (çfarë do gatuaj; çfarë më duhet të blej),
**zbulo** (frymëzim i ri; çfarë mund të bëj me ato që kam) dhe **gatuaj**
(ekzekutimi me duar të zëna). Aplikacionet ekzistuese synojnë nga një fazë
secili; ky punim i trajton të tria si një rrjedhë të vetme të vazhdueshme, ku
çdo funksion i sistemit i shërben njërës fazë: biblioteka e recetave + lista e
blerjeve (planifiko), zgjedhjet ditore + Pantry Scan (zbulo), kohëmatësi +
mënyra me zë (gatuaj).

### 3.2 Rekomandimi i Recetave dhe AI Multimodale

- Sistemet e hershme përdorën rrjete bashkë-ndodhjeje përbërësish dhe grafe
  komplementaritetesh për rekomandim nga inventarë të kufizuar (Forbes & Zhu,
  2011; Teng et al., 2012). Trattner & Elsweiler (2017) shtuan renditjen e
  vetëdijshme për shëndetin; Min et al. (2019) në sondazhin e tyre të food
  computing e identifikojnë nxjerrjen e përbërësve nga imazhet si kufi në
  zhvillim.
- E përbashkëta e këtyre punimeve: korpusi i recetave trajtohet si **i fiksuar**
  dhe hyrja e përdoruesit si **tekst**. Ky punim largohet nga të dy supozimet:
  recetat **gjenerohen sipas kërkesës** nga një model multimodal, jo rikthehen
  nga një bazë e kuruar.
- Salvador et al. (2017) vendosën rikthimin ndër-modal imazh↔recetë; me Gemini
  (Google DeepMind, 2024) dhe GPT-4V (OpenAI, 2023; Yang et al., 2023) modelet
  vizion-gjuhë u bënë të vlefshme për funksione produkti për çdo kërkesë.
- Literatura e rishikuar mbi **daljen JSON të kufizuar me skemë** nga këto
  modele në aplikacione përballë përdoruesit mbetet e pakët — strategjia e
  parsimit mbrojtës e këtij punimi (prompt i rreptë + fallback tolerant +
  validim forme) është një kontribut inxhinierik ndaj asaj literature.

### 3.3 Ndërfaqet Zanore dhe Konteksti i Kuzhinës

- Pearl (2016) dhe Cohen et al. (2004) e karakterizojnë zërin si modalitetin e
  duhur kur duart dhe sytë janë të zënë — përshkrim gati i përkryer i kuzhinës.
- Bentley et al. (2018) gjetën se gatimi është ndër rastet mbizotëruese të
  përdorimit të altoparlantëve inteligjentë në shtëpi — por platformat ekzistuese
  nuk arrijnë dot gjendjen e aplikacioneve të palëve të treta.
- Web Speech API (Shires & Wennborg, W3C 2012; draft 2024) e bën zërin native
  të shfletuesit të mundur pa harduer pronësor, por mbështetja ndër-shfletues
  mbetet e pabarabartë dhe rrallë benchmark-ohet akademikisht (këtë punim e
  dokumenton empirikisht: dështimet `network` në Chromium mbi Linux, §6.6/§11.2).
- McTear (2022) dhe Hancock et al. (2020) argumentojnë se parsimi determinist i
  qëllimeve ia kalon klasifikimit me LLM për gramatika të mbyllura në vonesë dhe
  kosto — kompromis që ky punim e teston empirikisht brenda një produkti real (§8.1).

### 3.4 Modele Arkitekturore për Aplikacione Web

- Domain-Driven Design (Evans, 2003; Vernon, 2013) vendosi modularitetin sipas
  domenit për backend-e; ekuivalenti front-end — **dosjet-funksion** — është
  popullarizuar në literaturën praktike (Khorikov, 2020; Dodds, 2021) por i
  mungon trajtimi rigoroz si rast studimi.
- Ky punim kontribuon një rast studimi të dokumentuar: 11 funksione, server
  actions si sipërfaqja e vetme e mutacioneve, tre klientë Supabase me role të
  ndara dhe një sistem dizajni CSS-first në Tailwind v4.

### 3.5 Analizë e Zgjidhjeve Ekzistuese

| Sistemi | Kategoria | Tipari dallues | Mangësia kryesore |
|---|---|---|---|
| Yummly, Paprika | Bibliotekë recetash | Kërkim me tekst, futje manuale | Pa AI imazhi; s'mbulon fazën "gatuaj" |
| SuperCook, MyFridgeFood | Pantry-to-recipe | Filtrim me rregulla | Bazë statike; hyrje vetëm me tekst |
| Tasty, BBC Good Food | Zbulim | Kurim editorial | Pa personalizim; pa gjendje përdoruesi |
| ChatGPT / Gemini chat | AI gjenerik | Bisedues | Pa UX kuzhine; pa zë/kohëmatës/list |
| Alexa / Google Assistant | Zë + gatim | Kohëmatës me zë | Harduer pronësor; s'prek gjendjen e aplikacionit |

### 3.6 Hendeku i Identifikuar

Asnjë punim i mëparshëm, me sa di autori, nuk integron njëkohësisht: (1)
detektim multimodal të përbërësve nga imazhi me gjenerim recetash sipas
kërkesës, (2) kontroll zanor determinist e native të shfletuesit mbi gjendje
reale aplikacioni dhe (3) një arkitekturë web modulare të dokumentuar — në një
produkt të vetëm të vlerësuar empirikisht. Punimi e adreson këtë hendek me
artefaktin plus analizën reflektive të kompromiseve të tij.

---

## 4. METODOLOGJIA E KËRKIMIT

### 4.1 Dizajni dhe Qasja (Design Science Research)

Punimi ndjek metodologjinë **Design Science Research** (Hevner et al., 2004):
kontributi parësor është një artefakt i projektuar (aplikacioni), i shoqëruar
nga vlerësim empirik dhe reflektim mbi vendimet e dizajnit. Cikli DSR u përshkua
në pesë faza: identifikim problemi → kërkesat & dizajni arkitekturor →
implementim iterativ → vlerësim sasior → dokumentim.

### 4.2 Fazat e Zhvillimit

Rindërtuar nga historia reale e Git-it (32 commit-e, 26 tetor 2025 – 18 qershor 2026):

| Faza | Periudha | Përmbajtja (commit-et kyçe) |
|---|---|---|
| Bootstrap | Tet–Nën 2025 | `create-next-app`, toolbar markdown |
| Themelet | Dhj 2025 | Inicializimi i Supabase + shadcn, faqet login/signup |
| Funksionet bazë | Jan 2026 | Lista e blerjeve, shtim recetash me sidebar |
| Riorganizimi | 17 Shk 2026 | Refaktorim në arkitekturën me dosje-funksioni |
| Zbulimi & Auth | Shk 2026 | ChefBot me zgjedhje ditore, Google OAuth, ndarja e recetave, kohëmatës me localStorage, ndryshim fjalëkalimi/avatari |
| Admin & Tema | 23–24 Shk 2026 | Paneli admin (CRUD daily picks + cooking tips), zgjedhja e temave v1 |
| AI & Zëri | 25–26 Pri 2026 | Faqja publike e marketingut, Pantry Scan me Gemini, komandat zanore, ridizajn auth, rregullime mobile |
| Stilimi 3D | 18 Qer 2026 | Sistemi "3D lit-surface" (gradientë + hije të shtresuara) |
| Vlerësimi | Pri–Qer 2026 | Benchmark-et e parser-it, pipeline-it Gemini dhe Lighthouse |

Metoda e punës: zhvillim iterativ me commit-e konvencionale (`feat:`, `fix:`,
`refactor:`), TypeScript strict i imponuar kudo, ESLint me rregullat e
`eslint-config-next`.

### 4.3 Stack-u Teknologjik dhe Arsyetimi

| Teknologjia | Pse u zgjodh | Kompromisi |
|---|---|---|
| Next.js 16 (App Router) | Server components + server actions presin boilerplate; një sipërfaqe e vetme mutacionesh me rivalidim të integruar | Version i ri (16.x); disa librari ende po përshtaten |
| React 19 | Bashkërendohet me Next 16; hooks moderne, batching automatik | Rrezik përputhshmërie me versione më të vjetra Radix |
| TypeScript strict | Kap regresionet e rifaktorizimit në compile-time | Disa forma duken të dyfishuara |
| Tailwind v4 | Token-a dizajni CSS-first, pa konfigurim JS | Më pak tooling ekosistemi se v3 |
| shadcn/ui + Radix | Primitivë të aksesueshëm, të kopjueshëm e të zotëruar në repo | Më shumë skedarë për t'u mirëmbajtur |
| TanStack Query v5 | Cache i gjendjes së serverit; UI optimist pa reducer-a | Kërkon disiplinë ndaj modelit |
| Supabase | Postgres + Auth + Realtime + Storage në një produkt | Lidhje me një shitës |
| Google Gemini 2.5 Flash | Multimodal, i shpejtë, i lirë; imazh + tekst në një thirrje | Devijim formati i trajtuar me parser mbrojtës |
| Web Speech API | Native, zero varësi, zero kosto AI | Mbështetje e pabarabartë (Chromium/Linux) |
| Wake Lock API | Ekrani mbetet ndezur gjatë mënyrës me zë | Mbështetje e kufizuar jashtë Chromium |
| lz-string | Ndarje pa backend: receta ngjeshet në URL | URL-ja rritet me gjatësinë e recetës |

### 4.4 Metodat e Vlerësimit

1. **Mikro-benchmark i parser-it zanor** — 56 thënie të kuruara e të etiketuara
   me dorë (përfshirë 5 të vështira me qëllim), matje individuale me
   `performance.now()`, krahasim në nivel nën-qëllimi (countdown vs stopwatch;
   check vs uncheck).
2. **Besueshmëria e pipeline-it Pantry Scan** — 20 ekzekutime sekuenciale mbi të
   njëjtin imazh, matje e vlefshmërisë JSON, e formës së zarfit, e dallueshmërisë
   së recetave, e vonesës dhe e kostos në token-a.
3. **Auditim Lighthouse** — build prodhimi lokal (`next build && next start`),
   3 ekzekutime mbi rrugën publike `/login`, form factor mobile me throttling të
   simuluar (Slow-4G, 4× CPU).
4. **Reflektim arkitekturor** — retrospektivë vendim-për-vendim me diskutim
   eksplicit të kompromiseve (§9.1).

### 4.5 Konsideratat Etike

- **Privatësia e të dhënave.** Recetat, listat dhe profili ruhen në Supabase të
  shënuara me `user_id`; fshirja e llogarisë nga admini heq rekordin në
  `auth.admin`. Ndarja e recetave **nuk ruan asgjë në server** — ngarkesa
  ngjeshet në vetë URL-në, duke eliminuar rrezikun e të dhënave jetime dhe duke
  ulur ekspozimin ndaj GDPR.
- **Përpunimi nga AI e palës së tretë.** Imazhet dhe përbërësit i dërgohen
  API-së së Gemini-t vetëm për inferencë (pa fine-tuning mbi të dhëna
  përdoruesish). Aplikacioni ofron edhe një **çelës fikjeje të AI-së**
  (cilësimi `aiDisabled` në Settings) që e fsheh tërësisht Pantry Scan — kontroll
  i drejtpërdrejtë i përdoruesit mbi ekspozimin ndaj AI-së.
- **Trajtimi i kredencialeve.** Çelësi service-role i Supabase dhe çelësi i
  Gemini-t janë vetëm-server; arkitektura e imponon këtë me tre klientë të
  emërtuar qartë dhe me server action të autentikuar për çdo thirrje AI.
- **Transparenca algoritmike dhe paragjykimi.** Prompt-i kërkon "3 receta
  dukshëm të ndryshme" për të zbutur homogjenizimin kulturor; kufizimet e
  modelit (prirje drejt kuzhinave perëndimore, mungesë vetëdijeje për alergji)
  diskutohen hapur në punim.
- **Aksesueshmëria.** Mënyra me zë është në vetvete veçori aksesueshmërie për
  përdorues me kufizime motorike; primitivët Radix janë konform ARIA.
- **Qëndrueshmëria.** Kostoja mjedisore e inferencës së përsëritur pranohet;
  cache-i me content-hash (punë e ardhshme) e adreson drejtpërdrejt.
- **Ndershmëria si kërkesë metodologjike.** Kufizimet (mungesa e testeve, Web
  Speech i brishtë, mungesa e rate limiting) raportohen hapur, jo fshihen.

---

## 5. ARKITEKTURA E SISTEMIT

### 5.1 Arkitektura me Dosje-Funksioni

Kodi organizohet sipas **funksionit**, jo sipas shtresës teknike. Çdo funksion
nën `features/<emri>/` ka të njëjtën formë:

```
features/<emri>/
  api/         server actions ('use server') — i vetmi vend që flet me Supabase
  components/  komponentë React
  hooks/       hooks klienti (mbështjellës useQuery / useMutation)
  types/       ndërfaqe TS
  providers/   React context (kur duhet gjendje ndër-pemë)
```

11 funksionet: `admin`, `auth`, `buy-list`, `chef-bot`, `home`, `pantry-scan`,
`profile`, `recipes`, `settings`, `timer`, `voice`. Dosja `app/` mban vetëm
skedarë rrugësh të hollë të ndarë në dy grupe: `(marketing)` për faqen publike
dhe `(pages)` për produktin (`home`, `login`, `signup`, `share`, `admin`) —
**asnjë logjikë biznesi në shtresën e rrugëve**. Prova praktike e izolimit:
shtimi i mënyrës me zë (prill 2026) nuk kërkoi ndryshime jashtë
`features/voice/` përveç montimit të provider-it.

### 5.2 Modeli i Rrjedhës së të Dhënave (Optimistic UI)

```
Komponent klienti
   ↓ useQuery / useMutation (TanStack Query)
Server Action ('use server')
   ↓ supabase.from(...).insert/update/delete
revalidatePath('/...')            ← invalidim i cache-it të serverit
   ↓
Kanal Realtime (klienti browser) → invalidim i cache-it të klientit
```

Modeli i përditësimit optimist (referenca kanonike
`features/buy-list/hooks/use-buy-list.ts`, i zbatuar te shto/ndrysho/fshi):

1. `onMutate` — anulo query-t në fluturim → fotografo gjendjen → vendos
   optimistikisht cache-in;
2. `onError` — rikthe fotografinë;
3. `onSettled` — invalido query-n, që marrja e radhës të jetë autoritative.

Kjo zgjidh edhe garën realtime ↔ optimist: cache-i është "e vërteta" vetëm mes
`onMutate` dhe `onSettled`; jashtë asaj dritareje fiton serveri.

*Saktësim (i verifikuar në kod):* provider-i i zërit **nuk** përdor modelin
optimist — ai i thërret server actions drejtpërdrejt dhe invalidon cache-in pas
suksesit. Kjo është zgjedhje e vetëdijshme: konfirmimi i folur ("Added eggs") e
mbulon vonesën perceptuese që UI optimist synon ta fshehë.

### 5.3 Tre Klientët Supabase dhe Kufijtë e Sigurisë

| Klienti | Skedari | Çelësi | Përdorimi |
|---|---|---|---|
| Server | `lib/supabase/server.ts` | anon + cookie sesioni | Server actions & route handlers; i ndërgjegjshëm për cookie-t |
| Browser | `lib/supabase/browser.ts` | anon | Abonime Realtime (sidebar-i dëgjon `recipes`), ngarkim avatari, leximi i zgjedhjeve ditore |
| Admin | `lib/supabase/admin.ts` | **service-role** | Vetëm-server; operacionet `auth.admin.*` (listim/fshirje përdoruesish) |

Parimi: *bëje klientin e rrezikshëm dukshëm të rrezikshëm* — me emër
(`supabaseAdmin`) dhe me vendndodhje (importohet vetëm në
`features/admin/actions.ts`). Çelësi service-role anashkalon RLS-në, ndaj nuk
duhet të prekë kurrë bundle-in e klientit; ndarja fizike në tre skedarë e bën
shkeljen të dukshme në code review.

*Shënim ndershmërie:* siguria e pronësisë së rreshtave (p.sh. që një përdorues
të mos ndryshojë recetën e tjetrit) mbështetet te **politikat RLS në Supabase**,
të cilat menaxhohen jashtë repo-s; punimi e deklaron këtë si supozim
arkitekturor (§11.2).

### 5.4 Autentikimi dhe Mbrojtja e Rrugëve

- **Edge middleware** (`middleware.ts`) mbulon `/` dhe `/home/:path*`:
  i kyçuri në `/` ridrejtohet te `/home`; anonimi në `/home/*` te `/login`.
- **Metodat e hyrjes:** email/fjalëkalim dhe Google OAuth; callback-u
  (`app/auth/callback/route.ts`) shkëmben kodin për sesion cookie dhe ridrejton
  te `/home`.
- **Rrugët admin përjashtohen me vetëdije nga matcher-i.** Modeli i synuar është
  mbrojtja në thellësi: çdo server action i privilegjuar thërret vetë
  `checkIsAdmin()` (krahasim i email-it me listën `ADMIN_EMAILS`), në mënyrë që
  një rifaktorizim layout-i të mos mund ta heqë kurrë rojen. Ky model zbatohet
  në të gjitha veprimet CRUD të daily picks dhe cooking tips; gjatë auditimit
  final u identifikua se dy veprimet e menaxhimit të përdoruesve duhet ta marrin
  të njëjtën roje (regjistruar si kufizim/rregullim në §11.2) — vetë gjetja
  ilustron pikërisht pse modeli për-action kërkon disiplinë.

### 5.5 Skema e Bazës së të Dhënave

| Tabela / Burimi | Kolonat kryesore | Pronësia | Qasja |
|---|---|---|---|
| `recipes` | `id, title, content, updated_at, user_id` | Për përdorues | Server actions; Realtime broadcast |
| `buy_list_items` | `id, title, quantity, checked, created_at, user_id` | Për përdorues | Server actions |
| `daily_picks` | `id, title, category ∈ {savory, snack, dessert}, content, created_at` | Globale (kurohet nga admini) | Lexim publik nga klienti browser |
| `cooking_tips` | `id, tip, created_at` | Globale (kurohet nga admini) | Server actions |
| Storage: bucket `avatars` | skedarë imazhi `{user_id}-{rand}.{ext}` | Për përdorues | Klienti browser; URL publike në metadata të userit |
| `auth.users` (Supabase Auth) | menaxhohet nga platforma | — | `auth.admin.*` përmes klientit service-role |

Skema menaxhohet në Supabase, jo në repo; `user_id` referon `auth.users`.

---

## 6. ZHVILLIMI I SISTEMIT DHE FUNKSIONET

### 6.1 Rrjedha e Onboarding-ut dhe Autentikimi

- Faqja publike e marketingut (`app/(marketing)`) prezanton produktin me gjuhë
  vizuale "letër & bojë" (hero, marquee, manifest, veçori, vizion) dhe çon te
  login/signup.
- Hyrja: email/fjalëkalim ose Google OAuth; pas shkëmbimit të kodit te
  `/auth/callback`, përdoruesi ulet te `/home`. Middleware-i e bën rrjedhën të
  padukshme: `/` ridrejton sipas gjendjes së sesionit.
- **Profili:** modal me ngarkim avatari (në bucket-in `avatars` të Supabase
  Storage, URL-ja publike ruhet në metadata të përdoruesit) dhe ndryshim
  fjalëkalimi me validim në klient (përputhje + gjatësi minimale 6).
- Faqet auth kanë sfond të animuar dhe mikro-animacione ("quality of life")
  të shtuara që në shkurt 2026.

### 6.2 Faqja Kryesore dhe Zbulimi (ChefBot Daily Picks)

Faqja `/home` është një hapësirë pune tri-kolonëshe: sidebar-i me bibliotekën e
recetave (majtas), editori kryesor (qendër), lista e blerjeve + kohëmatësi
(djathtas), me topbar që shfaq një këshillë gatimi.

**ChefBot** — personazh i vizatuar nga vetë autori (me katër shprehje SVG) — u
rekomandon përdoruesve 3 zgjedhje ditore: një të kripur, një snack, një
ëmbëlsirë. Përzgjedhja është **deterministe pa scheduler**: data hash-ohet dhe
hash-i ushqen një PRNG me `Math.sin`, me kripë të veçantë për kategori:

```ts
const seed = `${year}-${month}-${day}`
let hash = 0
for (let i = 0; i < seed.length; i++) {
  hash = (hash << 5) - hash + seed.charCodeAt(i)
  hash = hash & hash
}
const random = (min, max, salt) => {
  const x = Math.sin(Math.abs(hash) + salt) * 10000
  return Math.floor((x - Math.floor(x)) * (max - min)) + min
}
// savory → salt 1, snack → salt 2, dessert → salt 3
```

Pasoja: të gjithë përdoruesit e së njëjtës datë kalendarike shohin të njëjtat
zgjedhje — pa cron, pa radhë, pa shtresë cache. *Determinizmi e eliminon
gjendjen.* Çdo zgjedhje ruhet në bibliotekë me një klikim.

*Saktësim teknik:* llogaritja kryhet në klient me datën lokale të shfletuesit,
ndaj "identike për të gjithë" vlen brenda së njëjtës zonë orare; përdorues në
zona të ndryshme mund të kalojnë në ditën e re në momente të ndryshme (§11.2).

### 6.3 Pantry Scan: Gjenerimi Multimodal i Recetave

Rrjedha e plotë, e verifikuar në kod:

1. **Hyrja (klient):** tre mënyra — *snap* (kamera), *upload* (skedar), *text*
   (listë e shtypur përbërësish). Imazhi **ngjishet në klient** përpara
   dërgimit: ripërmasohet me canvas në max 1024 px dhe rikodohet JPEG me cilësi
   0.8 — ul bandwidth-in dhe koston e token-ave.
2. **Server action i autentikuar:** `generateRecipesFromPantry` verifikon
   përdoruesin me `supabase.auth.getUser()` përpara çdo thirrjeje modeli; çelësi
   `GOOGLE_GENERATIVE_AI_API_KEY` lexohet vetëm në server dhe nuk shfaqet kurrë
   në bundle-in apo network tab-in e klientit.
3. **Thirrja e Gemini 2.5 Flash:** një kërkesë e vetme multimodale — system
   prompt + (opsionale) pjesa `inlineData` me imazhin + (opsionale) teksti i
   përbërësve; konfigurimi `responseMimeType: 'application/json'`,
   `temperature: 0.7`. Prompt-i kërkon identifikimin e përbërësve dhe **saktësisht
   3 receta dukshëm të ndryshme** (kuzhina të ndryshme ose e shpejtë / mesatare /
   e detajuar), me trup Markdown (përbërës me pika + hapa të numëruar).
4. **Zarfi JSON:**

```json
{
  "ingredients": ["...", "..."],
  "recipes": [
    { "title": "...", "content": "Markdown: Ingredients + Steps" },
    { "title": "...", "content": "..." },
    { "title": "...", "content": "..." }
  ]
}
```

5. **Parsimi mbrojtës:** provohet `JSON.parse` i drejtpërdrejtë; në dështim
   hiqen gardhet e kodit (```` ```json ````) dhe riprovohet; në fund validohet
   forma (`ingredients[]`, `recipes[]`). *Dalja e LLM-së trajtohet si
   këshilluese, jo si kontratë.*
6. **Ruajtja selektive:** të tria recetat kthehen të përzgjedhura; përdoruesi
   heq ato që s'i do dhe i ruan të mbeturat në bibliotekë (nga një thirrje
   `createRecipe` secila), me ridrejtim te receta e parë e ruajtur.

### 6.4 Biblioteka e Recetave dhe Ndarja me URL

- **Biblioteka:** CRUD i plotë përmes server actions; editori ka **autosave të
  debounced** (1 s pas ndalimit të shkrimit) me gjendje lokale pasqyre, që
  shkrimi të ndihet i menjëhershëm ndërsa ruajtja shkon në sfond.
- **Realtime:** sidebar-i abonohet në kanalin postgres_changes të tabelës
  `recipes` me klientin browser; çdo ndryshim (edhe nga një pajisje/tab tjetër)
  invalidon query-n `['recipes']` — sinkronizim ndër-pajisje pa polling.
- **Ndarja pa backend:** `handleShare` serializon `{title, content}`, e ngjesh
  me `lz-string.compressToEncodedURIComponent` dhe ndërton
  `/share?data=<ngarkesa>` — **URL-ja është vetë receta**; asgjë nuk ruhet në
  server, s'ka tabelë ndarjesh, s'ka rreshta jetimë, s'ka ekspozim shtesë GDPR.
- **Marrësi:** faqja `/share` e dekompreson, e validon formën
  (titull i pranishëm, përmbajtje e përcaktuar), e shfaq si preview dhe ofron
  "Add to My Recipes" — një thirrje `createRecipe` në llogarinë e marrësit (me
  mesazh të qartë gabimi nëse s'është i kyçur).

### 6.5 Lista e Blerjeve dhe Kohëmatësi

**Lista e blerjeve** është implementimi kanonik i UI-së optimiste (§5.2):
shtimi krijon menjëherë një artikull të përkohshëm me `id: Date.now()`,
ndryshimi/fshirja pasqyrohen në çast, dhe çdo gabim rikthen fotografinë e
mëparshme — ndjesi e menjëhershme edhe në rrjete të ngadalta.

**Kohëmatësi** ka dy mënyra (kronometër dhe numërim mbrapsht me tick 10 ms) dhe
ekspozohet përmes `TimerProvider` që UI dhe zëri ta drejtojnë pa prop-drilling.
Detaj i verifikuar në kod: gjendja ruhet në `localStorage` bashkë me një
**timestamp**, dhe në ringarkim rindërtohet koha e kaluar — një kohëmatës në
punë e mbijeton rifreskimin e faqes, madje llogarit edhe kohën e kaluar sa faqja
ishte mbyllur (ruajtje në `beforeunload` dhe `visibilitychange`).

### 6.6 Mënyra me Zë

`VoiceProvider` orkestron tre API shfletuesi dhe dy funksione të tjera të
aplikacionit:

- **`useVoiceRecognition`** — mbështjellës i tipizuar i `SpeechRecognition`
  (me fallback `webkitSpeechRecognition`), në mënyrë të vazhdueshme
  (`continuous: true`), me rinisje automatike në `onend`. Gabimet ndahen në
  **fatale** (`network`, `not-allowed`, `audio-capture`,
  `language-not-supported` — fikin mënyrën me zë me mesazh të veprueshëm, p.sh.
  "Speech service unreachable — on Linux Chromium this often fails") dhe
  **kalimtare** (`no-speech`, `aborted` — shpërfillen).
- **`useSpeechSynthesis`** — konfirmime të folura ("Timer started", "Added
  eggs"). Detaj kyç kundër vetë-dëgjimit: njohja **pauzohet sa flet sinteza**
  (`paused: speaking`), që aplikacioni të mos i interpretojë konfirmimet e veta
  si komanda.
- **`useWakeLock`** — mban ekranin ndezur gjatë dëgjimit dhe **e rimerr
  bllokimin** kur faqja rikthehet në fokus (`visibilitychange`).

Transkripti ushqen `parseCommand` — parser determinist me regex mbi një
gramatikë të mbyllur (11 lloje komandash):

| Qëllimi | Shembuj thëniesh | Veprimi |
|---|---|---|
| `set-timer` | "set a timer for ten minutes", "5 minutes 30 seconds timer" | Kalon në countdown, nis kohën (mbështet orë+minuta+sekonda, shifra dhe numra me fjalë) |
| `start-timer` / `stop-timer` / `reset-timer` | "start", "pause the timer", "reset" | Drejton kohëmatësin |
| `set-timer-mode` | "switch to stopwatch", "countdown mode" | Ndërron mënyrën |
| `add-buy-item` | "add eggs to my list" | Shton në listën e blerjeve |
| `remove-buy-item` | "remove milk from the list" | Fshin artikullin |
| `check-buy-item` | "check off bread" / "uncheck bread" | Shënon / çshënon |
| `list-buy-items` | "what's on my list", "read my list" | E lexon listën me zë |
| `voice-off` | "stop listening", "voice off" | Fik mënyrën me zë |
| `unrecognized` | çdo gjë tjetër | Shpërfillet në heshtje |

Komandat e listës përdorin **përputhje nënvargu** pa ndjeshmëri shkronjash mbi
cache-in e TanStack Query, me dizambiguim eksplicit: pa përputhje → "I don't
see X on the list"; shumë përputhje → "Multiple matches. Be more specific."

**Pse regex dhe jo LLM?** Komandat e gatimit janë një gramatikë e vogël e
mbyllur. Parser-i lokal kushton ~0.007 ms (mediana e matur, §8.1) dhe zero para;
një thirrje LLM do shtonte qindra milisekonda vonesë dhe faturë për çdo thënie,
pa fituar asgjë në një gramatikë të mbyllur. Determinizmi e bën edhe të
testueshëm si funksion i pastër. *LLM-të fitojnë në gjuhë të hapur — këtu do
ishin mjeti i gabuar* (në përputhje me McTear, 2022).

### 6.7 Paneli i Administratorit

- Katër pamje: dashboard, **Chatbot** (CRUD i `daily_picks` me kategori
  savory/snack/dessert), **Cooking Tips** (CRUD i `cooking_tips`) dhe **Users**
  (listim + fshirje përmes `auth.admin.*` me klientin service-role).
- Të gjitha veprimet CRUD të përmbajtjes ruhen me `checkIsAdmin()` në krye të
  action-it; dialogë konfirmimi mbrojnë çdo fshirje.
- Rrugët `/admin/*` qëndrojnë jashtë matcher-it të middleware-it me vetëdije —
  siguria jetën në shtresën e action-eve, jo në layout (§5.4).

---

## 7. SISTEMI I DIZAJNIT DHE PËRVOJA E PËRDORUESIT

### 7.1 Filozofia e Dizajnit dhe Gjuha Vizuale

- **Identiteti:** fonti display "Outfit", paleta me bazë jeshile brand-i dhe
  maskota ChefBot e vizatuar nga autori (katër shprehje SVG: normal, happy,
  wink, eyes-closed) — aplikacioni ka karakter, jo vetëm funksion.
- **Dy gjuhë vizuale me qëllim:** faqja e marketingut përdor estetikë
  "letër & bojë" (sfond letre `#f3f1ec`, font serif display, pika grid-i si
  letër milimetrike, marquee, animacione ngritjeje/lundrimi) — si fletore
  gatimi; produkti brenda është i pastër, i dendur në funksion, me tonalitet
  brand-i.
- **Sistemi "3D lit-surface"** (qershor 2026): çdo sipërfaqe trajtohet si objekt
  fizik i ndriçuar nga lart — vijë e brendshme e bardhë në buzën e sipërme,
  gradient i lehtë lart-poshtë, vijë e errët në buzën e poshtme, hije e butë
  rënieje. Katër "gjendje" thellësie: *raised* (karta, artikuj liste),
  *panel* (sipërfaqja kryesore e punës), *sunken* (fushat e shkrimit),
  *well* (zonat e hedhjes së skedarëve). Butonat shtojnë gjendjen *pressed*
  (gradienti përmbyset + zhvendosje 1 px poshtë). E gjithë teknika ndërtohet nga
  dy primitivë — gradient linear + `box-shadow` të shtresuara — pa imazhe e pa
  DOM shtesë.
- **Rregulli i artë i alfave:** token-at e sipërfaqeve janë vetëm e bardhë/e zezë
  me alfa mbi një bazë me ngjyrë — kurrë ngjyra të koduara — ndaj i mbijetojnë
  çdo teme dhe çdo mode drite pa variante `dark:` në call site.

### 7.2 Token-at CSS-first dhe Hapësira OKLCH

- Tailwind v4 pa `tailwind.config.js`: të gjithë token-at te `app/globals.css`
  nën `@theme inline` — sistemi i dizajnit bashkëjeton me stilet, pa burim të
  dytë të së vërtetës.
- Paleta bazë (background, foreground, card, brand, etj.) shprehet në **OKLCH**
  — hapësirë perceptualisht uniforme: ndryshimet e lehtësisë duken të barabarta
  për syrin, ndaj i njëjti token funksionon mbi kontekste të ndryshme pa
  rregullime manuale. *(Saktësim: mbivendosjet e temave përdorin vlera hex të
  markës — uniformiteti OKLCH vlen për paletën bazë.)*
- Utilitetet e sipërfaqeve 3D ekspozohen si `@utility` (klasa të thjeshta që nuk
  përplasen me `bg-*` në `tailwind-merge`).

### 7.3 Katër Temat e Zgjedhshme

- `green` (parazgjedhje, pa klasë) + `theme-red` / `theme-blue` / `theme-yellow`
  si klasa në `<html>`; ruhen në `localStorage` (`app-theme`).
- Tematizimi me klasa (jo ndërrim variablash në runtime) shfrytëzon kaskadën,
  s'ka FOUC, dhe çdo temë mund të mbivendosë çdo token pastër. Logoja e
  aplikacionit ndërrohet sipas temës (katër SVG).
- Detaj i verifikuar: cilësimet përdorin `useSyncExternalStore` mbi eventet
  `storage`, ndaj ndryshimi i temës në një tab **sinkronizohet automatikisht në
  tab-et e tjera** të hapura.

### 7.4 Komponentët (shadcn/ui + Radix) dhe Konsistenca

- shadcn/ui (preseti "new-york") mbi primitivë Radix: button, card, dialog,
  alert-dialog, popover, select, sheet, table, checkbox, input, textarea, label
  — të kopjuar në repo, pra plotësisht të zotëruar e të personalizueshëm.
- Vetëm primitivët gjenerikë rrinë te `components/ui`; kompozitat specifike
  jetojnë pranë funksionit që i përdor (`features/<emri>/components`).
- `cn()` (`clsx` + `tailwind-merge`) është kompozuesi standard i klasave;
  ikonat nga lucide-react; animacionet nga tw-animate-css.

### 7.5 Responsiviteti dhe Aksesueshmëria

- Layout-i kryesor: tri kolona në desktop; në mobile sidebar-i dhe panelet
  anësore paloset në sheet/menu (rregullimet mobile, commit-et e prillit 2026);
  lartësia përdor `100dvh` për viewport-et mobile.
- Aksesueshmëria: primitivët Radix sjellin semantikë ARIA të saktë "falas";
  **mënyra me zë është në vetvete veçori aksesueshmërie** për përdorues me
  kufizime motorike ose me duar të zëna; konfirmimet e folura mbyllin lakun e
  reagimit pa e detyruar përdoruesin të shohë ekranin; wake lock parandalon
  fikjen e ekranit në mes të recetës.

---

## 8. MBLEDHJA E TË DHËNAVE DHE VLERËSIMI

Mjedisi i matjeve: Linux 6.18 (Fedora), Node v22.22.0, një makinë e vetme,
qershor 2026. Skriptet jetojnë në `bench/` dhe janë të ri-ekzekutueshme; kodi
burimor i matur **nuk u modifikua**.

### 8.1 Të Dhënat Primare I — Parser-i Zanor (vonesa + saktësia)

**Metoda:** 56 thënie të kuruara e të etiketuara me dorë që mbulojnë çdo qëllim
të parser-it, përfshirë 5 hyrje të vështira/me gabime shkrimi me qëllim; çdo
thirrje e matur individualisht me `performance.now()`; qëllimet krahasohen në
nivel nën-qëllimi (countdown vs stopwatch; check vs uncheck).

| Metrika | Vlera |
|---|---|
| Madhësia e test-set-it | 56 thënie |
| Të sakta | 52 |
| **Saktësia** | **92.86 %** |

Të katërta dështimet ishin te hyrjet e vështira me qëllim — **çdo thënie e
pastër/kanonike kaloi**:

| Thënia | Pritej | U mor | Arsyeja |
|---|---|---|---|
| "give me a timer for 3 minutes" | set-timer | unrecognized | folja "give" jashtë listës `set/start/begin/make` |
| "pause the timer please" | stop-timer | unrecognized | "please" fundore thyen regex-in e ankoruar `^…$` |
| "ad milk to my list" | add-buy-item | unrecognized | gabim shkrimi "ad" (pa përputhje fuzzy) |
| "timer 90 seconds" | set-timer | unrecognized | kërkohet "for"/"of" pas "timer" |

Vonesa (n = 56):

| Metrika | ms |
|---|---|
| Nisje e ftohtë (thirrja e parë) | 0.580 |
| Mediana në gjendje të qëndrueshme | **0.007** |
| p95 | 0.321 |
| Maksimumi | 1.226 |

Interpretimi: parser-i është praktikisht falas (nën-milisekondë — në dyshemenë e
rezolucionit të timer-it JS); rezultati kuptimplotë është **saktësia mbi
frazime natyrale**, ku qëndrueshmëria bie te foljet jashtë gramatikës, fjalët e
mirësjelljes në fund dhe gabimet e shkrimit.

### 8.2 Të Dhënat Primare II — Pipeline-i Pantry Scan / Gemini

**Metoda:** 20 ekzekutime sekuenciale mbi të njëjtin imazh (flat-lay përbërësish
pjekjeje: sheqer, vezë, miell, gjalpë, vanilje), model `gemini-2.5-flash`, pa
retry/backoff (si në prodhim). Meqë server action-i kërkon kontekst kërkese
Next.js (auth me cookie), skripti riimplementon fjalë-për-fjalë gjysmën
pas-auth të pipeline-it, me **kontroll integriteti në runtime** që lexon
`scan.ts` dhe ndalon nëse ndonjë konstante e kopjuar ka devijuar (kaloi).

| Metrika | Vlera |
|---|---|
| Ekzekutime | 20 |
| **Sukses nga skaji në skaj** (JSON + formë e vlefshme) | **85.0 % (17/20)** |
| Dështime | 3 — të gjitha gabime upstream të API-së (2× HTTP 503, 1× HTTP 429 free-tier) |
| **Besueshmëria e pipeline-it kur API-ja u përgjigj** | **100 % (17/17)** — 0 raste kërkuan fallback-un e code-fence; 17/17 përputhën zarfin `{ingredients[], recipes[3×{title,content}]}` |
| Vonesa mediane (17 të sukseshmet) | **15 217 ms** |
| p95 / min / max | 23 655 / 10 365 / 23 655 ms |

**Dallueshmëria e recetave:** brenda çdo ekzekutimi — 3 tituj të ndryshëm në të
17 rastet (0 dublikata brenda-ekzekutimit). Ndërmjet ekzekutimeve — vetëm 31
tituj unikë nga 51 (modeli konvergjon fort te të njëjtat gatime për të njëjtin
imazh: "simple vanilla sponge cake" 8×, "sesame butter cookies" 6×).

**Kostoja (e matur në token-a, 17 ekzekutime):** hyrje 8 262; dalje e dukshme
19 028; total 55 192 → ≈27 902 token-a "thinking". Kosto reale: ~$0 (free tier).
Vlerësim me tarifa të supozuara ($0.30/1M in, $2.50/1M out): $0.05–$0.12 për të
17 thirrjet → **≈ $0.007 për skanim të suksesshëm**.

**Flamuj ndershmërie:** (1) 85%-shi ngatërron disponueshmërinë e infrastrukturës
me korrektësinë e pipeline-it — vetë pipeline-i qe 100% i besueshëm në çdo
përgjigje; (2) prodhimi s'ka retry/backoff, ndaj këto dështime do i dilnin
drejtpërdrejt përdoruesit; (3) tarifat janë të supozuara, jo autoritative.

### 8.3 Të Dhënat Sekondare — Auditimi Lighthouse

**Metoda:** build prodhimi lokal (`next build` + `next start`, port 3100, i
konfirmuar me bundle të hash-uara dhe `Cache-Control` prodhimi); Lighthouse
13.4.0, Chromium headless, **mobile + throttling i simuluar** (Slow-4G, 4× CPU);
3 ekzekutime mbi rrugën publike `/login`.

| Metrika | Ekz. 1 | Ekz. 2 | Ekz. 3 | **Mediana** |
|---|---|---|---|---|
| **Performance score (0–100)** | 87 | 82 | 95 | **87** |
| **LCP** (ms) | 3264 | 3319 | 2675 | **3264** |
| **CLS** | 0.000 | 0.000 | 0.000 | **0.000** |
| **TTFB** (ms) | 9 | 3 | 2 | **3** |
| FCP (ms) | 2739 | 2793 | 1837 | 2739 |
| Speed Index (ms) | 3062 | 4590 | 1837 | 3062 |
| Total Blocking Time (ms) | 100 | 200 | 55 | 100 |

**Flamuj:** TTFB ~3 ms është localhost — jo përfaqësues i prodhimit; varianca
mes ekzekutimeve (82–95) vjen nga throttling i simuluar në makinë të
përbashkët — raportohet mediana; LCP ~3.3 s nën Slow-4G të simuluar është
leva kryesore e përmirësimit, ndërsa CLS 0.000 është i përsosur.

### 8.4 Kufizimet e Mbledhjes së të Dhënave

- Rruga e autentikuar `/home` **nuk** u auditua (kthen 307 → /login pa
  kredenciale headless; nuk u falsifikua hyrja).
- Imazhi i testit është flat-lay përbërësish, jo brendësi e vërtetë frigoriferi.
- Free tier-i i Gemini-t (5 kërkesa/min) shkaktoi vetë njërën nga dështimet
  (429) — kufizim i mjedisit, jo i pipeline-it.
- Pipeline-i u ri-implementua për matje (me kontroll integriteti) sepse action-i
  s'ka eksport "core logic" të veçueshëm — mësim për testueshmërinë (§11.3).
- n = 20 për pipeline-in dhe 56 thënie për parser-in: mjaftueshëm për tendenca,
  jo për intervale të ngushta besimi.

---

## 9. ANALIZA DHE REZULTATE

### 9.1 Vendimet Inxhinierike dhe Kompromiset

| Vendimi | Arsyeja | Kompromisi i pranuar |
|---|---|---|
| Server Actions për të gjitha shkrimet | Një kufi autentikimi; sekretet në server; rivalidim i integruar | Lidhje me modelin e Next.js; vështirësi testimi të veçuar (§11.3) |
| TanStack Query për leximet | UI optimist pa reducer-a; retry/dedupe/refetch falas | Kërkon disiplinë ndaj modelit onMutate/onSettled |
| Tre klientë Supabase | Kufi i dukshëm cookie / realtime / admin | Tre skedarë për t'u mirëmbajtur |
| Parser komandash me regex | ~0.007 ms dhe $0 për thënie kundrejt qindra ms + faturë me LLM | I brishtë ndaj frazimit jashtë gramatikës (92.86%, §8.1) |
| Zgjedhje ditore deterministe | Pa cron, pa cache; të nxjerrshme nga data | Kërkon tabelë të kuruar; llogaritja në klient e lidh me zonën orare |
| Ruajtje admin për çdo action | I mbijeton rifaktorizimeve më mirë se një rojë layout-i | Kërkon disiplinë — çdo action i ri duhet ta mbajë mend rojen |
| URL ndarjeje të kompresuara | Zero ruajtje, zero rreshta jetimë, GDPR minimal | URL të gjata për receta të mëdha |
| Ngjeshje imazhi në klient (1024px/JPEG 0.8) | Ul bandwidth-in dhe token-at e hyrjes | Humbje e lehtë detajesh në foto shumë të mëdha |

### 9.2 Interpretimi i të Dhënave kundrejt Objektivave

| Objektivi | Rezultati i matur | Verdikti |
|---|---|---|
| O1: 3 receta të dallueshme | 17/17 përgjigje me saktësisht 3 tituj të ndryshëm | **Arritur empirikisht** — por e imponuar nga prompt-i, jo nga kodi (validohet forma, jo numërimi; shih §11.2) |
| O2: ≥10 qëllime, <10 ms, 0 kosto | 11 lloje komandash; mediana 0.007 ms; $0 | **Arritur** — dhe 3 rende magnitudë nën synim |
| O3: Zgjedhje ditore identike | Determinizëm i verifikuar në kod | **Arritur me kualifikim** — identike brenda së njëjtës zonë orare (llogaritje në klient) |
| O4: Rikthim optimist i besueshëm | Modeli snapshot→rollback i implementuar në të tre mutacionet | **I implementuar; i pa-testuar formalisht** nën dështim të simuluar rrjeti (mungon suita e testeve, §11.2) |
| O5: Ngarkim < 2 s | LCP mediane 3.26 s nën Slow-4G të simuluar; TTFB 3 ms (localhost) | **I paarritur nën throttling** — i pamatshëm realisht pa deployment publik (§11.3) |

Leximi i përgjithshëm: objektivat teknikë të kontrolluar nga kodi u arritën ose
u tejkaluan; objektivat që varen nga infrastruktura e jashtme (modeli i AI-së,
rrjeti) u arritën me kualifikime që maten e raportohen — dhe pikërisht ky
dallim (çfarë kontrollon dot arkitektura vs çfarë jo) është një nga gjetjet e
punimit.

### 9.3 Krahasimi me Literaturën

- Rezultati i parser-it (92.86% saktësi, kosto zero, nën-milisekondë) e
  konfirmon empirikisht argumentin e McTear (2022) dhe Hancock et al. (2020):
  për gramatika të mbyllura, determinizmi dominon LLM-në në vonesë e kosto —
  ndërsa dështimet e tij (folje të reja, "please", gabime shkrimi) tregojnë
  saktësisht se ku fillon territori i LLM-së.
- Besueshmëria 100% e parsimit JSON (0 raste code-fence në 17 përgjigje) tregon
  se `responseMimeType: 'application/json'` + prompt i rreptë është efektiv në
  praktikë — por parseri mbrojtës mbetet i justifikuar si sigurim, në linjë me
  qasjen "dalja e LLM-së është këshilluese".
- Konvergjenca ndër-ekzekutime e recetave (31/51 tituj unikë) i jep evidencë
  sasiore shqetësimit të homogjenizimit të përmbajtjes (krh. Trattner &
  Elsweiler, 2017) edhe në gjenerim, jo vetëm në rekomandim.
- Rasti studimor i dosjeve-funksion (11 funksione, zero ndryshime ndër-funksion
  për shtimin e zërit) i jep trajtim empirik modelit të popullarizuar vetëm
  praktikisht (Dodds, 2021).

### 9.4 Inovacioni dhe Vlera Unike

1. **Një stack web, rrjedhë e plotë pune** — planifiko + zbulo + gatuaj në një
   sipërfaqe shfletuesi, pa aplikacion shoqërues e pa harduer pronësor.
2. **AI multimodale si funksion i vërtetë** — foto + tekst në një thirrje, zarf
   JSON i rreptë, parser mbrojtës, çelës që s'del kurrë nga serveri, ngjeshje
   imazhi në klient dhe çelës fikjeje për përdoruesin.
3. **Zë native i shfletuesit që kontrollon gjendje reale** — jo vetëm kohëmatës:
   shton, heq, shënon e lexon listën e blerjeve, me anti-vetëdëgjim dhe
   dizambiguim.
4. **Përmbajtje ditore deterministe me zero infrastrukturë** — hash i datës në
   vend të një cron-i, radhe dhe cache-i.
5. **Ndarje pa ruajtje** — URL-ja është ngarkesa.
6. **Shabllon arkitekturor i riprodhueshëm** — pesë nëndosje, një pikë hyrjeje,
   i provuar mbi 11 funksione.

---

## 10. KONKLUZIONE DHE REKOMANDIME

### 10.1 Përmbledhja e Rezultateve

Punimi dorëzon një aplikacion web në nivel prodhimi që bashkon AI-në
multimodale (Gemini 2.5 Flash: imazh + tekst → 3 receta JSON të strukturuara),
sinkronizimin në kohë reale (Supabase Realtime) dhe kontrollin zanor native të
shfletuesit (Web Speech + Wake Lock, parser determinist me 11 qëllime) — mbi një
arkitekturë me 11 dosje-funksion, server actions si sipërfaqe e vetme
mutacionesh dhe tre klientë Supabase me role të ndara. Vlerësimi empirik mat:
92.86% saktësi parser-i me vonesë nën-milisekondë; 100% besueshmëri parsimi të
pipeline-it AI mbi përgjigjet e marra me ~15.2 s vonesë mediane dhe ~$0.007 kosto
për skanim; Lighthouse 87 (mediane) me CLS 0.000 në rrugën publike.

### 10.2 Implikimet e Studimit

- **Për praktikuesit:** platforma web e sotme mjafton për përvoja AI-first, pa
  duar e në kohë reale — pa binarë native e pa harduer pronësor; kufiri kritik
  s'është më teknologjia, por disiplina arkitekturore (kufij të dukshëm sigurie,
  modele të përsëritshme mutacionesh).
- **Për literaturën:** evidencë empirike për (a) determinizëm > LLM në gramatika
  të mbyllura, (b) efektivitetin praktik të daljes JSON të kufizuar me skemë +
  parsimit mbrojtës, (c) trajtim rasti studimor për dosjet-funksion.
- **Parimi përmbledhës:** *përdor AI-në aty ku shton vlerë unike (vizioni,
  gjenerimi) dhe shmang atë ku determinizmi është më i mirë (komandat,
  rotacioni ditor)* — vendosja e kufirit AI/jo-AI është vetë një vendim dizajni.

### 10.3 Rekomandime për Kërkime të Ardhshme

- **Afatshkurtër (inxhinierike):** suitë testesh (Playwright për auth; teste
  njësie për `parseCommand` — funksion i pastër; DB testimi Supabase për
  actions); rate limiting në endpoint-in e AI-së; cache me content-hash për
  skanime identike; fallback transkriptimi me Whisper ku Web Speech dështon;
  tabelë rolesh + RLS në vend të `ADMIN_EMAILS`; unifikimi i rojes admin mbi të
  gjitha veprimet e privilegjuara.
- **Afatgjatë (kërkimore):** studim përdorshmërie think-aloud (n ≈ 6–10) i
  rrjedhës zanore në kushte reale kuzhine; personalizim dietik/alergjish si
  bllok konteksti në prompt dhe ndikimi i tij në dallueshmëri; zë shumëgjuhësh
  me harta të lokalizuara qëllimesh; PWA offline; lista blerjeje familjare
  bashkëpunuese mbi kanale Realtime; gjenerim i kuruar i zgjedhjeve ditore me
  LLM + radhë miratimi nga admini.

---

## 11. KUFIZIME

### 11.1 Perspektiva e Studimit

- Projekt me një zhvillues të vetëm: vlerësimi i "mirëmbajtshmërisë" së
  arkitekturës mbështetet në historinë e Git-it dhe reflektim, jo në një ekip.
- Pa studim me përdorues realë në këtë fazë — pohimet e përdorshmërisë "pa duar"
  mbeten arkitekturore/empirike-teknike, jo humane (studimi think-aloud është
  planifikuar si punë e ardhshme, me miratim etik).
- Vlerësimi u krye në një makinë të vetme zhvillimi, jo në deployment publik.

### 11.2 Kufizimet Teknike

- **Pa suitë testesh të automatizuara** — boshllëku me prioritetin më të lartë;
  rikthimi optimist (O4) është i implementuar por i pa-verifikuar nën dështim të
  simuluar.
- **Web Speech API i pabarabartë:** dështime `network` në Chromium mbi Linux
  (të dokumentuara e të trajtuara me mesazh të veprueshëm); gjuha e njohjes e
  fiksuar në `en-US`.
- **Pa rate limiting dhe pa cache** në endpoint-in e AI-së: dy përdorues me të
  njëjtin frigorifer paguajnë dy herë; dështimet 429/503 i dalin drejtpërdrejt
  përdoruesit (pa retry/backoff).
- **"Saktësisht 3 receta" imponohet nga prompt-i, jo nga kodi** — validohet
  forma e zarfit, jo numërimi; empirikisht 17/17, por pa garanci kontrate.
- **Zgjedhjet ditore llogariten në klient me datën lokale** — identike brenda
  një zone orare, jo globalisht; edhe leximi i `daily_picks` bëhet me klientin
  browser (përjashtim i dokumentuar nga parimi "vetëm server actions").
- **Autorizimi admin me email** (`ADMIN_EMAILS`) — i mjaftueshëm për shkallën e
  projektit, jo për prodhim; gjatë auditimit u gjet se veprimet e menaxhimit të
  përdoruesve (`getUsers`, `deleteUser`) nuk e thërrasin ende `checkIsAdmin()` —
  rregullim i identifikuar që konfirmon koston e disiplinës së modelit
  për-action.
- **Pronësia e rreshtave varet nga RLS** e konfiguruar në Supabase (jashtë
  repo-s) — supozim arkitekturor i padëshmueshëm nga vetë kodi.
- **Defekte të vogla të gjetura në auditim:** këshillat e gatimit në topbar
  merren përmes një action-i të ruajtur për admin, ndaj përdoruesit e thjeshtë
  nuk i shohin; metadata e faqes (`title`) ka mbetur placeholder.

### 11.3 Kufizimet Metodologjike

- **n i vogël:** 20 ekzekutime pipeline-i dhe 56 thënie parser-i — të
  mjaftueshme për tendenca të qarta, jo për intervale të ngushta besimi;
  dallueshmëria u mat mbi një imazh të vetëm (flat-lay, jo frigorifer real).
- **Free tier i Gemini-t** kontaminoi shkallën e suksesit nga-skaji-në-skaj
  (429 nga kuota, jo nga pipeline-i); kostoja e paguar është vlerësim me tarifa
  të supozuara.
- **Lighthouse në localhost:** TTFB jo-përfaqësues; `/home` e paauditueshme pa
  kredenciale; varianca e throttling-ut të simuluar kërkoi raportim me medianë.
- **Testueshmëria e server actions:** lidhja e fortë auth ↔ logjikë brenda një
  funksioni të vetëm detyroi ri-implementim të kontrolluar për matje — vetë ky
  fakt është gjetje metodologjike (nevoja për ndarje "core logic" të
  eksportueshme).
- Datat/kohëzgjatjet e fazave të zhvillimit janë rindërtim retrospektiv nga
  Git-i, jo regjistrim prospektiv.

---

## Referencë e Shpejtë (numrat kryesorë për mbrojtjen)

- **11** dosje-funksion të mbyllura në vetvete · **3** klientë Supabase · **4** tema (0 konfigurim JS)
- **3** receta për skanim (17/17 empirikisht) · **3** zgjedhje ditore deterministe · **11** qëllime zëri
- Parser: **92.86%** saktësi · **0.007 ms** medianë · **$0** kosto për thënie
- Pipeline AI: **100%** besueshmëri parsimi · **15.2 s** medianë · **≈$0.007**/skanim
- Lighthouse `/login`: **87** medianë · **CLS 0.000** · 32 commit-e (tetor 2025 – qershor 2026)
