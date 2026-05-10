// ════════════════════════════════════════════════════════════════
//  VOICE CLONE — Roteiro de frases sugeridas
// ════════════════════════════════════════════════════════════════
const VC_PHRASES = [
  "Olá! Meu nome é Fabio e estou gravando minha voz para o sistema AIVOX. Este sistema vai me permitir falar em qualquer idioma usando a minha própria voz natural.",
  "O tempo está ótimo hoje. Gosto muito de sair para caminhar pela manhã, tomar um café e planejar o meu dia com calma antes de começar o trabalho.",
  "A tecnologia de inteligência artificial está mudando a forma como nos comunicamos. Hoje já é possível traduzir conversas em tempo real com latência de menos de trezentos milissegundos.",
  "Vou contar uma história rápida. Certa vez viajei para o Japão sem falar uma palavra de japonês. Foi uma experiência incrível mas muito desafiadora na hora de me comunicar com as pessoas.",
  "Trabalho na área de agronegócio e todos os dias preciso me comunicar com parceiros internacionais. Com o AIVOX, as barreiras do idioma deixam de ser um obstáculo nos nossos negócios.",
  "Quero aproveitar para testar diferentes entonações. Às vezes falo mais devagar... e às vezes falo um pouco mais rápido quando estou animado com alguma novidade importante.",
  "Os números também são importantes para uma boa clonagem. Um, dois, três, quatro, cinco, seis, sete, oito, nove, dez. Cem reais, duzentos e cinquenta, mil e quinhentos.",
  "Para finalizar, vou dizer que estou muito feliz com o resultado até agora. Espero que esta gravação seja suficiente para criar um clone de voz natural e expressivo. Muito obrigado!"
];

let _vcPhraseIdx = 0;

function vcInitPhrases() {
  _vcPhraseIdx = 0;
  // Cria dots
  const dots = document.getElementById('vc-phrase-dots');
  if (dots) {
    dots.innerHTML = VC_PHRASES.map((_, i) =>
      `<div class="vc-script-dot${i===0?' active':''}" id="vcdot${i}"></div>`
    ).join('');
  }
  vcShowPhrase(0);
}

function vcShowPhrase(idx) {
  _vcPhraseIdx = Math.max(0, Math.min(idx, VC_PHRASES.length - 1));
  const text = document.getElementById('vc-phrase-text');
  const counter = document.getElementById('vc-phrase-counter');
  if (text) text.textContent = VC_PHRASES[_vcPhraseIdx];
  if (counter) counter.textContent = (_vcPhraseIdx + 1) + ' / ' + VC_PHRASES.length;
  // Update dots
  VC_PHRASES.forEach((_, i) => {
    const dot = document.getElementById('vcdot' + i);
    if (dot) dot.className = 'vc-script-dot' + (i === _vcPhraseIdx ? ' active' : '');
  });
}

function vcNextPhrase() {
  vcShowPhrase(_vcPhraseIdx + 1 < VC_PHRASES.length ? _vcPhraseIdx + 1 : 0);
}

function vcPrevPhrase() {
  vcShowPhrase(_vcPhraseIdx - 1 >= 0 ? _vcPhraseIdx - 1 : VC_PHRASES.length - 1);
}

// Auto-avança a frase a cada 15s durante a gravação
let _vcPhraseAutoTimer = null;
function vcStartPhraseAuto() {
  vcShowPhrase(0);
  _vcPhraseAutoTimer = setInterval(() => {
    if (_vcPhraseIdx + 1 < VC_PHRASES.length) vcNextPhrase();
  }, 13000);
}
function vcStopPhraseAuto() {
  clearInterval(_vcPhraseAutoTimer);
  _vcPhraseAutoTimer = null;
}

// ════════════════════════════════════════════════════════════════
//  VOICE CLONING — Azure Personal Voice (migrado de ElevenLabs)
// ════════════════════════════════════════════════════════════════
let _vcRecording=false, _vcStream=null, _vcRecorder=null, _vcChunks=[], _vcTimer=null, _vcSec=0, _vcWavAnim=null;
const VC_MIN_SECS=15, VC_MAX_SECS=90;
const VOICE_PLANS=['pro','business','enterprise'];

function _vcHasVoice(){return !!(window._fbUser?.azure_speaker_id || window._fbUser?.voice_id);}
function _vcCanUse(){return VOICE_PLANS.includes(window._fbUser?.plan||'trial');}

async function renderVoiceSection(){
  const u=window._fbUser;
  if(!u)return;
  vcInitPhrases();
  const locked=document.getElementById('vc-locked-msg');
  const iface=document.getElementById('vc-interface');
  if(!_vcCanUse()){
    if(locked)locked.style.display='block';
    if(iface)iface.style.display='none';
    return;
  }
  if(locked)locked.style.display='none';
  if(iface)iface.style.display='block';
  _vcUpdateStatus();
}

function _vcUpdateStatus(){
  const u=window._fbUser;
  const dot=document.getElementById('vc-dot');
  const lbl=document.getElementById('vc-status-label');
  const sub=document.getElementById('vc-status-sub');
  const badge=document.getElementById('vc-status-badge');
  const prevRow=document.getElementById('vc-preview-row');
  const delRow=document.getElementById('vc-delete-row');
  if(!dot)return;

  const recorderDiv  = document.getElementById('vc-recorder');
  const regravar     = document.getElementById('vc-regravar-row');

  if(u?.azure_speaker_id || u?.voice_id){
    dot.className='vc-status-dot ready';
    lbl.textContent='Voz clonada ativa ✓';
    const displayId = u?.azure_speaker_id || u?.voice_id || '';
    sub.textContent='Azure Personal Voice · ID: '+displayId.substring(0,16)+'…';
    badge.className='vc-status-badge ready';
    badge.textContent='Ativa';
    if(prevRow)prevRow.style.display='block';
    if(delRow)delRow.style.display='block';
    // Colapsa gravador e mostra botão "Gravar nova voz"
    if(recorderDiv) recorderDiv.style.display='none';
    if(regravar)    regravar.style.display='block';
  } else {
    dot.className='vc-status-dot none';
    lbl.textContent='Voz não configurada';
    sub.textContent='Grave uma amostra para ativar a clonagem';
    badge.className='vc-status-badge none';
    badge.textContent='Inativa';
    if(prevRow)prevRow.style.display='none';
    if(delRow)delRow.style.display='none';
    // Mostra gravador normalmente quando não tem voz
    if(recorderDiv) recorderDiv.style.display='block';
    if(regravar)    regravar.style.display='none';
  }
}

function vcToggleRecorder(){
  const rec = document.getElementById('vc-recorder');
  const btn = document.getElementById('vc-regravar-btn');
  if(!rec) return;
  const isOpen = rec.style.display !== 'none';
  rec.style.display = isOpen ? 'none' : 'block';
  if(btn) btn.textContent = isOpen ? '🎙️ Gravar nova voz' : '✕ Cancelar gravação';
}

function toggleVoiceRecord(){
  if(_vcRecording)stopVoiceRecord();
  else startVoiceRecord();
}

async function startVoiceRecord(){
  try{
    _vcStream=await navigator.mediaDevices.getUserMedia({audio:{sampleRate:44100,channelCount:1,echoCancellation:false,noiseSuppression:false}});
  }catch(e){
    _vcShowFeedback('❌ Permissão de microfone negada.','error');
    return;
  }
  _vcRecording=true;
  _vcChunks=[];
  _vcSec=0;

  const mime=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
  try{_vcRecorder=new MediaRecorder(_vcStream,{mimeType:mime});}
  catch(e){_vcRecorder=new MediaRecorder(_vcStream);}
  _vcRecorder.ondataavailable=e=>{if(e.data?.size>0)_vcChunks.push(e.data);};
  _vcRecorder.start(100);

  // UI
  vcStartPhraseAuto();
  const btn=document.getElementById('vc-rec-btn');
  if(btn){btn.className='vc-rec-btn recording';btn.textContent='⏹';}
  const hint=document.getElementById('vc-hint');
  if(hint)hint.innerHTML='<strong style="color:var(--red);">Gravando...</strong> Fale em voz alta e clara.<br>Mínimo '+VC_MIN_SECS+'s — máximo '+VC_MAX_SECS+'s.';

  // Timer
  _vcTimer=setInterval(()=>{
    _vcSec++;
    const m=Math.floor(_vcSec/60),s=_vcSec%60;
    const el=document.getElementById('vc-timer');
    if(el){
      el.textContent=m.toString().padStart(2,'0')+':'+s.toString().padStart(2,'0');
      el.style.color=_vcSec<VC_MIN_SECS?'var(--orange)':_vcSec>=VC_MAX_SECS?'var(--green)':'var(--accent)';
    }
    if(_vcSec>=VC_MAX_SECS)stopVoiceRecord();
  },1000);

  // Waveform animation
  _vcWavAnim=setInterval(()=>{
    for(let i=0;i<12;i++){
      const b=document.getElementById('vcb'+i);
      if(b)b.style.height=(Math.random()*22+4)+'px';
    }
  },80);

  document.getElementById('vc-feedback').style.display='none';
}

