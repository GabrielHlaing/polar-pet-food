import { useState, useEffect } from "react";
import Navigation from "../component/Navigation";
import { useItems } from "../context/ItemsContext";

function TotalsContent() {
  const { fetchItems, getSortedAndFilteredItems } = useItems();
  const [nameFilter, setNameFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchItems();
  }, []);

  // Get filtered & sorted items locally from context
  const filteredItems = getSortedAndFilteredItems({
    nameFilter,
    sortField,
    sortOrder,
  });

  const formatNum = (num) => (num ? Number(num).toLocaleString("en-US") : 0);

  // Totals
  const totalPurchase = filteredItems.reduce(
    (sum, item) =>
      sum + (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 0),
    0
  );
  const totalSale = filteredItems.reduce(
    (sum, item) =>
      sum + (Number(item.unitPrice) || 0) * (Number(item.quantity) || 0),
    0
  );
  const totalQty = filteredItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  return (
    <div>
      <Navigation />
      <div className="container totals-container">
        <h2 className="page-title">Totals Overview</h2>

        {/* 🔹 Summary Cards (Top Section) */}
        <div className="totals-summary">
          <div className="summary-card">
            <h4>Total Quantity</h4>
            <p>{formatNum(totalQty)}</p>
          </div>
          <div className="summary-card">
            <h4>Total Purchase Value</h4>
            <p>{formatNum(totalPurchase)}</p>
          </div>
          <div className="summary-card">
            <h4>Total Sales Value</h4>
            <p>{formatNum(totalSale)}</p>
          </div>
        </div>

        {/* 🔹 Filters + Sorting */}
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search Item Name"
            value={nameFilter}
            className="form-input"
            onChange={(e) => setNameFilter(e.target.value)}
          />

          <select
            value={sortField}
            className="form-input"
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="">Sort by</option>
            <option value="unitPrice">Sales Price</option>
            <option value="quantity">Quantity</option>
          </select>

          <select
            value={sortOrder}
            className="form-input"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* 🔹 Table */}
        <div className="table-container">
          <table className="totals-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Item Name</th>
                <th>Purchase Price</th>
                <th>Sales Price</th>
                <th>Quantity</th>
                <th>Total Purchase</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{formatNum(item.purchasePrice)}</td>
                  <td>{formatNum(item.unitPrice)}</td>
                  <td>{formatNum(item.quantity)}</td>
                  <td>
                    {formatNum(
                      (Number(item.purchasePrice) || 0) *
                        (Number(item.quantity) || 0)
                    )}
                  </td>
                  <td>
                    {formatNum(
                      (Number(item.unitPrice) || 0) *
                        (Number(item.quantity) || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Wrap with provider
export default function Totals() {
  return <TotalsContent />;
}
