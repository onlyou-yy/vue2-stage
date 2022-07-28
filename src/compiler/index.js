import { parseHTML } from "./parse";

/**生成属性代码 */
function genProps(attrs){
  let str = '';
  for(let i = 0;i < attrs.length;i++){
    let attr = attrs[i];
    if(attr.name == 'style'){
      //如果是 style 就将值转换成对象,color:red;background:red -> {color:'red',background:'red'}
      let obj = {};
      attr.value.split(';').forEach(item=>{
        let [key,value] = item.split(':');
        obj[key] = value;
      })
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0,-1)}}`;//去除最后一个 ,
}

//匹配表达式变量
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;//{{ xxx }}
/**生成节点代码 */
function gen(node){
  if(node.type === 1){
    //标签节点
    return codegen(node);
  }else{
    //文本
    let text = node.text;
    if(defaultTagRE.test(text)){
      //带模版语法的文本 {{name}} hello {{age}} world
      let token = [];
      //捕获匹配到的值
      let match;
      //因为正则表达式中的 g，
      //在匹配的时候会把上一次匹配到的字符串的最后一个字符的索引用lastIndex保存，
      //无论是 .test 还是 .match .exec 都会记录
      //下次就会从lastIndex的位置开始匹配，
      //有三种方式可以重置开始位置，1:重新设置 reg.lastIndex = 0 2:重新赋值表达式 reg = // 3:重新编译表达式 reg.compile()
      defaultTagRE.lastIndex = 0;
      let lastIndex = 0;//上次匹配到的位置
      while(match = defaultTagRE.exec(text)){
        let index = match.index;//当前匹配到的位置
        if(index > lastIndex){
          //如果上次匹配到的位置小于当前位置就把中间的这段内容也放进去
          token.push(JSON.stringify(text.slice(lastIndex,index)));
        }
        token.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if(lastIndex < text.length){
        token.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${token.join('+')})`;
    }else{
      //普通纯文本
      return `_v('${text}')`;
    }
  }
}
/**生成children代码 */
function genChildren(children){
  return children.map(child => gen(child)).join(',');
}

/*生成渲染函数代码 */
function codegen(ast){
  let children = genChildren(ast.children);
  let code = (
    `_c(
      '${ast.tag}',
      ${ast.attrs.length > 0 ? genProps(ast.attrs): 'null'}
      ${ast.children.length ? `,${children}`:''}
    )`
  );
  return code;
}

/**编译模版形成渲染函数 */
export function compileToFunction(template){
  // 1将template 转化成 ast 语法树
  let ast = parseHTML(template);
  // 2生成 render方法（render）,是用with指定执行上下文
  // 模版引擎的原理就是 with + new Function(code)
  let code = `with(this){return ${codegen(ast)};}`;
  // 根据代码生成函数
  let render = new Function(code);
  return render;
}