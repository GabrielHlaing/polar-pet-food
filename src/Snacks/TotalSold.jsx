import React, { useState } from "react";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";
import { useSnacks } from "../context/SnacksContext";
import Navigation from "../component/Navigation";
import "../App.css";
import { toast } from "react-toastify";

function TotalSold() {
  const { snacks, fetchSnacks } = useSnacks();
  const [leftover, setLeftover] = useState({});
  const [totalSold, setTotalSold] = useState(null);
  const [calculating, setCalculating] = useState(false);

  if (!snacks.length) return <p>Loading snacks...</p>;

  const handleChange = (id, value) => {
    setLeftover({ ...leftover, [id]: Number(value) });
  };

  const handleCalculate = async () => {
    if (calculating) return; // prevent double click
    setCalculating(true);

    let total = 0;
    const soldItems = [];

    for (let snack of snacks) {
      const leftoverQty = leftover[snack.id] ?? snack.quantity;
      const soldQty = snack.quantity - leftoverQty;
      total += soldQty * snack.price;

      soldItems.push({
        name: snack.name,
        soldQty,
        price: snack.price,
      });

      // Update leftover quantity in Firebase
      const snackRef = doc(db, "snacks", snack.id);
      await updateDoc(snackRef, { quantity: leftoverQty });
    }

    // Save a sales log entry
    await addDoc(collection(db, "salesLog"), {
      date: new Date().toISOString(),
      totalSoldAmount: total,
      items: soldItems,
    });

    // Refresh context
    await fetchSnacks();
    setTotalSold(total);
    setCalculating(false); // re-enable button
    toast.success(
      `Snack quantities updated. Total sold amount: ${total.toFixed(2)} Ks`
    );
  };

  return (
    <>
      <Navigation />
      <div>
        <h2 className="page-title">Total Sold Calculation</h2>
        <div className="total-sold-container">
          <table className="total-sold-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Original Quantity</th>
                <th>Price</th>
                <th>Leftover Quantity</th>
              </tr>
            </thead>
            <tbody>
              {snacks.map((snack) => (
                <tr key={snack.id}>
                  <td>{snack.name}</td>
                  <td>{snack.quantity}</td>
                  <td>{snack.price}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={snack.quantity}
                      value={leftover[snack.id] ?? snack.quantity}
                      onChange={(e) => handleChange(snack.id, e.target.value)}
                      className="leftover-input"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="calculate-btn"
          onClick={handleCalculate}
          disabled={calculating}
        >
          {calculating ? "Calculating..." : "Calculate Total Sold Amount"}
        </button>

        {totalSold !== null && (
          <p className="total-sold-text">
            Total Sold Amount: {totalSold.toFixed(2)} Ks
          </p>
        )}
      </div>
    </>
  );
}

export default TotalSold;
