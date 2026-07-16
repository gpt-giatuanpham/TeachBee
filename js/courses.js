const sb          = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
window.sb = sb;
const userEmail   = document.querySelector('meta[name="user-email"]').content;
const sbAccessToken  = document.querySelector('meta[name="sb-access-token"]')?.content || '';
const sbRefreshToken = document.querySelector('meta[name="sb-refresh-token"]')?.content || '';

const { data: { session: existingSession } } = await sb.auth.getSession();
if (!existingSession && sbAccessToken && sbRefreshToken) {
  const { error: sessionErr } = await sb.auth.setSession({
    access_token: sbAccessToken,
    refresh_token: sbRefreshToken
  });
  if (sessionErr) console.error('setSession failed:', sessionErr.message);
}

// ── DOM refs ──────────────────────────────────────────
const lecture__list          = document.getElementById('lecture__list');
const detailView        = document.getElementById('detailView');
const playlistGrid      = document.getElementById('playlistGrid');
const gtEmpty           = document.getElementById('gtEmpty');
const createModalOverlay= document.getElementById('createModalOverlay');
const openCreateBtn     = document.getElementById('openCreateModal');
const closeCreateBtn    = document.getElementById('closeCreateModal');
const cancelCreateBtn   = document.getElementById('cancelCreateModal');
const savePlaylistBtn   = document.getElementById('savePlaylist');
const playlistTitleEl   = document.getElementById('playlistTitle');
const playlistNoteEl    = document.getElementById('playlistNote');
const lecturePicker     = document.getElementById('lecturePicker');
const toastStack        = document.getElementById('toastStack');
const backBtn           = document.getElementById('backBtn');
const detailTitle       = document.getElementById('detailTitle');
const detailCount       = document.getElementById('detailCount');
const trackListEl       = document.getElementById('trackList');
const gtPlayer          = document.getElementById('gtPlayer');
const playerTitle       = document.getElementById('playerTitle');
const playerFill        = document.getElementById('playerFill');
const playerCurrent     = document.getElementById('playerCurrent');
const playerDuration    = document.getElementById('playerDuration');
const playerProgress    = document.getElementById('playerProgress');
const playPauseBtn      = document.getElementById('playPauseBtn');
const playIcon          = document.getElementById('playIcon');
const pauseIcon         = document.getElementById('pauseIcon');
const prevBtn           = document.getElementById('prevBtn');
const nextBtn           = document.getElementById('nextBtn');
const nextLabel         = document.getElementById('nextLabel');
const nextTitleEl       = document.getElementById('nextTitle');
const btnlecture__list       = document.getElementById('btnlecture__list');
const btnGridView       = document.getElementById('btnGridView');
const playlistSearchForm  = document.getElementById('playlistSearchForm');
const playlistSearchInput = document.getElementById('playlistSearchInput'); 

// ── Get the logged-in user ────────────────────────────
const {
  data: { user }
} = await sb.auth.getUser();

// ── State ─────────────────────────────────────────────
var allLectures   = [];
var alllecture__list  = [];
var currentTracks = [];
var currentIdx    = -1;
var audio         = new Audio();
var isPlaying     = false;
var currentView   = 'list'; // 'list' | 'grid'

// ── Init ──────────────────────────────────────────────
(async function init() {
  await Promise.all([loadLectures(), loadlecture__list()]);
})();

// ── Load lectures ─────────────────────────────────────
async function loadLectures() {
  const { data, error } = await sb.from('lectures').select('*').eq('user_email', userEmail).order('created_at', { ascending: false });
  if (error) { showToast('Audio loading error: ' + error.message, 'error'); return; }
  allLectures = data || [];
}

// ── Load lecture__list ────────────────────────────────────
async function loadlecture__list() {
  const { data, error } = await sb.from('playlists').select('*, playlist_lectures(lecture_id, position, lectures(id, title, url, file_size))').eq('user_email', userEmail).order('created_at', { ascending: false });
  if (error) { showToast('Course loading error: ' + error.message, 'error'); return; }
  alllecture__list = data || [];
  renderlecture__list();
}

