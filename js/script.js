'use strict';

/* ═══════════════════════════════════════════════════════════
   BRAINSTORM QUIZ — script.js
   Features: Progression System, Avatar, Progress Save, Sounds
   ═══════════════════════════════════════════════════════════ */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const LEVEL_QUESTIONS = [0, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]; // index = level
const TOTAL_LEVELS    = 10;
const STORAGE_KEY     = 'brainstorm_progress';
const LB_KEY          = 'brainstorm_lb';
const XP_CORRECT      = 10;
const XP_BONUS_FAST   = 5;

const LEVEL_TITLES = ['', 'Rookie Start', 'Rising Star', 'Brain Spark', 'Mind Surge',
  'Knowledge Quest', 'Sharp Thinker', 'Genius Mode', 'Expert Zone', 'Master Class', 'Legend Peak'];

const LEVEL_ICONS = ['', '🌱', '📚', '⚡', '🔥', '🎯', '💡', '🧠', '🏆', '👑', '🌟'];

const AVATARS = [
  { id: 'av1',  emoji: '🧒', label: 'Kid'       },
  { id: 'av2',  emoji: '👦', label: 'Boy'       },
  { id: 'av3',  emoji: '👧', label: 'Girl'      },
  { id: 'av4',  emoji: '🧑', label: 'Teen'      },
  { id: 'av5',  emoji: '👩', label: 'Lady'      },
  { id: 'av6',  emoji: '👨', label: 'Man'       },
  { id: 'av7',  emoji: '🧓', label: 'Elder'     },
  { id: 'av8',  emoji: '🦸', label: 'Hero'      },
  { id: 'av9',  emoji: '🧙', label: 'Wizard'    },
  { id: 'av10', emoji: '🦊', label: 'Fox'       },
  { id: 'av11', emoji: '🐼', label: 'Panda'     },
  { id: 'av12', emoji: '🦁', label: 'Lion'      },
  { id: 'av13', emoji: '🐯', label: 'Tiger'     },
  { id: 'av14', emoji: '🐸', label: 'Frog'      },
  { id: 'av15', emoji: '🤖', label: 'Robot'     },
  { id: 'av16', emoji: '👾', label: 'Alien'     },
  { id: 'av17', emoji: '🧑‍🚀', label: 'Astronaut' },
  { id: 'av18', emoji: '🧑‍🎓', label: 'Scholar'  },
  { id: 'av19', emoji: '🥷',  label: 'Ninja'    },
  { id: 'av20', emoji: '🦄', label: 'Unicorn'   },
];

const SUBJECTS_ALL = [
  { name: 'English',       file: 'english',       icon: '📖' },
  { name: 'Hindi',         file: 'hindi',         icon: '🇮🇳' },
  { name: 'Math',          file: 'math',          icon: '🔢' },
  { name: 'Science',       file: 'science',       icon: '🔬' },
  { name: 'Computer',      file: 'computer',      icon: '💻' },
  { name: 'EVS',           file: 'evs',           icon: '🌿' },
  { name: 'GK',            file: 'gk',            icon: '🌍' },
  { name: 'Economics',     file: 'economics',     icon: '📊' },
  { name: 'Space',         file: 'space',         icon: '🚀' },
  { name: 'Animals/Birds', file: 'animals-birds', icon: '🦁' },
];

const XP_LEVELS = [
  { level:1, name:'Beginner', minXP:0   },
  { level:2, name:'Explorer', minXP:50  },
  { level:3, name:'Scholar',  minXP:120 },
  { level:4, name:'Expert',   minXP:220 },
  { level:5, name:'Master',   minXP:350 },
  { level:6, name:'Champion', minXP:500 },
  { level:7, name:'Legend',   minXP:700 },
];

// ── DOM HELPER ────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── STATE ─────────────────────────────────────────────────────────────────────
let state = {
  // session
  playerName:     '',
  avatar:         '🧒',
  avatarId:       'av1',
  // game level / progression
  gameLevel:      1,        // current progression level (1–10)
  selectedClass:  null,
  selectedSubject: null,
  // quiz session
  questions:      [],
  currentIdx:     0,
  sessionScore:   0,
  sessionXP:      0,
  sessionCorrect: 0,
  answered:       false,
  timerInterval:  null,
  timeLeft:       20,
  mode:           'free',   // 'free' | 'timer'
  quizMode:       'level',  // 'free' | 'timer' | 'level'  (chosen in mode screen)
};

