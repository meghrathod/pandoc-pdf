import * as vscode from 'vscode';
import { FontManager } from '../settings/fontManager';
import { getConfig, CustomTemplate } from '../config';

export async function createCustomTemplate(): Promise<void> {
    const fontManager = FontManager.getInstance();
    
    // Get template name
    const name = await vscode.window.showInputBox({
        prompt: 'Enter template name',
        placeHolder: 'e.g., My Custom Template',
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Template name is required';
            }
            return null;
        }
    });

    if (!name) return;

    // Get description
    const description = await vscode.window.showInputBox({
        prompt: 'Enter template description',
        placeHolder: 'e.g., Custom template for my documents',
        value: `Custom template: ${name}`
    });

    if (!description) return;

    // Get PDF engine
    const pdfEngine = await vscode.window.showQuickPick([
        { label: 'xelatex', description: 'XeLaTeX (recommended for custom fonts)' },
        { label: 'pdflatex', description: 'PDFLaTeX (standard)' },
        { label: 'lualatex', description: 'LuaLaTeX (modern)' }
    ], {
        placeHolder: 'Select PDF engine',
        title: 'PDF Engine'
    });

    if (!pdfEngine) return;

    // Get paper size
    const paperSize = await vscode.window.showQuickPick([
        { label: 'letter', description: 'US Letter (8.5" x 11")' },
        { label: 'a4', description: 'A4 (210mm x 297mm)' },
        { label: 'legal', description: 'US Legal (8.5" x 14")' },
        { label: 'a3', description: 'A3 (297mm x 420mm)' },
        { label: 'a5', description: 'A5 (148mm x 210mm)' }
    ], {
        placeHolder: 'Select paper size',
        title: 'Paper Size'
    });

    if (!paperSize) return;

    // Get font family
    const fontFamily = await fontManager.showFontPicker();
    if (!fontFamily) return;

    // Get font size
    const fontSize = await vscode.window.showQuickPick([
        '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt'
    ], {
        placeHolder: 'Select font size',
        title: 'Font Size'
    });

    if (!fontSize) return;

    // Get margins
    const margins = await getMarginsFromUser();

    // Create template object
    const template: CustomTemplate = {
        name: name.trim(),
        description: description.trim(),
        pdfEngine: pdfEngine.label as 'xelatex' | 'pdflatex' | 'lualatex',
        margins: margins,
        fontSize: fontSize,
        paperSize: paperSize.label as 'letter' | 'a4' | 'legal' | 'a3' | 'a5' | 'a4paper' | 'letterpaper',
        fontFamily: fontFamily
    };

    // Save to settings
    const config = getConfig();
    const customTemplates = config.customTemplates || [];
    customTemplates.push(template);

    await vscode.workspace.getConfiguration('pandocPdf').update(
        'customTemplates',
        customTemplates,
        vscode.ConfigurationTarget.Global
    );

    vscode.window.showInformationMessage(`Template "${name}" created successfully!`);
}

export async function editTemplate(template: any, index: number): Promise<void> {
    // For now, show a simple edit dialog
    const newName = await vscode.window.showInputBox({
        prompt: 'Edit template name',
        value: template.name,
        placeHolder: 'Template name'
    });

    if (newName && newName !== template.name) {
        const config = getConfig();
        const customTemplates = config.customTemplates || [];
        customTemplates[index].name = newName;

        await vscode.workspace.getConfiguration('pandocPdf').update(
            'customTemplates',
            customTemplates,
            vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(`Template "${newName}" updated successfully!`);
    }
}

export async function deleteTemplate(template: any, index: number): Promise<void> {
    const result = await vscode.window.showWarningMessage(
        `Are you sure you want to delete the template "${template.name}"?`,
        'Delete',
        'Cancel'
    );

    if (result === 'Delete') {
        const config = getConfig();
        const customTemplates = config.customTemplates || [];
        customTemplates.splice(index, 1);

        await vscode.workspace.getConfiguration('pandocPdf').update(
            'customTemplates',
            customTemplates,
            vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(`Template "${template.name}" deleted successfully!`);
    }
}

export async function showFontManager(): Promise<void> {
    const fontManager = FontManager.getInstance();
    const fonts = await fontManager.getAvailableFonts();
    
    const doc = await vscode.workspace.openTextDocument({
        content: `# Available Fonts\n\n${fonts.map(font => `- ${font}`).join('\n')}\n\nTotal fonts: ${fonts.length}`,
        language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
}

async function getMarginsFromUser(): Promise<{ top: string; bottom: string; left: string; right: string }> {
    const top = await vscode.window.showInputBox({
        prompt: 'Top margin',
        value: '1in',
        placeHolder: 'e.g., 1in, 2cm, 20pt'
    }) || '1in';

    const bottom = await vscode.window.showInputBox({
        prompt: 'Bottom margin',
        value: '1in',
        placeHolder: 'e.g., 1in, 2cm, 20pt'
    }) || '1in';

    const left = await vscode.window.showInputBox({
        prompt: 'Left margin',
        value: '1in',
        placeHolder: 'e.g., 1in, 2cm, 20pt'
    }) || '1in';

    const right = await vscode.window.showInputBox({
        prompt: 'Right margin',
        value: '1in',
        placeHolder: 'e.g., 1in, 2cm, 20pt'
    }) || '1in';

    return { top, bottom, left, right };
}



