export class SeededRandom {
  private state:number;
  constructor(seed:string){let h=2166136261>>>0;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619);}this.state=h>>>0;}
  next(){let t=this.state+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}
  pick<T>(items:T[]){return items[Math.floor(this.next()*items.length)];}
  shuffle<T>(items:T[]){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(this.next()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  int(min:number,max:number){return Math.floor(this.next()*(max-min+1))+min;}
}
export const todaySeed=()=>new Date().toISOString().slice(0,10);
export const makeId=(prefix='id')=>`${prefix}_${crypto.randomUUID()}`;
