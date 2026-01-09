"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/* TYPES */
interface Employee {
  id: number;
  department: string;
}

interface Task {
  id: number;
  title: string;
  employeeId: number;
  dueDate: string;
  emailSent: boolean;
}

/* API */
const EMPLOYEE_API = "http://localhost:5000/employees";
const TASK_API = "http://localhost:5000/tasks";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042","red"];

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; value: number }[]
  >([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  /* FETCH EMPLOYEES */
  useEffect(() => {
    fetch(EMPLOYEE_API)
      .then((res) => res.json())
      .then((data: Employee[]) => {
        setEmployees(data);

        // Department count logic (YOUR ORIGINAL)
        const departmentCounts = data.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

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

  /* FETCH TASKS */
  useEffect(() => {
    fetch(TASK_API)
      .then((res) => res.json())
      .then((data: Task[]) => setTasks(data))
      .catch((err) => console.error("Failed to fetch tasks", err));
  }, []);

  /* TASK STATS */
  const pendingTasks = tasks.filter((t) => !t.emailSent).length;
  const completedTasks = tasks.filter((t) => t.emailSent).length;

  const taskChartData = [
    { name: "Pending", value: pendingTasks },
    { name: "Completed", value: completedTasks },
  ];
 const totalTasks = tasks.length;
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        Dashboard
      </h1>

      {/* EMPLOYEE COUNTERS */}
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

      {/* PIE CHART */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-10">
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

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <p className="text-gray-400">Total Tasks</p>
          <p className="text-3xl font-bold">{totalTasks}</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <p className="text-gray-400">Pending Tasks</p>
          <p className="text-3xl font-bold text-orange-500">
            {pendingTasks}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-6 text-center">
          <p className="text-gray-400">Emails Sent</p>
          <p className="text-3xl font-bold text-green-600">
            {completedTasks}
          </p>
        </div>
        </div>
      {/* TASK BAR CHART (NEW) */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">
          Task Status Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
