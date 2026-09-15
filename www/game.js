// =====================================================
// VALEN ISLAND SURVIVAL — V1
// Lightweight 3D Survival Prototype
// =====================================================

const THREE = window.THREE;

// ---------- RESET ----------
document.body.innerHTML = "";
document.body.style.cssText = `
margin:0;
overflow:hidden;
background:#07131a;
font-family:Arial,sans-serif;
touch-action:none;
user-select:none;
`;

// ---------- GLOBAL ----------
let scene, camera, renderer;
let player, playerGroup;
let trees = [];
let rocks = [];
let keys = {};
let started = false;
let running = false;
let score = 0;
let wood = 0;
let stone = 0;
let hunger = 100;
let stamina = 100;
let clock = new THREE.Clock();
let audioCtx = null;
let lastStep = 0;

// ---------- UI ----------
const ui = document.createElement("div");
ui.style.cssText = `
position:fixed;
inset:0;
pointer-events:none;
`;
document.body.appendChild(ui);

// =====================================================
// LOADING SCREEN
// =====================================================

const loading = document.createElement("div");
loading.style.cssText = `
position:fixed;
inset:0;
background:linear-gradient(#071923,#102d32);
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
color:white;
z-index:100;
`;

loading.innerHTML = `
<div style="
font-size:38px;
font-weight:900;
letter-spacing:3px;
text-shadow:0 4px 20px #000;
">VALEN</div>

<div style="
font-size:18px;
letter-spacing:6px;
opacity:.85;
margin-top:4px;
">ISLAND SURVIVAL</div>

<div style="
width:260px;
height:8px;
background:#ffffff22;
border-radius:20px;
margin-top:45px;
overflow:hidden;
">
<div id="loadbar" style="
height:100%;
width:0%;
background:#6ee7b7;
border-radius:20px;
"></div>
</div>

<div id="loadtext" style="
margin-top:12px;
font-size:12px;
opacity:.65;
">Loading island...</div>
`;

document.body.appendChild(loading);

let loadProgress = 0;

const loadTimer = setInterval(() => {
    loadProgress += Math.random() * 14;

    if(loadProgress >= 100){
        loadProgress = 100;
        clearInterval(loadTimer);

        document.getElementById("loadtext").textContent =
            "Island ready";

        setTimeout(() => {
            loading.remove();
            showMenu();
        }, 500);
    }

    document.getElementById("loadbar").style.width =
        loadProgress + "%";

}, 180);

// =====================================================
// MAIN MENU
// =====================================================

function showMenu(){

    const menu = document.createElement("div");

    menu.id = "menu";

    menu.style.cssText = `
    position:fixed;
    inset:0;
    z-index:90;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    color:white;
    background:
    radial-gradient(circle at 50% 35%,#2e7270aa,transparent 38%),
    linear-gradient(#071923cc,#071923ee);
    `;

    menu.innerHTML = `
    <div style="
    font-size:44px;
    font-weight:900;
    letter-spacing:4px;
    text-shadow:0 5px 25px #000;
    ">
    VALEN
    </div>

    <div style="
    font-size:17px;
    letter-spacing:7px;
    opacity:.85;
    margin-bottom:55px;
    ">
    ISLAND SURVIVAL
    </div>

    <button id="startBtn" class="menuBtn">
    START GAME
    </button>

    <button class="menuBtn">
    MULTIPLAYER
    </button>

    <button class="menuBtn">
    SETTINGS
    </button>

    <div style="
    position:absolute;
    bottom:18px;
    opacity:.35;
    font-size:11px;
    ">
    VALEN ISLAND SURVIVAL • V1
    </div>
    `;

    document.body.appendChild(menu);

    const style = document.createElement("style");

    style.textContent = `
    .menuBtn{
        pointer-events:auto;
        width:230px;
        padding:15px;
        margin:7px;
        border:1px solid #ffffff33;
        border-radius:12px;
        background:#ffffff12;
        color:white;
        font-weight:bold;
        font-size:15px;
        letter-spacing:1px;
        backdrop-filter:blur(10px);
    }

    .menuBtn:active{
        transform:scale(.96);
        background:#6ee7b733;
    }
    `;

    document.head.appendChild(style);

    document.getElementById("startBtn").onclick = () => {

        menu.remove();

        initAudio();
        initGame();

    };
}

