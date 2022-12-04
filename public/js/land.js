import { OrbitControls } from '/js/three/OrbitControls.js';
import * as THREE from '/js/three/three.module.js';
import { GLTFLoader } from '/js/three/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from '/js/three/CSS2DRenderer.js';


// 채팅방 토글

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


// 3d 로딩 관련

const canvas = document.querySelector('#threejs');
const controller = document.querySelector('#controller');
const manager = new THREE.LoadingManager();

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

//일단먼저 합성부터함
var skytexture = new THREE.TextureLoader().load('/assets/textures/land/BasicSkyNight.png');

setInterval(function() {
    var WhatTimeIsIt = mod(new Date().getTime()+32400000, 86400000);
    var MorningPassed = WhatTimeIsIt - (sunrise - 30*msPerMin);
    var EveningPassed = WhatTimeIsIt - sunset;

    if (WhatTimeIsIt < morningTwilight || WhatTimeIsIt > eveningTwilight){ //밤
        controller.style.backgroundColor = 'rgba('+dayNight[2][0]+', '+dayNight[2][1]+', '+dayNight[2][2]+')';
        skytexture = new THREE.TextureLoader().load('/assets/textures/land/BasicSkyNight.png');
        if (skyIndex >= 0){
            scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
            scene.children[skyIndex].children[0].material.side = THREE.BackSide;
        }
    } else if (WhatTimeIsIt >= morningTwilight && WhatTimeIsIt <= sunrise) { //아침
        if (MorningPassed < 15*msPerMin){
            controller.style.backgroundColor = 'rgba('+(dayNight[2][0]+(MorningPassed/15/msPerMin)*(dayNight[1][0]-dayNight[2][0]))+', '+(dayNight[2][1]+(MorningPassed/15/msPerMin)*(dayNight[1][1]-dayNight[2][1]))+', '+(dayNight[2][2]+(MorningPassed/15/msPerMin)*(dayNight[1][2]-dayNight[2][2]))+')';

            mergeImages([
                { src: '/assets/textures/land/BasicSkyNight.png' },
                { src: '/assets/textures/land/BasicSkySunset.png', opacity: MorningPassed / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            if (skyIndex >= 0){
                scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                scene.children[skyIndex].children[0].material.side = THREE.BackSide;
            }

        } else {
            controller.style.backgroundColor = 'rgba('+(dayNight[1][0]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][0]-dayNight[1][0]))+', '+(dayNight[1][1]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][1]-dayNight[1][1]))+', '+(dayNight[1][2]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][2]-dayNight[1][2]))+')';

            mergeImages([
                { src: '/assets/textures/land/BasicSkySunset.png' },
                { src: '/assets/textures/land/BasicSky.png', opacity: (MorningPassed - 15*msPerMin) / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            if (skyIndex >= 0){
                scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                scene.children[skyIndex].children[0].material.side = THREE.BackSide;
            }
        }
    } else if (WhatTimeIsIt >= sunset && WhatTimeIsIt <= eveningTwilight) { //저녁
        if (EveningPassed < 15*msPerMin){
            controller.style.backgroundColor = 'rgba('+(dayNight[0][0]+(EveningPassed/15/msPerMin)*(dayNight[1][0]-dayNight[0][0]))+', '+(dayNight[0][1]+(EveningPassed/15/msPerMin)*(dayNight[1][1]-dayNight[0][1]))+', '+(dayNight[0][2]+(EveningPassed/15/msPerMin)*(dayNight[1][2]-dayNight[0][2]))+')';

            mergeImages([
                { src: '/assets/textures/land/BasicSky.png' },
                { src: '/assets/textures/land/BasicSkySunset.png', opacity: EveningPassed / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            if (skyIndex >= 0){
                scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                scene.children[skyIndex].children[0].material.side = THREE.BackSide;
            }
        } else {
            controller.style.backgroundColor = 'rgba('+(dayNight[1][0]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][0]-dayNight[1][0]))+', '+(dayNight[1][1]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][1]-dayNight[1][1]))+', '+(dayNight[1][2]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][2]-dayNight[1][2]))+')';

            mergeImages([
                { src: '/assets/textures/land/BasicSkySunset.png' },
                { src: '/assets/textures/land/BasicSkyNight.png', opacity: (EveningPassed - 15*msPerMin) / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            if (skyIndex >= 0){
                scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                scene.children[skyIndex].children[0].material.side = THREE.BackSide;
            }
        }
    } else { //낮
        controller.style.backgroundColor = 'rgba('+dayNight[0][0]+', '+dayNight[0][1]+', '+dayNight[0][2]+')';
        skytexture = new THREE.TextureLoader().load('/assets/textures/land/BasicSky.png');
        if (skyIndex >= 0){
            scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
            scene.children[skyIndex].children[0].material.side = THREE.BackSide;
        }
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
var lastindex;
var skyIndex;

var sceneAnimation;

function landLoader(){
    landload.load( '/assets/models/land/IslandBase.gltf', function ( gltf ) {
        var land = gltf.scene;
        
        land.children[0].material = new THREE.MeshBasicMaterial({ color: 0x009900 });
        land.children[0].material.side = THREE.DoubleSide;
        land.itemType = 'space';
        collidableMeshList.push(land);
        scene.add( land );
        index++;
    });
    landload.load( '/assets/models/land/SkyBase.gltf', function ( gltf ) {
        var sky = gltf.scene;

        skyIndex = index;
        
        sky.itemType = 'space';
        scene.add( sky );
        index++;
    });
    landload.load('/assets/models/block/BasicHouse.gltf', function (gltf) {
        var item = gltf.scene;
        var itemtex = item.children[0];

        var texture = new THREE.TextureLoader().load('/assets/textures/block/BasicHousem.png');
        itemtex.material = new THREE.MeshBasicMaterial({ map: texture });

        item.position.x = 0;
        item.position.z = 3;
        item.rotation.y = Math.PI;

        item.itemType = 'house';
        item.userName = 'String';

        scene.add( item );
        index++;


    });
    landload.load('/assets/models/plant/BasicTree.gltf', function (gltf) {
        var item = gltf.scene;
        var itemtex = item.children[0];

        var texture = new THREE.TextureLoader().load('/assets/textures/plant/BasicTreem.png');
        itemtex.material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });

        item.position.x = -1;
        item.position.z = -3;
        item.rotation.y = Math.PI;

        item.itemType = 'plant';
        item.userName = 'String';

        collidableMeshList.push(item);

        scene.add( item );
        index++;


    });
}

var isLoadingMe = false;

function avatarLoader(name, x, y, z, dir) {

    lastindex = index;

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
        

        const rootBone = skeleton.bones[ 0 ];
        basetex.add( rootBone );

        //bind the skeleton to the mesh

        //basetex.bind( skeleton );


        base.itemType = 'body';
        base.userName = name;

        base.children[0].position.x = x;
        base.children[0].position.y = y;
        base.children[0].position.z = z;

        console.log(base);
        base.children[0].rotation.z = dir;


        scene.add( base );
        base.add( skeleton );
        
        if (name == my_name){
            my_index = index;
        }

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
                //eval('Meshs.'+itemArr[a]+'.scene.add( skeleton );');
                eval('mixer['+index+'] = new THREE.AnimationMixer( Meshs.'+itemArr[a]+'.scene )');
                connectedUsers[index] = name;
                index++;
                if (a == itemArr.length - 1){
                    if (isLoadingMe){
                        var timeOut = 500;
                        isLoadingMe = false;
                    } else {
                        var timeOut = 20;
                    }
                    setTimeout(()=>{
                        actionPusher(pose);
                        setTimeout(()=>{
                            animate();
                            console.log(scene);
                        }, 100)
                    }, timeOut)
                }
            })
              },5*a)
            })(i)
        }
    }, 50)
}

