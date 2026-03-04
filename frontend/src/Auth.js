import { useState } from "react";
import axios from "axios";
import "./styles/auth.css";

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (mode === "login") {
        const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
        onLogin(res.data);
      } else {
        await axios.post("http://localhost:5000/api/auth/register", { email, password });
        setMode("login");
        alert("Compte créé ! Connectez-vous.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      {/* Le panneau gauche est en CSS ::before / ::after */}
      <div /> {/* placeholder gauche */}
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-mark">⬡</div>
            <span className="auth-logo-text">FleetOS</span>
          </div>

          <h1 className="auth-heading">
            {mode === "login" ? "Bon retour 👋" : "Créer un compte"}
          </h1>
          <p className="auth-subheading">
            {mode === "login"
              ? "Connectez-vous à votre espace de gestion de flotte"
              : "Rejoignez FleetOS et gérez votre flotte facilement"}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required />
            </div>
            <div className="auth-field">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            {error && <div className="auth-error">⚠ {error}</div>}
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : (mode === "login" ? "Se connecter →" : "Créer mon compte →")}
            </button>
          </form>

          <div className="auth-divider" style={{ marginTop: 20 }}>ou</div>

          <p className="auth-toggle" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login"
              ? <>Pas encore de compte ? <span>S'inscrire gratuitement</span></>
              : <>Déjà un compte ? <span>Se connecter</span></>}
          </p>
        </div>
      </div>
    </div>
  );
}