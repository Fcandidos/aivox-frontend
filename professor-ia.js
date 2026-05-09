// ============================================================
//  PROFESSOR IA — AIVOX
//  Aula particular imersiva com professora animada + lousa
//  Integrado ao index.html via <script src="professor-ia.js">
//  Endpoint backend: POST /api/professor  (server.js)
// ============================================================
'use strict';

// ── CSS injection ─────────────────────────────────────────────
(function injectStyles() {
  const s = document.createElement('style');
  s.id = 'profIA-styles';
  s.textContent = `
/* ── Setup panel options ── */
.profIA-opt {
  padding: 12px 10px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  transition: all .18s;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  user-select: none;
}
.profIA-opt:hover { border-color: rgba(124,58,237,.4); color: var(--text); }
.profIA-opt.active { border-color: rgba(124,58,237,.5); background: rgba(124,58,237,.12); color: var(--text); box-shadow: 0 0 0 1px rgba(124,58,237,.2); }
.profIA-lang {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  transition: all .15s;
  user-select: none;
}
.profIA-lang.active { border-color: rgba(0,229,255,.45); color: var(--accent); background: rgba(0,229,255,.08); }

/* ── Overlay classroom ── */
#profIA-overlay {
  background: #12130f;
  display: flex;
  flex-direction: column;
  font-family: 'Outfit', sans-serif;
  color: #e8eaf2;
  overflow: hidden;
}

/* ── HUD ── */
#profIA-hud {
  position: absolute;
  top: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(180deg, rgba(0,0,0,.75) 0%, transparent 100%);
  gap: 10px;
}
.profIA-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0,0,0,.5);
  border: 1px solid rgba(255,255,255,.08);
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.profIA-badge.level  { border-color: rgba(0,229,255,.3); color: #00e5ff; }
.profIA-badge.mode   { border-color: rgba(124,58,237,.3); color: #c4b5fd; }
.profIA-badge.timer  { font-family: 'Space Mono', monospace; color: rgba(255,255,255,.5); }
.profIA-score-wrap { display: flex; align-items: center; gap: 8px; }
.profIA-score-bar {
  width: 70px;
  height: 5px;
  background: rgba(255,255,255,.1);
  border-radius: 3px;
  overflow: hidden;
}
.profIA-score-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #00ff88);
  border-radius: 3px;
  transition: width .8s ease;
  width: 50%;
}
#profIA-end-btn {
  padding: 4px 12px;
  background: rgba(255,68,102,.1);
  border: 1px solid rgba(255,68,102,.3);
  border-radius: 20px;
  color: #ff4466;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: background .15s;
  white-space: nowrap;
}
#profIA-end-btn:hover { background: rgba(255,68,102,.2); }

/* ── Classroom SVG scene ── */
#profIA-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
#profIA-chalkboard-text {
  position: absolute;
  z-index: 15;
  font-family: 'Space Mono', monospace;
  font-size: clamp(11px, 1.6vw, 15px);
  color: #e0f0dc;
  text-align: center;
  line-height: 1.7;
  white-space: pre-wrap;
  pointer-events: none;
}
#profIA-chalkboard-text .cht-yellow { color: #ffe07a; }
#profIA-chalkboard-text .cht-red    { color: #ffaaaa; text-decoration: line-through; }
#profIA-chalkboard-text .cht-green  { color: #a0ff88; }

/* ── Professor stage ── */
#profIA-prof-stage {
  position: absolute;
  bottom: 28%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  transition: transform 1.1s cubic-bezier(.4,0,.2,1);
  transform-origin: bottom center;
}
#profIA-prof-stage.pos-center  { transform: translateX(-50%); }
#profIA-prof-stage.pos-board   { transform: translateX(calc(-50% - 30vw)); }
#profIA-prof-stage.pos-left    { transform: translateX(calc(-50% - 15vw)); }
#profIA-prof-stage.pos-right   { transform: translateX(calc(-50% + 15vw)); }

#profIA-svg {
  animation: profIA-breathe 4s ease-in-out infinite;
  width: clamp(120px, 18vw, 220px);
  height: auto;
  display: block;
}
@keyframes profIA-breathe {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-3px); }
}
/* Eye blink */
@keyframes profIA-blink {
  0%, 94%, 100% { transform: scaleY(1); }
  97%            { transform: scaleY(0.08); }
}
.profIA-eye { animation: profIA-blink 5s ease-in-out infinite; transform-origin: center; }
.profIA-eye:last-of-type { animation-delay: .08s; }

/* Arm gestures (right arm) */
#profIA-arm-r {
  transform-origin: 188px 212px;
  transition: transform .5s ease;
}
#profIA-arm-r.writing { transform: rotate(-65deg) translate(8px, -20px); }
#profIA-arm-r.pointing { transform: rotate(-40deg) translate(4px, -10px); }
#profIA-arm-r.raised   { transform: rotate(-18deg) translate(0, -5px); }

/* Head tilt */
#profIA-head {
  transform-origin: 130px 150px;
  transition: transform .4s ease;
}
#profIA-head.listening { transform: rotate(7deg); }
.profIA-nod { animation: profIA-nod .9s ease-in-out; }
@keyframes profIA-nod {
  0%,100% { transform: rotate(0deg); }
  30%     { transform: rotate(-9deg); }
  70%     { transform: rotate(5deg); }
}

/* Glasses glow on approval */
#profIA-glasses.glow { filter: drop-shadow(0 0 6px #00e5ff); transition: filter .3s; }

/* ── Chat log ── */
#profIA-chat {
  position: absolute;
  bottom: 88px;
  right: 12px;
  width: min(320px, 88vw);
  max-height: 240px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 7px;
  overflow-y: auto;
  scrollbar-width: none;
  padding: 6px;
}
#profIA-chat::-webkit-scrollbar { display: none; }
.profIA-bubble {
  padding: 9px 13px;
  border-radius: 14px;
  font-size: 12px;
  line-height: 1.5;
  max-width: 92%;
  animation: profIA-bubble-in .25s cubic-bezier(.34,1.56,.64,1) forwards;
}
@keyframes profIA-bubble-in {
  from { opacity:0; transform: translateY(6px) scale(.95); }
  to   { opacity:1; transform: translateY(0) scale(1); }
}
.profIA-bubble.prof {
  background: rgba(15,20,32,.88);
  border: 1px solid rgba(255,255,255,.07);
  border-bottom-left-radius: 4px;
  backdrop-filter: blur(12px);
  align-self: flex-start;
}
.profIA-bubble.student {
  background: rgba(0,229,255,.1);
  border: 1px solid rgba(0,229,255,.18);
  border-bottom-right-radius: 4px;
  backdrop-filter: blur(12px);
  align-self: flex-end;
  color: #b6f3ff;
}
.profIA-bubble.correction {
  background: rgba(255,208,0,.08);
  border: 1px solid rgba(255,208,0,.2);
  color: #ffe07a;
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  align-self: flex-start;
}

/* ── Voice preview ── */
#profIA-voice-preview {
  position: absolute;
  bottom: 150px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  background: rgba(0,0,0,.75);
  border: 1px solid rgba(0,229,255,.3);
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 12px;
  font-family: 'Space Mono', monospace;
  color: #00e5ff;
  min-width: 180px;
  text-align: center;
  backdrop-filter: blur(12px);
  display: none;
  animation: profIA-preview-pulse 1.5s ease-in-out infinite;
}
@keyframes profIA-preview-pulse {
  0%,100% { border-color: rgba(0,229,255,.3); }
  50%      { border-color: rgba(0,229,255,.7); }
}

/* ── Controls ── */
#profIA-controls {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 10px 16px 16px;
  background: linear-gradient(0deg, rgba(0,0,0,.8) 0%, transparent 100%);
}
#profIA-mic-btn {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #7c3aed, #00e5ff);
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(0,229,255,.28);
  transition: all .18s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
#profIA-mic-btn::before {
  content:'';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(0,229,255,.25);
  transition: all .2s;
}
#profIA-mic-btn:hover { transform: scale(1.05); box-shadow: 0 8px 32px rgba(0,229,255,.38); }
#profIA-mic-btn.recording {
  background: linear-gradient(135deg, #ff4466, #ff8800);
  box-shadow: 0 6px 24px rgba(255,68,102,.5);
  animation: profIA-mic-pulse 1s ease-in-out infinite;
}
@keyframes profIA-mic-pulse {
  0%,100% { box-shadow: 0 6px 24px rgba(255,68,102,.4); }
  50%      { box-shadow: 0 6px 40px rgba(255,68,102,.7); }
}
#profIA-mic-btn.processing {
  background: linear-gradient(135deg, #ffd000, #ff8800);
  animation: profIA-process-spin 1s linear infinite;
}
@keyframes profIA-process-spin { to { filter: hue-rotate(360deg); } }
.profIA-ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(15,20,32,.8);
  color: rgba(255,255,255,.5);
  font-size: 16px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all .18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.profIA-ctrl-btn:hover { border-color: rgba(255,255,255,.18); color: #e8eaf2; }
#profIA-text-wrap {
  flex: 1;
  max-width: 260px;
  display: none;
  gap: 6px;
  align-items: center;
}
#profIA-text-wrap.open { display: flex; }
#profIA-text-input {
  flex: 1;
  padding: 0 14px;
  height: 44px;
  background: rgba(15,20,32,.85);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 22px;
  color: #e8eaf2;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  outline: none;
  backdrop-filter: blur(10px);
  transition: border-color .2s;
}
#profIA-text-input:focus { border-color: rgba(0,229,255,.4); }

/* ── Report modal ── */
#profIA-report {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: rgba(0,0,0,.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  display: none;
  backdrop-filter: blur(8px);
}
.profIA-report-card {
  background: #131825;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 24px;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,.7);
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: none;
}
.profIA-report-card::-webkit-scrollbar { display: none; }
.profIA-report-hdr {
  padding: 24px 24px 20px;
  background: linear-gradient(135deg, rgba(124,58,237,.25), rgba(0,229,255,.1));
  border-bottom: 1px solid rgba(255,255,255,.07);
  text-align: center;
}
.profIA-xp-banner {
  background: linear-gradient(135deg, rgba(0,255,136,.1), rgba(0,229,255,.1));
  border: 1px solid rgba(0,255,136,.2);
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  margin: 16px 24px 0;
}
.profIA-xp-num {
  font-size: 38px;
  font-weight: 900;
  background: linear-gradient(135deg, #00ff88, #00e5ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.profIA-stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px 24px 0;
}
.profIA-stat {
  background: #0f1420;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}
.profIA-stat-val { font-size: 20px; font-weight: 800; }
.profIA-stat-lbl { font-size: 10px; color: rgba(255,255,255,.4); font-family: 'Space Mono', monospace; margin-top: 2px; }
.profIA-report-section { padding: 14px 24px 0; }
.profIA-report-section-lbl { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
.profIA-error-item, .profIA-word-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  margin: 3px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.08);
}
.profIA-report-actions {
  display: flex;
  gap: 10px;
  padding: 20px 24px 24px;
  border-top: 1px solid rgba(255,255,255,.07);
  margin-top: 16px;
}
.profIA-btn-again {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #7c3aed, #00e5ff);
  border: none;
  border-radius: 14px;
  color: white;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
}
.profIA-btn-back {
  flex: 1;
  padding: 12px;
  background: #0f1420;
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 14px;
  color: #e8eaf2;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
}
.profIA-btn-back:hover { border-color: rgba(255,255,255,.15); }

/* ── Toasts (inside overlay) ── */
#profIA-toasts {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}
.profIA-toast {
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(15,20,32,.95);
  border: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(20px);
  white-space: nowrap;
  animation: profIA-toast-in .25s ease, profIA-toast-out .25s ease 2.75s forwards;
}
.profIA-toast.success { border-color: rgba(0,255,136,.4); color: #00ff88; }
.profIA-toast.info    { border-color: rgba(0,229,255,.4); color: #00e5ff; }
.profIA-toast.warn    { border-color: rgba(255,208,0,.4); color: #ffd000; }
@keyframes profIA-toast-in  { from { opacity:0; transform: scale(.9); } to { opacity:1; transform: scale(1); } }
@keyframes profIA-toast-out { from { opacity:1; } to { opacity:0; } }
`;
  document.head.appendChild(s);
})();

