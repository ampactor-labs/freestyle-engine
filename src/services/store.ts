import type { Session, TrainingProfile } from '../core/types';
const DB='freestyle-engine';const VER=2;
let openPromise:Promise<IDBDatabase>|null=null;
function db(){if(!openPromise)openPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('sessions'))d.createObjectStore('sessions',{keyPath:'id'});if(!d.objectStoreNames.contains('meta'))d.createObjectStore('meta',{keyPath:'key'});if(!d.objectStoreNames.contains('recordings'))d.createObjectStore('recordings',{keyPath:'id'});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});return openPromise;}
async function request<T>(store:string,mode:IDBTransactionMode,fn:(os:IDBObjectStore)=>IDBRequest<T>){const d=await db();return new Promise<T>((resolve,reject)=>{const t=d.transaction(store,mode);const req=fn(t.objectStore(store));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);t.onerror=()=>reject(t.error);});}
export async function loadProfile(){const x=await request<any>('meta','readonly',os=>os.get('profile'));return x?.value as TrainingProfile|undefined;}
export async function saveProfile(profile:TrainingProfile){await request('meta','readwrite',os=>os.put({key:'profile',value:profile}));}
export async function loadSettings<T>():Promise<T|undefined>{const x=await request<any>('meta','readonly',os=>os.get('settings'));return x?.value as T|undefined;}
export async function saveSettings<T>(value:T){await request('meta','readwrite',os=>os.put({key:'settings',value}));}
export async function saveSession(session:Session){await request('sessions','readwrite',os=>os.put(session));}
export async function listSessions(){const all=await request<Session[]>('sessions','readonly',os=>os.getAll());return(all??[]).sort((a,b)=>b.startedAt-a.startedAt);}
export async function deleteSession(id:string){await request('sessions','readwrite',os=>os.delete(id));}
export async function saveRecording(id:string,blob:Blob){await request('recordings','readwrite',os=>os.put({id,blob}));}
export async function getRecording(id:string){const x=await request<any>('recordings','readonly',os=>os.get(id));return x?.blob as Blob|undefined;}
export async function clearAll(){const d=await db();for(const s of ['sessions','meta','recordings']){await new Promise<void>((resolve,reject)=>{const t=d.transaction(s,'readwrite');t.objectStore(s).clear();t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});}}
