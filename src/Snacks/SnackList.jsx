import React, { useEffect, useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useSnacks } from "../context/SnacksContext";
import "../App.css";
import Navigation from "../component/Navigation";
import { toast } from "react-toastify";

function SnackList() {
  const { snacks, fetchSnacks, loading } = useSnacks();
  const [editingId, setEditingId] = useState(null);
  const [editSnack, setEditSnack] = useState({
    name: "",
    quantity: "",
    price: "",
  });

  useEffect(() => {
    fetchSnacks();
  }, []);

  // 🟢 New state for re-stock (additional quantity)
  const [addStock, setAddStock] = useState();
  const [search, setSearch] = useState("");

  const handleEdit = (snack) => {
    setEditingId(snack.id);
    setEditSnack(snack);
    setAddStock("");
  };

  const handleSave = async () => {
    const snackRef = doc(db, "snacks", editingId);

    // If user entered addStock, add it to existing quantity
    const newQuantity = Number(editSnack.quantity) + Number(addStock || 0);

    await updateDoc(snackRef, {
      name: editSnack.name,
      quantity: newQuantity,
      price: Number(editSnack.price),
    });

    toast.success(`${editSnack.name} updated!`);
    await fetchSnacks();
    setEditingId(null);
    setAddStock(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this snack?")) {
      await deleteDoc(doc(db, "snacks", id));
      toast.success("Snack deleted!");
      await fetchSnacks();
    }
  };

  const filteredSnacks = [...snacks]
    .filter((snack) => snack.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      }),
    );

  return (
    <div>
      <Navigation />

      {loading ? (
        <div className="inner-loading">
          <div className="inner-spinner"></div>
          <p className="loading-text">Loading Snacks...</p>
        </div>
      ) : (
        <div>
          <h2 className="page-title">Snack List</h2>
          <div className="snack-search-wrapper">
            <input
              type="text"
              className="snack-search"
              placeholder="Search snacks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="snack-table-container">
            <table className="snack-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Add Stock</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSnacks.map((snack) => (
                  <tr key={snack.id}>
                    {editingId === snack.id ? (
                      <>
                        <td>
                          <input
                            value={editSnack.name}
                            onChange={(e) =>
                              setEditSnack({
                                ...editSnack,
                                name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editSnack.quantity}
                            style={{ backgroundColor: "#f2f2f2" }}
                            onChange={(e) =>
                              setEditSnack({
                                ...editSnack,
                                quantity: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Add amount"
                            value={addStock}
                            onChange={(e) => setAddStock(e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editSnack.price}
                            onChange={(e) =>
                              setEditSnack({
                                ...editSnack,
                                price: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <button className="save-btn" onClick={handleSave}>
                            Save
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{snack.name}</td>
                        <td>{snack.quantity}</td>
                        <td>-</td>
                        <td>{snack.price}</td>
                        <td>
                          <button
                            className="edit-snack"
                            onClick={() => handleEdit(snack)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-snack"
                            onClick={() => handleDelete(snack.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SnackList;
