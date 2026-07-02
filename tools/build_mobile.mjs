#!/usr/bin/env node
// Regenerates game_v3/mobile.html (single-file touch edition) from game_v3/src/.
// Usage: node tools/build_mobile.mjs
import {readFileSync,writeFileSync} from 'fs';
import {dirname,join} from 'path';
import {fileURLToPath} from 'url';
import {execSync} from 'child_process';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const SRC=join(root,'game_v3');
const read=f=>readFileSync(join(SRC,f),'utf8');

const engine=read('src/engine.js');
let data=read('src/data.js');
const scenes=read('src/scenes.js');
const main=read('src/main.js');

// Single-file build: inline every manifest asset as a base64 data: URI so
// the real spritesheets/tilesets ship inside the HTML (works over file://).
data=data.replace(/const ASSET_MANIFEST=\[[\s\S]*?\n\];/,block=>{
  return block.replace(/\{type:'(image|meta)',key:'([^']+)',path:'([^']+)'\}/g,(m,type,key,path)=>{
    const buf=readFileSync(join(SRC,path));
    const mime=type==='image'?'image/png':'text/plain';
    return `{type:'${type}',key:'${key}',path:'data:${mime};base64,${buf.toString('base64')}'}`;
  });
});

const TOUCH_CSS=`
#touch{position:fixed;inset:0;pointer-events:none;z-index:50;display:none;font-family:'Courier New',monospace;-webkit-user-select:none;user-select:none}
body.touchmode #touch{display:block}
.tbtn{position:fixed;pointer-events:auto;background:rgba(200,168,78,0.14);border:2px solid rgba(200,168,78,0.55);color:#f0e6c0;border-radius:50%;width:64px;height:64px;font-size:15px;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent}
.tbtn:active{background:rgba(200,168,78,0.4)}
.tbtn.sm{width:48px;height:48px;font-size:10px;border-radius:10px}
#tLeft{left:12px;bottom:66px}
#tRight{left:92px;bottom:66px}
#tJump{right:12px;bottom:112px}
#tAtk{right:92px;bottom:56px}
#tSkill{right:172px;bottom:98px}
#tDash{right:12px;bottom:32px;width:52px;height:52px}
#tUlt{right:96px;bottom:150px}
#tSwap{left:12px;bottom:150px}
#tPause{right:10px;top:8px}
@media (orientation:portrait){#rotateHint{display:flex}}
#rotateHint{display:none;position:fixed;inset:0;background:rgba(5,5,20,0.92);z-index:100;color:#c8a84e;align-items:center;justify-content:center;text-align:center;font-size:16px;pointer-events:none}
`;
const TOUCH_HTML=`
<div id="touch">
  <div class="tbtn" id="tLeft">&#9664;</div>
  <div class="tbtn" id="tRight">&#9654;</div>
  <div class="tbtn" id="tJump">JUMP</div>
  <div class="tbtn" id="tAtk">ATK</div>
  <div class="tbtn" id="tSkill">SKILL</div>
  <div class="tbtn sm" id="tDash">DASH</div>
  <div class="tbtn sm" id="tUlt">ULT</div>
  <div class="tbtn sm" id="tSwap">SWAP</div>
  <div class="tbtn sm" id="tPause">| |</div>
</div>
<div id="rotateHint">Rotate your phone sideways &#8634;<br>for the best experience</div>
`;
const TOUCH_JS=`
// ═══ TOUCH CONTROLS (mobile single-file build) ═══
(function(){
  const map={tLeft:'ArrowLeft',tRight:'ArrowRight',tJump:'Space',tAtk:'KeyZ',tSkill:'KeyQ',tDash:'KeyK',tUlt:'KeyX',tSwap:'Tab',tPause:'Escape'};
  const isTouch=('ontouchstart' in window)||navigator.maxTouchPoints>0;
  if(isTouch)document.body.classList.add('touchmode');
  Object.keys(map).forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const code=map[id];
    const down=e=>{e.preventDefault();Music.init();Music.resume();
      if(!I.k[code])I.j[code]=true;I.k[code]=true;
      if(D.on&&(code==='Space'))D._advance=true;};
    const up=e=>{e.preventDefault();I.k[code]=false;};
    el.addEventListener('pointerdown',down);
    el.addEventListener('pointerup',up);
    el.addEventListener('pointercancel',up);
    el.addEventListener('pointerleave',up);
  });
  function fit(){
    const c=document.getElementById('gameContainer');
    const s=Math.min(window.innerWidth/800,window.innerHeight/480);
    c.style.transform='scale('+s+')';
    c.style.transformOrigin='center center';
  }
  window.addEventListener('resize',fit);fit();
})();
`;

