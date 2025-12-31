"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

interface Group {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  quantity: number;
}

export default function InventoryPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [groupName, setGroupName] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingGroupName, setEditingGroupName] = useState("");

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemQty, setEditingItemQty] = useState(1);

  /* ================= FETCH GROUPS ================= */
  useEffect(() => {
    fetch("http://localhost:5000/inventory/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data));
  }, []);

  /* ================= FETCH ITEMS ================= */
  useEffect(() => {
    if (!selectedGroup) return;

    fetch(`http://localhost:5000/inventory/items/${selectedGroup.id}`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, [selectedGroup]);

  /* ================= ADD GROUP ================= */
  const addGroup = async () => {
    if (!groupName.trim()) return;

    const res = await fetch("http://localhost:5000/inventory/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: groupName }),
    });

    const newGroup: Group = await res.json();
    setGroups((prev) => [...prev, newGroup]);
    setGroupName("");

    toast.success("Group added");
  };

  /* ================= EDIT GROUP ================= */
  const saveEditGroup = async (id: number) => {
    await fetch(`http://localhost:5000/inventory/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingGroupName }),
    });

    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: editingGroupName } : g))
    );

    if (selectedGroup?.id === id) {
      setSelectedGroup({ ...selectedGroup, name: editingGroupName });
    }

    setEditingGroupId(null);
    toast.success("Group updated");
  };

  /* ================= DELETE GROUP ================= */
  const deleteGroup = async (id: number) => {
    if (!confirm("Delete this group?")) return;

    await fetch(`http://localhost:5000/inventory/groups/${id}`, {
      method: "DELETE",
    });

    setGroups((prev) => prev.filter((g) => g.id !== id));

    if (selectedGroup?.id === id) {
      setSelectedGroup(null);
      setItems([]);
      setEditingItemId(null);
    }

    toast.success("Group deleted");
  };

  /* ================= ADD ITEM ================= */
  const addItem = async () => {
    if (!itemName || !selectedGroup) return;

    await fetch("http://localhost:5000/inventory/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: selectedGroup.id,
        name: itemName,
        quantity: Math.max(0, quantity),
      }),
    });

    const res = await fetch(
      `http://localhost:5000/inventory/items/${selectedGroup.id}`
    );
    const data = await res.json();
    setItems(data);

    setItemName("");
    setQuantity(1);

    toast.success("Item added");
  };

  /* ================= EDIT ITEM ================= */
  const saveEditItem = async (id: number) => {
    await fetch(`http://localhost:5000/inventory/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingItemName,
        quantity: Math.max(0, editingItemQty),
      }),
    });

    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, name: editingItemName, quantity: editingItemQty }
          : i
      )
    );

    setEditingItemId(null);
    toast.success("Item updated");
  };

  /* ================= DELETE ITEM ================= */
  const deleteItem = async (id: number) => {
    if (!confirm("Delete this item?")) return;

    await fetch(`http://localhost:5000/inventory/items/${id}`, {
      method: "DELETE",
    });

    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item deleted");
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-6 grid grid-cols-12 gap-6 ">
        {/* GROUPS */}
        <div className="col-span-4 bg-white rounded-2xl shadow p-5 ">
          <h2 className="text-xl font-semibold mb-4">Inventory Groups</h2>

          <div className="flex gap-2 mb-4">
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="New group name"
              className="flex-1 border rounded-xl px-3 py-2"
            />
            <button
              onClick={addGroup}
              className="bg-gray-700 text-white px-4 rounded-xl hover:bg-gray-900"
            >
              <FiPlus />
            </button>
          </div>

          <ul className="space-y-2">
            {groups.map((g) => (
              <li
                key={g.id}
                className={`p-3 rounded-xl flex justify-between ${
                  selectedGroup?.id === g.id
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100"
                }`}
              >
                {editingGroupId === g.id ? (
                  <input
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    className="flex-1 text-black px-2"
                  />
                ) : (
                  <span
                    onClick={() => setSelectedGroup(g)}
                    className="cursor-pointer flex-1"
                  >
                    {g.name}
                  </span>
                )}

                <div className="flex gap-2">
                  {editingGroupId === g.id ? (
                    <>
                      <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                        <FiCheck onClick={() => saveEditGroup(g.id)} />
                      </div>
                      <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                        <FiX onClick={() => setEditingGroupId(null)} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                        <FiEdit2
                          onClick={() => {
                            setEditingGroupId(g.id);
                            setEditingGroupName(g.name);
                          }}
                        />
                      </div>
                      <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                        <FiTrash2 onClick={() => deleteGroup(g.id)} />
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* ITEMS */}
        <div className="col-span-8 bg-white rounded-2xl shadow p-5">
          {selectedGroup ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Items – {selectedGroup.name}
              </h2>

              <div className="flex gap-3 mb-6">
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Product name"
                  className="flex-1 border rounded-xl px-3 py-2"
                />
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, +e.target.value))}
                  className="w-24 border rounded-xl px-3 py-2"
                />
                <button
                  onClick={addItem}
                  className="bg-gray-700 text-white px-6 rounded-xl"
                >
                  Add
                </button>
              </div>

              <table className="w-full border rounded-xl">
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-t">
                      <td className="p-3">
                        {editingItemId === i.id ? (
                          <input
                            value={editingItemName}
                            onChange={(e) => setEditingItemName(e.target.value)}
                            className="border px-2 rounded"
                          />
                        ) : (
                          i.name
                        )}
                      </td>

                      <td className="p-3">
                        {editingItemId === i.id ? (
                          <input
                            type="number"
                            value={editingItemQty}
                            onChange={(e) =>
                              setEditingItemQty(Math.max(0, +e.target.value))
                            }
                            className="border px-2 rounded w-20"
                          />
                        ) : (
                          i.quantity
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          {editingItemId === i.id ? (
                            <>
                              <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                                <FiCheck onClick={() => saveEditItem(i.id)} />
                              </div>
                              <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                                <FiX onClick={() => setEditingItemId(null)} />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                                <FiEdit2
                                  onClick={() => {
                                    setEditingItemId(i.id);
                                    setEditingItemName(i.name);
                                    setEditingItemQty(i.quantity);
                                  }}
                                />
                              </div>
                              <div className="border rounded p-1 cursor-pointer hover:bg-gray-200">
                                <FiTrash2 onClick={() => deleteItem(i.id)} />
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-20">
              Select a group to manage items
            </p>
          )}
        </div>
      </div>
    </>
  );
}
