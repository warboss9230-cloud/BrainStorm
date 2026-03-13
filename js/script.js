/* =========================================================
   BrainStorm Quiz — script.js
   Full game logic: Free Play, Timer, Level Mode
   ========================================================= */

'use strict';

/* ── Avatar Library ────────────────────────────────────── */
const AVATARS = [
  {id:'a1',  emoji:'🧑‍🚀', name:'Astronaut'},
  {id:'a2',  emoji:'🦸',   name:'Hero'},
  {id:'a3',  emoji:'🧙‍♂️', name:'Wizard'},
  {id:'a4',  emoji:'🤖',   name:'Robot'},
  {id:'a5',  emoji:'🦊',   name:'Fox'},
  {id:'a6',  emoji:'🐼',   name:'Panda'},
  {id:'a7',  emoji:'🦁',   name:'Lion'},
  {id:'a8',  emoji:'🐯',   name:'Tiger'},
  {id:'a9',  emoji:'🦋',   name:'Butterfly'},
  {id:'a10', emoji:'🐉',   name:'Dragon'},
  {id:'a11', emoji:'🦄',   name:'Unicorn'},
  {id:'a12', emoji:'🐺',   name:'Wolf'},
  {id:'a13', emoji:'🦅',   name:'Eagle'},
  {id:'a14', emoji:'🐬',   name:'Dolphin'},
  {id:'a15', emoji:'🦈',   name:'Shark'},
  {id:'a16', emoji:'🌟',   name:'Star'},
  {id:'a17', emoji:'🔥',   name:'Phoenix'},
  {id:'a18', emoji:'⚡',   name:'Thunder'},
  {id:'a19', emoji:'💎',   name:'Diamond'},
  {id:'a20', emoji:'🌙',   name:'Moon'},
  {id:'a21', emoji:'☄️',   name:'Comet'},
  {id:'a22', emoji:'🏆',   name:'Champion'},
  {id:'a23', emoji:'🎯',   name:'Target'},
  {id:'a24', emoji:'🎮',   name:'Gamer'},
  {id:'a25', emoji:'🧬',   name:'Scientist'},
  {id:'a26', emoji:'🎸',   name:'Rockstar'},
  {id:'a27', emoji:'🎨',   name:'Artist'},
  {id:'a28', emoji:'📚',   name:'Scholar'},
  {id:'a29', emoji:'💡',   name:'Genius'},
  {id:'a30', emoji:'🚀',   name:'Rocketman'},
  {id:'a31', emoji:'🌈',   name:'Rainbow'},
  {id:'a32', emoji:'🐻',   name:'Bear'},
  {id:'a33', emoji:'🦝',   name:'Raccoon'},
  {id:'a34', emoji:'🐸',   name:'Frog'},
  {id:'a35', emoji:'🦉',   name:'Owl'},
  {id:'a36', emoji:'🐧',   name:'Penguin'},
  {id:'a37', emoji:'🦊',   name:'Red Fox'},
  {id:'a38', emoji:'🐳',   name:'Whale'},
  {id:'a39', emoji:'🦋',   name:'Monarch'},
  {id:'a40', emoji:'🌊',   name:'Wave'},
  {id:'a41', emoji:'🏔️',  name:'Mountain'},
  {id:'a42', emoji:'⚔️',   name:'Warrior'},
  {id:'a43', emoji:'🛡️',  name:'Guardian'},
  {id:'a44', emoji:'🧠',   name:'Brain'},
  {id:'a45', emoji:'👑',   name:'King'},
  {id:'a46', emoji:'🃏',   name:'Joker'},
  {id:'a47', emoji:'🎭',   name:'Actor'},
  {id:'a48', emoji:'🦸‍♀️',name:'Heroine'},
];

/* ── Level Config ──────────────────────────────────────── */
const LEVEL_CONFIG = {
  1:15, 2:20, 3:25, 4:30, 5:35,
  6:40, 7:45, 8:50, 9:55, 10:60
};

/* ── Timer Seconds per Mode ────────────────────────────── */
const TIMER_SECONDS = 20;

/* ── XP Values ─────────────────────────────────────────── */
const XP_CORRECT = 10;
const XP_WRONG   = -5;

/* ── Free Play question count ──────────────────────────── */
const FREE_PLAY_COUNT = 20;

