const LICOES_DATA = {
  inglês: [
    { cat:'🟢 Iniciante', itens:[
      { id:'en-cumprimentos', icon:'👋', nome:'Cumprimentos', desc:'Hello, Good morning, How are you...', frases:[
        {orig:'Hello!', trans:'Olá!', pron:'heh-LOH'},
        {orig:'Good morning!', trans:'Bom dia!', pron:'gud MOR-ning'},
        {orig:'Good afternoon!', trans:'Boa tarde!', pron:'gud af-ter-NOON'},
        {orig:'Good night!', trans:'Boa noite!', pron:'gud NAYT'},
        {orig:'How are you?', trans:'Como você está?', pron:'hau ar YU'},
        {orig:"I'm fine, thank you!", trans:'Estou bem, obrigado!', pron:'aym fayn, THANK yu'},
        {orig:"What's your name?", trans:'Qual é o seu nome?', pron:'wats yor neym'},
        {orig:'My name is...', trans:'Meu nome é...', pron:'may neym iz'},
        {orig:'Nice to meet you!', trans:'Prazer em conhecê-lo!', pron:'nays tu mit YU'},
        {orig:'Goodbye!', trans:'Tchau!', pron:'gud-BAY'}
      ]},
      { id:'en-numeros', icon:'🔢', nome:'Números', desc:'1 a 100 — one, two, three...', frases:[
        {orig:'One', trans:'Um', pron:'wan'},{orig:'Two', trans:'Dois', pron:'tu'},
        {orig:'Three', trans:'Três', pron:'thri'},{orig:'Four', trans:'Quatro', pron:'for'},
        {orig:'Five', trans:'Cinco', pron:'fayv'},{orig:'Ten', trans:'Dez', pron:'ten'},
        {orig:'Twenty', trans:'Vinte', pron:'TWEN-ti'},{orig:'Fifty', trans:'Cinquenta', pron:'FIF-ti'},
        {orig:'One hundred', trans:'Cem', pron:'wan HAN-dred'}
      ]},
      { id:'en-cores', icon:'🎨', nome:'Cores', desc:'Red, blue, green, yellow...', frases:[
        {orig:'Red', trans:'Vermelho', pron:'red'},{orig:'Blue', trans:'Azul', pron:'blu'},
        {orig:'Green', trans:'Verde', pron:'grin'},{orig:'Yellow', trans:'Amarelo', pron:'YEL-oh'},
        {orig:'Black', trans:'Preto', pron:'blak'},{orig:'White', trans:'Branco', pron:'wayt'},
        {orig:'Orange', trans:'Laranja', pron:'OR-inj'},{orig:'Pink', trans:'Rosa', pron:'pink'}
      ]},
      { id:'en-familia', icon:'👨‍👩‍👧', nome:'Família', desc:'Father, mother, brother...', frases:[
        {orig:'Father', trans:'Pai', pron:'FAH-ther'},{orig:'Mother', trans:'Mãe', pron:'MAH-ther'},
        {orig:'Brother', trans:'Irmão', pron:'BRAH-ther'},{orig:'Sister', trans:'Irmã', pron:'SIS-ter'},
        {orig:'Son', trans:'Filho', pron:'san'},{orig:'Daughter', trans:'Filha', pron:'DAW-ter'},
        {orig:'Grandfather', trans:'Avô', pron:'GRAND-fah-ther'},{orig:'Grandmother', trans:'Avó', pron:'GRAND-mah-ther'}
      ]}
    ]},
    { cat:'🔵 Intermediário', itens:[
      { id:'en-restaurante', icon:'🍽️', nome:'No restaurante', desc:'Pedir comida, pagar a conta', frases:[
        {orig:'A table for two, please.', trans:'Uma mesa para dois, por favor.', pron:'a TAY-bul for tu, pliz'},
        {orig:'Can I see the menu?', trans:'Posso ver o cardápio?', pron:'kan ay si da MEN-yu'},
        {orig:"I'd like to order...", trans:'Eu gostaria de pedir...', pron:'ayd layk tu OR-der'},
        {orig:'What do you recommend?', trans:'O que você recomenda?', pron:'wot du yu rek-ah-MEND'},
        {orig:'The bill, please.', trans:'A conta, por favor.', pron:'da bil, pliz'},
        {orig:'Is service included?', trans:'O serviço está incluído?', pron:'iz SER-vis in-KLUD-id'},
        {orig:'It was delicious!', trans:'Estava delicioso!', pron:'it woz da-LISH-us'}
      ]},
      { id:'en-viagem', icon:'✈️', nome:'Viagem', desc:'Aeroporto, hotel, direções', frases:[
        {orig:'Where is the airport?', trans:'Onde fica o aeroporto?', pron:'wer iz di ER-port'},
        {orig:'I have a reservation.', trans:'Tenho uma reserva.', pron:'ay hav a rez-er-VAY-shun'},
        {orig:'Can you help me?', trans:'Você pode me ajudar?', pron:'kan yu help mi'},
        {orig:'Turn left.', trans:'Vire à esquerda.', pron:'tern left'},
        {orig:'Turn right.', trans:'Vire à direita.', pron:'tern rayt'},
        {orig:'How much does it cost?', trans:'Quanto custa?', pron:'hau mach daz it kost'},
        {orig:"I'm lost.", trans:'Estou perdido.', pron:'aym lost'}
      ]},
      { id:'en-negocios', icon:'💼', nome:'Negócios', desc:'Reuniões, apresentações, acordos', frases:[
        {orig:"Let's schedule a meeting.", trans:'Vamos agendar uma reunião.', pron:'lets SKED-yul a MIT-ing'},
        {orig:"I'd like to introduce myself.", trans:'Gostaria de me apresentar.', pron:'ayd layk tu in-tra-DYUS may-SELF'},
        {orig:'Could you send me the report?', trans:'Pode me enviar o relatório?', pron:'kud yu send mi da ri-PORT'},
        {orig:'We have a deal.', trans:'Temos um acordo.', pron:'wi hav a dil'},
        {orig:'Let me check my calendar.', trans:'Deixa eu verificar minha agenda.', pron:'let mi chek may KAL-en-dar'}
      ]}
    ]},
    { cat:'🔴 Avançado', itens:[
      { id:'en-expressoes', icon:'💡', nome:'Expressões idiomáticas', desc:'Break a leg, hit the nail...', frases:[
        {orig:'Break a leg!', trans:'Boa sorte!', pron:'brayk a leg'},
        {orig:'Hit the nail on the head.', trans:'Acertar em cheio.', pron:'hit da nayl on da hed'},
        {orig:"It's raining cats and dogs.", trans:'Está chovendo muito.', pron:'its RAY-ning kats and dogz'},
        {orig:'Once in a blue moon.', trans:'Raramente.', pron:'wans in a blu mun'},
        {orig:'Bite the bullet.', trans:'Encarar o problema.', pron:'bayt da BUL-it'},
        {orig:'The ball is in your court.', trans:'A decisão é sua.', pron:'da bol iz in yor kort'}
      ]}
    ]}
  ],
  espanhol: [
    { cat:'🟢 Iniciante', itens:[
      { id:'es-cumprimentos', icon:'👋', nome:'Saludos', desc:'Hola, Buenos días, Cómo estás...', frases:[
        {orig:'Hola!', trans:'Olá!', pron:'O-la'},{orig:'Buenos días', trans:'Bom dia', pron:'BWEH-nos DI-as'},
        {orig:'Buenas tardes', trans:'Boa tarde', pron:'BWEH-nas TAR-des'},
        {orig:'Buenas noches', trans:'Boa noite', pron:'BWEH-nas NO-ches'},
        {orig:'Como estás?', trans:'Como você está?', pron:'KO-mo es-TAS'},
        {orig:'Muy bien, gracias', trans:'Muito bem, obrigado', pron:'MWEE bien, GRA-sias'},
        {orig:'Me llamo...', trans:'Meu nome é...', pron:'me YA-mo'},
        {orig:'Mucho gusto!', trans:'Muito prazer!', pron:'MU-cho GUS-to'},
        {orig:'Adios!', trans:'Tchau!', pron:'a-DIOS'}
      ]},
      { id:'es-numeros', icon:'🔢', nome:'Números', desc:'Uno, dos, tres...', frases:[
        {orig:'Uno', trans:'Um', pron:'U-no'},{orig:'Dos', trans:'Dois', pron:'dos'},
        {orig:'Tres', trans:'Três', pron:'tres'},{orig:'Cuatro', trans:'Quatro', pron:'KWA-tro'},
        {orig:'Cinco', trans:'Cinco', pron:'SIN-ko'},{orig:'Diez', trans:'Dez', pron:'dyez'},
        {orig:'Veinte', trans:'Vinte', pron:'BAYN-te'},{orig:'Cien', trans:'Cem', pron:'syen'}
      ]}
    ]}
  ],
  francês: [
    { cat:'🟢 Iniciante', itens:[
      { id:'fr-cumprimentos', icon:'👋', nome:'Salutations', desc:'Bonjour, Bonsoir, Comment allez-vous...', frases:[
        {orig:'Bonjour!', trans:'Bom dia / Olá!', pron:'bon-ZHUR'},
        {orig:'Bonsoir!', trans:'Boa noite!', pron:'bon-SWAR'},
        {orig:'Comment allez-vous?', trans:'Como vai você?', pron:'ko-MON ta-lay-VU'},
        {orig:'Je m\u2019appelle...', trans:'Meu nome é...', pron:'zhe ma-PEL'},
        {orig:'Enchante!', trans:'Prazer!', pron:'on-shon-TAY'},
        {orig:'Au revoir!', trans:'Até logo!', pron:'o re-VWAR'},
        {orig:'Merci beaucoup!', trans:'Muito obrigado!', pron:'mer-SI bo-KU'},
        {orig:'S\u2019il vous plait', trans:'Por favor', pron:'sil vu PLAY'}
      ]}
    ]}
  ],
  alemão: [
    { cat:'🟢 Iniciante', itens:[
      { id:'de-cumprimentos', icon:'👋', nome:'Begrüßungen', desc:'Hallo, Guten Morgen, Wie geht es...', frases:[
        {orig:'Hallo!', trans:'Olá!', pron:'HA-lo'},
        {orig:'Guten Morgen!', trans:'Bom dia!', pron:'GU-ten MOR-gen'},
        {orig:'Guten Tag!', trans:'Boa tarde!', pron:'GU-ten tak'},
        {orig:'Guten Abend!', trans:'Boa noite!', pron:'GU-ten A-bent'},
        {orig:'Wie geht es Ihnen?', trans:'Como vai?', pron:'vi geit es I-nen'},
        {orig:'Ich heisse...', trans:'Meu nome é...', pron:'ich HAY-se'},
        {orig:'Schuess!', trans:'Tchau!', pron:'chüs'}
      ]}
    ]}
  ],
  italiano: [
    { cat:'🟢 Iniciante', itens:[
      { id:'it-cumprimentos', icon:'👋', nome:'Saluti', desc:'Ciao, Buongiorno, Come stai...', frases:[
        {orig:'Ciao!', trans:'Olá / Tchau!', pron:'CHAO'},
        {orig:'Buongiorno!', trans:'Bom dia!', pron:'bwon-JOR-no'},
        {orig:'Buonasera!', trans:'Boa noite!', pron:'bwon-a-SE-ra'},
        {orig:'Come stai?', trans:'Como vai?', pron:'KO-me STAI'},
        {orig:'Mi chiamo...', trans:'Meu nome é...', pron:'mi KYA-mo'},
        {orig:'Piacere!', trans:'Prazer!', pron:'pya-CHE-re'},
        {orig:'Grazie mille!', trans:'Muito obrigado!', pron:'GRA-tsye MIL-le'}
      ]}
    ]}
  ],
  japonês: [
    { cat:'🟢 Iniciante', itens:[
      { id:'ja-cumprimentos', icon:'👋', nome:'Saudações (あいさつ)', desc:'Ohayou, Konnichiwa, Arigatou...', frases:[
        {orig:'Ohayou gozaimasu', trans:'Bom dia (formal)', pron:'o-ha-YO go-ZAI-mas'},
        {orig:'Konnichiwa', trans:'Boa tarde / Olá', pron:'kon-ni-CHI-wa'},
        {orig:'Konbanwa', trans:'Boa noite', pron:'kon-BAN-wa'},
        {orig:'Arigatou gozaimasu', trans:'Muito obrigado', pron:'a-ri-GA-to go-ZAI-mas'},
        {orig:'Hajimemashite', trans:'Prazer em conhecê-lo', pron:'ha-ji-me-MA-shi-te'},
        {orig:'Watashi no namae wa...', trans:'Meu nome é...', pron:'wa-ta-shi no na-ma-e wa'},
        {orig:'Sayounara', trans:'Até logo', pron:'sa-yo-NA-ra'}
      ]}
    ]}
  ]
};

// ── Aba principal ─────────────────────────────────────────────
function learnTab(tab, el) {
  document.querySelectorAll('.learn-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.learn-tab-panel').forEach(p=>p.classList.remove('active'));
  if(el) el.classList.add('active');
  const panel = document.getElementById('ltp-'+tab);
  if(panel) panel.classList.add('active');
  if(tab==='licoes') renderLicoes();
  if(tab==='flash') renderFlash();
  if(tab==='exer') renderExer();
  if(tab==='vocab') renderVocab();
  if(tab==='professor') typeof profIA_onTabOpen === 'function' && profIA_onTabOpen();
}

// ══════════════════════════════════════════════════════════════
// 🎮 GAMIFICAÇÃO COMPLETA — Streak, XP, Nível, Missões, Badges
// ══════════════════════════════════════════════════════════════

// ── Definições ─────────────────────────────────────────────────
const GAMIF_LEVELS = [
  {min:0,    max:99,   label:'🌱 Iniciante',   color:'#64748b'},
  {min:100,  max:299,  label:'🔵 Aprendiz',    color:'#3b82f6'},
  {min:300,  max:599,  label:'🟢 Estudante',   color:'#22c55e'},
  {min:600,  max:999,  label:'🟡 Praticante',  color:'#eab308'},
  {min:1000, max:1799, label:'🟠 Fluente',     color:'#f97316'},
  {min:1800, max:2999, label:'🔴 Avançado',    color:'#ef4444'},
  {min:3000, max:4999, label:'🟣 Expert',      color:'#a855f7'},
  {min:5000, max:Infinity, label:'💎 Mestre',  color:'#00e5ff'},
];

const GAMIF_BADGES = [
  // Streak
  {id:'streak3',    icon:'🔥', name:'Em Chamas',      desc:'3 dias seguidos',        cat:'streak',   check:g=>g.streakDays>=3},
  {id:'streak7',    icon:'🔥', name:'Semana Perfeita', desc:'7 dias seguidos',        cat:'streak',   check:g=>g.streakDays>=7},
  {id:'streak30',   icon:'🔥', name:'Mês de Fogo',    desc:'30 dias seguidos',       cat:'streak',   check:g=>g.streakDays>=30},
  // XP
  {id:'xp100',      icon:'⭐', name:'Primeiro Passo', desc:'100 pontos conquistados', cat:'xp',      check:g=>g.xp>=100},
  {id:'xp500',      icon:'⭐', name:'Dedicado',       desc:'500 pontos',              cat:'xp',      check:g=>g.xp>=500},
  {id:'xp1000',     icon:'💫', name:'Mil Pontos',     desc:'1.000 pontos',            cat:'xp',      check:g=>g.xp>=1000},
  {id:'xp5000',     icon:'💎', name:'Elite',          desc:'5.000 pontos',            cat:'xp',      check:g=>g.xp>=5000},
  // Missões
  {id:'miss5',      icon:'📋', name:'Missão Aceita',  desc:'5 missões completas',    cat:'missoes',  check:g=>g.totalMissoes>=5},
  {id:'miss20',     icon:'📋', name:'Caçador',        desc:'20 missões completas',   cat:'missoes',  check:g=>g.totalMissoes>=20},
  {id:'miss100',    icon:'🏆', name:'Lendário',       desc:'100 missões completas',  cat:'missoes',  check:g=>g.totalMissoes>=100},
  // Atividades
  {id:'flash10',    icon:'🃏', name:'Virador de Cartas','desc':'10 flashcards ok',   cat:'learn',    check:g=>g.flashOk>=10},
  {id:'flash50',    icon:'🃏', name:'Mestre dos Cards', desc:'50 flashcards ok',     cat:'learn',    check:g=>g.flashOk>=50},
  {id:'prof10',     icon:'🎓', name:'Aluno Aplicado',  desc:'10 msgs ao professor',  cat:'learn',    check:g=>g.profMsgs>=10},
  {id:'licao5',     icon:'📚', name:'Curioso',         desc:'5 lições concluídas',   cat:'learn',    check:g=>g.licoesOk>=5},
  {id:'licao20',    icon:'📚', name:'Estudioso',       desc:'20 lições concluídas',  cat:'learn',    check:g=>g.licoesOk>=20},
  {id:'pronun10',   icon:'🎙️', name:'Boa Voz',         desc:'10 avaliações de pronúncia', cat:'learn', check:g=>g.pronunOk>=10},
  {id:'shadow10',   icon:'🗣️', name:'Sombra',          desc:'10 shadowings feitos',  cat:'learn',    check:g=>g.shadowOk>=10},
  {id:'diario5',    icon:'📔', name:'Escritor',        desc:'5 entradas no diário',  cat:'learn',    check:g=>g.diarioOk>=5},
  {id:'social1',    icon:'👥', name:'Social',          desc:'Fez 1 chamada de voz',  cat:'social',   check:g=>g.chamadas>=1},
  {id:'amigo1',     icon:'🤝', name:'Primeiro Amigo',  desc:'1 amigo adicionado',    cat:'social',   check:g=>g.amigos>=1},
];