// ── State ─────────────────────────────────────────────────────
const PISTATE = {
  level: 'Básico',
  mode: 'Conversa livre',
  lang: 'English',
  active: false,
  phase: 'warmup',
  history: [],
  errors: [],
  newWords: [],
  score: 50,
  chalkUses: 0,
  turns: 0,
  startTime: null,
  timerRef: null,
};

const PIAVATAR = {
  expr: 'waiting',
  gesture: 'neutral',
  pos: 'center',
  talking: false,
  talkRef: null,
  blinkRef: null,
};

const PISPEECH = {
  rec:       null,   // SpeechRecognizer (Azure) ou SpeechRecognition (fallback WebSpeech)
  synth:     null,   // reservado para compatibilidade
  voices:    [],     // vozes WebSpeech (fallback)
  recording: false,
  speaking:  false,
  textOpen:  false,
};

// ── Setup panel helpers ───────────────────────────────────────
function profIA_sel(type, el) {
  const parentMap = { level: '#ltp-professor .profIA-opt[data-val]', mode: '#ltp-professor .profIA-opt[data-val]' };
  if (type === 'lang') {
    document.querySelectorAll('.profIA-lang').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    PISTATE.lang = el.dataset.val;
    return;
  }
  // level or mode: deselect siblings in same grid
  const grid = el.closest('[style*="grid"]');
  if (grid) grid.querySelectorAll('.profIA-opt').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  if (type === 'level') PISTATE.level = el.dataset.val;
  if (type === 'mode')  PISTATE.mode  = el.dataset.val;
}

function profIA_onTabOpen() {
  const last = localStorage.getItem('profIA_lastSession');
  const el = document.getElementById('profIA-last-info');
  if (!last || !el) return;
  try {
    const d = JSON.parse(last);
    el.style.display = 'block';
    const m = String(Math.floor((d.duration||0)/60)).padStart(2,'0');
    const s = String((d.duration||0)%60).padStart(2,'0');
    el.innerHTML = `📖 <strong>Última sessão:</strong> ${d.level} · ${d.mode} · ${m}:${s} · Score ${d.score}/100${d.words?.length ? ' · 📚 '+d.words.slice(0,3).join(', ') : ''}`;
  } catch(_) {}
}

// ── Enter classroom ───────────────────────────────────────────
function profIA_enter() {
  profIA_unlockAudio(); // iOS: botão "Iniciar aula" é toque do usuário — desbloqueia aqui
  const overlay = document.getElementById('profIA-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  overlay.innerHTML = profIA_buildOverlayHTML();
  requestAnimationFrame(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .5s ease';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
  });
  PISTATE.active = true;
  PISTATE.phase = 'warmup';
  PISTATE.history = [];
  PISTATE.errors = [];
  PISTATE.newWords = [];
  PISTATE.score = 50;
  PISTATE.chalkUses = 0;
  PISTATE.turns = 0;
  PISTATE.startTime = Date.now();
  // Init avatar, timer, speech voices, blink
  if (PISPEECH.synth?.onvoiceschanged !== undefined) {
    PISPEECH.synth.onvoiceschanged = () => { PISPEECH.voices = PISPEECH.synth.getVoices(); };
  }
  PISPEECH.voices = PISPEECH.synth?.getVoices() || [];
  profIA_startTimer();
  profIA_startBlink();
  // Detect no speech API → open text input automatically
  // Fase 1A: Azure SDK é preferido, WebSpeech é fallback
  const hasAzureSDK = typeof SpeechSDK !== 'undefined' && window.AZURE_SPEECH_KEY && window.AZURE_SPEECH_KEY !== '{{AZURE_SPEECH_KEY}}';
  const hasWebSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!hasAzureSDK && !hasWebSpeech) {
    profIA_toggleTextInput(true);
    document.getElementById('profIA-mic-btn').style.opacity = '.3';
    document.getElementById('profIA-mic-btn').style.pointerEvents = 'none';
  }
  // Kickoff welcome message — also seed history so turn 2+ starts with user
  const _initMsg = { role: 'user', content: 'Hello! Start the class.' };
  PISTATE.history.push(_initMsg);
  profIA_callAPI([_initMsg]);
}

