
// 채팅방 코드

document.querySelector('.chatToggle').addEventListener('click', function(){
    if (document.querySelector('.chatroom').classList[1]){
        document.querySelector('.chatroom').classList.remove('showChatBox');
        document.querySelector('.chatBox').classList.remove('activeChatBox');
        document.querySelector('.chatToggle').innerHTML = '<i class="bx bx-chevrons-up" ></i>';
        document.querySelector('.controlCircle').classList.remove('showChatBox');
    } else {
        document.querySelector('.chatroom').classList.add('showChatBox');
        document.querySelector('.chatBox').classList.add('activeChatBox');
        document.querySelector('.chatToggle').innerHTML = '<i class="bx bx-chevrons-down" ></i>';
        document.querySelector('.controlCircle').classList.add('showChatBox');
    }
})

const chatBtn = document.querySelector('#chatBtn');
const chatInput = document.querySelector('#chatInput');
var ifLogin = document.querySelector(".width_full").id.includes("userid_guest");

window.addEventListener('keyup', ()=>{
    if(chatInput.value.length > 0){
        chatBtn.disabled = false;
        chatBtn.classList.add('active');
    }else{
        chatBtn.disabled = true;
        chatBtn.classList.remove('active');
    }
})