const DAILY_MISSIONS_POOL = [
  {id:'m_flash5',   icon:'🃏', name:'Virar 5 flashcards',        xp:20,  target:'flashOk',  need:5},
  {id:'m_prof3',    icon:'🎓', name:'3 mensagens ao professor',   xp:15,  target:'profMsgs', need:3},
  {id:'m_licao1',   icon:'📚', name:'Concluir 1 lição',          xp:30,  target:'licoesOk', need:1},
  {id:'m_pronun3',  icon:'🎙️', name:'3 avaliações de pronúncia', xp:25,  target:'pronunOk', need:3},
  {id:'m_shadow3',  icon:'🗣️', name:'3 shadowings',              xp:25,  target:'shadowOk', need:3},
  {id:'m_diario1',  icon:'📔', name:'Escrever no diário',         xp:20,  target:'diarioOk', need:1},
  {id:'m_vocab3',   icon:'📖', name:'Salvar 3 palavras',          xp:15,  target:'vocabSave', need:3},
  {id:'m_exer5',    icon:'✏️', name:'5 exercícios certos',       xp:20,  target:'exerOk',   need:5},
];

// ── Estado global gamif ─────────────────────────────────────────
let _gamif = {
  xp:0, streakDays:0, streakMax:0, lastDay:'',
  flashOk:0, profMsgs:0, licoesOk:0, pronunOk:0, shadowOk:0,
  diarioOk:0, vocabSave:0, exerOk:0, chamadas:0, amigos:0,
  totalMissoes:0, badges:[],
  dailyMissions:[], dailyDate:'', dailyProgress:{},
};
let _gamifLoaded = false;
let _gamifCurrentTab = 'missoes';

// ── Carregar do Firestore ───────────────────────────────────────
async function loadStreak() {
  const uid = window._fbUser?.uid; if(!uid) return;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now()-86400000).toDateString();
  // Tenta carregar do Firestore, com fallback para localStorage
  try {
    if(db) {
      const doc = await db.collection('users').doc(uid).collection('gamif').doc('data').get();
      if(doc.exists) { _gamif = {..._gamif, ...doc.data()}; }
    } else { throw new Error('db indisponível'); }
  } catch(e){
    // Firebase sem permissão ou offline — carrega do localStorage
    try {
      const local = JSON.parse(localStorage.getItem('aivox_gamif_'+uid)||'{}');
      if(Object.keys(local).length) _gamif = {..._gamif, ...local};
    } catch(_){}
  }
  _gamifLoaded = true;
  // Streak logic
  if(_gamif.lastDay !== today) {
    if(_gamif.lastDay === yesterday) { _gamif.streakDays++; }
    else if(_gamif.lastDay) { _gamif.streakDays=1; }
    else { _gamif.streakDays=1; }
    _gamif.lastDay = today;
    if(_gamif.streakDays > (_gamif.streakMax||0)) _gamif.streakMax=_gamif.streakDays;
    _gamifSave();
  }
  // Daily missions: regenerate if new day
  if(_gamif.dailyDate !== today) {
    _gamif.dailyDate = today;
    _gamif.dailyProgress = {};
    const pool = [...DAILY_MISSIONS_POOL].sort(()=>Math.random()-.5).slice(0,3);
    _gamif.dailyMissions = pool.map(m=>({...m, done:false}));
    _gamifSave();
  }
  _streakDays = _gamif.streakDays;
  _streakPts  = _gamif.xp;
  updateStreakUI();
  // Aviso de streak em risco: se já é fim de dia e ainda não praticou hoje
  const hour = new Date().getHours();
  if(hour >= 20 && _gamif.streakDays > 2 && _gamif.lastDay !== today) {
    setTimeout(()=>{
      _gamifToast('⚠️ Seu streak de '+_gamif.streakDays+'🔥 dias está em risco! Pratique agora!','#f97316');
    }, 3000);
  }
}

async function _gamifSave() {
  const uid = window._fbUser?.uid; if(!uid) return;
  // Sempre salva no localStorage como backup
  try { localStorage.setItem('aivox_gamif_'+uid, JSON.stringify(_gamif)); } catch(_){}
  // Tenta salvar no Firestore silenciosamente
  if(!db) return;
  try {
    await db.collection('users').doc(uid).collection('gamif').doc('data').set(_gamif);
  } catch(e){ /* Permissão negada ou offline — localStorage já garantiu a persistência */ }
}

// ── Adicionar XP e verificar missões/badges ─────────────────────
function addPts(n, action) {
  _gamif.xp += n;
  _streakPts = _gamif.xp;
  // Incrementa contador da ação
  if(action && _gamif.hasOwnProperty(action)) {
    _gamif[action] = (_gamif[action]||0) + 1;
  }
  // Verifica missões diárias
  if(action && _gamif.dailyMissions) {
    _gamif.dailyMissions.forEach(m => {
      if(m.done) return;
      if(m.target === action) {
        _gamif.dailyProgress[m.id] = (_gamif.dailyProgress[m.id]||0)+1;
        if(_gamif.dailyProgress[m.id] >= m.need) {
          m.done = true;
          _gamif.totalMissoes = (_gamif.totalMissoes||0)+1;
          _gamif.xp += m.xp;
          _streakPts = _gamif.xp;
          _gamifToast('🎯 Missão concluída: '+m.name+' +'+m.xp+' XP!','#a855f7');
        }
      }
    });
  }
  // Verifica badges
  const novosBadges = [];
  GAMIF_BADGES.forEach(b => {
    if(!_gamif.badges.includes(b.id) && b.check(_gamif)) {
      _gamif.badges.push(b.id);
      novosBadges.push(b);
    }
  });
  if(novosBadges.length) {
    setTimeout(()=>{ novosBadges.forEach(b=>_gamifToast('🏅 Badge desbloqueado: '+b.icon+' '+b.name,'#ffd000')); },500);
  }
  updateStreakUI();
  _gamifSave();
  _gamifPublishLeaderboard();
}
function _gamifToast(msg, color) {
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#1a1f2e;border:1.5px solid '+color+';color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:700;z-index:999999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5);';
  t.textContent=msg; document.body.appendChild(t);
  setTimeout(()=>t.remove(),3500);
}

// ── UI Streak bar ───────────────────────────────────────────────
function updateStreakUI() {
  const sn=document.getElementById('streak-num'), sp=document.getElementById('streak-pts'), lv=document.getElementById('gamif-xp-level');
  if(sn) sn.textContent=_gamif.streakDays||_streakDays||0;
  if(sp) sp.textContent=(_gamif.xp||_streakPts||0)+' XP';
  if(lv) {
    const lvl = _gamifGetLevel();
    lv.textContent='Nv.'+(_gamifGetLevelNum()+1);
    lv.style.color=lvl.color;
  }
}

function _gamifGetLevelNum() {
  const xp=_gamif.xp||0;
  for(let i=GAMIF_LEVELS.length-1;i>=0;i--){ if(xp>=GAMIF_LEVELS[i].min) return i; }
  return 0;
}
function _gamifGetLevel() { return GAMIF_LEVELS[_gamifGetLevelNum()]; }

// ── Modal ───────────────────────────────────────────────────────
function gamifOpenModal() {
  const m=document.getElementById('gamif-modal'); if(m) m.style.display='block';
  gamifTab('missoes', document.getElementById('gtab-missoes'));
}
function gamifCloseModal() {
  const m=document.getElementById('gamif-modal'); if(m) m.style.display='none';
}
function gamifTab(tab, btn) {
  _gamifCurrentTab=tab;
  document.querySelectorAll('#gamif-modal button[id^="gtab-"]').forEach(b=>{
    b.style.color='var(--muted)'; b.style.borderBottom='2px solid transparent';
  });
  if(btn){ btn.style.color='var(--accent)'; btn.style.borderBottom='2px solid var(--accent)'; }
  const c=document.getElementById('gamif-content'); if(!c) return;
  if(tab==='missoes')    c.innerHTML=_gamifRenderMissoes();
  if(tab==='conquistas') c.innerHTML=_gamifRenderConquistas();
  if(tab==='nivel')      c.innerHTML=_gamifRenderNivel();
  if(tab==='ranking')    { c.innerHTML=_gamifRenderRankingLoading(); _gamifLoadRanking(); }
}

function _gamifRenderMissoes() {
  const missions = _gamif.dailyMissions||[];
  const today = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});
  let html = '<div style="font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:14px;">📅 '+today+'</div>';
  html += '<div style="font-size:12px;color:var(--muted);margin-bottom:16px;">Complete as missões diárias para ganhar XP bônus!</div>';
  // Se não carregou ainda, gera missões locais temporárias
  const activeMissions = missions.length ? missions : (() => {
    const pool = [...DAILY_MISSIONS_POOL].sort(()=>Math.random()-.5).slice(0,3);
    return pool.map(m=>({...m, done:false}));
  })();
  activeMissions.forEach(m=>{
    const prog = _gamif.dailyProgress[m.id]||0;
    const pct = Math.min(100, Math.round((prog/m.need)*100));
    const done = m.done;
    html+=`<div style="background:${done?'rgba(0,255,136,.06)':'var(--surface)'};border:1.5px solid ${done?'rgba(0,255,136,.3)':'var(--border)'};border-radius:14px;padding:14px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="font-size:22px;">${m.icon}</span>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;color:${done?'var(--green)':'var(--text)'};">${m.name}</div>
          <div style="font-size:11px;color:var(--muted);">+${m.xp} XP de bônus</div>
        </div>
        <span style="font-size:12px;font-weight:800;font-family:var(--mono);color:${done?'var(--green)':'var(--muted)'};">${done?'✅ FEITO':(prog+'/'+m.need)}</span>
      </div>
      <div style="background:var(--border);border-radius:20px;height:6px;overflow:hidden;">
        <div style="background:${done?'var(--green)':'var(--accent)'};height:100%;width:${pct}%;border-radius:20px;transition:width .4s;"></div>
      </div>
    </div>`;
  });
  const feitas = activeMissions.filter(m=>m.done).length;
  html+=`<div style="margin-top:16px;background:rgba(168,85,247,.08);border:1px solid rgba(168,85,247,.25);border-radius:14px;padding:14px;text-align:center;">
    <div style="font-size:24px;margin-bottom:4px;">${feitas===3?'🎉':'⚡'}</div>
    <div style="font-size:13px;font-weight:700;color:#a855f7;">${feitas}/3 missões hoje</div>
    <div style="font-size:11px;color:var(--muted);margin-top:4px;">${feitas===3?'Parabéns! Volte amanhã para novas missões!':'Continue praticando para completar todas!'}</div>
  </div>`;
  return html;
}

function _gamifRenderConquistas() {
  const earned = _gamif.badges||[];
  const cats = {streak:'🔥 Sequência',xp:'⭐ Pontuação',missoes:'📋 Missões',learn:'📚 Aprendizagem',social:'👥 Social'};
  let html='<div style="font-size:11px;color:var(--muted);margin-bottom:16px;">'+earned.length+'/'+GAMIF_BADGES.length+' conquistas desbloqueadas</div>';
  Object.entries(cats).forEach(([cat,catLabel])=>{
    const catBadges=GAMIF_BADGES.filter(b=>b.cat===cat);
    html+=`<div style="font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin:14px 0 8px;">${catLabel}</div>`;
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';
    catBadges.forEach(b=>{
      const has=earned.includes(b.id);
      html+=`<div style="background:${has?'rgba(255,208,0,.06)':'var(--surface)'};border:1.5px solid ${has?'rgba(255,208,0,.3)':'var(--border)'};border-radius:12px;padding:12px;opacity:${has?'1':'.5'};">
        <div style="font-size:22px;margin-bottom:4px;">${has?b.icon:'🔒'}</div>
        <div style="font-size:12px;font-weight:700;color:${has?'#ffd000':'var(--muted)'};">${b.name}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:2px;">${b.desc}</div>
      </div>`;
    });
    html+='</div>';
  });
  return html;
}

function _gamifRenderNivel() {
  const xp=_gamif.xp||0;
  const lvNum=_gamifGetLevelNum();
  const lv=GAMIF_LEVELS[lvNum];
  const nextLv=GAMIF_LEVELS[lvNum+1];
  const pct=nextLv?Math.round(((xp-lv.min)/(nextLv.min-lv.min))*100):100;
  const streak=_gamif.streakDays||0;
  const streakMax=_gamif.streakMax||streak;
  return `
  <div style="text-align:center;padding:10px 0 20px;">
    <div style="font-size:48px;margin-bottom:8px;">${lv.label.split(' ')[0]}</div>
    <div style="font-size:20px;font-weight:900;color:${lv.color};">${lv.label.split(' ').slice(1).join(' ')}</div>
    <div style="font-size:13px;color:var(--muted);margin-top:4px;">Nível ${lvNum+1} de ${GAMIF_LEVELS.length}</div>
  </div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-size:12px;color:var(--muted);">XP Total</span>
      <span style="font-size:14px;font-weight:800;font-family:var(--mono);color:${lv.color};">${xp.toLocaleString('pt-BR')} XP</span>
    </div>
    ${nextLv?`<div style="background:var(--border);border-radius:20px;height:8px;overflow:hidden;margin-bottom:6px;">
      <div style="background:${lv.color};height:100%;width:${pct}%;border-radius:20px;transition:width .5s;"></div>
    </div>
    <div style="font-size:10px;color:var(--muted);text-align:right;">${xp} / ${nextLv.min} XP → ${nextLv.label.split(' ').slice(1).join(' ')}</div>`:'<div style="font-size:12px;color:#ffd000;text-align:center;margin-top:4px;">🏆 Nível máximo atingido!</div>'}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center;">
      <div style="font-size:24px;">🔥</div>
      <div style="font-size:20px;font-weight:900;color:var(--yellow);font-family:var(--mono);">${streak}</div>
      <div style="font-size:11px;color:var(--muted);">dias seguidos</div>
    </div>
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;text-align:center;">
      <div style="font-size:24px;">🏆</div>
      <div style="font-size:20px;font-weight:900;color:var(--accent);font-family:var(--mono);">${streakMax}</div>
      <div style="font-size:11px;color:var(--muted);">recorde pessoal</div>
    </div>
  </div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px;">
    <div style="font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:12px;">📊 SUAS ESTATÍSTICAS</div>
    ${[
      ['🃏 Flashcards ok',_gamif.flashOk||0],
      ['🎓 Msgs ao professor',_gamif.profMsgs||0],
      ['📚 Lições concluídas',_gamif.licoesOk||0],
      ['🎙️ Pronúncias',_gamif.pronunOk||0],
      ['🗣️ Shadowings',_gamif.shadowOk||0],
      ['📔 Diário',_gamif.diarioOk||0],
      ['📋 Missões totais',_gamif.totalMissoes||0],
      ['🏅 Badges',(_gamif.badges||[]).length+'/'+GAMIF_BADGES.length],
    ].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04);">
      <span style="font-size:12px;color:var(--muted);">${l}</span>
      <span style="font-size:12px;font-weight:700;font-family:var(--mono);color:var(--text);">${v}</span>
    </div>`).join('')}
  </div>`;
}

// ── LEADERBOARD / RANKING ───────────────────────────────────────
function _gamifRenderRankingLoading() {
  return `<div style="text-align:center;padding:48px 0;">
    <div style="font-size:36px;margin-bottom:12px;animation:pulse 1.5s ease infinite;">🏆</div>
    <div style="font-size:13px;color:var(--muted);">Carregando ranking...</div>
  </div>`;
}

async function _gamifLoadRanking() {
  const uid = window._fbUser?.uid;
  const c = document.getElementById('gamif-content');
  if (!c) return;
  try {
    // Publica dados do usuário atual no leaderboard público
    if (uid && db) {
      const myName = window._fbUser?.displayName || window._fbUser?.email?.split('@')[0] || 'Usuário';
      const myLevel = GAMIF_LEVELS[_gamifGetLevelNum()].label.split(' ').slice(1).join(' ');
      await db.collection('leaderboard').doc(uid).set({
        uid, name: myName,
        xp: _gamif.xp || 0,
        streakDays: _gamif.streakDays || 0,
        badges: (_gamif.badges||[]).length,
        level: myLevel,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
    // Busca top 50 ordenado por XP
    const snap = await db.collection('leaderboard').orderBy('xp','desc').limit(50).get();
    const entries = [];
    snap.forEach(doc => entries.push(doc.data()));
    if (document.getElementById('gamif-content') === c) {
      c.innerHTML = _gamifRenderRankingHTML(entries, uid);
    }
  } catch(e) {
    console.warn('[LEADERBOARD]', e?.code || e);
    if (document.getElementById('gamif-content') === c) {
      c.innerHTML = `<div style="text-align:center;padding:40px 16px;">
        <div style="font-size:28px;margin-bottom:10px;">⚠️</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:8px;">Não foi possível carregar o ranking.</div>
        <div style="font-size:11px;color:var(--muted);opacity:.7;">Verifique as Firestore Rules:<br>
        <code style="background:var(--surface);padding:2px 6px;border-radius:5px;font-size:10px;">match /leaderboard/{uid} { allow read: if request.auth != null; allow write: if request.auth.uid == uid; }</code></div>
        <button onclick="gamifTab('ranking',document.getElementById('gtab-ranking'))" style="margin-top:14px;padding:8px 18px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;font-size:12px;font-weight:700;">🔄 Tentar novamente</button>
      </div>`;
    }
  }
}

function _gamifRenderRankingHTML(entries, myUid) {
  const medals = ['🥇','🥈','🥉'];
  let myPos = entries.findIndex(e => e.uid === myUid);
  let html = `<div style="font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">🏆 RANKING GLOBAL — XP TOTAL</div>`;
  if (myPos >= 0) {
    html += `<div style="font-size:12px;color:var(--accent);margin-bottom:14px;font-family:var(--mono);">Sua posição: <strong style="color:var(--accent);">#${myPos+1}</strong> de ${entries.length} ${entries.length===1?'usuário':'usuários'}</div>`;
  } else {
    html += `<div style="font-size:12px;color:var(--muted);margin-bottom:14px;">Continue praticando para aparecer no ranking! 🚀</div>`;
  }
  if (!entries.length) {
    return html + `<div style="text-align:center;padding:30px 0;color:var(--muted);">Nenhum dado ainda — você pode ser o primeiro! 🚀</div>`;
  }
  entries.forEach((e, i) => {
    const isMe = e.uid === myUid;
    const medal = i < 3
      ? `<span style="font-size:20px;">${medals[i]}</span>`
      : `<span style="font-size:12px;font-weight:800;font-family:var(--mono);color:var(--muted);width:20px;text-align:center;">#${i+1}</span>`;
    const xp = (e.xp||0).toLocaleString('pt-BR');
    const streak = e.streakDays || 0;
    const xpColor = i===0?'#ffd000':i===1?'#c0c0c0':i===2?'#cd7f32':'var(--text)';
    html += `<div style="background:${isMe?'rgba(0,229,255,.07)':'var(--surface)'};border:${isMe?'1.5px solid rgba(0,229,255,.4)':'1px solid var(--border)'};border-radius:13px;padding:10px 12px;margin-bottom:7px;display:flex;align-items:center;gap:10px;">
      <div style="width:24px;text-align:center;flex-shrink:0;">${medal}</div>
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;color:#000;">${(e.name||'?').charAt(0).toUpperCase()}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:700;color:${isMe?'var(--accent)':'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.name||'Usuário'}${isMe?' <span style="font-size:9px;background:var(--adim);color:var(--accent);padding:1px 5px;border-radius:5px;">VOCÊ</span>':''}</div>
        <div style="font-size:10px;color:var(--muted);margin-top:1px;">${e.level||'Iniciante'} · 🔥 ${streak} dias</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:14px;font-weight:900;font-family:var(--mono);color:${xpColor};">${xp}</div>
        <div style="font-size:9px;color:var(--muted);font-family:var(--mono);">XP</div>
      </div>
    </div>`;
  });
  html += `<div style="text-align:center;margin-top:10px;font-size:10px;color:var(--muted);font-family:var(--mono);">Atualizado em tempo real · Top 50 usuários</div>`;
  return html;
}

