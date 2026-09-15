// NEBULA X - lightweight mobile 3D arcade game
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x02030a);
scene.fog=new THREE.FogExp2(0x02030a,0.004);

const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,2000);
camera.position.set(0,1.8,8);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9bdfff,0x090014,1.1));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(4,8,6);scene.add(sun);

const player=new THREE.Group();scene.add(player);
function mat(c,e=0){return new THREE.MeshStandardMaterial({color:c,metalness:.75,roughness:.25,emissive:c,emissiveIntensity:e})}
const body=new THREE.Mesh(new THREE.ConeGeometry(.65,2.7,6),mat(0x8eeaff,.12));
body.rotation.x=Math.PI/2;player.add(body);
const cockpit=new THREE.Mesh(new THREE.SphereGeometry(.43,16,10),new THREE.MeshStandardMaterial({color:0x061b35,metalness:.8,roughness:.08,emissive:0x2abfff,emissiveIntensity:.6}));
cockpit.scale.set(1,.45,1);cockpit.position.z=-.15;player.add(cockpit);
const wingMat=mat(0x4dbdff,.2);
for(const s of [-1,1]){
  const w=new THREE.Mesh(new THREE.BoxGeometry(1.25,.08,.72),wingMat);
  w.position.set(s*.68,0,.2);w.rotation.z=s*.22;player.add(w);
}
const engineMat=mat(0xff4d9a,.7);
for(const s of [-.28,.28]){
  const e=new THREE.Mesh(new THREE.CylinderGeometry(.11,.18,.55,10),engineMat);
  e.rotation.x=Math.PI/2;e.position.set(s,-.08,1.25);player.add(e);
}
player.rotation.x=-.08;player.position.y=0;player.position.z=5;

const starGeo=new THREE.BufferGeometry(), starCount=1800, pos=new Float32Array(starCount*3);
for(let i=0;i<starCount;i++){pos[i*3]=(Math.random()-.5)*180;pos[i*3+1]=(Math.random()-.5)*100;pos[i*3+2]=-Math.random()*300;}
starGeo.setAttribute("position",new THREE.BufferAttribute(pos,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb9eaff,size:.65,sizeAttenuation:true})));

const objects=[], lasers=[], particles=[];
let score=0,best=Number(localStorage.getItem("nebulaXBest")||0),shield=100;
document.getElementById("best").textContent=best;

function asteroid(){
  const g=new THREE.IcosahedronGeometry(.7+Math.random()*1.3,1);
  const m=new THREE.MeshStandardMaterial({color:0x394052,roughness:1,metalness:.2});
  const o=new THREE.Mesh(g,m);
  o.position.set((Math.random()-.5)*16,(Math.random()-.5)*9,-90-Math.random()*130);
  o.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
  o.userData={speed:12+Math.random()*12,spin:.5+Math.random()};
  scene.add(o);objects.push(o);
}
function enemy(){
  const g=new THREE.OctahedronGeometry(1.15,1);
  const o=new THREE.Mesh(g,mat(0x9b42ff,.35));
  o.position.set((Math.random()-.5)*14,(Math.random()-.5)*8,-110-Math.random()*120);
  o.userData={speed:15+Math.random()*10,enemy:true};
  scene.add(o);objects.push(o);
}
for(let i=0;i<10;i++)asteroid();
for(let i=0;i<4;i++)enemy();

function shoot(){
  const l=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,2.2,8),new THREE.MeshBasicMaterial({color:0x6fffff}));
  l.rotation.x=Math.PI/2;l.position.copy(player.position);l.position.z-=1.7;
  scene.add(l);lasers.push(l);
}
function explode(p){
  for(let i=0;i<18;i++){
    const q=new THREE.Mesh(new THREE.SphereGeometry(.055,6,6),new THREE.MeshBasicMaterial({color:0xff7ac8}));
    q.position.copy(p);q.userData={life:1,v:new THREE.Vector3((Math.random()-.5)*8,(Math.random()-.5)*8,(Math.random()-.5)*8)};
    scene.add(q);particles.push(q);
  }
}

