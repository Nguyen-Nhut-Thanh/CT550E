const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const root = process.cwd();
const ref = path.join(root, 'ThamKhao/web');
const web = path.join(root, 'apps/web');
const copied = new Set();
function files(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
function write(p,s) { fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,s); }
function copyWeb(source, force=false) {
  const rel = path.relative(ref,source), target=path.join(web,rel);
  if(copied.has(rel)) return;
  copied.add(rel);
  if(fs.existsSync(target) && !force) return;
  const content=fs.readFileSync(source,'utf8');
  write(target,content);
  for(const match of content.matchAll(/(?:from\s*|import\s*)["'](@\/[^"']+|\.[^"']+)["']/g)) {
    const base=match[1].startsWith('@/') ? path.join(ref,match[1].slice(2)) : path.resolve(path.dirname(source),match[1]);
    const file=[base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts'),path.join(base,'index.tsx')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
    if(file) copyWeb(file);
  }
}
for(const dir of ['app/admin','components/admin','lib/admin']) for(const f of files(path.join(ref,dir))) copyWeb(f,true);
// Share the current application's authentication and API configuration.
write(path.join(web,'lib/auth.ts'),'export * from "./client/utils/auth";\n');
let chatPath=path.join(web,'lib/chat.ts');
if(fs.existsSync(chatPath)) write(chatPath,fs.readFileSync(chatPath,'utf8').replace(/export const API_BASE_URL =[\s\S]*?;/,'import { API_BASE } from "./auth";\nexport const API_BASE_URL = API_BASE.replace(/\\/+$/, "");'));

const apiRef=path.join(root,'ThamKhao/api/src/modules');
const api=path.join(root,'apps/api/src/modules');
const controllers=[],providers=[];
// Existing client routes remain in their original modules. Reference services
// live under admin so their management behavior can evolve independently.
for(const name of ['tours','locations','banners','flash-deals','users','posts','vouchers','dashboard']) {
  const sourceDir=path.join(apiRef,name);
  for(const f of files(sourceDir).filter(f=>!f.endsWith('.module.ts')&&!f.includes('public_tours')&&!f.includes('-public.service'))) {
    let s=fs.readFileSync(f,'utf8');
    const isController=f.endsWith('.controller.ts');
    if(isController) {
      const ast=ts.createSourceFile(f,s,ts.ScriptTarget.Latest,true);
      const edits=[];
      for(const cl of ast.statements.filter(ts.isClassDeclaration)) for(const member of cl.members) {
        if(!ts.isMethodDeclaration(member)) continue;
        const route=(ts.getDecorators(member)||[]).map(d=>d.expression).find(e=>ts.isCallExpression(e)&&['Get','Post','Patch','Delete','Put'].includes(e.expression.getText(ast)));
        if(route && !route.arguments[0]?.getText(ast).includes('admin') && ['locations','banners','flash-deals','posts','vouchers'].includes(name)) edits.push([member.getFullStart(),member.end]);
      }
      for(const [start,end] of edits.sort((a,b)=>b[0]-a[0])) s=s.slice(0,start)+s.slice(end);
      s=s.replace(/JwtAuthGuard/g,'AdminAuthGuard').replace("../auth/jwt.guard","../../auth/admin.guard");
      s=s.replace(/(@Controller\([^\n]*\)\s*)/,'$1\n@UseGuards(AdminAuthGuard)\n');
      const cls=s.match(/export class (\w+)/)[1];
      controllers.push([cls,`./${name}/${path.basename(f,'.ts')}`]);
    } else if(s.includes('@Injectable()')) {
      providers.push([s.match(/export class (\w+)/)[1],`./${name}/${path.basename(f,'.ts')}`]);
    }
    s=s.replaceAll("'../../prisma.service'","'../../../prisma.service'").replaceAll("'../mail/mail.service'","'../../mail/mail.service'").replaceAll("'./locations-public.service'","'../../locations/locations-public.service'");
    write(path.join(api,'admin',name,path.basename(f)),s);
  }
}
providers.push(['LocationsPublicService','../locations/locations-public.service']);
write(path.join(api,'admin/admin.module.ts'),`import { Module } from '@nestjs/common';\nimport { PrismaService } from '../../prisma.service';\nimport { MailModule } from '../mail/mail.module';\n${[...controllers,...providers].map(([n,p])=>`import { ${n} } from '${p}';`).join('\n')}\n@Module({ imports: [MailModule], controllers: [${controllers.map(x=>x[0]).join(',')}], providers: [PrismaService,${providers.map(x=>x[0]).join(',')}] })\nexport class AdminModule {}\n`);
console.log(`Ported ${copied.size} frontend dependencies and ${controllers.length} management controllers.`);