// Publicar no leaderboard a cada ganho de XP
async function _gamifPublishLeaderboard() {
  const uid = window._fbUser?.uid; if(!uid||!db) return;
  try {
    const myName = window._fbUser?.displayName || window._fbUser?.email?.split('@')[0] || 'Usuário';
    const myLevel = GAMIF_LEVELS[_gamifGetLevelNum()].label.split(' ').slice(1).join(' ');
    await db.collection('leaderboard').doc(uid).set({
      uid, name: myName,
      xp: _gamif.xp||0, streakDays: _gamif.streakDays||0,
      badges: (_gamif.badges||[]).length, level: myLevel,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch(e){ /* silencioso */ }
}

// ── PROFESSOR ─────────────────────────────────────────────────
function learnToggleVoice(){
  _learnVoice=!_learnVoice;
  const t=document.getElementById('learn-voice-toggle'),d=document.getElementById('learn-voice-dot'),l=document.getElementById('learn-voice-label');
  if(_learnVoice){
    if(t){t.style.borderColor='rgba(0,229,255,.35)';t.style.background='var(--adim)';t.style.color='var(--accent)';}
    if(d){d.style.background='var(--accent)';d.style.boxShadow='0 0 6px var(--accent)';}
    if(l)l.textContent='🔊 Resposta em voz (on)';
    showToast('🔊 Voz ativada','info');
  }else{
    if(t){t.style.borderColor='';t.style.background='var(--card)';t.style.color='var(--muted)';}
    if(d){d.style.background='var(--muted)';d.style.boxShadow='none';}
    if(l)l.textContent='🔇 Resposta em voz (off)';
  }
}
function setLearnLang(el){
  document.querySelectorAll('.learn-lang-strip .learn-lang-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active'); _learnLang=el.dataset.lang; _learnHistory=[];
  _learnAddBubble('ai','Agora aprendendo <strong>'+_learnLang+'</strong>. O que quer saber?');
}
function _learnAddBubble(type,html,speak){
  const bubs=document.getElementById('learn-bubs'); if(!bubs)return;
  const div=document.createElement('div'); div.className='learn-bubble '+type;
  if(type==='ai'){
    div.innerHTML='<div class="lb-label">🎓 PROFESSOR AIVOX</div>'+html+'<div class="lb-actions"><button class="lb-btn" onclick="_learnSpeak(this)">🔊 Ouvir</button><button class="lb-btn" onclick="_learnSave(this)">📖 Salvar</button></div>';
  }else{
    div.innerHTML='<div style="font-size:10px;color:var(--muted);margin-bottom:3px;">VOCÊ</div>'+html;
  }
  bubs.appendChild(div); bubs.scrollTop=bubs.scrollHeight;
  if(speak&&html&&_learnVoice)_speakTranslation(html.replace(/<[^>]*>/g,''));
}
function _learnSpeak(btn){
  const bub=btn.closest('.learn-bubble');
  const txt=(bub?bub.innerText:'').replace('PROFESSOR AIVOX','').replace('Ouvir','').replace('Salvar','').trim();
  if(txt)_speakTranslation(txt);
}
function _learnSave(btn){
  const bub=btn.closest('.learn-bubble');
  const lines=(bub?bub.innerText:'').split('\n').filter(l=>l.trim()&&!['PROFESSOR AIVOX','Ouvir','Salvar'].includes(l.trim()));
  const word=lines[0]?.trim(), trans=lines[1]?.trim()||'';
  if(!word){showToast('Não encontrei palavra para salvar','error');return;}
  saveVocabWord(word,trans,_learnLang);
}
function _learnShowThinking(){
  const bubs=document.getElementById('learn-bubs'); if(!bubs)return null;
  const div=document.createElement('div'); div.className='learn-bubble ai'; div.id='learn-thinking-bub';
  div.innerHTML='<div class="lb-label">🎓 PROFESSOR AIVOX</div><div class="learn-thinking"><span></span><span></span><span></span></div>';
  bubs.appendChild(div); bubs.scrollTop=bubs.scrollHeight; return div;
}
function learnToggleMic(){if(_learnListening)_learnStopMic();else _learnStartMic();}
function _learnStartMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){showToast('Seu navegador não suporta reconhecimento de voz','error');return;}
  let _got=false;
  _learnRecog=new SR(); _learnRecog.lang='pt-BR'; _learnRecog.continuous=false; _learnRecog.interimResults=false; _learnRecog.maxAlternatives=1;
  _learnRecog.onresult=(e)=>{_got=true;const t=e.results[0][0].transcript;if(t){_learnStopMic();learnAsk(t);}};
  _learnRecog.onerror=(e)=>{
    if(e.error==='not-allowed'||e.error==='permission-denied'){showToast('❌ Permissão de microfone negada','error');}
    else if(e.error!=='no-speech'&&e.error!=='aborted'){showToast('Erro de voz: '+e.error,'error');}
    _learnStopMic();
  };
  _learnRecog.onend=()=>{if(!_got)_learnStopMic();};
  try{
    _learnRecog.start(); _learnListening=true;
    const btn=document.getElementById('learn-mic-btn'),st=document.getElementById('learn-status');
    if(btn){btn.classList.add('listening');btn.textContent='⏹';}
    if(st)st.textContent='🔴 Ouvindo... fale agora';
  }catch(err){showToast('Erro ao iniciar microfone','error');_learnListening=false;}
}
function _learnStopMic(){
  _learnListening=false; try{_learnRecog?.stop();}catch(_){} _learnRecog=null;
  const btn=document.getElementById('learn-mic-btn'),st=document.getElementById('learn-status');
  if(btn){btn.classList.remove('listening');btn.textContent='🎤';}
  if(st)st.textContent='Toque para perguntar por voz';
}
function learnSendText(){
  const inp=document.getElementById('learn-text-input');
  if(!inp||!inp.value.trim())return; learnAsk(inp.value.trim()); inp.value='';
}
async function learnAsk(question){
  if(!question.trim())return;
  _learnAddBubble('user',question);
  _learnHistory.push({role:'user',content:question});
  const thinking=_learnShowThinking();
  const backendUrl=getBackendUrl();
  if(!backendUrl){if(thinking)thinking.remove();showToast('Backend não configurado','error');return;}
  try{
    const token=await getAuthToken();
    if(!token){if(thinking)thinking.remove();_learnAddBubble('ai','⚠️ Sessão expirada. Faça logout e login novamente.');return;}
    const r=await fetch(backendUrl+'/api/learn',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify({question,lang:_learnLang,history:_learnHistory.slice(-6)}),
      signal:AbortSignal.timeout(20000)
    });
    if(thinking)thinking.remove();
    if(!r.ok){
      const errData=await r.json().catch(()=>({}));
      const errMsg=errData.error||'Erro no servidor ('+r.status+')';
      if(r.status===500){
        _learnAddBubble('ai','⚠️ Erro 500: servidor retornou erro interno. Verifique AZURE_OAI_KEY no Render → Admin → APIs.');
      }else if(r.status===401||r.status===403){
        _learnAddBubble('ai','⚠️ Acesso negado. Faça logout e login novamente.');
      }else{
        _learnAddBubble('ai','⚠️ '+errMsg);
      }
      return;
    }
    const d=await r.json();
    if(d.answer){_learnHistory.push({role:'assistant',content:d.answer});_learnAddBubble('ai',d.answer,true);addPts(2,'profMsgs');}
    else{_learnAddBubble('ai','⚠️ Resposta vazia do servidor.');}
  }catch(e){
    if(thinking)thinking.remove();
    if(e.name==='TimeoutError'||e.name==='AbortError'){
      _learnAddBubble('ai','⚠️ Timeout: servidor demorou demais. Tente novamente.');
    }else{
      _learnAddBubble('ai','⚠️ Erro de conexão: '+e.message.slice(0,60));
    }
  }
}

// ── LIÇÕES ────────────────────────────────────────────────────
function setLicaoLang(el){
  document.querySelectorAll('#licoes-lang-bar .learn-lang-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active'); _licaoLang=el.dataset.lang; renderLicoes();
}
// Cache de lookup para abrir lição em O(1)
const _licaoIndex = {};
(function _buildLicaoIndex(){
  Object.entries(LICOES_DATA).forEach(([lang, grupos])=>{
    grupos.forEach(grupo=>{
      grupo.itens.forEach(l=>{ _licaoIndex[l.id]=l; });
    });
  });
})();

