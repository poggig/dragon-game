// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — GAME DATA
// Everything content-shaped: hero stats, sprite/FX config, asset manifest,
// map builders, decoration themes, and the FULL i18n string table.
// To build a different game on this engine, this is the file you replace.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

// ═══ HERO STATS ═══
const HERO_STATS={
  // TANK: High HP, solid defense, reliable damage, shorter range
  minerva: {hp:170,spd:1.8,jf:-8.5,atkDmg:26,buffDur:20,dashDur:0.20,atkRange:32,skillRange:48},
  // RELIABLE DPS: Balanced and consistent, never wastes a hit
  elber:   {hp:115,spd:2.1,jf:-9.0,atkDmg:32,skillMult:2.5,dashDur:0.14,atkRange:34,skillRange:55,ranged:true},
  // GLASS CANNON: Highest burst damage, lowest HP
  kote:    {hp:70, spd:2.7,jf:-10, atkDmg:42,skillMult:3.2,dashDur:0.09,atkRange:28,skillRange:44},
  // HEALER: Skill heals party instead of dealing damage. Low offense.
  nick:    {hp:105,spd:1.9,jf:-8.5,atkDmg:18,skillMult:0,  dashDur:0.18,atkRange:30,skillRange:0,isHealer:true,healAmt:30},
  // RANGED GLASS CANNON: Huge skill range, very low HP, fast
  nesta:   {hp:65, spd:2.9,jf:-10, atkDmg:30,skillMult:2.8,dashDur:0.07,atkRange:28,skillRange:130,ranged:true},
  bakaris: {hp:100,spd:2.1,jf:-9.0,atkDmg:24,skillMult:2.0,dashDur:0.12,atkRange:30,skillRange:50},
};

// ═══ ENEMY BALANCE ═══
// Old build gave every basic mob 120–150 HP (5–6 hits each with an average
// hero). Tiers below keep elites/bosses meaty while making trash mobs snappy.
const EHP={grunt:60,soldier:85,elite:120,miniboss:200,boss:300};

// ═══ SPRITE CONFIG ═══
const SpriteConfig={
  heroes:{
    kote:{img:'hero_kote',meta:'hero_kote',stateMap:{idle:'idle',run:'run',jump:'jump',fall:'fall',attack:'attack_A',skill:'attack_B',dash:'dash_attack_A'}},
    minerva:{img:'hero_minerva',meta:'hero_minerva',stateMap:{idle:'idle',run:'run',jump:'jump',fall:'fall',attack:'attack_A',skill:'attack_B',dash:'dash_attack_A'}},
    elber:{img:'hero_elber',meta:'hero_elber',stateMap:{idle:'idle',run:'run',jump:'jump',fall:'fall',attack:'attack_A',skill:'attack_B',dash:'dash_attack_A'}},
    nesta:{img:'hero_nesta',meta:'hero_nesta',stateMap:{idle:'idle',run:'run',jump:'jump',fall:'fall',attack:'attack_A',skill:'attack_B',dash:'dash_attack_A'}},
    nick:{img:'hero_nick',meta:'hero_nick',stateMap:{idle:'idle',run:'run',jump:'jump',fall:'fall',attack:'attack_A',skill:'attack_B',dash:'dash_attack_A'}},
    bakaris:{img:'hero_bakaris',meta:'hero_bakaris',stateMap:{idle:'idle',run:'run',jump:'jump',fall:'fall',attack:'attack_A',skill:'attack_B',dash:'dash_attack_A'}},
  },
  enemies:{
    student:{type:'strip',imgs:{idle:'enemy_castle_knight_idle',run:'enemy_castle_knight_run'},frameH:64},
    castle_knight:{type:'strip',imgs:{idle:'enemy_castle_knight_idle',run:'enemy_castle_knight_run'},frameH:64},
    castle_archer:{type:'strip',imgs:{idle:'enemy_castle_archer_idle',run:'enemy_castle_archer_run'},frameH:64},
    castle_priest:{type:'strip',imgs:{idle:'enemy_castle_priest_idle',run:'enemy_castle_priest_run'},frameH:64},
    castle_soldier:{type:'strip',imgs:{idle:'enemy_castle_soldier_idle',run:'enemy_castle_soldier_run'},frameH:64},
    hideout_fighter:{type:'strip',imgs:{idle:'enemy_hideout_fighter_idle',run:'enemy_hideout_fighter_run'},frameH:64},
    lib_cataloguer:{type:'strip',imgs:{idle:'enemy_lib_cataloguer_idle',run:'enemy_lib_cataloguer_run'},frameH:64},
    lib_censor:    {type:'strip',imgs:{idle:'enemy_lib_censor_idle',run:'enemy_lib_censor_run'},frameH:64},
    lib_director:  {type:'strip',imgs:{idle:'enemy_lib_director_idle',run:'enemy_lib_director_run'},frameH:64},
    lib_researcher:{type:'strip',imgs:{idle:'enemy_lib_researcher_idle',run:'enemy_lib_researcher_run'},frameH:64},
    hideout_scout: {type:'strip',imgs:{idle:'enemy_hideout_scout_idle',run:'enemy_hideout_scout_run'},frameH:64},
    skeleton:      {type:'strip',imgs:{idle:'enemy_skeleton_idle',run:'enemy_skeleton_run'},frameH:64},
    bakaris:{type:'meta',img:'hero_bakaris',meta:'hero_bakaris',stateMap:{idle:'idle',run:'run',attack:'attack_A'}},
    darkmantle:{type:'strip',imgs:{idle:'enemy_darkmantle_idle'},frameW:24,frameH:16},
    draconian:{type:'strip',imgs:{idle:'enemy_dragonborn_idle',run:'enemy_dragonborn_run'},frameW:80,frameH:96},
    draconian_sivak:{type:'strip',imgs:{idle:'enemy_dragonborn_idle',run:'enemy_dragonborn_run'},frameW:80,frameH:96,tint:'#c8d0d8'},
    draconian_kapak:{type:'strip',imgs:{idle:'enemy_dragonborn_idle',run:'enemy_dragonborn_run'},frameW:80,frameH:96,tint:'#b87333'},
    draconian_bozak:{type:'strip',imgs:{idle:'enemy_dragonborn_idle',run:'enemy_dragonborn_run'},frameW:80,frameH:96,tint:'#cd7f32'},
    spectator:{type:'strip',imgs:{idle:'enemy_spectator_idle',attack:'enemy_spectator_attack'},frameH:96},
    mimic:{type:'strip',imgs:{idle:'enemy_mimic_idle',attack:'enemy_mimic_activate'},frameW:72,frameH:48},
    ogre:{type:'strip',imgs:{idle:'enemy_mudman_idle'},frameH:48},
    boilerdrak:{type:'strip',imgs:{idle:'enemy_boilerdrak_idle'},frameH:48},
    goblin:{type:'strip',imgs:{idle:'enemy_orc_warrior_idle',run:'enemy_orc_warrior_run'},frameW:32,frameH:32},
    kansaldi:{type:'meta',img:'enemy_kansaldi',meta:'enemy_kansaldi',stateMap:{idle:'idle',run:'run',attack:'attack_A',skill:'attack_B'}},
  }
};

// ═══ FX CONFIG ═══
const FXConfig={
  heroes:{
    kote:  {atk:'fx_kote_atk',  skill:'fx_kote_skill'},
    minerva:{atk:'fx_minerva_atk',skill:'fx_minerva_skill'},
    elber: {atk:'fx_elber_atk', skill:'fx_elber_skill'},
    nesta: {atk:'fx_nesta_atk', skill:'fx_nesta_skill'},
    nick:  {atk:'fx_nick_atk',  skill:'fx_nick_heal'},
  },
  dash:'fx_dash',
  enemyDeath:'fx_enemy_death',
};

