// ===== 유성우 =====
const night = document.getElementById('night');
const STAR_COUNT = 40;

for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('div');
  star.className = 'shooting_star';

  // 회전이 없으니 좌표는 화면 전체를 커버
  const top = 10 + Math.random() * 80;   // 10% ~ 90%
  const left = 10 + Math.random() * 80;  // 10% ~ 90%
  const delay = Math.random() * 8000;

  star.style.top = top + '%';
  star.style.left = left + '%';
  star.style.animationDelay = delay + 'ms';

  const style = document.createElement('style');
  style.textContent = `
    #night .shooting_star:nth-child(${i + 1})::before,
    #night .shooting_star:nth-child(${i + 1})::after {
      animation-delay: ${delay}ms;
    }
  `;
  document.head.appendChild(style);

  night.appendChild(star);
}

// ===== BGM =====
const bgm = document.getElementById('bgm');
const toggleBtn = document.getElementById('bgm-toggle');
const volumeSlider = document.getElementById('bgm-volume');

bgm.volume = 0.3;
volumeSlider.value = 30;

bgm.addEventListener('canplaythrough', () => {
  console.log('✅ BGM 파일 로드 성공');
});
bgm.addEventListener('error', (e) => {
  console.error('❌ BGM 파일 로드 실패. music.mp3 파일이 같은 폴더에 있는지, 이름이 정확한지 확인하세요.', e);
});

// 처음 클릭하면 재생 (브라우저 자동재생 차단 우회)
document.addEventListener('click', function startBGM() {
  bgm.play().then(() => {
    toggleBtn.textContent = '🔊';
    console.log('✅ BGM 재생 시작');
  }).catch(e => {
    console.error('❌ BGM 재생 실패:', e);
  });
}, { once: true });

toggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (bgm.paused) {
    bgm.play();
    toggleBtn.textContent = '🔊';
  } else {
    bgm.pause();
    toggleBtn.textContent = '🔇';
  }
});

volumeSlider.addEventListener('input', (e) => {
  e.stopPropagation();
  bgm.volume = e.target.value / 100;
});