function renderLicoes(){
  const scroll=document.getElementById('licoes-scroll'); if(!scroll)return;
  const dados=LICOES_DATA[_licaoLang]||[];
  // Lê localStorage UMA vez só, fora do loop
  const conc=_getLicoesConcluidas();
  const concSet=new Set(conc);

  // Mostra skeletons imediatamente enquanto monta o DOM real
  scroll.innerHTML='<div class="licao-cat" style="background:var(--surface);border-radius:6px;height:12px;width:80px;margin:14px 0 12px;"></div>'
    +'<div class="skeleton" style="height:62px;border-radius:14px;margin-bottom:9px;"></div>'.repeat(4);

  // Monta o HTML real em microtask pra não travar o paint inicial
  requestAnimationFrame(()=>{
    let html='';
    dados.forEach(grupo=>{
      html+=`<div class="licao-cat">${grupo.cat}</div>`;
      grupo.itens.forEach(l=>{
        const ok=concSet.has(l.id);
        html+=`<div class="licao-card" onclick="openLicao('${l.id}')"><div class="licao-icon">${l.icon}</div><div class="licao-info"><div class="licao-nome">${l.nome}</div><div class="licao-desc">${l.desc}</div></div><div class="licao-badge ${ok?'ok':'novo'}">${ok?'✓ OK':'NOVO'}</div></div>`;
      });
    });
    if(!html) html='<div style="text-align:center;padding:40px;color:var(--muted);font-size:13px;">Mais lições em breve!</div>';
    scroll.innerHTML=html;
  });
}
function _getLicoesConcluidas(){
  try{return JSON.parse(localStorage.getItem('aivox_licoes_'+(window._fbUser?.uid||'x'))||'[]');}catch(e){return[];}
}
function _setLicaoConcluida(id){
  const key='aivox_licoes_'+(window._fbUser?.uid||'x');
  try{const arr=_getLicoesConcluidas();if(!arr.includes(id)){arr.push(id);localStorage.setItem(key,JSON.stringify(arr));}}catch(e){}
}
function openLicao(id){
  // Lookup O(1) — sem percorrer todos os idiomas
  const licao = _licaoIndex[id];
  if(!licao)return; _currentLicao=licao;
  document.getElementById('licao-modal-title').textContent=licao.icon+' '+licao.nome;
  document.getElementById('licao-modal-sub').textContent=licao.desc;
  let html=`<div style="font-size:12px;color:var(--muted);margin-bottom:12px;font-family:var(--mono);">${licao.frases.length} FRASES — toque em 🔊 para ouvir</div>`;
  licao.frases.forEach(f=>{
    const wo=f.orig.replace(/['"]/g,''); const wt=f.trans.replace(/['"]/g,'');
    html+=`<div class="licao-phrase"><div class="licao-phrase-orig">${f.orig}</div><div class="licao-phrase-trans">${f.trans}</div><div class="licao-phrase-pron">/${f.pron}/</div><div style="display:flex;gap:8px;margin-top:8px;"><button class="lb-btn" onclick="_speakTranslation(this.closest('.licao-phrase').querySelector('.licao-phrase-orig').textContent)" style="font-size:12px;">🔊 Ouvir</button><button class="lb-btn" onclick="saveVocabWord('${wo}','${wt}','${_licaoLang}')" style="font-size:12px;">📖 Salvar</button></div></div>`;
  });
  html+=`<button class="btn btn-primary btn-full" style="margin-top:8px;" onclick="concluirLicao('${id}')">✅ Marcar como concluída +10 pts</button>`;
  document.getElementById('licao-modal-body').innerHTML=html;
  document.getElementById('licao-modal').classList.add('sh');
}
function closeLicao(){document.getElementById('licao-modal').classList.remove('sh');}
function concluirLicao(id){
  _setLicaoConcluida(id); addPts(10,'licoesOk');
  showToast('🏆 Lição concluída! +10 pts','success');
  closeLicao(); renderLicoes();
}
function licaoAskProf(){
  if(!_currentLicao)return; closeLicao();
  learnTab('professor', document.querySelector('.learn-tab'));
  setTimeout(()=>learnAsk('Me explique mais sobre "'+_currentLicao.nome+'" em '+_licaoLang),300);
}

// ── FLASHCARDS ───────────────────────────────────────────────
function _buildLangBar(containerId, langVar, setter){
  const bar=document.getElementById(containerId); if(!bar||bar.innerHTML)return;
  const flags={'inglês':'<span class="flag-emoji">🇺🇸</span>','espanhol':'<span class="flag-emoji">🇪🇸</span>','francês':'<span class="flag-emoji">🇫🇷</span>','alemão':'<span class="flag-emoji">🇩🇪</span>','italiano':'<span class="flag-emoji">🇮🇹</span>','japonês':'<span class="flag-emoji">🇯🇵</span>'};
  Object.keys(flags).forEach((l,i)=>{
    const btn=document.createElement('div');
    btn.className='learn-lang-btn'+(i===0?' active':''); btn.dataset.lang=l;
    btn.innerHTML=flags[l]+' '+l[0].toUpperCase()+l.slice(1);
    btn.onclick=()=>{document.querySelectorAll('#'+containerId+' .learn-lang-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');setter(l);};
    bar.appendChild(btn);
  });
}
function renderFlash(){
  _buildLangBar('flash-lang-bar','_flashLang',(l)=>{_flashLang=l;buildFlashDeck();renderFlashCard();});
  buildFlashDeck(); renderFlashCard();
}
function buildFlashDeck(){
  _flashDeck=[..._vocabData.filter(v=>v.lang===_flashLang)].sort(()=>Math.random()-.5);
  _flashIdx=0; _flashOk=0; _flashNope=0; _flashFlipped=false;
}
function renderFlashCard(){
  const wrap=document.getElementById('flash-wrap'); if(!wrap)return;
  if(!_flashDeck.length){
    wrap.innerHTML='<div class="flash-empty"><div class="fe-icon">🃏</div><div style="font-size:14px;font-weight:700;margin-bottom:6px;">Nenhuma palavra ainda</div><div style="font-size:12px;">Salve palavras no Professor ou nas Lições</div></div>';
    return;
  }
  if(_flashIdx>=_flashDeck.length){
    const pct=Math.round(_flashOk/Math.max(_flashDeck.length,1)*100);
    wrap.innerHTML=`<div style="text-align:center;padding:20px 0;"><div style="font-size:44px;margin-bottom:10px;">🎉</div><div style="font-size:18px;font-weight:900;margin-bottom:4px;">Deck completo!</div><div style="font-size:13px;color:var(--muted);margin-bottom:18px;">✅ ${_flashOk} sabia · ❌ ${_flashNope} não sabia</div></div><div class="flash-stats"><div class="flash-stat"><div class="flash-stat-n" style="color:var(--green);">${_flashOk}</div><div class="flash-stat-l">Sabia</div></div><div class="flash-stat"><div class="flash-stat-n" style="color:var(--red);">${_flashNope}</div><div class="flash-stat-l">Não sabia</div></div><div class="flash-stat"><div class="flash-stat-n" style="color:var(--accent);">${pct}%</div><div class="flash-stat-l">Acerto</div></div></div><button class="btn btn-primary" style="margin-top:16px;width:100%;max-width:320px;" onclick="buildFlashDeck();renderFlashCard();">🔄 Reiniciar deck</button>`;
    addPts(5,'flashOk'); return;
  }
  const card=_flashDeck[_flashIdx];
  const wo=card.word.replace(/'/g,"\'");
  wrap.innerHTML=`<div class="flash-stats"><div class="flash-stat"><div class="flash-stat-n" style="color:var(--green);">${_flashOk}</div><div class="flash-stat-l">Sabia</div></div><div class="flash-stat"><div class="flash-stat-n" style="color:var(--red);">${_flashNope}</div><div class="flash-stat-l">Não sabia</div></div><div class="flash-stat"><div class="flash-stat-n">${_flashIdx+1}/${_flashDeck.length}</div><div class="flash-stat-l">Card</div></div></div><div class="flash-card-wrap"><div class="flash-card" id="flash-card-el" onclick="flipFlash()"><div class="flash-front"><div class="flash-word">${card.word}</div><div class="flash-hint">Toque para ver a tradução</div></div><div class="flash-back"><div class="flash-trans">${card.trans}</div></div></div></div><div class="flash-btns" id="flash-btns" style="display:none;"><button class="flash-btn nope" onclick="flashNope()">❌ Não sabia</button><button class="flash-btn got" onclick="flashGot()">✅ Sabia!</button></div><div class="flash-progress">Toque no card para revelar</div><button class="lb-btn" onclick="_speakTranslation('${wo}')" style="font-size:13px;margin-top:4px;">🔊 Ouvir pronúncia</button>`;
}
function flipFlash(){
  const c=document.getElementById('flash-card-el'), b=document.getElementById('flash-btns');
  _flashFlipped=!_flashFlipped;
  if(_flashFlipped){if(c)c.classList.add('flip');if(b)b.style.display='flex';}
  else{if(c)c.classList.remove('flip');if(b)b.style.display='none';}
}
function flashGot(){_flashOk++;addPts(3,'flashOk');_flashIdx++;_flashFlipped=false;renderFlashCard();}
function flashNope(){_flashNope++;_flashIdx++;_flashFlipped=false;renderFlashCard();}

// ── EXERCÍCIOS ───────────────────────────────────────────────
// ── VOCABULÁRIO ──────────────────────────────────────────────
function loadVocab(){
  try{_vocabData=JSON.parse(localStorage.getItem('aivox_vocab_'+(window._fbUser?.uid||'x'))||'[]');}catch(e){_vocabData=[];}
  _vocabFiltered=[..._vocabData];
}
function saveVocabWord(word,trans,lang){
  if(!word||!word.trim())return;
  loadVocab();
  if(_vocabData.find(v=>v.word.toLowerCase()===word.toLowerCase()&&v.lang===lang)){showToast('Palavra já está no vocabulário','info');return;}
  _vocabData.unshift({word:word.trim(),trans:(trans||'').trim(),lang:lang||_learnLang,savedAt:Date.now()});
  localStorage.setItem('aivox_vocab_'+(window._fbUser?.uid||'x'),JSON.stringify(_vocabData.slice(0,500)));
  _vocabFiltered=[..._vocabData];
  showToast('📖 "'+word+'" salvo!','success'); addPts(1,'vocabSave');
}
function deleteVocabWord(globalIdx){
  loadVocab();
  const item=_vocabFiltered[globalIdx]; if(!item)return;
  const i=_vocabData.indexOf(item); if(i>-1)_vocabData.splice(i,1);
  localStorage.setItem('aivox_vocab_'+(window._fbUser?.uid||'x'),JSON.stringify(_vocabData));
  _vocabFiltered=[..._vocabData]; renderVocab(true);
}
function filterVocab(q){
  loadVocab();
  _vocabFiltered=!q.trim()?[..._vocabData]:_vocabData.filter(v=>v.word.toLowerCase().includes(q.toLowerCase())||v.trans.toLowerCase().includes(q.toLowerCase()));
  renderVocab(true);
}
function renderVocab(skipLoad){
  if(!skipLoad)loadVocab();
  const scroll=document.getElementById('vocab-scroll'); if(!scroll)return;
  if(!_vocabFiltered.length){
    scroll.innerHTML='<div class="vocab-empty"><div style="font-size:44px;margin-bottom:10px;">📖</div><div style="font-size:14px;font-weight:700;margin-bottom:6px;">Vocabulário vazio</div><div style="font-size:12px;">Salve palavras do Professor ou das Lições</div></div>';
    return;
  }
  const flags={'inglês':'<span class="flag-emoji">🇺🇸</span>','espanhol':'<span class="flag-emoji">🇪🇸</span>','francês':'<span class="flag-emoji">🇫🇷</span>','alemão':'<span class="flag-emoji">🇩🇪</span>','italiano':'<span class="flag-emoji">🇮🇹</span>','japonês':'<span class="flag-emoji">🇯🇵</span>'};
  scroll.innerHTML=_vocabFiltered.map((v,i)=>{
    const wo=v.word.replace(/'/g,"\'");
    return `<div class="vocab-item"><div class="vocab-info"><div class="vocab-word">${v.word}</div><div class="vocab-trans">${v.trans||'—'}</div></div><span class="vocab-lang-tag">${flags[v.lang]||''} ${v.lang}</span><button class="vocab-speak" onclick="_speakTranslation('${wo}')" title="Ouvir">🔊</button><button class="vocab-del" onclick="deleteVocabWord(${i})" title="Remover">🗑️</button></div>`;
  }).join('');
}

// ── Init ─────────────────────────────────────────────────────
(function(){
  const pl=document.getElementById('page-learn');
  if(pl){
    const obs=new MutationObserver(()=>{
      if(pl.classList.contains('active')){loadStreak();loadVocab();}
    });
    obs.observe(pl,{attributeFilter:['class']});
  }
})();

// ════════════════════════════════════════════════════════════════
//  MELHORIAS MÓDULO APRENDIZAGEM
// ════════════════════════════════════════════════════════════════

// ── 1. LIÇÕES VIA IA (dinâmicas, sem estático) ────────────────
let _licoesCacheIA = {}; // {lang_nivel: [{cat,itens}]}
const _LICOES_TEMAS = {
  inglês:   ['Cumprimentos','Números','Cores','Família','Restaurante','Viagem','Negócios','Saúde','Compras','Tecnologia','Esportes','Expressões idiomáticas','Phrasal Verbs','Gírias','Trabalho'],
  espanhol: ['Saludos','Números','Familia','Restaurante','Viaje','Negocios','Salud','Compras','Tecnología','Expresiones'],
  francês:  ['Salutations','Chiffres','Famille','Restaurant','Voyage','Affaires','Santé','Shopping','Tech','Expressions'],
  alemão:   ['Begrüßungen','Zahlen','Familie','Restaurant','Reise','Geschäft','Gesundheit','Einkaufen','Technologie','Ausdrücke'],
  italiano: ['Saluti','Numeri','Famiglia','Ristorante','Viaggio','Affari','Salute','Shopping','Tecnologia','Espressioni'],
  japonês:  ['挨拶','数字','家族','レストラン','旅行','ビジネス','健康','買い物','技術','表現']
};

async function _carregarLicoesIA(lang, forceRefresh){
  const key = lang;
  if(!forceRefresh && _licoesCacheIA[key]) return _licoesCacheIA[key];
  const scroll = document.getElementById('licoes-scroll');
  if(scroll) scroll.innerHTML = _licoesSkeleton();
  const backendUrl = (typeof getBackendUrl === 'function') ? getBackendUrl() : '';
  if(!backendUrl){
    const fallback = LICOES_DATA[lang] || [];
    _licoesCacheIA[key] = fallback;
    return fallback;
  }
  try{
    const token = await getAuthToken().catch(()=>null);
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 8000);
    const res = await fetch(backendUrl+'/api/learn/licoes',{
      method:'POST',
      headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
      body:JSON.stringify({lang}),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if(!res.ok) throw new Error('Backend retornou '+res.status);
    const data = await res.json();
    const parsed = data.licoes;
    if(!parsed||!Array.isArray(parsed)) throw new Error('Resposta inválida');
    _licoesCacheIA[key] = parsed;
    return parsed;
  }catch(e){
    if(!e.message?.includes('aborted')) console.warn('[Learn] Backend indisponível, usando lições locais.');
    const fallback = LICOES_DATA[lang] || [];
    _licoesCacheIA[key] = fallback;
    return fallback;
  }
}

function _licoesSkeleton(){
  let h = '';
  for(let i=0;i<3;i++){
    h += `<div style="height:14px;width:120px;border-radius:4px;margin:14px 0 8px;" class="skeleton"></div>`;
    for(let j=0;j<3;j++) h+=`<div style="height:64px;border-radius:14px;margin-bottom:9px;" class="skeleton"></div>`;
  }
  return h;
}

// Override renderLicoes to use IA
async function renderLicoes(){
  const scroll=document.getElementById('licoes-scroll'); if(!scroll)return;
  const dados = await _carregarLicoesIA(_licaoLang);
  const conc=_getLicoesConcluidas();
  const prog=_getLicoesProgresso();
  let html='';
  dados.forEach(grupo=>{
    html+=`<div class="licao-cat">${grupo.cat}</div>`;
    grupo.itens.forEach(l=>{
      const ok=conc.includes(l.id);
      const p=prog[l.id]||0;
      const total=l.frases?.length||1;
      const pct=Math.round(p/total*100);
      const barColor=ok?'var(--green)':'var(--accent)';
      html+=`<div class="licao-card" onclick="openLicao('${l.id}','ia')">
        <div class="licao-icon">${l.icon}</div>
        <div class="licao-info">
          <div class="licao-nome">${l.nome}</div>
          <div class="licao-desc">${l.desc}</div>
          ${p>0?`<div style="height:3px;background:var(--border);border-radius:2px;margin-top:5px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${barColor};border-radius:2px;transition:width .4s;"></div></div>`:''}
        </div>
        <div class="licao-badge ${ok?'ok':'novo'}">${ok?'✓ OK':p>0?p+'/'+total:'NOVO'}</div>
      </div>`;
    });
  });
  if(!html) html='<div style="text-align:center;padding:40px;color:var(--muted);font-size:13px;">Gerando lições...</div>';
  // botão para regenerar
  html+=`<button onclick="renderLicoesForce()" class="btn btn-ghost btn-full" style="margin-top:8px;font-size:12px;">🔄 Regenerar lições com IA</button>`;
  scroll.innerHTML=html;
  // cache IA data globally for openLicao
  window._licoesIAData = window._licoesIAData || {};
  window._licoesIAData[_licaoLang] = _licoesCacheIA[_licaoLang];
}
function renderLicoesForce(){
  delete _licoesCacheIA[_licaoLang];
  renderLicoes();
}

function _getLicoesProgresso(){
  try{return JSON.parse(localStorage.getItem('aivox_prog_'+(window._fbUser?.uid||'x'))||'{}');}catch(e){return{};}
}
function _setLicaoProgresso(id, fraseIdx){
  const key='aivox_prog_'+(window._fbUser?.uid||'x');
  try{
    const d=_getLicoesProgresso();
    d[id]=Math.max(d[id]||0, fraseIdx+1);
    localStorage.setItem(key,JSON.stringify(d));
  }catch(e){}
}

// Override openLicao to work with IA data
async function openLicao(id, src){
  let licao=null;
  // Try IA data first
  if(window._licoesIAData?.[_licaoLang]){
    window._licoesIAData[_licaoLang].forEach(g=>g.itens.forEach(l=>{if(l.id===id)licao=l;}));
  }
  if(!licao) Object.values(LICOES_DATA).forEach(gs=>gs.forEach(g=>g.itens.forEach(l=>{if(l.id===id)licao=l;})));
  if(!licao) return;
  _currentLicao=licao;
  document.getElementById('licao-modal-title').textContent=licao.icon+' '+licao.nome;
  document.getElementById('licao-modal-sub').textContent=licao.desc;
  const prog=_getLicoesProgresso();
  let html=`<div style="font-size:12px;color:var(--muted);margin-bottom:12px;font-family:var(--mono);">${licao.frases.length} FRASES — toque em 🔊 para ouvir ou 📖 para salvar</div>`;
  licao.frases.forEach((f,idx)=>{
    const wo=f.orig.replace(/['"]/g,''); const wt=f.trans.replace(/['"]/g,'');
    const saved=(prog[licao.id]||0)>idx;
    html+=`<div class="licao-phrase" id="lp-${idx}" style="${saved?'border-color:rgba(0,255,136,.25);':''}">
      <div class="licao-phrase-orig">${f.orig}</div>
      <div class="licao-phrase-trans">${f.trans}</div>
      <div class="licao-phrase-pron">/${f.pron}/</div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <button class="lb-btn" onclick="_speakTranslation('${wo.replace(/'/g,"\\'")}')">🔊 Ouvir</button>
        <button class="lb-btn" id="lp-save-${idx}" onclick="licaoSalvarFrase('${licao.id}',${idx},'${wo.replace(/'/g,"\\'")}','${wt.replace(/'/g,"\\'")}','${_licaoLang}')" style="${saved?'color:var(--green);border-color:rgba(0,255,136,.3);':''}">📖 ${saved?'Salvo':'Salvar'}</button>
      </div>
    </div>`;
  });
  html+=`<button class="btn btn-primary btn-full" style="margin-top:8px;" onclick="concluirLicao('${id}')">✅ Marcar como concluída +10 pts</button>`;
  document.getElementById('licao-modal-body').innerHTML=html;
  document.getElementById('licao-modal').classList.add('sh');
}
function licaoSalvarFrase(id, idx, word, trans, lang){
  saveVocabWord(word,trans,lang);
  _setLicaoProgresso(id,idx);
  const btn=document.getElementById('lp-save-'+idx);
  const ph=document.getElementById('lp-'+idx);
  if(btn){btn.textContent='📖 Salvo';btn.style.color='var(--green)';btn.style.borderColor='rgba(0,255,136,.3)';}
  if(ph)ph.style.borderColor='rgba(0,255,136,.25)';
  // check auto-concluir
  const licao=_currentLicao;
  if(licao){
    const prog=_getLicoesProgresso();
    if((prog[id]||0)>=licao.frases.length) showToast('🏆 Todas frases salvas! Lição concluída!','success');
  }
}

// ── 2. SRS — Repetição Espaçada nos Flashcards ───────────────
function _getSRSData(){
  try{return JSON.parse(localStorage.getItem('aivox_srs_'+(window._fbUser?.uid||'x'))||'{}');}catch(e){return{};}
}
function _saveSRS(data){
  try{localStorage.setItem('aivox_srs_'+(window._fbUser?.uid||'x'),JSON.stringify(data));}catch(e){}
}
function _updateSRS(word, lang, knew){
  const d=_getSRSData(); const k=lang+'|'+word;
  const item=d[k]||{interval:1,ease:2.5,due:0,reps:0};
  const now=Date.now();
  if(knew){
    item.reps=(item.reps||0)+1;
    item.interval=item.reps<2?1:item.reps<3?3:Math.round(item.interval*item.ease);
    item.ease=Math.max(1.3,item.ease+0.1);
  }else{
    item.interval=1; item.reps=0; item.ease=Math.max(1.3,item.ease-0.2);
  }
  item.due=now+item.interval*86400000;
  d[k]=item; _saveSRS(d);
}
function _getSRSDue(){
  const d=_getSRSData(); const now=Date.now();
  return Object.keys(d).filter(k=>d[k].due<=now).length;
}

// Override buildFlashDeck to prioritize SRS due cards
function buildFlashDeck(){
  const srs=_getSRSData(); const now=Date.now();
  const all=[..._vocabData.filter(v=>v.lang===_flashLang)].sort(()=>Math.random()-.5);
  // Prioritize overdue cards
  const due=all.filter(v=>{const k=_flashLang+'|'+v.word; return !srs[k]||(srs[k].due||0)<=now;});
  const notDue=all.filter(v=>{const k=_flashLang+'|'+v.word; return srs[k]&&srs[k].due>now;});
  _flashDeck=[...due,...notDue.slice(0,3)];
  _flashIdx=0; _flashOk=0; _flashNope=0; _flashFlipped=false;
  // Update due badge
  const dueCount=_getSRSDue();
  const tab=document.querySelector('.learn-tab[onclick*="flash"]');
  if(tab&&dueCount>0) tab.innerHTML=`🃏 FLASHCARD <span style="background:var(--red);color:#fff;font-size:9px;border-radius:5px;padding:1px 5px;font-family:var(--mono);">${dueCount}</span>`;
}
// Override flashGot/flashNope to update SRS
const _origFlashGot=window.flashGot;
window.flashGot=function(){
  if(_flashDeck[_flashIdx]) _updateSRS(_flashDeck[_flashIdx].word,_flashLang,true);
  _flashOk++; addPts(3,'flashOk'); _flashIdx++; _flashFlipped=false; renderFlashCard();
};
window.flashNope=function(){
  if(_flashDeck[_flashIdx]) _updateSRS(_flashDeck[_flashIdx].word,_flashLang,false);
  _flashNope++; _flashIdx++; _flashFlipped=false; renderFlashCard();
};

// ── 3. EXERCÍCIOS MELHORADOS (IA + escrita + voz) ────────────
let _exerMode='vocab'; // 'vocab' | 'licoes' | 'ambos'

function renderExer(){
  _buildLangBar('exer-lang-bar','_exerLang',(l)=>{_exerLang=l;buildExerIA();});
  buildExerIA();
}

async function buildExerIA(){
  const wrap=document.getElementById('exer-wrap'); if(!wrap)return;
  const words=_vocabData.filter(v=>v.lang===_exerLang);
  const licaoFrases=[];
  (LICOES_DATA[_exerLang]||[]).forEach(g=>g.itens.forEach(l=>l.frases.slice(0,4).forEach(f=>licaoFrases.push({word:f.orig,trans:f.trans,lang:_exerLang}))));
  // também usar lições IA
  if(window._licoesIAData?.[_exerLang]){
    window._licoesIAData[_exerLang].forEach(g=>g.itens.forEach(l=>l.frases?.slice(0,3).forEach(f=>licaoFrases.push({word:f.orig,trans:f.trans,lang:_exerLang}))));
  }
  const pool=[...words,...licaoFrases].slice(0,40);
  if(pool.length<2){
    wrap.innerHTML=`<div style="text-align:center;padding:40px 14px;color:var(--muted);">
      <div style="font-size:44px;margin-bottom:10px;">✏️</div>
      <div style="font-size:14px;font-weight:700;margin-bottom:6px;">Poucas palavras</div>
      <div style="font-size:12px;">Salve palavras no vocabulário ou acesse as lições</div>
    </div>`; return;
  }
  // Filtro de modo
  wrap.innerHTML=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
    <span style="font-size:11px;color:var(--muted);font-family:var(--mono);">FONTE:</span>
    ${['ambos','vocab','licoes'].map(m=>`<div onclick="setExerMode('${m}',this)" class="exer-mode-btn ${_exerMode===m?'active':''}" style="padding:3px 10px;border-radius:20px;border:1px solid ${_exerMode===m?'rgba(0,229,255,.4)':'var(--border)'};background:${_exerMode===m?'var(--adim)':'var(--card)'};font-size:11px;font-weight:700;cursor:pointer;color:${_exerMode===m?'var(--accent)':'var(--muted)'};transition:all .18s;">${m==='ambos'?'🔀 Ambos':m==='vocab'?'📖 Vocabulário':'📚 Lições'}</div>`).join('')}
  </div><div id="exer-cards-wrap"></div>`;
  _buildExerCards(pool);
}
function setExerMode(mode, el){
  _exerMode=mode;
  document.querySelectorAll('.exer-mode-btn').forEach(b=>{
    const isThis=b.textContent.toLowerCase().includes(mode)||b.onclick?.toString().includes(mode);
  });
  buildExerIA();
}
function _buildExerCards(pool){
  const target=document.getElementById('exer-cards-wrap')||document.getElementById('exer-wrap');
  if(!target)return;
  const shuffled=[...pool].sort(()=>Math.random()-.5);
  const exercicios=[];
  shuffled.slice(0,8).forEach((item,i)=>{
    const tipo=i%4;
    if(tipo===0){
      // Múltipla escolha PT→idioma
      const wrong=pool.filter(p=>p.word!==item.word).sort(()=>Math.random()-.5).slice(0,3).map(p=>p.trans);
      const opts=[item.trans,...wrong].sort(()=>Math.random()-.5);
      exercicios.push({tipo:'MÚLTIPLA ESCOLHA',pergunta:`Como se traduz?\n"${item.word}"`,certa:item.trans,opts,word:item.word});
    }else if(tipo===1){
      // Escreva a palavra
      exercicios.push({tipo:'ESCREVA',pergunta:`Como se diz em ${_exerLang}?\n"${item.trans}"`,certa:item.word,opts:null,word:item.word,trans:item.trans});
    }else if(tipo===2){
      // Complete (idioma→PT)
      const wrong=pool.filter(p=>p.trans!==item.trans).sort(()=>Math.random()-.5).slice(0,3).map(p=>p.word);
      const opts=[item.word,...wrong].sort(()=>Math.random()-.5);
      exercicios.push({tipo:'COMPLETE A FRASE',pergunta:`Como se diz em ${_exerLang}?\n"${item.trans}"`,certa:item.word,opts,word:item.word});
    }else{
      // Verdadeiro/Falso
      const falso=Math.random()>.5;
      const fTrans=falso?(pool.find(p=>p.word!==item.word)?.trans||'???'):item.trans;
      exercicios.push({tipo:'VERDADEIRO OU FALSO',pergunta:`"${item.word}" significa "${fTrans}"`,certa:falso?'Falso':'Verdadeiro',opts:['Verdadeiro','Falso'],word:item.word});
    }
  });
  let html='';
  exercicios.forEach((ex,i)=>{
    if(ex.tipo==='ESCREVA'){
      const cEsc=ex.certa.replace(/'/g,"\\'");
      html+=`<div class="exer-card" id="exer-${i}">
        <div class="exer-tipo">${ex.tipo}</div>
        <div class="exer-pergunta">${ex.pergunta.replace('\n','<br>')}</div>
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input type="text" id="exer-inp-${i}" class="input-field" placeholder="Digite em ${_exerLang}..." style="flex:1;font-size:14px;" onkeydown="if(event.key==='Enter')checkExerEscrita(${i},'${cEsc}')">
          <button onclick="checkExerEscrita(${i},'${cEsc}')" style="background:var(--adim);border:1px solid rgba(0,229,255,.3);color:var(--accent);border-radius:10px;padding:0 14px;cursor:pointer;">→</button>
        </div>
        <div class="exer-feedback" id="exfb-${i}"></div>
      </div>`;
    }else{
      const optsHtml=ex.opts.map(o=>{
        const os=o.replace(/'/g,"\\'").replace(/"/g,'&quot;');
        const cs=ex.certa.replace(/'/g,"\\'").replace(/"/g,'&quot;');
        return `<button class="exer-opt" onclick="checkExer(${i},'${os}','${cs}',this)">${o}</button>`;
      }).join('');
      html+=`<div class="exer-card" id="exer-${i}">
        <div class="exer-tipo">${ex.tipo}</div>
        <div class="exer-pergunta">${ex.pergunta.replace('\n','<br>')}</div>
        <div class="exer-opts">${optsHtml}</div>
        <div class="exer-feedback" id="exfb-${i}"></div>
      </div>`;
    }
  });
  html+=`<button class="btn btn-ghost btn-full" style="margin-top:4px;" onclick="buildExerIA()">🔄 Novos exercícios</button>`;
  target.innerHTML=html;
}
function checkExer(idx,resposta,certa,btn){
  const card=document.getElementById('exer-'+idx);
  if(!card||card.dataset.done)return; card.dataset.done='1';
  card.querySelectorAll('.exer-opt').forEach(b=>b.style.pointerEvents='none');
  const ok=resposta===certa;
  btn.classList.add(ok?'certo':'errado');
  if(!ok)card.querySelectorAll('.exer-opt').forEach(b=>{if(b.textContent===certa)b.classList.add('correta');});
  const fb=document.getElementById('exfb-'+idx);
  if(fb){
    fb.className='exer-feedback sh '+(ok?'ok':'err');
    fb.innerHTML=ok?'✅ Correto! +3 pts':`❌ Errado. Certa: <strong>${certa}</strong> <button class="lb-btn" onclick="_speakTranslation('${certa.replace(/'/g,"\\'")}')">🔊</button>`;
  }
  if(ok){addPts(3,'exerOk');_exerScore+=3;}
  _exerTotal++;
  const sc=document.getElementById('exer-score-txt'); if(sc)sc.textContent=_exerScore+' pts';
}
function checkExerEscrita(idx, certa){
  const card=document.getElementById('exer-'+idx);
  if(!card||card.dataset.done)return; card.dataset.done='1';
  const inp=document.getElementById('exer-inp-'+idx); if(!inp)return;
  const resp=inp.value.trim();
  inp.disabled=true;
  // Levenshtein tolerance 1
  const dist=(a,b)=>{const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=a[i-1]===b[j-1]?d[i-1][j-1]:1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);return d[m][n];};
  const ok=resp.toLowerCase()===certa.toLowerCase()||dist(resp.toLowerCase(),certa.toLowerCase())<=1;
  const fb=document.getElementById('exfb-'+idx);
  if(fb){
    fb.className='exer-feedback sh '+(ok?'ok':'err');
    fb.innerHTML=(ok?`✅ Correto! +5 pts`:`❌ Resposta: <strong>${certa}</strong> <button class="lb-btn" onclick="_speakTranslation('${certa.replace(/'/g,"\\'")}')">🔊</button>`);
  }
  if(ok){addPts(5,'exerOk');_exerScore+=5;}
  _exerTotal++;
  const sc=document.getElementById('exer-score-txt'); if(sc)sc.textContent=_exerScore+' pts';
}

// ── 4. SWIPE nos flashcards (mobile) ─────────────────────────
let _flashTouchX=0;
document.addEventListener('touchstart',e=>{
  if(e.target.closest('#flash-wrap')) _flashTouchX=e.touches[0].clientX;
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!e.target.closest('#flash-wrap'))return;
  const dx=e.changedTouches[0].clientX-_flashTouchX;
  if(Math.abs(dx)>60&&_flashFlipped){
    if(dx>0) flashGot(); else flashNope();
  }else if(Math.abs(dx)>60&&!_flashFlipped){
    flipFlash();
  }
},{passive:true});

// ── 5. GRÁFICO DE PROGRESSO SEMANAL ──────────────────────────
function _saveProgressDay(pts){
  try{
    const uid=window._fbUser?.uid||'x';
    const key='aivox_progress_'+uid;
    const d=JSON.parse(localStorage.getItem(key)||'{}');
    const today=new Date().toISOString().slice(0,10);
    d[today]=(d[today]||0)+pts;
    // keep last 30 days
    const keys=Object.keys(d).sort().slice(-30);
    const trimmed={}; keys.forEach(k=>trimmed[k]=d[k]);
    localStorage.setItem(key,JSON.stringify(trimmed));
  }catch(e){}
}
// addPts agora é a função completa da gamificação (definida no módulo GAMIFICAÇÃO)
// Wrapper mantido apenas para compatibilidade — salva progresso no gráfico de barras
const _origAddPts = window.addPts || function(){};
const _addPtsWithChart = function(n, action) {
  // Chama a função real de gamificação se disponível
  if(typeof addPts === 'function' && addPts !== _addPtsWithChart) {
    addPts(n, action);
  }
  _saveProgressDay(n);
};

function renderProgressBar(){
  const uid=window._fbUser?.uid||'x';
  try{
    const d=JSON.parse(localStorage.getItem('aivox_progress_'+uid)||'{}');
    const today=new Date();
    const days=Array.from({length:7},(_,i)=>{
      const dt=new Date(today); dt.setDate(dt.getDate()-6+i);
      const k=dt.toISOString().slice(0,10);
      return{k,pts:d[k]||0,day:['D','S','T','Q','Q','S','S'][dt.getDay()]};
    });
    const max=Math.max(...days.map(x=>x.pts),1);
    const today0=today.toISOString().slice(0,10);
    let html=`<div style="display:flex;align-items:flex-end;gap:4px;height:44px;margin-top:8px;">`;
    days.forEach(d=>{
      const pct=Math.round(d.pts/max*100);
      const isToday=d.k===today0;
      html+=`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
        <div style="width:100%;height:${Math.max(pct*0.3,2)}px;background:${isToday?'var(--accent)':'var(--adim)'};border-radius:3px 3px 0 0;min-height:2px;transition:height .4s;"></div>
        <div style="font-size:9px;color:var(--muted);font-family:var(--mono);">${d.day}</div>
      </div>`;
    });
    html+=`</div>`;
    const existing=document.getElementById('streak-progress-chart');
    if(!existing){
      const bar=document.querySelector('.learn-streak-bar');
      if(bar){
        const chart=document.createElement('div');
        chart.id='streak-progress-chart';
        chart.style.cssText='width:100%;padding:0 16px 8px;background:var(--surface);border-bottom:1px solid var(--border);flex-shrink:0;';
        chart.innerHTML=html;
        bar.after(chart);
      }
    }else{
      existing.innerHTML=html;
    }
  }catch(e){}
}

// ── 6. AUTO-SALVAR PALAVRAS DO PROFESSOR ─────────────────────
function _extractVocabFromAI(text, lang){
  // Extract words between ** or in the form "word - translation"
  const matches=[];
  // Pattern: **word** ou *word*
  const boldReg=/\*{1,2}([^*]{2,30})\*{1,2}/g;
  let m;
  while((m=boldReg.exec(text))!==null){
    if(!m[1].includes('\n')) matches.push(m[1].trim());
  }
  return [...new Set(matches)].slice(0,5);
}
function _showVocabChips(words, lang, bubbleEl){
  if(!words.length)return;
  const chips=document.createElement('div');
  chips.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;';
  chips.innerHTML='<span style="font-size:10px;color:var(--muted);font-family:var(--mono);width:100%;">💡 SALVAR:</span>';
  words.forEach(w=>{
    const btn=document.createElement('button');
    btn.className='lb-btn';
    btn.style.cssText='font-size:11px;padding:3px 9px;';
    btn.textContent='+ '+w;
    btn.onclick=()=>{saveVocabWord(w,'',lang);btn.style.background='var(--gdim)';btn.style.color='var(--green)';btn.disabled=true;btn.textContent='✓ '+w;};
    chips.appendChild(btn);
  });
  bubbleEl.appendChild(chips);
}

// ── 7. STREAK SAVE TO FIRESTORE ──────────────────────────────
async function _syncProgressFirestore(){
  if(!window.db||!window._fbUser?.uid)return;
  try{
    const uid=window._fbUser.uid;
    const d=JSON.parse(localStorage.getItem('aivox_progress_'+uid)||'{}');
    const today=new Date().toISOString().slice(0,10);
    if(d[today]>0){
      await db.collection('users').doc(uid).collection('progress').doc(today)
        .set({pts:d[today],date:today,updatedAt:serverTimestamp()},{merge:true});
    }
    // Sync vocab
    const vocab=JSON.parse(localStorage.getItem('aivox_vocab_'+uid)||'[]');
    if(vocab.length>0){
      await db.collection('users').doc(uid).set({vocabCount:vocab.length},{merge:true});
    }
  }catch(e){}
}

// ════════════════════════════════════════════════════════════════
//  MÓDULO CONVERSA LIVRE
// ════════════════════════════════════════════════════════════════
let _livreLang='inglês', _livreNivel='iniciante', _livreSit=null;
let _livreHistory=[], _livreListening=false, _livreRecog=null, _livreVoz=false;
let _livrePts=0;

const _LIVRE_SITUACOES = [
  {id:'restaurante',icon:'🍽️',nome:'No restaurante',desc:'Peça comida, vinho, pergunte sobre o menu',personagem:'garçom(ã) de um restaurante chique',lugar:'restaurante'},
  {id:'aeroporto',icon:'✈️',nome:'No aeroporto',desc:'Check-in, alfândega, embarque',personagem:'agente de aeroporto',lugar:'aeroporto'},
  {id:'entrevista',icon:'💼',nome:'Entrevista de emprego',desc:'Apresente-se, fale de experiências',personagem:'entrevistador(a) de RH de empresa tech',lugar:'sala de entrevistas'},
  {id:'hotel',icon:'🏨',nome:'Check-in no hotel',desc:'Reserve quarto, pergunte sobre serviços',personagem:'recepcionista de hotel',lugar:'recepção do hotel'},
  {id:'medico',icon:'🏥',nome:'Consulta médica',desc:'Descreva sintomas, entenda diagnóstico',personagem:'médico(a)',lugar:'consultório'},
  {id:'shopping',icon:'🛍️',nome:'Fazendo compras',desc:'Pergunte tamanhos, preços, trocas',personagem:'vendedor(a) de loja',lugar:'loja de roupas'},
  {id:'taxi',icon:'🚕',nome:'No táxi / Uber',desc:'Dê o endereço, pergunte o tempo',personagem:'motorista de táxi',lugar:'carro'},
  {id:'banco',icon:'🏦',nome:'No banco',desc:'Abra conta, pergunte sobre serviços',personagem:'gerente de banco',lugar:'agência bancária'},
  {id:'turismo',icon:'🗺️',nome:'Pedindo informações',desc:'Pergunte direções, pontos turísticos',personagem:'morador local',lugar:'rua da cidade'},
  {id:'amigo',icon:'👋',nome:'Encontro casual',desc:'Bate-papo informal com amigo nativo',personagem:'amigo(a) nativo(a) descontraído',lugar:'café'},
  {id:'reuniao',icon:'📊',nome:'Reunião de negócios',desc:'Apresente projeto, negocie, faça perguntas',personagem:'sócio(a) de negócios',lugar:'sala de reuniões'},
  {id:'escola',icon:'🎓',nome:'Na universidade',desc:'Fale com professor, pergunte sobre aula',personagem:'professor(a) universitário',lugar:'campus universitário'},
];

function renderLivre(){
  _buildLangBar('livre-lang-bar','_livreLang',(l)=>{_livreLang=l;});
  const grid=document.getElementById('livre-sit-grid'); if(!grid)return;
  grid.innerHTML=_LIVRE_SITUACOES.map(s=>`
    <div class="livre-sit-card" onclick="livreIniciar('${s.id}')">
      <div class="livre-sit-icon">${s.icon}</div>
      <div class="livre-sit-nome">${s.nome}</div>
      <div class="livre-sit-desc">${s.desc}</div>
    </div>`).join('');
}

async function livreIASituacao(){
  const btn=event.target; btn.textContent='⏳ Gerando...'; btn.disabled=true;
  try{
    const token=await getAuthToken();
    const res=await fetch(getBackendUrl()+'/api/learn/situacao',{
      method:'POST',
      headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
      body:JSON.stringify({lang:_livreLang, nivel:_livreNivel})
    });
    if(!res.ok) throw new Error('Backend retornou '+res.status);
    const s=await res.json();
    if(!s.id) throw new Error('Situação inválida');
    _LIVRE_SITUACOES.unshift(s);
    renderLivre();
    livreIniciar(s.id);
  }catch(e){
    showToast('Erro ao gerar situação','error');
    console.error('livreIASituacao:',e.message);
  }finally{btn.textContent='✨ Gerar situação aleatória com IA';btn.disabled=false;}
}

async function livreIniciar(sitId){
  const sit=_LIVRE_SITUACOES.find(s=>s.id===sitId);
  if(!sit)return;
  _livreSit=sit; _livreHistory=[]; _livrePts=0;
  document.getElementById('livre-sit-titulo').textContent=sit.icon+' '+sit.nome;
  document.getElementById('livre-sit-sub').textContent=sit.personagem+' · '+sit.lugar;
  document.getElementById('livre-score-badge').textContent='0 pts';
  document.getElementById('livre-bubs').innerHTML='';
  document.getElementById('livre-situacao-sel').style.display='none';
  const conv=document.getElementById('livre-conversa'); conv.style.display='flex';
  // Iniciar com mensagem da IA
  await livreRespostaIA(null, true);
}

function livreVoltar(){
  if(_livreListening) _livreStopMic();
  document.getElementById('livre-conversa').style.display='none';
  document.getElementById('livre-situacao-sel').style.display='block';
  _livreSit=null; _livreHistory=[];
}

function livreAddBubble(tipo, html, speak, showAudio){
  const bubs=document.getElementById('livre-bubs'); if(!bubs)return;
  const div=document.createElement('div');
  div.className='livre-bub '+tipo;
  const label=tipo==='ai'?`<div class="lb-label">🤖 ${_livreSit?.personagem?.toUpperCase()||'IA'}</div>`:`<div class="lb-label">👤 VOCÊ</div>`;
  let actions='';
  if(tipo==='ai'&&showAudio){
    const safeHtml=html.replace(/'/g,"\\'").replace(/<[^>]*>/g,'').slice(0,200);
    actions=`<div class="lb-acao"><button class="lb-btn" onclick="_speakTranslation('${safeHtml}')">🔊 Ouvir</button></div>`;
  }
  div.innerHTML=label+html+actions;
  bubs.appendChild(div); bubs.scrollTop=bubs.scrollHeight;
  if(speak&&_livreVoz){
    const plain=html.replace(/<[^>]*>/g,'').replace(/\[.*?\]/g,'').trim();
    setTimeout(()=>_speakTranslation(plain),200);
  }
}

function livreShowThinking(){
  const bubs=document.getElementById('livre-bubs'); if(!bubs)return null;
  const div=document.createElement('div'); div.className='livre-bub ai'; div.id='livre-thinking';
  const dot=document.getElementById('livre-status-dot');
  if(dot){dot.style.background='var(--yellow)';dot.style.boxShadow='0 0 6px var(--yellow)';}
  div.innerHTML=`<div class="lb-label">🤖 ${_livreSit?.personagem?.toUpperCase()||'IA'}</div><div class="learn-thinking"><span></span><span></span><span></span></div>`;
  bubs.appendChild(div); bubs.scrollTop=bubs.scrollHeight; return div;
}

async function livreRespostaIA(userMsg, isFirst){
  const thinking=livreShowThinking();
  try{
    const langMap={'inglês':'English','espanhol':'Spanish','francês':'French','alemão':'German','italiano':'Italian','japonês':'Japanese'};
    const targetLang=langMap[_livreLang]||'English';

    const messages=[...(_livreHistory.slice(-8))];
    if(userMsg) messages.push({role:'user',content:userMsg});
    else messages.push({role:'user',content:`Start the conversation. You are ${_livreSit?.personagem} at ${_livreSit?.lugar}. Begin naturally.`});

    const token=await getAuthToken();
    if(!token){if(thinking)thinking.remove();livreAddBubble('ai','⚠️ Sessão expirada. Faça logout e login novamente.',false,false);return;}
    const _lPayload={messages,lang:_livreLang,nivel:_livreNivel,situacao:_livreSit};
    console.group('%c🎓 [LEARN] Chamando IA Professor — '+new Date().toLocaleTimeString('pt-BR'),'color:#c084fc;font-weight:bold;');
    console.log('URL:', getBackendUrl()+'/api/learn/conversa');
    console.log('Payload:', JSON.stringify(_lPayload,null,2));
    const _lT0=Date.now();
    const res=await fetch(getBackendUrl()+'/api/learn/conversa',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
      body:JSON.stringify(_lPayload)
    });
    const _lMs=Date.now()-_lT0;
    console.log('HTTP:', res.status, 'em', _lMs+'ms');
    if(!res.ok){
      const errTxt=await res.text().catch(()=>'');
      console.error('[LEARN] Erro:', errTxt.slice(0,300));
      console.groupEnd();
      throw new Error('Backend retornou '+res.status);
    }
    const rawData=await res.text();
    console.log('[LEARN] Resposta bruta:', rawData.slice(0,500));
    let data={};
    try{data=JSON.parse(rawData);}catch(pe){console.error('[LEARN] JSON inválido:',pe.message);throw new Error('Resposta inválida');}
    console.log('[LEARN] Resposta parseada:', data);
    if(data.answer==='...'||!data.answer){
      console.warn('[LEARN] Professor retornou fallback — verifique AZURE_OAI_KEY no Render.');
    } else {
      console.log('%c[LEARN] ✅ Resposta: '+data.answer.substring(0,80),'color:#00ff88;');
    }
    console.groupEnd();

    if(thinking)thinking.remove();
    const dot=document.getElementById('livre-status-dot');
    if(dot){dot.style.background='var(--green)';dot.style.boxShadow='0 0 6px var(--green)';}

    const resp=data.answer||'...';
    const dica=resp.match(/\[Dica:(.*?)\]/s);
    let mainResp=resp.replace(/\[Dica:.*?\]/s,'').trim();

    _livreHistory.push({role:'user',content:userMsg||'(start)'});
    _livreHistory.push({role:'assistant',content:mainResp});

    let html=mainResp.replace(/\n/g,'<br>');
    if(dica) html+=`<div class="lb-correcao">💡 Dica: ${dica[1].trim()}</div>`;
    livreAddBubble('ai', html, true, true);
    addPts(1,'vocabSave');
  }catch(e){
    if(thinking)thinking.remove();
    livreAddBubble('ai','⚠️ Erro de conexão. Tente novamente.',false,false);
    console.error('%c[LEARN] ❌ Exceção livreRespostaIA:','color:#ff4466;font-weight:bold;', e.message);
    console.error('[LEARN] Stack:', e.stack);
    if(typeof console.groupEnd==='function') try{console.groupEnd();}catch(_){}
  }
}

async function livreEnviarMensagem(texto){
  if(!texto.trim()||!_livreSit)return;
  livreAddBubble('user', texto, false, false);
  _livrePts+=2; addPts(2);
  document.getElementById('livre-score-badge').textContent=_livrePts+' pts';
  await livreRespostaIA(texto, false);
}

function livreEnviarTexto(){
  const inp=document.getElementById('livre-text-inp'); if(!inp||!inp.value.trim())return;
  const txt=inp.value.trim(); inp.value='';
  livreEnviarMensagem(txt);
}

function livreToggleVoz(){
  _livreVoz=!_livreVoz;
  const t=document.getElementById('livre-voice-toggle');
  const d=document.getElementById('livre-voice-dot');
  const l=document.getElementById('livre-voice-lbl');
  if(_livreVoz){
    if(t){t.style.borderColor='rgba(0,229,255,.35)';t.style.background='var(--adim)';t.style.color='var(--accent)';}
    if(d){d.style.background='var(--accent)';d.style.boxShadow='0 0 6px var(--accent)';}
    if(l)l.textContent='🔊 Voz IA on';
    showToast('🔊 Voz da IA ativada','info');
  }else{
    if(t){t.style.borderColor='';t.style.background='var(--card)';t.style.color='var(--muted)';}
    if(d){d.style.background='var(--muted)';d.style.boxShadow='none';}
    if(l)l.textContent='🔇 Voz IA off';
  }
}

function livreToggleMic(){if(_livreListening)_livreStopMic();else _livreStartMic();}
function _livreStartMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){showToast('Navegador não suporta voz','error');return;}
  const langCodes={'inglês':'en-US','espanhol':'es-ES','francês':'fr-FR','alemão':'de-DE','italiano':'it-IT','japonês':'ja-JP'};
  let got=false;
  _livreRecog=new SR();
  _livreRecog.lang=langCodes[_livreLang]||'en-US';
  _livreRecog.continuous=false; _livreRecog.interimResults=false;
  _livreRecog.onresult=(e)=>{got=true;const t=e.results[0][0].transcript;_livreStopMic();if(t)livreEnviarMensagem(t);};
  _livreRecog.onerror=(e)=>{if(e.error!=='no-speech'&&e.error!=='aborted')showToast('Erro mic: '+e.error,'error');_livreStopMic();};
  _livreRecog.onend=()=>{if(!got)_livreStopMic();};
  try{
    _livreRecog.start(); _livreListening=true;
    const btn=document.getElementById('livre-mic-btn'), st=document.getElementById('livre-mic-status');
    if(btn){btn.classList.add('livre-mic-btn-rec');btn.textContent='⏹';}
    if(st)st.textContent='🔴 Ouvindo em '+_livreLang+'...';
  }catch(e){showToast('Erro ao iniciar mic','error');_livreListening=false;}
}
function _livreStopMic(){
  _livreListening=false; try{_livreRecog?.stop();}catch(_){} _livreRecog=null;
  const btn=document.getElementById('livre-mic-btn'), st=document.getElementById('livre-mic-status');
  if(btn){btn.classList.remove('livre-mic-btn-rec');btn.textContent='🎤';}
  if(st)st.textContent='Toque no microfone para falar';
}
function setLivreNivel(el){
  document.querySelectorAll('.livre-nivel-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active'); _livreNivel=el.dataset.nivel;
}

// ══════════════════════════════════════════════════════════
//  MÓDULO PRONÚNCIA
// ══════════════════════════════════════════════════════════
(function(){
  let _pLang='inglês',_pScore=0,_pCurrentWord=null,_pHistory=[],_pRecording=false,_pMediaRec=null,_pChunks=[],_pSpeaking=false;
  const LANGS=[{key:'inglês',flag:'<span class="flag-emoji">🇺🇸</span>',label:'Inglês'},{key:'espanhol',flag:'<span class="flag-emoji">🇪🇸</span>',label:'Espanhol'},{key:'francês',flag:'<span class="flag-emoji">🇫🇷</span>',label:'Francês'},{key:'alemão',flag:'<span class="flag-emoji">🇩🇪</span>',label:'Alemão'},{key:'italiano',flag:'<span class="flag-emoji">🇮🇹</span>',label:'Italiano'},{key:'japonês',flag:'<span class="flag-emoji">🇯🇵</span>',label:'Japonês'}];
  const WORD_POOLS={
    inglês:[{w:'Hello',t:'Olá',ph:'/həˈloʊ/'},{w:'Beautiful',t:'Bonito(a)',ph:'/ˈbjuːtɪfəl/'},{w:'Schedule',t:'Agenda',ph:'/ˈʃɛdjuːl/'},{w:'Pronunciation',t:'Pronúncia',ph:'/prəˌnʌnsiˈeɪʃən/'},{w:'Comfortable',t:'Confortável',ph:'/ˈkʌmftəbəl/'},{w:'Necessary',t:'Necessário',ph:'/ˈnɛsəˌsɛri/'},{w:'Technology',t:'Tecnologia',ph:'/tɛkˈnɒlədʒi/'},{w:'Thorough',t:'Minucioso',ph:'/ˈθʌrəʊ/'},{w:'Vocabulary',t:'Vocabulário',ph:'/vəˈkæbjʊlɛri/'},{w:'Wednesday',t:'Quarta-feira',ph:'/ˈwɛnzdeɪ/'}],
    espanhol:[{w:'Hola',t:'Olá',ph:'/ˈola/'},{w:'Gracias',t:'Obrigado',ph:'/ˈɡɾaθjas/'},{w:'Desarrollar',t:'Desenvolver',ph:'/desaˈrroʎar/'},{w:'Murciélago',t:'Morcego',ph:'/murˈθjelaɡo/'},{w:'Excelente',t:'Excelente',ph:'/exθeˈlente/'},{w:'Comunicación',t:'Comunicação',ph:'/komuniˈkaθjon/'}],
    francês:[{w:'Bonjour',t:'Bom dia',ph:'/bɔ̃ʒuʁ/'},{w:'Merci',t:'Obrigado',ph:'/mɛʁsi/'},{w:'Grenouille',t:'Rã',ph:'/ɡʁənuj/'},{w:'Accueillir',t:'Acolher',ph:'/akœjiʁ/'},{w:"Aujourd'hui",t:'Hoje',ph:'/oʒuʁdɥi/'}],
    alemão:[{w:'Guten Morgen',t:'Bom dia',ph:'/ˈɡuːtən ˈmɔʁɡən/'},{w:'Danke',t:'Obrigado',ph:'/ˈdaŋkə/'},{w:'Schadenfreude',t:'Alegria com dano alheio',ph:'/ˈʃaːdənˌfʁɔʏdə/'},{w:'Entschuldigung',t:'Desculpe',ph:'/ɛntˈʃʊldɪɡʊŋ/'}],
    italiano:[{w:'Ciao',t:'Oi/Tchau',ph:'/tʃaʊ/'},{w:'Grazie',t:'Obrigado',ph:'/ˈɡraːtsje/'},{w:'Sbagliare',t:'Errar',ph:'/zbaʎˈʎaːre/'},{w:'Piacere',t:'Prazer',ph:'/pjaˈtʃeːre/'}],
    japonês:[{w:'こんにちは',t:'Olá (Konnichiwa)',ph:'/ko.n.ni.tɕi.wa/'},{w:'ありがとう',t:'Obrigado (Arigatou)',ph:'/a.ɾi.ɡa.to.ɯ/'},{w:'すみません',t:'Com licença (Sumimasen)',ph:'/sɯ.mi.ma.se.n/'}],
  };
  window._pronuncInit=function(){_buildLangBar();_loadWord();_renderHistory();};
  function _buildLangBar(){const b=document.getElementById('pronunc-lang-bar');if(!b)return;b.innerHTML=LANGS.map(l=>`<div class="learn-lang-btn${l.key===_pLang?' active':''}" onclick="_pronuncSetLang('${l.key}',this)">${l.flag} ${l.label}</div>`).join('');}
  window._pronuncSetLang=function(lang,el){_pLang=lang;document.querySelectorAll('#pronunc-lang-bar .learn-lang-btn').forEach(b=>b.classList.remove('active'));if(el)el.classList.add('active');_loadWord();_hideFeedback();};
  function _loadWord(){const pool=WORD_POOLS[_pLang]||WORD_POOLS['inglês'];const unseen=pool.filter(w=>!_pHistory.find(h=>h.word===w.w));const src=unseen.length>0?unseen:pool;const pick=src[Math.floor(Math.random()*src.length)];_pCurrentWord=pick;const w=document.getElementById('pronunc-word'),t=document.getElementById('pronunc-trans'),ph=document.getElementById('pronunc-phonetic');if(w)w.textContent=pick.w;if(t)t.textContent=pick.t;if(ph){ph.textContent=pick.ph||'';ph.style.display=pick.ph?'inline-block':'none';}_hideFeedback();const s=document.getElementById('pronunc-mic-status');if(s)s.textContent='Toque para gravar';}
  window.pronuncOuvir=function(){if(!_pCurrentWord||_pSpeaking)return;const btn=document.getElementById('pronunc-ouvir-btn');const langMap={inglês:'en-US',espanhol:'es-ES',francês:'fr-FR',alemão:'de-DE',italiano:'it-IT',japonês:'ja-JP'};const u=new SpeechSynthesisUtterance(_pCurrentWord.w);u.lang=langMap[_pLang]||'en-US';u.rate=0.85;_pSpeaking=true;if(btn){btn.style.opacity='0.5';btn.disabled=true;}u.onend=()=>{_pSpeaking=false;if(btn){btn.style.opacity='1';btn.disabled=false;}};u.onerror=()=>{_pSpeaking=false;if(btn){btn.style.opacity='1';btn.disabled=false;}};speechSynthesis.cancel();speechSynthesis.speak(u);};
  window.pronuncNova=function(){speechSynthesis.cancel();_loadWord();};
  window.pronuncToggleMic=function(){if(_pRecording){_stopRec();}else{_startRec();}};
  async function _startRec(){try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});_pChunks=[];_pMediaRec=new MediaRecorder(stream);_pMediaRec.ondataavailable=e=>{if(e.data.size>0)_pChunks.push(e.data);};_pMediaRec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());_processRec();};_pMediaRec.start();_pRecording=true;_updateMicUI(true);}catch(e){showToast('⚠️ Microfone não disponível','error');}}
  function _stopRec(){if(_pMediaRec&&_pMediaRec.state!=='inactive')_pMediaRec.stop();_pRecording=false;_updateMicUI(false);}
  function _updateMicUI(rec){const btn=document.getElementById('pronunc-mic-btn'),wave=document.getElementById('pronunc-wave'),status=document.getElementById('pronunc-mic-status');if(btn){btn.style.background=rec?'linear-gradient(135deg,var(--red),#ff8800)':'linear-gradient(135deg,var(--accent2),var(--accent))';btn.textContent=rec?'⏹':'🎤';}if(wave)wave.style.display=rec?'flex':'none';if(status)status.textContent=rec?'Gravando... toque para parar':'Analisando...';}
  async function _processRec(){const status=document.getElementById('pronunc-mic-status');if(status)status.textContent='IA avaliando...';const SpeechRec=window.SpeechRecognition||window.webkitSpeechRecognition;if(SpeechRec){const langMap={inglês:'en-US',espanhol:'es-ES',francês:'fr-FR',alemão:'de-DE',italiano:'it-IT',japonês:'ja-JP'};const rec=new SpeechRec();rec.lang=langMap[_pLang]||'en-US';rec.interimResults=false;rec.maxAlternatives=3;rec.onresult=(e)=>{const alts=Array.from(e.results[0]).map(r=>r.transcript.trim().toLowerCase());_evalWithAI(alts.join('|'));};rec.onerror=()=>{_evalWithAI('');};rec.start();setTimeout(()=>{try{rec.stop();}catch(e){}},3500);}else{_evalWithAI('');}}
  async function _evalWithAI(transcript){const word=_pCurrentWord;if(!word)return;const prompt=transcript?`Você é avaliador de pronúncia. O estudante devia pronunciar "${word.w}" em ${_pLang} (tradução: "${word.t}", fonética: "${word.ph}"). O reconhecimento captou: "${transcript}". Avalie de 0 a 100 com feedback motivador em português. Retorne APENAS JSON: {"score":85,"label":"Muito Bom!","desc":"Sua pronúncia ficou clara.","tips":"Dica de melhoria."}`:`Avalie a prática da palavra "${word.w}" em ${_pLang} (fonética: "${word.ph}"). Microfone não captou claramente. Dê dicas de pronúncia. Retorne APENAS JSON: {"score":60,"label":"Tente novamente!","desc":"Não captei sua voz.","tips":"Dica: ${word.ph}"}`;try{const backendUrl=getBackendUrl();const token=await getAuthToken();const res=await fetch(backendUrl+'/api/claude',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(token||'')},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:300})});const data=await res.json();const txt=(data.content||[]).map(b=>b.text||'').join('').trim();let result;try{result=JSON.parse(txt);}catch(e){const m=txt.match(/\{[\s\S]*\}/);result=m?JSON.parse(m[0]):{score:65,label:'Bom esforço!',desc:'Continue praticando!',tips:'Ouça e repita em voz alta.'};}_showFeedback(result);}catch(e){_showFeedback({score:65,label:'Erro de conexão',desc:'Verifique sua conexão.',tips:'Tente novamente.'});}}
  function _showFeedback(r){const score=Math.max(0,Math.min(100,r.score||0));const color=score>=80?'var(--green)':score>=55?'var(--yellow)':'var(--red)';const ring=document.getElementById('pronunc-score-ring'),label=document.getElementById('pronunc-score-label'),desc=document.getElementById('pronunc-score-desc'),detail=document.getElementById('pronunc-detail'),fb=document.getElementById('pronunc-feedback'),status=document.getElementById('pronunc-mic-status');if(ring){ring.textContent=score;ring.style.borderColor=color;ring.style.color=color;}if(label){label.textContent=r.label||'';label.style.color=color;}if(desc)desc.textContent=r.desc||'';if(detail)detail.innerHTML=`<strong style="color:var(--accent)">💡 Dica:</strong> ${r.tips||''}`;if(fb)fb.style.display='block';if(status)status.textContent='Toque para tentar novamente';const pts=Math.round(score/10);_pScore+=pts;_pHistory.unshift({word:_pCurrentWord.w,score,pts,lang:_pLang,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})});if(_pHistory.length>20)_pHistory.pop();document.getElementById('pronunc-score-badge').textContent=_pScore+' pts';_renderHistory();addPts(pts,'pronunOk');}
  function _hideFeedback(){const fb=document.getElementById('pronunc-feedback');if(fb)fb.style.display='none';const wave=document.getElementById('pronunc-wave');if(wave)wave.style.display='none';const btn=document.getElementById('pronunc-mic-btn');if(btn){btn.style.background='linear-gradient(135deg,var(--accent2),var(--accent))';btn.textContent='🎤';}const s=document.getElementById('pronunc-mic-status');if(s)s.textContent='Toque para gravar';}
  function _renderHistory(){const cont=document.getElementById('pronunc-history');if(!cont)return;if(!_pHistory.length){cont.innerHTML='';return;}const color=s=>s>=80?'var(--green)':s>=55?'var(--yellow)':'var(--red)';cont.innerHTML=`<div style="font-size:10px;font-weight:700;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:6px;">HISTÓRICO RECENTE</div>`+_pHistory.slice(0,6).map(h=>`<div style="display:flex;align-items:center;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 13px;"><div style="font-size:11px;font-family:var(--mono);color:${color(h.score)};font-weight:900;width:36px;text-align:center;">${h.score}</div><div style="flex:1;"><div style="font-size:14px;font-weight:700;">${h.word}</div><div style="font-size:10px;color:var(--muted);">${h.lang} · ${h.time}</div></div><div style="font-size:11px;font-weight:700;font-family:var(--mono);color:var(--yellow);">+${h.pts}pts</div></div>`).join('');}
})();

