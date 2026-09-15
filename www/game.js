/* =========================================================
   VALEN ISLAND SURVIVAL
   FINAL STABLE ANDROID BUILD
   3D SURVIVAL — NO MULTIPLAYER
   ========================================================= */

(() => {
"use strict";

/* =========================
   SAFE START
========================= */

if (window.__VALEN_FINAL__) return;
window.__VALEN_FINAL__ = true;

const THREE = window.THREE;

if (!THREE) {
    document.body.innerHTML = `
        <div style="
        position:fixed;inset:0;
        display:flex;align-items:center;
        justify-content:center;
        background:#071923;color:white;
        font:20px Arial;text-align:center">
        THREE.JS GAGAL DIMUAT<br>
        Periksa koneksi internet lalu buka ulang game.
        </div>`;
    return;
}

/* =========================
   CONFIG
========================= */

const CFG = {
    world: 220,
    island: 82,
    water: 280,
    maxTrees: 90,
    maxRocks: 70,
    maxBushes: 45,
    maxAnimals: 20
};

/* =========================
   SAVE
========================= */

const SAVE_KEY = "VALEN_SURVIVAL_SAVE_V6";

let save = {
    wood: 0,
    stone: 0,
    berry: 0,
    coconut: 0,
    fish: 0,

    hunger: 100,
    thirst: 100,
    health: 100,
    stamina: 100,

    day: 1,
    time: 8,
    chapter: 1,

    x: 0,
    z: 12,

    cooked: 0,
    shelter: false,
    campfire: false,
    beacon: false,

    achievements: []
};

try {
    const old = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (old) save = Object.assign(save, old);
} catch(e) {}

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch(e) {}
}

/* =========================
   SCREEN
========================= */

document.body.innerHTML = "";

document.body.style.cssText = `
margin:0;
overflow:hidden;
background:#06151d;
font-family:Arial,sans-serif;
touch-action:none;
user-select:none;
`;

const canvas = document.createElement("canvas");
canvas.style.cssText = `
position:fixed;
inset:0;
width:100%;
height:100%;
display:block;
`;
document.body.appendChild(canvas);

/* =========================
   RENDERER
========================= */

let renderer;

try {
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias:false,
        powerPreference:"high-performance",
        alpha:false
    });
} catch(e) {
    document.body.innerHTML = `
    <div style="
    position:fixed;inset:0;
    background:#071923;color:white;
    display:flex;align-items:center;
    justify-content:center;
    font:20px Arial;text-align:center">
    HP tidak mendukung WebGL.
    </div>`;
    return;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

/* =========================
   SCENE
========================= */

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x79c9e8);
scene.fog = new THREE.Fog(0x79c9e8, 90, 240);

const camera = new THREE.PerspectiveCamera(
    62,
    innerWidth / innerHeight,
    0.1,
    350
);

camera.position.set(0, 8, 16);

/* =========================
   LIGHT
========================= */

const hemi = new THREE.HemisphereLight(
    0xbfeaff,
    0x385027,
    2.2
);

scene.add(hemi);

const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(50,100,30);
scene.add(sun);

/* =========================
   OCEAN
========================= */

const oceanGeo = new THREE.CircleGeometry(CFG.water, 96);

const oceanMat = new THREE.MeshPhongMaterial({
    color:0x167fa0,
    shininess:100,
    transparent:true,
    opacity:.92
});

const ocean = new THREE.Mesh(
    oceanGeo,
    oceanMat
);

ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.8;

scene.add(ocean);

/* =========================
   ISLAND
========================= */

const islandGeo = new THREE.CylinderGeometry(
    CFG.island,
    CFG.island + 12,
    4,
    96
);

const islandMat = new THREE.MeshLambertMaterial({
    color:0x3f9b48
});

const island = new THREE.Mesh(
    islandGeo,
    islandMat
);

island.position.y = -1;
scene.add(island);

/* =========================
   BEACH
========================= */

const beachGeo = new THREE.CylinderGeometry(
    CFG.island + 3,
    CFG.island + 5,
    .8,
    96
);

