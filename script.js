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
  // 트리거
  const trigger = document.createElement('div');
  trigger.id = 'corner-trigger';
  document.body.appendChild(trigger);

  // 메뉴 컨테이너
  const menu = document.createElement('div');
  menu.id = 'corner-menu';
  document.body.appendChild(menu);

  // "음악" 헤더
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
  menu.appendChild(header);

  // 서브메뉴
  const submenu = document.createElement('div');
  submenu.className = 'submenu';
  menu.appendChild(submenu);

  // 곡 목록
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

  // 볼륨 슬라이더 (메뉴 안, 곡 목록 아래 형제)
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
  menu.appendChild(volumeRow);

  // 메뉴 열고 닫기
  trigger.addEventListener('mouseenter', () => menu.classList.add('open'));
  menu.addEventListener('mouseleave', () => menu.classList.remove('open'));

  // 서브메뉴 펼침/접힘
  header.addEventListener('click', () => {
    submenu.classList.toggle('open');
    header.classList.toggle('open');
  });

  // 초기 상태
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