// ══════════════════════════════════════════════════════════
//  MÓDULO SHADOWING — Azure Speech SDK + VAD + Playback
// ══════════════════════════════════════════════════════════
(function(){
  let _sLang='inglês',_sScore=0,_sCurrentPhrase=null,_sHistory=[],_sRecording=false,_sMediaRec=null,_sChunks=[],_sHeard=false,_sAudioBlob=null,_azureKey=null,_azureRegion=null;
  const LANGS=[{key:'inglês',flag:'<span class="flag-emoji">🇺🇸</span>',label:'Inglês'},{key:'espanhol',flag:'<span class="flag-emoji">🇪🇸</span>',label:'Espanhol'},{key:'francês',flag:'<span class="flag-emoji">🇫🇷</span>',label:'Francês'},{key:'alemão',flag:'<span class="flag-emoji">🇩🇪</span>',label:'Alemão'},{key:'italiano',flag:'<span class="flag-emoji">🇮🇹</span>',label:'Italiano'},{key:'japonês',flag:'<span class="flag-emoji">🇯🇵</span>',label:'Japonês'}];
  const LANG_MAP={inglês:'en-US',espanhol:'es-ES',francês:'fr-FR',alemão:'de-DE',italiano:'it-IT',japonês:'ja-JP'};
  const PHRASES={
    inglês:[{p:'How are you doing today?',t:'Como você está hoje?'},{p:'Nice to meet you, my name is...',t:'Prazer em conhecê-lo, meu nome é...'},{p:'Could you please speak more slowly?',t:'Você poderia falar mais devagar?'},{p:'I would like to order a coffee, please.',t:'Eu gostaria de pedir um café, por favor.'},{p:'What time does the next train leave?',t:'A que horas parte o próximo trem?'},{p:'Thank you so much for your help.',t:'Muito obrigado pela sua ajuda.'},{p:'I have been learning English for two years.',t:'Estou aprendendo inglês há dois anos.'}],
    espanhol:[{p:'¿Cómo estás hoy?',t:'Como você está hoje?'},{p:'Mucho gusto, me llamo...',t:'Prazer, meu nome é...'},{p:'¿Puedes hablar más despacio, por favor?',t:'Você pode falar mais devagar?'},{p:'¿A qué hora sale el próximo tren?',t:'A que horas sai o próximo trem?'}],
    francês:[{p:"Comment allez-vous aujourd'hui?",t:'Como vai você hoje?'},{p:'Enchanté de vous rencontrer.',t:'Prazer em conhecê-lo.'},{p:'Pourriez-vous parler plus lentement?',t:'Poderia falar mais devagar?'}],
    alemão:[{p:'Wie geht es Ihnen heute?',t:'Como vai você hoje?'},{p:'Schön, Sie kennenzulernen.',t:'Prazer em conhecê-lo.'},{p:'Könnten Sie bitte langsamer sprechen?',t:'Poderia falar mais devagar?'}],
    italiano:[{p:'Come sta oggi?',t:'Como vai você hoje?'},{p:'Piacere di conoscerla.',t:'Prazer em conhecê-lo.'},{p:'Potrebbe parlare più lentamente?',t:'Poderia falar mais devagar?'}],
    japonês:[{p:'お元気ですか？',t:'Como vai você? (O-genki desu ka?)'},{p:'はじめまして。',t:'Prazer em conhecê-lo. (Hajimemashite.)'},{p:'もう少しゆっくり話してください。',t:'Por favor, fale mais devagar. (Mou sukoshi yukkuri hanashite kudasai.)'}],
  };

  // ── Busca credenciais Azure do backend ──────────────────
  async function _getAzureCreds(){
    if(_azureKey&&_azureRegion)return{key:_azureKey,region:_azureRegion};
    try{
      const backendUrl=getBackendUrl();const token=await getAuthToken();
      const res=await fetch(backendUrl+'/api/azure-speech-token',{headers:{'Authorization':'Bearer '+(token||'')}});
      if(res.ok){const d=await res.json();_azureKey=d.key||d.subscriptionKey;_azureRegion=d.region||'eastus';return{key:_azureKey,region:_azureRegion};}
    }catch(e){}
    // Fallback: lê de variável de ambiente injetada no HTML (window.AZURE_SPEECH_KEY)
    if(window.AZURE_SPEECH_KEY){_azureKey=window.AZURE_SPEECH_KEY;_azureRegion=window.AZURE_SPEECH_REGION||'eastus';return{key:_azureKey,region:_azureRegion};}
    return null;
  }

  window._shadowingInit=function(){_buildLangBar();_loadPhrase();};
  function _buildLangBar(){const b=document.getElementById('shadow-lang-bar');if(!b)return;b.innerHTML=LANGS.map(l=>`<div class="learn-lang-btn${l.key===_sLang?' active':''}" onclick="_shadowSetLang('${l.key}',this)">${l.flag} ${l.label}</div>`).join('');}
  window._shadowSetLang=function(lang,el){_sLang=lang;document.querySelectorAll('#shadow-lang-bar .learn-lang-btn').forEach(b=>b.classList.remove('active'));if(el)el.classList.add('active');_loadPhrase();};
  function _loadPhrase(){const pool=PHRASES[_sLang]||PHRASES['inglês'];const pick=pool[Math.floor(Math.random()*pool.length)];_sCurrentPhrase=pick;const p=document.getElementById('shadow-phrase'),t=document.getElementById('shadow-phrase-trans');if(p)p.textContent=pick.p;if(t)t.textContent=pick.t;_hideShadowFeedback();_sHeard=false;_sAudioBlob=null;const step=document.getElementById('shadow-step');if(step)step.textContent='Passo 1: Ouça o áudio nativo acima';const status=document.getElementById('shadow-mic-status');if(status)status.textContent='Ouça primeiro, depois imite';}

  window.shadowOuvir=function(){
    if(!_sCurrentPhrase)return;
    const btn=document.getElementById('shadow-ouvir-btn');
    const u=new SpeechSynthesisUtterance(_sCurrentPhrase.p);
    u.lang=LANG_MAP[_sLang]||'en-US';u.rate=0.8;
    u.onend=()=>{if(btn){btn.style.opacity='1';btn.disabled=false;}_sHeard=true;
      const step=document.getElementById('shadow-step');if(step)step.textContent='Passo 2: Toque no microfone — pare de falar e ele analisa sozinho ✨';
      const status=document.getElementById('shadow-mic-status');if(status)status.textContent='Pronto! Toque 1x para imitar';
    };
    if(btn){btn.style.opacity='0.5';btn.disabled=true;}
    speechSynthesis.cancel();speechSynthesis.speak(u);
  };

  window.shadowNova=function(){speechSynthesis.cancel();_loadPhrase();};

  // ── 1 clique: inicia. Para automaticamente via VAD ──────
  window.shadowToggleMic=function(){
    if(!_sHeard){showToast('⚠️ Ouça o áudio primeiro!','info');return;}
    if(_sRecording){_stopShadowRec();}else{_startShadowRec();}
  };

  async function _startShadowRec(){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,sampleRate:16000});
      _sChunks=[];_sAudioBlob=null;
      const mimeType=MediaRecorder.isTypeSupported('audio/webm;codecs=opus')?'audio/webm;codecs=opus':'audio/webm';
      _sMediaRec=new MediaRecorder(stream,{mimeType});
      _sMediaRec.ondataavailable=e=>{if(e.data.size>0)_sChunks.push(e.data);};
      _sMediaRec.onstop=()=>{stream.getTracks().forEach(t=>t.stop());_sAudioBlob=new Blob(_sChunks,{type:mimeType});_processShadowRec();};
      _sMediaRec.start(100);
      _sRecording=true;_updateShadowMicUI(true);
      // VAD: silêncio por 1.8s → para automaticamente
      _startVAD(stream,()=>{if(_sRecording)_stopShadowRec();});
    }catch(e){showToast('⚠️ Microfone não disponível','error');}
  }

  function _stopShadowRec(){if(_sMediaRec&&_sMediaRec.state!=='inactive')_sMediaRec.stop();_sRecording=false;_updateShadowMicUI(false);}

  // ── VAD usando AudioContext + RMS ───────────────────────
  function _startVAD(stream,onSilence){
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const src=ctx.createMediaStreamSource(stream);
    const analyser=ctx.createAnalyser();analyser.fftSize=512;
    src.connect(analyser);
    const buf=new Uint8Array(analyser.fftSize);
    let silenceStart=null,talking=false,vadActive=true;
    const SILENCE_THRESH=8,SILENCE_DELAY=1800,MAX_REC=12000;
    const t0=Date.now();
    function check(){
      if(!vadActive)return;
      analyser.getByteTimeDomainData(buf);
      let rms=0;for(let i=0;i<buf.length;i++){const v=(buf[i]-128)/128;rms+=v*v;}
      rms=Math.sqrt(rms/buf.length)*100;
      if(rms>SILENCE_THRESH){talking=true;silenceStart=null;}
      else if(talking){if(!silenceStart)silenceStart=Date.now();else if(Date.now()-silenceStart>SILENCE_DELAY){vadActive=false;ctx.close();onSilence();return;}}
      if(Date.now()-t0>MAX_REC){vadActive=false;ctx.close();onSilence();return;}
      requestAnimationFrame(check);
    }
    requestAnimationFrame(check);
  }

  function _updateShadowMicUI(rec){
    const btn=document.getElementById('shadow-mic-btn'),wave=document.getElementById('shadow-wave'),status=document.getElementById('shadow-mic-status');
    if(btn){btn.style.background=rec?'linear-gradient(135deg,var(--red),#ff8800)':'linear-gradient(135deg,#00b360,var(--green))';btn.textContent=rec?'🔴':'🎤';}
    if(wave)wave.style.display=rec?'flex':'none';
    if(status)status.textContent=rec?'🎤 Gravando... fale e pare, análise automática':'Analisando...';
  }

  // ── Processa: playback → Azure STT → avalia ─────────────
  async function _processShadowRec(){
    const status=document.getElementById('shadow-mic-status');
    if(status)status.textContent='🔊 Reproduzindo sua voz...';
    // 1) Playback da gravação antes de avaliar
    if(_sAudioBlob){
      await new Promise(resolve=>{
        const url=URL.createObjectURL(_sAudioBlob);
        const audio=new Audio(url);
        audio.onended=()=>{URL.revokeObjectURL(url);resolve();};
        audio.onerror=()=>resolve();
        audio.play().catch(()=>resolve());
      });
    }
    if(status)status.textContent='🧠 IA comparando com o original...';
    // 2) Transcreve via Azure Speech ou fallback
    const transcript=await _transcribeAzure(_sAudioBlob);
    _evalShadow(transcript);
  }

  // ── Azure Speech REST API (rápido, sem SDK) ─────────────
  async function _transcribeAzure(blob){
    try{
      const creds=await _getAzureCreds();
      if(!creds||!creds.key)throw new Error('no-creds');
      const lang=LANG_MAP[_sLang]||'en-US';
      // Converte blob para WAV 16kHz mono via OfflineAudioContext
      const wavBlob=await _toWav(blob);
      const arrayBuf=await wavBlob.arrayBuffer();
      const url=`https://${creds.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=simple`;
      const res=await fetch(url,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':creds.key,'Content-Type':'audio/wav;codecs=audio/pcm;samplerate=16000','Accept':'application/json'},body:arrayBuf});
      if(!res.ok)throw new Error('azure-err-'+res.status);
      const data=await res.json();
      return data.DisplayText||data.NBest?.[0]?.Display||'';
    }catch(e){
      // fallback: webkitSpeechRecognition
      return _transcribeBrowser();
    }
  }

  // ── Converte áudio para WAV PCM 16kHz mono ──────────────
  async function _toWav(blob){
    try{
      const arrBuf=await blob.arrayBuffer();
      const ctx=new OfflineAudioContext(1,1,16000);
      const decoded=await new AudioContext().decodeAudioData(arrBuf);
      const offCtx=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000);
      const src=offCtx.createBufferSource();src.buffer=decoded;src.connect(offCtx.destination);src.start();
      const rendered=await offCtx.startRendering();
      const pcm=rendered.getChannelData(0);
      // Monta WAV header
      const buf=new ArrayBuffer(44+pcm.length*2);const view=new DataView(buf);
      const writeStr=(off,str)=>{for(let i=0;i<str.length;i++)view.setUint8(off+i,str.charCodeAt(i));};
      writeStr(0,'RIFF');view.setUint32(4,36+pcm.length*2,true);writeStr(8,'WAVE');
      writeStr(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
      view.setUint32(24,16000,true);view.setUint32(28,32000,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
      writeStr(36,'data');view.setUint32(40,pcm.length*2,true);
      let off=44;for(let i=0;i<pcm.length;i++){const s=Math.max(-1,Math.min(1,pcm[i]));view.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;}
      return new Blob([buf],{type:'audio/wav'});
    }catch(e){return blob;}
  }

  // ── Fallback: browser Speech Recognition ────────────────
  function _transcribeBrowser(){
    return new Promise(resolve=>{
      const SpeechRec=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SpeechRec)return resolve('');
      const rec=new SpeechRec();rec.lang=LANG_MAP[_sLang]||'en-US';rec.interimResults=false;rec.maxAlternatives=1;
      rec.onresult=e=>resolve(e.results[0][0].transcript||'');
      rec.onerror=()=>resolve('');
      rec.start();setTimeout(()=>{try{rec.stop();}catch(e){}resolve('');},5000);
    });
  }

  async function _evalShadow(transcript){
    const phrase=_sCurrentPhrase;if(!phrase)return;
    const prompt=`Você avalia shadowing (imitação de frase nativa). A frase original era: "${phrase.p}" em ${_sLang}. O estudante disse: "${transcript||'(não captado)'}". Compare as frases, avalie fluência, ritmo e precisão de 0 a 100. Dê feedback motivador em português. Retorne APENAS JSON: {"score":80,"label":"Ótimo ritmo!","desc":"Você capturou bem o padrão.","tips":"Atenção na entonação da segunda parte."}`;
    try{
      const backendUrl=getBackendUrl();const token=await getAuthToken();
      const res=await fetch(backendUrl+'/api/claude',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(token||'')},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:300})});
      const data=await res.json();const txt=(data.content||[]).map(b=>b.text||'').join('').trim();
      let result;try{result=JSON.parse(txt);}catch(e){const m=txt.match(/\{[\s\S]*\}/);result=m?JSON.parse(m[0]):{score:65,label:'Bom esforço!',desc:'Continue praticando!',tips:'Repita várias vezes para ganhar fluência.'};}
      _showShadowFeedback(result,transcript);
    }catch(e){_showShadowFeedback({score:65,label:'Erro',desc:'Tente novamente.',tips:'Verifique sua conexão.'},transcript);}
  }

  function _showShadowFeedback(r,transcript){
    const score=Math.max(0,Math.min(100,r.score||0));const color=score>=80?'var(--green)':score>=55?'var(--yellow)':'var(--red)';
    const fb=document.getElementById('shadow-feedback');if(!fb)return;
    fb.style.display='block';
    fb.innerHTML=`<div style="font-size:11px;font-weight:700;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:10px;">AVALIAÇÃO DO SHADOWING</div>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
      <div style="width:60px;height:60px;border-radius:50%;border:4px solid ${color};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:${color};flex-shrink:0;">${score}</div>
      <div><div style="font-size:15px;font-weight:800;color:${color};margin-bottom:4px;">${r.label||''}</div><div style="font-size:12px;color:var(--muted);">${r.desc||''}</div></div>
    </div>
    ${transcript?`<div style="font-size:12px;background:var(--surface);border-radius:10px;padding:10px;margin-bottom:10px;color:var(--muted);">🎤 Você disse: <em>"${transcript}"</em></div>`:''}
    <div style="font-size:13px;color:var(--text);background:var(--surface);border-radius:10px;padding:10px;margin-bottom:10px;">💡 ${r.tips||''}</div>
    ${_sAudioBlob?`<button onclick="shadowPlayback()" style="width:100%;padding:10px;border-radius:12px;background:var(--surface);border:1px solid var(--border);color:var(--muted);font-family:var(--font);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:8px;">🔊 Ouvir minha gravação novamente</button>`:''}
    <button onclick="shadowNova()" style="width:100%;padding:12px;border-radius:12px;background:linear-gradient(135deg,#00b360,var(--green));border:none;color:#fff;font-family:var(--font);font-size:14px;font-weight:700;cursor:pointer;">▶ Próxima frase</button>`;
    const pts=Math.round(score/10);_sScore+=pts;
    _sHistory.unshift({phrase:phrase.p.substring(0,30),score,pts,lang:_sLang});if(_sHistory.length>20)_sHistory.pop();
    const badge=document.getElementById('shadow-score-badge');if(badge)badge.textContent=_sScore+' pts';
    addPts(pts,'shadowOk');
    const step=document.getElementById('shadow-step');if(step)step.textContent='Resultado acima 👆 Toque em "Próxima frase" para continuar';
  }

  // Botão replay no feedback
  window.shadowPlayback=function(){
    if(!_sAudioBlob)return;
    const url=URL.createObjectURL(_sAudioBlob);
    const audio=new Audio(url);audio.onended=()=>URL.revokeObjectURL(url);audio.play().catch(()=>{});
  };

  function _hideShadowFeedback(){
    const fb=document.getElementById('shadow-feedback');if(fb)fb.style.display='none';
    const wave=document.getElementById('shadow-wave');if(wave)wave.style.display='none';
    const btn=document.getElementById('shadow-mic-btn');if(btn){btn.style.background='linear-gradient(135deg,#00b360,var(--green))';btn.textContent='🎤';}
    const status=document.getElementById('shadow-mic-status');if(status)status.textContent='Ouça primeiro, depois imite';
  }
})();

