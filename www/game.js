/* =========================================================
   VALEN ISLAND SURVIVAL — FINAL SINGLE-FILE BUILD
   3D Android landscape survival game
   Replace www/game.js completely with this file.
   Requires Three.js r160 from index.html.
========================================================= */
(() => {
"use strict";
if (window.__VALEN_FINAL__) return;
window.__VALEN_FINAL__ = true;

const T = window.THREE;
if (!T) {
  document.body.innerHTML = '<div style="color:white;background:#071923;height:100vh;display:grid;place-items:center;font:700 22px Arial">Three.js gagal dimuat.</div>';
  return;
}

/* ---------- DATA ---------- */
const KEY="VALEN_ISLAND_SURVIVAL_FINAL_V1";
const SETTINGS_KEY="VALEN_SETTINGS_FINAL_V1";
const defaults={
  sensitivity:.006, invertY:false, joystickSize:1, buttonSize:1,
  autoPickup:true, damageNumbers:true, cameraShake:true,
  viewDistance:120, master:80, music:35, sfx:80, ambient:60,
  mute:false, quality:"High", fps:60, shadows:true, effects:true,
  language:"id", hud:true, vibration:true
};
let settings=Object.assign({},defaults,JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}"));
let save=Object.assign({
  wood:0,stone:0,coconut:0,berries:0,fish:0,cookedFish:0,meat:0,cookedMeat:0,
  crystal:0,metal:0,health:100,hunger:100,thirst:100,stamina:100,
  quest:0,chapter:1,time:8,days:0,ended:false,beacon:false,
  campfires:0,shelters:0,storages:0,achievements:[],kills:0,fishCaught:0,
  x:0,z:5
},JSON.parse(localStorage.getItem(KEY)||"{}"));

/* ---------- UTILS ---------- */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const pick=a=>a[Math.floor(Math.random()*a.length)];
function saveGame(){localStorage.setItem(KEY,JSON.stringify(save));localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings));}
function toast(msg){
  const el=document.getElementById("toast")||makeToast();
  el.textContent=msg; el.classList.add("show"); clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove("show"),1800);
}
function makeToast(){
  const e=document.createElement("div");e.id="toast";document.body.appendChild(e);return e;
}
function vibrate(ms=20){if(settings.vibration&&navigator.vibrate)navigator.vibrate(ms)}
function mat(c,rough=.8,metal=0){return new T.MeshStandardMaterial({color:c,roughness:rough,metalness:metal});}
function box(w,h,d,c){return new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));}
function cyl(r,h,c,seg=8){return new T.Mesh(new T.CylinderGeometry(r,r,h,seg),mat(c));}
function textSprite(txt,color="#fff",size=48){
  const cv=document.createElement("canvas"),cx=cv.getContext("2d");
  cv.width=256;cv.height=96;cx.font=`bold ${size}px Arial`;cx.textAlign="center";cx.textBaseline="middle";
  cx.fillStyle=color;cx.shadowColor="#000";cx.shadowBlur=8;cx.fillText(txt,128,48);
  const tx=new T.CanvasTexture(cv),m=new T.SpriteMaterial({map:tx,transparent:true,depthTest:false});
  const s=new T.Sprite(m);s.scale.set(2.4,.9,1);return s;
}

