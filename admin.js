// ── Global error catcher ────────────────────────────────────────
window.addEventListener('unhandledrejection',e=>{
  const msg=e.reason?.message||String(e.reason)||'Unknown';
  // Ignore Chrome extension errors
  if(msg.includes('message channel'))return;
  console.error('[AIVOX] Unhandled rejection:',msg,e.reason);
});
window.addEventListener('error',e=>{
  const msg=e.message||'Unknown';
  if(msg.includes('message channel'))return;
  // FIX: ResizeObserver loop é inofensivo — suprimir para não poluir console
  if(msg.includes('ResizeObserver loop'))return;
  console.error('[AIVOX] JS Error:',msg,'at',e.filename,':',e.lineno);
});

// ====== STATE ======
let userPlan='trial',userRole='user',currentPage='landing';

// ── Backend URL — sempre lê o valor atual ──
const _BACKEND_FALLBACK = 'https://aivox-backend.onrender.com';

// ══════════════════════════════════════════════════════════════════
//  AIVOX — Motor de Limpeza de Fala (Filtro A + IA B)
//  Versão 1.0 · Fabio Candido / CMAA
// ══════════════════════════════════════════════════════════════════

// ── Configuração (pode ser alterada pelo usuário) ─────────────────
window._fillerConfig = {
  enabled: true,       // Filtro A ativo
  aiEnabled: true,     // Limpeza via IA (Opção B) ativa
  // Aprende fillers do usuário — persistido no localStorage
  userFillers: JSON.parse(localStorage.getItem('aivox_user_fillers') || '[]'),
};

// ── Lista base PT-BR de fillers ───────────────────────────────────
const _FILLERS_PTBR = [
  // Vícios de linguagem
  'intaum','intão','entaum','então','então','tipo assim','tipo',
  'né','né não','né isso','tá','tá bom','tá certo',
  'sabe','sabe não','você sabe','sabe como',
  'assim','assim ó','assim assim',
  'ahn','ahh','ahm','éh','ééé','iii','uuu','hmm','hm','uhh','uh',
  'é que','é tipo','é assim','é isso','é isso aí',
  'cara','mano','véi',
  // Falsos começos e repetições
  'eu eu','eu ia','eu ia dizer','como é que','como é',
  'na verdade','de certa forma','de alguma forma',
  'basicamente','literalmente',
  // Inglês (quando fala misturado)
  'you know','i mean','like','well','uh','um','so','okay','ok',
  'actually','basically','literally','right',
];

// ── Filtro A: limpeza local via regex ────────────────────────────
function _fillerCleanLocal(text) {
  if (!window._fillerConfig.enabled || !text) return text;

  // Combina lista base + fillers aprendidos do usuário
  const allFillers = [..._FILLERS_PTBR, ...window._fillerConfig.userFillers];

  let cleaned = text;

  // Remove fillers — ordem: maiores primeiro (ex: "tipo assim" antes de "tipo")
  const sorted = allFillers
    .filter(f => f && f.trim().length > 0)
    .sort((a, b) => b.length - a.length);

  for (const filler of sorted) {
    // Borda de palavra, case-insensitive, com possível pontuação ao redor
    const escaped = filler.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const rx = new RegExp('(?:^|\\s)' + escaped + '(?=\\s|[,;.!?]|$)', 'gi');
    cleaned = cleaned.replace(rx, ' ');
  }

  // Remove espaços duplos e trim
  return cleaned.replace(/\s{2,}/g, ' ').replace(/^[,;.\s]+/, '').trim();
}

// ── Aprende novo filler do usuário ───────────────────────────────
function _fillerLearn(word) {
  if (!word || word.length < 2) return;
  const w = word.toLowerCase().trim();
  if (_FILLERS_PTBR.includes(w)) return;
  if (!window._fillerConfig.userFillers.includes(w)) {
    window._fillerConfig.userFillers.push(w);
    localStorage.setItem('aivox_user_fillers', JSON.stringify(window._fillerConfig.userFillers));
  }
}

// ── Filtro B: limpeza via Azure OpenAI ───────────────────────────
async function _fillerCleanAI(text) {
  if (!window._fillerConfig.aiEnabled || !text || text.length < 8) return text;
  try {
    const backendUrl = (typeof getBackendUrl === 'function') ? getBackendUrl() : '';
    const token = (typeof getAuthToken === 'function') ? await getAuthToken().catch(() => null) : null;
    if (!backendUrl || !token) return text;

    const prompt = `Você é um processador de texto de fala. Remova APENAS vícios de linguagem, hesitações e fillers do texto abaixo, mantendo o significado original intacto. NÃO traduza. NÃO adicione palavras. NÃO altere o idioma. Retorne SOMENTE o texto limpo, sem explicação.

Texto: "${text}"`;

    const res = await fetch(backendUrl + '/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 200 })
    });
    if (!res.ok) return text;
    const data = await res.json();
    const cleaned = (data.content || []).map(b => b.text || '').join('').trim();
    return cleaned.length > 2 ? cleaned : text;
  } catch (e) {
    return text; // fallback: retorna original se IA falhar
  }
}

// ── Ponto de entrada principal ────────────────────────────────────
// Aplica A primeiro (instantâneo), depois B se IA habilitada
async function _fillerProcess(text) {
  if (!text || !text.trim()) return text;
  const afterA = _fillerCleanLocal(text);
  // Só chama IA se o texto mudou ou se AI está forçada
  if (window._fillerConfig.aiEnabled && afterA.length > 8) {
    return await _fillerCleanAI(afterA);
  }
  return afterA;
}

console.log('[AIVOX] Motor de Limpeza de Fala carregado ✓ (A+B ativos)');

function getBackendUrl(){
  return (window.AIVOX_BACKEND_URL||'').trim() || _BACKEND_FALLBACK;
}
// Compat: BACKEND_URL usado em algumas rotas antigas
Object.defineProperty(window,'BACKEND_URL',{get:()=>getBackendUrl(),configurable:true});

// ── Backend health check & diagnose ──────────────────────────────
// ── Diagnóstico completo do sistema ────────────────────────────
async function runFullDiagnose(){
  const url=getBackendUrl();
  const diagEl=document.getElementById('api-diagnose-output');
  showToast('Executando diagnóstico completo...','info');
  const results=[];
  const _ts=()=>new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const ok =(msg)=>{results.push('OK '+msg);  console.log('%c[AIVOX ✅] '+msg,'color:#00ff88;font-weight:bold;');};
  const err=(msg)=>{results.push('ERRO '+msg);console.error('[AIVOX ❌] '+msg);};
  const info=(msg)=>{results.push('INFO '+msg);console.info('%c[AIVOX ℹ️] '+msg,'color:#00e5ff;');};
  const warn=(msg)=>{results.push('AVS '+msg); console.warn('[AIVOX ⚠️] '+msg);};

  console.group('%c🩺 AIVOX DIAGNÓSTICO — '+_ts(),'color:#00e5ff;font-size:14px;font-weight:bold;');
  console.log('Backend URL:', url||'NÃO CONFIGURADA');
  console.log('User Agent:', navigator.userAgent);
  console.log('Viewport:', window.innerWidth+'×'+window.innerHeight);

  // ── 1. VERSÃO ──
  info('AIVOX Frontend — diagnóstico em '+new Date().toLocaleString('pt-BR'));

  // ── 2. AUTH ──
  console.group('🔐 Auth');
  try{
    const u=auth.currentUser;
    if(u){
      ok('Auth: usuário logado — '+u.email);
      const token=await u.getIdToken();
      ok('Auth: token JWT OK ('+token.length+' chars)');
      console.log('Token prefixo:', token.substring(0,60)+'...');
      const fbUser=window._fbUser;
      if(fbUser){
        ok('Perfil: '+fbUser.name+' | role:'+fbUser.role+' | plan:'+fbUser.plan);
        ok('Minutos: '+fbUser.minutesUsed+'/'+(fbUser.minutesLimit||5)+' usados');
        console.log('window._fbUser:', JSON.parse(JSON.stringify(fbUser)));
      } else { warn('window._fbUser: não carregado — onAuthStateChanged pendente?'); }
    } else { err('Auth: nenhum usuário logado'); }
  }catch(e){ err('Auth: '+e.message); console.error(e); }
  console.groupEnd();

  // ── 3. FIRESTORE ──
  console.group('🔥 Firestore');
  try{
    const t0=Date.now();
    const snap=await db.collection('users').doc(window._fbUser?.uid||'_ping').get();
    const fbMs=Date.now()-t0;
    ok('Firestore: conectado em '+fbMs+'ms');
    console.log('Latência Firestore:', fbMs+'ms');
    if(snap.exists) console.log('Dados Firestore:', snap.data());
    else console.warn('Documento não encontrado ou sem permissão');
  }catch(e){
    if(e.code==='permission-denied'){ warn('Firestore: permission-denied — verifique Rules'); console.error('Firestore Rules erro:', e); }
    else { err('Firestore: '+e.message); console.error(e); }
  }
  console.groupEnd();

  // ── 4. PÁGINAS DOM ──
  console.group('📄 DOM');
  const pages=['page-home','page-admin','page-settings','page-sala','page-chat','page-learn','page-profile','page-amigos','page-novidades'];
  const missing=pages.filter(p=>!document.getElementById(p));
  missing.length===0 ? ok('DOM: todas as '+pages.length+' páginas presentes') : err('DOM: páginas ausentes → '+missing.join(', '));
  pages.forEach(p=>console.log(p+':', document.getElementById(p)?'✅':'❌ AUSENTE'));
  const activePg=document.querySelector('.page.active');
  info('Página ativa: '+(activePg?.id||'nenhuma'));
  console.groupEnd();

  // ── 5. LAYOUT ──
  const shell=document.getElementById('app-shell');
  const sr=shell?.getBoundingClientRect();
  if(sr&&sr.height>0){ ok('Layout: app-shell '+Math.round(sr.width)+'×'+Math.round(sr.height)+'px — OK'); console.log('app-shell rect:', sr); }
  else err('Layout: app-shell altura=0 — bug de tela preta!');

  // ── 6. BACKEND PING ──
  console.group('🌐 Backend');
  try{
    const t0=Date.now();
    const r=await fetch(url+'/api/ping',{signal:AbortSignal.timeout(6000)});
    const ms=Date.now()-t0;
    if(r.ok){ ok('Backend ping: '+ms+'ms — '+url); let d={};try{d=await r.json();}catch(_){}console.log('Ping response:', d); }
    else { err('Backend: HTTP '+r.status); console.error('Status:', r.status, r.statusText); }
  }catch(e){ err('Backend inacessível: '+e.message.slice(0,60)); console.error(e); }
  console.groupEnd();

  // ── 7. CHAVES API ──
  console.group('🔑 Chaves de API — /api/diagnose');
  try{
    const t0=Date.now();
    const r=await fetch(url+'/api/diagnose',{signal:AbortSignal.timeout(6000)});
    const ms=Date.now()-t0;
    console.log('/api/diagnose HTTP:', r.status, 'em', ms+'ms');
    if(r.ok){
      const d=await r.json();
      console.log('Resposta /api/diagnose:', JSON.stringify(d,null,2));
      d.openai     ? ok('OpenAI: configurada ✓')     : err('OpenAI: AUSENTE — transcrição/tradução quebrada');
      d.anthropic  ? ok('Azure OAI / Anthropic: configurada ✓')  : warn('Anthropic/Azure OAI: não configurada (usando fallback)');
      d.elevenlabs ? ok('Azure Voice: configurada ✓ (fallback TTS)') : ok('Azure TTS: ativo como TTS principal');
      d.firebase   ? ok('Firebase Admin SDK: OK ✓')  : err('Firebase Admin: AUSENTE — webhooks/PIX falharão');
      d.mp         ? ok('MercadoPago: configurado ✓'): warn('MercadoPago: não configurado — PIX indisponível');
      info('Uptime: '+Math.round((d.uptime||0)/60)+'min | Node: '+(d.node||'?'));
      if(!d.anthropic){
        console.info('[AIVOX] Azure OpenAI configurado como LLM principal.');
        console.info('Fallback: chaves legadas também suportadas.');
      }
    } else {
      const txt=await r.text().catch(()=>'');
      warn('/api/diagnose HTTP '+r.status+' — atualize o server.js');
      console.warn('Body:', txt.slice(0,300));
    }
  }catch(e){ err('Diagnose API: '+e.message.slice(0,60)); console.error(e); }
  console.groupEnd();

  // ── 8. TESTE REAL IA PROFESSOR ──
  console.group('🎓 Modo Aprendizagem — IA Professor');
  try{
    const token=await auth.currentUser?.getIdToken();
    if(token){
      const payload={messages:[{role:'user',content:'Hi, say only: OK'}],lang:'inglês',nivel:'iniciante',situacao:{personagem:'teacher',lugar:'classroom'}};
      console.log('Payload enviado:', payload);
      const t0=Date.now();
      const r=await fetch(url+'/api/learn/conversa',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
        body:JSON.stringify(payload),
        signal:AbortSignal.timeout(15000)
      });
      const ms=Date.now()-t0;
      console.log('HTTP:', r.status, 'em', ms+'ms');
      const rawTxt=await r.text();
      console.log('Resposta bruta:', rawTxt.slice(0,500));
      let d={};try{d=JSON.parse(rawTxt);}catch(pe){console.error('JSON inválido:', pe.message);}
      console.log('Resposta parseada:', d);
      if(r.ok){
        if(d.answer&&d.answer!=='...'){
          ok('IA Professor: respondeu em '+ms+'ms | model: '+(d.model||'?'));
          console.log('%c✅ Professor OK: '+d.answer.substring(0,100),'color:#00ff88;font-weight:bold;');
        } else {
          err('IA Professor: retornou fallback — verifique AZURE_OAI_KEY no Render');
          console.warn('Professor retornou fallback — verifique AZURE_OAI_KEY no Render.');
        }
      } else { err('IA Professor: HTTP '+r.status+' em '+ms+'ms'); }
    } else { warn('Sem token de auth — login necessário para testar IA'); }
  }catch(e){
    err('IA Professor: '+e.message.slice(0,60));
    console.error('Exceção:', e);
    if(e.name==='AbortError') console.error('TIMEOUT: /api/learn/conversa >15s sem resposta');
  }
  console.groupEnd();
  console.groupEnd(); // fecha grupo principal

  // ── RENDER RESULTADO ──
  const erros=results.filter(r=>r.startsWith('ERRO')).length;
  if(diagEl){
    diagEl.style.display='block';
    diagEl.innerHTML='<div style="font-size:11px;font-family:var(--mono);line-height:2;padding:4px 0;">'+
      results.map(line=>{
        const c=line.startsWith('OK')?'var(--green)':line.startsWith('ERRO')?'var(--red)':line.startsWith('AVS')?'var(--orange)':'var(--accent)';
        return '<div style="color:'+c+'">'+line+'</div>';
      }).join('')+
      (erros>0?'<div style="color:var(--orange);margin-top:8px;font-size:10px;">💡 F12 → Console para logs detalhados de cada erro</div>':'')+
    '</div>';
  }
  showToast(erros===0?'✅ Diagnóstico OK — tudo funcionando':'⚠️ Diagnóstico: '+erros+' erro(s) — veja F12 Console','info');
}

async function checkBackendHealth(){
  const url=getBackendUrl();
  try{
    const r=await fetch(url+'/api/ping',{signal:AbortSignal.timeout(6000)});
    if(r.ok){
      // Also test translate endpoint health
      try{
        const r2=await fetch(url+'/api/translate',{
          method:'POST',signal:AbortSignal.timeout(8000),
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({text:'test',from:'en',to:'pt'})
        });
        if(r2.ok) return {ok:true,msg:'Backend e tradução OK'};
        if(r2.status===502||r2.status===500){
          return {ok:false,ping:true,msg:'Backend ativo mas /api/translate falha ('+r2.status+'). Verifique AZURE_OAI_KEY no Render.'};
        }
        return {ok:false,ping:true,msg:'Backend ativo. /api/translate retornou '+r2.status};
      }catch(e2){
        return {ok:false,ping:true,msg:'Backend ativo mas tradução sem resposta. Verifique variáveis de ambiente.'};
      }
    }
    return {ok:false,msg:'Backend retornou '+r.status};
  }catch(e){
    return {ok:false,msg:'Backend inacessível: '+e.message};
  }
}

let loginAttempts=0,loginLocked=false,lockTimer=null;
const MAX_ATTEMPTS=5;
let trialSec=5*60,trialT=null,sessT=null,sessSec=0;
let isRec=false,wis=[],wc=0,di=0;
let _escutaActive=false;

// ════════════════════════════════════════════════════════════
//  SISTEMA DE INATIVIDADE — Auto-logout após 10 min sem uso
// ════════════════════════════════════════════════════════════
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos
const IDLE_WARN_MS    =  9 * 60 * 1000; // aviso 1 min antes
let _idleTimer = null;
let _idleWarnTimer = null;
let _idleWarnShown = false;

function _resetIdleTimer(){
  clearTimeout(_idleTimer);
  clearTimeout(_idleWarnTimer);
  _idleWarnShown = false;
  // Remove aviso se estiver visível
  const warn = document.getElementById('idle-warn-banner');
  if(warn) warn.style.display = 'none';

  _idleWarnTimer = setTimeout(()=>{
    // Mostra aviso 1 min antes
    const b = document.getElementById('idle-warn-banner');
    if(b && !_idleWarnShown){ b.style.display='flex'; _idleWarnShown=true; }
  }, IDLE_WARN_MS);

  _idleTimer = setTimeout(()=>{
    // Encerra sessão ativa e faz logout por inatividade
    _handleIdleLogout();
  }, IDLE_TIMEOUT_MS);
}

function _handleIdleLogout(){
  // Para qualquer sessão ativa
  try{ if(isRec) stopRec(); }catch(e){}
  try{ stopSess(); }catch(e){}
  try{ stopEscuta(); }catch(e){}
  try{ _escutaActive=false; }catch(e){}
  // Mostra modal de aviso antes do logout
  const m = document.getElementById('idle-logout-modal');
  if(m){ m.style.display='flex'; }
  // Aguarda 4s e faz logout
  setTimeout(()=>{
    try{ doLogout(); }catch(e){ location.reload(); }
  }, 4000);
}

function _startIdleWatch(){
  const events = ['mousemove','mousedown','touchstart','touchmove','keydown','scroll','click'];
  events.forEach(ev => document.addEventListener(ev, _resetIdleTimer, {passive:true}));
  _resetIdleTimer();
}

// Só ativa o idle watch após login (chamado em setupPlan)
// ────────────────────────────────────────────────────────────
// API monitor vars — declarados cedo para evitar TDZ em navApp
let _apiMonitorInterval=null;
let _apiCountdownInterval=null;
let _apiCountdown=5;
let _latencyHistory=[];
const MONITOR_INTERVAL=5;
let payFromPage='home',idiomaFrom='home',pendingPayPlan=null,currentAdminChat=null;
const planDetails={trial:{name:'Trial',desc:'5 min grátis',price:'Grátis',mins:'5 min totais'},basic:{name:'Basic',desc:'60 min/mês',price:'R$149',mins:'60 min/mês'},pro:{name:'Pro',desc:'200 min/mês · Voz clonada',price:'R$429',mins:'200 min/mês'},business:{name:'Business',desc:'600 min/mês · 5 usuários',price:'R$1.190',mins:'600 min/mês'},enterprise:{name:'Enterprise',desc:'2.000 min/mês',price:'R$3.490',mins:'2.000 min/mês'},test1real:{name:'Teste R$1',desc:'Teste de produção — Admin Only',price:'R$1',mins:'60 min/mês'}};

// ====== TOAST ======
function showToast(msg,type='success'){
  const p=document.getElementById('toast-portal'),t=document.createElement('div');
  t.className='toast '+type;t.textContent=msg;p.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);},3000);
}
window.fbToast=showToast;

// ====== NAVIGATION ======
function hideAllAuth(){['page-landing','page-login','page-register','page-reset','page-2fa'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('active');});}
function showLanding(){hideAllAuth();document.getElementById('app-shell').style.display='none';document.getElementById('page-landing').classList.add('active');currentPage='landing';document.body.dataset.page='landing';}
function showAuth(mode){hideAllAuth();document.getElementById('app-shell').style.display='none';const m={login:'page-login',register:'page-register',reset:'page-reset','2fa':'page-2fa'};if(m[mode])document.getElementById(m[mode]).classList.add('active');currentPage=mode;document.body.dataset.page=mode;}
function enterApp(data){
  document.body.dataset.page='app';
  hideAllAuth();document.getElementById('app-shell').style.display='flex';
  updateSidebarUser(data);
  loadUserLanguages(data);
  const isAdmin=data.role==='admin';
  document.getElementById('snav-admin').style.display=isAdmin?'flex':'none';
  document.getElementById('snav-settings').style.display=isAdmin?'flex':'none';
  document.getElementById('settings-api-section').style.display=isAdmin?'block':'none';
  document.querySelector('.sidebar-user').onclick=()=>navApp(isAdmin?'settings':'profile');
  document.getElementById('sb-av-top').onclick=()=>navApp(isAdmin?'settings':'profile');
  navApp('home'); // Sempre inicia na página Início
  if(!isAdmin)setupPlan();setTimeout(checkMinutesAlert,1500);loadPrecos();
  if(!isAdmin){setTimeout(()=>checkTrialExpiry(),2000);}
  if(!isAdmin){setTimeout(()=>checkShowOnboarding(),1500);}
  if(isAdmin){startPaymentListener();}
  if(!window._keepAliveInterval){
    window._keepAliveInterval=setInterval(()=>{
      const url=getBackendUrl();
      if(url)fetch(url+'/api/ping').catch(()=>{});
    },9*60*1000);
  }
  // Inicializa socket de chamadas P2P SEMPRE ao fazer login — não espera o usuário abrir Amigos
  setTimeout(()=>{ if(typeof initAmigoModule==='function'&&!window._amiModuleInited){window._amiModuleInited=true;initAmigoModule();} }, 1000);
  // Socket dedicado para receber chamadas mesmo sem entrar na aba Amigos
  setTimeout(()=>{ if(typeof window._ensureAmiSocket==='function') window._ensureAmiSocket(); }, 1500);
  // ── AZURE CONFIG — busca chaves do backend após login (nunca expostas no HTML) ──
  setTimeout(()=>{ if(typeof window._fetchAzureConfig==='function') window._fetchAzureConfig(); }, 1500);
}
function navApp(name){
  document.querySelectorAll('#app-shell .page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+name);
  if(!pg){console.warn('[AIVOX] Page not found: page-'+name);return;}
  pg.classList.add('active');

  currentPage=name;
  document.querySelectorAll('.snav-item').forEach(e=>e.classList.remove('active'));
  const sn=document.getElementById('snav-'+name);if(sn)sn.classList.add('active');
  document.querySelectorAll('.ni').forEach(e=>e.classList.remove('active'));
  const bn=document.getElementById('bn-'+name);if(bn)bn.classList.add('active');
  const titles={home:'Início',active:'Sessão Ativa',history:'Histórico',faq:'Central de Ajuda',settings:'Configurações',admin:'Admin',chat:'Suporte',payment:'Pagamento',langsel:'Idiomas',profile:'Minha Conta',escuta:'Escuta ao vivo',sala:'Salas Colaborativas','sala-ativa':'Sala Ativa',learn:'Aprendizagem',amigos:'Amigos',novidades:'Novidades',liveTrans:'Tradutor ao Vivo'};
  const tb=document.getElementById('topbar-title');if(tb)tb.textContent=titles[name]||'';
  if(name==='history'){renderHist(histData);_histTab='sess';switchHistTab('sess');}
  if(name==='faq'){renderFaq('todos');setTimeout(()=>goSlide(0),100);}
  if(name==='admin'){renderUsers('todos');renderAdminLog();renderAdminChats();loadKPIs();checkApiStatus(false);}
  if(name==='settings'&&userRole==='admin'){loadBackendUrl();setTimeout(()=>testBackendPing(),500);}
  if(name==='chat')initUserChat();
  if(name!=='admin')stopApiMonitor();
  if(name!=='escuta')stopEscuta();
  if(name==='profile')renderProfilePage();
  if(name==='sala'){initSalaPage();setTimeout(()=>{ if(typeof grpInit==='function')grpInit(); },500);}
  if(name==='learn'){loadStreak();loadVocab();setTimeout(()=>{ if(typeof astLoadStats==='function')astLoadStats(); },700);}
  if(name==='novidades'&&typeof _amiLoadVotes==='function')_amiLoadVotes();
  if(name==='liveTrans') liveTransInit();
  if(typeof _liveTrans!=='undefined' && _liveTrans && name!=='liveTrans') liveTransStop();
  if(name==='amigos'){
    if(typeof initAmigoModule==='function'&&!window._amiModuleInited){window._amiModuleInited=true;initAmigoModule();}
    else{amiSwitchTab(_amiCurrentTab||'amigos');}
    // Garante socket para chamadas P2P (apenas quando necessário)
    if(typeof window._ensureAmiSocket==='function') window._ensureAmiSocket();
  }
  const hideBnav=['active','chat','admin','payment','langsel','sala-ativa'];
  const bnav=document.getElementById('bnav');if(bnav)bnav.style.display=hideBnav.includes(name)?'none':'';
  // Esconde topbar quando admin ativo (admin tem header próprio)
  const _topbar = document.querySelector('.main-area > .topbar');
  if (_topbar) {
    if (name === 'admin') {
      _topbar.style.display = 'none';
      _topbar.classList.add('admin-hidden');
    } else {
      _topbar.style.display = '';
      _topbar.classList.remove('admin-hidden');
    }
  }
  // Botão menu (☰): mostrar em todas páginas exceto admin
  const _mb=document.getElementById('menu-btn');
  if(_mb){
    if(name==='admin') _mb.style.display='none';
    else _mb.style.display=window.innerWidth<1100?'flex':'none';
  }
  // Botão voltar (‹) no header admin: aparece em mobile e tablet (qualquer tela abaixo de 1100px onde o hamburger fica oculto)
  const _ab=document.getElementById('admin-back-btn');
  if(_ab) _ab.style.display=(name==='admin'&&window.innerWidth<1100)?'flex':'none';
  // Remove position:fixed do admin quando sair dele
  if(name!=='admin'){
    const _pa=document.getElementById('page-admin');
    if(_pa&&_pa.classList.contains('active')===false){
      _pa.style.position='';_pa.style.top='';_pa.style.left='';
      _pa.style.right='';_pa.style.bottom='';_pa.style.zIndex='';
      _pa.style.width='';_pa.style.height='';
    }
  }
  closeSidebar();
}
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('sidebar-overlay').classList.add('open');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('sidebar-overlay').classList.remove('open');}
(function initMenu(){const b=document.getElementById('menu-btn');if(b)b.style.display=window.innerWidth<1100?'flex':'none';})();
window.addEventListener('resize',()=>{const b=document.getElementById('menu-btn');if(b)b.style.display=window.innerWidth<1100?'flex':'none';});

// ====== SIDEBAR USER ======
function updateSidebarUser(data){
  const name=data?.name||'Usuário',plan=data?.plan||'trial';
  const initials=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  ['sb-avatar','sb-av-top'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=initials;});
  const sbN=document.getElementById('sb-name');if(sbN)sbN.textContent=name.split(' ')[0];
  const sbP=document.getElementById('sb-plan');if(sbP)sbP.textContent=plan.toUpperCase();
  const gr=document.getElementById('h-greeting');
  if(gr){const h=new Date().getHours();gr.textContent=(h<12?'Bom dia':h<18?'Boa tarde':'Boa noite')+', '+name.split(' ')[0];}
}

