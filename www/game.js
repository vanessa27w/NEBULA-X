/* =========================================================
   VALEN ISLAND SURVIVAL
   OPTIMIZED ANDROID BUILD
   Three.js r160
   Landscape / Touch / 3D / Survival
========================================================= */

(() => {
"use strict";

/* =========================
   BASIC SAFETY
========================= */

if (window.__VALEN_GAME__) return;
window.__VALEN_GAME__ = true;

const T = window.THREE;

if (!T) {
  document.body.innerHTML = `
    <div style="
      position:fixed;inset:0;
      display:grid;place-items:center;
      background:#071923;color:white;
      font:700 22px Arial;text-align:center">
      Three.js gagal dimuat.<br>
      Periksa koneksi internet lalu buka game lagi.
    </div>`;
  return;
}

/* =========================
   SAVE
========================= */

const SAVE_KEY = "VALEN_SURVIVAL_SAVE_V2";

const defaultSave = {
  x: 0,
  z: 8,

  wood: 0,
  stone: 0,
  coconut: 0,
  berries: 0,
  fish: 0,
  cookedFish: 0,

  health: 100,
  hunger: 100,
  thirst: 100,
  stamina: 100,

  time: 8,
  day: 1,

  chapter: 1,
  quest: 0,

  kills: 0,
  fishCaught: 0,

  campfires: 0,
  shelters: 0,

  beaconBuilt: false,
  ending: false,

  achievements: []
};

let save = {
  ...defaultSave,
  ...(JSON.parse(localStorage.getItem(SAVE_KEY) || "{}"))
};

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  toast("💾 Game tersimpan");
}

function resetSave() {
  localStorage.removeItem(SAVE_KEY);
  location.reload();
}

/* =========================
   SETTINGS
========================= */

const SETTINGS_KEY = "VALEN_SETTINGS_V2";

let settings = {
  sensitivity: 0.006,
  invertY: false,
  vibration: true,
  cameraShake: true,
  autoPickup: true,
  hud: true,
  quality: "Medium",
  ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
};

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* =========================
   UTILS
========================= */

const clamp = (v, a, b) =>
  Math.max(a, Math.min(b, v));

const rand = (a, b) =>
  a + Math.random() * (b - a);

const distanceXZ = (a, b) =>
  Math.hypot(a.x - b.x, a.z - b.z);

function vibrate(ms = 20) {
  if (settings.vibration && navigator.vibrate) {
    navigator.vibrate(ms);
  }
}

/* =========================
   UI
========================= */

const ui = document.createElement("div");

ui.innerHTML = `
<style>

*{
 box-sizing:border-box;
 -webkit-tap-highlight-color:transparent;
}

body{
 margin:0;
 overflow:hidden;
 background:#071923;
 font-family:Arial,sans-serif;
 touch-action:none;
 user-select:none;
}

#gameCanvas{
 position:fixed;
 inset:0;
 width:100%;
 height:100%;
}

#hud{
 position:fixed;
 top:10px;
 left:10px;
 z-index:20;
 color:white;
 min-width:240px;
 pointer-events:none;
}

.bar{
 width:210px;
 height:17px;
 margin:4px 0;
 border-radius:10px;
 overflow:hidden;
 background:#14242b;
 border:1px solid rgba(255,255,255,.25);
}

.fill{
 height:100%;
 width:100%;
 transition:width .15s;
}

#healthFill{background:#e74c3c}
#hungerFill{background:#f39c12}
#thirstFill{background:#3498db}
#staminaFill{background:#2ecc71}

#stats{
 margin-top:7px;
 font-size:13px;
 text-shadow:0 2px 4px #000;
}

#quest{
 margin-top:8px;
 padding:8px 10px;
 width:280px;
 border-radius:10px;
 background:rgba(0,0,0,.45);
 font-size:13px;
}

#toast{
 position:fixed;
 z-index:100;
 left:50%;
 top:16%;
 transform:translateX(-50%);
 padding:10px 18px;
 border-radius:12px;
 background:rgba(0,0,0,.75);
 color:#fff;
 font-weight:bold;
 opacity:0;
 pointer-events:none;
 transition:.2s;
}

#toast.show{
 opacity:1;
}

#joystick{
 position:fixed;
 z-index:30;
 left:25px;
 bottom:25px;
 width:130px;
 height:130px;
 border-radius:50%;
 background:rgba(255,255,255,.12);
 border:2px solid rgba(255,255,255,.25);
}

#stick{
 position:absolute;
 width:58px;
 height:58px;
 left:34px;
 top:34px;
 border-radius:50%;
 background:rgba(255,255,255,.45);
}

#buttons{
 position:fixed;
 z-index:30;
 right:22px;
 bottom:22px;
 display:grid;
 grid-template-columns:repeat(2,70px);
 gap:10px;
}

.gameBtn{
 width:70px;
 height:58px;
 border:0;
 border-radius:18px;
 background:rgba(0,0,0,.5);
 color:white;
 font-size:25px;
 border:1px solid rgba(255,255,255,.25);
}

.gameBtn:active{
 transform:scale(.9);
}

#crosshair{
 position:fixed;
 left:50%;
 top:50%;
 width:8px;
 height:8px;
 margin:-4px;
 border:1px solid rgba(255,255,255,.8);
 border-radius:50%;
 z-index:10;
 pointer-events:none;
}

#menu{
 position:fixed;
 z-index:200;
 inset:0;
 display:none;
 align-items:center;
 justify-content:center;
 background:rgba(3,12,18,.86);
 color:white;
}

.card{
 width:min(500px,90vw);
 max-height:90vh;
 overflow:auto;
 padding:24px;
 border-radius:22px;
 background:rgba(12,31,40,.96);
 border:1px solid rgba(255,255,255,.15);
 box-shadow:0 20px 60px rgba(0,0,0,.5);
}

.card h1{
 margin-top:0;
 font-size:30px;
}

.menuBtn{
 width:100%;
 margin:6px 0;
 padding:13px;
 border:0;
 border-radius:12px;
 background:#1c6f80;
 color:white;
 font-weight:bold;
 font-size:15px;
}

.inventory{
 display:grid;
 grid-template-columns:1fr 1fr;
 gap:7px;
 margin:12px 0;
}

.item{
 padding:9px;
 background:rgba(255,255,255,.08);
 border-radius:9px;
}

@media(max-height:500px){
 #hud{
   top:5px;
   left:7px;
   transform:scale(.85);
   transform-origin:top left;
 }
 #joystick{
   width:105px;
   height:105px;
 }
 #stick{
   width:48px;
   height:48px;
   left:27px;
   top:27px;
 }
 #buttons{
   right:12px;
   bottom:12px;
 }
 .gameBtn{
   width:62px;
   height:50px;
 }
}

</style>

<div id="hud">

 <b>🏝️ VALEN ISLAND</b>

 <div class="bar">
   <div id="healthFill" class="fill"></div>
 </div>

 <div class="bar">
   <div id="hungerFill" class="fill"></div>
 </div>

 <div class="bar">
   <div id="thirstFill" class="fill"></div>
 </div>

 <div class="bar">
   <div id="staminaFill" class="fill"></div>
 </div>

 <div id="stats"></div>
 <div id="quest"></div>

</div>

<div id="crosshair"></div>

<div id="joystick">
 <div id="stick"></div>
</div>

<div id="buttons">
 <button class="gameBtn" id="btnAction">🪓</button>
 <button class="gameBtn" id="btnJump">⬆️</button>
 <button class="gameBtn" id="btnRun">🏃</button>
 <button class="gameBtn" id="btnMenu">☰</button>
</div>

<div id="toast"></div>

<div id="menu">
 <div class="card">

   <h1>🏝️ VALEN ISLAND</h1>
   <p>3D Tropical Survival</p>

   <button class="menuBtn" id="continueBtn">
     ▶️ LANJUTKAN
   </button>

   <button class="menuBtn" id="saveBtn">
     💾 SIMPAN
   </button>

   <button class="menuBtn" id="inventoryBtn">
     🎒 INVENTORY
   </button>

   <button class="menuBtn" id="craftBtn">
     🔨 CRAFTING
   </button>

   <button class="menuBtn" id="settingsBtn">
     ⚙️ SETTINGS
   </button>

   <button class="menuBtn" id="newBtn">
     🆕 GAME BARU
   </button>

 </div>
</div>
`;

document.body.appendChild(ui);

const healthFill = document.getElementById("healthFill");
const hungerFill = document.getElementById("hungerFill");
const thirstFill = document.getElementById("thirstFill");
const staminaFill = document.getElementById("staminaFill");
const stats = document.getElementById("stats");
const questUI = document.getElementById("quest");

const menu = document.getElementById("menu");
const toastEl = document.getElementById("toast");

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");

  clearTimeout(toastEl._timer);

  toastEl._timer = setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1800);
}

