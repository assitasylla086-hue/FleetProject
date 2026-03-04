// frontend/src/components/GeoSearchTab.js
import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function GeoSearchTab({ geoResults, setGeoResults }) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("5");
  const [mode, setMode] = useState("radius"); // "radius" | "nearest"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError("Géolocalisation non supportée."); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => setError("Impossible d'obtenir la position GPS.")
    );
  };

  const search = async () => {
    if (!lat || !lng) { setError("Latitude et longitude requis."); return; }
    setError("");
    setLoading(true);
    setGeoResults([]);
    try {
      let res;
      if (mode === "radius") {
        res = await axios.get(`${API}/positions/search/radius`, {
          params: { latitude: lat, longitude: lng, radius_km: radius }
        });
        setGeoResults(Array.isArray(res.data) ? res.data : []);
      } else {
        res = await axios.get(`${API}/positions/search/nearest`, {
          params: { latitude: lat, longitude: lng }
        });
        setGeoResults(res.data ? [res.data] : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de recherche");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="section-title">Recherche géographique</p>

      {/* Toggle mode */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`btn btn-sm ${mode === "radius" ? "btn-primary" : "btn-ghost"}`}
          style={{ flex: 1 }}
          onClick={() => { setMode("radius"); setGeoResults([]); }}
        >
          🔵 Dans un rayon
        </button>
        <button
          className={`btn btn-sm ${mode === "nearest" ? "btn-primary" : "btn-ghost"}`}
          style={{ flex: 1 }}
          onClick={() => { setMode("nearest"); setGeoResults([]); }}
        >
          ⭐ Plus proche
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input-field" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
          <input className="input-field" placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} />
        </div>

        {mode === "radius" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              className="input-field"
              type="number"
              placeholder="Rayon (km)"
              value={radius}
              onChange={e => setRadius(e.target.value)}
              min="0.1"
              step="0.5"
            />
            <span style={{ color: "#8b949e", fontSize: 13, whiteSpace: "nowrap" }}>km</span>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={useMyLocation} style={{ flex: 1 }}>
            📡 Ma position
          </button>
          <button className="btn btn-primary" onClick={search} disabled={loading} style={{ flex: 1 }}>
            {loading ? "Recherche..." : "🔍 Rechercher"}
          </button>
        </div>
      </div>

      {/* Résultats */}
      {geoResults.length > 0 && (
        <>
          <p className="section-title" style={{ marginBottom: 10 }}>
            {geoResults.length} résultat{geoResults.length > 1 ? "s" : ""}
          </p>
          {geoResults.map((r, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#e6edf3" }}>{r.name}</div>
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>{r.plate_number}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#00d28c", fontWeight: 700 }}>
                    {r.distance_km} km
                  </div>
                  <div style={{ fontSize: 11, color: "#484f58" }}>distance</div>
                </div>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#8b949e", fontFamily: "'Space Mono', monospace" }}>
                {Number(r.latitude).toFixed(5)}, {Number(r.longitude).toFixed(5)}
              </div>
            </div>
          ))}
        </>
      )}

      {geoResults.length === 0 && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <div>Lancez une recherche pour voir les véhicules proches</div>
        </div>
      )}
    </div>
  );
}