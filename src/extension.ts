import * as vscode from 'vscode';
import { convertCurrentFile } from './commands/convertCurrentFile';
import { convertFolder } from './commands/convertFolder';
import { checkDependencies } from './commands/checkDependencies';
import { convertWithTemplate } from './commands/convertWithTemplate';
import { previewPdf } from './commands/previewPdf';
import { convertWithCustomTemplate } from './commands/convertWithCustomTemplate';
import { createCustomTemplate, editTemplate, deleteTemplate, showFontManager } from './commands/templateManager';
import { TemplateProvider } from './settings/templateProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Pandoc PDF extension is now active!');

    // Register tree data provider
    const templateProvider = new TemplateProvider();
    vscode.window.registerTreeDataProvider('pandoc-pdf-templates', templateProvider);

    // Register commands
    const convertCurrentFileCommand = vscode.commands.registerCommand('pandoc-pdf.convertCurrentFile', convertCurrentFile);
    const convertFolderCommand = vscode.commands.registerCommand('pandoc-pdf.convertFolder', convertFolder);
    const checkDependenciesCommand = vscode.commands.registerCommand('pandoc-pdf.checkDependencies', checkDependencies);
    const convertWithTemplateCommand = vscode.commands.registerCommand('pandoc-pdf.convertWithTemplate', convertWithTemplate);
    const previewPdfCommand = vscode.commands.registerCommand('pandoc-pdf.previewPdf', previewPdf);
    const convertWithCustomTemplateCommand = vscode.commands.registerCommand('pandoc-pdf.convertWithCustomTemplate', convertWithCustomTemplate);
    
    // Template management commands
    const createTemplateCommand = vscode.commands.registerCommand('pandoc-pdf.createTemplate', createCustomTemplate);
    const editTemplateCommand = vscode.commands.registerCommand('pandoc-pdf.editTemplate', (template, index) => editTemplate(template, index));
    const deleteTemplateCommand = vscode.commands.registerCommand('pandoc-pdf.deleteTemplate', (template, index) => deleteTemplate(template, index));
    const showFontManagerCommand = vscode.commands.registerCommand('pandoc-pdf.showFontManager', showFontManager);
    const refreshTemplatesCommand = vscode.commands.registerCommand('pandoc-pdf.refreshTemplates', () => templateProvider.refresh());

    context.subscriptions.push(
        convertCurrentFileCommand, 
        convertFolderCommand, 
        checkDependenciesCommand,
        convertWithTemplateCommand,
        previewPdfCommand,
        convertWithCustomTemplateCommand,
        createTemplateCommand,
        editTemplateCommand,
        deleteTemplateCommand,
        showFontManagerCommand,
        refreshTemplatesCommand
    );
}

export function deactivate() {}
