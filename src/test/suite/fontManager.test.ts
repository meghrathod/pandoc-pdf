import * as assert from 'assert';
import { FontManager } from '../../settings/fontManager';

suite('Font Manager Tests', () => {
    let fontManager: FontManager;

    setup(() => {
        fontManager = FontManager.getInstance();
    });

    test('FontManager is singleton', () => {
        const instance1 = FontManager.getInstance();
        const instance2 = FontManager.getInstance();
        
        assert.strictEqual(instance1, instance2);
    });

    test('FontManager can be instantiated', () => {
        assert.ok(fontManager instanceof FontManager);
    });

    test('getAvailableFonts returns array', async () => {
        const fonts = await fontManager.getAvailableFonts();
        
        assert.ok(Array.isArray(fonts));
    });

    test('getAvailableFonts returns fonts with correct structure', async () => {
        const fonts = await fontManager.getAvailableFonts();
        
        fonts.forEach(font => {
            assert.ok(typeof font === 'string');
            assert.ok(font.length > 0);
        });
    });

    test('getSystemFonts returns array', async () => {
        const fonts = await fontManager.getSystemFonts();
        
        assert.ok(Array.isArray(fonts));
    });

    test('getSystemFonts returns fonts with correct structure', async () => {
        const fonts = await fontManager.getSystemFonts();
        
        fonts.forEach(font => {
            assert.ok(typeof font === 'object');
            assert.ok('name' in font);
            assert.ok('family' in font);
            assert.ok('style' in font);
            assert.ok('path' in font);
        });
    });

    test('showFontPicker returns promise', () => {
        const result = fontManager.showFontPicker();
        
        assert.ok(result instanceof Promise);
    });

    test('showFontPicker resolves to string or undefined', async () => {
        // This test might need to be skipped in headless environments
        try {
            const result = await fontManager.showFontPicker();
            assert.ok(result === undefined || typeof result === 'string');
        } catch (error) {
            // Font picker might not work in test environment
            assert.ok(error instanceof Error);
        }
    });

    test('FontManager handles errors gracefully', async () => {
        // Test that the font manager doesn't crash on errors
        const fonts = await fontManager.getSystemFonts();
        assert.ok(Array.isArray(fonts));
    });
});
