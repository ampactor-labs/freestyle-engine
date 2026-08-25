import type { AudioAnalysis } from '../core/types';
export interface BeatAnalysisResult { bpm:number|null; onsetTimes:number[]; phaseOffsetMs:number|null; alignment:number|null; offGridRate:number|null; }
export function analyzeBeatAgainstAudio(audio:AudioAnalysis|null, bpm:number|null):BeatAnalysisResult{if(!audio||!bpm||audio.timingMeanMs===null)return{bpm:null,onsetTimes:[],phaseOffsetMs:null,alignment:null,offGridRate:null};return{bpm,onsetTimes:[],phaseOffsetMs:audio.timingMeanMs,alignment:audio.beatAlignment,offGridRate:audio.beatAlignment===null?null:1-audio.beatAlignment};}
