import * as THREE from '/js/three/three.module.js';
import { objectLoader } from '/js/objectLoader.js'
import { OrbitControls } from '/js/three/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from '/js/three/CSS2DRenderer.js';
import { pointerSelect } from '/js/pointerSelect.js';
import { animateFunction } from '/js/animateFunction.js';

function appHeight() {
    const doc = document.documentElement
    doc.style.setProperty('--vh', (window.innerHeight*.01) + 'px');
  }

appHeight();

canvas = document.querySelector('#threejs');

var pRatio = window.devicePixelRatio || 1

var w = Math.round(pRatio * window.innerWidth)
var h = Math.round(pRatio * (window.innerHeight - 200 ))
canvas.width = w
canvas.height = h
//canvas.setAttribute('width', window.innerWidth);
//canvas.setAttribute('height', window.innerHeight - 200);

renderer = new THREE.WebGLRenderer({ canvas, alpha: false, });
renderer.setSize( canvas.width, canvas.height, false);
renderer.setPixelRatio( pRatio );

renderer.domElement.style.width = window.innerWidth + 'px';
renderer.domElement.style.height = window.innerHeight - 200 + 'px';

camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.01, 1000 );
camera.position.z = -2;
camera.position.y = 1;

labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( canvas.width / pRatio / pRatio , canvas.height / pRatio / pRatio );
labelRenderer.domElement.style.position = 'absolute'; 
labelRenderer.domElement.style.top = '0px';

labelRenderer.domElement.style.width = window.innerWidth + 'px';
labelRenderer.domElement.style.height = window.innerHeight - 200 + 'px';

document.querySelector('.width_full').appendChild( labelRenderer.domElement );

controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF0EEE4 );

window.addEventListener('resize', function () { 

    w = Math.round(pRatio * window.innerWidth)
    h = Math.round(pRatio * (window.innerHeight - 200 ))
    canvas.width = w
    canvas.height = h
    
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();

    renderer.setSize( canvas.width, canvas.height);
    renderer.setPixelRatio( pRatio );

    renderer.domElement.style.width = window.innerWidth + 'px';
    renderer.domElement.style.height = window.innerHeight - 200 + 'px';

    labelRenderer.setSize( canvas.width / pRatio , canvas.height / pRatio);
    labelRenderer.domElement.style.width = window.innerWidth + 'px';
    labelRenderer.domElement.style.height = window.innerHeight - 200 + 'px';

    controller.style.width = canvas.width;
    controller.style.height = canvas.height;

    appHeight();
});

new objectLoader().poseLoader();

var socket = io.connect('http://158.247.235.135:8080', {reconnection:false});
socket.on('connect', function(){

    index = 0;
    my_name = document.querySelector(".width_full").id.substring(7);
    my_position = {
        x: 0,
        y: 0,
        z: 0,
        dir: 0
    };
    my_index = 0;
    connectedUsers = [];

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x99EEFF );
    new objectLoader().landLoader();
    controls.target.set(my_position.x, my_position.y + 1.0, my_position.z);
    controls.update();
    document.addEventListener( 'mousemove', new pointerSelect().onPointerMove );
    socket.emit('newUserConnect', my_name, my_position);

});

chatWindow = document.getElementById('chatWindow');

socket.on('loadNewbieAvatar', function(avatar){
    if (avatar.newbie == my_name) {
        isLoadingMe = true;
        for(var key in avatar.user){
            var x = avatar.user[key].position.x;
            var y = avatar.user[key].position.y;
            var z = avatar.user[key].position.z;
            var dir = avatar.user[key].position.dir + Math.PI;
            raycaster = new THREE.Raycaster();
            new objectLoader().avatarLoader(key, x, y, z, dir);
        }
    } else {
        var key = avatar.newbie;
        cancelAnimationFrame(sceneAnimation);
        new objectLoader().avatarLoader(avatar.newbie, avatar.user[key].position.x, avatar.user[key].position.y, avatar.user[key].position.z, avatar.user[key].position.dir+Math.PI);
    }
})

socket.on('disconnectAvatar', function(avatar){
    if ( avatar.oldbie ){
        setTimeout(() => {

            for(var i = 0; i < connectedUsers.length; i++){
                if (connectedUsers[i] == avatar.oldbie){
                    action.splice(i, 1);
                    mixer.splice(i, 1);
                    connectedUsers.splice(i, 1);
                    scene.children.splice(i, 1);
                    i--;
                    index--;
                    if (i == connectedUsers.length -1 ) {
                        animationUsers = connectedUsers.length;
                    }
                }
            }
            
        }, 10);
    }
})

socket.on('loadUserPosition', function(avatar){
    var start = new Date();

    var cam = {};
    cam.prex = camera.position.x;
    cam.prey = camera.position.y;
    cam.prez = camera.position.z;

    new animateFunction().animateWalk(cam, avatar, start);
});

socket.on('updateMessage', function(data){
    if(data.name === '<시스템>'){

        var chatMessageEl = drawChatMessage(data);
        chatWindow.appendChild(chatMessageEl);

        chatWindow.scrollTop = chatWindow.scrollHeight;

    }else{
        var chatMessageEl = drawChatMessage(data);
        chatWindow.appendChild(chatMessageEl);

        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
});

function drawChatMessage(data){

    var wrap = document.createElement('div');
    var message = document.createElement('span');
    var name = document.createElement('span');

    name.innerText = data.name;
    message.innerText = data.message;

    name.classList.add('output__user__name');
    message.classList.add('output__user__message');

    wrap.classList.add('output__user');
    wrap.dataset.id = socket.id;
   
    wrap.appendChild(name);
    wrap.appendChild(message);
    
    for ( var i=0; i < connectedUsers.length; i++ ){
        if (connectedUsers[i] == data.name){

            if (eval('document.querySelector(".'+data.name+'")')){
                eval('document.querySelector(".'+data.name+'").remove();');
                for (var j = 0; j < scene.children[i].children.length; j++){
                    if (scene.children[i].children[j].isCSS2DObject){
                        scene.children[i].children.splice(j, 1);
                    }
                }
            }

            scene.children[i].layers.enableAll();

            const chatDiv = document.createElement( 'div' );
            chatDiv.className = data.name+' chatDiv';
            chatDiv.textContent = data.message;
            chatDiv.style.marginTop = '-1em';
            const chatLabel = new CSS2DObject( chatDiv );
            chatLabel.position.set( 0, 1.5, 0 );
            scene.children[i].add( chatLabel );
            chatLabel.layers.set( 0 );
            
            setTimeout(() => {
                if (eval('document.querySelector(".'+data.name+'")')){
                    eval('document.querySelector(".'+data.name+'").remove();');
                    for (var j = 0; j < scene.children[i].children.length; j++){
                        if (scene.children[i].children[j].isCSS2DObject){
                            scene.children[i].children.splice(j, 1);
                        }
                    }
                }
            }, 10000);

            break;

        }
    }

    return wrap;
}

document.addEventListener('keydown', function(e){
    if (e.keyCode == 13 ){
        chatFunc();
    }
});

chatBtn.addEventListener('click', chatFunc) // 'click'이란 id의 버튼을 누르면 signinFunc 함수를 실행.

function chatFunc() {
    var message = chatInput.value;
    if(!message) return false;    
    socket.emit('sendMessage', {
        message
    });
    chatInput.value = '';
}