async function stopVoiceRecord(){
  if(!_vcRecording)return;
  _vcRecording=false;
  clearInterval(_vcTimer);_vcTimer=null;
  clearInterval(_vcWavAnim);_vcWavAnim=null;
  vcStopPhraseAuto();

  // Reset waveform
  for(let i=0;i<12;i++){const b=document.getElementById('vcb'+i);if(b)b.style.height='4px';}

  const btn=document.getElementById('vc-rec-btn');
  if(btn){btn.className='vc-rec-btn uploading';btn.textContent='⏳';}

  if(_vcRecorder?.state==='recording'){
    _vcRecorder.onstop=async()=>await _vcProcessAudio();
    _vcRecorder.stop();
  }
  try{_vcStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  _vcStream=null;
}

async function _vcProcessAudio(){
  if(_vcSec<VC_MIN_SECS){
    _vcShowFeedback('❌ Gravação muito curta. Mínimo '+VC_MIN_SECS+' segundos.','error');
    _vcResetBtn();
    return;
  }

  const blob=new Blob(_vcChunks,{type:'audio/webm'});
  _vcChunks=[];

  const dot=document.getElementById('vc-dot');
  const lbl=document.getElementById('vc-status-label');
  const badge=document.getElementById('vc-status-badge');
  if(dot){dot.className='vc-status-dot processing';}
  if(lbl)lbl.textContent='Clonando sua voz...';
  if(badge){badge.className='vc-status-badge processing';badge.textContent='Processando';}
  _vcShowFeedback('⏳ Clonando sua voz... isso leva ~30 segundos.','info');

  try{
    const backendUrl=getBackendUrl();

    const token=await getAuthToken();
    const fd=new FormData();
    fd.append('audio',blob,'voice_sample.webm');
    fd.append('name',(window._fbUser?.name||'User')+' Voice');
    fd.append('description','Voz clonada AIVOX - '+(window._fbUser?.email||''));

    // ── Azure Personal Voice ────────────────────────────────
    fd.append('provider', 'azure'); // sinaliza ao backend usar Azure
    const r=await fetch(backendUrl+'/api/voice/clone-azure',{
      method:'POST',
      headers:token?{Authorization:'Bearer '+token}:{},
      body:fd
    }).catch(async () => {
      // Fallback para rota antiga se clone-azure não existir no backend ainda
      return fetch(backendUrl+'/api/voice/clone',{method:'POST',headers:token?{Authorization:'Bearer '+token}:{},body:fd});
    });

    const data=await r.json();
    if(!r.ok||data.error)throw new Error(data.error||'Erro ao clonar');

    // Salva azure_speaker_id (Personal Voice) + fallback voice_id (ElevenLabs)
    const uid=window._fbUser?.uid;
    const speakerId = data.azure_speaker_id || data.speaker_profile_id || data.voice_id;
    if(uid&&db){
      await db.collection('users').doc(uid).update({
        azure_speaker_id: speakerId,
        voice_name: data.name || (window._fbUser?.name+' Voice'),
        voice_provider: data.provider || 'azure',
        voice_created_at: firebase.firestore.FieldValue.serverTimestamp(),
        // mantém voice_id para retrocompatibilidade
        ...(data.voice_id ? {voice_id: data.voice_id} : {})
      });
    }
    window._fbUser.azure_speaker_id = speakerId;
    window._fbUser.voice_name = data.name;
    window._fbUser.voice_provider = data.provider || 'azure';
    if(data.voice_id) window._fbUser.voice_id = data.voice_id;

    _vcUpdateStatus();
    _vcShowFeedback('✅ Voz clonada com sucesso via Azure Personal Voice! Suas traduções agora usarão sua voz.','success');
    showToast('🎙️ Voz clonada ativada (Azure)!','success');

  }catch(e){
    _vcShowFeedback('❌ Erro: '+e.message,'error');
    _vcUpdateStatus();
  }
  _vcResetBtn();
}

async function handleVoiceFileUpload(input){
  const file=input?.files?.[0];
  if(!file)return;

  const maxSize=25*1024*1024; // 25MB
  if(file.size>maxSize){_vcShowFeedback('❌ Arquivo muito grande. Máximo 25MB.','error');return;}

  const allowed=['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/m4a','audio/x-m4a','audio/mp4','audio/webm','audio/ogg'];
  if(!allowed.includes(file.type)&&!file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac)$/i)){
    _vcShowFeedback('❌ Formato não suportado. Use mp3, wav, m4a ou webm.','error');
    return;
  }

  const dot=document.getElementById('vc-dot');
  const lbl=document.getElementById('vc-status-label');
  const badge=document.getElementById('vc-status-badge');
  if(dot)dot.className='vc-status-dot processing';
  if(lbl)lbl.textContent='Clonando sua voz...';
  if(badge){badge.className='vc-status-badge processing';badge.textContent='Processando';}
  _vcShowFeedback('⏳ Enviando arquivo para clonagem...','info');

  try{
    const backendUrl=getBackendUrl();

    const token=await getAuthToken();
    const fd=new FormData();
    fd.append('audio',file,file.name);
    fd.append('name',(window._fbUser?.name||'User')+' Voice');
    fd.append('description','Voz clonada AIVOX - '+(window._fbUser?.email||''));

    fd.append('provider', 'azure');
    const backendUrl2 = getBackendUrl();
    const r=await fetch(backendUrl2+'/api/voice/clone-azure',{
      method:'POST',
      headers:token?{Authorization:'Bearer '+token}:{},
      body:fd
    }).catch(async () => {
      return fetch(backendUrl2+'/api/voice/clone',{method:'POST',headers:token?{Authorization:'Bearer '+token}:{},body:fd});
    });
    const data=await r.json();
    if(!r.ok||data.error)throw new Error(data.error||'Erro ao clonar');

    const uid=window._fbUser?.uid;
    const speakerId2 = data.azure_speaker_id || data.speaker_profile_id || data.voice_id;
    if(uid&&db){
      await db.collection('users').doc(uid).update({
        azure_speaker_id: speakerId2,
        voice_name: data.name || (window._fbUser?.name+' Voice'),
        voice_provider: data.provider || 'azure',
        voice_created_at: firebase.firestore.FieldValue.serverTimestamp(),
        ...(data.voice_id ? {voice_id: data.voice_id} : {})
      });
    }
    window._fbUser.azure_speaker_id = speakerId2;
    window._fbUser.voice_name = data.name;
    window._fbUser.voice_provider = data.provider || 'azure';
    if(data.voice_id) window._fbUser.voice_id = data.voice_id;

    _vcUpdateStatus();
    _vcShowFeedback('✅ Voz clonada com sucesso via Azure Personal Voice!','success');
    showToast('🎙️ Voz clonada ativada (Azure)!','success');

  }catch(e){
    _vcShowFeedback('❌ Erro: '+e.message,'error');
    _vcUpdateStatus();
  }
  input.value='';
}

async function previewClonedVoice(){
  const btn=document.getElementById('vc-preview-btn');
  if(btn){btn.textContent='⏳ Gerando...';btn.style.pointerEvents='none';}
  try{
    await _speakTranslation('Olá! Esta é uma prévia da sua voz clonada. Como está soando?');
    showToast('🔊 Reproduzindo sua voz clonada','success');
  }catch(e){
    _vcShowFeedback('❌ Erro ao reproduzir: '+e.message,'error');
  }
  if(btn){btn.textContent='🔊 Ouvir minha voz clonada';btn.style.pointerEvents='';}
}

async function deleteClonedVoice(){
  if(!confirm('Remover sua voz clonada? Você precisará gravar uma nova amostra.'))return;
  const backendUrl=getBackendUrl();
  try{
    const speakerIdDel = window._fbUser?.azure_speaker_id || window._fbUser?.voice_id;
    if(backendUrl && speakerIdDel){
      const token=await getAuthToken();
      // Tenta rota Azure primeiro, fallback para rota antiga
      await fetch(backendUrl+'/api/voice/delete-azure',{
        method:'DELETE',
        headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
        body:JSON.stringify({azure_speaker_id: speakerIdDel})
      }).catch(() =>
        fetch(backendUrl+'/api/voice/delete',{
          method:'DELETE',
          headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
          body:JSON.stringify({voice_id: speakerIdDel})
        })
      );
    }
    const uid=window._fbUser?.uid;
    if(uid&&db){
      await db.collection('users').doc(uid).update({
        azure_speaker_id: firebase.firestore.FieldValue.delete(),
        voice_id: firebase.firestore.FieldValue.delete(),
        voice_name: firebase.firestore.FieldValue.delete(),
        voice_provider: firebase.firestore.FieldValue.delete(),
      });
    }
    window._fbUser.azure_speaker_id = null;
    window._fbUser.voice_id = null;
    window._fbUser.voice_name = null;
    _vcUpdateStatus();
    _vcShowFeedback('🗑️ Voz clonada removida.','info');
    showToast('Voz clonada removida','info');
  }catch(e){
    _vcShowFeedback('❌ Erro ao remover: '+e.message,'error');
  }
}

function _vcResetBtn(){
  const btn=document.getElementById('vc-rec-btn');
  if(btn){btn.className='vc-rec-btn idle';btn.textContent='🎙️';}
  const hint=document.getElementById('vc-hint');
  if(hint)hint.innerHTML='Grave <strong>30 a 90 segundos</strong> lendo em voz alta e natural.<br>Quanto mais clara a gravação, melhor o clone.';
  const timer=document.getElementById('vc-timer');
  if(timer){timer.textContent='00:00';timer.style.color='var(--accent)';}
  _vcSec=0;
}

function _vcShowFeedback(msg,type){
  const el=document.getElementById('vc-feedback');
  if(!el)return;
  const colors={success:'background:var(--gdim);color:var(--green);border:1px solid rgba(0,255,136,.2)',
                error:'background:var(--rdim);color:var(--red);border:1px solid rgba(255,68,102,.2)',
                info:'background:var(--adim);color:var(--accent);border:1px solid rgba(0,229,255,.2)'};
  el.style.cssText='display:block;font-size:12px;border-radius:9px;padding:10px 13px;'+colors[type];
  el.textContent=msg;
}



// ════════════════════════════════════════════════════════════════
//  SALAS COLABORATIVAS
// ════════════════════════════════════════════════════════════════
const SALA_PLANS = ['pro','business','enterprise'];
let _salaCode        = null;   // código da sala atual
let _salaSocket      = null;   // instância Socket.io
let _salaIsCreator   = false;  // true se foi quem criou
let _salaMyLang      = 'PT-BR';
let _salaTheirLang   = 'EN-US';
let _salaMyLangPicked = null; // idioma escolhido no picker — sobrevive a reconexões
let _salaTheirName   = '';
let _salaConnected   = false;
let _salaRecording   = false;
let _salaStream      = null;
let _salaRecorder    = null;
let _salaChunks      = [];
let _salaWavAnim     = null;
let _salaWc          = 0;
let _salaRecSec      = 0;
let _salaRecTimer    = null;

// ── WebRTC (vídeo P2P) ──────────────────────────────────────────
let _salaPC          = null;   // RTCPeerConnection
let _salaLocalStream = null;   // MediaStream local (câmera + mic)
let _salaRemoteStream= null;   // MediaStream do outro participante
let _salaVideoAtivo  = false;  // câmera ligada (track enabled)
let _salaAudioMuted  = false;  // mic do WebRTC mutado
let _salaIsInitiator = false;  // true para quem cria a offer
let _salaPendingIce  = [];     // ICE candidates recebidos antes da remote description
let _salaVideoMode   = false;  // está no modo vídeo chamada?

// Servidores STUN públicos (custo zero — sem TURN, P2P direto)
const SALA_RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ],
};

// ── Inicializa página sala ──────────────────────────────────────
function initSalaPage(){
  const u = window._fbUser;
  if(!u) return;
  // ── Pré-aquece AudioContext para eliminar cold start no primeiro TTS ──
  if(!_ttsAudioCtx || _ttsAudioCtx.state === 'closed'){
    try{
      _ttsAudioCtx = new (window.AudioContext||window.webkitAudioContext)();
      // Toca 1ms de silêncio para desbloquear o contexto imediatamente
      const buf = _ttsAudioCtx.createBuffer(1, _ttsAudioCtx.sampleRate * 0.001, _ttsAudioCtx.sampleRate);
      const src = _ttsAudioCtx.createBufferSource();
      src.buffer = buf; src.connect(_ttsAudioCtx.destination); src.start(0);
    }catch(e){}
  }
  // ── Pré-carrega token ──────────────────────────────────────────
  getAuthToken().catch(()=>{});
  const canCreate = u.role==='admin' || SALA_PLANS.includes(u.plan||'trial'); // admin sempre pode criar sala
  const locked    = document.getElementById('sala-locked-msg');
  const main      = document.getElementById('sala-main');
  const criarSec  = document.getElementById('sala-criar-section');
  // BUGFIX: sala-main sempre visível (tem seção para entrar em sala + criar)
  // sala-locked-msg mostra aviso de upgrade mas não esconde o main
  if(locked)  locked.style.display  = canCreate ? 'none'  : 'none'; // esconde o bloco de lock pois main já avisa
  if(main)    main.style.display    = 'block'; // sempre visível
  if(criarSec)criarSec.style.display= canCreate ? 'block' : 'none'; // só esconde o botão criar se não tiver plano
  // Esconde aviso de backend
  const notice=document.getElementById('sala-backend-notice');
  if(notice)notice.style.display='none';
  // Reseta input
  const inp = document.getElementById('sala-code-input');
  if(inp){inp.value='';inp.className='sala-code-input';inp.disabled=false;}
  const fb  = document.getElementById('sala-code-feedback');
  if(fb)fb.textContent='';
  const btn = document.getElementById('sala-entrar-btn');
  if(btn)btn.disabled=true;
  // Inicia seletor de idioma da sala
  _salaInitLangPicker();
  // Verifica backend silenciosamente se for criador
  if(canCreate){
    fetch(getBackendUrl()+'/api/ping',{signal:AbortSignal.timeout(5000)})
      .then(r=>{if(!r.ok)throw new Error(r.status);})
      .catch(()=>{ if(notice)notice.style.display='block'; });
  }
}

