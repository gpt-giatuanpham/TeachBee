// ── DOM refs ──────────────────────────────────
    var overlay        = document.getElementById('uploadModalOverlay');
    var openBtn        = document.getElementById('openUploadModal');
    var closeBtn       = document.getElementById('closeUploadModal');
    var cancelBtn      = document.getElementById('cancelUpload');
    var submitBtn      = document.getElementById('submitUpload');
    var dropZone       = document.getElementById('dropZone');
    var browseLink     = document.getElementById('browseLink');
    var fileInput      = document.getElementById('audioFileInput');
    var filePreview    = document.getElementById('filePreview');
    var fileNameEl     = document.getElementById('fileName');
    var fileSizeEl     = document.getElementById('fileSize');
    var removeFileBtn  = document.getElementById('removeFile');
    var lectureTitleEl = document.getElementById('lectureTitle');
    var progressWrap   = document.getElementById('progressWrap');
    var progressFill   = document.getElementById('progressFill');
    var progressLabel  = document.getElementById('progressLabel');
    var listContainer  = document.getElementById('lectureListContainer');
    var toastStack     = document.getElementById('toastStack');

    var selectedFile = null;

    // ── Modal open / close ────────────────────────
    openBtn.addEventListener('click', () => overlay.classList.add('active'));
    var closeModal = () => {
      overlay.classList.remove('active');
      resetForm();
    };
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

    // ── File selection ────────────────────────────
    browseLink.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click',   () => fileInput.click());

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    // Drag & drop
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) handleFile(file);
      else showToast('Vui lòng chọn tệp âm thanh hợp lệ.', 'error');
    });

    function handleFile(file) {
      const maxMB = 50;
      if (file.size > maxMB * 1024 * 1024) {
        showToast(`Tệp quá lớn. Tối đa ${maxMB} MB.`, 'error');
        return;
      }
      selectedFile = file;
      fileNameEl.textContent  = file.name;
      fileSizeEl.textContent  = formatBytes(file.size);
      filePreview.classList.add('active');
      // Pre-fill title from filename
      if (!lectureTitleEl.value) {
        lectureTitleEl.value = file.name.replace(/\.[^/.]+$/, '');
      }
      checkReady();
    }

    removeFileBtn.addEventListener('click', () => {
      selectedFile = null;
      fileInput.value = '';
      filePreview.classList.remove('active');
      checkReady();
    });

    lectureTitleEl.addEventListener('input', checkReady);

    function checkReady() {
      submitBtn.disabled = !(selectedFile && lectureTitleEl.value.trim());
    }

    // ── Upload to Supabase ────────────────────────
    // submitBtn.addEventListener('click', async () => {
    //   if (!selectedFile) return;

    //   const title    = lectureTitleEl.value.trim();
    //   const ext      = selectedFile.name.split('.').pop();
    //   // Unique filename to avoid collisions
    //   const safeName = `${Date.now()}_${title.replace(/\s+/g, '_')}.${ext}`;
    //   const path     = safeName;

    //   setUploading(true);

    //   try {
    //     // ── Upload file to Supabase Storage ──────
    //     const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${path}`;

    //     // Use XMLHttpRequest for upload progress tracking
    //     await new Promise((resolve, reject) => {
    //       const xhr = new XMLHttpRequest();
    //       xhr.open('POST', uploadUrl);
    //       xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON}`);
    //       xhr.setRequestHeader('x-upsert', 'false');

    //       xhr.upload.onprogress = (e) => {
    //         if (e.lengthComputable) {
    //           const pct = Math.round((e.loaded / e.total) * 100);
    //           progressFill.style.width = pct + '%';
    //           progressLabel.textContent = `Đang tải lên… ${pct}%`;
    //         }
    //       };
    //       xhr.onload = () => {
    //         if (xhr.status >= 200 && xhr.status < 300) resolve();
    //         else {
    //           try {
    //             const err = JSON.parse(xhr.responseText);
    //             reject(new Error(err.message || 'Upload thất bại'));
    //           } catch {
    //             reject(new Error('Upload thất bại'));
    //           }
    //         }
    //       };
    //       xhr.onerror = () => reject(new Error('Lỗi mạng'));
    //       xhr.send(selectedFile);
    //     });

    //     // ── Build public URL ──────────────────────
    //     const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;

    //     // ── (Optional) Save metadata to Supabase DB ──
    //     // If you have a "lectures" table with columns: title, url, created_at
    //     // uncomment the block below:
    //     /*
    //     await fetch(`${SUPABASE_URL}/rest/v1/lectures`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${SUPABASE_ANON}`,
    //         'apikey': SUPABASE_ANON,
    //         'Prefer': 'return=minimal'
    //       },
    //       body: JSON.stringify({ title, url: publicUrl })
    //     });
    //     */

    //     // ── Add card to lecture list ──────────────
    //     addLectureCard(title, publicUrl, selectedFile.size);

    //     showToast(`✓ "${title}" đã được tải lên thành công!`, 'success');
    //     closeModal();

    //   } catch (err) {
    //     showToast(`Lỗi: ${err.message}`, 'error');
    //   } finally {
    //     setUploading(false);
    //   }
    // });

    // ── UI helpers ────────────────────────────────
    function setUploading(active) {
      submitBtn.disabled     = active;
      cancelBtn.disabled     = active;
      progressWrap.classList.toggle('active', active);
      if (!active) {
        progressFill.style.width = '0%';
        progressLabel.textContent = 'Đang tải lên… 0%';
      }
    }

    function resetForm() {
      selectedFile = null;
      fileInput.value = '';
      lectureTitleEl.value = '';
      filePreview.classList.remove('active');
      progressWrap.classList.remove('active');
      progressFill.style.width = '0%';
      submitBtn.disabled = true;
    }

    // function addLectureCard(title, url, size) {
    //   const card = document.createElement('div');
    //   // Remove 'last' from previous last card
    //   const prev = document.querySelector('.lecture-card.last');
    //   if (prev) prev.classList.remove('last');

    //   card.className = 'lecture-card';
    //   card.innerHTML = `
    //     <div class="lecture-card__icon">
    //       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5925DC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //         <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    //       </svg>
    //     </div>
    //     <div class="lecture-card__info">
    //       <p class="lecture-card__title">${escapeHtml(title)}</p>
    //       <p class="lecture-card__meta">${formatBytes(size)} · Vừa tải lên</p>
    //     </div>
    //     <button class="lecture-card__play" onclick="playAudio('${url}', this)" title="Phát">
    //       <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    //         <polygon points="5 3 19 12 5 21 5 3"/>
    //       </svg>
    //     </button>
    //   `;
    //   listContainer.prepend(card);
    //   document.querySelectorAll('.lecture-card').forEach(c => c.classList.remove('last'));
    //   listContainer.lastElementChild.classList.add('last');
    // }

    var currentAudio = null;
    var currentBtn   = null;

    function playIconSVG() {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
    }
    function pauseIconSVG() {
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
    }

    function playAudio(url, btn) {
      // Clicking the button that's already loaded → toggle pause/resume
      if (currentAudio && currentBtn === btn) {
        if (currentAudio.paused) {
          currentAudio.play()
            .then(() => { btn.innerHTML = pauseIconSVG(); })
            .catch(err => showToast('Không phát được: ' + err.message, 'error'));
        } else {
          currentAudio.pause();
          btn.innerHTML = playIconSVG();
        }
        return;
      }

      // Switching to a different track: stop the old one and reset its icon
      if (currentAudio) {
        currentAudio.pause();
        if (currentBtn) currentBtn.innerHTML = playIconSVG();
      }

      const audio = new Audio(url);
      currentAudio = audio;
      currentBtn   = btn;

      audio.play()
        .then(() => { btn.innerHTML = pauseIconSVG(); })
        .catch(err => {
          showToast('Không phát được âm thanh: ' + err.message, 'error');
          btn.innerHTML = playIconSVG();
          currentAudio = null;
          currentBtn = null;
        });

      audio.addEventListener('error', () => {
        showToast('Lỗi tải file âm thanh. Kiểm tra bucket Storage có để Public không.', 'error');
        btn.innerHTML = playIconSVG();
        currentAudio = null;
        currentBtn = null;
      });

      audio.onended = () => {
        btn.innerHTML = playIconSVG();
        currentAudio = null;
        currentBtn = null;
      };
    }

    function showToast(msg, type = 'success') {
      const el = document.createElement('div');
      el.className = `toast-msg ${type}`;
      el.textContent = msg;
      toastStack.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }

    function formatBytes(bytes) {
      if (bytes < 1024)       return bytes + ' B';
      if (bytes < 1048576)    return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1048576).toFixed(1) + ' MB';
    }

    function escapeHtml(str) {
      return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }