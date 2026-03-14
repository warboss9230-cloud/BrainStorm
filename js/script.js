// ===== QUIZSTORM V2 — FULL SCRIPT =====

// ===== CONSTANTS =====
const AVATARS = [
  '🧒','👦','👧','🧑‍🎓','👨‍🎓','👩‍🎓','🦸','🦹','🧙','🥷',
  '👨‍💻','👩‍💻','👨‍🚀','👩‍🚀','🤖','👾','😎','🦄','🎭','🃏'
];

const SUBJECTS = [
  {key:'math',      name:'Math',            icon:'🔢', cls:'subj-math'},
  {key:'science',   name:'Science',         icon:'🔬', cls:'subj-science'},
  {key:'english',   name:'English',         icon:'📖', cls:'subj-english'},
  {key:'hindi',     name:'Hindi',           icon:'🇮🇳', cls:'subj-hindi'},
  {key:'computer',  name:'Computer',        icon:'💻', cls:'subj-computer'},
  {key:'evs',       name:'EVS',             icon:'🌿', cls:'subj-evs'},
  {key:'gk',        name:'GK',              icon:'🌍', cls:'subj-gk'},
  {key:'economics', name:'Economics',       icon:'💰', cls:'subj-economics'},
  {key:'space',     name:'Space',           icon:'🚀', cls:'subj-space'},
  {key:'animals',   name:'Animals & Birds', icon:'🦁', cls:'subj-animals'},
];

const GRADES = [
  {min:90, label:'🏆 Outstanding! You\'re a Champion!'},
  {min:70, label:'⭐ Excellent! Keep Rocking!'},
  {min:50, label:'👍 Good Job! Practice More!'},
  {min:30, label:'📚 Keep Trying! You Can Do It!'},
  {min:0,  label:'💪 Practice More & Come Back!'},
];

// ===== BADGES DEFINITION =====
const ALL_BADGES = [
  {id:'first_quiz',   icon:'🎓', name:'First Steps',       desc:'Complete your first quiz',        check:(s)=>s.totalGames>=1},
  {id:'streak_3',     icon:'🔥', name:'On Fire!',           desc:'Get a 3-answer streak',           check:(s)=>s.maxStreak>=3},
  {id:'streak_5',     icon:'⚡', name:'Lightning Bolt',     desc:'Get a 5-answer streak',           check:(s)=>s.maxStreak>=5},
  {id:'streak_10',    icon:'🌟', name:'Unstoppable!',       desc:'Get a 10-answer streak',          check:(s)=>s.maxStreak>=10},
  {id:'xp_100',       icon:'💯', name:'Century Club',       desc:'Earn 100 XP total',               check:(s)=>s.xp>=100},
  {id:'xp_500',       icon:'🚀', name:'XP Rocket',          desc:'Earn 500 XP total',               check:(s)=>s.xp>=500},
  {id:'xp_1000',      icon:'👑', name:'XP King',            desc:'Earn 1000 XP total',              check:(s)=>s.xp>=1000},
  {id:'perfect',      icon:'💎', name:'Perfectionist',      desc:'Score 100% in any quiz',          check:(s)=>s.hasPerfect},
  {id:'all_correct5', icon:'🎯', name:'Sharp Shooter',      desc:'Get 5 correct in a row',          check:(s)=>s.maxStreak>=5},
  {id:'daily1',       icon:'🗓️', name:'Daily Warrior',      desc:'Complete a daily challenge',      check:(s)=>s.dailyCompleted>=1},
  {id:'daily7',       icon:'📅', name:'Weekly Legend',      desc:'Complete 7 daily challenges',     check:(s)=>s.dailyCompleted>=7},
  {id:'games5',       icon:'🎮', name:'Game Addict',        desc:'Play 5 quizzes',                  check:(s)=>s.totalGames>=5},
  {id:'games20',      icon:'🏟️', name:'Quiz Arena',         desc:'Play 20 quizzes',                 check:(s)=>s.totalGames>=20},
  {id:'survivor',     icon:'❤️', name:'Survivor',           desc:'Finish Challenge Mode with 2+ lives', check:(s)=>s.challengeSurvivor},
  {id:'multilang',    icon:'🌐', name:'Polyglot',           desc:'Use all 3 language settings',     check:(s)=>s.langsUsed>=3},
];

