import type { ExerciseDefinition, ExerciseResult, SessionAnalysis, SelfAssessment, SkillId } from './types';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
function categoryObjective(ex:ExerciseDefinition,a:SessionAnalysis){
  const phon=a.phonetic;const audio=a.audio;
  const rhyme=phon?.rhymeChainScore??a.rhymeDensity;const multi=phon?.multisyllabicRate??a.approximateMultiRate;const internal=phon?.internalRhymeRate??a.internalRhymeRate;
  if(ex.category==='rhyme')return clamp(rhyme*.42+internal*.28+multi*.3);
  if(ex.category==='flow')return clamp((audio?.beatAlignment??.5)*.45+(a.inferredSkillScores.pocket??.4)*.3+(a.inferredSkillScores.flow_variation??.4)*.25);
  if(ex.category==='transition')return clamp(a.promptHitRate*.26+(a.constraintAdherence??a.promptHitRate)*.24+(a.audio?1-a.audio.silenceRate:a.inferredSkillScores.recovery??.5)*.18+(a.inferredSkillScores.recovery??.4)*.32);
  if(ex.category==='observation')return clamp((a.inferredSkillScores.observation??.4)*.45+a.uniqueWordRatio*.2+a.promptHitRate*.15+(a.inferredSkillScores.association??.4)*.2);
  if(ex.category==='story')return clamp(a.promptHitRate*.25+a.uniqueWordRatio*.2+(a.inferredSkillScores.coherence??.4)*.3+(a.inferredSkillScores.storytelling??.4)*.25);
  if(ex.category==='wordplay')return clamp(rhyme*.12+internal*.16+a.uniqueWordRatio*.2+(a.inferredSkillScores.wordplay??.4)*.3+(a.inferredSkillScores.punchlines??.4)*.22);
  if(ex.category==='voice'||ex.category==='warmup')return clamp((a.audio?.dynamicRangeDb??0)/24*.22+(a.audio?.pitchRangeSemitones??0)/18*.2+(a.audio?.voicedRate??.5)*.18+(a.inferredSkillScores.articulation??.4)*.2+(a.inferredSkillScores.vocal_dynamics??.4)*.2);
  if(ex.category==='recovery'||ex.category==='gauntlet')return clamp((1-a.fillerRate)*.2+(1-Math.min(1,a.audio?.silenceRate??a.fillerRate))*.15+(a.inferredSkillScores.recovery??.4)*.4+(a.promptHitRate*.1)+(a.inferredSkillScores.coherence??.4)*.15);
  return clamp((a.inferredSkillScores.coherence??.4)*.2+(a.inferredSkillScores.pocket??.4)*.2+(a.uniqueWordRatio*.2)+rhyme*.2+(a.promptHitRate*.2));
}
export function evaluateExercise(ex:ExerciseDefinition,a:SessionAnalysis,self:SelfAssessment,transferTarget?:SkillId):ExerciseResult{
  const objective=categoryObjective(ex,a);const selfScore=(self.energy+self.coherence+self.pocket+self.novelty)/4;const transferSignals=[a.transferReadiness??.5,a.promptHitRate,a.inferredSkillScores.coherence??.4,a.inferredSkillScores.recovery??.4];const transfer=clamp(transferSignals.reduce((x,y)=>x+y,0)/transferSignals.length);const completion=clamp(Math.min(1,a.durationSeconds/Math.max(ex.durationSeconds,1)));const difficultyScore=clamp((self.difficulty??ex.difficulty/10)+objective*.25);const score=clamp(objective*.5+selfScore*.15+transfer*.2+completion*.05+difficultyScore*.1);
  const skillScores:Partial<Record<SkillId,number>>={};for(const s of ex.skills){const evidence=a.inferredSkillScores[s.skill]??objective;skillScores[s.skill]=clamp(evidence*.62+score*.23+(a.constraintAdherence??.5)*.15);}
  const notes:string[]=[];if(a.audio?.beatAlignment!==null&&a.audio?.beatAlignment!==undefined)notes.push(`Beat alignment estimate: ${Math.round(a.audio.beatAlignment*100)}%.`);if(a.phonetic?.maxChain&&a.phonetic.maxChain>=4)notes.push(`Longest phonetic chain: ${a.phonetic.maxChain} words.`);if(a.audio?.maxSilenceSeconds&&a.audio.maxSilenceSeconds>1.8)notes.push(`Longest silence: ${a.audio.maxSilenceSeconds.toFixed(1)}s.`);if(transfer<.55)notes.push('Transfer is lagging behind drill performance; the next session should vary context.');if(transferTarget)notes.push(`Transfer target: ${transferTarget}.`);
  const receipts=a.metrics.map(m=>`${m.label}: ${Math.round(m.value*100)} (${m.evidence})`);
  return{exerciseId:ex.id,score,objectiveScore:objective,selfScore,transferScore:transfer,completion,notes,skillScores,difficultyScore,receipts};
}
