// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — SCENES
// Scene base class (shared party/HUD/combat/act plumbing that the old build
// duplicated five times) + the five story levels as thin subclasses.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const HERO_DEFS={
  kote:   ['Kote','#40aa88'],
  minerva:['Minerva','#cc44cc'],
  elber:  ['Elber','#44aa44'],
  nesta:  ['Nesta','#4488cc'],
  nick:   ['Nick','#d0a066'],
};

class Scene{
  constructor(){
    this.act=0;this.tm=null;this.heroes=[];this.enemies=[];this.npcs=[];this.companions=[];
    this.ai=0;this.tileset='tiles_castle';this.theme='castle';this.shk=0;this.shi=0;
    this.decos=[];this._healFlash=0;this.projectiles=[];this.megaProjs=[];
    this.tut=false;this._darkZones=null;
  }

  // ── Party ──
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
      // NPC ground snap (mirrors snapGnd: rise out of terrain if embedded,
      // otherwise scan down). NPC bottom renders at n.y+10.
      if(this.npcs)for(const n of this.npcs){
        const bx=Math.floor(n.x/T);
        let yy=Math.max(0,Math.floor((n.y+9)/T));
        if(this.tm.sol(bx,yy)){
          while(yy>0&&this.tm.sol(bx,yy))yy--;
          n.y=(yy+1)*T-10;
        }else{
          for(;yy<this.tm.h;yy++){
            if(this.tm.sol(bx,yy)){n.y=yy*T-10;break}
          }
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
  // Called when the controlled hero dies: hand control to a living member
  // where THEY stand (no position teleport), instead of soft-locking.
  _autoSwapOnDeath(){
    const idx=this.heroes.findIndex(h=>h.on);
    if(idx<0)return; // party wipe — handled by caller
    const dead=this.heroes[this.ai];
    G._floats.push({x:dead.x,y:dead.y-24,txt:Lang.t('hero_down'),life:1.6,col:'#ff5555'});
    dead.ctrl=false;
    this.heroes[idx].ctrl=true;this.heroes[idx].st='idle';
    this.ai=idx;
    this.rebuildCompanions();
    this.hud();
  }

  // ── Act plumbing ──
  setHint(key){this._hintKey=key;document.getElementById('hint').textContent=Lang.t(key);}
  restartAct(){
    D.on=false;document.getElementById('dlg').style.display='none';
    const fn=this['bAct'+this.act];
    if(typeof fn==='function')fn.call(this,true); // true → skip intro dialogue on retries
  }
  nextLevel(SceneClass,musicTheme){
    this.heroes.forEach(h=>{if(h.on)G.heroHPs[h.customType]=h.hp;});
    Music.stop();if(musicTheme)Music.play(musicTheme);
    G.sc=new SceneClass();G.sc.enter();
  }

  // ── Ultimate (X) — one implementation for all levels ──
  triggerUltimate(){
    const h=this.heroes[this.ai];if(!h||!h.on||h._rUsed)return;
    h._rUsed=true;const cx=h.x+h.w/2,cy=h.y+h.h/2;
    switch(h.customType){
      case 'minerva':
        this.enemies.forEach(e=>{if(!e.on)return;const dx=e.x+e.w/2-cx,dy=e.y+e.h/2-cy;if(Math.sqrt(dx*dx+dy*dy)<200)e.hurt(h.atkDmg*3);});
        G._rings.push({x:cx,y:cy,r:10,life:0.8,col:'#cc44cc'});G._rings.push({x:cx,y:cy,r:10,life:1.2,col:'#ff88ff'});
        FX.play('fx_cleave',cx,cy,96,false,0.06);
        G._floats.push({x:cx,y:cy-30,txt:Lang.t('cleave'),life:1.5,col:'#ff88ff'});break;
      case 'kote':
        for(let i=-2;i<=2;i++){const a=i*0.18,dir=h.rt?1:-1;const p=new HeroProj(cx,cy,Math.cos(a)*dir*7,Math.sin(a)*(-1+Math.abs(i)*0.3),h.atkDmg*2,h);p._col='#ff6600';this.projectiles.push(p);}
        G._floats.push({x:cx,y:cy-20,txt:Lang.t('barrage'),life:1.5,col:'#ff6600'});break;
      case 'nesta':
        this.heroes.forEach(hh=>{if(hh.on){hh._invis=true;hh._invisTimer=5.0;}});
        G._floats.push({x:cx,y:cy-20,txt:Lang.t('party_invisible'),life:2.0,col:'#aaddff'});break;
      case 'elber':{
        const t=this._nearestEnemy(cx)||{x:cx+(h.rt?500:-500),y:cy};
        const dx=t.x-cx,dy=(t.y||cy)-cy,len=Math.sqrt(dx*dx+dy*dy)||1;
        const p=new MegaProj(cx,cy,(dx/len)*2.0,(dy/len)*2.0,h.atkDmg*2);p._amberSlow=true;this.megaProjs.push(p);
        G._floats.push({x:cx,y:cy-20,txt:Lang.t('freeze_shot'),life:1.5,col:'#44ddff'});break;}
      case 'nick':{
        const t=this._nearestEnemy(cx)||{x:cx+(h.rt?500:-500),y:cy};
        const dx=t.x-cx,dy=(t.y||cy)-cy,len=Math.sqrt(dx*dx+dy*dy)||1;
        const p=new MegaProj(cx,cy,(dx/len)*2.0,(dy/len)*2.0,h.atkDmg*5);p._skelMega=true;this.megaProjs.push(p);
        G._floats.push({x:cx,y:cy-20,txt:Lang.t('bone_shot'),life:1.5,col:'#e8e8d0'});break;}
    }
  }
  _nearestEnemy(cx){
    const es=this.enemies.filter(e=>e.on).sort((a,b)=>Math.abs(a.x-cx)-Math.abs(b.x-cx));
    return es[0]||null;
  }

  // ── HUD ──
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
  // Right-hand status column, drawn on canvas so nothing overlaps the DOM HUD
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
  // When hunting the last few enemies on a kill-all objective, point at them
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

  // ── Shared per-frame plumbing ──
  // Returns true if the frame was fully handled (dialogue open / no map).
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
    // Controlled hero died? Swap before updating so the frame keeps flowing.
    if(!this.heroes[this.ai].on)this._autoSwapOnDeath();
    this.heroes[this.ai].update(dt,this.tm);
    this.companions.forEach(comp=>comp.update(dt,this.heroes[this.ai],this.tm,this.enemies));
    if(this._fox){let nesta=this.heroes.find(h=>h.customType==='nesta'&&h.on);this._fox.update(dt,nesta||null);}
    if(this._skeleton){let nick=this.heroes.find(h=>h.customType==='nick'&&h.on);this._skeleton.update(dt,nick||null);}
    this.enemies.forEach(e=>e.update(dt,this.tm,this.heroes));
    this.npcs.forEach(n=>n.update(dt));
  }
  resolveCombat(dt){
    // Melee swings: each swing damages each enemy at most once (_swingHit),
    // instead of relying on the enemy invuln window to mask multi-hits.
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
    // Resurrection scroll
    if(I.pr('KeyR')&&G.scrollsLeft>0){
      let dead=this.heroes.find(h=>!h.on);
      if(dead){dead.on=true;dead.hp=Math.floor(dead.mhp*0.3);dead.x=this.heroes[this.ai].x;dead.y=this.heroes[this.ai].y-10;dead.vy=0;G.scrollsLeft--;G._floats.push({x:dead.x,y:dead.y-20,txt:Lang.t('revived'),life:2,col:'#ffdd44'});this.rebuildCompanions();}
    }
    if(I.pr('KeyX'))this.triggerUltimate();
    // Party wipe → game over screen (the old build simply soft-locked here)
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

  // ── Shared draw pipeline ──
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
    if(this._fox)this._fox.draw(R.x,R.cam.x,R.cam.y);
    if(this._skeleton)this._skeleton.draw(R.x,R.cam.x,R.cam.y);
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

  // Stealth helper shared by Lv1 act4 and Lv3 act1.
  // guardFilter picks which enemies can detect; onCaught restarts the act.
  updateStealth(dt,guardFilter,closeKey,timeoutKey){
    if(this.heroes.some(hh=>hh._invis)){
      this._stealthAlert=false;this._alertTimer=0;
      this.enemies.forEach(e=>{if(e._savedAi){e.ai=e._savedAi;e._savedAi=null;}});
      this._prevAnyAlert=false;
      return;
    }
    const h=this.heroes[this.ai];
    let anyAlert=false;
    this.enemies.forEach(e=>{
      if(!guardFilter(e)||!e.on)return;
      const dist=Math.sqrt((e.x-h.x)**2+(e.y-h.y)**2);
      const ALERT_R=180,CAUGHT_R=70;
      if(dist<CAUGHT_R&&!this.stealthFailed){
        this.stealthFailed=true;this._stealthAlert=false;this._alertTimer=0;
        D.show([d('guard',closeKey)],()=>{this.stealthFailed=false;this.restartAct();});
      } else if(dist<ALERT_R){
        anyAlert=true;
        if(!this._prevAnyAlert)this._alertTimer=2.5;
        this._stealthAlert=true;
        e.rt=(h.x>e.x);
        if(!e._savedAi)e._savedAi=e.ai;
        e.ai='static';e.vx=0;
      }
    });
    if(!anyAlert){
      this._stealthAlert=false;this._alertTimer=0;
      this.enemies.forEach(e=>{if(e._savedAi){e.ai=e._savedAi;e._savedAi=null;}});
    }
    this._prevAnyAlert=anyAlert;
    if(this._stealthAlert){
      this._alertTimer-=dt;
      if(this._alertTimer<=0&&!this.stealthFailed){
        this.stealthFailed=true;this._stealthAlert=false;
        D.show([d('guard',timeoutKey)],()=>{this.stealthFailed=false;this.restartAct();});
      }
    }
  }
  drawGuardRings(guardFilter){
    this.enemies.forEach(e=>{
      if(!guardFilter(e)||!e.on)return;
      const sx=e.x+e.w/2-R.cam.x,sy=e.y+e.h/2-R.cam.y;
      R.x.save();
      R.x.strokeStyle=this._stealthAlert?'rgba(255,220,0,0.7)':'rgba(255,220,0,0.2)';
      R.x.lineWidth=2;R.x.beginPath();R.x.arc(sx,sy,180,0,Math.PI*2);R.x.stroke();
      R.x.strokeStyle='rgba(255,60,0,0.45)';R.x.lineWidth=1.5;
      R.x.beginPath();R.x.arc(sx,sy,70,0,Math.PI*2);R.x.stroke();
      if(this._stealthAlert&&this._alertTimer>0){
        R.x.fillStyle='rgba(0,0,0,0.5)';R.x.fillRect(sx-30,sy-95,60,8);
        R.x.fillStyle='rgba(255,200,0,0.9)';R.x.fillRect(sx-30,sy-95,60*(this._alertTimer/2.5),8);
      }
      R.x.restore();
    });
  }
}

// ═══════════════════════════ LEVEL 1: SCHOOL DAY ═══════════════════════════
class Lv1 extends Scene{
  constructor(){super();this.tileset='tiles_castle';this.theme='castle';this.stealthFailed=false;
    this._alertTimer=0;this._stealthAlert=false;this._prevAnyAlert=false;}
  enter(){
    Music.play('castle');
    this._fox=new Fox(100,100);
    this._skeleton=new Skeleton(100,100);
    this.bAct1();
  }

  // ACT 1: THE FINAL EXAM — arena combat
  bAct1(retry){
    this.act=1;const W=240,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this.projectiles=[];this.megaProjs=[];
    this.tut=!!retry;
    buildCastleArena(this.tm,W,H);
    this.decos=genDecos(W,H,'castle',this.act);
    this.heroes=this.createHeroes(160,(H-4)*T,['kote','minerva','elber','nesta','nick']);
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    const bakaris=new Enem(1800,gy,24,36,'Bakaris','#aa5533',EHP.miniboss,13,'boss','bakaris');
    bakaris._phase2=false;bakaris._projTimer=3.0;bakaris._scene=this;
    this.enemies=[
      bakaris,
      new Enem(1120,gy,28,40,'Ayik Ur','#4466aa',EHP.soldier,11,'chase','castle_soldier'),
      new Enem(1400,gy,28,40,'Hrigg','#668877',EHP.soldier,11,'patrol','castle_archer'),
      new Enem(1600,gy,28,40,'Iriad','#8a7a5a',EHP.soldier,11,'chase','hideout_fighter'),
      new Enem((W-15)*T,(H-7)*T,28,40,'Tower Guard','#446688',EHP.soldier,11,'static','castle_archer'),
      new Enem(900,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,12,'patrol','goblin'),
      new Enem(1500,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,12,'patrol','goblin'),
      new Enem(2200,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,12,'patrol','goblin'),
    ];
    for(let i=1;i<=4;i++)this.enemies[i].spd=0.9;

    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l1a1_hint');
    if(retry){this.tut=true;return;}
    D.show([
      d('narrator','l1a1_1'),d('narrator','l1a1_2'),d('tutorial','l1a1_tut'),
      d('Bakaris','l1a1_bak'),d('narrator','l1a1_go')
    ],()=>{this.tut=true});
  }

  // ACT 2: BLOOD AND GRUDGE — cutscene
  bAct2(){
    this.act=2;
    document.getElementById('hud').style.display='none';
    this.tm=null;this.enemies=[];this.npcs=[];
    D.show([
      d('narrator','l1a2_1'),d('Bakaris','l1a2_2'),d('Nesta','l1a2_3'),
      d('narrator','l1a2_4'),d('narrator','l1a2_5'),d('narrator','l1a2_6'),d('narrator','l1a2_7')
    ],()=>{this.bAct3()});
  }

  // ACT 3: HALLWAY RUMORS — social exploration
  bAct3(retry){
    this.act=3;const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this._act3done=false;
    buildCastleArena(this.tm,W,H);
    this.decos=genDecos(W,H,'castle',this.act);
    this.heroes=this.createHeroes(160,(H-4)*T,['kote','minerva','elber','nesta','nick']);
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    this.npcs=[
      new NPC(600,gy,'Levna','villager',[d('Levna','l1a3_levna1'),d('Levna','l1a3_levna2'),d('Levna','l1a3_levna3'),d('Levna','l1a3_levna4')]),
      new NPC(1000,gy,'Clystran','villager',[d('Clystran','l1a3_cly1'),d('Clystran','l1a3_cly2'),d('Clystran','l1a3_cly3'),d('Clystran','l1a3_cly4')]),
      new NPC(1400,gy,'Darrett','villager',[d('Darrett','l1a3_dar1'),d('Darrett','l1a3_dar2'),d('Darrett','l1a3_dar3'),d('Darrett','l1a3_dar4')]),
      new NPC(1700,gy,'Andir','villager',[d('Andir','l1a3_and1'),d('Andir','l1a3_and2'),d('Andir','l1a3_and3'),d('Andir','l1a3_and4')]),
    ];
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l1a3_hint');
    if(retry)return;
    D.show([d('narrator','l1a3_1'),d('narrator','l1a3_2')],()=>{});
  }

  // ACT 4: NIGHT INFILTRATION — platform stealth
  bAct4(retry){
    Music.play('stealth');
    this.act=4;const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this.stealthFailed=false;
    buildCastleArena(this.tm,W,H);
    for(let i=5;i<80;i++)this.tm.set(i,H-5,3);
    for(let i=5;i<80;i++)this.tm.set(i,H-8,3);
    for(let i=5;i<80;i++)this.tm.set(i,H-11,3);
    this.decos=genDecos(W,H,'library',this.act);
    this.heroes=this.createHeroes(160,(H-4)*T,['kote','minerva','elber','nesta','nick']);
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    this.enemies=[
      new Enem(900,gy,28,40,'Guard','#4466aa',EHP.soldier,11,'patrol','castle_knight'),
      new Enem(1200,(H-6)*T,16,20,'Mimic Book','#8844aa',EHP.grunt,8,'static','mimic'),
      new Enem(1400,(H-6)*T,16,20,'Mimic Book','#8844aa',EHP.grunt,8,'static','mimic'),
      new Enem(1800,gy,24,28,'Mimic Book','#6b3a8c',EHP.soldier,14,'patrol','mimic'),
      new Enem(2400,gy,24,28,'Mimic Book','#6b3a8c',EHP.soldier,14,'patrol','mimic'),
      new Enem(2900,gy,24,28,'Mimic Book','#6b3a8c',EHP.soldier,14,'patrol','mimic'),
      new Enem(3400,gy,24,28,'Mimic Book','#6b3a8c',EHP.soldier,14,'patrol','mimic'),
    ];
    const guard=this.enemies[0];
    guard.spd=0.8;
    guard._platformTimer=3.0+Math.random()*4;
    guard._platform=0;

    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l1a4_hint');
    if(retry){this.tut=true;return;}
    D.show([
      d('narrator','l1a4_1'),d('narrator','l1a4_2'),d('Nesta','l1a4_3'),d('Nesta','l1a4_4')
    ],()=>{this.tut=true});
  }

  // ACT 5: DIVERGING PATHS — cutscene, then Level 2
  bAct5(){
    this.act=5;
    document.getElementById('hud').style.display='none';
    this.tm=null;this.enemies=[];this.npcs=[];
    D.show([
      d('narrator','l1a5_1'),d('narrator','l1a5_2'),d('Ispin','l1a5_3'),
      d('narrator','l1a5_4'),d('narrator','l1a5_5'),d('narrator','l1a5_6'),d('narrator','l1a5_7')
    ],()=>{this.nextLevel(Lv2,'underwater')});
  }

  update(dt){
    if(this.commonUpdateStart(dt))return;

    if(this.act===3){
      this.handleNPCTalk();
      if(this.heroes[this.ai].x>1800&&!this._act3done){
        this._act3done=true;
        D.show([d('narrator','l1a3_done')],()=>{this.bAct4()});
      }
      this.updateActors(dt);
      this.commonUpdateEnd(dt);
      return;
    }

    this.updateActors(dt);

    // Act 4: guard platform-hopping + stealth detection
    if(this.act===4&&this.tut){
      const H=this.tm.h,pg=this.enemies.find(e=>e.customType==='castle_knight'&&e.on);
      if(pg&&pg._platformTimer!==undefined){
        pg._platformTimer-=dt;
        if(pg._platformTimer<=0){
          const gh=40;
          pg._platform=(pg._platform+1)%4;
          pg._platformTimer=3.5+Math.random()*4;
          const pY=[(H-4)*T-gh,(H-5)*T-gh,(H-8)*T-gh,(H-11)*T-gh];
          pg.y=pY[pg._platform];pg.vy=0;
          P.emit(pg.x+pg.w/2,pg.y+pg.h/2,8,'#ffdd66',3,0.4,2);
        }
        // Clamp patrol to the platform span (tiles 5..80 → world px, T=16).
        // The old code used *32 with 16px tiles and let the guard walk off.
        if(pg.x<5*T){pg.x=5*T;pg.dir=1;pg.rt=true;}
        if(pg.x>78*T){pg.x=78*T;pg.dir=-1;pg.rt=false;}
      }
      this.updateStealth(dt,e=>e.customType==='castle_knight','l1a4_caught1','l1a4_caught2');
    }

    this.resolveCombat(dt);
    this.commonUpdateEnd(dt);

    if(this.act===1&&this.tut&&this.enemies.every(e=>!e.on)){
      this.shk=0.5;this.shi=4;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,25,'#c8a84e',6,0.8,3);
      this.act=-1; // guard against double-fire while dialogue opens
      D.show([d('narrator','l1a1_win')],()=>{this.bAct2()});
    }
    if(this.act===4&&this.tut&&this.enemies.slice(1).every(e=>!e.on)&&this.heroes[this.ai].x>1400){
      this.shk=0.5;this.shi=4;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,25,'#00aa44',6,0.8,3);
      this.act=-4;
      D.show([d('narrator','l1a4_win')],()=>{this.bAct5()});
    }
  }