/* =========================
   THREE.JS
========================= */

const scene = new T.Scene();

scene.background = new T.Color(0x78c9e8);

scene.fog = new T.Fog(
  0x78c9e8,
  80,
  420
);

const camera = new T.PerspectiveCamera(
  65,
  innerWidth / innerHeight,
  .1,
  600
);

const renderer = new T.WebGLRenderer({
  antialias:false,
  powerPreference:"high-performance"
});

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.setPixelRatio(
  Math.min(devicePixelRatio, 1.5)
);

renderer.shadowMap.enabled = false;

renderer.domElement.id = "gameCanvas";

document.body.insertBefore(
  renderer.domElement,
  document.body.firstChild
);

/* =========================
   LIGHT
========================= */

scene.add(
  new T.HemisphereLight(
    0xbcecff,
    0x27442a,
    1.5
  )
);

const sun = new T.DirectionalLight(
  0xfff0bd,
  2
);

sun.position.set(
  -100,
  150,
  80
);

scene.add(sun);

/* =========================
   MATERIAL HELPERS
========================= */

function material(color) {
  return new T.MeshLambertMaterial({
    color
  });
}

function box(w,h,d,color) {
  return new T.Mesh(
    new T.BoxGeometry(w,h,d),
    material(color)
  );
}

function cylinder(r,h,color,segments=8) {
  return new T.Mesh(
    new T.CylinderGeometry(
      r,
      r,
      h,
      segments
    ),
    material(color)
  );
}

/* =========================
   WORLD
========================= */

const WORLD_RADIUS = 300;
const BEACH_RADIUS = 330;
const OCEAN_RADIUS = 700;

/* ocean */

const ocean = new T.Mesh(
  new T.CircleGeometry(
    OCEAN_RADIUS,
    48
  ),
  new T.MeshLambertMaterial({
    color:0x087b9b
  })
);

ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -1.8;

