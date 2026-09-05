"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Satellite, Shield, Navigation, Wifi, Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react";
import { GpsTrackingState } from "@/types/health";

interface LiveTrackingCardProps {
  tracking: GpsTrackingState;
}

export const LiveTrackingCard: React.FC<LiveTrackingCardProps> = ({ tracking }) => {
  const firstPoint = tracking.path[0];
  const currentPoint = tracking.path[tracking.path.length - 1];
  const [deviceCoordinates, setDeviceCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [environment, setEnvironment] = useState<{ temperature: number; humidity: number; aqi: number } | null>(null);
  const [environmentLoading, setEnvironmentLoading] = useState(false);
  const latitudes = tracking.path.map((point) => point.latitude);
  const longitudes = tracking.path.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeRange = maxLatitude - minLatitude || 0.001;
  const longitudeRange = maxLongitude - minLongitude || 0.001;
  const routePoints = tracking.path.map((point) => ({
    x: 30 + ((point.longitude - minLongitude) / longitudeRange) * 340,
    y: 170 - ((point.latitude - minLatitude) / latitudeRange) * 140,
  }));
  const routePolyline = routePoints.map((point) => `${point.x},${point.y}`).join(" ");
  const currentMapPoint = routePoints[routePoints.length - 1] || { x: 230, y: 100 };

  const formatCoordinate = (value: number | undefined, positive: string, negative: string) => {
    if (value === undefined) return "--";
    return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
  };

  const latitude = currentPoint?.latitude ?? deviceCoordinates?.latitude;
  const longitude = currentPoint?.longitude ?? deviceCoordinates?.longitude;

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => setDeviceCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      () => undefined,
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;

    const controller = new AbortController();
    const loadEnvironment = async () => {
      setEnvironmentLoading(true);
      try {
        const query = `latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`;
        const airQuery = `latitude=${latitude}&longitude=${longitude}&current=us_aqi`;
        const [weatherResponse, airResponse] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?${query}`, { signal: controller.signal }),
          fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${airQuery}`, { signal: controller.signal }),
        ]);

        if (!weatherResponse.ok || !airResponse.ok) throw new Error("Environmental data unavailable");
        const weather = await weatherResponse.json();
        const air = await airResponse.json();
        setEnvironment({
          temperature: weather.current.temperature_2m,
          humidity: weather.current.relative_humidity_2m,
          aqi: air.current.us_aqi,
        });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setEnvironment(null);
      } finally {
        if (!controller.signal.aborted) setEnvironmentLoading(false);
      }
    };

    void loadEnvironment();
    return () => controller.abort();
  }, [latitude, longitude]);

  return (
    <section className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(34,211,238,0.08)] relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]">
            <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Live Tracking</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {firstPoint
                ? `START ${formatCoordinate(firstPoint.latitude, "N", "S")} | ${formatCoordinate(firstPoint.longitude, "E", "W")}`
                : "Waiting for phone GPS permission"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <Wifi className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>{tracking.path.length > 0 ? "GPS ACTIVE" : "GPS WAITING"}</span>
        </div>
      </div>

      {/* Stylized Dark 3D Map Grid Container */}
      <div className="relative w-full h-48 sm:h-56 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Pulsing Radar Sweep Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 rounded-full border border-cyan-500/20 animate-spin relative" style={{ animationDuration: "8s" }}>
            <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent origin-left opacity-70" />
          </div>
        </div>

        {/* Topographic Elevation Rings */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="w-44 h-44 rounded-full border border-cyan-500/20 animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="w-28 h-28 rounded-full border border-slate-800" />
          <div className="w-14 h-14 rounded-full border border-slate-800" />
        </div>

        {/* Glowing Cyan Vector Path SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
            </linearGradient>
          </defs>

          {routePoints.length > 1 && (
            <>
              <polyline
                points={routePolyline}
                fill="none"
                stroke="rgba(34, 211, 238, 0.3)"
                strokeWidth="6"
                strokeDasharray="6,6"
              />
              <polyline
                points={routePolyline}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_12px_#22d3ee]"
              />
              {routePoints.filter((_, index) => index === 0 || index === routePoints.length - 1).map((point, index) => (
                <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="4" fill="#06b6d4" />
              ))}
            </>
          )}
        </svg>

        {tracking.path.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center text-xs text-slate-500">
            Allow phone location access to draw your route and estimate steps from measured movement.
          </div>
        )}

        {/* Center Glowing Pin & Pulse Ring (Simulates Active GPS Polling) */}
        <div className="absolute top-[55%] left-[65%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div
            className="relative flex items-center justify-center"
            style={{
              left: `${(currentMapPoint.x / 400) * 100}%`,
              top: `${(currentMapPoint.y / 200) * 100}%`,
            }}
          >
            {/* Multi-layer pulsating aura */}
            <div className="absolute w-14 h-14 rounded-full bg-cyan-400/30 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute w-10 h-10 rounded-full bg-cyan-400/50 animate-pulse" style={{ animationDuration: "1.5s" }} />
            
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_#22d3ee]">
              <Navigation className="w-4 h-4 text-cyan-400 transform rotate-45 animate-pulse" />
            </div>
          </div>
          <span className="mt-1.5 px-2 py-0.5 rounded bg-slate-900/95 border border-cyan-500/50 text-[9px] font-mono text-cyan-300 font-semibold shadow-lg whitespace-nowrap">
            {currentPoint ? "Current GPS Position" : "GPS Waiting"}
          </span>
        </div>

        {/* Corner Data Block 1: Top Left - Satellite Icon */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs shadow-md">
          <Satellite className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-[11px] font-semibold text-cyan-400 leading-none">
              {tracking.path.length > 0 ? `${tracking.path.length} GPS points` : "GPS not connected"}
            </div>
            <div className="text-[9px] text-slate-400 leading-tight">
              {tracking.totalDistanceMeters >= 1 ? `${(tracking.totalDistanceMeters / 1000).toFixed(2)} km traveled` : "Waiting for movement"}
            </div>
          </div>
        </div>

        {/* Corner Data Block 2: Bottom Right - Shield Icon */}
        <div className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 text-xs shadow-md">
          <Shield className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-[11px] font-semibold text-cyan-400 leading-none">
              {tracking.steps > 0 ? `${tracking.steps.toLocaleString()} steps` : "No steps measured"}
            </div>
            <div className="text-[9px] text-slate-400 leading-tight">
              GPS-derived estimate
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Environmental Context</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Open-Meteo Live</span>
        </div>
        {environment ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                <Thermometer className="h-3.5 w-3.5 text-amber-400" />
                <p className="mt-1 text-sm font-bold text-white">{environment.temperature.toFixed(1)}°C</p>
                <p className="text-[10px] text-slate-500">Ambient temp</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                <Droplets className="h-3.5 w-3.5 text-sky-400" />
                <p className="mt-1 text-sm font-bold text-white">{environment.humidity}%</p>
                <p className="text-[10px] text-slate-500">Humidity</p>
              </div>
              <div className={`rounded-lg border p-2 ${environment.aqi > 150 ? "border-rose-500/60 bg-rose-500/10" : "border-slate-800 bg-slate-900"}`}>
                <Wind className={`h-3.5 w-3.5 ${environment.aqi > 150 ? "text-rose-400" : "text-emerald-400"}`} />
                <p className="mt-1 text-sm font-bold text-white">{environment.aqi}</p>
                <p className="text-[10px] text-slate-500">US AQI</p>
              </div>
            </div>
            {environment.aqi > 150 && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-rose-500/50 bg-rose-500/10 p-2 text-[10px] font-bold text-rose-300">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Respiratory warning: wear a mask or stay indoors.
              </div>
            )}
          </>
        ) : (
          <p className="text-[10px] text-slate-500">{environmentLoading ? "Loading local weather and air quality..." : "Allow location access to load environmental data."}</p>
        )}
      </div>
    </section>
  );
};
