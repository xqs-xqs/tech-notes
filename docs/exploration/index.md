---
title: 知识探索
description: 记录跨领域学习、课程外知识、读书笔记和阶段性知识理解
aside: false
---

<script setup>
import KnowledgeLanding from '../.vitepress/theme/components/KnowledgeLanding.vue'

const recommended = [
  {
    title: 'Adversarial Defenses in Wireless Networks',
    description: '一篇关于无线网络中对抗性防御机制的综述报告，关注 threat model、proactive defenses、reactive defenses 以及无线环境下的特殊挑战。',
    href: '/exploration/network-and-security/adversarial-defenses-in-wireless-networks',
    tag: 'Wireless Security',
    date: '2026-05',
    reason: '这篇文章代表了知识探索栏目最典型的方向：不是单纯工程实现，而是把无线网络、AI 安全和学术综述连接起来。'
  }
]

const topics = [
  {
    icon: '📡',
    title: '无线网络与安全',
    description: '记录无线网络、移动计算、通信系统、安全威胁以及对抗性机器学习在网络环境中的应用。',
    href: '/exploration/wireless-security/',
    points: [
      '无线网络安全',
      '对抗性机器学习',
      '课程报告与专题综述'
    ]
  },
  {
    icon: '📚',
    title: '读书笔记',
    description: '沉淀阅读过程中遇到的关键观点、知识框架和对现实问题的启发。',
    href: '/exploration/reading-notes/',
    points: [
      '书籍摘要',
      '核心观点整理',
      '个人理解与延展'
    ]
  },
  {
    icon: '🧩',
    title: '计算机科学杂记',
    description: '记录算法、系统、网络、多媒体、数据库等方向中暂时无法归入工程实践或 AI 专栏的知识。',
    href: '/exploration/computer-science/',
    points: [
      '课程知识整理',
      '概念理解',
      '专题学习笔记'
    ]
  },
  {
    icon: '🌌',
    title: '跨领域探索',
    description: '记录不同领域之间的连接、新概念、新问题，以及一些暂时还没有形成完整体系的知识片段。',
    href: '/exploration/cross-domain/',
    points: [
      '新领域入门',
      '知识迁移',
      '问题意识积累'
    ]
  }
]
</script>

<KnowledgeLanding
  title="🧭 知识探索"
  subtitle="记录一些有趣的知识边界探索。保持好奇，永远在路上。"
  intro="这个知识库用于收纳跨领域学习、专业外知识学习等知识边界探索。它更像一个开放的探索空间：有些内容来自课程和论文，有些来自阅读和实践，有些只是对新领域的初步理解。重点不是马上形成完整体系，而是把有价值的知识节点保存下来，等待未来连接成更大的知识网络。"
  :recommended="recommended"
  :topics="topics"
/>