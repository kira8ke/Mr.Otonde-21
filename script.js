(function(){
"use strict";

/* ============================================================
   AUDIO — all synthesized with Web Audio, nothing external to load
============================================================ */
const AC = window.AudioContext || window.webkitAudioContext;
let ctx = null, muted = false;
function getCtx(){ if(!ctx) ctx = new AC(); return ctx; }

function envGain(g, c, t0, attack, decay, peak){
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0+attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0+attack+decay);
}

function playVroom(){
  if(muted) return;
  const c = getCtx(); const t = c.currentTime;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(60, t);
  o.frequency.exponentialRampToValueAtTime(140, t+0.35);
  o.frequency.exponentialRampToValueAtTime(70, t+1.1);
  envGain(g, c, t, 0.05, 1.2, 0.22);
  const filt = c.createBiquadFilter(); filt.type='lowpass'; filt.frequency.value=900;
  o.connect(filt); filt.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+1.3);
}

function playClick(){
  if(muted) return;
  const c = getCtx(); const t = c.currentTime;
  const o = c.createOscillator(); const g = c.createGain();
  o.type='square'; o.frequency.setValueAtTime(700,t);
  envGain(g,c,t,0.001,0.07,0.15);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+0.09);
}

function playTick(){
  if(muted) return;
  const c = getCtx(); const t = c.currentTime;
  const o = c.createOscillator(); const g = c.createGain();
  o.type='square'; o.frequency.setValueAtTime(1200,t);
  envGain(g,c,t,0.001,0.04,0.12);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+0.05);
}

function playDing(){
  if(muted) return;
  const c = getCtx(); const t = c.currentTime;
  [880, 1318.5].forEach((f,i)=>{
    const o = c.createOscillator(); const g = c.createGain();
    o.type='sine'; o.frequency.value = f;
    const start = t + i*0.1;
    envGain(g,c,start,0.01,0.5,0.2);
    o.connect(g); g.connect(c.destination);
    o.start(start); o.stop(start+0.55);
  });
}

function playRibbon(){
  if(muted) return;
  const c = getCtx(); const t = c.currentTime;
  const buf = c.createBuffer(1, c.sampleRate*0.35, c.sampleRate);
  const data = buf.getChannelData(0);
  for(let i=0;i<data.length;i++){ data[i] = (Math.random()*2-1) * (1 - i/data.length); }
  const src = c.createBufferSource(); src.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type='highpass'; bp.frequency.value = 1500;
  const g = c.createGain(); g.gain.value = 0.3;
  src.connect(bp); bp.connect(g); g.connect(c.destination);
  src.start(t);
}

function playPop(){
  if(muted) return;
  const c = getCtx(); const t = c.currentTime;
  const o = c.createOscillator(); const g = c.createGain();
  o.type='sine'; o.frequency.setValueAtTime(300,t); o.frequency.exponentialRampToValueAtTime(900,t+0.12);
  envGain(g,c,t,0.005,0.2,0.28);
  o.connect(g); g.connect(c.destination);
  o.start(t); o.stop(t+0.25);
  playRibbon();
}

document.getElementById('muteBtn').addEventListener('click', function(){
  muted = !muted;
  this.textContent = muted ? '\u{1F507}' : '\u{1F50A}';
});

/* ============================================================
   CONFETTI (canvas, shared by wheel result + card open)
============================================================ */
const canvas = document.getElementById('confetti');
const ctx2d = canvas.getContext('2d');
let particles = [], rafId = null;
function resizeCanvas(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ['#e8c547','#ffd766','#2e8b52','#155c34','#f8f2e2'];

function spawnConfetti(mode, originX, originY, count){
  const list = [];
  for(let i=0;i<count;i++){
    if(mode === 'fall'){
      list.push({
        x: Math.random()*canvas.width, y: -20 - Math.random()*canvas.height*0.5,
        vx: (Math.random()-0.5)*2, vy: 2+Math.random()*3,
        w:6+Math.random()*6, h:8+Math.random()*10,
        rot: Math.random()*360, rotSpeed:(Math.random()-0.5)*8,
        color: CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
        life: 1
      });
    } else {
      const angle = Math.random()*Math.PI*2;
      const speed = 3+Math.random()*6;
      list.push({
        x: originX, y: originY,
        vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - 2,
        w:5+Math.random()*5, h:7+Math.random()*8,
        rot: Math.random()*360, rotSpeed:(Math.random()-0.5)*10,
        color: CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
        life: 1, gravity: 0.25
      });
    }
  }
  particles = particles.concat(list);
  if(!rafId) frame();
}

function frame(){
  ctx2d.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x += p.vx; p.y += p.vy;
    if(p.gravity !== undefined){ p.vy += p.gravity*0.15; p.life -= 0.012; }
    p.rot += p.rotSpeed;
    if(p.gravity === undefined && p.y > canvas.height+20){ p.y = -20; p.x = Math.random()*canvas.width; }
    ctx2d.save();
    ctx2d.globalAlpha = Math.max(p.life,0);
    ctx2d.translate(p.x,p.y);
    ctx2d.rotate(p.rot*Math.PI/180);
    ctx2d.fillStyle = p.color;
    ctx2d.fillRect(-p.w/2,-p.h/2,p.w,p.h);
    ctx2d.restore();
  });
  particles = particles.filter(p => p.gravity === undefined || p.life > 0);
  rafId = requestAnimationFrame(frame);
  if(particles.length === 0 && rafId){ cancelAnimationFrame(rafId); rafId = null; ctx2d.clearRect(0,0,canvas.width,canvas.height); }
}