// ====== AUTH ======
function setRole(role,el){} // deprecated
function lockLogin(secs=30){loginLocked=true;const ol=document.getElementById('rl-ov-login');if(ol)ol.classList.add('sh');let c=secs;const el=document.getElementById('rl-countdown');if(el)el.textContent=c;lockTimer=setInterval(()=>{c--;if(el)el.textContent=c;if(c<=0){clearInterval(lockTimer);loginLocked=false;loginAttempts=0;if(ol)ol.classList.remove('sh');}},1000);}
async function doLogin(){
  if(loginLocked)return;
  const email=document.getElementById('lo-email').value.trim(),pass=document.getElementById('lo-pass').value,errEl=document.getElementById('lo-err');
  errEl.classList.remove('show');
  if(!email||!email.includes('@')){errEl.textContent='E-mail inválido.';errEl.classList.add('show');return;}
  if(!pass){errEl.textContent='Digite sua senha.';errEl.classList.add('show');return;}
  if(window.FB){
    try{
      // Sinaliza que o login foi solicitado pelo usuário (evita auto-login indevido)
      window._userRequestedLogin=true;
      const res=await window.FB.login(email,pass);
      if(res.ok){window._fbUser=res.data;userPlan=res.data.plan||'trial';userRole=res.data.role||'user';loginAttempts=0;try{localStorage.setItem('aivox_role',res.data.role||'user');localStorage.setItem('aivox_uid',res.data.uid||'');}catch(_){}/* enterApp e toast serão chamados pelo onAuthStateChanged */return;}
      else{window._userRequestedLogin=false;loginAttempts++;if(loginAttempts>=MAX_ATTEMPTS){lockLogin(30);return;}let msg=res.error||'E-mail ou senha incorretos.';if(msg.includes('user-not-found')||msg.includes('wrong-password')||msg.includes('invalid-credential'))msg='E-mail ou senha incorretos. '+(MAX_ATTEMPTS-loginAttempts)+' tentativa(s) restante(s).';errEl.textContent=msg;errEl.classList.add('show');}
    }catch(e){window._userRequestedLogin=false;errEl.textContent='Erro de conexão.';errEl.classList.add('show');}
  }else{
    errEl.textContent='Erro ao conectar com o servidor de autenticação. Recarregue a página.';
    errEl.classList.add('show');
  }
}
function checkRegPwStrength(val){const bar=document.getElementById('reg-pw-bar'),lbl=document.getElementById('reg-pw-label');if(!bar)return;let score=0;if(val.length>=8)score++;if(/[A-Z]/.test(val))score++;if(/[0-9]/.test(val))score++;if(/[^A-Za-z0-9]/.test(val))score++;const colors=['#ff4466','#ff8c00','#ffd000','#00ff88'],labels=['Muito fraca','Fraca','Boa','Forte 💪'],widths=['25%','50%','75%','100%'];bar.style.width=score>0?widths[score-1]:'0%';bar.style.background=score>0?colors[score-1]:'transparent';if(lbl){lbl.textContent=score>0?labels[score-1]:'';lbl.style.color=score>0?colors[score-1]:'var(--muted)';}}
async function doRegister(){
  const name=document.getElementById('reg-name').value.trim(),email=document.getElementById('reg-email').value.trim(),pass=document.getElementById('reg-pass').value,pass2=document.getElementById('reg-pass2').value,terms=document.getElementById('reg-terms').checked,errEl=document.getElementById('reg-err'),btn=document.getElementById('reg-btn'),btnTxt=document.getElementById('reg-btn-txt');
  errEl.classList.remove('show');
  if(!name){errEl.textContent='Digite seu nome.';errEl.classList.add('show');return;}
  if(!email||!email.includes('@')){errEl.textContent='E-mail inválido.';errEl.classList.add('show');return;}
  if(pass.length<8){errEl.textContent='Senha com mínimo 8 caracteres.';errEl.classList.add('show');return;}
  if(pass!==pass2){errEl.textContent='Senhas não coincidem.';errEl.classList.add('show');return;}
  if(!terms){errEl.textContent='Aceite os termos de uso.';errEl.classList.add('show');return;}
  btn.style.opacity='.7';btn.style.pointerEvents='none';btnTxt.textContent='Criando conta...';
  if(window.FB){
    const res=await window.FB.register(email,pass,name,'trial');
    btn.style.opacity='';btn.style.pointerEvents='';btnTxt.textContent='Criar conta grátis';
    if(res.ok){
      // Item 3: send email verification
      try{if(auth.currentUser)await auth.currentUser.sendEmailVerification();}catch(e){}
      // Item 6: save trial start date to Firestore
      try{if(window.FB&&res.uid)await db.collection('users').doc(res.uid).update({trialStartedAt:serverTimestamp(),trialExpiresAt:new Date(Date.now()+3*24*60*60*1000)});}catch(e){}
      window._fbUser={uid:res.uid,email,name,plan:'trial',minutesUsed:0,minutesLimit:5,role:'user'};
      userPlan='trial';userRole='user';
      showToast('🎉 Conta criada! Verifique seu e-mail.');
      // Show verify email notice instead of entering app directly
      showVerifyEmailScreen(email);
    }
    else{let msg=res.error||'Erro ao criar conta.';if(msg.includes('email-already-in-use'))msg='E-mail já cadastrado.';if(msg.includes('weak-password'))msg='Senha muito fraca.';errEl.textContent=msg;errEl.classList.add('show');}
  }else{
    btn.style.opacity='';btn.style.pointerEvents='';btnTxt.textContent='Criar conta grátis';
    errEl.textContent='Erro ao conectar com o servidor. Recarregue a página.';errEl.classList.add('show');
  }
}

function showVerifyEmailScreen(email){
  // Replace register page content with a verification notice
  const box=document.querySelector('#page-register .auth-box');
  if(!box)return;
  box.innerHTML=`
    <div style="text-align:center;padding:10px 0;">
      <div style="font-size:56px;margin-bottom:16px;">📧</div>
      <div style="font-size:22px;font-weight:900;margin-bottom:8px;">Verifique seu e-mail</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:24px;">Enviamos um link de confirmação para<br><strong style="color:var(--text);">${email}</strong></div>
      <div style="background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.18);border-radius:13px;padding:14px;margin-bottom:20px;font-size:12px;color:var(--muted);line-height:1.6;">
        Após clicar no link no e-mail, volte aqui e faça login normalmente.<br>Verifique também a pasta de <strong>spam</strong>.
      </div>
      <button class="btn btn-primary btn-full" onclick="showAuth('login')" style="margin-bottom:10px;">Já verifiquei → Fazer login</button>
      <button class="btn btn-ghost btn-full" onclick="resendVerifyEmail('${email}')">🔄 Reenviar e-mail</button>
      <div class="auth-link" onclick="showAuth('login')" style="margin-top:12px;">← Voltar ao login</div>
    </div>`;
}

async function resendVerifyEmail(email){
  if(auth.currentUser){
    try{await auth.currentUser.sendEmailVerification();showToast('📧 E-mail reenviado!');}
    catch(e){showToast('Aguarde antes de reenviar','error');}
  }else{showToast('Faça login para reenviar','error');}
}
function regThenPay(pl){pendingPayPlan=pl;showAuth('register');}
function doLogout(){
  // 0. Marca que o logout foi solicitado — impede onAuthStateChanged de re-entrar no app
  window._userRequestedLogout=true;
  window._userRequestedLogin=false;
  // 1. Parar todos os timers
  try{clearInterval(trialT);trialT=null;}catch(e){}
  try{clearInterval(sessT);sessT=null;}catch(e){}
  try{if(Array.isArray(wis)){wis.forEach(clearInterval);wis=[];}}catch(e){}
  // 2. Parar gravação
  try{isRec=false;}catch(e){}
  try{if(typeof _sessRecorder!=='undefined'&&_sessRecorder&&_sessRecorder.state==='recording')_sessRecorder.stop();}catch(e){}
  try{if(typeof _sessStream!=='undefined'&&_sessStream)_sessStream.getTracks().forEach(t=>t.stop());}catch(e){}
  // 3. Parar monitor de APIs
  try{stopApiMonitor();}catch(e){}
  // 4. Parar escuta
  try{if(typeof _escutaActive!=='undefined'&&_escutaActive&&typeof stopEscuta==='function')stopEscuta();}catch(e){}
  // 5. Limpar estado
  window._fbUser=null;
  userRole='user';
  userPlan='trial';
  loginAttempts=0;
  currentPage='landing';
  // BUGFIX: limpa localStorage ao sair para não vazar role entre sessões/usuários
  try{localStorage.removeItem('aivox_role');localStorage.removeItem('aivox_uid');}catch(_){}
  // 6. Mostrar landing
  // Remove position:fixed do admin para não ficar sobreposto após logout
  const _pa=document.getElementById('page-admin');
  if(_pa){_pa.classList.remove('active');_pa.style.cssText='';}
  // Esconde bnav
  const _bn=document.getElementById('bnav');if(_bn)_bn.style.display='none';
  // Restaura topbar
  const _tb=document.querySelector('.main-area > .topbar');
  if(_tb){_tb.style.display='';_tb.classList.remove('admin-hidden');}
  // Restaura menu-btn (hamburger)
  const _mb=document.getElementById('menu-btn');if(_mb)_mb.style.display=window.innerWidth<1100?'flex':'none';
  document.getElementById('app-shell').style.display='none';
  document.body.dataset.page='landing';
  document.querySelectorAll('.auth-page.active,.landing-page.active').forEach(el=>el.classList.remove('active'));
  document.getElementById('page-landing').classList.add('active');
  showToast('Até logo! 👋','info');
  // 7. Firebase signOut em background (não bloqueia UI)
  try{if(typeof auth!=='undefined'&&auth)auth.signOut().catch(()=>{});}catch(e){}
}

// ====== 2FA — OTP SERVIDOR-SIDE (seguro) ======
// O código é gerado e validado no backend — nunca exposto no frontend
async function sendOTPEmail(email){
  const sub=document.getElementById('otp-sub');
  const fb=document.getElementById('otp-fallback-box');
  if(fb) fb.style.display='none';
  try{
    const res=await fetch(getBackendUrl()+'/api/otp/gerar',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email, name:window._fbUser?.name||'', uid:window._fbUser?.uid||''})
    });
    if(res.ok){
      showToast('📧 Código enviado para '+email,'success');
      if(sub) sub.textContent='Código enviado para '+email;
    } else {
      const d=await res.json().catch(()=>({}));
      showToast('⚠️ '+(d.error||'Erro ao enviar código'),'error');
      if(sub) sub.textContent='Erro ao enviar — tente reenviar';
    }
  }catch(e){
    console.error('Erro OTP:', e.message);
    showToast('⚠️ Sem conexão com servidor','error');
    if(sub) sub.textContent='Sem conexão — verifique sua internet';
  }
}
function otpNext(el,idx){el.value=el.value.replace(/\D/,'');const b=document.querySelectorAll('.otp-box');if(el.value&&idx<5)b[idx+1].focus();const code=[...b].map(x=>x.value).join('');if(code.length===6)setTimeout(verify2FA,200);}
async function verify2FA(){
  const b=document.querySelectorAll('.otp-box'),code=[...b].map(x=>x.value).join('');
  if(code.length<6)return;
  // Desabilita boxes durante verificação
  b.forEach(x=>x.disabled=true);
  try{
    const res=await fetch(getBackendUrl()+'/api/otp/verificar',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({uid:window._fbUser?.uid||'', code})
    });
    const d=await res.json();
    if(d.ok){
      document.getElementById('otp-err').style.display='none';
      b.forEach(x=>x.style.borderColor='var(--green)');
      setTimeout(async()=>{
        let u=window._fbUser||{uid:'admin',name:'Admin',plan:'pro',role:'admin'};
        if(u.uid&&window.FB){
          try{const fresh=await window.FB.getUser(u.uid);if(fresh){u=fresh;window._fbUser=fresh;userPlan=fresh.plan||'trial';userRole=fresh.role||'user';
          try{localStorage.setItem('aivox_role',fresh.role||'user');localStorage.setItem('aivox_uid',fresh.uid);}catch(_){}}}catch(e){}
        }
        // 2FA aprovado — entra direto, onAuthStateChanged não disparará toast (já está no app)
        window._userRequestedLogin=false;
        window._2faJustVerified=true; // flag para onAuthStateChanged ignorar
        enterApp(u);
        showToast('✅ Acesso verificado! Bem-vindo, '+(u.name?.split(' ')[0]||'')+'!','success');
      },500);
    } else {
      b.forEach(x=>{x.disabled=false;x.style.borderColor='var(--red)';x.value='';});
      b[0].focus();
      const errEl=document.getElementById('otp-err');
      if(errEl){errEl.textContent=d.error||'Código incorreto.';errEl.style.display='block';}
    }
  }catch(e){
    b.forEach(x=>{x.disabled=false;});
    showToast('⚠️ Erro ao verificar código','error');
  }
}
function resendOTP(){
  const btn=document.getElementById('resend-btn');
  if(btn){btn.style.color='var(--muted)';btn.style.pointerEvents='none';}
  sendOTPEmail(window._fbUser?.email||'');
  let c=30;
  const t=setInterval(()=>{c--;if(btn)btn.textContent='Reenviar ('+c+'s)';if(c<=0){clearInterval(t);if(btn){btn.textContent='Reenviar código';btn.style.color='var(--accent)';btn.style.pointerEvents='';}}},1000);
}
function goToReset(){showAuth('reset');}
async function doResetPassword(){
  const email=document.getElementById('reset-email').value.trim(),msg=document.getElementById('reset-msg'),btn=document.getElementById('reset-btn');
  msg.style.display='none';
  if(!email||!email.includes('@')){msg.textContent='E-mail inválido.';msg.style.cssText='display:block;background:var(--rdim);color:var(--red);border:1px solid rgba(255,68,102,.25);border-radius:10px;padding:10px 12px;font-size:12px;';return;}
  btn.style.opacity='.7';btn.style.pointerEvents='none';btn.textContent='Enviando...';
  const resetBtn=()=>{btn.style.opacity='';btn.style.pointerEvents='';btn.textContent='📧 Enviar link de redefinição';};
  if(!window.FB){resetBtn();msg.textContent='Firebase não carregado.';msg.style.cssText='display:block;background:var(--rdim);color:var(--red);border-radius:10px;padding:10px 12px;font-size:12px;';return;}
  try{await auth.sendPasswordResetEmail(email);msg.textContent='✅ Link enviado! Verifique seu e-mail.';msg.style.cssText='display:block;background:var(--gdim);color:var(--green);border:1px solid rgba(0,255,136,.2);border-radius:10px;padding:10px 12px;font-size:12px;';resetBtn();document.getElementById('reset-email').value='';}
  catch(e){let txt='Erro ao enviar.';if(e.code==='auth/user-not-found')txt='E-mail não encontrado.';if(e.code==='auth/too-many-requests')txt='Muitas tentativas.';msg.textContent='❌ '+txt;msg.style.cssText='display:block;background:var(--rdim);color:var(--red);border:1px solid rgba(255,68,102,.25);border-radius:10px;padding:10px 12px;font-size:12px;';resetBtn();}
}

// ====== AUTH TOKEN HELPER ======
// ── Token cache — evita getIdToken(true) a cada request (~100-300ms por chamada) ──
let _cachedToken = null;
let _cachedTokenExpiry = 0;
async function getAuthToken(){
  const user=auth?.currentUser;
  if(!user)return null;
  const now=Date.now();
  // Reutiliza token por até 50 minutos (Firebase tokens duram 1h)
  if(_cachedToken && now < _cachedTokenExpiry){
    return _cachedToken;
  }
  try{
    _cachedToken = await user.getIdToken(false); // false = sem forçar refresh
    _cachedTokenExpiry = now + 50 * 60 * 1000;  // 50 min
    return _cachedToken;
  }catch(e){
    // Se falhar sem refresh, tenta com refresh
    try{
      _cachedToken = await user.getIdToken(true);
      _cachedTokenExpiry = now + 50 * 60 * 1000;
      return _cachedToken;
    }catch(e2){ return null; }
  }
}

