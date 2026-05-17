---
title: 工程实践
description: 记录部署、工具链、开发环境、GitHub Actions、VitePress 等工程实践经验
aside: false
---

<script setup>
import KnowledgeLanding from '../.vitepress/theme/components/KnowledgeLanding.vue'

const recommended = [
  {
    title: '从零搭建 VitePress 技术博客踩坑全记录',
    description: '完整记录从初始化项目、配置 GitHub Pages、GitHub Actions 到解决部署问题的过程。',
    href: '/engineering/vitepress/vitepress-deployment-pitfalls',
    tag: 'VitePress',
    date: '2026-05',
    reason: '这是整个个人博客项目的起点，读完后能理解当前站点的部署结构。'
  }
]

const topics = [
  {
    icon: '🧱',
    title: 'VitePress 建站',
    description: '记录个人技术博客从初始化、配置、主题美化到部署上线的完整过程。',
    href: '/engineering/vitepress/',
    points: [
      '首页与导航配置',
      '侧边栏设计',
      'GitHub Pages 部署'
    ]
  },
  {
    icon: '🔧',
    title: 'Git 与 GitHub',
    description: '整理日常开发中最容易混淆的 Git 工作流和 GitHub 协作问题。',
    href: '/engineering/git/',
    points: [
      'pull / commit / push',
      'rebase 与冲突处理',
      '本地与远程同步'
    ]
  },
  {
    icon: '🚀',
    title: '部署与自动化',
    description: '关注项目如何从本地运行走向自动化构建、自动部署和线上排错。',
    href: '/engineering/deploy/',
    points: [
      'GitHub Actions',
      '构建失败排查',
      '静态站点发布'
    ]
  }
]
</script>

<KnowledgeLanding
  title="🛠️ 工程实践"
  subtitle="记录真实开发、部署、工具链和环境配置中的问题与解决方案。"
  intro="这个知识库不是简单的文章堆叠，而是把我在搭建个人博客、使用 GitHub、配置开发环境和处理工程问题时遇到的真实经验沉淀下来。它更像一份长期维护的工程实践手册。"
  :recommended="recommended"
  :topics="topics"
/>