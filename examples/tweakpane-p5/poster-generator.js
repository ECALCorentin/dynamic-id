import 'normalize.css'
import './style.scss'

import 'p5'
import { Pane } from 'tweakpane';

const pane = new Pane();
pane.title = "My poster"

const FORMATS = {
    Poster: { x: 594, y: 840 },
    A4: { x: 210, y: 297 },
    A3: { x: 297, y: 420 },
    Carré: { x: 600, y: 600 },
};

const AVAILABLE_IMAGES = {
    'Theatre': '/img/theatre.png',
    'Theatre 2': '/img/Theatre2.png',
    'Danse Contemporaine': '/img/Danse_comptemporaine.png',
    'Danse Contemporaine (Neg)': '/img/Danse_comptemporaine_NEG.png',
    'Danse Contemporaine 2': '/img/Danse_comptemporaine copie.png'
};

const PARAMS = {
    eventType: 'Exhibition',
    format: 'Poster',
    xPosition: 0,
    bgColor: '#3C3C17',
    dimensions: { ...FORMATS['Poster'] },
    message: 'Swiss Dance Day Retrospective',

    globalMask: {
        scale: 1,
        posX: 0,
        posY: 0
    },

    imageLayer: {
        visible: true,
        color: '#FF0000',
        useImage: true,
        opacity: 1,
        posX: 0,
        posY: 0,
        scale: 1,
        selectedImage: 'Theatre',
        cropSide: 'top',
        cropAmount: 0,
        crop: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        },
    },

    overlayLayer: {
        visible: true,
        color: '#808080',
        opacity: 1,
        scale: 1,
        posX: 0,
        posY: 0,
        shapes: [
            { type: 'square', x: 300, y: 300, size: 200, rotation: 0 },
            { type: 'circle', x: 500, y: 300, size: 180, rotation: 0 },
            { type: 'hexagon', x: 400, y: 200, size: 160, rotation: 0 },
            { type: 'circle', x: 400, y: 400, size: 150, rotation: 0 }
        ]
    },

    logo: {
        visible: true,
        posX: 50,
        posY: 50,
        scale: 1,
        rotation: 0,
        color: '#000000',
        opacity: 1
    },
};

// Create buffers once
let maskBuffer;
let finalBuffer;
let overlayBuffer;

pane.addBinding(PARAMS, 'eventType', {
    label: 'Event Type',
    options: {
        'Exposition': 'Exposition',
        'Conference': 'Conference',
        'Performance': 'Performance',
    }
}).on('change', (ev) => {
    PARAMS.message = `${ev.value}\nSwiss Dance Day Retrospective`;
});

pane.addBinding(PARAMS, 'format', {
    options: {
        Poster: 'Poster',
        A4: 'A4',
        A3: 'A3',
        Carré: 'Carré',
    },
}).on('change', (event) => {
    const newDim = FORMATS[event.value];
    PARAMS.dimensions = { ...newDim };
    resizeCanvas(newDim.x, newDim.y);
});

pane.addBinding(PARAMS, 'message', {
})

pane.addBinding(PARAMS, 'dimensions', {
    picker: 'inline',
    x: { min: 1, step: 1 },
    y: { min: 1, step: 1 },
}).on('change', (event) => {
    const { x, y } = event.value
    resizeCanvas(x, y)
});

// Add global mask controls
const globalMaskFolder = pane.addFolder({ title: 'Global Mask Controls' });
globalMaskFolder.addBinding(PARAMS.globalMask, 'scale', {
    min: 0.1,
    max: 3,
    step: 0.1,
    label: 'Global Scale'
});
globalMaskFolder.addBinding(PARAMS.globalMask, 'posX', {
    min: -500,
    max: 500,
    step: 1,
    label: 'Position X'
});
globalMaskFolder.addBinding(PARAMS.globalMask, 'posY', {
    min: -500,
    max: 500,
    step: 1,
    label: 'Position Y'
});

const f2 = pane.addFolder({ title: 'Background image' });
f2.addBinding(PARAMS.imageLayer, 'visible', { label: 'Visible' });
f2.addBinding(PARAMS.imageLayer, 'opacity', { min: 0, max: 1, step: 0.01 });
f2.addBinding(PARAMS.imageLayer, 'posX', { min: -1000, max: 1000 });
f2.addBinding(PARAMS.imageLayer, 'posY', { min: -1000, max: 1000 });
f2.addBinding(PARAMS.imageLayer, 'scale', { min: 0.1, max: 5, step: 0.01 });

