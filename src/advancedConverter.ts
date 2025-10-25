import { exec } from 'child_process';
import { promisify } from 'util';
import { getTemplate } from './templates';
import { PandocConfig } from './config';
import { getOutputPath } from './pathResolver';

const execAsync = promisify(exec);

export interface AdvancedConversionOptions {
    inputPath: string;
    outputPath: string;
    template?: string;
    customConfig?: Partial<PandocConfig>;
    metadata?: Record<string, string>;
    filters?: string[];
    standalone?: boolean;
}

export interface ConversionProgress {
    stage: 'preparing' | 'converting' | 'postprocessing' | 'complete';
    message: string;
    percentage: number;
}

export class AdvancedConverter {
    private progressCallback?: (progress: ConversionProgress) => void;

    constructor(progressCallback?: (progress: ConversionProgress) => void) {
        this.progressCallback = progressCallback;
    }

    private updateProgress(stage: ConversionProgress['stage'], message: string, percentage: number) {
        if (this.progressCallback) {
            this.progressCallback({ stage, message, percentage });
        }
    }

    private buildAdvancedPandocCommand(options: AdvancedConversionOptions): string {
        const { inputPath, outputPath, template, customConfig, metadata, filters, standalone } = options;
        
        // Use full path to pandoc to avoid PATH issues
        const pandocPath = this.getPandocPath();
        const args = [`"${inputPath}"`, `-o "${outputPath}"`];

        // Add PDF engine (only once)
        const pdfEngine = customConfig?.pdfEngine || 'xelatex';
        args.push(`--pdf-engine=${pdfEngine}`);

        // Add template if specified
        if (template) {
            const templateConfig = getTemplate(template);
            if (templateConfig) {
                const config = templateConfig.config;
                
                // Add styling variables
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
                
                // Add margins if not default - use individual geometry variables
                const margins = config.margins;
                if (margins.top !== '1in' || margins.bottom !== '1in' || margins.left !== '1in' || margins.right !== '1in') {
                    // Use individual geometry variables for each margin
                    if (margins.top !== '1in') args.push(`--variable=geometry:top=${margins.top}`);
                    if (margins.bottom !== '1in') args.push(`--variable=geometry:bottom=${margins.bottom}`);
                    if (margins.left !== '1in') args.push(`--variable=geometry:left=${margins.left}`);
                    if (margins.right !== '1in') args.push(`--variable=geometry:right=${margins.right}`);
                }
                
                // Add custom variables (but avoid conflicts with geometry)
                if (config.customVariables) {
                    Object.entries(config.customVariables).forEach(([key, value]) => {
                        // Skip geometry if we already set geometry:margin
                        if (key === 'geometry' && args.some(arg => arg.includes('geometry:margin'))) {
                            return;
                        }
                        args.push(`--variable=${key}:${value}`);
                    });
                }
            }
        }

        // Add custom configuration overrides
        if (customConfig) {
            if (customConfig.fontSize && customConfig.fontSize !== '12pt') {
                args.push(`--variable=fontsize:${customConfig.fontSize}`);
            }
            if (customConfig.fontFamily && customConfig.fontFamily !== 'Times New Roman') {
                args.push(`--variable=fontfamily:"${customConfig.fontFamily}"`);
            }
            if (customConfig.paperSize && customConfig.paperSize !== 'letter') {
                args.push(`--variable=geometry:paper=${customConfig.paperSize}`);
            }
        }

        // Add metadata
        if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
                args.push(`--metadata=${key}:"${value}"`);
            });
        }

        // Add filters
        if (filters && filters.length > 0) {
            filters.forEach(filter => {
                args.push(`--filter=${filter}`);
            });
        }

        // Add standalone flag
        if (standalone) {
            args.push('--standalone');
        }

        return `${pandocPath} ${args.join(' ')}`;
    }

    private getPandocPath(): string {
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

    async convertWithTemplate(options: AdvancedConversionOptions): Promise<{ success: boolean; outputPath?: string; error?: string }> {
        try {
            this.updateProgress('preparing', 'Preparing conversion...', 10);
            
            const command = this.buildAdvancedPandocCommand(options);
            console.log('Executing command:', command);
            
            this.updateProgress('converting', 'Converting to PDF...', 50);
            
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
            
            const { stderr } = await execAsync(command, { env });
            
            this.updateProgress('postprocessing', 'Finalizing PDF...', 90);
            
            if (stderr && !stderr.includes('Warning')) {
                return {
                    success: false,
                    error: stderr
                };
            }

            this.updateProgress('complete', 'Conversion completed!', 100);
            
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

    async convertWithCustomTemplate(inputPath: string, templateName: string, outputPath?: string): Promise<{ success: boolean; outputPath?: string; error?: string }> {
        const finalOutputPath = outputPath || getOutputPath(inputPath, '');
        
        return await this.convertWithTemplate({
            inputPath,
            outputPath: finalOutputPath,
            template: templateName
        });
    }
}
