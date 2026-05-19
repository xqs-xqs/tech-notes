---
title: 当 Wi-Fi 学会“撒谎”：无线网络中的 AI 攻防战
description: 一篇面向技术读者的长篇科普综述，介绍深度学习如何被对抗扰动欺骗，以及无线网络如何通过主动防御、被动检测和域特异性约束进行反击。
date: 2026-05-19
category: Wireless Security
section: 知识探索
series: 无线网络与安全
tags:
  - Wireless Networks
  - AI Security
  - Adversarial Machine Learning
  - Network Security
  - Survey
  - NIDS
  - O-RAN
  - Wi-Fi Sensing
  - Federated Learning
readTime: 30 min read
featured: true
outline: deep
---


# 当 Wi-Fi 学会"撒谎"：无线网络中的 AI 攻防战

> 本文基于笔者所撰写的英文综述 *A Comprehensive Survey of Adversarial Defense Mechanisms in Wireless Networks* 改写而成，融合了 2022 — 2026 年间的最新研究进展。文中标注的方括号上标 ⁽¹⁾ ⁽²⁾ … 对应文末参考文献。

一篇关于深度学习如何被无形扰动欺骗，以及无线网络如何反击的长篇科普综述。





## 序言：一个让 AI"看走眼"的小实验

设想你是一名网络安全工程师，公司花了大价钱训练了一套基于深度学习的入侵检测系统（NIDS）——它在测试集上的准确率高达 99.7%，几乎可以闭着眼睛识别出任何已知的网络攻击模式。

某天清晨，你的系统警报全程沉默。你打开日志，发现确实没有任何异常流量。但当你跑去机房，却看到一台核心服务器正被远程矿工占用，CPU 满载，散热风扇嘶吼着。

复盘时你发现：攻击者在每个恶意数据包的"包间隔时间"上加了几微秒的微扰动。这些扰动小到任何人工规则都不会触发警报，可你的 AI 模型偏偏把它们整整齐齐地划分成了"正常流量"。

这不是科幻小说。这是 Zhang 等人在 2022 年发表的真实实验——攻击者**仅通过修改流量的时间特征**，就让最先进的 NIDS 漏检率高达 **35.7%**⁽¹⁾。

欢迎来到无线网络的"AI 攻防战"前线。这是一场你可能从未听说过的战争，但它正在你每天用的 Wi-Fi、4G/5G、自动驾驶通信、IoT 智能家居中悄然进行。


## 第一章 : 什么是"对抗样本"？AI 的"视觉幻觉"

### 1.1 一个反直觉的发现

2013 年，Szegedy 等人发现了一个让深度学习社区震惊的现象：在一张正确分类的熊猫图片上，叠加一层人眼完全看不出区别的"噪声"，神经网络就会自信满满地把它识别成长臂猿——置信度高达 99.3%。

```
[原始熊猫图]   +  [人眼不可见扰动]  =  [对抗样本：仍然像熊猫]
   ↓                                       ↓
"熊猫" (57.7%)                        "长臂猿" (99.3%)
```

这个看似"病态"的输入，被称为**对抗样本（Adversarial Example）**。它揭示了一个深刻的事实：**深度神经网络学到的"决策边界"，与人类的认知边界有着本质的不同。**

> 💡 **反问 #1：等等，这不就是模型被噪声干扰了吗？换个去噪模块不就完事了？**
>
> 这是初学者最常见的误解。普通噪声是**随机的**——它在所有方向上"乱跑"，对模型的影响通常较小，因为模型在训练时见过类似的扰动。但对抗扰动是**有方向的**——它沿着模型损失函数梯度的"上山方向"精确推进，每一步都精准踩在模型最薄弱的地方。
>
> Goodfellow 在 2015 年的经典论文《Explaining and Harnessing Adversarial Examples》中给出了著名的几何直觉：在高维空间里，类别的决策边界距离样本点其实非常近，只需要在某个特定方向上推一小步，就能跨越边界⁽FGSM⁾。这就好比你站在悬崖边，随机方向走一步可能没事，但只要朝悬崖方向迈一小步就掉下去了——而对抗攻击者，恰恰知道悬崖在哪里。

### 1.2 数学上的"魔法配方"

对抗样本的生成可以用一个简洁的优化问题来描述：

$$
\min_{\delta} \|\delta\|_p \quad \text{s.t.} \quad f(x+\delta) \neq y, \quad \|\delta\|_p \leq \epsilon
$$

翻译成人话就是：**找一个尽可能小的扰动 δ，让模型 f 把原本属于类别 y 的输入 x 错分到其他类别**。这里的 ε（epsilon）就是扰动预算——攻击者愿意"出多大力"。

最经典的生成方法是 Goodfellow 的 **FGSM（Fast Gradient Sign Method）**：

$$
x_{adv} = x + \epsilon \cdot \mathrm{sign}(\nabla_x J(\theta, x, y))
$$

它只做一件事：**沿着损失函数对输入的梯度方向，走一小步**。 这一步的方向告诉了攻击者："朝这边推，模型最容易错"。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" style="background:#F8F9FA;font-family:'Helvetica Neue',Arial,sans-serif">
  <!-- 标题 -->
  <text x="400" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#1E3A5F">对抗样本的生成原理：沿损失梯度推一小步</text>


  <!-- 原始输入 -->
  <rect x="40" y="80" width="140" height="100" rx="8" fill="#E8F1F8" stroke="#1E3A5F" stroke-width="2"/>
  <text x="110" y="105" text-anchor="middle" font-size="13" fill="#1E3A5F" font-weight="bold">原始输入 x</text>
  <text x="110" y="135" text-anchor="middle" font-size="11" fill="#444">恶意流量包</text>
  <text x="110" y="155" text-anchor="middle" font-size="11" fill="#444">正确标签：恶意</text>

  <!-- 加号 -->
  <text x="210" y="140" text-anchor="middle" font-size="36" fill="#888" font-weight="300">+</text>

  <!-- 扰动 -->
  <rect x="240" y="80" width="180" height="100" rx="8" fill="#FFF4E6" stroke="#F4A261" stroke-width="2"/>
  <text x="330" y="105" text-anchor="middle" font-size="13" fill="#A8530B" font-weight="bold">微小扰动 δ</text>
  <text x="330" y="130" text-anchor="middle" font-size="11" fill="#A8530B">ε · sign(∇ₓJ)</text>
  <text x="330" y="152" text-anchor="middle" font-size="10" fill="#666">沿梯度上升方向</text>
  <text x="330" y="168" text-anchor="middle" font-size="10" fill="#666">|δ| 小到肉眼不可见</text>

  <!-- 等号 -->
  <text x="450" y="140" text-anchor="middle" font-size="36" fill="#888" font-weight="300">=</text>

  <!-- 对抗样本 -->
  <rect x="480" y="80" width="160" height="100" rx="8" fill="#FBE7E7" stroke="#D64545" stroke-width="2"/>
  <text x="560" y="105" text-anchor="middle" font-size="13" fill="#D64545" font-weight="bold">对抗样本 x'</text>
  <text x="560" y="130" text-anchor="middle" font-size="11" fill="#444">看起来仍像恶意</text>
  <text x="560" y="148" text-anchor="middle" font-size="11" fill="#D64545" font-weight="bold">但 AI 判定：正常 ✓</text>

  <!-- 箭头到模型 -->
  <line x1="560" y1="190" x2="560" y2="220" stroke="#444" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- 模型 -->
  <rect x="460" y="225" width="200" height="50" rx="25" fill="#1E3A5F"/>
  <text x="560" y="248" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">深度学习 NIDS</text>
  <text x="560" y="265" text-anchor="middle" font-size="11" fill="#cce">输出："正常流量" ❌</text>

  <!-- 警示语 -->
  <text x="400" y="300" text-anchor="middle" font-size="12" fill="#666" font-style="italic">攻击者只需让 ε 足够小、方向足够准，就能让 AI 在不知不觉中"叛变"</text>

  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <polygon points="0 0, 10 5, 0 10" fill="#444"/>
    </marker>
  </defs>
</svg>

### 1.3 为什么无线网络是"重灾区"？

对抗样本的研究最初在计算机视觉领域火起来——但在无线网络领域，它的危害可能更严重。原因有四：

| 特性         | 计算机视觉       | 无线网络                   |
| --- | --- | --- |
| **攻击面**   | 图像由攻击者上传 | 信道开放，任何人可注入信号 |
| **设备能力** | GPU 服务器       | IoT 终端可能只有几 KB 内存 |
| **延迟容忍** | 几百毫秒可接受   | URLLC 要求 <1 ms           |
| **后果**     | 图片识别错误     | 自动驾驶车祸、电网瘫痪     |

更糟糕的是，无线信号还要满足**物理层合法性**——攻击者添加的扰动不仅要骗过 AI，还得能真实地从天线发射出去并到达接收端，不能违反功率限制、带宽约束或调制规则⁽²⁾。这反而让攻击变得更"狡猾"：那些不能物理实现的扰动，防御方甚至**不需要**去防它们。



## 第二章：威胁建模 — — 攻击者到底有多强？

要谈防御，得先弄明白"敌人"是什么样子。安全研究里有句老话：**"模型没有定义清楚威胁，就没法谈防御"**。

### 2.1 三个维度的攻击分类

学界把对抗攻击按三个维度划分，这是这篇综述的"骨架"之一：

#### 维度①：攻击目标 — — 是想让模型"乱判"还是"专门错判某类"？

- **无目标攻击（Untargeted）**：只要模型分类错就行，不挑剔错成什么。比如让 NIDS 把恶意流量误判成"正常"——具体是 HTTP 还是 SSH 不重要。
- **有目标攻击（Targeted）**：攻击者要求模型把恶意流量精准误判成某个特定类别（比如冒充"在线视频会议"以躲避深度检查）。难度更高，但破坏更可控。

#### 维度②：攻击者知识 — — 他知道你的模型多少？

