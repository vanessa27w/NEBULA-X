// ============================================================
// NEBULA X v2 — PREMIUM 3D SPACE SHOOTER
// ============================================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02030b);
scene.fog = new THREE.FogExp2(0x050817, 0.012);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(
  62,
  innerWidth / innerHeight,
  0.1,
  200
);

camera.position.set(0, 1.8, 9);
camera.lookAt(0, 0, -10);

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

document.body.appendChild(renderer.domElement);

// ============================================================
// LIGHTING
// ============================================================

scene.add(new THREE.HemisphereLight(
  0x6ebcff,
  0x080010,
  2.2
));

const sun = new THREE.DirectionalLight(0xffffff, 3);
sun.position.set(4, 8, 5);
scene.add(sun);

const blueLight = new THREE.PointLight(0x00aaff, 8, 30);
blueLight.position.set(0, 2, 2);
scene.add(blueLight);

const purpleLight = new THREE.PointLight(0xaa22ff, 6, 40);
purpleLight.position.set(-10, 4, -20);
scene.add(purpleLight);

// ============================================================
// HELPERS
// ============================================================

function mat(color, metal = 0.3, rough = 0.35, emissive = 0x000000) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: metal,
    roughness: rough,
    emissive,
    emissiveIntensity: emissive ? 2 : 0
  });
}

function glowMaterial(color) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9
  });
}

// ============================================================
// STAR FIELD
// ============================================================

const starGroup = new THREE.Group();
scene.add(starGroup);

const starGeo = new THREE.BufferGeometry();
const starCount = 1800;

const positions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 90;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
  positions[i * 3 + 2] = -Math.random() * 180;
}

starGeo.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const starMat = new THREE.PointsMaterial({
  color: 0x9edcff,
  size: 0.09,
  transparent: true,
  opacity: 0.9
});

const stars = new THREE.Points(starGeo, starMat);
starGroup.add(stars);

// ============================================================
// NEBULA CLOUDS
// ============================================================

const nebulaGroup = new THREE.Group();
scene.add(nebulaGroup);

for (let i = 0; i < 18; i++) {

  const geo = new THREE.SphereGeometry(
    3 + Math.random() * 6,
    16,
    16
  );

  const colors = [
    0x301080,
    0x092c91,
    0x55105f,
    0x102d70,
    0x74145d
  ];

  const material = new THREE.MeshBasicMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    transparent: true,
    opacity: 0.08
  });

  const cloud = new THREE.Mesh(geo, material);

  cloud.position.set(
    (Math.random() - 0.5) * 60,
    (Math.random() - 0.5) * 40,
    -30 - Math.random() * 100
  );

  cloud.scale.z = 2.5;

  nebulaGroup.add(cloud);
}

// ============================================================
// PLANETS
// ============================================================

const planetGroup = new THREE.Group();
scene.add(planetGroup);

function createPlanet(size, color, x, y, z) {

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    mat(color, 0.15, 0.8)
  );

  planet.position.set(x, y, z);

  planetGroup.add(planet);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.06, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x249cff,
      transparent: true,
      opacity: 0.13,
      side: THREE.BackSide
    })
  );

  atmosphere.position.copy(planet.position);
  planetGroup.add(atmosphere);

  return planet;
}

createPlanet(8, 0x123f82, -16, 10, -55);
createPlanet(4.5, 0x4d1d75, 18, -5, -85);
createPlanet(2.2, 0x3e516e, -15, -7, -30);

// ============================================================
// PLANET RINGS
// ============================================================

const ring = new THREE.Mesh(
  new THREE.RingGeometry(6, 9, 64),
  new THREE.MeshBasicMaterial({
    color: 0x6b5cff,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide
  })
);

ring.position.set(-16, 10, -55);
ring.rotation.x = Math.PI / 2.6;
ring.rotation.z = 0.35;

scene.add(ring);

// ============================================================
// PLAYER SHIP
// ============================================================

const player = new THREE.Group();
scene.add(player);

player.position.set(0, -1.2, 2);

// Main hull
const hull = new THREE.Mesh(
  new THREE.ConeGeometry(1.15, 3.8, 6),
  mat(0x6c879b, 0.85, 0.22, 0x061525)
);

