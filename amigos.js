// ════════════════════════════════════════════════════════════
//  AIVOX · MÓDULO AMIGOS
//  Comunicação via Socket.io (já presente no projeto)
//  Áudio P2P via WebRTC (gratuito, sem custo de API)
//  Chat via Firestore (gratuito no plano Spark)
// ════════════════════════════════════════════════════════════

const _ami = {
  friends: [], online: {}, pending: { received: [], sent: [] },
  currentChat: null, chatMessages: {},
  pc: null, localStream: null, remoteStream: null,
  callUid: null, callTimer: null, callSeconds: 0,
  isMuted: false, isCaller: false, pendingIce: [],
  _pendingOffer: null, // FIX: inicializado explicitamente
  // ── Fase 4A: Tradução em chamada ──────────────────────────────
  transEnabled:   false,
  voiceClone:     true,
  transFromLang:  'pt-BR',
  transToLang:    'en-US',
  transProcessor: null,
  transAudioCtx:  null,
  transQueue:     [],
  transSeqOut:    0,
  transSeqIn:     0,
  transSpeaking:  false,
};

let _amiTypingTO = null;
let _amiSearchTO = null;
let _amiCurrentTab = 'amigos';

function initAmigoModule() {
  if (!window._fbUser?.uid || !db) { console.warn('[AMI] aguardando auth/db'); return; }
  amiSwitchTab('amigos');
  _amiLoadFriends();
  _amiListenPresence();
  _amiListenMessages();
  _amiLoadVotes();
  _amiUpdateOnlineCount();
  _amiFixFriendNames(); // Corrige nomes errados gravados por bug anterior
}

// Corrige nomes errados na subcoleção friends consultando os friend_requests
async function _amiFixFriendNames() {
  try {
    const myUid = window._fbUser?.uid;
    if (!myUid || !db) return;
    // Busca todos os requests onde EU enviei e foram aceitos
    const snap = await db.collection('friend_requests')
      .where('fromUid', '==', myUid)
      .where('status', '==', 'accepted')
      .get();
    for (const doc of snap.docs) {
      const d = doc.data();
      // O nome correto do amigo (quem aceitou) está em acceptedByName
      const correctName = d.acceptedByName;
      if (!correctName) continue;
      const friendRef = db.collection('users').doc(myUid).collection('friends').doc(d.toUid);
      const friendDoc = await friendRef.get();
      if (friendDoc.exists && friendDoc.data().name !== correctName) {
        await friendRef.update({ name: correctName });
        console.log('[AMI] Nome corrigido:', friendDoc.data().name, '->', correctName);
      }
    }
    // Busca todos os requests onde EU recebi e aceitei
    const snap2 = await db.collection('friend_requests')
      .where('toUid', '==', myUid)
      .where('status', '==', 'accepted')
      .get();
    for (const doc of snap2.docs) {
      const d = doc.data();
      // O nome correto do amigo (quem enviou) está em fromName
      const correctName = d.fromName;
      if (!correctName) continue;
      const friendRef = db.collection('users').doc(myUid).collection('friends').doc(d.fromUid);
      const friendDoc = await friendRef.get();
      if (friendDoc.exists && friendDoc.data().name !== correctName) {
        await friendRef.update({ name: correctName });
        console.log('[AMI] Nome corrigido:', friendDoc.data().name, '->', correctName);
      }
    }
  } catch(e) { console.warn('[AMI] _amiFixFriendNames erro:', e); }
}

function amiSwitchTab(tab) {
  _amiCurrentTab = tab;
  ['amigos','pending','buscar','sugestoes'].forEach(t => {
    document.getElementById('ami-tab-' + t)?.classList.remove('active');
    const p = document.getElementById('ami-panel-' + t);
    if (p) p.style.display = 'none';
  });
  document.getElementById('ami-tab-' + tab)?.classList.add('active');
  const panel = document.getElementById('ami-panel-' + tab);
  if (panel) panel.style.display = 'block';
  if (tab === 'amigos')    _amiRenderFriends();
  if (tab === 'pending')   _amiRenderPending();
  if (tab === 'sugestoes') _amiLoadVotes();
}