let joyX=0,joyY=0,boosting=false,firing=false,dead=false;
const joystick=document.getElementById("joystick"),stick=document.getElementById("stick");
function joy(e){
  const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  const p=e.touches?e.touches[0]:e,dx=p.clientX-cx,dy=p.clientY-cy,len=Math.hypot(dx,dy),max=42,k=Math.min(1,max/Math.max(len,1));
  joyX=dx*k/max;joyY=dy*k/max;stick.style.transform=`translate(${dx*k}px,${dy*k}px)`;
}
joystick.addEventListener("pointerdown",e=>{joystick.setPointerCapture(e.pointerId);joy(e)});
joystick.addEventListener("pointermove",e=>{if(e.buttons)joy(e)});
joystick.addEventListener("pointerup",()=>{joyX=joyY=0;stick.style.transform="translate(0,0)"});
const boost=document.getElementById("boost"),fire=document.getElementById("fire");
boost.onpointerdown=()=>boosting=true;boost.onpointerup=boost.onpointercancel=()=>boosting=false;
fire.onpointerdown=()=>firing=true;fire.onpointerup=fire.onpointercancel=()=>firing=false;

function damage(){
  shield-=22;document.getElementById("shieldBar").style.width=Math.max(0,shield)+"%";
  if(shield<=0)gameOver();
}
function gameOver(){
  dead=true;best=Math.max(best,Math.floor(score));localStorage.setItem("nebulaXBest",best);
  document.getElementById("best").textContent=best;
  document.getElementById("finalScore").textContent=Math.floor(score);
  document.getElementById("gameOver").classList.remove("hidden");
}
document.getElementById("restart").onclick=()=>location.reload();

let last=performance.now(),spawn=0,enemySpawn=0;
function loop(now){
  requestAnimationFrame(loop);const dt=Math.min(.033,(now-last)/1000);last=now;
  if(dead){renderer.render(scene,camera);return;}
  const speed=boosting?30:17;
  player.position.x+=joyX*8*dt;player.position.y-=joyY*8*dt;
  player.position.x=THREE.MathUtils.clamp(player.position.x,-6,6);
  player.position.y=THREE.MathUtils.clamp(player.position.y,-4,4);
  player.rotation.z=THREE.MathUtils.lerp(player.rotation.z,-joyX*.35,.12);
  player.rotation.x=THREE.MathUtils.lerp(player.rotation.x,-joyY*.18-.08,.12);

  spawn-=dt;enemySpawn-=dt;
  if(spawn<=0){asteroid();spawn=.55+Math.random()*.5}
  if(enemySpawn<=0){enemy();enemySpawn=2+Math.random()*2}

  for(let i=objects.length-1;i>=0;i--){
    const o=objects[i];o.position.z+=o.userData.speed*dt;o.rotation.x+=o.userData.spin*dt;o.rotation.y+=o.userData.spin*.7*dt;
    if(o.position.z>12){scene.remove(o);objects.splice(i,1);score+=o.userData.enemy?25:5;continue}
    if(o.position.distanceTo(player.position)<1.55){explode(o.position);scene.remove(o);objects.splice(i,1);damage();}
  }
  if(firing && Math.random()<.38)shoot();
  for(let i=lasers.length-1;i>=0;i--){
    const l=lasers[i];l.position.z-=55*dt;
    let hit=false;
    for(let j=objects.length-1;j>=0;j--){
      if(l.position.distanceTo(objects[j].position)<1.25){
        explode(objects[j].position);scene.remove(objects[j]);objects.splice(j,1);score+=25;hit=true;break;
      }
    }
    if(hit||l.position.z<-180){scene.remove(l);lasers.splice(i,1)}
  }
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.userData.life-=dt;p.position.addScaledVector(p.userData.v,dt);
    p.scale.multiplyScalar(.96);if(p.userData.life<=0){scene.remove(p);particles.splice(i,1)}
  }
  score+=dt*3;document.getElementById("score").textContent=Math.floor(score);
  renderer.render(scene,camera);
}
requestAnimationFrame(loop);

addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

