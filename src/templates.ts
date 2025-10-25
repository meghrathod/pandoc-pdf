export interface PDFTemplate {
    name: string;
    description: string;
    config: {
        pdfEngine: 'xelatex' | 'pdflatex' | 'lualatex';
        margins: { top: string; bottom: string; left: string; right: string };
        fontSize: string;
        paperSize: 'letter' | 'a4' | 'legal' | 'a3' | 'a5';
        fontFamily: string;
        customVariables?: Record<string, string>;
    };
}

export const PDF_TEMPLATES: PDFTemplate[] = [
    {
        name: 'Academic Paper',
        description: 'Standard academic paper format with double spacing',
        config: {
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1.5in', right: '1in' },
            fontSize: '12pt',
            paperSize: 'letter',
            fontFamily: 'Times New Roman',
            customVariables: {
                'linestretch': '2',
                'geometry': 'margin=1in,left=1.5in'
            }
        }
    },
    {
        name: 'Presentation',
        description: 'Large font, wide margins for presentations',
        config: {
            pdfEngine: 'xelatex',
            margins: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
            fontSize: '18pt',
            paperSize: 'letter',
            fontFamily: 'Arial',
            customVariables: {
                'geometry': 'margin=0.5in'
            }
        }
    },
    {
        name: 'Book',
        description: 'Book format with chapter styling',
        config: {
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1.5in', right: '1in' },
            fontSize: '11pt',
            paperSize: 'letter',
            fontFamily: 'Times New Roman',
            customVariables: {
                'documentclass': 'book',
                'geometry': 'margin=1in,left=1.5in'
            }
        }
    },
    {
        name: 'Technical Report',
        description: 'Professional technical document format',
        config: {
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
            fontSize: '11pt',
            paperSize: 'a4',
            fontFamily: 'Computer Modern',
            customVariables: {
                'documentclass': 'article',
                'geometry': 'margin=1in'
            }
        }
    },
    {
        name: 'Minimal',
        description: 'Clean, minimal formatting',
        config: {
            pdfEngine: 'xelatex',
            margins: { top: '1in', bottom: '1in', left: '1in', right: '1in' },
            fontSize: '12pt',
            paperSize: 'letter',
            fontFamily: 'Helvetica'
        }
    }
];

export function getTemplate(name: string): PDFTemplate | undefined {
    return PDF_TEMPLATES.find(template => template.name === name);
}

export function getAllTemplateNames(): string[] {
    return PDF_TEMPLATES.map(template => template.name);
}
