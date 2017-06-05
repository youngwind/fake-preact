class VNode {
    constructor(nodeName, attributes, children) {
        this.nodeName = nodeName;
        this.attributes = attributes;
        this.children = children;
    }
}

class Component {
    constructor() {
        this.props = {};
        this.nextProps = {};
        this.state = {};
    }

    setState(state) {
        extend(this.state, state);
        renderComponent(this);
    }

    render(props) {
        return h('div', null, props.children);
    }

    shouldComponentUpdate(props, state) {
        return true;
    }
}

function render(vNode, parent) {
    let builtDOM = build(vNode);
    parent.appendChild(builtDOM);
    return builtDOM;
}

/**
 * 给定旧 dom 和新的 vNode，修改旧 dom，生成新 dom（存放在 newChildren 数组中），最终返回新的 dom
 * @param {VNode} vNode 虚拟 dom
 * @param {DOM} dom 旧 dom
 * @returns {DOM} 新的 DOM
 */
function build(vNode, dom) {
    // ①文本节点
    if (typeof vNode === 'string' || typeof vNode === 'number') {
        if (dom) {
            if (dom.nodeType === 3) {
                if (vNode !== dom.textContent) {
                    dom.textContent = vNode;
                }
                return dom;
            }
        }
        return document.createTextNode(vNode);
    }

    let {nodeName, attributes: attrs, children: vChildren} = vNode;

    // ②组件节点
    if (typeof nodeName === 'function') {
        return buildComponentFromVNode(vNode, dom);
    }

    // ③普通 Element 节点
    let out = dom;  // out 是挂载新 dom 的最外层节点，必不可少
    if (typeof nodeName === 'string') {
        if (!dom) {
            out = document.createElement(nodeName);
        }

        // 处理节点的属性（包括事件绑定）
        if (attrs) {
            for (let key in attrs) {
                if (!attrs.hasOwnProperty(key)) continue;
                setAttributes(out, key, attrs[key]);
            }
        }

        // 遍历 vNode.children，逐个地递归调用 build 函数，生成新 DOM
        let children, newChildren = [];
        if (out && out.childNodes) {
            children = Array.from(out.childNodes);  // 获取旧 dom 的子节点集合
        }

        if (vChildren && vChildren.length) {
            vChildren.forEach((vchild, i) => {
                let child = children[i];
                newChildren.push(build(vchild, child));
            });
        }

        // 判断新子节点是否已经存在原有 DOM 中
        newChildren.forEach((newChild, i) => {
            if (children[i] !== newChild) {
                out.appendChild(newChild);
            }
        });
    }
    return out;
}

/**
 * 根据情况触发组件的新建和更新
 * @param {VNode} vNode 虚拟DOM
 * @param {DOM} dom 原有 dom（可能为空）
 * @returns {*}
 */
function buildComponentFromVNode(vNode, dom) {
    let component = dom && dom._component || new vNode.nodeName();
    let props = getNodeProps(vNode);

    setComponentProps(component, props);
    renderComponent(component);

    return component.base;
}

/**
 * 组件渲染主体逻辑
 * ① 生成新的 vNode → rendered
 * ② 构建出新的 DOM → base
 * ③ 挂载到 base 上
 * @param {Component} component 组件
 */
function renderComponent(component) {
    let p = component.nextProps;
    let s = component.state;

    // 非首次渲染
    if (component.base) {
        if (hook(component, 'shouldComponentUpdate', p, s) === false) {
            component.props = p;
            return;
        }
        hook(component, 'componentWillUpdate');
    } else {
        hook(component, 'componentWillMount');
    }

    component.props = p;
    let rendered = hook(component, 'render', p, s);
    let base = build(rendered, component.base);

    if (component.base) {
        hook(component, 'componentDidUpdate');
    } else {
        hook(component, 'componentDidMount');
    }

    if (base) {
        component.base = base;
        component.base._component = component;
    }

    return base;
}


/**
 * 把最新的 props 覆盖 nextProps
 * @param {Component} component 组件
 * @param {Object} props 新的props
 */
function setComponentProps(component, props) {
    hook(component, 'componentWillReceiveProps', props, component.props);
    component.nextProps = props;
}

function h(nodeName, attributes, ...args) {
    let children = args.length ? [].concat(...args) : null;
    return new VNode(nodeName, attributes, children);
}

/**
 * 从 vNode 从获得属性
 * @param {VNode} vNode 虚拟DOM
 * @returns {Object}
 */
function getNodeProps(vNode) {
    return {...vNode.attributes};
}

function hook(obj, name, ...args) {
    let fn = obj[name];
    if (fn && typeof fn === 'function') {
        return fn.apply(obj, args);
    }
}

function setAttributes(node, attr, value) {
    let prefix = attr.substring(0, 2);
    // 事件绑定
    if (prefix === 'on' && typeof value === 'function') {
        let eventType = attr.substring(2, attr.length).toLowerCase();
        let listeners = node._listeners || (node._listeners = {});
        if (!listeners[eventType]) {
            node.addEventListener(eventType, value);
        }
        listeners[eventType] = value;
        return;
    }
    node.setAttribute(attr, value);
}

function extend(obj, props) {
    for (let key in props) {
        if (props.hasOwnProperty(key)) {
            obj[key] = props[key];
        }
    }
    return obj;
}

export default {
    render,
    h,
    Component
}