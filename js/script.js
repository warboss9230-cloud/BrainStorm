/* =========================================================
   BrainStorm Quiz v2 — script.js
   ALL FEATURES: Hints, Lifelines, Streaks, Daily, Multiplayer,
   Power-ups, Achievements, Stats, Review, Share, Theme, Admin
   ========================================================= */
'use strict';

/* ── Avatars ────────────────────────────────────────────── */
const AVATARS = [
  {id:'a1',e:'🧑‍🚀',n:'Astronaut'},{id:'a2',e:'🦸',n:'Hero'},{id:'a3',e:'🧙‍♂️',n:'Wizard'},
  {id:'a4',e:'🤖',n:'Robot'},{id:'a5',e:'🦊',n:'Fox'},{id:'a6',e:'🐼',n:'Panda'},
  {id:'a7',e:'🦁',n:'Lion'},{id:'a8',e:'🐯',n:'Tiger'},{id:'a9',e:'🦋',n:'Butterfly'},
  {id:'a10',e:'🐉',n:'Dragon'},{id:'a11',e:'🦄',n:'Unicorn'},{id:'a12',e:'🐺',n:'Wolf'},
  {id:'a13',e:'🦅',n:'Eagle'},{id:'a14',e:'🐬',n:'Dolphin'},{id:'a15',e:'🦈',n:'Shark'},
  {id:'a16',e:'🌟',n:'Star'},{id:'a17',e:'🔥',n:'Phoenix'},{id:'a18',e:'⚡',n:'Thunder'},
  {id:'a19',e:'💎',n:'Diamond'},{id:'a20',e:'🌙',n:'Moon'},{id:'a21',e:'☄️',n:'Comet'},
  {id:'a22',e:'🏆',n:'Champion'},{id:'a23',e:'🎯',n:'Target'},{id:'a24',e:'🎮',n:'Gamer'},
  {id:'a25',e:'🧬',n:'Scientist'},{id:'a26',e:'🎸',n:'Rockstar'},{id:'a27',e:'🎨',n:'Artist'},
  {id:'a28',e:'📚',n:'Scholar'},{id:'a29',e:'💡',n:'Genius'},{id:'a30',e:'🚀',n:'Rocketman'},
  {id:'a31',e:'🌈',n:'Rainbow'},{id:'a32',e:'🐻',n:'Bear'},{id:'a33',e:'🦝',n:'Raccoon'},
  {id:'a34',e:'🐸',n:'Frog'},{id:'a35',e:'🦉',n:'Owl'},{id:'a36',e:'🐧',n:'Penguin'},
  {id:'a37',e:'🐳',n:'Whale'},{id:'a38',e:'🌊',n:'Wave'},{id:'a39',e:'🏔️',n:'Mountain'},
  {id:'a40',e:'⚔️',n:'Warrior'},{id:'a41',e:'🛡️',n:'Guardian'},{id:'a42',e:'🧠',n:'Brain'},
  {id:'a43',e:'👑',n:'King'},{id:'a44',e:'🃏',n:'Joker'},{id:'a45',e:'🎭',n:'Actor'},
  {id:'a46',e:'🦸‍♀️',n:'Heroine'},{id:'a47',e:'🌺',n:'Blossom'},{id:'a48',e:'🦜',n:'Parrot'},
];

/* ── XP Titles ──────────────────────────────────────────── */
const XP_TITLES = [
  {min:0,    title:'Rookie',     icon:'🌱'},
  {min:50,   title:'Scholar',    icon:'📖'},
  {min:150,  title:'Explorer',   icon:'🧭'},
  {min:300,  title:'Expert',     icon:'⚡'},
  {min:500,  title:'Master',     icon:'💎'},
  {min:800,  title:'Grandmaster',icon:'🏆'},
  {min:1200, title:'Legend',     icon:'👑'},
  {min:2000, title:'Mythic',     icon:'🔥'},
];

/* ── Achievements ───────────────────────────────────────── */
const ACHIEVEMENTS = [
  {id:'first_win',   name:'First Win',     icon:'🎉', desc:'Complete your first quiz',         check:s=>s.totalQuestions>=10},
  {id:'streak3',     name:'Hot Streak',    icon:'🔥', desc:'Get 3 correct in a row',           check:s=>s.bestStreak>=3},
  {id:'streak10',    name:'Unstoppable',   icon:'⚡', desc:'Get 10 correct in a row',          check:s=>s.bestStreak>=10},
  {id:'xp100',       name:'XP Rookie',     icon:'💰', desc:'Earn 100 total XP',                check:s=>s.xp>=100},
  {id:'xp500',       name:'XP Hunter',     icon:'💎', desc:'Earn 500 total XP',                check:s=>s.xp>=500},
  {id:'xp1000',      name:'XP Master',     icon:'👑', desc:'Earn 1000 total XP',               check:s=>s.xp>=1000},
  {id:'perfect',     name:'Perfect Round', icon:'⭐', desc:'Answer all questions correctly',    check:(s,r)=>r&&r.wrong===0&&r.total>=5},
  {id:'daily',       name:'Daily Champ',   icon:'📅', desc:'Complete a Daily Challenge',       check:s=>s.dailyCompleted>0},
  {id:'lvl5',        name:'Level 5',       icon:'🏅', desc:'Complete Level 5',                 check:s=>s.completedLevels&&s.completedLevels.includes(5)},
  {id:'lvl10',       name:'Master Level',  icon:'🎖️', desc:'Complete Level 10',               check:s=>s.completedLevels&&s.completedLevels.includes(10)},
  {id:'multi',       name:'Multiplayer',   icon:'👥', desc:'Play a multiplayer game',          check:s=>s.multiPlayed>0},
  {id:'custom',      name:'Creator',       icon:'✏️', desc:'Add a custom question',            check:s=>s.customQAdded>0},
];

/* ── Level Config ───────────────────────────────────────── */
const LEVEL_CONFIG = {1:15,2:20,3:25,4:30,5:35,6:40,7:45,8:50,9:55,10:60};
const TIMER_SECS = 20;
const XP_CORRECT = 10, XP_WRONG = -5;
const FREE_COUNT = 20;

/* ── Power-up costs ─────────────────────────────────────── */
const POWERUP_XP_COST = {doublexp:20, shield:15, extratime:10};

/* ── State ──────────────────────────────────────────────── */
let G = {
  player: null, mode: null, level: 1,
  questions: [], currentIdx: 0,
  score: {correct:0, wrong:0, xp:0},
  sessionXP: 0, streak: 0, bestStreak: 0,
  timer: null, timerVal: 0, answered: false,
  soundOn: true, themeLight: false,
  allQ: [], progress: null,
  lifelines: {fifty:true, skip:true, extratime:true},
  powerups: {doublexp:2, shield:2, extratime:2},
  activePowerups: {doublexp:false, shield:false, extratime:false},
  hintUsed: false, reviewData: [],
  mp: {active:false, p2name:'', p2avatar:'🤖', p1score:0, p2score:0, turn:1},
  customQ: [],
};

