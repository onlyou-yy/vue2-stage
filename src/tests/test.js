import Vue from "..";
import { compileToFunction } from "../compiler";
import { createElm, patch } from "../vdom/patch";

//------------- 观察前后节点，测试 -------------

let vm = new Vue({data:{name:'jack'}});
let render1 = compileToFunction(
`<ul>
<li key="1">1</li>
<li key="2">2</li>
<li key="3">3</li>
</ul>`
);
let preVNode = render1.call(vm);
let el1 = createElm(preVNode);

let render2 = compileToFunction(
`<ul>
<li key="8">8</li>
<li key="4">4</li>
<li key="3">3</li>
<li key="9">9</li>
<li key="5">5</li>
<li key="2">2</li>
<li key="6">6</li>
<li key="7">7</li>
<li key="10">10</li>
</ul>`
);


let nextVNode = render2.call(vm);
let el2 = createElm(nextVNode);

document.body.appendChild(el1);
//以往都是直接替换掉整个元素
//在每次获取dom的时候都要重新计算dom位置以及其他的一些属性
//而且在创建dom的时候会初始化很多dom中的属性和方法
//所以这样做是比较耗性能
setTimeout(()=>{
  patch(preVNode,nextVNode)
  el1.parentNode.replaceChild(el2,el1);
},3000)

console.log(preVNode,nextVNode);