// ── Overlay HTML builder ──────────────────────────────────────
function profIA_buildOverlayHTML() {
  const ww = window.innerWidth;
  // Classroom dimensions (relative to viewport)
  const boardX = ww * 0.15, boardW = ww * 0.70, boardH = Math.min(window.innerHeight * 0.33, 220);
  const boardY  = window.innerHeight * 0.09;
  return `
<svg id="profIA-scene" viewBox="0 0 ${ww} ${window.innerHeight}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;">
  <!-- Wall -->
  <rect width="${ww}" height="${Math.round(window.innerHeight * 0.65)}" fill="#1a1a12"/>
  <!-- Wall texture lines -->
  <line x1="0" y1="33%" x2="${ww}" y2="33%" stroke="rgba(255,255,255,.025)" stroke-width="1"/>
  <!-- Left window -->
  <rect x="${ww*0.04}" y="${boardY*0.8}" width="${ww*0.09}" height="${boardH*0.7}" fill="#1a3a5a" rx="3"/>
  <rect x="${ww*0.04}" y="${boardY*0.8}" width="${ww*0.09}" height="${boardH*0.7}" fill="none" stroke="#5c3d1e" stroke-width="5" rx="3"/>
  <line x1="${ww*0.04+ww*0.045}" y1="${boardY*0.8}" x2="${ww*0.04+ww*0.045}" y2="${boardY*0.8+boardH*0.7}" stroke="#5c3d1e" stroke-width="3"/>
  <line x1="${ww*0.04}" y1="${boardY*0.8+boardH*0.35}" x2="${ww*0.04+ww*0.09}" y2="${boardY*0.8+boardH*0.35}" stroke="#5c3d1e" stroke-width="3"/>
  <radialGradient id="wgL" cx="50%" cy="0%" r="100%"><stop offset="0%" stop-color="rgba(100,180,255,.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>
  <rect x="${ww*0.04}" y="${boardY*0.8}" width="${ww*0.09}" height="${boardH*0.7}" fill="url(#wgL)"/>
  <!-- Right window -->
  <rect x="${ww*0.87}" y="${boardY*0.8}" width="${ww*0.09}" height="${boardH*0.7}" fill="#1a3a5a" rx="3"/>
  <rect x="${ww*0.87}" y="${boardY*0.8}" width="${ww*0.09}" height="${boardH*0.7}" fill="none" stroke="#5c3d1e" stroke-width="5" rx="3"/>
  <line x1="${ww*0.87+ww*0.045}" y1="${boardY*0.8}" x2="${ww*0.87+ww*0.045}" y2="${boardY*0.8+boardH*0.7}" stroke="#5c3d1e" stroke-width="3"/>
  <line x1="${ww*0.87}" y1="${boardY*0.8+boardH*0.35}" x2="${ww*0.87+ww*0.09}" y2="${boardY*0.8+boardH*0.35}" stroke="#5c3d1e" stroke-width="3"/>
  <rect x="${ww*0.87}" y="${boardY*0.8}" width="${ww*0.09}" height="${boardH*0.7}" fill="url(#wgL)"/>
  <!-- Chalkboard frame (wood) -->
  <rect x="${boardX-14}" y="${boardY-14}" width="${boardW+28}" height="${boardH+28}" fill="#5c3d1e" rx="5"/>
  <!-- Chalkboard surface -->
  <rect id="profIA-board-rect" x="${boardX}" y="${boardY}" width="${boardW}" height="${boardH}" fill="#1a3a25" rx="2"/>
  <!-- Board subtle lines -->
  <line x1="${boardX}" y1="${boardY+boardH*0.33}" x2="${boardX+boardW}" y2="${boardY+boardH*0.33}" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  <line x1="${boardX}" y1="${boardY+boardH*0.66}" x2="${boardX+boardW}" y2="${boardY+boardH*0.66}" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  <!-- Chalk tray -->
  <rect x="${boardX+boardW*0.2}" y="${boardY+boardH+2}" width="${boardW*0.6}" height="12" fill="#4a2e12" rx="4"/>
  <rect x="${boardX+boardW*0.3}" y="${boardY+boardH+4}" width="18" height="5" fill="#e0f0dc" rx="2" opacity=".7"/>
  <rect x="${boardX+boardW*0.42}" y="${boardY+boardH+4}" width="14" height="5" fill="#ffe07a" rx="2" opacity=".65"/>
  <rect x="${boardX+boardW*0.54}" y="${boardY+boardH+4}" width="16" height="5" fill="#ffaaaa" rx="2" opacity=".6"/>
  <!-- Floor -->
  <rect y="65%" width="${ww}" height="35%" fill="#1e1408"/>
  <!-- Floor boards -->
  <line x1="0" y1="68%" x2="${ww}" y2="68%" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
  <line x1="0" y1="74%" x2="${ww}" y2="74%" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  <line x1="0" y1="80%" x2="${ww}" y2="80%" stroke="rgba(255,255,255,.025)" stroke-width="1"/>
  <!-- Perspective floor lines -->
  <line x1="${ww*0.5}" y1="65%" x2="${ww*0.1}" y2="100%" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  <line x1="${ww*0.5}" y1="65%" x2="${ww*0.3}" y2="100%" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  <line x1="${ww*0.5}" y1="65%" x2="${ww*0.7}" y2="100%" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
  <line x1="${ww*0.5}" y1="65%" x2="${ww*0.9}" y2="100%" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
</svg>

<!-- Chalkboard text overlay (positioned over board) -->
<div id="profIA-chalkboard-text" style="left:${boardX}px;top:${boardY}px;width:${boardW}px;height:${boardH}px;display:flex;align-items:center;justify-content:center;padding:12px 20px;"></div>

<!-- Professor stage -->
<div id="profIA-prof-stage" class="pos-center">
  ${profIA_buildProfSVG()}
</div>

<!-- HUD -->
<div id="profIA-hud">
  <div style="display:flex;gap:7px;align-items:center;flex-wrap:wrap;">
    <div class="profIA-badge level" id="profIA-badge-level">${PISTATE.level}</div>
    <div class="profIA-badge mode" id="profIA-badge-mode">${PISTATE.mode}</div>
  </div>
  <div class="profIA-badge timer" id="profIA-timer">00:00</div>
  <div style="display:flex;gap:8px;align-items:center;">
    <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:4px 10px;">
      <span style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);" id="profIA-score-lbl">50</span>
      <div class="profIA-score-bar"><div class="profIA-score-fill" id="profIA-score-fill"></div></div>
    </div>
    <button id="profIA-end-btn" onclick="profIA_endSession()">✕ Encerrar</button>
  </div>
</div>

<!-- Chat log -->
<div id="profIA-chat"></div>

<!-- Voice preview -->
<div id="profIA-voice-preview"></div>

<!-- Controls -->
<div id="profIA-controls">
  <button class="profIA-ctrl-btn" onclick="profIA_toggleTextInput()" title="Teclado">⌨️</button>
  <div id="profIA-text-wrap">
    <input id="profIA-text-input" placeholder="Escreva aqui..." onkeydown="if(event.key==='Enter')profIA_sendText()">
    <button class="profIA-ctrl-btn" onclick="profIA_sendText()">→</button>
  </div>
  <button id="profIA-mic-btn" onclick="profIA_toggleMic()">🎤</button>
  <button class="profIA-ctrl-btn" onclick="profIA_toggleVoice()" id="profIA-voice-btn" title="Voz da professora">🔊</button>
</div>

<!-- Report overlay -->
<div id="profIA-report"></div>

<!-- Toasts -->
<div id="profIA-toasts"></div>
`;
}

