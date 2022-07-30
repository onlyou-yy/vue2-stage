/**合并选项 */
export function mergeOptions(parent,child){
  const options = {};//定义一个新对象用来存储合并后的对象
  //先合并父选项
  for(let key in parent){
    mergeField(key);
  }
  //再用子选项来覆盖和合并父选项
  for(let key in child){
    if(!parent.hasOwnProperty(key)){
      mergeField(key);
    }
  }
  function mergeField(key){
    //采用策略模式减少 if/else
    //如果不在策略中优先使用子
    if(strats[key]){
      options[key] = strats[key](parent[key],child[key]);
    }else{
      //优先使用子的，再使用父的
      options[key] = child[key] || parent[key];
    }
  }
  return options;
}

//策略模式
const strats = {};
const LIFECYCLE = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
];
LIFECYCLE.forEach(hook => {
  strats[hook] = function(p,c){
    // 第一次合并：{} + {created:fn} => {created:[fn]}
    // 第二次合并：{created:fn1} + {created:fn2} => {created:[fn1,fn2]}
    if(c){
      if(p){
        // 父子都有
        return p.concat(c);
      }else{
        // 只有子有,初始化过程
        return [c];
      }
    }else{
      // 如果子没有，就直接使用父的
      // 只要经过初始化过程， 父 就已经是个数组
      // 如 {created:[fn]} + {a:1}
      return p;
    }
  }
})