scene.add(ocean);

/* beach */

const beach = new T.Mesh(
  new T.CircleGeometry(
    BEACH_RADIUS,
    48
  ),
  material(0xd8bd76)
);

beach.rotation.x = -Math.PI / 2;
beach.position.y = -1.3;

scene.add(beach);

/* island */

const island = new T.Mesh(
  new T.CircleGeometry(
    WORLD_RADIUS,
    48
  ),
  material(0x3f8d43)
);

island.rotation.x = -Math.PI / 2;
island.position.y = -1;

scene.add(island);

/* grass center */

const grass = new T.Mesh(
  new T.CircleGeometry(
    WORLD_RADIUS - 12,
    48
  ),
  material(0x438f43)
);

grass.rotation.x = -Math.PI / 2;
grass.position.y = -.85;

scene.add(grass);

/* =========================
   OBJECT ARRAYS
========================= */

const resources = [];
const animals = [];
const buildings = [];

/* =========================
   ISLAND CHECK
========================= */

function insideIsland(x,z) {

  const d =
    (x*x) +
    (z*z) / 1.12;

  return d <
    WORLD_RADIUS * WORLD_RADIUS;

}

/* =========================
   RANDOM POSITION
========================= */

function randomIslandPosition(min=20) {

  for(let i=0;i<20;i++){

    const a =
      Math.random() * Math.PI * 2;

    const r =
      rand(min,WORLD_RADIUS-15);

    const x =
      Math.cos(a) * r;

    const z =
      Math.sin(a) * r;

    if(insideIsland(x,z)){
      return {x,z};
    }

  }

  return {x:0,z:0};
}

/* =========================
   RESOURCE OBJECT
========================= */

function createResource(
  type,
  x,
  z
){

  let group =
    new T.Group();

  if(type === "wood"){

    const trunk =
      cylinder(
        .42,
        3.4,
        0x65452a,
        7
      );

    trunk.position.y = 1.7;

    group.add(trunk);

    const crown =
      new T.Mesh(
        new T.ConeGeometry(
          2.1,
          3,
          7
        ),
        material(0x23743b)
      );

    crown.position.y = 4;

    group.add(crown);

  }

  else if(type === "stone"){

    const rock =
      new T.Mesh(
        new T.DodecahedronGeometry(
          .9,
          0
        ),
        material(0x70767b)
      );

    rock.position.y = .8;

    group.add(rock);

  }

  else if(type === "berry"){

    const bush =
      new T.Mesh(
        new T.SphereGeometry(
          .85,
          8,
          6
        ),
        material(0x3e8d46)
      );

    bush.position.y = .8;

    group.add(bush);

    for(let i=0;i<3;i++){

      const berry =
        new T.Mesh(
          new T.SphereGeometry(
            .13,
            6,
            5
          ),
          material(0xd93655)
        );

      berry.position.set(
        rand(-.5,.5),
        rand(.7,1.2),
        rand(-.5,.5)
      );

      group.add(berry);

    }

  }

  else if(type === "coconut"){

    const trunk =
      cylinder(
        .28,
        3,
        0x80552d,
        7
      );

    trunk.position.y = 1.5;

    group.add(trunk);

    for(let i=0;i<5;i++){

      const leaf =
        new T.Mesh(
          new T.BoxGeometry(
            .15,
            .15,
            3.5
          ),
          material(0x267a3d)
        );

      leaf.position.y = 3;

      leaf.rotation.y =
        i * Math.PI * 2 / 5;

      leaf.rotation.x =
        -.35;

      group.add(leaf);

    }

    const fruit =
      new T.Mesh(
        new T.SphereGeometry(
          .35,
          7,
          6
        ),
        material(0x6e4d28)
      );

    fruit.position.set(
      .5,
      2.5,
      .2
    );

    group.add(fruit);

  }

  group.position.set(x,0,z);

  group.userData = {
    type,
    active:true,
    hp:type === "wood" ? 2 : 1
  };

  scene.add(group);
  resources.push(group);

  return group;
}

/* =========================
   GENERATE RESOURCES
========================= */

for(let i=0;i<65;i++){

  const p =
    randomIslandPosition(25);

  createResource(
    "wood",
    p.x,
    p.z
  );

}

for(let i=0;i<55;i++){

  const p =
    randomIslandPosition(20);

  createResource(
    "stone",
    p.x,
    p.z
  );

}

for(let i=0;i<35;i++){

  const p =
    randomIslandPosition(25);

  createResource(
    "berry",
    p.x,
    p.z
  );

}

for(let i=0;i<25;i++){

  const p =
    randomIslandPosition(35);

  createResource(
    "coconut",
    p.x,
    p.z
  );

}

/* =========================
   RUINS
========================= */

const ruins =
  new T.Group();

ruins.position.set(
  -145,
  0,
  -120
);

for(let i=0;i<7;i++){

  const wall =
    box(
      3,
      rand(2.5,5),
      1,
      0x70685d
    );

  wall.position.set(
    (i-3)*3,
    wall.geometry.parameters.height/2,
    rand(-3,3)
  );

  wall.rotation.y =
    rand(-.15,.15);

  ruins.add(wall);

}

scene.add(ruins);

/* mystery crystal */

const crystal =
  new T.Mesh(
    new T.OctahedronGeometry(
      1.4,
      0
    ),
    new T.MeshLambertMaterial({
      color:0x53e8ff,
      emissive:0x18aabe
    })
  );

