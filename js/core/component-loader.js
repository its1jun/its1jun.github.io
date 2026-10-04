// 컴포넌트 로더: index.html 의 <div data-component="이름"></div> 자리를
// components/이름/ 폴더의 HTML, CSS, JS 로 자동으로 채운다.
// 규칙: 폴더 이름과 파일 이름이 같아야 한다.
//   예) data-component="shooting-stars"
//       -> components/shooting-stars/shooting-stars.html / .css / .js
(function () {
  const COMPONENT_ROOT = "components";       // 컴포넌트 폴더들이 들어 있는 위치
  const NAME_PATTERN = /^[a-z0-9_-]+$/;      // 허용하는 이름: 영문 소문자, 숫자, 하이픈, 언더스코어

  // CSS 파일을 <head> 에 연결하고, 다 불러올 때까지 기다린다. (스타일 없는 모습이 깜빡이는 것 방지)
  function loadStyle(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = resolve;
      link.onerror = () => reject(new Error("Failed to load " + href));
      document.head.appendChild(link);
    });
  }

  // JS 파일을 불러와 실행하고, 실행이 끝날 때까지 기다린다.
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load " + src));
      document.body.appendChild(script);
    });
  }

  // HTML 파일을 읽어서 글자로 돌려준다.
  async function loadHtml(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load " + url);
    return res.text();
  }

  // 컴포넌트 하나를 불러와 빈 자리(slot)를 그 내용으로 바꾼다.
  // 순서: CSS 와 HTML 을 함께 불러옴 -> HTML 삽입 -> JS 실행 (JS 는 HTML 요소가 있어야 동작하므로 마지막)
  async function loadComponent(slot) {
    const name = slot.dataset.component;
    if (!NAME_PATTERN.test(name)) throw new Error("Invalid component name: " + name);

    const base = COMPONENT_ROOT + "/" + name + "/" + name;
    const [, html] = await Promise.all([loadStyle(base + ".css"), loadHtml(base + ".html")]);

    const template = document.createElement("template");
    template.innerHTML = html;
    slot.replaceWith(template.content);   // 빈 자리를 실제 내용으로 교체

    await loadScript(base + ".js");
  }

  // 컴포넌트끼리는 서로 기다리지 않고 동시에 불러온다. 하나가 실패해도 나머지는 계속 진행한다.
  document.querySelectorAll("[data-component]").forEach((slot) => {
    loadComponent(slot).catch((err) => console.error("[component-loader]", err));
  });
})();
