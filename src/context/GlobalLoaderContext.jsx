import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import GlobalLoadingOverlay from '../components/Shared/GlobalLoadingOverlay';

const GlobalLoaderContext = createContext({
    showLoader: () => { },
    hideLoader: () => { },
    isLoading: false
});

const FETCH_PATCH_KEY = '__styleEaseFetchPatched';
const AXIOS_PATCH_KEY = '__styleEaseAxiosPatched';

export const GlobalLoaderProvider = ({ children }) => {
    const [pendingCount, setPendingCount] = useState(0);

    const showLoader = useCallback(() => {
        setPendingCount(prev => prev + 1);
    }, []);

    const hideLoader = useCallback(() => {
        setPendingCount(prev => Math.max(0, prev - 1));
    }, []);

    useEffect(() => {
        if (window[FETCH_PATCH_KEY]) return;
        window[FETCH_PATCH_KEY] = true;

        const originalFetch = window.fetch.bind(window);
        window.fetch = async (...args) => {
            showLoader();
            try {
                return await originalFetch(...args);
            } finally {
                hideLoader();
            }
        };
    }, [showLoader, hideLoader]);

    useEffect(() => {
        if (window[AXIOS_PATCH_KEY]) return;
        window[AXIOS_PATCH_KEY] = true;

        const requestId = axios.interceptors.request.use(
            (config) => {
                if (config?.skipGlobalLoader) return config;
                config.__withGlobalLoader = true;
                showLoader();
                return config;
            },
            (error) => {
                hideLoader();
                return Promise.reject(error);
            }
        );

        const responseId = axios.interceptors.response.use(
            (response) => {
                if (response?.config?.__withGlobalLoader) hideLoader();
                return response;
            },
            (error) => {
                hideLoader();
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestId);
            axios.interceptors.response.eject(responseId);
            window[AXIOS_PATCH_KEY] = false;
        };
    }, [showLoader, hideLoader]);

    const value = useMemo(() => ({
        showLoader,
        hideLoader,
        isLoading: pendingCount > 0
    }), [showLoader, hideLoader, pendingCount]);

    return (
        <GlobalLoaderContext.Provider value={value}>
            {children}
            <GlobalLoadingOverlay visible={pendingCount > 0} />
        </GlobalLoaderContext.Provider>
    );
};

export const useGlobalLoader = () => useContext(GlobalLoaderContext);

