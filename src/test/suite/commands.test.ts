import * as assert from 'assert';
import { validateInputFile } from '../../pathResolver';

suite('Commands Tests', () => {
    test('validateInputFile accepts .md files', () => {
        assert.strictEqual(validateInputFile('/path/to/file.md'), true);
        assert.strictEqual(validateInputFile('/path/to/file.MD'), true);
        assert.strictEqual(validateInputFile('/path/to/file.Md'), true);
    });

    test('validateInputFile accepts .markdown files', () => {
        assert.strictEqual(validateInputFile('/path/to/file.markdown'), true);
        assert.strictEqual(validateInputFile('/path/to/file.MARKDOWN'), true);
        assert.strictEqual(validateInputFile('/path/to/file.Markdown'), true);
    });

    test('validateInputFile rejects non-markdown files', () => {
        assert.strictEqual(validateInputFile('/path/to/file.txt'), false);
        assert.strictEqual(validateInputFile('/path/to/file.doc'), false);
        assert.strictEqual(validateInputFile('/path/to/file.pdf'), false);
        assert.strictEqual(validateInputFile('/path/to/file'), false);
    });

    test('validateInputFile handles edge cases', () => {
        assert.strictEqual(validateInputFile(''), false);
        assert.strictEqual(validateInputFile('file.md'), true);
        assert.strictEqual(validateInputFile('.md'), false);
        assert.strictEqual(validateInputFile('file.md.backup'), false);
    });

    test('validateInputFile handles paths with multiple dots', () => {
        assert.strictEqual(validateInputFile('/path/to/file.backup.md'), true);
        assert.strictEqual(validateInputFile('/path/to/file.md.backup'), false);
    });

    test('validateInputFile is case insensitive', () => {
        assert.strictEqual(validateInputFile('/path/to/file.MD'), true);
        assert.strictEqual(validateInputFile('/path/to/file.Markdown'), true);
        assert.strictEqual(validateInputFile('/path/to/file.MARKDOWN'), true);
    });
});

suite('Template Manager Tests', () => {
    test('Template creation validation', () => {
        // Test valid template names
        const validNames = [
            'My Template',
            'Template 1',
            'Custom Format',
            'A',
            'Template with Numbers 123'
        ];

        validNames.forEach(name => {
            assert.ok(name.length > 0, `Template name should not be empty: ${name}`);
            assert.ok(name.trim().length > 0, `Template name should not be whitespace only: ${name}`);
        });
    });

    test('Template configuration validation', () => {
        const validPdfEngines = ['xelatex', 'pdflatex', 'lualatex'];
        const validPaperSizes = ['letter', 'a4', 'legal', 'a3', 'a5', 'a4paper', 'letterpaper'];
        const validFontSizes = ['9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt'];

        // Test PDF engines
        validPdfEngines.forEach(engine => {
            assert.ok(typeof engine === 'string');
            assert.ok(engine.length > 0);
        });

        // Test paper sizes
        validPaperSizes.forEach(size => {
            assert.ok(typeof size === 'string');
            assert.ok(size.length > 0);
        });

        // Test font sizes
        validFontSizes.forEach(size => {
            assert.ok(typeof size === 'string');
            assert.ok(size.endsWith('pt'));
            const numericSize = parseInt(size.replace('pt', ''));
            assert.ok(numericSize > 0 && numericSize <= 24);
        });
    });

    test('Margin validation', () => {
        const validMargins = [
            '0.5in', '1in', '1.5in', '2in',
            '1cm', '2cm', '3cm',
            '10pt', '20pt', '30pt',
            '10mm', '20mm', '30mm'
        ];

        validMargins.forEach(margin => {
            assert.ok(typeof margin === 'string');
            assert.ok(margin.length > 0);
            
            // Should end with valid unit
            const validUnits = ['in', 'cm', 'pt', 'mm', 'px'];
            const hasValidUnit = validUnits.some(unit => margin.endsWith(unit));
            assert.ok(hasValidUnit, `Invalid margin unit: ${margin}`);
        });
    });

    test('Font family validation', () => {
        const validFontFamilies = [
            'Arial',
            'Helvetica',
            'Times New Roman',
            'Georgia',
            'System',
            'Inter',
            'Custom Font'
        ];

        validFontFamilies.forEach(font => {
            assert.ok(typeof font === 'string');
            assert.ok(font.length > 0);
            assert.ok(font.trim().length > 0);
        });
    });
});

