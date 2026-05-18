---
title: 从零搭建 VitePress 技术博客 · 完整指南
description: 从创建 GitHub 仓库到部署上线，再到网站优化、布局设计、VSCode 全流程工作流，一篇文章带你打通现代静态博客的全链路。
date: 2026-05-06
tags: [VitePress, GitHub Pages, GitHub Actions, Markdown, VSCode, 教程]
---

# 从零搭建 VitePress 技术博客 · 完整指南

> 📍 **写给谁看**：想要一个免费、专业、可长期维护的技术博客的人。
>
> 🎯 **读完你将拥有**：一个部署在 `https://你的用户名.github.io/仓库名/` 的中文技术博客，外加一套从写作到发布的完整工作流。
>
> ⏱️ **预计耗时**：跟着做大概 1 小时。读完即用，不留尾巴。

这篇文章是我自己一路踩过来的全记录。它不是把官方文档翻译一遍，而是按"**新手第一次做会怎么栽**"的顺序，把每个坑都提前填好。




## 一、整体认知：你即将搭的是什么

在动手之前花两分钟搞清楚每个角色在做什么。一个"知道为什么"的工程师，和一个"只会照抄"的工程师，差距会越拉越大。

### 四个角色

| 角色 | 干什么 | 类比 |
|------|--------|------|
| **GitHub 仓库** | 存你的 Markdown 源文件 | 你的原稿柜 |
| **VitePress** | 把 Markdown 编译成漂亮网页 | 排版印刷厂 |
| **GitHub Pages** | 免费托管编译后的网站 | 免费报刊亭 |
| **GitHub Actions** | 监听 push，自动跑构建和部署 | 24 小时值班的快递员 |

### 完整流程

```
你写 Markdown
     ↓
git push 到 GitHub
     ↓
GitHub Actions 自动触发
     ↓
跑 VitePress 构建（npm run docs:build）
     ↓
产物自动发布到 GitHub Pages
     ↓
1–2 分钟后全世界都能访问
```

**关键认知**：你只需要专心写 Markdown，剩下全自动。这就是现代静态站点的精髓。



## 二、创建 GitHub 仓库

### 2.1. 新建仓库

1. 登录 GitHub，右上角 **➕ → New repository**
2. 填写：
   - **Repository name**：仓库名（会出现在网址里，建议小写 + 连字符，比如 `tech-notes`）
   - **Description**：简单描述，比如 `Personal tech notes`
   - **Public / Private**：选 **Public**（GitHub Pages 免费版只支持公开仓库）
   - **Add a README file**：勾上
   - **Add .gitignore**：选 **Node**
3. 点 **Create repository**

> 💡 **为什么必须勾 .gitignore 选 Node？**
>
> VitePress 项目会装大量 npm 依赖到 `node_modules/` 文件夹（几百 MB）。这个文件夹**绝对不能上传**——它是从 `package.json` 自动装出来的，传上去既浪费空间又毫无意义。
>
> Node 模板的 `.gitignore` 已经帮你排除了 `node_modules/`、构建产物、缓存等所有该忽略的文件，省心。

### 2.2. 克隆到本地

仓库主页右上角点 **Code** → 选 **HTTPS** → 复制 URL。

打开命令行（Windows 用 `cmd` 或 PowerShell，Mac/Linux 用 Terminal），进到你想放项目的目录：

```bash
cd D:\           # Windows 示例
# cd ~/         # Mac/Linux 示例

git clone https://github.com/你的用户名/tech-notes.git
cd tech-notes
```


## 三、初始化 VitePress

### 3.1. 初始化 npm 项目

```bash
npm init -y
```

生成 `package.json`（项目的"身份证"），`-y` 表示所有问题都用默认答案。

### 3.2. 安装 VitePress

```bash
npm add -D vitepress
```

`-D` 表示开发依赖。这一步要下载几百 MB 依赖到 `node_modules/`，需要 1–3 分钟。

### 3.3. 运行 VitePress 初始化向导

```bash
npx vitepress init
```

它会问你几个问题，按下面这样回答：