// ══════════════════════════════════════════════════════════
//  MÓDULO DIÁRIO DE IDIOMA
// ══════════════════════════════════════════════════════════
(function(){
  let _dLang='inglês';
  const LANGS=[{key:'inglês',flag:'<span class="flag-emoji">🇺🇸</span>',label:'Inglês'},{key:'espanhol',flag:'<span class="flag-emoji">🇪🇸</span>',label:'Espanhol'},{key:'francês',flag:'<span class="flag-emoji">🇫🇷</span>',label:'Francês'},{key:'alemão',flag:'<span class="flag-emoji">🇩🇪</span>',label:'Alemão'},{key:'italiano',flag:'<span class="flag-emoji">🇮🇹</span>',label:'Italiano'},{key:'japonês',flag:'<span class="flag-emoji">🇯🇵</span>',label:'Japonês'}];
  let _dHistory=[];
  window._diarioInit=function(){_buildLangBar();_renderDiarioHistory();};
  function _buildLangBar(){const b=document.getElementById('diario-lang-bar');if(!b)return;b.innerHTML=LANGS.map(l=>`<div class="learn-lang-btn${l.key===_dLang?' active':''}" onclick="_diarioSetLang('${l.key}',this)">${l.flag} ${l.label}</div>`).join('');}
  window._diarioSetLang=function(lang,el){_dLang=lang;document.querySelectorAll('#diario-lang-bar .learn-lang-btn').forEach(b=>b.classList.remove('active'));if(el)el.classList.add('active');};
  window.diarioEnviar=async function(){const input=document.getElementById('diario-input');const text=(input?.value||'').trim();if(!text){showToast('Escreva algo primeiro!','info');return;}const btn=document.getElementById('diario-btn');if(btn){btn.textContent='✨ Analisando...';btn.disabled=true;}const prompt=`Você é professor de ${_dLang}. O estudante escreveu este texto em português: "${text}". Faça 3 coisas: 1) Corrija e melhore o texto em português (se necessário), 2) Traduza para ${_dLang} de forma natural, 3) Dê feedback de gramática e estilo em português. Retorne APENAS JSON: {"original":"${text}","corrigido":"texto corrigido em pt","traduzido":"tradução em ${_dLang}","feedback":"feedback detalhado sobre gramática e estilo","pontos":["ponto positivo 1","ponto positivo 2"],"melhorias":["sugestão de melhoria 1"]}`;
  try{const backendUrl=getBackendUrl();const token=await getAuthToken();const res=await fetch(backendUrl+'/api/claude',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(token||'')},body:JSON.stringify({messages:[{role:'user',content:prompt}],max_tokens:800})});const data=await res.json();const txt=(data.content||[]).map(b=>b.text||'').join('').trim();let result;try{result=JSON.parse(txt);}catch(e){const m=txt.match(/\{[\s\S]*\}/);result=m?JSON.parse(m[0]):null;}if(!result)throw new Error('parse');_showDiarioResult(result);}catch(e){showToast('Erro ao processar. Verifique sua conexão.','error');}finally{if(btn){btn.textContent='✨ Corrigir e Traduzir com IA';btn.disabled=false;}}};
  function _showDiarioResult(r){const res=document.getElementById('diario-result');if(!res)return;res.style.display='block';res.innerHTML=`<div style="font-size:11px;font-weight:700;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:12px;">ANÁLISE DA IA</div>
  <div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:4px;font-family:var(--mono);">📝 TRADUÇÃO EM ${_dLang.toUpperCase()}</div><div style="background:var(--adim);border:1px solid rgba(0,229,255,.2);border-radius:10px;padding:12px;font-size:14px;font-weight:600;color:var(--accent);line-height:1.5;">${r.traduzido||'—'}</div></div>
  ${r.corrigido&&r.corrigido!==r.original?`<div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:4px;font-family:var(--mono);">✅ TEXTO CORRIGIDO</div><div style="background:var(--gdim);border:1px solid rgba(0,255,136,.2);border-radius:10px;padding:12px;font-size:13px;line-height:1.5;">${r.corrigido}</div></div>`:''}
  <div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:4px;font-family:var(--mono);">💡 FEEDBACK</div><div style="font-size:13px;line-height:1.6;color:var(--text);">${r.feedback||''}</div></div>
  ${r.pontos?.length?`<div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:var(--green);margin-bottom:6px;font-family:var(--mono);">👍 PONTOS POSITIVOS</div>${r.pontos.map(p=>`<div style="font-size:12px;color:var(--text);padding:4px 0;border-bottom:1px solid var(--border);">✓ ${p}</div>`).join('')}</div>`:''}
  ${r.melhorias?.length?`<div style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:var(--yellow);margin-bottom:6px;font-family:var(--mono);">⚡ SUGESTÕES</div>${r.melhorias.map(m=>`<div style="font-size:12px;color:var(--text);padding:4px 0;border-bottom:1px solid var(--border);">→ ${m}</div>`).join('')}</div>`:''}`;
  _dHistory.unshift({text:r.original?.substring(0,50)||'...',translated:r.traduzido?.substring(0,50)||'',lang:_dLang,time:new Date().toLocaleDateString('pt-BR')});if(_dHistory.length>10)_dHistory.pop();_renderDiarioHistory();addPts(5,'diarioOk');}
  function _renderDiarioHistory(){const cont=document.getElementById('diario-history');if(!cont)return;if(!_dHistory.length){cont.innerHTML='';return;}cont.innerHTML=`<div style="font-size:10px;font-weight:700;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:6px;">ENTRADAS ANTERIORES</div>`+_dHistory.map(h=>`<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 13px;"><div style="font-size:12px;font-weight:700;margin-bottom:2px;">${h.text}...</div><div style="font-size:11px;color:var(--accent);margin-bottom:2px;">${h.translated}...</div><div style="font-size:10px;color:var(--muted);">${h.lang} · ${h.time}</div></div>`).join('');}
})();

