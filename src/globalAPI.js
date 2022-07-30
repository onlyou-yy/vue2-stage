import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue){
  //Vue静态属性和方法
  Vue.options = {};
  Vue.mixin = function(mixin){
    //将用户选项和全局的options合并
    this.options = mergeOptions(this.options,mixin);
    return this;
  }
}