| 问题 | 回答 |
|------|------|
| Where should VitePress initialize the config? | `./docs`（默认，回车） |
| Site title | 你的博客标题，比如 `Felix's Digital Garden` |
| Site description | 一句话描述，比如 `Personal tech notes` |
| Theme | **Default Theme + Customization**（推荐） |
| Use TypeScript for config? | **Yes** |
| Add VitePress npm scripts to package.json? | **Yes**（必选！） |

> ⚠️ **最后那个 scripts 一定要 Yes**，否则后面 GitHub Actions 会找不到 `npm run docs:build` 命令。

### 3.4. 第一次本地预览

```bash
npm run docs:dev
```

命令行显示 `http://localhost:5173/`，浏览器打开就能看到默认博客主页了。

按 `Ctrl + C` 停止预览。



## 四、第一次推送到 GitHub

代码现在还只在本地，先推上去看看能不能跑通基础流程。

### 4.1. 统一分支名

GitHub 上仓库默认分支叫 `main`，本地 `git init` 默认可能叫 `master`，先统一：

```bash
git branch -M main
```

> 💡 **为什么有两个名字？** 2020 年 GitHub 把新仓库默认分支从 `master` 改成了 `main`，但本地 Git 客户端的默认值各不相同。这一步就是把两边对齐。

### 4.2. 生成 Personal Access Token

第一次 push 需要登录认证。GitHub 不接受密码登录，必须用 **Personal Access Token（PAT）**。

1. 头像 → **Settings** → 左侧最底 **Developer settings**
2. **Personal access tokens** → **Tokens (classic)**
3. 右上角 **Generate new token (classic)**
4. 填写：
   - **Note**：备注，比如 `tech-notes-blog`
   - **Expiration**：90 days 或 No expiration
   - **Select scopes**：必须勾这两个 👇
     - ☑️ **repo**（整块勾上）
     - ☑️ **workflow**（关键！）

> 🚨 **workflow 权限**
>
> 只要你 push 的提交里包含 `.github/workflows/` 路径下的文件，PAT 必须有 `workflow` 权限，否则 GitHub 会拒绝。这是为了防止恶意脚本篡改别人仓库的 CI/CD。
>
> 漏勾的错误是这样的：
> ```
> refusing to allow a Personal Access Token to create or update workflow without `workflow` scope
> ```

5. 拉到底 **Generate token**
6. **立即复制 token**（关掉就再也看不到了），先粘到记事本备用

### 4.3. 提交并推送

```bash
git add .
git commit -m "init vitepress blog"
git push -u origin main
```

第一次 push 时：
- **浏览器弹出 GitHub 登录窗口** → 直接在浏览器里登录授权
- **或命令行问你账号密码** → 用户名填 GitHub 用户名，**密码粘贴 PAT**（不是 GitHub 登录密码！）

> 💡 **凭据会被系统缓存。** Windows 存在"凭据管理器"，macOS 存在"Keychain"。以后再 push 不用重新输入。
>
> **但反过来——如果以后换了 token，必须先清掉这里的旧缓存**，否则它会一直拿旧 token 失败。Windows 清理方法：`Win + R → control /name Microsoft.CredentialManager → Windows 凭据 → 删除所有 github 相关条目`。

push 成功后，去 GitHub 仓库页面刷新，能看到所有文件都上去了。


## 五、网站优化：让博客有"个人风格"

刚部署的 VitePress 是默认设置，只有初始页面和示例文件。下面开始一步步把它变成你的。

### 5.1. base 路径（必做，否则部署后无样式）

部署到 GitHub Pages 后，网站会在子路径下（如 `https://xxx.github.io/tech-notes/`）。VitePress 默认以为你在根路径，导致 CSS / JS 路径全部 404，页面会变成裸文字。

打开 `docs/.vitepress/config.ts`，在 `defineConfig({})` 里加：

```typescript
export default defineConfig({
  base: '/tech-notes/',   // 必须前后都带斜杠！仓库名一字不差
  // ... 其他配置
})
```

> ⚠️ 常见错误：
> - ❌ `base: 'tech-notes'`（缺斜杠）
> - ❌ `base: '/tech-notes'`（缺末尾斜杠）
> - ❌ `base: '/Tech-Notes/'`（大小写错）
> - ✅ `base: '/tech-notes/'`

