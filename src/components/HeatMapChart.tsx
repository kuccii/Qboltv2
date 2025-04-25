import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';

interface Location {
  name: string;
  coordinates: LatLngTuple;
  demand: number;
  color: string;
}

interface HeatMapProps {
  center: LatLngTuple;
  zoom: number;
  locations: Location[];
  height?: string;
}

const HeatMapChart: React.FC<HeatMapProps> = ({ center, zoom, locations, height = '400px' }) => {
  const getDemandRadius = (demand: number) => {
    // Scale the radius based on demand
    return Math.max(10000, demand * 5000);
  };

  const getOpacity = (demand: number) => {
    // Adjust opacity based on demand
    return Math.min(0.6, Math.max(0.2, demand / 100 * 0.6));
  };

  return (
    <div style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {locations.map((location, index) => (
          <React.Fragment key={index}>
            <Circle
              center={location.coordinates}
              radius={getDemandRadius(location.demand)}
              pathOptions={{
                fillColor: location.color,
                fillOpacity: getOpacity(location.demand),
                color: location.color,
                weight: 1,
              }}
            />
            <Marker position={location.coordinates}>
              <Popup>
                <div className="p-1">
                  <h3 className="font-medium text-gray-800">{location.name}</h3>
                  <p className="text-sm text-gray-600">Demand Index: {location.demand}</p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default HeatMapChart;