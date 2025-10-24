// import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface OSInfo {
    platform: string;
    arch: string;
    isWindows: boolean;
    isMacOS: boolean;
    isLinux: boolean;
}

export interface DependencyStatus {
    pandoc: {
        installed: boolean;
        version?: string;
        path?: string;
    };
    xelatex: {
        installed: boolean;
        path?: string;
    };
}

export function getOSInfo(): OSInfo {
    const platform = process.platform;
    return {
        platform,
        arch: process.arch,
        isWindows: platform === 'win32',
        isMacOS: platform === 'darwin',
        isLinux: platform === 'linux'
    };
}

export async function checkPandocInstalled(): Promise<{ installed: boolean; version?: string; path?: string }> {
    try {
        const os = getOSInfo();
        const command = os.isWindows ? 'where pandoc' : 'which pandoc';
        const { stdout } = await execAsync(command);
        const path = stdout.trim();
        
        if (path) {
            // Get version
            try {
                const { stdout: versionOutput } = await execAsync('pandoc --version');
                const versionMatch = versionOutput.match(/pandoc\s+(\d+\.\d+\.\d+)/);
                const version = versionMatch ? versionMatch[1] : 'unknown';
                return { installed: true, version, path };
            } catch {
                return { installed: true, path };
            }
        }
        return { installed: false };
    } catch {
        return { installed: false };
    }
}

export async function checkXeLaTeXInstalled(): Promise<{ installed: boolean; path?: string }> {
    try {
        const os = getOSInfo();
        const command = os.isWindows ? 'where xelatex' : 'which xelatex';
        const { stdout } = await execAsync(command);
        const path = stdout.trim();
        
        if (path) {
            return { installed: true, path };
        }
        return { installed: false };
    } catch {
        return { installed: false };
    }
}

export async function checkAllDependencies(): Promise<DependencyStatus> {
    const [pandoc, xelatex] = await Promise.all([
        checkPandocInstalled(),
        checkXeLaTeXInstalled()
    ]);

    return {
        pandoc,
        xelatex
    };
}

export function getInstallationInstructions(): string {
    const os = getOSInfo();
    
    if (os.isMacOS) {
        return `# Installation Instructions for macOS

## Install Pandoc
\`\`\`bash
brew install pandoc
\`\`\`

## Install XeLaTeX (via MacTeX)
\`\`\`bash
brew install --cask mactex
\`\`\`

Note: MacTeX is a large download (~4GB). After installation, you may need to restart VS Code for the PATH to be updated.`;
    } else if (os.isWindows) {
        return `# Installation Instructions for Windows

## Install Pandoc
### Option 1: Using Chocolatey
\`\`\`powershell
choco install pandoc
\`\`\`

### Option 2: Using Scoop
\`\`\`powershell
scoop install pandoc
\`\`\`

### Option 3: Download from official website
Download from: https://pandoc.org/installing.html

## Install XeLaTeX (via MiKTeX or TeX Live)
### Option 1: MiKTeX
\`\`\`powershell
choco install miktex
\`\`\`

### Option 2: TeX Live
\`\`\`powershell
choco install texlive
\`\`\`

After installation, restart VS Code for the PATH to be updated.`;
    } else if (os.isLinux) {
        return `# Installation Instructions for Linux

## Install Pandoc
### Ubuntu/Debian
\`\`\`bash
sudo apt update
sudo apt install pandoc
\`\`\`

### Fedora/RHEL/CentOS
\`\`\`bash
sudo dnf install pandoc
\`\`\`

### Arch Linux
\`\`\`bash
sudo pacman -S pandoc
\`\`\`

## Install XeLaTeX
### Ubuntu/Debian
\`\`\`bash
sudo apt install texlive-xetex
\`\`\`

### Fedora/RHEL/CentOS
\`\`\`bash
sudo dnf install texlive-xetex
\`\`\`

### Arch Linux
\`\`\`bash
sudo pacman -S texlive-xetex
\`\`\``;
    }
    
    return 'Installation instructions not available for this platform.';
}
