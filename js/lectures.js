// ── Init Supabase ──────────────────────────────
// const { createClient } = supabase;
// const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

// // ── Get PHP session user via cookie/localStorage trick ──
// // Since PHP sets the session, we read the email from a meta tag (see step 4)
// const sessionEmail = document.querySelector('meta[name="user-email"]')?.content || '';
// const sessionUserId = document.querySelector('meta[name="user-id"]')?.content || '';

// const navAuthButtons = document.getElementById('navAuthButtons');
// const navUserBadge   = document.getElementById('navUserBadge');
// const userAvatar     = document.getElementById('userAvatar');
// const userEmailEl    = document.getElementById('userEmailEl');
// const logoutBtn      = document.getElementById('logoutBtn');
// const mainContent    = document.getElementById('mainContent');
// const notLoggedIn    = document.getElementById('notLoggedIn');
// const listContainer  = document.getElementById('lectureListContainer');

// ── Form Search ────────────────────────────────
var lectureSearchForm  = document.getElementById('lectureSearchForm');
var lectureSearchInput = document.getElementById('lectureSearchInput');
var allLectures = [];
const urlParams = new URLSearchParams(window.location.search);
const initialQuery = urlParams.get('q') || '';
if (initialQuery && lectureSearchInput) {
  lectureSearchInput.value = initialQuery;
}

// ── Init Supabase ──────────────────────────────
var { createClient } = supabase;
var sb = createClient(SUPABASE_URL, SUPABASE_ANON);
var sbAccessToken  = document.querySelector('meta[name="sb-access-token"]')?.content || '';
var sbRefreshToken = document.querySelector('meta[name="sb-refresh-token"]')?.content || '';

// ── Get PHP session user via cookie/localStorage trick ──
var sessionEmail = document.querySelector('meta[name="user-email"]')?.content || '';
var sessionUserId = document.querySelector('meta[name="user-id"]')?.content || '';

var logoutBtn      = document.getElementById('logoutBtn');
var mainContent    = document.getElementById('mainContent');
var notLoggedIn    = document.getElementById('notLoggedIn');
var listContainer  = document.getElementById('lectureListContainer');

(async () => {
  const { data: { session: existingSession } } = await sb.auth.getSession();
  if (!existingSession && sbAccessToken && sbRefreshToken) {    
    const { error: sessionErr } = await sb.auth.setSession({
      access_token: sbAccessToken,
      refresh_token: sbRefreshToken
    });
    if (sessionErr) console.error('setSession failed:', sessionErr.message);
  }

  if (sessionEmail) {
    mainContent.style.display = 'block';
    notLoggedIn.style.display = 'none';
    loadLectures(sessionEmail);
  } else {
    mainContent.style.display = 'none';
    notLoggedIn.style.display = 'block';
  }
})();

// ── Search-wiring
if (lectureSearchForm) {
  lectureSearchForm.addEventListener('submit', e => e.preventDefault());
}
if (lectureSearchInput) {
  lectureSearchInput.addEventListener('input', () => {
    const q = lectureSearchInput.value.trim().toLowerCase();
    if (!q) { renderLectureList(allLectures); return; }
    const filtered = allLectures.filter(lec => (lec.title || '').toLowerCase().includes(q));
    renderLectureList(filtered);
  });
}

// ── Load this user's lectures from Supabase ────
async function loadLectures(userEmail) {
listContainer.innerHTML = '<div style="padding:24px;text-align:center"><div class="spinner"></div></div>';
const { data, error } = await sb
    .from('lectures')
    .select('*')
    .eq('user_email', userEmail)
    .order('created_at', { ascending: false });

listContainer.innerHTML = '';
if (error) {
    listContainer.innerHTML = `<p style="color:red;padding:16px">Error: ${error.message}</p>`;
    return;
}
// In loadLectures(), after allLectures = data || []; and before/instead of renderLectureList(allLectures):
allLectures = data || [];
if (initialQuery) {
  const filtered = allLectures.filter(lec => (lec.title || '').toLowerCase().includes(initialQuery.toLowerCase()));
  renderLectureList(filtered);
} else {
  renderLectureList(allLectures);
}
}

// ── Override submitUpload to save to DB with email ──
// This overrides the one in modal.js
// Registered once at top level (not inside loadLectures) so it never stacks duplicate listeners.
document.getElementById('submitUpload').addEventListener('click', async () => {
if (!selectedFile || !sessionEmail) return;
const title = lectureTitleEl.value.trim();
const ext   = selectedFile.name.split('.').pop();
const path  = `${sessionEmail.replace('@','_')}/${Date.now()}_${title.replace(/\s+/g,'_')}.${ext}`;

setUploading(true);
try {
    await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
        const pct = Math.round(e.loaded / e.total * 100);
        progressFill.style.width = pct + '%';
        progressLabel.textContent = `Uploading… ${pct}%`;
        }
    };
    xhr.onload = () => xhr.status < 300 ? resolve() : reject(new Error(JSON.parse(xhr.responseText).message || 'Upload failed'));
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(selectedFile);
    });

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;

    const { data: inserted, error: dbErr } = await sb.from('lectures').insert({
    user_email: sessionEmail,
    title,
    url: publicUrl,
    file_size: selectedFile.size,
    storage_path: path
    }).select().single();

    if (dbErr) throw new Error(dbErr.message);
    allLectures.unshift(inserted);
    const emptyState = listContainer.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    addLectureCard(inserted.title, inserted.url, inserted.file_size, inserted.id, false);
    updateLastCard();
    showToast(`✓ "${title}" successfully uploaded!`, 'success');
    closeModal();
} catch (err) {
    showToast(`Error: ${err.message}`, 'error');
} finally {
    setUploading(false);
}
});

function addLectureCard(title, url, size, id, isLast) {
const card = document.createElement('div');
card.className = 'lecture-card' + (isLast ? ' last' : '');
card.dataset.id = id;
card.innerHTML = `
    <div class="lecture-card__icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5925DC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
    </div>
    <div class="lecture-card__info">
    <p class="lecture-card__title">${escapeHtml(title)}</p>
    <p class="lecture-card__meta">${formatBytes(size)}</p>
    </div>
    <button class="lecture-card__play" title="Play">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
    </button>`;
card.querySelector('.lecture-card__play').addEventListener('click', function() { playAudio(url, this); });
listContainer.prepend(card);
}

function updateLastCard() {
document.querySelectorAll('.lecture-card').forEach(c => c.classList.remove('last'));
const cards = listContainer.querySelectorAll('.lecture-card');
if (cards.length) cards[cards.length - 1].classList.add('last');
}

function renderLectureList(list) {
  listContainer.innerHTML = '';
  if (!list || list.length === 0) {
    listContainer.innerHTML = '<div class="empty-state">No files added. Please add the first one!</div>';
    return;
  }
  list.forEach(lec => {
    addLectureCard(lec.title, lec.url, lec.file_size, lec.id, false);
  });
  updateLastCard();
}