/**
 * Main Options Page
 * Belongs to LocalCDN (since 2020-02-26)
 * (Origin: Decentraleyes)
 *
 * @author      Thomas Rientjes
 * @since       2016-08-09
 *
 * @author      nobody
 * @since       2020-05-04
 *
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Options
 */

var options = {};

/**
 * Private Methods
 */

options._renderContents = function () {
    let translationComplete = true;

    document.body.setAttribute('dir', options._scriptDirection);
    translationComplete = helpers.insertI18nContentIntoDocument(document);

    options._determineOptionValues().then(options._determineLocalOptionValues).then(options._renderOptionsPanel);

    if (!translationComplete) {
        options._renderLocaleNotice();
    }

    if (BrowserType.CHROMIUM) {
        document.getElementById('html-filter-div').style.display = 'none';
        document.getElementById('block-google-fonts').style.display = 'none';
    }

    if (!chrome.browserAction.setIcon) {
        document.getElementById('icon-style-div').style.display = 'none';
    }
    options._renderInfoPanel();
    document.getElementById('label-version').textContent = helpers.formatVersion(chrome.runtime.getManifest().version);
};

options._renderOptionsPanel = function () {
    let whitelistedDomains, domainWhitelist, elements, htmlFilterDomains, domainHtmlFilter, googleFontsDomains, domainAllowedGoogleFonts;

    Object.assign(options._optionValues, { [Setting.INTERNAL_STATISTICS]: options._internalStatistics });

    whitelistedDomains = options._optionValues.whitelistedDomains;
    domainWhitelist = options._serializeWhitelistedDomains(whitelistedDomains);

    htmlFilterDomains = options._optionValues.domainsManipulateDOM;
    domainHtmlFilter = options._serializeWhitelistedDomains(htmlFilterDomains);

    googleFontsDomains = options._optionValues.allowedDomainsGoogleFonts;
    domainAllowedGoogleFonts = options._serializeWhitelistedDomains(googleFontsDomains);

    elements = options._optionElements;
    Object.assign(elements, { [Setting.INTERNAL_STATISTICS]: document.getElementById('checkbox-internal-statistics') });

    Object.assign(elements, { [Setting.SELECTED_ICON]: document.getElementsByName('selected-icon') });

    elements.showIconBadge.checked = options._optionValues.showIconBadge;
    elements.blockMissing.checked = options._optionValues.blockMissing;
    elements.disablePrefetch.checked = options._optionValues.disablePrefetch;
    elements.stripMetadata.checked = options._optionValues.stripMetadata;
    elements.hideReleaseNotes.checked = options._optionValues.hideReleaseNotes;
    elements.enableLogging.checked = options._optionValues.enableLogging;
    elements.whitelistedDomains.value = domainWhitelist;
    elements.domainsManipulateDOM.value = domainHtmlFilter;
    elements.negateHtmlFilterList.checked = options._optionValues.negateHtmlFilterList;
    elements.blockGoogleFonts.checked = options._optionValues.blockGoogleFonts;
    elements.internalStatistics.checked = options._optionValues.internalStatistics;
    elements.allowedDomainsGoogleFonts.value = domainAllowedGoogleFonts;
    elements.storageType = options._optionValues.storageType;

    options._registerOptionChangedEventListeners(elements);
    options._registerMiscellaneousEventListeners();

    if (options._optionValues.blockMissing === true) {
        options._renderBlockMissingNotice();
    }

    if (options._languageSupported === false) {
        options._renderLocaleNotice();
    }

    if (elements.blockGoogleFonts.checked) {
        document.getElementById('div-domains-whitelist-google-fonts').style.display = 'block';
    } else {
        document.getElementById('div-domains-whitelist-google-fonts').style.display = 'none';
    }

    if (elements.storageType === 'local') {
        document.getElementById('storage-type-local').checked = true;
    } else {
        document.getElementById('storage-type-sync').checked = true;
    }

    if (options._optionValues.selectedIcon === 'Default') {
        document.getElementById('icon-default').checked = true;
    } else if (options._optionValues.selectedIcon === 'Grey') {
        document.getElementById('icon-grey').checked = true;
    } else if (options._optionValues.selectedIcon === 'Light') {
        document.getElementById('icon-light').checked = true;
    }

    document.getElementById('last-mapping-update').textContent += ' ' + lastMappingUpdate;
    document.getElementById('negate-html-filter-list-warning').addEventListener('click', function () { options._onLinkClick(Links.CODEBERG_HTML_FILTER); });
    document.getElementById('link-welcome-page').addEventListener('click', function () { options._onLinkClick(Links.WELCOME); });
    document.getElementById('link-changelog').addEventListener('click', function () { options._onLinkClick(Links.CHANGELOG); });
    document.getElementById('link-donate').addEventListener('click', function () { options._onLinkClick(Links.DONATE); });
    document.getElementById('link-faq').addEventListener('click', function () { options._onLinkClick(Links.FAQ);});
    document.getElementById('ruleset-help').addEventListener('click', function () { options._onLinkClick(Links.CODEBERG_RULESET); });
    document.getElementById('sync-help').addEventListener('click', function () { options._onLinkClick(Links.FAQ + '#sync'); });
    document.getElementById('link-statistic').addEventListener('click', function () { options._onLinkClick(Links.STATISTICS); });

    document.getElementById('btn-general-tab').addEventListener('click', options._changeTab);
    document.getElementById('btn-advanced-tab').addEventListener('click', options._changeTab);
    document.getElementById('btn-export-import-tab').addEventListener('click', options._changeTab);
    document.getElementById('btn-info-tab').addEventListener('click', options._changeTab);

    document.getElementById('storage-type-local').addEventListener('change', options._onStorageOptionChanged);
    document.getElementById('storage-type-sync').addEventListener('change', options._onStorageOptionChanged);
    document.getElementById('export-data').addEventListener('click', storageManager.export);
    document.getElementById('import-data').addEventListener('click', storageManager.startImportFilePicker);
    document.getElementById('import-file-picker').addEventListener('change', storageManager.handleImportFilePicker);
};

