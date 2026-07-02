// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE GAME DATA — replace everything in this file with your game.
// The engine (engine.js/main.js) never changes; this file and scenes.js are
// the whole game. This example runs with ZERO image assets: the renderer
// falls back to programmatic pixel-art for every configured type.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

// ═══ HERO STATS ═══
// Archetype guide: tank ~170hp/slow · dps ~115 · glass cannon ~70/fast ·
// healer (isHealer+healAmt) · ranged (ranged:true, big skillRange)
const HERO_STATS={
  hero_one:{hp:115,spd:2.3,jf:-9.0,atkDmg:30,skillMult:2.4,dashDur:0.12,atkRange:32,skillRange:52},
  hero_two:{hp:105,spd:1.9,jf:-8.5,atkDmg:18,skillMult:0,dashDur:0.18,atkRange:30,skillRange:0,isHealer:true,healAmt:30},
};

// ═══ ENEMY HP TIERS ═══
const EHP={grunt:60,soldier:85,elite:120,miniboss:200,boss:300};

// ═══ SPRITE / FX CONFIG ═══
// Leave empty to use the engine's programmatic fallback art for everything.
// Add entries (see the Azurerune game for examples) when you have PNGs.
const SpriteConfig={heroes:{},enemies:{}};
const FXConfig={heroes:{},dash:'fx_dash',enemyDeath:'fx_enemy_death'};

// ═══ ASSET MANIFEST ═══
// Empty = instant load, fallback art. Add {type:'image'|'meta',key,path}.
const ASSET_MANIFEST=[];

// ═══ MAP BUILDERS ═══
// Maps MUST be at least MAP_H tiles tall (the viewport is 30 tiles).
const MAP_H=34;

function buildCastleArena(tm,W,H){
  for(let x=0;x<W;x++){tm.set(x,H-3,1);tm.set(x,H-2,1);tm.set(x,H-1,1)}
  const lp=Math.floor(W*0.22);
  for(let i=lp;i<lp+7;i++)tm.set(i,H-7,3)
  const mid=Math.floor(W/2)
  for(let i=-4;i<5;i++)tm.set(mid+i,H-7,3)
  for(let i=-3;i<4;i++)tm.set(mid+i,H-12,3)
}

// ═══ PARALLAX BACKGROUND ═══
function drawBgLayer(ctx,cam,theme,W,H){
  const ox=Math.floor(cam.x*0.3);
  ctx.save();
  ctx.fillStyle='#0a1e35';
  for(let i=0;i<20;i++){
    const bx=((i*180-ox)%((W*T)+200))-100;
    ctx.fillRect(bx,CH-220,40,160);
    ctx.fillStyle='#ff9944';ctx.fillRect(bx+14,CH-190,12,18);ctx.fillStyle='#0a1e35';
  }
  ctx.fillStyle='rgba(255,255,200,0.6)';
  for(let i=0;i<40;i++){
    const sx=((i*137+ox*0.1)%(CW+200))-100;
    ctx.fillRect(sx,(i*73)%120,2,2);
  }
  ctx.restore();
}

// ═══ DECORATIONS ═══
const DecoThemes={};
function genDecos(){return[];}

// ═══ I18N — every player-facing string, per language ═══
Lang.strings={
en:{
  title:'Template Quest', subtitle:'Replace me with your game',
  lvl1:'Level 1: The Arena',
  enemies:'Enemies', victory:'Victory!', defeat:'Defeat!', press_space:'[SPACE or CLICK]',
  paused:'PAUSED', resume:'Resume [ESC]', restart_act:'Restart act [R]', quit_title:'Quit to title [Q]',
  game_over:'THE PARTY HAS FALLEN', retry_act:'Retry this act [R]',
  hero_down:'DOWN!', revived:'REVIVED!', scrolls:'Scrolls', hp_full:'FULL',
  titan_form:'POWER UP!', party_invisible:'INVISIBLE!', cleave:'CLEAVE!', barrage:'BARRAGE!',
  freeze_shot:'FREEZE!', bone_shot:'BONE SHOT!', party_healed:'PARTY HEALED!',
  ult_ready:'[X] Ultimate ready', ult_used:'[X] Ultimate used', air:'AIR', survive:'SURVIVE',
  muted:'[M] MUTED', music:'[M] music',
  the_end:'THE END', credits:'Template Quest — Complete', press_any:'Press SPACE for title',
  narrator:'Narrator', tutorial:'Tutorial', guard:'Guard',
  l1a1_hint:'Act 1: defeat the goblins!',
  l1a1_1:'Welcome to the template arena.',
  l1a1_tut:'ARROWS/WASD move · Z attack · Q skill · K dash · X ultimate · TAB swap · ESC pause',
  l1a1_win:'The arena is cleared!',
},
};