/* ============================================================
   ASSETS INTO DOM
============================================================ */
document.getElementById('charCarImg').src = ASSETS.CHAR_INTRO;
document.getElementById('charSmallImg').src = ASSETS.CHAR_SMALL;

/* ============================================================
   SCREEN MANAGEMENT
============================================================ */
const screens = {
  intro: document.getElementById('screen-intro'),
  wheel: document.getElementById('screen-wheel'),
  grid: document.getElementById('screen-grid')
};
function goTo(name){
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

const STORAGE_KEY = 'nigel21Progress';
let progress = { unlockedIds: [], unlockTimestamps: {}, lastSpinDate: null };
let todayDate = null;
const wheelNote = document.getElementById('wheelNote');
const gridNote = document.getElementById('gridNote');

function getTodayDate(){ return new Date().toISOString().slice(0,10); }
function loadProgress(){
  todayDate = getTodayDate();
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){
    try{
      const parsed = JSON.parse(saved);
      progress.unlockedIds = Array.isArray(parsed.unlockedIds) ? parsed.unlockedIds : [];
      progress.unlockTimestamps = parsed.unlockTimestamps && typeof parsed.unlockTimestamps === 'object' ? parsed.unlockTimestamps : {};
      progress.lastSpinDate = typeof parsed.lastSpinDate === 'string' ? parsed.lastSpinDate : null;
    } catch(e){
      progress = { unlockedIds: [], unlockTimestamps: {}, lastSpinDate: null };
    }
  }
  progress.unlockedIds = Array.from(new Set(progress.unlockedIds));
  if(!progress.unlockTimestamps) progress.unlockTimestamps = {};
  if(!progress.lastSpinDate) progress.lastSpinDate = null;
}
function saveProgress(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}
function resetTodayProgress(){
  if(progress.lastSpinDate !== todayDate) return false;
  const resetIds = progress.unlockedIds.filter(id => {
    const unlockedAt = getUnlockDate(id);
    return unlockedAt && unlockedAt.slice(0,10) === todayDate;
  });
  if(!resetIds.length) return false;
  progress.unlockedIds = progress.unlockedIds.filter(id => !resetIds.includes(id));
  resetIds.forEach(id => { delete progress.unlockTimestamps[String(id)]; });
  progress.lastSpinDate = null;
  saveProgress();
  return true;
}
function resetAllProgress(){
  progress = { unlockedIds: [], unlockTimestamps: {}, lastSpinDate: null };
  saveProgress();
  return true;
}
function isUnlocked(id){
  return progress.unlockedIds.includes(id);
}
function getAvailableIds(){
  return CARDS_DATA.map(c => c.id).filter(id => !isUnlocked(id));
}
function getUnlockDate(id){
  return progress.unlockTimestamps[String(id)] || null;
}
function formatUnlockDate(iso){
  if(!iso) return '';
  const date = new Date(iso);
  if(Number.isNaN(date.getTime())) return '';
  return `Unlocked ${date.toLocaleDateString(undefined,{ year:'numeric', month:'long', day:'numeric' })}`;
}
function showWheelNote(message){
  if(!wheelNote) return;
  wheelNote.textContent = message;
  if(message){
    wheelNote.classList.remove('hidden');
  } else {
    wheelNote.classList.add('hidden');
  }
}
function showGridNote(message){
  if(!gridNote) return;
  gridNote.textContent = message;
  if(message){
    gridNote.classList.remove('hidden');
  } else {
    gridNote.classList.add('hidden');
  }
}
function updateWheelAvailability(){
  const available = getAvailableIds();
  if(available.length === 0){
    spinBtn.disabled = true;
    showWheelNote("You've unlocked every goal! Head to the grid to see them all.");
  } else if(progress.lastSpinDate === todayDate){
    spinBtn.disabled = true;
    showWheelNote("You've already unlocked today's goal — come back tomorrow for the next one.");
  } else {
    spinBtn.disabled = false;
    showWheelNote('');
  }
}
function initApp(){
  loadProgress();
  const params = new URLSearchParams(window.location.search);
  if(params.has('resetAll')){
    resetAllProgress();
    loadProgress();
    showGridNote("All progress has been reset. Start fresh now.");
  } else if((params.has('resetToday') || params.has('reset')) && resetTodayProgress()){
    showGridNote("Today's unlock has been reset. You can spin again.");
  }
  if(progress.unlockedIds.length === CARDS_DATA.length){
    showGridNote("You've unlocked every goal! Enjoy the full collection.");
    goTo('grid');
    renderGrid();
    return;
  }
  if(progress.lastSpinDate === todayDate){
    showGridNote("You've already unlocked today's goal — come back tomorrow for the next one");
    goTo('grid');
    renderGrid();
    return;
  }
  startIntro();
}

