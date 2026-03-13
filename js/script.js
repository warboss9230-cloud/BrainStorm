/* ========================================
   BRAINSTORM QUIZ - script.js
   Data path: data/class{N}/{subject}.json
   JSON format: { questions: [{ id, question, options:[4], answer, level }] }
   ======================================== */
'use strict';

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  playerName: '',
  selectedClass: null,
  selectedSubject: null,
  selectedMode: null,
  selectedDifficulty: 'all',   // 'all' | 'easy' | 'medium' | 'hard'
  questions: [],
  currentIdx: 0,
  score: 0,
  xp: 0,
  level: 1,
  answered: false,
  timerInterval: null,
  timeLeft: 20,
  totalTime: 20,
  correctCount: 0,
};

// ── XP / Level Config ───────────────────────────────────────────────────────
const XP_CORRECT    = 10;
const XP_BONUS_FAST = 5;
const LEVELS = [
  { level: 1, name: 'Beginner',  minXP: 0   },
  { level: 2, name: 'Explorer',  minXP: 50  },
  { level: 3, name: 'Scholar',   minXP: 120 },
  { level: 4, name: 'Expert',    minXP: 220 },
  { level: 5, name: 'Master',    minXP: 350 },
  { level: 6, name: 'Champion',  minXP: 500 },
  { level: 7, name: 'Legend',    minXP: 700 },
];

// ── Subject Config ──────────────────────────────────────────────────────────
// name   → display name & identifier used in state
// file   → filename (without .json) inside data/class{N}/ folder
// icon   → emoji shown on subject card
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

// ── DOM Helper ─────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const screens = {
  name:        $('screen-name'),
  profile:     $('screen-profile'),
  class:       $('screen-class'),
  subject:     $('screen-subject'),
  mode:        $('screen-mode'),
  difficulty:  $('screen-difficulty'),
  quiz:        $('screen-quiz'),
  result:      $('screen-result'),
  leaderboard: $('screen-leaderboard'),
};

// ── Show Screen ─────────────────────────────────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  updateBackBtn(name);
  window.scrollTo(0, 0);
}

// ── Back Button (fixed bottom, visible on all pages except home) ─────────────
const backBtn = $('back-btn');
const backMap = {
  profile:     'name',
  class:       'name',
  subject:     'class',
  mode:        'subject',
  difficulty:  'mode',
  quiz:        'difficulty',
  result:      'name',
  leaderboard: 'name',
};

function updateBackBtn(screen) {
  if (backMap[screen]) {
    backBtn.classList.add('visible');
    backBtn.onclick = () => {
      if (screen === 'quiz') clearTimer();
      const target = backMap[screen];
      showScreen(target);
      if (target === 'subject') renderSubjects();
      if (target === 'class')   renderClasses();
    };
  } else {
    backBtn.classList.remove('visible');
  }
}

