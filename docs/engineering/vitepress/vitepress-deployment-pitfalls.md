# 从零搭建 VitePress 技术博客踩坑全记录

> 一次完整的"GitHub 仓库 + GitHub Pages + VitePress"部署实战，记录我在这个过程中踩过的所有坑、绕过的所有弯路，以及最后悟到的经验。
>
> 写这篇笔记的目的不是炫耀解决了多少问题，而是诚实地记录"一个新手在没有背景知识时会怎么栽跟头"——希望能帮到下一个走这条路的人。

---

## 起点：我的初始状态

- ✅ 知道自己想要什么：一个能在线访问的技术博客
- ✅ 选定了方案：GitHub 仓库 + GitHub Pages + VitePress
- ❌ Git / GitHub 几乎零基础
- ❌ 不知道 GitHub Actions 是什么
- ❌ YAML 配置不熟悉
- ❌ 没用过 Personal Access Token


**坑都是从"未知的未知"里冒出来的。** 下面按踩坑顺序逐一复盘。

---

## 坑 #1：Personal Access Token 的 `workflow` 权限

### 现象

第一次 `git push` 时报错：

```
! [remote rejected] master -> master
  (refusing to allow a Personal Access Token to create or update
   workflow `.github/workflows/deploy.yml` without `workflow` scope)
error: failed to push some refs
```

### 当时的困惑

- 看到 "remote rejected" ，以为是仓库权限问题
- 注意力被 "master" 这个词分散，开始怀疑是分支问题（其实根本不是）
- 没意识到 `without workflow scope` 才是真正的关键信息

### 真正的原因

我当时用的 PAT 只勾了 `repo` 权限，没勾 `workflow` 权限，这都是默认的，我没接触过 workflow 之前自然不知道；
GitHub 的安全策略：**只要你 push 的提交里包含 `.github/workflows/` 目录下的文件，PAT 就必须额外有 `workflow` 权限**。这是为了防止恶意脚本篡改别人仓库的 CI/CD 流程。

### 教训

> 常识踩坑一次，后面就知道了

**核对清单：** 生成 PAT 时勾选的 scopes，至少需要：
- ☑️ `repo`（仓库读写）
- ☑️ `workflow`（修改 GitHub Actions 配置）

---

## 坑 #2：Windows 凭据管理器的 Github Token 修改后没生效

### 现象

我去 GitHub 重新生成了带 `workflow` 权限的新 token，回到命令行重新 push——**还是同样的错误**。

### 当时的困惑
- 确实生成了新的 token，权限也够都按照指示勾选上了
- 凭证管理器中的密码也更新了，怎么还是错误的？


### 真正的原因

**Windows 凭据管理器默默缓存了旧 token。** Git 在 push 时优先从凭据管理器拿凭据，根本不会弹窗问你。我"换 token"只换了 GitHub 那一端，本地这一端没动，等于没换。

### 解决步骤

1. Win 键 → 搜索"凭据管理器" → Windows 凭据
2. 找到所有名字包含 `github` / `git` 的条目，全部删除
4. 再 push，Git 没凭据了，会弹窗让你输新的,`git push -u origin main`
5. 用户名填 GitHub 用户名，**密码粘贴 token**（不是 GitHub 登录密码，而是刚生成好的 PAT）

### 教训

> **认证问题永远要"两端同时检查"——服务端的凭据是新的，但客户端缓存的可能是旧的。**

**核对清单：** 每次更换 token / 密钥，必须同步清理：
- 本地 Git 凭据缓存
- IDE 内置的 Git 凭据
- 操作系统的密钥环（Windows Credential Manager / macOS Keychain）

---

## 坑 #3：本地 master vs 远程 main 的分支名错位

### 现象

执行 `git push` 后报错：

```
fatal: The upstream branch of your current branch does not match
the name of your current branch.
```

### 当时的困惑

我从来没创建过分支，怎么会有"分支不匹配"的问题？

### 真正的原因

- **老版本 Git / Windows 上的 Git** 默认初始化分支名是 `master`
- **GitHub 网页新建仓库**默认主分支是 `main`
- 一边叫 master，一边叫 main，Git 不知道怎么对应

### 解决步骤

```bash
git branch -M main           # 把本地 master 改名成 main
git push -u origin main      # 推送并建立"本地 main → 远程 main"的关联
```

`-u` 参数很关键——它告诉 Git："以后这个本地分支默认就推到远程的同名分支"，之后只需 `git push` 即可。

### 经验

> **"分支"不是高级概念，而是 Git 的最基本单位。所谓"主线"就是默认那条分支，名字可以叫 master 也可以叫 main。**

