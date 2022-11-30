import { OrbitControls } from '/js/three/OrbitControls.js';
import * as THREE from '/js/three/three.module.js';
import { FontLoader } from '/js/three/FontLoader.js';
import { GLTFLoader } from '/js/three/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from '/js/three/CSS2DRenderer.js';

const canvas = document.querySelector('#threejs');
const controller = document.querySelector('#controller');

let INTERSECTED, raycaster;
const pointer = new THREE.Vector2();
var plainpointer = {};

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF0EEE4 );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 200), 0.01, 1000 );
camera.position.z = -2;
camera.position.y = 1;

var renderer = new THREE.WebGLRenderer({ canvas, alpha: false, });
renderer.setSize( window.innerWidth, window.innerHeight - 200, false);


var labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight - 200 );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.querySelector('.width_full').appendChild( labelRenderer.domElement );

var controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

controller.style.width = window.innerWidth;
controller.style.height = window.innerHeight - 200;

var dayNight = [[255, 255, 255], [249, 197, 174], [128, 141, 173]];
var sunrise = parseInt(document.querySelector('#sunrise').innerText);
var sunset = parseInt(document.querySelector('#sunset').innerText);
var msPerMin = 60000;
var morningTwilight = sunrise - 30*msPerMin; //박명시각은 가져오기 귀찮아서 30분으로했어요.
var eveningTwilight = sunset + 30*msPerMin;

function mod(n, m) {
    return ((n % m) + m) % m;
  }

setInterval(function() {
    var WhatTimeIsIt = mod(new Date().getTime()+32400000, 86400000);
    var MorningPassed = WhatTimeIsIt - (sunrise - 30*msPerMin);
    var EveningPassed = WhatTimeIsIt - sunset;

    if (WhatTimeIsIt < morningTwilight || WhatTimeIsIt > eveningTwilight){ //밤
        controller.style.backgroundColor = 'rgba('+dayNight[2][0]+', '+dayNight[2][1]+', '+dayNight[2][2]+')';
    } else if (WhatTimeIsIt >= morningTwilight && WhatTimeIsIt <= sunrise) { //아침
        if (MorningPassed < 15*msPerMin){
            controller.style.backgroundColor = 'rgba('+(dayNight[2][0]+(MorningPassed/15/msPerMin)*(dayNight[1][0]-dayNight[2][0]))+', '+(dayNight[2][1]+(MorningPassed/15/msPerMin)*(dayNight[1][1]-dayNight[2][1]))+', '+(dayNight[2][2]+(MorningPassed/15/msPerMin)*(dayNight[1][2]-dayNight[2][2]))+')';
        } else {
            controller.style.backgroundColor = 'rgba('+(dayNight[1][0]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][0]-dayNight[1][0]))+', '+(dayNight[1][1]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][1]-dayNight[1][1]))+', '+(dayNight[1][2]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][2]-dayNight[1][2]))+')';
        }
    } else if (WhatTimeIsIt >= sunset && WhatTimeIsIt <= eveningTwilight) { //저녁
        if (EveningPassed < 15*msPerMin){
            controller.style.backgroundColor = 'rgba('+(dayNight[0][0]+(EveningPassed/15/msPerMin)*(dayNight[1][0]-dayNight[0][0]))+', '+(dayNight[0][1]+(EveningPassed/15/msPerMin)*(dayNight[1][1]-dayNight[0][1]))+', '+(dayNight[0][2]+(EveningPassed/15/msPerMin)*(dayNight[1][2]-dayNight[0][2]))+')';
        } else {
            controller.style.backgroundColor = 'rgba('+(dayNight[1][0]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][0]-dayNight[1][0]))+', '+(dayNight[1][1]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][1]-dayNight[1][1]))+', '+(dayNight[1][2]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][2]-dayNight[1][2]))+')';
        }
    } else { //낮
        controller.style.backgroundColor = 'rgba('+dayNight[0][0]+', '+dayNight[0][1]+', '+dayNight[0][2]+')';
    }
    setTimeout(()=>{
        if (controller.className === undefined){
            controller.className = 'dayNight';
        }
    }, 0);
}, 1000)

window.addEventListener('resize', function () { 

    camera.aspect = window.innerWidth / (window.innerHeight - 200);
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight - 200 );
    labelRenderer.setSize( window.innerWidth, window.innerHeight - 200 );

    controller.style.width = window.innerWidth;
    controller.style.height = window.innerHeight - 200;
});

const avatarload = new GLTFLoader();
const landload = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

var itemArr = ['hair', 'top', 'bottom', 'shoes'];
var pose = [];
var action = [];

