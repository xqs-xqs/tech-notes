---
title: AI 应用与学习
description: 记录 RAG、Agent 等 AI 应用开发实践，沉淀大模型、Transformer、注意力机制等基础原理学习
aside: false
---

<script setup>
import KnowledgeLanding from '../.vitepress/theme/components/KnowledgeLanding.vue'

const recommended = [
  {
    title: 'ANN 近似最近邻搜索入门',
    description: '从精确检索的瓶颈讲起，梳理 ANN 的核心思想、主流算法（HNSW、IVF、PQ）和工程取舍。它是向量检索的引擎，也是 RAG 系统能跑起来的前提。',
    href: '/ai/rag/ann-guide-for-vector-retrieval',
    tag: 'RAG',
    date: '2026-05',
    reason: '这是这个知识库的第一篇文章，也是 RAG 系统的地基：理解了 ANN，才能理解为什么向量数据库长这样、为什么检索质量和速度需要权衡。'
  }
]

const topics = [
  {
    icon: '🔍',
    title: 'RAG 检索增强生成',
    description: '记录从向量检索、文档切分、重排序到端到端 RAG 系统设计的完整链路。',
    href: '/ai/rag/',
    points: [
      '向量检索与 ANN',
      'Chunking 与重排序',
      '检索质量评测'
    ]
  },
  {
    icon: '🧠',
    title: 'Agent 设计与实现',
    description: '探索 LLM Agent 的设计范式、工具调用、记忆机制和多 Agent 协作。',
    href: '/ai/agent/',
    points: [
      'ReAct 与工具调用',
      '记忆与上下文管理',
      '多 Agent 协作'
    ]
  },
  {
    icon: '📚',
    title: '大模型基础原理',
    description: '沉淀 Transformer、注意力机制、大模型训练与推理等理论学习笔记。',
    href: '/ai/fundamentals/',
    points: [
      'Transformer 架构',
      '注意力机制',
      '训练与推理原理'
    ]
  },
  {
    icon: '⌨️',
    title: 'AI Coding',
    description: '记录 Claude Code、Codex 等 AI 编程工具的使用技巧、命令详解与实践感悟。',
    href: '/ai/ai-coding/',
    points: [
      'Claude Code 使用技巧',
      '命令与工作流经验',
      'AI Coding 思考'
    ]
  }
]
</script>

<KnowledgeLanding
  title="🤖 AI 应用与学习"
  subtitle="做应用，也学原理。从 RAG 和 Agent 起步，逐步深入大模型背后的机制。"
  intro="这个知识库聚焦 AI 大模型时代的应用开发与基础学习。一边记录 RAG、Agent 等真实应用工程实践中的设计与踩坑，一边沉淀 Transformer、注意力机制等模型原理的理解。两条线互为印证：做的时候知道为什么这么做，学的时候也清楚它最终怎么用。"
  :recommended="recommended"
  :topics="topics"
/>
