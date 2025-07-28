import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, Users, FileText, List } from "lucide-react";

export default function AdminSidebarLayout() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: <Home size={20} /> },
    { name: "Étudiants", path: "/admin/etudiants", icon: <Users size={20} /> },
    { name: "Classes", path: "/admin/classes", icon: <List size={20} /> },
    { name: "Formulaires", path: "/admin/formulaires", icon: <FileText size={20} /> },
    { name: "Questions", path: "/admin/questions", icon: <FileText size={20} /> },
    { name: "Utilisateurs", path: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="bg-gray-900 text-white" style={{ width: "220px", padding: "1rem" }}>
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              aria-current={location.pathname === item.path ? "page" : undefined}
              className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                location.pathname === item.path ? "bg-indigo-600" : "hover:bg-gray-700"
              }`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-grow-1 p-4" style={{ overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
