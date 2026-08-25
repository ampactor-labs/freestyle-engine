import type { SkillId, TrainingProfile } from './types';
import { ALL_SKILLS, skillLabel } from './types';

const prereq:Partial<Record<SkillId,SkillId[]>>={
  internal_rhyme:['rhyme_retrieval'], multisyllabic_rhyme:['rhyme_retrieval','vocabulary'], wordplay:['association','vocabulary'], punchlines:['wordplay','coherence'],
  metaphor:['association','imagery'], storytelling:['coherence','association'], topic_transition:['recovery','coherence'], flow_variation:['pocket','rhythm'],
  vocal_dynamics:['pitch','articulation'], pocket:['rhythm'], recovery:['coherence'], observation:['imagery'], coherence:['vocabulary']
};
const neighbors=(skill:SkillId)=>prereq[skill]??[];
export function skillLeverage(profile:TrainingProfile,skill:SkillId){const state=profile.skills[skill];const deps=neighbors(skill);const depWeak=deps.reduce((n,d)=>n+(1-(profile.skills[d]?.confidence??.2)),0)/Math.max(1,deps.length);const recency=state.lastPracticedAt?Math.min(1,(Date.now()-state.lastPracticedAt)/604800000):1;const trend=state.recentTrend==='down'?.12:0;const uncertainty=state.evidenceCount<4?.16:0;return(1-state.confidence)*.52+depWeak*.16+recency*.14+trend+uncertainty;}
export function chooseFocus(profile:TrainingProfile):SkillId{return ALL_SKILLS.map(s=>[s,skillLeverage(profile,s)] as const).sort((a,b)=>b[1]-a[1])[0][0];}
export function dependencyDiagnosis(profile:TrainingProfile,target:SkillId){const deps=neighbors(target).filter(s=>(profile.skills[s]?.confidence??0)<.5);if(deps.length)return`${skillLabel(target)} is the visible bottleneck, but ${deps.map(skillLabel).join(', ')} ${deps.length===1?'is':'are'} underpowered. The prescription builds the prerequisite before increasing pressure.`;const fm=profile.failureModes.find(f=>f.relatedSkills.includes(target));if(fm)return`${fm.label} keeps appearing around ${skillLabel(target)}. The next block isolates the failure, then the transfer task removes the training wheels.`;return`${skillLabel(target)} has the highest current training leverage. Difficulty is sized to create challenge without destroying fluent performance.`;}
export function complexityBudget(profile:TrainingProfile){const load=profile.trainingLoad.rolling7Day;return load>900?4:load>600?6:load>350?8:10;}
export function transferCandidate(profile:TrainingProfile,target:SkillId){const candidates=ALL_SKILLS.filter(s=>s!==target);return candidates.sort((a,b)=>{const sa=(profile.skills[a]?.confidence??.2)+(prereq[a]?.includes(target)?-.2:0);const sb=(profile.skills[b]?.confidence??.2)+(prereq[b]?.includes(target)?-.2:0);return sa-sb;})[0]??'coherence';}
