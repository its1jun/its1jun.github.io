// 다른 파일과 변수 이름이 겹치지 않도록 전체를 함수로 감쌈
// ※ 볼륨 조절은 음악 플레이어로 옮길 예정이라 이 파일에는 메뉴 열기/닫기만 있다.
(function () {
  const toggleBtn = document.getElementById("settings-toggle");
  const panel = document.getElementById("settings-panel");

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
})();
