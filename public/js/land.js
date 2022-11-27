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

let clock, mixer, mixerhair, mixertop, mixerbottom, mixershoes;

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
    text.position.y = y + 1.5;
    text.position.z = z;
    scene.add( text );

    var avatar, avatartex, file;

    avatarload.load( '/assets/models/base/ChrBase.gltf', function ( gltf ) {
        clock = new THREE.Clock();

        file = gltf;

        avatar = gltf.scene;

        avatar.isMesh = true;
        avatar.type = 'Mesh';

        avatartex = avatar.children[0].children[1];

        var texture = new THREE.TextureLoader().load('/assets/textures/base/ChrBaseTexturem.png');
        avatartex.material = new THREE.MeshBasicMaterial({ map: texture });
        scene.add(avatar);

        var skeleton = new THREE.SkeletonHelper( avatar );
        skeleton.visible = false;
        avatar.add( skeleton );

        var items = { hair:'hair/BasicHair', top: 'top/BasicTop', bottom: 'bottom/BasicPants', shoes:'shoes/BasicShoes'};

        var Meshitems = {}

        avatarload.load('/assets/models/'+items.hair+'.gltf', function( hairitem ){
            Meshitems.hair = hairitem;
            Meshitems.hair.scene = hairitem.scene;
            Meshitems.hair.scene.isMesh = true;
            Meshitems.hair.scene.type = 'Mesh';
            Meshitems.hair.scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/assets/textures/'+items.hair+'m.png') });
            scene.add(Meshitems.hair.scene);
            Meshitems.hair.scene.add( skeleton );

            avatarload.load('/assets/models/'+items.top+'.gltf', function( topitem ){
                Meshitems.top = topitem;
                Meshitems.top.scene = topitem.scene;
                Meshitems.top.scene.isMesh = true;
                Meshitems.top.scene.type = 'Mesh';
                Meshitems.top.scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/assets/textures/'+items.top+'m.png') });
                scene.add(Meshitems.top.scene);
                Meshitems.top.scene.add( skeleton );

                avatarload.load('/assets/models/'+items.bottom+'.gltf', function( bottomitem ){
                    Meshitems.bottom = bottomitem;
                    Meshitems.bottom.scene = bottomitem.scene;
                    Meshitems.bottom.scene.isMesh = true;
                    Meshitems.bottom.scene.type = 'Mesh';
                    Meshitems.bottom.scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/assets/textures/'+items.bottom+'m.png') });
                    scene.add(Meshitems.bottom.scene);
                    Meshitems.bottom.scene.add( skeleton );

                    avatarload.load('/assets/models/'+items.shoes+'.gltf', function( shoesitem ){
                        Meshitems.shoes = shoesitem;
                        Meshitems.shoes.scene = shoesitem.scene;
                        Meshitems.shoes.scene.isMesh = true;
                        Meshitems.shoes.scene.type = 'Mesh';
                        Meshitems.shoes.scene.children[0].children[1].material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/assets/textures/'+items.shoes+'m.png') });
                        scene.add(Meshitems.shoes.scene);
                        Meshitems.shoes.scene.add( skeleton );

                        mixer = new THREE.AnimationMixer( avatar );
                        mixer.clipAction( gltf.animations[0]).play();
        
                        mixerhair = new THREE.AnimationMixer( Meshitems.hair.scene );
                        mixerhair.clipAction( gltf.animations[0]).play();
        
                        mixertop = new THREE.AnimationMixer( Meshitems.top.scene );
                        mixertop.clipAction( gltf.animations[0]).play();

                        mixerbottom = new THREE.AnimationMixer( Meshitems.bottom.scene );
                        mixerbottom.clipAction( gltf.animations[0]).play();
        
                        mixershoes = new THREE.AnimationMixer( Meshitems.shoes.scene );
                        mixershoes.clipAction( gltf.animations[0]).play();

                        avatar.position.x = x;
                        avatar.position.y = y;
                        avatar.position.z = z;

                        for (var key in items) {
                            eval('Meshitems.'+key+'.scene.position.x = x;');
                            eval('Meshitems.'+key+'.scene.position.y = y;');
                            eval('Meshitems.'+key+'.scene.position.z = z;');

                            //eval('Meshitems.'+key+'.scene.scale.x = 1.04;');
                            //eval('Meshitems.'+key+'.scene.scale.y = 1.04;');
                            //eval('Meshitems.'+key+'.scene.scale.z = 1.04;');
                        }
        
                        animate();

                    });

                });

            });

        });

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
    if (e.keyCode == 37 || e.keyCode == 38  || e.keyCode == 39 || e.keyCode == 40){

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
    //renderer.render( scene, camera );

})


const controls = new OrbitControls( camera, renderer.domElement );
controls.update();
controls.enablePan = false;
controls.enableDamping = true;

var animate = function () {
    requestAnimationFrame( animate );
    var now = clock.getDelta();
    if ( mixer ) mixer.update( now );
    if ( mixerhair ) mixerhair.update( now );
    if ( mixertop ) mixertop.update( now );
    if ( mixerbottom ) mixerbottom.update( now );
    if ( mixershoes ) mixershoes.update( now );
    controls.update();
    renderer.render( scene, camera );
};

//animate();