crystal.position.set(
  -145,
  2,
  -125
);

scene.add(crystal);

/* =========================
   PLAYER
========================= */

const player =
  new T.Group();

const body =
  cylinder(
    .55,
    1.4,
    0x2266b3,
    8
  );

body.position.y = 1;

player.add(body);

const head =
  new T.Mesh(
    new T.SphereGeometry(
      .48,
      10,
      8
    ),
    material(0xf0b27a)
  );

head.position.y = 2;

player.add(head);

const backpack =
  box(
    .7,
    .9,
    .35,
    0x493a2b
  );

backpack.position.set(
  0,
  1.1,
  -.45
);

player.add(backpack);

player.position.set(
  save.x,
  0,
  save.z
);

scene.add(player);

/* =========================
   ANIMALS
========================= */

function createAnimal(
  type,
  x,
  z
){

  const g =
    new T.Group();

  const color =
    type === "boar"
      ? 0x69452e
      : 0xbdb29a;

  const body =
    new T.Mesh(
      new T.BoxGeometry(
        1.5,
        .8,
        2
      ),
      material(color)
    );

  body.position.y = .7;

  g.add(body);

  const head =
    new T.Mesh(
      new T.SphereGeometry(
        .55,
        8,
        6
      ),
      material(color)
    );

  head.position.set(
    0,
    .9,
    1
  );

  g.add(head);

  g.position.set(
    x,
    0,
    z
  );

  g.userData = {
    type,
    hp:type==="boar"?30:10,
    dir:rand(0,Math.PI*2),
    timer:rand(1,5),
    speed:type==="boar"?1.1:.7,
    alive:true
  };

  scene.add(g);
  animals.push(g);

}

for(let i=0;i<12;i++){

  const p =
    randomIslandPosition(40);

  createAnimal(
    "boar",
    p.x,
    p.z
  );

}

for(let i=0;i<8;i++){

  const p =
    randomIslandPosition(50);

  createAnimal(
    "deer",
    p.x,
    p.z
  );

}

/* =========================
   CAMPFIRE
========================= */

function createCampfire(x,z){

  const g =
    new T.Group();

  for(let i=0;i<3;i++){

    const log =
      cylinder(
        .16,
        1.5,
        0x623d20,
        6
      );

    log.rotation.z =
      Math.PI / 2;

    log.rotation.y =
      i * Math.PI / 3;

    log.position.y =
      .25;

    g.add(log);

  }

  const fire =
    new T.Mesh(
      new T.ConeGeometry(
        .55,
        1.3,
        7
      ),
      new T.MeshBasicMaterial({
        color:0xff7a16
      })
    );

  fire.position.y = 1;

  g.add(fire);

  g.position.set(
    x,
    0,
    z
  );

  scene.add(g);
  buildings.push(g);

  return g;
}

/* =========================
   SHELTER
========================= */

function createShelter(x,z){

  const g =
    new T.Group();

  const floor =
    box(
      5,
      .2,
      4,
      0x78512d
    );

  floor.position.y = .2;

  g.add(floor);

  for(const px of [-2.2,2.2]){

    const post =
      box(
        .25,
        2.7,
        .25,
        0x684523
      );

    post.position.set(
      px,
      1.35,
      0
    );

    g.add(post);

  }

  const roof =
    box(
      5.4,
      .25,
      4.4,
      0x4b3422
    );

  roof.position.y = 3;

  g.add(roof);

  g.position.set(
    x,
    0,
    z
  );

  scene.add(g);
  buildings.push(g);

}

/* =========================
   GATHERING
========================= */

function nearestResource(){

  let best = null;
  let bestDistance = 6;

  for(const r of resources){

    if(!r.userData.active)
      continue;

    const d =
      distanceXZ(
        player.position,
        r.position
      );

    if(d < bestDistance){

      bestDistance = d;
      best = r;

    }

  }

  return best;
}

function gather(){

  const r =
    nearestResource();

  if(!r){

    toast("Tidak ada resource dekat sini");
    return;

  }

  const type =
    r.userData.type;

  if(type === "wood"){

    save.wood += 2;
    toast("🪵 +2 Wood");

  }

  else if(type === "stone"){

    save.stone += 2;
    toast("🪨 +2 Stone");

  }

  else if(type === "berry"){

    save.berries += 3;
    toast("🫐 +3 Berries");

  }

  else if(type === "coconut"){

    save.coconut += 1;
    toast("🥥 +1 Coconut");

  }

  r.userData.active = false;
  r.visible = false;

  vibrate(25);

  updateHUD();

}

/* =========================
   FISHING
========================= */

function fishing(){

  const d =
    Math.hypot(
      player.position.x,
      player.position.z
    );

  if(d < WORLD_RADIUS - 5){

    toast("🎣 Pergi ke pantai dulu");
    return;

  }

  if(Math.random() < .65){

    save.fish++;
    save.fishCaught++;

    toast("🐟 Dapat ikan!");

  }else{

    toast("🐟 Ikan kabur!");

  }

  updateHUD();

}

/* =========================
   ACTION
========================= */

function action(){

  const r =
    nearestResource();

  if(r){

    gather();
    return;

  }

  const d =
    Math.hypot(
      player.position.x,
      player.position.z
    );

  if(d > WORLD_RADIUS - 10){

    fishing();
    return;

  }

  attack();

}

/* =========================
   ATTACK
========================= */

