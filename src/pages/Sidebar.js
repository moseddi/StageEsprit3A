import React, { useEffect, useState } from 'react';
import { FaHome, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css'; // si tu as un fichier CSS personnalisé

const Sidebar = ({ collapsed }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Remplace avec l'URL de ton backend pour récupérer l'utilisateur connecté
    axios.get('http://localhost:8081/api/users/me')
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération de l'utilisateur :", error);
      });
  }, []);

  const handleLogout = () => {
    // Logique de déconnexion ici si nécessaire
    navigate('/login');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="text-white">MonApp</h2>}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/accueil" className="sidebar-link">
          <FaHome /> {!collapsed && 'Accueil'}
        </NavLink>
        <NavLink to="/compte" className="sidebar-link">
          <FaUser /> {!collapsed && 'Mon Compte'}
        </NavLink>
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> {!collapsed && 'Déconnexion'}
        </button>
      </nav>

      {/* Profil utilisateur en bas */}
      {user && (
        <div className="sidebar-profile mt-auto text-center py-3">
          <img
            src={
              user.photo
                ? `data:image/jpeg;base64,${user.photo}`
                : '/default-user.png' // image par défaut
            }
            alt="Profil"
            className="profile-image rounded-circle"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              border: '2px solid white'
            }}
          />
          {!collapsed && (
            <p className="text-white mt-2 mb-0">{user.nom}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
