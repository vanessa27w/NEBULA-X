// ============================================================
// VALEN ISLAND SURVIVAL
// FINAL BUILD - CORE SYSTEM
// ============================================================

const THREE = window.THREE;

document.body.innerHTML = "";

const GAME_KEY = "VALEN_ISLAND_SURVIVAL_SAVE_V1";
const SETTINGS_KEY = "VALEN_SETTINGS_V1";

let settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") || {
    sensitivity: 0.004,
    master: 0.8,
    music: 0.5,
    sfx: 0.8,
    graphics: "medium",
    fps: 60,
    shadows: true,
    effects: true,
    batterySaver: false,
    vibration: true,
    hud: true,
    invertY: false,
    uiScale: 1
};

let save = JSON.parse(localStorage.getItem(GAME_KEY) || "null") || {
    wood: 0,
    stone: 0,
    coconut: 0,
    fish: 0,
    berry: 0,
    health: 100,
    hunger: 100,
    thirst: 100,
    stamina: 100,
    day: 1,
    time: 8,
    quest: 0,
    campfire: false,
    shelter: false,
    beacon: false,
    ending: false,
    pos: { x: 0, z: 8 }
};

let scene, camera, renderer, clock;
let player;
let sun, hemi;
let ocean;
let oceanBase = [];
let stars;

let trees = [];
let rocks = [];
let bushes = [];

let joyX = 0;
let joyY = 0;
let joyActive = false;

let cameraYaw = 0;
let cameraPitch = 0.22;
let cameraTouch = null;

let velocityY = 0;
let grounded = true;
let running = false;

let gameStarted = false;
let paused = false;
let editUI = false;

let audioCtx = null;
let masterGain = null;

const ui = {};

// ------------------------------------------------------------
// STYLE
// ------------------------------------------------------------

const style = document.createElement("style");
style.textContent = `
*{
    box-sizing:border-box;
    -webkit-tap-highlight-color:transparent;
}
html,body{
    margin:0;
    width:100%;
    height:100%;
    overflow:hidden;
    background:#071923;
    font-family:Arial,sans-serif;
    touch-action:none;
    user-select:none;
}
button{
    border:0;
    color:white;
    font-weight:bold;
    background:rgba(5,20,28,.82);
    border:1px solid rgba(255,255,255,.15);
    box-shadow:0 6px 20px rgba(0,0,0,.25);
}
button:active{
    transform:scale(.93);
}
canvas{
    position:fixed;
    inset:0;
    width:100%;
    height:100%;
}
#loading{
    position:fixed;
    inset:0;
    z-index:1000;
    background:linear-gradient(#071923,#0d3040);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    color:white;
}
#loading h1{
    font-size:38px;
    margin:0 0 10px;
    letter-spacing:3px;
}
#loadText{
    opacity:.7;
}
#bar{
    width:280px;
    height:8px;
    margin-top:25px;
    border-radius:20px;
    background:#163b49;
    overflow:hidden;
}
#bar i{
    display:block;
    width:0%;
    height:100%;
    background:#55d6a6;
}
.menu{
    position:fixed;
    inset:0;
    z-index:900;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    background:
      radial-gradient(circle at 50% 35%,rgba(42,130,130,.35),transparent 40%),
      linear-gradient(#071923dd,#071923);
    color:white;
}
.menu h1{
    font-size:42px;
    letter-spacing:4px;
    margin:0;
}
.menu p{
    opacity:.65;
    margin:8px 0 28px;
}
.menu button{
    width:270px;
    padding:16px;
    margin:6px;
    border-radius:14px;
    font-size:17px;
}
.primary{
    background:#287d68;
}
.hud{
    position:fixed;
    z-index:20;
    pointer-events:none;
    color:white;
}
#status{
    left:16px;
    top:15px;
    width:220px;
    padding:12px;
    border-radius:14px;
    background:rgba(4,18,24,.68);
    backdrop-filter:blur(8px);
}
#status b{
    font-size:17px;
}
.stat{
    height:7px;
    background:#18333d;
    border-radius:10px;
    margin:6px 0;
    overflow:hidden;
}
.stat i{
    display:block;
    height:100%;
    width:100%;
    border-radius:10px;
}
#healthBar{background:#ef6262}
#hungerBar{background:#e7ad4d}
#thirstBar{background:#4da9ef}
#staminaBar{background:#55d6a6}
#inventory{
    right:16px;
    top:15px;
    min-width:170px;
    padding:12px;
    border-radius:14px;
    background:rgba(4,18,24,.68);
    color:white;
}
.uiBtn{
    position:fixed;
    z-index:30;
    width:72px;
    height:72px;
    border-radius:50%;
    font-size:13px;
    touch-action:none;
}
#joystick{
    position:fixed;
    z-index:30;
    left:4vw;
    bottom:6vh;
    width:140px;
    height:140px;
    border-radius:50%;
    background:rgba(255,255,255,.12);
    border:2px solid rgba(255,255,255,.18);
    touch-action:none;
}
#stick{
    position:absolute;
    left:50%;
    top:50%;
    width:64px;
    height:64px;
    margin:-32px;
    border-radius:50%;
    background:rgba(255,255,255,.32);
}
#run{
    right:16vw;
    bottom:7vh;
}
#jump{
    right:6vw;
    bottom:7vh;
}
#action{
    right:7vw;
    bottom:25vh;
}
#fish{
    right:18vw;
    bottom:25vh;
    display:none;
}
.topBtn{
    position:fixed;
    z-index:40;
    top:16px;
    width:48px;
    height:48px;
    border-radius:14px;
}
#settingsBtn{
    right:16px;
}
#bagBtn{
    right:72px;
}
#quest{
    position:fixed;
    z-index:20;
    left:50%;
    top:16px;
    transform:translateX(-50%);
    padding:10px 18px;
    max-width:430px;
    text-align:center;
    border-radius:20px;
    background:rgba(4,18,24,.62);
    color:white;
}
#panel{
    position:fixed;
    z-index:200;
    inset:7% 8%;
    border-radius:22px;
    padding:24px;
    overflow:auto;
    background:rgba(4,17,23,.96);
    color:white;
    display:none;
}
#panel h2{
    margin-top:0;
}
.row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:14px;
    padding:12px 0;
    border-bottom:1px solid rgba(255,255,255,.08);
}
.row input[type=range]{
    width:180px;
}
.row select{
    padding:8px;
    border-radius:8px;
}
.panelBtn{
    padding:12px 18px;
    border-radius:10px;
    margin:5px;
}
#toast{
    position:fixed;
    z-index:500;
    left:50%;
    bottom:15%;
    transform:translateX(-50%);
    background:rgba(0,0,0,.8);
    color:white;
    padding:12px 20px;
    border-radius:20px;
    opacity:0;
    transition:.25s;
    pointer-events:none;
}
.editing{
    outline:3px dashed #55d6a6!important;
}
@media(max-width:700px){
    #status{
        transform:scale(.85);
        transform-origin:top left;
    }
    #inventory{
        transform:scale(.85);
        transform-origin:top right;
    }
    #quest{
        font-size:12px;
        max-width:280px;
    }
}
`;
document.head.appendChild(style);

// ------------------------------------------------------------
// LOADING
// ------------------------------------------------------------

const loading = document.createElement("div");
loading.id = "loading";
loading.innerHTML = `
<h1>VALEN</h1>
<div>ISLAND SURVIVAL</div>
<div id="loadText">Preparing island...</div>
<div id="bar"><i></i></div>
`;
document.body.appendChild(loading);

let loadProgress = 0;
const loadTimer = setInterval(() => {
    loadProgress += 10;
    document.querySelector("#bar i").style.width = loadProgress + "%";

    if(loadProgress < 40)
        document.querySelector("#loadText").textContent = "Preparing island...";
    else if(loadProgress < 70)
        document.querySelector("#loadText").textContent = "Preparing survival system...";
    else
        document.querySelector("#loadText").textContent = "Almost ready...";

    if(loadProgress >= 100){
        clearInterval(loadTimer);
        loading.remove();
        showMenu();
    }
},70);

// ------------------------------------------------------------
// MAIN MENU
// ------------------------------------------------------------

function showMenu(){
    const menu=document.createElement("div");
    menu.className="menu";
    menu.id="mainMenu";

    menu.innerHTML=`
        <h1>VALEN</h1>
        <p>ISLAND SURVIVAL</p>
        <button class="primary" id="startBtn">START NEW GAME</button>
        ${localStorage.getItem(GAME_KEY)
          ? `<button id="continueBtn">CONTINUE</button>` : ""}
        <button id="multiBtn">MULTIPLAYER</button>
        <button id="menuSettings">SETTINGS</button>
    `;

    document.body.appendChild(menu);

    document.getElementById("startBtn").onclick=()=>{
        initAudio();
        newGame();
        startGame();
    };

    if(document.getElementById("continueBtn")){
        document.getElementById("continueBtn").onclick=()=>{
            initAudio();
            startGame();
        };
    }

    document.getElementById("multiBtn").onclick=()=>{
        toast("ONLINE MULTIPLAYER — SERVER BELUM DIHUBUNGKAN");
    };

    document.getElementById("menuSettings").onclick=()=>{
        openSettings(true);
    };
}

// ------------------------------------------------------------
// NEW GAME
// ------------------------------------------------------------

function newGame(){
    save={
        wood:0,
        stone:0,
        coconut:0,
        fish:0,
        berry:0,
        health:100,
        hunger:100,
        thirst:100,
        stamina:100,
        day:1,
        time:8,
        quest:0,
        campfire:false,
        shelter:false,
        beacon:false,
        ending:false,
        pos:{x:0,z:8}
    };

    localStorage.setItem(GAME_KEY,JSON.stringify(save));
}

// ------------------------------------------------------------
// GAME START
// ------------------------------------------------------------

function startGame(){
    document.getElementById("mainMenu")?.remove();

    if(gameStarted){
        paused=false;
        return;
    }

    gameStarted=true;

    initThree();
    createWorld();
    createPlayer();
    createHUD();
    createControls();

    window.addEventListener("resize",resize);
    window.addEventListener("beforeunload",saveGame);

    animate();
}

// ------------------------------------------------------------
// THREE
// ------------------------------------------------------------

function initThree(){

    scene=new THREE.Scene();

    scene.background=new THREE.Color(0x79cce5);

    camera=new THREE.PerspectiveCamera(
        65,
        innerWidth/innerHeight,
        .1,
        180
    );

    renderer=new THREE.WebGLRenderer({
        antialias:settings.graphics!=="low"
    });

    renderer.setSize(innerWidth,innerHeight);
    renderer.setPixelRatio(
        settings.batterySaver ? 1 : Math.min(devicePixelRatio,1.25)
    );

    renderer.shadowMap.enabled=
        settings.shadows && settings.graphics!=="low";

    document.body.appendChild(renderer.domElement);

    clock=new THREE.Clock();

    hemi=new THREE.HemisphereLight(
        0xbdeeff,
        0x315044,
        1.25
    );

    scene.add(hemi);

    sun=new THREE.DirectionalLight(
        0xffffff,
        1.5
    );

    sun.position.set(20,35,15);

    if(renderer.shadowMap.enabled){
        sun.castShadow=true;
        sun.shadow.mapSize.width=512;
        sun.shadow.mapSize.height=512;
    }

    scene.add(sun);
}

