# Doracaku i Tezës — Pikat Kryesore

Një referencë e përmbledhur e titujve, nëntitujve dhe pikave kryesore për secilin
kapitull. Ndërtuar për t'u lexuar me një shikim gjatë shkrimit dhe mbrojtjes. Detajet
më të thella gjenden te `THESIS_NOTES.md`, `presentation-data.md` dhe `proposal-section-b.md`.

**Projekti:** Një shoqërues gatimi i fuqizuar nga AI dhe i komanduar me zë — një aplikacion
web multimodal që e ndihmon kuzhinierin e shtëpisë të **planifikojë**, **zbulojë** dhe **gatuajë**.
**Stack-u:** Next.js 16 · React 19 · TypeScript strict · Supabase · Google Gemini 2.5 Flash.

---

## 1. Hyrje

### 1.1 Problemi
- Gatimi është armik i prekjes — duart e lagura, ngjitëse e të zëna luftojnë me ekranin me prekje.
- Rrjedha e punës është e copëtuar: recetat në një aplikacion, lista e blerjeve në një tjetër, kohëmatësi te soba.
- Mjetet e AI-së për receta marrin *vetëm tekst* — i shpërfillin ato që ke vërtet në frigorifer.

### 1.2 Pse Ka Rëndësi Tani
- 30–40% e ushqimit familjar shkon dëm; "gatuaj me ato që kam" e zvogëlon këtë.
- AI multimodal (Gemini, GPT-4o) më në fund është mjaftueshëm i lirë/i shpejtë për funksione për çdo kërkesë.
- UX-i i kuzhinës inteligjente është i lidhur me harduer pronësor (Alexa, Google Home) — shfletuesi jo.

### 1.3 Motivimi
- Të bashkojë planifiko → zbulo → gatuaj në një sipërfaqe web koherente, pa instalim native.

---

## 2. Objektivi i Kërkimit

### 2.1 Qëllimet Kryesore
- Të nxjerrë një aplikacion web në nivel prodhimi që mbulon të gjithë rrjedhën e gatimit në shtëpi.
- Të trajtojë AI-në multimodale (imazh + tekst → JSON i strukturuar) si funksion të klasit të parë, jo si demo.
- Të ndërtojë një shtresë zëri pa duar duke përdorur vetëm API-të e shfletuesit.
- Të validojë një arkitekturë të ripërdorshme me dosje-funksioni për aplikacione Next.js të madhësisë mesatare.

### 2.2 Pyetjet e Kërkimit
- A mund një stack i vetëm web të ofrojë AI multimodal + sinkronizim në kohë reale + zë pa një backend të personalizuar?
- Cilat modele e mbajnë një aplikacion Next.js të pasur me funksione të mirëmbajtshëm ndërsa funksionet shumohen?
- Kur duhet zgjedhur logjika deterministe mbi një LLM për interpretimin e komandave?
- Si i imponojnë server actions një kufi të pastër sigurie klient / të-dhëna-përdoruesi / admin?

### 2.3 Objektiva të Matshme
- Pantry Scan kthen saktësisht 3 receta të dallueshme, 100% të rasteve.
- Parser-i i zërit përballon ≥10 qëllime (intents) në mënyrë deterministe, ~0 kosto AI për kërkesë, parsim <10ms.
- Zgjedhjet ditore identike për të gjithë përdoruesit në të njëjtën datë (hash determinist).
- Rikthimi i Optimistic-UI i besueshëm nën dështim të simuluar të rrjetit.

---

## 3. Sfondi / Zgjidhjet Ekzistuese

### 3.1 Panorama
- **Biblioteka recetash** (Yummly, Paprika): kërkim me tekst, futje manuale, pa AI imazhi.
- **Pantry-to-recipe** (SuperCook, MyFridgeFood): përputhje e bazuar në rregulla mbi një bazë të dhënash *statike*.
- **Chat gjenerik me AI** (ChatGPT, Gemini): bisedues, por pa UX kuzhine, pa zë/kohëmatës.
- **Asistentë me zë** (Alexa, Google): të lidhur me harduerin, nuk e arrijnë gjendjen e aplikacionit.

### 3.2 Boshllëqet që Mbush Ky Projekt
- **Vizion** — thjesht *trego* frigoriferin në vend që të shkruash.
- **Zë që kontrollon gjendje reale** — jo vetëm "vendos një kohëmatës", por shto/pyet listën e blerjeve.
- **Zgjedhje ditore deterministe** — të njëjtat për të gjithë, pa scheduler.
- **Ndarje pa backend** — URL-ja *është* receta.

---

## 4. Metodologjia / Arkitektura

