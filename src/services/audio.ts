export class BeatEngine{
  private ctx:AudioContext|null=null; private timer:number|null=null; private running=false; private nextTime=0; private beat=0; private bpm=92; private swing=.5; private pattern='boom-bap';
  private ensure(){this.ctx??=new AudioContext();if(this.ctx.state==='suspended')this.ctx.resume();return this.ctx;}
  start(bpm=92,onBeat:(index:number)=>void=()=>{},pattern='boom-bap',swing=.5){this.stop();this.bpm=bpm;this.pattern=pattern;this.swing=swing;this.running=true;this.beat=0;this.nextTime=this.ensure().currentTime+.05;const tick=()=>{if(!this.running)return;const ctx=this.ensure();while(this.nextTime<ctx.currentTime+.12){this.schedule(this.nextTime,this.beat,onBeat);this.beat++;this.nextTime+=60/this.bpm;}this.timer=window.setTimeout(tick,25);};tick();}
  private click(time:number,freq:number,vol:number){const c=this.ensure();const o=c.createOscillator();const g=c.createGain();o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(vol,time);g.gain.exponentialRampToValueAtTime(.001,time+.045);o.connect(g).connect(c.destination);o.start(time);o.stop(time+.05);}
  private noise(time:number,vol:number,dur=.045){const c=this.ensure();const b=c.createBuffer(1,c.sampleRate*dur,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();const g=c.createGain();g.gain.setValueAtTime(vol,time);g.gain.exponentialRampToValueAtTime(.001,time+dur);s.buffer=b;s.connect(g).connect(c.destination);s.start(time);}
  private schedule(time:number,index:number,onBeat:(index:number)=>void){const pos=index%8;const bar=Math.floor(index/8);const [kick,clap,hat]=[pos===0||pos===3, pos===2||pos===6, true];if(kick)this.click(time,90,.18);if(clap)this.noise(time,.12,.06);if(hat)this.noise(time+(pos%2?0.01:0),.035,.025);onBeat(index);}
  tap(){this.click(this.ensure().currentTime,880,.08)}
  stop(){this.running=false;if(this.timer)clearTimeout(this.timer);this.timer=null;}
  setSwing(v:number){this.swing=v;}
}
