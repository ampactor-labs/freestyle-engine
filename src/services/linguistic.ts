import { tokenize, type PhonemeMap } from '../core/phonology';

export interface LinguisticWord { word:string; score?:number; numSyllables?:number; tags?:string[]; defs?:string[] }
export interface WordEnrichment { word:string; phonemes?:string[]; ipa?:string; syllables?:number; definition?:string; audio?:string; source:string }

const DATAMUSE='https://api.datamuse.com/words';
const DICTIONARY='https://api.dictionaryapi.dev/api/v2/entries/en/';
const CACHE_KEY='freestyle-engine-api-cache-v1';
const cache:Record<string,unknown>=(()=>{try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch{return{}}})();
const saveCache=()=>{try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache));}catch{}};
const getCached=<T>(key:string)=>{const v=cache[key] as {at:number;value:T}|undefined;return v&&Date.now()-v.at<1000*60*60*24*30?v.value:undefined};
const setCached=(key:string,value:unknown)=>{cache[key]={at:Date.now(),value};saveCache()};

function datamuseKey(){try{return localStorage.getItem('freestyle-engine-datamuse-key')||''}catch{return ''}}
async function datamuse(params:Record<string,string|number>):Promise<LinguisticWord[]>{
  const u=new URL(DATAMUSE);for(const[k,v]of Object.entries(params))u.searchParams.set(k,String(v));const key=datamuseKey();if(key)u.searchParams.set('token',key);
  const cacheKey=`dm:${u.toString()}`;const hit=getCached<LinguisticWord[]>(cacheKey);if(hit)return hit;
  const r=await fetch(u);if(!r.ok)throw new Error(`Datamuse ${r.status}`);const data=await r.json() as LinguisticWord[];setCached(cacheKey,data);return data;
}

export async function searchDatamuse(word:string,mode:'rhyme'|'near'|'semantic'|'sound'|'synonym'='rhyme',limit=30){
  const params:Record<string,string|number>={max:limit};
  if(mode==='rhyme')params.rel_rhy=word;else if(mode==='near')params.rel_nry=word;else if(mode==='semantic')params.ml=word;else if(mode==='sound')params.sl=word;else params.rel_syn=word;
  return datamuse(params);
}
export async function enrichWord(word:string):Promise<WordEnrichment>{
  const normalized=word.toLowerCase().trim();
  const cached=getCached<WordEnrichment>(`enrich:${normalized}`);if(cached)return cached;
  try{
    const rows=await datamuse({sp:normalized,qe:'sp',md:'rpsd',max:8});
    const exact=rows.find(x=>x.word.toLowerCase()===normalized)||rows[0];
    const pron=exact?.tags?.find(t=>t.startsWith('pron:'))?.slice(5);
    const syllables=exact?.numSyllables;
    if(pron){const out={word:normalized,phonemes:pron.split(/\s+/),syllables,definition:exact?.defs?.[0]?.split('\t').pop(),source:'Datamuse'};setCached(`enrich:${normalized}`,out);return out;}
  }catch{}
  try{
    const r=await fetch(`${DICTIONARY}${encodeURIComponent(normalized)}`);if(r.ok){const rows=await r.json() as Array<{phonetic?:string;phonetics?:Array<{text?:string;audio?:string}>;meanings?:Array<{definitions?:Array<{definition?:string}>}>}>;const first=rows[0];const phonetic=first?.phonetic||first?.phonetics?.find(x=>x.text)?.text;const audio=first?.phonetics?.find(x=>x.audio)?.audio;const definition=first?.meanings?.flatMap(m=>m.definitions??[]).find(d=>d.definition)?.definition;const out={word:normalized,ipa:phonetic,audio,definition,source:'Free Dictionary API'};setCached(`enrich:${normalized}`,out);return out;}
  }catch{}
  return {word:normalized,source:'unavailable'};
}

export async function resolvePhonemeMap(words:string[],onProgress?:(done:number,total:number)=>void):Promise<{map:PhonemeMap;sourceCounts:Record<string,number>}>{
  const unique=[...new Set(tokenize(words.join(' ')))].filter(w=>w.length>1);const map:PhonemeMap=new Map();const sourceCounts:Record<string,number>={};
  let done=0;
  const concurrency=5;let index=0;
  const worker=async()=>{while(true){const i=index++;if(i>=unique.length)break;const w=unique[i];const x=await enrichWord(w);if(x.phonemes?.length){map.set(w,x.phonemes);sourceCounts[x.source]=(sourceCounts[x.source]??0)+1;}done++;onProgress?.(done,unique.length);}};
  await Promise.all(Array.from({length:Math.min(concurrency,unique.length)},()=>worker()));
  return {map,sourceCounts};
}

export function clearLinguisticCache(){try{localStorage.removeItem(CACHE_KEY);}catch{}}
export function setDatamuseApiKey(key:string){try{if(key)localStorage.setItem('freestyle-engine-datamuse-key',key);else localStorage.removeItem('freestyle-engine-datamuse-key');}catch{}}
export function hasDatamuseApiKey(){return !!datamuseKey();}
export function getDatamuseApiKey(){return datamuseKey();}
export const apiStatus=()=>({datamuseKey:hasDatamuseApiKey(),datamuse:!!globalThis.fetch,dictionaryApi:!!globalThis.fetch,cacheEntries:Object.keys(cache).length});
