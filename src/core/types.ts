export type SkillId =
  | 'pocket' | 'flow_variation' | 'rhythm' | 'rhyme_retrieval' | 'internal_rhyme'
  | 'multisyllabic_rhyme' | 'vocabulary' | 'association' | 'imagery' | 'metaphor'
  | 'wordplay' | 'punchlines' | 'observation' | 'storytelling' | 'topic_transition'
  | 'recovery' | 'breath' | 'articulation' | 'pitch' | 'vocal_dynamics' | 'coherence';

export type ExerciseCategory = 'warmup'|'rhyme'|'flow'|'transition'|'observation'|'story'|'wordplay'|'voice'|'recovery'|'open'|'gauntlet'|'calibration';
export type SessionMode = 'free'|'today'|'train'|'calibrate'|'rhyme'|'flow'|'story'|'observation'|'wordplay'|'gauntlet'|'progress'|'review';
export type Trend = 'up'|'flat'|'down';
export type EvidenceKind = 'objective'|'self_report'|'constraint'|'transfer'|'streak';

export interface SkillState {
  skill: SkillId;
  confidence: number;
  evidenceCount: number;
  recentTrend: Trend;
  lastPracticedAt: number | null;
  strengths: string[];
  weaknesses: string[];
  recentScores: number[];
  lastScore: number | null;
}

export interface Constraint { kind: string; value?: string | number; }

export interface ExerciseDefinition {
  id: string;
  title: string;
  category: ExerciseCategory;
  description: string;
  skills: { skill: SkillId; weight: number }[];
  durationSeconds: number;
  difficulty: number;
  constraints: Constraint[];
  promptStrategy: 'word'|'topic'|'scene'|'story'|'none'|'random';
  successCriteria: string[];
  setup?: string[];
  transferSkills?: SkillId[];
  tags?: string[];
  calibration?: boolean;
}

export interface WorkoutBlock extends ExerciseDefinition { rationale: string; targetScore?: number; }
export interface Workout {
  id: string;
  seed: string;
  title: string;
  focusSkill: SkillId;
  weakness: string;
  diagnosis: string;
  durationSeconds: number;
  blocks: WorkoutBlock[];
  level: number;
  loadScore?: number;
  transferTarget?: SkillId;
}

export interface PromptEvent { at: number; text: string; type: string; index?: number; }
export interface SessionEvent { type: string; at: number; payload?: Record<string, unknown>; }
export interface Observation {
  id: string; timestamp: number; kind: string; value: number|string; confidence: number;
  source: 'audio'|'transcript'|'exercise'|'self_report';
}
export interface TranscriptWord { word: string; start?: number; end?: number; confidence?: number; }
export interface Transcript { text: string; words: TranscriptWord[]; provider: 'web-speech'|'none'; capturedAt: number; }
export interface RecordingReference { sessionId: string; mimeType: string; durationSeconds: number; bytes: number; }

export interface AudioAnalysis {
  durationSeconds: number;
  sampleRate: number;
  rmsMean: number;
  rmsP95: number;
  dynamicRangeDb: number;
  silenceRate: number;
  silenceSegments: number;
  maxSilenceSeconds: number;
  onsetCount: number;
  onsetRate: number;
  voicedRate: number;
  pitchMedianHz: number | null;
  pitchRangeSemitones: number | null;
  clipRate: number;
  beatAlignment: number | null;
  timingMeanMs: number | null;
  timingStdMs: number | null;
  phraseCount: number;
  phraseLengthSeconds: number | null;
  confidence: number;
}

export interface PhoneticLink {
  from: string;
  to: string;
  score: number;
  kind: 'perfect'|'near'|'assonance'|'consonance'|'multi';
  distance: number;
}
export interface PhoneticAnalysis {
  wordCount: number;
  rhymeLinks: number;
  endRhymeRate: number;
  internalRhymeRate: number;
  multisyllabicRate: number;
  assonanceRate: number;
  consonanceRate: number;
  rhymeChainScore: number;
  maxChain: number;
  uniqueRhymeTargets: number;
  strongestChains: string[][];
  method: 'local-graphemic-phonology'|'external-phonology-with-local-fallback';
  phonemeCoverage: number;
}

export interface MetricReceipt {
  key: string;
  label: string;
  value: number;
  unit?: string;
  evidence: string;
  confidence: number;
}

