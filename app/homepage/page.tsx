"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Employee {
  id: number;
  department: string;
}

const API_URL = "http://localhost:5000/employees";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; value: number }[]
  >([]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: Employee[]) => {
        setEmployees(data);

        // Count employees per department
        const departmentCounts = data.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to chart format
        const formattedChartData = Object.entries(departmentCounts).map(
          ([dept, count]) => ({
            name: dept,
            value: count,
          })
        );

        setChartData(formattedChartData);
      })
      .catch((err) => console.error("Failed to fetch employees", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Dashboard</h1>

      {/* Employee Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center">
          <span className="text-gray-400">Total Employees</span>
          <span className="text-2xl font-bold text-gray-700">
            {employees.length}
          </span>
        </div>

        {chartData.map((item) => (
          <div
            key={item.name}
            className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center"
          >
            <span className="text-gray-400">{item.name} Employees</span>
            <span className="text-2xl font-bold text-gray-700">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Department Workflow
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
