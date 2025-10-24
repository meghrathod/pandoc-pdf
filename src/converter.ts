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
    
    const args = [
        `"${inputPath}"`,
        `-o "${outputPath}"`,
        `--pdf-engine=${config.pdfEngine}`
    ];

    // Only add styling options if they differ from defaults
    if (config.fontSize !== '12pt') {
        args.push(`--variable=fontsize:${config.fontSize}`);
    }
    
    if (config.fontFamily !== 'Times New Roman') {
        args.push(`--variable=fontfamily:"${config.fontFamily}"`);
    }
    
    if (config.paperSize !== 'letter') {
        args.push(`--variable=geometry:paper=${config.paperSize}`);
    }
    
    // Only add margin settings if they differ from 1in
    const margins = config.margins;
    if (margins.top !== '1in' || margins.bottom !== '1in' || margins.left !== '1in' || margins.right !== '1in') {
        args.push(`--variable=geometry:margin=${margins.top},${margins.right},${margins.bottom},${margins.left}`);
    }

    return `pandoc ${args.join(' ')}`;
}

export async function convertMarkdownToPdf(options: ConversionOptions): Promise<ConversionResult> {
    try {
        const command = buildPandocCommand(options);
        
        // Execute pandoc command
        const { stderr } = await execAsync(command);
        
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
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Unknown error occurred during conversion'
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
