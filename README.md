# Pandoc PDF Converter

A VS Code extension that converts Markdown files to PDF using Pandoc and XeLaTeX, with automatic dependency detection and customizable PDF styling options.

## Features

- **Multiple Conversion Options**: Convert single files, entire folders, or active editor content
- **Automatic Dependency Detection**: Checks for Pandoc and XeLaTeX installation with OS-specific guidance
- **Customizable PDF Styling**: Configure margins, fonts, paper size, and more
- **Comprehensive Error Handling**: Clear error messages with actionable suggestions
- **Progress Tracking**: Real-time conversion progress with cancellation support

## Prerequisites

This extension requires the following tools to be installed on your system:

### Pandoc
Pandoc is a universal document converter that handles the Markdown to PDF conversion.

### XeLaTeX (or other LaTeX engine)
XeLaTeX is used as the PDF engine for high-quality typography and Unicode support.

## Installation

### 1. Install Dependencies

#### macOS
```bash
# Install Pandoc
brew install pandoc

# Install XeLaTeX (via MacTeX)
brew install --cask mactex
```

#### Windows
```powershell
# Using Chocolatey
choco install pandoc
choco install miktex

# Or using Scoop
scoop install pandoc
scoop install miktex
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install pandoc texlive-xetex
```

#### Linux (Fedora/RHEL/CentOS)
```bash
sudo dnf install pandoc texlive-xetex
```

#### Linux (Arch)
```bash
sudo pacman -S pandoc texlive-xetex
```

### 2. Install Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Pandoc PDF Converter"
4. Click Install

## Usage

### Commands

The extension provides three main commands accessible via the Command Palette (Ctrl+Shift+P):

- **Pandoc PDF: Convert Current File to PDF** - Converts the currently active Markdown file
- **Pandoc PDF: Convert Folder to PDF** - Converts all Markdown files in a selected folder
- **Pandoc PDF: Check Dependencies** - Verifies that Pandoc and XeLaTeX are properly installed

### Configuration

Access settings via File → Preferences → Settings, then search for "Pandoc PDF":

#### Output Directory
- **Default**: Same directory as source file
- **Custom**: Specify a custom output directory
- **Variables**: Use `${workspaceFolder}`, `${fileDirname}`, `${fileName}`

#### PDF Styling
- **PDF Engine**: Choose between xelatex, pdflatex, or lualatex
- **Margins**: Set top, bottom, left, and right margins
- **Font Size**: Base font size (e.g., 12pt, 14pt)
- **Paper Size**: letter, a4, legal, a3, a5
- **Font Family**: Main font family (e.g., Times New Roman, Arial)

#### Example Configuration
```json
{
    "pandocPdf.outputDirectory": "${workspaceFolder}/output",
    "pandocPdf.pdfEngine": "xelatex",
    "pandocPdf.margins": {
        "top": "1in",
        "bottom": "1in",
        "left": "1in",
        "right": "1in"
    },
    "pandocPdf.fontSize": "12pt",
    "pandocPdf.paperSize": "a4",
    "pandocPdf.fontFamily": "Times New Roman"
}
```

## Supported File Types

Currently supports:
- Markdown (`.md`, `.markdown`)

Future versions may support additional formats like HTML, reStructuredText, and more.

## Troubleshooting

### Common Issues

#### "Pandoc not found"
- Ensure Pandoc is installed and available in your PATH
- Try restarting VS Code after installation
- Use the "Check Dependencies" command to verify installation

#### "XeLaTeX not found"
- Install a LaTeX distribution (MacTeX, MiKTeX, or TeX Live)
- Ensure the LaTeX binaries are in your PATH
- Try using a different PDF engine (pdflatex or lualatex) in settings

#### "Permission denied"
- Check file permissions for the output directory
- Ensure you have write access to the target location

#### "Package not found" (LaTeX errors)
- Install missing LaTeX packages
- Try using a different PDF engine
- Check the output channel for detailed error messages

### Getting Help

1. Use the "Check Dependencies" command to verify your setup
2. Check the Output panel for detailed error messages
3. Review the installation instructions for your operating system
4. Ensure all dependencies are properly installed and accessible

## Development

### Building from Source

```bash
git clone <repository-url>
cd pandoc-pdf
npm install
npm run compile
```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Watch mode for development
npm run watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### 1.0.0
- Initial release
- Basic Markdown to PDF conversion
- Dependency detection and installation guidance
- Configurable PDF styling options
- Multiple conversion modes (single file, folder)
- Comprehensive error handling