/* ---------- CSS/UI ---------- */
const style=document.createElement("style");
style.textContent=`
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#071923;font-family:Arial,sans-serif;touch-action:none;user-select:none}
canvas{position:fixed;inset:0;display:block}
#hud{position:fixed;inset:0;pointer-events:none;color:#fff}
#top{position:absolute;left:18px;top:14px;width:250px;background:rgba(3,14,20,.65);padding:10px;border:1px solid rgba(255,255,255,.12);border-radius:14px;backdrop-filter:blur(8px)}
.bar{height:13px;background:#16252c;border-radius:9px;overflow:hidden;margin:5px 0}.bar i{display:block;height:100%;width:100%;border-radius:9px}
#hp i{background:#ff5266}#food i{background:#ffb84d}#water i{background:#39bfff}#stam i{background:#64ed8a}
#inv{position:absolute;left:18px;bottom:16px;background:rgba(3,14,20,.72);padding:9px 12px;border-radius:13px;font-size:13px;max-width:480px}
#quest{position:absolute;top:14px;right:18px;width:310px;background:rgba(3,14,20,.65);padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.12)}
#map{position:absolute;right:18px;bottom:18px;width:145px;height:145px;border-radius:50%;background:rgba(2,14,19,.78);border:2px solid rgba(255,255,255,.22)}
.ctrl{position:absolute;pointer-events:auto;border:0;color:#fff;font-weight:900;border-radius:50%;background:rgba(10,30,38,.72);border:1px solid rgba(255,255,255,.2);box-shadow:0 8px 20px #0007}
#joy{left:30px;bottom:65px;width:135px;height:135px;border-radius:50%;background:rgba(255,255,255,.08);border:2px solid #ffffff30;pointer-events:auto}
#stick{position:absolute;width:58px;height:58px;left:37px;top:37px;border-radius:50%;background:#ffffff2a;border:2px solid #ffffff50}
#run{right:190px;bottom:45px;width:68px;height:68px}#jump{right:105px;bottom:120px;width:64px;height:64px}
#action{right:105px;bottom:38px;width:72px;height:72px;background:rgba(35,110,75,.78)}
#fish{right:190px;bottom:125px;width:62px;height:62px}
#build{right:275px;bottom:55px;width:58px;height:58px}
#attack{right:275px;bottom:125px;width:58px;height:58px}
#settingsBtn{position:absolute;right:18px;top:174px;width:48px;height:48px;border-radius:14px}
#panelWrap{position:fixed;inset:0;display:none;place-items:center;background:#0009;z-index:9000;pointer-events:auto}
#panel{width:min(720px,92vw);max-height:88vh;overflow:auto;background:#0b2029;color:#fff;border:1px solid #ffffff20;border-radius:20px;padding:20px;box-shadow:0 25px 80px #000}
.row{display:flex;justify-content:space-between;gap:12px;align-items:center;margin:10px 0}.row input[type=range]{width:52%}
.panelBtns{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.panelBtns button,.menu button{padding:12px;border:0;border-radius:12px;background:#183c49;color:white;font-weight:bold}
#menu,#buildMenu,#end{position:fixed;inset:0;z-index:9500;display:none;place-items:center;background:linear-gradient(#04131bcc,#061a22f2);color:white;text-align:center}
.card{width:min(680px,90vw);background:#0c2731;border:1px solid #ffffff18;border-radius:24px;padding:28px;box-shadow:0 25px 80px #000}
.card h1{font-size:clamp(28px,5vw,52px);margin:5px}.card p{color:#b9d2d8}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.grid button{min-height:65px}
#weather{position:fixed;inset:0;pointer-events:none;z-index:100;display:none;background:linear-gradient(#ffffff08,#ffffff00)}
#danger{position:fixed;inset:0;pointer-events:none;z-index:101;border:0 solid #f33;transition:border-width .2s}
#toast{position:fixed;left:50%;bottom:12%;transform:translate(-50%,20px);opacity:0;background:#071923dd;color:#fff;padding:12px 18px;border-radius:14px;z-index:9999;transition:.2s;font-weight:bold;pointer-events:none}
#toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-height:500px){#top{transform:scale(.82);transform-origin:top left}#quest{transform:scale(.82);transform-origin:top right}.ctrl{transform:scale(.9)}}
`;
document.head.appendChild(style);

const hud=document.createElement("div");hud.id="hud";hud.innerHTML=`
<div id="top"><b>VALEN ISLAND</b><div id="day">☀️ Day 1 • 08:00</div>
<div id="hp" class="bar"><i></i></div><div id="food" class="bar"><i></i></div><div id="water" class="bar"><i></i></div><div id="stam" class="bar"><i></i></div></div>
<div id="quest"></div><div id="inv"></div><canvas id="map" width="290" height="290"></canvas>
<button id="settingsBtn" class="ctrl">⚙</button>
<div id="joy"><div id="stick"></div></div>
<button id="run" class="ctrl">🏃</button><button id="jump" class="ctrl">⬆</button>
<button id="fish" class="ctrl">🎣</button><button id="action" class="ctrl">✋</button>
<button id="build" class="ctrl">🔨</button><button id="attack" class="ctrl">⚔</button>
</div>`;
document.body.appendChild(hud);
const wrap=document.createElement("div");wrap.id="panelWrap";wrap.innerHTML=`<div id="panel"><h2>⚙ SETTINGS</h2><div id="settingsContent"></div><button id="closePanel" style="margin-top:12px;width:100%;padding:13px;border:0;border-radius:12px">CLOSE</button></div>`;document.body.appendChild(wrap);
const menu=document.createElement("div");menu.id="menu";menu.innerHTML=`<div class="card menu"><h1>VALEN ISLAND</h1><p>3D Tropical Survival</p><button id="continue">CONTINUE</button><button id="newgame">NEW GAME</button><p style="font-size:12px">Landscape • Touch • Autosave</p></div>`;document.body.appendChild(menu);
const bm=document.createElement("div");bm.id="buildMenu";bm.innerHTML=`<div class="card menu"><h2>🔨 CRAFT & BUILD</h2><div class="grid">
<button data-build="fire">🔥 Campfire<br><small>5 Wood + 3 Stone</small></button>
<button data-build="shelter">🏕 Shelter<br><small>12 Wood + 8 Stone</small></button>
<button data-build="storage">📦 Storage<br><small>10 Wood + 4 Stone</small></button>
<button data-build="cookFish">🍳 Cook Fish<br><small>1 Fish</small></button>
<button data-build="cookMeat">🥩 Cook Meat<br><small>1 Meat</small></button>
<button data-build="close">✕ Close</button></div></div>`;document.body.appendChild(bm);
const end=document.createElement("div");end.id="end";end.innerHTML=`<div class="card"><h1>🚁 RESCUED</h1><p>Beacon berhasil menembus kabut. Pulau ini belum benar-benar selesai menjawab misterinya.</p><button id="freeRoam" style="padding:14px;border:0;border-radius:12px">FREE ROAM</button></div>`;document.body.appendChild(end);

/* ---------- THREE WORLD ---------- */
const scene=new T.Scene();
scene.background=new T.Color(0x78c9e8);
scene.fog=new T.Fog(0x78c9e8,45,settings.viewDistance);
const camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.1,settings.viewDistance);
const renderer=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,settings.quality==="Low"?1:settings.quality==="Medium"?1.5:2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=settings.shadows;
renderer.shadowMap.type=T.PCFSoftShadowMap;
document.body.insertBefore(renderer.domElement,document.body.firstChild);