// ═══ ASSET MANIFEST ═══
const ASSET_MANIFEST=[
  {type:'image',key:'tiles_castle',path:'assets/env/castle/tiles.png'},
  {type:'image',key:'tiles_library',path:'assets/env/library/tiles.png'},
  {type:'image',key:'tiles_garden',path:'assets/env/garden/tiles.png'},
  {type:'image',key:'tiles_dungeon',path:'assets/env/dungeon/dungeon_tiles.png'},
  {type:'image',key:'hero_kote',path:'assets/chars/kote.png'},
  {type:'meta',key:'hero_kote',path:'assets/chars/kote.txt'},
  {type:'image',key:'hero_minerva',path:'assets/chars/minerva.png'},
  {type:'meta',key:'hero_minerva',path:'assets/chars/minerva.txt'},
  {type:'image',key:'hero_elber',path:'assets/chars/elber.png'},
  {type:'meta',key:'hero_elber',path:'assets/chars/elber.txt'},
  {type:'image',key:'hero_nesta',path:'assets/chars/nesta.png'},
  {type:'meta',key:'hero_nesta',path:'assets/chars/nesta.txt'},
  {type:'image',key:'hero_nick',path:'assets/chars/nick.png'},
  {type:'meta',key:'hero_nick',path:'assets/chars/nick.txt'},
  {type:'image',key:'hero_bakaris',path:'assets/chars/bakaris.png'},
  {type:'meta',key:'hero_bakaris',path:'assets/chars/bakaris.txt'},
  {type:'image',key:'enemy_castle_knight_idle',path:'assets/enemies/castle_knight/idle.png'},
  {type:'image',key:'enemy_castle_knight_run',path:'assets/enemies/castle_knight/run.png'},
  {type:'image',key:'enemy_castle_archer_idle',path:'assets/enemies/castle_archer/idle.png'},
  {type:'image',key:'enemy_castle_archer_run',path:'assets/enemies/castle_archer/run.png'},
  {type:'image',key:'enemy_castle_priest_idle',path:'assets/enemies/castle_priest/idle.png'},
  {type:'image',key:'enemy_castle_priest_run',path:'assets/enemies/castle_priest/run.png'},
  {type:'image',key:'enemy_castle_soldier_idle',path:'assets/enemies/castle_soldier/idle.png'},
  {type:'image',key:'enemy_castle_soldier_run',path:'assets/enemies/castle_soldier/run.png'},
  {type:'image',key:'enemy_hideout_fighter_idle',path:'assets/enemies/hideout_fighter/idle.png'},
  {type:'image',key:'enemy_hideout_fighter_run',path:'assets/enemies/hideout_fighter/run.png'},
  {type:'image',key:'enemy_orc_warrior_idle',path:'assets/enemies/orc_warrior/idle.png'},
  {type:'image',key:'enemy_orc_warrior_run',path:'assets/enemies/orc_warrior/run.png'},
  {type:'image',key:'enemy_darkmantle_idle',path:'assets/sprites/darkmantle_idle.png'},
  {type:'image',key:'enemy_spectator_idle',path:'assets/sprites/spectator_idle.png'},
  {type:'image',key:'enemy_spectator_attack',path:'assets/sprites/spectator_attack.png'},
  {type:'image',key:'enemy_mudman_idle',path:'assets/sprites/mudman_idle.png'},
  {type:'image',key:'enemy_mudman_appear',path:'assets/sprites/mudman_appear.png'},
  {type:'image',key:'enemy_boilerdrak_idle',path:'assets/sprites/boilerdrak_idle.png'},
  {type:'image',key:'enemy_mimic_idle',path:'assets/sprites/mimic_idle.png'},
  {type:'image',key:'enemy_mimic_activate',path:'assets/sprites/mimic_activate.png'},
  {type:'image',key:'enemy_dragonborn_idle',path:'assets/sprites/dragonborn_idle.png'},
  {type:'image',key:'enemy_dragonborn_run',path:'assets/sprites/dragonborn_run.png'},
  {type:'image',key:'enemy_kansaldi',path:'assets/sprites/kansaldi.png'},
  {type:'meta',key:'enemy_kansaldi',path:'assets/sprites/kansaldi.txt'},
  {type:'image',key:'fx_kote_atk',path:'assets/fx/kote_atk.png'},
  {type:'image',key:'fx_kote_skill',path:'assets/fx/kote_skill.png'},
  {type:'image',key:'fx_minerva_atk',path:'assets/fx/minerva_atk.png'},
  {type:'image',key:'fx_minerva_skill',path:'assets/fx/minerva_skill.png'},
  {type:'image',key:'fx_elber_atk',path:'assets/fx/elber_atk.png'},
  {type:'image',key:'fx_elber_skill',path:'assets/fx/elber_skill.png'},
  {type:'image',key:'fx_nesta_atk',path:'assets/fx/nesta_atk.png'},
  {type:'image',key:'fx_nesta_skill',path:'assets/fx/nesta_skill.png'},
  {type:'image',key:'fx_nick_atk',path:'assets/fx/nick_atk.png'},
  {type:'image',key:'fx_nick_skill',path:'assets/fx/nick_skill.png'},
  {type:'image',key:'fx_nick_heal',path:'assets/fx/nick_heal.png'},
  {type:'image',key:'fx_dash',path:'assets/fx/dash_fx.png'},
  {type:'image',key:'fx_enemy_death',path:'assets/fx/enemy_death.png'},
  {type:'image',key:'fx_nesta_proj',path:'assets/fx/nesta_proj.png'},
  {type:'image',key:'fx_nesta_q',path:'assets/fx/nesta_q_proj.png'},
  {type:'image',key:'fx_kote_barrage',path:'assets/fx/kote_barrage.png'},
  {type:'image',key:'fx_nick_bone',path:'assets/fx/nick_bone.png'},
  {type:'image',key:'fx_elber_mega',path:'assets/fx/elber_mega.png'},
  {type:'image',key:'fx_cleave',path:'assets/fx/cleave_fx.png'},
  {type:'image',key:'deco_tree',path:'assets/env/props/extracted/tree_green.png'},
  {type:'image',key:'deco_bush',path:'assets/env/props/extracted/bush.png'},
  {type:'image',key:'deco_dead_tree',path:'assets/env/props/extracted/dead_tree.png'},
  {type:'image',key:'deco_grass',path:'assets/env/props/extracted/grass_tuft.png'},
  {type:'image',key:'deco_rock_lg',path:'assets/env/props/extracted/rock_large.png'},
  {type:'image',key:'deco_rock_md',path:'assets/env/props/extracted/rock_med.png'},
  {type:'image',key:'deco_rock_sm',path:'assets/env/props/extracted/rock_small.png'},
  {type:'image',key:'deco_banner_red',path:'assets/env/props/extracted/banner_red.png'},
  {type:'image',key:'deco_banner_blue',path:'assets/env/props/extracted/banner_blue.png'},
  {type:'image',key:'deco_candelabra',path:'assets/env/props/extracted/candelabra.png'},
  {type:'image',key:'deco_barrel',path:'assets/env/props/extracted/barrel.png'},
  {type:'image',key:'deco_pot',path:'assets/env/props/extracted/pot.png'},
  {type:'image',key:'deco_bench',path:'assets/env/props/extracted/bench.png'},
  {type:'image',key:'deco_window',path:'assets/env/props/extracted/window_arch.png'},
  {type:'image',key:'deco_potion',path:'assets/env/props/extracted/potion_green.png'},
  {type:'image',key:'deco_candle',path:'assets/env/props/extracted/candle.png'},
  {type:'image',key:'deco_mushroom',path:'assets/env/props/extracted/mushroom.png'},
  {type:'image',key:'deco_chain',path:'assets/env/props/extracted/chain_row.png'},
  {type:'image',key:'deco_weapons',path:'assets/env/props/extracted/weapons_rack.png'},
  {type:'image',key:'deco_planter',path:'assets/env/props/extracted/planter.png'},
  {type:'image',key:'enemy_lib_cataloguer_idle',path:'assets/enemies/lib_cataloguer/idle.png'},
  {type:'image',key:'enemy_lib_cataloguer_run',path:'assets/enemies/lib_cataloguer/run.png'},
  {type:'image',key:'enemy_lib_censor_idle',path:'assets/enemies/lib_censor/idle.png'},
  {type:'image',key:'enemy_lib_censor_run',path:'assets/enemies/lib_censor/run.png'},
  {type:'image',key:'enemy_lib_director_idle',path:'assets/enemies/lib_director/idle.png'},
  {type:'image',key:'enemy_lib_director_run',path:'assets/enemies/lib_director/run.png'},
  {type:'image',key:'enemy_lib_researcher_idle',path:'assets/enemies/lib_researcher/idle.png'},
  {type:'image',key:'enemy_lib_researcher_run',path:'assets/enemies/lib_researcher/run.png'},
  {type:'image',key:'enemy_hideout_scout_idle',path:'assets/enemies/hideout_scout/idle.png'},
  {type:'image',key:'enemy_hideout_scout_run',path:'assets/enemies/hideout_scout/run.png'},
  {type:'image',key:'enemy_skeleton_idle',path:'assets/enemies/skeleton/idle.png'},
  {type:'image',key:'enemy_skeleton_run',path:'assets/enemies/skeleton/run.png'},
  {type:'image',key:'deco_bookshelf',path:'assets/env/props/extracted/bookshelf_small.png'},
  {type:'image',key:'deco_chest',path:'assets/env/props/extracted/chest_dung.png'},
  {type:'image',key:'deco_banner_green',path:'assets/env/props/extracted/banner_green.png'},
  {type:'image',key:'deco_potion_red',path:'assets/env/props/extracted/potion_red.png'},
];

// ═══ MAP BUILDERS ═══
// IMPORTANT: every map must be at least MAP_H tiles tall. The old maps were
// 16–20 tiles (256–320px) against a 480px viewport, so the bottom ~40% of the
// screen showed parallax sky *below* the floor. MAP_H=34 (544px) fixes it.
const MAP_H=34;

function buildCastleArena(tm,W,H){
  for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
  for(let x=0;x<8;x++)for(let y=H-6;y<H-3;y++)tm.set(x,y,1)
  const bs=Math.floor(W*0.7)
  for(let x=bs;x<W;x++){tm.set(x,H-6,1);tm.set(x,H-5,1);tm.set(x,H-4,1)}
  for(let x=bs-4;x<bs;x++){tm.set(x,H-5,1);tm.set(x,H-4,1)}
  for(let x=bs-8;x<bs-4;x++)tm.set(x,H-4,1)
  const lp=Math.floor(W*0.22);
  for(let i=lp;i<lp+7;i++)tm.set(i,H-7,3)
  const mid=Math.floor(W/2)
  for(let i=-4;i<5;i++)tm.set(mid+i,H-7,3)
  for(let i=-3;i<4;i++)tm.set(mid+i,H-12,3)
}

function buildGardenPath(tm,W,H){
  for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
  for(let x=18;x<30;x++){tm.set(x,H-4,1);tm.set(x,H-3,1)}
  for(let x=20;x<28;x++)tm.set(x,H-5,1)
  const rh=Math.floor(W*0.6)
  for(let x=rh;x<rh+12;x++){tm.set(x,H-4,1);tm.set(x,H-3,1)}
  for(let x=rh+2;x<rh+10;x++)tm.set(x,H-5,1)
  const lp=Math.floor(W*0.15)
  for(let i=0;i<7;i++)tm.set(lp+i,H-8,3)
  const mid=Math.floor(W/2)
  for(let i=-5;i<5;i++)tm.set(mid+i,H-8,3)
  const rp=Math.floor(W*0.72)
  for(let i=0;i<7;i++)tm.set(rp+i,H-8,3)
  for(let i=-3;i<4;i++)tm.set(mid+i,H-13,3)
}

function buildLibraryHalls(tm,W,H){
  for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
  const walls=[Math.floor(W*0.22),Math.floor(W*0.48),Math.floor(W*0.74)]
  walls.forEach(wx=>{
    for(let y=H-9;y<H-3;y++){tm.set(wx,y,1);tm.set(wx+1,y,1)}
  })
  for(let x=walls[0]+2;x<walls[1]-1;x++)tm.set(x,H-11,3)
  for(let x=walls[1]+2;x<walls[2]-1;x++)tm.set(x,H-11,3)
  for(let x=2;x<W-2;x++)tm.set(x,H-15,3)
}

