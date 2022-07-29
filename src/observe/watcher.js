/**
 * 每一个组件都有一个watcher
 * 这样可以做的局部更新
 */

import Dep from "./dep";

let id = 0;

// dep 和 watcher 就是观察者模式
// 每个属性有一个 dep（属性就是被观察者），watcher就是观察者（属性变化了会通知观察者更新）

//当我们创建渲染watcher的时候我们就会把当前的渲染watcher放到Dep.target上
//调用 _render() 会取值，触发属性的 get
class Watcher{
  /**
   * @param vm 组件实例
   * @param fn 更新组件的方法
   * @param options 是否是一个渲染watcher
   */
  constructor(vm,fn,options){
    //id 用来区分每个组件的watcher
    this.id = id++;
    //是否是一个渲染watcher
    this.renderWatcher = options;
    //getter 意味着调用这个函数可以发生取值操作,也就是收集依赖
    this.getter = fn;
    // 后续实现计算属性和一些清楚工作的时候需要用到dep
    // 比如说某个组件卸载了，需要再dep中移除当前watcher
    // 所以再这里还需要将dep也记录收集一下
    this.deps = [];
    this.depsId = new Set();
    //初始的时候调用一下 getter
    this.get();
  }
  get(){
    Dep.target = this;//缓存当前 watcher 实例
    this.getter();//会去vm上取值
    Dep.target = null;//重新滞空，当进行普通的取值使用的时候不需要进行依赖收集
  }
  addDep(dep){
    // 一个组件 watcher 中，可能会使用多个重复的属性，重复的属性不需要记录
    let id = dep.id;
    if(!this.depsId.has(id)){
      this.deps.push(dep); //watcher记录dep
      this.depsId.add(id);
      dep.addSub(this);//dep记录watcher
    }
  }
  /**重新更新 */
  update(){
    this.get();
  }
}

// 需要给每个属性都增加一个dep,目的就是收集watcher
// 一个组件中有多个属性（n个属性会对应一个视图）n个dep对应一个watcher
// 1个属性也可以被多个组件使用，所以 1个dep对应多个watcher
// 所以 dep 和 watcher 是 多对多的关系

export default Watcher;