 
/**
 * 两个阶段
 * 1、render阶段：两个任务，①根据虚拟DOM生成fiber树，②收集effect list
 * 2、commit阶段：进行dom创建、更新，此阶段一气呵成，不可暂停
 */

import { TAG_ROOT, ELEMENT_TEXT, TAG_TEXT, PLACEMENT, TAG_HOST } from "./constant"

import { setProps } from './utils'

/**
 * 从根节点渲染和调度
 *
 * @param {*} rootFiber
 */

 // 下一个工作单元
let nextUnitOfWork = null
// 保存应用的根
let workInProgressRoot = null


function scheduleRoot(rootFiber) {
  
  nextUnitOfWork = rootFiber
  workInProgressRoot = rootFiber
}


// 执行每一个工作单元（fiber节点）
function performUnitOfWork(currentFiber) {
  // 1根据当前fiber创建dom元素  2创建子fiber
  berginWork(currentFiber) // 开始

  // 有子fiber就返回作为下一个工作单元
  if(currentFiber.child) {
    return currentFiber.child
  }

 
  // 如果没有child，完成当前结点，再找sibling
  while (currentFiber) {
    completeUnitOfWork(currentFiber)

    // 再找兄弟节点
    if(currentFiber.sibling) {
      return currentFiber.sibling
    }

    // 如果没有sibling
    currentFiber = currentFiber.return
  }
}


/**开始阶段
 * 1、创建当前节点对应的dom元素  
 * 2、创建子fiber
 *
 * @param {*} currentFiber
 */
function berginWork(currentFiber) {
  // 根fiber
  if(currentFiber.tag === TAG_ROOT) {
    updateHostRoot(currentFiber)
  } else if(currentFiber.tag === TAG_TEXT) {
    updateHostText(currentFiber)
  } else if(currentFiber.tag === TAG_HOST) {
    updateHost(currentFiber)
  }
}

// 处理原生dom元素
function updateHost(currentFiber) {
 // stateNode没有值，创建dom元素
 if(!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
  const newChildren = currentFiber.props.children
  // 创建子fiber
  reconcileChildren(currentFiber, newChildren)
}

// 处理文本元素
function updateHostText(currentFiber) {
  // stateNode没有值，创建dom元素
  if(!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
}

function createDOM(currentFiber) {

  if(currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text)
  } else if (currentFiber.tag === TAG_HOST) {
    
    let stateNode = document.createElement(currentFiber.type)
    updateDOM(stateNode, {}, currentFiber.props)
    return stateNode
  }
}

// 更新属性
function updateDOM(dom, oldProps, newProps) {
  setProps(dom, oldProps, newProps)
}

// 更新根节点
function updateHostRoot(currentFiber) {
  // 根节点已经存在对应的dom，直接创建子fiber
  let newChildren = currentFiber.props.children
  reconcileChildren(currentFiber, newChildren)
}

// 创建子fiber
function reconcileChildren(currentFiber, newChildren) {
  let newChildrenIndex = 0 // 子节点的索引
  let prevSibling // 上一个子fiber
  while (newChildrenIndex < newChildren.length) {
    let newChild = newChildren[newChildrenIndex] // 去除虚拟dom节点
    let tag
    if(newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT // 文本节点
    } else if(typeof newChild.type === 'string') {
      tag = TAG_HOST // 原生dom节点   div span等
    }
    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null, // 还没有创建对应的dom节点
      return: currentFiber,
      effectTag: PLACEMENT, // 副作用标识，删除、更新、插入
      nextEffect: null,
    }
    if(newChildrenIndex === 0) {
      currentFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }
 
    prevSibling = newFiber

    newChildrenIndex ++
  }
}

// 收集有副作用的fiber，组成effect List
function completeUnitOfWork(currentFiber) {
  let returnFiber = currentFiber.return

  if (returnFiber) {
    ////////////////将子fiber的effect 收集到父fiber上/////////////////////
    if(!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect
    }
    if(currentFiber.lastEffect) {
      if(returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      }
    }
    returnFiber.lastEffect = currentFiber.lastEffect


    //////////////将自己的effect 收集到父fiber上////////////////////
    const effectTag = currentFiber.effectTag
    if (effectTag) {
      if(returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber
      } else {
        returnFiber.firstEffect = currentFiber
      }
      
      returnFiber.lastEffect = currentFiber
      
    }
    
  }
}



// 循环执行工作
function workLoop(deadline) {
  let shouldYield = false // 是否需要交出控制权给浏览器
  while(nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1 // 没有剩余时间执行下一个unitOfWork,交出控制权
  }

  if(!nextUnitOfWork && workInProgressRoot) {
    console.log('render阶段结束')
    // 开始commit，浏览器渲染
    commitRoot()
  }

  // 不管有没有任务，都请求调度，每一帧都执行一次workLoop
  requestIdleCallback(workLoop, { timeout: 500 })
}

function commitRoot() {
  
  let currentFiber =  workInProgressRoot.firstEffect
  while(currentFiber) {
    commitWork(currentFiber)
    currentFiber = currentFiber.nextEffect
  }
  workInProgressRoot = null
}

function commitWork(currentFiber) {
  
  if(!currentFiber) {
    return
  }
  let returnFiber = currentFiber.return
  let returnDOM = returnFiber.stateNode
  if (currentFiber.effectTag === PLACEMENT) {
     returnDOM.appendChild(currentFiber.stateNode)
  }
  currentFiber.effectTag = null
}

// 让浏览器在空闲的时候执行workLoop，如果浏览器一直在忙，并且超过
// timeout设置的时间，那就强制让浏览器执行workLoop
requestIdleCallback(workLoop, { timeout: 500 })

export default scheduleRoot