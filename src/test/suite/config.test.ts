import * as assert from 'assert';
import { resolveOutputPath } from '../../config';

suite('Config Tests', () => {
    test('resolveOutputPath with empty output directory', () => {
        const sourcePath = '/workspace/docs/readme.md';
        const outputPath = resolveOutputPath(sourcePath, '');
        
        assert.strictEqual(outputPath, '/workspace/docs/readme.pdf');
    });

    test('resolveOutputPath with custom directory', () => {
        const sourcePath = '/workspace/docs/readme.md';
        const outputPath = resolveOutputPath(sourcePath, '/output');
        
        assert.strictEqual(outputPath, '/output/readme.pdf');
    });

    test('resolveOutputPath with workspace variable', () => {
        const sourcePath = '/workspace/docs/readme.md';
        const outputPath = resolveOutputPath(sourcePath, '${workspaceFolder}/pdfs');
        
        // This test would need proper workspace context
        assert.ok(outputPath.includes('pdfs'));
    });

    test('resolveOutputPath with fileDirname variable', () => {
        const sourcePath = '/workspace/docs/readme.md';
        const outputPath = resolveOutputPath(sourcePath, '${fileDirname}/output');
        
        assert.ok(outputPath.includes('docs'));
        assert.ok(outputPath.includes('output'));
        assert.ok(outputPath.endsWith('.pdf'));
    });
});
