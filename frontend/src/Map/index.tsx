import { useEffect, useRef, useState } from 'react';
import mapboxgl, { type LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initializeRegions } from './mapUtils';
import type { CityProfile } from '@shared/api-types';
import { InfoCard } from '../components/InfoCard'

export default function Map() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null); 
    const [selectedCity, setSelectedCity] = useState<CityProfile | null>(null);

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
        mapInstance.on('load', async () => {
            await initializeRegions(mapInstance, setSelectedCity);
        });

        
        return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
        };
    }, []);

    return (
        <div className='fixed inset-0 z-0 bg-[#02090c]'>
        <div 
            ref={mapContainer} 
            className='w-full h-full'
        />
        <InfoCard 
            title={selectedCity?.name!}
            description={selectedCity?.description!}
        />
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_#02090c_85%,_#010507_100%)] mix-blend-multiply opacity-95' />
        </div>
  );
}