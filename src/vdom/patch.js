import { isSameVnode } from ".";

/**创建真实DOM */
export function createElm(vnode){
  let {tag,data,children,text} = vnode;
  if(typeof tag === 'string'){
    //标签
    //将真实DOM挂载到虚拟DOM上，方便后续修改属性
    vnode.el = document.createElement(tag);
    // 设置属性
    patchProps(vnode.el,{},data);
    // 添加子节点
    children.forEach(child => {
      vnode.el.appendChild(createElm(child));
    })
  }else{
    //tag为undefined就是个文本节点
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

/**更新和初始化真实DOM的属性 */
export function patchProps(el,oldProps,props){
  let oldStyle = oldProps.style || {};
  let newStyle = props.style || {};
  //老的有，新的没有，删除老的style
  for(let key of oldStyle){
    if(!newStyle[key]){
      el.style[key] = '';
    }
  }
  //老的有，新的没有，删除老的属性
  for(let key of oldProps){
    if(!props[key]){
      el.removeAttribute(key);
    }
  }
  //用新的覆盖老的
  for(let key in props){
    if(key === 'style'){//值是 [{color:'red'}]
      for(let styleName in props.style){
        el.style[styleName] = props.style[styleName];
      }
    }else{
      el.setAttribute(key,props[key]);
    }
  }
}

/**初始化和更新DOM */
export function patch(oldVNode,vnode){
  console.log(vnode);
  //真实DOM中才有nodeType
  const isRealElement = oldVNode.nodeType;
  if(isRealElement){
    //是真实DOM，进行初始化挂载
    let elm = oldVNode;//当前节点
    let parentElm = elm.parentNode;
    //创建真实DOM
    let newElm = createElm(vnode);
    //先在原来的后面添加节点，然后再删除老节点
    parentElm.insertBefore(newElm,elm.nextSibiling);//添加新节点
    parentElm.removeChild(elm);//删除老节点
    return newElm;
  }else{
    //diff 算法，对比两个虚拟DOM
    //diff 算法是一个平级比较的过程，父亲与父亲比较，儿子与儿子比较

    patchVnode(oldVNode,vnode);
  }
}

//1.两个接待你不是同一个节点，直接删除老的换上新的（没有比对）
//2.两个节点是同一个节点（判断节点的tag和key）比较两个节点的属性是否有差异
//3.节点比较完后就需要比较他们的子节点
/**对比两个虚拟节点 */
function patchVnode(oldVNode,vnode){
  if(!isSameVnode(oldVNode,vnode)){
    //两个节点不一样,用老节点的父亲进行替换
    let el = createElm(vnode);
    return oldVNode.el.parentNode.replaceChild(el,oldVNode.el);
  }
  let el = vnode.el = oldVNode.el;//复用老节点元素
  //文本的情况 tag为undefined时为文本
  if(!oldVNode.tag){//是文本
    if(oldVNode.text !== vnode.text){
      // 用新节点文本替换就节点文本
      el.textContent = vnode.text;
    }
  }

  // 是标签，需要比较标签的属性
  patchProps(el,oldVNode.data,vnode.data);

  // 比较两个的儿子节点，一方有儿子，一方没儿子，还有就是来两方都有儿子
  let oldChildren = oldVNode.children || [];
  let newChildren = vnode.children || [];
  if(oldChildren.length > 0 && newChildren.length > 0){
    //两方都有儿子，比较两个人的儿子
  }else if(newChildren.length > 0){
    //没有老的，有新的，新增子节点
    //将
    mountChildren()
  }
}