/* ========================================
   BRAINSTORM QUIZ - script.js
   ======================================== */
'use strict';

// ── State ──────────────────────────────────────────────────────────────────
const state = {
  playerName: '',
  selectedClass: null,
  selectedSubject: null,
  selectedMode: null,
  selectedDifficulty: 'all',
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
const XP_CORRECT   = 10;
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

// ── Subject Config — same subjects for ALL classes ──────────────────────────
// Mix subject is always available for every class
const SUBJECTS_ALL = [
  { name: 'English',      icon: '📖', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Hindi',        icon: '🇮🇳', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Math',         icon: '🔢', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Science',      icon: '🔬', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Computer',     icon: '💻', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'EVS',          icon: '🌿', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'GK',           icon: '🌍', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Economics',    icon: '📊', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Space',        icon: '🚀', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
  { name: 'Animals/Birds',icon: '🦁', classes: [1,2,3,4,5,6,7,8,9,10,11,12] },
];

// ── DOM Refs ────────────────────────────────────────────────────────────────
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

// ── Back Button — visible on ALL pages except home ──────────────────────────
const backBtn = $('back-btn');

// Map: current screen → screen to go back to
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
      if (target === 'class') renderClasses();
    };
  } else {
    backBtn.classList.remove('visible');
  }
}

