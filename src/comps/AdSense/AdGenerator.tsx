import React, { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}


const AdSenseAd: React.FC = () => {
    useEffect(() => {
        // Push the adsbygoogle script to the window object when the component is mounted
        if (typeof window !== 'undefined') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, []);

    return (
        <div className='w-full h-full'>
            <ins className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center', minHeight: '100px' }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-8489684509599842"
                data-ad-slot="6317854779">

            </ins>
        </div>
    );
};

export default AdSenseAd;