### 4.1 Arkitektura me Dosje-Funksioni
- E organizuar sipas funksionit, jo sipas shtresës teknike: `features/<name>/{api,components,hooks,types,providers}`.
- `app/` mban vetëm dosje rrugësh të holla — **asnjë logjikë biznesi në shtresën e rrugëve**.
- 11 funksione të mbyllura në vetvete; një aftësi e re shtohet pa prekur të tjerat.

### 4.2 Modeli i Rrjedhës së të Dhënave
- Server Actions (`'use server'`) janë i **vetmi** vend që shkruan në Supabase.
- Çdo mutacion thërret `revalidatePath('/...')`; klientët e konsumojnë përmes hook-eve të TanStack Query.
- **Përditësim optimist:** onMutate (anulo → fotografo → vendos cache) → rikthim në onError → invalidim në onSettled.
- Referenca kanonike: `features/buy-list/hooks/use-buy-list.ts`.

### 4.3 Tre Klientë Supabase (siguri me dizajn)
- `server.ts` — i ndërgjegjshëm për cookie-t, për server actions / route handlers.
- `browser.ts` — për abonuesit në kohë reale (sidebar-i dëgjon ndryshimet e `recipes`).
- `admin.ts` — çelësi service-role, **vetëm-server**, për operacionet `auth.admin.*`.
- Mësimi: *bëje klientin e rrezikshëm dukshëm të rrezikshëm* — me emër dhe me vendndodhje.

### 4.4 Autentikimi & Mbrojtja e Rrugëve
- Edge middleware ruan `/` dhe `/home/:path*` (ridrejton të kyçurit/anonimët përkatësisht).
- **Rrugët admin përjashtohen nga matcher-i** — çdo action thërret `checkIsAdmin()` (email kundrejt `ADMIN_EMAILS`).
- Ruajtja për çdo action = mbrojtje në thellësi; rifaktorizimet nuk mund të heqin një roje të përbashkët layout-i.
- OAuth / magic-link → `/auth/callback` shkëmben kodin → `/home`.

### 4.5 Integrimi i AI-së
- Google Gemini 2.5 Flash përmes `@google/genai`, multimodal: imazh **dhe/ose** përbërës të shtypur në një thirrje të vetme.
- I kufizuar me skemë: `responseMimeType: 'application/json'` + system prompt i rreptë → `{ ingredients[], recipes[3] }`.
- Parser mbrojtës: provo `JSON.parse`, pastaj hiq code fences, pastaj valido formën.
- Çelësi API lexohet vetëm brenda një server action të autentikuar — kurrë në bundle-in e klientit.

---

## 5. Funksionet Kryesore

### 5.1 Pantry Scan (AI multimodal)
- Foto dhe/ose tekst përbërësish → 3 receta *dukshëm të ndryshme* (kuzhinë / nga e shpejta te e detajuara).
- Server action e ruajtur me autentikim mbron çelësin dhe thirrjen e modelit.

### 5.2 Mënyra me Zë (gatim pa duar)
- `VoiceProvider` orkestron Web Speech (njohje + sintezë) + Wake Lock.
- Parser-i i shkruar me dorë `parseCommand` për qëllimet: komanda kohëmatësi + listë-blerjeje + ndez/fik zërin.
- **Regex mbi LLM** — vonesë, kosto, parashikueshmëri offline; komandat janë një gramatikë e vogël e mbyllur.

### 5.3 Zgjedhjet Ditore të ChefBot-it
- 3 zgjedhje/ditë (e kripur/snack/ëmbëlsirë) të zgjedhura duke bërë hash `YYYY-M-D` + kripë për kategori + PRNG me `Math.sin`.
- Të njëjtat zgjedhje për të gjithë, pa cron, pa shtresë cache — *determinizmi e eliminon gjendjen*.

### 5.4 Ndarja e Recetave (URL të kompresuara)
- `lz-string` e ngjesh recetën te `/share?data=...`; marrësi e dekompreson dhe e ruan me një klikim.
- Pa tabelë ndarjesh, pa rreshta jetimë, ekspozim i reduktuar ndaj GDPR.

### 5.5 Lista e Blerjeve & Kohëmatësi
- Lista e blerjeve: shto/ndrysho/fshi optimist — ndjesi e menjëhershme edhe në rrjete të ngadalta.
- Kohëmatës: kronometër + numërim mbrapsht përmes `TimerProvider`, i drejtueshëm si nga UI ashtu edhe nga zëri.

### 5.6 Paneli i Administratorit
- Kuron `daily_picks` + `cooking_tips`, menaxhon përdoruesit përmes klientit service-role.
- Çdo action e ruajtur nga `checkIsAdmin()`.

---

## 6. Sistemi i Dizajnit