// ===== I18N =====
const I18N = {
  en: {
    tagline:'Learn · Play · Conquer!', chooseAvatar:'Choose Your Avatar', streak:'Streak',
    badges:'Badges', enterName:'Enter your name...', startQuiz:'START QUIZ', back:'Back',
    selectClass:'Select Your Class', chooseMode:'Choose Game Mode', freePlay:'Free Play',
    freePlayDesc:'Answer at your own pace!', timerMode:'Timer Mode',
    timerModeDesc:'30 sec per question!', levelMode:'Level Mode',
    levelModeDesc:'Level 1–10. Rise up!', challengeMode:'Challenge',
    challengeModeDesc:'3 ❤️ lives only! Survive!', selectLevel:'Select Level:',
    hint:'Hint', next:'Next', correct:'Correct', wrong:'Wrong', totalXP:'Total XP',
    playAgain:'Play Again', home:'Home', leaderboard:'Leaderboard', myBadges:'My Badges',
    dashboard:'Dashboard', dailyChallenge:'Daily Challenge', gameOver:'Game Over!',
    outOfLives:'You ran out of lives!', tryAgain:'Try Again',
  },
  hi: {
    tagline:'सीखो · खेलो · जीतो!', chooseAvatar:'अपना अवतार चुनें', streak:'स्ट्रीक',
    badges:'बैज', enterName:'अपना नाम लिखें...', startQuiz:'क्विज़ शुरू करें', back:'वापस',
    selectClass:'कक्षा चुनें', chooseMode:'गेम मोड चुनें', freePlay:'फ्री प्ले',
    freePlayDesc:'अपनी गति से जवाब दें!', timerMode:'टाइमर मोड',
    timerModeDesc:'30 सेकंड प्रति प्रश्न!', levelMode:'लेवल मोड',
    levelModeDesc:'लेवल 1-10 में खेलें!', challengeMode:'चैलेंज',
    challengeModeDesc:'केवल 3 ❤️ जीवन!', selectLevel:'लेवल चुनें:',
    hint:'संकेत', next:'अगला', correct:'सही', wrong:'गलत', totalXP:'कुल XP',
    playAgain:'फिर खेलें', home:'होम', leaderboard:'लीडरबोर्ड', myBadges:'मेरे बैज',
    dashboard:'डैशबोर्ड', dailyChallenge:'दैनिक चुनौती', gameOver:'गेम ओवर!',
    outOfLives:'आपके सभी जीवन खत्म हो गए!', tryAgain:'फिर कोशिश करें',
  },
  mr: {
    tagline:'शिका · खेळा · जिंका!', chooseAvatar:'तुमचा अवतार निवडा', streak:'स्ट्रीक',
    badges:'बॅज', enterName:'तुमचे नाव लिहा...', startQuiz:'क्विझ सुरू करा', back:'मागे',
    selectClass:'इयत्ता निवडा', chooseMode:'गेम मोड निवडा', freePlay:'फ्री प्ले',
    freePlayDesc:'स्वतःच्या गतीने उत्तर द्या!', timerMode:'टाइमर मोड',
    timerModeDesc:'३० सेकंद प्रति प्रश्न!', levelMode:'लेव्हल मोड',
    levelModeDesc:'लेव्हल १-१० मध्ये खेळा!', challengeMode:'चॅलेंज',
    challengeModeDesc:'फक्त ३ ❤️ जीव!', selectLevel:'लेव्हल निवडा:',
    hint:'इशारा', next:'पुढे', correct:'बरोबर', wrong:'चुकीचे', totalXP:'एकूण XP',
    playAgain:'पुन्हा खेळा', home:'होम', leaderboard:'लीडरबोर्ड', myBadges:'माझे बॅज',
    dashboard:'डॅशबोर्ड', dailyChallenge:'दैनिक आव्हान', gameOver:'गेम ओव्हर!',
    outOfLives:'तुमचे सर्व जीव संपले!', tryAgain:'पुन्हा प्रयत्न करा',
  }
};

let currentLang = 'en';

// ===== STATE =====
let state = {
  player: {name:'', avatar:'🧒', xp:0, highScore:0, streak:0, maxStreak:0,
           totalGames:0, totalCorrect:0, totalWrong:0, hasPerfect:false,
           challengeSurvivor:false, dailyCompleted:0, langsUsed:1, earnedBadges:[],
           history:[], dailyDate:'', dailyXP:0},
  selectedClass:1, selectedSubject:null, gameMode:'free', selectedLevel:1,
  questions:[], currentQ:0,
  sessionCorrect:0, sessionWrong:0, sessionXP:0,
  currentStreak:0, lives:3, maxLives:3,
  timerInterval:null, timerSecs:30, answered:false,
  hintUsed:false,
};

// ===== AUDIO =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function getAudio() { if(!audioCtx) audioCtx=new AudioCtx(); return audioCtx; }