hull.rotation.x = Math.PI / 2;
hull.scale.set(1, 1, 1.15);
player.add(hull);

// Nose
const nose = new THREE.Mesh(
  new THREE.ConeGeometry(0.45, 1.6, 5),
  mat(0xb9eaff, 0.8, 0.18, 0x168cff)
);

nose.rotation.x = -Math.PI / 2;
nose.position.z = -2;
player.add(nose);

// Cockpit
const cockpit = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 24, 16),
  new THREE.MeshStandardMaterial({
    color: 0x081c35,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x0066ff,
    emissiveIntensity: 0.6
  })
);

cockpit.scale.set(1, 0.55, 1.35);
cockpit.position.set(0, 0.42, -0.35);
player.add(cockpit);

// Wings
const wingMat = mat(
  0x167fc0,
  0.7,
  0.22,
  0x004cff
);

for (const s of [-1, 1]) {

  const wing = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.15, 1.5),
    wingMat
  );

  wing.position.set(s * 1.35, 0, 0.15);
  wing.rotation.y = s * -0.18;
  wing.rotation.z = s * -0.12;

  player.add(wing);

  // wing light
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.07, 0.12),
    glowMaterial(0x00d9ff)
  );

  strip.position.set(s * 1.35, 0.1, -0.35);
  strip.rotation.y = s * -0.18;

  player.add(strip);
}

// Engine glow
const engines = [];

for (const s of [-1, 1]) {

  const engine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.46, 1.4, 16),
    new THREE.MeshBasicMaterial({
      color: 0x00cfff,
      transparent: true,
      opacity: 0.9
    })
  );

  engine.rotation.x = Math.PI / 2;
  engine.position.set(s * 0.65, -0.1, 1.75);

  player.add(engine);
  engines.push(engine);

  const glow = new THREE.PointLight(
    0x00ccff,
    7,
    8
  );

  glow.position.copy(engine.position);
  player.add(glow);
}

// Central engine
const centerEngine = new THREE.Mesh(
  new THREE.CylinderGeometry(0.35, 0.55, 1.8, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffffff
  })
);

centerEngine.rotation.x = Math.PI / 2;
centerEngine.position.set(0, -0.05, 1.8);
player.add(centerEngine);

// ============================================================
// ASTEROIDS
// ============================================================

const asteroids = [];

function createAsteroid() {

  const radius = 0.45 + Math.random() * 1.35;

  const geo = new THREE.IcosahedronGeometry(
    radius,
    1
  );

  const asteroid = new THREE.Mesh(
    geo,
    mat(
      0x252d3b,
      0.15,
      0.9
    )
  );

  asteroid.position.set(
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 13,
    -35 - Math.random() * 90
  );

  asteroid.rotation.set(
    Math.random() * 3,
    Math.random() * 3,
    Math.random() * 3
  );

  asteroid.userData.speed =
    0.15 + Math.random() * 0.18;

  asteroid.userData.radius = radius;

  scene.add(asteroid);
  asteroids.push(asteroid);
}

for (let i = 0; i < 28; i++) {
  createAsteroid();
}

// ============================================================
// ENEMIES
// ============================================================

const enemies = [];

function createEnemy() {

  const enemy = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.75, 1),
    mat(
      0x29162e,
      0.7,
      0.25,
      0x550018
    )
  );

  enemy.add(body);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0xff174f
    })
  );

  enemy.add(core);

  const light = new THREE.PointLight(
    0xff174f,
    4,
    7
  );

  enemy.add(light);

  for (const s of [-1, 1]) {

    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.12, 0.35),
      mat(0x57142c, 0.6, 0.3, 0x44000c)
    );

    wing.position.x = s * 0.7;
    wing.rotation.z = s * 0.3;

    enemy.add(wing);
  }

  enemy.position.set(
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 9,
    -30 - Math.random() * 75
  );

  enemy.userData.speed =
    0.12 + Math.random() * 0.15;

  enemy.userData.hp = 2;

  scene.add(enemy);
  enemies.push(enemy);
}

// initial enemies
for (let i = 0; i < 12; i++) {
  createEnemy();
}