### 6.1 Tailwind v4, CSS-First
- Token-at e temës te `app/globals.css` nën `@theme inline` — pa `tailwind.config.js`.
- **OKLCH** hapësira e ngjyrave → uniforme në perceptim, kontrast i qëndrueshëm nëpër tema.

### 6.2 Katër Tema
- `green` (parazgjedhja) + `red`/`blue`/`yellow` si klasa në `<html>`, të ruajtura në `localStorage`.
- Tematizim i bazuar në klasa mbi ndërrimin e variablave: shfrytëzon kaskadën, pa FOUC; logoja ndërrohet sipas temës.

---

## 7. Vendime Inxhinierike (kompromise të mbrojtshme)

- **Server Actions për të gjitha shkrimet** — një kufi autentikimi, sekretet rrinë në server, rivalidim i integruar.
- **TanStack Query për leximet** — UI optimist, ritentime, refetch-on-focus, pa reducer-a të bërë me dorë.
- **Tre klientë Supabase** — imponojnë kufirin cookie / realtime / admin.
- **Parser komandash me regex** — vonesë më e ulët, kosto zero për thënie kundrejt klasifikimit të qëllimeve me LLM.
- **Zgjedhje ditore deterministe** — pa scheduler, të nxjerrshme vetëm nga data.
- **Ruajtje admin për çdo action** — mbijeton rifaktorizimet më mirë se një roje e vetme layout-i.
- **URL ndarjeje të kompresuara** — pa tabelë ruajtjeje, pa rishikim privatësie për përmbajtjen e ndarë.

---

## 8. Sfidat & Mësimet

- **Devijim JSON-i nga Gemini** → parser mbrojtës + validim i formës. *Trajtoje daljen e LLM-së si këshilluese.*
- **Brishtësia e Web Speech** (gabime `network` në Linux Chromium) → wrapper i tipizuar me gabime të veprueshme. *API-të "standarde" prapë kanë nevojë për feature detection.*
- **Vonesa kundrejt kostos në zë** → parser determinist. *Përdor determinizmin kur gramatika është e mbyllur dhe e vogël.*
- **Gara realtime kundrejt UI-së optimiste** → invalido-on-settled; serveri fiton në commit. *Cache-i është e vërtetë vetëm mes onMutate dhe onSettled.*

---

## 9. Inovacioni / Vlera Unike

- Një stack web, rrjedhë e plotë pune — pa aplikacion shoqërues, pa harduer pronësor.
- AI multimodale si funksion i vërtetë: foto + tekst, JSON i rreptë, parser mbrojtës.
- Zë native i shfletuesit që kontrollon gjendje reale të aplikacionit.
- Përmbajtje ditore deterministe me zero infrastrukturë.
- Një shabllon funksioni i riprodhueshëm që mbijeton dhjetë aftësitë e ardhshme.

---

## 10. Kufizimet & Puna e Ardhshme

### 10.1 Kufizimet
- Pa suitë testesh të automatizuara (boshllëku me prioritet më të lartë).
- Web Speech API i pabarabartë nëpër shfletues; pa rate limiting në endpoint-in e AI-së.
- Thirrjet e Gemini-t pa cache — hyrjet e dyfishta rifaturohen; autentikimi admin bazohet në email.

### 10.2 Puna e Ardhshme
- **Afatshkurtër:** Playwright + teste njësie për parser-in, rate limiting i AI-së, cache me content-hash, fallback me Whisper, tabelë rolesh Supabase + RLS.
- **Afatgjatë:** personalizim (dietë/alergji në prompt), PWA + offline, zë shumëgjuhësh, integrim me dërgesa ushqimore, lista blerjeje familjare bashkëpunuese.

---

## 11. Përfundimi

- Një aplikacion web në nivel prodhimi që bashkon AI-në multimodale, sinkronizimin në kohë reale dhe zërin native të shfletuesit përgjatë gjithë rrjedhës së gatimit.
- Dëshmon se stack-u modern web është gati për përvoja AI-first, pa duar dhe në kohë reale pa binarë native.
- Ofron një shabllon arkitekturor të ripërdorshëm dhe një grup të dokumentuar kompromisesh inxhinierike.

> *"Një aplikacion i vetëm modern web mund të jetë kuzhina e së ardhmes — dhe platforma që kemi tashmë mjafton për ta ndërtuar atë."*

---

## Referencë e Shpejtë (numrat kryesorë)

- 11 dosje funksioni të mbyllura në vetvete · 3 klientë Supabase · 4 tema (0 konfigurim JS)
- 3 receta për çdo pantry scan · 3 zgjedhje ditore deterministe · ~10 qëllime zëri (<10ms, regex)
- 1 model multimodal (Gemini 2.5 Flash) për vizion + gjenerim recetash