function playBeep(type) {
  try {
    const ctx = getAudio();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(type==='correct'){
      o.frequency.setValueAtTime(523,ctx.currentTime);
      o.frequency.setValueAtTime(659,ctx.currentTime+.1);
      o.frequency.setValueAtTime(784,ctx.currentTime+.2);
      g.gain.setValueAtTime(.3,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.55);
      o.start(ctx.currentTime); o.stop(ctx.currentTime+.55);
    } else if(type==='wrong'){
      o.frequency.setValueAtTime(300,ctx.currentTime);
      o.frequency.setValueAtTime(200,ctx.currentTime+.15);
      g.gain.setValueAtTime(.25,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.35);
      o.start(ctx.currentTime); o.stop(ctx.currentTime+.35);
    } else if(type==='badge'){
      [523,659,784,1047].forEach((f,i)=>{
        const o2=ctx.createOscillator(),g2=ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value=f; g2.gain.setValueAtTime(.2,ctx.currentTime+i*.1);
        g2.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.1+.2);
        o2.start(ctx.currentTime+i*.1); o2.stop(ctx.currentTime+i*.1+.2);
      });
    }
  } catch(e){}
}

// ===== STORAGE =====
function loadStorage() {
  try {
    // 🔐 Use secure storage with tamper detection
    const s = window.loadSecureStorage ? window.loadSecureStorage() : JSON.parse(localStorage.getItem('qs_player_v2')||'{}');
    if(s) Object.assign(state.player, s);
  } catch(e){}
}
function saveStorage() {
  try {
    // 🔐 Use secure storage with checksum
    if(window.saveSecureStorage) window.saveSecureStorage(state.player);
    else localStorage.setItem('qs_player_v2', JSON.stringify(state.player));
  } catch(e){}
}
function getLeaderboard() {
  try { return JSON.parse(localStorage.getItem('qs_lb_v2')||'[]'); } catch(e){ return []; }
}
function saveLeaderboard() {
  let lb = getLeaderboard();
  const idx = lb.findIndex(e=>e.name===state.player.name);
  const entry = {name:state.player.name, avatar:state.player.avatar, xp:state.player.xp, streak:state.player.maxStreak};
  if(idx>=0){ if(state.player.xp>=lb[idx].xp) lb[idx]=entry; }
  else lb.push(entry);
  lb.sort((a,b)=>b.xp-a.xp);
  localStorage.setItem('qs_lb_v2', JSON.stringify(lb.slice(0,10)));
}

// ===== I18N =====
function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('qs_lang', lang);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active', b.dataset.lang===lang));
  applyI18n();
  // Track languages used
  const key = 'qs_langs_used';
  let used = JSON.parse(localStorage.getItem(key)||'[]');
  if(!used.includes(lang)) used.push(lang);
  localStorage.setItem(key, JSON.stringify(used));
  state.player.langsUsed = used.length;
  saveStorage();
}
function applyI18n() {
  const t = I18N[currentLang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.dataset.i18n;
    if(t[k]) el.textContent = t[k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const k = el.dataset.i18nPh;
    if(t[k]) el.placeholder = t[k];
  });
}
function t(key) { return (I18N[currentLang]||I18N.en)[key] || key; }

// ===== SCREENS =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0,0);
  if(id==='screen-leaderboard') renderLeaderboard();
  if(id==='screen-home') refreshHomeStats();
}

// ===== DATETIME =====
function updateDatetime() {
  const el = document.getElementById('datetime');
  if(!el) return;
  const n=new Date();
  const d=n.toLocaleDateString('en-IN',{weekday:'short',year:'numeric',month:'short',day:'numeric'});
  const time=n.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  el.textContent=`📅 ${d}  🕐 ${time}`;
}

// ===== CANVAS BG =====
function initCanvas() {
  const canvas=document.getElementById('bg-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  let W,H,pts=[];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize(); window.addEventListener('resize',resize);
  const EMOJIS=['⚡','⭐','✨','🌟','💫','🎯','📚','🔢','🔬','🚀','🏅','🎮'];
  const COLS=['rgba(108,99,255,','rgba(255,101,132,','rgba(247,151,30,','rgba(67,233,123,','rgba(6,182,212,'];
  for(let i=0;i<32;i++) pts.push({x:Math.random()*1200,y:Math.random()*900,r:3+Math.random()*5,dx:(Math.random()-.5)*.55,dy:-.3-Math.random()*.4,op:.08+Math.random()*.2,col:COLS[Math.floor(Math.random()*COLS.length)],emoji:Math.random()>.65?EMOJIS[Math.floor(Math.random()*EMOJIS.length)]:null,sz:13+Math.random()*9});
  function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.dx; p.y+=p.dy;
      if(p.y<-30){p.y=H+10;p.x=Math.random()*W;}
      if(p.x<-30)p.x=W+10; if(p.x>W+30)p.x=-10;
      if(p.emoji){ctx.globalAlpha=p.op;ctx.font=`${p.sz}px serif`;ctx.fillText(p.emoji,p.x,p.y);}
      else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`${p.col}${p.op})`;ctx.fill();}
    });
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== THEME =====
function syncThemeBtn(){
  const dark=document.body.classList.contains('dark');
  const btn=document.getElementById('global-theme-btn');
  if(btn) btn.textContent=dark?'☀️':'🌙';
}
function toggleTheme(){
  document.body.classList.toggle('dark');
  localStorage.setItem('qs_theme',document.body.classList.contains('dark')?'dark':'light');
  syncThemeBtn();
}
function loadTheme(){
  if(localStorage.getItem('qs_theme')==='dark') document.body.classList.add('dark');
  syncThemeBtn();
}