async function _amiLoadFriends() {
  try {
    const uid = window._fbUser?.uid;
    if (!uid || !db) return;

    // Lista de amigos confirmados
    db.collection('users').doc(uid).collection('friends')
      .onSnapshot(snap => {
        _ami.friends = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
        _amiRenderFriends();
        _amiUpdateOnlineCount();
      }, e => console.warn('[AMI] friends snap erro:', e.code));

    // Solicitações recebidas (pendentes)
    db.collection('friend_requests').where('toUid','==',uid).where('status','==','pending')
      .onSnapshot(snap => {
        _ami.pending.received = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        _amiUpdatePendingBadge();
        if (_amiCurrentTab === 'pending') _amiRenderPending();
      }, e => console.warn('[AMI] received snap erro:', e.code));

    // Solicitações enviadas (pendentes)
    db.collection('friend_requests').where('fromUid','==',uid).where('status','==','pending')
      .onSnapshot(snap => {
        _ami.pending.sent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (_amiCurrentTab === 'pending') _amiRenderPending();
      }, e => console.warn('[AMI] sent snap erro:', e.code));

    // Auto-adicionar quando outro usuário aceitar minha solicitação
    db.collection('friend_requests').where('fromUid','==',uid)
      .onSnapshot(snap => {
        snap.docChanges().forEach(async change => {
          const d = change.doc.data();
          // Aceito: auto-adicionar como amigo
          // IMPORTANTE: só processa 'modified' para evitar re-processar docs antigos ao iniciar o listener
          if (change.type === 'modified' && d.status === 'accepted') {
            const alreadyFriend = _ami.friends.find(f => f.uid === d.toUid);
            if (alreadyFriend) return;
            try {
              // acceptedByName = nome de quem ACEITOU (o outro usuário, toUid)
              // fromName = nome de quem ENVIOU (eu mesmo — não usar aqui)
              const acceptedByName = d.acceptedByName || 'Amigo';
              await db.collection('users').doc(uid).collection('friends').doc(d.toUid).set({
                uid: d.toUid, name: acceptedByName, addedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              showToast('🎉 ' + acceptedByName + ' aceitou seu pedido!', 'success');
            } catch(e) { console.warn('[AMI] auto-add amigo erro:', e.code); }
          }
          // Removido pelo outro lado: limpa localmente também
          if (change.type === 'modified' && d.status === 'removed' && d.removedBy !== uid) {
            const removedUid = d.toUid === uid ? d.fromUid : d.toUid;
            try {
              await db.collection('users').doc(uid).collection('friends').doc(removedUid).delete();
            } catch(e) {}
            _ami.friends = _ami.friends.filter(f => f.uid !== removedUid);
            delete _ami.online[removedUid];
            _amiRenderFriends(); _amiUpdateOnlineCount();
          }
        });
      }, e => console.warn('[AMI] accepted snap erro:', e.code));
    // Também escuta remoções onde EU sou o toUid
    db.collection('friend_requests').where('toUid','==',uid)
      .onSnapshot(snap => {
        snap.docChanges().forEach(async change => {
          const d = change.doc.data();
          if (change.type === 'modified' && d.status === 'removed' && d.removedBy !== uid) {
            try {
              await db.collection('users').doc(uid).collection('friends').doc(d.fromUid).delete();
            } catch(e) {}
            _ami.friends = _ami.friends.filter(f => f.uid !== d.fromUid);
            delete _ami.online[d.fromUid];
            _amiRenderFriends(); _amiUpdateOnlineCount();
          }
        });
      }, ()=>{});

  } catch (e) { console.warn('[AMI] _amiLoadFriends erro:', e); }
}

function _amiListenPresence() {
  // Presença via Firestore (evita erro 400 do socket dedicado)
  const _doPresence = () => {
    const uid = window._fbUser?.uid;
    const name = window._fbUser?.displayName || 'Usuário';
    if (!uid || !db) { setTimeout(_doPresence, 1000); return; }
    // Escreve presença online no Firestore
    const presRef = db.collection('presence').doc(uid);
    presRef.set({ uid, name, online: true, lastSeen: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true })
      .catch(()=>{});
    // Marca offline ao fechar aba
    window.addEventListener('beforeunload', () => {
      presRef.update({ online: false, lastSeen: firebase.firestore.FieldValue.serverTimestamp() }).catch(()=>{});
    });
    window._amiDebug = window._amiDebug || {};
    window._amiDebug.presenceEmitted = { uid, name, ts: new Date().toISOString(), method: 'firestore' };
    console.log('[AIVOX] Presença Firestore registrada:', uid);
    // Heartbeat a cada 60s para manter online
    clearInterval(window._presenceInterval);
    window._presenceInterval = setInterval(() => {
      if (window._fbUser?.uid) {
        db.collection('presence').doc(window._fbUser.uid)
          .update({ lastSeen: firebase.firestore.FieldValue.serverTimestamp(), online: true }).catch(()=>{});
      }
    }, 60000);
    // Também tenta via socket se disponível (sem criar novo socket)
    const s = window._salaSocket;
    if (s && s.connected) {
      s.emit('ami-online', { uid, name });
    }
  };
  _doPresence();
  // Escuta presença dos amigos via Firestore — escuta doc a doc para evitar permission-denied na query
  const _presenceUnsubs = [];
  const _listenFriendsPresence = () => {
    const uid = window._fbUser?.uid;
    if (!uid || !db || !_ami.friends || _ami.friends.length === 0) {
      setTimeout(_listenFriendsPresence, 2000); return;
    }
    // Cancela listeners anteriores
    _presenceUnsubs.forEach(u => { try { u(); } catch(e){} });
    _presenceUnsubs.length = 0;
    _ami.friends.forEach(f => {
      const fUid = f.uid;
      try {
        const unsub = db.collection('presence').doc(fUid)
          .onSnapshot(doc => {
            if (!doc.exists) { delete _ami.online[fUid]; _amiRenderFriends(); _amiUpdateOnlineCount(); return; }
            const data = doc.data();
            const wasOnline = !!_ami.online[fUid];
            const lastSeen = data.lastSeen?.toMillis?.() || 0;
            const isRecent = (Date.now() - lastSeen) < 120000;
            const isOnline = data.online === true && isRecent;
            if (isOnline) { _ami.online[fUid] = true; }
            else { delete _ami.online[fUid]; }
            if (isOnline && !wasOnline) {
              const friend = _ami.friends.find(ff => ff.uid === fUid);
              if (friend) _amiShowLoginNotif(friend.name || data.name, fUid);
            }
            _amiRenderFriends(); _amiUpdateOnlineCount();
          }, err => {
            // Ignora silenciosamente permission-denied — amigo não configurou presença
            if (err?.code !== 'permission-denied') console.warn('[PRESENCE]', fUid, err?.code);
          });
        _presenceUnsubs.push(unsub);
      } catch(e) { /* ignorar */ }
    });
  };
  setTimeout(_listenFriendsPresence, 1500);
  // Registra listeners do socket com retry seguro (evita ReferenceError: s is not defined)
  window._ensureAmiSocket = async () => {
    if (window._salaSocket && window._salaSocket.connected) return; // já tem socket de sala
    if (window._amiSocketDedicado && window._amiSocketDedicado.connected) return; // já tem socket ami
    // Não cria socket ami se o usuário está dentro de uma sala ativa
    if (typeof _salaCode !== 'undefined' && _salaCode) return;
    const backendUrl = getBackendUrl();
    if (!backendUrl) { setTimeout(window._ensureAmiSocket, 2000); return; }
    const token = await getAuthToken().catch(()=>null);
    console.log('[AMI] Criando socket dedicado para chamadas P2P');
    const amiSock = io(backendUrl, {
      transports: ['polling', 'websocket'], // igual ao socket de sala
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
      timeout: 20000,
      auth: token ? { token } : undefined,
    });
    amiSock.on('connect_error', (err) => {
      console.warn('[AMI] Socket connect error (normal no Render free):', err.message);
    });
    amiSock.on('connect', () => {
      console.log('[AMI] Socket dedicado conectado:', amiSock.id);
      window._salaSocket = amiSock;
      window._amiSocketDedicado = amiSock;
      // Entra em sala virtual ami para o backend não rejeitar
      const u = window._fbUser;
      if (u?.uid) {
        amiSock.emit('join-room', { code: 'ami-' + u.uid, uid: u.uid, name: u.name || u.displayName || 'Usuário', lang: 'PT-BR' });
        amiSock.emit('ami-online', { uid: u.uid, name: u.name || u.displayName || 'Usuário' });
      }
      // Re-registra listeners de chamada no novo socket
      if (typeof window._setupAmiSocketListeners === 'function') window._setupAmiSocketListeners();
    });
    amiSock.on('disconnect', () => {
      if (window._amiSocketDedicado === amiSock) {
        window._amiSocketDedicado = null;
        if (window._salaSocket === amiSock) window._salaSocket = null;
      }
    });
  };
  // NÃO chama _ensureAmiSocket aqui — será chamado ao navegar para a página de amigos ou ao iniciar chamada

  const _setupAmiSocketListeners = () => {
    const s = window._salaSocket;
    if (!s) { setTimeout(_setupAmiSocketListeners, 1000); return; }
    // Remove listeners anteriores para evitar duplicatas ao reconectar
    s.off('ami-friend-online'); s.off('ami-friend-offline'); s.off('ami-msg');
    s.off('ami-typing'); s.off('ami-call-offer'); s.off('ami-call-answer');
    s.off('ami-call-ice'); s.off('ami-call-reject'); s.off('ami-call-hangup');
    s.on('ami-friend-online', ({ uid, name }) => {
      if (!_ami.friends.find(f => f.uid === uid)) return;
      const wasOffline = !_ami.online[uid];
      _ami.online[uid] = true;
      _amiRenderFriends(); _amiUpdateOnlineCount();
      if (wasOffline) _amiShowLoginNotif(name, uid);
    });
    s.on('ami-friend-offline', ({ uid }) => { delete _ami.online[uid]; _amiRenderFriends(); _amiUpdateOnlineCount(); });
    s.on('ami-msg', ({ fromUid, fromName, text, audioUrl, audioData, ts }) => {
      const friendEntry = _ami.friends.find(f => f.uid === fromUid);
      const resolvedName = (friendEntry && (friendEntry.name || friendEntry.displayName)) || fromName || 'Amigo';
      const finalAudioUrl = audioUrl || audioData || null;
      _amiReceiveMsg(fromUid, resolvedName, text, finalAudioUrl, ts);
    });
    s.on('ami-typing', ({ fromUid }) => {
      if (_ami.currentChat?.uid === fromUid) {
        const el = document.getElementById('fchat-typing');
        if (el) { el.style.display='flex'; clearTimeout(_amiTypingTO); _amiTypingTO=setTimeout(()=>{if(el)el.style.display='none';},3000); }
      }
    });
    s.on('ami-call-offer',  ({ fromUid, fromName, offer }) => _amiHandleOffer(fromUid, fromName, offer));
    s.on('ami-call-answer', ({ answer }) => _amiHandleAnswer(answer));
    s.on('ami-call-ice',    ({ candidate }) => _amiHandleIce(candidate));
    s.on('ami-call-reject', () => _amiCallRejected());
    s.on('ami-call-hangup', () => hangupFriendCall());
    // Reconecta: re-registra listeners ao voltar do disconnect
    s.on('connect', () => { _setupAmiSocketListeners(); });
  };
  window._setupAmiSocketListeners = _setupAmiSocketListeners;
  _setupAmiSocketListeners();
}

function _amiRenderFriends() {
  const online  = _ami.friends.filter(f => _ami.online[f.uid]);
  const offline = _ami.friends.filter(f => !_ami.online[f.uid]);
  const isEmpty = _ami.friends.length === 0;
  document.getElementById('ami-empty-friends').classList.toggle('sh', isEmpty);
  document.getElementById('ami-online-section').style.display  = online.length  ? 'block' : 'none';
  document.getElementById('ami-offline-section').style.display = offline.length ? 'block' : 'none';
  const sub = document.getElementById('ami-header-sub');
  if (sub) sub.textContent = isEmpty ? 'Adicione amigos para praticar' : `${_ami.friends.length} amigo${_ami.friends.length>1?'s':''} · ${online.length} online`;
  _renderFriendList('ami-list-online',  online,  true);
  _renderFriendList('ami-list-offline', offline, false);
}

function _renderFriendList(containerId, list, isOnline) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = list.map(f => {
    const letter = (f.name||f.displayName||'A')[0].toUpperCase();
    return `<div class="friend-card ${isOnline?'online':'offline'}" onclick="openFriendChat('${f.uid}','${_esc(f.name||f.displayName||'Amigo')}')">
      <div class="friend-av-wrap"><div class="friend-av">${letter}</div><div class="friend-presence-dot ${isOnline?'online':'offline'}"></div></div>
      <div class="friend-info"><div class="friend-name">${_esc(f.name||f.displayName||'Amigo')}</div><div class="friend-status-text ${isOnline?'online':'offline'}">${isOnline?'● Online agora':'● Offline'}</div></div>
      <div class="friend-actions" onclick="event.stopPropagation()">
        ${isOnline?`<button class="friend-btn call" onclick="event.stopPropagation();startCallTo('${f.uid}','${_esc(f.name||'Amigo')}')">📞</button>`:''}
        <button class="friend-btn" onclick="event.stopPropagation();openFriendChat('${f.uid}','${_esc(f.name||f.displayName||'Amigo')}')">💬</button>
        <button class="friend-btn danger" onclick="event.stopPropagation();confirmRemoveFriend('${f.uid}','${_esc(f.name||'Amigo')}')">🗑</button>
      </div></div>`;
  }).join('');
}

function _amiRenderPending() {
  const r = _ami.pending.received, s = _ami.pending.sent;
  document.getElementById('ami-empty-pending').classList.toggle('sh', r.length===0 && s.length===0);
  document.getElementById('ami-list-received').innerHTML = r.map(req => `
    <div class="req-card">
      <div class="friend-av" style="width:38px;height:38px;font-size:14px;flex-shrink:0;">${(req.fromName||'A')[0].toUpperCase()}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:700;">${_esc(req.fromName||req.fromEmail||'Usuário')}</div><div style="font-size:11px;color:var(--muted);">quer ser seu amigo · ${req.fromUid?.substring(0,8)||''}</div></div>
      <div class="req-actions">
        <button class="btn btn-primary btn-sm" onclick="acceptFriendReq('${req.id}','${req.fromUid}','${_esc(req.fromName||'Amigo')}')">✓</button>
        <button class="btn btn-danger btn-sm" onclick="rejectFriendReq('${req.id}')">✕</button>
      </div></div>`).join('') || '<div style="color:var(--muted);font-size:12px;padding:8px 0;">Nenhuma solicitação recebida.</div>';
  document.getElementById('ami-list-sent').innerHTML = s.map(req => `
    <div class="req-card" style="opacity:.8;">
      <div class="friend-av" style="width:38px;height:38px;font-size:14px;flex-shrink:0;">${(req.toName||'A')[0].toUpperCase()}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:700;">${_esc(req.toName||'Usuário')}</div><div style="font-size:11px;color:var(--muted);">Aguardando resposta...</div></div>
      <button class="btn btn-ghost btn-sm" onclick="cancelFriendReq('${req.id}')">Cancelar</button>
    </div>`).join('') || '<div style="color:var(--muted);font-size:12px;padding:8px 0;">Nenhuma solicitação enviada.</div>';
}

function _amiUpdatePendingBadge() {
  const count = _ami.pending.received.length;
  const badge = document.getElementById('ami-pending-badge');
  if (badge) { badge.textContent = count; badge.classList.toggle('show', count > 0); }
}

function amiSearchDebounce() { clearTimeout(_amiSearchTO); _amiSearchTO = setTimeout(amiDoSearch, 500); }

async function amiDoSearch() {
  const q = (document.getElementById('ami-search-input')?.value || '').trim().toLowerCase();
  const resEl = document.getElementById('ami-search-result');
  const itemsEl = document.getElementById('ami-search-items');
  const emptyEl = document.getElementById('ami-search-empty');
  if (!resEl || !itemsEl) return;
  if (q.length < 2) { resEl.classList.remove('show'); emptyEl.style.display='none'; return; }
  try {
    const snap      = await db.collection('users').orderBy('displayNameLower').startAt(q).endAt(q+'\uf8ff').limit(8).get();
    const snapEmail = await db.collection('users').where('email','==',q).limit(3).get();
    const seen = new Set(), results = [];
    [...snap.docs,...snapEmail.docs].forEach(d => {
      if (seen.has(d.id)||d.id===window._fbUser?.uid) return;
      seen.add(d.id); results.push({ uid:d.id, ...d.data() });
    });
    emptyEl.style.display = results.length===0 ? 'block':'none';
    resEl.classList.toggle('show', results.length>0);
    const myFriendUids = new Set(_ami.friends.map(f=>f.uid));
    const sentUids     = new Set(_ami.pending.sent.map(r=>r.toUid));
    itemsEl.innerHTML = results.map(u => {
      const isFriend=myFriendUids.has(u.uid), isPending=sentUids.has(u.uid);
      const uName = u.name || u.displayName || u.email?.split('@')[0] || 'Usuário';
      const letter = uName[0].toUpperCase();
      const btn=isFriend?`<span style="font-size:11px;color:var(--green);">✓ Amigo</span>`:isPending?`<span style="font-size:11px;color:var(--muted);">⏳ Enviado</span>`:`<button class="btn btn-primary btn-sm" onclick="sendFriendRequest('${u.uid}','${_esc(uName)}',this)">+ Adicionar</button>`;
      return `<div class="search-result-item"><div class="friend-av" style="width:36px;height:36px;font-size:13px;flex-shrink:0;">${letter}</div><div style="flex:1;"><div style="font-size:13px;font-weight:700;">${_esc(uName)}</div><div style="font-size:11px;color:var(--muted);">${_esc(u.email||'')}</div></div>${btn}</div>`;
    }).join('');
  } catch(e) { console.warn('amiDoSearch',e); }
}

async function sendFriendRequest(toUid, toName, btn) {
  if (!window._fbUser?.uid||!db) return;
  try {
    if (btn) { btn.disabled=true; btn.textContent='⏳'; }
    await db.collection('friend_requests').add({
      fromUid: window._fbUser.uid, fromName: window._fbUser.name||window._fbUser.displayName||'Usuário',
      toUid, toName, status:'pending', createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    if (btn) { btn.textContent='✓ Enviado'; btn.style.background='var(--gdim)'; btn.style.color='var(--green)'; }
    showToast('✉️ Solicitação enviada para '+toName,'success');
  } catch(e) { showToast('Erro ao enviar solicitação','error'); if(btn){btn.disabled=false;btn.textContent='+ Adicionar';} }
}

async function acceptFriendReq(reqId, fromUid, fromName) {
  if (!window._fbUser?.uid||!db) return;
  try {
    const myUid = window._fbUser.uid;
    const myName = window._fbUser.name || window._fbUser.displayName || 'Usuário';
    // Escreve apenas na própria subcoleção (permitido pelas Rules)
    // e marca o request como accepted para que o remetente também se adicione via onSnapshot
    const batch = db.batch();
    batch.update(db.collection('friend_requests').doc(reqId), {
      status: 'accepted',
      acceptedByName: myName,
      acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    batch.set(
      db.collection('users').doc(myUid).collection('friends').doc(fromUid),
      { uid: fromUid, name: fromName, addedAt: firebase.firestore.FieldValue.serverTimestamp() }
    );
    await batch.commit();
    showToast('🎉 ' + fromName + ' agora é seu amigo!', 'success');
    if (window._salaSocket) window._salaSocket.emit('ami-friend-accepted', { toUid: fromUid, name: myName });
    // XP por adicionar amigo
    if(typeof addPts==='function') addPts(15,'amigos');
  } catch(e) {
    console.error('[AMI] acceptFriendReq erro:', e);
    showToast('Erro ao aceitar solicitação: ' + (e.code || e.message), 'error');
  }
}

async function rejectFriendReq(reqId) { try { await db.collection('friend_requests').doc(reqId).update({status:'rejected'}); } catch(e){} }
async function cancelFriendReq(reqId) { try { await db.collection('friend_requests').doc(reqId).delete(); showToast('Solicitação cancelada','info'); } catch(e){} }

async function confirmRemoveFriend(uid, name) {
  if (!confirm('Remover '+name+' da sua lista de amigos?')) return;
  try {
    const myUid = window._fbUser.uid;
    // Deleta da própria subcoleção (permitido pelas Firestore Rules)
    await db.collection('users').doc(myUid).collection('friends').doc(uid).delete();
    // Duas queries separadas para evitar bloqueio das Rules com operador 'in'
    const [snapFrom, snapTo] = await Promise.all([
      db.collection('friend_requests')
        .where('fromUid','==', myUid)
        .where('toUid','==', uid)
        .where('status','==','accepted')
        .get(),
      db.collection('friend_requests')
        .where('fromUid','==', uid)
        .where('toUid','==', myUid)
        .where('status','==','accepted')
        .get()
    ]);
    const batch2 = db.batch();
    const allDocs = [...snapFrom.docs, ...snapTo.docs];
    allDocs.forEach(d => {
      batch2.update(d.ref, {
        status: 'removed',
        removedBy: myUid,
        removedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    if (allDocs.length > 0) {
      await batch2.commit();
    }
    // Atualiza lista local imediatamente
    _ami.friends = _ami.friends.filter(f => f.uid !== uid);
    delete _ami.online[uid];
    _amiRenderFriends();
    _amiUpdateOnlineCount();
    showToast('Amigo removido','info');
  } catch(e) {
    console.error('[AMI] remove error:', e);
    showToast('Erro ao remover: ' + (e.code || e.message), 'error');
  }
}

function openFriendChat(uid, name) {
  _ami.currentChat = { uid, name };
  const letter=name[0].toUpperCase(), isOnline=!!_ami.online[uid];
  const avEl=document.getElementById('fchat-av'), nameEl=document.getElementById('fchat-name'), statusEl=document.getElementById('fchat-status');
  if (avEl) avEl.textContent=letter;
  if (nameEl) nameEl.textContent=name;
  if (statusEl) { statusEl.textContent=isOnline?'● Online agora':'● Offline'; statusEl.className='fchat-status'+(isOnline?' online':' offline'); }
  const callBtn=document.getElementById('fchat-call-btn');
  if (callBtn) callBtn.style.opacity=isOnline?'1':'.4';
  _amiLoadChatMsgs(uid);
  document.getElementById('fchat-modal')?.classList.add('sh');
  // Limpa notificação desse remetente ao abrir o chat
  if (_amiMsgNotifData[uid]) {
    delete _amiMsgNotifData[uid];
    const remaining = Object.keys(_amiMsgNotifData).length;
    if (remaining === 0) {
      _amiMsgNotifDismiss(false);
      _amiTabBlinkStop();
    } else {
      // Ainda há msgs de outros — re-renderiza com quem sobrou
      const nextUid = Object.keys(_amiMsgNotifData)[0];
      _amiMsgNotifRender();
    }
  }
}

function closeFriendChat() { document.getElementById('fchat-modal')?.classList.remove('sh'); _ami.currentChat=null; }

function _amiListenMessages() {
  const uid=window._fbUser?.uid;
  if (!uid||!db) return;
  // Marca timestamp do login — toast só para msgs NOVAS (recebidas após login)
  const _listenStart = Date.now();
  db.collection('friend_messages').where('toUid','==',uid).orderBy('createdAt','desc').limit(100)
    .onSnapshot(snap => {
      snap.docChanges().forEach(change => {
        if (change.type==='added') {
          const d=change.doc.data();
          const msgTs = d.createdAt?.toMillis?.() || 0;
          // fromFirestore=true suprime o toast; só é false para msgs realmente novas
          const isHistorical = msgTs < _listenStart - 2000;
          const _fEntry2=_ami.friends.find(f=>f.uid===d.fromUid);const _rName=(_fEntry2&&(_fEntry2.name||_fEntry2.displayName))||d.fromName||'Amigo';_amiReceiveMsg(d.fromUid,_rName,d.text,d.audioUrl,msgTs||Date.now(), isHistorical);
        }
      });
    });
}

async function _amiLoadChatMsgs(friendUid) {
  const myUid=window._fbUser?.uid;
  if (!myUid||!db) return;
  const msgsEl=document.getElementById('fchat-msgs');
  if (!msgsEl) return;
  // Só mostra placeholder se não há msgs em memória ainda
  if (!_ami.chatMessages[friendUid]) {
    msgsEl.innerHTML=`<div style="text-align:center;color:var(--muted);font-size:12px;padding:24px 0;opacity:.6;">Início da conversa</div>`;
  } else {
    _amiRenderChat(friendUid); // mostra o que já tem enquanto carrega
  }
  try {
    const [snapSent,snapRec]=await Promise.all([
      db.collection('friend_messages').where('fromUid','==',myUid).where('toUid','==',friendUid).orderBy('createdAt').limit(100).get(),
      db.collection('friend_messages').where('fromUid','==',friendUid).where('toUid','==',myUid).orderBy('createdAt').limit(100).get(),
    ]);
    const fsmsgs=[...snapSent.docs.map(d=>({...d.data(),mine:true,ts:d.data().createdAt?.toMillis?.()|| 0})),...snapRec.docs.map(d=>({...d.data(),mine:false,ts:d.data().createdAt?.toMillis?.()|| 0}))].sort((a,b)=>a.ts-b.ts);
    // Mescla com msgs em memória (ex: enviadas localmente ainda não confirmadas)
    const existing=_ami.chatMessages[friendUid]||[];
    const merged=[...fsmsgs];
    existing.forEach(m=>{
      const dup=merged.some(fm=>fm.text===m.text&&fm.mine===m.mine&&Math.abs((fm.ts||0)-(m.ts||0))<3000);
      if(!dup)merged.push(m);
    });
    merged.sort((a,b)=>a.ts-b.ts);
    _ami.chatMessages[friendUid]=merged;
    _amiRenderChat(friendUid);
  } catch(e) {
    // failed-precondition = índice composto ausente no Firestore
    if(e.code==='failed-precondition'||e.message?.includes('index')){
      console.warn('[AIVOX] friend_messages precisa de índice composto. Crie em: Firebase Console → Firestore → Índices → Composto: fromUid(ASC) + toUid(ASC) + createdAt(ASC). Detalhes:',e.message);
      // Fallback: busca sem orderBy (sem índice, funciona mas sem ordenação garantida)
      try {
        const [snapSent,snapRec]=await Promise.all([
          db.collection('friend_messages').where('fromUid','==',myUid).where('toUid','==',friendUid).limit(100).get(),
          db.collection('friend_messages').where('fromUid','==',friendUid).where('toUid','==',myUid).limit(100).get(),
        ]);
        const fsmsgs=[...snapSent.docs.map(d=>({...d.data(),mine:true,ts:d.data().createdAt?.toMillis?.()|| 0})),...snapRec.docs.map(d=>({...d.data(),mine:false,ts:d.data().createdAt?.toMillis?.()|| 0}))].sort((a,b)=>a.ts-b.ts);
        const existing=_ami.chatMessages[friendUid]||[];
        const merged=[...fsmsgs];
        existing.forEach(m=>{ const dup=merged.some(fm=>fm.text===m.text&&fm.mine===m.mine&&Math.abs((fm.ts||0)-(m.ts||0))<3000); if(!dup)merged.push(m); });
        merged.sort((a,b)=>a.ts-b.ts);
        _ami.chatMessages[friendUid]=merged;
        _amiRenderChat(friendUid); // FIX: renderizar após fallback bem-sucedido
      } catch(e2){ console.warn('_amiLoadChatMsgs fallback:',e2); }
    } else {
      console.warn('_amiLoadChatMsgs',e);
    }
    _amiRenderChat(friendUid);
  }
}

function _amiRenderChat(friendUid) {
  const msgsEl=document.getElementById('fchat-msgs');
  if (!msgsEl||_ami.currentChat?.uid!==friendUid) return;
  const msgs=_ami.chatMessages[friendUid]||[];
  msgsEl.innerHTML=`<div style="text-align:center;color:var(--muted);font-size:12px;padding:24px 0;opacity:.6;">Início da conversa</div>`;
  msgs.forEach(m => {
    const div=document.createElement('div');
    div.className='fchat-bubble '+(m.mine?'mine':'theirs');
    const time=m.ts?new Date(m.ts).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'';
    // Áudios expiram após 24h
    const audioExpired = m.audioUrl && m.ts && (Date.now() - m.ts) > 86400000;
    div.innerHTML=m.audioUrl
      ? (audioExpired
          ? `<span style="opacity:.45;font-size:11px;font-style:italic;">🎤 Áudio expirado</span><span class="btime">${time}</span>`
          : `<audio controls src="${m.audioUrl}" style="max-width:200px;height:32px;"></audio><span class="btime">${time}</span>`)
      : `${_esc(m.text||'')}<span class="btime">${time}</span>`;
    msgsEl.appendChild(div);
  });
  msgsEl.scrollTop=msgsEl.scrollHeight;
}

async function sendFriendMsg() {
  const inp=document.getElementById('fchat-input');
  const text=(inp?.value||'').trim();
  if (!text||!_ami.currentChat) return;
  inp.value='';
  const myUid=window._fbUser?.uid, myName=window._fbUser?.displayName||'Usuário', toUid=_ami.currentChat.uid, ts=Date.now();
  if (!_ami.chatMessages[toUid]) _ami.chatMessages[toUid]=[];
  _ami.chatMessages[toUid].push({mine:true,text,ts});
  _amiRenderChat(toUid);
  try { await db.collection('friend_messages').add({fromUid:myUid,fromName:myName,toUid,text,createdAt:firebase.firestore.FieldValue.serverTimestamp()}); } catch(e){}
  if (window._salaSocket) window._salaSocket.emit('ami-send-msg',{toUid,fromName:myName,text,ts});
}

function _amiReceiveMsg(fromUid, fromName, text, audioUrl, ts, fromFirestore) {
  if (!_ami.chatMessages[fromUid]) _ami.chatMessages[fromUid]=[];
  const isDup=_ami.chatMessages[fromUid].some(m=>!m.mine&&m.text===text&&Math.abs((m.ts||0)-(ts||0))<2000);
  if (!isDup) _ami.chatMessages[fromUid].push({mine:false,text,audioUrl,ts:ts||Date.now()});
  // fromFirestore=true = msg histórica carregada no login, nunca exibir toast
  if (fromFirestore) return;
  if (_ami.currentChat?.uid===fromUid) {
    _amiRenderChat(fromUid);
    document.getElementById('fchat-typing').style.display='none';
  } else {
    // Acumula não lidas e exibe notificação consolidada + pisca aba
    _amiMsgNotifAdd(fromUid, fromName, text, audioUrl);
  }
}

// ── SISTEMA DE NOTIFICAÇÃO DE MENSAGEM ─────────────────────────────
// Mapa: uid → { name, count, lastText, lastTs }
const _amiMsgNotifData = {};
let _amiMsgNotifEl = null;
let _amiMsgNotifTimer = null;
let _amiTabBlinkInterval = null;
const _originalTitle = document.title;

function _amiMsgNotifAdd(uid, name, text, audioUrl) {
  // Acumula contagem por remetente
  if (!_amiMsgNotifData[uid]) _amiMsgNotifData[uid] = { name, count: 0, lastText: '', lastTs: 0 };
  _amiMsgNotifData[uid].count++;
  _amiMsgNotifData[uid].lastText = text || '🎤 Áudio';
  _amiMsgNotifData[uid].lastTs = Date.now();
  _amiMsgNotifRender();
  _amiTabBlinkStart(name);
}

function _amiMsgNotifRender() {
  // Calcula totais consolidados
  const uids = Object.keys(_amiMsgNotifData);
  if (!uids.length) return;

  const totalMsgs = uids.reduce((s, u) => s + _amiMsgNotifData[u].count, 0);
  // Pega o remetente com mais mensagens recentes
  const topUid = uids.sort((a,b) => _amiMsgNotifData[b].lastTs - _amiMsgNotifData[a].lastTs)[0];
  const top = _amiMsgNotifData[topUid];
  const outrosCount = uids.length - 1;

  // Nome a exibir
  let displayName = top.name;
  if (outrosCount > 0) displayName += ' +' + outrosCount;

  // Texto do sub
  let subText = totalMsgs === 1
    ? (top.lastText).substring(0, 38)
    : totalMsgs + ' mensagens' + (outrosCount > 0 ? ' de ' + uids.length + ' amigos' : '');

  const letter = (top.name||'?')[0].toUpperCase();

  // Remove notif anterior sem animação para substituir
  if (_amiMsgNotifEl) {
    _amiMsgNotifEl.remove();
    _amiMsgNotifEl = null;
  }
  if (_amiMsgNotifTimer) { clearTimeout(_amiMsgNotifTimer); _amiMsgNotifTimer = null; }

  const el = document.createElement('div');
  el.className = 'ami-msg-notif';
  el.style.position = 'fixed';
  el.innerHTML = `
    <div class="ami-msg-notif-av">
      ${letter}
      <span class="notif-count">${totalMsgs}</span>
    </div>
    <div class="ami-msg-notif-body">
      <div class="ami-msg-notif-name">💬 ${_esc(displayName)}</div>
      <div class="ami-msg-notif-text">${_esc(subText)}</div>
      <div class="ami-msg-notif-time">agora</div>
    </div>
    <button class="ami-msg-notif-close" title="Fechar">✕</button>
    <div class="ami-msg-notif-bar"></div>
  `;

  // Clique no card → abre chat
  el.addEventListener('click', (e) => {
    if (e.target.classList.contains('ami-msg-notif-close')) return;
    _amiMsgNotifDismiss(true);
    navApp('amigos');
    setTimeout(() => {
      const f = _ami.friends.find(f => f.uid === topUid);
      if (f) openFriendChat(f.uid, f.name);
    }, 150);
  });

  // Botão fechar
  el.querySelector('.ami-msg-notif-close').addEventListener('click', (e) => {
    e.stopPropagation();
    _amiMsgNotifDismiss(false);
  });

  document.body.appendChild(el);
  _amiMsgNotifEl = el;

  // Auto-dismiss após 5s
  _amiMsgNotifTimer = setTimeout(() => _amiMsgNotifDismiss(false), 5000);
}

function _amiMsgNotifDismiss(clearData) {
  if (_amiMsgNotifTimer) { clearTimeout(_amiMsgNotifTimer); _amiMsgNotifTimer = null; }
  if (_amiMsgNotifEl) {
    _amiMsgNotifEl.classList.add('hiding');
    setTimeout(() => { if(_amiMsgNotifEl){ _amiMsgNotifEl.remove(); _amiMsgNotifEl=null; } }, 380);
  }
  if (clearData) {
    Object.keys(_amiMsgNotifData).forEach(k => delete _amiMsgNotifData[k]);
    _amiTabBlinkStop();
  }
}

// ── PISCAR TÍTULO DA ABA ────────────────────────────────────────────
function _amiTabBlinkStart(fromName) {
  if (_amiTabBlinkInterval) return; // já está piscando
  let show = true;
  const blinkTitle = '💬 ' + fromName + ' te mandou mensagem';
  _amiTabBlinkInterval = setInterval(() => {
    document.title = show ? blinkTitle : _originalTitle;
    show = !show;
  }, 1200);
  // Para de piscar quando usuário focar na aba
  const stopOnFocus = () => {
    _amiTabBlinkStop();
    window.removeEventListener('focus', stopOnFocus);
  };
  window.addEventListener('focus', stopOnFocus);
}

function _amiTabBlinkStop() {
  if (_amiTabBlinkInterval) {
    clearInterval(_amiTabBlinkInterval);
    _amiTabBlinkInterval = null;
  }
  document.title = _originalTitle;
}

function friendTypingHint() { if(!_ami.currentChat||!window._salaSocket)return; window._salaSocket.emit('ami-typing',{toUid:_ami.currentChat.uid}); }

let _fchatMediaRec=null, _fchatAudioChunks=[];

async function toggleFriendVoice() {
  const btn=document.getElementById('fchat-mic'), bars=document.getElementById('fchat-voice-bar');
  if (_fchatMediaRec&&_fchatMediaRec.state==='recording') {
    _fchatMediaRec.stop(); if(btn)btn.classList.remove('recording'); if(bars)bars.classList.remove('sh'); return;
  }
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    _fchatAudioChunks=[];
    _fchatMediaRec=new MediaRecorder(stream);
    _fchatMediaRec.ondataavailable=e=>{if(e.data.size)_fchatAudioChunks.push(e.data);};
    _fchatMediaRec.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());await _amiSendAudioMsg(new Blob(_fchatAudioChunks,{type:'audio/webm'}));};
    _fchatMediaRec.start();
    if(btn)btn.classList.add('recording'); if(bars)bars.classList.add('sh');
  } catch(e){ showToast('Microfone não autorizado','error'); }
}

async function _amiSendAudioMsg(blob) {
  if (!_ami.currentChat) return;
  const myUid=window._fbUser?.uid, myName=window._fbUser?.displayName||'Usuário', toUid=_ami.currentChat.uid;
  if (!myUid) { showToast('Usuário não autenticado','error'); return; }
  // Renderiza localmente com URL de objeto (feedback instantâneo ao remetente)
  const localUrl=URL.createObjectURL(blob);
  const ts=Date.now();
  if (!_ami.chatMessages[toUid]) _ami.chatMessages[toUid]=[];
  const localIdx=_ami.chatMessages[toUid].length;
  _ami.chatMessages[toUid].push({mine:true,audioUrl:localUrl,ts,_pending:true});
  _amiRenderChat(toUid);
  showToast('🎤 Enviando áudio...','info');
  try {
    let audioUrl=null;
    // Tenta Firebase Storage (SDK agora carregado)
    if (typeof firebase!=='undefined' && firebase.storage) {
      try {
        const storageRef=firebase.storage().ref('voice_msgs/'+myUid+'_'+ts+'.webm');
        const snap=await storageRef.put(blob);
        audioUrl=await snap.ref.getDownloadURL();
      } catch(storageErr) { console.warn('Storage upload falhou, usando base64:',storageErr); }
    }
    // Fallback: converte para base64 para transmitir via socket
    if (!audioUrl) {
      audioUrl=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob);});
    }
    // Substitui blob local pela URL definitiva
    _ami.chatMessages[toUid][localIdx]={mine:true,audioUrl,ts};
    _amiRenderChat(toUid);
    // Salva no Firestore apenas se for URL HTTP (base64 seria muito grande)
    const isHttpUrl=audioUrl.startsWith('http');
    if (isHttpUrl) {
      try { await db.collection('friend_messages').add({fromUid:myUid,fromName:myName,toUid,audioUrl,createdAt:firebase.firestore.FieldValue.serverTimestamp()}); } catch(fsErr){ console.warn('Firestore audio save falhou:',fsErr); }
    }
    // Emite via socket para o destinatário receber em tempo real
    if (window._salaSocket) {
      if (isHttpUrl) window._salaSocket.emit('ami-send-msg',{toUid,fromName:myName,audioUrl,ts});
      else window._salaSocket.emit('ami-send-msg',{toUid,fromName:myName,audioData:audioUrl,ts});
    }
    URL.revokeObjectURL(localUrl);
    showToast('🎤 Áudio enviado','success');
  } catch(e) {
    console.error('_amiSendAudioMsg error:',e);
    showToast('⚠️ Erro ao enviar áudio','error');
  }
}

// WebRTC
const ICE_SERVERS=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}];

async function startCallTo(uid, name) {
  if (_ami.callUid) { showToast('Você já está em uma chamada','error'); return; }
  // Garante que o socket está disponível antes de iniciar a chamada
  if (typeof window._ensureAmiSocket === 'function') await window._ensureAmiSocket();
  if (!window._salaSocket || !window._salaSocket.connected) {
    showToast('Conectando... tente em instantes','error'); return;
  }
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
    _ami.localStream=stream; _ami.callUid=uid; _ami.isCaller=true;
    _ami.pc=new RTCPeerConnection({iceServers:ICE_SERVERS});
    stream.getTracks().forEach(t=>_ami.pc.addTrack(t,stream));
    _ami.pc.ontrack=e=>{_ami.remoteStream=e.streams[0];_playRemoteStream(_ami.remoteStream);};
    _ami.pc.onicecandidate=({candidate})=>{if(candidate&&window._salaSocket)window._salaSocket.emit('ami-call-ice',{toUid:uid,candidate});};
    const offer=await _ami.pc.createOffer({offerToReceiveAudio:true});
    await _ami.pc.setLocalDescription(offer);
    const _myCallName = window._fbUser?.name || window._fbUser?.displayName || window._fbUser?.email?.split('@')[0] || 'Usuário';
    window._salaSocket?.emit('ami-call-offer',{toUid:uid,fromName:_myCallName,offer});
    _amiShowCallOverlay(name,'Chamando...');
    _callTransSetupListeners(); // Fase 4A
  } catch(e) { showToast('Sem acesso ao microfone','error'); }
}

