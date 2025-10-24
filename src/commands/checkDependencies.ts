import * as vscode from 'vscode';
import { checkAllDependencies, getInstallationInstructions } from '../dependencies';

export async function checkDependencies(): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Checking dependencies...',
        cancellable: false
    }, async (progress) => {
        progress.report({ message: 'Checking Pandoc...' });
        const dependencies = await checkAllDependencies();
        
        progress.report({ message: 'Preparing results...' });
        
        const messages: string[] = [];
        
        // Check Pandoc
        if (dependencies.pandoc.installed) {
            const version = dependencies.pandoc.version ? ` (v${dependencies.pandoc.version})` : '';
            messages.push(`✅ Pandoc: Installed${version}`);
            if (dependencies.pandoc.path) {
                messages.push(`   Path: ${dependencies.pandoc.path}`);
            }
        } else {
            messages.push('❌ Pandoc: Not installed');
        }
        
        // Check XeLaTeX
        if (dependencies.xelatex.installed) {
            messages.push('✅ XeLaTeX: Installed');
            if (dependencies.xelatex.path) {
                messages.push(`   Path: ${dependencies.xelatex.path}`);
            }
        } else {
            messages.push('❌ XeLaTeX: Not installed');
        }
        
        // Show results
        const allInstalled = dependencies.pandoc.installed && dependencies.xelatex.installed;
        
        if (allInstalled) {
            vscode.window.showInformationMessage('All dependencies are installed and ready to use!');
        } else {
            const result = await vscode.window.showWarningMessage(
                'Some dependencies are missing. Would you like to see installation instructions?',
                'Show Instructions',
                'Copy Status'
            );
            
            if (result === 'Show Instructions') {
                const instructions = getInstallationInstructions();
                const doc = await vscode.workspace.openTextDocument({
                    content: instructions,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc);
            } else if (result === 'Copy Status') {
                await vscode.env.clipboard.writeText(messages.join('\n'));
                vscode.window.showInformationMessage('Dependency status copied to clipboard');
            }
        }
        
        // Show detailed status
        const statusDoc = await vscode.workspace.openTextDocument({
            content: messages.join('\n'),
            language: 'text'
        });
        await vscode.window.showTextDocument(statusDoc);
    });
}
