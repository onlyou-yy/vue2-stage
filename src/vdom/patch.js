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
    updateChildren(el,oldChildren,newChildren);
  }else if(newChildren.length > 0){
    //没有老的，有新的，新增子节点
    //将新节点元素挂载到节点上
    mountChildren(el,newChildren);
  }else if(oldChildren.length > 0){
    //有老的，没有新的，删除子节点
    el.innerHTML = "";
  }
  return el;
}

/**挂载子元素的父元素上 */
function mountChildren(el,children){
  for(let i = 0; i < children.length;i++){
    let child = children[i];
    el.appendChild(createElm(child))
  }
}

/**对比更新两个子节点 */
function updateChildren(el,oldChildren,newChildren){
  //在vue2中采用双指针的方式来进行两子节点的对比，这样就会性能会比较高
  /**
   *    s1    e1
   *    |     |
   * o: a  b  c 
   * n: a  b  c  d
   *    |        |
   *    s2       e2
   */
  /**
   * 对新老子节点列表，分别定义两个指针，
   * 老节点开始指针 s1,老节点结束指针 e1
   * 新节点开始指针 s1,新节点结束指针 e1
   * ---------- 新增的情况 ------------
   * 两组节点列表同时开始进行遍历循环，开始的时候 s1 和 s2 同时执行各自的第一位元素
   * 如果两个节点是相同的就移动到第二位继续进行对比，如果相同就继续上面的步骤，
   * 直到 s1 指向的位置大于 e1 的位置的时候，老节点 s1 停止,s2继续往下，
   * s2 指向 d,表示 d 是新增的，将d添加到 el 中
   */
  let oldStartIndex = 0;//老节点开始指针
  let newStartIndex = 0;//新节点开始指针
  let oldEndIndex = oldChildren.length - 1;//老节点结束指针
  let newEndIndex = newChildren.length - 1;//新节点结束指针

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
    //双方有一方头指针大于尾部指针则停止循环
  }
}