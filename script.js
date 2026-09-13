const night = document.getElementById('night');
const STAR_COUNT = 20;

for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('div');
  star.className = 'shooting_star';

  // 랜덤 위치: 화면 전체에 퍼지도록
  const top = 10 + Math.random() * 80;  // 10% ~ 90%
  const left = 10 + Math.random() * 80;  // 10% ~ 90%
  
  // 랜덤 딜레이: 0 ~ 8초
  const delay = Math.random() * 8000;

  star.style.top = top + '%';
  star.style.left = left + '%';
  star.style.animationDelay = delay + 'ms';
  star.style.setProperty('--delay', delay + 'ms');

  // ::before, ::after에도 같은 딜레이 적용
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
bgm.volume = 0.3;

document.addEventListener('click', function startBGM() {
  bgm.play().then(() => toggleBtn.textContent = '🔊');
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
