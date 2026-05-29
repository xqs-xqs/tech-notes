<script setup>
import DefaultTheme from 'vitepress/theme'
import BackToTop from './BackToTop.vue'
import HeroBeams from './HeroBeams.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-before>
      <HeroBeams />
    </template>
  </DefaultTheme.Layout>
  <BackToTop />
</template>
