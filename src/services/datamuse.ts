import { searchDatamuse, enrichWord, setDatamuseApiKey, hasDatamuseApiKey, clearLinguisticCache } from './linguistic';
export interface WordResult{word:string;score?:number;numSyllables?:number;tags?:string[];defs?:string[]}
export const rhymeWords=(word:string,limit=30)=>searchDatamuse(word,'rhyme',limit) as Promise<WordResult[]>;
export const nearRhymeWords=(word:string,limit=30)=>searchDatamuse(word,'near',limit) as Promise<WordResult[]>;
export const relatedWords=(word:string,limit=20)=>searchDatamuse(word,'semantic',limit) as Promise<WordResult[]>;
export const soundsLike=(word:string,limit=20)=>searchDatamuse(word,'sound',limit) as Promise<WordResult[]>;
export const synonyms=(word:string,limit=20)=>searchDatamuse(word,'synonym',limit) as Promise<WordResult[]>;
export const definitions=(word:string,limit=8)=>searchDatamuse(word,'semantic',limit) as Promise<WordResult[]>;
export { enrichWord, setDatamuseApiKey, hasDatamuseApiKey, clearLinguisticCache };
