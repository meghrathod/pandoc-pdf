// import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PandocConfig } from './config';
import { getOutputPath } from './pathResolver';

const execAsync = promisify(exec);

export interface ConversionOptions {
    inputPath: string;
    outputPath: string;
    config: PandocConfig;
}

export interface ConversionResult {
    success: boolean;
    outputPath?: string;
    error?: string;
}

export function buildPandocCommand(options: ConversionOptions): string {
    const { inputPath, outputPath, config } = options;
    
    // Get full path to pandoc
    const pandocPath = getPandocPath();
    
    const args = [
        `"${inputPath}"`,
        `-o "${outputPath}"`,
        `--pdf-engine=${config.pdfEngine}`
    ];

    // Only add styling options if they differ from defaults
    if (config.fontSize !== '12pt') {
        args.push(`--variable=fontsize:${config.fontSize}`);
    }
    
    // Handle special fonts
    if (config.fontFamily === 'Inter') {
        // Use XeLaTeX with Inter font via fontspec
        args.push(`--variable=mainfont:Inter`);
        args.push(`--variable=sansfont:Inter`);
    } else if (config.fontFamily === 'System') {
        // Use system fonts with cross-platform support
        const os = process.platform;
        if (os === 'darwin') {
            // macOS: System fonts
            args.push(`--variable=mainfont:Helvetica`);
            args.push(`--variable=sansfont:Helvetica`);
            args.push(`--variable=monofont:Menlo`);
        } else if (os === 'win32') {
            // Windows: Segoe UI fonts
            args.push(`--variable=mainfont:Segoe UI`);
            args.push(`--variable=sansfont:Segoe UI`);
            args.push(`--variable=monofont:Consolas`);
        } else {
            // Linux: Ubuntu/DejaVu fonts
            args.push(`--variable=mainfont:Ubuntu`);
            args.push(`--variable=sansfont:Ubuntu`);
            args.push(`--variable=monofont:Ubuntu Mono`);
        }
    }
    // Skip other font family specifications - let LaTeX use defaults
    // else if (config.fontFamily !== 'Times New Roman') {
    //     args.push(`--variable=fontfamily:"${config.fontFamily}"`);
    // }
    
    if (config.paperSize !== 'letter' && config.paperSize !== 'letterpaper') {
        // Convert paper size to geometry package format
        const paperSize = config.paperSize === 'a4' ? 'a4paper' : 
                        config.paperSize === 'a4paper' ? 'a4paper' :
                        config.paperSize;
        args.push(`--variable=geometry:paper=${paperSize}`);
    }
    
    // Only add margin settings if they differ from 1in - use individual geometry variables
    const margins = config.margins;
    if (margins.top !== '1in' || margins.bottom !== '1in' || margins.left !== '1in' || margins.right !== '1in') {
        // Use individual geometry variables for each margin
        if (margins.top !== '1in') args.push(`--variable=geometry:top=${margins.top}`);
        if (margins.bottom !== '1in') args.push(`--variable=geometry:bottom=${margins.bottom}`);
        if (margins.left !== '1in') args.push(`--variable=geometry:left=${margins.left}`);
        if (margins.right !== '1in') args.push(`--variable=geometry:right=${margins.right}`);
    }

    // Add custom variables from template (like linestretch for Blog Post)
    if (config.customVariables) {
        for (const [key, value] of Object.entries(config.customVariables)) {
            if (key !== 'geometry') { // Skip geometry as it's handled above
                args.push(`--variable=${key}:${value}`);
            }
        }
    }

    return `${pandocPath} ${args.join(' ')}`;
}

function getPandocPath(): string {
    // Try to find pandoc in common locations
    const { execSync } = require('child_process');
    try {
        const os = process.platform;
        const command = os === 'win32' ? 'where pandoc' : 'which pandoc';
        const path = execSync(command, { encoding: 'utf8' }).trim();
        return path;
    } catch {
        // Fallback to just 'pandoc' if not found
        return 'pandoc';
    }
}

export async function convertMarkdownToPdf(options: ConversionOptions): Promise<ConversionResult> {
    try {
        const command = buildPandocCommand(options);
        
        // Ensure PATH includes common locations for pandoc
        const env = { ...process.env };
        if (process.platform === 'darwin') {
            env.PATH = `${env.PATH}:/opt/homebrew/bin:/usr/local/bin`;
        } else if (process.platform === 'win32') {
            // Windows: Add common Pandoc installation paths
            const commonPaths = [
                'C:\\Program Files\\Pandoc',
                'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Pandoc',
                'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\Pandoc'
            ];
            env.PATH = `${env.PATH};${commonPaths.join(';')}`;
        }
        
        // Execute pandoc command
        const { stderr } = await execAsync(command, { env });
        
        if (stderr && !stderr.includes('Warning')) {
            return {
                success: false,
                error: stderr
            };
        }

        return {
            success: true,
            outputPath: options.outputPath
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during conversion';
        return {
            success: false,
            error: errorMessage
        };
    }
}

export async function convertFile(inputPath: string, config: PandocConfig): Promise<ConversionResult> {
    const outputPath = getOutputPath(inputPath, config.outputDirectory);
    
    return await convertMarkdownToPdf({
        inputPath,
        outputPath,
        config
    });
}
