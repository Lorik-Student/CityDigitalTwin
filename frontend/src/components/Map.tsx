import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { CityProfile } from '@shared/api-types/city';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibG9yaWttYWNodSIsImEiOiJjbHhxNnhxem4wNGxyMm1wazJxdzQwaHVoIn0';

    const mapInstance = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/lorik888/cmonctu3b002801r382nt9xvt',
        center: [20.902977, 42.602636],
        zoom: 7.7,
        pitch: 0,
        bearing: 0,
        antialias: true
    });

    map.current = mapInstance;

    // Wait until the style structure is fully compiled into WebGL context
    mapInstance.on('load', async () => {
    try {
        const response = await fetch("http://localhost:5000/api/data-points/cities", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cities: CityProfile[] = await response.json();
        console.log("Verified Backend Array:", cities);

        // Convert the CityProfile array into valid GeoJSON features
        const features = cities
            .filter(city => city && city.lng !== undefined && city.lat !== undefined)
            .map(city => ({
                    type: 'Feature' as const,
                    properties: { 
                    uuid: city.uuid, 
                    name: city.name, 
                    weatherCondition: city.weatherCondition, // Accounted for camelCase conversion
                    population: city.population,
                    area: city.area
                },
                geometry: { 
                type: 'Point' as const, 
                coordinates: [Number(city.lng), Number(city.lat)] // [longitude, latitude]
                }
            }));

        const cityPoints: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: features
        };

        // Prevent state-race collisions if component unmounted mid-flight
        if (!mapInstance.isStyleLoaded()) return;

        mapInstance.addSource('city-data-source', {
            type: 'geojson',
            data: cityPoints
        });

        mapInstance.addLayer({
            id: 'city-layer',
            type: 'symbol', 
            source: 'city-data-source',
            layout: {
                'text-field': ['get', 'name'],

                'text-size': 14,
                'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                'text-radial-offset': 0.5,
                'text-justify': 'auto',
                'text-allow-overlap': false 
            },
            paint: {
                'text-color': '#ffffff', 
                'text-halo-color': '#ffffff',
                'text-halo-width': 0.5
            }
        });

    } catch (error) {
        console.error("Failed to fetch or render city datapoints:", error);
    }
    });

    mapInstance.on('click', 'city-layer', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const clickedCity = e.features[0];
      console.log("Queried City Properties:", clickedCity.properties);
      
      // Access specific values safely
      const name = clickedCity.properties?.name;
      const uuid = clickedCity.properties?.uuid;
    });

    mapInstance.on('mouseenter', 'city-layer', () => {
      mapInstance.getCanvas().style.cursor = 'pointer';
    });
    mapInstance.on('mouseleave', 'city-layer', () => {
      mapInstance.getCanvas().style.cursor = '';
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
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_35%,_#02090c_85%,_#010507_100%)] mix-blend-multiply opacity-95' />
    </div>
  );
}