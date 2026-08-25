import { describe, expect, it } from 'vitest';
import { analyzeTranscript } from './src/core/analysis';
import { generateWorkout } from './src/core/generator';
import { defaultProfile, updateProfileFromSession } from './src/core/profile';
import type { Transcript } from './src/core/types';

const tx=(text:string):Transcript=>({text,words:text.split(/\s+/).map(word=>({word})),provider:'none',capturedAt:Date.now()});

describe('FREESTYLE ENGINE training core',()=>{
  it('extracts deterministic transcript evidence',()=>{
    const a=analyzeTranscript(tx('light night bright fight mirror river river river river'),30,0,[]);
    expect(a.wordCount).toBe(9);
    expect(a.rhymeDensity).toBeGreaterThan(0);
    expect(a.repeatedWords[0]?.word).toBe('river');
  });
  it('adapts profile from real skill evidence',()=>{
    const p=defaultProfile();
    const next=updateProfileFromSession(p,{skillScores:{rhyme_retrieval:.9},durationSeconds:60,wordCount:20,recordedSeconds:60,exerciseId:'rhyme-burst'});
    expect(next.sessionsCompleted).toBe(1);
    expect(next.skills.rhyme_retrieval.confidence).toBeGreaterThan(p.skills.rhyme_retrieval.confidence);
  });
  it('produces a workout targeted to the weakest skill',()=>{
    const p=defaultProfile();
    p.skills.storytelling.confidence=.7;
    p.skills.recovery.confidence=.05;
    const w=generateWorkout(p,'stable-test');
    expect(w.focusSkill).toBe('recovery');
    expect(w.blocks.length).toBe(6);
    expect(w.durationSeconds).toBeGreaterThan(0);
  });
});