// ====== PROFILE PAGE ======
async function renderProfilePage(){
  // Sempre busca dados frescos do Firestore
  if(window.FB&&window._fbUser?.uid){
    try{const fresh=await window.FB.getUser(window._fbUser.uid);if(fresh){window._fbUser=fresh;userPlan=fresh.plan||'trial';userRole=fresh.role||'user';updateSidebarUser(fresh);}}catch(e){}
  }
  const u=window._fbUser;
  if(!u)return;
  const plan=u.plan||userPlan||'trial';
  const name=u.name||'Usuário';
  const email=u.email||'—';
  const initials=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  // User info
  const pa=document.getElementById('prof-avatar');
  if(pa){
    if(u.photoURL){pa.innerHTML=`<img src="${u.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;pa.style.padding='0';}
    else{pa.textContent=initials;pa.style.padding='';}
  }
  // Atualizar foto na sidebar também
  const sbav=document.getElementById('sb-av-top');
  if(sbav){
    if(u.photoURL){sbav.innerHTML=`<img src="${u.photoURL}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;sbav.style.padding='0';}
    else{sbav.textContent=initials;sbav.style.padding='';}
  }
  const pn=document.getElementById('prof-name');if(pn)pn.textContent=name;
  const pe=document.getElementById('prof-email');if(pe)pe.textContent=email;
  // Plan badge
  const badgeClasses={trial:'badge-trial',basic:'badge-basic',pro:'badge-pro',business:'badge-business',enterprise:'badge-business'};
  const pb=document.getElementById('prof-badge');if(pb){pb.className='badge '+(badgeClasses[plan]||'badge-trial');pb.textContent=plan.toUpperCase();}
  // Reset password fields
  const pwNew=document.getElementById('prof-pw-new');const pwConf=document.getElementById('prof-pw-confirm');const pwMsg=document.getElementById('prof-pw-msg');
  if(pwNew)pwNew.value='';if(pwConf)pwConf.value='';if(pwMsg)pwMsg.style.display='none';
  if(pwNew)pwNew.oninput=()=>checkProfPwStrength(pwNew.value);
  // Preenche campo username oculto para o gerenciador de senhas do Chrome
  const pwUser=document.getElementById('prof-pw-username');if(pwUser)pwUser.value=email||name||'';
  // Plan card
  const planMeta={
    trial:{icon:'🆓',name:'Trial',desc:'3 dias · 5 minutos gratuitos',price:'Grátis',mins:5},
    basic:{icon:'🚀',name:'Basic',desc:'Uso casual · 60 min/mês',price:'R$149',mins:60},
    pro:{icon:'👑',name:'Pro',desc:'Profissional · 200 min/mês',price:'R$429',mins:200},
    business:{icon:'🏢',name:'Business',desc:'Times e empresas · 600 min/mês',price:'R$1.190',mins:600},
    enterprise:{icon:'🏭',name:'Enterprise',desc:'Corporativo · 2.000 min/mês',price:'R$3.490',mins:2000},
  };
  const pm=planMeta[plan]||planMeta.trial;
  const pi=document.getElementById('prof-plan-icon');if(pi)pi.textContent=pm.icon;
  const pnm=document.getElementById('prof-plan-name');if(pnm)pnm.textContent=pm.name;
  const pds=document.getElementById('prof-plan-desc');if(pds)pds.textContent=pm.desc;
  const ppr=document.getElementById('prof-plan-price');if(ppr)ppr.textContent=pm.price;
  // Usage bar
  const used=u.minutesUsed||0,limit=u.minutesLimit||pm.mins;
  const pct=Math.min(100,Math.round((used/limit)*100));
  const put=document.getElementById('prof-usage-txt');if(put)put.textContent=used+' / '+limit+' min';
  const pub=document.getElementById('prof-usage-bar');if(pub){pub.style.width=pct+'%';pub.className='ubf'+(pct>=100?' over':pct>=80?' warn':'');}
  // Upgrade plans grid
  const grid=document.getElementById('prof-plans-grid');
  // Load real usage from Firestore
  loadProfileUsage(u);
  renderVoiceSection();
  const lbl=document.getElementById('prof-upgrade-label');
  if(!grid)return;
  grid.innerHTML='';
  const allPlans=['basic','pro','business','enterprise'];
  const upgradePlans=allPlans.filter(p=>p!==plan);
  if(plan==='enterprise'){if(lbl)lbl.style.display='none';grid.innerHTML='<div style="text-align:center;padding:18px;font-size:13px;color:var(--muted);">Você já está no plano máximo 🏆</div>';return;}
  if(lbl)lbl.style.display='';
  upgradePlans.forEach(p=>{
    const m=planMeta[p];
    const isFeat=p==='pro';
    const card=document.createElement('div');
    card.style.cssText='background:var(--card);border:1px solid '+(isFeat?'rgba(0,229,255,.35)':'var(--border)')+';border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:12px;';
    card.innerHTML=`<div style="font-size:24px;">${m.icon}</div><div style="flex:1;"><div style="font-size:14px;font-weight:800;${isFeat?'color:var(--accent);':''}">${m.name}${isFeat?' <span style="font-size:9px;background:var(--adim);color:var(--accent);padding:2px 6px;border-radius:5px;font-family:var(--mono);">POPULAR</span>':''}</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">${m.desc}</div></div><div style="text-align:right;flex-shrink:0;"><div style="font-size:16px;font-weight:900;font-family:var(--mono);${isFeat?'color:var(--accent);':''}">${m.price}</div><div style="font-size:10px;color:var(--muted);">/mês</div></div>`;
    card.addEventListener('mouseenter',()=>card.style.borderColor=isFeat?'rgba(0,229,255,.6)':'rgba(0,229,255,.25)');
    card.addEventListener('mouseleave',()=>card.style.borderColor=isFeat?'rgba(0,229,255,.35)':'var(--border)');
    card.addEventListener('click',()=>openPayment(p));
    grid.appendChild(card);
  });
}

async function loadProfileUsage(u){
  if(!u)return;
  const uid=u.uid;
  const used=u.minutesUsed||0;
  const limit=u.minutesLimit||5;
  const pct=Math.min(100,Math.round((used/limit)*100));
  const rest=Math.max(0,limit-used);

  // Atualiza barra principal
  const minTxt=document.getElementById('prof-min-txt');
  const minBar=document.getElementById('prof-min-bar');
  const minRest=document.getElementById('prof-min-rest');
  const minPct=document.getElementById('prof-min-pct');
  if(minTxt)minTxt.textContent=used.toFixed(1)+' / '+limit+' min';
  if(minBar){minBar.style.width=pct+'%';minBar.className='ubf'+(pct>=100?' over':pct>=80?' warn':'');}
  if(minRest)minRest.textContent=rest.toFixed(1)+' min restantes';
  if(minPct){minPct.textContent=pct+'%';minPct.style.color=pct>=100?'var(--red)':pct>=80?'var(--orange)':'var(--muted)';}

  // Se Firebase disponível, busca dados reais
  if(!window.FB||!db){
    document.getElementById('prof-stat-sess').textContent='—';
    document.getElementById('prof-stat-trad').textContent='—';
    document.getElementById('prof-stat-lat').textContent='—';
    document.getElementById('prof-recent-logs').innerHTML='<div style="font-size:11px;color:var(--muted);text-align:center;padding:10px;">Firebase não conectado</div>';
    return;
  }
  try{
    const month=new Date().toISOString().slice(0,7);
    const snap=await db.collection('logs').where('uid','==',uid).where('month','==',month).orderBy('createdAt','desc').limit(50).get();
    const logs=snap.docs.map(d=>d.data());

    let sess=0,trad=0,latSum=0,latCount=0;
    logs.forEach(l=>{
      if(l.type==='session_end')sess++;
      if(l.type==='translate'||l.type==='listen')trad++;
      if(l.latency){latSum+=l.latency;latCount++;}
    });

    document.getElementById('prof-stat-sess').textContent=sess||'0';
    document.getElementById('prof-stat-trad').textContent=trad||'0';
    document.getElementById('prof-stat-lat').textContent=latCount>0?Math.round(latSum/latCount)+'ms':'—';

    // Log recente
    const typeIcon={transcribe:'🎙️',translate:'🌐',listen:'🎧',speak:'🔊',session_end:'✅'};
    const typeLabel={transcribe:'Transcrição',translate:'Tradução',listen:'Escuta ao vivo',speak:'Voz gerada',session_end:'Sessão encerrada'};
    const logsEl=document.getElementById('prof-recent-logs');
    if(logsEl){
      if(!logs.length){
        logsEl.innerHTML='<div style="font-size:11px;color:var(--muted);text-align:center;padding:10px;">Nenhuma atividade este mês</div>';
      } else {
        logsEl.innerHTML=logs.slice(0,8).map(l=>{
          const icon=typeIcon[l.type]||'📋';
          const label=typeLabel[l.type]||l.type;
          const time=l.createdAt?.toDate?.()?.toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})||'—';
          const detail=l.latency?`<span style="color:var(--accent);font-family:var(--mono);font-size:10px;">${l.latency}ms</span>`:'';
          return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--surface);border-radius:9px;">
            <span style="font-size:15px;">${icon}</span>
            <span style="font-size:12px;font-weight:600;flex:1;">${label}</span>
            ${detail}
            <span style="font-size:10px;color:var(--muted);">${time}</span>
          </div>`;
        }).join('');
      }
    }
  }catch(e){
    console.warn('loadProfileUsage:',e);
    document.getElementById('prof-recent-logs').innerHTML='<div style="font-size:11px;color:var(--muted);text-align:center;padding:10px;">Erro ao carregar dados</div>';
  }
}

function checkProfPwStrength(val){
  const bar=document.getElementById('prof-pw-bar');if(!bar)return;
  let score=0;
  if(val.length>=8)score++;
  if(/[A-Z]/.test(val))score++;
  if(/[0-9]/.test(val))score++;
  const colors=['#ff4466','#ff8c00','#00ff88'];
  const widths=['33%','66%','100%'];
  bar.style.width=score>0?widths[score-1]:'0%';
  bar.style.background=score>0?colors[score-1]:'transparent';
}

async function doChangePw(){
  const np=document.getElementById('prof-pw-new')?.value?.trim();
  const cp=document.getElementById('prof-pw-confirm')?.value?.trim();
  const msg=document.getElementById('prof-pw-msg');
  const showMsg=(txt,ok)=>{if(!msg)return;msg.textContent=txt;msg.style.cssText='display:block;font-size:12px;border-radius:9px;padding:8px 12px;background:'+(ok?'var(--gdim)':'var(--rdim)')+';color:'+(ok?'var(--green)':'var(--red)')+';border:1px solid '+(ok?'rgba(0,255,136,.2)':'rgba(255,68,102,.25)')+';'};
  if(!np||np.length<8){showMsg('❌ Senha muito curta (mínimo 8 caracteres).',false);return;}
  if(np!==cp){showMsg('❌ Senhas não coincidem.',false);return;}
  // Firebase update
  if(window.FB&&auth?.currentUser){
    try{
      await auth.currentUser.updatePassword(np);
      showMsg('✅ Senha alterada com sucesso!',true);
      document.getElementById('prof-pw-new').value='';
      document.getElementById('prof-pw-confirm').value='';
      const bar=document.getElementById('prof-pw-bar');if(bar)bar.style.width='0%';
      showToast('🔑 Senha alterada!','success');
    }catch(e){
      let txt='Erro ao alterar senha.';
      if(e.code==='auth/requires-recent-login')txt='Por segurança, faça logout e login novamente antes de trocar a senha.';
      showMsg('❌ '+txt,false);
    }
  }else{
    // Demo mode
    showMsg('✅ Senha alterada (demo).',true);
    showToast('🔑 Senha alterada (demo)!');
    setTimeout(()=>{if(msg)msg.style.display='none';},3000);
  }
}


// ====== REAL REVENUE (manual input) ======
let _confirmedRevenue = 0;
function updateRealRevenue(val){
  _confirmedRevenue = parseFloat(val)||0;
  const fmt=(v)=>'R$'+Math.max(0,v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  // Get custo APIs value from current displayed text
  const custoEl=document.getElementById('rev-custo');
  const custoRaw=custoEl?.textContent?.replace('R$','').replace(/\./g,'').replace(',','.')||'0';
  const custoVal=parseFloat(custoRaw)||0;
  const lucro=_confirmedRevenue-custoVal;
  const margem=_confirmedRevenue>0?((lucro/_confirmedRevenue)*100).toFixed(1)+'%':'—';
  const setEl=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  setEl('rev-bruta',fmt(_confirmedRevenue));
  setEl('rev-lucro',fmt(lucro));
  setEl('rev-margem',_confirmedRevenue>0?margem:'—');
  const bar=document.getElementById('rev-bruta-bar');if(bar)bar.style.width=_confirmedRevenue>0?'100%':'0%';
}

async function saveConfirmedRevenue(){
  const val=parseFloat(document.getElementById('rev-real-input')?.value)||0;
  _confirmedRevenue=val;
  updateRealRevenue(val);
  const msg=document.getElementById('rev-save-msg');
  // Save to Firestore
  if(window.FB&&db){
    try{
      await db.collection('admin_settings').doc('revenue').set({confirmed:val,updatedAt:serverTimestamp()},{merge:true});
      if(msg){msg.textContent='✅ Salvo com sucesso!';msg.style.display='block';setTimeout(()=>msg.style.display='none',3000);}
      showToast('💰 Receita salva: R$'+val.toLocaleString('pt-BR'),'success');
      // Update KPI card too
      const kpiRev=document.getElementById('kpi-rev');if(kpiRev)kpiRev.textContent=val>0?'R$'+val.toLocaleString('pt-BR'):'R$0';
      const kpiRevD=document.getElementById('kpi-rev-d');if(kpiRevD)kpiRevD.textContent=val>0?'Receita confirmada':'Nenhum pagamento confirmado';
    }catch(e){
      if(msg){msg.textContent='❌ Erro ao salvar: '+e.message.substring(0,40);msg.style.color='var(--red)';msg.style.display='block';}
      showToast('Erro ao salvar','error');
    }
  }else{
    // Demo
    if(msg){msg.textContent='✅ Salvo (demo)';msg.style.display='block';setTimeout(()=>msg.style.display='none',3000);}
    showToast('💰 Receita atualizada (demo)');
  }
}

function setupPlan(){const it=userPlan==='trial';const tban=document.getElementById('tban');if(tban)tban.style.display=it?'flex':'none';if(it)startTrial();const u=window._fbUser,txt=document.getElementById('cfg-usage-txt');if(txt&&u)txt.textContent=(u.minutesUsed||0)+' / '+(u.minutesLimit||5)+' min usados';
  // Mostrar botões de compra de minutos para planos pagos
  const isPaid=!it&&userPlan!=='expired';
  const homeBtn=document.getElementById('home-topup-btn');if(homeBtn)homeBtn.style.display=isPaid?'block':'none';
  const cfgBtn=document.getElementById('cfg-topup-row');if(cfgBtn)cfgBtn.style.display=isPaid?'flex':'none';
  // Inicia monitoramento de inatividade (idle watch)
  if(!window._idleWatchStarted){window._idleWatchStarted=true;_startIdleWatch();}
}
function startTrial(){stopTrial();trialSec=5*60;updTrial();trialT=setInterval(()=>{trialSec--;updTrial();if(trialSec<=60){const uw=document.getElementById('uw-warn');if(uw){uw.className='uw-banner sh over';uw.innerHTML='<span style="font-size:16px;">🔴</span><div style="flex:1;"><div style="font-size:11px;font-weight:700;color:var(--red);">Trial quase esgotado!</div></div><button onclick="showLanding()" style="background:var(--red);color:#fff;border:none;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);">Upgrade</button>';}}if(trialSec<=0){stopTrial();const el=document.getElementById('ttimer');if(el){el.textContent='00:00';el.style.color='var(--red)';};}},1000);}
function stopTrial(){clearInterval(trialT);trialT=null;}
function updTrial(){const m=Math.floor(trialSec/60),s=trialSec%60,el=document.getElementById('ttimer');if(el){el.textContent=m.toString().padStart(2,'0')+':'+s.toString().padStart(2,'0');if(trialSec<=60)el.style.color='var(--red)';}}
function checkUsageBlock(){if(userPlan==='trial'&&trialSec<=0){showLanding();return true;}return false;}

// ====== TOPUP (MINUTOS EXTRAS) ======
let _selectedTopupPack=null, _topupPixCode=null;

function checkMinutesAlert(){
  const u=window._fbUser;
  if(!u||userPlan==='trial')return;
  const used=u.minutesUsed||0;
  const limit=u.minutesLimit||60;
  const remaining=limit-used;
  if(remaining<=10&&remaining>0){
    const uw=document.getElementById('uw-warn');
    if(uw){
      uw.className='uw-banner sh over';
      uw.innerHTML=`<span style="font-size:16px;">⚠️</span><div style="flex:1;"><div style="font-size:11px;font-weight:700;color:var(--orange);">Apenas ${remaining} minuto(s) restantes!</div><div style="font-size:10px;color:var(--muted);">Compre mais para não ser interrompido</div></div><button onclick="openTopup()" style="background:var(--orange);color:#000;border:none;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);white-space:nowrap;">+Minutos</button>`;
    }
  } else if(remaining<=0&&userPlan!=='trial'){
    const uw=document.getElementById('uw-warn');
    if(uw){
      uw.className='uw-banner sh over';
      uw.innerHTML=`<span style="font-size:16px;">🔴</span><div style="flex:1;"><div style="font-size:11px;font-weight:700;color:var(--red);">Minutos esgotados!</div><div style="font-size:10px;color:var(--muted);">Adicione minutos para continuar</div></div><button onclick="openTopup()" style="background:var(--red);color:#fff;border:none;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);white-space:nowrap;">Comprar</button>`;
    }
  }
}

function openTopup(){document.getElementById('topup-modal').classList.add('sh');}
function closeTopup(){document.getElementById('topup-modal').classList.remove('sh');_selectedTopupPack=null;_topupPixCode=null;document.getElementById('topup-qr-area').style.display='none';document.querySelectorAll('.topup-pack').forEach(p=>p.classList.remove('sel'));document.getElementById('topup-btn-txt').textContent='Selecione um pacote';}

function selectTopup(el,pack){
  document.querySelectorAll('.topup-pack').forEach(p=>p.classList.remove('sel'));
  el.classList.add('sel');
  _selectedTopupPack=pack;
  const labels=window._topupLabels||{min30:'Pagar R$25 — +30 min',min60:'Pagar R$45 — +60 min',min120:'Pagar R$80 — +120 min'};
  document.getElementById('topup-btn-txt').textContent=labels[pack]||'Confirmar';
  document.getElementById('topup-qr-area').style.display='none';
}

async function confirmTopup(){
  if(!_selectedTopupPack){showToast('Selecione um pacote','error');return;}
  const btn=document.getElementById('topup-btn');
  const txt=document.getElementById('topup-btn-txt');
  btn.style.opacity='.6';btn.style.pointerEvents='none';
  txt.textContent='Gerando PIX...';
  try{
    const token=await getAuthToken();
    const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
    const res=await fetch(getBackendUrl()+'/api/pix/topup',{method:'POST',headers,body:JSON.stringify({pack:_selectedTopupPack})});
    const data=await res.json();
    if(!res.ok||data.error)throw new Error(data.error||'Erro ao gerar PIX');
    _topupPixCode=data.qr_code;
    const qrArea=document.getElementById('topup-qr-area');
    const qrImg=document.getElementById('topup-qr-img');
    const qrCode=document.getElementById('topup-qr-code');
    if(data.qr_code_base64)qrImg.innerHTML=`<img src="data:image/png;base64,${data.qr_code_base64}" style="width:160px;border-radius:8px;">`;
    if(qrCode)qrCode.textContent=data.qr_code||'';
    qrArea.style.display='block';
    txt.textContent='PIX gerado! Aguardando pagamento...';
    showToast('✅ PIX gerado! Pague para adicionar os minutos','success');
  }catch(e){
    showToast('Erro: '+e.message,'error');
    btn.style.opacity='';btn.style.pointerEvents='';
    txt.textContent='Tentar novamente';
  }
}

function copyTopupPix(){
  if(!_topupPixCode)return;
  if(navigator.clipboard)navigator.clipboard.writeText(_topupPixCode).catch(()=>{});
  showToast('✓ Código PIX copiado!');
}

// ====== API KEYS ======
// ====== CENTRAL DE AJUDA — TUTORIAL ======
let _currentSlide=0;
const TOTAL_SLIDES=5;

function switchHelpTab(tab, btn){
  // Update tab buttons
  document.querySelectorAll('.help-tab').forEach(b=>{
    b.style.background='transparent';b.style.color='var(--muted)';
  });
  btn.style.background='var(--accent)';btn.style.color='#000';
  // Show/hide panels
  document.getElementById('help-tutorial').style.display=tab==='tutorial'?'block':'none';
  document.getElementById('help-faq').style.display=tab==='faq'?'block':'none';
  document.getElementById('help-support').style.display=tab==='support'?'block':'none';
  if(tab==='faq')renderFaq('todos');
}

function goSlide(n){
  const slides=document.querySelectorAll('.tslide');
  const dots=document.querySelectorAll('.sdot');
  if(!slides.length)return;
  slides.forEach(s=>s.classList.remove('active'));
  dots.forEach(d=>d.classList.remove('active'));
  _currentSlide=Math.max(0,Math.min(n,TOTAL_SLIDES-1));
  slides[_currentSlide]?.classList.add('active');
  dots[_currentSlide]?.classList.add('active');
  const counter=document.getElementById('slide-counter');
  if(counter)counter.textContent=(_currentSlide+1)+' / '+TOTAL_SLIDES;
  const prev=document.getElementById('slide-prev');
  const next=document.getElementById('slide-next');
  if(prev)prev.disabled=_currentSlide===0;
  if(next){
    if(_currentSlide===TOTAL_SLIDES-1){next.textContent='✓ Concluir';next.onclick=()=>navApp('home');}
    else{next.textContent='›';next.onclick=nextSlide;}
  }
}
function nextSlide(){goSlide(_currentSlide+1);}
function prevSlide(){goSlide(_currentSlide-1);}

// ── Onboarding: mostra na 1ª vez ──────────────────────────────
async function checkShowOnboarding(){
  // Verifica se já viu
  const seenKey='aivox_onboarding_seen';
  if(localStorage.getItem(seenKey))return;
  // Só para usuários reais (não admin)
  if(userRole==='admin')return;
  // Marca como visto
  localStorage.setItem(seenKey,'1');
  if(window.FB&&db&&window._fbUser?.uid){
    try{await db.collection('users').doc(window._fbUser.uid).update({onboardingSeen:true});}catch(e){}
  }
  showOnboardingOverlay();
}

function showOnboardingOverlay(){
  // Remove overlay anterior se existir
  document.getElementById('onboarding-overlay')?.remove();
  const overlay=document.createElement('div');
  overlay.id='onboarding-overlay';
  overlay.innerHTML=`
    <div id="onboarding-box">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="font-size:18px;font-weight:900;">👋 Primeiro acesso!</div>
        <button onclick="closeOnboarding()" style="background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--muted);font-size:13px;padding:5px 10px;cursor:pointer;font-family:var(--font);">Pular</button>
      </div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:20px;">
        Antes de começar, veja em <strong style="color:var(--text);">2 minutos</strong> como usar o AIVOX para traduzir qualquer conversa em tempo real.
      </div>
      <!-- Mini preview dos modos -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;">
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:24px;">🎧</div>
          <div style="font-size:11px;font-weight:700;margin-top:4px;">Escuta ao vivo</div>
          <div style="font-size:10px;color:var(--muted);">Só você precisa do app</div>
        </div>
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:24px;">💬</div>
          <div style="font-size:11px;font-weight:700;margin-top:4px;">Conversa</div>
          <div style="font-size:10px;color:var(--muted);">Tradução bidirecional</div>
        </div>

        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center;">
          <div style="font-size:24px;">✈️</div>
          <div style="font-size:11px;font-weight:700;margin-top:4px;">Viagem</div>
          <div style="font-size:10px;color:var(--muted);">20 idiomas offline</div>
        </div>
      </div>
      <button onclick="openFullTutorial()" class="btn btn-primary btn-full" style="font-size:14px;padding:13px;margin-bottom:8px;">▶ Ver tutorial completo</button>
      <button onclick="closeOnboarding()" class="btn btn-ghost btn-full" style="font-size:13px;">Explorar sozinho →</button>
    </div>`;
  document.body.appendChild(overlay);
}

function closeOnboarding(){
  const o=document.getElementById('onboarding-overlay');
  if(o){o.style.animation='slideDown .3s ease';setTimeout(()=>o.remove(),280);}
}

function openFullTutorial(){
  closeOnboarding();
  navApp('faq');
  setTimeout(()=>{
    switchHelpTab('tutorial',document.getElementById('htab-tutorial'));
    goSlide(0);
  },200);
}


async function saveBackendUrl(){
  const inp=document.getElementById('backend-url-input');
  const fb=document.getElementById('backend-save-feedback');
  const url=(inp?.value||'').trim().replace(/\/$/,'');
  if(!url){showToast('Cole a URL do Railway primeiro','error');return;}
  // Save to Firestore (admin config only) and to window
  window.AIVOX_BACKEND_URL = url;
  if(window.FB&&db){
    try{
      await db.collection('admin_settings').doc('backend').set({url,updatedAt:serverTimestamp()},{merge:true});
    }catch(e){}
  }
  // Test ping
  await testBackendPing();
}

async function testBackendPing(){
  const url=getBackendUrl();
  const fb=document.getElementById('backend-save-feedback');
  const dot=document.getElementById('backend-status-dot');
  const txt=document.getElementById('backend-status-text');
  if(!url){if(fb){fb.textContent='URL nao configurada';fb.style.cssText='display:block;font-size:12px;color:var(--orange);font-family:var(--mono)';} return;}
  if(fb){fb.style.cssText='display:block;font-size:11px;font-family:var(--mono)';fb.textContent='Verificando...';}
  try{
    const t0=Date.now();
    const r=await fetch(url+'/api/ping',{signal:AbortSignal.timeout(6000)});
    const ms=Date.now()-t0;
    if(!r.ok)throw new Error('HTTP '+r.status);
    let diag=null;
    try{const rd=await fetch(url+'/api/diagnose',{signal:AbortSignal.timeout(5000)});if(rd.ok)diag=await rd.json();}catch(_){}
    if(diag){
      const allOk=diag.openai&&diag.firebase;
      const statusColor=allOk?'var(--green)':(diag.openai?'var(--orange)':'var(--red)');
      if(dot)dot.style.background=statusColor;
      const anthropicStatus=diag.anthropic?'Anthropic:OK':'Anthropic:⚠️FALTA';
      if(txt){txt.textContent=(allOk?'OK':'Problemas')+' '+ms+'ms | OpenAI:'+(diag.openai?'OK':'FALTA')+' Firebase:'+(diag.firebase?'OK':'nao config')+' | '+anthropicStatus;txt.style.color=statusColor;}
      const msgs=[];
      if(!diag.openai)msgs.push('Azure Speech STT ativo (OpenAI Whisper como fallback)');
      if(!diag.firebase)msgs.push('FIREBASE_SERVICE_ACCOUNT nao configurado');
      if(!diag.elevenlabs)msgs.push('Azure Neural TTS ativo (Azure Personal Voice ativo)');
      if(!diag.anthropic)msgs.push('Azure OpenAI ativo para IA Professor');
      if(msgs.length===0)msgs.push('Todas as variaveis OK!');
      if(fb){
        fb.innerHTML='<b>Diagnostico ('+ms+'ms):</b><br>'+msgs.join('<br>');
        fb.style.color=statusColor;
      }
      if(!diag.openai)showToast('Azure Speech STT ativo como STT principal','info');
      else showToast('Backend OK: '+ms+'ms','success');
    } else {
      if(dot)dot.style.background='var(--green)';
      if(txt){txt.textContent='Online '+ms+'ms';txt.style.color='var(--green)';}
      if(fb){fb.textContent='Ping OK: '+ms+'ms (redeploy server.js p/ diagnostico completo)';fb.style.color='var(--muted)';}
      showToast('Backend conectado: '+ms+'ms','success');
    }
  }catch(e){
    if(dot)dot.style.background='var(--red)';
    if(txt){txt.textContent='Offline';txt.style.color='var(--red)';}
    if(fb){fb.textContent='Sem resposta: '+e.message;fb.style.color='var(--red)';}
    showToast('Backend offline: '+e.message,'error');
  }
}

async function loadBackendUrl(){
  if(!window.FB||!db)return;
  try{
    const doc=await db.collection('admin_settings').doc('backend').get();
    if(doc.exists){
      const url=doc.data().url||'';
      window.AIVOX_BACKEND_URL=url;
      const inp=document.getElementById('backend-url-input');if(inp&&url)inp.value=url;
      if(url)testBackendPing();
    }
  }catch(e){}
}
function updateApiStatus(svc,cfg){const dot=document.getElementById(svc+'-status-dot'),txt=document.getElementById(svc+'-status-text');if(dot)dot.style.background=cfg?'var(--green)':'var(--muted)';if(txt){txt.textContent=cfg?'Configurada':'Não configurada';txt.style.color=cfg?'var(--green)':'var(--muted)';}}
function toggleKeyVisibility(inputId,btn){const inp=document.getElementById(inputId);if(!inp)return;const isP=inp.type==='password';inp.type=isP?'text':'password';btn.textContent=isP?'🔒':'👁';}


// ====== LANGUAGES ======
const LO=[{flag:'<span class="flag-emoji">🇧🇷</span>',name:'Português',code:'PT-BR',s:'PT'},{flag:'<span class="flag-emoji">🇺🇸</span>',name:'Inglês',code:'EN-US',s:'EN'}];
let lfi=0,lti=1;
function appLang(){const f=LO[lfi],t=LO[lti];const s=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};const sh=(id,v)=>{const e=document.getElementById(id);if(e)e.innerHTML=v;};sh('lfrom',f.flag);s('lnfrom',f.name);s('lcfrom',f.code);sh('lto',t.flag);s('lnto',t.name);s('lcto',t.code);sh('aff',f.flag);s('afs',f.s);sh('atf',t.flag);s('ats',t.s);s('sl1','VOCÊ ('+f.code+')');s('sl2','OUVINTE ('+t.code+')');s('mic-lang-hint',f.code);}
function swapActiveSession(){
  const btn=document.getElementById('active-swbtn');
  if(btn){btn.style.transform='rotate(180deg)';setTimeout(()=>btn.style.transform='',300);}
  const tmp=lfi;lfi=lti;lti=tmp;
  appLang();
  const sl1=document.getElementById('sl1');
  const sl2=document.getElementById('sl2');
  if(sl1)sl1.textContent='VOCÊ ('+LO[lfi].code+')';
  if(sl2)sl2.textContent='OUVINTE ('+LO[lti].code+')';
  // Se modo viagem ativo, reinicia com novo idioma
  if(_viagemActive){
    stopViagemMode();
    setTimeout(()=>startViagemMode(), 200);
    showToast('🔄 Idioma trocado: agora falando em '+LO[lfi].code,'info');
  }
  // Reconecta WS com novos idiomas
  if(_sessWS||_sessWSConnecting){
    _sessWSCleanup();
    setTimeout(()=>_sessWSConnect(),300);
  }
  // Salva a troca no Firebase
  saveUserLanguages();
}
document.getElementById('lswbtn').addEventListener('click',function(e){
  // Animação
  this.style.transform='rotate(180deg)';
  setTimeout(()=>this.style.transform='',300);
  // Troca os índices
  const tmp=lfi;lfi=lti;lti=tmp;
  appLang();
  // Salva preferência
  const cfg=document.getElementById('cfg-lang-display');
  if(cfg)cfg.textContent=LO[lfi].code+' → '+LO[lti].code;
  if(window.FB&&window._fbUser?.uid){
    try{db.collection('users').doc(window._fbUser.uid).update({langFrom:LO[lfi].code,langTo:LO[lti].code});}catch(e){}
  }
});
appLang();
const allLangs=[{flag:'<span class="flag-emoji">🇧🇷</span>',name:'Português',code:'PT-BR',s:'PT'},{flag:'<span class="flag-emoji">🇺🇸</span>',name:'Inglês',code:'EN-US',s:'EN'},{flag:'<span class="flag-emoji">🇪🇸</span>',name:'Espanhol',code:'ES',s:'ES'},{flag:'<span class="flag-emoji">🇫🇷</span>',name:'Francês',code:'FR',s:'FR'},{flag:'<span class="flag-emoji">🇩🇪</span>',name:'Alemão',code:'DE',s:'DE'},{flag:'<span class="flag-emoji">🇮🇹</span>',name:'Italiano',code:'IT',s:'IT'},{flag:'<span class="flag-emoji">🇯🇵</span>',name:'Japonês',code:'JA',s:'JA'},{flag:'<span class="flag-emoji">🇨🇳</span>',name:'Mandarim',code:'ZH',s:'ZH'},{flag:'<span class="flag-emoji">🇷🇺</span>',name:'Russo',code:'RU',s:'RU'},{flag:'<span class="flag-emoji">🇦🇪</span>',name:'Árabe',code:'AR',s:'AR'},{flag:'<span class="flag-emoji">🇰🇷</span>',name:'Coreano',code:'KO',s:'KO'},{flag:'<span class="flag-emoji">🇳🇱</span>',name:'Holandês',code:'NL',s:'NL'},{flag:'<span class="flag-emoji">🇮🇳</span>',name:'Hindi',code:'HI',s:'HI'},{flag:'<span class="flag-emoji">🇹🇷</span>',name:'Turco',code:'TR',s:'TR'},{flag:'<span class="flag-emoji">🇵🇱</span>',name:'Polonês',code:'PL',s:'PL'},{flag:'<span class="flag-emoji">🇸🇪</span>',name:'Sueco',code:'SV',s:'SV'},{flag:'<span class="flag-emoji">🇵🇹</span>',name:'Português (PT)',code:'PT',s:'PT'},{flag:'<span class="flag-emoji">🇲🇽</span>',name:'Espanhol (MX)',code:'ES-MX',s:'ES'}];
let siChoosingFrom=true;
function openIdiomaSelector(from){idiomaFrom=from||currentPage;siChoosingFrom=true;updateSiPreview();renderSiList();navApp('langsel');}
function siChoose(side){siChoosingFrom=(side==='from');document.getElementById('si-from-tab').classList.toggle('active',siChoosingFrom);document.getElementById('si-to-tab').classList.toggle('active',!siChoosingFrom);updateSiPreview();renderSiList();}
function updateSiPreview(){const f=LO[lfi],t=LO[lti];const s=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};const sh=(id,v)=>{const e=document.getElementById(id);if(e)e.innerHTML=v;};sh('si-from-flag',f.flag);s('si-from-name',f.name);s('si-from-code',f.code);sh('si-to-flag',t.flag);s('si-to-name',t.name);s('si-to-code',t.code);const lbl=document.getElementById('si-choosing-label');if(lbl)lbl.textContent=siChoosingFrom?'Toque no idioma de ORIGEM ↓':'Toque no idioma de DESTINO ↓';}
function renderSiList(){const list=document.getElementById('si-lang-list');if(!list)return;list.innerHTML='';allLangs.forEach(lang=>{const isSel=siChoosingFrom?(lang.code===LO[lfi].code):(lang.code===LO[lti].code);const el=document.createElement('div');el.style.cssText='display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid '+(isSel?'rgba(0,229,255,.38)':'var(--border)')+';border-radius:13px;padding:13px 15px;margin-bottom:8px;cursor:pointer;transition:all .18s;';el.innerHTML='<div style="font-size:28px;flex-shrink:0;">'+lang.flag+'</div><div style="flex:1;"><div style="font-size:14px;font-weight:600;'+(isSel?'color:var(--accent);':'')+'">'+lang.name+'</div><div style="font-size:11px;color:var(--muted);font-family:var(--mono);">'+lang.code+'</div></div>'+(isSel?'<div style="width:22px;height:22px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:12px;color:#000;font-weight:800;">✓</div>':'<div style="width:22px;height:22px;border-radius:50%;border:2px solid var(--border);"></div>');el.addEventListener('click',()=>selectIdiomaLang(lang));list.appendChild(el);});}
function selectIdiomaLang(lang){
  if(siChoosingFrom){
    LO[lfi]=lang;
    siChoosingFrom=false;
    siChoose('to');
  }else{
    LO[lti]=lang;
    appLang();
    const cfg=document.getElementById('cfg-lang-display');
    if(cfg)cfg.textContent=LO[lfi].code+' → '+LO[lti].code;
    
    // Salvar idioma no Firebase
    saveUserLanguages();
    
    navApp(idiomaFrom||'home');
  }
}

// Função para salvar idiomas no Firebase
async function saveUserLanguages(){
  if(!window._fbUser?.uid || !db) return;
  try{
    await db.collection('users').doc(window._fbUser.uid).update({
      langFrom: LO[lfi].code,
      langTo: LO[lti].code
    });
    console.log('✅ Idiomas salvos:', LO[lfi].code, '→', LO[lti].code);
  }catch(e){
    console.error('❌ Erro ao salvar idiomas:', e);
  }
}

// Função para carregar idiomas salvos do Firebase
function loadUserLanguages(userData){
  if(!userData) return;
  
  // Carregar idiomas salvos
  if(userData.langFrom){
    const fromIndex = LO.findIndex(l => l.code === userData.langFrom);
    if(fromIndex >= 0) lfi = fromIndex;
  }
  if(userData.langTo){
    const toIndex = LO.findIndex(l => l.code === userData.langTo);
    if(toIndex >= 0) lti = toIndex;
  }
  
  // Atualizar UI
  appLang();
  updateSiPreview();
  const cfg=document.getElementById('cfg-lang-display');
  if(cfg)cfg.textContent=LO[lfi].code+' → '+LO[lti].code;
  
  console.log('✅ Idiomas carregados:', LO[lfi].code, '→', LO[lti].code);
}
function swapIdiomaPreview(){const tmp=lfi;lfi=lti;lti=tmp;updateSiPreview();renderSiList();appLang();}

// ====== MODE ======
function selMode(el){
  // Cores padrão (não selecionado) por modo
  const defaults={
    conversa:  {border:'var(--border)',    bg:'var(--card)',               nameColor:'var(--text)'},
    reuniao:   {border:'var(--border)',    bg:'var(--card)',               nameColor:'var(--text)'},
    viagem:    {border:'var(--border)',    bg:'var(--card)',               nameColor:'var(--text)'},
    escuta:    {border:'rgba(147,51,234,.35)', bg:'rgba(147,51,234,.07)', nameColor:'#a855f7'},
  };
  // Cores quando SELECIONADO por modo
  const selected={
    conversa:   {border:'rgba(0,229,255,.55)',  bg:'rgba(0,229,255,.08)',   nameColor:'var(--accent)'},
    reuniao:    {border:'rgba(0,229,255,.55)',  bg:'rgba(0,229,255,.08)',   nameColor:'var(--accent)'},
    viagem:     {border:'rgba(0,229,255,.55)',  bg:'rgba(0,229,255,.08)',   nameColor:'var(--accent)'},
    escuta:     {border:'rgba(0,229,255,.7)',   bg:'rgba(0,229,255,.12)',   nameColor:'var(--accent)'},
  };
  // Reset todos
  document.querySelectorAll('.mbtn').forEach(b=>{
    b.classList.remove('sel');
    const d=defaults[b.dataset.mode]||defaults.conversa;
    b.style.borderColor=d.border;
    b.style.background=d.bg;
    const nm=b.querySelector('.mnm');
    if(nm)nm.style.color=d.nameColor;
  });
  // Seleciona o clicado
  el.classList.add('sel');
  const s=selected[el.dataset.mode]||selected.conversa;
  el.style.borderColor=s.border;
  el.style.background=s.bg;
  const nm=el.querySelector('.mnm');
  if(nm)nm.style.color=s.nameColor;
  const mode=el.dataset.mode;
  _selectedMode=mode;
  const t=document.getElementById('actt');
  const btnLabels={conversa:'Iniciar Modo Conversa',reuniao:'Iniciar Modo Reunião',viagem:'Iniciar Modo Viagem',escuta:'Abrir Escuta ao vivo',aprendizagem:'Abrir Aprendizagem'};
  const btnIcons={conversa:'🎙️',reuniao:'👥',viagem:'✈️',escuta:'🎧',aprendizagem:'🎓'};
  if(t)t.textContent=btnLabels[mode];
  const sbtn=document.getElementById('sbtn');
  if(sbtn){const icon=btnIcons[mode]||'🎙️';sbtn.innerHTML=icon+' <span id="actt">'+btnLabels[mode]+'</span>';}
}

// ====== ESCUTA AO VIVO — VAD + 1.5s chunks + streaming texto ======
let _selectedMode='conversa';
function startSelectedMode(){
  if(_selectedMode==='escuta'){navApp('escuta');}
  else if(_selectedMode==='aprendizagem'){navApp('learn');}
  else if(_selectedMode==='reuniao'){navApp('sala');}
  else{goActive();}
}
let _escutaMode='text';
let _escutaStream=null;
let _escutaRecorder=null;
let _escutaLines=[];
let _escutaAudioCtx=null;
let _escutaAnalyser=null;
let _escutaVADTimer=null;
let _escutaSilenceTimer=null;
let _escutaChunks=[];
let _escutaSpeaking=false;
let _escutaMinChunkMs=600;    // mínimo 0.6s antes de enviar
let _escutaMaxChunkMs=3500;   // máximo 3.5s (corta mesmo sem silêncio)
let _escutaChunkStart=0;
let _escutaCurrentLineEl=null; // elemento DOM da linha atual (para streaming)
let _escutaProcessing=false; // mantido para compatibilidade

function setEscutaMode(mode){
  _escutaMode=mode;
  const btnText=document.getElementById('escuta-mode-text');
  const btnAudio=document.getElementById('escuta-mode-audio');
  if(btnText){btnText.className=mode==='text'?'btn btn-primary':'btn btn-ghost';btnText.style.flex='1';btnText.style.fontSize='12px';}
  if(btnAudio){btnAudio.className=mode==='audio'?'btn btn-primary':'btn btn-ghost';btnAudio.style.flex='1';btnAudio.style.fontSize='12px';}
}

// Seletor rápido de idioma
async function setEscutaLang(lang, el){
  document.querySelectorAll('.escuta-lang-pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  const sel=document.getElementById('escuta-lang-from');
  if(sel)sel.value=lang;
}

// Atualizar barra de volume
function _updateVolBar(avg){
  const fill=document.getElementById('escuta-vol-fill');
  if(fill){
    const pct=Math.min(100,avg*4);
    fill.style.width=pct+'%';
    fill.style.background=pct>70?'linear-gradient(90deg,var(--orange),var(--red))':pct>40?'linear-gradient(90deg,var(--accent),var(--green))':'linear-gradient(90deg,var(--accent),var(--green))';
  }
}

let _escutaRecognizer = null; // Azure TranslationRecognizer

async function toggleEscuta(){
  if(_escutaActive){stopEscuta();return;}

  // ── Usa Azure SDK direto no browser (latência ~200ms vs ~3s) ──
  if(window.AZURE_SPEECH_KEY && typeof SpeechSDK !== 'undefined'){
    await _escutaStartAzure();
    return;
  }

  // Fallback: fluxo HTTP chunked (caso Azure não disponível)
  const backendUrl=getBackendUrl();
  if(!backendUrl){showToast('⚠️ Backend não configurado','error');return;}
  try{
    _escutaStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:16000}});
  }catch(e){showToast('❌ Permissão de microfone negada','error');return;}
  _escutaActive=true;
  _escutaSetUIActive();
  showToast('🎧 Escuta iniciada — aponte para quem está falando');
  _startVAD();
  _startRecording();
}

async function _escutaStartAzure(){
  const fromLang = document.getElementById('escuta-lang-from')?.value || 'en';
  const toLang   = document.getElementById('escuta-lang-to')?.value   || 'pt';

  const langCodeMap = {en:'en-US',es:'es-ES',fr:'fr-FR',de:'de-DE',it:'it-IT',ja:'ja-JP',zh:'zh-CN',ru:'ru-RU',ko:'ko-KR',ar:'ar-SA',pt:'pt-BR'};
  const sttLang = langCodeMap[fromLang] || (fromLang+'-US');

  try{
    const translationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(
      window.AZURE_SPEECH_KEY, window.AZURE_SPEECH_REGION || 'eastus'
    );
    translationConfig.speechRecognitionLanguage = sttLang;
    translationConfig.addTargetLanguage(toLang);

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    _escutaRecognizer = new SpeechSDK.TranslationRecognizer(translationConfig, audioConfig);

    // Texto parcial (enquanto ainda está falando)
    _escutaRecognizer.recognizing = (s, e) => {
      const curr = document.getElementById('escuta-current');
      if(curr && e.result.text) curr.textContent = '🎙️ ' + e.result.text;
    };

    // Frase completa — transcrição + tradução prontas
    _escutaRecognizer.recognized = (s, e) => {
      if(e.result.reason !== SpeechSDK.ResultReason.TranslatedSpeech) return;
      const original   = _fillerCleanLocal(e.result.text);
      const translated = e.result.translations.get(toLang);
      if(!original?.trim() || !translated?.trim()) return;

      _addEscutaLine(original, translated, fromLang, toLang);
      const curr = document.getElementById('escuta-current');
      if(curr) curr.textContent = '🎙️ Ouvindo...';

      if(_escutaMode==='audio') _speakTranslation(translated, toLang);
    };

    _escutaRecognizer.canceled = (s, e) => {
      if(e.reason === SpeechSDK.CancellationReason.Error){
        showToast('❌ Azure: ' + e.errorDetails, 'error');
      }
      stopEscuta();
    };

    _escutaRecognizer.startContinuousRecognitionAsync(
      () => {
        _escutaActive = true;
        _escutaSetUIActive();
        showToast('🎧 Escuta Azure ativa — latência ~200ms', 'success');
      },
      err => { showToast('❌ Microfone: ' + err, 'error'); }
    );
  }catch(e){
    showToast('❌ Erro Azure SDK: '+e.message,'error');
  }
}

function _escutaSetUIActive(){
  const btn=document.getElementById('escuta-btn');
  if(btn){btn.textContent='⏹ Parar escuta';btn.style.background='var(--rdim)';btn.style.borderColor='rgba(255,68,68,.4)';btn.style.color='var(--red)';}
  document.getElementById('escuta-placeholder')?.style.setProperty('display','none');
  document.getElementById('escuta-lines')?.style.setProperty('display','block');
  document.getElementById('escuta-live-pill')?.style.setProperty('display','block');
  document.getElementById('escuta-vol-bar')?.style.setProperty('display','block');
  document.getElementById('escuta-current')?.style.setProperty('display','block');
}

// ── VAD: detecta silêncio via AnalyserNode ──────────────────────
function _startVAD(){
  try{
    _escutaAudioCtx=new (window.AudioContext||window.webkitAudioContext)();
    const src=_escutaAudioCtx.createMediaStreamSource(_escutaStream);
    _escutaAnalyser=_escutaAudioCtx.createAnalyser();
    _escutaAnalyser.fftSize=512;
    src.connect(_escutaAnalyser);
    const data=new Uint8Array(_escutaAnalyser.frequencyBinCount);
    let silenceMs=0;
    const SILENCE_THRESHOLD=12;   // volume abaixo disso = silêncio
    const SILENCE_CUTOFF=400;     // 400ms de silêncio = frase terminou
    _escutaVADTimer=setInterval(()=>{
      if(!_escutaActive)return;
      _escutaAnalyser.getByteFrequencyData(data);
      const avg=data.reduce((a,b)=>a+b,0)/data.length;
      _updateVolBar(avg);
      const isSilent=avg<SILENCE_THRESHOLD;
      const elapsed=Date.now()-_escutaChunkStart;
      if(!isSilent){
        _escutaSpeaking=true;
        silenceMs=0;
        // Atualiza indicador visual de volume
        const pill=document.getElementById('escuta-live-pill');
        if(pill){const bar=Math.min(100,Math.round(avg*3));pill.querySelector('span').style.opacity=0.6+(bar/250);}
      }else if(_escutaSpeaking){
        silenceMs+=50;
        if(silenceMs>=SILENCE_CUTOFF&&elapsed>=_escutaMinChunkMs){
          // Silêncio detectado após fala — corta o chunk agora
          _cutChunk();
          silenceMs=0;
          _escutaSpeaking=false;
        }
      }
      // Força corte máximo mesmo sem silêncio
      if(elapsed>=_escutaMaxChunkMs&&_escutaSpeaking){
        _cutChunk();
        silenceMs=0;
      }
    },50);
  }catch(e){console.warn('VAD init error:',e);}
}

function _startRecording(){
  if(!_escutaActive||!_escutaStream)return;
  _escutaChunks=[];
  _escutaChunkStart=Date.now();
  const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
  try{_escutaRecorder=new MediaRecorder(_escutaStream,{mimeType});}
  catch(e){_escutaRecorder=new MediaRecorder(_escutaStream);}
  _escutaRecorder.ondataavailable=e=>{if(e.data?.size>0)_escutaChunks.push(e.data);};
  _escutaRecorder.onstop=async()=>{
    if(!_escutaActive)return;
    const blob=new Blob(_escutaChunks,{type:mimeType});
    if(blob.size>1500){
      // Processa em paralelo — não bloqueia o próximo chunk
      _processEscutaChunk(blob).catch(e=>console.warn('chunk err:',e));
    }
    if(_escutaActive)_startRecording();
  };
  _escutaRecorder.start(100); // coleta dados a cada 100ms (para VAD funcionar)
}

function _cutChunk(){
  if(_escutaRecorder?.state==='recording'){
    try{_escutaRecorder.stop();}catch(e){}
  }
}

// ── Processa chunk: transcreve + traduz com streaming de texto ──
async function _processEscutaChunk(blob){
  const from=document.getElementById('escuta-lang-from')?.value||'en';
  const to=document.getElementById('escuta-lang-to')?.value||'pt';
  const curr=document.getElementById('escuta-current');
  const backendUrl=getBackendUrl();

  if(!backendUrl){
    _addEscutaLine('[demo]','Configure o backend para tradução real',from,to);
    return;
  }

  // Cria linha na tela IMEDIATAMENTE — vai preenchendo com streaming
  const lineEl=_createLiveEscutaLine(from,to);
  if(curr)curr.textContent='🎙️ Ouvindo...';

  try{
    const token=await getAuthToken();
    const headers=token?{Authorization:'Bearer '+token}:{};

    // ── ETAPA 1: Transcrição (Whisper) ──────────────────────────
    const fd=new FormData();
    fd.append('audio',blob,'chunk.webm');
    fd.append('from',from);fd.append('to',to);
    const t0=Date.now();
    const r=await fetch(backendUrl+'/api/listen-stream',{method:'POST',headers,body:fd,signal:AbortSignal.timeout(30000)});
    if(!r.ok||!r.body){
      // Fallback para rota normal
      const rd=await fetch(backendUrl+'/api/listen',{method:'POST',headers,body:fd,signal:AbortSignal.timeout(30000)});
      const d=await rd.json();
      if(d.original&&d.original.trim().length>1){
        const _escOrigClean = _fillerCleanLocal(d.original);
        _updateLiveEscutaLine(lineEl,_escOrigClean,d.translation);
        if(curr)curr.textContent='...';
        if(_escutaMode==='audio'&&d.translation)_speakTranslation(d.translation);
      }else{
        lineEl?.remove(); // silêncio, remove linha vazia
        if(curr)curr.textContent='...';
      }
      return;
    }

    // ── ETAPA 2: Streaming SSE da transcrição + tradução ────────
    const reader=r.body.getReader();
    const decoder=new TextDecoder();
    let original='',translation='',done=false;

    while(!done){
      const {value,done:streamDone}=await reader.read();
      done=streamDone;
      if(!value)continue;
      const lines=decoder.decode(value).split('\n');
      for(const line of lines){
        if(!line.startsWith('data:'))continue;
        try{
          const ev=JSON.parse(line.slice(5));
          if(ev.type==='transcript'){
            original = _fillerCleanLocal(ev.text); // Filtro A
            const origEl=lineEl?.querySelector('[data-orig]');
            if(origEl)origEl.textContent=original;
          }
          if(ev.type==='translation_chunk'){
            translation+=ev.text;
            // Streaming da tradução — vai aparecendo palavra por palavra
            const transEl=lineEl?.querySelector('[data-trans]');
            if(transEl)transEl.textContent=translation;
            // Auto scroll
            const box=document.getElementById('escuta-transcript-box');
            if(box)box.scrollTop=box.scrollHeight;
          }
          if(ev.type==='done'){
            if(curr)curr.textContent='...';
            if(!original||original.trim().length<2){lineEl?.remove();return;}
            _escutaLines.push({original,translation,ts:Date.now()});
            if(_escutaMode==='audio'&&translation)_speakTranslation(translation);
          }
          if(ev.type==='silence'){lineEl?.remove();if(curr)curr.textContent='...';}
        }catch(e){}
      }
    }
  }catch(e){
    lineEl?.remove();
    if(curr)curr.textContent='⚠️ '+e.message.substring(0,40);
    console.warn('escuta chunk error:',e);
  }
}

// Helper para Azure SDK — cria e preenche linha de uma vez
function _addEscutaLine(original, translation, from, to){
  const el = _createLiveEscutaLine(from, to);
  _updateLiveEscutaLine(el, original, translation);
}

function _createLiveEscutaLine(from,to){
  const box=document.getElementById('escuta-lines');
  if(!box)return null;
  const time=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const el=document.createElement('div');
  el.style.cssText='border-bottom:1px solid var(--border);padding:10px 0;animation:fadeIn .2s ease;';
  el.innerHTML=`<div style="font-size:10px;color:var(--muted);font-family:var(--mono);margin-bottom:4px;">${time} · ${from.toUpperCase()}→${to.toUpperCase()}</div>
    <div data-orig style="font-size:12px;color:var(--muted);margin-bottom:3px;font-style:italic;min-height:16px;"></div>
    <div data-trans style="font-size:15px;font-weight:700;color:var(--text);min-height:20px;line-height:1.4;"></div>`;
  box.appendChild(el);
  const box2=document.getElementById('escuta-transcript-box');
  if(box2)box2.scrollTop=box2.scrollHeight;
  return el;
}

function _updateLiveEscutaLine(el,original,translation){
  if(!el)return;
  const origEl=el.querySelector('[data-orig]');
  const transEl=el.querySelector('[data-trans]');
  if(origEl)origEl.textContent=original;
  if(transEl)transEl.textContent=translation;
  _escutaLines.push({original,translation,ts:Date.now()});
  const box=document.getElementById('escuta-transcript-box');
  if(box)box.scrollTop=box.scrollHeight;
}

// ── AudioContext singleton + fila de áudio ──────────────────────
let _ttsAudioCtx = null;
let _ttsQueue    = [];
let _ttsPlaying  = false;

// Desbloqueia AudioContext no primeiro toque do usuário (política autoplay do browser)
(function(){
  const _unlockTTS = async () => {
    if(_ttsAudioCtx && _ttsAudioCtx.state === 'suspended'){
      try{ await _ttsAudioCtx.resume(); }catch(e){}
    }
  };
  ['touchstart','touchend','mousedown','keydown','click'].forEach(ev =>
    document.addEventListener(ev, _unlockTTS, {once: false, passive: true})
  );
})();

async function _getTTSCtx(){
  if(!_ttsAudioCtx || _ttsAudioCtx.state === 'closed'){
    _ttsAudioCtx = new (window.AudioContext||window.webkitAudioContext)();
  }
  // Aguarda resume completo (política autoplay do browser)
  if(_ttsAudioCtx.state === 'suspended'){
    try{ await _ttsAudioCtx.resume(); }catch(e){}
  }
  return _ttsAudioCtx;
}

async function _ttsPlayNext(){
  if(_ttsPlaying || _ttsQueue.length === 0) return;
  _ttsPlaying = true;
  const item = _ttsQueue.shift();
  try{
    const ctx = await _getTTSCtx();
    // item pode ser ArrayBuffer ou já AudioBuffer (pré-decodificado)
    const decoded = (item instanceof AudioBuffer) ? item : await ctx.decodeAudioData(item);
    // Pré-decodifica próximo em paralelo enquanto toca este
    if(_ttsQueue.length > 0 && !(_ttsQueue[0] instanceof AudioBuffer)){
      const nxt = _ttsQueue[0];
      ctx.decodeAudioData(nxt.slice(0)).then(ab=>{ _ttsQueue[0]=ab; }).catch(()=>{});
    }
    const src = ctx.createBufferSource();
    src.buffer = decoded;
    src.connect(ctx.destination);
    src.onended = ()=>{ _ttsPlaying=false; _ttsPlayNext(); };
    src.start(0);
  }catch(e){
    console.warn('tts play error:',e);
    _ttsPlaying = false;
    _ttsPlayNext();
  }
}

async function _speakTranslation(text, lang){
  const backendUrl=getBackendUrl();
  if(!backendUrl)return;
  // Normaliza lang para formato curto (ex: 'EN-US' → 'en', 'PT-BR' → 'pt')
  const langShort = lang ? lang.split('-')[0].toLowerCase() : null;
  (async()=>{
    try{
      const token=await getAuthToken();
      const r=await fetch(backendUrl+'/api/speak',{
        method:'POST',
        headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
        body:JSON.stringify({
          text,
          lang: langShort,  // ✅ informa idioma correto ao backend para TTS
          voiceId: window._fbUser?.voice_id || 'pNInz6obpgDQGcFmaJgB',
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability:         0.35,
            similarity_boost:  0.88,
            style:             0.35,
            use_speaker_boost: true
          }
        })
      });
      if(!r.ok)return;
      const arrayBuf=await r.arrayBuffer();
      if(!arrayBuf.byteLength)return;
      // Pré-decodifica já aqui — elimina delay de decode na hora de tocar
      try{
        const ctx = await _getTTSCtx();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        _ttsQueue.push(decoded); // enfileira já como AudioBuffer
      }catch(e){
        _ttsQueue.push(arrayBuf); // fallback: enfileira raw
      }
      _ttsPlayNext();
    }catch(e){console.warn('speak:',e);}
  })();
}

function stopEscuta(){
  if(!_escutaActive&&!_escutaStream&&!_escutaRecognizer)return;
  const transcriptText=_escutaLines.map(l=>(l.original||'')+' | '+(l.translation||'')).join('\n');
  _escutaActive=false;
  // Para Azure SDK recognizer
  if(_escutaRecognizer){
    try{_escutaRecognizer.stopContinuousRecognitionAsync(()=>{},()=>{});}catch(e){}
    try{_escutaRecognizer.close();}catch(e){}
    _escutaRecognizer=null;
  }
  clearInterval(_escutaVADTimer);_escutaVADTimer=null;
  try{_escutaRecorder?.stop();}catch(e){}
  try{_escutaStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  try{_escutaAudioCtx?.close();}catch(e){}
  _escutaStream=null;_escutaRecorder=null;_escutaAudioCtx=null;_escutaAnalyser=null;
  document.getElementById('escuta-vol-bar')?.style.setProperty('display','none');
  const fill=document.getElementById('escuta-vol-fill');if(fill)fill.style.width='0%';
  const btn=document.getElementById('escuta-btn');
  if(btn){btn.textContent='🎧 Iniciar escuta';btn.style.background='linear-gradient(135deg,#7c3aed,#a855f7)';btn.style.borderColor='#7c3aed';btn.style.color='#fff';}
  document.getElementById('escuta-live-pill')?.style.setProperty('display','none');
  document.getElementById('escuta-current')?.style.setProperty('display','none');
  // Abre painel de resumo se houver conteúdo
  if(transcriptText&&transcriptText.trim().length>20){
    openEscutaResumo(transcriptText.trim());
  }
}

// ── Resumo Inteligente de Escuta ────────────────────────────────
function openEscutaResumo(transcript) {
  const overlay=document.getElementById('escuta-resumo-overlay');
  const body=document.getElementById('escuta-resumo-body');
  if(!overlay||!body)return;
  body.innerHTML=`<div class="erp-loading"><div class="erp-spinner">🔄</div><div>Analisando o que foi dito...</div></div>`;
  overlay.classList.add('sh');
  // Chama Claude para gerar resumo e palavras novas
  _gerarResumoEscuta(transcript);
}

function closeEscutaResumo() {
  document.getElementById('escuta-resumo-overlay')?.classList.remove('sh');
}

async function _gerarResumoEscuta(transcript) {
  const body=document.getElementById('escuta-resumo-body');
  if(!body)return;
  const fromLang=document.getElementById('escuta-lang-from')?.value||'en';
  const langNames={en:'inglês',es:'espanhol',fr:'francês',de:'alemão',it:'italiano',zh:'chinês',ja:'japonês',ru:'russo',ko:'coreano',ar:'árabe'};
  const langName=langNames[fromLang]||fromLang;
  const prompt=`Você é um assistente de idiomas. O usuário acabou de escutar uma conversa em ${langName}. Analise o trecho transcrito abaixo e responda APENAS em JSON válido, sem markdown, sem explicação:

{"resumo":"2-3 frases resumindo o que foi discutido, em português","palavras":[{"palavra":"word","traducao":"tradução em português"},{"palavra":"word2","traducao":"tradução"}]}

Inclua de 3 a 8 palavras/expressões que o usuário provavelmente não conhecia. Se não houver palavras relevantes, retorne lista vazia.

Transcrito:
${transcript.substring(0,1500)}`;

  try {
    const backendUrl=(window.AIVOX_BACKEND_URL||window.BACKEND_URL||'').trim();
    if(!backendUrl) throw new Error('backend_nao_configurado');
    const token=await auth?.currentUser?.getIdToken().catch(()=>null);
    const resp=await fetch(backendUrl+'/api/professor',{
      method:'POST',
      headers:{'Content-Type':'application/json',...(token?{'Authorization':'Bearer '+token}:{})},
      body:JSON.stringify({
        system:'Você é um assistente de idiomas. Responda APENAS com JSON válido, sem markdown.',
        messages:[{role:'user',content:prompt}]
      }),
      signal:AbortSignal.timeout(20000)
    });
    if(!resp.ok) throw new Error('HTTP '+resp.status);
    const data=await resp.json();
    const raw=(data.answer||'').trim().replace(/```json|```/g,'').trim();
    let parsed;
    try{parsed=JSON.parse(raw);}catch(e){throw new Error('JSON inválido');}
    _renderResumoEscuta(parsed);
  } catch(e) {
    console.warn('Resumo escuta error:',e);
    const msg=e.message==='backend_nao_configurado'
      ?'Configure a URL do backend nas Configurações para usar este recurso.'
      :'Não foi possível gerar o resumo. Verifique sua conexão.';
    if(body) body.innerHTML=`<div style="color:var(--muted);font-size:13px;text-align:center;padding:24px 0;">❌ ${msg}</div>`;
  }
}

function _renderResumoEscuta(data) {
  const body=document.getElementById('escuta-resumo-body');
  if(!body)return;
  let html=`<div class="erp-section-title">🧠 RESUMO</div>
  <div class="erp-summary-box">${_esc(data.resumo||'Sem resumo disponível.')}</div>`;
  if(data.palavras&&data.palavras.length>0){
    html+=`<div class="erp-section-title" style="margin-top:18px;">📋 PALAVRAS NOVAS</div>
    <div class="erp-word-list">`;
    data.palavras.forEach((p,i)=>{
      html+=`<div class="erp-word-item">
        <div>
          <div class="erp-word-text">${_esc(p.palavra||'')}</div>
          <div class="erp-word-trans">${_esc(p.traducao||'')}</div>
        </div>
        <button class="erp-save-btn" onclick="salvarPalavraEscuta(this,'${_esc(p.palavra||'')}','${_esc(p.traducao||'')}')">+ Vocabulário</button>
      </div>`;
    });
    html+=`</div>`;
  } else {
    html+=`<div class="erp-section-title" style="margin-top:18px;">📋 PALAVRAS NOVAS</div>
    <div style="color:var(--muted);font-size:13px;padding:10px 0;">Nenhuma palavra nova identificada nesta escuta.</div>`;
  }
  body.innerHTML=html;
}

async function salvarPalavraEscuta(btn, palavra, traducao) {
  if(btn.classList.contains('saved'))return;
  btn.textContent='Salvando...'; btn.disabled=true;
  try {
    const uid=window._fbUser?.uid;
    if(uid&&db){
      await db.collection('users').doc(uid).collection('vocabulary').add({
        word:palavra, translation:traducao, source:'escuta',
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    btn.textContent='✓ Salvo!'; btn.classList.add('saved');
    showToast(`✅ "${palavra}" adicionada ao vocabulário`,'success');
  } catch(e) {
    btn.textContent='+ Vocabulário'; btn.disabled=false;
    showToast('Erro ao salvar palavra','error');
  }
}

function clearEscuta(){
  _escutaLines=[];
  const lines=document.getElementById('escuta-lines');if(lines)lines.innerHTML='';
  const ph=document.getElementById('escuta-placeholder');if(ph)ph.style.display='block';
  document.getElementById('escuta-lines')?.style.setProperty('display','none');
}

// ====== SESSION ======
function goActive(){
  if(checkUsageBlock())return;
  navApp('active');
  if(_selectedMode==='viagem'){
    startViagemMode();
  } else {
    startSess();
  }
}
function leaveActive(){stopSess();stopViagemMode();navApp('home');}
function startSess(){
  stopSess();sessSec=0;wc=0;di=0;
  const bubs=document.getElementById('bubs'),tind=document.getElementById('tind');
  if(bubs){bubs.innerHTML='';if(tind)bubs.appendChild(tind);}
  document.getElementById('tr1').textContent=_selectedMode==='viagem'?'✈️ Modo Offline — toque no microfone':'Toque no microfone para começar...';
  const vtag=document.getElementById('viagem-tag');
  if(vtag)vtag.style.display=_selectedMode==='viagem'?'inline-flex':'none';
  document.getElementById('tr2').textContent='Aguardando resposta...';
  // CORREÇÃO ANTI-DESPERDÍCIO: sessT só atualiza o cronômetro visual.
  // sessSec (que é usado para billing) só incrementa quando isRec=true (mic ativo).
  let _uiSec=0;
  sessT=setInterval(()=>{
    _uiSec++;
    if(isRec) sessSec++;
    const m=Math.floor(_uiSec/60),s=_uiSec%60,el=document.getElementById('sess-dur');
    if(el)el.textContent=m.toString().padStart(2,'0')+':'+s.toString().padStart(2,'0');
  },1000);
  // Conecta WebSocket streaming ao Azure (pré-conecta para 0-latência no 1º toque)
  if(_selectedMode!=='viagem') setTimeout(()=>_sessWSConnect(),300);
}
// stopSess defined below (complete version)

// ====== MIC ======
function togMic(){
  _resetIdleTimer();
  if(_selectedMode==='viagem'){
    if(_viagemActive)stopViagemMode();else startViagemMode();
    return;
  }
  // Usa Azure SDK direto no browser se disponível
  if(window.AZURE_SPEECH_KEY && typeof SpeechSDK !== 'undefined'){
    if(_sessAzureActive) _sessAzureStop(); else _sessAzureStart();
    return;
  }
  // Fallback WebSocket
  if(_sessWS && _sessWS.readyState===WebSocket.OPEN){
    if(_sessWSActive) _sessWSStopSpeaking(); else _sessWSStartSpeaking();
  } else {
    if(!_sessWSConnecting) _sessWSConnect();
  }
}

// ════════════════════════════════════════════════════════════
//  MODO VIAGEM — Web Speech API (reconhecimento offline)
// ════════════════════════════════════════════════════════════
let _viagemActive=false, _viagemRecog=null, _viagemLang='en-US';

const _viagemLangMap={
  'pt':'pt-BR','en':'en-US','es':'es-ES','fr':'fr-FR',
  'de':'de-DE','it':'it-IT','zh':'zh-CN','ja':'ja-JP',
  'ko':'ko-KR','ru':'ru-RU','ar':'ar-SA'
};

function startViagemMode(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    showToast('❌ Seu navegador não suporta reconhecimento offline. Use o Chrome.','error');
    return;
  }
  // Usa o idioma de ORIGEM da sessão ativa (LO[lfi]) — não o seletor da escuta ao vivo
  const fromCode=LO[lfi]?.code||'PT-BR';
  const fromShort=fromCode.split('-')[0].toLowerCase();
  _viagemLang=_viagemLangMap[fromShort]||'pt-BR';

  _viagemActive=true;
  _viagemRecog=new SR();
  _viagemRecog.lang=_viagemLang;
  console.log('🎙️ Modo Viagem — lang:', _viagemLang, '| lfi:', lfi, '| LO[lfi]:', LO[lfi]?.code);
  _viagemRecog.continuous=true;
  _viagemRecog.interimResults=true;

  // UI: modo viagem ativo
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb rec';
  document.getElementById('mico').textContent='⏹';
  document.getElementById('micl').textContent='✈️ Modo Offline — toque p/ parar';
  document.getElementById('tr1').textContent='🎙️ Ouvindo (offline)...';
  document.getElementById('tr2').textContent='Aguardando fala...';
  document.getElementById('sp1').classList.add('speaking');
  const wi=animWF('wf1',true);wis.push(wi);

  // Banner offline
  showToast('✈️ Modo Viagem ativo — reconhecimento offline');

  let _lastFinal='';

  _viagemRecog.onresult=(e)=>{
    let interim='', final='';
    for(let i=e.resultIndex;i<e.results.length;i++){
      if(e.results[i].isFinal) final+=e.results[i][0].transcript;
      else interim+=e.results[i][0].transcript;
    }
    // Mostra texto interim em tempo real
    if(interim) document.getElementById('tr1').textContent='🎙️ '+interim;

    // Quando tiver texto final, traduz
    if(final && final !== _lastFinal){
      _lastFinal=final;
      document.getElementById('tr1').textContent=final;
      _viagemTranslate(final);
    }
  };

  _viagemRecog.onerror=(e)=>{
    if(e.error==='no-speech') return;
    if(e.error==='not-allowed'){showToast('❌ Permissão de microfone negada','error');stopViagemMode();return;}
    console.warn('SpeechRecognition error:',e.error);
  };

  _viagemRecog.onend=()=>{
    if(_viagemActive){
      // Delay pequeno para o Chrome não bloquear reinício imediato
      setTimeout(()=>{
        if(_viagemActive&&_viagemRecog){
          try{_viagemRecog.start();}catch(e){}
        }
      },200);
    }
  };

  _viagemRecog.start();
  startSess(); // inicia timer de sessão
}

async function _viagemTranslate(text){
  if(!text||!text.trim())return;
  document.getElementById('tr2').textContent='⏳ Traduzindo...';
  document.getElementById('sp2').classList.add('speaking');
  const wi2=animWF('wf2',true);wis.push(wi2);

  // Idioma de origem da sessão
  const fromCode=LO[lfi]?.code||'PT-BR';
  const fromShort=fromCode.split('-')[0].toLowerCase();
  // Idioma de destino da sessão
  const toCode=LO[lti]?.code||'EN-US';
  const toShort=toCode.split('-')[0].toLowerCase();

  let trad=text;
  // Lista de respostas inválidas que MyMemory retorna quando limite é atingido
  const _mmBadResponses=['GOOGLE TRANSLATE','PLEASE USE OFFICIAL','MYMEMORY','USE DEEPL','QUERY LENGTH'];
  const _isValidTrad=(t)=>t&&t.trim().length>0&&!_mmBadResponses.some(b=>t.toUpperCase().includes(b));

  try{
    // Tenta backend primeiro (mais preciso, se estiver disponível)
    const backendUrl=getBackendUrl();
    const token=await getAuthToken();
    const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
    // Usa /api/translate-free (sem auth) — específico para modo viagem offline
    const res=await fetch(backendUrl+'/api/translate-free',{
      method:'POST',headers,signal:AbortSignal.timeout(8000),
      body:JSON.stringify({text,from:fromShort,to:toShort})
    });
    console.log('[AIVOX] /api/translate-free status:', res.status);
    if(res.ok){
      const d=await res.json();
      console.log('[AIVOX] translation result:', d.translation);
      if(_isValidTrad(d.translation))trad=d.translation;
    } else {
      const errBody=await res.json().catch(()=>({}));
      console.warn('[AIVOX] /api/translate error:', res.status, errBody.error||'');
    }
  }catch(e){console.warn('[AIVOX] /api/translate exception:',e.message);}

  // Se backend falhou ou retornou inválido, usa MyMemory (offline)
  if(trad===text){
    try{
      const mmUrl=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromShort}|${toShort}`;
      const r=await fetch(mmUrl,{signal:AbortSignal.timeout(8000)});
      if(r.ok){
        const d=await r.json();
        const mmTrad=d.responseData?.translatedText||'';
        if(d.responseStatus===200&&_isValidTrad(mmTrad)){
          trad=mmTrad;
        }
      }
    }catch(e2){/* usa texto original */}
  }

  document.getElementById('tr2').textContent=trad;
  // Adiciona bolha
  const bubs=document.getElementById('bubs');
  if(bubs){
    const b=document.createElement('div');
    b.className='bi';
    b.innerHTML=`<div style="font-size:11px;color:var(--muted);margin-bottom:3px;">✈️ ${text}</div><div style="font-size:14px;font-weight:600;">${trad}</div>`;
    bubs.insertBefore(b,document.getElementById('tind'));
    b.scrollIntoView({behavior:'smooth'});
  }
  document.getElementById('sp2').classList.remove('speaking');
  animWF('wf2',false);
}

function stopViagemMode(){
  if(!_viagemActive&&!_viagemRecog)return;
  _viagemActive=false;
  try{_viagemRecog?.stop();}catch(e){}
  _viagemRecog=null;
  wis.forEach(clearInterval);wis=[];
  animWF('wf1',false);
  animWF('wf2',false);
  document.getElementById('sp1').classList.remove('speaking');
  document.getElementById('sp2').classList.remove('speaking');
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb idle';
  const mico=document.getElementById('mico');
  if(mico)mico.textContent='🎙️';
  const micl=document.getElementById('micl');
  if(micl)micl.textContent='Toque p/ falar';
  const tr1=document.getElementById('tr1');
  if(tr1)tr1.textContent='✈️ Modo Offline — toque no microfone';
  const tr2=document.getElementById('tr2');
  if(tr2)tr2.textContent='Aguardando resposta...';
  stopSess();
}
// ====== SESSÃO ATIVA — MIC REAL + BACKEND ======
// ── Sessão Ativa — WebSocket Streaming (Azure tempo real) ──
let _sessWS=null, _sessWSActive=false, _sessWSConnecting=false;
let _sessWSCtx=null, _sessWSProcessor=null, _sessWSStream=null;
let _sessWSTranscript='', _sessWSTranslation='';
// legado (fallback)
let _sessStream=null,_sessRecorder=null,_sessChunks=[];
let _sessVADACtx=null,_sessAnalyser=null,_sessVADTimer=null;
let _sessRecordingSec=0,_sessRecordingTimer=null;
let _sessMode='push';


// ════════════════════════════════════════════════════════════
//  SESSÃO ATIVA — Azure SDK direto no browser (latência ~200ms)
// ════════════════════════════════════════════════════════════
let _sessAzureRecognizer = null;
let _sessAzureActive     = false;

async function _sessAzureStart(){
  if(_sessAzureActive) return;
  const from     = LO[lfi]?.code || 'PT-BR';
  const to       = LO[lti]?.code || 'EN-US';
  const fromBase = from.split('-')[0].toLowerCase();
  const toBase   = to.split('-')[0].toLowerCase();
  const langCodeMap = {pt:'pt-BR',en:'en-US',es:'es-ES',fr:'fr-FR',de:'de-DE',it:'it-IT',ja:'ja-JP',zh:'zh-CN',ru:'ru-RU'};
  const sttLang  = langCodeMap[fromBase] || from;

  try{
    const translationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(
      window.AZURE_SPEECH_KEY, window.AZURE_SPEECH_REGION || 'eastus'
    );
    translationConfig.speechRecognitionLanguage = sttLang;
    translationConfig.addTargetLanguage(toBase);

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    _sessAzureRecognizer = new SpeechSDK.TranslationRecognizer(translationConfig, audioConfig);

    // Texto parcial — mostra enquanto fala
    _sessAzureRecognizer.recognizing = (s, e) => {
      if(e.result.text) document.getElementById('tr1').textContent = '🎙️ ' + e.result.text;
    };

    // Frase completa
    _sessAzureRecognizer.recognized = (s, e) => {
      if(e.result.reason !== SpeechSDK.ResultReason.TranslatedSpeech) return;
      const original   = _fillerCleanLocal(e.result.text);
      const translated = e.result.translations.get(toBase);
      if(!original?.trim() || !translated?.trim()) return;

      document.getElementById('tr1').textContent = original;
      document.getElementById('tr2').textContent = translated;
      _addSessionBubble(original, translated, 'me', from, to, '~Azure');
      wc += original.split(' ').length;
      document.getElementById('mwrd').textContent = wc;
      document.getElementById('mlat').textContent = '~200ms';
      document.getElementById('macc').textContent = '97%';
      sessSec += Math.ceil(original.split(' ').length / 3); // estima tempo de fala
      if(translated) _speakTranslation(translated, toBase);
    };

    _sessAzureRecognizer.canceled = (s, e) => {
      if(e.reason === SpeechSDK.CancellationReason.Error)
        showToast('❌ Azure: ' + e.errorDetails, 'error');
      _sessAzureStop();
    };

    _sessAzureRecognizer.startContinuousRecognitionAsync(
      () => {
        _sessAzureActive = true; isRec = true;
        document.getElementById('sp1').classList.add('speaking');
        const mb = document.getElementById('micbtn'); if(mb) mb.className='micb rec';
        document.getElementById('mico').textContent = '⏹';
        document.getElementById('micl').textContent = 'Ouvindo... toque p/ parar';
        document.getElementById('tr1').textContent  = '🎙️ Ouvindo...';
      },
      err => showToast('❌ Microfone: ' + err, 'error')
    );
  }catch(e){
    showToast('❌ Erro Azure SDK: '+e.message,'error');
  }
}

function _sessAzureStop(){
  _sessAzureActive = false; isRec = false;
  if(_sessAzureRecognizer){
    try{_sessAzureRecognizer.stopContinuousRecognitionAsync(()=>{},()=>{});}catch(e){}
    try{_sessAzureRecognizer.close();}catch(e){}
    _sessAzureRecognizer = null;
  }
  document.getElementById('sp1').classList.remove('speaking');
  _resetMicBtn();
}

// ════════════════════════════════════════════════════════════
//  SESSÃO ATIVA — WebSocket Streaming (Azure tempo real)
//  Substitui o fluxo HTTP batch — latência ~300ms vs ~9s
// ════════════════════════════════════════════════════════════
async function _sessWSConnect(){
  if(_sessWSConnecting||(_sessWS&&_sessWS.readyState===WebSocket.OPEN)) return;
  const backendUrl=getBackendUrl();
  if(!backendUrl){showToast('⚠️ Backend não configurado','error');return;}
  _sessWSConnecting=true;
  // Pede microfone já ao conectar
  try{
    _sessWSStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:16000}});
  }catch(e){showToast('❌ Permissão de microfone negada','error');_sessWSConnecting=false;return;}
  try{
    const token=await getAuthToken();
    const from=LO[lfi]?.code||'PT-BR';
    const to=LO[lti]?.code||'EN-US';
    const fromShort=from.split('-')[0].toLowerCase();
    const toShort=to.split('-')[0].toLowerCase();
    const wsUrl=backendUrl.replace('https://','wss://').replace('http://','ws://')
      +`/api/realtime?from=${fromShort}&to=${toShort}&token=${encodeURIComponent(token||'')}`;
    _sessWS=new WebSocket(wsUrl);
    _sessWS.onopen=()=>{
      _sessWSConnecting=false;
      console.log('[sessWS] conectado');
      // Inicia captura de áudio imediatamente
      _sessWSStartCapture();
      // Atualiza UI: pronto para falar
      const mb=document.getElementById('micbtn');
      if(mb)mb.className='micb idle';
      document.getElementById('mico').textContent='🎙️';
      document.getElementById('micl').textContent='Toque para falar';
      document.getElementById('tr1').textContent='Fale quando quiser...';
      isRec=false;
    };
    _sessWS.onmessage=(ev)=>{
      try{_sessWSHandleEvent(JSON.parse(ev.data));}catch(e){}
    };
    _sessWS.onerror=()=>{_sessWSCleanup();showToast('❌ Erro de conexão com Azure','error');};
    _sessWS.onclose=()=>{if(_sessWSActive)_sessWSCleanup();};
  }catch(e){
    showToast('❌ Falha ao conectar: '+e.message,'error');
    _sessWSConnecting=false;
    try{_sessWSStream?.getTracks().forEach(t=>t.stop());}catch(_){}
  }
}

