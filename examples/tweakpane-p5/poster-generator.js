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

const PARAMS = {
    format: 'Poster', // Valeur par défaut
    xPosition: 0,
    bgColor: '#3C3C17',
    dimensions: { ...FORMATS['Poster'] },

    imageLayer: {
        visible: true,
        color: '#FF0000',
        useImage: true,
        opacity: 1,
        posX: 0,
        posY: 0,
        scale: 1,

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
        posX: 50,
        posY: 50,
        radius: 40,
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


pane.addButton({
    title: 'Save image',
}).on('click', () => {
    saveCanvas()
});

let svg;

globalThis.preload = function () {
    svg = loadImage('/vite.svg')
}

globalThis.setup = function () {
    const { x, y } = PARAMS.dimensions
    const p5Canvas = createCanvas(x, y)
    p5Canvas.parent('app')
    pixelDensity(1)
    imageMode(CENTER)
    rectMode(CENTER)

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

    function colorWithOpacity(hex, alpha) {
        const c = color(hex)
        c.setAlpha(alpha * 255)
        return c
    }
}