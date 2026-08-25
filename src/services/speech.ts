type SR=any;
export class SpeechController{
  private recognition:SR|null=null; private shouldRun=false;
  readonly supported=typeof window!=='undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  start(onInterim:(text:string)=>void,onFinal:(text:string)=>void,onError:(message:string)=>void){if(!this.supported)return;const C=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;this.recognition=new C();this.recognition.continuous=true;this.recognition.interimResults=true;this.recognition.lang='en-US';this.shouldRun=true;this.recognition.onresult=(e:any)=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0]?.transcript??'';if(e.results[i].isFinal)onFinal(t.trim());else interim+=t;}if(interim)onInterim(interim.trim());};this.recognition.onerror=(e:any)=>onError(e?.error??'speech error');this.recognition.onend=()=>{if(this.shouldRun)try{this.recognition?.start()}catch{}};try{this.recognition.start()}catch{}}
  stop(){this.shouldRun=false;try{this.recognition?.stop()}catch{}this.recognition=null;}
}
export const createSpeechController=()=>new SpeechController();
