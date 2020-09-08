/**
 * Storage Manager
 * Belongs to LocalCDN
 *
 * @author      nobody
 * @since       2020-08-28
 *
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Storage Manager
 */

var storageManager = {};

/**
 * Public Methods
 */

storageManager.checkStorageType = function () {
    chrome.storage.local.get([Setting.STORAGE_TYPE], function (items) {
        if (items.storageType === 'sync') {
            storageManager.type = chrome.storage.sync;
        } else {
            storageManager.type = chrome.storage.local;
        }
    });
};

storageManager.migrateData = function (target) {
    let storageSource, storageDestination;

    if (target === 'local') {
        storageSource = chrome.storage.sync;
        storageDestination = chrome.storage.local;
    } else if (target === 'sync') {
        storageSource = chrome.storage.local;
        storageDestination = chrome.storage.sync;
    } else {
        return;
    }

    storageSource.get(null, function (data) {
        chrome.storage.local.set({
            [Setting.AMOUNT_INJECTED]: data.amountInjected,
            [Setting.INTERNAL_STATISTICS]: data.internalStatistics,
            [Setting.INTERNAL_STATISTICS_DATA]: data.internalStatisticsData,
            [Setting.STORAGE_TYPE]: target
        });
        storageDestination.set({
            [Setting.ALLOWED_DOMAINS_GOOGLE_FONTS]: data.allowedDomainsGoogleFonts,
            [Setting.BLOCK_GOOGLE_FONTS]: data.blockGoogleFonts,
            [Setting.BLOCK_MISSING]: data.blockMissing,
            [Setting.DISABLE_PREFETCH]: data.disablePrefetch,
            [Setting.DOMAINS_MANIPULATE_DOM]: data.domainsManipulateDOM,
            [Setting.LOGGING]: data.logging,
            [Setting.ENFORCE_STAGING]: data.enforceStaging,
            [Setting.HIDE_RELEASE_NOTES]: data.hideReleaseNotes,
            [Setting.LAST_MAPPING_UPDATE]: data.lastMappingUpdate,
            [Setting.NEGATE_HTML_FILTER_LIST]: data.negateHtmlFilterList,
            [Setting.SELECTED_ICON]: data.selectedIcon,
            [Setting.SHOW_ICON_BADGE]: data.showIconBadge,
            [Setting.STRIP_METADATA]: data.stripMetadata,
            [Setting.WHITELISTED_DOMAINS]: data.whitelistedDomains,
            [Setting.XHR_TEST_DOMAIN]: data.xhrTestDomain
        });
    });
};

storageManager.export = function () {
    let filename = new Date().toISOString();
    filename = filename.substring(0, 10) + '_localcdn_backup.txt';

    storageManager.type.get(null, function (items) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, '  ')));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
};

storageManager.startImportFilePicker = function () {
    const input = document.getElementById('import-file-picker');
    input.value = '';
    input.click();
};

storageManager.handleImportFilePicker = async function () {
    try {
        let file = document.getElementById('import-file-picker').files[0];
        let content = await storageManager._readFileAsync(file);
        storageManager._validation(JSON.parse(content));
    } catch (err) {
        console.error('[ LocalCDN ] ' + err);
    }
};

/**
 * Private Methods
 */

storageManager._handleStorageChanged = function (type) {
    if (Setting.STORAGE_TYPE in type) {
        if (type.storageType.newValue === 'sync') {
            storageManager.type = chrome.storage.sync;
        } else {
            storageManager.type = chrome.storage.local;
        }
    }
};

