import { ref, onMounted, onUnmounted } from 'vue'

// Reactive viewport flag. SSR-safe: defaults to false (desktop) and is
// corrected on the client once mounted. Used to disable the WebGL hero
// backgrounds on mobile so the page falls back to the default VitePress home.
export function useIsMobile(query = '(max-width: 767px)') {
  const isMobile = ref(false)
  let mql = null
  const update = () => { isMobile.value = mql.matches }
  onMounted(() => {
    mql = window.matchMedia(query)
    update()
    mql.addEventListener('change', update)
  })
  onUnmounted(() => mql?.removeEventListener('change', update))
  return isMobile
}
