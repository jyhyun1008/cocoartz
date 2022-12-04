import * as THREE from '/js/three/three.module.js';

var clock = new THREE.Clock();

class animateFunction {

    animate() {
        sceneAnimation = requestAnimationFrame( new animateFunction().animate );
        var now = clock.getDelta();
    
            for(var i = 0; i < animationUsers; i++){
                if ( scene.children[i].itemType == 'body' || scene.children[i].itemType == 'avatar' ){
                    for (var j = 0; j < pose.length; j++){
                        if (action[i] === undefined){
                            cancelAnimationFrame(sceneAnimation);
                            setTimeout(()=>{
                                console.log("랙걸리는중");
                                new animateFunction().animate();
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
                new animateFunction().render();
            //}, 0);
    };
    
    animateWalk(cam, userId, startTime) {
    
        var now = clock.getDelta();
        var timeDiff = new Date() - startTime;

    
        for(var i = 0; i < animationUsers; i++){
            
            if (connectedUsers[i] == userId.name){

                var divider = 500;

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

                if (scene.children[i].itemType == 'body'){
                    scene.children[i].children[0].position.set(0, 0, 0);

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
                }
                    
    
    
                }
        }
    
            controls.update();
            new animateFunction().render();
    
        if (timeDiff < 500) {
            requestAnimationFrame( function(){
    
                new animateFunction().animateWalk(cam, userId, startTime);
            } );
        } else if (timeDiff >= 500) {
            new animateFunction().animate();
        }
    }
    
    render() {

        raycaster = new THREE.Raycaster();

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
}

export { animateFunction }