// ------------------------------------------------------------
// MATERIAL
// ------------------------------------------------------------

function mat(color){
    return new THREE.MeshLambertMaterial({color});
}

// ------------------------------------------------------------
// WORLD
// ------------------------------------------------------------

function createWorld(){

    // grass island
    const island=new THREE.Mesh(
        new THREE.CylinderGeometry(30,34,2,48),
        mat(0x4b9a57)
    );

    island.position.y=-1;
    island.receiveShadow=true;
    scene.add(island);

    // beach
    const beach=new THREE.Mesh(
        new THREE.CylinderGeometry(31,35,1,48),
        mat(0xe7d39c)
    );

    beach.position.y=-.48;
    scene.add(beach);

    // grass top
    const grass=new THREE.Mesh(
        new THREE.CylinderGeometry(28.5,31,1.1,48),
        mat(0x57a85c)
    );

    grass.position.y=.02;
    grass.receiveShadow=true;
    scene.add(grass);

    // ocean
    const geo=new THREE.PlaneGeometry(
        150,
        150,
        settings.graphics==="low"?12:24,
        settings.graphics==="low"?12:24
    );

    geo.rotateX(-Math.PI/2);

    ocean=new THREE.Mesh(
        geo,
        new THREE.MeshLambertMaterial({
            color:0x1595b8,
            transparent:true,
            opacity:.9
        })
    );

    ocean.position.y=-.3;
    scene.add(ocean);

    oceanBase=Array.from(
        geo.attributes.position.array
    );

    // palms
    for(let i=0;i<14;i++){

        const a=Math.random()*Math.PI*2;
        const r=18+Math.random()*9;

        createPalm(
            Math.cos(a)*r,
            Math.sin(a)*r
        );
    }

    // normal trees
    for(let i=0;i<12;i++){

        const p=randomIslandPoint(6,21);

        createTree(p.x,p.z);
    }

    // rocks
    for(let i=0;i<14;i++){

        const p=randomIslandPoint(5,24);

        createRock(p.x,p.z);
    }

    // bushes
    for(let i=0;i<10;i++){

        const p=randomIslandPoint(5,23);

        createBush(p.x,p.z);
    }

    createRuins();

    createStars();
}

// ------------------------------------------------------------
// RANDOM POSITION
// ------------------------------------------------------------

function randomIslandPoint(min,max){

    const a=Math.random()*Math.PI*2;
    const r=min+Math.random()*(max-min);

    return {
        x:Math.cos(a)*r,
        z:Math.sin(a)*r
    };
}

// ------------------------------------------------------------
// PALM
// ------------------------------------------------------------

function createPalm(x,z){

    const g=new THREE.Group();

    g.position.set(x,0,z);

    const trunk=new THREE.Mesh(
        new THREE.CylinderGeometry(.28,.42,5.5,8),
        mat(0x8b5b32)
    );

    trunk.position.y=2.75;
    trunk.rotation.z=(Math.random()-.5)*.12;

    g.add(trunk);

    for(let i=0;i<7;i++){

        const leaf=new THREE.Mesh(
            new THREE.BoxGeometry(.3,3.5,.7),
            mat(0x21834b)
        );

        const a=i/7*Math.PI*2;

        leaf.position.set(
            Math.cos(a)*1.25,
            5.45,
            Math.sin(a)*1.25
        );

        leaf.rotation.y=a;
        leaf.rotation.z=.7;

        g.add(leaf);
    }

    for(let i=0;i<3;i++){

        const coconut=new THREE.Mesh(
            new THREE.SphereGeometry(.28,8,6),
            mat(0x6b4325)
        );

        coconut.position.set(
            (Math.random()-.5)*.6,
            5.05,
            (Math.random()-.5)*.6
        );

        g.add(coconut);
    }

    g.userData={
        type:"palm",
        hp:4,
        alive:true,
        sway:Math.random()*10
    };

    scene.add(g);
    trees.push(g);
}

// ------------------------------------------------------------
// TREE
// ------------------------------------------------------------

function createTree(x,z){

    const g=new THREE.Group();

    g.position.set(x,0,z);

    const trunk=new THREE.Mesh(
        new THREE.CylinderGeometry(.3,.45,3.5,8),
        mat(0x76502e)
    );

    trunk.position.y=1.75;
    g.add(trunk);

    const leaves=new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.2,1),
        mat(0x267b3d)
    );

    leaves.position.y=4;
    g.add(leaves);

    g.userData={
        type:"tree",
        hp:3,
        alive:true,
        sway:Math.random()*10
    };

    scene.add(g);
    trees.push(g);
}

// ------------------------------------------------------------
// ROCK
// ------------------------------------------------------------

function createRock(x,z){

    const g=new THREE.Mesh(
        new THREE.DodecahedronGeometry(
            .9+Math.random()*.5,
            0
        ),
        mat(0x777b78)
    );

    g.position.set(x,.65,z);

    g.rotation.set(
        Math.random(),
        Math.random(),
        Math.random()
    );

    g.userData={
        type:"rock",
        hp:3,
        alive:true
    };

    scene.add(g);
    rocks.push(g);
}

// ------------------------------------------------------------
// BUSH
// ------------------------------------------------------------

function createBush(x,z){

    const g=new THREE.Group();

    g.position.set(x,0,z);

    for(let i=0;i<5;i++){

        const leaf=new THREE.Mesh(
            new THREE.SphereGeometry(.55,7,6),
            mat(0x2f8b46)
        );

        leaf.position.set(
            (Math.random()-.5)*.8,
            .5+Math.random()*.4,
            (Math.random()-.5)*.8
        );

        g.add(leaf);
    }

    g.userData={
        type:"bush",
        hp:2,
        alive:true
    };

    scene.add(g);
    bushes.push(g);
}

// ------------------------------------------------------------
// RUINS
// ------------------------------------------------------------

let ruins;

function createRuins(){

    ruins=new THREE.Group();

    ruins.position.set(15,0,10);

    for(let i=0;i<5;i++){

        const stone=new THREE.Mesh(
            new THREE.BoxGeometry(
                1.4,
                2+Math.random(),
                1.2
            ),
            mat(0x686c68)
        );

        stone.position.set(
            (Math.random()-.5)*6,
            1,
            (Math.random()-.5)*5
        );

        stone.rotation.y=Math.random();

        ruins.add(stone);
    }

    const beaconBase=new THREE.Mesh(
        new THREE.CylinderGeometry(1.4,1.8,1,8),
        mat(0x515554)
    );

    beaconBase.position.y=.5;
    ruins.add(beaconBase);

    scene.add(ruins);
}

// ------------------------------------------------------------
// STARS
// ------------------------------------------------------------

function createStars(){

    const positions=[];

    for(let i=0;i<100;i++){

        positions.push(
            (Math.random()-.5)*120,
            20+Math.random()*35,
            (Math.random()-.5)*120
        );
    }

    const geo=new THREE.BufferGeometry();

    geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions,3)
    );

    stars=new THREE.Points(
        geo,
        new THREE.PointsMaterial({
            color:0xffffff,
            size:.12
        })
    );

    scene.add(stars);

    stars.visible=false;
}

// ------------------------------------------------------------
// PLAYER
// ------------------------------------------------------------

function createPlayer(){

    player=new THREE.Group();

    player.position.set(
        save.pos.x,
        .4,
        save.pos.z
    );

    // body
    const body=new THREE.Mesh(
        new THREE.CapsuleGeometry(.45,1.05,4,8),
        mat(0x267d88)
    );

    body.position.y=1.05;
    body.castShadow=true;

    player.add(body);

    // head
    const head=new THREE.Mesh(
        new THREE.SphereGeometry(.43,12,8),
        mat(0xd9a77c)
    );

    head.position.y=2;
    head.castShadow=true;

    player.add(head);

    // backpack
    const pack=new THREE.Mesh(
        new THREE.BoxGeometry(.5,.7,.28),
        mat(0x4a3425)
    );

    pack.position.set(0,1.15,.43);

    player.add(pack);

    scene.add(player);
}

// ------------------------------------------------------------
// HUD
// ------------------------------------------------------------

function createHUD(){

    ui.status=document.createElement("div");
    ui.status.id="status";
    ui.status.innerHTML=`
        <b>🌴 SURVIVAL</b>
        <div>❤️ HEALTH</div>
        <div class="stat"><i id="healthBar"></i></div>
        <div>🍖 HUNGER</div>
        <div class="stat"><i id="hungerBar"></i></div>
        <div>💧 THIRST</div>
        <div class="stat"><i id="thirstBar"></i></div>
        <div>⚡ STAMINA</div>
        <div class="stat"><i id="staminaBar"></i></div>
    `;

    document.body.appendChild(ui.status);

    ui.inventory=document.createElement("div");
    ui.inventory.id="inventory";
    document.body.appendChild(ui.inventory);

    ui.quest=document.createElement("div");
    ui.quest.id="quest";
    document.body.appendChild(ui.quest);

    ui.settings=document.createElement("button");
    ui.settings.id="settingsBtn";
    ui.settings.className="topBtn";
    ui.settings.textContent="⚙️";
    document.body.appendChild(ui.settings);

    ui.bag=document.createElement("button");
    ui.bag.id="bagBtn";
    ui.bag.className="topBtn";
    ui.bag.textContent="🎒";
    document.body.appendChild(ui.bag);

    ui.settings.onclick=()=>openSettings(false);
    ui.bag.onclick=()=>openInventory();

    updateHUD();
}

// ------------------------------------------------------------
// CONTROLS
// ------------------------------------------------------------

function createControls(){

    ui.joystick=document.createElement("div");
    ui.joystick.id="joystick";

    ui.stick=document.createElement("div");
    ui.stick.id="stick";

    ui.joystick.appendChild(ui.stick);
    document.body.appendChild(ui.joystick);

    ui.run=makeButton("run","RUN");
    ui.jump=makeButton("jump","JUMP");
    ui.action=makeButton("action","🪓");
    ui.fish=makeButton("fish","🎣");

    joystickEvents();
    actionEvents();

    applyUI();
}

// ------------------------------------------------------------
// BUTTON
// ------------------------------------------------------------

function makeButton(id,text){

    const b=document.createElement("button");

    b.id=id;
    b.className="uiBtn";
    b.textContent=text;

    document.body.appendChild(b);

    return b;
}

// ------------------------------------------------------------
// JOYSTICK
// ------------------------------------------------------------

function joystickEvents(){

    const joy=ui.joystick;

    function move(e){

        if(editUI)return;

        const r=joy.getBoundingClientRect();

        const cx=r.left+r.width/2;
        const cy=r.top+r.height/2;

        let x=e.clientX-cx;
        let y=e.clientY-cy;

        const max=r.width*.35;

        x=THREE.MathUtils.clamp(x,-max,max);
        y=THREE.MathUtils.clamp(y,-max,max);

        joyX=x/max;
        joyY=y/max;

        ui.stick.style.transform=
            `translate(${x}px,${y}px)`;
    }

    joy.addEventListener("pointerdown",e=>{
        if(editUI)return;
        joyActive=true;
        joy.setPointerCapture(e.pointerId);
        move(e);
    });

    joy.addEventListener("pointermove",e=>{
        if(joyActive)move(e);
    });

    joy.addEventListener("pointerup",()=>{
        joyActive=false;
        joyX=0;
        joyY=0;
        ui.stick.style.transform="";
    });
}

