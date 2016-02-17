// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import AppDispatcher from '../dispatcher/app_dispatcher.jsx';
import EventEmitter from 'events';

import Constants from '../utils/constants.jsx';
const ActionTypes = Constants.ActionTypes;

import BrowserStore from '../stores/browser_store.jsx';

const CHANGE_EVENT = 'change';

class ErrorStoreClass extends EventEmitter {
    constructor() {
        super();

        this.emitChange = this.emitChange.bind(this);
        this.addChangeListener = this.addChangeListener.bind(this);
        this.removeChangeListener = this.removeChangeListener.bind(this);
        this.handledError = this.handledError.bind(this);
        this.getLastError = this.getLastError.bind(this);
        this.storeLastError = this.storeLastError.bind(this);
    }

    emitChange() {
        this.emit(CHANGE_EVENT);
    }

    addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
    }

    removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    }

    handledError() {
        BrowserStore.removeItem('last_error');
    }

    getLastError() {
        return BrowserStore.getItem('last_error');
    }

    storeLastError(error) {
        BrowserStore.setItem('last_error', error);
    }

    clearLastError() {
        BrowserStore.removeItem('last_error');
    }
}

var ErrorStore = new ErrorStoreClass();

ErrorStore.dispatchToken = AppDispatcher.register((payload) => {
    var action = payload.action;
    switch (action.type) {
    case ActionTypes.RECIEVED_ERROR:
        ErrorStore.storeLastError(action.err);
        ErrorStore.emitChange();
        break;

    default:
    }
});

export default ErrorStore;
window.ErrorStore = ErrorStore;
