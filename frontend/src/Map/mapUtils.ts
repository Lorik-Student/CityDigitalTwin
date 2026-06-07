import type { Map as MapboxMap } from 'mapbox-gl';
import type { CityProfile } from '@shared/api-types';
import { apiFetch } from '../auth/authClient';

export async function initializeRegions(
    mapInstance: MapboxMap,
    onCitySelect: (cityProps: CityProfile) => void,
    getIsThreeD: () => boolean
) { 
    try {
        const cities = await apiFetch<CityProfile[]>("/data-points/cities");

        const features = cities
            .filter(city => city && city.lng !== undefined && city.lat !== undefined)
            .map(city => ({
                type: 'Feature' as const,
                id: city.id, 
                properties: { 
                    id: city.id, 
                    name: city.name, 
                    lat: city.lat,
                    lng: city.lng,
                    weatherCondition: city.weatherCondition,
                    population: city.population,
                    area: city.area,
                    imageUrl: city.imageUrl,
                    description: city.description
                },
                geometry: { 
                    type: 'Point' as const, 
                    coordinates: [Number(city.lng), Number(city.lat)]
                }
            }));

        const cityPoints: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: features
        };

        if (!mapInstance.isStyleLoaded()) return;

        mapInstance.addSource('city-data-source', {
            type: 'geojson',
            data: cityPoints,
            generateId: true 
        });

        mapInstance.addLayer({
            id: 'city-glow-layer',
            type: 'circle',
            source: 'city-data-source',
            paint: {
                'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 55, 0],
                'circle-color': '#00e5ff',
                'circle-blur': 2, 
                'circle-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.35, 0],
                'circle-radius-transition': { duration: 300 },
                'circle-opacity-transition': { duration: 300 }
            }
        });

        mapInstance.addLayer({
            id: 'city-layer',
            type: 'symbol', 
            source: 'city-data-source',
            layout: {
                'text-field': ['get', 'name'],
                'text-size': 16,
                'text-allow-overlap': false 
            },
            paint: {
                'text-color': '#ffffff', 
            }
        });

    } catch (error) {
        console.error("Failed to fetch or render city datapoints:", error);
    }

    let hoveredStateId: string | null = null;

    mapInstance.on('click', 'city-layer', (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const clickedCity = e.features[0];
        if (clickedCity.properties) {
            if (clickedCity.properties.name === 'Prizren') {
                const isThreeD = getIsThreeD();

                mapInstance.flyTo({
                    center: [20.7397, 42.2139],
                    zoom: 15.7,
                    pitch: isThreeD ? 62 : 0,
                    bearing: isThreeD ? -18 : 0,
                    speed: 0.9,
                    curve: 1.4,
                    essential: true
                });
            }

            // Pass the GeoJSON properties back to React state
            onCitySelect(clickedCity.properties as CityProfile);
        }
    });

    mapInstance.on('mousemove', 'city-layer', (e) => {
        if (e.features && e.features.length > 0 && e.features[0].id !== undefined) {
            mapInstance.getCanvas().style.cursor = 'pointer';
            
            const featureId = e.features[0].id.toString();
            if (hoveredStateId !== null && hoveredStateId !== featureId) {
                mapInstance.setFeatureState(
                    { source: 'city-data-source', id: hoveredStateId },
                    { hover: false }
                );
            }
            hoveredStateId = featureId;
            mapInstance.setFeatureState(
                { source: 'city-data-source', id: hoveredStateId },
                { hover: true }
            );
        }
    });

    mapInstance.on('mouseleave', 'city-layer', () => {
        mapInstance.getCanvas().style.cursor = '';
        if (hoveredStateId !== null) {
            mapInstance.setFeatureState(
                { source: 'city-data-source', id: hoveredStateId },
                { hover: false }
            );
        }
        hoveredStateId = null;
    });
}
