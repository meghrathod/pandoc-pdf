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
        
        const args = [`"${inputPath}"`, `-o "${outputPath}"`];

        // Add PDF engine
        if (customConfig?.pdfEngine) {
            args.push(`--pdf-engine=${customConfig.pdfEngine}`);
        } else {
            args.push('--pdf-engine=xelatex');
        }

        // Add template if specified
        if (template) {
            const templateConfig = getTemplate(template);
            if (templateConfig) {
                const config = templateConfig.config;
                
                // Add engine
                args.push(`--pdf-engine=${config.pdfEngine}`);
                
                // Add styling variables
                if (config.fontSize !== '12pt') {
                    args.push(`--variable=fontsize:${config.fontSize}`);
                }
                
                if (config.fontFamily !== 'Times New Roman') {
                    args.push(`--variable=fontfamily:"${config.fontFamily}"`);
                }
                
                if (config.paperSize !== 'letter') {
                    args.push(`--variable=geometry:paper=${config.paperSize}`);
                }
                
                // Add margins if not default
                const margins = config.margins;
                if (margins.top !== '1in' || margins.bottom !== '1in' || margins.left !== '1in' || margins.right !== '1in') {
                    args.push(`--variable=geometry:margin=${margins.top},${margins.right},${margins.bottom},${margins.left}`);
                }
                
                // Add custom variables
                if (config.customVariables) {
                    Object.entries(config.customVariables).forEach(([key, value]) => {
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

        return `pandoc ${args.join(' ')}`;
    }

    async convertWithTemplate(options: AdvancedConversionOptions): Promise<{ success: boolean; outputPath?: string; error?: string }> {
        try {
            this.updateProgress('preparing', 'Preparing conversion...', 10);
            
            const command = this.buildAdvancedPandocCommand(options);
            console.log('Executing command:', command);
            
            this.updateProgress('converting', 'Converting to PDF...', 50);
            
            const { stderr } = await execAsync(command);
            
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
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Unknown error occurred during conversion'
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