// ── Animated Background ──────────────────────────────────────────────────────
(function initCanvas() {
  const canvas = $('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const COLORS = ['#FFD700','#FF6B9D','#00E5FF','#B388FF','#00E676','#FF6B35'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 20;
      this.r = Math.random() * 3 + 1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.speed = Math.random() * 0.6 + 0.2;
      this.drift = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.pulse = Math.random() * Math.PI * 2;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.pulse += 0.02;
      this.alpha = 0.2 + Math.sin(this.pulse) * 0.15;
      if (this.y < -20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 12;
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
    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    grad.addColorStop(0, 'rgba(20,10,50,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  loop();
})();

// ── Top Bar Buttons ──────────────────────────────────────────────────────────
$('btn-top-leaderboard').addEventListener('click', () => {
  renderLeaderboard();
  showScreen('leaderboard');
});

$('btn-top-profile').addEventListener('click', () => {
  renderProfile();
  showScreen('profile');
});

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
  const grid = $('class-grid');
  grid.innerHTML = '';
  const icons  = ['🌱','📚','✏️','🎨','🔭','🧮','🔬','🌍','⚗️','📐','🧬','🎓'];
  const colors = ['color-1','color-2','color-3','color-4','color-5','color-6'];
  for (let i = 1; i <= 12; i++) {
    const div = document.createElement('div');
    div.className = `card-item class-card ${colors[(i-1) % 6]}`;
    div.innerHTML = `<span class="card-icon">${icons[i-1]}</span><span class="card-label">Class ${i}</span>`;
    div.setAttribute('role','listitem');
    div.setAttribute('tabindex','0');
    div.addEventListener('click', () => {
      state.selectedClass = i;
      showScreen('subject');
      renderSubjects();
    });
    div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') div.click(); });
    grid.appendChild(div);
  }
}

// ── Step 3: Subject Selection — same subjects for all classes ─────────────────
function renderSubjects() {
  const grid = $('subject-grid');
  grid.innerHTML = '';
  $('subject-class-label').textContent = `Class ${state.selectedClass}`;
  const colors = ['color-1','color-2','color-3','color-4','color-5','color-6'];

  // Mix All Subjects card (always first, for every class)
  const mixDiv = document.createElement('div');
  mixDiv.className = 'card-item mix-card color-1';
  mixDiv.setAttribute('role','listitem');
  mixDiv.setAttribute('tabindex','0');
  mixDiv.innerHTML = `<span class="card-icon">🎲</span><span class="card-label">Mix All</span>`;
  mixDiv.title = 'Random questions from every subject';
  mixDiv.addEventListener('click', () => {
    state.selectedSubject = 'Mix';
    showScreen('mode');
  });
  mixDiv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') mixDiv.click(); });
  grid.appendChild(mixDiv);

  // All subjects — same for every class
  SUBJECTS_ALL.forEach((subj, i) => {
    const div = document.createElement('div');
    div.className = `card-item ${colors[(i + 1) % 6]}`;
    div.setAttribute('role','listitem');
    div.setAttribute('tabindex','0');
    div.innerHTML = `<span class="card-icon">${subj.icon}</span><span class="card-label">${subj.name}</span>`;
    div.addEventListener('click', () => {
      state.selectedSubject = subj.name;
      showScreen('mode');
    });
    div.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') div.click(); });
    grid.appendChild(div);
  });
}

// ── Step 4: Mode Selection ───────────────────────────────────────────────────
$('mode-free').addEventListener('click',  () => { state.selectedMode = 'free';  showScreen('difficulty'); });
$('mode-timer').addEventListener('click', () => { state.selectedMode = 'timer'; showScreen('difficulty'); });
$('mode-level').addEventListener('click', () => { state.selectedMode = 'level'; showScreen('difficulty'); });

// Keyboard support for mode cards
['mode-free','mode-timer','mode-level'].forEach(id => {
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') $(id).click(); });
});

// ── Step 5: Difficulty Selection ─────────────────────────────────────────────
['all','easy','medium','hard'].forEach(diff => {
  const el = $('diff-' + diff);
  el.addEventListener('click', () => {
    state.selectedDifficulty = diff;
    startGame(state.selectedMode);
  });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') el.click(); });
});

// ── Load Questions ───────────────────────────────────────────────────────────
async function loadQuestions() {
  try {
    let data = null;

    if (window.QUIZ_DATA && window.QUIZ_DATA[state.selectedClass]) {
      data = window.QUIZ_DATA[state.selectedClass];
    } else {
      const res = await fetch(`data/class${state.selectedClass}.json`);
      data = await res.json();
    }

    let qs;

    if (state.selectedSubject === 'Mix') {
      // Mix: pick from all subjects available in the data
      const perSubject = 5;
      qs = [];
      SUBJECTS_ALL.forEach(subj => {
        let pool = data.questions.filter(q => q.subject === subj.name);
        if (state.selectedDifficulty !== 'all') pool = pool.filter(q => q.level === state.selectedDifficulty);
        pool = shuffle(pool);
        qs.push(...pool.slice(0, perSubject));
      });
      if (qs.length === 0) { showToast('No questions found!', 'wrong-toast'); return []; }
      if (state.selectedMode === 'level') {
        const order = { easy: 0, medium: 1, hard: 2 };
        qs.sort((a, b) => order[a.level] - order[b.level]);
      } else {
        qs = shuffle(qs);
      }
    } else {
      qs = data.questions.filter(q => q.subject === state.selectedSubject);
      if (state.selectedDifficulty !== 'all') qs = qs.filter(q => q.level === state.selectedDifficulty);
      if (qs.length === 0) { showToast('No questions found for this difficulty!', 'wrong-toast'); return []; }
      if (state.selectedMode === 'level') {
        const order = { easy: 0, medium: 1, hard: 2 };
        qs.sort((a, b) => order[a.level] - order[b.level]);
      } else {
        qs = shuffle(qs);
      }
    }

    return qs;
  } catch (e) {
    showToast('Could not load questions. Try another subject!', 'wrong-toast');
    return [];
  }
}

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
  state.score = 0;
  state.xp = 0;
  state.level = 1;
  state.currentIdx = 0;
  state.correctCount = 0;

  const qs = await loadQuestions();
  if (!qs.length) { showScreen('subject'); return; }
  state.questions = qs;

  showScreen('quiz');
  const diffEmoji = { all:'🌈', easy:'😊', medium:'🤔', hard:'🔥' };
  $('nav-level').textContent = `Lv.${state.level} ${diffEmoji[state.selectedDifficulty] || ''}`;
  updateQuizMeta();
  renderQuestion();
}

// ── Render Question ───────────────────────────────────────────────────────────
function renderQuestion() {
  clearTimer();
  state.answered = false;

  const q     = state.questions[state.currentIdx];
  const total = state.questions.length;

  const pct = (state.currentIdx / total) * 100;
  $('progress-fill').style.width = pct + '%';
  $('progress-label').textContent = `Question ${state.currentIdx + 1} of ${total}`;

  $('question-number').textContent = `Q${state.currentIdx + 1}`;
  const diffClass = `diff-${q.level}`;
  $('question-difficulty').className = `difficulty-pill ${diffClass}`;
  $('question-difficulty').textContent = q.level;
  $('question-text').textContent = q.question;

  const subjTag = $('question-subject-tag');
  if (state.selectedSubject === 'Mix') {
    const subjInfo = SUBJECTS_ALL.find(s => s.name === q.subject);
    const icon = subjInfo ? subjInfo.icon : '📚';
    subjTag.textContent = `${icon} ${q.subject}`;
    subjTag.style.display = 'inline-block';
  } else {
    subjTag.style.display = 'none';
  }

  const optLetters = ['A','B','C','D'];
  const opts = shuffle(q.options.map((o) => ({ text: o })));
  const optGrid = $('options-grid');
  optGrid.innerHTML = '';
  opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.answer = opt.text;
    btn.innerHTML = `<span class="option-label">${optLetters[i]}</span><span>${opt.text}</span>`;
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

  const isCorrect = chosen === correct;
  const allBtns   = document.querySelectorAll('.option-btn');

  allBtns.forEach(b => {
    b.classList.add('disabled');
    if (b.dataset.answer === correct) b.classList.add('correct');
  });

  if (isCorrect) {
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
    if (state.timeLeft <= 0) {
      clearTimer();
      if (!state.answered) autoFail();
    }
  }, 1000);
}

