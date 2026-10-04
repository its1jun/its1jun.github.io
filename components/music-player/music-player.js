// 음악 플레이어 기능. HTML 요소는 components/music-player/music-player.html 의 #player 안에 있다.
// ※ 재생/일시정지 아이콘은 체크박스(#playStatus)가 켜졌는지로 바뀐다. (CSS의 :checked)
//   그래서 JS는 "오디오 상태 ↔ 체크박스 상태"를 서로 맞춰 주는 역할을 한다.
// ※ #player 에 붙는 상태 클래스: .expanded(펼침) / .is-playing(재생 중) / .volume-open(볼륨 바 열림)
//   실제 모양과 애니메이션은 components/music-player/music-player.css 가 처리하고, JS는 클래스만 붙였다 뗀다.
const playerEl = document.getElementById("player");
const playerCard = playerEl.querySelector(".player-card");
const audio = document.getElementById("audio");
const titleEl = document.getElementById("title");           // 제목 바깥 상자 (넘친 글씨를 가림)
const titleTrack = document.getElementById("title-track");  // 실제로 움직이는 줄
const titleText = document.getElementById("title-text");    // 제목 글씨
const titleClone = document.getElementById("title-clone");  // 끊김 없이 이어 보이게 하는 복제본
const artistEl = document.getElementById("artist");         // 아티스트 글씨 (펼쳤을 때만 보임)
const seek = document.getElementById("seek");
const currentEl = document.getElementById("current");
const durationEl = document.getElementById("duration");
const playStatus = document.getElementById("playStatus");   // 재생/일시정지 체크박스
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const volumeBtn = document.getElementById("volume-btn");
const volumeInput = document.getElementById("volume");
const volumeValue = document.getElementById("volume-value");
const listBtn = document.getElementById("list-btn");        // 노래 목록 버튼
const listEl = document.getElementById("playlist-items");   // 노래 목록 <ul>

// true: 페이지를 열 때마다 곡 순서를 무작위로 섞음 / false: playlist.json 순서 그대로
const SHUFFLE_PLAYLIST = true;

