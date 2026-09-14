// ===== BGM 재생 =====
let playlist = [];
let currentIndex = 0;
const audio = new Audio();
audio.volume = 0.2;

// 곡이 끝나면 다음 곡 재생 (무한 반복)
audio.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  audio.src = playlist[currentIndex];
  audio.play().catch(err => console.error('다음 곡 재생 실패:', err));
  if (typeof updateActiveSong === 'function') updateActiveSong();
});

// 화면 클릭 시 첫 재생
document.addEventListener('click', function onFirstClick() {
  if (playlist.length === 0) return;
  audio.src = playlist[currentIndex];
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
  // 1. 히트박스 (안 보이는 마우스 감지 영역)
  const hitbox = document.createElement('div');
  hitbox.id = 'menu-hitbox';

  // 2. 패널 (실제 보이는 메뉴)
  const panel = document.createElement('div');
  panel.id = 'menu-panel';
  hitbox.appendChild(panel);
  document.body.appendChild(hitbox);

  // 3. "음악" 헤더
  const header = document.createElement('div');
  header.className = 'menu-header';

  const headerTitle = document.createElement('span');
  headerTitle.textContent = '🎵 음악';

  const headerCurrent = document.createElement('span');
  headerCurrent.className = 'current-title';
  headerCurrent.textContent = '(대기 중)';

  const headerArrow = document.createElement('span');
  headerArrow.className = 'arrow';
  headerArrow.textContent = '▶';

  header.appendChild(headerTitle);
  header.appendChild(headerCurrent);
  header.appendChild(headerArrow);
  panel.appendChild(header);

  // 4. 서브메뉴 (곡 목록)
  const submenu = document.createElement('div');
  submenu.className = 'submenu';
  panel.appendChild(submenu);

  // 5. 곡 항목
  playlist.forEach((songPath, index) => {
    const item = document.createElement('div');
    item.className = 'song-item';
    const fileName = songPath.split('/').pop().replace('.mp3', '');
    item.textContent = '▶ ' + fileName;
    item.dataset.index = index;

    item.addEventListener('click', () => {
      currentIndex = index;
      audio.src = playlist[currentIndex];
      audio.play().catch(err => console.error('재생 실패:', err));
      updateActiveSong();
    });

    submenu.appendChild(item);
  });

  // 6. 볼륨 슬라이더
  const volumeRow = document.createElement('div');
  volumeRow.className = 'volume-row';

  const volIcon = document.createElement('span');
  volIcon.className = 'vol-icon';
  volIcon.textContent = '🔊';

  const volSlider = document.createElement('input');
  volSlider.type = 'range';
  volSlider.min = '0';
  volSlider.max = '100';
  volSlider.value = audio.volume * 100;

  volSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
  });

  volumeRow.appendChild(volIcon);
  volumeRow.appendChild(volSlider);
  panel.appendChild(volumeRow);

  // 7. 히트박스에만 마우스 이벤트 (크기 절대 안 변함)
  hitbox.addEventListener('mouseenter', () => hitbox.classList.add('open'));
  hitbox.addEventListener('mouseleave', () => hitbox.classList.remove('open'));

  // 8. "음악" 클릭 시 서브메뉴 펼침/접힘
  header.addEventListener('click', () => {
    submenu.classList.toggle('open');
    header.classList.toggle('open');
  });

  // 9. 초기 상태
  updateActiveSong();
}

// ===== 현재 곡 제목 업데이트 =====
function updateActiveSong() {
  if (playlist.length === 0) return;

  const headerCurrent = document.querySelector('.current-title');
  const submenu = document.querySelector('.submenu');
  if (!headerCurrent || !submenu) return;

  const fileName = playlist[currentIndex].split('/').pop().replace('.mp3', '');
  headerCurrent.textContent = '(' + fileName + ')';

  submenu.querySelectorAll('.song-item').forEach((el, i) => {
    el.classList.toggle('active', i === currentIndex);
  });
}