// ── Seletor de idioma da sala ────────────────────────────────────
function _salaInitLangPicker(){
  const langs = typeof allLangs !== 'undefined' ? allLangs : [
    {code:'PT-BR',name:'Português 🇧🇷'},{code:'EN-US',name:'Inglês 🇺🇸'},
    {code:'ES',name:'Espanhol 🇪🇸'},{code:'FR',name:'Francês 🇫🇷'},
    {code:'DE',name:'Alemão 🇩🇪'},{code:'IT',name:'Italiano 🇮🇹'},
    {code:'JA',name:'Japonês 🇯🇵'},{code:'ZH',name:'Mandarim 🇨🇳'},
  ];
  // Prioridade: picked anterior → LO[lfi] → 'PT-BR' fixo
  // NÃO usa _salaMyLang pois pode estar null de um reset anterior
  let currentLang = _salaMyLangPicked;
  if(!currentLang){
    try{ currentLang = LO[lfi]?.code; }catch(e){}
  }
  if(!currentLang) currentLang = 'PT-BR';

  ['sala-my-lang-select','sala-my-lang-select-enter'].forEach(id=>{
    const sel = document.getElementById(id);
    if(!sel) return;
    sel.innerHTML = langs.map(l=>`<option value="${l.code}"${l.code===currentLang?' selected':''}>${l.name||l.code}</option>`).join('');
    sel.value = currentLang;
  });
  // Salva nas duas variáveis
  _salaMyLang = currentLang;
  _salaMyLangPicked = currentLang;
  console.log('[SALA] picker iniciado — idioma:', currentLang);
}

function salaSetMyLang(code){
  _salaMyLang = code;
  _salaMyLangPicked = code; // persiste mesmo após reset
  // Sincroniza os dois selects
  ['sala-my-lang-select','sala-my-lang-select-enter'].forEach(id=>{
    const sel = document.getElementById(id);
    if(sel && sel.value !== code) sel.value = code;
  });
  console.log('[SALA] idioma definido:', code);
}

// ── Criar sala ──────────────────────────────────────────────────
async function criarSala(){
  const btn = document.getElementById('sala-criar-btn');
  if(btn){btn.disabled=true;btn.textContent='⏳ Criando...';}

  // BUGFIX: captura o idioma do picker ANTES de esconder a div sala-antes-criar
  const selEl = document.getElementById('sala-my-lang-select');
  if(selEl && selEl.value){
    _salaMyLang = selEl.value;
    _salaMyLangPicked = selEl.value;
    console.log('[SALA] criarSala — idioma capturado do picker:', _salaMyLang);
  }

  try{
    const token = await getAuthToken();
    const r = await fetch(getBackendUrl()+'/api/rooms/create',{
      method:'POST',
      signal:AbortSignal.timeout(15000),
      headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})}
    });
    if(!r.ok){
      const status=r.status;
      if(btn){btn.disabled=false;btn.textContent='👥 Criar sala agora';}
      if(status===502||status===503||status===504){
        showToast('Backend indisponível ('+status+'). Verifique variáveis de ambiente no Render.','error');
        const n=document.getElementById('sala-backend-notice');if(n)n.style.display='block';
      } else {
        showToast('Erro ao criar sala: HTTP '+status,'error');
      }
      return;
    }
    const d = await _salaSafeJson(r);
    if(d.error) throw new Error(d.error);

    _salaCode      = d.code;
    _salaIsCreator = true;

    // Mostra o código
    const antes  = document.getElementById('sala-antes-criar');
    const depois = document.getElementById('sala-apos-criar');
    const disp   = document.getElementById('sala-code-display');
    if(antes) antes.style.display='none';
    if(depois)depois.style.display='block';
    if(disp)  disp.textContent=d.code;

    // Expiry
    const exp = document.getElementById('sala-expiry');
    if(exp && d.expiresAt){
      const h = Math.round((new Date(d.expiresAt)-Date.now())/3600000);
      exp.textContent = h+' hora'+(h!==1?'s':'');
    }

    // Conecta socket e aguarda participante
    await _salaConectarSocket(d.code);
    showToast('✅ Sala criada! Compartilhe o código.','success');
  }catch(e){
    showToast('Erro: '+e.message,'error');
    if(btn){btn.disabled=false;btn.textContent='👥 Criar sala agora';}
  }
}

// ── Copiar código ───────────────────────────────────────────────
function copiarCodigoSala(){
  if(!_salaCode)return;
  navigator.clipboard?.writeText(_salaCode).then(()=>{
    const hint=document.getElementById('sala-copy-hint');
    if(hint){hint.textContent='✅ Copiado!';setTimeout(()=>hint.textContent='📋 Toque para copiar',2000);}
    showToast('Código copiado: '+_salaCode,'success');
  }).catch(()=>showToast('Código: '+_salaCode,'info'));
}

// ── Confirm modal (substitui window.confirm no mobile) ──────────
function showConfirm({ icon='⚠️', title='Confirmar', msg='', confirmLabel='Confirmar', cancelLabel='Cancelar', onConfirm=()=>{} }){
  const modal = document.getElementById('confirm-modal');
  document.getElementById('cm-icon').textContent = icon;
  document.getElementById('cm-title').textContent = title;
  document.getElementById('cm-sub').textContent = msg;
  document.getElementById('cm-confirm').textContent = confirmLabel;
  document.getElementById('cm-cancel').textContent = cancelLabel;
  modal.classList.add('sh');
  const close = () => modal.classList.remove('sh');
  document.getElementById('cm-confirm').onclick = () => { close(); onConfirm(); };
  document.getElementById('cm-cancel').onclick = close;
  modal.onclick = (e) => { if(e.target===modal) close(); };
}

// ── Encerrar sala ───────────────────────────────────────────────
async function encerrarSala(){
  if(!_salaCode) return;
  showConfirm({
    icon: '🚪',
    title: 'Encerrar sala?',
    msg: 'A sala será encerrada para todos os participantes.',
    confirmLabel: 'Encerrar',
    cancelLabel: 'Cancelar',
    onConfirm: async () => {
      try{
        const token=await getAuthToken();
        await fetch(getBackendUrl()+'/api/rooms/'+_salaCode,{
          method:'DELETE',
          headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})}
        });
      }catch(e){}
      _salaDesconectar();
      // Reseta UI criar
      const antes  = document.getElementById('sala-antes-criar');
      const depois = document.getElementById('sala-apos-criar');
      if(antes) antes.style.display='block';
      if(depois)depois.style.display='none';
      const btn=document.getElementById('sala-criar-btn');
      if(btn){btn.disabled=false;btn.textContent='👥 Criar sala agora';}
      showToast('Sala encerrada','info');
    }
  });
}

// ── Input de código ─────────────────────────────────────────────
let _salaValidateTimer=null;
function onSalaCodeInput(el){
  el.value=el.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
  el.className='sala-code-input';
  const fb=document.getElementById('sala-code-feedback');
  if(fb)fb.textContent='';
  const btn=document.getElementById('sala-entrar-btn');
  if(btn)btn.disabled=true;
  if(el.value.length===6){
    clearTimeout(_salaValidateTimer);
    _salaValidateTimer=setTimeout(()=>_validarCodigo(el.value),400);
  }
}

async function _validarCodigo(code){
  const fb  = document.getElementById('sala-code-feedback');
  const inp = document.getElementById('sala-code-input');
  const btn = document.getElementById('sala-entrar-btn');
  if(fb)fb.textContent='⏳ Verificando...';
  try{
    const r=await fetch(getBackendUrl()+'/api/rooms/'+code);
    const d=await _salaSafeJson(r);
    if(r.ok){
      if(inp)inp.className='sala-code-input valid';
      if(fb){fb.textContent='✅ Sala encontrada — criada por '+d.createdByName;fb.style.color='var(--green)';}
      if(btn)btn.disabled=false;
    }else{
      if(inp)inp.className='sala-code-input invalid';
      if(fb){fb.textContent='❌ '+(d.error||'Sala não encontrada');fb.style.color='var(--red)';}
    }
  }catch(e){
    if(fb){fb.textContent='❌ '+(e.message||'Erro de conexão');fb.style.color='var(--red)';}
  }
}

// ── Helper: parse JSON com tratamento de respostas HTML (404 do Render etc) ─
async function _salaSafeJson(response){
  const ct = (response.headers.get('content-type')||'').toLowerCase();
  const txt = await response.text();
  if(ct.includes('application/json')){
    try{ return JSON.parse(txt); }catch(e){ /* fallthrough */ }
  }
  // Resposta não é JSON — provavelmente página de erro HTML do servidor (Render 404 etc)
  if(response.status===404){
    throw new Error('Backend não encontrou a rota (404). O servidor precisa ser atualizado/redeployado.');
  }
  if(response.status===401||response.status===403){
    throw new Error('Não autorizado. Faça login novamente.');
  }
  if(response.status>=500){
    throw new Error('Servidor indisponível ('+response.status+'). Tente novamente em instantes.');
  }
  // Tenta parsear assim mesmo (caso JSON sem content-type correto)
  try{ return JSON.parse(txt); }catch(e){
    throw new Error('Resposta inválida do servidor (status '+response.status+').');
  }
}

async function validarEntrarSala(){
  const code=(document.getElementById('sala-code-input')?.value||'').trim().toUpperCase();
  if(code.length!==6){showToast('Digite o código completo de 6 caracteres','error');return;}

  // BUGFIX: captura o idioma do picker de entrada ANTES de conectar
  const selEl = document.getElementById('sala-my-lang-select-enter');
  if(selEl && selEl.value){
    _salaMyLang = selEl.value;
    _salaMyLangPicked = selEl.value;
    console.log('[SALA] validarEntrarSala — idioma capturado do picker:', _salaMyLang);
  }

  _salaCode=code;
  _salaIsCreator=false;
  await _salaConectarSocket(code);
}