function startFriendCall() {
  if (!_ami.currentChat) return;
  const {uid,name}=_ami.currentChat;
  if (!_ami.online[uid]) { showToast('Amigo está offline','error'); return; }
  startCallTo(uid,name);
}

async function _amiHandleOffer(fromUid, fromName, offer) {
  if (_ami.callUid) { window._salaSocket?.emit('ami-call-reject',{toUid:fromUid}); return; }
  document.getElementById('fcall-incoming')?.classList.add('sh');
  document.getElementById('finc-av').textContent=fromName[0].toUpperCase();
  document.getElementById('finc-name').textContent=fromName;
  _ami.callUid=fromUid; _ami.isCaller=false; _ami._pendingOffer={fromUid,fromName,offer};
}

async function acceptFriendCall() {
  document.getElementById('fcall-incoming')?.classList.remove('sh');
  const {fromUid,fromName,offer}=_ami._pendingOffer||{};
  if (!fromUid) return;
  try {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    _ami.localStream=stream;
    _ami.pc=new RTCPeerConnection({iceServers:ICE_SERVERS});
    stream.getTracks().forEach(t=>_ami.pc.addTrack(t,stream));
    _ami.pc.ontrack=e=>{_ami.remoteStream=e.streams[0];_playRemoteStream(_ami.remoteStream);};
    _ami.pc.onicecandidate=({candidate})=>{if(candidate&&window._salaSocket)window._salaSocket.emit('ami-call-ice',{toUid:fromUid,candidate});};
    _ami.pendingIce.forEach(c=>_ami.pc.addIceCandidate(new RTCIceCandidate(c)).catch(()=>{}));
    _ami.pendingIce=[];
    await _ami.pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer=await _ami.pc.createAnswer();
    await _ami.pc.setLocalDescription(answer);
    window._salaSocket?.emit('ami-call-answer',{toUid:fromUid,answer});
    _amiShowCallOverlay(fromName,'Conectando...');
    _callTransSetupListeners(); // Fase 4A
    _ami.pc.onconnectionstatechange=()=>_amiCallStateChange();
    // Fallback: iceConnectionState também dispara 'connected' em alguns browsers
    _ami.pc.oniceconnectionstatechange=()=>{
      if(_ami.pc?.iceConnectionState==='connected'||_ami.pc?.iceConnectionState==='completed') _amiCallStateChange();
    };
  } catch(e) { showToast('Erro ao atender chamada','error'); hangupFriendCall(); }
}

