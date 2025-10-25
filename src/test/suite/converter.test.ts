import * as assert from 'assert';
import { buildPandocCommand } from '../../converter';
import { PandocConfig } from '../../config';

suite('Converter Tests', () => {
    test('buildPandocCommand with default config', () => {
        const config: PandocConfig = {
            outputDirectory: '',
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
            fontSize: '12pt',
            paperSize: 'letter',
            fontFamily: 'Times New Roman',
            checkDependenciesOnStartup: false
        };

        const command = buildPandocCommand({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            config
        });

        // Should only include basic command without styling options
        assert.ok(command.includes('pandoc'));
        assert.ok(command.includes('/test/input.md'));
        assert.ok(command.includes('/test/output.pdf'));
        assert.ok(command.includes('--pdf-engine=xelatex'));
        assert.ok(!command.includes('--variable=fontsize'));
        assert.ok(!command.includes('--variable=geometry'));
    });

    test('buildPandocCommand with custom config', () => {
        const config: PandocConfig = {
            outputDirectory: '',
            pdfEngine: 'pdflatex',
            margins: { top: '2in', bottom: '1in', left: '1.5in', right: '1in' },
            fontSize: '14pt',
            paperSize: 'a4',
            fontFamily: 'Arial',
            checkDependenciesOnStartup: false
        };

        const command = buildPandocCommand({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            config
        });

        assert.ok(command.includes('--pdf-engine=pdflatex'));
        assert.ok(command.includes('--variable=fontsize:14pt'));
        assert.ok(command.includes('--variable=geometry:paper=a4paper'));
        assert.ok(command.includes('--variable=geometry:top=2in'));
        assert.ok(command.includes('--variable=geometry:bottom=1in'));
        assert.ok(command.includes('--variable=geometry:left=1.5in'));
        assert.ok(command.includes('--variable=geometry:right=1in'));
    });

    test('buildPandocCommand with partial custom config', () => {
        const config: PandocConfig = {
            outputDirectory: '',
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
            fontSize: '16pt', // Only font size changed
            paperSize: 'letter',
            fontFamily: 'Times New Roman',
            checkDependenciesOnStartup: false
        };

        const command = buildPandocCommand({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            config
        });

        assert.ok(command.includes('--variable=fontsize:16pt'));
        assert.ok(!command.includes('--variable=geometry:top'));
        assert.ok(!command.includes('--variable=geometry:bottom'));
        assert.ok(!command.includes('--variable=geometry:left'));
        assert.ok(!command.includes('--variable=geometry:right'));
    });

    test('buildPandocCommand with custom variables', () => {
        const config: PandocConfig = {
            outputDirectory: '',
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
            fontSize: '12pt',
            paperSize: 'letter',
            fontFamily: 'Times New Roman',
            checkDependenciesOnStartup: false,
            customVariables: {
                'linestretch': '1.2',
                'geometry': 'margin=1in'
            }
        };

        const command = buildPandocCommand({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            config
        });

        assert.ok(command.includes('--variable=linestretch:1.2'));
        // geometry should be skipped as it's handled by individual margin variables
        assert.ok(!command.includes('--variable=geometry:margin=1in'));
    });

    test('buildPandocCommand with System font', () => {
        const config: PandocConfig = {
            outputDirectory: '',
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
            fontSize: '12pt',
            paperSize: 'letter',
            fontFamily: 'System',
            checkDependenciesOnStartup: false
        };

        const command = buildPandocCommand({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            config
        });

        // Should include system font variables based on platform
        const os = process.platform;
        if (os === 'darwin') {
            assert.ok(command.includes('--variable=mainfont:Helvetica'));
            assert.ok(command.includes('--variable=sansfont:Helvetica'));
            assert.ok(command.includes('--variable=monofont:Menlo'));
        } else if (os === 'win32') {
            assert.ok(command.includes('--variable=mainfont:Segoe UI'));
            assert.ok(command.includes('--variable=sansfont:Segoe UI'));
            assert.ok(command.includes('--variable=monofont:Consolas'));
        } else {
            assert.ok(command.includes('--variable=mainfont:Ubuntu'));
            assert.ok(command.includes('--variable=sansfont:Ubuntu'));
            assert.ok(command.includes('--variable=monofont:Ubuntu Mono'));
        }
    });
});
