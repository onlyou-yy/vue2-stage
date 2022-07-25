import { initMixin } from "./init";

// 不使用 class 来定义Vue 原因是，class会将所有的方法都封装到一起，导致耦合度过大，不便于管理和拆分
function Vue(options){//options 就是用户的选项
  this._init(options);
}

// 添加_init方法
initMixin(Vue);

export default Vue;