// ===== BGM 재생 =====
const playlist = [
  'music/music.mp3'   // 노래 추가하면 여기에 파일명 넣기
];

let currentIndex = 0;
const audio = new Audio();
audio.volume = 1.0;

audio.addEventListener('ended', () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  audio.src = playlist[currentIndex];
  audio.play();
});

document.getElementById('playBtn').addEventListener('click', () => {
  audio.src = playlist[currentIndex];
  audio.play();
});
