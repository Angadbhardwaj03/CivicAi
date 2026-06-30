import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Route, Navigation, Clock, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";

// Fix Next.js Leaflet icon bug
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Complaint {
  id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  lat: number;
  lng: number;
}

export default function DashboardMap({ complaints }: { complaints: Complaint[] }) {
  const [showRoute, setShowRoute] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<Complaint[]>([]);

  const handleToggleRoute = () => {
    if (showRoute) {
      setShowRoute(false);
      return;
    }

    if (complaints.length === 0) return;

    // Simple Nearest-Neighbor TSP solver
    const unvisited = [...complaints];
    const route = [unvisited.shift()!];

    while (unvisited.length > 0) {
      const lastPoint = route[route.length - 1];
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const d = Math.sqrt(
          Math.pow(unvisited[i].lat - lastPoint.lat, 2) + 
          Math.pow(unvisited[i].lng - lastPoint.lng, 2)
        );
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = i;
        }
      }
      route.push(unvisited.splice(nearestIdx, 1)[0]);
    }

    setOptimizedRoute(route);
    setShowRoute(true);
  };

  // Rough distance calculation in km (degrees to km approximation for Delhi region)
  const calculateTotalDistance = () => {
    let dist = 0;
    for (let i = 0; i < optimizedRoute.length - 1; i++) {
      const p1 = optimizedRoute[i];
      const p2 = optimizedRoute[i + 1];
      // Roughly 1 degree lat/lng = 111km
      dist += Math.sqrt(Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2)) * 111;
    }
    return dist.toFixed(1);
  };

  return (
    <div className="relative h-[550px] w-full rounded-[2rem] overflow-hidden border border-border/50 shadow-md">
      {/* Route Optimization Control Overlay */}
      <div className="absolute top-4 left-14 z-[1000] flex flex-col gap-2">
        <Button 
          onClick={handleToggleRoute}
          className={`shadow-lg border rounded-2xl flex items-center gap-2 font-semibold text-sm transition-all h-11 ${
            showRoute 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700" 
              : "bg-white hover:bg-slate-50 text-foreground border-border/60"
          }`}
        >
          <Route className="w-4.5 h-4.5" />
          {showRoute ? "Hide Service Route" : "Optimize Clean-up Route"}
        </Button>
      </div>

      {/* Itinerary Slide-over Summary */}
      {showRoute && optimizedRoute.length > 0 && (
        <div className="absolute top-4 right-4 z-[1000] w-76 bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-border/70 shadow-2xl max-h-[480px] overflow-y-auto font-sans text-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 border-b border-border/50 pb-3 mb-4">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-foreground tracking-tight">AI Navigation Route</h4>
              <p className="text-xs text-muted-foreground">Optimized dispatch path</p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1"><Route className="w-3.5 h-3.5" /> {calculateTotalDistance()} km total</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{Math.round(parseFloat(calculateTotalDistance()) * 3.5)} mins</span>
            </div>

            <div className="relative pl-4 border-l-2 border-dashed border-emerald-500/50 space-y-4 py-1.5 ml-2">
              {optimizedRoute.map((stop, idx) => (
                <div key={stop.id} className="relative">
                  {/* Custom node marker */}
                  <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-foreground text-xs">{stop.title}</h5>
                    <div className="flex gap-2.5 mt-0.5 items-center">
                      <span className="text-[10px] text-muted-foreground font-medium">{stop.id}</span>
                      <span className={`text-[9px] font-extrabold px-1 rounded ${
                        stop.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {stop.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={() => alert("Crew Dispatched successfully! Directions sent to handheld terminals.")}
              className="w-full mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-bold"
            >
              Dispatch Crew
            </Button>
          </div>
        </div>
      )}

      <MapContainer 
        center={[28.6139, 77.2090]} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((c) => (
          <Marker key={c.id} position={[c.lat, c.lng]}>
            <Popup>
              <div className="p-2 min-w-[200px] font-sans">
                <h3 className="font-bold text-base text-foreground mb-1">{c.title}</h3>
                <div className="flex gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    c.severity === 'Critical' ? 'bg-destructive/15 text-destructive' : 
                    c.severity === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {c.severity}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {c.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">ID: {c.id}</p>
                <div className="text-sm font-semibold flex items-center gap-1">
                  Status: <span className={c.status === 'Urgent' || c.status === 'Pending' ? 'text-destructive' : 'text-primary'}>{c.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Draw the optimized route line */}
        {showRoute && optimizedRoute.length > 1 && (
          <Polyline 
            positions={optimizedRoute.map(c => [c.lat, c.lng])} 
            color="#10b981" 
            weight={4} 
            dashArray="8, 12"
          />
        )}
      </MapContainer>
    </div>
  );
}