// ------------------------------------------------------------
// ACTION
// ------------------------------------------------------------

function actionEvents(){

    ui.run.onpointerdown=()=>{
        if(!editUI){
            running=true;
        }
    };

    ui.run.onpointerup=()=>{
        running=false;
    };

    ui.jump.onclick=()=>{
        if(editUI)return;

        if(grounded){
            velocityY=7;
            grounded=false;
            sound("jump");
        }
    };

    ui.action.onclick=()=>{
        if(editUI)return;
        gather();
    };

    ui.fish.onclick=()=>{
        if(editUI)return;
        fishing();
    };
}

// ------------------------------------------------------------
// GATHER
// ------------------------------------------------------------

function gather(){

    const nearest=findNearest();

    if(!nearest){
        toast("Tidak ada resource di dekatmu");
        return;
    }

    if(nearest.userData.type==="palm"){

        save.coconut+=1;
        nearest.userData.hp--;

        toast("+1 🥥 Coconut");
        sound("pickup");

    }else if(nearest.userData.type==="tree"){

        save.wood+=2;
        nearest.userData.hp--;

        toast("+2 🪵 Wood");
        sound("chop");

    }else if(nearest.userData.type==="rock"){

        save.stone+=2;
        nearest.userData.hp--;

        toast("+2 🪨 Stone");
        sound("rock");

    }else if(nearest.userData.type==="bush"){

        save.berry+=2;
        nearest.userData.hp=0;

        toast("+2 🫐 Berry");
        sound("pickup");
    }

    if(nearest.userData.hp<=0){

        nearest.userData.alive=false;

        nearest.visible=false;

        setTimeout(()=>{
            respawnResource(nearest);
        },20000);
    }

    checkQuest();
    saveGame();
}

// ------------------------------------------------------------
// FIND NEAREST
// ------------------------------------------------------------

function findNearest(){

    let best=null;
    let dist=4;

    [...trees,...rocks,...bushes].forEach(o=>{

        if(!o.visible)return;

        const d=player.position.distanceTo(o.position);

        if(d<dist){

            dist=d;
            best=o;
        }
    });

    return best;
}

// ------------------------------------------------------------
// RESPAWN
// ------------------------------------------------------------

function respawnResource(o){

    if(o.userData.type==="tree"||
       o.userData.type==="palm"){

        o.userData.hp=o.userData.type==="palm"?4:3;

    }else if(o.userData.type==="rock"){

        o.userData.hp=3;

    }else{

        o.userData.hp=2;
    }

    o.userData.alive=true;
    o.visible=true;
}

// ------------------------------------------------------------
// FISHING
// ------------------------------------------------------------

let fishingBusy=false;

function fishing(){

    if(fishingBusy)return;

    const d=Math.sqrt(
        player.position.x*player.position.x+
        player.position.z*player.position.z
    );

    if(d<23){

        toast("Pergi lebih dekat ke pantai");
        return;
    }

    fishingBusy=true;

    toast("🎣 Melempar kail...");

    sound("splash");

    setTimeout(()=>{

        if(Math.random()<.78){

            save.fish++;

            toast("🐟 IKAN TERTANGKAP!");

            sound("fish");

            navigator.vibrate?.(35);

        }else{

            toast("Ikan kabur 😭");
        }

        fishingBusy=false;

        saveGame();

    },1800+Math.random()*2500);
}

// ------------------------------------------------------------
// QUEST
// ------------------------------------------------------------

function checkQuest(){

    if(save.quest===0){

        if(
            save.wood>=8 &&
            save.stone>=4 &&
            save.coconut>=3
        ){
            save.quest=1;
            toast("Quest baru: Buat Campfire 🔥");
        }

    }else if(save.quest===1){

        if(save.campfire){

            save.quest=2;
            toast("Quest baru: Bangun Shelter 🏠");
        }

    }else if(save.quest===2){

        if(save.shelter){

            save.quest=3;
            toast("Quest baru: Cari reruntuhan 🗿");
        }

    }else if(save.quest===3){

        const d=player.position.distanceTo(ruins.position);

        if(d<6){

            save.quest=4;
            toast("Reruntuhan ditemukan!");
        }

    }else if(save.quest===4){

        if(
            save.wood>=25 &&
            save.stone>=15 &&
            save.fish>=3 &&
            save.coconut>=5
        ){

            save.quest=5;
            toast("Beacon siap diperbaiki 📡");
        }

    }

    updateQuest();
}

// ------------------------------------------------------------
// QUEST TEXT
// ------------------------------------------------------------

function updateQuest(){

    const q=[
        "Kumpulkan 8 Wood • 4 Stone • 3 Coconut",
        "Buat Campfire 🔥",
        "Bangun Shelter 🏠",
        "Temukan reruntuhan 🗿",
        "Kumpulkan 25 Wood • 15 Stone • 3 Fish • 5 Coconut",
        "Perbaiki Signal Beacon 📡",
        "Aktifkan Beacon",
        "RESCUE INCOMING 🚢"
    ];

    ui.quest.textContent="QUEST: "+q[
        Math.min(save.quest,q.length-1)
    ];
}

// ------------------------------------------------------------
// SURVIVAL
// ------------------------------------------------------------

let survivalTimer=0;

function updateSurvival(dt){

    survivalTimer+=dt;

    if(survivalTimer<3)return;

    survivalTimer=0;

    save.hunger=Math.max(0,save.hunger-.35);
    save.thirst=Math.max(0,save.thirst-.55);

    if(save.hunger<=0 || save.thirst<=0){

        save.health=Math.max(
            0,
            save.health-.8
        );
    }

    if(save.health<=0){

        toast("Kamu kehabisan tenaga!");
        save.health=25;
        save.hunger=40;
        save.thirst=40;
        player.position.set(0,.4,8);
    }

    updateHUD();
}

// ------------------------------------------------------------
// HUD UPDATE
// ------------------------------------------------------------

function updateHUD(){

    if(!ui.status)return;

    document.getElementById("healthBar").style.width=
        save.health+"%";

    document.getElementById("hungerBar").style.width=
        save.hunger+"%";

    document.getElementById("thirstBar").style.width=
        save.thirst+"%";

    document.getElementById("staminaBar").style.width=
        save.stamina+"%";

    ui.inventory.innerHTML=`
        🪵 ${save.wood}
        🪨 ${save.stone}
        🥥 ${save.coconut}
        🐟 ${save.fish}
        🫐 ${save.berry}
        <br>
        DAY ${save.day} • ${String(Math.floor(save.time)).padStart(2,"0")}:00
    `;

    updateQuest();
}

// ------------------------------------------------------------
// PLAYER UPDATE
// ------------------------------------------------------------

function updatePlayer(dt){

    let mx=joyX;
    let my=joyY;

    if(Math.abs(mx)<.05 && Math.abs(my)<.05){

        mx=0;
        my=0;
    }

    const forward=new THREE.Vector3(
        Math.sin(cameraYaw),
        0,
        -Math.cos(cameraYaw)
    );

    const right=new THREE.Vector3(
        Math.cos(cameraYaw),
        0,
        Math.sin(cameraYaw)
    );

    const move=new THREE.Vector3();

    move.addScaledVector(right,mx);
    move.addScaledVector(forward,-my);

    if(move.length()>1)
        move.normalize();

    const speed=
        running && save.stamina>1
        ? 8
        : 4.5;

    if(running && move.length()>0){

        save.stamina=Math.max(
            0,
            save.stamina-dt*10
        );

    }else{

        save.stamina=Math.min(
            100,
            save.stamina+dt*15
        );
    }

    player.position.addScaledVector(
        move,
        speed*dt
    );

    // boundary
    const r=Math.sqrt(
        player.position.x**2+
        player.position.z**2
    );

    if(r>26){

        player.position.x*=26/r;
        player.position.z*=26/r;
    }

    // rotate player
    if(move.length()>.05){

        const target=Math.atan2(
            move.x,
            move.z
        );

        player.rotation.y=target;
    }

    // jump
    velocityY-=18*dt;

    player.position.y+=velocityY*dt;

    if(player.position.y<=.4){

        player.position.y=.4;
        velocityY=0;
        grounded=true;
    }

    // simple walk animation
    const t=performance.now()*.008;

    if(move.length()>.1 && grounded){

        player.position.y=.4+
            Math.abs(Math.sin(t*speed/4))*.07;
    }

    save.pos.x=player.position.x;
    save.pos.z=player.position.z;
}

// ------------------------------------------------------------
// CAMERA
// ------------------------------------------------------------

function updateCamera(dt){

    const distance=7;

    const target=new THREE.Vector3(
        player.position.x,
        player.position.y+1.4,
        player.position.z
    );

    const horizontal=
        Math.cos(cameraPitch)*distance;

    const desired=new THREE.Vector3(
        player.position.x-
            Math.sin(cameraYaw)*horizontal,

        player.position.y+
            3.8+
            Math.sin(cameraPitch)*distance,

        player.position.z+
            Math.cos(cameraYaw)*horizontal
    );

    camera.position.lerp(
        desired,
        1-Math.pow(.001,dt)
    );

    camera.lookAt(target);
}

// ------------------------------------------------------------
// CAMERA TOUCH
// ------------------------------------------------------------

rendererReady();

function rendererReady(){

    document.addEventListener("pointerdown",e=>{

        if(!gameStarted || paused || editUI)return;

        if(e.target!==renderer?.domElement)return;

        if(e.clientX<innerWidth*.42)return;

        cameraTouch={
            x:e.clientX,
            y:e.clientY
        };
    });

    document.addEventListener("pointermove",e=>{

        if(!cameraTouch)return;

        const dx=e.clientX-cameraTouch.x;
        const dy=e.clientY-cameraTouch.y;

        cameraYaw-=dx*settings.sensitivity;

        if(settings.invertY)
            cameraPitch+=dy*.0025;
        else
            cameraPitch-=dy*.0025;

        cameraPitch=THREE.MathUtils.clamp(
            cameraPitch,
            -.15,
            .75
        );

        cameraTouch.x=e.clientX;
        cameraTouch.y=e.clientY;
    });

    document.addEventListener("pointerup",()=>{
        cameraTouch=null;
    });
}

// ------------------------------------------------------------
// WORLD ANIMATION
// ------------------------------------------------------------