// ── PROGRESS (persisted) ──────────────────────────────────────────────────────
let progress = {
  name:            '',
  avatar:          '🧒',
  avatarId:        'av1',
  currentLevel:    1,
  score:           0,
  completedLevels: [],
  correctAnswers:  0,
  totalQuestions:  0,
  totalXP:         0,
  lastPlayed:      '',
};

// ── SOUND SYSTEM ──────────────────────────────────────────────────────────────
const SFX = {
  correct: new Audio('assets/sounds/correct.mp3'),
  wrong:   new Audio('assets/sounds/wrong.mp3'),
  levelup: new Audio('assets/sounds/levelup.mp3'),
};
Object.values(SFX).forEach(a => { a.preload = 'auto'; a.volume = 0.7; });

function playSound(name) {
  try {
    const s = SFX[name];
    if (!s) return;
    s.currentTime = 0;
    s.play().catch(() => {}); // silently ignore autoplay restrictions
  } catch(e) {}
}

// ── LIVE CLOCK ────────────────────────────────────────────────────────────────
function startClock() {
  const el = $('live-datetime');
  function tick() {
    const now = new Date();
    const d = now.toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
    const t = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    el.textContent = `${d}  ${t}`;
  }
  tick();
  setInterval(tick, 1000);
}

// ── PROGRESS: SAVE / LOAD / RESET ────────────────────────────────────────────
function saveProgress() {
  progress.lastPlayed = new Date().toLocaleDateString('en-IN');
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { progress = { ...progress, ...JSON.parse(raw) }; return true; }
  } catch(e) {}
  return false;
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  progress = { name:'', avatar:'🧒', avatarId:'av1', currentLevel:1, score:0,
    completedLevels:[], correctAnswers:0, totalQuestions:0, totalXP:0, lastPlayed:'' };
}

function isLevelUnlocked(lvl) {
  if (lvl === 1) return true;
  return progress.completedLevels.includes(lvl - 1);
}

function isLevelCompleted(lvl) {
  return progress.completedLevels.includes(lvl);
}

// ── SCREEN NAVIGATION ─────────────────────────────────────────────────────────
const SCREENS = ['home','avatar','levelmap','class','subject','mode','quiz','levelup','result','leaderboard','profile'];
const BACK_MAP = {
  avatar:      () => showScreen('home'),
  levelmap:    () => showScreen('home'),
  class:       () => showScreen('levelmap'),
  subject:     () => { showScreen('class'); renderClasses(); },
  mode:        () => { showScreen('subject'); renderSubjects(); },
  quiz:        () => { clearTimer(); showScreen('levelmap'); },
  levelup:     () => showScreen('levelmap'),
  result:      () => showScreen('levelmap'),
  leaderboard: () => showScreen('home'),
  profile:     () => showScreen('home'),
};

function showScreen(name) {
  SCREENS.forEach(s => {
    const el = $('screen-' + s);
    if (el) el.classList.remove('active');
  });
  const target = $('screen-' + name);
  if (target) target.classList.add('active');
  // back button
  const backBtn = $('back-btn');
  if (BACK_MAP[name]) {
    backBtn.classList.add('visible');
    backBtn.onclick = () => BACK_MAP[name]();
  } else {
    backBtn.classList.remove('visible');
  }
  window.scrollTo(0, 0);
}