scene.add(new T.HemisphereLight(0xbdefff,0x29402c,1.35));
const sun=new T.DirectionalLight(0xfff1c1,2.1);sun.position.set(-35,55,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const island=new T.Mesh(new T.CylinderGeometry(290,340,2,96),mat(0x4e8c3e));
island.position.y=-1;island.scale.z=1.08;island.receiveShadow=true;scene.add(island);
const beach=new T.Mesh(new T.CylinderGeometry(340,350,1,96),mat(0xd9bd78));beach.position.y=-2;beach.scale.z=1.08;scene.add(beach);
const ocean=new T.Mesh(new T.CylinderGeometry(950,950,.8,96),new T.MeshStandardMaterial({color:0x147fa2,roughness:.18,metalness:.05,transparent:true,opacity:.94}));
ocean.position.y=-2.55;scene.add(ocean);

const objects=[],resources=[],animals=[],buildings=[],rain=[];
function addObj(o,type,x,z,extra={}){
  o.position.set(x,extra.y||0,z);o.userData=Object.assign({type},extra);scene.add(o);objects.push(o);return o;
}
function insideIsland(x,z){return (x*x)/(29*29)+(z*z)/(32*32)<1}

function palm(x,z,scale=1){
  const g=new T.Group();const trunk=cyl(.38,5,0x8a5a31,7);trunk.position.y=2.5;trunk.rotation.z=rnd(-.06,.06);g.add(trunk);
  for(let i=0;i<7;i++){const leaf=new T.Mesh(new T.ConeGeometry(.35,5,5),mat(0x1c7b3e));leaf.position.y=5.1;leaf.rotation.z=Math.PI/2;leaf.rotation.y=i*Math.PI*2/7;leaf.translateX(1.8);g.add(leaf)}
  g.scale.setScalar(scale);g.userData={type:"palm",phase:rnd(0,6)};scene.add(g);objects.push(g);
}
for(let i=0;i<16;i++){let a=rnd(0,Math.PI*2),r=rnd(10,26);palm(Math.cos(a)*r,Math.sin(a)*r,rnd(.8,1.2))}
for(let i=0;i<15;i++){let a=rnd(0,6.28),r=rnd(4,25),x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(!insideIsland(x,z))continue;
 const g=new T.Group();const tr=cyl(.45,3.2,0x67442a,8);tr.position.y=1.6;g.add(tr);
 const crown=new T.Mesh(new T.IcosahedronGeometry(2.0,1),mat(pick([0x287342,0x2d8b48,0x3d9b52])));crown.position.y=3.2;g.add(crown);
 addObj(g,"tree",x,z,{hp:3,resource:"wood"});
}
for(let i=0;i<18;i++){let a=rnd(0,6.28),r=rnd(5,29),x=Math.cos(a)*r,z=Math.sin(a)*r;if(!insideIsland(x,z))continue;
 const o=new T.Mesh(new T.DodecahedronGeometry(rnd(.45,.8),0),mat(0x6d7074));addObj(o,"rock",x,z,{hp:2,resource:"stone"});}
for(let i=0;i<14;i++){let a=rnd(0,6.28),r=rnd(7,28),x=Math.cos(a)*r,z=Math.sin(a)*r;if(!insideIsland(x,z))continue;
 const o=new T.Mesh(new T.IcosahedronGeometry(.75,1),mat(0x9b3e4d));addObj(o,"berry",x,z,{resource:"berries"});}

const ruins=new T.Group();for(let i=0;i<6;i++){let p=box(2.2,4+rnd(0,3),1,0x70665a);p.position.set((i-3)*3,2,rnd(-2,2));p.rotation.y=rnd(0,.4);ruins.add(p)}ruins.position.set(-210,0,-175);scene.add(ruins);
const crystal=new T.Mesh(new T.OctahedronGeometry(1.15),new T.MeshStandardMaterial({color:0x69f4ff,emissive:0x1cc8dd,emissiveIntensity:1.4,roughness:.2,metalness:.25}));
crystal.position.set(-214,1,-179);crystal.userData={type:"crystal"};scene.add(crystal);objects.push(crystal);

/* ---------- PLAYER ---------- */
const player=new T.Group();
const body=cyl(.55,1.35,0x2266b3,10);body.position.y=1.0;player.add(body);
const head=new T.Mesh(new T.SphereGeometry(.5,16,12),mat(0xf0b27a));head.position.y=2.05;player.add(head);
const hat=cyl(.65,.22,0x172333,12);hat.position.y=2.48;player.add(hat);
const pack=box(.72,.9,.35,0x493a2b);pack.position.set(0,1.1,-.48);player.add(pack);
player.position.set(save.x||0,0,save.z||5);scene.add(player);

/* ---------- ANIMALS ---------- */
function animal(type,x,z){
 const g=new T.Group();const col=type==="boar"?0x69462e:0xc7b7a0;
 const b=new T.Mesh(new T.BoxGeometry(1.45,.75,2),mat(col));b.position.y=.7;g.add(b);
 const h=new T.Mesh(new T.SphereGeometry(.55,10,8),mat(col));h.position.set(0,.9,1);g.add(h);
 if(type==="boar"){for(let i=-1;i<=1;i+=2){let e=cyl(.11,.5,0x3b281d,6);e.position.set(i*.35,.25,.55);g.add(e)}}
 g.position.set(x,0,z);g.userData={type,hp:type==="boar"?30:10,dir:rnd(0,6.28),speed:type==="boar"?1.2:.8,next:0,alive:true};
 scene.add(g);animals.push(g);
}
for(let i=0;i<5;i++){let a=rnd(0,6.28),r=rnd(9,25);animal("boar",Math.cos(a)*r,Math.sin(a)*r)}
for(let i=0;i<3;i++){let a=rnd(0,6.28),r=rnd(15,30);animal("crab",Math.cos(a)*r,Math.sin(a)*r)}

/* ---------- BUILDING ---------- */
function build(type){
 const cost={fire:{wood:5,stone:3},shelter:{wood:12,stone:8},storage:{wood:10,stone:4}}[type];
 if(save.wood<(cost.wood||0)||save.stone<(cost.stone||0)){toast("❌ Resource kurang");return}
 save.wood-=cost.wood;save.stone-=cost.stone;
 const g=new T.Group();g.position.copy(player.position);g.position.y=0;
 if(type==="fire"){
   const base=cyl(.9,.3,0x4b3a2b,10);base.position.y=.15;g.add(base);
   for(let i=0;i<3;i++){let f=new T.Mesh(new T.ConeGeometry(.28,1.4,7),new T.MeshStandardMaterial({color:0xff7a21,emissive:0xff3300,emissiveIntensity:1.5}));f.position.y=1;f.rotation.z=rnd(-.25,.25);g.add(f)}
   g.userData={type:"campfire"};save.campfires++;
 }else if(type==="shelter"){
   const floor=box(5,.25,4,0x69482e);floor.position.y=.15;g.add(floor);
   for(const [x,z] of [[-2,-1.5],[2,-1.5],[-2,1.5],[2,1.5]]){let p=box(.25,3,.25,0x6d492b);p.position.set(x,1.5,z);g.add(p)}
   const roof=new T.Mesh(new T.ConeGeometry(3.3,3.1,4),mat(0x4d3324));roof.rotation.y=Math.PI/4;roof.position.y=3.5;g.add(roof);
   g.userData={type:"shelter"};save.shelters++;
 }else{
   const c=box(2.5,1.8,1.6,0x6d482b);c.position.y=.9;g.add(c);
   const lid=box(2.6,.2,1.7,0x9b6a3b);lid.position.y=1.85;g.add(lid);g.userData={type:"storage"};save.storages++;
 }
 scene.add(g);buildings.push(g);toast(type==="fire"?"🔥 Campfire dibuat":type==="shelter"?"🏕 Shelter dibuat":"📦 Storage dibuat");saveGame();checkAchievements();
}

/* ---------- INPUT: CLEAN CAMERA SYSTEM ---------- */
let moveX=0,moveY=0,running=false,jumpV=0;
let yaw=0,pitch=-.18;
let camPointer=null, joyPointer=null;
const joy=document.getElementById("joy"),stick=document.getElementById("stick");
function isUI(e){return e.target.closest("button,#joy,#panelWrap,#buildMenu,#menu,#end")}
joy.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);updateJoy(e)},true);
joy.addEventListener("pointermove",e=>{if(e.pointerId===joyPointer){e.preventDefault();updateJoy(e)}},true);
function updateJoy(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,m=Math.hypot(dx,dy),lim=r.width*.36;if(m>lim){dx=dx/m*lim;dy=dy/m*lim}moveX=dx/lim;moveY=dy/lim;stick.style.transform=`translate(${dx}px,${dy}px)`}
function clearJoy(e){if(e.pointerId===joyPointer){joyPointer=null;moveX=moveY=0;stick.style.transform="translate(0,0)"}}
joy.addEventListener("pointerup",clearJoy,true);joy.addEventListener("pointercancel",clearJoy,true);