// ── Professor SVG character ───────────────────────────────────
function profIA_buildProfSVG() {
  return `<svg id="profIA-svg" viewBox="0 0 260 480" xmlns="http://www.w3.org/2000/svg">
  <!-- shadow -->
  <ellipse cx="130" cy="470" rx="52" ry="8" fill="rgba(0,0,0,.35)"/>
  <!-- shoes -->
  <ellipse cx="105" cy="454" rx="19" ry="8" fill="#111"/>
  <ellipse cx="155" cy="454" rx="19" ry="8" fill="#111"/>
  <!-- pants -->
  <rect x="96" y="355" width="28" height="102" rx="7" fill="#1e2240"/>
  <rect x="136" y="355" width="28" height="102" rx="7" fill="#1e2240"/>
  <!-- blazer torso -->
  <path d="M72 208 Q72 188 86 180 L100 173 L130 178 L160 173 L174 180 Q188 188 188 208 L192 370 Q192 378 184 378 L76 378 Q68 378 68 370 Z" fill="#6d28d9"/>
  <!-- shirt collar -->
  <path d="M100 173 L116 194 L130 178 Z" fill="#f0f0f0"/>
  <path d="M160 173 L144 194 L130 178 Z" fill="#f0f0f0"/>
  <!-- blazer lapels -->
  <path d="M72 208 L100 173 L116 220 L84 230 Z" fill="#5b21b6"/>
  <path d="M188 208 L160 173 L144 220 L176 230 Z" fill="#5b21b6"/>
  <!-- buttons -->
  <circle cx="130" cy="240" r="4.5" fill="#4c1d95"/>
  <circle cx="130" cy="264" r="4.5" fill="#4c1d95"/>
  <!-- pocket -->
  <rect x="76" y="230" width="22" height="14" rx="3" fill="#5b21b6"/>
  <line x1="76" y1="237" x2="98" y2="237" stroke="#4c1d95" stroke-width="1.5"/>
  <!-- left arm (relaxed) -->
  <g id="profIA-arm-l">
    <path d="M72 210 Q59 232 58 282 Q57 300 64 310" stroke="#6d28d9" stroke-width="19" fill="none" stroke-linecap="round"/>
    <path d="M64 310 Q62 328 66 346" stroke="#6d28d9" stroke-width="17" fill="none" stroke-linecap="round"/>
    <ellipse cx="67" cy="352" rx="11" ry="14" fill="#f0c8a0"/>
    <rect x="58" y="357" width="6" height="14" rx="3" fill="#f0c8a0"/>
    <rect x="65" y="358" width="6" height="16" rx="3" fill="#f0c8a0"/>
    <rect x="72" y="357" width="6" height="14" rx="3" fill="#f0c8a0"/>
    <ellipse cx="54" cy="353" rx="5" ry="8" fill="#f0c8a0" transform="rotate(-20 54 353)"/>
  </g>
  <!-- right arm (animated) -->
  <g id="profIA-arm-r">
    <path d="M188 210 Q201 232 202 282 Q203 300 196 310" stroke="#6d28d9" stroke-width="19" fill="none" stroke-linecap="round"/>
    <path d="M196 310 Q198 328 194 346" stroke="#6d28d9" stroke-width="17" fill="none" stroke-linecap="round"/>
    <ellipse cx="193" cy="352" rx="11" ry="14" fill="#f0c8a0"/>
    <rect x="190" y="357" width="6" height="14" rx="3" fill="#f0c8a0"/>
    <rect x="184" y="358" width="6" height="16" rx="3" fill="#f0c8a0"/>
    <rect x="178" y="357" width="6" height="14" rx="3" fill="#f0c8a0"/>
    <ellipse cx="204" cy="353" rx="5" ry="8" fill="#f0c8a0" transform="rotate(20 204 353)"/>
    <!-- chalk (hidden) -->
    <rect id="profIA-chalk" x="186" y="336" width="24" height="6" rx="3" fill="#e0f0dc" opacity="0" transform="rotate(-15 198 339)"/>
  </g>
  <!-- neck -->
  <rect x="118" y="156" width="24" height="26" rx="8" fill="#f0c8a0"/>
  <!-- HEAD GROUP -->
  <g id="profIA-head">
    <!-- hair back -->
    <ellipse cx="130" cy="106" rx="57" ry="58" fill="#2c1810"/>
    <!-- hair sweep top -->
    <path d="M73 99 Q72 57 100 42 Q115 35 130 33 Q145 35 160 42 Q188 57 187 99" fill="#2c1810"/>
    <!-- face -->
    <ellipse cx="130" cy="113" rx="49" ry="55" fill="#f0c8a0"/>
    <!-- ears -->
    <ellipse cx="81"  cy="118" rx="9" ry="13" fill="#e8b890"/>
    <ellipse cx="179" cy="118" rx="9" ry="13" fill="#e8b890"/>
    <!-- earrings -->
    <circle cx="81"  cy="127" r="4" fill="#00e5ff"/>
    <circle cx="179" cy="127" r="4" fill="#00e5ff"/>
    <!-- hair sides -->
    <path d="M73 80 Q67 112 71 146 Q79 162 85 167 Q75 152 77 121 Z" fill="#2c1810"/>
    <path d="M187 80 Q193 112 189 146 Q181 162 175 167 Q185 152 183 121 Z" fill="#2c1810"/>
    <!-- hair strand -->
    <path d="M118 44 Q122 56 120 69" stroke="#3d2015" stroke-width="5" fill="none" stroke-linecap="round"/>
    <!-- cheeks -->
    <ellipse cx="97"  cy="127" rx="13" ry="8" fill="rgba(255,130,100,.12)"/>
    <ellipse cx="163" cy="127" rx="13" ry="8" fill="rgba(255,130,100,.12)"/>
    <!-- eyebrows -->
    <path id="profIA-brow-l" d="M97 86 Q111 81 118 85" stroke="#2c1810" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path id="profIA-brow-r" d="M142 85 Q149 81 163 86" stroke="#2c1810" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <!-- glasses -->
    <g id="profIA-glasses">
      <rect x="92" y="93" width="34" height="23" rx="7" fill="rgba(0,229,255,.07)" stroke="#444" stroke-width="2.2"/>
      <rect x="134" y="93" width="34" height="23" rx="7" fill="rgba(0,229,255,.07)" stroke="#444" stroke-width="2.2"/>
      <line x1="126" y1="104" x2="134" y2="104" stroke="#444" stroke-width="2.2"/>
      <line x1="92"  y1="104" x2="81"  y2="109" stroke="#444" stroke-width="2.2"/>
      <line x1="168" y1="104" x2="179" y2="109" stroke="#444" stroke-width="2.2"/>
      <line x1="96"  y1="97" x2="101" y2="103" stroke="rgba(255,255,255,.48)" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="138" y1="97" x2="143" y2="103" stroke="rgba(255,255,255,.48)" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <!-- left eye -->
    <g id="profIA-eye-l" class="profIA-eye" style="transform-origin:109px 107px">
      <ellipse cx="109" cy="107" rx="12" ry="10" fill="white"/>
      <circle  cx="109" cy="107" r="7"  fill="#6b3a2a"/>
      <circle  cx="109" cy="107" r="4"  fill="#140800"/>
      <circle  cx="112" cy="104" r="2.2" fill="white"/>
      <ellipse cx="109" cy="101" rx="12" ry="4.5" fill="#f0c8a0"/>
    </g>
    <!-- right eye -->
    <g id="profIA-eye-r" class="profIA-eye" style="transform-origin:151px 107px;animation-delay:.1s">
      <ellipse cx="151" cy="107" rx="12" ry="10" fill="white"/>
      <circle  cx="151" cy="107" r="7"  fill="#6b3a2a"/>
      <circle  cx="151" cy="107" r="4"  fill="#140800"/>
      <circle  cx="154" cy="104" r="2.2" fill="white"/>
      <ellipse cx="151" cy="101" rx="12" ry="4.5" fill="#f0c8a0"/>
    </g>
    <!-- nose -->
    <path d="M127 129 Q130 146 133 129" stroke="#c8906a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="124" cy="143" rx="5" ry="3.5" fill="rgba(0,0,0,.09)"/>
    <ellipse cx="136" cy="143" rx="5" ry="3.5" fill="rgba(0,0,0,.09)"/>
    <!-- mouth -->
    <g id="profIA-mouth">
      <path id="profIA-mouth-top"    d="M114 152 Q122 148 130 152 Q138 148 146 152" fill="#d47070"/>
      <path id="profIA-mouth-bottom" d="M114 152 Q130 163 146 152" fill="#c06060"/>
      <rect id="profIA-teeth" x="118" y="152" width="24" height="8" rx="3" fill="#f5f5f5" display="none"/>
    </g>
    <!-- pointer (hidden) -->
    <line id="profIA-pointer" x1="206" y1="296" x2="255" y2="238" stroke="#7a5c1e" stroke-width="4" stroke-linecap="round" opacity="0"/>
    <circle cx="255" cy="238" r="4.5" fill="#5a3c10" opacity="0"/>
  </g>
</svg>`;
}

// ── Timer ─────────────────────────────────────────────────────
function profIA_startTimer() {
  clearInterval(PISTATE.timerRef);
  PISTATE.timerRef = setInterval(() => {
    const el = document.getElementById('profIA-timer');
    if (!el) return;
    const sec = Math.floor((Date.now() - PISTATE.startTime) / 1000);
    el.textContent = String(Math.floor(sec/60)).padStart(2,'0') + ':' + String(sec%60).padStart(2,'0');
  }, 1000);
}

