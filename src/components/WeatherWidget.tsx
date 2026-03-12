"use client";

import { Cloud, Sun, CloudRain, CloudSnow, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

const WeatherWidget = () => {
  const [data, setData] = useState({
    temperature: 0,
    condition: '',
    location: '',
    humidity: 0,
    windSpeed: 0,
    icon: '',
    temperatureUnit: 'C',
    windSpeedUnit: 'm/s',
  });

  const [loading, setLoading] = useState(true);

  const getApproxLocation = async () => {
    try {
      const res = await fetch('/api/location', {
        signal: AbortSignal.timeout(5000), // 5s timeout
      });
      
      if (!res.ok) throw new Error('Failed to fetch location from server');
      
      const data = await res.json();
      
      return {
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        city: data.city || 'Unknown',
      };
    } catch (error) {
      console.error('Error fetching approximate location:', error instanceof Error ? error.message : error);
      // Ultimate fallback if API fails
      return {
        latitude: 51.5074,
        longitude: -0.1278,
        city: 'London',
      };
    }
  };

  const getLocation = async (
    callback: (location: {
      latitude: number;
      longitude: number;
      city: string;
    }) => void,
  ) => {
    if (navigator.geolocation) {
      try {
        const result = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });

        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const res = await fetch(
                  `https://api-bdc.io/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
                  {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  },
                );

                const data = await res.json();

                callback({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  city: data.locality || 'Unknown',
                });
              } catch (error) {
                console.error('Error reverse geocoding:', error);
                callback({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  city: 'Unknown',
                });
              }
            },
            async (error) => {
              console.error('Geolocation error:', error);
              callback(await getApproxLocation());
            },
          );
        } else if (result.state === 'prompt') {
          callback(await getApproxLocation());
          navigator.geolocation.getCurrentPosition(() => {});
        } else if (result.state === 'denied') {
          callback(await getApproxLocation());
        }
      } catch (error) {
        // navigator.permissions.query might not be supported (e.g. Safari)
        console.error('Permissions query error:', error);
        callback(await getApproxLocation());
      }
    } else {
      callback(await getApproxLocation());
    }
  };

  const updateWeather = async () => {
    getLocation(async (location) => {
      try {
        const res = await fetch(`/api/weather`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lat: location.latitude,
            lng: location.longitude,
            measureUnit: localStorage.getItem('measureUnit') ?? 'Metric',
          }),
        });

        if (!res.ok) {
          throw new Error(`Weather API error: ${res.status}`);
        }

        const data = await res.json();

        setData({
          temperature: data.temperature ?? 0,
          condition: data.condition || 'Unknown',
          location: location.city || 'Unknown',
          humidity: data.humidity ?? 0,
          windSpeed: data.windSpeed ?? 0,
          icon: data.icon || 'clear-day',
          temperatureUnit: data.temperatureUnit || 'C',
          windSpeedUnit: data.windSpeedUnit || 'm/s',
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    updateWeather();
    const intervalId = setInterval(updateWeather, 30 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-light-secondary dark:bg-dark-secondary rounded-2xl border border-light-200 dark:border-dark-200 shadow-sm shadow-light-200/10 dark:shadow-black/25 flex flex-row items-center w-full h-24 min-h-[96px] max-h-[96px] px-3 py-2 gap-3">
      {loading ? (
        <>
          <div className="flex flex-col items-center justify-center w-16 min-w-16 max-w-16 h-full animate-pulse">
            <div className="h-10 w-10 rounded-full bg-light-200 dark:bg-dark-200 mb-2" />
            <div className="h-4 w-10 rounded bg-light-200 dark:bg-dark-200" />
          </div>
          <div className="flex flex-col justify-between flex-1 h-full py-1 animate-pulse">
            <div className="flex flex-row items-center justify-between">
              <div className="h-3 w-20 rounded bg-light-200 dark:bg-dark-200" />
              <div className="h-3 w-12 rounded bg-light-200 dark:bg-dark-200" />
            </div>
            <div className="h-3 w-16 rounded bg-light-200 dark:bg-dark-200 mt-1" />
            <div className="flex flex-row justify-between w-full mt-auto pt-1 border-t border-light-200 dark:border-dark-200">
              <div className="h-3 w-16 rounded bg-light-200 dark:bg-dark-200" />
              <div className="h-3 w-8 rounded bg-light-200 dark:bg-dark-200" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center w-16 min-w-16 max-w-16 h-full">
            <Image
              src={`/weather-ico/${data.icon}.svg`}
              alt={data.condition}
              className="h-10 w-auto"
              width={40}
              height={40}
            />
            <span className="text-base font-semibold text-black dark:text-white">
              {data.temperature}°{data.temperatureUnit}
            </span>
          </div>
          <div className="flex flex-col justify-between flex-1 h-full py-2 overflow-hidden">
            <div className="flex flex-row items-center justify-between gap-2">
              <span className="text-sm font-semibold text-black dark:text-white truncate">
                {data.location || 'Unknown Location'}
              </span>
              <span className="flex items-center text-xs text-black/60 dark:text-white/60 font-medium shrink-0">
                <Wind className="w-3 h-3 mr-1" />
                {data.windSpeed} {data.windSpeedUnit}
              </span>
            </div>
            <div className="text-xs text-black/50 dark:text-white/50 font-medium truncate">
              {data.condition}
            </div>
            <div className="flex flex-row justify-between w-full mt-auto pt-1 border-t border-light-200 dark:border-dark-200">
              <span className="text-[10px] text-black/40 dark:text-white/40 font-medium">
                Humidity: {data.humidity}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherWidget;