// ── Animated Background Canvas ───────────────────────────────────────────────
(function initCanvas() {
  const canvas = $('bg-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#FFD700','#FF6B9D','#00E5FF','#B388FF','#00E676','#FF6B35'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x     = Math.random() * W;
      this.y     = init ? Math.random() * H : H + 20;
      this.r     = Math.random() * 3 + 1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speed = Math.random() * 0.6 + 0.2;
      this.drift = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.y    -= this.speed;
      this.x    += this.drift;
      this.pulse += 0.02;
      this.alpha  = 0.2 + Math.sin(this.pulse) * 0.15;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle   = this.color;
      ctx.shadowBlur  = 12;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = Array.from({ length: 80 }, () => new Particle());
  }
  function loop() {
    ctx.clearRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    g.addColorStop(0, 'rgba(20,10,50,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  window.addEventListener('resize', resize);
  resize(); loop();
})();

// ── Top Bar: Leaderboard & Profile ───────────────────────────────────────────
$('btn-top-leaderboard').addEventListener('click', () => { renderLeaderboard(); showScreen('leaderboard'); });
$('btn-top-profile').addEventListener('click',     () => { renderProfile();     showScreen('profile'); });

// ── Step 1: Name Screen ──────────────────────────────────────────────────────
$('btn-start').addEventListener('click', () => {
  const name = $('input-name').value.trim();
  if (!name) { showToast('Please enter your name! 😊', 'wrong-toast'); return; }
  state.playerName = name;
  showScreen('class');
  renderClasses();
});
$('input-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('btn-start').click(); });

// ── Step 2: Class Selection ──────────────────────────────────────────────────
function renderClasses() {
  const grid   = $('class-grid');
  grid.innerHTML = '';
  const icons  = ['🌱','📚','✏️','🎨','🔭','🧮','🔬','🌍','⚗️','📐','🧬','🎓'];
  const colors = ['color-1','color-2','color-3','color-4','color-5','color-6'];
  for (let i = 1; i <= 12; i++) {
    const div = document.createElement('div');
    div.className = `card-item class-card ${colors[(i - 1) % 6]}`;
    div.setAttribute('role', 'listitem');
    div.setAttribute('tabindex', '0');
    div.innerHTML = `<span class="card-icon">${icons[i - 1]}</span><span class="card-label">Class ${i}</span>`;
    const pick = () => { state.selectedClass = i; showScreen('subject'); renderSubjects(); };
    div.addEventListener('click', pick);
    div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pick(); });
    grid.appendChild(div);
  }
}

// ── Step 3: Subject Selection ────────────────────────────────────────────────
function renderSubjects() {
  const grid = $('subject-grid');
  grid.innerHTML = '';
  $('subject-class-label').textContent = `Class ${state.selectedClass}`;
  const colors = ['color-1','color-2','color-3','color-4','color-5','color-6'];

  // Mix All — always first
  const mixDiv = document.createElement('div');
  mixDiv.className = 'card-item mix-card color-1';
  mixDiv.setAttribute('role', 'listitem');
  mixDiv.setAttribute('tabindex', '0');
  mixDiv.innerHTML = `<span class="card-icon">🎲</span><span class="card-label">Mix All</span>`;
  mixDiv.title = 'Random questions from every subject';
  const pickMix = () => { state.selectedSubject = 'Mix'; showScreen('mode'); };
  mixDiv.addEventListener('click', pickMix);
  mixDiv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pickMix(); });
  grid.appendChild(mixDiv);

  // All 10 subjects (same for every class)
  SUBJECTS_ALL.forEach((subj, i) => {
    const div = document.createElement('div');
    div.className = `card-item ${colors[(i + 1) % 6]}`;
    div.setAttribute('role', 'listitem');
    div.setAttribute('tabindex', '0');
    div.innerHTML = `<span class="card-icon">${subj.icon}</span><span class="card-label">${subj.name}</span>`;
    const pick = () => { state.selectedSubject = subj.name; showScreen('mode'); };
    div.addEventListener('click', pick);
    div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pick(); });
    grid.appendChild(div);
  });
}

// ── Step 4: Mode Selection ───────────────────────────────────────────────────
['mode-free','mode-timer','mode-level'].forEach(id => {
  const modeMap = { 'mode-free': 'free', 'mode-timer': 'timer', 'mode-level': 'level' };
  const pick = () => { state.selectedMode = modeMap[id]; showScreen('difficulty'); };
  $(id).addEventListener('click', pick);
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pick(); });
});

// ── Step 5: Difficulty Selection ─────────────────────────────────────────────
['all','easy','medium','hard'].forEach(diff => {
  const el   = $('diff-' + diff);
  const pick = () => { state.selectedDifficulty = diff; startGame(state.selectedMode); };
  el.addEventListener('click', pick);
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pick(); });
});

// ══════════════════════════════════════════════════════════════════════════════
//  DATA LOADING
//  Folder : data/class{N}/{file}.json
//  Format : { "questions": [ { "id", "question", "options":[4], "answer", "level" } ] }
//
//  Mix Subject Logic:
//    • state.selectedSubject === 'Mix'
//    • All 10 subject files fetched in parallel via Promise.all
//    • 5 questions picked per subject (filtered by difficulty if set)
//    • Each question gets .subject injected → shown as tag in quiz card
// ══════════════════════════════════════════════════════════════════════════════

// How many questions to pick per subject in Mix mode
const MIX_PER_SUBJECT = 5;