### 5.2. 中文化界面

VitePress 默认所有界面是英文。修改 `config.ts` 加入语言和界面文案：

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/tech-notes/',
  lang: 'zh-CN',
  title: "Felix's Digital Garden",
  description: "Personal tech notes on everything I'm interested in.",

  themeConfig: {
    outline: { label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新于' },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
  }
})
```

### 5.3. 设置导航栏

导航栏在页面顶部，写在 `themeConfig.nav` 里：

```typescript
themeConfig: {
  nav: [
    { text: '首页', link: '/' },
    { text: 'Python', link: '/python/' },
    { text: 'Java', link: '/java/' },
    { text: 'AI', link: '/ai/' },
    { text: '关于', link: '/about' }
  ],
  // ...
}
```

每个 `link` 对应一个 Markdown 文件路径：
- `/` → `docs/index.md`
- `/python/` → `docs/python/index.md`（自动找该目录的 index）
- `/about/` → `docs/about.md`

### 5.4. 设置侧边栏

侧边栏是博客的灵魂——它体现你内容的组织逻辑。

#### 单层侧边栏（最简单）

```typescript
themeConfig: {
  sidebar: [
    {
      text: 'Python 学习',
      items: [
        { text: 'Python 基础语法', link: '/python/basics' },
        { text: '装饰器原理', link: '/python/decorator' },
        { text: '协程与异步', link: '/python/async' }
      ]
    }
  ]
}
```

#### 多组侧边栏（按目录区分）

不同目录显示不同的侧边栏，写法是用对象而不是数组：

```typescript
themeConfig: {
  sidebar: {
    '/python/': [
      {
        text: 'Python',
        items: [
          { text: '基础语法', link: '/python/basics' },
          { text: '装饰器', link: '/python/decorator' }
        ]
      }
    ],

    '/java/': [
      {
        text: 'Java',
        items: [
          { text: 'JVM 基础', link: '/java/jvm' },
          { text: 'Spring Boot', link: '/java/spring' }
        ]
      }
    ]
  }
}
```

访问 `/python/xxx` 显示 Python 侧边栏，访问 `/java/xxx` 显示 Java 侧边栏。

#### 可折叠分组

```typescript
sidebar: [
  {
    text: 'Python',
    collapsed: false,    // 默认展开，true 是默认折叠
    items: [
      { text: '基础', link: '/python/basics' },
      { text: '进阶', link: '/python/advanced' }
    ]
  },
  {
    text: 'Java',
    collapsed: true,
    items: [
      { text: 'JVM', link: '/java/jvm' }
    ]
  }
]
```

> 💡 **侧边栏设计原则**：
> 
> 每个分组建议 **3–7 个条目**。少了显得空，多了反而难找。如果某个分类内容很多，再嵌套子分组。

### 5.5. 设置网站标签页图标（favicon）

浏览器标签上那个小图标，能让你的博客一眼可辨。

**步骤一**：准备一个 favicon 图片
- 推荐尺寸：`32x32` 或 `64x64`
- 格式：`.svg`（最清晰）或 `.ico`
- 没有的话，可以用 [favicon.io](https://favicon.io/) 一分钟生成一个

**步骤二**：把图片放进项目
```
docs/
└── public/
    └── favicon.svg     # 注意必须放 public 目录