// ── Socket.io ───────────────────────────────────────────────────
async function _salaConectarSocket(code){
  if(_salaSocket){_salaSocket.disconnect();_salaSocket=null;window._salaSocket=null;}

  const backendUrl=getBackendUrl();
  const token = await getAuthToken().catch(()=>null);
  _salaSocket=io(backendUrl,{
    transports:['polling','websocket'], // polling primeiro: mais estável no Render free
    reconnection:true,
    reconnectionAttempts:5,
    reconnectionDelay:2000,
    timeout:15000,
    auth: token ? { token } : undefined,
  });

  let _salaConnErrCount=0;
  _salaSocket.on('connect_error',(err)=>{
    _salaConnErrCount++;
    console.warn('Socket connect error:',err.message);
    if(_salaConnErrCount===2){
      showToast('⚠️ Não foi possível conectar à sala. Backend pode estar offline.','error');
      const fb=document.getElementById('sala-code-feedback');
      if(fb){fb.textContent='❌ Backend sem resposta.';fb.style.color='var(--red)';}
      const n=document.getElementById('sala-backend-notice');if(n)n.style.display='block';
    }
  });

  _salaSocket.on('connect',()=>{
    _salaConnErrCount=0;
    window._salaSocket=_salaSocket; // expõe para módulo ami
    // Se havia socket dedicado ami, desconecta para evitar duplicata
    if (window._amiSocketDedicado && window._amiSocketDedicado !== _salaSocket) {
      window._amiSocketDedicado.disconnect();
      window._amiSocketDedicado = null;
    }
    console.log('🔌 Socket conectado, entrando na sala',code);
    const u=window._fbUser;
    // BUGFIX: restaura idioma em ordem de prioridade:
    // 1. _salaMyLangPicked (escolhido explicitamente no picker)
    // 2. valor atual do select no DOM
    // 3. LO[lfi] (idioma global)
    // 4. PT-BR (fallback)
    if(!_salaMyLang){
      const selVal = document.getElementById('sala-my-lang-select')?.value
                  || document.getElementById('sala-my-lang-select-enter')?.value;
      _salaMyLang = _salaMyLangPicked || selVal || LO[lfi]?.code || 'PT-BR';
      _salaMyLangPicked = _salaMyLang;
    }
    console.log('[SALA] connect — _salaMyLang:', _salaMyLang, '| picked:', _salaMyLangPicked);
    _salaSocket.emit('join-room',{
      code,
      uid:  u?.uid||'anon',
      name: u?.name||'Usuário',
      lang: _salaMyLang,
    });
  });

  _salaSocket.on('room-joined',(data)=>{
    console.log('✅ Entrou na sala',data);
    _salaCode=data.code;
    // Verifica se já tem outro participante
    const outros=data.participants.filter(p=>p.uid!==window._fbUser?.uid);
    if(outros.length>0){
      _salaOutroConectado(outros[0]);
    }
    if(_salaIsCreator){
      // Atualiza UI do criador se já tem participante
      if(outros.length>0){
        const ag=document.getElementById('sala-aguardando');
        const ok=document.getElementById('sala-participante-entrou');
        if(ag)ag.style.display='none';
        if(ok)ok.style.display='block';
      }
    } else {
      // Quem entrou vai direto para sala ativa
      entrarNaSalaAtiva();
    }
  });

  _salaSocket.on('room-error',(data)=>{
    showToast('❌ '+data.msg,'error');
    _salaDesconectar();
  });

  _salaSocket.on('participant-joined',(data)=>{
    _salaOutroConectado(data);
    if(_salaIsCreator){
      const ag=document.getElementById('sala-aguardando');
      const ok=document.getElementById('sala-participante-entrou');
      if(ag)ag.style.display='none';
      if(ok)ok.style.display='block';
    }
    showToast('👤 '+data.name+' entrou na sala','success');
  });

  _salaSocket.on('participant-left',(data)=>{
    _salaConnected=false;
    _salaTheirName='';
    const dot=document.getElementById('sala-outro-dot');
    const nome=document.getElementById('sala-outro-nome');
    const label=document.getElementById('sala-conn-label');
    const connDot=document.getElementById('sala-conn-dot');
    if(dot){dot.className='sala-connection-dot waiting';}
    if(nome)nome.textContent='Aguardando...';
    if(label)label.textContent='Participante saiu';
    if(connDot)connDot.className='sala-connection-dot waiting';
    showToast('👤 '+(data.name||'Participante')+' saiu da sala','info');
  });

  _salaSocket.on('translation-received',(data)=>{
    _salaReceberTraducao(data);
  });

  _salaSocket.on('participant-speaking',(data)=>{
    const wf=document.getElementById('sala-wf-outro');
    const tr=document.getElementById('sala-tr-outro');
    if(data.active){
      if(wf)wf.classList.add('speaking');
      if(tr)tr.textContent='🎙️ '+data.name+' está falando...';
    }else{
      if(wf)wf.classList.remove('speaking');
    }
  });

  _salaSocket.on('room-closed',(data)=>{
    showToast('Sala encerrada: '+(data.reason||''),'info');
    sairDaSalaAtiva();
  });

  // ── WebRTC signaling handlers (vídeo P2P) ─────────────────────
  _salaSocket.on('webrtc-offer', _salaHandleOffer);
  _salaSocket.on('webrtc-answer', _salaHandleAnswer);
  _salaSocket.on('webrtc-ice', _salaHandleIce);
  _salaSocket.on('webrtc-hangup',()=>{
    if(_salaPC||_salaVideoMode){
      _salaEncerrarWebRTC();
      showToast('📵 Vídeo chamada encerrada','info');
    }
  });

  _salaSocket.on('disconnect',()=>{
    _salaConnected=false;
    const dot=document.getElementById('sala-conn-dot');
    const label=document.getElementById('sala-conn-label');
    if(dot)dot.className='sala-connection-dot disconnected';
    if(label)label.textContent='Desconectado';
  });

  _salaSocket.on('reconnect',()=>{
    const u=window._fbUser;
    _salaSocket.emit('join-room',{code,uid:u?.uid||'anon',name:u?.name||'Usuário',lang:_salaMyLang});
  });
}

function _salaOutroConectado(data){
  _salaConnected=true;
  _salaTheirName=data.name||'Participante';
  _salaTheirLang=data.lang||data.language||data.fromLang||'EN-US';
  console.log('[SALA] outro conectado — data:', JSON.stringify(data), '| _salaTheirLang:', _salaTheirLang);
  // Debug feed
  if(typeof window.__dbgSalaFeedAdd==='function'){
    window.__dbgSalaFeedAdd('🟢 '+_salaTheirName+' entrou — lang recebido: '+(data.lang||'⚠ undefined!'), data.lang?'#00ff88':'#ff4466');
    window.__dbgSalaFeedAdd('  data completo: '+JSON.stringify(data), '#4a5170');
    window.__dbgSalaFeedAdd('  _salaTheirLang definido como: '+_salaTheirLang, '#ffd000');
  }
  const dot=document.getElementById('sala-outro-dot');
  const nome=document.getElementById('sala-outro-nome');
  const lang=document.getElementById('sala-outro-lang');
  const av=document.getElementById('sala-outro-av');
  const connDot=document.getElementById('sala-conn-dot');
  const label=document.getElementById('sala-conn-label');
  if(dot)dot.className='sala-connection-dot connected';
  if(nome)nome.textContent=data.name||'Participante';
  if(lang)lang.textContent=data.lang||'EN-US';
  if(av)av.textContent=(data.name||'P').charAt(0).toUpperCase();
  if(connDot)connDot.className='sala-connection-dot connected';
  if(label)label.textContent='Conectado com '+(data.name||'Participante');
  // Mostra botão de iniciar vídeo (se já não estiver no modo vídeo)
  const vbtn=document.getElementById('sala-iniciar-video-btn');
  if(vbtn && !_salaVideoMode) vbtn.style.display='inline-block';
  // Atualiza nome/idioma na overlay do vídeo se já estiver no modo vídeo
  const rNome=document.getElementById('sala-video-remote-nome');
  const rLang=document.getElementById('sala-video-remote-lang');
  if(rNome)rNome.textContent=data.name||'Participante';
  if(rLang)rLang.textContent=data.lang||'EN-US';
}

function _salaDesconectar(){
  _salaEncerrarWebRTC(); // sempre fecha WebRTC antes de desconectar socket
  if(_salaSocket){_salaSocket.disconnect();_salaSocket=null;window._salaSocket=null;}
  // Recria socket dedicado ami após desconectar da sala
  setTimeout(()=>{ if(typeof window._ensureAmiSocket==='function') window._ensureAmiSocket(); },500);
  _salaCode=null;_salaConnected=false;
  // NÃO reseta _salaMyLang aqui — o idioma do picker deve persistir para reconexões
  // _salaMyLangPicked garante que o valor sobrevive entre sessões
  _salaTheirLang='EN-US';
  _salaStopRec();
  if(_salaContinuousMode)_salaStopContinuous();
  if(typeof _rtMode!=="undefined"&&_rtMode)_rtStopRealtime();
  // Reseta UI de botões de vídeo
  const vbtn=document.getElementById('sala-iniciar-video-btn');
  if(vbtn)vbtn.style.display='none';
}

// ── Entrar na sala ativa (tela de tradução) ─────────────────────
function entrarNaSalaAtiva(){
  const u=window._fbUser;
  if(!u||!_salaCode)return;
  // BUGFIX: restaura idioma em ordem de prioridade: picked → DOM select → LO[lfi] → PT-BR
  if(!_salaMyLang){
    const selVal = document.getElementById('sala-my-lang-select')?.value
                || document.getElementById('sala-my-lang-select-enter')?.value;
    _salaMyLang = _salaMyLangPicked || selVal || LO[lfi]?.code || 'PT-BR';
    _salaMyLangPicked = _salaMyLang;
  }
  console.log('[SALA] entrarNaSalaAtiva — _salaMyLang:', _salaMyLang);
  _salaWc=0;

  // Atualiza UI da sala ativa
  const euNome=document.getElementById('sala-eu-nome');
  const euLang=document.getElementById('sala-eu-lang');
  const euAv=document.getElementById('sala-eu-av');
  const activeCode=document.getElementById('sala-active-code');
  if(euNome)euNome.textContent=u.name?.split(' ')[0]||'Você';
  if(euLang)euLang.textContent=_salaMyLang;
  if(euAv)euAv.textContent=(u.name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  if(activeCode)activeCode.textContent=_salaCode;

  // Limpa bubbles
  const bubs=document.getElementById('sala-bubs');
  const empty=document.getElementById('sala-bubs-empty');
  if(bubs){while(bubs.firstChild&&bubs.firstChild!==empty)bubs.removeChild(bubs.firstChild);}
  if(empty)empty.style.display='block';

  // Reseta UI de vídeo (caso tenha sobrado de sessão anterior)
  _salaVideoMode=false;
  const vwrap=document.getElementById('sala-video-wrap');
  const vctrls=document.getElementById('sala-video-ctrls');
  const lastTr=document.getElementById('sala-last-trans');
  const tpanel=document.getElementById('sala-text-panel');
  const vbtn=document.getElementById('sala-iniciar-video-btn');
  if(vwrap)vwrap.style.display='none';
  if(vctrls)vctrls.style.display='none';
  if(lastTr)lastTr.style.display='none';
  if(tpanel)tpanel.style.display='flex';
  if(vbtn)vbtn.style.display=_salaConnected?'inline-block':'none';
  // Atualiza idioma local no overlay do vídeo
  const lloc=document.getElementById('sala-video-local-lang');
  if(lloc)lloc.textContent=_salaMyLang;

  navApp('sala-ativa');
}

// ── Sair da sala ativa ──────────────────────────────────────────
function sairDaSalaAtiva(){
  _salaStopRec();
  // Avisa o outro participante que estamos encerrando o vídeo (se ativo)
  if(_salaSocket&&_salaCode&&(_salaPC||_salaVideoMode)){
    try{ _salaSocket.emit('webrtc-hangup',{code:_salaCode}); }catch(e){}
  }
  if(_salaSocket&&_salaCode){
    _salaSocket.emit('leave-room',{code:_salaCode,uid:window._fbUser?.uid});
  }
  _salaDesconectar();
  navApp('home');
}

// ── Microfone da sala ───────────────────────────────────────────
async function salaMicToggle(){
  if(_salaRecording)_salaStopRec();
  else await _salaStartRec();
}

async function _salaStartRec(){
  if(_salaRecording)return;
  try{
    _salaStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,sampleRate:16000}});
  }catch(e){showToast('❌ Permissão de microfone negada','error');return;}

  _salaRecording=true;_salaChunks=[];_salaRecSec=0;
  const mime=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
  try{_salaRecorder=new MediaRecorder(_salaStream,{mimeType:mime});}
  catch(e){_salaRecorder=new MediaRecorder(_salaStream);}
  _salaRecorder.ondataavailable=e=>{if(e.data?.size>0)_salaChunks.push(e.data);};
  _salaRecorder.start(100);
  _salaRecTimer=setInterval(()=>_salaRecSec++,1000);

  // UI
  const btn=document.getElementById('sala-micbtn');
  const ico=document.getElementById('sala-mico');
  const lbl=document.getElementById('sala-micl');
  const wf =document.getElementById('sala-wf-eu');
  if(btn)btn.className='micb rec';
  if(ico)ico.textContent='⏹';
  if(lbl)lbl.textContent='Gravando... toque p/ parar';
  if(wf)wf.classList.add('speaking');
  _salaWavAnim=animWF('sala-wf-eu',true);

  // Sinaliza para o outro
  if(_salaSocket&&_salaCode)_salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:true});
  document.getElementById('sala-tr-eu').textContent='🎙️ Ouvindo...';
}

async function _salaStopRec(){
  if(!_salaRecording)return;
  _salaRecording=false;
  clearInterval(_salaRecTimer);_salaRecTimer=null;
  if(_salaWavAnim){clearInterval(_salaWavAnim);_salaWavAnim=null;}
  animWF('sala-wf-eu',false);

  const btn=document.getElementById('sala-micbtn');
  const ico=document.getElementById('sala-mico');
  const lbl=document.getElementById('sala-micl');
  const wf=document.getElementById('sala-wf-eu');
  if(btn)btn.className='micb proc';
  if(ico)ico.textContent='⌛';
  if(lbl)lbl.textContent='Traduzindo...';
  if(wf)wf.classList.remove('speaking');

  if(_salaSocket&&_salaCode)_salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:false});

  if(_salaRecorder?.state==='recording'){
    _salaRecorder.onstop=async()=>await _salaProcessAudio();
    _salaRecorder.stop();
  }
  try{_salaStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  _salaStream=null;
}

