// Vocab Vault — script.js
const API_DICT = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const API_DATAMUSE = 'https://api.datamuse.com/words?max=12&rel_syn=';

const el = id => document.getElementById(id);

const savedKey = 'vv_saved';
const flashKey = 'vv_flashcards';
const recentKey = 'vv_recent';
const progressKey = 'vv_progress';

let saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
let flashcards = JSON.parse(localStorage.getItem(flashKey) || '[]');
let recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
let progress = JSON.parse(localStorage.getItem(progressKey) || '{}');

const byId = (arr, w) => arr.find(x => x.word.toLowerCase() === w.toLowerCase());

/* UI wiring */
const searchInput = el('searchInput');
el('searchBtn').addEventListener('click', () => doSearch(searchInput.value.trim()));
searchInput.addEventListener('keydown', e => { if(e.key === 'Enter') doSearch(searchInput.value.trim()); });
el('clearBtn').addEventListener('click', clearResults);

el('saveBtn').addEventListener('click', saveCurrent);
el('addFlashBtn').addEventListener('click', addFlashCurrent);
el('open-flash').addEventListener('click', openFlashPanelImpl);
el('open-game').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

el('makeAllFlash').addEventListener('click', makeFlashFromSaved);
el('clearSaved').addEventListener('click', () => { if(confirm('Clear all saved words?')) { saved=[]; persist(); renderSaved(); }});
el('exportBtn').addEventListener('click', exportSaved);

el('shuffleFlash').addEventListener('click', shuffleFlash);
el('resetProgress').addEventListener('click', resetProgress);
el('flipBtn').addEventListener('click', flipCard);
el('knownBtn').addEventListener('click', () => markCard(true));
el('dontKnowBtn').addEventListener('click', () => markCard(false));

el('startGameBtn').addEventListener('click', startGame);

renderSaved();
renderRecent();

async function doSearch(word){
  if(!word) return;
  const lower = word.toLowerCase();
  addRecent(lower);
  showLoading();
  try {
    const dictResp = await fetch(API_DICT + encodeURIComponent(lower));
    if(!dictResp.ok) throw new Error('Not found');
    const dictData = await dictResp.json();

    const entry = dictData[0];
    const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find(p=>p.text)?.text) || '';
    const meanings = entry.meanings || [];
    const defs = [];
    for(const m of meanings){
      for(const d of m.definitions){
        defs.push({
          definition: d.definition,
          example: d.example || '',
          partOfSpeech: m.partOfSpeech || ''
        });
      }
    }
    const example = defs.find(d=>d.example)?.example || '';

    let syns = [];
    try {
      const sresp = await fetch(API_DATAMUSE + encodeURIComponent(lower));
      if(sresp.ok){
        const sdata = await sresp.json();
        syns = sdata.map(x=>x.word).slice(0,10);
      }
    } catch(e){ }

    renderResult({word: lower, phonetic, defs, example, syns});
    maybeAddToFlashPool(lower, defs, example);
  } catch(err){
    renderNotFound(word);
  } finally {
    hideLoading();
  }
}

function renderResult(data){
  el('mainHeader').style.display = 'block';
  el('resultWord').textContent = data.word;
  el('phonetic').textContent = data.phonetic || '';
  const defsWrap = el('definitionsWrap');
  defsWrap.innerHTML = '<div class="section"><div class="label">Definitions</div></div>';
  data.defs.forEach((d,i) => {
    const dEl = document.createElement('div');
    dEl.className = 'definition';
    dEl.innerHTML = `<div style="font-weight:600">${d.partOfSpeech || ''}</div>
                     <div style="margin-top:6px">${escapeHtml(d.definition)}</div>
                     ${d.example ? `<div class="example" style="margin-top:6px">“${escapeHtml(d.example)}”</div>` : ''}`;
    defsWrap.appendChild(dEl);
  });

  const exWrap = el('exampleWrap');
  if(data.example){
    exWrap.innerHTML = `<div class="section"><div class="label">Example</div>
      <div class="definition"><div class="example">“${escapeHtml(data.example)}”</div></div></div>`;
  } else {
    exWrap.innerHTML = '';
  }

  const synWrap = el('synonymsWrap');
  if(data.syns && data.syns.length){
    synWrap.innerHTML = `<div class="section"><div class="label">Similar words</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${data.syns.map(s => `<button class="chip" onclick="doSearch('${escapeJs(s)}')">${escapeHtml(s)}</button>`).join('')}</div></div>`;
  } else {
    synWrap.innerHTML = `<div class="section"><div class="label">Similar words</div><div class="small muted-line">No suggestions</div></div>`;
  }
}

function renderNotFound(word){
  el('mainHeader').style.display = 'block';
  el('resultWord').textContent = word;
  el('definitionsWrap').innerHTML = `<div class="section"><div class="label">Definitions</div>
    <div class="definition">No results found. Try another spelling or smaller word.</div></div>`;
  el('exampleWrap').innerHTML = '';
  el('synonymsWrap').innerHTML = '';
}

