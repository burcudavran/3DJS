import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

// 1. SAHNE, KAMERA VE RENDERER
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x211b1b);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(4.8, 3.6, 7.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// 2. KAMERA KONTROLLERİ
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.1, 0);
controls.maxPolarAngle = Math.PI / 2 - 0.04;

// 3. MATERYALLER
const ceramicMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb85f4d,
  metalness: 0.05,
  roughness: 0.2,
  clearcoat: 0.7,
  clearcoatRoughness: 0.14
});

const edgeMaterial = new THREE.MeshStandardMaterial({
  color: 0xdda57a,
  metalness: 0.28,
  roughness: 0.24
});

const openingMaterial = new THREE.MeshStandardMaterial({
  color: 0x241716,
  metalness: 0.0,
  roughness: 0.8
});

// 4. VAZO GRUBU
const vaseGroup = new THREE.Group();
vaseGroup.position.y = 1.18;
scene.add(vaseGroup);

// Geniş gövde: silindir
const body = new THREE.Mesh(
  new THREE.CylinderGeometry(1.52, 1.68, 2.25, 32),
  ceramicMaterial
);
body.castShadow = true;
body.receiveShadow = true;
vaseGroup.add(body);

// Omuz: altı geniş, üstü daralan silindir
const shoulder = new THREE.Mesh(
  new THREE.CylinderGeometry(0.92, 1.52, 0.72, 32),
  ceramicMaterial
);
shoulder.position.y = 1.48;
shoulder.castShadow = true;
shoulder.receiveShadow = true;
vaseGroup.add(shoulder);

// Boyun: ince silindir
const neck = new THREE.Mesh(
  new THREE.CylinderGeometry(0.82, 0.92, 0.82, 32),
  ceramicMaterial
);
neck.position.y = 2.22;
neck.castShadow = true;
neck.receiveShadow = true;
vaseGroup.add(neck);

// Ağız çevresi: torus
const rim = new THREE.Mesh(
  new THREE.TorusGeometry(0.83, 0.11, 16, 32),
  edgeMaterial
);
rim.rotation.x = Math.PI / 2;
rim.position.y = 2.66;
rim.castShadow = true;
vaseGroup.add(rim);

// İç boşluk izlenimi: ince koyu silindir
const opening = new THREE.Mesh(
  new THREE.CylinderGeometry(0.68, 0.68, 0.035, 32),
  openingMaterial
);
opening.position.y = 2.64;
vaseGroup.add(opening);

// 4.1. NOTLARDAKİ TEMEL GEOMETRİLERLE ÜÇ SADE ÇİÇEK
const stemMaterial = new THREE.MeshStandardMaterial({
  color: 0x5d7547,
  roughness: 0.75,
  metalness: 0.0
});

const flowerColors = [0xd98983, 0xe4ad65, 0xe9d9c4];
const stemGeometry = new THREE.CylinderGeometry(0.035, 0.05, 1.42, 12);
const petalGeometry = new THREE.SphereGeometry(0.18, 16, 12);
const flowerCenterGeometry = new THREE.SphereGeometry(0.115, 16, 12);

function createFlower(color, x, z, tilt, height = 0) {
  const flower = new THREE.Group();
  flower.position.set(x, 2.64 + height, z);
  flower.rotation.z = tilt;

  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.7;
  stem.castShadow = true;
  flower.add(stem);

  const head = new THREE.Group();
  head.position.y = 1.42;

  const petalMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.45,
    metalness: 0.0
  });

  for (let index = 0; index < 5; index += 1) {
    const angle = (index / 5) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.position.set(Math.cos(angle) * 0.18, Math.sin(angle) * 0.18, 0);
    petal.scale.set(1.0, 0.72, 0.72);
    petal.castShadow = true;
    head.add(petal);
  }

  const center = new THREE.Mesh(
    flowerCenterGeometry,
    new THREE.MeshStandardMaterial({
      color: 0xd8a44c,
      roughness: 0.5,
      metalness: 0.05
    })
  );
  center.position.z = 0.13;
  center.castShadow = true;
  head.add(center);

  flower.add(head);
  vaseGroup.add(flower);
}

createFlower(flowerColors[0], -0.48, 0.18, -0.12, 0.08);
createFlower(flowerColors[1], 0.0, -0.06, 0.04, 0.0);
createFlower(flowerColors[2], 0.48, 0.16, 0.13, 0.14);

// Dekoratif kuşak: yatay torus
const belt = new THREE.Mesh(
  new THREE.TorusGeometry(1.54, 0.055, 12, 32),
  edgeMaterial
);
belt.rotation.x = Math.PI / 2;
belt.position.y = -0.58;
belt.castShadow = true;
vaseGroup.add(belt);

// 5. ZEMİN
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    color: 0x302626,
    roughness: 0.78,
    metalness: 0.08
  })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 6. IŞIKLANDIRMA
const ambientLight = new THREE.AmbientLight(0xffe8d5, 1.15);
scene.add(ambientLight);

const keyLight = new THREE.SpotLight(0xffd2b5, 4.2, 18, Math.PI * 0.24, 0.35, 1);
keyLight.position.set(4, 7, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
keyLight.shadow.bias = -0.0004;
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x8faad8, 1.3, 10);
fillLight.position.set(-4, 2.5, 2);
scene.add(fillLight);

// 7. ANİMASYON DÖNGÜSÜ
function animate() {
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
}

animate();

// 8. EKRAN BOYUTU DEĞİŞİMİ
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