/* ── Game State ────────────────────────────────────────── */
let state = {
  player: null,          // {name, avatarId, avatarEmoji}
  mode: null,            // 'free'|'timer'|'level'
  level: 1,              // selected level (level mode)
  questions: [],         // current question pool
  currentIdx: 0,
  score: { correct:0, wrong:0, xp:0 },
  sessionXP: 0,
  timer: null,
  timerVal: 0,
  answered: false,
  soundOn: true,
  allQuestions: [],      // raw JSON
  progress: null,        // stored progress
};

/* ── DOM Helpers ────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ── Screen Navigation ──────────────────────────────────── */
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo(0,0);
}

/* ── LocalStorage helpers ───────────────────────────────── */
const LS = {
  get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } },
  set: (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  remove: k => localStorage.removeItem(k),
};

function saveProgress() {
  const p = state.progress || {};
  LS.set('bsq_progress', {
    name: state.player.name,
    avatarId: state.player.avatarId,
    avatarEmoji: state.player.avatarEmoji,
    currentLevel: state.level,
    xp: p.xp !== undefined ? p.xp + state.sessionXP : state.sessionXP,
    completedLevels: p.completedLevels || [],
    correctAnswers: (p.correctAnswers||0) + state.score.correct,
    totalQuestions: (p.totalQuestions||0) + state.questions.length,
  });
}

function loadProgress() {
  return LS.get('bsq_progress');
}

/* ── Leaderboard ────────────────────────────────────────── */
function getLeaderboard() {
  return LS.get('bsq_leaderboard') || [];
}
function saveToLeaderboard() {
  let lb = getLeaderboard();
  const prog = loadProgress();
  const entry = {
    name: state.player.name,
    avatarEmoji: state.player.avatarEmoji,
    xp: prog ? prog.xp : state.sessionXP,
    correct: prog ? prog.correctAnswers : state.score.correct,
    total: prog ? prog.totalQuestions : state.questions.length,
    mode: state.mode,
    date: new Date().toLocaleDateString(),
  };
  // Remove old entry for same player
  lb = lb.filter(e => e.name.toLowerCase() !== entry.name.toLowerCase());
  lb.push(entry);
  lb.sort((a,b) => b.xp - a.xp);
  lb = lb.slice(0, 20);
  LS.set('bsq_leaderboard', lb);
}

/* ── Sound ──────────────────────────────────────────────── */
function playSound(type) {
  if (!state.soundOn) return;
  // Web Audio API synthesized sounds (no files needed)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'correct') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch(e) {}
}