// =====================================================
// AUDIO
// =====================================================

function initAudio(){

    if(!audioCtx){
        audioCtx =
            new (window.AudioContext ||
            window.webkitAudioContext)();
    }

    if(audioCtx.state === "suspended"){
        audioCtx.resume();
    }

    // ocean ambience
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.value = 90;
    gain.gain.value = .015;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
}

function sound(type){

    if(!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if(type === "step"){
        osc.frequency.value = 90;
        gain.gain.value = .035;
    }

    if(type === "chop"){
        osc.type = "square";
        osc.frequency.value = 120;
        gain.gain.value = .06;
    }

    if(type === "collect"){
        osc.frequency.value = 600;
        gain.gain.value = .05;
    }

    if(type === "rock"){
        osc.type = "square";
        osc.frequency.value = 180;
        gain.gain.value = .05;
    }

    osc.start();

    gain.gain.exponentialRampToValueAtTime(
        .001,
        audioCtx.currentTime + .12
    );

    osc.stop(audioCtx.currentTime + .13);
}

// =====================================================
// GAME INIT
// =====================================================

function initGame(){

    started = true;

    scene = new THREE.Scene();

    scene.background =
        new THREE.Color(0x83cfe0);

    scene.fog =
        new THREE.Fog(0x83cfe0,35,100);

    camera =
        new THREE.PerspectiveCamera(
            60,
            innerWidth / innerHeight,
            .1,
            150
        );

    renderer =
        new THREE.WebGLRenderer({
            antialias:true,
            powerPreference:"high-performance"
        });

    renderer.setPixelRatio(
        Math.min(devicePixelRatio,1.2)
    );

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    renderer.shadowMap.enabled = true;

    document.body.appendChild(renderer.domElement);

    // ---------- LIGHT ----------
    const hemi =
        new THREE.HemisphereLight(
            0xcff8ff,
            0x38533a,
            2.2
        );

    scene.add(hemi);

    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            2.5
        );

    sun.position.set(25,35,15);

    sun.castShadow = true;

    scene.add(sun);

    // ---------- WORLD ----------
    createIsland();
    createOcean();
    createTrees();
    createRocks();
    createPlayer();

    // ---------- UI ----------
    createHUD();
    createControls();

    window.addEventListener(
        "resize",
        resize
    );

    animate();
}

// =====================================================
// ISLAND
// =====================================================

function createIsland(){

    const geo =
        new THREE.CylinderGeometry(
            27,
            31,
            2.5,
            48
        );

    const mat =
        new THREE.MeshStandardMaterial({
            color:0x4d8b4d,
            roughness:1
        });

    const island =
        new THREE.Mesh(geo,mat);

    island.position.y = -1.3;

    island.receiveShadow = true;

    scene.add(island);

    // sand
    const sandGeo =
        new THREE.CylinderGeometry(
            28,
            29,
            .5,
            48
        );

    const sandMat =
        new THREE.MeshStandardMaterial({
            color:0xd9c48b
        });

    const sand =
        new THREE.Mesh(
            sandGeo,
            sandMat
        );

    sand.position.y = .05;

    scene.add(sand);

    // grass center
    const grassGeo =
        new THREE.CircleGeometry(
            23,
            48
        );

    const grassMat =
        new THREE.MeshStandardMaterial({
            color:0x5f9c52
        });

    const grass =
        new THREE.Mesh(
            grassGeo,
            grassMat
        );

    grass.rotation.x = -Math.PI/2;

    grass.position.y = .31;

    scene.add(grass);
}