// ============================================================
// LASERS
// ============================================================

const lasers = [];

function fireLaser() {

  const laser = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.07,
      0.07,
      2.2,
      8
    ),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff
    })
  );

  laser.rotation.x = Math.PI / 2;

  laser.position.copy(player.position);
  laser.position.y += 0.2;
  laser.position.z -= 2.3;

  scene.add(laser);

  const light = new THREE.PointLight(
    0x00ffff,
    3,
    5
  );

  laser.add(light);

  laser.userData.speed = 1.4;

  lasers.push(laser);
}

// ============================================================
// ENEMY PROJECTILES
// ============================================================

const enemyShots = [];

function enemyFire(enemy) {

  const shot = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 10, 10),
    new THREE.MeshBasicMaterial({
      color: 0xff174f
    })
  );

  shot.position.copy(enemy.position);

  scene.add(shot);

  shot.userData.speed = 0.45;

  enemyShots.push(shot);
}

// ============================================================
// EXPLOSIONS
// ============================================================

const particles = [];

function explosion(position, color = 0xff6a00) {

  for (let i = 0; i < 28; i++) {

    const p = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.04 + Math.random() * 0.08,
        6,
        6
      ),
      new THREE.MeshBasicMaterial({
        color
      })
    );

    p.position.copy(position);

    p.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.35,
      (Math.random() - 0.5) * 0.35,
      (Math.random() - 0.5) * 0.35
    );

    p.userData.life = 1;

    scene.add(p);
    particles.push(p);
  }
}

// ============================================================
// POWER UPS
// ============================================================

const powerups = [];

function createPowerup() {

  const colors = [
    0x00ff88,
    0x00ccff,
    0xffcc00,
    0xaa44ff
  ];

  const power = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55, 1),
    new THREE.MeshBasicMaterial({
      color: colors[
        Math.floor(Math.random() * colors.length)
      ]
    })
  );

  power.position.set(
    (Math.random() - 0.5) * 15,
    (Math.random() - 0.5) * 9,
    -50
  );

  power.userData.speed = 0.25;

  scene.add(power);
  powerups.push(power);
}

// ============================================================
// BOSS
// ============================================================

let boss = null;
let bossHP = 100;
let bossActive = false;

function createBoss() {

  if (boss) return;

  boss = new THREE.Group();

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.1, 2),
    mat(
      0x16060b,
      0.8,
      0.2,
      0xff003c
    )
  );

  boss.add(core);

  const bossCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0xff003c
    })
  );

  boss.add(bossCore);

  for (const s of [-1, 1]) {

    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.35, 1),
      mat(
        0x3a0c19,
        0.7,
        0.25,
        0xff003c
      )
    );

    wing.position.x = s * 2.1;
    wing.rotation.z = s * 0.2;

    boss.add(wing);
  }

  const bossLight = new THREE.PointLight(
    0xff003c,
    10,
    20
  );

  boss.add(bossLight);

  boss.position.set(
    0,
    2,
    -80
  );

  scene.add(boss);

  bossHP = 100;
  bossActive = true;
}

// ============================================================
// GAME VARIABLES
// ============================================================

let score = 0;
let best = Number(localStorage.getItem("nebula_best") || 0);

let shield = 100;
let gameRunning = true;

let boostActive = false;
let fireHeld = false;

let autoFireTimer = 0;
let enemyFireTimer = 0;

let elapsed = 0;

// ============================================================
// UI
// ============================================================

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const shieldBar = document.getElementById("shieldBar");

const gameOverEl = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");

if (bestEl) bestEl.textContent = best;
if (scoreEl) scoreEl.textContent = score;

// ============================================================
// JOYSTICK
// ============================================================

const joystick = document.getElementById("joystick");
const stick = document.getElementById("stick");

let joyX = 0;
let joyY = 0;

function joystickMove(clientX, clientY) {

  if (!joystick) return;

  const rect = joystick.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = clientX - centerX;
  let dy = clientY - centerY;

  const max = rect.width * 0.34;

  const length = Math.sqrt(dx * dx + dy * dy);

  if (length > max) {

    dx = dx / length * max;
    dy = dy / length * max;
  }

  joyX = dx / max;
  joyY = dy / max;

  if (stick) {
    stick.style.transform =
      `translate(${dx}px, ${dy}px)`;
  }
}

