<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  texts: {
    type: Array,
    required: true
  },
  tag: {
    type: String,
    default: 'div'
  },
  className: {
    type: String,
    default: ''
  },
  typingSpeed: {
    type: Number,
    default: 75
  },
  deletingSpeed: {
    type: Number,
    default: 50
  },
  pauseDuration: {
    type: Number,
    default: 1500
  },
  initialDelay: {
    type: Number,
    default: 0
  },
  loop: {
    type: Boolean,
    default: true
  },
  showCursor: {
    type: Boolean,
    default: true
  },
  cursorCharacter: {
    type: String,
    default: '|'
  },
  cursorBlinkDuration: {
    type: Number,
    default: 0.5
  },
  variableSpeedEnabled: {
    type: Boolean,
    default: false
  },
  variableSpeedMin: {
    type: Number,
    default: 60
  },
  variableSpeedMax: {
    type: Number,
    default: 120
  }
})

const displayedText = ref('')
const currentCharIndex = ref(0)
const isDeleting = ref(false)
const currentTextIndex = ref(0)
const cursorRef = ref(null)
const typingDone = ref(false)

let timeout = null
let gsapCtx = null

const currentText = computed(() => props.texts[currentTextIndex.value] ?? '')

function getSpeed() {
  if (!props.variableSpeedEnabled) return isDeleting.value ? props.deletingSpeed : props.typingSpeed
  return Math.random() * (props.variableSpeedMax - props.variableSpeedMin) + props.variableSpeedMin
}

function tick() {
  clearTimeout(timeout)

  if (isDeleting.value) {
    if (displayedText.value === '') {
      isDeleting.value = false
      const isLast = currentTextIndex.value === props.texts.length - 1
      if (isLast && !props.loop) return
      currentTextIndex.value = (currentTextIndex.value + 1) % props.texts.length
      currentCharIndex.value = 0
      timeout = setTimeout(tick, props.pauseDuration)
    } else {
      timeout = setTimeout(() => {
        displayedText.value = displayedText.value.slice(0, -1)
        tick()
      }, props.deletingSpeed)
    }
  } else {
    const target = currentText.value
    if (currentCharIndex.value < target.length) {
      timeout = setTimeout(() => {
        displayedText.value = target.slice(0, currentCharIndex.value + 1)
        currentCharIndex.value++
        tick()
      }, getSpeed())
    } else {
      if (!props.loop && currentTextIndex.value === props.texts.length - 1) {
        typingDone.value = true
        return
      }
      timeout = setTimeout(() => {
        isDeleting.value = true
        tick()
      }, props.pauseDuration)
    }
  }
}

onMounted(() => {
  if (props.showCursor && cursorRef.value) {
    gsapCtx = gsap.context(() => {
      gsap.to(cursorRef.value, {
        opacity: 0,
        duration: props.cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      })
    })
  }
  timeout = setTimeout(tick, props.initialDelay)
})

onUnmounted(() => {
  clearTimeout(timeout)
  gsapCtx?.revert()
})
</script>

<template>
  <component :is="tag" :class="['text-type', className]">
    <span class="text-type__content">{{ displayedText }}</span>
    <span v-if="showCursor && !typingDone" ref="cursorRef" class="text-type__cursor">{{ cursorCharacter }}</span>
  </component>
</template>

<style scoped>
.text-type {
  display: inline-flex;
  align-items: baseline;
  white-space: pre-wrap;
}

.text-type__cursor {
  margin-left: 0.05em;
  display: inline-block;
  opacity: 1;
}
</style>
