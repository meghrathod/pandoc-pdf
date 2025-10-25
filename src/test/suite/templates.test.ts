import * as assert from 'assert';
import { PDF_TEMPLATES, getTemplate } from '../../templates';

suite('Templates Tests', () => {
    test('PDF_TEMPLATES contains expected templates', () => {
        assert.ok(Array.isArray(PDF_TEMPLATES));
        assert.ok(PDF_TEMPLATES.length > 0);
        
        // Check for specific templates
        const templateNames = PDF_TEMPLATES.map(t => t.name);
        assert.ok(templateNames.includes('Academic Paper'));
        assert.ok(templateNames.includes('Blog Post'));
        assert.ok(templateNames.includes('Minimal'));
    });

    test('All templates have required properties', () => {
        PDF_TEMPLATES.forEach(template => {
            assert.ok(typeof template.name === 'string');
            assert.ok(template.name.length > 0);
            assert.ok(typeof template.description === 'string');
            assert.ok(typeof template.config === 'object');
            
            // Check config properties
            const config = template.config;
            assert.ok(['xelatex', 'pdflatex', 'lualatex'].includes(config.pdfEngine));
            assert.ok(typeof config.margins === 'object');
            assert.ok(typeof config.margins.top === 'string');
            assert.ok(typeof config.margins.bottom === 'string');
            assert.ok(typeof config.margins.left === 'string');
            assert.ok(typeof config.margins.right === 'string');
            assert.ok(typeof config.fontSize === 'string');
            assert.ok(['letter', 'a4', 'legal', 'a3', 'a5', 'a4paper', 'letterpaper'].includes(config.paperSize));
            assert.ok(typeof config.fontFamily === 'string');
        });
    });

    test('Blog Post template has correct configuration', () => {
        const blogPost = PDF_TEMPLATES.find(t => t.name === 'Blog Post');
        assert.ok(blogPost);
        
        assert.strictEqual(blogPost!.config.pdfEngine, 'xelatex');
        assert.strictEqual(blogPost!.config.fontSize, '11pt');
        assert.strictEqual(blogPost!.config.paperSize, 'letter');
        assert.strictEqual(blogPost!.config.fontFamily, 'System');
        assert.strictEqual(blogPost!.config.margins.top, '0.5in');
        assert.strictEqual(blogPost!.config.margins.bottom, '0.5in');
        assert.strictEqual(blogPost!.config.margins.left, '0.75in');
        assert.strictEqual(blogPost!.config.margins.right, '0.75in');
        
        // Check custom variables
        assert.ok(blogPost!.config.customVariables);
        assert.strictEqual(blogPost!.config.customVariables!.linestretch, '1.2');
    });

    test('getTemplate returns correct template', () => {
        const academicTemplate = getTemplate('Academic Paper');
        assert.ok(academicTemplate);
        assert.strictEqual(academicTemplate!.name, 'Academic Paper');
        
        const blogTemplate = getTemplate('Blog Post');
        assert.ok(blogTemplate);
        assert.strictEqual(blogTemplate!.name, 'Blog Post');
    });

    test('getTemplate returns undefined for non-existent template', () => {
        const nonExistent = getTemplate('Non-existent Template');
        assert.strictEqual(nonExistent, undefined);
    });

    test('getTemplate is case sensitive', () => {
        const blogTemplate = getTemplate('blog post'); // lowercase
        assert.strictEqual(blogTemplate, undefined);
    });

    test('All templates have unique names', () => {
        const names = PDF_TEMPLATES.map(t => t.name);
        const uniqueNames = new Set(names);
        assert.strictEqual(names.length, uniqueNames.size);
    });

    test('Template margins are valid CSS units', () => {
        PDF_TEMPLATES.forEach(template => {
            const margins = template.config.margins;
            const validUnits = ['in', 'cm', 'pt', 'px', 'mm'];
            
            Object.values(margins).forEach(margin => {
                const hasValidUnit = validUnits.some(unit => margin.endsWith(unit));
                assert.ok(hasValidUnit, `Invalid margin unit in ${template.name}: ${margin}`);
            });
        });
    });

    test('Template font sizes are valid LaTeX units', () => {
        PDF_TEMPLATES.forEach(template => {
            const fontSize = template.config.fontSize;
            assert.ok(fontSize.endsWith('pt'), `Invalid font size in ${template.name}: ${fontSize}`);
            
            const size = parseInt(fontSize.replace('pt', ''));
            assert.ok(size > 0 && size <= 24, `Font size out of range in ${template.name}: ${fontSize}`);
        });
    });
});
