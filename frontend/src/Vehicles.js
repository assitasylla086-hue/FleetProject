import { useEffect, useState } from "react";
import axios from "axios";

export default function Vehicles({ onSelectVehicle }) {
  const [vehicles, setVehicles] = useState([]);
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [editId, setEditId] = useState(null);

  // Charger tous les véhicules
  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vehicles");
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Ajouter ou modifier
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/vehicles/${editId}`, { name, plate_number: plate });
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/vehicles", { name, plate_number: plate });
      }
      setName("");
      setPlate("");
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer un véhicule
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  // Préparer modification
  const handleEdit = (v) => {
    setEditId(v.id);
    setName(v.name);
    setPlate(v.plate_number);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto" }}>
      <h3>Gestion des véhicules</h3>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom du véhicule"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Plaque d'immatriculation"
          value={plate}
          onChange={e => setPlate(e.target.value)}
          required
        />
        <button type="submit">{editId ? "Modifier" : "Ajouter"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setName(""); setPlate(""); }}>Annuler</button>}
      </form>

      <ul>
        {vehicles.map(v => (
          <li key={v.id} style={{ margin: "5px 0" }}>
            {v.name} ({v.plate_number})  
            <button onClick={() => handleEdit(v)} style={{ marginLeft: "10px" }}>✏️</button>
            <button onClick={() => handleDelete(v.id)} style={{ marginLeft: "5px" }}>🗑️</button>
            <button onClick={() => onSelectVehicle(v)} style={{ marginLeft: "5px" }}>📍Voir sur la carte</button>
          </li>
        ))}
      </ul>
    </div>
  );
}