// 페이지 라우터: 주소 끝의 #이름 을 보고 pages/이름/이름.html 을 <main id="page-view"> 안에 채운다.
// 페이지를 바꿔도 index.html 은 다시 불러오지 않으므로 음악 플레이어와 배경은 그대로 유지된다.
//   예) 주소 끝이 #about -> pages/about/about.html / 주소에 #이 없으면 -> home
//   없는 페이지 이름이면 home 으로 돌아간다.
// ※ 페이지 조각 파일도 맨 마지막 줄에 </body> 를 넣어야 한다. (Live Server 오류 방지, component-loader.js 주석 참고)
// ※ fetch 를 쓰므로 Live Server 또는 GitHub Pages 에서만 동작한다. (더블클릭 실행 불가)
(function () {
  const PAGE_ROOT = "pages";                 // 페이지 폴더들이 들어 있는 위치
  const DEFAULT_PAGE = "home";               // 주소에 #이름 이 없을 때 보여줄 페이지
  const NAME_PATTERN = /^[a-z0-9_-]+$/;      // 허용하는 이름: 영문 소문자, 숫자, 하이픈, 언더스코어
  const view = document.getElementById("page-view");   // 페이지 내용이 들어갈 자리
  let requestId = 0;                         // 요청 번호: 빠르게 연속으로 바뀔 때 늦게 도착한 옛 요청을 버리는 용도

  // 주소의 # 뒤 글자를 페이지 이름으로 돌려준다. 비어 있으면 기본 페이지 이름.
  function getPageName() {
    return location.hash.slice(1) || DEFAULT_PAGE;
  }

  // 페이지 HTML 조각을 읽어서 글자로 돌려준다. (pages/이름/이름.html)
  async function fetchPage(name) {
    if (!NAME_PATTERN.test(name)) throw new Error("Invalid page name: " + name);
    const res = await fetch(PAGE_ROOT + "/" + name + "/" + name + ".html");
    if (!res.ok) throw new Error("Failed to load page: " + name);
    return res.text();
  }

  // 현재 주소에 맞는 페이지를 불러와 view 안의 내용을 통째로 바꾼다.
  async function showPage() {
    const currentId = ++requestId;
    const name = getPageName();

    let html;
    try {
      html = await fetchPage(name);
    } catch (err) {
      console.error("[page-router]", err);
      if (name === DEFAULT_PAGE) return;     // 기본 페이지도 못 읽으면 멈춤 (무한 반복 방지)
      history.replaceState(null, "", location.pathname + location.search);   // 주소의 #이름 을 지움 (hashchange 는 발생하지 않음)
      return showPage();                     // 기본 페이지로 다시 시도
    }

    if (currentId !== requestId) return;     // 그 사이 다른 페이지로 바뀌었으면 이 결과는 버림

    const template = document.createElement("template");
    template.innerHTML = html;
    view.replaceChildren(template.content);
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", showPage);
  showPage();
})();
