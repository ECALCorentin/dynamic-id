import 'normalize.css'
import './style.scss'

import 'p5'
import { Pane } from 'tweakpane'

// Initialize global variables
globalThis.logoParams = {
    canvas: {
        color: '#000000'
    },
    positions: {
        x: 0, // Décalage horizontal global
        y: 0  // Décalage vertical global
    },
    letters: {
        M: { x: 80, y: 100, scale: 1, rotation: 0, shape: 'square' },
        A: { x: 155, y: 100, scale: 1, rotation: 0, shape: 'hexagon' },
        S: { x: 220, y: 100, scale: 1, rotation: 0, shape: 'circle' },
        C: { x: 285, y: 100, scale: 1, rotation: 0, shape: 'hexagon' }
    }
};

// Ajoute une propriété globale pour le sens de départ si elle n'existe pas
if (!globalThis.logoParams.direction) {
    globalThis.logoParams.direction = 'horizontal';
}

let logoPane = null;

// Variable globale pour la lettre sélectionnée
globalThis.selectedLetter = null;

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

        // Ajoute un menu déroulant pour le sens de départ du logo
        logoPane.addBinding(globalThis.logoParams, 'direction', {
            label: 'Sens de départ',
            options: {
                Horizontal: 'horizontal',
                Vertical: 'vertical'
            }
        });

        // Ajoute les bindings pour les décalages
        logoPane.addBinding(globalThis.logoParams.positions, 'x', { label: 'Décalage horizontal', min: -400, max: 400, step: 1 });
        logoPane.addBinding(globalThis.logoParams.positions, 'y', { label: 'Décalage vertical', min: -200, max: 200, step: 1 });

        // Créer un tab par lettre
        const tabPages = Object.keys(globalThis.logoParams.letters).map(letter => {
            return {
                title: letter,
                bindings: globalThis.logoParams.letters[letter]
            };
        });

        // Ajout des tabs
        const tab = logoPane.addTab({
            pages: tabPages.map(page => ({
                title: `Lettre ${page.title}`,
                // Les bindings seront ajoutés ci-dessous
            }))
        });

        // Highlight la première lettre par défaut
        globalThis.selectedLetter = Object.keys(globalThis.logoParams.letters)[0];

        // Ajouter les bindings dans chaque tab
        Object.keys(globalThis.logoParams.letters).forEach((letter, idx) => {
            const settings = globalThis.logoParams.letters[letter];
            if (!settings.personality) settings.personality = 'Affirmé';

            const page = tab.pages[idx];
            page.addBinding(settings, 'x', { min: 0, max: 400, step: 10 });
            page.addBinding(settings, 'y', { min: 0, max: 200, step: 10 });
            page.addBinding(settings, 'scale', { min: 0.1, max: 2, step: 0.1 });
            page.addBinding(settings, 'rotation', { min: 0, max: 360 });
            page.addBinding(settings, 'shape', {
                options: {
                    Square: 'square',
                    Hexagon: 'hexagon',
                    Circle: 'circle'
                }
            });
            page.addBinding(settings, 'personality', {
                label: 'Personnalité',
                options: {
                    Affirmé: 'Affirmé',
                    Doux: 'Doux', // <-- corrige ici
                }
            });

            // Ajoute un listener pour le clic sur le tab
            page.tabElement?.addEventListener?.('click', () => {
                globalThis.selectedLetter = letter;
            });
        });

        // Pour Tweakpane v4+, utiliser l'événement on('select') sur le tab
        if (tab.on) {
            tab.on('select', (ev) => {
                const idx = ev.index;
                const letter = Object.keys(globalThis.logoParams.letters)[idx];
                globalThis.selectedLetter = letter;
            });
        }
    } catch (error) {
        console.error('Error initializing controls:', error);
    }
};

globalThis.logoSetup = function(p) {

    const logoCanvas = p.createCanvas(500, 300);
    logoCanvas.parent('logo');
    p.angleMode(p.DEGREES);

    globalThis.initLogoControls();
}

// Modifie les fonctions de dessin pour accepter un rayon d'arrondi
function drawHexagon(p, size, radius = 0) {
    if (radius > 0) {
        // Hexagone arrondi (approximation en utilisant beginShape + quadraticVertex)
        const n = 6;
        const angleStep = (2 * Math.PI) / n;
        p.beginShape();
        for (let i = 0; i < n; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const nextAngle = ((i + 1) % n) * angleStep - Math.PI / 2;
            const x1 = Math.cos(angle) * (size - radius);
            const y1 = Math.sin(angle) * (size - radius);
            const x2 = Math.cos(nextAngle) * (size - radius);
            const y2 = Math.sin(nextAngle) * (size - radius);
            const cx = Math.cos(angle + angleStep / 2) * size;
            const cy = Math.sin(angle + angleStep / 2) * size;
            if (i === 0) {
                p.vertex(x1, y1);
            }
            p.quadraticVertex(cx, cy, x2, y2);
        }
        p.endShape(p.CLOSE);
    } else {
        // Hexagone classique
        const adjustedSize = size * 1;
        p.beginShape();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 + 60) * (Math.PI / 180);
            const x = adjustedSize * Math.cos(angle);
            const y = adjustedSize * Math.sin(angle);
            p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
    }
}

function drawSquare(p, size, radius = 0) {
    p.rectMode(p.CENTER);
    p.rect(0, 0, size * 1.70, size * 1.70, radius);
}

function drawCircle(p, size) {
    p.circle(0, 0, size * 1.9);
}

// Modifie drawLogoShapes pour passer le rayon d'arrondi si personnalité = Doux
globalThis.drawLogoShapes = function(p, x, y, scale, color, showLetters = true) {
    const offsetX = globalThis.logoParams.positions?.x || 0;
    const offsetY = globalThis.logoParams.positions?.y || 0;
    const direction = globalThis.logoParams.direction || 'horizontal';

    // Pour la disposition verticale, on aligne les lettres en colonne
    let letters = Object.entries(globalThis.logoParams.letters);
    letters.forEach(([letter, settings], idx) => {
        p.push();

        let tx = x + offsetX;
        let ty = y + offsetY;

        if (direction === 'vertical') {
            // Espacement vertical automatique, ignore settings.x et settings.y
            const spacing = 70;
            tx += 200; // centrer horizontalement (ajuste selon ton canvas)
            ty += 40 + idx * spacing;
        } else {
            // Disposition horizontale classique
            tx += settings.x * scale;
            ty += settings.y * scale;
        }

        p.translate(tx, ty);
        p.rotate(settings.rotation);
        p.scale(settings.scale * scale);

        // Couleur de fond différente si sélectionné
        let fillColor;
        if (globalThis.selectedLetter === letter) {
            fillColor = p.color(0, 0, 0);
        } else {
            fillColor = color || globalThis.logoParams.canvas.color;
        }
        p.noStroke();
        p.fill(fillColor);

        const size = 45;
        // Rayon d'arrondi si personnalité "Doux"
        const isDoux = settings.personality === 'Doux';
        const radius = isDoux ? size * 0.5 : 0;

        switch(settings.shape) {
            case 'hexagon':
                drawHexagon(p, size, radius);
                break;
            case 'square':
                drawSquare(p, size, radius);
                break;
            case 'circle':
                drawCircle(p, size);
                break;
        }

        if (showLetters) {
            p.fill(255);
            p.noStroke();
            p.textFont('States Medium');
            p.textSize(size * 1.5);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(letter, 0, size * 0.11);
        }

        p.pop();
    });
}

globalThis.logoDraw = function(p) {
    p.background(255);
    globalThis.drawLogoShapes(p, 0, 0, 1, null, true);
}