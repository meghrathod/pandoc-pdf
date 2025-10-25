import * as vscode from 'vscode';
import * as path from 'path';
import { checkAllDependencies } from '../dependencies';
import { AdvancedConverter } from '../advancedConverter';
import { getTemplate, getAllTemplateNames } from '../templates';
import { validateInputFile } from '../pathResolver';
import { parsePandocError, showErrorDialog, logError } from '../errorHandler';

export async function previewPdf(): Promise<void> {
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
        vscode.window.showErrorMessage('Required dependencies (Pandoc and XeLaTeX) are not installed. Please install them first.');
        return;
    }

    // Show template selection for preview
    const templateNames = getAllTemplateNames();
    const selectedTemplate = await vscode.window.showQuickPick(
        templateNames.map(name => {
            const template = getTemplate(name);
            return {
                label: name,
                description: template?.description,
                template
            };
        }),
        {
            placeHolder: 'Select a template for PDF preview',
            title: 'Choose Preview Template'
        }
    );

    if (!selectedTemplate) {
        return;
    }

    // Create temporary output file
    const tempDir = path.join(path.dirname(filePath), '.pandoc-temp');
    const tempOutputPath = path.join(tempDir, `preview-${Date.now()}.pdf`);
    
    // Ensure temp directory exists
    const fs = require('fs');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Generating PDF preview with ${selectedTemplate.label} template...`,
        cancellable: true
    }, async (progress, token) => {
        try {
            progress.report({ message: 'Generating preview...' });
            
            const converter = new AdvancedConverter((conversionProgress) => {
                if (!token.isCancellationRequested) {
                    progress.report({
                        message: conversionProgress.message,
                        increment: conversionProgress.percentage - (progress as any).lastPercentage || 0
                    });
                    (progress as any).lastPercentage = conversionProgress.percentage;
                }
            });
            
            if (token.isCancellationRequested) {
                return;
            }
            
            const result = await converter.convertWithCustomTemplate(filePath, selectedTemplate.label, tempOutputPath);
            
            if (result.success && result.outputPath) {
                // Open the PDF in the default viewer
                vscode.window.showInformationMessage(
                    `PDF preview generated with ${selectedTemplate.label} template`,
                    'Open Preview',
                    'Keep File'
                ).then(selection => {
                    if (selection === 'Open Preview' || selection === 'Keep File') {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(result.outputPath!));
                    }
                    
                    if (selection !== 'Keep File') {
                        // Clean up temporary file after a delay
                        setTimeout(() => {
                            try {
                                fs.unlinkSync(result.outputPath!);
                            } catch (error) {
                                // Ignore cleanup errors
                            }
                        }, 30000); // 30 seconds delay
                    }
                });
            } else {
                const parsedError = parsePandocError(result.error || 'Unknown error');
                showErrorDialog(parsedError);
                logError(result.error || 'Unknown error', 'previewPdf');
            }
        } catch (error: any) {
            const parsedError = parsePandocError(error.message);
            showErrorDialog(parsedError);
            logError(error.message, 'previewPdf');
        }
    });
}
