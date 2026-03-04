// frontend/src/App.js
import { useState, useEffect } from "react";
import axios from "axios";
import Auth from "./Auth";
import Sidebar from "./components/Sidebar";
import VehicleTab from "./components/VehicleTab";
import PositionTab from "./components/PositionTab";
import GeoSearchTab from "./components/GeoSearchTab";
import MapView from "./components/MapView";
import "./styles/app.css";

const API = "http://localhost:5000/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("vehicles");
  const [vehicles, setVehicles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [geoResults, setGeoResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        axios.get(`${API}/vehicles`),
        axios.get(`${API}/positions`)
      ]);
      setVehicles(vRes.data);
      setPositions(pRes.data);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setVehicles([]);
    setPositions([]);
  };

  if (!user) return <Auth onLogin={setUser} />;

  const tabs = [
    { id: "vehicles", label: "Véhicules", icon: "🚗" },
    { id: "positions", label: "Positions", icon: "📍" },
    { id: "geosearch", label: "Géo-Recherche", icon: "🔍" },
  ];

  return (
    <div className="app-layout">
      {/* SIDEBAR GAUCHE */}
      <div className="app-sidebar">
        <Sidebar user={user} onLogout={handleLogout} vehicleCount={vehicles.length} />

        {/* ONGLETS */}
        <div className="tab-bar">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENU ONGLET */}
        <div className="tab-content">
          {loading && <div className="loading-bar" />}

          {activeTab === "vehicles" && (
            <VehicleTab
              vehicles={vehicles}
              setVehicles={setVehicles}
              selectedVehicleId={selectedVehicleId}
              setSelectedVehicleId={setSelectedVehicleId}
              positions={positions}
              setPositions={setPositions}
              onRefresh={fetchData}
            />
          )}

          {activeTab === "positions" && (
            <PositionTab
              positions={positions}
              vehicles={vehicles}
              onRefresh={fetchData}
            />
          )}

          {activeTab === "geosearch" && (
            <GeoSearchTab
              geoResults={geoResults}
              setGeoResults={setGeoResults}
            />
          )}
        </div>
      </div>

      {/* CARTE DROITE */}
      <div className="app-map">
        <MapView
          positions={positions}
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          setSelectedVehicleId={setSelectedVehicleId}
          geoResults={geoResults}
        />
      </div>
    </div>
  );
}