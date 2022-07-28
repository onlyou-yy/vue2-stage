import { observe } from "./observe";

/**初始化状态 */
export function initState(vm){
  const opts = vm.$options;//获取用户的选项
  if(opts.data){
    //初始化数据，生成相应式数据
    initData(vm);
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