// ===== AVATAR =====
function renderAvatarGrid(){
  const grid=document.getElementById('avatar-grid');
  grid.innerHTML='';
  AVATARS.forEach((av,i)=>{
    const el=document.createElement('div');
    el.className='avatar-option'+(av===state.player.avatar?' selected':'');
    el.textContent=av; el.title=`Avatar ${i+1}`;
    el.onclick=()=>{
      document.querySelectorAll('.avatar-option').forEach(a=>a.classList.remove('selected'));
      el.classList.add('selected'); state.player.avatar=av;
      document.getElementById('selected-avatar-display').textContent=av;
    };
    grid.appendChild(el);
  });
}

// ===== HOME STATS =====
function refreshHomeStats(){
  document.getElementById('home-streak-val').textContent=state.player.maxStreak||0;
  document.getElementById('home-xp-val').textContent=state.player.xp||0;
  document.getElementById('home-badges-val').textContent=(state.player.earnedBadges||[]).length;
  applyI18n();
}

// ===== CLASS SELECT =====
function renderClassGrid(){
  const g=document.getElementById('class-grid'); g.innerHTML='';
  for(let c=1;c<=12;c++){
    const card=document.createElement('div'); card.className='class-card';
    card.innerHTML=`<div class="class-num">${c}</div><div class="class-label">Class ${c}</div>`;
    card.onclick=()=>selectClass(c); g.appendChild(card);
  }
}
function selectClass(cls){
  state.selectedClass=cls;
  document.getElementById('subject-screen-title').textContent=`Class ${cls} — ${t('selectClass')||'Select Subject'}`;
  renderSubjectGrid(); showScreen('screen-subject');
}

// ===== SUBJECT SELECT =====
function renderSubjectGrid(){
  const g=document.getElementById('subject-grid'); g.innerHTML='';
  SUBJECTS.forEach(subj=>{
    const card=document.createElement('div');
    card.className=`subject-card ${subj.cls}`;
    card.innerHTML=`<span class="subj-icon">${subj.icon}</span><span class="subj-name">${subj.name}</span>`;
    card.onclick=()=>{ state.selectedSubject=subj; document.getElementById('level-picker').classList.add('hidden'); showScreen('screen-mode'); };
    g.appendChild(card);
  });
}

// ===== MODE =====
function showLevelSelect(){
  const lp=document.getElementById('level-picker');
  lp.classList.toggle('hidden');
  const lg=document.getElementById('level-grid'); lg.innerHTML='';
  for(let l=1;l<=10;l++){
    const btn=document.createElement('button');
    btn.className='level-btn'; btn.textContent=`L${l}`;
    btn.onclick=()=>startGame('level',l); lg.appendChild(btn);
  }
}

// ===== START GAME =====
async function startGame(mode, level=1){
  state.gameMode=mode; state.selectedLevel=level;
  state.currentQ=0; state.sessionCorrect=0; state.sessionWrong=0; state.sessionXP=0;
  state.currentStreak=0; state.answered=false; state.hintUsed=false;
  clearInterval(state.timerInterval);
  // Challenge mode
  state.lives = (mode==='challenge') ? 3 : 999;
  state.maxLives = state.lives;

  const url=`data/class${state.selectedClass}/${state.selectedSubject.key}.json`;
  try {
    const resp=await fetch(url); let qs=await resp.json();
    if(mode==='level') qs=qs.filter(q=>q.level===level);
    if(!qs.length) qs=await (await fetch(url)).json();
    // 🔐 Encrypt answers before storing in memory
    state.questions=qs.sort(()=>Math.random()-.5).map(q=>({
      ...q,
      _enc: window.encryptAnswer ? window.encryptAnswer(q.answer) : null
    }));
  } catch(e) { alert('Questions load failed. Use a local server.'); return; }

  document.getElementById('quiz-class-label').textContent=`Class ${state.selectedClass}`;
  document.getElementById('quiz-subject-label').textContent=state.selectedSubject.name;
  document.getElementById('quiz-mode-label').textContent=
    mode==='free'?'🎮 Free': mode==='timer'?'⏱️ Timer': mode==='challenge'?'⚔️ Challenge':`🎯 L${level}`;

  updateQuizLiveStats();
  // 🔐 Security hooks
  if(window.startSessionTimer) window.startSessionTimer();
  if(window.setQuizActive) window.setQuizActive(true);
  if(window.resetTabCount) window.resetTabCount();
  showScreen('screen-quiz');
  renderQuestion();
}