options._renderBlockMissingNotice = function () {
    let blockMissingNoticeElement = document.getElementById('notice-block-missing');
    blockMissingNoticeElement.setAttribute('class', 'notice notice-warning');
};

options._hideBlockMissingNotice = function () {
    let blockMissingNoticeElement = document.getElementById('notice-block-missing');
    blockMissingNoticeElement.setAttribute('class', 'notice notice-warning hidden');
};

options._renderLocaleNotice = function () {
    let localeNoticeElement = document.getElementById('notice-locale');
    localeNoticeElement.setAttribute('class', 'notice notice-default');
};

options._registerOptionChangedEventListeners = function (elements) {
    elements.showIconBadge.addEventListener('change', options._onOptionChanged);
    elements.blockMissing.addEventListener('change', options._onOptionChanged);
    elements.disablePrefetch.addEventListener('change', options._onOptionChanged);
    elements.stripMetadata.addEventListener('change', options._onOptionChanged);
    elements.enableLogging.addEventListener('change', options._onOptionChanged);
    elements.hideReleaseNotes.addEventListener('change', options._onOptionChanged);
    elements.whitelistedDomains.addEventListener('keyup', options._onOptionChanged);
    elements.domainsManipulateDOM.addEventListener('keyup', options._onOptionChanged);
    elements.negateHtmlFilterList.addEventListener('change', options._onOptionChanged);
    elements.blockGoogleFonts.addEventListener('change', options._onOptionChanged);
    elements.selectedIcon[0].addEventListener('change', options._onOptionChanged);
    elements.selectedIcon[1].addEventListener('change', options._onOptionChanged);
    elements.selectedIcon[2].addEventListener('change', options._onOptionChanged);
    elements.ruleSets[0].addEventListener('change', ruleGenerator.openRuleSet);
    elements.ruleSets[1].addEventListener('change', ruleGenerator.openRuleSet);
    elements.copyRuleSet.addEventListener('click', ruleGenerator.copyRuleSet);
    elements.internalStatistics.addEventListener('change', options._onOptionChanged);
    elements.allowedDomainsGoogleFonts.addEventListener('keyup', options._onOptionChanged);
};

options._registerMiscellaneousEventListeners = function () {
    let blockMissingButtonElement = document.getElementById('button-block-missing');

    blockMissingButtonElement.addEventListener('click', function () {
        let changeEvent = new Event('change');

        options._optionElements.blockMissing.checked = false;
        options._optionElements.blockMissing.dispatchEvent(changeEvent);
    });
};

options._determineOptionValues = function () {
    return new Promise((resolve) => {
        let optionKeys = Object.keys(options._optionElements);

        storageManager.type.get(optionKeys, function (items) {
            options._optionValues = items;
            resolve();
        });
    });
};

options._determineLocalOptionValues = function () {
    return new Promise((resolve) => {
        chrome.storage.local.get([Setting.INTERNAL_STATISTICS, Setting.STORAGE_TYPE], function (items) {
            options._internalStatistics = items.internalStatistics;
            options._storageType = items.storageType;
            resolve();
        });
    });
};

