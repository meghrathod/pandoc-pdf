import * as vscode from 'vscode';

export interface PandocConfig {
    outputDirectory: string;
    pdfEngine: 'xelatex' | 'pdflatex' | 'lualatex';
    margins: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
    fontSize: string;
    paperSize: 'letter' | 'a4' | 'legal' | 'a3' | 'a5';
    fontFamily: string;
    checkDependenciesOnStartup: boolean;
}

export function getConfig(): PandocConfig {
    const config = vscode.workspace.getConfiguration('pandocPdf');
    
    return {
        outputDirectory: config.get('outputDirectory', ''),
        pdfEngine: config.get('pdfEngine', 'xelatex'),
        margins: config.get('margins', {
            top: '1in',
            bottom: '1in',
            left: '1in',
            right: '1in'
        }),
        fontSize: config.get('fontSize', '12pt'),
        paperSize: config.get('paperSize', 'letter'),
        fontFamily: config.get('fontFamily', 'Times New Roman'),
        checkDependenciesOnStartup: config.get('checkDependenciesOnStartup', false)
    };
}

export function resolveOutputPath(sourcePath: string, outputDirectory: string): string {
    if (!outputDirectory) {
        // Same directory as source file
        return sourcePath.replace(/\.(md|markdown)$/i, '.pdf');
    }

    // Replace variables
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const fileDirname = require('path').dirname(sourcePath);
    const fileName = require('path').basename(sourcePath, require('path').extname(sourcePath));
    
    let resolvedPath = outputDirectory
        .replace(/\$\{workspaceFolder\}/g, workspaceFolder)
        .replace(/\$\{fileDirname\}/g, fileDirname)
        .replace(/\$\{fileName\}/g, fileName);

    // Ensure it's a directory path
    if (!resolvedPath.endsWith('.pdf')) {
        resolvedPath = require('path').join(resolvedPath, `${fileName}.pdf`);
    }

    return resolvedPath;
}
