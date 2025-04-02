import 'normalize.css'
import './style.scss'

import 'p5'
import { Pane } from 'tweakpane';

const pane = new Pane();
pane.title = "My poster"

const PARAMS = {
  xPosition: 0, // %
  bgColor: '#0000ff',
  dimensions: { x: 300, y: 500 },
};

pane.addBinding(PARAMS, 'xPosition', {
  min: 0,
  max: 100
})

pane.addBinding(PARAMS, 'dimensions', {
  picker: 'inline',
  x: { min: 1, step: 1 },
  y: { min: 1, step: 1 },
}).on('change', (event) => {
  const { x, y } = event.value
  resizeCanvas(x, y)
});

pane.addBinding(PARAMS, 'bgColor');

pane.addButton({
  title: 'Save image',
}).on('click', () => {
  saveCanvas()
});

let svg;

window.preload = function () {
  svg = loadImage('/vite.svg')
}

window.setup = function () {
  const { x, y } = PARAMS.dimensions
  const p5Canvas = createCanvas(x, y)
  p5Canvas.parent('app') // attach canvas to #app
  pixelDensity(1) // disable retina display scaling
  imageMode(CENTER)
}

window.draw = function () {
  background(PARAMS.bgColor)

  const x = PARAMS.xPosition / 100 * width

  image(svg, mouseX, mouseY)
  ellipse(x, height / 2, 200)
}