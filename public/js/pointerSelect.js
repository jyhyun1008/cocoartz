import * as THREE from '/js/three/three.module.js';

pointer = new THREE.Vector2();
plainpointer = {};

class pointerSelect {

    onPointerMove( event ) {
        pointer.x = (( event.clientX / window.innerWidth ) * 2 - 1);
        pointer.y = (- ( (event.clientY-100) / (window.innerHeight - 200) ) * 2 + 1);
        plainpointer.x = event.clientX;
        plainpointer.y = event.clientY;
    }
}

export { pointerSelect }