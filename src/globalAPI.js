import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue){
  //Vue静态属性和方法
  Vue.options = {
    _base:Vue,//存储一下Vue,在创建组件虚拟DOM的时候需要使用到Vue上的静态方法
  };
  Vue.mixin = function(mixin){
    //将用户选项和全局的options合并
    this.options = mergeOptions(this.options,mixin);
    return this;
  }
  /** 可以手动创建组件进行挂载*/
  Vue.extend = function(options){
    //子类，最终在时候组件的时候就是new一个实例
    //就是实现根据用户的参数返回一个构造函数而已
    function Sub(options = {}){
      //默认对子类进行初始化
      this._init(options);
    }
    //继承Vue
    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;
    //保存options数据,但是要合并全局的options
    Sub.options = mergeOptions(Vue.options,options);

    return Sub;
  }
  //全局组件
  Vue.options.components = {};
  /**注册全局组件 */
  Vue.component = function(id,definition){
    // 如果 definition 是一个函数就不用再使用 Vue.extend 进行包装了
    definition = typeof definition === 'function' ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  }
}