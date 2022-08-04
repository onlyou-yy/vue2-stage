import { initGlobalAPI } from "./globalAPI";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";

// 不使用 class 来定义Vue 原因是，class会将所有的方法都封装到一起，导致耦合度过大，不便于管理和拆分
function Vue(options){//options 就是用户的选项
  this._init(options);
}

// 添加方法
initMixin(Vue);//扩展init方法
initLifeCycle(Vue); //vm._update,vm._render
initGlobalAPI(Vue);//全部 API
initStateMixin(Vue);//实现 nextTick $watch

export default Vue;