/* Recent */
function addRecent(word){
  recent = recent.filter(x => x !== word);
  recent.unshift(word);
  recent = recent.slice(0,10);
  localStorage.setItem(recentKey, JSON.stringify(recent));
  renderRecent();
}
function renderRecent(){
  const row = el('recentRow');
  row.innerHTML = recent.map(w=>`<button class="chip" onclick="doSearch('${escapeJs(w)}')">${escapeHtml(w)}</button>`).join('');
}

/* Saved */
function persist(){
  localStorage.setItem(savedKey, JSON.stringify(saved));
  localStorage.setItem(flashKey, JSON.stringify(flashcards));
  localStorage.setItem(progressKey, JSON.stringify(progress));
}

function renderSaved(){
  const list = el('savedList');
  if(saved.length === 0){
    list.innerHTML = `<div class="muted-line">No saved words yet. Look up a word and tap Save.</div>`;
    return;
  }
  list.innerHTML = saved.map(w => `
    <div class="saved-item">
      <div style="display:flex;gap:8px;align-items:center">
        <button class="chip" onclick="doSearch('${escapeJs(w.word)}')">${escapeHtml(w.word)}</button>
        <div class="small muted-line">${escapeHtml((w.def && w.def.slice(0,70)) || '')}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="ghost" onclick="removeSaved('${escapeJs(w.word)}')">Remove</button>
      </div>
    </div>
  `).join('');
}
window.removeSaved = function(word){
  saved = saved.filter(s => s.word.toLowerCase() !== word.toLowerCase());
  persist();
  renderSaved();
}

/* Save / flash helpers */
function saveCurrent(){
  const word = el('resultWord').textContent.trim();
  if(!word) return alert('No word selected');
  const def = el('definitionsWrap')?.textContent?.slice(0,200) || '';
  if(!byId(saved, word)){
    saved.unshift({word, def});
    persist();
    renderSaved();
    alert(`Saved "${word}"`);
  } else {
    alert('Already saved');
  }
}

function addFlashCurrent(){
  const word = el('resultWord').textContent.trim();
  if(!word) return alert('No word selected');
  const defEls = document.querySelectorAll('#definitionsWrap .definition');
  const defText = defEls.length ? defEls[0].innerText : '';
  const example = document.querySelector('#exampleWrap .example')?.innerText || '';
  if(!byId(flashcards, word)){
    flashcards.unshift({word, def: defText, example});
    persist();
    alert(`Added flashcard "${word}"`);
  } else alert('Flashcard already exists');
}

function maybeAddToFlashPool(word, defs, example){
  if(byId(flashcards, word)) return;
  const shortDef = defs[0]?.definition || '';
  flashcards.unshift({word, def: shortDef, example});
  flashcards = flashcards.slice(0,200);
  persist();
}

async function makeFlashFromSaved(){
  if(saved.length === 0) return alert('No saved words to convert into flashcards');
  if(!confirm('Create flashcards for all saved words? This will add them to your flash deck.')) return;
  for(const s of saved){
    if(!byId(flashcards, s.word)){
      try{
        const resp = await fetch(API_DICT + encodeURIComponent(s.word));
        if(resp.ok){
          const d = await resp.json();
          const def = (d[0]?.meanings?.[0]?.definitions?.[0]?.definition) || s.def || '';
          flashcards.unshift({word: s.word, def, example: ''});
        } else {
          flashcards.unshift({word: s.word, def: s.def || '', example: ''});
        }
      }catch(e){
        flashcards.unshift({word: s.word, def: s.def || '', example: ''});
      }
    }
  }
  persist();
  alert('Flashcards created.');
}

/* Flashcards UI */
let flashIndex = 0;
let showingBack = false;
function openFlashPanelImpl(){
  if(flashcards.length === 0){
    alert('No flashcards yet. Add cards after searching or create from saved words.');
    return;
  }
  flashIndex = 0; showingBack=false; updateCard();
  document.querySelector('#flashPanel').scrollIntoView({behavior:'smooth'});
}

function updateCard(){
  if(flashcards.length === 0){
    el('cardWord').textContent = '—';
    el('cardDef').textContent = 'No flashcards';
    return;
  }
  const card = flashcards[flashIndex % flashcards.length];
  el('cardWord').textContent = card.word;
  if(showingBack){
    el('cardDef').textContent = card.def || card.example || 'No definition available';
  } else {
    el('cardDef').textContent = 'Tap Flip to reveal definition';
  }
}