async function _amiHandleAnswer(answer) {
  try{await _ami.pc?.setRemoteDescription(new RTCSessionDescription(answer));}catch(e){}
  _ami.pc.onconnectionstatechange=()=>_amiCallStateChange();
  _ami.pc.oniceconnectionstatechange=()=>{
    if(_ami.pc?.iceConnectionState==='connected'||_ami.pc?.iceConnectionState==='completed') _amiCallStateChange();
  };
}

async function _amiHandleIce(candidate) {
  if (_ami.pc?.remoteDescription) { try{await _ami.pc.addIceCandidate(new RTCIceCandidate(candidate));}catch(e){} }
  else { _ami.pendingIce.push(candidate); }
}

function _amiCallStateChange() {
  const state = _ami.pc?.connectionState;
  const iceState = _ami.pc?.iceConnectionState;
  const isConnected = state==='connected' || iceState==='connected' || iceState==='completed';
  if (isConnected && document.getElementById('fcall-status')?.textContent !== 'Em chamada') {
    document.getElementById('fcall-status').textContent='Em chamada';
    document.getElementById('fcall-timer').style.display='block';
    _ami.callSeconds=0; clearInterval(_ami.callTimer);
    _ami.callTimer=setInterval(()=>{_ami.callSeconds++;const m=String(Math.floor(_ami.callSeconds/60)).padStart(2,'0'),s=String(_ami.callSeconds%60).padStart(2,'0');const el=document.getElementById('fcall-timer');if(el)el.textContent=m+':'+s;},1000);
  } else if (['disconnected','failed','closed'].includes(state)) { hangupFriendCall(); }
}

function rejectFriendCall() {
  document.getElementById('fcall-incoming')?.classList.remove('sh');
  const uid=_ami._pendingOffer?.fromUid;
  if (uid) window._salaSocket?.emit('ami-call-reject',{toUid:uid});
  _ami.callUid=null; _ami._pendingOffer=null;
}

function _amiCallRejected() { hangupFriendCall(); showToast('Chamada recusada','info'); }

function hangupFriendCall() {
  clearInterval(_ami.callTimer); _ami.callTimer=null;
  // Fase 4A: encerrar tradução antes do cleanup WebRTC
  if (_ami.transEnabled) {
    _callTransStop();
    window._salaSocket?.emit('ami-trans-toggle', { toUid: _ami.callUid, enabled: false });
  }
  _ami.transEnabled = false; _ami.voiceClone = true; _ami.transSeqOut = 0; _ami.transSeqIn = 0;
  // XP por chamada de voz (se durou pelo menos 10 segundos)
  if(_ami.callSeconds>=10 && typeof addPts==='function') {
    addPts(10,'chamadas');
    _gamifToast('📞 +10 XP pela chamada de voz!','#00e5ff');
  }
  // Fase 4A: XP extra por chamada com tradução ativa ≥30s
  if (_ami.callSeconds >= 30 && typeof addPts === 'function') {
    addPts(5, 'traducao');
    _gamifToast('🌐 +5 XP por usar tradução!', '#00e5ff');
  }
  if (_ami.callUid&&window._salaSocket) window._salaSocket.emit('ami-call-hangup',{toUid:_ami.callUid});
  try{_ami.localStream?.getTracks().forEach(t=>t.stop());}catch(e){}
  try{_ami.pc?.close();}catch(e){}
  _ami.pc=null; _ami.localStream=null; _ami.remoteStream=null;
  _ami.callUid=null; _ami.isCaller=false; _ami.pendingIce=[]; _ami.isMuted=false; _ami.callSeconds=0;
  document.getElementById('fcall-overlay')?.classList.remove('sh');
  document.getElementById('fcall-incoming')?.classList.remove('sh');
  const rem=document.getElementById('fcall-remote-audio');
  if (rem){rem.srcObject=null;rem.remove();}
}

function toggleCallMute() {
  _ami.isMuted=!_ami.isMuted;
  _ami.localStream?.getAudioTracks().forEach(t=>{t.enabled=!_ami.isMuted;});
  const btn=document.getElementById('fcall-mute');
  if(btn){btn.classList.toggle('active',_ami.isMuted);btn.textContent=_ami.isMuted?'🔇':'🎤';}
}

function toggleSpeaker() { showToast('Use o volume do celular para ajustar','info'); }

function _amiShowCallOverlay(name, status) {
  const ov=document.getElementById('fcall-overlay');
  if(!ov)return;
  document.getElementById('fcall-av').textContent=name[0].toUpperCase();
  document.getElementById('fcall-name').textContent=name;
  document.getElementById('fcall-status').textContent=status;
  document.getElementById('fcall-timer').style.display='none';
  document.getElementById('fcall-mute').classList.remove('active');
  document.getElementById('fcall-mute').textContent='🎤';
  ov.classList.add('sh');
}

function _createRemoteAudio() {
  const existing = document.getElementById('fcall-remote-audio');
  if (existing) { existing.srcObject = null; return existing; }
  const a = document.createElement('audio');
  a.id = 'fcall-remote-audio';
  a.autoplay = true;
  a.playsInline = true;
  a.volume = 1.0;
  document.body.appendChild(a);
  return a;
}

function _playRemoteStream(stream) {
  const a = document.getElementById('fcall-remote-audio') || _createRemoteAudio();
  a.srcObject = stream;
  a.play().catch(e => {
    // Fallback: cria novo elemento e tenta novamente
    console.warn('[CALL] autoplay bloqueado, tentando novamente:', e);
    const a2 = document.createElement('audio');
    a2.id = 'fcall-remote-audio-2';
    a2.autoplay = true; a2.playsInline = true; a2.volume = 1.0;
    a2.srcObject = stream;
    document.body.appendChild(a2);
    a2.play().catch(() => {});
  });
}

// ════════════════════════════════════════════════════════════════
//  FASE 4A — Tradução em chamada P2P com Azure Speech
// ════════════════════════════════════════════════════════════════

async function toggleCallTranslation() {
  if (!_ami.callUid) return;
  _ami.transEnabled = !_ami.transEnabled;
  window._salaSocket?.emit('ami-trans-toggle', {
    toUid:      _ami.callUid,
    enabled:    _ami.transEnabled,
    voiceClone: _ami.voiceClone,
    fromLang:   _ami.transFromLang, // FIX: informa idioma ao outro lado
    toLang:     _ami.transToLang
  });
  if (_ami.transEnabled) {
    await _callTransStart();
  } else {
    _callTransStop();
  }
  _updateCallTransUI();
}

