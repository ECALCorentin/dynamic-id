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
    format: 'Poster', // Valeur par défaut
    xPosition: 0,
    bgColor: '#3C3C17',
    dimensions: { ...FORMATS['Poster'] },
    message: 'Swiss Dance Day Retrospective',

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

    layer2: {
        visible: true,
        color: '#00FF00',
        opacity: 0.5,
        posX: 200,
        posY: 200,
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

pane.addBinding(PARAMS, 'xPosition', {
    min: 0,
    max: 100
})

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

const f1 = pane.addFolder({ title: 'Shapes' });
f1.addBinding(PARAMS.imageLayer, 'visible', { label: 'Visible' });
f1.addBinding(PARAMS.imageLayer, 'posX', { min: 0, max: 1000 });
f1.addBinding(PARAMS.imageLayer, 'posY', { min: 0, max: 1000 });

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
    statesFont = loadFont('public/font/StatesWeb-RoundedMedium.otf');
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

    if (PARAMS.layer2.visible) {
        push()
        pop()
    }

    // Draw title
    push();
    textFont(statesFont);
    textSize(41);
    textAlign(CENTER, TOP);
    fill(255); // Texte en blanc
    text(PARAMS.message, width/2, 0);
    pop();

    // Draw logo shapes
    if (PARAMS.logo.visible && typeof globalThis.drawLogoShapes === 'function') {
        push();
        translate(PARAMS.logo.posX, PARAMS.logo.posY);
        rotate(PARAMS.logo.rotation);
        
        // Create color with opacity
        const c = color(PARAMS.logo.color);
        c.setAlpha(PARAMS.logo.opacity * 255);
        
        // Pass the current p5 instance and set showLetters to false
        globalThis.drawLogoShapes(window._p5Instance || window, 0, 0, PARAMS.logo.scale, c, false);
        pop();
    }

    function colorWithOpacity(hex, alpha) {
        const c = color(hex)
        c.setAlpha(alpha * 255)
        return c
    }
}