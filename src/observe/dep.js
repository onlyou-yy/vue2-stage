let id = 0;
class Dep{
  constructor(){
    this.id = id++;
    // 属性的dep 需要收集 watcher
    // 存放当前属性对应的watcher有哪些
    this.subs = [];
  }
  depend(){
    Dep.target.addDep(this);//让watcher记住dep
  }
  addSub(watcher){
    this.subs.push(watcher);
  }
  /**通知watcher进行更新 */
  notify(){
    this.subs.forEach(watcher => watcher.update());
  }
}

//添加一个静态属性，用来存放临时的 watcher
//当 watcher 调用 get() 方法进行渲染的时候会去vm上取值，
//取值的时候就会触发数据劫持的 get ，此时就可以将这个watcher进行收集了
Dep.target = null;

/**watcher栈 */
let stack = [];
export function pushTarget(watcher){
  stack.push(watcher);
  Dep.target = watcher;
}
export function popTarget(watcher){
  stack.pop();
  Dep.target = stack[stack.length - 1];
}

export default Dep;