这是最能拉开"理论攻击"和"现实威胁"差距的维度⁽¹⁾。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240" style="background:#F8F9FA;font-family:'Helvetica Neue',Arial,sans-serif">
  <text x="400" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#1E3A5F">攻击者知识谱系：从全知到只能"敲门"</text>


  <!-- 白盒 -->
  <rect x="50" y="60" width="200" height="140" rx="10" fill="#FBE7E7" stroke="#D64545" stroke-width="2"/>
  <text x="150" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#D64545">白盒攻击 (White-box)</text>
  <text x="150" y="115" text-anchor="middle" font-size="11" fill="#444">✓ 模型架构</text>
  <text x="150" y="135" text-anchor="middle" font-size="11" fill="#444">✓ 训练参数</text>
  <text x="150" y="155" text-anchor="middle" font-size="11" fill="#444">✓ 训练数据分布</text>
  <text x="150" y="180" text-anchor="middle" font-size="10" fill="#888" font-style="italic">攻击最强 / 现实性最低</text>

  <!-- 灰盒 -->
  <rect x="290" y="60" width="200" height="140" rx="10" fill="#FFF4E6" stroke="#F4A261" stroke-width="2"/>
  <text x="390" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#A8530B">灰盒攻击 (Grey-box)</text>
  <text x="390" y="115" text-anchor="middle" font-size="11" fill="#444">✓ 模型架构（已知开源）</text>
  <text x="390" y="135" text-anchor="middle" font-size="11" fill="#444">✗ 训练参数（未泄露）</text>
  <text x="390" y="155" text-anchor="middle" font-size="11" fill="#444">~ 部分训练数据</text>
  <text x="390" y="180" text-anchor="middle" font-size="10" fill="#888" font-style="italic">迁移攻击的常见前提</text>

  <!-- 黑盒 -->
  <rect x="530" y="60" width="220" height="140" rx="10" fill="#E8F5EE" stroke="#2E8B57" stroke-width="2"/>
  <text x="640" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#2E8B57">黑盒攻击 (Black-box)</text>
  <text x="640" y="115" text-anchor="middle" font-size="11" fill="#444">✗ 一切内部信息</text>
  <text x="640" y="135" text-anchor="middle" font-size="11" fill="#444">✓ 只能查询（输入→输出）</text>
  <text x="640" y="155" text-anchor="middle" font-size="11" fill="#444">~ 通过反复试探推断</text>
  <text x="640" y="180" text-anchor="middle" font-size="10" fill="#888" font-style="italic">最现实的部署威胁</text>

  <!-- 底部箭头 -->
  <line x1="80" y1="220" x2="720" y2="220" stroke="#999" stroke-width="2" marker-end="url(#arr2)"/>
  <text x="80" y="235" font-size="10" fill="#666">攻击者知识 (强)</text>
  <text x="640" y="235" font-size="10" fill="#666">攻击者知识 (弱) / 现实性 (高)</text>

  <defs>
    <marker id="arr2" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <polygon points="0 0, 10 5, 0 10" fill="#999"/>
    </marker>
  </defs>
</svg>

> 💡 **反问 #2：如果攻击者只能"查询"系统，怎么可能成功？**
>
> 这是黑盒攻击最反直觉的地方——明明什么都不知道，怎么能精准生成对抗样本？
>
> 答案有三条：
>
> 1. **梯度估计**：攻击者通过有限差分法（finite difference）在每个输入维度上微调一下，观察输出变化，就能估计出梯度方向。这就是 **ZOO 攻击**和**NES 攻击**的思路。
> 2. **决策边界探索**：即使只能看到最终类别（连置信度都看不到），**Boundary Attack** 仍能从一个明显错误的样本出发，沿着决策边界一步步"切入"，逼近原始样本。
> 3. **迁移性（Transferability）**：攻击者用一个本地的"替身模型"生成对抗样本，然后直接拿去攻击目标——大量实验表明，对抗样本在不同架构间有惊人的迁移率。
>
> 在 NIDS 场景下，黑盒攻击恰恰是**最现实的威胁**：部署到生产环境的模型不会公开权重，攻击者只能像用户一样发请求看响应⁽¹⁾。

#### 维度③：扰动约束 — — 给攻击者"多大的活动空间"？

这里涉及到数学里的**Lp 范数**（L-norm），不需要被术语吓住，本质就是"如何衡量扰动的大小"：

| 范数               | 直观含义                     | 适用场景                              |
| --- | --- | --- |
| **L∞**（无穷范数） | 每一个特征最多改动 ε         | 限制最严格，每像素/每特征都不能动太多 |
| **L₂**（欧氏范数） | 所有特征改动量平方和开根 ≤ ε | 允许某些特征改多一些，平均起来不大    |
| **L₀**（零范数）   | 改动的特征**数量** ≤ ε       | 比如只改 5 个流量统计字段             |

为什么这个划分重要？因为**不同的物理约束需要不同的范数**。在网络流量场景下，L₀ 攻击最实用——攻击者真的只能修改少数几个可控字段（比如包间隔时间、TTL）。在无线信号场景下，L∞ 更合理，因为整个信号的功率被严格限制⁽²⁾。

### 2.2 为什么"分类越细，防御越简单"？

这是个值得停下来体会的洞察：**威胁建模越具体，防御就越有针对性**。

举个对比例子：

- **粗模型**："攻击者可能在任意位置加任意扰动"——这种威胁模型几乎无法防御，因为定义本身就是 ill-defined。
- **细模型**："攻击者是 NIDS 黑盒、L₀ 约束 ≤ 5 个特征、且必须保留 TCP 流的统计合法性"——这就有明确的防御方向了。

无线领域的研究者花了大量精力在**域特异性约束（domain-specific constraints）**上，比如：

- 网络流量必须满足 TCP/UDP 协议规范
- 调制信号必须符合星座图（constellation）
- CSI（信道状态信息）必须有时序连续性

这些约束反过来缩小了攻击者的操作空间——也是后面所有防御方法的"立足点"。




## 第三章：主动防御 — — 给模型"打疫苗"

防御方法主要分两大流派——**主动防御（Proactive）** 和 **被动防御（Reactive）**。本章先讲主动派。

主动防御的核心哲学是：**与其等到攻击发生再处理，不如在训练阶段就让模型"见过攻击"，从根源上提高免疫力。** 这就像给孩子打疫苗——在他遇到真病毒前，先用减毒病毒训练他的免疫系统。

### 3.1 对抗训练（Adversarial Training）：把"敌人"请进训练集

#### 基本思路

对抗训练的做法令人哑然失笑地简单：**在训练数据里故意混入对抗样本，让模型把它们也学会正确分类**。

数学上，这是一个嵌套的"最小-最大"优化问题（min-max optimization），由 Madry 等人在 2018 年的 ICLR 论文中正式形式化⁽Madry⁾：

$$
\min_{\theta} \mathbb{E}_{(x,y)\sim D} \left[ \max_{\|\delta\|_p \leq \epsilon} L(f_\theta(x+\delta), y) \right]
$$

> 看着公式头大？拆开来念：
>
> - **内层 max**：扮演攻击者角色，找到最有杀伤力的扰动 δ（最大化损失 L）
> - **外层 min**：扮演防御者角色，调整参数 θ 让模型在最坏情况下也能分对

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" style="background:#F8F9FA;font-family:'Helvetica Neue',Arial,sans-serif">
  <text x="400" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#1E3A5F">Min-Max 优化：训练里的"自我博弈"</text>


  <!-- 外层防御者 -->
  <rect x="80" y="60" width="640" height="220" rx="12" fill="#E8F1F8" stroke="#1E3A5F" stroke-width="2.5"/>
  <text x="400" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#1E3A5F">外层最小化：防御者更新模型参数 θ</text>
  <text x="400" y="103" text-anchor="middle" font-size="11" fill="#444" font-style="italic">"在最坏情况下也要能分对"</text>

  <!-- 内层攻击者 -->
  <rect x="160" y="125" width="480" height="135" rx="10" fill="#FBE7E7" stroke="#D64545" stroke-width="2"/>
  <text x="400" y="148" text-anchor="middle" font-size="13" font-weight="bold" fill="#D64545">内层最大化：模拟攻击者寻找最坏扰动 δ</text>
  <text x="400" y="166" text-anchor="middle" font-size="11" fill="#444" font-style="italic">"在 ε 预算内找一个让损失最大的方向"</text>

  <!-- 内部图示：损失曲面 -->
  <path d="M 220 230 Q 280 180, 340 215 T 460 200 T 580 218" stroke="#888" stroke-width="2" fill="none"/>
  <circle cx="290" cy="195" r="5" fill="#D64545"/>
  <text x="290" y="187" text-anchor="middle" font-size="9" fill="#D64545">x'</text>
  <circle cx="220" cy="230" r="4" fill="#2E8B57"/>
  <text x="220" y="248" text-anchor="middle" font-size="9" fill="#2E8B57">x (原)</text>
  <line x1="220" y1="230" x2="290" y2="195" stroke="#D64545" stroke-width="1" stroke-dasharray="3,3" marker-end="url(#arr3)"/>
  <text x="245" y="220" font-size="9" fill="#D64545">δ</text>

  <text x="525" y="225" font-size="10" fill="#666">损失函数曲面</text>

  <!-- 循环箭头 -->
  <text x="400" y="298" text-anchor="middle" font-size="11" fill="#555">⟲ 反复迭代：攻击者找扰动 → 防御者更新参数 → 攻击者再找新扰动……</text>

  <defs>
    <marker id="arr3" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="#D64545"/>
    </marker>
  </defs>
</svg>

#### TIKI-TAKA 案例：6.7% 的胜利

Zhang 等人的 TIKI-TAKA 框架给出了对抗训练在 NIDS 上的经典实战⁽¹⁾：

- **数据集**：CSE-CIC-IDS2018（公开的网络入侵检测基准）
- **方法**：用 FGSM、I-FGSM、MI-FGSM 等多种白盒攻击生成对抗样本，混入训练集
- **结果**：在最严苛的 one-to-one 场景下，攻击成功率从原本的高位降到了 **5.78%**；one-to-all 场景降到 **6.70%**

