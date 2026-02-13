import React from 'react';

const GlobalLoadingOverlay = ({ visible }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/35 backdrop-blur-[2px] flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg px-5 py-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                <span className="text-sm font-medium text-slate-700">Please wait...</span>
            </div>
        </div>
    );
};

export default GlobalLoadingOverlay;