function joystickReset() {

  joyX = 0;
  joyY = 0;

  if (stick) {
    stick.style.transform =
      "translate(0px, 0px)";
  }
}

if (joystick) {

  joystick.addEventListener("touchstart", e => {

    e.preventDefault();

    const t = e.touches[0];

    joystickMove(
      t.clientX,
      t.clientY
    );

  }, { passive: false });

  joystick.addEventListener("touchmove", e => {

    e.preventDefault();

    const t = e.touches[0];

    joystickMove(
      t.clientX,
      t.clientY
    );

  }, { passive: false });

  joystick.addEventListener("touchend", e => {

    e.preventDefault();

    joystickReset();

  }, { passive: false });
}

// ============================================================
// BOOST BUTTON
// ============================================================

const boostButton =
  document.getElementById("boost");

if (boostButton) {

  boostButton.addEventListener("touchstart", e => {

    e.preventDefault();

    boostActive = true;

  }, { passive: false });

  boostButton.addEventListener("touchend", e => {

    e.preventDefault();

    boostActive = false;

  }, { passive: false });
}

// ============================================================
// FIRE BUTTON
// ============================================================

const fireButton =
  document.getElementById("fire");

if (fireButton) {

  fireButton.addEventListener("touchstart", e => {

    e.preventDefault();

    fireHeld = true;

  }, { passive: false });

  fireButton.addEventListener("touchend", e => {

    e.preventDefault();

    fireHeld = false;

  }, { passive: false });
}

// ============================================================
// RESTART
// ============================================================

const restartButton =
  document.getElementById("restart");

if (restartButton) {

  restartButton.addEventListener("click", restartGame);
  restartButton.addEventListener("touchend", restartGame);
}

// ============================================================
// COLLISION
// ============================================================

function distance(a, b) {
  return a.position.distanceTo(b.position);
}

// ============================================================
// GAME OVER
// ============================================================

function gameOver() {

  if (!gameRunning) return;

  gameRunning = false;

  best = Math.max(best, Math.floor(score));

  localStorage.setItem(
    "nebula_best",
    best
  );

  if (bestEl)
    bestEl.textContent = best;

  if (finalScoreEl)
    finalScoreEl.textContent =
      Math.floor(score);

  if (gameOverEl)
    gameOverEl.style.display = "flex";
}

// ============================================================
// RESTART GAME
// ============================================================

function restartGame(e) {

  if (e) e.preventDefault();

  score = 0;
  shield = 100;
  elapsed = 0;

  player.position.set(0, -1.2, 2);

  gameRunning = true;
  bossActive = false;

  if (boss) {

    scene.remove(boss);
    boss = null;
  }

  asteroids.forEach(a => {
    a.position.z =
      -35 - Math.random() * 90;
  });

  enemies.forEach(enemy => {
    enemy.position.z =
      -30 - Math.random() * 80;
    enemy.userData.hp = 2;
  });

  if (gameOverEl)
    gameOverEl.style.display = "none";

  updateUI();
}

// ============================================================
// UI UPDATE
// ============================================================

function updateUI() {

  if (scoreEl)
    scoreEl.textContent =
      Math.floor(score);

  if (bestEl)
    bestEl.textContent =
      best;

  if (shieldBar) {

    shieldBar.style.width =
      Math.max(0, shield) + "%";
  }
}

// ============================================================
// DAMAGE
// ============================================================

function damage(amount) {

  shield -= amount;

  explosion(
    player.position,
    0x00ccff
  );

  if (shield <= 0) {

    shield = 0;

    gameOver();
  }

  updateUI();
}

// ============================================================
// MAIN LOOP
// ============================================================

const clock = new THREE.Clock();