avatarload.load( '/assets/poses/standingPose.gltf', function ( standing ) {
    pose.push(standing.animations[0]);

    avatarload.load( '/assets/models/base/ChrBase.gltf', function ( walking ) {
        pose.push(walking.animations[0]);
    });
});

var fontcolor = 0x70594D;

var clock = new THREE.Clock();

var connectedUsers = [];
var mixer = [];
var index = 0;

var sceneAnimation;

function landLoader(){
    landload.load( '/assets/models/land/IslandBase.gltf', function ( gltf ) {
        var land = gltf.scene;
        
        land.children[0].material = new THREE.MeshBasicMaterial({ color: 0x009900 });
        land.children[0].material.side = THREE.DoubleSide;
        land.itemType = 'space';
        scene.add( land );
        index++;
    });
    landload.load( '/assets/models/land/SkyBase.gltf', function ( gltf ) {
        var sky = gltf.scene;
        
        sky.children[0].material = new THREE.MeshBasicMaterial({ color: 0x99eeff });
        sky.children[0].material.side = THREE.BackSide;
        sky.itemType = 'space';
        scene.add( sky );
        index++;
    });
    landload.load('/assets/models/block/BasicHouse.gltf', function (gltf) {
        var item = gltf.scene;
        var itemtex = item.children[0];

        var texture = new THREE.TextureLoader().load('/assets/textures/colormap.png');
        itemtex.material = new THREE.MeshBasicMaterial({ map: texture });

        item.position.x = 0;
        item.position.z = -3;

        item.itemType = 'house';
        item.userName = 'String';

        scene.add( item );
        index++;


    })
}

function avatarLoader(name, x, y, z, dir) {

    var text;

    const loader = new FontLoader();
    loader.load( 'https://unpkg.com/three@0.77.0/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {

        const matLite = new THREE.MeshBasicMaterial( {
            color: fontcolor,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        } );

        const shapes = font.generateShapes( '', 0.1);
        const geometry = new THREE.ShapeGeometry( shapes );
        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        geometry.translate( xMid, 0, 0 );

        text = new THREE.Mesh( geometry, matLite );
        text.position.x = x;
        text.position.y = y + 1.5;
        text.position.z = z;

        text.itemType = 'text';
        text.userName = name;

        scene.add( text );
        connectedUsers[index] = name;
        index++;

    });

    var skeleton, base;
    
    avatarload.load( '/assets/models/base/ChrBase.gltf', function ( gltf ) {
        base = gltf.scene;

        base.isMesh = true;
        base.type = 'Mesh';

        var basetex = base.children[0].children[1];

        var texture = new THREE.TextureLoader().load('/assets/textures/base/ChrBaseTexturem.png');
        basetex.material = new THREE.MeshBasicMaterial({ map: texture });

        skeleton = new THREE.SkeletonHelper( base );
        skeleton.visible = false;

        base.itemType = 'avatar';
        base.userName = name;

        base.position.x = x;
        base.position.y = y;
        base.position.z = z;
        base.children[0].rotation.z = dir;

        scene.add( base );
        base.add( skeleton );

        eval('mixer['+index+'] = new THREE.AnimationMixer( base )');
        connectedUsers[index] = name;
        index++;

    });

    var items = { hair:'hair/BasicHair', top: 'top/BasicTop', bottom: 'bottom/BasicPants', shoes:'shoes/BasicShoes'};

    var Meshs = {};

    setTimeout(() => {

        for(var i=0; i<itemArr.length; i++){
            (a => {
              setTimeout(() => {
                
            avatarload.load('/assets/models/'+eval('items.'+itemArr[a])+'.gltf', function( item ){
                eval('Meshs.'+itemArr[a]+' = item');
                eval('Meshs.'+itemArr[a]+'.scene = item.scene');
                eval('Meshs.'+itemArr[a]+'.scene.isMesh = true');
                eval('Meshs.'+itemArr[a]+'.scene.type = "Mesh"');
                var itemString = eval('items.'+itemArr[a]);
                eval('Meshs.'+itemArr[a]+'.scene.position.x = x');
                eval('Meshs.'+itemArr[a]+'.scene.position.y = y');
                eval('Meshs.'+itemArr[a]+'.scene.position.z = z');
                eval('Meshs.'+itemArr[a]+'.scene.children[0].rotation.z = dir');
                eval("Meshs."+itemArr[a]+".scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/assets/textures/'+itemString+'m.png') });");
                eval('Meshs.'+itemArr[a]+'.scene.children[0].children[1].material.side = THREE.DoubleSide;');
                eval('Meshs.'+itemArr[a]+'.scene.itemType = "avatar";');
                eval('Meshs.'+itemArr[a]+'.scene.userName = "'+name+'";');

                eval('scene.add( Meshs.'+itemArr[a]+'.scene );');
                eval('Meshs.'+itemArr[a]+'.scene.add( skeleton );');
                eval('mixer['+index+'] = new THREE.AnimationMixer( Meshs.'+itemArr[a]+'.scene )');
                connectedUsers[index] = name;
                index++;
                if (a == itemArr.length - 1){
                    setTimeout(()=>{
                        actionPusher(pose);
                        console.log(pose);
                        console.log(action);
                        setTimeout(()=>{
                            animate();
                            console.log(scene);
                        }, 300)
                    }, 2700)
                }
            })
              },10*a)
            })(i)
        }
    }, 50)
}

