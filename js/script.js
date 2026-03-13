/* ═══════════════════════════════════════════════════════
   BrainQuiz · script.js
   Class 1–12 · Per-Subject JSON · Live Clock · All Features
   ═══════════════════════════════════════════════════════ */
'use strict';

/* ── Config ─────────────────────────────────────────────── */
const SUBJECTS = [
  { id:'math',          name:'Mathematics',    icon:'➕', file:'math.json'          },
  { id:'science',       name:'Science',        icon:'🔬', file:'science.json'       },
  { id:'english',       name:'English',        icon:'📖', file:'english.json'       },
  { id:'hindi',         name:'Hindi',          icon:'🇮🇳', file:'hindi.json'         },
  { id:'computer',      name:'Computer',       icon:'💻', file:'computer.json'      },
  { id:'evs',           name:'EVS',            icon:'🌿', file:'evs.json'           },
  { id:'gk',            name:'G.K.',           icon:'🌍', file:'gk.json'            },
  { id:'economics',     name:'Economics',      icon:'💰', file:'economics.json'     },
  { id:'space',         name:'Space',          icon:'🚀', file:'space.json'         },
  { id:'animals-birds', name:'Animals & Birds',icon:'🦁', file:'animals-birds.json' },
];

const AVATARS = [
  {id:'a1',e:'🧑‍🚀',n:'Astronaut'},{id:'a2',e:'🦸',n:'Hero'},
  {id:'a3',e:'🧙‍♂️',n:'Wizard'},{id:'a4',e:'🤖',n:'Robot'},
  {id:'a5',e:'🦊',n:'Fox'},{id:'a6',e:'🐼',n:'Panda'},
  {id:'a7',e:'🦁',n:'Lion'},{id:'a8',e:'🐯',n:'Tiger'},
  {id:'a9',e:'🐉',n:'Dragon'},{id:'a10',e:'🦄',n:'Unicorn'},
  {id:'a11',e:'🦅',n:'Eagle'},{id:'a12',e:'🐬',n:'Dolphin'},
  {id:'a13',e:'🌟',n:'Star'},{id:'a14',e:'🔥',n:'Phoenix'},
  {id:'a15',e:'⚡',n:'Thunder'},{id:'a16',e:'💎',n:'Diamond'},
  {id:'a17',e:'🎯',n:'Target'},{id:'a18',e:'🎮',n:'Gamer'},
  {id:'a19',e:'📚',n:'Scholar'},{id:'a20',e:'💡',n:'Genius'},
  {id:'a21',e:'🚀',n:'Rocket'},{id:'a22',e:'🏆',n:'Champ'},
  {id:'a23',e:'🐻',n:'Bear'},{id:'a24',e:'🦉',n:'Owl'},
  {id:'a25',e:'🐧',n:'Penguin'},{id:'a26',e:'🧠',n:'Brain'},
  {id:'a27',e:'👑',n:'King'},{id:'a28',e:'🦸‍♀️',n:'Heroine'},
  {id:'a29',e:'🌈',n:'Rainbow'},{id:'a30',e:'🦋',n:'Butterfly'},
  {id:'a31',e:'🐸',n:'Frog'},{id:'a32',e:'☄️',n:'Comet'},
];

const TITLES = [
  {min:0,    t:'Rookie',       i:'🌱'},
  {min:50,   t:'Scholar',      i:'📖'},
  {min:150,  t:'Explorer',     i:'🧭'},
  {min:300,  t:'Expert',       i:'⚡'},
  {min:500,  t:'Master',       i:'💎'},
  {min:800,  t:'Grand Master', i:'🏆'},
  {min:1200, t:'Legend',       i:'👑'},
  {min:2000, t:'Mythic',       i:'🔥'},
];

const ACHS = [
  {id:'first',  n:'First Quiz',    i:'🎉', d:'Complete first quiz',           c: s=>s.totalQ>=5},
  {id:'s3',     n:'Hot Streak',    i:'🔥', d:'3 correct answers in a row',    c: s=>s.bestStreak>=3},
  {id:'s10',    n:'Unstoppable',   i:'⚡', d:'10 correct in a row',           c: s=>s.bestStreak>=10},
  {id:'xp100',  n:'XP Rookie',     i:'💰', d:'Earn 100 total XP',             c: s=>s.xp>=100},
  {id:'xp500',  n:'XP Hunter',     i:'💎', d:'Earn 500 total XP',             c: s=>s.xp>=500},
  {id:'xp1k',   n:'XP Master',     i:'👑', d:'Earn 1000 total XP',            c: s=>s.xp>=1000},
  {id:'perfect',n:'Perfect Score', i:'⭐', d:'100% in a round (≥5 questions)',(c:(s,r)=>r&&r.wrong===0&&r.total>=5)},
  {id:'cls10',  n:'Senior Student',i:'🎓', d:'Play from Class 10+',           c: s=>s.maxClass>=10},
  {id:'multi',  n:'Team Player',   i:'👥', d:'Complete a multiplayer game',   c: s=>s.multiPlayed>0},
  {id:'custom', n:'Quiz Creator',  i:'✏️', d:'Add a custom question',         c: s=>s.customAdded>0},
  {id:'6subj',  n:'All Rounder',   i:'🌈', d:'Play 6 different subjects',     c: s=>(s.subjsPlayed||[]).length>=6},
];

const XP_OK = 10, XP_NG = -5, FREE_COUNT = 20, TIMER_SEC = 20;

