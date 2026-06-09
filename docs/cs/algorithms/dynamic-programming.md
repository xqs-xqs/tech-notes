---
title: 动态规划基本模型
description: 覆盖背包DP、线性DP、区间DP、计数类DP、数位统计DP、状态压缩DP、树型DP和记忆化搜索八大动态规划模型，含完整代码与例题。
date: 2026-06-06
tags: [动态规划, 背包问题, 线性DP, 区间DP, 状态压缩, 算法]
---

# 动态规划基本模型

简要记录下动态规范的一些模型和对应的经典解法。

## 前言

+ 动态规划是用一个数来表示一堆状态，可以看成是对暴搜的优化

> 暴搜一个一个数枚举过去，但DP是一堆堆数枚举，效率会快很多；

+ 状态数用几维表示：从小到大考虑，看怎么样才能够让答案清楚表达出来

> 需要一定的积累，一个问题的理解角度太多了；

+ 动态规划时间复杂度：状态数 × 转移计算量；
+ 状态划分的一般技巧：寻找最后一个不同点；
    - 求最值时，子问题划分可以存在重复部分（不影响全局最值）；
    - 求数量时，子问题划分不可以重复（每部分该是多少就是多少）；

> 如背包问题中，`f[i][j]`就看上一个物品编号`i-1`放了多少个进行划分；
>
> 最长上升子序列中，就找`f[i][j]`的前一个数`j`放在序列中位置进行划分；

+ 此外，动态规划遇到的模型实在太多了，这里只列举了我通过Acwing算法基础课学习到的一些常见模型，后续还会继续补充自己在算法学习过程遇到的动态规划题型总结；

![动态规划思维导图](/images/algorithms/dp/05a76a695c054421b6e7d89c09d1b315.jpeg)



## 1. 背包DP

![背包DP概览](/images/algorithms/dp/fd5150ab9edf4dc1aa1706d775f16191.jpeg)

### 1.1. 01 背包问题

**状态表示** `f[i][j]`：

**集合**

所有只考虑前`i`个物品，且总体积不超过`j`的选法的集合；

**属性：**

最大值（背包中存放物品的最大价值）

**状态计算：**

将`f[i][j]`划分为第`i`个选和第`i`个不选两种情况；

```
f[i][j] = max(f[i - 1][j], f[i - 1][j - v[i] ] + w)
```

![01背包状态转移](/images/algorithms/dp/71d94bd84ff142acba6e46c205edf60c.jpeg)