const html=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<title>Chronicles of Azurerune — Mobile</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a1a;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden;font-family:'Courier New',monospace;touch-action:none}
canvas{display:block;image-rendering:pixelated;image-rendering:crisp-edges}
#gameContainer{position:relative;width:800px;height:480px;flex:none}
#ui{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}
#dlg{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);width:88%;max-width:680px;background:rgba(8,8,30,0.95);border:2px solid #c8a84e;border-radius:6px;padding:14px 18px;color:#f0e6c0;font-size:14px;line-height:1.5;display:none;pointer-events:auto;z-index:10}
#dlg .sp{color:#c8a84e;font-weight:bold;margin-bottom:3px;font-size:12px}
#dlg .tx{min-height:36px}
#dlg .pr{color:#555;font-size:10px;margin-top:6px;text-align:right}
#title{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:auto;z-index:20}
#title h1{color:#c8a84e;font-size:30px;text-shadow:0 0 18px rgba(200,168,78,0.4);margin-bottom:4px;text-align:center}
#title h2{color:#8ab4d4;font-size:15px;margin-bottom:20px;font-weight:normal;text-align:center}
.btn{pointer-events:auto;background:rgba(200,168,78,0.1);border:1px solid #c8a84e;color:#c8a84e;padding:8px 28px;font-family:inherit;font-size:13px;cursor:pointer;margin:3px;border-radius:3px;outline:none}
#hud{position:absolute;top:0;left:0;width:100%;padding:5px 8px;display:none;pointer-events:none;z-index:5;display:flex;gap:5px;align-items:flex-start}
.hs{display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer;padding:2px 3px;border-radius:3px;border:2px solid transparent}
.hs.act{border-color:#c8a84e;background:rgba(200,168,78,0.08)}
.hp-bar{width:32px;height:3px;background:#222;border-radius:1px;margin-top:2px}
.hp-fill{height:100%;border-radius:1px;transition:width 0.3s}
.hs .nm{color:#888;font-size:8px;margin-top:1px}
#hint{position:absolute;bottom:5px;right:8px;color:#4a4a5a;font-size:9px;pointer-events:none}
#loadScr{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;background:#0a0a1a;z-index:30}
#loadScr .lt{color:#c8a84e;font-size:14px;margin-bottom:12px}
#loadScr .bar{width:200px;height:6px;background:#1a1a2a;border:1px solid #333;border-radius:3px}
#loadScr .fill{height:100%;background:#c8a84e;border-radius:2px;width:0%}
#loadScr .info{color:#555;font-size:10px;margin-top:8px}
${TOUCH_CSS}
</style>
</head>
<body>
<div id="gameContainer">
<canvas id="c" tabindex="0"></canvas>
<div id="ui">
<div id="loadScr"><div class="lt">Loading...</div><div class="bar"><div class="fill" id="loadBar"></div></div><div class="info" id="loadInfo"></div></div>
<div id="title" style="display:none">
<h1>Chronicles of Azurerune</h1>
<h2>The Heroes' Challenge</h2>
<div style="margin-bottom:10px;display:flex;gap:6px">
  <button class="btn" id="langEN" style="padding:4px 12px;font-size:10px">EN</button>
  <button class="btn" id="langES" style="padding:4px 12px;font-size:10px">ES</button>
  <button class="btn" id="langIT" style="padding:4px 12px;font-size:10px">IT</button>
</div>
<button class="btn" id="startBtn">Level 1: School Day</button>
<button class="btn" id="startBtn2">Level 2: Kingfisher Festival</button>
<button class="btn" id="startBtn3">Level 3: Library of Secrets</button>
<button class="btn" id="startBtn4">Level 4: Yurthgreen Masquerade</button>
<button class="btn" id="startBtn5">Level 5: When the Home Burns</button>
</div>
<div id="hud"></div>
<div id="dlg"><div class="sp"></div><div class="tx"></div><div class="pr">[TAP]</div></div>
<div id="hint"></div>
</div>
</div>
${TOUCH_HTML}
<script>
${engine}
</script>
<script>
${data}
</script>
<script>
${scenes}
</script>
<script>
${TOUCH_JS}
</script>
<script>
${main}
</script>
</body>
</html>
`;
writeFileSync(join(SRC,'mobile.html'),html);
console.log('wrote game_v3/mobile.html',html.length,'bytes');
