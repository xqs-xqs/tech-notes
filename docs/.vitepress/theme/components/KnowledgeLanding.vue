<script setup lang="ts">
import { withBase } from 'vitepress'

interface RecommendedPost {
  title: string
  description: string
  href: string
  tag?: string
  date?: string
  reason?: string
}

interface Topic {
  icon: string
  title: string
  description: string
  href: string
  points?: string[]
}

defineProps<{
  title: string
  subtitle: string
  intro: string
  recommended: RecommendedPost[]
  topics: Topic[]
}>()

function normalizeLink(href: string) {
  if (href.startsWith('/')) return withBase(href)
  return href
}
</script>

<template>
  <div class="kb-page">
    <section class="kb-hero">
      <p class="kb-eyebrow">Knowledge Base</p>
      <h1>{{ title }}</h1>
      <p class="kb-subtitle">{{ subtitle }}</p>
      <p class="kb-intro">{{ intro }}</p>
    </section>

    <section class="kb-section">
      <div class="kb-section-head">
        <div>
          <p class="kb-eyebrow">Recommended</p>
          <h2>推荐文章</h2>
        </div>
        <p>优先阅读这些内容，可以快速理解这个知识库的主线。</p>
      </div>

      <div class="recommend-grid">
        <a
          v-for="post in recommended"
          :key="post.href"
          class="recommend-card"
          :href="normalizeLink(post.href)"
        >
          <div class="recommend-meta">
            <span>{{ post.tag || 'Article' }}</span>
            <span v-if="post.date">{{ post.date }}</span>
          </div>

          <h3>{{ post.title }}</h3>
          <p>{{ post.description }}</p>

          <div v-if="post.reason" class="recommend-reason">
            <strong>推荐理由：</strong>{{ post.reason }}
          </div>
        </a>
      </div>
    </section>

    <section class="kb-section">
      <div class="kb-section-head">
        <div>
          <p class="kb-eyebrow">Topics</p>
          <h2>当前包含的主题</h2>
        </div>
        <p>按照学习和实践场景组织，而不是简单堆文章。</p>
      </div>

      <div class="topic-grid">
        <a
          v-for="topic in topics"
          :key="topic.href"
          class="topic-card"
          :href="normalizeLink(topic.href)"
        >
          <div class="topic-icon">{{ topic.icon }}</div>
          <h3>{{ topic.title }}</h3>
          <p>{{ topic.description }}</p>

          <ul v-if="topic.points?.length">
            <li v-for="point in topic.points" :key="point">
              {{ point }}
            </li>
          </ul>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.kb-page {
  padding-bottom: 40px;
}

.kb-hero {
  padding: 16px 0 36px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.kb-eyebrow {
  margin: 0 0 10px;
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.kb-hero h1 {
  margin: 0;
  font-size: 42px;
  line-height: 1.15;
  letter-spacing: -0.04em;
}

.kb-subtitle {
  margin: 16px 0 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  line-height: 1.7;
}

.kb-intro {
  margin: 12px 0 0;
  max-width: 720px;
  color: var(--vp-c-text-2);
  line-height: 1.9;
}

.kb-section {
  margin-top: 42px;
}

.kb-section-head {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  align-items: flex-end;
  margin-bottom: 18px;
}

.kb-section-head h2 {
  margin: 0;
  padding: 0;
  border: none;
  font-size: 26px;
  letter-spacing: -0.03em;
}

.kb-section-head > p {
  max-width: 360px;
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  font-size: 14px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.recommend-card,
.topic-card {
  display: block;
  text-decoration: none !important;
  color: inherit;
  border: 1px solid var(--vp-c-divider);
  background:
    radial-gradient(circle at top right, var(--vp-c-brand-soft), transparent 38%),
    var(--vp-c-bg-soft);
  border-radius: 18px;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.recommend-card:hover,
.topic-card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
}

.recommend-card {
  padding: 22px;
}

.recommend-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 700;
}

.recommend-card h3 {
  margin: 14px 0 10px;
  font-size: 20px;
  line-height: 1.45;
}

.recommend-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.75;
}

.recommend-reason {
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.recommend-reason strong {
  color: var(--vp-c-text-1);
}

.topic-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.topic-card {
  padding: 22px;
  background: var(--vp-c-bg-soft);
}

.topic-icon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--vp-c-bg);
  font-size: 24px;
}

.topic-card h3 {
  margin: 16px 0 8px;
  font-size: 19px;
}

.topic-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.75;
}

.topic-card ul {
  margin: 16px 0 0;
  padding-left: 18px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.8;
}

@media (max-width: 860px) {
  .kb-hero h1 {
    font-size: 34px;
  }

  .kb-section-head {
    display: block;
  }

  .kb-section-head > p {
    margin-top: 10px;
  }

  .recommend-grid,
  .topic-grid {
    grid-template-columns: 1fr;
  }
}
</style>