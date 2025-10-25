import * as assert from 'assert';
import { getOSInfo, checkPandocInstalled, checkXeLaTeXInstalled } from '../../dependencies';

suite('Dependencies Tests', () => {
    test('getOSInfo returns correct platform info', () => {
        const osInfo = getOSInfo();
        
        assert.ok(['win32', 'darwin', 'linux'].includes(osInfo.platform));
        assert.ok(typeof osInfo.arch === 'string');
        assert.ok(typeof osInfo.isWindows === 'boolean');
        assert.ok(typeof osInfo.isMacOS === 'boolean');
        assert.ok(typeof osInfo.isLinux === 'boolean');
        
        // Only one should be true
        const trueCount = [osInfo.isWindows, osInfo.isMacOS, osInfo.isLinux].filter(Boolean).length;
        assert.strictEqual(trueCount, 1);
    });

    test('checkPandocInstalled returns valid structure', async () => {
        const result = await checkPandocInstalled();
        
        assert.ok(typeof result.installed === 'boolean');
        if (result.installed) {
            assert.ok(typeof result.path === 'string');
            assert.ok(result.path.length > 0);
        }
    });

    test('checkXeLaTeXInstalled returns valid structure', async () => {
        const result = await checkXeLaTeXInstalled();
        
        assert.ok(typeof result.installed === 'boolean');
        if (result.installed) {
            assert.ok(typeof result.path === 'string');
            assert.ok(result.path.length > 0);
        }
    });
});