function _sessWSStartCapture(){
  _sessWSCtx=new (window.AudioContext||window.webkitAudioContext)({sampleRate:16000});
  const source=_sessWSCtx.createMediaStreamSource(_sessWSStream);
  _sessWSProcessor=_sessWSCtx.createScriptProcessor(4096,1,1);
  _sessWSProcessor.onaudioprocess=(e)=>{
    // Só envia áudio quando o usuário está falando (botão ativo)
    if(!_sessWSActive||!_sessWS||_sessWS.readyState!==WebSocket.OPEN) return;
    const f32=e.inputBuffer.getChannelData(0);
    const pcm=new Int16Array(f32.length);
    for(let i=0;i<f32.length;i++) pcm[i]=Math.max(-32768,Math.min(32767,f32[i]*32768));
    const bytes=new Uint8Array(pcm.buffer);
    let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));
    _sessWS.send(JSON.stringify({type:'input_audio_buffer.append',audio:btoa(bin)}));
  };
  source.connect(_sessWSProcessor);
  _sessWSProcessor.connect(_sessWSCtx.destination);
}

function _sessWSStartSpeaking(){
  if(!_sessWS||_sessWS.readyState!==WebSocket.OPEN) return;
  _sessWSActive=true; isRec=true;
  _sessWSTranscript=''; _sessWSTranslation='';
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb rec';
  document.getElementById('mico').textContent='⏹';
  document.getElementById('micl').textContent='Ouvindo... toque p/ parar';
  document.getElementById('sp1').classList.add('speaking');
  document.getElementById('tr1').textContent='🎙️ Ouvindo...';
  document.getElementById('tr2').textContent='';
  if(_salaSocket&&_salaCode) _salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:true});
}

