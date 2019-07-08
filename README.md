# LazyScript
路径解析及全局设置部分参考自 [sea.js](https://github.com/seajs/seajs)

**LazyScript.js *不是* 模块解决方案!**

LazyScript.js 用于按需加载 JavaScript ( 模块定义文件需要先编译 ) , 使用环境为 **浏览器**


## 使用

### 1. 引入

```html
<script src="path/to/LazyScript.js" id="lazyscript"></script>
```



### 2. 基本

```javascript
/**
 * 1. 使用 LazyScript.load (以下称为"加载任务") 开始加载 js 文件(以下称为"目标文件")或 js 代码(回调函数)
 * 2. 允许出现多个加载任务
 * 3. 允许加载任务与普通代码混杂
 */

// 加载 a.js 和 b.js
LazyScript.load('a', 'b')

// 加载 c.js 和 d.js, 然后执行回调
LazyScript.load('c', 'd', function callback(global){ /* ... */ })

// 普通代码
console.log('LazyScript')

// 注意: 
//  1. 目标文件是并行加载的
//   - 这包括同一加载任务的不同目标文件, 以及同级加载任务的不同目标文件! 
//   - 以上面代码为例, a, b, c, d 分属于两个不同的加载任务, 但这两个任务是同级的, 
//   - 所以, a, b, c, d 四个文件将同时开始加载.
//     
//  2. 回调函数依赖于同一加载任务中先于它出现的目标文件
//   - 仍以上面代码为例, 函数 callback 会在 c 和 d 都加载完成后执行, 
//   - 如果任意一个加载失败, callback 都不会执行.

```



### 3. 串联使用

```javascript
// 假设 a 依赖 b, 而 b 又依赖 c

/* a.js */
LazyScript.load('b', function(global){ 
  console.log(global.bar) // foobar
})

/* b.js */
LazyScript.load('c', function(global){
  global.bar = 'foobar'
})

```



### 4. 预加载

```javascript
/**
 * 预加载用于手动指定哪些代码已存在;
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
//  1. 未被请求, 且属于同一个加载任务;
//  2. 未被请求, 且分属于同级的加载任务, 且所在 js 是目标文件 (通过加载任务加载的);

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