**背景知识：** GitHub 在 2020 年把新建仓库的默认分支名从 `master` 改成了 `main`，这是社会文化层面的调整。现在新项目都建议用 `main`。

---

## 坑 #4：`.gitignore` 失效，`node_modules` 依旧被追踪上传

### 现象

push 成功后去仓库看，**发现 `node_modules/` 文件夹也被推上去了**——3976 个文件，18 MB，仓库瞬间臃肿。

### 当时的困惑

- 写好的 `.gitignore` 吗？为什么没起作用？

### 真正的原因

我的操作顺序有问题：

```
1. npm add -D vitepress     ← 此时 node_modules 出现
2. git add .                 ← ⚠️ 此时 .gitignore 还没有，就已经直接 add 上去了
3. git commit
4. npx vitepress init        ← 此时才生成 .gitignore
```

**`.gitignore` 只对未追踪的文件生效，对已追踪的不管用。** Git 一旦把某个文件纳入版本管理，后来再加 `.gitignore` 也没用——你必须显式告诉 Git "忘掉它"。

### 解决步骤

```bash
git rm -r --cached node_modules     # 从追踪中移除（保留本地文件）
git commit -m "chore: remove node_modules from tracking"
git push
```

**关键参数：** `--cached` 表示"只从 Git 追踪里移除，本地文件保留"。如果忘了加这个参数，会把本地 `node_modules` 也删了，VitePress 就跑不起来了。

### 教训

> **`git init` 之后第一件事，永远是先建好 `.gitignore`，再 `git add .`。** 顺序反了就要用 `git rm --cached` 救火。

**Node.js 项目 `.gitignore` 必备项：**
```
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
.DS_Store
*.log
```

---

## 坑 #5：YAML 缩进引发的部署失败

### 现象

push 成功了，GitHub Actions 自动跑起来——**红叉 Failure**。点进去看：

```
Invalid workflow file
You have an error in your yaml syntax on line 12
```

### 当时的困惑

- 直接复制粘贴的示例哪里出错了？

### 真正的原因

**YAML 是缩进敏感的语言，差一个空格全盘失败。** 我贴进去的内容大概是下面这样的。

为什么？因为我是直接问 Claude 的，他知道是要缩进的，但 Markdown 渲染时却出了问题或者说就是它又犯浑了。

```yaml
on:
push:                ← 错误：应该缩进 2 空格
  branches: [main]
jobs:
deploy:              ← 错误：应该缩进 2 空格
```

正确的应该是：

```yaml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
```



### 教训

> **YAML / Python 这类缩进敏感的语言，复制粘贴后一定要肉眼检查缩进。** 缩进永远用空格不用 Tab，永远 2 空格一级（不要混用 2 和 4）。

**出错后同时 Claude又给我把 deploy.yml 重写为更现代的版本**，用了 GitHub 官方推荐的 `actions/deploy-pages@v4`（替代第三方的 `peaceiris/actions-gh-pages`），更稳定。

---

## 坑 #6：网站 CSS 样式没加载出来

### 现象

终于看到网站了，**但是页面像 1995 年的网页**——纯文字、无样式、布局错乱。

<img width="1512" height="790" alt="image" src="https://github.com/user-attachments/assets/0d32db5c-0f6f-4d7f-a543-67c965cdb14a" />


### 当时的困惑

这么原始的页面，VitePress 就干了这些吗？

### 真正的原因

VitePress 默认假设你部署在域名根目录（`https://xxx.github.io/`），所以生成的 CSS 链接是 `/assets/style.css`。

但我的网站实际部署在子路径下（`https://xqs-xqs.github.io/tech-notes/`），浏览器去找 `/assets/style.css` 当然 404——正确路径应该是 `/tech-notes/assets/style.css`。

CSS 全部加载失败，页面就裸奔了。

### 解决方法

