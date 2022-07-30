(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  /**合并选项 */
  function mergeOptions(parent, child) {
    var options = {}; //定义一个新对象用来存储合并后的对象
    //先合并父选项

    for (var key in parent) {
      mergeField(key);
    } //再用子选项来覆盖和合并父选项


    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      //采用策略模式减少 if/else
      //如果不在策略中优先使用子
      if (strats[key]) {
        options[key] = strats[key](parent[key], child[key]);
      } else {
        //优先使用子的，再使用父的
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  } //策略模式

  var strats = {};
  var LIFECYCLE = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      // 第一次合并：{} + {created:fn} => {created:[fn]}
      // 第二次合并：{created:fn1} + {created:fn2} => {created:[fn1,fn2]}
      if (c) {
        if (p) {
          // 父子都有
          return p.concat(c);
        } else {
          // 只有子有,初始化过程
          return [c];
        }
      } else {
        // 如果子没有，就直接使用父的
        // 只要经过初始化过程， 父 就已经是个数组
        // 如 {created:[fn]} + {a:1}
        return p;
      }
    };
  });

  function initGlobalAPI(Vue) {
    //Vue静态属性和方法
    Vue.options = {};

    Vue.mixin = function (mixin) {
      //将用户选项和全局的options合并
      this.options = mergeOptions(this.options, mixin);
      return this;
    };
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /**
   * 一般解析html 都不会自己去写，可以使用第三方包，htmlparser2
   * 也可以在 https://astexplorer.net/ 感受 ast的转化
   */
  //可视化正则表达式 https://regexper.com
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //匹配标签名
  //?:代表不捕获分组,使用match后将不会?:的分组不会出现

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //匹配标签名和带命名空间的标签,如<namespace:div>
  //匹配开始标签

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到的分组是一个标签名 <div 匹配到的分组就是开始标签的名字
  //匹配结束标签

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配的是 </xxx> 最终匹配到的分组就是结束标签的名字
  //匹配属性,第一个属性就是 key，value 就是 分组3/4/5

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>']+)))?/; //匹配闭合标签 > 或者 />

  var startTagClose = /^\s*(\/?)>/; // /> <br/>
  //解析html,vue3并不是使用正则来进行匹配的

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = []; //用来存放元素的栈

    var currentParent; //指向栈顶元素

    var root; //根节点
    //----------------- 转成 ast -------------------
    //创建ast元素

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        attrs: attrs,
        type: ELEMENT_TYPE,
        children: [],
        parent: null
      };
    } //获取开始标签回调


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs);

      if (!root) {
        //如果还没有根节点，当前ast节点就是根节点
        root = node;
      }

      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      stack.push(node);
      currentParent = node;
    } //获取标签中内容回调


    function chars(text) {
      text = text.replace(/\s/g, ''); // 文本直接放到当前节点中

      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    } //获取结束标签回调


    function end(tag) {
      stack.pop(); //每次遇到结束标签都进行出栈操作

      currentParent = stack[stack.length - 1]; //重新指向栈顶
    } //----------------- 转成 ast -------------------
    //截取内容


    function advance(length) {
      html = html.substring(length);
    } //匹配解析开始标签


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        // 是开始标签
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        }; //每次匹配成功都将成功的部分删除掉，然后继续匹配，这样就不会重复匹配之前的

        advance(start[0].length); //如果不是开始标签的结束就一直匹配下去

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          //删除长度
          advance(attr[0].length); //保存属性

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        } //匹配完成后，如果有 开始标签的结束 就把结束也删除


        if (_end) {
          advance(_end[0].length);
        }

        return match;
      } //不是开始标签


      return false;
    } //html 最开始肯定是一个 <


    while (html) {
      var textEnd = html.indexOf("<"); //如果textEnd是0 表示 是标签，如<div id="app">{{name}}</div>
      //可能是开始标签，一开始的时候是开始标签 <div id="app">
      //也可能是结束标签，
      //  因为每次匹配到内容都会把响应的内容删除掉，
      //  所以在匹配到开始标签之后textEnd > 0 再匹配到文本，最后就剩下 </div>

      if (textEnd === 0) {
        //开始标签的匹配结果
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          //抛出数据，生成ast
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } //结束标签的匹配结果


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          //抛出数据，生成ast
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      } //如果 textEnd > 0 就是文本的结束位置


      if (textEnd > 0) {
        //标签中的内容
        var text = html.substring(0, textEnd);

        if (text) {
          //抛出数据，生成ast
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  /**生成属性代码 */

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name == 'style') {
        (function () {
          //如果是 style 就将值转换成对象,color:red;background:red -> {color:'red',background:'red'}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}"); //去除最后一个 ,
  } //匹配表达式变量


  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{ xxx }}

  /**生成节点代码 */

  function gen(node) {
    if (node.type === 1) {
      //标签节点
      return codegen(node);
    } else {
      //文本
      var text = node.text;

      if (defaultTagRE.test(text)) {
        //带模版语法的文本 {{name}} hello {{age}} world
        var token = []; //捕获匹配到的值

        var match; //因为正则表达式中的 g，
        //在匹配的时候会把上一次匹配到的字符串的最后一个字符的索引用lastIndex保存，
        //无论是 .test 还是 .match .exec 都会记录
        //下次就会从lastIndex的位置开始匹配，
        //有三种方式可以重置开始位置，1:重新设置 reg.lastIndex = 0 2:重新赋值表达式 reg = // 3:重新编译表达式 reg.compile()

        defaultTagRE.lastIndex = 0;
        var lastIndex = 0; //上次匹配到的位置

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; //当前匹配到的位置

          if (index > lastIndex) {
            //如果上次匹配到的位置小于当前位置就把中间的这段内容也放进去
            token.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          token.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          token.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(token.join('+'), ")");
      } else {
        //普通纯文本
        return "_v('".concat(text, "')");
      }
    }
  }
  /**生成children代码 */


  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }
  /*生成渲染函数代码 */


  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c(\n      '".concat(ast.tag, "',\n      ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', "\n      ").concat(ast.children.length ? ",".concat(children) : '', "\n    )");
    return code;
  }
  /**编译模版形成渲染函数 */


  function compileToFunction(template) {
    // 1将template 转化成 ast 语法树
    var ast = parseHTML(template); // 2生成 render方法（render）,是用with指定执行上下文
    // 模版引擎的原理就是 with + new Function(code)

    var code = "with(this){return ".concat(codegen(ast), ";}"); // 根据代码生成函数

    var render = new Function(code);
    return render;
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 属性的dep 需要收集 watcher
      // 存放当前属性对应的watcher有哪些

      this.subs = [];
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        Dep.target.addDep(this); //让watcher记住dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
      /**通知watcher进行更新 */

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }(); //添加一个静态属性，用来存放临时的 watcher
  //当 watcher 调用 get() 方法进行渲染的时候会去vm上取值，
  //取值的时候就会触发数据劫持的 get ，此时就可以将这个watcher进行收集了


  Dep.target = null;

  var id = 0; // dep 和 watcher 就是观察者模式
  // 每个属性有一个 dep（属性就是被观察者），watcher就是观察者（属性变化了会通知观察者更新）
  // 需要给每个属性都增加一个dep,目的就是收集watcher
  // 一个组件中有多个属性（n个属性会对应一个视图）n个dep对应一个watcher
  // 1个属性也可以被多个组件使用，所以 1个dep对应多个watcher
  // 所以 dep 和 watcher 是 多对多的关系
  //当我们创建渲染watcher的时候我们就会把当前的渲染watcher放到Dep.target上
  //调用 _render() 会取值，触发属性的 get

  var Watcher = /*#__PURE__*/function () {
    /**
     * @param vm 组件实例
     * @param fn 更新组件的方法
     * @param options 是否是一个渲染watcher
     */
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

      //id 用来区分每个组件的watcher
      this.id = id++; //是否是一个渲染watcher

      this.renderWatcher = options; //getter 意味着调用这个函数可以发生取值操作,也就是收集依赖

      this.getter = fn; // 后续实现计算属性和一些清楚工作的时候需要用到dep
      // 比如说某个组件卸载了，需要再dep中移除当前watcher
      // 所以再这里还需要将dep也记录收集一下

      this.deps = [];
      this.depsId = new Set(); //初始的时候调用一下 getter

      this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        Dep.target = this; //缓存当前 watcher 实例

        this.getter(); //会去vm上取值

        Dep.target = null; //重新滞空，当进行普通的取值使用的时候不需要进行依赖收集
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件 watcher 中，可能会使用多个重复的属性，重复的属性不需要记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep); //watcher记录dep

          this.depsId.add(id);
          dep.addSub(this); //dep记录watcher
        }
      }
      /**重新更新 */

    }, {
      key: "update",
      value: function update() {
        // this.get();
        // 异步更新先将当前 watcher 暂存起来
        queueWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }]);

    return Watcher;
  }();
  /**刷新执行队列命令 */


  function flushSchedulerQueue() {
    // 在刷新的过程中可能还有新的watcher加入，重新放到queue中，所以先复制一份queue
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  var queue = [];
  var has = {};
  var pending = false; //防抖

  /**缓存watcher */

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  /**执行nextTick队列任务 */


  function flushCallbacks() {
    var cbs = callbacks.slice(0);
    callbacks = [];
    waiting = false;
    cbs.forEach(function (cb) {
      return cb();
    });
  }

  var callbacks = [];
  var waiting = false;
  /**
   * 异步更新回调
   * nextTick 不是创建了一个异步任务，而是将这个任务维护到了队列中而已
   */

  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      //创建异步任务的时候，在vue2中，并没有直接使用某个API，而是使用优雅降级的方式
      //（vue3中因为已经不在兼容ie了，所以直接采用了promise）
      //内部先采用优先顺序是： 
      // promise（ie不兼容）
      // MutationObserver（H5新接口，只能在浏览器中使用）
      // setImmediate（ie专享）
      // setTimeout
      // setTimeout(()=>{flushCallbacks();},0);
      timerFunc();
      waiting = true;
    }
  }
  /**异步任务适配 */

  var timerFunc;

  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks, 0);
    };
  }

  /**生成虚拟节点，也就是vue中的 h(), _c() */
  function createElementVNode(vm, tag, data) {
    if (data == null) data = {};
    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  }
  /**生成文本虚拟节点，_v() */

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  /**
   * 创建虚拟节点
   * ast做的事语法层面的转化，
   * vnode描述的DOM元素，可以增加一些自定义的属性
   */

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  /**创建真实DOM */

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      //标签
      //将真实DOM挂载到虚拟DOM上，方便后续修改属性
      vnode.el = document.createElement(tag); // 设置属性

      patchProps(vnode.el, data); // 添加子节点

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      //tag为undefined就是个文本节点
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  /**更新和初始化真实DOM的属性 */


  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        //值是 [{color:'red'}]
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }
  /**初始化和更新DOM */


  function patch(oldNode, vnode) {
    console.log(vnode); //真实DOM中才有nodeType

    var isRealElement = oldNode.nodeType;

    if (isRealElement) {
      //是真实DOM，进行初始化挂载
      var elm = oldNode; //当前节点

      var parentElm = elm.parentNode; //创建真实DOM

      var newElm = createElm(vnode); //先在原来的后面添加节点，然后再删除老节点

      parentElm.insertBefore(newElm, elm.nextSibiling); //添加新节点

      parentElm.removeChild(elm); //删除老节点

      return newElm;
    }
  }

  function initLifeCycle(Vue) {
    /**将虚拟DOM转化成真实DOM */
    Vue.prototype._update = function (vnode) {
      var vm = this;
      var el = vm.$el; //patch 既有初始化的功能，又有更新的方法

      vm.$el = patch(el, vnode);
    };
    /**生成虚拟节点 */


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    /**生成文本虚拟节点 */


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };
    /**生成虚拟DOM */


    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };
    /**生成虚拟DOM */


    Vue.prototype._render = function () {
      var vm = this; //当渲染的时候回去实例中取值，就可以将属性和视图绑定在一起了

      return vm.$options.render.call(vm); //通过ast语法转义后生成的render方法
    };
  }
  /**将组件挂载到DOM上 */

  function mountComponent(vm, el) {
    // 将节点挂载到实例上，方便之后访问
    vm.$el = el; // 1.调用render方法产生虚拟节点，虚拟DOM

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent); // 2.根据虚拟DOM产生真实DOM
    // 3.插入到el元素中
  }
  /**
   * vue核心流程
   * 1.创造响应式数据
   * 2.模版转换成ast语法树
   * 3.将ast语法树转换成了render函数
   * 4.后续每次数据更新可以只执行render函数（无需再次执行ast转化的过程）
   */
  // render 函数会去产生虚拟节点（使用响应式数据）
  // 根据生成的虚拟节点创造正式的DOM
  // ---------------------------------------------------------------------

  /**调用选项中的生命钩子函数 */

  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handler) {
        return handler.call(vm);
      });
    }
  }

  // 重写数组中的部分方法
  var oldArrayProto = Array.prototype; // 先复制一份原型

  var newArrayProto = Object.create(oldArrayProto); //列举出所有需要重新的方法

  var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']; // 开始重新方法

  methods.forEach(function (item) {
    //重写方法
    newArrayProto[item] = function () {
      var _oldArrayProto$item;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 内部还是调用原来的方法
      var result = (_oldArrayProto$item = oldArrayProto[item]).call.apply(_oldArrayProto$item, [this].concat(args)); // 当新增数据时，还需要对新数据进行观察


      var inserted;
      var ob = this.__ob__;

      switch (item) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          //[1,2,3].splice(1,0,4,5);表示在2的位置插入 4，5
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        //对新增的数据进行观测
        //这里唯一可以拿到的关联数据就是this，但是我们需要调用 Observer 中的 observeArray 来观察新数据
        //而在创建 Observer 的时候又将 实例挂载到了 __ob__ 上，所以
        ob.observeArray(inserted);
      } //数组变化了，通知对应的watcher实现更新


      ob.dep.notify();
      return result;
    };
  });

  /**通过 Object.defineProperty来劫持数据 */

  function observe(data) {
    //只能对对象进行劫持，所以要先进行判断
    if (_typeof(data) !== 'object' || data === null) {
      return;
    } //如果data 上有 __ob__ 并且是 Observer 时说明，这个对象已经被观测过了


    if (data.__ob__ instanceof Observer) {
      return;
    } //如果一个对象已经被劫持过了，那就不用再被劫持
    //（需要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）


    return new Observer(data);
  }
  /**观察者（被劫持对象） */

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //给每个对象都增加收集功能
      this.dep = new Dep(); //Object.defineProperty只能劫持已经存在的属性（vue里面会为添加，删除属性的方法添加一些api，如$set,$delete）
      //将当前实例赋值给__ob__属性保存下来，方便在其他的地方调用实例的方法
      //并且添加这个标识之后就可以知道这个数据已经被观察过了，不用在进行观察
      // data.__ob__ = this;
      //不过直接这样添加的话，在调用 this.walk(data) 的时候会形成死循环，可以这样解决

      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false //不可枚举，循环时就获取不了

      });

      if (Array.isArray(data)) {
        //当值为数组的也是可以对其进行劫持的，但是数组长度很长的时候就会非常消耗性能
        //而且一般也不会通过索引来访问很设置值，所以vue中并不会劫持数组，而是重构数组的方法来实现响应式数据
        data.__proto__ = newArrayProto; //如果数组中的某个元素是对象的时候也是需要对其进行劫持的

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        //循环对象，对每个数据都进行劫持
        //每次劫持都是一个重新定义属性的过程，所以会比较耗性能
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }();
  /**重新定义属性 */


  function defineReactive(target, key, value) {
    //如果值是对象，那么还需要继续对数据进行劫持
    var childOb = observe(value); //childOb.dep 用来收集依赖
    //为每个属性创建一个dep,闭包中不会被销毁

    var dep = new Dep(); //这里用到了 闭包 来保存 value 值。

    Object.defineProperty(target, key, {
      get: function get() {
        //取值时
        if (Dep.target) {
          //当进行普通的取值使用的时候不需要进行依赖收集
          dep.depend(); //让这个属性的收集器记住当前的watcher

          if (childOb) {
            //让数组和对象本身也实现依赖收集
            childOb.dep.depend(); //如果值是一个数组的话，还需要对里面的值进行依赖收集
            //解决多维数组的问题

            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newVal) {
        //设置值时
        if (newVal === value) return; //如果设置的值是一个对象时，需要继续对这个对象进行劫持

        observe(newVal);
        value = newVal;
        dep.notify(); //设置值的时候通知watcher更新渲染
      }
    });
  }
  /**收集数组数据的依赖 */

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  /**初始化状态 */

  function initState(vm) {
    var opts = vm.$options; //获取用户的选项

    if (opts.data) {
      //初始化数据，生成相应式数据
      initData(vm);
    }
  }
  /**初始化数据，生成相应式数据 */

  function initData(vm) {
    var data = vm.$options.data; //如果data 是函数还需要先执行才能回去到要劫持的数据

    data = typeof data === 'function' ? data.call(vm) : data; //进行数据劫持，来创建响应式数据

    observe(data); //为了方便之后访问 data，给实例挂载一个 _data

    vm._data = data; //但是这样的话就需要使用 vm._data.xxx 来访问，这样不够优雅
    //所以可以将 vm._data 用vm来代理就可以用 vm.xxx来访问 _data 中的属性了

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }
  /**代理 */


  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }

  /**
   * 初始化函数，就是为Vue添加_init方法
   * @param { Vue构造函数 } Vue 
   */

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      //将 options 挂载到 实例的 $options 上方便后续方法的访问
      var vm = this; //合并选项并赋值,定义的全局过滤器，指令等都会挂载上去
      // this 指向Vue实例，在实例上没有constructor，但是会在原型链上查找

      vm.$options = mergeOptions(this.constructor.options, options); // 调用生命周期函数

      callHook(vm, "beforeCreate"); // 初始化状态

      initState(vm); // 调用生命周期函数

      callHook(vm, "beforeCreate"); // 实现数据的挂载

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var opts = vm.$options; //优先级 render > template > el

      if (!opts.render) {
        //查看是否有render函数
        // 没有render函数，表示并不是用户自己写的渲染方法
        // 如果没有template，有el就使用el作为模版，如果有template就使用template
        var template;

        if (!opts.template && el) {
          template = el.outerHTML;
        } else {
          if (el) {
            //如果有el则采用模版内容
            template = opts.template;
          }
        }

        if (template) {
          //这里需要对模版进行编译
          var render = compileToFunction(template);
          opts.render = render; // jsx 最终会被编译成 h('xxx')
        }
      } //组件挂载


      mountComponent(vm, el); //最终就可以获取render方法
      // script 标签引用的 vue.global.js 这个编译过程是在浏览器运行的
      // runtime 是不包含模版编译的，整个编译时打包的时候通过loader来进行转义.vue文件的
      // 所以用runtime的时候不能使用template
    };
  }

  function Vue(options) {
    //options 就是用户的选项
    this._init(options);
  } // 添加方法


  Vue.prototype.$nextTick = nextTick;
  initMixin(Vue);
  initLifeCycle(Vue);
  initGlobalAPI(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
