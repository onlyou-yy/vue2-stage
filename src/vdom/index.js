/**生成虚拟节点，也就是vue中的 h(), _c() */
export function createElementVNode(vm,tag,data,...children){
  if(data == null) data = {};
  let key = data.key;
  if(key){
    delete data.key;
  }
  return vnode(vm,tag,key,data,children);
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
function vnode(vm,tag,key,data,children,text){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}