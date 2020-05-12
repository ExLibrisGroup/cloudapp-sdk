import { pickBy } from 'lodash';
import { CloudAppMessages } from '../messages/messages';

export namespace CloudAppOutgoingEvents {

    const { getMessageBus, MessageNames } = CloudAppMessages;

    export function getInitData(messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        return messageBus.communicate({ name: MessageNames.INIT_DATA });
    }

    export function getPageMetadata(messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        return messageBus.communicate({ name: MessageNames.PAGE_METADATA });
    }

    export function getAuthToken(messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        return messageBus.communicate({ name: MessageNames.JWT_AUTH_TOKEN });
    }

    export function reloadPage(messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        return messageBus.communicate({ name: MessageNames.RELOAD_PAGE });
    }

    export function store(key: string, value?: any, messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        const payload = pickBy({ key, value }, v => typeof v !== 'undefined');
        return messageBus.communicate({ name: MessageNames.CLOUDAPP_STORE, payload });
    }

    export function settings(value?: string, messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        return messageBus.communicate({ name: MessageNames.SETTINGS, payload: value });
    }

    export function config(value?: string, messageBus: CloudAppMessages.MessageBus = getMessageBus()): Promise<any> {
        return messageBus.communicate({ name: MessageNames.CONFIG, payload: value });
    }
}

