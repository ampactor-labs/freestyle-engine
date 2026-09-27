export class Recorder{
  private recorder:MediaRecorder|null=null;private stream:MediaStream|null=null;private chunks:Blob[]=[];private startedAt=0;private ctx:AudioContext|null=null;private analyser:AnalyserNode|null=null;private source:MediaStreamAudioSourceNode|null=null;private raf:number|null=null;
  get supported(){return typeof MediaRecorder!=='undefined'&&!!navigator.mediaDevices?.getUserMedia;}
  async start(onLevel?:(level:number)=>void){if(!this.supported)throw new Error('Recording unsupported');this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(x=>MediaRecorder.isTypeSupported(x));const r=new MediaRecorder(this.stream,mime?{mimeType:mime}:undefined);this.recorder=r;const chunks:Blob[]=[];this.chunks=chunks;r.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};this.startedAt=performance.now();r.start(120);if(onLevel&&typeof AudioContext!=='undefined'){this.ctx=new AudioContext();this.source=this.ctx.createMediaStreamSource(this.stream);this.analyser=this.ctx.createAnalyser();this.analyser.fftSize=512;this.source.connect(this.analyser);const data=new Uint8Array(this.analyser.fftSize);const tick=()=>{if(!this.analyser)return;this.analyser.getByteTimeDomainData(data);let sum=0;for(const v of data){const x=(v-128)/128;sum+=x*x;}onLevel(Math.min(1,Math.sqrt(sum/data.length)*3));this.raf=requestAnimationFrame(tick);};tick();}}
  stop():Promise<{blob:Blob,durationSeconds:number}>{return new Promise((resolve,reject)=>{
    const r=this.recorder;if(!r){reject(new Error('not recording'));return;}
    // Every slice emitted since start() is already in this.chunks; the final slice arrives
    // as one more dataavailable event before stop fires, so the blob is built only in onstop.
    const chunks=this.chunks;
    r.onerror=()=>reject(new Error('recording error'));
    const finish=()=>{this.cleanupAnalyser();const blob=new Blob(chunks,{type:r.mimeType||chunks[0]?.type||'audio/webm'});this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;this.chunks=[];resolve({blob,durationSeconds:(performance.now()-this.startedAt)/1000});};
    r.onstop=finish;
    if(r.state==='inactive'){finish();return;}
    r.stop();});}
  cancel(){try{this.recorder?.stop();}catch{}this.cleanupAnalyser();this.stream?.getTracks().forEach(t=>t.stop());this.recorder=null;this.stream=null;this.chunks=[];}
  private cleanupAnalyser(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=null;this.source?.disconnect();this.analyser?.disconnect();this.source=null;this.analyser=null;this.ctx?.close();this.ctx=null;}
}