async function _salaProcessAudio(){
  const blob=new Blob(_salaChunks,{type:'audio/webm'});
  _salaChunks=[];

  console.log('[SALA] áudio gravado — size:', blob.size, 'bytes | duração:', _salaRecSec, 's');

  if(blob.size<2000||_salaRecSec<0.5){
    _salaResetMic();
    document.getElementById('sala-tr-eu').textContent='Toque no mic para falar';
    console.warn('[SALA] áudio muito curto, ignorado. size='+blob.size+' sec='+_salaRecSec);
    return;
  }

  // Usa idiomas da sala (não os idiomas globais da sessão ativa)
  // _salaMyLang = meu idioma (origem) | _salaTheirLang = idioma do outro (destino)
  // PROTEÇÃO: se _salaTheirLang ainda não chegou (outro não conectou), usa fallback inteligente
  if(!_salaTheirLang){
    // Se eu falo PT, assume que outro fala EN (e vice-versa)
    const myBase=(_salaMyLang||'PT-BR').split('-')[0].toUpperCase();
    _salaTheirLang = myBase==='PT' ? 'EN-US' : myBase==='EN' ? 'PT-BR' : 'EN-US';
    console.warn('[SALA] _salaTheirLang estava null — definido como fallback:', _salaTheirLang);
    if(typeof window.__dbgSalaFeedAdd==='function')
      window.__dbgSalaFeedAdd('⚠ _salaTheirLang era null! Fallback: '+_salaTheirLang, '#ff8c00');
  }
  const from = (_salaMyLang || LO[lfi]?.code || 'PT-BR').split('-')[0].toLowerCase();
  const to   = (_salaTheirLang || LO[lti]?.code || 'EN-US').split('-')[0].toLowerCase();
  console.log('[SALA] from:', _salaMyLang, '→ to:', _salaTheirLang);

  try{
    const token=await getAuthToken();
    const headers=token?{Authorization:'Bearer '+token}:{};
    const fd=new FormData();
    fd.append('audio',blob,'sala.webm');
    fd.append('from',from);
    fd.append('to',to);
    // Dica de contexto para o STT — melhora precisão sem custo extra
    const _sPromptMap={'pt':'Transcrição em português brasileiro.','en':'Transcription in English.','es':'Transcripción en español.','fr':'Transcription en français.','de':'Transkription auf Deutsch.','it':'Trascrizione in italiano.','ja':'日本語の文字起こし。'};
    if(_sPromptMap[from]) fd.append('prompt',_sPromptMap[from]);

    const t0=Date.now();
    console.log('[SALA] enviando áudio para /api/listen — from:'+from+' to:'+to);
    const r=await fetch(getBackendUrl()+'/api/listen',{method:'POST',headers,body:fd});
    const d=await r.json();
    const latMs=Date.now()-t0;
    console.log('[SALA] resposta /api/listen:', JSON.stringify(d), 'status:', r.status, latMs+'ms');

    // Debug intercept — salva resultado para __dbgSala()
    if(window.__dbgSalaIntercept||true){
      window.__dbgSalaLastCall={
        from,to,size:blob.size,status:r.status,
        original:d.original,translation:d.translation,
        fromLang:_salaMyLang||LO[lfi]?.code||'PT-BR',
        toLang:_salaTheirLang||LO[lti]?.code||'EN-US',
      };
      if(typeof window.__dbgSalaFeedAdd==='function'){
        const ok = d.original && d.original.length>1;
        window.__dbgSalaFeedAdd('🎙 VOCÊ falou ['+from+'→'+to+']', '#ffd000');
        if(ok){
          window.__dbgSalaFeedAdd('  orig: '+d.original, '#e8eaf2');
          window.__dbgSalaFeedAdd('  trad: '+d.translation, '#00e5ff');
        } else {
          window.__dbgSalaFeedAdd('  ⚠ sem transcrição (áudio curto ou silêncio)', '#ff4466');
        }
      }
    }

    if(!d.original||d.original.trim().length<2){
      _salaResetMic();
      document.getElementById('sala-tr-eu').textContent='Não entendi. Tente novamente.';
      console.warn('[SALA] resposta sem original:', d);
      return;
    }

    document.getElementById('sala-tr-eu').textContent=d.original;
    // Adiciona animação de destaque
    const euTr=document.getElementById('sala-tr-eu');
    if(euTr){
      euTr.classList.add('translate-flash');
      setTimeout(()=>euTr.classList.remove('translate-flash'),600);
    }
    _salaWc+=d.original.split(' ').length;

    // Atualiza métricas
    const wrdEl=document.getElementById('sala-wrd');
    const latEl=document.getElementById('sala-lat');
    const accEl=document.getElementById('sala-acc');
    if(wrdEl)wrdEl.textContent=_salaWc;
    if(latEl)latEl.textContent=latMs+'ms';
    if(accEl)accEl.textContent='97%';

    // Adiciona bubble local
    _salaAddBubble(d.original,d.translation,'mine',_salaMyLang||LO[lfi]?.code||'PT-BR',_salaTheirLang||LO[lti]?.code||'EN-US',latMs+'ms');

    // Atualiza painel "última tradução" (visível durante vídeo chamada)
    _salaUpdateLastTranslation('Você → '+(_salaTheirName||'Participante'), d.translation);

    // Envia via Socket.io para o outro participante
    if(_salaSocket&&_salaCode){
      _salaSocket.emit('translation',{
        code:_salaCode,
        original:d.original,
        translation:d.translation,
        fromLang:_salaMyLang||LO[lfi]?.code||'PT-BR',
        toLang:_salaTheirLang||LO[lti]?.code||'EN-US',
        speakerName:window._fbUser?.name||'Você',
        speakerUid:window._fbUser?.uid,
      });
    }

    // NÃO toca TTS quando você mesmo fala — só o outro lado ouve sua tradução
    // TTS é tocado em _salaReceberTraducao quando chega tradução do outro

  }catch(e){
    console.error('[SALA] erro em _salaProcessAudio:', e);
    showToast('Erro: '+e.message,'error');
  }
  _salaResetMic();
}

function _salaReceberTraducao(data){
  // Debug feed — mostra o que chegou do outro participante
  if(typeof window.__dbgSalaFeedAdd==='function'){
    window.__dbgSalaFeedAdd('📥 RECEBIDO de '+(data.speakerName||'outro')+' ['+data.fromLang+'→'+data.toLang+']', '#7c3aed');
    window.__dbgSalaFeedAdd('  orig: '+data.original, '#e8eaf2');
    window.__dbgSalaFeedAdd('  trad: '+data.translation, '#00e5ff');
    window.__dbgSalaFeedAdd('  🔊 TTS lang: '+(data.toLang||'⚠ indefinido'), data.toLang?'#00ff88':'#ff4466');
    // Valida: toLang deve ser = _salaMyLang (a tradução deve estar no meu idioma)
    const meuLang = window._salaMyLang;
    const toBase = (data.toLang||'').split('-')[0].toUpperCase();
    const myBase = (meuLang||'').split('-')[0].toUpperCase();
    if(meuLang && toBase && toBase !== myBase){
      window.__dbgSalaFeedAdd('  ⚠ ATENÇÃO: toLang('+toBase+') ≠ meuLang('+myBase+') — tradução no idioma errado!', '#ff4466');
    } else if(meuLang && toBase === myBase){
      window.__dbgSalaFeedAdd('  ✓ Direção correta: tradução em '+toBase+' = meu idioma', '#00ff88');
    }
  }

  // Atualiza painel do outro — mostra a TRADUÇÃO (no idioma do receptor), não o original
  const outroTr=document.getElementById('sala-tr-outro');
  if(outroTr){
    outroTr.textContent=data.translation||data.original;
    outroTr.classList.add('translate-flash');
    setTimeout(()=>outroTr.classList.remove('translate-flash'),600);
  }

  // Adiciona bubble do outro
  _salaAddBubble(data.original,data.translation,'theirs',data.fromLang,data.toLang,'');

  // Atualiza painel "última tradução" (visível durante vídeo chamada)
  _salaUpdateLastTranslation((data.speakerName||'Participante')+' → você', data.translation);

  // Toca o áudio recebido (voz do outro) — usa toLang pois é o idioma da TRADUÇÃO (o que eu entendo)
  if(data.translation)_speakTranslation(data.translation, data.toLang);
}

function _salaUpdateLastTranslation(label, text){
  const wrap=document.getElementById('sala-last-trans');
  const lab =wrap?.querySelector('.label');
  const txt =document.getElementById('sala-last-trans-text');
  if(!wrap||!txt)return;
  if(lab)lab.textContent=label;
  txt.textContent=text||'—';
}

function _salaAddBubble(original,translation,side,fromLang,toLang,lat){
  const bubs=document.getElementById('sala-bubs');
  const empty=document.getElementById('sala-bubs-empty');
  if(!bubs)return;
  if(empty)empty.style.display='none';
  const el=document.createElement('div');
  el.className='sala-bubble '+side;
  const time=new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  el.innerHTML=`<div class="sala-bub-orig">${original}</div>
    <div class="sala-bub-trans">${translation}</div>
    <div class="sala-bub-meta">${fromLang} → ${toLang} · ${time}${lat?' · '+lat:''}</div>`;
  bubs.appendChild(el);
  bubs.scrollTop=bubs.scrollHeight;
}

function _salaResetMic(){
  const btn=document.getElementById('sala-micbtn');
  const ico=document.getElementById('sala-mico');
  const lbl=document.getElementById('sala-micl');
  if(btn)btn.className='micb idle';
  if(ico)ico.textContent='🎙️';
  if(lbl)lbl.textContent=_salaContinuousMode?'🔴 Ouvindo sempre...':'Toque para falar';
}

// ══════════════════════════════════════════════════════════════════
//  MODO INTÉRPRETE — OpenAI Realtime API via WebSocket
//  Latência: ~300-500ms | VAD do lado da OpenAI | Sem chunks
// ══════════════════════════════════════════════════════════════════
let _rtMode       = false;
let _rtWS         = null;
let _rtStream     = null;
let _rtProcessor  = null;
let _rtAudioCtx   = null;
let _rtConnecting = false;

async function salaToggleRealtime(){
  if(_rtMode) _rtStopRealtime();
  else        await _rtStartRealtime();
}

async function _rtStartRealtime(){
  if(_rtConnecting) return;
  if(_salaContinuousMode) _salaStopContinuous();
  if(_salaRecording)      await _salaStopRec();

  const backendUrl = getBackendUrl();
  if(!backendUrl){ showToast('❌ Backend não configurado','error'); return; }

  _rtConnecting = true;
  const toggle = document.getElementById('sala-realtime-toggle');
  if(toggle) toggle.querySelector('span').textContent = '⚡ Conectando...';

  try{
    _rtStream = await navigator.mediaDevices.getUserMedia({
      audio:{ echoCancellation:true, noiseSuppression:true, sampleRate:16000 }
    });
  }catch(e){
    showToast('❌ Permissão de microfone negada','error');
    _rtConnecting=false; return;
  }

  try{
    const token   = await getAuthToken();
    const from    = (_salaMyLang||LO[lfi]?.code||'PT-BR').split('-')[0].toLowerCase();
    const to      = (_salaTheirLang||LO[lti]?.code||'EN-US').split('-')[0].toLowerCase();
    const voiceId = window._fbUser?.azure_speaker_id || window._fbUser?.voice_id || '';
    const wsUrl   = backendUrl.replace('https://','wss://').replace('http://','ws://')
                  + `/api/realtime?from=${from}&to=${to}&voiceId=${encodeURIComponent(voiceId)}&token=${encodeURIComponent(token||'')}`;

    _rtWS = new WebSocket(wsUrl);

    _rtWS.onopen = ()=>{
      console.log('⚡ Realtime WS aberto');
      _rtMode=true; _rtConnecting=false;
      _rtStartMicCapture();
      if(toggle){toggle.classList.add('rt-on');toggle.querySelector('span').textContent='⚡ Intérprete ON';}
      const lbl=document.getElementById('sala-micl');
      if(lbl) lbl.textContent='⚡ Modo Intérprete ativo...';
      document.getElementById('sala-ptt-wrap').style.display='none';
      document.getElementById('sala-vad-bar').style.opacity='1';
      showToast('⚡ Modo Intérprete ativado — fale quando quiser!','success');
    };

    _rtWS.onmessage = (ev)=>{
      try{ _rtHandleEvent(JSON.parse(ev.data)); }catch(e){}
    };

    _rtWS.onerror = ()=>{ _rtStopRealtime(); showToast('❌ Erro no Modo Intérprete','error'); };
    _rtWS.onclose = ()=>{ if(_rtMode) _rtStopRealtime(); };

  }catch(e){
    showToast('❌ Falha: '+e.message,'error');
    _rtConnecting=false;
    try{_rtStream?.getTracks().forEach(t=>t.stop());}catch(_){}
  }
}

