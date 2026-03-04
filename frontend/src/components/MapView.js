import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const COLORS = ["#5b4cf5","#10b981","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#ec4899"];
const getColor = id => COLORS[id % COLORS.length];

function makePin(color, selected = false) {
  const size = selected ? 40 : 32;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:${selected ? "3px" : "2.5px"} solid white;
      box-shadow:0 ${selected ? "6px 20px" : "3px 10px"} ${color}66;
      transition:all 0.2s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -(size + 4)]
  });
}

function makeGeoPin() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;
      background:#f59e0b;
      border-radius:50%;
      border:2.5px solid white;
      box-shadow:0 3px 12px rgba(245,158,11,0.5);
      display:flex;align-items:center;justify-content:center;
      font-size:13px;
    ">⭐</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14],
  });
}

function FlyToVehicle({ positions, selectedVehicleId }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedVehicleId) return;
    const vPos = positions.filter(p => p.vehicle_id === selectedVehicleId);
    if (!vPos.length) return;
    const last = vPos[vPos.length - 1];
    map.flyTo([last.latitude, last.longitude], 15, { duration: 1 });
  }, [selectedVehicleId, positions, map]);
  return null;
}

export default function MapView({ positions, vehicles, selectedVehicleId, setSelectedVehicleId, geoResults }) {
  const trajets = {};
  positions.forEach(p => {
    if (!trajets[p.vehicle_id]) trajets[p.vehicle_id] = [];
    trajets[p.vehicle_id].push([parseFloat(p.latitude), parseFloat(p.longitude)]);
  });

  const lastPos = {};
  positions.forEach(p => { lastPos[p.vehicle_id] = p; });

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer center={[5.36, -4.01]} zoom={13}
        style={{ height: "100%", width: "100%" }} zoomControl={false}>
        {/* Tuiles claires et élégantes */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <FlyToVehicle positions={positions} selectedVehicleId={selectedVehicleId} />

        {/* Polylines */}
        {Object.entries(trajets).map(([vid, coords]) =>
          coords.length > 1 && (
            <Polyline key={vid} positions={coords}
              color={getColor(parseInt(vid))}
              weight={selectedVehicleId === parseInt(vid) ? 4 : 2.5}
              opacity={selectedVehicleId && selectedVehicleId !== parseInt(vid) ? 0.25 : 0.75}
              dashArray={selectedVehicleId === parseInt(vid) ? null : "6,4"}
            />
          )
        )}

        {/* Marqueurs */}
        {Object.values(lastPos).map(p => (
          <Marker key={p.vehicle_id}
            position={[parseFloat(p.latitude), parseFloat(p.longitude)]}
            icon={makePin(getColor(p.vehicle_id), selectedVehicleId === p.vehicle_id)}
            eventHandlers={{ click: () => setSelectedVehicleId(p.vehicle_id === selectedVehicleId ? null : p.vehicle_id) }}
          >
            <Popup>
              <div style={{ fontFamily: "'Outfit', sans-serif", minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{p.plate_number}</div>
                <div style={{ fontSize: 11, background: "#f5f3ff", color: "#5b4cf5", borderRadius: 5, padding: "3px 7px", fontFamily: "monospace", marginBottom: 4 }}>
                  {Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(p.created_at).toLocaleString("fr-FR")}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Geo results */}
        {geoResults.map((r, i) => (
          <Marker key={`geo-${i}`} position={[parseFloat(r.latitude), parseFloat(r.longitude)]} icon={makeGeoPin()}>
            <Popup>
              <div style={{ fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>📍 {r.distance_km} km</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Légende flottante */}
      {vehicles.length > 0 && (
        <div style={{
          position: "absolute", bottom: 20, left: 12, zIndex: 1000,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid #e5e7eb",
          borderRadius: 12, padding: "10px 14px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          minWidth: 160, maxWidth: 200
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 8 }}>
            Véhicules
          </div>
          {vehicles.map(v => (
            <div key={v.id} onClick={() => setSelectedVehicleId(selectedVehicleId === v.id ? null : v.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 6, cursor: "pointer",
                opacity: selectedVehicleId && selectedVehicleId !== v.id ? 0.35 : 1,
                transition: "opacity 0.2s"
              }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: getColor(v.id), flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {v.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}