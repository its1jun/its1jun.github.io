const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");
const seek = document.getElementById("seek");
const currentEl = document.getElementById("current");
const durationEl = document.getElementById("duration");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

// playlist.json을 읽지 못할 때 대신 쓰는 기본 목록
const fallbackList = [
  { src: "assets/audio/Sekaiwa_Koi_Ni_Ochiteiru.mp3", title: "世界は恋に落ちている" }
];

let playlist = [];
let index = 0;

// 초 → "분:초" 형태로 변환
function formatTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return m + ":" + s;
}

// index번째 곡을 불러옴 (자동 재생은 하지 않음)
function loadTrack(i) {
  index = (i + playlist.length) % playlist.length;
  audio.src = playlist[index].src;
  titleEl.textContent = playlist[index].title;
  seek.value = 0;
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";
}

function playTrack(i) {
  loadTrack(i);
  audio.play();
}

// 재생 / 일시정지
playBtn.addEventListener("click", () => {
  if (playlist.length === 0) return;
  if (audio.paused) audio.play();
  else audio.pause();
});

prevBtn.addEventListener("click", () => playTrack(index - 1));
nextBtn.addEventListener("click", () => playTrack(index + 1));

audio.addEventListener("play", () => {
  playBtn.textContent = "⏸";
  playBtn.setAttribute("aria-label", "일시정지");
});
audio.addEventListener("pause", () => {
  playBtn.textContent = "▶";
  playBtn.setAttribute("aria-label", "재생");
});
audio.addEventListener("ended", () => playTrack(index + 1));

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

// 재생 중 바와 시간 갱신
audio.addEventListener("timeupdate", () => {
  if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
  currentEl.textContent = formatTime(audio.currentTime);
});

// 바를 직접 움직여 재생 위치 이동
seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
});

function start(list) {
  playlist = list;
  if (playlist.length === 0) {
    titleEl.textContent = "곡이 없습니다";
    return;
  }
  loadTrack(0);
}

// playlist.json 불러오기 (실패하면 기본 목록 사용)
fetch("playlist.json")
  .then((res) => res.json())
  .then(start)
  .catch(() => start(fallbackList));