function updateWorld(dt){

    save.time+=dt*.08;

    if(save.time>=24){

        save.time-=24;
        save.day++;
    }

    const daylight=
        Math.max(
            0,
            Math.sin(
                (save.time-6)/24*Math.PI*2
            )
        );

    const night=1-daylight;

    scene.background.lerpColors(
        new THREE.Color(0x071923),
        new THREE.Color(0x79cce5),
        daylight
    );

    sun.intensity=.25+daylight*1.4;
    hemi.intensity=.35+daylight*.9;

    stars.visible=daylight<.28;

    // ocean
    if(ocean){

        const arr=ocean.geometry.attributes.position.array;
        const t=performance.now()*.001;

        for(let i=0;i<arr.length;i+=3){

            const x=oceanBase[i];
            const z=oceanBase[i+1];

            arr[i+2]=
                oceanBase[i+2]+
                Math.sin(x*.12+t)*.06+
                Math.cos(z*.1+t*.8)*.05;
        }

        ocean.geometry.attributes.position.needsUpdate=true;
    }

    // palms sway
    trees.forEach(t=>{

        if(!t.visible)return;

        t.rotation.z=
            Math.sin(
                performance.now()*.0008+
                t.userData.sway
            )*.025;
    });

    updateFishButton();

    checkBeacon();
}

// ------------------------------------------------------------
// FISH BUTTON
// ------------------------------------------------------------

function updateFishButton(){

    if(!ui.fish)return;

    const r=Math.sqrt(
        player.position.x**2+
        player.position.z**2
    );

    ui.fish.style.display=
        r>22 ? "block" : "none";
}

// ------------------------------------------------------------
// BEACON
// ------------------------------------------------------------

function checkBeacon(){

    if(save.quest!==5)return;

    const d=player.position.distanceTo(
        ruins.position
    );

    if(d<6){

        if(!save.beacon){

            if(
                save.wood>=25 &&
                save.stone>=15 &&
                save.fish>=3 &&
                save.coconut>=5
            ){

                save.wood-=25;
                save.stone-=15;
                save.fish-=3;
                save.coconut-=5;

                save.beacon=true;
                save.quest=6;

                toast("📡 BEACON DIPERBAIKI!");

                sound("success");
                saveGame();
            }
        }
    }

    if(save.quest===6 && d<6){

        save.quest=7;

        toast("🚨 SINYAL AKTIF! RESCUE INCOMING!");

        setTimeout(showEnding,8000);
    }
}

// ------------------------------------------------------------
// ENDING
// ------------------------------------------------------------

function showEnding(){

    paused=true;

    const overlay=document.createElement("div");

    overlay.className="menu";

    overlay.innerHTML=`
        <h1>RESCUED</h1>
        <p>
            Setelah semua perjuangan,<br>
            sinyalmu akhirnya ditemukan.
        </p>
        <button class="primary" id="freeRoam">
            CONTINUE FREE ROAM
        </button>
    `;

    document.body.appendChild(overlay);

    save.ending=true;
    saveGame();

    document.getElementById("freeRoam").onclick=()=>{
        overlay.remove();
        paused=false;
        toast("🏝️ FREE ROAM AKTIF");
    };
}

// ------------------------------------------------------------
// INVENTORY
// ------------------------------------------------------------

function openInventory(){

    const p=openPanel("INVENTORY");

    p.innerHTML+=`
        <div class="row">🪵 Wood <b>${save.wood}</b></div>
        <div class="row">🪨 Stone <b>${save.stone}</b></div>
        <div class="row">🥥 Coconut <b>${save.coconut}</b></div>
        <div class="row">🐟 Fish <b>${save.fish}</b></div>
        <div class="row">🫐 Berry <b>${save.berry}</b></div>
        <br>
        <button class="panelBtn" id="eatBerry">Eat Berry +12 Hunger</button>
        <button class="panelBtn" id="drinkCoconut">Drink Coconut +20 Thirst</button>
    `;

    p.querySelector("#eatBerry").onclick=()=>{

        if(save.berry>0){

            save.berry--;
            save.hunger=Math.min(
                100,
                save.hunger+12
            );

            toast("🫐 Berry dimakan");
            updateHUD();
            saveGame();
        }
    };

    p.querySelector("#drinkCoconut").onclick=()=>{

        if(save.coconut>0){

            save.coconut--;
            save.thirst=Math.min(
                100,
                save.thirst+20
            );

            toast("🥥 Coconut diminum");
            updateHUD();
            saveGame();
        }
    };
}

// ------------------------------------------------------------
// PANEL
// ------------------------------------------------------------

function openPanel(title){

    closePanel();

    const p=document.createElement("div");

    p.id="panel";

    p.innerHTML=`
        <h2>${title}</h2>
        <button class="panelBtn" id="closePanel">CLOSE</button>
    `;

    document.body.appendChild(p);

    p.style.display="block";

    p.querySelector("#closePanel").onclick=closePanel;

    return p;
}

function closePanel(){

    document.getElementById("panel")?.remove();
}

// ------------------------------------------------------------
// SETTINGS
// ------------------------------------------------------------

function openSettings(fromMenu){

    const p=openPanel("⚙️ SETTINGS");

    p.innerHTML+=`

        <h3>🎮 CONTROLS</h3>

        <div class="row">
            <span>Camera Sensitivity</span>
            <input id="sens" type="range"
                min=".001" max=".01" step=".001"
                value="${settings.sensitivity}">
        </div>

        <div class="row">
            <span>Invert Camera Y</span>
            <input id="invert" type="checkbox"
                ${settings.invertY?"checked":""}>
        </div>

        <div class="row">
            <span>UI Scale</span>
            <input id="uiscale" type="range"
                min=".7" max="1.4" step=".05"
                value="${settings.uiScale}">
        </div>

        <button class="panelBtn" id="editUI">
            EDIT CONTROL LAYOUT
        </button>

        <button class="panelBtn" id="resetUI">
            RESET CONTROL
        </button>

        <h3>🔊 AUDIO</h3>

        <div class="row">
            <span>Master</span>
            <input id="master" type="range"
                min="0" max="1" step=".05"
                value="${settings.master}">
        </div>

        <div class="row">
            <span>Music</span>
            <input id="music" type="range"
                min="0" max="1" step=".05"
                value="${settings.music}">
        </div>

        <div class="row">
            <span>SFX</span>
            <input id="sfx" type="range"
                min="0" max="1" step=".05"
                value="${settings.sfx}">
        </div>

        <h3>🎨 GRAPHICS</h3>

        <div class="row">
            <span>Quality</span>
            <select id="graphics">
                <option value="low">LOW</option>
                <option value="medium">MEDIUM</option>
                <option value="high">HIGH</option>
            </select>
        </div>

        <div class="row">
            <span>FPS</span>
            <select id="fps">
                <option>30</option>
                <option>45</option>
                <option>60</option>
            </select>
        </div>

        <div class="row">
            <span>Shadows</span>
            <input id="shadow" type="checkbox"
                ${settings.shadows?"checked":""}>
        </div>

        <div class="row">
            <span>Battery Saver</span>
            <input id="battery" type="checkbox"
                ${settings.batterySaver?"checked":""}>
        </div>

        <h3>📱 GAME</h3>

        <div class="row">
            <span>HUD</span>
            <input id="hud" type="checkbox"
                ${settings.hud?"checked":""}>
        </div>

        <div class="row">
            <span>Vibration</span>
            <input id="vibration" type="checkbox"
                ${settings.vibration?"checked":""}>
        </div>

        <br>

        <button class="panelBtn primary" id="saveSettings">
            SAVE SETTINGS
        </button>

        <button class="panelBtn" id="saveGame">
            SAVE GAME
        </button>

        <button class="panelBtn" id="exitMenu">
            SAVE & EXIT TO MAIN MENU
        </button>

        <button class="panelBtn" id="resetSave">
            RESET SAVE
        </button>
    `;

    p.querySelector("#graphics").value=settings.graphics;
    p.querySelector("#fps").value=settings.fps;

    p.querySelector("#sens").oninput=e=>{
        settings.sensitivity=Number(e.target.value);
    };

    p.querySelector("#invert").onchange=e=>{
        settings.invertY=e.target.checked;
    };

    p.querySelector("#uiscale").oninput=e=>{
        settings.uiScale=Number(e.target.value);
        applyUI();
    };

    p.querySelector("#master").oninput=e=>{
        settings.master=Number(e.target.value);
        if(masterGain)
            masterGain.gain.value=settings.master;
    };

    p.querySelector("#music").oninput=e=>{
        settings.music=Number(e.target.value);
    };

    p.querySelector("#sfx").oninput=e=>{
        settings.sfx=Number(e.target.value);
    };

    p.querySelector("#graphics").onchange=e=>{
        settings.graphics=e.target.value;
    };

    p.querySelector("#fps").onchange=e=>{
        settings.fps=Number(e.target.value);
    };

    p.querySelector("#shadow").onchange=e=>{
        settings.shadows=e.target.checked;

        if(renderer)
            renderer.shadowMap.enabled=settings.shadows;
    };

    p.querySelector("#battery").onchange=e=>{
        settings.batterySaver=e.target.checked;

        if(renderer)
            renderer.setPixelRatio(
                settings.batterySaver
                ?1
                :Math.min(devicePixelRatio,1.25)
            );
    };

    p.querySelector("#hud").onchange=e=>{
        settings.hud=e.target.checked;
        updateHUDVisibility();
    };

    p.querySelector("#vibration").onchange=e=>{
        settings.vibration=e.target.checked;
    };

    p.querySelector("#saveSettings").onclick=()=>{
        localStorage.setItem(
            SETTINGS_KEY,
            JSON.stringify(settings)
        );

        toast("Settings tersimpan ✓");
    };

    p.querySelector("#saveGame").onclick=()=>{
        saveGame();
        toast("Game tersimpan ✓");
    };

    p.querySelector("#editUI").onclick=()=>{
        closePanel();
        editUI=true;
        document.querySelectorAll(".uiBtn,#joystick")
            .forEach(e=>e.classList.add("editing"));

        toast("Drag tombol untuk memindahkan • tekan ⚙️ lagi jika selesai");
    };

    p.querySelector("#resetUI").onclick=()=>{
        localStorage.removeItem("VALEN_UI");
        applyUI();
        toast("Control direset");
    };

    p.querySelector("#exitMenu").onclick=()=>{
        saveGame();
        closePanel();
        returnToMenu();
    };

    p.querySelector("#resetSave").onclick=()=>{
        localStorage.removeItem(GAME_KEY);
        toast("Save dihapus. Restart game untuk mulai baru.");
    };

    if(fromMenu){
        p.querySelector("#exitMenu").remove();
        p.querySelector("#saveGame").remove();
    }
}

// ------------------------------------------------------------
// UI POSITION
// ------------------------------------------------------------

function applyUI(){

    const stored=JSON.parse(
        localStorage.getItem("VALEN_UI")||"null"
    );

    const positions=stored||{
        joystick:[4,70],
        run:[76,78],
        jump:[88,78],
        action:[84,52],
        fish:[68,52]
    };

    function place(el,pos){

        if(!el)return;

        el.style.left=pos[0]+"vw";
        el.style.top=pos[1]+"vh";
        el.style.right="auto";
        el.style.bottom="auto";
        el.style.transform=`scale(${settings.uiScale})`;
    }

    place(ui.joystick,positions.joystick);
    place(ui.run,positions.run);
    place(ui.jump,positions.jump);
    place(ui.action,positions.action);
    place(ui.fish,positions.fish);

    makeMovable(ui.joystick,"joystick");
    makeMovable(ui.run,"run");
    makeMovable(ui.jump,"jump");
    makeMovable(ui.action,"action");
    makeMovable(ui.fish,"fish");
}