这意味着，原本 100 次攻击有几十次能蒙混过关的 NIDS，经过对抗训练后只有 6 次左右还能成功——而那 6 次往往是攻击预算给得离谱大、已经偏离物理可行的"理论扰动"。

#### ⚠️ 反直觉点：这不就是"投毒训练"吗？

这是对抗训练最容易被误解的地方。

> 💡 **反问 #3：等等！把"会让模型出错"的样本混进训练集，这不就是数据投毒攻击吗？方向怎么保证正确？**
>
> 这个问题问到了点子上。表面看，对抗训练和**数据投毒（data poisoning）**确实长得像——都是在训练集里塞"奇怪的样本"。但二者有一个**根本区别**：
>
> | 对比项     | 数据投毒攻击             | 对抗训练                 |
> | - | --- | --- |
> | 样本是什么 | 看起来正常的输入         | 加了对抗扰动的输入       |
> | **标签**   | **错误的（攻击者篡改）** | **正确的（保持原标签）** |
> | 目标       | 让模型在干净数据上也学坏 | 让模型在脏数据上也学对   |
> | 类比       | "把砒霜当糖喂给孩子"     | "用减毒病毒接种疫苗"     |
>
> **关键就在于"标签是否正确"**。对抗训练的样本虽然加了扰动，但我们告诉模型："这仍然是恶意流量，请把它分到恶意类别。" 而投毒攻击则是骗模型："这个明明是恶意流量，但我标成正常的，你给我学。"
>
> 数学上，min-max 公式的外层最小化目标里，标签 y 始终是真实标签。所以梯度下降的方向永远是"让模型对正确答案更确信"，而不是"让模型迷失方向"。
>
> 这就是为什么 Goodfellow 早在 2015 年就把对抗训练称为一种**正则化技术**——它通过强迫模型在小邻域内保持预测一致，反而能让决策边界变得更光滑。

#### 那对抗训练就是万灵药了？— — 三个值得警惕的"陷阱"

虽然有效，对抗训练绝非完美。综述里隐含、但很重要的几个限制：

1. **ε 选择困境**：扰动预算太小，训练后模型还是脆弱；太大，clean accuracy（在干净数据上的准确率）会显著掉。在 CIFAR-10 上，把 ε 从 8/255 调到 16/255，常常能让 clean accuracy 从 87% 跌到 75%。

2. **只能防"见过的攻击"**：如果训练时只用 FGSM 生成对抗样本，那对 PGD、CW、AutoAttack 这些更强的攻击，防御效果会打折扣。这就是为什么 TIKI-TAKA 用了**多种攻击**生成训练样本——攻击多样性是关键⁽¹⁾。

3. **域约束的额外负担**：在无线领域，对抗样本必须保持物理可行性。这意味着不能简单地把图像领域的对抗训练代码复制过来——你得告诉优化器："扰动后的信号还得能合法发射"⁽²⁾。

### 3.2 防御蒸馏（Defensive Distillation）：用"温度"软化决策

#### 基本思路

防御蒸馏借用了 Hinton 等人提出的**知识蒸馏（Knowledge Distillation）** 框架。原本知识蒸馏是为了把大模型的"知识"压缩到小模型里——但研究者发现，蒸馏过程中的一个"副产品"正好能用来防御对抗攻击。

具体做法分两步：

1. **训练教师模型**：用一个**高温度参数 T**（比如 T=20）训练神经网络。温度高，softmax 输出的概率分布就更"软"——比如不再是 [0.99, 0.01, 0]，而是 [0.7, 0.2, 0.1]。
2. **训练学生模型**：用教师模型的"软标签"（soft labels）来训练学生模型，而不是原始的 one-hot 硬标签。

#### 它为什么能防御？— — "梯度遮蔽"的正反两面

防御蒸馏的核心机制叫做**梯度遮蔽（Gradient Masking）**：温度软化后，模型的输入梯度被大大缩小（因为 softmax 在高温下接近线性区），攻击者再用 FGSM 这类基于梯度的方法时，找到的"上山方向"几乎是噪声——梯度信号太弱，根本找不准方向。

在下一代无线网络的**信道估计（channel estimation）**任务中，Catak 等人证明防御蒸馏确实能显著提升模型对对抗扰动的鲁棒性⁽⁴⁾。

#### ⚠️ 反直觉点：梯度遮蔽是真防御还是"自欺欺人"？

> 💡 **反问 #4：如果只是把梯度藏起来，那攻击者换个不靠梯度的攻击方法，不就破了吗？**
>
> 完全正确。这正是防御蒸馏被学界"打脸"的核心原因。
>
> Carlini & Wagner 在 2016-2017 年的一系列经典论文中证明，防御蒸馏对**真正强力的白盒攻击（如 CW 攻击）几乎无效**。原因很简单：
>
> 1. **黑盒迁移攻击**：攻击者训练一个**自己的代理模型**，在上面用 FGSM 生成对抗样本，再迁移到被防御的模型上——蒸馏完全帮不上忙。
> 2. **决策边界攻击**：像 Boundary Attack 这类不依赖梯度、只看分类结果的攻击，蒸馏的"温度软化"对它毫无影响。
> 3. **优化目标重写**：CW 攻击通过重新设计损失函数，避开了梯度消失的区域。
>
> 所以现在主流的看法是：**防御蒸馏单独使用不够，但作为"组合拳"的一部分仍有价值**。它至少抬高了攻击者的成本，配合对抗训练、集成方法等使用时能形成纵深防御。

### 3.3 集成方法（Ensemble Methods）：让"敌人"难以同时骗过所有人

#### 基本思路

集成方法的灵感来自一个朴素的观察：**不同架构的模型，会在不同的地方犯错**。如果你训练 10 个模型，让它们投票，攻击者就得同时骗过所有 10 个——难度指数级上升。

这背后有个深刻的理论：**通用对抗扰动（Universal Adversarial Perturbation）虽然存在，但跨架构的通用性有限**。MLP 和 CNN 的内部特征提取方式差异很大，一个能让 MLP 出错的扰动，未必能骗过 CNN。

#### TIKI-TAKA 投票案例

TIKI-TAKA 框架里的集成是这样做的⁽¹⁾：

```
       恶意流量
          ↓
     ┌────┼────┐
     ↓    ↓    ↓
   [MLP] [CNN] [C-LSTM]
     ↓    ↓    ↓
   "恶意" "恶意" "正常"
          ↓
   投票机制：1 票"正常" + 2 票"恶意" → 标记为"异常"
```

任一模型说"异常"，整体就报警。结果是攻击成功率分别下降了 **17.12%**（one-to-all）和 **9.02%**（one-to-one）⁽¹⁾。

更令人印象深刻的是 De Lucia 团队的**分层集成（hierarchical ensemble）**⁽³⁾：

| 指标               | 单模型   | 双层集成               |
| --- | -- | - |
| 准确率（受攻击下） | 47%      | **100%**               |
| 攻击者所需时间     | 336 小时 | **1,008 小时**（3 倍） |

#### ⚠️ 反直觉点：集成不就是"人多力量大"？多花点时间不就破了？

> 💡 **反问 #5：1008 小时和 336 小时，听起来攻击者多花点时间就行了。这个防御真的有意义吗？**
>
> 这是非常实际的质疑。让我们从三个层面来回答：
>
> **第一，时间成本就是经济成本。** 1008 小时 ≈ 42 天。在网络安全领域，攻击窗口往往以小时计——一个 0day 漏洞可能 24 小时内就被打补丁了。把攻击时间从 14 天拉长到 42 天，往往就让整次攻击的"性价比"破产。这正是"攻击面经济学（Attack Surface Economics）"的核心思想。
>
> **第二，集成是非可微的。** 这是 TIKI-TAKA 论文里的一个关键洞察——投票机制的输出不是连续的概率，而是离散的多数决。这意味着**梯度根本没法定义**——基于梯度的攻击（FGSM、PGD）从原理上就失效了。攻击者要么去攻击单个模型（再迁移），要么用零阶优化方法（速度慢得多）。
>
> **第三，多样性是关键。** 集成不是"把同一个模型复制 10 次"——那是无效的。集成要求模型架构多样、训练数据多样、甚至损失函数多样。MLP + CNN + C-LSTM 各自捕捉的特征模式完全不同，对抗样本难以在三者间通用迁移。
>
> 但要诚实地说：集成确实**不是免费午餐**。推理时延是单模型的 N 倍，对资源受限的 IoT 设备是个负担。所以学界还在研究**蒸馏后的紧凑集成**——用一个学生模型模仿整个集成的输出。

### 3.4 鲁棒优化（Robust Optimization）：把"最坏情况"写进训练目标

如果说对抗训练是"实证派"——靠经验生成对抗样本来训练，那么**鲁棒优化**就是"理论派"——它要求训练出来的模型**在数学上可证明**对某个扰动半径内的所有攻击都鲁棒。

这是一个更强的承诺。但代价是——计算复杂度急剧上升，目前的鲁棒优化方法只能应用于**相对小的网络**和**较低维度的输入**⁽⁹⁾。

#### AdvO-RAN：把鲁棒优化带到 5G/6G

综述里的明星案例是 **AdvO-RAN 框架**⁽¹⁰⁾。它的目标是保护 O-RAN（开放无线接入网）里基于深度强化学习（DRL）的智能控制器（xApp）——这些 xApp 负责无线资源调度、切片管理等关键功能。

AdvO-RAN 的关键创新是把**对抗训练扩展到了强化学习领域**：

1. 用基于偏好的强化学习（**PbRL, Preference-based RL**）训练一个"对抗策略"，专门学习如何扰动 xApp 的状态观测以最大化 SLA 违规
2. 反过来用这个对抗策略训练 DRL 智能体，让它在最坏扰动下仍能维持服务质量

实验数据相当惊艳⁽¹⁰⁾：