// ── ANIMATED BACKGROUND ───────────────────────────────────────────────────────
(function initBg() {
  const canvas = $('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  const COLS = ['#FFD700','#FF6B9D','#00E5FF','#B388FF','#00E676','#FF6B35'];

  class P {
    constructor(init) {
      this.x     = Math.random() * (W||400);
      this.y     = init ? Math.random() * (H||700) : (H||700) + 20;
      this.r     = Math.random() * 2.5 + 1;
      this.color = COLS[Math.floor(Math.random() * COLS.length)];
      this.speed = Math.random() * 0.5 + 0.2;
      this.drift = (Math.random() - 0.5) * 0.35;
      this.alpha = Math.random() * 0.45 + 0.15;
      this.pulse = Math.random() * Math.PI * 2;
    }
    tick() {
      this.y    -= this.speed; this.x += this.drift;
      this.pulse += 0.02;
      this.alpha = 0.15 + Math.sin(this.pulse) * 0.13;
      if (this.y < -20) { Object.assign(this, new P(false)); }
    }
    draw() {
      ctx.save(); ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = Array.from({ length: 70 }, () => new P(true));
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    g.addColorStop(0,'rgba(18,8,44,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    particles.forEach(p => { p.tick(); p.draw(); });
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', resize); resize(); loop();
})();

// ── TOP BAR BUTTONS ───────────────────────────────────────────────────────────
$('btn-top-leaderboard').onclick = () => { renderLeaderboard(); showScreen('leaderboard'); };
$('btn-top-profile').onclick     = () => { renderProfile();     showScreen('profile'); };

// ════════════════════════════════════════════════════════════
//  SCREEN: HOME
// ════════════════════════════════════════════════════════════
function renderHome() {
  const hasSave = progress.name && progress.name.length > 0;
  const resumeCard = $('resume-card');
  if (hasSave) {
    resumeCard.style.display = 'block';
    $('resume-avatar').textContent = progress.avatar || '🧒';
    $('resume-name').textContent   = progress.name;
    $('resume-info').textContent   = `Level ${progress.currentLevel} • Score ${progress.score}`;
    $('resume-time').textContent   = `Last played: ${progress.lastPlayed || '—'}`;
  } else {
    resumeCard.style.display = 'none';
  }
}

$('btn-start').onclick = () => {
  const name = $('input-name').value.trim();
  if (!name) { showToast('Please enter your name! 😊', 'wrong-toast'); return; }
  // Start fresh
  resetProgress();
  progress.name = name;
  state.playerName = name;
  saveProgress();
  renderAvatars();
  showScreen('avatar');
};

$('input-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-start').onclick(); });

$('btn-resume').onclick = () => {
  state.playerName = progress.name;
  state.avatar     = progress.avatar;
  state.avatarId   = progress.avatarId;
  state.gameLevel  = progress.currentLevel;
  renderLevelMap();
  showScreen('levelmap');
};

$('btn-reset').onclick = () => {
  if (confirm('Reset all progress? This cannot be undone.')) {
    resetProgress();
    renderHome();
    showToast('Progress reset ✓', '');
  }
};

// ════════════════════════════════════════════════════════════
//  SCREEN: AVATAR
// ════════════════════════════════════════════════════════════
let selectedAvatarId = null;

function renderAvatars() {
  const grid = $('avatar-grid');
  grid.innerHTML = '';
  selectedAvatarId = null;
  $('btn-avatar-confirm').disabled = true;

  AVATARS.forEach(av => {
    const div = document.createElement('div');
    div.className = 'avatar-item';
    div.dataset.id = av.id;
    div.innerHTML = `<span>${av.emoji}</span><span class="av-label">${av.label}</span>`;
    div.onclick = () => {
      document.querySelectorAll('.avatar-item').forEach(d => d.classList.remove('selected'));
      div.classList.add('selected');
      selectedAvatarId = av.id;
      $('btn-avatar-confirm').disabled = false;
    };
    grid.appendChild(div);
  });
}

$('btn-avatar-confirm').onclick = () => {
  if (!selectedAvatarId) return;
  const av = AVATARS.find(a => a.id === selectedAvatarId);
  if (!av) return;
  state.avatar   = av.emoji;
  state.avatarId = av.id;
  progress.avatar   = av.emoji;
  progress.avatarId = av.id;
  saveProgress();
  renderLevelMap();
  showScreen('levelmap');
};

// ════════════════════════════════════════════════════════════
//  SCREEN: LEVEL MAP
// ════════════════════════════════════════════════════════════
function renderLevelMap() {
  // Header
  $('lm-avatar').textContent = progress.avatar || state.avatar || '🧒';
  $('lm-name').textContent   = progress.name   || state.playerName || 'Player';
  $('lm-stats').textContent  = `Score: ${progress.score} • ${progress.correctAnswers}/${progress.totalQuestions} Correct`;
  $('lm-total-xp').textContent = `${progress.totalXP || 0} XP`;

  // Overall progress bar
  const pct = Math.round((progress.completedLevels.length / TOTAL_LEVELS) * 100);
  $('lm-prog-fill').style.width = pct + '%';
  $('lm-prog-pct').textContent  = pct + '%';

  // Level cards
  const grid = $('level-grid');
  grid.innerHTML = '';

  for (let lvl = 1; lvl <= TOTAL_LEVELS; lvl++) {
    const completed = isLevelCompleted(lvl);
    const unlocked  = isLevelUnlocked(lvl);
    const isCurrent = progress.currentLevel === lvl && !completed;

    const card = document.createElement('div');
    let cls = 'level-card';
    if (completed)     cls += ' completed';
    else if (isCurrent) cls += ' current unlocked';
    else if (unlocked)  cls += ' unlocked';
    else                cls += ' locked';
    card.className = cls;

    let badgeHtml = '';
    if (completed)      badgeHtml = `<span class="lc-badge done">✅ Done</span>`;
    else if (isCurrent) badgeHtml = `<span class="lc-badge active">▶ Play</span>`;
    else if (unlocked)  badgeHtml = `<span class="lc-badge active">🔓 Open</span>`;
    else                badgeHtml = `<span class="lc-badge lk">🔒 Locked</span>`;

    card.innerHTML = `
      <div class="lc-top">
        <span class="lc-num">${lvl}</span>
        <span class="lc-icon">${LEVEL_ICONS[lvl]}</span>
      </div>
      <div class="lc-title">${LEVEL_TITLES[lvl]}</div>
      <div class="lc-qs">${LEVEL_QUESTIONS[lvl]} Questions</div>
      ${badgeHtml}`;

    if (unlocked || isCurrent) {
      card.onclick = () => startLevelFlow(lvl);
    }
    grid.appendChild(card);
  }
}

function startLevelFlow(lvl) {
  state.gameLevel = lvl;
  progress.currentLevel = lvl;
  $('class-level-num').textContent = lvl;
  renderClasses();
  showScreen('class');
}

// ════════════════════════════════════════════════════════════
//  SCREEN: CLASS SELECTION
// ════════════════════════════════════════════════════════════
function renderClasses() {
  const grid   = $('class-grid');
  grid.innerHTML = '';
  const icons  = ['🌱','📚','✏️','🎨','🔭','🧮','🔬','🌍','⚗️','📐','🧬','🎓'];
  const colors = ['color-1','color-2','color-3','color-4','color-5','color-6'];

  for (let i = 1; i <= 12; i++) {
    const div = document.createElement('div');
    div.className = `card-item ${colors[(i-1)%6]}`;
    div.innerHTML = `<span class="card-icon">${icons[i-1]}</span><span class="card-label">Class ${i}</span>`;
    div.onclick = () => {
      state.selectedClass = i;
      $('subject-class-label').textContent = i;
      renderSubjects();
      showScreen('subject');
    };
    grid.appendChild(div);
  }
}

// ════════════════════════════════════════════════════════════
//  SCREEN: SUBJECT SELECTION
// ════════════════════════════════════════════════════════════
function renderSubjects() {
  const grid = $('subject-grid');
  grid.innerHTML = '';
  const colors = ['color-1','color-2','color-3','color-4','color-5','color-6'];

  // Mix All
  const mixDiv = document.createElement('div');
  mixDiv.className = 'card-item mix-card color-1';
  mixDiv.innerHTML = `<span class="card-icon">🎲</span><span class="card-label">Mix All</span>`;
  mixDiv.onclick = () => { state.selectedSubject = 'Mix'; showModeScreen(); };
  grid.appendChild(mixDiv);

  SUBJECTS_ALL.forEach((subj, i) => {
    const div = document.createElement('div');
    div.className = `card-item ${colors[(i+1)%6]}`;
    div.innerHTML = `<span class="card-icon">${subj.icon}</span><span class="card-label">${subj.name}</span>`;
    div.onclick = () => { state.selectedSubject = subj.name; showModeScreen(); };
    grid.appendChild(div);
  });
}

// ════════════════════════════════════════════════════════════
//  SCREEN: MODE SELECTION
// ════════════════════════════════════════════════════════════
function showModeScreen() {
  // Reset selection highlight
  ['free','timer','level'].forEach(m => {
    const el = $('mode-card-' + m);
    if (el) el.classList.remove('selected');
  });
  showScreen('mode');

  $('mode-card-free').onclick = () => {
    state.quizMode = 'free';
    startQuiz();
  };
  $('mode-card-timer').onclick = () => {
    state.quizMode = 'timer';
    startQuiz();
  };
  $('mode-card-level').onclick = () => {
    state.quizMode = 'level';
    startQuiz();
  };
}

// ════════════════════════════════════════════════════════════
//  DATA LOADING
// ════════════════════════════════════════════════════════════
function subjectURL(classNum, file) {
  return `data/class${classNum}/${file}.json`;
}

async function fetchSubject(classNum, subj) {
  const res  = await fetch(subjectURL(classNum, subj.file));
  if (!res.ok) throw new Error(`404: ${subjectURL(classNum, subj.file)}`);
  const data = await res.json();
  return data.questions.map(q => ({ ...q, subject: subj.name }));
}

function showLoader(on, msg = 'Loading questions…') {
  let el = $('quiz-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'quiz-loader';
    el.style.cssText = 'position:fixed;inset:0;z-index:500;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,5,24,0.93);backdrop-filter:blur(10px);color:#f0e6ff;font-size:1.1rem;font-weight:800;gap:16px;';
    el.innerHTML = '<div style="font-size:2.5rem;animation:spin 1s linear infinite">🎲</div><div id="loader-msg">Loading…</div>';
    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style');
      s.id = 'spin-style';
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
  }
  el.style.display = on ? 'flex' : 'none';
  const m = document.getElementById('loader-msg');
  if (m) m.textContent = msg;
}

async function loadQuestions() {
  const needed   = LEVEL_QUESTIONS[state.gameLevel];  // how many questions for this level
  const classNum = state.selectedClass;

  try {
    let pool = [];

    if (state.selectedSubject === 'Mix') {
      showLoader(true, `Loading Mix for Level ${state.gameLevel}…`);
      const results = await Promise.all(
        SUBJECTS_ALL.map(s => fetchSubject(classNum, s).catch(() => []))
      );
      showLoader(false);
      results.forEach(arr => pool.push(...arr));
    } else {
      const subj = SUBJECTS_ALL.find(s => s.name === state.selectedSubject);
      if (!subj) return [];
      showLoader(true, `Loading ${subj.name} — Level ${state.gameLevel}…`);
      pool = await fetchSubject(classNum, subj);
      showLoader(false);
    }

    if (!pool.length) { showToast('No questions found!', 'wrong-toast'); return []; }

    // Shuffle pool, then take exactly `needed` questions
    pool = shuffle(pool);

    // If pool smaller than needed, repeat / loop questions to fill
    while (pool.length < needed) pool = [...pool, ...shuffle(pool)];
    return pool.slice(0, needed);

  } catch(e) {
    showLoader(false);
    showToast('Could not load questions!', 'wrong-toast');
    return [];
  }
}

// ════════════════════════════════════════════════════════════
//  QUIZ: START
// ════════════════════════════════════════════════════════════
async function startQuiz() {
  const qs = await loadQuestions();
  if (!qs.length) { showScreen('subject'); return; }

  state.questions      = qs;
  state.currentIdx     = 0;
  state.sessionScore   = 0;
  state.sessionXP      = 0;
  state.sessionCorrect = 0;
  state.answered       = false;

  // Update quiz nav
  $('nav-av').textContent        = state.avatar || progress.avatar || '🧒';
  const modeLabel = state.quizMode === 'free' ? '🕊️ Free' : state.quizMode === 'timer' ? '⏱️ Timer' : '📈 Progress';
  $('nav-level-label').textContent = `Level ${state.gameLevel} — ${modeLabel}`;

  showScreen('quiz');
  updateQuizMeta();
  renderQuestion();
}

// ════════════════════════════════════════════════════════════
//  QUIZ: RENDER QUESTION
// ════════════════════════════════════════════════════════════
function renderQuestion() {
  clearTimer();
  state.answered = false;

  const q     = state.questions[state.currentIdx];
  const total = state.questions.length;
  const pct   = Math.round((state.currentIdx / total) * 100);

  $('progress-fill').style.width  = pct + '%';
  $('progress-label').textContent = `Question ${state.currentIdx + 1} of ${total}`;
  $('progress-pct').textContent   = pct + '%';

  $('question-number').textContent     = `Q${state.currentIdx + 1}`;
  $('question-difficulty').className   = `difficulty-pill diff-${q.level}`;
  $('question-difficulty').textContent = q.level;
  $('question-text').textContent       = q.question;

  // Subject tag (Mix mode)
  const tag = $('question-subject-tag');
  if (state.selectedSubject === 'Mix' && q.subject) {
    const info = SUBJECTS_ALL.find(s => s.name === q.subject);
    tag.textContent   = `${info ? info.icon : '📚'} ${q.subject}`;
    tag.style.display = 'inline-block';
  } else {
    tag.style.display = 'none';
  }

  // Render options
  const LABELS = ['A','B','C','D'];
  const opts   = shuffle(q.options.map(t => ({ text: t })));
  const grid   = $('options-grid');
  grid.innerHTML = '';
  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className      = 'option-btn';
    btn.dataset.answer = opt.text;
    btn.innerHTML      = `<span class="option-label">${LABELS[i]}</span><span>${opt.text}</span>`;
    btn.onclick = () => handleAnswer(btn, opt.text, q.answer);
    grid.appendChild(btn);
  });

  $('btn-next').classList.remove('visible');

  // Mode logic
  if (state.quizMode === 'timer' || (state.quizMode === 'level' && state.gameLevel >= 5)) {
    state.mode = 'timer';
    startTimer();
  } else {
    state.mode = 'free';
    $('timer-wrap').style.display = 'none';
  }
}

