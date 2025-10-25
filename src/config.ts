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
    paperSize: 'letter' | 'a4' | 'legal' | 'a3' | 'a5' | 'a4paper' | 'letterpaper';
    fontFamily: string;
    checkDependenciesOnStartup: boolean;
    customTemplates?: CustomTemplate[];
    customVariables?: Record<string, string>;
}

export interface CustomTemplate {
    name: string;
    description: string;
    pdfEngine: 'xelatex' | 'pdflatex' | 'lualatex';
    margins: {
        top: string;
        bottom: string;
        left: string;
        right: string;
    };
    fontSize: string;
    paperSize: 'letter' | 'a4' | 'legal' | 'a3' | 'a5' | 'a4paper' | 'letterpaper';
    fontFamily: string;
    customVariables?: Record<string, string>;
}

export function getConfig(): PandocConfig {
    const config = vscode.workspace.getConfiguration('pandocPdf');
    
    return {
        outputDirectory: config.get('outputDirectory', ''),
        pdfEngine: config.get('pdfEngine', 'xelatex'),
        margins: config.get('margins', {
            top: '0.5in',
            bottom: '0.5in',
            left: '0.75in',
            right: '0.75in'
        }),
        fontSize: config.get('fontSize', '11pt'),
        paperSize: config.get('paperSize', 'letter'),
        fontFamily: config.get('fontFamily', 'System'),
        checkDependenciesOnStartup: config.get('checkDependenciesOnStartup', false),
        customTemplates: config.get('customTemplates', [])
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