```

`public/` 是 VitePress 的静态资源目录，里面的文件会原样拷贝到网站根目录。

**步骤三**：在 `config.ts` 里声明

```typescript
export default defineConfig({
  // ...
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/tech-notes/favicon.svg' }]
  ]
})
```

> ⚠️ `href` 里要带上 `base` 路径！否则部署后会 404。
>
> 本地开发时（`npm run docs:dev`），用 `/favicon.svg`；部署到 GitHub Pages 时，要写完整的 `/仓库名/favicon.svg`。
>
> 一种省心的做法是用变量统一管理，但新手阶段先记住"带上仓库名前缀"即可。

### 5.6.  添加 GitHub 链接

```typescript
themeConfig: {
  socialLinks: [
    { icon: 'github', link: 'https://github.com/你的用户名/tech-notes' }
  ]
}
```

支持的图标：`github`、`gitlab`、`twitter`、`discord`、`linkedin`、`youtube`、`zhihu` 等等。

### 5.7.  启用本地搜索

```typescript
themeConfig: {
  search: {
    provider: 'local',
    options: {
      translations: {
        button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
        modal: {
          noResultsText: '无法找到相关结果',
          resetButtonTitle: '清除查询条件',
          footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
        }
      }
    }
  }
}
```

`provider: 'local'` 表示在浏览器本地搜索，不需要任何后端服务，免费且快。

### 5.8. 完整 config.ts 参考

把上面所有内容整合一下，你的 `docs/.vitepress/config.ts` 最终应该长这样：

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/tech-notes/',
  lang: 'zh-CN',
  title: "Tech Notes",
  description: "Personal tech notes.",

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/tech-notes/favicon.svg' }]
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Python', link: '/python/' },
      { text: 'Java', link: '/java/' },
      { text: 'AI', link: '/ai/' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/python/': [
        {
          text: 'Python',
          items: [
            { text: '基础语法', link: '/python/basics' },
            { text: '装饰器', link: '/python/decorator' }
          ]
        }
      ],
      '/java/': [
        {
          text: 'Java',
          items: [
            { text: 'JVM 基础', link: '/java/jvm' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/你的用户名/tech-notes' }
    ],

    outline: { label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新于' },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    }
  }
})
```

---

## 六、Frontmatter：每篇文章的"控制面板"

Frontmatter 是 Markdown 文件最顶部用 `---` 包起来的一段 YAML 元信息。它**不会显示在正文里**，但能让 VitePress 知道这篇文章怎么呈现。

### 6.1.  基本写法

```markdown
---
title: 我的第一篇 Python 笔记
description: 装饰器的底层原理与实战
date: 2026-05-06
tags: [Python, 装饰器]
---

# 装饰器原理

正文从这里开始……
```

### 6.2.  常用字段对照表

| 字段 | 作用 | 示例 |
|------|------|------|
| `title` | 页面标题（浏览器标签显示） | `title: 装饰器原理` |
| `description` | 页面描述（SEO 用） | `description: 深入理解 Python 装饰器` |
| `layout` | 页面布局类型 | `layout: home` |
| `sidebar` | 是否显示侧边栏 | `sidebar: false` |
| `aside` | 是否显示右侧目录 | `aside: false` |
| `outline` | 目录深度 | `outline: [2, 3]` |
| `prev` / `next` | 自定义上下页链接 | `prev: '上一篇'` |
| `editLink` | 是否显示"编辑此页"按钮 | `editLink: false` |
| `lastUpdated` | 是否显示更新时间 | `lastUpdated: true` |