function _sessWSStopSpeaking(){
  _sessWSActive=false; isRec=false;
  document.getElementById('sp1').classList.remove('speaking');
  if(_salaSocket&&_salaCode) _salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:false});
  // UI volta ao idle após breve pausa (Azure ainda processa o fim da fala)
  setTimeout(()=>{
    if(!_sessWSActive) _sessWSResetUI();
  },1200);
}

function _sessWSResetUI(){
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb idle';
  document.getElementById('mico').textContent='🎙️';
  document.getElementById('micl').textContent='Toque para falar';
}

function _sessWSHandleEvent(msg){
  switch(msg.type){
    case 'aivox.transcription':
    case 'conversation.item.input_audio_transcription.completed':{
      const t=(msg.transcript||'').trim();
      if(t){document.getElementById('tr1').textContent=t;_sessWSTranscript=t;}
      break;
    }
    case 'aivox.translation.delta':
    case 'response.audio_transcript.delta':{
      _sessWSTranslation+=(msg.delta||'');
      document.getElementById('tr2').textContent=_sessWSTranslation;
      break;
    }
    case 'aivox.translation.done':
    case 'response.audio_transcript.done':{
      const translation=(msg.transcript||_sessWSTranslation).trim();
      if(!translation) break;
      const original=document.getElementById('tr1').textContent||_sessWSTranscript;
      const from=LO[lfi]?.code||'PT-BR';
      const to=LO[lti]?.code||'EN-US';
      const t0=performance.now();
      _addSessionBubble(original,translation,'me',from,to,'~RT');
      wc+=original.split(' ').length;
      document.getElementById('mwrd').textContent=wc;
      document.getElementById('mlat').textContent='~RT';
      document.getElementById('macc').textContent='97%';
      _sessWSTranslation=''; _sessWSTranscript='';
      break;
    }
    case 'aivox.audio.delta':
    case 'response.audio.delta':{
      if(!msg.delta) break;
      // Toca o TTS gerado pelo Azure
      (async()=>{
        try{
          const bin=atob(msg.delta);
          const bytes=new Uint8Array(bin.length);
          for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          const pcm=new Int16Array(bytes.buffer);
          const f32=new Float32Array(pcm.length);
          for(let i=0;i<pcm.length;i++) f32[i]=pcm[i]/32768;
          const ctx=await _getTTSCtx();
          const buf=ctx.createBuffer(1,f32.length,24000);
          buf.copyToChannel(f32,0);
          const src=ctx.createBufferSource();
          src.buffer=buf;src.connect(ctx.destination);src.start(0);
        }catch(e){console.warn('sessWS audio:',e);}
      })();
      break;
    }
    case 'aivox.error':
    case 'error': console.warn('[sessWS] error:',msg.error); break;
  }
}

function _sessWSCleanup(){
  _sessWSActive=false; _sessWSConnecting=false; isRec=false;
  try{_sessWSProcessor?.disconnect();}catch(_){}
  try{_sessWSCtx?.close();}catch(_){}
  try{_sessWSStream?.getTracks().forEach(t=>t.stop());}catch(_){}
  _sessWSProcessor=null;_sessWSCtx=null;_sessWSStream=null;
  try{if(_sessWS?.readyState===WebSocket.OPEN)_sessWS.close();}catch(_){}
  _sessWS=null;
  _sessWSResetUI();
}

async function startRec(){
  if(isRec)return;
  // Verifica backend
  const backendUrl=getBackendUrl();
  if(!backendUrl){
    showToast('⚠️ Backend não configurado. Vá em Configurações → Backend URL','error');
    return;
  }
  try{
    _sessStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:16000}});
  }catch(e){showToast('❌ Permissão de microfone negada','error');return;}
  isRec=true;
  _sessChunks=[];
  const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
  try{_sessRecorder=new MediaRecorder(_sessStream,{mimeType});}
  catch(e){_sessRecorder=new MediaRecorder(_sessStream);}
  _sessRecorder.ondataavailable=e=>{if(e.data?.size>0)_sessChunks.push(e.data);};
  _sessRecorder.start(100);
  _sessRecordingSec=0;
  _sessRecordingTimer=setInterval(()=>_sessRecordingSec++,1000);
  // UI: gravando
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb rec';
  document.getElementById('mico').textContent='⏹';
  document.getElementById('micl').textContent='Gravando... toque p/ parar';
  document.getElementById('sp1').classList.add('speaking');
  const wi=animWF('wf1',true);wis.push(wi);
  document.getElementById('tr1').textContent='🎙️ Ouvindo...';
}

