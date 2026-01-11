import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Navigation from "../component/Navigation";
import "../App.css";

function AddItemForm() {
  const [formData, setFormData] = useState({
    brand: "",
    code: "",
    name: "",
    purchasePrice: "",
    unitPrice: "",
    quantity: "",
    inventoryDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (
      !formData.brand ||
      !formData.code ||
      !formData.name ||
      !formData.purchasePrice ||
      !formData.unitPrice ||
      !formData.quantity
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "items"), {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        unitPrice: Number(formData.unitPrice),
        quantity: Number(formData.quantity),
        inventoryDate: formData.inventoryDate,
        expiryDate: formData.expiryDate || null,
        createdAt: serverTimestamp(),
      });
      alert("Item added successfully!");
      setFormData({
        brand: "",
        code: "",
        name: "",
        purchasePrice: "",
        unitPrice: "",
        quantity: "",
        inventoryDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add item.");
    }
  };

  return (
    <div>
      <Navigation />
      <div className="form-container">
        <h2>Add New Item</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label className="form-label">
            Brand: <span className="required">*</span>
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="form-input"
          />
          <label className="form-label">
            Item Code: <span className="required">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="form-input"
          />
          <label className="form-label">
            Item Name: <span className="required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
          />
          <label className="form-label">
            Purchase Price: <span className="required">*</span>
          </label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
          />
          <label className="form-label">
            Sales Price: <span className="required">*</span>
          </label>
          <input
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
          />
          <label className="form-label">
            Quantity: <span className="required">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
          <label className="form-label">Inventory Date:</label>
          <input
            type="date"
            name="inventoryDate"
            value={formData.inventoryDate}
            onChange={handleChange}
            className="form-input"
          />
          <label className="form-label">Expiry Date:</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="form-input"
          />
          <div></div> {/* empty cell for grid alignment */}
          <button type="submit" className="form-button">
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItemForm;
