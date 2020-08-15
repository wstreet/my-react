export function setProps (dom, oldProps, newProps) {
  for (const key in oldProps) {
    
  }
  for (const key in newProps) {
    if (key !== 'children') {
      setProp(dom, key, newProps[key])
    }
  }
}

function setProp(dom, key, value) {
  if (/^on/.test(key)) {
    dom[key.toLowerCase()] = value
  } else if(key === 'style') {
    if(value) {
      for (const name in value) {
        dom.style[name] = value[name]
      }
    }
  } else {
    dom.setAttribute(key, value)
  }
}