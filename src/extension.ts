import * as vscode from 'vscode';
import { convertCurrentFile } from './commands/convertCurrentFile';
import { convertFolder } from './commands/convertFolder';
import { checkDependencies } from './commands/checkDependencies';

export function activate(context: vscode.ExtensionContext) {
    console.log('Pandoc PDF extension is now active!');

    // Register commands
    const convertCurrentFileCommand = vscode.commands.registerCommand('pandoc-pdf.convertCurrentFile', convertCurrentFile);
    const convertFolderCommand = vscode.commands.registerCommand('pandoc-pdf.convertFolder', convertFolder);
    const checkDependenciesCommand = vscode.commands.registerCommand('pandoc-pdf.checkDependencies', checkDependencies);

    context.subscriptions.push(convertCurrentFileCommand, convertFolderCommand, checkDependenciesCommand);
}

export function deactivate() {}