// ===== RENDER QUESTION =====
function renderQuestion(){
  const q=state.questions[state.currentQ];
  if(!q){endGame();return;}
  state.answered=false; state.hintUsed=false;
  clearInterval(state.timerInterval);

  document.getElementById('progress-fill').style.width=
    ((state.currentQ/state.questions.length)*100)+'%';
  document.getElementById('q-number').textContent=
    `Q ${state.currentQ+1} / ${state.questions.length}`;
  document.getElementById('q-text').textContent=q.question;

  // Difficulty
  const diff=document.getElementById('q-difficulty');
  if(q.level){
    const stars=['','⭐','⭐⭐','⭐⭐⭐','🌟','🌟🌟','🌟🌟🌟','💫','💫💫','💫💫💫','🔥'];
    diff.textContent=stars[Math.min(q.level,10)]||'';
  }

  document.getElementById('feedback-msg').textContent='';
  document.getElementById('btn-next').classList.add('hidden');
  document.getElementById('btn-hint').disabled=false;
  document.getElementById('hint-text').classList.add('hidden');

  // Options
  const grid=document.getElementById('options-grid'); grid.innerHTML='';
  const opts=[q.option1,q.option2,q.option3,q.option4];
  const letters=['A','B','C','D'];
  opts.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='option-btn';
    btn.innerHTML=`<span class="opt-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick=()=>handleAnswer(btn,opt,q.answer);
    grid.appendChild(btn);
  });

  // Timer
  const tb=document.getElementById('timer-bar');
  if(state.gameMode==='timer'){
    tb.style.display='block'; state.timerSecs=30;
    document.getElementById('timer-text').textContent=30;
    const fill=document.getElementById('timer-fill');
    fill.style.transition='none'; fill.style.width='100%';
    setTimeout(()=>fill.style.transition='width 1s linear',50);
    state.timerInterval=setInterval(()=>{
      state.timerSecs--;
      document.getElementById('timer-fill').style.width=(state.timerSecs/30*100)+'%';
      document.getElementById('timer-text').textContent=state.timerSecs;
      if(state.timerSecs<=0){clearInterval(state.timerInterval);if(!state.answered)timeUp();}
    },1000);
  } else tb.style.display='none';
}

// ===== HANDLE ANSWER =====
function handleAnswer(btn, chosen, correct){
  if(state.answered) return;
  state.answered=true;
  clearInterval(state.timerInterval);

  // 🔐 Check against encrypted answer if available
  const isCorrect = (q._enc && window.checkAnswer)
    ? window.checkAnswer(chosen, q._enc)
    : chosen === correct;
  document.querySelectorAll('.option-btn').forEach(b=>{
    b.disabled=true;
    if(b.querySelector('span:last-child').textContent===correct) b.classList.add('correct');
  });

  const fb=document.getElementById('feedback-msg');
  if(isCorrect){
    btn.classList.add('correct');
    state.sessionCorrect++; state.currentStreak++; state.player.streak++;
    if(state.currentStreak>state.player.maxStreak) state.player.maxStreak=state.currentStreak;
    state.sessionXP+=10; state.player.xp+=10;
    fb.textContent=`✅ ${t('correct')}! +10 XP 🔥${state.currentStreak}`;
    fb.style.color='#22c55e';
    playBeep('correct'); showXPToast(`+10 XP ⚡`);
  } else {
    btn.classList.add('wrong');
    state.sessionWrong++; state.currentStreak=0;
    state.player.streak=0;
    state.sessionXP-=5; state.player.xp=Math.max(0,state.player.xp-5);
    // Challenge mode: lose a life
    if(state.gameMode==='challenge'){
      state.lives=Math.max(0,state.lives-1);
    }
    fb.textContent=`❌ ${t('wrong')}! -5 XP. ✅ ${correct}`;
    fb.style.color='#ef4444';
    playBeep('wrong'); showXPToast(`-5 XP 💔`);
    // Game over check
    if(state.gameMode==='challenge' && state.lives<=0){
      updateQuizLiveStats(); saveStorage();
      setTimeout(()=>showGameOver(),700); return;
    }
  }
  updateQuizLiveStats();
  saveStorage();
  document.getElementById('btn-next').classList.remove('hidden');
}

function timeUp(){
  if(state.answered) return;
  state.answered=true;
  state.currentStreak=0; state.player.streak=0;
  const correct=state.questions[state.currentQ].answer;
  document.querySelectorAll('.option-btn').forEach(b=>{
    b.disabled=true;
    if(b.querySelector('span:last-child').textContent===correct) b.classList.add('correct');
  });
  document.getElementById('feedback-msg').textContent=`⏰ Time's up! ✅ ${correct}`;
  document.getElementById('feedback-msg').style.color='#f7971e';
  state.sessionWrong++;
  if(state.gameMode==='challenge'){
    state.lives=Math.max(0,state.lives-1);
    updateQuizLiveStats();
    if(state.lives<=0){setTimeout(()=>showGameOver(),700);return;}
  }
  document.getElementById('btn-next').classList.remove('hidden');
}

