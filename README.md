# LazyScriptJS
*路径解析及全局设置部分参考自* [sea.js](https://github.com/seajs/seajs)

**特别说明**: LazyScript 不是模块解决方案 ! 



## 简介

LazyScriptJS 用于按需加载 js 代码( 代码必须是直接可用的, 如果是模块定义, 或者 es6 代码, 需要先转换, LazyScriptJS 本身没有转换功能 ). 使用环境为 **浏览器**, 支持依赖解析. 

根据来源和处理方式的不同, LazyScriptJS 将待加载的 js 代码( 下文统称 "**组件**" )分为三类:

1. 文件组件: 本地 js 文件, cdn 文件链接等
2. Polyfill 组件: 使用 Polyfill Feature 从 [polyfill.io](https://polyfill.io/) 获取的 polyfill (本质上其实与"文件组件"是相同的, 之所以单独出来是因为处理方式不同: Polyfill 组件支持合并)
3. 函数组件: 函数

组件使用 `LazyScript.load()` 方法加载, 称为 "**加载**器", 如: `LazyScript.load('jquery')`. 加载器的参数称为 "**组件id**", 如上例的 `'jquery'`.  

根据组件类型的不同, 组件id也分为三种:

1. 文件组件, 组件id为字符串, 如 `'jquery'`,  `'underscore.js'`, `'https://code.jquery.com/jquery-3.4.1.min.js'` 等, 不区分大小写.
2. Polyfill 组件, 组件id为以 `'polyfill:'` 开头的字符串, 如: `'polyfill:Object.is'`, 冒号后面区分大小写.
3. 函数组件, 组件id 为函数.




## 使用

### 1. 引入 LazyScript

```html
<!-- 
	压缩版: 
	默认加载压缩的文件组件(带 .min.js 后缀). 推荐!
-->
<script src="path/to/lazyscript.min.js" id="lazyscript"></script>

<!-- 
	带 jquery 压缩版: 
	默认加载压缩的文件组件, 且已预载jquery("预载"的解释见"配置"部分)
-->
<script src="path/to/lazyscript.jquery.min.js" id="lazyscript"></script>

<!-- 
	未压缩版: 
	默认加载未压缩的文件组件, 推荐开发和测试时使用.
-->
<script src="path/to/lazyscript.js" id="lazyscript"></script>

```



### 2. 加载文件组件

```javascript
// 加载 a.js
LazyScript.load('a')

```



### 3. 加载 Polyfill 组件

```javascript
// https://polyfill.io/v3/polyfill.min.js?features=Promise%2CObject.is
LazyScript.load('polyfill:Promise', 'polyfill:Object.is');

// 多个 polyfill 组件在符合下述条件之一时会被合并:
//  1. 未被请求, 且属于同一加载器;
//  2. 未被请求, 且分属同级加载器, 且加载器的宿主(所在 js)是一个文件组件;

// polyfill 组件的获取方式可通过 LazyScript.config() 修改, 详见 "配置" 部分

```



### 4. 加载函数组件

```javascript
// 加载匿名函数
LazyScript.load(function(global){
	// ...
});

// 加载具名函数
function foo(){
  // ...
}
LazyScript.load(foo);

```



### 5. 综合加载

```javascript
// 允许同一代码中出现多个加载器, 允许加载器和普通代码混杂

// 加载 a.js, b.js
LazyScript.load('a', 'b');

// 加载 c.js, Promise polyfill, 然后执行函数
LazyScript.load('c', 'polyfill:Promise', function(global){
  // ...
});

console.log(LazyScript);

// 注意: 
// 1. 文件组件是并行加载的!
//   - 这包括同一加载器的不同文件组件, 以及同级加载器的不同文件组件! 
//   - 以上面代码为例: a, b, c 分属两个不同的加载器, 但两个加载器是同级的, 
//   - 所以三个文件会同时开始加载.
//     
// 2. 函数组件依赖于同一加载器中先于它出现的组件(所有类型)
//   - 以上面第二个加载器为例, 函数会在 c 和 polyfill:Object.is 都加载完成后执行, 
//   - 且任何一个失败, 函数都不会执行.
```



### 6. 依赖解析

假设 a.js 依赖 b.js, b.js 又依赖 c.js

在页面中:

```html
<script src="path/to/lazyscript.js" id="lazyscript"></script>
<script>
	LazyScript.load('a');
</script>
```

a.js :

```javascript
LazyScript.load('b', function(global){ 
  console.log(global.bar) // foobar
})
```

b.js :

```javascript
LazyScript.load('c', function(global){
  global.bar = 'foobar'
})
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
