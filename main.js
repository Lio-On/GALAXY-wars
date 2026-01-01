import * as THREE from "three";
import "./style.css";

// Game State
const gameState = {
  isPlaying: false,
  isPaused: false,
  score: 0,
  kills: 0,
  health: 100,
  bossActive: false,
  bossHealth: 10,
  gameOver: false,
  victory: false
};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 100);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 2, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 10);
scene.add(directionalLight);

// ===== STARFIELD =====
function createStarfield() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 3000;
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Distribute stars in a large sphere around the scene
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;

    // Vary star colors (white to blue)
    const colorChoice = Math.random();
    if (colorChoice > 0.7) {
      colors[i * 3] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      colors[i * 3 + 2] = 1.0;
    } else {
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 1.0;
      colors[i * 3 + 2] = 1.0;
    }

    sizes[i] = Math.random() * 2 + 0.5;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMaterial = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const starfield = createStarfield();

// ===== PLAYER X-WING =====
function createXWing() {
  const xwing = new THREE.Group();

  // Main body (fuselage)
  const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1.5, 8);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.z = Math.PI / 2;
  xwing.add(body);

  // Cockpit
  const cockpitGeometry = new THREE.SphereGeometry(0.25, 8, 8);
  const cockpitMaterial = new THREE.MeshPhongMaterial({
    color: 0x4444ff,
    transparent: true,
    opacity: 0.7
  });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  cockpit.position.x = 0.3;
  cockpit.scale.set(1, 0.7, 0.7);
  xwing.add(cockpit);

  // Wings (4 wings forming X shape)
  const wingGeometry = new THREE.BoxGeometry(1.5, 0.05, 0.4);
  const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xdd4444 });

  // Top wings
  const topWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
  topWing1.position.set(-0.2, 0.5, 0);
  topWing1.rotation.z = Math.PI / 6;
  xwing.add(topWing1);

  const topWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
  topWing2.position.set(-0.2, -0.5, 0);
  topWing2.rotation.z = -Math.PI / 6;
  xwing.add(topWing2);

  // Bottom wings
  const bottomWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
  bottomWing1.position.set(-0.2, 0.5, 0);
  bottomWing1.rotation.z = -Math.PI / 6;
  xwing.add(bottomWing1);

  const bottomWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
  bottomWing2.position.set(-0.2, -0.5, 0);
  bottomWing2.rotation.z = Math.PI / 6;
  xwing.add(bottomWing2);

  // Engine glow (4 engines at wing tips)
  const engineGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const engineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });

  const positions = [
    { x: -0.9, y: 0.8, z: 0 },
    { x: -0.9, y: -0.8, z: 0 },
    { x: -0.9, y: 0.8, z: 0 },
    { x: -0.9, y: -0.8, z: 0 }
  ];

  positions.forEach(pos => {
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(pos.x, pos.y, pos.z);
    xwing.add(engine);
  });

  xwing.position.set(0, -3, 0);
  return xwing;
}

const player = createXWing();
scene.add(player);

// ===== TIE FIGHTER =====
function createTIEFighter() {
  const tie = new THREE.Group();

  // Cockpit (sphere)
  const cockpitGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
  tie.add(cockpit);

  // Viewport
  const viewportGeometry = new THREE.CircleGeometry(0.15, 8);
  const viewportMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const viewport = new THREE.Mesh(viewportGeometry, viewportMaterial);
  viewport.position.z = 0.31;
  tie.add(viewport);

  // Solar panels (hexagonal wings)
  const wingGeometry = new THREE.BoxGeometry(0.05, 1.2, 1.2);
  const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.x = -0.5;
  tie.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.x = 0.5;
  tie.add(rightWing);

  return tie;
}