function actionPusher(pose){
    for (var i=0; i < connectedUsers.length; i++){
        action.push([]);
        for (var j=0; j < pose.length; j++){
            if (mixer[i] !== undefined){
                action[i].push( mixer[i].clipAction( pose[j] ).play() );
            }
        }
    }
}

var my_name = document.querySelector(".width_full").id.substring(7);

var my_position = {
    x: 0,
    y: 0,
    z: 0,
    dir: 0
};

var socket = io();
socket.on('connect', function(){

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x99EEFF );

    landLoader();

    controls.target.set(my_position.x, my_position.y + 1.0, my_position.z);
    controls.update();

    document.addEventListener( 'mousemove', onPointerMove );

    socket.emit('newUserConnect', my_name, my_position);

});

document.addEventListener('keydown', function(e){
    if (e.keyCode == 37 || e.keyCode == 38  || e.keyCode == 39 || e.keyCode == 40){

        var xdir = my_position.x - camera.position.x;
        var zdir = camera.position.z - my_position.z;

        if (zdir > 0){
            my_position.dir = (Math.atan((xdir)/(zdir)))%(2*Math.PI);
        } else {
            my_position.dir = (-Math.PI + Math.atan((xdir)/(zdir)))%(2*Math.PI);
        }

        if (e.keyCode==37) { //왼쪽
            my_position.x -= 2* Math.cos(my_position.dir);
            my_position.z -= 2* Math.sin(my_position.dir);
            my_position.dir -= Math.PI/2;
        } else if (e.keyCode==38) { //위
            my_position.x += 2* Math.sin(my_position.dir);
            my_position.z -= 2* Math.cos(my_position.dir);
        } else if (e.keyCode==39) { //오른쪽
            my_position.x += 2* Math.cos(my_position.dir);
            my_position.z += 2* Math.sin(my_position.dir);
            my_position.dir += Math.PI/2;
        } else if (e.keyCode==40) { //아래
            my_position.x -= 2* Math.sin(my_position.dir);
            my_position.z += 2* Math.cos(my_position.dir);
            my_position.dir += Math.PI
        }
        
        socket.emit('positionChanged', my_name, my_position);
    }
});

function onPointerMove( event ) {
    pointer.x = (( event.clientX / window.innerWidth ) * 2 - 1);
    pointer.y = (- ( (event.clientY-100) / (window.innerHeight - 200) ) * 2 + 1);
    plainpointer.x = event.clientX;
    plainpointer.y = event.clientY;
}