function animate() {

  requestAnimationFrame(animate);

  const dt = Math.min(
    clock.getDelta(),
    0.035
  );

  elapsed += dt;

  // ----------------------------------------
  // PLAYER MOVEMENT
  // ----------------------------------------

  if (gameRunning) {

    const speed =
      boostActive ? 0.22 : 0.105;

    player.position.x +=
      joyX * speed;

    player.position.y -=
      joyY * speed;

    player.position.x =
      THREE.MathUtils.clamp(
        player.position.x,
        -5.5,
        5.5
      );

    player.position.y =
      THREE.MathUtils.clamp(
        player.position.y,
        -4.8,
        4.5
      );

    // ship banking
    player.rotation.z =
      THREE.MathUtils.lerp(
        player.rotation.z,
        -joyX * 0.35,
        0.1
      );

    player.rotation.x =
      THREE.MathUtils.lerp(
        player.rotation.x,
        joyY * 0.18,
        0.1
      );
  }

  // ----------------------------------------
  // ENGINE ANIMATION
  // ----------------------------------------

  const engineScale =
    boostActive ? 1.8 : 1;

  engines.forEach((engine, i) => {

    const pulse =
      1 +
      Math.sin(elapsed * 18 + i) *
      0.12;

    engine.scale.z =
      pulse * engineScale;
  });

  // ----------------------------------------
  // STARS
  // ----------------------------------------

  if (gameRunning) {

    const pos =
      starGeo.attributes.position.array;

    for (let i = 0; i < starCount; i++) {

      pos[i * 3 + 2] +=
        boostActive ? 0.7 : 0.32;

      if (pos[i * 3 + 2] > 10) {

        pos[i * 3 + 2] = -180;
      }
    }

    starGeo.attributes.position.needsUpdate = true;
  }

  // ----------------------------------------
  // ASTEROIDS
  // ----------------------------------------

  asteroids.forEach(a => {

    if (!gameRunning) return;

    a.position.z +=
      boostActive
        ? a.userData.speed * 1.8
        : a.userData.speed;

    a.rotation.x += 0.004;
    a.rotation.y += 0.006;

    if (a.position.z > 8) {

      a.position.z =
        -70 - Math.random() * 70;

      a.position.x =
        (Math.random() - 0.5) * 20;

      a.position.y =
        (Math.random() - 0.5) * 13;
    }

    if (
      distance(a, player) <
      a.userData.radius + 1
    ) {

      damage(18);

      a.position.z = -100;
    }
  });

  // ----------------------------------------
  // ENEMIES
  // ----------------------------------------

  enemies.forEach(enemy => {

    if (!gameRunning) return;

    enemy.position.z +=
      enemy.userData.speed;

    enemy.rotation.y += 0.018;

    // slight movement
    enemy.position.x +=
      Math.sin(
        elapsed * 1.5 +
        enemy.position.z
      ) * 0.006;

    if (enemy.position.z > 8) {

      enemy.position.z =
        -60 - Math.random() * 70;

      enemy.position.x =
        (Math.random() - 0.5) * 15;

      enemy.position.y =
        (Math.random() - 0.5) * 9;
    }

    if (
      distance(enemy, player) < 1.5
    ) {

      damage(25);

      explosion(
        enemy.position,
        0xff174f
      );

      enemy.position.z = -100;
    }
  });

  // ----------------------------------------
  // PLAYER LASERS
  // ----------------------------------------

  autoFireTimer -= dt;

  if (
    gameRunning &&
    fireHeld &&
    autoFireTimer <= 0
  ) {

    fireLaser();

    autoFireTimer = 0.13;
  }

  lasers.forEach((laser, li) => {

    laser.position.z -=
      laser.userData.speed;

    let removeLaser = false;

    enemies.forEach(enemy => {

      if (removeLaser) return;

      if (
        distance(laser, enemy) < 1.25
      ) {

        enemy.userData.hp--;

        explosion(
          enemy.position,
          0xff3366
        );

        removeLaser = true;

        if (enemy.userData.hp <= 0) {

          score += 100;

          explosion(
            enemy.position,
            0xff7700
          );

          enemy.position.z =
            -80 - Math.random() * 60;

          enemy.userData.hp = 2;
        }
      }
    });

    // boss collision
    if (
      boss &&
      bossActive &&
      distance(laser, boss) < 3
    ) {

      bossHP -= 2;

      explosion(
        laser.position,
        0xff003c
      );

      removeLaser = true;

      if (bossHP <= 0) {

        score += 5000;

        explosion(
          boss.position,
          0xff2200
        );

        scene.remove(boss);

        boss = null;
        bossActive = false;
      }
    }

    if (
      laser.position.z < -150
    ) {
      removeLaser = true;
    }

    if (removeLaser) {

      scene.remove(laser);

      lasers.splice(li, 1);
    }
  });

  // ----------------------------------------
  // ENEMY FIRE
  // ----------------------------------------

  enemyFireTimer -= dt;

  if (
    gameRunning &&
    enemyFireTimer <= 0 &&
    enemies.length
  ) {

    const enemy =
      enemies[
        Math.floor(
          Math.random() * enemies.length
        )
      ];

    if (enemy.position.z < -10) {

      enemyFire(enemy);
    }

    enemyFireTimer =
      0.8 + Math.random() * 1.5;
  }

  enemyShots.forEach((shot, i) => {

    shot.position.z +=
      shot.userData.speed;

    if (
      distance(shot, player) < 1.1
    ) {

      damage(8);

      scene.remove(shot);
      enemyShots.splice(i, 1);
    }

    if (shot.position.z > 10) {

      scene.remove(shot);
      enemyShots.splice(i, 1);
    }
  });

  // ----------------------------------------
  // PARTICLES
  // ----------------------------------------

  particles.forEach((p, i) => {

    p.position.add(
      p.userData.velocity
    );

    p.userData.life -=
      dt * 1.8;

    p.scale.multiplyScalar(0.96);

    if (p.userData.life <= 0) {

      scene.remove(p);
      particles.splice(i, 1);
    }
  });

  // ----------------------------------------
  // SCORE
  // ----------------------------------------

  if (gameRunning) {

    score += dt * (
      boostActive ? 14 : 8
    );

    if (
      Math.floor(score) > best
    ) {

      best = Math.floor(score);
    }

    // boss every 5000 points
    if (
      score >= 5000 &&
      !bossActive
    ) {

      createBoss();
    }

    updateUI();
  }

  // ----------------------------------------
  // BOSS
  // ----------------------------------------

  if (boss && bossActive) {

    boss.rotation.y += 0.006;

    boss.position.x =
      Math.sin(elapsed * 0.7) * 3;

    boss.position.y =
      2 +
      Math.sin(elapsed) * 1.2;

    if (boss.position.z < -12) {

      boss.position.z += 0.06;
    }
  }

  // ----------------------------------------
  // POWERUPS
  // ----------------------------------------

  if (
    gameRunning &&
    Math.random() < 0.002
  ) {

    createPowerup();
  }

  powerups.forEach((power, i) => {

    power.position.z +=
      power.userData.speed;

    power.rotation.x += 0.02;
    power.rotation.y += 0.03;

    if (
      distance(power, player) < 1.3
    ) {

      shield = Math.min(
        100,
        shield + 25
      );

      score += 250;

      explosion(
        power.position,
        0x00ffcc
      );

      scene.remove(power);
      powerups.splice(i, 1);

      updateUI();
    }

    if (power.position.z > 10) {

      scene.remove(power);
      powerups.splice(i, 1);
    }
  });

  // ----------------------------------------
  // CAMERA EFFECT
  // ----------------------------------------

  const targetX =
    player.position.x * 0.12;

  const targetY =
    player.position.y * 0.08 + 1.8;

  camera.position.x =
    THREE.MathUtils.lerp(
      camera.position.x,
      targetX,
      0.04
    );

  camera.position.y =
    THREE.MathUtils.lerp(
      camera.position.y,
      targetY,
      0.04
    );

  camera.lookAt(
    player.position.x * 0.15,
    player.position.y * 0.1,
    -12
  );

  // ----------------------------------------
  // PLANET / NEBULA
  // ----------------------------------------

  planetGroup.rotation.y += 0.0004;
  nebulaGroup.rotation.y += 0.00015;

  renderer.render(
    scene,
    camera
  );
}

// ============================================================
// RESIZE
// ============================================================

addEventListener("resize", () => {

  camera.aspect =
    innerWidth / innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    innerWidth,
    innerHeight
  );
});

// ============================================================
// START
// ============================================================

updateUI();
animate();
