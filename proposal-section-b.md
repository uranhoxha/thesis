# SECTION B: PROPOSAL

---

## Proposed Thesis Title

**An AI-Powered, Voice-Enabled Cooking Companion: Designing a Multimodal Web Application for Home Cooks Using Next.js, Supabase Realtime, and Google Gemini**

*(Tentative — may be refined to emphasize either the multimodal AI dimension or the hands-free interaction design depending on examiner feedback.)*

---

## Research Question or Hypothesis

**Primary research question:**
Can a single modern web application — built on standardized browser APIs and a feature-modular Next.js architecture — deliver a cohesive cooking workflow (planning, discovery, and hands-free cooking) that meaningfully outperforms today's fragmented combination of recipe apps, shopping-list tools, and voice assistants?

**Hypothesis:**
Pairing multimodal generative AI (image + text → structured JSON recipes) with deterministic, browser-native voice control yields a more usable and economically sustainable kitchen experience than either rule-based recipe matching or LLM-driven conversation alone.

**Main objectives:**
1. Design and implement a production-grade web application unifying recipe management, ingredient-aware AI suggestions, and hands-free voice control.
2. Validate a reusable feature-folder architecture for medium-sized Next.js applications.
3. Empirically compare deterministic intent parsing against LLM-based command interpretation on latency, cost, and reliability.

---

## Review of Literature / Background

The intersection of recipe recommendation, conversational interfaces, and multimodal AI has been studied extensively in isolation but rarely as a unified product domain. This review situates the proposed work across three converging research threads.

**Recipe recommendation and pantry-aware planning.** Early systems such as those described by Forbes and Zhu (2011) and Teng et al. (2012) used ingredient co-occurrence networks and complement graphs to recommend recipes from limited inventories. Trattner and Elsweiler (2017) extended this with health-aware ranking, while Min et al. (2019) provided a comprehensive survey of food computing, identifying ingredient inference from images as an emerging frontier. These works consistently treat the recipe corpus as fixed and the user input as text. The proposed thesis departs from this assumption by **generating recipes on demand** from a multimodal model rather than retrieving from a curated database.

**Multimodal generative AI in applied domains.** With the release of Gemini (Google DeepMind, 2024) and GPT-4V (OpenAI, 2023), vision-language models became viable for per-request product features. Yang et al. (2023) demonstrated GPT-4V's robustness in real-world visual grounding tasks, and Salvador et al. (2017) earlier established cross-modal retrieval between food images and recipes. However, peer-reviewed work on **schema-constrained JSON output** from such models in user-facing applications remains scarce. The defensive parsing strategy proposed here — strict prompt + permissive fallback — is an engineering contribution back to that literature.

