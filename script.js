// ===== BGM 재생 =====
const playlist = [
  'music/Sekaiwa_Koi_Ni_Ochiteiru_Inst.mp3',
  'music/toYouMyLight.mp3'
];

let currentIndex = 0;
const audio = new Audio();
audio.volume = 1.0;

// 곡이 끝나면 다음 곡 재생 (무한 반복)
audio.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  audio.src = playlist[currentIndex];
  // 여기서는 사용자 제스처가 없어도 됨. 이미 재생 권한을 얻었기 때문.
  audio.play().catch(err => console.error('다음 곡 재생 실패:', err));
});

// 화면 클릭 시 첫 재생 - "사용자 제스처"를 최대한 살리기 위해
document.addEventListener('click', function onFirstClick() {
  audio.src = playlist[currentIndex];
  // ★ 핵심: play()를 이벤트 콜백 안에서 바로 호출
  const playPromise = audio.play();
  
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('재생 성공');
      // 성공 시에만 이벤트 리스너 제거
      document.removeEventListener('click', onFirstClick);
    }).catch(error => {
      console.error('재생 실패:', error.name, error.message);
    });
  }
});
