import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('.',import.meta.url)));
const dist=join(root,'dist');
rmSync(dist,{recursive:true,force:true});
execFileSync('tsc',['-p','tsconfig.build.json'],{cwd:root,stdio:'inherit'});

function walk(dir){let out=[];for(const ent of readdirSync(dir,{withFileTypes:true})){const p=join(dir,ent.name);if(ent.isDirectory())out=out.concat(walk(p));else out.push(p);}return out;}

for(const file of walk(dist).filter(x=>x.endsWith('.js'))){
  let s=readFileSync(file,'utf8');
  s=s.replace(/(from\s*["'])(\.\.?\/[^"']+?)(["'])/g,(_,a,b,c)=>a+((b.endsWith('.js')||b.endsWith('.json'))?b:b+'.js')+c);
  s=s.replace(/(import\s*\(\s*["'])(\.\.?\/[^"']+?)(["']\s*\))/g,(_,a,b,c)=>a+((b.endsWith('.js')||b.endsWith('.json'))?b:b+'.js')+c);
  writeFileSync(file,s);
}
cpSync(join(root,'src/ui/styles.css'),join(dist,'styles.css'));
const sourceIndex=readFileSync(join(root,'index.html'),'utf8');
const distIndex=sourceIndex.replace('<script type="module" src="/src/main.ts"></script>','<link rel="stylesheet" href="./styles.css"><script type="module" src="./main.js"></script>');
writeFileSync(join(dist,'index.html'),distIndex);
writeFileSync(join(dist,'.nojekyll'),'');
console.log(`Built ${dist}`);