// ===== HINT =====
function useHint(){
  if(state.hintUsed) return;
  state.hintUsed=true;
  document.getElementById('btn-hint').disabled=true;
  const q=state.questions[state.currentQ];
  // Eliminate one wrong answer
  const opts=document.querySelectorAll('.option-btn');
  let eliminated=false;
  opts.forEach(btn=>{
    if(!eliminated){
      const txt=btn.querySelector('span:last-child').textContent;
      if(txt!==q.answer){
        btn.style.opacity='.35';
        btn.disabled=true;
        eliminated=true;
      }
    }
  });
  const ht=document.getElementById('hint-text');
  ht.classList.remove('hidden');
  ht.textContent=`💡 Hint: One wrong answer eliminated! (-3 XP)`;
  state.player.xp=Math.max(0,state.player.xp-3);
  state.sessionXP-=3;
  updateQuizLiveStats(); saveStorage();
}

// ===== QUIZ LIVE STATS =====
function updateQuizLiveStats(){
  document.getElementById('xp-value').textContent=state.player.xp;
  document.getElementById('streak-pill').textContent=`🔥 ${state.currentStreak}`;
  // Lives hearts
  if(state.gameMode==='challenge'){
    const lr=document.getElementById('lives-row');
    lr.style.display='block';
    let h=''; for(let i=0;i<state.maxLives;i++) h+=(i<state.lives)?'❤️':'🖤';
    lr.textContent=h;
  } else {
    document.getElementById('lives-row').style.display='none';
  }
}

function nextQuestion(){
  state.currentQ++;
  if(state.currentQ>=state.questions.length) endGame();
  else renderQuestion();
}

// ===== GAME OVER (Challenge) =====
function showGameOver(){
  document.getElementById('go-correct').textContent=state.sessionCorrect;
  document.getElementById('go-xp').textContent=state.player.xp;
  document.getElementById('go-streak').textContent=state.player.maxStreak;
  document.getElementById('modal-gameover').classList.remove('hidden');
}
function retryGame(){ closeModal('modal-gameover'); startGame(state.gameMode,state.selectedLevel); }

// ===== END GAME =====
function endGame(){
  clearInterval(state.timerInterval);
  // 🔐 Security: stop quiz tracking
  if(window.stopSessionTimer) window.stopSessionTimer();
  if(window.setQuizActive) window.setQuizActive(false);
  // Check perfect score
  if(state.sessionCorrect===state.questions.length && state.questions.length>0) state.player.hasPerfect=true;
  // Challenge survivor
  if(state.gameMode==='challenge' && state.lives>=2) state.player.challengeSurvivor=true;

  state.player.totalGames++;
  state.player.totalCorrect+=state.sessionCorrect;
  state.player.totalWrong+=state.sessionWrong;
  if(state.player.xp>state.player.highScore) state.player.highScore=state.player.xp;

  // Save history
  if(!state.player.history) state.player.history=[];
  state.player.history.unshift({
    date:new Date().toLocaleDateString('en-IN'),
    class:state.selectedClass,
    subject:state.selectedSubject.name,
    correct:state.sessionCorrect,
    total:state.questions.length,
    xp:state.sessionXP
  });
  state.player.history=state.player.history.slice(0,20);

  saveStorage();
  saveLeaderboard();

  // Badge check
  const newBadge=checkBadges();

  const total=state.questions.length;
  const pct=total>0?(state.sessionCorrect/total)*100:0;
  const grade=GRADES.find(g=>pct>=g.min)||GRADES[GRADES.length-1];

  document.getElementById('results-avatar').textContent=state.player.avatar;
  document.getElementById('results-name').textContent=state.player.name||'Player';
  document.getElementById('results-grade').textContent=grade.label;
  document.getElementById('res-correct').textContent=state.sessionCorrect;
  document.getElementById('res-wrong').textContent=state.sessionWrong;
  document.getElementById('res-xp').textContent=(state.sessionXP>=0?'+':'')+state.sessionXP;
  document.getElementById('res-total-xp').textContent=state.player.xp;

  // Streak result
  const sr=document.getElementById('streak-result-row');
  if(state.currentStreak>=3){
    sr.classList.remove('hidden');
    sr.textContent=`🔥 ${state.currentStreak} Streak! Amazing!`;
  } else sr.classList.add('hidden');

  // New badge
  const nbe=document.getElementById('new-badge-earned');
  if(newBadge){ nbe.classList.remove('hidden'); document.getElementById('nbe-icon').textContent=newBadge.icon; document.getElementById('nbe-name').textContent=newBadge.name; }
  else nbe.classList.add('hidden');

  showScreen('screen-results');

  // Confetti on good score
  if(pct>=70) launchConfetti();
}

