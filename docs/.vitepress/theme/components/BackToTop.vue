<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)
const rippleKey = ref(0)
const showRipple = ref(false)

const CIRCUMFERENCE = 2 * Math.PI * 18

const isVisible = computed(() => scrollY.value > 300)

const progress = computed(() => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  if (maxScroll <= 0) return 0
  return Math.min(scrollY.value / maxScroll, 1)
})

const strokeDashoffset = computed(() => CIRCUMFERENCE * (1 - progress.value))

function onScroll() {
  scrollY.value = window.scrollY
}

function handleClick() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  rippleKey.value++
  showRipple.value = true
  setTimeout(() => { showRipple.value = false }, 500)
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      class="back-to-top-btn"
      aria-label="返回顶部"
      @click="handleClick"
    >
      <svg class="ring" viewBox="0 0 44 44" width="44" height="44">
        <circle class="ring-track" cx="22" cy="22" r="18" />
        <circle
          class="ring-progress"
          cx="22"
          cy="22"
          r="18"
          :style="{ strokeDashoffset }"
        />
      </svg>
      <span class="arrow">↑</span>
      <span
        v-if="showRipple"
        :key="rippleKey"
        class="ripple"
      />
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  overflow: hidden;
  padding: 0;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.back-to-top-btn:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.ring {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: var(--vp-c-divider);
  stroke-width: 2.5;
}

.ring-progress {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 113.1;
  transition: stroke-dashoffset 0.1s linear;
}

.arrow {
  position: relative;
  font-size: 16px;
  color: var(--vp-c-text-1);
  line-height: 1;
  transition: transform 0.2s ease;
}

.back-to-top-btn:hover .arrow {
  transform: translateY(-2px);
}

.ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  animation: ripple-expand 0.5s ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  from { transform: scale(0); opacity: 0.7; }
  to   { transform: scale(2.5); opacity: 0; }
}

.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.back-to-top-enter-from,
.back-to-top-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
