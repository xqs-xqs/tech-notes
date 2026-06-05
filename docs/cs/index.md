---
title: 计算机基础
description: 数据结构、算法、操作系统、计算机网络、计算机组成原理系统性整理
aside: false
---

<script setup>
import KnowledgeLanding from '../.vitepress/theme/components/KnowledgeLanding.vue'

const recommended = []

const topics = [
  {
    icon: '🌲',
    title: '数据结构',
    description: '系统整理数组、链表、树、图、堆等核心数据结构的原理与应用。',
    href: '/cs/data-structures/',
    points: [
      '线性结构：数组与链表',
      '树形结构：二叉树与平衡树',
      '图与堆'
    ]
  },
  {
    icon: '⚙️',
    title: '算法',
    description: '覆盖排序、搜索、动态规划、贪心、回溯等经典算法思路与题型分析。',
    href: '/cs/algorithms/',
    points: [
      '排序与搜索',
      '动态规划与贪心',
      '回溯与分治'
    ]
  },
  {
    icon: '🖥️',
    title: '操作系统',
    description: '整理进程管理、内存管理、文件系统、I/O 等操作系统核心概念。',
    href: '/cs/os/',
    points: [
      '进程与线程',
      '内存管理与虚拟化',
      '文件系统与 I/O'
    ]
  },
  {
    icon: '🌐',
    title: '计算机网络',
    description: '从 TCP/IP 协议栈到 HTTP、DNS、Socket 编程，梳理网络通信全链路。',
    href: '/cs/networking/',
    points: [
      'TCP/IP 与三次握手',
      'HTTP 与 HTTPS',
      'DNS 与路由'
    ]
  },
  {
    icon: '🔩',
    title: '计算机组成原理',
    description: '理解 CPU、存储器、指令系统、总线等硬件基础与底层运行机制。',
    href: '/cs/computer-organization/',
    points: [
      'CPU 与指令执行',
      '存储器层次结构',
      '总线与 I/O 系统'
    ]
  }
]
</script>

<KnowledgeLanding
  title="💻 计算机基础"
  subtitle="打牢地基，才能走远。系统整理五大计算机基础学科的核心知识。"
  intro="这个知识库用于沉淀数据结构、算法、操作系统、计算机网络和计算机组成原理五门核心基础课的学习笔记与理解。这些知识不随技术潮流更迭，是理解所有上层系统的底层语言。"
  :recommended="recommended"
  :topics="topics"
/>
