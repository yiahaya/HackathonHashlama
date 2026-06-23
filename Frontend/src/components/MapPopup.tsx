import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getRehabilitationCenters } from '../services/api';
import L from 'leaflet';

// Fix Leaflet's default icon missing issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [0, -35]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Center {
  id: number;
  name: string;
  address: string;
  lat: string | number;
  lng: string | number;
}

interface MapPopupProps {
  onClose: () => void;
}

const MapPopup: React.FC<MapPopupProps> = ({ onClose }) => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      const res = await getRehabilitationCenters();
      if (res.success && res.centers) {
        setCenters(res.centers);
      }
      setLoading(false);
    };
    fetchCenters();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-[#1E3A8A] text-white">
          <h2 className="text-xl font-bold">מפת מרכזי שיקום בישראל</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="סגור מפה"
          >
            ✕
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full relative" dir="ltr">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1E3A8A] border-t-transparent"></div>
            </div>
          ) : (
            <MapContainer 
              center={[31.95, 34.8]} 
              zoom={8} 
              style={{ height: '100%', width: '100%', zIndex: 10 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {centers.map(center => (
                <Marker 
                  key={center.id} 
                  position={[Number(center.lat), Number(center.lng)]}
                >
                  <Tooltip direction="top" opacity={1}>
                    <div className="text-right" dir="rtl">
                      <strong className="block text-sm text-[#1E3A8A]">{center.name}</strong>
                      <span className="text-xs text-gray-600">{center.address}</span>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="text-right" dir="rtl">
                      <strong className="block text-md mb-1">{center.name}</strong>
                      <p className="text-sm text-gray-600 m-0">{center.address}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPopup;