async function toggleCallVoiceClone() {
  _ami.voiceClone = !_ami.voiceClone;
  window._salaSocket?.emit('ami-trans-toggle', {
    toUid:      _ami.callUid,
    enabled:    _ami.transEnabled,
    voiceClone: _ami.voiceClone
  });
  _updateCallTransUI();
}

async function _callTransStart() {
  try {
    // Buscar idiomas do perfil Firebase
    if (window._fbUser?.uid && typeof db !== 'undefined') {
      try {
        const snap = await db.collection('users').doc(window._fbUser.uid).get();
        const p = snap.data() || {};
        _ami.transFromLang = p.nativeLang   || _ami.transFromLang || 'pt-BR';
        _ami.transToLang   = p.targetLang   || _ami.transToLang   || 'en-US';
      } catch(e) {}
    }

    // Captura de áudio do mic separada do stream WebRTC (16kHz para Azure)
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000, channelCount: 1 }
    });

    _ami.transAudioCtx  = new AudioContext({ sampleRate: 16000 });
    const source        = _ami.transAudioCtx.createMediaStreamSource(micStream);
    _ami.transProcessor = _ami.transAudioCtx.createScriptProcessor(4096, 1, 1);

    _ami.transProcessor.onaudioprocess = (e) => {
      if (!_ami.transEnabled || !window._salaSocket) return;
      const f32   = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(f32.length);
      for (let i = 0; i < f32.length; i++) {
        pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767)));
      }
      const chunk = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
      window._salaSocket.emit('ami-trans-audio', {
        toUid:    _ami.callUid,
        chunk,
        seq:      _ami.transSeqOut++,
        fromLang: _ami.transFromLang, // FIX: idioma do falante (ex: pt-BR)
        toLang:   _ami.transToLang    // FIX: idioma de saída (ex: en-US)
      });
    };

    source.connect(_ami.transProcessor);
    _ami.transProcessor.connect(_ami.transAudioCtx.destination);

    // Silenciar stream WebRTC local enquanto tradução envia áudio pelo pipeline Azure
    if (!_ami.isMuted) {
      _ami.localStream?.getAudioTracks().forEach(t => { t.enabled = false; });
    }

    showToast('🌐 Tradução ativada', 'success');
  } catch(e) {
    showToast('❌ Erro ao ativar tradução: ' + e.message, 'error');
    _ami.transEnabled = false;
  }
}

function _callTransStop() {
  // Restaura stream WebRTC (respeitando mudo)
  if (!_ami.isMuted) {
    _ami.localStream?.getAudioTracks().forEach(t => { t.enabled = true; });
  }
  try { _ami.transProcessor?.disconnect(); } catch(e) {}
  try { _ami.transAudioCtx?.close(); }      catch(e) {}
  _ami.transProcessor = null;
  _ami.transAudioCtx  = null;
  _ami.transQueue     = [];
  _ami.transSpeaking  = false;
  _ami.transSeqOut    = 0;
  _ami.transSeqIn     = 0;
  showToast('🔇 Tradução desativada', 'info');
}

function _callTransSetupListeners() {
  const s = window._salaSocket;
  if (!s) return;

  // Remove listeners anteriores para evitar duplicatas
  s.off('ami-trans-out');
  s.off('ami-trans-text');
  s.off('ami-trans-toggle');

  s.on('ami-trans-out', ({ chunk, seq }) => {
    _ami.transQueue.push({ chunk, seq });
    _ami.transQueue.sort((a, b) => a.seq - b.seq);
    if (!_ami.transSpeaking) _callTransPlayQueue();
  });

  s.on('ami-trans-text', ({ original, translated, side }) => {
    _updateCallTranscript(original, translated, side);
  });

  s.on('ami-trans-toggle', ({ enabled, voiceClone, fromLang, toLang }) => {
    // FIX: quando o outro lado ativa tradução, invertemos os idiomas para traduzir corretamente
    // Exemplo: se o outro fala pt-BR → en-US, eu ouço en-US → meu toLang deve ser pt-BR
    if (enabled && fromLang && toLang) {
      _ami.transFromLang = toLang;   // o que o outro traduz para → é o que eu falo
      _ami.transToLang   = fromLang; // o que o outro fala → é o que eu quero ouvir traduzido
    }
    const msg = enabled ? '🌐 Tradução ativada pelo outro lado' : '🔇 Tradução desativada pelo outro lado';
    showToast(msg, 'info');
  });
}

function _callTransPlayQueue() {
  if (_ami.transQueue.length === 0) { _ami.transSpeaking = false; return; }
  _ami.transSpeaking = true;
  const { chunk } = _ami.transQueue.shift();

  try {
    const binary = atob(chunk);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const ctx   = new AudioContext();
    const pcm16 = new Int16Array(bytes.buffer);
    const f32   = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) f32[i] = pcm16[i] / 32768;

    const buffer = ctx.createBuffer(1, f32.length, 24000); // 24kHz output do Azure TTS
    buffer.getChannelData(0).set(f32);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.onended = () => _callTransPlayQueue();
    src.start();
  } catch(e) {
    _ami.transSpeaking = false;
    _callTransPlayQueue();
  }
}

function _updateCallTransUI() {
  const btnTrans  = document.getElementById('fcall-trans');
  const btnClone  = document.getElementById('fcall-voice-clone');
  const transcript= document.getElementById('fcall-transcript');
  const langInfo  = document.getElementById('fcall-lang-info'); // FIX: indicador idiomas

  if (btnTrans) {
    btnTrans.style.background = _ami.transEnabled ? 'var(--accent)' : 'var(--surface)';
    btnTrans.style.color      = _ami.transEnabled ? '#000' : 'var(--text)';
    btnTrans.title = _ami.transEnabled ? 'Desativar tradução' : 'Ativar tradução';
  }
  if (btnClone) {
    btnClone.style.display    = _ami.transEnabled ? 'flex' : 'none';
    btnClone.style.background = _ami.voiceClone ? 'var(--accent2)' : 'var(--surface)';
    btnClone.style.color      = _ami.voiceClone ? '#fff' : 'var(--text)';
    btnClone.title = _ami.voiceClone ? 'Usando sua voz clonada' : 'Usando voz genérica';
  }
  if (transcript) {
    transcript.style.display = _ami.transEnabled ? 'block' : 'none';
  }
  // FIX: mostrar/ocultar indicador de idiomas
  if (langInfo) {
    if (_ami.transEnabled) {
      const from = (_ami.transFromLang||'PT-BR').toUpperCase();
      const to   = (_ami.transToLang||'EN-US').toUpperCase();
      langInfo.textContent = `🌐 ${from} → ${to}`;
      langInfo.style.display = 'block';
    } else {
      langInfo.style.display = 'none';
    }
  }
}

function _updateCallTranscript(original, translated, side) {
  const elOrig  = document.getElementById('fcall-tr-original');
  const elTrans = document.getElementById('fcall-tr-translated');
  if (elOrig)  elOrig.textContent  = original  || '';
  if (elTrans) elTrans.textContent = translated || '';
}
// ════════════════════════════════════════════════════════════════
//  FIM FASE 4A
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  FASE 2 — TRADUTOR AO VIVO (browser-only, zero backend)
// ════════════════════════════════════════════════════════════════
let _liveTrans           = false;
let _liveTransRecognizer = null;
let _liveTransSynth      = null;
let _liveTransAudioCtx   = null;
let _liveTransQueue      = [];
let _liveTransSpeaking   = false;
let _liveTransFromLang   = 'en-US';
let _liveTransToLang     = 'pt';
let _liveTransVoice      = 'pt-BR-FranciscaNeural';

const LIVE_TRANS_LANGUAGES = {
  from: [
    { code:'en-US', label:'🇺🇸 Inglês (EUA)' },
    { code:'en-GB', label:'🇬🇧 Inglês (UK)' },
    { code:'es-ES', label:'🇪🇸 Espanhol' },
    { code:'fr-FR', label:'🇫🇷 Francês' },
    { code:'de-DE', label:'🇩🇪 Alemão' },
    { code:'it-IT', label:'🇮🇹 Italiano' },
    { code:'ja-JP', label:'🇯🇵 Japonês' },
    { code:'zh-CN', label:'🇨🇳 Mandarim' },
    { code:'pt-BR', label:'🇧🇷 Português (BR)' },
  ],
  to: [
    { code:'pt', label:'🇧🇷 Português', voice:'pt-BR-FranciscaNeural' },
    { code:'en', label:'🇺🇸 Inglês',    voice:'en-US-JennyNeural' },
    { code:'es', label:'🇪🇸 Espanhol',  voice:'es-ES-ElviraNeural' },
    { code:'fr', label:'🇫🇷 Francês',   voice:'fr-FR-DeniseNeural' },
    { code:'de', label:'🇩🇪 Alemão',    voice:'de-DE-KatjaNeural' },
    { code:'it', label:'🇮🇹 Italiano',  voice:'it-IT-ElsaNeural' },
    { code:'ja', label:'🇯🇵 Japonês',   voice:'ja-JP-NanamiNeural' },
    { code:'zh', label:'🇨🇳 Mandarim',  voice:'zh-CN-XiaoxiaoNeural' },
  ]
};

function liveTransInit() {
  const selFrom = document.getElementById('lt-from-lang');
  const selTo   = document.getElementById('lt-to-lang');
  if (selFrom && !selFrom.dataset.inited) {
    selFrom.innerHTML = LIVE_TRANS_LANGUAGES.from.map(l => `<option value="${l.code}" ${l.code===_liveTransFromLang?'selected':''}>${l.label}</option>`).join('');
    selFrom.dataset.inited = '1';
  }
  if (selTo && !selTo.dataset.inited) {
    selTo.innerHTML = LIVE_TRANS_LANGUAGES.to.map(l => `<option value="${l.code}" ${l.code===_liveTransToLang?'selected':''}>${l.label}</option>`).join('');
    selTo.dataset.inited = '1';
  }
}

function liveTransToggle() {
  if (_liveTrans) liveTransStop(); else liveTransStart();
}

async function liveTransStart() {
  if (!window.AZURE_SPEECH_KEY || window.AZURE_SPEECH_KEY === '{{AZURE_SPEECH_KEY}}') {
    showToast('❌ AZURE_SPEECH_KEY não configurada', 'error'); return;
  }
  if (typeof SpeechSDK === 'undefined') {
    showToast('❌ Azure Speech SDK não carregou', 'error'); return;
  }
  try {
    const translationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(
      window.AZURE_SPEECH_KEY, window.AZURE_SPEECH_REGION || 'eastus'
    );
    translationConfig.speechRecognitionLanguage = _liveTransFromLang;
    translationConfig.addTargetLanguage(_liveTransToLang);

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    _liveTransRecognizer = new SpeechSDK.TranslationRecognizer(translationConfig, audioConfig);

    _liveTransRecognizer.recognizing = (s, e) => {
      _liveTransUpdateOriginal(e.result.text, false);
    };

    _liveTransRecognizer.recognized = (s, e) => {
      if (e.result.reason !== SpeechSDK.ResultReason.TranslatedSpeech) return;
      const originalRaw = e.result.text;
      const translated  = e.result.translations.get(_liveTransToLang);
      if (!originalRaw?.trim() || !translated?.trim()) return;
      // Filtro A — instantâneo
      const original = _fillerCleanLocal(originalRaw);
      _liveTransUpdateOriginal(original, true);
      _liveTransUpdateTranslated(translated);
      _liveTransAddHistory(original, translated);
      _liveTransEnqueueTTS(translated);
      // Filtro B — IA em background
      if(window._fillerConfig?.aiEnabled){ _fillerCleanAI(original).then(aiClean=>{ if(aiClean!==original) _liveTransUpdateOriginal(aiClean, true); }); }
    };

    _liveTransRecognizer.canceled = (s, e) => {
      if (e.reason === SpeechSDK.CancellationReason.Error) {
        showToast('❌ Erro: ' + e.errorDetails, 'error');
      }
      liveTransStop();
    };

    _liveTransRecognizer.startContinuousRecognitionAsync(
      () => {
        _liveTrans = true;
        _liveTransUpdateUI(true);
        showToast('🌐 Tradução ao vivo ativada', 'success');
      },
      err => { showToast('❌ Microfone: ' + err, 'error'); }
    );
  } catch(e) {
    showToast('❌ Erro: ' + e.message, 'error');
  }
}

function liveTransStop() {
  _liveTrans = false;
  try { _liveTransRecognizer?.stopContinuousRecognitionAsync(); _liveTransRecognizer?.close(); } catch(_) {}
  _liveTransRecognizer = null;
  _liveTransQueue = [];
  _liveTransSpeaking = false;
  _liveTransUpdateUI(false);
  showToast('⏹ Tradução ao vivo encerrada', 'info');
}

function liveTransSetFrom(code) {
  if (_liveTrans) liveTransStop();
  _liveTransFromLang = code;
}

function liveTransSetTo(code) {
  if (_liveTrans) liveTransStop();
  _liveTransToLang = code;
  const lang = LIVE_TRANS_LANGUAGES.to.find(l => l.code === code);
  _liveTransVoice = lang?.voice || 'en-US-JennyNeural';
}

function _liveTransEnqueueTTS(text) {
  _liveTransQueue.push(text);
  if (!_liveTransSpeaking) _liveTransProcessQueue();
}

function _liveTransProcessQueue() {
  if (_liveTransQueue.length === 0) { _liveTransSpeaking = false; return; }
  if (typeof SpeechSDK === 'undefined') { _liveTransQueue = []; return; }
  _liveTransSpeaking = true;
  const text = _liveTransQueue.shift();
  try {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      window.AZURE_SPEECH_KEY, window.AZURE_SPEECH_REGION || 'eastus'
    );
    speechConfig.speechSynthesisVoiceName = _liveTransVoice;
    const player = new SpeechSDK.SpeakerAudioDestination();
    player.onAudioEnd = () => { _liveTransSpeaking = false; _liveTransProcessQueue(); };
    const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
    const synth = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
    synth.speakTextAsync(text, result => { synth.close(); }, err => { synth.close(); _liveTransSpeaking = false; _liveTransProcessQueue(); });
  } catch(e) { _liveTransSpeaking = false; _liveTransProcessQueue(); }
}

