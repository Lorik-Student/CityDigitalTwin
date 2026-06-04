
import { CloudSun, Droplets, Gauge, Thermometer, Wind } from 'lucide-react';
import type { WeatherCurrent } from '@shared/api-types/weather';

interface InfoCardProps { 
    pictureUrl?: string;
    title?: string;
    description?: string;
    weather?: WeatherCurrent | null;
    isWeatherLoading?: boolean;
    weatherError?: string | null;
}

export function InfoCard({ pictureUrl, title, description, weather, isWeatherLoading, weatherError }: InfoCardProps) { 
    if (!title) return null;

    return (
        <div className="absolute left-12 top-1/2 -translate-y-1/2 w-80 max-h-[85vh] overflow-y-auto 
                        bg-[#02090c]/70 backdrop-blur-xl border border-cyan-500/30 
                        rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.2)] p-6 flex flex-col z-50">
            {pictureUrl && (
                <div className="relative mb-5 w-full h-48 rounded-lg overflow-hidden border border-cyan-500/30">
                    <img src={pictureUrl} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#02090c] to-transparent"></div>
                </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide">
                {title}
            </h2>
            <div className="w-12 h-[2px] bg-cyan-500 rounded-full mb-4 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
            <p className="text-gray-300 leading-relaxed text-sm">
                {description || "No details available."}
            </p>
            <div className="mt-5 border-t border-cyan-500/20 pt-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-100">
                        <CloudSun size={18} strokeWidth={2.2} />
                        <span>Weather</span>
                    </div>
                    {weather?.iconUrl && (
                        <img src={weather.iconUrl} alt="" className="h-9 w-9 shrink-0" />
                    )}
                </div>
                {isWeatherLoading && (
                    <p className="text-sm text-gray-400">Loading current conditions...</p>
                )}
                {weatherError && !isWeatherLoading && (
                    <p className="text-sm text-rose-200">{weatherError}</p>
                )}
                {weather && !isWeatherLoading && !weatherError && (
                    <div className="space-y-3 text-sm text-gray-300">
                        <div>
                            <div className="text-3xl font-bold text-white">
                                {Math.round(weather.temperatureC)}&deg;C
                            </div>
                            <div className="text-cyan-100">{weather.condition}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <Thermometer size={16} className="text-cyan-300" />
                                <span>Feels {Math.round(weather.feelsLikeC)}&deg;C</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Droplets size={16} className="text-cyan-300" />
                                <span>{weather.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Wind size={16} className="text-cyan-300" />
                                <span>{Math.round(weather.windKph)} km/h</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gauge size={16} className="text-cyan-300" />
                                <span>UV {weather.uv}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
