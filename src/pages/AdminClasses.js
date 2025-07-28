import React, { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/admin/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error("Erreur :", err));
  }, []);

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="container p-4">
        <h2>Liste des Classes</h2>
        <ul className="list-group mt-3">
          {classes.map((c, i) => (
            <li className="list-group-item" key={i}>{c.nom}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