// ── Render playlist grid ──────────────────────────────
function renderlecture__list(listToRender) {
  const list = listToRender || alllecture__list;

  // Remove existing cards (not the empty state)
  Array.from(playlistGrid.children).forEach(c => { if (c !== gtEmpty) c.remove(); });

  if (alllecture__list.length === 0) {
    gtEmpty.style.display = 'block';
    return;
  }
  gtEmpty.style.display = 'none';

  list.forEach(pl => {
    const count = pl.playlist_lectures ? pl.playlist_lectures.length : 0;
    const card  = document.createElement('div');
    card.className = 'gt-card';
    card.innerHTML = `
      <div class="gt-card__thumb">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
      </div>
      <div class="gt-card__body">
        <div class="gt-card__info" style="flex:1">
          <p class="gt-card__title">${escHtml(pl.title)}</p>
          <div class="gt-card__meta">
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:3px"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              ${count} lecture(s)
            </span>
          </div>
        </div>
        <button class="gt-card__play" title="Play">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </button>
      </div>`;

    // click card body → open detail
    card.querySelector('.gt-card__info').addEventListener('click', () => openDetail(pl));
    card.querySelector('.gt-card__thumb').addEventListener('click', () => openDetail(pl));
    // click play → open detail and auto-play
    card.querySelector('.gt-card__play').addEventListener('click', (e) => {
      e.stopPropagation();
      openDetail(pl, true);
    });

    playlistGrid.appendChild(card);
  });
}

// ── Search / filter playlists ─────────────────────────
if (playlistSearchForm) {
  playlistSearchForm.addEventListener('submit', e => e.preventDefault()); // don't reload the page on Enter
}
if (playlistSearchInput) {
  playlistSearchInput.addEventListener('input', () => {
    const q = playlistSearchInput.value.trim().toLowerCase();
    if (!q) { renderlecture__list(); return; }
    const filtered = alllecture__list.filter(pl => (pl.title || '').toLowerCase().includes(q));
    renderlecture__list(filtered);
  });
}

// ── View toggle ───────────────────────────────────────
btnlecture__list.addEventListener('click', () => {
  currentView = 'list';
  playlistGrid.classList.add('list-view');
  btnlecture__list.classList.add('active');
  btnGridView.classList.remove('active');
});
btnGridView.addEventListener('click', () => {
  currentView = 'grid';
  playlistGrid.classList.remove('list-view');
  btnGridView.classList.add('active');
  btnlecture__list.classList.remove('active');
});

// ── Detail view ───────────────────────────────────────
function openDetail(pl, autoPlay = false) {
  lecture__list.style.display = 'none';
  detailView.style.display = 'block';
  detailTitle.textContent = pl.title;

  // Sort tracks by position
  const tracks = (pl.playlist_lectures || [])
    .sort((a, b) => a.position - b.position)
    .map(r => r.lectures)
    .filter(Boolean);

  currentTracks = tracks;
  detailCount.textContent = tracks.length + ' lecture(s)';

  renderTrackList();
  stopAudio();
  gtPlayer.style.display = 'none';

  if (autoPlay && tracks.length > 0) {
    setTimeout(() => playTrack(0), 100);
  }
}

backBtn.addEventListener('click', () => {
  stopAudio();
  detailView.style.display = 'none';
  lecture__list.style.display = 'block';
});

// ── Track list rendering ──────────────────────────────
function renderTrackList() {
  trackListEl.innerHTML = '';
  if (currentTracks.length === 0) {
    trackListEl.innerHTML = '<div class="gt-empty"><p>This course has no lectures yet.</p></div>';
    return;
  }
  currentTracks.forEach((lec, i) => {
    const row = document.createElement('div');
    row.className = 'gt-track' + (i === currentIdx ? ' active' : '');
    row.id = 'track-' + i;
    row.innerHTML = `
      <div class="gt-track__num">
        <span class="num">${String(i+1).padStart(2,'0')}</span>
        <span class="dur">${fmtBytes(lec.file_size)}</span>
      </div>
      <div class="gt-track__info">
        <p class="gt-track__title">${escHtml(lec.title)}</p>
      </div>
      <button class="gt-track__play" title="Phát">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>`;
    row.addEventListener('click', () => playTrack(i));
    trackListEl.appendChild(row);
  });
}

// ── Audio player ──────────────────────────────────────
function playTrack(idx) {
  if (idx < 0 || idx >= currentTracks.length) return;
  const lec = currentTracks[idx];
  currentIdx = idx;

  audio.pause();
  audio.src = lec.url;
  audio.load();
  audio.play();
  isPlaying = true;

  gtPlayer.style.display = 'block';
  playerTitle.textContent = lec.title;
  showPause();

  // next label
  const next = currentTracks[idx + 1];
  if (next) { nextLabel.style.display='block'; nextTitleEl.textContent = next.title; }
  else       { nextLabel.style.display='none'; }

  // highlight active track
  document.querySelectorAll('.gt-track').forEach((r, i) => {
    r.classList.toggle('active', i === idx);
  });
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  playerFill.style.width = pct + '%';
  playerCurrent.textContent = fmtTime(audio.currentTime);
});
audio.addEventListener('loadedmetadata', () => {
  playerDuration.textContent = fmtTime(audio.duration);
});
audio.addEventListener('ended', () => {
  if (currentIdx + 1 < currentTracks.length) playTrack(currentIdx + 1);
  else { isPlaying = false; showPlay(); }
});

