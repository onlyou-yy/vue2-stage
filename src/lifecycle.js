import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom"
import { patch } from "./vdom/patch";

export function initLifeCycle(Vue){
  /**将虚拟DOM转化成真实DOM */
  Vue.prototype._update = function(vnode){
    const vm = this;
    const el = vm.$el;
    
    let preVnode = vm._vnode;//取出上次渲染的虚拟节点
    vm._vnode = vnode;//保存当前渲染的虚拟节点
    if(preVnode){
      //如果有上次渲染的虚拟节点，就进行diff对比
      vm.$el = patch(preVnode,vnode);
    }else{
      //如果上次没有没有渲染，表示第一次渲染，进行初始化，将vnode转成真实dom挂载到el上
      //patch 既有初始化的功能，又有更新的方法
      vm.$el = patch(el,vnode);
    }
  }
  /**生成虚拟节点 */
  Vue.prototype._c = function(){
    return createElementVNode(this,...arguments);
  }
  /**生成文本虚拟节点 */
  Vue.prototype._v = function(){
    return createTextVNode(this,...arguments);
  }
  /**生成虚拟DOM */
  Vue.prototype._s = function(value){
    if(typeof value !== 'object') return value;
    return JSON.stringify(value);
  }
  /**生成虚拟DOM */
  Vue.prototype._render = function(){
   const vm = this;
   //当渲染的时候回去实例中取值，就可以将属性和视图绑定在一起了
   return vm.$options.render.call(vm);//通过ast语法转义后生成的render方法
  }
}

/**将组件挂载到DOM上 */
export function mountComponent(vm,el){
  // 将节点挂载到实例上，方便之后访问
  vm.$el = el;
  // 1.调用render方法产生虚拟节点，虚拟DOM
  const updateComponent = () => {
    vm._update(vm._render());
  }

  new Watcher(vm,updateComponent,true);
  

  // 2.根据虚拟DOM产生真实DOM

  // 3.插入到el元素中

}

/**
 * vue核心流程
 * 1.创造响应式数据
 * 2.模版转换成ast语法树
 * 3.将ast语法树转换成了render函数
 * 4.后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）
 */

// render 函数会去产生虚拟节点（使用响应式数据）
// 根据生成的虚拟节点创造正式的DOM

// ---------------------------------------------------------------------

/**调用选项中的生命钩子函数 */
export function callHook(vm,hook){
  const handlers = vm.$options[hook];
  if(handlers){
    handlers.forEach(handler => handler.call(vm));
  }
}