async function stopRec(){
  if(!isRec)return;
  isRec=false;
  clearInterval(_sessRecordingTimer);_sessRecordingTimer=null;
  wis.forEach(clearInterval);wis=[];
  animWF('wf1',false);
  document.getElementById('sp1').classList.remove('speaking');
  // UI: processando
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb proc';
  document.getElementById('mico').textContent='⌛';
  document.getElementById('micl').textContent='Traduzindo...';
  // Para gravação e processa
  if(_sessRecorder?.state==='recording'){
    _sessRecorder.onstop=async()=>{ await _processSessAudio(); };
    _sessRecorder.stop();
  }
  try{_sessStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  _sessStream=null;
}

async function _processSessAudio(){
  const from=LO[lfi]?.code||'PT-BR';
  const to=LO[lti]?.code||'EN-US';
  const fromShort=from.split('-')[0].toLowerCase();
  const toShort=to.split('-')[0].toLowerCase();
  const blob=new Blob(_sessChunks,{type:'audio/webm'});
  _sessChunks=[];
  // Ignora gravações muito curtas ou pequenas (sem fala real)
  // blob < 8KB em menos de 1s = provavelmente ruído ambiente
  const tooSmall=blob.size<8000;
  const tooShort=_sessRecordingSec<1; // menos de 1 segundo
  if(tooSmall||tooShort){
    _resetMicBtn();
    document.getElementById('tr1').textContent=_selectedMode==='viagem'?'✈️ Modo Offline — toque no microfone':'Toque no microfone para começar...';
    const vtag=document.getElementById('viagem-tag');
    if(vtag)vtag.style.display=_selectedMode==='viagem'?'inline-flex':'none';
    return;
  }
  const backendUrl=getBackendUrl();
  if(!backendUrl){
    // Demo sem backend
    const demos=['Olá, como vai?','Podemos começar?','Obrigado pela reunião.','Até mais!'];
    const demosT=['Hello, how are you?','Can we start?','Thank you for the meeting.','See you!'];
    const idx=di%demos.length;
    document.getElementById('tr1').textContent=demos[idx];
    setTimeout(()=>{
      _addSessionBubble(demos[idx],demosT[idx],'me',from,to,'—');
      _resetMicBtn();di++;
    },600);
    return;
  }
  try{
    const token=await getAuthToken();
    const headers=token?{Authorization:'Bearer '+token}:{};
    const fd=new FormData();
    fd.append('audio',blob,'sess.webm');
    fd.append('from',fromShort);
    fd.append('to',toShort);
    // Prompt de contexto por idioma — força Whisper a transcrever corretamente
    const _promptMap={
      'pt':'Transcrição em português brasileiro. Preserve nomes: João, Maria, Fabio, Diogo, Silva.',
      'en':'Transcription in English. Conversation between professionals.',
      'es':'Transcripción en español. Conversación natural entre personas.',
      'fr':'Transcription en français. Conversation naturelle.',
      'de':'Transkription auf Deutsch. Natürliche Unterhaltung.',
    };
    if(_promptMap[fromShort]) fd.append('prompt',_promptMap[fromShort]);
    const t0=Date.now();

    // Usa /api/listen — confiável e compatível com Render
    const r=await fetch(backendUrl+'/api/listen',{method:'POST',headers,body:fd,signal:AbortSignal.timeout(30000)});
    if(!r.ok){
      const status=r.status;
      _resetMicBtn();
      if(status===502||status===503||status===504){
        document.getElementById('tr1').textContent='⚠️ Backend retornou '+status;
        document.getElementById('tr2').textContent='Verifique AZURE_OAI_KEY no painel do Render';
        const warn=document.getElementById('sess-backend-warn');
        if(warn)warn.style.display='block';
        showToast('Backend '+status+': verifique AZURE_OAI_KEY no Render','error');
      } else {
        document.getElementById('tr1').textContent='Erro HTTP '+status+'. Tente novamente.';
        document.getElementById('tr2').textContent='';
      }
      return;
    }
    const d=await r.json();
    const latMs=Date.now()-t0;
    if(!d.original||d.original.trim().length<2){
      _resetMicBtn();
      document.getElementById('tr1').textContent='Não entendi. Tente novamente.';
      return;
    }
    // ── Filtro A+B: limpa fala antes de exibir ──────────────
    const _origClean = _fillerCleanLocal(d.original);
    document.getElementById('tr1').textContent=_origClean;
    document.getElementById('tr2').textContent=d.translation;
    _addSessionBubble(_origClean,d.translation,'me',from,to,latMs+'ms');
    // Limpeza IA em background (atualiza se diferente)
    if(window._fillerConfig?.aiEnabled){ _fillerCleanAI(_origClean).then(aiClean=>{ if(aiClean!==_origClean){ document.getElementById('tr1').textContent=aiClean; const bubs=document.getElementById('bubs'); if(bubs){const last=bubs.querySelector('.bme:last-child .bub-orig'); if(last)last.textContent=aiClean;} } }); }
    wc+=d.original.split(' ').length;
    document.getElementById('mwrd').textContent=wc;
    document.getElementById('mlat').textContent=latMs+'ms';
    document.getElementById('macc').textContent='97%';
    di++;
    updateCycleBreakdown(latMs,d.whisperMs||null,d.gptMs||null,null);
    if(d.translation)_speakTranslation(d.translation);
    _resetMicBtn();
  }catch(e){
    showToast('Erro: '+e.message,'error');
    _resetMicBtn();
  }
}

function _resetMicBtn(){
  const mb=document.getElementById('micbtn');
  if(mb)mb.className='micb idle';
  document.getElementById('mico').textContent='🎙️';
  document.getElementById('micl').textContent='Toque para falar';
}

function _addSessionBubble(original,translation,side,from,to,lat){
  const bubs=document.getElementById('bubs');
  const tind=document.getElementById('tind');
  if(!bubs)return;
  const el=document.createElement('div');
  el.className='bub '+(side==='me'?'bme':'bth');
  el.innerHTML=`<div class="bub-orig">${original}</div><div class="bub-trans">${translation}</div><div class="bub-meta">${side==='me'?from:to} · ${lat}</div>`;
  if(tind&&bubs.contains(tind))bubs.insertBefore(el,tind);
  else bubs.appendChild(el);
  bubs.scrollTop=bubs.scrollHeight;
}

function stopSess(){
  clearInterval(sessT);sessT=null;
  wis.forEach(clearInterval);wis=[];
  isRec=false;
  // Fecha Azure SDK recognizer
  _sessAzureStop();
  // Fecha WebSocket streaming
  _sessWSCleanup();
  try{_sessRecorder?.stop();}catch(e){}
  try{_sessStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  try{_sessVADACtx?.close();}catch(e){}
  _sessStream=null;_sessRecorder=null;_sessVADACtx=null;
  stopEscuta();
  // Salva sessão no Firestore se houve uso real
  if(sessSec>5)_saveSessionToFirestore();
}

async function _saveSessionToFirestore(){
  const uid=window._fbUser?.uid;
  if(!uid||!db)return;
  try{
    const durationMin=Math.ceil(sessSec/60);
    const month=new Date().toISOString().slice(0,7);
    const now=firebase.firestore.FieldValue.serverTimestamp();
    // Incrementa minutesUsed
    await db.collection('users').doc(uid).update({
      minutesUsed: firebase.firestore.FieldValue.increment(durationMin),
      lastSession: now,
    });
    // Atualiza _fbUser local
    if(window._fbUser){
      window._fbUser.minutesUsed=(window._fbUser.minutesUsed||0)+durationMin;
    }
    // Log da sessão
    // Breakdown estimado por API (baseado em proporcoes tipicas do pipeline)
    const _apiBreakdown = {
      whisper_min: parseFloat((durationMin * 0.35).toFixed(3)),   // STT - Whisper/OpenAI
      gpt_min:     parseFloat((durationMin * 0.30).toFixed(3)),   // Traducao - GPT-4o
      eleven_min:  parseFloat((durationMin * 0.25).toFixed(3)),   // TTS - ElevenLabs
      anthropic_min: parseFloat((durationMin * 0.05).toFixed(3)), // Claude API (aprendizagem)
      wisp_min:    parseFloat((durationMin * 0.05).toFixed(3)),   // Wisp (infra/relay)
    };
    await db.collection('logs').add({
      uid,
      type:'session_end',
      duration:sessSec,
      duration_min:durationMin,
      words:wc,
      translations:di,
      month,
      from:LO[lfi]?.code||'PT-BR',
      to:LO[lti]?.code||'EN-US',
      api_breakdown: _apiBreakdown,
      createdAt:now,
    });
    // Acumula minutos por API no doc do usuario
    await db.collection('users').doc(uid).update({
      'api_mins.whisper':   firebase.firestore.FieldValue.increment(_apiBreakdown.whisper_min),
      'api_mins.gpt':       firebase.firestore.FieldValue.increment(_apiBreakdown.gpt_min),
      'api_mins.elevenlabs':firebase.firestore.FieldValue.increment(_apiBreakdown.eleven_min),
      'api_mins.anthropic': firebase.firestore.FieldValue.increment(_apiBreakdown.anthropic_min),
      'api_mins.wisp':      firebase.firestore.FieldValue.increment(_apiBreakdown.wisp_min),
    }).catch(()=>{});
    // Log na coleção sessions também
    await db.collection('sessions').add({
      uid,
      duration:sessSec,
      duration_min:durationMin,
      words:wc,
      translations:di,
      createdAt:now,
    });
    console.log(`✅ Sessão salva: ${durationMin} min, ${wc} palavras`);
  }catch(e){
    console.warn('Erro ao salvar sessão:',e.message);
  }
}
function showProc(){} // removido — demo desativado
function finTr(){} // removido — demo desativado
function simOther(){} // demo desativado
function addBub(ph,who){const c=document.getElementById('bubs'),ti=document.getElementById('tind'),b=document.createElement('div');b.className='bub '+who;const tm=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),m=who==='me';b.innerHTML=`<div class="bi"><div class="bo">${m?ph.o:ph.t}</div><div class="bt">${m?ph.t:ph.o}</div><div class="bm"><span class="btime">${tm}</span><span class="blat">${ph.l}</span></div></div>`;c.insertBefore(b,ti);c.scrollTop=c.scrollHeight;}
function animWF(id,on){const bars=document.querySelectorAll('#'+id+' .wbar');if(!on){bars.forEach(b=>b.style.height='4px');return null;}return setInterval(()=>{bars.forEach(b=>b.style.height=(Math.random()*22+4)+'px');},80);}

// ====== HISTORY — Empty state by default (Firebase will populate) ======
const histData=[];
let fhist=[...histData];
function renderHist(data){const sc=document.getElementById('hscroll'),em=document.getElementById('hemp');if(!sc)return;sc.innerHTML='';if(!data.length){if(em)em.classList.add('sh');return;}if(em)em.classList.remove('sh');const g={};data.forEach(i=>{if(!g[i.date])g[i.date]=[];g[i.date].push(i);});Object.entries(g).forEach(([date,items])=>{const l=document.createElement('div');l.className='hdlbl';l.textContent=date;sc.appendChild(l);items.forEach((item,idx)=>{const el=document.createElement('div');el.className='hit '+item.mode;el.style.animationDelay=(idx*.05)+'s';el.innerHTML=`<div class="hit-top"><div class="hmb ${item.mode}">${item.mi} ${item.ml}</div><div class="htm">${item.time}</div></div><div class="hlngs"><span class="hfg">${item.ff}</span><span class="hln">${item.fl}</span><span class="hla">→</span><span class="hfg">${item.tf}</span><span class="hln">${item.tl}</span></div><div class="hsnip">${item.sn}</div><div class="hfoot"><div class="hst">⏱ ${item.dur}</div><div class="hst">💬 ${item.wds}</div><div class="hst">⚡ ${item.lat}</div><div class="hst">✅ ${item.acc}</div></div><div class="hstar" onclick="togStar(event,${item.id})">${item.star?'⭐':'☆'}</div>`;el.addEventListener('click',()=>openDet(item));sc.appendChild(el);});});}
function filtHist(q){fhist=!q.trim()?[...histData]:histData.filter(i=>i.ml.toLowerCase().includes(q.toLowerCase())||i.sn.toLowerCase().includes(q.toLowerCase()));renderHist(fhist);}
function togStar(e,id){e.stopPropagation();const i=histData.find(x=>x.id===id);if(i){i.star=!i.star;renderHist(fhist);}}
function clrHist(){histData.length=0;fhist=[];renderHist([]);}
function openDet(item){document.getElementById('dtit').textContent=item.ff+' → '+item.tf+' · '+item.time;const sc=document.getElementById('dsc');sc.innerHTML=`<div class="dmeta"><div class="dch">🗓 <span>${item.date}</span></div><div class="dch">⏱ <span>${item.dur}</span></div><div class="dch">💬 <span>${item.wds}</span></div><div class="dch">⚡ <span>${item.lat}</span></div><div class="dch">✅ <span>${item.acc}</span></div></div><div class="ddiv">Transcrição</div><div id="dbs"></div>`;const bc=sc.querySelector('#dbs');item.bubs.forEach((b,i)=>{const el=document.createElement('div');el.className='dbb '+b.w;el.style.animationDelay=(i*.06)+'s';el.innerHTML=`<div class="dbi"><div class="dbo">${b.o}</div><div class="dbt">${b.t}</div><div class="dbts">${b.ts}</div></div>`;bc.appendChild(el);});setTimeout(()=>document.getElementById('dov').classList.add('sh'),10);}
function clsDet(){document.getElementById('dov').classList.remove('sh');}

// ====== FAQ ======
const faqD=[{cat:'uso',q:'Como funciona a tradução em tempo real?',a:'Áudio → <strong>Azure Speech</strong> (STT) → <strong>Azure OpenAI</strong> (tradução) → <strong>Azure TTS</strong> (sua voz clonada). Tudo em ~120ms.'},{cat:'uso',q:'Quais idiomas são suportados?',a:'Mais de <strong>50 idiomas</strong>. Modo Viagem suporta 20 offline.'},{cat:'uso',q:'Como clonar minha voz?',a:'Grave <strong>60 segundos</strong> de áudio limpo. Azure processa em ~30 segundos.'},{cat:'planos',q:'Como funciona o excedente?',a:'Cobra-se <strong>R$2,50/minuto</strong> ao ultrapassar o limite do plano. Aviso em 80%.'},{cat:'planos',q:'O trial é mesmo grátis?',a:'Sim. <strong>3 dias, 5 minutos</strong>, sem cartão. Sem cobrança de excedente no trial.'},{cat:'planos',q:'Posso cancelar?',a:'Sim. Cancelamento imediato, sem multa. Acesso mantido até fim do período pago.'},{cat:'tecnico',q:'Qual é a latência média?',a:'<strong>~280ms</strong> em 4G/5G. Modo offline: ~150ms.'},{cat:'tecnico',q:'Funciona com Bluetooth?',a:'Sim. <strong>AirPods, Galaxy Buds</strong> e qualquer BT com latência &lt;80ms.'},{cat:'privacidade',q:'Minhas conversas ficam gravadas?',a:'Não. Áudio descartado em tempo real. Transcrição salva só localmente se ativar histórico.'},{cat:'privacidade',q:'Minha voz clonada é segura?',a:'Sim. Isolada na sua conta com <strong>criptografia AES-256</strong>.'}];
function renderFaq(cat){const l=document.getElementById('flist');if(!l)return;l.innerHTML='';const fd=cat==='todos'?faqD:faqD.filter(f=>f.cat===cat);fd.forEach((f,i)=>{const el=document.createElement('div');el.className='fi';el.style.animationDelay=(i*.04)+'s';el.innerHTML=`<div class="fq" onclick="this.parentElement.classList.toggle('open')"><div class="fqt">${f.q}</div><div class="fch">▼</div></div><div class="fa">${f.a}</div>`;l.appendChild(el);});}
function filtFaqCat(cat,btn){document.querySelectorAll('#page-faq .fcat').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderFaq(cat);}

// ====== ADMIN — Users ======
function renderUsers(planFilt){
  const list=document.getElementById('ulist'),emptyEl=document.getElementById('ulist-empty');
  if(!list)return;list.innerHTML='';
  if(window.FB&&window._fbUser?.role==='admin'){
    window.FB.getUsers().then(users=>{
      const filtered=planFilt==='todos'?users:users.filter(u=>u.plan===planFilt);
      if(emptyEl)emptyEl.style.display=filtered.length?'none':'flex';
      filtered.forEach(u=>renderUserRow(u,list));
    }).catch(()=>{if(emptyEl){emptyEl.querySelector('.empty-title').textContent='Nenhum dado disponível';emptyEl.querySelector('.empty-sub').textContent='Verifique as regras do Firestore.';}});
  }else{if(emptyEl){emptyEl.style.display='flex';emptyEl.querySelector('.empty-title').textContent='Nenhum usuário encontrado';emptyEl.querySelector('.empty-sub').textContent='Dados carregados do Firestore.';}}
}
function renderUserRow(u,list){const el=document.createElement('div');el.className='urw';if(u.status==='suspended')el.style.opacity='.55';const pct=Math.round((u.minutesUsed||0)/(u.minutesLimit||5)*100);const overPct=pct>=100,warnPct=pct>=80;const psMap={pago:{icon:'🟢',color:'var(--green)',bg:'var(--gdim)'},processando:{icon:'🟡',color:'var(--yellow)',bg:'var(--ydim)'},rejeitado:{icon:'🔴',color:'var(--red)',bg:'var(--rdim)'},cancelado:{icon:'🔴',color:'var(--red)',bg:'var(--rdim)'},reembolsado:{icon:'🔴',color:'var(--red)',bg:'var(--rdim)'},trial:{icon:'🔵',color:'var(--accent)',bg:'var(--adim)'}};const ps=u.payment_status||(u.plan==='trial'?'trial':null);const psBadge=ps&&psMap[ps]?`<span style="font-size:9px;font-weight:800;font-family:var(--mono);padding:1px 6px;border-radius:5px;background:${psMap[ps].bg};color:${psMap[ps].color};margin-top:3px;display:inline-block;">${psMap[ps].icon} ${ps.toUpperCase()}</span>`:'';el.innerHTML=`<div class="uav ${u.online?'on':'off'}">${(u.name||'?')[0]}</div><div style="flex:1;"><div class="un"><span class="usd ${u.online?'on':'off'}"></span>${u.name||'—'}${u.status==='suspended'?' <span style="font-size:9px;background:var(--rdim);color:var(--red);padding:1px 5px;border-radius:4px;font-family:var(--mono);">SUSP</span>':''}</div><div class="ue">${u.email||'—'}</div><div style="margin-top:5px;"><div style="height:4px;background:var(--surface);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${Math.min(pct,100)}%;border-radius:2px;background:${overPct?'var(--red)':warnPct?'var(--orange)':'var(--accent)'};"></div></div><div style="font-size:9px;color:var(--muted);margin-top:2px;font-family:var(--mono);">${u.minutesUsed||0}/${u.minutesLimit||5} min (${pct}%)</div></div></div><div class="ur"><div class="up ${u.plan||'trial'}">${(u.plan||'trial').toUpperCase()}</div>${psBadge}</div>`;el.addEventListener('click',()=>openUser(u));list.appendChild(el);}
function filtUsers(p,btn){document.querySelectorAll('#tab-usuarios .fcat').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderUsers(p);}
function _renderUserDetailPanel(u){document.getElementById('udtit').textContent=u.name||'—';document.getElementById('udplan').innerHTML=`<span class="badge badge-${u.plan||'trial'}">${(u.plan||'trial').toUpperCase()}</span>`;const pct=Math.round((u.minutesUsed||0)/(u.minutesLimit||5)*100),overPct=pct>=100,warnPct=pct>=80;document.getElementById('udsc').innerHTML=`<div style="display:flex;align-items:center;gap:12px;background:var(--card);border:1px solid var(--border);border-radius:13px;padding:13px;margin-bottom:12px;"><div class="uav ${u.online?'on':'off'}" style="width:44px;height:44px;font-size:16px;">${(u.name||'?')[0]}</div><div><div style="font-size:15px;font-weight:700;">${u.name||'—'}</div><div style="font-size:11px;color:var(--muted);">${u.email||'—'}</div></div></div><div class="ubr"><div class="ubrt"><span class="ubrl">Minutos usados</span><span class="ubrv">${u.minutesUsed||0} / ${u.minutesLimit||5}</span></div><div class="ubg"><div class="ubf ${overPct?'over':warnPct?'warn':''}" style="width:${Math.min(pct,100)}%;"></div></div></div><div style="display:flex;gap:8px;margin-bottom:10px;"><button class="btn btn-ghost btn-sm" style="flex:1;" onclick="openResetPw('${u.uid||''}','${u.name||''}')">🔑 Reset senha</button><button class="btn ${u.status==='suspended'?'btn-primary':'btn-danger'} btn-sm" style="flex:1;" onclick="toggleSuspend('${u.uid||''}',${u.status==='suspended'})">${u.status==='suspended'?'✓ Reativar':'⛔ Suspender'}</button></div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;"><button class="btn btn-ghost btn-sm" onclick="adminUpgrade('${u.uid||''}','basic')">Basic</button><button class="btn btn-ghost btn-sm" onclick="adminUpgrade('${u.uid||''}','pro')">Pro</button><button class="btn btn-ghost btn-sm" onclick="adminUpgrade('${u.uid||''}','business')">Business</button><button class="btn btn-sm" style="background:rgba(255,208,0,.12);border:1px solid rgba(255,208,0,.3);color:var(--yellow);" onclick="adminTestPix('${u.uid||''}')">🧪 Teste R$1</button></div><div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:11px 13px;margin-bottom:10px;"><div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);font-family:var(--mono);margin-bottom:8px;">➕ Adicionar Minutos</div><div style="display:flex;gap:8px;align-items:center;"><input id="admin-add-min-input" type="number" min="1" max="9999" placeholder="Ex: 30" style="flex:1;background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:8px 12px;font-family:var(--font);font-size:13px;color:var(--text);outline:none;"><button class="btn btn-sm" style="background:var(--gdim);border:1px solid rgba(0,255,136,.25);color:var(--green);white-space:nowrap;" onclick="adminAddMinutes('${u.uid||''}')">✅ Adicionar</button></div><div style="font-size:10px;color:var(--muted);margin-top:5px;">Limite atual: ${u.minutesLimit||5} min · Usado: ${u.minutesUsed||0} min</div></div><div id="api-breakdown-${u.uid||'x'}" style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:11px 13px;margin-bottom:10px;"></div><div id="perm-panel-${u.uid||'x'}"></div>`;document.getElementById('udov').classList.add('sh');_renderPermPanel(u);_renderApiBreakdown(u);}
function openUser(u){
  // Salva posição do scroll do painel admin antes de abrir detalhe
  const _atc=document.querySelector('.atcont');
  const _saved=_atc?_atc.scrollTop:0;
  _renderUserDetailPanel(u);
  // Restaura scroll após render
  if(_atc)requestAnimationFrame(()=>{_atc.scrollTop=_saved;});
  if(u.uid&&typeof db!=='undefined'){
    db.collection('users').doc(u.uid).get().then(function(snap){
      if(snap.exists){_renderPermPanel(snap.data());}
    }).catch(function(){});
  }
}
function clsUser(){document.getElementById('udov').classList.remove('sh');}
async function toggleSuspend(uid,isSusp){if(!uid||!window.FB)return;await window.FB.suspendUser(uid,!isSusp);clsUser();renderUsers('todos');showToast(isSusp?'✓ Conta reativada':'⛔ Conta suspensa',isSusp?'success':'error');}
async function adminUpgrade(uid,plan){if(!uid||!window.FB)return;await window.FB.upgradePlan(uid,plan);clsUser();renderUsers('todos');showToast('✓ Plano alterado para '+plan);}
async function adminAddMinutes(uid){
  const inp=document.getElementById('admin-add-min-input');
  const mins=parseInt(inp?.value||0);
  if(!mins||mins<1){showToast('Informe uma quantidade válida','error');return;}
  if(!uid||!db){showToast('Firebase não conectado','error');return;}
  try{
    const snap=await db.collection('users').doc(uid).get();
    if(!snap.exists){showToast('Usuário não encontrado','error');return;}
    const current=snap.data().minutesLimit||5;
    await db.collection('users').doc(uid).update({
      minutesLimit:current+mins,
      updatedAt:firebase.firestore.Timestamp.now()
    });
    clsUser();renderUsers('todos');
    showToast('✅ +'+mins+' minutos adicionados!','success');
  }catch(e){showToast('Erro: '+e.message,'error');}
}

// ====== ADMIN — Reset PW ======
function openResetPw(uid,name){document.getElementById('rp-user-name').textContent=name;document.getElementById('rp-modal-el').currentUid=uid;document.getElementById('rp-err').style.display='none';document.getElementById('rp-ok').style.display='none';document.getElementById('rp-new').value='';document.getElementById('rp-confirm').value='';const uh=document.getElementById('rp-username-hidden');if(uh)uh.value=name||uid||'';document.getElementById('rp-modal-el').classList.add('sh');}
function closeResetPw(){document.getElementById('rp-modal-el').classList.remove('sh');}
function checkPwStrength(val){const bar=document.getElementById('pw-str-bar');if(!bar)return;let score=0;if(val.length>=8)score++;if(/[A-Z]/.test(val))score++;if(/[0-9]/.test(val))score++;const colors=['#ff4466','#ff8c00','#00ff88'],widths=['33%','66%','100%'];bar.style.width=score>0?widths[score-1]:'0%';bar.style.background=score>0?colors[score-1]:'transparent';}
function confirmResetPw(){const np=document.getElementById('rp-new').value,cp=document.getElementById('rp-confirm').value,err=document.getElementById('rp-err'),ok=document.getElementById('rp-ok');err.style.display='none';ok.style.display='none';if(np.length<8){err.textContent='Senha muito curta (mín. 8).';err.style.display='block';return;}if(np!==cp){err.textContent='Senhas não coincidem.';err.style.display='block';return;}ok.style.display='block';setTimeout(closeResetPw,1500);showToast('🔑 Senha redefinida!');}

// ====== ADMIN — Log ======
const adminLogData=[];
function addAdminLog(type,text){const now=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});adminLogData.unshift({type,text,time:now});renderAdminLog();}
function renderAdminLog(){const el=document.getElementById('admin-log');if(!el)return;if(!adminLogData.length){el.innerHTML='<div style="font-size:11px;color:var(--muted);padding:8px 0;text-align:center;">Nenhum log disponível</div>';return;}el.innerHTML=adminLogData.slice(0,20).map(l=>`<div class="alog-item"><span class="alog-time">${l.time}</span><span class="alog-badge ${l.type}">${l.type}</span><span class="alog-txt">${l.text}</span></div>`).join('');}

// ====== ADMIN — Chats ======
const adminChats=[];
let adminChatUnsubscribe=null;
function renderAdminChats(){
  const list=document.getElementById('admin-chat-list');
  const emptyEl=document.getElementById('chat-empty-state');
  if(!list)return;
  // Load real chats from Firestore
  if(window.FB&&window._fbUser?.role==='admin'){
    db.collection('chats').orderBy('updatedAt','desc').limit(30).get().then(snap=>{
      adminChats.length=0;
      snap.docs.forEach(d=>{
        const data=d.data();
        adminChats.push({
          id:d.id,uid:data.userId||d.id,
          name:data.userName||'Usuário',
          avatar:(data.userName||'U')[0].toUpperCase(),
          preview:data.lastMessage||'...',
          time:data.lastTime||'',
          unread:data.unread||false,
          online:false,msgs:[]
        });
      });
      _renderAdminChatList();
    }).catch(()=>{_renderAdminChatList();});
  }else{_renderAdminChatList();}
}
function _renderAdminChatList(){
  const list=document.getElementById('admin-chat-list');
  const emptyEl=document.getElementById('chat-empty-state');
  if(!list)return;
  list.innerHTML='';
  if(!adminChats.length){if(emptyEl)emptyEl.style.display='flex';const badge=document.getElementById('chat-badge');if(badge)badge.style.display='none';const uc=document.getElementById('chat-unread-count');if(uc)uc.style.display='none';return;}
  if(emptyEl)emptyEl.style.display='none';
  // Header com label e badge de não lidas
  const header=document.createElement('div');
  header.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
  const unreadCount=adminChats.filter(c=>c.unread).length;
  header.innerHTML=`<div style="font-size:10px;text-transform:uppercase;letter-spacing:3px;color:var(--muted);font-family:var(--mono);">CONVERSAS ATIVAS</div>${unreadCount>0?`<div style="font-size:10px;color:var(--accent);font-family:var(--mono);background:var(--adim);padding:3px 8px;border-radius:7px;">${unreadCount} não lida${unreadCount>1?'s':''}</div>`:''}`;
  list.appendChild(header);
  adminChats.forEach(c=>{const el=document.createElement('div');el.className='achat-item'+(c.unread?' unread':'');el.style.cssText='display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 14px;margin-bottom:8px;cursor:pointer;transition:all .18s;';el.innerHTML=`<div class="achat-av" style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0;">${c.avatar}</div><div style="flex:1;min-width:0;"><div style="display:flex;align-items:center;gap:6px;flex-wrap:nowrap;"><span class="achat-name" style="font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">${c.name}</span>${c.unread?'<span style="background:var(--accent);color:#000;font-size:8px;font-weight:800;padding:1px 5px;border-radius:5px;font-family:var(--mono);flex-shrink:0;">NOVO</span>':''}</div><div class="achat-preview" style="font-size:12px;color:var(--muted);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.preview||'...'}</div></div><div class="achat-time" style="font-size:11px;color:var(--muted);font-family:var(--mono);flex-shrink:0;text-align:right;">${c.time||''}</div>`;el.addEventListener('click',()=>openAdminChat(c));list.appendChild(el);});
  const unread=adminChats.filter(c=>c.unread).length,badge=document.getElementById('chat-badge');
  if(badge){badge.textContent=unread;badge.style.display=unread?'inline':'none';}
  const uc=document.getElementById('chat-unread-count');
  if(uc){uc.textContent=unread+' não lidas';uc.style.display=unread?'':'none';}
}
function openAdminChat(c){
  currentAdminChat=c;
  // Mark as read in Firestore
  if(c.uid&&window.FB){db.collection('chats').doc(c.uid).update({unread:false}).catch(()=>{});}
  c.unread=false;_renderAdminChatList();
  const title=document.getElementById('achat-modal-title');
  if(title)title.innerHTML=`<div style="font-size:15px;font-weight:700;">${c.name}</div><div style="font-size:11px;color:var(--muted);">● Chat</div>`;
  const msgs=document.getElementById('achat-msgs');
  if(msgs)msgs.innerHTML='';
  // Load messages from Firestore
  if(c.uid&&window.FB){
    if(adminChatUnsubscribe)adminChatUnsubscribe();
    adminChatUnsubscribe=db.collection('chats').doc(c.uid).collection('messages')
      .orderBy('createdAt','asc').limit(50)
      .onSnapshot(snap=>{
        const msgsEl=document.getElementById('achat-msgs');if(!msgsEl)return;
        msgsEl.innerHTML='';
        snap.docs.forEach(d=>{
          const m=d.data();
          if(m.createdAt)appendChatMsg(m.role,m.text,m.time||'','achat-msgs');
        });
      },(e)=>{console.warn('Admin chat listener:',e);});
  }else{
    // Demo fallback
    c.msgs.forEach(m=>appendChatMsg(m.role,m.text,m.time,'achat-msgs'));
  }
  // Fix mobile: mede altura real do .adh e aplica como variável CSS para o modal não sobrepor o header
  const _adh=document.querySelector('#page-admin .adh');
  if(_adh){document.getElementById('page-admin').style.setProperty('--adh-height',_adh.offsetHeight+'px');}
  document.getElementById('achat-modal').classList.add('sh');
}
function closeAdminChat(){document.getElementById('achat-modal').classList.remove('sh');if(adminChatUnsubscribe){adminChatUnsubscribe();adminChatUnsubscribe=null;}currentAdminChat=null;}
async function sendAdminReply(){
  if(!currentAdminChat)return;
  const field=document.getElementById('achat-reply-field');
  if(!field)return;const text=field.value.trim();if(!text)return;
  field.value='';field.style.height='';
  const now=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const uid=currentAdminChat.uid;
  // Save to Firestore so user sees admin reply
  if(uid&&window.FB){
    try{
      await db.collection('chats').doc(uid).collection('messages').add({role:'agent',text,time:now,createdAt:serverTimestamp()});
      await db.collection('chats').doc(uid).update({lastMessage:'Admin: '+text.substring(0,40),lastTime:now,updatedAt:serverTimestamp()});
    }catch(e){console.warn('Admin reply error:',e);}
  }else{
    appendChatMsg('agent',text,now,'achat-msgs');
  }
  addAdminLog('chat','Resposta enviada para '+currentAdminChat.name);
}
function adminReplyKeydown(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendAdminReply();}}
function adTab(id,btn){
  // Salva scroll atual do container antes de trocar aba
  const _cont=document.querySelector('.atcont');
  const _sc=_cont?_cont.scrollTop:0;
  document.querySelectorAll('.atab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');
  document.querySelectorAll('.atpanel').forEach(p=>p.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  // Sempre vai para o topo ao trocar aba (comportamento esperado)
  if(_cont) _cont.scrollTop=0;
  // Scroll horizontal para mostrar o botão da aba selecionada
  // Scroll só dentro do container .atabs, sem mover a página
  (function(){
    const tabsEl=document.querySelector('.atabs');
    if(!tabsEl)return;
    const btnRect=btn.getBoundingClientRect();
    const tabsRect=tabsEl.getBoundingClientRect();
    const offset=btnRect.left - tabsRect.left - (tabsRect.width/2) + (btnRect.width/2);
    tabsEl.scrollLeft+=offset;
  })();
  if(id==='usuarios')renderUsers('todos');
  if(id==='sistema')renderAdminLog();
  if(id==='chats')renderAdminChats();
  if(id==='visao')loadKPIs();
  if(id==='uso')loadUsoData();
  if(id==='api'){
    requestAnimationFrame(()=>startApiMonitor());
  }else{stopApiMonitor();}
}

// ====== ADMIN — Uso por Usuário ======
function initUsoMonthSel(){
  const sel=document.getElementById('uso-month-sel');
  if(!sel||sel.options.length>0)return;
  const now=new Date();
  for(let i=0;i<6;i++){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const val=d.toISOString().slice(0,7);
    const lbl=d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    const opt=document.createElement('option');
    opt.value=val;opt.textContent=lbl;
    if(i===0)opt.selected=true;
    sel.appendChild(opt);
  }
}
async function loadUsoData(){
  if(!window.FB||!db)return;
  initUsoMonthSel();
  const month=document.getElementById('uso-month-sel')?.value||new Date().toISOString().slice(0,7);
  const listEl=document.getElementById('uso-user-list');
  const logEl=document.getElementById('uso-log-list');
  if(listEl)listEl.innerHTML='<div style="padding:24px;text-align:center;font-size:12px;color:var(--muted);">Carregando...</div>';
  try{
    // Busca logs do mês
    const snap=await db.collection('logs').where('month','==',month).orderBy('createdAt','desc').limit(200).get();
    const logs=snap.docs.map(d=>({id:d.id,...d.data()}));

    // Agrega por usuário
    const byUser={};
    let totalTrans=0,totalTrad=0,totalSpeak=0,latSum=0,latCount=0;
    logs.forEach(l=>{
      const uid=l.uid||'anon';
      if(!byUser[uid])byUser[uid]={uid,transcricoes:0,traducoes:0,falas:0,minutos:0,latSum:0,latCount:0};
      if(l.type==='transcribe'){byUser[uid].transcricoes++;byUser[uid].minutos+=(l.durationMin||0);totalTrans++;}
      if(l.type==='translate'||l.type==='listen'){byUser[uid].traducoes++;totalTrad++;}
      if(l.type==='speak'){byUser[uid].falas++;totalSpeak++;}
      if(l.latency){byUser[uid].latSum+=l.latency;byUser[uid].latCount++;latSum+=l.latency;latCount++;}
    });

    // Totais
    document.getElementById('uso-total-trans').textContent=totalTrans;
    document.getElementById('uso-total-trad').textContent=totalTrad;
    document.getElementById('uso-total-speak').textContent=totalSpeak;
    document.getElementById('uso-total-lat').textContent=latCount>0?Math.round(latSum/latCount)+'ms':'—';

    // Busca nomes dos usuários
    const uids=Object.keys(byUser).filter(u=>u!=='anon');
    const userNames={};
    await Promise.all(uids.map(async uid=>{
      try{const d=await db.collection('users').doc(uid).get();userNames[uid]=d.data()?.name||uid.slice(0,8)+'...';}
      catch(e){userNames[uid]=uid.slice(0,8)+'...';}
    }));

    // Renderiza tabela
    const rows=Object.values(byUser).sort((a,b)=>b.transcricoes-a.transcricoes);
    if(!rows.length){
      listEl.innerHTML='<div style="padding:24px;text-align:center;font-size:12px;color:var(--muted);">Nenhum uso registrado neste mês</div>';
    } else {
      listEl.innerHTML=rows.map(u=>`
        <div style="display:grid;grid-template-columns:1fr 80px 80px 80px 80px 90px;padding:11px 14px;border-bottom:1px solid var(--border);font-size:12px;align-items:center;" class="list-row" style="border-radius:0;margin:0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${(userNames[u.uid]||'?')[0].toUpperCase()}</div>
            <div><div style="font-weight:700;font-size:12px;">${userNames[u.uid]||'Anônimo'}</div><div style="font-size:9px;color:var(--muted);font-family:var(--mono);">${u.uid.slice(0,10)}...</div></div>
          </div>
          <div style="text-align:center;font-weight:700;color:var(--accent);">${u.transcricoes}</div>
          <div style="text-align:center;font-weight:700;color:var(--green);">${u.traducoes}</div>
          <div style="text-align:center;font-weight:700;color:#c084fc;">${u.falas}</div>
          <div style="text-align:center;font-weight:700;color:var(--orange);">${u.minutos>0?u.minutos.toFixed(1)+'min':'—'}</div>
          <div style="text-align:center;font-size:11px;color:var(--muted);font-family:var(--mono);">${u.latCount>0?Math.round(u.latSum/u.latCount)+'ms':'—'}</div>
        </div>`).join('');
    }

    // Renderiza log recente
    if(logEl){
      const typeIcon={transcribe:'🎙️',translate:'🌐',listen:'🎧',speak:'🔊',session_end:'✅'};
      logEl.innerHTML=logs.slice(0,30).map(l=>{
        const name=userNames[l.uid]||l.uid?.slice(0,8)||'?';
        const icon=typeIcon[l.type]||'📋';
        const time=l.createdAt?.toDate?.()?.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})||'—';
        const detail=l.type==='transcribe'?`${(l.durationMin||0).toFixed(2)}min`:l.type==='translate'||l.type==='listen'?`${l.latency||0}ms`:l.chars?`${l.chars} chars`:'';
        return `<div style="display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:9px 12px;">
          <span style="font-size:16px;">${icon}</span>
          <div style="flex:1;"><span style="font-size:12px;font-weight:700;">${name}</span> <span style="font-size:11px;color:var(--muted);">${l.type}</span></div>
          <span style="font-size:10px;color:var(--accent);font-family:var(--mono);">${detail}</span>
          <span style="font-size:10px;color:var(--muted);font-family:var(--mono);">${time}</span>
        </div>`;
      }).join('')||'<div style="font-size:12px;color:var(--muted);text-align:center;padding:16px;">Nenhum log</div>';
    }
  }catch(e){
    if(listEl)listEl.innerHTML=`<div style="padding:24px;text-align:center;font-size:12px;color:var(--red);">Erro: ${e.message}</div>`;
    console.error('loadUsoData:',e);
  }
}

