import uuid from 'uuid';
import { EventHandlingBase } from 'strongly-typed-events';

import { MessagePayload, CustomEventTarget, Message, MessageEventHandler as _MessageEventHandler, CustomMessageEvent } from './interfaces';
import { logOutgoing, logIncoming, debug, logTimeout } from './message-logger';

export namespace CloudAppMessages {

    const MESSAGE = 'message';
    const NAME_PREFIX = 'exl-cloudapp::';

    export enum MessageNames {
        INIT_DATA = 'INIT_DATA',
        PAGE_LOAD = 'PAGE_LOAD',
        PAGE_METADATA = 'PAGE_METADATA',
        CALL_REST_API = 'CALL_REST_API',
        ENTITY_SELECT = 'ENTITY_SELECT',
        RELOAD_PAGE = 'RELOAD_PAGE',
        CLOUDAPP_STORE = 'CLOUDAPP_STORE',
        SETTINGS = 'SETTINGS',
        CONFIG = 'CONFIG',
        JWT_AUTH_TOKEN = 'JWT_AUTH_TOKEN'
    }

    export interface MessageEventHandler extends _MessageEventHandler<MessageBus> { }

    export class MessageBus extends EventHandlingBase<MessageBus, MessagePayload> {

        private _started: boolean;
        private _timeout: number;
        private _names: Record<string, boolean> = {};

        private _attachEventFn: Function;
        private _detachEventFn: Function;

        private _listenTarget: CustomEventTarget;
        private _postTarget: CustomEventTarget;

        constructor(listenTarget: CustomEventTarget, postTarget: CustomEventTarget, timeout: number = 30000) {
            super();
            this._timeout = timeout;
            this._listenTarget = listenTarget;
            this._postTarget = postTarget;
            this._initListeners();
        }

        private _initListeners(): void {
            if (typeof this._listenTarget.addEventListener === 'function') {
                this._attachEventFn = this._listenTarget.addEventListener;
                this._detachEventFn = this._listenTarget.removeEventListener;
            } else if (typeof this._listenTarget.attachEvent === 'function') {
                this._attachEventFn = this._listenTarget.attachEvent;
                this._detachEventFn = this._listenTarget.detachEvent;
            } else {
                throw new Error('Invalid event target');
            }
        }

        public start(): void {
            if (!this._started) {
                this._attachEventFn.call(this._listenTarget, MESSAGE, this._handleMessage, false);
                this._started = true;
            }
        }

        public stop(): void {
            if (this._started) {
                this._detachEventFn.call(this._listenTarget, MESSAGE, this._handleMessage);
                this._clearAll();
            }
        }

        public subscribe(name, fn): void {
            super.subscribe(name, fn);
            debug(`New subscription to ${name}`);
        }
        
        public unsubscribe(name, fn): void {
            super.unsubscribe(name, fn);
            debug(`Unsubscribed from ${name}`);
        }

        public communicate(msg: Message): Promise<any> {
            return new Promise((resolve, reject) => {
                try {
                    return this._communicate(msg, (bus, data, mng) => resolve(data));
                } catch (e) {
                    reject(e);
                }
            });
        }

        private _communicate(msg: Message, responseHandler?: MessageEventHandler): void {
            if (responseHandler) {
                msg.id = uuid();
                const timeout = setTimeout(() => {
                    logTimeout(msg);
                    this._clearByMessage(msg);
                    throw new Error('Timed out while waiting for response');
                }, this._timeout);
                this.events.get(`${msg.name}__${msg.id}`).one((...args) => {
                    clearTimeout(timeout);
                    responseHandler(...args);
                });
            }
            this._signal(msg);
        }

        public signal(msg: Message): void {
            this._signal(msg);
        }

        private _signal(msg: Message): void {
            if (!msg.name.startsWith(NAME_PREFIX)) {
                msg.name = `${NAME_PREFIX}${msg.name}`;
            }
            msg.ts = Date.now();
            logOutgoing(msg);
            this._postTarget.postMessage(msg, '*');
        }

        private _handleMessage = (event: CustomMessageEvent): void => {
            if (!event.data) return;
            const msg = event.data;
            if (!msg) return;
            const name = this._getValidMessageName(msg);
            if (name) {
                logIncoming(msg);
                event.stopPropagation();
                event.stopImmediatePropagation();
                this.events.get(name).dispatch(this, msg.payload);
                this._clearByMessage(msg);
            }
        }

        private _getValidMessageName(msg: Message) {
            let suffix = msg.inReplyTo ? `__${msg.inReplyTo}` : '';
            return (msg.name || '').startsWith(NAME_PREFIX) ? `${msg.name.substr(NAME_PREFIX.length)}${suffix}` : undefined;
        }

        private _clearByMessage(msg: Message) {
            let name = this._getValidMessageName(msg);
            if (!name) name = msg.name;
            if (msg.inReplyTo) {
                this._clear(name);
            } else {
                this._names[name] = true;
            }
        }

        private _clearAll() {
            for (let name in this._names) {
                this._clear(name);
            }
        }

        private _clear(name: string) {
            this.events.get(name).clear();
            this.events.remove(name);
            if (this._names[name]) {
                delete this._names[name];
            }
            debug(`Cleared ${name}`);
        }

    }

    const messageBuses: Map<Object, MessageBus> = new Map();

    export function getMessageBus(et = window): MessageBus {
        let bus = messageBuses.get(et);
        if (!bus) {
            debug('No MessageBus found for event target, creating new.');
            bus = new MessageBus(et, et.parent);
            messageBuses.set(et, bus);
            bus.start();
        }
        return bus;
    }

}