function attack(){

  let target = null;
  let closest = 5;

  for(const a of animals){

    if(!a.userData.alive)
      continue;

    const d =
      distanceXZ(
        player.position,
        a.position
      );

    if(d < closest){

      closest = d;
      target = a;

    }

  }

  if(!target){

    toast("Tidak ada target");
    return;

  }

  target.userData.hp -= 10;

  toast("⚔️ Serangan!");

  vibrate(30);

  if(target.userData.hp <= 0){

    target.userData.alive = false;
    target.visible = false;

    save.kills++;

    if(Math.random()<.7)
      save.wood++;

    if(Math.random()<.4)
      save.fish++;

    toast("💀 Hewan dikalahkan");

  }

  updateHUD();

}

/* =========================
   CRAFT
========================= */

function craft(){

  menu.style.display = "none";

  const old =
    document.getElementById(
      "craftPanel"
    );

  if(old) old.remove();

  const panel =
    document.createElement("div");

  panel.id = "craftPanel";

  panel.style.cssText = `
    position:fixed;
    inset:0;
    z-index:250;
    display:grid;
    place-items:center;
    background:rgba(0,0,0,.8);
    color:white;
    font-family:Arial;
  `;

  panel.innerHTML = `
    <div class="card">

      <h2>🔨 CRAFTING</h2>

      <button class="menuBtn" id="fireCraft">
        🔥 CAMPFIRE
        <br>
        <small>5 Wood + 3 Stone</small>
      </button>

      <button class="menuBtn" id="shelterCraft">
        🏕️ SHELTER
        <br>
        <small>12 Wood + 8 Stone</small>
      </button>

      <button class="menuBtn" id="cookCraft">
        🍳 COOK FISH
        <br>
        <small>1 Fish</small>
      </button>

      <button class="menuBtn" id="closeCraft">
        ❌ TUTUP
      </button>

    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById(
    "fireCraft"
  ).onclick = () => {

    if(
      save.wood >= 5 &&
      save.stone >= 3
    ){

      save.wood -= 5;
      save.stone -= 3;

      createCampfire(
        player.position.x + 3,
        player.position.z + 2
      );

      save.campfires++;

      toast("🔥 Campfire dibuat");

      updateHUD();

    }else{

      toast("❌ Resource kurang");

    }

  };

  document.getElementById(
    "shelterCraft"
  ).onclick = () => {

    if(
      save.wood >= 12 &&
      save.stone >= 8
    ){

      save.wood -= 12;
      save.stone -= 8;

      createShelter(
        player.position.x + 4,
        player.position.z
      );

      save.shelters++;

      toast("🏕️ Shelter dibuat");

      updateHUD();

    }else{

      toast("❌ Resource kurang");

    }

  };

  document.getElementById(
    "cookCraft"
  ).onclick = () => {

    if(save.fish >= 1){

      save.fish--;
      save.cookedFish++;

      toast("🍳 Ikan dimasak");

      updateHUD();

    }else{

      toast("❌ Tidak punya ikan");

    }

  };

  document.getElementById(
    "closeCraft"
  ).onclick = () => {

    panel.remove();

  };

}

/* =========================
   INVENTORY
========================= */

function inventory(){

  menu.style.display = "none";

  const panel =
    document.createElement("div");

  panel.style.cssText = `
    position:fixed;
    inset:0;
    z-index:250;
    display:grid;
    place-items:center;
    background:rgba(0,0,0,.8);
    color:white;
  `;

  panel.innerHTML = `
    <div class="card">

      <h2>🎒 INVENTORY</h2>

      <div class="inventory">

        <div class="item">🪵 Wood<br>${save.wood}</div>
        <div class="item">🪨 Stone<br>${save.stone}</div>
        <div class="item">🥥 Coconut<br>${save.coconut}</div>
        <div class="item">🫐 Berries<br>${save.berries}</div>
        <div class="item">🐟 Fish<br>${save.fish}</div>
        <div class="item">🍳 Cooked Fish<br>${save.cookedFish}</div>

      </div>

      <button class="menuBtn" id="eatBerry">
        🫐 MAKAN BERRY
      </button>

      <button class="menuBtn" id="drinkCoconut">
        🥥 MINUM KELAPA
      </button>

      <button class="menuBtn" id="eatFish">
        🍳 MAKAN IKAN
      </button>

      <button class="menuBtn" id="closeInv">
        ❌ TUTUP
      </button>

    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById(
    "eatBerry"
  ).onclick = () => {

    if(save.berries > 0){

      save.berries--;
      save.hunger =
        clamp(
          save.hunger + 15,
          0,
          100
        );

      toast("🫐 +15 Hunger");
      updateHUD();

    }

  };

  document.getElementById(
    "drinkCoconut"
  ).onclick = () => {

    if(save.coconut > 0){

      save.coconut--;
      save.thirst =
        clamp(
          save.thirst + 25,
          0,
          100
        );

      toast("🥥 +25 Thirst");
      updateHUD();

    }

  };

  document.getElementById(
    "eatFish"
  ).onclick = () => {

    if(save.cookedFish > 0){

      save.cookedFish--;

      save.hunger =
        clamp(
          save.hunger + 35,
          0,
          100
        );

      save.health =
        clamp(
          save.health + 5,
          0,
          100
        );

      toast("🍳 +35 Hunger");
      updateHUD();

    }

  };

  document.getElementById(
    "closeInv"
  ).onclick = () =>
    panel.remove();

}