// ════════════════════════════════════════════════════════════
//  QUIZ: HANDLE ANSWER
// ════════════════════════════════════════════════════════════
function handleAnswer(btn, chosen, correct) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();

  const isCorrect = chosen === correct;

  // Mark all options
  document.querySelectorAll('.option-btn').forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.answer === correct) b.classList.add('correct');
  });

  if (isCorrect) {
    state.sessionScore++;
    state.sessionCorrect++;
    let xp = XP_CORRECT;
    if (state.mode === 'timer' && state.timeLeft > 10) xp += XP_BONUS_FAST;
    state.sessionXP += xp;
    playSound('correct');
    showToast(`✅ Correct! +${xp} XP`, 'correct-toast');
  } else {
    btn.classList.add('wrong');
    playSound('wrong');
    showToast(`❌ Wrong! Ans: ${correct}`, 'wrong-toast');
  }

  updateQuizMeta();
  $('btn-next').classList.add('visible');
}

// ── Next Question ──────────────────────────────────────────────────────────────
$('btn-next').onclick = () => {
  state.currentIdx++;
  if (state.currentIdx >= state.questions.length) finishLevel();
  else renderQuestion();
};

// ════════════════════════════════════════════════════════════
//  FINISH LEVEL
// ════════════════════════════════════════════════════════════
function finishLevel() {
  clearTimer();
  const total    = state.questions.length;
  const accuracy = total > 0 ? Math.round((state.sessionCorrect / total) * 100) : 0;
  const passed   = accuracy >= 50; // need 50% to pass

  // Update global progress
  progress.score          += state.sessionScore;
  progress.correctAnswers += state.sessionCorrect;
  progress.totalQuestions += total;
  progress.totalXP        = (progress.totalXP || 0) + state.sessionXP;

  if (passed && !progress.completedLevels.includes(state.gameLevel)) {
    // Only update level progress in 'level' mode
    if (state.quizMode === 'level') {
      progress.completedLevels.push(state.gameLevel);
      // Unlock next level
      if (state.gameLevel < TOTAL_LEVELS) {
        progress.currentLevel = state.gameLevel + 1;
      }
    }
  }
  saveProgress();

  // Save to leaderboard
  saveLBEntry({
    name:    progress.name,
    avatar:  progress.avatar || state.avatar,
    level:   state.gameLevel,
    subject: state.selectedSubject,
    score:   state.sessionScore,
    total,
    accuracy,
    xp:      state.sessionXP,
    date:    new Date().toLocaleDateString('en-IN'),
  });

  if (passed) {
    // Level up screen
    playSound('levelup');
    launchConfetti();
    $('levelup-badge').textContent = LEVEL_ICONS[state.gameLevel];
    $('levelup-title').textContent = `Level ${state.gameLevel} Complete!`;
    $('levelup-sub').textContent   = `${LEVEL_TITLES[state.gameLevel]} — ${accuracy}% accuracy`;
    $('lu-score').textContent      = `${state.sessionScore}/${total}`;
    $('lu-acc').textContent        = accuracy + '%';
    $('lu-xp').textContent         = state.sessionXP;
    const nextLvl = state.gameLevel + 1;
    if (nextLvl <= TOTAL_LEVELS) {
      $('lu-next').textContent    = nextLvl;
      $('btn-next-num').textContent = nextLvl;
      $('btn-next-level').style.display = '';
    } else {
      $('lu-next').textContent    = '🏆';
      $('btn-next-level').style.display = 'none';
    }
    showScreen('levelup');
  } else {
    // Failed — show result screen
    showResultScreen(total, accuracy, false);
  }
}