options._getOptionElement = function (optionKey) {
    return document.querySelector(`[data-option=${optionKey}]`);
};

options._getOptionElements = function () {
    let optionElements = {
        [Setting.SHOW_ICON_BADGE]: options._getOptionElement(Setting.SHOW_ICON_BADGE),
        [Setting.BLOCK_MISSING]: options._getOptionElement(Setting.BLOCK_MISSING),
        [Setting.DISABLE_PREFETCH]: options._getOptionElement(Setting.DISABLE_PREFETCH),
        [Setting.STRIP_METADATA]: options._getOptionElement(Setting.STRIP_METADATA),
        [Setting.WHITELISTED_DOMAINS]: options._getOptionElement(Setting.WHITELISTED_DOMAINS),
        [Setting.HIDE_RELEASE_NOTES]: options._getOptionElement(Setting.HIDE_RELEASE_NOTES),
        [Setting.LOGGING]: options._getOptionElement(Setting.LOGGING),
        ['ruleSets']: document.getElementsByName('rule-sets'),
        ['copyRuleSet']: document.getElementById('button-copy-rule-set'),
        [Setting.NEGATE_HTML_FILTER_LIST]: options._getOptionElement(Setting.NEGATE_HTML_FILTER_LIST),
        [Setting.DOMAINS_MANIPULATE_DOM]: options._getOptionElement(Setting.DOMAINS_MANIPULATE_DOM),
        [Setting.BLOCK_GOOGLE_FONTS]: options._getOptionElement(Setting.BLOCK_GOOGLE_FONTS),
        [Setting.SELECTED_ICON]: options._getOptionElement(Setting.SELECTED_ICON),
        [Setting.ALLOWED_DOMAINS_GOOGLE_FONTS]: options._getOptionElement(Setting.ALLOWED_DOMAINS_GOOGLE_FONTS),
        [Setting.STORAGE_TYPE]: options._getOptionElement(Setting.STORAGE_TYPE)
    };
    return optionElements;
};

options._configureLinkPrefetching = function (value) {
    if (value === false) {
        // Restore default values of related preference values.
        chrome.privacy.network.networkPredictionEnabled.clear({});
    } else {
        chrome.privacy.network.networkPredictionEnabled.set({
            value: false,
        });
    }
};

options._serializeWhitelistedDomains = function (whitelistedDomains) {
    if (whitelistedDomains === undefined) return '';

    let domainWhitelist, whitelistedDomainKeys;

    whitelistedDomainKeys = Object.keys(whitelistedDomains);
    domainWhitelist = '';

    whitelistedDomainKeys.forEach(function (domain) {
        domainWhitelist = `${domainWhitelist}${domain};`;
    });

    domainWhitelist = domainWhitelist.slice(0, -1);
    domainWhitelist = domainWhitelist.replace(Whitelist.TRIM_EXPRESSION, '');

    return domainWhitelist;
};

options._parseDomainWhitelist = function (domainWhitelist) {
    let whitelistedDomains = {};

    domainWhitelist.split(Whitelist.VALUE_SEPARATOR).forEach(function (domain) {
        whitelistedDomains[helpers.normalizeDomain(domain)] = true;
    });

    return whitelistedDomains;
};

options._renderInfoPanel = function () {
    let unsupportedFrameworks, btnCDNs, btnFrameworks;

    unsupportedFrameworks = 0;
    options._listOfFrameworks = {};

    btnCDNs = document.getElementById('cdn');
    btnCDNs.value = 'CDNs: ';

    btnFrameworks = document.getElementById('framework');
    btnFrameworks.value = 'Frameworks: ';


    Object.values(Object.values(resources)).forEach((element) => {
        let path = Object.values(element)[0];
        path = path.split('/');
        options._listOfFrameworks[path[1]] = true;
    });

    if (BrowserType.CHROMIUM) {
        // Chromium based browser does not support Google Material Icons and Font Awesome
        document.getElementById('unsupported-frameworks').style.display = 'block';
        unsupportedFrameworks = 2;
    }

    options._createList('cdn');

    btnFrameworks.addEventListener('click', options._btnCreateList);
    btnCDNs.addEventListener('click', options._btnCreateList);

    // Reduce CDNs by 3, because loli.net includes = cdn.css.net, cdnjs.loli.net, ajax.loli.net, fonts.loli.net
    btnCDNs.value += Object.keys(mappings).length - 3;
    btnFrameworks.value += Object.keys(options._listOfFrameworks).length - unsupportedFrameworks;
};

options._btnCreateList = function ({ target }) {
    options._createList(target.id);
};