function _rtStartMicCapture(){
  _rtAudioCtx = new (window.AudioContext||window.webkitAudioContext)({sampleRate:24000});
  const source = _rtAudioCtx.createMediaStreamSource(_rtStream);
  _rtProcessor = _rtAudioCtx.createScriptProcessor(4096,1,1);
  _rtProcessor.onaudioprocess = (e)=>{
    if(!_rtWS||_rtWS.readyState!==WebSocket.OPEN) return;
    const f32 = e.inputBuffer.getChannelData(0);
    const pcm = new Int16Array(f32.length);
    for(let i=0;i<f32.length;i++) pcm[i]=Math.max(-32768,Math.min(32767,f32[i]*32768));
    const bytes=new Uint8Array(pcm.buffer);
    let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
    _rtWS.send(JSON.stringify({type:'input_audio_buffer.append',audio:btoa(bin)}));
    // Barra VAD visual
    let sum=0; f32.forEach(v=>sum+=v*v);
    const fill=document.getElementById('sala-vad-fill');
    if(fill) fill.style.width=Math.min(100,Math.sqrt(sum/f32.length)*800)+'%';
  };
  source.connect(_rtProcessor);
  _rtProcessor.connect(_rtAudioCtx.destination);
}

async function _rtHandleEvent(msg){
  switch(msg.type){
    // ── Fase 1B: eventos Azure (mantém lógica interna idêntica) ──
    case 'aivox.transcription':
    case 'conversation.item.input_audio_transcription.completed':{
      const t=(msg.transcript||msg.transcript)?.trim();
      if(t){ const el=document.getElementById('sala-tr-eu'); if(el) el.textContent=t; }
      break;
    }
    case 'aivox.translation.delta':
    case 'response.audio_transcript.delta':{
      const el=document.getElementById('sala-tr-outro');
      if(el) el.textContent=(el.textContent||'')+( msg.delta||'');
      break;
    }
    case 'aivox.translation.done':
    case 'response.audio_transcript.done':{
      const translation=msg.transcript?.trim();
      if(!translation) break;
      const original=document.getElementById('sala-tr-eu')?.textContent||'';
      _salaAddBubble(original,translation,'mine',_salaMyLang||LO[lfi]?.code||'PT-BR',_salaTheirLang||LO[lti]?.code||'EN-US','~RT');
      _salaUpdateLastTranslation('Você → '+(_salaTheirName||'Participante'),translation);
      // Usa código da sala ativa; se não tiver, usa sala ami pessoal como canal
      const _rtCode = _salaCode || (window._fbUser?.uid ? 'ami-'+window._fbUser.uid : null);
      if(_salaSocket && _rtCode){
        _salaSocket.emit('translation',{code:_rtCode,original,translation,
          fromLang:_salaMyLang||LO[lfi]?.code||'PT-BR',toLang:_salaTheirLang||LO[lti]?.code||'EN-US',
          speakerName:window._fbUser?.name||'Você',speakerUid:window._fbUser?.uid});
        _salaSocket.emit('speaking',{code:_rtCode,name:window._fbUser?.name||'Você',active:false});
      }
      const el=document.getElementById('sala-tr-eu'); if(el) el.textContent='';
      break;
    }
    case 'aivox.audio.delta':
    case 'response.audio.delta':{
      if(!msg.delta) break;
      try{
        const bin=atob(msg.delta);
        const bytes=new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
        const pcm=new Int16Array(bytes.buffer);
        const f32=new Float32Array(pcm.length);
        for(let i=0;i<pcm.length;i++) f32[i]=pcm[i]/32768;
        const ctx=await _getTTSCtx();  // aguarda AudioContext pronto (fix autoplay)
        const buf=ctx.createBuffer(1,f32.length,24000);
        buf.copyToChannel(f32,0);
        const src=ctx.createBufferSource();
        src.buffer=buf; src.connect(ctx.destination); src.start(0);
      }catch(e){console.warn('rt audio:',e);}
      break;
    }
    case 'aivox.error':
    case 'error': console.warn('Realtime error:',msg.error); break;
  }
}

function _rtStopRealtime(){
  _rtMode=false; _rtConnecting=false;
  try{_rtProcessor?.disconnect();}catch(_){}
  try{_rtAudioCtx?.close();}catch(_){}
  try{_rtStream?.getTracks().forEach(t=>t.stop());}catch(_){}
  _rtProcessor=null; _rtAudioCtx=null; _rtStream=null;
  try{if(_rtWS?.readyState===WebSocket.OPEN)_rtWS.close();}catch(_){}
  _rtWS=null;
  const toggle=document.getElementById('sala-realtime-toggle');
  const pttWrap=document.getElementById('sala-ptt-wrap');
  const vadBar=document.getElementById('sala-vad-bar');
  const fill=document.getElementById('sala-vad-fill');
  const lbl=document.getElementById('sala-micl');
  if(toggle){toggle.classList.remove('rt-on');toggle.querySelector('span').textContent='⚡ Modo Intérprete';}
  if(pttWrap) pttWrap.style.display='';
  if(vadBar)  vadBar.style.opacity='0';
  if(fill)    fill.style.width='0%';
  if(lbl)     lbl.textContent='Toque para falar';
  showToast('⏹ Modo Intérprete desativado','info');
}

// ══════════════════════════════════════════════════════════════════
//  MODO CONTÍNUO — VAD automático, sem apertar botão
// ══════════════════════════════════════════════════════════════════
let _salaContinuousMode = false;
let _salaVADCtx         = null;
let _salaVADAnalyser    = null;
let _salaVADStream      = null;
let _salaVADTimer       = null;
let _salaVADRecorder    = null;
let _salaVADChunks      = [];
let _salaVADSpeaking    = false;
let _salaVADSilenceMs   = 0;
let _salaVADSpeakMs     = 0;
let _salaVADProcessing  = false;

const SALA_VAD_THRESHOLD   = 6.0;  // RMS mínimo — filtrar ruído ambiente
const SALA_VAD_SILENCE_END = 600;  // ms de silêncio para cortar (reduzido para menor latência)
const SALA_VAD_MIN_SPEAK   = 200;  // ms mínimo para enviar
const SALA_VAD_TICK        = 30;   // intervalo de leitura ms (mais responsivo)

async function salaToggleContinuous(){
  if(_salaContinuousMode) _salaStopContinuous();
  else await _salaStartContinuous();
}

async function _salaStartContinuous(){
  if(_salaRecording) await _salaStopRec();
  try{
    _salaVADStream = await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:true,noiseSuppression:true,sampleRate:16000}
    });
  }catch(e){showToast('❌ Permissão de microfone negada','error');return;}

  _salaContinuousMode=true; _salaVADSpeaking=false;
  _salaVADSilenceMs=0; _salaVADSpeakMs=0; _salaVADProcessing=false;

  _salaVADCtx      = new (window.AudioContext||window.webkitAudioContext)({sampleRate:16000});
  _salaVADAnalyser = _salaVADCtx.createAnalyser();
  _salaVADAnalyser.fftSize = 512;
  const src2 = _salaVADCtx.createMediaStreamSource(_salaVADStream);
  // Filtro passa-alta 120Hz — remove ruído de baixa frequência (AC, ventilador, eco)
  const _hpf = _salaVADCtx.createBiquadFilter();
  _hpf.type = 'highpass';
  _hpf.frequency.value = 120;
  _hpf.Q.value = 0.7;
  src2.connect(_hpf);
  _hpf.connect(_salaVADAnalyser);

  const toggle = document.getElementById('sala-continuous-toggle');
  const pttWrap= document.getElementById('sala-ptt-wrap');
  const vadBar = document.getElementById('sala-vad-bar');
  const lbl    = document.getElementById('sala-micl');
  if(toggle) toggle.classList.add('on');
  if(pttWrap)pttWrap.style.display='none';
  if(vadBar) vadBar.style.opacity='1';
  if(lbl)    lbl.textContent='🔴 Ouvindo sempre...';

  _salaVADTimer = setInterval(_salaVADTick, SALA_VAD_TICK);
  showToast('🎙️ Modo Contínuo ativado — fale quando quiser!','success');
}

function _salaStopContinuous(){
  _salaContinuousMode=false;
  clearInterval(_salaVADTimer); _salaVADTimer=null;
  if(_salaVADRecorder&&_salaVADRecorder.state==='recording'){
    try{_salaVADRecorder.stop();}catch(e){}
  }
  _salaVADRecorder=null; _salaVADChunks=[];
  try{_salaVADStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  _salaVADStream=null;
  try{_salaVADCtx?.close();}catch(e){}
  _salaVADCtx=null;

  const toggle=document.getElementById('sala-continuous-toggle');
  const pttWrap=document.getElementById('sala-ptt-wrap');
  const vadBar=document.getElementById('sala-vad-bar');
  const fill=document.getElementById('sala-vad-fill');
  const wf=document.getElementById('sala-wf-eu');
  const tr=document.getElementById('sala-tr-eu');
  if(toggle) toggle.classList.remove('on');
  if(pttWrap)pttWrap.style.display='';
  if(vadBar) vadBar.style.opacity='0';
  if(fill)   fill.style.width='0%';
  if(wf)     wf.classList.remove('speaking');
  if(tr)     tr.textContent='Toque no mic para falar';
  _salaResetMic();
  if(_salaSocket&&_salaCode)_salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:false});
  showToast('⏹ Modo Contínuo desativado','info');
}