// Level Up button actions
$('btn-next-level').onclick = () => {
  const next = state.gameLevel + 1;
  if (next <= TOTAL_LEVELS) {
    startLevelFlow(next);
  }
};
$('btn-levelup-map').onclick = () => { renderLevelMap(); showScreen('levelmap'); };

// ════════════════════════════════════════════════════════════
//  RESULT SCREEN (fail / info)
// ════════════════════════════════════════════════════════════
function showResultScreen(total, accuracy, passed) {
  const pct = state.sessionScore / total;
  $('result-avatar-emoji').textContent = pct >= 0.8 ? '🏆' : pct >= 0.6 ? '🌟' : pct >= 0.4 ? '😊' : '💪';
  $('result-player').textContent       = progress.name || state.playerName;
  $('result-meta').textContent         = `Level ${state.gameLevel} • Class ${state.selectedClass} • ${state.selectedSubject} • ${state.quizMode === 'free' ? '🕊️ Free' : state.quizMode === 'timer' ? '⏱️ Timer' : '📈 Progress'}`;
  $('result-score').textContent        = `${state.sessionScore}/${total}`;
  $('result-xp').textContent           = state.sessionXP;
  $('result-level').textContent        = getXPLevelName(progress.totalXP);
  $('result-accuracy').textContent     = accuracy + '%';
  showScreen('result');
}

