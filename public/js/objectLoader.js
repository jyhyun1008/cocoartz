
import * as THREE from '/js/three/three.module.js';
import { GLTFLoader } from '/js/three/GLTFLoader.js';
import { animateFunction } from '/js/animateFunction.js';


const avatarload = new GLTFLoader();
const landload = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

class objectLoader {
    poseLoader(){

        mixer = [];
        pose = [];
        action = [];

        avatarload.load( '/assets/poses/standingPose.gltf', function ( standing ) {
            pose.push(standing.animations[0]);

            avatarload.load( '/assets/models/base/ChrBase.gltf', function ( walking ) {
                pose.push(walking.animations[0]);
            });
        });

    }

    landLoader(){
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

    avatarLoader(name, x, y, z, dir) {

        connectedUsers = [];
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
            base.itemType = 'body';
            base.userName = name;

            base.children[0].position.x = x;
            base.children[0].position.y = y;
            base.children[0].position.z = z;
            base.children[0].rotation.z = dir;

            scene.add( base );
            base.add( skeleton );
            
            if (name == my_name){
                my_index = index;
                isLoadingMe = true;
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
                            new objectLoader().actionPusher(pose);
                            setTimeout(()=>{
                                new animateFunction().animate();
                                //console.log(scene);
                            }, 100)
                        }, timeOut)
                    }
                })
                },5*a)
                })(i)
            }
        }, 50)
    }

    actionPusher(pose){
        console.log(pose);
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

}

export { objectLoader }