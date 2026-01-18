define(["require", "exports", "tslib", "WoltLabSuite/Core/Ajax", "WoltLabSuite/Core/StringUtil", "WoltLabSuite/Core/Dom/Util", "WoltLabSuite/Core/Dom/Traverse", "WoltLabSuite/Core/Environment", "WoltLabSuite/Core/Ui/Dropdown/Simple", "WoltLabSuite/Core/Ui/CloseOverlay", "WoltLabSuite/Core/Language"], function (require, exports, tslib_1, Ajax, StringUtil, DomUtil, DomTraverse, Environment, Simple_1, CloseOverlay_1, Language) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    Ajax = tslib_1.__importStar(Ajax);
    StringUtil = tslib_1.__importStar(StringUtil);
    DomUtil = tslib_1.__importStar(DomUtil);
    DomTraverse = tslib_1.__importStar(DomTraverse);
    Environment = tslib_1.__importStar(Environment);
    Simple_1 = tslib_1.__importDefault(Simple_1);
    CloseOverlay_1 = tslib_1.__importDefault(CloseOverlay_1);
    Language = tslib_1.__importStar(Language);
    /**
     * Search
     */
    class Search {
        _url;
        _request = null;
        _loadedOnce = false;
        _resizeTimeout = null;
        _minLength = 2;
        _highlightURLs = false;
        _searchInput;
        _searchInputContainer;
        _searchParametersContainer;
        _pageHeaderSearchType;
        _menu;
        _lastValue = "";
        debounceTimer;
        searchParameters = {};
        searchObjectType = "everywhere";
        init(url, highlightURLs, alignment, showSearchTypes) {
            this._initializeURL(url);
            this._highlightURLs = highlightURLs === 1;
            this._setupSearchElements();
            this._setupMenu(alignment);
            this._setupEventListeners(showSearchTypes);
        }
        _initializeURL(url) {
            // @ts-ignore
            this._url = window.WSC_API_URL + url.substring(window.WCF_PATH.length);
        }
        _setupSearchElements() {
            this._searchInput = document.getElementById("pageHeaderSearchInput");
            this._searchInput.classList.add("dropdownToggle");
            this._searchInputContainer = document.getElementById("pageHeaderSearchInputContainer");
            this._searchInputContainer.classList.add("dropdown");
            this._searchParametersContainer = document.getElementById("pageHeaderSearchParameters");
            this._pageHeaderSearchType = document.querySelector(".pageHeaderSearchType");
            this._searchInputContainer.dataset.isOverlayDropdownButton = "1";
        }
        _setupMenu(alignment) {
            this._menu = document.createElement("div");
            this._menu.id = "dropdownMenuExtendedSearch";
            this._menu.className = "dropdownMenu";
            this._menu.innerHTML = '<div class="scrollableDropdownMenu">foo</div>';
            this._menu.dataset.dropdownAlignmentHorizontal = alignment;
            this._searchInput.insertAdjacentElement("afterend", this._menu);
        }
        _setupEventListeners(showSearchTypes) {
            if (showSearchTypes) {
                this.enableSearchTypes();
            }
            else {
                this.disableSearchTypes();
            }
            this._searchInput.addEventListener("keyup", this._keyup.bind(this), true);
            this._menu.addEventListener("click", this._handleMenuClick.bind(this), true);
            document.addEventListener("click", this._handleMobileSearchClick.bind(this), true);
            Environment.platform() === "desktop" && document.addEventListener("scroll", this._adjustDropdownOnScroll.bind(this));
            CloseOverlay_1.default.add("DarkwoodDesign/ExtendedSearch", this.close.bind(this));
            document.getElementById("userPanelSearchButton").addEventListener("click", this._toggleDropdown.bind(this));
            this._searchInput.addEventListener("click", this._preventDefaultActions.bind(this), true);
            window.addEventListener("resize", this._handleResize.bind(this));
        }
        _handleMenuClick(ev) {
            const target = ev.target;
            const link = target.closest(".extendedNotificationSearchLink");
            if (!link) {
                ev.stopPropagation();
                return;
            }
            const value = link.dataset.value;
            this._searchInput.value = value;
            this._searchInput.focus();
            const form = DomTraverse.parentByTag(this._searchInputContainer, "FORM");
            const parameters = new Map();
            Object.keys(this._getParameters(value)).forEach((key) => parameters.set(key, this._getParameters(value)[key]));
            const url = new URL(form.action);
            url.search += url.search !== "" ? "&" : "?";
            url.search += new URLSearchParams([["q", value.trim()], ...Array.from(parameters)]).toString();
            window.location.href = url.toString();
        }
        _handleMobileSearchClick(ev) {
            const target = ev.target;
            const button = target.closest('#pageHeaderSearchMobile[aria-expanded="true"]');
            if (!button)
                return;
            this.close();
        }
        _adjustDropdownOnScroll() {
            if (this._menu.classList.contains("extendedDropdownOpen")) {
                const dropdown = Simple_1.default.getDropdown("pageHeaderSearchInputContainer");
                if (dropdown) {
                    Simple_1.default.setAlignmentById("pageHeaderSearchInputContainer");
                }
            }
        }
        _toggleDropdown() {
            if (!Simple_1.default.isOpen("pageHeaderSearchInputContainer")) {
                this._searchInput.focus();
                const dropdown = Simple_1.default.getDropdown("pageHeaderSearchInputContainer");
                if (dropdown)
                    Simple_1.default.setAlignmentById("pageHeaderSearchInputContainer");
            }
            else {
                this.close();
            }
        }
        _preventDefaultActions(ev) {
            ev.preventDefault();
            ev.stopPropagation();
        }
        _handleResize() {
            if (this._resizeTimeout) {
                clearTimeout(this._resizeTimeout);
            }
            this._resizeTimeout = setTimeout(() => this._calculateOverlaySize(), 100);
        }
        /**
         * Close the search dropdown
         */
        close() {
            Simple_1.default.close("pageHeaderSearchInputContainer");
            this._menu.classList.remove("extendedDropdownOpen", "dropdownOpen");
        }
        /**
         * Init the new search type dropdown functionality
         */
        enableSearchTypes() {
            const searchType = document.querySelector(".pageHeaderSearchType");
            const dropdownMenu = Simple_1.default.getDropdownMenu(DomUtil.identify(searchType));
            dropdownMenu.addEventListener("click", (event) => {
                const link = event.target.closest("a[data-object-type]");
                if (!link)
                    return;
                const newSearchObjectType = link.dataset.objectType;
                if (newSearchObjectType && newSearchObjectType !== this.searchObjectType) {
                    this.searchObjectType = newSearchObjectType;
                    this.searchParameters = link.dataset.parameters ? JSON.parse(link.dataset.parameters) : {};
                    const value = this._getSearchValue();
                    if (value.length >= this._minLength) {
                        this._search(value);
                    }
                }
            });
            this.updateSearchTypeSelection(searchType);
        }
        /**
         * Aktualisiert die Auswahl basierend auf dem aktuellen Zustand ohne Click-Event zu triggern.
         */
        updateSearchTypeSelection(searchType) {
            const searchTypeLabel = searchType.querySelector(".pageHeaderSearchTypeLabel");
            const currentLink = Array.from(searchType.querySelectorAll("a[data-object-type]")).find((link) => link.textContent === searchTypeLabel.textContent);
            if (currentLink) {
                this.searchObjectType = currentLink.dataset.objectType;
                this.searchParameters = currentLink.dataset.parameters ? JSON.parse(currentLink.dataset.parameters) : {};
            }
        }
        /**
         * Hide the default search types dropdown
         */
        disableSearchTypes() {
            DomUtil.hide(this._pageHeaderSearchType);
            document.getElementById("pageHeaderSearch").classList.add("hideSearchTypes");
            this.searchObjectType = "everywhere";
        }
        /**
         *
         */
        _ajaxSetup() {
            return {
                url: this._url,
                silent: true,
            };
        }
        /**
         * Handles successful AJAX requests.
         * @param data
         */
        _ajaxSuccess(data) {
            this._menu.classList.remove("loadingOverlay");
            if (data.template.trim()) {
                this._menu.innerHTML = data.template;
                const regEx = new RegExp("(" + StringUtil.escapeRegExp(this._lastValue) + ")", "gi");
                this._highlightSearchKeyword(regEx);
                if (this._highlightURLs) {
                    this._appendHighlightKeyword();
                }
            }
            else {
                this._setEmptyResult();
            }
            this._loadedOnce = true;
            this._showDropdown();
            this._calculateOverlaySize();
        }
        /**
         *
         * @param event
         */
        _keyup(event) {
            // close list on escape
            if (event.key === "Escape") {
                this.close();
                return;
            }
            // align dropdown
            const dropdown = Simple_1.default.getDropdown("pageHeaderSearchInputContainer");
            if (dropdown) {
                Simple_1.default.setAlignmentById("pageHeaderSearchInputContainer");
            }
            if (event.key.length === 1 || event.key === "Backspace" || event.key === "Delete") {
                this.setValueAndSearch();
            }
        }
        /**
         * Set search value and trigger search
         */
        setValueAndSearch() {
            const value = this._getSearchValue();
            if (this._lastValue === value) {
                // The value has not changed, e.g. due to ignored spaces at the end
                return;
            }
            this._lastValue = value;
            if (value.length < this._minLength) {
                // Value below the required minimum
                return;
            }
            // Debouncing to reduce the number of search queries
            clearTimeout(this.debounceTimer);
            this.debounceTimer = window.setTimeout(() => {
                this._search(value);
            }, 300);
        }
        /**
         * Returns the search value
         */
        _getSearchValue() {
            return this._searchInput.value.trim();
        }
        /**
         * Queries the server with the provided search string.
         *
         * @param       {string}        value   search string
         * @protected
         */
        _search(value) {
            this._showLoadingScreen();
            if (this._request) {
                this._request.abortPrevious();
            }
            this._request = Ajax.api(this, this._getParameters(value));
        }
        /**
         * Show loading indicator
         */
        _showLoadingScreen() {
            if (this._loadedOnce) {
                this._menu.classList.add("loadingOverlay");
            }
        }
        /**
         * Returns additional AJAX parameters.
         *
         * @param       {string}        value   search string
         * @return      {object}        additional AJAX parameters
         * @protected
         */
        _getParameters(value) {
            return {
                searchString: value,
                searchParameters: this.searchParameters,
                searchType: this.searchObjectType,
            };
        }
        /**
         *
         */
        _calculateOverlaySize() {
            // max height style
            const rect = this._menu.getBoundingClientRect();
            // 10 more px for the user to see that the dropdown stops
            const height = window.innerHeight - rect.top - 10;
            this._menu.style.maxHeight = height + "px";
        }
        /**
         *
         * @param regEx
         */
        _highlightSearchKeyword(regEx) {
            const extendedNotificationLabel = this._menu.querySelectorAll(".extendedNotificationLabel");
            extendedNotificationLabel.forEach((label) => {
                let labelText = label.textContent;
                labelText = labelText.replace(regEx, '<span class="extendedSearchHighlightString">$1</span>');
                label.innerHTML = labelText;
            });
        }
        _appendHighlightKeyword() {
            const links = this._menu.querySelectorAll("a:not(.extendedNotificationSearchLink)");
            links.forEach((link) => {
                const url = new URL(link.href);
                url.searchParams.set("highlight", this._lastValue);
                link.href = url.toString();
            });
        }
        /**
         *
         */
        _setEmptyResult() {
            this._menu.innerHTML = '<div class="extendedNotificationNoResult">' + Language.get("wcf.extendedSearch.search.empty", { searchString: this._lastValue }) + "</div>";
        }
        /**
         *
         */
        _showDropdown() {
            this._menu.classList.add("extendedDropdownOpen", "dropdownOpen");
        }
    }
    let extendedSearch;
    function getExtendedSearch() {
        if (!extendedSearch) {
            extendedSearch = new Search();
        }
        return extendedSearch;
    }
    /**
     * Initializes the extended search
     */
    function init(url, highlightURLs, alignment, showSearchTypes) {
        getExtendedSearch().init(url, highlightURLs, alignment, showSearchTypes);
    }
    exports.init = init;
});
