import * as vscode from 'vscode';
import { checkAllDependencies, getInstallationInstructions } from '../dependencies';
import { AdvancedConverter } from '../advancedConverter';
import { getConfig } from '../config';
import { validateInputFile } from '../pathResolver';
import { parsePandocError, showErrorDialog, logError } from '../errorHandler';

export async function convertWithCustomTemplate(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a Markdown file.');
        return;
    }

    const filePath = editor.document.uri.fsPath;
    
    // Validate file type
    if (!validateInputFile(filePath)) {
        vscode.window.showErrorMessage('Current file is not a Markdown file. Please open a .md or .markdown file.');
        return;
    }

    // Check dependencies
    const dependencies = await checkAllDependencies();
    if (!dependencies.pandoc.installed || !dependencies.xelatex.installed) {
        const result = await vscode.window.showErrorMessage(
            'Required dependencies are missing. Would you like to see installation instructions?',
            'Show Instructions',
            'Check Dependencies'
        );
        
        if (result === 'Show Instructions') {
            const instructions = getInstallationInstructions();
            const doc = await vscode.workspace.openTextDocument({
                content: instructions,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        } else if (result === 'Check Dependencies') {
            await vscode.commands.executeCommand('pandoc-pdf.checkDependencies');
        }
        return;
    }

    // Get custom templates from settings
    const config = getConfig();
    const customTemplates = config.customTemplates || [];

    if (customTemplates.length === 0) {
        vscode.window.showInformationMessage('No custom templates found. Create one first using the template manager.');
        return;
    }

    // Show template selection
    const templateItems = customTemplates.map((template: any, index: number) => ({
        label: template.name,
        description: template.description,
        template,
        index
    }));

    const selectedTemplate = await vscode.window.showQuickPick(templateItems, {
        placeHolder: 'Select a custom template',
        title: 'Choose Custom Template'
    });

    if (!selectedTemplate) {
        return;
    }

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Converting with ${selectedTemplate.label} template...`,
        cancellable: false
    }, async (progress) => {
        try {
            progress.report({ message: 'Starting conversion...' });
            
            const converter = new AdvancedConverter((conversionProgress) => {
                progress.report({
                    message: conversionProgress.message,
                    increment: conversionProgress.percentage - (progress as any).lastPercentage || 0
                });
                (progress as any).lastPercentage = conversionProgress.percentage;
            });
            
            // Convert custom template to the format expected by AdvancedConverter
            const templateConfig = {
                pdfEngine: selectedTemplate.template.pdfEngine,
                margins: selectedTemplate.template.margins,
                fontSize: selectedTemplate.template.fontSize,
                paperSize: selectedTemplate.template.paperSize,
                fontFamily: selectedTemplate.template.fontFamily,
                customVariables: {}
            };

            const result = await converter.convertWithTemplate({
                inputPath: filePath,
                outputPath: filePath.replace(/\.(md|markdown)$/i, '.pdf'),
                template: undefined, // We'll use custom config instead
                customConfig: templateConfig
            });
            
            if (result.success && result.outputPath) {
                vscode.window.showInformationMessage(
                    `PDF created successfully with ${selectedTemplate.label} template: ${result.outputPath}`,
                    'Open PDF'
                ).then(selection => {
                    if (selection === 'Open PDF') {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(result.outputPath!));
                    }
                });
            } else {
                const parsedError = parsePandocError(result.error || 'Unknown error');
                showErrorDialog(parsedError);
                logError(result.error || 'Unknown error', 'convertWithCustomTemplate');
            }
        } catch (error: any) {
            const parsedError = parsePandocError(error.message);
            showErrorDialog(parsedError);
            logError(error.message, 'convertWithCustomTemplate');
        }
    });
}
