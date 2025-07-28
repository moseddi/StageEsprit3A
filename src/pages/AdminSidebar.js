import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminSidebar() {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: "220px" }}>
      <h4 className="text-center">Admin</h4>
      <ul className="nav flex-column mt-4">
        <li className="nav-item">
          <Link to="/admin" className="nav-link text-white">📊 Tableau de Bord</Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/utilisateurs" className="nav-link text-white">👥 Utilisateurs</Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/etudiants" className="nav-link text-white">👨‍🎓 Étudiants</Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/classes" className="nav-link text-white">🏫 Classes</Link>
        </li>
      </ul>
    </div>
  );
}
