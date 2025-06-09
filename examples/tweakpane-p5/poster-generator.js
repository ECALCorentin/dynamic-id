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
    message2: '(20)24 - (20)25',
    date: '21.05 - 18.08',
    year: '2025',

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
        color: '#c8c8c8',
        opacity: 1,
        scale: 3,
        scaleX: 1, // <--- Ajouté
        scaleY: 1, // <--- Ajouté
        posX: -140,
        posY: 110,
        rotation: 0, // <--- Ajouté ici
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

    textPositions: {
        message: { x: 0, y: 0 },
        message2: { x: 0, y: 0 },
        date: { x: 0, y: 0 },
        year: { x: 0, y: 0 }, // <-- Ajouté ici
        url: { x: 0, y: 0 },
        masc: { x: 0, y: 0 },
        lieu: { x: 0, y: 0 }
    },

    sideBorders: {
        enabled: true,
        width: 0,   // Largeur des bords gauche/droit
        height: 25,   // Hauteur des bords haut/bas
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
})

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
pane.addBinding(PARAMS, 'date', {
})

pane.addBinding(PARAMS, 'message', {
})

pane.addBinding(PARAMS, 'message2', {
})


pane.addBinding(PARAMS, 'date', {
})

pane.addBinding(PARAMS, 'dimensions', {
    picker: 'inline',
    x: { min: 1, step: 1 },
    y: { min: 1, step: 1 },
}).on('change', (event) => {
    const { x, y } = event.value
    resizeCanvas(x, y)
});

