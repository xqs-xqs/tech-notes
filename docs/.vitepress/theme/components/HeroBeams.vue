<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import * as THREE from 'three'
import { useIsMobile } from '../composables/useIsMobile'

const { frontmatter, isDark } = useData()
const isHome = computed(() => frontmatter.value.layout === 'home')
const isMobile = useIsMobile()
const containerRef = ref(null)

const BEAM_WIDTH = 3
const BEAM_HEIGHT = 30
const BEAM_NUMBER = 20
const SPEED = 2
const NOISE_INTENSITY = 1.75
const SCALE = 0.2
const ROTATION_DEG = 30
const HEIGHT_SEGMENTS = 100

let renderer = null
let scene = null
let camera = null
let animationFrameId = null
let dirLight = null
let dirLight2 = null
let shaderUniforms = null

const noiseGLSL = `
float beamRandom(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
float beamNoise(in vec2 st) {
  vec2 i = floor(st); vec2 f = fract(st);
  float a = beamRandom(i);
  float b = beamRandom(i + vec2(1.0, 0.0));
  float c = beamRandom(i + vec2(0.0, 1.0));
  float d = beamRandom(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
vec4 bPermute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 bTaylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 bFade(vec3 t){return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0=floor(P); vec3 Pi1=Pi0+vec3(1.0);
  Pi0=mod(Pi0,289.0); Pi1=mod(Pi1,289.0);
  vec3 Pf0=fract(P); vec3 Pf1=Pf0-vec3(1.0);
  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
  vec4 iy=vec4(Pi0.yy,Pi1.yy);
  vec4 iz0=Pi0.zzzz; vec4 iz1=Pi1.zzzz;
  vec4 ixy=bPermute(bPermute(ix)+iy);
  vec4 ixy0=bPermute(ixy+iz0); vec4 ixy1=bPermute(ixy+iz1);
  vec4 gx0=ixy0/7.0; vec4 gy0=fract(floor(gx0)/7.0)-0.5;
  gx0=fract(gx0); vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);
  vec4 sz0=step(gz0,vec4(0.0));
  gx0-=sz0*(step(0.0,gx0)-0.5); gy0-=sz0*(step(0.0,gy0)-0.5);
  vec4 gx1=ixy1/7.0; vec4 gy1=fract(floor(gx1)/7.0)-0.5;
  gx1=fract(gx1); vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);
  vec4 sz1=step(gz1,vec4(0.0));
  gx1-=sz1*(step(0.0,gx1)-0.5); gy1-=sz1*(step(0.0,gy1)-0.5);
  vec3 g000=vec3(gx0.x,gy0.x,gz0.x); vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010=vec3(gx0.z,gy0.z,gz0.z); vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001=vec3(gx1.x,gy1.x,gz1.x); vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011=vec3(gx1.z,gy1.z,gz1.z); vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0=bTaylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000*=norm0.x; g010*=norm0.y; g100*=norm0.z; g110*=norm0.w;
  vec4 norm1=bTaylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001*=norm1.x; g011*=norm1.y; g101*=norm1.z; g111*=norm1.w;
  float n000=dot(g000,Pf0); float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
  float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)); float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
  float n001=dot(g001,vec3(Pf0.xy,Pf1.z)); float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011=dot(g011,vec3(Pf0.x,Pf1.yz)); float n111=dot(g111,Pf1);
  vec3 fade_xyz=bFade(Pf0);
  vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2*n_xyz;
}
`

