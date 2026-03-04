// frontend/src/components/Sidebar.js
import "../styles/sidebar.css";

export default function Sidebar({ user, onLogout, vehicleCount }) {
  return (
    <div className="sidebar-header">
      <div className="sidebar-brand">
        <span className="sidebar-brand-icon">⬡</span>
        <span className="sidebar-brand-name">FleetOS</span>
      </div>
      <div className="sidebar-meta">
        <div className="sidebar-user">
          <span className="sidebar-user-avatar">{user?.email?.[0]?.toUpperCase()}</span>
          <div className="sidebar-user-info">
            <span className="sidebar-user-email">{user?.email}</span>
            <span className="sidebar-user-role">Administrateur</span>
          </div>
        </div>
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-val">{vehicleCount}</span>
            <span className="sidebar-stat-label">Véhicules</span>
          </div>
          <div className="sidebar-stat-sep" />
          <div className="sidebar-stat">
            <span className="sidebar-stat-dot online" />
            <span className="sidebar-stat-label">En ligne</span>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          ⎋ Déconnexion
        </button>
      </div>
    </div>
  );
}