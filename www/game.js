/* ============================================================
   VALEN ISLAND SURVIVAL — FINAL SINGLE PLAYER
   Stable Android / Three.js / Touch controls / Landscape
   ============================================================ */

(function () {
  "use strict";

  if (window.__VALEN_FINAL__) return;
  window.__VALEN_FINAL__ = true;

  /* ---------- HELPERS ---------- */

  const $ = id => document.getElementById(id);

  const clamp = (v, a, b) =>
    Math.max(a, Math.min(b, v));

  const lerp = (a, b, t) =>
    a + (b - a) * t;

  const rnd = (a, b) =>
    a + Math.random() * (b - a);

  const rndi = (a, b) =>
    Math.floor(rnd(a, b + 1));

  const distance = (a, b) => {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  };

  /* ---------- SAVE ---------- */

  const SAVE_KEY = "VALEN_ISLAND_SURVIVAL_FINAL";

  let save = {
    version: 1,

    x: 0,
    z: 0,

    health: 100,
    hunger: 100,
    thirst: 100,
    stamina: 100,

    wood: 0,
    stone: 0,
    berry: 2,
    coconut: 0,
    fish: 0,
    cookedFish: 0,

    day: 1,
    time: 8,

    weather: "clear",

    quest: 0,
    chapter: 1,

    crystal: 0,
    beacon: 0,

    campfire: 0,
    shelter: 0,
    storage: 0,

    achievements: [],

    settings: {
      sensitivity: 0.006,
      invertY: false,

      joystickSize: 1,
      buttonSize: 1,

      graphics: "High",
      fps: 60,
      shadow: true,
      effects: true,
      viewDistance: 180,
      antiAlias: true,
      batterySaver: false,

      master: 80,
      music: 20,
      sfx: 80,
      ambient: 70,
      mute: false,

      hud: true,
      damageNumbers: true,
      cameraShake: true,
      autoPickup: false,
      vibration: true,

      language: "id"
    }
  };

  function loadGame() {

    try {

      const raw =
        localStorage.getItem(SAVE_KEY);

      if (!raw) return;

      const data =
        JSON.parse(raw);

      save = Object.assign(
        save,
        data
      );

      save.settings =
        Object.assign(
          {
            sensitivity: 0.006,
            invertY: false,

            joystickSize: 1,
            buttonSize: 1,

            graphics: "High",
            fps: 60,
            shadow: true,
            effects: true,
            viewDistance: 180,
            antiAlias: true,
            batterySaver: false,

            master: 80,
            music: 20,
            sfx: 80,
            ambient: 70,
            mute: false,

            hud: true,
            damageNumbers: true,
            cameraShake: true,
            autoPickup: false,
            vibration: true,

            language: "id"
          },
          data.settings || {}
        );

    } catch (e) {

      console.warn(
        "VALEN SAVE LOAD ERROR",
        e
      );

    }

  }

  function saveGame() {

    try {

      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(save)
      );

    } catch (e) {

      console.warn(
        "VALEN SAVE ERROR",
        e
      );

    }

  }

  loadGame();

  window.saveGame = saveGame;

  /* ---------- AUDIO ---------- */

  let audioCtx = null;

  function audioReady() {

    if (!audioCtx) {

      try {

        audioCtx =
          new (
            window.AudioContext ||
            window.webkitAudioContext
          )();

      } catch (e) {

        return false;

      }

    }

    if (
      audioCtx.state ===
      "suspended"
    ) {

      audioCtx
        .resume()
        .catch(() => {});

    }

    return true;
  }

  function beep(
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.05
  ) {

    if (
      save.settings.mute ||
      save.settings.sfx <= 0 ||
      !audioReady()
    ) return;

    try {

      const oscillator =
        audioCtx.createOscillator();

      const gain =
        audioCtx.createGain();

      oscillator.type = type;

      oscillator.frequency.value =
        frequency;

      gain.gain.value =
        volume *
        (save.settings.sfx / 100) *
        (save.settings.master / 100);

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + duration
      );

      oscillator.connect(gain);

      gain.connect(
        audioCtx.destination
      );

      oscillator.start();

      oscillator.stop(
        audioCtx.currentTime +
        duration
      );

    } catch (e) {}

  }

  function sfx(name) {

    if (name === "pickup") {

      beep(
        650,
        0.06,
        "triangle",
        0.07
      );

      beep(
        900,
        0.08,
        "triangle",
        0.05
      );

    }

    else if (name === "hit") {

      beep(
        90,
        0.10,
        "sawtooth",
        0.08
      );

    }

    else if (name === "jump") {

      beep(
        360,
        0.10,
        "sine",
        0.05
      );

    }

    else if (name === "fish") {

      beep(
        500,
        0.08,
        "triangle",
        0.07
      );

      beep(
        800,
        0.12,
        "triangle",
        0.06
      );

    }

    else if (name === "craft") {

      beep(
        300,
        0.08,
        "square",
        0.04
      );

      beep(
        500,
        0.12,
        "square",
        0.04
      );

    }

    else if (name === "build") {

      beep(
        180,
        0.08,
        "square",
        0.04
      );

      beep(
        280,
        0.12,
        "square",
        0.05
      );

    }

    else if (name === "error") {

      beep(
        120,
        0.18,
        "sawtooth",
        0.04
      );

    }

    else {

      beep(440, 0.06);

    }

  }

  /* ---------- UI ---------- */

  const ui =
    document.createElement("div");

  ui.id = "valenUI";

  ui.innerHTML = `

<style>

#valenUI {
  position:fixed;
  inset:0;
  z-index:10;
  pointer-events:none;
  color:#fff;
  font-family:Arial,sans-serif;
  text-shadow:0 2px 3px #000;
}

#top {
  position:absolute;
  left:14px;
  top:12px;
  display:flex;
  gap:8px;
  align-items:flex-start;
}

#bars {
  width:205px;
  background:rgba(0,0,0,.42);
  border:1px solid rgba(255,255,255,.18);
  border-radius:12px;
  padding:8px;
  backdrop-filter:blur(5px);
}

.bar {
  height:12px;
  background:rgba(255,255,255,.12);
  border-radius:8px;
  margin:4px 0;
  overflow:hidden;
  position:relative;
}

.fill {
  height:100%;
  width:100%;
  transition:width .15s;
}

#hp {
  background:#e74c3c;
}

#hun {
  background:#f1c40f;
}

#thr {
  background:#3498db;
}

#sta {
  background:#2ecc71;
}

.lbl {
  position:absolute;
  left:5px;
  top:-1px;
  font-size:9px;
  font-weight:bold;
}

#info {
  font-size:12px;
  line-height:1.35;
  background:rgba(0,0,0,.42);
  padding:8px 10px;
  border-radius:10px;
}

#minimap {
  position:absolute;
  right:14px;
  top:12px;
  width:130px;
  height:130px;
  border:2px solid rgba(255,255,255,.5);
  border-radius:50%;
  background:rgba(0,35,45,.7);
  box-shadow:0 4px 20px #0008;
}

#miniCanvas {
  width:100%;
  height:100%;
  border-radius:50%;
}

#toast {
  position:absolute;
  left:50%;
  top:16%;
  transform:translateX(-50%);
  background:rgba(0,0,0,.7);
  padding:10px 18px;
  border-radius:14px;
  font-weight:bold;
  font-size:15px;
  opacity:0;
  transition:opacity .2s;
  white-space:nowrap;
}

#quest {
  position:absolute;
  left:14px;
  top:155px;
  background:rgba(0,0,0,.4);
  border-radius:10px;
  padding:8px 11px;
  font-size:12px;
  max-width:260px;
}

#joystick {
  position:absolute;
  left:24px;
  bottom:24px;
  width:145px;
  height:145px;
  border-radius:50%;
  background:rgba(255,255,255,.08);
  border:2px solid rgba(255,255,255,.22);
  pointer-events:auto;
  touch-action:none;
}

#stick {
  position:absolute;
  left:50%;
  top:50%;
  width:62px;
  height:62px;
  margin:-31px;
  border-radius:50%;
  background:rgba(255,255,255,.25);
  border:2px solid rgba(255,255,255,.45);
}

#actions {
  position:absolute;
  right:25px;
  bottom:25px;
  width:245px;
  height:190px;
  pointer-events:none;
}

.ab {
  position:absolute;
  width:66px;
  height:66px;
  border-radius:50%;
  border:2px solid rgba(255,255,255,.35);
  background:rgba(10,20,30,.55);
  color:#fff;
  font-size:23px;
  font-weight:bold;
  pointer-events:auto;
  touch-action:none;
  box-shadow:0 4px 12px #0007;
}

#run {
  right:76px;
  bottom:90px;
}

#jump {
  right:0;
  bottom:40px;
}

#act {
  right:76px;
  bottom:0;
}

#menu {
  right:0;
  top:0;
}

#panel {
  display:none;
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  width:min(92vw,600px);
  max-height:88vh;
  overflow:auto;
  background:rgba(7,16,23,.96);
  border:1px solid #ffffff33;
  border-radius:18px;
  padding:18px;
  pointer-events:auto;
  box-shadow:0 20px 70px #000;
}

#panel h2 {
  margin:0 0 10px;
}

#panel h3 {
  margin:16px 0 6px;
}

.row {
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
  padding:7px 0;
  border-bottom:1px solid #ffffff12;
}

.row input,
.row select {
  max-width:55%;
}

.pbtn {
  padding:9px 13px;
  border:0;
  border-radius:10px;
  background:#1e88e5;
  color:#fff;
  font-weight:bold;
  margin:4px;
  pointer-events:auto;
}

#cross {
  position:absolute;
  left:50%;
  top:50%;
  width:20px;
  height:20px;
  transform:translate(-50%,-50%);
  opacity:.65;
}

#cross:before,
#cross:after {
  content:"";
  position:absolute;
  background:#fff;
}

#cross:before {
  width:20px;
  height:2px;
  top:9px;
}

#cross:after {
  height:20px;
  width:2px;
  left:9px;
}

@media(max-width:700px) {

  #bars {
    width:170px;
  }

  #minimap {
    width:105px;
    height:105px;
  }

  #quest {
    top:140px;
  }

  .ab {
    width:60px;
    height:60px;
  }

  #actions {
    width:220px;
  }

}

</style>

<div id="top">

  <div id="bars">

    <div class="bar">
      <div id="hp" class="fill"></div>
      <span class="lbl">❤️ HP</span>
    </div>

    <div class="bar">
      <div id="hun" class="fill"></div>
      <span class="lbl">🍖 LAPAR</span>
    </div>

    <div class="bar">
      <div id="thr" class="fill"></div>
      <span class="lbl">💧 HAUS</span>
    </div>

    <div class="bar">
      <div id="sta" class="fill"></div>
      <span class="lbl">⚡ STAMINA</span>
    </div>

  </div>

  <div id="info"></div>

</div>

<div id="quest">
  📜 Memulai...
</div>

<div id="minimap">
  <canvas
    id="miniCanvas"
    width="130"
    height="130">
  </canvas>
</div>

<div id="toast"></div>

<div id="cross"></div>

<div id="joystick">
  <div id="stick"></div>
</div>

<div id="actions">

  <button class="ab" id="run">
    🏃
  </button>

  <button class="ab" id="jump">
    ⬆
  </button>

  <button class="ab" id="act">
    ✋
  </button>

  <button class="ab" id="menu">
    ☰
  </button>

</div>

<div id="panel"></div>
`;

  document.body.appendChild(ui);

  let toastTimer;

  function toast(text) {

    const el = $("toast");

    el.textContent = text;

    el.style.opacity = "1";

    clearTimeout(toastTimer);

    toastTimer =
      setTimeout(
        () => {
          el.style.opacity = "0";
        },
        1800
      );

  }

  /* ---------- THREE.JS CHECK ---------- */

  if (
    typeof THREE ===
    "undefined"
  ) {

    toast(
      "Three.js gagal dimuat. Cek koneksi internet."
    );

    return;

  }

  /* ---------- SCENE ---------- */

  const scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(
      0x7fc9e8
    );

  scene.fog =
    new THREE.Fog(
      0x7fc9e8,
      80,
      save.settings.viewDistance
    );

  const camera =
    new THREE.PerspectiveCamera(
      62,
      innerWidth / innerHeight,
      0.1,
      save.settings.viewDistance
    );

  camera.position.set(
    0,
    7,
    12
  );

  const renderer =
    new THREE.WebGLRenderer({
      antialias:
        save.settings.antiAlias !== false,

      powerPreference:
        save.settings.batterySaver
          ? "low-power"
          : "high-performance"
    });

  renderer.setPixelRatio(
    Math.min(
      devicePixelRatio,
      save.settings.graphics === "Low"
        ? 1
        : save.settings.graphics === "Medium"
          ? 1.5
          : 2
    )
  );

  renderer.setSize(
    innerWidth,
    innerHeight,
    false
  );

  renderer.shadowMap.enabled =
    save.settings.shadow !== false &&
    save.settings.graphics !== "Low";

  renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure =
    1.05;

  renderer.style =
    "position:fixed;inset:0;z-index:-1";

  renderer.domElement.style.position =
    "fixed";

  renderer.domElement.style.inset =
    "0";

  renderer.domElement.style.zIndex =
    "-1";

  document.body.appendChild(
    renderer.domElement
  );

  /* ---------- LIGHT ---------- */

  const hemi =
    new THREE.HemisphereLight(
      0x9edfff,
      0x25452e,
      1.7
    );

  scene.add(hemi);

  const sun =
    new THREE.DirectionalLight(
      0xfff1cf,
      2.5
    );

  sun.position.set(
    80,
    120,
    40
  );

  sun.castShadow = true;

  sun.shadow.mapSize.set(
    1024,
    1024
  );

  sun.shadow.camera.left = -120;
  sun.shadow.camera.right = 120;
  sun.shadow.camera.top = 120;
  sun.shadow.camera.bottom = -120;

  scene.add(sun);

  /* ---------- WORLD ---------- */

  const WORLD = 300;
  const BEACH = 240;

  const ocean =
    new THREE.Mesh(
      new THREE.PlaneGeometry(
        1000,
        1000,
        80,
        80
      ),
      new THREE.MeshPhongMaterial({
        color:0x0b9bc0,
        transparent:true,
        opacity:.82,
        shininess:100
      })
    );

  ocean.rotation.x =
    -Math.PI / 2;

  ocean.position.y =
    -.7;

  scene.add(ocean);

  const island =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        BEACH,
        BEACH * 1.02,
        5,
        96,
        3
      ),
      new THREE.MeshStandardMaterial({
        color:0x4d9b42,
        roughness:.9
      })
    );

  island.position.y =
    -2.7;

  island.receiveShadow =
    true;

  scene.add(island);

  const sand =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        BEACH * 1.02,
        BEACH * 1.03,
        1.3,
        96
      ),
      new THREE.MeshStandardMaterial({
        color:0xd8c078,
        roughness:1
      })
    );

  sand.position.y =
    -.35;

  sand.receiveShadow =
    true;

  scene.add(sand);

  const inner =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        190,
        205,
        2.5,
        80
      ),
      new THREE.MeshStandardMaterial({
        color:0x2f873e,
        roughness:1
      })
    );

  inner.position.y =
    .35;

  inner.receiveShadow =
    true;

  scene.add(inner);

  const mountain =
    new THREE.Mesh(
      new THREE.ConeGeometry(
        65,
        52,
        48
      ),
      new THREE.MeshStandardMaterial({
        color:0x315c35,
        roughness:1
      })
    );

  mountain.position.set(
    -45,
    25,
    -45
  );

  mountain.castShadow =
    true;

  scene.add(mountain);
