// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE SCENES — Scene base class (keep) + your levels (replace Demo).
// Pattern per level: subclass Scene, implement enter() and bAct1..bActN(retry)
// builders, put level logic in update() between updateActors and
// resolveCombat, end the last act with G.victory().
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const HERO_DEFS={
  hero_one:['Hero','#40aa88'],
  hero_two:['Healer','#d0a066'],
};

// ─────────────────────────────────────────────────────────────────────────
// Scene base class — shared party/HUD/combat/act plumbing. KEEP AS-IS.
// ─────────────────────────────────────────────────────────────────────────
class Scene{
  constructor(){
    this.act=0;this.tm=null;this.heroes=[];this.enemies=[];this.npcs=[];this.companions=[];
    this.ai=0;this.tileset=null;this.theme='castle';this.shk=0;this.shi=0;
    this.decos=[];this._healFlash=0;this.projectiles=[];this.megaProjs=[];
    this.tut=false;this._darkZones=null;this.musicTheme='castle';
  }
  createHeroes(x,y,roster){
    const heroes=roster.map((type,i)=>{
      const[nm,col]=HERO_DEFS[type];
      return new Hero(nm,x+i*30,y,col,type);
    });
    heroes.forEach(h=>h.applyStats(h.customType));
    return heroes;
  }
  rebuildCompanions(){
    this.companions=[];
    for(let i=0;i<this.heroes.length;i++){
      if(i!==this.ai){this.heroes[i]._compIdx=this.companions.length;this.companions.push(new Companion(this.heroes[i]));}
    }
    if(this.tm){
      for(const h of this.heroes)h.snapGnd(this.tm);
      if(this.enemies)for(const e of this.enemies){e.snapGnd(this.tm);e._scene=this;}
      if(this.npcs)for(const n of this.npcs){
        const bx=Math.floor(n.x/T);
        for(let yy=Math.floor(n.y/T);yy<this.tm.h;yy++){
          if(this.tm.sol(bx,yy)){n.y=yy*T-10;break}
        }
      }
    }
  }
  swap(idx){
    if(idx===this.ai||!this.heroes[idx]||!this.heroes[idx].on)return;
    const cur=this.heroes[this.ai],nxt=this.heroes[idx];
    const tx=nxt.x,ty=nxt.y;
    nxt.x=cur.x;nxt.y=cur.y;nxt.vx=0;nxt.vy=0;nxt.gnd=cur.gnd;
    cur.x=tx;cur.y=ty;cur.vx=0;cur.vy=0;
    cur.ctrl=false;cur.st='idle';cur.atkT=0;cur.skillT=0;
    nxt.ctrl=true;nxt.st='idle';
    this.ai=idx;
    this.rebuildCompanions();
    P.emit(nxt.x+nxt.w/2,nxt.y+nxt.h/2,8,nxt.col,3,0.3,2);
    this.hud();
  }
  _autoSwapOnDeath(){
    const idx=this.heroes.findIndex(h=>h.on);
    if(idx<0)return;
    const dead=this.heroes[this.ai];
    G._floats.push({x:dead.x,y:dead.y-24,txt:Lang.t('hero_down'),life:1.6,col:'#ff5555'});
    dead.ctrl=false;
    this.heroes[idx].ctrl=true;this.heroes[idx].st='idle';
    this.ai=idx;
    this.rebuildCompanions();
    this.hud();
  }
  setHint(key){this._hintKey=key;document.getElementById('hint').textContent=Lang.t(key);}
  restartAct(){
    D.on=false;document.getElementById('dlg').style.display='none';
    const fn=this['bAct'+this.act];
    if(typeof fn==='function')fn.call(this,true);
  }
  nextLevel(SceneClass,musicTheme){
    this.heroes.forEach(h=>{if(h.on)G.heroHPs[h.customType]=h.hp;});
    Music.stop();if(musicTheme)Music.play(musicTheme);
    G.sc=new SceneClass();G.sc.enter();
  }
  triggerUltimate(){
    const h=this.heroes[this.ai];if(!h||!h.on||h._rUsed)return;
    h._rUsed=true;const cx=h.x+h.w/2,cy=h.y+h.h/2;
    // Default ultimate: radial blast. Customize per hero type as needed.
    this.enemies.forEach(e=>{if(!e.on)return;const dx=e.x+e.w/2-cx,dy=e.y+e.h/2-cy;if(Math.sqrt(dx*dx+dy*dy)<200)e.hurt(h.atkDmg*3);});
    G._rings.push({x:cx,y:cy,r:10,life:0.8,col:h.col});
    G._floats.push({x:cx,y:cy-30,txt:Lang.t('cleave'),life:1.5,col:h.col});
  }
  hud(){
    let h='';
    this.heroes.forEach((hero,i)=>{
      const a=i===this.ai?'act':'';const pct=Math.max(0,hero.hp/hero.mhp*100);
      const col=pct>50?'#4a4':pct>25?'#aa4':'#a44';
      const dim=hero.on?'':'opacity:0.35;filter:grayscale(1);';
      h+=`<div class="hs ${a}" style="${dim}" onclick="G.sc.swap(${i})"><div style="width:28px;height:28px;background:${hero.col}33;border-radius:2px;display:flex;align-items:center;justify-content:center"><span style="color:${hero.col};font-size:13px;font-weight:bold">${hero.nm[0]}</span></div><div class="hp-bar"><div class="hp-fill" style="width:${pct}%;background:${col}"></div></div><div class="nm">${hero.nm}</div></div>`;
    });
    document.getElementById('hud').innerHTML=h;
  }
  drawStatus(){
    const mx=R.x;mx.save();mx.font='11px monospace';mx.textAlign='right';
    let y=16;
    mx.fillStyle='rgba(255,255,255,0.55)';
    mx.fillText(Music.muted?Lang.t('muted'):Lang.t('music'),CW-10,y);y+=15;
    mx.fillStyle='#ffdd44';
    mx.fillText(Lang.t('scrolls')+': '+G.scrollsLeft+' [R]',CW-10,y);y+=15;
    const h=this.heroes[this.ai];
    if(h){
      mx.fillStyle=h._rUsed?'rgba(120,120,120,0.7)':'rgba(255,220,80,0.95)';
      mx.fillText(Lang.t(h._rUsed?'ult_used':'ult_ready'),CW-10,y);y+=15;
    }
    if(this.enemies&&this.enemies.length){
      const al=this.enemies.filter(e=>e.on).length;
      mx.fillStyle='#f88';
      mx.fillText(Lang.t('enemies')+': '+al+'/'+this.enemies.length,CW-10,y);
    }
    mx.restore();mx.textAlign='left';
  }
  drawEnemyArrow(){
    if(!this.enemies||!this.enemies.length)return;
    const alive=this.enemies.filter(e=>e.on);
    if(!alive.length||alive.length>3)return;
    const h=this.heroes[this.ai];if(!h)return;
    const onScreen=alive.some(e=>e.x-R.cam.x>-40&&e.x-R.cam.x<CW+40);
    if(onScreen)return;
    const tgt=alive.reduce((a,b)=>Math.abs(b.x-h.x)<Math.abs(a.x-h.x)?b:a);
    const dir=tgt.x>h.x?1:-1;
    const ax=dir>0?CW-30:30,ay=CH/2;
    const mx=R.x;mx.save();
    mx.fillStyle='rgba(255,100,100,'+(0.5+0.4*Math.sin(performance.now()/200))+')';
    mx.beginPath();
    mx.moveTo(ax+dir*12,ay);mx.lineTo(ax-dir*8,ay-10);mx.lineTo(ax-dir*8,ay+10);
    mx.closePath();mx.fill();
    mx.restore();
  }
  commonUpdateStart(dt){
    if(this._healFlash>0)this._healFlash-=dt;
    if(D.on){D.up(dt);return true}
    if(this.shk>0){this.shk-=dt;R.cam.x+=(Math.random()-0.5)*this.shi;R.cam.y+=(Math.random()-0.5)*this.shi}
    if(!this.tm){P.up(dt);return true}
    if(I.pr('Tab')){
      let n=(this.ai+1)%this.heroes.length,c=0;
      while((!this.heroes[n]||!this.heroes[n].on)&&c<this.heroes.length){n=(n+1)%this.heroes.length;c++}
      this.swap(n);
    }
    for(let i=0;i<this.heroes.length;i++)if(I.pr('Digit'+(i+1)))this.swap(i);
    return false;
  }
  updateActors(dt){
    if(!this.heroes[this.ai].on)this._autoSwapOnDeath();
    this.heroes[this.ai].update(dt,this.tm);
    this.companions.forEach(comp=>comp.update(dt,this.heroes[this.ai],this.tm,this.enemies));
    this.enemies.forEach(e=>e.update(dt,this.tm,this.heroes));
    this.npcs.forEach(n=>n.update(dt));
  }
  resolveCombat(dt){
    this.heroes.forEach(hero=>{
      const ab=hero.atkBox();if(!ab)return;
      this.enemies.forEach(e=>{
        if(!e.on)return;
        if(hero._swingHit.has(e))return;
        if(e.x<ab.x+ab.w&&e.x+e.w>ab.x&&e.y<ab.y+ab.h&&e.y+e.h>ab.y){
          hero._swingHit.add(e);
          e.hurt(ab.dmg||hero.atkDmg,hero);
        }
      });
    });
    if(this.projectiles){this.projectiles.forEach(p=>{if(p instanceof HeroProj)p.update(dt,this.tm,this.enemies);else p.update(dt,this.tm,this.heroes);});this.projectiles=this.projectiles.filter(p=>p.on);}
    if(this.megaProjs){this.megaProjs.forEach(p=>p.update(dt,this.enemies));this.megaProjs=this.megaProjs.filter(p=>p.on);}
  }
  commonUpdateEnd(dt){
    P.up(dt);
    this.hud();
    if(I.pr('KeyR')&&G.scrollsLeft>0){
      let dead=this.heroes.find(h=>!h.on);
      if(dead){dead.on=true;dead.hp=Math.floor(dead.mhp*0.3);dead.x=this.heroes[this.ai].x;dead.y=this.heroes[this.ai].y-10;dead.vy=0;G.scrollsLeft--;G._floats.push({x:dead.x,y:dead.y-20,txt:Lang.t('revived'),life:2,col:'#ffdd44'});this.rebuildCompanions();}
    }
    if(I.pr('KeyX'))this.triggerUltimate();
    if(this.heroes.length&&this.heroes.every(h=>!h.on))G.gameOver();
    this.clampCam();
  }
  clampCam(){
    if(this.tm){
      R.cam.x=Math.max(0,Math.min(this.tm.w*T-CW,R.cam.x));
      R.cam.y=Math.max(0,Math.min(Math.max(0,this.tm.h*T-CH),R.cam.y));
    }
  }
  handleNPCTalk(){
    if(I.pr('KeyZ')||I.pr('KeyJ')){
      const h=this.heroes[this.ai];
      this.npcs.forEach(n=>{
        if(!n._talked&&n.dlgs&&Math.abs(n.x-h.x)<100&&Math.abs(n.y-h.y)<60){
          n._talked=true;
          D.show(n.dlgs,()=>{});
        }
      });
    }
  }
  drawWorld(bgTop,bgBot){
    const g=R.x.createLinearGradient(0,0,0,CH);
    g.addColorStop(0,bgTop);g.addColorStop(1,bgBot);
    R.x.fillStyle=g;R.x.fillRect(0,0,CW,CH);
    drawBgLayer(R.x,R.cam,this.theme,this.tm?this.tm.w:100,this.tm?this.tm.h:MAP_H);
    if(this.tm)this.tm.draw(this.tileset);
    R.drawDecos(this.decos);
  }
  drawActors(){
    this.npcs.forEach(n=>n.draw());
    this.enemies.forEach(e=>e.draw());
    if(this.projectiles)this.projectiles.forEach(p=>p.draw());
    if(this.megaProjs)this.megaProjs.forEach(p=>p.draw(R.x,R.cam.x,R.cam.y));
    this.heroes.filter(h=>!h.ctrl).forEach(h=>h.draw());
    this.heroes.filter(h=>h.ctrl).forEach(h=>h.draw());
  }
  drawFlashes(){
    if(this._healFlash>0){
      R.x.save();
      R.x.globalAlpha=Math.min(1,this._healFlash*2);
      R.x.fillStyle='#22ee66';R.x.font='bold 22px monospace';R.x.textAlign='center';
      R.x.shadowColor='#22ee66';R.x.shadowBlur=12;
      R.x.fillText(Lang.t('party_healed'),CW/2,CH/2-60);
      R.x.restore();R.x.textAlign='left';
    }
    P.draw();
    this.drawStatus();
    this.drawEnemyArrow();
  }
}

