import { chromium } from 'playwright';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/index.html');await p.evaluate(()=>document.fonts.ready);
for(let i=1;i<=6;i++) await p.locator('#font-'+i).screenshot({path:`font-${i}.png`});
console.log(await p.evaluate(()=>[...document.fonts].filter(f=>f.status!=='loaded').map(f=>f.family)));await b.close();
