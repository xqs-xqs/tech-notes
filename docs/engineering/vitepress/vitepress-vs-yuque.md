---
title: VitePress 与语雀的区别及使用
description: 从"在线文档编辑器"到"静态站点生成器"的迁移思考，对比两者的核心区别、VitePress 的 Markdown 增强能力，以及配套的写作习惯和本地预览工作流。
date: 2026-06-03
tags: [VitePress, 语雀, Markdown, 静态站点生成器, 写作工具]
---

# VitePress 与语雀的区别及使用

> 之前都习惯在语雀上写 md 文件，这次尝试下切换成用 VitePress 来渲染 Markdown；

语雀是"在线文档编辑器 / 知识库工具"，VitePress 是"把 Markdown 源码编译成网站的静态站点生成器"。

## 一、语雀 Markdown vs VitePress Markdown 的核心区别

| **对比项** | **语雀** | **VitePress** |
| --- | --- | --- |
| 本质 | 在线文档 / 知识库 | 静态网站生成器 SSG |
| 文件形态 | 你主要在网页编辑器里写，Markdown 更像导入导出格式 | `.md` 文件就是源码，放在 GitHub 仓库里 |
| 渲染方式 | 语雀自己的编辑器和页面样式 | VitePress 主题 + Vue + Vite 编译 |
| 链接逻辑 | 文档之间通过语雀内部链接 | 根据文件路径自动生成网页路由 |
| 适合场景 | 笔记、知识库、团队协作、草稿 | 公开博客、技术文档、个人网站、作品展示 |
| 可定制性 | 主要受语雀平台限制 | 可以改主题、组件、样式、导航、部署 |
| Git 管理 | 不自然 | 非常适合 Git / GitHub / GitHub Pages |

VitePress 官方对自己的定义就是：

把 Markdown 源内容套上主题，生成可部署的静态 HTML 页面；并且它使用基于文件的路由，也就是 Markdown 文件目录会映射成网站页面路径。

## 二、VitePress 有哪些"多出来"的 Markdown 能力？

普通 Markdown 语法两边基本都支持，比如：

```markdown
# 一级标题

## 二级标题

- 列表
- 列表

**加粗**

`行内代码`

```java
System.out.println("Hello");

```

但 VitePress 额外多了很多"网站化 / 文档化"的语法

---

### 2.1. Frontmatter：给文章加元信息

VitePress 的每个 Markdown 文件顶部可以写 YAML frontmatter，用来控制标题、描述、布局、侧边栏、上一页下一页等页面级配置。[frontmatter 配置 | VitePress](https://vitepress.dev/zh/reference/frontmatter-config)

```yaml
---
title: Java 堆与优先队列
description: 总结 Java PriorityQueue 的构造方法和常用 API
date: 2026-05-13
tags:
  - Java
  - LeetCode
  - 数据结构
sidebar: false
aside: false
---
```

---

### 2.2. 提示块：`tip / warning / danger / details`

VitePress 支持自定义容器，也就是不同颜色的提示框；[Markdown 扩展 | VitePress](https://vitepress.dev/zh/guide/markdown#custom-containers)

```markdown
::: info
This is an info box.
:::

::: tip
这里适合写刷题技巧、注意点、总结。
:::

::: warning
这里适合写容易踩坑的地方。
:::

::: danger
这里适合写严重错误。
:::

::: details 点击展开
这里可以放较长解释。
:::
```
::: info
This is an info box.
:::

::: tip
这里适合写刷题技巧、注意点、总结。
:::

::: warning
这里适合写容易踩坑的地方。
:::

::: danger
这里适合写严重错误。
:::

::: details 点击展开
这里可以放较长解释。
:::


还可以通过在容器的 "type" 之后附加文本来设置自定义标题。

````markdown
::: danger STOP
危险区域，请勿继续
:::

::: details 点我查看代码
```js
console.log('Hello, VitePress!')
```
:::
````


::: danger STOP
危险区域，请勿继续
:::

::: details 点我查看代码
```js
console.log('Hello, VitePress!')
```
:::


这点非常适合技术博客，比如：


```markdown
::: warning 注意
`PriorityQueue` 默认是小根堆，不是大根堆。
:::
```


> **此外需要注意：**
> 
> VitePress 的 `:::` 容器对格式**非常敏感**，有三个常见坑：
> 
> **1. `:::` 前后没有空行**
> 
> 两个容器之间必须有一个空行，否则第二个会被认为是第一个的内容。
> 
> **2. 容器内嵌代码块时，反引号数量冲突**
> 
> 在 `:::` 容器里嵌套代码块，外层用三个反引号，内层也是三个反引号，会产生歧义，导致解析失败。解决方法是外层用四个反引号。
> 
> **3. 缩进问题**
> 
> `:::` 不能有任何前置空格或缩进，必须顶格写。

---

### 2.3. GitHub 风格 Alert

VitePress 也支持 GitHub 风格提示块：

```markdown
> [!NOTE]
> 强调用户在快速浏览文档时也不应忽略的重要信息。

> [!TIP]
> 有助于用户更顺利达成目标的建议性信息。

> [!IMPORTANT]
> 对用户达成目标至关重要的信息。

> [!WARNING]
> 因为可能存在风险，所以需要用户立即关注的关键内容。

