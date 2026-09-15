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