例题：[AcWing 2. 01背包问题](https://www.acwing.com/problem/content/2/)

**01背包朴素思想代码**

```cpp
#include<iostream>
#include<algorithm>
using namespace std;

const int N = 1010;
int f[N][N];
int v[N], w[N];
int n, m;

int main() {
    cin >> n >> m; 
    for (int i = 1; i <= n; i++)
        cin >> v[i] >> w[i];
    
    for (int i = 1; i <= n; i++)
        for (int j = 0; j <= m; j++) {
            f[i][j] = f[i-1][j];
            if (j >= v[i]) f[i][j] = max(f[i][j], f[i-1][j-v[i]] + w[i]);
        }
    
    cout << f[n][m] << endl;
    return 0;
}
```

**01背包优化版代码**

> 通过代码逻辑简化，将状态数组从二维变成一维，后续的背包问题优化类似；
>
> 1. 将`f[i][j]`的第一维通过循环开始的次序给省略掉了；
> 2. 将`if`语句的判断直接并入到`for`循环的第二个判断中去；
>
> 优化后的代码会比较抽象，想要理解清楚还是需要从朴素代码出发去思考；

```cpp
#include<iostream>
#include<algorithm>
using namespace std;

const int N = 1010;
int f[N];
int v[N], w[N];
int n, m;

int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        cin >> v[i] >> w[i];
     
    for (int i = 1; i <= n; i++)
        for (int j = m; j >= v[i]; j--) 
            f[j] = max(f[j], f[j - v[i]] + w[i]);
        
    cout << f[m] << endl;
    return 0;
}
```

### 1.2. 完全背包问题

**状态表示** `f[i][j]`：

**集合**

`f[i][j]` 表示所有只考虑前`i`个物品，且总体积不超过`j`的选法的集合；

**属性：**

最大值

**状态计算：**

通过第`i`个物品选了几个来划分`f[i][j]`

```
f[i][j] = max(f[i - 1][j], f[i - 1][j - v[i]] + w[i], f[i - 1][j - 2*v[i]] + 2*w[i], ... );

//因为 f[i][j- v[i]] = max( f[i - 1][j - v[i]], f[i - 1][j - 2*v[i]] + *w[i], ... );
//因此可以进行等价变形

f[i][j] = max(f[i - 1][j], f[i][j - v[i]] + w[i]);
```

![完全背包状态转移](/images/algorithms/dp/5f31db522cb744c7b450ca66f6c1c5a9.jpeg)

例题：[AcWing 3. 完全背包问题](https://www.acwing.com/problem/content/3/)

**完全背包朴素思想代码：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N=1010;

int f[N][N];
int n,m;
int v[N],w[N];

int main(){
    cin >> n>>m;

    for(int i=1;i<=n;i++) cin >>v[i] >>w[i];

    for(int i=1;i<=n;i++)
        for(int j=0;j<=m;j++)
            for(int k=0 ; k*v[i] <= j ;k++){
            f[i][j]=max( f[i][j] , f[i-1][j - k * v[i] ] + k * w[i]);
        }

    cout <<f[n][m] <<endl;

    return 0;
}
```

**完全背包代码逻辑优化版代码：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010;

int n, m;
int f[N];
int v[N], w[N];

int main() {
    cin >> n >> m;

    for (int i = 1; i <= n; i++)
        cin >> v[i] >> w[i];

    for (int i = 1; i <= n; i++)
        for (int j = v[i]; j <= m; j++)
            f[j] = max(f[j], f[j - v[i]] + w[i]);

    cout << f[m] << endl;

    return 0;
}
```

### 1.3. 多重背包问题

**状态表示** `f[i][j]`：

**集合**

所有只考虑前`i`个物品，且总体积不超过`j`的选法的集合；

**属性：**

最大值（背包中存放物品的最大价值）

**状态计算：**

通过第`i`个物品选多少个来划分`f[i][j]`

![多重背包状态转移](/images/algorithms/dp/3b00823d972b4d9eaf45c272294e62c5.jpeg)

例题：[AcWing 4. 多重背包问题](https://www.acwing.com/problem/content/4/)

**多重背包朴素代码：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N=110;
int f[N][N];
int v[N] , w[N] ,s[N];
int n,m;

int main(){
    cin >> n >> m;

    for (int i = 1; i <= n; i++) cin >> v[i] >>w[i] >>s[i];

    for (int i = 1; i <= n; i++)
        for (int j = 0; j <= m; j++)
            for (int k = 0; k <= s[i] && k*v[i] <= j; k++){ //k要小于第i种物品的最大数量 同时也要保证能够装入
                f[i][j] = max(f[i][j], f[i - 1][j - k*v[i]] + k*w[i]);
            }

    cout << f[n][m] <<endl;
    return 0;
}
```

**多重背包代码逻辑优化：**

+ 朴素多重背包问题，按照类似完全背包问题的思考方式，时间复杂度为 $O(n\,m\,s)$，一旦问题规模超过 $10^3$，就会直接超时；
+ 通过二进制优化方法可以将原本的每种物品数量的遍历 $O(s)$ 转换为 $O(\log s)$，使得最终整个程序的时间复杂度为 $O(n\,\log s\,m)$
+ 二进制优化：将原本的`s[i]`转换一堆堆二进制数（如1,2,4,···），二进制位是从 $2^0$ 开始的，因此通过这一堆二进制可以任意表示`1-s`中任意一个数，我们就可以将原本的多重背包问题转换为01背包问题，变成这一堆堆的二进制数选还是不选，时间复杂度就会变成 $O(\log s)$

例题：[多重背包问题 II](https://www.acwing.com/problem/content/5/)

**多重背包二进制优化代码：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 12010, M = 2010;

int v[N], w[N];
int f[M];
int n, m;

int main() {
    cin >> n >> m;

    int cnt = 0;    //数组下标 类似于idx 表示当前拆分到了哪一个位置
    for (int i = 1; i <= n; i++) {
        int a, b, s;    //体积、价值和数量
        cin >> a >> b >> s;

        for (int k = 1; k <= s; k *= 2) {   //将第i类物品的数量s[i]拆成一堆一堆的二进制数
            cnt ++;
            v[cnt] = k * a;
            w[cnt] = k * b;
            s -= k;
        }

        if (s > 0) {    //若s没有被完全倍增，就额外自己单独形成一堆
            cnt ++;
            v[cnt] = s * a;
            w[cnt] = s * b;
        }
    }

    for (int i = 1; i <= cnt; i++)
        for (int j = m; j >= v[i]; j--)
            f[j] = max(f[j], f[j - v[i]] + w[i]);

    cout << f[m] << endl;

    return 0;
}
```

### 1.4. 分组背包问题

**状态表示** `f[i][j]`：

**集合**

所有只从前`i`组中选，且总体积不超过`j`的选法的集合；

**属性：**

最大值（背包中存放物品的最大价值）

**状态计算：**

通过第`i`个组物品中选了哪个来划分`f[i][j]`

例题：[AcWing 9. 分组背包问题](https://www.acwing.com/problem/content/9/)

**分组背包朴素代码：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 110;

int v[N][N], w[N][N], s[N];     //s[i]表示第i组物品共有几类物品
int f[N];
int n, m;

int main() {
    cin >> n >> m;

    for (int i = 1; i <= n; i++) {
        cin >> s[i];
        for (int j = 1; j <= s[i]; j++) {
            cin >> v[i][j] >> w[i][j];
        }
    }

    for (int i = 1; i<= n; i++)
        for (int j = m; j >= 0; j--)
            for (int k = 0; k <= s[i]; k++)
                if (j >= v[i][k])
                    f[j] = max(f[j], f[j - v[i][k]] + w[i][k]);

    cout << f[m] << endl;

    return 0;
}
```



## 2. 线性DP

**状态表示** `f[][]` **初始化注意事项：**

+ 需要注意在状态转移方程中有哪些状态需要用到但事先没有的，需要我们预处理一下
    - 如在最长上升子序列中需要在循环一开始令`f[i] = i`表明初始状态
    - 或者像状态转移方程中有`i-1`或`j-1`出现的话，循环起始就要从1开始
+ 如果要找min，将f[][]初始化为INF；
+ 如果要找有负数的max，要初始化为-INF；

### 2.1. 数字三角形

![数字三角形](/images/algorithms/dp/108524f715994d019bba823dcbf36501.jpeg)

例题：[AcWing 898. 数字三角形](https://www.acwing.com/problem/content/898/)

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 510, INF = 1e9;

int a[N][N];
int f[N][N];    //表示从起点走到(i,j)路径上数字之和的最大值
int n;

int main() {
    cin >> n;
    
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)
            cin >> a[i][j];
    
    for (int i = 0; i <= n; i++)    //整数中可能存在负数，为了方便最小值的比较，将f(i,j)全都初始化为负无穷
        for (int j = 0; j <= n; j++)
            f[i][j] = -INF;
            
    f[1][1] = a[1][1];
    for (int i = 2; i <= n; i++)
        for (int j = 1; j <= i; j++)
            f[i][j] = max(f[i-1][j-1] + a[i][j], f[i-1][j] + a[i][j]);
    
    int res = -INF;
    for (int j = 1; j <= n; j++)    //遍历最后一行 找底层中的最大值
        if (f[n][j] > res) 
            res = f[n][j];
    
    cout << res << endl;
    
    return 0;
}
```

### 2.2. 最长上升子序列

**状态表示：**

`f[i]`表示以第i个数结尾的上升子序列的最大长度；

**状态划分：**

以上升子序列中第`i`个数的前一个数的位置进行划分

```
f[i] = max(f[j] + 1);   //(j = 0, 1, 2,..., i-2)
```

![最长上升子序列](/images/algorithms/dp/2902916bf98945bdb7016eefe535312f.jpeg)

例题：[AcWing 895. 最长上升子序列](https://www.acwing.com/problem/content/897/)

**最长上升子序列朴素代码：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010;

int a[N];
int f[N];   //表示以第i个数结尾的上升子序列的最大长度
int n;

int main() {
    cin >> n;
    
    for (int i = 1; i <= n; i++) {
        cin >> a[i];
        f[i] = 1;   //只有i一个数（最小长度为1）
    }
        
    
    for (int i = 1; i <= n; i++) 
        for (int j = 0; j <= i - 1; j++)   
            if (a[j] < a[i])
                f[i] = max(f[i], f[j] + 1);
    
    int res = 1;
    for (int i = 1; i <= n; i++)    //找出最大值
        res = max(res, f[i]);
        
    cout << res << endl;
    
    return 0;
}
```

**最长上升子序列优化代码** $O(n\,\log n)$：

+ 保证每一种长度的上升子序列的最后一个数（假设每一种长度的上升子序列最终只存取一个的情况下），是在相同长度的所有上升子序列中最小的，这样能够使得该长度的上升子序列适应性最强；
+ 假设当前的长度为`i`，那么就可以使得所有长度为`i+1`的上升子序列都可以用上这段长度为`i`的上升子序列（因为长度`i+1`的上升子序列其前`i`个数也是一个上升子序列，必然要从所有长度`i`的上升子序列选一个出来），从而能够产生以下现象：
+ 按长度从小到大排列的上升子序列的最后一个数之间是严格单调递增的，将不同长度的上升子序列的最小结尾数用`q[n]`存储；而想要找到以`a[i]`结尾的上升子序列的最大长度，只需要在`q[n]`中找到最大的小于`a[i]`的数`q[k]`，然后将`a[i]`插入这个结尾数所代表的上升子序列中，使得以`a[i]`结尾的最长长度的就是`k+1`；

例题：[AcWing 896. 最长上升子序列 II](https://www.acwing.com/problem/content/896/)

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 100010;

int a[N];
int q[N];   //存储长度为i的上升子序列结尾最小的数
int n;

int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];
    
    int len = 0;        //表示上升子序列的最大长度 从长度0
    q[0] = -2e9;        //设置临界数据 方便最大值的比较
    for (int i = 1; i <= n; i++) {  //从上升子序列的结尾数中找出最大的小于a[i]的数 并将a[i]插入到这个子序列后面 更新q[len+1]的值
        int l = 0, r = len;
        while (l < r) {
            int mid = l + r + 1 >> 1;
            if (q[mid] < a[i]) l = mid; //从严格单调递增的q[]中找到最大的小于a[i]的数（找红色区域的右边界）
            else r = mid - 1;
        }
        
        len = max(len, r + 1);
        q[r + 1] = a[i];    //更新长度r+1的最小结尾数
        //因为若在严格单调递增的q[]中a[i]的最大最小数是q[r]的话,就说明此时q[r+1]大于a[i],那我们就可以更新其最小结尾数为a[i]
    }
    
    cout << len << endl;
    
    return 0;
}
```

### 2.3. 最长公共子序列

**状态表示：**

**集合**

`f[i][j]`表示所有`A[1-i]`与`B[1-j]`的公共子序列的集合；

**属性：**

max（求最长公共子序列）

**状态计算：**

将`a[1-i]`与`b[1-j]`中各自序列的最后一个数在公共子序列中是否出现分为四种情况：

1. a[i]与b[j]都不包含：`f[i-1][j-1]`
2. a[i]不包含，b[j]包含：`f[i-1][j]`
3. a[i]包含，b[j]不包含：`f[i][j-1]`
4. a[i]与b[j]都包含：`f[i-1][j-1]`

其中第一种情况可以被第二、三种情况的方案覆盖；

![最长公共子序列](/images/algorithms/dp/c5e001b2a9c546e19c6c078ae200cdec.jpeg)

例题：[AcWing 897. 最长公共子序列](https://www.acwing.com/problem/content/899/)

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010;

int n, m;
int f[N][N];    //f[i][j]表示从a[1-i]与b[1-j]的公共子序列集合中的最大值
char a[N], b[N];

int main() {
    cin >> n >> m >> a + 1 >> b + 1;
    
    for (int i = 1; i <=n; i++)
        for (int j = 1; j <= m; j++) {
            f[i][j] = max(f[i-1][j], f[i][j-1]);
            if (a[i] == b[j])
                f[i][j] = max(f[i][j], f[i-1][j-1] + 1);
        }
    
    cout << f[n][m] << endl;
    
    return 0;
}
```

### 2.4. 最短编辑距离

**1. 状态表示：**

`f[i][j]`表示将`a[1~i]`变为`b[1~j]`的所有操作方式的操作次数的最小值；

**2. 状态计算：**

将`a[1~i]`变为`b[1~j]`的最后一步操作，划分为对`a[i]`的删除、添加、修改；

+ 先让`a[1~i-1]`变成`b[1~j]`，再将`a[i]`删除：
+ 先让`a[1~i]`变成`b[1~j-1]`，再在`a[i]`后面插入`b[j]`；
+ 先让`a[1~i-1]`变成`b[1~j-1]`，若`a[i] != b[j]`，再将`a[i]`修改为`b[j]`；

三者取最小值，在循环过程中`a[]`就会自动选择操作次数最小的对应操作，最终自己找到最优解；

![最短编辑距离](/images/algorithms/dp/35a934791ff64be38b90e31de8f7a2f6.jpeg)

例题：[AcWing 902. 最短编辑距离](https://www.acwing.com/problem/content/904/)

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010;

int f[N][N];    //表示a[1~i]变为b[1~j]的所有操作方式的最少操作次数
char a[N], b[N];
int n, m;

int main() {
    cin >> n >> a + 1;
    cin >> m >> b + 1;
    
    //f[][]边界预处理
    for (int i = 1; i <= n; i++) f[i][0] = i;   //删除操作 从a的i个字符变成b的0个字符 只能进行i次删除
    for (int i = 1; i <= m; i++) f[0][i] = i;   //插入操作 从a的0个字符变成b的i个字符 只能进行i次插入
    
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            f[i][j] = min(f[i-1][j] + 1, f[i][j-1] + 1);
            if (a[i] == b[j]) f[i][j] = min(f[i][j], f[i-1][j-1]);
            else f[i][j] = min(f[i][j], f[i-1][j-1] + 1);
        }
    }
        
    cout << f[n][m] << endl;
    
    return 0;
}
```

### 2.5. 编辑距离

+ 可以看成二维最短编辑距离；
+ 将多个字符串用二维数组存储在一起，然后再将两个字符串之间最短编辑距离的计算单独抽象成一个函数；

例题：[AcWing 899. 编辑距离](https://www.acwing.com/problem/content/899/)

```cpp
#include<iostream>
#include<algorithm>
#include<cstring>

using namespace std;

const int N = 1010, M = 12;

char a[N][M];     //二维数组a用于存储多个字符串,b用于存储代询问字符
int f[M][M];
int n, m;

int judeg(char a[], char b[]) { //计算从a到b的最短编辑距离
    int la = strlen(a + 1), lb = strlen(b + 1);     //返回字符串长度,遇到空字符'\0'停止(不计入长度)
    
    for (int i = 1; i <= la; i++) f[i][0] = i;
    for (int i = 1; i <= lb; i++) f[0][i] = i;
    
    int res = 0;
    for (int i = 1; i <= la; i++) {
        for (int j = 1; j <= lb; j++) {
            f[i][j] = min(f[i-1][j] + 1, f[i][j-1] + 1);
            
            if (a[i] == b[j]) f[i][j] = min(f[i][j], f[i-1][j-1]);
            else f[i][j] = min(f[i][j], f[i-1][j-1] + 1);
            //f[i][j] = min(f[i][j], f[i - 1][j - 1] + (a[i] != b[j])); //合二为一
        }
    }
    
    return f[la][lb];
}

int main() {
    cin >> n >> m;
    
    for (int i = 1; i <= n; i++)
        cin >> a[i] + 1;    //a[][]中a[]是某一行的起始地址, +1表示从下标1开始输入
    
    while (m--) {
        int k;      //操作次数上限和待查询字符串
        char b[M];
        cin >> b + 1 >> k;
        
        int res = 0;    //满足条件的字符串个数
        for (int i = 1; i <= n; i++) {
            if (judeg(a[i], b) <= k) 
                res++;
        }
        
        cout << res << endl;
    }
    
    return 0;
}
```



## 3. 区间DP

### 3.1 石子合并

**状态表示：**

**集合**

`f[i][j]`表示将`[i,j]`合并为一堆的方案的集合；

**属性：**

最小值（最小合并代价）

**状态计算：**

把形成`f[i][j]`前的最后一次合并的左区间的最后一个数`k`的分布当成划分状态依据；遍历所有`k`的可能取值就能够得到集合的最小值

```
f[i][j] = min(f[i][j], f[i][k] + f[k+1][j] + s[j] - s[i-1]);
```

例题：[AcWing 282. 石子合并](https://www.acwing.com/problem/content/282/)

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N=310;
int f[N][N];    //表示将[i,j]合并为一堆的方案的集合
int s[N];       //前缀和数组
int n;

int main() {
    cin >> n;

    for (int i = 1;i <= n; i++){
        cin >> s[i];
        s[i] += s[i-1];  //石子的质量的前缀和数组
    }

    for (int len = 2; len <= n; len++){  //按区间长度从小到大枚举 长度为1无法合并 直接从2开始
        for (int i = 1; i + len - 1 <= n; i++){  //左端点
            int j = i + len - 1;    //右端点
            f[i][j] = 1e9;  //初始化成无穷大 以便于寻找最小值
            for (int k = i; k <= j - 1; k++){
                f[i][j] = min(f[i][j], f[i][k] + f[k+1][j] + s[j] - s[i - 1]);
            }
        }
    }

    cout << f[1][n] <<endl;

    return 0;
}
```



## 4. 计数类DP

### 4.1. 整数划分

**整数划分从完全背包思想入手：**

将整数划分问题看成完全背包问题：背包容量是`n`，物品的种类共有`n`种，其体积分别是1、2、3、...、n，每种物品都可以无限放；

**1. 状态表示：**

集合：`f[i][j]`表示所有只考虑`1~i`，且总体积恰好是`j`的选法；

属性：数量；（只考虑用`1~i`拼凑出`j`的所有选法的数量）

**2. 状态计算：**

将`f[i][j]`考虑成`i-1`选了多少个进行划分；

```
f[i][j] = f[i-1][j] + f[i-1][j-i] + f[i-1][j-2i] + ... + f[i-1][j-si];
f[i][j-i] = f[i-1][j-i] + f[i-1][j-2i] + ... + f[i-1][j-si];

f[i][j] = f[i-1][j] + f[i][j-i];
```

![整数划分](/images/algorithms/dp/bb0c064dc8574ab6a01aff6a79a3df11.jpeg)

例题：[AcWing 900. 整数划分](https://www.acwing.com/problem/content/900/)

**完全背包问题朴素解法：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010, M = 1e9 + 7;

int f[N][N];    //只考虑用1~i拼凑出j的所有选法的数量
int n;

int main() {
    cin >> n;
    
    //处理边界 虽然题目中没有涉及到0 但由于状态转移方程中有j-i出现 所以也要从实际角度出发考虑边界0
    for (int i = 0; i <= n; i++) f[i][0] = 1;   //0就表示一个数都不选 也代表一种方案
    
    for (int i = 1; i <= n; i++)
        for (int j = 0; j <= n; j++) {
            f[i][j] = f[i-1][j];
            if (j >= i)
                f[i][j] = (f[i-1][j] + f[i][j-i]) % M;
        }
            
    cout << f[n][n] << endl;
    
    return 0;
}
```

**完全背包优化解法：**

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010, M = 1e9 + 7;

int f[N];    //只考虑用1~i拼凑出j的所有选法的数量
int n;

int main() {
    cin >> n;
    
    //处理边界 边界预处理
    f[0] = 1;   //0就表示一个数都不选 也代表一种方案
    
    for (int i = 1; i <= n; i++)
        for (int j = i; j <= n; j++)
            f[j] = (f[j] + f[j-i]) % M;
        
    cout << f[n] << endl;
    
    return 0;
}
```

**从集合思想出发分析：**

**1. 状态表示：**

集合：`f[i][j]`表示总和为`i`，构成数为`j`的所有方案；属性：数量；

**2. 状态计算：**

以`f[i][j]`方案中的最小值是否为`1`进行划分；

```
f[i][j] = f[i-1][j-1] + f[i-j][j];
```

+ `f[i-1][j-1]`：所有方案同时减去一个最小值`1`，总个数`j`少`1`个，总和`i`少`1`；
+ `f[i-j][j]`：方案中的所有数都减`1`，因为最小值大于1所以减完之后不会有数变成0，总和`i-j`，总个数`j`不变；

![整数划分集合思想](/images/algorithms/dp/430d0ae83f104df0b2cd7d47d77ffb8d.jpeg)

```cpp
#include<iostream>
#include<algorithm>

using namespace std;

const int N = 1010, M = 1e9 + 7;

int f[N][N];  //表示所有总和为i，构成数数量为j的方案的数量
int n;

int main() {
    cin >> n;

    f[0][0] = 1;    //0边界只有一种情况
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= i; j++)    //j <= i 因为i不可能由超过i个数构成 如f[0][1]不合法
            f[i][j] = (f[i-1][j-1] + f[i-j][j]) % M;
    
    int res = 0;
    for (int i = 1; i <= n; i++)
        res = (res + f[n][i]) % M;  //加起来后还要再做一次取模,因为加完之后可能会超模
    
    cout << res << endl;
    
    return 0;
}
```



## 5. 数位统计DP

### 5.1. 计数问题

**数位统计DP最重要的是分类讨论：**

设计出`count(n,x)`函数：能够计算出`1~n`中`x`出现的次数（`x`范围为0~9）；

求解给定`a`和`b`两个数之间`x`的出现次数：`count(b, x) - count(a - 1, x)`

**以所有数第4位上 `x` 的出现次数为例：**

1. 当`x > 0`时

> ![数位统计x>0](/images/algorithms/dp/3882e625f24e0ec3f2b6cfc5bc948736.jpeg)

2. 当`x = 0`时，第一种情况（第四位前面的数从001开始）需要进行特判，第二种情况不变

> ![数位统计x=0](/images/algorithms/dp/d8a2f3065afbfa2562752c23b6e4b098.jpeg)

**边界情况：**

在代码循环过程中，需要额外注意一些边界特殊情况；

1. 枚举最高位上`x`的出现次数时，由于最高位前面没有数字因此不用考虑第一种情况；第一种情况的次数计算进入条件：`if (i < n - 1)`
2. 当判断的数字`x = 0`时
    - 需要注意最高位由于不能为0，因此枚举`n`的每一位时只能从次高位开始枚举；
    - 此外，由于没有前导零的存在，`x = 0`的前面数范围不能从`000`开始只能从`001`开始，用1来占位，因此`001`会比`000`的数据范围少一个 $10^i$；

![数位统计边界](/images/algorithms/dp/1d090fc0257d4643ad289a31df41b3fc.jpeg)

例题：[AcWing 338. 计数问题](https://www.acwing.com/problem/content/338/)

```cpp
#include<iostream>
#include<algorithm>
#include<vector>
#include<cmath>
using namespace std;
int n;

int get_spec_len(vector<int> a, int l, int r) { //将n的第l位到第r位取出
    int res = 0;
    for (int i = r; i >= l; i--)    //从最高位开始乘十
        res = res * 10 + a[i];
    return res;
}

int count(int n, int x) {   //计算从1-n中数字x出现的次数
    if (!n) return 0;   //因为计算方程中出现a-1, 需要处理好边界0; 当n=0时没有意义直接返回0

    vector<int> a;
    
    while (n) {     //取出n的每一位十进制数,最低位放在a[0],最高位放在a[n-1]
        a.push_back(n % 10);
        n /= 10;
    }
    
    n = a.size();   //n的总位数
    
    int res = 0;
    for (int i = n - 1 - !x; i >= 0; i--) {  //枚举每一位上x出现的次数; 当x=0时只能从次高位开始枚举
        if (i < n - 1) {    //根据i前面的数进行讨论; 最高位跳过该步
            res += get_spec_len(a, i + 1, n - 1) * pow(10, i);
            if (!x) res -= pow(10, i);    //当x为0时, 只能从001开始会比000开始少一种情况
        }
        
        if (a[i] == x) {    //对于当前位是否为x进行讨论
            res += get_spec_len(a, 0, i - 1) + 1;
        }else if(a[i] > x){
            res += pow(10, i);
        }
    }
    
    return res;
}

int main() {
    int a, b;
    
    while (cin >> a >> b, a || b) {
        if (a > b) swap(a, b);  //输入的数据不一定a<b, 而使用前缀和公式需要a<b形式
        
        for (int i = 0; i <= 9; i++) 
            cout << count(b, i) - count(a - 1, i) << " ";
        
        cout << endl;
    }
    
    return 0;
}
```



## 6. 状态压缩DP

### 6.1. 蒙德里安的梦想

**状态压缩DP思路：**

如果先把横的都放完，这时候剩下的竖着放只有一种方法；

所以棋盘小方格放法的总方案数就等所有横着放合法的方案数；

如何判断此时横着放的方案是否合法（整个棋盘都能被小方格填满）：看棋盘所有剩余位置，能否填充满竖着的小方块；从每一列看过去，每一列内部所有连续的空着的小方块，是否是偶数个（这样才能够用1×2的小方块填充满且只有一种摆放的方法）；

**1. 状态表示：**

`f[i][j]`表示已经将前`i-1`列都摆好，且从第`i-1`列伸出到第`i`列的状态是`j`的所有方案；

**2. 状态计算：**

由于第`i-1`列共有`n`行，每一行的不同状态（每一行伸或者不伸出去）可以组合成 $2^n$ 种情况；

如状态`j = 00100`表示只有第三行的`i-1`列伸出去到`i`列，其它行都没有伸出来；

因此每种状态可以划分为 $2^n$ 种状态子集，用于表示每行中`i-1`列是否有伸出去到`i`列；

而`f[i][j]`是在`f[i-1][k]`的基础上进行延申的；`f[i][j]`可以在`f[i-1][k]`的第`i-1`列的空白位置进行延申；因此`f[i][j]`的所有方案数可以通过尝试遍历所有的`f[i-1][k]`，尝试是否可以在`i-2`到`i-1`列的`k`状态基础上进行`i-1`列到`i`列的`j`状态延申（即检查这样的状态续接是否合法）；

```
for (int i = 1; i <= m; i ++ )
    for (int j = 0; j < 1 << n; j ++ )
        for (int k = 0; k < 1 << n; k ++ )
            if (检查从k到j的状态续接是否合法)
                f[i][j] += f[i - 1][k];
```

**如何保证最后方案是合法的？**

1. 第`i-1`列必须是在第`i-2`列所在行没有伸出去的基础上才能伸出去，不然就会导致方格重叠；即`f[i-1][k] & f[i][j] = 0`两个相邻列不能在同一行伸出去，才能合法地继续选择小方格下去；
2. 因为`f[i][j]`表示的是前`i-1`列已经摆好（小方块摆放位置已经固定），那么前`i-1`列都要合法，即每一列的状态需要：列中的所有空着的位置的长度必须是偶数，即`f[i-1][k] | f[i][j]`不能存在连续的奇数0；（`f[i-1][k] | f[i][j]`表示此时第`i`列的状态，也可以表示第`i`列中真正空着的位置，即第`i`列中没有小方块伸进来也没有小方块伸出去的位置）

```
if ((j & k) == 0 && st[j | k])
    f[i][j] += f[i - 1][k];
```

---

**代码注意事项：**

1. 因为`f[i][j]`记录的是有几种方案可以形成当前的状态`j`，而`f[i][j]`的状态转移方程又是以所有状态数`M`进行划分的，状态的方式是用十进制去表示二进制，每一位十进制上只能放0或1，多少行决定有多少位，如`00100`就表示只有第三行伸出去了，题目中的行最多可以有11行，所以需要存储11位十进制；`int`类型的数据范围到不了 $10^{11}$，因此需要用`long long`类型的数据存储；
2. 进行DP状态转移方程计算的时候，要注意第一层列循环，要从第2列开始（因为第1列前面没有列），到第m+1列结束（由于状态的定义要多往外枚举一列，f[m][]表示前m列已经摆好(f从0下标开始)）

例题：[AcWing 291. 蒙德里安的梦想](https://www.acwing.com/problem/content/293/)

**状态压缩朴素DP代码：**

```cpp
#include<iostream>
#include<cstring>
#include<algorithm>
typedef long long ll;
using namespace std;
const int N = 15, M = 1 << 11;

ll f[N][M]; //状态有11位十进制,int不够存
bool st[M]; //表示每一种列状态的01分布是否合法
int n, m;

int main() {
    while (cin >> n >> m, n | m) {
        //预处理st[i] 遍历每一种二进制状态是否合法(连续的0是否是偶数个)
        for (int i = 0; i < (1 << n); i++) {   
            int cnt = 0;    //当前段连续0的个数
            st[i] = true;
            
            for (int j = 0; j < n; j++) {   //遍历二进制状态中的每一位(也可以看成检查列中的每一行)
                if ((i >> j) & 1) { //取出i的第j位数 检查是否为1 遇到1就可以检查上一段连续0的个数
                    if (cnt & 1) {  //若cnt为奇数 表示有奇数个连续的0
                        st[i] = false;
                    }
                    cnt = 0;    //cnt清0 重新计算下一段连续0的个数
                }
                else cnt++;  //遇到0计数加一
            }
            
            if (cnt & 1) st[i] = false; //最后一段连续0计数完成之后 再检查一次 
        }
        
        memset(f, 0, sizeof f);
        f[0][0] = 1;
        for (int i = 1; i <= m; i++) //从第2列开始 到第m+1列结束
            for (int j = 0; j < (1 << n); j++)
                for (int k = 0; k < (1 << n); k++)
                    if ((j & k) == 0 && st[j | k])
                        f[i][j] += f[i-1][k];
        
        cout << f[m][0] << endl;
        
    }
    
    return 0;
}
```



**状态压缩优化思路：**

事先预处理存储好所有合法状态，枚举出第`i-1`列所有状态中可以合法地转移到第`i`列状态`j`的状态，减少状态计算的第三重循环的枚举数，从而不用去枚举所有的状态再进行判断；

**状态压缩优化DP代码：**

```cpp
#include<iostream>
#include<cstring>
#include<algorithm>
#include<vector>
typedef long long ll;
using namespace std;
const int N = 15, M = 1 << 11;

ll f[N][M]; //状态转移方程可以划分为M种子状态 而状态有11位十进制,int不够存
bool st[M]; //表示每一种列状态的01分布是否合法
vector<ll> state[M]; //存储每一种状态的合法子状态
int n, m;

int main() {
    while (cin >> n >> m, n | m) {
        //预处理st[i] 遍历每一种二进制状态是否合法(连续的0是否是偶数个)
        for (int i = 0; i < (1 << n); i++) {   
            int cnt = 0;    //当前段连续0的个数
            st[i] = true;
            
            for (int j = 0; j < n; j++) {   //遍历二进制状态中的每一位(也可以看成检查列中的每一行)
                if ((i >> j) & 1) { //取出i的第j位数 检查是否为1 遇到1就可以检查上一段连续0的个数
                    if (cnt & 1) {  //若cnt为奇数 表示有奇数个连续的0
                        st[i] = false;
                    }
                    cnt = 0;    //cnt清0 重新计算下一段连续0的个数
                }
                else cnt++;  //遇到0计数加一
            }
            
            if (cnt & 1) st[i] = false; //最后一段连续0计数完成之后 再检查一次 
        }
        
        //预处理好所有状态的合法子状态
        for (int i = 0; i < (1 << n); i++) {
            state[i].clear();
            for (int j = 0; j < (1 << n); j++) {
                if ((i & j) == 0 && st[i | j])
                    state[i].push_back(j);
            }
        }
            
        memset(f, 0, sizeof f);
        f[0][0] = 1;
        for (int i = 1; i <= m; i++) //从第2列开始 到第m+1列结束
            for (int j = 0; j < (1 << n); j++)
                for (auto k : state[j]) //增强for循环 自动枚举状态j的所有合法子状态
                        f[i][j] += f[i-1][k];
        
        cout << f[m][0] << endl;
        
    }
    
    return 0;
}
```

### 6.2. 最短Hamilton图

**1. 状态表示**

**集合：**

`f[i][j]`表示所有从`0`走到`j`，走过的所有点是`i`的所有路径；

（这里将走过的所有点压缩成`i`，`i`可以看成一种状态，用二进制表示，1或0以及对应的位序表示该结点编号是否已经走过）

**属性：**

最小值（最短Hamiltion路径）

**2. 状态划分**

以`f[i][j]`中到达`j`的前驱结点`k`进行划分，根据前驱结点的种类进行分类；

由于`k`是`j`的上一个结点，那么上一步的路径状态就要从状态`i`回溯回去，由于`j`是最后一个结点，因此只需在`i`中把结点`j`剔除即可，即上一步的路径状态为：`i - {j}`；

```
f[i][j] = min(f[i - {j}][k] + w[k][j]);
```

---

**代码注意事项：**

1. 如何将`i`的二进制表示形式中的第`j`位修改为0？`i - (1 << j)`
2. 求的是状态最小值，因此需要先将所有状态初始化为最大值，然后将起点`f[1][0]`设为0，从初始状态第一个点的最小值慢慢收敛到全局状态都是最小值状态；

（`f[1][0]`表示从起点到起点，走过的路径为只有第零个点`0···1`，也就是初始状态）

```
memset(f, 0x3f, sizeof f);
f[1][0] = 0;
```

3. 在进程的虚拟空间中，静态变量或全局变量通常存储在堆中，而函数内部定义的变量通常存储在栈中，C++默认的栈空间大小为4MB；所以若把诸如`int f[M][N];`这样的变量数组存储在函数内部就会发生内存溢出，所以通常都会把这样的大变量大数组放在函数体外部；

例题：[AcWing 91. 最短Hamilton路径](https://www.acwing.com/problem/content/93/)

**最短Hamiltion图状态压缩代码：**

```cpp
#include<iostream>
#include<algorithm>
#include<cstring>
using namespace std;
const int N = 21, M = 1 << 20;

int f[M][N];    //f[i][j]表示从起点走到j, 所有经过的点为i的路径权重最小值
int w[N][N];
int n;

int main() {
    cin >> n;
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            cin >> w[i][j];
    
    memset(f, 0x3f, sizeof f);
    f[1][0] = 0;
    for (int i = 0; i < (1 << n); i++) {
        for (int j = 0; j < n; j++) {
            if ((i >> j) & 1)   //i中需要有走过j结点才行
                for (int k = 0; k < n; k++) {   //枚举所有可能的前驱结点
                    if ((i - (1 << j)) >> k & 1)    //前驱状态需要走过k结点才合法
                        f[i][j] = min(f[i][j], f[i - (1 << j)][k] + w[k][j]);
                }  
        }
    }
    
    cout << f[(1 << n) - 1][n - 1] << endl;
    return 0;
}
```



## 7. 树型DP

### 7.1. 没有上司的舞会

**1. 状态表示**

**集合：**

`f[u][0]`表示所有从以`u`为根的子树中选择，并且不选`u`这个点的方案；

`f[u][1]`表示所有从以`u`为根的子树中选择，并且选`u`这个点的方案；

**属性：**

max（树中的最大权值之和）

**2. 状态计算：**

+ 当不选`u`为这个点的时候，子树的根结点选或不选都可以，看哪个情况的权值更大，把所有子树的`max(f[u][0], f[u][2])`之和求出来，就是以`u`为根结点的树的最大权值；
+ 当选了`u`这个点的时候，其孩子结点就不能够再选，因此子树的根结点都要是0；

```
f[u][0] = max(f[s1][0], f[s1][1]) + max(f[s2][0], f[s2][1]) + ... ;
f[u][1] = f[s1][0] + f[s2][0] + ... + happy[u] ;
```

---

**代码注意：**

如何找到根结点的结点编号？

虽然题目在说明结点的父子关系时，结点编号是不固定的随机的，但是可以利用额外的布尔数组来记录每个结点是否有父结点；只需按序遍历结点编号，找到那个没有父结点的，那就肯定是根结点；

```
int root = 1;   
while (has_father[root]) 
    root ++;
```

例题：[AcWing 285. 没有上司的舞会](https://www.acwing.com/problem/content/287/)

**具体代码：**

```cpp
#include<iostream>
#include<algorithm>
#include<cstring>
using namespace std;
const int N = 6010;

int happy[N];
int f[N][2];
int h[N], ne[N], e[N], idx;
bool has_father[N];
int n;

void add(int a, int b) {
    e[idx] = b, ne[idx] = h[a], h[a] = idx++;
}

void dfs(int u) {
    f[u][1] = happy[u];    //初始化状态
    
    for (int i = h[u]; i != -1; i = ne[i]) {
        int j = e[i];
        dfs(j);
        
        f[u][0] += max(f[j][0], f[j][1]);
        f[u][1] += f[j][0] ;
    }
}

int main() {
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> happy[i];
    
    memset(h, -1, sizeof h);
    for (int i = 1; i < n; i++) {
        int a, b;
        cin >> a >> b;
        has_father[a] = true;
        add(b, a);  //父结点指向子结点
    }
    
    int root = 1;   //找到根结点的结点编号
    while (has_father[root]) root ++;
        
    dfs(root);
    
    cout << max(f[root][0], f[root][1]) << endl;
    return 0;
}
```



## 8. 记忆化搜索

动态规划用递归的方式编写，这里以滑雪问题为例；

### 8.1. 滑雪

**1. 滑雪问题状态表示：**

**集合**

`f[i][j]`表示所有从`(i, j)`开始滑的路径；

**属性**

最大值（滑雪的最大路径长度）

**2. 滑雪问题状态划分**

以`(i, j)`为起点，下一步可以分别走上下左右方向，那么就可以根据下一步的方向把`f[i][j]`分为四种情况取最值；

```
f[i][j] = max(f[i][j+1] + 1, f[i+1][j] + 1, f[i][j-1] + 1, f[i-1][j] + 1);
```

---

**注意事项：**

+ 下一步选的点需要比上一步点小，需要先进行一下判断再走下一步

```
if (a <= n && a >= 1 && b <= m && b >= 1 && h[a][b] < h[x][y])
```

+ 因为是一直走下去的没有折回，路径不能出现环，所以每次走下一步只能走之前没有走过的点；

```
if (f[x][y] != -1) return f[x][y];
```

例题：[AcWing 901. 滑雪](https://www.acwing.com/problem/content/901/)

**滑雪问题记忆化搜索代码：**

```cpp
#include<iostream>
#include<algorithm>
#include<cstring>
using namespace std;
const int N = 310;
int f[N][N];    //表示从(i,j)开始滑的最长滑雪长度
int h[N][N];
int n, m;

int dp(int x, int y) {
    if (f[x][y] != -1) return f[x][y];  //若f[x][y]已经被计算过 就直接返回（为了避免出现环）
    
    f[x][y] = 1;  //初始化 只滑过自己一个点
    int dx[4] = {1, 0, -1, 0}, dy[4] = {0, -1, 0, 1};
    for (int i = 0; i < 4; i++) {
        int a = x + dx[i], b = y + dy[i];   //上下左右后的坐标
        if (a <= n && a >= 1 && b <= m && b >= 1 && h[a][b] < h[x][y])
            f[x][y] = max(f[x][y], dp(a, b) + 1);
    }
    
    return f[x][y]; 
}

int main() {
    cin >> n >> m;
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            cin >> h[i][j];
            
    memset(f, -1, sizeof f);    //滑雪长度肯定是正整数 初始值设为-1就行
    int res = 0;    
    for (int i = 1; i <= n; i++)    //遍历从每一个点出发后的最大滑雪长度
        for (int j = 1; j <= m; j++)
            res = max(res, dp(i, j));
        
    cout << res << endl;
    return 0;
}
```



## Reference

1. [动态规划 - OI Wiki](https://oi-wiki.org/dp/knapsack/)
2. [yxc背包九讲问题](https://www.bilibili.com/video/BV1qt411Z7nE/?p=1&vd_source=31a7a58200eb14abf17c7774dbd2c39a)
3. [dd大牛的《背包九讲》](https://www.cnblogs.com/jbelial/articles/2116074.html)
4. [【DP专辑】ACM动态规划总结](https://blog.csdn.net/cc_again/article/details/25866971)
5. [Acwing代码汇总](https://www.acwing.com/activity/content/activity_person/content/45680/1/)