/* =========================
   QUEST
========================= */

function questText(){

  if(save.chapter === 1)
    return "Chapter 1 — Kumpulkan 10 Wood";

  if(save.chapter === 2)
    return "Chapter 2 — Kumpulkan 10 Stone";

  if(save.chapter === 3)
    return "Chapter 3 — Temukan reruntuhan";

  if(save.chapter === 4)
    return "Chapter 4 — Bangun campfire";

  if(save.chapter === 5)
    return "Chapter 5 — Aktifkan rescue beacon";

  return "Free Roam";

}

function updateQuest(){

  if(
    save.chapter === 1 &&
    save.wood >= 10
  ){

    save.chapter = 2;
    toast("📖 Chapter 2 terbuka");

  }

  if(
    save.chapter === 2 &&
    save.stone >= 10
  ){

    save.chapter = 3;
    toast("📖 Chapter 3 terbuka");

  }

  if(
    save.chapter === 3
  ){

    const d =
      Math.hypot(
        player.position.x + 145,
        player.position.z + 120
      );

    if(d < 18){

      save.chapter = 4;
      toast("🏛️ Reruntuhan ditemukan");

    }

  }

  if(
    save.chapter === 4 &&
    save.campfires > 0
  ){

    save.chapter = 5;
    toast("📖 Chapter 5 terbuka");

  }

  if(
    save.chapter === 5 &&
    save.wood >= 20 &&
    save.stone >= 15 &&
    !save.beaconBuilt
  ){

    save.beaconBuilt = true;
    toast("📡 Rescue beacon siap!");

  }

}

/* =========================
   BEACON
========================= */

function createBeacon(){

  if(!save.beaconBuilt)
    return;

  const g =
    new T.Group();

  const base =
    cylinder(
      1,
      .4,
      0x444444,
      8
    );

  base.position.y = .2;
  g.add(base);

  const tower =
    cylinder(
      .18,
      5,
      0x777777,
      6
    );

  tower.position.y = 2.7;
  g.add(tower);

  const light =
    new T.Mesh(
      new T.SphereGeometry(
        .45,
        8,
        6
      ),
      new T.MeshBasicMaterial({
        color:0xff3333
      })
    );

  light.position.y = 5.3;

  g.add(light);

  g.position.set(
    0,
    0,
    -5
  );

  scene.add(g);

  return g;

}

let beacon = null;

/* =========================
   SURVIVAL
========================= */

let survivalTimer = 0;

function updateSurvival(dt){

  survivalTimer += dt;

  if(
    survivalTimer < 3
  )
    return;

  survivalTimer = 0;

  save.hunger =
    clamp(
      save.hunger - .7,
      0,
      100
    );

  save.thirst =
    clamp(
      save.thirst - 1,
      0,
      100
    );

  if(
    save.hunger <= 0 ||
    save.thirst <= 0
  ){

    save.health =
      clamp(
        save.health - 2,
        0,
        100
      );

  }

  if(save.health <= 0){

    toast("💀 KAMU MATI");

    save.health = 100;
    save.hunger = 100;
    save.thirst = 100;

    player.position.set(
      0,
      0,
      8
    );

  }

  updateHUD();

}

/* =========================
   DAY / NIGHT
========================= */

function updateTime(dt){

  save.time +=
    dt * .03;

  if(save.time >= 24){

    save.time = 0;
    save.day++;

  }

  const hour =
    save.time;

  const daylight =
    Math.max(
      0,
      Math.sin(
        ((hour - 6) / 12) *
        Math.PI
      )
    );

  sun.intensity =
    .3 +
    daylight * 1.8;

  scene.background =
    new T.Color(
      daylight > .2
        ? 0x78c9e8
        : 0x071526
    );

  scene.fog.color =
    scene.background;

}

/* =========================
   WEATHER
========================= */

let weatherTimer = 0;
let rainMode = false;

function updateWeather(dt){

  weatherTimer += dt;

  if(weatherTimer > 35){

    weatherTimer = 0;

    rainMode =
      Math.random() < .25;

    if(rainMode)
      toast("🌧️ Hujan turun");
    else
      toast("☀️ Cuaca cerah");

  }

}

/* =========================
   PLAYER CONTROL
========================= */

let joyX = 0;
let joyY = 0;

let running = false;

let velocityY = 0;
let jumping = false;

const speed = 5;

function updatePlayer(dt){

  let dx = joyX;
  let dz = joyY;

  const len =
    Math.hypot(dx,dz);

  if(len > 1){

    dx /= len;
    dz /= len;

  }

  const moveSpeed =
    running && save.stamina > 0
      ? speed * 1.8
      : speed;

  if(
    running &&
    len > .1
  ){

    save.stamina =
      clamp(
        save.stamina -
        dt * 12,
        0,
        100
      );

  }else{

    save.stamina =
      clamp(
        save.stamina +
        dt * 8,
        0,
        100
      );

  }

  player.position.x +=
    dx * moveSpeed * dt;

  player.position.z +=
    dz * moveSpeed * dt;

  const max =
    BEACH_RADIUS - 3;

  const d =
    Math.hypot(
      player.position.x,
      player.position.z
    );

  if(d > max){

    player.position.x =
      player.position.x / d * max;

    player.position.z =
      player.position.z / d * max;

  }

  if(jumping){

    velocityY -=
      18 * dt;

    player.position.y +=
      velocityY * dt;

    if(player.position.y <= 0){

      player.position.y = 0;
      velocityY = 0;
      jumping = false;

    }

  }

}

