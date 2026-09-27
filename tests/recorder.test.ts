import { afterEach, describe, expect, it, vi } from 'vitest';
import { Recorder } from '../src/services/recorder';

class FakeMediaRecorder{
  static instances:FakeMediaRecorder[]=[];
  static isTypeSupported(t:string){return t==='audio/webm;codecs=opus';}
  state:'inactive'|'recording'='inactive';
  mimeType:string;
  timeslice:number|undefined;
  ondataavailable:((e:{data:Blob})=>void)|null=null;
  onstop:(()=>void)|null=null;
  onerror:(()=>void)|null=null;
  constructor(_stream:unknown,opts?:{mimeType?:string}){this.mimeType=opts?.mimeType??'';FakeMediaRecorder.instances.push(this);}
  start(timeslice?:number){this.timeslice=timeslice;this.state='recording';}
  emit(text:string){this.ondataavailable?.({data:new Blob([text])});}
  stop(){this.state='inactive';this.emit('final');this.onstop?.();}
}

function install(){
  FakeMediaRecorder.instances=[];
  const track={stop:vi.fn()};
  vi.stubGlobal('MediaRecorder',FakeMediaRecorder);
  vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:vi.fn(async()=>({getTracks:()=>[track]}))}});
  return track;
}

afterEach(()=>{vi.unstubAllGlobals();});

describe('Recorder',()=>{
  it('keeps every slice emitted during the take, in order, with the recorder mime type',async()=>{
    const track=install();
    const rec=new Recorder();
    await rec.start();
    const fake=FakeMediaRecorder.instances[0]!;
    expect(fake.timeslice).toBe(120);
    fake.emit('header|');fake.emit('one|');fake.emit('two|');
    fake.ondataavailable?.({data:new Blob([])});
    const {blob,durationSeconds}=await rec.stop();
    expect(await blob.text()).toBe('header|one|two|final');
    expect(blob.type).toBe('audio/webm;codecs=opus');
    expect(durationSeconds).toBeGreaterThanOrEqual(0);
    expect(track.stop).toHaveBeenCalled();
  });

  it('does not leak slices from a cancelled take into the next one',async()=>{
    install();
    const rec=new Recorder();
    await rec.start();
    const first=FakeMediaRecorder.instances[0]!;
    first.emit('old|');
    rec.cancel();
    await rec.start();
    const second=FakeMediaRecorder.instances[1]!;
    second.emit('new|');
    const {blob}=await rec.stop();
    expect(await blob.text()).toBe('new|final');
  });

  it('rejects stop() when nothing is recording',async()=>{
    install();
    await expect(new Recorder().stop()).rejects.toThrow('not recording');
  });
});
