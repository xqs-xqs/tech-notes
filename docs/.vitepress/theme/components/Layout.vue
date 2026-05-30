<script setup>
import DefaultTheme from 'vitepress/theme'
import BackToTop from './BackToTop.vue'
import HeroBeams from './HeroBeams.vue'
import HeroGrainient from './HeroGrainient.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-before>
      <HeroBeams />
      <HeroGrainient />
    </template>
  </DefaultTheme.Layout>
  <BackToTop />
</template>
