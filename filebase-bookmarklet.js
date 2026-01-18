(function() {
    'use strict';

    // Bookmarklet: Motorradfreunde Filebase Downloader
    // Downloads entire filebase with metadata as SQLite database

    const CONFIG = {
        baseUrl: window.location.origin,
        sqlJsUrl: 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js',
        sqlJsWasmUrl: 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm'
    };

    // Check if already running
    if (window.filebaseDownloaderRunning) {
        alert('Filebase Downloader läuft bereits!');
        return;
    }
    window.filebaseDownloaderRunning = true;

    // Create UI overlay
    const overlay = document.createElement('div');
    overlay.id = 'filebase-downloader-overlay';
    overlay.innerHTML = `
        <style>
            #filebase-downloader-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            #filebase-downloader-box {
                background: #fff;
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            }
            #filebase-downloader-box h2 {
                margin: 0 0 20px 0;
                color: #333;
            }
            #filebase-downloader-box .progress-container {
                background: #f0f0f0;
                border-radius: 8px;
                height: 30px;
                overflow: hidden;
                margin: 20px 0;
                position: relative;
            }
            #filebase-downloader-box .progress-bar {
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                height: 100%;
                width: 0%;
                transition: width 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
            }
            #filebase-downloader-box .status {
                color: #666;
                margin: 10px 0;
                font-size: 14px;
            }
            #filebase-downloader-box .log {
                background: #1e1e1e;
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                padding: 15px;
                border-radius: 5px;
                max-height: 200px;
                overflow-y: auto;
                margin: 20px 0;
            }
            #filebase-downloader-box .log .error { color: #ff6b6b; }
            #filebase-downloader-box .log .success { color: #51cf66; }
            #filebase-downloader-box .log .info { color: #74c0fc; }
            #filebase-downloader-box button {
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                margin: 5px;
            }
            #filebase-downloader-box button:hover {
                background: #5568d3;
            }
            #filebase-downloader-box button.secondary {
                background: #e74c3c;
            }
            #filebase-downloader-box button.secondary:hover {
                background: #c0392b;
            }
            #filebase-downloader-box .stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin: 20px 0;
            }
            #filebase-downloader-box .stat-box {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            #filebase-downloader-box .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #667eea;
            }
            #filebase-downloader-box .stat-label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
            }
        </style>
        <div id="filebase-downloader-box">
            <h2>🏍️ Motorradfreunde Filebase Downloader</h2>
            <div class="status">Initialisiere...</div>
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar">0%</div>
            </div>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value" id="files-count">0</div>
                    <div class="stat-label">Dateien</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="pages-count">0</div>
                    <div class="stat-label">Seiten</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value" id="size-total">0 MB</div>
                    <div class="stat-label">Gesamt</div>
                </div>
            </div>
            <div class="log" id="log"></div>
            <div>
                <button id="btn-close" class="secondary">Abbrechen</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // UI helper functions
    function log(message, type = 'info') {
        const logEl = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        logEl.innerHTML += `<div class="${type}">[${timestamp}] ${message}</div>`;
        logEl.scrollTop = logEl.scrollHeight;
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    function updateStatus(message) {
        document.querySelector('.status').textContent = message;
    }

    function updateProgress(percent) {
        const bar = document.getElementById('progress-bar');
        bar.style.width = percent + '%';
        bar.textContent = Math.round(percent) + '%';
    }

    function updateStats(files, pages, size) {
        document.getElementById('files-count').textContent = files;
        document.getElementById('pages-count').textContent = pages;
        document.getElementById('size-total').textContent = (size / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function close() {
        overlay.remove();
        window.filebaseDownloaderRunning = false;
    }

    document.getElementById('btn-close').addEventListener('click', close);

    // Main downloader class
    class FilebaseDownloader {
        constructor() {
            this.files = [];
            this.totalSize = 0;
            this.SQL = null;
            this.db = null;
        }

        async init() {
            try {
                log('Lade SQL.js Bibliothek...', 'info');
                updateStatus('Lade SQL.js...');

                // Load SQL.js
                await this.loadSQLjs();

                log('SQL.js erfolgreich geladen', 'success');
                updateStatus('SQL.js geladen');

                // Initialize database
                this.initDatabase();

                log('Datenbank initialisiert', 'success');
                updateStatus('Datenbank bereit');

                // Start scraping
                await this.scrapeFilebase();

                // Export database
                await this.exportDatabase();

            } catch (error) {
                log(`Fehler: ${error.message}`, 'error');
                console.error(error);
                alert('Fehler beim Download der Filebase. Siehe Console für Details.');
            }
        }

        async loadSQLjs() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = CONFIG.sqlJsUrl;
                script.onload = async () => {
                    try {
                        const SQL = await initSqlJs({
                            locateFile: file => CONFIG.sqlJsWasmUrl
                        });
                        this.SQL = SQL;
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                script.onerror = () => reject(new Error('Konnte SQL.js nicht laden'));
                document.head.appendChild(script);
            });
        }

        initDatabase() {
            this.db = new this.SQL.Database();

            // Create tables
            this.db.run(`
                CREATE TABLE files (
                    id INTEGER PRIMARY KEY,
                    title TEXT NOT NULL,
                    filename TEXT,
                    description TEXT,
                    category TEXT,
                    upload_date TEXT,
                    uploader TEXT,
                    file_size INTEGER,
                    download_count INTEGER,
                    download_url TEXT,
                    page_url TEXT,
                    file_id INTEGER,
                    metadata TEXT
                );
            `);

            this.db.run(`
                CREATE TABLE categories (
                    id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    file_count INTEGER DEFAULT 0
                );
            `);

            this.db.run(`
                CREATE TABLE metadata (
                    key TEXT PRIMARY KEY,
                    value TEXT
                );
            `);

            // Insert metadata
            const stmt = this.db.prepare('INSERT INTO metadata (key, value) VALUES (?, ?)');
            stmt.run(['download_date', new Date().toISOString()]);
            stmt.run(['source', 'motorradfreunde-rheinneckar.de']);
            stmt.run(['tool', 'Filebase Bookmarklet Downloader']);
            stmt.free();

            log('Datenbank-Schema erstellt', 'success');
        }

        async scrapeFilebase() {
            log('Starte Filebase-Scan...', 'info');
            updateStatus('Scanne Filebase...');

            // Determine filebase URL
            const filebaseUrl = CONFIG.baseUrl + '/filebase/';

            let currentPage = 1;
            let hasMorePages = true;
            let totalFiles = 0;

            const categories = new Map();

            while (hasMorePages) {
                try {
                    log(`Lade Seite ${currentPage}...`, 'info');
                    updateStatus(`Lade Seite ${currentPage}...`);

                    const pageUrl = currentPage === 1
                        ? filebaseUrl
                        : `${filebaseUrl}?pageNo=${currentPage}`;

                    const html = await this.fetchPage(pageUrl);
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    // Extract files from this page
                    const filesOnPage = this.extractFiles(doc, pageUrl);

                    if (filesOnPage.length === 0) {
                        log(`Keine Dateien auf Seite ${currentPage} gefunden`, 'info');
                        hasMorePages = false;
                        break;
                    }

                    log(`${filesOnPage.length} Dateien auf Seite ${currentPage} gefunden`, 'success');

                    // Insert files into database
                    const stmt = this.db.prepare(`
                        INSERT INTO files (
                            title, filename, description, category, upload_date,
                            uploader, file_size, download_count, download_url,
                            page_url, file_id, metadata
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `);

                    filesOnPage.forEach(file => {
                        stmt.run([
                            file.title,
                            file.filename,
                            file.description,
                            file.category,
                            file.uploadDate,
                            file.uploader,
                            file.fileSize,
                            file.downloadCount,
                            file.downloadUrl,
                            file.pageUrl,
                            file.fileId,
                            JSON.stringify(file.metadata)
                        ]);

                        this.totalSize += file.fileSize || 0;

                        // Track categories
                        if (file.category) {
                            categories.set(file.category, (categories.get(file.category) || 0) + 1);
                        }
                    });

                    stmt.free();

                    totalFiles += filesOnPage.length;
                    this.files.push(...filesOnPage);

                    updateStats(totalFiles, currentPage, this.totalSize);
                    updateProgress((currentPage / (currentPage + 1)) * 90); // Reserve 10% for export

                    // Check for next page
                    const nextPageLink = doc.querySelector('.pagination .next, a[rel="next"]');
                    if (!nextPageLink || nextPageLink.classList.contains('disabled')) {
                        hasMorePages = false;
                    } else {
                        currentPage++;
                        // Small delay to avoid hammering the server
                        await this.sleep(500);
                    }

                } catch (error) {
                    log(`Fehler beim Laden von Seite ${currentPage}: ${error.message}`, 'error');
                    hasMorePages = false;
                }
            }

            // Insert categories
            const catStmt = this.db.prepare('INSERT INTO categories (name, file_count) VALUES (?, ?)');
            categories.forEach((count, name) => {
                catStmt.run([name, count]);
            });
            catStmt.free();

            log(`Scan abgeschlossen: ${totalFiles} Dateien gefunden`, 'success');
            updateStatus(`${totalFiles} Dateien gefunden`);
            updateProgress(90);
        }

        async fetchPage(url) {
            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.text();
        }

        extractFiles(doc, pageUrl) {
            const files = [];

            // Try multiple selectors for different WoltLab Filebase layouts
            const selectors = [
                '.filebaseFile',
                '.fileList .file',
                'article.file',
                '.contentItem',
                '[data-object-id][data-file-id]',
                'li.tabularListRow'
            ];

            let fileElements = [];
            for (const selector of selectors) {
                fileElements = doc.querySelectorAll(selector);
                if (fileElements.length > 0) {
                    log(`Verwende Selector: ${selector}`, 'info');
                    break;
                }
            }

            fileElements.forEach((element, index) => {
                try {
                    const file = this.parseFileElement(element, pageUrl);
                    if (file.title || file.filename) {
                        files.push(file);
                    }
                } catch (error) {
                    log(`Fehler beim Parsen von Element ${index}: ${error.message}`, 'error');
                }
            });

            // If no files found with standard selectors, try table rows
            if (files.length === 0) {
                const rows = doc.querySelectorAll('table tr, .tabularList tbody tr');
                rows.forEach((row, index) => {
                    try {
                        const file = this.parseTableRow(row, pageUrl);
                        if (file.title || file.filename) {
                            files.push(file);
                        }
                    } catch (error) {
                        // Silent fail for table parsing
                    }
                });
            }

            return files;
        }

        parseFileElement(element, pageUrl) {
            const file = {
                title: '',
                filename: '',
                description: '',
                category: '',
                uploadDate: '',
                uploader: '',
                fileSize: 0,
                downloadCount: 0,
                downloadUrl: '',
                pageUrl: pageUrl,
                fileId: null,
                metadata: {}
            };

            // Extract title
            const titleEl = element.querySelector('.fileTitle, .title, h3, .contentTitle, a.filename');
            if (titleEl) {
                file.title = titleEl.textContent.trim();
                const titleLink = titleEl.querySelector('a') || (titleEl.tagName === 'A' ? titleEl : null);
                if (titleLink) {
                    file.pageUrl = this.makeAbsoluteUrl(titleLink.href);
                }
            }

            // Extract filename
            const filenameEl = element.querySelector('.filename, .fileName');
            if (filenameEl) {
                file.filename = filenameEl.textContent.trim();
            }

            // Extract description
            const descEl = element.querySelector('.description, .fileDescription, .contentDescription');
            if (descEl) {
                file.description = descEl.textContent.trim();
            }

            // Extract category
            const categoryEl = element.querySelector('.category, .fileCategory, .badge');
            if (categoryEl) {
                file.category = categoryEl.textContent.trim();
            }

            // Extract uploader
            const uploaderEl = element.querySelector('.username, .uploader, .author');
            if (uploaderEl) {
                file.uploader = uploaderEl.textContent.trim();
            }

            // Extract date
            const dateEl = element.querySelector('time, .datetime, .uploadDate');
            if (dateEl) {
                file.uploadDate = dateEl.getAttribute('datetime') || dateEl.textContent.trim();
            }

            // Extract file size
            const sizeEl = element.querySelector('.fileSize, .size');
            if (sizeEl) {
                file.fileSize = this.parseFileSize(sizeEl.textContent.trim());
            }

            // Extract download count
            const dlCountEl = element.querySelector('.downloads, .downloadCount');
            if (dlCountEl) {
                file.downloadCount = parseInt(dlCountEl.textContent.replace(/\D/g, '')) || 0;
            }

            // Extract download URL
            const downloadLink = element.querySelector('a[href*="download"], a.downloadButton, .downloadButton a');
            if (downloadLink) {
                file.downloadUrl = this.makeAbsoluteUrl(downloadLink.href);
            }

            // Extract file ID from data attributes
            file.fileId = element.getAttribute('data-file-id') ||
                         element.getAttribute('data-object-id') ||
                         null;

            // Store additional metadata
            file.metadata = {
                hasPreview: !!element.querySelector('.preview, .thumbnail'),
                tags: Array.from(element.querySelectorAll('.tag, .label')).map(t => t.textContent.trim()),
                elementClass: element.className
            };

            return file;
        }

        parseTableRow(row, pageUrl) {
            const file = {
                title: '',
                filename: '',
                description: '',
                category: '',
                uploadDate: '',
                uploader: '',
                fileSize: 0,
                downloadCount: 0,
                downloadUrl: '',
                pageUrl: pageUrl,
                fileId: null,
                metadata: {}
            };

            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return file;

            // Try to extract from table structure
            cells.forEach((cell, index) => {
                const text = cell.textContent.trim();
                const link = cell.querySelector('a');

                if (index === 0 && link) {
                    file.title = text;
                    file.pageUrl = this.makeAbsoluteUrl(link.href);
                }

                if (cell.classList.contains('columnSize') || text.match(/\d+(\.\d+)?\s*(KB|MB|GB)/i)) {
                    file.fileSize = this.parseFileSize(text);
                }

                if (cell.classList.contains('columnDate') || cell.querySelector('time')) {
                    const timeEl = cell.querySelector('time');
                    file.uploadDate = timeEl ? (timeEl.getAttribute('datetime') || timeEl.textContent.trim()) : text;
                }

                if (cell.classList.contains('columnAuthor') || cell.classList.contains('columnUploader')) {
                    file.uploader = text;
                }

                if (link && link.href.includes('download')) {
                    file.downloadUrl = this.makeAbsoluteUrl(link.href);
                }
            });

            return file;
        }

        parseFileSize(sizeStr) {
            const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(KB|MB|GB|Bytes?)/i);
            if (!match) return 0;

            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();

            switch (unit) {
                case 'GB': return value * 1024 * 1024 * 1024;
                case 'MB': return value * 1024 * 1024;
                case 'KB': return value * 1024;
                default: return value;
            }
        }

        makeAbsoluteUrl(url) {
            if (!url) return '';
            if (url.startsWith('http')) return url;
            if (url.startsWith('//')) return 'https:' + url;
            if (url.startsWith('/')) return CONFIG.baseUrl + url;
            return url;
        }

        async exportDatabase() {
            log('Exportiere Datenbank...', 'info');
            updateStatus('Erstelle SQLite-Datei...');
            updateProgress(95);

            const data = this.db.export();
            const blob = new Blob([data], { type: 'application/x-sqlite3' });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `motorradfreunde-filebase-${timestamp}.sqlite`;

            this.downloadBlob(blob, filename);

            log(`Datenbank exportiert: ${filename}`, 'success');
            updateStatus('Download abgeschlossen!');
            updateProgress(100);

            // Show completion message
            setTimeout(() => {
                alert(`✅ Filebase erfolgreich heruntergeladen!\n\nDateien: ${this.files.length}\nGröße: ${(this.totalSize / (1024 * 1024)).toFixed(2)} MB\nDatei: ${filename}`);
            }, 500);
        }

        downloadBlob(blob, filename) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // Start the downloader
    log('Initialisiere Filebase Downloader...', 'info');
    const downloader = new FilebaseDownloader();
    downloader.init();

})();
