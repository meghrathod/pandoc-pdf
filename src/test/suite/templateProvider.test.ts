import * as assert from 'assert';
import * as vscode from 'vscode';
import { TemplateProvider } from '../../settings/templateProvider';
import { PDFTemplate } from '../../templates';

suite('Template Provider Tests', () => {
    let provider: TemplateProvider;

    setup(() => {
        provider = new TemplateProvider();
    });

    test('TemplateProvider can be instantiated', () => {
        assert.ok(provider instanceof TemplateProvider);
    });

    test('getTreeItem returns correct item for builtin template', () => {
        const mockTemplate: PDFTemplate = {
            name: 'Test Template',
            description: 'Test description',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'Times New Roman',
                customVariables: {}
            }
        };

        const item = provider.getTreeItem({
            label: 'Test Template',
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'builtin-template',
            tooltip: 'Test description',
            template: mockTemplate
        });

        assert.strictEqual(item.label, 'Test Template');
        assert.strictEqual(item.contextValue, 'builtin-template');
        assert.strictEqual(item.tooltip, 'Test description');
    });

    test('getTreeItem returns correct item for custom template', () => {
        const mockTemplate: PDFTemplate = {
            name: 'Custom Template',
            description: 'Custom description',
            config: {
                pdfEngine: 'xelatex',
                margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
                fontSize: '12pt',
                paperSize: 'letter',
                fontFamily: 'Times New Roman',
                customVariables: {}
            }
        };

        const item = provider.getTreeItem({
            label: 'Custom Template',
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'custom-template',
            tooltip: 'Custom description',
            template: mockTemplate,
            index: 0
        });

        assert.strictEqual(item.label, 'Custom Template');
        assert.strictEqual(item.contextValue, 'custom-template');
        assert.strictEqual(item.tooltip, 'Custom description');
    });

    test('getTreeItem returns correct item for fonts', () => {
        const item = provider.getTreeItem({
            label: 'Fonts',
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
            contextValue: 'fonts',
            tooltip: 'Manage fonts'
        });

        assert.strictEqual(item.label, 'Fonts');
        assert.strictEqual(item.contextValue, 'fonts');
        assert.strictEqual(item.tooltip, 'Manage fonts');
    });

    test('getChildren returns promise', () => {
        const children = provider.getChildren();
        
        assert.ok(children instanceof Promise);
    });

    test('getChildren resolves to array', async () => {
        const children = await provider.getChildren();
        
        assert.ok(Array.isArray(children));
        assert.ok(children.length > 0);
    });

    test('getChildren includes builtin templates', async () => {
        const children = await provider.getChildren();
        
        // Check that we have builtin templates
        const builtinTemplates = children.filter(child => 
            child.contextValue === 'builtin-template'
        );
        assert.ok(builtinTemplates.length > 0);
    });

    test('getChildren includes fonts section', async () => {
        const children = await provider.getChildren();
        
        const fontsSection = children.find(child => 
            child.label === 'Fonts'
        );
        assert.ok(fontsSection);
        assert.strictEqual(fontsSection.contextValue, 'fonts');
    });

    test('getChildren includes settings section', async () => {
        const children = await provider.getChildren();
        
        const settingsSection = children.find(child => 
            child.label === 'Settings'
        );
        assert.ok(settingsSection);
        assert.strictEqual(settingsSection.contextValue, 'settings');
    });

    test('refresh method exists and is callable', () => {
        assert.ok(typeof provider.refresh === 'function');
        
        // Should not throw
        assert.doesNotThrow(() => {
            provider.refresh();
        });
    });

    test('getChildren returns items with correct structure', async () => {
        const children = await provider.getChildren();
        
        children.forEach(child => {
            assert.ok(typeof child.label === 'string');
            assert.ok(child.label.length > 0);
            assert.ok(typeof child.contextValue === 'string');
            assert.ok(child.contextValue.length > 0);
        });
    });

    test('builtin templates have correct context values', async () => {
        const children = await provider.getChildren();
        const builtinTemplates = children.filter(child => 
            child.contextValue === 'builtin-template'
        );
        
        builtinTemplates.forEach(template => {
            assert.ok(template.template);
            assert.ok(typeof template.template.name === 'string');
            assert.ok(typeof template.template.description === 'string');
        });
    });

    test('template items have correct icons', async () => {
        const children = await provider.getChildren();
        const builtinTemplates = children.filter(child => 
            child.contextValue === 'builtin-template'
        );
        
        builtinTemplates.forEach(template => {
            assert.ok(template.iconPath);
        });
    });
});