const beachMat = new THREE.MeshLambertMaterial({
    color:0xe3c47b
});

const beach = new THREE.Mesh(
    beachGeo,
    beachMat
);

beach.position.y = .15;
scene.add(beach);

/* =========================
   TERRAIN CENTER
========================= */

const landGeo = new THREE.CylinderGeometry(
    CFG.island - 4,
    CFG.island,
    1.8,
    96
);

const landMat = new THREE.MeshLambertMaterial({
    color:0x4eac4c
});

const land = new THREE.Mesh(
    landGeo,
    landMat
);

land.position.y = .5;
scene.add(land);

/* =========================
   OBJECT ARRAYS
========================= */

const trees = [];
const rocks = [];
const bushes = [];
const animals = [];
const resources = [];
const buildings = [];

/* =========================
   RANDOM POSITION
========================= */

function randomIslandPos(min = 8, max = CFG.island - 7) {

    const a = Math.random() * Math.PI * 2;
    const r = min + Math.sqrt(Math.random()) * (max-min);

    return {
        x:Math.cos(a)*r,
        z:Math.sin(a)*r
    };
}

/* =========================
   TREE
========================= */

function createTree(x,z) {

    const g = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(.45,.65,5,8),
        new THREE.MeshLambertMaterial({
            color:0x754625
        })
    );

    trunk.position.y = 3;
    g.add(trunk);

    const crown = new THREE.Group();

    for(let i=0;i<7;i++) {

        const leaf = new THREE.Mesh(
            new THREE.ConeGeometry(
                .65,
                4.2,
                7
            ),
            new THREE.MeshLambertMaterial({
                color:0x14752e
            })
        );

        const a = i / 7 * Math.PI * 2;

        leaf.position.set(
            Math.cos(a)*1.4,
            5.8,
            Math.sin(a)*1.4
        );

        leaf.rotation.z =
            Math.cos(a)*.45;

        leaf.rotation.x =
            Math.sin(a)*.45;

        crown.add(leaf);
    }

    g.add(crown);

    g.position.set(x,0,z);

    g.userData.type = "tree";
    g.userData.hp = 3;
    g.userData.resource = "wood";

    scene.add(g);
    trees.push(g);
    resources.push(g);
}

/* =========================
   ROCK
========================= */

function createRock(x,z) {

    const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(
            .8 + Math.random()*.7,
            0
        ),
        new THREE.MeshLambertMaterial({
            color:0x777b78
        })
    );

    rock.position.set(x,.8,z);

    rock.scale.y = .7;

    rock.userData.type = "rock";
    rock.userData.hp = 2;
    rock.userData.resource = "stone";

    scene.add(rock);
    rocks.push(rock);
    resources.push(rock);
}

/* =========================
   BERRY
========================= */

function createBush(x,z) {

    const g = new THREE.Group();

    const bush = new THREE.Mesh(
        new THREE.SphereGeometry(1.1,10,8),
        new THREE.MeshLambertMaterial({
            color:0x207e36
        })
    );

    bush.position.y = 1;
    g.add(bush);

    for(let i=0;i<5;i++) {

        const berry = new THREE.Mesh(
            new THREE.SphereGeometry(.12,6,6),
            new THREE.MeshLambertMaterial({
                color:0xd92f45
            })
        );

        berry.position.set(
            (Math.random()-.5)*1.5,
            .8+Math.random()*.7,
            (Math.random()-.5)*1.5
        );

        g.add(berry);
    }

    g.position.set(x,0,z);

    g.userData.type = "berry";
    g.userData.resource = "berry";

    scene.add(g);
    bushes.push(g);
    resources.push(g);
}

/* =========================
   ANIMAL
========================= */