| 指标                    | 攻击下（无防御） | AdvO-RAN 防御后 |
| --- | --- |--- |
| URLLC 服务的 SLA 违规率 | 44%              | **27%**         |
| 端到端延迟              | 基准             | **降低 46%**    |




## 第四章：被动防御 — — AI 的"自我审查"

主动防御是"打疫苗"，被动防御则是"安检门"——它假设对抗样本一定会出现，关键在于**推理阶段实时检测和过滤**。

被动防御的最大优势是**部署灵活**——不需要重新训练已有模型，可以作为独立模块插在任何系统前。但代价是有运行时开销，且检测器本身也可能被攻击。

### 4.1 对抗检测（Adversarial Detection）：看出"伪装者"的破绽

#### MANDA：在隐空间里抓"异类"

**MANDA**（Model-Agnostic adversarial example Detection via latent space Analysis）的洞察非常优雅⁽¹⁵⁾：

> **对抗样本虽然在输入空间看起来正常，但在神经网络的"隐空间"（latent space，也就是中间层特征）里却往往落在"人迹罕至"的区域。**

打个比方：正常样本就像住在城市里的居民，分布在常见的街区；对抗样本看起来也是普通人，但他们的"行为轨迹"（隐空间表征）却落在了荒郊野外——MANDA 就像一个统计学版的侦探，监控这些轨迹，发现谁不在正常分布里就报警。

它的另一个优势是**模型无关（model-agnostic）**——不需要修改原模型，也不需要访问梯度，可以作为独立模块部署。这对**第三方提供 NIDS 服务**的场景特别友好⁽¹⁵⁾。

#### TIKI-TAKA 的查询检测：抓住"反复试探"的尾巴

针对黑盒攻击的检测，TIKI-TAKA 用了一个巧妙的角度⁽¹⁾：

> **黑盒攻击者必须反复查询模型来推断梯度——而这些连续查询彼此之间高度相似。**

这就好像是有人在 ATM 机前反复试同一张卡的不同密码，行为本身就是异常的。

具体做法：

1. 用一个**深度相似性编码器（Deep Similarity Encoder, DSE）**把每条流量映射到低维嵌入空间
2. 监控同一来源 IP 的连续流量在嵌入空间的距离
3. 距离过近（说明在反复试探） → 标记并拉黑

复杂度仅 **O(1)**——意味着每条流量的处理时间是常数级，和缓冲区大小无关，足以部署在高吞吐网络环境⁽¹⁾。

### 4.2 输入重建（Input Reconstruction）：把"扰动"洗掉

#### 自编码器的"净化"作用

输入重建的核心思想：**对抗扰动是脆弱的，把输入压缩-解压一遍，扰动就被洗掉了，但正常信号的主要内容能被保留。**

具体怎么做？训练一个**自编码器（Autoencoder）**——它先把输入压缩成低维向量（编码），再解压回原始空间（解码）。重建过程会丢失高频细节——而对抗扰动恰恰大多藏在这些高频细节里。

在自动调制识别（AMR）任务中⁽⁵⁾，研究者训练自编码器学习"合法调制信号的流形"。一个对抗样本被送进来时：

- **重建后的版本**：自编码器只能输出"它认得的"合法信号 → 对抗扰动被滤掉
- **重建误差**：原信号和重建信号的差异大 → 这是个对抗样本的有力证据

#### 特征压缩（Feature Squeezing）

另一类相关方法叫**特征压缩**，思路简单到令人发笑：**降低输入精度**，对抗扰动就被舍入掉了。

比如：

- 图像领域：把 8 位色深降到 4 位
- 网络流量：把"包间隔时间"从纳秒精度降到毫秒精度
- 信号处理：对采样进行量化

道理很直白——攻击者精心算出来的"加 0.0034 秒"扰动，在毫秒精度下直接归零。

> 💡 **反问 #6：把输入精度降低，正常分类不也会受影响吗？**
>
> 是的，trade-off 确实存在，但**通常对正常分类影响很小，对对抗扰动的影响很大**。原因在于：
>
> - 正常样本的判别信息**鲁棒地分布在多个特征上**——损失某些细节不影响整体判断
> - 对抗扰动**精确地集中在某些特定方向**——一旦量化精度低于扰动幅度，扰动就消失了
>
> 但这不是没有边界的。如果压缩太狠，正常分类也会塌方。所以参数选择是关键——通常通过验证集上的 grid search 来找最佳压缩级别。
>
> 还有一个微妙问题：**适应性攻击（adaptive attack）**。如果攻击者知道你用了特征压缩，他可以在生成对抗样本时**就考虑到这个压缩操作**，确保扰动在压缩后仍有效。这就是 Carlini & Wagner 著名的"Obfuscated Gradients"批判——很多基于输入变换的防御在适应性攻击面前都失效了。

#### 两阶段协同：重建 + 检测

最优雅的做法是把重建和检测**串联起来**：

```
原始输入
   ↓
[自编码器重建]  ← 第一道关：洗掉简单扰动
   ↓
[计算重建误差]
   ↓
误差大 → 标记可疑 → [对抗检测器] ← 第二道关：识别复杂攻击
误差小 → 直接传递给主模型
```

这样重建器先过滤掉"低水平攻击"，把检测器的资源留给真正复杂的对抗样本。

### 4.3 移动目标防御（MTD）：让攻击者"找不到靶子"

#### 一个反直觉的哲学转换

传统防御都在做**加固**——把墙建得更高、把锁换得更牢。**移动目标防御（Moving Target Defense, MTD）**走了一条完全不同的路：

> **不要试图建一个攻不破的城墙——而是让城墙不停地移动，让攻击者根本找不到它在哪里。**

这听起来很疯狂，但在网络安全领域早已是成熟思路（IP 地址轮换、端口随机化都是 MTD 的早期形态）。He 等人的 **MTD-AD 框架** 把它系统地引入了对抗防御⁽⁹⁾。

#### MTD-AD 的三种"移动"

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 320" style="background:#F8F9FA;font-family:'Helvetica Neue',Arial,sans-serif">
  <text x="400" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#1E3A5F">MTD-AD：让攻击者每次面对的都是不同的"靶子"</text>


  <!-- 时间轴 -->
  <line x1="60" y1="280" x2="740" y2="280" stroke="#1E3A5F" stroke-width="2" marker-end="url(#arr4)"/>
  <text x="400" y="305" text-anchor="middle" font-size="11" fill="#666">时间</text>

  <!-- T1 -->
  <text x="150" y="60" text-anchor="middle" font-size="11" fill="#666" font-weight="bold">T₁</text>
  <rect x="105" y="75" width="90" height="50" rx="6" fill="#E8F1F8" stroke="#1E3A5F"/>
  <text x="150" y="95" text-anchor="middle" font-size="11" fill="#1E3A5F" font-weight="bold">模型 A</text>
  <text x="150" y="115" text-anchor="middle" font-size="9" fill="#666">CNN</text>
  <rect x="105" y="135" width="90" height="40" rx="6" fill="#FFF4E6" stroke="#F4A261"/>
  <text x="150" y="155" text-anchor="middle" font-size="10" fill="#A8530B">预处理 P₁</text>
  <text x="150" y="168" text-anchor="middle" font-size="9" fill="#666">归一化+量化</text>
  <rect x="105" y="185" width="90" height="40" rx="6" fill="#E8F5EE" stroke="#2E8B57"/>
  <text x="150" y="205" text-anchor="middle" font-size="10" fill="#2E8B57">特征集 F₁</text>
  <text x="150" y="218" text-anchor="middle" font-size="9" fill="#666">15 维</text>
  <line x1="150" y1="235" x2="150" y2="275" stroke="#1E3A5F" stroke-width="1.5"/>

  <!-- T2 -->
  <text x="320" y="60" text-anchor="middle" font-size="11" fill="#666" font-weight="bold">T₂</text>
  <rect x="275" y="75" width="90" height="50" rx="6" fill="#E8F1F8" stroke="#1E3A5F"/>
  <text x="320" y="95" text-anchor="middle" font-size="11" fill="#1E3A5F" font-weight="bold">模型 B</text>
  <text x="320" y="115" text-anchor="middle" font-size="9" fill="#666">MLP</text>
  <rect x="275" y="135" width="90" height="40" rx="6" fill="#FFF4E6" stroke="#F4A261"/>
  <text x="320" y="155" text-anchor="middle" font-size="10" fill="#A8530B">预处理 P₂</text>
  <text x="320" y="168" text-anchor="middle" font-size="9" fill="#666">PCA 降维</text>
  <rect x="275" y="185" width="90" height="40" rx="6" fill="#E8F5EE" stroke="#2E8B57"/>
  <text x="320" y="205" text-anchor="middle" font-size="10" fill="#2E8B57">特征集 F₂</text>
  <text x="320" y="218" text-anchor="middle" font-size="9" fill="#666">10 维</text>
  <line x1="320" y1="235" x2="320" y2="275" stroke="#1E3A5F" stroke-width="1.5"/>

  <!-- T3 -->
  <text x="490" y="60" text-anchor="middle" font-size="11" fill="#666" font-weight="bold">T₃</text>
  <rect x="445" y="75" width="90" height="50" rx="6" fill="#E8F1F8" stroke="#1E3A5F"/>
  <text x="490" y="95" text-anchor="middle" font-size="11" fill="#1E3A5F" font-weight="bold">模型 C</text>
  <text x="490" y="115" text-anchor="middle" font-size="9" fill="#666">LSTM</text>
  <rect x="445" y="135" width="90" height="40" rx="6" fill="#FFF4E6" stroke="#F4A261"/>
  <text x="490" y="155" text-anchor="middle" font-size="10" fill="#A8530B">预处理 P₃</text>
  <text x="490" y="168" text-anchor="middle" font-size="9" fill="#666">小波变换</text>
  <rect x="445" y="185" width="90" height="40" rx="6" fill="#E8F5EE" stroke="#2E8B57"/>
  <text x="490" y="205" text-anchor="middle" font-size="10" fill="#2E8B57">特征集 F₃</text>
  <text x="490" y="218" text-anchor="middle" font-size="9" fill="#666">20 维</text>
  <line x1="490" y1="235" x2="490" y2="275" stroke="#1E3A5F" stroke-width="1.5"/>

  <!-- T4 ... -->
  <text x="660" y="60" text-anchor="middle" font-size="11" fill="#666" font-weight="bold">T₄ …</text>
  <rect x="615" y="75" width="90" height="50" rx="6" fill="#E8F1F8" stroke="#1E3A5F" stroke-dasharray="4,2"/>
  <text x="660" y="105" text-anchor="middle" font-size="11" fill="#1E3A5F">下一组</text>
  <rect x="615" y="135" width="90" height="40" rx="6" fill="#FFF4E6" stroke="#F4A261" stroke-dasharray="4,2"/>
  <text x="660" y="160" text-anchor="middle" font-size="10" fill="#A8530B">随机选择</text>
  <rect x="615" y="185" width="90" height="40" rx="6" fill="#E8F5EE" stroke="#2E8B57" stroke-dasharray="4,2"/>
  <text x="660" y="210" text-anchor="middle" font-size="10" fill="#2E8B57">动态切换</text>
  <line x1="660" y1="235" x2="660" y2="275" stroke="#1E3A5F" stroke-width="1.5" stroke-dasharray="4,2"/>

  <!-- 攻击者的扰动 -->
  <text x="150" y="262" text-anchor="middle" font-size="9" fill="#D64545" font-weight="bold">扰动 δ 对 A 有效 ✗</text>
  <text x="320" y="262" text-anchor="middle" font-size="9" fill="#D64545">对 B 失效 ✓</text>
  <text x="490" y="262" text-anchor="middle" font-size="9" fill="#D64545">对 C 失效 ✓</text>

  <defs>
    <marker id="arr4" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <polygon points="0 0, 10 5, 0 10" fill="#1E3A5F"/>
    </marker>
  </defs>
