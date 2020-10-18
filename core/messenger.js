/**
 * Messenger
 * Belongs to LocalCDN (since 2020-02-26)
 * (Origin: Decentraleyes)
 *
 * @author      Thomas Rientjes
 * @since       2018-05-28
 *
 * @author      nobody
 * @since       2020-02-26
 *
 * @license     MPL 2.0
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * Messenger
 */

var messenger = {};

/**
 * Private Methods
 */

messenger._handleMessageReceived = function (message, sender, sendResponse) {

    let topic, value;

    topic = message.topic;
    value = message.value;

    if (topic === 'tab:fetch-injections') {

        sendResponse({'value': stateManager.tabs[value].injections});
        return MessageResponse.SYNCHRONOUS;
    }

    if (topic === 'domain:fetch-is-allowlisted') {

        let allowlistRecord = requestAnalyzer.allowlistedDomains[value];
        sendResponse({'value': Boolean(allowlistRecord)});

        return MessageResponse.SYNCHRONOUS;
    }

    if (topic === 'allowlist:add-domain') {

        stateManager.addDomainToAllowlist(value).then(function () {
            sendResponse({'value': true});
        });

        return MessageResponse.ASYNCHRONOUS;
    }

    if (topic === 'allowlist:remove-domain') {

        stateManager.removeDomainFromAllowlist(value).then(function () {
            sendResponse({'value': true});
        });

        return MessageResponse.ASYNCHRONOUS;
    }

    if (topic === 'domain:fetch-is-manipulateDOM') {

        let manipulateDOMRecord = requestAnalyzer.domainsManipulateDOM[value];
        sendResponse({'value': Boolean(manipulateDOMRecord)});

        return MessageResponse.SYNCHRONOUS;
    }

    if (topic === 'manipulateDOM:add-domain') {

        stateManager.addDomainToManipulateDOMlist(value).then(function () {
            sendResponse({'value': true});
        });

        return MessageResponse.ASYNCHRONOUS;
    }

    if (topic === 'manipulateDOM:remove-domain') {

        stateManager.removeDomainFromManipulateDOMlist(value).then(function () {
            sendResponse({'value': true});
        });

        return MessageResponse.ASYNCHRONOUS;
    }
};

/**
 * Event Handlers
 */

chrome.runtime.onMessage.addListener(messenger._handleMessageReceived);