function playAgain(){ startGame(state.gameMode,state.selectedLevel); }

// ===== BADGES =====
function checkBadges(){
  if(!state.player.earnedBadges) state.player.earnedBadges=[];
  let newBadge=null;
  ALL_BADGES.forEach(b=>{
    if(!state.player.earnedBadges.includes(b.id) && b.check(state.player)){
      state.player.earnedBadges.push(b.id);
      newBadge=b;
      playBeep('badge');
      // Show badge modal after short delay
      setTimeout(()=>{
        document.getElementById('modal-badge-icon').textContent=b.icon;
        document.getElementById('modal-badge-name').textContent=b.name;
        document.getElementById('modal-badge-desc').textContent=b.desc;
        document.getElementById('modal-badge').classList.remove('hidden');
      },1500);
    }
  });
  saveStorage();
  return newBadge;
}

function showBadges(){
  const earn=state.player.earnedBadges||[];
  document.getElementById('badges-summary').innerHTML=
    `<p>🏅 <strong>${earn.length}</strong> / ${ALL_BADGES.length} Badges Earned</p>`;
  const grid=document.getElementById('badges-grid'); grid.innerHTML='';
  ALL_BADGES.forEach(b=>{
    const isEarned=earn.includes(b.id);
    const card=document.createElement('div');
    card.className='badge-card '+(isEarned?'earned':'locked');
    card.innerHTML=`<span class="badge-icon">${b.icon}</span><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div>`;
    grid.appendChild(card);
  });
  showScreen('screen-badges');
}

// ===== DASHBOARD =====
function showDashboard(){
  const p=state.player;
  const acc=p.totalCorrect+p.totalWrong>0?Math.round(p.totalCorrect/(p.totalCorrect+p.totalWrong)*100):0;
  const hist=p.history||[];

  const subjStats={};
  hist.forEach(h=>{ if(!subjStats[h.subject]) subjStats[h.subject]={correct:0,total:0}; subjStats[h.subject].correct+=h.correct; subjStats[h.subject].total+=h.total; });

  const wrap=document.getElementById('dashboard-wrap');
  wrap.innerHTML=`
    <div class="dash-card">
      <h3>📊 Overall Stats</h3>
      <div class="dash-stat-row">
        <div class="dash-stat"><span class="dsv">${p.xp}</span><span class="dsl">Total XP</span></div>
        <div class="dash-stat"><span class="dsv">${p.totalGames}</span><span class="dsl">Games</span></div>
        <div class="dash-stat"><span class="dsv">${acc}%</span><span class="dsl">Accuracy</span></div>
        <div class="dash-stat"><span class="dsv">${p.maxStreak}</span><span class="dsl">Best Streak</span></div>
        <div class="dash-stat"><span class="dsv">${p.highScore}</span><span class="dsl">High Score</span></div>
        <div class="dash-stat"><span class="dsv">${(p.earnedBadges||[]).length}</span><span class="dsl">Badges</span></div>
      </div>
    </div>
    <div class="dash-card">
      <h3>🎯 Subject Performance</h3>
      ${Object.keys(subjStats).length?Object.entries(subjStats).map(([subj,data])=>{
        const pct=data.total>0?Math.round(data.correct/data.total*100):0;
        return `<div class="dash-bar-row">
          <span class="dash-bar-label">${subj}</span>
          <div class="dash-bar-bg"><div class="dash-bar-fill" style="width:${pct}%"></div></div>
          <span class="dash-bar-val">${pct}%</span>
        </div>`;
      }).join(''):'<p style="color:var(--text2);font-size:.85rem;">Play more quizzes to see stats!</p>'}
    </div>
    <div class="dash-card">
      <h3>📜 Recent History</h3>
      ${hist.length?`<ul class="dash-history">${hist.slice(0,10).map(h=>`<li><span>${h.date} · Class ${h.class} · ${h.subject}</span><span>${h.correct}/${h.total} (${h.xp>=0?'+':''}${h.xp} XP)</span></li>`).join('')}</ul>`:'<p style="color:var(--text2);font-size:.85rem;">No history yet!</p>'}
    </div>
  `;
  showScreen('screen-dashboard');
}