export interface FailureMode {
  id: string;
  label: string;
  description: string;
  severity: number;
  evidenceCount: number;
  lastSeenAt: number | null;
  relatedSkills: SkillId[];
}

export interface PromptMetric { prompt: string; hits: boolean; confidence: number; }
export interface SessionAnalysis {
  durationSeconds: number;
  wordCount: number;
  speechRateWpm: number | null;
  fillerCount: number;
  fillerRate: number;
  uniqueWordRatio: number;
  repeatedWords: { word: string; count: number }[];
  longPauses: number;
  maxPauseSeconds: number;
  pauseRate: number;
  rhymeDensity: number;
  endRhymeRate: number;
  internalRhymeRate: number;
  approximateMultiRate: number;
  vocabularyRichness: number;
  promptHits: number;
  promptHitRate: number;
  promptMetrics: PromptMetric[];
  averageConfidence: number | null;
  syllableEstimate: number;
  estimatedBars: number;
  wordsPerBar: number | null;
  metrics: MetricReceipt[];
  inferredSkillScores: Partial<Record<SkillId, number>>;
  failureModes: FailureMode[];
  notes: string[];
  phonetic?: PhoneticAnalysis;
  audio?: AudioAnalysis;
  constraintAdherence?: number;
  transferReadiness?: number;
}

export interface SelfAssessment {
  energy: number;
  coherence: number;
  pocket: number;
  novelty: number;
  difficulty?: number;
  transfer?: number;
  note: string;
}

export interface ExerciseResult {
  exerciseId: string;
  score: number;
  objectiveScore: number;
  selfScore: number;
  transferScore: number;
  completion: number;
  notes: string[];
  skillScores: Partial<Record<SkillId, number>>;
  difficultyScore?: number;
  receipts?: string[];
}

export interface CalibrationState {
  completed: boolean;
  startedAt: number | null;
  completedAt: number | null;
  batteryIndex: number;
  baselineScores: Partial<Record<SkillId, number>>;
  transferBaseline: Partial<Record<SkillId, number>>;
}

export interface TrainingLoadState {
  rolling7Day: number;
  rolling28Day: number;
  last7Days: { date: string; load: number }[];
  currentBlock: number;
  recommendedLoad: number;
  deloadRecommended: boolean;
}

export interface Session {
  id: string; startedAt: number; endedAt?: number; mode: SessionMode; workoutId?: string; exerciseId?: string;
  seed: string; prompts: PromptEvent[]; events: SessionEvent[]; observations: Observation[];
  transcript?: Transcript; recording?: RecordingReference; selfAssessment?: SelfAssessment; analysis?: SessionAnalysis;
  result?: ExerciseResult; version: number;
}

export interface TrainingProfile {
  version: number;
  sessionsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string | null;
  totalPracticeSeconds: number;
  totalWords: number;
  totalRecordedSeconds: number;
  skills: Record<SkillId, SkillState>;
  failureModes: FailureMode[];
  masteredExercises: Record<string, number>;
  recentExerciseIds: string[];
  lastWorkoutSeed: string | null;
  calibration: CalibrationState;
  transferScores: Partial<Record<SkillId, number[]>>;
  trainingLoad: TrainingLoadState;
}

export const ALL_SKILLS: SkillId[] = [
  'pocket','flow_variation','rhythm','rhyme_retrieval','internal_rhyme','multisyllabic_rhyme',
  'vocabulary','association','imagery','metaphor','wordplay','punchlines','observation','storytelling',
  'topic_transition','recovery','breath','articulation','pitch','vocal_dynamics','coherence'
];

export const SKILL_LABELS: Record<SkillId,string> = {
  pocket:'Pocket', flow_variation:'Flow variation', rhythm:'Rhythm', rhyme_retrieval:'Rhyme retrieval',
  internal_rhyme:'Internal rhyme', multisyllabic_rhyme:'Multisyllabic rhyme', vocabulary:'Vocabulary',
  association:'Association', imagery:'Imagery', metaphor:'Metaphor', wordplay:'Wordplay', punchlines:'Punchlines',
  observation:'Observation', storytelling:'Storytelling', topic_transition:'Topic transitions', recovery:'Recovery',
  breath:'Breath', articulation:'Articulation', pitch:'Pitch', vocal_dynamics:'Vocal dynamics', coherence:'Coherence'
};

export const skillLabel = (skill:SkillId) => SKILL_LABELS[skill];