function createGeometry() {
  const n = BEAM_NUMBER
  const width = BEAM_WIDTH
  const height = BEAM_HEIGHT
  const spacing = 0
  const hs = HEIGHT_SEGMENTS

  const numVerts = n * (hs + 1) * 2
  const numFaces = n * hs * 2
  const positions = new Float32Array(numVerts * 3)
  const indices = new Uint32Array(numFaces * 3)
  const uvs = new Float32Array(numVerts * 2)

  let vi = 0, ii = 0, ui = 0
  const totalWidth = n * width + (n - 1) * spacing
  const xBase = -totalWidth / 2

  for (let i = 0; i < n; i++) {
    const xOff = xBase + i * (width + spacing)
    const uvXOff = Math.random() * 300
    const uvYOff = Math.random() * 300
    for (let j = 0; j <= hs; j++) {
      const y = height * (j / hs - 0.5)
      positions.set([xOff, y, 0, xOff + width, y, 0], vi * 3)
      const uvY = j / hs
      uvs.set([uvXOff, uvY + uvYOff, uvXOff + 1, uvY + uvYOff], ui)
      if (j < hs) {
        const a = vi, b = vi + 1, c = vi + 2, d = vi + 3
        indices.set([a, b, c, c, b, d], ii)
        ii += 6
      }
      vi += 2
      ui += 4
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(new THREE.BufferAttribute(indices, 1))
  geo.computeVertexNormals()
  return geo
}

function createMaterial() {
  shaderUniforms = {
    time: { value: 0 },
    uSpeed: { value: SPEED },
    uNoiseIntensity: { value: NOISE_INTENSITY },
    uScale: { value: SCALE },
  }

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0, 0, 0),
    roughness: 0.3,
    metalness: 0.3,
  })
  mat.envMapIntensity = 10

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shaderUniforms)

    shader.vertexShader = `
      uniform float time;
      uniform float uSpeed;
      uniform float uScale;
      ${noiseGLSL}
      float getPos(vec3 pos) {
        vec3 np = vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
        return cnoise(np);
      }
      vec3 getCurrentPos(vec3 pos) {
        vec3 p = pos; p.z += getPos(pos); return p;
      }
      vec3 getBeamNormal(vec3 pos) {
        vec3 cur = getCurrentPos(pos);
        vec3 nx = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
        vec3 nz = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
        return normalize(cross(normalize(nz - cur), normalize(nx - cur)));
      }
    ` + shader.vertexShader

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>\ntransformed.z += getPos(transformed.xyz);`
    )
    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `#include <beginnormal_vertex>\nobjectNormal = getBeamNormal(position.xyz);`
    )

    shader.fragmentShader = `
      uniform float uNoiseIntensity;
      ${noiseGLSL}
    ` + shader.fragmentShader

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
      float rn = beamNoise(gl_FragCoord.xy);
      gl_FragColor.rgb -= rn / 15.0 * uNoiseIntensity;`
    )
  }

  mat.customProgramCacheKey = () => 'beams-v1'
  return mat
}

function getLightColor() {
  return isDark.value ? '#ffffff' : '#1e293b'
}

function applyBackground() {
  if (!scene) return
  scene.background = isDark.value ? new THREE.Color('#000000') : null
}

function initThree() {
  const container = containerRef.value
  if (!container) return

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()
  scene.background = isDark.value ? new THREE.Color('#000000') : null

  camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1000)
  camera.position.set(0, 0, 20)

  const ambientLight = new THREE.AmbientLight(0xffffff, 1)
  scene.add(ambientLight)

  dirLight = new THREE.DirectionalLight(getLightColor(), 1)
  dirLight.position.set(0, 3, 10)
  scene.add(dirLight)

  dirLight2 = new THREE.DirectionalLight(getLightColor(), 0.8)
  dirLight2.position.set(-10, 3, 10)
  scene.add(dirLight2)

  const geo = createGeometry()
  const mat = createMaterial()
  const mesh = new THREE.Mesh(geo, mat)

  const group = new THREE.Group()
  group.rotation.z = ROTATION_DEG * Math.PI / 180
  group.add(mesh)
  scene.add(group)
}

function animate(time) {
  if (!renderer || !scene || !camera) return
  if (shaderUniforms) shaderUniforms.time.value += 0.1 * 0.016
  renderer.render(scene, camera)
  animationFrameId = requestAnimationFrame(animate)
}

function resize() {
  const container = containerRef.value
  if (!container || !renderer || !camera) return
  renderer.setSize(container.clientWidth, container.clientHeight)
  camera.aspect = container.clientWidth / container.clientHeight
  camera.updateProjectionMatrix()
}

function destroyThree() {
  if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null }
  if (renderer) {
    const container = containerRef.value
    if (container && renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
    renderer.dispose()
    renderer = null
  }
  scene = null; camera = null; dirLight = null; dirLight2 = null; shaderUniforms = null
}

// Render only on the home page, in dark mode, and on non-mobile viewports.
function shouldRender() {
  return isHome.value && isDark.value && !isMobile.value
}

async function sync() {
  if (shouldRender()) {
    await nextTick()
    if (renderer) return
    initThree()
    animationFrameId = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)
  } else {
    destroyThree()
    window.removeEventListener('resize', resize)
  }
}

onMounted(sync)

onUnmounted(() => {
  destroyThree()
  window.removeEventListener('resize', resize)
})

watch([isHome, isDark, isMobile], sync)
</script>

<template>
  <div
    v-if="isHome && isDark && !isMobile"
    ref="containerRef"
    class="beams-container"
    aria-hidden="true"
  />
</template>

<style scoped>
.beams-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.beams-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
</style>
