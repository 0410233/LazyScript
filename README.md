# LazyScript
按需加载 JavaScript (非模块), 使用环境为**浏览器**. 

部分参考 [sea.js](https://github.com/seajs/seajs)



## 使用

### 1. 引入

```html
<script src="path/to/LazyScript.js" id="lazyscript"></script>
```



### 2. 基本

```javascript
/**
 * 1. 允许出现多个 ls.load()
 * 2. 允许 ls.load() 与普通代码混杂
 */

// 不带回调
ls.load('foo', 'bar')

// 带回调
ls.load('jquery', function(global){ /* ... */ })

// 普通代码
console.log('LazyScript')

// 如果有多个 ls.load 带有回调, 无法保证回调执行顺序与 ls.load 出现顺序一致!

```



### 3. 串联使用

```javascript
/* foo.js */
ls.load('bar', function(global){ 
  console.log($.bar) // foobar
})

/* bar.js */
ls.load('jquery', function(global){
  $.bar = 'foobar'
})

```



###4. 预加载

```javascript
/**
 * 预加载用于手动指定哪些 js 已存在;
 * 假设我们将常用的 jquery.js 合并到了 LazyScript.js 中,
 * 为了通知 LazyScript "jquery.js" 已存在, 就需要使用预加载:
 */
ls.preload('jquery')

```



### 5. Polyfill

```javascript
/**
 * 1. 使用 'polyfill:<FeatureName>' 从 polyfill.io 请求 polyfill
 * 2. 允许同时请求多个
 */
ls.load('polyfill:Promise', 'polyfill:Map', 'polyfill:Object.is')

// 多个 polyfill 参数会被尽力合并成一个请求
// 比如上面的例子, 三个 Feature 会被合并, 最终的请求如下:
// https://polyfill.io/v3/polyfill.min.js?features=Promise%2CMap%2CObject.is

// 之所以说"尽力", 是因为只有符合下述条件之一的 Polyfill Feature 才能被合并:
//  1. 未被请求, 且出现在同一个 ls.load 中;
//  2. 未被请求, 且出现在同级的 ls.load 中, 且所在 js 文件是通过 ls.load 加载的;

// polyfill 请求方式可通过 ls.config() 修改, 详见 "配置" 部分

```



## 配置

### 1. 路径解析

```javascript

ls.config({
  /**
   * 别名配置仅保留了 sea.js 中的 vars 配置方式,
   * 使用时: ls.load('{min}/jquery', '{src}/custom');
   */
	vars: {
    'src': 'src',
    'min': 'src.min',
  },
  
  /**
   * 使用 base 更改基准目录
   *  - 如果不指定, 则使用入口文件 (LazyScript.js) 所在目录;
   *  - 如果指定的是相对路径, 则相对的是入口文件所在目录;
   *  - 如果 ls.load 参数以 '^' 开头, 则忽略 base
   */
  base: 'js/src',
  
  /**
   * 使用 suffix 添加后缀
   *  - 后缀会被添加在文件名与文件后缀名之间;
   *  - 如果 ls.load 参数以 '$' 或 '#' 结束, 则忽略 suffix
   */
  suffix: '.min',
})

```



### 2. Polyfill 配置

```javascript
ls.config({
  /**
   * 使用 polyfill 属性自定义 polyfill 获取方式
   * 属性值为函数, 函数的参数为 features 数组, 函数的返回值类型为字符串
   * 以下为默认值:
   */
  polyfill: function(features) {
    return 'https://polyfill.io/v3/polyfill.min.js?features=' + features.join('%2C');
  }
})
```



## 其他

### 1. noConflict

```javascript
// 使用 ls.noConflict() 转让 ls 使用权
var LazyScript = ls.noConflict()

```



###2. resolve

```javascript
// 解析字符串为路径, 测试用
ls.resolve('jquery');

```