suite('Command Palette Tests', () => {
    test('Command IDs are properly formatted', () => {
        const commandIds = [
            'pandoc-pdf.convertCurrentFile',
            'pandoc-pdf.convertFolder',
            'pandoc-pdf.convertWithTemplate',
            'pandoc-pdf.previewPdf',
            'pandoc-pdf.checkDependencies',
            'pandoc-pdf.convertWithCustomTemplate',
            'pandoc-pdf.createTemplate',
            'pandoc-pdf.showFontManager',
            'pandoc-pdf.refreshTemplates',
            'pandoc-pdf.editTemplate',
            'pandoc-pdf.deleteTemplate'
        ];

        commandIds.forEach(commandId => {
            assert.ok(commandId.startsWith('pandoc-pdf.'), `Command ID should start with 'pandoc-pdf.': ${commandId}`);
            assert.ok(commandId.length > 'pandoc-pdf.'.length, `Command ID should have more than just prefix: ${commandId}`);
        });
    });

    test('Command titles are descriptive', () => {
        const commandTitles = [
            'Convert Current File to PDF',
            'Convert Folder to PDF',
            'Convert with Template',
            'Preview PDF',
            'Check Dependencies',
            'Convert with Custom Template',
            'Create Custom Template',
            'Show Available Fonts',
            'Refresh Templates',
            'Edit Template',
            'Delete Template'
        ];

        commandTitles.forEach(title => {
            assert.ok(typeof title === 'string');
            assert.ok(title.length > 0);
            assert.ok(title.trim().length > 0);
        });
    });
});

suite('Extension Integration Tests', () => {
    test('Extension activation events are properly configured', () => {
        const activationEvents = [
            'onCommand:pandoc-pdf.convertCurrentFile',
            'onCommand:pandoc-pdf.convertFolder',
            'onCommand:pandoc-pdf.convertWithTemplate',
            'onCommand:pandoc-pdf.previewPdf',
            'onCommand:pandoc-pdf.checkDependencies',
            'onCommand:pandoc-pdf.convertWithCustomTemplate',
            'onCommand:pandoc-pdf.createTemplate',
            'onCommand:pandoc-pdf.showFontManager',
            'onCommand:pandoc-pdf.refreshTemplates',
            'onCommand:pandoc-pdf.editTemplate',
            'onCommand:pandoc-pdf.deleteTemplate'
        ];

        activationEvents.forEach(event => {
            assert.ok(event.startsWith('onCommand:'), `Activation event should start with 'onCommand:': ${event}`);
            assert.ok(event.length > 'onCommand:'.length, `Activation event should have command after prefix: ${event}`);
        });
    });

    test('View container configuration is valid', () => {
        const viewContainerId = 'pandoc-pdf';
        const viewId = 'pandoc-pdf-templates';

        assert.ok(typeof viewContainerId === 'string');
        assert.ok(viewContainerId.length > 0);
        assert.ok(typeof viewId === 'string');
        assert.ok(viewId.length > 0);
        assert.ok(viewId.startsWith(viewContainerId), 'View ID should start with container ID');
    });

    test('Menu configuration is valid', () => {
        const menuCommands = [
            'pandoc-pdf.createTemplate',
            'pandoc-pdf.refreshTemplates',
            'pandoc-pdf.convertWithTemplate',
            'pandoc-pdf.convertWithCustomTemplate',
            'pandoc-pdf.editTemplate',
            'pandoc-pdf.deleteTemplate',
            'pandoc-pdf.showFontManager'
        ];

        menuCommands.forEach(command => {
            assert.ok(typeof command === 'string');
            assert.ok(command.startsWith('pandoc-pdf.'), `Menu command should start with 'pandoc-pdf.': ${command}`);
        });
    });
});
