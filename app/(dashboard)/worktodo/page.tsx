"use client";

import { useEffect, useState } from "react";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";

type Priority = "Immediate" | "High" | "Medium" | "Low";

interface WorkTodo {
  id: number;
  title: string;
  priority: Priority;
  deadline: string;
}

const API_URL = "http://localhost:5000/worktodo";

export default function Page() {
  const [todos, setTodos] = useState<WorkTodo[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [deadline, setDeadline] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const fetchTodos = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const submitTodo = async () => {
    if (!title || !deadline) {
      toast.error("All fields required");
      return;
    }

    const payload = { title, priority, deadline };

    if (editId) {
      await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Updated");
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast.success("Added");
    }

    setTitle("");
    setPriority("Medium");
    setDeadline("");
    setEditId(null);
    fetchTodos();
  };

  const editTodo = (t: WorkTodo) => {
    setTitle(t.title);
    setPriority(t.priority);
    setDeadline(t.deadline);
    setEditId(t.id);
  };

  const deleteTodo = async (id: number) => {
    if (!confirm("Delete this work?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    fetchTodos();
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Work To-Do</h1>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            className="border px-3 py-2 rounded-2xl "
            placeholder="Work title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="border px-3 py-2 rounded-2xl"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option>Immediate</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <input
            type="date"
            className="border px-3 py-2 rounded-2xl"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <button
            onClick={submitTodo}
            className={`${
              editId ? "bg-green-500" : "bg-gray-500"
            } text-white  rounded-2xl`}
          >
            {editId ? "Update" : "Add"}
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {todos.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center border p-4 rounded-2xl  hover:bg-gray-300"
            >
              <div>
                <p className="font-medium">{t.title}</p>
                <p className="text-sm text-gray-500">
                  Deadline: {t.deadline}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded bg-gray-100 text-sm">
                  {t.priority}
                </span>

                <button onClick={() => editTodo(t)}>
                  <AiOutlineEdit />
                </button>

                <button onClick={() => deleteTodo(t.id)}>
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
