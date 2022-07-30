import { newArrayProto } from "./array";
import Dep from "./dep";

/**通过 Object.defineProperty来劫持数据 */
export function observe(data){
  //只能对对象进行劫持，所以要先进行判断
  if(typeof data !== 'object' || data === null){
    return;
  }
  //如果data 上有 __ob__ 并且是 Observer 时说明，这个对象已经被观测过了
  if(data.__ob__ instanceof Observer){
    return;
  }

  //如果一个对象已经被劫持过了，那就不用再被劫持
  //（需要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
  return new Observer(data);
}

/**观察者（被劫持对象） */
class Observer{
  constructor(data){

    //给每个对象都增加收集功能
    this.dep = new Dep();

    //Object.defineProperty只能劫持已经存在的属性（vue里面会为添加，删除属性的方法添加一些api，如$set,$delete）
    
    //将当前实例赋值给__ob__属性保存下来，方便在其他的地方调用实例的方法
    //并且添加这个标识之后就可以知道这个数据已经被观察过了，不用在进行观察
    // data.__ob__ = this;
    //不过直接这样添加的话，在调用 this.walk(data) 的时候会形成死循环，可以这样解决
    Object.defineProperty(data,"__ob__",{
      value:this,
      enumerable:false,//不可枚举，循环时就获取不了
    })

    if(Array.isArray(data)){
      //当值为数组的也是可以对其进行劫持的，但是数组长度很长的时候就会非常消耗性能
      //而且一般也不会通过索引来访问很设置值，所以vue中并不会劫持数组，而是重构数组的方法来实现响应式数据
      data.__proto__ = newArrayProto;
      //如果数组中的某个元素是对象的时候也是需要对其进行劫持的
      this.observeArray(data);
    }else{
      this.walk(data);
    }
  }
  walk(data){
    //循环对象，对每个数据都进行劫持
    //每次劫持都是一个重新定义属性的过程，所以会比较耗性能
    Object.keys(data).forEach(key => {
      defineReactive(data,key,data[key]);
    })
  }
  observeArray(data){
    data.forEach(item => observe(item));
  }
}

/**重新定义属性 */
export function defineReactive(target,key,value){
  //如果值是对象，那么还需要继续对数据进行劫持
  let childOb = observe(value);//childOb.dep 用来收集依赖
  //为每个属性创建一个dep,闭包中不会被销毁
  let dep = new Dep();
  //这里用到了 闭包 来保存 value 值。
  Object.defineProperty(target,key,{
    get(){
      //取值时
      if(Dep.target){//当进行普通的取值使用的时候不需要进行依赖收集
        dep.depend();//让这个属性的收集器记住当前的watcher
        if(childOb){
          //让数组和对象本身也实现依赖收集
          childOb.dep.depend();
          //如果值是一个数组的话，还需要对里面的值进行依赖收集
          //解决多维数组的问题
          if(Array.isArray(value)){
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(newVal){
      //设置值时
      if(newVal === value) return;
      //如果设置的值是一个对象时，需要继续对这个对象进行劫持
      observe(newVal);
      value = newVal;
      dep.notify();//设置值的时候通知watcher更新渲染
    }
  })
}

/**收集数组数据的依赖 */
function dependArray(value){
  for(let i = 0;i < value.length;i++){
    let current = value[i];
    current.__ob__ && current.__ob__.dep.depend();
    if(Array.isArray(current)){
      dependArray(current);
    }
  }
}