  draw(){
    this.drawWorld('#0d2847','#1a3a5a');
    this.drawActors();
    if(this.act===4){
      const H=this.tm?this.tm.h:MAP_H;
      const labels=[['P1',H-5],['P2',H-8],['P3',H-11]];
      labels.forEach(([lbl,row])=>{
        R.x.fillStyle='rgba(0,200,80,0.08)';
        R.x.fillRect(0,row*T-R.cam.y,CW,T);
        R.x.fillStyle='rgba(100,255,120,0.4)';R.x.font='10px monospace';
        R.x.fillText(lbl,8,row*T-R.cam.y+11);
      });
      this.drawGuardRings(e=>e.customType==='castle_knight');
    }
    this.drawFlashes();
  }
}

// ══════════════════════ LEVEL 2: KINGFISHER FESTIVAL ═══════════════════════
class Lv2 extends Scene{
  constructor(){super();this.tileset='tiles_garden';this.theme='garden';
    this.fishing=false;this.fishRound=0;this.fishCaught=0;this.fishMarker=0;this.fishDir=1;this._fishMsg=null;}
  enter(){
    Music.play('underwater');
    this._fox=new Fox(100,100);
    this._skeleton=new Skeleton(100,100);
    this.bAct1();
  }

  // ACT 1: RIVER AMBUSH — underwater combat with an air gauge
  bAct1(retry){
    this.act=1;const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this.projectiles=[];this.megaProjs=[];
    this.tileset='tiles_castle';this.theme='castle';
    buildUnderwaterArena(this.tm,W,H);
    this.decos=[];
    this._darkZones=[];this._timer=90.0;
    this._bubbles=Array.from({length:35},()=>({x:Math.random()*W*T,y:Math.random()*440+40,r:1+Math.random()*3,spd:12+Math.random()*18}));

    // Nesta sits this level out (story: she stayed at the academy — explained
    // in the intro dialogue; the old build made her vanish with no comment).
    this.heroes=this.createHeroes(40,(H-9)*T,['kote','minerva','elber','nick']);
    this.heroes.forEach(h=>{h._floatPhase=Math.random()*6.28;h._underwater=true;});
    this.heroes[0].ctrl=true;this.ai=0;

    const dm1=new Enem(800,(H-5)*T,20,24,'Darkmantle','#334',EHP.soldier,17,'chase','darkmantle');
    const dm2=new Enem(1000,(H-8)*T,20,24,'Darkmantle','#334',EHP.soldier,17,'patrol','darkmantle');
    const dm3=new Enem(1300,(H-9)*T,20,24,'Darkmantle','#334',EHP.soldier,20,'chase','darkmantle');
    const dm4=new Enem(1760,(H-8)*T,20,24,'Darkmantle','#442266',EHP.soldier,17,'static','darkmantle');
    [dm1,dm2,dm3,dm4].forEach(dm=>{
      dm._underwater=true;dm._floatOffset=Math.random()*6.28;dm._scene=this;dm._darkUsed=false;dm.spd=0.9;
    });
    this.enemies=[dm1,dm2,dm3,dm4];

    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l2a1_hint');
    if(retry){this.tut=true;return;}
    D.show([d('narrator','l2a1_1'),d('Kote','l2a1_2'),d('narrator','l2a1_3'),d('tutorial','l2a1_4')],()=>{this.tut=true});
  }