</svg>

MTD-AD 同时调度三类"移动"⁽⁹⁾：

1. **随机模型选择**：每次推理时从一组多样化模型中**随机抽**一个来用
2. **随机预处理**：把输入先做随机变换（不同的归一化、量化、滤波组合）
3. **动态特征子集**：每次只用全部特征的一个**随机子集**

#### ⚠️ 反直觉点：模型自己不会糊涂吗？

> 💡 **反问 #7：每次都换不同的模型和特征，难道模型自己不会糊涂？正常用户的体验不会受影响吗？**
>
> 这个问题问得很好。MTD 的精髓恰恰在于：**所有候选配置在干净数据上的性能都是合格的**——它们是**等效正确的**多个版本，而不是质量参差不齐的混合体。
>
> 类比：你公司大门有 5 把保险柜钥匙，每天随机用一把。对正常员工来说，5 把钥匙都能开门，体验完全一样；但对小偷来说，他偷到的某把钥匙的复制品，今天可能就用不上了。
>
> 不过，MTD 确实有它的成本：
>
> - **维护多个模型**：训练、存储、版本管理都要 N 倍
> - **配置切换的协调**：分布式系统中要保证所有节点同步使用同一配置
> - **可能的性能波动**：不同配置在不同输入分布上的表现可能略有差异
>
> 学界还在研究**博弈论指导的 MTD**——根据观察到的攻击模式动态调整切换频率和多样性，让防御者和攻击者的纳什均衡偏向防御方。

#### 终极武器：MTD + 集成

MTD 和集成方法可以**叠加使用**形成纵深防御。集成提供"正面对抗"的鲁棒性，MTD 提供"配置不可预测"的混乱，攻击者既要对付多个模型的投票，又不知道现在用的是哪一组——攻击成本指数级上升。




## 第五章：无线领域的特殊战场

到此为止，我们讨论的方法在计算机视觉、自然语言处理等领域也都通用。但**无线网络**有其独特的物理约束、时序结构和延迟要求。前面 60% 的内容是"普适知识"，本章则是这篇综述的"差异化价值"——不同无线场景下的专门防御方法。

### 5.1 Wi-Fi 感知：当家里的无线信号成了"窃听者"

#### 什么是 Wi-Fi 感知？

你或许没听过这个名字，但它已经在你身边。Wi-Fi 感知（Wi-Fi Sensing）利用现有 Wi-Fi 信号在空间中的传播规律——更精确地说，是**信道状态信息（CSI, Channel State Information）**——来检测人类活动：

- 谁在房间里？（占用检测）
- 是站着、坐着还是在走？（活动识别）
- 是在挥手还是在打字？（手势识别）

这些应用都依赖深度学习模型从 CSI 中提取活动特征。但攻击者也有了新的攻击面：**通过发射干扰信号或操纵 CSI 数据**，可以让模型把"翻墙的盗贼"识别成"家里的猫"。

#### ResGAN：用残差网络的"差异感"识别异常

Goswami 等人提出的 **ResGAN**⁽⁶⁾ 框架专门针对 Wi-Fi 感知场景，设计思路把多种技术揉到了一起：

- **生成对抗网络（GAN）骨架**：生成器学习重建合法 CSI，鉴别器判断真伪
- **残差结构**：原始 CSI 与重建 CSI 的差值作为关键特征
- **大残差 = 可疑样本**：自然 CSI 数据被重建得很好（残差小），对抗扰动后的 CSI 由于偏离了"正常 CSI 流形"，重建残差大⁽⁶⁾

#### 手势识别的额外挑战：时序一致性

手势识别比简单的活动识别更难——它要分辨"挥手 vs 抓握"这种细粒度差异。Yin 等人 2025 年发表的工作⁽¹³⁾ 指出，攻击者可以利用**时序相关性**生成"看起来连贯"的对抗扰动——这种扰动用简单的统计检测很难抓到。

对策包括：

- **时序一致性检查**：验证连续 CSI 帧之间的平滑度
- **多模态融合**：结合雷达、声学传感器交叉验证
- **运动学约束的对抗训练**：训练时只生成"人体物理可行的"扰动

### 5.2 O-RAN 安全：5G/6G 智能控制器的"暗战"

#### 为什么 O-RAN 是新战场？

**O-RAN（Open Radio Access Network）** 是 5G 之后无线接入网架构的重大变革。它把传统的"专有黑盒"基站打开了——开放接口、可插拔的智能控制器（**xApp / rApp**），任何第三方都可以开发部署。

但开放就意味着新的攻击面。攻击者可以：

- **从 xApp 市场获取目标 xApp 的副本**（合法获取！）
- **在本地训练对抗扰动策略**
- **发布"中毒版" xApp** 让运营商部署
- 或者**通过 KPM（关键性能测量）开放接口**实时投递扰动

#### AdvO-RAN 的全栈防御

我们在第三章已经介绍了 **AdvO-RAN** 的鲁棒训练机制⁽¹⁰⁾。这里值得再展开一下它的完整威胁模型——这是 2025 年 ACM MobiHoc 会议上的开创性工作：

```
[攻击阶段]                                [防御阶段]
1. 从市场获取 xApp                ←      🛡️ 模型水印 / 完整性校验
2. 学习对抗策略 (PbRL)             ←      🛡️ 异常 KPM 流量检测
3. 投放中毒 xApp                  ←      🛡️ 鲁棒训练 (本节核心)
4. 实时扰动 KPM 输入               ←      🛡️ 联邦学习辅助
```

效果再次罗列：URLLC 服务的 SLA 违规率从 **44%** 降到 **27%**，端到端延迟降低 **46%**⁽¹⁰⁾。这些数字背后是真实的工业意义——SLA 违规对运营商意味着合同罚款，URLLC 是 5G 三大场景里最严苛的（典型要求 1ms 延迟、99.999% 可靠性）。

> 💡 **延伸阅读**：Intel Labs 在 2024 年发表了一篇关于 O-RAN 中**图强化学习连接管理**的对抗鲁棒性研究，结合了对抗训练和扩散模型预处理⁽extra⁾。这显示 O-RAN 安全已成为产业级研究热点。

### 5.3 自动调制识别（AMR）：守护频谱的"耳朵"

#### AMR 是什么？

**自动调制识别（Automatic Modulation Recognition, AMR）** 是认知无线电的核心模块。它的任务是：**只听信号，不依赖任何先验信息，就能判断出对方使用了什么调制方式**——是 BPSK？QPSK？16-QAM？还是 OFDM？

这个能力对于动态频谱接入、电子对抗、合法监管都至关重要。深度学习让 AMR 准确率在低信噪比下大幅提升，但也带来了对抗攻击的新可能：

> 攻击者可以让自己的 64-QAM 信号"看起来像" QPSK——逃避频谱监管时把高速通信伪装成低速通信，从而绕过合规审查。

#### 防御组合拳

综述中提到 AMR 防御主要走"集成 + 物理约束"路线：

| 方法             | 核心思路                                               | 来源                |
| - |  | - |
| **ViT 鲁棒框架** | 用 Vision Transformer 取代 CNN，结合物理约束的对抗训练 | Li et al. 2025⁽¹²⁾  |
| **重建防御**     | Autoencoder 重建合法信号流形，残差作为对抗指标         | Hong et al. 2026⁽⁵⁾ |
| **集成对抗训练** | 多种架构投票 + 多种攻击混合训练                        | 综合多论文          |

物理约束的引入是关键创新——AMR 中的对抗扰动必须满足**功率限制、带宽约束、调制规则**。比如不能让信号的瞬时功率超过 PA（功率放大器）的线性区，否则信号被失真，攻击实际不成立。

### 5.4 网络入侵检测（NIDS）：经典战场，最老也最新

NIDS 是对抗机器学习研究最早登陆的无线安全应用之一。我们已经在前面多次提到 **TIKI-TAKA** 框架⁽¹⁾——它是这个领域至今的标杆性工作。

综述里特别强调的还有 **FLARE 框架**⁽¹⁷⁾——它处理的是一个更新颖的问题：**联邦学习场景下的 NIDS 投毒防御**。这个我们留到第六章详细讲。

### 5.5 跨场景对照表

