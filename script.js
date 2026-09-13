const night = document.getElementById('night');
const STAR_COUNT = 20;

for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('div');
  star.className = 'shooting_star';

  // 랜덤 위치: 화면 전체에 퍼지도록
  const top = Math.random() * 90;   // 0 (top) ~ 90% (bottom)
  const left = 5 + Math.random() * 90;  // 5 (left) ~ 95% (right)

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

// 페이지 새로고침할 때마다 새로운 랜덤 배치