// ===== STAR DESTROYER =====
function createStarDestroyer() {
  const destroyer = new THREE.Group();

  // Main hull (triangular wedge shape)
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(-2, -1);
  shape.lineTo(-2, 1);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth: 8,
    bevelEnabled: false
  };

  const hullGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const hullMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
  const hull = new THREE.Mesh(hullGeometry, hullMaterial);
  hull.rotation.y = Math.PI / 2;
  hull.position.x = -4;
  destroyer.add(hull);

  // Bridge tower
  const towerGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const towerMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const tower = new THREE.Mesh(towerGeometry, towerMaterial);
  tower.position.set(-2, 0.5, 0);
  destroyer.add(tower);

  // Engine glow
  const engineGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.5);
  const engineMaterial = new THREE.MeshBasicMaterial({ color: 0x0088ff });

  for (let i = 0; i < 3; i++) {
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(4, 0, (i - 1) * 0.5);
    destroyer.add(engine);
  }

  destroyer.scale.set(2, 2, 2);
  return destroyer;
}

// ===== GAME ENTITIES =====
const enemies = [];
const lasers = [];
const enemyLasers = [];
const explosions = [];
let boss = null;

// ===== LASER =====
function createLaser(x, y, z, isPlayer = true) {
  const geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
  const material = new THREE.MeshBasicMaterial({
    color: isPlayer ? 0x00ff00 : 0xff0000
  });
  const laser = new THREE.Mesh(geometry, material);
  laser.position.set(x, y, z);
  laser.rotation.z = Math.PI / 2;

  // Add glow
  const glowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: isPlayer ? 0x00ff00 : 0xff0000,
    transparent: true,
    opacity: 0.6
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  laser.add(glow);

  scene.add(laser);
  return laser;
}

// ===== EXPLOSION EFFECT =====
function createExplosion(x, y, z) {
  const particleCount = 30;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.05, 4, 4);
    const material = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xff6600 : 0xffff00
    });
    const particle = new THREE.Mesh(geometry, material);

    particle.position.set(x, y, z);
    particle.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3,
      (Math.random() - 0.5) * 0.3
    );
    particle.life = 1.0;

    scene.add(particle);
    particles.push(particle);
  }

  explosions.push({ particles, time: 0 });
}

// ===== SPAWN ENEMY =====
function spawnEnemy() {
  if (!gameState.isPlaying || gameState.bossActive) return;

  const enemy = createTIEFighter();
  enemy.position.set(
    (Math.random() - 0.5) * 15,
    8,
    (Math.random() - 0.5) * 3
  );
  enemy.health = 1;
  enemy.shootTimer = Math.random() * 3;

  scene.add(enemy);
  enemies.push(enemy);
}

// ===== SPAWN BOSS =====
function spawnBoss() {
  gameState.bossActive = true;
  boss = createStarDestroyer();
  boss.position.set(0, 8, 0);
  boss.health = 10;
  boss.shootTimer = 0;
  scene.add(boss);

  // Show boss alert
  const bossAlert = document.getElementById('bossAlert');
  bossAlert.classList.remove('hidden');
  setTimeout(() => {
    bossAlert.classList.add('hidden');
  }, 3000);
}

// ===== INPUT =====
const keys = {};
window.addEventListener('keydown', (e) => {
  keys[e.key] = true;

  if (e.key === ' ' && gameState.isPlaying) {
    e.preventDefault();
    shootLaser();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// ===== MOBILE CONTROLS =====
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

// Left button
leftBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys['ArrowLeft'] = true;
});

leftBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  keys['ArrowLeft'] = false;
});

// Right button
rightBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  keys['ArrowRight'] = true;
});

rightBtn.addEventListener('touchend', (e) => {
  e.preventDefault();
  keys['ArrowRight'] = false;
});

// Shoot button
shootBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameState.isPlaying) {
    shootLaser();
  }
});

// Also support mouse events for testing
leftBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  keys['ArrowLeft'] = true;
});

leftBtn.addEventListener('mouseup', (e) => {
  e.preventDefault();
  keys['ArrowLeft'] = false;
});

rightBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  keys['ArrowRight'] = true;
});

rightBtn.addEventListener('mouseup', (e) => {
  e.preventDefault();
  keys['ArrowRight'] = false;
});

shootBtn.addEventListener('mousedown', (e) => {
  e.preventDefault();
  if (gameState.isPlaying) {
    shootLaser();
  }
});