下面这张表浓缩了第五章的核心结论——不同无线场景的特殊挑战和对应防御方案：

| 场景           | 核心挑战                           | 代表防御                        | 关键性能指标                    |
| -- | - | - | - |
| **Wi-Fi 感知** | CSI 时序结构易被精细操纵           | ResGAN 残差检测⁽⁶⁾ + 多模态融合 | 高检测率，低延迟                |
| **O-RAN**      | DRL xApp 的状态观测被扰动          | AdvO-RAN PbRL 鲁棒训练⁽¹⁰⁾      | SLA 违规 44%→27%                |
| **AMR**        | 物理层信号的合法性约束             | ViT + 物理约束 AT⁽¹²⁾ + 重建⁽⁵⁾ | 多调制方案下保持准确率          |
| **NIDS**       | 流量统计可被微调，黑盒查询攻击普遍 | TIKI-TAKA 全栈⁽¹⁾ + 分层集成⁽³⁾ | 攻击成功率 ~6%，准确率回到 100% |

这张表也回答了一个隐含的问题：**为什么不能用一个"万能防御"覆盖所有场景？** 因为每个无线域的数据模态、物理约束、实时要求都不一样——通用方案在迁移到特定场景时往往失效。综述的核心论点之一就是：**域特异性适配（domain-specific adaptation）是不可回避的设计原则**。




## 第六章：未来已来 — — LLM、联邦学习与对比学习

如果说前面几章是"现在时"，那这一章是"将来时"——综述里指出的几个**最有前景的研究方向**。这些方向不只是学术热点，也对应着 2025-2026 年最新的工业部署趋势。

### 6.1 大语言模型（LLM）：从 ChatGPT 到网络守护者

#### LLM 的双重身份

**LLM 既是新的防御工具，也是新的攻击靶标。** 这种"双面性"在 Liu 等人 2025 年的综述里有详细梳理⁽¹⁴⁾。

**作为防御者：**

- **威胁情报分析**：把海量日志、CVE 描述、社区帖子喂给 LLM，让它生成结构化的威胁报告
- **合成对抗样本**：用 LLM 生成多样化、自然的对抗样本，丰富对抗训练的数据
- **自动化响应**：当检测到异常时，让 LLM 起草事件响应剧本，甚至自动调用 API 处置

**作为靶标：**

- **提示注入（Prompt Injection）**：攻击者把恶意指令藏在用户输入里，让 LLM 违规输出
- **数据投毒**：在 LLM 微调时投放有偏样本
- **模型抽取**：通过查询接口反向推断 LLM 的能力边界

#### 最新综述的发现

2025 年 9 月发表的一篇 PRISMA-compliant 系统综述分析了 2021-2025 年间 **185 篇 GAN-based 对抗防御研究**——发现 GAN 既可以是攻击放大器，也可以构建强大的防御⁽survey25⁾。这种"模型扮演双面角色"的现象在 LLM 时代会愈演愈烈。

而在无线网络的边缘场景下，LLM 的部署还面临**算力问题**——一个 70B 参数的模型显然不可能跑在 IoT 设备上。研究方向因此也分化为：

- **模型压缩**：量化、剪枝、蒸馏到几亿参数级别
- **边缘卸载**：把 LLM 推理放到云端，边缘只做预处理和后处理
- **专用硬件加速**：NPU、TPU 等专门优化 LLM 推理

### 6.2 联邦学习的攻防：当数据不出门也能被"投毒"

#### 联邦学习的承诺与威胁

**联邦学习（Federated Learning, FL）** 是过去几年最受关注的隐私保护学习范式。它的核心承诺是：**多个客户端协同训练一个全局模型，但原始数据从不离开本地。** 中央服务器只看模型更新（梯度或权重），不看数据本身。

这听起来似乎天然防"投毒"——既然攻击者拿不到数据，怎么投毒？

#### ⚠️ 反直觉点：不共享数据为什么还能被投毒？

> 💡 **反问 #8：联邦学习既然不共享原始数据，怎么还能被攻击者投毒？**
>
> 这是非常常见的误解。让我们澄清两种"投毒"的本质区别：
>
> | 攻击类型                        | 攻击什么                                | 联邦学习是否易受                             |
> | - | -- | -- |
> | **数据投毒（Data Poisoning）**  | 篡改训练数据                            | ✓ 部分受影响（攻击者可控制自己客户端的数据） |
> | **模型投毒（Model Poisoning）** | 直接篡改上传的**模型更新**（梯度/权重） | ✗✗ **致命弱点**                              |
>
> 关键在于：**联邦学习虽然不共享数据，但要共享模型更新**。一个恶意客户端可以：
>
> 1. 在本地随便用什么数据（甚至不用数据），编造一个对自己有利的"梯度"
> 2. 把这个梯度上传给服务器
> 3. 服务器把所有客户端的梯度聚合（比如取平均）—— 一颗老鼠屎污染了一锅汤
>
> 更狡猾的是**适应性后门攻击**：攻击者上传的梯度看起来"很正常"（统计特征跟其他客户端类似），但巧妙地植入一个后门——只有特定输入触发时模型才会出错。
>
> 这就是为什么联邦学习需要**专门的防御机制**——光靠"数据不出门"远远不够。

#### FLARE：在隐空间里抓"内鬼"

Wang 等人提出的 **FLARE 框架**⁽¹⁷⁾ 给出了一个优雅的解决方案：**用隐空间表示来识别可疑的模型更新**。

具体思路：

1. 服务器收到所有客户端的模型更新后，计算每个更新对应模型的**隐空间表示**（在一些公共测试样本上的中间层激活）
2. 比较这些表示在统计上的分布——大多数客户端的表示应该聚成一团
3. 偏离这一团的更新被标记为可疑，要么排除、要么下权处理

FLARE 的优势是它**不需要看任何客户端的原始数据**——只看模型更新的"行为指纹"——完美保留了联邦学习的隐私承诺⁽¹⁷⁾。

#### 拜占庭容错聚合

另一类经典防御是**拜占庭容错聚合规则**——经典的有：

- **Trimmed Mean**（截尾均值）：去掉每维度上最大/最小的若干个值，再求平均。能抵御部分"极端值"型攻击。
- **Coordinate-wise Median**（坐标中位数）：对每个参数维度取中位数。比均值更鲁棒。
- **Krum**：选出与其他更新"最相似"的那个更新（加权重），完全抛弃异常的。

这些算法的设计假设是：**少数恶意客户端，多数诚实客户端**。当恶意比例超过一定阈值（通常 30-40%），所有这些方法都会失效。

### 6.3 对比学习：标签稀缺时的"数据效率"利器

#### 为什么需要对比学习？

在 IoT 网络中，**标注的攻击数据极度稀缺**——攻击事件本来就少，事后人工标注又费时费力。传统监督学习在这种场景下表现糟糕。

**对比学习（Contrastive Learning）** 提供了一条优雅的出路：**不需要标签也能学到好的特征表示**。

它的核心思想是设计一个"区分任务"：把同一段流量做不同的数据增强，得到两个视角；让模型学习"这两个视角应该相似"，而和别的流量样本应该不同。

```
原始流量 X
   ↓ 增强 1               ↓ 增强 2               ↓ 增强 1
[X^aug_1]              [X^aug_2]              [Y^aug_1]
        ↘             ↙                            ↓
       特征空间应该靠近                      特征空间应该远离
                                                  ↓
                                            (Y 是不同的流量)
```

#### FeCo：IoT 入侵检测的"自监督革命"

Wang 等人的 **FeCo 框架**⁽¹⁶⁾ 把对比学习应用到 IoT 入侵检测：

1. **预训练阶段**：用大量未标注的流量做对比学习，学到一个判别力很强的编码器
2. **微调阶段**：用少量标注样本在这个编码器上训练一个轻量分类头

实验表明，在标注样本只有传统方法的 10% 时，FeCo 仍能达到接近最优的检测精度⁽¹⁶⁾。这对于现实部署场景太关键了——**没有人会为每个 IoT 设备维护数千个标注样本**。

#### 对比学习 + 对抗训练：双重加成

最新的研究方向是把**对比学习**和**对抗训练**结合：

- 对比学习负责让特征空间结构化、判别性强
- 对抗训练负责让特征空间在扰动下保持稳定

二者结合后，模型同时具备**高干净精度**和**高鲁棒精度**——这恰好弥补了传统对抗训练的一个老问题（鲁棒精度上去了，干净精度往往掉一点）。

### 6.4 可证明鲁棒性（Certifiable Robustness）：从"实证"到"证明"

到目前为止，我们提到的所有防御都是**实证（empirical）**的——你只能在有限的攻击集上验证有效，没法承诺对**所有可能的攻击**都有效。但工业部署，尤其是安全关键应用（比如自动驾驶、医疗、金融），需要更强的承诺。

**可证明鲁棒性**就是要解决这个问题——**用数学证明：在某个扰动半径内，模型的输出绝对不变。**

#### 随机平滑（Randomized Smoothing）

目前最实用的可证明方法是 **Randomized Smoothing**⁽smoothing⁾：

1. 给输入注入高斯噪声（比如 σ=0.5）
2. 用同一个分类器对很多个噪声版本做预测
3. 取多数投票作为最终预测
4. **数学上可证明**：在 L₂ 半径 R 内，这个"平滑后的分类器"的预测一定不变（R 与 σ 和投票余量有关）

它的优雅之处在于不需要修改原模型——**只需要在推理时加噪声并多次采样**。

#### 在无线领域的挑战

可证明鲁棒性的代价是计算昂贵——每次预测要采样几百到几千次。这在自动驾驶、URLLC 这类延迟敏感场景下基本不可行。学界目前的研究方向：

- **轻量化平滑**：减少采样次数同时保持证书有效
- **联邦版本**：在分布式训练中也能给出鲁棒性证书⁽fedsmoothing⁾
- **结构化噪声**：根据输入特性自适应调整噪声分布（如 Anisotropic Randomized Smoothing）




## 第七章：结语 — — 鸿沟与希望

