(function() {
    'use strict';

    // Text-based diagnostic - outputs copyable text

    const results = [];

    function log(message) {
        results.push(message);
        console.log(message);
    }

    log('=== MOTORRADFREUNDE FILEBASE DIAGNOSTIC ===');
    log('Timestamp: ' + new Date().toISOString());
    log('URL: ' + window.location.href);
    log('');

    // 1. File cards
    log('--- FILE CARDS ---');
    const fileCards = document.querySelectorAll('.filebaseFile');
    log('Found: ' + fileCards.length + ' file cards with .filebaseFile selector');

    if (fileCards.length > 0) {
        log('');
        log('First file card HTML (first 1000 chars):');
        log(fileCards[0].outerHTML.substring(0, 1000));
        log('');
        log('First file card classes: ' + fileCards[0].className);
        log('First file card data-file-id: ' + fileCards[0].getAttribute('data-file-id'));
        log('');
    }

    // 2. Pagination
    log('--- PAGINATION ---');
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        log('Found .pagination element');
        log('Pagination HTML (first 2000 chars):');
        log(pagination.outerHTML.substring(0, 2000));
        log('');
    } else {
        log('NO .pagination element found!');
    }

    // Test all pagination selectors
    const paginationSelectors = [
        '.pagination',
        '.pagination__link',
        '.pagination a',
        '.pagination__list a',
        'nav[aria-label*="Seiten"] a'
    ];

    paginationSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        log(selector + ': ' + elements.length + ' elements');
        if (elements.length > 0 && elements.length < 50) {
            elements.forEach((el, idx) => {
                const href = el.getAttribute('href') || el.href || 'NO HREF';
                const text = el.textContent.trim();
                log('  [' + idx + '] text="' + text + '" href="' + href + '"');
            });
        }
    });
    log('');

    // 3. Extract page numbers from all links
    log('--- PAGE NUMBERS IN PAGINATION ---');
    const allLinks = document.querySelectorAll('.pagination a, .pagination__link');
    const pageNumbers = [];
    allLinks.forEach(link => {
        const href = link.getAttribute('href') || link.href || '';
        const match = href.match(/pageNo=(\d+)/);
        if (match) {
            pageNumbers.push(parseInt(match[1]));
        }
    });

    if (pageNumbers.length > 0) {
        log('Page numbers found in links: ' + pageNumbers.join(', '));
        log('Max page number: ' + Math.max(...pageNumbers));
        log('Min page number: ' + Math.min(...pageNumbers));
    } else {
        log('NO page numbers found in any pagination links!');
    }
    log('');

    // 4. Current page detection
    log('--- CURRENT PAGE DETECTION ---');
    const currentPageLink = document.querySelector('.pagination__link--current, .pagination .current, a[aria-current="page"]');
    if (currentPageLink) {
        log('Current page element found: ' + currentPageLink.textContent.trim());
        log('Current page HTML: ' + currentPageLink.outerHTML);
    } else {
        log('NO current page element found');
    }
    log('');

    // 5. Next page link
    log('--- NEXT PAGE LINK ---');
    const nextLink = document.querySelector('.pagination__link[aria-label*="chste"], a[rel="next"]');
    if (nextLink) {
        log('Next page link found');
        log('Next link text: ' + nextLink.textContent.trim());
        log('Next link href: ' + (nextLink.getAttribute('href') || nextLink.href));
    } else {
        log('NO next page link found');
    }
    log('');

    // 6. File metadata extraction test
    log('--- FILE METADATA EXTRACTION TEST ---');
    if (fileCards.length > 0) {
        const firstCard = fileCards[0];

        log('Testing metadata extraction on first file:');

        const title = firstCard.querySelector('.filebaseFileCardTitle a, .filebaseFileCardLink');
        log('Title element: ' + (title ? title.textContent.trim() : 'NOT FOUND'));
        log('Title href: ' + (title ? title.href : 'N/A'));

        const meta = firstCard.querySelector('.filebaseFileCardMeta');
        log('Meta element: ' + (meta ? 'FOUND' : 'NOT FOUND'));
        if (meta) {
            log('Meta HTML (first 500 chars): ' + meta.outerHTML.substring(0, 500));
        }

        const uploader = firstCard.querySelector('a[href*="/user/"]');
        log('Uploader link: ' + (uploader ? uploader.textContent.trim() : 'NOT FOUND'));

        const time = firstCard.querySelector('time');
        log('Time element: ' + (time ? time.getAttribute('datetime') : 'NOT FOUND'));

        const downloads = firstCard.querySelector('[title*="Downloads"]');
        log('Downloads element: ' + (downloads ? downloads.textContent.trim() : 'NOT FOUND'));
    }
    log('');

    // 7. Page 2 URL test
    log('--- SIMULATED PAGE 2 URL ---');
    const baseUrl = window.location.origin + '/filebase/';
    const page2Url = baseUrl + '?sortField=time&sortOrder=DESC&pageNo=2';
    log('Would try to fetch: ' + page2Url);
    log('');

    // 8. Summary
    log('--- SUMMARY ---');
    log('Total file cards found: ' + fileCards.length);
    log('Pagination element exists: ' + (pagination ? 'YES' : 'NO'));
    log('Max page from links: ' + (pageNumbers.length > 0 ? Math.max(...pageNumbers) : 'NOT DETECTED'));
    log('Current page: ' + (currentPageLink ? currentPageLink.textContent.trim() : 'UNKNOWN'));
    log('');
    log('=== END DIAGNOSTIC ===');

    // Create output window
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        right: 20px;
        bottom: 20px;
        background: white;
        z-index: 999999;
        padding: 20px;
        overflow: auto;
        border: 3px solid #667eea;
        box-shadow: 0 10px 50px rgba(0,0,0,0.5);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Schließen';
    closeBtn.style.cssText = `
        position: fixed;
        top: 30px;
        right: 30px;
        background: #e74c3c;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000000;
    `;
    closeBtn.onclick = () => overlay.remove();

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Text kopieren';
    copyBtn.style.cssText = `
        position: fixed;
        top: 30px;
        right: 150px;
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000000;
    `;
    copyBtn.onclick = () => {
        navigator.clipboard.writeText(results.join('\n')).then(() => {
            copyBtn.textContent = '✅ Kopiert!';
            setTimeout(() => {
                copyBtn.textContent = '📋 Text kopieren';
            }, 2000);
        });
    };

    const content = document.createElement('pre');
    content.style.cssText = `
        font-family: 'Courier New', monospace;
        font-size: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin-top: 60px;
    `;
    content.textContent = results.join('\n');

    overlay.appendChild(closeBtn);
    overlay.appendChild(copyBtn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    console.log('Diagnostic complete. Results displayed in overlay and logged to console.');
})();
