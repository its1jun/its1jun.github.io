// ===== 유성우 =====
const night = document.getElementById('night');
const STAR_COUNT = 40;

for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('div');
  star.className = 'shooting_star';

  const top = 10 + Math.random() * 80;   // 10% ~ 90%
  const left = 10 + Math.random() * 80;  // 10% ~ 90%
  const delay = Math.random() * 8000;

  star.style.top = top + '%';
  star.style.left = left + '%';
  star.style.animationDelay = delay + 'ms';

  const style = document.createElement('style');
  style.textContent = `
    .shooting_star:nth-child(${i + 1})::before,
    .shooting_star:nth-child(${i + 1})::after {
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

// 처음 클릭하면 재생 (브라우저 자동재생 차단 우회)
document.addEventListener('click', function startBGM() {
  bgm.play().then(() => toggleBtn.textContent = '🔊');
}, { once: true });

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
