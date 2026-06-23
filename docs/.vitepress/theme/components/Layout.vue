<script setup>
import DefaultTheme from 'vitepress/theme'
import BackToTop from './BackToTop.vue'
import HeroBeams from './HeroBeams.vue'
import HeroGrainient from './HeroGrainient.vue'
import TextType from './TextType.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-before>
      <HeroBeams />
      <HeroGrainient />
    </template>
    <template #home-hero-info-before>
      <TextType
        :texts="[`Felix's Digital Garden`]"
        class-name="hero-split-name"
        :typing-speed="75"
        :deleting-speed="50"
        :pause-duration="1500"
        :loop="false"
        :show-cursor="true"
        cursor-character="▎"
        :cursor-blink-duration="0.5"
        tag="h1"
      />
    </template>
  </DefaultTheme.Layout>
  <BackToTop />
</template>