/* ============================================================
   INTRO SEQUENCE
============================================================ */
const carWrap = document.getElementById('carWrap');
const speechStage = document.getElementById('speechStage');
const typedLine = document.getElementById('typedLine');
const goToWheelBtn = document.getElementById('goToWheelBtn');
const buddy = document.getElementById('buddy');

const LINE_1 = "Hi, I'm Nigel and I just turned 21. This was curated by my beautiful princess to remind me of my goals - and that she loves me VERY, VERY much.";
const LINE_2 = "But first, you have to SPIN THE WHEEL.";

function typeText(text, el, speed, onDone){
  el.textContent = '';
  el.classList.add('typed-cursor');
  let i = 0;
  const iv = setInterval(()=>{
    el.textContent = text.slice(0, i+1);
    i++;
    if(i >= text.length){
      clearInterval(iv);
      el.classList.remove('typed-cursor');
      if(onDone) onDone();
    }
  }, speed);
}

function startIntro(){
  getCtx(); // unlock audio on first gesture isn't guaranteed here, but we try
  setTimeout(()=>{
    playVroom();
    carWrap.classList.add('arrived');
  }, 300);

  setTimeout(()=>{
    speechStage.classList.add('show');
    typeText(LINE_1, typedLine, 42, ()=>{
      setTimeout(()=>{
        typeText(LINE_2, typedLine, 48, ()=>{
          setTimeout(()=>{
            goToWheelBtn.classList.remove('hidden');
            goToWheelBtn.classList.add('show');
            buddy.classList.add('show');
            document.getElementById('screen-intro').classList.add('fade-background');
          }, 1600);
        });
      }, 1200);
    });
  }, 1900);
}

// Most browsers block audio until a user gesture. We still run the visual
// sequence immediately; the requested audio.com player is embedded and will
// start once the page is activated by the first user interaction.
const bgMusicEmbed = document.getElementById('bgMusicEmbed');

document.body.addEventListener('click', ()=>{
  if(ctx && ctx.state === 'suspended') ctx.resume();
  if(bgMusicEmbed){
    bgMusicEmbed.setAttribute('data-volume', '0.3');
  }
}, { once:false });

goToWheelBtn.addEventListener('click', ()=>{
  playClick();
  goTo('wheel');
  buildWheel();
  updateWheelAvailability();
});

/* ============================================================
   WHEEL
============================================================ */
const wheelEl = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const resultBanner = document.getElementById('resultBanner');
const resultText = document.getElementById('resultText');
const goToGridBtn = document.getElementById('goToGridBtn');
const cardGrid = document.getElementById('cardGrid');
let gridRendered = false;

initApp();

const SLICE = 360 / 21;
let wheelBuilt = false;
let currentRotation = 0;
let chosenGoalId = null;

function buildWheel(){
  if(wheelBuilt) return;
  wheelBuilt = true;

  // Conic gradient background: alternate jungle greens, gold-flecked at gold ids
  const stops = [];
  for(let i=0;i<21;i++){
    const id = i+1;
    const isGold = GOLD_IDS.includes(id);
    const color = isGold ? 'var(--gold)' : (i % 2 === 0 ? 'var(--jungle)' : 'var(--jungle-light)');
    stops.push(`${color} ${i*SLICE}deg ${(i+1)*SLICE}deg`);
  }
  wheelEl.style.background = `conic-gradient(${stops.join(',')})`;

  // Number labels
  const radius = wheelEl.clientWidth / 2 * 0.72;
  for(let i=0;i<21;i++){
    const id = i+1;
    const angleDeg = i*SLICE + SLICE/2 - 90; // -90 so 0deg points up visually before rotation math
    const rad = angleDeg * Math.PI/180;
    const span = document.createElement('div');
    span.className = 'wheel-num';
    span.textContent = id;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;
    span.style.left = `calc(50% + ${x}px)`;
    span.style.top = `calc(50% + ${y}px)`;
    span.style.transform = `translate(-50%,-50%) rotate(${angleDeg+90}deg)`;
    wheelEl.appendChild(span);
  }
}

