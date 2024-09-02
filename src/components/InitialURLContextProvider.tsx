import React, {createContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import {signInAfterTransitionFromOldDot} from '@libs/actions/Session';
import type {Route} from '@src/ROUTES';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialURLContext = createContext<Route | undefined>(undefined);

type InitialURLContextProviderProps = {
    /** URL passed to our top-level React Native component by HybridApp. Will always be undefined in "pure" NewDot builds. */
    url?: Route;

    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children, url}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState(url);
    const {setSplashScreenState} = useSplashScreenStateContext();

    useEffect(() => {
        if (url) {
            signInAfterTransitionFromOldDot(url, setSplashScreenState);
            setInitialURL(url);
            return;
        }
        Linking.getInitialURL().then((initURL) => {
            setInitialURL(initURL as Route);
        });
    }, [url]);
    return <InitialURLContext.Provider value={initialURL}>{children}</InitialURLContext.Provider>;
}

InitialURLContextProvider.displayName = 'InitialURLContextProvider';

export default InitialURLContextProvider;
export {InitialURLContext};