// ══════════════════════════════════════════════════════════
//  AIVOX DEBUG PANEL — acesse via: aivoxDebug() no console
// ══════════════════════════════════════════════════════════
window.aivoxDebug = function() {
  var fbUser = window._fbUser;
  var salaSocket = window._salaSocket;
  var presSocket = window._presenceSocket;
  var ami = window._ami;
  var activeSocket = salaSocket || presSocket;
  var dbg = window._amiDebug;
  console.log('%c━━━ AIVOX DEBUG PANEL ━━━', 'color:#00e5ff;font-size:14px;font-weight:bold');
  console.log('%c AUTH', 'color:#a855f7;font-weight:bold');
  if (fbUser) {
    console.log('  UID:', fbUser.uid, '| Nome:', fbUser.displayName, '| Plan:', fbUser.plan || 'N/A');
    console.log('  Minutos:', fbUser.minutesUsed, '/', fbUser.minutesLimit);
  } else {
    console.log('  ERRO: _fbUser nao definido');
  }
  console.log('%c SOCKETS', 'color:#00ff88;font-weight:bold');
  console.log('  SalaSocket:', salaSocket ? (salaSocket.connected ? 'Conectado ID:'+salaSocket.id : 'Desconectado') : 'nao existe');
  console.log('  PresenceSocket:', presSocket ? (presSocket.connected ? 'Conectado ID:'+presSocket.id : 'Desconectado') : 'nao existe');
  console.log('%c PRESENCA', 'color:#ffd700;font-weight:bold');
  if (dbg && dbg.presenceEmitted) {
    console.log('  ami-online emitido em:', dbg.presenceEmitted.ts, '| UID:', dbg.presenceEmitted.uid);
  } else {
    console.log('  PROBLEMA: ami-online nao foi emitido. Use _amiForceOnline()');
  }
  console.log('%c AMIGOS', 'color:#ec4899;font-weight:bold');
  if (ami) {
    console.log('  Total:', ami.friends ? ami.friends.length : 0, '| Online local:', Object.keys(ami.online || {}).length);
  } else {
    console.log('  _ami nao encontrado');
  }
  console.log('%c DIAGNOSTICO', 'color:#00e5ff;font-weight:bold');
  if (!fbUser) console.log('  ERRO: Usuario nao autenticado');
  if (!activeSocket || !activeSocket.connected) console.log('  ERRO: Nenhum socket conectado');
  if (!dbg || !dbg.presenceEmitted) console.log('  AVISO: ami-online nao emitido. Chame _amiForceOnline()');
  if (fbUser && activeSocket && activeSocket.connected && dbg && dbg.presenceEmitted) console.log('  Tudo parece normal');
  console.log('Comandos: _amiForceOnline() | _ami | _fbUser | _amiDebug');
};
window._amiForceOnline = function() {
  var s = window._salaSocket || window._presenceSocket;
  var uid = window._fbUser ? window._fbUser.uid : null;
  var name = window._fbUser ? (window._fbUser.displayName || 'Usuario') : 'Usuario';
  if (!s) { console.log('[AIVOX] Nenhum socket disponivel'); return; }
  if (!uid) { console.log('[AIVOX] _fbUser nao disponivel'); return; }
  s.emit('ami-online', { uid: uid, name: name });
  window._amiDebug = window._amiDebug || {};
  window._amiDebug.presenceEmitted = { uid: uid, name: name, ts: new Date().toISOString(), socket: s.id, forced: true };
  console.log('[AIVOX] ami-online forcado:', uid, name);
};
console.log('[AIVOX] Debug carregado. Use aivoxDebug() no console.');