  // ACT 2: FESTIVAL — village social
  bAct2(retry){
    this.act=2;const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this._darkZones=[];
    this.tileset='tiles_garden';this.theme='garden';
    buildGardenPath(this.tm,W,H);
    this.decos=genDecos(W,H,'garden',this.act);
    this.heroes=this.createHeroes(50,(H-4)*T,['kote','minerva','elber','nick']);
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    this.npcs=[
      new NPC(800,gy,'Mayor','villager',[d('Mayor','l2a2_mayor')]),
      new NPC(1000,gy,'Ispin','villager',[d('Ispin','l2a2_ispin')]),
    ];
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l2a2_hint');
    if(retry)return;
    D.show([d('narrator','l2a2_1'),d('Mayor','l2a2_2'),d('Ispin','l2a2_3')],()=>{});
  }

  // ACT 3: FISHING MINIGAME (feedback via toasts; no modal dialogue spam)
  bAct3(retry){
    this.act=3;
    this.fishing=true;this.fishRound=0;this.fishCaught=0;this._fishMsg=null;
    document.getElementById('hud').style.display='none';
    this.setHint('l2a3_hint');
    if(retry)return;
    D.show([d('narrator','l2a3_1'),d('narrator','l2a3_2')],()=>{});
  }

  // ACT 4: SHADOW ON THE ROAD — Kapak fight
  bAct4(retry){
    this.act=4;this.fishing=false;
    const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this._darkZones=[];
    this.tileset='tiles_garden';this.theme='garden';
    buildGardenPath(this.tm,W,H);
    this.decos=genDecos(W,H,'garden',this.act);
    this.heroes=this.createHeroes(50,(H-4)*T,['kote','minerva','elber','nick']);
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    const kapak=new Enem(1000,(H-5)*T,28,56,'Draconian Kapak','#4a6622',EHP.miniboss,20,'boss','draconian_kapak');
    kapak._jumpTimer=2.0;
    this.enemies=[kapak,
      new Enem(1200,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,12,'chase','draconian'),
      new Enem(1800,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,12,'patrol','draconian'),
      new Enem(2400,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,12,'chase','draconian'),
      new Enem(3200,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,12,'patrol','draconian'),
    ];
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l2a4_hint');
    if(retry){this.tut=true;return;}
    D.show([d('narrator','l2a4_1'),d('narrator','l2a4_2'),d('tutorial','l2a4_3')],()=>{this.tut=true});
  }