document.addEventListener("pointerdown",e=>{
 if(e.pointerType==="mouse"||isUI(e))return;
 if(e.clientX<innerWidth*.43)return;
 camPointer={id:e.pointerId,x:e.clientX,y:e.clientY};
},true);
document.addEventListener("pointermove",e=>{
 if(!camPointer||e.pointerId!==camPointer.id)return;
 const dx=e.clientX-camPointer.x,dy=e.clientY-camPointer.y;
 yaw-=dx*settings.sensitivity;
 pitch-=((settings.invertY?-dy:dy)*settings.sensitivity);
 pitch=clamp(pitch,-1.05,.42);
 camPointer.x=e.clientX;camPointer.y=e.clientY;
},true);
document.addEventListener("pointerup",e=>{if(camPointer&&e.pointerId===camPointer.id)camPointer=null},true);
document.addEventListener("pointercancel",e=>{if(camPointer&&e.pointerId===camPointer.id)camPointer=null},true);

document.getElementById("run").onpointerdown=e=>{e.preventDefault();running=true};document.getElementById("run").onpointerup=()=>running=false;document.getElementById("run").onpointercancel=()=>running=false;
document.getElementById("jump").onclick=()=>{if(player.position.y<.05){jumpV=5;vibrate(25)}};
document.getElementById("action").onclick=()=>gather();
document.getElementById("attack").onclick=()=>attack();
document.getElementById("build").onclick=()=>bm.style.display="grid";
document.getElementById("fish").onclick=()=>fish();

