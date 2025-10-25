import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SystemFont {
    name: string;
    family: string;
    style: string;
    path: string;
}

export class FontManager {
    private static instance: FontManager;
    private fonts: SystemFont[] = [];
    private initialized = false;

    static getInstance(): FontManager {
        if (!FontManager.instance) {
            FontManager.instance = new FontManager();
        }
        return FontManager.instance;
    }

    async getSystemFonts(): Promise<SystemFont[]> {
        if (this.initialized) {
            return this.fonts;
        }

        try {
            const os = process.platform;
            let command: string;

            if (os === 'darwin') {
                // macOS - use system_profiler to get font information
                command = 'system_profiler SPFontsDataType -json';
                const { stdout } = await execAsync(command);
                const data = JSON.parse(stdout);
                this.fonts = this.parseMacOSFonts(data);
            } else if (os === 'win32') {
                // Windows - use PowerShell to get fonts
                command = 'powershell "Get-ItemProperty \'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts\' | Select-Object -ExpandProperty *"';
                const { stdout } = await execAsync(command);
                this.fonts = this.parseWindowsFonts(stdout);
            } else {
                // Linux - use fc-list
                command = 'fc-list --format="%{family}:%{style}:%{file}"';
                const { stdout } = await execAsync(command);
                this.fonts = this.parseLinuxFonts(stdout);
            }

            this.initialized = true;
            return this.fonts;
        } catch (error) {
            console.error('Error getting system fonts:', error);
            return [];
        }
    }

    private parseMacOSFonts(data: any): SystemFont[] {
        const fonts: SystemFont[] = [];
        try {
            const fontData = data.SPFontsDataType[0]._items;
            for (const font of fontData) {
                fonts.push({
                    name: font._name,
                    family: font._name,
                    style: 'Regular',
                    path: font._path || ''
                });
            }
        } catch (error) {
            console.error('Error parsing macOS fonts:', error);
        }
        return fonts;
    }

    private parseWindowsFonts(output: string): SystemFont[] {
        const fonts: SystemFont[] = [];
        const lines = output.split('\n');
        
        for (const line of lines) {
            if (line.includes('=') && line.includes('.ttf')) {
                const parts = line.split('=');
                if (parts.length === 2) {
                    const name = parts[0].trim();
                    const path = parts[1].trim();
                    fonts.push({
                        name: name,
                        family: name,
                        style: 'Regular',
                        path: path
                    });
                }
            }
        }
        return fonts;
    }

    private parseLinuxFonts(output: string): SystemFont[] {
        const fonts: SystemFont[] = [];
        const lines = output.split('\n');
        
        for (const line of lines) {
            if (line.includes(':')) {
                const parts = line.split(':');
                if (parts.length >= 3) {
                    fonts.push({
                        name: parts[0],
                        family: parts[0],
                        style: parts[1],
                        path: parts[2]
                    });
                }
            }
        }
        return fonts;
    }

    async getAvailableFonts(): Promise<string[]> {
        const fonts = await this.getSystemFonts();
        const uniqueFonts = new Set<string>();
        
        fonts.forEach(font => {
            uniqueFonts.add(font.family);
        });

        return Array.from(uniqueFonts).sort();
    }

    async showFontPicker(): Promise<string | undefined> {
        const fonts = await this.getAvailableFonts();
        
        const items = fonts.map(font => ({
            label: font,
            description: `Font family: ${font}`,
            font
        }));

        return await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a font family',
            title: 'Available Fonts'
        }).then(selection => selection?.font);
    }
}



