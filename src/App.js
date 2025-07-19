import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Accueil from "./pages/Accueil";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Compte from "./pages/Compte";
function App() {
  const isAuthenticated = !!localStorage.getItem("userEmail");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ← ajouter cette route */}
        <Route path="/compte" element={<Compte />} />
        <Route
          path="/Accueil"
          element={isAuthenticated ? <Accueil /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}
export default App;