> [!CAUTION]
> 行为可能带来的负面影响。
```

---

### 2.4. 代码块增强：高亮行、行号、错误提示、diff

VitePress 用 Shiki 给代码块做语法高亮，并支持很多代码块增强功能。

普通代码块：

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(3);
pq.offer(1);
System.out.println(pq.poll());
```

高亮第 2 行：[Markdown 扩展 | VitePress](https://vitepress.dev/zh/guide/markdown#line-highlighting-in-code-blocks)

```java{2}
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(3);
pq.offer(1);
System.out.println(pq.poll());
```

显示行号：[Markdown 扩展 | VitePress](https://vitepress.dev/zh/guide/markdown#line-numbers)

```java:line-numbers
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(3);
pq.offer(1);
System.out.println(pq.poll());
```

错误提示：[Markdown 扩展 | VitePress](https://vitepress.dev/zh/guide/markdown#errors-and-warnings-in-code-blocks)

```js
export default {
  data () {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```

表示新增 / 删除代码：[Markdown 扩展 | VitePress](https://vitepress.dev/zh/guide/markdown#colored-diffs-in-code-blocks)

```java
int a = 1; // [!code --]
int a = 2; // [!code ++]
```

这比语雀更适合写代码教程、LeetCode 题解、项目文档。

---

### 2.5. Code Group：多语言 / 多文件切换

VitePress 可以把多个代码块放在一个 tab 组里。[Markdown 扩展 | VitePress](https://vitepress.dev/zh/guide/markdown#code-groups)

::: code-group

```java [Java]
class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[]{};
    }
}
```

```python [Python]
class Solution:
    def twoSum(self, nums, target):
        return []
```

:::

---

### 2.6. 直接引入外部代码片段

VitePress 可以从项目里的真实代码文件中引入代码片段：

```markdown
<<< @/snippets/priority-queue.java
```

也可以只引入某几行：

```markdown
<<< @/snippets/priority-queue.java{1,3-6}
```

这个语雀一般做不到。

它的好处是：**文章里的代码可以和仓库里的真实代码保持一致**，不会出现文章复制错、代码没同步的问题。

---

### 2.7. 可以在 Markdown 里直接用 Vue 组件

这是 VitePress 和语雀最大的差异之一。VitePress 会把每个 Markdown 文件编译成 HTML，然后作为 Vue 单文件组件处理，所以可以在 Markdown 里使用 Vue 模板、组件、`<script setup>` 等能力。

例如：

```vue
<script setup>
const name = 'VitePress'
</script>

# Hello {{ name }}
```

甚至可以引入自定义组件：

```vue
<script setup>
import MyCard from '../components/MyCard.vue'
</script>

<MyCard />
```

这意味着你的博客不仅能写文章，还能做：

- 可交互 demo
- 算法可视化
- 组件展示
- 项目作品卡片
- 自定义首页模块

语雀更偏"写文档"，VitePress 更偏"写一个网站"。

---

### 2.8. 数学公式需要额外开启

VitePress 支持数学公式，但目前需要额外安装 `markdown-it-mathjax3`，并在配置里开启 `markdown.math: true`。

```bash
npm add -D markdown-it-mathjax3@^4
```

```ts
// .vitepress/config.ts
export default {
  markdown: {
    math: true
  }
}
```

然后就可以写：

```markdown
当 $a \ne 0$ 时：

$$
x = {-b \pm \sqrt{b^2 - 4ac} \over 2a}
$$
```

## 三、VitePress 写作习惯

VitePress 文章建议你养成这几个习惯：

1. **每篇文章顶部写 frontmatter**：标题、描述、日期、标签。
2. **标题层级清晰**：`#` 只用一次，正文从 `##` 开始。
3. **每篇文章有明确主题**：不要一篇文章塞太多杂内容。
4. **代码块一定标语言**：比如 `java`、`js`、`bash`。
5. **相对链接写清楚**：比如 `[下一篇](./binary-search.md)`。
6. **图片尽量放到仓库中**：比如 `docs/public/images/xxx.png` 或文章同级目录。

## 四、怎么在 VS Code 里实时预览 VitePress Markdown？

VS Code 本身支持 Markdown 预览，快捷键是：

```
Ctrl + Shift + V
```

侧边预览：

```
Ctrl + K，然后按 V
```

它支持打开 `.md` 文件后切换到预览，也支持 side-by-side 实时更新；

但它只能预览普通 Markdown，无法渲染出 VitePress 的特性；

**解决方法：运行 VitePress 本地开发服务器**

VitePress 官方默认脚本通常是：`docs:dev`、`docs:build`、`docs:preview`，其中 `docs:dev` 会启动本地开发服务器并支持热更新；

1. 在项目根目录运行：

```bash
npm run docs:dev
```

2. 启动后终端会显示一个本地地址，例如：

```
http://localhost:5173/
```

打开这个地址，就能看到真正的 VitePress 渲染效果。

之后在 VS Code 里改 Markdown，浏览器就会自动热更新。

3. VS Code 命令面板搜索：

```
Simple Browser: Show
```

4. 粘贴终端里显示的本地地址。

这样就可以实现左边写 Markdown，右边在 VS Code 内看 VitePress 网站效果。

同样也可以直接在浏览器中打开本地地址，如果觉得 VS Code 中页面视野不完整。