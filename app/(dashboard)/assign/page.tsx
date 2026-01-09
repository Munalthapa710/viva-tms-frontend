"use client";

import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

/* TYPES */
interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
  phone: string;
}

interface Task {
  id: number;
  title: string;
  employeeId: number;
  dueDate: string;
}

/* CONFIG */
const EMPLOYEE_API = "http://localhost:5000/employees";

export default function AssignPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [sentEmails, setSentEmails] = useState<number[]>([]);
  const [sentTasks, setSentTasks] = useState<number[]>([]);

  const handleSendEmail = async (task: Task) => {
    const employee = employees.find((e) => e.id === task.employeeId);
    if (!employee) return;

    try {
      const res = await fetch("http://localhost:5000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          taskTitle: task.title,
          dueDate: task.dueDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        // Update DB email status
        await fetch(`http://localhost:5000/tasks/${task.id}/email-sent`, {
          method: "PATCH",
        });
        setSentTasks((prev) => [...prev, task.id]); // mark as sent in frontend
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to send email");
    }
  };

 const [newTask, setNewTask] = useState<{
  id?: number;
  title: string;
  employeeId: string;
  dueDate: string;
}>({
  title: "",
  employeeId: "",
  dueDate: "",
});


  /* FETCH EMPLOYEES */
  useEffect(() => {
    fetch(EMPLOYEE_API)
      .then((res) => res.json())
      .then(setEmployees)
      .catch(console.error);
  }, []);

  // FETCH TASKS FROM BACKEND =================
  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        // Also mark sent tasks in frontend
        const sentIds = data
          .filter((t: any) => t.emailSent)
          .map((t: any) => t.id);
        setSentTasks(sentIds);
      })
      .catch(console.error);
  }, []);

  /* FILTER EMPLOYEE */
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  /* SELECT EMPLOYEE */
  const handleSelectEmployee = (emp: Employee) => {
    setNewTask({ ...newTask, employeeId: emp.id.toString() });
    setShowDrawer(true);
    setSearch(emp.name);
  };

  /* SUBMIT TASK */
  const handleSubmit = async () => {
  if (!newTask.title || !newTask.employeeId || !newTask.dueDate) {
    toast.error("All fields are required");
    return;
  }

  try {
    // ✅ UPDATE MODE
    if (newTask.id) {
      const res = await fetch(
        `http://localhost:5000/tasks/${newTask.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTask.title,
            employeeId: Number(newTask.employeeId),
            dueDate: newTask.dueDate,
          }),
        }
      );

      if (!res.ok) throw new Error();

      setTasks((prev) =>
        prev.map((task) =>
          task.id === newTask.id
            ? { ...task, ...newTask, employeeId: Number(newTask.employeeId) }
            : task
        )
      );

      toast.success("Task updated successfully!");
    }

    // ✅ CREATE MODE
    else {
      const res = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          employeeId: Number(newTask.employeeId),
          dueDate: newTask.dueDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error();

      setTasks((prev) => [...prev, data]);
      toast.success("Task assigned successfully!");
    }

    // reset
    setNewTask({ title: "", employeeId: "", dueDate: "" });
    setShowDrawer(false);
    setSearch("");
  } catch (err) {
    toast.error("Something went wrong");
  }
};


const handleEditClick = (task: Task) => {
  setNewTask({
    id: task.id,
    title: task.title,
    employeeId: task.employeeId.toString(),
    dueDate: task.dueDate,
  });

  setShowDrawer(true);
};


  const handleDeleteClick = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="p-6">
        {/* SEARCH BAR */}
        <div className="relative w-full max-w-md">
          <div className="flex items-center border-2 rounded-2xl px-3 py-2">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search employee..."
              className="flex-1 ml-2 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* DROPDOWN RESULTS */}
          {search && (
            <div className="absolute bg-white border w-full mt-1 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
              {filteredEmployees.length === 0 && (
                <p className="p-3 text-gray-500">No employees found</p>
              )}

              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => handleSelectEmployee(emp)}
                  className="p-3 cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.department}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TASK LIST */}
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left border-b">S.N</th>
                <th className="px-4 py-3 text-left border-b">Employee</th>
                <th className="px-4 py-3 text-left border-b">Task</th>
                <th className="px-4 py-3 text-left border-b">Due Date</th>
                <th className="px-4 py-3 text-left border-b">Send Mail</th>
                <th className="px-4 py-3 text-left border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => {
                const emp = employees.find((e) => e.id === task.employeeId);
                return (
                  <tr key={task.id}>
                    <td className="px-4 py-3 border-b text-left">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 border-b text-left">
                      {emp?.name}
                    </td>
                    <td className="px-4 py-3 border-b text-left">
                      {task.title}
                    </td>
                    <td className="px-4 py-3 border-b text-left">
                      {task.dueDate}
                    </td>
                    <td className="px-4 py-3 border-b text-left">
                      <button
                        disabled={sentTasks.includes(task.id)} // disable if email sent
                        onClick={() => handleSendEmail(task)}
                        className={`px-4 py-2 rounded-2xl text-white ${
                          sentTasks.includes(task.id)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {sentTasks.includes(task.id) ? "Sent" : "Send"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-left border-b">
                      <div className="flex items-center gap-2">
                        {/* <button
                          onClick={() => handleEditClick(task)}
                          className="px-3 py-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Edit
                        </button> */}
                        <button
                          onClick={() => handleDeleteClick(task.id)}
                          className="px-3 py-1 rounded-xl bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* DRAWER */}
        <div
          className={`fixed inset-0 z-50 ${
            showDrawer ? "visible" : "invisible"
          }`}
        >
          <div
            onClick={() => setShowDrawer(false)}
            className={`absolute inset-0 bg-black/30 transition-opacity ${
              showDrawer ? "opacity-100" : "opacity-0"
            }`}
          />

          <div
            className={`absolute right-0 top-0 h-full w-96 bg-white p-6 shadow-xl
            transition-transform duration-300
            ${showDrawer ? "translate-x-0" : "translate-x-full"}`}
          >
            <h2 className="text-xl font-semibold mb-6">Assign Task</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                className="w-full border rounded-xl px-4 py-2"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />

              <select
                className="w-full border rounded-xl px-4 py-2"
                value={newTask.employeeId}
                onChange={(e) =>
                  setNewTask({ ...newTask, employeeId: e.target.value })
                }
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.department})
                  </option>
                ))}
              </select>

              <input
                type="date"
                className="w-full border rounded-xl px-4 py-2"
                value={newTask.dueDate}
                onChange={(e) =>
                  setNewTask({ ...newTask, dueDate: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-xl bg-gray-700 text-white"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