function createAnimal(x,z) {

    const g = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.SphereGeometry(
            1.15,
            12,
            8
        ),
        new THREE.MeshLambertMaterial({
            color:0x71462c
        })
    );

    body.scale.set(1.4,.8,.9);
    body.position.y = 1.25;
    g.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(.65,10,8),
        new THREE.MeshLambertMaterial({
            color:0x5d3926
        })
    );

    head.position.set(1.1,1.5,0);
    g.add(head);

    for(let i=0;i<4;i++) {

        const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(
                .13,.16,.9,6
            ),
            new THREE.MeshLambertMaterial({
                color:0x3d291d
            })
        );

        leg.position.set(
            i<2 ? .7:-.7,
            .6,
            i%2 ? -.45:.45
        );

        g.add(leg);
    }

    g.position.set(x,0,z);

    g.userData.type = "animal";
    g.userData.hp = 30;
    g.userData.speed = .7 + Math.random()*.5;

    scene.add(g);
    animals.push(g);
}

/* =========================
   GENERATE WORLD
========================= */

for(let i=0;i<CFG.maxTrees;i++) {

    const p = randomIslandPos(12,72);

    createTree(p.x,p.z);
}

for(let i=0;i<CFG.maxRocks;i++) {

    const p = randomIslandPos(10,76);

    createRock(p.x,p.z);
}

for(let i=0;i<CFG.maxBushes;i++) {

    const p = randomIslandPos(8,74);

    createBush(p.x,p.z);
}

for(let i=0;i<CFG.maxAnimals;i++) {

    const p = randomIslandPos(15,68);

    createAnimal(p.x,p.z);
}

/* =========================
   PLAYER
========================= */

const player = new THREE.Group();

const playerBody = new THREE.Mesh(
    new THREE.CapsuleGeometry(
        .55,
        1.25,
        6,
        10
    ),
    new THREE.MeshLambertMaterial({
        color:0x2d73d5
    })
);

playerBody.position.y = 1.3;
player.add(playerBody);

const head = new THREE.Mesh(
    new THREE.SphereGeometry(.42,12,10),
    new THREE.MeshLambertMaterial({
        color:0xf0bd8d
    })
);

head.position.y = 2.35;
player.add(head);

const backpack = new THREE.Mesh(
    new THREE.BoxGeometry(.55,.7,.3),
    new THREE.MeshLambertMaterial({
        color:0x5a351f
    })
);

backpack.position.set(0,1.35,-.55);
player.add(backpack);

player.position.set(
    save.x || 0,
    0,
    save.z || 12
);

scene.add(player);

/* =========================
   PLAYER STATE
========================= */

let yaw = 0;
let pitch = .35;

let joyX = 0;
let joyY = 0;

let moving = false;
let running = false;

let lastTime = performance.now();

/* =========================
   UI
========================= */

const ui = document.createElement("div");

ui.style.cssText = `
position:fixed;
inset:0;
pointer-events:none;
z-index:10;
`;

document.body.appendChild(ui);

const hud = document.createElement("div");

hud.style.cssText = `
position:absolute;
top:15px;
left:15px;
width:230px;
padding:12px;
border-radius:15px;
background:rgba(0,0,0,.55);
color:white;
font-weight:bold;
font-size:13px;
`;

hud.innerHTML = `
<div style="font-size:18px;margin-bottom:7px">
🏝️ VALEN ISLAND
</div>

<div id="stats"></div>

<div id="resources"
style="margin-top:8px;line-height:1.5"></div>
`;

ui.appendChild(hud);

const stats = hud.querySelector("#stats");
const resourcesUI = hud.querySelector("#resources");

/* =========================
   BUTTON
========================= */

function button(text, right, bottom, fn) {

    const b = document.createElement("button");

    b.textContent = text;

    b.style.cssText = `
    position:absolute;
    right:${right}px;
    bottom:${bottom}px;
    width:70px;
    height:70px;
    border:2px solid rgba(255,255,255,.5);
    border-radius:50%;
    background:rgba(0,0,0,.48);
    color:white;
    font-size:24px;
    pointer-events:auto;
    touch-action:none;
    `;

    b.onpointerdown = e => {
        e.preventDefault();
        fn();
    };

    ui.appendChild(b);

    return b;
}

/* =========================
   JOYSTICK
========================= */

const joy = document.createElement("div");