/* ── DOM ────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $$ = s => document.querySelectorAll(s);

/* ── LocalStorage ───────────────────────────────────────── */
const LS = {
  get:k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
  del:k=>localStorage.removeItem(k),
};

/* ── Screens ────────────────────────────────────────────── */
function show(id){
  $$('.screen').forEach(s=>s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0,0);
}

/* ── Save / Load Progress ───────────────────────────────── */
function saveProgress(){
  const p = G.progress || {};
  const data = {
    name:G.player.name, avatarId:G.player.avatarId, avatarEmoji:G.player.avatarEmoji,
    currentLevel:G.level,
    xp:(p.xp||0)+G.sessionXP,
    completedLevels:p.completedLevels||[],
    correctAnswers:(p.correctAnswers||0)+G.score.correct,
    totalQuestions:(p.totalQuestions||0)+G.questions.length,
    bestStreak:Math.max(p.bestStreak||0, G.bestStreak),
    dailyCompleted:p.dailyCompleted||0,
    multiPlayed:p.multiPlayed||0,
    customQAdded:p.customQAdded||0,
    subjectStats:mergeSubjectStats(p.subjectStats||{}, buildSessionSubjectStats()),
    achievements:p.achievements||[],
  };
  LS.set('bsq_prog', data);
  G.progress = data;
  checkAchievements(data);
}

function loadProgress(){ return LS.get('bsq_prog'); }

function buildSessionSubjectStats(){
  const ss = {};
  G.reviewData.forEach(r=>{
    const s = r.subject||'General';
    if(!ss[s]) ss[s]={correct:0,total:0};
    ss[s].total++;
    if(r.wasCorrect) ss[s].correct++;
  });
  return ss;
}
function mergeSubjectStats(old, session){
  const merged = {...old};
  for(const [subj,data] of Object.entries(session)){
    if(!merged[subj]) merged[subj]={correct:0,total:0};
    merged[subj].correct += data.correct;
    merged[subj].total   += data.total;
  }
  return merged;
}

/* ── Leaderboard ────────────────────────────────────────── */
function getLB(){ return LS.get('bsq_lb')||[]; }
function saveToLB(){
  let lb = getLB();
  const prog = loadProgress();
  const e = {
    name:G.player.name, avatarEmoji:G.player.avatarEmoji,
    xp:prog?prog.xp:G.sessionXP,
    correct:prog?prog.correctAnswers:G.score.correct,
    total:prog?prog.totalQuestions:G.questions.length,
    mode:G.mode, date:new Date().toLocaleDateString(),
  };
  lb = lb.filter(x=>x.name.toLowerCase()!==e.name.toLowerCase());
  lb.push(e); lb.sort((a,b)=>b.xp-a.xp); lb=lb.slice(0,20);
  LS.set('bsq_lb', lb);
}

/* ── Achievements ───────────────────────────────────────── */
function checkAchievements(prog, roundResult=null){
  const unlocked = prog.achievements||[];
  ACHIEVEMENTS.forEach(ach=>{
    if(!unlocked.includes(ach.id) && ach.check(prog, roundResult)){
      unlocked.push(ach.id);
      showAchievementUnlock(ach);
    }
  });
  prog.achievements = unlocked;
  LS.set('bsq_prog', prog);
}

function showAchievementUnlock(ach){
  toast(`🏅 Achievement: ${ach.icon} ${ach.name}`, 't-gold', 4000);
}

/* ── XP Title ────────────────────────────────────────────── */
function getTitle(xp){
  let t = XP_TITLES[0];
  XP_TITLES.forEach(x=>{ if(xp>=x.min) t=x; });
  return t;
}

/* ── Sound (Web Audio API) ───────────────────────────────── */
function playSound(type){
  if(!G.soundOn) return;
  try{
    const ctx = new(window.AudioContext||window.webkitAudioContext)();
    if(type==='correct'){
      [523,659,784].forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sine'; o.frequency.value=f;
        g.gain.setValueAtTime(.25,ctx.currentTime+i*.08);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.08+.4);
        o.start(ctx.currentTime+i*.08); o.stop(ctx.currentTime+i*.08+.4);
      });
    } else if(type==='wrong'){
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type='sawtooth'; o.frequency.setValueAtTime(220,ctx.currentTime);
      o.frequency.linearRampToValueAtTime(140,ctx.currentTime+.35);
      g.gain.setValueAtTime(.2,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.4);
      o.start(); o.stop(ctx.currentTime+.4);
    } else if(type==='streak'){
      [440,550,660,880].forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='triangle'; o.frequency.value=f;
        g.gain.setValueAtTime(.2,ctx.currentTime+i*.06);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.06+.3);
        o.start(ctx.currentTime+i*.06); o.stop(ctx.currentTime+i*.06+.3);
      });
    } else if(type==='level'){
      [261,329,392,523].forEach((f,i)=>{
        const o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type='sine'; o.frequency.value=f;
        g.gain.setValueAtTime(.3,ctx.currentTime+i*.1);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.1+.5);
        o.start(ctx.currentTime+i*.1); o.stop(ctx.currentTime+i*.1+.5);
      });
    }
  }catch(e){}
}

/* ── Toast ───────────────────────────────────────────────── */
function toast(msg, cls='t-info', dur=2800){
  const c=$('toast-wrap');
  const t=document.createElement('div');
  t.className=`toast ${cls}`; t.textContent=msg;
  c.appendChild(t);
  setTimeout(()=>t.remove(),dur);
}

/* ── Confetti ────────────────────────────────────────────── */
function launchConfetti(){
  const colors=['#00f5ff','#ff2d78','#ffd700','#39ff14','#b44dff','#ff6b2b'];
  for(let i=0;i<60;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    p.style.cssText=`
      left:${Math.random()*100}vw;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*1.5}s;
      animation-duration:${1.8+Math.random()}s;
      transform:rotate(${Math.random()*360}deg);
    `;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),3500);
  }
}

