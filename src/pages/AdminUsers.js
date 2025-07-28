import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/admin/utilisateurs")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Erreur :", err));
  }, []);

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container p-4">
        <h2>Liste des Utilisateurs</h2>
        <table className="table table-striped mt-3">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>{u.nom}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
