<?php
session_start();
$userEmail = $_SESSION['email'] ?? '';
$userName  = $_SESSION['name']  ?? '';
if (empty($userEmail)) {
  header("Location: ../pages/register.php");
  exit();
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="user-email" content="<?= htmlspecialchars($userEmail) ?>">
  <meta name="sb-access-token" content="<?= htmlspecialchars($_SESSION['sb_access_token'] ?? '') ?>">
  <meta name="sb-refresh-token" content="<?= htmlspecialchars($_SESSION['sb_refresh_token'] ?? '') ?>">
  <title>Courses</title>
  <!-- bootstap -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
  <!-- css -->
  <link rel="stylesheet" href="../css/main.css">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
</head>

<body>
  <!-- Supabase config -->
  <script>
    const SUPABASE_URL    = 'https://yaboliqdctpkagaboquk.supabase.co';   // ← replace
    const SUPABASE_ANON   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYm9saXFkY3Rwa2FnYWJvcXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzUzOTYsImV4cCI6MjA5NzY1MTM5Nn0.-D4J2k2POkrnkjthOrEz6zefFigFaQDLnySRHjm9g_s';                  // ← replace
    const BUCKET_NAME     = 'audio_bai_giang';                           // ← your bucket name
  </script>
  <!-- Small screen warning modal -->
  <div class="overTake hidden">
    <div id="screenGuardBox" class="screenGuard-box">
      <div class="modal__icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      </div>
      <h1>Sorry for the inconvenience</h1>
      <p>
        Please switch to a computer or laptop screen size
        for the best experience!
      </p>
    </div>
  </div>
  <!-- Header -->
  <header>
    <nav class="navbar myNavbar navbar-expand-md">
      <div class="container-fluid d-block px-0">
        <div class="row">
          <div class="d-md-none col-3 col-sm-2 d-flex justify-content-center align-items-center">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
              aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
          <div class="col-6 col-sm-8 col-md-8 col-lg-9 col-xl-7 py-2">
            <div class="myNavbar__left">
              <a class="navbar-brand" href="#">
                Teach<span>Bee</span>
              </a>
              <div class="myNavbar__Categories">
                <a class="nav-link" href="user_page.php">Home</a>
              </div>
              <form class="myNavbar__FormSearch1" id="playlistSearchForm">
                <div class="input-group">
                  <input type="text" id="playlistSearchInput" class="form-control" placeholder="Search" />
                  <span class="input-group-text" id="basic-addon2">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </span>
                </div>
              </form>
            </div>
          </div>
          <div class="col-3 col-sm-2 col-md-4 col-lg-3 col-xl-5 ps-0">
            <div class="myNavbar__right">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item business">
                  <a class="nav-link" aria-current="page" href="#">Courses</a>
                </li>
                <li class="nav-item instructor">
                  <a class="nav-link" href="baiGiang.php">Lectures</a>
                </li>
                <li class="nav-item myNavbar__button">
                  <?php if (!empty($userEmail)): ?>
                    <a class="button button--white me-1 text-decoration-none">Welcome, <span><?= $_SESSION['name']; ?></span></a>
                    <a class="button button--red text-decoration-none" onclick="window.location.href='logout.php'" style="cursor:pointer;">Log out</a>
                  <?php else: ?>
                    <a href="../pages/register.php" class="button button--white me-1 text-decoration-none">Log in</a>
                    <a href="../pages/register.php" class="button button--red text-decoration-none">Sign up</a>
                  <?php endif; ?>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>

  <main>
    <div class="container gt-page">

      <!-- ── LIST VIEW ── -->
      <div id="lecture__list">
        <section class="create__lecture">
          <div class="container">
            <div class="create__lecture__content">
              <div class="create__lecture__btn d-flex align-items-center column-gap-2" id="openCreateModal" style="cursor: pointer;">
                <div class="create__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path
                      d="M32.9167 18.3333H20.8333V6.25C20.8333 5.55964 20.2737 5 19.5833 5C18.893 5 18.3333 5.55964 18.3333 6.25V18.3333H6.25C5.55964 18.3333 5 18.893 5 19.5833C5 20.2737 5.55964 20.8333 6.25 20.8333H18.3333V32.9167C18.3333 33.607 18.893 34.1667 19.5833 34.1667C20.2737 34.1667 20.8333 33.607 20.8333 32.9167V20.8333H32.9167C33.607 20.8333 34.1667 20.2737 34.1667 19.5833C34.1667 18.893 33.607 18.3333 32.9167 18.3333Z"
                      fill="#5925DC" />
                  </svg>
                </div>
                <p class="createLectureTitle" href="#">Create new courses here</p>
              </div>
            </div>
          </div>
        </section>
        <div class="gt-header">
          <h4>Your courses</h4>
          <div class="gt-view-toggle">
            <button class="gt-view-btn active" id="btnlecture__list" title="Danh sách">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <button class="gt-view-btn" id="btnGridView" title="Lưới">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
          </div>
        </div>

        <div class="gt-grid list-view" id="playlistGrid">
          <div class="gt-empty" id="gtEmpty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <p>No courses yet.<br>Let's create the first one!</p>
          </div>
        </div>
      </div>

      <!-- ── DETAIL VIEW ── -->
      <div id="detailView">
        <button class="gt-detail-back" id="backBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <div class="gt-detail-header">
          <div class="gt-detail-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5925DC" stroke-width="1.8"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <div>
            <p class="gt-detail-title" id="detailTitle">—</p>
            <div class="gt-detail-meta">
              <span id="detailCount">0 lectures</span>
            </div>
          </div>
        </div>

        <!-- Audio player -->
        <div class="gt-player" id="gtPlayer" style="display:none;">
          <p class="gt-player__label">Playing</p>
          <p class="gt-player__title" id="playerTitle">—</p>
          <div class="gt-player__bar">
            <span class="gt-player__time" id="playerCurrent">0:00</span>
            <div class="gt-player__progress" id="playerProgress">
              <div class="gt-player__fill" id="playerFill"></div>
            </div>
            <span class="gt-player__time" style="text-align:right" id="playerDuration">0:00</span>
          </div>
          <div class="gt-player__controls">
            <button class="gt-ctrl-btn" id="prevBtn" title="Trước">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" stroke-width="2"/></svg>
            </button>
            <button class="gt-ctrl-play" id="playPauseBtn">
              <svg id="playIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <svg id="pauseIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <button class="gt-ctrl-btn" id="nextBtn" title="Tiếp theo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" stroke-width="2"/></svg>
            </button>
          </div>
          <p class="gt-next-label" id="nextLabel" style="display:none;">Next: <span id="nextTitle">—</span></p>
        </div>

        <p class="gt-tracklist-header">Playlist</p>
        <div id="trackList"></div>
      </div>

    </div>
  </main>

  <!-- ── CREATE PLAYLIST MODAL ── -->
  <div class="gt-modal-overlay" id="createModalOverlay">
    <div class="gt-modal">
      <button class="gt-modal__close" id="closeCreateModal">&times;</button>
      <h5>Create new playlist</h5>
      <p class="sub">Give this a name and choose suitable lectures for this playlist.</p>

      <label for="playlistTitle">Title</label>
      <input type="text" id="playlistTitle" placeholder="Your playlist title">

      <label for="playlistNote">Note</label>
      <textarea id="playlistNote" rows="2" placeholder="Eg. This playlist is for..."></textarea>

      <label>Lecture list</label>
      <div class="gt-picker" id="lecturePicker">
        <div class="gt-picker-empty">Loading lecture files…</div>
      </div>

      <div class="gt-modal__actions">
        <button class="btn-cancel" id="cancelCreateModal">Cancel</button>
        <button class="btn-save" id="savePlaylist" disabled>Save</button>
      </div>
    </div>
  </div>

  <div class="toast-stack" id="toastStack"></div>
  
  <!-- footer -->
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col-4 footer__left">
          <h3>Teach<span>Bee</span></h3>
          <p>Design amazing digital experiences that motivates your working and studying journey.</p>
        </div>
        <div class="col-8 footer__right">
          <div class="row justify-content-around">
            <div class="col-auto">
              <h6>Product</h6>
              <ul class="list-unstyled">
                <li><a href="#" class="text-decoration-none">Overview</a></li>
                <li><a href="#" class="text-decoration-none">Features</a></li>
                <li><a href="#" class="text-decoration-none">Solutions</a></li>
              </ul>
            </div>
            <div class="col-auto">
              <h6>Company</h6>
              <ul class="list-unstyled">
                <li><a href="#" class="text-decoration-none">About us</a></li>
                <li><a href="#" class="text-decoration-none">News</a></li>
                <li><a href="#" class="text-decoration-none">Contact</a></li>
              </ul>
            </div>
            <div class="col-auto">
              <h6>Resources</h6>
              <ul class="list-unstyled">
                <li><a href="#" class="text-decoration-none">Newsletter</a></li>
                <li><a href="#" class="text-decoration-none">Help centre</a></li>
                <li><a href="#" class="text-decoration-none">Tutorials</a></li>
              </ul>
            </div>
            <div class="col-auto">
              <h6>Social</h6>
              <ul class="list-unstyled">
                <li><a href="#" class="text-decoration-none">X</a></li>
                <li><a href="#" class="text-decoration-none">LinkedIn</a></li>
                <li><a href="#" class="text-decoration-none">Facebook</a></li>
              </ul>
            </div>
            <div class="col-auto">
              <h6>Legal</h6>
              <ul class="list-unstyled">
                <li><a href="#" class="text-decoration-none">Terms</a></li>
                <li><a href="#" class="text-decoration-none">Privacy</a></li>
                <li><a href="#" class="text-decoration-none">Cookies</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer__bottom">
      <div class="row">
        <div class="footer__bottomT col-12 col-md-6 d-flex align-items-center">
          <span>&copy; 2026 TeachBee. All rights reserved.</span>
        </div>
        <div class="footer__bottomB col-12 col-md-6">
          <ul class="nav justify-content-end">
            <li class="nav-item">
              <a class="nav-link" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M15.9455 23L10.396 15.0901L3.44886 23H0.509766L9.09209 13.2311L0.509766 1H8.05571L13.286 8.45502L19.8393 1H22.7784L14.5943 10.3165L23.4914 23H15.9455ZM19.2185 20.77H17.2398L4.71811 3.23H6.6971L11.7121 10.2532L12.5793 11.4719L19.2185 20.77Z"
                    fill="#242E36" />
                </svg>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <g clip-path="url(#clip0_35_1555)">
                    <path
                      d="M22.2283 0H1.77167C1.30179 0 0.851161 0.186657 0.518909 0.518909C0.186657 0.851161 0 1.30179 0 1.77167V22.2283C0 22.6982 0.186657 23.1488 0.518909 23.4811C0.851161 23.8133 1.30179 24 1.77167 24H22.2283C22.6982 24 23.1488 23.8133 23.4811 23.4811C23.8133 23.1488 24 22.6982 24 22.2283V1.77167C24 1.30179 23.8133 0.851161 23.4811 0.518909C23.1488 0.186657 22.6982 0 22.2283 0ZM7.15333 20.445H3.545V8.98333H7.15333V20.445ZM5.34667 7.395C4.93736 7.3927 4.53792 7.2692 4.19873 7.04009C3.85955 6.81098 3.59584 6.48653 3.44088 6.10769C3.28591 5.72885 3.24665 5.31259 3.32803 4.91145C3.40941 4.51032 3.6078 4.14228 3.89816 3.85378C4.18851 3.56529 4.55782 3.36927 4.95947 3.29046C5.36112 3.21165 5.77711 3.25359 6.15495 3.41099C6.53279 3.56838 6.85554 3.83417 7.08247 4.17481C7.30939 4.51546 7.43032 4.91569 7.43 5.325C7.43386 5.59903 7.38251 5.87104 7.27901 6.1248C7.17551 6.37857 7.02198 6.6089 6.82757 6.80207C6.63316 6.99523 6.40185 7.14728 6.14742 7.24915C5.893 7.35102 5.62067 7.40062 5.34667 7.395ZM20.4533 20.455H16.8467V14.1933C16.8467 12.3467 16.0617 11.7767 15.0483 11.7767C13.9783 11.7767 12.9283 12.5833 12.9283 14.24V20.455H9.32V8.99167H12.79V10.58H12.8367C13.185 9.875 14.405 8.67 16.2667 8.67C18.28 8.67 20.455 9.865 20.455 13.365L20.4533 20.455Z"
                      fill="#0A66C2" />
                  </g>
                  <defs>
                    <clipPath id="clip0_35_1555">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  fill="none">
                  <g clip-path="url(#clip0_35_1556)">
                    <path
                      d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                      fill="#1877F2" />
                    <path
                      d="M16.6711 15.4688L17.2031 12H13.875V9.75C13.875 8.80102 14.34 7.875 15.8306 7.875H17.3438V4.92188C17.3438 4.92188 15.9705 4.6875 14.6576 4.6875C11.9166 4.6875 10.125 6.34875 10.125 9.35625V12H7.07812V15.4688H10.125V23.8542C11.3674 24.0486 12.6326 24.0486 13.875 23.8542V15.4688H16.6711Z"
                      fill="white" />
                  </g>
                  <defs>
                    <clipPath id="clip0_35_1556">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg></a>
            </li>
            <li class="nav-item">
              <a class="nav-link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                  fill="none">
                  <g clip-path="url(#clip0_35_1557)">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M12 0C5.3724 0 0 5.3808 0 12.0204C0 17.3304 3.438 21.8364 8.2068 23.4252C8.8068 23.5356 9.0252 23.1648 9.0252 22.8456C9.0252 22.5612 9.0156 21.804 9.0096 20.802C5.6712 21.528 4.9668 19.1904 4.9668 19.1904C4.422 17.8008 3.6348 17.4312 3.6348 17.4312C2.5452 16.6872 3.7176 16.7016 3.7176 16.7016C4.9212 16.7856 5.5548 17.94 5.5548 17.94C6.6252 19.776 8.364 19.2456 9.0468 18.9384C9.1572 18.162 9.4668 17.6328 9.81 17.3328C7.146 17.0292 4.344 15.9972 4.344 11.3916C4.344 10.08 4.812 9.006 5.5788 8.166C5.4552 7.8624 5.0436 6.6396 5.6964 4.986C5.6964 4.986 6.7044 4.662 8.9964 6.2172C9.97532 5.95022 10.9853 5.81423 12 5.8128C13.02 5.8176 14.046 5.9508 15.0048 6.2172C17.2956 4.662 18.3012 4.9848 18.3012 4.9848C18.9564 6.6396 18.5436 7.8624 18.4212 8.166C19.1892 9.006 19.6548 10.08 19.6548 11.3916C19.6548 16.0092 16.848 17.0256 14.1756 17.3232C14.6064 17.694 14.9892 18.4272 14.9892 19.5492C14.9892 21.1548 14.9748 22.452 14.9748 22.8456C14.9748 23.1672 15.1908 23.5416 15.8004 23.424C18.19 22.6225 20.2672 21.0904 21.7386 19.0441C23.2099 16.9977 24.001 14.5408 24 12.0204C24 5.3808 18.6264 0 12 0Z"
                      fill="#98A2B3" />
                  </g>
                  <defs>
                    <clipPath id="clip0_35_1557">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg></a>
            </li>
            <li class="nav-item">
              <a class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.7703 10.0969C18.3188 8.56875 19.8985 4.14844 19.8985 2.73281C19.8985 1.48594 19.1625 0.440625 17.85 0.440625C15.7594 0.440625 13.8844 6.61406 13.2985 8.08594C12.8438 6.75 10.7156 0 8.84064 0C7.38283 0 6.69846 1.07344 6.69846 2.42344C6.69846 4.07812 8.30158 8.36719 8.88283 10.0172C8.58752 9.90938 8.26877 9.81562 7.94533 9.81562C6.84845 9.81562 5.68127 11.1797 5.68127 12.2812C5.68127 12.6984 5.91095 13.2844 6.05627 13.6734C4.32658 14.1422 3.66095 15.2953 3.66095 17.0344C3.65627 20.4187 6.86252 24 11.3719 24C16.9031 24 20.3438 19.8469 20.3438 14.4891C20.3438 12.4688 20.0203 10.6453 17.7703 10.0969ZM16.111 5.0625C16.2985 4.48594 17.1 2.04844 17.85 2.04844C18.2531 2.04844 18.361 2.46563 18.361 2.79844C18.361 3.69375 16.5516 8.63906 16.1531 9.73594L14.5594 9.45469L16.111 5.0625ZM8.17033 2.26406C8.17033 1.70625 8.85002 0.121875 10.3406 4.47188L11.9625 9.17344C11.2313 9.1125 10.6641 9.03281 10.3031 9.23906C9.79221 7.88906 8.17033 3.62812 8.17033 2.26406ZM8.06252 11.4375C9.43596 11.4375 11.2078 15.8719 11.2078 16.4719C11.2078 16.7109 10.9781 17.0062 10.711 17.0062C9.73127 17.0062 7.10627 13.4016 7.10627 12.4266C7.11095 12.0656 7.70158 11.4375 8.06252 11.4375ZM16.7016 20.1703C15.3375 21.6703 13.5938 22.4484 11.5594 22.4484C8.77502 22.4484 6.57658 20.9203 5.5172 18.3094C4.71564 16.275 5.69533 15.1078 6.48283 15.1078C7.01721 15.1078 9.02814 17.9344 9.02814 18.5344C9.02814 18.7641 8.6672 18.9234 8.4797 18.9234C7.72502 18.9234 7.42971 18.1969 6.08439 16.5141C4.69221 17.9062 7.04533 20.5875 8.81721 20.5875C10.0406 20.5875 10.8375 19.4531 10.5985 18.6188C10.7719 18.6188 10.9875 18.6328 11.1469 18.5906C11.1985 19.8609 11.5735 21.375 13.1016 21.4828C13.1016 21.4406 13.1953 21.15 13.1953 21.1359C13.1953 20.3203 12.6985 19.6078 12.6985 18.7781C12.6985 17.4516 13.7156 16.1672 14.7469 15.4172C15.1219 15.1359 15.5766 14.9625 16.0172 14.8031C16.4719 14.6297 16.9547 14.4281 17.3016 14.0812C17.25 13.5562 17.0344 13.0922 16.5094 13.0922C15.211 13.0922 10.8563 13.2797 10.8563 11.2313C10.8563 10.9172 10.861 10.6172 11.6719 10.6172C13.186 10.6172 17.0297 10.9922 18.1547 11.9813C19.0031 12.7359 19.2938 17.2875 16.7016 20.1703ZM12.0797 14.2641C12.5344 14.4094 13.0031 14.4516 13.4719 14.5453C13.125 14.7984 12.8156 15.1078 12.5203 15.4406C12.3891 15.0422 12.2297 14.6531 12.0797 14.2641Z"
                    fill="black" />
                </svg></a>
            </li>
            <li class="nav-item">
              <a class="nav-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 23.625C18.4203 23.625 23.625 18.4203 23.625 12C23.625 5.57969 18.4203 0.375 12 0.375C5.57969 0.375 0.375 5.57969 0.375 12C0.375 18.4203 5.57969 23.625 12 23.625Z"
                    fill="#EA4C89" />
                  <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12 0C5.37527 0 0 5.37527 0 12C0 18.6248 5.37527 24 12 24C18.6117 24 24 18.6248 24 12C24 5.37527 18.6117 0 12 0ZM19.9262 5.53145C21.3579 7.27549 22.217 9.50107 22.243 11.9089C21.9046 11.8439 18.5206 11.154 15.1106 11.5835C15.0325 11.4143 14.9675 11.2321 14.8894 11.0499C14.6811 10.5554 14.4469 10.0477 14.2126 9.56618C17.9869 8.0304 19.705 5.81779 19.9262 5.53145ZM12 1.77007C14.603 1.77007 16.9848 2.74621 18.7939 4.34707C18.6117 4.60738 17.0629 6.67679 13.4186 8.04338C11.7397 4.95878 9.87855 2.43384 9.5922 2.04338C10.3601 1.86117 11.1671 1.77007 12 1.77007ZM7.63995 2.73319C7.91325 3.09761 9.73538 5.63558 11.4404 8.65508C6.65076 9.9306 2.42083 9.90458 1.96529 9.90458C2.62907 6.72885 4.77657 4.08676 7.63995 2.73319ZM1.74404 12.0131C1.74404 11.9089 1.74404 11.8048 1.74404 11.7007C2.18655 11.7136 7.15835 11.7787 12.2733 10.243C12.5727 10.8156 12.846 11.4013 13.1063 11.9869C12.9761 12.026 12.8329 12.0651 12.7028 12.1041C7.41865 13.8091 4.60738 18.4685 4.3731 18.859C2.7462 17.0499 1.74404 14.6421 1.74404 12.0131ZM12 22.256C9.6312 22.256 7.44469 21.449 5.71367 20.0954C5.89588 19.718 7.97827 15.7094 13.757 13.692C13.783 13.679 13.7961 13.679 13.8221 13.666C15.2668 17.4013 15.8525 20.5379 16.0087 21.436C14.7722 21.9696 13.4186 22.256 12 22.256ZM17.7136 20.4989C17.6096 19.8742 17.0629 16.8807 15.7223 13.1974C18.9371 12.6898 21.7484 13.5228 22.0998 13.6399C21.6573 16.4902 20.0173 18.9501 17.7136 20.4989Z"
                    fill="#C32361" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>

  <!-- bootstrap -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous">
  </script>
  <script type="module" src="../js/courses.js"></script>
  <!-- Small screen warning modal logic -->
  <script>
    function myFunction(x) {
      var overlays = document.querySelectorAll('.overTake');
      var modals = document.querySelectorAll('.screenGuard-box');
      if (x.matches) {
        // Screen is wide enough (min-width: 1040px) -> hide the warning
        overlays.forEach(function (el) { el.classList.add('hidden'); });
        modals.forEach(function (el) { el.classList.add('hidden'); });
      } else {
        // Screen is too small -> show the warning
        overlays.forEach(function (el) { el.classList.remove('hidden'); });
        modals.forEach(function (el) { el.classList.remove('hidden'); });
      }
    }

    // Create a MediaQueryList object
    var mql = window.matchMedia("(min-width: 1040px)");

    // Call listener function at runtime
    myFunction(mql);

    // Attach listener function on state changes
    mql.addEventListener("change", function () {
      myFunction(mql);
    });
  </script>
</body>

</html>
