// import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { resolveOutputPath } from './config';

export function ensureOutputDirectory(outputPath: string): void {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
}

export function validateInputFile(filePath: string): boolean {
    if (!fs.existsSync(filePath)) {
        return false;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    return ['.md', '.markdown'].includes(ext);
}

export function getOutputPath(sourcePath: string, outputDirectory: string): string {
    const outputPath = resolveOutputPath(sourcePath, outputDirectory);
    ensureOutputDirectory(outputPath);
    return outputPath;
}
