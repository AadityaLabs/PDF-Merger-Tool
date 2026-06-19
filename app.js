document.addEventListener("DOMContentLoaded", () => {
            // State Management
            let filesInQueue = [];
            let optimizedMerging = false;
            let theme = "dark"; // Defaulting to the pre-loaded dark mode class on HTML
            let activeMergedBlob = null;
            let activeMergedBlobUrl = null;

            // Elements Configuration
            const elements = {
                ambientCanvas: document.getElementById("ambientCanvas"),
                dropZone: document.getElementById("dropZone"),
                fileInput: document.getElementById("fileInput"),
                clearAllBtn: document.getElementById("clearAllBtn"),
                themeToggleBtn: document.getElementById("themeToggleBtn"),
                themeToggleIcon: document.getElementById("themeToggleIcon"),
                queueCounter: document.getElementById("queueCounter"),
                outputFilename: document.getElementById("outputFilename"),
                toggleOptimization: document.getElementById("toggleOptimization"),
                mergeBtn: document.getElementById("mergeBtn"),
                emptyState: document.getElementById("emptyState"),
                sortableList: document.getElementById("sortableList"),
                dragOverlay: document.getElementById("dragOverlay"),
                processingModal: document.getElementById("processingModal"),
                processingTitle: document.getElementById("processingTitle"),
                processingStateDesc: document.getElementById("processingStateDesc"),
                loadingProgressRing: document.getElementById("loadingProgressRing"),
                processingProgressBar: document.getElementById("processingProgressBar"),
                previewModal: document.getElementById("previewModal"),
                closePreviewBtn: document.getElementById("closePreviewBtn"),
                successDocTitle: document.getElementById("successDocTitle"),
                successDocMeta: document.getElementById("successDocMeta"),
                metaTotalPages: document.getElementById("metaTotalPages"),
                metaTotalFiles: document.getElementById("metaTotalFiles"),
                downloadMergedBtn: document.getElementById("downloadMergedBtn"),
                doneBtn: document.getElementById("doneBtn"),
                pdfPreviewIframe: document.getElementById("pdfPreviewIframe"),
                toastContainer: document.getElementById("toastContainer")
            };

            // Initial Lucide Icon Rendering
            lucide.createIcons();

            // Setup Ambient Particles on Canvas
            const canvas = elements.ambientCanvas;
            const ctx = canvas.getContext("2d");
            let particles = [];
            
            function resizeCanvas() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            window.addEventListener("resize", resizeCanvas);
            resizeCanvas();

            // Particle constructor
            class DriftingSheet {
                constructor() {
                    this.reset();
                    this.y = Math.random() * canvas.height;
                }

                reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + 50;
                    this.sizeW = Math.random() * 20 + 15;
                    this.sizeH = this.sizeW * 1.414; // A4 Aspect Ratio representation
                    this.speed = Math.random() * 0.4 + 0.1;
                    this.angle = Math.random() * Math.PI * 2;
                    this.rotationSpeed = (Math.random() - 0.5) * 0.005;
                    this.alpha = Math.random() * 0.15 + 0.05;
                }

                update() {
                    this.y -= this.speed;
                    this.angle += this.rotationSpeed;
                    
                    // drift sideways naturally
                    this.x += Math.sin(this.angle) * 0.1;

                    if (this.y < -this.sizeH - 20) {
                        this.reset();
                    }
                }

                draw() {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.angle);
                    ctx.fillStyle = theme === 'dark' ? `rgba(99, 102, 241, ${this.alpha})` : `rgba(99, 102, 241, ${this.alpha * 0.5})`;
                    ctx.strokeStyle = theme === 'dark' ? `rgba(255, 255, 255, ${this.alpha * 0.2})` : `rgba(0, 0, 0, ${this.alpha * 0.1})`;
                    ctx.lineWidth = 1;
                    
                    // Draw a mini simulated paper document
                    ctx.beginPath();
                    ctx.rect(-this.sizeW/2, -this.sizeH/2, this.sizeW, this.sizeH);
                    ctx.fill();
                    ctx.stroke();

                    // Optional design lines on drifting papers
                    ctx.strokeStyle = theme === 'dark' ? `rgba(255, 255, 255, ${this.alpha * 0.1})` : `rgba(0, 0, 0, ${this.alpha * 0.05})`;
                    ctx.beginPath();
                    ctx.moveTo(-this.sizeW/2 + 4, -this.sizeH/2 + 6);
                    ctx.lineTo(this.sizeW/2 - 4, -this.sizeH/2 + 6);
                    ctx.moveTo(-this.sizeW/2 + 4, -this.sizeH/2 + 12);
                    ctx.lineTo(this.sizeW/2 - 8, -this.sizeH/2 + 12);
                    ctx.stroke();

                    ctx.restore();
                }
            }

            // Create initial set of floating papers
            const maxParticles = 25;
            for (let i = 0; i < maxParticles; i++) {
                particles.push(new DriftingSheet());
            }

            // Main Background Loop
            function animateBackground() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.update();
                    p.draw();
                });
                requestAnimationFrame(animateBackground);
            }
            animateBackground();

            // Setup SortableJS on Assembly List container
            const sortable = new Sortable(elements.sortableList, {
                animation: 250,
                handle: '.drag-handle',
                ghostClass: 'opacity-40',
                chosenClass: 'scale-[1.01]',
                dragClass: 'shadow-2xl',
                onEnd: function () {
                    // Match visual list order to data state array order
                    const currentDOMOrder = Array.from(elements.sortableList.children).map(child => child.dataset.id);
                    const reorderedFiles = [];
                    currentDOMOrder.forEach(id => {
                        const fileObj = filesInQueue.find(f => f.id === id);
                        if (fileObj) reorderedFiles.push(fileObj);
                    });
                    filesInQueue = reorderedFiles;
                    updateUIState();
                }
            });

            // CUSTOM ELEGANT TOAST ALERTS
            function showToast(message, type = "success") {
                const toast = document.createElement("div");
                toast.className = `toast-slide-in flex items-center gap-3 px-4 py-3 rounded-xl border glass-panel shadow-xl pointer-events-auto transition-all duration-300 ${
                    type === "success" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : type === "info"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                }`;

                const icon = document.createElement("i");
                icon.setAttribute("data-lucide", type === "success" ? "check-circle" : type === "info" ? "info" : "alert-triangle");
                icon.className = "w-5 h-5 flex-shrink-0";
                toast.appendChild(icon);

                const textNode = document.createElement("span");
                textNode.className = "text-xs font-semibold";
                textNode.textContent = message;
                toast.appendChild(textNode);

                elements.toastContainer.appendChild(toast);
                lucide.createIcons();

                setTimeout(() => {
                    toast.classList.add("opacity-0", "translate-x-8");
                    setTimeout(() => {
                        toast.remove();
                    }, 300);
                }, 4000);
            }

            // FILE MANAGEMENT HELPERS
            function formatBytes(bytes, decimals = 1) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const dm = decimals < 0 ? 0 : decimals;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            }

            async function parsePDFMetadata(file) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { 
                        ignoreEncryption: true 
                    });
                    return {
                        pagesCount: pdfDoc.getPageCount(),
                        isEncrypted: pdfDoc.isEncrypted
                    };
                } catch (e) {
                    console.error("PDF Parsing error: ", e);
                    return {
                        pagesCount: null,
                        isEncrypted: true // Assume issue might be security/corruption
                    };
                }
            }

            // ADD FILES TO WORKSPACE QUEUE
            async function addFiles(filesList) {
                let itemsAdded = 0;
                let filesFiltered = 0;

                for (let i = 0; i < filesList.length; i++) {
                    const file = filesList[i];
                    if (file.type !== "application/pdf" && !file.name.endsWith('.pdf')) {
                        filesFiltered++;
                        continue;
                    }

                    // Generate Unique Identifier
                    const fileId = "doc-" + Math.random().toString(36).substr(2, 9) + "-" + Date.now();
                    
                    // Show preliminary placeholder item inside list immediately for visual spring-responsiveness
                    createPlaceholderDOMItem(fileId, file.name);

                    // Read pages & metadata asynchronously
                    const metadata = await parsePDFMetadata(file);

                    // Update files in memory
                    const fileEntry = {
                        id: fileId,
                        file: file,
                        name: file.name,
                        size: file.size,
                        totalPages: metadata.pagesCount || "?",
                        isEncrypted: metadata.isEncrypted
                    };

                    // Replace placeholder item with real data & interactive card
                    replacePlaceholderWithRealCard(fileEntry);
                    filesInQueue.push(fileEntry);
                    itemsAdded++;
                }

                if (filesFiltered > 0) {
                    showToast(`Skipped ${filesFiltered} file(s) that were not PDF format.`, "error");
                }
                
                if (itemsAdded > 0) {
                    showToast(`Successfully added ${itemsAdded} document(s) to queue.`, "success");
                    // Change particle activity slightly
                    particles.forEach(p => p.speed = Math.random() * 1.5 + 0.5);
                }

                updateUIState();
            }

            // Dynamic placeholder setup for immediate responsive UI feedback
            function createPlaceholderDOMItem(id, filename) {
                elements.sortableList.classList.remove("hidden");
                elements.emptyState.classList.add("hidden");

                const item = document.createElement("div");
                item.id = id;
                item.dataset.id = id;
                item.className = "flex items-center justify-between p-4 bg-white/50 dark:bg-zinc-950/30 border border-slate-200/60 dark:border-zinc-900/60 rounded-xl glass-panel animate-fade-in-up duration-300 animate-pulse";
                item.innerHTML = `
                    <div class="flex items-center space-x-3 truncate">
                        <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-900 flex items-center justify-center">
                            <div class="w-4 h-4 bg-slate-200 dark:bg-zinc-800 rounded animate-ping"></div>
                        </div>
                        <div class="flex flex-col truncate max-w-md">
                            <span class="text-sm font-semibold text-slate-500 dark:text-zinc-400 truncate">${filename}</span>
                            <span class="text-[10px] text-slate-400 dark:text-zinc-600">Analyzing structure...</span>
                        </div>
                    </div>
                `;
                elements.sortableList.appendChild(item);
            }

            function replacePlaceholderWithRealCard(fileObj) {
                const placeholder = document.getElementById(fileObj.id);
                if (!placeholder) return;

                // Create clean, beautiful Premium card
                const item = document.createElement("div");
                item.id = fileObj.id;
                item.dataset.id = fileObj.id;
                item.className = "flex items-center justify-between p-4 bg-white dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-900/80 rounded-xl glass-panel spring-transition shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-800 group relative";
                
                item.innerHTML = `
                    <div class="flex items-center space-x-4 truncate pr-2">
                        <!-- Grab handle for sorting -->
                        <div class="drag-handle cursor-grab active:cursor-grabbing p-1 text-slate-300 dark:text-zinc-700 hover:text-slate-500 dark:hover:text-zinc-500 transition-colors duration-150">
                            <i data-lucide="grip-vertical" class="w-4.5 h-4.5"></i>
                        </div>

                        <!-- Mini Thumbnail Icon design -->
                        <div class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 flex flex-col items-center justify-center relative flex-shrink-0">
                            <i data-lucide="file-text" class="w-5 h-5 text-indigo-500 dark:text-indigo-400"></i>
                            <span class="absolute bottom-1 text-[8px] font-extrabold tracking-tight uppercase text-indigo-500 dark:text-indigo-400">${fileObj.totalPages} pgs</span>
                        </div>

                        <!-- Main Document Details -->
                        <div class="flex flex-col truncate">
                            <span class="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-200" title="${fileObj.name}">
                                ${fileObj.name}
                            </span>
                            <div class="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                                <span>${formatBytes(fileObj.size)}</span>
                                <span>•</span>
                                <span class="bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500 dark:text-zinc-400">Pages: ${fileObj.totalPages}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right Interaction Tray -->
                    <div class="flex items-center space-x-1">
                        <!-- Manual Reordering Buttons (for touch responsiveness) -->
                        <div class="flex flex-col sm:flex-row gap-0.5 sm:gap-1">
                            <button class="btn-move-up p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-300 dark:text-zinc-700 hover:text-slate-600 dark:hover:text-zinc-400 transition-all duration-150" title="Move Up">
                                <i data-lucide="chevron-up" class="w-4 h-4"></i>
                            </button>
                            <button class="btn-move-down p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-300 dark:text-zinc-700 hover:text-slate-600 dark:hover:text-zinc-400 transition-all duration-150" title="Move Down">
                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                            </button>
                        </div>
                        
                        <!-- Delete Card -->
                        <button class="btn-delete p-2 rounded-lg hover:bg-rose-500/10 text-slate-300 hover:text-rose-500 dark:text-zinc-700 dark:hover:text-rose-400 transition-all duration-200 ml-1" title="Remove File">
                            <i data-lucide="trash" class="w-4 h-4"></i>
                        </button>
                    </div>
                `;

                // Wire internal interactive handlers
                item.querySelector('.btn-delete').addEventListener('click', () => {
                    removeFileFromQueue(fileObj.id);
                });

                item.querySelector('.btn-move-up').addEventListener('click', () => {
                    moveFileItem(fileObj.id, -1);
                });

                item.querySelector('.btn-move-down').addEventListener('click', () => {
                    moveFileItem(fileObj.id, 1);
                });

                // Replace placeholder in DOM with animated transition
                placeholder.parentNode.replaceChild(item, placeholder);
                lucide.createIcons();
            }

            // Remove item from UI Queue with standard physics slide animation
            function removeFileFromQueue(fileId) {
                const itemDOM = document.getElementById(fileId);
                if (itemDOM) {
                    itemDOM.classList.add("scale-90", "opacity-0", "-translate-x-8");
                    setTimeout(() => {
                        itemDOM.remove();
                        filesInQueue = filesInQueue.filter(f => f.id !== fileId);
                        updateUIState();
                        showToast("Document deleted from workspace.", "info");
                    }, 300);
                }
            }

            // Sequential order modification fallback (Arrow controls)
            function moveFileItem(id, direction) {
                const index = filesInQueue.findIndex(f => f.id === id);
                if (index === -1) return;

                const targetIndex = index + direction;
                if (targetIndex < 0 || targetIndex >= filesInQueue.length) return;

                // Swap in memory array
                const temp = filesInQueue[index];
                filesInQueue[index] = filesInQueue[targetIndex];
                filesInQueue[targetIndex] = temp;

                // Re-sync layout
                syncDOMOrder();
                updateUIState();
            }

            // Sync visual order of DOM elements based on logical state order
            function syncDOMOrder() {
                const parent = elements.sortableList;
                parent.innerHTML = '';
                filesInQueue.forEach(fileObj => {
                    // Re-render each item
                    createPlaceholderDOMItem(fileObj.id, fileObj.name);
                    replacePlaceholderWithRealCard(fileObj);
                });
            }

            // Update Master state UI
            function updateUIState() {
                const totalFiles = filesInQueue.length;
                elements.queueCounter.textContent = `${totalFiles} PDF${totalFiles !== 1 ? 's' : ''}`;

                if (totalFiles > 0) {
                    elements.emptyState.classList.add("hidden");
                    elements.sortableList.classList.remove("hidden");
                    elements.mergeBtn.removeAttribute("disabled");
                    elements.clearAllBtn.classList.remove("hidden");
                } else {
                    elements.emptyState.classList.remove("hidden");
                    elements.sortableList.classList.add("hidden");
                    elements.mergeBtn.setAttribute("disabled", "true");
                    elements.clearAllBtn.classList.add("hidden");
                }
            }

            // USER INTERACTIVE EVENT LISTENERS (DRAG & DROP)
            const handleDragOver = (e) => {
                e.preventDefault();
                elements.dragOverlay.classList.remove("opacity-0", "pointer-events-none", "scale-95");
            };

            const handleDragLeave = (e) => {
                e.preventDefault();
                // Ensure dragleave only triggers when leaving complete screen window area
                if (e.relatedTarget === null || e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
                    elements.dragOverlay.classList.add("opacity-0", "pointer-events-none", "scale-95");
                }
            };

            const handleDrop = (e) => {
                e.preventDefault();
                elements.dragOverlay.classList.add("opacity-0", "pointer-events-none", "scale-95");
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    addFiles(e.dataTransfer.files);
                }
            };

            window.addEventListener("dragover", handleDragOver);
            window.addEventListener("dragleave", handleDragLeave);
            window.addEventListener("drop", handleDrop);

            // Button and picker bindings
            elements.dropZone.addEventListener("click", () => elements.fileInput.click());
            elements.fileInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) {
                    addFiles(e.target.files);
                }
            });

            elements.clearAllBtn.addEventListener("click", () => {
                filesInQueue = [];
                elements.sortableList.innerHTML = '';
                updateUIState();
                showToast("Workspace wiped clear.", "info");
                // Restore calm drift background speed
                particles.forEach(p => p.speed = Math.random() * 0.4 + 0.1);
            });

            // Toggle optimizing switch
            elements.toggleOptimization.addEventListener("click", () => {
                optimizedMerging = !optimizedMerging;
                const toggleBall = elements.toggleOptimization.firstElementChild;
                if (optimizedMerging) {
                    elements.toggleOptimization.classList.add("bg-indigo-500", "dark:bg-indigo-600");
                    elements.toggleOptimization.classList.remove("bg-slate-200", "dark:bg-zinc-800");
                    toggleBall.classList.add("translate-x-4");
                    showToast("Optimization engine active.", "info");
                } else {
                    elements.toggleOptimization.classList.remove("bg-indigo-500", "dark:bg-indigo-600");
                    elements.toggleOptimization.classList.add("bg-slate-200", "dark:bg-zinc-800");
                    toggleBall.classList.remove("translate-x-4");
                }
            });

            // CORE MERGING PIPELINE
            async function triggerPDFMerger() {
                if (filesInQueue.length === 0) return;

                // Reset UI & launch Assembly overlay
                elements.processingModal.classList.remove("hidden");
                updateProgress(0, "Reading system headers...");

                // Slow rotation initially
                elements.loadingProgressRing.style.strokeDashoffset = 213.6;

                try {
                    // Initialize clean Document object
                    const mergedPdf = await PDFLib.PDFDocument.create();
                    
                    // Staged dynamic updates
                    const stages = [
                        "Decompressing page layouts...",
                        "Assembling cross-references...",
                        "Consolidating shared assets...",
                        "Finalizing structural nodes..."
                    ];

                    let currentStageIndex = 0;
                    let totalPagesAdded = 0;

                    for (let i = 0; i < filesInQueue.length; i++) {
                        const fileObj = filesInQueue[i];
                        
                        // Update progress bar per file
                        const basePercent = Math.round((i / filesInQueue.length) * 80);
                        updateProgress(basePercent, `Synthesizing ${fileObj.name}...`);

                        const arrayBuffer = await fileObj.file.arrayBuffer();
                        
                        // Handle potential structural errors
                        let pdfDoc;
                        try {
                            pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { 
                                ignoreEncryption: true 
                            });
                        } catch(err) {
                            throw new Error(`File "${fileObj.name}" is corrupted or securely encrypted.`);
                        }

                        // Verify pages are accessible
                        const pageIndices = pdfDoc.getPageIndices();
                        const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
                        
                        copiedPages.forEach((page) => {
                            mergedPdf.addPage(page);
                            totalPagesAdded++;
                        });

                        // Rotate staging label descriptions nicely
                        if (i % 2 === 0 && currentStageIndex < stages.length) {
                            updateProgress(basePercent + 5, stages[currentStageIndex]);
                            currentStageIndex++;
                        }
                    }

                    // Progress to absolute completion sequence
                    updateProgress(90, "Writing binary structures...");

                    // Optional Meta data settings block to ensure compliance & standard
                    const customTitle = elements.outputFilename.value.trim() || "Merged_Binder";
                    mergedPdf.setTitle(customTitle);
                    mergedPdf.setProducer("DocuMerge Client Engine");
                    mergedPdf.setCreator("DocuMerge App");

                    // Save PDF document
                    const mergedPdfBytes = await mergedPdf.save();
                    
                    updateProgress(100, "Done! Dispatching to layout engine...");

                    // Create blob instance
                    activeMergedBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                    
                    // Cleanup previous resource pointer
                    if (activeMergedBlobUrl) {
                        URL.revokeObjectURL(activeMergedBlobUrl);
                    }
                    activeMergedBlobUrl = URL.createObjectURL(activeMergedBlob);

                    // Hydrate preview & launch interactive Success Board
                    setTimeout(() => {
                        elements.processingModal.classList.add("hidden");
                        launchPreviewBoard(customTitle, activeMergedBlob, totalPagesAdded);
                    }, 800);

                } catch (error) {
                    console.error("Assembly failed: ", error);
                    elements.processingModal.classList.add("hidden");
                    showToast(error.message || "An unexpected issue occurred while assembling.", "error");
                }
            }

            function updateProgress(percent, labelText) {
                // Circular Ring Calculations
                const maxOffset = 213.6; // Circumference
                const computedOffset = maxOffset - (percent / 100) * maxOffset;
                elements.loadingProgressRing.style.strokeDashoffset = computedOffset;

                // Progress Bar updates
                elements.processingProgressBar.style.width = `${percent}%`;
                elements.processingStateDesc.textContent = labelText;
            }

            // Launch Success Board, celebrating with beautiful Confetti blast
            function launchPreviewBoard(title, blob, totalPages) {
                elements.successDocTitle.textContent = `${title}.pdf`;
                elements.successDocMeta.textContent = `Size: ${formatBytes(blob.size)}`;
                elements.metaTotalPages.textContent = totalPages;
                elements.metaTotalFiles.textContent = filesInQueue.length;

                // Load object preview stream in iframe safely
                elements.pdfPreviewIframe.src = activeMergedBlobUrl;
                elements.pdfPreviewIframe.classList.remove("hidden");

                elements.previewModal.classList.remove("hidden");

                // Confetti blast directionals
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#a855f7', '#10b981', '#3b82f6']
                });
            }

            elements.mergeBtn.addEventListener("click", triggerPDFMerger);

            // Clean exit of Success Modal
            function closeSuccessModal() {
                elements.previewModal.classList.add("hidden");
                elements.pdfPreviewIframe.classList.add("hidden");
                elements.pdfPreviewIframe.src = '';
                if (activeMergedBlobUrl) {
                    URL.revokeObjectURL(activeMergedBlobUrl);
                    activeMergedBlobUrl = null;
                }
                activeMergedBlob = null;
            }

            elements.closePreviewBtn.addEventListener("click", closeSuccessModal);
            elements.doneBtn.addEventListener("click", () => {
                closeSuccessModal();
                // Flush workspace state completely for a fresh clean start
                elements.clearAllBtn.click();
            });

            // Handle direct client download trigger
            elements.downloadMergedBtn.addEventListener("click", () => {
                if (!activeMergedBlob) return;
                
                const link = document.createElement("a");
                link.href = URL.createObjectURL(activeMergedBlob);
                const customTitle = elements.outputFilename.value.trim() || "Merged_Binder";
                link.download = `${customTitle}.pdf`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Cleanup temporary pointer
                setTimeout(() => URL.revokeObjectURL(link.href), 100);
                showToast("File downloaded successfully!", "success");
            });


            // DUAL COLOR THEME MANAGEMENT SYSTEM
            function toggleTheme() {
                if (theme === "dark") {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.classList.add("light");
                    theme = "light";
                    elements.themeToggleIcon.setAttribute("data-lucide", "sun");
                } else {
                    document.documentElement.classList.remove("light");
                    document.documentElement.classList.add("dark");
                    theme = "dark";
                    elements.themeToggleIcon.setAttribute("data-lucide", "moon");
                }
                lucide.createIcons();
                showToast(`Switched to ${theme} aesthetic.`, "info");
            }

            elements.themeToggleBtn.addEventListener("click", toggleTheme);
        });
