# FleetOS — Système de Suivi de Flotte avec Géolocalisation

> Projet SIG · EIT3 — Application web complète de gestion et visualisation de flotte de véhicules en temps réel.

---

## Table des matières

1. [Aperçu](#aperçu)
2. [Stack technique](#stack-technique)
3. [Architecture du projet](#architecture-du-projet)
4. [Prérequis](#prérequis)
5. [Installation](#installation)
6. [Base de données](#base-de-données)
7. [API Reference](#api-reference)
8. [Fonctionnalités](#fonctionnalités)
9. [PostGIS — Fonctions utilisées](#postgis--fonctions-utilisées)

---

## Aperçu

FleetOS est une application web permettant de :
- Gérer une flotte de véhicules (CRUD complet)
- Enregistrer et visualiser les positions GPS sur une carte interactive
- Afficher l'historique des trajets sous forme de polylines
- Effectuer des recherches géographiques (rayon, véhicule le plus proche)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, React Leaflet, Axios |
| Backend | Node.js, Express 4 |
| Base de données | PostgreSQL 14 + PostGIS 3 |
| Authentification | bcrypt (hachage mot de passe) |
| Carte | Leaflet.js + tuiles CARTO Light |

---

## Architecture du projet
```
FleetProject/
├── backend/
│   ├── app.js                     # Point d'entrée Express
│   ├── db.js                      # Connexion PostgreSQL (pg Pool)
│   ├── routes/
│   │   ├── authRoutes.js          # POST /register, /login
│   │   ├── vehicleRoutes.js       # GET/POST/PUT/DELETE /vehicles
│   │   └── positionRoutes.js      # GET/POST /positions + recherche géo
│   ├── controllers/
│   │   ├── authController.js      # Validation HTTP → authService
│   │   ├── vehicleController.js   # Validation HTTP → vehicleService
│   │   └── positionController.js  # Validation HTTP → positionService
│   └── services/
│       ├── authService.js         # Logique inscription/connexion + bcrypt
│       ├── vehicleService.js      # Requêtes SQL CRUD véhicules
│       └── positionService.js     # Requêtes PostGIS positions + géo-search
│
└── frontend/src/
    ├── App.js                     # Layout principal + état global
    ├── Auth.js                    # Page de connexion / inscription
    ├── styles/
    │   ├── app.css                # Styles globaux + variables CSS
    │   ├── auth.css               # Styles page auth
    │   └── sidebar.css            # Styles sidebar
    └── components/
        ├── Sidebar.js             # Header avec infos utilisateur
        ├── VehicleTab.js          # CRUD véhicules
        ├── PositionTab.js         # Enregistrement + historique GPS
        ├── GeoSearchTab.js        # Recherche géographique
        └── MapView.js             # Carte Leaflet interactive
```

### Flux de données (Architecture 3 couches)
```
HTTP Request
    ↓
  Routes          (validation de l'URL, montage du middleware)
    ↓
  Controllers     (validation des entrées, gestion des erreurs HTTP)
    ↓
  Services        (logique métier, requêtes SQL/PostGIS)
    ↓
  PostgreSQL + PostGIS
```

---

## Prérequis

- **Node.js** v18+
- **npm** v9+
- **PostgreSQL** v14+ avec l'extension **PostGIS** v3+
- **pgAdmin** (optionnel, pour administrer la base)

---

## Installation

### 1. Cloner le projet
```bash
git clone https://github.com/assitasylla086-hue/FleetProject.git
cd FleetProject
```

### 2. Backend
```bash
cd backend
npm install
node app.js
# → Server running on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## Base de données

### Création (pgAdmin ou psql)
```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id       SERIAL PRIMARY KEY,
  email    VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE vehicles (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  plate_number VARCHAR(50)  NOT NULL
);

CREATE TABLE positions (
  id         SERIAL PRIMARY KEY,
  vehicle_id INTEGER REFERENCES vehicles(id),
  location   GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_positions_location
  ON positions USING GIST(location);

CREATE INDEX idx_positions_vehicle_id
  ON positions(vehicle_id);
```

---

## API Reference

### Authentification

| Méthode | Endpoint | Corps | Description |
|---------|----------|-------|-------------|
| POST | `/api/auth/register` | `{ email, password }` | Créer un compte |
| POST | `/api/auth/login` | `{ email, password }` | Se connecter |

### Véhicules

| Méthode | Endpoint | Corps | Description |
|---------|----------|-------|-------------|
| GET | `/api/vehicles` | — | Liste tous les véhicules |
| POST | `/api/vehicles` | `{ name, plate_number }` | Créer un véhicule |
| PUT | `/api/vehicles/:id` | `{ name, plate_number }` | Modifier un véhicule |
| DELETE | `/api/vehicles/:id` | — | Supprimer (+ positions liées) |

### Positions GPS

| Méthode | Endpoint | Paramètres | Description |
|---------|----------|------------|-------------|
| GET | `/api/positions` | — | Toutes les positions |
| POST | `/api/positions` | `{ vehicle_id, latitude, longitude }` | Enregistrer une position |
| GET | `/api/positions/search/radius` | `?latitude=&longitude=&radius_km=` | Véhicules dans un rayon |
| GET | `/api/positions/search/nearest` | `?latitude=&longitude=` | Véhicule le plus proche |

---

## Fonctionnalités

### ✅ Authentification
- Inscription avec hachage bcrypt (10 rounds)
- Connexion avec vérification du hash
- Validation des champs côté backend et frontend

### ✅ CRUD Véhicules
- Création, lecture, modification inline, suppression
- Suppression en cascade des positions liées
- Validation de l'ID avant chaque opération

### ✅ Positions GPS
- Enregistrement manuel ou via navigator.geolocation
- Historique filtrable par véhicule

### ✅ Carte interactive
- Marqueurs colorés par véhicule
- Polylines de trajets
- Clic pour centrer la carte
- Légende interactive

### ✅ Recherche géographique
- Dans un rayon : ST_DWithin avec rayon configurable en km
- Véhicule le plus proche : opérateur KNN exploitant l'index GIST

---

## PostGIS — Fonctions utilisées

| Fonction / Opérateur | Utilisation |
|----------------------|-------------|
| `ST_SetSRID(ST_Point(lng, lat), 4326)` | Création d'un point GPS en WGS84 |
| `ST_X(location::geometry)` | Extraction de la longitude |
| `ST_Y(location::geometry)` | Extraction de la latitude |
| `ST_DWithin(geog1, geog2, metres)` | Filtre dans un rayon |
| `ST_Distance(geog1, geog2)` | Distance exacte en mètres |
| `location <-> point` | Tri KNN rapide |
| `USING GIST(location)` | Index spatial |
| `GEOGRAPHY(POINT, 4326)` | Stockage natif PostGIS |

---

## Auteur

Projet réalisé dans le cadre du cours **Systèmes d'Information Géographique — EIT3**.  
**SYLLA Assita** — INP-HB · TS-STIC3 EIT