// ------------------------------------------------------------
// MOVE UI
// ------------------------------------------------------------

function makeMovable(el,key){

    if(!el || el.dataset.movable)return;

    el.dataset.movable="1";

    let dragging=false;

    el.addEventListener("pointerdown",e=>{

        if(!editUI)return;

        dragging=true;
        el.setPointerCapture(e.pointerId);
        e.stopPropagation();
    });

    el.addEventListener("pointermove",e=>{

        if(!editUI || !dragging)return;

        el.style.left=
            (e.clientX/innerWidth*100)+"vw";

        el.style.top=
            (e.clientY/innerHeight*100)+"vh";
    });

    el.addEventListener("pointerup",()=>{

        if(!editUI)return;

        dragging=false;

        const data=JSON.parse(
            localStorage.getItem("VALEN_UI")||"{}"
        );

        data[key]=[
            parseFloat(el.style.left),
            parseFloat(el.style.top)
        ];

        localStorage.setItem(
            "VALEN_UI",
            JSON.stringify(data)
        );
    });
}

// ------------------------------------------------------------
// UI VISIBILITY
// ------------------------------------------------------------

function updateHUDVisibility(){

    const display=settings.hud?"":"none";

    ui.status.style.display=display;
    ui.inventory.style.display=display;
    ui.quest.style.display=display;
}

// ------------------------------------------------------------
// EXIT MENU
// ------------------------------------------------------------

function returnToMenu(){

    paused=true;
    gameStarted=false;

    renderer?.domElement.remove();

    ui.status?.remove();
    ui.inventory?.remove();
    ui.quest?.remove();
    ui.settings?.remove();
    ui.bag?.remove();
    ui.joystick?.remove();
    ui.stick?.remove();
    ui.run?.remove();
    ui.jump?.remove();
    ui.action?.remove();
    ui.fish?.remove();

    scene=null;
    player=null;

    showMenu();
}

// ------------------------------------------------------------
// SAVE
// ------------------------------------------------------------

function saveGame(){

    if(!player)return;

    save.pos.x=player.position.x;
    save.pos.z=player.position.z;

    localStorage.setItem(
        GAME_KEY,
        JSON.stringify(save)
    );

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}

// ------------------------------------------------------------
// AUDIO
// ------------------------------------------------------------

function initAudio(){

    if(audioCtx)return;

    const AC=
        window.AudioContext||
        window.webkitAudioContext;

    if(!AC)return;

    audioCtx=new AC();

    masterGain=audioCtx.createGain();

    masterGain.gain.value=settings.master;

    masterGain.connect(
        audioCtx.destination
    );
}

function sound(type){

    if(!audioCtx || settings.master<=0)return;

    const osc=audioCtx.createOscillator();
    const gain=audioCtx.createGain();

    const now=audioCtx.currentTime;

    const frequencies={
        jump:420,
        pickup:700,
        chop:180,
        rock:120,
        splash:240,
        fish:850,
        success:1000
    };

    osc.frequency.value=
        frequencies[type]||300;

    osc.type=
        type==="rock"
        ?"square"
        :"sine";

    gain.gain.setValueAtTime(
        .0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        .08*settings.sfx,
        now+.015
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        now+.18
    );

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now+.2);
}

// ------------------------------------------------------------
// TOAST
// ------------------------------------------------------------

function toast(text){

    let t=document.getElementById("toast");

    if(!t){

        t=document.createElement("div");
        t.id="toast";

        document.body.appendChild(t);
    }

    t.textContent=text;
    t.style.opacity="1";

    clearTimeout(t._timer);

    t._timer=setTimeout(()=>{
        t.style.opacity="0";
    },1800);
}

// ------------------------------------------------------------
// RESIZE
// ------------------------------------------------------------

function resize(){

    if(!camera||!renderer)return;

    camera.aspect=
        innerWidth/innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );

    applyUI();
}

// ------------------------------------------------------------
// EDIT MODE EXIT
// ------------------------------------------------------------

document.addEventListener("click",e=>{

    if(
        editUI &&
        !e.target.closest(".uiBtn") &&
        !e.target.closest("#joystick") &&
        !e.target.closest("#settingsBtn")
    ){

        editUI=false;

        document.querySelectorAll(
            ".uiBtn,#joystick"
        ).forEach(e=>
            e.classList.remove("editing")
        );

        toast("Control tersimpan ✓");
    }
});

// ------------------------------------------------------------
// MAIN LOOP
// ------------------------------------------------------------

let lastSave=0;

function animate(){

    requestAnimationFrame(animate);

    if(!gameStarted)return;

    const dt=Math.min(
        clock.getDelta(),
        .05
    );

    if(!paused){

        updatePlayer(dt);
        updateCamera(dt);
        updateWorld(dt);
        updateSurvival(dt);

        lastSave+=dt;

        if(lastSave>15){

            saveGame();
            lastSave=0;
        }
    }

    renderer.render(
        scene,
        camera
    );
}

// ------------------------------------------------------------
// INITIAL
// ------------------------------------------------------------
// ============================================================
// BLOCK 2
// WORLD SYSTEM + BUILDING + COOKING + ANIMALS + WEATHER
// MINIMAP + ACHIEVEMENTS + STORY + RARE RESOURCES
// ============================================================

