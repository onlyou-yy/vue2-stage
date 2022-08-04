
/**是否是原始标签 */
function isReservedTag(tag){
  return ['a','div','span','ul','ol','li','button'].includes(tag);
}

/**生成虚拟节点，也就是vue中的 h(), _c() */
export function createElementVNode(vm,tag,data,...children){
  if(data == null) data = {};
  let key = data.key;
  if(key){
    delete data.key;
  }

  if(isReservedTag(tag)){
    //是原始标签，返回虚拟dom
    return vnode(vm,tag,key,data,children);
  }else{
    //不是原始标签，是组件标签，获取组件的定义
    let  Ctor = vm.$options.components[tag];
    //但是获取到的可能是组件的Sub类,也可能是一个组件定义的选项对象
    //所以要将他转换成组件的虚拟dom
    return createComponentVnode(vm,tag,key,data,children,Ctor);
  }
}

/**创建 组件的虚拟dom */
function createComponentVnode(vm,tag,key,data,children,Ctor){
  if(typeof Ctor === 'object'){
    //此时的vm是组件的子类Sub
    Ctor = vm.$options._base.extend(Ctor);
  }
  data.hook = {
    init(vnode){
      //之后创建真实节点的时候如果是组件就调用init方法
      //保存组件实例到虚拟节点上
      let instance = vnode.componentInstance = new vnode.componentOptions.Ctor;
      instance.$mount();
    }
  }
  return vnode(vm,tag,key,data,children,null,{Ctor})
}

/**生成文本虚拟节点，_v() */
export function createTextVNode(vm,text){
  return vnode(vm,undefined,undefined,undefined,undefined,text);
}

/**
 * 创建虚拟节点
 * ast做的事语法层面的转化，
 * vnode描述的DOM元素，可以增加一些自定义的属性
 */
function vnode(vm,tag,key,data,children,text,componentOptions){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions,//组件的构造函数
  }
}

/**判断两个虚拟节点是否相同*/
export function isSameVnode(vnode1,vnode2){
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}