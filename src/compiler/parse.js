/**
 * 一般解析html 都不会自己去写，可以使用第三方包，htmlparser2
 * 也可以在 https://astexplorer.net/ 感受 ast的转化
 */

//可视化正则表达式 https://regexper.com
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;//匹配标签名
//?:代表不捕获分组,使用match后将不会?:的分组不会出现
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;//匹配标签名和带命名空间的标签,如<namespace:div>
//匹配开始标签
const startTagOpen = new RegExp(`^<${qnameCapture}`);//匹配到的分组是一个标签名 <div 匹配到的分组就是开始标签的名字
//匹配结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);//匹配的是 </xxx> 最终匹配到的分组就是结束标签的名字
//匹配属性,第一个属性就是 key，value 就是 分组3/4/5
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/;
//匹配闭合标签 > 或者 />
const startTagClose = /^\s*(\/?)>/;// /> <br/>


//解析html,vue3并不是使用正则来进行匹配的
export function parseHTML(html){
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = [];//用来存放元素的栈
  let currentParent;//指向栈顶元素
  let root;//根节点
  //----------------- 转成 ast -------------------
  //创建ast元素
  function createASTElement(tag,attrs){
    return {
      tag,
      attrs,
      type:ELEMENT_TYPE,
      children:[],
      parent:null
    }
  }
  //获取开始标签回调
  function start(tag,attrs){
    let node = createASTElement(tag,attrs);
    if(!root){//如果还没有根节点，当前ast节点就是根节点
      root = node;
    }
    if(currentParent){
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node;
  }
  //获取标签中内容回调
  function chars(text){
    text = text.replace(/\s/g,'');
    // 文本直接放到当前节点中
    text && currentParent.children.push({
      type:TEXT_TYPE,
      text,
      parent:currentParent
    })
  }
  //获取结束标签回调
  function end(tag){
    stack.pop();//每次遇到结束标签都进行出栈操作
    currentParent = stack[stack.length - 1];//重新指向栈顶
  }
  //----------------- 转成 ast -------------------

  //截取内容
  function advance(length){
    html = html.substring(length);
  }
  //匹配解析开始标签
  function parseStartTag(){
    const start = html.match(startTagOpen);
    if(start){
      // 是开始标签
      const match = {
        tagName:start[1],//标签名
        attrs:[],
      }
      //每次匹配成功都将成功的部分删除掉，然后继续匹配，这样就不会重复匹配之前的
      advance(start[0].length);

      //如果不是开始标签的结束就一直匹配下去
      let attr,end;
      while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
        //删除长度
        advance(attr[0].length);
        //保存属性
        match.attrs.push({name:attr[1],value:attr[3]||attr[4]||attr[5]||true})
      }
      //匹配完成后，如果有 开始标签的结束 就把结束也删除
      if(end){
        advance(end[0].length);
      }
      return match;
    }
    //不是开始标签
    return false;
  }
  //html 最开始肯定是一个 <
  while(html){
    let textEnd = html.indexOf("<");
    //如果textEnd是0 表示 是标签，如<div id="app">{{name}}</div>
    //可能是开始标签，一开始的时候是开始标签 <div id="app">
    //也可能是结束标签，
    //  因为每次匹配到内容都会把响应的内容删除掉，
    //  所以在匹配到开始标签之后textEnd > 0 再匹配到文本，最后就剩下 </div>
    if(textEnd === 0){
      //开始标签的匹配结果
      const startTagMatch = parseStartTag();
      if(startTagMatch){
        //抛出数据，生成ast
        start(startTagMatch.tagName,startTagMatch.attrs);
        continue;
      }

      //结束标签的匹配结果
      const endTagMatch = html.match(endTag);
      if(endTagMatch){
        //抛出数据，生成ast
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue;
      }
    }
    //如果 textEnd > 0 就是文本的结束位置
    if(textEnd > 0){
      //标签中的内容
      let text = html.substring(0,textEnd);
      if(text){
        //抛出数据，生成ast
        chars(text);
        advance(text.length);
      }
    }
  }
  return root;
}