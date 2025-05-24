import 'normalize.css'
import './style.scss'
import p5 from 'p5'
import { Pane } from 'tweakpane'

// Import the necessary setup from both files first
import './logo-generator.js'
import './poster-generator.js'

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
    // Create the logo instance
    new p5((p) => {
        p.preload = () => globalThis.preload(p);
        p.setup = () => globalThis.logoSetup(p);
        p.draw = () => globalThis.logoDraw(p);
    }, 'logo');
});
