import { useEffect, useRef, useState } from 'react';
import { Box, Map as MapIcon, Minus, Plus } from 'lucide-react';
import mapboxgl, { type LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initializeRegions } from './mapUtils';
import type { CityProfile } from '@shared/api-types';
import { InfoCard } from '../components/InfoCard'

type MapProps = {
    accessToken?: string;
    onAuthRequired: () => void;
};

export default function Map({ accessToken, onAuthRequired }: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null); 
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [hasLoadedRegions, setHasLoadedRegions] = useState(false);
    const [selectedCity, setSelectedCity] = useState<CityProfile | null>(null);
    const [isThreeD, setIsThreeD] = useState(false);

    useEffect(() => {
        if (map.current) return;

        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibG9yaWttYWNodSIsImEiOiJjbHhxNnhxem4wNGxyMm1wazJxdzQwaHVoIn0';
        const bounds: LngLatBoundsLike = [
            [16.0, 38.0], // Southwest: Into the Adriatic Sea / Southern Italy
            [26.0, 46.5]  // Northeast: Deep into Romania / Western Bulgaria
        ];

        const mapInstance = new mapboxgl.Map({
            container: mapContainer.current!,
            style: 'mapbox://styles/lorik888/cmpollqqm000m01r2daeo91zf',
            center: [20.902977, 42.602636], // Qendra për Kosovë
            maxBounds: bounds,
            zoom: 7.7,
            minZoom: 6.5,   
            pitch: 0,
            bearing: 0,
            antialias: true
        });

        map.current = mapInstance;

        // Wait until the style structure is fully compiled into WebGL context
        mapInstance.on('load', () => {
            setIsMapLoaded(true);
        });

        
        return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
        };
    }, []);

    useEffect(() => {
        if (!isMapLoaded || !map.current || hasLoadedRegions) return;

        if (!accessToken) {
            return;
        }

        initializeRegions(map.current, setSelectedCity, accessToken)
            .then(() => setHasLoadedRegions(true))
            .catch(() => onAuthRequired());
    }, [accessToken, hasLoadedRegions, isMapLoaded, onAuthRequired]);

    const zoomIn = () => {
        map.current?.zoomIn({ duration: 250 });
    };

    const zoomOut = () => {
        map.current?.zoomOut({ duration: 250 });
    };

    const togglePerspective = () => {
        const nextIsThreeD = !isThreeD;
        setIsThreeD(nextIsThreeD);

        map.current?.easeTo({
            pitch: nextIsThreeD ? 62 : 0,
            bearing: nextIsThreeD ? -18 : 0,
            duration: 650
        });

        map.current?.setTerrain(nextIsThreeD ? 
            { source: 'mapbox://mapbox.mapbox-terrain-dem-v1', exaggeration: 2.5 } 
            : null
        );
    };

    return (
        <div className='fixed inset-0 z-0 bg-[#02090c]'>
        <div 
            ref={mapContainer} 
            className='w-full h-full'
        />
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_#02090c_85%,_#010507_100%)] mix-blend-multiply opacity-95' />
        <InfoCard 
            title={selectedCity?.name!}
            description={selectedCity?.description!}
        />
        <div className='absolute right-6 top-1/2 z-50 flex -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-cyan-500/25 bg-[#071116]/80 shadow-[0_0_24px_rgba(6,182,212,0.18)] backdrop-blur-xl'>
            <button
                type='button'
                onClick={zoomIn}
                disabled={!isMapLoaded}
                aria-label='Zoom in'
                title='Zoom in'
                className='grid h-11 w-11 place-items-center text-cyan-100 transition-colors hover:bg-cyan-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
            >
                <Plus size={20} strokeWidth={2.4} />
            </button>
            <div className='h-px bg-cyan-500/20' />
            <button
                type='button'
                onClick={zoomOut}
                disabled={!isMapLoaded}
                aria-label='Zoom out'
                title='Zoom out'
                className='grid h-11 w-11 place-items-center text-cyan-100 transition-colors hover:bg-cyan-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'
            >
                <Minus size={20} strokeWidth={2.4} />
            </button>
            <div className='h-px bg-cyan-500/20' />
            <button
                type='button'
                onClick={togglePerspective}
                disabled={!isMapLoaded}
                aria-label={isThreeD ? 'Switch to 2D map' : 'Switch to 3D map'}
                title={isThreeD ? 'Switch to 2D' : 'Switch to 3D'}
                aria-pressed={isThreeD}
                className='grid h-11 w-11 place-items-center text-cyan-100 transition-colors hover:bg-cyan-400/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 data-[active=true]:bg-cyan-400/20 data-[active=true]:text-white'
                data-active={isThreeD}
            >
                {isThreeD ? <MapIcon size={20} strokeWidth={2.2} /> : <Box size={20} strokeWidth={2.2} />}
            </button>
        </div>
        </div>
  );
}
