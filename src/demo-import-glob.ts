const modules = import.meta.glob('./dir/*.ts') // build: foo.js bar.js 会被抽离出单独的 js 文件
//  code produced by vite
// const modules = {
//   './dir/foo.js': () => import('./dir/foo.js'),
//   './dir/bar.js': () => import('./dir/bar.js')
// }
for (const path in modules) {
    modules[path]().then((mod) => {
        console.log(path, mod)
    })
}


const syncModules = import.meta.globEager('./dir/*.ts') // build: foo.js bar.js 不会被抽离出单独的 js 文件
// code produced by vite
// import * as __glob__0_0 from './dir/foo.js'
// import * as __glob__0_1 from './dir/bar.js'
// const syncModules = {
//   './dir/foo.js': __glob__0_0,
//   './dir/bar.js': __glob__0_1
// }

for (const path in syncModules) {
    console.log(path, syncModules[path])
}
console.log(syncModules);

console.log(import.meta.env)