'''
print("BAGIAN 1/4 siap. Lanjut BAGIAN 2/4 setelah ini.")
     /* ---------- PLANTS / RESOURCES ---------- */

  const trees = [];
  const rocks = [];
  const berries = [];
  const coconuts = [];

  function createTree(x, z, height) {

    const group =
      new THREE.Group();

    const trunk =
      new THREE.Mesh(
        new THREE.CylinderGeometry(
          .45,
          .65,
          height,
          8
        ),
        new THREE.MeshStandardMaterial({
          color:0x70472a,
          roughness:1
        })
      );

    trunk.position.y =
      height / 2;

    trunk.castShadow = true;

    group.add(trunk);

    const leaves =
      new THREE.Group();

    for (
      let i = 0;
      i < 7;
      i++
    ) {

      const leaf =
        new THREE.Mesh(
          new THREE.ConeGeometry(
            .65,
            5,
            6
          ),
          new THREE.MeshStandardMaterial({
            color:0x1f7e3b,
            roughness:.8
          })
        );

      leaf.rotation.z =
        Math.PI / 2;

      leaf.rotation.y =
        i * Math.PI * 2 / 7;

      leaf.position.y =
        height + .15;

      leaf.position.x =
        Math.cos(
          i * Math.PI * 2 / 7
        ) * 2.1;

      leaf.position.z =
        Math.sin(
          i * Math.PI * 2 / 7
        ) * 2.1;

      leaf.castShadow = true;

      leaves.add(leaf);

    }

    group.add(leaves);

    group.position.set(
      x,
      0,
      z
    );

    group.userData = {
      type:"tree",
      hp:3,
      phase:Math.random()*10
    };

    scene.add(group);

    trees.push(group);

    return group;
  }

  function createRock(x, z) {

    const rock =
      new THREE.Mesh(
        new THREE.DodecahedronGeometry(
          rnd(1,2),
          1
        ),
        new THREE.MeshStandardMaterial({
          color:0x69757a,
          roughness:1
        })
      );

    rock.position.set(
      x,
      rnd(.4,.9),
      z
    );

    rock.scale.y = .65;

    rock.castShadow = true;
    rock.receiveShadow = true;

    rock.userData = {
      type:"rock",
      hp:3
    };

    scene.add(rock);

    rocks.push(rock);

    return rock;
  }

  function createBerryBush(x,z) {

    const group =
      new THREE.Group();

    const bush =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1.15,
          10,
          8
        ),
        new THREE.MeshStandardMaterial({
          color:0x267c39
        })
      );

    bush.position.y = 1;

    group.add(bush);

    for (
      let i=0;
      i<5;
      i++
    ) {

      const berry =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            .15,
            7,
            6
          ),
          new THREE.MeshStandardMaterial({
            color:0xc73561
          })
        );

      berry.position.set(
        rnd(-.8,.8),
        rnd(.7,1.4),
        rnd(-.8,.8)
      );

      group.add(berry);

    }

    group.position.set(
      x,
      0,
      z
    );

    group.userData = {
      type:"berry",
      used:false
    };

    scene.add(group);

    berries.push(group);

    return group;
  }

  function createCoconut(x,z) {

    const coconut =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .35,
          10,
          8
        ),
        new THREE.MeshStandardMaterial({
          color:0x6b4726
        })
      );

    coconut.position.set(
      x,
      .5,
      z
    );

    coconut.userData = {
      type:"coconut",
      used:false
    };

    scene.add(coconut);

    coconuts.push(coconut);

    return coconut;
  }

  /* ---------- GENERATE RESOURCES ---------- */

  for (
    let i=0;
    i<170;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI * 2;

    const radius =
      Math.sqrt(
        Math.random()
      ) * 210;

    const x =
      Math.cos(angle) * radius;

    const z =
      Math.sin(angle) * radius;

    if (
      Math.hypot(
        x + 45,
        z + 45
      ) < 75
    ) {
      continue;
    }

    createTree(
      x,
      z,
      rnd(4,7)
    );

  }

  for (
    let i=0;
    i<120;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI * 2;

    const radius =
      Math.sqrt(
        Math.random()
      ) * 220;

    createRock(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );

  }

  for (
    let i=0;
    i<55;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI * 2;

    const radius =
      Math.sqrt(
        Math.random()
      ) * 200;

    createBerryBush(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );

  }

  for (
    let i=0;
    i<40;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI * 2;

    const radius =
      Math.sqrt(
        Math.random()
      ) * 205;

    createCoconut(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );

  }

  /* ---------- RUINS ---------- */

  const ruins =
    new THREE.Group();

  for (
    let i=0;
    i<14;
    i++
  ) {

    const pillar =
      new THREE.Mesh(
        new THREE.BoxGeometry(
          rnd(2,4),
          rnd(2,6),
          rnd(1,3)
        ),
        new THREE.MeshStandardMaterial({
          color:0x77736a,
          roughness:1
        })
      );

    const angle =
      i / 14 *
      Math.PI * 2;

    const radius =
      105 +
      rnd(-12,12);

    pillar.position.set(
      Math.cos(angle) * radius,
      rnd(1,3),
      Math.sin(angle) * radius
    );

    pillar.rotation.y =
      rnd(0,Math.PI);

    pillar.castShadow = true;

    ruins.add(pillar);

  }

  scene.add(ruins);

  /* ---------- MYSTERY CRYSTAL ---------- */

  const crystal =
    new THREE.Mesh(
      new THREE.OctahedronGeometry(
        2.3
      ),
      new THREE.MeshStandardMaterial({
        color:0x5ee7ff,
        emissive:0x176a88,
        emissiveIntensity:1.5,
        roughness:.2,
        metalness:.3
      })
    );

  crystal.position.set(
    0,
    2,
    135
  );

  crystal.userData.type =
    "crystal";

  scene.add(crystal);

  /* ---------- RESCUE BEACON ---------- */

  const beacon =
    new THREE.Group();

  const beaconPole =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        .4,
        .5,
        7,
        10
      ),
      new THREE.MeshStandardMaterial({
        color:0x555b61,
        metalness:.7
      })
    );

  beaconPole.position.y =
    3.5;

  beacon.add(beaconPole);

  const beaconLamp =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.2,
        16,
        12
      ),
      new THREE.MeshBasicMaterial({
        color:0xff3b3b
      })
    );

  beaconLamp.position.y =
    7.3;

  beacon.add(beaconLamp);

  beacon.position.set(
    0,
    0,
    160
  );

  beacon.visible = false;

  scene.add(beacon);

  /* ---------- PLAYER ---------- */

  const player =
    new THREE.Group();

  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        .65,
        1.4,
        6,
        12
      ),
      new THREE.MeshStandardMaterial({
        color:0x315edb,
        roughness:.8
      })
    );

  body.position.y =
    1.5;

  body.castShadow = true;

  player.add(body);

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .52,
        16,
        12
      ),
      new THREE.MeshStandardMaterial({
        color:0xd39a70,
        roughness:.9
      })
    );

  head.position.y =
    2.65;

  head.castShadow = true;

  player.add(head);

  const backpack =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        .75,
        .9,
        .35
      ),
      new THREE.MeshStandardMaterial({
        color:0x513a24
      })
    );

  backpack.position.set(
    0,
    1.45,
    .52
  );

  backpack.castShadow = true;

  player.add(backpack);

  player.position.set(
    save.x,
    0,
    save.z
  );

  scene.add(player);

  /* ---------- ANIMALS ---------- */

  const animals = [];

  function createAnimal(
    x,
    z,
    type
  ) {

    const group =
      new THREE.Group();

    let color;

    if (
      type === "boar"
    ) {
      color = 0x503426;
    }
    else if (
      type === "crab"
    ) {
      color = 0xc45137;
    }
    else {
      color = 0x9b8a58;
    }

    const animalBody =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1,
          12,
          8
        ),
        new THREE.MeshStandardMaterial({
          color:color,
          roughness:1
        })
      );

    animalBody.scale.set(
      1.35,
      .75,
      .85
    );

    animalBody.position.y =
      .8;

    animalBody.castShadow = true;

    group.add(
      animalBody
    );

    const animalHead =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          .55,
          12,
          8
        ),
        new THREE.MeshStandardMaterial({
          color:color
        })
      );

    animalHead.position.set(
      1,
      .95,
      0
    );

    group.add(
      animalHead
    );

    group.position.set(
      x,
      0,
      z
    );

    group.userData = {
      type:"animal",
      animalType:type,
      hp:20,
      phase:Math.random()*10
    };

    scene.add(group);

    animals.push(group);

  }

  for (
    let i=0;
    i<18;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI * 2;

    const radius =
      rnd(30,190);

    createAnimal(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      Math.random() < .5
        ? "boar"
        : "deer"
    );

  }

  /* ---------- RAIN ---------- */

  const rain =
    new THREE.Group();

  const rainMaterial =
    new THREE.LineBasicMaterial({
      color:0xbde8ff,
      transparent:true,
      opacity:.5
    });

  for (
    let i=0;
    i<260;
    i++
  ) {

    const geometry =
      new THREE.BufferGeometry()
        .setFromPoints([
          new THREE.Vector3(
            0,0,0
          ),
          new THREE.Vector3(
            0,-2.5,0
          )
        ]);

    const line =
      new THREE.Line(
        geometry,
        rainMaterial
      );

    line.position.set(
      rnd(-120,120),
      rnd(5,70),
      rnd(-120,120)
    );

    rain.add(line);

  }

  rain.visible = false;

  scene.add(rain);

  /* ---------- TOUCH INPUT ---------- */

  let joyX = 0;
  let joyY = 0;

  let runHeld = false;
  let paused = false;

  let joyPointer = null;

  const joystick =
    $("joystick");

  const stick =
    $("stick");

  function moveJoystick(e) {

    const rect =
      joystick.getBoundingClientRect();

    let x =
      e.clientX -
      (
        rect.left +
        rect.width / 2
      );

    let y =
      e.clientY -
      (
        rect.top +
        rect.height / 2
      );

    const max =
      rect.width * .38;

    const length =
      Math.hypot(x,y);

    if (
      length > max
    ) {

      x =
        x / length * max;

      y =
        y / length * max;

    }

    joyX =
      x / max;

    joyY =
      y / max;

    stick.style.transform =
      `translate(${x}px,${y}px)`;

  }

  joystick.addEventListener(
    "pointerdown",
    e => {

      e.preventDefault();

      audioReady();

      joyPointer =
        e.pointerId;

      joystick.setPointerCapture(
        e.pointerId
      );

      moveJoystick(e);

    }
  );

  joystick.addEventListener(
    "pointermove",
    e => {

      if (
        e.pointerId ===
        joyPointer
      ) {

        moveJoystick(e);

      }

    }
  );

  function endJoystick(e) {

    if (
      e.pointerId !==
      joyPointer
    ) return;

    joyPointer = null;

    joyX = 0;
    joyY = 0;

    stick.style.transform =
      "translate(0,0)";

  }

  joystick.addEventListener(
    "pointerup",
    endJoystick
  );

  joystick.addEventListener(
    "pointercancel",
    endJoystick
  );

  /* ---------- BUTTONS ---------- */

  $("run").addEventListener(
    "pointerdown",
    e => {

      e.preventDefault();

      audioReady();

      runHeld = true;

    }
  );

  [
    "pointerup",
    "pointercancel",
    "pointerleave"
  ].forEach(
    eventName => {

      $("run").addEventListener(
        eventName,
        () => {
          runHeld = false;
        }
      );

    }
  );

  $("jump").addEventListener(
    "pointerdown",
    e => {

      e.preventDefault();

      audioReady();

      jump();

    }
  );

  $("act").addEventListener(
    "pointerdown",
    e => {

      e.preventDefault();

      audioReady();

      action();

    }
  );

  $("menu").addEventListener(
    "pointerdown",
    e => {

      e.preventDefault();

      audioReady();

      openMenu();

    }
  );

  /* ---------- CAMERA TOUCH ---------- */

  let cameraYaw = 0;
  let cameraPitch = .48;

  let cameraPointer = null;

  let lastCameraX = 0;
  let lastCameraY = 0;

  renderer.domElement.addEventListener(
    "pointerdown",
    e => {

      if (
        e.clientX <
        innerWidth * .42
      ) return;

      if (paused) return;

      cameraPointer =
        e.pointerId;

      lastCameraX =
        e.clientX;

      lastCameraY =
        e.clientY;

      renderer.domElement.setPointerCapture(
        e.pointerId
      );

    }
  );

  renderer.domElement.addEventListener(
    "pointermove",
    e => {

      if (
        e.pointerId !==
        cameraPointer
      ) return;

      const dx =
        e.clientX -
        lastCameraX;

      const dy =
        e.clientY -
        lastCameraY;

      lastCameraX =
        e.clientX;

      lastCameraY =
        e.clientY;

      cameraYaw -=
        dx *
        save.settings.sensitivity;

      const invert =
        save.settings.invertY
          ? 1
          : -1;

      cameraPitch +=
        dy *
        save.settings.sensitivity *
        invert;

      cameraPitch =
        clamp(
          cameraPitch,
          .12,
          1.05
        );

    }
  );

  [
    "pointerup",
    "pointercancel"
  ].forEach(
    eventName => {

      renderer.domElement.addEventListener(
        eventName,
        e => {

          if (
            e.pointerId ===
            cameraPointer
          ) {

            cameraPointer =
              null;

          }

        }
      );

    }
  );
   /* =========================
   CAMERA POINTER END
========================= */

renderer.domElement.addEventListener("pointerup", e => {
  cameraDragging = false;
  try { renderer.domElement.releasePointerCapture(e.pointerId); } catch (_) {}
});

renderer.domElement.addEventListener("pointercancel", () => {
  cameraDragging = false;
});

renderer.domElement.addEventListener("pointerleave", () => {
  cameraDragging = false;
});

/* =========================
   GAME STATE
========================= */

let gameOver = false;
let paused = false;
let ending = false;
let lastTime = performance.now();

let stats = {
  hunger: 100,
  thirst: 100,
  health: 100,
  stamina: 100,

  wood: 0,
  stone: 0,
  berries: 0,
  coconut: 0,
  fish: 0,
  cookedFish: 0,

  day: 1,
  kills: 0,
  trees: 0,
  rocks: 0,
  fishCaught: 0,

  chapter: 1,
  beaconBuilt: false,
  endingSeen: false
};

let highScore = Number(localStorage.getItem("valen_highscore") || 0);
let score = 0;

const inventory = {
  wood: 0,
  stone: 0,
  berries: 0,
  coconut: 0,
  fish: 0,
  cookedFish: 0
};

/* =========================
   SAVE / LOAD
========================= */

function syncInventory() {
  stats.wood = inventory.wood;
  stats.stone = inventory.stone;
  stats.berries = inventory.berries;
  stats.coconut = inventory.coconut;
  stats.fish = inventory.fish;
  stats.cookedFish = inventory.cookedFish;
}

function saveGame() {
  syncInventory();

  const data = {
    stats,
    player: {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z
    },
    score,
    highScore,
    cameraYaw,
    cameraPitch
  };

  localStorage.setItem("valen_island_save", JSON.stringify(data));
  toast("GAME TERSIMPAN");
}

function loadGame() {
  const raw = localStorage.getItem("valen_island_save");

  if (!raw) {
    toast("BELUM ADA SAVE");
    return;
  }

  try {
    const data = JSON.parse(raw);

    if (data.stats) {
      Object.assign(stats, data.stats);
    }

    inventory.wood = stats.wood || 0;
    inventory.stone = stats.stone || 0;
    inventory.berries = stats.berries || 0;
    inventory.coconut = stats.coconut || 0;
    inventory.fish = stats.fish || 0;
    inventory.cookedFish = stats.cookedFish || 0;

    if (data.player) {
      player.position.set(
        Number(data.player.x) || 0,
        0,
        Number(data.player.z) || 0
      );
    }

    score = Number(data.score || 0);
    highScore = Math.max(highScore, Number(data.highScore || 0));

    if (typeof data.cameraYaw === "number") {
      cameraYaw = data.cameraYaw;
    }

    if (typeof data.cameraPitch === "number") {
      cameraPitch = data.cameraPitch;
    }

    updateUI();
    toast("SAVE DIMUAT");
  } catch (err) {
    console.error(err);
    toast("SAVE RUSAK");
  }
}

function resetSave() {
  localStorage.removeItem("valen_island_save");
  toast("SAVE DIHAPUS");
}

/* =========================
   AUTOSAVE
========================= */

setInterval(() => {
  if (!gameOver && !paused) {
    syncInventory();

    const data = {
      stats,
      player: {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
      },
      score,
      highScore,
      cameraYaw,
      cameraPitch
    };

    localStorage.setItem("valen_island_save", JSON.stringify(data));
  }
}, 15000);

/* =========================
   UI HELPERS
========================= */

function toast(message) {
  let el = document.getElementById("toast");

  if (!el) {
    el = document.createElement("div");
    el.id = "toast";

    Object.assign(el.style, {
      position: "fixed",
      left: "50%",
      top: "12%",
      transform: "translateX(-50%)",
      padding: "12px 20px",
      borderRadius: "14px",
      background: "rgba(0,0,0,.75)",
      color: "#fff",
      fontWeight: "800",
      fontSize: "15px",
      zIndex: "100",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity .2s"
    });

    document.body.appendChild(el);
  }

  el.textContent = message;
  el.style.opacity = "1";

  clearTimeout(el._timer);

  el._timer = setTimeout(() => {
    el.style.opacity = "0";
  }, 1600);
}

function flashDamage() {
  let flash = document.getElementById("damageFlash");

  if (!flash) {
    flash = document.createElement("div");
    flash.id = "damageFlash";

    Object.assign(flash.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(255,0,0,.18)",
      pointerEvents: "none",
      zIndex: "90",
      opacity: "0",
      transition: "opacity .12s"
    });

    document.body.appendChild(flash);
  }

  flash.style.opacity = "1";

  setTimeout(() => {
    flash.style.opacity = "0";
  }, 120);
}

/* =========================
   HUD
========================= */

const hud = document.createElement("div");

Object.assign(hud.style, {
  position: "fixed",
  left: "18px",
  top: "15px",
  zIndex: "20",
  color: "#fff",
  fontFamily: "Arial,sans-serif",
  pointerEvents: "none",
  textShadow: "0 2px 4px #000"
});

hud.innerHTML = `
  <div id="gameTitle"
       style="
       font-size:18px;
       font-weight:900;
       letter-spacing:1px;
       margin-bottom:8px;">
       VALEN ISLAND
  </div>

  <div id="statsPanel"
       style="
       width:230px;
       padding:10px;
       border-radius:14px;
       background:rgba(0,0,0,.42);
       backdrop-filter:blur(8px);">

    <div id="bars"></div>

    <div id="resources"
         style="
         margin-top:8px;
         font-size:13px;
         line-height:1.6;">
    </div>

    <div id="scoreText"
         style="
         margin-top:5px;
         font-size:13px;
         font-weight:bold;">
    </div>
  </div>
`;

document.body.appendChild(hud);

function bar(name, value, symbol) {
  const pct = Math.max(0, Math.min(100, value));

  return `
    <div style="
      display:flex;
      align-items:center;
      gap:6px;
      margin:4px 0;
    ">
      <span style="width:18px">${symbol}</span>

      <div style="
        flex:1;
        height:9px;
        border-radius:8px;
        background:rgba(255,255,255,.18);
        overflow:hidden;
      ">
        <div style="
          width:${pct}%;
          height:100%;
          border-radius:8px;
          background:rgba(255,255,255,.9);
        "></div>
      </div>

      <span style="
        width:34px;
        text-align:right;
        font-size:11px;
      ">${Math.round(pct)}</span>
    </div>
  `;
}

function updateUI() {
  const bars = document.getElementById("bars");
  const resources = document.getElementById("resources");
  const scoreText = document.getElementById("scoreText");

  if (!bars) return;

  bars.innerHTML =
    bar("Health", stats.health, "❤️") +
    bar("Hunger", stats.hunger, "🍖") +
    bar("Thirst", stats.thirst, "💧") +
    bar("Stamina", stats.stamina, "⚡");

  resources.innerHTML = `
    🪵 Kayu: ${inventory.wood}
    &nbsp; 🪨 Batu: ${inventory.stone}<br>

    🍓 Berry: ${inventory.berries}
    &nbsp; 🥥 Kelapa: ${inventory.coconut}<br>

    🐟 Ikan: ${inventory.fish}
    &nbsp; 🍳 Matang: ${inventory.cookedFish}
  `;

  scoreText.innerHTML =
    `⭐ Skor: ${Math.floor(score)} &nbsp; 🏆 High: ${Math.floor(highScore)}`;
}

/* =========================
   CHAPTER UI
========================= */

const questBox = document.createElement("div");

Object.assign(questBox.style, {
  position: "fixed",
  right: "18px",
  top: "18px",
  width: "250px",
  padding: "12px 14px",
  borderRadius: "15px",
  background: "rgba(0,0,0,.38)",
  color: "#fff",
  zIndex: "20",
  fontFamily: "Arial,sans-serif",
  pointerEvents: "none",
  backdropFilter: "blur(8px)",
  textShadow: "0 2px 3px #000"
});

questBox.innerHTML = `
  <div style="
    font-size:11px;
    opacity:.7;
    letter-spacing:1px;">
    CHAPTER
  </div>

  <div id="chapterName"
       style="
       font-size:17px;
       font-weight:900;
       margin-top:3px;">
  </div>

  <div id="questText"
       style="
       margin-top:6px;
       font-size:12px;
       line-height:1.5;">
  </div>
`;

document.body.appendChild(questBox);

const chapters = [
  {
    name: "Pantai Asing",
    quest: "Kumpulkan 10 kayu dan 5 batu."
  },
  {
    name: "Bertahan Hidup",
    quest: "Buat api unggun dan temukan makanan."
  },
  {
    name: "Jejak Misterius",
    quest: "Temukan reruntuhan kuno di pulau."
  },
  {
    name: "Kristal Pulau",
    quest: "Temukan kristal misterius."
  },
  {
    name: "Sinyal Penyelamatan",
    quest: "Aktifkan beacon untuk mengirim sinyal."
  }
];

function updateQuest() {
  const chapter = Math.max(
    1,
    Math.min(chapters.length, stats.chapter)
  );

  document.getElementById("chapterName").textContent =
    `${chapter} — ${chapters[chapter - 1].name}`;

  document.getElementById("questText").textContent =
    chapters[chapter - 1].quest;
}

/* =========================
   MINIMAP
========================= */

const minimap = document.createElement("canvas");

minimap.width = 180;
minimap.height = 180;

Object.assign(minimap.style, {
  position: "fixed",
  right: "18px",
  bottom: "18px",
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  border: "3px solid rgba(255,255,255,.75)",
  background: "rgba(0,40,50,.55)",
  zIndex: "20",
  pointerEvents: "none"
});

document.body.appendChild(minimap);

const mapCtx = minimap.getContext("2d");

function drawMinimap() {
  const w = minimap.width;
  const h = minimap.height;

  mapCtx.clearRect(0, 0, w, h);

  mapCtx.fillStyle = "#07566a";
  mapCtx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  const scale = 0.25;

  mapCtx.beginPath();

  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;

    const rr =
      ISLAND * scale *
      (0.93 + Math.sin(a * 3.0) * 0.04);

    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;

    if (i === 0) mapCtx.moveTo(x, y);
    else mapCtx.lineTo(x, y);
  }

  mapCtx.closePath();

  mapCtx.fillStyle = "#3e8f45";
  mapCtx.fill();

  mapCtx.strokeStyle = "#e2c27c";
  mapCtx.lineWidth = 5;
  mapCtx.stroke();

  // player
  mapCtx.save();

  mapCtx.translate(
    cx,
    cy
  );

  mapCtx.rotate(-cameraYaw);

  mapCtx.beginPath();
  mapCtx.moveTo(0, -10);
  mapCtx.lineTo(6, 7);
  mapCtx.lineTo(-6, 7);
  mapCtx.closePath();

  mapCtx.fillStyle = "#ffffff";
  mapCtx.fill();

  mapCtx.restore();

  // beacon
  if (stats.beaconBuilt || ending) {
    const bx = cx;
    const bz = cy - 160 * scale;

    mapCtx.beginPath();
    mapCtx.arc(bx, bz, 5, 0, Math.PI * 2);
    mapCtx.fillStyle = "#fff";
    mapCtx.fill();
  }
}

/* =========================
   INVENTORY ACTIONS
========================= */

function addResource(type, amount = 1) {
  if (!(type in inventory)) return;

  inventory[type] += amount;

  score += amount * 2;

  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem("valen_highscore", highScore);
  }

  updateUI();
}

function damagePlayer(amount) {
  if (gameOver) return;

  stats.health -= amount;

  if (stats.health < 0) {
    stats.health = 0;
  }

  flashDamage();

  shakeCamera(0.25);

  if (stats.health <= 0) {
    endGame();
  }

  updateUI();
}

function healPlayer(amount) {
  stats.health = Math.min(100, stats.health + amount);
  updateUI();
}

function eatBerry() {
  if (inventory.berries <= 0) {
    toast("BERRY HABIS");
    return;
  }

  inventory.berries--;

  stats.hunger = Math.min(
    100,
    stats.hunger + 15
  );

  healPlayer(3);

  toast("+ MAKANAN");

  updateUI();
}

function drinkCoconut() {
  if (inventory.coconut <= 0) {
    toast("KELAPA HABIS");
    return;
  }

  inventory.coconut--;

  stats.thirst = Math.min(
    100,
    stats.thirst + 25
  );

  toast("+ AIR KELAPA");

  updateUI();
}

function eatCookedFish() {
  if (inventory.cookedFish <= 0) {
    toast("IKAN MATANG HABIS");
    return;
  }

  inventory.cookedFish--;

  stats.hunger = Math.min(
    100,
    stats.hunger + 35
  );

  stats.health = Math.min(
    100,
    stats.health + 10
  );

  toast("+ IKAN MATANG");

  updateUI();
}

/* =========================
   GATHERING
========================= */

function getNearestObject(list, maxDistance) {
  let nearest = null;
  let nearestDistance = maxDistance;

  for (const item of list) {
    if (!item || !item.mesh) continue;

    const dx =
      item.mesh.position.x -
      player.position.x;

    const dz =
      item.mesh.position.z -
      player.position.z;

    const d = Math.sqrt(dx * dx + dz * dz);

    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = item;
    }
  }

  return nearest;
}

function gatherWood() {
  const target = getNearestObject(trees, 5);

  if (!target) {
    toast("DEKATI POHON");
    return;
  }

  if (target.dead) {
    toast("POHON SUDAH TUMBANG");
    return;
  }

  target.hp--;

  chopSound();

  shakeCamera(0.06);

  if (target.hp <= 0) {
    target.dead = true;

    target.mesh.rotation.z =
      (Math.random() > .5 ? 1 : -1) * 1.1;

    target.mesh.position.y = 1;

    addResource("wood", 4);

    stats.trees++;

    toast("+4 KAYU");

    setTimeout(() => {
      if (!target.mesh.parent) return;

      target.mesh.visible = true;
      target.mesh.rotation.z = 0;
      target.mesh.position.y = 0;
      target.dead = false;
      target.hp = 3;
    }, 30000);
  } else {
    addResource("wood", 1);
    toast("+1 KAYU");
  }
}

function gatherStone() {
  const target = getNearestObject(rocks, 5);

  if (!target) {
    toast("DEKATI BATU");
    return;
  }

  if (target.dead) return;

  target.hp--;

  stoneSound();

  if (target.hp <= 0) {
    target.dead = true;
    target.mesh.visible = false;

    addResource("stone", 3);

    stats.rocks++;

    toast("+3 BATU");

    setTimeout(() => {
      target.hp = 3;
      target.dead = false;
      target.mesh.visible = true;
    }, 30000);
  } else {
    addResource("stone", 1);
    toast("+1 BATU");
  }
}

function gatherBerry() {
  const target = getNearestObject(
    berryBushes,
    4
  );

  if (!target) {
    toast("CARI SEMAK BERRY");
    return;
  }

  if (target.cooldown) {
    toast("BELUM TUMBUH");
    return;
  }

  target.cooldown = true;

  target.mesh.visible = false;

  addResource("berries", 3);

  toast("+3 BERRY");

  setTimeout(() => {
    target.cooldown = false;
    target.mesh.visible = true;
  }, 20000);
}

function gatherCoconut() {
  const target = getNearestObject(
    coconuts,
    4
  );

  if (!target) {
    toast("CARI KELAPA");
    return;
  }

  if (target.cooldown) return;

  target.cooldown = true;
  target.mesh.visible = false;

  addResource("coconut", 1);

  toast("+1 KELAPA");

  setTimeout(() => {
    target.cooldown = false;
    target.mesh.visible = true;
  }, 25000);
}

/* =========================
   FISHING
========================= */

let fishingCooldown = false;

function fish() {
  if (fishingCooldown) return;

  const radius = Math.sqrt(
    player.position.x ** 2 +
    player.position.z ** 2
  );

  if (radius < BEACH * 0.72) {
    toast("PERGI KE TEPI PANTAI");
    return;
  }

  fishingCooldown = true;

  toast("🎣 MEMANCING...");

  fishingSound();

  setTimeout(() => {
    fishingCooldown = false;

    const chance = Math.random();

    if (chance < .58) {
      addResource("fish", 1);
      stats.fishCaught++;
      toast("🐟 IKAN TERTANGKAP!");
      return;
    }

    if (chance < .82) {
      addResource("fish", 2);
      stats.fishCaught += 2;
      toast("🐟🐟 DAPAT 2 IKAN!");
      return;
    }

    if (chance < .96) {
      addResource("fish", 3);
      stats.fishCaught += 3;
      toast("✨ IKAN LANGKA!");
      score += 50;
      return;
    }

    addResource("fish", 5);
    stats.fishCaught += 5;
    score += 100;
    toast("💎 IKAN LEGENDARIS!");
  }, 1800);
}

/* =========================
   CRAFTING
========================= */

function craftCampfire() {
  if (
    inventory.wood < 5 ||
    inventory.stone < 3
  ) {
    toast("BUTUH 5 KAYU + 3 BATU");
    return;
  }

  inventory.wood -= 5;
  inventory.stone -= 3;

  createCampfire(
    player.position.x,
    player.position.z
  );

  toast("🔥 API UNGGUN DIBUAT");

  if (stats.chapter === 1) {
    stats.chapter = 2;
    updateQuest();
  }

  updateUI();
}

function craftShelter() {
  if (
    inventory.wood < 12 ||
    inventory.stone < 6
  ) {
    toast("BUTUH 12 KAYU + 6 BATU");
    return;
  }

  inventory.wood -= 12;
  inventory.stone -= 6;

  createShelter(
    player.position.x,
    player.position.z
  );

  toast("🏕️ TEMPAT BERTEDUH DIBUAT");

  updateUI();
}

function cookFish() {
  if (inventory.fish <= 0) {
    toast("TIDAK ADA IKAN");
    return;
  }

  inventory.fish--;
  inventory.cookedFish++;

  toast("🍳 IKAN DIMASAK");

  updateUI();
}

/* =========================
   BUILDINGS
========================= */

const structures = [];

function createCampfire(x, z) {
  const g = new THREE.Group();

  for (let i = 0; i < 6; i++) {
    const log = new THREE.Mesh(
      new THREE.CylinderGeometry(
        .12,
        .12,
        1.1,
        8
      ),
      new THREE.MeshStandardMaterial({
        color: 0x6b3922
      })
    );

    log.rotation.z = Math.PI / 2;

    log.rotation.y =
      i * Math.PI / 3;

    g.add(log);
  }

  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(
      .42,
      .9,
      10
    ),
    new THREE.MeshBasicMaterial({
      color: 0xff7a00
    })
  );

  fire.position.y = .55;
  g.add(fire);

  const light = new THREE.PointLight(
    0xff8a22,
    2.2,
    10
  );

  light.position.y = 1.2;
  g.add(light);

  g.position.set(x, .15, z);

  world.add(g);

  structures.push({
    type: "campfire",
    group: g,
    fire,
    light
  });
}

function createShelter(x, z) {
  const g = new THREE.Group();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x76502d
  });

  const posts = [
    [-2, 1.4, -2],
    [2, 1.4, -2],
    [-2, 1.4, 2],
    [2, 1.4, 2]
  ];

  for (const p of posts) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(
        .12,
        .16,
        2.8,
        8
      ),
      mat
    );

    post.position.set(
      p[0],
      p[1],
      p[2]
    );

    g.add(post);
  }

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(
      5,
      .2,
      5
    ),
    new THREE.MeshStandardMaterial({
      color: 0x4b321d
    })
  );

  roof.position.y = 2.8;
  roof.rotation.z = .1;

  g.add(roof);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(
      4.6,
      .15,
      4.6
    ),
    new THREE.MeshStandardMaterial({
      color: 0x806039
    })
  );

  floor.position.y = .1;

  g.add(floor);

  g.position.set(x, 0, z);

  world.add(g);

  structures.push({
    type: "shelter",
    group: g
  });
}

/* =========================
   COOKING CHECK
========================= */

function nearestCampfire() {
  let best = null;
  let bestD = 6;

  for (const s of structures) {
    if (s.type !== "campfire") continue;

    const dx =
      s.group.position.x -
      player.position.x;

    const dz =
      s.group.position.z -
      player.position.z;

    const d = Math.hypot(dx, dz);

    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }

  return best;
}

/* =========================
   COMBAT
========================= */

let attackCooldown = false;

function attack() {
  if (attackCooldown || gameOver) return;

  attackCooldown = true;

  attackSound();

  const target = animals.find(a => {
    if (!a.alive) return false;

    const dx =
      a.mesh.position.x -
      player.position.x;

    const dz =
      a.mesh.position.z -
      player.position.z;

    return Math.hypot(dx, dz) < 4.5;
  });

  if (target) {
    target.hp -= 25;

    target.mesh.rotation.y += .4;

    toast(`HIT ${target.name}`);

    if (target.hp <= 0) {
      target.alive = false;

      target.mesh.rotation.x = -1.2;

      stats.kills++;

      score += 40;

      setTimeout(() => {
        target.mesh.visible = false;
      }, 500);
    }
  } else {
    toast("MISS");
  }

  setTimeout(() => {
    attackCooldown = false;
  }, 450);
}

/* =========================
   ANIMAL AI
========================= */

function updateAnimals(dt) {
  for (const a of animals) {
    if (!a.alive) continue;

    const dx =
      player.position.x -
      a.mesh.position.x;

    const dz =
      player.position.z -
      a.mesh.position.z;

    const d = Math.hypot(dx, dz);

    if (d < 18) {
      const speed =
        a.type === "boar" ? 2.4 : 1.4;

      a.mesh.position.x +=
        (dx / Math.max(d, .001)) *
        speed *
        dt;

      a.mesh.position.z +=
        (dz / Math.max(d, .001)) *
        speed *
        dt;

      a.mesh.lookAt(
        player.position.x,
        a.mesh.position.y,
        player.position.z
      );

      if (
        a.type === "boar" &&
        d < 2.4 &&
        Math.random() < dt * .8
      ) {
        damagePlayer(5);
      }
    } else {
      a.walkTime += dt;

      if (a.walkTime > 2 + Math.random() * 2) {
        a.walkTime = 0;

        a.dir =
          Math.random() *
          Math.PI * 2;
      }

      a.mesh.position.x +=
        Math.cos(a.dir) *
        dt *
        .45;

      a.mesh.position.z +=
        Math.sin(a.dir) *
        dt *
        .45;
    }

    const r = Math.hypot(
      a.mesh.position.x,
      a.mesh.position.z
    );

    if (r > ISLAND - 10) {
      a.mesh.position.x *= .98;
      a.mesh.position.z *= .98;
    }
  }
}

/* =========================
   PLAYER MOVEMENT
========================= */

function updatePlayer(dt) {
  if (gameOver || paused) return;

  let sx = joystickX;
  let sz = joystickY;

  const moving =
    Math.abs(sx) > .05 ||
    Math.abs(sz) > .05;

  if (moving) {
    let length =
      Math.hypot(sx, sz);

    if (length > 1) {
      sx /= length;
      sz /= length;
    }

    let speed =
      running ? 7.2 : 4.2;

    if (running && stats.stamina > 0) {
      stats.stamina -= dt * 13;
    } else if (running) {
      speed = 4.2;
      running = false;
    }

    const forward = new THREE.Vector3(
      Math.sin(cameraYaw),
      0,
      Math.cos(cameraYaw)
    );

    const right = new THREE.Vector3(
      Math.cos(cameraYaw),
      0,
      -Math.sin(cameraYaw)
    );

    const move = new THREE.Vector3();

    move.addScaledVector(
      right,
      sx * speed * dt
    );

    move.addScaledVector(
      forward,
      sz * speed * dt
    );

    player.position.add(move);

    player.rotation.y =
      Math.atan2(
        move.x,
        move.z
      );

    playerWalkTime += dt * (
      running ? 12 : 7
    );

    playerBody.position.y =
      Math.abs(
        Math.sin(playerWalkTime)
      ) * .08;
  } else {
    stats.stamina += dt * 8;

    playerBody.position.y =
      Math.sin(
        performance.now() * .002
      ) * .015;
  }

  stats.stamina = Math.max(
    0,
    Math.min(100, stats.stamina)
  );

  const r = Math.hypot(
    player.position.x,
    player.position.z
  );

  const limit = ISLAND - 8;

  if (r > limit) {
    player.position.x =
      (player.position.x / r) *
      limit;

    player.position.z =
      (player.position.z / r) *
      limit;
  }

  player.position.y = 0;
}

/* =========================
   CAMERA
========================= */

function updateCamera(dt) {
  const target = new THREE.Vector3(
    player.position.x,
    player.position.y + 1.1,
    player.position.z
  );

  const distance = 7.5;

  const horizontal =
    Math.cos(cameraPitch) *
    distance;

  camera.position.x =
    target.x +
    Math.sin(cameraYaw) *
    horizontal;

  camera.position.z =
    target.z +
    Math.cos(cameraYaw) *
    horizontal;

  camera.position.y =
    target.y +
    Math.sin(cameraPitch) *
    distance +
    1.2;

  camera.lookAt(target);

  if (cameraShake > 0) {
    camera.position.x +=
      (Math.random() - .5) *
      cameraShake;

    camera.position.y +=
      (Math.random() - .5) *
      cameraShake;

    camera.position.z +=
      (Math.random() - .5) *
      cameraShake;

    cameraShake *= .88;

    if (cameraShake < .01) {
      cameraShake = 0;
    }
  }
}

let cameraShake = 0;

function shakeCamera(amount) {
  cameraShake = Math.max(
    cameraShake,
    amount
  );
}

/* =========================
   SURVIVAL SYSTEM
========================= */

let survivalTimer = 0;

function updateSurvival(dt) {
  if (gameOver || paused) return;

  survivalTimer += dt;

  stats.hunger -= dt * .035;
  stats.thirst -= dt * .065;

  if (stats.hunger < 25) {
    stats.health -= dt * .12;
  }

  if (stats.thirst < 20) {
    stats.health -= dt * .2;
  }

  stats.hunger = Math.max(
    0,
    Math.min(100, stats.hunger)
  );

  stats.thirst = Math.max(
    0,
    Math.min(100, stats.thirst)
  );

  stats.health = Math.max(
    0,
    Math.min(100, stats.health)
  );

  score += dt * .5;

  if (score > highScore) {
    highScore = Math.floor(score);
  }

  if (stats.health <= 0) {
    endGame();
  }

  updateUI();
}

/* =========================
   DAY / NIGHT
========================= */

let worldTime = 7 * 60;

function updateDayNight(dt) {
  if (paused || gameOver) return;

  worldTime += dt * 1.5;

  if (worldTime >= 1440) {
    worldTime -= 1440;
    stats.day++;
    toast(`🌅 HARI ${stats.day}`);
  }

  const t =
    worldTime / 1440;

  const sunAngle =
    t * Math.PI * 2 -
    Math.PI / 2;

  sun.position.set(
    Math.cos(sunAngle) * 250,
    Math.sin(sunAngle) * 250,
    80
  );

  const daylight =
    Math.max(
      0.08,
      Math.sin(sunAngle)
    );

  sun.intensity =
    .15 +
    daylight * 1.15;

  hemi.intensity =
    .2 +
    daylight * .65;

  const night =
    daylight < .25;

  if (night) {
    scene.fog.near = 30;
    scene.fog.far = 180;
  } else {
    scene.fog.near = 90;
    scene.fog.far = 360;
  }

  const hour =
    Math.floor(worldTime / 60);

  const minute =
    Math.floor(worldTime % 60);

  const timeText =
    String(hour).padStart(2, "0") +
    ":" +
    String(minute).padStart(2, "0");

  let clock =
    document.getElementById("clockText");

  if (!clock) {
    clock = document.createElement("div");
    clock.id = "clockText";

    Object.assign(clock.style, {
      position: "fixed",
      left: "50%",
      top: "15px",
      transform: "translateX(-50%)",
      zIndex: "20",
      color: "#fff",
      fontWeight: "900",
      fontSize: "14px",
      textShadow: "0 2px 4px #000",
      pointerEvents: "none"
    });

    document.body.appendChild(clock);
  }

  clock.textContent =
    `DAY ${stats.day} • ${timeText}`;
}

/* =========================
   WEATHER
========================= */

let weatherTimer = 35;
let raining = false;

function setRain(state) {
  raining = state;

  rainGroup.visible = state;

  if (state) {
    toast("🌧️ HUJAN TURUN");
  } else {
    toast("☀️ HUJAN BERHENTI");
  }
}

function updateWeather(dt) {
  if (paused || gameOver) return;

  weatherTimer -= dt;

  if (weatherTimer <= 0) {
    weatherTimer =
      45 + Math.random() * 80;

    if (Math.random() < .45) {
      setRain(!raining);
    }
  }

  if (raining) {
    rainGroup.children.forEach(drop => {
      drop.position.y -=
        dt * 20;

      if (drop.position.y < 0) {
        drop.position.y =
          15 + Math.random() * 15;
      }
    });
  }
}

/* =========================
   OBJECT ANIMATION
========================= */

function animateWorld(dt) {
  const now =
    performance.now() * .001;

  for (const tree of trees) {
    if (!tree.mesh.visible) continue;

    tree.mesh.rotation.z =
      Math.sin(
        now * .7 +
        tree.phase
      ) * .025;

    tree.mesh.rotation.x =
      Math.cos(
        now * .5 +
        tree.phase
      ) * .018;
  }

  for (const b of berryBushes) {
    if (!b.mesh.visible) continue;

    b.mesh.scale.y =
      1 +
      Math.sin(
        now * 1.5 +
        b.phase
      ) * .025;
  }

  for (const c of coconuts) {
    if (!c.mesh.visible) continue;

    c.mesh.rotation.y +=
      dt * .3;
  }

  for (const s of structures) {
    if (s.type !== "campfire") continue;

    const flicker =
      1 +
      Math.sin(now * 15) * .15;

    s.fire.scale.set(
      flicker,
      flicker,
      flicker
    );

    s.light.intensity =
      1.8 +
      Math.sin(now * 12) * .5;
  }

  if (water) {
    water.material.map &&
      (water.material.map.offset.y +=
        dt * .015);

    water.rotation.z =
      Math.sin(now * .15) * .002;
  }
}

/* =========================
   QUEST PROGRESSION
========================= */

function checkProgress() {
  if (stats.chapter === 1) {
    if (
      inventory.wood >= 10 &&
      inventory.stone >= 5
    ) {
      stats.chapter = 2;
      toast("📖 CHAPTER 2 TERBUKA");
      updateQuest();
    }
  }

  if (
    stats.chapter === 2 &&
    structures.some(s => s.type === "campfire")
  ) {
    stats.chapter = 3;
    toast("📖 CHAPTER 3 TERBUKA");
    updateQuest();
  }

  if (
    stats.chapter === 3 &&
    player.position.distanceTo(
      ruins.position
    ) < 12
  ) {
    stats.chapter = 4;
    toast("🏛️ RERUNTUHAN DITEMUKAN");
    updateQuest();
  }

  if (
    stats.chapter === 4 &&
    player.position.distanceTo(
      crystal.position
    ) < 10
  ) {
    crystal.visible = false;
    stats.chapter = 5;
    toast("💎 KRISTAL DITEMUKAN");
    updateQuest();
  }

  if (
    stats.chapter === 5 &&
    player.position.distanceTo(
      beacon.position
    ) < 10
  ) {
    buildBeacon();
  }
}

/* =========================
   BEACON ENDING
========================= */

function buildBeacon() {
  if (stats.beaconBuilt) return;

  stats.beaconBuilt = true;
  beacon.visible = true;

  ending = true;

  toast("📡 SINYAL PENYELAMATAN AKTIF!");

  score += 1000;

  if (score > highScore) {
    highScore = Math.floor(score);
  }

  showEnding();
}

function showEnding() {
  const overlay =
    document.createElement("div");

  overlay.id = "endingOverlay";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "200",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,10,20,.86)",
    color: "#fff",
    fontFamily: "Arial,sans-serif",
    textAlign: "center",
    padding: "30px"
  });

  overlay.innerHTML = `
    <div style="
      max-width:600px;
      padding:30px;
      border-radius:24px;
      background:rgba(255,255,255,.08);
      backdrop-filter:blur(14px);
    ">

      <div style="
        font-size:48px;
        margin-bottom:12px;">
        📡
      </div>

      <div style="
        font-size:28px;
        font-weight:900;">
        SINYAL TERKIRIM
      </div>

      <p style="
        opacity:.8;
        line-height:1.7;">
        Setelah bertahan hidup di pulau,
        sinyal penyelamatan akhirnya berhasil
        dikirim.
      </p>

      <p style="
        font-size:18px;
        font-weight:800;">
        PULAU MASIH BISA DIEKSPLORASI.
      </p>

      <button id="continueFreeRoam"
        style="
          margin-top:15px;
          border:0;
          border-radius:14px;
          padding:14px 22px;
          font-weight:900;
          font-size:15px;">
        LANJUT FREE ROAM
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  document
    .getElementById("continueFreeRoam")
    .onclick = () => {
      overlay.remove();
      ending = false;
      toast("🌴 FREE ROAM AKTIF");
    };
}

/* =========================
   GAME OVER
========================= */

function endGame() {
  if (gameOver) return;

  gameOver = true;

  highScore =
    Math.max(
      highScore,
      Math.floor(score)
    );

  localStorage.setItem(
    "valen_highscore",
    highScore
  );

  const overlay =
    document.createElement("div");

  overlay.id = "gameOverOverlay";

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    zIndex: "250",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,.82)",
    color: "#fff",
    fontFamily: "Arial,sans-serif",
    textAlign: "center"
  });

  overlay.innerHTML = `
    <div style="
      padding:30px;
      width:min(90%,420px);
      border-radius:24px;
      background:rgba(255,255,255,.08);
      backdrop-filter:blur(12px);
    ">

      <div style="font-size:48px">
        💀
      </div>

      <div style="
        font-size:30px;
        font-weight:900;">
        GAME OVER
      </div>

      <div style="
        margin-top:10px;
        opacity:.8;">
        Skor: ${Math.floor(score)}
      </div>

      <div style="
        margin-top:4px;
        opacity:.8;">
        High Score: ${Math.floor(highScore)}
      </div>

      <button id="restartGame"
        style="
        margin-top:20px;
        padding:14px 24px;
        border:0;
        border-radius:14px;
        font-weight:900;">
        🔄 RESTART
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById(
    "restartGame"
  ).onclick = () => {
    location.reload();
  };
}

/* =========================
   MENU
========================= */

const menu = document.createElement("div");

menu.id = "gameMenu";

Object.assign(menu.style, {
  position: "fixed",
  inset: "0",
  zIndex: "180",
  display: "none",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,.72)",
  backdropFilter: "blur(8px)",
  fontFamily: "Arial,sans-serif"
});

menu.innerHTML = `
  <div style="
    width:min(90%,430px);
    padding:24px;
    border-radius:22px;
    background:rgba(10,25,32,.94);
    color:#fff;
    text-align:center;">

    <div style="
      font-size:26px;
      font-weight:900;
      margin-bottom:18px;">
      VALEN ISLAND
    </div>

    <button class="menuBtn" id="resumeBtn">
      ▶ LANJUT
    </button>

    <button class="menuBtn" id="saveBtn">
      💾 SAVE
    </button>

    <button class="menuBtn" id="loadBtn">
      📂 LOAD
    </button>

    <button class="menuBtn" id="eatBtn">
      🍓 MAKAN BERRY
    </button>

    <button class="menuBtn" id="drinkBtn">
      🥥 MINUM KELAPA
    </button>

    <button class="menuBtn" id="fishEatBtn">
      🍳 MAKAN IKAN MATANG
    </button>

    <button class="menuBtn" id="campfireBtn">
      🔥 CRAFT API
    </button>

    <button class="menuBtn" id="shelterBtn">
      🏕️ CRAFT SHELTER
    </button>

    <button class="menuBtn" id="cookBtn">
      🍳 MASAK IKAN
    </button>

    <button class="menuBtn" id="resetSaveBtn">
      🗑️ RESET SAVE
    </button>
  </div>
`;

document.body.appendChild(menu);

const menuStyle = document.createElement("style");

menuStyle.textContent = `
.menuBtn{
  display:block;
  width:100%;
  margin:8px 0;
  padding:12px;
  border:0;
  border-radius:13px;
  font-size:14px;
  font-weight:900;
}
`;

document.head.appendChild(menuStyle);

function toggleMenu() {
  paused = !paused;

  menu.style.display =
    paused ? "flex" : "none";
}

document.getElementById(
  "resumeBtn"
).onclick = toggleMenu;

document.getElementById(
  "saveBtn"
).onclick = saveGame;

document.getElementById(
  "loadBtn"
).onclick = loadGame;

document.getElementById(
  "eatBtn"
).onclick = eatBerry;

document.getElementById(
  "drinkBtn"
).onclick = drinkCoconut;

document.getElementById(
  "fishEatBtn"
).onclick = eatCookedFish;

document.getElementById(
  "campfireBtn"
).onclick = craftCampfire;

document.getElementById(
  "shelterBtn"
).onclick = craftShelter;

document.getElementById(
  "cookBtn"
).onclick = () => {
  if (!nearestCampfire()) {
    toast("DEKATI API UNGGUN");
    return;
  }

  cookFish();
};

document.getElementById(
  "resetSaveBtn"
).onclick = () => {
  if (
    confirm("Hapus semua save?")
  ) {
    resetSave();
  }
};

/* =========================
   ACTION BUTTONS
========================= */

const actionPanel =
  document.createElement("div");

Object.assign(actionPanel.style, {
  position: "fixed",
  right: "22px",
  bottom: "190px",
  zIndex: "30",
  display: "grid",
  gridTemplateColumns: "repeat(2,70px)",
  gap: "10px"
});

function actionButton(
  id,
  text,
  callback
) {
  const b =
    document.createElement("button");

  b.id = id;
  b.textContent = text;

  Object.assign(b.style, {
    width: "70px",
    height: "58px",
    border: "1px solid rgba(255,255,255,.25)",
    borderRadius: "18px",
    background: "rgba(10,25,35,.68)",
    color: "#fff",
    fontSize: "22px",
    fontWeight: "900",
    backdropFilter: "blur(10px)"
  });

  b.addEventListener(
    "pointerdown",
    e => {
      e.preventDefault();
      callback();
    },
    { passive: false }
  );

  actionPanel.appendChild(b);

  return b;
}

actionButton(
  "attackAction",
  "⚔️",
  attack
);

actionButton(
  "gatherAction",
  "🪓",
  gatherWood
);

actionButton(
  "stoneAction",
  "⛏️",
  gatherStone
);

actionButton(
  "fishAction",
  "🎣",
  fish
);

actionButton(
  "berryAction",
  "🍓",
  gatherBerry
);

actionButton(
  "coconutAction",
  "🥥",
  gatherCoconut
);

actionButton(
  "menuAction",
  "☰",
  toggleMenu
);

document.body.appendChild(
  actionPanel
);

/* =========================
   KEYBOARD FALLBACK
========================= */

const keys = {};

window.addEventListener(
  "keydown",
  e => {
    keys[e.key.toLowerCase()] = true;

    if (
      e.key === "Escape"
    ) {
      toggleMenu();
    }

    if (e.key.toLowerCase() === "e") {
      gatherWood();
    }

    if (e.key.toLowerCase() === "f") {
      fish();
    }

    if (e.key.toLowerCase() === "q") {
      attack();
    }
  }
);

window.addEventListener(
  "keyup",
  e => {
    keys[e.key.toLowerCase()] = false;
  }
);

/* =========================
   KEYBOARD MOVEMENT
========================= */

function updateKeyboardJoystick() {
  if (
    Math.abs(joystickX) > .05 ||
    Math.abs(joystickY) > .05
  ) {
    return;
  }

  let x = 0;
  let y = 0;

  if (keys["a"] || keys["arrowleft"]) {
    x -= 1;
  }

  if (keys["d"] || keys["arrowright"]) {
    x += 1;
  }

  if (keys["w"] || keys["arrowup"]) {
    y -= 1;
  }

  if (keys["s"] || keys["arrowdown"]) {
    y += 1;
  }

  joystickX = x;
  joystickY = y;
}

/* =========================
   SOUND ENGINE
========================= */

let audioCtx = null;

function audioInit() {
  if (audioCtx) {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    return;
  }

  try {
    audioCtx =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
  } catch (_) {}
}

function tone(
  frequency,
  duration,
  volume = .04,
  type = "sine"
) {
  if (!audioCtx) return;

  const osc =
    audioCtx.createOscillator();

  const gain =
    audioCtx.createGain();

  osc.type = type;

  osc.frequency.value =
    frequency;

  gain.gain.setValueAtTime(
    volume,
    audioCtx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    .001,
    audioCtx.currentTime +
      duration
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();

  osc.stop(
    audioCtx.currentTime +
    duration
  );
}

function chopSound() {
  audioInit();

  tone(130,.08,.07,"square");
  setTimeout(
    () => tone(80,.08,.04,"square"),
    60
  );
}

function stoneSound() {
  audioInit();

  tone(220,.06,.06,"triangle");
  setTimeout(
    () => tone(160,.07,.04,"triangle"),
    60
  );
}

function attackSound() {
  audioInit();

  tone(180,.06,.05,"sawtooth");
  setTimeout(
    () => tone(80,.08,.03,"square"),
    40
  );
}

function fishingSound() {
  audioInit();

  tone(600,.08,.03,"sine");

  setTimeout(
    () => tone(850,.15,.04,"sine"),
    1500
  );
}

/* =========================
   TOUCH AUDIO UNLOCK
========================= */

window.addEventListener(
  "pointerdown",
  audioInit,
  {
    once: true,
    passive: true
  }
);

/* =========================
   CHAPTER INITIALIZATION
========================= */

updateQuest();
updateUI();

/* =========================
   MAIN LOOP
========================= */

function gameLoop(now) {
  requestAnimationFrame(gameLoop);

  const dt =
    Math.min(
      .05,
      (now - lastTime) / 1000
    );

  lastTime = now;

  if (!paused && !gameOver) {
    updateKeyboardJoystick();
    updatePlayer(dt);
    updateAnimals(dt);
    updateSurvival(dt);
    updateDayNight(dt);
    updateWeather(dt);
    animateWorld(dt);
    checkProgress();
  }

  updateCamera(dt);
  drawMinimap();

  renderer.render(
    scene,
    camera
  );
}

requestAnimationFrame(
  gameLoop
);

/* =========================
   RESIZE
========================= */

window.addEventListener(
  "resize",
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        1.5
      )
    );
  }
);

/* =========================
   START
========================= */

setTimeout(() => {
  updateUI();
  updateQuest();
  drawMinimap();

  toast(
    "🌴 SELAMAT DATANG DI VALEN ISLAND"
  );
}, 500);
   /* =========================================================
   VALEN ISLAND SURVIVAL
   BAGIAN 4/4 — EXTRA SYSTEMS
========================================================= */

/* =========================
   ACHIEVEMENTS
========================= */

const achievements = {
  firstWood: false,
  firstStone: false,
  firstFish: false,
  firstCampfire: false,
  hunter: false,
  explorer: false,
  survivor: false,
  beacon: false
};

function achievement(id, title) {
  if (achievements[id]) return;

  achievements[id] = true;

  score += 50;

  toast(`🏆 ${title} +50`);

  setTimeout(() => {
    saveAchievementData();
  }, 100);
}

function saveAchievementData() {
  try {
    localStorage.setItem(
      "valen_achievements",
      JSON.stringify(achievements)
    );
  } catch (_) {}
}

function loadAchievementData() {
  try {
    const raw =
      localStorage.getItem(
        "valen_achievements"
      );

    if (raw) {
      Object.assign(
        achievements,
        JSON.parse(raw)
      );
    }
  } catch (_) {}
}

loadAchievementData();

/* =========================
   ACHIEVEMENT CHECKER
========================= */

setInterval(() => {
  if (inventory.wood > 0) {
    achievement(
      "firstWood",
      "Kayu Pertama"
    );
  }

  if (inventory.stone > 0) {
    achievement(
      "firstStone",
      "Penambang Pemula"
    );
  }

  if (stats.fishCaught > 0) {
    achievement(
      "firstFish",
      "Nelayan"
    );
  }

  if (
    structures.some(
      s => s.type === "campfire"
    )
  ) {
    achievement(
      "firstCampfire",
      "Api Pertama"
    );
  }

  if (stats.kills >= 5) {
    achievement(
      "hunter",
      "Pemburu Pulau"
    );
  }

  if (
    player.position.length() > 120
  ) {
    achievement(
      "explorer",
      "Penjelajah"
    );
  }

  if (stats.day >= 5) {
    achievement(
      "survivor",
      "Bertahan 5 Hari"
    );
  }

  if (stats.beaconBuilt) {
    achievement(
      "beacon",
      "Sinyal Penyelamatan"
    );
  }
}, 2000);

/* =========================
   SIMPLE SETTINGS
========================= */

const settingsButton =
  document.createElement("button");

settingsButton.textContent = "⚙️";

Object.assign(
  settingsButton.style,
  {
    position: "fixed",
    left: "18px",
    bottom: "18px",
    width: "58px",
    height: "58px",
    border: "0",
    borderRadius: "18px",
    background:
      "rgba(10,25,35,.72)",
    color: "#fff",
    fontSize: "23px",
    zIndex: "40",
    backdropFilter: "blur(10px)"
  }
);

document.body.appendChild(
  settingsButton
);

const settingsPanel =
  document.createElement("div");

Object.assign(
  settingsPanel.style,
  {
    position: "fixed",
    inset: "0",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    background:
      "rgba(0,0,0,.75)",
    zIndex: "170",
    fontFamily:
      "Arial,sans-serif"
  }
);

settingsPanel.innerHTML = `
  <div style="
    width:min(92%,430px);
    max-height:85vh;
    overflow:auto;
    padding:22px;
    border-radius:22px;
    background:rgba(10,25,32,.96);
    color:white;
  ">

    <div style="
      font-size:25px;
      font-weight:900;
      margin-bottom:18px;">
      ⚙️ SETTINGS
    </div>

    <label style="display:block;margin:12px 0 5px;">
      Camera Sensitivity
    </label>

    <input id="sensitivitySlider"
      type="range"
      min="0"
      max="100"
      value="${settings.sensitivity}"
      style="width:100%;">

    <div id="sensitivityValue"
      style="font-size:12px;opacity:.7;">
      ${settings.sensitivity}
    </div>

    <label style="
      display:flex;
      justify-content:space-between;
      margin:18px 0;">
      <span>Invert Y</span>
      <input id="invertYCheck"
        type="checkbox"
        ${settings.invertY ? "checked" : ""}>
    </label>

    <label style="
      display:flex;
      justify-content:space-between;
      margin:18px 0;">
      <span>Camera Shake</span>
      <input id="shakeCheck"
        type="checkbox"
        ${settings.cameraShake ? "checked" : ""}>
    </label>

    <label style="
      display:flex;
      justify-content:space-between;
      margin:18px 0;">
      <span>Rain Effects</span>
      <input id="rainCheck"
        type="checkbox"
        ${settings.effects ? "checked" : ""}>
    </label>

    <button id="closeSettings"
      style="
      width:100%;
      padding:14px;
      border:0;
      border-radius:13px;
      font-weight:900;">
      TUTUP
    </button>
  </div>
`;

document.body.appendChild(
  settingsPanel
);

settingsButton.onclick = () => {
  paused = true;
  settingsPanel.style.display =
    "flex";
};

document.getElementById(
  "closeSettings"
).onclick = () => {
  settingsPanel.style.display =
    "none";

  paused = false;
};

document.getElementById(
  "sensitivitySlider"
).oninput = e => {
  settings.sensitivity =
    Number(e.target.value);

  document.getElementById(
    "sensitivityValue"
  ).textContent =
    settings.sensitivity;

  localStorage.setItem(
    "valen_settings",
    JSON.stringify(settings)
  );
};

document.getElementById(
  "invertYCheck"
).onchange = e => {
  settings.invertY =
    e.target.checked;

  localStorage.setItem(
    "valen_settings",
    JSON.stringify(settings)
  );
};

document.getElementById(
  "shakeCheck"
).onchange = e => {
  settings.cameraShake =
    e.target.checked;

  localStorage.setItem(
    "valen_settings",
    JSON.stringify(settings)
  );
};

document.getElementById(
  "rainCheck"
).onchange = e => {
  settings.effects =
    e.target.checked;

  rainGroup.visible =
    settings.effects &&
    raining;

  localStorage.setItem(
    "valen_settings",
    JSON.stringify(settings)
  );
};

/* =========================
   SETTINGS LOAD
========================= */

try {
  const savedSettings =
    localStorage.getItem(
      "valen_settings"
    );

  if (savedSettings) {
    Object.assign(
      settings,
      JSON.parse(savedSettings)
    );
  }
} catch (_) {}

/* =========================
   APPLY SETTINGS
========================= */

function applySettings() {
  if (
    typeof settings.sensitivity ===
    "number"
  ) {
    cameraSensitivity =
      0.002 +
      settings.sensitivity /
      100 *
      0.01;
  }

  rainGroup.visible =
    settings.effects &&
    raining;
}

applySettings();

/* =========================
   MOBILE ORIENTATION
========================= */

function checkOrientation() {
  const portrait =
    window.innerHeight >
    window.innerWidth;

  document.body.classList.toggle(
    "portraitMode",
    portrait
  );
}

window.addEventListener(
  "resize",
  checkOrientation
);

checkOrientation();

/* =========================
   FPS MONITOR
========================= */

let fpsFrames = 0;
let fpsTime =
  performance.now();

let currentFPS = 60;

setInterval(() => {
  const now =
    performance.now();

  const elapsed =
    now - fpsTime;

  if (elapsed > 0) {
    currentFPS =
      Math.round(
        fpsFrames /
        (elapsed / 1000)
      );
  }

  fpsFrames = 0;
  fpsTime = now;
}, 1000);

const fpsDisplay =
  document.createElement("div");

Object.assign(
  fpsDisplay.style,
  {
    position: "fixed",
    left: "50%",
    bottom: "10px",
    transform:
      "translateX(-50%)",
    color:
      "rgba(255,255,255,.45)",
    fontSize: "10px",
    fontFamily:
      "monospace",
    zIndex: "15",
    pointerEvents: "none"
  }
);

document.body.appendChild(
  fpsDisplay
);

setInterval(() => {
  fpsDisplay.textContent =
    `${currentFPS} FPS`;
}, 1000);

/* =========================
   PERFORMANCE COUNTER
========================= */

const originalGameLoop =
  gameLoop;

function performanceTick() {
  fpsFrames++;
}

/* =========================
   SAVE BEFORE APP CLOSE
========================= */

window.addEventListener(
  "beforeunload",
  () => {
    try {
      syncInventory();

      localStorage.setItem(
        "valen_island_save",
        JSON.stringify({
          stats,
          player: {
            x:
              player.position.x,
            y:
              player.position.y,
            z:
              player.position.z
          },
          score,
          highScore,
          cameraYaw,
          cameraPitch
        })
      );
    } catch (_) {}
  }
);

/* =========================
   VISIBILITY SAVE
========================= */

document.addEventListener(
  "visibilitychange",
  () => {
    if (
      document.hidden &&
      !gameOver
    ) {
      try {
        syncInventory();

        localStorage.setItem(
          "valen_island_save",
          JSON.stringify({
            stats,
            player: {
              x:
                player.position.x,
              y:
                player.position.y,
              z:
                player.position.z
            },
            score,
            highScore,
            cameraYaw,
            cameraPitch
          })
        );
      } catch (_) {}
    }
  }
);

/* =========================
   DEBUG ERROR DISPLAY
========================= */

window.addEventListener(
  "error",
  e => {
    console.error(
      "VALEN ERROR:",
      e.error || e.message
    );
  }
);

/* =========================
   FINAL INITIALIZATION
========================= */

setTimeout(() => {
  try {
    applySettings();
    updateUI();
    updateQuest();
    drawMinimap();
  } catch (err) {
    console.error(
      "Initialization error:",
      err
    );
  }
}, 100);

/* =========================================================
   END OF GAME.JS
========================================================= */