/* ── Canvas BG ───────────────────────────────────────────── */
function initCanvas(){
  const canvas=$('bg-canvas'), ctx=canvas.getContext('2d');
  let W,H,stars=[];
  function resize(){
    W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;
    stars=Array.from({length:100},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.4+.3, o:Math.random()*.5+.1,
      s:Math.random()*.12+.03, p:Math.random()*Math.PI*2,
    }));
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    stars.forEach(s=>{
      s.p+=s.s*.04;
      const a=s.o*(.6+.4*Math.sin(s.p));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(180,230,255,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',resize); resize(); draw();
}

/* ── Load Questions ─────────────────────────────────────── */
async function loadQuestions(){
  const files=['data/subjects/math.json','data/subjects/science.json','data/subjects/other.json'];
  let all=[];
  for(const f of files){
    try{ const r=await fetch(f); const d=await r.json(); all=[...all,...d]; }
    catch(e){ console.warn('Could not load',f); }
  }
  // Load custom questions from localStorage
  const cq=LS.get('bsq_custom_questions')||[];
  G.customQ=cq;
  G.allQ=[...all,...cq];
  if(G.allQ.length===0){
    // Fallback
    G.allQ=[
      {id:1,level:1,subject:'Math',question:'2+2=?',options:['2','3','4','5'],answer:'4',difficulty:'easy',hint:'Two plus two'},
      {id:2,level:1,subject:'Science',question:'Our planet?',options:['Mars','Venus','Earth','Jupiter'],answer:'Earth',difficulty:'easy',hint:'Third from Sun'},
    ];
  }
}

function shuffle(arr){ const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

/* ═══════════════════════════════════════════════════
   SCREEN BUILDERS
   ═══════════════════════════════════════════════════ */

/* ── HOME ────────────────────────────────────────────────── */
function buildHome(){
  const prog=loadProgress(); G.progress=prog;
  const rs=$('resume-section');
  if(prog){
    rs.classList.remove('hidden');
    $('rc-name').textContent=`${prog.avatarEmoji||'🧑‍🚀'} ${prog.name}`;
    const t=getTitle(prog.xp||0);
    $('rc-stats').textContent=`${t.icon} ${t.title} · ${prog.xp||0} XP · Level ${prog.currentLevel||1}`;
  } else rs.classList.add('hidden');
  show('screen-home');
}

/* ── SETUP ───────────────────────────────────────────────── */
function buildSetup(){
  const prog=loadProgress();
  if(prog){ $('player-name').value=prog.name; G.player={name:prog.name,avatarId:prog.avatarId,avatarEmoji:prog.avatarEmoji}; }
  buildAvatarGrid();
  show('screen-setup');
}

function buildAvatarGrid(){
  const grid=$('avatar-grid'); grid.innerHTML='';
  AVATARS.forEach(av=>{
    const item=document.createElement('div');
    item.className='av-item'; item.dataset.id=av.id;
    if(G.player&&G.player.avatarId===av.id) item.classList.add('selected');
    item.innerHTML=`<span class="av-emoji">${av.e}</span><span class="av-name">${av.n}</span>`;
    item.addEventListener('click',()=>{ $$('.av-item').forEach(e=>e.classList.remove('selected')); item.classList.add('selected'); });
    grid.appendChild(item);
  });
}

function setupContinue(){
  const name=$('player-name').value.trim();
  if(!name){toast('Please enter your name!','t-err');return;}
  const sel=document.querySelector('.av-item.selected');
  if(!sel){toast('Choose an avatar!','t-err');return;}
  const av=AVATARS.find(a=>a.id===sel.dataset.id);
  G.player={name,avatarId:av.id,avatarEmoji:av.e};
  buildModeSelect();
}

/* ── MODE SELECT ─────────────────────────────────────────── */
function buildModeSelect(){
  G.mode=null;
  $$('.mode-card').forEach(c=>c.classList.remove('selected'));
  $('level-picker').classList.remove('show');
  $('btn-start').disabled=true;
  buildSubjectFilter();
  buildLevelGrid();
  show('screen-mode');
}

function buildSubjectFilter(){
  const subjects=['All','Math','Science','History','Geography','English','Coding','Sports'];
  const wrap=$('subject-filter'); wrap.innerHTML='';
  subjects.forEach(s=>{
    const chip=document.createElement('div');
    chip.className='subj-chip'+(s==='All'?' active':'');
    chip.textContent=s; chip.dataset.subj=s;
    chip.addEventListener('click',()=>{
      $$('.subj-chip').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
    });
    wrap.appendChild(chip);
  });
}

function buildLevelGrid(){
  const prog=loadProgress(), completed=prog?(prog.completedLevels||[]):[];
  const grid=$('level-grid'); grid.innerHTML='';
  Object.entries(LEVEL_CONFIG).forEach(([lvl,qs])=>{
    const n=parseInt(lvl);
    const isLocked=n>1&&!completed.includes(n-1);
    const isCompleted=completed.includes(n);
    const btn=document.createElement('div');
    btn.className='lv-btn'+(isLocked?' locked':'')+(isCompleted?' completed':'');
    btn.innerHTML=`<div class="lv-num">L${n}</div><div class="lv-qs">${qs}Q</div><div class="lv-icon">${isLocked?'🔒':isCompleted?'✅':'▶'}</div>`;
    if(!isLocked) btn.addEventListener('click',()=>{ $$('.lv-btn').forEach(b=>b.classList.remove('selected')); btn.classList.add('selected'); G.level=n; });
    grid.appendChild(btn);
  });
}

function selectMode(mode){
  G.mode=mode;
  $$('.mode-card').forEach(c=>c.classList.toggle('selected',c.dataset.mode===mode));
  $('level-picker').classList.toggle('show',mode==='level');
  $('btn-start').disabled=false;
}

/* ── START GAME ──────────────────────────────────────────── */
function startGame(){
  if(!G.mode){toast('Pick a mode!','t-err');return;}
  G.score={correct:0,wrong:0,xp:0};
  G.sessionXP=0; G.currentIdx=0; G.answered=false;
  G.streak=0; G.bestStreak=0; G.reviewData=[];
  G.hintUsed=false;
  G.lifelines={fifty:true,skip:true,extratime:true};
  G.activePowerups={doublexp:false,shield:false,extratime:false};

  // Subject filter
  const selSubj=document.querySelector('.subj-chip.active');
  const subjFilter=selSubj?selSubj.dataset.subj:'All';

  let pool=G.allQ;
  if(subjFilter!=='All') pool=pool.filter(q=>q.subject===subjFilter);

  if(G.mode==='free'||G.mode==='timer'){
    G.questions=shuffle(pool).slice(0,FREE_COUNT);
  } else if(G.mode==='level'){
    let lpool=shuffle(pool.filter(q=>q.level===G.level)).slice(0,LEVEL_CONFIG[G.level]);
    if(lpool.length<LEVEL_CONFIG[G.level]){
      const extra=shuffle(pool.filter(q=>q.level!==G.level)).slice(0,LEVEL_CONFIG[G.level]-lpool.length);
      lpool=[...lpool,...extra];
    }
    G.questions=lpool;
  } else if(G.mode==='daily'){
    G.questions=shuffle(pool).slice(0,15);
  } else if(G.mode==='custom'){
    G.questions=shuffle(pool).slice(0,FREE_COUNT);
  }

  if(G.questions.length===0){ toast('No questions found for this filter!','t-err'); return; }

  buildQuizHUD();
  loadQuestion();
  show('screen-quiz');
}

/* ── MULTIPLAYER START ───────────────────────────────────── */
function startMultiplayer(){
  const p2name=$('mp-p2-name').value.trim()||'Player 2';
  const sel=document.querySelector('.mp-av.selected');
  const p2av=sel?sel.dataset.emoji:'🤖';
  G.mp={active:true,p2name,p2avatar:p2av,p1score:0,p2score:0,turn:1};
  G.mode='free';
  G.score={correct:0,wrong:0,xp:0};
  G.sessionXP=0; G.currentIdx=0; G.answered=false;
  G.streak=0; G.bestStreak=0; G.reviewData=[];
  G.lifelines={fifty:true,skip:true,extratime:true};
  G.questions=shuffle(G.allQ).slice(0,10);

  $('mp-p1-name-hud').textContent=G.player.name;
  $('mp-p1-ava-hud').textContent=G.player.avatarEmoji;
  $('mp-p2-name-hud').textContent=p2name;
  $('mp-p2-ava-hud').textContent=p2av;
  updateMPScores();
  buildQuizHUD();
  loadQuestion();
  show('screen-quiz');
}

function updateMPScores(){
  if(!G.mp.active) return;
  $('mp-s1').textContent=G.mp.p1score;
  $('mp-s2').textContent=G.mp.p2score;
  $('mp-turn-indicator').textContent=G.mp.turn===1?`${G.player.avatarEmoji} ${G.player.name}'s turn`:`${G.mp.p2avatar} ${G.mp.p2name}'s turn`;
  $('mp-hud').classList.remove('hidden');
}

/* ── QUIZ HUD ────────────────────────────────────────────── */
function buildQuizHUD(){
  $('hud-ava').textContent=G.player.avatarEmoji;
  $('hud-name').textContent=G.player.name;
  updateHUDXP();
  updateProgress();
  $('hud-mode').textContent=
    G.mode==='free'?'∞ Free Play':G.mode==='timer'?'⏱ Timer':
    G.mode==='level'?`⚔ Level ${G.level}`:G.mode==='daily'?'📅 Daily':'🎮 Custom';
  $('timer-ring').style.display=G.mode==='timer'?'block':'none';
  if(!G.mp.active) $('mp-hud').classList.add('hidden');
  renderPowerupBar();
}

function updateHUDXP(){
  const prog=loadProgress(), base=prog?prog.xp:0;
  const total=base+G.sessionXP;
  $('hud-xp-val').textContent=total+' XP';
  const t=getTitle(total);
  $('hud-title').textContent=`${t.icon} ${t.title}`;
  $('hud-streak').textContent=`🔥 ${G.streak}x`;
  $('hud-streak').classList.toggle('show',G.streak>=2);
}

function updateProgress(){
  const total=G.questions.length, curr=G.currentIdx;
  const pct=Math.round((curr/total)*100);
  $('prog-fill').style.width=pct+'%';
  $('prog-text').innerHTML=`Q <span>${Math.min(curr+1,total)}</span> / <span>${total}</span>`;
}

/* ── LOAD QUESTION ───────────────────────────────────────── */
function loadQuestion(){
  if(G.currentIdx>=G.questions.length){ endRound(); return; }
  G.answered=false; G.hintUsed=false;
  clearTimer();
  updateProgress();

  const q=G.questions[G.currentIdx];
  $('q-subject').textContent=q.subject||'General';
  $('q-diff').textContent=q.difficulty||'medium';
  $('q-diff').className='q-diff '+(q.difficulty||'medium');
  $('q-num-label').textContent=`#${G.currentIdx+1}`;
  $('q-text').textContent=q.question;
  $('hint-box').classList.remove('show');
  $('hint-box').textContent='';
  $('btn-hint').disabled=!q.hint;

  // Reset lifeline UI
  $('ll-fifty').classList.toggle('used',!G.lifelines.fifty);
  $('ll-skip').classList.toggle('used',!G.lifelines.skip);
  $('ll-extratime').classList.toggle('used',!G.lifelines.extratime);

  // Options
  const grid=$('opts-grid'); grid.innerHTML='';
  const labels=['A','B','C','D'];
  const opts=shuffle(q.options.map(o=>({text:o})));
  opts.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='opt-btn';
    btn.innerHTML=`<span class="opt-lbl">${labels[i]}</span><span class="opt-txt">${opt.text}</span>`;
    btn.addEventListener('click',()=>handleAnswer(btn,opt.text,q.answer,q));
    grid.appendChild(btn);
  });

  // Animation reset
  const card=$('q-card');
  card.style.animation='none'; void card.offsetWidth; card.style.animation='';

  if(G.mode==='timer') startTimer();
}

/* ── HANDLE ANSWER ───────────────────────────────────────── */
function handleAnswer(btn, chosen, correct, q){
  if(G.answered) return;
  G.answered=true;
  clearTimer();

  const isCorrect=chosen===correct;
  let xpDelta=isCorrect?XP_CORRECT:XP_WRONG;

  // Shield power-up
  if(!isCorrect&&G.activePowerups.shield){ xpDelta=0; G.activePowerups.shield=false; toast('🛡️ Shield blocked XP loss!','t-gold'); }
  // Double XP power-up
  if(isCorrect&&G.activePowerups.doublexp){ xpDelta*=2; G.activePowerups.doublexp=false; toast('⚡ Double XP! +'+xpDelta+' XP','t-gold'); }

  if(isCorrect){
    G.score.correct++; G.streak++; G.bestStreak=Math.max(G.bestStreak,G.streak);
    btn.classList.add('correct');
    playSound('correct');
    showXPPopup(`+${xpDelta} XP`,true);
    if(G.streak>1) updateHUDXP();
    if(G.streak===3||G.streak===5||G.streak===10){ playSound('streak'); showStreakBurst(G.streak); }
  } else {
    G.score.wrong++; G.streak=0;
    btn.classList.add('wrong');
    playSound('wrong');
    if(xpDelta!==0) showXPPopup(`${xpDelta} XP`,false);
    // Highlight correct
    $$('.opt-btn').forEach(b=>{ if(b.querySelector('.opt-txt').textContent===correct) b.classList.add('correct'); });
  }

  G.sessionXP=Math.max(0,G.sessionXP+xpDelta);
  G.score.xp=G.sessionXP;
  updateHUDXP();

  // Multiplayer
  if(G.mp.active){
    if(G.mp.turn===1) G.mp.p1score+=isCorrect?1:0;
    else G.mp.p2score+=isCorrect?1:0;
    updateMPScores();
  }

  // Review data
  G.reviewData.push({question:q.question, chosen, correct, wasCorrect:isCorrect, subject:q.subject});

  $$('.opt-btn').forEach(b=>b.disabled=true);
  setTimeout(()=>{ G.currentIdx++; loadQuestion(); },1500);
}

/* ── TIMER ───────────────────────────────────────────────── */
const CIRC=2*Math.PI*24;
function startTimer(){
  G.timerVal=G.activePowerups.extratime?TIMER_SECS+10:TIMER_SECS;
  if(G.activePowerups.extratime) G.activePowerups.extratime=false;
  updateTimerRing(G.timerVal,G.timerVal);
  const ring=$('timer-ring');
  ring.className='timer-ring';
  G.timer=setInterval(()=>{
    G.timerVal--;
    updateTimerRing(G.timerVal,TIMER_SECS);
    ring.className='timer-ring'+(G.timerVal<=5?' danger':G.timerVal<=10?' warning':'');
    if(G.timerVal<=0){
      clearTimer();
      if(!G.answered){
        G.answered=true;
        const q=G.questions[G.currentIdx];
        $$('.opt-btn').forEach(b=>{ b.disabled=true; if(b.querySelector('.opt-txt').textContent===q.answer) b.classList.add('correct'); });
        G.score.wrong++; G.streak=0;
        G.sessionXP=Math.max(0,G.sessionXP+XP_WRONG);
        G.reviewData.push({question:q.question,chosen:'(timeout)',correct:q.answer,wasCorrect:false,subject:q.subject});
        updateHUDXP();
        showXPPopup('⏱ -5',false);
        toast('Time\'s up!','t-err');
        setTimeout(()=>{ G.currentIdx++; loadQuestion(); },1500);
      }
    }
  },1000);
}
function updateTimerRing(val,max){
  const fg=$('timer-fg');
  const pct=Math.max(0,val/max);
  fg.style.strokeDashoffset=CIRC*(1-pct);
  $('timer-num').textContent=val>0?val:0;
}
function clearTimer(){ if(G.timer){clearInterval(G.timer);G.timer=null;} }

/* ── LIFELINES ───────────────────────────────────────────── */
function useFiftyFifty(){
  if(!G.lifelines.fifty||G.answered) return;
  G.lifelines.fifty=false;
  const q=G.questions[G.currentIdx];
  let removed=0;
  $$('.opt-btn').forEach(btn=>{
    if(removed<2 && btn.querySelector('.opt-txt').textContent!==q.answer){
      btn.classList.add('hidden-50'); removed++;
    }
  });
  $('ll-fifty').classList.add('used');
  toast('50:50 used — 2 wrong answers removed!','t-info');
}

function useSkip(){
  if(!G.lifelines.skip||G.answered) return;
  G.lifelines.skip=false;
  clearTimer();
  $('ll-skip').classList.add('used');
  toast('⏭ Question skipped!','t-info');
  G.currentIdx++;
  loadQuestion();
}

function useExtraTime(){
  if(!G.lifelines.extratime||G.answered||G.mode!=='timer') return;
  G.lifelines.extratime=false;
  G.timerVal=Math.min(G.timerVal+10,TIMER_SECS+10);
  updateTimerRing(G.timerVal,TIMER_SECS);
  $('ll-extratime').classList.add('used');
  toast('+10 seconds added!','t-gold');
}

/* ── HINT ────────────────────────────────────────────────── */
function showHint(){
  if(G.hintUsed) return;
  const q=G.questions[G.currentIdx];
  if(!q.hint) return;
  G.hintUsed=true;
  $('hint-box').textContent='💡 Hint: '+q.hint;
  $('hint-box').classList.add('show');
  // Small XP cost for hint
  G.sessionXP=Math.max(0,G.sessionXP-3);
  updateHUDXP();
  toast('Hint shown (-3 XP)','t-info');
}

/* ── POWER-UPS ───────────────────────────────────────────── */
function renderPowerupBar(){
  const bar=$('powerup-bar'); bar.innerHTML='';
  const pus=[
    {id:'doublexp',icon:'⚡',label:'2x XP',count:G.powerups.doublexp},
    {id:'shield',  icon:'🛡️',label:'Shield',count:G.powerups.shield},
    {id:'extratime',icon:'⏰',label:'+Time',count:G.powerups.extratime},
  ];
  pus.forEach(pu=>{
    const btn=document.createElement('div');
    btn.className='pu-btn'+(pu.count<=0?' pu-empty':'');
    btn.innerHTML=`${pu.icon} ${pu.label} <span class="pu-count">${pu.count}</span>`;
    btn.addEventListener('click',()=>activatePowerup(pu.id));
    bar.appendChild(btn);
  });
}

function activatePowerup(id){
  if(G.powerups[id]<=0){ toast('No '+id+' power-ups left!','t-err'); return; }
  if(G.activePowerups[id]){ toast('Already active!','t-info'); return; }
  G.powerups[id]--;
  G.activePowerups[id]=true;
  renderPowerupBar();
  const msgs={doublexp:'⚡ Double XP active for next correct!',shield:'🛡️ Shield active — next wrong won\'t lose XP!',extratime:'⏰ Extra Time active for next question!'};
  toast(msgs[id],'t-gold');
}

/* ── XP POPUP ────────────────────────────────────────────── */
function showXPPopup(msg,ok){
  const el=$('xp-popup');
  el.textContent=msg; el.className='xp-popup '+(ok?'show-ok':'show-ng');
  setTimeout(()=>{ el.className='xp-popup'; },950);
}

/* ── STREAK BURST ────────────────────────────────────────── */
function showStreakBurst(n){
  const el=$('streak-burst-inner');
  el.textContent=`🔥 ${n}x STREAK!`;
  const wrap=$('streak-burst');
  wrap.className='streak-burst show';
  setTimeout(()=>{ wrap.className='streak-burst'; },1100);
}

/* ── END ROUND ───────────────────────────────────────────── */
function endRound(){
  clearTimer();

  // Multiplayer: different end flow
  if(G.mp.active){ endMultiplayer(); return; }

  // Level completion
  if(G.mode==='level'){
    const prog=loadProgress()||{};
    const completed=prog.completedLevels||[];
    if(!completed.includes(G.level)){ completed.push(G.level); playSound('level'); }
    prog.completedLevels=completed;
    LS.set('bsq_prog',{...prog,completedLevels:completed});
    if(G.score.correct===G.questions.length) launchConfetti();
  }
  if(G.mode==='daily'){
    const prog=loadProgress()||{};
    prog.dailyCompleted=(prog.dailyCompleted||0)+1;
    LS.set('bsq_prog',prog);
  }

  saveProgress();
  saveToLB();
  buildResults();
  show('screen-result');
}

function endMultiplayer(){
  G.mp.active=false;
  const prog=loadProgress()||{};
  prog.multiPlayed=(prog.multiPlayed||0)+1;
  LS.set('bsq_prog',prog);
  buildMPResult();
  show('screen-mp-result');
}

function buildMPResult(){
  const p1=G.mp.p1score, p2=G.mp.p2score;
  $('mp-res-p1-ava').textContent=G.player.avatarEmoji;
  $('mp-res-p1-name').textContent=G.player.name;
  $('mp-res-p1-score').textContent=p1;
  $('mp-res-p2-ava').textContent=G.mp.p2avatar;
  $('mp-res-p2-name').textContent=G.mp.p2name;
  $('mp-res-p2-score').textContent=p2;
  let winner;
  if(p1>p2) winner=`🏆 ${G.player.name} Wins!`;
  else if(p2>p1) winner=`🏆 ${G.mp.p2name} Wins!`;
  else winner='🤝 It\'s a Tie!';
  $('mp-winner-text').textContent=winner;
  if(p1!==p2) launchConfetti();
}

/* ── RESULTS ─────────────────────────────────────────────── */
function buildResults(){
  const total=G.questions.length, correct=G.score.correct, wrong=G.score.wrong;
  const xp=G.sessionXP, pct=total>0?Math.round((correct/total)*100):0;
  let grade,gClass,msg;
  if(pct>=90){grade='S';gClass='gs';msg='🏆 Legendary! Absolute genius!';if(pct===100)launchConfetti();}
  else if(pct>=75){grade='A';gClass='ga';msg='⭐ Excellent! You crushed it!';}
  else if(pct>=60){grade='B';gClass='gb';msg='✨ Great job! Keep it up!';}
  else if(pct>=45){grade='C';gClass='gc';msg='💪 Good effort! Keep practising!';}
  else{grade='D';gClass='gd';msg='🔄 Keep trying! You\'ll improve!';}

  $('res-ava').textContent=G.player.avatarEmoji;
  $('res-grade').textContent=grade; $('res-grade').className='result-grade '+gClass;
  $('res-msg').textContent=msg;
  $('res-player').textContent=G.player.name;
  $('rs-correct').textContent=correct; $('rs-wrong').textContent=wrong;
  $('rs-xp').textContent='+'+xp; $('rs-pct').textContent=pct+'%';
  $('rs-streak').textContent=G.bestStreak; $('rs-total').textContent=total;

  const prog=loadProgress();
  $('res-total-xp').textContent=(prog?prog.xp:xp)+' XP';
  const t=getTitle(prog?prog.xp:xp);
  $('res-title-disp').textContent=`${t.icon} ${t.title}`;

  const badge=$('level-badge');
  if(G.mode==='level'){ badge.classList.remove('hidden'); badge.textContent=`✅ Level ${G.level} Complete!`; }
  else badge.classList.add('hidden');

  const nextBtn=$('btn-next-level');
  if(G.mode==='level'&&G.level<10){ nextBtn.classList.remove('hidden'); nextBtn.textContent=`▶ Level ${G.level+1}`; }
  else nextBtn.classList.add('hidden');

  buildReviewList();
  buildShareCard(pct,xp);

  // Achievement check
  if(prog) checkAchievements(prog,{wrong,total,correct});
}

function buildReviewList(){
  const list=$('review-list'); list.innerHTML='';
  G.reviewData.forEach((r,i)=>{
    const item=document.createElement('div');
    item.className='review-item '+(r.wasCorrect?'ri-ok':'ri-ng');
    item.innerHTML=`
      <div class="review-q"><strong>Q${i+1}:</strong> ${escHTML(r.question)}</div>
      <div class="review-ans">
        Your answer: <span class="${r.wasCorrect?'ra-ok':'ra-ng'}">${escHTML(r.chosen)}</span>
        ${!r.wasCorrect?`&nbsp;|&nbsp; Correct: <span class="ra-correct">${escHTML(r.correct)}</span>`:''}
      </div>`;
    list.appendChild(item);
  });
}

function buildShareCard(pct,xp){
  $('share-pct').textContent=pct+'%';
  $('share-xp').textContent='+'+xp+' XP';
  $('share-name').textContent=G.player.avatarEmoji+' '+G.player.name;
}

function shareScore(){
  const text=`I scored ${$('share-pct').textContent} on BrainStorm Quiz and earned ${$('share-xp').textContent}! Can you beat me? 🧠⚡`;
  if(navigator.share){ navigator.share({title:'BrainStorm Quiz',text}).catch(()=>{}); }
  else { navigator.clipboard.writeText(text).then(()=>toast('Score copied to clipboard!','t-info')); }
}

/* ── LEADERBOARD ─────────────────────────────────────────── */
function buildLeaderboard(){
  renderLB('all');
  show('screen-lb');
}
function renderLB(filter){
  let lb=getLB();
  if(filter!=='all') lb=lb.filter(e=>e.mode===filter);
  const list=$('lb-list');
  if(!lb.length){ list.innerHTML='<div class="lb-empty">No scores yet. Play a game first! 🎮</div>'; return; }
  list.innerHTML='';
  lb.forEach((e,i)=>{
    const rank=i+1, rk=rank<=3?['🥇','🥈','🥉'][rank-1]:'#'+rank;
    const rClass=rank<=3?`rr${rank}`:'rrn';
    const item=document.createElement('div');
    item.className='lb-item'+(rank<=3?` r${rank}`:'');
    item.style.animationDelay=(i*.05)+'s';
    item.innerHTML=`
      <div class="lb-rank ${rClass}">${rk}</div>
      <div class="lb-ava">${e.avatarEmoji||'🧑‍🚀'}</div>
      <div class="lb-info">
        <div class="lb-name">${escHTML(e.name)}</div>
        <div class="lb-details">${e.correct}/${e.total} · ${capFirst(e.mode)} · ${e.date}</div>
      </div>
      <div class="lb-xp-wrap">
        <div class="lb-xp">${e.xp}</div>
        <div class="lb-xp-lbl">XP</div>
      </div>`;
    list.appendChild(item);
  });
}

/* ── STATS ───────────────────────────────────────────────── */
function buildStats(){
  const prog=loadProgress()||{};
  $('stat-total-xp').textContent=prog.xp||0;
  $('stat-total-q').textContent=prog.totalQuestions||0;
  $('stat-total-correct').textContent=prog.correctAnswers||0;
  $('stat-best-streak').textContent=prog.bestStreak||0;
  $('stat-levels').textContent=(prog.completedLevels||[]).length;
  $('stat-daily').textContent=prog.dailyCompleted||0;

  // Subject bars
  const ss=prog.subjectStats||{};
  const barWrap=$('subj-bars'); barWrap.innerHTML='';
  const colors={Math:'#00f5ff',Science:'#39ff14',History:'#ffd700',Geography:'#b44dff',English:'#ff2d78',Coding:'#ff6b2b',Sports:'#3d8bff'};
  Object.entries(ss).forEach(([subj,data])=>{
    const pct=data.total>0?Math.round((data.correct/data.total)*100):0;
    const row=document.createElement('div'); row.className='subj-bar-row';
    row.innerHTML=`
      <div class="subj-bar-label">${subj}</div>
      <div class="subj-bar-track"><div class="subj-bar-fill" style="width:0%;background:${colors[subj]||'#00f5ff'}"></div></div>
      <div class="subj-bar-pct">${pct}%</div>`;
    barWrap.appendChild(row);
    setTimeout(()=>row.querySelector('.subj-bar-fill').style.width=pct+'%',100);
  });
  if(!Object.keys(ss).length) barWrap.innerHTML='<div class="text-dim center mt12">Play games to see subject stats!</div>';

  // Achievements
  buildAchievements(prog);
  show('screen-stats');
}

function buildAchievements(prog){
  const unlocked=prog.achievements||[];
  const grid=$('achiev-grid'); grid.innerHTML='';
  ACHIEVEMENTS.forEach(ach=>{
    const isUnlocked=unlocked.includes(ach.id);
    const card=document.createElement('div');
    card.className='ach-card'+(isUnlocked?' unlocked':' locked');
    card.innerHTML=`
      <span class="ach-icon">${ach.icon}</span>
      <div class="ach-name">${ach.name}</div>
      <div class="ach-desc">${ach.desc}</div>
      ${isUnlocked?'<span class="ach-unlocked-badge">✅ Unlocked</span>':''}`;
    grid.appendChild(card);
  });
}

/* ── DAILY CHALLENGE ─────────────────────────────────────── */
function buildDaily(){
  const prog=loadProgress()||{};
  const today=new Date().toLocaleDateString();
  const lastDaily=prog.lastDailyDate;
  $('daily-date').textContent='📅 '+today;

  // Countdown to midnight
  updateDailyCountdown();
  setInterval(updateDailyCountdown,1000);

  if(lastDaily===today){
    $('daily-play-area').classList.add('hidden');
    $('daily-done').classList.remove('hidden');
    $('daily-done').textContent='✅ Daily challenge completed for today! Come back tomorrow!';
  } else {
    $('daily-play-area').classList.remove('hidden');
    $('daily-done').classList.add('hidden');
  }
  show('screen-daily');
}

function updateDailyCountdown(){
  const now=new Date(), midnight=new Date();
  midnight.setHours(24,0,0,0);
  const diff=midnight-now;
  const h=Math.floor(diff/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
  const el=$('daily-countdown');
  if(el) el.innerHTML=`Resets in <span>${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</span>`;
}

function startDaily(){
  const prog=loadProgress()||{};
  prog.lastDailyDate=new Date().toLocaleDateString();
  LS.set('bsq_prog',prog);
  G.mode='daily'; G.mp.active=false;
  G.score={correct:0,wrong:0,xp:0}; G.sessionXP=0;
  G.currentIdx=0; G.answered=false; G.streak=0; G.bestStreak=0; G.reviewData=[];
  G.lifelines={fifty:true,skip:true,extratime:true};
  G.questions=shuffle(G.allQ).slice(0,15);
  buildQuizHUD(); loadQuestion();
  show('screen-quiz');
}

/* ── ADMIN / QUESTION EDITOR ─────────────────────────────── */
function buildAdmin(){
  renderEditorList();
  show('screen-admin');
}

function renderEditorList(){
  const list=$('editor-list'); list.innerHTML='';
  const cq=LS.get('bsq_custom_questions')||[];
  if(!cq.length){ list.innerHTML='<div class="text-dim center mt12">No custom questions yet.</div>'; return; }
  cq.forEach((q,i)=>{
    const item=document.createElement('div'); item.className='editor-item';
    item.innerHTML=`
      <div class="editor-item-content">
        <div class="editor-item-q">${escHTML(q.question)}</div>
        <div class="editor-item-meta">Level ${q.level} · ${q.subject} · ${q.difficulty} · Answer: <strong>${escHTML(q.answer)}</strong></div>
      </div>
      <div class="editor-item-actions">
        <button class="btn btn-danger btn-xs" onclick="deleteCustomQ(${i})">🗑</button>
      </div>`;
    list.appendChild(item);
  });
}

function saveCustomQ(){
  const qtext=$('cq-question').value.trim();
  const opts=[$('cq-opt1').value.trim(),$('cq-opt2').value.trim(),$('cq-opt3').value.trim(),$('cq-opt4').value.trim()];
  const answer=$('cq-answer').value.trim();
  const subject=$('cq-subject').value;
  const level=parseInt($('cq-level').value)||1;
  const difficulty=$('cq-difficulty').value;
  const hint=$('cq-hint').value.trim();

  if(!qtext||!answer||opts.some(o=>!o)){ toast('Fill all required fields!','t-err'); return; }
  if(!opts.includes(answer)){ toast('Answer must match one of the options!','t-err'); return; }

  const cq=LS.get('bsq_custom_questions')||[];
  cq.push({id:Date.now(),level,subject,question:qtext,options:opts,answer,difficulty,hint:hint||''});
  LS.set('bsq_custom_questions',cq);

  // Update allQ
  G.allQ=[...G.allQ.filter(q=>!q.id||typeof q.id!=='number'||q.id<1e12),...cq];
  G.customQ=cq;

  // Track for achievement
  const prog=loadProgress()||{}; prog.customQAdded=(prog.customQAdded||0)+1; LS.set('bsq_prog',prog);

  toast('✅ Question saved!','t-ok');
  renderEditorList();
  // Clear form
  ['cq-question','cq-opt1','cq-opt2','cq-opt3','cq-opt4','cq-answer','cq-hint'].forEach(id=>{ const el=$(id); if(el) el.value=''; });
}

function deleteCustomQ(idx){
  const cq=LS.get('bsq_custom_questions')||[];
  cq.splice(idx,1);
  LS.set('bsq_custom_questions',cq);
  G.customQ=cq;
  toast('Question deleted','t-info');
  renderEditorList();
}

/* ── MULTIPLAYER SCREEN ──────────────────────────────────── */
function buildMultiplayer(){
  // Build P2 avatar picker
  const grid=$('mp-av-grid'); grid.innerHTML='';
  AVATARS.slice(0,16).forEach(av=>{
    const item=document.createElement('div');
    item.className='av-item'; item.dataset.emoji=av.e; item.style.cssText='padding:6px';
    item.innerHTML=`<span style="font-size:1.6rem">${av.e}</span>`;
    item.addEventListener('click',()=>{ $$('.mp-av').forEach(e=>e.classList.remove('selected')); item.classList.add('selected'); });
    item.classList.add('mp-av');
    grid.appendChild(item);
  });
  show('screen-multiplayer');
}

/* ── THEME ───────────────────────────────────────────────── */
function toggleTheme(){
  G.themeLight=!G.themeLight;
  document.body.classList.toggle('theme-light',G.themeLight);
  LS.set('bsq_theme',G.themeLight);
  $('btn-theme').textContent=G.themeLight?'🌙':'☀️';
}

/* ── SOUND ───────────────────────────────────────────────── */
function toggleSound(){
  G.soundOn=!G.soundOn;
  LS.set('bsq_sound',G.soundOn);
  $('btn-sound').textContent=G.soundOn?'🔊':'🔇';
  toast(G.soundOn?'Sound ON':'Sound OFF','t-info');
}

/* ── MODAL ───────────────────────────────────────────────── */
function openModal(id){ $(id).classList.add('open'); }
function closeModal(id){ $(id).classList.remove('open'); }

/* ── RESET ───────────────────────────────────────────────── */
function resetProgress(){
  if(!confirm('Reset ALL progress, XP, and achievements? This cannot be undone.')) return;
  ['bsq_prog','bsq_lb','bsq_custom_questions'].forEach(k=>LS.del(k));
  G.progress=null; G.customQ=[];
  toast('Progress reset!','t-info');
  buildHome();
}

/* ── HELPERS ─────────────────────────────────────────────── */
function escHTML(str){ const d=document.createElement('div'); d.appendChild(document.createTextNode(str||'')); return d.innerHTML; }
function capFirst(s){ return s?s.charAt(0).toUpperCase()+s.slice(1):''; }

/* ── EVENT BINDING ───────────────────────────────────────── */
function bindEvents(){
  // Home
  $('btn-new-game').addEventListener('click',buildSetup);
  $('btn-resume').addEventListener('click',resumeGame);
  $('btn-lb-home').addEventListener('click',buildLeaderboard);
  $('btn-stats-home').addEventListener('click',buildStats);
  $('btn-daily-home').addEventListener('click',buildDaily);
  $('btn-multi-home').addEventListener('click',buildMultiplayer);
  $('btn-admin-home').addEventListener('click',buildAdmin);
  $('btn-reset-home').addEventListener('click',resetProgress);

  // Setup
  $('btn-setup-continue').addEventListener('click',setupContinue);
  $('btn-setup-back').addEventListener('click',buildHome);

  // Mode
  $$('.mode-card').forEach(c=>c.addEventListener('click',()=>selectMode(c.dataset.mode)));
  $('btn-start').addEventListener('click',startGame);
  $('btn-mode-back').addEventListener('click',buildSetup);

  // Quiz
  $('btn-quit').addEventListener('click',()=>{ clearTimer(); saveProgress(); buildHome(); });
  $('btn-hint').addEventListener('click',showHint);
  $('ll-fifty').addEventListener('click',useFiftyFifty);
  $('ll-skip').addEventListener('click',useSkip);
  $('ll-extratime').addEventListener('click',useExtraTime);

  // Results
  $('btn-play-again').addEventListener('click',startGame);
  $('btn-next-level').addEventListener('click',()=>{ G.level=Math.min(G.level+1,10); startGame(); });
  $('btn-res-lb').addEventListener('click',buildLeaderboard);
  $('btn-res-home').addEventListener('click',buildHome);
  $('btn-share-score').addEventListener('click',shareScore);

  // LB
  $$('.tab-btn').forEach(b=>b.addEventListener('click',()=>{ $$('.tab-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); renderLB(b.dataset.f); }));
  $('btn-lb-back').addEventListener('click',buildHome);

  // Stats
  $('btn-stats-back').addEventListener('click',buildHome);

  // Daily
  $('btn-daily-start').addEventListener('click',startDaily);
  $('btn-daily-back').addEventListener('click',buildHome);

  // Multiplayer
  $('btn-mp-start').addEventListener('click',startMultiplayer);
  $('btn-mp-back').addEventListener('click',buildHome);
  $('btn-mp-res-home').addEventListener('click',buildHome);
  $('btn-mp-res-again').addEventListener('click',buildMultiplayer);

  // Admin
  $('btn-save-q').addEventListener('click',saveCustomQ);
  $('btn-admin-back').addEventListener('click',buildHome);

  // Toolbar
  $('btn-sound').addEventListener('click',toggleSound);
  $('btn-theme').addEventListener('click',toggleTheme);

  // MP Result
}

function resumeGame(){
  const prog=loadProgress(); if(!prog) return;
  G.player={name:prog.name,avatarId:prog.avatarId,avatarEmoji:prog.avatarEmoji};
  G.progress=prog; G.level=prog.currentLevel||1;
  G.mode='level';
  G.score={correct:0,wrong:0,xp:0}; G.sessionXP=0;
  G.currentIdx=0; G.answered=false; G.streak=0; G.bestStreak=0; G.reviewData=[];
  G.lifelines={fifty:true,skip:true,extratime:true};
  G.questions=shuffle(G.allQ.filter(q=>q.level===G.level)).slice(0,LEVEL_CONFIG[G.level]||20);
  if(!G.questions.length) G.questions=shuffle(G.allQ).slice(0,20);
  buildQuizHUD(); loadQuestion();
  show('screen-quiz');
}

/* ── INIT ────────────────────────────────────────────────── */
async function init(){
  const sv=LS.get('bsq_sound'); G.soundOn=sv===null?true:sv;
  $('btn-sound').textContent=G.soundOn?'🔊':'🔇';
  const tv=LS.get('bsq_theme'); G.themeLight=!!tv;
  if(G.themeLight){ document.body.classList.add('theme-light'); $('btn-theme').textContent='🌙'; }

  initCanvas();
  await loadQuestions();
  bindEvents();
  buildHome();
}

document.addEventListener('DOMContentLoaded',init);