### 7.1 一个全景图：所有方法的关系

写到这里，可以把整篇综述的方法体系凝练成一张图：

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 480" style="background:#F8F9FA;font-family:'Helvetica Neue',Arial,sans-serif">
  <text x="410" y="28" text-anchor="middle" font-size="17" font-weight="bold" fill="#1E3A5F">无线网络对抗防御方法全景</text>


  <!-- 顶部框 -->
  <rect x="280" y="50" width="260" height="55" rx="10" fill="#1E3A5F"/>
  <text x="410" y="76" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">对抗机器学习防御 (AML)</text>
  <text x="410" y="94" text-anchor="middle" font-size="11" fill="#cce">核心：让 AI 在恶意输入下仍可靠</text>

  <!-- 两大流派 -->
  <line x1="350" y1="105" x2="200" y2="140" stroke="#1E3A5F" stroke-width="2"/>
  <line x1="470" y1="105" x2="620" y2="140" stroke="#1E3A5F" stroke-width="2"/>

  <rect x="100" y="140" width="200" height="55" rx="10" fill="#E8F1F8" stroke="#1E3A5F" stroke-width="2"/>
  <text x="200" y="165" text-anchor="middle" font-size="13" font-weight="bold" fill="#1E3A5F">主动防御 (Proactive)</text>
  <text x="200" y="183" text-anchor="middle" font-size="10" fill="#444">训练时加固，运行时无开销</text>

  <rect x="520" y="140" width="200" height="55" rx="10" fill="#FFF4E6" stroke="#F4A261" stroke-width="2"/>
  <text x="620" y="165" text-anchor="middle" font-size="13" font-weight="bold" fill="#A8530B">被动防御 (Reactive)</text>
  <text x="620" y="183" text-anchor="middle" font-size="10" fill="#444">推理时检测，灵活可热插拔</text>

  <!-- 主动防御四个分支 -->
  <line x1="200" y1="195" x2="80" y2="240" stroke="#1E3A5F" stroke-width="1"/>
  <line x1="200" y1="195" x2="180" y2="240" stroke="#1E3A5F" stroke-width="1"/>
  <line x1="200" y1="195" x2="280" y2="240" stroke="#1E3A5F" stroke-width="1"/>
  <line x1="200" y1="195" x2="380" y2="240" stroke="#1E3A5F" stroke-width="1"/>

  <rect x="20" y="240" width="115" height="50" rx="8" fill="#fff" stroke="#1E3A5F"/>
  <text x="77" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E3A5F">对抗训练</text>
  <text x="77" y="278" text-anchor="middle" font-size="9" fill="#666">min-max 优化</text>

  <rect x="140" y="240" width="115" height="50" rx="8" fill="#fff" stroke="#1E3A5F"/>
  <text x="197" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E3A5F">防御蒸馏</text>
  <text x="197" y="278" text-anchor="middle" font-size="9" fill="#666">高温软标签</text>

  <rect x="260" y="240" width="115" height="50" rx="8" fill="#fff" stroke="#1E3A5F"/>
  <text x="317" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E3A5F">集成方法</text>
  <text x="317" y="278" text-anchor="middle" font-size="9" fill="#666">多模型投票</text>

  <rect x="380" y="240" width="115" height="50" rx="8" fill="#fff" stroke="#1E3A5F"/>
  <text x="437" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#1E3A5F">鲁棒优化</text>
  <text x="437" y="278" text-anchor="middle" font-size="9" fill="#666">可证明边界</text>

  <!-- 被动防御三个分支 -->
  <line x1="620" y1="195" x2="540" y2="240" stroke="#A8530B" stroke-width="1"/>
  <line x1="620" y1="195" x2="640" y2="240" stroke="#A8530B" stroke-width="1"/>
  <line x1="620" y1="195" x2="740" y2="240" stroke="#A8530B" stroke-width="1"/>

  <rect x="500" y="240" width="115" height="50" rx="8" fill="#fff" stroke="#F4A261"/>
  <text x="557" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#A8530B">对抗检测</text>
  <text x="557" y="278" text-anchor="middle" font-size="9" fill="#666">隐空间分析</text>

  <rect x="620" y="240" width="115" height="50" rx="8" fill="#fff" stroke="#F4A261"/>
  <text x="677" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#A8530B">输入重建</text>
  <text x="677" y="278" text-anchor="middle" font-size="9" fill="#666">自编码器净化</text>

  <rect x="740" y="240" width="70" height="50" rx="8" fill="#fff" stroke="#F4A261"/>
  <text x="775" y="260" text-anchor="middle" font-size="11" font-weight="bold" fill="#A8530B">MTD</text>
  <text x="775" y="278" text-anchor="middle" font-size="9" fill="#666">动态切换</text>

  <!-- 应用域 -->
  <rect x="60" y="335" width="700" height="55" rx="10" fill="#E8F5EE" stroke="#2E8B57" stroke-width="2"/>
  <text x="410" y="358" text-anchor="middle" font-size="13" font-weight="bold" fill="#2E8B57">无线领域应用：物理约束 + 实时性 + 资源限制</text>
  <text x="410" y="378" text-anchor="middle" font-size="10" fill="#444">Wi-Fi 感知 (CSI) | O-RAN (xApp) | AMR (调制识别) | NIDS (入侵检测)</text>

  <!-- 未来方向 -->
  <rect x="60" y="410" width="700" height="55" rx="10" fill="#FBE7E7" stroke="#D64545" stroke-width="2"/>
  <text x="410" y="433" text-anchor="middle" font-size="13" font-weight="bold" fill="#D64545">未来方向：智能化、隐私化、可证明化</text>
  <text x="410" y="453" text-anchor="middle" font-size="10" fill="#444">LLM 智能防御 | 联邦学习 (FLARE) | 对比学习 (FeCo) | 可证明鲁棒性</text>
</svg>

### 7.2 四个核心结论

读完这篇综述，可以提炼出四个超越具体技术细节的洞察：

#### 结论一：没有银弹，分层才是王道

无论是对抗训练、集成、MTD 还是检测器，**没有任何单一方法能提供"完美防御"**。综述里反复强调的是 **纵深防御（defense-in-depth）** 思路——把多种方法叠加：

- 主动防御先减少常见攻击的成功率
- 被动防御兜底捕获新型威胁
- 多种被动防御又分层（重建 → 检测）

#### 结论二：通用方案不行，必须量身定做

无线物理层信号、网络流量统计、CSI 时序数据——每种数据类型都有独特的"指纹"和约束。把图像领域的对抗训练直接搬过来效果差，必须考虑：

- **物理可行性**：对抗扰动不能违反物理规律
- **协议合规性**：网络流量不能破坏 TCP/UDP 栈
- **时序连续性**：连续帧不能突变

#### 结论三：攻防是无止境的"军备竞赛"

每出现一种新防御，就会有针对性的"自适应攻击"出现。Carlini 等人的**适应性攻击系列**论文一再证明这一点——许多看似有效的防御在适应性攻击下溃败。

但这并不令人沮丧——**攻防进步实际上抬高了攻击者的整体门槛**。十年前能用 FGSM 一招破天下，今天的攻击者要会 PGD、CW、AutoAttack、各种迁移攻击的组合，还要懂博弈论、强化学习。这本身就是防御方的胜利。

#### 结论四：理论与实践的鸿沟仍待跨越

综述的最后一段可能是最有分量的：

> *"Ultimately, the realization of trustworthy AI-driven wireless networks will require sustained research efforts that bridge the gap between theoretical robustness guarantees and practical deployment constraints."*
>
> （要让 AI 驱动的无线网络真正可信，最大的挑战是弥合理论鲁棒性保证与实际部署约束之间的鸿沟。）

这里指的是几个具体的鸿沟：

| 理论上                                       | 实际上                       |
| -- | - |
| 可证明鲁棒性能 mathematically guarantee 安全 | 仅适用于小模型、低维输入     |
| 联邦学习保护隐私                             | 拜占庭客户端比例稍高就失效   |
| LLM 能自动化威胁分析                         | 算力开销让边缘部署困难       |
| 集成方法理论上提升鲁棒性                     | 推理时延翻倍，IoT 设备扛不住 |

跨越这些鸿沟，不是单点技术突破能解决的——它需要算法、硬件、协议、标准化的协同进步。

### 7.3 写在最后：值得关注的几个动向

如果你想持续追踪这个领域，2026 年值得关注的几个方向：

1. **6G 安全标准化**：3GPP 已经在 Rel-19 / Rel-20 中讨论 AI 模块的安全规范。相关工作组的输出文件值得跟读。
2. **LLM-边缘协同**：把 LLM 的"大脑"放云端、"反射弧"放边缘，是最有可能在生产中落地的混合架构。
3. **Diffusion-based 对抗净化**：扩散模型在 2024-2025 年开始被用作对抗防御的预处理——它在"洗掉扰动"上比传统自编码器更强大。
4. **量子安全 ML**：尽管离实用还远，但抗量子的对抗鲁棒性已经在 2025 年的几篇论文中初现端倪。

这场 AI 攻防战远未结束。而每一次攻击者的新招，都在催生防御方的新思路——这种动态张力本身，正是这个领域最迷人的地方。




## 附录 A：术语表

按字母/拼音顺序排列，方便检索。