let lastShot = 0;
function shootLaser() {
  const now = Date.now();
  if (now - lastShot < 200) return; // Rate limiting
  lastShot = now;

  const laser = createLaser(player.position.x + 0.8, player.position.y, player.position.z);
  lasers.push(laser);
}

// ===== UPDATE PLAYER =====
function updatePlayer(delta) {
  const speed = 8;

  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    player.position.x -= speed * delta;
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    player.position.x += speed * delta;
  }

  // Clamp position
  player.position.x = Math.max(-8, Math.min(8, player.position.x));

  // Tilt effect
  player.rotation.z = -player.position.x * 0.05;
}

// ===== UPDATE LASERS =====
function updateLasers(delta) {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.position.y += 20 * delta;

    if (laser.position.y > 15) {
      scene.remove(laser);
      lasers.splice(i, 1);
    }
  }

  // Enemy lasers
  for (let i = enemyLasers.length - 1; i >= 0; i--) {
    const laser = enemyLasers[i];
    laser.position.y -= 15 * delta;

    if (laser.position.y < -10) {
      scene.remove(laser);
      enemyLasers.splice(i, 1);
      continue;
    }

    // Check collision with player
    const distance = laser.position.distanceTo(player.position);
    if (distance < 0.8) {
      scene.remove(laser);
      enemyLasers.splice(i, 1);
      takeDamage(10);
      createExplosion(laser.position.x, laser.position.y, laser.position.z);
    }
  }
}

// ===== UPDATE ENEMIES =====
function updateEnemies(delta) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.position.y -= 2 * delta;
    enemy.rotation.y += delta;

    // Enemy shooting
    enemy.shootTimer -= delta;
    if (enemy.shootTimer <= 0 && enemy.position.y > -5 && enemy.position.y < 5) {
      enemy.shootTimer = 2 + Math.random() * 2;
      const laser = createLaser(enemy.position.x, enemy.position.y, enemy.position.z, false);
      enemyLasers.push(laser);
    }

    // Remove if off screen
    if (enemy.position.y < -10) {
      scene.remove(enemy);
      enemies.splice(i, 1);
      continue;
    }

    // Check collision with player lasers
    for (let j = lasers.length - 1; j >= 0; j--) {
      const laser = lasers[j];
      const distance = laser.position.distanceTo(enemy.position);

      if (distance < 0.8) {
        scene.remove(laser);
        lasers.splice(j, 1);

        scene.remove(enemy);
        enemies.splice(i, 1);

        createExplosion(enemy.position.x, enemy.position.y, enemy.position.z);
        addScore(100);
        addKill();
        break;
      }
    }
  }
}

// ===== UPDATE BOSS =====
function updateBoss(delta) {
  if (!boss) return;

  // Move boss into position
  if (boss.position.y > 3) {
    boss.position.y -= 1 * delta;
  } else {
    // Move side to side
    boss.position.x += Math.sin(Date.now() * 0.001) * delta * 2;
  }

  boss.rotation.y += delta * 0.2;

  // Boss shooting
  boss.shootTimer -= delta;
  if (boss.shootTimer <= 0) {
    boss.shootTimer = 0.8;
    for (let i = -1; i <= 1; i++) {
      const laser = createLaser(
        boss.position.x + i * 2,
        boss.position.y - 2,
        boss.position.z,
        false
      );
      enemyLasers.push(laser);
    }
  }

  // Check collision with player lasers
  for (let j = lasers.length - 1; j >= 0; j--) {
    const laser = lasers[j];
    const distance = laser.position.distanceTo(boss.position);

    if (distance < 4) {
      scene.remove(laser);
      lasers.splice(j, 1);

      boss.health--;
      gameState.bossHealth = boss.health;
      createExplosion(laser.position.x, laser.position.y, laser.position.z);
      addScore(500);

      if (boss.health <= 0) {
        createExplosion(boss.position.x, boss.position.y, boss.position.z);
        setTimeout(() => createExplosion(boss.position.x + 1, boss.position.y, boss.position.z), 200);
        setTimeout(() => createExplosion(boss.position.x - 1, boss.position.y + 1, boss.position.z), 400);
        scene.remove(boss);
        boss = null;
        gameState.victory = true;
        showVictory();
      }
    }
  }
}