options._createList = function (type) {
    let textArea, list;

    textArea = document.getElementById('generated-list');
    textArea.value = '';

    if (type === 'cdn') {
        list = Object.keys(mappings);
    } else if (type === 'framework') {
        list = Object.keys(options._listOfFrameworks);
    } else {
        return;
    }

    list.forEach((elem) => {
        if (!(BrowserType.CHROMIUM && (elem === 'fontawesome' || elem === 'google-material-design-icons'))) {
            textArea.value += elem + '\n';
        }
    });
};

/**
 * Event Handlers
 */

options._onDocumentLoaded = function () {
    let language = navigator.language;

    options._optionElements = options._getOptionElements();
    options._languageSupported = helpers.languageIsFullySupported(language);
    options._scriptDirection = helpers.determineScriptDirection(language);

    options._renderContents();
};

options._onOptionChanged = function ({ target }) {
    let optionKey, optionType, optionValue;

    optionKey = target.getAttribute('data-option');
    optionType = target.getAttribute('type');

    if (optionType === 'checkbox') {
        optionValue = target.checked;
    } else {
        optionValue = target.value;
    }

    if (optionKey === Setting.BLOCK_MISSING) {
        if (optionValue === true) {
            options._renderBlockMissingNotice();
        } else {
            options._hideBlockMissingNotice();
        }
    }

    if (optionKey === Setting.DISABLE_PREFETCH) {
        options._configureLinkPrefetching(optionValue);
    }

    if (optionKey === Setting.WHITELISTED_DOMAINS || optionKey === Setting.DOMAINS_MANIPULATE_DOM || optionKey === Setting.ALLOWED_DOMAINS_GOOGLE_FONTS) {
        optionValue = options._parseDomainWhitelist(optionValue);
    }

    if (optionKey === Setting.BLOCK_GOOGLE_FONTS) {
        if (optionValue === true) {
            document.getElementById('div-domains-whitelist-google-fonts').style.display = 'block';
        } else {
            document.getElementById('div-domains-whitelist-google-fonts').style.display = 'none';
        }
    }

    if (optionKey === Setting.NEGATE_HTML_FILTER_LIST) {
        if (optionValue === true) {
            document.getElementById('html-filter-domains-title-include').style.display = 'none';
            document.getElementById('html-filter-domains-title-exclude').style.display = 'block';
        } else {
            document.getElementById('html-filter-domains-title-include').style.display = 'block';
            document.getElementById('html-filter-domains-title-exclude').style.display = 'none';
        }
    }

    if (optionKey === Setting.SELECTED_ICON) {
        wrappers.setIcon({ path: optionValue }, 'Enabled');
    }
    storageManager.type.set({
        [optionKey]: optionValue,
    });
};

options._onStorageOptionChanged = function ({ target }) {
    chrome.storage.local.set({
        [Setting.STORAGE_TYPE]: target.value,
    });
};

options._onLinkClick = function (url) {
    chrome.tabs.create({
        url: url,
        active: true
    });
};

options._changeTab = function ({ target }) {
    let tabContent, tabButton, optionKey;

    optionKey = target.getAttribute('data-option');
    tabContent = document.getElementsByClassName('tab-content');
    tabButton = document.getElementsByClassName('option-buttons');

    for (let i = 0; i < tabContent.length; i++) {
        if (tabContent[i].id === optionKey) {
            tabContent[i].style.display = 'block';
            tabButton[i].classList.add('option-buttons-active');
        } else {
            tabContent[i].style.display = 'none';
            tabButton[i].classList.remove('option-buttons-active');
        }
    }
};

/**
 *  Updates the domain lists if the options page has no focus.
 *  document.hasFocus() prevents problems with keyboard input.
 */
options._updatesDomainLists = function (changes) {
    let changedItems = Object.keys(changes);

    if (!document.hasFocus()) {
        if (changedItems[0] === 'whitelistedDomains') {
            document.getElementById('tf-domains-whitelist').value = options._serializeWhitelistedDomains(changes['whitelistedDomains'].newValue);
        } else if (changedItems[0] === 'domainsManipulateDOM') {
            document.getElementById('tf-domains-manipulate-dom').value = options._serializeWhitelistedDomains(changes['domainsManipulateDOM'].newValue);
        }
    } else {
        // document has the focus
    }
};

/**
 * Initializations
 */
options._internalStatistics = false;
options._storageType = 'local';
options._listOfFrameworks = {};
options._listOfCDNs = {};

document.addEventListener('DOMContentLoaded', options._onDocumentLoaded);

chrome.storage.onChanged.addListener(options._updatesDomainLists);
