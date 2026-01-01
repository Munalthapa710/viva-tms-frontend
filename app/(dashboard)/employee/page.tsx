"use client";
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";

/* ================= TYPES ================= */
interface Employee {
  id: number;
  name: string;
  department: string;
  email: string;
  phone: string;
}

/* ================= CONFIG ================= */
const API_URL = "http://localhost:5000/employees";

export default function EmployeePage() {
  /* ================= STATE ================= */
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [filterDep, setFilterDep] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [importedEmployees, setImportedEmployees] = useState<
    Omit<Employee, "id">[]
  >([]);

  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({
    name: "",
    department: "",
    email: "",
    phone: "",
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  /* ================= READ ================= */
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data: Employee[]) => setEmployees(data))
      .catch((err) => console.error(err));
  }, []);

  /* ================= FILTER ================= */
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterDep === "" || emp.department === filterDep)
  );

  /* ================= ADD / UPDATE ================= */
const handleSubmit = async () => {
  // BULK IMPORT
  if (importedEmployees.length > 0) {
    try {
      for (const emp of importedEmployees) {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emp),
        });

        const newEmp = await res.json();
        setEmployees((prev) => [...prev, newEmp]);
      }

      toast.success("Employees imported successfully");
      setImportedEmployees([]);
      setShowDrawer(false);
      return;
    } catch {
      toast.error("Import failed");
      return;
    }
  }

  // SINGLE ADD / UPDATE (your existing logic)
  if (
    !newEmployee.name ||
    !newEmployee.department ||
    !newEmployee.email ||
    !newEmployee.phone
  ) {
    toast.error("All fields are required");
    return;
  }

  if (editingId !== null) {
    await fetch(`${API_URL}/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmployee),
    });

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === editingId ? { ...emp, ...newEmployee } : emp
      )
    );

    toast.success("Employee updated successfully");
  } else {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEmployee),
    });

    const newEmp = await res.json();
    setEmployees((prev) => [...prev, newEmp]);
    toast.success("Employee added successfully");
  }

  setNewEmployee({ name: "", department: "", email: "", phone: "" });
  setEditingId(null);
  setShowDrawer(false);
};



  const handleEditClick = (emp: Employee) => {
    setEditingId(emp.id);
    setNewEmployee({
      name: emp.name,
      department: emp.department,
      email: emp.email,
      phone: emp.phone,
    });
    setShowDrawer(true);
  };
  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      // Update UI immediately
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));

      // Success message
      toast.success("Employee deleted successfully ");

      // Auto hide message
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee");
    }
  };

  /* ================= Handle drop csv or excel  ================= */
const handleFileUpload = async (file: File) => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

  if (!jsonData.length) {
    toast.error("Empty file");
    return;
  }

  const formatted = jsonData
    .filter(
      (emp) =>
        emp.name && emp.department && emp.email && emp.phone
    )
    .map((emp) => ({
      name: emp.name,
      department: emp.department,
      email: emp.email,
      phone: emp.phone,
    }));

  setImportedEmployees(formatted);
  toast.success(`${formatted.length} employees ready to import`);
};



  /* ================= UI (UNCHANGED) ================= */
  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6">
        {successMsg && (
          <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded-xl">
            {successMsg}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center w-full max-w-xs border-2 border-gray-300 rounded-2xl px-3 py-1">
            <input
              type="text"
              placeholder="Search employee..."
              className="flex-1 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FiSearch className="text-gray-500" />
          </div>

          <select
            className="border-2 border-gray-300 rounded-2xl px-4 py-2 outline-none"
            value={filterDep}
            onChange={(e) => setFilterDep(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Database">Database</option>
            <option value="QA">QA</option>
          </select>

          <button
            onClick={() => {
              setEditingId(null);
              setNewEmployee({
                name: "",
                department: "",
                email: "",
                phone: "",
              });
              setShowDrawer(true);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-2xl px-4 py-2"
          >
            Add Employee
          </button>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="min-w-full border border-gray-200 rounded-lg border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left border-b">ID</th>
                <th className="px-4 py-2 text-left border-b">Name</th>
                <th className="px-4 py-2 text-left border-b">Department</th>
                <th className="px-4 py-2 text-left border-b">Email</th>
                <th className="px-4 py-2 text-left border-b">Phone</th>
                <th className="px-4 py-3 text-left border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp, index) => (
                <tr key={emp.id}>
                  <td className="px-4 py-3 border-b text-left">{index + 1}</td>
                  <td className="px-4 py-3 border-b text-left">{emp.name}</td>
                  <td className="px-4 py-3 border-b text-left">
                    {" "}
                    {emp.department}
                  </td>
                  <td className="px-4 py-3 border-b text-left">{emp.email}</td>
                  <td className="px-4 py-3 border-b text-left">{emp.phone}</td>
                  <td className="px-4 py-3 text-left border-b">
                    <div className="flex items-center gap-2">
                      <button
                        className="bg-gray-600  hover:bg-grey-700 text-white px-4 py-2 rounded-2xl"
                        onClick={() => {
                          handleEditClick(emp);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl px-4 py-2"
                        onClick={() => handleDelete(emp.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            showDrawer ? "visible" : "invisible"
          }`}
        >
          {/* Overlay */}
          <div
            onClick={() => setShowDrawer(false)}
            className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
              showDrawer ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Drawer */}
          <div
            className={`absolute right-0 top-0 h-full w-96 bg-white p-6 shadow-xl
      transform transition-all duration-300 ease-in-out
      ${
        showDrawer ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
          >
            <h2 className="text-xl font-semibold mb-6">
              {editingId !== null ? "Edit Employee" : "Add Employee"}
            </h2>
            

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full border rounded-xl px-4 py-2"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
              />

              <select
                className="w-full border rounded-xl px-4 py-2"
                value={newEmployee.department}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, department: e.target.value })
                }
              >
                <option value="">Select Department</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="QA">QA</option>
              </select>

              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-xl px-4 py-2"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Phone"
                className="w-full border rounded-xl px-4 py-2"
                value={newEmployee.phone}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, phone: e.target.value })
                }
              />
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFileUpload(file);
              }}
              className="mb-6 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 mt-4"
            >
              <p className="text-sm text-gray-600">
                Drag & drop CSV or Excel file here
              </p>
              <p className="text-xs text-gray-400 mt-1">(.csv, .xlsx)</p>

              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                id="fileUpload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
              <label
                htmlFor="fileUpload"
                className="inline-block mt-3 text-sm text-blue-600 cursor-pointer"
              >
                Browse file
              </label>
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
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