function buildMasqueradeHall(tm,W,H){
  for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
  const step=Math.floor(W/5)
  for(let p=1;p<5;p++){
    const px=p*step
    for(let y=H-3;y>H-10;y--){tm.set(px,y,1);tm.set(px+1,y,1)}
  }
  const balW=Math.floor(W*0.12)
  for(let x=0;x<balW;x++){tm.set(x,H-6,1);tm.set(x,H-5,1);tm.set(x,H-4,1)}
  for(let x=W-balW;x<W;x++){tm.set(x,H-6,1);tm.set(x,H-5,1);tm.set(x,H-4,1)}
  const mid=Math.floor(W/2)
  for(let i=-3;i<4;i++)tm.set(mid+i,H-11,3)
}

function buildRuinsField(tm,W,H){
  for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
  ;[[12,3],[28,4],[48,3],[70,4],[88,3]].forEach(([cx,h])=>{
    for(let di=-Math.floor(h/2);di<=Math.floor(h/2);di++){
      const ht=h-Math.abs(di)
      for(let j=0;j<ht;j++)tm.set(cx+di,H-3-j,2)
    }
  })
  ;[Math.floor(W*0.25),Math.floor(W*0.55),Math.floor(W*0.8)].forEach(x=>{
    for(let j=0;j<6;j++)tm.set(x,H-3-j,1)
  })
  const p1=Math.floor(W*0.08),p2=Math.floor(W*0.38),p3=Math.floor(W*0.62),p4=Math.floor(W*0.85)
  ;[[p1,H-8,5],[p2,H-10,5],[p3,H-8,5],[p4,H-10,4]].forEach(([sx,py,pw])=>{
    for(let i=0;i<pw;i++)tm.set(sx+i,py,3)
  })
}

function buildUnderwaterArena(tm,W,H){
  for(let x=0;x<W;x++)tm.set(x,0,1);
  for(let x=0;x<W;x++){tm.set(x,H-1,1);tm.set(x,H-2,1);}
  for(let y=0;y<H;y++){tm.set(0,y,1);tm.set(W-1,y,1);}
  [[5,H-4,5],[18,H-5,4],[34,H-4,6],[50,H-6,3],[66,H-4,5],[84,H-5,4],[100,H-4,5],[118,H-5,4]].forEach(([px,py,pw])=>{
    for(let i=0;i<pw;i++){tm.set(px+i,py,1);tm.set(px+i,py+1,1);}
  });
}

