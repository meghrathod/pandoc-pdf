import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { checkAllDependencies, getInstallationInstructions } from '../dependencies';
import { getConfig } from '../config';
import { convertFile } from '../converter';
import { validateInputFile } from '../pathResolver';
import { logError } from '../errorHandler';

export async function convertFolder(): Promise<void> {
    // Check dependencies first
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

    // Show folder picker
    const folderUri = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: 'Select Folder to Convert'
    });

    if (!folderUri || folderUri.length === 0) {
        return;
    }

    const folderPath = folderUri[0].fsPath;
    
    // Find all markdown files
    const markdownFiles = findMarkdownFiles(folderPath);
    
    if (markdownFiles.length === 0) {
        vscode.window.showInformationMessage('No Markdown files found in the selected folder.');
        return;
    }

    // Show progress
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Converting ${markdownFiles.length} files to PDF...`,
        cancellable: true
    }, async (progress, token) => {
        const config = getConfig();
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < markdownFiles.length; i++) {
            if (token.isCancellationRequested) {
                break;
            }

            const filePath = markdownFiles[i];
            const fileName = path.basename(filePath);
            
            progress.report({
                message: `Converting ${fileName} (${i + 1}/${markdownFiles.length})`,
                increment: (100 / markdownFiles.length)
            });

            try {
                const result = await convertFile(filePath, config);
                
                if (result.success) {
                    successCount++;
                } else {
                    errorCount++;
                    errors.push(`${fileName}: ${result.error}`);
                    logError(result.error || 'Unknown error', `convertFolder:${fileName}`);
                }
            } catch (error: any) {
                errorCount++;
                errors.push(`${fileName}: ${error.message}`);
                logError(error.message, `convertFolder:${fileName}`);
            }
        }

        // Show summary
        if (token.isCancellationRequested) {
            vscode.window.showInformationMessage(`Conversion cancelled. ${successCount} files converted successfully.`);
        } else {
            const message = `Conversion completed: ${successCount} successful, ${errorCount} failed.`;
            
            if (errorCount > 0) {
                vscode.window.showErrorMessage(message, 'Show Errors').then(selection => {
                    if (selection === 'Show Errors') {
                        vscode.workspace.openTextDocument({
                            content: errors.join('\n'),
                            language: 'text'
                        }).then(errorDoc => {
                            vscode.window.showTextDocument(errorDoc);
                        });
                    }
                });
            } else {
                vscode.window.showInformationMessage(message);
            }
        }
    });
}

function findMarkdownFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    function scanDirectory(currentPath: string) {
        try {
            const items = fs.readdirSync(currentPath);
            
            for (const item of items) {
                const fullPath = path.join(currentPath, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (stat.isFile() && validateInputFile(fullPath)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Skip directories that can't be read
        }
    }
    
    scanDirectory(dirPath);
    return files;
}
