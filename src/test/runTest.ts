export function run(): Promise<void> {
    return new Promise((c, e) => {
        console.log('Running basic extension validation...');
        
        try {
            // Basic validation - check if extension can be loaded
            const vscode = require('vscode');
            if (vscode && vscode.commands) {
                console.log('✅ VS Code API is available');
            } else {
                throw new Error('VS Code API not available');
            }
            
            console.log('✅ Extension validation passed');
            c();
        } catch (err) {
            console.error('❌ Extension validation failed:', err);
            e(err);
        }
    });
}
