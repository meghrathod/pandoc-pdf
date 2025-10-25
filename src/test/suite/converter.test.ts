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
        assert.ok(command.includes('--variable=fontfamily:"Arial"'));
        assert.ok(command.includes('--variable=geometry:paper=a4'));
        assert.ok(command.includes('--variable=geometry:margin=2in,1in,1in,1.5in'));
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
        assert.ok(!command.includes('--variable=fontfamily'));
        assert.ok(!command.includes('--variable=geometry'));
    });
});