joy.style.cssText = `
position:absolute;
left:35px;
bottom:35px;
width:140px;
height:140px;
border-radius:50%;
background:rgba(255,255,255,.15);
border:2px solid rgba(255,255,255,.3);
pointer-events:auto;
touch-action:none;
`;

ui.appendChild(joy);

const stick = document.createElement("div");

stick.style.cssText = `
position:absolute;
left:40px;
top:40px;
width:60px;
height:60px;
border-radius:50%;
background:rgba(255,255,255,.5);
`;

joy.appendChild(stick);

let joyPointer = null;

joy.onpointerdown = e => {

    joyPointer = e.pointerId;

    joy.setPointerCapture(e.pointerId);

    updateJoy(e);
};

joy.onpointermove = e => {

    if(e.pointerId !== joyPointer) return;

    updateJoy(e);
};

joy.onpointerup =
joy.onpointercancel = () => {

    joyPointer = null;

    joyX = 0;
    joyY = 0;

    stick.style.left = "40px";
    stick.style.top = "40px";
};

function updateJoy(e) {

    const r = joy.getBoundingClientRect();

    let x =
        e.clientX -
        (r.left + r.width/2);

    let y =
        e.clientY -
        (r.top + r.height/2);

    const max = 42;

    const len = Math.sqrt(x*x+y*y);

    if(len > max) {

        x = x/len*max;
        y = y/len*max;
    }

    joyX = x/max;
    joyY = y/max;

    stick.style.left =
        `${40+x}px`;

    stick.style.top =
        `${40+y}px`;
}

/* =========================
   ACTION BUTTONS
========================= */

button("🪓",120,95,gather);
button("🍖",35,180,eat);
button("🔥",120,180,cook);
button("🏕️",205,95,buildShelter);

/* =========================
   MESSAGE
========================= */

const message = document.createElement("div");

message.style.cssText = `
position:absolute;
top:50%;
left:50%;
transform:translate(-50%,-50%);
padding:15px 25px;
border-radius:15px;
background:rgba(0,0,0,.7);
color:white;
font-size:18px;
font-weight:bold;
display:none;
text-align:center;
`;

ui.appendChild(message);

let msgTimer = 0;

function toast(text) {

    message.textContent = text;
    message.style.display = "block";

    clearTimeout(msgTimer);

    msgTimer = setTimeout(() => {
        message.style.display = "none";
    },1800);
}

/* =========================
   FIND RESOURCE
========================= */

function nearestResource() {

    let best = null;
    let dist = Infinity;

    for(const r of resources) {

        if(!r.visible) continue;

        const d =
            player.position.distanceTo(r.position);

        if(d < dist) {

            dist = d;
            best = r;
        }
    }

    return {
        object:best,
        distance:dist
    };
}

/* =========================
   GATHER
========================= */

function gather() {

    const n = nearestResource();

    if(!n.object || n.distance > 4) {

        toast("Dekati resource dulu");
        return;
    }

    const o = n.object;

    if(o.userData.type === "tree") {

        o.userData.hp--;

        toast("🪵 Menebang pohon");

        if(o.userData.hp <= 0) {

            o.visible = false;

            save.wood += 4;

            toast("🪵 +4 Kayu");
        }
    }

    else if(o.userData.type === "rock") {

        o.userData.hp--;

        if(o.userData.hp <= 0) {

            o.visible = false;

            save.stone += 3;

            toast("🪨 +3 Batu");
        }
    }

    else if(o.userData.type === "berry") {

        o.visible = false;

        save.berry += 3;

        toast("🫐 +3 Berry");
    }

    saveGame();
    updateHUD();
}

/* =========================
   EAT
========================= */

function eat() {

    if(save.berry <= 0) {

        toast("Tidak punya berry");
        return;
    }

    save.berry--;

    save.hunger =
        Math.min(100,save.hunger+18);

    toast("🫐 Makan berry");

    saveGame();
    updateHUD();
}

/* =========================
   CAMPFIRE
========================= */