// ── Score update ──────────────────────────────────────────────
function profIA_updateScore(delta) {
  PISTATE.score = Math.max(0, Math.min(100, PISTATE.score + delta));
  const fill = document.getElementById('profIA-score-fill');
  const lbl  = document.getElementById('profIA-score-lbl');
  if (fill) fill.style.width = PISTATE.score + '%';
  if (lbl)  lbl.textContent  = PISTATE.score;
}

// ── Blink ─────────────────────────────────────────────────────
function profIA_startBlink() {
  const blink = () => {
    const el = document.getElementById('profIA-svg');
    if (!el) return;
    el.querySelectorAll('.profIA-eye').forEach(e => {
      e.style.animation = 'none';
      void e.offsetWidth;
      e.style.animation = '';
    });
    PIAVATAR.blinkRef = setTimeout(blink, 3500 + Math.random() * 3500);
  };
  blink();
}

// ── Avatar controller ─────────────────────────────────────────
function profIA_setPos(pos) {
  PIAVATAR.pos = pos;
  const stage = document.getElementById('profIA-prof-stage');
  if (!stage) return;
  stage.className = 'pos-' + pos;
}

function profIA_setGesture(g) {
  PIAVATAR.gesture = g;
  const arm = document.getElementById('profIA-arm-r');
  const chalk = document.getElementById('profIA-chalk');
  const ptr   = document.getElementById('profIA-pointer');
  if (!arm) return;
  // BUGFIX: arm é SVGGElement — .className é SVGAnimatedString (somente leitura)
  // Usar setAttribute('class') em vez de .className =
  arm.setAttribute('class', '');
  if (chalk) chalk.setAttribute('opacity', '0');
  if (ptr)   { ptr.setAttribute('opacity','0'); ptr.nextElementSibling?.setAttribute('opacity','0'); }
  if (g === 'escrever' || g === 'writing') {
    arm.classList.add('writing');
    if (chalk) chalk.setAttribute('opacity', '1');
  } else if (g === 'apontar' || g === 'pointing') {
    arm.classList.add('pointing');
    if (ptr) { ptr.setAttribute('opacity','1'); ptr.nextElementSibling?.setAttribute('opacity','1'); }
  } else if (g === 'enfase' || g === 'raised') {
    arm.classList.add('raised');
  }
}

function profIA_setExpression(expr) {
  PIAVATAR.expr = expr;
  const browL = document.getElementById('profIA-brow-l');
  const browR = document.getElementById('profIA-brow-r');
  const mouthB = document.getElementById('profIA-mouth-bottom');
  const mouthT = document.getElementById('profIA-mouth-top');
  const teeth  = document.getElementById('profIA-teeth');
  const glasses = document.getElementById('profIA-glasses');
  const head    = document.getElementById('profIA-head');
  if (!browL) return;
  // Reset
  if (glasses) glasses.classList.remove('glow');
  if (head)    head.classList.remove('listening');

  const exprs = {
    sorrindo:    { bL:'M97 86 Q111 79 118 84', bR:'M142 84 Q149 79 163 86', mb:'M114 152 Q130 168 146 152', showTeeth:true  },
    aprovando:   { bL:'M97 84 Q111 77 118 83', bR:'M142 83 Q149 77 163 84', mb:'M114 152 Q130 170 146 152', showTeeth:true, glow:true },
    explicando:  { bL:'M97 83 Q111 79 118 85', bR:'M142 85 Q149 79 163 83', mb:'M114 152 Q130 162 146 152', showTeeth:false },
    corrigindo:  { bL:'M97 88 Q111 84 118 86', bR:'M142 86 Q149 84 163 88', mb:'M114 152 Q130 158 146 152', showTeeth:false },
    surpresa:    { bL:'M97 80 Q111 74 118 80', bR:'M142 80 Q149 74 163 80', mb:'M114 152 Q130 172 146 152', showTeeth:true  },
    pensando:    { bL:'M97 88 Q111 82 118 87', bR:'M142 87 Q149 86 163 88', mb:'M114 154 Q130 158 146 154', showTeeth:false, tilt:true },
    aguardando:  { bL:'M97 86 Q111 81 118 85', bR:'M142 85 Q149 81 163 86', mb:'M114 153 Q130 160 146 153', showTeeth:false },
    falando:     { bL:'M97 85 Q111 80 118 85', bR:'M142 85 Q149 80 163 85', mb:'M114 152 Q130 165 146 152', showTeeth:true  },
  };
  const e = exprs[expr] || exprs.aguardando;
  browL.setAttribute('d', e.bL);
  browR.setAttribute('d', e.bR);
  if (mouthB) mouthB.setAttribute('d', e.mb);
  if (teeth)  teeth.setAttribute('display', e.showTeeth ? 'block' : 'none');
  if (e.glow && glasses) glasses.classList.add('glow');
  if (e.tilt && head)    head.classList.add('listening');
}

// ── Lip sync ──────────────────────────────────────────────────
function profIA_startTalking() {
  if (PIAVATAR.talkRef) return;
  let open = false;
  PIAVATAR.talking = true;
  PIAVATAR.talkRef = setInterval(() => {
    const teeth = document.getElementById('profIA-teeth');
    const mb    = document.getElementById('profIA-mouth-bottom');
    open = !open;
    if (teeth) teeth.setAttribute('display', open ? 'block' : 'none');
    if (mb) mb.setAttribute('d', open ? 'M114 152 Q130 168 146 152' : 'M114 153 Q130 160 146 153');
  }, 90);
}
function profIA_stopTalking() {
  clearInterval(PIAVATAR.talkRef);
  PIAVATAR.talkRef = null;
  PIAVATAR.talking = false;
  const teeth = document.getElementById('profIA-teeth');
  if (teeth) teeth.setAttribute('display', 'none');
}

// ── Chalkboard system ─────────────────────────────────────────
async function profIA_writeOnBoard(text) {
  if (!text) return;
  PISTATE.chalkUses++;
  // 1. Move to board
  profIA_setPos('board');
  profIA_setGesture('escrever');
  profIA_setExpression('explicando');
  await profIA_sleep(900);
  // 2. Erase
  await profIA_eraseBoard();
  // 3. Write letter by letter
  const el = document.getElementById('profIA-chalkboard-text');
  if (!el) return;
  el.innerHTML = '';
  // Convert markdown-like markers to spans
  const formatted = text
    .replace(/❌([^→\n]+)/g, '<span class="cht-red">❌$1</span>')
    .replace(/✅([^\n]+)/g, '<span class="cht-green">✅$1</span>')
    .replace(/\[([^\]]+)\]/g, '<span class="cht-yellow">$1</span>');
  // Typewriter on plain text, then set full formatted
  const plain = text.replace(/<[^>]+>/g, '');
  let built = '';
  for (const ch of plain) {
    built += ch;
    el.textContent = built;
    await profIA_sleep(38);
  }
  el.innerHTML = formatted;
  // 4. Point at board
  await profIA_sleep(500);
  profIA_setGesture('apontar');
  await profIA_sleep(1800);
  // 5. Return center
  profIA_setPos('center');
  profIA_setGesture('neutro');
  profIA_setExpression('sorrindo');
}

async function profIA_eraseBoard() {
  const el = document.getElementById('profIA-chalkboard-text');
  if (el) {
    el.style.transition = 'opacity .3s';
    el.style.opacity = '0';
    await profIA_sleep(350);
    el.textContent = '';
    el.style.opacity = '1';
  }
}