function _salaVADTick(){
  if(!_salaVADAnalyser||_salaVADProcessing)return;
  const buf=new Uint8Array(_salaVADAnalyser.frequencyBinCount);
  _salaVADAnalyser.getByteTimeDomainData(buf);
  let sum=0;
  for(let i=0;i<buf.length;i++){const v=(buf[i]-128)/128;sum+=v*v;}
  const rms=Math.sqrt(sum/buf.length)*100;

  // Barra VAD: escala visual proporcional ao threshold
  const fill=document.getElementById('sala-vad-fill');
  if(fill)fill.style.width=Math.min(100,(rms/SALA_VAD_THRESHOLD)*60)+'%';

  if(rms>=SALA_VAD_THRESHOLD){
    _salaVADSilenceMs=0; _salaVADSpeakMs+=SALA_VAD_TICK;
    if(!_salaVADSpeaking){
      _salaVADSpeaking=true; _salaVADChunks=[];
      const mime=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
      try{_salaVADRecorder=new MediaRecorder(_salaVADStream,{mimeType:mime});}
      catch(e){_salaVADRecorder=new MediaRecorder(_salaVADStream);}
      _salaVADRecorder.ondataavailable=e=>{if(e.data?.size>0)_salaVADChunks.push(e.data);};
      _salaVADRecorder.start(40);
      const wf=document.getElementById('sala-wf-eu');
      const tr=document.getElementById('sala-tr-eu');
      const lbl=document.getElementById('sala-micl');
      if(wf) wf.classList.add('speaking');
      if(tr) tr.textContent='🎙️ Ouvindo...';
      if(lbl)lbl.textContent='🔴 Você está falando...';
      if(_salaSocket&&_salaCode)_salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:true});
    }
  }else{
    _salaVADSilenceMs+=SALA_VAD_TICK;
    if(_salaVADSpeaking&&_salaVADSilenceMs>=SALA_VAD_SILENCE_END){
      _salaVADSpeaking=false;
      const falou=_salaVADSpeakMs;
      _salaVADSpeakMs=0; _salaVADSilenceMs=0;
      if(_salaVADRecorder&&_salaVADRecorder.state==='recording'){
        _salaVADProcessing=true;
        _salaVADRecorder.onstop=async()=>{
          try{
            if(falou>=SALA_VAD_MIN_SPEAK) await _salaVADProcessAudio();
            else _salaVADChunks=[];
          }catch(e){console.warn('VAD process error:',e);}
          finally{_salaVADProcessing=false;}
          const wf=document.getElementById('sala-wf-eu');
          const tr=document.getElementById('sala-tr-eu');
          const lbl=document.getElementById('sala-micl');
          if(wf) wf.classList.remove('speaking');
          if(tr) tr.textContent='Fale quando quiser...';
          if(lbl)lbl.textContent='🔴 Ouvindo sempre...';
          if(_salaSocket&&_salaCode)_salaSocket.emit('speaking',{code:_salaCode,name:window._fbUser?.name||'Você',active:false});
        };
        _salaVADRecorder.stop();
      }
    }
  }
}

async function _salaVADProcessAudio(){
  const blob=new Blob(_salaVADChunks,{type:'audio/webm'});
  _salaVADChunks=[];
  if(blob.size<800)return; // tamanho mínimo realista
  const lbl=document.getElementById('sala-micl');
  if(lbl)lbl.textContent='⏳ Traduzindo...';
  // Usa idiomas da sala, não os globais
  // PROTEÇÃO: se _salaTheirLang ainda não chegou, usa fallback inteligente
  if(!_salaTheirLang){
    const myBase=(_salaMyLang||'PT-BR').split('-')[0].toUpperCase();
    _salaTheirLang = myBase==='PT' ? 'EN-US' : myBase==='EN' ? 'PT-BR' : 'EN-US';
    console.warn('[SALA-VAD] _salaTheirLang era null — fallback:', _salaTheirLang);
  }
  const from = (_salaMyLang || LO[lfi]?.code || 'PT-BR').split('-')[0].toLowerCase();
  const to   = (_salaTheirLang || LO[lti]?.code || 'EN-US').split('-')[0].toLowerCase();
  try{
    const token=await getAuthToken();
    const headers=token?{Authorization:'Bearer '+token}:{};
    const fd=new FormData();
    fd.append('audio',blob,'sala-vad.webm');
    fd.append('from',from); fd.append('to',to);
    const _vPromptMap={'pt':'Transcrição em português brasileiro.','en':'Transcription in English.','es':'Transcripción en español.','fr':'Transcription en français.'};
    if(_vPromptMap[from]) fd.append('prompt',_vPromptMap[from]);
    const t0=Date.now();
    const r=await fetch(getBackendUrl()+'/api/listen',{method:'POST',headers,body:fd});
    const d=await r.json();
    const latMs=Date.now()-t0;
    // Debug intercept
    window.__dbgSalaLastCall={
      from,to,size:blob.size,status:r.status,
      original:d.original,translation:d.translation,
      fromLang:_salaMyLang||LO[lfi]?.code||'PT-BR',
      toLang:_salaTheirLang||LO[lti]?.code||'EN-US',
      mode:'continuo',
    };
    if(typeof window.__dbgSalaFeedAdd==='function'){
      const ok = d.original && d.original.length>1;
      window.__dbgSalaFeedAdd('🔴 VAD ['+from+'→'+to+']', '#ffd000');
      if(ok){
        window.__dbgSalaFeedAdd('  orig: '+d.original, '#e8eaf2');
        window.__dbgSalaFeedAdd('  trad: '+d.translation, '#00e5ff');
      } else {
        window.__dbgSalaFeedAdd('  ⚠ sem transcrição', '#ff4466');
      }
    }
    if(!d.original||d.original.trim().length<2)return;
    const euTr=document.getElementById('sala-tr-eu');
    if(euTr){euTr.textContent=d.original;euTr.classList.add('translate-flash');setTimeout(()=>euTr.classList.remove('translate-flash'),600);}
    _salaWc+=d.original.split(' ').length;
    const wrdEl=document.getElementById('sala-wrd');
    const latEl=document.getElementById('sala-lat');
    const accEl=document.getElementById('sala-acc');
    if(wrdEl)wrdEl.textContent=_salaWc;
    if(latEl)latEl.textContent=latMs+'ms';
    if(accEl)accEl.textContent='97%';
    _salaAddBubble(d.original,d.translation,'mine',_salaMyLang||LO[lfi]?.code||'PT-BR',_salaTheirLang||LO[lti]?.code||'EN-US',latMs+'ms');
    _salaUpdateLastTranslation('Você → '+(_salaTheirName||'Participante'),d.translation);
    if(_salaSocket&&_salaCode){
      _salaSocket.emit('translation',{
        code:_salaCode,original:d.original,translation:d.translation,
        fromLang:_salaMyLang||LO[lfi]?.code||'PT-BR',toLang:_salaTheirLang||LO[lti]?.code||'EN-US',
        speakerName:window._fbUser?.name||'Você',speakerUid:window._fbUser?.uid,
      });
    }
    // Não toca TTS localmente — o outro lado recebe via socket
  }catch(e){showToast('Erro: '+e.message,'error');}
}

// ════════════════════════════════════════════════════════════════
//  WebRTC — VÍDEO CHAMADA P2P COM TRADUÇÃO SIMULTÂNEA
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  MÓDULO APRENDIZAGEM — Professor, Lições, Flashcard, Exercícios, Vocabulário
// ════════════════════════════════════════════════════════════════

// ── Estado global ─────────────────────────────────────────────
let _learnLang='inglês', _learnRecog=null, _learnListening=false, _learnHistory=[], _learnVoice=false;
let _licaoLang='inglês', _flashLang='inglês', _exerLang='inglês';
let _flashDeck=[], _flashIdx=0, _flashFlipped=false, _flashOk=0, _flashNope=0;
let _exerScore=0, _exerTotal=0;
let _vocabData=[], _vocabFiltered=[];
let _streakDays=0, _streakPts=0;
let _currentLicao=null;

// ── Dados de lições ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
//  PERMISSÕES DE ACESSO POR USUÁRIO
// ════════════════════════════════════════════════════════════════
function adminTogglePermEl(el){adminTogglePerm(el.dataset.uid,el.dataset.mode,el);}
async function adminTogglePerm(uid,mode,btn){
  const isOn=btn.classList.contains('on');
  btn.classList.toggle('on');
  try{
    const userRef=db.collection('users').doc(uid);
    const snap=await userRef.get();
    const blocked=snap.data()?.blockedModes||[];
    const newBlocked=isOn?[...new Set([...blocked,mode])]:blocked.filter(m=>m!==mode);
    await userRef.update({blockedModes:newBlocked});
    showToast(isOn?('🔒 '+mode+' bloqueado'):('✅ '+mode+' liberado'),isOn?'info':'success');
  }catch(e){
    btn.classList.toggle('on');
    showToast('Erro ao salvar','error');
  }
}

function _renderApiBreakdown(u) {
  const uid = u.uid || 'x';
  const el = document.getElementById('api-breakdown-' + uid);
  if (!el) return;
  const apiMins = u.api_mins || {};
  const totalMin = u.minutesUsed || 0;
  // APIs e seus dados
  const apis = [
    { key: 'whisper',    label: 'Whisper / OpenAI',  icon: '🎙️', color: '#10a37f', desc: 'STT — reconhecimento de fala' },
    { key: 'gpt',        label: 'GPT-4o / OpenAI',   icon: '🤖', color: '#74aa9c', desc: 'Tradução em tempo real' },
    { key: 'elevenlabs', label: 'ElevenLabs',         icon: '🔊', color: '#a855f7', desc: 'TTS — síntese de voz clonada' },
    { key: 'anthropic',  label: 'Claude / Anthropic', icon: '🧠', color: '#00e5ff', desc: 'Aprendizagem com IA' },
    { key: 'wisp',       label: 'Wisp',               icon: '⚡', color: '#fbbf24', desc: 'Infraestrutura / relay de áudio' },
  ];
  // Se nao tem dados historicos, estima pelos minutos totais
  const hasRealData = Object.keys(apiMins).length > 0;
  const estimated = {
    whisper:    parseFloat(((apiMins.whisper    || totalMin * 0.35)).toFixed(1)),
    gpt:        parseFloat(((apiMins.gpt        || totalMin * 0.30)).toFixed(1)),
    elevenlabs: parseFloat(((apiMins.elevenlabs || totalMin * 0.25)).toFixed(1)),
    anthropic:  parseFloat(((apiMins.anthropic  || totalMin * 0.05)).toFixed(1)),
    wisp:       parseFloat(((apiMins.wisp       || totalMin * 0.05)).toFixed(1)),
  };
  const maxVal = Math.max(...Object.values(estimated), 0.1);
  let html = '<div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);font-family:var(--mono);margin-bottom:10px;">📊 Minutos por API' + (hasRealData ? '' : ' <span style=\"color:var(--yellow);font-size:9px;\">(estimado)</span>') + '</div>';
  apis.forEach(api => {
    const val = estimated[api.key] || 0;
    const pct = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
    html += '<div style="margin-bottom:8px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">' +
        '<span style="font-size:11px;display:flex;align-items:center;gap:5px;">' + api.icon + ' <strong>' + api.label + '</strong>' +
        '<span style="font-size:9px;color:var(--muted);margin-left:3px;">' + api.desc + '</span></span>' +
        '<span style="font-size:11px;font-weight:700;font-family:var(--mono);color:' + api.color + ';">' + val.toFixed(1) + ' min</span>' +
      '</div>' +
      '<div style="height:5px;background:var(--surface);border-radius:3px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:' + api.color + ';border-radius:3px;transition:width .5s ease;"></div>' +
      '</div>' +
    '</div>';
  });
  html += '<div style="border-top:1px solid var(--border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;">' +
    '<span style="font-size:10px;color:var(--muted);">Total registrado</span>' +
    '<span style="font-size:11px;font-weight:700;font-family:var(--mono);">' + totalMin + ' min</span>' +
  '</div>';
  el.innerHTML = html;
}

function _renderPermPanel(u){
  const panel=document.getElementById('perm-panel-'+(u.uid||'x'));
  if(!panel)return;
  const modos=['conversa','viagem','reuniao','escuta','aprendizagem'];
  const icons={conversa:'💬',viagem:'✈️',reuniao:'👥',escuta:'🎧',aprendizagem:'🎓'};
  const labels={conversa:'Conversa',viagem:'Viagem',reuniao:'Reunião',escuta:'Escuta',aprendizagem:'Aprendizagem'};
  let html='<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:11px 13px;margin-top:10px;">';
  html+='<div style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:var(--muted);font-family:var(--mono);margin-bottom:8px;">&#x1F510; PERMISSÕES DE ACESSO</div>';
  html+='<div class="perm-grid">';
  modos.forEach(function(m){
    var has=!u.blockedModes||!u.blockedModes.includes(m);
    html+='<div class="perm-btn '+(has?'on':'')+'" data-uid="'+(u.uid||'')+'" data-mode="'+m+'" onclick="adminTogglePermEl(this)">';
    html+='<div class="perm-dot"></div>'+icons[m]+' '+labels[m]+'</div>';
  });
  html+='</div></div>';
  panel.innerHTML=html;
}
let _userPermUnsub=null;
function _startUserPermListener(uid){
  if(_userPermUnsub){try{_userPermUnsub();}catch(_){}}
  _userPermUnsub=db.collection('users').doc(uid).onSnapshot(function(snap){
    if(!snap.exists)return;
    const d=snap.data();
    if(window._fbUser)window._fbUser.blockedModes=d.blockedModes||[];
    applyUserPermissions(d);
  },function(e){console.warn('permListener:',e);});
}