function buildCampfire() {

    if(save.campfire) return;

    if(save.wood < 5 ||
       save.stone < 3) {

        toast("Butuh 5 kayu + 3 batu");
        return;
    }

    save.wood -= 5;
    save.stone -= 3;
    save.campfire = true;

    const fire = new THREE.Group();

    for(let i=0;i<5;i++) {

        const log = new THREE.Mesh(
            new THREE.CylinderGeometry(
                .16,.2,1.3,6
            ),
            new THREE.MeshLambertMaterial({
                color:0x643b20
            })
        );

        log.rotation.z =
            Math.PI/2;

        log.rotation.y =
            i*.7;

        log.position.y=.25;

        fire.add(log);
    }

    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(
            .5,
            1.5,
            8
        ),
        new THREE.MeshBasicMaterial({
            color:0xff7b16
        })
    );

    flame.position.y=1;

    fire.add(flame);

    fire.position.copy(player.position);

    scene.add(fire);
    buildings.push(fire);

    toast("🔥 Api unggun dibuat");

    saveGame();
    updateHUD();
}

/* =========================
   COOK
========================= */

function cook() {

    if(!save.campfire) {

        buildCampfire();
        return;
    }

    if(save.fish <= 0) {

        toast("Belum punya ikan");
        return;
    }

    save.fish--;

    save.cooked++;

    toast("🍖 Ikan dimasak");

    saveGame();
    updateHUD();
}

/* =========================
   EAT COOKED
========================= */

function eatCooked() {

    if(save.cooked <= 0) {

        toast("Tidak ada makanan");
        return;
    }

    save.cooked--;

    save.hunger =
        Math.min(100,save.hunger+35);

    save.health =
        Math.min(100,save.health+8);

    toast("🍖 Makan ikan matang");

    saveGame();
    updateHUD();
}

/* =========================
   BUILD SHELTER
========================= */

function buildShelter() {

    if(save.shelter) {

        toast("🏕️ Shelter sudah ada");
        return;
    }

    if(save.wood < 12 ||
       save.stone < 5) {

        toast("Butuh 12 kayu + 5 batu");
        return;
    }

    save.wood -= 12;
    save.stone -= 5;
    save.shelter = true;

    const g = new THREE.Group();

    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(5,.3,5),
        new THREE.MeshLambertMaterial({
            color:0x69452b
        })
    );

    floor.position.y=.3;
    g.add(floor);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(
            3.7,
            2.5,
            4
        ),
        new THREE.MeshLambertMaterial({
            color:0x81472d
        })
    );

    roof.position.y=3.5;
    roof.rotation.y=Math.PI/4;
    g.add(roof);

    g.position.copy(player.position);
    scene.add(g);

    buildings.push(g);

    toast("🏕️ Shelter berhasil dibuat");

    saveGame();
    updateHUD();
}

/* =========================
   FISHING
========================= */

function fish() {

    const r =
        Math.sqrt(
            player.position.x**2 +
            player.position.z**2
        );

    if(r < CFG.island-8) {

        toast("🎣 Dekati pantai");
        return;
    }

    if(Math.random() < .65) {

        save.fish++;

        toast("🎣 Dapat ikan!");
    } else {

        toast("🐟 Ikan lolos");
    }

    saveGame();
    updateHUD();
}

/* =========================
   FISH BUTTON
========================= */

button("🎣",35,95,fish);

/* =========================
   EXTRA FOOD BUTTON
========================= */

button("🍖",35,280,eatCooked);

/* =========================
   HUD
========================= */

function bar(value) {

    const pct =
        Math.max(0,Math.min(100,value));

    return `
    <div style="
    width:100%;
    height:8px;
    background:#222;
    border-radius:5px;
    margin:3px 0 6px">
        <div style="
        width:${pct}%;
        height:100%;
        background:#fff;
        border-radius:5px">
        </div>
    </div>`;
}

