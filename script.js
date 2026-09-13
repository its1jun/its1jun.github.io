// ===== 유성우 =====
const night = document.getElementById('night');
const STAR_COUNT = 40;

for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('div');
  star.className = 'shooting_star';

  // .night가 45도 회전되어 있으므로 좌표를 넓게 잡아 화면 전체를 덮음
  const top = -50 + Math.random() * 200;   // -50% ~ 150%
  const left = -50 + Math.random() * 200;  // -50% ~ 150%
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

// 페이지 로드되면 바로 재생 시도 (브라우저가 막으면 클릭 대기)
bgm.play().then(() => {
  toggleBtn.textContent = '🔊';
}).catch(() => {
  document.addEventListener('click', () => {
    bgm.play();
    toggleBtn.textContent = '🔊';
  }, { once: true });
});

// 뮤트 / 재생 토글
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

// 음량 슬라이더 조절
volumeSlider.addEventListener('input', (e) => {
  e.stopPropagation();
  bgm.volume = e.target.value / 100;
});