function autoFail() {
  state.answered = true;
  const allBtns  = document.querySelectorAll('.option-btn');
  const q        = state.questions[state.currentIdx];
  allBtns.forEach(b => {
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
  const pct = state.timeLeft / state.totalTime;
  const r   = 21, circ = 2 * Math.PI * r;
  const bar = document.querySelector('.timer-bar');
  bar.style.strokeDasharray  = circ;
  bar.style.strokeDashoffset = circ * (1 - pct);
  bar.style.stroke = pct > 0.5 ? 'var(--accent-green)' : pct > 0.25 ? 'var(--accent-yellow)' : 'var(--wrong)';
  $('timer-text').textContent = state.timeLeft;
}

// ── Update Quiz Meta ──────────────────────────────────────────────────────────
function updateQuizMeta() {
  $('badge-score').textContent = `⭐ ${state.score}`;
  $('badge-xp').textContent    = `✨ ${state.xp} XP`;
  $('nav-level').textContent   = `Lv.${state.level}`;
}

// ── Next Question / End ───────────────────────────────────────────────────────
$('btn-next').addEventListener('click', () => {
  state.currentIdx++;
  if (state.currentIdx >= state.questions.length) {
    endGame();
  } else {
    renderQuestion();
  }
});

// ── End Game ─────────────────────────────────────────────────────────────────
function endGame() {
  clearTimer();
  const total    = state.questions.length;
  const accuracy = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;

  saveScore({
    name: state.playerName,
    class: state.selectedClass,
    subject: state.selectedSubject,
    mode: state.selectedMode,
    score: state.score,
    xp: state.xp,
    accuracy,
    date: new Date().toLocaleDateString()
  });

  $('result-player').textContent = state.playerName;
  const subjectLabel = state.selectedSubject === 'Mix' ? '🎲 Mix All Subjects' : state.selectedSubject;
  const modeLabel    = state.selectedMode === 'free' ? 'Free Play' : state.selectedMode === 'timer' ? 'Timer Mode' : 'Level Mode';
  const diffLabel    = state.selectedDifficulty === 'all' ? 'All Levels' : state.selectedDifficulty.charAt(0).toUpperCase() + state.selectedDifficulty.slice(1);
  $('result-meta').textContent    = `Class ${state.selectedClass} • ${subjectLabel} • ${modeLabel} • ${diffLabel}`;
  $('result-score').textContent   = `${state.score}/${total}`;
  $('result-xp').textContent      = state.xp;
  $('result-level').textContent   = getLevelName(state.xp);
  $('result-accuracy').textContent = accuracy + '%';

  const pct    = state.score / total;
  const avatar = pct >= 0.8 ? '🏆' : pct >= 0.6 ? '🌟' : pct >= 0.4 ? '😊' : '💪';
  $('result-avatar').textContent = avatar;

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
  lb.forEach((entry, i) => {
    const li   = document.createElement('li');
    li.className = 'lb-item';
    li.style.animationDelay = `${i * 0.05}s`;
    const rank = i < 3
      ? `<span class="lb-rank rank-${i+1}">${['🥇','🥈','🥉'][i]}</span>`
      : `<span class="lb-rank" style="color:var(--text-muted)">${i+1}</span>`;
    li.innerHTML = `${rank}<div class="lb-info"><div class="lb-name">${escHtml(entry.name)}</div><div class="lb-sub">Class ${entry.class} • ${escHtml(entry.subject)} • ${entry.date}</div></div><div class="lb-score">${entry.score}</div>`;
    list.appendChild(li);
  });
}

// ── Profile ───────────────────────────────────────────────────────────────────
function renderProfile() {
  const lb  = JSON.parse(localStorage.getItem('brainstorm_lb') || '[]');
  const name = state.playerName || 'Player';

  // Filter entries for current player
  const myEntries = lb.filter(e => e.name === name);

  // Stats
  const games     = myEntries.length;
  const bestScore = games ? Math.max(...myEntries.map(e => e.score)) : 0;
  const avgAcc    = games ? Math.round(myEntries.reduce((s, e) => s + (e.accuracy || 0), 0) / games) : 0;
  const totalXP   = myEntries.reduce((s, e) => s + (e.xp || 0), 0);

  $('profile-name').textContent       = name;
  $('profile-level-label').textContent = `${getLevelName(totalXP)} • ${totalXP} XP`;
  $('profile-games').textContent      = games;
  $('profile-best').textContent       = bestScore;
  $('profile-accuracy').textContent   = avgAcc + '%';
  $('profile-total-xp').textContent   = totalXP;

  // Avatar based on level
  const avatarMap = ['🌱','📚','🎓','🔬','⚗️','🏆','👑'];
  const lv = getLevel(totalXP);
  $('profile-avatar').textContent = avatarMap[lv - 1] || '🧠';

  // Recent games
  const hist = $('profile-history');
  hist.innerHTML = '';
  if (!myEntries.length) {
    hist.innerHTML = '<li style="text-align:center;color:var(--text-muted);padding:16px;">No games yet!</li>';
    return;
  }
  // Show last 5 games in reverse order
  [...myEntries].reverse().slice(0, 5).forEach((entry, i) => {
    const li = document.createElement('li');
    li.className = 'lb-item';
    li.style.animationDelay = `${i * 0.05}s`;
    li.innerHTML = `
      <span class="lb-rank">${i + 1}</span>
      <div class="lb-info">
        <div class="lb-name">Class ${entry.class} • ${escHtml(entry.subject)}</div>
        <div class="lb-sub">${entry.mode || ''} • ${entry.date}</div>
      </div>
      <div class="lb-score">${entry.score} ⭐</div>`;
    hist.appendChild(li);
  });
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Confetti ───────────────────────────────────────────────────────────────
function launchConfetti() {
  const colors = ['#FFD700','#FF6B9D','#00E5FF','#B388FF','#00E676','#FF6B35','#fff'];
  for (let i = 0; i < 120; i++) {
    setTimeout(() => {
      const el  = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.cssText = `
        left:${Math.random()*100}vw;
        top:-20px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        width:${Math.random()*10+6}px;
        height:${Math.random()*14+8}px;
        transform:rotate(${Math.random()*360}deg);
        animation-duration:${Math.random()*2+2}s;
        animation-delay:${Math.random()*0.5}s;
        border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
      `;
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

// ── Level Utils ───────────────────────────────────────────────────────────
function getLevel(xp) {
  let lv = 1;
  LEVELS.forEach(l => { if (xp >= l.minXP) lv = l.level; });
  return lv;
}
function getLevelName(xp) {
  let name = LEVELS[0].name;
  LEVELS.forEach(l => { if (xp >= l.minXP) name = l.name; });
  return name;
}

// ── Result Actions ────────────────────────────────────────────────────────────
$('btn-play-again').addEventListener('click',     () => startGame(state.selectedMode));
$('btn-change-subject').addEventListener('click', () => { showScreen('subject'); renderSubjects(); });
$('btn-change-class').addEventListener('click',   () => { showScreen('class');   renderClasses(); });
$('btn-home').addEventListener('click',           () => showScreen('name'));

// ── Leaderboard ───────────────────────────────────────────────────────────────
$('btn-lb-clear').addEventListener('click', () => {
  if (confirm('Clear all leaderboard data?')) {
    localStorage.removeItem('brainstorm_lb');
    renderLeaderboard();
  }
});

// ── Init ────────────────────────────────────────────────────────────────────
showScreen('name');