/* ── Toast Notification ─────────────────────────────────── */
function toast(msg, type='info') {
  const c = $('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/* ── Canvas Background Stars ────────────────────────────── */
function initCanvas() {
  const canvas = $('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    stars = Array.from({length: 120}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      r: Math.random()*1.5+0.3,
      o: Math.random()*0.6+0.1,
      speed: Math.random()*0.15+0.03,
      pulse: Math.random()*Math.PI*2,
    }));
  }

  function draw(t) {
    ctx.clearRect(0,0,W,H);
    stars.forEach(s => {
      s.pulse += s.speed * 0.04;
      const alpha = s.o * (0.6 + 0.4*Math.sin(s.pulse));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(180,230,255,${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

/* ── Load Questions ─────────────────────────────────────── */
async function loadQuestions() {
  try {
    const res = await fetch('data/class1/math.json');
    state.allQuestions = await res.json();
  } catch(e) {
    // Fallback: small inline set if file not found
    state.allQuestions = [
      {id:1,level:1,subject:'Math',question:'What is 2+2?',options:['2','3','4','5'],answer:'4',difficulty:'easy'},
      {id:2,level:1,subject:'Science',question:'Our planet is called?',options:['Mars','Venus','Earth','Jupiter'],answer:'Earth',difficulty:'easy'},
    ];
    console.warn('Questions JSON not found, using fallback.');
  }
}

/* ── Shuffle ────────────────────────────────────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ── ═══════════════════════════════════════════════════
   SCREEN BUILDERS
   ═══════════════════════════════════════════════════ */

/* ── Home Screen ────────────────────────────────────────── */
function buildHome() {
  const prog = loadProgress();
  state.progress = prog;
  const resume = $('resume-section');
  if (prog) {
    resume.classList.remove('hidden');
    $('resume-name').textContent = `${prog.avatarEmoji || '🧑‍🚀'} ${prog.name}`;
    $('resume-stats').textContent =
      `Level ${prog.currentLevel} · ${prog.xp} XP · ${prog.correctAnswers}/${prog.totalQuestions} correct`;
  } else {
    resume.classList.add('hidden');
  }
  showScreen('screen-home');
}

/* ── Setup Screen ───────────────────────────────────────── */
function buildSetup() {
  // Pre-fill from progress
  const prog = loadProgress();
  if (prog) {
    $('player-name').value = prog.name;
    state.player = { name: prog.name, avatarId: prog.avatarId, avatarEmoji: prog.avatarEmoji };
  }
  buildAvatarGrid();
  showScreen('screen-setup');
}

function buildAvatarGrid() {
  const grid = $('avatar-grid');
  grid.innerHTML = '';
  AVATARS.forEach(av => {
    const item = document.createElement('div');
    item.className = 'avatar-item';
    item.dataset.id = av.id;
    if (state.player && state.player.avatarId === av.id) item.classList.add('selected');
    item.innerHTML = `<span class="avatar-emoji">${av.emoji}</span><span class="avatar-name">${av.name}</span>`;
    item.addEventListener('click', () => {
      $$('.avatar-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    });
    grid.appendChild(item);
  });
}

function setupContinue() {
  const name = $('player-name').value.trim();
  if (!name) { toast('Please enter your name!', 'error'); return; }
  const sel = document.querySelector('.avatar-item.selected');
  if (!sel) { toast('Please select an avatar!', 'error'); return; }
  const av = AVATARS.find(a => a.id === sel.dataset.id);
  state.player = { name, avatarId: av.id, avatarEmoji: av.emoji };
  buildModeSelect();
}

/* ── Mode Select Screen ─────────────────────────────────── */
function buildModeSelect() {
  state.mode = null;
  $$('.mode-card').forEach(c => c.classList.remove('selected'));
  $('level-picker').classList.remove('show');
  $('btn-start-game').disabled = true;
  showScreen('screen-mode');
  buildLevelGrid();
}

function buildLevelGrid() {
  const prog = loadProgress();
  const completed = prog ? (prog.completedLevels || []) : [];
  const grid = $('level-grid');
  grid.innerHTML = '';

  Object.entries(LEVEL_CONFIG).forEach(([lvl, qs]) => {
    const n = parseInt(lvl);
    const isCompleted = completed.includes(n);
    const isLocked = n > 1 && !completed.includes(n-1);

    const btn = document.createElement('div');
    btn.className = 'level-btn' + (isLocked ? ' locked' : '') + (isCompleted ? ' completed' : '');
    btn.innerHTML = `
      <div class="level-num">L${n}</div>
      <div class="level-qs">${qs} Qs</div>
      <div class="level-icon">${isLocked ? '🔒' : isCompleted ? '✅' : '▶'}</div>
    `;
    if (!isLocked) {
      btn.addEventListener('click', () => {
        $$('.level-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.level = n;
      });
    }
    grid.appendChild(btn);
  });
}

function selectMode(mode) {
  state.mode = mode;
  $$('.mode-card').forEach(c => {
    c.classList.toggle('selected', c.dataset.mode === mode);
  });
  $('level-picker').classList.toggle('show', mode === 'level');
  $('btn-start-game').disabled = false;
}

/* ── Start Game ─────────────────────────────────────────── */
function startGame() {
  if (!state.mode) { toast('Pick a game mode!', 'error'); return; }

  // Reset session score
  state.score = { correct:0, wrong:0, xp:0 };
  state.sessionXP = 0;
  state.currentIdx = 0;
  state.answered = false;

  // Build question pool
  let pool;
  if (state.mode === 'free') {
    pool = shuffle(state.allQuestions).slice(0, FREE_PLAY_COUNT);
  } else if (state.mode === 'timer') {
    pool = shuffle(state.allQuestions).slice(0, FREE_PLAY_COUNT);
  } else {
    // level mode
    pool = shuffle(state.allQuestions.filter(q => q.level === state.level))
           .slice(0, LEVEL_CONFIG[state.level]);
    if (pool.length < LEVEL_CONFIG[state.level]) {
      // pad with random questions if not enough in JSON
      const extra = shuffle(state.allQuestions.filter(q => q.level !== state.level))
                    .slice(0, LEVEL_CONFIG[state.level] - pool.length);
      pool = [...pool, ...extra];
    }
  }
  state.questions = pool;

  buildQuizHUD();
  loadQuestion();
  showScreen('screen-quiz');
}

/* ── Quiz HUD ───────────────────────────────────────────── */
function buildQuizHUD() {
  $('hud-avatar').textContent = state.player.avatarEmoji;
  $('hud-name').textContent   = state.player.name;
  $('hud-mode-badge').textContent = state.mode === 'free' ? '∞ Free Play'
    : state.mode === 'timer' ? '⏱ Timer Mode'
    : `⚔ Level ${state.level}`;
  updateHUDXP();
  updateProgress();

  // Show timer only in timer mode
  $('timer-display').style.display = state.mode === 'timer' ? 'block' : 'none';
}

function updateHUDXP() {
  const prog = loadProgress();
  const baseXP = prog ? prog.xp : 0;
  $('hud-xp').innerHTML = `XP: <span>${baseXP + state.sessionXP}</span>`;
}

function updateProgress() {
  const total = state.questions.length;
  const curr  = state.currentIdx + 1;
  const pct   = Math.round((state.currentIdx / total) * 100);
  $('progress-bar-fill').style.width = pct + '%';
  $('progress-text').innerHTML = `Question <span>${Math.min(curr, total)}</span> of <span>${total}</span>`;
}

/* ── Load Question ──────────────────────────────────────── */
function loadQuestion() {
  if (state.currentIdx >= state.questions.length) {
    endRound();
    return;
  }
  state.answered = false;
  clearTimer();

  const q = state.questions[state.currentIdx];
  updateProgress();

  $('q-subject').textContent = q.subject || 'General';
  $('q-difficulty').textContent = q.difficulty || 'medium';
  $('q-difficulty').className = 'q-difficulty ' + (q.difficulty||'medium');
  $('question-text').textContent = q.question;

  // Render options
  const grid = $('options-grid');
  grid.innerHTML = '';
  const labels = ['A','B','C','D'];
  const opts = shuffle(q.options.map((o,i) => ({text:o, orig:i})));

  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-label">${labels[i]}</span>
      <span class="option-text">${opt.text}</span>
    `;
    btn.addEventListener('click', () => handleAnswer(btn, opt.text, q.answer));
    grid.appendChild(btn);
  });

  // Question card animation reset
  const card = $('question-card');
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  // Start timer if timer mode
  if (state.mode === 'timer') {
    startTimer();
  }
}

/* ── Handle Answer ──────────────────────────────────────── */
function handleAnswer(btn, chosen, correct) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();

  const isCorrect = chosen === correct;
  const xpDelta = isCorrect ? XP_CORRECT : XP_WRONG;

  if (isCorrect) {
    state.score.correct++;
    btn.classList.add('correct');
    playSound('correct');
    showXPPopup('+10 XP', true);
  } else {
    btn.classList.add('wrong');
    playSound('wrong');
    showXPPopup('-5 XP', false);
    // Show correct answer
    $$('.option-btn').forEach(b => {
      if (b.querySelector('.option-text').textContent === correct) {
        b.classList.add('correct');
      }
    });
  }

  state.score.wrong += isCorrect ? 0 : 1;
  state.sessionXP = Math.max(0, state.sessionXP + xpDelta);
  state.score.xp  = state.sessionXP;
  updateHUDXP();

  // Disable all buttons
  $$('.option-btn').forEach(b => b.disabled = true);

  // Auto-advance
  setTimeout(() => {
    state.currentIdx++;
    loadQuestion();
  }, 1500);
}

/* ── Timer ──────────────────────────────────────────────── */
function startTimer() {
  state.timerVal = TIMER_SECONDS;
  $('timer-display').textContent = state.timerVal;
  $('timer-display').className = 'timer-display';

  state.timer = setInterval(() => {
    state.timerVal--;
    $('timer-display').textContent = state.timerVal;

    if (state.timerVal <= 5) {
      $('timer-display').className = 'timer-display danger';
    } else if (state.timerVal <= 10) {
      $('timer-display').className = 'timer-display warning';
    }

    if (state.timerVal <= 0) {
      clearTimer();
      // Auto-wrong: find correct and mark it
      if (!state.answered) {
        state.answered = true;
        const q = state.questions[state.currentIdx];
        $$('.option-btn').forEach(b => {
          b.disabled = true;
          if (b.querySelector('.option-text').textContent === q.answer) {
            b.classList.add('correct');
          }
        });
        state.score.wrong++;
        state.sessionXP = Math.max(0, state.sessionXP + XP_WRONG);
        state.score.xp  = state.sessionXP;
        updateHUDXP();
        showXPPopup('⏱ -5 XP', false);
        toast('Time\'s up!', 'error');
        setTimeout(() => { state.currentIdx++; loadQuestion(); }, 1500);
      }
    }
  }, 1000);
}

function clearTimer() {
  if (state.timer) { clearInterval(state.timer); state.timer = null; }
}

/* ── XP Popup ───────────────────────────────────────────── */
function showXPPopup(msg, correct) {
  const el = $('xp-popup');
  el.textContent = msg;
  el.className = 'xp-popup ' + (correct ? 'show-correct' : 'show-wrong');
  setTimeout(() => { el.className = 'xp-popup'; }, 900);
}

/* ── End Round ──────────────────────────────────────────── */
function endRound() {
  clearTimer();

  // Level completion check
  if (state.mode === 'level') {
    const prog = loadProgress() || {};
    const completed = prog.completedLevels || [];
    if (!completed.includes(state.level)) {
      completed.push(state.level);
    }
    prog.completedLevels = completed;
    LS.set('bsq_progress', { ...prog, completedLevels: completed });
  }

  saveProgress();
  saveToLeaderboard();
  buildResults();
  showScreen('screen-result');
}

/* ── Results Screen ─────────────────────────────────────── */
function buildResults() {
  const total   = state.questions.length;
  const correct = state.score.correct;
  const wrong   = state.score.wrong;
  const xp      = state.sessionXP;
  const pct     = total > 0 ? Math.round((correct/total)*100) : 0;

  // Grade
  let grade, gradeClass, msg;
  if (pct >= 90)      { grade='S'; gradeClass='grade-s'; msg='🏆 Legendary! Absolute genius!'; }
  else if (pct >= 75) { grade='A'; gradeClass='grade-a'; msg='⭐ Excellent! You crushed it!'; }
  else if (pct >= 60) { grade='B'; gradeClass='grade-b'; msg='✨ Great job! Keep it up!'; }
  else if (pct >= 45) { grade='C'; gradeClass='grade-c'; msg='💪 Good effort! Keep practicing!'; }
  else                { grade='D'; gradeClass='grade-d'; msg='🔄 Keep trying! You\'ll improve!'; }

  $('result-avatar-big').textContent = state.player.avatarEmoji;
  $('result-grade').textContent = grade;
  $('result-grade').className   = 'result-grade ' + gradeClass;
  $('result-message').textContent = msg;
  $('result-player-name').textContent = state.player.name;

  $('stat-correct').textContent = correct;
  $('stat-wrong').textContent   = wrong;
  $('stat-xp').textContent      = '+' + xp;
  $('stat-score').textContent   = pct + '%';
  $('stat-total').textContent   = total;

  // Level complete badge
  const badge = $('level-complete-badge');
  if (state.mode === 'level') {
    badge.classList.remove('hidden');
    badge.textContent = `✅ Level ${state.level} Complete!`;
  } else {
    badge.classList.add('hidden');
  }

  // Next level button
  const nextBtn = $('btn-next-level');
  if (state.mode === 'level' && state.level < 10) {
    nextBtn.classList.remove('hidden');
    nextBtn.textContent = `▶ Level ${state.level+1}`;
  } else {
    nextBtn.classList.add('hidden');
  }
}

/* ── Leaderboard Screen ─────────────────────────────────── */
function buildLeaderboard() {
  renderLB('all');
  showScreen('screen-leaderboard');
}

function renderLB(filter) {
  let lb = getLeaderboard();
  if (filter !== 'all') lb = lb.filter(e => e.mode === filter);

  const list = $('leaderboard-list');
  if (lb.length === 0) {
    list.innerHTML = '<div class="lb-empty">No scores yet. Play a game first!</div>';
    return;
  }

  list.innerHTML = '';
  lb.forEach((entry, i) => {
    const rank = i+1;
    const item = document.createElement('div');
    item.className = 'lb-item' + (rank<=3 ? ` rank-${rank}` : '');
    item.style.animationDelay = (i*0.06) + 's';

    const rankHTML = rank===1 ? '🥇' : rank===2 ? '🥈' : rank===3 ? '🥉'
      : `<span class="lb-rank other">#${rank}</span>`;
    const rankClass = rank<=3 ? `r${rank}` : 'other';

    item.innerHTML = `
      <div class="lb-rank ${rankClass}">${rank<=3 ? rankHTML : '#'+rank}</div>
      <div class="lb-avatar">${entry.avatarEmoji || '🧑‍🚀'}</div>
      <div class="lb-info">
        <div class="lb-name">${escapeHTML(entry.name)}</div>
        <div class="lb-details">${entry.correct}/${entry.total} correct · ${capFirst(entry.mode)} Mode · ${entry.date}</div>
      </div>
      <div class="lb-xp">
        <div>${entry.xp}</div>
        <div class="lb-xp-label">XP</div>
      </div>
    `;
    list.appendChild(item);
  });
}

/* ── Utility ────────────────────────────────────────────── */
function escapeHTML(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}
function capFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/* ── Sound Toggle ───────────────────────────────────────── */
function toggleSound() {
  state.soundOn = !state.soundOn;
  LS.set('bsq_sound', state.soundOn);
  $('sound-btn').textContent = state.soundOn ? '🔊' : '🔇';
  toast(state.soundOn ? 'Sound ON' : 'Sound OFF', 'info');
}

/* ── Resume / Reset ─────────────────────────────────────── */
function resumeGame() {
  const prog = loadProgress();
  if (!prog) return;
  state.player = { name: prog.name, avatarId: prog.avatarId, avatarEmoji: prog.avatarEmoji };
  state.progress = prog;
  selectMode('level');
  buildModeSelect();
  // Auto-select current level
  state.level = prog.currentLevel || 1;
  setTimeout(() => {
    selectMode('level');
    startGame();
  }, 100);
}

function resetProgress() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  LS.remove('bsq_progress');
  state.progress = null;
  toast('Progress reset!', 'info');
  buildHome();
}

/* ── Event Listeners ────────────────────────────────────── */
function attachEvents() {
  // Home
  $('btn-new-game').addEventListener('click', buildSetup);
  $('btn-resume').addEventListener('click', resumeGame);
  $('btn-leaderboard-home').addEventListener('click', buildLeaderboard);
  $('btn-reset').addEventListener('click', resetProgress);

  // Setup
  $('btn-setup-continue').addEventListener('click', setupContinue);
  $('btn-setup-back').addEventListener('click', buildHome);

  // Mode Select
  $$('.mode-card').forEach(card => {
    card.addEventListener('click', () => selectMode(card.dataset.mode));
  });
  $('btn-start-game').addEventListener('click', startGame);
  $('btn-mode-back').addEventListener('click', buildSetup);

  // Quiz
  $('btn-quit-quiz').addEventListener('click', () => {
    clearTimer();
    saveProgress();
    buildHome();
  });
  $('sound-btn').addEventListener('click', toggleSound);

  // Results
  $('btn-play-again').addEventListener('click', () => {
    startGame();
  });
  $('btn-next-level').addEventListener('click', () => {
    state.level = Math.min(state.level + 1, 10);
    startGame();
  });
  $('btn-go-leaderboard').addEventListener('click', buildLeaderboard);
  $('btn-result-home').addEventListener('click', buildHome);

  // Leaderboard tabs
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLB(btn.dataset.filter);
    });
  });
  $('btn-lb-back').addEventListener('click', buildHome);
}

/* ── Init ───────────────────────────────────────────────── */
async function init() {
  // Load sound pref
  const sp = LS.get('bsq_sound');
  state.soundOn = sp === null ? true : sp;
  $('sound-btn').textContent = state.soundOn ? '🔊' : '🔇';

  initCanvas();
  await loadQuestions();
  attachEvents();
  buildHome();
}

document.addEventListener('DOMContentLoaded', init);
