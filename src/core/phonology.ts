import type { PhoneticAnalysis } from './types';

const VOWELS = 'aeiouy';
const ARPABET_VOWELS = new Set(['AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW']);
const DIGRAPHS: Record<string,string> = {
  tion:'shun',sion:'zhun',ture:'cher',ough:'of',eigh:'ay',igh:'eye',ph:'f',th:'th',sh:'sh',ch:'ch',wh:'w',ng:'ng',ck:'k',qu:'kw',wr:'r',kn:'n',oo:'u',ee:'e',ea:'e',ai:'ay',ay:'ay',ou:'ow',ow:'ow',oi:'oy',oy:'oy',au:'aw',aw:'aw',er:'er',ir:'er',ur:'er',ar:'ar',or:'or'
};
const STOP = new Set(['the','a','an','and','or','but','to','of','in','on','for','is','it','i','you','my','me','that','this','with','as','at','be','was','are','we','they','he','she','am','do','did','does','from','into','your','our','their','have','has','had']);

export type PronunciationSource = 'datamuse-arpabet'|'dictionary-ipa'|'local-graphemic';
export type PhonemeMap = Map<string,string[]>;

export function normalizeWord(word:string){return word.toLowerCase().replace(/[^a-z']/g,'').replace(/^'+|'+$/g,'');}
export function tokenize(text:string){return text.toLowerCase().replace(/[^a-z0-9'\s-]/g,' ').split(/\s+/).map(normalizeWord).filter(Boolean);}
export function graphemicPhonemes(word:string):string[]{
  let w=normalizeWord(word); if(!w)return [];
  w=w.replace(/e$/,'');
  const out:string[]=[];
  for(let i=0;i<w.length;){
    let matched='';
    for(const k of Object.keys(DIGRAPHS).sort((a,b)=>b.length-a.length)){if(w.startsWith(k,i)){matched=k;break;}}
    if(matched){out.push(DIGRAPHS[matched]);i+=matched.length;continue;}
    const ch=w[i];
    if(VOWELS.includes(ch)){let j=i+1;while(j<w.length&&VOWELS.includes(w[j]))j++;out.push('V'+w.slice(i,j));i=j;continue;}
    out.push(ch);i++;
  }
  return out;
}

function baseArpabet(p:string){return p.toUpperCase().replace(/[0-2]$/,'');}
function isArpabetVowel(p:string){return ARPABET_VOWELS.has(baseArpabet(p));}
function syllableNuclei(p:string[]){return p.filter(x=>x.startsWith('V')||isArpabetVowel(x)).length||1;}
function fallbackRhymeKey(word:string){const p=graphemicPhonemes(word);const lastV=p.map((x,i)=>[x,i] as const).filter(([x])=>x.startsWith('V')).at(-1);if(!lastV)return p.slice(-3).join('|');return p.slice(lastV[1]).join('|');}
function fallbackConsonantKey(word:string){return graphemicPhonemes(word).filter(x=>!x.startsWith('V')).slice(-3).join('|');}
function fallbackVowelKey(word:string){return graphemicPhonemes(word).filter(x=>x.startsWith('V')).slice(-2).join('|');}
function normalizedPhonemes(word:string,phonemes?:string[]){return phonemes?.length?phonemes.map(baseArpabet):graphemicPhonemes(word);}
function rhymeKeyFromPhonemes(p:string[]){
  const lastStressed=p.map((x,i)=>[x,i] as const).filter(([x])=>isArpabetVowel(x)).at(-1);
  if(lastStressed)return p.slice(lastStressed[1]).map(baseArpabet).join('|');
  const lastV=p.map((x,i)=>[x,i] as const).filter(([x])=>x.startsWith('V')).at(-1);
  if(lastV)return p.slice(lastV[1]).join('|');
  return p.slice(-3).join('|');
}
function consonantKeyFromPhonemes(p:string[]){return p.filter(x=>!(isArpabetVowel(x)||x.startsWith('V'))).map(baseArpabet).slice(-3).join('|');}
function vowelKeyFromPhonemes(p:string[]){return p.filter(isArpabetVowel).map(baseArpabet).slice(-2).join('|');}

export function comparePhonetics(a:string,b:string,map?:PhonemeMap){
  const aa=normalizeWord(a),bb=normalizeWord(b);if(!aa||!bb||aa===bb)return{score:0,kind:'consonance' as const,distance:1};
  const ap=normalizedPhonemes(aa,map?.get(aa)),bp=normalizedPhonemes(bb,map?.get(bb));
  const ak=rhymeKeyFromPhonemes(ap),bk=rhymeKeyFromPhonemes(bp);
  if(ak===bk || ap.slice(-2).map(baseArpabet).join('|')===bp.slice(-2).map(baseArpabet).join('|')){const multi=syllableNuclei(ap)>=2&&syllableNuclei(bp)>=2;return{score:1,kind:multi?'multi':'perfect',distance:0};}
  if(!map?.get(aa)&&!map?.get(bb)){
    const av=fallbackVowelKey(aa),bv=fallbackVowelKey(bb),ac=fallbackConsonantKey(aa),bc=fallbackConsonantKey(bb);
    const vowel=av&&av===bv,consonant=ac&&ac===bc;
    if(vowel&&consonant)return{score:.82,kind:'near' as const,distance:.18};if(vowel)return{score:.58,kind:'assonance' as const,distance:.42};if(consonant)return{score:.5,kind:'consonance' as const,distance:.5};
  } else {
    const av=vowelKeyFromPhonemes(ap),bv=vowelKeyFromPhonemes(bp),ac=consonantKeyFromPhonemes(ap),bc=consonantKeyFromPhonemes(bp);
    const vowel=av&&av===bv,consonant=ac&&ac===bc;
    if(vowel&&consonant)return{score:.82,kind:'near' as const,distance:.18};if(vowel)return{score:.62,kind:'assonance' as const,distance:.38};if(consonant)return{score:.54,kind:'consonance' as const,distance:.46};
  }
  const tailA=ak.split('|').slice(-2).join('|'),tailB=bk.split('|').slice(-2).join('|');if(tailA&&tailA===tailB)return{score:.62,kind:'near' as const,distance:.38};
  return{score:0,kind:'consonance' as const,distance:1};
}

export function analyzePhonology(wordsInput:string[],map?:PhonemeMap):PhoneticAnalysis{
  const words=wordsInput.map(normalizeWord).filter(Boolean);
  if(words.length<2)return{wordCount:words.length,rhymeLinks:0,endRhymeRate:0,internalRhymeRate:0,multisyllabicRate:0,assonanceRate:0,consonanceRate:0,rhymeChainScore:0,maxChain:0,uniqueRhymeTargets:0,strongestChains:[],method:map?.size?'external-phonology-with-local-fallback':'local-graphemic-phonology',phonemeCoverage:map?map.size/Math.max(1,new Set(words).size):0};
  let links=0,end=0,internal=0,multi=0,ass=0,cons=0;const targets=new Set<string>();const chains:string[][]=[];
  for(let i=1;i<words.length;i++){
    const c=comparePhonetics(words[i-1],words[i],map);if(c.score>=.5){links++;targets.add(rhymeKeyFromPhonemes(normalizedPhonemes(words[i],map?.get(words[i]))));if(i%4===0||i===words.length-1)end++;if(c.kind==='multi')multi++;if(c.kind==='assonance')ass++;if(c.kind==='consonance')cons++;}
  }
  for(let i=0;i<words.length;i+=4){const bar=words.slice(i,i+4);for(let a=0;a<bar.length;a++)for(let b=a+1;b<bar.length;b++){const c=comparePhonetics(bar[a],bar[b],map);if(c.score>=.55)internal++;}}
  let current:string[]=[];let max=0;for(let i=1;i<words.length;i++){const c=comparePhonetics(words[i-1],words[i],map);if(c.score>=.82){if(!current.length)current=[words[i-1]];current.push(words[i]);max=Math.max(max,current.length);}else{if(current.length>=3)chains.push(current);current=[];}}if(current.length>=3)chains.push(current);
  const density=links/Math.max(words.length-1,1);
  return{wordCount:words.length,rhymeLinks:links,endRhymeRate:Math.min(1,end/Math.max(Math.ceil(words.length/4),1)),internalRhymeRate:Math.min(1,internal/Math.max(words.length*.8,1)),multisyllabicRate:Math.min(1,multi/Math.max(words.length-1,1)*1.8),assonanceRate:Math.min(1,ass/Math.max(words.length-1,1)*2.2),consonanceRate:Math.min(1,cons/Math.max(words.length-1,1)*2.2),rhymeChainScore:Math.min(1,(density*.55)+(max>=4?.45:max===3?.28:0)),maxChain:max,uniqueRhymeTargets:targets.size,strongestChains:chains.sort((a,b)=>b.length-a.length).slice(0,4),method:map?.size?'external-phonology-with-local-fallback':'local-graphemic-phonology',phonemeCoverage:map?map.size/Math.max(1,new Set(words).size):0};
}

export function contentWords(words:string[]){return words.filter(w=>!STOP.has(normalizeWord(w))&&normalizeWord(w).length>2);}
