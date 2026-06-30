"use client"
import dynamic from 'next/dynamic';

// Dynamically import the map picker to avoid "window is not defined" errors since leaflet references window immediately
const DynamicMapPicker = dynamic(() => import('./MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-green-50 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground">Loading Maps...</div>
});

export default DynamicMapPicker;