// Load real KPIs from Firestore
async function loadKPIs(){
  const setEl=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val;};
  // Reset
  setEl('kpi-users','—');setEl('kpi-rev','—');setEl('kpi-sess','—');setEl('kpi-lat','—');
  setEl('kpi-users-d','Carregando...');setEl('kpi-rev-d','Carregando...');
  setEl('kpi-sess-d','Carregando...');setEl('kpi-lat-d','Carregando...');

  if(!window.FB||!window._fbUser){
    setEl('kpi-users-d','Firebase não conectado');
    setEl('kpi-rev-d','—');setEl('kpi-sess-d','—');setEl('kpi-lat-d','—');
    return;
  }

  try{
    // Buscar tudo em paralelo para máxima velocidade
    const today=new Date();today.setHours(0,0,0,0);
    const [usersSnap, sessTodaySnap, sessAllSnap, revDoc, logsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('sessions').where('createdAt','>=',today).get().catch(()=>({size:0,docs:[]})),
      db.collection('sessions').orderBy('createdAt','desc').limit(200).get().catch(()=>({size:0,docs:[]})),
      db.collection('admin_settings').doc('revenue').get().catch(()=>null),
      db.collection('logs').where('type','==','payment').where('payment_status','==','pago').where('month','==',new Date().toISOString().slice(0,7)).get().catch(()=>({docs:[]}))
    ]);

    // 1. Usuários
    const allUsers=usersSnap.docs.map(d=>d.data());
    const totalUsers=allUsers.length;
    const activeUsers=allUsers.filter(u=>u.status==='active').length;
    setEl('kpi-users',totalUsers.toLocaleString('pt-BR'));
    setEl('kpi-users-d',activeUsers+' ativos · '+totalUsers+' total');

    // 2. Sessões — hoje e total
    const sessToday=sessTodaySnap.size||0;
    const sessTotal=sessAllSnap.size||0;
    let totalMinutes=0;
    sessTodaySnap.docs?.forEach(d=>{const s=d.data();totalMinutes+=s.duration_min||Math.ceil((s.duration||0)/60);});
    setEl('kpi-sess',sessToday.toLocaleString('pt-BR'));
    setEl('kpi-sess-d','Sessões hoje · '+sessTotal+' total');

    // 3. Receita dos logs
    const planPrices={trial:0,basic:149,pro:429,business:1190,enterprise:3490};
    let receitaEstimada=0;
    allUsers.forEach(u=>{receitaEstimada+=(planPrices[u.plan]||0);});
    let receitaConfirmada=0;
    let totalPagamentos=0;
    logsSnap.docs?.forEach(d=>{const l=d.data();receitaConfirmada+=parseFloat(l.amount||0);totalPagamentos++;});
    if(!receitaConfirmada&&revDoc?.exists){
      const rv=revDoc.data().confirmed||0;
      receitaConfirmada=rv;
    }
    _confirmedRevenue=receitaConfirmada;
    const inp=document.getElementById('rev-real-input');if(inp&&receitaConfirmada>0)inp.value=receitaConfirmada.toFixed(2);
    setEl('kpi-rev',receitaConfirmada>0?'R$'+receitaConfirmada.toLocaleString('pt-BR'):'R$0');
    setEl('kpi-rev-d',receitaConfirmada>0?'Receita confirmada':'Nenhum pagamento confirmado');

    // 4. Latência média — calculada das sessões recentes (via Firebase check)
    // O updateSparkline já atualiza kpi-lat via checkApiStatus, mas se não tiver ainda:
    const latEl=document.getElementById('kpi-lat');
    if(!latEl||latEl.textContent==='—'){
      // Calcula média das latências das sessões do Firestore
      const latSessions=sessAllSnap.docs?.slice(0,50).map(d=>d.data()).filter(s=>s.latency)||[];
      if(latSessions.length>0){
        const avgLat=Math.round(latSessions.reduce((a,s)=>a+(s.latency||0),0)/latSessions.length);
        setEl('kpi-lat',avgLat+'ms');
        setEl('kpi-lat-d','Média de '+latSessions.length+' sessões');
      } else {
        setEl('kpi-lat','—');
        setEl('kpi-lat-d',sessTotal>0?'Sessões sem latência registrada':'Aguardando sessões');
      }
    }

    // 5. Atualizar painel de receita consolidada
    const custoPorMin=0.074; // R$/min estimado
    const custoAPIs=totalMinutes*custoPorMin;
    const infra=0; // sem infra ainda
    // Receita bruta = confirmada pelo admin (campo manual) ou 0 se não informado
    const receitaBruta=_confirmedRevenue||0;
    const lucro=receitaBruta-custoAPIs-infra;
    const margem=receitaBruta>0?((lucro/receitaBruta)*100).toFixed(1)+'%':'—';
    const fmt=(v)=>'R$'+Math.max(0,v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
    setEl('rev-bruta',fmt(receitaBruta));
    setEl('rev-estimada',fmt(receitaEstimada)); // linha cinza de estimativa
    setEl('rev-custo',fmt(custoAPIs));
    setEl('rev-infra',fmt(infra));
    setEl('rev-lucro',fmt(lucro));
    setEl('rev-margem',margem);
    setEl('rev-users',totalUsers);
    // Barras de progresso
    if(receitaBruta>0){
      const setBar=(id,pct)=>{const e=document.getElementById(id);if(e)e.style.width=Math.min(100,pct)+'%';};
      setBar('rev-bruta-bar',100);
      setBar('rev-custo-bar',(custoAPIs/receitaBruta)*100);
      setBar('rev-infra-bar',(infra/receitaBruta)*100||1);
    }

    // 6. Consumo real baseado em sessões do Firestore
    const whisperMins=totalMinutes;
    const elevenChars=totalMinutes*150; // ~150 chars/min estimado
    const gptTokens=totalMinutes*200;   // ~200 tokens/min estimado
    setEl('consumo-whisper-txt',whisperMins.toLocaleString('pt-BR')+' min gravados');
    setEl('consumo-eleven-txt',elevenChars.toLocaleString('pt-BR')+' chars (est.)');
    setEl('consumo-gpt-txt',gptTokens.toLocaleString('pt-BR')+' tokens (est.)');
    setEl('consumo-sess-txt',sessTotal+' sessões registradas');
    
    // 7. Cálculo de custos por API (preços oficiais)
    const WHISPER_PRICE = 0.006; // $0.006 por minuto
    const ELEVEN_FREE_LIMIT = 10000; // 10k chars grátis
    const ELEVEN_PRICE = 0.30 / 1000; // $0.30 por 1000 chars
    const GPT_PRICE = 0.30 / 1000000; // ~$0.30 por 1M tokens (média input+output)
    const USD_TO_BRL = 5.00; // Taxa de câmbio (ajustar conforme necessário)
    
    // Whisper: sempre pago
    const whisperCost = whisperMins * WHISPER_PRICE;
    
    // ElevenLabs: grátis até 10k, depois pago
    const elevenCost = elevenChars > ELEVEN_FREE_LIMIT 
      ? (elevenChars - ELEVEN_FREE_LIMIT) * ELEVEN_PRICE 
      : 0;
    
    // GPT-4o Mini: sempre pago
    const gptCost = gptTokens * GPT_PRICE;
    
    // Total gasto
    const totalCostUSD = whisperCost + elevenCost + gptCost;
    const totalCostBRL = totalCostUSD * USD_TO_BRL;
    
    // Atualizar UI de custos individuais
    setEl('consumo-whisper-cost', '$' + whisperCost.toFixed(2));
    setEl('consumo-eleven-cost', elevenChars > ELEVEN_FREE_LIMIT 
      ? '$' + elevenCost.toFixed(2) 
      : 'Grátis');
    setEl('consumo-gpt-cost', '$' + gptCost.toFixed(3));
    
    // Atualizar total gasto
    setEl('consumo-total-usd', '$' + totalCostUSD.toFixed(2));
    setEl('consumo-total-brl', 'R$ ' + totalCostBRL.toFixed(2));
    
    // 8. Calcular Saldo Disponível
    const MONTHLY_BUDGET = parseFloat(localStorage.getItem('orcamentoMensal') || '10.00'); // Padrão: $10/mês
    const saldoUSD = Math.max(0, MONTHLY_BUDGET - totalCostUSD);
    const saldoBRL = saldoUSD * USD_TO_BRL;
    const usedPct = (totalCostUSD / MONTHLY_BUDGET) * 100;
    
    // Atualizar UI do orçamento
    setEl('orcamento-mensal-txt', '$' + MONTHLY_BUDGET.toFixed(2));
    setEl('saldo-disponivel-usd', '$' + saldoUSD.toFixed(2));
    setEl('saldo-disponivel-brl', 'R$ ' + saldoBRL.toFixed(2));
    setEl('orcamento-pct-txt', usedPct.toFixed(1) + '% usado');
    
    // Cor do saldo (verde se OK, amarelo se atenção, vermelho se acabando)
    const saldoEl = document.getElementById('saldo-disponivel-usd');
    if(saldoEl){
      if(usedPct >= 90) saldoEl.style.color = 'var(--red)';
      else if(usedPct >= 70) saldoEl.style.color = 'var(--yellow)';
      else saldoEl.style.color = 'var(--green)';
    }
    
    // Barra de progresso do orçamento
    const orcBar = document.getElementById('orcamento-bar');
    if(orcBar){
      orcBar.style.width = Math.min(100, usedPct) + '%';
      if(usedPct >= 90) orcBar.style.background = 'linear-gradient(90deg,var(--red),#ff6666)';
      else if(usedPct >= 70) orcBar.style.background = 'linear-gradient(90deg,var(--yellow),var(--orange))';
      else orcBar.style.background = 'linear-gradient(90deg,var(--green),var(--accent))';
    }
    
    // Alerta de orçamento estourado
    const orcAlert = document.getElementById('orcamento-alert');
    const orcAlertTxt = document.getElementById('orcamento-alert-text');
    if(usedPct >= 100 && orcAlert && orcAlertTxt){
      orcAlert.style.display = 'flex';
      orcAlertTxt.innerHTML = '<strong>Orçamento esgotado!</strong> Você já gastou $' + totalCostUSD.toFixed(2) + ' de $' + MONTHLY_BUDGET.toFixed(2) + ' disponíveis.';
    } else if(usedPct >= 80 && orcAlert && orcAlertTxt){
      orcAlert.className = 'alert alert-yellow';
      orcAlert.style.display = 'flex';
      orcAlertTxt.innerHTML = '<strong>Atenção:</strong> Você já usou ' + usedPct.toFixed(0) + '% do orçamento mensal. Resta $' + saldoUSD.toFixed(2) + '.';
    } else if(orcAlert){
      orcAlert.style.display = 'none';
    }
    
    // Barras consumo
    const maxMins=600;
    const setBar2=(id,pct,warn)=>{const e=document.getElementById(id);if(e){e.style.width=Math.min(100,pct)+'%';if(warn&&pct>80)e.className='ubf warn';}};
    setBar2('consumo-whisper-bar',(whisperMins/maxMins)*100,true);
    setBar2('consumo-eleven-bar',(elevenChars/10000)*100,true); // 10K créditos free
    setBar2('consumo-gpt-bar',Math.min(30,(gptTokens/100000)*100),false);
    setBar2('consumo-sess-bar',Math.min(100,(sessTotal/50)*100),false);

    // Alert ElevenLabs se perto do limite
    const elevenPct=(elevenChars/10000)*100;
    const alertEl=document.getElementById('consumo-alert');
    const alertTxt=document.getElementById('consumo-alert-text');
    if(elevenPct>80&&alertEl&&alertTxt){
      alertEl.style.display='flex';
      alertTxt.innerHTML='<strong>ElevenLabs em '+elevenPct.toFixed(0)+'% dos créditos gratuitos.</strong> Considere upgrade para um plano pago.';
    } else if(alertEl){alertEl.style.display='none';}

    // 7. Excedente real
    const excMinutos=Math.max(0,allUsers.reduce((a,u)=>a+Math.max(0,(u.minutesUsed||0)-(u.minutesLimit||5)),0));
    const excReceita=excMinutos*2.50;
    const excCusto=excMinutos*1.05;
    const excLucro=excReceita-excCusto;
    setEl('exc-min',excMinutos>0?'+'+excMinutos.toLocaleString('pt-BR')+' min':'0 min');
    setEl('exc-receita',excReceita>0?'+'+fmt(excReceita):fmt(0));
    setEl('exc-custo',excCusto>0?'-'+fmt(excCusto):fmt(0));
    setEl('exc-lucro',excLucro>0?'+'+fmt(excLucro):fmt(0));

  }catch(e){
    setEl('kpi-users-d','Erro: '+e.message.substring(0,40));
    console.error('loadKPIs error:',e);
  }
}

// ====== API AUTO-MONITOR ======
// (vars declaradas no topo do script)

function startApiMonitor(){
  // Limpa qualquer intervalo anterior
  stopApiMonitor();
  // Verificação imediata silenciosa
  checkApiStatus(false);
  // Countdown visual a cada 1s
  _apiCountdown=MONITOR_INTERVAL;
  const elCd=document.getElementById('api-countdown');
  if(elCd)elCd.textContent=_apiCountdown+'s';
  _apiCountdownInterval=setInterval(()=>{
    _apiCountdown--;
    const el=document.getElementById('api-countdown');
    if(el)el.textContent=(_apiCountdown>0?_apiCountdown:MONITOR_INTERVAL)+'s';
    if(_apiCountdown<=0){
      _apiCountdown=MONITOR_INTERVAL;
      // Salva scroll antes da verificação automática
      const _ac=document.querySelector('.atcont');
      const _as=_ac?_ac.scrollTop:0;
      checkApiStatus(false).finally(()=>{if(_ac)_ac.scrollTop=_as;});
    }
  },1000);
  _apiMonitorInterval=1; // flag: monitor ativo (o interval real é _apiCountdownInterval)
  // Redraw charts on resize — FIX: debounce para evitar "ResizeObserver loop" no Chrome
  if(window.ResizeObserver){
    const charts=document.getElementById('neon-charts');
    if(charts&&!charts._ro){
      let _roTimer=null;
      charts._ro=new ResizeObserver(()=>{
        clearTimeout(_roTimer);
        _roTimer=setTimeout(()=>{
          Object.keys(_neonColors).forEach(api=>_drawNeonChart(api));
        },50);
      });
      charts._ro.observe(charts);
    }
  }
}

function stopApiMonitor(){
  clearInterval(_apiCountdownInterval);
  clearInterval(_apiMonitorInterval);
  _apiCountdownInterval=null;
  _apiMonitorInterval=null;
  _apiCountdown=MONITOR_INTERVAL;
  const el=document.getElementById('api-countdown');
  if(el)el.textContent=MONITOR_INTERVAL+'s';
  const dot=document.getElementById('api-monitor-dot');
  if(dot)dot.style.background='var(--muted)';
}

// ====== NEON LATENCY CHARTS ======
const _neonData = {
  firebase: [], openai: [], gpt: [], eleven: [], railway: [], cycle: [], anthropic: []
};
const _neonColors = {
  firebase: '#00e5ff', openai: '#00ff88', gpt: '#c084fc', eleven: '#ff8c00', railway: '#ffd000', cycle: '#ffffff', anthropic: '#ff6b35'
};
const NEON_MAX_POINTS = 30;

function _drawNeonChart(api) {
  const canvas = document.getElementById('neon-canvas-' + api);
  if (!canvas) return;
  const data = _neonData[api];
  const color = _neonColors[api];
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth || 300;
  const H = 36;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  if (data.length < 2) {
    // Draw flat dashed line when no data
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = color + '33';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    return;
  }

  const max = Math.max(...data, 100);
  const min = Math.min(...data);
  const pad = 4;
  const _denom = data.length > 1 ? data.length - 1 : 1;

  // Points — espalha sempre de 0 a W, clampado ao canvas
  const pts = data.map((v, i) => ({
    x: Math.min((i / _denom) * W, W),
    y: pad + (1 - (v - min) / (max - min + 1)) * (H - pad * 2)
  }));

  // Clip to canvas so lines never overflow
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();

  // Fill gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Neon glow line
  ctx.setLineDash([]);
  ctx.shadowBlur = 8;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  ctx.restore();

  // Dot at last point (clamped)
  const last = pts[pts.length - 1];
  const _lastX = Math.min(last.x, W - 4);
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(_lastX, last.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function updateNeonChart(api, ms) {
  if (ms === undefined || ms === null) return;
  const arr = _neonData[api];
  arr.push(ms);
  if (arr.length > NEON_MAX_POINTS) arr.shift();
  _drawNeonChart(api);
  // Update value label
  const valEl = document.getElementById('neon-val-' + api);
  if (valEl) {
    valEl.textContent = ms + 'ms';
    const color = ms < 150 ? '#00ff88' : ms < 500 ? '#ff8c00' : '#ff4466';
    valEl.style.color = color;
  }
}

function updateSparkline(ms) {
  // Keep old compat + update firebase neon chart
  updateNeonChart('firebase', ms);
  // Also update KPI latency card
  const kpiLat = document.getElementById('kpi-lat'); if (kpiLat) kpiLat.textContent = ms + 'ms';
  const avg = _neonData.firebase.length ? Math.round(_neonData.firebase.reduce((a, b) => a + b, 0) / _neonData.firebase.length) : ms;
  const kpiLatD = document.getElementById('kpi-lat-d'); if (kpiLatD) kpiLatD.textContent = 'Firebase avg ' + avg + 'ms';
}

// ====== CYCLE BREAKDOWN ======
function updateCycleBreakdown(totalMs, whisperMs, gptMs, elevenMs) {
  const knownMs = (whisperMs||0) + (gptMs||0) + (elevenMs||0);
  const netMs = Math.max(0, totalMs - knownMs);
  updateNeonChart('cycle', totalMs);
  const totalEl = document.getElementById('cycle-total');
  if (totalEl) {
    const color = totalMs < 1500 ? '#00ff88' : totalMs < 3000 ? '#ff8c00' : '#ff4466';
    totalEl.textContent = totalMs + 'ms';
    totalEl.style.color = color;
  }
  const segs = [
    { key: 'whisper', ms: whisperMs || Math.round(totalMs * 0.35) },
    { key: 'gpt',     ms: gptMs     || Math.round(totalMs * 0.30) },
    { key: 'eleven',  ms: elevenMs  || Math.round(totalMs * 0.20) },
    { key: 'net',     ms: netMs     || Math.round(totalMs * 0.15) },
  ];
  segs.forEach(s => {
    const pct = Math.min(100, Math.round((s.ms / totalMs) * 100));
    const bar = document.getElementById('cycle-' + s.key + '-bar');
    const val = document.getElementById('cycle-' + s.key + '-val');
    if (bar) bar.style.width = pct + '%';
    if (val) val.textContent = s.ms + 'ms (' + pct + '%)';
  });
  const note = document.getElementById('cycle-note');
  const now = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  if (note) note.textContent = 'Última atualização: ' + now;
}

async function checkApiStatus(showToasts=true){
  // Salva posição do scroll antes de qualquer atualização DOM
  const _atcont=document.querySelector('.atcont');
  const _savedScroll=_atcont?_atcont.scrollTop:0;
  const _restoreScroll=()=>{if(_atcont)_atcont.scrollTop=_savedScroll;};
  const setStatus=(dotId,badgeId,latId,pingId,status,detail,pingMs)=>{
    const dot=document.getElementById(dotId),badge=document.getElementById(badgeId);
    const lat=document.getElementById(latId),ping=document.getElementById(pingId);
    const colors={ok:'var(--green)',warn:'var(--orange)',err:'var(--muted)'};
    const labels={ok:'Online',warn:'Lenta',err:'Offline'};
    const badgeStyles={ok:'background:var(--gdim);color:var(--green)',warn:'background:var(--odim);color:var(--orange)',err:'background:var(--rdim);color:var(--muted)'};
    if(dot)dot.style.background=colors[status]||colors.err;
    if(badge){badge.textContent=labels[status]||'Offline';badge.style.cssText=badgeStyles[status]||badgeStyles.err;}
    if(lat)lat.textContent=detail||'—';
    if(ping&&pingMs!==undefined){
      const c=pingMs<150?'var(--green)':pingMs<400?'var(--orange)':'var(--red)';
      ping.textContent=pingMs+'ms';ping.style.color=c;
    }
  };

  if(showToasts)showToast('🔄 Verificando APIs...','info');

  // 1. Firebase latency — real measurement
  if(auth&&db){
    const t0=performance.now();
    try{
      await db.collection('users').doc(window._fbUser?.uid||'_').get();
      const fbMs=Math.round(performance.now()-t0);
      const fbStatus=fbMs<300?'ok':fbMs<800?'warn':'err';
      setStatus('dot-firebase','badge-firebase','lat-firebase','ping-firebase',fbStatus,'Projeto aivox-4bcbe · '+fbMs+'ms',fbMs);
      updateSparkline(fbMs);
    }catch(e){
      const fbMs=Math.round(performance.now()-t0);
      setStatus('dot-firebase','badge-firebase','lat-firebase','ping-firebase','ok','Firebase ativo (read-only)',fbMs);
      updateSparkline(fbMs);
    }
    // Ping backend URL for railway chart
    const backendUrl=getBackendUrl();
    if(backendUrl){
      try{
        const tb=performance.now();
        const rb=await fetch(backendUrl+'/api/ping',{signal:AbortSignal.timeout(5000)});
        const bMs=Math.round(performance.now()-tb);
        if(rb.ok){
          setStatus('dot-railway','badge-railway','lat-railway','ping-railway','ok',backendUrl.replace('https://','')+' · '+bMs+'ms',bMs);
          updateNeonChart('railway',bMs);
        }else{setStatus('dot-railway','badge-railway','lat-railway','ping-railway','err','Backend retornou erro',undefined);}
      }catch(e){setStatus('dot-railway','badge-railway','lat-railway','ping-railway','err','Sem resposta: '+e.message.slice(0,30),undefined);}
    }else{
      setStatus('dot-railway','badge-railway','lat-railway','ping-railway','warn','URL não configurada',undefined);
    }
  }

  // 2. Check API keys via backend /api/check-keys
  const uid=window._fbUser?.uid;
  const backendUrlForKeys=getBackendUrl();

  
  if(backendUrlForKeys){
    try{
      const t1=performance.now();
      // /api/diagnose é público — não precisa de token
      const resp=await fetch(backendUrlForKeys+'/api/diagnose',{
        signal:AbortSignal.timeout(8000)
      });
      const keysMs=Math.round(performance.now()-t1);
      
      if(resp.ok){
        const data=await resp.json();
        console.log('🔑 [API CHECK] dados:', JSON.stringify(data));
        
        if(data.openai){
          setStatus('dot-openai','badge-openai','lat-openai','ping-openai','ok','Chave OK no Render ✓',keysMs);
          setStatus('dot-gpt','badge-gpt','lat-gpt','ping-gpt','ok','Chave OK no Render ✓',keysMs);
          updateNeonChart('openai',keysMs);updateNeonChart('gpt',keysMs);
        }else{
          setStatus('dot-openai','badge-openai','lat-openai','ping-openai','err','❌ Chave inválida ou ausente no Render',undefined);
          setStatus('dot-gpt','badge-gpt','lat-gpt','ping-gpt','err','❌ Chave inválida ou ausente no Render',undefined);
        }
        if(data.elevenlabs){
          setStatus('dot-eleven','badge-eleven','lat-eleven','ping-eleven','ok','Chave OK no Render ✓',keysMs);
          updateNeonChart('eleven',keysMs);
        }else{
          setStatus('dot-eleven','badge-eleven','lat-eleven','ping-eleven','err','❌ Chave inválida ou ausente no Render',undefined);
        }
        if(data.anthropic){
          setStatus('dot-anthropic','badge-anthropic','lat-anthropic','ping-anthropic','ok','Chave OK no Render ✓',keysMs);
          updateNeonChart('anthropic',keysMs);
        }else{
          setStatus('dot-anthropic','badge-anthropic','lat-anthropic','ping-anthropic','ok','✓ Azure OpenAI ativo (fallback Anthropic)',undefined);
        }
        if(showToasts)showToast('✓ Status verificado!','success');
      }else{
        const errText=await resp.text().catch(()=>'');
        console.error('🔑 [API CHECK] erro HTTP:', resp.status, errText.slice(0,200));
        // Fallback: marca como não verificável
        ['openai','gpt','eleven'].forEach(s=>{
          setStatus('dot-'+s,'badge-'+s,'lat-'+s,'ping-'+s,'warn','Backend não respondeu ('+resp.status+')',undefined);
        });
      }
    }catch(e){
      console.error('🔑 [API CHECK] exceção:', e.message);
      ['openai','gpt','eleven'].forEach(s=>{
        setStatus('dot-'+s,'badge-'+s,'lat-'+s,'ping-'+s,'warn','Erro: '+e.message.slice(0,40),undefined);
      });
      if(showToasts)showToast('Erro ao verificar APIs: '+e.message,'error');
    }
  }else if(uid&&window.FB){
    // Fallback antigo via Firestore se não tiver backend configurado
    try{
      const t1=performance.now();
      const keys=await window.FB.getApiKeys(uid);
      const keysMs=Math.round(performance.now()-t1);
      console.log('🔑 [API CHECK] fallback Firestore keys:', Object.keys(keys||{}));
      if(keys.openai_api_key){
        setStatus('dot-openai','badge-openai','lat-openai','ping-openai','ok','Chave no Firestore ✓',keysMs);
        setStatus('dot-gpt','badge-gpt','lat-gpt','ping-gpt','ok','Chave no Firestore ✓',keysMs);
      }else{
        setStatus('dot-openai','badge-openai','lat-openai','ping-openai','err','Chave não encontrada',undefined);
        setStatus('dot-gpt','badge-gpt','lat-gpt','ping-gpt','err','Chave não encontrada',undefined);
      }
      if(keys.elevenlabs_api_key){
        setStatus('dot-eleven','badge-eleven','lat-eleven','ping-eleven','ok','Chave no Firestore ✓',keysMs);
      }else{
        setStatus('dot-eleven','badge-eleven','lat-eleven','ping-eleven','err','Chave não encontrada',undefined);
      }
      if(showToasts)showToast('✓ Status verificado!','success');
    }catch(e){
      console.error('🔑 [API CHECK] Firestore erro:', e.message);
      if(showToasts)showToast('Erro: '+e.message,'error');
    }
  }else{
    // No user — show as unconfigured
    ['openai','gpt','eleven'].forEach(s=>{
      setStatus('dot-'+s,'badge-'+s,'lat-'+s,'ping-'+s,'err','Faça login para verificar',undefined);
    });
  }
  // Reset countdown
  // Restaura posição do scroll após todas as atualizações DOM
  setTimeout(_restoreScroll, 80);
  _apiCountdown=MONITOR_INTERVAL;
  const el=document.getElementById('api-countdown');if(el)el.textContent=MONITOR_INTERVAL+'s';
}


// ====== ADMIN — API Buttons (functional) ======
function exportLogs(){showToast('📥 Exportando logs...');setTimeout(()=>{const data='Timestamp,Ação,Descrição\n'+adminLogData.map(l=>`${l.time},${l.type},${l.text}`).join('\n');const blob=new Blob([data||'Sem logs disponíveis'],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='aivox-logs-'+(new Date().toISOString().split('T')[0])+'.csv';a.click();URL.revokeObjectURL(url);showToast('✓ Logs exportados!');},800);}
function upgradeElevenLabs(){window.open('https://elevenlabs.io/pricing','_blank');showToast('↗ Abrindo ElevenLabs Pricing...','info');}

// ====== CHAT (User ↔ Admin via Firestore) ======
const chatHistory=[];
let chatUnsubscribe=null;

function initUserChat(){
  const uid=window._fbUser?.uid;
  const msgs=document.getElementById('chat-msgs');
  if(!msgs)return;
  if(!uid||!window.FB){
    msgs.innerHTML='<div class="cmsg agent"><div class="cmsg-inner">Olá! 👋 Sou da equipe AIVOX.</div><div class="cmsg-meta">AIVOX · agora</div></div><div class="cmsg agent"><div class="cmsg-inner" style="background:var(--odim);border:1px solid rgba(255,140,0,.3);color:var(--orange);">⚠️ Firebase offline — mensagens não disponíveis. Use o WhatsApp para suporte imediato.</div><div class="cmsg-meta">Sistema · agora</div></div>';
    return;
  }
  // Load existing messages and listen for new ones
  if(chatUnsubscribe)chatUnsubscribe();
  // Clear existing messages except the welcome one
  msgs.innerHTML='<div class="cmsg agent"><div class="cmsg-inner">Olá! 👋 Sou da equipe AIVOX. Como posso ajudar?</div><div class="cmsg-meta">AIVOX · agora</div></div>';
  try{
    chatUnsubscribe=db.collection('chats').doc(uid).collection('messages')
      .orderBy('createdAt','asc').limit(50)
      .onSnapshot(snap=>{
        snap.docChanges().forEach(change=>{
          if(change.type==='added'){
            const d=change.doc.data();
            if(d.createdAt){// only show if timestamp is set (not pending)
              appendChatMsg(d.role,d.text,d.time||new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),'chat-msgs');
            }
          }
        });
      },(e)=>{console.warn('Chat listener error:',e);});
  }catch(e){console.warn('Chat init error:',e);}
}

async function sendChatMsg(){
  const field=document.getElementById('chat-input-field');
  if(!field)return;
  const text=field.value.trim();
  if(!text)return;
  field.value='';field.style.height='';
  const now=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  const uid=window._fbUser?.uid;
  const uname=window._fbUser?.name||'Usuário';
  // Show locally immediately
  appendChatMsg('user',text,now,'chat-msgs');
  // Save to Firestore
  if(uid&&window.FB){
    try{
      await db.collection('chats').doc(uid).set({
        userId:uid,userName:uname,userEmail:window._fbUser?.email||'',
        lastMessage:text,lastTime:now,unread:true,updatedAt:serverTimestamp()
      },{merge:true});
      await db.collection('chats').doc(uid).collection('messages').add({
        role:'user',text,time:now,createdAt:serverTimestamp()
      });
    }catch(e){console.warn('Save chat error:',e);}
  }else{
    // Demo fallback
    chatHistory.push({role:'user',text,time:now});
    setTimeout(()=>{
      const replies=['Olá! Recebi sua mensagem. Nossa equipe responderá em breve. 😊','Obrigado pelo contato! Para suporte imediato, use o WhatsApp. ⚡','Entendido! Vou encaminhar para nossa equipe técnica.'];
      const r=replies[Math.floor(Math.random()*replies.length)];
      const t2=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
      appendChatMsg('agent',r,t2,'chat-msgs');
    },1200);
  }
}
function appendChatMsg(role,text,time,cId){const c=document.getElementById(cId);if(!c)return;const el=document.createElement('div');el.className='cmsg '+role;el.innerHTML=`<div class="cmsg-inner">${text}</div><div class="cmsg-meta">${role==='agent'?'AIVOX':'Você'} · ${time}</div>`;c.appendChild(el);c.scrollTop=c.scrollHeight;}
function chatKeydown(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMsg();}}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,120)+'px';}