// Build file URL:  data/class3/animals-birds.json
function subjectURL(classNum, file) {
  return `data/class${classNum}/${file}.json`;
}

// Fetch one subject file → returns questions[] with .subject name injected
async function fetchSubject(classNum, subj) {
  const url  = subjectURL(classNum, subj.file);
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`404: ${url}`);
  const data = await res.json();
  return data.questions.map(q => ({ ...q, subject: subj.name }));
}

// Show / hide a full-screen loading overlay while fetching
function showLoader(visible, msg = 'Loading questions…') {
  let el = $('quiz-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'quiz-loader';
    el.style.cssText = `
      position:fixed;inset:0;z-index:500;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:rgba(13,6,32,0.92);backdrop-filter:blur(8px);
      color:#f0e6ff;font-size:1.1rem;font-weight:700;gap:16px;
      transition:opacity 0.3s;`;
    el.innerHTML = `
      <div style="font-size:2.5rem;animation:spin 1s linear infinite;">🎲</div>
      <div id="quiz-loader-msg">${msg}</div>`;
    // spin keyframe
    if (!document.getElementById('spin-style')) {
      const s = document.createElement('style');
      s.id = 'spin-style';
      s.textContent = '@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(el);
  }
  el.style.display = visible ? 'flex' : 'none';
  if (visible) ($('quiz-loader-msg') || el.querySelector('div:last-child')).textContent = msg;
}

// Main question loader
async function loadQuestions() {
  try {
    let qs = [];

    if (state.selectedSubject === 'Mix') {
      // ── MIX MODE ────────────────────────────────────────────────────────────
      // Fetch all 10 subject JSON files concurrently
      showLoader(true, `Loading Mix — fetching all subjects for Class ${state.selectedClass}…`);

      const results = await Promise.all(
        SUBJECTS_ALL.map(subj =>
          fetchSubject(state.selectedClass, subj)
            .catch(err => {
              console.warn(`[Mix] Skipped missing file: ${err.message}`);
              return [];   // gracefully skip any missing subject file
            })
        )
      );

      showLoader(false);

      // Pick MIX_PER_SUBJECT questions from each subject (after difficulty filter)
      results.forEach((pool, i) => {
        const subjectName = SUBJECTS_ALL[i].name;
        let filtered = state.selectedDifficulty !== 'all'
          ? pool.filter(q => q.level === state.selectedDifficulty)
          : pool;

        if (!filtered.length) {
          console.info(`[Mix] No questions for subject "${subjectName}" at difficulty "${state.selectedDifficulty}"`);
          return;
        }

        qs.push(...shuffle(filtered).slice(0, MIX_PER_SUBJECT));
      });

      if (!qs.length) {
        showToast('No Mix questions found! Add data files first.', 'wrong-toast');
        return [];
      }

    } else {
      // ── SINGLE SUBJECT ───────────────────────────────────────────────────────
      const subj = SUBJECTS_ALL.find(s => s.name === state.selectedSubject);
      if (!subj) { showToast('Unknown subject!', 'wrong-toast'); return []; }

      showLoader(true, `Loading ${subj.name} — Class ${state.selectedClass}…`);
      qs = await fetchSubject(state.selectedClass, subj);
      showLoader(false);

      if (state.selectedDifficulty !== 'all')
        qs = qs.filter(q => q.level === state.selectedDifficulty);

      if (!qs.length) {
        showToast(`No "${state.selectedDifficulty}" questions for ${subj.name}!`, 'wrong-toast');
        return [];
      }
    }

    // ── Sort by difficulty (Level Mode) or shuffle ────────────────────────────
    if (state.selectedMode === 'level') {
      const order = { easy: 0, medium: 1, hard: 2 };
      qs.sort((a, b) => (order[a.level] ?? 1) - (order[b.level] ?? 1));
    } else {
      qs = shuffle(qs);
    }

    return qs;

  } catch (err) {
    showLoader(false);
    console.error('[loadQuestions]', err);
    showToast('Could not load questions. Check data files!', 'wrong-toast');
    return [];
  }
}

// ── Shuffle utility ───────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Start Game ───────────────────────────────────────────────────────────────
async function startGame(mode) {
  state.selectedMode = mode;
  state.score        = 0;
  state.xp           = 0;
  state.level        = 1;
  state.currentIdx   = 0;
  state.correctCount = 0;

  const qs = await loadQuestions();
  if (!qs.length) { showScreen('subject'); return; }
  state.questions = qs;

  showScreen('quiz');
  const diffEmoji = { all: '🌈', easy: '😊', medium: '🤔', hard: '🔥' };
  const subjLabel = state.selectedSubject === 'Mix' ? '🎲 Mix' : state.selectedSubject;
  $('nav-level').textContent = `${subjLabel} • Lv.${state.level} ${diffEmoji[state.selectedDifficulty] || ''}`;
  updateQuizMeta();
  renderQuestion();
}

// ── Render Question ───────────────────────────────────────────────────────────
function renderQuestion() {
  clearTimer();
  state.answered = false;

  const q     = state.questions[state.currentIdx];
  const total = state.questions.length;

  // Progress
  $('progress-fill').style.width   = `${(state.currentIdx / total) * 100}%`;
  $('progress-label').textContent  = `Question ${state.currentIdx + 1} of ${total}`;

  // Question info
  $('question-number').textContent     = `Q${state.currentIdx + 1}`;
  $('question-difficulty').className   = `difficulty-pill diff-${q.level}`;
  $('question-difficulty').textContent = q.level;
  $('question-text').textContent       = q.question;

  // Subject tag — clearly visible colour-coded banner in Mix mode
  const subjTag = $('question-subject-tag');
  if (state.selectedSubject === 'Mix' && q.subject) {
    const info     = SUBJECTS_ALL.find(s => s.name === q.subject);
    const icon     = info ? info.icon : '📚';
    const colorMap = {
      'English'      : '#00e5ff',
      'Hindi'        : '#ff6b9d',
      'Math'         : '#ffd700',
      'Science'      : '#00e676',
      'Computer'     : '#b388ff',
      'EVS'          : '#69f0ae',
      'GK'           : '#ff9800',
      'Economics'    : '#f06292',
      'Space'        : '#80d8ff',
      'Animals/Birds': '#ffcc02',
    };
    const col = colorMap[q.subject] || '#b388ff';
    subjTag.innerHTML = `${icon} ${q.subject}`;
    subjTag.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'gap:5px',
      'padding:5px 14px',
      'border-radius:20px',
      'font-size:0.82rem',
      'font-weight:800',
      'letter-spacing:0.4px',
      `color:${col}`,
      `background:${col}22`,
      `border:1.5px solid ${col}88`,
      `box-shadow:0 0 10px ${col}44`,
    ].join(';');
  } else {
    subjTag.style.cssText = 'display:none';
  }

  // Options — shuffled, labelled A–D
  const LABELS   = ['A','B','C','D'];
  const opts     = shuffle(q.options.map(text => ({ text })));
  const optGrid  = $('options-grid');
  optGrid.innerHTML = '';
  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className      = 'option-btn';
    btn.dataset.answer = opt.text;
    btn.innerHTML      = `<span class="option-label">${LABELS[i]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => handleAnswer(btn, opt.text, q.answer));
    optGrid.appendChild(btn);
  });

  $('btn-next').classList.remove('visible');
  if (state.selectedMode === 'timer') startTimer();
}

// ── Handle Answer ─────────────────────────────────────────────────────────────
function handleAnswer(btn, chosen, correct) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();

  document.querySelectorAll('.option-btn').forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.answer === correct) b.classList.add('correct');
  });

  if (chosen === correct) {
    state.score++;
    state.correctCount++;
    let earned = XP_CORRECT;
    if (state.selectedMode === 'timer' && state.timeLeft > 10) earned += XP_BONUS_FAST;
    if (state.selectedMode !== 'free') {
      state.xp   += earned;
      state.level  = getLevel(state.xp);
    }
    showToast(`✅ Correct! +${earned} XP`, 'correct-toast');
  } else {
    btn.classList.add('wrong');
    showToast(`❌ Oops! Correct: ${correct}`, 'wrong-toast');
  }

  updateQuizMeta();
  $('btn-next').classList.add('visible');
}

// ── Timer ──────────────────────────────────────────────────────────────────
function startTimer() {
  state.timeLeft = state.totalTime = 20;
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
  showToast(`⏰ Time's up! Answer: ${q.answer}`, 'wrong-toast');
  $('btn-next').classList.add('visible');
}

function clearTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function updateTimerUI() {
  const wrap = $('timer-wrap');
  if (state.selectedMode !== 'timer') { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  const pct  = state.timeLeft / state.totalTime;
  const circ = 2 * Math.PI * 21;
  const bar  = document.querySelector('.timer-bar');
  bar.style.strokeDasharray  = circ;
  bar.style.strokeDashoffset = circ * (1 - pct);
  bar.style.stroke = pct > 0.5 ? 'var(--accent-green)' : pct > 0.25 ? 'var(--accent-yellow)' : 'var(--wrong)';
  $('timer-text').textContent = state.timeLeft;
}

// ── Quiz Meta (score / xp / level badges) ─────────────────────────────────────
function updateQuizMeta() {
  $('badge-score').textContent = `⭐ ${state.score}`;
  $('badge-xp').textContent    = `✨ ${state.xp} XP`;
  $('nav-level').textContent   = `Lv.${state.level}`;
}

// ── Next / End ────────────────────────────────────────────────────────────────
$('btn-next').addEventListener('click', () => {
  state.currentIdx++;
  if (state.currentIdx >= state.questions.length) endGame();
  else renderQuestion();
});

// ── End Game ─────────────────────────────────────────────────────────────────
function endGame() {
  clearTimer();
  const total    = state.questions.length;
  const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;

  saveScore({
    name:    state.playerName,
    class:   state.selectedClass,
    subject: state.selectedSubject,
    mode:    state.selectedMode,
    score:   state.score,
    xp:      state.xp,
    accuracy,
    date:    new Date().toLocaleDateString(),
  });

  const modeLabel = { free: 'Free Play', timer: 'Timer Mode', level: 'Level Mode' };
  const diffLabel = state.selectedDifficulty === 'all'
    ? 'All Levels'
    : state.selectedDifficulty.charAt(0).toUpperCase() + state.selectedDifficulty.slice(1);

  $('result-player').textContent    = state.playerName;
  $('result-meta').textContent      = `Class ${state.selectedClass} • ${state.selectedSubject === 'Mix' ? '🎲 Mix All' : state.selectedSubject} • ${modeLabel[state.selectedMode]} • ${diffLabel}`;
  $('result-score').textContent     = `${state.score}/${total}`;
  $('result-xp').textContent        = state.xp;
  $('result-level').textContent     = getLevelName(state.xp);
  $('result-accuracy').textContent  = accuracy + '%';

  const pct = state.score / total;
  $('result-avatar').textContent = pct >= 0.8 ? '🏆' : pct >= 0.6 ? '🌟' : pct >= 0.4 ? '😊' : '💪';

  showScreen('result');
  if (pct >= 0.7) launchConfetti();
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function saveScore(entry) {
  let lb = JSON.parse(localStorage.getItem('brainstorm_lb') || '[]');
  lb.push(entry);
  lb.sort((a, b) => b.score - a.score || b.xp - a.xp);
  lb = lb.slice(0, 10);
  localStorage.setItem('brainstorm_lb', JSON.stringify(lb));
}

function renderLeaderboard() {
  const lb   = JSON.parse(localStorage.getItem('brainstorm_lb') || '[]');
  const list = $('lb-list');
  list.innerHTML = '';
  if (!lb.length) {
    list.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:24px;">No scores yet. Play your first quiz! 🎮</li>';
    return;
  }
  lb.forEach((e, i) => {
    const li  = document.createElement('li');
    li.className = 'lb-item';
    li.style.animationDelay = `${i * 0.05}s`;
    const medal = ['🥇','🥈','🥉'];
    const rank  = i < 3
      ? `<span class="lb-rank">${medal[i]}</span>`
      : `<span class="lb-rank" style="color:var(--text-muted)">${i + 1}</span>`;
    li.innerHTML = `${rank}
      <div class="lb-info">
        <div class="lb-name">${escHtml(e.name)}</div>
        <div class="lb-sub">Class ${e.class} • ${escHtml(e.subject)} • ${e.date}</div>
      </div>
      <div class="lb-score">${e.score}</div>`;
    list.appendChild(li);
  });
}

$('btn-lb-clear').addEventListener('click', () => {
  if (confirm('Clear all leaderboard data?')) {
    localStorage.removeItem('brainstorm_lb');
    renderLeaderboard();
  }
});

// ── Profile ───────────────────────────────────────────────────────────────────
function renderProfile() {
  const lb   = JSON.parse(localStorage.getItem('brainstorm_lb') || '[]');
  const name = state.playerName || 'Player';
  const mine = lb.filter(e => e.name === name);

  const games     = mine.length;
  const bestScore = games ? Math.max(...mine.map(e => e.score)) : 0;
  const avgAcc    = games ? Math.round(mine.reduce((s, e) => s + (e.accuracy || 0), 0) / games) : 0;
  const totalXP   = mine.reduce((s, e) => s + (e.xp || 0), 0);

  const avatarMap = ['🌱','📚','🎓','🔬','⚗️','🏆','👑'];
  $('profile-avatar').textContent      = avatarMap[getLevel(totalXP) - 1] || '🧠';
  $('profile-name').textContent        = name;
  $('profile-level-label').textContent = `${getLevelName(totalXP)} • ${totalXP} XP`;
  $('profile-games').textContent       = games;
  $('profile-best').textContent        = bestScore;
  $('profile-accuracy').textContent    = avgAcc + '%';
  $('profile-total-xp').textContent    = totalXP;

  const hist = $('profile-history');
  hist.innerHTML = '';
  if (!mine.length) {
    hist.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:16px;">No games yet!</li>';
    return;
  }
  [...mine].reverse().slice(0, 5).forEach((e, i) => {
    const li = document.createElement('li');
    li.className = 'lb-item';
    li.style.animationDelay = `${i * 0.05}s`;
    li.innerHTML = `
      <span class="lb-rank">${i + 1}</span>
      <div class="lb-info">
        <div class="lb-name">Class ${e.class} • ${escHtml(e.subject)}</div>
        <div class="lb-sub">${e.mode || ''} • ${e.date}</div>
      </div>
      <div class="lb-score">${e.score} ⭐</div>`;
    hist.appendChild(li);
  });
}

// ── Confetti ───────────────────────────────────────────────────────────────
function launchConfetti() {
  const COLS = ['#FFD700','#FF6B9D','#00E5FF','#B388FF','#00E676','#FF6B35','#fff'];
  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left:${Math.random()*100}vw; top:-20px;
        background:${COLS[Math.floor(Math.random()*COLS.length)]};
        width:${Math.random()*10+6}px; height:${Math.random()*14+8}px;
        transform:rotate(${Math.random()*360}deg);
        animation-duration:${Math.random()*2+2}s;
        animation-delay:${Math.random()*0.5}s;
        border-radius:${Math.random()>0.5?'50%':'3px'};`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }, i * 20);
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg, cls = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className   = `toast ${cls} show`;
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 2000);
}

// ── Level Utilities ───────────────────────────────────────────────────────────
function getLevel(xp) {
  let lv = 1;
  LEVELS.forEach(l => { if (xp >= l.minXP) lv = l.level; });
  return lv;
}
function getLevelName(xp) {
  let n = LEVELS[0].name;
  LEVELS.forEach(l => { if (xp >= l.minXP) n = l.name; });
  return n;
}

// ── Escape HTML ───────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])
  );
}

// ── Result Action Buttons ─────────────────────────────────────────────────────
$('btn-play-again').addEventListener('click',     () => startGame(state.selectedMode));
$('btn-change-subject').addEventListener('click', () => { showScreen('subject'); renderSubjects(); });
$('btn-change-class').addEventListener('click',   () => { showScreen('class');   renderClasses(); });
$('btn-home').addEventListener('click',           () => showScreen('name'));

// ── Init ──────────────────────────────────────────────────────────────────────
showScreen('name');
