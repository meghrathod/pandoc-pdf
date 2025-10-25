import * as vscode from 'vscode';
import { convertCurrentFile } from './commands/convertCurrentFile';
import { convertFolder } from './commands/convertFolder';
import { checkDependencies } from './commands/checkDependencies';
import { convertWithTemplate } from './commands/convertWithTemplate';
import { previewPdf } from './commands/previewPdf';

export function activate(context: vscode.ExtensionContext) {
    console.log('Pandoc PDF extension is now active!');

    // Register commands
    const convertCurrentFileCommand = vscode.commands.registerCommand('pandoc-pdf.convertCurrentFile', convertCurrentFile);
    const convertFolderCommand = vscode.commands.registerCommand('pandoc-pdf.convertFolder', convertFolder);
    const checkDependenciesCommand = vscode.commands.registerCommand('pandoc-pdf.checkDependencies', checkDependencies);
    const convertWithTemplateCommand = vscode.commands.registerCommand('pandoc-pdf.convertWithTemplate', convertWithTemplate);
    const previewPdfCommand = vscode.commands.registerCommand('pandoc-pdf.previewPdf', previewPdf);

    context.subscriptions.push(
        convertCurrentFileCommand, 
        convertFolderCommand, 
        checkDependenciesCommand,
        convertWithTemplateCommand,
        previewPdfCommand
    );
}

export function deactivate() {}