// ═══ BACKGROUND LAYER (pixel-art parallax) ═══
function drawBgLayer(ctx,cam,theme,W,H){
  const ox=Math.floor(cam.x*0.3);
  ctx.save();
  if(theme==='castle'){
    ctx.fillStyle='#0a1e35';
    for(let i=0;i<20;i++){
      const bx=((i*180-ox)%((W*T)+200))-100;
      ctx.fillRect(bx,CH-220,40,160);
      for(let j=0;j<3;j++)ctx.fillRect(bx+j*14,CH-240,10,20);
      ctx.fillStyle='#ff9944';ctx.fillRect(bx+14,CH-190,12,18);ctx.fillStyle='#0a1e35';
    }
    ctx.fillStyle='rgba(255,255,200,0.6)';
    for(let i=0;i<40;i++){
      const sx=((i*137+ox*0.1)%(CW+200))-100;
      const sy=(i*73)%120;
      ctx.fillRect(sx,sy,2,2);
    }
  }else if(theme==='garden'){
    ctx.fillStyle='#0a2a18';
    for(let i=0;i<8;i++){
      const bx=((i*220-ox)%((W*T)+300))-150;
      ctx.beginPath();ctx.arc(bx+80,CH-60,90,Math.PI,0);ctx.fill();
      ctx.fillStyle='#2a1a0a';ctx.fillRect(bx+70,CH-130,8,40);
      ctx.fillStyle='#0a2a18';ctx.beginPath();ctx.arc(bx+74,CH-150,28,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#0a2a18';
    }
    ctx.fillStyle='#0d3a22';
    ctx.beginPath();ctx.moveTo(0,CH-100);
    for(let i=0;i<10;i++){ctx.lineTo(i*100+((ox*0.2)%100)-50,CH-100-Math.sin(i*1.3)*60-40);}
    ctx.lineTo(CW,CH-100);ctx.fill();
  }else if(theme==='library'){
    ctx.fillStyle='#05050c';
    for(let i=0;i<12;i++){
      const bx=((i*160-ox)%((W*T)+200))-100;
      ctx.fillStyle='#1a1008';ctx.fillRect(bx,CH-280,120,220);
      const bookColors=['#6a2020','#205820','#202058','#585820','#582058','#205858'];
      for(let r=0;r<4;r++){
        for(let b=0;b<8;b++){
          ctx.fillStyle=bookColors[(r+b+i)%bookColors.length];
          ctx.fillRect(bx+4+b*14,CH-260+r*44,12,40);
        }
      }
    }
    ctx.fillStyle='#ffcc44';
    for(let i=0;i<6;i++){
      const lx=((i*240-ox*0.5)%((W*T)+200))-100;
      ctx.fillRect(lx,20,4,12);ctx.fillRect(lx-6,32,16,20);
      ctx.fillStyle='rgba(255,200,50,0.15)';
      ctx.beginPath();ctx.arc(lx+2,48,30,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#ffcc44';
    }
  }else if(theme==='dungeon'){
    ctx.fillStyle='#080808';
    for(let row=0;row<8;row++){
      for(let col=0;col<30;col++){
        const bx=((col*80+(row%2)*40-ox*0.4)%(CW+160))-80;
        const by=row*40;
        ctx.fillStyle=row%2===0?'#111':'#0d0d0d';
        ctx.fillRect(bx,by,76,36);
        ctx.fillStyle='#0a0a0a';ctx.fillRect(bx,by+34,76,4);
      }
    }
    for(let i=0;i<5;i++){
      const tx=((i*320-ox*0.6)%(CW+200))-100;
      ctx.fillStyle='#ff6600';ctx.fillRect(tx,60,6,20);
      ctx.fillStyle='rgba(255,100,0,0.2)';ctx.beginPath();ctx.arc(tx+3,55,25,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

// ═══ DECORATION GENERATOR ═══
const DecoThemes={
  castle:{
    ground:['deco_barrel','deco_pot','deco_bench','deco_rock_sm'],
    wall:['deco_banner_red','deco_banner_blue','deco_window','deco_candelabra'],
    bg:['deco_weapons','deco_planter']
  },
  garden:{
    ground:['deco_tree','deco_bush','deco_rock_lg','deco_rock_md','deco_mushroom'],
    wall:['deco_tree','deco_dead_tree'],
    bg:['deco_grass','deco_bush','deco_rock_sm']
  },
  library:{
    ground:['deco_barrel','deco_pot','deco_candle','deco_potion','deco_bookshelf','deco_chest'],
    wall:['deco_candelabra','deco_banner_blue','deco_window','deco_banner_green'],
    bg:['deco_potion','deco_candle','deco_mushroom','deco_potion_red']
  },
  dungeon:{
    ground:['deco_rock_lg','deco_rock_md','deco_barrel','deco_weapons'],
    wall:['deco_chain','deco_candelabra','deco_banner_red'],
    bg:['deco_rock_sm','deco_candle','deco_pot']
  }
};

function genDecos(W,H,theme,seed){
  const rng=(()=>{let s=seed*9301+49297;return()=>{s=(s*9301+49297)%233280;return s/233280;}})();
  const th=DecoThemes[theme]||DecoThemes.castle;
  const decos=[];
  const floorY=(H-3)*T;
  function getImg(key){return Assets.images[key]||null;}

  const bgKeys=th.bg||[];
  for(let i=0;i<Math.floor(W/5);i++){
    const key=bgKeys[Math.floor(rng()*bgKeys.length)];
    const img=getImg(key);
    if(!img)continue;
    const rawX=(rng()*W*T);
    const minX=img.width/2+16;
    const maxX=W*T-img.width/2-16;
    const x=Math.max(minX,Math.min(maxX,rawX));
    const y=rng()<0.5?(floorY-img.height-(rng()*40)):floorY-img.height-rng()*T*8;
    decos.push({x,y,img,a:0.15,layer:'bg'});
  }
  const wallKeys=th.wall||[];
  for(let i=0;i<Math.floor(W/8);i++){
    const key=wallKeys[Math.floor(rng()*wallKeys.length)];
    const img=getImg(key);
    if(!img)continue;
    const rawX=rng()*W*T;
    const minX=img.width+8;
    const maxX=W*T-img.width-8;
    const x=Math.max(minX,Math.min(maxX,rawX));
    // Keep wall hangings in the visible band above the floor (not off-screen sky)
    const y=floorY-img.height-T*2-rng()*T*14;
    decos.push({x,y,img,a:0.35,layer:'wall'});
  }
  const groundKeys=th.ground||[];
  for(let i=0;i<Math.floor(W/6);i++){
    const key=groundKeys[Math.floor(rng()*groundKeys.length)];
    const img=getImg(key);
    if(!img)continue;
    const rawX=rng()*W*T;
    const minX=img.width+8;
    const maxX=W*T-img.width-8;
    const x=Math.max(minX,Math.min(maxX,rawX));
    const y=floorY-img.height;
    decos.push({x,y,img,a:0.9,layer:'ground'});
  }
  return decos;
}

// ═══════════════════════════════════════════════════════════════════════════
// I18N — full string table. EVERY player-facing line lives here (the old
// build only translated the title screen; the ES/IT buttons were cosmetic).
// ═══════════════════════════════════════════════════════════════════════════
Lang.strings={
en:{
  title:'Chronicles of Azurerune', subtitle:'The Heroes’ Challenge',
  lvl1:'Level 1: School Day', lvl2:'Level 2: Kingfisher Festival', lvl3:'Level 3: Library of Secrets',
  lvl4:'Level 4: Yurthgreen Masquerade', lvl5:'Level 5: When the Home Burns',
  enemies:'Enemies', victory:'Victory!', defeat:'Defeat!', press_space:'[SPACE or CLICK]',
  paused:'PAUSED', resume:'Resume [ESC]', restart_act:'Restart act [R]', quit_title:'Quit to title [Q]',
  game_over:'THE PARTY HAS FALLEN', retry_act:'Retry this act [R]',
  hero_down:'DOWN!', revived:'REVIVED!', scrolls:'Scrolls', hp_full:'FULL',
  titan_form:'TITAN FORM!', party_invisible:'PARTY INVISIBLE!', cleave:'CLEAVE!', barrage:'BARRAGE!',
  freeze_shot:'FREEZE SHOT!', bone_shot:'BONE SHOT!', party_healed:'PARTY HEALED!',
  ult_ready:'[X] Ultimate ready', ult_used:'[X] Ultimate used', air:'AIR', survive:'SURVIVE',
  fish_caught:'Fish caught!', fish_missed:'Missed!', fish_round:'Round', muted:'[M] MUTED', music:'[M] music',
  the_end:'THE END', credits:'Chronicles of Azurerune — Book One Complete', press_any:'Press SPACE for title',
  narrator:'Narrator', tutorial:'Tutorial', guard:'Guard',
  // Level 1
  l1a1_hint:'Act 1: Final Exam — defeat Bakaris and his crew!',
  l1a1_1:'Azurerune Fortress — the Tribunal watches from above.',
  l1a1_2:'This is the final exam. Survive!',
  l1a1_tut:'ARROWS/WASD move · Z attack · Q skill · K dash · X ultimate · TAB swap hero · ESC pause',
  l1a1_bak:'"You think you can beat me?"',
  l1a1_go:'Defeat Bakaris and his crew to advance!',
  l1a1_win:'Victory in the exam!',
  l1a2_1:'The exam ends. Bakaris falls to one knee.',
  l1a2_2:'You... you beat me...',
  l1a2_3:'You hurt my familiar. You sealed your fate!',
  l1a2_4:'Nesta draws a blade. Blood spills.',
  l1a2_5:'Bakaris screams as a scar tears across his face.',
  l1a2_6:'The tribunal above shifts uneasily.',
  l1a2_7:'This was no simple exam anymore.',
  l1a3_hint:'Act 3: Hallway Rumors — walk right; press Z near students to talk',
  l1a3_1:'Azurerune corridors. Whispers of the exam echo.',
  l1a3_2:'Talk to the other students. What do they know?',
  l1a3_levna1:'That mark on Bakaris... I’ve seen something like it in my uncle’s bestiary.',
  l1a3_levna2:'A spiral wound pattern. Like a talon that carries memory.',
  l1a3_levna3:'Blue dragons leave marks that don’t fade. Not on skin, not on stone.',
  l1a3_levna4:'Whatever Nesta did — she’s written herself into history whether she wanted to or not.',
  l1a3_cly1:'Dragons are supposed to be extinct. The Cataclysm supposedly ended all of that.',
  l1a3_cly2:'But that wound on Bakaris — I’ve studied metallurgy. No blade makes that spiral.',
  l1a3_cly3:'Living things make spiral wounds. Something channeled through Nesta’s hand.',
  l1a3_cly4:'I don’t know what it means. But I intend to find out.',
  l1a3_dar1:'Did you see it? Bakaris went down like he’d been struck by lightning.',
  l1a3_dar2:'A real knight fights for others. I don’t think Bakaris ever understood that.',
  l1a3_dar3:'I want to serve someone who does. Someone like... well. Like all of you.',
  l1a3_dar4:'If you ever need someone to carry your gear — I’m serious. Call on me.',
  l1a3_and1:'The old gods watch this school more closely than its masters believe.',
  l1a3_and2:'Bakaris comes from a powerful family. This wound to his pride will fester.',
  l1a3_and3:'Pride is the wound that never heals without humility — and he has none.',
  l1a3_and4:'I will pray for you. I think you have made an enemy who remembers.',
  l1a3_done:'The truth becomes clearer with each step...',
  l1a4_hint:'Act 4: Night Infiltration — avoid the Guard! Three platforms: pick your level!',
  l1a4_1:'Under cover of night, the group sneaks into the library.',
  l1a4_2:'A guard patrols and switches between three platforms.',
  l1a4_3:'Stay on a platform the guard is NOT on. Jump up or drop down to dodge.',
  l1a4_4:'Or press X as Nesta to turn the whole party invisible and walk right past.',
  l1a4_caught1:'Intruder! The heroes flee...',
  l1a4_caught2:'I see you! Sound the alarm!',
  l1a4_win:'The library secrets are revealed!',
  l1a5_1:'The library holds many secrets.',
  l1a5_2:'The group gathers to discuss their findings.',
  l1a5_3:'The Kingfisher Festival is in Vogler. Join us!',
  l1a5_4:'Vogler: the trading hub of the realm.',
  l1a5_5:'But first, they must understand the scar.',
  l1a5_6:'A blue dragon. A connection. A journey begins.',
  l1a5_7:'Next stop: Vogler.',
  // Level 2
  l2a1_hint:'River Ambush: defeat the Darkmantles before your air runs out!',
  l2a1_1:'On the river road to Vogler, the current drags the party under...',
  l2a1_2:'Nesta stayed at the academy — her fox needs healing, and the Tribunal has questions. She’ll catch up.',
  l2a1_3:'Suddenly, Darkmantles emerge from the darkness!',
  l2a1_4:'Defeat them! Watch the AIR gauge — surface is sealed!',
  l2a1_win:'The ambush is defeated!',
  l2a2_hint:'Festival: explore Vogler and talk to the locals',
  l2a2_1:'Vogler village — the festival center.',
  l2a2_2:'Welcome, heroes! But darkness clouds our joy...',
  l2a2_3:'The sabotage must be revealed!',
  l2a2_mayor:'Welcome to Vogler village! Enjoy the Kingfisher Festival.',
  l2a2_ispin:'The fishing competition awaits! Head east when you’re ready.',
  l2a2_done1:'The fishing competition is about to start!',
  l2a2_done2:'Head to the river — it’s time to fish!',
  l2a3_hint:'Fishing Minigame: press SPACE when the marker is in the green zone — 3 catches to win',
  l2a3_1:'The Kingfisher Fishing Competition begins!',
  l2a3_2:'Time to prove your skills with the line.',
  l2a4_hint:'Shadow on the Road: defeat the Draconian Kapak!',
  l2a4_1:'Shadow on the Road...',
  l2a4_2:'A Draconian Kapak blocks the path!',
  l2a4_3:'Defeat it!',
  l2a4_win:'The Draconian Kapak falls in acid!',
  // Level 3
  l3a1_hint:'Silence Threshold: slip past the Censor — use the upper path',
  l3a1_1:'Inside the Library of Secrets...',
  l3a1_2:'A Censor patrols the halls. Its guards watch the floor.',
  l3a1_3:'Avoid detection and reach the far end!',
  l3a1_4:'The censor patrols the middle. Take the upper balcony to slip through unseen.',
  l3a1_caught:'Detected! Forced to retreat...',
  l3a1_caught2:'The guard noticed you! Fall back!',
  l3a1_win:'Stealth successful!',
  l3a2_hint:'The Restricted Archive: climb to the top balcony!',
  l3a2_1:'The forbidden knowledge is kept on the highest shelf, as always.',
  l3a2_2:'Climb the bookshelf walls and platforms to the top balcony!',
  l3a2_win:'You have reached the restricted archive.',
  l3a3_hint:'Echoes of the Past: destroy the animated weapons!',
  l3a3_1:'The chamber echoes with ancient magic...',
  l3a3_2:'Swords move on their own!',
  l3a3_3:'Destroy them all!',
  l3a3_win:'The curse breaks!',
  l3a4_hint:'Deceptions and Depths: defeat the Spectator!',
  l3a4_1:'A figure floats above the abyss...',
  l3a4_2:'The Spectator observes all who enter. It teleports when cornered!',
  l3a4_3:'Defeat it!',
  l3a4_win:'The Spectator falls!',
  l3a5_hint:'Escape: reach the exit on the right!',
  l3a5_1:'The exit corridor lies ahead.',
  l3a5_beck:'You made it through the library. Impressive. Now run — before the Directors wake.',
  l3a5_win:'You escaped the library!',
  // Level 4
  l4a1_hint:'The Yurthgreen Masquerade: mingle and talk (Z near guests)',
  l4a1_1:'The Yurthgreen Masquerade begins...',
  l4a1_2:'A grand celebration of heroes and legends. Nesta rejoins the party at last!',
  l4a1_bak:'A masked noble watches you coldly. That scar under the mask... it’s Bakaris. He says nothing. Yet.',
  l4a1_levna:'The destiny awaits us.',
  l4a1_cly:'Our bonds are tested.',
  l4a1_beck:'What lies ahead?',
  l4a1_cud:'The choice is ours.',
  l4a1_tem:'Magic flows through us all.',
  l4a1_done:'Moving deeper into the masquerade...',
  l4a2_1:'The great hall grows quiet. A herald calls Minerva forward.',
  l4a2_2:'Minerva Amberfall. Step forward and kneel.',
  l4a2_3:'I... yes, my lord.',
  l4a2_4:'This armor was worn by Helena Starmantle, Knight of the Rose. She fell at Neraka.',
  l4a2_5:'She named no successor. The armor has waited — for the one it would choose.',
  l4a2_6:'Why me? I’m a scholar. I study things. I don’t...',
  l4a2_7:'The knights of old understood that wisdom and courage are not opposites.',
  l4a2_8:'The armor settles onto Minerva’s shoulders with a sound like a long-held breath released.',
  l4a2_9:'Something ancient and patient has finally found its purpose.',
  l4a3_1:'A masked figure peels away from the dancing crowd — unseen by all others.',
  l4a3_2:'Nesta. The girl who scarred the unbeatable Bakaris.',
  l4a3_3:'Who are you?',
  l4a3_4:'Someone who recognizes power when she sees it. And power needs direction.',
  l4a3_5:'The Dragon Armies are moving. Your little trick won’t be enough.',
  l4a3_6:'I can teach you what the school won’t. Real shadow magic.',
  l4a3_7:'At what cost?',
  l4a3_8:'Your trust. And your silence. For now.',
  l4a3_9:'I’ll think about it.',
  l4a3_10:'Don’t think too long. Events move faster than most realize.',
  l4a3_prove:'Prove yourself.',
  l4a3_hint:'Defeat the shadow agents!',
  l4a3_win1:'Impressive. The pact is sealed.',
  l4a3_win2:'What have I agreed to...?',
  l4a4_1:'Ispin draws the heroes into a private alcove behind a tapestry.',
  l4a4_2:'I shouldn’t do this here. But I’ve run out of time to wait.',
  l4a4_3:'These pearls belonged to my grandmother. She was a scryer — she saw paths.',
  l4a4_4:'Ispin arranges the pearls in a circle on the floor. They begin to glow.',
  l4a4_5:'I see... a woman. Standing in fire. She’s not afraid of it.',
  l4a4_6:'Your mother, Kote. She was Solamnic. Did you know?',
  l4a4_7:'She never told me. She never talked about where she came from.',
  l4a4_8:'She was protecting you from what comes with that name. But that time is ending.',
  l4a4_9:'The pearls dim. The vision fades. The moons shift overhead.',
  l4a4_10:'Something has been set in motion that cannot be undone.',
  l4a5_1:'The ritual fades...',
  l4a5_2:'There is much we have learned.',
  l4a5_3:'The Golden Museum holds secrets.',
  l4a5_4:'There, you will find the answers you seek.',
  l4a5_5:'The masquerade concludes.',
  l4a5_6:'But the true test lies ahead...',
  // Level 5
  l5a1_hint:'Calm Before Storm: walk right to the reenactment field',
  l5a1_1:'Vogler prepares a war reenactment for the festival’s end...',
  l5a1_2:'When the home burns, all must rise.',
  l5a1_3:'Walk forward to watch the actors take the field.',
  l5a1_npc:'Arm yourselves. Something about these "actors" feels wrong.',
  l5a2_hint:'Broken Illusion: the mercenaries attack!',
  l5a2_1:'The actors reveal their true weapons!',
  l5a2_2:'This is no illusion — this is a real raid!',
  l5a2_3:'Defeat all soldiers!',
  l5a2_win:'The soldiers fall!',
  l5a3_hint:'The Red Ruin: draconians reinforce!',
  l5a3_1:'The Red Ruin has come!',
  l5a3_2:'You cannot stop us all!',
  l5a3_3:'Defeat the draconians!',
  l5a3_win:'The draconians retreat!',
  l5a4_hint:'First Wave: Sivak Draconian boss!',
  l5a4_1:'A towering Sivak Draconian lands, wings blocking the sun.',
  l5a4_2:'It stomps the ground — keep your distance when it rears up!',
  l5a4_3:'This foe is formidable!',
  l5a4_win:'The Sivak falls!',
  l5a5_hint:'Iron and Fire: the Boilerdrak awakes!',
  l5a5_1:'From the flames, the Boilerdrak emerges!',
  l5a5_2:'Its armor glows with terrible heat — it spits fire from afar!',
  l5a5_3:'Stand firm!',
  l5a5_win:'The Boilerdrak is vanquished!',
  l5a6_hint:'Last Stand: the Ogre and the Goblin Chief!',
  l5a6_1:'A towering Ogre appears, bearing a Goblin Chief on its back!',
  l5a6_2:'The chief is untouchable while he rides — topple the Ogre first!',
  l5a6_3:'Defeat them!',
  l5a6_fall:'The Goblin Chief tumbles to the ground!',
  l5a6_win:'The last defenders fall!',
  l5a7_hint:'No Hope: SURVIVE the Dragon Commander!',
  l5a7_1:'The ground shakes...',
  l5a7_2:'Kansaldi, the Dragon Commander, emerges from the fire!',
  l5a7_3:'Your struggle ends now!',
  l5a7_4:'This battle cannot be won. Survive until you see an opening!',
  l5end_1:'Becklin stands in the doorway as the walls ignite around her.',
  l5end_2:'"Don’t look back! Run — all of you! Run and don’t stop!"',
  l5end_3:'"Becklin — NO—"',
  l5end_4:'"We can’t leave her, we have to—"',
  l5end_5:'"I will hold the line. This is what I was made for."',
  l5end_6:'Arturito charges into the inferno. Kansaldi turns from the fleeing heroes.',
  l5end_7:'The heroes run through walls of fire, through collapsing stone, through choking smoke.',
  l5end_8:'Behind them: a roar that shakes the earth. Then silence. Then nothing.',
  l5end_9:'They emerge into cold night air, lungs burning, eyes streaming.',
  l5end_10:'"We lost them both."',
  l5end_11:'"We’re alive. They made sure of that."',
  l5end_12:'Vogler village. Dawn. The survivors count what they’ve saved and what they’ve lost.',
  l5end_13:'Chronicles of Azurerune. Book One: Complete.',
},
es:{
  title:'Crónicas de Azurerune', subtitle:'El Desafío de los Héroes',
  lvl1:'Nivel 1: Día de Escuela', lvl2:'Nivel 2: Festival del Martín Pescador', lvl3:'Nivel 3: Biblioteca de Secretos',
  lvl4:'Nivel 4: Mascarada de Yurthgreen', lvl5:'Nivel 5: Cuando Arde el Hogar',
  enemies:'Enemigos', victory:'¡Victoria!', defeat:'¡Derrota!', press_space:'[ESPACIO o CLIC]',
  paused:'PAUSA', resume:'Continuar [ESC]', restart_act:'Reiniciar acto [R]', quit_title:'Salir al menú [Q]',
  game_over:'EL GRUPO HA CAÍDO', retry_act:'Reintentar este acto [R]',
  hero_down:'¡CAÍDO!', revived:'¡REVIVIDO!', scrolls:'Pergaminos', hp_full:'LLENO',
  titan_form:'¡FORMA TITÁN!', party_invisible:'¡GRUPO INVISIBLE!', cleave:'¡TAJO!', barrage:'¡RÁFAGA!',
  freeze_shot:'¡DISPARO HELADO!', bone_shot:'¡DISPARO ÓSEO!', party_healed:'¡GRUPO CURADO!',
  ult_ready:'[X] Definitiva lista', ult_used:'[X] Definitiva usada', air:'AIRE', survive:'SOBREVIVE',
  fish_caught:'¡Pez atrapado!', fish_missed:'¡Fallaste!', fish_round:'Ronda', muted:'[M] SILENCIO', music:'[M] música',
  the_end:'FIN', credits:'Crónicas de Azurerune — Libro Uno Completo', press_any:'Pulsa ESPACIO para el menú',
  narrator:'Narrador', tutorial:'Tutorial', guard:'Guardia',
  l1a1_hint:'Acto 1: Examen Final — ¡derrota a Bakaris y su equipo!',
  l1a1_1:'Fortaleza de Azurerune — el Tribunal observa desde arriba.',
  l1a1_2:'Este es el examen final. ¡Sobrevive!',
  l1a1_tut:'FLECHAS/WASD mover · Z atacar · Q habilidad · K esquivar · X definitiva · TAB cambiar héroe · ESC pausa',
  l1a1_bak:'"¿Crees que puedes vencerme?"',
  l1a1_go:'¡Derrota a Bakaris y su equipo para avanzar!',
  l1a1_win:'¡Victoria en el examen!',
  l1a2_1:'El examen termina. Bakaris cae de rodillas.',
  l1a2_2:'Tú... me has vencido...',
  l1a2_3:'Heriste a mi familiar. ¡Sellaste tu destino!',
  l1a2_4:'Nesta desenvaina una hoja. La sangre corre.',
  l1a2_5:'Bakaris grita mientras una cicatriz desgarra su rostro.',
  l1a2_6:'El tribunal se agita inquieto.',
  l1a2_7:'Esto ya no era un simple examen.',
  l1a3_hint:'Acto 3: Rumores de Pasillo — camina a la derecha; pulsa Z junto a los estudiantes',
  l1a3_1:'Corredores de Azurerune. Ecos del examen.',
  l1a3_2:'Habla con los otros estudiantes. ¿Qué saben?',
  l1a3_levna1:'Esa marca en Bakaris... he visto algo así en el bestiario de mi tío.',
  l1a3_levna2:'Una herida en espiral. Como una garra que guarda memoria.',
  l1a3_levna3:'Los dragones azules dejan marcas que no se borran. Ni en la piel, ni en la piedra.',
  l1a3_levna4:'Sea lo que sea lo que hizo Nesta, se ha escrito en la historia, quisiera o no.',
  l1a3_cly1:'Los dragones deberían estar extintos. El Cataclismo acabó con todo eso.',
  l1a3_cly2:'Pero esa herida de Bakaris — he estudiado metalurgia. Ninguna hoja hace esa espiral.',
  l1a3_cly3:'Las cosas vivas hacen heridas en espiral. Algo se canalizó por la mano de Nesta.',
  l1a3_cly4:'No sé qué significa. Pero pienso averiguarlo.',
  l1a3_dar1:'¿Lo viste? Bakaris cayó como alcanzado por un rayo.',
  l1a3_dar2:'Un verdadero caballero lucha por los demás. Bakaris nunca lo entendió.',
  l1a3_dar3:'Quiero servir a alguien que sí lo entienda. Alguien como... bueno. Como todos vosotros.',
  l1a3_dar4:'Si alguna vez necesitáis a alguien que cargue el equipo — lo digo en serio. Llamadme.',
  l1a3_and1:'Los viejos dioses vigilan esta escuela más de lo que creen sus maestros.',
  l1a3_and2:'Bakaris viene de una familia poderosa. Esta herida a su orgullo supurará.',
  l1a3_and3:'El orgullo es la herida que nunca sana sin humildad — y él no tiene ninguna.',
  l1a3_and4:'Rezaré por vosotros. Creéis haber hecho un enemigo que recuerda.',
  l1a3_done:'La verdad se aclara con cada paso...',
  l1a4_hint:'Acto 4: Infiltración Nocturna — ¡evita al Guardia! Tres plataformas: ¡elige tu nivel!',
  l1a4_1:'Al amparo de la noche, el grupo se cuela en la biblioteca.',
  l1a4_2:'Un guardia patrulla y cambia entre tres plataformas.',
  l1a4_3:'Quédate en una plataforma donde NO esté el guardia. Salta o baja para esquivarlo.',
  l1a4_4:'O pulsa X como Nesta para volver invisible al grupo y pasar de largo.',
  l1a4_caught1:'¡Intruso! Los héroes huyen...',
  l1a4_caught2:'¡Te veo! ¡Dad la alarma!',
  l1a4_win:'¡Los secretos de la biblioteca se revelan!',
  l1a5_1:'La biblioteca guarda muchos secretos.',
  l1a5_2:'El grupo se reúne para discutir sus hallazgos.',
  l1a5_3:'¡El Festival del Martín Pescador es en Vogler. ¡Acompañadnos!',
  l1a5_4:'Vogler: el centro comercial del reino.',
  l1a5_5:'Pero primero deben entender la cicatriz.',
  l1a5_6:'Un dragón azul. Una conexión. Comienza un viaje.',
  l1a5_7:'Próxima parada: Vogler.',
  l2a1_hint:'Emboscada en el Río: ¡derrota a los Darkmantles antes de quedarte sin aire!',
  l2a1_1:'En el camino fluvial a Vogler, la corriente arrastra al grupo bajo el agua...',
  l2a1_2:'Nesta se quedó en la academia — su zorro necesita curas y el Tribunal tiene preguntas. Os alcanzará.',
  l2a1_3:'¡De repente, los Darkmantles emergen de la oscuridad!',
  l2a1_4:'¡Derrótalos! Vigila el AIRE — ¡la superficie está sellada!',
  l2a1_win:'¡La emboscada es derrotada!',
  l2a2_hint:'Festival: explora Vogler y habla con los aldeanos',
  l2a2_1:'Aldea de Vogler — el centro del festival.',
  l2a2_2:'¡Bienvenidos, héroes! Pero la oscuridad nubla nuestra alegría...',
  l2a2_3:'¡El sabotaje debe ser revelado!',
  l2a2_mayor:'¡Bienvenidos a Vogler! Disfrutad del Festival del Martín Pescador.',
  l2a2_ispin:'¡La competición de pesca os espera! Id al este cuando estéis listos.',
  l2a2_done1:'¡La competición de pesca está por comenzar!',
  l2a2_done2:'¡Id al río — es hora de pescar!',
  l2a3_hint:'Minijuego de Pesca: pulsa ESPACIO con el marcador en la zona verde — 3 capturas para ganar',
  l2a3_1:'¡Comienza la Competición de Pesca del Martín Pescador!',
  l2a3_2:'Hora de demostrar tu destreza con el sedal.',
  l2a4_hint:'Sombra en el Camino: ¡derrota al Draconiano Kapak!',
  l2a4_1:'Sombra en el camino...',
  l2a4_2:'¡Un Draconiano Kapak bloquea el paso!',
  l2a4_3:'¡Derrótalo!',
  l2a4_win:'¡El Draconiano Kapak se disuelve en ácido!',
  l3a1_hint:'Umbral del Silencio: esquiva al Censor — usa el camino superior',
  l3a1_1:'Dentro de la Biblioteca de Secretos...',
  l3a1_2:'Un Censor patrulla los pasillos. Sus guardias vigilan el suelo.',
  l3a1_3:'¡Evita ser detectado y llega al otro extremo!',
  l3a1_4:'El censor patrulla el centro. Sube al balcón superior para pasar sin ser visto.',
  l3a1_caught:'¡Detectados! Obligados a retroceder...',
  l3a1_caught2:'¡El guardia os ha visto! ¡Retirada!',
  l3a1_win:'¡Sigilo logrado!',
  l3a2_hint:'El Archivo Restringido: ¡sube al balcón más alto!',
  l3a2_1:'El conocimiento prohibido se guarda en el estante más alto, como siempre.',
  l3a2_2:'¡Escala los muros de estanterías y las plataformas hasta el balcón superior!',
  l3a2_win:'Habéis llegado al archivo restringido.',
  l3a3_hint:'Ecos del Pasado: ¡destruye las armas animadas!',
  l3a3_1:'La cámara resuena con magia antigua...',
  l3a3_2:'¡Las espadas se mueven solas!',
  l3a3_3:'¡Destrúyelas todas!',
  l3a3_win:'¡La maldición se rompe!',
  l3a4_hint:'Engaños y Profundidades: ¡derrota al Espectador!',
  l3a4_1:'Una figura flota sobre el abismo...',
  l3a4_2:'El Espectador observa a todo el que entra. ¡Se teletransporta si lo acorralas!',
  l3a4_3:'¡Derrótalo!',
  l3a4_win:'¡El Espectador cae!',
  l3a5_hint:'Escape: ¡llega a la salida por la derecha!',
  l3a5_1:'El corredor de salida está adelante.',
  l3a5_beck:'Atravesasteis la biblioteca. Impresionante. Ahora corred — antes de que despierten los Directores.',
  l3a5_win:'¡Escapasteis de la biblioteca!',
  l4a1_hint:'La Mascarada de Yurthgreen: socializa y habla (Z junto a los invitados)',
  l4a1_1:'La Mascarada de Yurthgreen comienza...',
  l4a1_2:'Una gran celebración de héroes y leyendas. ¡Nesta por fin se reúne con el grupo!',
  l4a1_bak:'Un noble enmascarado os observa con frialdad. Esa cicatriz bajo la máscara... es Bakaris. No dice nada. Todavía.',
  l4a1_levna:'El destino nos aguarda.',
  l4a1_cly:'Nuestros lazos serán puestos a prueba.',
  l4a1_beck:'¿Qué nos espera?',
  l4a1_cud:'La elección es nuestra.',
  l4a1_tem:'La magia fluye por todos nosotros.',
  l4a1_done:'Adentrándose en la mascarada...',
  l4a2_1:'El gran salón calla. Un heraldo llama a Minerva.',
  l4a2_2:'Minerva Amberfall. Da un paso al frente y arrodíllate.',
  l4a2_3:'Yo... sí, mi señor.',
  l4a2_4:'Esta armadura la llevó Helena Starmantle, Caballero de la Rosa. Cayó en Neraka.',
  l4a2_5:'No nombró sucesor. La armadura ha esperado — a quien ella eligiera.',
  l4a2_6:'¿Por qué yo? Soy una erudita. Estudio cosas. Yo no...',
  l4a2_7:'Los caballeros de antaño sabían que sabiduría y coraje no son opuestos.',
  l4a2_8:'La armadura se asienta sobre los hombros de Minerva con un sonido de aliento largamente contenido.',
  l4a2_9:'Algo antiguo y paciente por fin ha encontrado su propósito.',
  l4a3_1:'Una figura enmascarada se separa de la multitud — invisible para los demás.',
  l4a3_2:'Nesta. La chica que marcó al invencible Bakaris.',
  l4a3_3:'¿Quién eres?',
  l4a3_4:'Alguien que reconoce el poder al verlo. Y el poder necesita dirección.',
  l4a3_5:'Los Ejércitos del Dragón se mueven. Tu pequeño truco no bastará.',
  l4a3_6:'Puedo enseñarte lo que la escuela no quiere. Verdadera magia de las sombras.',
  l4a3_7:'¿A qué precio?',
  l4a3_8:'Tu confianza. Y tu silencio. Por ahora.',
  l4a3_9:'Lo pensaré.',
  l4a3_10:'No lo pienses demasiado. Los acontecimientos corren más de lo que crees.',
  l4a3_prove:'Demuestra tu valía.',
  l4a3_hint:'¡Derrota a los agentes de las sombras!',
  l4a3_win1:'Impresionante. El pacto está sellado.',
  l4a3_win2:'¿A qué he accedido...?',
  l4a4_1:'Ispin lleva a los héroes a una alcoba privada tras un tapiz.',
  l4a4_2:'No debería hacer esto aquí. Pero se me acabó el tiempo de esperar.',
  l4a4_3:'Estas perlas eran de mi abuela. Era vidente — veía caminos.',
  l4a4_4:'Ispin dispone las perlas en círculo en el suelo. Comienzan a brillar.',
  l4a4_5:'Veo... una mujer. De pie entre el fuego. No le teme.',
  l4a4_6:'Tu madre, Kote. Era Solámnica. ¿Lo sabías?',
  l4a4_7:'Nunca me lo dijo. Nunca hablaba de su origen.',
  l4a4_8:'Te protegía de lo que acarrea ese nombre. Pero ese tiempo se acaba.',
  l4a4_9:'Las perlas se apagan. La visión se desvanece. Las lunas giran en lo alto.',
  l4a4_10:'Algo se ha puesto en marcha que no puede deshacerse.',
  l4a5_1:'El ritual se desvanece...',
  l4a5_2:'Hemos aprendido mucho.',
  l4a5_3:'El Museo Dorado guarda secretos.',
  l4a5_4:'Allí encontraréis las respuestas que buscáis.',
  l4a5_5:'La mascarada concluye.',
  l4a5_6:'Pero la verdadera prueba está por venir...',
  l5a1_hint:'Calma Antes de la Tormenta: camina a la derecha hacia el campo',
  l5a1_1:'Vogler prepara una recreación bélica para el cierre del festival...',
  l5a1_2:'Cuando arde el hogar, todos deben alzarse.',
  l5a1_3:'Avanza para ver a los actores tomar el campo.',
  l5a1_npc:'Armaos. Algo en estos "actores" no me gusta.',
  l5a2_hint:'Ilusión Rota: ¡los mercenarios atacan!',
  l5a2_1:'¡Los actores revelan sus armas verdaderas!',
  l5a2_2:'¡No es una ilusión — es una incursión real!',
  l5a2_3:'¡Derrota a todos los soldados!',
  l5a2_win:'¡Los soldados caen!',
  l5a3_hint:'La Ruina Roja: ¡llegan refuerzos draconianos!',
  l5a3_1:'¡La Ruina Roja ha llegado!',
  l5a3_2:'¡No podéis detenernos a todos!',
  l5a3_3:'¡Derrota a los draconianos!',
  l5a3_win:'¡Los draconianos se retiran!',
  l5a4_hint:'Primera Oleada: ¡jefe Draconiano Sivak!',
  l5a4_1:'Un imponente Draconiano Sivak aterriza, sus alas tapan el sol.',
  l5a4_2:'Pisotea el suelo — ¡mantén la distancia cuando se alce!',
  l5a4_3:'¡Este enemigo es formidable!',
  l5a4_win:'¡El Sivak cae!',
  l5a5_hint:'Hierro y Fuego: ¡el Boilerdrak despierta!',
  l5a5_1:'¡De las llamas emerge el Boilerdrak!',
  l5a5_2:'Su armadura arde con un calor terrible — ¡escupe fuego a distancia!',
  l5a5_3:'¡Resistid!',
  l5a5_win:'¡El Boilerdrak es vencido!',
  l5a6_hint:'Última Defensa: ¡el Ogro y el Jefe Goblin!',
  l5a6_1:'¡Aparece un Ogro colosal con un Jefe Goblin a la espalda!',
  l5a6_2:'El jefe es intocable mientras cabalga — ¡derriba primero al Ogro!',
  l5a6_3:'¡Derrótalos!',
  l5a6_fall:'¡El Jefe Goblin cae al suelo!',
  l5a6_win:'¡Los últimos defensores caen!',
  l5a7_hint:'Sin Esperanza: ¡SOBREVIVE al Comandante Dragón!',
  l5a7_1:'La tierra tiembla...',
  l5a7_2:'¡Kansaldi, la Comandante Dragón, emerge del fuego!',
  l5a7_3:'¡Vuestra lucha termina ahora!',
  l5a7_4:'Esta batalla no puede ganarse. ¡Sobrevive hasta ver una salida!',
  l5end_1:'Becklin se planta en el umbral mientras los muros arden a su alrededor.',
  l5end_2:'"¡No miréis atrás! ¡Corred — todos! ¡Corred y no paréis!"',
  l5end_3:'"¡Becklin — NO—!"',
  l5end_4:'"No podemos dejarla, tenemos que—"',
  l5end_5:'"Yo sostendré la línea. Para esto fui creado."',
  l5end_6:'Arturito carga contra el infierno. Kansaldi se aparta de los héroes que huyen.',
  l5end_7:'Los héroes corren entre muros de fuego, piedra que se derrumba, humo que ahoga.',
  l5end_8:'Detrás: un rugido que sacude la tierra. Luego silencio. Luego nada.',
  l5end_9:'Emergen al aire frío de la noche, con los pulmones ardiendo.',
  l5end_10:'"Los perdimos a los dos."',
  l5end_11:'"Estamos vivos. Ellos se aseguraron de eso."',
  l5end_12:'Aldea de Vogler. Amanecer. Los supervivientes cuentan lo salvado y lo perdido.',
  l5end_13:'Crónicas de Azurerune. Libro Uno: Completo.',
},
it:{
  title:'Cronache di Azurerune', subtitle:'La Sfida degli Eroi',
  lvl1:'Livello 1: Giorno di Scuola', lvl2:'Livello 2: Festival del Martin Pescatore', lvl3:'Livello 3: Biblioteca dei Segreti',
  lvl4:'Livello 4: Mascherata di Yurthgreen', lvl5:'Livello 5: Quando Brucia la Casa',
  enemies:'Nemici', victory:'Vittoria!', defeat:'Sconfitta!', press_space:'[SPAZIO o CLIC]',
  paused:'PAUSA', resume:'Riprendi [ESC]', restart_act:'Ricomincia atto [R]', quit_title:'Torna al menu [Q]',
  game_over:'IL GRUPPO È CADUTO', retry_act:'Riprova questo atto [R]',
  hero_down:'A TERRA!', revived:'RIANIMATO!', scrolls:'Pergamene', hp_full:'PIENO',
  titan_form:'FORMA TITANO!', party_invisible:'GRUPPO INVISIBILE!', cleave:'FENDENTE!', barrage:'RAFFICA!',
  freeze_shot:'COLPO GELIDO!', bone_shot:'COLPO D’OSSO!', party_healed:'GRUPPO CURATO!',
  ult_ready:'[X] Suprema pronta', ult_used:'[X] Suprema usata', air:'ARIA', survive:'SOPRAVVIVI',
  fish_caught:'Pesce catturato!', fish_missed:'Mancato!', fish_round:'Round', muted:'[M] MUTO', music:'[M] musica',
  the_end:'FINE', credits:'Cronache di Azurerune — Libro Uno Completo', press_any:'Premi SPAZIO per il menu',
  narrator:'Narratore', tutorial:'Tutorial', guard:'Guardia',
  l1a1_hint:'Atto 1: Esame Finale — sconfiggi Bakaris e la sua squadra!',
  l1a1_1:'Fortezza di Azurerune — il Tribunale osserva dall’alto.',
  l1a1_2:'Questo è l’esame finale. Sopravvivi!',
  l1a1_tut:'FRECCE/WASD muovi · Z attacca · Q abilità · K scatto · X suprema · TAB cambia eroe · ESC pausa',
  l1a1_bak:'"Pensi di potermi battere?"',
  l1a1_go:'Sconfiggi Bakaris e la sua squadra per avanzare!',
  l1a1_win:'Vittoria nell’esame!',
  l1a2_1:'L’esame finisce. Bakaris cade in ginocchio.',
  l1a2_2:'Tu... mi hai battuto...',
  l1a2_3:'Hai ferito il mio famiglio. Hai segnato il tuo destino!',
  l1a2_4:'Nesta sguaina una lama. Il sangue scorre.',
  l1a2_5:'Bakaris urla mentre una cicatrice gli squarcia il volto.',
  l1a2_6:'Il tribunale si agita inquieto.',
  l1a2_7:'Non era più un semplice esame.',
  l1a3_hint:'Atto 3: Voci di Corridoio — cammina a destra; premi Z vicino agli studenti',
  l1a3_1:'Corridoi di Azurerune. Echi dell’esame.',
  l1a3_2:'Parla con gli altri studenti. Cosa sanno?',
  l1a3_levna1:'Quel segno su Bakaris... ho visto qualcosa di simile nel bestiario di mio zio.',
  l1a3_levna2:'Una ferita a spirale. Come un artiglio che porta memoria.',
  l1a3_levna3:'I draghi blu lasciano segni che non svaniscono. Né sulla pelle, né sulla pietra.',
  l1a3_levna4:'Qualunque cosa abbia fatto Nesta — si è scritta nella storia, che lo volesse o no.',
  l1a3_cly1:'I draghi dovrebbero essere estinti. Il Cataclisma avrebbe posto fine a tutto ciò.',
  l1a3_cly2:'Ma quella ferita su Bakaris — ho studiato metallurgia. Nessuna lama fa quella spirale.',
  l1a3_cly3:'Gli esseri vivi fanno ferite a spirale. Qualcosa si è incanalato nella mano di Nesta.',
  l1a3_cly4:'Non so cosa significhi. Ma intendo scoprirlo.',
  l1a3_dar1:'L’hai visto? Bakaris è caduto come colpito da un fulmine.',
  l1a3_dar2:'Un vero cavaliere combatte per gli altri. Bakaris non l’ha mai capito.',
  l1a3_dar3:'Voglio servire qualcuno che lo capisca. Qualcuno come... beh. Come voi.',
  l1a3_dar4:'Se mai vi servisse qualcuno per portare l’equipaggiamento — dico sul serio. Chiamatemi.',
  l1a3_and1:'Gli antichi dèi vegliano su questa scuola più di quanto credano i suoi maestri.',
  l1a3_and2:'Bakaris viene da una famiglia potente. Questa ferita al suo orgoglio marcirà.',
  l1a3_and3:'L’orgoglio è la ferita che non guarisce senza umiltà — e lui non ne ha.',
  l1a3_and4:'Pregherò per voi. Credo vi siate fatti un nemico che ricorda.',
  l1a3_done:'La verità si fa più chiara a ogni passo...',
  l1a4_hint:'Atto 4: Infiltrazione Notturna — evita la Guardia! Tre piattaforme: scegli il tuo livello!',
  l1a4_1:'Col favore della notte, il gruppo si intrufola in biblioteca.',
  l1a4_2:'Una guardia pattuglia e cambia tra tre piattaforme.',
  l1a4_3:'Resta su una piattaforma dove la guardia NON c’è. Salta su o scendi per schivarla.',
  l1a4_4:'Oppure premi X con Nesta per rendere invisibile il gruppo e passare oltre.',
  l1a4_caught1:'Intruso! Gli eroi fuggono...',
  l1a4_caught2:'Ti vedo! Suonate l’allarme!',
  l1a4_win:'I segreti della biblioteca sono svelati!',
  l1a5_1:'La biblioteca custodisce molti segreti.',
  l1a5_2:'Il gruppo si riunisce per discutere le scoperte.',
  l1a5_3:'Il Festival del Martin Pescatore è a Vogler. Unitevi a noi!',
  l1a5_4:'Vogler: il centro commerciale del regno.',
  l1a5_5:'Ma prima devono capire la cicatrice.',
  l1a5_6:'Un drago blu. Un legame. Un viaggio ha inizio.',
  l1a5_7:'Prossima fermata: Vogler.',
  l2a1_hint:'Imboscata sul Fiume: sconfiggi i Darkmantle prima che finisca l’aria!',
  l2a1_1:'Sulla via fluviale per Vogler, la corrente trascina il gruppo sott’acqua...',
  l2a1_2:'Nesta è rimasta all’accademia — la sua volpe va curata e il Tribunale ha domande. Vi raggiungerà.',
  l2a1_3:'All’improvviso, i Darkmantle emergono dall’oscurità!',
  l2a1_4:'Sconfiggili! Occhio all’ARIA — la superficie è sigillata!',
  l2a1_win:'L’imboscata è sconfitta!',
  l2a2_hint:'Festival: esplora Vogler e parla con gli abitanti',
  l2a2_1:'Villaggio di Vogler — il centro del festival.',
  l2a2_2:'Benvenuti, eroi! Ma l’oscurità offusca la nostra gioia...',
  l2a2_3:'Il sabotaggio deve essere svelato!',
  l2a2_mayor:'Benvenuti a Vogler! Godetevi il Festival del Martin Pescatore.',
  l2a2_ispin:'La gara di pesca vi aspetta! Andate a est quando siete pronti.',
  l2a2_done1:'La gara di pesca sta per iniziare!',
  l2a2_done2:'Andate al fiume — è ora di pescare!',
  l2a3_hint:'Minigioco di Pesca: premi SPAZIO col cursore nella zona verde — 3 catture per vincere',
  l2a3_1:'Inizia la Gara di Pesca del Martin Pescatore!',
  l2a3_2:'È ora di dimostrare la tua abilità con la lenza.',
  l2a4_hint:'Ombra sulla Strada: sconfiggi il Draconico Kapak!',
  l2a4_1:'Ombra sulla strada...',
  l2a4_2:'Un Draconico Kapak blocca il cammino!',
  l2a4_3:'Sconfiggilo!',
  l2a4_win:'Il Draconico Kapak si scioglie nell’acido!',
  l3a1_hint:'Soglia del Silenzio: supera il Censore — usa il percorso in alto',
  l3a1_1:'Dentro la Biblioteca dei Segreti...',
  l3a1_2:'Un Censore pattuglia i corridoi. Le sue guardie sorvegliano il piano terra.',
  l3a1_3:'Evita di farti scoprire e raggiungi l’altro capo!',
  l3a1_4:'Il censore pattuglia il centro. Prendi il balcone superiore per passare inosservato.',
  l3a1_caught:'Scoperti! Costretti a ritirarsi...',
  l3a1_caught2:'La guardia vi ha visto! Ritirata!',
  l3a1_win:'Furtività riuscita!',
  l3a2_hint:'L’Archivio Proibito: sali fino al balcone più alto!',
  l3a2_1:'Il sapere proibito è custodito sullo scaffale più alto, come sempre.',
  l3a2_2:'Scala i muri di scaffali e le piattaforme fino al balcone in cima!',
  l3a2_win:'Avete raggiunto l’archivio proibito.',
  l3a3_hint:'Echi del Passato: distruggi le armi animate!',
  l3a3_1:'La camera risuona di magia antica...',
  l3a3_2:'Le spade si muovono da sole!',
  l3a3_3:'Distruggile tutte!',
  l3a3_win:'La maledizione si spezza!',
  l3a4_hint:'Inganni e Profondità: sconfiggi lo Spettatore!',
  l3a4_1:'Una figura fluttua sopra l’abisso...',
  l3a4_2:'Lo Spettatore osserva chiunque entri. Si teletrasporta se messo alle strette!',
  l3a4_3:'Sconfiggilo!',
  l3a4_win:'Lo Spettatore cade!',
  l3a5_hint:'Fuga: raggiungi l’uscita a destra!',
  l3a5_1:'Il corridoio d’uscita è davanti a voi.',
  l3a5_beck:'Avete attraversato la biblioteca. Notevole. Ora correte — prima che i Direttori si sveglino.',
  l3a5_win:'Siete fuggiti dalla biblioteca!',
  l4a1_hint:'La Mascherata di Yurthgreen: socializza e parla (Z vicino agli ospiti)',
  l4a1_1:'La Mascherata di Yurthgreen ha inizio...',
  l4a1_2:'Una grande celebrazione di eroi e leggende. Nesta finalmente si ricongiunge al gruppo!',
  l4a1_bak:'Un nobile mascherato vi osserva freddamente. Quella cicatrice sotto la maschera... è Bakaris. Non dice nulla. Per ora.',
  l4a1_levna:'Il destino ci attende.',
  l4a1_cly:'I nostri legami saranno messi alla prova.',
  l4a1_beck:'Cosa ci aspetta?',
  l4a1_cud:'La scelta è nostra.',
  l4a1_tem:'La magia scorre in tutti noi.',
  l4a1_done:'Addentrandosi nella mascherata...',
  l4a2_1:'La grande sala si fa silenziosa. Un araldo chiama Minerva.',
  l4a2_2:'Minerva Amberfall. Fatti avanti e inginocchiati.',
  l4a2_3:'Io... sì, mio signore.',
  l4a2_4:'Questa armatura fu di Helena Starmantle, Cavaliere della Rosa. Cadde a Neraka.',
  l4a2_5:'Non nominò successori. L’armatura ha atteso — colui che avrebbe scelto.',
  l4a2_6:'Perché io? Sono una studiosa. Studio le cose. Io non...',
  l4a2_7:'I cavalieri di un tempo sapevano che saggezza e coraggio non sono opposti.',
  l4a2_8:'L’armatura si posa sulle spalle di Minerva con un suono di respiro a lungo trattenuto.',
  l4a2_9:'Qualcosa di antico e paziente ha finalmente trovato il suo scopo.',
  l4a3_1:'Una figura mascherata si stacca dalla folla danzante — invisibile a tutti gli altri.',
  l4a3_2:'Nesta. La ragazza che ha sfregiato l’imbattibile Bakaris.',
  l4a3_3:'Chi sei?',
  l4a3_4:'Qualcuno che riconosce il potere quando lo vede. E il potere ha bisogno di direzione.',
  l4a3_5:'Gli Eserciti del Drago si muovono. Il tuo piccolo trucco non basterà.',
  l4a3_6:'Posso insegnarti ciò che la scuola non vuole. Vera magia delle ombre.',
  l4a3_7:'A quale prezzo?',
  l4a3_8:'La tua fiducia. E il tuo silenzio. Per ora.',
  l4a3_9:'Ci penserò.',
  l4a3_10:'Non pensarci troppo. Gli eventi corrono più veloci di quanto credi.',
  l4a3_prove:'Dimostra il tuo valore.',
  l4a3_hint:'Sconfiggi gli agenti dell’ombra!',
  l4a3_win1:'Notevole. Il patto è sigillato.',
  l4a3_win2:'A cosa ho acconsentito...?',
  l4a4_1:'Ispin conduce gli eroi in un’alcova privata dietro un arazzo.',
  l4a4_2:'Non dovrei farlo qui. Ma non ho più tempo per aspettare.',
  l4a4_3:'Queste perle erano di mia nonna. Era una veggente — vedeva sentieri.',
  l4a4_4:'Ispin dispone le perle in cerchio sul pavimento. Iniziano a brillare.',
  l4a4_5:'Vedo... una donna. In piedi nel fuoco. Non ne ha paura.',
  l4a4_6:'Tua madre, Kote. Era Solamnica. Lo sapevi?',
  l4a4_7:'Non me l’ha mai detto. Non parlava mai delle sue origini.',
  l4a4_8:'Ti proteggeva da ciò che quel nome comporta. Ma quel tempo sta finendo.',
  l4a4_9:'Le perle si spengono. La visione svanisce. Le lune ruotano in alto.',
  l4a4_10:'Qualcosa è stato messo in moto e non può essere annullato.',
  l4a5_1:'Il rituale svanisce...',
  l4a5_2:'Abbiamo imparato molto.',
  l4a5_3:'Il Museo Dorato custodisce segreti.',
  l4a5_4:'Lì troverete le risposte che cercate.',
  l4a5_5:'La mascherata si conclude.',
  l4a5_6:'Ma la vera prova deve ancora venire...',
  l5a1_hint:'Calma Prima della Tempesta: cammina a destra verso il campo',
  l5a1_1:'Vogler prepara una rievocazione bellica per la chiusura del festival...',
  l5a1_2:'Quando brucia la casa, tutti devono alzarsi.',
  l5a1_3:'Avanza per vedere gli attori scendere in campo.',
  l5a1_npc:'Armatevi. C’è qualcosa in questi "attori" che non mi convince.',
  l5a2_hint:'Illusione Infranta: i mercenari attaccano!',
  l5a2_1:'Gli attori rivelano le loro vere armi!',
  l5a2_2:'Non è un’illusione — è una vera incursione!',
  l5a2_3:'Sconfiggi tutti i soldati!',
  l5a2_win:'I soldati cadono!',
  l5a3_hint:'La Rovina Rossa: arrivano rinforzi draconici!',
  l5a3_1:'La Rovina Rossa è arrivata!',
  l5a3_2:'Non potete fermarci tutti!',
  l5a3_3:'Sconfiggi i draconici!',
  l5a3_win:'I draconici si ritirano!',
  l5a4_hint:'Prima Ondata: boss Draconico Sivak!',
  l5a4_1:'Un imponente Draconico Sivak atterra, le ali oscurano il sole.',
  l5a4_2:'Pesta il terreno — tieniti a distanza quando si impenna!',
  l5a4_3:'Questo nemico è formidabile!',
  l5a4_win:'Il Sivak cade!',
  l5a5_hint:'Ferro e Fuoco: il Boilerdrak si risveglia!',
  l5a5_1:'Dalle fiamme emerge il Boilerdrak!',
  l5a5_2:'La sua corazza arde di un calore terribile — sputa fuoco da lontano!',
  l5a5_3:'Resistete!',
  l5a5_win:'Il Boilerdrak è sconfitto!',
  l5a6_hint:'Ultima Difesa: l’Ogre e il Capo Goblin!',
  l5a6_1:'Appare un Ogre colossale con un Capo Goblin sulla schiena!',
  l5a6_2:'Il capo è intoccabile finché cavalca — abbatti prima l’Ogre!',
  l5a6_3:'Sconfiggili!',
  l5a6_fall:'Il Capo Goblin rovina a terra!',
  l5a6_win:'Gli ultimi difensori cadono!',
  l5a7_hint:'Senza Speranza: SOPRAVVIVI al Comandante Drago!',
  l5a7_1:'La terra trema...',
  l5a7_2:'Kansaldi, la Comandante Drago, emerge dal fuoco!',
  l5a7_3:'La vostra lotta finisce ora!',
  l5a7_4:'Questa battaglia non si può vincere. Sopravvivi finché non vedi un varco!',
  l5end_1:'Becklin resta sulla soglia mentre i muri si incendiano intorno a lei.',
  l5end_2:'"Non guardate indietro! Correte — tutti! Correte e non fermatevi!"',
  l5end_3:'"Becklin — NO—"',
  l5end_4:'"Non possiamo lasciarla, dobbiamo—"',
  l5end_5:'"Terrò io la linea. È per questo che sono stato creato."',
  l5end_6:'Arturito carica nell’inferno. Kansaldi si volta dagli eroi in fuga.',
  l5end_7:'Gli eroi corrono tra muri di fuoco, pietra che crolla, fumo che soffoca.',
  l5end_8:'Dietro di loro: un ruggito che scuote la terra. Poi silenzio. Poi nulla.',
  l5end_9:'Emergono nell’aria fredda della notte, i polmoni in fiamme.',
  l5end_10:'"Li abbiamo persi entrambi."',
  l5end_11:'"Siamo vivi. Loro se ne sono assicurati."',
  l5end_12:'Villaggio di Vogler. Alba. I superstiti contano ciò che hanno salvato e ciò che hanno perso.',
  l5end_13:'Cronache di Azurerune. Libro Uno: Completo.',
}
};
