import type { AudioAnalysis } from '../core/types';

type Frame = {t:number;rms:number;peak:number;centroid:number;pitch:number|null};
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const percentile=(xs:number[],p:number)=>{if(!xs.length)return 0;const s=[...xs].sort((a,b)=>a-b);return s[Math.min(s.length-1,Math.max(0,Math.floor((s.length-1)*p)))];};

function rms(buf:Float32Array,start:number,end:number){let s=0;for(let i=start;i<end;i++){const x=buf[i];s+=x*x;}return Math.sqrt(s/Math.max(1,end-start));}
function zeroCross(buf:Float32Array,start:number,end:number){let n=0;for(let i=start+1;i<end;i++)if((buf[i]>=0)!==(buf[i-1]>=0))n++;return n/Math.max(1,end-start);}
function autocorrPitch(buf:Float32Array,start:number,end:number,sampleRate:number){
  const len=Math.min(end-start,4096);const minLag=Math.floor(sampleRate/450),maxLag=Math.floor(sampleRate/70);let bestLag=-1,best=-Infinity;
  for(let lag=minLag;lag<=Math.min(maxLag,len-2);lag++){let sum=0,s1=0,s2=0;for(let i=0;i<len-lag;i++){const a=buf[start+i],b=buf[start+i+lag];sum+=a*b;s1+=a*a;s2+=b*b;}const c=sum/Math.sqrt(Math.max(1e-12,s1*s2));if(c>best){best=c;bestLag=lag;}}
  return best>.55&&bestLag>0?sampleRate/bestLag:null;
}
function frameAnalysis(data:Float32Array,sampleRate:number){
  const size=2048,hop=512,frames:Frame[]=[];let peak=0;
  for(let s=0;s+size<data.length;s+=hop){const r=rms(data,s,s+size);const pk=Math.max(...data.slice(s,s+size).map(x=>Math.abs(x)));peak=Math.max(peak,pk);const z=zeroCross(data,s,s+size);const pitch= r>.02 ? autocorrPitch(data,s,s+size,sampleRate):null;frames.push({t:s/sampleRate,rms:r,peak:pk,centroid:z,pitch});}
  return {frames,peak};
}
function quantileHzToSemitoneRange(pitches:number[]){if(pitches.length<4)return null;const lo=percentile(pitches,.1),hi=percentile(pitches,.9);return 12*Math.log2(Math.max(1,hi)/Math.max(1,lo));}

export async function analyzeAudioBlob(blob:Blob,bpm:number|null):Promise<AudioAnalysis|null>{
  if(!blob.size || typeof AudioContext==='undefined')return null;
  try{
    const ctx=new AudioContext(); const buffer=await ctx.decodeAudioData(await blob.arrayBuffer());
    const length=buffer.length; const mono=new Float32Array(length); for(let c=0;c<buffer.numberOfChannels;c++){const d=buffer.getChannelData(c);for(let i=0;i<length;i++)mono[i]+=d[i]/buffer.numberOfChannels;}
    const {frames,peak}=frameAnalysis(mono,buffer.sampleRate); const rmsValues=frames.map(f=>f.rms); const gate=Math.max(.015,percentile(rmsValues,.2)*.75);
    let silence=0,segments=0,maxSilence=0,currentSilence=0; let onsets=0; let prev=0; const onsetTimes:number[]=[]; const pitches:number[]=[];
    for(const f of frames){const dt=512/buffer.sampleRate;if(f.rms<gate){silence+=dt;currentSilence+=dt;}else if(currentSilence>0.35){segments++;maxSilence=Math.max(maxSilence,currentSilence);currentSilence=0;}else currentSilence=0;if(f.pitch)pitches.push(f.pitch);if(f.rms>gate*1.5&&f.rms-prev>Math.max(.01,gate*.5)){onsets++;onsetTimes.push(f.t);}prev=f.rms;}
    if(currentSilence>0.35){segments++;maxSilence=Math.max(maxSilence,currentSilence);}
    const voicedFrames=frames.filter(f=>f.pitch!==null).length; const dyn=20*Math.log10(Math.max(.0001,percentile(rmsValues,.95))/Math.max(.0001,percentile(rmsValues,.1))); const clip=mono.filter(x=>Math.abs(x)>.98).length/Math.max(length,1);
    const phraseStarts=[0,...frames.filter((f,i)=>i&&frames[i-1].rms<gate&&f.rms>=gate).map(f=>f.t)]; const phraseCount=Math.max(1,phraseStarts.length); const phraseLen=buffer.duration/phraseCount;
    let beatAlignment:number|null=null,timingMeanMs:number|null=null,timingStdMs:number|null=null;
    if(bpm&&onsetTimes.length>3){const interval=60/bpm;const residuals=onsetTimes.map(t=>{const mod=t%interval;return Math.min(mod,interval-mod)});const mean=residuals.reduce((a,b)=>a+b,0)/residuals.length;const variance=residuals.reduce((a,b)=>a+(b-mean)**2,0)/residuals.length;timingMeanMs=mean*1000;timingStdMs=Math.sqrt(variance)*1000;beatAlignment=clamp(1-(mean/(interval*.5)) );}
    const out:AudioAnalysis={durationSeconds:buffer.duration,sampleRate:buffer.sampleRate,rmsMean:rmsValues.reduce((a,b)=>a+b,0)/Math.max(1,rmsValues.length),rmsP95:percentile(rmsValues,.95),dynamicRangeDb:Math.max(0,dyn),silenceRate:clamp(silence/Math.max(buffer.duration,1)),silenceSegments:segments,maxSilenceSeconds:maxSilence,onsetCount:onsets,onsetRate:onsets/Math.max(buffer.duration,1),voicedRate:voicedFrames/Math.max(frames.length,1),pitchMedianHz:pitches.length?percentile(pitches,.5):null,pitchRangeSemitones:quantileHzToSemitoneRange(pitches),clipRate:clip,beatAlignment,timingMeanMs,timingStdMs,phraseCount,phraseLengthSeconds:phraseLen,confidence:.9};
    await ctx.close(); return out;
  }catch{return null;}
}

export function liveAudioScore(a:Partial<AudioAnalysis>|undefined){if(!a)return null;return{silence:1-(a.silenceRate??.5),dynamic:clamp((a.dynamicRangeDb??0)/24),timing:a.beatAlignment??.5,voice:a.voicedRate??.5};}
