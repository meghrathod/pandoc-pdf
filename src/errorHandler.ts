import * as vscode from 'vscode';

export interface ParsedError {
    type: 'dependency' | 'syntax' | 'latex' | 'permission' | 'unknown';
    message: string;
    suggestion?: string;
}

export function parsePandocError(error: string): ParsedError {
    const errorLower = error.toLowerCase();
    
    // Check for dependency issues
    if (errorLower.includes('pandoc') && errorLower.includes('not found')) {
        return {
            type: 'dependency',
            message: 'Pandoc is not installed or not found in PATH',
            suggestion: 'Please install Pandoc using the installation instructions provided by the extension.'
        };
    }
    
    if (errorLower.includes('xelatex') && errorLower.includes('not found')) {
        return {
            type: 'dependency',
            message: 'XeLaTeX is not installed or not found in PATH',
            suggestion: 'Please install XeLaTeX (MacTeX on macOS, MiKTeX or TeX Live on Windows, texlive-xetex on Linux).'
        };
    }
    
    // Check for LaTeX package issues
    if (errorLower.includes('package') && errorLower.includes('not found')) {
        return {
            type: 'latex',
            message: 'Required LaTeX package is missing',
            suggestion: 'Install the missing LaTeX package or try using a different PDF engine (pdflatex or lualatex).'
        };
    }
    
    // Check for syntax errors
    if (errorLower.includes('parse') || errorLower.includes('syntax')) {
        return {
            type: 'syntax',
            message: 'Markdown syntax error',
            suggestion: 'Check your Markdown file for syntax errors and try again.'
        };
    }
    
    // Check for permission issues
    if (errorLower.includes('permission') || errorLower.includes('access denied')) {
        return {
            type: 'permission',
            message: 'Permission denied',
            suggestion: 'Check file permissions and ensure you have write access to the output directory.'
        };
    }
    
    return {
        type: 'unknown',
        message: error,
        suggestion: 'Check the output channel for more details.'
    };
}

export function showErrorDialog(parsedError: ParsedError): void {
    const items: vscode.MessageItem[] = [];
    
    if (parsedError.suggestion) {
        items.push({
            title: 'Get Help',
            isCloseAffordance: false
        });
    }
    
    items.push({
        title: 'Show Output',
        isCloseAffordance: false
    });
    
    vscode.window.showErrorMessage(
        `Pandoc PDF Conversion Failed: ${parsedError.message}`,
        ...items
    ).then(selection => {
        if (selection?.title === 'Get Help' && parsedError.suggestion) {
            vscode.window.showInformationMessage(parsedError.suggestion);
        } else if (selection?.title === 'Show Output') {
            vscode.commands.executeCommand('pandoc-pdf.showOutput');
        }
    });
}

export function logError(error: string, context?: string): void {
    const outputChannel = vscode.window.createOutputChannel('Pandoc PDF');
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    outputChannel.appendLine(`[${timestamp}]${contextStr} ${error}`);
    outputChannel.show();
}
