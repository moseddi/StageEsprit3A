import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminEtudiants() {
  const [etudiants, setEtudiants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/admin/etudiants")
      .then(res => res.json())
      .then(data => setEtudiants(data))
      .catch(err => console.error("Erreur :", err));
  }, []);

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container p-4">
        <h2>Liste des Étudiants</h2>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Classe</th>
            </tr>
          </thead>
          <tbody>
            {etudiants.map((e, i) => (
              <tr key={i}>
                <td>{e.nom}</td>
                <td>{e.email}</td>
                <td>{e.classe?.nom || "Non assignée"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
