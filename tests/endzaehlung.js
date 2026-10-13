// Prüft die automatische Totstein-Erkennung am Spielende (toteSteineAmEnde).
// Aufruf: node tests/endzaehlung.js
const vm=require('vm'),fs=require('fs');
const path=require('path');
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','index.html'),'utf8');
const src=html.match(/<script id="shared-go-logic">([\s\S]*?)<\/script>/)[1];
const ctx={console};vm.createContext(ctx);vm.runInContext(src+';globalThis.T=toteSteineAmEnde;',ctx);
function brett(zeilen,rest){const B=new Uint8Array(361);
  for(let y=0;y<19;y++){const z=zeilen[y]||'';for(let x=0;x<19;x++){let c=z[x];if(c===undefined)c=rest(x,y);B[y*19+x]=c==='X'?1:c==='O'?2:0;}}return B;}
function tote(B){const t=ctx.T(B);let d={1:0,2:0};for(let i=0;i<361;i++)if(t[i])d[B[i]]++;return d;}
let ok=true;function pruef(name,B,erw){const d=tote(B);const g=d[1]===erw[1]&&d[2]===erw[2];if(!g)ok=false;console.log((g?'OK   ':'FEHLER ')+name,'tot',JSON.stringify(d),'erwartet',JSON.stringify(erw));}
// Ecke: weißer Ring Zeile 6 / Spalte 6, Schwarz füllt 0..5 ausser Augenpunkten, Rest weiß-Gebiet
function ecke(auge){const z=[];for(let y=0;y<19;y++){let s='';for(let x=0;x<19;x++){let c='.';
  if(y<=5&&x<=5)c=auge.some(([a,b])=>a===x&&b===y)?'.':'X';else if((y===6&&x<=6)||(x===6&&y<=6))c='O';s+=c;}z.push(s);}return brett(z);}
const schwarz=36;
pruef('Klumpen-Fünf (tot)',ecke([[1,1],[2,1],[3,1],[1,2],[2,2]]),{1:31,2:0});
pruef('Kreuz-Fünf (tot)',ecke([[2,1],[1,2],[2,2],[3,2],[2,3]]),{1:31,2:0});
pruef('T-Fünf langer Stiel (lebt)',ecke([[1,1],[2,1],[3,1],[2,2],[2,3]]),{1:0,2:0});
pruef('Gerade Vier (lebt)',ecke([[1,1],[2,1],[3,1],[4,1]]),{1:0,2:0});
pruef('Quadrat-Vier (tot)',ecke([[1,1],[2,1],[1,2],[2,2]]),{1:32,2:0});
pruef('T-Vier (tot)',ecke([[1,1],[2,1],[3,1],[2,2]]),{1:32,2:0});
pruef('Gebogene Drei (tot)',ecke([[1,1],[2,1],[2,2]]),{1:33,2:0});
pruef('Kaninchen-Sechs (tot)',ecke([[2,1],[1,2],[2,2],[3,2],[2,3],[3,3]]),{1:30,2:0});
pruef('Rechteck 2x3 (lebt)',ecke([[1,1],[2,1],[3,1],[1,2],[2,2],[3,2]]),{1:0,2:0});
pruef('Zwei Augen (lebt)',ecke([[1,1],[3,3]]),{1:0,2:0});
// Seki
{const z=['OOX.OXX','OOX.OXX','OOXXOXX','OOOOXXX'];for(let y=4;y<19;y++)z.push('..OOX');
 pruef('Seki (beide leben)',brett(z,(x,y)=>'.'),{1:0,2:0});}
// Falsches Auge
{const z=['.XX.X.XO','XXXXOXXO','OOOOOOOO'];pruef('Falsche Augen (Schwarz tot)',brett(z,()=>'.'),{1:10,2:0});}
// toter Einzelstein im Gebiet
{const z=[];for(let y=0;y<19;y++)z.push(y===5?'....O...X':'........X');z[10]='.X......X';
 pruef('Toter weißer Stein im schwarzen Gebiet',brett(z,(x,y)=>x>9?'.':undefined),{1:0,2:1});}
// Partie des Nutzers
{const rows=["XXXXXXXXXXXOOX.X.X.", "XXXXXXXXXOOOX.X.X.X", "XXXXXXXXOO.OXXXXXX.", "XXXXXXXXXXOOOXOOXXX", "XXXXXXXXXXO.OOO.OXX", "XXXXXXXXXOOO.OOO.OX", "X...XXXXXXO.OOOOOOX", "XX.XXXXXXO.OO.O.OXX", "XX.XXXXXXOOO.O..OXX", "XXXXXXXXXXOO...O.OO", "XXXXXXXXXXO.O.O.O.O", "XXXXXXXXXOOO.O.O.O.", "XXXXXXXXXXOOO.O.O.O", "XXXXXXXXXXXO.O.O.OO", "XXXXXXXXXXOOOOO.O.O", "XXXXXXXXXXXOOOOOOO.", "XXXXXXXXXXXXXOOOOOO", "XXXXXXXXXXXXXOOXOO.", "XXXXXXXXXXXXXXXXO.."];pruef('Partie vom 13.10.2026 (Endstellung, früher 194 Steine falsch tot)',brett(rows),{1:0,2:0});}
console.log(ok?'ALLE OK':'ES GIBT FEHLER');
process.exit(ok?0:1);