// Add image selector
f2.addBinding(PARAMS.imageLayer, 'selectedImage', {
    options: Object.keys(AVAILABLE_IMAGES).reduce((acc, key) => {
        acc[key] = key;
        return acc;
    }, {})
}).on('change', (event) => {
    const imagePath = AVAILABLE_IMAGES[event.value];
    loadImage(imagePath, (img) => {
        PARAMS.imageLayer.image = img;
    });
});

f2.addButton({ title: 'Charger une image' }).on('click', () => {
    document.getElementById('image-loader').click()
});

f2.addBinding(PARAMS.imageLayer, 'cropSide', {
    options: {
        Haut: 'top',
        Bas: 'bottom',
        Gauche: 'left',
        Droite: 'right',
    },
    label: 'Crop Side',
});

f2.addBinding(PARAMS.imageLayer, 'cropAmount', {
    min: 0,
    max: 500,
    step: 1,
    label: 'Crop Amount',
}).on('change', () => {
    const side = PARAMS.imageLayer.cropSide;
    PARAMS.imageLayer.crop[side] = PARAMS.imageLayer.cropAmount;
});

const f0 = pane.addFolder({ title: 'Background' });
f0.addBinding(PARAMS, 'bgColor');

// Add logo controls
const logoFolder = pane.addFolder({ title: 'Logo Shape' });
logoFolder.addBinding(PARAMS.logo, 'visible', { label: 'Visible' });
logoFolder.addBinding(PARAMS.logo, 'posX', { min: -500, max: 1500, label: 'Position X' });
logoFolder.addBinding(PARAMS.logo, 'posY', { min: -500, max: 1500, label: 'Position Y' });
logoFolder.addBinding(PARAMS.logo, 'scale', { min: 0.1, max: 10, step: 0.1, label: 'Scale' });
logoFolder.addBinding(PARAMS.logo, 'rotation', { min: 0, max: 360, label: 'Rotation' });
logoFolder.addBinding(PARAMS.logo, 'color', { label: 'Color' });
logoFolder.addBinding(PARAMS.logo, 'opacity', { min: 0, max: 1, step: 0.1, label: 'Opacity' });

// Add overlay controls
const overlayFolder = pane.addFolder({ title: 'Overlay Layer' });
overlayFolder.addBinding(PARAMS.overlayLayer, 'visible');
overlayFolder.addBinding(PARAMS.overlayLayer, 'color');
overlayFolder.addBinding(PARAMS.overlayLayer, 'opacity', { min: 0, max: 1, step: 0.1 });
overlayFolder.addBinding(PARAMS.overlayLayer, 'scale', { 
    min: 0.1, 
    max: 3, 
    step: 0.1,
    label: 'Global Scale'
});
overlayFolder.addBinding(PARAMS.overlayLayer, 'posX', {
    min: -500,
    max: 500,
    step: 1,
    label: 'Position X'
});
overlayFolder.addBinding(PARAMS.overlayLayer, 'posY', {
    min: -500,
    max: 500,
    step: 1,
    label: 'Position Y'
});

// Create shapes tab
const shapesTab = overlayFolder.addTab({
    pages: [
        {title: 'Shapes'},
        {title: 'Controls'}
    ]
});

// Add shape controls in first tab
PARAMS.overlayLayer.shapes.forEach((shape, index) => {
    const shapeFolder = shapesTab.pages[0].addFolder({ 
        title: `Shape ${index + 1}`,
        expanded: index === 0 // Only expand first shape by default
    });
    
    shapeFolder.addBinding(shape, 'type', {
        options: {
            Square: 'square',
            Circle: 'circle',
            Hexagon: 'hexagon'
        }
    });
    shapeFolder.addBinding(shape, 'x', { min: 0, max: 1000 });
    shapeFolder.addBinding(shape, 'y', { min: 0, max: 1000 });
    shapeFolder.addBinding(shape, 'size', { min: 20, max: 500 });
    shapeFolder.addBinding(shape, 'rotation', { min: 0, max: 360 });
});