let spinning = false;
spinBtn.addEventListener('click', ()=>{
  if(spinning || spinBtn.disabled) return;
  const availableIds = getAvailableIds();
  if(availableIds.length === 0) return;

  spinning = true;
  spinBtn.disabled = true;

  const targetId = availableIds[Math.floor(Math.random() * availableIds.length)];
  chosenGoalId = targetId;
  progress.unlockedIds.push(targetId);
  progress.unlockTimestamps[String(targetId)] = new Date().toISOString();
  progress.lastSpinDate = todayDate;
  saveProgress();

  // Ticking sound while it spins
  let tickCount = 0;
  const tickInterval = setInterval(()=>{
    playTick();
    tickCount++;
    if(tickCount > 26) clearInterval(tickInterval);
  }, 150);

  // Compute final rotation: land the chosen slice's center under the top pointer.
  // currentRotation always ends aligned so that (currentRotation mod 360) ==
  // (360 - previousSliceCenterAngle) mod 360. To land on the new slice while
  // always spinning forward, add just enough delta (plus extra full turns).
  const sliceCenterAngle = (targetId - 1) * SLICE + SLICE/2;
  const extraSpins = 5 * 360;
  const desiredMod = ((360 - sliceCenterAngle) % 360 + 360) % 360;
  const normalizedDelta = ((desiredMod - (currentRotation % 360)) + 360) % 360;
  const finalRotation = currentRotation + extraSpins + normalizedDelta;
  currentRotation = finalRotation;
  wheelEl.style.transform = `rotate(${finalRotation}deg)`;

  setTimeout(()=>{
    clearInterval(tickInterval);
    spinning = false;
    playDing();
    spawnConfetti('fall', 0, 0, 130);
    resultText.textContent = `You landed on Goal #${targetId}!`;
    resultBanner.classList.remove('hidden');
    resultBanner.classList.add('show');
    updateWheelAvailability();
    setTimeout(()=>{
      goTo('grid');
      renderGrid();
    }, 1400);
  }, 4300);
});

goToGridBtn.addEventListener('click', ()=>{
  playClick();
  goTo('grid');
  renderGrid();
});

/* ============================================================
   GRID
============================================================ */
function renderGrid(){
  cardGrid.innerHTML = '';
  CARDS_DATA.forEach(card => {
    const isUnlockedCard = isUnlocked(card.id);
    const wrap = document.createElement('div');
    wrap.className = 'goal-card ' + (isUnlockedCard ? 'unlocked' : 'locked');
    wrap.dataset.id = card.id;

    const face = document.createElement('div');
    face.className = 'box-face';
    face.style.backgroundImage = `url("${card.isGold ? ASSETS.BOX_GOLD : ASSETS.BOX_PLAIN}")`;

    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = card.id;
    face.appendChild(num);
    wrap.appendChild(face);

    if(isUnlockedCard){
      wrap.addEventListener('click', () => openCard(card, wrap));
    }
    cardGrid.appendChild(wrap);
  });
}

/* ============================================================
   MODAL / CARD OPEN
============================================================ */
const modalOverlay = document.getElementById('modalOverlay');
const modalCard = document.getElementById('modalCard');
const modalNumber = document.getElementById('modalNumber');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalDate = document.getElementById('modalDate');
const modalClose = document.getElementById('modalClose');

function openCard(card, cardEl){
  if(cardEl.classList.contains('opening')) return;
  playPop();
  const rect = cardEl.getBoundingClientRect();
  spawnConfetti('burst', rect.left+rect.width/2, rect.top+rect.height/2, 50);
  cardEl.classList.add('opening');

  setTimeout(()=>{
    modalNumber.textContent = `#${card.id}`;
    modalTitle.textContent = card.title;
    modalDesc.textContent = card.description;
    modalDate.textContent = formatUnlockDate(getUnlockDate(card.id));
    if(card.image){
      modalImage.src = card.image;
      modalImage.classList.remove('hidden');
    } else {
      modalImage.classList.add('hidden');
    }
    modalOverlay.classList.remove('hidden');
    requestAnimationFrame(()=> modalOverlay.classList.add('show'));
  }, 400);
}

function closeModal(){
  playClick();
  modalOverlay.classList.remove('show');
  setTimeout(()=> modalOverlay.classList.add('hidden'), 250);
  // allow re-opening the same unlocked card again this session
  const openEl = cardGrid.querySelector(`.goal-card[data-id="${chosenGoalId}"]`);
  if(openEl) openEl.classList.remove('opening');
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e)=>{ if(e.target === modalOverlay) closeModal(); });

})();
