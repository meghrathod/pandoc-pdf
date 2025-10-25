import * as assert from 'assert';
import { parsePandocError } from '../../errorHandler';

suite('Error Handler Tests', () => {
    test('parsePandocError detects dependency issues', () => {
        const error = 'pandoc: command not found';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'dependency');
        assert.ok(result.message.includes('Pandoc'));
        assert.ok(result.suggestion);
    });

    test('parsePandocError detects LaTeX errors', () => {
        const error = '! LaTeX Error: File \'times.sty\' not found.';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'latex');
        assert.ok(result.message.includes('LaTeX'));
        assert.ok(result.suggestion);
    });

    test('parsePandocError detects font errors', () => {
        const error = '! Package fontspec Error: The font "Arial" cannot be found';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'font');
        assert.ok(result.message.includes('font'));
        assert.ok(result.suggestion);
    });

    test('parsePandocError detects geometry errors', () => {
        const error = '! Package keyval Error: letter undefined.';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'geometry');
        assert.ok(result.message.includes('geometry'));
        assert.ok(result.suggestion);
    });

    test('parsePandocError handles unknown errors', () => {
        const error = 'Some random error message';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'unknown');
        assert.strictEqual(result.message, error);
        assert.ok(result.suggestion);
    });

    test('parsePandocError is case insensitive', () => {
        const error = 'PANDOC: COMMAND NOT FOUND';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'dependency');
    });

    test('parsePandocError handles empty string', () => {
        const result = parsePandocError('');
        
        assert.strictEqual(result.type, 'unknown');
        assert.strictEqual(result.message, '');
    });

    test('parsePandocError handles multiple error types', () => {
        const error = 'pandoc: command not found\n! LaTeX Error: File not found';
        const result = parsePandocError(error);
        
        // Should match the first error type found
        assert.strictEqual(result.type, 'dependency');
    });

    test('parsePandocError returns ParsedError structure', () => {
        const error = 'Test error';
        const result = parsePandocError(error);
        
        assert.ok(typeof result === 'object');
        assert.ok(typeof result.type === 'string');
        assert.ok(typeof result.message === 'string');
        assert.ok(typeof result.suggestion === 'string');
    });

    test('parsePandocError handles XeLaTeX specific errors', () => {
        const error = 'xelatex: command not found';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'dependency');
        assert.ok(result.message.includes('XeLaTeX'));
    });

    test('parsePandocError handles PDF engine errors', () => {
        const error = 'Error producing PDF with pdflatex';
        const result = parsePandocError(error);
        
        assert.strictEqual(result.type, 'latex');
        assert.ok(result.message.includes('PDF engine'));
    });
});
