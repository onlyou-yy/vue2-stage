import { isSameVnode } from ".";


/**创建组件真实DOM */
function createComponent(vnode){
  let i = vnode.data;
  if((i = i.hook) && (i = i.init)){
    i(vnode);//初始化组件，找到init方法
  }
  if(vnode.componentInstance){
    return true;
  }
}

/**创建真实DOM */
export function createElm(vnode){
  let {tag,data,children,text} = vnode;
  if(typeof tag === 'string'){
    //标签

    // 区分是组件还是元素
    if(createComponent(vnode)){//组件
      //在调用 createComponent-> vnode.data.hook.init 之后
      // 创建了组件的真实dom，在实例上就有 $el 保存着组件的DOM
      return vnode.componentInstance.$el;
    }

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
export function patchProps(el,oldProps = {},props = {}){
  let oldStyle = oldProps.style || {};
  let newStyle = props.style || {};
  //老的有，新的没有，删除老的style
  for(let key in oldStyle){
    if(!newStyle[key]){
      el.style[key] = '';
    }
  }
  //老的有，新的没有，删除老的属性
  for(let key in oldProps){
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
  if(!oldVNode){
    //组件挂载
    //创建元素之后在实例vm上就有$el了
    return createElm(vnode);
  }
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
  /**场景1:头部比对
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
  /**场景2:尾部比对
   *       s1    e1
   *       |     |
   * o:    a  b  c 
   * n: d  a  b  c
   *    ｜       ｜
   *    s2       e2
   */
  /**场景3:交叉比对 e1 == s2
   *    s1       e1
   *    |        |
   * o: a  b  c  d
   * n: d  a  b  c
   *    ｜       ｜
   *    s2       e2
   *
  **场景4:交叉比对 s1 == e2
   *    s1       e1
   *    |        |
   * o: a  b  c  d
   * n: d  c  b  a
   *    ｜       ｜
   *    s2       e2
   */
  /**场景5:乱序比对
   *    s1       e1
   *    |        |
   * o: a  b  c  d
   * n: d  c  b  a
   *    ｜       ｜
   *    s2       e2
   */
  let oldStartIndex = 0;//老节点开始指针
  let newStartIndex = 0;//新节点开始指针
  let oldEndIndex = oldChildren.length - 1;//老节点结束指针
  let newEndIndex = newChildren.length - 1;//新节点结束指针

  let oldStartVnode = oldChildren[0];
  let newStartVnode = newChildren[0];
  let oldEndVnode = oldChildren[oldEndIndex];
  let newEndVnode = newChildren[newEndIndex];

  /**创建 节点索引映射 */
  function makeIndexByKey(children){
    let map = {}
    children.forEach((child,index)=>{
      map[child.key] = index;
    })
    return map;
  }
  let map = makeIndexByKey(oldChildren);

  //双方有一方头指针大于尾部指针则停止循环
  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex){
    //复用都是针对老的节点列表而言的
    //在头部比对，尾部比对，交叉比对的情况下，都是将老节点在新节点指针的位置进行插入或者删除
    //如果批量向页面中插入内容，浏览器会自动优化
    
    if(!oldStartVnode){//在乱序对比的时候，节点可能在移动后被移除
      oldStartVnode = oldChildren[++oldStartIndex];
    }else if(!oldEndVnode){//在乱序对比的时候，节点可能在移动后被移除
      oldEndVnode = oldChildren[--oldEndIndex];
    }else if(isSameVnode(oldStartVnode,newStartVnode)){// 从头部开始对比
      //如果是相同节点就递归比价子节点
      patchVnode(oldStartVnode,newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    }else if(isSameVnode(oldEndVnode,newEndVnode)){//从尾部开始对比
      patchVnode(oldEndVnode,newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }else if(isSameVnode(oldEndVnode,newStartVnode)){//交叉比对 新头和旧尾对比
      patchVnode(oldEndVnode,newStartVnode);
      //将老的尾巴移动到老的开头的前面
      el.insertBefore(oldEndVnode.el,oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }else if(isSameVnode(oldStartVnode,newEndVnode)){//交叉比对 新尾和旧头对比
      patchVnode(oldStartVnode,newEndVnode);
      //将老的头部移动到老末尾的下一个元素的前面
      el.insertBefore(oldStartVnode.el,oldEndVnode.el.nextSibiling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    }else{
      // 乱序比对
      // 根据老的列表做一个映射关系，用新的去找，找到就移动，最后多余的就删除
      let moveIndex = map[newStartVnode.key];
      if(moveIndex !== undefined){
        let moveVnode = oldChildren[moveIndex];//找到对应的虚拟节点复用
        el.insertBefore(moveVnode.el,oldStartVnode.el);//将节点插入到老开始指针指向的节点之前
        oldChildren[moveIndex] = undefined;//表示这个节点已经移动过了
        patchVnode(moveVnode,newStartVnode);//对比属性和子节点
      }else{
        //没有找到，表示新增，将节点插入到老开始指针指向的节点之前
        el.insertBefore(createElm(newStartVnode),oldStartVnode.el);
      }
      // 对比之后继续下一个对比
      newStartVnode = newChildren[++newStartIndex];
    } 
  }
  //while结束说明有一方的头指针大于尾指针
  //如果新节点头指针小于尾指针，说明之间的节点都是新增的
  if(newStartIndex <= newEndIndex){
    for(let i = newStartIndex;i <= newEndIndex;i++){
      let childEl = createElm(newChildren[i]);
      //可能是在后面追加也可能是在前面追加
      //当新节点的头指针的下一个还有元素的时候表示在下一个元素的前面追加
      //如果下一个元素没有就表示是在末尾追加
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null;
      el.insertBefore(childEl,anchor);//当 anchor 为 null 的时候 insetBefore 就会使用 appendChild
    }
  }
  //如果旧节点头指针小于尾指针，说明之间的节点都是需要删除的
  if(oldStartIndex <= oldEndIndex){
    for(let i = oldStartIndex;i <= oldEndIndex;i++){
      //在乱序比对的时候，可能会被移走后设置为 undefined
      if(oldChildren[i]){
        let childEl = oldChildren[i].el;
        el.removeChild(childEl);
      }
    }
  }
}