$('btn-retry').onclick          = () => startQuiz();
$('btn-result-map').onclick     = () => { renderLevelMap(); showScreen('levelmap'); };
$('btn-change-subject').onclick = () => { renderSubjects(); showScreen('subject'); };
$('btn-home').onclick           = () => { renderHome(); showScreen('home'); };

// ════════════════════════════════════════════════════════════
//  TIMER
// ════════════════════════════════════════════════════════════
function startTimer() {
  state.timeLeft = 20;
  $('timer-wrap').style.display = 'block';
  updateTimerUI();
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerUI();
    if (state.timeLeft <= 0) { clearTimer(); if (!state.answered) autoFail(); }
  }, 1000);
}

function autoFail() {
  state.answered = true;
  const q = state.questions[state.currentIdx];
  document.querySelectorAll('.option-btn').forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.answer === q.answer) b.classList.add('correct');
  });
  playSound('wrong');
  showToast(`⏰ Time's up! Ans: ${q.answer}`, 'wrong-toast');
  $('btn-next').classList.add('visible');
}

function clearTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function updateTimerUI() {
  const pct  = state.timeLeft / 20;
  const circ = 2 * Math.PI * 21;
  const bar  = document.querySelector('.timer-bar');
  if (!bar) return;
  bar.style.strokeDasharray  = circ;
  bar.style.strokeDashoffset = circ * (1 - pct);
  bar.style.stroke = pct > 0.5 ? 'var(--green)' : pct > 0.25 ? 'var(--yellow)' : 'var(--red)';
  $('timer-text').textContent = state.timeLeft;
}