// =====================================================
// OCEAN
// =====================================================

function createOcean(){

    const geo =
        new THREE.PlaneGeometry(
            220,
            220
        );

    const mat =
        new THREE.MeshStandardMaterial({
            color:0x248fa5,
            roughness:.3,
            metalness:.05
        });

    const ocean =
        new THREE.Mesh(
            geo,
            mat
        );

    ocean.rotation.x = -Math.PI/2;

    ocean.position.y = -.35;

    scene.add(ocean);
}

// =====================================================
// TREES
// =====================================================

function createTrees(){

    const positions = [
        [-12,-7],
        [-7,-12],
        [3,-14],
        [12,-8],
        [15,4],
        [8,13],
        [-5,15],
        [-15,8],
        [0,9],
        [-18,-2],
        [18,-2]
    ];

    positions.forEach(p => {

        const group =
            new THREE.Group();

        const trunk =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    .45,.6,3.4,8
                ),
                new THREE.MeshStandardMaterial({
                    color:0x76502e
                })
            );

        trunk.position.y = 2;

        trunk.castShadow = true;

        group.add(trunk);

        const leaves =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    2.1,
                    10,
                    8
                ),
                new THREE.MeshStandardMaterial({
                    color:0x26734b
                })
            );

        leaves.position.y = 4.2;

        leaves.castShadow = true;

        group.add(leaves);

        group.position.set(
            p[0],
            0,
            p[1]
        );

        scene.add(group);

        trees.push({
            group,
            health:3,
            cooldown:0
        });
    });
}

// =====================================================
// ROCKS
// =====================================================

function createRocks(){

    const positions = [
        [-5,-4],
        [6,-6],
        [-10,4],
        [5,7],
        [14,9],
        [-15,-10]
    ];

    positions.forEach(p => {

        const rock =
            new THREE.Mesh(
                new THREE.DodecahedronGeometry(
                    1.2,
                    0
                ),
                new THREE.MeshStandardMaterial({
                    color:0x777879,
                    roughness:1
                })
            );

        rock.position.set(
            p[0],
            .8,
            p[1]
        );

        rock.rotation.y =
            Math.random()*3;

        rock.castShadow = true;

        scene.add(rock);

        rocks.push({
            mesh:rock,
            health:3
        });
    });
}

// =====================================================
// PLAYER
// =====================================================

function createPlayer(){

    playerGroup =
        new THREE.Group();

    // body
    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                .45,
                1.1,
                4,
                8
            ),
            new THREE.MeshStandardMaterial({
                color:0x315c70
            })
        );

    body.position.y = 1.2;

    body.castShadow = true;

    playerGroup.add(body);

    // head
    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .42,
                12,
                10
            ),
            new THREE.MeshStandardMaterial({
                color:0xe0aa78
            })
        );

    head.position.y = 2.25;

    head.castShadow = true;

    playerGroup.add(head);

    playerGroup.position.set(
        0,
        .35,
        0
    );

    scene.add(playerGroup);

    player = playerGroup;
}

// =====================================================
// HUD
// =====================================================

function createHUD(){

    const hud =
        document.createElement("div");

    hud.id = "hud";

    hud.style.cssText = `
    position:fixed;
    top:12px;
    left:12px;
    right:12px;
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    color:white;
    pointer-events:none;
    `;

    hud.innerHTML = `
    <div style="
    background:#071923aa;
    padding:10px 14px;
    border-radius:12px;
    backdrop-filter:blur(8px);
    min-width:170px;
    ">

    <div style="font-size:11px;opacity:.7">
    SURVIVAL
    </div>

    <div style="margin-top:5px">
    ❤️ <span id="hp">100</span>
    </div>

    <div>
    🍖 <span id="food">100</span>
    </div>

    <div>
    ⚡ <span id="stam">100</span>
    </div>

    </div>

    <div style="
    background:#071923aa;
    padding:10px 14px;
    border-radius:12px;
    backdrop-filter:blur(8px);
    text-align:right;
    ">

    🪵 <span id="wood">0</span><br>
    🪨 <span id="stone">0</span>

    </div>
    `;

    document.body.appendChild(hud);
}

