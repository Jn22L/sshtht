(function () {
  const root = document.querySelector("article");
  const navigation = document.getElementById("navigation");

  const routes = {
    // path: url
    "/nav__home": "/pages/home.html",
    "/nav__todo": "/pages/todolist.html",
    "/nav__pushstate": "/pages/pushstate.html",
  };

  const render = async (path) => {
    try {
      const url = routes[path];
      if (!url) {
        root.innerHTML = `${path} Not Found`;
        return;
      }

      const res = await fetch(url);
      const contentType = res.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const json = await res.json();
        root.innerHTML = `<h1>${json.title}</h1><p>${json.content}</p>`;
      } else {
        root.innerHTML = await res.text();
        nodeScriptReplace(root); // <script> 실행되도록  replace
      }
    } catch (err) {
      console.error(err);
    }
  };

  // innerHTML script 실행되도록 replace 1
  function nodeScriptReplace(node) {
    if (nodeScriptIs(node) === true) {
      node.parentNode.replaceChild(nodeScriptClone(node), node);
    } else {
      var i = -1,
        children = node.childNodes;
      while (++i < children.length) {
        nodeScriptReplace(children[i]);
      }
    }

    return node;
  }
  function nodeScriptClone(node) {
    var script = document.createElement("script");
    script.text = node.innerHTML;

    var i = -1,
      attrs = node.attributes,
      attr;
    while (++i < attrs.length) {
      script.setAttribute((attr = attrs[i]).name, attr.value);
    }
    return script;
  }

  function nodeScriptIs(node) {
    return node.tagName === "SCRIPT";
  }

  // innerHTML script 실행되도록 replace 2
  function insertHTML(html, dest, append = false) {
    // if no append is requested, clear the target element
    if (!append) dest.innerHTML = "";
    // create a temporary container and insert provided HTML code
    let container = document.createElement("div");
    container.innerHTML = html;
    // cache a reference to all the scripts in the container
    let scripts = container.querySelectorAll("script");
    // get all child elements and clone them in the target element
    let nodes = container.childNodes;
    for (let i = 0; i < nodes.length; i++)
      dest.appendChild(nodes[i].cloneNode(true));
    // force the found scripts to execute...
    for (let i = 0; i < scripts.length; i++) {
      let script = document.createElement("script");
      script.type = scripts[i].type || "text/javascript";
      if (scripts[i].hasAttribute("src")) script.src = scripts[i].src;

      script.innerHTML = scripts[i].innerHTML;
      document.head.appendChild(script);
      document.head.removeChild(script);
    }
    // done!
    return true;
  }

  // popstate 이벤트는 history entry가 변경되면 발생한다.
  // PJAX 방식은 hash를 사용하지 않으므로 hashchange 이벤트를 사용할 수 없다.
  // popstate 이벤트는 pushState에 의해 발생하지 않는다.
  // 이전페이지 / 다음페이지 button 또는 history.back() / history.go(n)에 의해 발생한다.
  window.addEventListener("popstate", (e) => {
    // e.state는 pushState 메서드의 첫번째 인수
    console.log("[popstate]", e.state);
    // 이전페이지 / 다음페이지 button이 클릭되면 render를 호출
    render(e.state.path);
  });

  // 네비게이션을 클릭하면 주소창의 url이 변경되므로 HTTP 요청이 서버로 전송된다.
  // preventDefault를 사용하여 이를 방지하고 history 관리를 위한 처리를 실시한다.
  navigation.addEventListener("click", (e) => {
    if (!e.target.matches("#navigation > li > a")) return;
    e.preventDefault();
    // 이동 페이지
    const path = e.target.getAttribute("href");

    // 주소창의 url은 변경되지만 HTTP 요청이 서버로 전송되지는 않는다.
    history.pushState({ path }, null, path);
    // path에 의한 AJAX 요청
    render(path);
  });

  // 웹페이지가 처음 로딩되었을 때
  render("/nav__home");

  // 새로고침이 클릭되었을 때, 현 페이지(예를 들어 loclahost:5004/service)가 서버에 요청된다.
  // 이에 응답하는 기능이 서버 측에 추가되어야 한다.
})();
