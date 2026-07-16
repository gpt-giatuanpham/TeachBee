function showForm(formId) {
  document.querySelectorAll(".disappear").forEach(form => form.classList.remove("active"));
  document.getElementById(formId).classList.add("active");
}

const hash = window.location.hash.replace("#", ""); // e.g. "login-form"
if (hash === "login-form" || hash === "register-form") {
  showForm(hash);
}

const landingSearchForm = document.getElementById('landingSearchForm');
const landingSearchInput = document.getElementById('landingSearchInput');

if (landingSearchForm) {
  landingSearchForm.addEventListener('submit', e => {
    e.preventDefault();
    const q = landingSearchInput.value.trim();
    if (!q) return;
    window.location.href = `baiGiang.php?q=${encodeURIComponent(q)}`;
  });
}