bm.querySelectorAll("[data-build]").forEach(b=>b.onclick=()=>{
 const t=b.dataset.build;if(t==="close"){bm.style.display="none";return}
 if(t==="cookFish"||t==="cookMeat"){cook(t==="cookFish"?"fish":"meat");return}
 build(t);
});
function nearestResource(){
 let n=null,d=3.2;for(const o of objects){if(!o.visible||!o.userData.resource)continue;let q=dist(player.position,o.position);if(q<d){d=q;n=o}}return n;
}
function gather(){
 const n=nearestResource();
 if(n){
  const r=n.userData.resource;save[r]=(save[r]||0)+1;n.visible=false;
  toast(r==="wood"?"🪵 Wood +1":r==="stone"?"🪨 Stone +1":r==="berries"?"🫐 Berries +1":"💎 Crystal +1");
  if(r==="wood")save.quest=Math.max(save.quest,1);
  saveGame();checkAchievements();vibrate(18);return;
 }
 toast("Tidak ada resource dekat");
}
function attack(){
 let n=null,d=3.3;for(const a of animals){if(!a.visible)continue;let q=dist(player.position,a.position);if(q<d){d=q;n=a}}
 if(!n){toast("Tidak ada hewan di dekatmu");return}
 n.userData.hp-=10;if(settings.damageNumbers){const s=textSprite("-10","#ff7777");s.position.copy(n.position);s.position.y=2;scene.add(s);setTimeout(()=>scene.remove(s),500)}
 shake(.12);sfx(160,.08);vibrate(30);
 if(n.userData.hp<=0){n.visible=false;save.kills++;save.meat++;toast("🐗 Hewan dikalahkan • Meat +1");saveGame();checkAchievements()}
 else toast("💥 Serangan mengenai!");
}
function fish(){
 const r=Math.hypot(player.position.x,player.position.z);
 if(r>300){toast("🌊 Dekati air / pantai untuk memancing");return}
 if(save.stone<0)return;
 const chance=Math.random();
 if(chance<.12){save.fish++;save.fishCaught++;toast("🎣 Rare fish! +1");}
 else if(chance<.72){save.fish++;save.fishCaught++;toast("🎣 Fish +1")}
 else toast("🎣 Ikan kabur!");
 save.quest=Math.max(save.quest,2);saveGame();checkAchievements();vibrate(35);sfx(240,.1);
}
function cook(type){
 if(save.campfires<1){toast("🔥 Buat Campfire dulu");return}
 if(type==="fish"&&save.fish>0){save.fish--;save.cookedFish++;save.hunger=clamp(save.hunger+28,0,100);toast("🍳 Cooked Fish +1")}
 else if(type==="meat"&&save.meat>0){save.meat--;save.cookedMeat++;save.hunger=clamp(save.hunger+35,0,100);toast("🥩 Cooked Meat +1")}
 else {toast("Bahan makanan tidak ada");return}
 saveGame();checkAchievements();
}

/* ---------- QUEST / ACHIEVEMENTS ---------- */
const quests=[
["CHAPTER 1 — SURVIVE","Kumpulkan Wood dan Stone."],
["CHAPTER 1 — SURVIVE","Buat Campfire."],
["CHAPTER 2 — SHELTER","Bangun Shelter dan bertahan malam."],
["CHAPTER 3 — RUINS","Temukan reruntuhan kuno."],
["CHAPTER 3 — MYSTERY","Ambil Crystal di dekat ruins."],
["CHAPTER 4 — SIGNAL","Bangun Campfire, lalu siapkan sinyal."],
["CHAPTER 4 — SIGNAL","Aktifkan Beacon di reruntuhan."],
["CHAPTER 5 — RESCUE","Pulau bebas dijelajahi. Cari jalan pulang."]
];
function questText(){
 let q=save.quest||0;
 if(q===0&&save.wood>=5&&save.stone>=3)save.quest=1;
 if(q===1&&save.campfires>0)save.quest=2;
 if(q===2&&save.shelters>0&&save.days>=1)save.quest=3;
 if(q===3&&dist(player.position,ruins.position)<8)save.quest=4;
 if(q===4&&save.crystal>0)save.quest=5;
 if(q===5&&save.campfires>0&&save.shelters>0)save.quest=6;
 if(q===6&&save.beacon)save.quest=7;
 save.chapter=save.quest<2?1:save.quest<3?2:save.quest<5?3:save.quest<7?4:5;
 return quests[save.quest]||quests[7];
}
function unlock(name,desc){save.achievements=save.achievements||[];if(save.achievements.includes(name))return;save.achievements.push(name);toast("🏆 "+name);saveGame()}
function checkAchievements(){
 if(save.wood>0)unlock("FIRST WOOD","Gather your first wood");
 if(save.fishCaught>0)unlock("FISHERMAN","Catch a fish");
 if(save.campfires>0)unlock("FIRE KEEPER","Build a campfire");
 if(save.shelters>0)unlock("HOME","Build a shelter");
 if(save.crystal>0)unlock("ANCIENT LIGHT","Find the crystal");
 if(save.kills>=3)unlock("HUNTER","Defeat 3 animals");
 if(save.days>=5)unlock("ISLAND LEGEND","Survive five days");
 if(save.ended)unlock("RESCUED","Activate the rescue ending");
}

/* ---------- BEACON ---------- */
const beacon=new T.Group();beacon.position.set(-13,0,-11);
const bbase=cyl(1.2,.4,0x343434,10);bbase.position.y=.2;beacon.add(bbase);
const pole=cyl(.12,5,0x55585c,8);pole.position.y=2.5;beacon.add(pole);
const lamp=new T.Mesh(new T.SphereGeometry(.45,12,8),new T.MeshStandardMaterial({color:0x8ffaff,emissive:0x3aefff,emissiveIntensity:4}));lamp.position.y=5;beacon.add(lamp);
beacon.visible=false;scene.add(beacon);
function activateBeacon(){
 if(save.quest<6){toast("📡 Belum siap. Selesaikan quest.");return}
 if(dist(player.position,beacon.position)>5){toast("📡 Dekati beacon di ruins");return}
 save.beacon=true;save.ended=true;beacon.visible=true;end.style.display="grid";saveGame();checkAchievements();sfx(620,.4);
}
const beaconBtn=document.createElement("button");beaconBtn.className="ctrl";beaconBtn.textContent="📡";beaconBtn.style.cssText="right:20px;bottom:180px;width:55px;height:55px;display:none;position:absolute;pointer-events:auto";hud.appendChild(beaconBtn);beaconBtn.onclick=activateBeacon;

/* ---------- DAY / NIGHT / WEATHER ---------- */
let weather="clear",weatherTimer=35,shakePower=0;
const weatherEl=document.getElementById("weather");
const rainGeo=new T.BufferGeometry(), rainPos=new Float32Array(500*3);
for(let i=0;i<500;i++){rainPos[i*3]=rnd(-320,320);rainPos[i*3+1]=rnd(2,55);rainPos[i*3+2]=rnd(-320,320)}
rainGeo.setAttribute("position",new T.BufferAttribute(rainPos,3));
const rainMat=new T.PointsMaterial({color:0xbdeaff,size:.13,transparent:true,opacity:.8});
const rainPts=new T.Points(rainGeo,rainMat);rainPts.visible=false;scene.add(rainPts);
function setWeather(w){weather=w;rainPts.visible=w==="rain"||w==="storm";weatherEl.style.display=rainPts.visible?"block":"none";if(w==="storm")toast("⛈ Badai datang!");}
function updateWeather(dt){
 weatherTimer-=dt;if(weatherTimer<=0){weatherTimer=rnd(45,85);setWeather(pick(["clear","clear","cloud","rain","storm"]))}
 if(rainPts.visible){const p=rainGeo.attributes.position;for(let i=0;i<500;i++){let y=p.getY(i)-dt*18;if(y<0)y=rnd(25,35);p.setY(i,y)}p.needsUpdate=true}
}

/* ---------- AUDIO ---------- */
let audioCtx=null;
function sfx(freq,dur=.08){
 if(settings.mute||settings.sfx<=0)return;
 try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();
 const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.frequency.value=freq;o.type="sine";g.gain.value=(settings.sfx/100)*.025;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);o.stop(audioCtx.currentTime+dur)}catch(_){}
}
document.addEventListener("pointerdown",()=>{try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume()}catch(_){}} ,{once:true});

/* ---------- CAMERA / MOVEMENT ---------- */
function shake(v){if(settings.cameraShake)shakePower=Math.max(shakePower,v)}
function updatePlayer(dt){
 let len=Math.hypot(moveX,moveY);if(len>.05){
   const sp=(running?6:3.2);
   const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);
   player.position.x+=(rx*moveX+fx*(-moveY))*sp*dt;
   player.position.z+=(rz*moveX+fz*(-moveY))*sp*dt;
   player.rotation.y=Math.atan2(player.position.x-(player.position.x-(rx*moveX+fx*(-moveY))),player.position.z-(player.position.z-(rz*moveX+fz*(-moveY))));
   save.stamina=clamp(save.stamina-(running?12:4)*dt,0,100);
 }else save.stamina=clamp(save.stamina+16*dt,0,100);
 if(running&&save.stamina<3)running=false;
 jumpV-=13*dt;player.position.y+=jumpV*dt;if(player.position.y<0){player.position.y=0;jumpV=0}
 const r=Math.hypot(player.position.x,player.position.z);if(r>335){player.position.x*=335/r;player.position.z*=335/r}
 save.x=player.position.x;save.z=player.position.z;
}
function updateCamera(dt){
 const target=new T.Vector3(player.position.x,player.position.y+1.4,player.position.z);
 const horiz=11,vert=3.2;
 const cp=Math.cos(pitch),sp=Math.sin(pitch);
 const off=new T.Vector3(Math.sin(yaw)*cp*horiz, -sp*vert+2.2, Math.cos(yaw)*cp*horiz);
 const desired=target.clone().add(off);
 camera.position.lerp(desired,1-Math.pow(.001,dt));
 camera.lookAt(target);
 if(shakePower>0){camera.position.x+=rnd(-shakePower,shakePower);camera.position.y+=rnd(-shakePower,shakePower);shakePower*=Math.pow(.02,dt)}
}