// ===== UPDATE EXPLOSIONS =====
function updateExplosions(delta) {
  for (let i = explosions.length - 1; i >= 0; i--) {
    const explosion = explosions[i];
    explosion.time += delta;

    explosion.particles.forEach(particle => {
      particle.position.add(particle.velocity);
      particle.life -= delta * 2;
      particle.material.opacity = particle.life;

      if (particle.life <= 0) {
        scene.remove(particle);
      }
    });

    if (explosion.time > 1) {
      explosions.splice(i, 1);
    }
  }
}

// ===== GAME LOGIC =====
function addScore(points) {
  gameState.score += points;
  document.getElementById('score').textContent = gameState.score;
}

function addKill() {
  gameState.kills++;
  document.getElementById('kills').textContent = `${gameState.kills} / 100`;

  if (gameState.kills >= 100 && !gameState.bossActive && !boss) {
    spawnBoss();
  }
}

function takeDamage(amount) {
  gameState.health -= amount;
  gameState.health = Math.max(0, gameState.health);

  const healthBar = document.getElementById('healthBar');
  healthBar.style.width = `${gameState.health}%`;

  if (gameState.health <= 0 && !gameState.gameOver) {
    gameState.gameOver = true;
    endGame();
  }
}

function endGame() {
  gameState.isPlaying = false;
  document.getElementById('finalScore').textContent = gameState.score;
  document.getElementById('finalKills').textContent = gameState.kills;
  document.getElementById('gameOver').classList.remove('hidden');
}

function showVictory() {
  gameState.isPlaying = false;
  document.getElementById('victoryScore').textContent = gameState.score;
  document.getElementById('victory').classList.remove('hidden');
}

function resetGame() {
  gameState.score = 0;
  gameState.kills = 0;
  gameState.health = 100;
  gameState.bossActive = false;
  gameState.bossHealth = 10;
  gameState.gameOver = false;
  gameState.victory = false;
  gameState.isPlaying = true;

  // Clear entities
  enemies.forEach(e => scene.remove(e));
  enemies.length = 0;

  lasers.forEach(l => scene.remove(l));
  lasers.length = 0;

  enemyLasers.forEach(l => scene.remove(l));
  enemyLasers.length = 0;

  if (boss) {
    scene.remove(boss);
    boss = null;
  }

  // Reset UI
  document.getElementById('score').textContent = '0';
  document.getElementById('kills').textContent = '0 / 100';
  document.getElementById('healthBar').style.width = '100%';

  player.position.set(0, -3, 0);
}

// ===== UI EVENTS =====
document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('hud').style.display = 'block';
  resetGame();
});

document.getElementById('restartBtn').addEventListener('click', () => {
  document.getElementById('gameOver').classList.add('hidden');
  resetGame();
});

document.getElementById('victoryRestartBtn').addEventListener('click', () => {
  document.getElementById('victory').classList.add('hidden');
  resetGame();
});

// ===== RESIZE =====
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ===== GAME LOOP =====
const clock = new THREE.Clock();
let enemySpawnTimer = 0;

function animate() {
  const delta = clock.getDelta();

  // Rotate starfield slowly
  starfield.rotation.z += delta * 0.02;

  if (gameState.isPlaying) {
    updatePlayer(delta);
    updateLasers(delta);
    updateEnemies(delta);
    updateBoss(delta);
    updateExplosions(delta);

    // Spawn enemies
    if (!gameState.bossActive) {
      enemySpawnTimer -= delta;
      if (enemySpawnTimer <= 0) {
        enemySpawnTimer = 0.8 - (gameState.kills * 0.003); // Increase spawn rate
        enemySpawnTimer = Math.max(0.3, enemySpawnTimer);
        spawnEnemy();
      }
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
