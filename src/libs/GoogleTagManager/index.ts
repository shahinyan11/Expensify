import Log from '@libs/Log';
import type {GoogleTagManagerEvent} from './types';

type WindowWithDataLayer = Window & {
    dataLayer: {
        push: (params: DataLayerPushParams) => void;
    };
};

type DataLayerPushParams = {
    event: GoogleTagManagerEvent;
    accountID: number;
};

declare const window: WindowWithDataLayer;

function publishEvent(event: GoogleTagManagerEvent, accountID: number) {
    window.dataLayer.push({event, accountID});
    Log.info('[GTM] event published', false, {event, accountID});
}

// eslint-disable-next-line import/prefer-default-export
export {publishEvent};
