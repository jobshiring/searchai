import { NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
  const services = [
    {
      url: 'https://ipwhois.app/json/',
      parse: (data: any) => {
        if (data.success === false) return null;
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
        };
      },
    },
    {
      url: 'https://ipapi.co/json/',
      parse: (data: any) => {
        if (data.error) return null;
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
        };
      },
    },
    {
      url: 'https://freeipapi.com/api/json',
      parse: (data: any) => {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.cityName,
        };
      },
    },
  ];

  for (const service of services) {
    try {
      const res = await fetch(service.url, {
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!res.ok) continue;

      const data = await res.json();
      const result = service.parse(data);

      if (result && result.latitude !== undefined && result.longitude !== undefined) {
        return Response.json({
          latitude: result.latitude || 0,
          longitude: result.longitude || 0,
          city: result.city || 'Unknown',
        });
      }
    } catch (error) {
      console.warn(`Server-side location service ${service.url} failed:`, error instanceof Error ? error.message : error);
    }
  }

  // Ultimate fallback if all services fail
  return Response.json({
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
  });
};
