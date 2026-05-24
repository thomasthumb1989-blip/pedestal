# Product Brief — Public Speaking Coach App

## 1. App Concept

An AI-powered public speaking coach that diagnoses speech problems AND teaches you exactly how to fix them through targeted micro-exercises.

## 2. Target User

- Professionals preparing for presentations, meetings, or pitches
- Students practising for interviews, debates, or class presentations
- Non-native English speakers wanting to speak more clearly (any accent)
- Anyone with public speaking anxiety who wants structured daily practice

**Not targeting:** ESL learners (ELSA's space), accent reduction (BoldVoice's space), or casual vocabulary building.

## 3. Core Problem We Solve

Every competitor tells you WHAT is wrong — "you said 'um' 14 times" — but none teach you HOW to fix it. Speeko shows your filler count, Orai shows your pace, Vocal Image flags your tone. Then what? Users are left Googling solutions.

We close the diagnosis-to-fix gap. Every speech problem we detect triggers a specific, actionable drill that takes under 3 minutes.

## 4. MVP Features (v1 — Launch)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Speech Analyser** | Record yourself speaking (30s–5min), get instant AI analysis of filler words, pace, pauses, clarity, and energy. |
| 2 | **Fix-It Drills** | Every diagnosis links to a targeted micro-exercise (e.g., "2-second pause technique" for filler words, "breath pacing drill" for rushing). |
| 3 | **Impromptu Mode** | Random topic generator with countdown timer — practice thinking on your feet with real-time feedback, simulating actual speaking pressure. |
| 4 | **Progress Dashboard** | Speaking score, daily streaks, improvement graphs over time, "before vs after" comparisons to show measurable growth. |
| 5 | **Accent-Agnostic Engine** | Works equally well for British, American, Australian, Indian, and other English accents — no penalty for non-US speakers. |

## 5. NOT Building for v1

- Video recording / body language analysis
- Slide-deck sync / presentation timer
- Social features / community / leaderboards
- AI roleplay scenarios (interviews, meetings)
- Multiple language support
- Custom corporate training packages
- Voice cloning or accent transformation
- Live coaching or human feedback

## 6. Monetisation

| | Detail |
|---|--------|
| **Model** | Hard paywall with free trial |
| **Free trial** | 17 days (full access, no feature gating) |
| **Monthly** | £4.99/month |
| **Annual** | £29.99/year (show "50% saving" prominently) |
| **Lifetime** | £49.99 (optional third tier) |
| **Provider** | RevenueCat (react-native-purchases) |
| **Rationale** | Hard paywall converts 10.7% vs 2.1% freemium (5x gap). Revenue per install: £3.09 hard vs £0.38 freemium (8x gap). |

## 7. App Name Options

Format: `[BrandName]: [Primary Keyword]` — under 30 characters.

| # | Name | Chars | Primary Keyword | Traffic | Difficulty | KEI |
|---|------|:---:|-----------------|:---:|:---:|:---:|
| 1 | **Claro: Speech Training** | 22 | speech training | 41 | 32 | 1.27 |
| 2 | **Podium: Speaking Practice** | 25 | speaking practice | 53 | 38 | 1.40 |
| 3 | **Orate: Speech Practice** | 22 | speech practice | 45 | 36 | 1.28 |
| 4 | **Stagekit: Speech Coach** | 22 | speech coach | 44 | 43 | 1.03 |
| 5 | **Voxly: Presentation Practice** | 28 | presentation practice | 42 | 35 | 1.21 |

*Keyword data from Applyra API (2026-05-24, US App Store).*

**Recommendation:** Option 1 (Claro) or Option 2 (Podium).
- Claro has lowest difficulty (32) and "claro" means "clear" in Spanish/Portuguese/Italian — international appeal.
- Podium has highest traffic keyword (53) and strongest brand imagery.

## 8. Subtitle Options

30 characters max. Uses secondary keywords NOT repeated from title. Per ASO rules: Apple combines title + subtitle + keyword field, so zero overlap.

| # | Subtitle | Chars | Works With Titles |
|---|----------|:---:|-------------------|
| 1 | **Reduce Filler Words Faster** | 26 | All 5 |
| 2 | **AI Vocal Confidence Builder** | 27 | All 5 |
| 3 | **Improve Presentation Skill** | 27 | 1, 2, 3, 4 (not 5) |

**Recommendation:** Option 1. "Filler words" is the #1 pain point in competitor reviews and signals immediate, concrete value.

## 9. Target Keywords

Top 10 ranked by opportunity (KEI), for the 100-character keyword field. Exclude whichever words appear in your chosen title + subtitle.

| Rank | Keyword | Traffic | Difficulty | KEI | Exclude If In Title |
|------|---------|:---:|:---:|:---:|---------------------|
| 1 | speaking practice | 53 | 38 | 1.40 | Title 2 |
| 2 | speech practice | 45 | 36 | 1.28 | Title 3 |
| 3 | speech training | 41 | 32 | 1.27 | Title 1 |
| 4 | presentation practice | 42 | 35 | 1.21 | Title 5 |
| 5 | speech coach | 44 | 43 | 1.03 | Title 4 |
| 6 | public speaking coach | 38 | 40 | 0.95 | — |
| 7 | public speaking | 41 | 50 | 0.82 | — |
| 8 | public speaking ai | 39 | 50 | 0.77 | — |
| 9 | voice training | — | — | — | — |
| 10 | communication skill | — | — | — | — |

*Keywords 9–10 are adjacent opportunities from competitor analysis (not yet verified via Applyra — API had TLS issues). Verify before finalising keyword field.*

**Example keyword field** (if using Title 1 + Subtitle 1):
```
speaking,practice,presentation,coach,public,ai,voice,communication,skill,improve,anxiety,daily
```
92 characters. Room for 8 more characters of keywords.

**ASO reminders:**
- Singulars only (Apple matches plurals)
- No stop words
- No spaces after commas
- Add English (Australia) localisation to double keyword pool to 200 chars
- Create 3 Custom Product Pages on launch day with different keyword clusters