// data/playlist.json을 읽지 못할 때 대신 쓰는 기본 목록
const fallbackList = [
  { src: "assets/audio/Sekaiwa_Koi_Ni_Ochiteiru.mp3", title: "世界は恋に落ちている", artist: "CHICO" }
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

// ---- 제목 표시 + 길면 왼쪽으로 흐르기 ----
// 제목이 상자보다 길 때만: 5초 쉬었다가 → 한 바퀴 왼쪽으로 흐르고 → 처음 모습이 되면 멈춤 → 반복
const MARQUEE_DELAY_MS = 5000;  // 흐르기 전에 쉬는 시간 (밀리초)
const MARQUEE_SPEED = 40;       // 흐르는 속도 (초당 픽셀)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let marqueeTimer = null;

function stopMarquee() {
  clearTimeout(marqueeTimer);
  titleTrack.classList.remove("is-running");
}

function scheduleMarquee() {
  marqueeTimer = setTimeout(() => titleTrack.classList.add("is-running"), MARQUEE_DELAY_MS);
}

// 제목이 넘치는지 다시 확인하고, 필요하면 흐르기를 (재)시작한다.
// 제목이 바뀌었을 때, 펼침/접힘이 바뀌었을 때, 화면 크기가 바뀌었을 때 호출된다.
function updateMarquee() {
  stopMarquee();
  titleEl.classList.remove("is-overflowing");
  // 동작 줄이기 설정이면 흐르지 않음
  if (reduceMotion.matches) return;
  // 글씨가 상자 안에 다 들어가면 흐를 필요 없음
  if (titleText.offsetWidth <= titleEl.clientWidth) return;

  titleEl.classList.add("is-overflowing");  // 복제본을 보이게 함
  // 복제본 너비(여백 + 글씨)만큼 이동해야 복제본 글씨가 원본 위치에 정확히 겹침
  const shift = titleClone.offsetWidth;
  titleTrack.style.setProperty("--marquee-shift", shift + "px");
  titleTrack.style.setProperty("--marquee-duration", shift / MARQUEE_SPEED + "s");
  scheduleMarquee();
}

// 한 바퀴 흐르기가 끝나면 처음 모습과 같으므로 멈추고, 5초 뒤 다시 시작
titleTrack.addEventListener("animationend", (e) => {
  if (e.target !== titleTrack) return;
  titleTrack.classList.remove("is-running");
  scheduleMarquee();
});

// 카드 너비 또는 제목 글자 크기 변화가 끝나면 정확한 크기로 다시 확인
playerCard.addEventListener("transitionend", (e) => {
  if (e.propertyName === "width" || e.propertyName === "font-size") updateMarquee();
});

// 제목을 바꾸고, 접힌 상태에서 가운데로 갈 거리(--title-center-shift)를 계산한다.
// 접힌 카드 폭 = --card-w, 좌우 padding 0.75rem씩 → 제목 상자 폭 = 카드 폭 - 1.5rem (단위: px)
function setTitle(text) {
  titleText.textContent = text;
  titleClone.textContent = text;
  const rootFont = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cardW = parseFloat(getComputedStyle(playerEl).getPropertyValue("--card-w")) * rootFont;
  const boxW = cardW - 1.5 * rootFont;
  const shift = Math.max(0, (boxW - titleText.offsetWidth) / 2);   // 긴 제목은 0 (왼쪽 유지)
  titleTrack.style.setProperty("--title-center-shift", shift + "px");
  updateMarquee();
}

// index번째 곡을 불러옴 (자동 재생은 하지 않음)
function loadTrack(i) {
  index = (i + playlist.length) % playlist.length;
  audio.src = playlist[index].src;
  setTitle(playlist[index].title);
  artistEl.textContent = playlist[index].artist || "";   // artist 가 없으면 빈 칸
  highlightCurrent();                 // 목록에서 현재 곡 표시
  seek.value = 0;
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";
}

function playTrack(i) {
  loadTrack(i);
  audio.play().catch(() => {}); // 파일이 없을 때 콘솔 오류가 쌓이지 않게 무시
}

// 재생 / 일시정지: 체크박스가 바뀌면 오디오를 재생하거나 멈춤
playStatus.addEventListener("change", () => {
  if (playlist.length === 0) {
    playStatus.checked = false;
    return;
  }
  if (playStatus.checked) {
    // 재생에 실패하면(파일 없음 등) 아이콘을 다시 재생 모양으로 되돌림
    audio.play().catch(() => { playStatus.checked = false; });
  } else {
    audio.pause();
  }
});

// 오디오 상태가 바뀌면 체크박스(아이콘)와 LP판 회전 상태도 맞춤
audio.addEventListener("play", () => {
  playStatus.checked = true;
  playerEl.classList.add("is-playing");      // LP판 회전 시작 (CSS가 처리)
});
audio.addEventListener("pause", () => {
  playStatus.checked = false;
  playerEl.classList.remove("is-playing");   // LP판 회전 정지 (현재 각도에서 멈춤)
});
audio.addEventListener("ended", () => playTrack(index + 1));

prevBtn.addEventListener("click", () => playTrack(index - 1));
nextBtn.addEventListener("click", () => playTrack(index + 1));

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

// 곡 목록을 무작위 순서로 섞은 "새 배열"을 돌려준다. (원래 배열은 바뀌지 않음)
// 방식: 뒤에서부터 한 칸씩 내려오며 앞쪽 임의의 칸과 자리를 바꾼다. (모든 순서가 같은 확률로 나옴)
function shuffleList(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function start(list) {
  playlist = SHUFFLE_PLAYLIST ? shuffleList(list) : list;   // 설정에 따라 섞거나 그대로 사용
  if (playlist.length === 0) {
    setTitle("곡이 없습니다");
    return;
  }
  renderList();   // 노래 목록 만들기
  loadTrack(0);
}

// data/playlist.json 불러오기 (실패하면 기본 목록 사용)
fetch("data/playlist.json")
  .then((res) => res.json())
  .then(start)
  .catch(() => start(fallbackList));


// ---- 플레이어 펼치기 / 접기 (클릭) ----
// 펼침 상태는 #player 의 ".expanded" 클래스 유무로만 판단한다. (CSS: components/music-player/music-player.css)
// 클릭 대상은 두 곳뿐이다. (재생 바와 버튼을 눌렀을 때는 펼침/접힘이 바뀌지 않아야 함)
//   - 위쪽 LP판 (.player-record-top): 접힌 상태에서 눌러 펼침
//   - 곡 정보 줄 (.player-info)     : 펼친 상태에서 눌러 접음
const toggleTop = playerEl.querySelector(".player-record-top");
const toggleInfo = playerEl.querySelector(".player-info");
const toggles = [toggleTop, toggleInfo];

function isExpanded() {
  return playerEl.classList.contains("expanded");
}

// 플레이어를 펼치거나 접는다. (펼침 여부는 #player 의 ".expanded" 클래스로 표시)
// 볼륨 바(.volume-open)와 노래 목록(.list-open)의 열림 상태는 접어도 그대로 기억된다.
// (접힌 상태에서는 CSS가 두 클래스를 무시하므로 화면에 보이지 않음)
function setExpanded(expanded) {
  playerEl.classList.toggle("expanded", expanded);   // true면 추가, false면 제거
  // 키보드(Tab)로는 "지금 보이는 쪽"만 선택되게 함
  toggleTop.tabIndex = expanded ? -1 : 0;
  toggleInfo.tabIndex = expanded ? 0 : -1;
  // 스크린리더용 상태 표시
  toggles.forEach((el) => el.setAttribute("aria-expanded", String(expanded)));
  // 크기가 바뀌는 도중에는 제목 너비가 계속 변하므로 흐르기를 멈추고 복제본을 숨김
  // (정확한 확인은 카드 너비 전환이 끝나는 transitionend 에서 updateMarquee() 가 처리)
  stopMarquee();
  titleEl.classList.remove("is-overflowing");
}

toggles.forEach((el) => {
  el.addEventListener("click", () => setExpanded(!isExpanded()));
  // 키보드: Enter 또는 Space 로도 동작
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setExpanded(!isExpanded());
    }
  });
});

