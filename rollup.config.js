import babel from "rollup-plugin-babel";

// rollup 可以导出一个对象，作为打包的配置文件
export default {
  input:'./src/index.js',//入口
  output:{ //出口
    file:'./dist/vue.js',//导出的文件位置和名称
    name:'Vue',//在全局增加一个 global.Vue 对象
    format:'umd',//可以使用 cjs-commonjs模式，iife-自执行函数，esm-es6模块，umd-兼容模式（cjs，esm）
    sourcemap:true,//开启源码调试,
  },
  plugins:[
    //使用 babel 将高级语法转化成低级语法
    babel({
      exclude:'node_modules/**',//排除 node_modules
    })
  ]
}