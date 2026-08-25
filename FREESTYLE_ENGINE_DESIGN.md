# FREESTYLE ENGINE

## Complete Design, Development Roadmap, Architecture, and Project Structure

**Status:** Implemented V1.0 architecture and product specification  
**Target:** Static GitHub Pages application  
**Primary platform:** Modern mobile and desktop browsers  
**Primary user:** A serious freestyle rapper using the application as a daily deliberate-practice instrument  
**Primary implementation language:** TypeScript  
**Initial framework choice:** Vite + vanilla TypeScript + DOM/CSS  
**Audio:** Web Audio API; optional Tone.js only where it materially reduces complexity  
**Persistence:** IndexedDB + OPFS where appropriate  
**External language service:** Datamuse for rhyme/phonetic/semantic lookup  
**Speech:** Web Speech API where available; audio-only fallback everywhere  
**Deployment:** GitHub Actions -> GitHub Pages  

---

# 1. Executive Summary

FREESTYLE ENGINE is a browser-native training instrument for developing freestyle rap, flow, rhyme retrieval, storytelling, wordplay, vocal control, observation, recovery, and improvisational composition.

It is not a generic rap prompt generator, an AI lyric generator, a gamified language-learning clone, or an LLM chat interface.

Its core loop is:

> **PERFORM -> MEASURE -> DIAGNOSE -> PRESCRIBE -> PERFORM AGAIN**

The application should become better at training its user as it accumulates session evidence.

The application therefore has two distinct layers:

1. **The instrument layer:** recording, timing, beats, prompts, live state, transcription, visual feedback, and low-latency interaction.
2. **The training layer:** skill model, exercise model, session analysis, progression, adaptive workout generation, and longitudinal history.

The application should remain useful without an LLM. AI is an optional coaching layer, never the foundation of the training system.

The central design principle is:

> **Train the machinery that generates improvisation, not the storage of finished lyrics.**

---

# 2. Why This Architecture Fits the Existing Ampactor Body of Work

The implementation should deliberately inherit several principles already visible in the user's existing projects.

## 2.1 Noodles: instrument-first, phone-first interaction