// ── Override learnTab to init livre ──────────────────────────
const _origLearnTab=window.learnTab;
window.learnTab=function(tab,el){
  document.querySelectorAll('.learn-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.learn-tab-panel').forEach(p=>p.classList.remove('active'));
  if(el)el.classList.add('active');
  const panel=document.getElementById('ltp-'+tab);
  if(panel)panel.classList.add('active');
  if(tab==='licoes')renderLicoes();
  if(tab==='flash')renderFlash();
  if(tab==='exer')renderExer();
  if(tab==='vocab')renderVocab();
  if(tab==='livre')renderLivre();
  if(tab==='pronunc') window._pronuncInit?.();
  if(tab==='shadowing') window._shadowingInit?.();
  if(tab==='diario') window._diarioInit?.();
};

// ── Hook _learnAddBubble to show vocab chips ─────────────────
const _origLearnAddBubble=window._learnAddBubble;
window._learnAddBubble=function(type,html,speak){
  const bubs=document.getElementById('learn-bubs'); if(!bubs)return;
  const div=document.createElement('div'); div.className='learn-bubble '+type;
  if(type==='ai'){
    div.innerHTML='<div class="lb-label">🎓 PROFESSOR AIVOX</div>'+html+'<div class="lb-actions"><button class="lb-btn" onclick="_learnSpeak(this)">🔊 Ouvir</button><button class="lb-btn" onclick="_learnSave(this)">📖 Salvar</button></div>';
    // Auto-extract vocab chips
    const words=_extractVocabFromAI(html.replace(/<[^>]*>/g,''),_learnLang);
    if(words.length) setTimeout(()=>_showVocabChips(words,_learnLang,div),100);
  }else{
    div.innerHTML='<div style="font-size:10px;color:var(--muted);margin-bottom:3px;">VOCÊ</div>'+html;
  }
  bubs.appendChild(div); bubs.scrollTop=bubs.scrollHeight;
  if(speak&&html&&_learnVoice)_speakTranslation(html.replace(/<[^>]*>/g,''));
};

// ── Init melhorias ────────────────────────────────────────────
(function(){
  const pl=document.getElementById('page-learn');
  if(pl){
    const obs2=new MutationObserver(()=>{
      if(pl.classList.contains('active')){
        renderProgressBar();
        setTimeout(_syncProgressFirestore, 2000);
      }
    });
    obs2.observe(pl,{attributeFilter:['class']});
  }
})();
