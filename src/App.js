import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from './pages/Login';
import Accueil from "./pages/Accueil";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Compte from "./pages/Compte";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminEtudiants from "./pages/AdminEtudiants";
import AdminClasses from "./pages/AdminClasses";
import Apropos from "./pages/Apropos";
function App() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/apropos" element={<Apropos />} />
        {/* Routes protégées */}
        <Route
          path="/accueil"
          element={isAuthenticated ? <Accueil /> : <Navigate to="/" />}
        />
        <Route
          path="/compte"
          element={isAuthenticated ? <Compte /> : <Navigate to="/" />}
        />

        {/* Tableau de bord Admin (protégé) */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/" />}
        />

        {/* Autres routes admin protégées */}
        <Route
          path="/admin/utilisateurs"
          element={isAuthenticated ? <AdminUsers /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/etudiants"
          element={isAuthenticated ? <AdminEtudiants /> : <Navigate to="/" />}
        />
        <Route
          path="/admin/classes"
          element={isAuthenticated ? <AdminClasses /> : <Navigate to="/" />}
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
