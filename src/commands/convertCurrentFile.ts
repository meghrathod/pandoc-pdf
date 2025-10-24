import * as vscode from 'vscode';
import { checkAllDependencies, getInstallationInstructions } from '../dependencies';
import { getConfig } from '../config';
import { convertFile } from '../converter';
import { validateInputFile } from '../pathResolver';
import { parsePandocError, showErrorDialog, logError } from '../errorHandler';

export async function convertCurrentFile(): Promise<void> {
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

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Converting to PDF...',
        cancellable: false
    }, async (progress) => {
        try {
            const config = getConfig();
            progress.report({ message: 'Starting conversion...' });
            
            const result = await convertFile(filePath, config);
            
            if (result.success && result.outputPath) {
                progress.report({ message: 'Conversion completed!' });
                vscode.window.showInformationMessage(
                    `PDF created successfully: ${result.outputPath}`,
                    'Open PDF'
                ).then(selection => {
                    if (selection === 'Open PDF') {
                        vscode.commands.executeCommand('vscode.open', vscode.Uri.file(result.outputPath!));
                    }
                });
            } else {
                const parsedError = parsePandocError(result.error || 'Unknown error');
                showErrorDialog(parsedError);
                logError(result.error || 'Unknown error', 'convertCurrentFile');
            }
        } catch (error: any) {
            const parsedError = parsePandocError(error.message);
            showErrorDialog(parsedError);
            logError(error.message, 'convertCurrentFile');
        }
    });
}
