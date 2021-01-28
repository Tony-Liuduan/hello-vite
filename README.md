# hello-vite

## 引用
> https://segmentfault.com/a/1190000025137845?_ea=67042700#item-2-4
## vite?
* 不需要编译成 commonjs, 针对现代浏览器, 浏览器去解析 ES Modules (`<script type=module>`)
* 开发不需要打包合并, 按需编译, 开发环境每个 js 文件都是单独的请求 (HTTP/2)
* 开发支持热更新, 按需加载, 真的
* 开发基于 esbuild 构建
* 生产 Rollup 打包, 仍会打包成一个 commonJS 格式的 bundle 进行调用

## 哪里好?
* 启动速度快
* 热更新速度快, 只重新请求修改代码的js, 按需请求

## 哪里弱?
* es module 模块不能直接使用生产环境（兼容性问题）
* 生产环境使用 rollup 打包会造成开发环境与生产环境的不一致
* 很多 第三方 sdk 没有产出 ems 格式的的代码，这个需要使用 babel 特殊处理转换 commonjs -> esm
* bundleless(dev) + bundle(production) 


## diff

| diff        | webpack                                    | vite                                                                                            |
|-------------|--------------------------------------------|-------------------------------------------------------------------------------------------------|
| build       | prebuild - commonjs                        | no prebuild - esm                                                                               |
| bundle      | build all to bundle, **just one index.js** | just build need, mutiple js                                                                     |
| hmr         | build all to bundle, reload                | http catch, no-bundle (HTTP/2), reload                                                          |
| production  | tree-shaking, lazy-loading, splitting      | tree-shaking, lazy-loading, common-chunk to bundle                                              |
| chrome      | -                                          | only modern browsers                                                                            |
| ts          | ts-loader by tsc                           | only transpilation by [esbuild](https://github.com/evanw/esbuild), no-checking, checking by tsc |
| css         | sass-loader                                | next css ??                                                                                     |
| file        | file-loader                                | ??                                                                                              |
| async-chunk | Entry ---> A ---> C                        | Entry ---> (A + C)                                                                              |
| env         | plugin                                     | .env.production                                                                                 |


## 构建工具对比

### webpeck

将所有 js 文件构建成一个个 moudle, 再进行合并成 chunk
开发模式时合成一个 bundle.js, 一个文件改动要重新去构建合成

> 因为浏览器不支持 commonjs, esm又有兼容性问题，打包成一个巨型的bundle.js文件是较好的方案

### Rollup
从一个入口文件开始，将所有使用到的模块文件都打包到一个最终的发布文件中（极其适合构建一个工具库)
* tree-shaking
* 它使用ES6的模块标准，这意味着你可以直接使用import和export而不需要引入babel

### vite
> ES Module 已经覆盖了超过90%的浏览器
* 基于浏览器支持 esm
* 跳过打包的过程，当需要某个模块时再通过请求获取
* dev:   import from '/xx' 会发送网络请求, 编译后的都是 '/xx' 这个路径, 所以都是网络请求
    - 因为都是加载的本地文件，所以速度很快
    - import 回去等待这个请求结束, 才向下执行后面的语句
* build: import from './xx' 相对路径, 不发送请求, 在本地加载 
    - `import {r as e, l as t, a as o} from "./vendor.0cc10628.js";`

#### 基本原理:
启动 koa server, 拦截 ES Module 请求, 通过请求的路径找到目录下对应的文件做一定的处理最终以 ES Modules 格式返回给客户端

#### node_modules 模块的处理
* vender cache at node_modules/.vite
* http://localhost:3000/node_modules/.vite/react/index.js?v=c2c94063


#### 内联 module
* `<script type="module">console.log('script1');</script>`
* http://localhost:3000/index.html?html-proxy&index=0.js

#### 构建 ts
* esbuild <font color='red'>怎么就快了???</font>

#### 热更新
* react 需要浏览器 reload page ?? 什么鬼
* ws://localhost:3000/, ws 协议
* http://localhost:3000/@vite/client 客户端代码
* client-server 建立 web-socket 通信
* node 检测项目代码修改, 当代码修改后 socket 通知浏览器请求对应的资源


#### 静态资源
处理成 esm .js 返回, 比如请求路径是.css, 返回内容是 esm

### snowpack
首次提出利用浏览器原生 ESM 能力
vite 借鉴 snowpack
@pika/pack: pipeline, 有点类似 gulp

### esbuild
支持如babel, 压缩等的功能，他的特点是快(比 rollup 等工具会快上几十倍)！
*  go 作为底层语言

## ts

esbuild ?? 有缺陷 const enum ??

isolatedModules: true 

isolatedModules 表示所有文件都应该是一个单独的模块
不能在隔离模块中使用const枚举的原因相同

## import.meta.glob

方便的多模块导入
### async import glob

* 这是仅Vite的功能，不是Web或ES标准
* 全局模式必须是相对的，并以开头.

```ts
const modules = import.meta.glob('./dir/*.ts')
// foo.js bar.js 会被抽离出单独的 js 文件

// 等同于下面的代码
const modules = {
  './dir/foo.js': () => import('./dir/foo.js'),
  './dir/bar.js': () => import('./dir/bar.js')
}
```

### sync import glob
```ts
const modules = import.meta.globEager('./dir/*.ts')
// foo.js bar.js 不会被抽离出单独的 js 文件

// 等同于下面的代码
import * as __glob__0_0 from './dir/foo.js'
import * as __glob__0_1 from './dir/bar.js'
const modules = {
  './dir/foo.js': __glob__0_0,
  './dir/bar.js': __glob__0_1
}
```

## script: module async defer

> https://gist.github.com/jakub-g/385ee6b41085303a53ad92c7c8afd7a6

![img](https://user-images.githubusercontent.com/1437027/49294708-06ca1e00-f4b4-11e8-86b5-3f843ab98d0b.png)


## lint: modulepreload preload prefech
> https://zhuanlan.zhihu.com/p/144476736
* Link preload：在资源响应头或者主文档头部标记出需要预加载的资源，内核会根据一定规则和优先级去提前加载这些资源，
* Link modulepreload：类似于Link preload，但它是模块级的预加载，除了可以预加载模块的依赖资源，还可以提前编译和解析模块JS。
* Link prefetch：域名提前寻址。


## TODO: 

* build dev ?? 怎么搞
* esbuild ?? https://github.com/evanw/esbuild