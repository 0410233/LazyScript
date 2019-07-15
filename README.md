# LazyScript
*路径解析及全局设置部分参考自 [sea.js](https://github.com/seajs/seajs)*

**LazyScript  *不是* 模块解决方案!**  LazyScript 用于按需加载 js 组件.  组件必须是直接可用的 js 代码, 如果是模块定义代码, 或 es6 代码, 需要先转换.

**组件**共有三种:

1. 文件组件: 本地 js 文件, cdn 文件链接等
2. Polyfill 组件: 使用 Polyfill Feature 从 [polyfill.io](https://polyfill.io/) 获取的 polyfill
3. 函数组件: 匿名函数

使用环境为 **浏览器**. 支持依赖解析.



## 主文件

主文件是指执行 `LazyScript` 主体代码的文件. 它们在全局生成 `LazyScript` 对象.

默认的主文件包括:

1. `dist/lazyscript.js` 未压缩版, 默认加载未压缩的文件组件;
2. `dist/lazyscript.min.js` 压缩版, 且默认加载压缩的文件组件 (带 `.min.js` 后缀);
3. `dist/lazyscript.jquery.min.js` 带 `jquery` 压缩版, 默认加载压缩的文件组件, 且已预载 `jquery` ("预载"的解释见"配置"部分)




## 使用

### 1. 引入主文件

```html
<!-- 推荐: -->
<script src="path/to/lazyscript.jquery.min.js" id="lazyscript"></script>

<!-- 或 -->
<script src="path/to/lazyscript.min.js" id="lazyscript"></script>

<!-- 或 -->
<script src="path/to/lazyscript.js" id="lazyscript"></script>

```



### 2. 基本

```javascript
/**
 * 1. 使用 LazyScript.load (下称"加载器") 加载组件
 * 2. 允许多个加载器
 * 3. 允许加载器与普通代码混杂
 */

// 加载文件组件 a.js 和 b.js
LazyScript.load('a', 'b')

// 加载文件组件 c.js 和 d.js, 和函数组件(匿名函数)
LazyScript.load('c', 'd', function(global){
  /* 函数组件 */
})

// 普通代码
console.log('LazyScript')

// 注意: 
//  1. 文件组件是并行加载的
//   - 这包括同一加载器的不同文件组件, 以及同级加载器的不同文件组件! 
//   - 以上面代码为例, a, b, c, d 分属不同加载器,
//   - 但这两个加载器是同级的, 所以四个文件会同时开始加载.
//     
//  2. 函数组件依赖于同一加载器中先于它出现的组件(所有类型)
//   - 以上面第二个加载器为例, 函数会在 c 和 d 都加载完成后执行, 
//   - 且任何一个失败, 函数都不会执行.

```



### 3. 依赖解析

```javascript
// 假设 a 依赖 b, b 又依赖 c

/* a.js */
LazyScript.load('b', function(global){ 
  console.log(global.bar) // foobar
})

/* b.js */
LazyScript.load('c', function(global){
  global.bar = 'foobar'
})

```



### 4. Polyfill

```javascript
/**
 * polyfill 组件形如 "polyfill:FeatureName", 例:
 */
LazyScript.load('polyfill:Promise', 'polyfill:Map', 'polyfill:Object.is')

// 多个 polyfill 组件会被尽力合并
// 比如上面的例子, 三个组件最终会合并为如下请求:
// https://polyfill.io/v3/polyfill.min.js?features=Promise%2CMap%2CObject.is

// "尽力"的意思是, 只有符合下述条件之一才能被合并:
//  1. 未被请求, 且属于同一加载器;
//  2. 未被请求, 且分属同级加载器, 且加载器的宿主(所在 js)是一个文件组件;

// polyfill 组件获取方式可通过 LazyScript.config() 修改, 详见 "配置" 部分

```



## 配置

### 1. 文件名解析

```javascript
// 当在加载器中指定一个文件组件, 如 LazyScript.load('demo'), 
// LazyScript 会将 'demo' 转换为一个文件链接, 这个链接将用于新建 Script 标签的 src 属性.
// 这个转换过程就叫做文件名解析. 文件名解析主要用于文件组件.
// 以下三个属性用于定制该解析过程:

LazyScript.config({
  /**
   * vars, 插值配置; 等同于 sea.js 中的 vars 配置, 默认为null;
   */
  vars: {
    'src': 'src',
    'min': 'src.min',
  },
  // 用例: LazyScript.load('{min}/jquery', '{src}/custom');
  
  /**
   * base, 起始目录; 指定从哪里加载文件组件, 默认值为 'modules/';
   * - 如果指定的是相对路径, 则路径起点是主文件所在目录;
   * - 如果组件名以 '^' 开头, 解析时将忽略 base
   */
  base: 'modules/',
  
  /**
   * suffix, 后缀; 位于文件名和扩展名之间, 如: 文件名{suffix}.js, 默认值为空;
   * - 当使用 lazyscript.min.js 或 lazyscript.jquery.min.js 时, 默认值为 ".min";
   * - 如果组件名以 '.js' 或 '#' 或 '$' 结尾, 解析时将忽略 suffix;
   */
  suffix: '',
  
})
```



### 2. 预载

```javascript
// 假如出于某种原因, 有些代码你决定不通过 LazyScript 加载, 而是自己手动引入,
// 这时候就可以使用"预载"功能, 通知 LazyScript 这些代码已加载.
// 使用预载很简单, 你只需要为引入的代码起一个名字, 然后加入到 preload 数组即可.
// 在 LazyScript 内部, 这个名字会被立即用来创建一个组件, 且组件会被直接标记为已完成,
// 任何依赖于该组件的其他组件都会立刻收到该组件已完成的消息.

LazyScript.config({
  /**
   * preload, 预载; 通知 LazyScript 哪些组件已(手动)加载, 默认值为空数组;
   * 当使用 lazyscript.jquery.min.js 时, 默认值为['jquery'];
   */
  preload: [],
  
})
```



### 3. Polyfill 配置

```javascript
LazyScript.config({
  /**
   * 使用 polyfill 属性自定义 polyfill 组件获取方式
   * 属性值为函数, 函数参数为 features 数组, 函数返回一个URL
   * 参考以下默认值:
   */
  polyfill: function(features) {
    return 'https://polyfill.io/v3/polyfill.min.js?features=' + features.join('%2C');
  },
  
})

```



## 其他

### 1. noConflict

```javascript
// 使用 LazyScript.noConflict() 转让 LazyScript 使用权
var js = LazyScript.noConflict()

```



### 2. resolve

```javascript
// 解析字符串为路径, 测试用
LazyScript.resolve('jquery');

```
