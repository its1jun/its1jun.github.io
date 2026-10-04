// 별똥별 배경: 흰 점 + 별똥별을 랜덤으로 만든다.
// 연결 위치: index.html 의 </body> 바로 위 <script src="js/shooting-stars.js"></script>
(function () {
  var box = document.querySelector('.bgx-shooting-stars');
  if (!box) return;

  // 화면 크기에 맞춰 개수를 자동 조절 (1920x1080 화면을 기준 1배로 봄)
  var scale = Math.min(1, Math.max(0.25, (innerWidth * innerHeight) / (1920 * 1080)));
  var DOTS = Math.round(80 * scale);                    // 흰 점 개수
  var MAX_STARS = Math.max(2, Math.round(10 * scale));  // 동시에 보이는 별똥별 최대 개수
  var GAP_MIN = 0.1 / Math.sqrt(scale);                 // 다음 별똥별까지 최소 간격(초)
  var GAP_MAX = 1.5 / Math.sqrt(scale);                 // 다음 별똥별까지 최대 간격(초)

  function rand(a, b) { return a + Math.random() * (b - a); }

  // 흰 점 뿌리기
  for (var i = 0; i < DOTS; i++) {
    var dot = document.createElement('i');
    dot.style.setProperty('--x', rand(0, 100) + '%');
    dot.style.setProperty('--y', rand(0, 100) + '%');
    dot.style.setProperty('--s', rand(1, 3) + 'px');
    dot.style.setProperty('--o', rand(0.3, 0.9).toFixed(2));
    dot.style.setProperty('--t', rand(2, 6).toFixed(1) + 's');
    box.appendChild(dot);
  }

  // 별똥별 하나 만들기: 떨어지고 나면 스스로 사라진다
  var active = 0;
  function spawn() {
    if (active >= MAX_STARS || document.hidden) return;
    var star = document.createElement('span');
    star.style.setProperty('--x', rand(30, 110) + '%');
    star.style.setProperty('--y', rand(-10, 50) + '%');
    star.style.setProperty('--len', rand(5, 9).toFixed(1) + 'em');
    star.style.setProperty('--dur', rand(1.8, 3).toFixed(1) + 's');
    star.addEventListener('animationend', function () {
      star.remove();
      active--;
    });
    box.appendChild(star);
    active++;
  }

  // 랜덤 간격으로 계속 별똥별을 만든다
  function loop() {
    spawn();
    setTimeout(loop, rand(GAP_MIN, GAP_MAX) * 1000);
  }
  loop();
})();
