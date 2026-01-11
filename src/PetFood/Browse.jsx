// src/PetFood/Browse.js
import { useEffect, useState } from "react";
import { useItems } from "../context/ItemsContext";
import { useTransaction } from "../context/TransactionContext";
import { replace, useNavigate } from "react-router-dom";
import Navigation from "../component/Navigation";
import "../App.css";

const Browse = () => {
  const { fetchItems, getSortedAndFilteredItems, itemsFetched } = useItems();
  const { addItem, removeItem, isItemSelected, selectedItems } =
    useTransaction();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!itemsFetched) fetchItems();
  }, [itemsFetched, fetchItems]);

  const sortedItems = getSortedAndFilteredItems({
    nameFilter: search,
    sortField: "name",
    sortOrder: "asc",
  });

  const handleCheckbox = (item) => {
    if (isItemSelected(item.code)) removeItem(item.code);
    else addItem(item);
  };

  const itemCount = selectedItems.length;

  return (
    <div className="browse-page">
      <Navigation />

      <div className="browse-header">
        <h2 className="page-title">Browse Items</h2>
        <div className="browse-controls">
          <input
            type="text"
            placeholder="🔍 Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="browse-table-container">
        <table className="browse-table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "15px" }}
                >
                  No items found.
                </td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr key={item.code}>
                  <td>{item.brand}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity ?? 0}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={isItemSelected(item.code)}
                      onChange={() => handleCheckbox(item)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating pill (visible only if there’s at least 1 item) */}
      {itemCount > 0 && (
        <div
          className="floating-pill"
          onClick={() => navigate("/transactions", { replace: true })}
        >
          🛒 {itemCount} {itemCount === 1 ? "item" : "items"}
        </div>
      )}
    </div>
  );
};

export default Browse;