playPauseBtn.addEventListener('click', () => {
  if (currentIdx < 0 && currentTracks.length > 0) { playTrack(0); return; }
  if (isPlaying) { audio.pause(); isPlaying = false; showPlay(); }
  else           { audio.play();  isPlaying = true;  showPause(); }
});

prevBtn.addEventListener('click', () => { if (currentIdx > 0) playTrack(currentIdx - 1); });
nextBtn.addEventListener('click', () => { if (currentIdx < currentTracks.length - 1) playTrack(currentIdx + 1); });

playerProgress.addEventListener('click', e => {
  const rect = playerProgress.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
});

function showPlay()  { playIcon.style.display=''; pauseIcon.style.display='none'; }
function showPause() { playIcon.style.display='none'; pauseIcon.style.display=''; }
function stopAudio() { audio.pause(); audio.src=''; isPlaying=false; currentIdx=-1; showPlay(); }

// ── Create playlist modal ─────────────────────────────
openCreateBtn.addEventListener('click', () => {
  populatePicker();
  createModalOverlay.classList.add('active');
});
const closeCreateModal = () => { createModalOverlay.classList.remove('active'); resetCreateForm(); };
closeCreateBtn.addEventListener('click', closeCreateModal);
cancelCreateBtn.addEventListener('click', closeCreateModal);
createModalOverlay.addEventListener('click', e => { if (e.target === createModalOverlay) closeCreateModal(); });

playlistTitleEl.addEventListener('input', checkSaveReady);
function checkSaveReady() {
  savePlaylistBtn.disabled = !playlistTitleEl.value.trim();
}

function populatePicker() {
  lecturePicker.innerHTML = '';
  if (allLectures.length === 0) {
    lecturePicker.innerHTML = '<div class="gt-picker-empty">You have no lectures here. Please upload the first one!</div>';
    return;
  }
  allLectures.forEach(lec => {
    const item = document.createElement('div');
    item.className = 'gt-picker-item';
    const cbId = 'cb-' + lec.id;
    item.innerHTML = `
      <input type="checkbox" id="${cbId}" value="${lec.id}">
      <label for="${cbId}">${escHtml(lec.title)} <span style="color:#9ca3af;font-size:.7rem">(${fmtBytes(lec.file_size)})</span></label>`;
    lecturePicker.appendChild(item);
  });
}

function resetCreateForm() {
  playlistTitleEl.value = '';
  playlistNoteEl.value  = '';
  lecturePicker.innerHTML = '';
  savePlaylistBtn.disabled = true;
}

savePlaylistBtn.addEventListener('click', async () => {
  const title = playlistTitleEl.value.trim();
  const note  = playlistNoteEl.value.trim();
  if (!title) return;

  const checked = Array.from(lecturePicker.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);

  savePlaylistBtn.disabled = true;
  savePlaylistBtn.textContent = 'Saving…';

  try {
    // 1) Insert playlist
    const { data: pl, error: plErr } = await sb.from('playlists').insert({
      user_email: userEmail,
      title,
      note: note || null
    }).select().single();
    if (plErr) throw new Error(plErr.message);

    // 2) Insert junction rows
    if (checked.length > 0) {
      const rows = checked.map((lid, i) => ({ playlist_id: pl.id, lecture_id: lid, position: i + 1 }));
      const { error: jErr } = await sb.from('playlist_lectures').insert(rows);
      if (jErr) throw new Error(jErr.message);
    }

    showToast(`✓ Playlist "${title}" has successfully been saved!`, 'success');
    closeCreateModal();
    await loadlecture__list();
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    savePlaylistBtn.disabled = false;
    savePlaylistBtn.textContent = 'Save';
  }
});

// ── Helpers ───────────────────────────────────────────
function fmtBytes(b) { if (!b) return ''; if (b < 1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB'; }
function fmtTime(s)  { if (!s || isNaN(s)) return '0:00'; const m=Math.floor(s/60); return m+':'+(Math.floor(s%60)+'').padStart(2,'0'); }
function escHtml(s)  { return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function showToast(msg, type='success') {
  const el = document.createElement('div');
  el.className = 'toast-msg ' + type;
  el.textContent = msg;
  toastStack.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}