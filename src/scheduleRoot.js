 
/**
 * 两个阶段
 * 1、render阶段：两个任务，①根据虚拟DOM生成fiber树，②收集effect list
 * 2、commit阶段：进行dom创建、更新，此阶段一气呵成，不可暂停
 */



/**
 * 从根节点渲染和调度
 *
 * @param {*} rootFiber
 */

let nextUnitOfWork = null
function scheduleRoot(rootFiber) {
  nextUnitOfWork = rootFiber
  
}

// 循环执行工作
function workLoop() {

}


export default scheduleRoot