// ── Chat ──────────────────────────────────────────────────────
function profIA_addBubble(text, type) {
  const log = document.getElementById('profIA-chat');
  if (!log) return;
  const d = document.createElement('div');
  d.className = 'profIA-bubble ' + type;
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

// ── Toast ─────────────────────────────────────────────────────
function profIA_toast(msg, type = 'info') {
  const wrap = document.getElementById('profIA-toasts');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'profIA-toast ' + type;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

// ── Speech synthesis ──────────────────────────────────────────
let _profIA_voiceOn = true;
function profIA_toggleVoice() {
  profIA_unlockAudio();
  _profIA_voiceOn = !_profIA_voiceOn;
  const btn = document.getElementById('profIA-voice-btn');
  if (btn) btn.textContent = _profIA_voiceOn ? '🔊' : '🔇';
  profIA_toast(_profIA_voiceOn ? 'Voz ativada' : 'Voz desativada', 'info');
}

// ── iOS/Mobile audio unlock (deve ser chamado dentro de um gesto do usuário) ──
let _profIA_audioUnlocked = false;
function profIA_unlockAudio() {
  if (_profIA_audioUnlocked) return;
  _profIA_audioUnlocked = true;
  // Fase 1A: Azure TTS não precisa de unlock de AudioContext como WebSpeech
  // Mantemos o flag para compatibilidade com o resto do código
  console.log('[profIA] audio unlocked (Azure mode)');
}

function profIA_speak(text) {
  return new Promise(resolve => {
    if (!_profIA_voiceOn || !text?.trim()) { resolve(); return; }

    // Fase 1A: Azure Neural TTS
    if (typeof SpeechSDK !== 'undefined' && window.AZURE_SPEECH_KEY &&
        window.AZURE_SPEECH_KEY !== '{{AZURE_SPEECH_KEY}}') {
      try {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
          window.AZURE_SPEECH_KEY, window.AZURE_SPEECH_REGION || 'eastus'
        );
        const langMap = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR' };
        const lang = langMap[PISTATE.lang] || 'en-US';

        // Vozes por idioma e nível
        const voiceMap = {
          'English-Básico':        'en-US-JennyNeural',
          'English-Intermediário': 'en-US-JennyNeural',
          'English-Avançado':      'en-US-AriaNeural',
          'Spanish-Básico':        'es-ES-ElviraNeural',
          'Spanish-Intermediário': 'es-ES-ElviraNeural',
          'Spanish-Avançado':      'es-ES-ElviraNeural',
          'French-Básico':         'fr-FR-DeniseNeural',
          'French-Intermediário':  'fr-FR-DeniseNeural',
          'French-Avançado':       'fr-FR-DeniseNeural',
        };
        speechConfig.speechSynthesisVoiceName = voiceMap[`${PISTATE.lang}-${PISTATE.level}`] || 'en-US-JennyNeural';

        // Velocidade via SSML
        const rateMap = { 'Básico': '-15%', 'Intermediário': '0%', 'Avançado': '+10%' };
        const rate    = rateMap[PISTATE.level] || '0%';
        const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
        const ssml    = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}"><voice name="${speechConfig.speechSynthesisVoiceName}"><prosody rate="${rate}">${escaped}</prosody></voice></speak>`;

        const player = new SpeechSDK.SpeakerAudioDestination();
        player.onAudioEnd = () => {
          PISPEECH.speaking = false;
          profIA_stopTalking();
          const ind = document.getElementById('profIA-speaking-indicator');
          if (ind) ind.remove();
          resolve();
        };

        const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
        const synth = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

        PISPEECH.speaking = true;
        profIA_startTalking();

        // Indicador visual
        const vp = document.getElementById('profIA-voice-preview');
        if (vp && !document.getElementById('profIA-speaking-indicator')) {
          const ind = document.createElement('div');
          ind.id = 'profIA-speaking-indicator';
          ind.style.cssText = 'position:absolute;top:8px;left:50%;transform:translateX(-50%);background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.35);border-radius:20px;padding:4px 14px;font-size:11px;color:#00e5ff;font-family:Space Mono,monospace;z-index:40;pointer-events:none;';
          ind.textContent = '🔊 Professor falando...';
          document.getElementById('profIA-overlay')?.appendChild(ind);
        }

        synth.speakSsmlAsync(ssml,
          result => {
            synth.close();
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              // onAudioEnd vai resolver a promise
            } else {
              PISPEECH.speaking = false;
              profIA_stopTalking();
              resolve();
            }
          },
          err => {
            console.warn('[profIA] Azure TTS error:', err);
            synth.close();
            PISPEECH.speaking = false;
            profIA_stopTalking();
            resolve();
          }
        );

        // Watchdog 3s — se Azure travar
        setTimeout(() => {
          if (PISPEECH.speaking) {
            profIA_toast('🔇 Toque em qualquer lugar para ativar o áudio', 'warn');
          }
        }, 3000);

        return; // Azure path — não cai no fallback
      } catch(e) {
        console.warn('[profIA] Azure TTS exception, usando fallback:', e);
        // cai no fallback abaixo
      }
    }

    // Fallback: Web Speech API (se Azure não disponível)
    if (!window.speechSynthesis) { resolve(); return; }
    if (!_profIA_audioUnlocked) {
      _profIA_audioUnlocked = true;
    }
    try { if (window.speechSynthesis.paused) window.speechSynthesis.resume(); } catch(_) {}
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const langMap2 = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR' };
    utter.lang   = langMap2[PISTATE.lang] || 'en-US';
    utter.rate   = PISTATE.level === 'Básico' ? 0.84 : PISTATE.level === 'Intermediário' ? 0.95 : 1.05;
    utter.pitch  = 1.12;
    utter.volume = 1;
    let resolved = false;
    const _done = () => { if (resolved) return; resolved = true; PISPEECH.speaking = false; profIA_stopTalking(); resolve(); };
    utter.onstart = () => { PISPEECH.speaking = true; profIA_startTalking(); };
    utter.onend   = _done;
    utter.onerror = _done;
    setTimeout(() => { if (!PISPEECH.speaking) _done(); }, 3000);
    try { window.speechSynthesis.speak(utter); } catch(e) { _done(); }
  });
}

// ── Speech recognition ────────────────────────────────────────
function profIA_toggleMic() {
  profIA_unlockAudio(); // iOS: desbloqueia áudio no primeiro toque
  if (PISPEECH.recording) {
    profIA_stopMic();
  } else {
    profIA_startMic();
  }
}

function profIA_startMic() {
  // Fase 1A: Azure Speech Recognizer com fallback WebSpeech
  if (PISPEECH.speaking) {
    // Cancela TTS Azure se estiver falando
    PISPEECH.speaking = false;
    profIA_stopTalking();
  }

  // Tentar Azure primeiro
  if (typeof SpeechSDK !== 'undefined' && window.AZURE_SPEECH_KEY &&
      window.AZURE_SPEECH_KEY !== '{{AZURE_SPEECH_KEY}}') {
    try {
      let _azureSpeechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        window.AZURE_SPEECH_KEY, window.AZURE_SPEECH_REGION || 'eastus'
      );
      if (window.AZURE_CUSTOM_ENDPOINT_ID) {
        _azureSpeechConfig.endpointId = window.AZURE_CUSTOM_ENDPOINT_ID;
      }
      const langMap = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR' };
      _azureSpeechConfig.speechRecognitionLanguage = langMap[PISTATE.lang] || 'en-US';

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer  = new SpeechSDK.SpeechRecognizer(_azureSpeechConfig, audioConfig);

      recognizer.recognizing = (s, e) => {
        const vp = document.getElementById('profIA-voice-preview');
        if (vp) { vp.textContent = e.result.text; vp.style.display = 'block'; }
      };

      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text?.trim()) {
          profIA_stopMic();
          profIA_processInput(e.result.text);
        }
      };

      recognizer.canceled = (s, e) => {
        profIA_stopMic();
        if (e.reason !== SpeechSDK.CancellationReason.EndOfStream) {
          profIA_toast('Erro no microfone: ' + (e.errorDetails || 'desconhecido'), 'warn');
        }
      };

      recognizer.sessionStopped = () => { profIA_stopMic(); };

      PISPEECH.recording = true;
      PISPEECH.rec = { _isAzure: true, recognizer };
      recognizer.startContinuousRecognitionAsync(
        () => {
          const btn = document.getElementById('profIA-mic-btn');
          if (btn) { btn.classList.add('recording'); btn.textContent = '⏹'; }
          profIA_setExpression('aguardando');
          profIA_setPos('right');
        },
        err => {
          PISPEECH.recording = false;
          profIA_toast('Microfone Azure: ' + err, 'warn');
          // Fallback WebSpeech
          _profIA_startMicWebSpeech();
        }
      );
      return;
    } catch(e) {
      console.warn('[profIA] Azure mic error, usando fallback:', e);
    }
  }

  // Fallback: WebSpeech API
  _profIA_startMicWebSpeech();
}

