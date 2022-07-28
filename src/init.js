import { compileToFunction } from "./compiler";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

/**
 * 初始化函数，就是为Vue添加_init方法
 * @param { Vue构造函数 } Vue 
 */
export function initMixin(Vue){
  Vue.prototype._init = function(options){
    //将 options 挂载到 实例的 $options 上方便后续方法的访问
    const vm = this;
    vm.$options = options;
    
    // 初始化状态
    initState(vm);

    // 实现数据的挂载
    if(options.el){
      vm.$mount(options.el);
    }
  }
  Vue.prototype.$mount = function(el){
    const vm = this;
    el = document.querySelector(el);
    let opts = vm.$options;
    //优先级 render > template > el
    if(!opts.render){//查看是否有render函数
      // 没有render函数，表示并不是用户自己写的渲染方法
      // 如果没有template，有el就使用el作为模版，如果有template就使用template
      let template;
      if(!opts.template && el){
        template = el.outerHTML;
      }else{
        if(el){//如果有el则采用模版内容
          template = opts.template;
        }
      }
      if(template){
        //这里需要对模版进行编译
        const render = compileToFunction(template);
        opts.render = render;// jsx 最终会被编译成 h('xxx')
      }
    }

    //组件挂载
    mountComponent(vm,el);

    //最终就可以获取render方法

    // script 标签引用的 vue.global.js 这个编译过程是在浏览器运行的
    // runtime 是不包含模版编译的，整个编译时打包的时候通过loader来进行转义.vue文件的
    // 所以用runtime的时候不能使用template
  }
}