function _liveTransUpdateOriginal(text, isFinal) {
  const el = document.getElementById('lt-original');
  if (!el) return;
  el.textContent = text;
  el.style.opacity = isFinal ? '1' : '0.5';
}

function _liveTransUpdateTranslated(text) {
  const el = document.getElementById('lt-translated');
  if (el) el.textContent = text;
}

function _liveTransAddHistory(original, translated) {
  const el = document.getElementById('lt-history');
  if (!el) return;
  const placeholder = el.querySelector('div[style*="padding:16px"]');
  if (placeholder) placeholder.remove();
  const item = document.createElement('div');
  item.className = 'lt-history-item';
  item.innerHTML = `<div style="font-size:11px;color:var(--muted);margin-bottom:2px;">${original}</div><div style="font-weight:700;color:var(--accent);">${translated}</div>`;
  el.insertBefore(item, el.firstChild);
  const items = el.querySelectorAll('.lt-history-item');
  if (items.length > 20) items[items.length - 1].remove();
}

function _liveTransUpdateUI(active) {
  const btn = document.getElementById('lt-toggle-btn');
  const dot = document.getElementById('lt-dot');
  const lbl = document.getElementById('lt-status-label');
  if (btn) { btn.textContent = active ? '⏹ Parar Tradução' : '▶ Iniciar Tradução'; btn.style.background = active ? 'var(--red)' : ''; }
  if (dot) dot.style.display = active ? 'block' : 'none';
  if (lbl) lbl.textContent = active ? '● Traduzindo ao vivo...' : 'Pronto para traduzir';
}
// ════════════════════════════════════════════════════════════════
//  FIM FASE 2
// ════════════════════════════════════════════════════════════════

function startFriendPractice() { closeFriendChat(); navApp('sala'); showToast('💡 Compartilhe o código da sala com seu amigo!','info'); }

const _amiNotifQueue=[]; let _amiNotifShowing=false;
function _amiShowLoginNotif(name, uid) { _amiNotifQueue.push({name,uid}); if(!_amiNotifShowing)_amiShowNextNotif(); }
function _amiShowNextNotif() {
  if(!_amiNotifQueue.length){_amiNotifShowing=false;return;}
  _amiNotifShowing=true;
  const {name,uid}=_amiNotifQueue.shift();
  const el=document.createElement('div');
  el.className='friend-login-notif';
  el.onclick=()=>{openFriendChat(uid,name);el.remove();navApp('amigos');};
  el.innerHTML=`<div class="fn-dot"></div><div class="fn-text"><div class="fn-name">${_esc(name)}</div><div class="fn-sub">entrou agora · toque para chamar</div></div><button class="fn-close" onclick="event.stopPropagation();this.parentElement.remove()">✕</button>`;
  document.body.appendChild(el);
  setTimeout(()=>{el.style.animation='notifSlide .3s reverse';setTimeout(()=>{el.remove();_amiShowNextNotif();},280);},5000);
}

function _amiUpdateOnlineCount() {
  const online=_ami.friends.filter(f=>_ami.online[f.uid]).length;
  const badge=document.getElementById('friends-online-count');
  if(badge){badge.textContent=online;badge.classList.toggle('show',online>0);}
}

async function _amiLoadVotes() {
  if(!db)return;
  try {
    const snap=await db.collection('feature_votes').get();
    snap.docs.forEach(d=>{
      const btn=document.querySelector(`[data-voted][onclick*="'${d.id}'"]`);
      if(!btn)return;
      const count=d.data().count||0;
      btn.querySelector('.vote-count').textContent=count;
      const myVote=(d.data().voters||[]).includes(window._fbUser?.uid);
      if(myVote){btn.classList.add('btn-primary');btn.classList.remove('btn-ghost');btn.dataset.voted='1';}
    });
  } catch(e){}
}

async function amiVoteSugestao(btn, id) {
  if(!window._fbUser?.uid||!db){showToast('Faça login para votar','error');return;}
  const myUid=window._fbUser.uid;
  if(btn.dataset.voted==='1'){showToast('Você já votou nesta sugestão 👍','info');return;}
  try {
    btn.disabled=true;
    const ref=db.collection('feature_votes').doc(id);
    await db.runTransaction(async t=>{
      const snap=await t.get(ref);
      const data=snap.exists?snap.data():{count:0,voters:[]};
      if((data.voters||[]).includes(myUid))return;
      t.set(ref,{count:(data.count||0)+1,voters:[...(data.voters||[]),myUid]},{merge:true});
    });
    const countEl=btn.querySelector('.vote-count');
    if(countEl)countEl.textContent=parseInt(countEl.textContent||0)+1;
    // Estilo neon de votado
    btn.classList.add('voted');
    btn.dataset.voted='1';
    showToast('👍 Voto registrado! Obrigado pelo feedback!','success');
  } catch(e){ console.warn('amiVoteSugestao',e); showToast('Erro ao registrar voto','error'); }
  finally{ btn.disabled=false; }
}

// Carrega contagens de votos ao abrir aba Novidades
async function _amiLoadVotes() {
  if(!db) return;
  try {
    const ids=['srs','pronun','escuta','gamif','shadow','diario'];
    const myUid=window._fbUser?.uid;
    await Promise.all(ids.map(async id=>{
      const snap=await db.collection('feature_votes').doc(id).get();
      if(!snap.exists) return;
      const data=snap.data();
      // Atualiza contador visual
      document.querySelectorAll(`.sug-vote-btn[onclick*="'${id}'"] .vote-count`).forEach(el=>{ el.textContent=data.count||0; });
      // Marca como já votado
      if(myUid&&(data.voters||[]).includes(myUid)){
        document.querySelectorAll(`.sug-vote-btn[onclick*="'${id}'"]`).forEach(btn=>{
          btn.classList.add('voted'); btn.dataset.voted='1';
        });
      }
    }));
  } catch(e){ console.warn('_amiLoadVotes',e); }
}

