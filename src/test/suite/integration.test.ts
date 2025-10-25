import * as assert from 'assert';
import { getConfig, resolveOutputPath } from '../../config';
import { getTemplate, PDF_TEMPLATES } from '../../templates';
import { buildPandocCommand } from '../../converter';
import { AdvancedConverter } from '../../advancedConverter';
import { parsePandocError } from '../../errorHandler';

suite('Integration Tests', () => {
    test('Config and templates work together', () => {
        const config = getConfig();
        const blogPostTemplate = getTemplate('Blog Post');
        
        assert.ok(blogPostTemplate);
        assert.ok(config);
        
        // Blog Post template should have System font
        assert.strictEqual(blogPostTemplate!.config.fontFamily, 'System');
        
        // Config should have customTemplates array
        assert.ok(Array.isArray(config.customTemplates));
    });

    test('Template and converter integration', () => {
        const blogPostTemplate = getTemplate('Blog Post');
        assert.ok(blogPostTemplate);
        
        const command = buildPandocCommand({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            config: {
                outputDirectory: '',
                checkDependenciesOnStartup: false,
                ...blogPostTemplate!.config
            }
        });
        
        assert.ok(command.includes('pandoc'));
        assert.ok(command.includes('/test/input.md'));
        assert.ok(command.includes('/test/output.pdf'));
        assert.ok(command.includes('--pdf-engine=xelatex'));
        assert.ok(command.includes('--variable=fontsize:11pt'));
        assert.ok(command.includes('--variable=linestretch:1.2'));
    });

    test('Advanced converter with Blog Post template', () => {
        const converter = new AdvancedConverter();
        const blogPostTemplate = getTemplate('Blog Post');
        assert.ok(blogPostTemplate);
        
        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: blogPostTemplate!.config
        });
        
        assert.ok(command.includes('pandoc'));
        assert.ok(command.includes('--pdf-engine=xelatex'));
        assert.ok(command.includes('--variable=fontsize:11pt'));
        assert.ok(command.includes('--variable=linestretch:1.2'));
        assert.ok(command.includes('--variable=geometry:top=0.5in'));
        assert.ok(command.includes('--variable=geometry:bottom=0.5in'));
        assert.ok(command.includes('--variable=geometry:left=0.75in'));
        assert.ok(command.includes('--variable=geometry:right=0.75in'));
    });

    test('Error handling with real error messages', () => {
        const pandocError = 'pandoc: command not found';
        const latexError = '! LaTeX Error: File \'times.sty\' not found.';
        const fontError = '! Package fontspec Error: The font "Arial" cannot be found';
        
        const pandocResult = parsePandocError(pandocError);
        const latexResult = parsePandocError(latexError);
        const fontResult = parsePandocError(fontError);
        
        assert.strictEqual(pandocResult.type, 'dependency');
        assert.strictEqual(latexResult.type, 'latex');
        assert.strictEqual(fontResult.type, 'font');
        
        assert.ok(pandocResult.suggestion);
        assert.ok(latexResult.suggestion);
        assert.ok(fontResult.suggestion);
    });

    test('Path resolution with different scenarios', () => {
        const testCases = [
            {
                sourcePath: '/workspace/docs/readme.md',
                outputDir: '',
                expected: '/workspace/docs/readme.pdf'
            },
            {
                sourcePath: '/workspace/docs/readme.md',
                outputDir: '/output',
                expected: '/output/readme.pdf'
            },
            {
                sourcePath: '/workspace/docs/readme.md',
                outputDir: '${fileDirname}/pdfs',
                expected: '/workspace/docs/pdfs/readme.pdf'
            }
        ];
        
        testCases.forEach(testCase => {
            const result = resolveOutputPath(testCase.sourcePath, testCase.outputDir);
            assert.strictEqual(result, testCase.expected);
        });
    });

    test('All templates can be processed by converter', () => {
        const converter = new AdvancedConverter();
        
        PDF_TEMPLATES.forEach(template => {
            const command = converter['buildAdvancedPandocCommand']({
                inputPath: '/test/input.md',
                outputPath: '/test/output.pdf',
                customConfig: template.config
            });
            
            assert.ok(command.includes('pandoc'));
            assert.ok(command.includes('/test/input.md'));
            assert.ok(command.includes('/test/output.pdf'));
            assert.ok(command.includes('--pdf-engine='));
        });
    });

    test('Template configuration consistency', () => {
        PDF_TEMPLATES.forEach(template => {
            const config = template.config;
            
            // Check required properties exist
            assert.ok(['xelatex', 'pdflatex', 'lualatex'].includes(config.pdfEngine));
            assert.ok(['letter', 'a4', 'legal', 'a3', 'a5', 'a4paper', 'letterpaper'].includes(config.paperSize));
            assert.ok(typeof config.fontSize === 'string');
            assert.ok(config.fontSize.endsWith('pt'));
            assert.ok(typeof config.fontFamily === 'string');
            
            // Check margins
            assert.ok(typeof config.margins.top === 'string');
            assert.ok(typeof config.margins.bottom === 'string');
            assert.ok(typeof config.margins.left === 'string');
            assert.ok(typeof config.margins.right === 'string');
        });
    });

    test('Blog Post template as default configuration', () => {
        const blogPostTemplate = getTemplate('Blog Post');
        assert.ok(blogPostTemplate);
        
        // Should have System font
        assert.strictEqual(blogPostTemplate!.config.fontFamily, 'System');
        
        // Should have tight margins
        assert.strictEqual(blogPostTemplate!.config.margins.top, '0.5in');
        assert.strictEqual(blogPostTemplate!.config.margins.bottom, '0.5in');
        assert.strictEqual(blogPostTemplate!.config.margins.left, '0.75in');
        assert.strictEqual(blogPostTemplate!.config.margins.right, '0.75in');
        
        // Should have smaller font size
        assert.strictEqual(blogPostTemplate!.config.fontSize, '11pt');
        
        // Should have custom variables
        assert.ok(blogPostTemplate!.config.customVariables);
        assert.strictEqual(blogPostTemplate!.config.customVariables!.linestretch, '1.2');
    });

    test('System font handling across platforms', () => {
        const blogPostTemplate = getTemplate('Blog Post');
        assert.ok(blogPostTemplate);
        
        const converter = new AdvancedConverter();
        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: blogPostTemplate!.config
        });
        
        // Should include system font variables
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

    test('Custom variables are properly applied', () => {
        const blogPostTemplate = getTemplate('Blog Post');
        assert.ok(blogPostTemplate);
        
        const converter = new AdvancedConverter();
        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: blogPostTemplate!.config
        });
        
        // Should include custom variables
        assert.ok(command.includes('--variable=linestretch:1.2'));
        
        // Should not include geometry custom variable (handled by individual margin variables)
        assert.ok(!command.includes('--variable=geometry:margin='));
    });

    test('Paper size handling', () => {
        const academicTemplate = getTemplate('Academic Paper');
        assert.ok(academicTemplate);
        
        const converter = new AdvancedConverter();
        const command = converter['buildAdvancedPandocCommand']({
            inputPath: '/test/input.md',
            outputPath: '/test/output.pdf',
            customConfig: academicTemplate!.config
        });
        
        // Should include paper size
        assert.ok(command.includes('--variable=geometry:paper='));
    });
});