// Add management buttons in second tab
const controlsFolder = shapesTab.pages[1].addFolder({
    title: 'Shape Management'
});

controlsFolder.addButton({ title: 'Add Shape' }).on('click', () => {
    PARAMS.overlayLayer.shapes.push({
        type: 'square',
        x: width/2,
        y: height/2,
        size: 100,
        rotation: 0
    });
    // Refresh pane to show new shape controls
    pane.refresh();
});

controlsFolder.addButton({ title: 'Remove Last Shape' }).on('click', () => {
    if (PARAMS.overlayLayer.shapes.length > 0) {
        PARAMS.overlayLayer.shapes.pop();
        // Refresh pane to update controls
        pane.refresh();
    }
});

pane.addButton({
    title: 'Save image',
}).on('click', () => {
    saveCanvas()
});

let svg;
let statesFont;

globalThis.preload = function () {
    svg = loadImage('/vite.svg');
    // Load font
    statesFont = loadFont('/font/StatesWeb-RoundedMedium.otf');
    // Load the default image
    loadImage(AVAILABLE_IMAGES[PARAMS.imageLayer.selectedImage], (img) => {
        PARAMS.imageLayer.image = img;
    });
}

globalThis.setup = function () {
    const { x, y } = PARAMS.dimensions
    const p5Canvas = createCanvas(x, y)
    p5Canvas.parent('app')
    pixelDensity(1)
    imageMode(CENTER)
    rectMode(CENTER)
    
    // Create buffers with initial canvas size
    maskBuffer = createGraphics(x, y);
    maskBuffer.pixelDensity(2);
    
    finalBuffer = createGraphics(x, y);
    finalBuffer.pixelDensity(2);
    
    overlayBuffer = createGraphics(x, y);
    overlayBuffer.pixelDensity(2);
    
    // Store p5 instance
    window._p5Instance = window._p5Instance || this;

    document.getElementById('image-loader').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            loadImage(event.target.result, (img) => {
                PARAMS.imageLayer.image = img;
            });
        };
        reader.readAsDataURL(file);
    });
}

function getLogoBounds() {
    const letters = globalThis.logoParams.letters;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    Object.values(letters).forEach(({ x, y, scale }) => {
        const size = 45 * scale;
        const halfSize = size;
        minX = Math.min(minX, x - halfSize);
        maxX = Math.max(maxX, x + halfSize);
        minY = Math.min(minY, y - halfSize);
        maxY = Math.max(maxY, y + halfSize);
    });

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
    };
}

function drawShape(g, type, x, y, size, rotation) {
    g.push();
    g.translate(x, y);
    g.rotate(rotation);
    
    switch(type) {
        case 'square':
            g.rect(0, 0, size, size);
            break;
        case 'circle':
            g.circle(0, 0, size);
            break;
        case 'hexagon':
            g.beginShape();
            for (let i = 0; i < 6; i++) {
                const angle = i * TWO_PI / 6;
                const px = cos(angle) * size/2;
                const py = sin(angle) * size/2;
                g.vertex(px, py);
            }
            g.endShape(CLOSE);
            break;
    }
    g.pop();
}