function _profIA_startMicWebSpeech() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { profIA_toast('Microfone não suportado. Use o teclado.', 'warn'); profIA_toggleTextInput(true); return; }

  const rec = new SR();
  const langMap = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR' };
  rec.lang = langMap[PISTATE.lang] || 'en-US';
  rec.continuous = false;
  rec.interimResults = true;

  rec.onstart = () => {
    PISPEECH.recording = true;
    const btn = document.getElementById('profIA-mic-btn');
    if (btn) { btn.classList.add('recording'); btn.textContent = '⏹'; }
    profIA_setExpression('aguardando');
    profIA_setPos('right');
  };

  rec.onresult = (e) => {
    const t = e.results[e.results.length-1][0].transcript;
    const vp = document.getElementById('profIA-voice-preview');
    if (vp) { vp.textContent = t; vp.style.display = 'block'; }
    if (e.results[e.results.length-1].isFinal) {
      profIA_stopMic();
      profIA_processInput(t);
    }
  };

  rec.onerror = (e) => {
    profIA_stopMic();
    if (e.error !== 'aborted') profIA_toast('Erro no microfone: ' + e.error, 'warn');
  };

  rec.onend = () => { if (PISPEECH.recording) profIA_stopMic(); };

  PISPEECH.rec = rec;
  rec.start();
}

function profIA_stopMic() {
  PISPEECH.recording = false;
  const btn = document.getElementById('profIA-mic-btn');
  if (btn) { btn.classList.remove('recording'); btn.textContent = '🎤'; }
  const vp = document.getElementById('profIA-voice-preview');
  if (vp) vp.style.display = 'none';

  // Fase 1A: fechar recognizer Azure ou WebSpeech
  if (PISPEECH.rec?._isAzure) {
    try {
      PISPEECH.rec.recognizer.stopContinuousRecognitionAsync();
      PISPEECH.rec.recognizer.close();
    } catch(_) {}
  } else {
    try { PISPEECH.rec?.stop(); } catch(_) {}
  }
  PISPEECH.rec = null;
}

// ── Text input toggle ─────────────────────────────────────────
function profIA_toggleTextInput(forceOpen) {
  PISPEECH.textOpen = forceOpen !== undefined ? forceOpen : !PISPEECH.textOpen;
  const wrap = document.getElementById('profIA-text-wrap');
  if (wrap) wrap.classList.toggle('open', PISPEECH.textOpen);
  if (PISPEECH.textOpen) document.getElementById('profIA-text-input')?.focus();
}

function profIA_sendText() {
  profIA_unlockAudio(); // iOS: desbloqueia áudio no primeiro toque
  const inp = document.getElementById('profIA-text-input');
  if (!inp || !inp.value.trim()) return;
  const text = inp.value.trim();
  inp.value = '';
  profIA_processInput(text);
}

// ── Process student input ─────────────────────────────────────
async function profIA_processInput(text) {
  if (!text || !PISTATE.active) return;
  profIA_addBubble(text, 'student');
  profIA_setExpression('pensando');
  profIA_setPos('center');
  const btn = document.getElementById('profIA-mic-btn');
  if (btn) { btn.classList.add('processing'); btn.textContent = '⏳'; }
  PISTATE.history.push({ role: 'user', content: text });
  await profIA_callAPI(PISTATE.history.slice());
  if (btn) { btn.classList.remove('processing'); btn.textContent = '🎤'; }
}

// ── API call (com retry automático para 502/503 e Failed to fetch) ────────
async function profIA_callAPI(messages) {
  const system = profIA_buildSystemPrompt();
  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [4000, 8000];

  // Garante que o BACKEND_URL está configurado antes de tentar
  const backendUrl = (window.AIVOX_BACKEND_URL || window.BACKEND_URL || '').trim();
  if (!backendUrl) {
    profIA_toast('Backend não configurado. Configure a URL nas Configurações.', 'warn');
    profIA_setExpression('aguardando');
    profIA_addBubble('Oops! The server is not configured yet. Please set the backend URL in Settings and try again. 🔧', 'prof');
    return;
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        profIA_toast('Reconectando... aguarde (' + attempt + '/' + MAX_RETRIES + ') 🔄', 'info');
        await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt - 1]));
      }
      const token = await auth.currentUser?.getIdToken();
      const resp = await fetch(backendUrl + '/api/professor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({ system, messages }),
        signal: AbortSignal.timeout(35000),
      });

      // 502/503 = backend cold-starting — retry silencioso
      if (resp.status === 502 || resp.status === 503) {
        if (attempt < MAX_RETRIES) {
          profIA_toast('Servidor iniciando... aguarde (' + (attempt+1) + '/' + MAX_RETRIES + ') 🔄', 'info');
          continue;
        }
        throw new Error('HTTP ' + resp.status);
      }

      if (!resp.ok) throw new Error('HTTP ' + resp.status);

      const data = await resp.json();
      const raw = (data.answer || '').trim();
      let parsed;
      try {
        const jsonStr = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        parsed = JSON.parse(jsonStr);
      } catch(_) {
        parsed = { fala: raw, lousaConteudo: null, gestoProfessora: 'neutro', expressaoRosto: 'sorrindo', correcao: null, palavraNova: null };
      }
      await profIA_orchestrate(parsed);
      return; // sucesso

    } catch(e) {
      const isFetchError = e.name === 'TypeError' || e.message?.includes('fetch') || e.message?.includes('network');
      console.error('[profIA] API error (tentativa ' + (attempt+1) + '):', e.message);
      if (attempt < MAX_RETRIES && isFetchError) continue; // retry em erros de rede
      if (attempt === MAX_RETRIES) {
        profIA_toast('Servidor sem resposta. Verifique a URL do backend nas Configurações.', 'warn');
        profIA_setExpression('aguardando');
        profIA_addBubble('Hmm, I can\'t reach the server right now. Please check your connection and try again! 🙏', 'prof');
      }
    }
  }
}

// ── Orchestrate response ──────────────────────────────────────
async function profIA_orchestrate(data) {
  const fala     = data.fala || '';
  const lousa    = data.lousaConteudo || null;
  const gesto    = data.gestoProfessora || 'neutro';
  const expr     = data.expressaoRosto  || 'sorrindo';
  const correcao = data.correcao || null;
  const novaPalavra = data.palavraNova || null;

  PISTATE.turns++;
  // Phase progression
  if (PISTATE.turns === 4  && PISTATE.phase === 'warmup')  PISTATE.phase = 'core';
  if (PISTATE.turns === 18 && PISTATE.phase === 'core')    PISTATE.phase = 'consolidation';

  // Score update based on response
  if (correcao) {
    const errKey = correcao;
    const existing = PISTATE.errors.find(e => e.txt === errKey);
    if (existing) { existing.count++; profIA_updateScore(-3); }
    else { PISTATE.errors.push({ txt: errKey, count: 1 }); profIA_updateScore(-1); }
  } else if (PISTATE.turns > 1) {
    profIA_updateScore(+4);
  }

  // New vocabulary
  if (novaPalavra) {
    const word = typeof novaPalavra === 'object' ? novaPalavra.word : novaPalavra;
    if (word && !PISTATE.newWords.includes(word)) {
      PISTATE.newWords.push(word);
      profIA_toast('📚 Nova palavra: ' + word, 'success');
    }
  }

  // Add to history BEFORE chalkboard (which takes time)
  PISTATE.history.push({ role: 'assistant', content: fala });

  // Chalkboard first (if needed)
  if (lousa) {
    await profIA_writeOnBoard(lousa);
  }

  // Then set expression + gesture
  profIA_setExpression(expr);
  profIA_setGesture(gesto);

  // Show correction bubble
  if (correcao) profIA_addBubble('📝 ' + correcao, 'correction');

  // Prof speech bubble
  profIA_addBubble(fala, 'prof');

  // TTS
  profIA_setExpression('falando');
  await profIA_speak(fala);

  // Restore to waiting
  profIA_setExpression('aguardando');
  profIA_setGesture('neutro');
  profIA_setPos('center');
}