/* ── State ──────────────────────────────────────────────── */
let G = {
  player: null, cls: 1, subject: null, mode: null,
  qs: [], idx: 0,
  score: {ok:0, ng:0}, sesXP: 0,
  streak: 0, bestStr: 0,
  answered: false, hintUsed: false,
  timer: null, timerVal: 0,
  ll: {fifty:true, skip:true, etime:true},
  pu: {dbl:2, shield:2, etime:2},
  apu: {dbl:false, shield:false, etime:false},
  review: [],
  sound: true, light: false,
  progress: null,
  mp: {on:false, p2n:'Player 2', p2a:'🤖', s1:0, s2:0, turn:1},
};

/* ── DOM helpers ─────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = s  => document.querySelectorAll(s);
const esc = s => { const d=document.createElement('div'); d.appendChild(document.createTextNode(s||'')); return d.innerHTML; };
const cap = s => s ? s.charAt(0).toUpperCase()+s.slice(1) : '';

/* ── LocalStorage ────────────────────────────────────────── */
const LS = {
  get:  k    => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set:  (k,v)=> localStorage.setItem(k, JSON.stringify(v)),
  del:  k    => localStorage.removeItem(k),
};

/* ── Screen router ───────────────────────────────────────── */
function show(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}

/* ════════════════════════════════════════════════════════
   LIVE CLOCK
   ════════════════════════════════════════════════════════ */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function tickClock() {
  const now  = new Date();
  const h12  = now.getHours() % 12 || 12;
  const mm   = String(now.getMinutes()).padStart(2,'0');
  const ss   = String(now.getSeconds()).padStart(2,'0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const timeStr = `${String(h12).padStart(2,'0')}:${mm}:${ss} ${ampm}`;
  const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const dayStr  = DAYS[now.getDay()].toUpperCase();

  $$('.clk-time').forEach(el => el.textContent = timeStr);
  $$('.clk-date').forEach(el => el.textContent = dateStr);
  $$('.clk-day' ).forEach(el => el.textContent = dayStr);
}
setInterval(tickClock, 1000);
tickClock(); // run immediately

/* ════════════════════════════════════════════════════════
   CANVAS STARS
   ════════════════════════════════════════════════════════ */
function initCanvas() {
  const c = $('canvas-bg');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
    stars = Array.from({length:70}, () => ({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.3+.3, o:Math.random()*.45+.1,
      s:Math.random()*.1+.02, p:Math.random()*Math.PI*2,
    }));
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    stars.forEach(s => {
      s.p += s.s * .04;
      const a = s.o * (.6+.4*Math.sin(s.p));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(200,225,255,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize(); draw();
}

/* ════════════════════════════════════════════════════════
   SOUND
   ════════════════════════════════════════════════════════ */
function snd(type) {
  if (!G.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const note = (f,t,dur,wave='sine',vol=.22) => {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type=wave; o.frequency.value=f;
      g.gain.setValueAtTime(vol, ctx.currentTime+t);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime+t+dur);
      o.start(ctx.currentTime+t); o.stop(ctx.currentTime+t+dur);
    };
    if (type==='correct') [523,659,784].forEach((f,i)=>note(f,i*.08,.4));
    if (type==='wrong')   { note(220,.0,.35,'sawtooth',.2); note(174,.1,.28,'sawtooth',.15); }
    if (type==='streak')  [440,550,660,880].forEach((f,i)=>note(f,i*.06,.3,'triangle',.18));
    if (type==='level')   [261,329,392,523].forEach((f,i)=>note(f,i*.1,.5));
  } catch(_) {}
}

/* ════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════ */
function toast(msg, type='info', dur=2800) {
  const el = document.createElement('div');
  el.className = `toast t-${type}`;
  el.textContent = msg;
  $('toast-box').appendChild(el);
  setTimeout(() => el.remove(), dur);
}

/* ════════════════════════════════════════════════════════
   CONFETTI
   ════════════════════════════════════════════════════════ */
function confetti() {
  const cols = ['#ffd60a','#06d6a0','#4cc9f0','#ef476f','#f77f00','#f72585'];
  for (let i=0; i<55; i++) {
    const p = document.createElement('div');
    p.className = 'cf-piece';
    p.style.cssText = `left:${Math.random()*100}vw;background:${cols[i%cols.length]};animation-delay:${Math.random()*1.5}s;animation-duration:${1.8+Math.random()}s;transform:rotate(${Math.random()*360}deg)`;
    document.body.appendChild(p);
    setTimeout(()=>p.remove(), 3200);
  }
}

/* ════════════════════════════════════════════════════════
   PROGRESS
   ════════════════════════════════════════════════════════ */
function saveProgress() {
  const old = G.progress || {};
  const sp  = [...new Set([...(old.subjsPlayed||[]), G.subject])];
  const data = {
    name:        G.player.name,
    avatarId:    G.player.avatarId,
    avatarEmoji: G.player.avatarEmoji,
    xp:          (old.xp||0) + G.sesXP,
    totalQ:      (old.totalQ||0) + G.qs.length,
    correctA:    (old.correctA||0) + G.score.ok,
    bestStreak:  Math.max(old.bestStreak||0, G.bestStr),
    maxClass:    Math.max(old.maxClass||0, G.cls),
    subjsPlayed: sp,
    multiPlayed: old.multiPlayed||0,
    customAdded: old.customAdded||0,
    achievements:old.achievements||[],
    subjectStats:mergeStats(old.subjectStats||{}, buildSesStats()),
    lastCls:  G.cls,
    lastSubj: G.subject,
  };
  LS.set('bsq_prog', data);
  G.progress = data;
  checkAchs(data);
}

function loadProgress() { return LS.get('bsq_prog'); }

function buildSesStats() {
  const m = {};
  G.review.forEach(r => {
    const k = r.subj||G.subject;
    if (!m[k]) m[k] = {ok:0,total:0};
    m[k].total++; if (r.wasOk) m[k].ok++;
  });
  return m;
}

function mergeStats(a, b) {
  const m = {...a};
  for (const [k,v] of Object.entries(b)) {
    if (!m[k]) m[k]={ok:0,total:0};
    m[k].ok+=v.ok; m[k].total+=v.total;
  }
  return m;
}

function getLB() { return LS.get('bsq_lb')||[]; }
function saveToLB() {
  let lb = getLB();
  const prog = loadProgress();
  const e = {
    name:        G.player.name,
    avatarEmoji: G.player.avatarEmoji,
    xp:          prog ? prog.xp : G.sesXP,
    ok:          G.score.ok,
    total:       G.qs.length,
    cls:         G.cls,
    subj:        G.subject,
    mode:        G.mode,
    date:        new Date().toLocaleDateString('en-IN'),
  };
  lb = lb.filter(x => x.name.toLowerCase() !== e.name.toLowerCase());
  lb.push(e); lb.sort((a,b)=>b.xp-a.xp); lb=lb.slice(0,20);
  LS.set('bsq_lb', lb);
}

function checkAchs(prog, rnd=null) {
  const ul = prog.achievements||[];
  ACHS.forEach(a => {
    if (!ul.includes(a.id) && a.c(prog,rnd)) {
      ul.push(a.id);
      toast(`🏅 Unlocked: ${a.i} ${a.n}`, 'gold', 4000);
    }
  });
  prog.achievements = ul;
  LS.set('bsq_prog', prog);
}

function getTitle(xp) {
  let t = TITLES[0];
  TITLES.forEach(x => { if (xp >= x.min) t=x; });
  return t;
}

/* ════════════════════════════════════════════════════════
   FETCH QUESTIONS
   ════════════════════════════════════════════════════════ */
async function fetchQs(cls, subj) {
  const file = SUBJECTS.find(s=>s.id===subj)?.file || subj+'.json';
  try {
    const res = await fetch(`data/class${cls}/${file}`);
    if (!res.ok) throw 0;
    return await res.json();
  } catch { return []; }
}

function shuffle(arr) {
  const a=[...arr];
  for (let i=a.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

/* ════════════════════════════════════════════════════════
   SCREENS
   ════════════════════════════════════════════════════════ */

/* HOME */
function buildHome() {
  G.progress = loadProgress();
  const p = G.progress;
  const strip = $('resume-strip');
  if (p) {
    strip.classList.remove('hidden');
    $('rs-ava').textContent  = p.avatarEmoji||'🧑‍🚀';
    $('rs-name').textContent = p.name;
    const t = getTitle(p.xp||0);
    $('rs-meta').textContent = `${t.i} ${t.t} · ${p.xp||0} XP · Class ${p.lastCls||1} · ${cap(p.lastSubj||'')}`;
    $('btn-resume').classList.toggle('hidden', !p.lastCls || !p.lastSubj);
  } else strip.classList.add('hidden');
  show('screen-home');
}

/* SETUP */
function buildSetup() {
  const p = loadProgress();
  if (p) {
    $('inp-name').value = p.name;
    G.player = {name:p.name, avatarId:p.avatarId, avatarEmoji:p.avatarEmoji};
  }
  renderAvatarGrid('av-grid', p?.avatarId, (id,em) => {
    if (G.player) { G.player.avatarId=id; G.player.avatarEmoji=em; }
  });
  show('screen-setup');
}

function renderAvatarGrid(gridId, sel, onPick) {
  const grid=$(gridId); grid.innerHTML='';
  AVATARS.forEach(av => {
    const el=document.createElement('div');
    el.className='av-item'+(av.id===sel?' picked':'');
    el.innerHTML=`<span class="av-e">${av.e}</span><span class="av-n">${av.n}</span>`;
    el.addEventListener('click',()=>{
      grid.querySelectorAll('.av-item').forEach(x=>x.classList.remove('picked'));
      el.classList.add('picked'); onPick(av.id, av.e);
    });
    grid.appendChild(el);
  });
}

function onSetupNext() {
  const name=$('inp-name').value.trim();
  if (!name) { toast('Apna naam likho!','err'); return; }
  const sel=document.querySelector('#av-grid .av-item.picked');
  if (!sel) { toast('Avatar chunno!','err'); return; }
  const av=AVATARS.find(a=>a.e===sel.querySelector('.av-e').textContent);
  G.player={name, avatarId:av?.id||'a1', avatarEmoji:av?.e||'🧑‍🚀'};
  buildClassScreen();
}

/* CLASS SELECT */
function buildClassScreen() {
  const grid=$('class-grid'); grid.innerHTML='';
  for (let i=1;i<=12;i++) {
    const c=document.createElement('div');
    c.className='cls-card'+(G.cls===i?' picked':'');
    c.innerHTML=`<div class="cls-num">${i}</div><div class="cls-lbl">Class</div>`;
    c.addEventListener('click',()=>{
      $$('.cls-card').forEach(x=>x.classList.remove('picked'));
      c.classList.add('picked'); G.cls=i;
    });
    grid.appendChild(c);
  }
  show('screen-class');
}

function onClassNext() {
  if (!G.cls) { toast('Class chunno!','err'); return; }
  buildSubjectScreen();
}

/* SUBJECT SELECT */
function buildSubjectScreen() {
  $('subj-cls-lbl').textContent=`Class ${G.cls}`;
  const grid=$('subj-grid'); grid.innerHTML='';
  SUBJECTS.forEach(s=>{
    const c=document.createElement('div');
    c.className='subj-card'+(G.subject===s.id?' picked':'');
    c.dataset.s=s.id;
    c.innerHTML=`<span class="subj-icon">${s.icon}</span><div class="subj-name">${s.name}</div>`;
    c.addEventListener('click',()=>{
      $$('.subj-card').forEach(x=>x.classList.remove('picked'));
      c.classList.add('picked'); G.subject=s.id;
    });
    grid.appendChild(c);
  });
  show('screen-subj');
}

function onSubjNext() {
  if (!G.subject) { toast('Subject chunno!','err'); return; }
  buildModeScreen();
}

/* MODE SELECT */
function buildModeScreen() {
  $('mode-cls-info').textContent=`Class ${G.cls} · ${cap(G.subject)}`;
  G.mode=null;
  $$('.mode-card').forEach(c=>c.classList.remove('picked'));
  $('btn-start').disabled=true;
  show('screen-mode');
}

function pickMode(m) {
  G.mode=m;
  $$('.mode-card').forEach(c=>c.classList.toggle('picked', c.dataset.m===m));
  $('btn-start').disabled=false;
}

/* ════════════════════════════════════════════════════════
   START GAME
   ════════════════════════════════════════════════════════ */
async function startGame() {
  if (!G.mode) { toast('Mode chunno!','err'); return; }
  $('btn-start').textContent='⏳ Loading…'; $('btn-start').disabled=true;

  G.score={ok:0,ng:0}; G.sesXP=0; G.idx=0;
  G.answered=false; G.streak=0; G.bestStr=0; G.review=[];
  G.hintUsed=false;
  G.ll={fifty:true,skip:true,etime:true};
  G.apu={dbl:false,shield:false,etime:false};

  const pool=shuffle(await fetchQs(G.cls, G.subject));
  if (!pool.length) {
    toast(`Class ${G.cls} ${cap(G.subject)} ke questions nahi mile!`,'err');
    $('btn-start').textContent='⚡ Start Quiz'; $('btn-start').disabled=false;
    return;
  }
  G.qs = G.mode==='all' ? pool : pool.slice(0,Math.min(FREE_COUNT,pool.length));

  $('btn-start').textContent='⚡ Start Quiz'; $('btn-start').disabled=false;
  buildHUD(); nextQ(); show('screen-quiz');
}

/* HUD */
function buildHUD() {
  $('hud-ava').textContent   = G.player.avatarEmoji;
  $('hud-name').textContent  = G.player.name;
  $('hud-meta').textContent  = `Class ${G.cls} · ${cap(G.subject)}`;
  $('hud-mode-tag').textContent = G.mode==='free'?'∞ Free':G.mode==='timer'?'⏱ Timer':'📚 Full Set';
  $('timer-ring').style.display = G.mode==='timer' ? 'block' : 'none';
  if (!G.mp.on) $('mp-mini').classList.remove('on');
  refreshXP(); renderPUBar();
}

function refreshXP() {
  const p=loadProgress(), base=p?p.xp:0, total=base+G.sesXP;
  $('hud-xp').textContent   = `${total} XP`;
  const t=getTitle(total);
  $('hud-title').textContent = `${t.i} ${t.t}`;
  $('hud-streak').textContent=`🔥 ${G.streak}×`;
  $('hud-streak').classList.toggle('on', G.streak>=2);
}

function refreshProg() {
  const pct=G.qs.length>0?Math.round(G.idx/G.qs.length*100):0;
  $('prog-fill').style.width=pct+'%';
  $('prog-txt').innerHTML=`Q <b>${Math.min(G.idx+1,G.qs.length)}</b> / <b>${G.qs.length}</b>`;
}

/* QUESTION */
function nextQ() {
  if (G.idx>=G.qs.length) { endRound(); return; }
  G.answered=false; G.hintUsed=false;
  clearTimer(); refreshProg();

  const q=G.qs[G.idx];
  $('q-subj-tag').textContent  = q.subject||cap(G.subject);
  $('q-diff-tag').textContent  = q.difficulty||'easy';
  $('q-diff-tag').className    = `q-tag q-diff-tag ${q.difficulty||'easy'}`;
  $('q-topic-tag').textContent = q.topic||'';
  $('q-topic-tag').style.display = q.topic?'inline-block':'none';
  $('q-num-tag').textContent   = `#${G.idx+1}`;
  $('q-text').textContent      = q.question;
  $('hint-box').classList.remove('on'); $('hint-box').textContent='';
  $('btn-hint').classList.toggle('used', !q.hint);

  $('ll-fifty').classList.toggle('used',!G.ll.fifty);
  $('ll-skip').classList.toggle('used',!G.ll.skip);
  $('ll-etime').classList.toggle('used',!G.ll.etime);

  const grid=$('opts-grid'); grid.innerHTML='';
  const labels=['A','B','C','D'];
  shuffle(q.options.slice()).forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='opt';
    btn.innerHTML=`<span class="opt-lbl">${labels[i]}</span><span class="opt-txt">${esc(opt)}</span>`;
    btn.addEventListener('click',()=>onAnswer(btn,opt,q.answer,q));
    grid.appendChild(btn);
  });

  const card=$('q-card');
  card.style.animation='none'; void card.offsetWidth; card.style.animation='';

  if (G.mode==='timer') startTimer();
}

/* ANSWER */
function onAnswer(btn, chosen, correct, q) {
  if (G.answered) return;
  G.answered=true; clearTimer();

  const ok=(chosen===correct);
  let xp=ok?XP_OK:XP_NG;

  if (!ok && G.apu.shield) { xp=0; G.apu.shield=false; toast('🛡️ Shield ne XP loss roka!','gold'); }
  if (ok  && G.apu.dbl)   { xp*=2; G.apu.dbl=false;    toast(`⚡ Double XP! +${xp}`,'gold'); }

  if (ok) {
    G.score.ok++; G.streak++; G.bestStr=Math.max(G.bestStr,G.streak);
    btn.classList.add('correct'); snd('correct');
    showXPPop(`+${xp} XP`,true);
    if (G.streak===3||G.streak===5||G.streak===10) { snd('streak'); showStreakBurst(G.streak); }
  } else {
    G.score.ng++; G.streak=0;
    btn.classList.add('wrong'); snd('wrong');
    if (xp!==0) showXPPop(`${xp} XP`,false);
    $$('.opt').forEach(b=>{ if(b.querySelector('.opt-txt').textContent===correct) b.classList.add('correct'); });
  }

  G.sesXP=Math.max(0,G.sesXP+xp); refreshXP();

  if (G.mp.on) {
    if (G.mp.turn===1) G.mp.s1+=ok?1:0; else G.mp.s2+=ok?1:0;
    $('mp-s1').textContent=G.mp.s1; $('mp-s2').textContent=G.mp.s2;
    G.mp.turn=G.mp.turn===1?2:1;
    $('mp-turn-lbl').textContent=G.mp.turn===1?`${G.player.avatarEmoji} ${G.player.name} ki baari`:`${G.mp.p2a} ${G.mp.p2n} ki baari`;
  }

  G.review.push({q:q.question, chosen, correct, wasOk:ok, subj:q.subject||G.subject});
  $$('.opt').forEach(b=>b.disabled=true);
  setTimeout(()=>{ G.idx++; nextQ(); },1500);
}

/* TIMER */
const CIRC=2*Math.PI*21;
function startTimer() {
  G.timerVal=G.apu.etime?TIMER_SEC+10:TIMER_SEC;
  if (G.apu.etime) G.apu.etime=false;
  setRing(G.timerVal,TIMER_SEC); $('timer-ring').className='timer-ring';

  G.timer=setInterval(()=>{
    G.timerVal--;
    setRing(G.timerVal,TIMER_SEC);
    $('timer-ring').className='timer-ring'+(G.timerVal<=5?' danger':G.timerVal<=10?' warn':'');

    if (G.timerVal<=0) {
      clearTimer();
      if (!G.answered) {
        G.answered=true;
        const q=G.qs[G.idx];
        $$('.opt').forEach(b=>{b.disabled=true; if(b.querySelector('.opt-txt').textContent===q.answer) b.classList.add('correct');});
        G.score.ng++; G.streak=0;
        G.sesXP=Math.max(0,G.sesXP+XP_NG);
        G.review.push({q:q.question,chosen:'(timeout)',correct:q.answer,wasOk:false,subj:q.subject||G.subject});
        refreshXP(); showXPPop('⏱ -5 XP',false); toast('Time out!','err');
        setTimeout(()=>{G.idx++;nextQ();},1500);
      }
    }
  },1000);
}

function setRing(val,max) {
  $('tr-fg').style.strokeDashoffset=CIRC*(1-Math.max(0,val)/max);
  $('tr-num').textContent=Math.max(0,val);
}
function clearTimer() { if(G.timer){clearInterval(G.timer);G.timer=null;} }

/* LIFELINES */
function onFifty() {
  if(!G.ll.fifty||G.answered) return;
  G.ll.fifty=false;
  const cor=G.qs[G.idx].answer; let rem=0;
  $$('.opt').forEach(b=>{ if(rem<2&&b.querySelector('.opt-txt').textContent!==cor){b.classList.add('dim50');rem++;} });
  $('ll-fifty').classList.add('used'); toast('50:50 — 2 galat options hataaye!','info');
}
function onSkip() {
  if(!G.ll.skip||G.answered) return;
  G.ll.skip=false; clearTimer(); $('ll-skip').classList.add('used');
  toast('⏭ Question skip kiya!','info'); G.idx++; nextQ();
}
function onETime() {
  if(!G.ll.etime||G.answered||G.mode!=='timer') return;
  G.ll.etime=false;
  G.timerVal=Math.min(G.timerVal+10,TIMER_SEC+10); setRing(G.timerVal,TIMER_SEC);
  $('ll-etime').classList.add('used'); toast('+10 seconds mila!','gold');
}
function onHint() {
  if(G.hintUsed||G.answered) return;
  const q=G.qs[G.idx];
  if(!q?.hint){toast('Is question ka hint nahi hai.','info');return;}
  G.hintUsed=true; $('hint-box').textContent='💡 '+q.hint; $('hint-box').classList.add('on');
  G.sesXP=Math.max(0,G.sesXP-3); refreshXP(); toast('Hint dekha (−3 XP)','info');
}

/* POWER-UPS */
function renderPUBar() {
  const bar=$('pu-bar'); bar.innerHTML='';
  [{id:'dbl',icon:'⚡',lbl:'2× XP'},{id:'shield',icon:'🛡️',lbl:'Shield'},{id:'etime',icon:'⏰',lbl:'+Time'}].forEach(p=>{
    const el=document.createElement('div');
    el.className='act-pill'+(G.pu[p.id]<=0?' used':'');
    el.innerHTML=`${p.icon} ${p.lbl} <span class="act-badge">${G.pu[p.id]}</span>`;
    el.addEventListener('click',()=>activatePU(p.id)); bar.appendChild(el);
  });
}
function activatePU(id) {
  if(G.pu[id]<=0){toast('Power-up khatam!','err');return;}
  if(G.apu[id]){toast('Pehle se active hai!','info');return;}
  G.pu[id]--; G.apu[id]=true; renderPUBar();
  const msgs={dbl:'⚡ Double XP active!',shield:'🛡️ Shield active!',etime:'⏰ Extra Time ready!'};
  toast(msgs[id],'gold');
}

function showXPPop(msg,ok) {
  const el=$('xp-pop'); el.textContent=msg;
  el.className='xp-pop '+(ok?'ok':'ng'); // wait then remove class via timeout
  setTimeout(()=>el.className='xp-pop',950);
}
function showStreakBurst(n) {
  $('sb-inner').textContent=`🔥 ${n}× STREAK!`;
  const w=$('streak-burst'); w.className='streak-burst on';
  setTimeout(()=>w.className='streak-burst',1100);
}

/* ════════════════════════════════════════════════════════
   END ROUND
   ════════════════════════════════════════════════════════ */
function endRound() {
  clearTimer();
  if (G.mp.on) { endMP(); return; }
  saveProgress(); saveToLB(); buildResults(); show('screen-result');
}
function endMP() {
  G.mp.on=false;
  const p=loadProgress()||{}; p.multiPlayed=(p.multiPlayed||0)+1; LS.set('bsq_prog',p);
  buildMPResult(); show('screen-mp-result');
}

/* RESULTS */
function buildResults() {
  const total=G.qs.length, ok=G.score.ok, ng=G.score.ng;
  const pct=total>0?Math.round(ok/total*100):0;

  let grade,gc,msg;
  if(pct>=90){grade='S';gc='rg-s';msg='🏆 Zabardast! Ek dum genius!'; if(pct===100)confetti();}
  else if(pct>=75){grade='A';gc='rg-a';msg='⭐ Bahut achha! Kya performance!';}
  else if(pct>=60){grade='B';gc='rg-b';msg='✨ Achha kiya! Aur mehnat karo!';}
  else if(pct>=45){grade='C';gc='rg-c';msg='💪 Theek hai! Practice karte raho!';}
  else{grade='D';gc='rg-d';msg='🔄 Haar mat maano! Phir try karo!';}

  if(pct>=90) snd('level');

  $('res-ava').textContent    = G.player.avatarEmoji;
  $('res-grade').textContent  = grade; $('res-grade').className='res-grade '+gc;
  $('res-player').textContent = G.player.name;
  $('res-msg').textContent    = msg;
  $('res-info').textContent   = `Class ${G.cls} · ${cap(G.subject)} · ${G.mode==='free'?'Free Play':G.mode==='timer'?'Timer Mode':'Full Set'}`;

  $('rs-ok').textContent   = ok;
  $('rs-ng').textContent   = ng;
  $('rs-xp').textContent   = '+'+G.sesXP;
  $('rs-pct').textContent  = pct+'%';
  $('rs-str').textContent  = G.bestStr;
  $('rs-tot').textContent  = total;

  const prog=loadProgress();
  $('res-txp').textContent   = (prog?prog.xp:G.sesXP)+' XP total';
  const t=getTitle(prog?prog.xp:G.sesXP);
  $('res-title').textContent = `${t.i} ${t.t}`;

  buildReview(); buildShareCard(pct,G.sesXP);
  if(prog) checkAchs(prog,{wrong:ng,total,ok});
}

function buildReview() {
  const list=$('rev-list'); list.innerHTML='';
  G.review.forEach((r,i)=>{
    const d=document.createElement('div');
    d.className='rev-item '+(r.wasOk?'ok':'bad');
    d.innerHTML=`<div class="rev-q"><b>Q${i+1}:</b> ${esc(r.q)}</div>
      <div class="rev-a">Tumhara jawab: <span class="${r.wasOk?'ra-ok':'ra-bad'}">${esc(r.chosen)}</span>
      ${!r.wasOk?`&nbsp;·&nbsp; Sahi jawab: <span class="ra-cor">${esc(r.correct)}</span>`:''}</div>`;
    list.appendChild(d);
  });
}

function buildShareCard(pct,xp) {
  $('sh-pct').textContent  = pct+'%';
  $('sh-name').textContent = `${G.player.avatarEmoji} ${G.player.name}`;
  $('sh-info').textContent = `Class ${G.cls} · ${cap(G.subject)}`;
  $('sh-xp').textContent   = `+${xp} XP`;
}

function onShare() {
  const text=`Maine BrainQuiz mein ${$('sh-pct').textContent} score kiya (Class ${G.cls} · ${cap(G.subject)}) aur ${$('sh-xp').textContent} kamaya! Beat kar ke dikha! 🧠⚡`;
  if(navigator.share) navigator.share({title:'BrainQuiz',text}).catch(()=>{});
  else navigator.clipboard.writeText(text).then(()=>toast('Score copy hua!','info'));
}

/* LEADERBOARD */
function buildLB() { renderLB('all'); show('screen-lb'); }
function renderLB(filter) {
  let lb=getLB();
  if(filter!=='all') lb=lb.filter(e=>e.mode===filter);
  const list=$('lb-list');
  if(!lb.length){list.innerHTML='<div class="lb-empty">Koi score nahi hai. Pehle quiz khelo! 🎮</div>';return;}
  list.innerHTML='';
  lb.forEach((e,i)=>{
    const r=i+1, medal=r<=3?['🥇','🥈','🥉'][r-1]:`#${r}`, rc=r<=3?`rk${r}`:'rkn';
    const row=document.createElement('div');
    row.className='lb-row'+(r<=3?` r${r}`:''); row.style.animationDelay=(i*.05)+'s';
    row.innerHTML=`<div class="lb-rank ${rc}">${medal}</div>
      <div class="lb-ava">${e.avatarEmoji||'🧑‍🚀'}</div>
      <div class="lb-info"><div class="lb-name">${esc(e.name)}</div>
        <div class="lb-sub">Class ${e.cls} · ${cap(e.subj)} · ${e.ok}/${e.total} · ${e.date}</div></div>
      <div class="lb-xp-w"><div class="lb-xp-v">${e.xp}</div><div class="lb-xp-l">XP</div></div>`;
    list.appendChild(row);
  });
}

/* STATS */
function buildStats() {
  const p=loadProgress()||{};
  $('st-xp').textContent  = p.xp||0;   $('st-q').textContent   = p.totalQ||0;
  $('st-ok').textContent  = p.correctA||0; $('st-str').textContent = p.bestStreak||0;
  $('st-cls').textContent = p.maxClass||0;  $('st-sbj').textContent = (p.subjsPlayed||[]).length;

  const ss=p.subjectStats||{};
  const bars=$('stat-bars'); bars.innerHTML='';
  const COLORS={math:'#4cc9f0',science:'#06d6a0',english:'#80b918',hindi:'#f77f00',computer:'#7b2fff',evs:'#00c49a',gk:'#ffd60a',economics:'#f77f00',space:'#a78bfa','animals-birds':'#f72585'};
  Object.entries(ss).forEach(([s,d])=>{
    const pct=d.total>0?Math.round(d.ok/d.total*100):0;
    const row=document.createElement('div'); row.className='bar-row';
    row.innerHTML=`<div class="bar-lbl">${cap(s)}</div>
      <div class="bar-track"><div class="bar-fill" style="width:0%;background:${COLORS[s]||'#4cc9f0'}"></div></div>
      <div class="bar-pct">${pct}%</div>`;
    bars.appendChild(row);
    setTimeout(()=>row.querySelector('.bar-fill').style.width=pct+'%',80);
  });
  if(!Object.keys(ss).length) bars.innerHTML='<div class="dim" style="text-align:center;padding:14px">Quiz khelo toh stats dikhenge!</div>';

  const ul=p.achievements||[];
  const grid=$('ach-grid'); grid.innerHTML='';
  ACHS.forEach(a=>{
    const locked=!ul.includes(a.id);
    const c=document.createElement('div'); c.className='ach-card '+(locked?'locked':'unlocked');
    c.innerHTML=`<span class="ach-icon">${a.i}</span><div class="ach-name">${a.n}</div>
      <div class="ach-desc">${a.d}</div>${!locked?'<span class="ach-badge">✅ Unlocked</span>':''}`;
    grid.appendChild(c);
  });
  show('screen-stats');
}

/* MULTIPLAYER */
function buildMP() {
  if(!G.player){buildSetup();return;}
  $('mp-p1-ava').textContent=$('mp-p1-ava').textContent=G.player.avatarEmoji;
  $('mp-p1-name').textContent=G.player.name;
  renderAvatarGrid('mp-av-grid',null,(id,em)=>{G.mp.p2a=em;});
  show('screen-mp');
}
async function startMP() {
  const p2n=$('mp-p2-inp').value.trim()||'Player 2';
  const sel=document.querySelector('#mp-av-grid .av-item.picked');
  G.mp={on:true,p2n,p2a:sel?sel.querySelector('.av-e').textContent:'🤖',s1:0,s2:0,turn:1};
  $('mp-m-p1a').textContent=G.player.avatarEmoji; $('mp-m-p1n').textContent=G.player.name;
  $('mp-m-p2a').textContent=G.mp.p2a; $('mp-m-p2n').textContent=G.mp.p2n;
  $('mp-s1').textContent='0'; $('mp-s2').textContent='0';
  $('mp-mini').classList.add('on');
  $('mp-turn-lbl').textContent=`${G.player.avatarEmoji} ${G.player.name} ki baari`;
  G.mode='free'; G.subject=G.subject||'math'; await startGame();
}
function buildMPResult() {
  const p1=G.mp.s1, p2=G.mp.s2;
  $('mpr-p1a').textContent=G.player.avatarEmoji; $('mpr-p1n').textContent=G.player.name; $('mpr-s1').textContent=p1;
  $('mpr-p2a').textContent=G.mp.p2a; $('mpr-p2n').textContent=G.mp.p2n; $('mpr-s2').textContent=p2;
  $('mp-winner').textContent=p1>p2?`🏆 ${G.player.name} Jeeta!`:p2>p1?`🏆 ${G.mp.p2n} Jeeta!`:'🤝 Draw hai!';
  if(p1!==p2) confetti();
}

/* ADMIN */
function buildAdmin() { renderEdList(); show('screen-admin'); }
function renderEdList() {
  const cq=LS.get('bsq_cq')||[], list=$('ed-list');
  list.innerHTML='';
  if(!cq.length){list.innerHTML='<div class="dim" style="text-align:center;padding:14px">Koi custom question nahi hai abhi.</div>';return;}
  cq.forEach((q,i)=>{
    const r=document.createElement('div'); r.className='ed-row';
    r.innerHTML=`<div class="ed-body"><div class="ed-q">${esc(q.question)}</div>
      <div class="ed-meta">Class ${q.class} · ${cap(q.subject)} · ${q.difficulty} · ✅ ${esc(q.answer)}</div></div>
      <button class="btn btn-outline btn-xs" onclick="delCQ(${i})">🗑</button>`;
    list.appendChild(r);
  });
}
function saveCQ() {
  const q=$('eq-q').value.trim();
  const opts=[$('eq-o1').value.trim(),$('eq-o2').value.trim(),$('eq-o3').value.trim(),$('eq-o4').value.trim()];
  const ans=$('eq-ans').value.trim(), hint=$('eq-hint').value.trim();
  const cls=parseInt($('eq-cls').value)||1, subj=$('eq-subj').value, diff=$('eq-diff').value;
  if(!q||!ans||opts.some(o=>!o)){toast('Sab required fields bharo!','err');return;}
  if(!opts.includes(ans)){toast('Answer kisi option se match karo!','err');return;}
  const cq=LS.get('bsq_cq')||[];
  cq.push({id:Date.now(),class:cls,subject:subj,topic:'Custom',question:q,options:opts,answer:ans,difficulty:diff,hint});
  LS.set('bsq_cq',cq);
  const p=loadProgress()||{}; p.customAdded=(p.customAdded||0)+1; LS.set('bsq_prog',p);
  toast('✅ Question save hua!','ok'); renderEdList();
  ['eq-q','eq-o1','eq-o2','eq-o3','eq-o4','eq-ans','eq-hint'].forEach(id=>$(id)&&($(id).value=''));
}
function delCQ(i) {
  const cq=LS.get('bsq_cq')||[]; cq.splice(i,1); LS.set('bsq_cq',cq);
  toast('Delete ho gaya','info'); renderEdList();
}

/* THEME / SOUND */
function toggleSound() {
  G.sound=!G.sound; LS.set('bsq_snd',G.sound);
  $('btn-snd').innerHTML=G.sound?'🔊 Sound':'🔇 Sound';
  toast(G.sound?'Sound ON':'Sound OFF','info');
}
function toggleTheme() {
  G.light=!G.light; document.body.classList.toggle('light',G.light); LS.set('bsq_light',G.light);
  $('btn-theme').innerHTML=G.light?'🌙 Dark':'☀️ Light';
}
function resetAll() {
  if(!confirm('Sab progress, XP aur achievements delete ho jayenge! Sure ho?')) return;
  ['bsq_prog','bsq_lb','bsq_cq'].forEach(k=>LS.del(k));
  G.progress=null; toast('Reset ho gaya!','info'); buildHome();
}
function resumeGame() {
  const p=loadProgress(); if(!p) return;
  G.player={name:p.name,avatarId:p.avatarId,avatarEmoji:p.avatarEmoji};
  G.progress=p; G.cls=p.lastCls||1; G.subject=p.lastSubj||'math';
  buildModeScreen();
}

/* ════════════════════════════════════════════════════════
   BIND EVENTS
   ════════════════════════════════════════════════════════ */
function bindEvents() {
  // Home
  $('btn-new').addEventListener('click', buildSetup);
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-lb-h').addEventListener('click', buildLB);
  $('btn-stats-h').addEventListener('click', buildStats);
  $('btn-mp-h').addEventListener('click', buildMP);
  $('btn-admin-h').addEventListener('click', buildAdmin);
  $('btn-reset-h').addEventListener('click', resetAll);

  // Setup
  $('btn-setup-next').addEventListener('click', onSetupNext);
  $('btn-setup-back').addEventListener('click', buildHome);

  // Class
  $('btn-cls-next').addEventListener('click', onClassNext);
  $('btn-cls-back').addEventListener('click', buildSetup);

  // Subject
  $('btn-subj-next').addEventListener('click', onSubjNext);
  $('btn-subj-back').addEventListener('click', buildClassScreen);

  // Mode
  $$('.mode-card').forEach(c=>c.addEventListener('click',()=>pickMode(c.dataset.m)));
  $('btn-start').addEventListener('click', startGame);
  $('btn-mode-back').addEventListener('click', buildSubjectScreen);

  // Quiz
  $('btn-quit').addEventListener('click', ()=>{ clearTimer(); saveProgress(); buildHome(); });
  $('ll-fifty').addEventListener('click', onFifty);
  $('ll-skip').addEventListener('click', onSkip);
  $('ll-etime').addEventListener('click', onETime);
  $('btn-hint').addEventListener('click', onHint);

  // Results
  $('btn-again').addEventListener('click', startGame);
  $('btn-chg-subj').addEventListener('click', buildSubjectScreen);
  $('btn-res-lb').addEventListener('click', buildLB);
  $('btn-res-home').addEventListener('click', buildHome);
  $('btn-share').addEventListener('click', onShare);

  // LB
  $$('.lb-tab').forEach(t=>t.addEventListener('click',()=>{
    $$('.lb-tab').forEach(x=>x.classList.remove('on')); t.classList.add('on'); renderLB(t.dataset.f);
  }));
  $('btn-lb-back').addEventListener('click', buildHome);

  // Stats
  $('btn-stats-back').addEventListener('click', buildHome);

  // MP
  $('btn-mp-start').addEventListener('click', startMP);
  $('btn-mp-back').addEventListener('click', buildHome);
  $('btn-mpr-again').addEventListener('click', buildMP);
  $('btn-mpr-home').addEventListener('click', buildHome);

  // Admin
  $('btn-save-q').addEventListener('click', saveCQ);
  $('btn-admin-back').addEventListener('click', buildHome);

  // Toolbar
  $('btn-snd').addEventListener('click', toggleSound);
  $('btn-theme').addEventListener('click', toggleTheme);
}

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
function init() {
  const sl=LS.get('bsq_light'); G.light=!!sl;
  if(G.light) document.body.classList.add('light');
  $('btn-theme').innerHTML=G.light?'🌙 Dark':'☀️ Light';

  const ss=LS.get('bsq_snd'); G.sound=ss===null?true:ss;
  $('btn-snd').innerHTML=G.sound?'🔊 Sound':'🔇 Sound';

  initCanvas(); tickClock(); bindEvents(); buildHome();
}

document.addEventListener('DOMContentLoaded', init);
