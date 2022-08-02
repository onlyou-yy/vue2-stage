import { compileToFunction } from "./compiler";
import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { createElm, patch } from "./vdom/patch";

// 不使用 class 来定义Vue 原因是，class会将所有的方法都封装到一起，导致耦合度过大，不便于管理和拆分
function Vue(options){//options 就是用户的选项
  this._init(options);
}

// 添加方法
initMixin(Vue);//扩展init方法
initLifeCycle(Vue); //vm._update,vm._render
initGlobalAPI(Vue);//全部 API
initStateMixin(Vue);//实现 nextTick $watch

//------------- 观察前后节点，测试 -------------

let vm = new Vue({data:{name:'jack'}});
let render1 = compileToFunction(`<div>{{name}}</div>`);
let preVNode = render1.call(vm);
let el1 = createElm(preVNode);

let render2 = compileToFunction(`<span>{{name}}</span>`);
let nextVNode = render2.call(vm);
let el2 = createElm(nextVNode);

document.body.appendChild(el1);
//以往都是直接替换掉整个元素
//在每次获取dom的时候都要重新计算dom位置以及其他的一些属性
//而且在创建dom的时候会初始化很多dom中的属性和方法
//所以这样做是比较耗性能
setTimeout(()=>{
  patch(preVNode,nextVNode)
  el1.parentNode.replaceChild(el2,el1);
},3000)


console.log(preVNode,nextVNode);

export default Vue;