function actionPusher(pose){
    for (var i = lastindex; i < connectedUsers.length; i++){
        action.push([]);
        for (var j=0; j < pose.length; j++){
            if (mixer[i] !== undefined){
                action[i].push( mixer[i].clipAction( pose[j] ).play() );
                console.log('포즈를 넣었어요!');
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

var my_index = 0;

var collidableMeshList = [];

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

var arrCircle = document.querySelector(".centerCircle");

arrCircle.addEventListener( "mousemove", mousemove );
arrCircle.addEventListener( "mousedown", mousedown );
arrCircle.addEventListener( "mouseup", mouseup );
arrCircle.addEventListener( "mouseleave", mouseup );

arrCircle.addEventListener( "touchstart", mousedown );
arrCircle.addEventListener( "touchmove", mousemove );
arrCircle.addEventListener( "touchend", mouseup );
arrCircle.addEventListener( "touchleave", mouseup );
arrCircle.addEventListener( "touchcancel", mouseup );

var svg = document.querySelector(".controlCircle");
var bb = svg.getBoundingClientRect();

var originY = 75;
var originX = 75;

var iCircleX, iCircleY;
var iStartX, iStartY;
var iX, iY;

var timerStart;
var timerIndex;

function mousedown(e) {
    if (e.touches) {e = e.touches[0];}
    iStartX = e.clientX - bb.left;
    iStartY = e.clientY - bb.top;

    iCircleX = 75;
    iCircleY = 75;
    e.target.setAttribute("isDrag", 1);

    timerStart = new Date();
    timerIndex = 0;
}


function mousemove(e)
{
    if (e.touches) {e = e.touches[0];}

    var timer = new Date() - timerStart;
    var iIsDrag = e.target.getAttribute( "isDrag" );

    var xdir = my_position.x - camera.position.x;
    var zdir = camera.position.z - my_position.z;
    var pre_position = my_position;

    if (zdir > 0){
        my_position.dir = (Math.atan((xdir)/(zdir)))%(2*Math.PI);
    } else {
        my_position.dir = (-Math.PI + Math.atan((xdir)/(zdir)))%(2*Math.PI);
    }

    if( iIsDrag  && (timer > timerIndex * 500)) {
        iIsDrag = parseInt( iIsDrag );

        if( iIsDrag == 1 ) {
            iX = (e.clientX - bb.left) - iStartX + iCircleX;
            iY = (e.clientY - bb.top) - iStartY + iCircleY;

            e.target.setAttribute( "cx", iX );
            e.target.setAttribute( "cy", iY );

            if (iX-75 != 0 || -iY+75 != 0){

                if ( iX - 75 < 0) {
                    var angle = (Math.atan((-iY+75)/(iX-75)) + Math.PI)% (2*Math.PI);
                } else {
                    var angle = (Math.atan((-iY+75)/(iX-75)))% (2*Math.PI);
                }
                
                if (angle !== NaN ){
                    my_position.x += 1* Math.cos(angle - my_position.dir);
                    my_position.z -= 1* Math.sin(angle - my_position.dir);
                    my_position.dir = (- angle + my_position.dir + Math.PI/2)% (2*Math.PI);
                    //console.log(my_position.x, my_position.z, angle, my_position.dir);
                    collisionDetection(pre_position);
                }
                timerIndex++;
            }
        }
    }
}

function mouseup(e){
    var iIsDrag = e.target.getAttribute( "isDrag" );

    if( iIsDrag ) {
        iIsDrag = parseInt( iIsDrag );

        if( iIsDrag == 1 ) {
            iX = (e.clientX - bb.left) - iStartX + iCircleX;
            iY = (e.clientY - bb.top) - iStartY + iCircleY;

            e.target.setAttribute( "cx", originX );
            e.target.setAttribute( "cy", originY );
            e.target.setAttribute( "isDrag", 0 );
        }
    }
}

let walker;

document.addEventListener('keydown', function(e){
    if (e.keyCode == 37 || e.keyCode == 38  || e.keyCode == 39 || e.keyCode == 40){
        
        if (e.repeat) return;

        var xdir = my_position.x - camera.position.x;
        var zdir = camera.position.z - my_position.z;

        var pre_position = my_position;
        
        if (zdir > 0){
            my_position.dir = (Math.atan((xdir)/(zdir)))%(2*Math.PI);
        } else {
            my_position.dir = (-Math.PI + Math.atan((xdir)/(zdir)))%(2*Math.PI);
        }
        
        if (e.keyCode==37) { //왼쪽
            my_position.x -= 1* Math.cos(my_position.dir);
            my_position.z -= 1* Math.sin(my_position.dir);
            my_position.dir -= Math.PI/2;
        } else if (e.keyCode==38) { //위
            my_position.x += 1* Math.sin(my_position.dir);
            my_position.z -= 1* Math.cos(my_position.dir);
        } else if (e.keyCode==39) { //오른쪽
            my_position.x += 1* Math.cos(my_position.dir);
            my_position.z += 1* Math.sin(my_position.dir);
            my_position.dir += Math.PI/2;
        } else if (e.keyCode==40) { //아래
            my_position.x -= 1* Math.sin(my_position.dir);
            my_position.z += 1* Math.cos(my_position.dir);
            my_position.dir += Math.PI
        }
        collisionDetection(pre_position);


        walker = setInterval(() => {
            var xdir = my_position.x - camera.position.x;
            var zdir = camera.position.z - my_position.z;
            
            if (zdir > 0){
                my_position.dir = (Math.atan((xdir)/(zdir)))%(2*Math.PI);
            } else {
                my_position.dir = (-Math.PI + Math.atan((xdir)/(zdir)))%(2*Math.PI);
            }
            
            var pre_position = my_position;
            
            if (e.keyCode==37) { //왼쪽
                my_position.x -= 1* Math.cos(my_position.dir);
                my_position.z -= 1* Math.sin(my_position.dir);
                my_position.dir -= Math.PI/2;
            } else if (e.keyCode==38) { //위
                my_position.x += 1* Math.sin(my_position.dir);
                my_position.z -= 1* Math.cos(my_position.dir);
            } else if (e.keyCode==39) { //오른쪽
                my_position.x += 1* Math.cos(my_position.dir);
                my_position.z += 1* Math.sin(my_position.dir);
                my_position.dir += Math.PI/2;
            } else if (e.keyCode==40) { //아래
                my_position.x -= 1* Math.sin(my_position.dir);
                my_position.z += 1* Math.cos(my_position.dir);
                my_position.dir += Math.PI
            }

            collisionDetection(pre_position);
        }, 500);
    }
});

document.addEventListener('keyup', function(e) {
    clearInterval(walker);
  });

function onPointerMove( event ) {
    pointer.x = (( event.clientX / window.innerWidth ) * 2 - 1);
    pointer.y = (- ( (event.clientY-100) / (window.innerHeight - 200) ) * 2 + 1);
    plainpointer.x = event.clientX;
    plainpointer.y = event.clientY;
}

    //collision detection
function collisionDetection(pre_position){

    var originPoint = scene.children[my_index].children[0].children[0].geometry.getAttribute('position');

    const localVertex = new THREE.Vector3();
    const globalVertex = new THREE.Vector3();

    for (var i = 0; i < originPoint.count; i++)
    {		
        localVertex.fromBufferAttribute( originPoint, i );
        globalVertex.copy( localVertex ).applyMatrix4( scene.children[my_index].children[0].children[0].matrixWorld );  
    }
    const directionVector = globalVertex.sub( scene.children[my_index].position );
    var ray = new THREE.Raycaster( new THREE.Vector3(my_position.x, my_position.y+1, my_position.z), directionVector.normalize() );
    var collisionResults = ray.intersectObjects( collidableMeshList , true);

    if ( collisionResults.length > 0 && collisionResults[0].distance <= directionVector.length()){
        my_position = pre_position;
    } else {
       yDirectionCollision();
    }
    controls.update();
}

var freeFall;
function yDirectionCollision(){

    const directionVector = new THREE.Vector3(0, 0.1, 0);
    var ray = new THREE.Raycaster( new THREE.Vector3(my_position.x, my_position.y, my_position.z), directionVector.normalize() );
    var collisionResults = ray.intersectObjects( collidableMeshList , true);

    if ( collisionResults.length > 0 && collisionResults[0].distance - 0.05 <= directionVector.length()){
        socket.emit('positionChanged', my_name, my_position);
        
    } else if (my_position.y > -3) {
        socket.emit('positionChanged', my_name, my_position);
        freeFall = setInterval(() => {
                my_position.y -= 0.2;
                camera.position.y -= 0.2;
                socket.emit('positionChanged', my_name, my_position);
                if (my_position.y <= -1.5) {
                    clearInterval(freeFall);
                    my_position = {
                        x: 0,
                        y: 0,
                        z: 0,
                        dir: 0
                    };
                    //camera.position.set(0, 1, -2);
                    //controls.target.set(my_position.x, my_position.y +1, my_position.z);

                    socket.emit('mineCraft', my_name);
                    socket.emit('positionChanged', my_name, my_position);
                }
            }, 500);
    } else if (collisionResults[0].distance - 0.05 - directionVector.length() <= 0.5) {
        addY = collisionResults[0].distance - directionVector.length()
        console.log('앞의 지대가 높아요.');
        my_position.y += addY;
        camera.position.y += addY;

        controls.target.set(my_position.x, my_position.y +1, my_position.z);
        socket.emit('positionChanged', my_name, my_position);

    }
    controls.update();
}

socket.on('loadNewbieAvatar', function(avatar){
    if (avatar.newbie == my_name) {
        isLoadingMe = true;
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
        cancelAnimationFrame(sceneAnimation);
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
            if ( scene.children[i].itemType == 'body' || scene.children[i].itemType == 'avatar' ){
                for (var j = 0; j < pose.length; j++){
                    if (action[i] === undefined){
                        cancelAnimationFrame(sceneAnimation);
                        setTimeout(()=>{
                            console.log("랙걸리는중");
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
        //setTimeout(()=>{
            controls.update();
            render();
        //}, 0);
};

function animateWalk(cam, userId, startTime) {

    var now = clock.getDelta();
    var timeDiff = new Date() - startTime;

    for(var i = 0; i < connectedUsers.length; i++){
        
        if (connectedUsers[i] == userId.name){
            var divider = 500;

            if ( scene.children[i].itemType == 'body' || scene.children[i].itemType == 'avatar'){
                if (my_name == userId.name){

                    var walkDistance = Math.sqrt((userId.posx - userId.prex)**2+(userId.posy - userId.prey)**2+(userId.posz - userId.prez)**2);
                
                    cam.posx = userId.prex - 2 * (userId.posx - userId.prex) / walkDistance;
                    cam.posy = userId.prey - 2 * (userId.posy - userId.prey) / walkDistance + 1.5;
                    cam.posz = userId.prez - 2 * (userId.posz - userId.prez) / walkDistance;

                    camera.position.x = cam.prex + timeDiff/divider * (cam.posx - cam.prex);
                    camera.position.y = cam.prey + timeDiff/divider * (cam.posy - cam.prey);
                    camera.position.z = cam.prez + timeDiff/divider * (cam.posz - cam.prez);
                    controls.target.set(scene.children[i].position.x, scene.children[i].position.y +1, scene.children[i].position.z);

                }

                scene.children[i].position.x = userId.prex + timeDiff/divider * (userId.posx - userId.prex);
                scene.children[i].position.y = userId.prey + timeDiff/divider * (userId.posy - userId.prey);
                scene.children[i].position.z = userId.prez + timeDiff/divider * (userId.posz - userId.prez);
                scene.children[i].children[0].rotation.z = userId.posdir + Math.PI;

                for (var j = 0; j < pose.length; j++){
                    if (j == 1){
                        action[i][j].weight=1;
                    } else {
                        action[i][j].weight=0;
                    }
                }
                mixer[i].update(now);

            }
        }
    }

        controls.update();
        render();

    if (timeDiff < 500) {
        requestAnimationFrame( function(){

            animateWalk(cam, userId, startTime);
        } );
    } else if (timeDiff >= 500) {
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

var chatWindow = document.getElementById('chatWindow');

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