  update(dt){
    if(this._fishMsg){this._fishMsg.life-=dt;if(this._fishMsg.life<=0)this._fishMsg=null;}
    if(this._healFlash>0)this._healFlash-=dt;
    if(D.on){D.up(dt);return}

    if(this.fishing){
      // Marker speeds up slightly each round; zone shrinks — real difficulty curve
      const spd=2+this.fishRound*0.5;
      this.fishMarker+=this.fishDir*spd*dt;
      if(this.fishMarker>1){this.fishMarker=1;this.fishDir=-1;}
      if(this.fishMarker<0){this.fishMarker=0;this.fishDir=1;}
      if(I.pr('Space')){
        const sweetSpot=this.fishRound===0?0.3:this.fishRound===1?0.2:0.12;
        const inZone=Math.abs(this.fishMarker-0.5)<sweetSpot;
        if(inZone){
          this.fishCaught++;this.fishRound++;
          this._fishMsg={txt:Lang.t('fish_caught'),col:'#44ff88',life:1.2};
          if(this.fishRound>=3){this.fishing=false;this.bAct4();return;}
        }else{
          this._fishMsg={txt:Lang.t('fish_missed'),col:'#ff6666',life:1.0};
        }
      }
      P.up(dt);
      return;
    }

    if(this.commonUpdateStart(dt))return;

    if(this.act===2){
      this.handleNPCTalk();
      if(this.heroes[this.ai].x>1600&&!this._act2done){
        this._act2done=true;
        D.show([d('narrator','l2a2_done1'),d('Ispin','l2a2_done2')],()=>{this.bAct3()});
      }
      this.updateActors(dt);
      this.commonUpdateEnd(dt);
      return;
    }

    this.updateActors(dt);

    // Underwater: clamp to the water volume, idle bob, air gauge
    if(this.act===1){
      const H=this.tm.h;
      this.heroes.forEach(h=>{
        if(h.y<T){h.y=T;h.vy=0;}
        if(h.y+h.h>(H-2)*T){h.y=(H-2)*T-h.h;h.vy=0;}
      });
      this.heroes.filter(h=>!h.ctrl&&h.on).forEach(h=>{
        h.y+=Math.sin(performance.now()/700+(h._floatPhase||0))*0.25;
      });
      this._timer-=dt;
      if(this._timer<=0){this.heroes.forEach(h=>{h.hp=0;h.on=false;});}
    }
    if(this._bubbles)this._bubbles.forEach(b=>{b.y-=b.spd*dt;if(b.y<0)b.y=CH+Math.random()*80;});
    if(this._darkZones){this._darkZones.forEach(dz=>dz.update(dt));this._darkZones=this._darkZones.filter(dz=>dz.life>0);}

    this.resolveCombat(dt);
    this.commonUpdateEnd(dt);

    if(this.act===1&&this.tut&&this.enemies.every(e=>!e.on)){
      this.shk=0.5;this.shi=4;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,25,'#c8a84e',6,0.8,3);
      this.act=-1;
      D.show([d('narrator','l2a1_win')],()=>{this.bAct2()});
    }
    if(this.act===4&&this.tut&&this.enemies.every(e=>!e.on)){
      this.shk=0.5;this.shi=4;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,25,'#00aa44',6,0.8,3);
      this.act=-4;
      D.show([d('narrator','l2a4_win')],()=>{this.nextLevel(Lv3,'stealth')});
    }
  }

  draw(){
    if(this.act===1){
      const g=R.x.createLinearGradient(0,0,0,CH);
      g.addColorStop(0,'#001533');g.addColorStop(0.5,'#002a55');g.addColorStop(1,'#001022');
      R.x.fillStyle=g;R.x.fillRect(0,0,CW,CH);
      const t=performance.now()/2000,ox=Math.floor(R.cam.x*0.12);
      for(let i=0;i<9;i++){
        const lx=((i*130-ox)%(CW+200))-100;
        const alpha=0.025+0.02*Math.sin(t*1.3+i*0.85);
        R.x.fillStyle=`rgba(60,150,255,${alpha})`;
        R.x.beginPath();R.x.moveTo(lx-12,0);R.x.lineTo(lx+12,0);R.x.lineTo(lx+55,CH);R.x.lineTo(lx-55,CH);R.x.closePath();R.x.fill();
      }
      if(this.tm)this.tm.draw(this.tileset);
    }else{
      this.drawWorld('#0d4a2a','#1a5a3a');
    }

    if(this.fishing){
      R.x.fillStyle='rgba(0,100,50,0.3)';
      for(let i=0;i<20;i++){
        const ox=Math.sin(performance.now()*0.001+i)*30;
        R.x.fillRect(CW/2+ox,(i*37)%CH,10,10);
      }
      const barW=40,barH=200;
      const barX=CW-60,barY=(CH-barH)/2;
      R.x.strokeStyle='#fff';R.x.lineWidth=2;
      R.x.strokeRect(barX,barY,barW,barH);
      R.x.fillStyle='#00aa44';
      const sw=this.fishRound===0?0.3:this.fishRound===1?0.2:0.12;
      const sweetStart=barY+(barH*(0.5-sw)),sweetHeight=barH*sw*2;
      R.x.fillRect(barX,sweetStart,barW,sweetHeight);
      const markerY=barY+this.fishMarker*barH;
      R.x.fillStyle='#ffff00';
      R.x.fillRect(barX-5,markerY-10,barW+10,20);
      R.x.fillStyle='#fff';
      R.x.font='bold 16px monospace';R.x.textAlign='center';
      R.x.fillText(`${Lang.t('fish_round')} ${Math.min(3,this.fishRound+1)}/3 — 🐟 ${this.fishCaught}/3`,CW/2,50);
      R.x.fillText('SPACE',CW/2,CH-50);
      if(this._fishMsg){
        R.x.fillStyle=this._fishMsg.col;R.x.font='bold 22px monospace';
        R.x.globalAlpha=Math.min(1,this._fishMsg.life);
        R.x.fillText(this._fishMsg.txt,CW/2,CH/2);
        R.x.globalAlpha=1;
      }
      R.x.textAlign='left';
      P.draw();
      return;
    }

    this.drawActors();
    // Underwater ambience
    if(this.act===1&&this._bubbles){
      const cam=R.cam.x;
      this._bubbles.forEach(b=>{
        const sx=b.x-cam;
        if(sx<-10||sx>CW+10)return;
        R.x.beginPath();R.x.arc(sx,b.y,b.r,0,Math.PI*2);
        R.x.strokeStyle='rgba(150,220,255,0.65)';R.x.lineWidth=1;R.x.stroke();
        R.x.globalAlpha=0.4;
        R.x.fillStyle='rgba(220,240,255,0.9)';
        R.x.beginPath();R.x.arc(sx-b.r*0.3,b.y-b.r*0.35,b.r*0.35,0,Math.PI*2);R.x.fill();
        R.x.globalAlpha=1.0;
      });
    }
    if(this.act===1){R.x.fillStyle='rgba(0,30,110,0.22)';R.x.fillRect(0,0,CW,CH);}
    if(this.act===1&&this._timer!==undefined){
      let tRemain=Math.max(0,this._timer);
      let tColor=tRemain<20?'#ff4444':tRemain<45?'#ffaa00':'#aaddff';
      R.x.fillStyle=tColor;R.x.font='bold 18px monospace';R.x.textAlign='center';
      R.x.fillText(Lang.t('air')+': '+Math.ceil(tRemain)+'s',CW/2,28);
      R.x.textAlign='left';
    }
    if(this._darkZones){const cam=R.cam.x,camY=R.cam.y||0;this._darkZones.forEach(dz=>dz.draw(R.x,cam,camY));}
    this.drawFlashes();
  }
}