(function(){

    // --------------------------------------------------------
    // BLOCK 2 SAVE DATA
    // --------------------------------------------------------

    save.buildings = save.buildings || [];
    save.cookedFish = save.cookedFish || 0;
    save.cookedBerry = save.cookedBerry || 0;
    save.rareCrystal = save.rareCrystal || 0;
    save.achievements = save.achievements || [];
    save.chapter = save.chapter || 1;
    save.weather = save.weather || "clear";

    // --------------------------------------------------------
    // EXTRA STYLE
    // --------------------------------------------------------

    const b2style=document.createElement("style");

    b2style.textContent=`

    #b2mini{
        position:fixed;
        z-index:25;
        right:18px;
        top:92px;
        width:145px;
        height:145px;
        border-radius:16px;
        background:rgba(3,15,20,.78);
        border:2px solid rgba(255,255,255,.18);
        box-shadow:0 8px 25px rgba(0,0,0,.3);
        pointer-events:none;
    }

    #b2mini canvas{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        border-radius:14px;
    }

    #b2weather{
        position:fixed;
        z-index:24;
        left:50%;
        top:68px;
        transform:translateX(-50%);
        color:white;
        padding:7px 14px;
        border-radius:18px;
        background:rgba(0,0,0,.38);
        font-size:13px;
        pointer-events:none;
    }

    #b2build{
        right:28vw;
        bottom:7vh;
        display:none;
    }

    #b2cook{
        right:39vw;
        bottom:7vh;
        display:none;
    }

    #b2story{
        position:fixed;
        inset:0;
        z-index:600;
        display:none;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.72);
        color:white;
        padding:30px;
    }

    #b2storyBox{
        width:min(620px,90vw);
        background:rgba(5,22,29,.97);
        border:1px solid rgba(255,255,255,.15);
        border-radius:22px;
        padding:28px;
        text-align:center;
        box-shadow:0 15px 50px rgba(0,0,0,.5);
    }

    #b2storyBox h2{
        margin-top:0;
        color:#55d6a6;
    }

    #b2ach{
        position:fixed;
        z-index:550;
        left:50%;
        top:12%;
        transform:translateX(-50%) translateY(-20px);
        opacity:0;
        background:rgba(8,27,34,.95);
        border:1px solid rgba(85,214,166,.5);
        color:white;
        padding:14px 22px;
        border-radius:18px;
        transition:.35s;
        pointer-events:none;
        text-align:center;
    }

    #b2rain{
        position:fixed;
        inset:0;
        z-index:15;
        pointer-events:none;
        display:none;
        background:
          repeating-linear-gradient(
            105deg,
            transparent 0px,
            transparent 12px,
            rgba(150,210,255,.22) 13px,
            transparent 15px
          );
        animation:b2rainmove .35s linear infinite;
    }

    @keyframes b2rainmove{
        from{transform:translateY(-30px)}
        to{transform:translateY(30px)}
    }

    .b2Animal{
        filter:drop-shadow(0 4px 4px rgba(0,0,0,.3));
    }

    `;

    document.head.appendChild(b2style);

    // --------------------------------------------------------
    // EXTRA UI
    // --------------------------------------------------------

    let b2buildBtn;
    let b2cookBtn;
    let b2mini;
    let b2miniCanvas;
    let b2weather;
    let b2rain;
    let b2ach;

    function b2CreateUI(){

        if(document.getElementById("b2build"))
            return;

        b2buildBtn=makeButton("b2build","🏕️ BUILD");
        b2cookBtn=makeButton("b2cook","🍳 COOK");

        b2buildBtn.style.display="block";
        b2cookBtn.style.display="block";

        b2buildBtn.onclick=()=>{
            if(editUI)return;
            openBuildMenu();
        };

        b2cookBtn.onclick=()=>{
            if(editUI)return;
            openCookMenu();
        };

        b2weather=document.createElement("div");
        b2weather.id="b2weather";
        b2weather.textContent="☀️ CERAH";
        document.body.appendChild(b2weather);

        b2rain=document.createElement("div");
        b2rain.id="b2rain";
        document.body.appendChild(b2rain);

        b2ach=document.createElement("div");
        b2ach.id="b2ach";
        document.body.appendChild(b2ach);

        createMiniMap();

        applyUI();
    }

    // --------------------------------------------------------
    // MINIMAP
    // --------------------------------------------------------

    function createMiniMap(){

        b2mini=document.createElement("div");
        b2mini.id="b2mini";

        b2miniCanvas=document.createElement("canvas");
        b2miniCanvas.width=145;
        b2miniCanvas.height=145;

        b2mini.appendChild(b2miniCanvas);
        document.body.appendChild(b2mini);
    }

    function updateMiniMap(){

        if(!b2miniCanvas || !player)
            return;

        const c=b2miniCanvas;
        const ctx=c.getContext("2d");

        ctx.clearRect(0,0,145,145);

        ctx.fillStyle="rgba(20,120,155,.65)";
        ctx.fillRect(0,0,145,145);

        // island
        ctx.beginPath();
        ctx.arc(72,72,48,0,Math.PI*2);
        ctx.fillStyle="#4f9957";
        ctx.fill();

        // beach
        ctx.beginPath();
        ctx.arc(72,72,53,0,Math.PI*2);
        ctx.strokeStyle="#e6d198";
        ctx.lineWidth=5;
        ctx.stroke();

        // ruins
        if(ruins){

            const rx=72+(ruins.position.x/30)*53;
            const rz=72+(ruins.position.z/30)*53;

            ctx.fillStyle="#b7b7b7";
            ctx.fillRect(rx-3,rz-3,6,6);
        }

        // resources
        trees.forEach(t=>{

            if(!t.visible)return;

            const x=72+(t.position.x/30)*53;
            const z=72+(t.position.z/30)*53;

            ctx.fillStyle="#226d39";
            ctx.fillRect(x-1,z-1,3,3);
        });

        rocks.forEach(r=>{

            if(!r.visible)return;

            const x=72+(r.position.x/30)*53;
            const z=72+(r.position.z/30)*53;

            ctx.fillStyle="#777";
            ctx.fillRect(x-1,z-1,3,3);
        });

        // player
        const px=72+(player.position.x/30)*53;
        const pz=72+(player.position.z/30)*53;

        ctx.beginPath();
        ctx.arc(px,pz,5,0,Math.PI*2);
        ctx.fillStyle="#ffffff";
        ctx.fill();

        ctx.strokeStyle="rgba(0,0,0,.6)";
        ctx.stroke();
    }

    // --------------------------------------------------------
    // BUILDING
    // --------------------------------------------------------

    function openBuildMenu(){

        const p=openPanel("🏕️ BUILDING");

        p.innerHTML+=`

            <p>Bangun tempat bertahan hidup.</p>

            <div class="row">
                <span>🔥 Campfire</span>
                <span>8 Wood • 4 Stone</span>
            </div>

            <button class="panelBtn primary" id="buildFire">
                BUILD CAMPFIRE
            </button>

            <div class="row">
                <span>🏠 Shelter</span>
                <span>15 Wood • 8 Stone</span>
            </div>

            <button class="panelBtn primary" id="buildShelter">
                BUILD SHELTER
            </button>

            <div class="row">
                <span>📦 Storage</span>
                <span>10 Wood • 5 Stone</span>
            </div>

            <button class="panelBtn primary" id="buildStorage">
                BUILD STORAGE
            </button>
        `;

        p.querySelector("#buildFire").onclick=()=>{
            buildCampfire();
            closePanel();
        };

        p.querySelector("#buildShelter").onclick=()=>{
            buildShelter();
            closePanel();
        };

        p.querySelector("#buildStorage").onclick=()=>{
            buildStorage();
            closePanel();
        };
    }

    function buildCampfire(){

        if(save.campfire){

            toast("Campfire sudah dibangun 🔥");
            return;
        }

        if(save.wood<8 || save.stone<4){

            toast("Butuh 8 Wood + 4 Stone");
            return;
        }

        save.wood-=8;
        save.stone-=4;
        save.campfire=true;

        const g=new THREE.Group();

        g.position.copy(player.position);
        g.position.y=.1;

        for(let i=0;i<6;i++){

            const log=new THREE.Mesh(
                new THREE.CylinderGeometry(.12,.12,1.2,7),
                mat(0x704528)
            );

            log.rotation.z=Math.PI/2;
            log.rotation.y=i*.5;

            g.add(log);
        }

        const fire=new THREE.Mesh(
            new THREE.ConeGeometry(.45,1.2,8),
            mat(0xff7b21)
        );

        fire.position.y=.75;
        g.add(fire);

        g.userData.type="campfire";

        scene.add(g);
        save.buildings.push({
            type:"campfire",
            x:g.position.x,
            z:g.position.z
        });

        toast("🔥 CAMPFIRE DIBANGUN!");

        sound("success");
        checkQuest();
        saveGame();
    }

    function buildShelter(){

        if(save.shelter){

            toast("Shelter sudah dibangun 🏠");
            return;
        }

        if(save.wood<15 || save.stone<8){

            toast("Butuh 15 Wood + 8 Stone");
            return;
        }

        save.wood-=15;
        save.stone-=8;
        save.shelter=true;

        const g=new THREE.Group();

        g.position.copy(player.position);
        g.position.y=0;

        // floor
        const floor=new THREE.Mesh(
            new THREE.BoxGeometry(4,.25,4),
            mat(0x76502e)
        );

        floor.position.y=.15;
        g.add(floor);

        // roof
        const roof=new THREE.Mesh(
            new THREE.ConeGeometry(
                3,
                2.4,
                4
            ),
            mat(0x8d5b31)
        );

        roof.rotation.y=Math.PI/4;
        roof.position.y=2.7;
        g.add(roof);

        // posts
        for(let x of [-1.7,1.7]){

            for(let z of [-1.7,1.7]){

                const post=new THREE.Mesh(
                    new THREE.CylinderGeometry(.14,.18,2.5,6),
                    mat(0x694526)
                );

                post.position.set(x,1.25,z);
                g.add(post);
            }
        }

        scene.add(g);

        save.buildings.push({
            type:"shelter",
            x:g.position.x,
            z:g.position.z
        });

        toast("🏠 SHELTER DIBANGUN!");

        sound("success");
        checkQuest();
        saveGame();
    }

    function buildStorage(){

        if(save.wood<10 || save.stone<5){

            toast("Butuh 10 Wood + 5 Stone");
            return;
        }

        save.wood-=10;
        save.stone-=5;

        const box=new THREE.Mesh(
            new THREE.BoxGeometry(1.6,1,1.2),
            mat(0x694526)
        );

        box.position.copy(player.position);
        box.position.y=.65;

        scene.add(box);

        save.buildings.push({
            type:"storage",
            x:box.position.x,
            z:box.position.z
        });

        toast("📦 STORAGE DIBANGUN!");

        sound("success");
        saveGame();
    }

    // --------------------------------------------------------
    // COOKING
    // --------------------------------------------------------

    function openCookMenu(){

        const p=openPanel("🍳 COOKING");

        p.innerHTML+=`

            <p>Masak makanan untuk memulihkan hunger.</p>

            <button class="panelBtn primary" id="cookFish">
                🐟 Cook Fish
            </button>

            <button class="panelBtn primary" id="cookBerry">
                🫐 Cook Berry
            </button>

            <div class="row">
                <span>Cooked Fish</span>
                <b>${save.cookedFish}</b>
            </div>

            <div class="row">
                <span>Cooked Berry</span>
                <b>${save.cookedBerry}</b>
            </div>
        `;

        p.querySelector("#cookFish").onclick=()=>{

            if(!save.campfire){

                toast("Buat Campfire dulu 🔥");
                return;
            }

            if(save.fish<=0){

                toast("Tidak punya ikan");
                return;
            }

            save.fish--;
            save.cookedFish++;

            save.hunger=Math.min(
                100,
                save.hunger+30
            );

            toast("🐟 Ikan matang! +30 Hunger");
            sound("success");

            updateHUD();
            saveGame();

            closePanel();
        };

        p.querySelector("#cookBerry").onclick=()=>{

            if(!save.campfire){

                toast("Buat Campfire dulu 🔥");
                return;
            }

            if(save.berry<=0){

                toast("Tidak punya berry");
                return;
            }

            save.berry--;
            save.cookedBerry++;

            save.hunger=Math.min(
                100,
                save.hunger+18
            );

            toast("🫐 Berry matang! +18 Hunger");

            updateHUD();
            saveGame();

            closePanel();
        };
    }

    // --------------------------------------------------------
    // ANIMALS
    // --------------------------------------------------------

    let animals=[];

    function createAnimal(type){

        const p=randomIslandPoint(7,23);

        const g=new THREE.Group();

        g.position.set(p.x,0,p.z);

        const body=new THREE.Mesh(
            new THREE.BoxGeometry(
                type==="boar"?1.3:1.0,
                .65,
                .7
            ),
            mat(
                type==="boar"
                ?0x5b3b27
                :0xd2b28b
            )
        );

        body.position.y=.65;
        g.add(body);

        const head=new THREE.Mesh(
            new THREE.BoxGeometry(.55,.5,.55),
            mat(
                type==="boar"
                ?0x493021
                :0xb89470
            )
        );

        head.position.set(
            0,
            .75,
            -.62
        );

        g.add(head);

        // legs
        for(let x of [-.38,.38]){

            for(let z of [-.25,.25]){

                const leg=new THREE.Mesh(
                    new THREE.BoxGeometry(.16,.5,.16),
                    mat(0x4b3828)
                );

                leg.position.set(x,.25,z);
                g.add(leg);
            }
        }

        g.userData={
            type:"animal",
            animalType:type,
            hp:type==="boar"?30:12,
            dir:Math.random()*Math.PI*2,
            timer:Math.random()*3
        };

        scene.add(g);
        animals.push(g);
    }

    function createAnimals(){

        if(animals.length>0)return;

        for(let i=0;i<4;i++)
            createAnimal("deer");

        for(let i=0;i<2;i++)
            createAnimal("boar");
    }

    function updateAnimals(dt){

        animals.forEach(a=>{

            if(!a.visible)return;

            a.userData.timer-=dt;

            if(a.userData.timer<=0){

                a.userData.timer=
                    1.5+Math.random()*4;

                a.userData.dir+=
                    (Math.random()-.5)*1.5;
            }

            const speed=
                a.userData.animalType==="boar"
                ?1.4
                :.9;

            a.position.x+=
                Math.sin(a.userData.dir)*speed*dt;

            a.position.z+=
                Math.cos(a.userData.dir)*speed*dt;

            const r=Math.sqrt(
                a.position.x**2+
                a.position.z**2
            );

            if(r>24){

                a.userData.dir+=Math.PI;
            }

            a.rotation.y=a.userData.dir;

            // tiny walking animation
            a.position.y=
                Math.abs(
                    Math.sin(
                        performance.now()*.008+
                        a.position.x
                    )
                )*.025;
        });
    }

    // --------------------------------------------------------
    // WEATHER
    // --------------------------------------------------------

    let weatherTimer=0;

    function updateWeather(dt){

        weatherTimer-=dt;

        if(weatherTimer<=0){

            weatherTimer=
                45+Math.random()*60;

            const roll=Math.random();

            if(roll<.58)
                setWeather("clear");
            else if(roll<.82)
                setWeather("cloudy");
            else
                setWeather("rain");
        }

        if(b2weather){

            const names={
                clear:"☀️ CERAH",
                cloudy:"☁️ MENDUNG",
                rain:"🌧️ HUJAN"
            };

            b2weather.textContent=
                names[save.weather]||"☀️ CERAH";
        }
    }

    function setWeather(type){

        save.weather=type;

        if(b2rain){

            b2rain.style.display=
                type==="rain"?"block":"none";
        }

        if(type==="rain"){

            hemi.intensity=Math.max(
                .25,
                hemi.intensity*.75
            );

            toast("🌧️ Hujan turun...");
        }

        saveGame();
    }

    // --------------------------------------------------------
    // RARE RESOURCE
    // --------------------------------------------------------

    let rareCrystalMesh=null;

    function createRareResource(){

        if(rareCrystalMesh)return;

        rareCrystalMesh=new THREE.Mesh(
            new THREE.OctahedronGeometry(.55,0),
            mat(0x8c7cff)
        );

        rareCrystalMesh.position.set(
            -14,
            .7,
            -13
        );

        scene.add(rareCrystalMesh);
    }

    function collectRareResource(){

        if(!rareCrystalMesh)return;

        const d=player.position.distanceTo(
            rareCrystalMesh.position
        );

        if(d<2.5){

            rareCrystalMesh.visible=false;

            save.rareCrystal++;

            toast("💎 RARE CRYSTAL +1");

            unlockAchievement(
                "CRYSTAL HUNTER",
                "Menemukan resource langka"
            );

            saveGame();
        }
    }

    // --------------------------------------------------------
    // ACHIEVEMENTS
    // --------------------------------------------------------

    function unlockAchievement(name,description){

        if(save.achievements.includes(name))
            return;

        save.achievements.push(name);

        if(b2ach){

            b2ach.innerHTML=
                `🏆 <b>${name}</b><br>${description}`;

            b2ach.style.opacity="1";
            b2ach.style.transform=
                "translateX(-50%) translateY(0)";

            setTimeout(()=>{

                b2ach.style.opacity="0";
                b2ach.style.transform=
                    "translateX(-50%) translateY(-20px)";

            },3000);
        }

        sound("success");
        saveGame();
    }

    function checkAchievements(){

        if(save.wood>=10)
            unlockAchievement(
                "WOODCUTTER",
                "Kumpulkan 10 Wood"
            );

        if(save.stone>=10)
            unlockAchievement(
                "STONE MASTER",
                "Kumpulkan 10 Stone"
            );

        if(save.coconut>=10)
            unlockAchievement(
                "COCONUT LOVER",
                "Kumpulkan 10 Coconut"
            );

        if(save.fish>=5)
            unlockAchievement(
                "FISHERMAN",
                "Tangkap 5 ikan"
            );

        if(save.campfire)
            unlockAchievement(
                "FIRST FIRE",
                "Buat campfire pertama"
            );

        if(save.shelter)
            unlockAchievement(
                "SURVIVOR",
                "Bangun shelter"
            );

        if(save.rareCrystal>0)
            unlockAchievement(
                "EXPLORER",
                "Temukan crystal langka"
            );
    }

    // --------------------------------------------------------
    // STORY CHAPTERS
    // --------------------------------------------------------

    let lastChapter=save.chapter;

    function updateStory(){

        if(save.quest>=1 && save.chapter<2)
            setChapter(2);

        if(save.quest>=3 && save.chapter<3)
            setChapter(3);

        if(save.quest>=4 && save.chapter<4)
            setChapter(4);

        if(save.quest>=6 && save.chapter<5)
            setChapter(5);
    }

    function setChapter(chapter){

        if(chapter<=save.chapter)
            return;

        save.chapter=chapter;

        const data={
            2:[
                "CHAPTER 2",
                "Api pertama",
                "Pulau ini mungkin tidak kosong."
            ],
            3:[
                "CHAPTER 3",
                "Jejak masa lalu",
                "Reruntuhan menyimpan sesuatu."
            ],
            4:[
                "CHAPTER 4",
                "Sinyal terakhir",
                "Kumpulkan material untuk memperbaiki beacon."
            ],
            5:[
                "CHAPTER 5",
                "PULANG",
                "Signal beacon akhirnya aktif."
            ]
        };

        const d=data[chapter];

        if(!d)return;

        showStory(d[0],d[1],d[2]);

        saveGame();
    }

    function showStory(title,subtitle,text){

        let box=document.getElementById("b2story");

        if(!box){

            box=document.createElement("div");
            box.id="b2story";

            box.innerHTML=`
                <div id="b2storyBox">
                    <h2 id="b2stTitle"></h2>
                    <h3 id="b2stSub"></h3>
                    <p id="b2stText"></p>
                    <button class="panelBtn primary" id="b2stClose">
                        CONTINUE
                    </button>
                </div>
            `;

            document.body.appendChild(box);

            box.querySelector("#b2stClose").onclick=()=>{
                box.style.display="none";
                paused=false;
            };
        }

        box.querySelector("#b2stTitle").textContent=title;
        box.querySelector("#b2stSub").textContent=subtitle;
        box.querySelector("#b2stText").textContent=text;

        box.style.display="flex";

        paused=true;
    }

    // --------------------------------------------------------
    // NIGHT BONUS
    // --------------------------------------------------------

    function updateNight(){

        if(!player)return;

        const d=Math.sqrt(
            player.position.x**2+
            player.position.z**2
        );

        // shelter gives safety bonus
        if(save.shelter && d<5){

            save.stamina=Math.min(
                100,
                save.stamina+.02
            );
        }
    }

    // --------------------------------------------------------
    // PATCH ORIGINAL SURVIVAL
    // --------------------------------------------------------

    const originalGather=gather;

    window.valenOriginalGather=originalGather;

    // extra interaction:
    // first gathers normal resources,
    // then checks rare crystal.
    function b2Interaction(){

        collectRareResource();

        checkAchievements();
        updateStory();
    }

    // --------------------------------------------------------
    // EXTRA GAME LOOP
    // --------------------------------------------------------

    setInterval(()=>{

        if(!gameStarted || !scene || !player)
            return;

        if(paused)
            return;

        b2Interaction();

        updateMiniMap();
        updateAnimals(.25);
        updateWeather(.25);
        updateNight();

    },250);

    // --------------------------------------------------------
    // CREATE EXTRA WORLD AFTER GAME START
    // --------------------------------------------------------

    let b2WorldReady=false;

    setInterval(()=>{

        if(!gameStarted || !scene || !player)
            return;

        if(b2WorldReady)
            return;

        b2WorldReady=true;

        b2CreateUI();
        createAnimals();
        createRareResource();

        toast("🏝️ Pulau siap dijelajahi!");

    },500);

    // --------------------------------------------------------
    // BUILDING RESPAWN FROM SAVE
    // --------------------------------------------------------

    function restoreBuildings(){

        if(!scene || !save.buildings)
            return;

        save.buildings.forEach(b=>{

            if(!b || b._restored)
                return;

            b._restored=true;

            if(b.type==="campfire"){

                const g=new THREE.Group();

                g.position.set(b.x,0.1,b.z);

                for(let i=0;i<6;i++){

                    const log=new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            .12,.12,1.2,7
                        ),
                        mat(0x704528)
                    );

                    log.rotation.z=Math.PI/2;
                    log.rotation.y=i*.5;

                    g.add(log);
                }

                const fire=new THREE.Mesh(
                    new THREE.ConeGeometry(
                        .45,1.2,8
                    ),
                    mat(0xff7b21)
                );

                fire.position.y=.75;

                g.add(fire);

                scene.add(g);
            }

            if(b.type==="shelter"){

                const g=new THREE.Group();

                g.position.set(b.x,0,b.z);

                const floor=new THREE.Mesh(
                    new THREE.BoxGeometry(4,.25,4),
                    mat(0x76502e)
                );

                floor.position.y=.15;
                g.add(floor);

                const roof=new THREE.Mesh(
                    new THREE.ConeGeometry(3,2.4,4),
                    mat(0x8d5b31)
                );

                roof.rotation.y=Math.PI/4;
                roof.position.y=2.7;
                g.add(roof);

                for(let x of [-1.7,1.7]){

                    for(let z of [-1.7,1.7]){

                        const post=new THREE.Mesh(
                            new THREE.CylinderGeometry(
                                .14,.18,2.5,6
                            ),
                            mat(0x694526)
                        );

                        post.position.set(x,1.25,z);
                        g.add(post);
                    }
                }

                scene.add(g);
            }

            if(b.type==="storage"){

                const box=new THREE.Mesh(
                    new THREE.BoxGeometry(1.6,1,1.2),
                    mat(0x694526)
                );

                box.position.set(b.x,.65,b.z);

                scene.add(box);
            }
        });
    }

    setInterval(()=>{

        if(gameStarted && scene)
            restoreBuildings();

    },1000);

    // --------------------------------------------------------
    // EXTRA GATHER PATCH
    // --------------------------------------------------------

    setInterval(()=>{

        if(!gameStarted || paused || !player)
            return;

        // automatic achievement check
        checkAchievements();

        // rare crystal proximity
        collectRareResource();

    },3000);

    // --------------------------------------------------------
    // BETTER RESOURCE FEEDBACK
    // --------------------------------------------------------

    setInterval(()=>{

        if(!gameStarted || paused || !player)
            return;

        const nearest=findNearest();

        if(nearest){

            const type=nearest.userData.type;

            if(type==="tree")
                ui.action.textContent="🪓 WOOD";

            else if(type==="rock")
                ui.action.textContent="⛏️ STONE";

            else if(type==="palm")
                ui.action.textContent="🥥 COCONUT";

            else if(type==="bush")
                ui.action.textContent="🫐 BERRY";

        }else{

            ui.action.textContent="🪓";
        }

    },250);

    // --------------------------------------------------------
    // AUTO SAVE
    // --------------------------------------------------------

    setInterval(()=>{

        if(gameStarted && player)
            saveGame();

    },10000);

    // --------------------------------------------------------
    // PATCH GAME START
    // --------------------------------------------------------

    const oldStartGame=startGame;

    window.valenStartGameOriginal=oldStartGame;

})();
/* =========================================================
   VALEN ISLAND SURVIVAL — BLOCK 3
   FINAL POLISH / VISUAL / PERFORMANCE / EFFECTS
   ========================================================= */

