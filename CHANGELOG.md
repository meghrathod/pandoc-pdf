# Changelog

All notable changes to the Pandoc PDF Converter extension will be documented in this file.

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Pandoc PDF Converter extension
- Convert Markdown files to PDF using Pandoc and XeLaTeX
- Multiple conversion modes:
  - Convert current active file
  - Convert entire folder of Markdown files
  - Batch processing with progress tracking
- Automatic dependency detection for Pandoc and XeLaTeX
- OS-specific installation guidance (macOS, Windows, Linux)
- Comprehensive configuration options:
  - Customizable output directory with variable support
  - PDF engine selection (xelatex, pdflatex, lualatex)
  - Page margins configuration
  - Font size and family settings
  - Paper size options (letter, a4, legal, a3, a5)
- Error handling and user feedback:
  - Clear error messages with actionable suggestions
  - Progress notifications with cancellation support
  - Output channel for detailed logging
  - Dependency status checking
- VS Code integration:
  - Command palette integration
  - Settings UI integration
  - File type validation
  - Automatic PDF preview after conversion

### Technical Details
- TypeScript implementation
- VS Code Extension API v1.74.0+
- Pandoc integration via child process execution
- Cross-platform support (Windows, macOS, Linux)
- Comprehensive error parsing and user guidance
- Configurable PDF styling through Pandoc variables

### Dependencies
- Pandoc (universal document converter)
- XeLaTeX (or alternative LaTeX engine)
- VS Code 1.74.0 or higher