// ── Quiz meta badges ───────────────────────────────────────────────────────────
function updateQuizMeta() {
  $('badge-score').textContent = `⭐ ${state.sessionScore}`;
  $('badge-xp').textContent    = `✨ ${state.sessionXP} XP`;
}

// ════════════════════════════════════════════════════════════
//  LEADERBOARD
// ════════════════════════════════════════════════════════════
function saveLBEntry(entry) {
  let lb = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  lb.push(entry);
  lb.sort((a,b) => b.score - a.score || b.xp - a.xp);
  lb = lb.slice(0, 10);
  localStorage.setItem(LB_KEY, JSON.stringify(lb));
}

function renderLeaderboard() {
  const lb   = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  const list = $('lb-list');
  list.innerHTML = '';
  if (!lb.length) {
    list.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:24px;">No scores yet 🎮</li>';
    return;
  }
  lb.forEach((e, i) => {
    const li    = document.createElement('li');
    li.className = 'lb-item';
    li.style.animationDelay = i * 0.05 + 's';
    const medal = ['🥇','🥈','🥉'];
    li.innerHTML = `
      <span class="lb-rank">${i < 3 ? medal[i] : i+1}</span>
      <span class="lb-av">${e.avatar || '🧒'}</span>
      <div class="lb-info">
        <div class="lb-name">${escHtml(e.name)}</div>
        <div class="lb-sub">Level ${e.level} • ${escHtml(e.subject||'')} • ${e.date}</div>
      </div>
      <div class="lb-score">${e.score}</div>`;
    list.appendChild(li);
  });
}