// =====================================================
// CONTROLS
// =====================================================

function createControls(){

    const controls =
        document.createElement("div");

    controls.style.cssText = `
    position:fixed;
    inset:0;
    pointer-events:none;
    `;

    // joystick
    const joy =
        document.createElement("div");

    joy.style.cssText = `
    position:absolute;
    left:35px;
    bottom:35px;
    width:115px;
    height:115px;
    border-radius:50%;
    background:#ffffff18;
    border:2px solid #ffffff30;
    pointer-events:auto;
    `;

    const stick =
        document.createElement("div");

    stick.style.cssText = `
    position:absolute;
    width:55px;
    height:55px;
    left:28px;
    top:28px;
    border-radius:50%;
    background:#ffffff45;
    `;

    joy.appendChild(stick);

    controls.appendChild(joy);

    // action buttons
    const runBtn =
        makeButton(
            "RUN",
            "right:145px;bottom:48px;"
        );

    const actionBtn =
        makeButton(
            "🪓",
            "right:45px;bottom:125px;"
        );

    const jumpBtn =
        makeButton(
            "JUMP",
            "right:45px;bottom:48px;"
        );

    controls.appendChild(runBtn);
    controls.appendChild(actionBtn);
    controls.appendChild(jumpBtn);

    document.body.appendChild(controls);

    // joystick state
    let joyX = 0;
    let joyY = 0;
    let dragging = false;

    joy.addEventListener("pointerdown",e=>{
        dragging=true;
        joy.setPointerCapture(e.pointerId);
    });

    joy.addEventListener("pointermove",e=>{

        if(!dragging)return;

        const r =
            joy.getBoundingClientRect();

        let x =
            e.clientX -
            (r.left+r.width/2);

        let y =
            e.clientY -
            (r.top+r.height/2);

        const max = 40;

        const len =
            Math.hypot(x,y);

        if(len>max){
            x = x/len*max;
            y = y/len*max;
        }

        joyX=x/max;
        joyY=y/max;

        stick.style.transform =
            `translate(${x}px,${y}px)`;
    });

    joy.addEventListener("pointerup",()=>{
        dragging=false;
        joyX=0;
        joyY=0;
        stick.style.transform="translate(0,0)";
    });

    window.joyX = () => joyX;
    window.joyY = () => joyY;

    runBtn.onpointerdown = () => {
        running=true;
    };

    runBtn.onpointerup = () => {
        running=false;
    };

    actionBtn.onclick = () => {
        chop();
    };

    jumpBtn.onclick = () => {
        player.position.y += .5;

        setTimeout(()=>{
            player.position.y = .35;
        },220);
    };
}

function makeButton(text,pos){

    const b =
        document.createElement("button");

    b.textContent=text;

    b.style.cssText = `
    position:absolute;
    ${pos}
    width:65px;
    height:65px;
    border-radius:50%;
    border:1px solid #ffffff40;
    background:#07192399;
    color:white;
    font-weight:bold;
    pointer-events:auto;
    backdrop-filter:blur(8px);
    `;

    return b;
}

// =====================================================
// CHOP / COLLECT
// =====================================================

function chop(){

    if(!player)return;

    let nearest = null;
    let dist = 999;

    trees.forEach(t=>{

        const d =
            player.position.distanceTo(
                t.group.position
            );

        if(d<dist){
            dist=d;
            nearest=t;
        }
    });

    if(nearest && dist<4){

        nearest.health--;

        sound("chop");

        // shake
        nearest.group.rotation.z =
            .12;

        setTimeout(()=>{
            nearest.group.rotation.z=0;
        },100);

        if(nearest.health<=0){

            wood += 3;

            document.getElementById("wood")
                .textContent=wood;

            sound("collect");

            scene.remove(
                nearest.group
            );

            trees =
                trees.filter(
                    x=>x!==nearest
                );
        }
    }
}

