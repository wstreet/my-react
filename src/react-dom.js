import { TAG_ROOT } from './constant'
import scheduleRoot from './scheduleRoot'

function render(element, container) {
  // 根节点对应的fiber
  const rootFiber = {
    type: TAG_ROOT,
    // stateNode: 原生节点(host)，指向真实dom元素
    stateNode: container,
    props: {
      children: [element]
    }
  }

  // 从root开始调度
  scheduleRoot(rootFiber)
  
}


export default {
  render
}