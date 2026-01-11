import { useState } from "react";
import { db } from "../firebase";
import { collection, updateDoc, addDoc, getDocs } from "firebase/firestore";
import { useTransaction } from "../context/TransactionContext";
import { useItems } from "../context/ItemsContext";
import Navigation from "../component/Navigation";
import { toast } from "react-toastify";
import "../App.css";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  const { selectedItems, clearSelection, removeItem } = useTransaction();
  const {
    fetchHistoryByMonth,
    fetchItems,
    setItemsFetched,
    setHistoryFetched,
  } = useItems();
  const navigate = useNavigate();

  const [mode, setMode] = useState("purchase");
  const [invoice, setInvoice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (code, field, value) => {
    const updated = selectedItems.map((item) =>
      item.code === code ? { ...item, [field]: value } : item
    );
    window.dispatchEvent(
      new CustomEvent("updateSelectedItems", { detail: updated })
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    if (!invoice.trim()) {
      toast.error("Invoice number is required.");
      setSubmitting(false);
      return;
    }

    if (mode === "purchase" && !supplier.trim()) {
      toast.error("Supplier name is required for purchases.");
      setSubmitting(false);
      return;
    }

    if (selectedItems.length === 0) {
      toast.info("No items selected.");
      setSubmitting(false);
      return;
    }

    const snapshot = await getDocs(collection(db, "items"));
    const itemsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    const validEntries = [];

    for (const entry of selectedItems) {
      const itemDoc = itemsData.find((i) => i.code === entry.code);
      if (!itemDoc) {
        toast.error(`Item "${entry.name}" not found.`);
        continue;
      }

      const itemRefActual = snapshot.docs.find(
        (d) => d.data().code === entry.code
      )?.ref;
      if (!itemRefActual) continue;

      if (mode === "purchase") {
        const newQty = Number(itemDoc.quantity || 0) + Number(entry.quantity);
        await updateDoc(itemRefActual, {
          purchasePrice: Number(entry.purchasePrice || 0),
          unitPrice: Number(entry.unitPrice || 0),
          quantity: newQty,
          expiryDate: entry.expiryDate || "",
          inventoryDate: date,
        });
      } else {
        const newQty = Number(itemDoc.quantity || 0) - Number(entry.quantity);
        if (newQty < 0) {
          toast.warn(`Not enough stock for "${entry.name}". Skipped.`);
          continue;
        }
        await updateDoc(itemRefActual, { quantity: newQty });
      }

      validEntries.push({
        code: entry.code,
        name: entry.name,
        quantity: Number(entry.quantity),
        price:
          mode === "purchase"
            ? Number(entry.purchasePrice)
            : Number(entry.unitPrice),
      });
    }

    if (validEntries.length === 0) {
      toast.info("No valid entries to submit.");
      setSubmitting(false);
      return;
    }

    // Calculate total profit
    let totalProfit = 0;

    if (mode === "sale") {
      for (const entry of validEntries) {
        // find item in itemsData (already fetched at the top)
        const itemDoc = itemsData.find((i) => i.code === entry.code);
        if (!itemDoc) continue;

        const purchasePrice = Number(itemDoc.purchasePrice || 0);
        const salePrice = Number(entry.price || 0);
        const quantity = Number(entry.quantity || 0);

        const profit = (salePrice - purchasePrice) * quantity;
        totalProfit += profit;
      }
    }

    await addDoc(collection(db, "history"), {
      invoice,
      date,
      fullDate: new Date().toISOString(),
      supplier: mode === "purchase" ? supplier : "",
      type: mode,
      items: validEntries,
      profit: mode === "sale" ? totalProfit : 0,
    });

    const d = new Date(date);
    await fetchHistoryByMonth(d.getFullYear(), d.getMonth() + 1);

    setItemsFetched(false);
    setHistoryFetched(false);
    await fetchItems();

    toast.success("Transactions processed successfully!");
    clearSelection();
    setInvoice("");
    setSupplier("");
    setDate(new Date().toISOString().split("T")[0]);
    setSubmitting(false);

    navigate("/history", { replace: true });
  };

  return (
    <div>
      <Navigation />
      <h2 className="page-title">Transactions</h2>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          onClick={() => setMode("purchase")}
          className={`purchase-sale-btn ${mode === "purchase" ? "active" : ""}`}
        >
          Purchase
        </button>
        <button
          onClick={() => setMode("sale")}
          className={`purchase-sale-btn ${mode === "sale" ? "active" : ""}`}
        >
          Sale
        </button>
      </div>

      {/* Invoice & details */}
      <div className="transaction-form">
        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Invoice No.:</label>
          <input
            type="text"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
          />
        </div>

        {mode === "purchase" && (
          <div className="form-group">
            <label>Supplier Name:</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Selected items */}
      <div className="entries-container">
        {selectedItems.length === 0 ? (
          <p className="no-selection">
            No items selected. Go to Browse page to add items.
          </p>
        ) : (
          selectedItems.map((entry) => (
            <div className="entry-card" key={entry.code}>
              {/* ❌ Delete Button */}
              <button
                className="delete-btn"
                onClick={() => removeItem(entry.code)}
                title="Remove item"
              >
                ✖
              </button>

              <h4>{entry.name}</h4>
              <p>Code: {entry.code}</p>

              {mode === "purchase" && (
                <div className="form-group">
                  <label>Purchase Price:</label>
                  <input
                    type="number"
                    value={entry.purchasePrice || ""}
                    onChange={(e) =>
                      handleChange(entry.code, "purchasePrice", e.target.value)
                    }
                  />
                </div>
              )}

              <div className="form-group">
                <label>Sale Price:</label>
                <input
                  type="number"
                  value={entry.unitPrice || ""}
                  onChange={(e) =>
                    handleChange(entry.code, "unitPrice", e.target.value)
                  }
                />
              </div>

              <div className="form-group qty-group">
                <label>Quantity:</label>
                <input
                  type="number"
                  min={1}
                  value={entry.quantity || ""}
                  onChange={(e) =>
                    handleChange(entry.code, "quantity", e.target.value)
                  }
                />
                {/* 🔵 Show remaining stock */}
                {entry.remaining !== undefined && (
                  <p className="remaining-stock">
                    Remaining stock: {entry.remaining}
                  </p>
                )}
              </div>

              {mode === "purchase" && (
                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input
                    type="date"
                    value={entry.expiryDate || ""}
                    onChange={(e) =>
                      handleChange(entry.code, "expiryDate", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="submit-container">
        <button
          onClick={handleSubmit}
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "✔ Submit All"}
        </button>
      </div>
    </div>
  );
};

export default Transactions;