(function(){

if(window.__VALEN_BLOCK3__) return;
window.__VALEN_BLOCK3__ = true;

window.VIS3 = window.VIS3 || {};
var V3 = window.VIS3;

/* =========================
   DEFAULT SETTINGS
========================= */

if(typeof settings === "object"){
    settings.fps = settings.fps || 60;
    settings.effects = settings.effects !== false;
    settings.shadow = settings.shadow !== false;
    settings.cameraShake = settings.cameraShake !== false;
    settings.autoPickup = !!settings.autoPickup;
    settings.damageNumbers = settings.damageNumbers !== false;
    settings.viewDistance = settings.viewDistance || 100;
}

/* =========================
   COLORS / ATMOSPHERE
========================= */

V3.skyDay = new THREE.Color(0x72c8ee);
V3.skySunset = new THREE.Color(0xf28b62);
V3.skyNight = new THREE.Color(0x06111e);

V3.tmpColor = new THREE.Color();
V3.time = 0;
V3.shake = 0;
V3.shakePower = 0;
V3.flash = 0;

/* =========================
   TOAST SYSTEM
========================= */

V3.toast = function(text, duration){

    duration = duration || 2200;

    var old = document.getElementById("valen-v3-toast");

    if(old) old.remove();

    var el = document.createElement("div");

    el.id = "valen-v3-toast";

    el.textContent = text;

    el.style.cssText = `
        position:fixed;
        left:50%;
        bottom:12%;
        transform:translateX(-50%);
        z-index:10000;
        padding:12px 20px;
        border-radius:14px;
        background:rgba(5,15,25,.88);
        border:1px solid rgba(255,255,255,.18);
        color:white;
        font-weight:bold;
        font-size:15px;
        box-shadow:0 8px 30px rgba(0,0,0,.45);
        pointer-events:none;
        opacity:0;
        transition:.25s;
        text-align:center;
        max-width:80%;
    `;

    document.body.appendChild(el);

    requestAnimationFrame(function(){
        el.style.opacity="1";
    });

    setTimeout(function(){
        el.style.opacity="0";

        setTimeout(function(){
            el.remove();
        },300);

    },duration);
};

/* =========================
   SCREEN FLASH
========================= */

V3.createFlash = function(){

    if(document.getElementById("valen-v3-flash")) return;

    var f=document.createElement("div");

    f.id="valen-v3-flash";

    f.style.cssText=`
        position:fixed;
        inset:0;
        z-index:9998;
        pointer-events:none;
        background:rgba(255,40,40,.35);
        opacity:0;
        transition:opacity .12s;
    `;

    document.body.appendChild(f);
};

V3.damageFlash=function(){

    var f=document.getElementById("valen-v3-flash");

    if(!f) return;

    f.style.opacity="1";

    setTimeout(function(){
        f.style.opacity="0";
    },100);
};

V3.createFlash();

/* =========================
   CAMERA SHAKE
========================= */

V3.addShake=function(power){

    if(settings && settings.cameraShake===false) return;

    V3.shake=Math.max(V3.shake,power||0.12);
};

/* =========================
   FLOATING TEXT
========================= */

V3.floatText=function(text,color){

    if(settings && settings.damageNumbers===false) return;

    if(!player) return;

    var pos=player.position.clone();

    pos.y+=2.5;

    var div=document.createElement("div");

    div.textContent=text;

    div.style.cssText=`
        position:fixed;
        z-index:10001;
        color:${color||"#ffffff"};
        font-weight:900;
        font-size:18px;
        text-shadow:0 2px 5px #000;
        pointer-events:none;
        transform:translate(-50%,-50%);
        transition:all .7s ease-out;
    `;

    document.body.appendChild(div);

    var start=performance.now();

    function move(){

        var t=(performance.now()-start)/700;

        if(t>=1){

            div.remove();
            return;

        }

        pos.y+=0.025;

        var p=pos.clone().project(camera);

        div.style.left=((p.x*.5+.5)*innerWidth)+"px";
        div.style.top=((-p.y*.5+.5)*innerHeight)+"px";
        div.style.opacity=String(1-t);

        requestAnimationFrame(move);
    }

    move();
};

/* =========================
   VIGNETTE
========================= */

V3.createVignette=function(){

    if(document.getElementById("valen-v3-vignette")) return;

    var v=document.createElement("div");

    v.id="valen-v3-vignette";

    v.style.cssText=`
        position:fixed;
        inset:0;
        pointer-events:none;
        z-index:9997;
        background:
        radial-gradient(
            circle at center,
            transparent 45%,
            rgba(0,0,0,.32) 100%
        );
    `;

    document.body.appendChild(v);
};

V3.createVignette();

/* =========================
   PARTICLE SYSTEM
========================= */

V3.particles=[];
V3.particleGroup=new THREE.Group();

scene.add(V3.particleGroup);

V3.makeParticle=function(){

    var geo=new THREE.SphereGeometry(.035,4,4);

    var mat=new THREE.MeshBasicMaterial({
        color:0xffffff,
        transparent:true,
        opacity:.7
    });

    var p=new THREE.Mesh(geo,mat);

    p.position.set(
        (Math.random()-.5)*90,
        3+Math.random()*12,
        (Math.random()-.5)*90
    );

    p.userData={
        speed:.3+Math.random()*.7,
        drift:(Math.random()-.5)*.2
    };

    V3.particleGroup.add(p);
    V3.particles.push(p);
};

for(var i=0;i<45;i++){
    V3.makeParticle();
}

/* =========================
   FIRE EMBERS
========================= */

V3.embers=[];
V3.emberGroup=new THREE.Group();

scene.add(V3.emberGroup);

for(var e=0;e<20;e++){

    var eg=new THREE.SphereGeometry(.04,4,4);

    var em=new THREE.MeshBasicMaterial({
        color:0xffb347,
        transparent:true,
        opacity:.8
    });

    var ember=new THREE.Mesh(eg,em);

    ember.visible=false;

    ember.userData={
        life:0,
        speed:.5+Math.random()*1
    };

    V3.emberGroup.add(ember);
    V3.embers.push(ember);
}

/* =========================
   STAR TWINKLE
========================= */

V3.starObjects=[];

scene.traverse(function(o){

    if(
        o.isPoints ||
        o.isSprite
    ){
        V3.starObjects.push(o);
    }

});

/* =========================
   WATER GLOW
========================= */

V3.waterTime=0;

/* =========================
   DAY/NIGHT POLISH
========================= */

V3.updateSky=function(dt){

    if(typeof save==="undefined") return;

    V3.time += dt;

    var t=(save.time||0)%24;

    var target;

    if(t>=6 && t<10){

        var p=(t-6)/4;

        V3.tmpColor.copy(V3.skyNight).lerp(V3.skyDay,p);

    }else if(t>=10 && t<17){

        V3.tmpColor.copy(V3.skyDay);

    }else if(t>=17 && t<20){

        var p2=(t-17)/3;

        V3.tmpColor.copy(V3.skyDay).lerp(V3.skySunset,p2);

    }else{

        V3.tmpColor.copy(V3.skyNight);

    }

    if(scene.background){

        scene.background.lerp(V3.tmpColor,.025);

    }

};

/* =========================
   PARTICLES UPDATE
========================= */

V3.updateParticles=function(dt){

    for(var i=0;i<V3.particles.length;i++){

        var p=V3.particles[i];

        p.position.y-=p.userData.speed*dt;
        p.position.x+=p.userData.drift*dt;

        if(p.position.y<1){

            p.position.y=12+Math.random()*5;
            p.position.x=(Math.random()-.5)*90;
            p.position.z=(Math.random()-.5)*90;

        }

    }

};

/* =========================
   EMBERS UPDATE
========================= */

V3.updateEmbers=function(dt){

    for(var i=0;i<V3.embers.length;i++){

        var p=V3.embers[i];

        if(!p.visible) continue;

        p.position.y+=p.userData.speed*dt;

        p.userData.life-=dt;

        p.material.opacity=Math.max(
            0,
            p.userData.life
        );

        if(p.userData.life<=0){

            p.visible=false;

        }

    }

};

/* =========================
   FIRE EFFECT
========================= */

V3.spawnEmbers=function(pos){

    if(settings && settings.effects===false) return;

    for(var i=0;i<3;i++){

        var ember=null;

        for(var j=0;j<V3.embers.length;j++){

            if(!V3.embers[j].visible){

                ember=V3.embers[j];
                break;

            }

        }

        if(!ember) return;

        ember.visible=true;

        ember.position.copy(pos);

        ember.position.x+=(Math.random()-.5)*.5;
        ember.position.z+=(Math.random()-.5)*.5;

        ember.userData.life=.5+Math.random()*.6;

        ember.material.opacity=1;

    }

};

/* =========================
   BETTER RENDER QUALITY
========================= */

V3.applyGraphics=function(){

    if(typeof renderer==="undefined") return;

    var quality=(settings && settings.graphics)||"High";

    var ratio=window.devicePixelRatio||1;

    if(quality==="Low") ratio=Math.min(ratio,1);
    if(quality==="Medium") ratio=Math.min(ratio,1.5);
    if(quality==="High") ratio=Math.min(ratio,2);

    renderer.setPixelRatio(ratio);

    renderer.setSize(
        innerWidth,
        innerHeight,
        false
    );

    if(renderer.shadowMap){

        renderer.shadowMap.enabled =
            !(settings && settings.shadow===false);

    }

};

setTimeout(function(){
    V3.applyGraphics();
},1000);

window.addEventListener("resize",function(){

    setTimeout(function(){
        V3.applyGraphics();
    },50);

});

/* =========================
   CAMERA SHAKE PATCH
========================= */

if(typeof updateCamera==="function"){

    var V3_oldCamera=updateCamera;

    updateCamera=function(dt){

        V3_oldCamera(dt);

        if(V3.shake>0){

            var s=V3.shake;

            camera.position.x+=(Math.random()-.5)*s;
            camera.position.y+=(Math.random()-.5)*s;
            camera.position.z+=(Math.random()-.5)*s;

            V3.shake=Math.max(
                0,
                V3.shake-dt*1.8
            );

        }

    };

}

/* =========================
   WORLD UPDATE PATCH
========================= */

if(typeof updateWorld==="function"){

    var V3_oldWorld=updateWorld;

    updateWorld=function(dt){

        V3_oldWorld(dt);

        V3.updateSky(dt);
        V3.updateParticles(dt);
        V3.updateEmbers(dt);

    };

}

/* =========================
   SURVIVAL DAMAGE PATCH
========================= */

if(typeof updateSurvival==="function"){

    var V3_oldSurvival=updateSurvival;

    updateSurvival=function(dt){

        V3_oldSurvival(dt);

        if(
            typeof save!=="undefined" &&
            save.health!==undefined &&
            save.health<=25
        ){

            V3.damageFlash();

        }

    };

}

/* =========================
   ACTION FEEDBACK
========================= */

if(typeof gather==="function"){

    var V3_oldGather=gather;

    gather=function(){

        var beforeWood=
            typeof save!=="undefined" ?
            (save.wood||0):0;

        var beforeStone=
            typeof save!=="undefined" ?
            (save.stone||0):0;

        var beforeBerry=
            typeof save!=="undefined" ?
            (save.berries||0):0;

        V3_oldGather();

        if(typeof save!=="undefined"){

            if((save.wood||0)>beforeWood){

                V3.floatText(
                    "+ WOOD",
                    "#c99b6b"
                );

                V3.addShake(.035);

            }

            if((save.stone||0)>beforeStone){

                V3.floatText(
                    "+ STONE",
                    "#b8c1ca"
                );

                V3.addShake(.04);

            }

            if((save.berries||0)>beforeBerry){

                V3.floatText(
                    "+ BERRY",
                    "#ff78a8"
                );

            }

        }

    };

}

/* =========================
   BETTER BUTTON STYLE
========================= */

V3.styleButtons=function(){

    var buttons=document.querySelectorAll("button");

    buttons.forEach(function(b){

        if(b.dataset.v3styled) return;

        b.dataset.v3styled="1";

        b.style.transition=
            "transform .08s, filter .15s, box-shadow .15s";

        b.addEventListener(
            "touchstart",
            function(){

                b.style.filter="brightness(1.3)";

            },
            {passive:true}
        );

        b.addEventListener(
            "touchend",
            function(){

                b.style.filter="";

            },
            {passive:true}
        );

    });

};

setTimeout(V3.styleButtons,500);

setInterval(V3.styleButtons,3000);

/* =========================
   FPS MONITOR
========================= */

V3.frames=0;
V3.fps=60;
V3.fpsTime=performance.now();

setInterval(function(){

    var now=performance.now();
    var delta=now-V3.fpsTime;

    if(delta>0){

        V3.fps=
            Math.round(
                V3.frames*1000/delta
            );

    }

    V3.frames=0;
    V3.fpsTime=now;

},1000);

/* =========================
   MAIN LOOP PATCH
========================= */

if(typeof animate==="function"){

    var V3_oldRender=renderer.render.bind(renderer);

    renderer.render=function(){

        V3.frames++;

        V3_oldRender.apply(
            renderer,
            arguments
        );

    };

}

/* =========================
   PERFORMANCE WARNING
========================= */

V3.performanceCheck=function(){

    if(V3.fps<24){

        V3.toast(
            "⚡ FPS rendah — coba Graphics: Medium",
            3000
        );

    }

};

setInterval(
    V3.performanceCheck,
    10000
);

/* =========================
   START MESSAGE
========================= */

setTimeout(function(){

    if(typeof gameStarted!=="undefined" &&
       gameStarted){

        V3.toast(
            "🌴 VALEN ISLAND • SURVIVAL",
            2200
        );

    }

},1800);

console.log(
    "VALEN ISLAND SURVIVAL — BLOCK 3 LOADED"
);

})();
