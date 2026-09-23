# FREESTYLE ENGINE

A local-first deliberate-practice instrument for freestyle rap. No accounts. No AI. The browser measures your performance, maintains a longitudinal skill model, and prescribes the next workout from evidence.

**Status: Prototype.** Calibration, the beat, recording, review and the adaptive plan all run; every score is a proxy, and live transcription exists only where the browser provides speech recognition.

Live at **[ampactor.dev/freestyle-engine](https://ampactor.dev/freestyle-engine/)**.

## What is in the complete build

- **Audio intelligence:** local recording analysis for silence, phrase segmentation, onsets, vocal activity, pitch range, dynamics, clipping and BPM-relative timing.
- **Phonology:** a deterministic local graphemic-phonology engine for exact/near/assonant/consonant relationships, internal rhyme, multisyllabic patterns and rhyme chains.
- **Calibration:** an 8-part baseline battery that establishes the initial profile and transfer floor.
- **Adaptive curriculum:** dependency-aware skill leverage, failure-mode accumulation, training-load tracking, deload protection and transfer targeting.
- **Beat/timing:** browser-synthesized beat, BPM controls, live pulse feedback, recording-vs-grid analysis.
- **Review:** objective evidence receipts, phonetic chains, audio receipts, failure modes, transcript, recording playback and longitudinal transfer history.
- **Performance mode:** a low-chrome full-screen-ish interface designed to disappear while you perform.
- **Offline/local-first:** practice state and recordings live in IndexedDB. Datamuse is an optional discovery layer, not a dependency of training.

## Stack

TypeScript + Vite for development, vanilla DOM/CSS for the UI, Web Audio / MediaRecorder / Web Speech where available, IndexedDB for persistence, Datamuse for optional lexical exploration. The production artifact is also buildable without Vite via `scripts-build.mjs` so the Pages deployment is just static files.

## Development

```bash
npm install
npm run dev
```

## Production artifact

```bash
npm run build
```

The static GitHub Pages artifact is written to `dist/`.

## Verification

```bash
npm test
```

The local test runner validates the phonetic engine, transcript analysis, profile updates, workout generation and profile migration. The build additionally type-checks the entire source tree and validates emitted JavaScript syntax.

## GitHub Pages

Push `main`. `.github/workflows/pages.yml` builds `dist/` and publishes it with GitHub Pages.

## Product principle

The engine should never pretend that a metric is the art. It measures proxies, explains how they were obtained, keeps uncertainty visible, and uses repeated evidence plus transfer tests to decide what to train next.

## Weak spots

Every score is a proxy. Rhyme, timing and filler counts come from a speech transcript and from pronunciations that are looked up online or guessed from spelling offline. Nothing in the engine can tell whether a bar was good.

- **Transcription belongs to the browser.** Words come from the Web Speech API, which Firefox does not provide. In Chrome that recognizer is a Google web service, so the audio of a take leaves the device to be transcribed even though the app itself uploads nothing.
- **The recognizer was built for dictation, not rap.** Fast delivery, slang and deliberate slurring are where a dictation engine drops words, and the rhyme and filler scores can only count the words it kept.
- **One browser holds everything.** The profile, sessions and recordings live in IndexedDB. The export button saves the profile and session history as JSON; clearing site data without one starts the profile over.


## Language provider stack

FREESTYLE ENGINE uses external language services as *evidence providers*, not as the training brain. Datamuse is the primary provider: it supplies rhymes, near rhymes, semantic relations, homophones/sound-alikes, syllable counts, word frequency, definitions, and pronunciation metadata including Arpabet/IPA. The app caches provider results locally and falls back to its own graphemic phonology when the network is unavailable. Datamuse currently permits up to 100,000 requests/day without a key, but its published policy says an API key will be required starting January 1, 2027. The Settings panel therefore supports an optional Datamuse key now.

The Free Dictionary API is used as a secondary lookup for IPA, definitions, and pronunciation audio when Datamuse does not return pronunciation metadata.

The application does not send recordings or transcripts to either provider. Only individual lexical lookup strings leave the browser.

## Provider citations

- Datamuse API: https://www.datamuse.com/api/
- Free Dictionary API: https://dictionaryapi.dev/
- Browser speech/audio: Web Speech API + Web Audio API.