$('btn-lb-clear').onclick = () => {
  if (confirm('Clear all leaderboard scores?')) {
    localStorage.removeItem(LB_KEY);
    renderLeaderboard();
  }
};

// ════════════════════════════════════════════════════════════
//  PROFILE
// ════════════════════════════════════════════════════════════
function renderProfile() {
  const lb   = JSON.parse(localStorage.getItem(LB_KEY) || '[]');
  const mine = lb.filter(e => e.name === (progress.name || state.playerName));

  const games     = mine.length;
  const bestScore = games ? Math.max(...mine.map(e => e.score)) : 0;
  const avgAcc    = games ? Math.round(mine.reduce((s,e) => s+(e.accuracy||0),0)/games) : 0;
  const totalXP   = progress.totalXP || 0;

  const av = progress.avatar || state.avatar || '🧒';
  $('profile-avatar').textContent      = av;
  $('profile-name').textContent        = progress.name || state.playerName || 'Player';
  $('profile-level-label').textContent = `${getXPLevelName(totalXP)} • ${totalXP} XP`;
  $('profile-games').textContent       = games;
  $('profile-best').textContent        = bestScore;
  $('profile-accuracy').textContent    = avgAcc + '%';
  $('profile-total-xp').textContent    = totalXP;

  const hist = $('profile-history');
  hist.innerHTML = '';
  if (!mine.length) {
    hist.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:14px;">No games yet!</li>';
    return;
  }
  [...mine].reverse().slice(0, 5).forEach((e, i) => {
    const li = document.createElement('li');
    li.className = 'lb-item';
    li.style.animationDelay = i * 0.05 + 's';
    li.innerHTML = `
      <span class="lb-rank">${i+1}</span>
      <span class="lb-av">${e.avatar||'🧒'}</span>
      <div class="lb-info">
        <div class="lb-name">Level ${e.level} • ${escHtml(e.subject||'')}</div>
        <div class="lb-sub">${e.date}</div>
      </div>
      <div class="lb-score">${e.score} ⭐</div>`;
    hist.appendChild(li);
  });
}

// ════════════════════════════════════════════════════════════
//  UTILS
// ════════════════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function getXPLevelName(xp) {
  let name = XP_LEVELS[0].name;
  XP_LEVELS.forEach(l => { if (xp >= l.minXP) name = l.name; });
  return name;
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])
  );
}

let toastTimer;
function showToast(msg, cls = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className   = `toast ${cls} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function launchConfetti() {
  const COLS = ['#FFD700','#FF6B9D','#00E5FF','#B388FF','#00E676','#FF6B35','#fff'];
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `left:${Math.random()*100}vw;top:-20px;
        background:${COLS[Math.floor(Math.random()*COLS.length)]};
        width:${Math.random()*10+5}px;height:${Math.random()*13+7}px;
        transform:rotate(${Math.random()*360}deg);
        animation-duration:${Math.random()*2+2}s;
        animation-delay:${Math.random()*0.4}s;
        border-radius:${Math.random()>0.5?'50%':'3px'};`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 22);
  }
}

// ════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════
(function init() {
  startClock();
  const hasSave = loadProgress();
  if (hasSave) renderHome();
  showScreen('home');
})();