function _esc(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/*
  ⚠️ REGRAS FIRESTORE NECESSÁRIAS — adicione no Firebase Console → Firestore → Rules:

  match /presence/{uid} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && request.auth.uid == uid;
  }
  match /leaderboard/{uid} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && request.auth.uid == uid;
  }
  match /friend_messages/{msgId} {
    allow read: if request.auth != null &&
      (resource.data.fromUid == request.auth.uid || resource.data.toUid == request.auth.uid);
    allow create: if request.auth != null && request.resource.data.fromUid == request.auth.uid;
    allow delete: if false;
  }

  match /group_messages/{msgId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    allow delete: if false;
  }
  match /group_presence/{groupId}/online/{uid} {
    allow read: if request.auth != null;
    allow write: if request.auth != null && request.auth.uid == uid;
  }
  match /conversation_groups/{docId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null;
    allow update, delete: if false;
  }

  ⚠️ ÍNDICE COMPOSTO NECESSÁRIO para group_messages:
  Firebase Console → Firestore → Índices → Composto → Adicionar:
    Coleção: group_messages
    Campos: groupId (Crescente) · createdAt (Crescente)
    Escopo: Coleção
  Firebase Console → Firestore → Índices → Composto → Adicionar:
    Coleção: friend_messages
    Campos: fromUid (Crescente) · toUid (Crescente) · createdAt (Crescente)
    Escopo: Coleção
  (ou use o link que aparece no console de erro do navegador)
*/

// ════════════════════════════════════════════════════════
//  ASSISTENTE PESSOAL DE IDIOMAS
// ════════════════════════════════════════════════════════
let _astLang = 'inglês';
let _astChatHistory = [];
let _astGenerated = false;

function astSetLang(btn, lang) {
  _astLang = lang;
  document.querySelectorAll('.ast-lang-btn').forEach(b => {
    b.style.border = '1px solid var(--border)';
    b.style.background = 'transparent';
    b.style.color = 'var(--muted)';
  });
  btn.style.border = '1.5px solid rgba(0,229,255,.4)';
  btn.style.background = 'var(--adim)';
  btn.style.color = 'var(--accent)';
}

function astLoadStats() {
  const xp = _gamif?.xp || 0;
  const streak = _gamif?.streakDays || 0;
  const vocabEl = document.getElementById('ast-stat-vocab');
  const xpEl = document.getElementById('ast-stat-xp');
  const strEl = document.getElementById('ast-stat-streak');
  if (xpEl) xpEl.textContent = xp;
  if (strEl) strEl.textContent = streak + '🔥';
  // Conta vocabulário salvo
  const uid = window._fbUser?.uid;
  if (vocabEl && uid && db) {
    db.collection('users').doc(uid).collection('vocabulary').get()
      .then(s => { vocabEl.textContent = s.size; })
      .catch(() => { vocabEl.textContent = '—'; });
  } else if (vocabEl) { vocabEl.textContent = '—'; }
}

async function astGenerate() {
  const btn = document.getElementById('ast-gen-btn');
  const label = document.getElementById('ast-gen-label');
  const icon = document.getElementById('ast-gen-icon');
  const planArea = document.getElementById('ast-plan-area');
  const actArea = document.getElementById('ast-activities');
  const chatWrap = document.getElementById('ast-chat-wrap');

  if (!btn || !planArea) return;

  // Estado carregando
  btn.disabled = true;
  if (label) label.textContent = 'Gerando plano...';
  if (icon) icon.textContent = '⏳';

  const xp = _gamif?.xp || 0;
  const streak = _gamif?.streakDays || 0;
  const nivel = xp < 200 ? 'A1 (Iniciante)' : xp < 600 ? 'A2 (Básico)' : xp < 1200 ? 'B1 (Intermediário)' : xp < 2500 ? 'B2 (Avançado)' : 'C1 (Fluente)';
  const hora = new Date().getHours();
  const periodo = hora < 12 ? 'manhã' : hora < 18 ? 'tarde' : 'noite';

  // Busca últimas palavras do vocabulário
  let palavrasRecentes = [];
  try {
    const uid = window._fbUser?.uid;
    if (uid && db) {
      const snap = await db.collection('users').doc(uid).collection('vocabulary')
        .orderBy('createdAt', 'desc').limit(8).get();
      palavrasRecentes = snap.docs.map(d => d.data().word || d.data().palavra).filter(Boolean);
    }
  } catch(_) {}

  const prompt = `Você é o Assistente Pessoal de Idiomas do AIVOX. Responda APENAS com JSON válido, sem texto extra.

Dados do usuário:
- Idioma que está aprendendo: ${_astLang}
- Nível estimado: ${nivel} (${xp} XP total)
- Streak atual: ${streak} dias seguidos
- Período do dia: ${periodo}
- Palavras recentes no vocabulário: ${palavrasRecentes.length > 0 ? palavrasRecentes.join(', ') : 'nenhuma ainda'}

Retorne JSON com esta estrutura exata:
{
  "saudacao": "Uma frase motivadora curta personalizada para o usuário (máx 120 chars)",
  "diagnostico": "1-2 frases sobre o nível e progresso atual do usuário",
  "atividades": [
    {"id": "1", "icon": "emoji", "titulo": "Nome da atividade", "descricao": "O que fazer e por que", "duracao": "X min", "aba": "nome-da-aba", "prioridade": "alta|media|baixa"},
    {"id": "2", "icon": "emoji", "titulo": "...", "descricao": "...", "duracao": "X min", "aba": "nome-da-aba", "prioridade": "alta|media|baixa"},
    {"id": "3", "icon": "emoji", "titulo": "...", "descricao": "...", "duracao": "X min", "aba": "nome-da-aba", "prioridade": "alta|media|baixa"}
  ],
  "dica_dia": "Uma dica prática e específica para o nível e idioma do usuário"
}

Para o campo "aba", use exatamente um desses valores: professor, licoes, flash, exer, pronunc, shadowing, diario, vocab, livre
Adapte as 3 atividades ao nível (${nivel}), ao idioma (${_astLang}) e ao período (${periodo}).`;

  try {
    const backendUrl=(window.AIVOX_BACKEND_URL||window.BACKEND_URL||'').trim();
    if(!backendUrl) throw new Error('Backend não configurado');
    const token=await auth?.currentUser?.getIdToken().catch(()=>null);
    const resp = await fetch(backendUrl + '/api/professor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token?{'Authorization':'Bearer '+token}:{}) },
      body: JSON.stringify({
        system: 'Você é o Assistente Pessoal de Idiomas do AIVOX. Responda APENAS com JSON válido, sem texto extra, sem markdown.',
        messages: [{ role: 'user', content: prompt }]
      }),
      signal: AbortSignal.timeout(20000)
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const raw = (data.answer || '').trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);

    // Renderiza plano
    planArea.style.display = 'block';
    planArea.innerHTML = `<div style="font-size:15px;font-weight:800;color:#a855f7;margin-bottom:8px;">${parsed.saudacao || ''}</div><div style="font-size:12px;color:var(--muted);line-height:1.6;">${parsed.diagnostico || ''}</div>${parsed.dica_dia ? `<div style="margin-top:10px;padding:10px 12px;background:rgba(168,85,247,.1);border:1px solid rgba(168,85,247,.2);border-radius:10px;font-size:12px;color:var(--text);">💡 <strong>Dica do dia:</strong> ${parsed.dica_dia}</div>` : ''}`;

    // Renderiza atividades
    if (actArea && parsed.atividades?.length) {
      actArea.style.display = 'flex';
      actArea.innerHTML = '<div style="font-size:10px;font-family:var(--mono);color:var(--muted);letter-spacing:2px;margin-bottom:4px;">📋 ATIVIDADES SUGERIDAS PARA HOJE</div>';
      const priorCor = { alta: '#ff4466', media: '#ffd000', baixa: '#00ff88' };
      parsed.atividades.forEach(a => {
        const card = document.createElement('div');
        card.style.cssText = 'background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:border-color .18s;';
        card.onmouseover = () => { card.style.borderColor = 'rgba(168,85,247,.35)'; };
        card.onmouseout = () => { card.style.borderColor = 'var(--border)'; };
        card.onclick = () => { navApp('learn'); setTimeout(() => { const tabs = document.querySelectorAll('.learn-tab'); tabs.forEach(t => t.classList.remove('active')); const t = Array.from(tabs).find(t2 => t2.onclick?.toString().includes("'"+a.aba+"'")); if (t) { t.classList.add('active'); learnTab(a.aba, t); } }, 300); };
        card.innerHTML = `<div style="font-size:28px;flex-shrink:0;">${a.icon}</div><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:800;margin-bottom:2px;">${a.titulo}</div><div style="font-size:11px;color:var(--muted);line-height:1.4;">${a.descricao}</div></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;"><span style="font-size:10px;color:var(--muted);font-family:var(--mono);">${a.duracao}</span><span style="font-size:9px;font-weight:800;font-family:var(--mono);color:${priorCor[a.prioridade]||'var(--muted)'};">${a.prioridade?.toUpperCase()}</span></div>`;
        actArea.appendChild(card);
      });
    }

    // Inicia histórico do chat com contexto
    _astChatHistory = [
      { role: 'user', content: prompt },
      { role: 'assistant', content: raw }
    ];
    if (chatWrap) chatWrap.style.display = 'flex';

    // Adiciona msg inicial no chat
    _astAddChatMsg('assistant', `Seu plano está pronto! 🎯 Você tem ${streak} dias de streak e já acumulou ${xp} XP. Quer que eu explique alguma atividade ou adapte o plano para você?`);

    _astGenerated = true;
    if (label) label.textContent = 'Atualizar plano';
    if (icon) icon.textContent = '↻';

  } catch(e) {
    planArea.style.display = 'block';
    planArea.innerHTML = `<div style="color:var(--red);font-size:12px;">⚠️ Erro ao gerar plano: ${e.message}. Verifique a conexão e tente novamente.</div>`;
  }

  btn.disabled = false;
}

function _astAddChatMsg(role, text) {
  const msgs = document.getElementById('ast-chat-msgs');
  if (!msgs) return;
  const div = document.createElement('div');
  const isAI = role === 'assistant';
  div.style.cssText = `max-width:85%;padding:10px 13px;border-radius:${isAI ? '4px 14px 14px 14px' : '14px 14px 4px 14px'};font-size:13px;line-height:1.5;align-self:${isAI ? 'flex-start' : 'flex-end'};background:${isAI ? 'var(--surface)' : 'rgba(168,85,247,.18)'};border:1px solid ${isAI ? 'var(--border)' : 'rgba(168,85,247,.3)'};color:var(--text);`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

async function astChatSend() {
  const inp = document.getElementById('ast-chat-inp');
  const text = inp?.value?.trim();
  if (!text) return;
  inp.value = '';
  _astAddChatMsg('user', text);
  _astChatHistory.push({ role: 'user', content: text });

  const thinking = document.createElement('div');
  thinking.style.cssText = 'align-self:flex-start;font-size:12px;color:var(--muted);padding:8px 12px;';
  thinking.textContent = '🧠 Pensando...';
  document.getElementById('ast-chat-msgs')?.appendChild(thinking);

  try {
    const backendUrl=(window.AIVOX_BACKEND_URL||window.BACKEND_URL||'').trim();
    if(!backendUrl) throw new Error('Backend não configurado');
    const token=await auth?.currentUser?.getIdToken().catch(()=>null);
    const resp = await fetch(backendUrl + '/api/professor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token?{'Authorization':'Bearer '+token}:{}) },
      body: JSON.stringify({
        system: `Você é o Assistente Pessoal de Idiomas do AIVOX. O usuário está aprendendo ${_astLang}. Responda em português, de forma amigável, prática e motivadora. Respostas curtas (máx 3 parágrafos).`,
        messages: _astChatHistory.slice(-10)
      }),
      signal: AbortSignal.timeout(20000)
    });
    thinking.remove();
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const data = await resp.json();
    const reply = (data.answer || '').trim();
    _astChatHistory.push({ role: 'assistant', content: reply });
    _astAddChatMsg('assistant', reply);
  } catch(e) {
    thinking.remove();
    _astAddChatMsg('assistant', '⚠️ Erro ao responder. Tente novamente.');
  }
}

// ════════════════════════════════════════════════════════
//  GRUPOS DE CONVERSAÇÃO
// ════════════════════════════════════════════════════════
let _grpFilter = 'todos';
let _grpListener = null;

// Grupos padrão (ficam no Firestore; estes são seeds locais para demo)
const _grpSeeds = [
  { id: 'grp_en_b1', tema: 'Inglês B1 · Conversação Geral', lang: 'inglês', nivel: 'B1', membros: 0, host: 'AIVOX', ts: Date.now() },
  { id: 'grp_en_b2', tema: 'Inglês B2 · Negócios & Trabalho', lang: 'inglês', nivel: 'B2', membros: 0, host: 'AIVOX', ts: Date.now() },
  { id: 'grp_es_a2', tema: 'Espanhol A2 · Viagens & Cultura', lang: 'espanhol', nivel: 'A2', membros: 0, host: 'AIVOX', ts: Date.now() },
  { id: 'grp_fr_b1', tema: 'Francês B1 · Cotidiano', lang: 'francês', nivel: 'B1', membros: 0, host: 'AIVOX', ts: Date.now() },
];
const _nivelCor = { A1:'#00ff88', A2:'#00e5ff', B1:'#ffd000', B2:'#ff8c00', C1:'#a855f7' };

function grpFilter(btn, lang) {
  _grpFilter = lang;
  document.querySelectorAll('.grp-filter-btn').forEach(b => {
    b.style.border = '1px solid var(--border)';
    b.style.background = 'transparent';
    b.style.color = 'var(--muted)';
  });
  btn.style.border = '1.5px solid rgba(0,229,255,.4)';
  btn.style.background = 'var(--adim)';
  btn.style.color = 'var(--accent)';
  _grpRender();
}

function _grpRender(grupos) {
  const list = document.getElementById('grp-list');
  if (!list) return;
  const all = grupos || window._grpData || _grpSeeds;
  window._grpData = all;
  const filtered = _grpFilter === 'todos' ? all : all.filter(g => g.lang === _grpFilter);

  if (!filtered.length) {
    list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px;">Nenhum grupo neste idioma ainda.<br>Crie o primeiro! 👇</div>';
    return;
  }

  list.innerHTML = '';
  filtered.forEach(g => {
    const expirou = g.ts && (Date.now() - g.ts) > 86400000 && g.host !== 'AIVOX';
    if (expirou) return;
    const div = document.createElement('div');
    div.style.cssText = 'background:var(--card);border:1px solid var(--border);border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .18s;';
    div.onmouseover = () => { div.style.borderColor = 'rgba(168,85,247,.3)'; div.style.transform = 'translateY(-1px)'; };
    div.onmouseout = () => { div.style.borderColor = 'var(--border)'; div.style.transform = ''; };
    div.onclick = () => grpEntrar(g);
    const nivelCor = _nivelCor[g.nivel] || 'var(--muted)';
    const langEmoji = { inglês:'<span class="flag-emoji">🇺🇸</span>', espanhol:'<span class="flag-emoji">🇪🇸</span>', francês:'<span class="flag-emoji">🇫🇷</span>', alemão:'<span class="flag-emoji">🇩🇪</span>', japonês:'<span class="flag-emoji">🇯🇵</span>', italiano:'<span class="flag-emoji">🇮🇹</span>', chinês:'<span class="flag-emoji">🇨🇳</span>', russo:'<span class="flag-emoji">🇷🇺</span>' }[g.lang] || '<span class="flag-emoji">🌐</span>';
    div.innerHTML = `
      <div style="width:44px;height:44px;border-radius:12px;background:rgba(168,85,247,.15);border:1px solid rgba(168,85,247,.25);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${langEmoji}</div>
      <div style="flex:1;min-width:0;overflow:hidden;">
        <div style="font-size:13px;font-weight:800;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${g.tema}</div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-size:10px;font-weight:800;font-family:var(--mono);color:${nivelCor};background:${nivelCor}22;border:1px solid ${nivelCor}44;padding:2px 6px;border-radius:20px;flex-shrink:0;">${g.nivel}</span>
          <span id="grp-online-badge-${g.id}" style="font-size:10px;color:var(--muted);flex-shrink:0;">👥 0 online</span>
          ${g.host === 'AIVOX' ? '<span style="font-size:9px;font-weight:800;font-family:var(--mono);background:var(--adim);color:var(--accent);border:1px solid rgba(0,229,255,.2);padding:2px 6px;border-radius:20px;flex-shrink:0;">OFICIAL</span>' : ''}
        </div>
      </div>
      <div style="background:linear-gradient(135deg,#a855f7,var(--accent));color:#fff;border:none;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:800;flex-shrink:0;white-space:nowrap;">Entrar →</div>`;
    list.appendChild(div);
  });
}

async function grpCriar() {
  const tema = document.getElementById('grp-tema-inp')?.value?.trim();
  const lang = document.getElementById('grp-lang-sel')?.value || 'inglês';
  const nivel = document.getElementById('grp-nivel-sel')?.value || 'B1';
  if (!tema) { showToast('Digite o tema do grupo', 'error'); return; }
  const uid = window._fbUser?.uid;
  if (!uid) { showToast('Faça login para criar um grupo', 'error'); return; }

  const grupo = {
    tema, lang, nivel,
    host: window._fbUser?.name || 'Usuário',
    hostUid: uid,
    membros: 1,
    ts: Date.now(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    if (db) await db.collection('conversation_groups').add(grupo);
    if (document.getElementById('grp-tema-inp')) document.getElementById('grp-tema-inp').value = '';
    // Adiciona localmente
    if (!window._grpData) window._grpData = [..._grpSeeds];
    window._grpData.unshift({ ...grupo, id: 'grp_' + Date.now() });
    _grpRender();
    showToast('🌍 Grupo criado!', 'success');
    // Abre a sala para o criador
    grpEntrar(grupo);
  } catch(e) {
    showToast('Erro ao criar grupo', 'error');
  }
}

// ── Chat de Grupo — funciona via localStorage + BroadcastChannel ─
// (Firestore é opcional; ativa automaticamente se tiver permissão)
let _grpChatAtual = null;
let _grpChatListener = null;
let _grpPresenceListener = null;  // listener de presença Firestore
let _grpPresenceRef = null;       // ref do doc de presença do usuário atual
let _grpBC = null;          // BroadcastChannel para sincronizar abas
let _grpMsgsLocal = {};     // cache em memória por groupId
// FIX desktop: usa <img> via flagcdn para garantir bandeira em Windows/Chrome
// Flags emoji Unicode não renderizam no Windows — flagcdn garante compatibilidade cross-platform
function _makeFlagImg(code, emoji) {
  return '<img src="https://flagcdn.com/40x30/'+code+'.png" '
    + 'width="32" height="24" alt="'+emoji+'" '
    + 'style="border-radius:4px;display:block;object-fit:cover;" '
    + 'onerror="this.style.display=\'none\';this.nextSibling&&(this.nextSibling.style.display=\'inline\');">'
    + '<span class="flag-emoji" style="font-size:24px;display:none;">'+emoji+'</span>';
}
const _langEmoji = {
  inglês:   _makeFlagImg('us','🇺🇸'),
  espanhol: _makeFlagImg('es','🇪🇸'),
  francês:  _makeFlagImg('fr','🇫🇷'),
  alemão:   _makeFlagImg('de','🇩🇪'),
  japonês:  _makeFlagImg('jp','🇯🇵'),
  italiano: _makeFlagImg('it','🇮🇹'),
  chinês:   _makeFlagImg('cn','🇨🇳'),
  russo:    _makeFlagImg('ru','🇷🇺'),
  árabe:    _makeFlagImg('ae','🇦🇪'),
  coreano:  _makeFlagImg('kr','🇰🇷'),
  holandês: _makeFlagImg('nl','🇳🇱'),
  turco:    _makeFlagImg('tr','🇹🇷'),
};

// ── Carrega msgs do localStorage ────────────────────────────────
function _grpLoadLocal(groupId) {
  try {
    const raw = localStorage.getItem('grp_msgs_' + groupId);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

// ── Salva msgs no localStorage ──────────────────────────────────
function _grpSaveLocal(groupId, msgs) {
  try {
    // Mantém só últimas 100 msgs no storage
    const slice = msgs.slice(-100);
    localStorage.setItem('grp_msgs_' + groupId, JSON.stringify(slice));
    _grpMsgsLocal[groupId] = slice;
  } catch(e) {}
}

function grpEntrar(grupo) {
  const uid  = window._fbUser?.uid;
  const nome = window._fbUser?.name || window._fbUser?.displayName || 'Usuário';
  if (!uid) { showToast('Faça login para entrar no grupo', 'error'); return; }

  _grpChatAtual = grupo;
  if (!_grpMsgsLocal[grupo.id]) _grpMsgsLocal[grupo.id] = _grpLoadLocal(grupo.id);

  // Atualiza header
  const emoji    = _langEmoji[grupo.lang] || '🌍';
  const nivelCor = _nivelCor[grupo.nivel] || 'var(--muted)';
  document.getElementById('grp-chat-avatar').innerHTML = emoji;
  document.getElementById('grp-chat-title').textContent  = grupo.tema;
  document.getElementById('grp-chat-meta').innerHTML =
    `<span style="font-size:10px;font-weight:800;font-family:var(--mono);color:${nivelCor};">${grupo.nivel}</span>
     <span id="grp-online-count" style="color:var(--muted);">● 1 online</span>
     <span id="grp-fs-status" style="font-size:9px;color:var(--muted);font-family:var(--mono);">conectando…</span>`;

  document.getElementById('grp-chat-overlay').style.display = 'flex';
  document.getElementById('grp-chat-inp').placeholder = `Escreva em ${grupo.lang} aqui...`;
  _grpRenderMsgs(_grpMsgsLocal[grupo.id] || [], uid);
  // FIX: scroll para o fim das mensagens após renderizar
  requestAnimationFrame(()=>{
    const msgs=document.getElementById('grp-chat-msgs');
    if(msgs) msgs.scrollTop=msgs.scrollHeight;
    // Focar input para mobile abrir teclado imediatamente
    const inp=document.getElementById('grp-chat-inp');
    if(inp) inp.focus();
  });

  // ── BroadcastChannel (sync entre abas do mesmo browser) ──────
  try {
    if (_grpBC) { _grpBC.close(); _grpBC = null; }
    _grpBC = new BroadcastChannel('aivox_grp_' + grupo.id);
    _grpBC.onmessage = (e) => {
      if (e.data?.type === 'msg' && e.data.msg) {
        const msgs = _grpMsgsLocal[grupo.id] || [];
        if (!msgs.some(m => m._lid === e.data.msg._lid)) {
          msgs.push(e.data.msg);
          _grpSaveLocal(grupo.id, msgs);
          _grpRenderMsgs(msgs, uid);
        }
      }
    };
  } catch(e) {}

  if (!db) return;

  // ── PRESENÇA FIRESTORE ────────────────────────────────────────
  // Usa a coleção group_presence/{groupId}/online/{uid}
  // Regra necessária: allow read, write: if request.auth != null && request.auth.uid == uid
  if (_grpPresenceListener) { try { _grpPresenceListener(); } catch(e) {} _grpPresenceListener = null; }
  if (_grpPresenceRef) { try { _grpPresenceRef.delete(); } catch(e) {} _grpPresenceRef = null; }

  _grpPresenceRef = db.collection('group_presence').doc(grupo.id).collection('online').doc(uid);

  // Monta listener ANTES do write — garante contagem mesmo se o write demorar
  _grpPresenceListener = db.collection('group_presence').doc(grupo.id).collection('online')
    .onSnapshot(snap => {
      // Filtra docs fantasma: só conta quem teve heartbeat nos últimos 90s
      const agora = Date.now();
      const EXPIRY_MS = 90000;
      const ativos = snap.docs.filter(d => {
        const ts = d.data().ts;
        if (!ts) return true;
        const ms = ts.toMillis ? ts.toMillis() : ts;
        return (agora - ms) < EXPIRY_MS;
      });
      const count = ativos.length;
      const el = document.getElementById('grp-online-count');
      if (el) {
        el.textContent = '● ' + count + ' online';
        el.style.color = count > 1 ? 'var(--green)' : 'var(--muted)';
      }
      // Atualiza badge na lista de grupos
      const badge = document.getElementById('grp-online-badge-' + grupo.id);
      if (badge) {
        badge.textContent = count > 0 ? '● ' + count + ' online' : '👥 0 online';
        badge.style.color = count > 0 ? 'var(--green)' : 'var(--muted)';
        badge.style.fontWeight = count > 0 ? '700' : '';
      }
      const fsEl = document.getElementById('grp-fs-status');
      if (fsEl) { fsEl.textContent = '● ao vivo'; fsEl.style.color = 'var(--green)'; }
      console.log('[GRP presence] ativos =', count, '| total =', snap.size, '| docs:', ativos.map(d => d.id));
    }, err => {
      console.warn('[GRP presence] READ falhou:', err.code, err.message);
      const fsEl = document.getElementById('grp-fs-status');
      if (fsEl) { fsEl.textContent = '⚠ presença offline (' + err.code + ')'; fsEl.style.color = 'var(--yellow)'; }
    });

  // Escreve presença com timestamp para detectar docs expirados
  _grpPresenceRef.set({ uid, nome, ts: firebase.firestore.FieldValue.serverTimestamp() })
    .then(() => {
      console.log('[GRP presence] WRITE OK — uid:', uid, '| grupo:', grupo.id);
      // Heartbeat a cada 30s para manter presença viva (evita docs fantasma)
      clearInterval(window._grpHeartbeat);
      window._grpHeartbeat = setInterval(() => {
        if (_grpPresenceRef && _grpChatAtual) {
          _grpPresenceRef.set({ uid, nome, ts: firebase.firestore.FieldValue.serverTimestamp() }).catch(() => {});
        } else {
          clearInterval(window._grpHeartbeat);
        }
      }, 30000);
    })
    .catch(err => {
      console.warn('[GRP presence] WRITE falhou:', err.code, err.message);
      const fsEl = document.getElementById('grp-fs-status');
      if (fsEl) { fsEl.textContent = '⚠ sem presença (' + err.code + ')'; fsEl.style.color = 'var(--yellow)'; }
    });

  // ── MENSAGENS FIRESTORE ───────────────────────────────────────
  // Estratégia: tenta com orderBy (precisa de índice composto).
  // Se falhar com failed-precondition → cai no fallback sem orderBy (sem índice).
  // O fallback ordena por timestamp local após receber os docs.
  if (_grpChatListener) { try { _grpChatListener(); } catch(e) {} _grpChatListener = null; }

  function _grpApplySnap(snap) {
    const fsMsgs = snap.docs.map(d => ({
      _fsid: d.id, ...d.data(),
      ts: d.data().createdAt?.toMillis?.() || d.data().ts || Date.now()
    }));
    const fsLids = new Set(fsMsgs.map(m => m._lid).filter(Boolean));
    const pending = (_grpMsgsLocal[grupo.id] || []).filter(m => !m._fsid && !fsLids.has(m._lid));
    const merged  = [...fsMsgs, ...pending].sort((a,b) => (a.ts||0) - (b.ts||0));
    _grpMsgsLocal[grupo.id] = merged;
    _grpSaveLocal(grupo.id, merged);
    _grpRenderMsgs(merged, uid);
  }

  function _grpSetStatus(txt, color) {
    const st = document.getElementById('grp-fs-status');
    if (st) { st.textContent = txt; st.style.color = color; }
  }

  // Tenta query com índice composto primeiro (orderBy garante ordem cronológica)
  try {
    _grpChatListener = db.collection('group_messages')
      .where('groupId', '==', grupo.id)
      .orderBy('createdAt', 'asc')
      .limitToLast(80)
      .onSnapshot(snap => {
        _grpApplySnap(snap);
        _grpSetStatus('🟢 ao vivo', 'var(--green)');
      }, err => {
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          // Índice composto ausente — fallback sem orderBy (funciona sem índice, ordena localmente)
          const indexUrl = err.message?.match(/https:\/\/\S+/)?.[0];
          console.info('[grpChat] Usando fallback (índice composto não criado ainda).' + (indexUrl ? ' Crie em: ' + indexUrl : ''));
          _grpSetStatus('conectando…', 'var(--muted)');
          try {
            _grpChatListener = db.collection('group_messages')
              .where('groupId', '==', grupo.id)
              .limit(80)
              .onSnapshot(snap2 => {
                _grpApplySnap(snap2);
                _grpSetStatus('🟢 ao vivo', 'var(--green)');
              }, () => _grpSetStatus('📴 local', 'var(--muted)'));
          } catch(e2) {}
        } else {
          console.warn('[grpChat] Firestore erro:', err?.code);
          _grpSetStatus('📴 local', 'var(--muted)');
        }
      });
  } catch(e) {}
}

function _grpRenderMsgs(msgs, myUid) {
  const el = document.getElementById('grp-chat-msgs');
  if (!el) return;
  if (!msgs.length) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">🌍 Seja o(a) primeiro(a) a escrever! 👋</div>';
    return;
  }
  const wasAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  el.innerHTML = '';
  msgs.forEach(m => {
    const mine = m.uid === myUid;
    const ts   = m.createdAt?.toDate?.() || (m.ts ? new Date(m.ts) : new Date());
    const hora = ts.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    const bubble = document.createElement('div');
    bubble.style.cssText = `display:flex;flex-direction:column;align-items:${mine?'flex-end':'flex-start'};gap:2px;margin-bottom:2px;`;
    if (!mine) bubble.innerHTML = `<div style="font-size:10px;color:var(--muted);margin-left:4px;">${_esc(m.nome||'Usuário')}</div>`;
    const inner = document.createElement('div');
    inner.style.cssText = `max-width:78%;padding:9px 13px;border-radius:${mine?'14px 14px 4px 14px':'14px 14px 14px 4px'};font-size:13px;line-height:1.5;
      background:${mine?'rgba(168,85,247,.18)':'rgba(255,255,255,.06)'};
      border:1px solid ${mine?'rgba(168,85,247,.3)':'rgba(255,255,255,.08)'};
      color:${mine?'#d8b4fe':'var(--text)'};`;
    inner.innerHTML = `${_esc(m.text)}<span style="font-size:9px;color:var(--muted);margin-left:8px;opacity:.7;">${hora}</span>`;
    bubble.appendChild(inner);
    el.appendChild(bubble);
  });
  if (wasAtBottom) el.scrollTop = el.scrollHeight;
}

async function grpChatSend() {
  const inp  = document.getElementById('grp-chat-inp');
  const text = inp?.value?.trim();
  if (!text || !_grpChatAtual) return;
  const uid  = window._fbUser?.uid;
  const nome = window._fbUser?.name || window._fbUser?.displayName || 'Usuário';
  if (!uid) { showToast('Faça login para enviar','error'); return; }
  inp.value = '';

  const gid = _grpChatAtual.id;
  const msg = { _lid: uid + '_' + Date.now(), uid, nome, text, groupId: gid, ts: Date.now() };

  // Salva local imediatamente (resposta instantânea)
  const msgs = _grpMsgsLocal[gid] || [];
  msgs.push(msg);
  _grpSaveLocal(gid, msgs);
  _grpRenderMsgs(msgs, uid);

  // Broadcast para outras abas
  try { _grpBC?.postMessage({ type:'msg', msg }); } catch(e) {}

  // Tenta salvar no Firestore (silencioso se falhar)
  if (db) {
    try {
      await db.collection('group_messages').add({
        groupId: gid, uid, nome, text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch(e) {
      // Sem permissão — ok, msg já está local
      const st = document.getElementById('grp-fs-status');
      if (st && !st.textContent.includes('ao vivo')) {
        st.textContent = '📴 local'; st.style.color = 'var(--muted)';
      }
    }
  }
}

function grpChatClose() {
  try { if (_grpBC) { _grpBC.close(); _grpBC = null; } } catch(e) {}
  if (_grpChatListener) { try { _grpChatListener(); } catch(e) {} _grpChatListener = null; }
  // Para heartbeat e remove presença do Firestore ao sair da sala
  clearInterval(window._grpHeartbeat);
  if (_grpPresenceListener) { try { _grpPresenceListener(); } catch(e) {} _grpPresenceListener = null; }
  if (_grpPresenceRef) { try { _grpPresenceRef.delete(); } catch(e) {} _grpPresenceRef = null; }
  _grpChatAtual = null;
  document.getElementById('grp-chat-overlay').style.display = 'none';
}

// Listeners de presença para os badges na lista (atualizados em tempo real)
let _grpListPresenceListeners = [];
function _grpStartListPresence(grupos) {
  // Cancela listeners anteriores
  _grpListPresenceListeners.forEach(u => { try { u(); } catch(e) {} });
  _grpListPresenceListeners = [];
  if (!db) return;
  const agora = Date.now();
  const EXPIRY_MS = 90000;
  grupos.forEach(g => {
    const unsub = db.collection('group_presence').doc(g.id).collection('online')
      .onSnapshot(snap => {
        const now2 = Date.now();
        const count = snap.docs.filter(d => {
          const ts = d.data().ts;
          if (!ts) return true;
          const ms = ts.toMillis ? ts.toMillis() : ts;
          return (now2 - ms) < EXPIRY_MS;
        }).length;
        const badge = document.getElementById('grp-online-badge-' + g.id);
        if (badge) {
          badge.textContent = count > 0 ? '● ' + count + ' online' : '👥 0 online';
          badge.style.color = count > 0 ? 'var(--green)' : 'var(--muted)';
          badge.style.fontWeight = count > 0 ? '700' : '';
        }
      }, () => {});
    _grpListPresenceListeners.push(unsub);
  });
}

// Carrega grupos do Firestore ao abrir Salas
function grpInit() {
  _grpRender(_grpSeeds);
  _grpStartListPresence(_grpSeeds);
  if (!db) return;
  const now = Date.now();
  db.collection('conversation_groups')
    .where('ts', '>', now - 86400000)
    .orderBy('ts', 'desc').limit(20).get()
    .then(snap => {
      const fromFs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const all = [..._grpSeeds, ...fromFs];
      window._grpData = all;
      _grpRender(all);
      _grpStartListPresence(all);
    })
    .catch(() => {});
}

