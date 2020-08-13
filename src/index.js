import React from './react';
import ReactDOM from 'react-dom';

const style={
  border: '2px solid red',
  padding: 20,
  // width: 200
}

const element = (
  <div id="A1" style={style}>
    A1
    <div id="B1" style={style}>B1</div>
    <div id="B2" style={style}>
      B2
      <div id="C1" style={style}>C1</div>
      <div id="C2" style={style}>C2</div>
    </div>
  </div>
)

console.log(element);

ReactDOM.render(
  element,
  document.getElementById('root')
);