/* =========================
   JUMP
========================= */

function jump(){

  if(jumping)
    return;

  if(save.stamina < 15)
    return;

  save.stamina -= 15;

  jumping = true;

  velocityY = 7;

  vibrate(15);

}

/* =========================
   CAMERA
========================= */

let cameraYaw = 0;
let cameraPitch = .45;

let cameraDistance = 10;

let lookTouch = null;

renderer.domElement.addEventListener(
  "pointerdown",
  e => {

    if(
      e.clientX >
      innerWidth * .45
    ){

      lookTouch = {
        x:e.clientX,
        y:e.clientY
      };

    }

  }
);

renderer.domElement.addEventListener(
  "pointermove",
  e => {

    if(!lookTouch)
      return;

    const dx =
      e.clientX -
      lookTouch.x;

    const dy =
      e.clientY -
      lookTouch.y;

    cameraYaw -=
      dx *
      settings.sensitivity;

    cameraPitch -=
      dy *
      settings.sensitivity *
      (settings.invertY ? -1 : 1);

    cameraPitch =
      clamp(
        cameraPitch,
        .15,
        1.25
      );

    lookTouch.x =
      e.clientX;

    lookTouch.y =
      e.clientY;

  }
);

renderer.domElement.addEventListener(
  "pointerup",
  () => {
    lookTouch = null;
  }
);

function updateCamera(){

  const target =
    player.position.clone();

  target.y += 1.4;

  const cp =
    Math.cos(cameraPitch);

  const offset =
    new T.Vector3(
      Math.sin(cameraYaw) *
        cp *
        cameraDistance,
      Math.sin(cameraPitch) *
        cameraDistance,
      Math.cos(cameraYaw) *
        cp *
        cameraDistance
    );

  camera.position.lerp(
    target.clone().add(offset),
    .12
  );

  camera.lookAt(target);

}

/* =========================
   JOYSTICK
========================= */

const joystick =
  document.getElementById(
    "joystick"
  );

const stick =
  document.getElementById(
    "stick"
  );

let joyPointer = null;

function joystickMove(
  e
){

  const rect =
    joystick.getBoundingClientRect();

  const cx =
    rect.left +
    rect.width / 2;

  const cy =
    rect.top +
    rect.height / 2;

  let x =
    e.clientX - cx;

  let y =
    e.clientY - cy;

  const radius =
    rect.width / 2 - 30;

  const len =
    Math.hypot(x,y);

  if(len > radius){

    x =
      x / len * radius;

    y =
      y / len * radius;

  }

  joyX =
    x / radius;

  joyY =
    y / radius;

  stick.style.transform =
    `translate(${x}px,${y}px)`;

}

joystick.addEventListener(
  "pointerdown",
  e => {

    joyPointer = e.pointerId;

    joystickMove(e);

  }
);

window.addEventListener(
  "pointermove",
  e => {

    if(
      e.pointerId ===
      joyPointer
    ){

      joystickMove(e);

    }

  }
);

window.addEventListener(
  "pointerup",
  e => {

    if(
      e.pointerId ===
      joyPointer
    ){

      joyPointer = null;

      joyX = 0;
      joyY = 0;

      stick.style.transform =
        "translate(0,0)";

    }

  }
);

/* =========================
   BUTTONS
========================= */

document.getElementById(
  "btnAction"
).onclick = action;

document.getElementById(
  "btnJump"
).onclick = jump;

const runBtn =
  document.getElementById(
    "btnRun"
  );

runBtn.onpointerdown =
  () => running = true;

runBtn.onpointerup =
  () => running = false;

runBtn.onpointercancel =
  () => running = false;

document.getElementById(
  "btnMenu"
).onclick = () => {

  menu.style.display =
    menu.style.display === "flex"
      ? "none"
      : "flex";

};

document.getElementById(
  "continueBtn"
).onclick = () => {

  menu.style.display = "none";

};

document.getElementById(
  "saveBtn"
).onclick = saveGame;

document.getElementById(
  "inventoryBtn"
).onclick = inventory;

document.getElementById(
  "craftBtn"
).onclick = craft;

document.getElementById(
  "settingsBtn"
).onclick = () => {

  toast(
    `Sensitivity ${Math.round(
      settings.sensitivity * 100000 / 6
    )}%`
  );

};

document.getElementById(
  "newBtn"
).onclick = () => {

  if(
    confirm(
      "Hapus semua progress?"
    )
  ){

    resetSave();

  }

};

/* =========================
   KEYBOARD
========================= */

const keys = {};

window.addEventListener(
  "keydown",
  e => {

    keys[e.key.toLowerCase()] =
      true;

    if(
      e.key === " "
    ){

      jump();

    }

    if(
      e.key.toLowerCase() === "e"
    ){

      action();

    }

  }
);

window.addEventListener(
  "keyup",
  e => {

    keys[e.key.toLowerCase()] =
      false;

  }
);

function keyboardControl(){

  let x = 0;
  let z = 0;

  if(keys.w) z -= 1;
  if(keys.s) z += 1;
  if(keys.a) x -= 1;
  if(keys.d) x += 1;

  if(x || z){

    joyX = x;
    joyY = z;

  }

}

/* =========================
   HUD
========================= */

