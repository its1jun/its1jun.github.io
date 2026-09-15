// ===== BGM 재생 =====
let playlist = [];
let currentIndex = 0;
const audio = new Audio();
audio.volume = 0.2;

// 곡이 끝나면 다음 곡 재생 (무한 반복)
audio.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  audio.src = playlist[currentIndex].src;
  audio.play().catch(err => console.error('다음 곡 재생 실패:', err));
  if (typeof updateActiveSong === 'function') updateActiveSong();
});

// 화면 클릭 시 첫 재생
document.addEventListener('click', function onFirstClick() {
  if (playlist.length === 0) return;
  audio.src = playlist[currentIndex].src;
  audio.play().then(() => {
    console.log('재생 성공');
    document.removeEventListener('click', onFirstClick);
  }).catch(error => {
    console.error('재생 실패:', error.name, error.message);
  });
});

// ===== playlist.json 로드 후 메뉴 생성 =====
fetch('playlist.json')
  .then(res => res.json())
  .then(data => {
    playlist = data;
    buildMenu();
  })
  .catch(err => console.error('playlist.json 로드 실패:', err));

// ===== 메뉴 생성 함수 =====
function buildMenu() {
  // ---------------------------------------------------
  // 1. 히트박스 (마우스 감지 전용, 화면에 안 보임)
  // ---------------------------------------------------
  const hitbox = document.createElement('div');
  hitbox.id = 'menu-hitbox';
  document.body.appendChild(hitbox);

  // ---------------------------------------------------
  // 2. 패널 (실제 보이는 메뉴, 히트박스와 독립)
  // ---------------------------------------------------
  const panel = document.createElement('div');
  panel.id = 'menu-panel';
  hitbox.appendChild(panel);

  // ---------------------------------------------------
  // 3. "🎵 음악 ▶" 헤더
  // ---------------------------------------------------
  const header = document.createElement('div');
  header.className = 'menu-header';

  const headerTitle = document.createElement('span');
  headerTitle.textContent = '🎵 음악';

  const headerArrow = document.createElement('span');
  headerArrow.className = 'arrow';
  headerArrow.textContent = '▶';

  header.appendChild(headerTitle);
  header.appendChild(headerArrow);
  panel.appendChild(header);

  // ---------------------------------------------------
  // 4. "(현재 곡 제목)"
  // ---------------------------------------------------
  const headerCurrent = document.createElement('div');
  headerCurrent.className = 'current-title';
  headerCurrent.textContent = '(대기 중)';
  panel.appendChild(headerCurrent);

  // ---------------------------------------------------
  // 5. 서브메뉴 (곡 목록)
  // ---------------------------------------------------
  const submenu = document.createElement('div');
  submenu.className = 'submenu';
  panel.appendChild(submenu);

  // 곡 항목 생성
  playlist.forEach((song, index) => {
    const item = document.createElement('div');
    item.className = 'song-item';
    const fileName = song.src.split('/').pop().replace('.mp3', '');
    const displayName = (song.title && song.title.trim()) ? song.title.trim() : fileName;
    item.textContent = '▶ ' + displayName;
    item.dataset.index = index;

    item.addEventListener('click', () => {
      currentIndex = index;
      audio.src = playlist[currentIndex].src;
      audio.play().catch(err => console.error('재생 실패:', err));
      updateActiveSong();
    });

    submenu.appendChild(item);
  });

  // ---------------------------------------------------
  // 6. 볼륨 슬라이더
  // ---------------------------------------------------
  const volumeRow = document.createElement('div');
  volumeRow.className = 'volume-row';

  const volIcon = document.createElement('span');
  volIcon.className = 'vol-icon';
  volIcon.textContent = '🔊';
  volIcon.style.cursor = 'pointer';

  const volSlider = document.createElement('input');
  volSlider.type = 'range';
  volSlider.min = '0';
  volSlider.max = '100';
  volSlider.value = audio.volume * 100;

  let lastVolume = audio.volume > 0 ? audio.volume : 0.2; // 뮤트 해제 시 되돌아갈 값
  let muted = audio.volume === 0;

  const updateVolIcon = () => {
    volIcon.textContent = (audio.volume === 0) ? '🔇' : '🔊';
  };

  const setVolume = (e) => {
    audio.volume = parseFloat(e.target.value) / 100;
    muted = audio.volume === 0;
    if (!muted) lastVolume = audio.volume; // 뮤트가 아닐 때만 마지막 볼륨 갱신
    updateVolIcon();
  };
  volSlider.addEventListener('input', setVolume);
  volSlider.addEventListener('change', setVolume);

  volIcon.addEventListener('click', () => {
    if (muted) {
      // 뮤트 해제 → 이전 볼륨으로 복원
      audio.volume = lastVolume;
      muted = false;
    } else {
      // 뮤트 → 현재 볼륨 저장 후 0으로
      lastVolume = audio.volume;
      audio.volume = 0;
      muted = true;
    }
    volSlider.value = audio.volume * 100;
    updateVolIcon();
  });

  // 모바일에서 슬라이더 드래그가 다른 이벤트로 새지 않게
  volSlider.addEventListener('touchstart', (e) => e.stopPropagation());
  volSlider.addEventListener('touchmove', (e) => e.stopPropagation());

  volumeRow.appendChild(volIcon);
  volumeRow.appendChild(volSlider);
  panel.appendChild(volumeRow);

  // ---------------------------------------------------
  // 7. 패널 열기/닫기
  // ---------------------------------------------------
  const state = {
    hovering: false,    // 마우스가 히트박스 안에 있는지
    submenuOpen: false, // 서브메뉴(음악 목록) 펼침 여부
  };

  const render = () => {
    // 2, 3: 히트박스에 마우스 들어오면 메뉴 보임 / 나가면 숨김
    panel.classList.toggle('open', state.hovering);
    submenu.classList.toggle('open', state.submenuOpen);
    header.classList.toggle('open', state.submenuOpen);

    // 4: 음악 펼치면 확장 / 5: 음악 접힘 AND 마우스 밖 → 기본
    if (state.submenuOpen) {
      hitbox.classList.add('expanded');
    } else if (!state.hovering) {
      hitbox.classList.remove('expanded');
    }
    // 음악 접힘 AND 마우스 안(hovering) → 조건 5 불충족이므로 변경 없음(유지)
  };

  hitbox.addEventListener('mouseenter', () => {
    state.hovering = true;
    render();
  });

  hitbox.addEventListener('mouseleave', () => {
    state.hovering = false;
    render();
  });

  hitbox.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    state.hovering = true;
    render();
  });

  // 히트박스 바깥 터치 → 마우스 나감과 동일 취급 (모바일)
  document.addEventListener('touchstart', (e) => {
    if (!hitbox.contains(e.target)) {
      state.hovering = false;
      render();
    }
  });

  // ---------------------------------------------------
  // 8. "🎵 음악" 클릭 → 서브메뉴 펼침/접힘
  // ---------------------------------------------------
  header.addEventListener('click', () => {
    state.submenuOpen = !state.submenuOpen;
    render();
  });

  // 초기 렌더
  render();

  // ---------------------------------------------------
  // 9. 초기 상태
  // ---------------------------------------------------
  updateActiveSong();
}

// ===== 현재 곡 제목 업데이트 =====
function updateActiveSong() {
  if (playlist.length === 0) return;

  const headerCurrent = document.querySelector('.current-title');
  const submenu = document.querySelector('.submenu');
  if (!headerCurrent || !submenu) return;

  const song = playlist[currentIndex];
  const fileName = song.src.split('/').pop().replace('.mp3', '');
  const displayName = (song.title && song.title.trim()) ? song.title.trim() : fileName;
  headerCurrent.textContent = "- " + displayName + " -";

  submenu.querySelectorAll('.song-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}