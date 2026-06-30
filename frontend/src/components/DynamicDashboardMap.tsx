"use client"
import dynamic from 'next/dynamic';

const DynamicDashboardMap = dynamic(() => import('./DashboardMap'), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-green-50 animate-pulse rounded-2xl flex items-center justify-center text-muted-foreground font-medium">Initializing Map Layers...</div>
});

export default DynamicDashboardMap;