function updateHUD(){

  healthFill.style.width =
    save.health + "%";

  hungerFill.style.width =
    save.hunger + "%";

  thirstFill.style.width =
    save.thirst + "%";

  staminaFill.style.width =
    save.stamina + "%";

  stats.innerHTML = `
    ❤️ ${Math.round(save.health)}
    🍖 ${Math.round(save.hunger)}
    💧 ${Math.round(save.thirst)}
    ⚡ ${Math.round(save.stamina)}
    <br>
    🪵 ${save.wood}
    🪨 ${save.stone}
    🥥 ${save.coconut}
    🫐 ${save.berries}
    🐟 ${save.fish}
    <br>
    ☀️ Day ${save.day}
    • ${Math.floor(save.time)}:00
  `;

  questUI.innerHTML =
    `📖 Chapter ${save.chapter}<br>
     ${questText()}`;

}

/* =========================
   RESPAWN RESOURCE
========================= */

let respawnTimer = 0;

function respawnResources(dt){

  respawnTimer += dt;

  if(respawnTimer < 30)
    return;

  respawnTimer = 0;

  for(const r of resources){

    if(
      !r.userData.active &&
      Math.random() < .25
    ){

      const p =
        randomIslandPosition(25);

      r.position.set(
        p.x,
        0,
        p.z
      );

      r.userData.active = true;
      r.visible = true;

    }

  }

}

/* =========================
   ANIMAL AI
========================= */

function updateAnimals(dt){

  for(const a of animals){

    if(!a.userData.alive)
      continue;

    a.userData.timer -= dt;

    if(
      a.userData.timer <= 0
    ){

      a.userData.timer =
        rand(2,6);

      a.userData.dir =
        rand(
          0,
          Math.PI * 2
        );

    }

    a.position.x +=
      Math.cos(
        a.userData.dir
      ) *
      a.userData.speed *
      dt;

    a.position.z +=
      Math.sin(
        a.userData.dir
      ) *
      a.userData.speed *
      dt;

    if(
      !insideIsland(
        a.position.x,
        a.position.z
      )
    ){

      a.userData.dir +=
        Math.PI;

    }

  }

}

/* =========================
   PALM ANIMATION
========================= */

let animTime = 0;

function animateObjects(){

  animTime += .016;

  for(const r of resources){

    if(
      r.userData.type ===
      "wood"
    ){

      r.rotation.z =
        Math.sin(
          animTime * .8 +
          r.position.x
        ) * .015;

    }

  }

}

/* =========================
   ENDING
========================= */

function checkEnding(){

  if(
    !save.beaconBuilt ||
    save.ending
  )
    return;

  const d =
    Math.hypot(
      player.position.x,
      player.position.z + 5
    );

  if(d < 8){

    save.ending = true;

    toast(
      "🚁 RESCUE SIGNAL AKTIF!"
    );

    setTimeout(() => {

      alert(
        "🚁 RESCUED!\n\n" +
        "Sinyal berhasil dikirim.\n" +
        "Kamu sekarang bebas menjelajahi Valen Island."
      );

    },800);

  }

}

/* =========================
   AUTOSAVE
========================= */

let autoSaveTimer = 0;

function updateAutosave(dt){

  autoSaveTimer += dt;

  if(autoSaveTimer > 30){

    autoSaveTimer = 0;

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(save)
    );

  }

}

window.addEventListener(
  "beforeunload",
  saveGame
);

document.addEventListener(
  "visibilitychange",
  () => {

    if(
      document.hidden
    ){

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(save)
      );

    }

  }
);

/* =========================
   RESIZE
========================= */

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      innerWidth /
      innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      innerWidth,
      innerHeight
    );

  }
);

/* =========================
   ORIENTATION
========================= */

const orientation =
  document.createElement(
    "div"
  );

orientation.style.cssText = `
 position:fixed;
 inset:0;
 z-index:999;
 display:none;
 align-items:center;
 justify-content:center;
 background:#071923;
 color:white;
 font:bold 22px Arial;
 text-align:center;
`;

orientation.textContent =
  "🔄 PUTAR HP KE LANDSCAPE";

document.body.appendChild(
  orientation
);

function checkOrientation(){

  const portrait =
    innerHeight > innerWidth;

  orientation.style.display =
    portrait ? "flex" : "none";

}

window.addEventListener(
  "resize",
  checkOrientation
);

checkOrientation();

/* =========================
   MAIN LOOP
========================= */

let lastTime =
  performance.now();

function gameLoop(now){

  requestAnimationFrame(
    gameLoop
  );

  let dt =
    (now - lastTime) / 1000;

  lastTime = now;

  dt =
    Math.min(
      dt,
      .05
    );

  if(
    menu.style.display === "flex"
  ){

    updateCamera();
    renderer.render(
      scene,
      camera
    );

    return;

  }

  keyboardControl();

  updatePlayer(dt);
  updateCamera();

  updateSurvival(dt);
  updateTime(dt);
  updateWeather(dt);
  updateAnimals(dt);
  respawnResources(dt);
  updateAutosave(dt);

  updateQuest();
  checkEnding();

  animateObjects();

  renderer.render(
    scene,
    camera
  );

}

/* =========================
   START
========================= */

updateHUD();

beacon =
  createBeacon();

requestAnimationFrame(
  gameLoop
);

toast(
  "🏝️ Selamat datang di Valen Island!"
);

})();
