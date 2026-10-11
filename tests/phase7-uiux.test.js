import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 7: UI/UX Aesthetics, Global Command Palette, Card Spotlight, and Toast Notifications', () => {
  it('should define modern glassmorphism command palette, card spotlight glow, and toast styles in styles.css', () => {
    const cssPath = path.resolve(__dirname, '../styles.css');
    expect(fs.existsSync(cssPath)).toBe(true);

    const cssContent = fs.readFileSync(cssPath, 'utf8');
    // Command Palette styles
    expect(cssContent).toContain('.cmd-palette-overlay');
    expect(cssContent).toContain('.cmd-palette-container');
    expect(cssContent).toContain('.cmd-palette-header');
    expect(cssContent).toContain('.cmd-palette-input');
    expect(cssContent).toContain('.cmd-palette-results');
    expect(cssContent).toContain('.cmd-palette-item');
    expect(cssContent).toContain('.cmd-group-label');

    // Interactive card spotlight radial glow
    expect(cssContent).toContain('var(--mouse-x');
    expect(cssContent).toContain('var(--mouse-y');
    expect(cssContent).toContain('radial-gradient(');

    // Toast notifications
    expect(cssContent).toContain('.toast-container');
    expect(cssContent).toContain('.toast-message');
  });

  it('should include the Command Center modal structure in sections/modal.html', () => {
    const modalPath = path.resolve(__dirname, '../sections/modal.html');
    expect(fs.existsSync(modalPath)).toBe(true);

    const modalContent = fs.readFileSync(modalPath, 'utf8');
    expect(modalContent).toContain('id="cmdPaletteModal"');
    expect(modalContent).toContain('id="cmdPaletteInput"');
    expect(modalContent).toContain('id="cmdPaletteResults"');
    expect(modalContent).toContain('id="cmdCloseBtn"');
  });

  it('should include the Command Center trigger button in sections/navbar.html', () => {
    const navPath = path.resolve(__dirname, '../sections/navbar.html');
    expect(fs.existsSync(navPath)).toBe(true);

    const navContent = fs.readFileSync(navPath, 'utf8');
    expect(navContent).toContain('id="cmdPaletteTrigger"');
    expect(navContent).toContain('Ctrl K');
  });

  it('should implement Phase 7 JavaScript controllers in script.js', () => {
    const scriptPath = path.resolve(__dirname, '../script.js');
    expect(fs.existsSync(scriptPath)).toBe(true);

    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    // Toast notification function
    expect(scriptContent).toContain('window.showToast = function');
    expect(scriptContent).toContain('toastContainer');

    // Card spotlight mouse tracking
    expect(scriptContent).toContain('function initCardSpotlight()');
    expect(scriptContent).toContain('card.style.setProperty(\'--mouse-x\'');
    expect(scriptContent).toContain('card.style.setProperty(\'--mouse-y\'');

    // Command palette controller with multi-destination indexing
    expect(scriptContent).toContain('function initCommandPalette()');
    expect(scriptContent).toContain('cmdPaletteTrigger');
    expect(scriptContent).toContain('window.openCommandPalette = openPalette');
    expect(scriptContent).toContain('window.closeCommandPalette = closePalette');
    expect(scriptContent).toContain('Destinations');
    expect(scriptContent).toContain('Studios Workbench');
  });
});