const textPosFolder = pane.addFolder({ title: 'Position des textes' });
textPosFolder.addBinding(PARAMS.textPositions.message, 'x', { label: 'Message X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.message, 'y', { label: 'Message Y', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.message2, 'x', { label: 'Message2 X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.message2, 'y', { label: 'Message2 Y', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.date, 'x', { label: 'Date X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.date, 'y', { label: 'Date Y', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.year, 'x', { label: 'Year X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.year, 'y', { label: 'Year Y', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.url, 'x', { label: 'URL X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.url, 'y', { label: 'URL Y', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.masc, 'x', { label: 'MASC X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.masc, 'y', { label: 'MASC Y', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.lieu, 'x', { label: 'Lieu X', min: -1000, max: 1000, step: 1 });
textPosFolder.addBinding(PARAMS.textPositions.lieu, 'y', { label: 'Lieu Y', min: -1000, max: 1000, step: 1 });

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
overlayFolder.addBinding(PARAMS.overlayLayer, 'rotation', {
    min: 0,
    max: 360,
    step: 1,
    label: 'Rotation'
});
overlayFolder.addBinding(PARAMS.overlayLayer, 'scaleX', {
    min: 0.1,
    max: 3,
    step: 0.01,
    label: 'Scale X'
});
overlayFolder.addBinding(PARAMS.overlayLayer, 'scaleY', {
    min: 0.1,
    max: 3,
    step: 0.01,
    label: 'Scale Y'
});

// Champ pour définir le nombre de formes
if (PARAMS.overlayLayer.shapeCount === undefined) {
    PARAMS.overlayLayer.shapeCount = PARAMS.overlayLayer.shapes.length;
}
overlayFolder.addBinding(PARAMS.overlayLayer, 'shapeCount', {
    label: 'Nombre de formes',
    min: 1,
    max: 10,
    step: 1
}).on('change', (ev) => {
    const n = ev.value;
    const shapes = PARAMS.overlayLayer.shapes;
    if (shapes.length < n) {
        // Ajouter des formes par défaut
        for (let i = shapes.length; i < n; i++) {
            shapes.push({
                type: 'square',
                x: 300 + i * 30,
                y: 300 + i * 30,
                size: 150,
                rotation: 0,
            });
        }
    } else if (shapes.length > n) {
        shapes.length = n;
    }
    createShapesTab();
    pane.refresh();
});

// Fonction pour créer un tab par forme
function createShapesTab() {
    // Supprimer l'ancien tab s'il existe
    if (overlayFolder._shapesTab) {
        overlayFolder.remove(overlayFolder._shapesTab);
    }
    const shapesTab = overlayFolder.addTab({
        pages: PARAMS.overlayLayer.shapes.map((shape, idx) => ({
            title: `Forme ${idx + 1}`
        }))
    });
    overlayFolder._shapesTab = shapesTab;

    PARAMS.overlayLayer.shapes.forEach((shape, index) => {
        const page = shapesTab.pages[index];
        if (!shape.personality) shape.personality = 'Neutre';

        page.addBinding(shape, 'type', {
            options: {
                Square: 'square',
                Circle: 'circle',
                Hexagon: 'hexagon'
            }
        });
        page.addBinding(shape, 'x', { min: 0, max: 1000 });
        page.addBinding(shape, 'y', { min: 0, max: 1000 });
        page.addBinding(shape, 'size', { min: 20, max: 500 });
        page.addBinding(shape, 'rotation', { min: 0, max: 360 });
    });
}
createShapesTab();

// Mettre à jour les tabs quand le nombre de formes change
overlayFolder.on('change', (ev) => {
    if (ev.presetKey === 'shapeCount') {
        createShapesTab();
    }
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

// Add logo controls
const logoFolder = pane.addFolder({ title: 'Logo Shape' });
logoFolder.addBinding(PARAMS.logo, 'visible', { label: 'Visible' });
//logoFolder.addBinding(PARAMS.logo, 'posX', { min: -500, max: 1500, label: 'Position X' });
//logoFolder.addBinding(PARAMS.logo, 'posY', { min: -500, max: 1500, label: 'Position Y' });
//logoFolder.addBinding(PARAMS.logo, 'scale', { min: 0.1, max: 10, step: 0.1, label: 'Scale' });
//logoFolder.addBinding(PARAMS.logo, 'rotation', { min: 0, max: 360, label: 'Rotation' });
//logoFolder.addBinding(PARAMS.logo, 'color', { label: 'Color' });
//logoFolder.addBinding(PARAMS.logo, 'opacity', { min: 0, max: 1, step: 0.1, label: 'Opacity' })

const f0 = pane.addFolder({ title: 'Background' });
f0.addBinding(PARAMS, 'bgColor');

// Create shapes tab
    

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

    randomizeOverlayShapes(PARAMS.overlayLayer.shapes, width, height);
    
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
                
                // Apply global transformations (centré)
                overlayBuffer.translate(width / 2, height / 2);
                overlayBuffer.rotate(radians(PARAMS.overlayLayer.rotation));
                overlayBuffer.scale(
                    PARAMS.overlayLayer.scale * PARAMS.overlayLayer.scaleX,
                    PARAMS.overlayLayer.scale * PARAMS.overlayLayer.scaleY
                );
                overlayBuffer.translate(PARAMS.overlayLayer.posX, PARAMS.overlayLayer.posY);
                overlayBuffer.translate(-width / 2, -height / 2);
                
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

            if (PARAMS.sideBorders.enabled && (PARAMS.sideBorders.width > 0 || PARAMS.sideBorders.height > 0)) {
        noStroke();
        fill(PARAMS.bgColor);
        rectMode(CORNER);
        // Bord gauche
        if (PARAMS.sideBorders.width > 0) {
            rect(0, 0, PARAMS.sideBorders.width, height);
            // Bord droit
            rect(width - PARAMS.sideBorders.width, 0, PARAMS.sideBorders.width, height);
        }
        // Bord haut
        if (PARAMS.sideBorders.height > 0) {
            rect(0, 0, width, PARAMS.sideBorders.height);
            // Bord bas
            rect(0, height - PARAMS.sideBorders.height, width, PARAMS.sideBorders.height);
        }
        rectMode(CENTER); // Remet le mode si besoin pour la suite
    }
            
            // Draw title
            push();
            textFont(statesFont);
            textSize(41);
            textAlign(CENTER, TOP);
            fill(255); // White text
            text(PARAMS.message, width/2 + PARAMS.textPositions.message.x, 0 + PARAMS.textPositions.message.y);
            pop();

              push();
            textFont(statesFont);
            textSize(41);
            textAlign(LEFT, TOP);
            fill(255); // White text
            text(PARAMS.message2, 15 + PARAMS.textPositions.message2.x, 40 + PARAMS.textPositions.message2.y);
            pop();

            push();
            textFont(statesFont);
            textSize(15);
            textAlign(CENTER, TOP);
            fill(255);
            // Convert PARAMS.message into a suite of words separated by '-' and uppercase
            const messageSlug = PARAMS.message.split(/\s+/).join('-').toUpperCase();
            text(('WWW.MASC.CH/' + messageSlug).toUpperCase(), width/2 + PARAMS.textPositions.url.x, height - 50 + PARAMS.textPositions.url.y);
            pop();

            //push();
            //textFont(statesFont);
            //textSize(15);
            //textAlign(CENTER, TOP);
            //fill(255); // White text
            //text((PARAMS.message + ' ' + PARAMS.message2).toUpperCase(), width/2 + PARAMS.textPositions.masc.x, height - 70 + PARAMS.textPositions.masc.y);
            //pop();

            push();
            textFont(statesFont);
            textSize(41);
            textAlign(LEFT, TOP);
            fill(255); // White text
            let dateText = PARAMS.date.replace(/ - /g, ' -\n');
            textLeading(33);
            text(dateText, 15 + PARAMS.textPositions.date.x, 90 + PARAMS.textPositions.date.y);
            pop();

            push();
            textFont(statesFont);
            textSize(41);
            textAlign(LEFT, TOP);
            fill(255); // White text
            text(PARAMS.year, 15 + PARAMS.textPositions.year.x, 160 + PARAMS.textPositions.year.y);
            pop();

            push();
            textFont(statesFont);
            textSize(20);
            textAlign(CENTER, BOTTOM);
            fill(255); // White text
            text('MASC - Musée des Arts Scéniques Contemporains', width/2 + PARAMS.textPositions.masc.x, height - 5 + PARAMS.textPositions.masc.y);
            pop();

           push();
            textFont(statesFont);
            textSize(20);
            textAlign(LEFT, TOP);
            fill(255); // White text
            // Separate text between "4" and "2000"
            let lieuText = 'Rue des Moulins 37 2000 Neuchâtel'.replace(/(37)(\s+)(2000)/, '$1\n$3');
            textLeading(20);
            text(lieuText, 15 + PARAMS.textPositions.lieu.x, 250 + PARAMS.textPositions.lieu.y);
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

function randomizeOverlayShapes(shapes, w, h) {
    const types = ['square', 'circle', 'hexagon'];
    const minOverlap = 0.75; // < 1 = chevauchement assuré
    const maxTries = 200;

    // Place la première forme au centre
    let x = w / 2;
    let y = h / 2;
    let size = random(120, 220);
    shapes[0].type = random(types);
    shapes[0].x = x;
    shapes[0].y = y;
    shapes[0].size = size;
    shapes[0].rotation = random(0, 360);

    // Place les suivantes en chevauchant obligatoirement un voisin
    for (let i = 1; i < shapes.length; i++) {
        let placed = false;
        let tries = 0;
        while (!placed && tries < maxTries) {
            tries++;
            // Choisit un voisin déjà placé
            const baseIdx = floor(random(i));
            const base = shapes[baseIdx];
            const baseSize = base.size;
            const angle = random(TWO_PI);
            size = random(100, 220);
            // Distance pour FORCER le chevauchement avec le voisin
            const dist = (baseSize + size) / 2 * random(minOverlap, 0.97);
            x = base.x + cos(angle) * dist;
            y = base.y + sin(angle) * dist;

            // Crée temporairement la forme
            const temp = {
                type: random(types),
                x, y, size,
                rotation: random(0, 360)
            };

            // Vérifie qu'elle ne chevauche aucune autre (sauf le voisin)
            let overlap = false;
            for (let j = 0; j < i; j++) {
                if (j === baseIdx) continue; // On autorise le chevauchement avec le voisin
                const dx = shapes[j].x - temp.x;
                const dy = shapes[j].y - temp.y;
                const minDist = (shapes[j].size + temp.size) / 2 * 0.98;
                if (distSq(dx, dy) < minDist * minDist) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) {
                shapes[i].type = temp.type;
                shapes[i].x = temp.x;
                shapes[i].y = temp.y;
                shapes[i].size = temp.size;
                shapes[i].rotation = temp.rotation;
                placed = true;
            }
        }
        // Si pas trouvé, place quand même (rare)
        if (!placed) {
            shapes[i].type = random(types);
            shapes[i].x = random(w * 0.2, w * 0.8);
            shapes[i].y = random(h * 0.2, h * 0.8);
            shapes[i].size = random(100, 220);
            shapes[i].rotation = random(0, 360);
        }
    }

    // Vérifie qu'aucune forme n'est isolée (chaque forme doit chevaucher au moins un voisin)
    for (let i = 0; i < shapes.length; i++) {
        let hasNeighbor = false;
        for (let j = 0; j < shapes.length; j++) {
            if (i === j) continue;
            const dx = shapes[j].x - shapes[i].x;
            const dy = shapes[j].y - shapes[i].y;
            const minDist = (shapes[j].size + shapes[i].size) / 2 * 0.98;
            if (distSq(dx, dy) < minDist * minOverlap * minOverlap) {
                hasNeighbor = true;
                break;
            }
        }
        // Si isolée, force le chevauchement avec une autre forme
        if (!hasNeighbor && shapes.length > 1) {
            // On déplace la forme vers la première
            const target = (i === 0) ? 1 : 0;
            const angle = random(TWO_PI);
            const base = shapes[target];
            const baseSize = base.size;
            const mySize = shapes[i].size;
            const dist = (baseSize + mySize) / 2 * random(minOverlap, 0.97);
            shapes[i].x = base.x + cos(angle) * dist;
            shapes[i].y = base.y + sin(angle) * dist;
        }
    }

    function distSq(dx, dy) {
        return dx * dx + dy * dy;
    }
}