function flipCard(){
  showingBack = !showingBack;
  updateCard();
}
function shuffleFlash(){
  for(let i=flashcards.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [flashcards[i],flashcards[j]]=[flashcards[j],flashcards[i]];
  }
  persist();
  flashIndex = 0; showingBack=false; updateCard();
}
function markCard(known){
  const card = flashcards[flashIndex % flashcards.length];
  if(!card) return;
  progress[card.word] = progress[card.word] || {seen:0, known:0};
  progress[card.word].seen += 1;
  if(known) progress[card.word].known += 1;
  persist();
  flashIndex++;
  showingBack = false;
  updateCard();
}
function resetProgress(){
  if(confirm('Reset all flash progress?')) {
    progress = {}; persist();
    alert('Progress reset.');
  }
}

/* Game */
let gameState = null;
async function startGame(){
  const pool = (saved.length ? saved.map(s=>s.word) : (flashcards.length ? flashcards.map(f=>f.word) : recent.slice()));
  if(pool.length < 3) return alert('You need at least 3 words (saved or flashcards) to play the game.');
  const questions = [];
  const poolCopy = [...new Set(pool)];
  shuffleArray(poolCopy);
  const picks = poolCopy.slice(0, Math.min(10, poolCopy.length));
  for(const w of picks.slice(0,5)){
    let def = '';
    try{
      const r = await fetch(API_DICT + encodeURIComponent(w));
      if(r.ok){
        const j = await r.json();
        def = j[0]?.meanings?.[0]?.definitions?.[0]?.definition || '';
      }
    }catch(e){}
    let choices = [w];
    try{
      const res = await fetch(API_DATAMUSE + encodeURIComponent(w));
      if(res.ok){
        const arr = await res.json();
        arr.slice(0,3).forEach(a => { if(a.word && !choices.includes(a.word)) choices.push(a.word); });
      }
    }catch(e){}
    shuffleArray(pool);
    for(const p of pool){
      if(choices.length >= 4) break;
      if(!choices.includes(p)) choices.push(p);
    }
    while(choices.length < 4) choices.push((w + Math.random().toString(36).slice(2,5)));
    shuffleArray(choices);
    questions.push({word: w, def, correct: w, choices});
  }
  gameState = {questions, index:0, score:0};
  renderQuestion();
}

function renderQuestion(){
  const area = el('gameArea');
  if(!gameState) { area.innerHTML = '<div class="muted-line">No game started.</div>'; return; }
  const q = gameState.questions[gameState.index];
  if(!q) {
    area.innerHTML = `<div class="muted-line">Finished! Score: ${gameState.score}/${gameState.questions.length}</div>
      <div style="margin-top:10px"><button class="btn" onclick="startGame()">Play again</button></div>`;
    return;
  }
  area.innerHTML = `
    <div class="label">Question ${gameState.index+1} of ${gameState.questions.length}</div>
    <div style="margin-top:8px"><div class="small muted-line">Which word matches this definition?</div>
      <div style="margin-top:10px;padding:12px;border-radius:10px;background:var(--card)"><strong>${escapeHtml(q.def || 'No definition available - pick the best match')}</strong></div>
    </div>
    <div class="game-choices" id="gameChoices"></div>
  `;
  const choicesEl = el('gameChoices');
  q.choices.forEach(c => {
    const btn = document.createElement('div');
    btn.className = 'choice';
    btn.textContent = c;
    btn.onclick = () => selectChoice(c);
    choicesEl.appendChild(btn);
  });
}

function selectChoice(choice){
  const q = gameState.questions[gameState.index];
  const correct = q.correct;
  const area = el('gameArea');
  const choices = Array.from(area.querySelectorAll('.choice'));
  choices.forEach(elm => {
    if(elm.textContent === correct) elm.classList.add('correct');
    if(elm.textContent === choice && choice !== correct) elm.classList.add('wrong');
    elm.onclick = null;
  });
  if(choice === correct) gameState.score++;
  setTimeout(() => {
    gameState.index++;
    renderQuestion();
  }, 900);
}

/* Helpers */
function showLoading(){}
function hideLoading(){}

function clearResults(){
  el('mainHeader').style.display = 'none';
  el('definitionsWrap').innerHTML = '';
  el('exampleWrap').innerHTML = '';
  el('synonymsWrap').innerHTML = '';
  searchInput.value = '';
}

function exportSaved(){
  if(!saved.length) return alert('No saved words');
  const data = JSON.stringify(saved, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'vocab-vault-saved.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(s){ if(!s) return ''; return s.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeJs(s){ return s.replace(/'/g,"\\'").replace(/"/g,'\\"'); }

function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

(function loadFromStorage(){
  try{
    saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
    flashcards = JSON.parse(localStorage.getItem(flashKey) || '[]');
    recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
    progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
  }catch(e){
    saved = []; flashcards = []; recent = []; progress = {};
  }
  renderSaved();
  renderRecent();
})();

window.doSearch = (s) => doSearch(s);
window.removeSaved = (s) => {
  saved = saved.filter(x => x.word.toLowerCase() !== s.toLowerCase());
  persist(); renderSaved();
};
