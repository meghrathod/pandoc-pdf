import * as assert from 'assert';
import { AdvancedConverter } from '../../advancedConverter';
import { PDFTemplate } from '../../templates';

suite('Advanced Converter Tests', () => {
    let converter: AdvancedConverter;

    setup(() => {
        converter = new AdvancedConverter();
    });

    test('AdvancedConverter can be instantiated', () => {
        assert.ok(converter instanceof AdvancedConverter);
    });

    test('buildAdvancedPandocCommand with Blog Post template', () => {
        const blogPostTemplate: PDFTemplate = {
            name: 'Blog Post',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '0.5in', bottom: '0.5in', left: '0.75in', right: '0.75in' },
                fontSize: '11pt',
                paperSize: 'letter',
                fontFamily: 'System',
                customVariables: {
                    'linestretch': '1.2'
                }
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: blogPostTemplate.config
        });

        assert.ok(command.includes('pandoc'));
        assert.ok(command.includes('/test/input.md'));
        assert.ok(command.includes('/test/output.pdf'));
        assert.ok(command.includes('--pdf-engine=xelatex'));
        assert.ok(command.includes('--variable=fontsize:11pt'));
        assert.ok(command.includes('--variable=linestretch:1.2'));
        assert.ok(command.includes('--variable=geometry:top=0.5in'));
        assert.ok(command.includes('--variable=geometry:bottom=0.5in'));
        assert.ok(command.includes('--variable=geometry:left=0.75in'));
        assert.ok(command.includes('--variable=geometry:right=0.75in'));
    });

    test('buildAdvancedPandocCommand with Inter font', () => {
        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'Inter',
                customVariables: {}
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        assert.ok(command.includes('--variable=mainfont:Inter'));
        assert.ok(command.includes('--variable=sansfont:Inter'));
    });

    test('buildAdvancedPandocCommand with System font on macOS', () => {
        // Mock process.platform
        const originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', {
            value: 'darwin',
            writable: true
        });

        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'System',
                customVariables: {}
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        assert.ok(command.includes('--variable=mainfont:Helvetica'));
        assert.ok(command.includes('--variable=sansfont:Helvetica'));
        assert.ok(command.includes('--variable=monofont:Menlo'));

        // Restore original platform
        Object.defineProperty(process, 'platform', {
            value: originalPlatform,
            writable: true
        });
    });

    test('buildAdvancedPandocCommand with System font on Windows', () => {
        // Mock process.platform
        const originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', {
            value: 'win32',
            writable: true
        });

        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'System',
                customVariables: {}
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        assert.ok(command.includes('--variable=mainfont:Segoe UI'));
        assert.ok(command.includes('--variable=sansfont:Segoe UI'));
        assert.ok(command.includes('--variable=monofont:Consolas'));

        // Restore original platform
        Object.defineProperty(process, 'platform', {
            value: originalPlatform,
            writable: true
        });
    });

    test('buildAdvancedPandocCommand with A4 paper size', () => {
        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'a4',
                fontFamily: 'Times New Roman',
                customVariables: {}
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        assert.ok(command.includes('--variable=geometry:paper=a4paper'));
    });

    test('buildAdvancedPandocCommand with custom variables', () => {
        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'Times New Roman',
                customVariables: {
                    'linestretch': '1.5',
                    'geometry': 'margin=1in'
                }
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        assert.ok(command.includes('--variable=linestretch:1.5'));
        // geometry should be skipped as it's handled by individual margin variables
        assert.ok(!command.includes('--variable=geometry:margin=1in'));
    });

    test('buildAdvancedPandocCommand handles default margins', () => {
        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'Times New Roman',
                customVariables: {}
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        // Should not include geometry variables for default margins
        assert.ok(!command.includes('--variable=geometry:top'));
        assert.ok(!command.includes('--variable=geometry:bottom'));
        assert.ok(!command.includes('--variable=geometry:left'));
        assert.ok(!command.includes('--variable=geometry:right'));
    });

    test('buildAdvancedPandocCommand handles default font size', () => {
        const template: PDFTemplate = {
            name: 'Test',
            description: 'Test template',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'Times New Roman',
                customVariables: {}
            }
        };

        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: template.config
        });

        // Should not include fontsize for default 12pt
        assert.ok(!command.includes('--variable=fontsize:12pt'));
    });
});
