# FREESTYLE ENGINE

A browser app for practising freestyle rap over a beat that scores each take for rhyme and vocabulary and plans the next drills from a 21-skill profile. It is built for deliberate practice, which means training one named weakness at a time with feedback on every attempt. It runs in the browser without an account, and its scores come from hand-written rules. It is written in TypeScript with a plain DOM interface over the browser's Web Audio, MediaRecorder, Web Speech and IndexedDB APIs.

**Status: prototype.** The baseline, the drills, transcript scoring and the daily plan run end to end, but saved recordings cannot be decoded, so the audio analysis and playback do not work yet.

Live: https://ampactor.dev/freestyle-engine/

## Quick start

```bash
npm install
npm run build
npm run preview
```

Open the address `vite preview` prints (`http://localhost:4173/` by default). A first visit shows the day's plan: six drills aimed at pocket, the skill of staying locked to the beat. START SESSION opens the eight-task baseline first, and the TRAIN tab lists all 12 drills. Allow the microphone when a drill starts. The live transcript needs a browser with the Web Speech API, such as Chrome.

`npm run dev` starts the Vite dev server with live reload, but the page is unstyled there, because only the production build links `src/ui/styles.css`.

## How it works

All of the app's code runs in the page. `src/main.ts` draws every screen as an HTML string and wires up the buttons. `src/core/` holds the scoring, the phonology engine, the profile and the planner as plain functions that also run under Node, which is how the tests load them. `src/services/` wraps the microphone, speech recognition, the beat, the audio analysis, the word lookups and IndexedDB (the browser's built-in database). The TODAY tab holds the day's plan; the other tabs start single drills, search for words in the Rhyme lab, run the baseline, and show progress and past sessions.

A take is one improvised performance of a drill. Practice runs in a loop:

1. **Plan.** On load the app reads the profile from IndexedDB and builds the day's six-drill workout.
2. **Perform.** The drill counts down while the app records the microphone with MediaRecorder and, where the browser supports it, transcribes it with the Web Speech API in US English. A new prompt appears every 15 seconds while auto prompts are on (the default). A synthesized kick, clap and hi-hat loop can play at a chosen tempo, 92 BPM (beats per minute) by default. Performance mode, also on by default, stretches the prompt panel to over half the screen height.
3. **Measure.** When the take ends, the app tries to analyse the recording, looks up the pronunciation of each distinct word in the transcript, and analyses the transcript. It shows every measurement with its receipt, a line that says what the number was computed from.
4. **Rate.** You rate the take from 1 to 10 on six sliders and can leave a note.
5. **Update.** The measurements and ratings become a training score and per-skill scores, which move the profile and shape the next plan.

### Scoring

`src/core/analysis.ts` measures the transcript: words per minute, the share of distinct words, filler words, words repeated four or more times, how many prompt words made it into the take, and rhyme patterns from the phonology engine. For the eight-word transcript that `npm test` uses, the vocabulary receipt reads "5 unique tokens / 8 total tokens." Seven failure modes, such as a filler loop or constraint drift, fire on thresholds and build up across sessions.

