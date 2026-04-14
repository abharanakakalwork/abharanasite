"use client";
import { useEffect, useState, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon bug in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Pulsing Icon - Static assignment for performance
const PULSING_ICON_HTML = (color: string) => `
  <div class="relative flex items-center justify-center">
    <div class="absolute w-8 h-8 bg-[${color}] rounded-full animate-ping opacity-20"></div>
    <div class="absolute w-4 h-4 bg-[${color}] rounded-full shadow-lg"></div>
  </div>`;

const LOCATIONS = [
  { id: 1, name: "Urban Zen Studio", pos: [12.9716, 77.5946], desc: "Peaceful oasis near Cubbon Park", type: "Studio" },
  { id: 2, name: "Lakeside Retreat", pos: [12.9815, 77.6200], desc: "Healing by the waters of Ulsoor", type: "Retreat" },
  { id: 3, name: "The Banyan Grove", pos: [12.9507, 77.5848], desc: "Ancient roots in Lalbagh shadow", type: "Sanctuary" },
  { id: 4, name: "Terracotta Sanctuary", pos: [12.9719, 77.6412], desc: "Boutique space in Indiranagar", type: "Boutique" }
];

const MapComponent = memo(function MapComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
     <div className="w-full h-full bg-[#f1e4da]/20 flex items-center justify-center rounded-[40px]">
        <span className="text-[#a55a3d]/40 font-serif italic text-xl">Loading Sacred Geometry...</span>
     </div>
  );

  return (
    <div className="w-full h-full rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl border border-white/40 ring-1 ring-[#bc6746]/10 relative z-0">
      <MapContainer 
        center={[12.9716, 77.5946] as any} 
        zoom={13} 
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {LOCATIONS.map((loc) => (
          <Marker 
            key={loc.id} 
            position={loc.pos as any}
            icon={L.divIcon({
              html: PULSING_ICON_HTML("#bc6746"),
              className: "custom-pulsing-icon",
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })}
          >
            <Popup className="sacred-popup">
              <div className="p-2 min-w-[180px]">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#bc6746] mb-1 block">{loc.type}</span>
                <h4 className="text-lg font-serif text-[#a55a3d] mb-1">{loc.name}</h4>
                <p className="text-xs text-[#4a3b32]/80 leading-relaxed font-light mb-3">{loc.desc}</p>
                <button className="w-full py-2 bg-[#bc6746] text-[#fffdf8] text-[10px] uppercase tracking-widest font-bold rounded-lg hover:bg-[#a55a3d] transition-colors">
                   Book a Session
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Overlay Grain */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-overlay paper-grain" />
      
      <style jsx global>{`
        .sacred-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 253, 248, 0.95) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 20px !important;
          box-shadow: 0 20px 40px rgba(188, 103, 70, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
        }
        .sacred-popup .leaflet-popup-tip {
          background: rgba(255, 253, 248, 0.95) !important;
        }
        .custom-pulsing-icon {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
});

export default MapComponent;

