// 다른 파일과 변수 이름이 겹치지 않도록 전체를 함수로 감쌈
(function () {
  const toggleBtn = document.getElementById("settings-toggle");
  const panel = document.getElementById("settings-panel");
  const volumeInput = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  const audioEl = document.getElementById("audio"); // 음악 플레이어의 오디오

  // ---- 메뉴 열기 / 닫기 ----
  // 패널의 열림 상태는 ".visible" 클래스 유무로만 판단한다. (hidden 속성 사용 금지)
  // 실제 애니메이션은 css/settings-menu.css 의 transition이 처리하므로 JS는 클래스만 붙였다 뗀다.
  function isOpen() {
    return panel.classList.contains("visible");
  }

  function setOpen(open) {
    panel.classList.toggle("visible", open);                 // true면 추가, false면 제거
    toggleBtn.setAttribute("aria-expanded", String(open));   // 스크린리더용 상태 표시
  }

  toggleBtn.addEventListener("click", () => setOpen(!isOpen()));

  // 메뉴 바깥을 누르거나 Esc를 누르면 닫힘
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".settings")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // ---- 볼륨 ----
  const STORAGE_KEY = "volume";

  function applyVolume(percent) {
    audioEl.volume = percent / 100;
    volumeInput.value = percent;
    volumeValue.textContent = percent + "%";
  }

  // 저장된 볼륨이 있으면 불러오고, 없으면 80%
  let saved = 20;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) saved = Number(stored);
  } catch (e) {}
  applyVolume(saved);

  volumeInput.addEventListener("input", () => {
    const percent = Number(volumeInput.value);
    applyVolume(percent);
    try {
      localStorage.setItem(STORAGE_KEY, percent);
    } catch (e) {}
  });
})();