function updateHUD() {

    stats.innerHTML = `
    ❤️ Health ${Math.round(save.health)}
    ${bar(save.health)}

    🍗 Hunger ${Math.round(save.hunger)}
    ${bar(save.hunger)}

    💧 Thirst ${Math.round(save.thirst)}
    ${bar(save.thirst)}

    ⚡ Stamina ${Math.round(save.stamina)}
    ${bar(save.stamina)}
    `;

    resourcesUI.innerHTML = `
    🪵 ${save.wood}
    &nbsp; 🪨 ${save.stone}
    &nbsp; 🫐 ${save.berry}
    <br>
    🥥 ${save.coconut}
    &nbsp; 🐟 ${save.fish}
    &nbsp; 🍖 ${save.cooked}
    <br>
    📅 Day ${save.day}
    &nbsp; ${String(Math.floor(save.time)).padStart(2,"0")}:00
    `;
}

updateHUD();

/* =========================
   CAMERA TOUCH
========================= */

let cameraPointer = null;
let lastPX = 0;
let lastPY = 0;

canvas.addEventListener("pointerdown",e => {

    if(e.clientX < innerWidth*.42)
        return;

    cameraPointer = e.pointerId;

    lastPX = e.clientX;
    lastPY = e.clientY;

    canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove",e => {

    if(e.pointerId !== cameraPointer)
        return;

    const dx =
        e.clientX-lastPX;

    const dy =
        e.clientY-lastPY;

    yaw += dx*.006;

    pitch += dy*.004;

    pitch =
        Math.max(-.1,Math.min(1.1,pitch));

    lastPX=e.clientX;
    lastPY=e.clientY;
});

canvas.addEventListener("pointerup",() => {
    cameraPointer=null;
});

canvas.addEventListener("pointercancel",() => {
    cameraPointer=null;
});

/* =========================
   MOVEMENT
========================= */

function movePlayer(dt) {

    const ax = joyX;
    const ay = joyY;

    moving =
        Math.abs(ax)>.08 ||
        Math.abs(ay)>.08;

    if(!moving) return;

    const speed =
        running && save.stamina>0
        ? 9
        : 5;

    if(running)
        save.stamina =
            Math.max(
                0,
                save.stamina-dt*15
            );
    else
        save.stamina =
            Math.min(
                100,
                save.stamina+dt*8
            );

    const forward =
        new THREE.Vector3(
            Math.sin(yaw),
            0,
            Math.cos(yaw)
        );

    const right =
        new THREE.Vector3(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        );

    const dir =
        new THREE.Vector3();

    dir.addScaledVector(
        forward,
        -ay
    );

    dir.addScaledVector(
        right,
        ax
    );

    if(dir.lengthSq()>0)
        dir.normalize();

    player.position.addScaledVector(
        dir,
        speed*dt
    );

    /* island boundary */

    const d =
        Math.sqrt(
            player.position.x**2 +
            player.position.z**2
        );

    const limit =
        CFG.island-4;

    if(d > limit) {

        player.position.x *=
            limit/d;

        player.position.z *=
            limit/d;
    }

    if(dir.lengthSq()>0) {

        player.rotation.y =
            Math.atan2(
                dir.x,
                dir.z
            );
    }

    save.x=player.position.x;
    save.z=player.position.z;
}

/* =========================
   ANIMAL AI
========================= */

function updateAnimals(dt) {

    for(const a of animals) {

        if(!a.visible) continue;

        const dist =
            a.position.distanceTo(
                player.position
            );

        if(dist < 12) {

            const dx =
                a.position.x -
                player.position.x;

            const dz =
                a.position.z -
                player.position.z;

            const len =
                Math.sqrt(dx*dx+dz*dz)||1;

            a.position.x +=
                dx/len*a.userData.speed*dt;

            a.position.z +=
                dz/len*a.userData.speed*dt;

            a.rotation.y =
                Math.atan2(dx,dz);
        }
    }
}

/* =========================
   ATTACK
========================= */

