# LazyScript
LazyScript.js ***不是*** 模块解决方案!

LazyScript.js 用于按需加载 JavaScript ( 正经的 js 文件或代码, 不能是定义模块的 js ) 

使用环境为 **浏览器**

部分参考 [sea.js](https://github.com/seajs/seajs)



## 使用

### 1. 引入

```html
<script src="path/to/LazyScript.js" id="lazyscript"></script>
```



### 2. 基本

```javascript
/**
 * 1. 允许出现多个 LazyScript.load()
 * 2. 允许 LazyScript.load() 与普通代码混杂
 */

// 加载 a.js 和 b.js, 不带回调
LazyScript.load('a', 'b')

// 带回调
LazyScript.load('a', 'b', function(global){ /* ... */ })

// 普通代码
console.log('LazyScript')

// 如果有多个 LazyScript.load 带有回调, 无法保证回调执行顺序与 LazyScript.load 出现顺序一致!

```



### 3. 串联使用

```javascript
// a.js 依赖于 b.js, 而 b.js 又依赖于 c.js

/* a.js */
LazyScript.load('b', function(global){ 
  console.log($.bar) // foobar
})

/* b.js */
LazyScript.load('c', function(global){
  $.bar = 'foobar'
})

```



### 4. 预加载

```javascript
/**
 * 预加载用于手动指定哪些 js 已存在;
 * 假设我们将常用的 jquery 合并到了 LazyScript 中,
 * 为了通知 LazyScript 已存在 jquery, 就需要使用预加载:
 */
LazyScript.preload('jquery')

```



### 5. Polyfill

```javascript
/**
 * 1. 使用 'polyfill:<FeatureName>' 从 polyfill.io 请求 polyfill
 * 2. 允许同时请求多个
 */
LazyScript.load('polyfill:Promise', 'polyfill:Map', 'polyfill:Object.is')

// 多个 polyfill 参数会被尽力合并成一个请求
// 比如上面的例子, 三个 Feature 会被合并, 最终的请求如下:
// https://polyfill.io/v3/polyfill.min.js?features=Promise%2CMap%2CObject.is

// 之所以说"尽力", 是因为只有符合下述条件之一的 Feature 才能被合并:
//  1. 未被请求, 且出现在同一个 LazyScript.load 中;
//  2. 未被请求, 且出现在同级的 LazyScript.load 中, 且所在 js 文件是通过 LazyScript.load 加载的;

// polyfill 获取方式可通过 LazyScript.config() 修改, 详见 "配置" 部分

```



## 配置

### 1. 路径解析

```javascript

LazyScript.config({
  /**
   * 别名配置仅保留了 sea.js 中的 vars 配置方式,
   */
  vars: {
    'src': 'src',
    'min': 'src.min',
  },
  // 使用时: LazyScript.load('{min}/jquery', '{src}/custom');
  
  /**
   * 使用 base 更改基准目录
   *  - 如果不指定, 则使用入口文件 (LazyScript.js) 所在目录;
   *  - 如果指定的是相对路径, 则相对的是入口文件所在目录;
   *  - 如果路径以 '^' 开头, 则忽略 base
   */
  base: 'js/src',
  
  /**
   * 使用 suffix 添加后缀
   *  - 后缀会被添加在文件名与文件后缀名之间;
   *  - 如果路径以 '$' 或 '#' 结尾, 则忽略 suffix
   */
  suffix: '.min',
})

```



### 2. Polyfill 配置

```javascript
LazyScript.config({
  /**
   * 使用 polyfill 属性自定义 polyfill 获取方式
   * 属性值为函数, 函数参数为 features 数组, 函数返回值类型为字符串
   * 参考以下默认值:
   */
  polyfill: function(features) {
    return 'https://polyfill.io/v3/polyfill.min.js?features=' + features.join('%2C');
  }
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