// ── System prompt builder (V3) ────────────────────────────────
function profIA_buildSystemPrompt() {
  const langFull = { English: 'English', Spanish: 'Spanish', French: 'French' }[PISTATE.lang] || 'English';
  const recurringErrors = PISTATE.errors.filter(e => e.count >= 2).map(e => e.txt).join('; ') || 'none yet';
  const knownWords      = PISTATE.newWords.slice(-8).join(', ') || 'none yet';
  const phaseInstr = {
    warmup:       'PHASE: Warmup (turns 1-3). Be casual, encouraging. NO grammar corrections yet. Build rapport. Ask one simple personal question.',
    core:         'PHASE: Core Learning. Full correction protocol active. Use chalkboard for grammar/vocab. Apply Socratic method for grammar questions.',
    consolidation:'PHASE: Consolidation. Review top 2-3 new words from this session. Address main recurring error. Give warm farewell with achievement.',
  }[PISTATE.phase] || '';
  const userName = auth.currentUser?.displayName?.split(' ')[0] || 'Student';

  return `You are "Professor Alex" — a warm, brilliant, patient ${langFull} language teacher on AIVOX. You appear as an animated human character inside a virtual classroom with a chalkboard.

STUDENT INFO:
- Name: ${userName}
- Level: ${PISTATE.level}
- Session mode: ${PISTATE.mode}
- Recurring errors (fix these): ${recurringErrors}
- Vocabulary learned this session: ${knownWords}
- Turn count: ${PISTATE.turns}
- ${phaseInstr}

YOUR PERSONALITY:
- Warm, encouraging, patient, slightly playful — genuine enthusiasm for language
- You celebrate every correct sentence as a win
- You NEVER make the student feel bad about mistakes — always correct with kindness and humor
- You adapt vocabulary and complexity strictly to the student's level
- At Avançado level, you can be more direct and debate-like

STRICT RULES:
1. ALWAYS speak ONLY in ${langFull}. NEVER use Portuguese, not even one word.
2. If the student writes in Portuguese, respond ONLY in ${langFull}: "Try in ${langFull}! You can do it! 💪"
3. Correct mistakes IMMEDIATELY and kindly using this sandwich: acknowledge → correct → re-engage.
4. Keep responses SHORT (2-4 sentences) to maintain flow.
5. ALWAYS end your turn with a question or prompt to keep the student talking.
6. Use the chalkboard (lousaConteudo) whenever you introduce a new word, grammar rule, or correction.
7. For grammar questions: use the Socratic method — give progressive hints before revealing the answer.
8. Include IPA notation on chalkboard for new vocabulary: "think /θɪŋk/ = pensar".

CHALKBOARD RULES:
- CONCISE: max 2 lines
- Use: "❌ wrong → ✅ correct" for corrections
- Use: "word /IPA/ = translation" for vocabulary
- Use: "Rule: structure + example" for grammar

LEVEL GUIDELINES:
- Básico: simple present/past, top 300 words, very short sentences, maximum encouragement
- Intermediário: mixed tenses, phrasal verbs, idioms, longer conversations
- Avançado: complex grammar, debate, formal register, native-speed

RESPOND STRICTLY IN THIS JSON FORMAT (no markdown, no extra text):
{
  "fala": "your spoken response in ${langFull}",
  "correcao": null or "correction text if student made an error",
  "palavraNova": null or "word introduced",
  "lousaConteudo": null or "what to write on chalkboard (max 2 lines)",
  "estadoAvatar": "falando",
  "movimentoProfessora": "centro",
  "gestoProfessora": "neutro | enfase | ok | apontar | aberto | pensando | escrever",
  "expressaoRosto": "sorrindo | explicando | corrigindo | surpresa | aprovando | aguardando | pensando | falando"
}`;
}

// ── End session ───────────────────────────────────────────────
async function profIA_endSession() {
  if (!PISTATE.active) return;
  PISTATE.active = false;
  clearInterval(PISTATE.timerRef);
  profIA_stopMic();
  // Fase 1A: Azure TTS para automaticamente quando o player termina
  PISPEECH.speaking = false;
  profIA_stopTalking();

  const duration = Math.floor((Date.now() - PISTATE.startTime) / 1000);
  let xp = PISTATE.level === 'Básico' ? 20 : PISTATE.level === 'Intermediário' ? 35 : 50;
  if (PISTATE.chalkUses >= 3) xp += 10;
  if (PISTATE.turns >= 20)    xp += 15;

  const sessionData = {
    ts: new Date().toISOString(),
    level: PISTATE.level,
    mode: PISTATE.mode,
    lang: PISTATE.lang,
    duration,
    turns: PISTATE.turns,
    chalkUses: PISTATE.chalkUses,
    score: PISTATE.score,
    errors: PISTATE.errors.map(e => e.txt),
    words: PISTATE.newWords,
    xp,
  };
  localStorage.setItem('profIA_lastSession', JSON.stringify(sessionData));

  // Save XP to Firestore if logged in
  try {
    const uid = auth.currentUser?.uid;
    if (uid && typeof db !== 'undefined') {
      await db.collection('users').doc(uid).update({
        xp: firebase.firestore.FieldValue.increment(xp),
        'professor_sessions': firebase.firestore.FieldValue.arrayUnion({
          ts: firebase.firestore.FieldValue.serverTimestamp(),
          level: PISTATE.level, mode: PISTATE.mode, duration, turns: PISTATE.turns, score: PISTATE.score, xp,
        }),
      });
    }
  } catch(e) { console.warn('[profIA] Firestore save:', e.message); }

  profIA_showReport(sessionData, xp);
}

function profIA_showReport(data, xp) {
  const reportDiv = document.getElementById('profIA-report');
  if (!reportDiv) return;

  const m = String(Math.floor((data.duration||0)/60)).padStart(2,'0');
  const s = String((data.duration||0)%60).padStart(2,'0');
  const achievement =
    data.turns >= 20   ? '🏆 Maratonista (20+ turnos)!' :
    data.chalkUses >= 5 ? '📖 Mestre da Lousa (5+ usos)!' :
    data.score >= 75    ? '⭐ Alta Performance!' :
    '✅ Aula Concluída!';

  const errorsHTML = data.errors?.length
    ? data.errors.slice(0,4).map(e => `<span class="profIA-error-item">⚠️ ${e}</span>`).join('')
    : '<span style="color:rgba(255,255,255,.4);font-size:12px;">Nenhum erro registrado 🎉</span>';

  const wordsHTML = data.words?.length
    ? data.words.map(w => `<span class="profIA-word-chip">📚 ${w}</span>`).join('')
    : '<span style="color:rgba(255,255,255,.4);font-size:12px;">Nenhuma palavra nova</span>';

  reportDiv.style.display = 'flex';
  reportDiv.innerHTML = `<div class="profIA-report-card">
    <div class="profIA-report-hdr">
      <div style="font-size:11px;font-family:'Space Mono',monospace;color:rgba(0,229,255,.7);letter-spacing:2px;margin-bottom:6px;">📋 RELATÓRIO DE SESSÃO</div>
      <div style="font-size:18px;font-weight:900;">Professor Alex · ${data.level}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px;">${data.mode} · ${data.lang}</div>
    </div>
    <div class="profIA-xp-banner">
      <div class="profIA-xp-num">+${xp} XP</div>
      <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:4px;">${achievement}</div>
    </div>
    <div class="profIA-stats-grid">
      <div class="profIA-stat"><div class="profIA-stat-val">${m}:${s}</div><div class="profIA-stat-lbl">DURAÇÃO</div></div>
      <div class="profIA-stat"><div class="profIA-stat-val">${data.turns}</div><div class="profIA-stat-lbl">TURNOS</div></div>
      <div class="profIA-stat"><div class="profIA-stat-val">${data.score}/100</div><div class="profIA-stat-lbl">SCORE</div></div>
      <div class="profIA-stat"><div class="profIA-stat-val">${data.chalkUses}</div><div class="profIA-stat-lbl">LOUSA</div></div>
    </div>
    <div class="profIA-report-section">
      <div class="profIA-report-section-lbl">⚠️ Erros para revisar</div>
      <div>${errorsHTML}</div>
    </div>
    <div class="profIA-report-section">
      <div class="profIA-report-section-lbl">📚 Vocabulário novo</div>
      <div>${wordsHTML}</div>
    </div>
    <div class="profIA-report-actions">
      <button class="profIA-btn-back" onclick="profIA_closeOverlay()">🏠 Voltar</button>
      <button class="profIA-btn-again" onclick="profIA_restart()">🔄 Nova sessão</button>
    </div>
  </div>`;
}

function profIA_closeOverlay() {
  const overlay = document.getElementById('profIA-overlay');
  if (overlay) {
    overlay.style.transition = 'opacity .4s ease';
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; overlay.style.opacity = '1'; }, 420);
  }
}

function profIA_restart() {
  const overlay = document.getElementById('profIA-overlay');
  if (overlay) { overlay.style.display = 'none'; overlay.innerHTML = ''; }
  // Go back to setup panel and re-enter
  profIA_onTabOpen();
}

// ── Utility ───────────────────────────────────────────────────
function profIA_sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