/* ---------- SURVIVAL ---------- */
let autosave=0;
function survival(dt){
 save.hunger=clamp(save.hunger-dt*.55,0,100);
 save.thirst=clamp(save.thirst-dt*.8,0,100);
 if(save.hunger<=0||save.thirst<=0)save.health=clamp(save.health-dt*2,0,100);
 if(save.health<=0){save.health=55;save.hunger=35;save.thirst=35;player.position.set(0,0,5);toast("☠ Kamu pingsan dan kembali ke pantai");}
 if(save.time===undefined)save.time=8;
 save.time+=dt*.08;
 if(save.time>=24){save.time-=24;save.days++;checkAchievements();toast("🌅 Hari baru: "+(save.days+1))}
 const night=save.time<6||save.time>18;
 sun.intensity=night?.28:2.1;
 scene.background.set(night?0x07152c:weather==="storm"?0x526a76:weather==="cloud"?0x79a3aa:0x78c9e8);
 scene.fog.color.copy(scene.background);
 if(dist(player.position,ruins.position)<8){save.health=clamp(save.health-dt*.8,0,100);document.getElementById("danger").style.borderWidth="10px"}else document.getElementById("danger").style.borderWidth="0";
 if(settings.autoPickup){const n=nearestResource();if(n&&dist(player.position,n.position)<1.65)gather()}
 autosave+=dt;if(autosave>8){autosave=0;saveGame()}
}

/* ---------- WORLD ANIMATION ---------- */
let elapsed=0;
function animateWorld(dt){
 elapsed+=dt;
 objects.forEach(o=>{
   if(o.userData.type==="palm")o.rotation.z=Math.sin(elapsed*1.1+o.userData.phase)*.025;
   if(o.userData.type==="crystal")o.rotation.y+=dt*1.5;
 });
 buildings.forEach(g=>{if(g.userData.type==="campfire")g.children.slice(1).forEach((f,i)=>f.scale.y=1+Math.sin(elapsed*8+i)*.15)});
 animals.forEach(a=>{
   if(!a.visible)return;
   if(elapsed>a.userData.next){a.userData.next=elapsed+rnd(1,4);a.userData.dir+=rnd(-1,1)}
   a.position.x+=Math.sin(a.userData.dir)*a.userData.speed*dt;a.position.z+=Math.cos(a.userData.dir)*a.userData.speed*dt;
   if(!insideIsland(a.position.x,a.position.z)){a.userData.dir+=Math.PI}
   if(a.userData.type==="boar"&&dist(a.position,player.position)<5){a.userData.dir=Math.atan2(player.position.x-a.position.x,player.position.z-a.position.z);if(dist(a.position,player.position)<1.7){save.health=clamp(save.health-dt*7,0,100);shake(.04)}}
 });
}

/* ---------- MINIMAP ---------- */
const mc=document.getElementById("map"),mx=mc.getContext("2d");
function minimap(){
 mx.clearRect(0,0,290,290);mx.fillStyle="#0a313b";mx.beginPath();mx.arc(145,145,135,0,Math.PI*2);mx.fill();
 mx.fillStyle="#6c9d4a";mx.beginPath();mx.ellipse(145,145,112,122,0,0,Math.PI*2);mx.fill();
 mx.fillStyle="#8a7661";mx.fillRect(75,75,30,20);
 mx.fillStyle="#6ff";const px=145+player.position.x*.34,pz=145+player.position.z*.34;mx.beginPath();mx.arc(px,pz,6,0,7);mx.fill();
 mx.fillStyle="#f7d45a";const rx=145+ruins.position.x*.34,rz=145+ruins.position.z*.34;mx.beginPath();mx.arc(rx,rz,5,0,7);mx.fill();
 mx.fillStyle="#f66";animals.forEach(a=>{if(a.visible){mx.beginPath();mx.arc(145+a.position.x*.34,145+a.position.z*.34,3,0,7);mx.fill()}});
}