在 `docs/.vitepress/config.ts` 里加一行, base: '/tech-notes/',：

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/tech-notes/',                        // ← 加这一行（注意仓库名前后必须有斜杠）
  title: "Felix's Digital Garden",
  description: "Personal tech notes on everything I'm interested in.",
  themeConfig: {
    // ... 其他配置保持原样
  }
})
```

### 教训

> **部署在子路径下的 SPA / 静态站点，几乎都需要配置 `base` / `publicPath` / `homepage` 这类参数。** 框架不一样名字不一样，但概念是同一个。

**核对清单：** `base` 配置的常见错误：
- ❌ `base: 'tech-notes'` — 缺斜杠
- ❌ `base: '/tech-notes'` — 缺末尾斜杠
- ❌ `base: '/Tech-Notes/'` — 大小写和仓库名不一致
- ✅ `base: '/tech-notes/'` — 完全正确

---

## 坑 #8：修改完 base 路径后，页面依旧没有成功恢复

### 现象

加了 `base` 配置，commit 推上去，Actions 跑完了——**网站还是没样式**。

### 真正的原因

浏览器把旧的 HTML / CSS 缓存了，刷新（F5）只重载 HTML，CSS 不会重新请求。所以我看到的还是旧版本。

### 解决方法

**Ctrl + F5（强制刷新）**，或 **Ctrl + Shift + R**，绕过缓存。

### 教训

> **调试静态站点时，普通刷新（F5）会骗你。** 看到改了没效果，先强制刷新一次再下结论。

更彻底的办法：开 F12 → Network 标签 → 勾选 "Disable cache"，调试期间一直保持。

---

## 完整的最终架构

踩完所有坑后，整个工作流是这样的：

```
本地写 Markdown
      ↓
git push 到 main 分支
      ↓
GitHub Actions 自动触发（监听 push 事件）
      ↓
读取 deploy.yml 配置
      ↓
checkout 代码 + setup Node 22 + npm ci
      ↓
npm run docs:build（VitePress 编译）
      ↓
upload-pages-artifact 上传产物
      ↓
deploy-pages 发布到 GitHub Pages
      ↓
1-2 分钟后可访问 https://xqs-xqs.github.io/tech-notes/
```

**关键认知转变：** 学到了新的博客网站全自动工作流——**现代静态站点是"源代码 → 构建 → 部署"的流水线**，写 Markdown 只是这条流水线的开头。

---

## 通用经验：这次踩坑教会我的事

### 1. 错误信息是地图，不是噪音

每次报错我第一反应都很着急，啥也没细看，就急急忙忙直接找AI，自己却连问题是什么都不了解，以为 AI 可以帮助自己解决一切问题，但实际上连自己连问题是什么都不清楚，只能傻乎乎的跟着 AI 走，但如果一旦他有东西没说全或者真漏了什么，自己就会很被动

 GitHub / Git 的报错信息往往把答案直接写出来了。比如那句 `without workflow scope`，多看一眼就能进一步理解问题，这样即使后面 AI 再出错，自己也能很快调整过来。

**新习惯：报错先逐字读完，再做反应。**

### 2. 默认值不一定是合理值，但一定是有原因的

PAT 默认不勾 workflow（防止滥用）、Pages 默认从 branch 部署（兼容老用户）、Actions 默认只读权限（安全优先）……每个默认值背后都有它的考量，但对新手来说就是一道道隐形门槛。

**新习惯：每用一个新工具，先翻一遍它的"权限/默认设置"页面。**

### 3. 顺序是有重大意义的

`git add` 之前要有 `.gitignore`、装依赖之前要 `npm init`、改 token 之前要清缓存——这些操作在表面上看都"差不多"，但顺序错了就要花十倍时间补救。

**新习惯：第一次做某个操作前，先在脑子里走一遍流程，确认顺序。**

### 4. 缓存是甜蜜的陷阱

浏览器缓存、Git 凭据缓存、npm 缓存、CDN 缓存……缓存让生活更快，也让排错更难。

**新习惯：调试遇到"明明改了没效果"，先怀疑缓存。**

### 5. 工具链的复杂度是层层叠加的

我以为 VitePress 就是写 Markdown，结果一路用到了：Git、GitHub、PAT、SSH/HTTPS、YAML、GitHub Actions、Node.js、npm、Vite、CI/CD、CDN、缓存策略……

**这不是劝退，而是认知升级。**每个看起来"一步搞定"的现代工具，背后都是几十年工程实践的产物。把它们一一弄懂的过程，本身就是在打基本功。

---

## 写在最后

这次部署一共踩了 8 个坑，花了大概 2 小时。如果有人提前告诉我所有这些坑，可能 30 分钟就能搞定。

但讲真——**如果直接被人手把手带过来，我学到的会少 80%。** 每一次报错、每一次"我明明做对了为什么还不行"、每一次盯着错误信息逐字翻译——这些瞬间才是真正在塑造工程能力的时刻。

**AI 时代再次印证了这一点：能问出"我哪里错了"的人，永远比能背"标准答案"的人走得远。**

这就是我建这个数字花园的初衷。

---

> 🌱 *如果这篇记录对你有帮助，欢迎在 issue 区交流你遇到的类似问题。我相信好的提问比好的答案更稀缺。*
