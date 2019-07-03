# LazyScript
按需加载 JavaScript (非模块), 部分参考 [sea.js 3.0.3](https://github.com/seajs/seajs)

`LazyScript.js` 全局生成 `ls` 对象.

流程描述:

- 使用 ls.load 开始加载;
- ls.load 的参数(字符串或函数)被转换为 Script 对象, 称为 "子任务";
- 如果 ls.load 所在脚本不是其他 ls.load 的子任务, 则立即开始自身子任务的加载;
- 否则, 等待所在子任务完成, 然后开始自身子任务的加载;



## ls.config()

参数配置, 参考 [sea.js](https://github.com/seajs/seajs)

- 仅保留 sea.js 的 vars 配置方式, 取消其他, 如

  ```js
  LazyScript.config({
  	vars: {
      'src': 'src',
      'min':'src.min',
    }
  })
  // 使用:
  LazyScript.load('{min}/jquery', '{src}/custom');
  ```

- 新加 `suffix` 选项, 用于添加统一的后缀, 后缀位于文件名和 .js 之间;

- 新加 `polyfill` 回调, 用于自定义 `polyfill` 加载方式, 参数为 `features` 数组;



## ls.preload()

手动指定哪些脚本已加载, 如 `ls.preload('jquery')`



## ls.load()

主函数, 用于加载 script;

- 参数可以是字符串或函数, 也可以将它们组合成数组;

- 字符串除了可以使用 sea.js 或 require.js 同款字符串之外, 还添加了对 polyfill.io 的支持, 如:

  ```javascript
  'polyfill:Array.prototype.fill'
  /* 转换为 */
  'https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.fill'
  
  'polyfill:HTMLPictureElement'
  /* 转换为 */
  'https://polyfill.io/v3/polyfill.min.js?features=HTMLPictureElement'
  ```

- 如果参数中出现了多个 `polyfill`, 它们会自动组合, 如:

  ```javascript
  'polyfill:Array.prototype.fill', 'polyfill:HTMLPictureElement'
  /* 转换为 */
  'https://polyfill.io/v3/polyfill.min.js?features=HTMLPictureElement%2CArray.prototype.fill'
  ```

  **Polyfill Feature** (`polyfill:`后面的部分, 如`HTMLPictureElement`) 对大小写敏感

- 字符串或函数都会被转成 Script 对象, 其中, 函数类 Script 会对在它之前的 Script 形成依赖



## ls.noConflict()

转让 `ls` 使用权



## ls.resolve()

解析字符串为路径, 测试用



## ls.data

存放设置数据