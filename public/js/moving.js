import * as THREE from '/js/three/three.module.js';

var socket = io();

arrCircle = document.querySelector(".centerCircle");

arrCircle.addEventListener( "mousemove", mousemove );
arrCircle.addEventListener( "mousedown", mousedown );
arrCircle.addEventListener( "mouseup", mouseup );
arrCircle.addEventListener( "mouseleave", mouseup );

arrCircle.addEventListener( "touchstart", mousedown );
arrCircle.addEventListener( "touchmove", mousemove );
arrCircle.addEventListener( "touchend", mouseup );
arrCircle.addEventListener( "touchleave", mouseup );
arrCircle.addEventListener( "touchcancel", mouseup );

svg = document.querySelector(".controlCircle");
bb = svg.getBoundingClientRect();

originY = 75;
originX = 75;

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