// =====================================================
// MOVEMENT
// =====================================================

function updatePlayer(dt){

    if(!player)return;

    let x =
        window.joyX ?
        window.joyX() : 0;

    let z =
        window.joyY ?
        window.joyY() : 0;

    // keyboard backup
    if(keys["w"])z=-1;
    if(keys["s"])z=1;
    if(keys["a"])x=-1;
    if(keys["d"])x=1;

    const len =
        Math.hypot(x,z);

    if(len<.05)return;

    x/=len;
    z/=len;

    let speed =
        running && stamina>0 ?
        6 : 3.2;

    if(running && stamina>0){
        stamina -= dt*14;
    }else{
        stamina += dt*8;
    }

    stamina =
        THREE.MathUtils.clamp(
            stamina,0,100
        );

    player.position.x +=
        x*speed*dt;

    player.position.z +=
        z*speed*dt;

    // island boundary
    const d =
        Math.hypot(
            player.position.x,
            player.position.z
        );

    if(d>22){

        player.position.x *=
            22/d;

        player.position.z *=
            22/d;
    }

    // face direction
    player.rotation.y =
        Math.atan2(x,z);

    // walking animation
    player.position.y =
        .35 +
        Math.sin(
            performance.now()*.012
        )*.045;

    if(
        performance.now()-lastStep>380
    ){

        sound("step");

        lastStep =
            performance.now();
    }
}

// =====================================================
// CAMERA
// =====================================================

function updateCamera(){

    if(!player)return;

    const target =
        new THREE.Vector3(
            player.position.x,
            player.position.y+2,
            player.position.z
        );

    const desired =
        new THREE.Vector3(
            player.position.x,
            player.position.y+8,
            player.position.z+10
        );

    camera.position.lerp(
        desired,
        .08
    );

    camera.lookAt(target);
}

// =====================================================
// TIME OF DAY
// =====================================================

let dayTime = 0;

function updateDayNight(dt){

    dayTime += dt*.015;

    const cycle =
        Math.sin(dayTime);

    const daylight =
        Math.max(
            .25,
            (cycle+1)/2
        );

    scene.background.lerpColors(
        new THREE.Color(0x10243a),
        new THREE.Color(0x83cfe0),
        daylight
    );

    scene.fog.color.copy(
        scene.background
    );
}

// =====================================================
// HUD UPDATE
// =====================================================

function updateHUD(){

    const stam =
        document.getElementById("stam");

    if(stam)
        stam.textContent =
            Math.round(stamina);

    const food =
        document.getElementById("food");

    if(food)
        food.textContent =
            Math.round(hunger);
}

// =====================================================
// KEYBOARD
// =====================================================

window.addEventListener(
    "keydown",
    e=>{
        keys[e.key.toLowerCase()] = true;
    }
);

window.addEventListener(
    "keyup",
    e=>{
        keys[e.key.toLowerCase()] = false;
    }
);

// =====================================================
// RESIZE
// =====================================================

function resize(){

    if(!camera || !renderer)return;

    camera.aspect =
        innerWidth/innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );
}

// =====================================================
// GAME LOOP
// =====================================================

function animate(){

    requestAnimationFrame(
        animate
    );

    const dt =
        Math.min(
            clock.getDelta(),
            .05
        );

    updatePlayer(dt);
    updateCamera();
    updateDayNight(dt);
    updateHUD();

    // subtle water movement
    scene.traverse(obj=>{

        if(
            obj.geometry &&
            obj.geometry.type ===
            "PlaneGeometry" &&
            obj.material &&
            obj.material.color &&
            obj.material.color.getHex() ===
            0x248fa5
        ){

            obj.position.y =
                -.35 +
                Math.sin(
                    performance.now()*.001
                )*.025;
        }
    });

    renderer.render(
        scene,
        camera
    );
}
