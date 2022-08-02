/**
 * 每一个组件都有一个watcher
 * 这样可以做的局部更新
 */

import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

// dep 和 watcher 就是观察者模式
// 每个属性有一个 dep（属性就是被观察者），watcher就是观察者（属性变化了会通知观察者更新）

// 需要给每个属性都增加一个dep,目的就是收集watcher
// 一个组件中有多个属性（n个属性会对应一个视图）n个dep对应一个watcher
// 1个属性也可以被多个组件使用，所以 1个dep对应多个watcher
// 所以 dep 和 watcher 是 多对多的关系

//当我们创建渲染watcher的时候我们就会把当前的渲染watcher放到Dep.target上
//调用 _render() 会取值，触发属性的 get
class Watcher{
  /**
   * @param vm 组件实例
   * @param exprOrFn 回调的方法
   * @param options 是否是一个渲染watcher
   */
  constructor(vm,exprOrFn,options,cb){
    //id 用来区分每个组件的watcher
    this.id = id++;
    //是否是一个渲染watcher
    this.renderWatcher = options;

    /**########################## watch相关 ########################## */
    this.cb = cb;
    //exprOrFn可能是函数也可能是字符串,所以需要统一先处理成函数
    if(typeof exprOrFn === 'string'){
      this.getter = function(){
        return vm[exprOrFn];
      }
    }else{
      //getter 意味着调用这个函数可以发生取值操作,也就是收集依赖
      this.getter = exprOrFn;
    }
    //标识是否是用户自己定义的wathcer
    this.user = options.user;
    /**########################## watch相关 ########################## */
    
    /**########################## computed相关 ######################### */
    // 后续实现计算属性和一些清楚工作的时候需要用到dep
    // 比如说某个组件卸载了，需要再dep中移除当前watcher
    // 所以再这里还需要将dep也记录收集一下
    this.deps = [];
    this.depsId = new Set();

    //是否懒加载
    this.lazy = options.lazy;
    //是否是脏
    this.dirty = this.lazy;
    /**########################## computed相关 ######################### */

    this.vm = vm;

    //初始的时候调用一下 getter
    //如果是懒加载，那么第一次时不用执行的
    //存储第一次执行的值（老值） 
    this.value = this.lazy ? undefined :this.get();
  }
  //获取计算属性处理结果(计算属性watcher)
  evaluate(){
    //执行get方法获取到用户定义的计算属性的getters的返回值
    this.value = this.get();
    //重新定义为脏
    this.dirty = false;
  }
  get(){
    pushTarget(this);//缓存当前 watcher 实例
    let value = this.getter.call(this.vm);//会去vm上取值
    popTarget();//重新出栈
    return value
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
  /**让属性收集watcher */
  depend(){
    let i = this.deps.length;
    while(i--){
      // 让计算属性依赖的属性去收集上层的渲染watcher
      this.deps[i].depend();
    }
  }
  /**重新更新 */
  update(){
    if(this.lazy){
      // 计算属性watcher，将标识计算属性是脏值
      this.dirty = true;
    }else{
      // this.get();
      // 异步更新先将当前 watcher 暂存起来
      queueWatcher(this);
    }
  }
  run(){
    //获取老值
    let oldVal = this.value;
    //获取新值
    let newVal = this.get();
    if(this.user){
      //如果是用户自己定义wathcer 在值变化的时候就在执行一下回调
      this.cb.call(this.vm,newVal,oldVal);
    }
  }
}

/**刷新执行队列命令 */
function flushSchedulerQueue(){
  // 在刷新的过程中可能还有新的watcher加入，重新放到queue中，所以先复制一份queue
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  pending = false;
  flushQueue.forEach(q => q.run());
}

let queue = [];
let has = {};
let pending = false;//防抖
/**缓存watcher */
function queueWatcher(watcher){
  let id = watcher.id;
  if(!has[id]){
    queue.push(watcher);
    has[id] = true;
    
    if(!pending){
      nextTick(flushSchedulerQueue, 0);
      pending = true;
    }
  }
}


/**执行nextTick队列任务 */
function flushCallbacks(){
  let cbs = callbacks.slice(0);
  callbacks = [];
  waiting = false;
  cbs.forEach(cb => cb());
}

let callbacks = [];
let waiting = false;
/**
 * 异步更新回调
 * nextTick 不是创建了一个异步任务，而是将这个任务维护到了队列中而已
 */
export function nextTick(cb){
  callbacks.push(cb);
  if(!waiting){
    //创建异步任务的时候，在vue2中，并没有直接使用某个API，而是使用优雅降级的方式
    //（vue3中因为已经不在兼容ie了，所以直接采用了promise）
    //内部先采用优先顺序是： 
    // promise（ie不兼容）
    // MutationObserver（H5新接口，只能在浏览器中使用）
    // setImmediate（ie专享）
    // setTimeout
    // setTimeout(()=>{flushCallbacks();},0);
    timerFunc();
    waiting = true;
  }
}

/**异步任务适配 */
let timerFunc;
if(Promise){
  timerFunc = () => {
    Promise.resolve().then(flushCallbacks);
  }
}else if(MutationObserver){
  let observer = MutationObserver(flushCallbacks);
  let textNode = document.createTextNode(1);
  observer.observe(textNode,{
    characterData:true
  });
  timerFunc = () => {
    textNode.textContent = 2
  }
}else if(setImmediate){
  timerFunc = () => {
    setImmediate(flushCallbacks);
  }
}else if(setImmediate){
  timerFunc = () => {
    setTimeout(flushCallbacks,0);
  }
}

export default Watcher;