socket.on('loadNewbieAvatar', function(avatar){
    if (avatar.newbie == my_name) {
        for(var key in avatar.user){
            var x = avatar.user[key].position.x;
            var y = avatar.user[key].position.y;
            var z = avatar.user[key].position.z;
            var dir = avatar.user[key].position.dir + Math.PI;
            raycaster = new THREE.Raycaster();
            avatarLoader(key, x, y, z, dir);
        }
    } else {
        var key = avatar.newbie;
        avatarLoader(avatar.newbie, avatar.user[key].position.x, avatar.user[key].position.y, avatar.user[key].position.z, avatar.user[key].position.dir+Math.PI);
        controls.update();
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
                        controls.update();
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

    animateWalk(cam, avatar, start);
    controls.update();
})


var animate = function () {
    sceneAnimation = requestAnimationFrame( animate );
    var now = clock.getDelta();

        for(var i = 0; i < connectedUsers.length; i++){
            if ( scene.children[i].itemType == 'avatar' ){
                for (var j = 0; j < pose.length; j++){
                    if (action[i] === undefined){
                        cancelAnimationFrame(sceneAnimation);
                        setTimeout(()=>{
                            animate();
                        }, 100)
                    } else {
                        if (j == 0){
                            action[i][j].weight=1;
                        } else {
                            action[i][j].weight=0;
                        }
                    }
                }
                mixer[i].update(now);
            }
        }
        setTimeout(()=>{
            controls.update();
            render();
        }, 0);
};

function animateWalk(cam, userId, startTime) {

    var now = clock.getDelta();
    var timeDiff = new Date() - startTime;

    for(var i = 0; i < connectedUsers.length; i++){
        
        if (connectedUsers[i] == userId.name){
            var divider = 1000;

            scene.children[i].position.x = userId.prex + timeDiff/divider * (userId.posx - userId.prex);
            scene.children[i].position.y = userId.prey + timeDiff/divider * (userId.posy - userId.prey);
            scene.children[i].position.z = userId.prez + timeDiff/divider * (userId.posz - userId.prez);
            if ( scene.children[i].itemType == 'avatar' ) {
                scene.children[i].children[0].rotation.z = userId.posdir + Math.PI;

                for (var j = 0; j < pose.length; j++){
                    if (j == 1){
                        action[i][j].weight=1;
                    } else {
                        action[i][j].weight=0;
                    }
                }
                mixer[i].update(now);
                
            } else if ( scene.children[i].itemType == 'text' ) {
                scene.children[i].position.y += 1.5;
                scene.children[i].rotation.y = userId.posdir + Math.PI;

                if (my_name == userId.name){
                
                    cam.posx = userId.prex;
                    cam.posy = userId.prey+1.5;
                    cam.posz = userId.prez;

                    camera.position.x = cam.prex + timeDiff/1000 * (cam.posx - cam.prex);
                    camera.position.y = cam.prey + timeDiff/1000 * (cam.posy - cam.prey);
                    camera.position.z = cam.prez + timeDiff/1000 * (cam.posz - cam.prez);
                    controls.target.set(scene.children[i].position.x, scene.children[i].position.y -0.5, scene.children[i].position.z);

                }
            }
        }
    }

    //setTimeout(()=>{
        controls.update();
        render();
    //}, 0)

    if (timeDiff < 1000) {
        requestAnimationFrame( function(){
            animateWalk(cam, userId, startTime);
        } );
    } else if (timeDiff >= 1000) {
        
        animate();
    }
}

function render() {
    raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children, true );
    for ( var i = 0; i < intersects.length; i++){
        if (intersects[i].object.type == "SkeletonHelper" || intersects[i].object.parent.itemType == 'space'){
            intersects.splice(i, 1);
            i--;
        }
    }
        if ( intersects.length > 0) {
            if (INTERSECTED != intersects[0].object){
                if (INTERSECTED) {

                    if (document.querySelector('.nameTag')){
                        var removeDiv = document.querySelector('.nameTag');
                        removeDiv.remove();
                    }
                    INTERSECTED.material.color.r = 1;
                    INTERSECTED.material.color.g = 1;
                    INTERSECTED.material.color.b = 1;
                }

                INTERSECTED = intersects[0].object;
                if (document.getElementsByClassName('nameTag').length == 0 && INTERSECTED.parent.parent.itemType){

                    var newDiv = document.createElement("div");
                    newDiv.style.position = "fixed";
                    newDiv.style.zIndex = 2;
                    newDiv.classList.add('nameTag');
                    newDiv.classList.add('output__user__name');
                    newDiv.style.left = plainpointer.x;
                    newDiv.style.top = plainpointer.y;
                    var newContent = document.createTextNode(INTERSECTED.parent.parent.userName);
                    newDiv.appendChild(newContent);
                    document.getElementsByClassName("width_full")[0].appendChild(newDiv);

                    INTERSECTED.material.color.r=1;
                    INTERSECTED.material.color.g=0.8;
                    INTERSECTED.material.color.b=0.7;

                }
            }

        } else {
            if (document.querySelector('.nameTag')){
                var removeDiv = document.querySelector('.nameTag');
                removeDiv.remove();
            }
            if ( INTERSECTED ) {
                INTERSECTED.material.color.r = 1;              
                INTERSECTED.material.color.g = 1;
                INTERSECTED.material.color.b = 1;
            }
            INTERSECTED = null;
        }
        renderer.render( scene, camera );
        labelRenderer.render( scene, camera );

}

// 여기 아래부터는 채팅 관련 코드

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

var socket = io();
var members = [];

console.log(members);

//var info = document.getElementById('info');
var chatWindow = document.getElementById('chatWindow');

socket.on('updateMessage', function(data){
    if(data.name === '<시스템>'){
        //info.innerText = '채팅방 ('+data.members+')';

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
            chatLabel.position.set( 0, 0.5, 0 );
            scene.children[i].add( chatLabel );
            chatLabel.layers.set( 0 );

            console.log('document.querySelector(".'+data.name+' chatDiv")')
        
            setTimeout(() => {
                eval('document.querySelector(".'+data.name+'").remove();');
                for (var j = 0; j < scene.children[i].children.length; j++){
                    if (scene.children[i].children[j].isCSS2DObject){
                        scene.children[i].children.splice(j, 1);
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