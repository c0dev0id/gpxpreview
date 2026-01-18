(function() {
    'use strict';

    // Diagnostic Bookmarklet for Motorradfreunde Filebase
    // Analyzes page structure and shows what selectors work

    // Create diagnostic overlay
    const overlay = document.createElement('div');
    overlay.id = 'filebase-diagnostic-overlay';
    overlay.innerHTML = `
        <style>
            #filebase-diagnostic-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.95);
                z-index: 999999;
                overflow-y: auto;
                color: #fff;
                font-family: monospace;
                font-size: 12px;
                padding: 20px;
            }
            .diag-header {
                background: #667eea;
                padding: 15px;
                margin-bottom: 20px;
                border-radius: 5px;
            }
            .diag-section {
                background: #1e1e1e;
                padding: 15px;
                margin-bottom: 15px;
                border-radius: 5px;
                border-left: 4px solid #667eea;
            }
            .diag-section h3 {
                color: #667eea;
                margin: 0 0 10px 0;
            }
            .diag-success { color: #51cf66; }
            .diag-error { color: #ff6b6b; }
            .diag-info { color: #74c0fc; }
            .diag-code {
                background: #000;
                padding: 10px;
                margin: 10px 0;
                border-radius: 3px;
                overflow-x: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .diag-close {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #e74c3c;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                z-index: 1000000;
            }
            .diag-close:hover {
                background: #c0392b;
            }
            .diag-element {
                background: #2a2a2a;
                padding: 10px;
                margin: 5px 0;
                border-radius: 3px;
                border-left: 3px solid #51cf66;
            }
            .diag-counter {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 2px 8px;
                border-radius: 3px;
                margin-right: 10px;
            }
        </style>
        <button class="diag-close" onclick="this.parentElement.remove()">✕ Schließen</button>
        <div class="diag-header">
            <h1>🔍 Motorradfreunde Filebase Diagnostik</h1>
            <p>Analysiert die Seitenstruktur und zeigt alle relevanten Informationen</p>
        </div>
        <div id="diag-content"></div>
    `;
    document.body.appendChild(overlay);

    const content = document.getElementById('diag-content');

    function addSection(title, html) {
        const section = document.createElement('div');
        section.className = 'diag-section';
        section.innerHTML = `<h3>${title}</h3>${html}`;
        content.appendChild(section);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getElementInfo(element) {
        const info = {
            tag: element.tagName.toLowerCase(),
            id: element.id,
            classes: Array.from(element.classList).join(' '),
            dataAttrs: {},
            text: element.textContent.trim().substring(0, 100)
        };

        // Get all data-* attributes
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
                info.dataAttrs[attr.name] = attr.value;
            }
        });

        return info;
    }

    // 1. Basic Page Info
    let html = `
        <div class="diag-info">
            <strong>URL:</strong> ${window.location.href}<br>
            <strong>Titel:</strong> ${document.title}
        </div>
    `;
    addSection('📄 Seiten-Information', html);

    // 2. Try common selectors
    const selectors = [
        '.filebaseFile',
        '.fileList .file',
        'article.file',
        '.contentItem',
        '[data-object-id][data-file-id]',
        'li.tabularListRow',
        '.file',
        'article',
        '[data-file-id]',
        '[data-object-id]',
        '.tabularListRow',
        '.contentItemList > li',
        '.messageList > li',
        'table.fileList tr',
        '.fileEntry'
    ];

    html = '<table style="width: 100%; color: white;">';
    html += '<tr><th>Selector</th><th>Anzahl Elemente</th></tr>';

    const selectorResults = [];
    selectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            const count = elements.length;
            selectorResults.push({ selector, count, elements });
            const color = count > 0 ? 'diag-success' : 'diag-error';
            html += `<tr class="${color}"><td>${escapeHtml(selector)}</td><td>${count}</td></tr>`;
        } catch (e) {
            html += `<tr class="diag-error"><td>${escapeHtml(selector)}</td><td>ERROR: ${e.message}</td></tr>`;
        }
    });
    html += '</table>';
    addSection('🎯 Selector-Tests', html);

    // 3. Find best selector and show sample elements
    const bestSelector = selectorResults.find(r => r.count > 0);
    if (bestSelector) {
        html = `<p class="diag-success">✅ Bester Selector: <strong>${escapeHtml(bestSelector.selector)}</strong> (${bestSelector.count} Elemente)</p>`;

        // Show first 5 elements
        html += '<h4>Erste 5 Elemente:</h4>';
        Array.from(bestSelector.elements).slice(0, 5).forEach((element, index) => {
            const info = getElementInfo(element);
            html += `
                <div class="diag-element">
                    <div><span class="diag-counter">${index + 1}</span><strong>${info.tag}</strong></div>
                    ${info.id ? `<div>ID: <code>${info.id}</code></div>` : ''}
                    ${info.classes ? `<div>Classes: <code>${info.classes}</code></div>` : ''}
                    ${Object.keys(info.dataAttrs).length > 0 ? `<div>Data Attributes: <code>${JSON.stringify(info.dataAttrs)}</code></div>` : ''}
                    <div>Text: <code>${escapeHtml(info.text)}${info.text.length >= 100 ? '...' : ''}</code></div>
                    <div class="diag-code">${escapeHtml(element.outerHTML.substring(0, 500))}${element.outerHTML.length > 500 ? '...' : ''}</div>
                </div>
            `;
        });
        addSection('📦 Erkannte Elemente', html);
    } else {
        addSection('⚠️ Keine Elemente gefunden', '<p class="diag-error">Keine der Standard-Selektoren hat Elemente gefunden!</p>');
    }

    // 4. Categories on the right side
    html = '';
    const categorySelectors = [
        '.sidebar .box',
        '.sidebar .widget',
        'aside .box',
        '#sidebarContent',
        '.boxesSidebarRight',
        '[data-box-identifier*="category"]',
        '[data-box-identifier*="filebase"]'
    ];

    html += '<h4>Suche nach Kategorien:</h4>';
    categorySelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                html += `<div class="diag-success">✅ ${escapeHtml(selector)}: ${elements.length} Elemente</div>`;
                elements.forEach((el, idx) => {
                    if (idx < 3) {
                        html += `<div class="diag-code">${escapeHtml(el.outerHTML.substring(0, 300))}...</div>`;
                    }
                });
            } else {
                html += `<div class="diag-error">❌ ${escapeHtml(selector)}: 0 Elemente</div>`;
            }
        } catch (e) {
            html += `<div class="diag-error">❌ ${escapeHtml(selector)}: ERROR</div>`;
        }
    });
    addSection('📁 Kategorien-Suche', html);

    // 5. All links containing "filebase"
    const filebaseLinks = Array.from(document.querySelectorAll('a[href*="filebase"]'));
    html = `<p class="diag-info">Gefunden: ${filebaseLinks.length} Links mit "filebase"</p>`;

    if (filebaseLinks.length > 0) {
        html += '<h4>Erste 20 Links:</h4>';
        filebaseLinks.slice(0, 20).forEach((link, idx) => {
            html += `
                <div class="diag-element">
                    <span class="diag-counter">${idx + 1}</span>
                    <strong>${escapeHtml(link.textContent.trim().substring(0, 80))}</strong><br>
                    URL: <code>${escapeHtml(link.href)}</code>
                </div>
            `;
        });
    }
    addSection('🔗 Filebase-Links', html);

    // 6. Page structure overview
    html = '<h4>HTML Body Struktur (erste 2 Ebenen):</h4>';
    html += '<div class="diag-code">';

    function getStructure(element, level = 0, maxLevel = 2) {
        if (level > maxLevel) return '';
        const indent = '  '.repeat(level);
        const tag = element.tagName ? element.tagName.toLowerCase() : 'text';
        const id = element.id ? `#${element.id}` : '';
        const classes = element.classList && element.classList.length > 0 ? `.${Array.from(element.classList).join('.')}` : '';
        const dataAttrs = element.dataset ? Object.keys(element.dataset).map(k => `data-${k}`).join(' ') : '';

        let result = `${indent}&lt;${tag}${id}${classes}${dataAttrs ? ' ' + dataAttrs : ''}&gt;\n`;

        if (level < maxLevel && element.children) {
            Array.from(element.children).slice(0, 10).forEach(child => {
                result += getStructure(child, level + 1, maxLevel);
            });
            if (element.children.length > 10) {
                result += `${indent}  ... (${element.children.length - 10} weitere Kinder)\n`;
            }
        }

        return result;
    }

    html += escapeHtml(getStructure(document.body));
    html += '</div>';
    addSection('🏗️ Seiten-Struktur', html);

    // 7. Forms and inputs (for file uploads or filters)
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input, select');
    html = `
        <p class="diag-info">Forms: ${forms.length}, Inputs/Selects: ${inputs.length}</p>
    `;

    if (forms.length > 0) {
        html += '<h4>Forms:</h4>';
        forms.forEach((form, idx) => {
            html += `
                <div class="diag-element">
                    Form ${idx + 1}: action="${escapeHtml(form.action || 'none')}", method="${form.method || 'get'}"
                </div>
            `;
        });
    }
    addSection('📝 Forms & Inputs', html);

    // 8. Pagination
    const paginationSelectors = [
        '.pagination',
        '.pageNavigation',
        'nav[role="navigation"]',
        '.woltlab-pagination',
        'ul.pagination'
    ];

    html = '<h4>Pagination-Elemente:</h4>';
    paginationSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            html += `<div class="diag-success">✅ ${escapeHtml(selector)}: ${elements.length}</div>`;
            elements.forEach(el => {
                html += `<div class="diag-code">${escapeHtml(el.outerHTML.substring(0, 400))}...</div>`;
            });
        } else {
            html += `<div class="diag-error">❌ ${escapeHtml(selector)}: 0</div>`;
        }
    });
    addSection('📄 Pagination', html);

    // 9. Summary with copy-to-clipboard
    html = `
        <div class="diag-success">
            <strong>Diagnose abgeschlossen!</strong><br><br>
            Bitte mache einen Screenshot dieser Seite oder kopiere die wichtigsten Informationen.
        </div>
    `;
    addSection('✅ Fertig', html);

    console.log('=== FILEBASE DIAGNOSTIC ===');
    console.log('Best selector:', bestSelector);
    console.log('Filebase links:', filebaseLinks.length);
    console.log('All selector results:', selectorResults);
})();