globalThis.draw = function () {
    background(PARAMS.bgColor)

    if (PARAMS.imageLayer.visible) {
        push();
        translate(PARAMS.imageLayer.posX, PARAMS.imageLayer.posY);
        scale(PARAMS.imageLayer.scale);

        if (PARAMS.imageLayer.useImage && PARAMS.imageLayer.image) {
            tint(255, PARAMS.imageLayer.opacity * 255);
            image(PARAMS.imageLayer.image, width / 2, height / 2, width, height);
        }

        pop();
    }

    if (PARAMS.overlayLayer.visible) {
        push()
        pop()
    }

    // Draw logo shapes
    if (PARAMS.logo.visible && typeof globalThis.drawLogoShapes === 'function') {
        push();
    
        // Get logo bounding box
        const bounds = getLogoBounds();
    
        // Calculate scale factors to fit logo bounds into canvas
        const scaleX = width / bounds.width;
        const scaleY = height / bounds.height;
        
        const offsetX = (width - bounds.width * scaleX) / 2 - bounds.x * scaleX;
        const offsetY = (height - bounds.height * scaleY) / 2 - bounds.y * scaleY;
        
        if (PARAMS.imageLayer.visible && PARAMS.imageLayer.image) {
            // Clear buffers
            maskBuffer.clear();
            finalBuffer.clear();
            
            // Reset mask buffer with white background
            maskBuffer.background(255);
            
            // Draw logo shapes in black on mask buffer with a small dilation
            maskBuffer.push();
            // Apply global transformations for mask
            maskBuffer.translate(width/2 + PARAMS.globalMask.posX, height/2 + PARAMS.globalMask.posY);
            maskBuffer.scale(PARAMS.globalMask.scale);
            maskBuffer.translate(-width/2, -height/2);
            
            maskBuffer.translate(offsetX, offsetY);
            maskBuffer.scale(scaleX, scaleY);
            maskBuffer.fill(0);
            maskBuffer.noStroke();
            
            // Draw shapes slightly larger to avoid white edges
            maskBuffer.push();
            maskBuffer.scale(1.01);
            globalThis.drawLogoShapes(maskBuffer, 0, 0, 1, color(0), false);
            maskBuffer.pop();
            maskBuffer.pop();
            
            // Draw image on final buffer with same global transformations
            finalBuffer.push();
            finalBuffer.imageMode(CENTER);
            // Apply global transformations for image
            finalBuffer.translate(width/2 + PARAMS.globalMask.posX, height/2 + PARAMS.globalMask.posY);
            finalBuffer.scale(PARAMS.globalMask.scale);
            finalBuffer.translate(-width/2, -height/2);
            
            finalBuffer.translate(finalBuffer.width/2, finalBuffer.height/2);
            finalBuffer.scale(PARAMS.imageLayer.scale);
            finalBuffer.tint(255, PARAMS.imageLayer.opacity * 255);
            finalBuffer.image(PARAMS.imageLayer.image, PARAMS.imageLayer.posX, PARAMS.imageLayer.posY, width, height);
            finalBuffer.pop();
            
            // Apply mask with smoother threshold
            finalBuffer.loadPixels();
            maskBuffer.loadPixels();
            
            for (let i = 0; i < finalBuffer.pixels.length; i += 4) {
                // Use a threshold to avoid aliasing artifacts
                if (maskBuffer.pixels[i] > 240) { // More forgiving threshold
                    finalBuffer.pixels[i + 3] = 0;
                }
            }
            
            finalBuffer.updatePixels();
            
            // Draw background color first
            background(PARAMS.bgColor);
            
            // Draw the masked result centered in canvas
            imageMode(CENTER);
            image(finalBuffer, width/2, height/2, width, height);
            imageMode(CORNER);
            
            // Draw overlay layer with cutout shapes
            if (PARAMS.overlayLayer.visible) {
                overlayBuffer.clear();
                overlayBuffer.fill(PARAMS.overlayLayer.color);
                overlayBuffer.noStroke();
                
                // Draw full rectangle first
                overlayBuffer.rect(0, 0, width, height);
                
                // Cut out shapes by setting blend mode
                overlayBuffer.erase();
                overlayBuffer.push();
                
                // Apply global transformations
                overlayBuffer.translate(width/2 + PARAMS.overlayLayer.posX, height/2 + PARAMS.overlayLayer.posY);
                overlayBuffer.scale(PARAMS.overlayLayer.scale);
                overlayBuffer.translate(-width/2, -height/2);
                
                PARAMS.overlayLayer.shapes.forEach(shape => {
                    drawShape(overlayBuffer, shape.type, shape.x, shape.y, shape.size, shape.rotation);
                });
                overlayBuffer.pop();
                overlayBuffer.noErase();
                
                // Draw overlay with transparency
                push();
                tint(255, PARAMS.overlayLayer.opacity * 255);
                image(overlayBuffer, 0, 0);
                pop();
            }
            
            // Draw title
            push();
            textFont(statesFont);
            textSize(41);
            textAlign(CENTER, TOP);
            fill(255); // White text
            text(PARAMS.message, width/2, 0);
            pop();
        }
        
        pop();
    }

    function colorWithOpacity(hex, alpha) {
        const c = color(hex)
        c.setAlpha(alpha * 255)
        return c
    }
}