// ===== DAILY CHALLENGE =====
function openDailyChallenge(){
  const today=new Date().toDateString();
  const wrap=document.getElementById('daily-wrap');
  if(state.player.dailyDate===today){
    wrap.innerHTML=`<div class="daily-done-card">
      <span style="font-size:3rem;display:block;margin-bottom:10px">✅</span>
      <h3>Already Completed!</h3>
      <p>You've done today's challenge.<br>Come back tomorrow!</p>
      <p style="margin-top:12px;color:var(--accent);font-weight:800;">+${state.player.dailyXP||50} XP earned today 🎉</p>
    </div>`;
    showScreen('screen-daily'); return;
  }
  // Pick random class/subject for today
  const seed=new Date().getDate()+new Date().getMonth()*31;
  const cls=(seed%12)+1;
  const subj=SUBJECTS[seed%SUBJECTS.length];
  wrap.innerHTML=`<div class="daily-card">
    <span class="daily-icon">🗓️</span>
    <h3>Today's Challenge</h3>
    <p>Class <strong>${cls}</strong> · <strong>${subj.name}</strong></p>
    <p>Complete 5 questions and earn bonus XP!</p>
    <div class="daily-reward">🎁 Bonus: +50 XP</div><br>
    <button class="btn-action" onclick="startDailyChallenge(${cls},'${subj.key}','${subj.name}','${subj.cls}')">⚔️ Start Challenge</button>
  </div>`;
  showScreen('screen-daily');
}
async function startDailyChallenge(cls,subjKey,subjName,subjCls){
  state.selectedClass=cls;
  state.selectedSubject={key:subjKey,name:subjName,cls:subjCls};
  await startGame('free');
  // Mark daily after game — hook into endGame via flag
  state._isDailyChallenge=true;
}

// ===== LEADERBOARD =====
function renderLeaderboard(){
  const el=document.getElementById('leaderboard-list');
  const lb=getLeaderboard();
  if(!lb.length){ el.innerHTML=`<div class="lb-empty"><span>🏆</span>No scores yet!<br>Play a quiz to appear here.</div>`; return; }
  const medals=['🥇','🥈','🥉'];
  el.innerHTML=lb.map((p,i)=>`
    <div class="lb-row ${i<3?'top'+(i+1):''}">
      <span class="lb-rank">${medals[i]||i+1}</span>
      <span class="lb-avatar">${p.avatar||'🧒'}</span>
      <span class="lb-name">${escHtml(p.name)}</span>
      <span class="lb-streak">🔥${p.streak||0}</span>
      <span class="lb-xp">⚡ ${p.xp} XP</span>
    </div>
  `).join('');
}

// ===== CONFETTI =====
function launchConfetti(){
  const c=document.getElementById('confetti-layer');
  c.innerHTML='';
  const colors=['#6c63ff','#ff6584','#f7971e','#43e97b','#06b6d4','#f59e0b'];
  for(let i=0;i<60;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    p.style.cssText=`left:${Math.random()*100}%;background:${colors[Math.floor(Math.random()*colors.length)]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'3px'};animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*.8}s;`;
    c.appendChild(p);
  }
  setTimeout(()=>c.innerHTML='',4000);
}

// ===== HELPERS =====
function escHtml(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
function showXPToast(msg){ const t=document.createElement('div'); t.className='xp-toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2100); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

// ===== GO TO CLASS SELECT =====
function goToClassSelect(){
  const name=document.getElementById('player-name').value.trim();
  if(!name){
    const inp=document.getElementById('player-name');
    inp.focus(); inp.style.borderColor='#ef4444'; inp.style.boxShadow='0 0 0 4px rgba(239,68,68,.15)';
    setTimeout(()=>{ inp.style.borderColor=''; inp.style.boxShadow=''; },1500);
    return;
  }
  state.player.name=name; saveStorage();
  const bar=document.getElementById('class-player-bar');
  bar.innerHTML=`${state.player.avatar} <strong>${escHtml(name)}</strong> &nbsp;|&nbsp; ⚡ ${state.player.xp} XP &nbsp;|&nbsp; 🔥 ${state.player.maxStreak} best streak`;
  renderClassGrid(); showScreen('screen-class');
}

// ===== INIT =====
function init(){
  loadStorage(); loadTheme();
  const savedLang=localStorage.getItem('qs_lang')||'en';
  currentLang=savedLang;
  const lused=JSON.parse(localStorage.getItem('qs_langs_used')||'["en"]');
  state.player.langsUsed=lused.length;

  initCanvas(); renderAvatarGrid();
  if(state.player.name) document.getElementById('player-name').value=state.player.name;
  document.getElementById('selected-avatar-display').textContent=state.player.avatar;

  setTimeout(()=>{
    document.querySelectorAll('.avatar-option').forEach(el=>{
      if(el.textContent===state.player.avatar) el.classList.add('selected');
    });
    document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===savedLang));
  },50);

  refreshHomeStats();
  updateDatetime(); setInterval(updateDatetime,1000);
// ===== SAFE HOME NAVIGATION =====
function goHomeFromModal(modalId) {
  if(modalId) closeModal(modalId);
  document.querySelectorAll(".modal-overlay").forEach(m => m.classList.add("hidden"));
  showScreen("screen-home");
}

  applyI18n();
  showScreen('screen-home');
}

document.addEventListener('DOMContentLoaded',init);
