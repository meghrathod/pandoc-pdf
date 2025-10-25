export interface PDFTemplate {
    name: string;
    description: string;
    config: {
        pdfEngine: 'xelatex' | 'pdflatex' | 'lualatex';
        margins: { top: string; bottom: string; left: string; right: string };
        fontSize: string;
        paperSize: 'letter' | 'a4' | 'legal' | 'a3' | 'a5' | 'a4paper' | 'letterpaper';
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
            fontFamily: 'Computer Modern',
            customVariables: {
                'linestretch': '2'
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
            fontFamily: 'Computer Modern',
            customVariables: {}
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
            fontFamily: 'Computer Modern',
            customVariables: {
                'documentclass': 'book'
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
            paperSize: 'a4paper',
            fontFamily: 'Computer Modern',
            customVariables: {
                'documentclass': 'article'
            }
        }
    },
    {
        name: 'Blog Post',
        description: 'Modern blog post format with system fonts and tight spacing',
        config: {
            pdfEngine: 'xelatex',
            margins: { top: '0.5in', bottom: '0.5in', left: '0.75in', right: '0.75in' },
            fontSize: '11pt',
            paperSize: 'letter',
            fontFamily: 'System',
            customVariables: {
                'linestretch': '1.2',
                'geometry': 'margin=0.5in,left=0.75in,right=0.75in'
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
