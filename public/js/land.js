import { OrbitControls } from '/js/three/OrbitControls.js';
import * as THREE from '/js/three/three.module.js';
import { FontLoader } from '/js/three/FontLoader.js';
import { GLTFLoader } from '/js/three/GLTFLoader.js';

const canvas = document.querySelector('#threejs');


var scene = new THREE.Scene();
scene.background = new THREE.Color( 0xF0EEE4 );

var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 200), 0.1, 1000 );
var renderer = new THREE.WebGLRenderer({ canvas, alpaha: false, });

renderer.setSize( window.innerWidth, window.innerHeight - 200, false);

camera.position.z = 3;


const avatarload = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

var fontcolor = 0x70594D;

let clock, mixer;

function avatarLoader(name, x, y, z) {

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

    const text = new THREE.Mesh( geometry, matLite );
    //text.rotation.y = Math.PI;
    text.position.x = x;
    text.position.y = y + 1.3;
    text.position.z = z;
    scene.add( text );

    var avatar, avatar0;

    avatarload.load( '/assets/ChrBase.gltf', function ( gltf ) {
        clock = new THREE.Clock();

        avatar = gltf.scene;

        avatar.isMesh = true;
        avatar.type = 'Mesh';

        avatar0 = avatar.children[0].children[1];

        var texture = new THREE.TextureLoader().load('/assets/ChrBaseTexturem.png');
        avatar0.material = new THREE.MeshBasicMaterial({ map: texture });
        scene.add(avatar);

        var skeleton = new THREE.SkeletonHelper( avatar );
        skeleton.visible = false;
        avatar.add( skeleton );

        mixer = new THREE.AnimationMixer( avatar );
        mixer.clipAction( gltf.animations[0]).play();

        avatar.position.x = x;
        avatar.position.y = y;
        avatar.position.z = z;

        animate();

    } );

    })
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
    if (e.keyCode == 37 || e.keyCode == 38  && e.keyCode == 39 || e.keyCode || 40){

        if (e.keyCode==37) { //왼쪽
            my_position.x = my_position.x - 0.1; 
            camera.position.x = camera.position.x - 0.1;
        } else if (e.keyCode==38) { //위
            my_position.z = my_position.z - 0.1;
            camera.position.z = camera.position.z - 0.1;
        } else if (e.keyCode==39) { //오른쪽
            my_position.x = my_position.x + 0.1;  
            camera.position.x = camera.position.x + 0.1;
        } else if (e.keyCode==40) { //아래
            my_position.z = my_position.z + 0.1;
            camera.position.z = camera.position.z + 0.1;
        }
        controls.target.set(my_position.x, my_position.y, my_position.z);
        
        socket.emit('positionChanged', my_name, my_position);
    }
});


socket.on('loadUserAvatar', function(avatar){
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xF0EEE4 );

        for(var key in avatar.user){
            var x = avatar.user[key].position.x;
            var y = avatar.user[key].position.y;
            var z = avatar.user[key].position.z;

            avatarLoader(key, x, y, z);
        }
        controls.update();
        renderer.render( scene, camera );

})


const controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

var animate = function () {
    requestAnimationFrame( animate );

    if ( mixer ) mixer.update( clock.getDelta() );

    controls.update();

    renderer.render( scene, camera );
};

//animate();