function attack() {

    let best=null;
    let dist=3.2;

    for(const a of animals) {

        if(!a.visible) continue;

        const d =
            a.position.distanceTo(
                player.position
            );

        if(d<dist) {

            dist=d;
            best=a;
        }
    }

    if(!best) {

        toast("Tidak ada hewan");
        return;
    }

    best.userData.hp -= 10;

    if(best.userData.hp<=0) {

        best.visible=false;

        save.berry += 1;

        toast("🐗 Hewan dikalahkan +1 makanan");
    } else {

        toast("⚔️ Serangan!");
    }

    saveGame();
    updateHUD();
}

button("⚔️",120,280,attack);

/* =========================
   DAY / NIGHT
========================= */

function updateDay(dt) {

    save.time += dt*.8;

    if(save.time >= 24) {

        save.time=0;
        save.day++;
    }

    const t =
        save.time/24 *
        Math.PI*2;

    sun.position.set(
        Math.cos(t)*100,
        Math.sin(t)*100,
        30
    );

    const daylight =
        Math.max(
            .12,
            Math.sin(t)*.5+.5
        );

    hemi.intensity =
        .55+daylight*1.5;

    sun.intensity =
        .4+daylight*2.4;

    const night =
        1-daylight;

    scene.background.lerp(
        new THREE.Color(0x081827),
        night*.02
    );

    scene.fog.color.copy(
        scene.background
    );

    /* survival */

    save.hunger =
        Math.max(
            0,
            save.hunger-dt*.35
        );

    save.thirst =
        Math.max(
            0,
            save.thirst-dt*.55
        );

    if(save.hunger<=0 ||
       save.thirst<=0) {

        save.health =
            Math.max(
                0,
                save.health-dt*2
            );
    }

    if(save.health<=0) {

        save.health=50;
        save.hunger=50;
        save.thirst=50;

        player.position.set(0,0,12);

        toast("💀 Kamu pingsan dan kembali ke pantai");
    }
}

/* =========================
   WATER ANIMATION
========================= */

let waterTime=0;

function animateWater(dt) {

    waterTime += dt;

    ocean.position.y =
        -.8+
        Math.sin(waterTime*.8)*.08;

    ocean.rotation.z =
        Math.sin(waterTime*.15)*.002;
}

/* =========================
   TREE WIND
========================= */

function animateTrees(t) {

    for(let i=0;i<trees.length;i++) {

        const tree=trees[i];

        if(!tree.visible) continue;

        tree.rotation.z =
            Math.sin(
                t*.001+i
            )*.018;
    }
}

/* =========================
   CAMERA
========================= */

const camTarget = new THREE.Vector3();

function updateCamera() {

    const distance=12;

    const horizontal =
        Math.cos(pitch)*distance;

    camera.position.x =
        player.position.x +
        Math.sin(yaw)*horizontal;

    camera.position.z =
        player.position.z +
        Math.cos(yaw)*horizontal;

    camera.position.y =
        player.position.y +
        3 +
        Math.sin(pitch)*distance;

    camTarget.copy(player.position);

    camTarget.y += 1.4;

    camera.lookAt(camTarget);
}

/* =========================
   RUN BUTTON
========================= */

const runButton =
button("🏃",205,180,()=>{});

runButton.onpointerdown = () => {
    running=true;
};

runButton.onpointerup = () => {
    running=false;
};

runButton.onpointercancel = () => {
    running=false;
};

/* =========================
   RESIZE
========================= */

window.addEventListener("resize",() => {

    camera.aspect =
        innerWidth/innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight,
        false
    );
});

/* =========================
   AUTOSAVE
========================= */

setInterval(saveGame,10000);

/* =========================
   GAME LOOP
========================= */

function loop(now) {

    requestAnimationFrame(loop);

    let dt =
        (now-lastTime)/1000;

    lastTime=now;

    dt=Math.min(dt,.05);

    movePlayer(dt);
    updateAnimals(dt);
    updateDay(dt);
    animateWater(dt);
    animateTrees(now);
    updateCamera();

    renderer.render(
        scene,
        camera
    );

    if(Math.floor(now/500)%2===0)
        updateHUD();
}

updateCamera();
updateHUD();

requestAnimationFrame(loop);

toast("🏝️ Selamat datang di Valen Island!");

})();
