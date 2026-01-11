import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import Navigation from "../component/Navigation";
import "../App.css";
import { toast } from "react-toastify";

function SalesHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "salesLog"), orderBy("date", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLogs(data);
    } catch (err) {
      toast.error("Error fetching sales history: ", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sales log?")) {
      try {
        await deleteDoc(doc(db, "salesLog", id));
        toast.success("History deleted!");
        fetchLogs(); // refresh logs
      } catch (err) {
        console.error("Error deleting sales log: ", err);
      }
    }
  };

  return (
    <>
      <Navigation />

      {loading ? (
        <div className="inner-loading">
          <div className="inner-spinner"></div>
          <p className="loading-text">Loading sales history...</p>
        </div>
      ) : (
        <>
          {logs.length === 0 ? (
            <div>
              <p>No sales history available.</p>
            </div>
          ) : (
            <div className="sales-history-container">
              <h2 className="page-title">Sales History</h2>
              {logs.map((log) => (
                <div key={log.id} className="sales-log-card">
                  <div className="sales-log-header">
                    <h3>{new Date(log.date).toLocaleString()}</h3>
                    <button
                      className="delete-log-btn"
                      onClick={() => handleDelete(log.id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p>
                    Total Sold Amount:{" "}
                    <strong>{log.totalSoldAmount.toFixed(2)} Ks</strong>
                  </p>
                  <table className="sales-items-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Sold Quantity</th>
                        <th>Price</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {log.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.name}</td>
                          <td>{item.soldQty}</td>
                          <td>{item.price}</td>
                          <td>{(item.soldQty * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default SalesHistory;