storageManager._readFileAsync = function (file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

storageManager._validation = function (content) {
    let imported = {};
    for (const [key, value] of Object.entries(SettingDefaults)) {
        // If type the same as default settings
        if (typeof value === typeof content[key]) {
            if (typeof value === 'object' || value instanceof Object) {
                imported[key] = storageManager._validateDomainsAndStatistics(key, content[key]);
            } else if (typeof value === 'string' || value instanceof String) {
                imported[key] = storageManager._validateStrings(content[key]);
            } else if (typeof value === 'number' || value instanceof Number) {
                imported[key] = storageManager._validateNumbers(content[key]);
            } else if (typeof value === 'boolean' || value instanceof Boolean) {
                imported[key] = content[key];
            }
        } else if (content[key] === undefined) {
            // Set default if not existing in file
            imported[key] = value;
        } else {
            alert(chrome.i18n.getMessage('dialogImportFailed'));
            throw 'Invalid file!';
        }
    }

    // set values directly
    wrappers.setIcon({ path: imported['selectedIcon'] }, 'Enabled');
    storageManager.amountInjected = imported['amountInjected'];
    storageManager.statistics = imported['internalStatisticsData'];

    storageManager.type.set(imported);

    alert(chrome.i18n.getMessage('dialogImportSuccessful'));
};

storageManager._validateDomainsAndStatistics = function (type, obj) {
    let valid = {};
    if (type === 'allowedDomainsGoogleFonts' || type === 'domainsManipulateDOM' || type === 'whitelistedDomains') {
        for (const [key, value] of Object.entries(obj)) {
            if ((/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,24}/.test(key) || key === '') && value === true) {
                valid[key] = value;
            } else {
                alert(chrome.i18n.getMessage('dialogImportFailed') + ': ' + key);
                throw 'Invalid file!';
            }
        }
    } else if (type === 'internalStatisticsData') {
        let statistics = {};
        for (const [date, values] of Object.entries(obj)) {
            if (/((2[0-9])[0-9]{2})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/.test(date)) {
                for (const [types, category] of Object.entries(values)) {
                    if (types === 'frameworks') {
                        let frameworks = {};
                        for (const [name, counter] of Object.entries(category)) {
                            if (/resources\/[0-9a-z.-]+\/((?:\d{1,2}\.){1,3}\d{1,2})?.*\.(css|jsm)/.test(name) && counter > 0 && counter < Number.MAX_VALUE) {
                                frameworks[name] = counter;
                            } else {
                                alert(chrome.i18n.getMessage('dialogImportFailed') + ': ' + name);
                                throw 'Invalid file!';
                            }
                        }
                        statistics[date] = frameworks;
                    } else if (types === 'cdns') {
                        let cdns = {};
                        for (const [name, counter] of Object.entries(category)) {
                            if (/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,24}/.test(name) && counter > 0 && counter < Number.MAX_VALUE) {
                                cdns[name] = counter;
                            } else {
                                alert(chrome.i18n.getMessage('dialogImportFailed') + ': ' + name);
                                throw 'Invalid file!';
                            }
                        }
                        statistics[date] = cdns;
                    } else {
                        alert(chrome.i18n.getMessage('dialogImportFailed') + ': ' + type);
                        throw 'Invalid file!';
                    }
                }
            } else {
                alert(chrome.i18n.getMessage('dialogImportFailed') + ': ' + date);
                throw 'Invalid file!';
            }
        }
        valid = statistics;
    } else {
        alert(chrome.i18n.getMessage('dialogImportFailed') + ': ' + type);
        throw 'Invalid file!';
    }
    return valid;
};

storageManager._validateStrings = function (value) {
    if (/((2[0-9])[0-9]{2})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/.test(value)) {
        return value;
    } else if (value === 'Default' || value === 'Light' || value === 'Grey') {
        return value;
    } else if (value === 'local' || value === 'sync') {
        return value;
    } else if (value === 'decentraleyes.org' || value === 'localcdn.org') {
        return 'localcdn.org';
    } else {
        return '';
    }
};

storageManager._validateNumbers = function (value) {
    return value > 0 && value < Number.MAX_VALUE ? value : 0;
};

storageManager.data = {};
storageManager.type = chrome.storage.local;
storageManager.amountInjected = 0;
storageManager.statistics = {};

chrome.storage.onChanged.addListener(storageManager._handleStorageChanged);
