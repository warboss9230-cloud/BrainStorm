// ===== QUIZSTORM SECURITY.JS =====
// Loads BEFORE script.js — all security features

(function() {
  'use strict';

  // ========== 1. DEVTOOLS DETECTION & BLOCK ==========
  const DEVTOOLS_THRESHOLD = 160;
  let devtoolsOpen = false;

  function checkDevTools() {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (widthDiff > DEVTOOLS_THRESHOLD || heightDiff > DEVTOOLS_THRESHOLD) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        handleDevToolsOpen();
      }
    } else {
      devtoolsOpen = false;
    }
  }

  function handleDevToolsOpen() {
    // Clear sensitive data from memory
    try {
      console.clear();
      // Flood console to make it unusable
      const msg = '%c🔐 QuizStorm — DevTools Disabled! Cheating is not allowed.';
      const style = 'font-size:20px;color:red;font-weight:bold;background:#1a1a2e;padding:10px 20px;border-radius:8px;';
      setInterval(() => console.log(msg, style), 100);
    } catch(e) {}
    showDevToolsWarning();
  }

  function showDevToolsWarning() {
    const el = document.createElement('div');
    el.id = 'devtools-warning';
    el.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:99999;
      display:flex;align-items:center;justify-content:center;flex-direction:column;
      font-family:'Nunito',sans-serif;color:white;text-align:center;padding:30px;
    `;
    el.innerHTML = `
      <div style="font-size:5rem;margin-bottom:16px;">🔐</div>
      <h1 style="font-size:1.8rem;color:#ff6584;margin-bottom:10px;font-family:'Fredoka One',cursive;">DevTools Detected!</h1>
      <p style="font-size:1rem;color:#aaa;max-width:320px;line-height:1.6;margin-bottom:20px;">
        Developer Tools are not allowed during quiz.<br>
        Please close DevTools to continue playing.
      </p>
      <div style="font-size:0.85rem;color:#666;">This action has been logged. ⚠️</div>
    `;
    document.body.appendChild(el);

    // Check every second — remove warning if devtools closed
    const interval = setInterval(() => {
      const w = window.outerWidth  - window.innerWidth;
      const h = window.outerHeight - window.innerHeight;
      if (w <= DEVTOOLS_THRESHOLD && h <= DEVTOOLS_THRESHOLD) {
        devtoolsOpen = false;
        const warn = document.getElementById('devtools-warning');
        if (warn) warn.remove();
        clearInterval(interval);
      }
    }, 500);
  }

  // Debugger trap — pauses execution if DevTools open
  function debuggerTrap() {
    try {
      (function() {
        const start = new Date();
        // eslint-disable-next-line no-debugger
        debugger;
        const end = new Date();
        if (end - start > 100) handleDevToolsOpen();
      })();
    } catch(e) {}
  }

  // Disable common keyboard shortcuts for DevTools
  document.addEventListener('keydown', function(e) {
    // F12
    if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); return false; }
    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && ['I','J','C','K'].includes(e.key.toUpperCase())) {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toUpperCase() === 'U') {
      e.preventDefault(); e.stopPropagation(); return false;
    }
    // Ctrl+S (save page)
    if (e.ctrlKey && e.key.toUpperCase() === 'S') {
      e.preventDefault(); return false;
    }
  }, true);

  // Run devtools check every 1.5 seconds
  setInterval(checkDevTools, 1500);
  setInterval(debuggerTrap, 5000);


  // ========== 2. RIGHT-CLICK & COPY DISABLE ==========
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showSecToast('🔐 Right-click is disabled!');
    return false;
  });

  document.addEventListener('copy',  function(e) { e.preventDefault(); showSecToast('📋 Copy is disabled!'); });
  document.addEventListener('cut',   function(e) { e.preventDefault(); });
  document.addEventListener('paste', function(e) {
    // Allow paste only in name input
    if (e.target.id !== 'player-name') e.preventDefault();
  });

  // Disable text selection on non-input elements
  document.addEventListener('selectstart', function(e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

  // Disable drag
  document.addEventListener('dragstart', function(e) { e.preventDefault(); });


  // ========== 3. SESSION TIMEOUT (10 min inactivity) ==========
  const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
  let sessionTimer = null;
  let lastActivity  = Date.now();
  let sessionActive = false;

  function resetActivityTimer() {
    lastActivity = Date.now();
    if (sessionTimer) clearTimeout(sessionTimer);
    if (sessionActive) {
      sessionTimer = setTimeout(triggerSessionTimeout, SESSION_TIMEOUT_MS);
    }
  }

  function triggerSessionTimeout() {
    const overlay = document.getElementById('session-timeout-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  // Activity events
  ['mousemove','keydown','click','touchstart','scroll'].forEach(evt => {
    document.addEventListener(evt, resetActivityTimer, { passive: true });
  });

  // Start session timer when quiz begins (called from script.js)
  window.startSessionTimer = function() {
    sessionActive = true;
    resetActivityTimer();
  };

  window.stopSessionTimer = function() {
    sessionActive = false;
    if (sessionTimer) clearTimeout(sessionTimer);
  };

  window.resetSession = function() {
    const overlay = document.getElementById('session-timeout-overlay');
    if (overlay) overlay.classList.add('hidden');
    sessionActive = false;
    // Go to home
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const home = document.getElementById('screen-home');
    if (home) home.classList.add('active');
    window.scrollTo(0, 0);
  };


  // ========== 4. TAB SWITCH DETECTION ==========
  let tabSwitchCount = 0;
  const MAX_TAB_SWITCHES = 3;
  let quizActive = false;

  window.setQuizActive = function(val) { quizActive = val; };

  document.addEventListener('visibilitychange', function() {
    if (!quizActive) return;
    if (document.hidden) {
      tabSwitchCount++;
      const overlay = document.getElementById('tab-warning-overlay');
      const counter = document.getElementById('tab-counter');
      const msg     = document.getElementById('tab-warn-msg');
      if (overlay) {
        if (msg) msg.innerHTML = tabSwitchCount >= MAX_TAB_SWITCHES
          ? '⚠️ Maximum tab switches reached!<br>Quiz will be terminated.'
          : `You switched tabs during quiz!<br>This has been recorded.`;
        if (counter) counter.textContent = `Warnings: ${tabSwitchCount}/${MAX_TAB_SWITCHES}`;
        overlay.classList.remove('hidden');
      }
      if (tabSwitchCount >= MAX_TAB_SWITCHES) {
        setTimeout(() => {
          window.setQuizActive(false);
          document.getElementById('tab-warning-overlay')?.classList.add('hidden');
          // Force end quiz
          if (typeof endGame === 'function') endGame();
          else {
            document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
            document.getElementById('screen-home')?.classList.add('active');
          }
        }, 2000);
      }
    }
  });

  window.dismissTabWarning = function() {
    document.getElementById('tab-warning-overlay')?.classList.add('hidden');
  };

  window.resetTabCount = function() { tabSwitchCount = 0; };


  // ========== 5. ANSWER ENCRYPTION ==========
  // Simple XOR cipher — answers stored encoded, decoded only at answer-check time
  const CIPHER_KEY = 'QS2025SEC';

  window.encryptAnswer = function(text) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length));
    }
    return btoa(result);
  };

  window.decryptAnswer = function(encoded) {
    try {
      const text = atob(encoded);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ CIPHER_KEY.charCodeAt(i % CIPHER_KEY.length));
      }
      return result;
    } catch(e) { return ''; }
  };

  window.checkAnswer = function(chosen, encryptedCorrect) {
    return chosen === window.decryptAnswer(encryptedCorrect);
  };


  // ========== 6. LOCALSTORAGE TAMPER DETECTION ==========
  const STORAGE_KEY   = 'qs_player_v2';
  const CHECKSUM_KEY  = 'qs_checksum';
  const MAX_XP        = 99999;
  const MAX_STREAK    = 9999;

  function generateChecksum(data) {
    // Simple hash of the stringified data
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  window.saveSecureStorage = function(data) {
    try {
      const checksum = generateChecksum(data);
      localStorage.setItem(STORAGE_KEY,  JSON.stringify(data));
      localStorage.setItem(CHECKSUM_KEY, checksum);
    } catch(e) {}
  };

  window.loadSecureStorage = function() {
    try {
      const raw      = localStorage.getItem(STORAGE_KEY);
      const checksum = localStorage.getItem(CHECKSUM_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const expected = generateChecksum(data);
      if (checksum !== expected) {
        // Tamper detected!
        handleTamper('Checksum mismatch — data was modified externally!');
        return null;
      }
      // Sanity check values
      if (data.xp > MAX_XP || data.maxStreak > MAX_STREAK || data.xp < 0) {
        handleTamper('Impossible values detected in saved data!');
        return null;
      }
      return data;
    } catch(e) { return null; }
  };

  function handleTamper(reason) {
    console.warn('Security: Tamper detected —', reason);
    // Clear corrupted storage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CHECKSUM_KEY);
    // Show alert
    const overlay = document.getElementById('tamper-overlay');
    const msg     = document.getElementById('tamper-msg');
    if (msg) msg.innerHTML = `⚠️ ${reason}<br><br>Your data has been reset for security.`;
    if (overlay) overlay.classList.remove('hidden');
  }

  window.closeTamperAlert = function() {
    document.getElementById('tamper-overlay')?.classList.add('hidden');
  };


  // ========== 7. SCORE MANIPULATION BLOCK ==========
  // Intercept localStorage.setItem to validate XP changes
  const _origSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value) {
    if (key === STORAGE_KEY) {
      try {
        const data = JSON.parse(value);
        // Block impossible XP jumps (more than 100 per save = suspicious)
        const prev = localStorage.getItem(STORAGE_KEY);
        if (prev) {
          const prevData = JSON.parse(prev);
          const xpDiff = (data.xp || 0) - (prevData.xp || 0);
          if (xpDiff > 100) {
            handleTamper(`Suspicious XP jump: +${xpDiff} XP at once!`);
            return;
          }
        }
        // Block negative XP below 0
        if (data.xp < 0) data.xp = 0;
        // Block XP above max
        if (data.xp > MAX_XP) { handleTamper('XP exceeds maximum allowed value!'); return; }
        _origSetItem(key, JSON.stringify(data));
        // Update checksum
        _origSetItem(CHECKSUM_KEY, generateChecksum(data));
        return;
      } catch(e) {}
    }
    _origSetItem(key, value);
  };


  // ========== 8. SECURITY TOAST ==========
  function showSecToast(msg) {
    const existing = document.getElementById('sec-toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'sec-toast';
    t.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1a1a2e;color:#ff6584;border:2px solid #ff6584;
      border-radius:12px;padding:10px 20px;font-family:'Nunito',sans-serif;
      font-weight:800;font-size:.9rem;z-index:9999;white-space:nowrap;
      animation:toastIn .3s ease,toastOut .4s ease 1.6s forwards;
      pointer-events:none;box-shadow:0 4px 20px rgba(255,101,132,.3);
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }


  // ========== 9. PRINT DISABLE ==========
  window.addEventListener('beforeprint', function(e) {
    e.preventDefault();
    document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:sans-serif;"><h1>🔐 Printing Disabled</h1><p>QuizStorm content cannot be printed.</p></div>';
  });


  // ========== 10. CONSOLE WARNING ==========
  const _warn = console.warn.bind(console);
  setTimeout(() => {
    console.log('%c⚡ QuizStorm', 'font-size:28px;font-weight:bold;color:#6c63ff;');
    console.log('%c🔐 Security Active', 'font-size:14px;color:#ff6584;font-weight:bold;');
    console.log('%c⚠️  This console is for developers only. Attempting to manipulate game data will result in score reset!', 'font-size:12px;color:#f7971e;');
  }, 1000);

  console.warn = function(...args) {
    if (args[0] && args[0].toString().includes('Security:')) {
      _warn(...args); // allow our own warnings
    }
    // suppress other warnings in production
  };

  // ========== EXPOSE SECURITY STATUS ==========
  window.QSSecurity = {
    version: '1.0',
    features: ['devtools-block','right-click-disable','session-timeout',
                'tab-switch-detect','answer-encrypt','tamper-detect',
                'score-protect','print-disable'],
    tabSwitches: () => tabSwitchCount,
    isDevToolsOpen: () => devtoolsOpen,
  };

})(); // End IIFE
