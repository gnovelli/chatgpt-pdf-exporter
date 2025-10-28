# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ChatGPT to PDF Exporter is a Chrome extension (Manifest V3) that exports ChatGPT conversations to PDF format. The extension is written in vanilla JavaScript with no build process required. The codebase is in Italian.

## Architecture

### Core Components

1. **Content Script (`extension/content.js`)**
   - Main class: `ChatGPTExporter`
   - Injected into ChatGPT pages (chat.openai.com, chatgpt.com)
   - Handles conversation extraction, image processing, and PDF generation
   - Creates the "📄 Esporta PDF" button in the ChatGPT UI
   - Uses multiple DOM selectors as fallbacks due to ChatGPT's dynamic interface

2. **Popup Interface (`extension/popup.html`, `popup.js`, `popup.css`)**
   - Main class: `PopupController`
   - Provides export options (include timestamp, include URL)
   - Shows conversation preview
   - Stores user preferences in chrome.storage.sync

3. **Manifest (`extension/manifest.json`)**
   - Chrome Extension Manifest V3
   - Permissions: activeTab, storage
   - Host permissions: chat.openai.com, chatgpt.com

### Key Technical Patterns

**DOM Extraction with Fallback Selectors**
The extension uses arrays of CSS selectors to accommodate ChatGPT's frequently changing DOM structure:
```javascript
const selectors = [
  'primary-selector',
  'fallback-selector-1',
  'fallback-selector-2'
];
```

**Content Extraction: HTML + Text**
- `extractMessageContent()` extracts both HTML and plain text (content.js:137-215)
- HTML preserves Markdown formatting already rendered by ChatGPT
- `cleanHTML()` strips ChatGPT-specific classes and data attributes
- Falls back to plain text if HTML extraction fails

**Markdown and Syntax Highlighting**
- ChatGPT renders Markdown to HTML in the DOM - extension extracts this HTML directly
- **highlight.js** (v11.9.0) via CDN provides syntax highlighting for code blocks
- CSS styles for all Markdown elements: headings, lists, blockquotes, tables, links, code
- Automatic language detection for code blocks
- Inline code styled with gray background, monospace font
- Multi-line code blocks with syntax highlighting and GitHub theme

**Image Handling**
- Images are converted to base64 using Canvas API (content.js:246-267)
- Small images (<50x50px) are filtered out to exclude UI elements
- Images are rendered one per page in PDF with full-width layout
- Conversion to JPEG at 90% quality for optimization

**PDF Generation**
- Uses window.print() API with custom HTML template
- Opens temporary window with formatted content
- Includes highlight.js CDN for syntax highlighting initialization
- Print CSS media queries ensure proper page breaks for images
- Script auto-runs `hljs.highlightElement()` on all `pre code` blocks

**Message Communication**
Content script listens for messages from popup:
- `getConversation`: Returns extracted conversation data
- `exportToPDF`: Triggers PDF export

## Development Commands

### Loading the Extension
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` directory

### Reloading After Changes
1. Go to `chrome://extensions/`
2. Click the reload icon for "ChatGPT to PDF Exporter"
3. Refresh any open ChatGPT tabs

### Testing
- No automated tests currently exist
- Manual testing required on both chat.openai.com and chatgpt.com
- Test with conversations containing text, images, and code blocks

## Working with DOM Selectors

ChatGPT's interface changes frequently. When selectors break:

1. **Message extraction** (content.js:79-89): Update `messageSelectors` array
2. **Button placement** (content.js:36-50): Update `selectors` in `insertButton()`
3. **Content extraction** (content.js:157-164): Update `contentSelectors` array
4. **Image detection** (content.js:209-217): Update `imageSelectors` array

Always add new selectors to the array rather than replacing existing ones for backward compatibility.

## Image Processing Notes

- Images are extracted using `extractMessageImages()` (content.js:205-244)
- Canvas conversion handles CORS restrictions
- Base64 encoding enables embedding in generated HTML
- Each image gets a dedicated page in PDF via `page-break-before: always` CSS

## Single-Page Application (SPA) Handling

ChatGPT is an SPA, so the extension reinitializes on URL changes:
```javascript
// content.js:500-507
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => new ChatGPTExporter(), 1000);
  }
}).observe(document, { subtree: true, childList: true });
```

## File Structure
```
extension/
├── manifest.json     # Extension configuration
├── content.js        # Main extraction and export logic
├── styles.css        # Button styling
├── popup.html        # Popup UI structure
├── popup.css         # Popup styling
└── popup.js          # Popup controller logic
```

## Common Issues

**Button not appearing**: ChatGPT DOM has changed - update selectors in `insertButton()`

**Images not exporting**: Check `imageSelectors` array and CORS restrictions

**Conversation extraction fails**: Update `messageSelectors` and verify ChatGPT hasn't restructured message container elements

**Preview/Export window blocked**: Browser popup blocker - instruct users to allow popups from ChatGPT domains