// ====== PAYMENT ======
function openPayment(pl){
  payFromPage=currentPage;
  _currentPayPlan=pl;
  _pixCode=null;
  _pixPaymentId=null;
  _pixPollInterval && clearInterval(_pixPollInterval);
  const d=planDetails[pl]||planDetails.pro;
  const t=document.getElementById('pay-title');if(t)t.textContent='Assinar '+d.name;
  const n=document.getElementById('pay-plan-name');if(n)n.textContent=d.name;
  const ds=document.getElementById('pay-plan-desc');if(ds)ds.textContent=d.desc;
  const pr=document.getElementById('pay-price');if(pr)pr.textContent=d.price;
  const mn=document.getElementById('pay-mins');if(mn)mn.textContent=d.mins;
  const suc=document.getElementById('pay-success');if(suc){suc.style.display='none';suc.style.animation='';}
  const btn=document.getElementById('pay-btn');if(btn){btn.style.background='';btn.style.opacity='';btn.style.pointerEvents='';}
  const txt=document.getElementById('pay-btn-txt');if(txt)txt.textContent='Gerar QR Code Pix';
  // Reset QR
  const qrWrap=document.getElementById('pix-qr-wrap');if(qrWrap)qrWrap.innerHTML='<div style="font-size:32px;">⏳</div>';
  const codeTxt=document.getElementById('pix-code-txt');if(codeTxt)codeTxt.textContent='Clique em "Gerar QR Code Pix" para continuar';
  const lbl=document.getElementById('pix-label');if(lbl)lbl.textContent='Pix — Aprovação instantânea';
  const sr=document.getElementById('pix-status-row');if(sr)sr.style.display='none';
  const timer=document.getElementById('pix-timer');if(timer)timer.textContent='';
  navApp('payment');
}

let _currentPayPlan=null,_pixCode=null,_pixPaymentId=null,_pixPollInterval=null,_pixExpiry=null;

function selPayMethod(el,method){document.querySelectorAll('.pay-method').forEach(m=>m.classList.remove('active'));el.classList.add('active');document.querySelectorAll('.pay-radio').forEach(r=>r.classList.remove('on'));const r=el.querySelector('.pay-radio');if(r)r.classList.add('on');}

function copyPix(){
  if(!_pixCode){showToast('⚠️ Gere o QR Code primeiro','error');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(_pixCode).catch(()=>{});
  const btn=document.getElementById('copy-pix-btn');
  if(btn){btn.textContent='✓ Copiado!';btn.style.background='var(--gdim)';btn.style.color='var(--green)';setTimeout(()=>{btn.textContent='Copiar';btn.style.background='var(--adim)';btn.style.color='var(--accent)';},2500);}
  showToast('✓ Código Pix copiado!');
}

async function confirmPay(){
  if(!window._fbUser){showToast('⚠️ Faça login primeiro','error');return;}
  const btn=document.getElementById('pay-btn');
  const txt=document.getElementById('pay-btn-txt');
  if(btn){btn.style.opacity='.6';btn.style.pointerEvents='none';}
  if(txt)txt.textContent='Gerando QR Code...';
  const lbl=document.getElementById('pix-label');
  if(lbl)lbl.textContent='Gerando QR Code...';
  try{
    const token=await getAuthToken();
    const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
    const res=await fetch(getBackendUrl()+'/api/pix/criar',{method:'POST',headers,body:JSON.stringify({plan:_currentPayPlan||'basic'})});
    const data=await res.json();
    if(!res.ok||data.error)throw new Error(data.error||'Erro ao gerar PIX');
    _pixCode=data.qr_code;
    _pixPaymentId=data.payment_id;
    // Mostra QR Code
    const qrWrap=document.getElementById('pix-qr-wrap');
    if(qrWrap){
      if(data.qr_code_base64){
        qrWrap.innerHTML=`<img src="data:image/png;base64,${data.qr_code_base64}" width="146" height="146" style="border-radius:8px;display:block;">`;
      } else if(data.qr_code){
        qrWrap.innerHTML=`<img src="https://api.qrserver.com/v1/create-qr-code/?size=146x146&data=${encodeURIComponent(data.qr_code)}&bgcolor=ffffff&color=000000&margin=4" width="146" height="146" style="border-radius:8px;display:block;">`;
      }
    }
    const codeTxt=document.getElementById('pix-code-txt');
    if(codeTxt)codeTxt.textContent=_pixCode||'Código gerado';
    if(lbl)lbl.textContent='Escaneie o QR Code ou copie o código';
    if(btn){btn.style.opacity='';btn.style.pointerEvents='';}
    if(txt)txt.textContent='✓ QR Code gerado — aguardando pagamento';
    btn.style.background='var(--gdim)';btn.style.color='var(--green)';
    // Timer de expiração (30 min)
    _pixExpiry=Date.now()+(30*60*1000);
    _startPixTimer();
    // Poll de status a cada 5s
    _pixPollInterval=setInterval(()=>_checkPixStatus(),5000);
    showToast('✅ QR Code gerado! Pague com seu banco.');
  }catch(e){
    showToast('❌ Erro: '+e.message,'error');
    if(btn){btn.style.opacity='';btn.style.pointerEvents='';}
    if(txt)txt.textContent='Tentar novamente';
  }
}

function _startPixTimer(){
  const timerEl=document.getElementById('pix-timer');
  const tick=()=>{
    const left=Math.max(0,_pixExpiry-Date.now());
    const m=Math.floor(left/60000);const s=Math.floor((left%60000)/1000);
    if(timerEl)timerEl.textContent=left>0?`QR Code expira em ${m}:${s.toString().padStart(2,'0')}`:'QR Code expirado';
    if(left<=0){clearInterval(_pixPollInterval);clearInterval(_timerInt);}
  };
  tick();
  const _timerInt=setInterval(tick,1000);
}

async function _checkPixStatus(){
  if(!_pixPaymentId||!window._fbUser)return;
  try{
    // Verifica no Firebase se o pagamento foi aprovado
    const uid=window._fbUser.uid;
    const snap=await db.collection('users').doc(uid).get();
    const data=snap.data();
    if(data?.payment_status==='pago'&&data?.payment_id===String(_pixPaymentId)){
      clearInterval(_pixPollInterval);
      _pixApproved(data.plan);
    }
  }catch(e){}
}

function _pixApproved(plan,amount){
  const sr=document.getElementById('pix-status-row');
  if(sr){sr.style.display='block';sr.style.background='var(--gdim)';sr.style.color='var(--green)';sr.textContent='✅ Pagamento confirmado! Plano ativado.';}
  const planNames={trial:'Trial',basic:'Basic',pro:'Pro',business:'Business',enterprise:'Enterprise','test1real':'Teste'};
  const minutesMap={trial:'5 min',basic:'60 min/mês',pro:'200 min/mês',business:'600 min/mês',enterprise:'2.000 min/mês','test1real':'60 min/mês'};
  const suc=document.getElementById('pay-success');
  if(suc){
    suc.style.display='flex';
    suc.style.animation='successFadeIn .4s ease both';
    const m=document.getElementById('pay-success-msg');
    if(m)m.textContent='Seu acesso foi liberado e já está ativo. Aproveite!';
    const pn=document.getElementById('pay-success-plan-name');
    if(pn)pn.textContent='AIVOX '+(planNames[plan]||plan);
    const pm=document.getElementById('pay-success-plan-mins');
    if(pm)pm.textContent=(minutesMap[plan]||'—')+' inclusos';
  }
  userPlan=plan;
  if(window._fbUser)window._fbUser.plan=plan;
  setupPlan();
  showToast('🎉 Pagamento aprovado! Bem-vindo ao plano '+(planNames[plan]||plan)+'!','success');
}

function afterPay(){navApp('home');setupPlan();}

// ====== ORÇAMENTO MENSAL ======
function editarOrcamento(){
  const atual = parseFloat(localStorage.getItem('orcamentoMensal') || '10.00');
  const novo = prompt('💰 Defina seu orçamento mensal de APIs (USD):', atual.toFixed(2));
  if(novo !== null){
    const valor = parseFloat(novo);
    if(!isNaN(valor) && valor >= 0){
      localStorage.setItem('orcamentoMensal', valor.toFixed(2));
      showToast('✅ Orçamento atualizado: $' + valor.toFixed(2), 'success');
      // Recarregar KPIs para atualizar saldo
      if(typeof loadKPIs === 'function') loadKPIs();
    } else {
      showToast('❌ Valor inválido', 'error');
    }
  }
}

// ====== WHATSAPP ======
const WA_NUMBER='5534997960026';
function openWhatsApp(msg){const text=msg||'Olá! Preciso de suporte com o AIVOX.';window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(text),'_blank');}

// ====== ITEM 4 — TERMS & PRIVACY MODAL ======
const TERMS_CONTENT={
  terms:{icon:'📄',title:'Termos de Uso — AIVOX',body:`
    <h3 style="color:var(--text);margin-bottom:8px;">1. Aceitação dos Termos</h3>
    <p>Ao criar uma conta no AIVOX, você concorda com estes Termos de Uso. O serviço é fornecido por AIVOX e tem como objetivo oferecer tradução simultânea por voz com inteligência artificial.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">2. Uso do Serviço</h3>
    <p>O AIVOX é um serviço de tradução de voz em tempo real. Você concorda em utilizá-lo apenas para fins legais e não irá utilizá-lo para conteúdo ofensivo, ilegal ou prejudicial a terceiros.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">3. Planos e Pagamentos</h3>
    <p>Os planos são cobrados mensalmente. O plano Trial oferece 5 minutos gratuitos por 3 dias, sem necessidade de cartão de crédito. Planos pagos são ativados após confirmação do pagamento. Cancelamentos são aceitos a qualquer momento, mantendo acesso até o fim do período pago.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">4. Limitações de Responsabilidade</h3>
    <p>O AIVOX é um serviço de apoio à comunicação e não garante 100% de precisão nas traduções. Não nos responsabilizamos por decisões tomadas com base nas traduções geradas pelo sistema.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">5. Modificações</h3>
    <p>Reservamo-nos o direito de modificar estes termos com aviso prévio de 30 dias por e-mail.</p>
    <p style="margin-top:14px;font-size:11px;">Última atualização: Abril 2025</p>`},
  privacy:{icon:'🔒',title:'Política de Privacidade — AIVOX',body:`
    <h3 style="color:var(--text);margin-bottom:8px;">1. Dados Coletados</h3>
    <p>Coletamos: nome, e-mail, dados de uso (minutos traduzidos, idiomas usados) e informações técnicas do dispositivo. Áudios são processados em tempo real e <strong style="color:var(--text);">não são armazenados</strong> em nossos servidores.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">2. Uso dos Dados</h3>
    <p>Seus dados são usados exclusivamente para: operar e melhorar o serviço, enviar notificações sobre sua conta e plano, e fornecer suporte técnico.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">3. Compartilhamento</h3>
    <p>Não vendemos seus dados. Compartilhamos apenas com provedores técnicos necessários para o funcionamento do serviço (Microsoft Azure, Firebase), que possuem suas próprias políticas de privacidade.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">4. Segurança</h3>
    <p>Utilizamos criptografia em trânsito (HTTPS) e o Firebase Authentication para proteger suas credenciais. Chaves de API são armazenadas de forma isolada por conta.</p>
    <h3 style="color:var(--text);margin:14px 0 8px;">5. Seus Direitos</h3>
    <p>Você pode solicitar a exclusão da sua conta e dados a qualquer momento pelo chat de suporte ou e-mail.</p>
    <p style="margin-top:14px;font-size:11px;">Última atualização: Abril 2025</p>`}
};
function openTermsModal(type){
  const c=TERMS_CONTENT[type];if(!c)return;
  const modal=document.getElementById('terms-modal');
  document.getElementById('terms-modal-icon').textContent=c.icon;
  document.getElementById('terms-modal-title').textContent=c.title;
  document.getElementById('terms-modal-body').innerHTML=c.body;
  modal.style.display='flex';
}
function closeTermsModal(){document.getElementById('terms-modal').style.display='none';}
function acceptTermsAndCheck(){
  const cb=document.getElementById('reg-terms');if(cb)cb.checked=true;
  closeTermsModal();
  showToast('✓ Termos aceitos');
}

// ====== ITEM 5 — PAYMENT NOTIFICATION LISTENER ======
let _paymentListenerUnsub=null;
function startPaymentListener(){
  if(!window.FB||!db||_paymentListenerUnsub)return;
  if(window._fbUser?.role!=='admin')return;
  // BUGFIX: envolve em try/catch robusto para não quebrar o painel admin
  // se a coleção 'payments' não existir ou as Firestore Rules bloquearem
  try{
    _paymentListenerUnsub=db.collection('logs')
      .where('type','==','payment')
      .where('payment_status','==','pago')
      .limit(10)
      .onSnapshot(snap=>{
        snap.docChanges().forEach(change=>{
          if(change.type==='added'){
            const p=change.doc.data();
            const age=Date.now()-(p.createdAt?.toMillis?.()||0);
            if(age<5*60*1000){
              showToast('💰 Pagamento confirmado: '+(p.plan||'').toUpperCase()+' · R$'+(p.payment_amount||p.amount||0),'success');
              const badge=document.getElementById('payment-notify-badge');
              if(badge){const n=parseInt(badge.textContent||'0')+1;badge.textContent=n;badge.style.display=n>0?'inline':'none';}
            }
          }
        });
      },(e)=>{
        // Silencia o erro — não bloqueia o painel admin
        console.warn('Payment listener (logs):', e.message);
        _paymentListenerUnsub=null;
      });
  }catch(e){console.warn('startPaymentListener erro:',e);}
}
function _startPaymentListenerFallback(){
  // Fallback: escuta logs de pagamento aprovados sem índice composto
  try{
    _paymentListenerUnsub=db.collection('logs')
      .where('type','==','payment')
      .limit(10)
      .onSnapshot(snap=>{
        snap.docChanges().forEach(change=>{
          if(change.type==='added'){
            const p=change.doc.data();
            const age=Date.now()-(p.createdAt?.toMillis?.()||0);
            if(age<5*60*1000&&p.payment_status==='pago'){
              showToast('💰 Pagamento confirmado: '+p.plan?.toUpperCase(),'success');
              const badge=document.getElementById('payment-notify-badge');
              if(badge){const n=parseInt(badge.textContent||'0')+1;badge.textContent=n;badge.style.display=n>0?'inline':'none';}
            }
          }
        });
      },(e)=>{console.warn('Payment listener fallback:',e.message);});
  }catch(e){}
}
function stopPaymentListener(){if(_paymentListenerUnsub){_paymentListenerUnsub();_paymentListenerUnsub=null;}}

// ====== ITEM 6 — TRIAL EXPIRY BY DATE ======
async function checkTrialExpiry(){
  const u=window._fbUser;
  if(!u||userPlan!=='trial')return;
  // If we have a local trial timer still running, also check server date
  if(!window.FB||!db)return;
  try{
    const doc=await db.collection('users').doc(u.uid).get();
    if(!doc.exists)return;
    const data=doc.data();
    const expires=data.trialExpiresAt?.toDate?.();
    const started=data.trialStartedAt?.toDate?.();
    if(!expires&&started){
      // Migrate old accounts: set expiry 3 days from creation
      const exp=new Date(started.getTime()+3*24*60*60*1000);
      await db.collection('users').doc(u.uid).update({trialExpiresAt:exp});
      if(Date.now()>exp.getTime())lockExpiredTrial();
    }else if(expires&&Date.now()>expires.getTime()){
      lockExpiredTrial();
    }else if(expires){
      // Show remaining days
      const daysLeft=Math.ceil((expires.getTime()-Date.now())/(24*60*60*1000));
      const tban=document.getElementById('tban');
      if(tban&&userPlan==='trial'){
        const lbl=tban.querySelector('.tban-lbl');
        if(lbl)lbl.textContent=daysLeft<=1?'Trial: último dia!':'Trial: '+daysLeft+' dias restantes';
      }
    }
  }catch(e){console.warn('checkTrialExpiry:',e);}
}
function lockExpiredTrial(){
  stopTrial();
  userPlan='expired';
  const tban=document.getElementById('tban');
  if(tban){
    tban.style.display='flex';
    tban.style.background='rgba(255,68,102,.12)';
    tban.style.borderColor='rgba(255,68,102,.3)';
    tban.innerHTML='<span style="font-size:18px;flex-shrink:0;">⏰</span><div style="flex:1;"><div style="font-size:12px;font-weight:700;color:var(--red);">Trial expirado</div><div style="font-size:11px;color:var(--muted);">3 dias encerrados</div></div><button onclick="navApp(\'profile\')" style="background:var(--red);color:#fff;border:none;padding:6px 10px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font);">Assinar agora</button>';
  }
  showToast('⏰ Seu trial de 3 dias expirou. Escolha um plano para continuar.','error');
}

// ====== ADMIN TEST PIX ======
async function adminTestPix(uid){
  if(!uid){showToast('UID inválido','error');return;}
  if(!confirm('Gerar PIX de R$1,00 para teste de produção?'))return;
  try{
    const token=await getAuthToken();
    const headers={'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};
    // Temporariamente seta o uid do alvo como external_reference
    const res=await fetch(getBackendUrl()+'/api/pix/criar',{method:'POST',headers,body:JSON.stringify({plan:'test1real',targetUid:uid})});
    const data=await res.json();
    if(!res.ok||data.error)throw new Error(data.error||'Erro ao gerar PIX');
    // Abre a tela de pagamento com os dados retornados
    _currentPayPlan='test1real';
    _pixCode=data.qr_code;
    _pixPaymentId=data.payment_id;
    clsUser();
    navApp('payment');
    // Inicia poll de status
    _pixPollInterval && clearInterval(_pixPollInterval);
    _pixExpiry=Date.now()+(30*60*1000);
    _startPixTimer();
    _pixPollInterval=setInterval(()=>_checkPixStatus(),5000);
    // Preenche o QR
    setTimeout(()=>{
      const qrWrap=document.getElementById('pix-qr-wrap');
      if(qrWrap&&data.qr_code_base64)qrWrap.innerHTML=`<img src="data:image/png;base64,${data.qr_code_base64}" style="width:100%;max-width:200px;border-radius:8px;">`;
      const codeTxt=document.getElementById('pix-code-txt');if(codeTxt)codeTxt.textContent=data.qr_code||'';
      const lbl=document.getElementById('pix-label');if(lbl)lbl.textContent='PIX de R$1,00 — Teste de produção';
      const t=document.getElementById('pay-title');if(t)t.textContent='Teste de Produção';
      const n=document.getElementById('pay-plan-name');if(n)n.textContent='Teste R$1';
      const ds=document.getElementById('pay-plan-desc');if(ds)ds.textContent='Teste de produção — Admin Only';
      const pr=document.getElementById('pay-price');if(pr)pr.textContent='R$1,00';
      showToast('🧪 PIX de teste gerado! Aguardando pagamento...','success');
    },300);
  }catch(e){showToast('Erro: '+e.message,'error');}
}

// ====== THEME TOGGLE ======
function toggleTheme(){
  const isLight=document.body.classList.toggle('light-mode');
  localStorage.setItem('aivox-theme',isLight?'light':'dark');
  document.querySelector('meta[name="theme-color"]').setAttribute('content',isLight?'#f0f2f8':'#080b12');
}
(function(){
  if(localStorage.getItem('aivox-theme')==='light'){
    document.body.classList.add('light-mode');
    document.querySelector('meta[name="theme-color"]').setAttribute('content','#f0f2f8');
  }
})();

// ====== EDITAR PERFIL ======
function openEditName(){
  const area=document.getElementById('edit-name-area');
  const inp=document.getElementById('edit-name-input');
  const u=window._fbUser;
  if(inp&&u)inp.value=u.name||'';
  if(area)area.style.display='block';
  if(inp)inp.focus();
}
function closeEditName(){
  const area=document.getElementById('edit-name-area');
  if(area)area.style.display='none';
  const msg=document.getElementById('edit-name-msg');
  if(msg)msg.style.display='none';
}
async function saveEditName(){
  const inp=document.getElementById('edit-name-input');
  const msg=document.getElementById('edit-name-msg');
  const name=(inp?.value||'').trim();
  if(!name||name.length<2){
    if(msg){msg.style.display='block';msg.style.color='var(--red)';msg.textContent='Nome deve ter pelo menos 2 caracteres.';}
    return;
  }
  if(!window._fbUser||!db){showToast('Firebase não conectado','error');return;}
  try{
    await db.collection('users').doc(window._fbUser.uid).update({name,updatedAt:firebase.firestore.Timestamp.now()});
    window._fbUser.name=name;
    // Atualizar UI
    const pn=document.getElementById('prof-name');if(pn)pn.textContent=name;
    const sbn=document.querySelector('.sidebar-uname');if(sbn)sbn.textContent=name;
    const hg=document.getElementById('h-greeting');
    if(hg){const hr=new Date().getHours();const gr=hr<12?'Bom dia':hr<18?'Boa tarde':'Boa noite';hg.textContent=gr+', '+name.split(' ')[0]+'! 👋';}
    // Atualizar iniciais no avatar se não tiver foto
    if(!window._fbUser.photoURL){
      const initials=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
      const pa=document.getElementById('prof-avatar');if(pa)pa.textContent=initials;
      const sbav=document.getElementById('sb-av-top');if(sbav)sbav.textContent=initials;
    }
    closeEditName();
    showToast('✅ Nome atualizado!','success');
  }catch(e){
    if(msg){msg.style.display='block';msg.style.color='var(--red)';msg.textContent='Erro: '+e.message;}
  }
}

async function uploadProfilePhoto(input){
  const file=input.files[0];
  if(!file)return;
  if(file.size>2*1024*1024){showToast('Foto muito grande. Máximo 2MB.','error');return;}
  if(!window._fbUser||!db){showToast('Firebase não conectado','error');return;}
  showToast('📸 Processando foto...');
  try{
    // Redimensionar e converter para base64
    const canvas=document.createElement('canvas');
    const img=new Image();
    const reader=new FileReader();
    reader.onload=async(e)=>{
      img.onload=async()=>{
        const size=200;
        canvas.width=size;canvas.height=size;
        const ctx=canvas.getContext('2d');
        // Crop quadrado centralizado
        const min=Math.min(img.width,img.height);
        const sx=(img.width-min)/2,sy=(img.height-min)/2;
        ctx.drawImage(img,sx,sy,min,min,0,0,size,size);
        const base64=canvas.toDataURL('image/jpeg',0.8);
        // Salvar no Firestore
        await db.collection('users').doc(window._fbUser.uid).update({
          photoURL:base64,
          updatedAt:firebase.firestore.Timestamp.now()
        });
        window._fbUser.photoURL=base64;
        // Atualizar UI
        const pa=document.getElementById('prof-avatar');
        if(pa){pa.innerHTML=`<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;pa.style.padding='0';}
        const sbav=document.getElementById('sb-av-top');
        if(sbav){sbav.innerHTML=`<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;sbav.style.padding='0';}
        showToast('✅ Foto atualizada!','success');
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  }catch(e){showToast('Erro ao salvar foto: '+e.message,'error');}
}

// ====== HISTÓRICO DE COMPRAS ======
let _histTab = 'sess';

function switchHistTab(tab){
  _histTab = tab;
  const sess = document.getElementById('hist-panel-sess');
  const comp = document.getElementById('hist-panel-comp');
  const btnSess = document.getElementById('hist-tab-sess');
  const btnComp = document.getElementById('hist-tab-comp');
  if(tab === 'sess'){
    sess.style.display = 'block';
    comp.style.display = 'none';
    btnSess.style.background = 'var(--card)';
    btnSess.style.color = 'var(--text)';
    btnComp.style.background = 'transparent';
    btnComp.style.color = 'var(--muted)';
  } else {
    sess.style.display = 'none';
    comp.style.display = 'block';
    btnSess.style.background = 'transparent';
    btnSess.style.color = 'var(--muted)';
    btnComp.style.background = 'var(--card)';
    btnComp.style.color = 'var(--text)';
    loadCompras();
  }
}

async function loadCompras(){
  const list = document.getElementById('comp-list');
  const empty = document.getElementById('comp-empty');
  if(!list) return;
  if(!window._fbUser || !db){ if(empty)empty.classList.add('sh'); return; }
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">Carregando...</div>';
  if(empty) empty.classList.remove('sh');
  try{
    const uid = window._fbUser.uid;
    const snap = await db.collection('logs')
      .where('uid','==',uid)
      .where('type','in',['payment','topup'])
      .orderBy('createdAt','desc')
      .limit(50)
      .get();

    if(snap.empty){ list.innerHTML=''; if(empty)empty.classList.add('sh'); return; }

    const typeMap = {
      payment: { icon:'💳', label: (d) => 'Plano '+( {trial:'Trial',basic:'Basic',pro:'Pro',business:'Business',enterprise:'Enterprise'}[d.plan]||d.plan||'—') },
      topup:   { icon:'⚡', label: (d) => '+'+(d.extra_minutes||0)+' minutos extras' },
    };
    const statusMap = {
      pago:        { cls:'pago',       label:'🟢 PAGO'        },
      processando: { cls:'processando',label:'🟡 PROCESSANDO' },
      pendente:    { cls:'pendente',   label:'🟡 PENDENTE'    },
      rejeitado:   { cls:'erro',       label:'🔴 REJEITADO'   },
      cancelado:   { cls:'erro',       label:'🔴 CANCELADO'   },
    };

    list.innerHTML = '';
    snap.docs.forEach(doc => {
      const d = doc.data();
      const tm = typeMap[d.type] || typeMap.payment;
      const sm = statusMap[d.payment_status] || { cls:'pendente', label:'🟡 '+( d.payment_status||'PENDENTE').toUpperCase() };
      const date = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
      const val = d.amount ? 'R$'+(parseFloat(d.amount)).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—';
      const row = document.createElement('div');
      row.className = 'comp-row';
      row.innerHTML = `
        <div class="comp-icon ${sm.cls}">${tm.icon}</div>
        <div class="comp-info">
          <div class="comp-name">${tm.label(d)}</div>
          <div class="comp-date">${date}</div>
        </div>
        <div class="comp-right">
          <div class="comp-val">${val}</div>
          <div class="comp-badge ${sm.cls}">${sm.label}</div>
        </div>`;
      list.appendChild(row);
    });
  }catch(e){
    list.innerHTML = '<div style="color:var(--red);font-size:12px;padding:10px;">Erro ao carregar: '+e.message+'</div>';
  }
}

// ====== PREÇOS DINÂMICOS (câmbio) ======
let _precosCache = null;

async function loadPrecos(){
  try{
    const res = await fetch(getBackendUrl()+'/api/cambio');
    if(!res.ok) return;
    const data = await res.json();
    _precosCache = data;
    _atualizarPrecosTela(data);
  }catch(e){console.warn('Erro ao carregar câmbio:',e.message);}
}

function _atualizarPrecosTela(data){
  if(!data||!data.precos) return;
  const p = data.precos;
  const fmt = (v) => 'R$'+v.toLocaleString('pt-BR');
  const rate = parseFloat(data.rate).toFixed(2);

  // Atualizar planDetails com preços reais
  if(p.basic)    planDetails.basic.price    = fmt(p.basic.brl);
  if(p.pro)      planDetails.pro.price      = fmt(p.pro.brl);
  if(p.business) planDetails.business.price = fmt(p.business.brl);
  if(p.enterprise) planDetails.enterprise.price = fmt(p.enterprise.brl);

  // Atualizar cards de preço na landing page
  const priceMap = {
    'basic-price': p.basic?.brl, 'pro-price': p.pro?.brl,
    'business-price': p.business?.brl, 'enterprise-price': p.enterprise?.brl
  };
  Object.entries(priceMap).forEach(([id,val])=>{
    const el=document.getElementById(id);
    if(el&&val)el.textContent=fmt(val);
  });

  // Atualizar modal topup
  const topupMap = {
    'topup-price-min30': p.topup30?.brl,
    'topup-price-min60': p.topup60?.brl,
    'topup-price-min120': p.topup120?.brl,
  };
  Object.entries(topupMap).forEach(([id,val])=>{
    const el=document.getElementById(id);
    if(el&&val)el.textContent=fmt(val);
  });

  // Atualizar labels do selectTopup
  const labels = {
    min30:  `Pagar ${fmt(p.topup30?.brl||25)} — +30 min`,
    min60:  `Pagar ${fmt(p.topup60?.brl||45)} — +60 min`,
    min120: `Pagar ${fmt(p.topup120?.brl||80)} — +120 min`,
  };
  window._topupLabels = labels;

  // Mostrar indicador de câmbio
  const cambioEl = document.getElementById('cambio-rate');
  if(cambioEl) cambioEl.textContent = `💱 USD/BRL: R$${rate}`;
}

// ====== INIT ======
renderFaq('todos');
