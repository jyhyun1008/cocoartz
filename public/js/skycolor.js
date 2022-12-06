
import * as THREE from '/js/three/three.module.js';

controller = document.querySelector('#controller');
controller.style.width = window.innerWidth;
controller.style.height = window.innerHeight - 200;

if (controller.className === undefined){
    controller.className = 'dayNight';
}

var dayNight = [[255, 255, 255], [249, 197, 174], [128, 141, 173]];
var sunrise = parseInt(document.querySelector('#sunrise').innerText);
var sunset = parseInt(document.querySelector('#sunset').innerText);
var msPerMin = 60000;
var morningTwilight = sunrise - 30*msPerMin; //박명시각은 가져오기 귀찮아서 30분으로했어요.
var eveningTwilight = sunset + 30*msPerMin;

const manager = new THREE.LoadingManager();

function mod(n, m) {
    return ((n % m) + m) % m;
  }

//일단먼저 합성부터함
var skytexture = new THREE.TextureLoader().load('/assets/textures/land/BasicSkyNight.png');
setTimeout(() => {
    skyColor(sunrise, sunset, morningTwilight, eveningTwilight);
}, 1000);

setInterval(function() {
    skyColor(sunrise, sunset, morningTwilight, eveningTwilight);
}, 5000)

function skyColor(sunrise, sunset, morningTwilight, eveningTwilight){
    var WhatTimeIsIt = mod(new Date().getTime()+32400000, 86400000);
    var MorningPassed = WhatTimeIsIt - (sunrise - 30*msPerMin);
    var EveningPassed = WhatTimeIsIt - sunset;

    if (WhatTimeIsIt < morningTwilight || WhatTimeIsIt > eveningTwilight){ //밤
        controller.style.backgroundColor = 'rgba('+dayNight[2][0]+', '+dayNight[2][1]+', '+dayNight[2][2]+')';
        skytexture = new THREE.TextureLoader().load('/assets/textures/land/BasicSkyNight.png');
        setTimeout(() => {
            if (skyIndex >= 0){
                scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                scene.children[skyIndex].children[0].material.side = THREE.BackSide;
            }
        }, 0);
    } else if (WhatTimeIsIt >= morningTwilight && WhatTimeIsIt <= sunrise) { //아침
        if (MorningPassed < 15*msPerMin){
            controller.style.backgroundColor = 'rgba('+(dayNight[2][0]+(MorningPassed/15/msPerMin)*(dayNight[1][0]-dayNight[2][0]))+', '+(dayNight[2][1]+(MorningPassed/15/msPerMin)*(dayNight[1][1]-dayNight[2][1]))+', '+(dayNight[2][2]+(MorningPassed/15/msPerMin)*(dayNight[1][2]-dayNight[2][2]))+')';

            mergeImages([
                { src: '/assets/textures/land/BasicSkyNight.png' },
                { src: '/assets/textures/land/BasicSkySunset.png', opacity: MorningPassed / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            setTimeout(() => {
                if (skyIndex >= 0){
                    scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                    scene.children[skyIndex].children[0].material.side = THREE.BackSide;
                }
            }, 0);

        } else {
            controller.style.backgroundColor = 'rgba('+(dayNight[1][0]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][0]-dayNight[1][0]))+', '+(dayNight[1][1]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][1]-dayNight[1][1]))+', '+(dayNight[1][2]+((MorningPassed-15*msPerMin)/15/msPerMin)*(dayNight[0][2]-dayNight[1][2]))+')';

            mergeImages([
                { src: '/assets/textures/land/BasicSkySunset.png' },
                { src: '/assets/textures/land/BasicSky.png', opacity: (MorningPassed - 15*msPerMin) / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            setTimeout(() => {
                if (skyIndex >= 0){
                    scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                    scene.children[skyIndex].children[0].material.side = THREE.BackSide;
                }
            }, 0);
        }
    } else if (WhatTimeIsIt >= sunset && WhatTimeIsIt <= eveningTwilight) { //저녁
        if (EveningPassed < 15*msPerMin){
            controller.style.backgroundColor = 'rgba('+(dayNight[0][0]+(EveningPassed/15/msPerMin)*(dayNight[1][0]-dayNight[0][0]))+', '+(dayNight[0][1]+(EveningPassed/15/msPerMin)*(dayNight[1][1]-dayNight[0][1]))+', '+(dayNight[0][2]+(EveningPassed/15/msPerMin)*(dayNight[1][2]-dayNight[0][2]))+')';
            mergeImages([
                { src: '/assets/textures/land/BasicSky.png' },
                { src: '/assets/textures/land/BasicSkySunset.png', opacity: EveningPassed / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            setTimeout(() => {
                if (skyIndex >= 0){
                    scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                    scene.children[skyIndex].children[0].material.side = THREE.BackSide;
                }
            }, 0);
        } else {
            controller.style.backgroundColor = 'rgba('+(dayNight[1][0]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][0]-dayNight[1][0]))+', '+(dayNight[1][1]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][1]-dayNight[1][1]))+', '+(dayNight[1][2]+((EveningPassed-15*msPerMin)/15/msPerMin)*(dayNight[2][2]-dayNight[1][2]))+')';
            mergeImages([
                { src: '/assets/textures/land/BasicSkySunset.png' },
                { src: '/assets/textures/land/BasicSkyNight.png', opacity: (EveningPassed - 15*msPerMin) / 15/msPerMin }
            ])
            .then(b64 => skytexture = new THREE.TextureLoader(manager).load(b64));
            setTimeout(() => {
                if (skyIndex >= 0){
                    scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                    scene.children[skyIndex].children[0].material.side = THREE.BackSide;
                }
            }, 0);
        }
    } else { //낮
        controller.style.backgroundColor = 'rgba('+dayNight[0][0]+', '+dayNight[0][1]+', '+dayNight[0][2]+')';
        skytexture = new THREE.TextureLoader().load('/assets/textures/land/BasicSky.png');
        setTimeout(() => {
            if (skyIndex >= 0){
                scene.children[skyIndex].children[0].material = new THREE.MeshBasicMaterial({ map: skytexture });
                scene.children[skyIndex].children[0].material.side = THREE.BackSide;
            }
        }, 0);
    }
}