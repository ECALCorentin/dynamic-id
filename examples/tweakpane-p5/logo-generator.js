import 'normalize.css'
import './style.scss'

import 'p5'
import { Pane } from 'tweakpane';

const pane = new Pane();
pane.title = "My logo"

let params = {
    x: 200,
    y: 200,
    size: 100,
    rotation: 0,
    color: '#ff6600'
};

function setup() {
    createCanvas(400, 400);
    angleMode(DEGREES);

    const pane = new Tweakpane.Pane({ container: document.getElementById('gui'), title: 'Logo Controls' });

    pane.addInput(params, 'x', { min: 0, max: width });
    pane.addInput(params, 'y', { min: 0, max: height });
    pane.addInput(params, 'size', { min: 10, max: 200 });
    pane.addInput(params, 'rotation', { min: 0, max: 360 });
    pane.addInput(params, 'color');
}

function draw() {
    background(240);
    push();
    translate(params.x, params.y);
    rotate(params.rotation);
    fill(params.color);
    noStroke();
    drawLogo(params.size);
    pop();
}

function drawLogo(s) {
    // Remplace ceci par ton logo (ici un triangle simple)
    beginShape();
    vertex(0, -s / 2);
    vertex(-s / 2, s / 2);
    vertex(s / 2, s / 2);
    endShape(CLOSE);
}