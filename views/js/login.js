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

function loginFunc () {
  var userID = document.getElementById("userID").value; // userid 의 값을 받아와 넣음.
  var userPW = document.getElementById("userPW").value; // userpw 의 값을 받아와 넣음.

  if(userID == "test" && userPW == "1234") {
    alert("로그인 성공");
    console.log("로그인 성공했습니다.");
  } else {
    alert("로그인 실패");
    console.log("로그인 실패했습니다.");
  }
}