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
            if (!settings.personality) settings.personality = 'Neutre';

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
                    Neutre: 'Neutre',
                    Joyeuse: 'Joyeuse',
                    Sérieuse: 'Sérieuse',
                    Dynamique: 'Dynamique',
                    Mystérieuse: 'Mystérieuse'
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
    const logoCanvas = p.createCanvas(400, 200);
    logoCanvas.parent('logo');
    p.angleMode(p.DEGREES);
    

    globalThis.initLogoControls();
}

function drawHexagon(p, size) {
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

function drawSquare(p, size) {
    p.rectMode(p.CENTER);
    p.rect(0, 0, size * 1.70, size * 1.70); 
}

function drawCircle(p, size) {
    p.circle(0, 0, size * 1.9); 
}


globalThis.drawLogoShapes = function(p, x, y, scale, color, showLetters = true) {
    Object.entries(globalThis.logoParams.letters).forEach(([letter, settings]) => {
        p.push();
        p.translate(x + settings.x * scale, y + settings.y * scale);
        p.rotate(settings.rotation);
        p.scale(settings.scale * scale);

        // Couleur de fond différente si sélectionné
        let fillColor;
        if (globalThis.selectedLetter === letter) {
            fillColor = p.color(0, 0, 0); // Jaune highlight
        } else {
            fillColor = color || globalThis.logoParams.canvas.color;
        }
        p.noStroke();
        p.fill(fillColor);

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

        // Draw letter only if showLetters is true
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