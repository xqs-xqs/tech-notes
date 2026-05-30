<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useData } from 'vitepress'
import { Renderer, Triangle, Program, Mesh } from 'ogl'

const { frontmatter, isDark } = useData()
const isHome = computed(() => frontmatter.value.layout === 'home')
const containerRef = ref(null)

let renderer = null
let mesh = null
let uniforms = null
let animationFrameId = null

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]
}

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);
  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;
  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);
  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));
  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;
  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`

function initOGL() {
  const container = containerRef.value
  if (!container) return

  renderer = new Renderer({ webgl: 2, alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio, 2) })
  const gl = renderer.gl
  gl.canvas.style.width = '100%'
  gl.canvas.style.height = '100%'
  gl.canvas.style.display = 'block'
  container.appendChild(gl.canvas)
  renderer.setSize(container.clientWidth, container.clientHeight)

  const geometry = new Triangle(gl)

  uniforms = {
    iResolution:     { value: [container.clientWidth, container.clientHeight] },
    iTime:           { value: 0 },
    uTimeSpeed:      { value: 0.25 },
    uColorBalance:   { value: 0 },
    uWarpStrength:   { value: 1 },
    uWarpFrequency:  { value: 5 },
    uWarpSpeed:      { value: 2 },
    uWarpAmplitude:  { value: 50 },
    uBlendAngle:     { value: 0 },
    uBlendSoftness:  { value: 0.05 },
    uRotationAmount: { value: 500 },
    uNoiseScale:     { value: 2 },
    uGrainAmount:    { value: 0.1 },
    uGrainScale:     { value: 2 },
    uGrainAnimated:  { value: 0.0 },
    uContrast:       { value: 1.5 },
    uGamma:          { value: 1 },
    uSaturation:     { value: 1 },
    uCenterOffset:   { value: [0, 0] },
    uZoom:           { value: 0.9 },
    uColor1:         { value: hexToRgb('#FF9FFC') },
    uColor2:         { value: hexToRgb('#5227FF') },
    uColor3:         { value: hexToRgb('#B497CF') },
  }

  const program = new Program(gl, { vertex, fragment, uniforms })
  mesh = new Mesh(gl, { geometry, program })
}

function animate(time) {
  if (!renderer || !mesh || !uniforms) return
  uniforms.iTime.value = time * 0.001
  renderer.render({ scene: mesh })
  animationFrameId = requestAnimationFrame(animate)
}

function resize() {
  const container = containerRef.value
  if (!container || !renderer || !uniforms) return
  renderer.setSize(container.clientWidth, container.clientHeight)
  uniforms.iResolution.value = [container.clientWidth, container.clientHeight]
}

function destroyOGL() {
  if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null }
  if (renderer) {
    const container = containerRef.value
    const canvas = renderer.gl.canvas
    if (container && canvas.parentNode === container) container.removeChild(canvas)
    renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
    renderer = null
  }
  mesh = null
  uniforms = null
}

onMounted(() => {
  if (isHome.value && !isDark.value) {
    initOGL()
    animationFrameId = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)
  }
})

onUnmounted(() => {
  destroyOGL()
  window.removeEventListener('resize', resize)
})

watch(isHome, async (val) => {
  if (val && !isDark.value) {
    await nextTick()
    initOGL()
    animationFrameId = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)
  } else {
    destroyOGL()
    window.removeEventListener('resize', resize)
  }
})

watch(isDark, async (val) => {
  if (isHome.value && !val) {
    await nextTick()
    initOGL()
    animationFrameId = requestAnimationFrame(animate)
    window.addEventListener('resize', resize)
  } else {
    destroyOGL()
    window.removeEventListener('resize', resize)
  }
})
</script>

<template>
  <div
    v-if="isHome && !isDark"
    ref="containerRef"
    class="grainient-container"
    aria-hidden="true"
  />
</template>

<style scoped>
.grainient-container {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.grainient-container :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
</style>
