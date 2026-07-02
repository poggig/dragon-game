// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — ENGINE
// Core, game-agnostic systems: assets, input, i18n, rendering, particles,
// FX strips, tilemap, physics entities, dialogue, music.
// No level content lives here — see data.js (config) and scenes.js (levels).
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const CW=800,CH=480,T=16,GR=0.6,MF=10;
const GAME_VERSION='2.0.0';

// ═══ ASSET LOADER ═══
const Assets={
  images:{},meta:{},total:0,loaded:0,
  parseMeta(txt){
    const anims={};
    for(const line of txt.split('\n')){
      const m=line.match(/^(.+?)\s*=\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
      if(!m)continue;
      const path=m[1].trim(),x=+m[2],y=+m[3],w=+m[4],h=+m[5];
      let anim=path,frame=0;
      const fm=path.match(/^(.+?)(?:\/frame(\d+)(?:\.png)?|\.png)?$/);
      if(fm){anim=fm[1];frame=fm[2]?+fm[2]:0}
      const parts=anim.split('/');
      if(parts.length>1)anim=parts.slice(1).join('/');
      if(!anims[anim])anims[anim]=[];
      anims[anim].push({x,y,w,h,frame});
    }
    for(const k in anims)anims[k].sort((a,b)=>a.frame-b.frame);
    return anims;
  },
  async load(manifest){
    this.total=manifest.length;this.loaded=0;
    const bar=document.getElementById('loadBar'),info=document.getElementById('loadInfo');
    // Version-keyed cache bust: assets re-download only when the game version
    // changes, instead of on every page load (the old Date.now() bust).
    // data: URIs (single-file mobile build) must not get a query suffix.
    const bustFor=p=>p.startsWith('data:')?'':'?v='+GAME_VERSION;
    const tick=(path)=>{this.loaded++;bar.style.width=(this.loaded/this.total*100)+'%';info.textContent=path};
    const promises=manifest.map(item=>{
      if(item.type==='image'){
        return new Promise(res=>{
          const img=new Image();
          img.onload=()=>{this.images[item.key]=img;tick(item.path);res()};
          img.onerror=()=>{console.warn('Failed:',item.path);tick(item.path);res()};
          img.src=item.path+bustFor(item.path);
        });
      }
      return fetch(item.path+bustFor(item.path)).then(r=>r.text()).then(txt=>{
        this.meta[item.key]=this.parseMeta(txt);tick(item.path);
      }).catch(()=>{console.warn('Failed meta:',item.path);tick(item.path)});
    });
    await Promise.all(promises);
  }
};

// ═══ INPUT ═══
const I={k:{},j:{},
  init(){
    window.addEventListener('keydown',e=>{
      Music.init();Music.resume();
      if(!this.k[e.code])this.j[e.code]=true;
      this.k[e.code]=true;
      if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code))e.preventDefault();
      // Direct dialogue advancement as backup — bypasses game loop entirely
      if(D.on&&(e.code==='Space'||e.code==='Enter'))D._advance=true;
    });
    window.addEventListener('keyup',e=>{this.k[e.code]=false});
    // Click anywhere on the page advances dialogue
    window.addEventListener('click',()=>{
      if(D.on){D._advance=true;this.j['Space']=true;}
    });
  },
  flush(){this.j={}},down(c){return!!this.k[c]},pr(c){return!!this.j[c]}
};

// ═══ TRANSLATION SYSTEM ═══
// Strings live in data.js (Lang.strings). Every player-facing line — including
// all story dialogue — goes through Lang.t(), so the EN/ES/IT toggle applies
// to the whole game, not just the title screen.
const Lang={
  current:'en',
  strings:{en:{},es:{},it:{}},
  set(lang){this.current=lang;},
  t(key){return (this.strings[this.current]&&this.strings[this.current][key])||(this.strings.en&&this.strings.en[key])||key;}
};
// Dialogue line helper: d('Nesta','some_key') → {sp,tx} resolved at show-time.
function d(sp,tx){return{sp,tx}}

