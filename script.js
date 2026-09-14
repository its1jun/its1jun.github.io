// ===== BGM 재생 =====
const playlist = [
  "music/toYouMyLight.mp3",
  "music/Sekaiwa_Koi_Ni_Ochiteiru_Inst.mp3"
];

let currentIndex = 0;
const audio = new Audio();
audio.volume = 1.0;

// 곡이 끝나면 다음 곡 재생 (무한 반복)
audio.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  audio.src = playlist[currentIndex];
  audio.play();
});

// 첫 재생 시작
function startMusic() {
  audio.src = playlist[currentIndex];
  audio.play();
  document.removeEventListener('click', startMusic);
  document.removeEventListener('touchstart', startMusic);
}

// 화면 아무데나 클릭/터치하면 재생
document.addEventListener('click', startMusic);
document.addEventListener('touchstart', startMusic);
