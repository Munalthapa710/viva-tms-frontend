"use client";
import { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from "xlsx";
import Pagination from "@/components/Pagination";
import { v4 as uuidv4 } from "uuid";

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
      (emp.name?.toLowerCase() || "").includes(search.toLowerCase()) &&
      (filterDep === "" || emp.department === filterDep)
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // number of employees per page

  // Compute total pages
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Slice employees to display only the current page
  const displayedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handler for changing page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  /* ================= ADD / UPDATE ================= */
  /* ================== HANDLE EDIT / ADD ================== */
  const openDrawerForAdd = () => {
    setEditingId(null);
    setImportedEmployees([]);
    setNewEmployee({ name: "", department: "", email: "", phone: "" });
    setShowDrawer(true);
  };

  const handleEditClick = (emp: Employee) => {
    setEditingId(emp.id);
    setImportedEmployees([]); // clear imported employees if editing single
    setNewEmployee({
      name: emp.name,
      department: emp.department,
      email: emp.email,
      phone: emp.phone,
    });
    setShowDrawer(true);
  };

  const handleSubmit = async () => {
  

    // BULK IMPORT MODE
    if (importedEmployees.length > 0) {
      try {
        for (const emp of importedEmployees) {
          if (!emp.name || !emp.department || !emp.email || !emp.phone) {
            toast.error("All fields are required in imported employees");
            return;
          }

          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emp),
          });
          const saved = await res.json();
          setEmployees((prev) => [...prev, saved]);
        }

        toast.success("All imported employees added successfully");
        setImportedEmployees([]);
        setShowDrawer(false);
        return;
      } catch (err) {
        console.error(err);
        toast.error("Failed to import employees");
        return;
      }
    }
      // Validate fields
    if (
      !newEmployee.name ||
      !newEmployee.department ||
      !newEmployee.email ||
      !newEmployee.phone
    ) {
      toast.error("All fields are required");
      return;
    }

    // EDIT MODE
    if (editingId !== null) {
      try {
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT", // Use PUT or PATCH depending on your API
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEmployee),
        });
        

        // Update employees state
        setEmployees((prev) =>
  prev.map((emp) =>
    String(emp.id) === String(editingId)
      ? { ...emp, ...newEmployee }
      : emp
  )
);



        toast.success("Employee updated successfully");
        setEditingId(null);
        setShowDrawer(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to update employee");
      }
    } else {
      // ADD MODE
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEmployee),
        });
        const newEmp = await res.json();
        setEmployees((prev) => [...prev, newEmp]);
        setCurrentPage(1);
        toast.success("Employee added successfully");
        setShowDrawer(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to add employee");
      }
    }
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
      .filter((emp) => emp.name && emp.department && emp.email && emp.phone)
      .map((emp) => ({
        name: emp.name,
        department: emp.department,
        email: emp.email,
        phone: emp.phone,
      }));

    if (formatted.length === 0) {
      toast.error("No valid employees found in file");
      return;
    }
    setImportedEmployees(formatted);

    toast.success(`${formatted.length} employees loaded`);
  };

  const updateImportedEmployee = (
    index: number,
    field: keyof Omit<Employee, "id">,
    value: string
  ) => {
    setImportedEmployees((prev) =>
      prev.map((emp, i) => (i === index ? { ...emp, [field]: value } : emp))
    );
  };

  const removeImportedEmployee = (index: number) => {
    setImportedEmployees((prev) => prev.filter((_, i) => i !== index));
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
        {/* top part  */}
        <div className="top flex flex-wrap items-center gap-4">
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
            className="border-2 border-gray-300 rounded-2xl px-4 py-2 outline-none ml-5"
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
              setImportedEmployees([]);
              setNewEmployee({
                name: "",
                department: "",
                email: "",
                phone: "",
              });
              setShowDrawer(true);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-2xl px-4 py-2 ml-218"
          >
            Add Employee
          </button>
        </div>

        {/* mid part */}
        <div className="mid flex flex-wrap items-center justify-between gap-4 ml-3 mt-4">
          <h6 className="text-gray-500">
            Employees ({filteredEmployees.length})
          </h6>

          {/* pagination */}
          <div className="flex ">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* table part */}
        <div className="overflow-x-auto mt-7">
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
              {displayedEmployees.length > 0 &&
                displayedEmployees.map((emp, index) => (
                  <tr key={String(emp.id)}>
                    <td className="px-4 py-3 border-b text-left">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 border-b text-left">{emp.name}</td>
                    <td className="px-4 py-3 border-b text-left">
                      {" "}
                      {emp.department}
                    </td>
                    <td className="px-4 py-3 border-b text-left">
                      {emp.email}
                    </td>
                    <td className="px-4 py-3 border-b text-left">
                      {emp.phone}
                    </td>
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
    ${showDrawer ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
          >
            <h2 className="text-xl font-semibold mb-6">
              {editingId !== null
                ? "Edit Employee"
                : importedEmployees.length > 0
                ? "Edit Imported Employees"
                : "Add Employee"}
            </h2>

            {/* Single Employee Form */}
            {importedEmployees.length === 0 && (
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
                    setNewEmployee({
                      ...newEmployee,
                      department: e.target.value,
                    })
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
            )}

            {/* Imported Employees Form */}
            {importedEmployees.length > 0 && (
              <div className="space-y-4 max-h-200 overflow-auto">
                {importedEmployees.map((emp, index) => (
                  <div
                    key={`${emp.email}-${index}`}
                    className="border rounded-xl p-4 space-y-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Employee {index + 1}
                      </span>
                      <button
                        onClick={() => removeImportedEmployee(index)}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full border rounded-xl px-4 py-2"
                      value={emp.name}
                      onChange={(e) =>
                        updateImportedEmployee(index, "name", e.target.value)
                      }
                    />

                    <select
                      className="w-full border rounded-xl px-4 py-2"
                      value={emp.department}
                      onChange={(e) =>
                        updateImportedEmployee(
                          index,
                          "department",
                          e.target.value
                        )
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
                      value={emp.email}
                      onChange={(e) =>
                        updateImportedEmployee(index, "email", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      placeholder="Phone"
                      className="w-full border rounded-xl px-4 py-2"
                      value={emp.phone}
                      onChange={(e) =>
                        updateImportedEmployee(index, "phone", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* File Upload */}
            {importedEmployees.length === 0 && (
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
            )}

            {/* Buttons */}
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
