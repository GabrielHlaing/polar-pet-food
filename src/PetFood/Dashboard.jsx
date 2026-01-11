import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../component/Navigation";
import { useItems } from "../context/ItemsContext";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const {
    fetching,
    fetchItems,
    fetchHistoryByMonth,
    getSortedAndFilteredItems,
    history,
  } = useItems();

  useEffect(() => {
    fetchItems();
    const now = new Date();
    fetchHistoryByMonth(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const allItems = getSortedAndFilteredItems({});
  const allHistory = history;

  const totalItems = allItems.length;
  const totalQuantity = allItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0
  );

  const salesMap = {};
  allHistory.forEach((invoice) => {
    if (invoice.type !== "sale") return;
    invoice.items.forEach((item) => {
      salesMap[item.code] = (salesMap[item.code] || 0) + Number(item.quantity);
    });
  });

  const topSoldItems = Object.entries(salesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, qty]) => {
      const item = allItems.find((i) => i.code === code);
      return { code, name: item?.name || code, quantity: qty };
    });

  const today = new Date();

  const nearExpiryItems = allItems
    .filter((item) => item.expiryDate && Number(item.quantity) > 0)
    .map((item) => {
      const expiry = new Date(item.expiryDate);
      const diffMonths =
        (expiry.getFullYear() - today.getFullYear()) * 12 +
        (expiry.getMonth() - today.getMonth());
      const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
      return { ...item, diffMonths, diffDays, expiryDateObj: expiry };
    })
    .filter((item) => item.diffMonths <= 2 && item.expiryDateObj > today)
    .sort((a, b) => a.expiryDateObj - b.expiryDateObj);

  const expiredItems = allItems
    .filter((item) => item.expiryDate && Number(item.quantity) > 0)
    .map((item) => ({ ...item, expiryDateObj: new Date(item.expiryDate) }))
    .filter((item) => item.expiryDateObj <= today)
    .sort((a, b) => a.expiryDateObj - b.expiryDateObj);

  const expiringSoonCount = nearExpiryItems.length;

  const formatCurrency = (num) =>
    Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatNum = (num) => (num ? Number(num).toLocaleString("en-US") : 0);

  return (
    <div className="dashboard">
      <Navigation />

      {fetching ? (
        <div className="inner-loading">
          <div className="inner-spinner"></div>
          <p className="loading-text">Loading Items...</p>
        </div>
      ) : (
        <div className="dashboard-container">
          <h2 className="page-title">📊 Dashboard Overview</h2>

          {/* Summary Cards */}
          <div className="dashboard-cards">
            <div
              className="dash-card"
              onClick={() => navigate("/inventory", { replace: true })}
            >
              <h3>Inventory Summary</h3>
              <p>
                Total Items:{" "}
                <span className="card-value">{formatNum(totalItems)}</span>
              </p>
              <p>
                Total Quantity:{" "}
                <span className="card-value">{formatNum(totalQuantity)}</span>
              </p>
              <p>
                Expiring Soon:{" "}
                <span className="card-value">{expiringSoonCount}</span>
              </p>
            </div>

            <div
              className="dash-card"
              onClick={() => navigate("/totals", { replace: true })}
            >
              <h3>Totals</h3>
              <p>
                Total Purchase:{" "}
                <span className="card-value">
                  {formatCurrency(
                    allItems.reduce(
                      (sum, i) =>
                        sum +
                        (Number(i.purchasePrice) || 0) *
                          (Number(i.quantity) || 0),
                      0
                    )
                  )}
                </span>
              </p>
              <p>
                Total Sales:{" "}
                <span className="card-value">
                  {formatCurrency(
                    allItems.reduce(
                      (sum, i) =>
                        sum +
                        (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0),
                      0
                    )
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Top 5 Best-Selling Items */}
          {topSoldItems.length > 0 && (
            <section className="dashboard-section">
              <h3>🔥 Top 5 Best-Selling Items This Month</h3>
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSoldItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.code}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Near Expiry Items */}
          {nearExpiryItems.length > 0 && (
            <section className="dashboard-section">
              <h3>⏳ Items Expiring Soon</h3>
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>Quantity</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearExpiryItems.map((item) => {
                      const colorClass = item.diffDays <= 30 ? "red" : "orange";
                      return (
                        <tr key={item.id} className={colorClass}>
                          <td>{item.name}</td>
                          <td>{item.code}</td>
                          <td>{item.quantity}</td>
                          <td>{item.expiryDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Expired Items */}
          {expiredItems.length > 0 && (
            <section className="dashboard-section">
              <h3>🚫 Expired Items</h3>
              <div className="table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>Quantity</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredItems.map((item) => (
                      <tr key={item.id} className="expired">
                        <td>{item.name}</td>
                        <td>{item.code}</td>
                        <td>{item.quantity}</td>
                        <td>{item.expiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
