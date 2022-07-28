import { createElementVNode, createTextVNode } from "./vdom"

/**创建真实DOM */
function createElm(vnode){
  let {tag,data,children,text} = vnode;
  if(typeof tag === 'string'){
    //标签
    //将真实DOM挂载到虚拟DOM上，方便后续修改属性
    vnode.el = document.createElement(tag);
    // 设置属性
    patchProps(vnode.el,data);
    // 添加子节点
    children.forEach(child => {
      vnode.el.appendChild(createElm(child));
    })
  }else{
    //tag为undefined就是个文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

/**更新和初始化真实DOM的属性 */
function patchProps(el,props){
  for(let key in props){
    if(key === 'style'){//值是 [{color:'red'}]
      for(let styleName in props.style){
        el.style[styleName] = props.style[styleName];
      }
    }else{
      el.setAttribute(key,props[key]);
    }
  }
}

/**初始化和更新DOM */
function patch(oldNode,vnode){
  console.log(vnode);
  //真实DOM中才有nodeType
  const isRealElement = oldNode.nodeType;
  if(isRealElement){
    //是真实DOM，进行初始化挂载
    let elm = oldNode;//当前节点
    let parentElm = elm.parentNode;
    //创建真实DOM
    let newElm = createElm(vnode);
    //先在原来的后面添加节点，然后再删除老节点
    parentElm.insertBefore(newElm,elm.nextSibiling);//添加新节点
    parentElm.removeChild(elm);//删除老节点
    return newElm;
  }else{
    //diff 算法，对比两个虚拟DOM
  }
}

export function initLifeCycle(Vue){
  /**将虚拟DOM转化成真实DOM */
  Vue.prototype._update = function(vnode){
    const vm = this;
    const el = vm.$el;
    //patch 既有初始化的功能，又有更新的方法
    vm.$el = patch(el,vnode);
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
  vm._update(vm._render());

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
