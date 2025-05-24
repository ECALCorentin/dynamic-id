import 'normalize.css'
import './style.scss'

import 'p5'
import { Pane } from 'tweakpane'

// Initialize global variables
globalThis.logoParams = {
    canvas: {
        color: '#000000'
    },
    letters: {
        M: { x: 80, y: 100, scale: 1, rotation: 0, shape: 'square' },
        A: { x: 155, y: 100, scale: 1, rotation: 0, shape: 'hexagon' },
        S: { x: 220, y: 100, scale: 1, rotation: 0, shape: 'circle' },
        C: { x: 285, y: 100, scale: 1, rotation: 0, shape: 'hexagon' }
    }
};

let logoPane = null;

globalThis.initLogoControls = function() {
    try {
        // Create container for controls
        const logoControlsContainer = document.createElement('div');
        logoControlsContainer.id = 'logo-controls';
        document.getElementById('logo').appendChild(logoControlsContainer);

        // Initialize Tweakpane
        logoPane = new Pane({
            container: logoControlsContainer,
            title: 'Logo Controls'
        });

        // Letter controls
        Object.keys(globalThis.logoParams.letters).forEach(letter => {
            const letterFolder = logoPane.addFolder({
                title: `Letter ${letter}`
            });
            letterFolder.addBinding(globalThis.logoParams.letters[letter], 'x', {
                min: 0,
                max: 400
            });
            letterFolder.addBinding(globalThis.logoParams.letters[letter], 'y', {
                min: 0,
                max: 200
            });
            letterFolder.addBinding(globalThis.logoParams.letters[letter], 'scale', {
                min: 0.1,
                max: 2
            });
            letterFolder.addBinding(globalThis.logoParams.letters[letter], 'rotation', {
                min: 0,
                max: 360
            });
            letterFolder.addBinding(globalThis.logoParams.letters[letter], 'shape', {
                options: {
                    Square: 'square',
                    Hexagon: 'hexagon',
                    Circle: 'circle'
                }
            });
        });
    } catch (error) {
        console.error('Error initializing controls:', error);
    }
};

globalThis.logoSetup = function(p) {
    const logoCanvas = p.createCanvas(400, 200);
    logoCanvas.parent('logo');
    p.angleMode(p.DEGREES);
    
    // Initialize controls after canvas is created
    globalThis.initLogoControls();
}

function drawHexagon(p, size) {
    p.beginShape();
    for (let i = 0; i < 6; i++) {
        const angle = i * 60; // Remove the 30 degree rotation to have flat faces on top/bottom
        const x = size * p.cos(angle);
        const y = size * p.sin(angle);
        p.vertex(x, y);
    }
    p.endShape(p.CLOSE);
}

function drawSquare(p, size) {
    p.rectMode(p.CENTER);
    p.rect(0, 0, size * 1.70, size * 1.70); // Back to previous size
}

function drawCircle(p, size) {
    p.circle(0, 0, size * 1.9); // Back to previous size
}

globalThis.logoDraw = function(p) {
    p.background(255);
    
    // Draw each letter
    Object.entries(globalThis.logoParams.letters).forEach(([letter, settings]) => {
        p.push();
        p.translate(settings.x, settings.y);
        p.rotate(settings.rotation);
        p.scale(settings.scale);
        
        // Draw shape
        p.fill(globalThis.logoParams.canvas.color);
        p.noStroke();
        const size = 45;
        
        switch(settings.shape) {
            case 'hexagon':
                drawHexagon(p, size);
                break;
            case 'square':
                drawSquare(p, size);
                break;
            case 'circle':
                drawCircle(p, size);
                break;
        }
        
        // Draw letter
        p.fill(255);
        p.textFont('States Medium');
        p.textSize(size * 1.5);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(letter, 0, size * 0.11);
        
        p.pop();
    });
}