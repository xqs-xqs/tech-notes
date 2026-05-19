import { defineConfig } from 'vitepress'
// import { withSidebar } from 'vitepress-sidebar'

const vitePressConfig = defineConfig({
  base: '/tech-notes/',
  lang: 'zh-CN',
  title: "Felix's Digital Garden",
  description: "Personal tech notes on everything I'm interested in.",
  // 当设置为 true 时，VitePress 将从 URL 中删除 .html 后缀
  cleanUrls: true,
  // 是否使用 Git 获取每个页面的最后更新时间戳
  lastUpdated: true,

  // 网站图标
  // type 告诉浏览器：这个 favicon 文件的 MIME 类型 是 SVG 图片
  // 如果设置了 base，要使用 /base/favicon.ico，否则浏览器会找不到对应的路径
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/tech-notes/favicon.svg' }]
  ],

  // 开启 markdown 文件中数学公式的渲染
  markdown: {
    math: true
  },

  themeConfig: {
    // 顶部导航 = 知识库切换器
    nav: [
      { text: '首页', link: '/' },
      { text: '工程实践', link: '/engineering/', activeMatch: '/engineering/' },
      { text: '思考与随笔', link: '/thoughts/', activeMatch: '/thoughts/' },
      { text: '知识探索', link: '/exploration/', activeMatch: '/exploration/' },
      // 后续新增分类，按下面格式加一行就行：
      // { text: 'Agent', link: '/agent/', activeMatch: '/agent/' },
      // { text: 'Python', link: '/python/', activeMatch: '/python/' },
      // { text: '数据库', link: '/database/', activeMatch: '/database/' },
    ],

    // 根据页面路径显示不同的侧边栏，同时多分组 sidebar
    sidebar: {
      '/engineering/': [
        // {
        //   text: '新手入门',
        //   collapsed: false,
        //   items: [
        //     { text: '工程实践导览', link: '/engineering/' },
        //     { text: '我的博客项目介绍', link: '/engineering/blog-intro' }
        //   ]
        // },
        {
          text: 'VitePress',
          collapsed: false,
          items: [
            {
              text: '从零搭建 VitePress 技术博客踩坑全记录',
              link: '/engineering/vitepress/vitepress-deployment-pitfalls'
            },
            {
              text: '搭建 VitePress 博客完整指南',
              link: '/engineering/vitepress/vitepress-full-guide'
            }
          ]
        },
        {
          text: '附录：工具链',
          collapsed: false,
          items: [
            { text: '常用 Git 命令速查', 
              link: '/engineering/appendix/git-commands' 
            }
            // { text: 'VS Code 写作环境配置', link: '/engineering/appendix/vscode-writing' }
          ]
        }
      ],
      
      '/exploration/': [
        {
          text: '网络与安全',
          collapsed: false,
          items: [
            {
              text: '无线网络中的对抗性防御综述',
              link: '/exploration/network-and-security/adversarial-defenses-in-wireless-networks'
            }
          ]
        },
        {
          text: '读书笔记',
          collapsed: true,
          items: [
            { text: '主题总览', link: '/exploration/reading-notes/' }
          ]
        },
        {
          text: '跨领域探索',
          collapsed: true,
          items: [
            { text: '主题总览', link: '/exploration/cross-domain/' }
          ]
        }
      ]
    },


    // 社交媒体链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xqs-xqs/tech-notes' }
    ],

    // logo 设置
    siteTitle: '🌱 Felix\'s Digital Garden',

    // 渲染大纲，以及设置显示的层级
    outline: { 
      label: '本页目录', 
      level: [2, 3] 
    },
    docFooter: { 
      prev: '上一页', 
      next: '下一页' 
    },
    lastUpdated: { 
      text: '最后更新于' 
    },
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    externalLinkIcon: true,

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 <a href="https://github.com/xqs-xqs">Felix</a>'
    },

    editLink: {
      pattern: 'https://github.com/xqs-xqs/tech-notes/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档', 
            buttonAriaLabel: '搜索文档' 
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { 
              selectText: '选择', 
              navigateText: '切换', 
              closeText: '关闭' 
            }
          }
        }
      }
    }
  }

  
})

// // 自动扫描每个知识库文件夹生成侧边栏
// // 以后加新分类只要在下面 sidebarConfigs 数组里加一项
// const sidebarConfigs = [
//   {
//     documentRootPath: 'docs',
//     scanStartPath: 'engineering',
//     basePath: '/engineering/',
//     resolvePath: '/engineering/',
//     useTitleFromFileHeading: true,    // 用 .md 里第一个 # 标题作为侧边栏文字
//     useFolderTitleFromIndexFile: true, // 文件夹有 index.md 就用它的标题
//     collapsed: false,                  // 文件夹默认展开
//     collapseDepth: 2,                  // 第二层及更深默认折叠
//     sortMenusByName: true,
//     excludeFiles: ['index.md'],        // 不把 index.md 单独列出来（它是分类首页）
//   },
//   // 以后增加新分类，照这个格式复制一份：
//   // {
//   //   documentRootPath: 'docs',
//   //   scanStartPath: 'agent',
//   //   basePath: '/agent/',
//   //   resolvePath: '/agent/',
//   //   useTitleFromFileHeading: true,
//   //   useFolderTitleFromIndexFile: true,
//   //   collapsed: false,
//   //   collapseDepth: 2,
//   //   sortMenusByName: true,
//   //   excludeFiles: ['index.md'],
//   // },
// ]

// VitePress 配置文件必须最终导出
// export default withSidebar(vitePressConfig, sidebarConfigs)
export default vitePressConfig