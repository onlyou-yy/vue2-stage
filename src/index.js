import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

// 不使用 class 来定义Vue 原因是，class会将所有的方法都封装到一起，导致耦合度过大，不便于管理和拆分
function Vue(options){//options 就是用户的选项
  this._init(options);
}

// 添加方法
Vue.prototype.$nextTick = nextTick;
initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);

//最终调用的都是这个方法
Vue.prototype.$watch = function(exprOrFn,cb){
  // 创建一个 Watcher
  // 当监听的值发生变化的时候执行回调
  // {user:true} 标志是用户自定定义的
  new Watcher(this,exprOrFn,{user:true},cb);
}

export default Vue;