// ═══ RENDERER ═══
const R={c:null,x:null,cam:{x:0,y:0},
  init(){this.c=document.getElementById('c');this.c.width=CW;this.c.height=CH;this.x=this.c.getContext('2d');this.x.imageSmoothingEnabled=false},
  cls(col){this.x.fillStyle=col;this.x.fillRect(0,0,CW,CH)},
  rect(x,y,w,h,col){this.x.fillStyle=col;this.x.fillRect(x-this.cam.x,y-this.cam.y,w,h)},
  sr(x,y,w,h,col){this.x.fillStyle=col;this.x.fillRect(x,y,w,h)},
  txt(t,x,y,c,s,a){this.x.fillStyle=c||'#fff';this.x.font=(s||11)+'px "Courier New",monospace';this.x.textAlign=a||'left';this.x.fillText(t,x,y)},
  drawDecos(decos){
    if(!decos)return;
    const ctx=this.x;
    const order=['bg','wall','ground',undefined];
    for(const layer of order){
      decos.forEach(d=>{
        if(d.layer!==layer)return;
        const px=d.x-this.cam.x,py=d.y-this.cam.y;
        if(px>-150&&px<CW+150&&py>-150&&py<CH+150){
          ctx.globalAlpha=d.a||1;
          if(d.img)ctx.drawImage(d.img,Math.round(px),Math.round(py));
          ctx.globalAlpha=1;
        }
      });
    }
  },
  a(v){this.x.globalAlpha=v},ra(){this.x.globalAlpha=1},

  // SPRITE-BASED HERO DRAWING (aspect-ratio preserving)
  drawHero(type,state,frame,x,y,w,h,flip){
    const cfg=SpriteConfig.heroes[type];
    if(!cfg){this._drawHeroFallback(type,state,frame,x,y,w,h,flip);return;}
    const img=Assets.images[cfg.img];
    const meta=Assets.meta[cfg.meta];
    if(!img||!meta){this._drawHeroFallback(type,state,frame,x,y,w,h,flip);return;}
    const animName=cfg.stateMap[state]||cfg.stateMap.idle;
    const frames=meta[animName];
    if(!frames||frames.length===0){this._drawHeroFallback(type,state,frame,x,y,w,h,flip);return;}
    const f=frames[frame%frames.length];
    // Preserve aspect ratio: scale sprite 1.5x, feet anchored at entity bottom
    const ratio=f.w/f.h;
    const dh=h*1.5;const dw=dh*ratio;
    const ox=(w-dw)/2;
    const px=x-this.cam.x+ox,py=y-this.cam.y+h-dh;
    const ctx=this.x;
    ctx.save();
    if(flip){
      ctx.translate(x-this.cam.x+w-ox,py);
      ctx.scale(-1,1);
      ctx.drawImage(img,f.x,f.y,f.w,f.h,0,0,dw,dh);
    }else{
      ctx.drawImage(img,f.x,f.y,f.w,f.h,px,py,dw,dh);
    }
    ctx.restore();
  },

  // SPRITE-BASED ENEMY DRAWING (1.5x scale, feet anchored)
  drawEnemy(type,state,frame,x,y,w,h,flip){
    if(type==='lib_cataloguer'||type==='gauntlet'||type==='animated_sword'){this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);return;}
    const cfg=SpriteConfig.enemies[type];
    if(!cfg){this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);return;}
    const dw=w*1.5,dh=h*1.5;
    const px=x-this.cam.x-(dw-w)/2, py=y-this.cam.y-(dh-h);
    const ctx=this.x;

    if(cfg.type==='meta'){
      const img=Assets.images[cfg.img];
      const meta=Assets.meta[cfg.meta];
      if(!img||!meta){this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);return;}
      const animName=cfg.stateMap[state]||cfg.stateMap.idle;
      const frames=meta[animName];
      if(!frames||frames.length===0){this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);return;}
      const f=frames[frame%frames.length];
      ctx.save();
      if(flip){
        ctx.translate(x-this.cam.x+(dw+w)/2,py);
        ctx.scale(-1,1);
        ctx.drawImage(img,f.x,f.y,f.w,f.h,0,0,dw,dh);
      }else{
        ctx.drawImage(img,f.x,f.y,f.w,f.h,px,py,dw,dh);
      }
      ctx.restore();
    }else if(cfg.type==='strip'){
      const stripKey=cfg.imgs[state]||cfg.imgs.idle||Object.values(cfg.imgs)[0];
      const img=Assets.images[stripKey];
      if(!img){this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);return;}
      const fH=img.height;
      const fW=cfg.frameW&&cfg.frameH===img.height?cfg.frameW:fH;
      const numFrames=Math.max(1,Math.floor(img.width/fW));
      const frameIdx=frame%numFrames;
      ctx.save();
      if(flip){
        ctx.translate(x-this.cam.x+(dw+w)/2,py);
        ctx.scale(-1,1);
        ctx.drawImage(img,frameIdx*fW,0,fW,fH,0,0,dw,dh);
      }else{
        ctx.drawImage(img,frameIdx*fW,0,fW,fH,px,py,dw,dh);
      }
      ctx.restore();
      if(cfg.tint){
        ctx.globalCompositeOperation='multiply';
        ctx.globalAlpha=0.6;
        ctx.fillStyle=cfg.tint;
        ctx.fillRect(px,py,dw,dh);
        ctx.globalCompositeOperation='source-over';
        ctx.globalAlpha=1;
      }
    }else if(cfg.type==='single'){
      const img=Assets.images[cfg.img];
      if(!img){this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);return;}
      ctx.save();
      if(flip){
        ctx.translate(x-this.cam.x+(dw+w)/2,py);
        ctx.scale(-1,1);
        ctx.drawImage(img,0,0,img.width,img.height,0,0,dw,dh);
      }else{
        ctx.drawImage(img,0,0,img.width,img.height,px,py,dw,dh);
      }
      ctx.restore();
    }else{
      this._drawEnemyFallback(type,state,frame,x,y,w,h,flip);
    }
  },

  // FALLBACK HERO DRAWING (programmatic pixel-art)
  _drawHeroFallback(type,state,frame,x,y,w,h,flip){
    const ctx=this.x;
    let px=x-this.cam.x,py=y-this.cam.y;
    const sc=(w/20);const ox=px+w/2;
    if(state==='idle'){py+=Math.sin(frame*0.1)*0.5*sc;}

    if(type==='kote'){
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+8*sc,6*sc,6*sc);
      ctx.fillStyle='#2a2a1a';ctx.fillRect(ox-2*sc,py+6*sc,4*sc,2*sc);
      ctx.fillStyle='#3a7a55';ctx.fillRect(ox-4*sc,py+15*sc,8*sc,8*sc);
      ctx.fillStyle='#4a4a2a';ctx.fillRect(ox-5*sc,py+23*sc,10*sc,6*sc);
      ctx.fillStyle='#1a1a0a';ctx.fillRect(ox-5*sc,py+29*sc,5*sc,4*sc);ctx.fillRect(ox,py+29*sc,5*sc,4*sc);
      if(state==='run'){const lf=Math.sin(frame*0.5)*2;ctx.fillRect(ox-3*sc,py+29*sc,3*sc,4*sc+lf);ctx.fillRect(ox,py+29*sc,3*sc,4*sc-lf);}
      if(state==='attack'||state==='skill'){ctx.fillStyle='#aaa';const da=flip?-8:8;ctx.fillRect(ox+da*sc,py+14*sc,2*sc,8*sc);}
      if(state==='dash'){ctx.globalAlpha=0.5;ctx.fillStyle='#3a7a55';ctx.fillRect(ox-6*sc,py+15*sc,12*sc,8*sc);ctx.globalAlpha=1;}
    }
    else if(type==='minerva'){
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+8*sc,6*sc,6*sc);
      ctx.fillStyle='#dd3333';ctx.fillRect(ox-2*sc,py+6*sc,4*sc,2*sc);
      ctx.fillStyle='#d4a830';ctx.fillRect(ox-5*sc,py+15*sc,10*sc,10*sc);
      ctx.fillStyle='#aaa';ctx.fillRect(ox-6*sc,py+14*sc,2*sc,4*sc);ctx.fillRect(ox+4*sc,py+14*sc,2*sc,4*sc);
      ctx.fillStyle='#4a4a2a';ctx.fillRect(ox-5*sc,py+25*sc,10*sc,6*sc);
      ctx.fillStyle='#1a1a0a';ctx.fillRect(ox-5*sc,py+31*sc,5*sc,4*sc);ctx.fillRect(ox,py+31*sc,5*sc,4*sc);
      if(state==='attack'||state==='skill'){ctx.fillStyle='#aaa';const da=flip?-10:10;ctx.fillRect(ox+da*sc,py+12*sc,3*sc,12*sc);}
    }
    else if(type==='elber'){
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+8*sc,6*sc,6*sc);
      ctx.fillStyle='#8a5a2a';ctx.fillRect(ox-2*sc,py+6*sc,4*sc,2*sc);
      ctx.fillStyle='#888888';ctx.fillRect(ox-1.5*sc,py+5*sc,3*sc,1.5*sc);
      ctx.fillStyle='#4a7a3a';ctx.fillRect(ox-5*sc,py+15*sc,10*sc,9*sc);
      ctx.fillStyle='#6a5a3a';ctx.fillRect(ox-3*sc,py+15*sc,6*sc,7*sc);
      ctx.fillStyle='#c8a830';ctx.fillRect(flip?ox-7*sc:ox+5*sc,py+16*sc,2*sc,6*sc);
      ctx.fillStyle='#4a4a2a';ctx.fillRect(ox-5*sc,py+24*sc,10*sc,7*sc);
      ctx.fillStyle='#1a1a0a';ctx.fillRect(ox-5*sc,py+31*sc,5*sc,4*sc);ctx.fillRect(ox,py+31*sc,5*sc,4*sc);
      ctx.fillStyle='#4a7a3a';ctx.globalAlpha=0.6;ctx.fillRect(ox-6*sc,py+20*sc,2*sc,8*sc);ctx.globalAlpha=1;
      if(state==='attack'||state==='skill'){ctx.fillStyle='#4f4';ctx.globalAlpha=0.7;for(let i=0;i<3;i++)ctx.fillRect(ox+(flip?-8-i*2:8+i*2)*sc,py+(16+i)*sc,1*sc,1*sc);ctx.globalAlpha=1;}
    }
    else if(type==='nesta'){
      ctx.fillStyle='#d0d0e0';ctx.fillRect(ox-2*sc,py+6*sc,4*sc,2*sc);
      ctx.fillStyle='#3a2a5a';ctx.beginPath();ctx.ellipse(ox,py+10*sc,4*sc,3*sc,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#1a0a3a';ctx.fillRect(ox-5*sc,py+15*sc,10*sc,11*sc);
      ctx.fillStyle='#c8a830';ctx.fillRect(ox-4*sc,py+24*sc,8*sc,1.5*sc);
      ctx.fillStyle='#a0a0c0';ctx.fillRect(ox-4*sc,py+16*sc,2*sc,6*sc);ctx.fillRect(ox+2*sc,py+16*sc,2*sc,6*sc);
      ctx.fillStyle='#4488ff';ctx.globalAlpha=0.5;for(let i=0;i<2;i++)ctx.fillRect(ox-3*sc+i*6*sc,py+(24+Math.sin(frame)*2)*sc,1*sc,3*sc);ctx.globalAlpha=1;
      if(state==='attack'||state==='skill'){ctx.fillStyle='#4488ff';ctx.globalAlpha=0.8;const da=flip?-8:8;ctx.fillRect(ox+da*sc,py+16*sc,2*sc,8*sc);ctx.globalAlpha=1;}
    }
    else if(type==='nick'){
      ctx.fillStyle='#d0a066';ctx.fillRect(ox-3*sc,py+8*sc,6*sc,6*sc);
      ctx.fillStyle='#e8e8f0';ctx.fillRect(ox-2*sc,py+6*sc,4*sc,2*sc);
      ctx.fillStyle='#c8a830';ctx.globalAlpha=0.4;ctx.beginPath();ctx.arc(ox,py+5*sc,4*sc,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
      ctx.fillStyle='#1a1a3a';ctx.fillRect(ox-5*sc,py+15*sc,10*sc,10*sc);
      ctx.fillStyle='#6a4a2a';ctx.fillRect(ox-5*sc,py+25*sc,10*sc,6*sc);
      ctx.fillStyle='#1a1a0a';ctx.fillRect(ox-5*sc,py+31*sc,5*sc,4*sc);ctx.fillRect(ox,py+31*sc,5*sc,4*sc);
      ctx.fillStyle='#aabbff';ctx.globalAlpha=0.4;
      ctx.beginPath();ctx.ellipse(ox-6*sc,py+16*sc,2*sc,4*sc,-0.3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(ox+6*sc,py+16*sc,2*sc,4*sc,0.3,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
      ctx.fillStyle='#aaa';ctx.fillRect(ox-5*sc,py+16*sc,1.5*sc,6*sc);ctx.fillRect(ox+3.5*sc,py+16*sc,1.5*sc,6*sc);
      ctx.fillStyle='#ffaa44';ctx.globalAlpha=0.6;ctx.fillRect(ox+3.5*sc,py+16*sc,1.5*sc,6*sc);ctx.globalAlpha=1;
      ctx.fillStyle='#44ff88';ctx.globalAlpha=0.6;ctx.fillRect(ox-5*sc,py+16*sc,1.5*sc,6*sc);ctx.globalAlpha=1;
      if(state!=='attack'&&state!=='skill'){
        ctx.fillStyle='#b8a080';ctx.fillRect(ox+6*sc,py+27*sc,2*sc,2*sc);
        ctx.fillStyle='#333';ctx.fillRect(ox+6.3*sc,py+27.3*sc,0.5*sc,0.5*sc);ctx.fillRect(ox+7.2*sc,py+27.3*sc,0.5*sc,0.5*sc);
      }
      if(state==='attack'||state==='skill'){ctx.fillStyle='#44ff88';ctx.globalAlpha=0.8;const da=flip?-8:8;ctx.fillRect(ox+da*sc,py+16*sc,2*sc,8*sc);ctx.globalAlpha=1;}
    }
    else{
      // Generic NPC fallback - hooded figure
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+8*sc,6*sc,6*sc);
      ctx.fillStyle='#555';ctx.fillRect(ox-5*sc,py+15*sc,10*sc,10*sc);
      ctx.fillStyle='#333';ctx.fillRect(ox-5*sc,py+25*sc,10*sc,6*sc);
      ctx.fillStyle='#1a1a0a';ctx.fillRect(ox-5*sc,py+31*sc,5*sc,4*sc);ctx.fillRect(ox,py+31*sc,5*sc,4*sc);
    }
  },

  // FALLBACK ENEMY DRAWING (programmatic pixel-art)
  _drawEnemyFallback(type,state,frame,x,y,w,h,flip){
    const ctx=this.x,px=x-this.cam.x,py=y-this.cam.y;
    const sc=(w/30);const ox=px+w/2;

    if(type==='bakaris'){
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+6*sc,6*sc,6*sc);
      ctx.fillStyle='#ffff88';ctx.fillRect(ox-2*sc,py+4*sc,4*sc,2*sc);
      ctx.fillStyle='#dd3333';ctx.fillRect(ox-7*sc,py+13*sc,14*sc,3*sc);
      ctx.fillStyle='#8a6a4a';ctx.fillRect(ox-5*sc,py+14*sc,10*sc,10*sc);
      ctx.fillStyle='#1a1a0a';ctx.fillRect(ox-5*sc,py+24*sc,10*sc,5*sc);
      if(state==='attack'||state==='skill'){ctx.fillStyle='#aaa';const da=flip?-8:8;ctx.fillRect(ox+da*sc,py+14*sc,1.5*sc,10*sc);}
    }
    else if(type==='student'){
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+6*sc,6*sc,5*sc);
      ctx.fillStyle='#553322';ctx.fillRect(ox-2*sc,py+4*sc,4*sc,2*sc);
      ctx.fillStyle='#4a5a8a';ctx.fillRect(ox-5*sc,py+12*sc,10*sc,12*sc);
      ctx.fillStyle='#c8a84e';ctx.fillRect(ox-5*sc,py+12*sc,10*sc,2*sc);
      ctx.fillStyle='#2a2a3a';ctx.fillRect(ox-4*sc,py+24*sc,3.5*sc,6*sc);ctx.fillRect(ox+0.5*sc,py+24*sc,3.5*sc,6*sc);
      ctx.fillStyle='#1a1a1a';ctx.fillRect(ox-4*sc,py+28*sc,3.5*sc,3*sc);ctx.fillRect(ox+0.5*sc,py+28*sc,3.5*sc,3*sc);
      if(state==='attack'||state==='hit'){ctx.fillStyle='#888';const da=flip?-7:7;ctx.fillRect(ox+da*sc,py+14*sc,1*sc,9*sc);}
    }
    else if(type==='darkmantle'){
      const px2=ox;ctx.fillStyle='#442266';ctx.beginPath();ctx.ellipse(px2,py+w/3,w/3,w/4,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#88ff88';ctx.fillRect(px2-4*sc,py+w/4-2*sc,3*sc,3*sc);ctx.fillRect(px2+1*sc,py+w/4-2*sc,3*sc,3*sc);
      ctx.strokeStyle='#332244';ctx.lineWidth=1;
      for(let i=0;i<6;i++){const tx=px2-10*sc+i*3.5*sc;ctx.beginPath();ctx.moveTo(tx,py+w/3);ctx.quadraticCurveTo(tx+Math.sin(frame+i)*2*sc,py+w/3+w/4,tx,py+w);ctx.stroke();}
      ctx.fillStyle='#6644aa';ctx.globalAlpha=0.6;ctx.beginPath();ctx.ellipse(px2-w/3.5,py+w/2.5,w/5,w/6,0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(px2+w/3.5,py+w/2.5,w/5,w/6,-0.3,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    }
    else if(type==='draconian'||type==='draconian_sivak'||type==='draconian_kapak'||type==='draconian_bozak'){
      let bodyCol='#6a8844',headCol='#8a9a55',wingCol='#446633';
      if(type==='draconian_sivak'){bodyCol='#a8b8c8';headCol='#c0d0e0';wingCol='#8090a0';}
      else if(type==='draconian_kapak'){bodyCol='#b87333';headCol='#c88040';wingCol='#a06020';}
      else if(type==='draconian_bozak'){bodyCol='#cd7f32';headCol='#dda040';wingCol='#b06020';}
      ctx.fillStyle=bodyCol;ctx.fillRect(ox-w/4,py+w/3,w/2,w/2.5);
      ctx.fillStyle=headCol;ctx.beginPath();ctx.ellipse(ox,py+w/6,w/3.5,w/5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#555';ctx.fillRect(ox-w/6,py+w/8,w/3,w/12);
      ctx.fillStyle='#333';ctx.fillRect(ox-w/5,py+w/5.5,w/6,w/8);ctx.fillRect(ox+w/15,py+w/5.5,w/6,w/8);
      ctx.fillStyle=wingCol;ctx.globalAlpha=0.7;ctx.beginPath();ctx.ellipse(ox-w/3.5,py+w/3,w/6,w/4,-0.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(ox+w/3.5,py+w/3,w/6,w/4,0.4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle=bodyCol;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox+w/3,py+w/2);ctx.quadraticCurveTo(ox+w/2+Math.cos(frame)*3,py+w/2.5,ox+w/2,py+w);ctx.stroke();
    }
    else if(type==='spectator'){
      ctx.fillStyle='#dd6644';ctx.beginPath();ctx.arc(ox,py+w/2,w/2.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ox+Math.sin(frame)*w/6,py+w/2,w/5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.fillRect(ox+Math.sin(frame)*w/6-1,py+w/2-1,2,2);
      ctx.strokeStyle='#dd6644';ctx.lineWidth=2;
      for(let i=0;i<4;i++){const a=Math.PI/2.5+i*Math.PI/3;ctx.beginPath();ctx.moveTo(ox,py+w/2);const ex=ox+Math.cos(a)*(w/2.2)+Math.cos(frame+i)*2;const ey=py+w/2+Math.sin(a)*(w/2.2)+Math.sin(frame+i)*2;ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle='#88ff88';ctx.fillRect(ex-1.5,ey-1.5,3,3);}
      ctx.fillStyle='#333';ctx.beginPath();ctx.ellipse(ox,py+w/1.8,w/3,w/8,0,0,Math.PI);ctx.fill();
    }
    else if(type==='lib_cataloguer'){
      ctx.fillStyle='#c8a866';ctx.fillRect(ox-3*sc,py+6*sc,6*sc,5*sc);
      ctx.fillStyle='#443355';ctx.fillRect(ox-2*sc,py+4*sc,4*sc,2*sc);
      ctx.fillStyle='#6644aa';ctx.fillRect(ox-6*sc,py+12*sc,12*sc,12*sc);
      ctx.fillStyle='#8866cc';ctx.fillRect(ox-6*sc,py+12*sc,12*sc,3*sc);
      ctx.fillStyle='#2a2a3a';ctx.fillRect(ox-4*sc,py+24*sc,3.5*sc,6*sc);ctx.fillRect(ox+0.5*sc,py+24*sc,3.5*sc,6*sc);
      if(state==='attack'||state==='hit'){ctx.fillStyle='#aaa';const da=flip?-7:7;ctx.fillRect(ox+da*sc,py+14*sc,1*sc,9*sc);}
    }
    else if(type==='mimic'){
      let sx2=x-this.cam.x, sy2=y-this.cam.y, cx2=sx2+w/2, cy2=sy2+h/2;
      let glow=0.5+0.5*Math.sin(performance.now()/300);
      ctx.save(); ctx.translate(cx2,cy2);
      ctx.rotate(Math.sin(performance.now()/700)*0.25);
      ctx.fillStyle=`rgba(190,225,255,${0.7+0.3*glow})`;
      ctx.fillRect(-4,-h*0.45,8,h*0.7);
      ctx.fillStyle='rgba(255,255,255,0.95)';
      ctx.fillRect(-1,-h*0.45,2,h*0.7);
      ctx.fillStyle='#c8a040';
      ctx.fillRect(-14,h*0.1,28,6);
      ctx.beginPath();ctx.arc(0,h*0.32,6,0,Math.PI*2);
      ctx.fillStyle='#c8a040';ctx.fill();
      let gg=ctx.createRadialGradient(0,0,2,0,0,22);
      gg.addColorStop(0,`rgba(100,180,255,${glow*0.35})`);
      gg.addColorStop(1,'rgba(100,180,255,0)');
      ctx.fillStyle=gg;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    else if(type==='ogre'){
      ctx.fillStyle='#776655';ctx.fillRect(ox-w/2.5,py+w/4,w*2/2.5,w/1.6);
      ctx.fillStyle='#666644';ctx.beginPath();ctx.ellipse(ox,py+w/8,w/2.5,w/3.5,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#333';ctx.fillRect(ox-w/6,py+w/10,w/3,w/8);
      ctx.fillStyle='#222';ctx.fillRect(ox-w/4,py,w/12,w/8);ctx.fillRect(ox+w/8,py,w/12,w/8);
      ctx.fillStyle='#776655';ctx.fillRect(ox-w/2.2,py+w/3,w/4.5,w/2);ctx.fillRect(ox+w/2.2-w/4.5,py+w/3,w/4.5,w/2);
      ctx.fillStyle='#666644';ctx.fillRect(ox-w/3,py+w/1.8,w/4,w/2.5);ctx.fillRect(ox+w/12,py+w/1.8,w/4,w/2.5);
      if(state==='attack'||state==='skill'){ctx.fillStyle='#6a5a3a';const da=flip?-w/2:w/2;ctx.fillRect(ox+da,py+w/4,w/6,w*0.7);ctx.fillStyle='#aaa';ctx.fillRect(ox+da+w/12,py+w/4-w/8,w/12,w/8);}
    }
    else if(type==='boilerdrak'){
      ctx.fillStyle='#888899';ctx.fillRect(ox-w/2.5,py+w/3.5,w/1.5,w/2);
      ctx.fillStyle='#666677';ctx.beginPath();ctx.ellipse(ox-w/2,py+w/6,w/3,w/4,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ff8844';ctx.fillRect(ox-w/2.5,py+w/8,w/8,w/8);ctx.fillRect(ox-w/2.5+w/4,py+w/8,w/8,w/8);
      ctx.fillStyle='#555555';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(ox-w/4+i*w/4,py+w/2,w/12,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle='#999';ctx.globalAlpha=0.5;ctx.fillRect(ox+w/4,py+w/5,w/8,w/8);ctx.globalAlpha=1;
      ctx.strokeStyle='#666677';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ox+w/1.8,py+w/2);ctx.quadraticCurveTo(ox+w/1.5,py+w/2.5,ox+w/1.3,py+w);ctx.stroke();
      ctx.fillStyle='#555555';ctx.beginPath();ctx.arc(ox+w/1.3,py+w,w/10,0,Math.PI*2);ctx.fill();
    }
    else if(type==='kansaldi'){
      ctx.fillStyle='#1a0a0a';ctx.fillRect(ox-w/2.2,py+w/4,w/1.1,w/1.8);
      ctx.fillStyle='#ff8844';ctx.fillRect(ox-w/4,py+w/6,w/6,w/6);ctx.fillRect(ox+w/8,py+w/6,w/6,w/6);
      ctx.fillStyle='#ffaa44';ctx.globalAlpha=0.7;ctx.fillRect(ox-w/4,py+w/6,w/6,w/6);ctx.fillRect(ox+w/8,py+w/6,w/6,w/6);ctx.globalAlpha=1;
      ctx.fillStyle='#aa2222';ctx.globalAlpha=0.8;ctx.fillRect(ox+w/1.8,py+w/3.5,w/3.5,w/1.5);ctx.globalAlpha=1;
      if(state==='attack'||state==='skill'){ctx.fillStyle='#ff4444';const da=flip?-w/2:w/2;ctx.fillRect(ox+da,py+w/5,w/12,w*0.8);ctx.fillStyle='#ffaa44';ctx.globalAlpha=0.6;ctx.fillRect(ox+da,py+w/5,w/12,w*0.8);ctx.globalAlpha=1;}
    }
    else if(type==='goblin'){
      ctx.fillStyle='#4a8a4a';ctx.fillRect(ox-w/4,py+w/2.5,w/2,w/2.2);
      ctx.fillStyle='#333';ctx.fillRect(ox-w/6,py+w/3,w/3,w/6);
      ctx.fillStyle='#ffff88';ctx.fillRect(ox-w/5.5,py+w/3.2,w/6,w/5);ctx.fillRect(ox+w/12,py+w/3.2,w/6,w/5);
      if(state==='attack'||state==='skill'){ctx.fillStyle='#aaa';const da=flip?-w/3:w/3;ctx.fillRect(ox+da,py+w/2.5,w/12,w/2);}
    }
    else if(type==='gauntlet'){
      let cx2=ox, cy2=py+h/2;
      let gl=0.5+0.5*Math.sin(performance.now()/250);
      ctx.save(); ctx.translate(cx2,cy2);
      ctx.rotate(Math.sin(performance.now()/500)*0.2);
      ctx.fillStyle='rgba(160,80,255,'+(0.8+0.2*gl)+')';
      ctx.fillRect(-w*0.35,-h*0.45,w*0.7,h*0.7);
      for(let fi=0;fi<4;fi++){
        ctx.fillStyle='rgba(200,120,255,'+gl+')';
        ctx.fillRect(-w*0.3+fi*w*0.18,-h*0.45,w*0.14,h*0.2);
      }
      let gg=ctx.createRadialGradient(0,0,2,0,0,w);
      gg.addColorStop(0,'rgba(160,0,255,'+(gl*0.4)+')');
      gg.addColorStop(1,'rgba(160,0,255,0)');
      ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(0,0,w,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    else if(type==='animated_sword'){
      let cx3=ox, cy3=py+h/2;
      let sw=0.5+0.5*Math.sin(performance.now()/200);
      ctx.save(); ctx.translate(cx3,cy3);
      ctx.rotate(Math.sin(performance.now()/400)*0.4+Math.PI/6);
      ctx.fillStyle='rgba(200,210,220,'+(0.85+0.15*sw)+')';
      ctx.fillRect(-2,-h*0.5,4,h*0.7);
      ctx.fillStyle='rgba(255,255,255,0.9)';
      ctx.fillRect(-0.5,-h*0.5,1,h*0.7);
      ctx.fillStyle='#c8a040';
      ctx.fillRect(-8,h*0.15,16,3);
      ctx.fillStyle='#5a3a1a';
      ctx.fillRect(-2,h*0.18,4,h*0.2);
      ctx.fillStyle='#c8a040';
      ctx.beginPath();ctx.arc(0,h*0.4,3,0,Math.PI*2);ctx.fill();
      let sg=ctx.createRadialGradient(0,0,2,0,0,w*0.8);
      sg.addColorStop(0,'rgba(180,200,255,'+(sw*0.3)+')');
      sg.addColorStop(1,'rgba(180,200,255,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(0,0,w*0.8,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    else{
      // Unknown enemy: simple silhouette so nothing is ever invisible
      ctx.fillStyle='#663333';ctx.fillRect(ox-w/4,py+h*0.2,w/2,h*0.8);
      ctx.fillStyle='#aa4444';ctx.fillRect(ox-w/6,py+h*0.25,w/12,w/12);ctx.fillRect(ox+w/12,py+h*0.25,w/12,w/12);
    }
  }
};

// ═══ ANIMATED FX PLAYER ═══
const FX={
  active:[],
  play(key,x,y,size,flip,speed){
    const img=Assets.images[key];
    if(!img)return;
    const fH=img.height;
    const fW=fH;
    const numF=Math.max(1,Math.floor(img.width/fW));
    this.active.push({img,fW,fH,numF,frame:0,timer:0,x,y,size:size||fH,flip:!!flip,speed:speed||0.05});
  },
  up(dt){
    this.active=this.active.filter(f=>{
      f.timer+=dt;
      if(f.timer>=f.speed){f.timer=0;f.frame++;}
      return f.frame<f.numF;
    });
  },
  draw(){
    const ctx=R.x;
    this.active.forEach(f=>{
      const px=f.x-R.cam.x-f.size/2,py=f.y-R.cam.y-f.size/2;
      ctx.save();
      if(f.flip){
        ctx.translate(f.x-R.cam.x+f.size/2,py);
        ctx.scale(-1,1);
        ctx.drawImage(f.img,f.frame*f.fW,0,f.fW,f.fH,0,0,f.size,f.size);
      }else{
        ctx.drawImage(f.img,f.frame*f.fW,0,f.fW,f.fH,px,py,f.size,f.size);
      }
      ctx.restore();
    });
  }
};

// ═══ PARTICLES ═══
const P={ps:[],
  emit(x,y,n,col,sp,lf,sz){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*sp;this.ps.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,l:lf,ml:lf,c:col,s:sz||2})}},
  up(dt){this.ps=this.ps.filter(p=>{p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=0.08*dt*60;p.l-=dt;return p.l>0})},
  draw(){this.ps.forEach(p=>{R.a(Math.max(0,p.l/p.ml));R.rect(p.x,p.y,p.s,p.s,p.c)});R.ra()}
};

// ═══ TILEMAP ═══
class TM{
  constructor(w,h){this.w=w;this.h=h;this.d=new Uint8Array(w*h)}
  set(x,y,v){if(x>=0&&x<this.w&&y>=0&&y<this.h)this.d[y*this.w+x]=v}
  get(x,y){if(x<0||x>=this.w)return 1;if(y<0)return 0;if(y>=this.h)return 1;return this.d[y*this.w+x]}
  sol(x,y){const v=this.get(x,y);return v>=1&&v<=5}
  // Solid check excluding one-way platforms (tile 3): used for ceilings/walls
  solUp(x,y){const v=this.get(x,y);return v>=1&&v<=5&&v!==3}

  draw(tilesetKey){
    const timg=Assets.images[tilesetKey];
    const sx=Math.max(0,(R.cam.x/T)|0),sy=Math.max(0,(R.cam.y/T)|0);
    const ex=Math.min(this.w,sx+((CW/T)|0)+2),ey=Math.min(this.h,sy+((CH/T)|0)+2);
    for(let y=sy;y<ey;y++)for(let x=sx;x<ex;x++){
      const v=this.get(x,y);
      const dx=x*T-R.cam.x,dy=y*T-R.cam.y;
      if(timg){
        if(v===0){
          const tx=((x*7+y*3)%6)*T, ty=((x*3+y*7)%2)*T;
          R.x.drawImage(timg,tx,ty,T,T,dx,dy,T,T);
          R.x.fillStyle='rgba(0,0,10,0.55)';R.x.fillRect(dx,dy,T,T);
        }else if(v===1){
          const tx=((x*5+y*11)%8)*T;
          R.x.drawImage(timg,tx,0,T,T,dx,dy,T,T);
        }else if(v===2){
          const tx=((x*3+y*7)%8)*T;
          R.x.drawImage(timg,tx,T,T,T,dx,dy,T,T);
        }else if(v===3){
          const tx=((x*11+y*5)%6)*T;
          R.x.drawImage(timg,tx,T*2,T,T,dx,dy,T,T);
        }else if(v===4){
          R.x.drawImage(timg,0,T*4,T,T,dx,dy,T,T);
        }else if(v===5){
          const tx=((x*3+y)%4)*T;
          R.x.drawImage(timg,tx,T*3,T,T,dx,dy,T,T);
        }
      }else{
        const cols={0:'#1a1a2a',1:'#4a4a6a',2:'#3a3a5a',3:'#5a4a3a',4:'#c8a84e',5:'#6a4a3a'};
        R.x.fillStyle=cols[v]||'#222';R.x.fillRect(dx,dy,T,T);
      }
    }
  }
}

// ═══ ENTITY BASE ═══
class Ent{
  constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h;this.vx=0;this.vy=0;this.gnd=false;this.rt=true;this.hp=100;this.mhp=100;this.on=true;this.inv=0;this.animFrame=0}
  hits(o){return this.x<o.x+o.w&&this.x+this.w>o.x&&this.y<o.y+o.h&&this.y+this.h>o.y}
  // Snap entity down to the nearest STANDABLE surface: solid tile with
  // enough clear tiles above for the entity's body. The old version snapped
  // to the first solid row it saw, which could bury a spawn inside a tower.
  snapGnd(tm){
    const bx1=Math.floor((this.x+4)/T),bx2=Math.floor((this.x+this.w-4)/T);
    const bodyRows=Math.ceil(this.h/T);
    let startY=Math.max(0,Math.floor(this.y/T));
    for(let y=startY;y<tm.h;y++){
      if(!(tm.sol(bx1,y)||tm.sol(bx2,y)))continue;
      let clear=true;
      for(let r=1;r<=bodyRows&&clear;r++){
        if(tm.solUp(bx1,y-r)||tm.solUp(bx2,y-r))clear=false;
      }
      if(clear){this.y=y*T-this.h;this.gnd=true;this.vy=0;return}
    }
  }
  onSolid(tm){
    const bx1=Math.floor((this.x+4)/T),bx2=Math.floor((this.x+this.w-4)/T);
    const by=Math.floor((this.y+this.h)/T);
    return tm.sol(bx1,by)||tm.sol(bx2,by);
  }
  blockedH(tm,dx){
    const nx=this.x+dx;
    const tx=dx>0?Math.floor((nx+this.w-2)/T):Math.floor((nx+2)/T);
    // Sample head, middle and feet so tall entities can't clip through
    // single-tile walls at torso height. Platforms (solUp) never block.
    const ty1=Math.floor((this.y+4)/T);
    const ty2=Math.floor((this.y+this.h/2)/T);
    const ty3=Math.floor((this.y+this.h-2)/T);
    return tm.solUp(tx,ty1)||tm.solUp(tx,ty2)||tm.solUp(tx,ty3);
  }
  blockedUp(tm){
    const tx1=Math.floor((this.x+4)/T),tx2=Math.floor((this.x+this.w-4)/T);
    const ty=Math.floor((this.y-1)/T);
    return tm.solUp(tx1,ty)||tm.solUp(tx2,ty);
  }
  mv(tm){
    if(this.vx!==0){
      if(!this.blockedH(tm,this.vx))this.x+=this.vx;
      else{
        if(this.vx>0)this.x=Math.floor((this.x+this.w-2)/T)*T-(this.w-2);
        else this.x=Math.ceil((this.x+2)/T)*T-2;
        this.vx=0;
      }
    }
    if(this.vy<0){
      if(this.blockedUp(tm)){this.vy=0;this.y=Math.ceil(this.y/T)*T}
      else this.y+=this.vy;
      this.gnd=false;
    }else if(this.vy>0){
      if(this.onSolid(tm)){
        this.y=Math.floor((this.y+this.h)/T)*T-this.h;
        this.vy=0;this.gnd=true;
      }else{
        this.y+=this.vy;this.gnd=false;
      }
    }else{
      // vy===0: just re-check support. Gravity is applied exactly once per
      // frame by the owner's update() — never here (old code double-applied).
      this.gnd=this.onSolid(tm);
    }
  }
  hurt(n){if(this.inv>0)return;this.hp-=n;this.inv=0.4;P.emit(this.x+this.w/2,this.y+this.h/2,8,'#f44',4,0.4,2);if(this.hp<=0){this.hp=0;this.die()}}
  die(){this.on=false;P.emit(this.x+this.w/2,this.y+this.h/2,15,'#f44',5,0.6,3)}
}

// ═══ HERO ═══
class Hero extends Ent{
  constructor(nm,x,y,col,customType){
    super(x,y,20,36);
    this.nm=nm;this.col=col;this.customType=customType;
    this.spd=2.1;this.jf=-9;this.ctrl=false;
    this.st='idle';this.atkT=0;this.atkCD=0;this.dashCD=0;this.dshT=0;
    this.atkDmg=24;this.skillCD=0;this.skillT=0;
    this.jumps=0;this.maxJumps=2;
    this.animFrame=0;this.animTimer=0;
    this._swingHit=new Set(); // enemies already damaged by the current swing
  }
  update(dt,tm){
    if(!this.on)return;
    if(this.inv>0)this.inv-=dt;
    if(this.atkCD>0)this.atkCD-=dt;
    if(this.dashCD>0)this.dashCD-=dt;
    if(this.skillCD>0)this.skillCD-=dt;

    if(!this._underwater)this.vy=Math.min(this.vy+GR,MF);
    else{this.vx*=0.88;this.vy*=0.88;}

    if(this.gnd)this.jumps=0;

    if(!this.ctrl){
      this.vx=0;
      this.st='idle';
      this.animTimer+=dt;
      if(this.animTimer>=0.08){this.animTimer=0;this.animFrame=(this.animFrame+1)%4}
      this.mv(tm);
      return;
    }

    let mov=false;
    const dashing=this.dshT>0;
    if(this.st!=='attack'&&this.st!=='skill'&&!dashing){
      if(I.down('ArrowLeft')||I.down('KeyA')){this.vx=-this.spd;this.rt=false;mov=true}
      else if(I.down('ArrowRight')||I.down('KeyD')){this.vx=this.spd;this.rt=true;mov=true}
      else this.vx=0;

      if(this._underwater){
        if(I.down('ArrowUp')||I.down('KeyW')||I.down('Space'))this.vy=Math.max(this.vy-0.7,-5);
        if(I.down('ArrowDown')||I.down('KeyS'))this.vy=Math.min(this.vy+0.7,5);
      }else if((I.pr('ArrowUp')||I.pr('KeyW')||I.pr('Space'))&&this.jumps<this.maxJumps){
        this.vy=this.jf;this.gnd=false;this.jumps++;
        P.emit(this.x+this.w/2,this.y+this.h,8,'#d4c4a0',2.5,0.25,2.5);
        if(this.jumps>1)P.emit(this.x+this.w/2,this.y+this.h,6,this.col,2,0.2,1);
      }
      if((I.pr('KeyZ')||I.pr('KeyJ'))&&this.atkCD<=0){
        this.st='attack';this.atkCD=0.4;this.atkT=0.3;this.animFrame=0;this.animTimer=0;
        this._swingHit.clear();
        const ax=this.rt?this.x+this.w+8:this.x-8;
        const cfg=FXConfig.heroes[this.customType];
        if(cfg)FX.play(cfg.atk,ax,this.y+this.h*0.4,40,!this.rt,0.04);
        P.emit(ax,this.y+this.h*0.3,4,this.col,2,0.2,1.5);
        if(this._ranged)this._projFired=false;
      }
      if((I.pr('KeyQ')||I.pr('KeyL'))&&this.skillCD<=0){
        this._useSkill();
      }
      if(I.pr('KeyK')&&this.dashCD<=0){
        // Dash: sustained velocity for dashDur seconds (see dashing block below).
        this.dshT=this.dashDur||0.12;this.dashCD=0.6;
        this._dashDir=this.rt?1:-1;
        this.inv=Math.max(this.inv,(this.dashDur||0.12)+0.05);
        this.st='dash';
        FX.play(FXConfig.dash,this.x+this.w/2,this.y+this.h/2,32,this.rt,0.03);
      }
    }
    if(dashing){
      // Hold dash speed for the whole dash window instead of one frame.
      this.vx=(this._dashDir||1)*7;
      this.st='dash';
    }
    if(this.dshT>0){this.dshT-=dt;if(this.dshT<=0&&this.st==='dash')this.st='idle';}
    if(this._invis){this._invisTimer-=dt;if(this._invisTimer<=0)this._invis=false;}
    if(this._buffActive){
      this._buffTimer-=dt;
      if(this._buffTimer<=0){
        this._buffActive=false; this._buffCd=30.0;
        this.mhp=this._preBuffMaxHp; this.hp=Math.min(this.hp,this.mhp);
        this.atkDmg=this._preBuffDmg;
      }
    }
    if(this._buffCd>0) this._buffCd-=dt;

    // Ranged attack projectile firing
    if(this._ranged&&this.st==='attack'&&!this._projFired){
      this._projFired=true;
      const dir=this.rt?1:-1;
      const pSpd=this.customType==='elber'?5.4:9;
      const sc=G.sc;
      if(sc&&sc.projectiles!==undefined){
        sc.projectiles.push(new HeroProj(
          this.x+(this.rt?this.w+4:-4),
          this.y+this.h*0.35,
          dir*pSpd,0,
          this.atkDmg,
          this
        ));
        P.emit(this.x+(this.rt?this.w:0),this.y+this.h*0.35,6,'#88aaff',3,0.3,2);
      }
    }
    if(this.st!=='attack')this._projFired=false;
    // Ranged skill: fire stronger projectile
    if(this._ranged&&this.st==='skill'&&!this._skillProjFired){
      this._skillProjFired=true;
      const dir=this.rt?1:-1;
      const sc=G.sc;
      if(this.customType==='nesta'&&sc){
        let ne=sc.enemies;
        let tgt=ne&&ne.filter(e=>e.on).reduce((a,b)=>Math.abs(b.x-this.x)<Math.abs(a.x-this.x)?b:a,{x:this.x+(this.rt?500:-500),y:this.y});
        let dx2=tgt.x-this.x,dy2=tgt.y-this.y,dn2=Math.sqrt(dx2*dx2+dy2*dy2)||1;
        let mp=new MegaProj(this.x+this.w/2,this.y+this.h/2,(dx2/dn2)*3,(dy2/dn2)*3,Math.floor(this.atkDmg*(this._skillMult||2.8)));
        if(sc.megaProjs)sc.megaProjs.push(mp);
        P.emit(this.x+(this.rt?this.w:0),this.y+this.h*0.35,12,'#8800ff',5,0.6,3);
      }else{
        const sSpd=this.customType==='elber'?7.2:12;
        if(sc&&sc.projectiles!==undefined){
          sc.projectiles.push(new HeroProj(
            this.x+(this.rt?this.w+4:-4),
            this.y+this.h*0.35,
            dir*sSpd,0,
            Math.floor(this.atkDmg*(this._skillMult||2)),
            this
          ));
          P.emit(this.x+(this.rt?this.w:0),this.y+this.h*0.35,10,'#4488ff',4,0.5,3);
        }
      }
    }
    if(this.st!=='skill')this._skillProjFired=false;
    if(this.st==='attack'){this.atkT-=dt;if(this.atkT<=0){this.st='idle'}}
    else if(this.st==='skill'){this.skillT-=dt;if(this.skillT<=0){this.st='idle'}}
    else if(this.st==='dash'){/* handled above */}
    else if(!this.gnd&&this.vy<0){this.st='jump'}
    else if(!this.gnd){this.st='fall'}
    else if(mov){this.st='run'}
    else{this.st='idle'}

    this.animTimer+=dt;
    const frameCount={idle:4,run:6,jump:2,fall:2,attack:4,skill:6,dash:3}[this.st]||4;
    if(this.animTimer>=0.08){
      this.animTimer=0;
      if(this.st==='attack'||this.st==='skill'){
        if(this.animFrame<frameCount-1)this.animFrame++;
      }else{
        this.animFrame=(this.animFrame+1)%frameCount;
      }
    }

    const wasGnd=this.gnd;
    const _prevVy=this.vy;
    this.mv(tm);
    if(!wasGnd&&this.gnd&&this.vy===0){
      P.emit(this.x+this.w/2,this.y+this.h,10,'#c8b898',3,0.3,3);
      if(this.ctrl&&Math.abs(_prevVy)>6){if(G.sc){G.sc.shk=0.2;G.sc.shi=2;}}
    }

    // Camera follows the controlled hero
    const tx=this.x+this.w/2-CW/2,ty=this.y+this.h/2-CH/2;
    R.cam.x+=(tx-R.cam.x)*0.08;R.cam.y+=(ty-R.cam.y)*0.08;
  }
  _useSkill(){
    this.skillCD=3.0;
    this.animFrame=0;
    this.animTimer=0;
    const sx=this.x+this.w/2,sy=this.y+this.h/2;

    if(this._isBuff){
      if(!this._buffActive && !(this._buffCd>0)){
        this._buffActive=true; this._buffTimer=20.0;
        this._preBuffMaxHp=this.mhp; this._preBuffDmg=this.atkDmg;
        this.mhp*=2; this.hp=Math.min(this.hp+this._preBuffMaxHp,this.mhp);
        this.atkDmg*=2;
        P.emit(sx,sy,20,'#cc44cc',6,0.8,3);
        G._rings.push({x:sx,y:sy,r:5,life:0.6,col:'#ff88ff'});
        G._floats.push({x:this.x,y:this.y-30,txt:Lang.t('titan_form'),life:2.0,col:'#ff88ff'});
      }else{
        this.skillCD=0.3; // Don't burn the full cooldown while buff is running
      }
      return;
    }
    if(this._isHealer){
      this.st='skill';this.skillT=0.5;this._swingHit.clear();
      const amt=this._healAmt||25;
      const scene=G.sc;
      if(scene&&scene.heroes){
        scene.heroes.forEach(h=>{
          if(h.on&&h.hp>0){
            const prev=h.hp;
            h.hp=Math.min(h.mhp,h.hp+amt);
            const actual=h.hp-prev;
            const hx=h.x+h.w/2,hy=h.y;
            if(actual>0){
              P.emit(hx,hy,25,'#22ee66',5,1.0,3);
              P.emit(hx,hy,10,'#aaffcc',3,0.7,2);
              G._floats.push({x:hx,y:hy-8,txt:'+'+actual,life:1.4,col:'#22ee66'});
            }else{
              G._floats.push({x:hx,y:hy-8,txt:Lang.t('hp_full'),life:0.9,col:'#ffcc00'});
            }
          }
        });
      }
      P.emit(sx,sy,20,'#88ffaa',4,0.8,3);
      P.emit(sx,sy,15,'#ffffff',2,0.5,2);
      G._rings.push({x:sx,y:sy,r:5,life:0.8,col:'#22ee66'});
      G._rings.push({x:sx,y:sy,r:5,life:1.1,col:'#88ffaa'});
      if(G.sc)G.sc._healFlash=1.5;
      const cfg=FXConfig.heroes[this.customType];
      if(cfg)FX.play(cfg.skill,sx,sy,56,!this.rt,0.04);
    }else{
      this.st='skill';this.skillT=0.5;this._swingHit.clear();
      const cfg=FXConfig.heroes[this.customType];
      if(cfg)FX.play(cfg.skill,sx,sy,56,!this.rt,0.04);
      P.emit(sx,sy,8,this.col,4,0.5,3);
    }
  }
  atkBox(){
    if(this.st!=='attack'&&this.st!=='skill')return null;
    if(this.st==='skill'&&this._isHealer)return null;
    if(this._ranged&&this.st==='attack')return null;
    const r=this.st==='skill'?(this._skillRange||50):(this._atkRange||30);
    const dmg=this.st==='skill'?this.atkDmg*(this._skillMult||2):this.atkDmg;
    const box=this.rt?{x:this.x+this.w,y:this.y-4,w:r,h:this.h+8,dmg}:{x:this.x-r,y:this.y-4,w:r,h:this.h+8,dmg};
    box.owner=this;
    return box;
  }
  draw(){
    if(!this.on)return;if(this.inv>0&&((this.inv*12)|0)%2&&this.st!=='dash')return;
    if(this._buffActive){
      R.x.save();
      const bx=this.x+this.w/2-R.cam.x, by=this.y+this.h/2-R.cam.y;
      R.x.translate(bx,by);R.x.scale(2,2);R.x.translate(-bx,-by);
    }
    if(this._invis)R.x.globalAlpha=0.3;
    R.drawHero(this.customType,this.st,this.animFrame,this.x,this.y,this.w,this.h,!this.rt);
    if(this._invis)R.x.globalAlpha=1.0;
    if(this._buffActive) R.x.restore();
    if(this.ctrl)R.txt(this.nm,this.x+this.w/2-R.cam.x,this.y-8-R.cam.y,this.col,9,'center');
    if(this._buffActive){
      const bx2=this.x-R.cam.x,by2=this.y+this.h*1.5+4-R.cam.y,bw2=this.w;
      R.x.fillStyle='#00cc44';R.x.fillRect(bx2,by2,Math.round(bw2*this._buffTimer/20),5);
      R.x.strokeStyle='#ffffff';R.x.strokeRect(bx2,by2,bw2,5);
    }else if(this._buffCd>0){
      const bx2=this.x-R.cam.x,by2=this.y+this.h+2-R.cam.y,bw2=this.w;
      R.x.fillStyle='#666';R.x.fillRect(bx2,by2,Math.round(bw2*(1-this._buffCd/30)),5);
      R.x.strokeStyle='#aaa';R.x.strokeRect(bx2,by2,bw2,5);
    }
    if(this.ctrl&&this.skillCD>0){R.a(0.6);R.txt('Q:'+this.skillCD.toFixed(1)+'s',this.x+this.w/2-R.cam.x,this.y-18-R.cam.y,'#aaa',8,'center');R.ra()}
    if(this.ctrl&&!this.gnd&&this.jumps<this.maxJumps){R.a(0.5);R.txt('↑',this.x+this.w/2-R.cam.x,this.y-28-R.cam.y,'#8cf',10,'center');R.ra()}
  }
  applyStats(type){
    const s=HERO_STATS[type];
    if(!s)return;
    this.hp=s.hp;this.mhp=s.hp;
    if(G.heroHPs&&G.heroHPs[type]!==undefined){this.hp=Math.max(1,Math.min(G.heroHPs[type],this.mhp));}
    this.spd=s.spd;this.jf=s.jf;
    this.atkDmg=s.atkDmg;
    this._skillMult=s.skillMult||2;
    this._atkRange=s.atkRange||30;
    this._skillRange=s.skillRange||50;
    this.dashDur=s.dashDur||0.12;
    this._isHealer=s.isHealer||false;
    this._healAmt=s.healAmt||0;
    this._ranged=s.ranged||false;
    if(type==='minerva') this._isBuff=true;
    this._rUsed=false;
  }
}

// ═══ COMPANION (AI-controlled party member) ═══
class Companion{
  constructor(hero){this.hero=hero;this.followSpeed=hero.spd*0.85}
  update(dt,active,tm,enemies){
    if(!this.hero.on||this.hero.ctrl)return;
    if(!this._atkCD)this._atkCD=0;
    if(!this._atkT)this._atkT=0;
    this._atkCD=Math.max(0,this._atkCD-dt);
    this._atkT=Math.max(0,this._atkT-dt);
    if(this._atkT<=0&&this.hero.st==='attack')this.hero.st='idle';

    const offset=50+(this.hero._compIdx||0)*55;
    const dx=(active.x-offset*(active.rt?1:-1))-this.hero.x,dist=Math.abs(active.x-this.hero.x);
    if(dist>60+offset){
      this.hero.vx=(dx>0?1:-1)*(this.hero.spd||2.1)*0.85;
      this.hero.rt=dx>0;
      this.hero.st='run';
    }else if(dist>25){
      this.hero.vx=(dx>0?1:-1)*(this.hero.spd||2.1)*0.35;
      this.hero.st='run';
    }else{
      this.hero.vx=0;
      if(this._atkT<=0)this.hero.st='idle';
    }

    // Auto-jump when blocked or hero is above
    if(this.hero.gnd){
      if(Math.abs(this.hero.vx)>0.3){
        let nextX=this.hero.x+Math.sign(this.hero.vx)*(this.hero.w+2);
        let tileCol=Math.floor(nextX/T),tileRow=Math.floor((this.hero.y+this.hero.h-2)/T);
        if(tm&&tm.sol&&tm.sol(tileCol,tileRow))this.hero.vy=this.hero.jf||-9;
      }
      if(active.y<this.hero.y-32)this.hero.vy=this.hero.jf||-9;
    }

    // Auto-attack nearby enemies
    if(enemies&&this._atkCD<=0){
      const ne=enemies.find(e=>e.on&&Math.abs(e.x-this.hero.x)<80&&Math.abs(e.y-this.hero.y)<40);
      if(ne){
        this.hero.rt=(ne.x>this.hero.x);
        this.hero.st='attack';
        this._atkCD=0.8;
        this._atkT=0.3;
        const aDmg=Math.floor((this.hero.atkDmg||24)*0.6);
        const ax=this.hero.rt?this.hero.x+this.hero.w:this.hero.x-30;
        if(ne.x<ax+30&&ne.x+ne.w>ax&&ne.y<this.hero.y+this.hero.h+8&&ne.y+ne.h>this.hero.y-4){
          ne.hurt(aDmg);
          P.emit(ax,this.hero.y+this.hero.h*0.3,4,this.hero.col||'#888',2,0.2,1.5);
        }
      }
    }

    this.hero.animTimer+=dt;
    if(this.hero.animTimer>=0.08){
      this.hero.animTimer=0;
      const fc=this.hero.st==='run'?6:4;
      this.hero.animFrame=(this.hero.animFrame+1)%fc;
    }
    if(this.hero._underwater){
      this.hero.vx=(this.hero.vx||0)*0.88;
      this.hero.vy=(this.hero.vy||0)*0.88;
    }else{
      this.hero.vy=Math.min((this.hero.vy||0)+GR,MF);
    }
    this.hero.mv(tm);
  }
}

// ═══ ENEMY ═══
class Enem extends Ent{
  constructor(x,y,w,h,nm,col,hp,dmg,ai,customType){
    super(x,y,w,h);this.nm=nm;this.col=col;this.hp=hp;this.mhp=hp;this.dmg=dmg;this.ai=ai;
    this._aiOrig=ai; // Remembered so temporary states (charge/alert) can restore it
    this.dir=1;this.pt=0;this.akt=0;this.spd=0.7;this.ag=130;
    this.customType=customType;this.animFrame=0;this.animTimer=0;this.st='idle';
  }
  update(dt,tm,heroes){
    if(!this.on)return;
    if(this._slowTimer>0){this._slowTimer-=dt;if(this._slowTimer<=0){this._slowTimer=0;if(this._spdOrig){this.spd=this._spdOrig;this._spdOrig=null;}this._slowed=false;}}
    if(this.inv>0)this.inv-=dt;this.akt-=dt;
    // Charge-target override: enemy directly pursues the hero who hurt them.
    // Restores the original AI when it expires (never permanently rewrites it).
    if(this._chargeDur!==undefined){this._chargeDur-=dt;if(this._chargeDur<=0){this._chargeTarget=null;this._chargeDur=undefined;this.ai=this._aiOrig;}}
    if(this._chargeTarget){
      const ct=this._chargeTarget;
      if(!ct||!ct.on||ct.hp<=0){
        this._chargeTarget=null;this.ai=this._aiOrig;
      } else {
        const dx=ct.x-this.x;
        this.rt=dx>0;
        const spd=this._chargeSpeed||this.spd*1.6;
        // Charge respects walls (the old code teleported straight through them)
        if(!this.blockedH(tm,Math.sign(dx)*spd))this.x+=Math.sign(dx)*spd;
        this.st='run';
        if(Math.abs(dx)<this.w+ct.w+4&&Math.abs((ct.y+ct.h/2)-(this.y+this.h/2))<this.h&&this.akt<=0){
          ct.hurt(this.dmg);this.akt=1.0;this.st='attack';
          P.emit(ct.x+ct.w/2,ct.y+ct.h/2,6,'#ff4400',3,0.4,2);
        }
        this.vy=Math.min(this.vy+GR,MF);
        if(this.vy>0&&this.onSolid(tm)){
          this.y=Math.floor((this.y+this.h)/T)*T-this.h;this.vy=0;this.gnd=true;
        }else{this.y+=this.vy;this.gnd=false}
        this.animTimer+=dt;
        const frameCount={idle:4,run:6,attack:4}[this.st]||4;
        if(this.animTimer>=0.1){this.animTimer=0;this.animFrame=(this.animFrame+1)%frameCount}
        return;
      }
    }
    const h=heroes.find(h=>h.ctrl&&h.on)||heroes.find(h=>h.on);
    if(!h){this._applyGravity(tm,dt);return;}
    // Universal jump: leap up if a living hero is above and nearby
    if(this._jumpTimer===undefined&&!this.dead){
      if(this._jumpCool===undefined)this._jumpCool=0.5+Math.random()*1.5;
      this._jumpCool=Math.max(0,this._jumpCool-dt);
      if(this.gnd&&this._jumpCool<=0&&heroes){
        const above=heroes.find(hh=>hh.on&&hh.hp>0&&
          Math.abs(hh.x-this.x)<240&&hh.y<this.y-T*1.5&&hh.y>this.y-T*8);
        if(above){this.vy=this.jf||-9;this.gnd=false;this._jumpCool=2.5+Math.random()*2.0;}
      }
    }
    const dxh=Math.abs(this.x-h.x);
    if(this.ai==='boss'){
      this.vx=(h.x>this.x?1:-1)*this.spd*1.8;this.rt=this.vx>0;this.st='run';
      if(this.hits(h)&&this.akt<=0){h.hurt(this.dmg);this.akt=1.2;this.st='attack';
        P.emit(h.x+h.w/2,h.y+h.h/2,10,'#f66',5,0.3,3);P.emit(this.x+(this.rt?this.w:0),this.y+this.h*0.3,8,'#fa0',4,0.25,2);}
      // Phase 2 trigger (Bakaris-style)
      if(this._phase2===false&&this.hp<=this.mhp*0.5){
        this._phase2=true;
        this.spd*=1.4;
        P.emit(this.x+this.w/2,this.y+this.h/2,30,'#ff4400',8,1.0,4);
        P.emit(this.x+this.w/2,this.y+this.h/2,20,'#ffcc00',6,0.8,3);
        P.emit(this.x+this.w/2,this.y+this.h/2,15,'#ffffff',4,0.6,2);
      }
      // Projectile firing (Bakaris phase2 boss)
      if(this._projTimer!==undefined&&this.customType!=='boilerdrak'){
        this._projTimer-=dt;
        if(this._projTimer<=0&&this._phase2){
          this._projTimer=2.5;
          const dir=this.rt?1:-1;
          if(this._scene&&this._scene.projectiles){
            this._scene.projectiles.push(new Proj(
              this.x+(this.rt?this.w+2:-2),
              this.y+this.h*0.3,
              dir*4,-3,
              Math.floor(this.dmg*0.6)
            ));
          }
        }
      }
      // Boilerdrak ranged attack
      if(this.customType==='boilerdrak'&&this._projTimer!==undefined&&this._scene){
        this._projTimer-=dt;
        if(this._projTimer<=0){
          this._projTimer=3.0;
          const tgt=heroes.reduce((a,b)=>Math.abs(b.x-this.x)<Math.abs(a.x-this.x)?b:a);
          const dx2=tgt.x+tgt.w/2-this.x-this.w/2, dy2=tgt.y+tgt.h/2-this.y-this.h/2;
          const dist2=Math.sqrt(dx2*dx2+dy2*dy2)||1;
          const spd2=4;
          if(this._scene.projectiles)this._scene.projectiles.push(new Proj(this.x+this.w/2,this.y+this.h/2,dx2/dist2*spd2,dy2/dist2*spd2,18));
        }
      }
      // Platform jumping (Kapak-style)
      if(this._jumpTimer!==undefined){
        this._jumpTimer-=dt;
        if(this._jumpTimer<=0&&this.gnd){
          this._jumpTimer=2.0+Math.random()*1.5;
          this.vy=this.jf||-9;
          this.gnd=false;
        }
      }
      // AOE stomp (Sivak-style)
      if(this._stompTimer!==undefined){
        this._stompTimer-=dt;
        if(this._stompTimer<=0&&this.gnd){
          this._stompTimer=3.5;
          P.emit(this.x+this.w/2,this.y+this.h,20,'#ff6600',5,0.5,3);
          for(const hero of heroes){
            if(hero.on&&Math.abs(hero.x-this.x)<90)hero.hurt(Math.floor(this.dmg*0.7));
          }
        }
        if(this._enraged===false&&this.hp<=this.mhp*0.3){
          this._enraged=true;
          this.spd*=1.6;
          this.dmg=Math.floor(this.dmg*1.5);
          P.emit(this.x+this.w/2,this.y+this.h/2,30,'#ff4400',8,0.8,4);
        }
      }
    }else if(this.ai==='patrol'){
      this.pt+=dt;if(this.pt>2.5){this.dir*=-1;this.pt=0}
      this.vx=this.spd*this.dir;this.rt=this.dir>0;
      if(dxh<this.ag)this.ai='chase';
      this.st='run';
      this._scene&&this._scene.heroes&&this._scene.heroes.forEach(h=>{
        if(h.on&&!h._invis&&this.hits(h)&&this.akt<=0){h.hurt(this.dmg);this.akt=1;this.st='attack';
          P.emit(h.x+h.w/2,h.y+h.h/2,8,'#f44',4,0.25,2);
          this._maybeDarkZone();
        }
      });
    }else if(this.ai==='chase'){
      if(dxh>280){
        // Lost aggro: fall back to the ORIGINAL behaviour (a boss stays a boss)
        this.ai=this._aiOrig==='chase'?'patrol':this._aiOrig;
        this._applyGravity(tm,dt);
        this._animate(dt);
        return;
      }
      this.vx=(h.x>this.x?1:-1)*this.spd*1.4;this.rt=this.vx>0;
      this.st='run';
      if(!h._invis&&this.hits(h)&&this.akt<=0){h.hurt(this.dmg);this.akt=1;this.st='attack';
        P.emit(h.x+h.w/2,h.y+h.h/2,8,'#f44',4,0.25,2);
        this._maybeDarkZone();
      }
    }else if(this.ai==='static'){
      this.vx=0;this.st=dxh<60?'attack':'idle';
      if(this.hits(h)&&this.akt<=0){h.hurt(this.dmg);this.akt=1.2;
        P.emit(h.x+h.w/2,h.y+h.h/2,6,'#f44',3,0.2,2);
        this._maybeDarkZone();}
      // Teleport mechanic (Spectator-style)
      if(this._teleTimer!==undefined){
        this._teleTimer-=dt;
        if(this._teleTimer<=0&&dxh<(this._tpMinDist||80)){
          this._teleTimer=4.0;
          const offset=(Math.random()>0.5?1:-1)*(200+Math.random()*50);
          const maxX=tm?tm.w*T-100:1800;
          const newX=Math.max(50,Math.min(maxX,h.x+offset));
          this.x=newX;
          P.emit(this.x+this.w/2,this.y+this.h/2,12,'#9944ff',4,0.4,2);
        }
      }
      // Fire breath (Kansaldi-style)
      if(this._breathTimer!==undefined){
        this._breathTimer-=dt;
        if(this._breathTimer<=0&&!this._breathActive){
          this._breathTimer=6.0;
          this._breathActive=true;
          this._breathDur=1.2;
          P.emit(this.x+(this.rt?this.w:0),this.y+this.h*0.4,25,'#ff4400',8,0.5,3);
        }
        if(this._breathActive){
          this._breathDur-=dt;
          if(this._breathDur<=0)this._breathActive=false;
          else{
            const dir=this.rt?1:-1;
            const bx=this.x+(this.rt?this.w+4:-4);
            P.emit(bx,this.y+this.h*0.3,6,'#ff2200',6*(dir),0.4,4);
            P.emit(bx+dir*30,this.y+this.h*0.3,4,'#ff8800',5*(dir),0.3,3);
            P.emit(bx+dir*60,this.y+this.h*0.3,3,'#ffcc00',4*(dir),0.2,2);
            if(Math.random()<0.15){
              for(const hero of heroes){
                if(hero.on&&Math.abs(hero.x-this.x)<300)hero.hurt(8);
              }
            }
          }
        }
      }
    }

    // Underwater floating movement
    if(this._underwater){
      this.vy=Math.sin(performance.now()/800+(this._floatOffset||0))*60*dt;
      const tgt=heroes.find(hh=>hh.ctrl&&hh.on);
      if(tgt){let dy=tgt.y-this.y; this.vy+=Math.sign(dy)*30*dt;}
      this.vy=Math.max(-2,Math.min(2,this.vy));
      if(this.vx!==0&&!this.blockedH(tm,this.vx))this.x+=this.vx;
      else this.vx=0;
      this.y+=this.vy;this.gnd=false;
    }else{
      this.vy=Math.min(this.vy+GR,MF);
      if(this.vx!==0&&!this.blockedH(tm,this.vx))this.x+=this.vx;
      else this.vx=0;
      if(this.vy>0&&this.onSolid(tm)){
        this.y=Math.floor((this.y+this.h)/T)*T-this.h;this.vy=0;this.gnd=true;
      }else{this.y+=this.vy;this.gnd=false}
    }
    this.cull(tm);
    this._animate(dt);
  }
  _applyGravity(tm,dt){
    if(this._underwater)return;
    this.vy=Math.min(this.vy+GR,MF);
    if(this.vy>0&&this.onSolid(tm)){
      this.y=Math.floor((this.y+this.h)/T)*T-this.h;this.vy=0;this.gnd=true;
    }else{this.y+=this.vy;this.gnd=false}
  }
  _animate(dt){
    this.animTimer+=dt;
    const frameCount={idle:4,run:6,attack:4}[this.st]||4;
    if(this.animTimer>=0.1){this.animTimer=0;this.animFrame=(this.animFrame+1)%frameCount}
  }
  _maybeDarkZone(){
    if(this.customType==='darkmantle'&&!this._darkUsed&&this._scene&&this._scene._darkZones){
      this._darkUsed=true;
      this._scene._darkZones.push(new DarkZone(this.x+this.w/2,this.y+this.h/2));
    }
  }
  cull(tm){if(tm&&this.y>tm.h*T+200){this.on=false;}}
  hurt(n,source){
    if(this.inv>0)return;this.hp-=n;this.inv=0.4;P.emit(this.x+this.w/2,this.y+this.h/2,8,'#f44',4,0.4,2);
    // Retaliate: briefly charge whoever is nearest (temporary, AI restored after)
    if(this._scene&&this._scene.heroes&&this.ai!=='static'){
      const heroes=this._scene.heroes.filter(h=>h.on&&h.hp>0);
      if(heroes.length){
        const nearest=source&&source.on?source:heroes.reduce((a,b)=>Math.abs(b.x-this.x)<Math.abs(a.x-this.x)?b:a);
        this._chargeTarget=nearest;this._chargeSpeed=this.spd*1.8;this._chargeDur=1.5;
      }
    }
    if(this.hp<=0){this.hp=0;this.on=false;FX.play(FXConfig.enemyDeath,this.x+this.w/2,this.y+this.h/2,48,false,0.04);P.emit(this.x+this.w/2,this.y+this.h/2,15,this.col,5,0.6,3)}
  }
  draw(){
    if(!this.on)return;if(this.inv>0&&((this.inv*12)|0)%2)return;
    const cx=this.x+this.w/2,cy=this.y+this.h;
    R.drawEnemy(this.customType,this.st,this.animFrame,cx-this.w/2,cy-this.h,this.w,this.h,!this.rt);
    if(this._slowed){R.x.save();R.x.globalAlpha=0.35;R.x.fillStyle='#00ccff';R.x.fillRect(this.x-R.cam.x,this.y-R.cam.y,this.w,this.h);R.x.restore();}
    if(this.hp<this.mhp){R.rect(this.x,this.y-5,this.w,3,'#333');R.rect(this.x,this.y-5,this.w*(this.hp/this.mhp),3,this.hp/this.mhp>0.5?'#4a4':'#f44')}
    R.txt(this.nm,this.x+this.w/2-R.cam.x,this.y-9-R.cam.y,'#faa',8,'center');
  }
}

// ═══ NPC ═══
class NPC{
  constructor(x,y,nm,customType,dlgs){
    this.x=x;this.y=y;this.nm=nm;this.customType=customType;this.dlgs=dlgs;this.tk=false;
    this._frame=0;this._frameTimer=0;this._talked=false;
  }
  update(dt){
    this._frameTimer=(this._frameTimer||0)+dt;
    if(this._frameTimer>0.15){this._frameTimer=0;this._frame=((this._frame||0)+1)%4;}
  }
  draw(){
    const h=36;
    const sx=this.x-R.cam.x;
    R.drawHero(this.customType||'villager','idle',this._frame||0,this.x-10,this.y-h+10,20,h,false);
    R.txt(this.nm,sx,this.y-42-R.cam.y,'#aaa',8,'center');
    if(!this._talked){
      R.x.save();
      R.x.fillStyle='rgba(255,255,200,0.92)';
      R.x.font='10px monospace';
      R.x.fillText('[Z]',sx-8,this.y-h-2-R.cam.y);
      R.x.restore();
    }
  }
}

// ═══ DIALOGUE ═══
// Lines are Lang keys resolved at display time (so language switches apply).
const D={on:false,dlgs:[],idx:0,cb:null,_advance:false,
  show(dlgs,cb){
    this.dlgs=dlgs;this.idx=0;this.cb=cb;this.on=true;this._advance=false;
    document.getElementById('dlg').style.display='block';
    this.upd();
  },
  upd(){
    if(!this.on)return;
    const el=document.getElementById('dlg');
    el.style.display='block';
    const sp=el.querySelector('.sp');
    const tx=el.querySelector('.tx');
    if(this.idx<this.dlgs.length){
      const dlg=this.dlgs[this.idx];
      sp.textContent=dlg.sp?Lang.t(dlg.sp):'';
      tx.textContent=dlg.tx?Lang.t(dlg.tx):'';
    }
  },
  advance(){
    if(!this.on)return;
    this.idx++;
    if(this.idx>=this.dlgs.length){
      this.on=false;
      document.getElementById('dlg').style.display='none';
      if(this.cb)this.cb();
    }else{
      this.upd();
    }
  },
  up(dt){
    if(!this.on)return;
    if(I.pr('Space')||I.pr('Enter')||this._advance){
      this._advance=false;
      this.advance();
    }
  }
};

// ═══ DARK ZONE ═══
class DarkZone{
  constructor(x,y){this.x=x;this.y=y;this.r=320;this.life=15.0;}
  update(dt){this.life-=dt;}
  draw(ctx,cam,camY){
    if(this.life<=0)return;
    let sx=this.x-cam;
    let sy=this.y-(camY||0);
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,0.93)';
    ctx.beginPath();
    ctx.rect(0,0,CW,CH);
    ctx.arc(sx,sy,this.r,0,Math.PI*2,true);
    ctx.fill('evenodd');
    ctx.restore();
  }
}

// ═══ FOX FAMILIAR ═══
class Fox{
  constructor(x,y){this.x=x;this.y=y;this._flip=false;this._visible=false;this._bob=0;}
  update(dt,nesta){
    if(!nesta||!nesta.on){this._visible=false;return;}
    this._visible=true;
    let tx=nesta.x+(nesta.rt?-30:30),ty=nesta.y+nesta.h-12;
    let dx=tx-this.x,dy=ty-this.y;
    let spd=Math.min(200,Math.sqrt(dx*dx+dy*dy)*6);
    if(Math.abs(dx)>3){this.x+=Math.sign(dx)*Math.min(Math.abs(dx),spd*dt);this._flip=dx<0;}
    if(Math.abs(dy)>3)this.y+=Math.sign(dy)*Math.min(Math.abs(dy),spd*dt);
    this._bob+=dt;
  }
  draw(ctx,cam,camY){
    if(!this._visible)return;
    let sx=this.x-cam,sy=this.y-(camY||0)+Math.sin(this._bob*4)*1.5;
    ctx.save();
    if(this._flip){ctx.translate(sx*2,0);ctx.scale(-1,1);}
    ctx.fillStyle='#888';ctx.fillRect(sx-5,sy-3,10,7);
    let ta=Math.sin(this._bob*3)*0.5;
    ctx.save();ctx.translate(sx-5,sy+1);ctx.rotate(ta);
    ctx.fillStyle='#888';ctx.fillRect(-5,-3,6,6);
    ctx.fillStyle='#fff';ctx.fillRect(-6,-2,3,3);
    ctx.restore();
    ctx.fillStyle='#888';ctx.fillRect(sx+3,sy-7,7,6);
    ctx.fillStyle='#555';
    ctx.beginPath();ctx.moveTo(sx+4,sy-7);ctx.lineTo(sx+3,sy-11);ctx.lineTo(sx+7,sy-7);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.moveTo(sx+8,sy-7);ctx.lineTo(sx+9,sy-11);ctx.lineTo(sx+11,sy-7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(sx+8,sy-4,1,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';ctx.beginPath();ctx.arc(sx+10,sy-2,0.8,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
}

// ═══ SKELETON FAMILIAR ═══
class Skeleton{
  constructor(x,y){this.x=x;this.y=y;this._visible=false;this._bob=0;this._flip=false;}
  update(dt,nick){
    if(!nick||!nick.on){this._visible=false;return;}
    this._visible=true;
    this._bob+=dt*3;
    let tx=nick.x+(nick.rt?-32:32),ty=nick.y+nick.h-18;
    let dx=tx-this.x,dy=ty-this.y;
    let spd=Math.min(200,Math.sqrt(dx*dx+dy*dy)*6);
    if(Math.abs(dx)>3){this.x+=Math.sign(dx)*Math.min(Math.abs(dx),spd*dt);this._flip=dx<0;}
    if(Math.abs(dy)>3)this.y+=Math.sign(dy)*Math.min(Math.abs(dy),spd*dt);
  }
  draw(ctx,cam,camY){
    if(!this._visible)return;
    let sx=this.x-cam,sy=this.y-(camY||0)+Math.sin(this._bob*2)*1.5;
    let bob=Math.sin(this._bob*2)*1.5;
    ctx.save();
    if(this._flip){ctx.translate(sx*2,0);ctx.scale(-1,1);}
    ctx.fillStyle='#e8e8d0';
    ctx.beginPath();ctx.ellipse(sx,sy-13+bob,5,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#222';
    ctx.fillRect(sx-4,sy-15+bob,3,2);ctx.fillRect(sx+1,sy-15+bob,3,2);
    ctx.fillStyle='#e8e8d0';ctx.fillRect(sx-3,sy-8+bob,7,3);
    ctx.fillStyle='#222';ctx.fillRect(sx-2,sy-7+bob,2,2);ctx.fillRect(sx+1,sy-7+bob,2,2);
    ctx.fillStyle='#e8e8d0';ctx.fillRect(sx-1,sy-4+bob,2,9);
    ctx.fillRect(sx-5,sy-3+bob,10,2);ctx.fillRect(sx-4,sy,8,2);ctx.fillRect(sx-3,sy+3+bob,6,2);
    ctx.strokeStyle='#e8e8d0';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(sx-5,sy-3+bob);ctx.lineTo(sx-9,sy+2+bob);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+5,sy-3+bob);ctx.lineTo(sx+9,sy+2+bob);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx-1,sy+5+bob);ctx.lineTo(sx-4,sy+12+bob);ctx.stroke();
    ctx.beginPath();ctx.moveTo(sx+1,sy+5+bob);ctx.lineTo(sx+4,sy+12+bob);ctx.stroke();
    ctx.restore();
  }
}

// ═══ MEGA PROJECTILE (homing orb — Nesta/Elber/Nick ultimates) ═══
class MegaProj{
  constructor(x,y,vx,vy,dmg){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.dmg=dmg;
    this.on=true;this.r=20;this.life=4.0;
    this._phase=Math.random()*Math.PI*2;
  }
  update(dt,enemies){
    if(!this.on)return;
    this.x+=this.vx*dt*60;this.y+=this.vy*dt*60;
    this.life-=dt; if(this.life<=0){this.on=false;return;}
    if(enemies)enemies.forEach(e=>{
      if(!e.on)return;
      const rr=this._skelMega?26:24;
      if(Math.abs(e.x+e.w/2-this.x)<rr&&Math.abs(e.y+e.h/2-this.y)<rr){
        e.hurt(this.dmg);
        if(this._skelMega)P.emit(this.x,this.y,12,'#e8e8d0',4,0.5,2);
        if(this._amberSlow){e._spdOrig=e._spdOrig||e.spd;e.spd=e._spdOrig*0.4;e._slowed=true;e._slowTimer=3.0;}
        this.on=false;
      }
    });
  }
  draw(ctx,cam,camY){
    if(!this.on)return;
    const sx=this.x-cam,sy=this.y-(camY||0);
    if(this._amberSlow){
      const tt=performance.now()/300+this._phase;
      ctx.save();ctx.translate(sx,sy);
      const g2=ctx.createRadialGradient(0,0,2,0,0,20);
      g2.addColorStop(0,'rgba(100,220,255,0.9)');g2.addColorStop(0.5,'rgba(50,150,200,0.6)');g2.addColorStop(1,'rgba(0,80,150,0)');
      ctx.fillStyle=g2;ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();
      for(let i=0;i<6;i++){ctx.save();ctx.rotate(tt+i*Math.PI/3);ctx.strokeStyle='rgba(180,240,255,0.85)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-14);ctx.stroke();ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(4,-8);ctx.stroke();ctx.restore();}
      ctx.fillStyle='rgba(255,255,255,0.95)';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
      ctx.restore();return;
    }
    if(this._amber){
      const img=Assets.images['fx_elber_mega'];
      if(img){const fW=72,fH=32,nf=10,fi=Math.floor(performance.now()/80)%nf;
        ctx.save();ctx.translate(sx,sy);ctx.rotate(Math.atan2(this.vy,this.vx));
        ctx.drawImage(img,fi*fW,0,fW,fH,-36,-16,72,32);ctx.restore();}
      return;
    }
    if(this._skelMega){
      const img=Assets.images['fx_nick_bone'];
      if(img){const fW=32,fH=16,nf=8,fi=Math.floor(performance.now()/80)%nf;
        ctx.save();ctx.translate(sx,sy);ctx.rotate(performance.now()/400+this._phase);
        ctx.drawImage(img,fi*fW,0,fW,fH,-24,-12,48,24);ctx.restore();}
      return;
    }
    const img=Assets.images['fx_nesta_q'];
    if(img){const fW=96,fH=96,nf=9,fi=Math.floor(performance.now()/100)%nf;
      ctx.drawImage(img,fi*fW,0,fW,fH,sx-32,sy-32,64,64);}
  }
}

// ═══ HERO PROJECTILE ═══
class HeroProj{
  constructor(x,y,vx,vy,dmg,shooter){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.dmg=dmg;
    this.shooter=shooter;this.on=true;this.r=5;this.life=3.0;
    this._ownerType=(shooter&&shooter.customType)||'';
  }
  update(dt,tm,enemies){
    if(!this.on)return;
    this.life-=dt;
    if(this.life<=0){this.on=false;return}
    // dt-scaled so projectile speed is refresh-rate independent
    this.x+=this.vx*dt*60;this.y+=this.vy*dt*60;
    const tx=Math.floor(this.x/T),ty=Math.floor(this.y/T);
    if(tm&&tm.solUp&&tm.solUp(tx,ty)){
      this.on=false;P.emit(this.x,this.y,6,'#88aaff',3,0.3,2);return;
    }
    if(enemies){
      for(const e of enemies){
        if(e.on&&Math.abs(e.x+e.w/2-this.x)<18&&Math.abs(e.y+e.h/2-this.y)<18){
          // hurt() handles the retaliation charge; boss AI is never rewritten
          e.hurt(this.dmg,this.shooter);
          this.on=false;
          P.emit(this.x,this.y,10,'#4488ff',4,0.5,2.5);
          break;
        }
      }
    }
  }
  draw(){
    if(!this.on)return;
    const sx2=this.x-R.cam.x,sy2=this.y-R.cam.y;
    if(this._ownerType==='elber'){
      let gl=0.6+0.4*Math.sin(performance.now()/150);
      R.x.save();R.x.translate(sx2,sy2);R.x.rotate(Math.atan2(this.vy,this.vx));
      R.x.fillStyle='rgba(255,190,40,'+gl+')';R.x.shadowColor='#ff8800';R.x.shadowBlur=10;
      R.x.beginPath();R.x.moveTo(0,-5);R.x.lineTo(9,0);R.x.lineTo(0,5);R.x.lineTo(-9,0);R.x.closePath();R.x.fill();
      R.x.shadowBlur=0;R.x.restore();
    }else if(this._ownerType==='nesta'){
      const img=Assets.images['fx_nesta_proj'];
      if(img){const fW=48,fH=48,nf=26,fi=Math.floor(performance.now()/50)%nf;R.x.drawImage(img,fi*fW,0,fW,fH,sx2-24,sy2-24,48,48);}
    }else if(this._col==='#ff6600'){
      const img=Assets.images['fx_kote_barrage'];
      if(img){const fW=48,fH=32,nf=8,fi=Math.floor(performance.now()/60)%nf;R.x.drawImage(img,fi*fW,0,fW,fH,sx2-24,sy2-16,48,32);}
    }else{
      R.x.save();
      R.x.fillStyle='#aaddff';R.x.shadowColor='#4488ff';R.x.shadowBlur=8;
      R.x.fillRect(sx2-7,sy2-2,14,4);
      R.x.fillStyle='#ffffff';R.x.fillRect(sx2-3,sy2-1,6,2);
      R.x.restore();
    }
  }
}

// ═══ ENEMY PROJECTILE ═══
class Proj{
  constructor(x,y,vx,vy,dmg){
    this.x=x;this.y=y;this.vx=vx;this.vy=vy;this.dmg=dmg;
    this.on=true;this.r=5;this.life=3.5;
  }
  update(dt,tm,heroes){
    if(!this.on)return;
    this.life-=dt;
    if(this.life<=0){this.on=false;return}
    this.x+=this.vx*dt*60;this.y+=this.vy*dt*60;
    this.vy=Math.min(this.vy+GR*0.4*dt*60,MF*0.6);
    const tx=Math.floor(this.x/T),ty=Math.floor(this.y/T);
    if(tm&&tm.solUp&&tm.solUp(tx,ty)){this.on=false;P.emit(this.x,this.y,5,'#ff8800',3,0.3,2);return}
    for(const h of heroes){
      if(h.on&&Math.abs(h.x+h.w/2-this.x)<14&&Math.abs(h.y+h.h/2-this.y)<14){
        h.hurt(this.dmg);this.on=false;P.emit(this.x,this.y,4,'#ff4400',2,0.2,1.5);break;
      }
    }
  }
  draw(){
    if(!this.on)return;
    R.rect(this.x-this.r,this.y-this.r,this.r*2,this.r*2,'#ff8844');
    R.rect(this.x-this.r+1,this.y-this.r+1,(this.r-1)*2,(this.r-1)*2,'#ffcc44');
  }
}

// ═══ MUSIC SYSTEM (procedural Web Audio chiptune) ═══
const Music=(()=>{
  let ctx=null,master=null,_muted=false,_theme=null,_sched=null,_beat=0,_next=0,_startId=0;

  function init(){
    if(ctx)return;
    try{
      ctx=new(window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();master.gain.value=0.25;
      master.connect(ctx.destination);
    }catch(e){}
  }

  function note(freq,type,vol,t,dur){
    if(!ctx||_muted||!freq||freq<=0)return;
    try{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.type=type;o.frequency.value=freq;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(vol,t+0.025);
      g.gain.setValueAtTime(vol,t+dur*0.72);
      g.gain.linearRampToValueAtTime(0,t+dur);
      o.connect(g);g.connect(master);
      o.start(t);o.stop(t+dur+0.06);
    }catch(e){}
  }

  const THEMES={
    castle:{bpm:120,
      mel:[294,349,440,523,440,349,294,262, 330,392,440,523,392,330,294,262],
      bas:[147,147,110,110,131,131,147,147, 147,147,110,110,131,131,147,147],
      play(i,t,b){
        note(this.mel[i%16],'square',0.065,t,b*0.52);
        note(this.bas[i%16],'sawtooth',0.15,t,b*0.86);
        if(i%8===0){note(294,'sawtooth',0.045,t,b*1.9);note(349,'sawtooth',0.03,t,b*1.9);note(440,'sawtooth',0.025,t,b*1.9);}
      }},
    underwater:{bpm:80,
      mel:[262,0,311,0,262,0,392,0, 311,0,262,0,392,0,466,0],
      play(i,t,b){
        const m=this.mel[i%16];
        if(m){note(m,'sine',0.075,t,b*1.8);note(m/2,'sine',0.13,t,b*3.6);}
        if(i%8===0)note(131,'sine',0.17,t,b*5.5);
      }},
    library:{bpm:88,
      mel:[220,0,262,0,247,0,220,294, 262,0,220,0,196,0,220,0],
      play(i,t,b){
        const m=this.mel[i%16];
        if(m){note(m,'sine',0.075,t,b*1.4);note(m*2,'sine',0.03,t,b*0.9);}
        if(i%16===0)note(110,'sine',0.13,t,b*4.2);
        if(i%16===8)note(98,'sine',0.10,t,b*4.2);
        if(i%16===6)note(311,'sine',0.035,t,b*2.6);
      }},
    boss:{bpm:138,
      arp:[294,349,440,523,440,349,294,262, 294,349,440,523,588,523,440,349],
      play(i,t,b){
        note(147,'sawtooth',0.17,t,b*0.72);
        note(this.arp[i%16],'square',0.055,t,b*0.42);
        if(i%4===0){note(294,'sawtooth',0.065,t,b*1.35);note(440,'sawtooth',0.038,t,b*1.35);}
      }},
    stealth:{bpm:58,
      mel:[196,0,0,0,220,0,0,0,185,0,0,0,196,0,0,0],
      play(i,t,b){
        const m=this.mel[i%16];
        if(m){note(m,'sine',0.055,t,b*3.0);note(m*2,'sine',0.02,t,b*1.8);}
        if(i%16===0)note(98,'sine',0.065,t,b*5.2);
      }}
  };

  function schedule(){
    if(!_theme||!ctx)return;
    const th=THEMES[_theme];if(!th)return;
    const b=60/th.bpm,ahead=0.5;
    if(_next<ctx.currentTime)_next=ctx.currentTime+0.05;
    while(_next<ctx.currentTime+ahead){
      try{th.play(_beat,_next,b);}catch(e){}
      _next+=b;_beat++;
    }
    _sched=setTimeout(schedule,200);
  }

  return{
    get muted(){return _muted;},
    init,
    play(t){
      if(_theme===t&&_sched)return;
      if(_sched){clearTimeout(_sched);_sched=null;}
      _theme=t;_beat=0;
      const id=++_startId;
      if(!ctx)init();
      if(!ctx)return;
      const go=()=>{if(_startId!==id||_theme!==t)return;_next=ctx.currentTime+0.1;schedule();};
      if(ctx.state==='suspended'){ctx.resume().then(go).catch(()=>{});}
      else{go();}
    },
    stop(){
      if(_sched){clearTimeout(_sched);_sched=null;}
      _theme=null;_beat=0;
    },
    resume(){try{if(!ctx)return;if(ctx.state==='suspended'){ctx.resume().then(()=>{if(_theme&&!_sched){_next=ctx.currentTime+0.05;schedule();}}).catch(()=>{});}else if(_theme&&!_sched){_next=ctx.currentTime+0.05;schedule();}}catch(e){}},
    toggle(){
      if(!ctx)init();
      _muted=!_muted;
      if(master)master.gain.value=_muted?0:0.25;
    }
  };
})();
