# LazyScript
*路径解析及全局设置部分参考自 [sea.js](https://github.com/seajs/seajs)*

LazyScriptJS 用于按需加载 js (必须是直接可用的 js, 如果是模块定义文件, 需要先转换), 使用环境为 **浏览器**, 支持依赖解析, polyfill加载 (使用 [polyfill.io](https://polyfill.io/)), 任务回调等.

**LazyScriptJS  *不是* 模块解决方案!**

## 主文件

共有三个主文件:

1. `lazyscript.js` 未压缩版, 默认加载未压缩的 js 文件;
2. `lazyscript.min.js` 压缩版, 默认加载压缩的 js 文件 (带 `.min.js` 后缀);
3. `lazyscript.jquery.min.js` 带 `jquery` 压缩版, 默认加载压缩的 js 文件, 且 `LazyScript.data.preload = 'jquery'` ( 详见设置部分 )




## 使用

### 1. 引入

```html
<script src="path/to/lazyscript.js" id="lazyscript"></script>
<!-- 或 -->
<script src="path/to/lazyscript.min.js" id="lazyscript"></script>
<!-- 或 -->
<script src="path/to/lazyscript.jquery.min.js" id="lazyscript"></script>

```



### 2. 基本

```javascript
/**
 * 1. 使用 LazyScript.load (下称"加载任务") 开始加载组件
 *    - 组件共有三种: "文件组件", "函数组件"和"polyfill组件"
 * 2. 允许多个加载任务
 * 3. 允许加载任务与普通代码混杂
 */

// 加载 a.js 和 b.js
LazyScript.load('a', 'b')

// 加载 c.js 和 d.js, 然后执行回调(函数组件)
LazyScript.load('c', 'd', function(global){
  /* ... */ 
})

// 普通代码
console.log('LazyScript')

// 注意: 
//  1. 文件组件是并行加载的
//   - 这包括同一加载任务的不同文件组件, 以及同级加载任务的不同文件组件! 
//   - 以上面代码为例, a, b, c, d 分属于两个不同的加载任务,
//   - 但这两个任务是同级的, 所以四个组件会同时开始加载.
//     
//  2. 函数组件依赖于同一加载任务中先于它出现的组件(文件或函数或polyfill)
//   - 以上面第二个加载任务为例, 回调函数会在 c 和 d 都加载完成后执行, 
//   - 且任意一个加载失败, 回调都不会执行.

```



### 3. 串联使用

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
 * 使用 'polyfill:<FeatureName>' 从 polyfill.io 请求 polyfill 组件
 */
LazyScript.load('polyfill:Promise', 'polyfill:Map', 'polyfill:Object.is')

// 多个 polyfill 组件会被尽力合并成
// 比如上面的例子, 三个参数最终会合并为如下请求:
// https://polyfill.io/v3/polyfill.min.js?features=Promise%2CMap%2CObject.is

// "尽力"的意思是, 只有符合下述条件之一的 polyfill 组件才能被合并:
//  1. 未被请求, 且属于同一加载任务;
//  2. 未被请求, 且分属同级加载任务, 且任务宿主是通过 LazyScript.load 加载的文件组件;

// polyfill 获取方式可通过 LazyScript.config() 修改, 详见 "配置" 部分

```



## 配置

### 1. 文件名解析

```javascript

LazyScript.config({
  /**
   * 别名配置仅保留了 sea.js 中的 vars 配置方式,
   */
  vars: {
    'src': 'src',
    'min': 'src.min',
  },
  // 用例: LazyScript.load('{min}/jquery', '{src}/custom');
  
  /**
   * 指定从哪里加载文件组件, 默认值为 'modules/'
   *  - 如果指定的是相对路径, 则路径起点是主文件所在目录;
   *  - 如果组件名以 '^' 开头, 解析时忽略 base
   */
  base: 'modules/',
  
  /**
   * 后缀位于文件名和扩展名之间, 如: 文件名{后缀}.js, 默认值为空;
   * 当使用 lazyscript.min.js 或 lazyscript.jquery.min.js 时, 默认值为 ".min";
   * 如果组件名以 '$' 或 '#' 结尾, 解析时忽略 suffix;
   */
  suffix: '',
  
})

```



### 2. 预载

```javascript
LazyScript.config({
  /**
   * 预载, 通知 LazyScript 哪些组件已(手动)加载, 默认值为空数组;
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