function applyUserPermissions(userData){
  if(userData?.status==='suspended'){
    auth.signOut().then(()=>{
      showToast('⛔ Sua conta foi suspensa.','error');
      if(typeof showLanding==='function') showLanding();
    });
    return;
  }
  const blocked=userData?.blockedModes||[];
  ['conversa','viagem','reuniao','escuta','aprendizagem'].forEach(mode=>{
    const card=document.getElementById('mbtn-'+mode);
    const side=mode==='escuta'?document.getElementById('snav-escuta'):mode==='aprendizagem'?document.getElementById('snav-learn'):null;
    if(blocked.includes(mode)){
      if(card)card.style.display='none';
      if(side)side.style.display='none';
    }else{
      if(card)card.style.display='';
      if(side)side.style.display='';
    }
  });
}
// ── Liga modo vídeo (UI + inicia WebRTC como initiator) ─────────
async function _salaIniciarVideoChamada(){
  if(!_salaConnected){ showToast('Aguarde o outro participante entrar','info'); return; }
  if(_salaVideoMode||_salaPC){ return; }
  _salaIsInitiator = true;
  await _salaIniciarWebRTC();
}

// ── Função principal: cria PeerConnection, captura mídia ────────
async function _salaIniciarWebRTC(){
  if(_salaPC){ return; } // já está rodando

  // 1) Pede câmera + mic
  let stream = null;
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width:{ideal:640}, height:{ideal:480}, facingMode:'user' },
      audio: { echoCancellation:true, noiseSuppression:true, autoGainControl:true }
    });
  }catch(e){
    // Tenta só áudio
    try{
      stream = await navigator.mediaDevices.getUserMedia({ video:false, audio:{echoCancellation:true,noiseSuppression:true} });
      showToast('⚠️ Câmera negada — entrando só com áudio','info');
    }catch(e2){
      showToast('❌ Permissão negada — vídeo chamada cancelada','error');
      _salaIsInitiator=false;
      return;
    }
  }
  _salaLocalStream = stream;
  _salaVideoAtivo  = stream.getVideoTracks().some(t=>t.enabled);
  _salaAudioMuted  = false;

  // 2) Mostra UI de vídeo
  _salaMostrarUIVideo(true);

  // 3) Liga vídeo local no <video>
  const localVideo = document.getElementById('sala-video-local');
  if(localVideo){ localVideo.srcObject = stream; }

  // 4) Cria RTCPeerConnection
  try{
    _salaPC = new RTCPeerConnection(SALA_RTC_CONFIG);
  }catch(e){
    showToast('❌ Navegador não suporta WebRTC','error');
    _salaEncerrarWebRTC();
    return;
  }

  // 5) Adiciona tracks locais
  stream.getTracks().forEach(t => _salaPC.addTrack(t, stream));

  // 6) Recebe stream remoto
  _salaRemoteStream = new MediaStream();
  _salaPC.ontrack = (ev)=>{
    ev.streams[0]?.getTracks().forEach(t=>_salaRemoteStream.addTrack(t));
    const remoteVideo = document.getElementById('sala-video-remote');
    const remoteOff   = document.getElementById('sala-video-remote-off');
    if(remoteVideo){ remoteVideo.srcObject = _salaRemoteStream; }
    if(remoteOff)  { remoteOff.style.display='none'; }
  };

  // 7) Envia ICE candidates pro outro
  _salaPC.onicecandidate = (ev)=>{
    if(ev.candidate && _salaSocket && _salaCode){
      _salaSocket.emit('webrtc-ice',{ code:_salaCode, candidate:ev.candidate });
    }
  };

  // 8) Monitora estado da conexão
  _salaPC.onconnectionstatechange = ()=>{
    const s = _salaPC?.connectionState;
    console.log('[WebRTC] connectionState:', s);
    if(s==='failed'||s==='disconnected'){
      showToast('⚠️ Conexão de vídeo perdida','error');
      _salaEncerrarWebRTC();
    }
  };

  // 9) Se for o initiator, cria offer e envia
  if(_salaIsInitiator){
    try{
      const offer = await _salaPC.createOffer({ offerToReceiveAudio:true, offerToReceiveVideo:true });
      await _salaPC.setLocalDescription(offer);
      _salaSocket?.emit('webrtc-offer', { code:_salaCode, offer });
      console.log('[WebRTC] offer enviada');
    }catch(e){
      console.error('[WebRTC] erro createOffer:', e);
      showToast('❌ Erro ao iniciar vídeo: '+e.message,'error');
      _salaEncerrarWebRTC();
    }
  }
  _salaVideoMode = true;
}

// ── Recebeu offer do outro: vira receiver, cria answer ──────────
async function _salaHandleOffer({ offer }){
  if(!offer) return;
  // Se ainda não inicializou WebRTC (não estava no modo vídeo), inicializa como receiver
  if(!_salaPC){
    _salaIsInitiator = false;
    await _salaIniciarWebRTC(); // captura mídia e cria PC
    if(!_salaPC) return; // usuário negou permissão
  }
  try{
    await _salaPC.setRemoteDescription(new RTCSessionDescription(offer));
    // Aplica ICE candidates pendentes
    while(_salaPendingIce.length){
      try{ await _salaPC.addIceCandidate(new RTCIceCandidate(_salaPendingIce.shift())); }catch(e){}
    }
    const answer = await _salaPC.createAnswer();
    await _salaPC.setLocalDescription(answer);
    _salaSocket?.emit('webrtc-answer', { code:_salaCode, answer });
    console.log('[WebRTC] answer enviada');
  }catch(e){
    console.error('[WebRTC] erro handleOffer:', e);
    showToast('❌ Erro na chamada de vídeo: '+e.message,'error');
    _salaEncerrarWebRTC();
  }
}

// ── Recebeu answer: seta como remote description ────────────────
async function _salaHandleAnswer({ answer }){
  if(!answer||!_salaPC) return;
  try{
    await _salaPC.setRemoteDescription(new RTCSessionDescription(answer));
    while(_salaPendingIce.length){
      try{ await _salaPC.addIceCandidate(new RTCIceCandidate(_salaPendingIce.shift())); }catch(e){}
    }
    console.log('[WebRTC] answer recebida — handshake completo');
  }catch(e){
    console.error('[WebRTC] erro handleAnswer:', e);
  }
}

// ── Recebeu ICE candidate ───────────────────────────────────────
function _salaHandleIce({ candidate }){
  if(!candidate) return;
  if(!_salaPC || !_salaPC.remoteDescription){
    _salaPendingIce.push(candidate);
    return;
  }
  _salaPC.addIceCandidate(new RTCIceCandidate(candidate)).catch(e=>{
    console.warn('[WebRTC] addIceCandidate falhou:', e?.message);
  });
}

// ── Toggle câmera (liga/desliga track de vídeo local) ───────────
function _salaToggleCam(){
  if(!_salaLocalStream) return;
  const tracks = _salaLocalStream.getVideoTracks();
  if(!tracks.length){ showToast('Sem câmera disponível','info'); return; }
  _salaVideoAtivo = !_salaVideoAtivo;
  tracks.forEach(t=>{ t.enabled = _salaVideoAtivo; });
  const btn = document.getElementById('sala-cam-btn');
  if(btn){
    btn.classList.toggle('active', !_salaVideoAtivo);
    btn.textContent = _salaVideoAtivo ? '📹' : '📷';
    btn.title = _salaVideoAtivo ? 'Desligar câmera' : 'Ligar câmera';
  }
}

// ── Toggle microfone (mic do WebRTC, não da tradução) ───────────
function _salaToggleMic(){
  if(!_salaLocalStream) return;
  const tracks = _salaLocalStream.getAudioTracks();
  if(!tracks.length) return;
  _salaAudioMuted = !_salaAudioMuted;
  tracks.forEach(t=>{ t.enabled = !_salaAudioMuted; });
  const btn = document.getElementById('sala-mic-btn');
  if(btn){
    btn.classList.toggle('active', _salaAudioMuted);
    btn.textContent = _salaAudioMuted ? '🔇' : '🎤';
    btn.title = _salaAudioMuted ? 'Desmutar mic' : 'Mutar mic';
  }
}

// ── Sair do modo vídeo (volta para layout só texto) ─────────────
function _salaSairDoVideo(){
  if(_salaSocket && _salaCode && _salaPC){
    try{ _salaSocket.emit('webrtc-hangup',{code:_salaCode}); }catch(e){}
  }
  _salaEncerrarWebRTC();
  showToast('📵 Vídeo encerrado — modo só texto','info');
}

// ── Encerra WebRTC: para tracks, fecha PC, limpa UI ─────────────
function _salaEncerrarWebRTC(){
  // Para todos os tracks locais
  try{ _salaLocalStream?.getTracks().forEach(t=>t.stop()); }catch(e){}
  _salaLocalStream = null;
  _salaRemoteStream = null;
  // Fecha PeerConnection
  try{
    if(_salaPC){
      _salaPC.ontrack = null;
      _salaPC.onicecandidate = null;
      _salaPC.onconnectionstatechange = null;
      _salaPC.close();
    }
  }catch(e){}
  _salaPC = null;
  _salaPendingIce = [];
  _salaIsInitiator = false;
  _salaVideoAtivo = false;
  _salaAudioMuted = false;
  _salaVideoMode = false;
  // Limpa elementos de vídeo
  const lv=document.getElementById('sala-video-local');
  const rv=document.getElementById('sala-video-remote');
  if(lv){ try{lv.srcObject=null;}catch(e){} }
  if(rv){ try{rv.srcObject=null;}catch(e){} }
  // Esconde UI de vídeo
  _salaMostrarUIVideo(false);
}

// ── Mostra/esconde UI do modo vídeo ─────────────────────────────
function _salaMostrarUIVideo(show){
  const vwrap = document.getElementById('sala-video-wrap');
  const vctrls= document.getElementById('sala-video-ctrls');
  const tpanel= document.getElementById('sala-text-panel');
  const lastTr= document.getElementById('sala-last-trans');
  const vbtn  = document.getElementById('sala-iniciar-video-btn');
  if(show){
    if(vwrap) vwrap.style.display='block';
    if(vctrls)vctrls.style.display='flex';
    if(lastTr)lastTr.style.display='flex';
    if(tpanel)tpanel.style.display='none';
    if(vbtn)  vbtn.style.display='none';
    // Reset visual dos botões
    const cbtn=document.getElementById('sala-cam-btn');
    const mbtn=document.getElementById('sala-mic-btn');
    if(cbtn){ cbtn.classList.remove('active'); cbtn.textContent='📹'; }
    if(mbtn){ mbtn.classList.remove('active'); mbtn.textContent='🎤'; }
    // Atualiza overlay nome/idioma
    const rNome=document.getElementById('sala-video-remote-nome');
    const rLang=document.getElementById('sala-video-remote-lang');
    const lLang=document.getElementById('sala-video-local-lang');
    if(rNome)rNome.textContent=_salaTheirName||'Participante';
    if(rLang)rLang.textContent=_salaTheirLang||'EN-US';
    if(lLang)lLang.textContent=_salaMyLang||'PT-BR';
  }else{
    if(vwrap) vwrap.style.display='none';
    if(vctrls)vctrls.style.display='none';
    if(lastTr)lastTr.style.display='none';
    if(tpanel)tpanel.style.display='flex';
    if(vbtn)  vbtn.style.display=_salaConnected?'inline-block':'none';
    // Mostra placeholder "aguardando vídeo"
    const remoteOff = document.getElementById('sala-video-remote-off');
    if(remoteOff) remoteOff.style.display='flex';
  }
}