| 缩写          | 全称                                      | 中文释义                                                     |
| - | -- | --- |
| **AML**       | Adversarial Machine Learning              | 对抗机器学习——研究如何攻击 AI 模型以及如何防御此类攻击的子领域 |
| **AMR**       | Automatic Modulation Recognition          | 自动调制识别——根据信号波形识别其使用的调制方式               |
| **AT**        | Adversarial Training                      | 对抗训练——把对抗样本混入训练集来提高鲁棒性                   |
| **CSI**       | Channel State Information                 | 信道状态信息——描述无线信号经过空间传播后的衰减、相位变化等   |
| **CW Attack** | Carlini & Wagner Attack                   | CW 攻击——一种通过优化重写损失函数来绕过梯度遮蔽的强力白盒攻击 |
| **DRL**       | Deep Reinforcement Learning               | 深度强化学习——AI 通过奖惩机制自主学习决策策略                |
| **DSE**       | Deep Similarity Encoder                   | 深度相似度编码器——将输入映射到嵌入空间以计算样本间相似度     |
| **FGSM**      | Fast Gradient Sign Method                 | 快速梯度符号法——Goodfellow 提出的最简单的单步对抗样本生成方法 |
| **FL**        | Federated Learning                        | 联邦学习——多方协同训练共享模型而不交换原始数据的范式         |
| **FLARE**     | (framework name)                          | 一种基于隐空间表征的联邦学习中毒检测框架                     |
| **GAN**       | Generative Adversarial Network            | 生成对抗网络——一个生成器和一个鉴别器对抗训练的架构           |
| **I-FGSM**    | Iterative FGSM                            | 迭代 FGSM——FGSM 的多步增强版，比 FGSM 更强                   |
| **IoT**       | Internet of Things                        | 物联网——智能设备组成的网络                                   |
| **KPM**       | Key Performance Measurement               | 关键性能测量——O-RAN 中暴露给智能控制器的性能指标             |
| **L-norm**    | Lp Norm                                   | Lp 范数——度量扰动大小的数学工具，常见 L∞、L₂、L₀             |
| **LLM**       | Large Language Model                      | 大语言模型——如 GPT、Claude 等                                |
| **LSTM**      | Long Short-Term Memory                    | 长短期记忆网络——擅长处理时间序列的循环网络                   |
| **MANDA**     | (framework name)                          | 通过隐空间分析进行对抗样本检测的模型无关框架                 |
| **MI-FGSM**   | Momentum Iterative FGSM                   | 动量迭代 FGSM——加入动量项的 I-FGSM 变种，迁移性更强          |
| **MLP**       | Multi-Layer Perceptron                    | 多层感知机——最基础的全连接神经网络                           |
| **MTD**       | Moving Target Defense                     | 移动目标防御——通过动态变换配置使攻击者难以瞄准的防御范式     |
| **NES**       | Natural Evolution Strategy                | 自然进化策略——一种黑盒梯度估计算法                           |
| **NIDS**      | Network Intrusion Detection System        | 网络入侵检测系统——识别恶意网络流量的安全系统                 |
| **O-RAN**     | Open Radio Access Network                 | 开放无线接入网——把传统专有基站打开的 5G/6G 架构              |
| **PbRL**      | Preference-based Reinforcement Learning   | 基于偏好的强化学习——通过比较两个轨迹的偏好来学习奖励函数     |
| **PGD**       | Projected Gradient Descent                | 投影梯度下降——Madry 等人提出的强力多步对抗攻击               |
| **RIC**       | RAN Intelligent Controller                | 无线接入网智能控制器——O-RAN 中部署 xApp/rApp 的核心组件      |
| **rApp**      | non-Real-Time RAN Application             | 非实时无线接入网应用——O-RAN 中的智能控制单元                 |
| **ResGAN**    | Residual GAN                              | 残差生成对抗网络——综述中专为 Wi-Fi CSI 异常检测设计的 GAN 变种 |
| **SLA**       | Service Level Agreement                   | 服务等级协议——运营商对网络性能的合同承诺                     |
| **softmax**   | (function name)                           | 把任意实数向量转换为概率分布的归一化函数                     |
| **TIKI-TAKA** | (framework name)                          | 综述中针对 NIDS 的对抗攻防全栈框架                           |
| **URLLC**     | Ultra-Reliable Low-Latency Communications | 超可靠低延迟通信——5G 三大应用场景之一                        |
| **ViT**       | Vision Transformer                        | 视觉 Transformer——把 NLP 的 Transformer 架构应用于图像和信号处理 |
| **xApp**      | eXternal RAN Application                  | 外部无线接入网应用——运行在近实时 RIC 上的智能控制小程序      |
| **ZOO**       | Zeroth-Order Optimization                 | 零阶优化——不需要梯度的黑盒优化方法                           |




## 附录 B：核心关键词速查（数学符号）

| 符号                       | 含义                         |
| -- | - |
| **x**                      | 原始输入样本                 |
| **x'** 或 **x_adv**        | 对抗样本                     |
| **δ**                      | 扰动向量，x' = x + δ         |
| **ε**（epsilon）           | 扰动预算，约束 \|\|δ\|\| ≤ ε |
| **f(·)** 或 **f_θ(·)**     | 神经网络模型，参数为 θ       |
| **L(·, ·)** 或 **J(·, ·)** | 损失函数（如交叉熵）         |
| **∇_x J**                  | 损失函数对输入 x 的梯度      |
| **D**                      | 训练数据分布                 |
| **T**                      | 蒸馏温度参数                 |



## 附录 C：参考文献


[1] C. Zhang, X. Costa-Pérez, and P. Patras, "Adversarial Attacks Against Deep Learning-Based Network Intrusion Detection Systems and Defense Mechanisms," *IEEE/ACM Trans. Netw.*, vol. 30, no. 3, pp. 1294-1311, Jun. 2022.

[2] A. Bahramali, M. Nasr, A. Houmansadr, D. Goeckel, and D. Towsley, "Robust Adversarial Attacks Against DNN-Based Wireless Communication Systems," in *Proc. ACM SIGSAC Conf. Comput. Commun. Security (CCS)*, 2021, pp. 126–140.

[3] M. J. De Lucia and C. Cotton, "A Network Security Classifier Defense: Against Adversarial Machine Learning Attacks," in *Proc. ACM Workshop Wireless Security Mach. Learn. (WiseML)*, 2020, pp. 67-73.

[4] F. O. Catak, M. Kuzlu, E. Catak, U. Cali, and O. Guler, "Defensive Distillation-Based Adversarial Attack Mitigation Method for Channel Estimation Using Deep Learning Models in Next-Generation Wireless Networks," *IEEE Access*, vol. 10, pp. 98191–98203, 2022.

[5] Z. Hong, C. Song, J. Wan, C. Jin, H. Zheng, T. Li, and Z. Wen, "A Reconstruction-Based Defense Framework for Automatic Modulation Recognition," *IEEE Commun. Lett.*, vol. 30, pp. 937-941, 2026.

[6] M. Goswami, S. Banerjee, and S. Mahato, "Advancing adversarial detection of anomalous Wi-Fi activity through residual generative adversarial networks: A novel approach for robust wireless network security," in *Proc. 4th Int. Conf. Range Technol. (ICORT)*, 2025.

[7] Y. Shankar and A. Chakraborty, "Practical Defense Against Adversarial WiFi Sensing," in *Proc. IEEE Int. Conf. Adv. Netw. Telecommun. Syst. (ANTS)*, 2024.

[8] W. Lou, "Fortifying Your Defenses: Techniques to Thwart Adversarial Attacks and Boost Performance of Machine Learning-Based Intrusion Detection Systems," in *Proc. ACM Workshop Wireless Security Mach. Learn. (WiseML)*, 2023, p. 1.

[9] K. He, D. D. Kim, and M. R. Asghar, "MTD-AD: Moving Target Defense as Adversarial Defense for Network Security Classifiers," *IEEE Trans. Dependable Secure Comput.*, vol. 22, no. 5, pp. 5047-5059, Sep./Oct. 2025.

[10] T. B. Hassan, F. Meneghello, and F. Restuccia, "AdvO-RAN: Adversarial Deep Reinforcement Learning in AI-Driven Open Radio Access Networks," in *Proc. ACM Int. Symp. Theory, Algorithmic Foundations, Protocol Design Mobile Netw. Mobile Comput. (MobiHoc)*, 2025.

[11] A. Chiejina, B. Kim, K. Chowhdury, and V. K. Shah, "System-level analysis of adversarial attacks and defenses on intelligence in O-RAN based cellular networks," in *Proc. 17th ACM Conf. Secur. Privacy Wireless Mobile Netw. (WiSec)*, 2024, pp. 237–247.

[12] G. Li, C.-C. Lin, X. Zhang, X. Ma, and L. Guo, "Adversarial Robust ViT-Based Automatic Modulation Recognition in Practical Deep Learning-Based Wireless Systems," in *Proc. IEEE Symp. Security Privacy (SP)*, 2025, pp. 3672–3690.

[13] G. Yin, J. Zhang, X. Yi, and X. Wang, "Evasion Attacks and Countermeasures in Deep Learning-Based Wi-Fi Gesture Recognition," *IEEE Trans. Mobile Comput.*, vol. 24, no. 9, pp. 8180-8195, Sep. 2025.

[14] H. Liu, J. Xue, S. Zhao, Y. Liu, and Z. Lu, "The Dual Role of Large Language Models in Network Security: Survey and Research Trends," in *Proc. ACM Workshop Wireless Security Mach. Learn. (WiseML)*, 2025.

[15] N. Wang, Y. Chen, Y. Xiao, Y. Hu, W. Lou, and Y. T. Hou, "MANDA: On Adversarial Example Detection for Network Intrusion Detection System," *IEEE Trans. Dependable Secure Comput.*, vol. 20, no. 2, pp. 1139-1153, Mar.-Apr. 2023.

[16] N. Wang, Y. Chen, Y. Hu, W. Lou, and Y. T. Hou, "FeCo: Boosting Intrusion Detection Capability in IoT Networks via Contrastive Learning," in *Proc. IEEE Conf. Comput. Commun. (INFOCOM)*, 2022, pp. 1409-1418.

[17] N. Wang, Y. Xiao, Y. Chen, Y. Hu, W. Lou, and Y. T. Hou, "FLARE: Defending Federated Learning against Model Poisoning Attacks via Latent Space Representations," in *Proc. ACM Asia Conf. Comput. Commun. Security (ASIA CCS)*, 2022, pp. 946-958.







> *写于 2026 年 5 月*



*本文采用 [CC BY-NC 4.0 协议](https://creativecommons.org/licenses/by-nc/4.0/) 授权。转载请注明出处。*

