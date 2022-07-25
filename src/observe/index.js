/**通过 Object.defineProperty来劫持数据 */
export function observe(data){
  //只能对对象进行劫持，所以要先进行判断
  if(typeof data !== 'object' || data === null){
    return;
  }

  //如果一个对象已经被劫持过了，那就不用再被劫持
  //（需要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
  return new Observer(data);
}

/**观察者（被劫持对象） */
class Observer{
  constructor(data){
    //Object.defineProperty只能劫持已经存在的属性（vue里面会为添加，删除属性的方法添加一些api，如$set,$delete）
    this.walk(data);
  }
  walk(data){
    //循环对象，对每个数据都进行劫持
    //每次劫持都是一个重新定义属性的过程，所以会比较耗性能
    Object.keys(data).forEach(key => {
      defineReactive(data,key,data[key]);
    })
  }
}

/**重新定义属性 */
export function defineReactive(target,key,value){
  //如果值是对象，那么还需要继续对数据进行劫持
  observe(value);
  //这里用到了 闭包 来保存 value 值。
  Object.defineProperty(target,key,{
    get(){
      //取值时
      return value;
    },
    set(newVal){
      //设置值时
      if(newVal === value) return;
      value = newVal;
    }
  })
}