`src/services/audio-analysis.ts` decodes the recording and measures silence and pauses, onsets (the points where sounds start), how much of the take is voiced, pitch range, loudness range and clipping (samples at the top of the recordable range). With the beat on, it also measures how far the onsets fall from the beat grid. None of these measurements reach the scores today, because the saved recording cannot be decoded (see [Limitations](#limitations)).

`src/core/evaluation.ts` combines everything into a training score: 50% objective measurements, 20% transfer signals, 15% self-ratings, 10% difficulty and 5% completion. Transfer is whether a skill holds up outside the drill that trained it.

### Phonology

Phonology is the sound structure of words. `src/core/phonology.ts` compares each word with the next, and every pair of words inside each four-word window. It uses the Arpabet pronunciation (a plain-text phonetic alphabet) from Datamuse when a lookup succeeds, and otherwise estimates the sounds from spelling with rules such as "tion" sounding like "shun". A pair that matches is graded as a perfect rhyme, a multisyllabic rhyme (here, a perfect rhyme between two words of two or more syllables), a near rhyme, assonance (matching vowel sounds) or consonance (matching consonant sounds). From those grades it scores rhyme chains, end rhymes and internal rhymes. The grading is deterministic: the same words and pronunciations always get the same grades.

### Profile and plan

The profile holds 21 skills, such as pocket, rhyme retrieval and storytelling. Each has a value from 0 to 1, an evidence count, a trend and its last ten scores. After a take, each scored skill moves about a tenth of the way toward its new score (7.5% once it has five pieces of evidence), so a single take shifts the profile only a little.

The planner in `src/core/curriculum.ts` picks the focus skill with the most leverage. Leverage weighs a low value, weak prerequisites in a fixed dependency map (multisyllabic rhyme depends on rhyme retrieval and vocabulary, for example), time since the last practice, a falling trend and thin evidence. The planner also names a transfer skill: the weakest other skill, preferring skills that build on the focus. `src/core/generator.ts` then fills six blocks: warm-up, base, target, transfer, creative and a boss round. Each block's drill is a random draw, seeded with the date, from the drills that fit its role, and the target block only draws drills that train the focus skill. Block difficulty is capped at a level set by the focus skill's value.

The baseline in `src/core/calibration.ts` is eight timed tasks of 60 to 120 seconds (rhyme, pocket, story, observation, recovery, voice, wordplay and transfer). They run back to back and feed the profile like any other take, and until they are done, START SESSION opens the baseline. The battery also saves its scores as baseline values, which nothing reads yet.

### Storage and review

The profile, settings, sessions and recordings live in IndexedDB; the lookup cache and the optional Datamuse key live in `localStorage`. REVIEW lists the 60 most recent sessions, and each opens to its receipts, rhyme chains, failure modes, transcript and note. PROGRESS shows each skill with its evidence count and trend, the transfer history, and the drills run five or more times, which it labels mastered. EXPORT saves the profile and the session history as a JSON file, and IMPORT reads one back.

### Word lookups

Two public services answer word lookups. Datamuse supplies the Rhyme lab's rhymes, related words, sound-alikes and synonyms, and the Arpabet pronunciations used in scoring. The Free Dictionary API fills in when Datamuse has no pronunciation, but only the Rhyme lab uses its answers. Answers are cached for 30 days, and scoring falls back to the spelling rules when a lookup fails. [docs/PROVIDERS.md](docs/PROVIDERS.md) lists what each service supplies, which words leave the browser, and the Datamuse key policy.

### Why measurements carry receipts

The decision behind the design is to treat every score as a proxy, a number that stands in for something the code cannot judge. That is why every measurement keeps the line of evidence it was computed from, and every skill shows how much evidence backs it. One take moves a skill's value only a small step, so no single performance decides what the profile says.

## Project layout

```text
src/main.ts                 every screen as HTML strings, plus the event wiring
src/core/                   scoring, phonology, profile, planner and baseline (plain functions)
src/services/               microphone, speech, beat, audio analysis, word lookups, IndexedDB
src/content/                the 12 drills and the prompt word lists
src/ui/styles.css           the stylesheet
scripts-build.mjs           the production build (tsc, no bundler)
scripts-core-test.mjs       the checks that npm test runs
tests/core.test.ts          a Vitest file that no npm script runs
FREESTYLE_ENGINE_DESIGN.md  the design document
```

[FREESTYLE_ENGINE_DESIGN.md](FREESTYLE_ENGINE_DESIGN.md) describes more than is built; its Rhyme Telescope, for example, does not exist in the code.

## Deploy

The app is a static site on GitHub Pages at https://ampactor.dev/freestyle-engine/. [`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs on every push to `main` and on demand: it installs dependencies on Node 22, runs `npm run build` and publishes `dist/`. The build does not bundle. `scripts-build.mjs` compiles `src/` with `tsc` (the TypeScript compiler), adds `.js` to relative imports so the browser can load each module directly, copies the stylesheet, and writes `dist/index.html` and an empty `.nojekyll`. Of the npm scripts, only `npm run dev` and `npm run preview` use Vite.

## Testing

```bash
npm run build
npm test
```

`npm test` runs `scripts-core-test.mjs` against the compiled modules in `dist/`, so it needs the build first; on a fresh clone it fails with `ERR_MODULE_NOT_FOUND`. It prints `CORE_TESTS_OK` when its five checks pass, one each for the phonology engine (a four-word rhyme chain), transcript analysis (rhyme and a repeated word), a profile update (the session count), workout generation (six blocks and a focus skill) and the migration of a version 2 profile. The build is a type check too: `tsc` runs in strict mode, and a type error fails it.

`tests/core.test.ts` is a Vitest file that no npm script runs. `npx vitest run` passes two of its three tests; the third fails because `updateProfileFromSession` also changes the profile it is given. `npm run test:e2e` calls Playwright, which is not a dependency, and the repository has no end-to-end tests.

CI builds the app on every push to `main`, which catches type errors, but it does not run `npm test`. Nothing tests the interface, the recorder, speech recognition, the beat or the audio analysis.

## Limitations

Every score is a proxy: a number that stands in for a quality the engine cannot judge. Rhyme, vocabulary and filler counts come from a speech transcript and from pronunciations that are looked up online or guessed from spelling offline. Nothing in the engine can tell whether a bar, one line of a verse, was good.

- **Recordings cannot be decoded.** `src/services/recorder.ts` records in 120 ms slices but attaches its data handler only when the take stops, so it keeps the last slice without the file header. In headless Chromium 141 with a fake microphone, five-second takes were saved as under 1 KB that the browser could neither decode nor play, while a recorder with the handler attached from the start saved about 73 KB that decoded. So the audio measures never reach the scores, the audio inputs to skills such as pocket, rhythm, breath and pitch fall back to fixed defaults, and PLAY RECORDING fails.
- **Timing has two more gaps.** The beat is off until you start it, and without it no timing is measured. With it, onsets are compared with a grid that starts at the recording's first sample, while the beat starts after the recording does, and nothing measures the gap between them.
- **Transcription belongs to the browser.** Words come from the Web Speech API, which release builds of Firefox do not provide. In Chrome that recognizer is a Google web service, so the audio of a take leaves the device to be transcribed. The app asks for US English only. After each take it also sends every distinct word of the transcript that is not already cached, one per request, to the lookup services ([docs/PROVIDERS.md](docs/PROVIDERS.md)).
- **The recognizer was built for dictation.** Fast delivery, slang and deliberate slurring are where a dictation engine drops words, and the rhyme and filler scores can only count the words it kept.
- **The text measures are rough.** The filler list counts every "you", "know", "like", "so" and "right", so in "you know I like the way you move so right tonight" six of the eleven words count as filler. Rhyme scoring treats every four words as a line, and the bar count is the syllable count divided by 12, where a syllable is a run of vowel letters.
- **Parts of the planner do not work as designed.** `choose()` in `src/core/generator.ts` sorts each block's drills by score and then picks uniformly at random, so the scores do not change the odds. Training load records only the last session of each day, which scores about 30 points at most (minutes times difficulty). A week therefore tops out near 210. The deload threshold, the load at which the app calls for a lighter day, is 405 (567 after the baseline), so neither the deload warning nor the load-based difficulty cap engages in normal use.
- **One browser holds everything.** The profile, sessions and recordings live in IndexedDB. EXPORT saves the profile and session history as JSON without the recordings, and clearing site data without an export starts the profile over. Nothing caches the app itself for offline use, since there is no service worker.

## License

No license chosen yet.
