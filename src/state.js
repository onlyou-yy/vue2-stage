import { observe } from "./observe";
import Dep from "./observe/dep";
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
  if(opts.watch){
    //初始化监控
    initWatch(vm);
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
  //将计算属性的所有watcher都保存到vm上
  const watchers = vm._computedWatchers = {};
  for(let key in computed){
    let userDef = computed[key];
    //需要一个computed 的 watcher 来维护计算属性，方便实现之后的缓存
    //需要监控计算属性中的get变化
    let fn = typeof userDef == 'function' ? userDef : userDef.get;
    //如果直接new Watcher默认就会执行fn,所以需要添加一个{lazy:true}来让他在使用的时候再至执行
    //将计算属性和wathcer对应起来
    watchers[key] = new Watcher(vm,fn,{lazy:true});

    defineComputed(vm,key,userDef);
  }
}

/**为实例挂载上计算属性 */
function defineComputed(target,key,userDef){
  //getter可能是一个 function 也可能是对象
  const getter = typeof userDef == 'function' ? userDef : userDef.get;
  const setter = userDef.set || (()=>{});
  //当调用 render 渲染函数的时候，会访问计算属性
  //计算属性函数调用的时候也会访问data的属性，从而获取到完整的值
  //但是不能直接使用watcher，因为需要检查依赖的属性是否发生变化
  Object.defineProperty(target,key,{
    get:createComputedGetter(key),
    set:setter,
  })
}

//计算属性根本不会收集依赖，只会让自己的依赖属性去收集依赖
/**创建计算属性getter */
function createComputedGetter(key){
  return function (){
    //当前 this 是指向 vm 的
    //所以 可以直接从this 上获取到全部的 计算属性watcher
    const watcher = this._computedWatchers[key];
    if(watcher.dirty){
      // 执行用户传入的getter
      watcher.evaluate();
    }
    /**
     * 在计算属性依赖的属性发生变化的时候触发的是计算属性的watcher更新
     * 并不会触发 渲染watcher的更新 ，所以页面并不会更新
     * 所以计算属性依赖的属性也需要去收集 渲染watcher
     */
    //当第一次渲染的时候执行了 watcher 中 get 方法
    //此时 渲染watcher 会被存放到wathcer缓存栈中
    //在渲染的过程中发现使用到了计算属性，然后 计算属性watcher 被创建，并存放到 watcher 缓存栈中
    //此时的watcher缓存栈就是 [渲染watcher，计算属性watcher]
    //之后 计算属性watcher 调用evaluate()取值后出栈，watcher缓存栈就剩下 渲染watcher
    //所以 watcher缓存栈 栈顶就是渲染watcher （Dep.target）
    //所以可以让计算属性依赖的属性去收集上层的watcher（渲染watcher）
    if(Dep.target){
      watcher.depend();
    }
    return watcher.value;
  }
}

/**初始化监控 */
function initWatch(vm){
  let watch = vm.$options.watch;
  for(let key in watch){
    const handler = watch[key];
    //值有几种情况，字符串、数组、函数、对象
    //现在只考虑前三种情况，而且不考虑深度监控的情况
    if(Array.isArray(handler)){
      for(let i = 0;i<handler.length;i++){
        createWatcher(vm,key,handler[i]);
      }
    }else{
      //字符串、函数
      createWatcher(vm,key,handler);
    }
  }
}

/**创建 watch */
function createWatcher(vm,key,handler){
  //字符串时取
  if(typeof handler === 'string'){
    handler = vm.$options.methods[handler].bind(vm);
  }
  return vm.$watch(key,handler);
}