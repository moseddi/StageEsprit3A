import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name: "Jan", formulaires: 10 },
  { name: "Fév", formulaires: 20 },
  { name: "Mar", formulaires: 30 },
  { name: "Avr", formulaires: 15 },
  { name: "Mai", formulaires: 25 },
];

export default function GraphCard({ title = "Statistiques des formulaires" }) {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-4">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="formulaires" stroke="#4F46E5" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