// ══════════════════════ LEVEL 3: LIBRARY OF SECRETS ════════════════════════
class Lv3 extends Scene{
  constructor(){super();this.tileset='tiles_library';this.theme='library';this.stealthFailed=false;
    this._alertTimer=0;this._stealthAlert=false;this._prevAnyAlert=false;}
  enter(){
    Music.play('stealth');
    this._fox=new Fox(100,100);
    this._skeleton=new Skeleton(100,100);
    this.bAct1();
  }
  _libraryMap(){
    const W=240,H=MAP_H;
    this.tm=new TM(W,H);
    buildLibraryHalls(this.tm,W,H);
    this.decos=genDecos(W,H,'library',this.act);
    return {W,H};
  }
  _party(){return ['kote','minerva','elber','nick'];} // Nesta rejoins in Lv4

  // ACT 1: SILENCE THRESHOLD — corridor stealth
  bAct1(retry){
    this.act=1;
    const {W,H}=this._libraryMap();
    this.enemies=[];this.npcs=[];this.projectiles=[];this.megaProjs=[];
    this.stealthFailed=false;
    for(let step=0;step<12;step++){this.tm.set(2+step,(H-3-step),1);}
    this.heroes=this.createHeroes(40,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    this.enemies=[
      new Enem(1200,gy,28,40,'Library Censor','#4466aa',EHP.elite,11,'patrol','lib_censor'),
      new Enem(2500,gy,24,36,'Censor Guard','#556688',EHP.soldier,12,'patrol','castle_soldier'),
      new Enem(3000,gy,24,36,'Censor Guard','#556688',EHP.soldier,12,'chase','castle_soldier'),
      new Enem(3500,gy,24,36,'Censor Guard','#556688',EHP.soldier,12,'patrol','castle_soldier'),
    ];
    this.enemies[0].spd=0.8;

    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l3a1_hint');
    if(retry){this.tut=true;return;}
    // Tip line spoken by Kote (the old build had the absent Nesta speak it)
    D.show([d('narrator','l3a1_1'),d('narrator','l3a1_2'),d('tutorial','l3a1_3'),d('Kote','l3a1_4')],()=>{this.tut=true});
  }

  // ACT 2: THE RESTRICTED ARCHIVE — vertical platforming (climb!)
  bAct2(retry){
    this.act=2;
    Music.play('library');
    const {W,H}=this._libraryMap();
    this.enemies=[];this.npcs=[];
    this.heroes=this.createHeroes(40,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;
    this.rebuildCompanions();this.hud();
    this.setHint('l3a2_hint');
    if(retry)return;
    D.show([d('narrator','l3a2_1'),d('tutorial','l3a2_2')],()=>{});
  }

  // ACT 3: ECHOES OF THE PAST — animated weapons
  bAct3(retry){
    this.act=3;
    const {W,H}=this._libraryMap();
    this.enemies=[];this.npcs=[];
    this.heroes=this.createHeroes(50,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    this.enemies=[
      new Enem(1344,gy,28,40,'Animated Sword','#9944ff',EHP.elite,14,'static','animated_sword'),
      new Enem(800,(H-8)*T,24,36,'Cursed Gauntlet','#443322',EHP.elite,13,'static','gauntlet'),
      new Enem(800,gy,24,36,'Animated Sword','#9944ff',EHP.soldier,12,'patrol','animated_sword'),
      new Enem(1400,gy,24,36,'Animated Sword','#9944ff',EHP.soldier,12,'chase','animated_sword'),
      new Enem(2000,gy,24,36,'Animated Sword','#9944ff',EHP.soldier,12,'patrol','animated_sword'),
      new Enem(2600,gy,24,36,'Animated Sword','#9944ff',EHP.soldier,12,'chase','animated_sword'),
      new Enem(3200,gy,24,36,'Animated Sword','#9944ff',EHP.soldier,12,'patrol','animated_sword'),
    ];
    this.enemies.forEach(e=>{e.spd=0.9;});
    this.rebuildCompanions();this.hud();
    this.tut=true;
    this.setHint('l3a3_hint');
    if(retry)return;
    D.show([d('narrator','l3a3_1'),d('narrator','l3a3_2'),d('tutorial','l3a3_3')],()=>{});
  }

  // ACT 4: DECEPTIONS AND DEPTHS — Spectator boss
  bAct4(retry){
    this.act=4;
    const {W,H}=this._libraryMap();
    this.enemies=[];this.npcs=[];
    this.heroes=this.createHeroes(50,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    const spectator=new Enem(1984,(H-8)*T,24,32,'The Spectator','#6644aa',EHP.miniboss,16,'static','spectator');
    spectator._teleTimer=4.0;spectator._tpMinDist=80;
    this.enemies=[spectator,
      new Enem(800,gy,24,36,'Cursed Watcher','#6644aa',EHP.soldier,12,'patrol','gauntlet'),
      new Enem(1400,gy,24,36,'Cursed Watcher','#6644aa',EHP.soldier,12,'chase','gauntlet'),
      new Enem(2600,gy,24,36,'Cursed Watcher','#6644aa',EHP.soldier,12,'chase','gauntlet'),
      new Enem(3200,gy,24,36,'Cursed Watcher','#6644aa',EHP.soldier,12,'patrol','gauntlet'),
    ];
    this.rebuildCompanions();this.hud();
    this.tut=true;
    this.setHint('l3a4_hint');
    if(retry)return;
    D.show([d('narrator','l3a4_1'),d('narrator','l3a4_2'),d('tutorial','l3a4_3')],()=>{});
  }

  // ACT 5: ESCAPE
  bAct5(retry){
    this.act=5;
    const {W,H}=this._libraryMap();
    this.enemies=[];this.npcs=[];
    this.heroes=this.createHeroes(50,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;
    this.npcs=[new NPC(3200,(H-4)*T,'Becklin','villager',[d('Becklin','l3a5_beck')])];
    this.rebuildCompanions();this.hud();
    this.tut=true;
    this.setHint('l3a5_hint');
    if(retry)return;
    D.show([d('narrator','l3a5_1')],()=>{});
  }

  update(dt){
    if(this.commonUpdateStart(dt))return;

    if(this.act===1&&this.tut){
      this.updateStealth(dt,e=>e.customType==='lib_censor','l3a1_caught','l3a1_caught2');
      const hero=this.heroes[this.ai];
      if(hero.x>2000&&!this._stealthDone){
        this._stealthDone=true;
        D.show([d('narrator','l3a1_win')],()=>{this.bAct2()});
        return;
      }
    }

    if(this.act===2&&!this._act2done){
      // Climb objective: reach the top balcony (H-15). Old build said
      // "descend" and checked y<100 against a taller map — impossible text.
      if(this.heroes[this.ai].y<(this.tm.h-14)*T){
        this._act2done=true;
        D.show([d('narrator','l3a2_win')],()=>{this.bAct3()});
        return;
      }
    }

    if(this.act===5){
      this.handleNPCTalk();
      if(!this._act5done&&this.heroes[this.ai].x>3000){
        this._act5done=true;
        D.show([d('narrator','l3a5_win')],()=>{this.nextLevel(Lv4,'library')});
        return;
      }
    }

    this.updateActors(dt);
    this.resolveCombat(dt);
    this.commonUpdateEnd(dt);

    if(this.act===3&&this.tut&&!this._act3done&&this.enemies.every(e=>!e.on)){
      this._act3done=true;
      this.shk=0.5;this.shi=4;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,25,'#9944ff',6,0.8,3);
      D.show([d('narrator','l3a3_win')],()=>{this.bAct4()});
    }
    if(this.act===4&&this.tut&&!this._act4done&&this.enemies.every(e=>!e.on)){
      this._act4done=true;
      this.shk=0.5;this.shi=4;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,25,'#c8a84e',6,0.8,3);
      D.show([d('narrator','l3a4_win')],()=>{this.bAct5()});
    }
  }

  draw(){
    this.drawWorld('#050510','#080818');
    this.drawActors();
    if(this.act===1&&this.tm){
      const H=this.tm.h,camY=R.cam.y;
      R.x.fillStyle='rgba(0,200,80,0.10)';
      R.x.fillRect(0,(H-15)*T-camY,CW,T*2);
      let pulse2=0.5+0.5*Math.sin(performance.now()/400);
      R.x.fillStyle=`rgba(0,220,80,${pulse2})`;
      R.x.font='16px monospace';
      R.x.fillText('→ → →',40,(H-15)*T-camY+T+8);
      this.drawGuardRings(e=>e.customType==='lib_censor');
    }
    if(this.act===2&&this.tm){
      // Objective marker on the top balcony
      const H=this.tm.h;
      let pulse=0.4+0.4*Math.sin(performance.now()/350);
      R.x.fillStyle=`rgba(255,220,80,${pulse})`;
      R.x.font='14px monospace';
      R.x.fillText('★',this.heroes[this.ai].x-R.cam.x,(H-15)*T-6-R.cam.y);
    }
    this.drawFlashes();
  }
}

// ═════════════════════ LEVEL 4: YURTHGREEN MASQUERADE ══════════════════════
class Lv4 extends Scene{
  constructor(){super();this.tileset='tiles_castle';this.theme='castle';}
  _party(){return ['kote','minerva','elber','nesta','nick'];}
  enter(){
    Music.play('library');
    this._fox=new Fox(100,100);
    this._skeleton=new Skeleton(100,100);
    this.bAct1();
  }

  bAct1(retry){
    this.act=1;const W=360,H=MAP_H;
    this.tm=new TM(W,H);
    this.enemies=[];this.npcs=[];this.projectiles=[];this.megaProjs=[];
    buildMasqueradeHall(this.tm,W,H);
    this.decos=genDecos(W,H,'castle',this.act);
    this.heroes=this.createHeroes(60,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;

    const gy=(H-4)*T;
    this.npcs=[
      new NPC(300,gy,'???','bakaris',[d('narrator','l4a1_bak')]),
      new NPC(500,gy,'Levna','villager',[d('Levna','l4a1_levna')]),
      new NPC(700,gy,'Clystran','villager',[d('Clystran','l4a1_cly')]),
      new NPC(900,gy,'Becklin','villager',[d('Becklin','l4a1_beck')]),
      new NPC(1100,gy,'Cudgel','villager',[d('Cudgel','l4a1_cud')]),
      new NPC(1300,gy,'Tem Temble','villager',[d('Tem Temble','l4a1_tem')]),
    ];
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l4a1_hint');
    if(retry)return;
    D.show([d('narrator','l4a1_1'),d('narrator','l4a1_2')],()=>{});
  }

  bAct2(){
    this.act=2;
    D.show([
      d('narrator','l4a2_1'),d('Lord Regent','l4a2_2'),d('Minerva','l4a2_3'),
      d('Lord Regent','l4a2_4'),d('Lord Regent','l4a2_5'),d('Minerva','l4a2_6'),
      d('Lord Regent','l4a2_7'),d('narrator','l4a2_8'),d('narrator','l4a2_9'),
    ],()=>{this.bAct3()});
  }

  bAct3(retry){
    this.act=3;
    if(retry){this._startAct3Combat(true);return;}
    D.show([
      d('narrator','l4a3_1'),d('Lohezet','l4a3_2'),d('Nesta','l4a3_3'),
      d('Lohezet','l4a3_4'),d('Lohezet','l4a3_5'),d('Lohezet','l4a3_6'),
      d('Nesta','l4a3_7'),d('Lohezet','l4a3_8'),d('Nesta','l4a3_9'),d('Lohezet','l4a3_10'),
    ],()=>{this._startAct3Combat()});
  }
  _startAct3Combat(retry){
    const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    buildMasqueradeHall(this.tm,W,H);
    this.decos=genDecos(W,H,'castle',3);
    this.heroes=this.createHeroes(60,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;
    const gy=(H-4)*T;
    this.enemies=[
      new Enem(760,gy,24,36,'Shadow Agent','#222244',EHP.soldier,14,'chase','hideout_fighter'),
      new Enem(1160,gy,24,36,'Shadow Agent','#222244',EHP.soldier,14,'patrol','hideout_fighter'),
      new Enem(1560,gy,16,24,'Shadow Scout','#334455',EHP.grunt,10,'chase','castle_archer'),
      new Enem(2000,gy,24,36,'Shadow Agent','#222244',EHP.soldier,13,'patrol','hideout_fighter'),
      new Enem(2600,gy,24,36,'Shadow Agent','#222244',EHP.soldier,13,'chase','hideout_fighter'),
      new Enem(3200,gy,16,24,'Shadow Scout','#334455',EHP.grunt,10,'patrol','castle_archer'),
    ];
    this.enemies.forEach(e=>{e.spd=0.9;});
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l4a3_hint');
    if(retry){this._act3combat=true;return;}
    D.show([d('Lohezet','l4a3_prove')],()=>{this._act3combat=true;});
  }

  bAct4(){
    this.act=4;
    P.emit(CW/2,CH/2,30,'#d4af37',4,1,3);
    P.emit(CW/2,CH/2,20,'#ffff88',3,0.8,2);
    D.show([
      d('narrator','l4a4_1'),d('Ispin','l4a4_2'),d('Ispin','l4a4_3'),
      d('narrator','l4a4_4'),d('Kote','l4a4_5'),d('Ispin','l4a4_6'),
      d('Kote','l4a4_7'),d('Ispin','l4a4_8'),d('narrator','l4a4_9'),d('narrator','l4a4_10'),
    ],()=>{this.bAct5()});
  }

  bAct5(){
    this.act=5;
    D.show([
      d('narrator','l4a5_1'),d('Becklin','l4a5_2'),d('Becklin','l4a5_3'),
      d('Becklin','l4a5_4'),d('narrator','l4a5_5'),d('narrator','l4a5_6'),
    ],()=>{this.nextLevel(Lv5,'boss')});
  }

  update(dt){
    if(this.commonUpdateStart(dt))return;
    if(this.act===1)this.handleNPCTalk();
    this.updateActors(dt);
    this.resolveCombat(dt);
    this.commonUpdateEnd(dt);

    if(this.act===3&&this._act3combat&&this.enemies&&this.enemies.every(e=>!e.on)){
      this._act3combat=false;
      this.shk=0.5;this.shi=4;
      P.emit(CW/2,CH/2,20,'#4466aa',5,0.6,3);
      D.show([d('Lohezet','l4a3_win1'),d('Nesta','l4a3_win2')],()=>{this.bAct4()});
    }
    if(this.act===1&&this.heroes[this.ai].x>1600&&!this._act1done){
      this._act1done=true;
      D.show([d('narrator','l4a1_done')],()=>{this.bAct2()});
    }
  }

  draw(){
    this.drawWorld('#0d2847','#1a3a5a');
    this.drawActors();
    this.drawFlashes();
  }
}

// ═════════════════════ LEVEL 5: WHEN THE HOME BURNS ════════════════════════
class Lv5 extends Scene{
  constructor(){super();this.tileset='tiles_dungeon';this.theme='dungeon';this.escapeTimer=0;}
  _party(){return ['kote','minerva','elber','nesta','nick'];}
  enter(){
    Music.play('boss');
    this._fox=new Fox(100,100);
    this._skeleton=new Skeleton(100,100);
    this.bAct1();
  }
  _ruinsMap(){
    const W=300,H=MAP_H;
    this.tm=new TM(W,H);
    buildRuinsField(this.tm,W,H);
    this.decos=genDecos(W,H,'dungeon',this.act);
    return {W,H};
  }
  _setup(x){
    const H=this.tm.h;
    this.heroes=this.createHeroes(x||60,(H-4)*T,this._party());
    this.heroes[0].ctrl=true;this.ai=0;
  }

  bAct1(retry){
    this.act=1;
    this._ruinsMap();
    this.enemies=[];this.npcs=[];this.projectiles=[];this.megaProjs=[];
    this._setup();
    const H=this.tm.h;
    this.npcs=[new NPC(600,(H-4)*T,'Armory Master','villager',[d('Armory Master','l5a1_npc')])];
    this.rebuildCompanions();this.hud();
    document.getElementById('hud').style.display='flex';
    this.setHint('l5a1_hint');
    if(retry)return;
    D.show([d('narrator','l5a1_1'),d('narrator','l5a1_2'),d('narrator','l5a1_3')],()=>{});
  }

  bAct2(retry){
    this.act=2;
    this._ruinsMap();this.enemies=[];this.npcs=[];
    this._setup();
    const H=this.tm.h,gy=(H-4)*T;
    this.enemies=[
      new Enem(800,gy,28,40,'Mercenary','#888',EHP.soldier,13,'chase','castle_soldier'),
      new Enem(1000,gy,28,40,'Mercenary','#999',EHP.soldier,13,'chase','castle_knight'),
      new Enem(1400,gy,28,40,'Mercenary','#888',EHP.soldier,13,'patrol','castle_soldier'),
      new Enem(1800,gy,28,40,'Mercenary','#999',EHP.soldier,13,'chase','castle_knight'),
      new Enem(2200,gy,28,40,'Mercenary','#777',EHP.soldier,13,'patrol','castle_archer'),
      new Enem(2600,gy,28,40,'Mercenary','#777',EHP.soldier,13,'patrol','castle_archer'),
      new Enem(2800,gy,28,40,'Mercenary','#aaa',EHP.soldier,13,'chase','hideout_fighter'),
      new Enem(400,(H-9)*T,28,40,'Battlement Guard','#446688',EHP.soldier,13,'static','castle_soldier'),
    ];
    this.enemies.forEach(e=>{e.spd=0.9;});
    this.rebuildCompanions();this.hud();
    this.setHint('l5a2_hint');
    this.tut=true;
    if(retry)return;
    D.show([d('narrator','l5a2_1'),d('narrator','l5a2_2'),d('tutorial','l5a2_3')],()=>{});
  }

  bAct3(retry){
    this.act=3;
    this._ruinsMap();this.enemies=[];this.npcs=[];
    this._setup();
    const H=this.tm.h,gy=(H-4)*T;
    this.enemies=[
      new Enem(1000,(H-5)*T,24,56,'Draconian Kapak','#b87333',EHP.elite,17,'chase','draconian_kapak'),
      new Enem(2600,(H-5)*T,24,56,'Draconian Kapak','#b87333',EHP.elite,17,'chase','draconian_kapak'),
      new Enem(1400,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,13,'patrol','draconian'),
      new Enem(1800,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,13,'chase','draconian'),
      new Enem(2200,gy,24,36,'Draconian Scout','#6a8844',EHP.soldier,13,'patrol','draconian'),
    ];
    this.enemies.forEach(e=>{e.spd=0.9;});
    this.rebuildCompanions();this.hud();
    this.setHint('l5a3_hint');
    this.tut=true;
    if(retry)return;
    D.show([d('Kansaldi','l5a3_1'),d('Kansaldi','l5a3_2'),d('tutorial','l5a3_3')],()=>{});
  }

  bAct4(retry){
    this.act=4;
    this._ruinsMap();this.enemies=[];this.npcs=[];
    this._setup();
    const H=this.tm.h;
    const sivak=new Enem(900,(H-7)*T,32,60,'Sivak Draconian','#556633',EHP.boss,18,'boss','draconian_sivak');
    sivak._stompTimer=3.5;sivak._enraged=false;
    this.enemies=[sivak];
    this.rebuildCompanions();this.hud();
    this.setHint('l5a4_hint');
    this.tut=true;
    if(retry)return;
    D.show([d('narrator','l5a4_1'),d('narrator','l5a4_2'),d('tutorial','l5a4_3')],()=>{});
  }

  bAct5(retry){
    this.act=5;
    this._ruinsMap();this.enemies=[];this.npcs=[];
    this._setup();
    const H=this.tm.h;
    const boilerdrak=new Enem(900,(H-4)*T,28,36,'Boilerdrak','#ff6633',EHP.boss,21,'boss','boilerdrak');
    boilerdrak._projTimer=3.0;boilerdrak._scene=this;
    this.enemies=[boilerdrak];
    this.rebuildCompanions();this.hud();
    this.setHint('l5a5_hint');
    this.tut=true;
    if(retry)return;
    D.show([d('narrator','l5a5_1'),d('narrator','l5a5_2'),d('tutorial','l5a5_3')],()=>{});
  }

  bAct6(retry){
    this.act=6;
    this._ruinsMap();this.enemies=[];this.npcs=[];
    this._setup();
    const H=this.tm.h,gy=(H-4)*T;
    const ogre=new Enem(800,(H-5)*T,28,40,'Ogre','#aa8855',EHP.boss-30,17,'boss','ogre');
    const goblin=new Enem(800,(H-5)*T,16,20,'Goblin Chief','#44cc44',EHP.elite,10,'static','goblin');
    goblin.inv=999;
    this.enemies=[ogre,goblin,
      new Enem(1200,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,10,'patrol','goblin'),
      new Enem(1600,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,10,'chase','goblin'),
      new Enem(2000,gy,20,28,'Goblin','#4a7c3f',EHP.grunt,10,'patrol','goblin'),
    ];
    this._ogreDead=false;
    this.rebuildCompanions();this.hud();
    this.setHint('l5a6_hint');
    this.tut=true;
    if(retry)return;
    D.show([d('narrator','l5a6_1'),d('narrator','l5a6_2'),d('tutorial','l5a6_3')],()=>{});
  }

  bAct7(retry){
    this.act=7;
    this._ruinsMap();this.enemies=[];this.npcs=[];
    this._setup();
    const H=this.tm.h;
    const kansaldi=new Enem(1000,(H-5)*T,40,48,'Kansaldi','#1a0a0a',1500,33,'static','kansaldi');
    kansaldi._breathTimer=4.0;kansaldi._breathActive=false;kansaldi._breathDur=0;
    this.enemies=[kansaldi];
    this.escapeTimer=20;
    this.rebuildCompanions();this.hud();
    this.setHint('l5a7_hint');
    this.tut=true;
    if(retry)return;
    D.show([d('narrator','l5a7_1'),d('narrator','l5a7_2'),d('Kansaldi','l5a7_3'),d('narrator','l5a7_4')],()=>{});
  }

  update(dt){
    if(this.commonUpdateStart(dt))return;

    if(this.act===1){
      this.handleNPCTalk();
      if(!this._act1done&&this.heroes[this.ai].x>1000){
        this._act1done=true;
        D.show([d('narrator','l5a2_1')],()=>{this.bAct2()});
      }
    }

    this.updateActors(dt);

    // Ogre carries the Goblin Chief; chief becomes vulnerable when the ogre falls
    if(this.act===6&&this.enemies.length>=2){
      const ogre=this.enemies[0];
      const goblin=this.enemies[1];
      if(ogre.on&&!this._ogreDead){
        goblin.x=ogre.x;
        goblin.y=ogre.y-goblin.h;
        goblin.inv=999;
      }else if(!ogre.on&&!this._ogreDead){
        this._ogreDead=true;
        D.show([d('narrator','l5a6_fall')],()=>{});
        goblin.ai='chase';goblin._aiOrig='chase';
        goblin.inv=0;
        P.emit(ogre.x+ogre.w/2,ogre.y+ogre.h/2,20,'#44cc44',6,0.8,3);
      }
    }

    this.resolveCombat(dt);
    this.commonUpdateEnd(dt);

    const winTo=(key,next)=>{
      this.shk=0.6;this.shi=5;P.emit(CW/2+R.cam.x,CH/2+R.cam.y,30,'#ff8833',6,0.8,3);
      const a=this.act;this.act=-a;
      D.show([d('narrator',key)],()=>{next()});
    };
    if(this.act===2&&this.tut&&this.enemies.every(e=>!e.on))winTo('l5a2_win',()=>this.bAct3());
    else if(this.act===3&&this.tut&&this.enemies.every(e=>!e.on))winTo('l5a3_win',()=>this.bAct4());
    else if(this.act===4&&this.tut&&this.enemies.every(e=>!e.on))winTo('l5a4_win',()=>this.bAct5());
    else if(this.act===5&&this.tut&&this.enemies.every(e=>!e.on))winTo('l5a5_win',()=>this.bAct6());
    else if(this.act===6&&this.tut&&this.enemies.every(e=>!e.on))winTo('l5a6_win',()=>this.bAct7());

    if(this.act===7&&this.tut){
      this.escapeTimer-=dt;
      if(this.escapeTimer<=0){
        this.act=-7;
        D.show([
          d('narrator','l5end_1'),d('Becklin','l5end_2'),d('Kote','l5end_3'),
          d('Minerva','l5end_4'),d('Arturito','l5end_5'),d('narrator','l5end_6'),
          d('narrator','l5end_7'),d('narrator','l5end_8'),d('narrator','l5end_9'),
          d('Nesta','l5end_10'),d('Nick','l5end_11'),d('narrator','l5end_12'),d('narrator','l5end_13'),
        ],()=>{G.victory()});
      }
    }
  }

  draw(){
    this.drawWorld('#2a0a0a','#3a1a1a');
    if(this.act>=5||this.act<=-5){
      for(let i=0;i<15;i++){
        const x=Math.random()*CW;
        const y=Math.random()*CH;
        R.x.fillStyle=`rgba(255,${100+Math.random()*100},0,${Math.random()*0.2})`;
        R.x.fillRect(x,y,20+Math.random()*40,20+Math.random()*40);
      }
    }
    this.drawActors();
    if(this.act===7&&this.tut&&this.escapeTimer>0){
      R.x.fillStyle='#ff5544';R.x.font='bold 20px monospace';R.x.textAlign='center';
      R.x.fillText(Lang.t('survive')+': '+Math.ceil(this.escapeTimer)+'s',CW/2,30);
      R.x.textAlign='left';
    }
    this.drawFlashes();
  }
}
