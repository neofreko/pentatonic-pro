import React from 'react';

interface FretInlayProps {
    fret: number;
}

export const FretInlay: React.FC<FretInlayProps> = ({ fret }) => {
    const singleInlays = [3, 5, 7, 9, 15, 17, 19, 21];
    const doubleInlays = [12, 24];
    const markerClass = "w-3 h-3 bg-slate-700/20 rounded-full shadow-inner border border-white/5";

    if (singleInlays.includes(fret)) return <div className={markerClass} />;

    if (doubleInlays.includes(fret)) {
        return (
            <div className="flex flex-col gap-14">
                <div className={markerClass} />
                <div className={markerClass} />
            </div>
        );
    }

    return null;
};
