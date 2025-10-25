import * as vscode from 'vscode';
import { PDFTemplate, PDF_TEMPLATES } from '../templates';
import { getConfig } from '../config';

export class TemplateProvider implements vscode.TreeDataProvider<TemplateItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TemplateItem | undefined | null | void> = new vscode.EventEmitter<TemplateItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TemplateItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TemplateItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TemplateItem): Promise<TemplateItem[]> {
        if (!element) {
            // Return root items
            return Promise.resolve([
                new TemplateItem('Built-in Templates', vscode.TreeItemCollapsibleState.Expanded, 'builtin'),
                new TemplateItem('Custom Templates', vscode.TreeItemCollapsibleState.Expanded, 'custom'),
                new TemplateItem('Font Management', vscode.TreeItemCollapsibleState.None, 'fonts', '$(symbol-method)'),
                new TemplateItem('Settings', vscode.TreeItemCollapsibleState.None, 'settings', '$(gear)')
            ]);
        }

        if (element.contextValue === 'builtin') {
            // Return built-in templates
            return Promise.resolve(
                PDF_TEMPLATES.map(template => 
                    new TemplateItem(
                        template.name,
                        vscode.TreeItemCollapsibleState.None,
                        'builtin-template',
                        '$(file-pdf)',
                        template.description,
                        template
                    )
                )
            );
        }

        if (element.contextValue === 'custom') {
            // Return custom templates from settings
            const config = getConfig();
            const customTemplates = config.customTemplates || [];
            return Promise.resolve(
                customTemplates.map((template: any, index: number) => 
                    new TemplateItem(
                        template.name,
                        vscode.TreeItemCollapsibleState.None,
                        'custom-template',
                        '$(file-pdf)',
                        template.description,
                        template,
                        index
                    )
                )
            );
        }

        return Promise.resolve([]);
    }
}

export class TemplateItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly iconPath?: string,
        public readonly tooltip?: string,
        public readonly template?: PDFTemplate,
        public readonly index?: number
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltip;
        this.contextValue = contextValue;
        if (iconPath) {
            this.iconPath = iconPath;
        }
    }
}