> 更详细的介绍，请看官方文档的详细说明 [frontmatter 配置](https://vitepress.dev/zh/guide/routing#linking-to-non-vitepress-pages)

### 6.3. 实战示例

#### 一篇技术笔记的典型 frontmatter

```markdown
---
title: 装饰器原理
description: 从函数到闭包，再到装饰器的底层机制
outline: [2, 3]
---
```

#### 一篇隐藏侧边栏的独立页面

```markdown
---
title: 关于我
sidebar: false
aside: false
---
```

#### 自定义上下页

```markdown
---
title: 第二章
prev:
  text: '第一章·入门'
  link: '/book/chapter-1'
next:
  text: '第三章·进阶'
  link: '/book/chapter-3'
---
```



## 七、不同页面的布局类型

VitePress 内置了三种布局，对应不同的页面用途。

### 7.1. doc 布局（默认）

不写 `layout` 字段时就是这种。带侧边栏、右侧目录、上下页按钮，适合大多数文章。

```markdown
---
title: 我的文章
---

# 标题

正文……
```

### 7.2. home 布局（首页）

首页专用布局，有大标题、按钮、特性卡片等。`docs/index.md` 默认就是这种：

```markdown
---
layout: home

hero:
  name: "Felix's Digital Garden"
  text: "Personal tech notes"
  tagline: 我的技术笔记花园
  image:
    src: /logo.svg
    alt: Logo
  actions:
    - theme: brand
      text: 开始阅读
      link: /python/basics
    - theme: alt
      text: GitHub
      link: https://github.com/你的用户名/tech-notes

features:
  - icon: 🐍
    title: Python 与 AI
    details: 从语言基础到机器学习、LLM 应用
  - icon: ☕
    title: Java 后端
    details: Spring 生态、JVM 原理、并发与性能
  - icon: 🤖
    title: AI 应用
    details: RAG、Agent、Prompt 工程的实战经验
---
```

### 7.3. page 布局（自定义页）

完全干净的页面，不带任何 VitePress 的预设元素。适合做特殊页面（比如纯展示页、联系页）。

```markdown
---
layout: page
---

完全自定义的内容……
```

### 7.4. 局部控制：隐藏侧边栏、目录、导航栏

有时候你想保留 doc 布局但隐藏某些元素：

```markdown
---
title: 关于我
sidebar: false        # 隐藏左侧侧边栏
aside: false          # 隐藏右侧目录
outline: false        # 隐藏页面内目录
editLink: false       # 隐藏"编辑此页"
lastUpdated: false    # 隐藏更新时间
---
```

> 💡 **设计建议**：
> - **首页** → `layout: home`
> - **正文笔记** → 默认 doc（不写 layout）
> - **关于我 / 友链** → `sidebar: false` + `aside: false`，让页面更聚焦
> - **作品集 / 大事记** → `layout: page`，完全自定义

---

## 八、配置 GitHub Actions 自动部署

让每次 push 之后自动构建发布，是这套方案的"魔法"所在。

### 8.1. 创建工作流文件

在项目根目录创建路径：

```
tech-notes/
└── .github/
    └── workflows/
        └── deploy.yml
```

> ⚠️ `.github` 前面有个点，是隐藏文件夹。Windows 资源管理器创建带点开头的文件夹会报错，需要在命令行里建：
>
> ```bash
> mkdir .github
> cd .github
> mkdir workflows
> cd ..
> ```
>
> Mac/Linux 一句搞定：`mkdir -p .github/workflows`

### 8.2. 写入工作流配置

把下面内容**完整粘贴**到 `.github/workflows/deploy.yml`：

```yaml
name: Deploy VitePress

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run docs:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

> 🚨 **YAML 是缩进敏感的语言！**
>
> 每一级缩进必须是 **2 个空格**，**绝对不能用 Tab**。复制粘贴后用肉眼检查一遍——多一个空格、少一个空格都会让整个工作流失败，错误是：
> ```
> Invalid workflow file. You have an error in your yaml syntax on line X
> ```
>
> 如果用 VSCode 编辑，建议安装 **YAML** 插件（Red Hat 出的），它会自动高亮缩进错误。

### 8.3. 配置 GitHub Pages 设置

代码推上去之前，先把 GitHub 这边的两个开关打开。

#### 开关一：把 Source 改成 GitHub Actions

1. 仓库主页 → **Settings**
2. 左侧 → **Pages**
3. **Build and deployment** → **Source** → 选 **GitHub Actions**

> ⚠️ 默认是 "Deploy from a branch"，必须改！否则它会去找 `gh-pages` 分支，找不到就 404。

#### 开关二：给 Actions 写权限

1. 仓库 → **Settings** → **Actions** → **General**
2. 拉到最底，**Workflow permissions** 改成 **Read and write permissions**
3. 勾选 **Allow GitHub Actions to create and approve pull requests**
4. **Save**

> ⚠️ 默认是只读，Actions 没办法发布网站。

### 8.4. 推送并查看部署

```bash
git add .
git commit -m "feat: add github actions deployment"
git push
```

push 完立刻去 **Actions** 标签页，能看到一个工作流正在跑：

- 🟡 黄色圆圈 = 进行中
- ✅ 绿色对勾 = 成功
- ❌ 红色叉 = 失败（点进去看具体哪一步、报什么错）

通常 1–2 分钟跑完。绿色对勾后，访问：

```
https://你的用户名.github.io/tech-notes/
```

> 💡 **第一次打开如果发现样式不对，按 `Ctrl + F5` 强制刷新**（不是 F5）。浏览器缓存会骗你看到旧版本。



## 九、VSCode 全流程工作流

部署搞定之后，日常写作建议在 VSCode 里完成——更舒服、更高效、更专业。

### 9.1. 安装 VSCode

去 [code.visualstudio.com](https://code.visualstudio.com/) 下载安装。

### 9.2. 必装插件清单

打开 VSCode 左侧 **扩展（Extensions）**，搜索安装：

| 插件 | 作用 |
|------|------|
| **Chinese (Simplified) Language Pack** | 中文界面 |
| **Markdown All in One** | Markdown 写作必备（快捷键、自动列表、目录生成） |
| **Markdown Preview Enhanced** | 增强版预览（支持 Mermaid、数学公式等） |
| **YAML** | YAML 语法高亮 + 错误提示（写 deploy.yml 必备） |
| **GitLens** | Git 历史与差异可视化 |
| **vscode-icons** | 漂亮的文件图标 |
| **Code Spell Checker** | 单词拼写检查 |

### 9.3. 用 VSCode 打开项目

两种方式：

**方式 A：命令行**
```bash
cd D:\tech-notes
code .
```

**方式 B：界面**
VSCode → 文件 → 打开文件夹 → 选择 `tech-notes` 目录

### 9.4. 实时预览前端效果（核心工作流）

这是 VSCode 写作最大的优势——边写边看效果。

#### 步骤

1. VSCode 顶部菜单 → **终端 → 新建终端**（快捷键 ``Ctrl + ` ``）
2. 在终端里执行：
   ```bash
   npm run docs:dev
   ```
3. 终端会显示一个本地地址，通常是 `http://localhost:5173/`
4. 按住 `Ctrl` 点击这个链接（或浏览器打开），就能看到你的博客
5. **保持终端开着**，回到 VSCode 编辑 Markdown 文件
6. **每按 Ctrl + S 保存，浏览器自动刷新**——所见即所得

#### 推荐的工作区布局

把 VSCode 和浏览器并排放：

```
┌─────────────┬─────────────┐
│             │             │
│  VSCode     │  浏览器      │
│  (编辑)     │  (预览)     │
│             │             │
└─────────────┴─────────────┘
```

左边写，右边即时看到效果。这就是现代静态站点开发的"双屏快感"。

### 9.5 常用 Markdown 写作快捷键

在 VS Code 安装了 **Markdown All in One** 插件（VS Code 专门的 md 写作插件）后：

| 快捷键 | 作用 |
|--------|------|
| `Ctrl + B` | 加粗 |
| `Ctrl + I` | 斜体 |
| `Ctrl + Shift + V` | 在 VSCode 内打开预览 |
| `Ctrl + K V` | 旁边打开预览（双栏） |
| `Alt + Shift + F` | 格式化文档 |
| 在列表里按回车 | 自动续行新的列表项 |
| 选中文字后输入 `[](url)` | 自动包裹为链接 |

### 9.6. VSCode 可视化 Git 操作

写完文章后要 push 到 GitHub。VSCode 内置 Git 工具，全程不用敲命令。

#### 完整流程

1. **查看改动**：左侧 **源代码管理**（Source Control）图标（一个分叉的圆圈）
2. **看每个文件的修改**：点击文件名，会显示左右对比视图
3. **暂存改动**：把鼠标移到文件名旁，点 **+**（暂存所有就点改动列表标题旁的 **+**）
4. **写 commit 信息**：在顶部输入框里写一句话描述这次改动
   - 推荐格式：
     - `post: 新增装饰器笔记`
     - `fix: 修复侧边栏链接`
     - `chore: 更新主题配置`
5. **提交**：按 `Ctrl + Enter`，或点输入框旁的 **✓ 提交** 按钮
6. **推送到 GitHub**：点底部状态栏的 **同步更改**（云朵图标），或顶部 **... → 推送**

#### 状态栏的图标含义

VSCode 最底部状态栏会显示当前 Git 状态：

```
main ↓0 ↑1     # 当前分支 main，本地有 1 个未推送的 commit
```

- `↓` = 本地落后远程几个 commit（需要 pull）
- `↑` = 本地领先远程几个 commit（需要 push）

### 9.7. 完整写作发布流程（黄金循环）

总结一下日常写一篇博客的完整动作：

```
1. VSCode 打开项目
   └→ 终端跑 npm run docs:dev
   └→ 浏览器开 localhost:5173

2. 新建一篇文章
   └→ docs/python/decorator.md
   └→ 写 frontmatter
   └→ 写正文，边写边看浏览器

3. 调整侧边栏
   └→ 编辑 docs/.vitepress/config.mts
   └→ 在 sidebar 里加上新文章的链接

4. Ctrl + S 保存所有文件
   └→ 浏览器自动刷新确认效果

5. 提交到 Git
   └→ 源代码管理 → 暂存所有改动
   └→ 写 commit 信息: "post: 装饰器原理"
   └→ Ctrl + Enter 提交

6. 推送到 GitHub
   └→ 点云朵图标同步

7. 等 GitHub Actions 跑完（1-2 分钟）
   └→ Actions 标签查看进度
   └→ 跑完后访问线上网址（Ctrl + F5 强刷）
```




## 十、常见错误对照表

写得再多不如出错时一秒定位。把这张表收藏起来：

| 错误信息 | 原因 | 解决 |
|---------|------|------|
| `refusing to allow a Personal Access Token without workflow scope` | PAT 没勾 workflow | 重新生成 PAT，勾上 workflow |
| `upstream branch of your current branch does not match` | 本地远程分支名不一致 | `git branch -M main` 后再 push |
| `Invalid workflow file. yaml syntax on line X` | YAML 缩进错了 | 每级严格 2 空格，不要用 Tab |
| Actions 跑成功但页面 404 | Pages Source 没设成 Actions | Settings → Pages → 改 Source |
| Actions 失败提示权限不足 | Workflow permissions 是只读 | Settings → Actions → 改成读写 |
| 网页能打开但样式全无 | base 路径没配 | config.ts 加 `base: '/仓库名/'` |
| 改了 base 还是没样式 | 浏览器缓存 | `Ctrl + F5` 强制刷新 |
| favicon 显示不出来 | href 没带仓库名前缀 | 改成 `/仓库名/favicon.svg` |
| `node_modules` 被一起推上去 | .gitignore 缺失或来晚了 | `git rm -r --cached node_modules` 重新提交 |
| 换了新 token 还是失败 | 系统缓存的还是旧 token | 凭据管理器删掉旧条目，重新输 |


## 十一、之后还能怎么扩展

打通这套流程后，你已经具备了所有底层能力。下面是一些进阶方向，可以按兴趣慢慢探索：

- **绑定自定义域名**：买一个 `xxx.com` 域名，把博客绑上去
- **加评论系统**：用 [Giscus](https://giscus.app/zh-CN)，基于 GitHub Discussions 的评论，完美匹配 GitHub Pages
- **加访问统计**：[Umami](https://umami.is/) 开源、轻量、隐私友好
- **生成 RSS 订阅**：让读者用 RSS 阅读器订阅你的博客
- **使用自定义 Vue 组件**：在 Markdown 里直接写交互式组件
- **深色模式默认**：让用户首次访问就是深色主题
- **代码主题美化**：换 Shiki 的主题（GitHub Dark、Dracula、One Dark Pro 等）
- **配置 SEO**：让你的文章在搜索引擎里被找到

每一个方向都是一篇笔记的素材。



## 写在最后

这套流程一旦走通，你就拥有了一个 **完全免费、永远在线、无限扩展** 的技术博客。
更重要的是，你顺带掌握了：

- Git 基础工作流（add / commit / push / 分支管理）
- GitHub Actions 的基本概念（CI/CD）
- YAML 配置文件
- 现代静态站点的构建原理
- Token / 凭据管理 / 权限模型
- VSCode 的高效写作工作流

这些技能在任何技术工作中都用得到。**做一个项目，学一整个领域**——就是这个意思。

如果某一步卡住了，欢迎在仓库 issue 区交流。我相信好的提问，比好的答案更稀缺。

---

> 🌱 *VitePress 是我数字花园里的第一个知识库。*
>
> 
> *它记录了如何搭建这个花园本身——一种自指的浪漫。*