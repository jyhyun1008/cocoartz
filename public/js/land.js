import { OrbitControls } from '/js/three/OrbitControls.js';
import * as THREE from '/js/three/three.module.js';
import { FontLoader } from '/js/three/FontLoader.js';
import { GLTFLoader } from '/js/three/GLTFLoader.js';

const canvas = document.querySelector('#threejs');

var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF0EEE4 );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 200), 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ canvas, alpha: false, });

renderer.setSize( window.innerWidth, window.innerHeight - 200, false);

camera.position.z = 3;


const avatarload = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

var itemArr = ['hair', 'top', 'bottom', 'shoes'];
var pose = [];
avatarload.load( '/assets/models/base/ChrBase.gltf', function ( motion ) {
    pose.push(motion.animations[0]);
});

var fontcolor = 0x70594D;

var clock = new THREE.Clock();
//let mixer, mixerhair, mixertop, mixerbottom, mixershoes;

var connectedUsers = [];
var mixer = [];
var index = 0;

var sceneAnimation;

function avatarLoader(name, x, y, z) {

    //scene.children[number] = {children: []};

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
            (x => {
              setTimeout(() => {
                
            avatarload.load('/assets/models/'+eval('items.'+itemArr[x])+'.gltf', function( item ){
                eval('Meshs.'+itemArr[x]+' = item');
                eval('Meshs.'+itemArr[x]+'.scene = item.scene');
                eval('Meshs.'+itemArr[x]+'.scene.isMesh = true');
                eval('Meshs.'+itemArr[x]+'.scene.type = "Mesh"');
                var itemString = eval('items.'+itemArr[x]);
                eval("Meshs."+itemArr[x]+".scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/assets/textures/'+itemString+'m.png') });");
                eval('scene.add( Meshs.'+itemArr[x]+'.scene );');
                eval('Meshs.'+itemArr[x]+'.scene.add( skeleton );');
                eval('mixer['+index+'] = new THREE.AnimationMixer( Meshs.'+itemArr[x]+'.scene )');
                connectedUsers[index] = name;
                index++;
                if (x == itemArr.length - 1) {
                    animate();
                }
            })
              },15*x)
            })(i)
        }

    }, 100)

}

var my_name = document.querySelector(".width-400px").id.substring(7);

var my_position = {
    x: 0,
    y: 0,
    z: 0
};

var socket = io();
socket.on('connect', function(){
    socket.emit('newUserConnect', my_name, my_position);
});

document.addEventListener('keydown', function(e){
    if (e.keyCode == 37 || e.keyCode == 38  || e.keyCode == 39 || e.keyCode == 40){

        if (e.keyCode==37) { //왼쪽
            my_position.x = my_position.x + 1; 
        } else if (e.keyCode==38) { //위
            my_position.z = my_position.z + 1;
        } else if (e.keyCode==39) { //오른쪽
            my_position.x = my_position.x - 1;  
        } else if (e.keyCode==40) { //아래
            my_position.z = my_position.z - 1;
        }
        //controls.target.set(my_position.x, my_position.y, my_position.z);
        
        socket.emit('positionChanged', my_name, my_position);
    }
});


socket.on('loadNewbieAvatar', function(avatar){
    if (avatar.newbie == my_name) {
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xF0EEE4 );
    
        for(var key in avatar.user){
            var x = avatar.user[key].position.x;
            var y = avatar.user[key].position.y;
            var z = avatar.user[key].position.z;
    
            avatarLoader(key, x, y, z);
        }
        controls.update();
    } else {
        var key = avatar.newbie;
        avatarLoader(avatar.newbie, avatar.user[key].position.x, avatar.user[key].position.y, avatar.user[key].position.z);
        controls.update();
    }
})

socket.on('disconnectAvatar', function(avatar){
    setTimeout(() => {

        for(var i = 0; i < connectedUsers.length; i++){
            if (connectedUsers[i] == avatar.oldbie){
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
    cancelAnimationFrame( sceneAnimation );
    var start = new Date();
    animateWalk(avatar, start);
    controls.update();
})

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

var animate = function () {
    sceneAnimation = requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );
};

function animateWalk(userId, startTime) {
    
    var now = clock.getDelta();
    var timeDiff = new Date() - startTime;

    for(var i = 0; i < connectedUsers.length; i++){
        
        if (connectedUsers[i] == userId.name){
            scene.children[i].position.x += timeDiff/1000/30 * (userId.posx - userId.prex);
            scene.children[i].position.y += timeDiff/1000/30 * (userId.posy - userId.prey);
            scene.children[i].position.z += timeDiff/1000/30 * (userId.posz - userId.prez);
            if ( scene.children[i].children.length > 0 ) {
                mixer[i].clipAction( pose[0] ).play();
                mixer[i].update(now);
            } else {
                if (my_name == userId.name){
                    camera.position.x += timeDiff/1000/30 * (userId.posx - userId.prex);
                    camera.position.y += timeDiff/1000/30 * (userId.posy - userId.prey);
                    camera.position.z += timeDiff/1000/30 * (userId.posz - userId.prez);
                    controls.target.set(scene.children[i].position.x, scene.children[i].position.y - 1.5, scene.children[i].position.z);
                }
            }
        }
    }

    setTimeout(()=>{
        controls.update();
        renderer.render( scene, camera );
    }, 0)

    if (timeDiff < 1000) {
        sceneAnimation = requestAnimationFrame( function(){
            animateWalk(userId, startTime);
        } );
    } else {
        animate();
    }
}
