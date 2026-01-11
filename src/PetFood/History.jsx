import { useEffect, useState } from "react";
import Navigation from "../component/Navigation";
import { useItems } from "../context/ItemsContext";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import "../App.css";
import { toast } from "react-toastify";
import SaveInvoiceButton from "../component/SaveInvoiceButton";
import { FaEdit, FaSave } from "react-icons/fa";

const HistoryContent = () => {
  const {
    history,
    fetchHistoryByMonth,
    fetchAvailableMonths,
    availableMonths,
    fetchItems,
    setItemsFetched,
    setHistoryFetched,
  } = useItems();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [inventoryMap, setInventoryMap] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    setSelectedMonth(currentKey);
    fetchAvailableMonths();
    fetchHistoryByMonth(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setSelectedMonth(value);
    const [year, month] = value.split("-");
    fetchHistoryByMonth(parseInt(year), parseInt(month));
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (deleting) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      const invoiceRef = doc(db, "history", invoiceId);
      const invoiceSnap = await getDoc(invoiceRef);

      if (!invoiceSnap.exists()) {
        toast.error("Invoice not found.");
        return;
      }

      const invoiceData = invoiceSnap.data();

      for (const item of invoiceData.items) {
        const q = query(
          collection(db, "items"),
          where("code", "==", item.code)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const itemDoc = querySnapshot.docs[0];
          const itemRef = doc(db, "items", itemDoc.id);
          const currentData = itemDoc.data();

          let newQuantity = currentData.quantity;

          if (invoiceData.type === "purchase") {
            newQuantity -= Number(item.quantity);
          } else if (invoiceData.type === "sale") {
            newQuantity += Number(item.quantity);
          }

          if (newQuantity < 0) newQuantity = 0;

          await updateDoc(itemRef, { quantity: newQuantity });
        }
      }

      await deleteDoc(invoiceRef);

      setItemsFetched(false);
      setHistoryFetched(false);
      const [year, month] = selectedMonth.split("-");
      await fetchHistoryByMonth(parseInt(year), parseInt(month));
      await fetchItems();

      toast.success("Invoice deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (invoice) => {
    setEditingId(invoice.id);
    setEditData(JSON.parse(JSON.stringify(invoice))); // deep copy
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleFieldChange = (itemIndex, field, value) => {
    setEditData((prev) => {
      const updated = { ...prev };
      updated.items[itemIndex][field] = value;
      return updated;
    });
  };

  const handleSupplierChange = (value) => {
    setEditData((prev) => ({ ...prev, supplier: value }));
  };

  const handleSaveEdit = async () => {
    if (!editData || !editingId) return;
    if (saving) return;

    try {
      setSaving(true);
      const invoiceRef = doc(db, "history", editingId);
      const oldSnap = await getDoc(invoiceRef);
      const oldData = oldSnap.data();

      // 🧩 Build quick lookup maps for old and new quantities by code
      const oldMap = {};
      oldData.items.forEach((it) => (oldMap[it.code] = Number(it.quantity)));
      const newMap = {};
      editData.items.forEach((it) => (newMap[it.code] = Number(it.quantity)));

      // 🧩 Combine all affected item codes (old + new)
      const allCodes = Array.from(
        new Set([...Object.keys(oldMap), ...Object.keys(newMap)])
      );

      // 🔍 Fetch all related item docs in parallel
      const itemDocs = await Promise.all(
        allCodes.map(async (code) => {
          const q = query(collection(db, "items"), where("code", "==", code));
          const querySnapshot = await getDocs(q);
          return querySnapshot.empty ? null : querySnapshot.docs[0];
        })
      );

      const batch = writeBatch(db);

      // ⚙️ For each code, compute quantity delta and apply it
      allCodes.forEach((code, i) => {
        const itemDoc = itemDocs[i];
        if (!itemDoc) return;

        const currentData = itemDoc.data();
        const oldQty = oldMap[code] || 0;
        const newQty = newMap[code] || 0;
        let newQuantity = currentData.quantity;

        // 🧮 Compute difference correctly
        let diff = newQty - oldQty;

        if (editData.type === "purchase") {
          newQuantity += diff; // purchase adds to inventory
        } else if (editData.type === "sale") {
          newQuantity -= diff; // sale removes from inventory
        }

        if (newQuantity < 0) newQuantity = 0;

        batch.update(doc(db, "items", itemDoc.id), { quantity: newQuantity });
      });

      // 🧾 Update invoice
      batch.update(invoiceRef, {
        items: editData.items,
        supplier: editData.supplier || "",
      });

      await batch.commit();

      // ✅ Refresh UI
      setEditingId(null);
      setSaving(false);
      setEditData({});
      setItemsFetched(false);
      setHistoryFetched(false);
      const [year, month] = selectedMonth.split("-");
      await fetchHistoryByMonth(parseInt(year), parseInt(month));
      await fetchItems();

      toast.success("Invoice updated successfully!");
    } catch (err) {
      console.error(err);
      setSaving(false);
      toast.error("Failed to update invoice.");
    }
  };

  const formatCurrency = (num) =>
    Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const groupedByMonth = history.reduce(
    (acc, invoice) => {
      const grandTotal = invoice.items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );

      const invoiceProfit = invoice.profit;
      if (invoice.type === "sale") {
        acc.salesTotal += grandTotal;
        acc.profitTotal += invoiceProfit > 0 ? invoiceProfit : 0;
      } else acc.purchaseTotal += grandTotal;
      acc.invoices.push({ ...invoice, grandTotal });
      return acc;
    },
    { invoices: [], purchaseTotal: 0, salesTotal: 0, profitTotal: 0 }
  );

  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div>
      <Navigation />
      <h2 className="page-title">Transaction History</h2>

      <div className="history-container">
        <div className="month-dropdown-container">
          <label htmlFor="month-select" className="month-label">
            Select Month:
          </label>
          <select
            id="month-select"
            className="month-select"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {availableMonths.map((m) => {
              const [year, month] = m.split("-");
              const label = new Date(year, month - 1).toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                }
              );
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="month-summary">
          <h3>
            {new Date(
              selectedMonth.split("-")[0],
              selectedMonth.split("-")[1] - 1
            ).toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <div className="summary-stats">
            <span className="stat purchase">
              Purchase: {formatCurrency(groupedByMonth.purchaseTotal)} Ks
            </span>
            <span className="stat sale">
              Sale: {formatCurrency(groupedByMonth.salesTotal)} Ks
            </span>
            <span className="stat profit">
              Profit: {formatCurrency(groupedByMonth.profitTotal)} Ks
            </span>
          </div>
        </div>

        <div className="invoice-list">
          {groupedByMonth.invoices.map((invoice) => (
            <div
              key={invoice.id}
              id={invoice.id}
              className={`invoice-card ${
                invoice.type === "sale" ? "sale" : "purchase"
              }`}
            >
              <div className="invoice-actions">
                {editingId === invoice.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="save-edit"
                      disabled={saving}
                    >
                      <FaSave /> {saving ? "Saving..." : "Save"}
                    </button>
                    <button onClick={handleCancelEdit} className="cancel-btn">
                      ✖ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(invoice)}
                      className="edit-btn"
                    >
                      <FaEdit /> Edit
                    </button>
                    <SaveInvoiceButton
                      targetId={`${invoice.id}`}
                      filename={`${invoice.invoice}.png`}
                    />
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="delete-invoice"
                      disabled={deleting}
                    >
                      ✖
                    </button>
                  </>
                )}
              </div>

              <h3>Invoice: {invoice.invoice}</h3>
              <p>
                Date:
                {invoice.fullDate
                  ? new Date(invoice.fullDate)
                      .toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                      .replace(",", "")
                  : invoice.date}
              </p>

              {editingId === invoice.id
                ? invoice.supplier && (
                    <input
                      type="text"
                      value={editData.supplier || ""}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      placeholder="Supplier"
                    />
                  )
                : invoice.supplier && <p>Supplier: {invoice.supplier}</p>}

              {!mobileView ? (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>
                        {invoice.type === "sale"
                          ? "Sales Price"
                          : "Purchase Price"}
                      </th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(editingId === invoice.id
                      ? editData.items
                      : invoice.items
                    ).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.code}</td>
                        <td>{inventoryMap[item.code] || item.name}</td>
                        <td className="center">
                          {editingId === invoice.id ? (
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleFieldChange(
                                  idx,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              style={{ width: "60px" }}
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="right">
                          {editingId === invoice.id ? (
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                handleFieldChange(idx, "price", e.target.value)
                              }
                              style={{ width: "80px" }}
                            />
                          ) : (
                            formatCurrency(item.price)
                          )}
                        </td>
                        <td className="right">
                          {formatCurrency(
                            Number(item.price) * Number(item.quantity)
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="grand-total-row">
                      <td colSpan={4} className="right bold">
                        Grand Total
                      </td>
                      <td className="right bold">
                        {formatCurrency(invoice.grandTotal)} Ks
                      </td>
                    </tr>
                    {invoice.profit !== undefined && invoice.profit > 0 && (
                      <tr className="profit-row">
                        <td colSpan={4} className="right bold blue">
                          Profit
                        </td>
                        <td className="right bold blue">
                          {formatCurrency(invoice.profit)} Ks
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="mobile-history-list">
                  {(editingId === invoice.id
                    ? editData.items
                    : invoice.items
                  ).map((item, idx) => {
                    const cleanName = item.name
                      .replace(/\([^)]*\)/g, "")
                      .trim();
                    return (
                      <div key={idx} className="mobile-item-card">
                        <div className="item-name">{cleanName}</div>
                        <div className="item-row">
                          <span>
                            Quantity:
                            {editingId === invoice.id ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                style={{ width: "60px" }}
                              />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <span>
                            Price:
                            {editingId === invoice.id ? (
                              <input
                                type="number"
                                value={item.price}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "price",
                                    e.target.value
                                  )
                                }
                                style={{ width: "70px" }}
                              />
                            ) : (
                              formatCurrency(item.price)
                            )}
                          </span>
                          <span>
                            Total:
                            {formatCurrency(
                              Number(item.price) * Number(item.quantity)
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="mobile-grand">
                    Grand Total: {formatCurrency(invoice.grandTotal)} Ks
                  </div>
                  <div className="mobile-profit blue">
                    Profit: {formatCurrency(invoice.profit)} Ks
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function History() {
  return <HistoryContent />;
}
