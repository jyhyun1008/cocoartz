const joinBtn = document.querySelector('#joinButton');
const inputEmail = document.querySelector('#adminEmail');
const inputID = document.querySelector('#adminID');
const inputPW = document.querySelector('#adminPW');
const confirmPW = document.querySelector('#confirmPW');

window.addEventListener('keyup', ()=>{
    if(inputPW.value.length > 0 && confirmPW.value.length >0 && inputID.value.length >0 && inputEmail.value.length >0 ){
        joinBtn.disabled = false;
        joinBtn.classList.add('active');
    }else{
        joinBtn.disabled = true;
        joinBtn.classList.remove('active');
    }
})

joinBtn.addEventListener('click', joinFunc) // 'click'이란 id의 버튼을 누르면 signinFunc 함수를 실행.

function enterKey() {
	if (window.event.keyCode == 13) {
    joinFunc();
    }
}

function joinFunc() {
  var userEmail = document.getElementById("adminEmail").value; // userid 의 값을 받아와 넣음.
  var userID = document.getElementById("adminID").value; // userid 의 값을 받아와 넣음.
  var userPW = document.getElementById("adminPW").value; // userpw 의 값을 받아와 넣음.
  var confPW = document.getElementById("adminPW").value; // confirmpw 의 값을 받아와 넣음.

  //확인용
  var emailtext = /^[A-Za-z0-9_]*[@]{1}[A-Za-z0-9]+[A-Za-z0-9]*[.]{1}[A-Za-z]{1,5}$/;
  var idtext = /^[A-Za-z0-9_]{4,20}$/;
  var pwtext1 = /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[~?!@#$%^&*_-]).{8,50}$/;
  var pwtext2 = /(\w)\1\1\1/;

  if ( !emailtext.test(userEmail) || userEmail.length > 255){
    alert("이메일 형식이 올바르지 않습니다.");
  } else if ( !idtext.test(userID) || userID.includes("guest")) {
    alert("아이디 형식이 올바르지 않거나, 시스템상 사용할 수 없는 문자열을 포함합니다.")
  } else if ( !pwtext1.test(userPW) ) {
    alert("비밀번호 형식이 올바르지 않습니다.")
  } else if ( pwtext2.test(userPW) ) {
    alert("같은 문자를 4번 이상 연속해서 사용하실 수 없습니다.")
  } else if (userPW != confPW) {
    alert('비밀번호를 확인해주세요.')
  } else {
    const req = {
        email : userEmail,
        id : userID,
        password : userPW,
    };
  
    fetch('/install',{
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req)
    }).then(function(res){
        console.log(res);
        if ( res.url.includes('install') == false ) {
          alert("계정이 정상적으로 생성되었어요.");
        } else {
          alert("어딘가 문제가 생긴 것 같습니다.");
          //alert("이미 사용중인 아이디 또는 이메일이에요.");
        }
        window.location.href = res.url;
        return res;
      });
  }

}
