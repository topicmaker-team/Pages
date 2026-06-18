/* ============================================================
   app.js — SpeakUp! Choicy プロトタイプ
   依存: config.js, content.js  /  描画先: #app
   ============================================================ */
const C = window.CONFIG, D = window.GAME_DATA;
const APP = document.getElementById('app');
const IMG = f => `${C.IMAGES_DIR}/${f}`;
const AUD = f => `${C.AUDIO_DIR}/${f}`;
const $ = (sel, root = document) => root.querySelector(sel);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- data helpers ---------- */
const scenesOf = a => D.scenes.filter(s => s.area_id === a.area_id).sort((x, y) => x.display_order - y.display_order);
const variantsOf = sid => D.variants.filter(v => v.scene_id === sid);
const phraseOf = (sid, vid, role) => D.phrases.find(p => p.scene_id === sid && p.variant_id === vid && p.role === role);
const phrasesOfVariant = (sid, vid) => D.phrases.filter(p => p.scene_id === sid && p.variant_id === vid).sort((a, b) => a.turn_order - b.turn_order);
const ipaFor = w => D.lexicon[w.toLowerCase().replace(/[^a-z'-]/g, '')] || '';
const STOP = new Set("a an the is are am do does did you i it to of in on at and or but with for can could would will my our your this that these those here there he she we they me us them his her its be been have has had just so too now really sure".split(' '));
// 地雷: phrase の text_en に含まれる「化けやすい注意ワード」を拾う（D.traps を参照）
const trapsInText = text => {
  const out = [], seen = new Set();
  (text || '').split(/\s+/).forEach(tok => {
    const w = tok.toLowerCase().replace(/[^a-z'-]/g, '');
    const t = (D.traps || {})[w];
    if (w && t && !seen.has(w)) { seen.add(w); out.push({ word: w, ...t }); }
  });
  return out;
};

function stars(v) {
  let h = '';
  for (let i = 1; i <= 3; i++) { const on = v >= i, half = !on && v >= i - 0.5; h += `<span class="material-symbols-rounded star ${on || half ? 'on' : 'off'}">${half ? 'star_half' : 'star'}</span>`; }
  return `<span class="stars">${h}</span>`;
}
function gapFill(text, n) {
  const toks = text.split(/(\s+)/); const idx = [];
  toks.forEach((t, i) => { const w = t.toLowerCase().replace(/[^a-z'-]/g, ''); if (w && !STOP.has(w)) idx.push(i); });
  const chosen = new Set();
  const m = Math.min(n, idx.length);
  for (let k = 0; k < m; k++) chosen.add(idx[Math.round(k * (idx.length - 1) / Math.max(1, m - 1))]);
  return toks.map((t, i) => {
    if (!chosen.has(i)) return esc(t);
    const mm = t.match(/^([^A-Za-z']*)([A-Za-z'-]+)([^A-Za-z']*)$/);
    if (!mm) return esc(t);
    return esc(mm[1]) + `<u class="blank">${'＿'.repeat(Math.max(3, mm[2].length))}</u>` + esc(mm[3]);
  }).join('');
}

/* ---------- 設定の保存/復元（ローカル保存） ---------- */
const PREFS = (() => { try { return JSON.parse(localStorage.getItem('speakup_prefs')) || {}; } catch (e) { return {}; } })();
function savePrefs() { try { localStorage.setItem('speakup_prefs', JSON.stringify({ bgm: bgm.on, sub: SUB })); } catch (e) {} }

/* ---------- BGM（画面別トラック） ---------- */
const bgm = { audio: document.getElementById('bgm'), on: (typeof PREFS.bgm === 'boolean' ? PREFS.bgm : C.BGM_DEFAULT_ON), ducked: false, track: null };
let resultActive = false; // 結果画面ではBGMを自動オフ
function bgmInit() { bgm.audio.volume = (C.BGM_VOLUME != null ? C.BGM_VOLUME : 0.16); }
function bgmPlay(trackKey) {
  const src = (C.BGM || {})[trackKey]; if (!src) return;
  if (bgm.track !== trackKey) { bgm.track = trackKey; bgm.audio.src = src; }
  if (bgm.on && !bgm.ducked && !resultActive) bgm.audio.play().catch(() => {});
}
function bgmSet(on) { bgm.on = on; if (on && !bgm.ducked && !resultActive) bgm.audio.play().catch(() => {}); else bgm.audio.pause(); updateControls(); savePrefs(); }
function bgmDuck(d) { bgm.ducked = d; if (!bgm.on) return; if (d || resultActive) bgm.audio.pause(); else bgm.audio.play().catch(() => {}); }

/* ---------- SFX（仮：Web Audio合成。C.SFXにパスを入れれば差し替え） ---------- */
const SFX_NOTES = {
  tap: [{ f: 660, d: 0.06, v: 0.10, type: 'triangle' }],
  success: [{ f: 523, d: 0.12, v: 0.16 }, { f: 659, t: 0.10, d: 0.12, v: 0.16 }, { f: 784, t: 0.20, d: 0.18, v: 0.18 }],
  perfect: [{ f: 523, d: 0.10, v: 0.16 }, { f: 659, t: 0.09, d: 0.10, v: 0.16 }, { f: 784, t: 0.18, d: 0.10, v: 0.16 }, { f: 1047, t: 0.27, d: 0.22, v: 0.18 }],
  fail: [{ f: 392, d: 0.14, v: 0.15, type: 'sawtooth' }, { f: 294, t: 0.12, d: 0.20, v: 0.13, type: 'sawtooth' }],
};
const sfx = {
  ctx: null, files: {},
  init() { Object.entries(C.SFX || {}).forEach(([k, v]) => { if (v) { const a = new Audio(v); a.preload = 'auto'; this.files[k] = a; } }); },
  play(name) {
    if (!C.SFX_ENABLED) return;
    if (this.files[name]) { const a = this.files[name].cloneNode(); a.volume = 0.6; a.play().catch(() => {}); return; }
    try {
      const ctx = this.ctx || (this.ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      (SFX_NOTES[name] || SFX_NOTES.tap).forEach(n => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = n.type || 'sine'; o.frequency.value = n.f;
        const t0 = now + (n.t || 0), dur = n.d || 0.08;
        g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(n.v || 0.15, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
      });
    } catch (e) {}
  }
};

/* ---------- Header / settings ---------- */
let SUB = (typeof PREFS.sub === 'boolean' ? PREFS.sub : false);  // 万次郎語字幕モード
const current = { screen: 'title', area: null, scene: null, vid: null, role: null };
function updateControls() {
  $('#set-bgm').classList.toggle('on', bgm.on);
  $('#set-cc').classList.toggle('on', SUB);
}
function setSubtitle(on) { SUB = on; document.body.classList.toggle('subtitle-on', SUB); updateControls(); savePrefs(); }
function updateBack() { $('#btn-back').style.visibility = current.screen === 'title' ? 'hidden' : 'visible'; }
function navBack() {
  bgmDuck(false);
  if (current.screen === 'select') go(renderTitle);
  else if (current.screen === 'drill') go(current.drillBack || renderTitle);
  else if (current.screen === 'scene' || current.screen === 'result') go(() => renderSelect(current.area));
}

/* ---------- screen transition (hardened) ---------- */
function go(fn) {
  stopExample(); stopWaveAudio();
  APP.style.opacity = 0;
  setTimeout(() => {
    try { fn(); }
    catch (e) { console.error(e); APP.innerHTML = `<p style="padding:30px;text-align:center;color:var(--sub)">表示中に問題が発生しました。上の戻るボタンでお戻りください。</p>`; }
    updateBack(); APP.scrollTop = 0; APP.style.opacity = 1;
  }, 120);
}

/* ============================================================ SCREENS ============================================================ */
function renderTitle() {
  current.screen = 'title'; resultActive = false;
  bgmPlay('title');
  APP.innerHTML = '';
  const wrap = el(`<section class="screen title-screen"></section>`);
  wrap.appendChild(el(`<div class="brand"><img class="choicy-hero" src="${C.CHOICY_IMG}" alt="Choicy"><h1>SpeakUp! <span class="title-accent">Choicy</span></h1><p class="tagline">Lend your voice. Save the day.</p></div>`));
  const grid = el(`<div class="area-grid"></div>`);
  D.areas.forEach(a => {
    const ss = scenesOf(a); const avg = ss.reduce((s, x) => s + Number(x.difficulty_star), 0) / ss.length;
    const card = el(`<button class="area-card">
        <div class="area-thumb" style="background-image:url('${IMG(a.map_image)}')"></div>
        <div class="area-body"><div class="area-name">${esc(a.area_name_en)}<span class="sub-mj">${esc(a.area_name_ja)}</span></div>
        <div class="area-meta">${stars(avg)}<span class="count">${ss.length} spots</span></div></div></button>`);
    card.onclick = () => go(() => renderSelect(a));
    grid.appendChild(card);
  });
  // Coming soon (locked, no shadow, image shows when provided)
  const locked = (en, ja, img) => el(`<div class="area-card locked">
      <div class="area-thumb" style="background-image:url('${IMG(img)}')"></div><span class="soon-badge">COMING SOON</span>
      <div class="area-body"><div class="area-name">${en}<span class="sub-mj">${ja}</span></div>
      <div class="area-meta"><span class="count">Coming soon</span></div></div></div>`);
  grid.appendChild(locked('Los Angeles', 'ロサンゼルス', 'la_map.png'));
  grid.appendChild(locked('New York', 'ニューヨーク', 'ny_map.png'));
  wrap.appendChild(grid);

  // 発音特化ドリル（§3-4）— シーンを通さず、苦手な軸だけを直接練習
  const axesWithDrills = Object.keys(window.DRILLS || {}).filter(hasDrill);
  if (axesWithDrills.length) {
    const sec = el(`<div class="drill-section"><h2 class="ds-title"><span class="material-symbols-rounded">graphic_eq</span>発音ドリル<span class="ds-sub">苦手な音だけを集中練習</span></h2><div class="ds-grid"></div></div>`);
    const dg = $('.ds-grid', sec);
    axesWithDrills.forEach(id => {
      const ax = axisInfo(id), set = drillsFor(id);
      const b = el(`<button class="ds-card">${axisChip(id)}<span class="ds-count">${set.phrases.length} フレーズ</span></button>`);
      b.onclick = () => go(() => renderDrill(id, renderTitle));
      dg.appendChild(b);
    });
    wrap.appendChild(sec);
  }
  APP.appendChild(wrap);
}

function renderSelect(area) {
  current.screen = 'select'; current.area = area; resultActive = false;
  bgmPlay('title');
  APP.innerHTML = '';
  const wrap = el(`<section class="screen select-screen"></section>`);
  wrap.appendChild(el(`<p class="select-hint"><span class="material-symbols-rounded">open_with</span>Drag or swipe to move the map</p>`));
  const frame = el(`<div class="map-frame">
    <div class="map-title"><span class="material-symbols-rounded">map</span>${esc(area.area_name_en)}<span class="sub-mj">${esc(area.area_name_ja)}</span></div>
    <div class="map-viewport"><div class="map-inner"><img class="map-img" src="${IMG(area.map_image)}" alt=""></div></div></div>`);
  const vp = $('.map-viewport', frame);
  const inner = $('.map-inner', frame);
  scenesOf(area).forEach(s => {
    const pin = el(`<button class="pin" style="left:${s.pin_x}%;top:${s.pin_y}%">
        <span class="pin-dot" style="background-image:url('${IMG(s.scene_id + '_V1.png')}')"></span><span class="pin-label">${esc(s.title_en)}</span>${stars(Number(s.difficulty_star))}</button>`);
    pin.onclick = () => openDetail(area, s);
    inner.appendChild(pin);
  });
  wrap.appendChild(frame);
  APP.appendChild(wrap);

  const center = () => { vp.scrollLeft = (vp.scrollWidth - vp.clientWidth) / 2; vp.scrollTop = (vp.scrollHeight - vp.clientHeight) / 2; };
  requestAnimationFrame(center);
  $('.map-img', vp).addEventListener('load', center);

  // drag-to-pan (mouse only; touch uses native scroll)
  let pan = null;
  vp.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' || e.target.closest('.pin')) return; pan = { x: e.clientX, y: e.clientY, sl: vp.scrollLeft, st: vp.scrollTop }; vp.classList.add('grabbing'); });
  window.addEventListener('pointermove', e => { if (!pan) return; vp.scrollLeft = pan.sl - (e.clientX - pan.x); vp.scrollTop = pan.st - (e.clientY - pan.y); });
  window.addEventListener('pointerup', () => { if (pan) { pan = null; vp.classList.remove('grabbing'); } });
}

function openDetail(area, s) {
  let role = 'questioner';
  const v1 = s.scene_id + '_V1.png';
  const sheet = el(`<div class="overlay"><div class="detail-card">
      <div class="detail-hero" style="background-image:url('${IMG(v1)}')"></div>
      <button class="close"><span class="material-symbols-rounded">close</span></button>
      <div class="detail-body">
        <div class="detail-head"><div><h2>${esc(s.title_en)}</h2><p class="sub-mj">${esc(s.title_ja)}</p></div>${stars(Number(s.difficulty_star))}</div>
        <p class="summary en">${esc(s.summary_en)}</p>
        <p class="summary-mj sub-mj">${esc(s.summary_mj)}</p>
        <div class="role-pick"><p class="role-label">Choose your role</p>
          <div class="role-btns">
            <button class="role-btn on" data-role="questioner"><span class="material-symbols-rounded">arrow_back</span>Asker</button>
            <button class="role-btn" data-role="answerer">Answerer<span class="material-symbols-rounded">arrow_forward</span></button>
          </div></div>
        <button class="start-btn"><span class="material-symbols-rounded">play_arrow</span>START</button>
      </div></div></div>`);
  sheet.querySelectorAll('.role-btn').forEach(b => b.onclick = () => { role = b.dataset.role; sheet.querySelectorAll('.role-btn').forEach(x => x.classList.toggle('on', x === b)); });
  $('.close', sheet).onclick = () => sheet.remove();
  sheet.onclick = e => { if (e.target === sheet) sheet.remove(); };
  $('.start-btn', sheet).onclick = () => { sheet.remove(); const vs = variantsOf(s.scene_id); const vid = vs[Math.floor(Math.random() * vs.length)].variant_id; go(() => renderScene(area, s, vid, role)); };
  APP.appendChild(sheet);
}

function renderScene(area, s, vid, role, skipExample) {
  current.screen = 'scene'; current.area = area; current.scene = s; current.vid = vid; current.role = role; resultActive = false;
  bgmPlay('scene');
  const pair = phrasesOfVariant(s.scene_id, vid);
  const mine = pair.find(p => p.role === role);
  const other = pair.find(p => p.role !== role);
  const state = { hint: 0, recording: false, rec: null, chunks: [], stream: null };

  APP.innerHTML = '';
  const wrap = el(`<section class="screen scene-screen">
    <div class="stage" style="background-image:url('${IMG(s.scene_id + '_V' + vid + '.png')}')">
      <div class="balloon left ${role === 'questioner' ? 'mine' : ''}" id="bln-q"></div>
      <div class="balloon right ${role === 'answerer' ? 'mine' : ''}" id="bln-a"></div>
      <div class="intro" id="intro">Listen to the example first <span class="material-symbols-rounded">volume_up</span></div>
    </div>
    <div class="controls">
      <button class="ctl" id="btn-repeat" disabled><span class="material-symbols-rounded">replay</span><label>Repeat</label></button>
      <button class="ctl rec" id="btn-rec" disabled><span class="material-symbols-rounded">mic</span><label>Rec</label></button>
      <button class="ctl" id="btn-hint" disabled><span class="material-symbols-rounded">lightbulb</span><label>Hint</label></button>
    </div></section>`);

  const fill = () => {
    const map = { questioner: $('#bln-q', wrap), answerer: $('#bln-a', wrap) };
    pair.forEach(p => {
      const node = map[p.role];
      if (p === mine) {
        let inner = `<span class="ph-empty">…</span>`;
        if (state.hint >= 1) inner = `<span class="ph-manjiro">${esc(p.manjiro_ja)}</span>`;
        if (state.hint === 2) inner += `<span class="ph-gap">${gapFill(p.text_en, C.BLANKS_BY_STAR[String(s.difficulty_star)] || 1)}</span>`;
        else if (state.hint >= 3) inner += `<span class="ph-gap">${esc(p.text_en)}</span>`;
        node.innerHTML = inner;
      } else node.innerHTML = `<span class="ph-text">${esc(p.text_en)}</span>`;
    });
  };
  fill();
  APP.appendChild(wrap);

  const enable = on => ['btn-repeat', 'btn-rec', 'btn-hint'].forEach(id => $('#' + id, wrap).disabled = !on);
  $('#btn-hint', wrap).onclick = () => { state.hint = (state.hint + 1) % 4; fill(); $('#btn-hint', wrap).classList.toggle('maxed', state.hint === 3); };
  $('#btn-repeat', wrap).onclick = () => playExample([mine], wrap, null, false);
  $('#btn-rec', wrap).onclick = () => state.recording ? stopRecording(state, wrap, area, s, vid, role, mine, other) : startRecording(state, wrap, area, s, vid, role, mine, other);

  if (skipExample) { $('#intro', wrap).classList.add('hide'); enable(true); }
  else setTimeout(() => playExample(pair, wrap, () => { $('#intro', wrap).classList.add('hide'); enable(true); }, true), 400);
}

let _exAudio = null, _exStopped = false;
let _waveAudio = null, _waveBtn = null, _beatTimers = [], _rafId = 0;
function clearBeatTimers() { _beatTimers.forEach(t => clearTimeout(t)); _beatTimers = []; if (_rafId) { cancelAnimationFrame(_rafId); _rafId = 0; } document.querySelectorAll('.beat.pop').forEach(b => b.classList.remove('pop')); }
function stopWaveAudio() {
  if (_waveAudio) { try { _waveAudio.onended = _waveAudio.onpause = _waveAudio.onerror = _waveAudio.onplaying = null; _waveAudio.pause(); } catch (e) {} }
  if (_waveBtn) { try { $('.material-symbols-rounded', _waveBtn).textContent = 'play_arrow'; } catch (e) {} }
  _waveAudio = null; _waveBtn = null; clearBeatTimers(); bgmDuck(false);
}
function stopExample() {
  _exStopped = true;
  if (_exAudio) { try { _exAudio.onended = null; _exAudio.onerror = null; _exAudio.pause(); } catch (e) {} _exAudio = null; }
  bgmDuck(false);
}
function playExample(list, wrap, done, showIntro) {
  if (_exAudio) { try { _exAudio.onended = null; _exAudio.onerror = null; _exAudio.pause(); } catch (e) {} _exAudio = null; }
  _exStopped = false;
  bgmDuck(true);
  if (showIntro) $('#intro', wrap).classList.remove('hide');
  const seq = [...list].sort((a, b) => a.turn_order - b.turn_order);
  let i = 0;
  const next = () => {
    if (_exStopped) return;
    if (i >= seq.length) { bgmDuck(false); if (showIntro) $('#intro', wrap).classList.add('hide'); done && done(); return; }
    const p = seq[i++]; const side = p.role === 'questioner' ? 'left' : 'right';
    wrap.querySelectorAll('.balloon').forEach(b => b.classList.remove('talking'));
    const sideEl = wrap.querySelector('.balloon.' + side); if (sideEl) sideEl.classList.add('talking');
    const a = new Audio(AUD(p.audio_file)); _exAudio = a; let done2 = false;
    const adv = () => { if (done2) return; done2 = true; if (sideEl) sideEl.classList.remove('talking'); next(); };
    a.onended = adv; a.onerror = () => setTimeout(adv, 600);
    a.play().catch(() => setTimeout(adv, 600));
  };
  next();
}

/* ---- recording ---- */
async function startRecording(state, wrap, area, s, vid, role, mine, other) {
  const btn = $('#btn-rec', wrap); bgmDuck(true); state.recStart = Date.now();
  if (C.DEMO_MODE) { state.recording = true; btn.classList.add('live'); $('label', btn).textContent = 'Stop'; return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    state.stream = stream; state.chunks = [];
    let mime = '';
    const cand = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/aac'];
    if (window.MediaRecorder && MediaRecorder.isTypeSupported) { for (const c of cand) { if (MediaRecorder.isTypeSupported(c)) { mime = c; break; } } }
    state.rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    state.mime = state.rec.mimeType || mime || 'audio/mp4';
    state.rec.ondataavailable = e => e.data.size && state.chunks.push(e.data);
    state.rec.start();
    state.recording = true; btn.classList.add('live'); $('label', btn).textContent = 'Stop';
  } catch (err) { bgmDuck(false); toast('マイクを使えません。ブラウザの許可（または localhost / https）をご確認ください。'); }
}
function stopMic(state) { try { state.rec && state.rec.state !== 'inactive' && state.rec.stop(); state.stream && state.stream.getTracks().forEach(t => t.stop()); } catch (e) {} }

async function stopRecording(state, wrap, area, s, vid, role, mine, other) {
  const btn = $('#btn-rec', wrap);
  state.recording = false; btn.classList.remove('live'); $('label', btn).textContent = 'Rec';
  showScoring(wrap);
  let result, userBlob = null;
  const held = state.recStart ? (Date.now() - state.recStart) / 1000 : undefined;
  try {
    if (!C.DEMO_MODE) {
      userBlob = await new Promise(res => { state.rec.onstop = () => res(new Blob(state.chunks, { type: state.rec.mimeType || state.mime || 'audio/mp4' })); state.rec.stop(); });
      stopMic(state);
    } else {
      await new Promise(r => setTimeout(r, 700));
    }
    result = await scoreUtterance(mine, userBlob, held);
  } catch (e) { console.error(e); result = await scoreUtterance(mine, null, held); }
  bgmDuck(false);
  go(() => renderResult(area, s, vid, role, mine, other, result, userBlob));
}

/* ---- scoring ----
   方針: 各単語に great/close/practice/missing のラベルを付け、
   completeness=言えた割合、accuracy=言えた単語の発音平均、overall=accuracy×completeness/100
   として算出する。表示の色とスコアが必ず一致し、未発話は missing として反映される。 */
// 苦手な音(IPA記号)→具体的な調音アドバイス。§3-3: 発音崩壊軸タクソノミー(window.AXES)から生成。
// 各 tip は所属する axis(軸ID) を持ち、trap.axis と同じ台帳に解決される（接着スキーマ）。
const AXES = window.AXES || {};
const IPA2AXIS = {};                 // IPA記号 → 軸ID
const ARTIC_TIPS = {};               // IPA記号 → { ipa, slug, en, mj, axis }（旧ARTIC_TIPS互換＋axis）
Object.keys(AXES).forEach(axisId => {
  const mem = AXES[axisId].members || {};
  Object.keys(mem).forEach(ipa => {
    IPA2AXIS[ipa] = axisId;
    ARTIC_TIPS[ipa] = { ipa, slug: mem[ipa].slug, en: mem[ipa].en, mj: mem[ipa].mj, axis: axisId };
  });
});
const axisInfo = id => AXES[id] || null;
// 軸チップ（軸ラベル＋崩壊タイプ）。tips と trap カードで共通利用。
function axisChip(id) {
  const ax = axisInfo(id); if (!ax) return '';
  const t = ax.type === 'し分ける' ? 'distinguish' : 'just-fix';
  return `<span class="ax-chip ${t}" title="${esc(ax.channel || '')}">${esc(ax.label_ja)}<i>${esc(ax.type)}</i></span>`;
}
function tipsFromWords(words) {
  const seen = [], tips = [];
  words.forEach(w => {
    if ((w.level === 'close' || w.level === 'practice') && w.weak && ARTIC_TIPS[w.weak] && !seen.includes(w.weak)) {
      seen.push(w.weak); if (tips.length < 3) tips.push(ARTIC_TIPS[w.weak]);
    }
  });
  return tips;
}
const LVL_W = { great: 100, close: 70, practice: 40 };
function combineOverall(accuracy, rhythm) { return Math.round(0.6 * accuracy + 0.4 * rhythm); }
function rhythmScoreFromAnalysis(beats, an) {
  const prom = flatBeats(beats).filter(w => w[1] >= 1).length || 1;
  const coverage = Math.max(0, Math.min(1, an.peaks.length / prom));
  const dyn = an.peakLevel / Math.max(an.med, 1e-6);
  const dynN = Math.max(0, Math.min(1, (dyn - 1.5) / 3));
  return Math.round(Math.max(0, Math.min(100, 100 * (0.55 * coverage + 0.45 * dynN))));
}
function finalizeScore({ words, said_text, comment, comment_mj, rhythm, traps, trapHits }) {
  words = (words || []).map(w => ({
    word: w.word,
    level: ['great', 'close', 'practice', 'missing'].includes(w.level) ? w.level : 'great',
    weak: w.weak || ''
  }));
  // 地雷: 別の単語に聞こえたと判定された語は、最低でも practice に揃える（色とスコアを演出と一致させる）
  const hitSet = new Set((trapHits || []).map(x => String(x).toLowerCase()));
  if (hitSet.size) words.forEach(w => {
    const clean = (w.word || '').toLowerCase().replace(/[^a-z'-]/g, '');
    if (hitSet.has(clean) && w.level !== 'missing') w.level = 'practice';
  });
  const trapResults = (traps || []).map(t => ({ ...t, hit: hitSet.has(t.word) }));
  const total = words.length || 1;
  const said = words.filter(w => w.level !== 'missing');
  const accuracy = said.length ? Math.round(said.reduce((s, w) => s + LVL_W[w.level], 0) / said.length) : 0;
  const completeness = Math.round(100 * said.length / total);
  const rhythmVal = (rhythm != null) ? rhythm : Math.max(35, accuracy - 10);   // 実音解析が無い場合の暫定値
  const overall = combineOverall(accuracy, rhythmVal);
  const missing = total - said.length;
  if (!comment) {
    if (missing > 0) {
      comment = "You stopped partway — try to say the whole phrase in one go. The part you did say sounded good!";
      comment_mj = "途中で止まったみたい 最後まで一息で言ってみよう 言えた所はいい感じ！";
    } else if (overall >= C.SUCCESS_THRESHOLD) {
      comment = "Nicely done — that came through clearly! Try stressing the key words a bit more to sound even more natural.";
      comment_mj = "いいね ちゃんと伝わった！大事な単語を少し強く言うと もっと自然。";
    } else {
      comment = "So close! Instead of one word at a time, group the words into chunks and say each chunk in one breath.";
      comment_mj = "おしい！単語ひとつずつより チャンクごとにまとめて 一息で言ってみよう。";
    }
  }
  return { accuracy, rhythm: rhythmVal, completeness, overall, words, said_text: said_text || said.map(w => w.word).join(' '), comment, comment_mj, tips: tipsFromWords(words), traps: trapResults };
}

/* ---- scoring backends（§3-5: スコアラ抽象化）----
   各バックエンドは「音声(blob)+target(mine)+traps」を受け取り、統一形の生判定
   { words, said_text, comment, comment_mj, trap_hits, rhythm? } を返す。
   finalizeScore / リズム再計算 / 表示は scoreUtterance() が共通で行う。
   C.SCORER で 'gemini'(直) / 'api'(サーバ経由・本番) / 'demo' を切替（未設定なら gemini）。 */
function blobToB64(blob) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
}

// デモ: 音声を解析できないので Rec 長さで擬似採点。キー/マイク無しで全画面を試せる。
function demoJudge(mine, blob, opts) {
  const heldSec = opts && opts.heldSec;
  const toks = mine.text_en.split(/\s+/);
  const total = toks.length;
  let cut;
  if (typeof heldSec === 'number') {
    const expected = total * 0.42 + 0.5;
    const frac = Math.max(0, Math.min(1, heldSec / expected));
    cut = Math.round(total * frac);
  } else {
    cut = total;
    if (total >= 4 && Math.random() < 0.35) cut = Math.max(2, Math.floor(total * (0.4 + Math.random() * 0.45)));
  }
  const words = toks.map((w, idx) => {
    if (idx >= cut) return { word: w, level: 'missing', weak: '' };
    const clean = w.replace(/[^A-Za-z'-]/g, ''); let level = 'great';
    if (clean && !STOP.has(clean.toLowerCase()) && Math.random() < 0.25) level = Math.random() < 0.5 ? 'close' : 'practice';
    const ipa = ipaFor(w);
    let weak = '';
    if (level !== 'great' && ipa) { const tricky = [...ipa].find(ch => ARTIC_TIPS[ch]); weak = tricky || ipa[Math.max(0, Math.floor(ipa.length / 2))]; }
    return { word: w, level, weak };
  });
  const said_text = words.filter(w => w.level !== 'missing').map(w => w.word).join(' ');
  const saidCount = words.filter(w => w.level !== 'missing').length;
  const demoRhythm = Math.round(Math.max(35, Math.min(92, 58 + Math.random() * 28 - (words.length - saidCount) * 6)));
  const traps = (opts && opts.traps) || trapsInText(mine.text_en);
  const trap_hits = traps.filter(t => {
    const w = words.find(x => x.word.toLowerCase().replace(/[^a-z'-]/g, '') === t.word);
    return w && (w.level === 'practice' || (w.level === 'close' && Math.random() < 0.5));
  }).map(t => t.word);
  return { words, said_text, trap_hits, rhythm: demoRhythm };
}

// Gemini 直叩き（開発用）。キーがクライアントに出るため、本番は 'api' を使うこと。
async function geminiJudge(mine, blob, opts) {
  const J = window.JUDGE; if (!J) throw new Error('judge.js (window.JUDGE) が読み込まれていません');
  const traps = (opts && opts.traps) || trapsInText(mine.text_en);
  const wordList = mine.text_en.split(/\s+/);
  const b64 = await blobToB64(blob);
  const prompt = J.buildJudgePrompt(mine.text_en, mine.chunks_en, wordList, traps);
  const body = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: blob.type || 'audio/webm', data: b64 } }] }], generationConfig: { temperature: 0.2, responseMimeType: 'application/json' } };
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 30000);
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${C.MODEL}:generateContent?key=${C.GEMINI_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
  clearTimeout(to);
  if (!r.ok) throw new Error('Gemini HTTP ' + r.status);
  const j = await r.json();
  const txt = (j.candidates?.[0]?.content?.parts || []).map(p => p.text).join('') || '{}';
  return J.normalizeJudge(J.parseJsonLoose(txt), wordList);
}

// サーバAPI経由（本番）。クライアントにキーを置かず、音声+target+traps を送って統一形を受け取る。
async function apiJudge(mine, blob, opts) {
  const J = window.JUDGE;
  const url = C.SCORER_API_URL;
  if (!url) throw new Error('CONFIG.SCORER_API_URL が未設定です');
  const traps = (opts && opts.traps) || trapsInText(mine.text_en);
  const wordList = mine.text_en.split(/\s+/);
  const b64 = await blobToB64(blob);
  const body = {
    text_en: mine.text_en, chunks_en: mine.chunks_en,
    audio_b64: b64, audio_mime: blob.type || 'audio/webm',
    traps: traps.map(t => ({ word: t.word, error: t.error, target_ipa: t.target_ipa, error_ipa: t.error_ipa }))
  };
  const ctrl = new AbortController(); const to = setTimeout(() => ctrl.abort(), 30000);
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal });
  clearTimeout(to);
  if (!r.ok) throw new Error('Scorer API HTTP ' + r.status);
  const j = await r.json();
  return J ? J.normalizeJudge(j, wordList) : { words: j.words || [], said_text: j.said_text || '', comment: j.comment || '', comment_mj: j.comment_mj || '', trap_hits: j.trap_hits || [] };
}

// バックエンド登録（追加は1行）。国内ASRはここに 'jp_asr' などを足して C.SCORER で切替できる。
const SCORERS = { gemini: geminiJudge, api: apiJudge, demo: demoJudge };
const activeScorer = () => C.DEMO_MODE ? 'demo' : (C.SCORER || 'gemini');

// 共通の採点エントリ。バックエンド呼び出し→統一形→finalizeScore→実音でリズム再計算まで一括。
async function scoreUtterance(mine, blob, heldSec) {
  const traps = trapsInText(mine.text_en);
  const name = activeScorer();
  let raw;
  try {
    raw = await (SCORERS[name] || SCORERS.gemini)(mine, blob, { traps, heldSec });
  } catch (e) {
    console.error('scorer "' + name + '" failed', e);
    if (name !== 'demo') { toast('採点に失敗したのでデモ採点を表示します: ' + e.message); if (typeof showDemoBadge === 'function') showDemoBadge('DEMO (fallback)'); }
    raw = demoJudge(mine, blob, { traps, heldSec });
  }
  const result = finalizeScore({ words: raw.words, said_text: raw.said_text, comment: raw.comment, comment_mj: raw.comment_mj, traps, trapHits: raw.trap_hits, rhythm: raw.rhythm });
  if (blob) {
    try {
      const an = await getAnalysis(URL.createObjectURL(blob));
      result.rhythm = rhythmScoreFromAnalysis(beatsFor(mine.text_en, mine.chunks_en), an);
      result.overall = combineOverall(result.accuracy, result.rhythm);
    } catch (e) { console.error('rhythm score failed', e); }
  }
  return result;
}

/* ---- result ---- */
function renderResult(area, s, vid, role, mine, other, res, userBlob) {
  current.screen = 'result'; current.area = area; resultActive = true;
  const ok = res.overall >= C.SUCCESS_THRESHOLD, perfect = res.overall >= C.PERFECT_THRESHOLD;
  try { bgm.audio.pause(); } catch (e) {}
  sfx.play(perfect ? 'perfect' : ok ? 'success' : 'fail');
  APP.innerHTML = '';
  const wrap = el(`<section class="screen result-screen"></section>`);

  const wordsHTML = (res.words || []).map(w => {
    let sub = '';
    if (w.level === 'missing') sub = `<span class="w-miss">未発話</span>`;
    else if (w.level !== 'great') {
      const ipa = ipaFor(w.word);
      if (ipa) { let body = esc(ipa); if (w.weak) body = body.replace(esc(w.weak), `<b>${esc(w.weak)}</b>`); sub = `<span class="w-ipa">/${body}/</span>`; }
    }
    return `<span class="w ${w.level}"><span class="w-en">${esc(w.word)}</span>${sub}</span>`;
  }).join('');
  const hasMissing = (res.words || []).some(w => w.level === 'missing');
  const band = perfect ? 'great' : ok ? 'close' : 'practice';

  wrap.appendChild(el(`<div class="result-head ${ok ? 'ok' : 'no'}"><img class="choicy-orb ${perfect ? 'cheer' : ''}" src="${C.CHOICY_IMG}" alt="Choicy"><h2>${ok ? (perfect ? 'Perfect! You nailed it!' : 'You helped them!') : 'Almost — try again!'}</h2></div>`));
  wrap.appendChild(el(`<p class="comment">${esc(res.comment || '')}<span class="comment-mj">${esc(res.comment_mj || '')}</span></p>`));
  wrap.appendChild(el(`<div class="score-row">
    <div class="ring-block"><div class="ring big" style="--p:${res.overall}"><div class="ring-in"><b>${res.overall}</b><small>SCORE</small></div></div><span class="ring-cap">Overall</span></div>
    <div class="ring-block"><div class="ring sm" style="--p:${res.accuracy};--c:#FFB59E;--ic:#E0744C"><div class="ring-in"><span class="material-symbols-rounded">record_voice_over</span></div></div><span class="ring-cap">Accuracy</span></div>
    <div class="ring-block"><div class="ring sm" style="--p:${res.rhythm != null ? res.rhythm : 0};--c:#BBE3D4;--ic:#2E9C82"><div class="ring-in"><span class="material-symbols-rounded">graphic_eq</span></div></div><span class="ring-cap">Rhythm</span></div>
  </div>`));
  wrap.appendChild(el(`<div class="phrase-card band-${band}"><div class="words">${wordsHTML}</div>
    <p class="said">You said: <span>${esc(res.said_text || '—')}</span></p>
    <div class="legend"><span class="lg great">Great</span><span class="lg close">Close</span><span class="lg practice">Practice</span>${hasMissing ? '<span class="lg missing">未発話</span>' : ''}</div></div>`));

  // 地雷: 言い間違いで別の(きわどい)単語に化ける注意ワードの結果
  if (res.traps && res.traps.length) {
    const lvlOf = key => { const m = (res.words || []).find(x => x.word.toLowerCase().replace(/[^a-z'-]/g, '') === key); return m ? m.level : null; };
    res.traps.forEach(t => {
      const lv = lvlOf(t.word);
      let cardEl = null;
      if (t.hit) {
        cardEl = el(`<div class="trap-card hit">
          <div class="trap-head"><span class="material-symbols-rounded">warning</span>あぶない！ 別の単語に聞こえたかも${axisChip(t.axis)}</div>
          <p class="trap-said">「${esc(t.error)}」<span class="trap-ja">${esc(t.error_ja)}</span> に聞こえたかも…</p>
          <p class="trap-mean">言いたかったのは <b>${esc(t.word)}</b> <span class="trap-ipa">/${esc(t.target_ipa)}/</span></p>
          ${t.fix_mj ? `<p class="trap-fix">${esc(t.fix_mj)}</p>` : ''}</div>`);
      } else if (lv && lv !== 'missing') {
        cardEl = el(`<div class="trap-card safe">
          <span class="material-symbols-rounded">verified</span>
          <span><b>${esc(t.word)}</b> セーフ！ 崩すと「${esc(t.error)}」<span class="trap-ja">${esc(t.error_ja)}</span> になる要注意ワード。</span>${axisChip(t.axis)}</div>`);
      }
      if (!cardEl) return;
      if (hasDrill(t.axis)) {
        const b = el(`<button class="practice-btn" style="margin-top:10px">この音を練習<span class="material-symbols-rounded">arrow_forward</span></button>`);
        b.onclick = () => go(() => renderDrill(t.axis, () => renderSelect(area)));
        cardEl.appendChild(b);
      }
      wrap.appendChild(cardEl);
    });
  }

  // pronunciation tips（苦手な音の具体的な口・舌の使い方＋図解サムネ）
  if (res.tips && res.tips.length) {
    const tipsHTML = res.tips.map(t => `<div class="tip">
        <div class="tip-img"><img src="${C.IMAGES_DIR}/phonemes/${t.slug}.svg" alt="${esc(t.ipa || '')}" loading="lazy"><span class="tip-zoom material-symbols-rounded">${(D.phoneme_videos && D.phoneme_videos[t.slug]) ? 'play_circle' : 'zoom_in'}</span></div>
        <div class="tip-text">${t.ipa ? `<span class="tip-ipa">/${esc(t.ipa)}/</span>` : ''}${axisChip(t.axis)}<span class="tip-en">${esc(t.en)}</span><span class="tip-mj sub-mj">${esc(t.mj)}</span>${hasDrill(t.axis) ? `<button class="practice-btn" data-axis="${esc(t.axis)}">この音を練習<span class="material-symbols-rounded">arrow_forward</span></button>` : ''}</div>
      </div>`).join('');
    const tipsCard = el(`<div class="tips-card"><h3>Pronunciation tips</h3>${tipsHTML}</div>`);
    wrap.appendChild(tipsCard);
    const boxes = [...tipsCard.querySelectorAll('.tip-img')];
    res.tips.forEach((t, i) => {
      const box = boxes[i]; if (!box) return; const img = $('img', box);
      img.onerror = () => { box.style.display = 'none'; };           // 画像が無ければサムネ枠ごと隠す
      box.onclick = () => openLightbox(t.slug, t.ipa, t.en, t.mj);
    });
    tipsCard.querySelectorAll('.practice-btn').forEach(b => { b.onclick = () => go(() => renderDrill(b.dataset.axis, () => renderSelect(area))); });
  }

  // rhythm (chunk beats) — お手本/自分を上下2段、各音声の実エネルギーで円サイズ
  const beats = beatsFor(mine.text_en, mine.chunks_en);
  const stripHTML = () => beats.map(ch => `<div class="chunk">${ch.map(w => {
    const cls = w[1] === 2 ? 'n' : w[1] === 1 ? 's' : 'w';
    return `<div class="beat ${cls}"><span class="dot"></span><span class="lab en">${esc(w[0])}</span></div>`;
  }).join('')}</div>`).join('');
  const meSrc = userBlob ? URL.createObjectURL(userBlob) : null, exSrc = AUD(mine.audio_file);
  const rcard = el(`<div class="rhythm-card"><h3>Rhythm</h3>
    <div class="r-legend"><span><i class="d w"></i>weak</span><span><i class="d s"></i>strong</span><span><i class="d n"></i>nucleus</span></div>
    <div class="r-track">
      <div class="r-head"><button class="r-play ex" aria-label="Play example"><span class="material-symbols-rounded">play_arrow</span></button><span class="r-name">Example</span></div>
      <div class="rhythm-stage"><div class="strip" data-strip="ex">${stripHTML()}</div></div>
    </div>
    <div class="r-track">
      <div class="r-head"><button class="r-play me" aria-label="Play your voice"><span class="material-symbols-rounded">play_arrow</span></button><span class="r-name">You</span></div>
      <div class="rhythm-stage"><div class="strip" data-strip="me">${stripHTML()}</div></div>
    </div>
    <p class="r-verdict" hidden></p></div>`);
  wrap.appendChild(rcard);
  const exStrip = $('.strip[data-strip="ex"]', rcard), meStrip = $('.strip[data-strip="me"]', rcard);
  wireRhythmPlay($('.r-play.ex', rcard), exSrc, [...exStrip.querySelectorAll('.beat')], beats, false, rcard);
  wireRhythmPlay($('.r-play.me', rcard), meSrc, [...meStrip.querySelectorAll('.beat')], beats, true, rcard);
  getAnalysis(exSrc).then(an => sizeDotsByEnergy(exStrip, beats, an)).catch(() => {});
  if (meSrc) getAnalysis(meSrc).then(an => { sizeDotsByEnergy(meStrip, beats, an); showVerdict(rcard, rhythmVerdict(beats, an)); }).catch(() => {});

  const qP = phraseOf(s.scene_id, vid, 'questioner'), aP = phraseOf(s.scene_id, vid, 'answerer');
  const expCard = (p, label) => `<div class="exp">
      <div class="exp-en"><span class="exp-label">${label}</span>${esc(p.text_en)}</div>
      <div style="font-size:14px;color:#525b69;margin-top:6px;line-height:1.55">${esc(p.explanation_en)}</div>
      <div class="exp-mj sub-mj">${esc(p.explanation_mj)}</div></div>`;
  wrap.appendChild(el(`<div class="explain"><h3>Phrases</h3>${expCard(qP, 'Asker')}${expCard(aP, 'Answerer')}</div>`));

  const actions = el(`<div class="result-actions"><button class="btn ghost" id="r-back"><span class="material-symbols-rounded">map</span>Scenes</button><button class="btn primary" id="r-retry"><span class="material-symbols-rounded">refresh</span>Try again</button></div>`);
  $('#r-back', actions).onclick = () => go(() => renderSelect(area));
  $('#r-retry', actions).onclick = () => go(() => renderScene(area, s, vid, role, true));
  wrap.appendChild(actions);
  APP.appendChild(wrap);
}

/* ---- rhythm (chunk beats) ----
   強弱: 0=弱(機能語) 1=強(内容語) 2=核(文中で一番の山=最後の内容語)
   再生に合わせて該当の拍をポップさせる（拍の中心時刻を音声長で正規化してスケジュール） */
function beatsFor(textEn, chunksEn) {
  const chunkStrs = (chunksEn || textEn || '').split('/').map(s => s.trim()).filter(Boolean);
  const chunks = chunkStrs.map(cs => cs.split(/\s+/).filter(Boolean).map(w => {
    const clean = w.toLowerCase().replace(/[^a-z'-]/g, '');
    return [w, (clean && !STOP.has(clean)) ? 1 : 0];
  }));
  let last = null;
  chunks.forEach((ch, ci) => ch.forEach((w, wi) => { if (w[1] === 1) last = [ci, wi]; }));
  if (last) chunks[last[0]][last[1]][1] = 2;
  else if (chunks.length) { const ci = chunks.length - 1, wi = chunks[ci].length - 1; if (chunks[ci][wi]) chunks[ci][wi][1] = 2; }
  return chunks;
}
const BEAT_DUR = { 0: 190, 1: 340, 2: 430 }, BEAT_GAP = 170;
function beatModel(beats) { // フォールバック用の推定モデル
  let t = 0; const centers = [];
  beats.forEach((ch, ci) => { if (ci) t += BEAT_GAP; ch.forEach(w => { const d = BEAT_DUR[w[1]]; centers.push(t + d / 2); t += d; }); });
  return { centers: centers.map(c => c / t), total: t };
}
function flatBeats(beats) { const f = []; beats.forEach(ch => ch.forEach(w => f.push(w))); return f; }
function popBeat(el) { if (!el) return; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 240); }
function setPlayIcon(btn, name) { const i = $('.material-symbols-rounded', btn); if (i) i.textContent = name; }

/* 録音/お手本のエネルギー（RMS）包絡を作り、強い拍＝ピークを検出する */
let _decAC = null;
function decAC() { return _decAC || (_decAC = new (window.AudioContext || window.webkitAudioContext)()); }
const _analysisCache = {}, _analysisDone = {};
function getAnalysis(src) { return _analysisCache[src] || (_analysisCache[src] = analyzeAudio(src).then(an => { _analysisDone[src] = an; return an; })); }
async function analyzeAudio(src) {
  const r = await fetch(src); if (!r.ok) throw new Error('audio fetch ' + r.status);
  const buf = await r.arrayBuffer();
  const audio = await decAC().decodeAudioData(buf.slice(0));
  const data = audio.getChannelData(0), sr = audio.sampleRate, dur = audio.duration;
  const FR = 0.01, hop = Math.max(1, Math.floor(sr * FR)), n = Math.floor(data.length / hop);
  const env = new Float32Array(n);
  for (let f = 0; f < n; f++) { let s = 0; const st = f * hop; for (let j = 0; j < hop && st + j < data.length; j++) { const v = data[st + j]; s += v * v; } env[f] = Math.sqrt(s / hop); }
  const sm = new Float32Array(n), K = 3;
  for (let f = 0; f < n; f++) { let s = 0, c = 0; for (let d = -K; d <= K; d++) { const i = f + d; if (i >= 0 && i < n) { s += env[i]; c++; } } sm[f] = s / c; }
  const peakLevel = Math.max(...sm, 1e-6);
  const sorted = [...sm].sort((a, b) => a - b), med = sorted[Math.floor(n / 2)] || 0;
  const thr = Math.max(peakLevel * 0.30, med * 1.8);
  const minGap = Math.round(0.14 / FR);
  const peaks = []; let lastF = -1e9;
  for (let f = 1; f < n - 1; f++) { if (sm[f] > thr && sm[f] >= sm[f - 1] && sm[f] > sm[f + 1] && (f - lastF) >= minGap) { peaks.push(f * FR); lastF = f; } }
  // 発話区間（先頭/末尾の無音を除く）— ピーク基準＋ノイズ床（中央値依存をやめ早切れを防ぐ）
  const noise = sorted[Math.floor(n * 0.15)] || 0;
  const thrV = Math.max(peakLevel * 0.08, noise + peakLevel * 0.05);
  let onF = 0; while (onF < n && sm[onF] < thrV) onF++;
  let offF = n - 1; while (offF > onF && sm[offF] < thrV) offF--;
  let onset = onF < n ? onF * FR : 0, offset = offF > onF ? (offF + 1) * FR : dur;
  if (!(offset > onset)) { onset = 0; offset = dur; }
  return { peaks, dur, peakLevel, med, frames: n, env: sm, frameDur: FR, onset, offset };
}
function energyAt(env, frameDur, t, win) {
  win = win || 0.06; let m = 0;
  const a = Math.max(0, Math.round((t - win) / frameDur)), b = Math.min(env.length - 1, Math.round((t + win) / frameDur));
  for (let i = a; i <= b; i++) if (env[i] > m) m = env[i];
  return m;
}
// 実エネルギーに合わせて各拍のドットの大きさを設定（色は役割のまま）
function sizeDotsByEnergy(stripEl, beats, an) {
  if (!stripEl || !an) return;
  const times = assignBeatTimes(beats, an);
  const dots = [...stripEl.querySelectorAll('.dot')];
  dots.forEach((dot, i) => {
    const e = energyAt(an.env, an.frameDur, times[i] || 0);
    const norm = Math.max(0, Math.min(1, e / (an.peakLevel || 1e-6)));
    const size = Math.round(8 + 24 * Math.pow(norm, 0.7));
    dot.style.width = dot.style.height = size + 'px';
  });
}
/* 各拍の時刻(秒)を作る：
   発話区間[onset,offset]にモデル比率で配置 → 強拍/核だけ近傍ピークへ微調整。
   これで全体が音声の実発話に重なり、前倒しや先頭無音のズレが起きにくい。 */
function assignBeatTimes(beats, an) {
  const flat = flatBeats(beats), N = flat.length;
  const dur = (an && an.dur) || 1;
  const onset = an && an.onset != null ? an.onset : 0;
  const offset = an && an.offset != null ? an.offset : dur;
  const span = Math.max(0.25, offset - onset);
  const centers = beatModel(beats).centers;                 // [0,1]
  const times = centers.map(c => onset + c * span);
  const peaks = (an && an.peaks) || [];
  if (peaks.length) {                                       // 強拍/核を小窓内の最寄りピークへ
    const win = Math.min(0.13, span * 0.12);
    for (let i = 0; i < N; i++) {
      if (flat[i][1] < 1) continue;
      let best = null, bd = win;
      for (const p of peaks) { const d = Math.abs(p - times[i]); if (d < bd) { bd = d; best = p; } }
      if (best != null) times[i] = best;
    }
  }
  for (let i = 1; i < N; i++) if (times[i] < times[i - 1]) times[i] = times[i - 1] + 0.02;
  return times.map(t => Math.max(0, Math.min(dur, t)));
}
function rhythmVerdict(beats, an) {
  const prom = flatBeats(beats).filter(w => w[1] >= 1).length || 1;
  const ratio = an.peaks.length / prom;
  const dynamic = an.peakLevel / Math.max(an.med, 1e-6);
  if (ratio >= 0.6 && dynamic >= 3) return { ok: true, en: "Nice — your voice has a clear strong/weak wave!", mj: "いいね 強弱の波が出ています！" };
  return { ok: false, en: "Try a bigger wave: hit the strong words harder, say weak words quick and soft.", mj: "もっと波を：内容語を強く、機能語は弱く速く。" };
}
function showVerdict(rcard, v) {
  const el2 = $('.r-verdict', rcard); if (!el2) return;
  el2.hidden = false; el2.className = 'r-verdict ' + (v.ok ? 'good' : 'work');
  const icon = v.ok ? 'check_circle' : 'graphic_eq';
  el2.innerHTML = `<span class="material-symbols-rounded rv-icon">${icon}</span><span class="rv-text">${esc(v.en)}<span class="rv-mj sub-mj">${esc(v.mj)}</span></span>`;
}
const POP_LEAD = 0.045;   // 知覚補正：エネルギー最大点より少し前で鳴らす（P-center）
function wireRhythmPlay(btn, src, beatEls, beats, isUser, rcard) {
  if (!btn) return;
  if (!src) { btn.disabled = true; return; }
  btn.onclick = () => {
    if (_waveAudio && _waveBtn === btn && !_waveAudio.paused) { _waveAudio.pause(); return; }
    stopWaveAudio();
    const a = new Audio(src); _waveAudio = a; _waveBtn = btn;
    setPlayIcon(btn, 'pause');
    const N = beatEls.length;
    const popped = new Array(N).fill(false);
    let times = _analysisDone[src] ? assignBeatTimes(beats, _analysisDone[src]) : null;  // キャッシュ済みなら即確定
    let modelTimes = null;
    getAnalysis(src).then(an => {            // 未解析なら解析完了時に確定（発話区間に合わせる）
      if (_waveAudio !== a) return;
      times = assignBeatTimes(beats, an);
      if (isUser && rcard) showVerdict(rcard, rhythmVerdict(beats, an));
    }).catch(() => {});
    const useTimes = () => {                  // 解析が間に合わない時のみ推定モデルで代用
      if (times) return times;
      if (!modelTimes) { const m = beatModel(beats); const dur = (isFinite(a.duration) && a.duration > 0) ? a.duration : m.total / 1000; modelTimes = m.centers.map(c => c * dur); }
      return modelTimes;
    };
    const loop = () => {                       // currentTimeを毎フレーム見て、来た拍だけポップ
      if (_waveAudio !== a) return;
      const t = a.currentTime, T = useTimes();
      for (let i = 0; i < N; i++) { if (!popped[i] && t >= T[i] - POP_LEAD) { popped[i] = true; popBeat(beatEls[i]); } }
      if (!a.paused && !a.ended) _rafId = requestAnimationFrame(loop);
    };
    const reset = () => { setPlayIcon(btn, 'play_arrow'); clearBeatTimers(); if (_waveAudio === a) { _waveAudio = null; _waveBtn = null; } };
    a.onended = reset; a.onpause = reset; a.onerror = reset;
    a.onplaying = () => { if (_rafId) cancelAnimationFrame(_rafId); _rafId = requestAnimationFrame(loop); };
    a.play().catch(reset);                      // iOS対策：ジェスチャ内で即再生
  };
}

/* ---- small UI ---- */
function showDemoBadge(text) { const b = $('#mode-badge'); if (b) { b.textContent = text || 'DEMO'; b.hidden = false; } }
function showScoring(wrap) { wrap.appendChild(el(`<div class="overlay scoring"><div class="spinner"></div><p>Checking your voice…</p></div>`)); }
function toast(msg) { const t = el(`<div class="toast">${esc(msg)}</div>`); document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('show')); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2800); }
/* ---- articulation diagram (JS生成・アニメ可) ---- */
const ARTIC_G = { INK: '#5b6573', LINE: '#9aa6b4', CORAL: '#ff6b5c', CORAL_D: '#e1503f', GUM: '#f3d9c7', GUM_E: '#e7b49a', TEE: '#ffffff', LIP: '#ff7a6c', OFF: '#c4ccd6' };
const ARTIC_UNDER = [[150, 126], [112, 132], [74, 132], [52, 129]];
const ARTIC_REST = [[52, 118], [82, 108], [114, 106], [140, 108], [156, 112]];
const ARTIC_CFG = {
  schwa: { ipa: 'ə', top: [[52, 116], [80, 102], [112, 98], [140, 102], [156, 110]], r: false, v: true },
  r: { ipa: 'ɹ', top: [[52, 114], [78, 98], [104, 84], [126, 86], [138, 94]], r: true, v: true },
  er: { ipa: 'ɝ', top: [[52, 114], [78, 98], [104, 84], [126, 86], [138, 94]], r: true, v: true },
  l: { ipa: 'l', top: [[52, 116], [80, 106], [112, 104], [138, 96], [157, 68]], r: false, v: true },
  th_voiceless: { ipa: 'θ', top: [[52, 116], [82, 104], [112, 102], [140, 98], [172, 88]], r: false, v: false },
  th_voiced: { ipa: 'ð', top: [[52, 116], [82, 104], [112, 102], [140, 98], [172, 88]], r: false, v: true },
  v: { ipa: 'v', top: [[52, 118], [82, 106], [112, 104], [140, 104], [156, 110]], r: false, v: true, lip: 'labio' },
  f: { ipa: 'f', top: [[52, 118], [82, 106], [112, 104], [140, 104], [156, 110]], r: false, v: false, lip: 'labio' },
  ae: { ipa: 'æ', top: [[52, 120], [84, 112], [116, 110], [142, 108], [156, 112]], r: false, v: true },
  w: { ipa: 'w', top: [[52, 110], [74, 84], [100, 92], [130, 102], [156, 110]], r: true, v: true },
  ng: { ipa: 'ŋ', top: [[52, 96], [72, 68], [100, 86], [130, 100], [156, 110]], r: false, v: true, nasal: true, air: false },
  sh: { ipa: 'ʃ', top: [[52, 114], [82, 100], [110, 88], [132, 78], [150, 104]], r: true, v: false },
  ih: { ipa: 'ɪ', top: [[52, 114], [82, 98], [112, 90], [138, 88], [156, 98]], r: false, v: true },
  uh: { ipa: 'ʊ', top: [[52, 108], [80, 88], [108, 92], [134, 102], [156, 110]], r: true, v: true },
};
function articCR(P) {
  const n = P.length; let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} `;
  }
  return d + 'Z';
}
function articTonguePath(top) { return articCR(top.concat(ARTIC_UNDER)); }
function articLerp(a, b, p) { return a.map((pt, i) => [pt[0] + (b[i][0] - pt[0]) * p, pt[1] + (b[i][1] - pt[1]) * p]); }
function articLipsRelaxed() { return `<path d="M176 70 C184 69 190 70 192 72" fill="none" stroke="${ARTIC_G.LIP}" stroke-width="7" stroke-linecap="round"/><path d="M176 104 C184 105 190 104 192 102" fill="none" stroke="${ARTIC_G.LIP}" stroke-width="7" stroke-linecap="round"/>`; }
function articLipsTarget(c) {
  if (c.lip === 'labio') return `<path d="M176 66 C184 65 190 66 192 68" fill="none" stroke="${ARTIC_G.LIP}" stroke-width="6" stroke-linecap="round"/><path d="M159 80 L190 80 C195 91 190 102 177 102 C167 102 160 93 159 84 Z" fill="${ARTIC_G.LIP}" stroke="${ARTIC_G.CORAL_D}" stroke-width="1.2"/>`;
  if (c.r) return `<circle cx="184" cy="87" r="9.5" fill="none" stroke="${ARTIC_G.LIP}" stroke-width="7"/>`;
  return articLipsRelaxed();
}
function articMarkers(c) {
  let s = '';
  if (c.air !== false) s += `<path d="M198 86 L210 86" stroke="${ARTIC_G.CORAL}" stroke-width="2.6" stroke-linecap="round"/><path d="M205 81 L210 86 L205 91" fill="none" stroke="${ARTIC_G.CORAL}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
  if (c.nasal) s += `<path d="M120 42 C124 30 132 28 138 32" fill="none" stroke="${ARTIC_G.CORAL}" stroke-width="2.4" stroke-linecap="round"/><path d="M131 27 L135 23" stroke="${ARTIC_G.CORAL}" stroke-width="2.4" stroke-linecap="round"/>`;
  s += c.v ? `<circle cx="30" cy="126" r="5.5" fill="${ARTIC_G.CORAL}"/><circle cx="30" cy="126" r="9.5" fill="none" stroke="${ARTIC_G.CORAL}" stroke-width="1.8" opacity="0.5"/>` : `<circle cx="30" cy="126" r="5.5" fill="none" stroke="${ARTIC_G.OFF}" stroke-width="2"/>`;
  return s;
}
function articSVG(slug) {   // 目標(target)で静的描画。ただし全グループにidを付けてアニメ可
  const c = ARTIC_CFG[slug]; if (!c) return '';
  return `<svg viewBox="0 0 222 152" xmlns="http://www.w3.org/2000/svg">`
    + `<path d="M40 52 C90 40 130 44 158 56 C164 50 170 54 172 62 L172 70 C150 60 96 58 46 70 Z" fill="${ARTIC_G.GUM}" stroke="${ARTIC_G.GUM_E}" stroke-width="1.4"/>`
    + `<path d="M45 62 C36 86 38 110 50 130" fill="none" stroke="${ARTIC_G.LINE}" stroke-width="2.4" stroke-linecap="round"/>`
    + `<rect x="159" y="66" width="7.5" height="13" rx="2" fill="${ARTIC_G.TEE}" stroke="${ARTIC_G.INK}" stroke-width="1.2"/>`
    + `<path class="tongue" d="${articTonguePath(c.top)}" fill="${ARTIC_G.CORAL}" stroke="${ARTIC_G.CORAL_D}" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<rect x="159" y="95" width="7.5" height="13" rx="2" fill="${ARTIC_G.TEE}" stroke="${ARTIC_G.INK}" stroke-width="1.2"/>`
    + `<path d="M50 132 C92 142 132 136 158 114" fill="none" stroke="${ARTIC_G.LINE}" stroke-width="2.2" stroke-linecap="round" opacity="0.6"/>`
    + `<g class="lipsRelaxed" opacity="0">${articLipsRelaxed()}</g>`
    + `<g class="lipsTarget" opacity="1">${articLipsTarget(c)}</g>`
    + `<g class="markers" opacity="1">${articMarkers(c)}</g>`
    + `<text x="14" y="30" font-family="Georgia, 'Times New Roman', serif" font-size="21" font-weight="700" fill="${ARTIC_G.INK}">/${c.ipa}/</text>`
    + `</svg>`;
}
// 中立→その音の形へ動かし、tip全文を音声合成で読み上げる簡易プレイヤー
function makeArticPlayer(svgEl, slug, text) {
  const c = ARTIC_CFG[slug];
  const tongue = svgEl.querySelector('.tongue'), lipsR = svgEl.querySelector('.lipsRelaxed'), lipsT = svgEl.querySelector('.lipsTarget'), markers = svgEl.querySelector('.markers');
  const ease = x => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const CYCLE = 1700; let raf = 0, mode = 'idle', t0 = 0, lastP = 1, settleFrom = 1, settleT0 = 0, onDone = null;
  function setP(p) { lastP = p; tongue.setAttribute('d', articTonguePath(articLerp(ARTIC_REST, c.top, p))); if (lipsR) lipsR.setAttribute('opacity', (1 - p).toFixed(3)); if (lipsT) lipsT.setAttribute('opacity', p.toFixed(3)); if (markers) markers.setAttribute('opacity', p.toFixed(3)); }
  function frame(now) {
    if (mode === 'loop') { const ph = ((now - t0) % CYCLE) / CYCLE; setP(ph < 0.5 ? ease(ph * 2) : ease((1 - ph) * 2)); raf = requestAnimationFrame(frame); }
    else if (mode === 'settle') { const e = Math.min(1, (now - settleT0) / 450); setP(settleFrom + (1 - settleFrom) * ease(e)); if (e < 1) raf = requestAnimationFrame(frame); else { mode = 'idle'; if (onDone) { const cb = onDone; onDone = null; cb(); } } }
  }
  function stopRaf() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  function settle(cb) { stopRaf(); settleFrom = lastP; settleT0 = performance.now(); mode = 'settle'; onDone = cb || null; raf = requestAnimationFrame(frame); }
  function stop() { stopRaf(); mode = 'idle'; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }
  function play(btn) {
    try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
    setP(0); stopRaf(); mode = 'loop'; t0 = performance.now(); raf = requestAnimationFrame(frame);
    if (btn) setPlayIcon(btn, 'graphic_eq');
    const finish = () => settle(() => { if (btn) setPlayIcon(btn, 'play_arrow'); });
    if (window.speechSynthesis && text) {
      const u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.92;
      const vs = speechSynthesis.getVoices() || []; const v = vs.find(x => /^en[-_]/i.test(x.lang)); if (v) u.voice = v;
      u.onend = finish; u.onerror = finish;
      try { speechSynthesis.speak(u); } catch (e) { setTimeout(finish, 1700); }
    } else setTimeout(finish, 1700);
  }
  return { play, stop };
}
// 発音動画の所在を決める。D.phoneme_videos があればそれが権威（slug→ファイル名／空=動画なし）。
// レジストリ自体が未定義なら規約 VIDEO_DIR/{slug}.mp4 を自動探索（存在は<video>読込で確認）。
function videoSrcFor(slug) {
  if (!slug) return null;
  const dir = (C.VIDEO_DIR || 'videos/phonemes').replace(/\/+$/, '');
  const reg = D.phoneme_videos;
  if (reg && typeof reg === 'object') {
    const f = reg[slug]; if (!f) return null;
    return /^(https?:|data:|blob:|\/)/.test(f) ? f : `${dir}/${f}`;   // 絶対URL/データURIはそのまま
  }
  return `${dir}/${slug}.mp4`;
}
function openLightbox(slug, ipa, en, mj) {
  const svg = ARTIC_CFG[slug] ? articSVG(slug) : '';
  const vsrc = videoSrcFor(slug);
  const ipaHtml = ipa ? `<div class="lb-cap">/${esc(ipa)}/</div>` : '';
  const txt = (en || mj) ? `<div class="lb-text">${en ? `<p class="lb-en">${esc(en)}</p>` : ''}${mj ? `<p class="lb-mj">${esc(mj)}</p>` : ''}</div>` : '';
  const playBtn = (svg || vsrc) ? `<button class="lb-play"><span class="material-symbols-rounded">play_arrow</span><span class="lb-play-lab">Watch &amp; listen</span></button>` : '';
  // 動画候補があれば <video>（初期は非表示）＋ 図解SVG（初期表示）。読み込めたら動画へ差し替え、失敗ならSVGのまま。
  const stageHTML = vsrc
    ? `<video class="lb-video" playsinline preload="metadata" style="display:none"></video><div class="lb-svg">${svg}</div>`
    : svg;
  const ov = el(`<div class="lightbox"><div class="lb-inner"><div class="lb-stage">${stageHTML}</div>${playBtn}${ipaHtml}${txt}<button class="lb-close" aria-label="Close"><span class="material-symbols-rounded">close</span></button></div></div>`);

  const pb = $('.lb-play', ov), pbLab = $('.lb-play-lab', ov);
  const videoEl = $('.lb-video', ov), svgEl = $('.lb-stage svg', ov);
  let player = null, mode = 'svg';
  const makeSvgPlayer = () => { if (!player && svgEl && ARTIC_CFG[slug]) player = makeArticPlayer(svgEl, slug, en || ''); };

  if (vsrc && videoEl) {
    videoEl.onloadeddata = () => {                 // 動画あり → 動画に差し替え
      mode = 'video';
      const wrap = $('.lb-svg', ov); if (wrap) wrap.style.display = 'none';
      videoEl.style.display = ''; if (pbLab) pbLab.textContent = 'Watch the video';
    };
    videoEl.onerror = () => { mode = 'svg'; };       // 動画なし/失敗 → 図解アニメのまま
    videoEl.onended = () => { if (pb) setPlayIcon(pb, 'play_arrow'); };
    videoEl.src = vsrc;                              // 読み込み開始
  }

  if (pb) pb.onclick = (e) => {
    e.stopPropagation();
    if (mode === 'video' && videoEl) {
      try { videoEl.currentTime = 0; const p = videoEl.play(); setPlayIcon(pb, 'graphic_eq'); if (p && p.catch) p.catch(() => {}); }
      catch (err) { mode = 'svg'; makeSvgPlayer(); if (player) player.play(pb); }
    } else { makeSvgPlayer(); if (player) player.play(pb); }
  };

  $('.lb-inner', ov).onclick = e => e.stopPropagation();
  const close = () => { if (player) player.stop(); if (videoEl) { try { videoEl.pause(); } catch (e) {} } ov.classList.remove('show'); setTimeout(() => ov.remove(), 200); };
  ov.onclick = close; const cb = $('.lb-close', ov); if (cb) cb.onclick = (e) => { e.stopPropagation(); close(); };
  document.body.appendChild(ov); requestAnimationFrame(() => ov.classList.add('show'));
}

/* ============================================================ DRILLS（発音特化ドリル / §3-4） ============================================================
   軸チップ/地雷の「この音を練習」→ その軸の集中フレーズ集 → 録音→共通採点（scoreUtterance）→ 結果。
   ドリル用フレーズから合成 mine を作り、シーンと同じパイプラインを語・短文スコープで再利用する。 */
const drillsFor = axisId => (window.DRILLS || {})[axisId] || null;
const hasDrill = axisId => !!(drillsFor(axisId) && drillsFor(axisId).phrases && drillsFor(axisId).phrases.length);
function makeDrillMine(p) { return { text_en: p.text_en, chunks_en: p.chunks_en || p.text_en, manjiro_ja: p.manjiro_ja || '', audio_file: p.audio_file || '' }; }

async function scoreDrill(mine, blob, heldSec) {
  return scoreUtterance(mine, blob, heldSec);   // §3-5: 採点はすべて共通エントリへ集約
}
function drillResultHTML(res) {
  const ok = res.overall >= C.SUCCESS_THRESHOLD;
  const wordsHTML = (res.words || []).map(w => {
    let sub = '';
    if (w.level === 'missing') sub = `<span class="w-miss">未発話</span>`;
    else if (w.level !== 'great') { const ipa = ipaFor(w.word); if (ipa) { let b = esc(ipa); if (w.weak) b = b.replace(esc(w.weak), `<b>${esc(w.weak)}</b>`); sub = `<span class="w-ipa">/${b}/</span>`; } }
    return `<span class="w ${w.level}"><span class="w-en">${esc(w.word)}</span>${sub}</span>`;
  }).join('');
  let trapHTML = '';
  (res.traps || []).forEach(t => { if (t.hit) trapHTML += `<div class="trap-card hit" style="margin-top:10px"><div class="trap-head"><span class="material-symbols-rounded">warning</span>あぶない！${axisChip(t.axis)}</div><p class="trap-said">「${esc(t.error)}」<span class="trap-ja">${esc(t.error_ja)}</span> に聞こえたかも</p><p class="trap-mean">→ <b>${esc(t.word)}</b> <span class="trap-ipa">/${esc(t.target_ipa)}/</span></p>${t.fix_mj ? `<p class="trap-fix">${esc(t.fix_mj)}</p>` : ''}</div>`; });
  const tipsHTML = (res.tips || []).map(t => `<div class="d-tip">${axisChip(t.axis)}<span class="d-tip-mj sub-mj">${esc(t.mj)}</span></div>`).join('');
  return `<div class="d-result ${ok ? 'ok' : 'no'}">
      <div class="d-resrow"><div class="d-score"><b>${res.overall}</b><small>SCORE</small></div>
        <div class="d-words">${wordsHTML}</div></div>
      <p class="d-said">You said: <span>${esc(res.said_text || '—')}</span></p>
      <p class="d-comment">${esc(res.comment_mj || res.comment || '')}</p>
      ${trapHTML}${tipsHTML ? `<div class="d-tips">${tipsHTML}</div>` : ''}</div>`;
}
function wireDrillCard(p, card) {
  const mine = makeDrillMine(p);
  const btn = $('.d-mic', card), out = $('.d-out', card), lab = $('label', btn);
  const st = { recording: false, rec: null, stream: null, chunks: [], mime: '', recStart: 0 };
  async function start() {
    bgmDuck(true); st.recStart = Date.now();
    if (C.DEMO_MODE) { st.recording = true; btn.classList.add('live'); if (lab) lab.textContent = '停止'; return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      st.stream = stream; st.chunks = [];
      let mime = ''; const cand = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/aac'];
      if (window.MediaRecorder && MediaRecorder.isTypeSupported) { for (const c of cand) { if (MediaRecorder.isTypeSupported(c)) { mime = c; break; } } }
      st.rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); st.mime = st.rec.mimeType || mime || 'audio/mp4';
      st.rec.ondataavailable = e => e.data.size && st.chunks.push(e.data); st.rec.start();
      st.recording = true; btn.classList.add('live'); if (lab) lab.textContent = '停止';
    } catch (e) { bgmDuck(false); toast('マイクを使えません。許可（または localhost / https）をご確認ください。'); }
  }
  async function stop() {
    st.recording = false; btn.classList.remove('live'); if (lab) lab.textContent = '録音';
    out.innerHTML = `<div class="d-scoring"><span class="spin"></span>採点中…</div>`;
    const held = st.recStart ? (Date.now() - st.recStart) / 1000 : undefined;
    let blob = null;
    try {
      if (!C.DEMO_MODE) { blob = await new Promise(res => { st.rec.onstop = () => res(new Blob(st.chunks, { type: st.rec.mimeType || st.mime || 'audio/mp4' })); st.rec.stop(); }); if (st.stream) st.stream.getTracks().forEach(t => t.stop()); }
      const result = await scoreDrill(mine, blob, held);
      bgmDuck(false); out.innerHTML = drillResultHTML(result);
    } catch (e) { bgmDuck(false); out.innerHTML = ''; toast('採点に失敗: ' + e.message); }
  }
  btn.onclick = () => st.recording ? stop() : start();
}
function drillTextHTML(p) {
  return esc(p.text_en).replace(/[A-Za-z][A-Za-z']*/g, m => {
    const w = m.toLowerCase().replace(/[^a-z'-]/g, '');
    return (D.traps && D.traps[w]) ? `<mark class="dc-trap">${m}</mark>` : m;
  });
}
function renderDrill(axisId, backFn) {
  current.screen = 'drill'; current.drillBack = backFn || renderTitle; resultActive = false; bgmDuck(false);
  const ax = axisInfo(axisId), set = drillsFor(axisId);
  APP.innerHTML = '';
  const wrap = el(`<section class="screen drill-screen"></section>`);
  const head = el(`<div class="drill-head">
      <div class="drill-axis">${axisChip(axisId)}${ax && ax.channel ? `<span class="drill-ch">${esc(ax.channel)}</span>` : ''}</div>
      <h2>${esc(ax ? ax.label_ja : axisId)} の練習</h2>
      ${set && set.intro_mj ? `<p class="drill-intro">${esc(set.intro_mj)}</p>` : ''}
      ${ax && ax.examples ? `<div class="drill-ex">${ax.examples.map(e => `<span>${esc(e)}</span>`).join('')}</div>` : ''}
      <button class="drill-howto"><span class="material-symbols-rounded">volume_up</span>音の出し方を見る</button>
    </div>`);
  wrap.appendChild(head);
  $('.drill-howto', head).onclick = () => {
    const ipa = Object.keys((ax && ax.members) || {})[0] || '';
    const m = ipa && ax ? ax.members[ipa] : null;
    openLightbox((ax && ax.slug) || ipa, ipa, m ? m.en : '', m ? m.mj : (ax && ax.tip ? ax.tip.mj : ''));
  };
  if (!set || !set.phrases || !set.phrases.length) {
    wrap.appendChild(el(`<p class="drill-empty">この軸のドリルはまだ準備中です。</p>`));
  } else set.phrases.forEach((p, i) => {
    const card = el(`<div class="drill-card">
        <div class="dc-head"><span class="dc-num">${i + 1}</span><div class="dc-text">${drillTextHTML(p)}</div></div>
        ${p.manjiro_ja ? `<p class="dc-mj sub-mj">${esc(p.manjiro_ja)}</p>` : ''}
        ${p.note_mj ? `<p class="dc-note">${esc(p.note_mj)}</p>` : ''}
        <button class="d-mic"><span class="material-symbols-rounded">mic</span><label>録音</label></button>
        <div class="d-out"></div>
      </div>`);
    wrap.appendChild(card);
    wireDrillCard(p, card);
  });
  APP.appendChild(wrap);
}

/* ---- boot ---- */
sfx.init(); bgmInit();
if (C.DEMO_MODE) showDemoBadge('DEMO');
$('#btn-back').onclick = navBack;
$('#set-bgm').onclick = () => bgmSet(!bgm.on);
$('#set-cc').onclick = () => setSubtitle(!SUB);
$('#btn-settings').onclick = (e) => { e.stopPropagation(); $('#settings-panel').hidden = !$('#settings-panel').hidden; };
document.addEventListener('click', e => {
  if (e.target.closest('button')) sfx.play('tap');
  if (!e.target.closest('#settings-panel') && !e.target.closest('#btn-settings')) $('#settings-panel').hidden = true;
});
window.addEventListener('pointerdown', function once() { if (bgm.on && !bgm.ducked) bgm.audio.play().catch(() => {}); window.removeEventListener('pointerdown', once); });
document.body.classList.toggle('subtitle-on', SUB);
if (window.speechSynthesis) { try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = function () {}; } catch (e) {} }
updateControls(); updateBack();
renderTitle();