**Voice user interfaces in touch-hostile contexts.** Pearl (2016) and Cohen et al. (2004) characterize voice as the appropriate modality when hands and eyes are occupied — a near-perfect description of the kitchen environment. Bentley et al. (2018) studied smart-speaker usage patterns and found that cooking is one of the dominant in-home use cases, yet existing platforms (Alexa, Google Home) cannot reach into third-party application state. The Web Speech API (Shires & Wennborg, W3C, 2012; current Editor's Draft 2024) makes browser-native voice possible without proprietary hardware, but cross-browser support remains uneven and is rarely benchmarked in academic literature. McTear (2022) and Hancock et al. (2020) further argue that **deterministic intent parsing** outperforms LLM-based classification for closed grammars on latency and cost — a trade-off the proposed work tests empirically inside a real product.

**Architectural patterns for modern web applications.** Vernon (2013) and Evans (2003) established domain-driven design as the dominant pattern for modular backends; the front-end equivalent — feature-folder layout — has been popularized in practitioner literature (Khorikov 2020; Kent C. Dodds 2021) but lacks rigorous case-study treatment. The proposed thesis contributes a documented case study of a feature-folder Next.js application spanning eleven features, server actions, three role-separated Supabase clients, and a Tailwind v4 CSS-first design system.

**Identified gap.** No prior work, to the author's knowledge, integrates (1) multimodal image-based ingredient detection with on-demand recipe generation, (2) deterministic browser-native voice control over real application state, and (3) a documented modular web architecture, into a single empirically evaluated product. The thesis addresses this gap and contributes both the artifact and a reflective engineering analysis of its design trade-offs.

---

## Research Methodology

The research adopts a **design science research (DSR)** methodology following Hevner et al. (2004), which is appropriate for thesis work whose primary contribution is a designed artifact accompanied by reflective evaluation.

**Phase 1 — Problem identification and literature synthesis.**
- Systematic review of food computing, multimodal AI, voice UI, and modular front-end architecture literature using Google Scholar, ACM Digital Library, and IEEE Xplore.
- Competitive analysis of five existing cooking applications (Yummly, Paprika, SuperCook, MyFridgeFood, Tasty) and two voice-first platforms (Alexa Recipes, Google Assistant Cooking).

**Phase 2 — Requirements elicitation and architectural design.**
- Derivation of functional requirements covering plan, discover, and cook phases of the home-cooking workflow.
- Architectural decision records (ADRs) capturing the rationale for: server actions over REST, three Supabase clients, deterministic voice parsing, deterministic daily-pick rotation, and feature-folder layout.

**Phase 3 — Implementation.**
- Iterative development using a Next.js 16 + React 19 + Supabase + Google Gemini stack.
- Version control via Git on a single-developer branch with conventional-commit messaging.
- TypeScript strict mode enforced throughout; ESLint via `eslint-config-next` configured for Core Web Vitals rules.

**Phase 4 — Evaluation.**
- **Quantitative micro-benchmarks** on the voice intent parser: cold-start latency, parse latency under 10 ms target, and intent-classification accuracy on a hand-curated test set.
- **AI pipeline reliability**: 100 sequential Pantry Scan runs measuring JSON-shape validity, recipe distinctness, and median round-trip latency.
- **User-facing performance**: Lighthouse audits on home and login routes, with TTFB, LCP, and CLS reported.
- **Architectural reflection**: ADR-by-ADR retrospective with explicit trade-off discussion.
- **Optional usability study**: a small (n ≈ 6–10) think-aloud session with home cooks, subject to ethics approval.

**Phase 5 — Documentation and write-up.**
- Thesis manuscript synthesizing literature, design rationale, implementation, and evaluation findings.
- Reproducibility appendix: full repository link, environment variables documented in `CLAUDE.md`, deployment instructions.

**Tools and instruments.** Visual Studio Code with Claude Code CLI; GitHub for version control; Supabase Cloud for managed Postgres + Auth + Realtime; Vercel for hosting; Google Gemini API for the multimodal model; Lighthouse for performance; manual logging for parser benchmarks.

---

## Selected Bibliography

1. Bentley, F., Luvogt, C., Silverman, M., Wirasinghe, R., White, B., & Lottridge, D. (2018). *Understanding the Long-Term Use of Smart Speaker Assistants*. Proceedings of the ACM on Interactive, Mobile, Wearable and Ubiquitous Technologies, 2(3), 1–24.
2. Cohen, M. H., Giangola, J. P., & Balogh, J. (2004). *Voice User Interface Design*. Boston, MA: Addison-Wesley.
3. Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Boston, MA: Addison-Wesley.
4. Forbes, P., & Zhu, M. (2011). *Content-Boosted Matrix Factorization for Recommender Systems: Experiments with Recipe Recommendation*. Proceedings of the 5th ACM Conference on Recommender Systems (RecSys '11), 261–264.
5. Google DeepMind. (2024). *Gemini: A Family of Highly Capable Multimodal Models*. Technical Report. Available at: https://deepmind.google/technologies/gemini/
6. Hancock, J. T., Naaman, M., & Levy, K. (2020). *AI-Mediated Communication: Definition, Research Agenda, and Ethical Considerations*. Journal of Computer-Mediated Communication, 25(1), 89–100.
7. Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). *Design Science in Information Systems Research*. MIS Quarterly, 28(1), 75–105.
8. Khorikov, V. (2020). *Unit Testing Principles, Practices, and Patterns*. Shelter Island, NY: Manning Publications.
9. McTear, M. (2022). *Conversational AI: Dialogue Systems, Conversational Agents, and Chatbots* (2nd ed.). Synthesis Lectures on Human Language Technologies. Springer.
10. Min, W., Jiang, S., Liu, L., Rui, Y., & Jain, R. (2019). *A Survey on Food Computing*. ACM Computing Surveys, 52(5), Article 92, 1–36.
11. OpenAI. (2023). *GPT-4V(ision) System Card*. Technical Report. Available at: https://openai.com/research/gpt-4v-system-card
12. Pearl, C. (2016). *Designing Voice User Interfaces: Principles of Conversational Experiences*. Sebastopol, CA: O'Reilly Media.
13. Salvador, A., Hynes, N., Aytar, Y., Marin, J., Ofli, F., Weber, I., & Torralba, A. (2017). *Learning Cross-Modal Embeddings for Cooking Recipes and Food Images*. IEEE Conference on Computer Vision and Pattern Recognition (CVPR), 3020–3028.
14. Shires, G., & Wennborg, H. (2012). *Web Speech API Specification*. W3C Community Group Final Report; current Editor's Draft (2024) available at https://wicg.github.io/speech-api/
15. Teng, C. Y., Lin, Y. R., & Adamic, L. A. (2012). *Recipe Recommendation Using Ingredient Networks*. Proceedings of the 4th Annual ACM Web Science Conference, 298–307.
16. Trattner, C., & Elsweiler, D. (2017). *Investigating the Healthiness of Internet-Sourced Recipes: Implications for Meal Planning and Recommender Systems*. Proceedings of the 26th International Conference on World Wide Web (WWW '17), 489–498.
17. Vercel. (2024). *Next.js 14/15 Documentation: App Router, Server Actions, and Caching*. Available at: https://nextjs.org/docs
18. Vernon, V. (2013). *Implementing Domain-Driven Design*. Boston, MA: Addison-Wesley.
19. W3C. (2022). *Screen Wake Lock API*. W3C Working Draft. Available at: https://www.w3.org/TR/screen-wake-lock/
20. Yang, Z., Li, L., Lin, K., Wang, J., Lin, C. C., Liu, Z., & Wang, L. (2023). *The Dawn of LMMs: Preliminary Explorations with GPT-4V(ision)*. Technical Report, arXiv:2309.17421.

*(Citations use APA 7th edition. URLs accessed during the research period; specific access dates will be added in the final manuscript.)*

---

## Research and Writing Timeline

**Start date:** 1 September 2025 (literature review); 26 October 2025 (first code commit)
**Expected first-draft submission:** 15 June 2026
**Expected defense:** late July 2026

### Phased schedule

Dates below are reconstructed from the project's Git history (initial commit 26 Oct 2025, most recent commit 26 Apr 2026 at the time of writing).

| # | Phase | Start | End | Duration |
| --- | --- | --- | --- | --- |
| 1 | Literature review & competitive analysis | 1 Sep 2025 | 25 Oct 2025 | 8 weeks |
| 2 | Requirements & architectural design (ADRs) | 26 Oct 2025 | 3 Dec 2025 | 5 weeks (overlap with Next.js + markdown-toolbar bootstrap) |
| 3 | Core implementation (auth, recipes, buy list, timer) | 4 Dec 2025 | 19 Feb 2026 | 11 weeks (Supabase init → Google OAuth) |
| 4 | Admin dashboard, theming, sharing, daily picks | 23 Feb 2026 | 24 Feb 2026 | ~1 week of focused commits |
| 5 | AI integration (Pantry Scan) & voice mode | 25 Apr 2026 | 26 Apr 2026 | 1 week sprint (Gemini + Web Speech) |
| 6 | UI polish & responsive fixes (auth redesign, mobile) | 26 Apr 2026 | 26 Apr 2026 | ~1 week |
| 7 | Evaluation: benchmarks + Lighthouse + reflection | 27 Apr 2026 | 5 Jun 2026 | 6 weeks (in progress) |
| 8 | Thesis writing (first draft) | 1 May 2026 | 15 Jun 2026 | 6 weeks (overlap with Phase 7) |
| 9 | Supervisor review & revisions | 16 Jun 2026 | 5 Jul 2026 | 3 weeks |
| 10 | Editing, formatting, bibliography finalization | 6 Jul 2026 | 18 Jul 2026 | 2 weeks |
| 11 | Defense preparation (slides, demo rehearsal) | 19 Jul 2026 | 28 Jul 2026 | 1.5 weeks |
| 12 | **Thesis defense** | end July 2026 | — | — |

### ASCII Gantt chart

```
                            2025                              2026
                            Sep  Oct  Nov  Dec  Jan  Feb  Mar  Apr  May  Jun  Jul
1  Literature review        ████ ██
2  Requirements & ADRs           ███  ██   █
3  Core implementation                ██   ████ ████ ██
4  Admin / theming / share                          ██
5  AI + voice integration                                          █
6  UI polish (auth/mobile)                                         █
7  Evaluation                                                      ▒███ ██
8  Thesis writing (draft)                                             ▒████
9  Supervisor review                                                       ███
10 Editing & formatting                                                       ██
11 Defense prep                                                                ██
12 DEFENSE                                                                      ★
```

*(Legend: █ active work, ▒ ramp-up overlap, ★ milestone.)*

### Buffer

A two-week buffer is reserved at the end of July to absorb supervisor revision rounds, ethics-approval delays, or unforeseen evaluation re-runs.

---

## Ethics

The thesis raises several ethical considerations that the methodology and design explicitly address.

**Data privacy and user-generated content.**
- Personal data (recipes, buy lists, profile information) is stored in Supabase under row-level scoping by `user_id`. Account deletion via the admin route triggers `auth.admin` removal of the user record.
- The recipe-sharing feature deliberately avoids storing shared content server-side: payloads are compressed into the URL itself, eliminating the orphaned-data risk and reducing GDPR exposure.

**Third-party AI processing.**
- Pantry-scan images and ingredient strings are transmitted to Google's Gemini API. Users will be informed via an in-app disclosure before invoking the scan feature for the first time. A privacy notice will document what is sent and that images are not retained on application servers.
- No model fine-tuning is performed on user data; only inference requests are sent.

**Security and credential handling.**
- The Supabase service-role key and the Google Generative AI API key are server-only. The architecture enforces this through three explicitly named Supabase clients and a server-action gate on all AI calls.
- Admin authorization is verified inside every privileged action (`checkIsAdmin()`), preventing accidental exposure through layout misconfiguration.

**Algorithmic transparency and bias.**
- The recipe-generation prompt requests diversity ("3 meaningfully different recipes") to mitigate cultural homogenization risks documented in prior food-computing work (Trattner & Elsweiler, 2017).
- Limitations of the AI model — including potential bias toward Western cuisines and possible omissions for users with allergies or dietary restrictions — will be disclosed prominently in the UI and in the thesis discussion section.

**Accessibility.**
- Voice mode is itself an accessibility feature for users with mobility constraints in the kitchen. ARIA-conformant Radix primitives underpin all interactive surfaces. Future work will include screen-reader-only walkthroughs of the application.

**Human-subjects research.**
- The optional usability study (n ≈ 6–10 home cooks) will follow the institution's standard ethics-review process. Participants will provide informed consent, sessions will be anonymized, and recordings will be destroyed after analysis. No participant data will be transmitted to third-party AI services.

**Sustainability of AI inference.**
- The thesis discussion will acknowledge the environmental cost of repeated multimodal inference calls. The proposed content-hash cache (future work) directly addresses this by eliminating duplicate model invocations for identical inputs.

**Limitations and honesty in evaluation.**
- The thesis explicitly reports trade-offs (no test suite at submission time, uneven Web Speech support, no rate limiting) rather than concealing them. Reflective honesty is treated as a methodological requirement, not an optional appendix.
