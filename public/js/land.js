import { OrbitControls } from '/js/three/OrbitControls.js';
import * as THREE from '/js/three/three.module.js';
import { FontLoader } from '/js/three/FontLoader.js';
import { GLTFLoader } from '/js/three/GLTFLoader.js';

const canvas = document.querySelector('#threejs');
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF0EEE4 );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 200), 0.1, 1000 );
camera.position.z = 3;

var renderer = new THREE.WebGLRenderer({ canvas, alpha: false, });
renderer.setSize( window.innerWidth, window.innerHeight - 200, false);

var controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

window.addEventListener('resize', function () { 

    var newCamera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 200), 0.1, 1000 );
    renderer.setSize( window.innerWidth, window.innerHeight - 200, false);

    setTimeout(()=>{
        newCamera.position.x = camera.position.x;
        newCamera.position.y = camera.position.y;
        newCamera.position.z = camera.position.z;
        camera = newCamera;

        controls = new OrbitControls( camera, renderer.domElement );
        controls.target.set(my_position.x, my_position.y + 1.0, my_position.z);
        controls.update();
        controls.enablePan = false;
        controls.enableDamping = true;
    }, 0)

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
        actionPusher('land', pose);
    });
    landload.load( '/assets/models/land/SkyBase.gltf', function ( gltf ) {
        var sky = gltf.scene;
        
        sky.children[0].material = new THREE.MeshBasicMaterial({ color: 0x00eeff });
        sky.children[0].material.side = THREE.BackSide;
        sky.itemType = 'space';
        scene.add( sky );
        actionPusher('land', pose);
    });
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

        const shapes = font.generateShapes( name, 0.1);
        const geometry = new THREE.ShapeGeometry( shapes );
        geometry.computeBoundingBox();

        const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
        geometry.translate( xMid, 0, 0 );

        text = new THREE.Mesh( geometry, matLite );
        //text.rotation.y = Math.PI;
        text.position.x = x;
        text.position.y = y + 1.5;
        text.position.z = z;

        text.itemType = 'text';

        scene.add( text );
        actionPusher(name, pose);

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

        base.position.x = x;
        base.position.y = y;
        base.position.z = z;
        base.children[0].rotation.z = dir;

        scene.add( base );
        base.add( skeleton );

        eval('mixer['+index+'] = new THREE.AnimationMixer( base )');
        actionPusher(name, pose);


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

                eval('scene.add( Meshs.'+itemArr[a]+'.scene );');
                eval('Meshs.'+itemArr[a]+'.scene.add( skeleton );');
                eval('mixer['+index+'] = new THREE.AnimationMixer( Meshs.'+itemArr[a]+'.scene )');
                actionPusher(name, pose);
                
                if (a == itemArr.length - 1) {
                    setTimeout(()=>{
                        animate();
                    }, 2000)
                }

                
            })
              },10*x)
            })(i)
        }

    }, 50)

}

function actionPusher(name, pose){

    connectedUsers[index] = name;
    action.push([]);
    for (var j=0; j < pose.length; j++){
        if (mixer[index] !== undefined){
            action[index].push( mixer[index].clipAction( pose[j] ).play() );
        }
    }
    index++;
}

var my_name = document.querySelector(".width-400px").id.substring(7);

var my_position = {
    x: 0,
    y: 0,
    z: 0,
    dir: 0
};

var socket = io();
socket.on('connect', function(){
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


socket.on('loadNewbieAvatar', function(avatar){
    if (avatar.newbie == my_name) {
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x00EEFF );
    
        landLoader();
        for(var key in avatar.user){
            var x = avatar.user[key].position.x;
            var y = avatar.user[key].position.y;
            var z = avatar.user[key].position.z;
            var dir = avatar.user[key].position.dir + Math.PI;
    
            avatarLoader(key, x, y, z, dir);
        }
        controls.target.set(my_position.x, my_position.y + 1.0, my_position.z);
        controls.update();
    } else {
        var key = avatar.newbie;
        avatarLoader(avatar.newbie, avatar.user[key].position.x, avatar.user[key].position.y, avatar.user[key].position.z, avatar.user[key].position.dir+Math.PI);
        controls.update();
    }
})

socket.on('disconnectAvatar', function(avatar){
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
    requestAnimationFrame( animate );
    var now = clock.getDelta();
    for(var i = 0; i < connectedUsers.length; i++){
        if ( scene.children[i].itemType == 'avatar' ){
            for (var j = 0; j < pose.length; j++){
                if (j == 0){
                    action[i][j].weight=1;
                } else {
                    action[i][j].weight=0;
                }
            }
            mixer[i].update(now);
        }
    }
    setTimeout(()=>{

    controls.update();
    renderer.render( scene, camera );

    }, 16);
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
                
            } else {
                if (my_name == userId.name){
                
                    cam.posx = userId.prex;
                    cam.posy = userId.prey+1.5;
                    cam.posz = userId.prez;

                    camera.position.x = cam.prex + timeDiff/1000 * (cam.posx - cam.prex);
                    camera.position.y = cam.prey + timeDiff/1000 * (cam.posy - cam.prey);
                    camera.position.z = cam.prez + timeDiff/1000 * (cam.posz - cam.prez);
                    controls.target.set(scene.children[i].position.x, scene.children[i].position.y + 1.0, scene.children[i].position.z);

                }
            }
        }
    }

    //setTimeout(()=>{
        controls.update();
        renderer.render( scene, camera );
    //}, 0)

    if (timeDiff < 1000) {
        requestAnimationFrame( function(){
            animateWalk(cam, userId, startTime);
        } );
    } else if (timeDiff >= 1000) {
        animate();
    }
}
