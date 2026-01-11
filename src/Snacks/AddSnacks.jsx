import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Navigation from "../component/Navigation";
import "../App.css";
import { useSnacks } from "../context/SnacksContext";
import { toast } from "react-toastify";

function AddSnack() {
  const { fetchSnacks } = useSnacks();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name || !quantity || !price) return alert("All fields are required!");

    if (adding) return; // prevent double click
    setAdding(true);

    try {
      await addDoc(collection(db, "snacks"), {
        name,
        quantity: Number(quantity),
        price: Number(price),
      });
      toast.success("Snack added successfully!");
      setName("");
      setQuantity("");
      setPrice("");
      setAdding(false); // re-enable button

      fetchSnacks();
    } catch (err) {
      toast.error("Error adding snack: ", err);
    }
  };

  return (
    <>
      <Navigation />
      <div>
        <h2 className="page-title">Add Snack</h2>
        <div className="add-snack-form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field"
          />
          <button
            className="add-snack-btn"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? "Adding Snack..." : "Add Snack"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AddSnack;
