(function () {
  const dbSelectList = document.getElementById("dbSelectList");
  let BACKEND_URL = "";

  if (window.location.host.indexOf("localhost") > -1 || window.location.host.indexOf("127.0.0.1") > -1) {
    BACKEND_URL = "http://localhost:8080"; // 로컬
  } else {
    BACKEND_URL = "https://sshtht-springboot-mariadb.herokuapp.com"; // 깃허브일때 -> HEROKU
  }

  console.log("BACKEND_URL:", BACKEND_URL);

  // 추가
  function addList() {
    var contents = document.querySelector(".text-basic");
    if (!contents.value) {
      alert("내용을 입력해주세요.");
      contents.focus();
      return false;
    }
    var tr = document.createElement("tr");
    var input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("class", "btn-chk");
    var td01 = document.createElement("td");
    td01.appendChild(input);
    tr.appendChild(td01);
    var td02 = document.createElement("td");
    td02.setAttribute("class", "todo-list-data");
    td02.innerHTML = contents.value;
    tr.appendChild(td02);
    document.getElementById("listBody").appendChild(tr);
    contents.value = "";
    contents.focus();
  }

  // 추가 - 목록클릭시
  function addList2(obj) {
    // 전체삭제
    var list = document.getElementById("listBody");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }

    console.log(typeof obj, obj[0].todoList);

    // 목록추가
    obj.map((v) => {
      console.log(v.todoList);
      var tr = document.createElement("tr");
      var input = document.createElement("input");
      input.setAttribute("type", "checkbox");
      input.setAttribute("class", "btn-chk");
      var td01 = document.createElement("td");
      td01.appendChild(input);
      tr.appendChild(td01);
      var td02 = document.createElement("td");
      td02.setAttribute("class", "todo-list-data");
      td02.innerHTML = v.todoList;
      tr.appendChild(td02);
      document.getElementById("listBody").appendChild(tr);
    });
  }

  // 추가 - 엔터키
  function addListEnter(event) {
    const keyCode = event.keyCode;
    if (keyCode == 13) {
      addList();
    }
  }

  // 전체삭제
  function delAllEle() {
    var list = document.getElementById("listBody");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
  }

  // 마지막 항목 삭제
  function delLastEle() {
    var body = document.getElementById("listBody");
    var list = document.querySelectorAll("#listBody > tr");
    if (list.length > 0) {
      var liLen = list.length - 1;
      body.removeChild(list[liLen]);
    } else {
      alert("삭제할 항목이 없습니다.");
      return false;
    }
  }

  // 선택 삭제
  function delSelected() {
    var body = document.getElementById("listBody");
    var chkbox = document.querySelectorAll("#listBody .btn-chk");
    for (var i in chkbox) {
      if (chkbox[i].nodeType == 1 && chkbox[i].checked == true) {
        body.removeChild(chkbox[i].parentNode.parentNode);
      }
    }
  }

  // DB 전체목록조회
  function selectToListAll() {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(BACKEND_URL + "/board/selectall", requestOptions)
      .then((response) => response.json())
      .then((result) => selectAll(result))
      .catch((error) => console.log("error", error));
  }

  function selectAll(jsonObj) {
    const ul = document.getElementById("dbSelectList");
    // 전체삭제
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
    // 목록추가
    jsonObj.map((v) => {
      var li = document.createElement("li");

      var a = document.createElement("a");
      a.setAttribute("href", v.todoDt);
      a.innerHTML = v.todoDt + " " + v.todoList;

      var btnDel = document.createElement("input");
      btnDel.textContent = "삭제";
      btnDel.setAttribute("type", "button");
      btnDel.setAttribute("id", v.todoDt);
      btnDel.setAttribute("value", "삭제");

      li.appendChild(a);
      li.appendChild(btnDel);
      ul.appendChild(li);
    });
  }

  // 하단 목록 이벤트 ( DB 상세조회 / DB 삭제 )
  dbSelectList.addEventListener("click", (e) => {
    e.preventDefault();
    if (e.target.tagName === "A") {
      selectOneList(e.target.getAttribute("href"));
    } else if (e.target.tagName === "INPUT") {
      if (window.confirm("삭제할까요?")) deleteDB(e.target.getAttribute("id"));
    }
  });

  // DB 상세조회
  function selectOneList(selectKey) {
    console.log("selectOneList");

    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(`${BACKEND_URL}/board/selectonelist?todoDt=${selectKey}`, requestOptions)
      .then((response) => response.json())
      .then((result) => addList2(result))
      .catch((error) => console.log("error", error));
  }

  // DB 삭제
  function deleteDB(deleteKey) {
    console.log("deleteDB:" + deleteKey);

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({ todoDt: deleteKey });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(BACKEND_URL + "/board/deleteone", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        selectToListAll(); // 전체조회
      })
      .catch((error) => console.log("error", error));
  }

  // DB 저장
  function saveDB() {
    if (!window.confirm("저장할까요?")) return;

    // 할일목록 배열저장
    var todolist = document.querySelectorAll(".todo-list-data");
    var insertArr = [];

    todolist.forEach(function (val, idx) {
      insertArr.push({ todoDt: getCurrentTime(), todoSeq: idx, todoList: val.textContent });
    });

    // REST 호출
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify(insertArr);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(BACKEND_URL + "/board/insertlist", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        selectToListAll(); // 전체조회
      })
      .catch((error) => console.log("error", error));
  }

  // 현재시간（yyyy/mm/dd hh:mm:ss）
  function getCurrentTime() {
    var now = new Date();
    var res =
      "" + now.getFullYear() + "/" + padZero(now.getMonth() + 1) + "/" + padZero(now.getDate()) + " " + padZero(now.getHours()) + ":" + padZero(now.getMinutes()) + ":" + padZero(now.getSeconds());
    return res;
  }

  // 현재시간 lpad 0
  function padZero(num) {
    var result;
    if (num < 10) {
      result = "0" + num;
    } else {
      result = "" + num;
    }
    return result;
  }

  // 이벤트
  document.getElementById("btnAdd").addEventListener("click", addList); // 추가
  document.getElementById("inputAdd").addEventListener("keydown", addListEnter); // 추가 - 엔터키
  document.getElementById("btnSaveDB").addEventListener("click", saveDB); // DB저장

  document.getElementById("btnDelAll").addEventListener("click", delAllEle); // 전체삭제
  document.getElementById("btnDelLast").addEventListener("click", delLastEle); // 마지막 요소 삭제
  document.getElementById("DeleteSel").addEventListener("click", delSelected); // 선택 삭제

  // 최초 로딩시 : 하단에 목록 출력
  selectToListAll();
})();
