# PDF-Merger-Tool
PDF Merger Tool is a simple and efficient utility that allows you to combine multiple PDF files into a single organized document. Merge files quickly, maintain document quality, and streamline file management for work, study, and personal use.

# DocuMerge — Premium PDF Assembler

DocuMerge is a powerful, browser-based PDF merging tool that allows you to combine multiple PDF documents instantly without uploading files to any server. Everything happens securely on your device.

## Features

- **Drag & Drop Interface** — Intuitive dropzone for selecting and adding multiple PDF files
- **Reorderable Queue** — Drag-and-drop file reordering with SortableJS for custom document arrangement
- **PDF Metadata Extraction** — Automatic page counting and file analysis for each document
- **Real-time Preview** — Live PDF preview modal with embedded viewer
- **Encrypted PDF Support** — Handles password-protected PDFs with encryption detection
- **Workspace Settings** — Customizable output filename with automatic PDF extension
- **Progress Tracking** — Visual progress bar during merging operations
- **Success Modal** — Document metadata display (total pages, file count) after merging
- **Download Ready** — One-click download of merged PDF document
- **Dark Mode Support** — Full light and dark theme toggle
- **Particle Animation** — Floating paper particle background with theme-aware rendering
- **Toast Notifications** — Elegant feedback system for user actions
- **File Management** — Remove individual files, clear entire queue, reorder documents
- **Mobile Responsive** — Fully responsive design with touch-friendly controls
- **Zero Server Upload** — Client-side only processing—no files leave your device

## Built With

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6+)
- [pdf-lib](https://pdf-lib.js.org/) — Client-side PDF manipulation library
- [SortableJS](https://sortablejs.github.io/Sortable/) — Drag-and-drop reordering
- [Lucide Icons](https://lucide.dev/) — Modern icon library
- [Canvas Confetti](https://github.com/catdad/canvas-confetti) — Celebration effects
- Canvas API (particle animation engine)

## Project Structure

```
PDF Merger Tool/
├── index.html       # Main application interface
├── app.js           # Core merging logic and state management
└── style.css        # Custom animations and premium effects
```

## Usage

1. **Open the App**: Load `index.html` in a modern web browser
2. **Add PDFs**:
   - Click the dropzone and select PDF files, or
   - Drag and drop PDF files directly onto the dropzone
3. **Arrange Order** (optional):
   - Drag files using the grip handle to reorder
   - Use up/down arrows for sequential reordering
4. **Configure Output**:
   - Enter a custom name in the "Output Binder Name" field
   - Toggle optimization options if available
5. **Merge**:
   - Click the "Merge PDFs" button
   - Monitor progress in the processing modal
6. **Preview & Download**:
   - View merged document preview
   - Check metadata (total pages, file count)
   - Download the final PDF file
7. **Theme Toggle**: Click the moon/sun icon to switch between light and dark modes

## Key Features in Detail

### File Queue Management
- Add multiple PDF files at once
- Real-time page count display for each file
- File size indicator in human-readable format
- Encryption detection warning
- Remove individual files or clear entire queue
- Smooth animations for adding/removing items

### Drag-and-Drop Reordering
- **SortableJS Integration** — Intuitive drag handle with visual feedback
- **Touch Support** — Arrow buttons for mobile devices
- **Real-time Sync** — DOM order automatically reflects data state

### PDF Metadata Parsing
- Extracts page count for each document
- Detects encrypted/password-protected PDFs
- Handles corrupted or malformed files gracefully
- Shows "?" for unreadable files

### Merging Engine
- Uses **pdf-lib** library for client-side manipulation
- Preserves formatting, colors, and embedded content
- Supports large files (browser memory dependent)
- Real-time progress indication
- Processing modal with visual feedback

### Success Confirmation
- Final document statistics display
- Total page count calculation
- Number of merged files
- Direct download link
- Option to merge additional documents

## Technical Architecture

### State Management
```javascript
// Global state variables
let filesInQueue = []           // Array of file objects with metadata
let theme = "dark"              // Current theme mode
let optimizedMerging = false    // Optimization flag
let activeMergedBlob = null     // Final merged PDF binary
let activeMergedBlobUrl = null  // Download URL for merged PDF
```

### LocalStorage Keys
- No persistent storage (session-based only)

### Canvas Background System
- **DriftingSheet Class** — Simulates floating paper particles
- **Theme-aware Rendering** — Color adjustments for light/dark modes
- **Responsive Canvas** — Auto-resizes on window changes
- **A4 Aspect Ratio** — Particles maintain document proportions

### PDF Processing Flow
1. File validation (type check, format verification)
2. Metadata extraction (pdf-lib parsing)
3. Placeholder UI rendering for immediate feedback
4. Real card generation with interactive controls
5. Merge processing with progress updates
6. Blob generation and download URL creation

## Browser Compatibility

- Chrome/Edge (latest, recommended)
- Firefox (latest)
- Safari (latest)
- Any modern browser supporting:
  - ES6+ JavaScript
  - CSS Grid/Flexbox
  - Canvas API
  - File API
  - Blob URLs

## Performance Considerations

- **Client-side Processing** — No server latency
- **Memory Dependent** — Large merged PDFs limited by browser memory
- **Recommended**: Use for files totaling under 100MB
- **Canvas Animation** — requestAnimationFrame for smooth particles
- **Efficient DOM Updates** — Batch DOM manipulations

## Supported File Formats

- **PDF** — Standard PDF documents (.pdf)
- **Encrypted PDFs** — Password-protected documents with detection
- **Multi-page PDFs** — No page limit (browser memory dependent)

## Limitations

- Browser memory constraints for very large files
- Some advanced PDF features may not be preserved
- Password-protected PDFs detected but not decrypted
- Maximum practical merged size: varies by device (typically 100-500MB)

## Extending the App

### Adding Compression
```javascript
// Option to compress merged PDF
let compressionEnabled = false;
// Use pdf-lib compression during merge
```

### Custom Themes
Modify Tailwind theme in HTML `<script>` section:
```javascript
colors: {
    premium: {
        dark: '#09090b',
        accent: '#6366f1',
        // customize colors
    }
}
```

### Advanced Merge Options
- PDF page filtering (include/exclude specific pages)
- Page range selection
- Bookmarks and outline creation
- Metadata injection

## Future Enhancements

- [ ] PDF page extraction and selective merging
- [ ] Bookmark/outline management
- [ ] Page reordering between documents
- [ ] Batch processing mode
- [ ] PDF editing capabilities
- [ ] Cloud storage integration (optional)
- [ ] PDF split/extraction tool

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Files not loading | Ensure files are valid PDF format |
| Merge fails | Check browser console, try with smaller files |
| Preview not showing | Verify browser supports embedded PDF viewer |
| Performance slow | Reduce file size or number of documents |
| Dark mode not working | Clear browser cache and reload |

## License

Add your preferred open source license before publishing on GitHub.

## Credits

- PDF manipulation: [pdf-lib](https://pdf-lib.js.org/)
- Drag-and-drop: [SortableJS](https://sortablejs.github.io/Sortable/)
- Icons: [Lucide Icons](https://lucide.dev/)
- Celebration effects: [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Fonts: Google Fonts (Plus Jakarta Sans, Playfair Display)

---

**Ready to merge?** Open `index.html` and start combining your PDFs securely!
