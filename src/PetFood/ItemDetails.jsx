import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";
import "../App.css";
import { useItems } from "../context/ItemsContext";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setItemsFetched } = useItems();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const ref = doc(db, "items", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setItem({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Item not found");
          navigate("/inventory");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleChange = (field, value) => {
    setItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const ref = doc(db, "items", id);

      const updated = {
        name: item.name,
        brand: item.brand,
        code: item.code,
        purchasePrice: Number(item.purchasePrice) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        quantity: Number(item.quantity) || 0,
        inventoryDate: item.inventoryDate || null,
        expiryDate: item.expiryDate || null,
      };

      await updateDoc(ref, updated);
      await setItemsFetched(false);

      toast.success("Item updated");
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update item");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(`Delete "${item.name}" permanently?`);
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "items", id));
      toast.success("Item deleted");
      setItemsFetched(false);
      navigate(-1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div>
        <div className="inner-loading">
          <div className="inner-spinner"></div>
          <p className="loading-text">Loading Item...</p>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div>
      <h2 className="page-title">Item Details</h2>

      <div className="form-container">
        <label className="form-label">
          Brand
          <input
            className="form-input"
            value={item.brand || ""}
            onChange={(e) => handleChange("brand", e.target.value)}
          />
        </label>

        <label className="form-label">
          Item Name
          <input
            className="form-input"
            value={item.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </label>

        <label className="form-label">
          Code
          <input
            className="form-input"
            value={item.code || ""}
            onChange={(e) => handleChange("code", e.target.value)}
          />
        </label>

        <div className="form-row">
          <label className="form-label" style={{ flex: 1 }}>
            Purchase Price
            <input
              type="number"
              className="form-input"
              value={item.purchasePrice || 0}
              onChange={(e) => handleChange("purchasePrice", e.target.value)}
            />
          </label>

          <label className="form-label" style={{ flex: 1 }}>
            Sales Price
            <input
              type="number"
              className="form-input"
              value={item.unitPrice || 0}
              onChange={(e) => handleChange("unitPrice", e.target.value)}
            />
          </label>
        </div>

        <div className="form-row">
          <label className="form-label" style={{ flex: 1 }}>
            Quantity
            <input
              type="number"
              className="form-input"
              value={item.quantity || 0}
              onChange={(e) => handleChange("quantity", e.target.value)}
            />
          </label>

          <label className="form-label" style={{ flex: 1 }}>
            Inventory Date
            <input
              type="date"
              className="form-input"
              value={item.inventoryDate || ""}
              onChange={(e) => handleChange("inventoryDate", e.target.value)}
            />
          </label>
        </div>

        <label className="form-label">
          Expiry Date
          <input
            type="date"
            className="form-input"
            value={item.expiryDate || ""}
            onChange={(e) => handleChange("expiryDate", e.target.value)}
          />
        </label>

        <div className="button-group">
          <button className="bton btn-danger" onClick={handleDelete}>
            Delete
          </button>

          <button className="bton" onClick={() => navigate(-1)}>
            Cancel
          </button>

          <button className="bton btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
