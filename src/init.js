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
  }
}