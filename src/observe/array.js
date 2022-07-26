// 重写数组中的部分方法
let oldArrayProto = Array.prototype;
// 先复制一份原型
export let newArrayProto = Object.create(oldArrayProto);

//列举出所有需要重新的方法
let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'sort',
  'reverse',
  'splice'
];

// 开始重新方法
methods.forEach(item => {
  //重写方法
  newArrayProto[item] = function(...args){
    // 内部还是调用原来的方法
    const result = oldArrayProto[item].call(this,...args);
    // 当新增数据时，还需要对新数据进行观察
    let inserted;
    let ob = this.__ob__;
    switch(item){
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice'://[1,2,3].splice(1,0,4,5);表示在2的位置插入 4，5
        inserted = args.slice(2);
        break;
      default:
        break;
    }
    if(inserted){
      //对新增的数据进行观测
      //这里唯一可以拿到的关联数据就是this，但是我们需要调用 Observer 中的 observeArray 来观察新数据
      //而在创建 Observer 的时候又将 实例挂载到了 __ob__ 上，所以
      ob.observeArray(inserted);
    }
    return result;
  }
})