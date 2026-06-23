<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  },
  delay: {
    type: Number,
    default: 40
  },
  duration: {
    type: Number,
    default: 1.0
  },
  ease: {
    type: String,
    default: 'power3.out'
  },
  from: {
    type: Object,
    default: () => ({ opacity: 0, y: 40 })
  },
  to: {
    type: Object,
    default: () => ({ opacity: 1, y: 0 })
  },
  tag: {
    type: String,
    default: 'p'
  }
})

const containerRef = ref(null)
let ctx = null

onMounted(async () => {
  await nextTick()
  // Wait for fonts to load
  await document.fonts.ready

  if (!containerRef.value) return

  const chars = containerRef.value.querySelectorAll('.split-char')
  if (!chars.length) return

  ctx = gsap.context(() => {
    gsap.fromTo(
      chars,
      { ...props.from },
      {
        ...props.to,
        duration: props.duration,
        ease: props.ease,
        stagger: props.delay / 1000
      }
    )
  }, containerRef.value)
})

onUnmounted(() => {
  ctx?.revert()
})
</script>

<template>
  <component
    :is="tag"
    ref="containerRef"
    :class="['split-parent', className]"
  >
    <span
      v-for="(char, index) in text.split('')"
      :key="index"
      class="split-char"
      :style="{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }"
    >{{ char }}</span>
  </component>
</template>

<style scoped>
.split-parent {
  overflow: hidden;
  display: inline-block;
  white-space: normal;
  word-wrap: break-word;
}

.split-char {
  will-change: transform, opacity;
}
</style>
