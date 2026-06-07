import { useEffect, useRef, useState } from 'react';
import { Box, Map as MapIcon, Minus, Plus } from 'lucide-react';
import mapboxgl, { type LngLatBoundsLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { initializeRegions } from './mapUtils';
import type { CityProfile } from '@shared/api-types';
import type { WeatherCurrent } from '@shared/api-types/weather';
import { InfoCard } from '../components/InfoCard'
import { apiFetch, getStoredSession } from '../auth/authClient';
import { connectTrafficStream, fetchTrafficSensors, removeTrafficSensors, renderTrafficSensors } from './traffic';

type MapProps = {
    accessToken?: string;
    onAuthRequired: () => void;
};

type TrafficStatus = 'idle' | 'loading' | 'live' | 'empty' | 'error';

function isPrizren(city: CityProfile | null): city is CityProfile {
    return city?.name?.trim().toLowerCase() === 'prizren';
}

export default function Map({ accessToken, onAuthRequired }: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null); 
    const isThreeDRef = useRef(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [hasLoadedRegions, setHasLoadedRegions] = useState(false);
    const [selectedCity, setSelectedCity] = useState<CityProfile | null>(null);
    const [selectedWeather, setSelectedWeather] = useState<WeatherCurrent | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState<string | null>(null);
    const [trafficStatus, setTrafficStatus] = useState<TrafficStatus>('idle');
    const [trafficSensorCount, setTrafficSensorCount] = useState(0);
    const [trafficUpdatedAt, setTrafficUpdatedAt] = useState<string | null>(null);
    const [trafficError, setTrafficError] = useState<string | null>(null);
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

        initializeRegions(map.current, setSelectedCity, () => isThreeDRef.current)
            .then(() => setHasLoadedRegions(true))
            .catch(() => onAuthRequired());
    }, [accessToken, hasLoadedRegions, isMapLoaded, onAuthRequired]);

    useEffect(() => {
        if (!selectedCity || !accessToken) {
            setSelectedWeather(null);
            setWeatherError(null);
            setIsWeatherLoading(false);
            return;
        }

        const controller = new AbortController();
        const lat = Number(selectedCity.lat);
        const lng = Number(selectedCity.lng);

        setIsWeatherLoading(true);
        setWeatherError(null);

        apiFetch<WeatherCurrent>(`/weather/current?lat=${lat}&lng=${lng}`, {
            method: 'GET',
            signal: controller.signal,
        })
            .then(setSelectedWeather)
            .catch((error: Error) => {
                if (error.name === 'AbortError') return;
                setSelectedWeather(null);
                setWeatherError(error.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsWeatherLoading(false);
                }
            });

        return () => controller.abort();
    }, [accessToken, selectedCity]);

    useEffect(() => {
        if (!isMapLoaded || !map.current || !accessToken || !isPrizren(selectedCity)) {
            if (map.current) {
                removeTrafficSensors(map.current);
            }
            setTrafficStatus('idle');
            setTrafficSensorCount(0);
            setTrafficUpdatedAt(null);
            setTrafficError(null);
            return;
        }

        const trafficCity = selectedCity;
        let isActive = true;
        let trafficStream: EventSource | null = null;

        setTrafficStatus('loading');
        setTrafficSensorCount(0);
        setTrafficUpdatedAt(null);
        setTrafficError(null);

        fetchTrafficSensors(trafficCity.id)
            .then((sensors) => {
                if (!isActive || !map.current) return;

                setTrafficSensorCount(sensors.length);

                if (sensors.length === 0) {
                    removeTrafficSensors(map.current);
                    setTrafficStatus('empty');
                    return;
                }

                renderTrafficSensors(map.current, sensors);
                const streamAccessToken = getStoredSession()?.accessToken ?? accessToken;
                trafficStream = connectTrafficStream(
                    trafficCity.id,
                    streamAccessToken,
                    (readings) => {
                        if (isActive && map.current) {
                            renderTrafficSensors(map.current, sensors, readings);
                            setTrafficStatus('live');
                            setTrafficUpdatedAt(new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                            }));
                        }
                    },
                    () => {
                        trafficStream?.close();
                        if (isActive) {
                            setTrafficStatus('error');
                            setTrafficError('Live traffic stream disconnected.');
                        }
                    }
                );
            })
            .catch((error: Error) => {
                console.error(error.message);
                if (isActive) {
                    setTrafficStatus('error');
                    setTrafficError(error.message);
                }
            });

        return () => {
            isActive = false;
            trafficStream?.close();
            if (map.current) {
                removeTrafficSensors(map.current);
            }
        };
    }, [accessToken, isMapLoaded, selectedCity]);

    const zoomIn = () => {
        map.current?.zoomIn({ duration: 250 });
    };

    const zoomOut = () => {
        map.current?.zoomOut({ duration: 250 });
    };

    const togglePerspective = () => {
        const nextIsThreeD = !isThreeD;
        setIsThreeD(nextIsThreeD);
        isThreeDRef.current = nextIsThreeD;

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
            pictureUrl={selectedCity?.imageUrl ?? undefined}
            title={selectedCity?.name}
            description={selectedCity?.description}
            weather={selectedWeather}
            isWeatherLoading={isWeatherLoading}
            weatherError={weatherError}
        />
        {isPrizren(selectedCity) && (
            <div className='absolute bottom-6 right-6 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-cyan-500/25 bg-[#071116]/88 p-4 text-sm text-cyan-50 shadow-[0_0_24px_rgba(6,182,212,0.18)] backdrop-blur-xl'>
                <div className='mb-3 flex items-center justify-between gap-4'>
                    <div>
                        <div className='text-xs font-semibold uppercase tracking-wide text-cyan-200'>Traffic Sensors</div>
                        <div className='text-lg font-bold text-white'>
                            {trafficStatus === 'loading' && 'Loading live data'}
                            {trafficStatus === 'live' && `${trafficSensorCount} sensors live`}
                            {trafficStatus === 'empty' && 'No sensors found'}
                            {trafficStatus === 'error' && 'Traffic unavailable'}
                            {trafficStatus === 'idle' && 'Waiting for Prizren'}
                        </div>
                    </div>
                    {trafficUpdatedAt && (
                        <div className='shrink-0 text-right text-xs text-cyan-100/80'>
                            Updated<br />
                            <span className='font-semibold text-cyan-50'>{trafficUpdatedAt}</span>
                        </div>
                    )}
                </div>
                {trafficStatus === 'empty' && (
                    <p className='mb-3 text-xs leading-relaxed text-amber-100'>
                        The traffic layer is integrated, but the database returned 0 sensors for Prizren. Run migration V6 to seed them.
                    </p>
                )}
                {trafficError && (
                    <p className='mb-3 text-xs leading-relaxed text-rose-100'>{trafficError}</p>
                )}
                <div className='grid grid-cols-3 gap-2 text-xs'>
                    <div className='flex items-center gap-2 rounded border border-white/10 bg-white/5 px-2 py-1.5'>
                        <span className='h-2.5 w-2.5 rounded-full bg-[#22c55e]' />
                        <span>Low</span>
                    </div>
                    <div className='flex items-center gap-2 rounded border border-white/10 bg-white/5 px-2 py-1.5'>
                        <span className='h-2.5 w-2.5 rounded-full bg-[#facc15]' />
                        <span>Medium</span>
                    </div>
                    <div className='flex items-center gap-2 rounded border border-white/10 bg-white/5 px-2 py-1.5'>
                        <span className='h-2.5 w-2.5 rounded-full bg-[#ef4444]' />
                        <span>High</span>
                    </div>
                </div>
            </div>
        )}
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