// Esc 를 누르면 접힘
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isExpanded()) setExpanded(false);
});


// ---- 볼륨 ----
// 볼륨 버튼(스피커 아이콘)을 누르면 버튼들 아래에 볼륨 바가 열리고/닫힌다. (".volume-open")
// 저장 키("volume")는 예전 설정 메뉴와 같아서 기존에 저장된 값이 이어진다.
const VOLUME_KEY = "volume";

function setVolumeOpen(open) {
  playerEl.classList.toggle("volume-open", open);
  volumeBtn.setAttribute("aria-expanded", String(open));
}

volumeBtn.addEventListener("click", () => {
  setVolumeOpen(!playerEl.classList.contains("volume-open"));
});

function applyVolume(percent) {
  audio.volume = percent / 100;              // 오디오 볼륨은 0~1 범위
  volumeInput.value = percent;
  volumeValue.textContent = percent + "%";
}

// 저장된 볼륨이 있으면 불러오고, 없으면 20%
let savedVolume = 20;
try {
  const stored = localStorage.getItem(VOLUME_KEY);
  if (stored !== null) savedVolume = Number(stored);
} catch (e) {}
applyVolume(savedVolume);

volumeInput.addEventListener("input", () => {
  const percent = Number(volumeInput.value);
  applyVolume(percent);
  try {
    localStorage.setItem(VOLUME_KEY, percent);
  } catch (e) {}
});

// ---- 노래 목록 ----
// 노래 목록을 열거나 닫는다. (#player 의 ".list-open" 클래스로 표시)
// 항목은 playlist 로 만들고, 곡을 누르면 바로 재생한다. 현재 곡은 ".is-current" 로 표시한다.
function setListOpen(open) {
  playerEl.classList.toggle("list-open", open);
  listBtn.setAttribute("aria-expanded", String(open));
}

listBtn.addEventListener("click", () => {
  setListOpen(!playerEl.classList.contains("list-open"));
});

// playlist 로 목록 항목(<li><button>)을 만든다.
function renderList() {
  listEl.innerHTML = "";                  // 기존 항목 비우기
  playlist.forEach((track, i) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "player-list-item";
    btn.textContent = track.title;        // textContent 로 넣어 제목에 특수문자가 있어도 안전
    btn.addEventListener("click", () => playTrack(i));   // 누르면 그 곡을 바로 재생
    li.appendChild(btn);
    listEl.appendChild(li);
  });
  updateListFade();                       // 항목 수가 바뀌었으니 흐림 여부를 다시 계산
}

// 목록 아래에 더 볼 곡이 남아 있으면 ".has-more" 를 붙여 아래쪽을 흐리게 한다. (모양은 music-player.css)
// 다시 계산하는 때: 스크롤할 때 / 목록 높이가 바뀔 때(열기, 닫기, 볼륨 바 열림) / 항목이 새로 만들어질 때
function updateListFade() {
  const hasMore = listEl.scrollTop + listEl.clientHeight < listEl.scrollHeight - 1;   // 1px 여유: 소수점 오차 방지
  listEl.classList.toggle("has-more", hasMore);
}
listEl.addEventListener("scroll", updateListFade);
new ResizeObserver(updateListFade).observe(listEl);   // 목록 높이가 바뀔 때마다 자동으로 호출됨

// 현재 재생 중인 곡(index)을 목록에서 강조한다.
function highlightCurrent() {
  listEl.querySelectorAll(".player-list-item").forEach((btn, i) => {
    btn.classList.toggle("is-current", i === index);
  });
}