/* ---------- HUD ---------- */
function updateHUD(){
 const q=questText();document.querySelector("#quest").innerHTML=`<b>📜 ${q[0]}</b><br><span style="font-size:13px">${q[1]}</span>`;
 const pct=(id,v)=>document.querySelector(id+" i").style.width=clamp(v,0,100)+"%";
 pct("#hp",save.health);pct("#food",save.hunger);pct("#water",save.thirst);pct("#stam",save.stamina);
 const h=Math.floor(save.time),m=Math.floor((save.time-h)*60);
 document.getElementById("day").textContent=`${h>=6&&h<18?"☀️":"🌙"} Day ${save.days+1} • ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
 document.getElementById("inv").textContent=`🪵 ${save.wood}  🪨 ${save.stone}  🥥 ${save.coconut}  🫐 ${save.berries}  🎣 ${save.fish}  🍳 ${save.cookedFish}  🥩 ${save.meat}  💎 ${save.crystal}`;
 const nearBeacon=dist(player.position,beacon.position)<6;beaconBtn.style.display=nearBeacon?"block":"none";
}
setInterval(updateHUD,250);setInterval(minimap,100);

/* ---------- SETTINGS ---------- */
function renderSettings(){
 const c=document.getElementById("settingsContent");
 c.innerHTML=`
 <div class="row">Language <select id="sLang"><option value="id">Indonesia</option><option value="en">English</option></select></div>
 <div class="row">Sensitivity <input id="sSens" type="range" min=".001" max=".015" step=".001" value="${settings.sensitivity}"></div>
 <div class="row">Invert Y <input id="sInv" type="checkbox" ${settings.invertY?"checked":""}></div>
 <div class="row">Joystick Size <input id="sJoy" type="range" min=".7" max="1.5" step=".05" value="${settings.joystickSize}"></div>
 <div class="row">Button Size <input id="sBtn" type="range" min=".7" max="1.5" step=".05" value="${settings.buttonSize}"></div>
 <div class="row">Auto Pickup <input id="sAuto" type="checkbox" ${settings.autoPickup?"checked":""}></div>
 <div class="row">Camera Shake <input id="sShake" type="checkbox" ${settings.cameraShake?"checked":""}></div>
 <div class="row">Damage Numbers <input id="sDmg" type="checkbox" ${settings.damageNumbers?"checked":""}></div>
 <div class="row">View Distance <input id="sView" type="range" min="50" max="180" step="10" value="${settings.viewDistance}"></div>
 <div class="row">Graphics <select id="sQ"><option>Low</option><option>Medium</option><option>High</option></select></div>
 <div class="row">Shadows <input id="sShadow" type="checkbox" ${settings.shadows?"checked":""}></div>
 <div class="row">Master <input id="sMaster" type="range" min="0" max="100" value="${settings.master}"></div>
 <div class="row">SFX <input id="sSfx" type="range" min="0" max="100" value="${settings.sfx}"></div>
 <div class="row">Ambient <input id="sAmb" type="range" min="0" max="100" value="${settings.ambient}"></div>
 <div class="row">Mute <input id="sMute" type="checkbox" ${settings.mute?"checked":""}></div>
 <div class="panelBtns"><button id="eat">🍳 Eat Cooked Fish</button><button id="drink">🥥 Drink Coconut</button><button id="saveBtn">💾 Save</button><button id="resetBtn">♻ Reset Save</button></div>`;
 c.querySelector("#sLang").value=settings.language;c.querySelector("#sQ").value=settings.quality;
 const bind=(id,key,type="value")=>c.querySelector(id).addEventListener(type==="checked"?"change":"input",e=>{settings[key]=type==="checked"?e.target.checked:Number(e.target.value);if(type==="value"&&key==="sensitivity")settings[key]=Number(e.target.value);applySettings();saveGame()});
 bind("#sSens","sensitivity");bind("#sInv","invertY","checked");bind("#sJoy","joystickSize");bind("#sBtn","buttonSize");bind("#sAuto","autoPickup","checked");bind("#sShake","cameraShake","checked");bind("#sDmg","damageNumbers","checked");bind("#sView","viewDistance");bind("#sShadow","shadows","checked");bind("#sMaster","master");bind("#sSfx","sfx");bind("#sAmb","ambient");bind("#sMute","mute","checked");
 c.querySelector("#sQ").onchange=e=>{settings.quality=e.target.value;applySettings();saveGame()};c.querySelector("#sLang").onchange=e=>{settings.language=e.target.value;saveGame()};
 c.querySelector("#eat").onclick=()=>{if(save.cookedFish){save.cookedFish--;save.hunger=clamp(save.hunger+30,0,100);saveGame();toast("🍳 +30 Hunger");renderSettings()}};
 c.querySelector("#drink").onclick=()=>{if(save.coconut){save.coconut--;save.thirst=clamp(save.thirst+30,0,100);saveGame();toast("🥥 +30 Thirst");renderSettings()}};
 c.querySelector("#saveBtn").onclick=()=>{saveGame();toast("💾 Game saved")};
 c.querySelector("#resetBtn").onclick=()=>{if(confirm("Reset semua progress?")){localStorage.removeItem(KEY);location.reload()}};
}
function applySettings(){
 const ratio=Math.min(devicePixelRatio,settings.quality==="Low"?1:settings.quality==="Medium"?1.5:2);renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight,false);
 renderer.shadowMap.enabled=settings.shadows;camera.far=settings.viewDistance;camera.updateProjectionMatrix();scene.fog.far=settings.viewDistance;
 joy.style.transform=`scale(${settings.joystickSize})`;joy.style.transformOrigin="bottom left";
 document.querySelectorAll(".ctrl").forEach(b=>{if(b.id!=="settingsBtn")b.style.scale=settings.buttonSize});
}
document.getElementById("settingsBtn").onclick=()=>{renderSettings();wrap.style.display="grid"};
document.getElementById("closePanel").onclick=()=>wrap.style.display="none";
wrap.addEventListener("pointerdown",e=>{if(e.target===wrap)e.stopPropagation()});

/* ---------- MENU / SAVE ---------- */
document.getElementById("continue").onclick=()=>{menu.style.display="none";startAudio();};
document.getElementById("newgame").onclick=()=>{if(confirm("Mulai game baru?")){localStorage.removeItem(KEY);location.reload()}};
document.getElementById("freeRoam").onclick=()=>{end.style.display="none";save.ended=true;saveGame()};
function startAudio(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume()}catch(_){}}
let started=!!localStorage.getItem(KEY);
if(!started){menu.style.display="grid"}else startAudio();

/* ---------- LOOP ---------- */
let last=performance.now(),fpsAcc=0,fpsFrames=0;
function loop(now){
 requestAnimationFrame(loop);let dt=Math.min(.05,(now-last)/1000);last=now;
 updatePlayer(dt);updateCamera(dt);survival(dt);updateWeather(dt);animateWorld(dt);
 if(save.ended)beacon.visible=true;
 fpsAcc+=dt;fpsFrames++;
 renderer.render(scene,camera);
}
requestAnimationFrame(loop);
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)});
applySettings();updateHUD();makeToast();saveGame();
console.log("VALEN ISLAND SURVIVAL — FINAL BUILD LOADED");
})();