// ─────────────────────────────────────────────────────────────────────────
// EXAMPLE LEVEL — replace with your game's levels.
// ─────────────────────────────────────────────────────────────────────────
class Demo extends Scene{
  constructor(){super();this.musicTheme='castle';}
  enter(){
    Music.play(this.musicTheme);
    this.bAct1();
  }
  bAct1(retry){
    this.act=1;const W=120,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this.projectiles=[];this.megaProjs=[];
    buildCastleArena(this.tm,W,H);
    this.decos=genDecos(W,H,'castle',1);
    this.heroes=this.createHeroes(100,(H-4)*T,['hero_one','hero_two']);
    this.heroes[0].ctrl=true;this.ai=0;
    const gy=(H-4)*T;
    this.enemies=[
      new Enem(600,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,10,'patrol','goblin'),
      new Enem(900,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,10,'chase','goblin'),
      new Enem(1300,gy,24,36,'Captain','#aa5533',EHP.miniboss,14,'boss','student'),
    ];
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l1a1_hint');
    if(retry){this.tut=true;return;}
    D.show([d('narrator','l1a1_1'),d('tutorial','l1a1_tut')],()=>{this.tut=true});
  }
  update(dt){
    if(this.commonUpdateStart(dt))return;
    this.updateActors(dt);
    this.resolveCombat(dt);
    this.commonUpdateEnd(dt);
    if(this.act===1&&this.tut&&this.enemies.every(e=>!e.on)){
      this.act=-1;
      D.show([d('narrator','l1a1_win')],()=>{G.victory()});
    }
  }
  draw(){
    this.drawWorld('#0d2847','#1a3a5a');
    this.drawActors();
    this.drawFlashes();
  }
}

// ─────────────────────────────────────────────────────────────────────────
// LEVEL REGISTRY — main.js builds the title screen from this.
// ─────────────────────────────────────────────────────────────────────────
const GAME_LEVELS=[
  {nameKey:'lvl1',cls:Demo,music:'castle'},
];
