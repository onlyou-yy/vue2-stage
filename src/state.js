import { observe } from "./observe";
import Watcher from "./observe/watcher";

/**初始化状态 */
export function initState(vm){
  const opts = vm.$options;//获取用户的选项
  if(opts.data){
    //初始化数据，生成相应式数据
    initData(vm);
  }
  if(opts.computed){
    //初始化计算属性
    initComputed(vm);
  }
}

/**初始化数据，生成相应式数据 */
function initData(vm){
  let data = vm.$options.data;
  //如果data 是函数还需要先执行才能回去到要劫持的数据
  data = typeof data === 'function' ? data.call(vm) : data;
  
  //进行数据劫持，来创建响应式数据
  observe(data);

  //为了方便之后访问 data，给实例挂载一个 _data
  vm._data = data;
  //但是这样的话就需要使用 vm._data.xxx 来访问，这样不够优雅
  //所以可以将 vm._data 用vm来代理就可以用 vm.xxx来访问 _data 中的属性了
  for(let key in data){
    proxy(vm,'_data',key);
  }
}

/**代理 */
function proxy(vm,target,key){
  Object.defineProperty(vm,key,{
    get(){
      return vm[target][key]
    },
    set(newVal){
      vm[target][key] = newVal
    }
  })
}

/**初始化计算属性 */
function initComputed(vm){
  const computed = vm.$options.computed;
  for(let key in computed){
    let userDef = computed[key];
    //需要一个computed 的 watcher 来维护计算属性，方便实现之后的缓存
    //需要监控计算属性中的get变化
    let fn = typeof userDef == 'function' ? userDef : userDef.get;
    //如果直接new Watcher默认就会执行fn,所以需要添加一个{lazy:true}来
    new Watcher(vm,fn,{lazy:true});

    defineComputed(vm,key,userDef);
  }
}

/**为实例挂载上计算属性 */
function defineComputed(target,key,userDef){
  //getter可能是一个 function 也可能是对象
  const getter = typeof userDef == 'function' ? userDef : userDef.get;
  const setter = userDef.set || (()=>{});
  //当调用 render 渲染函数的时候，会访问计算属性
  //计算属性函数调用的时候也会访问data的属性，从未获取到完整的值
  Object.defineProperty(target,key,{
    get:getter,
    set:setter,
  })
}