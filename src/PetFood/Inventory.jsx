// src/PetFood/Inventory.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import Navigation from "../component/Navigation";
import { useItems } from "../context/ItemsContext";
import { toast } from "react-toastify";
import "../App.css";

function InventoryContent() {
  const { setItems, fetchItems, fetching, getSortedAndFilteredItems } =
    useItems();
  const [nameFilter, setNameFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItem, setModalItem] = useState(null); // item being edited

  useEffect(() => {
    fetchItems();
  }, []);

  // Items displayed after filtering/sorting locally
  const displayedItems = getSortedAndFilteredItems({
    nameFilter,
    sortField,
    sortOrder,
  });

  // Group filtered/sorted items by brand (keep zero quantity items)
  const groupedItems = displayedItems.reduce((acc, item) => {
    const brand = item.brand || "Unknown Brand";
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(item);
    return acc;
  }, {});

  const formatNum = (num) =>
    num || num === 0 ? Number(num).toLocaleString("en-US") : 0;

  // Open edit modal for given item
  const openEditModal = (item) => {
    setModalItem({ ...item }); // clone to edit locally
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalItem(null);
    setModalOpen(false);
  };

  // Save changes from modal (updateDoc + update local state)
  const handleSaveItem = async (updated) => {
    try {
      const itemRef = doc(db, "items", updated.id);
      // prepare object to update - only include fields you allow
      const toUpdate = {
        name: updated.name,
        brand: updated.brand,
        code: updated.code,
        purchasePrice: Number(updated.purchasePrice) || 0,
        unitPrice: Number(updated.unitPrice) || 0,
        quantity: Number(updated.quantity) || 0,
        inventoryDate: updated.inventoryDate || null,
        expiryDate: updated.expiryDate || null,
      };
      await updateDoc(itemRef, toUpdate);
      setItems((prev) =>
        prev.map((i) => (i.id === updated.id ? { ...i, ...toUpdate } : i))
      );
      toast.success(`"${updated.name}" updated`);
      closeModal();
    } catch (err) {
      console.error("Failed to save item:", err);
      toast.error("Failed to save item.");
    }
  };

  // Delete item
  const handleDeleteItem = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );
    if (!confirmed) return;
    try {
      const itemRef = doc(db, "items", item.id);
      await deleteDoc(itemRef);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success(`"${item.name}" deleted`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      toast.error("Failed to delete item.");
    }
  };

  // Small helper to render "Out of Stock" badge
  const renderQty = (q) => {
    if (Number(q) === 0) {
      return (
        <span className="out-of-stock">
          0 <span className="badge">Out of stock</span>
        </span>
      );
    }
    return formatNum(q);
  };

  return (
    <div>
      <Navigation />
      <h2 className="page-title">Inventory</h2>

      {fetching ? (
        <div className="inner-loading">
          <div className="inner-spinner"></div>
          <p className="loading-text">Loading Items...</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            <input
              placeholder="Search Item Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="form-input"
              style={{ width: "220px" }}
            />
            <select
              onChange={(e) => setSortField(e.target.value)}
              value={sortField}
              className="form-input"
              style={{ width: "170px" }}
            >
              <option value="">Sort by...</option>
              <option value="quantity">Quantity</option>
              <option value="expiryDate">Expiry Date</option>
            </select>
            <select
              onChange={(e) => setSortOrder(e.target.value)}
              value={sortOrder}
              className="form-input"
              style={{ width: "150px" }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          {/* If no items found after filter */}
          {displayedItems.length === 0 ? (
            <div className="no-results">No items found.</div>
          ) : (
            // Brand sections
            Object.entries(groupedItems).map(([brand, itemsForBrand]) => (
              <div key={brand} className="brand-section">
                <div className="brand-header">
                  <h3>{brand}</h3>
                  <div className="brand-meta">
                    <span>{itemsForBrand.length} items</span>
                    <span style={{ marginLeft: 12 }}>
                      Total Qty:{" "}
                      {formatNum(
                        itemsForBrand.reduce(
                          (s, it) => s + (Number(it.quantity) || 0),
                          0
                        )
                      )}
                    </span>
                  </div>
                </div>

                <div className="table-container">
                  <table className="inventory-table grouped">
                    <thead>
                      <tr>
                        <th>Sr. No.</th>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Purchase Price</th>
                        <th>Sales Price</th>

                        <th>Inventory Date</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsForBrand.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={
                            Number(item.quantity) === 0
                              ? "out-row"
                              : idx % 2
                              ? "even-row"
                              : ""
                          }
                        >
                          <td>{idx + 1}</td>
                          <td>{item.code}</td>
                          <td>{item.name}</td>
                          <td style={{ textAlign: "center" }}>
                            {renderQty(item.quantity)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {formatNum(item.purchasePrice)}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {formatNum(item.unitPrice)}
                          </td>

                          <td style={{ textAlign: "center" }}>
                            {item.inventoryDate || "-"}
                          </td>
                          <td
                            style={{
                              textAlign: "center",
                              color:
                                item.expiryDate &&
                                new Date(item.expiryDate) - new Date() <=
                                  1000 * 60 * 60 * 24 * 30
                                  ? "red"
                                  : "inherit",
                            }}
                          >
                            {item.expiryDate || "-"}
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                justifyContent: "center",
                              }}
                            >
                              <button
                                className="table-button edit"
                                onClick={() => openEditModal(item)}
                              >
                                Edit
                              </button>
                              <button
                                className="table-button delete"
                                onClick={() => handleDeleteItem(item)}
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
              </div>
            ))
          )}
        </>
      )}
      {/* Edit Modal */}
      {modalOpen && modalItem && (
        <div className="modal-backdrop" onMouseDown={closeModal}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Item</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <label className="form-label">
                Brand
                <input
                  className="form-input"
                  value={modalItem.brand || ""}
                  onChange={(e) =>
                    setModalItem((s) => ({ ...s, brand: e.target.value }))
                  }
                />
              </label>

              <label className="form-label">
                Item Name
                <input
                  className="form-input"
                  value={modalItem.name || ""}
                  onChange={(e) =>
                    setModalItem((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </label>

              <label className="form-label">
                Code
                <input
                  className="form-input"
                  value={modalItem.code || ""}
                  onChange={(e) =>
                    setModalItem((s) => ({ ...s, code: e.target.value }))
                  }
                />
              </label>

              <div style={{ display: "flex", gap: 8 }}>
                <label className="form-label" style={{ flex: 1 }}>
                  Purchase Price
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={modalItem.purchasePrice ?? ""}
                    onChange={(e) =>
                      setModalItem((s) => ({
                        ...s,
                        purchasePrice: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="form-label" style={{ flex: 1 }}>
                  Sales Price
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={modalItem.unitPrice ?? ""}
                    onChange={(e) =>
                      setModalItem((s) => ({ ...s, unitPrice: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <label className="form-label" style={{ flex: 1 }}>
                  Quantity
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={modalItem.quantity ?? 0}
                    onChange={(e) =>
                      setModalItem((s) => ({ ...s, quantity: e.target.value }))
                    }
                  />
                </label>

                <label className="form-label" style={{ flex: 1 }}>
                  Inventory Date
                  <input
                    type="date"
                    className="form-input"
                    value={modalItem.inventoryDate || ""}
                    onChange={(e) =>
                      setModalItem((s) => ({
                        ...s,
                        inventoryDate: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="form-label">
                Expiry Date
                <input
                  type="date"
                  className="form-input"
                  value={modalItem.expiryDate || ""}
                  onChange={(e) =>
                    setModalItem((s) => ({ ...s, expiryDate: e.target.value }))
                  }
                />
              </label>
            </div>

            <div className="modal-footer">
              <button
                className="bton btn-danger"
                onClick={async () => {
                  // Delete from modal with confirmation
                  const confirmed = window.confirm(
                    `Delete "${modalItem.name}" permanently?`
                  );
                  if (!confirmed) return;
                  try {
                    await deleteDoc(doc(db, "items", modalItem.id));
                    setItems((prev) =>
                      prev.filter((i) => i.id !== modalItem.id)
                    );
                    toast.success(`"${modalItem.name}" deleted`);
                    closeModal();
                  } catch (err) {
                    console.error("Failed to delete:", err);
                    toast.error("Failed to delete item.");
                  }
                }}
              >
                Delete
              </button>

              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button className="bton" onClick={closeModal}>
                  Cancel
                </button>
                <button
                  className="bton btn-primary"
                  onClick={() => handleSaveItem(modalItem)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with provider
export default function Inventory() {
  return <InventoryContent />;
}