Noodles is a phone-first music sketchpad explicitly built around the proposition that the instrument itself should teach the user. Its interaction model uses direct manipulation, minimal density, immediate playability, and local/browser execution. The repository uses Vite, Tone.js, vanilla DOM/CSS, a pure data model, an isolated audio layer, and a UI layer rather than a heavyweight frontend framework. It also uses production-build verification and browser smoke testing. [Noodles repository](https://github.com/ampactor-labs/noodles)

FREESTYLE ENGINE should follow the same instinct:

- no dashboard bloat
- no framework-driven UI abstraction unless it earns its complexity
- one gesture should often correspond to one meaningful musical action
- mobile is a first-class target
- the instrument should feel good before the analytics become sophisticated
- the application should be playable within seconds of opening it

## 2.2 Sonido: separate deterministic core from presentation

Sonido defines a reusable DSP kernel and exposes it through multiple frontends, including a browser/WASM node graph. Its architecture and documentation emphasize measurable behavior, explicit boundaries, and keeping audio computation independent of UI. [Sonido repository](https://github.com/ampactor-labs/sonido)

FREESTYLE ENGINE should use the same separation:

- pure training/domain logic
- audio engine
- speech/transcription adapter
- persistence
- UI
- optional AI adapter

The training model should never depend on DOM state.

## 2.3 BITS: deterministic, local media and explicit state

BITS keeps the instrument on-device, uses append-only recipes, fixed-step simulation where determinism matters, local storage, and a real end-to-end verification path. [BITS repository](https://github.com/ampactor-labs/bits)

FREESTYLE ENGINE should similarly prefer:

- local-first persistence
- explicit session event records
- reproducible exercise generation from seeds where practical
- asset ownership by session/project
- no account requirement
- no mandatory uploads
- deterministic analytics wherever the underlying inputs permit it

## 2.4 Mentl: the medium should teach

Mentl's defining idea is that the medium should itself provide the teaching and should refuse to silently accept unproven claims. That philosophical idea maps unusually well onto a training instrument. [Mentl repository](https://github.com/ampactor-labs/mentl)

FREESTYLE ENGINE should therefore avoid:

- fake precision
- meaningless XP
- arbitrary “AI says you're an 87” scores
- generic encouragement masquerading as feedback

Instead it should expose receipts:

> You paused 1.8 s during topic transitions in 4 of the last 6 sessions.

> Your rhyme density stayed high; your syllable rate dropped 23% after each topic switch.

> Today's exercise targets that exact failure mode.

## 2.5 Stoop: strong product constraints as positive design

Stoop's design is notable for treating refusals and constraints as structural rather than as things to be documented after the fact. [Stoop repository](https://github.com/ampactor/stoop)

FREESTYLE ENGINE should have equally explicit non-goals and hard invariants. It should be difficult for an AI coding agent to “improve” the application into a generic SaaS dashboard or a content platform.

---

# 3. Language and Technology Decision

## 3.1 Recommendation: TypeScript

**Use TypeScript.**

Not React TypeScript. Not Next.js. Not a backend-first Node application. Not Rust for the initial implementation.

Use:

- TypeScript
- Vite
- native DOM APIs
- CSS
- Web Audio API
- MediaRecorder
- Web Speech API behind an adapter
- IndexedDB
- OPFS where useful
- Datamuse HTTP API
- Vitest
- Playwright or Puppeteer for browser E2E

This choice is primarily about fit, not fashion.

### Why TypeScript wins here

1. The deployment target is a static browser application.
2. The application needs deep access to browser media APIs.
3. The UI is highly interactive but does not inherently require React's rendering model.
4. The project is close to Noodles' existing Vite/vanilla architecture, reducing cognitive and toolchain drift.
5. AI coding agents are extremely strong in TypeScript/browser ecosystems.
6. TypeScript gives a strong domain model without introducing a compile-to-WASM boundary prematurely.
7. Browser APIs are themselves JavaScript APIs, so the impedance mismatch is minimal.

## 3.2 Why not React

React is not technically wrong. It is simply unnecessary at the beginning.

This application's hard problems are:

- audio timing
- microphone interaction
- recording state
- analysis
- persistence
- a domain-specific training engine
- mobile interaction

They are not component-tree management problems.

A framework would risk shifting design attention toward:

> “How should this state be represented in the component hierarchy?”

instead of:

> “What should the performer experience during bar 3 of a live exercise?”

Start vanilla. Introduce a framework only if measured complexity demonstrates an actual need.

## 3.3 Why not Rust initially

Rust is highly appropriate for:

- DSP kernels
- high-performance signal analysis
- deterministic cross-platform computation
- WASM modules

But the first version does not need that boundary.

If profiling later demonstrates that a specific analysis operation is CPU-bound, extract that operation to Rust/WASM behind a tiny stable interface.

Do not make the whole product Rust/WASM merely because Sonido exists.

## 3.4 Why not Python

Python is unnecessary for the browser application and would introduce a deployment/runtime boundary with no immediate benefit.

Python may become useful later for offline research, model evaluation, corpus generation, or batch experiments, but it should not be part of the V1 runtime architecture.

---

# 4. Core Product Thesis

FREESTYLE ENGINE should make the user want to practice because each session feels like an instrument session, not homework.

The application should eventually answer three questions continuously:

### What am I becoming good at?

Skill profile.

### What am I currently bad at?

Observed failure modes.

### What should I do next?

Adaptive exercise prescription.

The application therefore has a persistent **Training State**.

---

# 5. Product Principles

These are architectural constraints, not suggestions.

## P1. The instrument is the product

The daily workout should be playable with almost no reading.

## P2. Performance precedes analysis

Do not interrupt a freestyle to display analytics unless the exercise explicitly calls for it.

## P3. Local-first

Recording, session data, configuration, progress, and analysis should work without an account.

## P4. No mandatory AI

The deterministic training system must stand on its own.

## P5. No fake scores

Metrics must either have a clear operational definition or not be presented as scores.

## P6. Every metric needs a receipt

Users should be able to inspect why a measurement exists.

## P7. Difficulty should be earned by evidence

Do not raise difficulty merely because the user has completed a number of sessions.

## P8. Constraints create skill

Exercises should deliberately isolate subskills before recombining them.

## P9. Novelty without randomness

The daily workout should feel fresh while remaining diagnostically meaningful.

## P10. No feed

There is no social feed, engagement feed, marketplace, or content treadmill.

## P11. No lyric-generation dependency

The application teaches the user to generate, not to outsource generation.

## P12. Performance quality matters more than app retention

If a user needs to close the app and freestyle with friends, that is a success.

---

# 6. Primary User Loop

```text
OPEN
  |
  v
TODAY
  |
  v
WARM UP
  |
  v
SKILL DRILL
  |
  v
CONSTRAINT DRILL
  |
  v
OPEN FREESTYLE
  |
  v
REVIEW
  |
  v
DIAGNOSIS
  |
  v
UPDATED SKILL STATE
  |
  v
NEXT SESSION
```

The whole experience should fit into approximately 20–45 minutes for normal sessions, while allowing tiny 3–5 minute sessions and extended 60–120 minute laboratory sessions.

---

# 7. Primary Modes

## 7.1 Today

The default screen.

Shows one adaptive workout generated from current training state.

Example:

```text
TODAY

WEAKNESS
FLOW TRANSITIONS

WHY
Your syllable rate drops after topic changes.

MISSION
Change flow every 4 bars while maintaining rhyme density.

28 MINUTES

[ START ]
```

## 7.2 Train

Manual selection of exercises.

Useful for focused practice.

## 7.3 Free

No scoring pressure. Record and freestyle.

## 7.4 Flow Lab

Beat-focused cadence and pocket training.

## 7.5 Rhyme Lab

Phonetic retrieval, rhyme families, multisyllabic chains, internal rhyme.

## 7.6 Story Lab

Narrative improvisation.

## 7.7 Observation

Environment-based improvisation.

## 7.8 Wordplay Lab

Misdirection, double meaning, metaphor, semantic branching, punchline structures.

## 7.9 Gauntlet

Weekly compound challenge.

## 7.10 Review

Session history, recordings, transcript, metrics, and notes.

---

# 8. Skill Model

The initial model should contain these capabilities:

```ts
export type SkillId =
  | 'pocket'
  | 'flow_variation'
  | 'rhythm'
  | 'rhyme_retrieval'
  | 'internal_rhyme'
  | 'multisyllabic_rhyme'
  | 'vocabulary'
  | 'association'
  | 'imagery'
  | 'metaphor'
  | 'wordplay'
  | 'punchlines'
  | 'observation'
  | 'storytelling'
  | 'topic_transition'
  | 'recovery'
  | 'breath'
  | 'articulation'
  | 'pitch'
  | 'vocal_dynamics'
  | 'coherence'
  | 'presence';
```

Each skill should track evidence, not just a number.

```ts
interface SkillState {
  skill: SkillId;
  confidence: number;
  evidenceCount: number;
  recentTrend: 'up' | 'flat' | 'down';
  strengths: EvidenceTag[];
  weaknesses: EvidenceTag[];
  lastPracticedAt: number | null;
  lastAssessedAt: number | null;
}
```

The UI should usually show qualitative states:

- emerging
- developing
- stable
- strong
- advanced

Internally, numerical values are acceptable for adaptation.

Externally, avoid pretending they are objective measurements of artistic ability.

---

# 9. Evidence Model

A session should produce machine-readable observations.

Example:

```ts
interface Observation {
  id: string;
  timestamp: number;
  kind:
    | 'pause'
    | 'topic_switch'
    | 'rhyme'
    | 'repeated_word'
    | 'speech_rate'
    | 'silence'
    | 'flow_change'
    | 'prompt_hit'
    | 'recording_marker';
  value: number | string;
  confidence: number;
  source: 'audio' | 'transcript' | 'exercise' | 'self_report';
}
```

Example evidence:

```text
TOPIC SWITCH @ 02:14
speech rate: 4.7 syllables/s
previous segment: 6.1 syllables/s
rhyme density: stable
pause: 1.7 s
```

This is much more useful than:

> Flow: 72/100.

---

# 10. Session Model

A session must be reconstructable from its event history.

```ts
interface Session {
  id: string;
  startedAt: number;
  endedAt?: number;
  workoutId?: string;
  exerciseId?: string;
  mode: SessionMode;
  seed: string;
  beat?: BeatReference;
  prompts: PromptEvent[];
  events: SessionEvent[];
  observations: Observation[];
  transcript?: Transcript;
  recording?: RecordingReference;
  selfAssessment?: SelfAssessment;
  analysis?: SessionAnalysis;
  version: number;
}
```

The session `seed` allows reproducible prompt generation for debugging and evaluation.

---

# 11. Event-Sourced Interaction Model

Use append-only session events where practical.

Example:

```ts

type SessionEvent =
  | { type: 'session_started'; at: number }
  | { type: 'prompt_shown'; at: number; promptId: string }
  | { type: 'prompt_hit'; at: number; promptId: string }
  | { type: 'flow_change'; at: number; mode: FlowMode }
  | { type: 'topic_change'; at: number; topic: string }
  | { type: 'recording_started'; at: number }
  | { type: 'recording_stopped'; at: number }
  | { type: 'session_paused'; at: number }
  | { type: 'session_resumed'; at: number }
  | { type: 'session_completed'; at: number };
```

This makes later analytics and debugging dramatically easier.

---

# 12. Exercise Model

Exercises are declarative data, not arbitrary UI code.

```ts
interface ExerciseDefinition {
  id: string;
  version: number;
  title: string;
  category: ExerciseCategory;
  skills: SkillWeight[];
  durationSeconds: number;
  difficulty: Difficulty;
  prerequisites?: Constraint[];
  constraints: Constraint[];
  promptStrategy: PromptStrategy;
  measurementStrategy: MeasurementStrategy[];
  successCriteria: SuccessCriterion[];
  failureModes: FailureMode[];
}
```

The engine should be able to produce a workout from these definitions without every exercise requiring custom imperative code.

---

# 13. Exercise Taxonomy

## Rhyme Retrieval

- five rhymes
- ten rhymes
- rapid rhyme burst
- multisyllabic family
- internal-rhyme hunt
- slant-rhyme hunt
- rhyme chain
- phonetic maze

## Flow

- straight pocket
- double-time
- triplet
- half-time
- sparse flow
- dense flow
- cadence switch
- delayed cadence
- anticipation
- phrase-length mutation

## Topic Transition

- four-bar switch
- two-bar switch
- one-bar switch
- semantic bridge
- unrelated-object jump
- callback chain

## Observation

- object description
- environmental inventory
- people-watching
- sound-only observation
- color-only observation
- motion-only observation
- five-object synthesis

## Story

- beginning/middle/end
- character/location/object
- escalating problem
- flashback
- unreliable narrator
- first person
- third person
- emotional reversal
- callback ending

## Wordplay

- metaphor
- simile
- homophone
- double meaning
- literal/figurative switch
- misdirection
- absurd escalation
- setup/payoff
- rebuttal

## Voice

- articulation
- consonant precision
- breath management
- volume control
- pitch contour
- melodic rap
- whisper/voice contrast
- dynamic contrast

## Recovery

- no-stop round
- recover after deliberate silence
- forced rhyme failure
- prompt interruption
- beat drop recovery

---

# 14. The Daily Workout Generator

This is the heart of the product.

The generator should not simply choose random exercises.

It should optimize for a balance of:

```text
TARGET WEAKNESSES
+ SPACED PRACTICE
+ NOVELTY
+ TRANSFER
+ SUCCESS PROBABILITY
+ DIFFICULTY
```

A simple first-pass scoring function is enough:

```ts
scoreExercise(exercise, profile) =
  weaknessWeight
+ overdueWeight
+ transferWeight
+ noveltyWeight
- overloadPenalty
```

Later versions can become more sophisticated.

## 14.1 Workout structure

Default 30-minute workout:

```text
2 min   vocal warmup
3 min   rhyme retrieval
4 min   pocket / flow
5 min   targeted weakness
5 min   transfer exercise
5 min   observation or story
4 min   open freestyle
2 min   final boss round
```

The exact structure should be data-driven.

---

# 15. Difficulty Engine

Difficulty should be multidimensional.

```ts
interface Difficulty {
  base: number;
  timePressure: number;
  linguisticDensity: number;
  rhythmicComplexity: number;
  topicVolatility: number;
  constraintCount: number;
  recoveryDemand: number;
}
```

For example:

### Easy

One topic. 90 seconds. No required rhyme family.

### Medium

Two topics. Four-bar switch. Maintain rhyme.

### Hard

New topic every two bars. Internal rhymes. No stops.

### Elite

New topic every two bars + flow change + story coherence + specified rhyme family + final callback.

---

# 16. Adaptive Progression

The application should learn three distinct things:

## Ability

What the user can already do.

## Reliability

How consistently they can do it.

## Transfer

Whether a skill survives when combined with other demands.

This matters because:

> Being able to produce multisyllabic rhymes in isolation does not mean being able to produce them while telling a story at 95 BPM.

The system should therefore progress from:

```text
ISOLATED SKILL
      |
      v
SKILL + ONE DEMAND
      |
      v
SKILL + TWO DEMANDS
      |
      v
FULL PERFORMANCE
```

---

# 17. Rhyme Service

## Datamuse

Datamuse should be the default language-data backend for the first release.

It provides rhyme and semantic relationships via a simple HTTP API and is particularly well suited to a static application. [Datamuse documentation](https://www.datamuse.com/api/)

The application should wrap it behind an adapter:

```ts
interface RhymeProvider {
  rhymes(word: string, options?: RhymeOptions): Promise<WordResult[]>;
  soundsLike(word: string): Promise<WordResult[]>;
  related(word: string): Promise<WordResult[]>;
  synonyms(word: string): Promise<WordResult[]>;
  compounds(word: string): Promise<WordResult[]>;
}
```

Never call Datamuse directly from UI components.

---

# 18. Rhyme Telescope

A dedicated visual tool.

Input:

```text
COMPUTER
```

Display multiple rings:

```text
DIRECT RHYMES
  shooter
  looter
  tutor

MULTIS
  commuter
  prosecutor

NEAR RHYMES
  future
  maneuver
  super

SEMANTIC
  machine
  processor
  technology
```

Selecting a result recursively explores that result.

This is both a practice tool and a composition instrument.

---

# 19. Speech Architecture

Use an abstraction layer:

```ts
interface SpeechRecognizer {
  readonly availability: 'available' | 'unavailable' | 'unknown';
  start(options: RecognitionOptions): Promise<void>;
  stop(): Promise<void>;
  onPartialResult(callback: (result: PartialTranscript) => void): Unsubscribe;
  onFinalResult(callback: (result: FinalTranscript) => void): Unsubscribe;
  onError(callback: (error: SpeechError) => void): Unsubscribe;
}
```

Implement:

1. `WebSpeechRecognizer`
2. `UnavailableRecognizer`
3. optional future `RemoteRecognizer`

The core recording experience must work without transcription.

Speech recognition support varies by browser, so the application must treat transcription as an enhancement rather than a hard dependency. [MDN SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)

---

# 20. Audio Architecture

Do not put audio code inside UI files.

```text
UI
 |
 v
AudioController
 |
 +-- Transport
 +-- Metronome
 +-- BeatPlayer
 +-- Recorder
 +-- Playback
 +-- InputMeter
 +-- OptionalAnalyzers
```

Use native Web Audio unless a library materially reduces code or risk.

Tone.js is acceptable because Noodles already uses it, but the engine must not make Tone.js concepts part of the domain model.

The domain knows:

```text
beat at 94 BPM
```

It does not know:

```text
Tone.Transport.scheduleRepeat(...)
```

---

# 21. Beat Model

```ts
interface Beat {
  id: string;
  bpm: number;
  timeSignature: [number, number];
  swing?: number;
  audioUrl: string;
  bars?: number;
  tags: string[];
  source: 'bundled' | 'user';
}
```

Initially bundle a small original beat library rather than relying on external streaming APIs.

The user must also be able to:

- upload WAV/MP3 where browser support permits
- choose BPM manually
- tap tempo
- practice with metronome only

---

# 22. Recording Model

Prefer local recording.

Store raw recordings separately from metadata.

Potential storage strategy:

```text
IndexedDB
  session metadata
  workout history
  transcripts
  derived analysis

OPFS
  recordings
  imported beats
  large assets
```

Do not put multi-minute PCM blobs directly into normal localStorage.

---

# 23. Audio Metrics

Do not promise “AI understanding” when simple signal measurements are enough.

Initial measurable metrics:

- total vocal duration
- silence duration
- longest silence
- average speech segment length
- estimated speech rate where supported
- peak level
- RMS/loudness proxy
- dynamic range proxy
- recording duration
- prompt response latency

Possible later metrics:

- voiced/unvoiced segments
- pitch contour
- syllable-rate estimation
- breath segmentation
- cadence regularity
- beat alignment

All advanced metrics should be labeled as estimates.

---

# 24. Transcript Metrics

Where transcript data exists:

- unique word count
- lexical diversity
- repeated-word frequency
- filler word frequency
- exact rhyme candidates
- internal rhyme candidates
- approximate rhyme density
- multisyllabic candidate density
- average words per line/segment
- topic keyword transitions
- prompt hit detection

Important:

**These metrics are analytic aids, not aesthetic truth.**

The user remains the authority on whether a performance actually sounds good.

---

# 25. Rhyme Analysis Strategy

V1 should use transcript text + Datamuse-assisted lookup.

Avoid building a full phonological engine in V1.

Process:

```text
TRANSCRIPT
    |
    v
SEGMENT INTO LINES / WINDOWS
    |
    v
NORMALIZE TOKENS
    |
    v
SELECT TERMINAL WORDS
    |
    v
LOOKUP RHYME CANDIDATES
    |
    v
COMPARE AGAINST RECENT WORDS
    |
    v
ESTIMATE RHYME DENSITY
```

Later:

- CMU Pronouncing Dictionary
- phoneme-level matching
- stress pattern analysis
- custom rhyme scoring
- offline phoneme package

If a phoneme engine becomes necessary, evaluate WASM or a compact generated dictionary rather than adding a server.

---

# 26. Flow Analysis

V1 should not claim to perfectly identify rap flow.

Use practical proxies:

- words or syllable estimates per second
- speech segment length
- pause locations
- tempo-relative segmentation
- phrase length variance
- detected cadence changes where confidence is sufficient

The system can then say:

> Speech rate dropped 25% immediately after the topic change.

It should not say:

> Your flow was bad.

---

# 27. Observation Mode

This mode should exploit the physical environment.

Prompt types:

- describe one object
- describe a moving object
- identify three colors
- identify a sound
- person without guessing private attributes
- texture
- architecture
- motion
- weather
- object chain

The system should avoid prompts that encourage invasive or sensitive speculation about strangers.

Example exercise:

```text
OBSERVE

Find five things moving.

30 seconds each.

Then connect all five in one story.
```

---

# 28. Story Engine

Story exercises should explicitly model narrative mechanics.

```ts
interface StoryConstraint {
  protagonist: Prompt;
  setting: Prompt;
  object: Prompt;
  conflict?: Prompt;
  endingConstraint?: Prompt;
}
```

Later analytical heuristics can inspect:

- protagonist persistence
- setting persistence
- event ordering
- semantic recurrence
- final callback
- topic continuity

Do not pretend an algorithm understands narrative quality completely.

---

# 29. Wordplay Engine

The wordplay system should encourage multiple interpretations of the same lexical material.

For a target word, generate:

```text
literal meaning
related meanings
homophones
phonetic neighbors
metaphorical domains
common phrases
idioms
contrasts
unexpected associations
```

Exercise:

> Take `bank`.
>
> Produce one bar about money.
>
> One about a river.
>
> One using a metaphor.
>
> One that intentionally flips the meaning.

---

# 30. Never-Stop Mode

Core rules:

- recording never stops
- silence is measured
- prompts can arrive during the round
- the beat continues
- the user may recover

The system should distinguish:

```text
intentional pause
thinking pause
beat-space
actual failure
```

V1 cannot perfectly classify these.

Therefore expose the raw observation and let the user annotate the session afterward.

---

# 31. Prompt Engine

Prompts should be generated from structured categories.

```ts
interface Prompt {
  id: string;
  text: string;
  category: PromptCategory;
  semanticTags: string[];
  difficulty: number;
  source: 'builtin' | 'generated' | 'user';
}
```

Prompt categories:

- concrete object
- abstract concept
- person
- place
- sensory detail
- action
- emotion
- conflict
- technical concept
- cultural reference
- random noun
- user-generated

Avoid repetitive prompt distribution.

---

# 32. User Prompt Capture

The user should be able to enter a word or phrase and immediately turn it into a drill.

Example:

```text
TYPE A WORD

WORMHOLE

[ RHYME ] [ STORY ] [ FLOW ] [ WORDPLAY ] [ FREE ]
```

That is a core interaction, not a settings feature.

---

# 33. The Gauntlet

Weekly compound assessment.

Example:

```text
ROUND 1
90 BPM

ROUND 2
NEW OBJECT EVERY 4 BARS

ROUND 3
MAINTAIN A RHYME FAMILY

ROUND 4
CHANGE FLOW

ROUND 5
TELL A STORY

ROUND 6
CALLBACK TO ROUND 1

FINAL
90 SECONDS NO STOP
```

The gauntlet should produce a longitudinal comparison, not a single fake score.

---

# 34. Review Screen

After a session:

```text
SESSION COMPLETE

08:42

VOCAL TIME       07:51
LONGEST PAUSE    1.72s
UNIQUE WORDS     188
REPEATED WORDS   17
PROMPTS HIT      9/10

WHAT STOOD OUT

+ rhyme density stayed high
+ strong object associations
- topic transitions caused pauses
- final minute lost vocal intensity

NEXT TRAINING TARGET
FLOW TRANSITIONS
```

Then offer:

`[ SAVE NOTE ] [ LISTEN ] [ PRACTICE AGAIN ] [ DONE ]`

---

# 35. Self-Assessment

The human performer should always have a lightweight self-rating.

```text
HOW DID IT FEEL?

flow       1 2 3 4 5
rhyme      1 2 3 4 5
story      1 2 3 4 5
voice      1 2 3 4 5
presence   1 2 3 4 5
```

This is not embarrassing or secondary data. Self-evaluation is essential because artistic success is not completely observable from browser metrics.

---

# 36. Training State Update

After each session:

```text
observations
    + self assessment
    + exercise difficulty
    + success criteria
    + historical state
          |
          v
     evidence update
          |
          v
      skill state
          |
          v
   weakness detection
          |
          v
 prescription queue
```

The implementation should be deterministic and testable.

---

# 37. Weakness Detection

A weakness should require multiple pieces of evidence where possible.

Example rule:

```ts
if (
  topicTransitionPauseRate > baseline * 1.3 &&
  topicTransitionRate >= threshold &&
  evidenceCount >= 3
) {
  flagWeakness('topic_transition');
}
```

Avoid changing the user's curriculum based on one weird session.

---

# 38. Spaced Practice

The engine should remember when a skill was last practiced.

If a skill is strong but stale:

> maintenance

If weak and stale:

> priority

If weak but heavily trained recently:

> continue briefly, then rotate

This avoids the common failure mode of training only what is currently interesting.

---

# 39. Transfer Matrix

Maintain explicit relationships between skills.

Example:

```text
rhyme_retrieval
  -> internal_rhyme
  -> wordplay
  -> punchlines
  -> storytelling

flow_variation
  -> topic_transition
  -> recovery
  -> presence

observation
  -> storytelling
  -> imagery
  -> association
```

The workout engine should eventually use these edges to create compound exercises.

---

# 40. Personal Difficulty Calibration

Difficulty should adapt to the user rather than assuming a universal scale.

The system should estimate:

- challenge success rate
- failure rate
- time-to-completion
- self-rated difficulty
- consistency

Then maintain a target zone, for example:

> roughly 65–85% success on isolated drills

and lower success on boss rounds.

The exact target should remain configurable.

---

# 41. No Generic Streak Addiction

Streaks may exist as a lightweight indicator, but they are not the central progression mechanism.

Avoid:

- punishment for missing days
- manipulative notifications
- artificial urgency
- arbitrary XP inflation

A five-minute serious session is worth more than an accidental tap that preserves a streak.

---

# 42. Interface Architecture

The app should feel like a physical instrument.

Primary navigation should be minimal:

```text
TODAY
TRAIN
FREE
REVIEW
```

Secondary tools can live behind one compact menu:

```text
RHYME
FLOW
STORY
GAUNTLET
SETTINGS
```

Do not use a permanent sidebar on phone.

---

# 43. Visual Language

Desired characteristics:

- dark by default
- high contrast
- large typography
- almost no ornament
- strong monospaced numerics
- physical/instrument-like controls
- very limited color palette
- restrained animation
- no “AI gradient” aesthetic

Reference feeling:

- drum machine
- sampler
- vocal booth timer
- field notebook
- tape machine
- performance instrument

Not:

- SaaS admin dashboard
- children's language-learning app
- neon gamer UI
- generic AI startup

---

# 44. Mobile Interaction Rules

The app should be usable with one thumb when possible.

Large controls:

- START
- STOP
- NEXT
- PAUSE
- REPEAT
- RECORD

Avoid requiring precise small targets during performance.

The screen should not make the user stare at it while rapping.

---

# 45. Accessibility

Minimum requirements:

- keyboard-accessible controls
- visible focus states
- semantic buttons
- text alternatives
- reduced-motion support
- captions/transcript where possible
- sufficient contrast
- controls not dependent on color alone

Performance mode should also allow screen-off/audio-only use where the browser permits it.

---

# 46. Project Structure

Use a structure closer to Noodles than a conventional enterprise frontend.

```text
freestyle-engine/
|
+-- public/
|   +-- beats/
|   +-- icons/
|   +-- fonts/
|   +-- prompts/
|
+-- src/
|   |
|   +-- model/
|   |   +-- session.ts
|   |   +-- workout.ts
|   |   +-- exercise.ts
|   |   +-- skill.ts
|   |   +-- prompt.ts
|   |   +-- beat.ts
|   |   +-- analysis.ts
|   |   +-- profile.ts
|   |   +-- index.ts
|   |
|   +-- engine/
|   |   +-- workout-generator.ts
|   |   +-- difficulty.ts
|   |   +-- progression.ts
|   |   +-- weakness-detector.ts
|   |   +-- skill-updater.ts
|   |   +-- prescription.ts
|   |   +-- prompt-engine.ts
|   |   +-- index.ts
|   |
|   +-- exercises/
|   |   +-- registry.ts
|   |   +-- rhyme.ts
|   |   +-- flow.ts
|   |   +-- story.ts
|   |   +-- observation.ts
|   |   +-- wordplay.ts
|   |   +-- voice.ts
|   |   +-- recovery.ts
|   |   +-- gauntlet.ts
|   |
|   +-- audio/
|   |   +-- audio-controller.ts
|   |   +-- transport.ts
|   |   +-- beat-player.ts
|   |   +-- metronome.ts
|   |   +-- recorder.ts
|   |   +-- meter.ts
|   |   +-- playback.ts
|   |   +-- analysis.ts
|   |   +-- index.ts
|   |
|   +-- speech/
|   |   +-- speech-recognizer.ts
|   |   +-- web-speech.ts
|   |   +-- unavailable.ts
|   |   +-- transcript.ts
|   |   +-- index.ts
|   |
|   +-- language/
|   |   +-- rhyme-provider.ts
|   |   +-- datamuse.ts
|   |   +-- cache.ts
|   |   +-- rhyme-analysis.ts
|   |   +-- phonetics.ts
|   |   +-- index.ts
|   |
|   +-- analysis/
|   |   +-- session-analysis.ts
|   |   +-- speech-metrics.ts
|   |   +-- rhyme-metrics.ts
|   |   +-- flow-metrics.ts
|   |   +-- prompt-metrics.ts
|   |   +-- evidence.ts
|   |   +-- index.ts
|   |
|   +-- storage/
|   |   +-- database.ts
|   |   +-- sessions.ts
|   |   +-- profiles.ts
|   |   +-- recordings.ts
|   |   +-- beats.ts
|   |   +-- migrations.ts
|   |   +-- export.ts
|   |   +-- import.ts
|   |   +-- index.ts
|   |
|   +-- ui/
|   |   +-- app.ts
|   |   +-- router.ts
|   |   +-- today-view.ts
|   |   +-- train-view.ts
|   |   +-- free-view.ts
|   |   +-- review-view.ts
|   |   +-- flow-lab-view.ts
|   |   +-- rhyme-lab-view.ts
|   |   +-- story-lab-view.ts
|   |   +-- observation-view.ts
|   |   +-- wordplay-view.ts
|   |   +-- gauntlet-view.ts
|   |   +-- components/
|   |   +-- primitives/
|   |   +-- styles/
|   |   +-- gestures/
|   |   +-- overlays/
|   |
|   +-- content/
|   |   +-- exercises/
|   |   +-- prompts/
|   |   +-- beats/
|   |   +-- warmups/
|   |   +-- gauntlets/
|   |
|   +-- ai/
|   |   +-- coach.ts
|   |   +-- provider.ts
|   |   +-- prompts.ts
|   |   +-- optional.ts
|   |
|   +-- app.ts
|   +-- main.ts
|
+-- tests/
|   +-- unit/
|   +-- engine/
|   +-- model/
|   +-- analysis/
|   +-- storage/
|   +-- browser/
|   +-- fixtures/
|
+-- tools/
|   +-- generate-prompts.ts
|   +-- inspect-recording.ts
|   +-- validate-exercises.ts
|   +-- build-report.ts
|
+-- docs/
|   +-- DESIGN.md
|   +-- ARCHITECTURE.md
|   +-- TRAINING.md
|   +-- ANALYSIS.md
|   +-- PRIVACY.md
|   +-- BROWSER_SUPPORT.md
|
+-- AGENTS.md
+-- CLAUDE.md
+-- DECISIONS.md
+-- ROADMAP.md
+-- README.md
+-- index.html
+-- package.json
+-- tsconfig.json
+-- vite.config.ts
+-- vitest.config.ts
+-- playwright.config.ts
+-- eslint.config.js
+-- prettier.config.js
+-- LICENSE
```

The exact tree can be simplified during implementation. The important architectural boundaries are the model, engine, audio, speech, language, analysis, storage, and UI layers.

---

# 47. File Boundary Rules

## `model/`

Pure types and domain data.

No DOM.
No browser APIs.
No network.
No audio library.

## `engine/`

Pure or mostly pure domain algorithms.

No DOM.
No network.
No UI rendering.

## `audio/`

Owns Web Audio and recording.

## `speech/`

Owns speech-recognition APIs.

## `language/`

Owns Datamuse and future language providers.

## `analysis/`

Consumes data and returns measurements.

## `storage/`

Owns IndexedDB/OPFS.

## `ui/`

Owns presentation and user interaction.

The UI can call services, but services must never reach into the UI.

---

# 48. State Management

Do not introduce Redux/Zustand/etc. initially.

Use explicit application state with narrow controllers.

Example:

```ts
interface AppState {
  route: Route;
  session: SessionRuntime | null;
  profile: TrainingProfile;
  preferences: Preferences;
  capabilities: BrowserCapabilities;
}
```

If state management later becomes painful, solve the actual problem rather than adding a state framework preemptively.

---

# 49. Rendering Strategy

Prefer direct DOM updates for performance-sensitive views.

Do not render hundreds of transcript nodes every speech event.

Use:

- batching
- requestAnimationFrame
- document fragments
- capped transcript history in live mode

Analysis views can be heavier because they are not latency-sensitive.

---

# 50. Caching

Cache Datamuse results locally.

Cache key example:

```text
rhyme:computer:perfect
```

The cache should have:

- timestamp
- API version/source
- normalized query
- result payload

This both improves performance and reduces external requests.

---

# 51. Privacy Model

Default behavior:

**Nothing leaves the device except explicit calls to third-party APIs necessary for a feature.**

Important distinction:

- recorded audio: local
- session history: local
- profile: local
- transcript: local
- Datamuse query: word/phrase query only
- optional AI: explicitly opt-in and explicitly disclosed

The app should have a visible privacy panel explaining this in ordinary language.

---

# 52. Optional AI Layer

AI should enter through an interface like:

```ts
interface CoachProvider {
  analyzeSession(input: CoachingInput): Promise<CoachingOutput>;
  generateExercises(input: ExerciseGenerationInput): Promise<ExerciseSuggestion[]>;
}
```

The provider should never write directly to the user's persistent skill state.

Instead:

```text
AI suggestion
      |
      v
human-readable evidence
      |
      v
optional user acceptance
      |
      v
training state
```

This prevents a hallucinated AI judgment from becoming permanent truth.

---

# 53. AI Prompting Rules

Any future AI coach should be instructed:

- do not invent metrics
- separate observation from interpretation
- cite transcript excerpts when analyzing lyrics
- identify uncertainty
- prefer one high-value training target over ten generic suggestions
- never generate fake praise
- never rewrite the user's voice into a generic style
- preserve the user's artistic agency
- do not produce copyrighted lyrics on demand
- never pretend to have heard audio if only transcript was supplied

---

# 54. Optional LLM Use Cases

Good:

- “You repeated this concept three times. Give me three different conceptual directions for tomorrow's drill.”
- “Create a story exercise using these three constraints.”
- “Help identify the strongest image in this transcript.”
- “Design a harder version of this exercise.”

Bad:

- “Rate my rap 93/100.”
- “Tell me I'm amazing.”
- “Write the freestyle for me.”

---

# 55. Browser Capability Detection

At boot, inspect:

```ts
interface BrowserCapabilities {
  audioContext: boolean;
  mediaRecorder: boolean;
  speechRecognition: boolean;
  indexedDb: boolean;
  opfs: boolean;
  webCodecs: boolean;
  serviceWorker: boolean;
}
```

The app should not crash when an optional capability is absent.

---

# 56. Progressive Enhancement Matrix

| Capability | Required | Fallback |
|---|---:|---|
| Web Audio | Yes | Metronome-only / unsupported message |
| MediaRecorder | Preferred | No recording mode |
| SpeechRecognition | No | Audio-only mode |
| IndexedDB | Yes for persistence | memory-only session |
| OPFS | No | IndexedDB blobs where practical |
| WebCodecs | No | MediaRecorder playback/export |
| AI provider | No | deterministic coach |
| Datamuse | No | bundled rhyme resources / manual mode |

---

# 57. Offline Mode

The application should eventually function offline for all core activities.

Offline-capable:

- workouts
- prompts
- beats
- recording
- analysis
- profile
- history

Network-dependent:

- Datamuse cache misses
- optional AI
- future remote services

Use a service worker only once the static app is stable.

Do not create PWA complexity on day one if it slows the core instrument.

---

# 58. Seeded Randomness

Any randomly generated workout should use a seed.

```ts
interface WorkoutGenerationContext {
  date: string;
  userSeed: string;
  profileVersion: number;
}
```

This allows:

- bug reproduction
- testing
- replay
- session sharing
- stable daily workout generation

The user can reroll without invalidating the original generated workout.

---

# 59. Content Packs

Prompts and exercises should eventually be externalized into structured content.

Example:

```json
{
  "id": "story.character.location.object.v1",
  "category": "story",
  "skills": ["storytelling", "association"],
  "difficulty": 4,
  "template": {
    "character": "prompt.character",
    "location": "prompt.location",
    "object": "prompt.object"
  }
}
```

This prevents logic changes from being required merely to add exercises.

---

# 60. Testing Strategy

The project should be much better tested than a toy creative app while remaining practical.

## Unit tests

Test:

- workout generation
- difficulty updates
- weakness detection
- skill progression
- prompt selection
- seeded randomness
- rhyme normalization
- transcript segmentation
- metric calculations
- storage migrations

## Browser tests

Use real Chromium to verify:

- app boots
- audio context starts after gesture
- workout can begin
- recorder starts/stops
- session completes
- session persists
- history reloads

## Manual device tests

At minimum:

- modern Android Chrome
- iPhone Safari
- desktop Chromium
- Firefox desktop

---

# 61. Golden Fixtures

Create fixed synthetic sessions.

Example:

```text
fixture/topic-switch-stable.json
fixture/topic-switch-failure.json
fixture/rhyme-dense.json
fixture/no-stop.json
fixture/story-with-callback.json
```

The analysis engine should produce known approximate outputs for these fixtures.

This lets coding agents modify implementation without silently changing the training model.

---

# 62. Verification Commands

The final project should expose commands such as:

```bash
npm run dev
npm run build
npm run check
npm run test
npm run test:e2e
npm run smoke
npm run lint
npm run typecheck
```

A reasonable `check` should run the minimum trustworthy suite.

Example:

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

The agent should never consider the work complete merely because TypeScript compiles.

---

# 63. GitHub Actions

CI should:

1. install dependencies
2. typecheck
3. lint
4. run unit tests
5. build
6. run browser smoke/E2E tests
7. deploy to Pages only after all required checks pass

The workflow should fail loudly on broken builds.

---

# 64. GitHub Pages Constraints

The production build must be a static artifact.

Do not require:

- Node at runtime
- server routes
- server-side sessions
- secrets embedded in the public bundle
- database server

Any API requiring a secret cannot be called directly from the static frontend unless there is a safe public architecture; instead make it optional or introduce an explicit future backend/service worker strategy.

Never place private API keys in GitHub Pages source.

---

# 65. URL / Routing Strategy

Prefer a single-page shell with query/hash state rather than server-dependent routes initially.

Examples:

```text
/#/today
/#/train
/#/free
/#/review/SESSION_ID
/#/rhyme/COMPUTER
```

The app should still load directly at the GitHub Pages origin regardless of path behavior.

---

# 66. Import / Export

The application should export a portable training archive.

Example:

```text
freestyle-engine-profile.json
```

And, optionally:

```text
freestyle-engine-session.bundle
```

The profile export should include:

- profile
- skill state
- session metadata
- exercise history
- preferences

Large recordings should be optionally included rather than always embedded.

---

# 67. Versioning and Migrations

Every persistent schema should have a version.

Example:

```ts
interface StoredDocument<T> {
  schemaVersion: number;
  createdAt: number;
  updatedAt: number;
  payload: T;
}
```

Migration functions should be explicit.

Never silently reinterpret old session data under a new schema.

---

# 68. Development Phases

# Phase 0 — Project Charter

### Objective

Create the repository, design constraints, agent instructions, and minimal app shell.

### Deliverables

- README
- DESIGN.md
- ROADMAP.md
- AGENTS.md
- CLAUDE.md
- DECISIONS.md
- Vite app
- TypeScript strict mode
- GitHub Pages deployment
- CI skeleton

### Exit criteria

A static page deploys successfully and CI verifies the build.

---

# Phase 1 — Core Instrument

### Objective

Make the application immediately usable as a daily freestyle timer/recorder.

### Features

- Today screen
- timer
- start/stop
- microphone permission
- audio recording
- local session storage
- playback
- simple beat player
- prompt display
- self-rating

### Exit criteria

A user can open the site on a phone, select a beat, receive a prompt, freestyle, stop, listen back, and have the session preserved.

No analytics required yet.

---

# Phase 2 — Rhyme Laboratory

### Objective

Add the first serious external language capability.

### Features

- Datamuse adapter
- rhyme search
- sounds-like
- related words
- semantic search
- local caching
- Rhyme Telescope
- rhyme drills
- seeded rhyme prompts

### Exit criteria

A word can become a complete practice session without leaving the app.

---

# Phase 3 — Transcript + Basic Analysis

### Objective

Turn performances into measurable evidence.

### Features

- SpeechRecognition adapter
- transcript storage
- pause analysis
- repeated word analysis
- lexical diversity
- prompt hit detection
- basic rhyme metrics
- basic speech rate estimates

### Exit criteria

After a recorded session, the user gets a clear evidence report.

---

# Phase 4 — Skill Model

### Objective

Build persistent training intelligence.

### Features

- skill graph
- evidence model
- self-assessment integration
- weakness detector
- skill history
- maintenance scheduling

### Exit criteria

The app can identify one plausible training weakness based on multiple sessions.

---

# Phase 5 — Adaptive Daily Workouts

### Objective

Make the application self-prescribing.

### Features

- workout generator
- difficulty calibration
- spaced practice
- transfer matrix
- seeded generation
- daily workout
- targeted exercises

### Exit criteria

Two different users with different histories receive meaningfully different workouts.

---

# Phase 6 — Flow Laboratory

### Objective

Make the beat itself a training instrument.

### Features

- BPM
- metronome
- flow-switch exercises
- cadence constraints
- topic-switch timing
- beat-relative markers
- manual flow annotation

### Exit criteria

A user can practice five distinct flows over the same beat and save the performance.

---

# Phase 7 — Story + Observation

### Objective

Build spontaneous semantic generation and narrative continuity.

### Features

- observation mode
- story constraints
- callbacks
- environmental prompts
- semantic transitions
- story drills

### Exit criteria

The system can generate a story exercise and record its result without breaking the performance loop.

---

# Phase 8 — Voice Lab

### Objective

Treat rap as vocal performance, not only text.

### Features

- vocal warmups
- pitch estimation where practical
- dynamics
- articulation drills
- melodic freestyle
- contrast drills

### Exit criteria

Voice exercises can be integrated into adaptive workouts.

---

# Phase 9 — Gauntlet

### Objective

Build compound skill transfer.

### Features

- weekly assessment
- multi-constraint sessions
- historical comparison
- best performance tracking
- recovery analysis

### Exit criteria

The user can complete an uninterrupted compound challenge and receive a longitudinal report.

---

# Phase 10 — Optional AI Coach

### Objective

Add qualitative reasoning without giving the model control of the training system.

### Features

- provider adapter
- explicit opt-in
- session summaries
- advanced exercise proposals
- narrative feedback
- coach notes

### Exit criteria

AI can provide useful qualitative feedback without inventing data or modifying skill state autonomously.

---

# 69. V1 Scope

The first releasable version should include only:

- Today
- Train
- Free
- recording
- local persistence
- bundled beats
- prompts
- Datamuse rhyme tool
- simple transcript where supported
- basic session metrics
- basic skill state
- adaptive daily workout
- session review
- export/import

Everything else is secondary.

---

# 70. Explicit V1 Non-Goals

Do not build initially:

- social network
- user accounts
- multiplayer
- public profiles
- cloud recording storage
- subscription system
- AI-generated lyrics
- full DAW
- professional beat marketplace
- mobile native app
- server backend
- complex gamification
- elaborate animations
- complete phonological linguistics engine
- machine-learning model running in-browser

---

# 71. First Milestone: “It Makes Me Practice”

The first success criterion is psychological, not technical.

After installation, the user should be able to open the app and think:

> “Fuck it, I'll do today's 20 minutes.”

That means:

- almost no setup
- immediate audio
- immediate challenge
- no account
- no onboarding essay
- no configuration wall

---

# 72. Second Milestone: “It Knows My Weaknesses”

After roughly 10–20 sessions, the application should begin surfacing observations like:

> Your strongest recent skill is rhyme retrieval.
>
> Your weakest repeatable skill is topic transition.
>
> Your flow tends to simplify under semantic pressure.
>
> Your voice loses intensity during long uninterrupted rounds.

The exact statements must be evidence-based.

---

# 73. Third Milestone: “It Forces Transfer”

After the isolated skills improve, the application must deliberately combine them.

Example:

```text
RHYME FAMILY
+
TOPIC SWITCH
+
FLOW CHANGE
+
STORY CONTINUITY
+
NO STOP
```

That is the point at which the application moves from a practice timer into a genuine improvisational training system.

---

# 74. Fourth Milestone: “The App Becomes a Personal Laboratory”

Eventually the application should preserve experiments such as:

```text
08/25
95 BPM
triplet -> straight -> triplet

felt difficult

08/29
95 BPM
triplet -> straight -> triplet

felt manageable
```

The user can then see evidence of actual adaptation.

---

# 75. Development Workflow for AI Coding Agents

This project should be explicitly designed to resist agent drift.

The repository should have:

```text
AGENTS.md
CLAUDE.md
DECISIONS.md
DESIGN.md
ROADMAP.md
```

The highest-priority design rules should be repeated compactly in `AGENTS.md` and `CLAUDE.md`.

The agent must read these files before editing.

---

# 76. Agent Invariants

An agent must not:

- introduce React without an explicit architectural decision
- introduce a backend without an explicit architectural decision
- add accounts/authentication
- add cloud storage
- add an LLM as a required dependency
- replace deterministic analysis with opaque AI scoring
- introduce a state-management library merely for convenience
- move recording off-device
- redesign the visual language into generic SaaS UI
- break mobile-first interaction
- silently alter the training model

If a proposed change violates one of these, the agent should stop and record the reason in `DECISIONS.md` before proceeding.

---

# 77. Agent Development Loop

The preferred loop is:

```text
READ DESIGN
    |
    v
READ RELEVANT DOMAIN FILES
    |
    v
MAKE ONE SMALL CHANGE
    |
    v
RUN TARGETED TESTS
    |
    v
RUN FULL CHECK
    |
    v
UPDATE DECISION / DOCS IF ARCHITECTURE CHANGED
    |
    v
COMMIT
```

Avoid huge agent-generated rewrites.

---

# 78. Definition of Done for a Feature

A feature is done when:

1. behavior exists
2. the domain model represents it
3. the UI exposes it appropriately
4. the happy path works
5. failure paths are handled
6. tests exist for important logic
7. the feature does not violate architecture rules
8. documentation reflects any architectural consequences
9. production build succeeds
10. browser smoke tests pass where relevant

---

# 79. Design Decision Record Format

Use a simple ADR format in `DECISIONS.md`:

```md
## ADR-001: Use vanilla TypeScript instead of React

### Context
Why the choice was necessary.

### Decision
What we chose.

### Consequences
What gets easier.
What gets harder.

### Revisit when
What evidence would justify changing the decision.
```

Agents should add decisions rather than silently changing architecture.

---

# 80. Performance Budgets

Initial goals:

- fast first load on mobile
- no giant framework runtime
- no unnecessary audio decoding at startup
- no eager loading of every beat
- no eager loading of every prompt
- no giant transcript DOM

Production profiling should inspect:

- JS bundle size
- startup time
- audio start latency
- recording latency
- memory during 30-minute sessions
- storage growth
- battery behavior on mobile

---

# 81. Recording Reliability

Recording is a core feature and must handle:

- permission denial
- microphone unavailable
- device switching
- browser interruption
- page visibility changes
- accidental navigation
- storage quota issues

The UI should tell the truth.

For example:

> Recording unavailable: browser denied microphone access.

Not:

> Something went wrong.

---

# 82. Session Crash Recovery

During recording, periodically persist enough session metadata to recover from unexpected interruptions.

At minimum:

```text
session id
start time
current exercise
elapsed time
prompt history
recording state
```

If the page is reopened after a crash, offer:

> Recover interrupted session?

---

# 83. Browser Visibility Behavior

Do not assume timers remain accurate while the tab is backgrounded.

The audio system and exercise engine should distinguish:

- wall-clock time
- audio-context time
- application event time

Any timing-sensitive exercise should explicitly choose which clock it uses.

---

# 84. Analytics Ethics

The application is a personal training instrument, not an attention marketplace.

Do not collect:

- ad identifiers
- location
- contact lists
- unnecessary personal metadata
- biometric profiles for a remote database

No third-party analytics is required for V1.

Local usage statistics are enough.

---

# 85. Exported Data Should Be Human-Readable

Prefer JSON for profile/session metadata.

Example:

```json
{
  "schemaVersion": 1,
  "profile": {
    "skills": {},
    "preferences": {}
  },
  "sessions": []
}
```

The user owns the record.

There should never be a proprietary lock-in format for ordinary data.

---

# 86. Future Shared Session Format

A later version may support shareable session bundles:

```text
session.json
recording.webm
analysis.json
beat-reference.json
```

This enables:

- coach review
- peer feedback
- before/after comparisons
- public performance sharing

But none of this requires an account system.

---

# 87. Future Rust/WASM Extraction Boundary

Only after profiling should performance-critical components move to Rust.

Potential candidates:

- phoneme matching
- pitch tracking
- high-resolution onset analysis
- audio feature extraction
- waveform transforms

The interface should be something like:

```ts
interface AudioAnalysisKernel {
  analyze(input: Float32Array, sampleRate: number): AnalysisResult;
}
```

The browser implementation can initially be TypeScript/Web Audio.

A Rust/WASM implementation can later satisfy the same conceptual contract.

This mirrors the architectural strength already demonstrated in Sonido: isolate a computational kernel so multiple execution frontends can share it.

---

# 88. Future Native Client Possibility

Do not build for native now.

But preserve domain boundaries so a future native client could reuse:

- exercise definitions
- skill model
- training algorithms
- serialized session format

A future native client could be:

- Rust
- Tauri
- native mobile
- desktop

The web app remains the reference implementation.

---

# 89. Research Hooks

The project should keep a `docs/RESEARCH.md` file tracking hypotheses rather than pretending all training rules are established science.

Example:

```md
## Hypothesis
Frequent constrained topic switching improves spontaneous semantic association.

## Current implementation
Two-bar topic switch drills.

## Evidence
Personal longitudinal data; not generalized evidence.

## Next test
Compare recovery latency across 10 sessions.
```

This makes the app a personal empirical laboratory rather than an authority machine.

---

# 90. Experimental Protocols

The user should be able to deliberately run experiments.

Example:

```text
EXPERIMENT

Question:
Does practicing triplets improve my ability to switch from straight pocket to triplets?

Protocol:
10 sessions
3-minute daily drill
same BPM range
record every session

Measure:
transition latency
pause duration
self-rated difficulty
```

This is a natural extension of the user's engineering style and should eventually become a first-class feature.

---

# 91. Daily Dashboard

The main dashboard should not show dozens of metrics.

Show:

```text
TODAY

TARGET
Flow transitions

WHY
2.1x more pauses after topic changes this week.

WORKOUT
31 min

LAST SESSION
8:42

BEST RECENT IMPROVEMENT
Internal rhyme ↑

[ TRAIN ]
```

That is enough.

---

# 92. Longitudinal Dashboard

The history view can expose richer analysis.

Charts should answer questions such as:

- Are pauses decreasing?
- Is rhyme density increasing?
- Can I maintain speed under more constraints?
- Which skills have plateaued?
- Which exercises actually correlate with improvement?

Avoid decorative charts.

---

# 93. The “Best Take” Concept

Allow the user to mark sessions as:

- favorite
- breakthrough
- difficult
- weird
- story
- flow
- wordplay

This produces a qualitative archive.

A future “listen back” mode can make the app feel like a personal studio notebook.

---

# 94. Anti-Slop Design Rules

The application should never use UI copy like:

- “Unlock your limitless potential!”
- “Elevate your freestyle journey!”
- “Harness the power of AI!”
- “Become the best version of yourself!”

Use blunt, useful language.

Examples:

> Your transitions suck here.

> You stayed in pocket for 42 seconds.

> You repeated “like” 11 times.

> Try the same exercise at 100 BPM.

The interface should sound like an instrument, not a marketing site.

---

# 95. Content Voice

Use concise language.

Prefer:

> CHANGE FLOW

over:

> “Now let's explore an exciting new rhythmic challenge!”

Prefer:

> KEEP GOING

over:

> “Don't give up—you've got this!”

Prefer:

> 90 SECONDS. NO STOP.

over:

> “Challenge yourself to sustain continuous creative expression!”

---

# 96. Minimum Useful Exercise Set

V1 does not need 500 exercises.

It needs ~30 excellent exercises.

Suggested initial set:

### Rhyme
1. five rhymes
2. ten rhymes
3. multis
4. rhyme chain
5. internal rhyme

### Flow
6. straight pocket
7. double-time
8. triplets
9. sparse/dense
10. four-bar switch

### Observation
11. five objects
12. colors
13. motion
14. sounds
15. connect five observations

### Story
16. character/location/object
17. problem/escalation
18. flashback
19. callback ending
20. emotional reversal

### Wordplay
21. metaphor
22. double meaning
23. homophone
24. literal/figurative flip
25. setup/payoff

### Recovery
26. no-stop
27. interruption
28. forced topic switch
29. forced rhyme recovery
30. boss round

Thirty great drills beat three hundred mediocre prompts.

---

# 97. Exercise Composition

Exercises should be composable.

Example:

```ts
compose(
  exercise('rhyme-family'),
  constraint('topic-switch', { bars: 4 }),
  constraint('flow-change', { bars: 4 }),
  constraint('no-stop')
)
```

This should eventually allow the workout generator to produce novel compound exercises without hand-authoring each combination.

The combinator must enforce compatibility and difficulty ceilings.

---

# 98. Constraint Algebra

A later version may model constraints as composable operators:

```text
RHYME(FIRE)
FLOW(TRIPLET)
TOPIC_SWITCH(2_BARS)
NO_STOP
STORY(CALLBACK)
```

Then a workout becomes a small declarative program:

```text
PERFORM(
  RHYME(FIRE)
  + TOPIC_SWITCH(2_BARS)
  + FLOW_CHANGE(4_BARS)
  + NO_STOP
)
```

This is a promising long-term direction because it makes the training engine expressive rather than a giant if/else tree.

---

# 99. Potential Domain Language

Do not implement a DSL in V1.

But keep the internal model capable of expressing one.

Potential future syntax:

```text
rhyme FIRE
for 4 bars
switch topic
change flow
never stop
callback FIRE
```

This could eventually become a user-facing way to author drills.

---

# 100. Why the Core Should Remain Declarative

The more exercises are described as data and constraints, the less the product depends on custom code.

That gives agents a safer implementation surface.

An agent can add:

```json
{
  "id": "multis-under-pressure",
  "skills": ["multisyllabic_rhyme", "recovery"],
  "constraints": [...]
}
```

without rewriting the training engine.

This is one of the most important anti-drift measures in the project.

---

# 101. Initial `CLAUDE.md` Intent

The eventual `CLAUDE.md` should state:

```md
# FREESTYLE ENGINE — AGENT RULES

Read DESIGN.md and ROADMAP.md before making architectural changes.

This is an instrument, not a SaaS dashboard.

Use TypeScript + Vite + vanilla DOM/CSS unless an ADR explicitly changes that decision.

Keep domain logic independent of UI and browser APIs.

Do not introduce React, a backend, accounts, cloud storage, or mandatory AI without an ADR.

Do not replace deterministic measurements with opaque AI judgments.

Local-first is a product invariant.

Mobile interaction is a first-class requirement.

Every important metric must have an operational definition.

Every architecture change must be documented in DECISIONS.md.

Run typecheck + tests + production build before declaring work complete.
```

---

# 102. Initial `AGENTS.md` Intent

The agent-facing project rules should be even shorter and operational.

```md
# Agent Rules

1. Read DESIGN.md before architectural edits.
2. Read ROADMAP.md before selecting scope.
3. Keep core domain logic pure.
4. Do not introduce React without an ADR.
5. Do not introduce backend services without an ADR.
6. Do not make AI mandatory.
7. Test behavior, not just types.
8. Preserve mobile-first operation.
9. Preserve local-first storage.
10. Update DECISIONS.md when a boundary changes.
```

---

# 103. Initial `DECISIONS.md`

Record the initial architectural decisions immediately:

```text
ADR-001  TypeScript + Vite
ADR-002  Vanilla DOM/CSS
ADR-003  Local-first storage
ADR-004  Datamuse adapter
ADR-005  SpeechRecognition optional
ADR-006  AI optional
ADR-007  Domain/UI separation
ADR-008  Event-oriented session model
ADR-009  Static GitHub Pages deployment
ADR-010  Rust/WASM deferred until measured need
```

---

# 104. Milestone Sequencing for Agent Work

Do not ask an agent to “build the whole app.”

Use narrow slices:

```text
1. shell
2. recorder
3. session storage
4. beat playback
5. prompt system
6. review screen
7. Datamuse
8. transcript
9. analysis
10. skill model
11. adaptive workout
12. flow lab
13. story lab
14. gauntlet
15. optional AI
```

Each slice should be independently verifiable.

---

# 105. Recommended First Repository Commit

The first commit should contain only:

```text
package.json
tsconfig.json
vite.config.ts
index.html
src/main.ts
src/app.ts
src/model/
AGENTS.md
CLAUDE.md
DECISIONS.md
DESIGN.md
ROADMAP.md
README.md
.github/workflows/deploy.yml
```

Then add capabilities incrementally.

---

# 106. Recommended First Technical Sprint

Implement:

```text
BOOT
  -> Today screen
  -> Start button
  -> AudioContext unlock
  -> microphone permission
  -> recording
  -> timer
  -> stop
  -> save session
  -> playback
```

Nothing else.

The goal is to get something you can actually use within the shortest path.

---

# 107. Recommended Second Sprint

Implement:

```text
PROMPT ENGINE
  -> prompt pool
  -> prompt timing
  -> exercise definition
  -> seeded generation
  -> simple workouts
```

Now the app becomes a trainer rather than a recorder.

---

# 108. Recommended Third Sprint

Implement:

```text
DATAMUSE
  -> rhyme search
  -> cache
  -> rhyme lab
  -> rhyme exercises
```

Now the app begins to have a distinctive identity.

---

# 109. Recommended Fourth Sprint

Implement:

```text
TRANSCRIPT
  -> SpeechRecognition adapter
  -> transcript storage
  -> review view
  -> simple analysis
```

Now the instrument can observe itself.

---

# 110. Recommended Fifth Sprint

Implement:

```text
SKILL MODEL
  -> evidence
  -> weakness detection
  -> adaptive daily workout
```

This is the point where the product becomes meaningfully novel.

---

# 111. The Core “Moat”

The differentiator is not:

- having a microphone
- having rhyme lookup
- having AI
- having beats
- having a timer

The differentiator is:

> **The application accumulates evidence about one improviser and changes what it asks that improviser to do next.**

Everything else supports that loop.

---

# 112. Future Research Directions

Potential advanced areas:

- phoneme-level rhyme scoring
- learned speech-rate normalization
- beat-relative syllable alignment
- pitch contour extraction
- stress-pattern analysis
- semantic graph traversal
- automatic story-arc detection
- personalized prompt generation
- exercise efficacy estimation
- spaced-repetition optimization
- adaptive difficulty models
- local small language models
- local audio-language models

None should enter the core architecture until justified by evidence.

---

# 113. Future Local AI

Given the user's existing interest in local inference, a later version could optionally use a locally hosted model for qualitative analysis.

The architecture should make this easy without making it necessary:

```text
Browser
  |
  +-- deterministic engine
  |
  +-- optional local coach endpoint
  |
  +-- optional hosted coach endpoint
```

The local service should be treated as an external coach provider, not as the source of truth.

---

# 114. Potential Audio Intelligence Roadmap

Later:

```text
V1
recording + playback

V2
level + silence

V3
speech segmentation

V4
pitch contour

V5
syllable/onset estimation

V6
beat alignment

V7
cadence characterization

V8
flow comparison
```

Each stage should be measured before proceeding to the next.

---

# 115. Potential Linguistic Intelligence Roadmap

```text
V1
word-based rhyme lookup

V2
cached phonetic relationships

V3
phoneme representation

V4
stress-aware rhyme

V5
internal rhyme detection

V6
multi-syllable matching

V7
semantic transition analysis

V8
personal rhyme fingerprints
```

---

# 116. Personal Rhyme Fingerprint

A future feature could track the user's habitual rhyme behavior.

For example:

```text
OVERUSED
- night
- right
- time
- mind

STRONG
- multis ending in -ation
- internal vowel echoes

UNDERUSED
- slant rhyme
- consonant rhyme
```

The app can deliberately steer practice toward underused phonetic material.

This is potentially much more useful than generic “expand your vocabulary” advice.

---

# 117. Personal Flow Fingerprint

Likewise:

```text
STRONG
- triplets
- short punchy phrases

WEAK
- long narrative phrasing
- cadence transitions

HABIT
- returns to same pocket after 8 bars
```

The curriculum can then challenge the habit directly.

---

# 118. Personal Story Fingerprint

Possible later observations:

```text
STRONG
- vivid objects
- first-person narration

WEAK
- escalation
- endings

HABIT
- abstract emotional explanation

TARGET
- concrete sensory detail
```

Again, this should be framed as evidence and hypothesis rather than psychological diagnosis.

---

# 119. Coach Language Rules

When the system identifies a weakness, the language should be specific.

Bad:

> “Your storytelling could use more development.”

Good:

> “You establish characters well but often abandon the original setting after 8–12 bars. Today's story drills will force setting callbacks.”

---

# 120. Audio-First Mode

The user should be able to start a session and then ignore the screen.

Ideal sequence:

```text
PRESS START
  |
  v
PHONE LOCKS / SCREEN DIMMABLE
  |
  v
VOICE PROMPTS
  |
  v
BEAT CONTINUES
  |
  v
SESSION ENDS
  |
  v
OPEN REVIEW
```

This may eventually require platform-specific constraints, but the product should be designed toward it.

---

# 121. Practice Anywhere

The application should support three physical contexts:

### Studio

Headphones, mic, beat.

### Walking

Phone microphone, minimal screen use.

### Cypher

Friends provide prompts; app records and analyzes optionally.

That breadth matters because freestyle skill is contextual.

---

# 122. User-Generated Exercises

Allow the user to create a drill:

```text
NAME
ONE-BAR TELEPORT

RULES
new topic every bar
maintain same rhyme family
never stop

TARGET
flow + topic transition + recovery
```

The app should immediately incorporate that exercise into the training pool if the user wants it.

---

# 123. Exercise Versioning

Exercises should have versions.

```text
flow-switch.v1
flow-switch.v2
```

Changing a success criterion should not silently rewrite history.

---

# 124. Training Ledger

A later Review section could show:

```text
TRAINING LEDGER

AUG 25
Flow transitions
31 min

AUG 26
Rhyme retrieval
24 min

AUG 27
Story transfer
37 min

AUG 28
No-stop
18 min
```

The purpose is reflection, not gamification.

---

# 125. Best-Performance Archive

Allow a favorite recording to be tagged with:

```text
WHY IT MATTERS

“first time I stayed coherent while switching every 2 bars”
```

That creates a real personal progression archive.

---

# 126. Data Integrity

Important rules:

- never overwrite recordings without an explicit action
- never delete history because an analysis schema changed
- preserve original transcript where possible
- preserve raw observations
- derived metrics can be recomputed

Raw evidence should be more durable than derived interpretation.

This mirrors good scientific/data architecture.

---

# 127. Recomputable Analysis

Store enough raw information to re-run improved algorithms later.

For sessions with recordings, retain the original audio unless the user deletes it.

For transcripts, retain original transcript plus normalized form where practical.

Do not store only:

> rhymeScore=0.71

Store the evidence that allowed the score to be computed.

---

# 128. Analysis Provenance

Every derived measurement should identify its source/version.

```ts
interface DerivedMetric {
  name: string;
  value: number;
  confidence: number;
  algorithm: string;
  algorithmVersion: string;
  sourceIds: string[];
}
```

This will make future improvements much safer.

---

# 129. “Receipts” View

For suspicious or useful metrics, allow the user to inspect the basis.

Example:

```text
LONGEST PAUSE: 1.72s

RECEIPT

02:14.820 -> 02:16.540
No final transcript tokens detected.
Audio RMS below threshold.
```

This aligns strongly with the user's preference for correctness and proof-oriented tooling.

---

# 130. Development Quality Bar

The app should eventually meet a quality bar similar in spirit to the stronger Ampactor projects:

- explicit domain boundaries
- deterministic logic where possible
- measured behavior
- reproducible bugs
- real browser verification
- production CI
- documented tradeoffs
- no hand-wavey claims

Noodles is a good precedent for keeping the implementation lean; Sonido and BITS are good precedents for putting serious verification behind media behavior. [Noodles](https://github.com/ampactor-labs/noodles) [Sonido](https://github.com/ampactor-labs/sonido) [BITS](https://github.com/ampactor-labs/bits)

---

# 131. What the App Must Feel Like

When the user opens it:

> I want to rap.

Within seconds:

> Here is what you're training today.

During practice:

> The app gets out of my way.

After practice:

> It noticed something useful.

After 20 sessions:

> It knows me.

After 100 sessions:

> It has become a serious training laboratory.

That is the product target.

---

# 132. Final Architecture

```text
                         FREESTYLE ENGINE
                                |
               +----------------+----------------+
               |                                 |
         INSTRUMENT LAYER                   TRAINING LAYER
               |                                 |
      +--------+--------+               +--------+--------+
      |        |        |               |        |        |
    AUDIO    SPEECH   INPUT         SKILLS   EVIDENCE  ENGINE
      |        |        |               |        |        |
      +--------+--------+               +--------+--------+
               |                                 |
               +----------------+----------------+
                                |
                           SESSION MODEL
                                |
                         LOCAL-FIRST STORAGE
                                |
               +----------------+----------------+
               |                                 |
            DATAMUSE                         OPTIONAL AI
               |                                 |
               +----------------+----------------+
                                |
                            DAILY WORKOUT
                                |
                               USER
```

---

# 133. Final Technology Stack

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Build | Vite |
| UI | Vanilla DOM/CSS |
| Audio | Web Audio API |
| Optional audio helper | Tone.js |
| Recording | MediaRecorder |
| Speech | Web Speech API adapter |
| Persistence | IndexedDB |
| Large local assets | OPFS where useful |
| Rhyme/language API | Datamuse |
| Tests | Vitest |
| Browser E2E | Playwright or Puppeteer |
| CI | GitHub Actions |
| Hosting | GitHub Pages |
| Optional AI | Provider adapter, never mandatory |
| Future performance escape hatch | Rust/WASM |

---

# 134. Final Recommendation

Build this in **TypeScript**.

Use the **Noodles architectural instinct**—Vite, vanilla DOM/CSS, small explicit layers, phone-first interaction—as the starting point. Noodles already demonstrates that this style can produce a serious browser instrument without a framework-heavy frontend. [Noodles](https://github.com/ampactor-labs/noodles)

Borrow **Sonido's separation of domain computation from presentation**, especially the discipline around explicit kernels, measurement, and cross-target architecture. [Sonido](https://github.com/ampactor-labs/sonido)

Borrow **BITS's local-first media ownership, deterministic event/recipe thinking, and real browser E2E verification**. [BITS](https://github.com/ampactor-labs/bits)

Borrow **Mentl's insistence that the medium itself teaches and that claims should have receipts**. [Mentl](https://github.com/ampactor-labs/mentl)

Borrow **Stoop's willingness to define hard product refusals before implementation**. [Stoop](https://github.com/ampactor/stoop)

Do **not** start with React. Do **not** start with Rust/WASM. Do **not** start with an LLM.

Start with the smallest serious instrument:

> **record -> prompt -> perform -> review**

Then build the evidence system:

> **observe -> diagnose -> prescribe**

Then build the adaptive system:

> **prescribe -> challenge -> measure -> adapt**

That sequence gives us a project that an AI coding agent can build incrementally without turning it into a generic app, while leaving a clean path toward WASM/DSP and local AI when the evidence says those additions are worth their complexity.

---

# 135. Immediate Implementation Order

```text
[ ] Create repository
[ ] Add AGENTS.md
[ ] Add CLAUDE.md
[ ] Add DESIGN.md
[ ] Add ROADMAP.md
[ ] Add DECISIONS.md
[ ] Scaffold Vite + TypeScript
[ ] Add production GitHub Pages deployment
[ ] Add audio capability detection
[ ] Add microphone recorder
[ ] Add local session model
[ ] Add IndexedDB persistence
[ ] Add beat player / metronome
[ ] Add prompt engine
[ ] Build Today view
[ ] Build Free view
[ ] Build Review view
[ ] Add Datamuse adapter
[ ] Add rhyme lab
[ ] Add local Datamuse cache
[ ] Add speech-recognition adapter
[ ] Add transcript storage
[ ] Add initial session metrics
[ ] Add skill model
[ ] Add weakness detector
[ ] Add adaptive workout generator
[ ] Add Flow Lab
[ ] Add Observation Lab
[ ] Add Story Lab
[ ] Add Wordplay Lab
[ ] Add Gauntlet
[ ] Add export/import
[ ] Add robust E2E suite
[ ] Add optional AI coach
[ ] Profile audio/analysis performance
[ ] Revisit Rust/WASM only if measured need exists
```

---

# 136. Product North Star

The ultimate measure is not:

- number of features
- number of prompts
- number of users
- AI sophistication
- streak length
- dashboard complexity

It is:

> **Does this system make a serious improviser measurably better at creating coherent, rhythmic, vivid, surprising language in real time?**

Everything in this repository should serve that question.


---

# 21. V1.0 Implementation Status

The current repository implements the core static-app architecture described above with no AI dependency: adaptive workout generation, deterministic transcript analysis, phonetic/rhyme heuristics, skill/failure-mode progression, self-assessment calibration, local recordings, IndexedDB persistence, export/import of session state, Web Audio beat generation, Web Speech transcription where available, Datamuse language lookup, specialized training labs, a gauntlet, review receipts, and a GitHub Pages deployment workflow.

The remaining limitations are intentionally browser-native: speech recognition support varies by browser, transcript-based rhyme analysis is approximate, and exported JSON does not embed binary recordings. These are explicit product boundaries rather than hidden dependencies.


## Implementation status — 2.0.0 Complete

The complete build now implements the eight final completion milestones: audio measurement, deterministic phonology/rhyme analysis, calibration, dependency-aware adaptive curriculum, beat/timing analysis, longitudinal review/visualization, and performance-mode polish. AI/LLM integration is intentionally excluded from the product architecture.
