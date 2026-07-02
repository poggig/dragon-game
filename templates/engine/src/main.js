// ═══════════════════════════════════════════════════════════════════════════
// CHRONICLES OF AZURERUNE — MAIN LOOP & GAME STATE
// Fixed-timestep game loop (refresh-rate independent), title screen wiring,
// pause / game-over / victory states.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';

const G={
  sc:null,_floats:[],_rings:[],heroHPs:{},scrollsLeft:2,
  state:'title', // title | play | paused | gameover | victory
  _looping:false,

  init(){
    I.init();
    R.init();
    Assets.load(ASSET_MANIFEST).then(()=>{
      document.getElementById('loadScr').style.display='none';
      document.getElementById('title').style.display='flex';
      // Title buttons are generated from GAME_LEVELS (scenes.js)
      const btnBox=document.getElementById('levelBtns');
      btnBox.innerHTML='';
      GAME_LEVELS.forEach((lv,i)=>{
        const b=document.createElement('button');
        b.className='btn';b.id='lvlBtn'+i;
        b.textContent=Lang.t(lv.nameKey);
        b.onclick=()=>this.start(new lv.cls(),lv.music);
        btnBox.appendChild(b);
      });
      ['EN','ES','IT'].forEach(l=>{
        const el=document.getElementById('lang'+l);
        if(el)el.onclick=()=>{Lang.set(l.toLowerCase());this.updateTitleText()};
      });
      this.updateTitleText();
      if(!this._looping){this._looping=true;this._last=performance.now();requestAnimationFrame(t=>this.loop(t));}
    });
  },

  start(lvl,musicTheme){
    // A fresh run from the title always resets run-wide state (the old build
    // leaked heroHPs/scrolls from the previous session into the new one).
    this.heroHPs={};
    this.scrollsLeft=2;
    this._floats=[];this._rings=[];
    Music.stop();
    if(musicTheme)Music.play(musicTheme);
    document.getElementById('title').style.display='none';
    document.getElementById('c').focus();
    D.on=false;D.idx=0;D.dlgs=[];document.getElementById('dlg').style.display='none';
    FX.active=[];
    this.state='play';
    this.sc=lvl;
    try{
      this.sc.enter();
    }catch(err){
      console.error('Level enter() error:',err);
      document.getElementById('hint').textContent='ERROR: '+err.message;
    }
    I.flush();
  },

  title(){
    Music.stop();
    this.sc=null;
    this.state='title';
    D.on=false;D.idx=0;D.dlgs=[];
    document.getElementById('title').style.display='flex';
    document.getElementById('hud').style.display='none';
    document.getElementById('dlg').style.display='none';
    document.getElementById('hint').textContent='';
  },

  gameOver(){
    if(this.state!=='play')return;
    this.state='gameover';
    Music.stop();
  },

  victory(){
    this.state='victory';
    Music.stop();
    document.getElementById('hud').style.display='none';
    document.getElementById('hint').textContent='';
  },

  updateTitleText(){
    document.querySelector('#title h1').textContent=Lang.t('title');
    document.querySelector('#title h2').textContent=Lang.t('subtitle');
    GAME_LEVELS.forEach((lv,i)=>{const b=document.getElementById('lvlBtn'+i);if(b)b.textContent=Lang.t(lv.nameKey);});
    document.querySelector('#dlg .pr').textContent=Lang.t('press_space');
    ['EN','ES','IT'].forEach(l=>{
      const el=document.getElementById('lang'+l);
      if(el)el.style.borderColor=Lang.current===l.toLowerCase()?'#fff':'#c8a84e';
    });
  },

  // ── Fixed-timestep loop ──
  // The old loop assumed requestAnimationFrame == 60Hz and passed dt=1/60
  // unconditionally, so the game ran 2x speed on 120Hz displays and slowed
  // down under throttling. We accumulate real time and step at exactly 60Hz.
  STEP:1/60,
  _last:0,_acc:0,

  loop(now){
    const frame=Math.min(0.25,(now-this._last)/1000); // clamp huge tab-switch gaps
    this._last=now;
    Music.resume();
    if(I.pr('KeyM'))Music.toggle();

    try{
      if(this.state==='play'&&this.sc){
        if(I.pr('Escape')){this.state='paused';I.flush();this.drawFrame();requestAnimationFrame(t=>this.loop(t));return;}
        this._acc+=frame;
        let steps=0;
        while(this._acc>=this.STEP&&steps<4){
          this.sc.update(this.STEP);
          FX.up(this.STEP);
          this._acc-=this.STEP;steps++;
          I.flush(); // consume just-pressed keys once per simulated step
        }
        if(this._acc>this.STEP*4)this._acc=0;
        this.drawFrame();
      }else if(this.state==='paused'){
        this.drawFrame();
        this.drawOverlay(Lang.t('paused'),['resume','restart_act','quit_title']);
        if(I.pr('Escape'))this.state='play';
        else if(I.pr('KeyR')){this.state='play';this.sc.restartAct();}
        else if(I.pr('KeyQ'))this.title();
        I.flush();
      }else if(this.state==='gameover'){
        this.drawFrame();
        R.x.fillStyle='rgba(60,0,0,0.55)';R.x.fillRect(0,0,CW,CH);
        this.drawOverlay(Lang.t('game_over'),['retry_act','quit_title']);
        if(I.pr('KeyR')){
          this.state='play';
          Music.play(this.sc.musicTheme||'castle');
          this.sc.restartAct();
        }
        else if(I.pr('KeyQ'))this.title();
        I.flush();
      }else if(this.state==='victory'){
        R.cls('#0a0a18');
        const cx=CW/2;
        R.x.textAlign='center';
        R.x.fillStyle='#c8a84e';R.x.font='bold 34px monospace';
        R.x.fillText(Lang.t('the_end'),cx,CH/2-60);
        R.x.fillStyle='#f0e6c0';R.x.font='16px monospace';
        R.x.fillText(Lang.t('credits'),cx,CH/2-10);
        R.x.fillStyle='#8ab4d4';R.x.font='13px monospace';
        R.x.fillText('Kote · Minerva · Elber · Nesta · Nick',cx,CH/2+30);
        R.x.fillStyle='rgba(255,255,255,'+(0.4+0.4*Math.sin(now/400))+')';R.x.font='12px monospace';
        R.x.fillText(Lang.t('press_any'),cx,CH/2+90);
        R.x.textAlign='left';
        if(I.pr('Space')||I.pr('Enter'))this.title();
        I.flush();
      }else{
        R.cls('#0a1628');
        I.flush();
      }
    }catch(err){
      console.error('Game loop error:',err);
      document.getElementById('hint').textContent='LOOP ERR: '+err.message;
      if(D.on)D.up(this.STEP);
      I.flush();
    }
    requestAnimationFrame(t=>this.loop(t));
  },

  drawFrame(){
    if(!this.sc)return;
    R.cls('#000');
    this.sc.draw();
    FX.draw();
    // Floating combat/heal text
    if(this._floats&&this._floats.length){
      this._floats=this._floats.filter(f=>f.life>0);
      this._floats.forEach(f=>{
        f.y-=0.7;f.life-=this.STEP;
        const a=Math.min(1,f.life/0.5);
        R.x.save();R.x.globalAlpha=a;
        R.x.fillStyle=f.col||'#22ee66';
        R.x.font='bold 18px monospace';
        R.x.textAlign='center';
        R.x.shadowColor=f.col||'#22ee66';R.x.shadowBlur=4;
        R.x.fillText(f.txt,f.x-R.cam.x,f.y-R.cam.y);
        R.x.restore();
      });
      R.x.textAlign='left';
    }
    // Expanding rings
    if(this._rings&&this._rings.length){
      this._rings=this._rings.filter(r=>r.life>0);
      this._rings.forEach(r=>{
        r.r+=4;r.life-=this.STEP;
        const a=Math.min(1,r.life/0.6);
        R.x.save();R.x.globalAlpha=a;
        R.x.strokeStyle=r.col;R.x.lineWidth=2;
        R.x.shadowColor=r.col;R.x.shadowBlur=8;
        R.x.beginPath();R.x.arc(r.x-R.cam.x,r.y-R.cam.y,r.r,0,Math.PI*2);R.x.stroke();
        R.x.restore();
      });
    }
  },

  drawOverlay(titleTxt,optionKeys){
    R.x.save();
    R.x.fillStyle='rgba(5,5,20,0.75)';R.x.fillRect(0,0,CW,CH);
    R.x.textAlign='center';
    R.x.fillStyle='#c8a84e';R.x.font='bold 28px monospace';
    R.x.fillText(titleTxt,CW/2,CH/2-50);
    R.x.font='14px monospace';R.x.fillStyle='#f0e6c0';
    optionKeys.forEach((k,i)=>{
      R.x.fillText(Lang.t(k),CW/2,CH/2+i*26);
    });
    R.x.restore();R.x.textAlign='left';
  }
};

G.init();
