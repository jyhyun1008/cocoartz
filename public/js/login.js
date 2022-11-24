const loginBtn = document.querySelector('#loginButton');
const inputID = document.querySelector('#userID');
const inputPW = document.querySelector('#userPW');

window.addEventListener('keyup', ()=>{
    if(inputPW.value.length > 0 && inputID.value.length >0 ){
        loginBtn.disabled = false;
        loginBtn.classList.add('active');
    }else{
        loginBtn.disabled = true;
        loginBtn.classList.remove('active');
    }
})

loginBtn.addEventListener('click', loginFunc) // 'click'이란 id의 버튼을 누르면 signinFunc 함수를 실행.

function enterKey() {
	if (window.event.keyCode == 13) {
    loginFunc();
    }
}

function loginFunc() {
  var userID = document.getElementById("userID").value; // userid 의 값을 받아와 넣음.
  var userPW = document.getElementById("userPW").value; // userpw 의 값을 받아와 넣음.

  const req = {
      id : userID,
      password : userPW,
  };
  console.log(req);

  fetch('/login_cookie',{
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req)
  }).then(function(res){
    console.log(res);
    if ( res.url.includes('login') == false ) {
      alert(userID+"님, 돌아오신 것을 환영해요!");
    } else {
      alert("아이디나 비밀번호가 잘못되었어요.");
    }
    window.location.href = res.url;
    return res;
  });
}
